/**
 * Feedback Routes — Support and feature requests
 */
const express = require('express');
const router = express.Router();
const { dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/feedbacks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAllAsync(
      'SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC', 
      [Number(req.user.id)]
    );
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedbacks
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { category, content, rating } = req.body;
    const result = await dbRunAsync(
      'INSERT INTO feedbacks (user_id, category, content, rating) VALUES (?, ?, ?, ?)',
      [Number(req.user.id), category, content, rating]
    );
    res.status(201).json({ id: result.lastID, message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
