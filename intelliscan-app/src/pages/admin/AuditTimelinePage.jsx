import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserCheck, CreditCard, LogOut, 
  Search, ShieldCheck, Download, RefreshCw, 
  Clock, AlertTriangle, Key, Terminal
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

export default function AuditTimelinePage() {
  const [logs, setLogs] = useState([]);
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const token = getStoredToken();
      const [auditRes, pulseRes] = await Promise.all([
        fetch('/api/admin/audit/audit-timeline', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit/security-pulse', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (auditRes.ok) setLogs(await auditRes.json());
      if (pulseRes.ok) setPulse(await pulseRes.json());
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 min refresh
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return <UserCheck className="text-emerald-500" size={18} />;
      case 'LOGIN_FAIL': return <ShieldAlert className="text-red-500" size={18} />;
      case 'CARD_SCAN': return <CreditCard className="text-brand-500" size={18} />;
      case 'LOGOUT': return <LogOut className="text-gray-400" size={18} />;
      case 'PASSWORD_RESET': return <Key className="text-amber-500" size={18} />;
      default: return <Terminal className="text-gray-500" size={18} />;
    }
  };

  const filteredLogs = logs.filter(l => filter === 'ALL' || l.action === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck size={28} className="text-brand-600" />
            Cinematic Audit Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time visualization of all platform security and data events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Security Pulse Alert */}
      {pulse && (
        <div className={`p-6 rounded-3xl border-2 transition-all ${pulse.pulse_status === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${pulse.pulse_status === 'critical' ? 'bg-red-500' : 'bg-emerald-500'} text-white shadow-lg`}>
              {pulse.pulse_status === 'critical' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div className="flex-1">
              <h3 className={`font-black uppercase tracking-widest text-xs mb-1 ${pulse.pulse_status === 'critical' ? 'text-red-600' : 'text-emerald-600'}`}>
                Security Pulse: {pulse.pulse_status.toUpperCase()}
              </h3>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pulse.pulse_status === 'critical' 
                  ? `Suspicious activity detected: ${pulse.active_threats.join(', ')}`
                  : 'System integrity confirmed. No anomalous behavior detected in the last 24 hours.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Failed Logins (24h): <span className="text-gray-900 dark:text-white">{pulse.failed_logins_24h}</span></span>
                <span>Admin Failures: <span className="text-gray-900 dark:text-white">{pulse.unauthorized_admin_attempts}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline Section */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <RefreshCw size={40} className="animate-spin mb-4 opacity-20" />
            <p className="font-medium">Syncing Neural Logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
             <p className="text-gray-500">No events found in the current timeline segment.</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 hidden md:block" />

            {filteredLogs.map((log, i) => (
              <div key={log.id} className="relative flex flex-col md:flex-row gap-4 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="z-10 w-12 h-12 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:border-brand-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {log.action}
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{log.actor_email} ({log.actor_role})</p>
                    </div>
                    <div className="text-right flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/20 font-mono text-[11px] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                    <span className="text-brand-500">Resource:</span> {log.resource}
                    {log.details_json && log.details_json !== '{}' && (
                      <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                        <span className="text-brand-500">Payload:</span> {log.details_json}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
