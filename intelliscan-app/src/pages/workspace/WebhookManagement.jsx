import { useState, useEffect } from 'react';
import { 
  Webhook, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Info, 
  Terminal,
  Activity,
  Code,
  ExternalLink,
  Zap,
  Globe,
  Settings2,
  MoreHorizontal
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

export default function WebhookManagement() {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHook, setNewHook] = useState({ url: '', event_type: 'on_scan' });
  const [recentEvents] = useState([
    { id: 1, event: 'on_scan', status: 200, time: '2 mins ago', payload: '{"name": "John Doe", "score": 92}' },
    { id: 2, event: 'on_deal_update', status: 200, time: '15 mins ago', payload: '{"contact_id": 45, "stage": "Closed"}' },
    { id: 3, event: 'on_scan', status: 500, time: '1 hour ago', payload: '{"error": "Endpoint timeout"}' },
  ]);

  async function fetchWebhooks() {
    const token = getStoredToken();
    try {
      const res = await fetch('/api/webhooks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHooks(data.hooks || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Webhook fetch failed:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const addWebhook = async () => {
    if (!newHook.url) return;
    const token = getStoredToken();
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newHook)
      });
      if (res.ok) {
        setNewHook({ url: '', event_type: 'on_scan' });
        setIsAddModalOpen(false);
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Add webhook failed:', err);
    }
  };

  const deleteWebhook = async (id) => {
    const token = getStoredToken();
    try {
      await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebhooks();
    } catch (err) {
      console.error('Delete webhook failed:', err);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 font-headline">
            <Webhook className="text-indigo-600" size={36} />
            Webhook Integrations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Trigger real-time automation in Zapier, Slack, or your custom API.</p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Register New Webhook
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVE HOOKS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden min-h-[400px]">
             <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10">
                <h3 className="text-lg font-headline font-black text-gray-900 dark:text-white flex items-center gap-2">
                   <Globe size={18} className="text-indigo-600" />
                   Active Endpoints
                </h3>
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{hooks.length} CONFIGURED</span>
             </div>

             <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {hooks.map(h => (
                   <div key={h.id} className="p-8 group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                      <div className="flex justify-between items-start">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-black text-gray-900 dark:text-white">{h.url}</p>
                               <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${h.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {h.is_active ? 'Active' : 'Paused'}
                               </span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                  <Activity size={10} />
                                  <span>Event: <b className="text-indigo-600 uppercase">{h.event_type}</b></span>
                               </div>
                               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                  <Clock size={10} />
                                  <span>Created: {new Date(h.created_at).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-gray-200">
                               <Settings2 size={16} />
                            </button>
                            <button 
                               onClick={() => deleteWebhook(h.id)}
                               className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-gray-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 shadow-sm"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))}

                {hooks.length === 0 && !loading && (
                   <div className="py-24 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                         <Webhook size={32} />
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">No webhooks registered</p>
                      <p className="text-xs text-gray-500 mt-2">Add a URL to start receiving real-time lead updates.</p>
                   </div>
                )}
             </div>
          </section>

          {/* DOCUMENTATION SNIPPET */}
          <section className="bg-slate-900 text-slate-300 rounded-[2rem] border border-slate-800 shadow-2xl p-8 space-y-6 overflow-hidden">
             <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                      <Code size={18} />
                   </div>
                   <h3 className="font-headline font-black text-white text-lg tracking-tight">API Payload Sample</h3>
                </div>
                <button className="text-[10px] font-black text-slate-500 hover:text-white flex items-center gap-1 uppercase tracking-widest transition-colors">
                   Full API Docs <ExternalLink size={12} />
                </button>
             </header>

             <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80">
                <pre className="text-xs font-mono leading-relaxed text-indigo-300">
{`{
  "event": "on_scan",
  "timestamp": "2026-04-01T19:30:15Z",
  "data": {
    "name": "Jane Cooper",
    "company": "Enterprise AI",
    "score": 94,
    "linkedin_url": "https://linkedin.com/..."
  }
}`}
                </pre>
             </div>
          </section>
        </div>

        {/* RECENT ACTIVITY LOG */}
        <div className="space-y-6">
           <section className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                 <h3 className="text-lg font-headline font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Terminal size={18} className="text-emerald-500" />
                    Delivery Logs
                 </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[600px]">
                 {recentEvents.map(ev => (
                    <div key={ev.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 space-y-3 group hover:border-indigo-500/20 transition-all">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">{ev.event}</span>
                          <span className={`text-[10px] font-black ${ev.status === 200 ? 'text-emerald-500' : 'text-rose-500'}`}>{ev.status} OK</span>
                       </div>
                       <p className="text-[10px] font-mono text-gray-400 truncate bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">{ev.payload}</p>
                       <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{ev.time}</span>
                          <button className="text-[9px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">RETRY EVENT</button>
                       </div>
                    </div>
                 ))}
                 
                 <div className="pt-4 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                       <Activity size={10} className="text-emerald-500 animate-pulse" />
                       Monitoring Live Traffic
                    </p>
                 </div>
              </div>
           </section>

           <div className="bg-indigo-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl shadow-indigo-500/20">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                 <Zap size={24} className="fill-white" />
              </div>
              <div>
                 <h4 className="font-headline font-black text-xl tracking-tight leading-tight">Automate With Zapier</h4>
                 <p className="text-indigo-100 text-xs mt-2 leading-relaxed font-medium">Connect IntelliScan with 5,000+ apps. Instantly sync leads to Slack, Discord, or Google Sheets.</p>
              </div>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                 Browse Templates
              </button>
           </div>
        </div>
      </div>

      {/* ADD WEBHOOK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-300">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-10 space-y-8">
                 <header className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white font-headline">New Endpoint</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Configure a destination for event triggers.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-all">
                       <Plus size={28} className="rotate-45" />
                    </button>
                 </header>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 block">Trigger Event</label>
                       <select 
                         value={newHook.event_type}
                         onChange={(e) => setNewHook({...newHook, event_type: e.target.value})}
                         className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                       >
                          <option value="on_scan">New Lead Scanned (on_scan)</option>
                          <option value="on_deal_update">Deal Stage Updated (on_deal_update)</option>
                          <option value="on_export">Daily Export Ready (on_export)</option>
                       </select>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 block">Destination URL</label>
                       <div className="relative">
                          < Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="https://hooks.zapier.com/..."
                            value={newHook.url}
                            onChange={(e) => setNewHook({...newHook, url: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                          />
                       </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex gap-3">
                       <Info className="text-amber-600 shrink-0" size={18} />
                       <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase">
                          Note: IntelliScan will send a <span className="font-black">POST</span> request with a JSON payload to this endpoint immediately after the event occurs.
                       </p>
                    </div>
                 </div>

                 <div className="pt-2">
                    <button 
                      onClick={addWebhook}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 text-sm uppercase tracking-widest"
                    >
                       Confirm Registration
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
