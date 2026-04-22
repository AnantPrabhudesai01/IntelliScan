import React, { useState, useEffect } from 'react';
import { Cpu, Database, Play, Pause, Activity, Plus, Loader2, X, CheckCircle, AlertCircle, Zap, ShieldCheck, PieChart, Info, BarChart3, TrendingDown, Target, Download } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';
import DatasetVisualizer from '../../components/admin/DatasetVisualizer';

export default function CustomModelsPage() {
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState({
    activeInference: 0,
    avgAccuracy: 0,
    globalLatency: 0,
    vramUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', type: 'custom', vram_gb: 8 });
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/admin/models', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
        setStats(data.stats);
      }
    } catch {
      showToast('Failed to fetch AI models', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    const interval = setInterval(fetchModels, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paused' ? 'deployed' : 'paused';
    try {
      const res = await fetch(`/api/admin/models/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentStatus === 'paused' ? 'Model Reactivated' : 'Model Paused');
        fetchModels();
      }
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(newModel)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Deployment Initiated');
        setDeployModalOpen(false);
        fetchModels();
      }
    } catch {
      showToast('Deployment failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-gray-500 font-medium">Synchronizing Engine Cluster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* Custom Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            notification.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-brand-50 border-brand-200 text-brand-800'
          }`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom AI Models</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage fine-tuned Gemini engines specifically trained for niche industry business cards.
          </p>
        </div>
        <button 
          onClick={() => setDeployModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Deploy New Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Cpu size={18} />} 
          label="Active Inference" 
          value={stats.activeInference.toLocaleString()} 
          color="indigo" 
        />
        <StatCard 
          icon={<Activity size={18} />} 
          label="Avg Accuracy" 
          value={`${stats.avgAccuracy}%`} 
          color="green" 
        />
        <StatCard 
          icon={<Activity size={18} />} 
          label="Global Latency" 
          value={`${stats.globalLatency}ms`} 
          color="amber" 
        />
        <StatCard 
          icon={<Database size={18} />} 
          label="VRAM Usage" 
          value={`${stats.vramUsage} GB`} 
          color="rose" 
        />
      </div>

      <DatasetVisualizer />

      {/* Model Performance Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase font-headline">Token Intelligence</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Input vs. Output Efficiency</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <PieChart size={20} />
            </div>
          </div>
          <div className="space-y-6">
             {[
               { name: 'Gemini 2.0 Flash', input: '840k', output: '210k', efficiency: '98.2%' },
               { name: 'Custom Finance V2', input: '1.2M', output: '440k', efficiency: '94.5%' },
               { name: 'Legacy OCR-V1', input: '2.4M', output: '800k', efficiency: '82.1%' },
             ].map(item => (
               <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group hover:border-brand-500/30 transition-all">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest mb-1">{item.name}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">In: {item.input} | Out: {item.output}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black italic tracking-tighter text-brand-500">{item.efficiency}</p>
                    <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Optimal</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-[#0f172a] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group border border-white/5">
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-500/20 blur-[100px] pointer-events-none group-hover:bg-brand-500/30 transition-colors" />
           <div className="relative z-10 space-y-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <Zap size={24} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase font-headline text-white">Engine Velocity Matrix</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Automated Cluster Optimization</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed max-w-sm font-medium">
                  The infrastructure currently achieves <span className="text-white font-bold">84,000 extractions/hr</span> with 99.4% uptime. GPU latency is stabilized at 12ms.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Compute Load</p>
                    <p className="text-xl font-bold italic tracking-tighter">42%</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Cache Hit Rate</p>
                    <p className="text-xl font-bold italic tracking-tighter">88.4%</p>
                 </div>
              </div>

              <button className="w-full py-4 bg-brand-500 hover:bg-brand-400 transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2">
                 Fine-Tune New Cluster <BarChart3 size={14} />
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Model Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Accuracy</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Latency</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">30d Calls</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                       <span className={`w-1.5 h-6 rounded-full ${model.type === 'gemini' ? 'bg-blue-500' : model.type === 'openai' ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                       {model.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${model.status === 'deployed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        model.status === 'training' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 animate-pulse' :
                          'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {model.status === 'deployed' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
                      {model.status === 'training' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>}
                      {model.status === 'paused' && <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                      {model.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {model.status === 'training' ? '—' : `${model.accuracy}%`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {model.status === 'training' ? '—' : `${model.latency_ms}ms`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {model.calls_30d?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleStatus(model.id, model.status)}
                      disabled={model.status === 'training'}
                      className={`p-2 rounded-lg transition-all ${
                        model.status === 'paused' 
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                          : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                      } disabled:opacity-30`}
                      title={model.status === 'paused' ? 'Activate' : 'Pause'}
                    >
                      {model.status === 'paused' ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deploy New AI Engine</h2>
              <button onClick={() => setDeployModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDeploy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Model Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newModel.name}
                  onChange={e => setNewModel({...newModel, name: e.target.value})}
                  placeholder="e.g. Finance Sector v2.1"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Architecture</label>
                  <select 
                    value={newModel.type}
                    onChange={e => setNewModel({...newModel, type: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="gemini">Gemini Flash</option>
                    <option value="openai">GPT-4o Mini</option>
                    <option value="custom">Fine-tuned Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">VRAM (GB)</label>
                  <input 
                    type="number" 
                    value={newModel.vram_gb}
                    onChange={e => setNewModel({...newModel, vram_gb: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setDeployModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
                >
                  Initialize Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    indigo: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-brand-500/30 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${colorMap[color]} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
