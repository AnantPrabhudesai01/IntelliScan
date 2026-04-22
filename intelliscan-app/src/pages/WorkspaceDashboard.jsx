import { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, Bell, Zap, Users, BarChart2, Cpu, FileText, RefreshCw, ArrowUpRight, MessageCircle } from 'lucide-react';
import GlobalIntelligenceMap from '../components/analytics/GlobalIntelligenceMap';
import NeuralExtractionHeatmap from '../components/analytics/NeuralExtractionHeatmap';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

export default function WorkspaceDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const handleWhatsApp = async (contact_id) => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/messaging/whatsapp-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contact_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      alert('Location-aware WhatsApp Follow-up sent!');
    } catch (e) {
      alert('Error triggering WhatsApp: ' + e.message);
    }
  };

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/workspace/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to fetch workspace analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const maxDay = data ? Math.max(...(data.scan_by_day || [1]), 1) : 1;

  if (loading) return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
      <div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 rounded-2xl" />)}</div>
      <div className="h-80 bg-gray-100 dark:bg-gray-900 rounded-3xl" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-gray-900 dark:text-white tracking-tight">Workspace Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Real-time intelligence from your scanning ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 transition-colors">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <CalendarDays size={16} />
            Last 30 Days
            <ChevronDown size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 relative shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: (data?.total_scans || 0).toLocaleString(), badge: data?.total_scans > 0 ? `+${data.growth_pct}% vs LY` : 'No scans yet', badgeColor: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30', icon: Zap, iconColor: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Avg Confidence', value: data?.total_scans > 0 ? `${data.avg_confidence}%` : '—', badge: data?.total_scans > 0 ? 'Optimal' : 'No data', badgeColor: 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/30', icon: BarChart2, iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Active Members', value: (data?.active_members || 1).toString(), badge: 'Full Team', badgeColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800', icon: Users, iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Leads Generated', value: (data?.leads_generated || 0).toLocaleString(), badge: data?.leads_generated > 0 ? 'High ROI' : 'Scan cards', badgeColor: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30', icon: FileText, iconColor: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-lg ${card.iconColor}`}><card.icon size={22} /></span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>{card.badge}</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-widest">{card.label}</p>
              <h2 className="text-3xl font-headline font-black text-gray-900 dark:text-white mt-1">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Scan Volume Chart — LIVE */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">Daily Scan Volume</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Intake Engine</span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-1 w-full px-1">
            {(data?.scan_by_day || Array(30).fill(0)).map((val, i) => (
              <div
                key={i}
                title={`Day ${i + 1}: ${val} scans`}
                className={`flex-1 rounded-t-sm transition-all duration-200 cursor-pointer group/bar ${val > 0 ? 'bg-brand-500 hover:bg-brand-400' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                style={{ height: `${Math.max((val / maxDay) * 100, val > 0 ? 8 : 3)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 border-t border-gray-100 dark:border-gray-800 pt-4">
            <span>30 days ago</span>
            <span>15 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Engine Efficiency */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 flex flex-col shadow-sm">
          <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-1">Engine Efficiency</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Performance per OCR model</p>
          <div className="flex-1 space-y-5">
            {(data?.engine_breakdown || []).map((engine, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900 dark:text-white">{engine.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{engine.pct}% usage</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : i === 1 ? 'bg-amber-500' : 'bg-gray-400'}`}
                    style={{ width: `${engine.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => navigate('/workspace/analytics')} className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all border border-gray-200 dark:border-gray-700">
              <Cpu size={16} /> View Full Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Analytics & Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <GlobalIntelligenceMap />
        <NeuralExtractionHeatmap />
      </div>

      {/* Live Activity Feed — REAL DATA */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-xl font-headline font-extrabold text-gray-900 dark:text-white">Live Activity Feed</h3>
          <button onClick={() => navigate('/workspace/contacts')} className="flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline transition-all">
            View All <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          {(data?.recent_activity || []).length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-gray-500 dark:text-gray-400 font-semibold">No scans yet.</p>
                <button onClick={() => navigate('/dashboard/scan')} className="mt-4 px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors">Scan Your First Card</button>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    {['Contact Name', 'Company', 'Scanned By', 'Confidence', 'Time', 'Follow-up'].map(h => (
                      <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(data.recent_activity).map((contact) => (
                    <tr key={contact.id} onClick={() => navigate('/workspace/contacts')} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-[10px] font-black">
                            {(contact.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{contact.name || '—'}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{contact.job_title || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{contact.company || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-mono font-bold rounded-lg border border-gray-200 dark:border-gray-700">
                          {contact.scanner_name || 'You'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${(contact.confidence || 0) >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : (contact.confidence || 0) >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {contact.confidence || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">{timeAgo(contact.scan_date)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(contact.id);
                          }}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
                        >
                          <MessageCircle size={14} /> Send WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
