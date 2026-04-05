import React, { useState } from 'react';
import { History, AlertTriangle, Check, TrendingUp, TrendingDown, Star, RotateCcw, Activity, Zap } from 'lucide-react';

const MODELS_HISTORY = [
  {
    id: 'gemini-1.5-pro-v1.2.0',
    label: 'Gemini 1.5 Pro',
    version: 'v1.2.0',
    hash: '7a92b11',
    badge: 'OCR-V3 PRO',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    deployedAt: 'Oct 24, 2023 14:20',
    accuracy: 98.4,
    latency: 142,
    throughput: '12k/m',
    change: 'JSON Schema optimization',
    trend: 'up',
    icon: Star,
  },
  {
    id: 'gemini-1.5-stable-v1.1.8',
    label: 'Gemini 1.5 Stable',
    version: 'v1.1.8',
    hash: 'b8291c3',
    badge: 'STABLE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    deployedAt: 'Oct 12, 2023 09:15',
    accuracy: 97.88,
    latency: 158,
    throughput: '11k/m',
    change: 'Extended retry logic',
    trend: 'neutral',
    icon: Check,
  },
  {
    id: 'tesseract-v5.4-legacy',
    label: 'Tesseract v5.4',
    version: 'Legacy',
    hash: 'd2201k9',
    badge: 'LEGACY',
    badgeColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    deployedAt: 'Sep 28, 2023 11:45',
    accuracy: 92.12,
    latency: 410,
    throughput: '4k/m',
    change: 'Handwriting recognition',
    trend: 'down',
    icon: History,
  },
];

function ConfirmModal({ title, description, confirmLabel, onConfirm, onClose, danger = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 mx-auto ${danger ? 'bg-red-500/20' : 'bg-indigo-500/20'}`}>
          {danger ? <AlertTriangle size={24} className="text-red-400" /> : <RotateCcw size={24} className="text-indigo-400" />}
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-2">{title}</h2>
        <p className="text-gray-400 text-sm text-center mb-8">{description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-300 bg-white/5 hover:bg-white/10 transition-all border border-white/10">Cancel</button>
          <button onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenAiModelVersioningRollback() {
  const [activeModelId, setActiveModelId] = useState('gemini-1.5-pro-v1.2.0');
  const [history, setHistory] = useState(MODELS_HISTORY);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const activeModel = history.find(m => m.id === activeModelId) || history[0];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const performRollback = (targetModelId, label) => {
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const target = history.find(m => m.id === targetModelId);
    if (!target) return;
    setActiveModelId(targetModelId);

    // Insert rollback event to the history
    const rollbackEntry = {
      ...target,
      id: `rollback-${Date.now()}`,
      label: `${target.label} (Rollback)`,
      deployedAt: now,
      change: `Manual rollback by Super Admin from ${activeModel.label}`,
      badge: 'ROLLBACK',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
    setHistory(prev => [rollbackEntry, ...prev]);
    showToast(`Rolled back to ${label}. System is now routing through the previous stable build.`);
    setConfirm(null);
  };

  const handleEmergencyRollback = () => {
    const stableModel = history.find(m => m.id === 'gemini-1.5-stable-v1.1.8');
    if (stableModel) {
      setConfirm({
        id: stableModel.id,
        label: stableModel.label,
        title: '⚠️ Emergency Rollback',
        description: `This will immediately revert the active engine to ${stableModel.label} (${stableModel.version}). All in-flight processing will be rerouted. Confirm to proceed.`,
        danger: true,
      });
    }
  };

  const handleRevert = (model) => {
    setConfirm({
      id: model.id,
      label: model.label,
      title: `Revert to ${model.label}`,
      description: `This will deactivate ${activeModel.label} and restore ${model.label} (${model.version}). Existing scan jobs will complete on the current engine before switching.`,
      danger: false,
    });
  };

  return (
    <div className="w-full h-full animate-fade-in relative p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-indigo-600 flex items-center gap-3 max-w-sm">
          <Check size={16} /> {toast.msg}
        </div>
      )}
      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.danger ? '🚨 Execute Emergency Rollback' : '↩ Confirm Revert'}
          onConfirm={() => performRollback(confirm.id, confirm.label)}
          onClose={() => setConfirm(null)}
          danger={confirm.danger}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">AI Model Versioning &amp; Rollback</h1>
            <p className="text-gray-400 mt-1 text-sm">Control and monitor the active OCR engine deployment across all global nodes.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-bold uppercase tracking-widest">System Stable</span>
          </div>
        </div>

        {/* Active Model Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Engine */}
          <div className="lg:col-span-4 bg-[#161c28] border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden shadow-lg shadow-indigo-500/5">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded-lg border ${activeModel.badgeColor}`}>{activeModel.badge}</span>
                <h3 className="text-2xl font-bold mt-2 text-white">{activeModel.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{activeModel.version}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-green-400 font-mono font-bold text-sm flex items-center gap-1"><Activity size={12} /> Active</span>
                <span className="text-[10px] text-gray-500">Since deployment</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Accuracy</span><span className="font-bold text-amber-400">{activeModel.accuracy}%</span></div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${activeModel.accuracy}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#0d1117] p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Latency</p>
                  <p className="text-lg font-bold text-white">{activeModel.latency}ms</p>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Throughput</p>
                  <p className="text-lg font-bold text-white">{activeModel.throughput}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tesseract Fallback */}
          <div className="lg:col-span-4 bg-[#161c28] border border-white/5 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-[10px] font-bold tracking-widest uppercase rounded-lg border border-gray-500/20">LEGACY ENGINE</span>
                <h3 className="text-2xl font-bold mt-2 text-white">Tesseract v5.4</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-400 font-mono font-bold text-sm">Standby</span>
                <span className="text-[10px] text-gray-500">Auto-fallback ready</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Accuracy</span><span className="font-bold text-gray-300">92.1%</span></div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: '92.1%' }} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#0d1117] p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Latency</p>
                  <p className="text-lg font-bold text-white">410ms</p>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Throughput</p>
                  <p className="text-lg font-bold text-white">4k/m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stability Score + Emergency */}
          <div className="lg:col-span-4 bg-[#161c28] border border-white/5 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white">Stability Score</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tighter text-white">99.98</span>
                <span className="text-indigo-400 text-xl font-bold">%</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Platform uptime and model inference reliability within SLA bounds.</p>
            </div>
            <div className="mt-6">
              <button onClick={handleEmergencyRollback}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500/30 hover:border-red-600">
                <AlertTriangle size={18} /> EMERGENCY ROLLBACK
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-2">Revert to Gemini 1.5 Stable (Build 8291)</p>
            </div>
          </div>
        </div>

        {/* Deployment History */}
        <div className="bg-[#161c28] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Deployment History &amp; Benchmarks</h2>
            <span className="text-xs text-gray-500">{history.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-4 font-semibold">Engine Version</th>
                  <th className="px-6 py-4 font-semibold">Deployed At</th>
                  <th className="px-6 py-4 font-semibold">Accuracy</th>
                  <th className="px-6 py-4 font-semibold">Change Impact</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((m) => {
                  const isActive = m.id === activeModelId;
                  const Icon = m.icon;
                  return (
                    <tr key={m.id} className={`transition-colors group ${isActive ? 'bg-indigo-600/5' : 'hover:bg-white/5'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                              {m.label} {m.version}
                              {isActive && <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] rounded font-black uppercase border border-indigo-500/30">LIVE</span>}
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">HASH: {m.hash}..</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-400 text-sm">{m.deployedAt}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{m.accuracy}%</span>
                          {m.trend === 'up' && <TrendingUp size={14} className="text-green-400" />}
                          {m.trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] rounded-md border border-white/10">{m.change}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {isActive ? (
                          <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Live Now</span>
                        ) : (
                          <button onClick={() => handleRevert(m)}
                            className="text-xs font-bold text-gray-400 hover:text-white transition-all border border-white/10 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg active:scale-95 hover:bg-indigo-600/10 flex items-center gap-1.5 ml-auto">
                            <RotateCcw size={12} /> Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rollback Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-indigo-600/5 p-8 rounded-2xl border-l-4 border-indigo-500">
            <h4 className="font-bold text-lg text-white mb-2">Automated Rollback Policy</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              System auto-reverts if accuracy drops below <span className="text-indigo-400 font-bold">94.5%</span> or latency exceeds <span className="text-indigo-400 font-bold">600ms</span> for more than 5 minutes.
              Currently active: <span className="text-green-400 font-bold">{activeModel.label}</span>
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-12">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="font-bold text-white">2m ago</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Queue</p>
              <p className="font-bold text-green-400">Optimized</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Deployed</p>
              <p className="font-bold text-white">{history.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}