/**
 * Marketing Controller — Management of email sequences and automated outreach
 */
const crypto = require('crypto');
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');
const { requireEnterpriseTier } = require('../middleware/auth'); // Check if needed in exports

// GET /api/email-sequences
exports.getSequences = async (req, res) => {
  try {
    const sequences = await dbAllAsync('SELECT * FROM email_sequences WHERE user_id = ?', [req.user.id]);
    res.json(sequences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/email-sequences
exports.createSequence = async (req, res) => {
  const { name, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps)) return res.status(400).json({ error: 'Name and steps array required' });

  try {
    const seq = await dbRunAsync('INSERT INTO email_sequences (user_id, name) VALUES (?, ?)', [req.user.id, name]);
    const sequenceId = seq.lastID;

    for (const step of steps) {
      await dbRunAsync(
        'INSERT INTO email_sequence_steps (sequence_id, order_index, subject, html_body, delay_days) VALUES (?, ?, ?, ?, ?)',
        [sequenceId, step.step_number || step.order_index, step.subject, step.template_body || step.html_body, step.delay_days || 0]
      );
    }

    res.json({ success: true, sequenceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/contacts/:id/enroll-sequence
exports.enrollContact = async (req, res) => {
  const { sequenceId, sequence_id } = req.body;
  const targetId = sequenceId || sequence_id;
  const contactId = req.params.id;

  try {
    const firstStep = await dbGetAsync('SELECT delay_days FROM email_sequence_steps WHERE sequence_id = ? ORDER BY order_index ASC LIMIT 1', [targetId]);
    if (!firstStep) return res.status(400).json({ error: 'Sequence has no steps' });

    const nextSend = new Date();
    nextSend.setDate(nextSend.getDate() + firstStep.delay_days);

    await dbRunAsync(
      'INSERT INTO contact_sequences (contact_id, sequence_id, current_step_index, next_send_at) VALUES (?, ?, ?, ?)',
      [contactId, targetId, 0, nextSend.toISOString()]
    );

    res.json({ success: true, message: 'Contact enrolled in sequence' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Background Sceduler Logic — To be called from a worker or setInterval
 */
exports.processPendingSequences = async () => {
  const now = new Date().toISOString();
  try {
    const pending = await dbAllAsync(`
      SELECT cs.*, c.email as contact_email, c.name as contact_name, s.user_id 
      FROM contact_sequences cs
      JOIN contacts c ON cs.contact_id = c.id
      JOIN email_sequences s ON cs.sequence_id = s.id
      WHERE cs.status = 'active' AND cs.next_send_at <= ?
    `, [now]);

    for (const p of pending) {
      const step = await dbGetAsync(
        'SELECT * FROM email_sequence_steps WHERE sequence_id = ? AND order_index = ?',
        [p.sequence_id, p.current_step_index]
      );

      if (step) {
        const smtp = createSmtpTransporterFromEnv();
        if (smtp) {
          const html = applyTemplateVariables(step.html_body, { name: p.contact_name, email: p.contact_email });
          const subject = applyTemplateVariables(step.subject, { name: p.contact_name });

          await smtp.transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@intelliscan.ai',
            to: p.contact_email,
            subject: subject,
            html: html
          });
        }

        const nextStep = await dbGetAsync(
          'SELECT order_index, delay_days FROM email_sequence_steps WHERE sequence_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1',
          [p.sequence_id, p.current_step_index]
        );

        if (nextStep) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + nextStep.delay_days);
          await dbRunAsync(
            'UPDATE contact_sequences SET current_step_index = ?, next_send_at = ? WHERE id = ?',
            [nextStep.order_index, nextDate.toISOString(), p.id]
          );
        } else {
          await dbRunAsync("UPDATE contact_sequences SET status = 'completed' WHERE id = ?", [p.id]);
        }
      }
    }
  } catch (err) {
    console.error('Sequence Processing Error:', err.message);
  }
};

// --- CAMPAIGN MANAGEMENT ---

// GET /api/email/campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await dbAllAsync(`
      SELECT * FROM email_campaigns 
      WHERE user_id = ? 
      ORDER BY created_at DESC`, [req.user.id]);
    res.json({ success: true, campaigns: campaigns.map(c => ({ ...c, list_ids: JSON.parse(c.list_ids || "[]") })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/email/campaigns
exports.createCampaign = async (req, res) => {
  try {
    const { name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, list_ids } = req.body;
    const result = await dbRunAsync(
      `INSERT INTO email_campaigns (user_id, name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, list_ids, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "draft")`,
      [req.user.id, name, subject, preview_text, from_name, from_email, reply_to, html_body, text_body, template_id, JSON.stringify(list_ids)]
    );
    res.json({ success: true, campaign: { id: result.lastID, ...req.body } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/email/campaigns/:id
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    const analytics = await dbGetAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status="sent" THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN open_count > 0 THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN click_count > 0 THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN status="bounced" THEN 1 ELSE 0 END) as bounced,
        SUM(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 ELSE 0 END) as unsubscribed
      FROM email_sends WHERE campaign_id = ?`, [req.params.id]);

    const recentActivity = await dbAllAsync(`
      SELECT * FROM email_sends WHERE campaign_id = ? ORDER BY sent_at DESC LIMIT 20`, [req.params.id]);

    res.json({ success: true, campaign: { ...campaign, list_ids: JSON.parse(campaign.list_ids || "[]") }, analytics, recent_activity: recentActivity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/email/campaigns/:id/send
exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    await dbRunAsync("UPDATE email_campaigns SET status = 'sending' WHERE id = ?", [req.params.id]);

    // Background execution
    exports.processCampaignSending(req.params.id);

    res.json({ success: true, message: "Campaign sending initiated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper for background sending
exports.processCampaignSending = async (campaignId) => {
  try {
    const campaign = await dbGetAsync("SELECT * FROM email_campaigns WHERE id = ?", [campaignId]);
    if (!campaign || campaign.status === "sent") return;

    const listIds = JSON.parse(campaign.list_ids || "[]");
    if (listIds.length === 0) return;

    const placeholders = listIds.map(() => "?").join(",");
    const contacts = await dbAllAsync(`SELECT DISTINCT email, first_name, last_name, company FROM email_list_contacts WHERE list_id IN (${placeholders}) AND subscribed = 1`, listIds);

    const smtp = createSmtpTransporterFromEnv();
    const serverUrl = process.env.SERVER_URL || "https://intelliscan.vercel.app";

    for (const contact of contacts) {
      const trackingId = crypto.randomBytes(16).toString("hex");
      let html = applyTemplateVariables(campaign.html_body, contact);
      html = html.replace(/{{unsubscribe_link}}/g, `${serverUrl}/api/email/unsubscribe/${trackingId}`);

      // Open tracking pixel
      html += `<img src="${serverUrl}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none"/>`;

      // Simple regex for link tracking
      html = html.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith("http") && !url.includes("unsubscribe")) {
          return `href="${serverUrl}/api/email/track/click/${trackingId}?url=${encodeURIComponent(url)}"`;
        }
        return match;
      });

      await dbRunAsync("INSERT INTO email_sends (campaign_id, email, first_name, tracking_id, status) VALUES (?, ?, ?, ?, ?)", [campaign.id, contact.email, contact.first_name, trackingId, "pending"]);

      if (smtp) {
        try {
          await smtp.transporter.sendMail({
            from: `"${campaign.from_name}" <${campaign.from_email}>`,
            to: contact.email,
            subject: campaign.subject,
            html: html
          });
          await dbRunAsync("UPDATE email_sends SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [trackingId]);
        } catch (mailErr) {
          await dbRunAsync("UPDATE email_sends SET status = 'failed', bounce_reason = ? WHERE tracking_id = ?", [mailErr.message, trackingId]);
        }
      } else {
        // Simulated send
        await new Promise(r => setTimeout(r, 100));
        await dbRunAsync("UPDATE email_sends SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [trackingId]);
      }
    }

    await dbRunAsync("UPDATE email_campaigns SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?", [campaignId]);
  } catch (err) {
    console.error("Campaign sending failed:", err.message);
  }
};

// ── TRACKING & PUBLIC ROUTES ──

exports.trackOpen = async (req, res) => {
  try {
    await dbRunAsync("UPDATE email_sends SET opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP), open_count = open_count + 1 WHERE tracking_id = ?", [req.params.trackingId]);
    const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, { "Content-Type": "image/gif", "Content-Length": pixel.length });
    res.end(pixel);
  } catch (err) {
    res.status(500).end();
  }
};

exports.trackClick = async (req, res) => {
  const { url } = req.query;
  try {
    const send = await dbGetAsync("SELECT id, campaign_id FROM email_sends WHERE tracking_id = ?", [req.params.trackingId]);
    if (send) {
      await dbRunAsync("UPDATE email_sends SET clicked_at = COALESCE(clicked_at, CURRENT_TIMESTAMP), click_count = click_count + 1 WHERE tracking_id = ?", [req.params.trackingId]);
      await dbRunAsync("INSERT INTO email_clicks (send_id, campaign_id, url) VALUES (?, ?, ?)", [send.id, send.campaign_id, url]);
    }
    res.redirect(url || "/");
  } catch (err) {
    res.redirect("/");
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const send = await dbGetAsync("SELECT email FROM email_sends WHERE tracking_id = ?", [req.params.trackingId]);
    if (send) {
      await dbRunAsync("UPDATE email_list_contacts SET subscribed = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?", [send.email]);
      await dbRunAsync("UPDATE email_sends SET unsubscribed_at = CURRENT_TIMESTAMP WHERE tracking_id = ?", [req.params.trackingId]);
    }
    res.send("<html><body><h1>Unsubscribed</h1><p>You have been successfully removed from our mailing list.</p></body></html>");
  } catch (err) {
    res.status(500).send("Unsubscribe failed");
  }
};

// ── ANALYTICS ──

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const overview = await dbGetAsync(`
      SELECT 
        COUNT(id) as total_campaigns,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ?) as total_sent,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ? AND s.open_count > 0) as total_opens
      FROM email_campaigns WHERE user_id = ?`, [req.user.id, req.user.id, req.user.id]);
    res.json({ success: true, stats: overview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── HELPERS ──

/** Template variable substitutions for email campaigns */
function applyTemplateVariables(template, contact) {
  if (!template) return '';
  // Support both snake_case (legacy) and camelCase (new) placeholders
  return String(template)
    .replace(/\{\{firstName\}\}/gi, String(contact?.first_name || contact?.name || 'there').split(/\s+/)[0])
    .replace(/\{\{first_name\}\}/gi, String(contact?.first_name || contact?.name || 'there').split(/\s+/)[0])
    .replace(/\{\{last_name\}\}/gi, String(contact?.last_name || '').split(/\s+/).pop())
    .replace(/\{\{name\}\}/gi, String(contact?.name || contact?.first_name || ''))
    .replace(/\{\{email\}\}/gi, String(contact?.email || ''))
    .replace(/\{\{company\}\}/gi, String(contact?.company || ''))
    .replace(/\{\{title\}\}/gi, String(contact?.job_title || ''))
    .replace(/\{\{industry\}\}/gi, String(contact?.inferred_industry || ''))
    .replace(/\{\{seniority\}\}/gi, String(contact?.inferred_seniority || ''));
}
