/**
 * Webhook Controller — Management of external event triggers
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const crypto = require('crypto');

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
    const secret = crypto.randomBytes(32).toString('hex');
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    await dbRunAsync(
      'INSERT INTO webhooks (user_id, workspace_id, url, event_type, secret_key) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, userRow.workspace_id || req.user.id, url, event_type || 'on_scan', secret]
    );
    res.json({ success: true, message: 'Webhook registered', secret });
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
 */
exports.triggerWebhook = async (workspaceId, eventType, data) => {
  try {
    const hooks = await dbAllAsync(
      'SELECT id, url, secret_key FROM webhooks WHERE workspace_id = ? AND event_type = ? AND is_active = 1',
      [workspaceId, eventType]
    );

    for (const h of hooks) {
      const payload = JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data: data
      });

      // Generate HMAC-SHA256 signature
      const signature = crypto.createHmac('sha256', h.secret_key || 'sc-secret-placeholder')
        .update(payload)
        .digest('hex');

      const start = Date.now();
      try {
        const response = await fetch(h.url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-IntelliScan-Signature': signature,
            'User-Agent': 'IntelliScan-Webhook/1.2'
          },
          body: payload,
          signal: AbortSignal.timeout(5000) // 5s timeout
        });

        const latency = Date.now() - start;
        const respText = await response.text();

        await dbRunAsync(
          'INSERT INTO webhook_logs (webhook_id, status_code, response_body, latency_ms) VALUES (?, ?, ?, ?)',
          [h.id, response.status, respText.substring(0, 500), latency]
        );
      } catch (err) {
        const latency = Date.now() - start;
        console.error(`[Webhook] Delivery failed to ${h.url}:`, err.message);
        await dbRunAsync(
          'INSERT INTO webhook_logs (webhook_id, status_code, response_body, latency_ms) VALUES (?, ?, ?, ?)',
          [h.id, 0, err.message, latency]
        );
      }
    }
  } catch (err) {
    console.error('Webhook trigger architecture failed:', err.message);
  }
};
