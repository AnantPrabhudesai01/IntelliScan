import React from 'react';

export default function GenDataExportMigration() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<section className="px-10 pb-20 max-w-7xl mx-auto space-y-10 mt-6">

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 rounded-xl flex flex-col gap-6 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
<div className="flex items-center justify-between">
<h3 className="text-lg font-bold text-white">Target CRM</h3>
<span className="material-symbols-outlined text-primary" data-icon="database">database</span>
</div>
<div className="space-y-4">
<label className="block p-4 rounded-xl border border-indigo-500/40 bg-indigo-600/10 cursor-pointer transition-all hover:border-indigo-500/60">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-[#00A1E0]/20 flex items-center justify-center text-[#00A1E0]">
<span className="material-symbols-outlined" data-icon="cloud">cloud</span>
</div>
<div className="flex-1">
<p className="font-bold text-white leading-none">Salesforce</p>
<p className="text-xs text-on-surface-variant mt-1">Enterprise Connector</p>
</div>
<span className="material-symbols-outlined text-indigo-400" data-icon="check_circle" data-weight="fill">check_circle</span>
</div>
</label>
<label className="block p-4 rounded-xl border border-outline-variant/15 bg-surface-container cursor-pointer transition-all hover:bg-surface-container-high">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-[#FF7A59]/20 flex items-center justify-center text-[#FF7A59]">
<span className="material-symbols-outlined" data-icon="hub">hub</span>
</div>
<div className="flex-1">
<p className="font-bold text-white leading-none">HubSpot</p>
<p className="text-xs text-on-surface-variant mt-1">Marketing Hub Sync</p>
</div>
</div>
</label>
<label className="block p-4 rounded-xl border border-outline-variant/15 bg-surface-container cursor-pointer transition-all hover:bg-surface-container-high">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-on-surface-variant/10 flex items-center justify-center text-on-surface">
<span className="material-symbols-outlined" data-icon="description">description</span>
</div>
<div className="flex-1">
<p className="font-bold text-white leading-none">Custom CSV / JSON</p>
<p className="text-xs text-on-surface-variant mt-1">Direct file generation</p>
</div>
</div>
</label>
</div>
</div>

<div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-xl flex flex-col gap-8">
<div className="flex items-center justify-between">
<div>
<h3 className="text-lg font-bold text-white">Visual Field Mapping</h3>
<p className="text-xs text-on-surface-variant">Auto-mapping confidence based on OCR extraction tags.</p>
</div>
<div className="flex items-center gap-2">
<span className="text-xs font-mono px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container">ENGINE: OCR-V2.1</span>
<button className="text-primary text-xs font-semibold hover:underline">Reset Mapping</button>
</div>
</div>
<div className="relative grid grid-cols-2 gap-x-20 gap-y-6">

<div className="space-y-3">
<div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Extracted (Source)</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-sm font-medium">full_name</span>
<span className="bg-tertiary-container/20 text-tertiary-fixed text-[10px] px-2 py-0.5 rounded uppercase font-bold">98% Conf</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-sm font-medium">contact_email</span>
<span className="bg-tertiary-container/20 text-tertiary-fixed text-[10px] px-2 py-0.5 rounded uppercase font-bold">94% Conf</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-sm font-medium">company_tax_id</span>
<span className="bg-error-container/20 text-on-error-container text-[10px] px-2 py-0.5 rounded uppercase font-bold">58% Conf</span>
</div>
</div>

<div className="absolute inset-x-0 top-10 flex flex-col gap-10 items-center pointer-events-none opacity-40">
<div className="w-full h-[1px] bg-gradient-to-r from-primary to-transparent translate-y-1"></div>
<div className="w-full h-[1px] bg-gradient-to-r from-primary to-transparent translate-y-2"></div>
<div className="w-full h-[1px] bg-gradient-to-r from-error to-transparent translate-y-3"></div>
</div>

<div className="space-y-3">
<div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Salesforce (Target)</div>
<div className="flex items-center justify-between p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
<span className="text-sm font-medium text-primary">Name (Text)</span>
<span className="material-symbols-outlined text-sm text-primary" data-icon="arrow_right_alt">arrow_right_alt</span>
</div>
<div className="flex items-center justify-between p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
<span className="text-sm font-medium text-primary">Email (Email)</span>
<span className="material-symbols-outlined text-sm text-primary" data-icon="arrow_right_alt">arrow_right_alt</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-sm font-medium text-on-surface-variant italic">Select field...</span>
<span className="material-symbols-outlined text-sm opacity-30" data-icon="unfold_more">unfold_more</span>
</div>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 lg:col-span-9 space-y-4">
<div className="flex items-center justify-between mb-2">
<h3 className="text-xl font-bold text-white flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="history">history</span>
                            Recent Exports
                        </h3>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container">
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Destination</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Batch Size</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Success Rate</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container-high transition-colors cursor-default">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-blue-400"></div>
<span className="text-sm font-medium">Salesforce_PROD_1</span>
</div>
</td>
<td className="px-6 py-5 text-sm">1,240 records</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 w-[100%]"></div>
</div>
<span className="text-xs font-bold text-emerald-400">100%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>
</td>
<td className="px-6 py-5 text-xs text-on-surface-variant">Oct 24, 14:20</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors cursor-default">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-orange-400"></div>
<span className="text-sm font-medium">HubSpot_Primary</span>
</div>
</td>
<td className="px-6 py-5 text-sm">452 records</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-amber-500 w-[92%]"></div>
</div>
<span className="text-xs font-bold text-amber-400">92%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">WARNING</span>
</td>
<td className="px-6 py-5 text-xs text-on-surface-variant">Oct 22, 09:12</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors cursor-default">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-on-surface-variant"></div>
<span className="text-sm font-medium">Master_Dump.csv</span>
</div>
</td>
<td className="px-6 py-5 text-sm">8,900 records</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-indigo-500 w-[100%]"></div>
</div>
<span className="text-xs font-bold text-indigo-400">100%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">COMPLETED</span>
</td>
<td className="px-6 py-5 text-xs text-on-surface-variant">Oct 20, 18:45</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="col-span-12 lg:col-span-3">
<div className="glass-effect p-6 rounded-xl border border-outline-variant/10 shadow-2xl shadow-black/40 h-full flex flex-col justify-between">
<div className="space-y-6">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary" data-icon="schedule">schedule</span>
<h3 className="font-bold text-white">Automation</h3>
</div>
<div className="space-y-4">
<div>
<label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Sync Frequency</label>
<select className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500/50 focus:ring-0 outline-none transition-all">
<option>Daily at 00:00 UTC</option>
<option>Weekly (Mondays)</option>
<option>Real-time (Webhooks)</option>
</select>
</div>
<div>
<label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Collision Strategy</label>
<div className="grid grid-cols-2 gap-2">
<button className="bg-primary-container text-xs font-bold py-2 rounded-lg">Override</button>
<button className="bg-surface-container-high text-xs font-bold py-2 rounded-lg hover:bg-surface-bright">Append</button>
</div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/10">
<button className="w-full bg-surface-bright text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group">
                                Save Automation
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-outline-variant/10">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="cloud_sync">cloud_sync</span>
</div>
<div>
<p className="text-xs text-on-surface-variant">Total Records Exported</p>
<p className="text-xl font-bold text-white">428,502</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="timer">timer</span>
</div>
<div>
<p className="text-xs text-on-surface-variant">Average Sync Latency</p>
<p className="text-xl font-bold text-white">4.2s</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="verified_user">verified_user</span>
</div>
<div>
<p className="text-xs text-on-surface-variant">Security Protocol</p>
<p className="text-xl font-bold text-white">TLS 1.3 / AES-256</p>
</div>
</div>
</div>
</section>

    </div>
  );
}