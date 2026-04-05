import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Award, Globe, ArrowUpRight, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredToken } from '../utils/auth.js';

export default function SignalsCard() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/signals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSignals(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 animate-pulse">
       <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-6"></div>
       <div className="w-32 h-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4"></div>
       <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 relative overflow-hidden group shadow-xl shadow-indigo-600/5">
      {/* Dynamic Background Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
              <Sparkles size={24} />
           </div>
           <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Intelligence Feed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">REAL-TIME SIGNALS</p>
           </div>
        </div>
        <button onClick={fetchSignals} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-indigo-500 font-bold text-xs uppercase tracking-tighter">
           Sync AI
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        {signals.length === 0 ? (
          <div className="py-10 text-center opacity-40 italic text-sm">Waiting for neural updates...</div>
        ) : (
          signals.map((sig) => (
            <div key={sig.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 group/sig">
              <div className={`p-2.5 rounded-xl border border-white dark:border-gray-800 shadow-sm ${
                sig.type === 'intent' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                sig.type === 'career' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {sig.icon === 'zap' && <Zap size={18} />}
                {sig.icon === 'award' && <Award size={18} />}
                {sig.icon === 'globe' && <Globe size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                   <h4 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight group-hover/sig:text-indigo-500 transition-colors uppercase">{sig.title}</h4>
                   <span className="text-[10px] font-black text-emerald-500 uppercase">Just Now</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{sig.msg}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase">{sig.name} @ {sig.company}</span>
                  <Link to={`/dashboard/contacts?id=${sig.id.split('-')[1]}`} className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-0.5 opacity-0 group-hover/sig:opacity-100 transition-opacity">
                    Action <ArrowUpRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link to="/dashboard/contacts" className="mt-8 block w-full text-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all uppercase tracking-widest border border-gray-100 dark:border-gray-800">
         View All Intelligence Alerts
      </Link>
    </div>
  );
}
