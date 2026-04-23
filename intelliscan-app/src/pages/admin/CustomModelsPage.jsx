import React, { useState, useEffect } from 'react';
import { Cpu, Database, Play, Pause, Activity, Plus, Loader2, X, CheckCircle, AlertCircle, Zap, ShieldCheck, PieChart, Info, BarChart3, TrendingDown, Target, Download } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';
import DatasetVisualizer from '../../components/admin/DatasetVisualizer';

export default function CustomModelsPage() {
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState({
    active_inference: 0,
    avg_accuracy: 95.0,
    global_latency: 450,
    vram_usage: 48.2
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      const token = getStoredToken();
      const [modelsRes, statsRes] = await Promise.all([
        fetch('/api/models', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/models/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (modelsRes.ok) setModels(await modelsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      showToast('Failed to load AI model data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeploy = async (id) => {
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/models/${id}/deploy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Neural Engine successfully switched. Rerouting traffic...');
        fetchData();
      }
    } catch (err) {
      showToast('Deployment failed. Check node connectivity.', 'error');
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Cpu size={18} />} 
          label="Active Inference" 
          value={stats.active_inference?.toLocaleString()} 
          color="indigo" 
        />
        <StatCard 
          icon={<Activity size={18} />} 
          label="Avg Accuracy" 
          value={`${stats.avg_accuracy}%`} 
          color="green" 
        />
        <StatCard 
          icon={<Zap size={18} />} 
          label="Global Latency" 
          value={`${stats.global_latency}ms`} 
          color="amber" 
        />
        <StatCard 
          icon={<Database size={18} />} 
          label="VRAM Usage" 
          value={`${stats.vram_usage} GB`} 
          color="rose" 
        />
      </div>

      <DatasetVisualizer />

      {/* Model Registry List (Now Dynamic) */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold font-headline text-gray-900 dark:text-white px-2">Neural Engine Registry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <div key={model.id} className={`p-6 rounded-3xl border transition-all ${model.is_active ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500 shadow-xl shadow-brand-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{model.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">{model.api_model_id}</p>
                </div>
                {model.is_active && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[8px] font-black uppercase shadow-lg shadow-brand-500/20">Active</span>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Accuracy</span>
                    <span className="text-emerald-500">{model.accuracy}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${model.accuracy}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Latency</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{model.latency_ms}ms</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">VRAM</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{model.vram_gb}GB</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDeploy(model.id)}
                disabled={model.is_active || model.status === 'training'}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  model.is_active 
                    ? 'bg-brand-500/10 text-brand-600 cursor-not-allowed border border-brand-500/20' 
                    : model.status === 'training'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10'
                }`}
              >
                {model.status === 'training' ? 'Model Training...' : model.is_active ? 'Currently Powering Platform' : 'Deploy to Production'}
              </button>
            </div>
          ))}
        </div>
      </div>
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
