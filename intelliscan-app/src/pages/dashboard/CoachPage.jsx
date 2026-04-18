import { Target, TrendingUp, MessageSquare, CalendarClock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../../utils/auth';

export default function CoachPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getStoredToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch AI coach insights
        const coachRes = await fetch('/api/coach/insights', { headers });
        const payload = await coachRes.json().catch(() => ({}));
        if (!coachRes.ok) {
          throw new Error(payload?.error || `Failed to load coach insights (HTTP ${coachRes.status})`);
        }
        setInsights(payload);
      } catch (e) {
        console.error('Coach fetch error:', e);
        setError(e?.message || 'Failed to load coach insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const healthScore = insights?.health_score ?? 0;
  const momentumStatus = insights?.momentum_status ?? '';

  const handleAction = (id) => {
    if (id === 'stale') {
      navigate('/dashboard/drafts');
    } else if (id === 'context') {
      navigate('/dashboard/contacts');
    } else {
      navigate('/dashboard/email/sequences');
    }
  };

  const IconMap = {
    stale: <CalendarClock size={20} />,
    industry: <TrendingUp size={20} />,
    context: <MessageSquare size={20} />,
    default: <Target size={20} />
  };

  const colorClassMap = {
    red: {
      card: 'border-red-200 dark:border-red-900/30 border-b-red-500/50',
      iconWrap: 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50',
      icon: 'text-red-600 dark:text-red-400',
      button: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
    },
    emerald: {
      card: 'border-emerald-200 dark:border-emerald-900/30 border-b-emerald-500/50',
      iconWrap: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50',
      icon: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
    },
    blue: {
      card: 'border-blue-200 dark:border-blue-900/30 border-b-blue-500/50',
      iconWrap: 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50',
      icon: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
    },
    indigo: {
      card: 'border-brand-200 dark:border-brand-900/30 border-b-brand-500/50',
      iconWrap: 'bg-brand-50 dark:bg-brand-900/30 border-brand-100 dark:border-brand-800/50',
      icon: 'text-brand-600 dark:text-brand-400',
      button: 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800/50'
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-10 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-6">
          <p className="font-bold mb-1">Could not load AI Coach insights</p>
          <p className="text-sm opacity-90">{error}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
              Retry
            </button>
            <button onClick={() => navigate('/dashboard/scan')} className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-sm hover:brightness-110 transition-all">
              Back to Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 font-headline">
            AI Networking Coach <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Beta</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Our AI continuously analyzes your CRM interactions and scanned business cards to surface high-value networking opportunities.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-[#161c28] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-brand-500/5">
           <div className="relative w-16 h-16 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-100 dark:text-gray-800" />
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * healthScore) / 100} className="text-brand-500 transition-all duration-1000" strokeLinecap="round"/>
             </svg>
             <span className="absolute text-sm font-black text-gray-900 dark:text-white">{healthScore}</span>
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Network Health</p>
             <p className="text-sm font-bold text-gray-900 dark:text-brand-400">{momentumStatus}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(insights?.actions || []).map((action, idx) => {
          const palette = colorClassMap[action.color] || colorClassMap.indigo;
          return (
            <div key={idx} className={`bg-white dark:bg-[#161c28] border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border-b-4 ${palette.card}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Target size={64} className={palette.icon} />
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${palette.iconWrap} ${palette.icon}`}>
                {IconMap[action.id] || IconMap.default}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 relative z-10 leading-relaxed min-h-[60px]">
                {action.description}
              </p>
              <button 
                onClick={() => handleAction(action.id)}
                className={`w-full py-2.5 text-sm font-bold rounded-xl transition-colors border flex items-center justify-center gap-2 ${palette.button}`}
              >
                {action.cta}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Target size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Unlock Premium Insights</h2>
          <p className="text-brand-100 text-sm mb-6 leading-relaxed">
            Upgrade to the Professional Plan to unlock real-time CRM syncing, deep industry trend analysis, and automated follow-up scheduling for your entire workspace.
          </p>
          <button className="bg-white text-brand-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-50 transition-colors shadow-lg">
            View Upgrade Options
          </button>
        </div>
      </div>
    </div>
  );
}
