import React from 'react';

export default function GenAiMaintenanceRetrainingLogs() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<div className="grid grid-cols-12 gap-6 mb-10">

<div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-8">
<div>
<h3 className="text-xl font-bold font-headline text-white mb-1">Model Accuracy Drift</h3>
<p className="text-on-surface-variant text-sm">Performance tracking across the last 30 deployment cycles</p>
</div>
<div className="flex bg-surface-container rounded-lg p-1">
<button className="px-3 py-1 text-xs font-bold text-white bg-surface-container-high rounded shadow-sm">Gemini</button>
<button className="px-3 py-1 text-xs font-bold text-[#c7c4d8] hover:text-white transition-colors">Tesseract</button>
</div>
</div>

<div className="h-64 w-full flex items-end gap-2 px-2 relative">
<div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
</div>

<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[85%] relative group/bar">
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] opacity-0 group-hover/bar:opacity-100 transition-opacity">98.2%</div>
</div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[82%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[88%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[79%]"></div>
<div className="flex-1 bg-brand-500/40 hover:bg-brand-500/60 transition-colors rounded-t-sm h-[92%] border-t-2 border-brand-400"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[84%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[81%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[75%] border-t-2 border-error/50"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[78%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[82%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[85%]"></div>
<div className="flex-1 bg-brand-500/20 hover:bg-brand-500/40 transition-colors rounded-t-sm h-[80%]"></div>
</div>
<div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2">
<span>Aug 01</span>
<span>Aug 15</span>
<span>Sep 01</span>
</div>
</div>

<div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

<div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
<div className="flex justify-between items-start mb-4">
<div>
<span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2 inline-block">Primary Engine</span>
<h4 className="text-lg font-bold text-white">Gemini-Pro v2.4.1</h4>
</div>
<span className="material-symbols-outlined text-primary" style={{}}>verified</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Confidence</p>
<p className="text-xl font-black text-white">99.4%</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Latency</p>
<p className="text-xl font-black text-white">142ms</p>
</div>
</div>
</div>

<div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-tertiary">
<div className="flex justify-between items-start mb-4">
<div>
<span className="bg-tertiary/10 text-tertiary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2 inline-block">Fallback Engine</span>
<h4 className="text-lg font-bold text-white">Tesseract-v4 Legacy</h4>
</div>
<span className="material-symbols-outlined text-tertiary">settings_backup_restore</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Confidence</p>
<p className="text-xl font-black text-white">92.1%</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Latency</p>
<p className="text-xl font-black text-white">48ms</p>
</div>
</div>
</div>
</div>
</div>

<section className="mb-10">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold font-headline text-white">Retraining History</h2>
<div className="flex items-center gap-4">
<div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-3 border border-outline-variant/5">
<span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
<input className="bg-transparent border-none text-sm focus:ring-0 p-0 text-white placeholder-on-surface-variant" placeholder="Filter by version..." type="text"/>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">
<th className="px-8 py-4">Version</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4">Engine</th>
<th className="px-6 py-4 text-right">Drift Detected</th>
<th className="px-6 py-4 text-right">Last Trained</th>
<th className="px-8 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="font-headline font-bold text-white">v2.4.1</span>
<span className="text-[10px] px-1.5 py-0.5 bg-brand-500/10 text-brand-400 rounded border border-brand-500/20">Active</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
<span className="text-sm font-medium text-on-surface">Stable</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Gemini-Pro</span>
</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface-variant">-0.02%</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface">2023-11-20 04:12</td>
<td className="px-8 py-5 text-right">
<button className="text-brand-400 hover:text-brand-300 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-end gap-2 ml-auto group-hover:translate-x-[-4px] duration-300">
                                    Trigger
                                    <span className="material-symbols-outlined text-[16px]">bolt</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="font-headline font-bold text-white">v2.3.9</span>
<span className="text-[10px] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded">Archived</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-orange-500"></div>
<span className="text-sm font-medium text-on-surface">Legacy</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Tesseract</span>
</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface-variant">+4.12%</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface">2023-10-14 11:22</td>
<td className="px-8 py-5 text-right">
<button className="text-on-surface-variant hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Details</button>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="font-headline font-bold text-white">v2.4.2-beta</span>
<span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">Training</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
<span className="text-sm font-medium text-on-surface">Processing</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Gemini-Pro</span>
</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface-variant">0.00%</td>
<td className="px-6 py-5 text-right font-mono text-xs text-on-surface">In Progress...</td>
<td className="px-8 py-5 text-right">
<div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden ml-auto">
<div className="h-full bg-primary-container w-[65%]"></div>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</section>

<section>
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">terminal</span>
<h2 className="text-xl font-bold font-headline text-white">System Performance Logs</h2>
</div>
<div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Engine Events</span>
<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-error"></span> Errors</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-6 font-mono text-xs leading-relaxed border border-outline-variant/10 shadow-inner max-h-[400px] overflow-y-auto">
<div className="space-y-2">
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:22:01.044</span>
<span className="text-brand-400 font-bold shrink-0">[INFO]</span>
<span className="text-[#c7c4d8]">Initialized retraining cycle for <span className="text-white">Gemini-v2.4.2-beta</span>. Dataset: "Legal_Extract_Batch_92"</span>
</div>
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:22:15.821</span>
<span className="text-brand-400 font-bold shrink-0">[INFO]</span>
<span className="text-[#c7c4d8]">Resource allocation successful. Hyperparameters locked: lr=0.0001, batch_size=64.</span>
</div>
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:23:45.112</span>
<span className="text-error font-bold shrink-0">[WARN]</span>
<span className="text-[#c7c4d8]">Memory pressure spike on <span className="text-error">Node-A4</span>. Garbage collection invoked.</span>
</div>
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:25:00.001</span>
<span className="text-brand-400 font-bold shrink-0">[INFO]</span>
<span className="text-[#c7c4d8]">Validation score at Epoch 12: <span className="text-emerald-400">0.9822</span>. Improvement detected from baseline.</span>
</div>
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:28:12.993</span>
<span className="text-brand-400 font-bold shrink-0">[INFO]</span>
<span className="text-[#c7c4d8]">API Gateway redirection synced. Fallback engine (Tesseract) healthy and on standby.</span>
</div>
<div className="flex gap-4 group">
<span className="text-on-surface-variant shrink-0">14:30:11.450</span>
<span className="text-white font-bold shrink-0">[SYS]</span>
<span className="text-[#c7c4d8]">Heartbeat checked. Latency stable across US-EAST-1 and EU-WEST-2 regions.</span>
</div>

<div className="flex gap-4">
<span className="text-on-surface-variant shrink-0">14:31:00.000</span>
<span className="text-brand-400 animate-pulse font-bold">_</span>
</div>
</div>
</div>
</section>

    </div>
  );
}
