/**
 * CRM Controller — Logic for field mapping, provider connections, and sync logs
 */
const { db, dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { getDefaultMappings, getCrmSchema } = require('../utils/crmUtils');
const { logAuditEvent } = require('../utils/logger');
const { AUDIT_SUCCESS, AUDIT_ERROR, AUDIT_DENIED } = require('../config/constants');
const crmService = require('../services/crmService');

// GET /api/crm/config
exports.getConfig = (req, res) => {
  const { provider } = req.query;
  if (!provider) return res.status(400).json({ error: 'provider query param required' });

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.get(
      'SELECT * FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });

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
      }
    );
  });
};

// POST /api/crm/config
exports.saveConfig = (req, res) => {
    const { provider, field_mappings, custom_fields, auto_sync } = req.body;
    if (!provider || !field_mappings) {
      return res.status(400).json({ error: 'provider and field_mappings are required' });
    }
  
    db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
      if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
      const workspaceId = userRow.workspace_id || req.user.id;
  
      db.run(
        `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, auto_sync, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(workspace_id, provider) DO UPDATE SET
           field_mappings = excluded.field_mappings,
           custom_fields = excluded.custom_fields,
           auto_sync = excluded.auto_sync,
           updated_at = CURRENT_TIMESTAMP`,
        [workspaceId, provider, JSON.stringify(field_mappings), JSON.stringify(custom_fields || []), auto_sync ? 1 : 0],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'success', `Mapping configuration saved. ${field_mappings.length} fields configured.`]
        );

        res.json({ success: true, message: 'Mapping saved successfully' });
      }
    );
  });
};

// POST /api/crm/connect
exports.connect = (req, res) => {
  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'provider is required' });

  const validProviders = ['salesforce', 'hubspot', 'zoho', 'pipedrive'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.run(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, is_connected, connected_at)
       VALUES (?, ?, ?, '[]', 1, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         is_connected = 1,
         connected_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(getDefaultMappings(provider))],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'success', `Connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)} organization.`]
        );

        res.json({ success: true, message: `Connected to ${provider}`, connected_at: new Date().toISOString() });
      }
    );
  });
};

// POST /api/crm/disconnect
exports.disconnect = (req, res) => {
  const { provider } = req.body;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.run(
      'UPDATE crm_mappings SET is_connected = 0 WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'info', `Disconnected from ${provider}.`]
        );

        res.json({ success: true });
      }
    );
  });
};

// GET /api/crm/schema
exports.getSchema = (req, res) => {
  const { provider } = req.query;
  const schema = getCrmSchema(provider || 'salesforce');

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    const workspaceId = (userRow && userRow.workspace_id) || req.user.id;

    db.run(
      'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, 'success', `Schema sync completed. ${schema.length} fields available.`]
    );

    res.json({ provider, fields: schema, total: schema.length, synced_at: new Date().toISOString() });
  });
};

// GET /api/crm/sync-log
exports.getSyncLog = (req, res) => {
  const { provider, limit = 20 } = req.query;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    let query = 'SELECT * FROM crm_sync_log WHERE workspace_id = ?';
    let params = [workspaceId];
    if (provider) { query += ' AND provider = ?'; params.push(provider); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    db.all(query, params, (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows);
    });
  });
};

// POST /api/crm/export/:provider
exports.exportContacts = (req, res) => {
  const provider = req.params.provider;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.get(
      'SELECT field_mappings, custom_fields FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      async (err2, mappingRow) => {
        const fieldMappings = mappingRow ? JSON.parse(mappingRow.field_mappings) : getDefaultMappings(provider);
        const customFields = mappingRow ? JSON.parse(mappingRow.custom_fields || '[]') : [];
        const allMappings = [...fieldMappings, ...customFields];

        try {
          const contacts = await dbAllAsync(
            `SELECT c.*, u.name as scanner_name
             FROM contacts c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE (u.workspace_id = ? OR c.user_id = ?)
             AND (c.is_deleted IS FALSE OR c.is_deleted IS NULL)
             ORDER BY c.scan_date DESC`,
            [workspaceId, req.user.id]
          );

          // PRO LOGIC: Check for direct API connection
          const integration = await dbGetAsync(
            'SELECT is_active, config_json FROM workspace_integrations WHERE workspace_id = ? AND app_id = ?',
            [workspaceId, provider]
          );

          if (integration && integration.is_active) {
            // Attempt Direct Push
            const result = await crmService.syncContactsToProvider(workspaceId, provider, contacts, allMappings);
            
            db.run(
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

          db.run(
            'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
            [workspaceId, provider, 'success', `Export completed via CSV. ${contacts.length} contacts exported.`]
          );

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${provider}-contacts-${Date.now()}.csv"`);
          res.send(csv);

        } catch (syncErr) {
          console.error('CRM Sync Error:', syncErr);
          res.status(500).json({ error: syncErr.message });
        }
      }
    );
  });
};
