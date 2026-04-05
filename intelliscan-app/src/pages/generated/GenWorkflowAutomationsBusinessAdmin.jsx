import React from 'react';

export default function GenWorkflowAutomationsBusinessAdmin() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<div className="p-8 max-w-7xl mx-auto w-full space-y-8">

<section className="flex justify-between items-end">
<div className="space-y-1">
<h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Workflow Automation</h2>
<p className="text-on-surface-variant body-sm">Orchestrate your document intelligence pipelines with precision.</p>
</div>
<button className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-transform">
<span className="material-symbols-outlined">bolt</span>
                    Create New Automation
                </button>
</section>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-7 space-y-6">
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 px-1">
<span className="material-symbols-outlined text-sm">list_alt</span>
                        Active Pipelines
                    </h3>
<div className="space-y-4">

<div className="group bg-surface-container-low p-5 rounded-xl transition-all duration-300 hover:bg-surface-container border border-transparent hover:border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<div className="p-3 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined">cloud_sync</span>
</div>
<div>
<h4 className="font-bold text-lg text-on-surface">Sync High Confidence to Salesforce</h4>
<p className="text-xs text-on-surface-variant">Last run: 14 mins ago</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded text-[10px] font-mono bg-tertiary-container text-on-tertiary-container">90%+ CONFIDENCE</span>
<div className="w-8 h-4 bg-primary-container/20 rounded-full relative">
<div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm"></div>
</div>
</div>
</div>
<div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant bg-surface-container-lowest/50 p-3 rounded-lg">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">input</span> New Scan</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">filter_alt</span> Conf &gt; 0.95</span>
<span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">database</span> Salesforce API</span>
</div>
</div>

<div className="group bg-surface-container-low p-5 rounded-xl transition-all duration-300 hover:bg-surface-container border border-transparent hover:border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<div className="p-3 bg-surface-container-high rounded-lg text-on-surface-variant">
<span className="material-symbols-outlined">description</span>
</div>
<div>
<h4 className="font-bold text-lg text-on-surface">Export Low Confidence to Human Review</h4>
<p className="text-xs text-on-surface-variant">Status: Idle</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded text-[10px] font-mono bg-error-container text-on-error-container">&lt;60% CONFIDENCE</span>
<div className="w-8 h-4 bg-outline-variant/20 rounded-full relative">
<div className="absolute left-0.5 top-0.5 w-3 h-3 bg-outline rounded-full shadow-sm"></div>
</div>
</div>
</div>
<div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant bg-surface-container-lowest/50 p-3 rounded-lg">
<span className="flex items-center gap-1 text-on-surface-variant/50 line-through">New Scan</span>
<span className="material-symbols-outlined text-xs opacity-30">arrow_forward_ios</span>
<span className="flex items-center gap-1 text-on-surface-variant/50 line-through">Conf &lt; 0.60</span>
<span className="material-symbols-outlined text-xs opacity-30">arrow_forward_ios</span>
<span className="flex items-center gap-1 text-on-surface-variant/50 line-through">CSV Export</span>
</div>
</div>
</div>
</div>

<div className="lg:col-span-5 space-y-6 sticky top-24">
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 px-1">
<span className="material-symbols-outlined text-sm">settings_input_component</span>
                        Visual Builder
                    </h3>
<div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden relative">

<div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
<div className="space-y-8 relative z-10">

<div className="relative pl-8">
<div className="absolute left-0 top-0 bottom-0 w-px bg-outline-variant/30 ml-[11px]"></div>
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container ring-4 ring-background">1</div>
<div className="space-y-3">
<label className="block text-xs font-bold text-primary tracking-widest uppercase">Trigger</label>
<div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-primary-container/20">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">sensors</span>
<span className="font-semibold">New Scan Detected</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
</div>
</div>

<div className="relative pl-8">
<div className="absolute left-0 top-0 bottom-0 w-px bg-outline-variant/30 ml-[11px]"></div>
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container ring-4 ring-background">2</div>
<div className="space-y-3">
<label className="block text-xs font-bold text-secondary tracking-widest uppercase">Condition</label>
<div className="bg-surface-container p-4 rounded-xl space-y-4 border border-outline-variant/10">
<div className="flex items-center justify-between">
<span className="text-sm font-medium">Confidence Score</span>
<span className="text-sm text-primary font-mono font-bold">&gt; 0.95</span>
</div>
<div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
<div className="h-full bg-primary w-[95%]"></div>
</div>
<div className="flex gap-2">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-mono text-on-surface-variant">ENGINE: OCR-V2</span>
<span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-mono text-on-surface-variant">ENTITY: FINANCIAL</span>
</div>
</div>
</div>
</div>

<div className="relative pl-8">
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-[10px] font-bold text-on-tertiary-container ring-4 ring-background">3</div>
<div className="space-y-3">
<label className="block text-xs font-bold text-tertiary tracking-widest uppercase">Action</label>
<div className="grid grid-cols-2 gap-3">
<button className="bg-surface-container-high p-4 rounded-xl flex flex-col items-center gap-2 border-2 border-primary-container shadow-lg shadow-indigo-900/10">
<span className="material-symbols-outlined text-primary" data-weight="fill">api</span>
<span className="text-xs font-bold">API Hook</span>
</button>
<button className="bg-surface-container p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/10 opacity-60 grayscale hover:grayscale-0 transition-all">
<span className="material-symbols-outlined">csv</span>
<span className="text-xs font-bold">Export CSV</span>
</button>
</div>
<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/10">
<div className="flex items-center gap-3 mb-2">
<span className="material-symbols-outlined text-sm text-on-surface-variant">link</span>
<span className="text-xs font-mono truncate text-on-surface-variant">https://api.enterprise.com/v1/sync</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-sm text-on-surface-variant">key</span>
<span className="text-xs font-mono text-on-surface-variant">••••••••••••••••</span>
</div>
</div>
</div>
</div>
<button className="w-full py-4 bg-primary-container text-on-primary-container rounded-xl font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all">
                                Save Automation
                            </button>
</div>
</div>
<div className="bg-secondary-container/5 p-4 rounded-xl flex gap-4 items-start border border-secondary-container/10">
<span className="material-symbols-outlined text-secondary">info</span>
<p className="text-xs leading-relaxed text-on-surface-variant">
<span className="font-bold text-secondary">Pro Tip:</span> Using API Hooks with Confidence Scopes above 0.95 reduces human verification costs by up to 84%.
                        </p>
</div>
</div>
</div>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/5 p-6 rounded-2xl">
<div className="flex justify-between items-center mb-4">
<span className="material-symbols-outlined text-primary">auto_awesome</span>
<span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Automation Rate</span>
</div>
<div className="space-y-1">
<div className="text-4xl font-extrabold text-on-surface">92.4%</div>
<div className="flex items-center gap-1 text-tertiary text-xs font-bold">
<span className="material-symbols-outlined text-xs">trending_up</span>
                            +3.1% this week
                        </div>
</div>
</div>
<div className="bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/5 p-6 rounded-2xl">
<div className="flex justify-between items-center mb-4">
<span className="material-symbols-outlined text-secondary">database</span>
<span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Synced Objects</span>
</div>
<div className="space-y-1">
<div className="text-4xl font-extrabold text-on-surface">14.2k</div>
<div className="flex items-center gap-1 text-on-surface-variant text-xs font-medium">
                            Processed through 4 rules
                        </div>
</div>
</div>
<div className="bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/5 p-6 rounded-2xl">
<div className="flex justify-between items-center mb-4">
<span className="material-symbols-outlined text-error">warning</span>
<span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Failures / Errors</span>
</div>
<div className="space-y-1">
<div className="text-4xl font-extrabold text-on-surface">12</div>
<div className="flex items-center gap-1 text-error text-xs font-bold">
                            Requires Attention
                        </div>
</div>
</div>
</section>
</div>



    </div>
  );
}