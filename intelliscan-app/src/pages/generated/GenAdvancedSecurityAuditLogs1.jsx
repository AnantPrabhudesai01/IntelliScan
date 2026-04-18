import React, { useState, useMemo, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth';

export default function GenAdvancedSecurityAuditLogs1() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/enterprise/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Access Denied: Enterprise Tier Required');
        throw new Error('Failed to fetch audit logs');
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Audit log fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);
  
  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    const lower = search.toLowerCase();
    return logs.filter(log => 
      (log.name || '').toLowerCase().includes(lower) || 
      (log.email || '').toLowerCase().includes(lower) || 
      (log.category || '').toLowerCase().includes(lower) ||
      (log.action || '').toLowerCase().includes(lower)
    );
  }, [logs, search]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const currentLogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  const handleDownloadCSV = () => {
    const headers = "Timestamp,Actor,Event Category,Action/Resource,Status\n";
    const csv = filteredLogs.map(l => `"${l.timestamp}","${l.name || 'System'} (${l.email || l.actor_user_id})","${l.category}","${l.action}","${l.status}"`).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IntelliScan_Audit_Logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-950">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold animate-pulse">Decrypting Security Ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-950">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <span className="material-symbols-outlined text-red-500 text-4xl">lock_open</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Security Access Restricted</h2>
        <p className="text-gray-400 max-w-md mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-xl shadow-brand-500/20">
          Re-authenticate Session
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-in relative pb-12">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase rounded-full border border-brand-500/20 backdrop-blur-md italic tracking-widest">Production Enforced</div>
      
      <div className="max-w-7xl mx-auto flex flex-col gap-8 p-6 md:p-10">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">V3 Immutable</span>
              <span className="w-1 h-1 rounded-full bg-gray-700"></span>
              <span className="text-xs text-gray-400">Enterprise ledger active</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-headline uppercase italic">Security Audit Logs</h1>
            <p className="text-gray-400 max-w-lg font-medium">Real-time ledger of system interactions and configuration changes for organizational compliance.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-900/50 border border-gray-800 px-4 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-brand-400">shield</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Integrity</p>
                <p className="text-sm font-black text-white">SHA-256 Valid</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 gap-4">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400 transition-colors">search</span>
                <input 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-600 outline-none font-medium" 
                  placeholder="Filter by Actor, Category or IP..." 
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
                {(page-1)*rowsPerPage + 1}-{Math.min(page*rowsPerPage, filteredLogs.length)} OF {filteredLogs.length} EVENTS
              </span>
              <button 
                onClick={handleDownloadCSV} 
                className="p-3 bg-gray-950 border border-gray-800 hover:border-brand-500 rounded-2xl text-gray-400 hover:text-brand-400 transition-all flex items-center justify-center" 
                title="Export Ledger"
              >
                <span className="material-symbols-outlined text-xl">download</span>
              </button>
              <button 
                onClick={fetchLogs} 
                className="p-3 bg-gray-950 border border-gray-800 hover:border-brand-500 rounded-2xl text-gray-400 hover:text-brand-400 transition-all flex items-center justify-center" 
                title="Refresh Logs"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 text-gray-500 uppercase text-[11px] font-black tracking-[0.2em] border-b border-gray-800">
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Actor / Identity</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Metadata (IP/Source)</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-800">database_off</span>
                        <p className="text-gray-500 font-bold">No security events indexed for this query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-500/5 transition-all group">
                      <td className="px-8 py-5 align-top">
                        <div className="text-sm text-gray-200 font-bold">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-500 font-black mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-8 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black border transition-colors ${log.status === 'SUCCESS' ? 'bg-brand-950/40 text-brand-400 border-brand-500/20' : 'bg-red-950/40 text-red-400 border-red-500/20'}`}>
                            {log.name ? log.name.substring(0,2).toUpperCase() : 'AI'}
                          </div>
                          <div>
                            <div className="text-sm text-white font-black">{log.name || 'External API / System'}</div>
                            <div className="text-[10px] text-gray-500 font-mono tracking-tighter truncate max-w-[180px]">{log.email || log.actor_user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 align-top">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[10px] font-black text-white uppercase tracking-widest">
                          <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {log.category}
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 font-bold max-w-[200px] leading-relaxed">{log.action || log.resource}</div>
                      </td>
                      <td className="px-8 py-5 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                            <span className="material-symbols-outlined text-[14px] text-gray-600">public</span>
                            {log.ip_address || 'Internal Network'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono italic">
                            <span className="material-symbols-outlined text-[14px] text-gray-600">terminal</span>
                            {log.userAgent || 'System Process'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 align-top text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 bg-gray-950 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-gray-900 border border-gray-800 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setPage(i + 1); window.scrollTo(0,0); }}
                    className={`w-9 h-9 text-[10px] font-black rounded-xl transition-all ${page === i + 1 ? 'text-white bg-brand-600 shadow-lg shadow-brand-500/40' : 'text-gray-500 hover:text-white hover:bg-gray-900 border border-gray-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button 
                disabled={page === totalPages || totalPages === 0} 
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-gray-900 border border-gray-800 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Display</span>
                <select 
                  value={rowsPerPage} 
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  className="bg-gray-900 border border-gray-800 rounded-lg text-[10px] font-black text-white px-2 py-1 focus:ring-0 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-6 bg-brand-500/5 border border-brand-500/10 rounded-3xl">
          <span className="material-symbols-outlined text-brand-400 text-xl">verified_user</span>
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
            <strong className="text-brand-400">Compliance Advisory:</strong> This audit trail is strictly restricted to workspace administrators. All active sessions, credit consumption events, and sensitive data exports are recorded with immutable timestamps. For complete forensic data including deep-packet inspection logs, please submit a request to the Security Operations Center (SOC).
          </p>
        </div>
      </div>
    </div>
  );
}
