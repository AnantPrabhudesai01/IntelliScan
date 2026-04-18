import React from 'react';

export default function GenAuditLogsSecurity() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
<div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
<label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Date Range</label>
<div className="flex items-center gap-2 text-on-surface text-sm">
<span className="material-symbols-outlined text-primary" data-icon="calendar_today">calendar_today</span>
<span>Last 24 Hours</span>
<span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer" data-icon="expand_more">expand_more</span>
</div>
</div>
<div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
<label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Event Category</label>
<div className="flex items-center gap-2 text-on-surface text-sm">
<span className="material-symbols-outlined text-primary" data-icon="filter_list">filter_list</span>
<span>All Activities</span>
<span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer" data-icon="expand_more">expand_more</span>
</div>
</div>
<div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
<label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Active User</label>
<div className="flex items-center gap-2 text-on-surface text-sm">
<span className="material-symbols-outlined text-primary" data-icon="person">person</span>
<span>System Admin</span>
<span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer" data-icon="expand_more">expand_more</span>
</div>
</div>
<div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
<label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">System Health</label>
<div className="flex items-center gap-2 text-tertiary font-bold text-sm">
<span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
<span>Fully Encrypted</span>
</div>
</div>
</section>

<div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/40">
<div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
<h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="security">security</span>
                        System Events
                    </h3>
<div className="flex items-center gap-4 text-xs text-on-surface-variant">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Successful</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Failed</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant/10">
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Timestamp</th>
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Identity</th>
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Event Type</th>
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Resource Path</th>
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">IP Address</th>
<th className="px-6 py-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Security Status</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-medium text-on-surface">Oct 24, 2023</div>
<div className="text-[11px] text-on-surface-variant">14:23:45.092</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">AD</div>
<div>
<div className="text-sm font-semibold text-on-surface">admin_main</div>
<div className="text-[11px] text-on-surface-variant">Superuser</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary text-[11px] font-bold">
<span className="material-symbols-outlined text-xs" data-icon="file_upload">file_upload</span>
                                        CONTACT EXPORT
                                    </div>
</td>
<td className="px-6 py-4">
<div className="text-xs font-mono text-on-surface-variant">/api/v2/contacts/bulk_export</div>
</td>
<td className="px-6 py-4">
<div className="text-sm text-on-surface">192.168.1.104</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-bold tracking-tight">SUCCESS</span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-medium text-on-surface">Oct 24, 2023</div>
<div className="text-[11px] text-on-surface-variant">14:15:22.110</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">UK</div>
<div>
<div className="text-sm font-semibold text-on-surface">unknown_user</div>
<div className="text-[11px] text-on-surface-variant">Unauthorized</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-error text-[11px] font-bold">
<span className="material-symbols-outlined text-xs" data-icon="login">login</span>
                                        LOGIN ATTEMPT
                                    </div>
</td>
<td className="px-6 py-4">
<div className="text-xs font-mono text-on-surface-variant">/auth/signin</div>
</td>
<td className="px-6 py-4">
<div className="text-sm text-on-surface">45.22.190.12</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-error-container/20 text-error text-[10px] font-bold tracking-tight">DENIED</span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-medium text-on-surface">Oct 24, 2023</div>
<div className="text-[11px] text-on-surface-variant">13:58:01.442</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-[10px] font-bold text-primary">SC</div>
<div>
<div className="text-sm font-semibold text-on-surface">scanner_svc</div>
<div className="text-[11px] text-on-surface-variant">System Process</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary-fixed-dim text-[11px] font-bold">
<span className="material-symbols-outlined text-xs" data-icon="key_visualizer">key_visualizer</span>
                                        API KEY ROTATION
                                    </div>
</td>
<td className="px-6 py-4">
<div className="text-xs font-mono text-on-surface-variant">/sys/keys/internal</div>
</td>
<td className="px-6 py-4">
<div className="text-sm text-on-surface">::1 (Local)</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-bold tracking-tight">SUCCESS</span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-medium text-on-surface">Oct 24, 2023</div>
<div className="text-[11px] text-on-surface-variant">12:44:12.880</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">AD</div>
<div>
<div className="text-sm font-semibold text-on-surface">admin_main</div>
<div className="text-[11px] text-on-surface-variant">Superuser</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary text-[11px] font-bold">
<span className="material-symbols-outlined text-xs" data-icon="settings">settings</span>
                                        SETTING_CHANGE
                                    </div>
</td>
<td className="px-6 py-4">
<div className="text-xs font-mono text-on-surface-variant">/workspace/security/global_config</div>
</td>
<td className="px-6 py-4">
<div className="text-sm text-on-surface">192.168.1.104</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-bold tracking-tight">SUCCESS</span>
</td>
</tr>
</tbody>
</table>
</div>

<div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/10">
<p className="text-[11px] text-on-surface-variant">Showing 1 to 4 of 1,240 entries</p>
<div className="flex items-center gap-2">
<button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors disabled:opacity-30" disabled="">
<span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
</button>
<div className="flex items-center gap-1">
<span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">1</span>
<span className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-xs font-bold cursor-pointer transition-colors">2</span>
<span className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-xs font-bold cursor-pointer transition-colors">3</span>
</div>
<button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>

<section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-surface-container-low p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
<div className="flex items-center justify-between z-10">
<div>
<h4 className="font-headline font-bold text-on-surface">Threat Vectors &amp; Geo-Location</h4>
<p className="text-xs text-on-surface-variant">Visualization of current incoming traffic patterns.</p>
</div>
<span className="px-3 py-1 bg-primary-container/20 text-primary text-[10px] font-bold rounded-full">LIVE FEED</span>
</div>
<div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center overflow-hidden border border-outline-variant/10">
<img className="w-full h-full object-cover opacity-60" data-alt="Abstract world map with glowing blue network connections and data nodes on a dark background representing global cyber traffic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8MpcN3mDuU4TqaSSAsyac5aQ1bjG6Sqw9VDNaQg_GuAxsFSXRgOHc0DcZHSxI9HK_o3Z7qCTSBuUUwZ5mnjvAWgRgjMUNgvM4WPxdmkXjhhGLItHUvYEydxDmLEf_LAX6BMMFWsMVH2sUNlFz8NcokkrtNrdGt_Z97bbfkXAFanjAnXH88_YGT1BFqfY-NjAyetZLplakn7V21P5QwwlKdDuZMGJrNmH-8AUP2-RDam5Ti8bQbJ2POwLvrsIHYE9JyIliTsq81gYS"/>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-6">
<h4 className="font-headline font-bold text-on-surface">Security Summary</h4>
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<span className="text-sm text-on-surface-variant">Active Sessions</span>
<span className="text-sm font-bold text-on-surface">12</span>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[15%]"></div>
</div>
<div className="flex items-center justify-between mt-2">
<span className="text-sm text-on-surface-variant">Failed Auth (24h)</span>
<span className="text-sm font-bold text-error">128</span>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-error h-full w-[45%]"></div>
</div>
<div className="flex items-center justify-between mt-2">
<span className="text-sm text-on-surface-variant">Data Exported</span>
<span className="text-sm font-bold text-tertiary">1.2 GB</span>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-tertiary h-full w-[65%]"></div>
</div>
</div>
<div className="mt-auto p-4 bg-surface-container rounded-xl border border-outline-variant/10">
<div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">PRO-TIP</div>
<p className="text-[11px] leading-relaxed text-on-surface-variant italic">Consider enabling Multi-Factor Authentication for the 'scanner_svc' endpoint to further secure automated processes.</p>
</div>
</div>
</section>

    </div>
  );
}
