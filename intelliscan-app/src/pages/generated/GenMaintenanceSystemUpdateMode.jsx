import React from 'react';

export default function GenMaintenanceSystemUpdateMode() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
<div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

<div className="lg:col-span-7 flex flex-col justify-center space-y-8">
<div className="space-y-4">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm" data-icon="construction">construction</span>
<span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Scheduled Upgrade v4.2.0</span>
</div>
<h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-white leading-tight tracking-tighter">
                        Refining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-on-secondary-container">Intelligence.</span>
</h1>
<p className="text-on-surface-variant text-lg max-w-md font-body leading-relaxed">
                        We're currently fine-tuning our OCR engines to provide even higher precision. IntelliScan will be back online shortly.
                    </p>
</div>

<div className="bg-surface-container-low p-8 rounded-xl space-y-6">
<div className="flex justify-between items-end">
<div className="space-y-1">
<span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Update Progress</span>
<div className="text-2xl font-headline font-bold text-white">84% Complete</div>
</div>
<div className="text-right">
<span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Est. Time Remaining</span>
<div className="text-lg font-headline font-semibold text-primary">12 Minutes</div>
</div>
</div>
<div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary-container to-primary w-[84%] rounded-full relative">
<div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm"></div>
</div>
</div>
<div className="grid grid-cols-3 gap-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-fixed-dim text-sm" data-icon="check_circle" data-weight="fill" style={{}}>check_circle</span>
<span className="text-[10px] font-label uppercase text-on-surface-variant">Database Migration</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-fixed-dim text-sm" data-icon="check_circle" data-weight="fill" style={{}}>check_circle</span>
<span className="text-[10px] font-label uppercase text-on-surface-variant">Engine Hotfix</span>
</div>
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
<span className="text-[10px] font-label uppercase text-white">Cache Rebuild</span>
</div>
</div>
</div>
</div>

<div className="lg:col-span-5 flex flex-col gap-6">

<div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
<div className="flex items-start justify-between mb-6">
<div className="p-3 bg-secondary-container/20 rounded-lg">
<span className="material-symbols-outlined text-secondary" data-icon="hub">hub</span>
</div>
<div className="px-3 py-1 rounded-full bg-tertiary-container/20 text-on-tertiary-container text-[10px] font-bold uppercase tracking-widest border border-tertiary-container/30">
                            Partial Outage
                        </div>
</div>
<h3 className="text-white font-headline font-bold text-xl mb-2">Service Nodes</h3>
<p className="text-on-surface-variant text-sm mb-6">API and Core Dashboard are temporarily suspended for deployment.</p>
<div className="space-y-4">
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="terminal">terminal</span>
<span className="text-sm font-medium">API Endpoints</span>
</div>
<span className="text-[10px] font-bold text-tertiary uppercase">Offline</span>
</div>
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="monitoring">monitoring</span>
<span className="text-sm font-medium">Analysis Engines</span>
</div>
<span className="text-[10px] font-bold text-tertiary uppercase">Offline</span>
</div>
<div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="dns">dns</span>
<span className="text-sm font-medium">Internal Storage</span>
</div>
<span className="text-[10px] font-bold text-secondary uppercase">Operational</span>
</div>
</div>
</div>

<div className="bg-primary-container p-6 rounded-xl text-on-primary-container relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
<div className="relative z-10">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined" data-icon="notifications_active">notifications_active</span>
<span className="font-headline font-bold">Notify Me</span>
</div>
<p className="text-sm opacity-90 mb-4">Get an instant notification via email or Slack when system returns to 100% capacity.</p>
<div className="flex gap-2">
<div className="h-10 px-4 bg-white/10 rounded-lg flex items-center flex-grow text-xs border border-white/10">Enter your email...</div>
<button className="h-10 w-10 bg-on-primary-container text-primary-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>

<div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
</div>
</div>
</div>

    </div>
  );
}
