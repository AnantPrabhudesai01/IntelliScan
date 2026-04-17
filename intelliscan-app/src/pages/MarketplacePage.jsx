import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Download, Cloud, Globe, MessageSquare, Database, ArrowRight, CheckCircle2, Settings2, X, ExternalLink, Zap, RefreshCw, Check, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredToken } from '../utils/auth';

const apps = [
  {
    id: 'salesforce', name: 'Salesforce CRM', icon: Cloud, category: 'CRM', color: 'text-[#00a1e0]', 
    desc: 'Automatically sync parsed business cards as new Leads or Contacts in Salesforce.',
    configFields: ['Salesforce Domain', 'API Key', 'Sync Frequency'],
    badge: 'Auto-sync Active',
  },
  {
    id: 'hubspot', name: 'HubSpot', icon: Globe, category: 'Marketing', color: 'text-[#ff5a5f]', 
    desc: 'Enrich incoming scanned prospects with HubSpot marketing data instantly.',
    configFields: ['HubSpot API Key', 'Pipeline', 'Default Owner'],
    badge: 'Install Required',
  },
  {
    id: 'slack', name: 'Slack Notifications', icon: MessageSquare, category: 'Communication', color: 'text-indigo-400', 
    desc: 'Get a direct message in Slack whenever a VIP contact is scanned at an event.',
    configFields: ['Slack Webhook URL', 'Channel', 'Alert Trigger'],
    badge: 'Active',
  },
  {
    id: 'snowflake', name: 'Snowflake Sync', icon: Database, category: 'Data Warehouse', color: 'text-indigo-400', 
    desc: 'Enterprise data warehouse pipeline. Requires business admin approval.',
    configFields: ['Account Identifier', 'Warehouse', 'Database Schema'],
    badge: 'Approval Required',
  },
  {
    id: 'sheets', name: 'Google Sheets', icon: Database, category: 'Export', color: 'text-emerald-500', 
    desc: 'Real-time appending of scanned contacts to a shared Google Sheet.',
    configFields: ['Sheet ID', 'Tab Name', 'Overwrite Policy'],
    badge: 'Install',
  }
];

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3 animate-slide-in">
      <Check size={16} /> {msg}
    </div>
  );
}

function AppModal({ app, onClose, onInstall, onUninstall, initialConfig }) {
  const [form, setForm] = useState(initialConfig || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onInstall(app.id, form);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <app.icon size={28} className={app.color} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{app.name}</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{app.category} Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="px-8 py-4 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{app.desc}</p>
        </div>

        {/* Configuration Form */}
        <div className="px-8 py-6 space-y-4">
          <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
            {app.installed ? 'Operational Configuration' : 'Sync Orchestration Setup'}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {app.configFields.map(field => (
              <div key={field}>
                <label className="block text-[10px] font-black text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-widest">{field}</label>
                <input
                  type={field.toLowerCase().includes('key') || field.toLowerCase().includes('url') ? 'password' : 'text'}
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={`Enter ${field.toLowerCase()}...`}
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/30">
          {app.installed && (
            <button onClick={() => { onUninstall(app.id); onClose(); }}
              className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
              <X size={14} /> Disconnect App
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving || saved}
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg ${saved ? 'bg-emerald-600 shadow-emerald-500/20' : saving ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}>
              {saved ? <><Check size={16} /> Saved!</> : saving ? <><RefreshCw size={15} className="animate-spin" /> Verifying...</> : app.installed ? <><Settings2 size={15} /> Save Changes</> : <><Zap size={15} /> Link Account</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiDocModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0b1120] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic flex items-center gap-2">
              <Database className="text-indigo-500" /> API Intelligence <span className="text-indigo-500">v2.1</span>
            </h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Data Orchestration</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-gray-300 space-y-3 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
              <div><span className="text-amber-400 font-bold shrink-0">POST</span> <span className="text-indigo-400">/api/v2/webhooks</span></div>
              <span className="text-[9px] font-black text-gray-600 uppercase">Synchronous</span>
            </div>
            <div className="pl-4 text-xs text-gray-500 border-l border-gray-800">Authorization: Bearer {'<YOUR_API_KEY>'}</div>
            <div className="pl-4 text-xs text-gray-500 border-l border-gray-800">Content-Type: application/json</div>
            <pre className="text-emerald-400/80 mt-3 text-[11px] overflow-x-auto leading-relaxed">{JSON.stringify({ 
              event: 'contact.scanned', 
              target_url: 'https://your-app.com/webhook', 
              secret: 'your_secret_key', 
              filters: { 
                has_email: true, 
                min_confidence: 0.85 
              } 
            }, null, 2)}</pre>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { method: 'GET', path: '/v2/contacts', desc: 'List extracted contacts with pagination' },
              { method: 'POST', path: '/v2/scan', desc: 'Submit document for AI OCR processing' },
              { method: 'DELETE', path: '/v2/contacts/{id}', desc: 'GDPR-compliant contact deletion' },
            ].map(ep => (
              <div key={ep.path} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${ep.method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>{ep.method}</span>
                <code className="text-[11px] font-bold text-gray-200">{ep.path}</code>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-8 py-5 border-t border-white/10 flex justify-between items-center bg-white/5">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Rate limit: 2,000 req/min (Pro)</span>
          <Link to="/api-docs"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
            Full Developer Docs <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApiDoc, setShowApiDoc] = useState(false);
  const [toast, setToast] = useState(null);
  const categories = ['All', 'CRM', 'Marketing', 'Communication', 'Data Warehouse', 'Export'];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || {});
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (appId, config) => {
    try {
      const isUpdating = !!integrations[appId];
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ appId, config, isActive: true })
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(prev => ({
          ...prev,
          [appId]: { isActive: true, config }
        }));
        showToast(`${appId.toUpperCase()} ${isUpdating ? 'configuration updated!' : 'connected successfully!'}`);
        return true;
      }
    } catch (err) {
      console.error('Link failed:', err);
    }
    return false;
  };

  const handleUninstall = async (appId) => {
    try {
      await fetch(`/api/integrations/${appId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      setIntegrations(prev => { 
        const copy = { ...prev }; 
        delete copy[appId]; 
        return copy; 
      });
      showToast(`${appId.toUpperCase()} disconnected.`);
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const openApp = (app) => {
    setSelectedApp({ ...app, installed: !!installedApps[app.id] });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 w-full animate-fade-in">
      <Toast msg={toast} />
      {selectedApp && (
        <AppModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
        />
      )}
      {showApiDoc && <ApiDocModal onClose={() => setShowApiDoc(false)} />}

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap size={12} className="text-amber-400" /> Professional Bridge Ecosystem
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline mb-6 tracking-tighter leading-none">Intelligence <span className="text-indigo-200">Marketplace</span></h1>
          <p className="text-indigo-100 text-lg md:text-xl font-medium mb-8 max-w-xl leading-relaxed">Architect your lead-flow. Automatically route extracted intelligence into your enterprise toolstack.</p>
          
          {/* Quick Guide / Workflow logic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { step: '01', title: 'Capture', desc: 'Scan via Web or WhatsApp' },
              { step: '02', title: 'Validate', desc: 'AI extracts verified data' },
              { step: '03', title: 'Synchronize', desc: 'Auto-link to your CRM' }
            ].map(s => (
              <div key={s.step} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="block text-[10px] font-black text-indigo-300 mb-1">{s.step}</span>
                <h4 className="font-bold text-sm mb-0.5">{s.title}</h4>
                <p className="text-[10px] text-indigo-200/60 uppercase font-black">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 w-full md:w-96 focus-within:ring-2 focus-within:ring-white/40 transition-all shadow-inner">
            <Search className="text-indigo-200 ml-3 mr-2 my-auto" size={20} />
            <input
              type="text"
              placeholder="Search intelligence bridges..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-white placeholder-indigo-300 focus:outline-none w-full py-2 font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <Filter size={14} /> Categories
            </h3>
            <div className="flex flex-col gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all
                    ${activeCategory === cat
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl text-white">
            <Star className="text-amber-400 mb-4" size={24} fill="currentColor" />
            <h4 className="font-bold font-headline mb-2">Build Your Own</h4>
            <p className="text-xs text-gray-400 font-body mb-4">Need a custom integration? Use our Developer API to build bespoke connections.</p>
            <button
              onClick={() => setShowApiDoc(true)}
              className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors w-full text-center active:scale-95">
              API Documentation
            </button>
          </div>

          {/* Installed count */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Installed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(installedApps).length} <span className="text-sm font-normal text-gray-400">/ {apps.length} apps</span></p>
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(Object.keys(installedApps).length / apps.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-headline text-gray-900 dark:text-white">
              {activeCategory === 'All' ? 'Popular Apps' : `${activeCategory} Apps`}
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{filteredApps.length} results</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApps.map(app => {
              const isInstalled = !!installedApps[app.id];
              return (
                <div key={app.id} className="group bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform">
                      <app.icon size={28} className={app.color} />
                    </div>
                    {isInstalled ? (
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={12} /> Installed
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        {app.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold font-headline text-gray-900 dark:text-white mb-2">{app.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6 flex-1 leading-relaxed">{app.desc}</p>

                  <button
                    onClick={() => openApp(app)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                      ${isInstalled
                        ? 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 hover:shadow-md border border-indigo-100 dark:border-indigo-800'}`}>
                    {isInstalled ? <><Settings2 size={15} /> Configure App</> : <><Zap size={15} /> Install App <ArrowRight size={16} /></>}
                  </button>
                </div>
              );
            })}

            {/* Add Custom */}
            <div className="group bg-white dark:bg-[#161c28] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer transition-all"
              onClick={() => setShowApiDoc(true)}>
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all mb-4">
                <Plus size={24} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Request Integration</h3>
              <p className="text-xs text-gray-400 mt-1">Don't see your tool? Use our API</p>
            </div>

            {filteredApps.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Download size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No integrations found</h3>
                <p className="text-gray-500 text-sm">We couldn't find any apps matching your current search criteria.</p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('All'); }}
                  className="mt-6 font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-lg hover:bg-indigo-100">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
