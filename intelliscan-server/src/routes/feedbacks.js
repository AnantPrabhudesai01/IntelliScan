const express = require('express');
const router = express.Router();
const { dbAllAsync, dbRunAsync, dbGetAsync } = require('../utils/db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

/**
 * Platform Feedback Routes
 * Logic: Users submit, Admins review/resolve.
 */

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
        f.id, f.type, f.subject, f.message, f.status, f.created_at as date,
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
