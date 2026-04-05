import { useEffect, useMemo, useState } from 'react';
import { Shield, Clock, EyeOff, AlertTriangle, Save, Check, RefreshCw } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

export default function DataPoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retention, setRetention] = useState('90');
  const [piiEnabled, setPiiEnabled] = useState(true);
  const [auditLogs, setAuditLogs] = useState(true);
  const [banner, setBanner] = useState({ type: '', msg: '' });

  const token = getStoredToken();

  const retentionText = useMemo(() => {
    if (retention === 'never') return 'forever';
    return `${retention} days`;
  }, [retention]);

  useEffect(() => {
    const loadPolicies = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/workspace/data-policies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
        setRetention(Number(payload?.retention_days) === 0 ? 'never' : String(payload?.retention_days || 90));
        setPiiEnabled(Boolean(payload?.pii_redaction_enabled));
        setAuditLogs(Boolean(payload?.strict_audit_storage_enabled));
      } catch (error) {
        console.error('Failed to load data policies:', error);
        setBanner({ type: 'error', msg: error.message || 'Failed to load workspace policies.' });
      } finally {
        setLoading(false);
      }
    };
    loadPolicies();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setBanner({ type: '', msg: '' });
    try {
      const retentionValue = retention === 'never' ? 0 : Number(retention);
      const res = await fetch('/api/workspace/data-policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          retention_days: retentionValue,
          pii_redaction_enabled: piiEnabled,
          strict_audit_storage_enabled: auditLogs
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);

      const purged = Number(payload?.purged_contacts || 0);
      setBanner({
        type: 'success',
        msg: purged > 0
          ? `Policies saved. ${purged} unsynced contacts were purged by retention policy.`
          : 'Policies saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save policies:', error);
      setBanner({ type: 'error', msg: error.message || 'Failed to save policies.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Compliance Policies</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Enforce organization-wide rules for contact data retention and privacy masking.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all 
            ${saving ? 'bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : banner.type === 'success' ? <Check size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : banner.type === 'success' ? 'Saved' : 'Save Policies'}
        </button>
      </div>

      {banner.msg ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            banner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/40 dark:text-emerald-300'
          }`}
        >
          {banner.msg}
        </div>
      ) : null}

      <div className="grid gap-6">
        {/* Data Retention */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Automated Data Retention</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Define how long IntelliScan retains raw business card images and extracted contact data before permanent deletion if it hasn't been synced to your CRM.
            </p>
            <div className="max-w-xs">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Retention Period</label>
              <select 
                value={retention} onChange={(e) => setRetention(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
                <option value="never">Keep Forever</option>
              </select>
            </div>
            {retention !== 'never' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50 inline-block">
                <AlertTriangle size={14} className="inline mr-1" /> Data older than {retentionText} will be unrecoverably purged.
              </div>
            )}
          </div>
        </div>

        {/* PII Redaction */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <EyeOff size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">PII Image Redaction</h2>
              <div 
                className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${piiEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                onClick={() => !loading && setPiiEnabled(!piiEnabled)}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${piiEnabled ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              When enabled, the AI engine will preemptively blur personal mobile phone numbers and personal email domains (like @gmail.com) on the raw image file before it is stored in the database.
            </p>
          </div>
        </div>

        {/* Strict Audit Logging */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Shield size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Strict Compliance Audit Storage</h2>
              <div 
                className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${auditLogs ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                onClick={() => !loading && setAuditLogs(!auditLogs)}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${auditLogs ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              Maintains an immutable ledger of every user action involving contact exports, deletions, and CRM syncs for enterprise compliance auditing (e.g., SOC2).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
