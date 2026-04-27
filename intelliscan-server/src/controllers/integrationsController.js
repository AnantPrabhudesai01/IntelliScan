const { dbRunAsync, dbGetAsync, dbAllAsync } = require('../utils/db');

/**
 * Get all active integrations for the current user
 */
exports.getIntegrations = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const integrations = await dbAllAsync(
      'SELECT app_id, config_json as config, is_active FROM workspace_integrations WHERE user_id = ?',
      [userId]
    );

    const integrationMap = {};
    integrations.forEach(i => {
      integrationMap[i.app_id] = {
        isActive: !!i.is_active,
        config: i.config ? JSON.parse(i.config) : {}
      };
    });

    res.json({ success: true, integrations: integrationMap });
  } catch (err) {
    console.error('[Integrations Controller Error]', err.message);
    res.status(500).json({ error: 'Failed to fetch integrations', details: err.message });
  }
};

/**
 * Toggle an integration or update its config
 */
exports.saveIntegration = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { appId, config, isActive } = req.body;

    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    const configStr = JSON.stringify(config || {});
    const activeBool = !!isActive;

    // Use UPSERT logic for Postgres/SQLite compatibility via dbRunAsync
    const existing = await dbGetAsync(
      'SELECT id FROM workspace_integrations WHERE user_id = ? AND app_id = ?',
      [userId, appId]
    );

    if (existing) {
      await dbRunAsync(
        'UPDATE workspace_integrations SET config_json = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND app_id = ?',
        [configStr, activeBool, userId, appId]
      );
    } else {
      await dbRunAsync(
        'INSERT INTO workspace_integrations (user_id, app_id, config_json, is_active) VALUES (?, ?, ?, ?)',
        [userId, appId, configStr, activeBool]
      );
    }

    res.json({ 
      success: true, 
      message: `${appId} integration updated successfully`,
      integration: { appId, config, isActive: activeBool }
    });
  } catch (err) {
    console.error('[Integrations Save Error]', err.message);
    res.status(500).json({ error: 'Failed to save integration', details: err.message });
  }
};
