import React, { useState } from 'react';
import { Search, Filter, Star, Download, Cloud, Globe, MessageSquare, Database, ArrowRight, CheckCircle2, Settings2, X, ExternalLink, Zap, RefreshCw, Check, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const apps = [
  {
    id: 1, name: 'Salesforce CRM', icon: Cloud, category: 'CRM', color: 'text-[#00a1e0]', installed: true,
    desc: 'Automatically sync parsed business cards as new Leads or Contacts in Salesforce.',
    configFields: ['Salesforce Domain', 'API Key', 'Sync Frequency'],
    configValues: { 'Salesforce Domain': 'intelliscan.my.salesforce.com', 'API Key': 'sf_••••••••••••4f92', 'Sync Frequency': 'Real-time' },
    badge: 'Auto-sync Active',
  },
  {
    id: 2, name: 'HubSpot', icon: Globe, category: 'Marketing', color: 'text-[#ff5a5f]', installed: false,
    desc: 'Enrich incoming scanned prospects with HubSpot marketing data instantly.',
    configFields: ['HubSpot API Key', 'Pipeline', 'Default Owner'],
    configValues: {},
    badge: 'Install Required',
  },
  {
    id: 3, name: 'Slack Notifications', icon: MessageSquare, category: 'Communication', color: 'text-indigo-400', installed: true,
    desc: 'Get a direct message in Slack whenever a VIP contact is scanned at an event.',
    configFields: ['Slack Webhook URL', 'Channel', 'Alert Trigger'],
    configValues: { 'Slack Webhook URL': 'https://hooks.slack.com/T0••••/B••••', 'Channel': '#sales-vip-alerts', 'Alert Trigger': 'VIP tag on scan' },
    badge: 'Active',
  },
  {
    id: 4, name: 'Snowflake Sync', icon: Database, category: 'Data Warehouse', color: 'text-indigo-400', installed: false,
    desc: 'Enterprise data warehouse pipeline. Requires business admin approval.',
    configFields: ['Account Identifier', 'Warehouse', 'Database Schema'],
    configValues: {},
    badge: 'Approval Required',
  },
  {
    id: 5, name: 'Google Sheets', icon: Database, category: 'Export', color: 'text-emerald-500', installed: false,
    desc: 'Real-time appending of scanned contacts to a shared Google Sheet.',
    configFields: ['Sheet ID', 'Tab Name', 'Overwrite Policy'],
    configValues: {},
    badge: 'Install',
  }
];

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3">
      <Check size={16} /> {msg}
    </div>
  );
}

function AppModal({ app, onClose, onInstall, onUninstall }) {
  const [form, setForm] = useState(app.configValues || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); onInstall(app.id, form); }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <app.icon size={28} className={app.color} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</h2>
              <p className="text-sm text-gray-500">{app.category} Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="px-8 py-4 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{app.desc}</p>
        </div>

        {/* Configuration Form */}
        <div className="px-8 py-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
            {app.installed ? 'Configuration' : 'Setup Configuration'}
          </h3>
          {app.configFields.map(field => (
            <div key={field}>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wider">{field}</label>
              <input
                type={field.toLowerCase().includes('key') || field.toLowerCase().includes('url') ? 'password' : 'text'}
                value={form[field] || ''}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={`Enter ${field.toLowerCase()}...`}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
          {app.installed && (
            <button onClick={() => { onUninstall(app.id); onClose(); }}
              className="text-sm text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all">
              Disconnect
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving || saved}
              className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-600' : saving ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {saved ? <><Check size={16} /> Saved!</> : saving ? <><RefreshCw size={15} className="animate-spin" /> Connecting...</> : app.installed ? <><Settings2 size={15} /> Save Config</> : <><Zap size={15} /> Install App</>}
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
      <div className="bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Documentation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6 space-y-4">
          <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-gray-300 space-y-3">
            <div><span className="text-amber-400">POST</span> <span className="text-emerald-400">https://api.intelliscan.ai/v2/webhooks</span></div>
            <div className="pl-4 text-gray-500">Authorization: Bearer {'<YOUR_API_KEY>'}</div>
            <div className="pl-4 text-gray-500">Content-Type: application/json</div>
            <pre className="text-indigo-300 mt-3 text-xs overflow-x-auto">{JSON.stringify({ event: 'contact.scanned', target_url: 'https://your-app.com/webhook', secret: 'your_secret_key', filters: { has_email: true, min_confidence: 0.85 } }, null, 2)}</pre>
          </div>
          {[
            { method: 'GET', path: '/v2/contacts', desc: 'List all extracted contacts with pagination' },
            { method: 'POST', path: '/v2/scan', desc: 'Submit a document for OCR processing' },
            { method: 'DELETE', path: '/v2/contacts/{id}', desc: 'GDPR-compliant contact deletion' },
          ].map(ep => (
            <div key={ep.path} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
              <span className={`text-xs font-bold px-2 py-1 rounded ${ep.method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : ep.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{ep.method}</span>
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">{ep.path}</code>
              <span className="text-xs text-gray-500 ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
        <div className="px-8 py-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
          <span className="text-xs text-gray-400">API v2.1.4 — Rate limit: 2,000 req/min</span>
          <Link to="/api-docs"
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Full Docs <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [installedApps, setInstalledApps] = useState({ 1: true, 3: true });
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApiDoc, setShowApiDoc] = useState(false);
  const [toast, setToast] = useState(null);
  const categories = ['All', 'CRM', 'Marketing', 'Communication', 'Data Warehouse', 'Export'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInstall = (id) => {
    setInstalledApps(prev => ({ ...prev, [id]: true }));
    const app = apps.find(a => a.id === id);
    showToast(`${app?.name} ${installedApps[id] ? 'configuration saved!' : 'installed successfully!'}`);
  };

  const handleUninstall = (id) => {
    setInstalledApps(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    const app = apps.find(a => a.id === id);
    showToast(`${app?.name} disconnected.`);
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
      <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-extrabold font-headline mb-4 tracking-tight">Integration Marketplace</h1>
          <p className="text-indigo-100 text-lg md:text-xl font-body mb-8 max-w-xl">Supercharge your workflow. Connect IntelliScan with the tools your team already uses.</p>
          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 w-full md:w-96 focus-within:ring-2 focus-within:ring-white transition-all">
            <Search className="text-indigo-200 ml-3 mr-2 my-auto" size={20} />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-white placeholder-indigo-200 focus:outline-none w-full py-2 font-medium"
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
