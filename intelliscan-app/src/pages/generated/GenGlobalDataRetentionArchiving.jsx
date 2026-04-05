import React from 'react';

export default function GenGlobalDataRetentionArchiving() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      
<div className="max-w-7xl mx-auto space-y-8">

<div className="flex justify-between items-end">
<div>
<nav className="flex text-xs text-outline mb-2 gap-2">
<span>Admin</span>
<span>/</span>
<span className="text-primary">Data Retention</span>
</nav>
<h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Compliance Management</h1>
<p className="text-on-surface-variant max-w-2xl">Configure global data lifecycle policies and automated archival protocols to maintain regulatory compliance across regional jurisdictions.</p>
</div>
<button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary-container/20">
<span className="material-symbols-outlined">bolt</span> Trigger Manual Purge
                </button>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 bg-surface-container-low rounded-xl p-6 shadow-sm">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<div className="p-2 bg-secondary-container/30 rounded-lg text-secondary">
<span className="material-symbols-outlined">policy</span>
</div>
<h3 className="text-xl font-bold text-white">Policy Configuration</h3>
</div>
<span className="text-[10px] bg-tertiary-container/20 text-tertiary-fixed-dim px-2 py-1 rounded border border-tertiary-container/30 font-mono">GLOBAL-REV-2024</span>
</div>
<div className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="text-sm font-medium text-on-surface-variant">Image Retention Policy</label>
<div className="relative">
<select className="w-full bg-surface-container border-none rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/40 appearance-none">
<option>Delete images after 30 days</option>
<option>Delete images after 60 days</option>
<option>Delete images after 90 days</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-outline">expand_more</span>
</div>
<p className="text-[11px] text-outline px-1">Applies to all raw OCR source scans.</p>
</div>
<div className="space-y-2">
<label className="text-sm font-medium text-on-surface-variant">Metadata Archival</label>
<div className="relative">
<select className="w-full bg-surface-container border-none rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/40 appearance-none">
<option>Archive to cold storage after 12 months</option>
<option>Archive to cold storage after 24 months</option>
<option>Never archive (Maintain hot access)</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-outline">expand_more</span>
</div>
<p className="text-[11px] text-outline px-1">Moves processed data to Glacier/Deep Archive.</p>
</div>
</div>
<div className="p-4 bg-surface-container rounded-xl flex items-start gap-4 border-l-4 border-primary">
<span className="material-symbols-outlined text-primary mt-1">info</span>
<div>
<h4 className="text-sm font-bold text-white mb-1">Impact Analysis</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Updating these policies will affect approximately 4.2TB of existing data across 4 nodes. Changes propagate within 15 minutes.</p>
</div>
</div>
<div className="flex justify-end pt-4">
<button className="bg-surface-container-highest text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-surface-variant transition-colors border border-outline-variant/10">
                                Save Policy Changes
                            </button>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
<div>
<h3 className="text-lg font-bold text-white mb-4">System Health</h3>
<div className="space-y-4">
<div className="p-4 bg-surface-container rounded-xl">
<div className="flex justify-between text-xs text-outline mb-1">
<span>Archival Success Rate</span>
<span className="text-tertiary-fixed-dim">99.98%</span>
</div>
<div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[99.98%] rounded-full"></div>
</div>
</div>
<div className="p-4 bg-surface-container rounded-xl">
<div className="flex justify-between text-xs text-outline mb-1">
<span>Cold Storage Utilization</span>
<span className="text-on-surface">14.2 PB</span>
</div>
<div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-secondary-container w-3/4 rounded-full"></div>
</div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/10">
<div className="flex items-center gap-4">
<div className="h-12 w-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined">shield_lock</span>
</div>
<div>
<p className="text-xs text-outline">Encryption Status</p>
<p className="text-sm font-bold text-white">AES-256 GCM Active</p>
</div>
</div>
</div>
</div>

<div className="lg:col-span-3 bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
<div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center">
<h3 className="text-lg font-bold text-white">Active Regional Policies</h3>
<div className="flex gap-2">
<span className="text-[10px] bg-secondary-container/20 text-on-secondary-container px-2 py-1 rounded-full border border-secondary-container/30">4 REGIONS ACTIVE</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container/50 text-[10px] uppercase tracking-widest text-outline">
<tr>
<th className="px-6 py-4 font-semibold">Jurisdiction</th>
<th className="px-6 py-4 font-semibold">Status</th>
<th className="px-6 py-4 font-semibold">Retention</th>
<th className="px-6 py-4 font-semibold">Archive</th>
<th className="px-6 py-4 font-semibold text-right">Last Purge</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="h-8 w-8 bg-surface-container-highest rounded flex items-center justify-center text-xs font-mono">EU</div>
<div>
<p className="text-sm font-bold text-white">EU-West-1</p>
<p className="text-[10px] text-outline">GDPR Compliant</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
<span className="text-xs text-on-surface">Active</span>
</div>
</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">30 Days</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">12 Months</td>
<td className="px-6 py-5 text-right">
<p className="text-xs text-on-surface font-medium">14 mins ago</p>
<p className="text-[10px] text-outline">Success</p>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="h-8 w-8 bg-surface-container-highest rounded flex items-center justify-center text-xs font-mono">US</div>
<div>
<p className="text-sm font-bold text-white">US-East-1</p>
<p className="text-[10px] text-outline">SOC2 Compliant</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
<span className="text-xs text-on-surface">Active</span>
</div>
</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">90 Days</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">24 Months</td>
<td className="px-6 py-5 text-right">
<p className="text-xs text-on-surface font-medium">2 hours ago</p>
<p className="text-[10px] text-outline">Success</p>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="h-8 w-8 bg-surface-container-highest rounded flex items-center justify-center text-xs font-mono">AP</div>
<div>
<p className="text-sm font-bold text-white">AP-South-1</p>
<p className="text-[10px] text-outline">Local Policy</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
<span className="text-xs text-on-surface">Syncing</span>
</div>
</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">60 Days</td>
<td className="px-6 py-5 text-sm text-on-surface-variant font-mono">12 Months</td>
<td className="px-6 py-5 text-right">
<p className="text-xs text-on-surface font-medium">In Progress</p>
<p className="text-[10px] text-outline">Triggering...</p>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="lg:col-span-3 bg-surface-container-low rounded-xl p-6 shadow-sm">
<div className="flex items-center justify-between mb-6">
<h3 className="text-lg font-bold text-white">Deletion &amp; Archival Events</h3>
<button className="text-xs text-primary hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-sm">download</span> Export System Audit
                        </button>
</div>
<div className="space-y-3">
<div className="flex items-start gap-4 p-4 hover:bg-surface-container rounded-xl transition-colors">
<div className="h-10 w-10 shrink-0 bg-error-container/20 text-error flex items-center justify-center rounded-lg">
<span className="material-symbols-outlined">auto_delete</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="text-sm font-bold text-white">Automated Purge Completed</h4>
<span className="text-[10px] text-outline">10:42 AM</span>
</div>
<p className="text-xs text-on-surface-variant">Cleared 12,402 expired images from <span className="text-primary font-mono">EU-West-1</span>. Reclaimed 84GB storage.</p>
<div className="mt-2 flex gap-2">
<span className="text-[9px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-outline">TASK-ID: 992-0</span>
<span className="text-[9px] font-mono bg-tertiary-container/10 px-2 py-0.5 rounded text-tertiary-fixed-dim">CONFIDENCE: 100%</span>
</div>
</div>
</div>
<div className="flex items-start gap-4 p-4 hover:bg-surface-container rounded-xl transition-colors">
<div className="h-10 w-10 shrink-0 bg-secondary-container/20 text-secondary flex items-center justify-center rounded-lg">
<span className="material-symbols-outlined">archive</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="text-sm font-bold text-white">Batch Archival Job Success</h4>
<span className="text-[10px] text-outline">08:15 AM</span>
</div>
<p className="text-xs text-on-surface-variant">Migrated 450,000 metadata records to <span className="text-secondary font-mono">Deep Archive</span>. Transition policy <span className="text-white">GLOBAL-MET-12</span>.</p>
<div className="mt-2 flex gap-2">
<span className="text-[9px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-outline">TASK-ID: 989-1</span>
<span className="text-[9px] font-mono bg-tertiary-container/10 px-2 py-0.5 rounded text-tertiary-fixed-dim">CONFIDENCE: 99.8%</span>
</div>
</div>
</div>
<div className="flex items-start gap-4 p-4 hover:bg-surface-container rounded-xl transition-colors">
<div className="h-10 w-10 shrink-0 bg-primary-container/20 text-primary flex items-center justify-center rounded-lg">
<span className="material-symbols-outlined">security_update_good</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="text-sm font-bold text-white">Encryption Key Rotation</h4>
<span className="text-[10px] text-outline">Yesterday</span>
</div>
<p className="text-xs text-on-surface-variant">System-wide rotation of storage layer master keys completed. All legacy archives re-verified.</p>
</div>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}