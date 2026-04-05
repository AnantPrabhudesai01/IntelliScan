import React from 'react';

export default function GenAdvancedSecurityAuditLogs2() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="px-8 pb-12 flex flex-col gap-6">

<section className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-low p-4 rounded-xl">
<div className="md:col-span-1 relative">
<span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
<input className="w-full bg-surface-container border-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary-container transition-all" placeholder="Search events or users..." type="text"/>
</div>
<div className="flex gap-2 md:col-span-3">
<div className="flex-1 relative">
<select className="w-full bg-surface-container border-none rounded-xl px-4 py-2.5 text-sm text-on-surface appearance-none focus:ring-1 focus:ring-primary-container transition-all">
<option>All Severities</option>
<option>Critical</option>
<option>Warning</option>
<option>Info</option>
</select>
<span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none">expand_more</span>
</div>
<div className="flex-1 relative">
<select className="w-full bg-surface-container border-none rounded-xl px-4 py-2.5 text-sm text-on-surface appearance-none focus:ring-1 focus:ring-primary-container transition-all">
<option>Last 24 Hours</option>
<option>Last 7 Days</option>
<option>Last 30 Days</option>
<option>Custom Range</option>
</select>
<span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none">calendar_today</span>
</div>
<button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container text-on-surface text-sm font-medium rounded-xl hover:bg-surface-container-high transition-all border border-outline-variant/5">
<span className="material-symbols-outlined text-sm">filter_list</span>
                        Advanced Filters
                    </button>
</div>
</section>

<div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/40">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/50 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
<th className="px-6 py-4 font-semibold">Timestamp</th>
<th className="px-6 py-4 font-semibold">User</th>
<th className="px-6 py-4 font-semibold">Action</th>
<th className="px-6 py-4 font-semibold">IP Address</th>
<th className="px-6 py-4 font-semibold">Location</th>
<th className="px-6 py-4 font-semibold text-right">Severity</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<p className="text-sm font-medium text-white">Oct 24, 2023</p>
<p className="text-xs text-on-surface-variant">14:32:01 UTC</p>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs">JD</div>
<div>
<p className="text-sm font-semibold text-white">Jane Doe</p>
<p className="text-[10px] text-on-surface-variant">jane.doe@intelliscan.io</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-xs font-mono bg-secondary-container/30 text-on-secondary-container px-2 py-0.5 rounded text-[10px]">API-KEY-04</span>
<span className="text-sm text-on-surface">API Key Created</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">192.168.1.144</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="material-symbols-outlined text-base">location_on</span>
<span className="text-xs">San Francisco, US</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold text-on-surface border border-outline-variant/20 uppercase tracking-tighter">
                                    Info
                                </span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<p className="text-sm font-medium text-white">Oct 24, 2023</p>
<p className="text-xs text-on-surface-variant">13:15:44 UTC</p>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img alt="User" className="w-8 h-8 rounded-lg object-cover" data-alt="Portrait of a diverse tech worker with glasses, smiling softly, high-key lighting with a professional gray background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx1-Of2cxizEcpJQjx_k_9qTP4K43WSIY6DW662YPe-Nd4yoYAt_8wqu19qVVKud0E_Gk14ls1apcd0U-Wjd_ndAnOa7zR0mXOqQDCaOTdTS3XvhBHrKaz8tpXuhCtObPWJMp3yck2HrhRWxBx4DpIgBAWUbmnVhxI5xAxbDXQwLmGfEgyLCgUIf3CZK0aArNmmbfKyyw0hcxKkuPgEzxyw5Jj9VBDPh1A5qEcRdBTJq1qUJARJvvxKKBFSlALAgCo7_fwjCkWiMz2"/>
<div>
<p className="text-sm font-semibold text-white">Marcus Chen</p>
<p className="text-[10px] text-on-surface-variant">m.chen@intelliscan.io</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-xs font-mono bg-error-container/20 text-error px-2 py-0.5 rounded text-[10px]">AUTH-FAIL</span>
<span className="text-sm text-on-surface">Multiple Login Failures</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">45.22.190.12</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="material-symbols-outlined text-base">location_on</span>
<span className="text-xs">Frankfurt, DE</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center rounded-full bg-error-container/40 px-3 py-1 text-[10px] font-bold text-error border border-error/20 uppercase tracking-tighter">
                                    Critical
                                </span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<p className="text-sm font-medium text-white">Oct 24, 2023</p>
<p className="text-xs text-on-surface-variant">12:04:12 UTC</p>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary font-bold text-xs">SA</div>
<div>
<p className="text-sm font-semibold text-white">System Automator</p>
<p className="text-[10px] text-on-surface-variant">service-account@internal</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-xs font-mono bg-tertiary-container/30 text-on-tertiary-container px-2 py-0.5 rounded text-[10px]">DATA-PURGE</span>
<span className="text-sm text-on-surface">Bulk Records Deleted</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">-- Internal --</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="material-symbols-outlined text-base">cloud</span>
<span className="text-xs">Cluster-US-East</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center rounded-full bg-tertiary-container/40 px-3 py-1 text-[10px] font-bold text-on-tertiary-container border border-tertiary/20 uppercase tracking-tighter">
                                    Warning
                                </span>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-4">
<p className="text-sm font-medium text-white">Oct 24, 2023</p>
<p className="text-xs text-on-surface-variant">09:45:30 UTC</p>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img alt="User" className="w-8 h-8 rounded-lg object-cover" data-alt="Professional woman in business attire looking into camera with a slight smile, minimalist corporate office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCWThPqHBOBDU6SPKpryhzTpb-WDzk49s295ODdhPMNCXzeF65D5ZO8z61BFnscwlpAYGYCj4WbRGAQcJK_viaK5SOubY_fcxliY9ImZRSZfZH117YhIPliq2KCMLiYMEJLtlWucmgJhycHDz8Zc9eR6wcLkGH_oyf3YOUrWUMFZfatYvwulfbaln9vehVu3P4hzic4ZC-4fHLVl7BFMEVGQRhZOhMYEkFilBSZKTMZgcfZgd-k5PwBTfQ2jFzcCfMNRHdJeYXHrPC"/>
<div>
<p className="text-sm font-semibold text-white">Sarah Wilson</p>
<p className="text-[10px] text-on-surface-variant">s.wilson@intelliscan.io</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-xs font-mono bg-secondary-container/30 text-on-secondary-container px-2 py-0.5 rounded text-[10px]">INV-SEND</span>
<span className="text-sm text-on-surface">New Member Invited</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">108.12.4.99</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="material-symbols-outlined text-base">location_on</span>
<span className="text-xs">London, UK</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold text-on-surface border border-outline-variant/20 uppercase tracking-tighter">
                                    Info
                                </span>
</td>
</tr>
</tbody>
</table>

<div className="px-6 py-4 bg-surface-container/30 flex items-center justify-between">
<p className="text-xs text-on-surface-variant">Showing <span className="text-white font-medium">1-15</span> of <span className="text-white font-medium">1,284</span> entries</p>
<div className="flex gap-2">
<button className="p-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all disabled:opacity-30" disabled="">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="px-3 py-1 bg-primary-container text-white text-xs font-bold rounded-lg">1</button>
<button className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-lg">2</button>
<button className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-lg">3</button>
<button className="p-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start mb-4">
<h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Failed Logins (24h)</h4>
<span className="material-symbols-outlined text-error">dangerous</span>
</div>
<p className="text-4xl font-headline font-extrabold text-white">42</p>
<p className="text-xs text-error mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-xs">trending_up</span>
                        12% increase from yesterday
                    </p>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start mb-4">
<h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Active API Keys</h4>
<span className="material-symbols-outlined text-primary">key</span>
</div>
<p className="text-4xl font-headline font-extrabold text-white">12</p>
<p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-xs">check_circle</span>
                        All rotated within 90 days
                    </p>
</div>
<div className="bg-primary-container/10 p-6 rounded-xl border border-primary/10 flex flex-col justify-center">
<div className="flex items-center gap-4">
<div className="p-3 bg-primary-container rounded-xl">
<span className="material-symbols-outlined text-white">shield_with_heart</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Security Posture: High</h4>
<p className="text-xs text-on-primary-container/80">Last audit verified by OCR-V2 Engine</p>
</div>
</div>
</div>
</section>
</div>



    </div>
  );
}