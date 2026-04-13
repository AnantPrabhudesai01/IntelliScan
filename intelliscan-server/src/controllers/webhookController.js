/**
 * Webhook Controller — Management of external event triggers
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');

// GET /api/webhooks
exports.getWebhooks = async (req, res) => {
  try {
    const hooks = await dbAllAsync(
      'SELECT * FROM webhooks WHERE user_id = ? OR workspace_id = (SELECT workspace_id FROM users WHERE id = ?)',
      [req.user.id, req.user.id]
    );
    res.json({ success: true, hooks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/webhooks
exports.registerWebhook = async (req, res) => {
  const { url, event_type } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    await dbRunAsync(
      'INSERT INTO webhooks (user_id, workspace_id, url, event_type) VALUES (?, ?, ?, ?)',
      [req.user.id, userRow.workspace_id || req.user.id, url, event_type || 'on_scan']
    );
    res.json({ success: true, message: 'Webhook registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/webhooks/:id
exports.deleteWebhook = async (req, res) => {
  try {
    await dbRunAsync('DELETE FROM webhooks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fires registered webhooks for a given event.
 * Note: This is a helper function used internally.
 */
exports.triggerWebhook = async (workspaceId, eventType, data) => {
  try {
    const hooks = await dbAllAsync(
      'SELECT url FROM webhooks WHERE workspace_id = ? AND event_type = ? AND is_active = 1',
      [workspaceId, eventType]
    );
    for (const h of hooks) {
      console.log(`[Webhook] Firing ${eventType} to ${h.url} with data:`, JSON.stringify(data).substring(0, 50) + '...');
      // In a production environment, use a queue/worker (e.g., BullMQ) for reliable delivery.
    }
  } catch (err) {
    console.error('Webhook trigger failed:', err.message);
  }
};
