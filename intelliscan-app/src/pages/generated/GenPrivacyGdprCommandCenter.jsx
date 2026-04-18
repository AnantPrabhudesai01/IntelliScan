import React, { useState, useEffect, useRef } from 'react';
import { Download, Trash2, RefreshCw, CheckCircle, Clock, ArrowUpRight, Shield, Check, X, AlertTriangle, Settings2, Filter } from 'lucide-react';

const INITIAL_REQUESTS = [
  { id: 'RTBF-2023-9941', initiator: 'user_hash_4f92...', time: '12 mins ago', score: 98.4, progress: 65, status: 'In Progress' },
  { id: 'RTBF-2023-9938', initiator: 'legal_automated', time: '4 hours ago', score: 100, progress: 100, status: 'Completed' },
  { id: 'RTBF-2023-9921', initiator: 'user_hash_a11b...', time: '2 days ago', score: 91.2, progress: 100, status: 'Completed' },
];

const DSR_LOG = [
  { ts: '2023-11-24 14:22:01', subject: 'usr_0xf82a1...', type: 'Portability', origin: 'Web Portal (v3.2)', status: 'Completed', statusColor: 'text-emerald-400', badge: 'bg-brand-500/20 text-brand-400 border-brand-500/20' },
  { ts: '2023-11-24 13:05:45', subject: 'usr_0x7b22c...', type: 'Rectification', origin: 'Legal API', status: 'Processing', statusColor: 'text-amber-400', badge: 'bg-red-500/20 text-red-400 border-red-500/20' },
  { ts: '2023-11-24 10:11:12', subject: 'usr_0xa910d...', type: 'Access', origin: 'Mobile App (iOS)', status: 'Pending', statusColor: 'text-gray-400', badge: 'bg-gray-500/20 text-gray-400 border-gray-500/20' },
  { ts: '2023-11-23 09:00:00', subject: 'usr_0xc334e...', type: 'Erasure', origin: 'Web Portal (v3.2)', status: 'Completed', statusColor: 'text-emerald-400', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
];

function Toast({ msg, type = 'success' }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-amber-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check size={16} /> : type === 'warning' ? <AlertTriangle size={16} /> : <Shield size={16} />}
      {msg}
    </div>
  );
}

function PolicyModal({ onClose, compliance }) {
  const [threshold, setThreshold] = useState(7);
  const [region, setRegion] = useState('GDPR - EU Standard');
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Data Retention Policy</h2>
            <p className="text-sm text-gray-400 mt-0.5">Adjust compliance parameters for all active regions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"><X size={20} /></button>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Retention Threshold (Years)</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={10} step={1} value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              <span className="text-xl font-bold text-brand-400 w-8 text-center">{threshold}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Currently: Standard {threshold}-Year Policy</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Compliance Mode</label>
            <select value={region} onChange={e => setRegion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
              {['GDPR - EU Standard', 'CCPA - California', 'PDPB - India', 'LGPD - Brazil', 'PIPL - China'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-sm text-gray-300">Current Compliance Score</span>
            <span className="text-2xl font-black text-brand-400">{compliance}%</span>
          </div>
        </div>
        <div className="px-8 py-5 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-300 bg-white/10 rounded-xl hover:bg-white/20 transition-all">Cancel</button>
          <button onClick={() => { setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1200); }}
            className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'}`}>
            {saved ? <><Check size={15} /> Saved!</> : 'Apply Policy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenPrivacyGdprCommandCenter() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [toast, setToast] = useState(null);
  const [purgeState, setPurgeState] = useState('idle'); // idle | confirm | purging | done
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [dsrFilter, setDsrFilter] = useState('');
  const [compliance, setCompliance] = useState(90);
  const timerRef = useRef(null);

  // Simulate live update for in-progress request
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev => prev.map(r => {
        if (r.status === 'In Progress' && r.progress < 100) {
          const newProgress = Math.min(r.progress + Math.floor(Math.random() * 3), 100);
          return { ...r, progress: newProgress, status: newProgress === 100 ? 'Completed' : 'In Progress', score: newProgress === 100 ? 100 : r.score };
        }
        return r;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      compliance_score: compliance,
      requests,
      dsr_log: DSR_LOG,
      policy: 'GDPR - EU Standard 7-Year',
      clusters: { eu: 42, us: 18, asia: 11 },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gdpr_compliance_report_${Date.now()}.json`;
    a.click();
    showToast('Compliance report downloaded as JSON!');
  };

  const handleTriggerPurge = () => {
    if (purgeState === 'idle') {
      setPurgeState('confirm');
      showToast('⚠ Confirm purge action below within 10 seconds.', 'warning');
      timerRef.current = setTimeout(() => setPurgeState('idle'), 10000);
    } else if (purgeState === 'confirm') {
      clearTimeout(timerRef.current);
      setPurgeState('purging');
      showToast('Purge initiated — scanning PII records...', 'warning');
      setTimeout(() => {
        setPurgeState('done');
        setCompliance(prev => Math.min(prev + 2, 100));
        showToast('Manual purge completed — 1,284 records removed.', 'success');
        setTimeout(() => setPurgeState('idle'), 3000);
      }, 3500);
    }
  };

  const filteredLog = DSR_LOG.filter(r =>
    r.subject.includes(dsrFilter) || r.type.toLowerCase().includes(dsrFilter.toLowerCase()) || r.status.toLowerCase().includes(dsrFilter.toLowerCase())
  );

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Platform Admin';

  return (
    <div className="w-full h-full animate-fade-in relative">
      <Toast msg={toast?.msg} type={toast?.type} />
      {showPolicyModal && <PolicyModal onClose={() => setShowPolicyModal(false)} compliance={compliance} />}

      <div className="p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-white">GDPR Command Center</h2>
            <p className="text-gray-400 mt-1">Real-time data privacy governance and residency monitoring.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportReport}
              className="bg-[#1e2840] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#253060] transition-colors active:scale-95 border border-white/10">
              <Download size={16} /> Export Compliance Report
            </button>
            <button onClick={handleTriggerPurge}
              disabled={purgeState === 'purging' || purgeState === 'done'}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                purgeState === 'confirm' ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' :
                purgeState === 'purging' ? 'bg-orange-600 text-white cursor-wait' :
                purgeState === 'done' ? 'bg-green-600 text-white' :
                'bg-brand-600 hover:bg-brand-700 text-white'
              }`}>
              {purgeState === 'idle' ? <><Trash2 size={16} /> Trigger Manual Purge</> :
               purgeState === 'confirm' ? <><AlertTriangle size={16} /> CONFIRM PURGE?</> :
               purgeState === 'purging' ? <><RefreshCw size={16} className="animate-spin" /> Purging Records...</> :
               <><Check size={16} /> Purge Complete</>}
            </button>
          </div>
        </div>

        {/* Super Admin Badge */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3 p-4 bg-brand-600/10 border border-brand-500/30 rounded-xl">
            <Shield size={20} className="text-brand-400" />
            <p className="text-sm text-brand-300 font-bold">Super Admin Access — Full GDPR command center enabled including purge controls and policy adjustment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Right-to-be-Forgotten Queue */}
          <div className="md:col-span-8 bg-[#131929] rounded-xl p-6 relative overflow-hidden border border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-lg text-white">"Right to be Forgotten" Requests</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Queue Monitoring</p>
              </div>
              <div className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Live Updates
              </div>
            </div>

            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-[#1e2840] rounded-xl hover:bg-[#253060] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                      <Trash2 size={18} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{req.id}</p>
                      <p className="text-xs text-gray-400">Initiated by: {req.initiator} • {req.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold text-gray-400">Confidence</p>
                      <div className="text-brand-400 font-black text-sm mt-1">{req.score.toFixed(1)}%</div>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${req.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                          style={{ width: `${req.progress}%` }} />
                      </div>
                      <p className={`text-[10px] font-bold mt-1 ${req.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>{req.status}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-mono text-brand-300 bg-brand-500/10 px-2 py-1 rounded">ENGINE: OCR-V2-PURGE</span>
              <button className="text-sm text-brand-400 font-semibold flex items-center gap-1 hover:text-brand-300">
                View Full Queue <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Retention Status */}
          <div className="md:col-span-4 bg-[#131929] rounded-xl p-6 flex flex-col border border-white/5">
            <h3 className="font-headline font-bold text-white flex items-center gap-2 mb-6">
              <Clock size={18} className="text-brand-400" /> Retention Status
            </h3>
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="transparent" stroke="#1e2840" strokeWidth="10" />
                  <circle cx="60" cy="60" r="54" fill="transparent" stroke="#6366f1" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - compliance / 100)}`}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{compliance}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Compliant</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mb-6 leading-relaxed">
                <span className="text-white font-bold">4.2 PB</span> of data managed under current{' '}
                <span className="text-brand-400 italic">Standard 7-Year</span> policy.
              </p>
            </div>
            <button onClick={() => setShowPolicyModal(true)}
              className="w-full py-2.5 bg-brand-600/20 border border-brand-500/30 rounded-lg text-sm font-bold text-brand-400 hover:bg-brand-600/30 transition-colors active:scale-95 flex items-center justify-center gap-2">
              <Settings2 size={15} /> Adjust Policy Params
            </button>
          </div>

          {/* Google Maps - Data Residency */}
          <div className="md:col-span-12 bg-[#131929] rounded-xl p-8 overflow-hidden relative border border-white/5">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="font-headline font-bold text-xl text-white">Global Data Residency</h3>
                <p className="text-gray-400 text-sm">Real-time geographic distribution of PII storage units.</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                {[['EU Cluster', '42 Regions'], ['US Cluster', '18 Regions'], ['Asia Cluster', '11 Regions']].map(([label, val]) => (
                  <div key={label} className="text-center px-4 py-2 bg-[#1e2840] rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
                    <p className="text-white font-black">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stylized Image Map (Reverted from Google Maps) */}
            <div className="relative h-80 rounded-2xl overflow-hidden bg-surface-container border border-white/10">
              <div className="absolute inset-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <img className="w-full h-full object-cover" alt="Digital stylized world map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtvwtmBhqjonFxx4R0YsrzLsWsoWfxNN82Wdcl7Jd8oCtOse-rLJ-Y2qbMJVLq-izU-puByo7_VRvTx_L5mqyBi4v5EVRFzGShVnWc6lgCJRx71Ji92pXxiY6n6N90sV9DBFcF9iuxhSyTZ7HIRuIoYxOrCu6Ktb8-bWpdBiuv7eeB5W1vJ8CyaoF62MgE8w4GQ8s7Unrf5KQLEuiwoyxj_cYNCQYn4DSCRz_l0Ehsdv0LfsG2AiQuQbt9b2GV2YcrdKIl6ie_ufIa" />
              </div>
              
              {/* Overlay pins */}
              <div className="absolute inset-0 pointer-events-none">
                {/* EU Pin */}
                <div className="absolute group/pin" style={{ top: '25%', left: '25%' }}>
                  <div className="w-4 h-4 bg-brand-500 rounded-full animate-ping absolute opacity-75" />
                  <div className="w-4 h-4 bg-brand-500 rounded-full relative shadow-lg shadow-brand-500/50" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-gray-900 border border-white/10 rounded-lg p-2 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-auto">
                    <p className="text-[10px] font-bold text-white">Frankfurt (FRA-1)</p>
                    <p className="text-[9px] text-brand-300">Active Residency: GDPR v4</p>
                  </div>
                </div>
                {/* US Pin */}
                <div className="absolute group/pin" style={{ top: '35%', left: '15%' }}>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full relative shadow-lg shadow-emerald-400/50" />
                </div>
                {/* Asia Pin */}
                <div className="absolute group/pin" style={{ top: '50%', right: '25%' }}>
                  <div className="w-3 h-3 bg-amber-400 rounded-full relative shadow-lg shadow-amber-400/50" />
                </div>
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-[#1e2840]/90 backdrop-blur-md border border-white/10 rounded-xl p-3">
                  {[['bg-brand-500', 'Strict Compliance'], ['bg-emerald-400', 'Standard Sync'], ['bg-amber-400', 'Review Required']].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-[10px] text-white">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DSR Transaction Log */}
          <div className="md:col-span-12 bg-[#131929] rounded-xl p-8 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl text-white">DSR Transaction Log</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={dsrFilter}
                    onChange={e => setDsrFilter(e.target.value)}
                    className="bg-[#1e2840] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-brand-500 w-56 placeholder:text-gray-500 outline-none"
                    placeholder="Filter log entries..."
                    type="text"
                  />
                </div>
                <button onClick={handleExportReport}
                  className="px-3 py-2 bg-[#1e2840] border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-[#253060] transition-all flex items-center gap-2">
                  <Download size={13} /> Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
                    {['Timestamp', 'Subject ID', 'Type', 'Origin', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((row, i) => (
                    <tr key={i} className="bg-[#1e2840]/40 hover:bg-[#1e2840] transition-colors group cursor-pointer">
                      <td className="px-4 py-4 rounded-l-xl text-sm font-mono text-gray-400">{row.ts}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">{row.subject}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${row.badge}`}>{row.type}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">{row.origin}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${row.statusColor}`}>
                          {row.status === 'Completed' ? <CheckCircle size={12} /> : row.status === 'Processing' ? <RefreshCw size={12} className="animate-spin" /> : <Clock size={12} />}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 rounded-r-xl text-right">
                        <button className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10">
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
