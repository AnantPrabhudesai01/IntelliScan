import { useState, useEffect, useCallback } from 'react';
import {
  Database, RefreshCw, ArrowRight, Save, Check, Plus,
  Globe, Plug, Shield, Sparkles, XCircle, Trash2,
  CheckCircle2, AlertCircle, Loader2, Link2, Unlink
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import ConfirmationModal from '../../components/common/ConfirmationModal';

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
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    error:   'bg-red-500/10 border-red-500/20 text-red-500',
    info:    'bg-[var(--brand)]/10 border-[var(--brand)]/20 text-[var(--brand)]',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Sparkles;

  return (
    <div className={`fixed top-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-[10px] font-black uppercase tracking-widest max-w-sm animate-fade-in premium-grain ${styles[type]}`}>
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-40 hover:opacity-100 transition-opacity p-1">
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

  // Disconnect Modal State
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [pendingDisconnectProvider, setPendingDisconnectProvider] = useState(null);

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
    setPendingDisconnectProvider(provider);
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = async () => {
    if (!pendingDisconnectProvider) return;
    const provider = pendingDisconnectProvider;
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
      setShowDisconnectModal(false);
      setPendingDisconnectProvider(null);
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
      <div className="max-w-5xl mx-auto flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-6">
          <Loader2 size={40} className="animate-spin text-[var(--brand)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] animate-pulse">Syncing Mapping Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      <ConfirmationModal 
        isOpen={showDisconnectModal}
        title="Disconnect CRM"
        message={`Are you sure you want to disconnect ${CRM_PROVIDERS.find(p => p.id === pendingDisconnectProvider)?.name}? Your mapping configuration will be preserved, but automatic syncing will stop immediately.`}
        confirmText="Disconnect Now"
        type="warning"
        onConfirm={confirmDisconnect}
        onCancel={() => setShowDisconnectModal(false)}
      />

      {/* Toast */}
      {toast && (
        <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-[var(--brand)]/10 rounded-2xl border border-[var(--brand)]/20 shadow-inner">
               <Database size={24} className="text-[var(--brand)]" />
             </div>
             <div>
               <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Data Matrix</h1>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">CRM Infrastructure Bridge</p>
             </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
             Map IntelliScan's AI-extracted neural patterns — including enriched Industry and Seniority data — to your external CRM schema. Precise synchronization active.
          </p>
          {totalContacts !== null && (
            <div className="flex items-center gap-3 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse"></span>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-main)]">
                {Number(totalContacts).toLocaleString()} Atomic Ingested Nodes
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncSchema}
            disabled={loading.sync}
            className="flex items-center gap-3 px-6 py-3 border border-[var(--border-subtle)] bg-[var(--surface-card)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:border-[var(--brand)]/30 hover:text-[var(--brand)] transition-all disabled:opacity-50"
          >
            {loading.sync ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {loading.sync ? 'Syncing...' : 'Handshake Schema'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading.save}
            className="flex items-center gap-3 px-8 py-3.5 bg-[var(--brand)] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all italic font-headline"
          >
            {loading.save ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {loading.save ? 'Commit Matrix' : 'Apply Mapping'}
          </button>
        </div>
      </div>

      {/* ── Provider Tabs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CRM_PROVIDERS.map(provider => {
          const connected = providerStatus[provider.id];
          const isActive = activeProvider === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={`relative flex flex-col items-start gap-3 p-6 rounded-[2rem] border text-left transition-all overflow-hidden premium-grain ${
                isActive
                  ? 'border-[var(--brand)] bg-[var(--brand)]/[0.03] shadow-lg shadow-[var(--brand)]/5'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--text-muted)] group'
              }`}
            >
              {isActive && <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--brand)]/10 rounded-bl-[2rem] flex items-center justify-center"><Check size={20} className="text-[var(--brand)]" /></div>}
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ring-4 ${provider.ring} ${provider.dotColor} ${connected ? 'animate-pulse' : 'opacity-30'}`} />
                <span className="text-[12px] font-black uppercase tracking-tighter text-[var(--text-main)]">{provider.name}</span>
              </div>
              
              <div className="space-y-1">
                 <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${connected ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                   {connected ? 'Active Pipeline' : 'Disconnected'}
                 </p>
                 <p className="text-[10px] text-[var(--text-muted)] font-medium group-hover:text-[var(--text-main)] transition-colors">
                    {connected ? 'Sync engaged' : 'Connect node'}
                 </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Connection Status Banner ──────────────────────────────────────── */}
      <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row gap-8 items-center justify-between premium-grain ${
        isConnected
          ? 'bg-[var(--brand)]/[0.03] border-[var(--brand)]/20 shadow-xl shadow-[var(--brand)]/5'
          : 'bg-amber-500/[0.03] border-amber-500/20'
      }`}>
        <div className="flex gap-6 items-start">
          <div className={`p-5 rounded-3xl shrink-0 ${isConnected ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : 'bg-amber-500/10 text-amber-500'}`}>
            <Globe size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap">
              <h3 className={`text-xl font-headline font-black italic uppercase tracking-tight ${isConnected ? 'text-[var(--text-main)]' : 'text-amber-500'}`}>
                {isConnected ? `${activeProviderMeta?.name} Connected` : `${activeProviderMeta?.name} Node Offline`}
              </h3>
              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                   <Shield size={10} className="text-emerald-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">ENCRYPTED TUNNEL</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
              {isConnected
                ? `Active pipeline established. Last protocol handshake: ${lastSyncTime || 'Pending'}. ${activeMappingCount} field vectors configured for atomic transport.`
                : `Pipeline inactive. Click "Engage Node" to establish a secure handshake with your ${activeProviderMeta?.name} infrastructure.`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <button
                onClick={handleTestExport}
                disabled={loading.export}
                className="flex items-center gap-3 px-6 py-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading.export ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {loading.export ? 'Transporting...' : 'Raw CSV Dump'}
              </button>
              <button
                onClick={() => handleDisconnect(activeProvider)}
                disabled={loading.connect}
                className="flex items-center gap-3 px-6 py-3 border border-red-500/30 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                <Unlink size={14} /> Sever Link
              </button>
            </>
          ) : (
            <button
              onClick={() => handleConnect(activeProvider)}
              disabled={loading.connect}
              className="flex items-center gap-4 px-10 py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all font-headline italic"
            >
              {loading.connect ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              Engage Node
            </button>
          )}
        </div>
      </div>

      {/* ── Field Mapping Table ───────────────────────────────────────────── */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-2xl overflow-hidden premium-grain">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_64px_1fr_80px] bg-[var(--surface)] text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.25em] border-b border-[var(--border-subtle)] px-10 py-6">
          <div>IntelliScan Vector</div>
          <div />
          <div>Destination Field</div>
          <div className="text-center">Status</div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {loading.page && fields.length === 0 ? (
            <div className="px-10 py-20 flex flex-col items-center justify-center gap-6 opacity-30">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Schema Data...</p>
            </div>
          ) : (
            fields.map((field, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_64px_1fr_80px] items-center px-10 py-8 hover:bg-[var(--brand)]/[0.02] transition-colors group"
              >
                {/* IntelliScan Field */}
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-[13px] font-bold text-[var(--text-main)] tracking-tight">
                      {field.iscanField}
                    </p>
                    {field.aiEnriched && (
                      <div className="bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        AI Neural
                      </div>
                    )}
                    {field.required && (
                      <span className="text-[8px] text-red-500 font-black uppercase tracking-widest italic animate-pulse">Required</span>
                    )}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1.5 opacity-60">Type: {field.type}</p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors group-hover:translate-x-1 duration-500">
                  <ArrowRight size={20} className="opacity-40" />
                </div>

                {/* CRM Field Dropdown */}
                <div>
                  <select
                    value={field.crmField}
                    onChange={e => updateFieldMapping(idx, e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)]/40 outline-none px-5 py-3.5 cursor-pointer transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
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
                    <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] opacity-30">
                       <XCircle size={14} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                       <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Custom Field Rows */}
          {customFields.map(cf => (
            <div
              key={cf.id}
              className="grid grid-cols-[1fr_64px_1fr_80px] items-center px-10 py-8 bg-[var(--brand)]/[0.04] border-l-4 border-[var(--brand)] group"
            >
              <div className="relative">
                <input
                  type="text"
                  value={cf.iscanField}
                  onChange={e => updateCustomField(cf.id, 'iscanField', e.target.value)}
                  placeholder="Atomic Vector Name"
                  className="bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 w-full shadow-inner"
                />
              </div>
              <div className="flex justify-center text-[var(--brand)] group-hover:translate-x-1 duration-500">
                <ArrowRight size={20} className="opacity-40" />
              </div>
              <div className="relative">
                <select
                  value={cf.crmField}
                  onChange={e => updateCustomField(cf.id, 'crmField', e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                >
                  <option value="">Select Target...</option>
                  {crmSchema.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => removeCustomField(cf.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Custom Field Button ───────────────────────────────────────── */}
      <button
        onClick={addCustomField}
        className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand)] hover:brightness-110 transition-all px-8 py-4 border border-dashed border-[var(--brand)]/30 rounded-[1.5rem] hover:bg-[var(--brand)]/5 w-full justify-center group"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus size={16} />
        </div>
        Extend Field Matrix
      </button>

      {/* ── Sync Activity Log ─────────────────────────────────────────────── */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-xl premium-grain">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8 flex items-center gap-3">
          <RefreshCw size={14} className="text-[var(--brand)]" /> Pipeline Activity Log
        </h3>
        {syncLog.length === 0 ? (
          <div className="text-center py-10 space-y-4 opacity-30">
             <Code2 size={40} strokeWidth={1} className="mx-auto" />
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Awaiting Infrastructure Handshake...</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-80 overflow-y-auto pr-6 custom-scrollbar">
            {syncLog.map(log => (
              <div key={log.id} className="flex items-start gap-6 group">
                <div className="font-headline font-black italic text-[var(--text-muted)] text-[14px] w-16 mb-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ring-4 ${
                  log.status === 'success' ? 'bg-emerald-500 ring-emerald-500/10' :
                  log.status === 'error'   ? 'bg-red-500 ring-red-500/10'     : 'bg-[var(--brand)] ring-[var(--brand)]/10'
                }`} />
                <div className="flex-1 space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{log.status === 'success' ? 'Protocol Success' : log.status === 'error' ? 'Handshake Failed' : 'Sync Request'}</p>
                   <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Enrichment Banner ──────────────────────────────────────────── */}
      <div className="bg-purple-500/[0.03] border border-purple-500/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 premium-grain">
        <div className="w-24 h-24 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
          <Sparkles size={48} className="text-purple-500" strokeWidth={1} />
        </div>
        <div className="space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-headline font-black italic uppercase tracking-tight text-purple-500">Neural Enrichment Active</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/60">Advanced Gemini AI Inference</p>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed max-w-2xl font-medium">
            IntelliScan automatically infers <strong className="text-[var(--text-main)] uppercase tracking-widest text-[10px]">Industry</strong> and{' '}
            <strong className="text-[var(--text-main)] uppercase tracking-widest text-[10px]">Seniority Level</strong> during every card scan.
            These neural vectors are pre-mapped for atomic transport — ensuring your CRM receives a high-fidelity data profile automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
