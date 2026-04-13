/**
 * Drafts Routes — AI draft generation, CRUD, and email sending
 */
const express = require('express');
const router = express.Router();
const { db, dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/logger');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');
const { AUDIT_SUCCESS, AUDIT_ERROR } = require('../config/constants');
const { unifiedTextAIPipeline } = require('../services/aiService');

// POST /api/drafts/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { contact_id, contact_name, contact_email, company, tone = 'Professional', customPrompt, job_title } = req.body;
    
    const systemPrompt = `You are an expert sales representative. Generate a highly personalized ${tone} outreach email.
Return ONLY a valid JSON object with the following keys:
"subject": A compelling subject line.
"body": The email body text.`;

    const prompt = customPrompt || `Write an email to ${contact_name || 'this person'} from IntelliScan.
Position: ${job_title || 'Lead'}
Company: ${company || 'Unknown'}
Tone: ${tone}`;

    const aiResponse = await unifiedTextAIPipeline({ 
      prompt, 
      systemPrompt, 
      responseFormat: 'json' 
    });

    if (!aiResponse.success) {
      throw new Error(aiResponse.error || 'AI generation failed');
    }

    const { subject, body } = aiResponse.data;

    // Persist immediately so the frontend has an ID for sending
    const draftId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO ai_drafts (user_id, contact_id, contact_name, contact_email, subject, body, tone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, contact_id, contact_name, contact_email, subject, body, tone],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ id: draftId, subject, body });
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drafts
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM ai_drafts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/drafts
router.post('/', authenticateToken, (req, res) => {
  const { contact_id, contact_name, subject, body } = req.body;
  db.run(
    'INSERT INTO ai_drafts (user_id, contact_id, contact_name, subject, body) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, contact_id, contact_name, subject, body],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Draft saved successfully' });
    }
  );
});

// PUT /api/drafts/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const draftId = Number(req.params.id);
    if (!draftId) return res.status(400).json({ error: 'Invalid draft id' });

    const subject = String(req.body?.subject || '').trim();
    const body = String(req.body?.body || '').trim();
    if (!subject || !body) return res.status(400).json({ error: 'subject and body are required' });

    const existing = await dbGetAsync('SELECT id, version FROM ai_drafts WHERE id = ? AND user_id = ?', [draftId, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Draft not found' });

    const nextVersion = Math.max(1, Number(existing.version || 1) + 1);
    await dbRunAsync(
      'UPDATE ai_drafts SET subject = ?, body = ?, version = ? WHERE id = ? AND user_id = ?',
      [subject, body, nextVersion, draftId, req.user.id]
    );

    logAuditEvent(req, {
      action: 'DRAFT_UPDATE',
      resource: `/api/drafts/${draftId}`,
      status: AUDIT_SUCCESS,
      details: { draft_id: draftId, version: nextVersion }
    });

    res.json({ success: true, id: draftId, version: nextVersion });
  } catch (error) {
    logAuditEvent(req, {
      action: 'DRAFT_UPDATE',
      resource: `/api/drafts/${req.params.id}`,
      status: AUDIT_ERROR,
      details: { error: error.message }
    });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drafts/:id/send
router.post('/:id/send', authenticateToken, async (req, res) => {
  try {
    const draft = await dbGetAsync(
      'SELECT * FROM ai_drafts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    if (!draft.contact_email) {
      return res.status(400).json({ error: 'No recipient email on this draft. Please add a contact email first.' });
    }

    const smtp = createSmtpTransporterFromEnv();
    if (!smtp) {
      await dbRunAsync(
        "UPDATE ai_drafts SET status = 'draft' WHERE id = ?",
        [draft.id]
      );
      return res.json({
        success: false,
        sent: false,
        message: 'SMTP not configured. Draft saved. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable real sending.'
      });
    }

    await smtp.transporter.sendMail({
      from: smtp.from,
      to: draft.contact_email,
      subject: draft.subject,
      text: draft.body,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;line-height:1.7;color:#374151">${draft.body.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('')
        }</div>`
    });

    await dbRunAsync(
      "UPDATE ai_drafts SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?",
      [draft.id]
    );

    logAuditEvent(req, {
      action: 'AI_DRAFT_SENT',
      resource: `/api/drafts/${draft.id}/send`,
      status: AUDIT_SUCCESS,
      details: { contact_name: draft.contact_name, to: draft.contact_email }
    });

    res.json({ success: true, sent: true, message: `Email sent to ${draft.contact_email}` });
  } catch (err) {
    console.error('Draft send failed:', err.message);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// PUT /api/drafts/:id/send — Legacy alias
router.put('/:id/send', authenticateToken, (req, res) => {
  db.run("UPDATE ai_drafts SET status = 'sent' WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Draft marked as sent' });
  });
});

// DELETE /api/drafts/:id
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM ai_drafts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Draft deleted' });
  });
});

module.exports = router;
