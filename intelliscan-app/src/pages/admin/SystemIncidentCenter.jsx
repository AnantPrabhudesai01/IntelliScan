import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Plus, RefreshCw, ServerCrash, ShieldAlert, Trash2, Wrench, X } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

const SEVERITY_STYLES = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
};

const STATUS_STYLES = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  acknowledged: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
};

export default function SystemIncidentCenter() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    severity: 'medium',
    service: 'platform',
    impact: ''
  });

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/incidents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const stats = useMemo(() => {
    const open = incidents.filter(i => i.status === 'open').length;
    const acknowledged = incidents.filter(i => i.status === 'acknowledged').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const high = incidents.filter(i => i.severity === 'high').length;
    return { open, acknowledged, resolved, high };
  }, [incidents]);

  const doAction = async (id, action) => {
    setBusyId(id);
    try {
      const token = getStoredToken();
      const options = {
        method: action === 'delete' ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      };
      const endpoint = action === 'delete' ? `/api/admin/incidents/${id}` : `/api/admin/incidents/${id}/${action}`;
      const res = await fetch(endpoint, options);
      if (res.ok) {
        await fetchIncidents();
      }
    } catch (error) {
      console.error(`Incident action failed (${action}):`, error);
    } finally {
      setBusyId(null);
    }
  };

  const createIncident = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.service.trim()) return;
    setBusyId('create');
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: '', severity: 'medium', service: 'platform', impact: '' });
        await fetchIncidents();
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert size={24} className="text-red-500" />
            System Incident Center
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Track active platform incidents, acknowledge response ownership, and close resolved events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 flex items-center gap-2"
          >
            <Plus size={16} />
            New Incident
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Open</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1">{stats.open}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Acknowledged</p>
          <p className="text-2xl font-extrabold text-brand-500 mt-1">{stats.acknowledged}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{stats.resolved}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">High Severity</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{stats.high}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Incident</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Service</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Severity</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Created</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <tr>
                  <td className="px-5 py-10 text-sm text-gray-500" colSpan={6}>
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      Loading incidents...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && incidents.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-sm text-gray-500" colSpan={6}>
                    No incidents found.
                  </td>
                </tr>
              )}

              {!loading && incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{incident.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{incident.impact || 'No impact notes added'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <ServerCrash size={14} />
                      {incident.service}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase ${SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.medium}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_STYLES[incident.status] || STATUS_STYLES.open}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      {new Date(incident.created_at).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {incident.status === 'open' && (
                        <button
                          disabled={busyId === incident.id}
                          onClick={() => doAction(incident.id, 'ack')}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 disabled:opacity-60"
                        >
                          Acknowledge
                        </button>
                      )}

                      {incident.status !== 'resolved' && (
                        <button
                          disabled={busyId === incident.id}
                          onClick={() => doAction(incident.id, 'resolve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} />
                          Resolve
                        </button>
                      )}

                      <button
                        disabled={busyId === incident.id}
                        onClick={() => doAction(incident.id, 'delete')}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench size={16} />
                New Incident
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createIncident} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. OCR queue backlog in US-East"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none"
                  >
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Service</label>
                  <input
                    required
                    value={form.service}
                    onChange={(e) => setForm(prev => ({ ...prev, service: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/40"
                    placeholder="ocr-engine"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Impact Notes</label>
                <textarea
                  value={form.impact}
                  onChange={(e) => setForm(prev => ({ ...prev, impact: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
                  placeholder="Describe current user impact..."
                />
              </div>

              <button
                type="submit"
                disabled={busyId === 'create'}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                <AlertTriangle size={14} />
                {busyId === 'create' ? 'Creating...' : 'Create Incident'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
