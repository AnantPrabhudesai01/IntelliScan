/**
 * Notifications Routes — User notification management
 */
const express = require('express');
const router = express.Router();
const { dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await dbAllAsync(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await dbRunAsync(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await dbRunAsync(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await dbRunAsync(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
