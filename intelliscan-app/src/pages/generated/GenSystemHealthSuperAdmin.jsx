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
    <div className="w-full h-full animate-fade-in p-6">
      <Toast toast={toast} />

      {/* Full Logs Modal */}
      {showFullLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowFullLogs(false)}>
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2"><Activity size={16} className="text-indigo-400" /> Full System Logs ({logs.length} entries)</h2>
              <div className="flex gap-3">
                <button onClick={handleExportLogs} className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Download size={14} /> Export</button>
                <button onClick={() => setShowFullLogs(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 font-mono text-xs space-y-1.5 flex-1">
              {logs.map((l, i) => (
                <div key={i} className="hover:bg-white/5 px-2 py-0.5 rounded">
                  <span className="text-indigo-600 mr-2">[{l.time}]</span>
                  <span className={`font-bold ${l.color} mr-2`}>{l.level}:</span>
                  <span className="text-gray-300">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">System Health</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time infrastructure monitoring across all global nodes.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase ${activeAlerts.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${activeAlerts.length > 0 ? 'bg-red-400' : 'bg-green-400'}`} />
            {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alerts` : 'All Systems Stable'}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* World Map */}
          <section className="col-span-12 lg:col-span-8 bg-[#161c28] border border-white/5 rounded-xl overflow-hidden relative min-h-[420px]">
            <div className="absolute inset-0 z-0 opacity-40">
              <img className="w-full h-full object-cover grayscale brightness-50" alt="Global node map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClPEpc16u1-ZHJlZRaQfYD_nULRrgJzgJoTqINQ7U96AK6ddyWMhoWI6MFMrZT9uyLyg3Fe8Z07gecO1wDPLuf52VcLzJGt77p-dCRXCeVZu8WB5UPO7sXYEgEbN8jE54yRpcDLvoQCM9P4BIWvuKID7TcNS-c7apu_k1Fgg4XOkJASbDpyQuSb20UTMNG-tcyYsvm7xlTKPZCaKV4YNf7_Bm9DKHe4YCj4N3LuY5JxToK_TZ3NKo0YLBfEbIXKDFgDnCUi74txcmn" />
            </div>
            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-white mb-1">Global Node Distribution</h3>
                  <p className="text-gray-400 text-sm">Real-time latency: 42ms (Avg)</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">{clusterList.length} Active Clusters</span>
                  <span className={`px-3 py-1 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider border ${activeAlerts.length > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {activeAlerts.length > 0 ? 'Alert' : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="flex-1 relative">
                {[
                  { label: 'US-East (N. Virginia)', load: clusters['US-East-1'].load, x: '22%', y: '33%' },
                  { label: 'EU-Central (Frankfurt)', load: clusters['EU-Central-1'].load, x: '48%', y: '26%' },
                  { label: 'AS-South (Singapore)', load: clusters['AS-South-1'].load, x: '74%', y: '60%' },
                ].map(n => (
                  <div key={n.label} className="absolute group cursor-pointer" style={{ left: n.x, top: n.y }}>
                    <div className="relative">
                      <div className={`absolute -inset-2 rounded-full animate-ping opacity-30 ${n.load > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                      <div className={`h-3 w-3 rounded-full border-2 border-white ${n.load > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    </div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                      <p className="text-[10px] font-bold text-white">{n.label}</p>
                      <p className="text-[9px] text-gray-400">Load: {n.load}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex gap-8 py-4 border-t border-white/10">
                <div><span className="block text-[10px] text-gray-400 uppercase tracking-tighter">Throughput</span><span className="text-xl font-bold text-white">1.2 TB/s</span></div>
                <div><span className="block text-[10px] text-gray-400 uppercase tracking-tighter">Total Scans/Min</span><span className="text-xl font-bold text-white">48.2k</span></div>
                <div><span className="block text-[10px] text-gray-400 uppercase tracking-tighter">Active Instances</span><span className="text-xl font-bold text-white">{clusterList.reduce((s, [, c]) => s + c.nodes, 0)}</span></div>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Failover Controls */}
            <div className="bg-[#161c28] border border-white/5 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap size={16} className="text-indigo-400" /> Failover Controls</h3>
              <div className="space-y-4">
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-white">Force Failover: US-East</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${failoverStatus === 'complete' ? 'bg-green-500/20 text-green-400' : failoverStatus === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-400'}`}>
                      {failoverStatus === 'complete' ? 'Complete' : failoverStatus === 'in_progress' ? 'In Progress...' : failoverStatus === 'confirming' ? 'Confirm?' : 'Manual'}
                    </span>
                  </div>
                  <button onClick={handleInitiateTransition} disabled={failoverStatus === 'in_progress' || failoverStatus === 'complete'}
                    className={`w-full py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${failoverStatus === 'confirming' ? 'bg-red-600 text-white' : failoverStatus === 'complete' ? 'bg-green-600/20 text-green-400 cursor-not-allowed' : failoverStatus === 'in_progress' ? 'bg-white/5 text-gray-500 cursor-not-allowed animate-pulse' : 'bg-white/10 text-white hover:bg-red-600 hover:text-white'}`}>
                    {failoverStatus === 'confirming' ? '⚠ Confirm Transition' : failoverStatus === 'complete' ? '✓ Failover Complete' : failoverStatus === 'in_progress' ? 'Transitioning...' : 'Initiate Transition'}
                  </button>
                  {failoverStatus === 'confirming' && (
                    <button onClick={() => setFailoverStatus(null)} className="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                  )}
                </div>

                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-white">Scale Cluster: EU-Central</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${clusters['EU-Central-1'].load > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                      {clusters['EU-Central-1'].load > 60 ? 'High Load' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[2, 5].map(n => (
                      <button key={n} onClick={() => handleScaleCluster('EU-Central-1', n)} disabled={scalingCluster === 'EU-Central-1' + n}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${scalingCluster === 'EU-Central-1' + n ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-indigo-600'}`}>
                        {scalingCluster === 'EU-Central-1' + n ? 'Provisioning...' : `+ ${n} Nodes`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Current: {clusters['EU-Central-1'].nodes} nodes</p>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="bg-[#161c28] border border-white/5 rounded-xl p-6 flex-1">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" /> Critical Alerts</h3>
              <div className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    <Check size={24} className="mx-auto mb-2 text-green-400" />
                    All alerts cleared
                  </div>
                ) : activeAlerts.map(alert => (
                  <div key={alert.id} className={`flex gap-3 p-3 rounded-lg relative group ${alert.level === 'ERR' ? 'bg-red-500/10 border-l-2 border-red-500' : 'bg-amber-500/10 border-l-2 border-amber-500'}`}>
                    <AlertTriangle size={18} className={alert.level === 'ERR' ? 'text-red-400 flex-shrink-0' : 'text-amber-400 flex-shrink-0'} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{alert.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{alert.msg}</p>
                    </div>
                    <button onClick={() => handleDismissAlert(alert.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all p-1 rounded">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cluster Performance Metrics */}
          <section className="col-span-12 lg:col-span-8 bg-[#161c28] border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white mb-6">Cluster Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clusterList.map(([key, cluster]) => {
                const isHigh = cluster.load > 60;
                const barColor = isHigh ? 'bg-amber-500' : 'bg-indigo-500';
                return (
                  <div key={key} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">{key}</span>
                      <span className={`text-[10px] font-bold ${isHigh ? 'text-amber-400' : 'text-green-400'}`}>{cluster.uptime}%</span>
                    </div>
                    <div className="h-16 flex items-end gap-1 px-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className={`w-full ${i === 6 ? barColor : `${barColor}/30`} rounded-t-sm transition-all`}
                          style={{ height: `${20 + Math.random() * 70}%` }} />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#0d1117] p-2 rounded-lg text-center">
                        <span className="block text-[9px] text-gray-500 uppercase">CPU</span>
                        <span className="text-xs font-bold text-white">{cluster.cpu}%</span>
                      </div>
                      <div className="bg-[#0d1117] p-2 rounded-lg text-center">
                        <span className="block text-[9px] text-gray-500 uppercase">MEM</span>
                        <span className="text-xs font-bold text-white">{cluster.mem}GB</span>
                      </div>
                      <div className="bg-[#0d1117] p-2 rounded-lg text-center">
                        <span className="block text-[9px] text-gray-500 uppercase">Nodes</span>
                        <span className="text-xs font-bold text-white">{cluster.nodes}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* System Logs - Live */}
          <section className="col-span-12 lg:col-span-4 bg-[#161c28] border border-white/5 rounded-xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">System Logs</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleExportLogs} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"><Download size={10} /> Export</button>
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-mono">LIVE</span>
              </div>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1.5">
              {(showFullLogs ? logs : logs.slice(0, 12)).map((l, i) => (
                <div key={i} className="hover:bg-white/5 px-1 py-0.5 rounded">
                  <span className="text-indigo-600 mr-1">[{l.time}]</span>
                  <span className={`font-bold ${l.color} mr-1`}>{l.level}:</span>
                  <span className="text-gray-300">{l.msg}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/5 flex-shrink-0 flex gap-2">
              <button onClick={() => setShowFullLogs(true)}
                className="flex-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors text-center">
                View Full Logs ({logs.length})
              </button>
              <button onClick={handleExportLogs} className="text-[10px] text-gray-500 hover:text-white transition-colors">
                <Download size={12} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}