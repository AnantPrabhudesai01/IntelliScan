import { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, RefreshCw, Layers, Settings, Play, Pause, Power, BarChart3, AlertCircle } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import toast from 'react-hot-toast';

export default function GenAiTrainingTuningSuperAdmin() {
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState({ activeInference: 0, avgAccuracy: 0, globalLatency: 0, vramUsage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/admin/models', {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleStatusUpdate = async (modelId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/models/${modelId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Model status updated to ${newStatus}`, {
           style: { borderRadius: '10px', background: '#21132E', color: '#fff', fontSize: '13px' }
        });
        fetchModels();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error('Failed to update model: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] flex items-center justify-center">
         <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] p-6 md:p-10 space-y-10 animate-fade-in relative transition-colors duration-500">
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
               <Cpu className="text-white" size={20} />
             </div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Model Governance</h1>
           </div>
           <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl font-medium">
             Manage AI inference engines, monitor latency distribution, and control model deployment pipelines across the IntelliScan ecosystem.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={fetchModels} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-600 transition-all active:scale-95 shadow-sm">
             <RefreshCw size={20} />
           </button>
           <div className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
             <ShieldCheck size={16} /> Super Admin Authorized
           </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 font-bold">
           <AlertCircle size={24} />
           <p>{error}</p>
        </div>
      )}

      {/* Aggregate Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: Zap, label: 'Active Inference (30d)', value: stats.activeInference.toLocaleString(), color: 'indigo' },
          { icon: BarChart3, label: 'Average Accuracy', value: `${stats.avgAccuracy}%`, color: 'emerald' },
          { icon: Activity, label: 'Global Latency (ms)', value: stats.globalLatency, color: 'amber' },
          { icon: Settings, label: 'VRAM Resource Footprint', value: `${stats.vramUsage} GB`, color: 'purple' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
            <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center mb-6`}>
               <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Model Control Table */}
      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
           <div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
               <Layers size={20} className="text-brand-600" /> System Model Inventory
             </h3>
             <p className="text-xs text-gray-500 font-medium mt-0.5">Manage the operational status of core Intelligence engines.</p>
           </div>
           <button className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 hover:scale-105 active:scale-95 transition-all">
              Initialize New Model
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                  <th className="px-8 py-5">Model Identity</th>
                  <th className="px-8 py-5">Engine Type</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Performance</th>
                  <th className="px-8 py-5 text-right">Goverance Controls</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center font-black ${model.status === 'deployed' ? 'from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' : 'from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-500'}`}>
                           {model.name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{model.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {model.id}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-600 dark:text-gray-400">
                       {model.type}
                    </td>
                    <td className="px-8 py-6">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         model.status === 'deployed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                         model.status === 'training' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' :
                         'bg-gray-200 dark:bg-gray-800 text-gray-500'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${model.status === 'deployed' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`}></span>
                         {model.status}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center gap-1">
                          <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500" style={{ width: `${model.accuracy}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-gray-500">{model.accuracy}% Acc | {model.latency_ms}ms</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(model.id, 'deployed')}
                            className={`p-2 rounded-lg transition-all ${model.status === 'deployed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-500 shadow-sm'}`}
                            title="Deploy Model"
                          >
                             <Play size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(model.id, 'paused')}
                            className={`p-2 rounded-lg transition-all ${model.status === 'paused' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500 shadow-sm'}`}
                            title="Pause Model"
                          >
                             <Pause size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(model.id, 'training')}
                            className={`p-2 rounded-lg transition-all ${model.status === 'training' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-brand-600 shadow-sm'}`}
                            title="Start Training"
                          >
                             <Power size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-brand-50 dark:bg-brand-950/30 rounded-[2.5rem] border border-brand-200 dark:border-brand-800/50 flex gap-4 items-start relative z-10 shadow-lg shadow-brand-500/5">
         <ShieldCheck size={28} className="text-brand-500 shrink-0 mt-1" />
         <div>
            <h4 className="font-black text-brand-800 dark:text-brand-400 text-sm italic uppercase tracking-tighter">Governance Protocol 04-A</h4>
            <p className="text-xs text-brand-700/80 dark:text-brand-500 leading-relaxed mt-1">
              Any model with accuracy below <strong>90%</strong> should be set to <code>TRAINING</code> mode. Switching models in <code>PRODUCTION</code> environment will cause a 200ms latency spike globally for approximately 3 seconds while inference caches are invalidated.
            </p>
         </div>
      </div>
    </div>
  );
}
