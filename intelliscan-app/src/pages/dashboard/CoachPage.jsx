import { Target, TrendingUp, MessageSquare, CalendarClock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../../utils/auth';

const fallbackInsights = {
  health_score: 42,
  momentum_status: 'Stable Growth',
  actions: [
    {
      id: 'stale',
      title: 'Re-activate Stale Contacts',
      description: 'Several contacts have gone cold. Generate AI follow-ups to restart conversations and reduce pipeline decay.',
      cta: 'Open AI Drafts',
      color: 'red'
    },
    {
      id: 'industry',
      title: 'Strategic Industry Focus',
      description: 'Your strongest cluster is visible. Launch a tailored outreach sequence to convert the highest-value segment faster.',
      cta: 'Create Template',
      color: 'indigo'
    },
    {
      id: 'context',
      title: 'Complete Missing Context',
      description: 'A subset of contacts is missing role, company, or email fields. Filling this context improves routing and campaign quality.',
      cta: 'Review Contacts',
      color: 'blue'
    }
  ]
};

export default function CoachPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(fallbackInsights);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getStoredToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch AI coach insights
        const coachRes = await fetch('/api/coach/insights', { headers });
        if (coachRes.ok) {
          const payload = await coachRes.json();
          setInsights(payload?.actions?.length ? payload : fallbackInsights);
        }
      } catch (e) {
        console.error("Coach fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const healthScore = insights?.health_score || 42;
  const momentumStatus = insights?.momentum_status || "Stable Growth";

  const handleAction = (id) => {
    if (id === 'stale') {
      navigate('/dashboard/drafts');
    } else if (id === 'context') {
      navigate('/dashboard/contacts');
    } else {
      alert("AI Coach: I'm preparing your custom outreach template. Check your 'AI Drafts' soon!");
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
      card: 'border-indigo-200 dark:border-indigo-900/30 border-b-indigo-500/50',
      iconWrap: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800/50',
      icon: 'text-indigo-600 dark:text-indigo-400',
      button: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 font-headline">
            AI Networking Coach <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Beta</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Our AI continuously analyzes your CRM interactions and scanned business cards to surface high-value networking opportunities.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-[#161c28] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-indigo-500/5">
           <div className="relative w-16 h-16 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-100 dark:text-gray-800" />
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * healthScore) / 100} className="text-indigo-500 transition-all duration-1000" strokeLinecap="round"/>
             </svg>
             <span className="absolute text-sm font-black text-gray-900 dark:text-white">{healthScore}</span>
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Network Health</p>
             <p className="text-sm font-bold text-gray-900 dark:text-indigo-400">{momentumStatus}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights?.actions?.map((action, idx) => {
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

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Target size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Unlock Premium Insights</h2>
          <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
            Upgrade to the Professional Plan to unlock real-time CRM syncing, deep industry trend analysis, and automated follow-up scheduling for your entire workspace.
          </p>
          <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
            View Upgrade Options
          </button>
        </div>
      </div>
    </div>
  );
}
