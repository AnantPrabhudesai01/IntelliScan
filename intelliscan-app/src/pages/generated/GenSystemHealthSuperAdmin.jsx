import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check, X, Plus, Activity, Shield, Server, Database, Zap, Download, RefreshCcw } from 'lucide-react';

const LOG_POOL = [
  { level: 'INFO',  color: 'text-indigo-400',  msgs: ['Auth provider handshake success (v2.1.0)', 'API mesh routing tables updated', 'Garbage collection cycle complete (12ms)', 'OCR engine heartbeats (64/64) confirmed', 'Backup sync completed across 3 datacenters', 'Certificate rotation scheduled for next cycle'] },
  { level: 'WARN',  color: 'text-amber-400',   msgs: ['Node EU-C-4 latency exceeded 150ms', 'High disk I/O on logging container', 'Memory threshold reached 78% on cluster-alpha', 'Retry storm detected on /api/v2/scan'] },
  { level: 'ERR',   color: 'text-red-500',     msgs: ['DB_REPL_TIMEOUT on AS-S-1 (Shards 12-14)', 'Socket hang up at node-ingress-7', 'TLS handshake failed for 3 endpoints'] },
  { level: 'SYS',   color: 'text-blue-400',    msgs: ['Scaling operation initiated: EU-Central', 'Node provisioned: EU-C-5', 'Failover complete: US-East-B', 'Load balancer weights redistributed'] },
];

function getLog() {
  const pool = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
  const msg = pool.msgs[Math.floor(Math.random() * pool.msgs.length)];
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
  return { time, level: pool.level, msg, color: pool.color };
}

const INIT_LOGS = [
  { time: '14:22:01', level: 'INFO', msg: 'Auth provider handshake success (v2.1.0)', color: 'text-indigo-400' },
  { time: '14:22:03', level: 'WARN', msg: 'Node EU-C-4 latency exceeded 150ms', color: 'text-amber-400' },
  { time: '14:22:05', level: 'ERR',  msg: 'DB_REPL_TIMEOUT on AS-S-1 (Shards 12-14)', color: 'text-red-500' },
  { time: '14:22:08', level: 'INFO', msg: 'Scaling operation initiated: EU-Central', color: 'text-indigo-400' },
  { time: '14:22:12', level: 'INFO', msg: 'OCR engine heartbeats (64/64) confirmed', color: 'text-indigo-400' },
  { time: '14:22:15', level: 'ERR',  msg: 'Socket hang up at node-ingress-7', color: 'text-red-500' },
  { time: '14:22:18', level: 'INFO', msg: 'Garbage collection cycle complete (12ms)', color: 'text-indigo-400' },
  { time: '14:22:21', level: 'INFO', msg: 'API mesh routing tables updated', color: 'text-indigo-400' },
  { time: '14:22:24', level: 'WARN', msg: 'High disk I/O on logging container', color: 'text-amber-400' },
];

const INIT_CLUSTERS = {
  'US-East-1':  { uptime: '99.99', cpu: 24.2, mem: 4.2, nodes: 12, load: 24 },
  'EU-Central-1': { uptime: '99.97', cpu: 68.5, mem: 12.8, nodes: 8, load: 69 },
  'AS-South-1': { uptime: '98.21', cpu: 41.1, mem: 8.1, nodes: 6, load: 58 },
};

const ALERTS_INITIAL = [
  { id: 1, level: 'ERR',  title: 'DB Replication Lag',   msg: 'Node AS-South reporting 14s lag. Auto-correction failed.', dismissed: false },
  { id: 2, level: 'WARN', title: 'High Memory Usage',    msg: 'OCR-V2 Cluster 4 at 89% capacity.', dismissed: false },
];

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {toast.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />} {toast.msg}
    </div>
  );
}

export default function GenSystemHealthSuperAdmin() {
  const [logs, setLogs] = useState(INIT_LOGS);
  const [clusters, setClusters] = useState(INIT_CLUSTERS);
  const [alerts, setAlerts] = useState(ALERTS_INITIAL);
  const [failoverStatus, setFailoverStatus] = useState(null); // null | 'confirming' | 'in_progress' | 'complete'
  const [scalingCluster, setScalingCluster] = useState(null);
  const [toast, setToast] = useState(null);
  const [showFullLogs, setShowFullLogs] = useState(false);
  const logRef = useRef(null);

  // Live log stream
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [getLog(), ...prev].slice(0, 50));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Scroll logs to top on new entry
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs.length]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInitiateTransition = () => {
    if (failoverStatus === null) {
      setFailoverStatus('confirming');
    } else if (failoverStatus === 'confirming') {
      setFailoverStatus('in_progress');
      showToast('Failover initiated: Traffic transitioning from US-East to US-West...');
      const now = new Date();
      const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
      setLogs(prev => [
        { time, level: 'SYS', msg: 'Failover initiated: US-East → US-West (Manual Override)', color: 'text-blue-400' },
        ...prev
      ].slice(0, 50));
      setTimeout(() => {
        setFailoverStatus('complete');
        showToast('Failover complete! US-West is now primary.');
        const now2 = new Date();
        const time2 = [now2.getHours(), now2.getMinutes(), now2.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
        setLogs(prev => [{ time: time2, level: 'SYS', msg: 'Failover complete: US-West-B now serving as primary node.', color: 'text-blue-400' }, ...prev].slice(0, 50));
      }, 3000);
    }
  };

  const handleScaleCluster = (clusterKey, nodeCount) => {
    setScalingCluster(clusterKey + nodeCount);
    setTimeout(() => {
      setClusters(prev => ({
        ...prev,
        [clusterKey]: { ...prev[clusterKey], nodes: prev[clusterKey].nodes + nodeCount, load: Math.max(20, prev[clusterKey].load - nodeCount * 5) }
      }));
      setScalingCluster(null);
      showToast(`+${nodeCount} nodes provisioned for ${clusterKey}!`);
      const now = new Date();
      const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
      setLogs(prev => [{ time, level: 'SYS', msg: `Scaled ${clusterKey}: +${nodeCount} nodes provisioned. Current: ${(prev[0]?.nodes || 0) + nodeCount}`, color: 'text-blue-400' }, ...prev].slice(0, 50));
    }, 2000);
  };

  const handleDismissAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const handleExportLogs = () => {
    const content = logs.map(l => `[${l.time}] ${l.level}: ${l.msg}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `system_logs_${Date.now()}.txt`; a.click();
    showToast('System logs exported!');
  };

  const clusterList = Object.entries(clusters);
  const activeAlerts = alerts.filter(a => !a.dismissed);

  return (
    <div className="w-full h-full animate-fade-in pb-20">
      <Toast toast={toast} />

      {/* Full Logs Modal */}
      {showFullLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6" onClick={() => setShowFullLogs(false)}>
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl premium-grain" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--border-subtle)] bg-[var(--surface)]/50">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
                    <Activity size={20} />
                 </div>
                 <div>
                    <h2 className="text-xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Infrastructure Logs</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{logs.length} Vectors Captured</p>
                 </div>
              </div>
              <div className="flex gap-6">
                <button onClick={handleExportLogs} className="text-[10px] font-black uppercase tracking-widest text-[var(--brand)] flex items-center gap-2 hover:underline"><Download size={14} /> Matrix Export</button>
                <button onClick={() => setShowFullLogs(false)} className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"><X size={24} /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-10 font-mono text-[11px] space-y-2 flex-1 scrollbar-hide bg-[var(--surface)]">
              {logs.map((l, i) => (
                <div key={i} className="hover:bg-[var(--brand)]/5 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-[var(--brand)]/10">
                  <span className="text-[var(--brand)] opacity-40 mr-4">[{l.time}]</span>
                  <span className={`font-black uppercase tracking-widest ${l.color === 'text-indigo-400' ? 'text-[var(--brand)]' : l.color} mr-4`}>{l.level}:</span>
                  <span className="text-[var(--text-main)] opacity-80">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-[var(--brand)]/10 rounded-2xl border border-[var(--brand)]/20 shadow-inner">
                 <Server size={24} className="text-[var(--brand)]" />
               </div>
               <div>
                 <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight">Infrastructure <br/>Pulse</h1>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Global Node Network</p>
               </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
               Real-time architectural monitoring across the global IntelliScan grid. Neural latency and compute cycles are visualized in atomic precision.
            </p>
          </div>
          <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${activeAlerts.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/10' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${activeAlerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            {activeAlerts.length > 0 ? `${activeAlerts.length} Critical Vectors` : 'System Architecture Stable'}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* World Map */}
          <section className="col-span-12 lg:col-span-8 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden relative min-h-[500px] shadow-2xl premium-grain">
            <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
              <img className="w-full h-full object-cover grayscale brightness-[0.2]" alt="Global node map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClPEpc16u1-ZHJlZRaQfYD_nULRrgJzgJoTqINQ7U96AK6ddyWMhoWI6MFMrZT9uyLyg3Fe8Z07gecO1wDPLuf52VcLzJGt77p-dCRXCeVZu8WB5UPO7sXYEgEbN8jE54yRpcDLvoQCM9P4BIWvuKID7TcNS-c7apu_k1Fgg4XOkJASbDpyQuSb20UTMNG-tcyYsvm7xlTKPZCaKV4YNf7_Bm9DKHe4YCj4N3LuY5JxToK_TZ3NKo0YLBfEbIXKDFgDnCUi74txcmn" />
            </div>
            <div className="relative z-10 p-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Global Pulse Matrix</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Neural Round-Trip: 42ms (Average)</p>
                </div>
                <div className="flex gap-4">
                  <span className="px-4 py-1.5 bg-[var(--surface)] text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] rounded-full border border-[var(--border-subtle)] backdrop-blur shadow-inner">{clusterList.length} Network Clusters</span>
                  <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border border-current backdrop-blur shadow-inner ${activeAlerts.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {activeAlerts.length > 0 ? 'Alert Engaged' : 'Operational'}
                  </span>
                </div>
              </div>

              <div className="flex-1 relative">
                {[
                  { label: 'US-East Node', load: clusters['US-East-1'].load, x: '22%', y: '33%' },
                  { label: 'EU-Central Node', load: clusters['EU-Central-1'].load, x: '48%', y: '26%' },
                  { label: 'AS-South Node', load: clusters['AS-South-1'].load, x: '74%', y: '60%' },
                ].map(n => (
                  <div key={n.label} className="absolute group cursor-pointer" style={{ left: n.x, top: n.y }}>
                    <div className="relative">
                      <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${n.load > 60 ? 'bg-amber-500' : 'bg-[var(--brand)]'}`} />
                      <div className={`h-4 w-4 rounded-full border-2 border-white shadow-xl ${n.load > 60 ? 'bg-amber-500' : 'bg-[var(--brand)]'}`} />
                    </div>
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[var(--surface-card)] px-4 py-3 rounded-2xl border border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 shadow-2xl premium-grain pointer-events-none">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-1">{n.label}</p>
                      <p className={`text-[12px] font-headline font-black italic tracking-tighter uppercase ${n.load > 60 ? 'text-amber-500' : 'text-[var(--brand)]'}`}>Load: {n.load}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-10 pt-10 border-t border-[var(--border-subtle)]/50">
                <div><span className="block text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 italic">Grid Throughput</span><span className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-none">1.2 TB/s</span></div>
                <div><span className="block text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 italic">Ingestion Velocity</span><span className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-none">48.2k<span className="text-xs ml-1 opacity-40">/M</span></span></div>
                <div><span className="block text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 italic">Active Nodes</span><span className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-none">{clusterList.reduce((s, [, c]) => s + c.nodes, 0)}</span></div>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            {/* Failover Controls */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-2xl premium-grain flex flex-col">
              <h3 className="text-lg font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-6 flex items-center gap-3">
                <Zap size={18} className="text-[var(--brand)]" /> Failover Protocol
              </h3>
              <div className="space-y-6">
                <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Force Swap: US-East Cluster</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-current ${failoverStatus === 'complete' ? 'text-emerald-500' : failoverStatus === 'in_progress' ? 'text-amber-500' : 'text-[var(--text-muted)]/40'}`}>
                      {failoverStatus === 'complete' ? 'Protocol Finalized' : failoverStatus === 'in_progress' ? 'Transmitting...' :'Manual Override'}
                    </span>
                  </div>
                  <button onClick={handleInitiateTransition} disabled={failoverStatus === 'in_progress' || failoverStatus === 'complete'}
                    className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl italic font-headline ${
                      failoverStatus === 'confirming' ? 'bg-red-500 text-white shadow-red-500/20' : 
                      failoverStatus === 'complete' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-none' : 
                      failoverStatus === 'in_progress' ? 'bg-[var(--surface-card)] text-[var(--text-muted)] animate-pulse' : 
                      'bg-[var(--brand)] text-white shadow-[var(--brand)]/20 hover:brightness-110'
                    }`}>
                    {failoverStatus === 'confirming' ? 'Confirm Logic Swap' : failoverStatus === 'complete' ? 'Pulse Rerouted' : failoverStatus === 'in_progress' ? 'Switching Grid...' : 'Execute Failover'}
                  </button>
                  {failoverStatus === 'confirming' && (
                    <button onClick={() => setFailoverStatus(null)} className="w-full mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors italic">Abort Mission</button>
                  )}
                </div>

                <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Scale: EU-Central Grid</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-current ${clusters['EU-Central-1'].load > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {clusters['EU-Central-1'].load > 60 ? 'Thermal Alert' : 'Nominal'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {[2, 5].map(n => (
                      <button key={n} onClick={() => handleScaleCluster('EU-Central-1', n)} disabled={scalingCluster === 'EU-Central-1' + n}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 italic font-headline ${
                          scalingCluster === 'EU-Central-1' + n ? 'bg-[var(--brand)] text-white animate-pulse' : 'bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                        }`}>
                        {scalingCluster === 'EU-Central-1' + n ? '...' : `+${n} Nodes`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-5 ml-1 opacity-40 italic">Active Instances: {clusters['EU-Central-1'].nodes}</p>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-2xl premium-grain flex-1 flex flex-col">
              <h3 className="text-lg font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-6 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500" /> Neural Alerts
              </h3>
              <div className="space-y-4 flex-1">
                {activeAlerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-6">
                       <Check size={32} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Matrix Stable</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAlerts.map(alert => (
                      <div key={alert.id} className={`flex gap-5 p-6 rounded-[1.5rem] relative group border backdrop-blur-sm shadow-xl ${alert.level === 'ERR' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                        <div className={`p-2 rounded-xl border border-current h-fit ${alert.level === 'ERR' ? 'text-red-500' : 'text-amber-500'}`}>
                          <AlertTriangle size={18} strokeWidth={3} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] italic font-headline">{alert.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">{alert.msg}</p>
                        </div>
                        <button onClick={() => handleDismissAlert(alert.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-white transition-all p-2 bg-black/20 rounded-xl">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Cluster Performance Metrics */}
          <section className="col-span-12 lg:col-span-8 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-2xl premium-grain">
            <h3 className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-10">Neural Compute Cycles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {clusterList.map(([key, cluster]) => {
                const isHigh = cluster.load > 60;
                const barColor = isHigh ? 'bg-amber-500' : 'bg-[var(--brand)]';
                return (
                  <div key={key} className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Node Identifier</span>
                        <span className="text-[12px] font-black uppercase text-[var(--text-main)] tracking-widest">{key}</span>
                      </div>
                      <span className={`text-[12px] font-headline font-black italic tracking-tighter ${isHigh ? 'text-amber-500' : 'text-emerald-500'}`}>{cluster.uptime}% Uptime</span>
                    </div>
                    <div className="h-24 flex items-end gap-1.5 p-2 bg-[var(--surface)] rounded-[1.5rem] border border-[var(--border-subtle)] shadow-inner">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className={`w-full ${i === 9 ? barColor : `${barColor}/20`} rounded-full transition-all group relative`}
                          style={{ height: `${20 + Math.random() * 80}%` }}>
                          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${barColor} opacity-0 group-hover:opacity-100 -translate-y-4`} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center shadow-sm">
                        <span className="block text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">CPU</span>
                        <span className="text-[12px] font-black text-[var(--text-main)]">{cluster.cpu}%</span>
                      </div>
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center shadow-sm">
                        <span className="block text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">MEM</span>
                        <span className="text-[12px] font-black text-[var(--text-main)]">{cluster.mem}G</span>
                      </div>
                      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center shadow-sm">
                        <span className="block text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Nodes</span>
                        <span className="text-[12px] font-black text-[var(--text-main)]">{cluster.nodes}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* System Logs - Live */}
          <section className="col-span-12 lg:col-span-4 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl premium-grain max-h-[500px]">
            <div className="p-8 border-b border-[var(--border-subtle)] flex justify-between items-center flex-shrink-0 bg-[var(--surface)]/50 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)] flex items-center gap-3 italic font-headline">
                <Activity size={16} className="text-[var(--brand)]" /> System Transmission
              </h3>
              <div className="flex items-center gap-4">
                <button onClick={handleExportLogs} title="Matrix Export" className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-all">
                  <Download size={14} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-500 italic">LIVE INGEST</span>
                </div>
              </div>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-8 font-mono text-[10px] leading-relaxed space-y-3 custom-scrollbar bg-[var(--surface)]">
              {(showFullLogs ? logs : logs.slice(0, 15)).map((l, i) => (
                <div key={i} className="hover:bg-[var(--brand)]/5 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-[var(--brand)]/10 group">
                  <span className="text-[var(--brand)] opacity-40 mr-3">[{l.time}]</span>
                  <span className={`font-black uppercase tracking-widest ${l.color === 'text-indigo-400' ? 'text-[var(--brand)]' : l.color} mr-3`}>{l.level}:</span>
                  <span className="text-[var(--text-main)] opacity-70 group-hover:opacity-100 transition-opacity">{l.msg}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-xl flex justify-center">
              <button onClick={() => setShowFullLogs(true)}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand)] hover:brightness-110 transition-all italic font-headline">
                Open Matrix Terminal ({logs.length})
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}