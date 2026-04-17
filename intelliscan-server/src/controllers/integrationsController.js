const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');

/**
 * Get all integrations for the current user
 */
exports.getIntegrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const integrations = await dbAllAsync(
      'SELECT app_id, config_json, is_active, last_sync_at FROM workspace_integrations WHERE user_id = ?',
      [userId]
    );

    // Map to a more useful format for frontend
    const mapped = integrations.reduce((acc, curr) => {
      acc[curr.app_id] = {
        isActive: !!curr.is_active,
        config: JSON.parse(curr.config_json || '{}'),
        lastSync: curr.last_sync_at
      };
      return acc;
    }, {});

    res.json({ success: true, integrations: mapped });
  } catch (err) {
    console.error('[Integrations] Fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

/**
 * Save or update an integration
 */
exports.saveIntegration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appId, config, isActive } = req.body;

    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const configStr = JSON.stringify(config || {});
    const activeVal = isActive ? 1 : 0;

    // Use Upsert logic
    await dbRunAsync(`
      INSERT INTO workspace_integrations (user_id, app_id, config_json, is_active)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, app_id) DO UPDATE SET
        config_json = EXCLUDED.config_json,
        is_active = EXCLUDED.is_active
    `, [userId, appId, configStr, activeVal]);

    res.json({ success: true, message: `Integration ${appId} saved successfully` });
  } catch (err) {
    console.error('[Integrations] Save failed:', err);
    res.status(500).json({ error: 'Failed to save integration' });
  }
};

/**
 * Delete/Disable an integration
 */
exports.removeIntegration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appId } = req.params;

    await dbRunAsync(
      'DELETE FROM workspace_integrations WHERE user_id = ? AND app_id = ?',
      [userId, appId]
    );

    res.json({ success: true, message: 'Integration removed' });
  } catch (err) {
    console.error('[Integrations] Remove failed:', err);
    res.status(500).json({ error: 'Failed to remove integration' });
  }
};
