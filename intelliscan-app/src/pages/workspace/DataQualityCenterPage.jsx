import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Filter, GitMerge, RefreshCw, Sparkles, Trash2, UserCheck } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

function personLabel(contact) {
  if (!contact) return 'Unknown Contact';
  const title = contact.job_title ? ` · ${contact.job_title}` : '';
  const company = contact.company ? ` @ ${contact.company}` : '';
  return `${contact.name || 'Unnamed'}${title}${company}`;
}

export default function DataQualityCenterPage() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, merged: 0, dismissed: 0 });
  const [impactedContacts, setImpactedContacts] = useState(0);
  const [selectedPrimary, setSelectedPrimary] = useState({});

  const token = getStoredToken();

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace/data-quality/dedupe-queue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const payload = await res.json();
      setQueue(payload?.queue || []);
      setSummary(payload?.summary || { pending: 0, merged: 0, dismissed: 0 });
      setImpactedContacts(payload?.impacted_contacts || 0);
    } catch (error) {
      console.error('Failed to load data quality queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingQueue = useMemo(() => (queue || []).filter((q) => q.status === 'pending'), [queue]);

  const mergeSuggestion = async (item) => {
    setBusyId(`merge-${item.id}`);
    const primaryId = Number(selectedPrimary[item.id] || item.primary_contact_id);
    try {
      const res = await fetch(`/api/workspace/data-quality/queue/${item.id}/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ primary_contact_id: primaryId })
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload?.error || payload?.message || 'Merge failed');
      }
      await loadQueue();
    } catch (error) {
      console.error('Merge action failed:', error);
      alert('Merge failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const dismissSuggestion = async (item) => {
    setBusyId(`dismiss-${item.id}`);
    try {
      const res = await fetch(`/api/workspace/data-quality/queue/${item.id}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Reviewed and dismissed' })
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload?.error || payload?.message || 'Dismiss failed');
      }
      await loadQueue();
    } catch (error) {
      console.error('Dismiss action failed:', error);
      alert('Dismiss failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles size={24} className="text-indigo-500" />
            Data Quality Center
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Review duplicate candidates, apply merge recommendations, and keep workspace contacts clean.
          </p>
        </div>
        <button
          onClick={loadQueue}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Re-scan Queue
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pending</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{summary.pending || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Merged</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{summary.merged || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dismissed</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{summary.dismissed || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Impacted Contacts</p>
          <p className="text-2xl font-extrabold text-indigo-500 mt-1">{impactedContacts}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Dedupe Queue</h2>
          <span className="text-xs text-gray-500 inline-flex items-center gap-1">
            <Filter size={13} />
            {pendingQueue.length} pending suggestions
          </span>
        </div>

        <div className="p-5 space-y-4">
          {loading && (
            <div className="text-sm text-gray-500">Building merge suggestions...</div>
          )}

          {!loading && pendingQueue.length === 0 && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 p-5 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-300">No pending duplicates</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                  Current contact data is clean. Re-scan any time to detect newly introduced duplicates.
                </p>
              </div>
            </div>
          )}

          {!loading && pendingQueue.map((item) => {
            const allOptions = [item.primary_contact, ...(item.duplicates || [])].filter(Boolean);
            return (
              <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Queue #{item.id}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{item.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">Confidence: {item.confidence}% · {item.contact_ids?.length || 0} contacts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busyId === `dismiss-${item.id}` || busyId === `merge-${item.id}`}
                      onClick={() => dismissSuggestion(item)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      <Trash2 size={12} />
                      Dismiss
                    </button>
                    <button
                      disabled={busyId === `merge-${item.id}` || busyId === `dismiss-${item.id}`}
                      onClick={() => mergeSuggestion(item)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      <GitMerge size={12} />
                      Merge
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Choose Primary Record</p>
                    <select
                      value={selectedPrimary[item.id] || item.primary_contact_id}
                      onChange={(e) => setSelectedPrimary((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none"
                    >
                      {allOptions.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.id} · {personLabel(contact)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
                      <UserCheck size={12} />
                      Suggested primary: {personLabel(item.primary_contact)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Merge Suggestions</p>
                    {Object.keys(item.merge_suggestions || {}).length === 0 && (
                      <p className="text-xs text-gray-500">No field enrichment needed.</p>
                    )}
                    {Object.entries(item.merge_suggestions || {}).map(([field, value]) => (
                      <p key={field} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                        <span className="font-bold">{field}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Duplicate Candidates</p>
                  <div className="space-y-1">
                    {allOptions.map((contact) => (
                      <p key={contact.id} className="text-xs text-gray-700 dark:text-gray-300">
                        #{contact.id} · {personLabel(contact)} · {contact.email || 'no email'} · {contact.phone || 'no phone'}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-5 shadow-lg flex items-start gap-3">
        {summary.pending > 0 ? (
          <AlertTriangle size={18} className="mt-0.5" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5" />
        )}
        <div>
          <p className="text-sm font-black uppercase tracking-widest">
            {summary.pending > 0 ? 'Review Required' : 'Quality Stable'}
          </p>
          <p className="text-xs text-indigo-50 mt-1">
            {summary.pending > 0
              ? `${summary.pending} duplicate suggestions are ready for review and merge.`
              : 'No active dedupe actions are required right now.'}
          </p>
        </div>
      </div>
    </div>
  );
}
