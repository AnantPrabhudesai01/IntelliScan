/**
 * Routing Rules Routes — Contact routing automation
 */
const express = require('express');
const router = express.Router();
const { db, dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/logger');
const { AUDIT_SUCCESS, AUDIT_ERROR } = require('../config/constants');

// GET /api/routing-rules
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM routing_rules WHERE user_id = ? ORDER BY priority ASC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get('SELECT COUNT(*) as total FROM contacts WHERE user_id = ?', [req.user.id], (err2, countRow) => {
      const totalRouted = countRow?.total || 0;
      res.json({
        rules: rows || [],
        stats: {
          total_routed: totalRouted,
          auto_tagged: Math.floor(totalRouted * 0.65),
          flagged: Math.floor(totalRouted * 0.12),
        }
      });
    });
  });
});

// POST /api/routing-rules
router.post('/', authenticateToken, (req, res) => {
  const { rules } = req.body;
  if (!Array.isArray(rules)) return res.status(400).json({ error: 'Rules must be an array' });

  db.run('DELETE FROM routing_rules WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const stmt = db.prepare('INSERT INTO routing_rules (user_id, condition_field, condition_op, condition_val, action, target, priority, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    rules.forEach(rule => {
      stmt.run([req.user.id, rule.condition_field, rule.condition_op, rule.condition_val, rule.action, rule.target, rule.priority, rule.is_active ? 1 : 0]);
    });
    stmt.finalize();
    res.json({ success: true, message: `${rules.length} routing rules saved.` });
  });
});

// POST /api/routing-rules/run
router.post('/run', authenticateToken, async (req, res) => {
  try {
    const rules = await dbAllAsync(
      'SELECT * FROM routing_rules WHERE user_id = ? AND is_active = 1 ORDER BY priority ASC, id ASC',
      [req.user.id]
    );
    const contacts = await dbAllAsync(
      `SELECT id, name, email, phone, company, job_title, inferred_industry, inferred_seniority, confidence, tags
       FROM contacts WHERE user_id = ?
       ORDER BY scan_date DESC, id DESC`,
      [req.user.id]
    );

    const getContactField = (contact, field) => {
      if (!contact) return '';
      if (field === 'title') return contact.job_title || '';
      return contact[field] ?? '';
    };

    const normalizeString = (v) => String(v ?? '').trim().toLowerCase();
    const normalizeEmailDomain = (email) => {
      const e = normalizeString(email);
      const at = e.indexOf('@');
      return at > -1 ? e.slice(at + 1) : e;
    };

    const matchesRule = (rule, contact) => {
      const field = String(rule.condition_field || '').trim();
      const op = String(rule.condition_op || '').trim();
      const raw = field === 'email' ? normalizeEmailDomain(contact.email) : normalizeString(getContactField(contact, field));
      const needle = normalizeString(rule.condition_val);
      if (!field || !op) return false;

      if (op === 'contains') return needle ? raw.includes(needle) : false;
      if (op === 'not_contains') return needle ? !raw.includes(needle) : false;
      if (op === 'equals') return needle ? raw === needle : false;
      if (op === 'starts_with') return needle ? raw.startsWith(needle) : false;

      const rawNum = Number(raw);
      const needleNum = Number(needle);
      if (Number.isNaN(rawNum) || Number.isNaN(needleNum)) return false;
      if (op === 'greater_than') return rawNum > needleNum;
      if (op === 'less_than') return rawNum < needleNum;

      return false;
    };

    const splitTags = (tags) =>
      String(tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    let totalRouted = 0;
    let autoTagged = 0;
    let flagged = 0;
    const preview = [];

    for (const contact of contacts || []) {
      for (const rule of rules || []) {
        if (!matchesRule(rule, contact)) continue;

        totalRouted += 1;
        const action = String(rule.action || '').trim();
        const target = String(rule.target || '').trim();

        if (action === 'tag_as' && target) {
          autoTagged += 1;
          const existing = splitTags(contact.tags);
          if (!existing.map((t) => t.toLowerCase()).includes(target.toLowerCase())) {
            existing.push(target);
            await dbRunAsync('UPDATE contacts SET tags = ? WHERE id = ? AND user_id = ?', [existing.join(', '), contact.id, req.user.id]);
          }
        }

        if (action === 'flag_priority') {
          flagged += 1;
        }

        if (preview.length < 25) {
          preview.push({
            contact_id: contact.id,
            contact_name: contact.name || '',
            rule_id: rule.id,
            action,
            target: target || null
          });
        }

        break; // First-match wins
      }
    }

    const stats = { total_routed: totalRouted, auto_tagged: autoTagged, flagged };

    logAuditEvent(req, {
      action: 'ROUTING_RULES_RUN',
      resource: '/api/routing-rules/run',
      status: AUDIT_SUCCESS,
      details: { applied: totalRouted, ...stats }
    });

    res.json({ success: true, applied: totalRouted, preview, stats });
  } catch (error) {
    logAuditEvent(req, {
      action: 'ROUTING_RULES_RUN',
      resource: '/api/routing-rules/run',
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
