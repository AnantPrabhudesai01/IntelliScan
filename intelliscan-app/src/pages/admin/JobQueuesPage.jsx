import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw, RotateCw, ServerCog, TimerReset } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

const STATUS_STYLES = {
  succeeded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  retry_queued: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  queued: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

function formatDate(value) {
  if (!value) return 'n/a';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'n/a';
  return d.toLocaleString();
}

export default function JobQueuesPage() {
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [data, setData] = useState({
    summary: {},
    provider_stats: [],
    failed_syncs: [],
    recent_jobs: []
  });

  const token = getStoredToken();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/integrations/health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const payload = await res.json();
      setData(payload || {});
    } catch (error) {
      console.error('Failed to fetch integration health dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryJob = async (jobId) => {
    setRetryingId(jobId);
    try {
      const res = await fetch(`/api/admin/integrations/failed-syncs/${jobId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload?.message || payload?.error || 'Retry failed');
      }
      await loadDashboard();
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Retry failed. Please try again.');
    } finally {
      setRetryingId(null);
    }
  };

  const derived = useMemo(() => {
    const total = Number(data?.summary?.total_jobs || 0);
    const succeeded = Number(data?.summary?.succeeded || 0);
    const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0;
    return { total, succeeded, successRate };
  }, [data?.summary]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ServerCog size={24} className="text-indigo-500" />
            Integration Health Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Live status for CRM sync jobs, failed delivery queue, and operator retry actions.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Jobs</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{derived.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Succeeded</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{data?.summary?.succeeded || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Failed</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1">{data?.summary?.failed || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retry Queue</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{data?.summary?.retry_queued || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Success Rate</p>
          <p className="text-2xl font-extrabold text-indigo-500 mt-1">{derived.successRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Failed Sync / Retry Queue</h2>
            <span className="text-xs text-gray-500">{(data?.failed_syncs || []).length} jobs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Job</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Provider</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Retries</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Error</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-gray-500" colSpan={6}>
                      Loading failed queue...
                    </td>
                  </tr>
                )}

                {!loading && (data?.failed_syncs || []).length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-gray-500" colSpan={6}>
                      No failed sync jobs right now.
                    </td>
                  </tr>
                )}

                {!loading && (data?.failed_syncs || []).map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">#{job.id}</p>
                      <p className="text-xs text-gray-500">Updated {formatDate(job.updated_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <Database size={13} />
                        {job.provider}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_STYLES[job.status] || STATUS_STYLES.queued}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <TimerReset size={12} />
                        {job.retry_count}/{job.max_retries}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-red-500 line-clamp-2">{job.last_error || 'n/a'}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => retryJob(job.id)}
                        disabled={retryingId === job.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1 disabled:opacity-60"
                      >
                        <RotateCw size={12} className={retryingId === job.id ? 'animate-spin' : ''} />
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Provider Health</h3>
            <div className="space-y-3">
              {(data?.provider_stats || []).length === 0 && (
                <p className="text-xs text-gray-500">No provider telemetry yet.</p>
              )}
              {(data?.provider_stats || []).map((row) => (
                <div key={row.provider} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{row.provider}</p>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{row.success_rate}%</span>
                  </div>
                  <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Jobs: {row.total}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">OK {row.succeeded}</span>
                    <span className="text-red-500">Fail {row.failed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Recent Sync Activity</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(data?.recent_jobs || []).slice(0, 10).map((job) => (
                <div key={job.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">#{job.id} · {job.provider}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${STATUS_STYLES[job.status] || STATUS_STYLES.queued}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 inline-flex items-center gap-1">
                    <Clock3 size={11} />
                    {formatDate(job.created_at)}
                  </p>
                </div>
              ))}
            </div>
            {!loading && (data?.recent_jobs || []).length === 0 && (
              <p className="text-xs text-gray-500">No jobs yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-5 shadow-lg flex items-start gap-3">
        {(data?.summary?.failed_or_retry_queued || 0) > 0 ? (
          <AlertTriangle size={18} className="mt-0.5" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5" />
        )}
        <div>
          <p className="text-sm font-black uppercase tracking-widest">
            {(data?.summary?.failed_or_retry_queued || 0) > 0 ? 'Action Recommended' : 'All Clear'}
          </p>
          <p className="text-xs text-indigo-50 mt-1">
            {(data?.summary?.failed_or_retry_queued || 0) > 0
              ? `There are ${data.summary.failed_or_retry_queued} sync jobs waiting for operator retry.`
              : 'All current integration syncs are healthy and no retries are pending.'}
          </p>
        </div>
      </div>
    </div>
  );
}
