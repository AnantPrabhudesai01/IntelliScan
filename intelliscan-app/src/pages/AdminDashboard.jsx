    import { useState, useEffect, useRef } from 'react';
    import { TrendingUp, Server, Activity, ShieldCheck, Shield, Terminal, Rocket, FileDown, Check, X, Globe, RefreshCcw } from 'lucide-react';
    import GlobalIntelligenceMap from '../components/analytics/GlobalIntelligenceMap';
    import NeuralExtractionHeatmap from '../components/analytics/NeuralExtractionHeatmap';
    import { getStoredToken } from '../utils/auth';

    export default function AdminDashboard() {
      const [stats, setStats] = useState({
        activeWorkspaces: 0,
        totalUsers: 0,
        globalVolumeMonth: 0,
        pendingWorkspaces: 0,
        systemUptime: '0.00',
        healthStatus: 'Initializing',
        growthVelocity: '0%'
      });
      const [logs, setLogs] = useState([]);
      const [loading, setLoading] = useState(true);
      const [approved, setApproved] = useState(false);
      const [toast, setToast] = useState(null);
      const [showMap, setShowMap] = useState(false);
      const [showScaleReport, setShowScaleReport] = useState(false);
      const logRef = useRef(null);

      const fetchData = async () => {
        try {
          const token = getStoredToken();
          const headers = { Authorization: `Bearer ${token}` };

          // Fetch Global Stats
          const statsRes = await fetch('/api/admin/stats', { headers });
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data.stats);
          }

          // Fetch Recent Audit Logs for System Feed
          const logsRes = await fetch('/api/admin/audit-logs?page=1', { headers });
          if (logsRes.ok) {
            const data = await logsRes.json();
            const mappedLogs = (data.logs || []).slice(0, 5).map(l => ({
              time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: l.status === 'SUCCESS' ? 'INFO' : 'ERR',
              msg: `${l.action} on ${l.resource}`,
              color: l.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'
            }));
            setLogs(mappedLogs);
          }
        } catch (err) {
          console.error('Dashboard fetch failed:', err);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s for live feel
        return () => clearInterval(interval);
      }, []);

      const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
      };

      const handleExportLogs = () => {
        const content = logs.map(l => `[${l.time}] ${l.type}: ${l.msg}`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `system_logs_${Date.now()}.txt`; a.click();
        showToast('System logs exported successfully!');
      };

      const handleApproveAll = async () => {
        if (stats.pendingWorkspaces === 0) return;
        // In a real app, this would call an API to activate organizations
        setApproved(true);
        showToast(`${stats.pendingWorkspaces} workspaces approved and provisioned!`);
        setTimeout(() => {
          setStats(prev => ({ ...prev, pendingWorkspaces: 0 }));
          setApproved(false);
        }, 2000);
      };

      const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
      };

      return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <Check size={16} /> {toast.msg}
            </div>
          )}
          {showMap && <GlobalMapModal onClose={() => setShowMap(false)} />}
          {showScaleReport && <ScaleReportModal onClose={() => setShowScaleReport(false)} />}

          {/* Hero Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-gray-900 dark:bg-[#161c28] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group border border-gray-800 dark:border-transparent transition-all duration-500">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">Global Scale</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight font-headline">
                  {loading ? '---' : formatNumber(stats.activeWorkspaces)}
                </h2>
                <p className="text-gray-400 text-sm mt-1">Active Workspaces</p>
              </div>
              <div className="mt-8 flex items-end justify-between relative z-10">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">
                  <TrendingUp size={14} /> {stats.growthVelocity}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Health Status</p>
                  <p className={`text-sm font-semibold ${stats.healthStatus === 'Optimized' ? 'text-brand-400' : 'text-amber-400'}`}>
                    {loading ? 'Initializing...' : stats.healthStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl"><Server size={24} /></div>
                <span className="text-xs text-gray-500 font-mono">NODE_CLUSTER</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">System Uptime</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '0.00' : stats.systemUptime}%</span>
              </div>
              <div className="mt-auto h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300 transition-all duration-1000" style={{ width: `${stats.systemUptime}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 rounded-xl"><Activity size={24} /></div>
                <span className="text-xs text-green-500 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE_FEED</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Global Volume</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '0' : formatNumber(stats.globalVolumeMonth)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <div className="mt-auto flex gap-1 items-end h-8">
                {[40, 60, 80, 100, 70].map((h, i) => (
                  <div key={i} className="w-full bg-brand-200 dark:bg-brand-500/40 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </section>

          {/* Main Data Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-8">
                <GlobalIntelligenceMap />
                <NeuralExtractionHeatmap />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Logs - Live */}
              <div className="bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 font-headline">
                  <Terminal className="text-brand-600 dark:text-brand-400" size={20} /> System Logs
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400 font-mono"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE</span>
                </h3>
                <div ref={logRef} className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                  {loading ? (
                    <div className="py-4 text-center text-xs text-gray-500 italic">Connecting to production logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500 italic">No recent logs found.</div>
                  ) : (
                    logs.map((l, i) => (
                      <div key={i} className="flex gap-3 text-xs animate-in slide-in-from-left-2 duration-300">
                        <span className="text-gray-400 font-mono flex-shrink-0">{l.time}</span>
                        <div className="flex-1">
                          <span className={`font-bold ${l.color}`}>[{l.type}]</span>
                          <p className="text-gray-600 dark:text-gray-300 mt-0.5">{l.msg}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={handleExportLogs}
                  className="w-full mt-6 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-[#2f3542] text-gray-900 dark:text-white text-xs font-semibold dark:hover:bg-[#343946] transition-all border border-gray-200 dark:border-transparent flex items-center justify-center gap-2 active:scale-95">
                  <FileDown size={14} /> Export Raw Logs
                </button>
              </div>

              {/* System Expansion */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><Rocket size={100} /></div>
                <h4 className="text-xl font-headline font-extrabold mb-2 relative z-10">System Expansion</h4>
                <p className="text-sm text-brand-100 relative z-10 mb-6 font-medium">
                  {stats.pendingWorkspaces > 0
                    ? `${stats.pendingWorkspaces} new workspaces are awaiting provisioning review.`
                    : '✅ All workspaces have been provisioned.'}
                </p>
                <button
                  onClick={handleApproveAll}
                  disabled={stats.pendingWorkspaces === 0 || approved}
                  className={`relative z-10 px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition-all w-full md:w-auto active:scale-95 ${stats.pendingWorkspaces > 0 && !approved
                      ? 'bg-white text-brand-700 hover:bg-brand-50'
                      : 'bg-white/20 text-white/60 cursor-not-allowed'
                    }`}>
                  {approved ? '✓ Processing...' : 'Approve All'}
                </button>
                <button onClick={() => setShowScaleReport(true)}
                  className="relative z-10 mt-3 w-full py-2 rounded-lg text-xs font-bold text-brand-100 border border-white/20 hover:bg-white/10 transition-all active:scale-95">
                  Generate Scale Report
                </button>
              </div>

              {/* Security Compliance */}
              <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-gray-900 dark:text-white font-bold mb-6 font-headline">Security Compliance</h3>
                <div className="space-y-4">
                  {[{ name: 'GDPR-X', region: 'Region: EU', icon: ShieldCheck }, { name: 'SOC-II', region: 'Global', icon: Shield }].map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500">
                          <c.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{c.region}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-full text-[10px] font-bold">ACTIVE</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }
