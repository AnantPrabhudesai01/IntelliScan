/**
 * Events Routes — Simple event CRUD (not calendar events)
 */
const express = require('express');
const router = express.Router();
const { dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT e.*, COUNT(c.id) as attendees_count 
      FROM events e 
      LEFT JOIN contacts c ON c.event_id = e.id 
      WHERE e.user_id = ? 
      GROUP BY e.id 
      ORDER BY e.date DESC
    `;
    const rows = await dbAllAsync(query, [Number(req.user.id)]);
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, date, location, type, status } = req.body;
    const result = await dbRunAsync(
      'INSERT INTO events (user_id, name, date, location, type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [Number(req.user.id), name, date, location, type, status || 'active']
    );
    res.status(201).json({ id: result.lastID, message: 'Event created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRunAsync('DELETE FROM events WHERE id = ? AND user_id = ?', [Number(id), Number(req.user.id)]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
