import { Zap, Shield, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth.js';

export default function SignalsPage() {
  const [stats, setStats] = useState({ accuracy: '--%', alerts: 0, conversations: 0 });

  useEffect(() => {
    fetch('/api/analytics/signals', {
      headers: { 'Authorization': `Bearer ${getStoredToken()}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.accuracy) setStats(data);
    })
    .catch(err => console.error('Failed to fetch signals stats:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Intelligence Center <span className="bg-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-widest">Real-Time Signals</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Monitor your networking landscape. Our AI continuously analyzes your contacts for promotion alerts, job changes, and buying intent signals.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
           <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
           <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Enterprise Monitoring Active</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-10">
          <SignalsCard />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex gap-4 items-start max-w-xl">
             <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
               <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />
             </div>
             <div>
               <h4 className="font-bold text-gray-900 dark:text-white text-sm">Strategic Intelligence Tip</h4>
               <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                 Signals are updated every 6 hours by scraping public data and news. "Buying Intent" is detected when a company announces a funding round or a major tech stake change in your saved industry.
               </p>
             </div>
           </div>
           
           <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
             Configure Alert Rules
           </button>
        </div>
      </div>

      {/* Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signal Accuracy</p>
             <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.accuracy}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alerts This Week</p>
             <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.alerts}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conversations Started</p>
             <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.conversations}</p>
          </div>
      </div>
    </div>
  );
}
