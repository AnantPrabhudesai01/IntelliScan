# IntelliScan — CRM Data Mapping: Complete Production-Grade Build Prompt

> **What this is:** You have a CRM Mapping page (`CrmMappingPage.jsx`) that looks good visually but is 90% mock data. This prompt tells you exactly what to build to make it fully functional, production-grade, and real — covering both the React frontend and the Express/SQLite backend in `index.js`.

---

## WHAT EXISTS RIGHT NOW (Current State)

The page currently has:
- ✅ UI for 4 CRM providers (Salesforce, HubSpot, Zoho, Pipedrive) — visual only
- ✅ Field mapping table with dropdowns — saves to state only, no real persistence
- ✅ "Sync Schema" button — calls `/api/workspace/analytics` (wrong endpoint, returns scan stats not schema)
- ✅ "Test Export" button — calls `/api/crm/export/:provider` but backend endpoint may not exist
- ✅ "Save Mapping" button — calls `/api/crm-mappings` but backend endpoint does not exist
- ✅ Sync Activity Log — hard-coded fake log entries
- ✅ Custom field rows — works in local state, not persisted
- ❌ No real CRM connection/OAuth
- ❌ No real backend persistence for mappings
- ❌ No real CSV export with field mapping applied
- ❌ No real schema fetching
- ❌ Trash2 icon imported in JSX but not imported from lucide-react (will crash)
- ❌ No HubSpot, Zoho, Pipedrive field options (only Salesforce fields listed)
- ❌ No validation, error handling, loading states on CRM connect flow

---

## PART 1 — BACKEND: All New Endpoints to Add in `index.js`

Add all of the following to `intelliscan-server/index.js`. Place them in a clearly labelled section: `// ==================== CRM MAPPING ENDPOINTS ====================`

---

### Step 1A — Add `crm_mappings` table to the SQLite initialization block

Inside the `db.serialize()` block where all tables are created, add:

```javascript
// CRM Mappings — stores field mapping config per workspace per provider
db.run(`CREATE TABLE IF NOT EXISTS crm_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  field_mappings TEXT NOT NULL,
  custom_fields TEXT DEFAULT '[]',
  is_connected INTEGER DEFAULT 0,
  connected_at DATETIME,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, provider)
)`);

// CRM Sync Log — stores activity log entries per workspace
db.run(`CREATE TABLE IF NOT EXISTS crm_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

---

### Step 1B — GET /api/crm/config — Fetch saved mapping for a provider

```javascript
// GET /api/crm/config?provider=salesforce
// Returns: the saved field mappings + connection status for the given provider
app.get('/api/crm/config', authenticateToken, (req, res) => {
  const { provider } = req.query;
  if (!provider) return res.status(400).json({ error: 'provider query param required' });

  const user = req.user;

  // Get workspace_id from the users table
  db.get('SELECT workspace_id FROM users WHERE id = ?', [user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });

    const workspaceId = userRow.workspace_id || user.id; // fallback to user id if no workspace

    db.get(
      'SELECT * FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (!row) {
          // Return defaults for this provider if no saved config
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
});
```

---

### Step 1C — POST /api/crm/config — Save field mapping

```javascript
// POST /api/crm/config
// Body: { provider, field_mappings, custom_fields }
// Saves (upserts) the mapping configuration for this workspace + provider
app.post('/api/crm/config', authenticateToken, (req, res) => {
  const { provider, field_mappings, custom_fields } = req.body;
  if (!provider || !field_mappings) {
    return res.status(400).json({ error: 'provider and field_mappings are required' });
  }

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    db.run(
      `INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(workspace_id, provider) DO UPDATE SET
         field_mappings = excluded.field_mappings,
         custom_fields = excluded.custom_fields,
         updated_at = CURRENT_TIMESTAMP`,
      [workspaceId, provider, JSON.stringify(field_mappings), JSON.stringify(custom_fields || [])],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        // Log the save action
        db.run(
          'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
          [workspaceId, provider, 'success', `Mapping configuration saved. ${field_mappings.length} fields configured.`]
        );

        res.json({ success: true, message: 'Mapping saved successfully' });
      }
    );
  });
});
```

---

### Step 1D — POST /api/crm/connect — Simulate CRM connection (OAuth placeholder)

```javascript
// POST /api/crm/connect
// Body: { provider }
// In production this would redirect to OAuth. For now, simulates connection.
app.post('/api/crm/connect', authenticateToken, (req, res) => {
  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'provider is required' });

  const validProviders = ['salesforce', 'hubspot', 'zoho', 'pipedrive'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    // Upsert with is_connected = 1
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
});
```

---

### Step 1E — POST /api/crm/disconnect — Disconnect a CRM provider

```javascript
// POST /api/crm/disconnect
// Body: { provider }
app.post('/api/crm/disconnect', authenticateToken, (req, res) => {
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
});
```

---

### Step 1F — GET /api/crm/schema — Fetch schema (available CRM fields)

```javascript
// GET /api/crm/schema?provider=salesforce
// Returns the list of available fields for this CRM provider
// In production this calls the CRM's describe API. Here we return static schema per provider.
app.get('/api/crm/schema', authenticateToken, (req, res) => {
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
});
```

---

### Step 1G — GET /api/crm/sync-log — Fetch activity log

```javascript
// GET /api/crm/sync-log?provider=salesforce&limit=20
app.get('/api/crm/sync-log', authenticateToken, (req, res) => {
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
});
```

---

### Step 1H — POST /api/crm/export/:provider — Generate and download CSV with field mapping applied

```javascript
// POST /api/crm/export/:provider
// Returns a CSV file with contacts mapped to CRM field names
app.post('/api/crm/export/:provider', authenticateToken, (req, res) => {
  const provider = req.params.provider;

  db.get('SELECT workspace_id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err || !userRow) return res.status(500).json({ error: 'Could not find workspace' });
    const workspaceId = userRow.workspace_id || req.user.id;

    // Load saved field mapping for this provider
    db.get(
      'SELECT field_mappings, custom_fields FROM crm_mappings WHERE workspace_id = ? AND provider = ?',
      [workspaceId, provider],
      (err2, mappingRow) => {
        const fieldMappings = mappingRow ? JSON.parse(mappingRow.field_mappings) : getDefaultMappings(provider);
        const customFields = mappingRow ? JSON.parse(mappingRow.custom_fields || '[]') : [];
        const allMappings = [...fieldMappings, ...customFields];

        // Fetch workspace contacts
        db.all(
          `SELECT c.*, u.name as scanner_name
           FROM contacts c
           LEFT JOIN users u ON c.user_id = u.id
           WHERE u.workspace_id = ? OR c.user_id = ?
           ORDER BY c.scan_date DESC`,
          [workspaceId, req.user.id],
          (err3, contacts) => {
            if (err3) return res.status(500).json({ error: err3.message });

            // Build CSV with CRM field names as headers
            const activeMappings = allMappings.filter(m => m.crmField && m.crmField !== '-- Do not sync --');

            // CSV header row — use CRM field names
            const headers = activeMappings.map(m => m.crmField);
            const rows = contacts.map(contact => {
              return activeMappings.map(m => {
                const value = contact[m.iscanKey] || '';
                // Escape commas and quotes in CSV
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
              }).join(',');
            });

            const csv = [headers.join(','), ...rows].join('\n');

            // Log the export
            db.run(
              'INSERT INTO crm_sync_log (workspace_id, provider, status, message) VALUES (?, ?, ?, ?)',
              [workspaceId, provider, 'success', `Export completed. ${contacts.length} contacts exported with ${activeMappings.length} fields.`]
            );

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${provider}-contacts-${Date.now()}.csv"`);
            res.send(csv);
          }
        );
      }
    );
  });
});
```

---

### Step 1I — Helper functions to add ABOVE all routes in index.js

Add these pure functions near the top of `index.js`, after the middleware setup but before any route definitions:

```javascript
// ── CRM HELPER FUNCTIONS ─────────────────────────────────────────────────────

function getDefaultMappings(provider) {
  // Salesforce and generic defaults
  const common = [
    { iscanField: 'Full Name',       iscanKey: 'name',               crmField: 'Name',            type: 'String',   required: true  },
    { iscanField: 'Company Name',    iscanKey: 'company',            crmField: 'Account Name',    type: 'String',   required: true  },
    { iscanField: 'Job Title',       iscanKey: 'job_title',          crmField: 'Title',           type: 'String',   required: false },
    { iscanField: 'Email Address',   iscanKey: 'email',              crmField: 'Email',           type: 'Email',    required: true  },
    { iscanField: 'Phone Number',    iscanKey: 'phone',              crmField: 'MobilePhone',     type: 'Phone',    required: false },
    { iscanField: 'Website',         iscanKey: 'website',            crmField: 'Website',         type: 'String',   required: false },
    { iscanField: 'Industry (AI)',   iscanKey: 'inferred_industry',  crmField: 'Industry',        type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'Seniority (AI)',  iscanKey: 'inferred_seniority', crmField: 'Lead_Level__c',   type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'AI Confidence',   iscanKey: 'confidence',         crmField: 'Lead_Score__c',   type: 'Number',   required: false },
  ];

  // Provider-specific CRM field name overrides
  if (provider === 'hubspot') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'firstname',
        'Account Name': 'company',
        'Title': 'jobtitle',
        'Email': 'email',
        'MobilePhone': 'mobilephone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'hs_lead_status',
        'Lead_Score__c': 'hubspotscore',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'zoho') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'Full_Name',
        'Account Name': 'Account_Name',
        'Title': 'Title',
        'Email': 'Email',
        'MobilePhone': 'Mobile',
        'Website': 'Website',
        'Industry': 'Industry',
        'Lead_Level__c': 'Lead_Source',
        'Lead_Score__c': 'Rating',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'pipedrive') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'name',
        'Account Name': 'org_name',
        'Title': 'title',
        'Email': 'email',
        'MobilePhone': 'phone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'label',
        'Lead_Score__c': 'value',
      }[f.crmField] || f.crmField
    }));
  }

  return common; // default = Salesforce
}


function getCrmSchema(provider) {
  // Returns the list of fields available in each CRM
  // In production, this would call the CRM's API (Salesforce describe(), HubSpot properties API, etc.)
  const schemas = {
    salesforce: [
      'Name', 'Account Name', 'Title', 'Email', 'MobilePhone', 'Phone', 'Website',
      'Industry', 'Lead_Level__c', 'Lead_Score__c', 'LinkedIn_URL__c',
      'Description', 'LeadSource', 'Status', 'Rating', 'AnnualRevenue',
      'NumberOfEmployees', 'Country', 'City', 'Street', 'PostalCode', 'State',
      'Custom_Field_1__c', 'Custom_Field_2__c', 'Custom_Field_3__c',
      '-- Do not sync --'
    ],
    hubspot: [
      'firstname', 'lastname', 'company', 'jobtitle', 'email', 'mobilephone',
      'phone', 'website', 'industry', 'hs_lead_status', 'hubspotscore',
      'linkedin_bio', 'description', 'num_employees', 'annualrevenue',
      'country', 'city', 'address', 'zip', 'state',
      '-- Do not sync --'
    ],
    zoho: [
      'Full_Name', 'Account_Name', 'Title', 'Email', 'Mobile', 'Phone',
      'Website', 'Industry', 'Lead_Source', 'Rating', 'LinkedIn_Id',
      'Description', 'No_of_Employees', 'Annual_Revenue',
      'Country', 'City', 'Street', 'Zip_Code', 'State',
      '-- Do not sync --'
    ],
    pipedrive: [
      'name', 'org_name', 'title', 'email', 'phone', 'website',
      'industry', 'label', 'value', 'notes',
      'address_country', 'address_city', 'address_street',
      '-- Do not sync --'
    ]
  };
  return schemas[provider] || schemas.salesforce;
}
```

---

## PART 2 — FRONTEND: Complete Rewrite of `CrmMappingPage.jsx`

Replace the entire file with the following. This version:
- Loads saved mappings from the backend on mount
- Loads the sync log from the backend on mount
- Saves to the backend on "Save Mapping"
- Connects/disconnects real provider state in the DB
- Fetches schema from the backend on "Sync Schema"
- Exports a real CSV from the backend on "Test Export"
- Shows real loading/error/success states everywhere
- Fixes the missing `Trash2` import crash
- Shows provider-specific CRM field options based on active provider

```jsx
// intelliscan-app/src/pages/workspace/CrmMappingPage.jsx
// COMPLETE PRODUCTION VERSION — replace the entire file

import { useState, useEffect, useCallback } from 'react';
import {
  Database, RefreshCw, ArrowRight, Save, Check, Plus,
  Globe, Plug, Shield, Sparkles, XCircle, Trash2,
  CheckCircle2, AlertCircle, Loader2, Link2, Unlink
} from 'lucide-react';

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const CRM_PROVIDERS = [
  { id: 'salesforce', name: 'Salesforce', dotColor: 'bg-blue-500',   ring: 'ring-blue-400'   },
  { id: 'hubspot',    name: 'HubSpot',    dotColor: 'bg-orange-500', ring: 'ring-orange-400' },
  { id: 'zoho',       name: 'Zoho CRM',   dotColor: 'bg-red-500',    ring: 'ring-red-400'    },
  { id: 'pipedrive',  name: 'Pipedrive',  dotColor: 'bg-green-500',  ring: 'ring-green-400'  },
];

// ── TOAST COMPONENT ──────────────────────────────────────────────────────────

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    error:   'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info:    'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm animate-in slide-in-from-top-2 ${styles[type]}`}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <XCircle size={14} />
      </button>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CrmMappingPage() {

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeProvider, setActiveProvider] = useState('salesforce');
  const [providerStatus, setProviderStatus] = useState({
    salesforce: false, hubspot: false, zoho: false, pipedrive: false
  });

  const [fields, setFields] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [crmSchema, setCrmSchema] = useState([]);

  const [syncLog, setSyncLog] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [totalContacts, setTotalContacts] = useState(null);

  const [loading, setLoading] = useState({ page: true, save: false, sync: false, export: false, connect: false });
  const [toast, setToast] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const token = () => localStorage.getItem('token');

  const api = useCallback(async (method, path, body) => {
    const res = await fetch(path, {
      method,
      headers: {
        'Authorization': `Bearer ${token()}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res;
  }, []);

  const showToast = (type, message) => setToast({ type, message, id: Date.now() });

  const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // ── Load on mount / provider change ───────────────────────────────────────

  const loadConfig = useCallback(async (provider) => {
    setLoading(l => ({ ...l, page: true }));
    try {
      // 1. Load mapping config for this provider
      const configRes = await api('GET', `/api/crm/config?provider=${provider}`);
      const config = await configRes.json();

      setFields(config.field_mappings || []);
      setCustomFields(config.custom_fields || []);
      setLastSyncTime(config.last_sync ? fmtTime(config.last_sync) : null);

      // Update connection status for this provider
      setProviderStatus(prev => ({ ...prev, [provider]: config.is_connected }));

      // 2. Load schema (available CRM fields) for this provider
      const schemaRes = await api('GET', `/api/crm/schema?provider=${provider}`);
      const schemaData = await schemaRes.json();
      setCrmSchema(schemaData.fields || []);
      setTotalContacts(schemaData.total || null);

      // 3. Load sync log for this provider
      const logRes = await api('GET', `/api/crm/sync-log?provider=${provider}&limit=20`);
      const logData = await logRes.json();
      setSyncLog(logData);

    } catch (e) {
      showToast('error', 'Failed to load config: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, page: false }));
    }
  }, [api]);

  useEffect(() => {
    loadConfig(activeProvider);
  }, [activeProvider, loadConfig]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleConnect = async (provider) => {
    setLoading(l => ({ ...l, connect: true }));
    try {
      await api('POST', '/api/crm/connect', { provider });
      setProviderStatus(prev => ({ ...prev, [provider]: true }));
      showToast('success', `Connected to ${CRM_PROVIDERS.find(p => p.id === provider)?.name}`);
      await loadConfig(provider);
    } catch (e) {
      showToast('error', 'Connection failed: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, connect: false }));
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Disconnect from ${CRM_PROVIDERS.find(p => p.id === provider)?.name}? Your mapping config will be preserved.`)) return;
    setLoading(l => ({ ...l, connect: true }));
    try {
      await api('POST', '/api/crm/disconnect', { provider });
      setProviderStatus(prev => ({ ...prev, [provider]: false }));
      showToast('info', `Disconnected from ${CRM_PROVIDERS.find(p => p.id === provider)?.name}`);
      await loadConfig(provider);
    } catch (e) {
      showToast('error', 'Disconnect failed: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, connect: false }));
    }
  };

  const handleSyncSchema = async () => {
    setLoading(l => ({ ...l, sync: true }));
    try {
      const res = await api('GET', `/api/crm/schema?provider=${activeProvider}`);
      const data = await res.json();
      setCrmSchema(data.fields || []);
      setLastSyncTime(fmtTime(data.synced_at));
      // Refresh log
      const logRes = await api('GET', `/api/crm/sync-log?provider=${activeProvider}&limit=20`);
      setSyncLog(await logRes.json());
      showToast('success', `Schema synced. ${data.total} fields available.`);
    } catch (e) {
      showToast('error', 'Schema sync failed: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, sync: false }));
    }
  };

  const handleSave = async () => {
    setLoading(l => ({ ...l, save: true }));
    try {
      await api('POST', '/api/crm/config', {
        provider: activeProvider,
        field_mappings: fields,
        custom_fields: customFields,
      });
      // Refresh log after save
      const logRes = await api('GET', `/api/crm/sync-log?provider=${activeProvider}&limit=20`);
      setSyncLog(await logRes.json());
      showToast('success', 'Mapping configuration saved successfully.');
    } catch (e) {
      showToast('error', 'Save failed: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, save: false }));
    }
  };

  const handleTestExport = async () => {
    setLoading(l => ({ ...l, export: true }));
    try {
      const res = await fetch(`/api/crm/export/${activeProvider}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProvider}-contacts-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // Refresh log
      const logRes = await api('GET', `/api/crm/sync-log?provider=${activeProvider}&limit=20`);
      setSyncLog(await logRes.json());
      showToast('success', 'CSV exported and download started.');
    } catch (e) {
      showToast('error', 'Export failed: ' + e.message);
    } finally {
      setLoading(l => ({ ...l, export: false }));
    }
  };

  // ── Field mutation helpers ────────────────────────────────────────────────

  const updateFieldMapping = (index, newCrmField) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, crmField: newCrmField } : f));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { iscanField: '', crmField: '', type: 'String', id: Date.now(), custom: true }]);
  };

  const updateCustomField = (id, key, value) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeCustomField = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const isConnected = providerStatus[activeProvider];
  const activeProviderMeta = CRM_PROVIDERS.find(p => p.id === activeProvider);
  const activeMappingCount = [...fields, ...customFields].filter(
    f => f.crmField && f.crmField !== '-- Do not sync --'
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading.page && fields.length === 0) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* Toast */}
      {toast && (
        <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Database size={24} className="text-indigo-600 dark:text-indigo-400" />
            CRM Data Mapping
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
            Map IntelliScan's AI-extracted fields — including enriched Industry and Seniority data — to your CRM's custom schema.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTestExport}
            disabled={loading.export || !isConnected}
            title={!isConnected ? 'Connect a CRM provider first' : ''}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading.export ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
            {loading.export ? 'Exporting...' : 'Test Export'}
          </button>
          <button
            onClick={handleSyncSchema}
            disabled={loading.sync}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#161c28] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            {loading.sync ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {loading.sync ? 'Syncing...' : 'Sync Schema'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading.save}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white transition-all shadow-sm shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading.save ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {loading.save ? 'Saving...' : 'Save Mapping'}
          </button>
        </div>
      </div>

      {/* ── Provider Tabs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CRM_PROVIDERS.map(provider => {
          const connected = providerStatus[provider.id];
          const isActive = activeProvider === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={`relative flex flex-col items-start gap-1.5 px-4 py-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c28] hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${provider.dotColor}`} />
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{provider.name}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'
              }`}>
                {connected ? '● Connected' : '○ Not Connected'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Connection Status Banner ──────────────────────────────────────── */}
      <div className={`p-4 rounded-2xl border flex gap-3 items-start ${
        isConnected
          ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
          : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'
      }`}>
        <Database size={20} className={`shrink-0 mt-0.5 ${isConnected ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isConnected ? 'text-indigo-900 dark:text-indigo-200' : 'text-amber-900 dark:text-amber-200'}`}>
            {isConnected ? `Ready to sync with ${activeProviderMeta?.name}` : `${activeProviderMeta?.name} not connected`}
            {isConnected && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800/50">
                <Shield size={9} /> ENCRYPTED
              </span>
            )}
          </h3>
          <p className={`text-xs mt-0.5 ${isConnected ? 'text-indigo-700 dark:text-indigo-300/80' : 'text-amber-700 dark:text-amber-300/80'}`}>
            {isConnected
              ? `Last schema sync: ${lastSyncTime || 'Not yet synced'}. ${activeMappingCount} fields configured. Click "Test Export" to download a CRM import CSV.`
              : `Click "Connect" to link your ${activeProviderMeta?.name} account. Your field mappings are saved and ready.`
            }
          </p>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleTestExport} disabled={loading.export} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap disabled:opacity-50">
              Download Sample →
            </button>
            <button
              onClick={() => handleDisconnect(activeProvider)}
              disabled={loading.connect}
              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 whitespace-nowrap px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <Unlink size={12} /> Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleConnect(activeProvider)}
            disabled={loading.connect}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all shrink-0 disabled:opacity-50"
          >
            {loading.connect ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
            Connect
          </button>
        )}
      </div>

      {/* ── Field Mapping Table ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_44px_1fr_56px] bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div>IntelliScan Field</div>
          <div />
          <div>Destination CRM Field</div>
          <div className="text-center">Status</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800/80">

          {/* Default (system) field rows */}
          {loading.page && fields.length === 0 ? (
            <div className="px-6 py-8 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            fields.map((field, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_44px_1fr_56px] items-center px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
              >
                {/* IntelliScan Field */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                    {field.iscanField}
                    {field.aiEnriched && (
                      <span className="text-[9px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-black border border-purple-100 dark:border-purple-800/50 tracking-wide">
                        AI ENRICHED
                      </span>
                    )}
                    {field.required && (
                      <span className="text-[9px] text-red-500 font-bold">*required</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-semibold">{field.type}</p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-gray-300 dark:text-gray-600">
                  <ArrowRight size={16} />
                </div>

                {/* CRM Field Dropdown */}
                <div>
                  <select
                    value={field.crmField}
                    onChange={e => updateFieldMapping(idx, e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-indigo-500/40 outline-none px-3 py-2 cursor-pointer transition-all"
                  >
                    {crmSchema.length > 0
                      ? crmSchema.map(opt => <option key={opt} value={opt}>{opt}</option>)
                      : <option value={field.crmField}>{field.crmField}</option>
                    }
                  </select>
                </div>

                {/* Status Icon */}
                <div className="flex justify-center">
                  {field.crmField === '-- Do not sync --' ? (
                    <XCircle size={16} className="text-gray-400" />
                  ) : (
                    <Check size={16} className="text-emerald-500" />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Custom Field Rows */}
          {customFields.map(cf => (
            <div
              key={cf.id}
              className="grid grid-cols-[1fr_44px_1fr_56px] items-center px-6 py-4 bg-indigo-50/30 dark:bg-indigo-900/5 border-l-2 border-indigo-300 dark:border-indigo-700"
            >
              <input
                type="text"
                value={cf.iscanField}
                onChange={e => updateCustomField(cf.id, 'iscanField', e.target.value)}
                placeholder="Custom Field Name"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
              />
              <div className="flex justify-center text-gray-300 dark:text-gray-600">
                <ArrowRight size={16} />
              </div>
              <select
                value={cf.crmField}
                onChange={e => updateCustomField(cf.id, 'crmField', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">Select CRM field...</option>
                {crmSchema.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="flex justify-center">
                <button
                  onClick={() => removeCustomField(cf.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Custom Field Button ───────────────────────────────────────── */}
      <button
        onClick={addCustomField}
        className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-4 py-2 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
      >
        <Plus size={15} /> Add Custom Field Mapping
      </button>

      {/* ── Sync Activity Log ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Sync Activity Log</h3>
        {syncLog.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No activity yet. Connect a CRM provider to get started.</p>
        ) : (
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {syncLog.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-gray-400 w-16 shrink-0 pt-0.5">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                  log.status === 'success' ? 'bg-emerald-500' :
                  log.status === 'error'   ? 'bg-red-500'     : 'bg-blue-500'
                }`} />
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Enrichment Banner ──────────────────────────────────────────── */}
      <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/60 dark:border-purple-800/30 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">AI-Enriched Fields Available</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            IntelliScan automatically infers <strong className="text-gray-800 dark:text-gray-200">Industry</strong> and{' '}
            <strong className="text-gray-800 dark:text-gray-200">Seniority Level</strong> during every card scan using Gemini AI.
            These fields are mapped above and sync directly to your CRM — no additional configuration needed.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## PART 3 — IMPORTANT DETAILS TO CHECK

### 3A — Fix the Trash2 import crash (already fixed above)
The existing file has `<Trash2 />` in JSX but `Trash2` is NOT in the import line. The rewrite above imports it correctly from lucide-react.

### 3B — Add missing route in `App.jsx`
Make sure the route is properly registered. Check that this exact line exists in App.jsx:
```jsx
<Route path="/workspace/crm-mapping" element={
  <RoleGuard allowedRoles={['business_admin', 'super_admin']}>
    <AdminLayout role="business_admin"><CrmMappingPage /></AdminLayout>
  </RoleGuard>
} />
```

And the import at the top:
```jsx
import CrmMappingPage from './pages/workspace/CrmMappingPage';
```

### 3C — SQLite ON CONFLICT syntax
The `INSERT ... ON CONFLICT ... DO UPDATE SET` syntax is SQLite 3.24+. If your SQLite version is older, replace with:
```javascript
// Instead of the ON CONFLICT version, use two separate db.run calls:
db.get('SELECT id FROM crm_mappings WHERE workspace_id = ? AND provider = ?', [workspaceId, provider], (err, row) => {
  if (row) {
    db.run('UPDATE crm_mappings SET field_mappings = ?, custom_fields = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(field_mappings), JSON.stringify(custom_fields || []), row.id], cb);
  } else {
    db.run('INSERT INTO crm_mappings (workspace_id, provider, field_mappings, custom_fields) VALUES (?, ?, ?, ?)',
      [workspaceId, provider, JSON.stringify(field_mappings), JSON.stringify(custom_fields || [])], cb);
  }
});
```

### 3D — Workspace ID mapping
If your users table does not have a `workspace_id` column, the backend helper uses `user.id` as a fallback. For proper multi-tenant isolation, make sure `workspace_id` exists and is populated for business_admin users. If your workspace system uses Clerk org IDs, adapt the workspace lookup accordingly.

### 3E — Delete `database.sqlite` and restart
After adding the new `CREATE TABLE` statements, you must delete the existing `database.sqlite` file and restart the server so the new tables are created fresh. The existing `CREATE TABLE IF NOT EXISTS` pattern means existing databases won't get the new tables automatically.

### 3F — Test the full flow in this order:
1. Start backend (`npm run dev` in intelliscan-server)
2. Open `/workspace/crm-mapping`
3. Click "Connect" on Salesforce → should POST to `/api/crm/connect` and update the banner
4. Click "Sync Schema" → should GET `/api/crm/schema` and populate dropdowns with 23+ field options
5. Change a field mapping dropdown
6. Click "Save Mapping" → should POST to `/api/crm/config` and add a log entry
7. Refresh the page → mappings should persist (loaded from DB)
8. Click "Test Export" → should download a real `.csv` file with your workspace's contacts mapped to Salesforce field names
9. Check the Sync Activity Log — all 4 actions above should appear as real DB-persisted entries

---

## PART 4 — FUTURE ENHANCEMENTS (Phase 2)

Once the above is working, these are the production upgrades that real CRM integrations require:

1. **Real OAuth flow for Salesforce:** Instead of `POST /api/crm/connect` simulating a connection, implement the real 3-legged OAuth: redirect to `https://login.salesforce.com/services/oauth2/authorize`, receive callback at `/api/crm/oauth/callback/salesforce`, exchange code for access + refresh tokens, store encrypted tokens in DB.

2. **Real Salesforce Describe API call:** In `getCrmSchema('salesforce')`, replace the static array with a call to `https://[instance].salesforce.com/services/data/v58.0/sobjects/Lead/describe/` using the stored OAuth access token. This returns the actual fields in the customer's Salesforce org (including all custom `__c` fields).

3. **Real-time push sync:** Instead of CSV export, use Salesforce's REST API `POST /services/data/v58.0/sobjects/Lead/` to create Lead records directly on scan. Trigger this from the scan pipeline in `POST /api/scan`.

4. **HubSpot Properties API:** `GET https://api.hubapi.com/crm/v3/properties/contacts` with HubSpot OAuth token returns real property list.

5. **Webhook-based bi-directional sync:** Register a webhook in Salesforce for Lead changes → `/api/crm/webhook/salesforce` → update IntelliScan contact record.
