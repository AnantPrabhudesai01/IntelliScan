/**
 * Events Routes — Simple event CRUD (not calendar events)
 */
const express = require('express');
const router = express.Router();
const { db } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/events
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT e.*, COUNT(c.id) as attendees_count 
    FROM events e 
    LEFT JOIN contacts c ON c.event_id = e.id 
    WHERE e.user_id = ? 
    GROUP BY e.id 
    ORDER BY e.date DESC
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/events
router.post('/', authenticateToken, (req, res) => {
  const { name, date, location, type, status } = req.body;
  db.run(
    'INSERT INTO events (user_id, name, date, location, type, status) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, date, location, type, status || 'active'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Event created successfully' });
    }
  );
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event deleted successfully' });
  });
});

module.exports = router;
