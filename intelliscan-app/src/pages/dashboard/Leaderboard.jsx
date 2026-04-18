import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Medal, 
  Star, 
  Crown,
  Search,
  ArrowUpRight,
  TrendingDown,
  User,
  Zap,
  Flame,
  Award,
  DollarSign
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

const BADGES = [
  { id: 1, name: 'Closer', icon: <Zap size={10} />, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 2, name: 'Prospector', icon: <Target size={10} />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 3, name: 'Pioneer', icon: <Flame size={10} />, color: 'bg-rose-100 text-rose-600 border-rose-200' },
];

export default function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Time');

  useEffect(() => {
    let cancelled = false;

    const fetchRankings = async () => {
      const token = getStoredToken();
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/leaderboard?timeframe=${encodeURIComponent(activeTab)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setRankings(data.rankings);
        }
      } catch (err) {
        if (!cancelled) console.error('Leaderboard fetch failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRankings();
    return () => { cancelled = true; };
  }, [activeTab]);

  if (loading) return <div className="p-10 text-center animate-pulse text-brand-600 font-black">Loading Champions...</div>;

  const topThree = rankings.slice(0, 3);

  return (
    <div className="max-w-screen-xl mx-auto p-6 md:p-10 space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 font-headline">
            <Trophy className="text-amber-500" size={36} />
            Performance Leaderboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time team rankings based on networking impact.</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
          {['This Week', 'This Month', 'All Time'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* PODIUM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10 px-4">
        {/* SECOND PLACE */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
               <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User size={40} />
               </div>
            </div>
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 shadow-md flex items-center justify-center text-slate-500 font-black">2</div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white shadow-md">
               <Medal size={16} />
            </div>
          </div>
          <p className="font-headline font-black text-gray-900 dark:text-white text-lg">{topThree[1]?.name || '---'}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{topThree[1]?.total_scans || 0} SCANS</p>
          <div className="w-full h-32 mt-4 bg-gradient-to-t from-slate-100 to-white dark:from-gray-800 dark:to-transparent rounded-t-3xl border-x border-t border-slate-200 dark:border-gray-700 flex flex-col items-center pt-4">
              <p className="text-[10px] font-black text-slate-500 tracking-tighter">PIPELINE: ${(topThree[1]?.pipeline_value || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* FIRST PLACE */}
        <div className="order-1 md:order-2 flex flex-col items-center scale-110">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition-all" />
            <div className="relative w-32 h-32 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-300 dark:border-amber-700/50 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
               <div className="w-full h-full flex items-center justify-center text-amber-500">
                  <User size={56} />
               </div>
            </div>
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-amber-500 border-2 border-white dark:border-gray-900 shadow-xl flex items-center justify-center text-white font-black text-xl">1</div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-2xl animate-bounce">
               <Crown size={20} />
            </div>
          </div>
          <p className="font-headline font-black text-gray-900 dark:text-white text-2xl">{topThree[0]?.name || '---'}</p>
          <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">{topThree[0]?.total_scans || 0} SCANS</p>
          <div className="w-full h-48 mt-4 bg-gradient-to-t from-amber-100/50 to-white dark:from-amber-900/20 dark:to-transparent rounded-t-3xl border-x border-t border-amber-200 dark:border-amber-800 flex flex-col items-center pt-6 gap-2">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                 <DollarSign size={12} className="font-black" />
                 <span className="text-xs font-black">{(topThree[0]?.pipeline_value || 0).toLocaleString()}</span>
              </div>
          </div>
        </div>

        {/* THIRD PLACE */}
        <div className="order-3 md:order-3 flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-24 h-24 rounded-3xl bg-orange-50 dark:bg-orange-950/10 border-2 border-orange-100 dark:border-orange-900/30 overflow-hidden shadow-lg group-hover:scale-105 transition-transform focus:ring-4">
               <div className="w-full h-full flex items-center justify-center text-orange-400">
                  <User size={40} />
               </div>
            </div>
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 border border-orange-200 dark:border-gray-600 shadow-md flex items-center justify-center text-orange-600 font-black">3</div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-md">
               <Award size={16} />
            </div>
          </div>
          <p className="font-headline font-black text-gray-900 dark:text-white text-lg">{topThree[2]?.name || '---'}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{topThree[2]?.total_scans || 0} SCANS</p>
          <div className="w-full h-24 mt-4 bg-gradient-to-t from-orange-50 to-white dark:from-orange-900/10 dark:to-transparent rounded-t-3xl border-x border-t border-orange-200 dark:border-orange-800/50 flex flex-col items-center pt-4">
              <p className="text-[10px] font-black text-orange-500 tracking-tighter">PIPELINE: ${(topThree[2]?.pipeline_value || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-headline font-black text-gray-900 dark:text-white tracking-tight">Team Rankings</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter names..."
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <th className="px-8 py-4">Rank</th>
                <th className="px-8 py-4">Team Member</th>
                <th className="px-8 py-4">Total Scans</th>
                <th className="px-8 py-4">Pipeline Value</th>
                <th className="px-8 py-4">Achievements</th>
                <th className="px-8 py-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rankings.map((user, index) => (
                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${index < 3 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>#{index + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 border border-gray-200 dark:border-gray-700 font-black text-xs uppercase">
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500">{user.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-gray-900 dark:text-white">{user.total_scans}</span>
                       <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                          <TrendingUp size={10} /> +{Math.floor(Math.random() * 5)}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-gray-900 dark:text-white">
                    ${(user.pipeline_value || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                       {index < 3 && (
                         <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase flex items-center gap-1 ${BADGES[index].color}`}>
                            {BADGES[index].icon} {BADGES[index].name}
                         </div>
                       )}
                       {user.total_scans > 20 && (
                         <div className="px-2 py-0.5 rounded-md border border-purple-200 bg-purple-100 text-purple-600 text-[8px] font-black uppercase flex items-center gap-1">
                            <Star size={10} /> Elite
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-brand-600 transition-all">
                       <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
