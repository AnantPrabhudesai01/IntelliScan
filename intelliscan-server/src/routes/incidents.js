const express = require('express');
const router = express.Router();
const { dbAllAsync, dbRunAsync } = require('../utils/db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

/**
 * System Incident Management Routes
 */

// GET /api/incidents (Admin view)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const incidents = await dbAllAsync(`
      SELECT * FROM system_incidents 
      ORDER BY 
        CASE status WHEN 'open' THEN 1 WHEN 'acknowledged' THEN 2 ELSE 3 END,
        created_at DESC
    `);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/incidents (Manual Incident Creation)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { service, description, severity } = req.body;
  try {
    await dbRunAsync(
      'INSERT INTO system_incidents (service, description, severity, status) VALUES (?, ?, ?, ?)',
      [service, description, severity, 'open']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/incidents/:id/status (Update status/resolve)
router.patch('/:id/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let sql = 'UPDATE system_incidents SET status = ?';
    const params = [status];
    
    if (status === 'resolved') {
      sql += ', resolved_at = CURRENT_TIMESTAMP';
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    await dbRunAsync(sql, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/incidents/:id (Admin delete)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await dbRunAsync('DELETE FROM system_incidents WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
