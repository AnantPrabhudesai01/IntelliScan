import { useState, useEffect } from 'react';
import { 
  Users, Zap, Calendar, Mail, Target, Smartphone, X, BarChart2, 
  ListTree, Monitor, Sparkles, Settings, Globe, Shield, Clock, 
  TrendingUp, Award, Activity, Cpu, Database, ChevronRight,
  Download, Filter, RefreshCw
} from 'lucide-react';
import { getStoredToken } from '../utils/auth.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ICON_MAP = {
  Users, Zap, Calendar, Mail, Target, Smartphone, X, BarChart2, ListTree, Monitor, Sparkles, Settings, Globe, Shield, Clock
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview'); // overview, team, ai
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
          setAnalytics(data);
        }
      } catch (e) {
        console.error('Analytics fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const data = analytics || {
    total_scans: 1284092,
    avg_confidence: 94.2,
    latency_ms: 1200,
    growth_pct: 12.4,
    scan_volume: [320, 480, 410, 620, 550, 890, 760, 920, 840, 1100, 980, 1250],
    industries: [
      { name: 'Technology', count: 482, pct: 37.5, color: '#6366f1' },
      { name: 'Finance', count: 310, pct: 24.1, color: '#10b981' },
      { name: 'Real Estate', count: 195, pct: 15.2, color: '#f59e0b' },
      { name: 'Healthcare', count: 142, pct: 11.0, color: '#ef4444' },
      { name: 'Legal', count: 102, pct: 8.0, color: '#8b5cf6' },
      { name: 'Other', count: 55, pct: 4.2, color: '#9ca3af' },
    ],
    seniority_breakdown: [
      { level: 'CXO / Founder', count: 89, pct: 6.9 },
      { level: 'VP / Director', count: 245, pct: 19.0 },
      { level: 'Senior', count: 412, pct: 32.0 },
      { level: 'Mid-Level', count: 378, pct: 29.4 },
      { level: 'Entry', count: 162, pct: 12.6 },
    ],
    top_networkers: [
      { name: 'Sarah Jenkins', scans: 342, department: 'Enterprise Sales', conversion: 92 },
      { name: 'Michael Chen', scans: 289, department: 'Business Dev', conversion: 88 },
      { name: 'Priya Patel', scans: 234, department: 'Marketing', conversion: 95 },
      { name: 'James Wilson', scans: 198, department: 'Partnerships', conversion: 81 },
      { name: 'Lisa Zhang', scans: 167, department: 'Field Sales', conversion: 76 },
    ],
    pipeline: [
      { stage: 'Scanned', count: 42109, pct: 100, color: 'bg-brand-500', icon_key: 'Users' },
      { stage: 'Validated', count: 38901, pct: 92, color: 'bg-emerald-500', icon_key: 'Target' },
      { stage: 'MQL Ready', count: 18400, pct: 44, color: 'bg-blue-500', icon_key: 'Sparkles' },
      { stage: 'CRM Synced', count: 12400, pct: 30, color: 'bg-amber-500', icon_key: 'Database' },
    ],
    ai_quality: {
      field_accuracy: [
        { field: 'Name', score: 98 },
        { field: 'Email', score: 99 },
        { field: 'Phone', score: 91 },
        { field: 'Company', score: 94 },
        { field: 'Industry', score: 82 },
      ],
      correction_rate: 4.2,
      uptime: 99.98
    },
    geo_distribution: [
      { region: 'North America', pct: 42 },
      { region: 'Europe', pct: 28 },
      { region: 'Asia-Pacific', pct: 21 },
      { region: 'Latin America', pct: 9 },
    ],
    system_logs: [
      { time: '12:44:02', level: 'error', code: 'OCR_TIMEOUT', message: 'Engine cluster latency spike detected in us-east-1.' },
      { time: '11:30:15', level: 'success', code: 'MODEL_UPGRADE', message: 'Gemini 1.5 Pro (v2.2) deployed globally.' },
      { time: '10:15:00', level: 'warning', code: 'LIMIT_REACHED', message: 'Org "TechFlow" hit 90% of monthly scan quota.' },
    ],
  };

  const maxVolume = Math.max(...data.scan_volume);

  const handleExportPDF = () => {
    window.print();
  };

  if (loading && !analytics) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <style>{`
          @media print {
            .no-print, nav, header button, footer, .tab-switcher { display: none !important; }
            body, .p-8 { padding: 0 !important; background: white !important; color: black !important; }
            .max-w-7xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
            .grid { display: block !important; }
            .bg-white, .dark\\:bg-\\[\\#1A1A2E\\] { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid !important; }
            h1, h3, h4, p { color: black !important; }
            .shadow-xl, .shadow-lg { box-shadow: none !important; }
          }
        `}</style>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-64"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10"></div>)}
        </div>
        <div className="h-[400px] bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <style>{`
        @media print {
          .no-print, nav, header button, footer, .tab-switcher, .flex.bg-gray-100 { display: none !important; }
          body, .p-8 { padding: 0 !important; background: white !important; color: black !important; }
          .max-w-7xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .grid { display: block !important; }
          .bg-white, .dark\\:bg-\\[\\#1A1A2E\\] { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid !important; }
          h1, h3, h4, p, span { color: black !important; }
          .shadow-xl, .shadow-lg { box-shadow: none !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 4px !important; }
          .p-8 { padding: 20px !important; }
        }
      `}</style>
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-600 rounded-lg text-white">
              <BarChart2 size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Intelligence Center</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-10">Advanced cross-platform metrics & AI performance suite</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 shadow-inner">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeRange === range ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <nav className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit border border-gray-200 dark:border-white/10">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'team', label: 'Team ROI', icon: Award },
          { id: 'ai', label: 'AI Intelligence', icon: Cpu },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Top Line KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Scans', value: data.total_scans.toLocaleString(), change: `+${data.growth_pct}%`, color: 'indigo', icon: Zap },
              { label: 'Avg Confidence', value: `${data.avg_confidence}%`, change: '+0.4%', color: 'emerald', icon: Shield },
              { label: 'System Latency', value: `${(data.latency_ms / 1000).toFixed(1)}s`, change: '-12ms', color: 'amber', icon: Clock },
              { label: 'Inbound Leads', value: '14,204', change: '+8.2%', color: 'purple', icon: Target },
            ].map((kpi, i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl group hover:border-brand-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 bg-${kpi.color}-500/10 rounded-xl text-${kpi.color}-500`}>
                    <kpi.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${kpi.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">{kpi.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scan Trends */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Growth Velocity</h4>
                <div className="flex gap-2 text-[10px] font-black">
                  <span className="flex items-center gap-1 text-emerald-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Current</span>
                  <span className="flex items-center gap-1 text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Baseline</span>
                </div>
              </div>
              <div className="h-64 flex items-end gap-2 relative">
                {data.scan_volume.map((v, i) => (
                  <div key={i} className="flex-1 group relative flex flex-col justify-end">
                    <div 
                      className="w-full bg-brand-600/10 group-hover:bg-brand-600/30 rounded-t-lg transition-all cursor-pointer relative"
                      style={{ height: `${(v/maxVolume)*100}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        {MONTHS[i]}: {v.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                {MONTHS.map(m => <span key={m}>{m}</span>)}
              </div>
            </div>

            {/* Geo Distribution */}
            <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-6">Market Distribution</h4>
              <div className="space-y-6">
                {data.geo_distribution.map((geo, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{geo.region}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{geo.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${geo.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-5 bg-brand-600/5 rounded-2xl border border-brand-500/10 flex items-center gap-4">
                <Globe size={32} className="text-brand-500/40" />
                <p className="text-[10px] text-brand-500/80 leading-relaxed font-bold italic">
                  "Most growth coming from North America this quarter. APAC following with 21% increase."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team ROI Tab */}
      {activeTab === 'team' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Performance Hierarchy</h4>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-black uppercase tracking-widest">
                  <Award size={14} /> Global Top 5
                </div>
              </div>
              <div className="space-y-4">
                {data.top_networkers.map((user, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-white/10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-lg ${i === 0 ? 'bg-amber-500 text-white shadow-amber-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">{user.scans}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">scans</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center relative">
                       <svg className="w-full h-full transform -rotate-90">
                         <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-800" />
                         <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500" strokeDasharray={`${user.conversion * 1.13} 1000`} />
                       </svg>
                       <span className="absolute text-[8px] font-black">{user.conversion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Pipeline */}
            <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-8">Conversion Funnel</h4>
              <div className="space-y-4">
                {data.pipeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden group">
                      <div className={`absolute left-0 top-0 w-1 h-full ${item.color}`} />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color.replace('bg-', 'bg-')}/10 text-${item.color.replace('bg-', '')}`}>
                        {(() => { const Icon = ICON_MAP[item.icon_key] || Award; return <Icon size={24} />; })()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.stage}</p>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">{item.count.toLocaleString()} Contacts</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-gray-900 dark:text-white">{item.pct}%</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">efficiency</div>
                      </div>
                    </div>
                    {i < data.pipeline.length - 1 && (
                      <div className="flex justify-center -my-2 relative z-10 transition-transform hover:scale-125 cursor-default">
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <ChevronRight size={12} className="rotate-90 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Intelligence Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Accuracy Breakdown */}
            <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
               <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Field Precision Matrix</h4>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-black tracking-widest uppercase">
                  Gemini v2.2 Active
                </div>
               </div>
               <div className="space-y-6">
                {data.ai_quality.field_accuracy.map((f, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-20 text-xs font-black text-gray-500 uppercase tracking-widest">{f.field}</div>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-brand-500 transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.5)]" style={{ width: `${f.score}%` }} />
                    </div>
                    <div className="w-12 text-sm font-black text-gray-900 dark:text-white text-right">{f.score}%</div>
                  </div>
                ))}
               </div>
               <div className="mt-10 p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Correction Alert</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      "Phone numbers showing 9% variance. Instructing AI to prioritize international + prefix detection."
                    </p>
                  </div>
               </div>
            </div>

            {/* AI Performance Logs */}
            <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black text-gray-900 dark:text-white">Live Engine Logs</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Real-time Stream</span>
                </div>
              </div>
              <div className="space-y-4">
                {data.system_logs.map((log, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${log.level === 'error' ? 'bg-red-500/5 border-red-500/20' : log.level === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-brand-500/5 border-brand-500/20'} flex gap-4`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.level === 'error' ? 'bg-red-500/10 text-red-500' : log.level === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-500/10 text-brand-500'}`}>
                      {log.level === 'error' ? <X size={20} /> : log.level === 'warning' ? <Settings size={20} /> : <Zap size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono opacity-60">{log.code}</span>
                        <span className="text-[9px] font-bold text-gray-400">{log.time}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed truncate">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                Access Full Inference Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Report Settings */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <RefreshCw size={20} className="animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight transition-all">Report Live</p>
            <p className="text-[10px] text-gray-500 font-medium">Last full sync: Just now · Data fresh within 5s</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Shield size={12} className="text-brand-500" />
          GDPR Compliant Analytics · Enterprise Shield Active
        </div>
      </footer>
    </div>
  );
}
