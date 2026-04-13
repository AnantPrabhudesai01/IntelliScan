import { useState, useEffect } from 'react';
import { Users, Zap, Calendar, Mail, Target, Smartphone, X, BarChart2, ListTree, Monitor, Sparkles, Settings } from 'lucide-react';
import { getStoredToken } from '../utils/auth.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Safe Icon Registry to prevent 'Element type is invalid' crash if backend or state has undefined components
const ICON_MAP = {
  Users, Zap, Calendar, Mail, Target, Smartphone, X, BarChart2, ListTree, Monitor, Sparkles, Settings
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = getStoredToken();
        const res = await fetch(`/api/analytics/dashboard?range=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics({
            total_scans: data.total_scans ?? 0,
            avg_confidence: data.avg_confidence ?? 0,
            latency_ms: data.latency_ms ?? 0,
            growth_pct: data.growth_pct ?? 0,
            scan_volume: data.scan_volume ?? [],
            industries: data.industries ?? [],
            seniority_breakdown: data.seniority_breakdown ?? [],
            top_networkers: data.top_networkers ?? [],
            pipeline: data.pipeline ?? [],
            system_logs: data.system_logs ?? []
          });
        }
      } catch (e) {
        console.error('Analytics fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  // Fallback data when backend endpoint isn't ready yet
  const data = analytics || {
    total_scans: 1284092,
    avg_confidence: 94.2,
    latency_ms: 1200,
    growth_pct: 12.4,
    scan_volume: [320, 480, 410, 620, 550, 890, 760, 920, 840, 1100, 980, 1250],
    industries: [
      { name: 'Technology', count: 482, pct: 37.5, color: 'bg-indigo-500' },
      { name: 'Finance', count: 310, pct: 24.1, color: 'bg-emerald-500' },
      { name: 'Real Estate', count: 195, pct: 15.2, color: 'bg-amber-500' },
      { name: 'Healthcare', count: 142, pct: 11.0, color: 'bg-red-500' },
      { name: 'Other', count: 157, pct: 12.2, color: 'bg-gray-400' },
    ],
    seniority_breakdown: [
      { level: 'CXO / Founder', count: 89, pct: 6.9 },
      { level: 'VP / Director', count: 245, pct: 19.0 },
      { level: 'Senior', count: 412, pct: 32.0 },
      { level: 'Mid-Level', count: 378, pct: 29.4 },
      { level: 'Entry', count: 162, pct: 12.6 },
    ],
    top_networkers: [
      { name: 'Sarah Jenkins', scans: 342, department: 'Enterprise Sales' },
      { name: 'Michael Chen', scans: 289, department: 'Business Dev' },
      { name: 'Priya Patel', scans: 234, department: 'Marketing' },
      { name: 'James Wilson', scans: 198, department: 'Partnerships' },
      { name: 'Lisa Zhang', scans: 167, department: 'Field Sales' },
    ],
    pipeline: [
      { stage: 'Scanned', count: 42109, pct: 100, color: 'bg-indigo-500', icon_key: 'Users' },
      { stage: 'Validated', count: 38901, pct: 92, color: 'bg-emerald-500', icon_key: 'Target' },
      { stage: 'Engaged', count: 12400, pct: 32, color: 'bg-amber-500', icon_key: 'Sparkles' },
    ],
    system_logs: [
      { time: '12:44:02', level: 'error', code: 'OCR_TIMEOUT_EXP', message: 'Engine cluster region us-east-1 delayed.' },
      { time: '11:30:15', level: 'success', code: 'MODEL_DEPLOY_SUCCESS', message: 'Gemini 1.5 Pro (v2.1) is now live.' },
      { time: '10:15:00', level: 'warning', code: 'ANOMALY_DETECTED', message: 'Unusual spike in scan volume from API-KEY-XJ9.' },
      { time: '08:00:00', level: 'info', code: 'SYSTEM_MAINTENANCE', message: 'Scheduled database indexing completed.' },
    ],
  };

  const maxVolume = Math.max(...data.scan_volume);

  if (loading && !analytics) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto animate-pulse space-y-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-4 gap-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>)}</div>
        <div className="h-80 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header & Filter */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-gray-900 dark:text-white tracking-tight">System Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400 font-body mt-2">Real-time performance metrics, industry demographics, and team leaderboards.</p>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${timeRange === range
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-1/2 right-12 -translate-y-1/2">
            <BarChart2 className="text-indigo-100 dark:text-indigo-900/20 rotate-12 group-hover:rotate-0 transition-transform duration-500" size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Scans</p>
            <h3 className="text-4xl md:text-5xl font-bold font-headline text-gray-900 dark:text-white tracking-tighter">{data.total_scans.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-3">
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 bg-emerald-50`}>
                {data.growth_pct >= 0 ? '+' : ''}{data.growth_pct}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Avg. Confidence</p>
            <h3 className="text-4xl font-bold font-headline text-gray-900 dark:text-white tracking-tighter">{data.avg_confidence}%</h3>
          </div>
          <div className="mt-6">
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${data.avg_confidence}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Processing Latency</p>
            <h3 className="text-4xl font-bold font-headline text-gray-900 dark:text-white tracking-tighter">{(data.latency_ms / 1000).toFixed(1)}s</h3>
          </div>
          <div className="mt-6 flex items-center">
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/50">ENGINE-V3-ALPHA</span>
          </div>
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Volume Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white">Scan Volume Trends</h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Month-over-Month</span>
          </div>
          <div className="h-64 flex items-end gap-1 relative mt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-gray-100 dark:border-gray-800 w-full h-px"></div>)}
            </div>
            {data.scan_volume.map((h, i) => (
              <div key={i} className="flex-1 group relative flex flex-col justify-end items-center">
                <div
                  className="w-full bg-indigo-100 hover:bg-indigo-300 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 rounded-t-md transition-all cursor-crosshair"
                  style={{ height: `${(h / maxVolume) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-2 py-1 rounded text-[10px] font-bold z-10 shadow-lg hidden group-hover:block whitespace-nowrap">
                    {h.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-4 border-t border-gray-100 dark:border-gray-800">
            {MONTHS.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Industry Breakdown Pie */}
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ListTree size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white">Industry Breakdown</h4>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">AI-Inferred from Scans</p>

          {/* SVG Donut Chart */}
          <div className="flex justify-center mb-6">
            <svg width="160" height="160" viewBox="0 0 36 36" className="transform -rotate-90">
              {(() => {
                let offset = 0;
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#9ca3af'];
                return data.industries.map((ind, i) => {
                  const dashArray = `${ind.pct} ${100 - ind.pct}`;
                  const el = (
                    <circle
                      key={i}
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth="3"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );
                  offset += ind.pct;
                  return el;
                });
              })()}
            </svg>
          </div>

          <div className="space-y-3">
            {data.industries.map((ind, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${ind.color}`}></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ind.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{ind.count}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white w-12 text-right">{ind.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seniority Breakdown + Top Networkers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seniority Breakdown */}
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Monitor size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white">Seniority Distribution</h4>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">AI-Inferred Contact Levels</p>
          <div className="space-y-4">
            {data.seniority_breakdown.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.level}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{s.count}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{s.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Networkers Leaderboard */}
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-amber-500" />
            <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white">Top Networkers</h4>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Workspace Leaderboard</p>
          <div className="space-y-3">
            {data.top_networkers.map((user, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                    : i === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      : i === 2 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400 border border-gray-200 dark:border-gray-800'
                  }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.department}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-gray-900 dark:text-white">{user.scans}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">scans</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline + System Health */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white mb-6">Lead Conversion Pipeline</h4>
          <div className="space-y-3">
            {data.pipeline.map((stage, i) => {
              const Icon = ICON_MAP[stage.icon_key] || Zap;
              return (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className={`w-12 h-12 rounded-xl ${stage.color.replace('bg-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
                    <Icon className={`${stage.color.replace('bg-', 'text-')}`} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{stage.stage} Leads</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.count.toLocaleString()} entries</p>
                  </div>
                  <div className="text-right shrink-0 w-24">
                    <p className="text-sm font-black text-gray-900 dark:text-white mb-2">{stage.pct}%</p>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${stage.pct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white">System Health Logs</h4>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all">Download Report</button>
          </div>
          <div className="space-y-4">
            {data.system_logs.map((log, i) => {
              const levelMap = {
                error: { bg: 'bg-red-50 dark:bg-gray-800/80', border: 'border-l-red-500', icon_key: 'Smartphone', iconColor: 'text-red-500' },
                success: { bg: 'bg-indigo-50 dark:bg-gray-800/80', border: 'border-l-indigo-500', icon_key: 'Zap', iconColor: 'text-indigo-500' },
                warning: { bg: 'bg-amber-50 dark:bg-gray-800/80', border: 'border-l-amber-500', icon_key: 'BarChart2', iconColor: 'text-amber-500' },
                info: { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-l-gray-400', icon_key: 'Monitor', iconColor: 'text-gray-500' },
              };
              const cfg = levelMap[log.level] || levelMap.info;
              const LogIcon = ICON_MAP[cfg.icon_key] || Zap;
              return (
                <div key={i} className={`p-4 ${cfg.bg} rounded-xl border-l-4 ${cfg.border} border border-transparent dark:border-gray-800 flex justify-between items-start`}>
                  <div className="flex gap-3">
                    <LogIcon className={`${cfg.iconColor} shrink-0 mt-0.5`} size={18} />
                    <div>
                      <p className="text-[11px] font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">{log.code}</p>
                      <p className={`text-xs ${log.level === 'error' ? 'text-red-700' : log.level === 'success' ? 'text-indigo-700' : log.level === 'warning' ? 'text-amber-700' : 'text-gray-600'} dark:text-gray-400 font-medium font-body`}>{log.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono font-bold shrink-0">{log.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
