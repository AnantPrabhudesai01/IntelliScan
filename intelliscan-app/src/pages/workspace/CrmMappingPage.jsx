import { useState, useEffect, useCallback } from 'react';
import {
  Database, RefreshCw, ArrowRight, Save, Check, Plus,
  Globe, Plug, Shield, Sparkles, XCircle, Trash2,
  CheckCircle2, AlertCircle, Loader2, Link2, Unlink
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

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

  const token = () => getStoredToken();

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
          {totalContacts !== null && (
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">
              Total contacts available for export: {Number(totalContacts).toLocaleString()}
            </p>
          )}
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
