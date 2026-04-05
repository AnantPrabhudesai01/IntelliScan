import React from 'react';

export default function GenSecurityThreatMonitoringSuperAdmin() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-12 gap-6">

<section className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl overflow-hidden relative group">
<div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity" data-alt="stylized digital world map with neon data lines and glowing nodes against a dark background representing global connectivity" style={{}}></div>
<div className="relative z-10 p-6 flex flex-col h-full min-h-[400px]">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="public">public</span>
<h2 className="text-lg font-headline font-bold text-white">Live Login Attempts</h2>
</div>
<div className="flex gap-2">
<span className="bg-error-container text-on-error-container text-[10px] px-2 py-1 rounded font-bold">12 BLOCKED (LAST 1M)</span>
<span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-1 rounded font-bold">142 AUTHENTICATED</span>
</div>
</div>

<div className="mt-auto grid grid-cols-4 gap-4">
<div className="bg-surface-container/80 backdrop-blur-md p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold">Top Source</p>
<p className="text-xl font-headline font-extrabold text-white">Frankfurt, DE</p>
<div className="mt-2 h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="w-3/4 h-full bg-primary"></div>
</div>
</div>
<div className="bg-surface-container/80 backdrop-blur-md p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold">Active Sessions</p>
<p className="text-xl font-headline font-extrabold text-white">1,204</p>
<div className="mt-2 h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="w-1/2 h-full bg-secondary"></div>
</div>
</div>
<div className="bg-surface-container/80 backdrop-blur-md p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold">Avg Response</p>
<p className="text-xl font-headline font-extrabold text-white">42ms</p>
<div className="mt-2 h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="w-5/6 h-full bg-tertiary"></div>
</div>
</div>
<div className="bg-surface-container/80 backdrop-blur-md p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold">Peak Traffic</p>
<p className="text-xl font-headline font-extrabold text-white">12.4 GB/s</p>
<div className="mt-2 h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="w-1/4 h-full bg-error"></div>
</div>
</div>
</div>
</div>
</section>

<section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
<div className="bg-surface-container p-6 rounded-xl flex-1">
<div className="flex items-center justify-between mb-6">
<h2 className="text-sm font-headline font-bold text-white uppercase tracking-wider">Credential Health</h2>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="key">key</span>
</div>
<div className="space-y-6">
<div>
<div className="flex justify-between text-xs mb-2">
<span className="text-on-surface-variant">2FA Adoption Rate</span>
<span className="text-white font-mono">92.4%</span>
</div>
<div className="h-2 bg-surface-container-high rounded-full">
<div className="h-full bg-primary w-[92%] rounded-full"></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span className="text-on-surface-variant">Password Rotation Compliance</span>
<span className="text-white font-mono">68.1%</span>
</div>
<div className="h-2 bg-surface-container-high rounded-full">
<div className="h-full bg-secondary w-[68%] rounded-full"></div>
</div>
</div>
<div className="p-4 bg-surface-container-low rounded-lg flex items-center gap-4">
<div className="p-2 bg-tertiary-container/20 rounded-lg">
<span className="material-symbols-outlined text-tertiary" data-icon="lock">lock</span>
</div>
<div>
<p className="text-[10px] text-on-surface-variant uppercase font-bold">Encryption Protocol</p>
<p className="text-sm text-white font-mono">AES-256-GCM / TLS 1.3</p>
</div>
</div>
</div>
</div>
<div className="bg-surface-container p-6 rounded-xl">
<div className="flex items-center gap-3 text-error mb-4">
<span className="material-symbols-outlined" data-icon="report">report</span>
<h3 className="text-sm font-bold uppercase tracking-widest">Active Alerts</h3>
</div>
<div className="flex items-center justify-between">
<span className="text-3xl font-headline font-black text-white">04</span>
<button className="text-xs font-bold text-primary hover:underline">VIEW ALL</button>
</div>
</div>
</section>

<section className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-xl p-6">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error" data-icon="shield_alert">shield</span>
<h2 className="text-lg font-headline font-bold text-white">Anomalous Activity</h2>
</div>
<div className="flex gap-2">
<span className="text-[10px] bg-error-container/20 text-error px-2 py-1 rounded border border-error/20">HIGH RISK</span>
</div>
</div>
<div className="space-y-1">

<div className="group flex items-center justify-between p-4 hover:bg-surface-container rounded-xl transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-error-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-error" data-icon="vpn_key">vpn_key</span>
</div>
<div>
<p className="text-sm font-bold text-white">Brute Force Attempt Detected</p>
<p className="text-xs text-on-surface-variant font-mono">IP: 192.168.4.112 • Origin: Unknown (TOR)</p>
</div>
</div>
<div className="text-right">
<span className="text-[10px] font-bold text-error px-2 py-1 bg-error-container/10 rounded uppercase">32 Attempts</span>
<p className="text-[10px] text-on-surface-variant mt-1">2m ago</p>
</div>
</div>

<div className="group flex items-center justify-between p-4 hover:bg-surface-container rounded-xl transition-all cursor-pointer border-t border-outline-variant/10">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary" data-icon="language">language</span>
</div>
<div>
<p className="text-sm font-bold text-white">Geographic Velocity Violation</p>
<p className="text-xs text-on-surface-variant font-mono">User: k.jenkins • London ↔ Singapore (15m)</p>
</div>
</div>
<div className="text-right">
<span className="text-[10px] font-bold text-tertiary px-2 py-1 bg-tertiary-container/10 rounded uppercase">Flagged</span>
<p className="text-[10px] text-on-surface-variant mt-1">14m ago</p>
</div>
</div>

<div className="group flex items-center justify-between p-4 hover:bg-surface-container rounded-xl transition-all cursor-pointer border-t border-outline-variant/10">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="fingerprint">fingerprint</span>
</div>
<div>
<p className="text-sm font-bold text-white">New Device Signature</p>
<p className="text-xs text-on-surface-variant font-mono">User: root_admin • Firefox/Linux x86_64</p>
</div>
</div>
<div className="text-right">
<span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary-container/10 rounded uppercase">Verified</span>
<p className="text-[10px] text-on-surface-variant mt-1">45m ago</p>
</div>
</div>
</div>
</section>

<section className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-xl p-6 flex flex-col">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary" data-icon="activity">search_activity</span>
<h2 className="text-lg font-headline font-bold text-white">Active Sessions</h2>
</div>
<button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 transition-all">
                        PURGE ALL
                    </button>
</div>
<div className="flex-1 space-y-4">
<div className="bg-surface-container-high/40 backdrop-blur-xl p-4 rounded-xl border border-outline-variant/10">
<div className="flex justify-between items-start">
<div>
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
<p className="text-sm font-bold text-white">Session: _7ax92l</p>
</div>
<p className="text-xs text-on-surface-variant mt-1">super_admin • MacOS Sonoma • 10.0.1.25</p>
</div>
<span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">THIS DEVICE</span>
</div>
</div>
<div className="bg-surface-container-high/20 p-4 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start">
<div>
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
<p className="text-sm font-bold text-white">Session: _2bb41k</p>
</div>
<p className="text-xs text-on-surface-variant mt-1">marketing_lead • Windows 11 • 172.16.0.44</p>
</div>
<button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" data-icon="logout">logout</button>
</div>
</div>
<div className="bg-surface-container-high/20 p-4 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start">
<div>
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-amber-500 rounded-full"></span>
<p className="text-sm font-bold text-white">Session: _9cc88p</p>
</div>
<p className="text-xs text-on-surface-variant mt-1">dev_ops_04 • Linux 6.1 • 192.168.1.100</p>
</div>
<button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" data-icon="logout">logout</button>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm" data-icon="history">history</span>
<span className="text-xs text-on-surface-variant">Avg session duration: <strong className="text-white">4h 22m</strong></span>
</div>
<div className="text-xs text-on-surface-variant">1,012 inactive purged</div>
</div>
</section>
</div>



    </div>
  );
}