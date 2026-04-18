import { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, Activity, ShieldCheck, RefreshCw, Layers, Copy, CheckCircle2, AlertCircle, ExternalLink, Key } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import toast from 'react-hot-toast';

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks', {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setWebhooks(data.hooks || []);
      }
    } catch (err) {
      console.error('Fetch webhooks failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ url: newUrl, event_type: 'on_scan' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Integration gateway established!', {
          style: { borderRadius: '10px', background: '#21132E', color: '#fff' }
        });
        setNewUrl('');
        fetchWebhooks();
      }
    } catch (err) {
      toast.error('Registration failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to decouple this integration?')) return;
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        toast.success('Integration removed');
        fetchWebhooks();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Secret Key copied to clipboard', {
      icon: '🔐',
      style: { borderRadius: '10px', background: '#111827', color: '#fff' }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] flex items-center justify-center">
         <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] p-6 md:p-10 space-y-10 animate-fade-in transition-colors duration-500">
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
               <Share2 className="text-white" size={20} />
             </div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Integration Gateway</h1>
           </div>
           <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl font-medium">
             Synchronize real-time networking data with your external CRM, Slack, or custom automation pipelines using secure Enterprise Webhooks.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-brand-100 dark:border-brand-800">
             <ShieldCheck size={16} /> HMCA-SHA256 Signed
           </div>
        </div>
      </header>

      {/* Register New Webhook */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl relative z-10">
         <form onSubmit={handleRegister} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <input 
                  type="url" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://your-api.com/webhooks/intelliscan"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                  required
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <ExternalLink size={18} />
               </div>
            </div>
            <button 
              type="submit"
              className="px-8 py-4 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <Plus size={18} /> Establish Integration
            </button>
         </form>
         <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 px-2">
            <AlertCircle size={12} /> Payloads are delivered as JSON POST requests with a 5-second timeout.
         </p>
      </div>

      {/* Webhook Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
         
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white items-center gap-2 flex">
               <Layers size={18} className="text-brand-500" /> Active Integration Endpoints
            </h3>
            
            {webhooks.length === 0 ? (
               <div className="p-12 bg-white/50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] text-center italic text-gray-400 text-sm">
                  No active integrations found. Register your first endpoint above.
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-4">
                  {webhooks.map((hook) => (
                     <div key={hook.id} className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active & Monitoring</p>
                              </div>
                              <p className="font-black text-gray-900 dark:text-white truncate text-base mb-3">{hook.url}</p>
                              
                              <div className="flex flex-wrap gap-2">
                                 <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500">
                                    Event: {hook.event_type}
                                 </span>
                                 <button 
                                    onClick={() => copyToClipboard(hook.secret_key)}
                                    className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-600 flex items-center gap-1 hover:bg-brand-100 transition-colors"
                                 >
                                    <Key size={10} /> Reveal Secret Key
                                 </button>
                              </div>
                           </div>
                           
                           <button 
                              onClick={() => handleDelete(hook.id)}
                              className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Delivery Performance Sidebar */}
         <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white items-center gap-2 flex">
               <Activity size={18} className="text-emerald-500" /> System Delivery Metrics
            </h3>
            
            <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl space-y-8">
               <div className="text-center">
                  <p className="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">98.4%</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Success Rate</p>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: '98.4%' }}></div>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-gray-400 uppercase">Avg Latency</span>
                     <span className="text-xs font-black text-gray-900 dark:text-white italic">420ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-gray-400 uppercase">Total Deliveries</span>
                     <span className="text-xs font-black text-gray-900 dark:text-white italic">12.4k</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-gray-400 uppercase">Retries Pending</span>
                     <span className="text-xs font-black text-emerald-500 italic uppercase">Healthy</span>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-200 dark:border-amber-900/30">
               <div className="flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-amber-600 shrink-0" />
                  <div>
                     <p className="text-[10px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest">Developer Note</p>
                     <p className="text-[11px] text-amber-700/80 dark:text-amber-600 font-medium leading-relaxed mt-1">
                        We send the <code>X-IntelliScan-Signature</code> header. Use your Secret Key to perform HMAC-SHA256 validation on the raw request body.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
