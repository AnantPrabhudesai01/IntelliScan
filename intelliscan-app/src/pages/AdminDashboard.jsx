import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Server, Activity, ShieldCheck, Shield, Terminal, Rocket, FileDown, Check, X, Globe, RefreshCcw } from 'lucide-react';

const LOG_TEMPLATES = [
  {
    type: 'INFO', color: 'text-emerald-500', msgs: [
      "Workspace 'Quantum_AI' successfully migrated to NODE_04",
      "Global OCR confidence score reached 98.4% (avg).",
      "Scheduled maintenance window cleared for Asia cluster.",
      "API quota reset completed for 1,284 workspaces.",
      "Backup sync complete across 3 datacenters.",
    ]
  },
  {
    type: 'WARN', color: 'text-amber-500', msgs: [
      "Peak throughput detected in AP-West. Scaling secondary nodes.",
      "EU-Central node latency spiked to 180ms.",
      "Memory threshold at 78% on cluster-node-alpha-7.",
      "Retry storm detected on /api/v2/scan endpoint.",
    ]
  },
  {
    type: 'SYS', color: 'text-brand-400', msgs: [
      "Automated security handshake completed for 402 endpoints.",
      "Certificate rotation initiated for *.intelliscan.ai",
      "TLS 1.3 upgrade applied to all ingress nodes.",
    ]
  },
  {
    type: 'ERR', color: 'text-red-500', msgs: [
      "DB_REPL_TIMEOUT on AS-S-1 (shards 12–14).",
      "Socket hang up at node-ingress-7.",
    ]
  },
];

function getRandomLog() {
  const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const msg = tpl.msgs[Math.floor(Math.random() * tpl.msgs.length)];
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
  return { time, type: tpl.type, msg, color: tpl.color };
}

const INITIAL_LOGS = [
  { time: '14:22:01', type: 'INFO', msg: "Workspace 'Quantum_AI' successfully migrated to NODE_04", color: 'text-emerald-500' },
  { time: '14:19:55', type: 'WARN', msg: 'Peak throughput detected in AP-West. Scaling secondary nodes.', color: 'text-amber-500' },
  { time: '14:15:32', type: 'INFO', msg: 'Global OCR confidence score reached 98.4% (avg).', color: 'text-emerald-500' },
  { time: '14:10:01', type: 'SYS', msg: 'Automated security handshake completed for 402 endpoints.', color: 'text-brand-400' },
];

function GlobalMapModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe size={18} className="text-brand-400" /> Global Node Distribution Map</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="relative bg-[#0d1117]">
          <img className="w-full object-cover opacity-60 h-80" alt="World Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClPEpc16u1-ZHJlZRaQfYD_nULRrgJzgJoTqINQ7U96AK6ddyWMhoWI6MFMrZT9uyLyg3Fe8Z07gecO1wDPLuf52VcLzJGt77p-dCRXCeVZu8WB5UPO7sXYEgEbN8jE54yRpcDLvoQCM9P4BIWvuKID7TcNS-c7apu_k1Fgg4XOkJASbDpyQuSb20UTMNG-tcyYsvm7xlTKPZCaKV4YNf7_Bm9DKHe4YCj4N3LuY5JxToK_TZ3NKo0YLBfEbIXKDFgDnCUi74txcmn" />
          {[
            { label: 'US-East (N. Virginia)', load: '24%', ping: '12ms', x: '22%', y: '35%', color: 'bg-brand-500' },
            { label: 'EU-Central (Frankfurt)', load: '68%', ping: '28ms', x: '50%', y: '28%', color: 'bg-amber-500' },
            { label: 'AS-South (Singapore)', load: '41%', ping: '56ms', x: '75%', y: '62%', color: 'bg-emerald-500' },
          ].map(n => (
            <div key={n.label} className="absolute group cursor-pointer" style={{ left: n.x, top: n.y }}>
              <div className={`w-4 h-4 ${n.color} rounded-full border-2 border-white animate-pulse shadow-lg`} />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-mono rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10">
                <div className="font-bold">{n.label}</div>
                <div className="text-gray-400">Load: {n.load} | Ping: {n.ping}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Throughput', value: '1.2 TB/s', color: 'text-brand-400' },
            { label: 'Active Instances', value: '128', color: 'text-green-400' },
            { label: 'Total Scans/Min', value: '48.2k', color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScaleReportModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">AI Scale Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4 mb-6">
          {[
            { label: 'Total Active Workspaces', value: '1,284', trend: '+12.4%', good: true },
            { label: 'EMEA Region Capacity', value: '45%', trend: 'Healthy', good: true },
            { label: 'Asia Pacific Load', value: '89%', trend: '⚠ Expansion Recommended', good: false },
            { label: 'Monthly Scan Volume', value: '4.2M', trend: '+8.9%', good: true },
            { label: 'Predicted Q3 Node Demand', value: '+15%', trend: 'EMEA & APAC', good: null },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-300">{item.label}</span>
              <div className="text-right">
                <span className="text-sm font-bold text-white">{item.value}</span>
                <span className={`ml-2 text-[10px] font-bold ${item.good === true ? 'text-green-400' : item.good === false ? 'text-amber-400' : 'text-brand-400'}`}>{item.trend}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => {
          const report = { generatedAt: new Date().toISOString(), workspaces: 1284, capacity: { emea: '45%', apac: '89%' }, recommendation: 'Scale APAC by 15% before Q3' };
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scale_report.json'; a.click();
        }}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
          <FileDown size={18} /> Download Report (JSON)
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [pendingWorkspaces, setPendingWorkspaces] = useState(4);
  const [approved, setApproved] = useState(false);
  const [toast, setToast] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showScaleReport, setShowScaleReport] = useState(false);
  const logRef = useRef(null);

  // Live log generation
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [getRandomLog(), ...prev].slice(0, 20));
    }, 4000);
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

  const handleApproveAll = () => {
    if (pendingWorkspaces === 0) return;
    setPendingWorkspaces(0);
    setApproved(true);
    showToast(`${pendingWorkspaces} workspaces approved and provisioned!`);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3">
          <Check size={16} /> {toast.msg}
        </div>
      )}
      {showMap && <GlobalMapModal onClose={() => setShowMap(false)} />}
      {showScaleReport && <ScaleReportModal onClose={() => setShowScaleReport(false)} />}

      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-gray-900 dark:bg-[#161c28] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group border border-gray-800 dark:border-transparent">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1">Global Scale</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight font-headline">1,284</h2>
            <p className="text-gray-400 text-sm mt-1">Active Workspaces</p>
          </div>
          <div className="mt-8 flex items-end justify-between relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={14} /> +12.4%
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Health Status</p>
              <p className="text-brand-400 text-sm font-semibold">Optimized</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl"><Server size={24} /></div>
            <span className="text-xs text-gray-500 font-mono">NODE_99</span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">System Uptime</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">99.98%</span>
          </div>
          <div className="mt-auto h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300 w-[99.98%]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 rounded-xl"><Activity size={24} /></div>
            <span className="text-xs text-green-500 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE_FEED</span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Global Volume</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">4.2M</span>
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
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold font-headline text-gray-900 dark:text-white tracking-tight">Market Expansion</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Top performing processing regions by throughput</p>
            </div>
            <button onClick={() => setShowMap(true)} className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline flex items-center gap-1">
              <Globe size={14} /> View Global Map
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'North America East', pct: 88, color: 'bg-brand-500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5mLJyXNuelEccv3egHkkpruF2YA1_FQZ9ij5lo5-yYrf1zZX61BX36wK6beuogLu_Oac1UJT7R08INNQMx3xTDfdFICQx7V8Vnad7J_F2hadqd_yVxgeNkwaJ11kYp-Sf8CHVKdAKVqtxFzMSYIhTLifvL5t3bx5yhH2-7ZahBIARmWtCOVQz9Ri77U4sF9ZkzoeKQYvFl_vlsDLIUXORJDjg2gSb7yEytsbJwHK6O4JNnluYVdTC_vUI2NZlRyBfVSoPD5-k9scL' },
              { label: 'Asia Pacific West', pct: 62, color: 'bg-blue-500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq5fCYVe8IpPNJW8Ijaj7Kxe2wV2kq4yr0Wsn8lOACk69EiUWwcSujdOLKnWFT_O214CxvuoALcxGflP_4N3OPBOHcr9wdPYMynbTdmrEhK_0cy8AxDV03B6MOIlvjzfXQ31L_DUSnLfCqUrWuxgisNhoh6mLlNRvAhv7HZaZ6tVQM1XIBUVh8kmgJn_OEBQWD8f1wcqJ0Qw25j6u4ceMXhN5kv-ycPgEyZF7Jr9xTXbjNq-FDUzM5MGMjNBjEO9HhyuwjOVfZZevW' },
              { label: 'Europe Central', pct: 45, color: 'bg-emerald-500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaENBtUn7SaTZT8GLjLkdi-YLGe7P5oGTWEe_3ZfEyGunRdXm51c1yUTStlOu3Nn5dgvgjZH8ePC2lY40Z8wUDX5g3wHyQ7OswqPNaZ8m4_cio57gV5TqQewgjtR4sTsJ41Z6SZu2PO5Sj1rdDFemQfqO8SC-9l6tvydS8QAb5VxB2NTPjtyI0ftIE-cDCuSV0nnWKcaWDMBtqOqZ3PO8WMH-2s7i-mvN_ZETdT_veaf8NrmERwlBv1SQKtoHaOQzO9O7KAMru-pVs' },
              { label: 'Australia South', pct: 31, color: 'bg-brand-500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx_E01-z9sG4RBqZtO9JfKDu4MlpK4QRHgjzkSLipiG3YKaR-fqKGnLxDqcj0gxjxRR97LtH9d5Cuc51tLp_I220uMCT-6BKMZbkMPKguFGw39Vs9Xq-dIrGVhGr-5t_AN05VgKxvCF4CDWSSFPINi1MUGJ5x-qDBF8eYEQLAl0IkH0If0tdEmK8HfP0vxaHK8pe1fCg1aQC6SILefoBzxATkCBsMtCVgE4E4pF2BMBpUgHi3ojxvhy9BaouSOkXCdwWxCrpdM_Kp6' },
            ].map(r => (
              <div key={r.label} className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-5 rounded-xl flex items-center gap-5 group hover:bg-gray-50 dark:hover:bg-[#1a202c] transition-all shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img alt={r.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={r.img} />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white font-bold">{r.label}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-gray-500">{r.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engine Intelligence */}
          <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-headline">Engine Intelligence distribution</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500" /><span className="text-xs text-gray-500">OCR-V2</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-xs text-gray-500">NLP-Beta</span></div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
              {[[65, 20], [85, 35], [45, 15], [92, 40], [70, 25], [55, 10]].map(([ocr, nlp], i) => (
                <div key={i} className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl relative group cursor-pointer">
                  <div className="absolute bottom-0 w-full bg-brand-500 rounded-t-xl group-hover:opacity-80 transition-opacity" style={{ height: `${ocr}%` }} />
                  <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-xl z-10" style={{ height: `${nlp}%` }} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] font-mono rounded px-2 py-1 whitespace-nowrap z-20">
                    OCR: {ocr}% | NLP: {nlp}%
                  </div>
                </div>
              ))}
            </div>
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
            <div ref={logRef} className="space-y-3 max-h-48 overflow-y-auto">
              {logs.slice(0, 5).map((l, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-gray-400 font-mono flex-shrink-0">{l.time}</span>
                  <div className="flex-1">
                    <span className={`font-bold ${l.color}`}>[{l.type}]</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-0.5">{l.msg}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleExportLogs}
              className="w-full mt-6 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-[#2f3542] text-gray-900 dark:text-white text-xs font-semibold dark:hover:bg-[#343946] transition-all border border-gray-200 dark:border-transparent flex items-center justify-center gap-2 active:scale-95">
              <FileDown size={14} /> Export Raw Logs
            </button>
          </div>

          {/* System Expansion */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><Rocket size={100} /></div>
            <h4 className="text-xl font-headline font-extrabold mb-2 relative z-10">System Expansion</h4>
            <p className="text-sm text-brand-100 relative z-10 mb-6 font-medium">
              {pendingWorkspaces > 0
                ? `${pendingWorkspaces} new workspaces are awaiting provisioning review.`
                : '✅ All workspaces have been provisioned.'}
            </p>
            <button
              onClick={handleApproveAll}
              disabled={pendingWorkspaces === 0}
              className={`relative z-10 px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition-all w-full md:w-auto active:scale-95 ${pendingWorkspaces > 0
                  ? 'bg-white text-brand-700 hover:bg-brand-50'
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
                }`}>
              {approved ? '✓ All Approved' : 'Approve All'}
            </button>
            {/* Generate Scale Report button */}
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
