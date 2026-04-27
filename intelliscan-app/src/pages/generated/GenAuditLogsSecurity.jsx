import React, { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth';

export default function GenAuditLogsSecurity() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ active_sessions: 0, failed_auth_24h: 0, data_exported_gb: '0.0' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('All Activities');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Logs
      const logsRes = await fetch(`/api/admin/audit-logs?category=${category}&page=${page}`, { headers });
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }

      // Fetch Summary
      const summaryRes = await fetch('/api/admin/security-summary', { headers });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Audit fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, page]);

  const getStatusStyle = (status) => {
    if (status?.toUpperCase() === 'SUCCESS') return 'bg-tertiary-container/20 text-tertiary';
    if (status?.toUpperCase() === 'DENIED' || status?.toUpperCase() === 'ERROR') return 'bg-error-container/20 text-error';
    return 'bg-surface-container-highest text-on-surface-variant';
  };

  const getIcon = (action) => {
    if (action?.includes('EXPORT')) return 'file_upload';
    if (action?.includes('LOGIN')) return 'login';
    if (action?.includes('SETTING')) return 'settings';
    return 'security';
  };

  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Live Security Feed</div>
      
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Date Range</label>
          <div className="flex items-center gap-2 text-on-surface text-sm">
            <span className="material-symbols-outlined text-primary" data-icon="calendar_today">calendar_today</span>
            <span>Last 24 Hours</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer" data-icon="expand_more">expand_more</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 group cursor-pointer" onClick={() => setCategory(category === 'All Activities' ? 'LOGIN' : 'All Activities')}>
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Event Category</label>
          <div className="flex items-center gap-2 text-on-surface text-sm">
            <span className="material-symbols-outlined text-primary" data-icon="filter_list">filter_list</span>
            <span>{category}</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant" data-icon="expand_more">expand_more</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Active User</label>
          <div className="flex items-center gap-2 text-on-surface text-sm">
            <span className="material-symbols-outlined text-primary" data-icon="person">person</span>
            <span>System Admin</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer" data-icon="expand_more">expand_more</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">System Health</label>
          <div className="flex items-center gap-2 text-tertiary font-bold text-sm">
            <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
            <span>Fully Encrypted</span>
          </div>
        </div>
      </section>

      <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/40 min-h-[400px]">
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
          <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-icon="security">security</span>
            System Events
          </h3>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Successful</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Failed</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Identity</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Event Type</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Resource Path</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">IP Address</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-on-surface-variant italic">Fetching real-time security signals...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-on-surface-variant italic">No security events found for this filter.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-on-surface">{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="text-[11px] text-on-surface-variant">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                          {(log.user_name || 'UN').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{log.user_name || 'System / Unauth'}</div>
                          <div className="text-[11px] text-on-surface-variant">{log.user_role || 'Process'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary text-[11px] font-bold">
                        <span className="material-symbols-outlined text-xs" data-icon={getIcon(log.action)}>{getIcon(log.action)}</span>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-on-surface-variant truncate max-w-[200px]">{log.resource}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-on-surface">{JSON.parse(log.metadata || '{}').ip || '::1 (Local)'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full ${getStatusStyle(log.status)} text-[10px] font-bold tracking-tight`}>
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/10">
          <p className="text-[11px] text-on-surface-variant">Showing {logs.length} entries (Total: {total})</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors disabled:opacity-30" 
              disabled={page === 1}
            >
              <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">{page}</span>
            </div>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled={logs.length < 20}
            >
              <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-low p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div>
              <h4 className="font-headline font-bold text-on-surface">Threat Vectors &amp; Geo-Location</h4>
              <p className="text-xs text-on-surface-variant">Visualization of current incoming traffic patterns.</p>
            </div>
            <span className="px-3 py-1 bg-primary-container/20 text-primary text-[10px] font-bold rounded-full animate-pulse">LIVE FEED</span>
          </div>
          <div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center overflow-hidden border border-outline-variant/10">
            <img className="w-full h-full object-cover opacity-60" data-alt="Abstract world map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8MpcN3mDuU4TqaSSAsyac5aQ1bjG6Sqw9VDNaQg_GuAxsFSXRgOHc0DcZHSxI9HK_o3Z7qCTSBuUUwZ5mnjvAWgRgjMUNgvM4WPxdmkXjhhGLItHUvYEydxDmLEf_LAX6BMMFWsMVH2sUNlFz8NcokkrtNrdGt_Z97bbfkXAFanjAnXH88_YGT1BFqfY-NjAyetZLplakn7V21P5QwwlKdDuZMGJrNmH-8AUP2-RDam5Ti8bQbJ2POwLvrsIHYE9JyIliTsq81gYS"/>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-6">
          <h4 className="font-headline font-bold text-on-surface">Security Summary</h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Active Sessions (1h)</span>
              <span className="text-sm font-bold text-on-surface">{summary.active_sessions}</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${Math.min(100, summary.active_sessions * 5)}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-on-surface-variant">Failed Auth (24h)</span>
              <span className="text-sm font-bold text-error">{summary.failed_auth_24h}</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-error h-full transition-all duration-1000" style={{ width: `${Math.min(100, (summary.failed_auth_24h / 200) * 100)}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-on-surface-variant">Data Exported</span>
              <span className="text-sm font-bold text-tertiary">{summary.data_exported_gb} GB</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full transition-all duration-1000" style={{ width: `${Math.min(100, (Number(summary.data_exported_gb) / 5) * 100)}%` }}></div>
            </div>
          </div>
          <div className="mt-auto p-4 bg-surface-container rounded-xl border border-outline-variant/10">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">SECURITY ADVISORY</div>
            <p className="text-[11px] leading-relaxed text-on-surface-variant italic">Anomaly detected in {category !== 'All Activities' ? category : 'global'} traffic. Consider periodic API key rotation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
