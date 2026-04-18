const crypto = require('crypto');
const { dbGetAsync, dbAllAsync, dbRunAsync, isPostgres } = require('../utils/db');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');
const { unifiedTextAIPipeline } = require('../services/aiService');

// GET /api/email-sequences/sequences
exports.getSequences = async (req, res) => {
  try {
    const sequences = await dbAllAsync('SELECT * FROM email_sequences WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(sequences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/email-sequences/sequences
exports.createSequence = async (req, res) => {
  const { name, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps)) return res.status(400).json({ error: 'Name and steps array required' });

  try {
    const seq = await dbRunAsync('INSERT INTO email_sequences (user_id, name) VALUES (?, ?)', [req.user.id, name]);
    const sequenceId = seq.lastID;

    for (const step of steps) {
      await dbRunAsync(
        'INSERT INTO email_sequence_steps (sequence_id, order_index, subject, html_body, ai_intent, ai_model, delay_days) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sequenceId, step.step_number || step.order_index, step.subject, step.template_body || step.html_body, step.ai_intent || null, step.ai_model || 'gemini', step.delay_days || 0]
      );
    }

    res.json({ success: true, sequenceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/email-sequences/sequences/:id
exports.getSequenceById = async (req, res) => {
  try {
    const sequence = await dbGetAsync('SELECT * FROM email_sequences WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!sequence) return res.status(404).json({ error: 'Sequence not found' });

    const steps = await dbAllAsync('SELECT * FROM email_sequence_steps WHERE sequence_id = ? ORDER BY order_index ASC', [req.params.id]);
    const enrollments = await dbAllAsync(`
      SELECT cs.*, c.name as contact_name, c.email as contact_email 
      FROM contact_sequences cs
      JOIN contacts c ON cs.contact_id = c.id
      WHERE cs.sequence_id = ? AND cs.status = 'active'
    `, [req.params.id]);

    res.json({ sequence, steps, enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/email-sequences/sequences/:id
exports.updateSequence = async (req, res) => {
  const { name, steps } = req.body;
  try {
    const sequence = await dbGetAsync('SELECT id FROM email_sequences WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!sequence) return res.status(404).json({ error: 'Sequence not found' });

    if (name) {
      const timestamp = new Date().toISOString();
      await dbRunAsync(isPostgres ? 'UPDATE email_sequences SET name = ?, updated_at = NOW() WHERE id = ?' : 'UPDATE email_sequences SET name = ?, updated_at = ? WHERE id = ?', isPostgres ? [name, req.params.id] : [name, timestamp, req.params.id]);
    }

    if (steps && Array.isArray(steps)) {
      // Simple strategy: Clear and re-insert steps
      await dbRunAsync('DELETE FROM email_sequence_steps WHERE sequence_id = ?', [req.params.id]);
      for (const step of steps) {
        await dbRunAsync(
          'INSERT INTO email_sequence_steps (sequence_id, order_index, subject, html_body, ai_intent, ai_model, delay_days) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.params.id, step.order_index, step.subject, step.html_body, step.ai_intent, step.ai_model || 'gemini', step.delay_days || 0]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/email-sequences/enroll
exports.enrollContact = async (req, res) => {
  const { sequenceId, contactId: bodyContactId } = req.body;
  const contactId = req.params.id || bodyContactId;
  
  if (!sequenceId || !contactId) return res.status(400).json({ error: 'sequenceId and contactId are required' });

  try {
    const firstStep = await dbGetAsync('SELECT delay_days FROM email_sequence_steps WHERE sequence_id = ? ORDER BY order_index ASC LIMIT 1', [sequenceId]);
    if (!firstStep) return res.status(400).json({ error: 'Sequence has no steps' });

    // Check if contact is already enrolled in this sequence
    const existing = await dbGetAsync('SELECT id FROM contact_sequences WHERE contact_id = ? AND sequence_id = ? AND status = ?', [contactId, sequenceId, 'active']);
    if (existing) return res.status(409).json({ error: 'Contact is already actively enrolled in this sequence.' });

    const nextSend = new Date();
    nextSend.setDate(nextSend.getDate() + (firstStep.delay_days || 0));

    await dbRunAsync(
      'INSERT INTO contact_sequences (contact_id, sequence_id, current_step_index, next_send_at, status) VALUES (?, ?, ?, ?, ?)',
      [contactId, sequenceId, 0, nextSend.toISOString(), 'active']
    );

    res.json({ success: true, message: 'Contact successfully enrolled.', nextSendAt: nextSend.toISOString() });
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
      SELECT cs.*, c.email as contact_email, c.name as contact_name, c.company as contact_company, 
             c.job_title as contact_job_title, c.inferred_industry as contact_industry, s.user_id 
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
        console.log(`[Marketing] Sending Step ${p.current_step_index + 1} to ${p.contact_email}`);
        
        const smtp = createSmtpTransporterFromEnv();
        const vars = { 
          name: p.contact_name, 
          email: p.contact_email, 
          company: p.contact_company,
          job_title: p.contact_job_title,
          industry: p.contact_industry
        };

        let html = applyTemplateVariables(step.html_body, vars);
        let subject = applyTemplateVariables(step.subject, vars);

        // ADVANCED: AI Personalization Upgrade (Multi-Model Support)
        if (step.ai_intent) {
          try {
            const aiPrompt = `Write a professional, context-aware email for a networking sequence.
Contact: ${p.contact_name}
Company: ${p.contact_company}
Job Title: ${p.contact_job_title || 'N/A'}
Industry: ${p.contact_industry || 'N/A'}

Intent / Instruction: ${step.ai_intent}
Base Template: ${step.html_body}

[CRITICAL]
- Ensure the tone is professional but natural.
- Use the provided context to make it feel personalized.
- Return ONLY the JSON body:
{
  "personalized_subject": "...",
  "personalized_body": "..."
}`;
            const aiRes = await unifiedTextAIPipeline({ 
              prompt: aiPrompt, 
              responseFormat: 'json',
              model: step.ai_model || 'gemini' 
            });
            if (aiRes.success && aiRes.data.personalized_body) {
              html = aiRes.data.personalized_body;
              subject = aiRes.data.personalized_subject || subject;
              console.log(`[Marketing] Model ${step.ai_model || 'Gemini'} personalized step for ${p.contact_email}`);
            }
          } catch (aiErr) {
            console.error('[Marketing] AI Personalization failed, falling back to template:', aiErr.message);
          }
        }

        if (smtp) {
          try {
            await smtp.transporter.sendMail({
              from: process.env.SMTP_FROM || `"IntelliScan AI" <${process.env.SMTP_USER}>`,
              to: p.contact_email,
              subject: subject,
              html: html
            });
            console.log(`[Marketing] Step sent successfully to ${p.contact_email}`);
          } catch (mailErr) {
            console.error(`[Marketing] Mail delivery failed for ${p.contact_email}:`, mailErr.message);
          }
        } else {
          console.warn(`[Marketing][MOCK] SMTP not configured. Mocking send to ${p.contact_email}`);
        }

        // Determine next step
        const allSteps = await dbAllAsync(
          'SELECT order_index, delay_days FROM email_sequence_steps WHERE sequence_id = ? ORDER BY order_index ASC',
          [p.sequence_id]
        );
        
        const nextStep = allSteps.find(s => s.order_index > p.current_step_index);

        if (nextStep) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + (nextStep.delay_days || 0));
          await dbRunAsync(
            'UPDATE contact_sequences SET current_step_index = ?, next_send_at = ?, updated_at = NOW() WHERE id = ?',
            [nextStep.order_index, nextDate.toISOString(), p.id]
          );
          console.log(`[Marketing] Sequence scheduled for Step ${nextStep.order_index + 1} at ${nextDate.toISOString()}`);
        } else {
          await dbRunAsync("UPDATE contact_sequences SET status = 'completed', updated_at = NOW() WHERE id = ?", [p.id]);
          console.log(`[Marketing] Sequence completed for ${p.contact_email}`);
        }
      }
    }
  } catch (err) {
    console.error('[Marketing] Critical Sequence Processing Error:', err.message);
  }
};

/**
 * Initialize background workers for marketing tasks.
 */
exports.initWorkers = () => {
  console.log('[Marketing] Worker initialized: Automation polling active.');
  // Process pending sequences every 2 minutes for production efficiency
  setInterval(() => {
    exports.processPendingSequences();
  }, 120000);
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
    const userId = req.user.id;
    // Improved overview: accounts for total volume across all outreach types
    const overview = await dbGetAsync(`
      SELECT 
        (SELECT COUNT(*) FROM email_campaigns WHERE user_id = ?) as total_campaigns,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ?) as total_sent,
        (SELECT COUNT(*) FROM email_sends s JOIN email_campaigns c ON s.campaign_id = c.id WHERE c.user_id = ? AND s.open_count > 0) as total_opens
    `, [userId, userId, userId]);
    
    res.json({ success: true, stats: overview || { total_campaigns: 0, total_sent: 0, total_opens: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- LIST MANAGEMENT ---

// GET /api/email/lists
exports.getLists = async (req, res) => {
  try {
    const lists = await dbAllAsync(`
      SELECT l.*, (SELECT COUNT(*) FROM email_list_contacts WHERE list_id = l.id) as contact_count 
      FROM email_lists l 
      WHERE l.user_id = ? 
      ORDER BY l.created_at DESC`, [req.user.id]);
    
    // Auto-seed a default list if none exist for a smoother UX
    if (lists.length === 0) {
      const result = await dbRunAsync("INSERT INTO email_lists (user_id, name, description) VALUES (?, ?, ?)", [req.user.id, "All Scanned Contacts", "Automatically populated from your recent scans"]);
      const newList = { id: result.lastID, name: "All Scanned Contacts", description: "Automatically populated from your recent scans", contact_count: 0 };
      
      // Attempt to sync some contacts into this list
      const recentContacts = await dbAllAsync("SELECT email, name, company FROM contacts WHERE user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL) LIMIT 50", [req.user.id]);
      for (const c of recentContacts) {
        await dbRunAsync("INSERT OR IGNORE INTO email_list_contacts (list_id, email, first_name, company) VALUES (?, ?, ?, ?)", [result.lastID, c.email, c.name?.split(' ')[0], c.company]);
      }
      newList.contact_count = recentContacts.length;
      return res.json({ success: true, lists: [newList] });
    }

    res.json({ success: true, lists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/email/lists/:id
exports.getListById = async (req, res) => {
  try {
    const list = await dbGetAsync("SELECT * FROM email_lists WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!list) return res.status(404).json({ success: false, error: "Audience list not found" });

    const contacts = await dbAllAsync(`
      SELECT * FROM email_list_contacts 
      WHERE list_id = ? 
      ORDER BY created_at DESC`, [req.params.id]);

    res.json({ success: true, list, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/email/lists/:id/contacts
exports.addContactsToList = async (req, res) => {
  try {
    const { contacts } = req.body;
    const listId = req.params.id;

    if (!Array.isArray(contacts)) {
      return res.status(400).json({ success: false, error: "Invalid contacts payload" });
    }

    // Verify ownership
    const list = await dbGetAsync("SELECT id FROM email_lists WHERE id = ? AND user_id = ?", [listId, req.user.id]);
    if (!list) return res.status(404).json({ success: false, error: "Audience list not found" });

    for (const contact of contacts) {
      await dbRunAsync(
        `INSERT INTO email_list_contacts (list_id, email, first_name, last_name, company, subscribed) 
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(list_id, email) DO UPDATE SET 
         first_name = EXCLUDED.first_name, 
         last_name = EXCLUDED.last_name, 
         company = EXCLUDED.company`,
        [listId, contact.email, contact.first_name, contact.last_name, contact.company]
      );
    }

    res.json({ success: true, message: `${contacts.length} contacts processed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- TEMPLATE MANAGEMENT ---

// GET /api/email/templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await dbAllAsync("SELECT * FROM email_templates WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/email/templates/generate-ai
exports.generateAiTemplate = async (req, res) => {
  const { purpose, tone, industry, companyName, recipientType, keyMessage, callToAction } = req.body;
  
  try {
    const prompt = `Act as a world-class growth marketer. Write a highly converting email campaign.
    Purpose: ${purpose}
    Tone: ${tone}
    Industry: ${industry}
    Company: ${companyName}
    Target Recipient: ${recipientType}
    Payload/Value Proposition: ${keyMessage}
    Desired Action: ${callToAction}

    ### PREMIUM HTML GUIDELINES:
    1. **Structure**: Use a clean, single-column layout with generous padding.
    2. **Typography**: Use professional sans-serif fonts (Helvetica, Arial).
    3. **Aesthetics**: Use subtle shadows, rounded corners for buttons, and a clean white/light-gray background.
    4. **Animation Hook**: Add a class 'animate fadeInUp' to the main content div (our frontend simulator will handle the movement).
    5. **Personalization**: Use {{firstName}} or {{name}}.

    Return a JSON object with:
    {
      "subject": "Compelling subject line",
      "preview_text": "Short engaging preview snippet",
      "html": "A high-fidelity HTML email body using inline CSS. Ensure and <style> block is NOT needed; everything must be inline. Place content inside a <div style='max-width: 600px; margin: 0 auto; font-family: sans-serif; padding: 40px; border-radius: 16px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>."
    }`;

    const aiRes = await unifiedTextAIPipeline({
      prompt,
      responseFormat: 'json',
      model: 'gemini' // Fastest for template structure
    });

    if (aiRes.success) {
      res.json({ success: true, ...aiRes.data });
    } else {
      throw new Error("AI engine failed to materialize template");
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── HELPERS ──

/** Template variable substitutions for email campaigns */
function applyTemplateVariables(template, contact) {
  if (!template) return '';
  return String(template)
    .replace(/\{\{firstName\}\}/gi, String(contact?.first_name || contact?.name || 'there').split(/\s+/)[0])
    .replace(/\{\{first_name\}\}/gi, String(contact?.first_name || contact?.name || 'there').split(/\s+/)[0])
    .replace(/\{\{lastName\}\}/gi, String(contact?.last_name || '').split(/\s+/).pop())
    .replace(/\{\{last_name\}\}/gi, String(contact?.last_name || '').split(/\s+/).pop())
    .replace(/\{\{name\}\}/gi, String(contact?.name || contact?.first_name || ''))
    .replace(/\{\{email\}\}/gi, String(contact?.email || ''))
    .replace(/\{\{company\}\}/gi, String(contact?.company || 'partner organization'))
    .replace(/\{\{job_title\}\}/gi, String(contact?.job_title || 'Professional'))
    .replace(/\{\{title\}\}/gi, String(contact?.job_title || 'Professional'))
    .replace(/\{\{industry\}\}/gi, String(contact?.industry || contact?.inferred_industry || 'relevant industry'))
    .replace(/\{\{seniority\}\}/gi, String(contact?.inferred_seniority || ''))
    .replace(/\{\{senderName\}\}/gi, 'IntelliScan AI Team');
}

/**
 * Internal helper to automatically add a contact to the user's default list.
 * Ensuring newly scanned cards are immediately available for campaigns.
 */
exports.syncContactToDefaultList = async (userId, contact) => {
  if (!contact.email) return;
  try {
    // 1. Find or Create default list
    let list = await dbGetAsync('SELECT id FROM email_lists WHERE user_id = ? AND name = ?', [userId, "All Scanned Contacts"]);
    if (!list) {
      const result = await dbRunAsync("INSERT INTO email_lists (user_id, name, description) VALUES (?, ?, ?)", [userId, "All Scanned Contacts", "Automatically populated from your scans"]);
      list = { id: result.lastID };
    }

    // 2. Upsert contact into list (using unique constraint added in boot.js)
    await dbRunAsync(
      "INSERT INTO email_list_contacts (list_id, email, first_name, company) VALUES (?, ?, ?, ?) ON CONFLICT(list_id, email) DO UPDATE SET first_name = EXCLUDED.first_name, company = EXCLUDED.company",
      [list.id, contact.email, contact.name?.split(' ')[0], contact.company]
    );
    console.log(`[Marketing Sync] Contact ${contact.email} synced to List: ${list.id}`);
  } catch (err) {
    console.error('[Marketing Sync Error]', err.message);
  }
};
