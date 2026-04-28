/**
 * Drafts Routes — AI draft generation, CRUD, and email sending
 */
const express = require('express');
const router = express.Router();
const { db, dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/logger');
const { createSmtpTransporterFromEnv, getWorkspaceTransporter } = require('../utils/smtp');
const { AUDIT_SUCCESS, AUDIT_ERROR } = require('../config/constants');
const { unifiedTextAIPipeline } = require('../services/aiService');

// POST /api/drafts/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { contact_id, contact_name, contact_email, company, tone = 'professional', customPrompt, job_title } = req.body;
    
    // Tone-specific AI instructions for genuinely different email styles
    const toneGuides = {
      professional: `Write a FORMAL, POLISHED business email. Use proper salutations like "Dear [Name]". 
Keep sentences structured and corporate. Use phrases like "I trust this finds you well", "I'd like to explore potential synergies", "at your earliest convenience". 
Sign off with "Best regards" or "Sincerely". Maintain a respectful, buttoned-up corporate tone throughout. No emojis. No slang.`,
      
      friendly: `Write a WARM, CASUAL, PERSONABLE email like you're writing to a friend you met at a networking event. 
Use first names, contractions ("I'm", "we'd", "let's"), and enthusiastic language. Include phrases like "It was awesome meeting you!", "I'd love to grab coffee", "Let's definitely stay in touch!". 
Use 1-2 emojis sparingly (like 😊 or 🙌). Sign off with "Cheers", "Talk soon", or "Looking forward to hearing from you!". Keep it upbeat and genuine.`,
      
      executive: `Write a CONCISE, HIGH-IMPACT email suitable for C-suite executives. 
Be extremely brief — no more than 4-5 sentences total. Every word must carry weight. Lead with value, not pleasantries. 
Use phrases like "I'll be direct", "The bottom line is", "Here's what I propose". No fluff, no filler. 
Sign off with "Regards" or just your name. This should read like it was written by a busy CEO who respects the reader's time.`,
      
      cold_outreach: `Write a VALUE-DRIVEN cold outreach email to someone you've never met. 
Start with a personalized hook referencing their company or role — NOT "I hope this email finds you well". 
Clearly state the value proposition in the first 2 sentences. Include a specific, low-friction CTA like "Would a 15-min call next week work?". 
Use social proof or a relevant stat. Keep it under 120 words. Sign off casually with "Best" or "Cheers". This should feel like a warm intro, not spam.`
    };

    const selectedToneGuide = toneGuides[tone.toLowerCase()] || toneGuides.professional;

    const systemPrompt = `You are an expert email copywriter specializing in B2B networking and outreach.

TONE INSTRUCTIONS:
${selectedToneGuide}

IMPORTANT RULES:
- The email must feel genuinely human-written, not AI-generated
- Personalize using the contact's name, company, and role
- Do NOT use generic filler like "I came across your profile"
- Make the email feel like it was written specifically for this person
- The subject line must be compelling and match the tone

Return ONLY a valid JSON object with exactly these keys:
"subject": A compelling subject line (max 60 chars)
"body": The complete email body text with proper line breaks`;

    const prompt = customPrompt || `Write an email to ${contact_name || 'this professional'}.
Their role: ${job_title || 'Professional'}
Their company: ${company || 'their organization'}
Context: We recently connected at a networking event and exchanged business cards. I scanned their card using IntelliScan.
My name: ${req.user.name || 'A fellow professional'}
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

    // Persist using cross-database compatible query
    const result = await dbRunAsync(
      'INSERT INTO ai_drafts (user_id, contact_id, contact_name, contact_email, subject, body, tone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, contact_id, contact_name, contact_email, subject, body, tone]
    );

    res.json({ id: result.lastID, subject, body });
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drafts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAllAsync('SELECT * FROM ai_drafts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drafts
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { contact_id, contact_name, subject, body } = req.body;
    const result = await dbRunAsync(
      'INSERT INTO ai_drafts (user_id, contact_id, contact_name, subject, body) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, contact_id, contact_name, subject, body]
    );
    res.status(201).json({ id: result.lastID, message: 'Draft saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    const user = await dbGetAsync('SELECT workspace_id, id FROM users WHERE id = ?', [req.user.id]);
    const scopeWorkspaceId = user?.workspace_id || user?.id;

    const smtp = await getWorkspaceTransporter(scopeWorkspaceId);
    if (!smtp) {
      await dbRunAsync(
        "UPDATE ai_drafts SET status = 'draft' WHERE id = ?",
        [draft.id]
      );
      return res.json({
        success: false,
        sent: false,
        message: 'SMTP not configured. Draft saved. Set up your Communications server in Settings to enable real sending.'
      });
    }

    const fromName = smtp.fromName || process.env.SMTP_FROM_NAME || 'IntelliScan';
    await smtp.transporter.sendMail({
      from: `"${fromName}" <${smtp.from}>`,
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
