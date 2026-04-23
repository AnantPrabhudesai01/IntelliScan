const express = require('express');
const router = express.Router();
const { dbAllAsync, dbRunAsync, dbGetAsync } = require('../utils/db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');

/**
 * Platform Feedback Routes
 * Logic: Users submit, Admins review/resolve.
 */

// GET /api/feedbacks/my (User's own history)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const history = await dbAllAsync(
      'SELECT id, type, subject, message, status, admin_response, created_at FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedbacks (User Submission)
router.post('/', authenticateToken, async (req, res) => {
  const { type, subject, message } = req.body;
  
  if (!type || !message) {
    return res.status(400).json({ error: 'Type and message are required' });
  }

  try {
    await dbRunAsync(
      'INSERT INTO feedbacks (user_id, type, subject, message, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, subject, message, 'new']
    );
    res.status(201).json({ success: true, message: 'Feedback transmitted to Neural Command.' });
  } catch (err) {
    console.error('[Feedback Error]', err);
    res.status(500).json({ error: 'Failed to process transmission' });
  }
});

// GET /api/feedbacks (Admin Fetch)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const feedbacks = await dbAllAsync(`
      SELECT 
        f.id, f.type, f.subject, f.message, f.status, f.admin_response, f.admin_note, f.created_at as date,
        u.name as "user", u.email
      FROM feedbacks f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedbacks/:id/respond (Admin Response)
router.post('/:id/respond', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { response, note, status = 'reviewed' } = req.body;

  try {
    await dbRunAsync(
      'UPDATE feedbacks SET admin_response = ?, admin_note = ?, status = ? WHERE id = ?',
      [response, note, status, id]
    );

    // --- AUTO-EMAIL: Notify the user ---
    try {
      const feedbackData = await dbGetAsync(`
        SELECT f.subject, u.email, u.name 
        FROM feedbacks f 
        JOIN users u ON f.user_id = u.id 
        WHERE f.id = ?
      `, [id]);

      if (feedbackData && feedbackData.email) {
        const smtp = createSmtpTransporterFromEnv();
        if (smtp) {
          await smtp.transporter.sendMail({
            from: `"IntelliScan Support" <${smtp.from}>`,
            to: feedbackData.email,
            subject: `Update on your feedback: ${feedbackData.subject || 'Ticket #' + id}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
                <h2 style="color: #6366f1;">Hi ${feedbackData.name || 'there'},</h2>
                <p>An administrator has responded to your feedback regarding: <strong>${feedbackData.subject || 'Platform Support'}</strong></p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366f1;">
                  <p style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">Admin Response:</p>
                  <p style="margin: 0; color: #4b5563; font-style: italic;">"${response}"</p>
                </div>
                <p style="font-size: 13px; color: #6b7280;">You can view your full feedback history anytime in your dashboard.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="font-size: 11px; color: #9ca3af;">This is an automated notification from IntelliScan. Please do not reply directly to this email.</p>
              </div>
            `
          });
          console.log(`[Email] Feedback response sent to ${feedbackData.email}`);
        }
      }
    } catch (emailErr) {
      console.warn('[Email] Failed to send feedback notification:', emailErr.message);
    }

    res.json({ success: true, message: 'Response transmitted and user notified via email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/feedbacks/:id/status (Admin Update)
router.patch('/:id/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await dbRunAsync('UPDATE feedbacks SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
