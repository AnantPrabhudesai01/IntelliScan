import React, { useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, MoreVertical, Shield, Zap, Download, ExternalLink, AlertTriangle, X } from 'lucide-react';

function generateApiKey(type = 'live') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `is_${type}_••••••••${suffix}`;
}

function NewKeyModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('live');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: Date.now(),
      name: name.trim(),
      snippet: generateApiKey(type),
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      type,
      status: 'online'
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center"><Key size={18} className="text-indigo-400" /></div>
            <h2 className="text-xl font-bold text-white">Generate New Key</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Key Name *</label>
            <input autoFocus required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Production_Node_02" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Environment</label>
            <div className="grid grid-cols-2 gap-3">
              {['live', 'test'].map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all capitalize ${type === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0d1117] border-white/10 text-gray-400 hover:border-indigo-500/50'}`}>
                  {t === 'live' ? '🟢 Live / Production' : '🔵 Test / Sandbox'}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">Your new key will only be shown once. Make sure to copy and store it securely immediately after creation.</p>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
            <Key size={18} /> Generate Key
          </button>
        </form>
      </div>
    </div>
  );
}

const INITIAL_KEYS = [
  { id: 1, name: 'Production_Node_01', snippet: 'is_live_••••••••3f92', created: 'Oct 12, 2023', lastUsed: '2 mins ago', type: 'live', status: 'online' },
  { id: 2, name: 'Development_Sandbox', snippet: 'is_test_••••••••a4k2', created: 'Sep 28, 2023', lastUsed: 'Never', type: 'test', status: 'offline' },
  { id: 3, name: 'Mobile_App_Staging', snippet: 'is_live_••••••••81v9', created: 'Aug 04, 2023', lastUsed: '4 days ago', type: 'live', status: 'online' },
];

export default function GenApiIntegrations() {
  const [apiKeys, setApiKeys] = useState(INITIAL_KEYS);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = (key) => {
    setApiKeys(prev => [key, ...prev]);
    showToast(`Key "${key.name}" generated successfully!`);
  };

  const handleDelete = (id, name) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    setMenuOpen(null);
    showToast(`Key "${name}" revoked.`, 'error');
  };

  const handleCopy = (snippet, id) => {
    navigator.clipboard.writeText(snippet.replace(/•/g, '*')).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadSDK = (name) => {
    const content = `// IntelliScan ${name}\n// Install: npm install @intelliscan/sdk\n// Usage:\nconst intelliscan = require('@intelliscan/sdk');\nconst client = new intelliscan.Client({ apiKey: 'YOUR_KEY' });\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelliscan_${name.toLowerCase().replace(/\s/g, '_')}.js`;
    a.click();
  };

  return (
    <div className="w-full h-full animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <Trash2 size={16} /> : <Check size={16} />} {toast.msg}
        </div>
      )}
      {showModal && <NewKeyModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      <div className="max-w-6xl mx-auto space-y-10 p-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">API Keys &amp; Integrations</h1>
            <p className="text-gray-400 mt-2">Manage programmatic access to your IntelliScan node and configure webhooks.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            <Plus size={18} /> Generate New Key
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Keys Table */}
          <div className="col-span-12 lg:col-span-8 bg-[#161c28] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Active API Keys</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">{apiKeys.length} Total</span>
            </div>

            {apiKeys.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Key size={40} className="mx-auto mb-4 opacity-30" />
                <p>No API keys yet. Generate one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                      <th className="pb-2 pl-4">Name</th>
                      <th className="pb-2">Key Snippet</th>
                      <th className="pb-2">Created</th>
                      <th className="pb-2">Last Used</th>
                      <th className="pb-2 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map(key => (
                      <tr key={key.id} className="bg-[#0d1117] hover:bg-white/5 transition-all group">
                        <td className="py-4 pl-4 rounded-l-xl">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${key.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                            <span className="font-bold text-white text-sm">{key.name}</span>
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${key.type === 'live' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>{key.type}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-gray-400 font-mono text-xs">{key.snippet}</code>
                            <button onClick={() => handleCopy(key.snippet, key.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-400 text-gray-500 transition-all">
                              {copied === key.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-gray-400 text-sm">{key.created}</td>
                        <td className="py-4 text-gray-400 text-sm italic">{key.lastUsed}</td>
                        <td className="py-4 pr-4 text-right rounded-r-xl relative">
                          <button onClick={() => setMenuOpen(menuOpen === key.id ? null : key.id)}
                            className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === key.id && (
                            <div className="absolute right-4 top-full mt-1 z-50 bg-[#1a2035] border border-white/10 rounded-xl shadow-2xl w-36 overflow-hidden">
                              <button onClick={() => handleCopy(key.snippet, key.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left text-gray-300 hover:bg-white/10">
                                <Copy size={12} /> Copy Key
                              </button>
                              <button onClick={() => handleDelete(key.id, key.name)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/10">
                                <Trash2 size={12} /> Revoke Key
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Developer SDKs */}
            <div className="bg-[#161c28] border border-white/5 rounded-xl p-6">
              <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-indigo-400" /> Developer SDKs
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Node.js Library', icon: '🟩', action: () => handleDownloadSDK('NodeJS') },
                  { name: 'Python Client', icon: '🐍', action: () => handleDownloadSDK('Python') },
                  { name: 'Postman Collection', icon: '🗂️', action: () => window.open('https://postman.com', '_blank') },
                ].map(({ name, icon, action }) => (
                  <button key={name} onClick={action}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] hover:bg-white/5 transition-all group w-full border border-white/5 hover:border-indigo-500/30">
                    <div className="flex items-center gap-3">
                      <span>{icon}</span>
                      <span className="text-sm font-medium text-gray-300">{name}</span>
                    </div>
                    {name.includes('Postman') ? <ExternalLink size={14} className="text-gray-500 group-hover:text-indigo-400" /> : <Download size={14} className="text-gray-500 group-hover:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* API Performance */}
            <div className="bg-[#161c28] border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={18} className="text-amber-400" />
                <span className="font-bold text-white">API Performance</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs text-gray-400">Uptime (30d)</span>
                  <span className="text-sm font-bold text-white">99.98%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '99.9%' }} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xs text-gray-400">Avg. Latency</span>
                  <span className="text-sm font-bold text-white">142ms</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xs text-gray-400">Active Keys</span>
                  <span className="text-sm font-bold text-green-400">{apiKeys.filter(k => k.status === 'online').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}