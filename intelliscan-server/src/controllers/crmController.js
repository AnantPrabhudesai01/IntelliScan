/**
 * CRM Controller — Logic for field mapping, provider connections, and sync logs
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { getDefaultMappings, getCrmSchema } = require('../utils/crmUtils');
const crmService = require('../services/crmService');

// GET /api/crm/config
exports.getConfig = async (req, res) => {
  const { provider } = req.query;
  if (!provider) return res.status(400).json({ error: 'provider query param required' });

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    const row = await dbGetAsync(
      'SELECT * FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider]
    );

    if (!row) {
      return res.json({
        provider,
        is_connected: false,
        field_mappings: getDefaultMappings(provider),
        custom_fields: [],
        last_sync: null
      });
    }

    res.json({
      provider: row.provider,
      is_connected: !!row.is_connected,
      field_mappings: JSON.parse(row.field_mappings),
      custom_fields: JSON.parse(row.custom_fields || '[]'),
      last_sync: row.last_sync
    });
  } catch (err) {
    console.error('[CRM Config Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/crm/config
exports.saveConfig = async (req, res) => {
  const { provider, field_mappings, custom_fields, auto_sync } = req.body;
  if (!provider || !field_mappings) {
    return res.status(400).json({ error: 'provider and field_mappings are required' });
  }

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    await dbRunAsync(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, auto_sync, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         field_mappings = excluded.field_mappings,
         custom_fields = excluded.custom_fields,
         auto_sync = excluded.auto_sync,
         updated_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(field_mappings), JSON.stringify(custom_fields || []), auto_sync ? 1 : 0]
    );

    await dbRunAsync(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Mapping configuration saved. ${field_mappings.length} fields configured.`]
    );

    res.json({ success: true, message: 'Mapping saved successfully' });
  } catch (err) {
    console.error('[CRM Save Config Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/crm/connect
exports.connect = async (req, res) => {
  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'provider is required' });

  const validProviders = ['salesforce', 'hubspot', 'zoho', 'pipedrive'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    await dbRunAsync(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, is_connected, connected_at)
       VALUES (?, ?, ?, '[]', 1, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         is_connected = 1,
         connected_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(getDefaultMappings(provider))]
    );

    await dbRunAsync(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)} organization.`]
    );

    res.json({ success: true, message: `Connected to ${provider}`, connected_at: new Date().toISOString() });
  } catch (err) {
    console.error('[CRM Connect Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/crm/disconnect
exports.disconnect = async (req, res) => {
  const { provider } = req.body;

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    await dbRunAsync(
      'UPDATE crm_mappings SET is_connected = 0 WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider]
    );

    await dbRunAsync(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'info', `Disconnected from ${provider}.`]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[CRM Disconnect Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/crm/schema
exports.getSchema = async (req, res) => {
  const { provider } = req.query;
  const schema = getCrmSchema(provider || 'salesforce');

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = (userRow && userRow.workspace_id) || req.user.id;

    await dbRunAsync(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Schema sync completed. ${schema.length} fields available.`]
    );

    res.json({ provider, fields: schema, total: schema.length, synced_at: new Date().toISOString() });
  } catch (err) {
    console.error('[CRM Schema Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/crm/sync-log
exports.getSyncLog = async (req, res) => {
  const { provider, limit = 20 } = req.query;

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    let query = 'SELECT * FROM crm_sync_log WHERE workspace_id = ?';
    let params = [workspaceId];
    if (provider) { query += ' AND provider = ?'; params.push(provider); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const rows = await dbAllAsync(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[CRM Sync Log Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/crm/export/:provider
exports.exportContacts = async (req, res) => {
  const provider = req.params.provider;

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    const mappingRow = await dbGetAsync(
      'SELECT field_mappings, custom_fields FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider]
    );

    const fieldMappings = mappingRow ? JSON.parse(mappingRow.field_mappings) : getDefaultMappings(provider);
    const customFields = mappingRow ? JSON.parse(mappingRow.custom_fields || '[]') : [];
    const allMappings = [...fieldMappings, ...customFields];

    // PRO LOGIC: Check for direct API connection
    // We check workspace_integrations table which is different from crm_mappings (one is for config, other for auth)
    const integration = await dbGetAsync(
      'SELECT is_active, config_json FROM workspace_integrations WHERE user_id = ? AND app_id = ?',
      [req.user.id, provider]
    );

    // Fetch contacts for the workspace/user
    const sql = `SELECT c.*, u.name as scanner_name
                 FROM contacts c
                 LEFT JOIN users u ON c.user_id = u.id
                 WHERE (u.workspace_id = ? OR c.user_id = ?)
                 AND (c.is_deleted IS FALSE OR c.is_deleted IS NULL)
                 ORDER BY c.scan_date DESC`;
    const params = [workspaceId, req.user.id];
    const contacts = await dbAllAsync(sql, params);

    if (integration && integration.is_active) {
      // Attempt Direct Push
      const result = await crmService.syncContactsToProvider(workspaceId, provider, contacts, allMappings);
      
      await dbRunAsync(
        'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
        [workspaceId, provider, 'success', `API Sync completed. ${result.success} contacts pushed, ${result.failed} failed.`]
      );

      return res.json({ 
        success: true, 
        message: `Successfully synchronized ${result.success} contacts to ${provider}.`,
        stats: result
      });
    }

    // FALLBACK: Traditional CSV Export
    const activeMappings = allMappings.filter(m => m.crmField && m.crmField !== '-- Do not sync --');
    const headers = activeMappings.map(m => m.crmField);
    const rowsFormatted = contacts.map(contact => {
      return activeMappings.map(m => {
        const value = contact[m.iscanKey] || '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });

    const csv = [headers.join(','), ...rowsFormatted].join('\n');

    await dbRunAsync(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Export completed via CSV. ${contacts.length} contacts exported.`]
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${provider}-contacts-${Date.now()}.csv"`);
    res.send(csv);

  } catch (err) {
    console.error('CRM Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
};
