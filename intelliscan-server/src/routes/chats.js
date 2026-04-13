/**
 * Chats Routes — Workspace chat history retrieval
 */
const express = require('express');
const router = express.Router();
const { db } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

function getWorkspaceChatRoom(workspaceId, userId) {
  return workspaceId ? `workspace-${workspaceId}` : `personal-${userId}`;
}

// GET /api/chats/:workspaceId
router.get('/:workspaceId', authenticateToken, (req, res) => {
  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (uErr, userRow) => {
    if (uErr) return res.status(500).json({ error: uErr.message });

    const expectedRoom = getWorkspaceChatRoom(userRow?.workspace_id || null, req.user.id);
    if (req.params.workspaceId !== expectedRoom) {
      return res.status(403).json({ error: 'Forbidden - invalid workspace scope' });
    }

    db.all('SELECT * FROM workspace_chats WHERE workspace_id = ? ORDER BY timestamp DESC LIMIT 50', [expectedRoom], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.reverse());
    });
  });
});

module.exports = router;
