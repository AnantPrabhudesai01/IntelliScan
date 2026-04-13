const { dbAllAsync } = require('../utils/db');

/**
 * Fires active webhooks for a specific workspace and event type.
 * @param {number} workspaceId - The workspace or user-scoped ID
 * @param {string} eventType - e.g., 'on_scan', 'on_deal_update'
 * @param {object} data - Payload to send
 */
async function triggerWebhook(workspaceId, eventType, data) {
  try {
    const hooks = await dbAllAsync(
      'SELECT url FROM webhooks WHERE workspace_id = ? AND event_type = ? AND is_active = 1',
      [workspaceId, eventType]
    );

    for (const h of hooks) {
      console.log(`[Webhook] Firing ${eventType} to ${h.url} with data:`, 
        JSON.stringify(data).substring(0, 100) + '...'
      );
      
      // In a production environment, you would use axios or node-fetch:
      /*
      fetch(h.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          event: eventType,
          data
        })
      }).catch(err => console.error(`Webhook delivery failed to ${h.url}:`, err.message));
      */
    }
  } catch (err) {
    console.error('Webhook trigger failed:', err.message);
  }
}

module.exports = {
  triggerWebhook
};
