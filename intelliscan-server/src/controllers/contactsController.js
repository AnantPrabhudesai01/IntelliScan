const { db, dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const XLSX = require('xlsx');

const { logAuditEvent, AUDIT_SUCCESS, AUDIT_DENIED, AUDIT_ERROR } = require('../utils/logger');
const { triggerWebhook } = require('../services/webhookService');
const { generateWithFallback, generateEmbedding, unifiedTextAIPipeline } = require('../services/aiService');
const { uploadToImgbb } = require('../services/imageService');
const { getScopeForUser } = require('../utils/workspaceUtils');
const { getPoliciesForScope, applyPiiPolicyToContactOutput, runRetentionPurgeForScope } = require('../utils/policyUtils');
const { ensureQuotaRow, resolveTierLimits } = require('../utils/quota');
const { normalizeEmail, firstNameFromFullName } = require('../utils/auth');
const { getContactCompletenessScore, selectPrimaryContact, buildFieldMergeSuggestions, buildDedupeSuggestions } = require('../utils/contactUtils');

/**
 * GET /api/contacts
 * Lists contacts for the authenticated user, applying retention policies.
 */
exports.getContacts = async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);

    db.all('SELECT * FROM contacts WHERE user_id = ? AND is_deleted = FALSE ORDER BY scan_date DESC', [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const sanitizedRows = (rows || []).map(row => applyPiiPolicyToContactOutput(row, policies));
      res.setHeader('X-Retention-Purged', `${purge.purged}`);
      res.json(sanitizedRows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/workspace/contacts
 * Lists all contacts within a workspace for shared intelligence.
 */
exports.getWorkspaceContacts = async (req, res) => {
  try {
    const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);

    const sql = workspaceId
      ? `SELECT c.*, u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         WHERE u.workspace_id = ?
         ORDER BY c.scan_date DESC`
      : `SELECT c.*, u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         WHERE c.user_id = ?
         ORDER BY c.scan_date DESC`;
    
    const params = [workspaceId || req.user.id];

    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const sanitizedRows = (rows || []).map(row => applyPiiPolicyToContactOutput(row, policies));
      res.setHeader('X-Retention-Purged', `${purge.purged}`);
      res.json(sanitizedRows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/contacts/stats
 * Fetches basic contact stats for the dashboard.
 */
exports.getStats = async (req, res) => {
  db.get(
    'SELECT COUNT(*) as totalScanned, AVG(confidence) as avgConfidence FROM contacts WHERE user_id = ?',
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        totalScanned: row.totalScanned || 0,
        avgConfidence: row.avgConfidence ? Number(row.avgConfidence).toFixed(1) : 0
      });
    }
  );
};

/**
 * POST /api/contacts
 * Creates a new contact, handles image uploads, and checks quotas.
 */
exports.createContact = async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const input = req.body || {}; // Do not redact on input (WRITE path)

    // Auto-upload base64 images to ImgBB
    try {
      const base64Regex = /^data:image\//;
      if (input.image_url && base64Regex.test(String(input.image_url))) {
        input.image_url = await uploadToImgbb(input.image_url);
      }
      if (input.card_image && base64Regex.test(String(input.card_image))) {
        input.card_image = await uploadToImgbb(input.card_image);
      }
    } catch (err) {
      console.error('[ImgBB Error]', err.message);
    }

    // Quota Enforcement
    const userTierRow = await dbGetAsync('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    const tier = (userTierRow?.tier || 'personal').toLowerCase();
    await ensureQuotaRow(req.user.id, tier);
    
    const quotaRow = await dbGetAsync('SELECT used_count, limit_amount FROM user_quotas WHERE user_id = ?', [req.user.id]);
    if (Number(quotaRow?.used_count || 0) >= Number(quotaRow?.limit_amount || resolveTierLimits(tier).single)) {
      return res.status(403).json({ error: 'Quota exceeded. Please upgrade your plan.' });
    }

    const {
      name, email, phone, company, job_title, title, confidence,
      image_url, card_image, notes, tags, engine_used, event_id,
      inferred_industry, inferred_seniority
    } = input;

    const inserted = await dbRunAsync(
      `INSERT INTO contacts (
        user_id, name, email, phone, company, job_title, confidence,
        image_url, notes, tags, engine_used, event_id,
        inferred_industry, inferred_seniority, workspace_scope, crm_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        req.user.id, name, email || '', phone || '', company || '',
        job_title || title || '', Number(confidence) || 95,
        image_url || card_image || null, notes || '', tags || '',
        engine_used || 'Gemini 1.5 Flash', event_id || null,
        inferred_industry || null, inferred_seniority || null, scopeWorkspaceId
      ]
    );

    const contactId = inserted.lastID;
    await dbRunAsync('UPDATE user_quotas SET used_count = used_count + 1 WHERE user_id = ?', [req.user.id]);

    // Background: AI Embedding
    (async () => {
      const searchText = `${name} ${company} ${job_title} ${notes}`.trim();
      if (searchText) {
        const vector = await generateEmbedding(searchText);
        if (vector) await dbRunAsync('UPDATE contacts SET search_vector = ? WHERE id = ?', [JSON.stringify(vector), contactId]);
      }
    })();

    res.status(201).json({ success: true, contact_id: contactId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/contacts/:id
 * Soft deletes a contact (moves to Recycle Bin).
 */
exports.deleteContact = async (req, res) => {
  try {
    const result = await dbRunAsync(
      'UPDATE contacts SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', 
      [req.params.id, req.user.id]
    );
    
    logAuditEvent(req, { 
      action: 'CONTACT_SOFT_DELETE', 
      resource: `/api/contacts/${req.params.id}`, 
      status: result.changes > 0 ? AUDIT_SUCCESS : AUDIT_DENIED,
      details: { rows_affected: result.changes }
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found or not owned by user' });
    }

    res.json({ success: true, message: 'Contact moved to Recycle Bin', rowsAffected: result.changes });
  } catch (err) {
    logAuditEvent(req, { action: 'CONTACT_SOFT_DELETE', resource: `/api/contacts/${req.params.id}`, status: AUDIT_ERROR, details: { error: err.message } });
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/contacts/bulk
 * Mass soft deletes contacts.
 */
exports.bulkDeleteContacts = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No contact IDs provided' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const result = await dbRunAsync(
      `UPDATE contacts SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) AND user_id = ?`, 
      [...ids, req.user.id]
    );
    
    logAuditEvent(req, { 
      action: 'CONTACT_BULK_SOFT_DELETE', 
      resource: '/api/contacts/bulk', 
      status: AUDIT_SUCCESS,
      details: { ids_requested: ids.length, rows_affected: result.changes }
    });

    res.json({ success: true, message: `${result.changes} contacts moved to Recycle Bin`, rowsAffected: result.changes });
  } catch (err) {
    logAuditEvent(req, { action: 'CONTACT_BULK_SOFT_DELETE', resource: '/api/contacts/bulk', status: AUDIT_ERROR, details: { error: err.message } });
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/contacts/trash
 * Lists all soft-deleted contacts.
 */
exports.getDeletedContacts = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const rows = await dbAllAsync('SELECT * FROM contacts WHERE user_id = ? AND is_deleted = TRUE ORDER BY deleted_at DESC', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('[Trash Error] Failed to fetch deleted contacts:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/contacts/restore
 * Restores one or more contacts from the Recycle Bin.
 */
exports.restoreContacts = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No contact IDs provided' });
  }

  try {
    const userId = Number(req.user.id);
    const numericIds = ids.map(id => Number(id));
    const placeholders = numericIds.map(() => '?').join(',');
    
    const result = await dbRunAsync(
      `UPDATE contacts SET is_deleted = FALSE, deleted_at = NULL WHERE id IN (${placeholders}) AND user_id = ?`, 
      [...numericIds, userId]
    );
    
    logAuditEvent(req, { 
      action: 'CONTACT_RESTORE', 
      resource: '/api/contacts/restore', 
      status: AUDIT_SUCCESS,
      details: { ids_requested: numericIds.length, rows_affected: result.changes }
    });

    res.json({ success: true, message: `${result.changes} contacts restored`, rowsAffected: result.changes });
  } catch (err) {
    console.error('[Trash Error] Failed to restore contacts:', err.message);
    logAuditEvent(req, { action: 'CONTACT_RESTORE', resource: '/api/contacts/restore', status: AUDIT_ERROR, details: { error: err.message } });
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/contacts/trash/empty
 * Permanently deletes all items in the Recycle Bin for the user.
 */
exports.emptyTrash = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const result = await dbRunAsync('DELETE FROM contacts WHERE user_id = ? AND is_deleted = TRUE', [userId]);
    
    logAuditEvent(req, { 
      action: 'CONTACT_TRASH_EMPTY', 
      resource: '/api/contacts/trash/empty', 
      status: AUDIT_SUCCESS,
      details: { rows_affected: result.changes }
    });

    res.json({ success: true, message: 'Recycle Bin emptied', rowsAffected: result.changes });
  } catch (err) {
    console.error('[Trash Error] Failed to empty trash:', err.message);
    logAuditEvent(req, { action: 'CONTACT_TRASH_EMPTY', resource: '/api/contacts/trash/empty', status: AUDIT_ERROR, details: { error: err.message } });
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/contacts/trash
 * Selective permanent delete from Recycle Bin.
 */
exports.permanentlyDeleteContacts = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No contact IDs provided' });
  }

  try {
    const userId = Number(req.user.id);
    const numericIds = ids.map(id => Number(id));
    const placeholders = numericIds.map(() => '?').join(',');
    
    const result = await dbRunAsync(
      `DELETE FROM contacts WHERE id IN (${placeholders}) AND user_id = ? AND is_deleted = TRUE`, 
      [...numericIds, userId]
    );
    
    logAuditEvent(req, { 
      action: 'CONTACT_PERMANENT_DELETE', 
      resource: '/api/contacts/trash', 
      status: AUDIT_SUCCESS,
      details: { ids_requested: numericIds.length, rows_affected: result.changes }
    });

    res.json({ success: true, message: `${result.changes} contacts permanently deleted`, rowsAffected: result.changes });
  } catch (err) {
    console.error('[Trash Error] Permanent delete failed:', err.message);
    logAuditEvent(req, { action: 'CONTACT_PERMANENT_DELETE', resource: '/api/contacts/trash', status: AUDIT_ERROR, details: { error: err.message } });
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/contacts/:id/deal
 */
exports.updateDeal = async (req, res) => {
  const { stage, value, notes, expected_close } = req.body;
  const contactId = req.params.id;

  try {
    const workspaceId = await exports._getWorkspaceId(req.user.id);
    await dbRunAsync(`
      INSERT INTO deals (contact_id, user_id, workspace_id, stage, value, notes, expected_close, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(contact_id) DO UPDATE SET
        stage = excluded.stage, value = excluded.value, notes = excluded.notes,
        expected_close = excluded.expected_close, updated_at = CURRENT_TIMESTAMP
    `, [contactId, req.user.id, workspaceId, stage, value || 0, notes || '', expected_close || null]);

    await dbRunAsync('UPDATE contacts SET deal_status = ? WHERE id = ?', [stage, contactId]);
    triggerWebhook(workspaceId, 'on_deal_update', { contactId, stage, value });

    res.json({ success: true, message: 'Deal updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Workspace-level analytics for the Enterprise dashboard.
 * GET /api/workspace/analytics
 */
exports.getWorkspaceAnalytics = async (req, res) => {
  try {
    const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await getPoliciesForScope(scopeWorkspaceId);
    const purge = await runRetentionPurgeForScope(scopeWorkspaceId, policies.retention_days);

    const scope = workspaceId
      ? { where: 'u.workspace_id = ?', params: [workspaceId] }
      : { where: 'c.user_id = ?', params: [req.user.id] };

    const totals = await dbGetAsync(
      `SELECT
         COUNT(*) as total_scans,
         AVG(COALESCE(c.confidence, 0)) as avg_confidence,
         SUM(CASE WHEN c.email IS NOT NULL AND TRIM(c.email) <> '' THEN 1 ELSE 0 END) as leads_generated
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE ${scope.where}`,
      scope.params
    );

    const membersRow = workspaceId
      ? await dbGetAsync('SELECT COUNT(*) as count FROM users WHERE workspace_id = ?', [workspaceId])
      : { count: 1 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start30 = new Date(today);
    start30.setDate(start30.getDate() - 29);
    const start60 = new Date(today);
    start60.setDate(start60.getDate() - 59);

    const currentWindow = await dbGetAsync(
      `SELECT COUNT(*) as count FROM contacts c JOIN users u ON c.user_id = u.id WHERE ${scope.where} AND c.scan_date >= ?`,
      [...scope.params, start30.toISOString()]
    );

    const previousWindow = await dbGetAsync(
      `SELECT COUNT(*) as count FROM contacts c JOIN users u ON c.user_id = u.id WHERE ${scope.where} AND c.scan_date >= ? AND c.scan_date < ?`,
      [...scope.params, start60.toISOString(), start30.toISOString()]
    );

    const currCount = Number(currentWindow?.count || 0);
    const prevCount = Number(previousWindow?.count || 0);
    const growthPct = prevCount === 0 ? (currCount > 0 ? 100 : 0) : Math.round(((currCount - prevCount) / prevCount) * 100);

    const dayRows = await dbAllAsync(
      `SELECT date(c.scan_date) as day, COUNT(*) as count FROM contacts c JOIN users u ON c.user_id = u.id WHERE ${scope.where} AND c.scan_date >= ? GROUP BY date(c.scan_date) ORDER BY day ASC`,
      [...scope.params, start30.toISOString()]
    );

    const dayMap = new Map((dayRows || []).map((r) => [String(r.day), Number(r.count || 0)]));
    const scanByDay = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start30);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return dayMap.get(key) || 0;
    });

    const engineRows = await dbAllAsync(
      `SELECT COALESCE(NULLIF(TRIM(c.engine_used), ''), 'Unknown') as name, COUNT(*) as count FROM contacts c JOIN users u ON c.user_id = u.id WHERE ${scope.where} GROUP BY name ORDER BY count DESC LIMIT 3`,
      scope.params
    );

    const totalScans = Number(totals?.total_scans || 0);
    const engineBreakdown = (engineRows || []).map((row) => {
      const count = Number(row.count || 0);
      const pct = totalScans > 0 ? Number(((count / totalScans) * 100).toFixed(1)) : 0;
      return { name: row.name, count, pct };
    });

    const recentActivity = await dbAllAsync(
      `SELECT c.id, c.name, c.company, c.job_title, c.confidence, c.scan_date, u.name as scanner_name FROM contacts c JOIN users u ON c.user_id = u.id WHERE ${scope.where} ORDER BY c.scan_date DESC, c.id DESC LIMIT 15`,
      scope.params
    );

    res.setHeader('X-Retention-Purged', `${purge.purged}`);
    res.json({
      total_scans: totalScans,
      growth_pct: growthPct,
      avg_confidence: totalScans > 0 ? Number((Number(totals?.avg_confidence || 0)).toFixed(1)) : 0,
      active_members: Math.max(1, Number(membersRow?.count || 1)),
      leads_generated: Number(totals?.leads_generated || 0),
      scan_by_day: scanByDay,
      engine_breakdown: engineBreakdown,
      recent_activity: recentActivity || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Duplicate-outreach protection feed.
 * GET /api/workspace/contacts/duplicates
 */
exports.getDuplicates = async (req, res) => {
  try {
    const { workspaceId, scopeWorkspaceId } = await getScopeForUser(req.user.id);
    
    // Fetch all contacts in scope
    const sql = workspaceId
      ? `SELECT * FROM contacts WHERE user_id IN (SELECT id FROM users WHERE workspace_id = ?)`
      : `SELECT * FROM contacts WHERE user_id = ?`;
    const params = [workspaceId || req.user.id];
    
    const contacts = await dbAllAsync(sql, params);
    
    // Use utility to find duplicates
    const suggestions = buildDedupeSuggestions(contacts);
    
    // Handle persistent queue in DB (Data Quality Dedupe Queue)
    for (const suggestion of suggestions) {
      await dbRunAsync(
        `INSERT INTO data_quality_dedupe_queue 
        (workspace_id, fingerprint, contact_ids_json, primary_contact_id, reason, confidence, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending') ON CONFLICT (workspace_id, fingerprint) DO UPDATE SET
        contact_ids_json = excluded.contact_ids_json,
        primary_contact_id = excluded.primary_contact_id,
        reason = excluded.reason,
        confidence = excluded.confidence,
        updated_at = CURRENT_TIMESTAMP`,
        [
          scopeWorkspaceId,
          suggestion.fingerprint,
          JSON.stringify(suggestion.contact_ids),
          suggestion.primary_contact_id,
          suggestion.reason,
          suggestion.confidence
        ]
      );
    }

    res.json({ success: true, duplicates: suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Relationships Management
 */
exports.establishRelationship = async (req, res) => {
  const { from_id, to_id, type } = req.body;
  if (!from_id || !to_id || !type) return res.status(400).json({ error: 'Missing required fields' });
  try {
    await dbRunAsync('INSERT INTO contact_relationships (from_contact_id, to_contact_id, type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING', [from_id, to_id, type]);
    res.json({ success: true, message: 'Relationship established.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRelationships = async (req, res) => {
  try {
    const rows = await dbAllAsync(`
      SELECT r.*, c.name as target_name, c.job_title as target_title 
      FROM contact_relationships r
      JOIN contacts c ON r.to_contact_id = c.id
      WHERE r.from_contact_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Enterprise Org Chart logic.
 * GET /api/org-chart/:company
 */
exports.getOrgChart = async (req, res) => {
  const companyName = req.params.company;
  try {
    const workspaceId = await exports._getWorkspaceId(req.user.id);
    const sql = workspaceId
      ? `SELECT id, name, job_title, company, email FROM contacts WHERE company LIKE ? AND user_id IN (SELECT id FROM users WHERE workspace_id = ?)`
      : `SELECT id, name, job_title, company, email FROM contacts WHERE company LIKE ? AND user_id = ?`;

    const params = workspaceId ? [`%${companyName}%`, workspaceId] : [`%${companyName}%`, req.user.id];
    const contacts = await dbAllAsync(sql, params);

    const levels = {
      'C-Suite': ['ceo', 'cto', 'cfo', 'coo', 'vp', 'founder', 'president', 'partner', 'md', 'chief'],
      'Management': ['director', 'manager', 'head', 'lead', 'senior manager', 'principal', 'supervisor']
    };

    const nodes = contacts.map(c => {
      const title = (c.job_title || '').toLowerCase();
      let level = 'Individual';
      if (levels['C-Suite'].some(k => title.includes(k))) level = 'C-Suite';
      else if (levels['Management'].some(k => title.includes(k))) level = 'Management';
      return { ...c, level };
    });

    res.json({ company: companyName, nodes: nodes.sort((a,b) => (a.level === 'C-Suite' ? -1 : 1)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/contacts/:id/enrich
 * Uses AI to research and enrich contact data.
 */
exports.enrichContact = async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await dbGetAsync('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const prompt = `As a professional AI research assistant, research and provide a detailed professional profile for:
Name: ${contact.name}
Company: ${contact.company}
Job Title: ${contact.job_title}
Current Email: ${contact.email || 'None on file'}
Current Phone: ${contact.phone || 'None on file'}

If the email or phone is 'None on file', please attempt to find the official professional email/phone for this person.
Provide JSON: { "bio": "...", "latest_news": "...", "industry": "...", "seniority": "...", "found_email": "...", "found_phone": "..." }`;

    const aiResult = await unifiedTextAIPipeline({ prompt, responseFormat: 'json' });
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI enrichment failed');
    }

    const json = aiResult.data;

    // Use current values as fallback if AI didn't find new ones
    const newEmail = contact.email || json.found_email || '';
    const newPhone = contact.phone || json.found_phone || '';

    await dbRunAsync(
      `UPDATE contacts 
       SET linkedin_bio = ?, ai_enrichment_news = ?, inferred_industry = ?, inferred_seniority = ?, 
           email = ?, phone = ? 
       WHERE id = ?`,
      [
        json.bio || '', 
        json.latest_news || '', 
        json.industry || '', 
        json.seniority || '', 
        newEmail, 
        newPhone, 
        contactId
      ]
    );

    res.json({ success: true, data: { ...json, email: newEmail, phone: newPhone } });
  } catch (err) {
    console.error('[Enrichment Error]', err.message);
    res.status(500).json({ error: 'Failed to enrich contact', details: err.message });
  }
};

/**
 * Natural language search for contacts using vector embeddings.
 * GET /api/contacts/semantic-search
 */
exports.semanticSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query "q" is required' });

  try {
    // 1. Generate embedding for query
    const queryVector = await generateEmbedding(q);
    if (!queryVector) return res.status(503).json({ error: 'Embedding engine unavailable' });

    // 2. Fetch all contacts with vectors for this user
    const contacts = await dbAllAsync('SELECT * FROM contacts WHERE user_id = ? AND search_vector IS NOT NULL', [req.user.id]);

    // 3. Rank by similarity
    const results = contacts
      .map(c => {
        try {
          const contactVector = JSON.parse(c.search_vector);
          const score = exports._cosineSimilarity(queryVector, contactVector);
          return { ...c, similarity_score: score };
        } catch (e) {
          return { ...c, similarity_score: 0 };
        }
      })
      .filter(c => c.similarity_score > 0.6) // Threshold for relevance
      .sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({ success: true, results: results.slice(0, 10) }); // Top 10 matches
  } catch (err) {
    console.error('Semantic Search Error:', err);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
};

/**
 * Internal helper for cosine similarity calculation
 */
exports._cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
};

// ── INTERNAL HELPERS ──

exports._getWorkspaceId = async (userId) => {
  const row = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [userId]);
  return row?.workspace_id || userId;
};

/**
 * Manually trigger a follow-up email
 */
exports.sendFollowup = async (req, res) => {
  try {
    const { sendFollowupEmail } = require('../services/emailService');
    const contactId = req.params.id;
    const contact = await dbGetAsync('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);

    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    if (!contact.email) return res.status(400).json({ error: 'No email address found for this contact' });

    await sendFollowupEmail(contact);
    res.json({ success: true, message: 'Follow-up email sent!' });
  } catch (error) {
    console.error('[SendFollowup Error]', error);
    res.status(500).json({ error: 'Failed to send follow-up email' });
  }
};

/**
 * Generates a perfectly formatted Excel sheet of all contacts for the user.
 * GET /api/contacts/export/magic
 */
exports.exportContactsToExcel = async (req, res) => {
  try {
    let userId = req.user?.id;

    // Handle Token from WhatsApp link
    if (!userId && req.query.token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
        if (decoded.purpose === 'magic_export') {
          userId = decoded.id;
        }
      } catch (e) {
        return res.status(401).json({ error: 'Export link expired or invalid' });
      }
    }

    if (!userId) return res.status(401).json({ error: 'Identification required' });


    const contacts = await dbAllAsync('SELECT * FROM contacts WHERE user_id = ? AND is_deleted = FALSE ORDER BY scan_date DESC', [userId]);

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'No contacts found to export' });
    }

    // Format data for Excel
    const data = contacts.map(c => ({
      'Full Name': c.name || 'Unknown',
      'Company': c.company || '—',
      'Job Title': c.job_title || '—',
      'Email': c.email || '—',
      'Phone': c.phone || '—',
      'Industry': c.inferred_industry || '—',
      'Seniority': c.inferred_seniority || '—',
      'Confidence': `${c.confidence || 0}%`,
      'Location': c.location_context || '—',
      'Date Scanned': c.scan_date ? new Date(c.scan_date).toLocaleString() : '—',
      'Notes': c.notes || ''
    }));

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IntelliScan Contacts");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    const filename = `IntelliScan_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);

    logAuditEvent(req, 'EXPORT_EXCEL', AUDIT_SUCCESS, { count: contacts.length });
  } catch (err) {
    console.error('[Export Error]', err);
    res.status(500).json({ error: 'Failed to generate Excel export' });
  }
};

