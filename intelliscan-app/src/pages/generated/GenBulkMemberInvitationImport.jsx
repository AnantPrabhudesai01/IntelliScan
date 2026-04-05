import React from 'react';

export default function GenBulkMemberInvitationImport() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="mt-16 p-10 max-w-7xl mx-auto w-full">

<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<nav className="flex items-center gap-2 text-on-surface-variant text-xs font-medium mb-2">
<span>Workspace</span>
<span className="material-symbols-outlined text-[10px]">chevron_right</span>
<span>Members</span>
<span className="material-symbols-outlined text-[10px]">chevron_right</span>
<span className="text-primary">Bulk Import</span>
</nav>
<h1 className="text-4xl font-extrabold font-headline tracking-tight text-white">Bulk Member Invitation</h1>
<p className="text-on-surface-variant mt-2 max-w-xl">Onboard your entire organization by uploading a CSV or Excel file. Map your custom fields and assign roles at scale.</p>
</div>
<div className="flex items-center gap-3">
<button className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:brightness-125 transition-all">Download Template</button>
<button className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all">
<span className="material-symbols-outlined text-sm">send</span> 
                        Send All Invitations
                    </button>
</div>
</div>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
<section className="bg-surface-container-low rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center text-center min-h-[340px] group cursor-pointer hover:border-indigo-500/30 transition-all duration-300">
<div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-indigo-400 text-4xl">upload_file</span>
</div>
<h3 className="text-xl font-bold font-headline text-white mb-2">Upload Data Source</h3>
<p className="text-on-surface-variant text-sm mb-6 px-10">Drag and drop your .csv or .xlsx file here to begin the mapping process.</p>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg">
<span className="material-symbols-outlined text-on-tertiary-fixed-variant text-sm">file_present</span>
<span className="text-xs font-mono">example_roster.csv</span>
</div>
</div>
</section>

<section className="bg-surface-container-low rounded-xl p-6 border border-white/5">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline font-bold text-lg text-white">Field Mapping</h3>
<span className="bg-tertiary-container/30 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">3 Fields Identified</span>
</div>
<div className="space-y-4">

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">person</span>
<span className="text-sm font-semibold">Full Name</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30">east</span>
<select className="bg-surface-container-high border-none text-xs rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 min-w-[140px]">
<option>Column: name</option>
<option>Column: user_id</option>
</select>
</div>

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">alternate_email</span>
<span className="text-sm font-semibold">Email Address</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30">east</span>
<select className="bg-surface-container-high border-none text-xs rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 min-w-[140px]">
<option>Column: email</option>
<option>Column: contact</option>
</select>
</div>

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border-l-4 border-indigo-500">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">manage_accounts</span>
<span className="text-sm font-semibold">System Role</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30">east</span>
<div className="flex items-center gap-2">
<span className="text-[10px] text-on-surface-variant font-medium">Default:</span>
<select className="bg-indigo-500/10 text-indigo-400 border-none text-xs font-bold rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500">
<option>Member</option>
<option>Admin</option>
<option>Viewer</option>
</select>
</div>
</div>
</div>
</section>
</div>

<div className="col-span-12 lg:col-span-7">
<div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden flex flex-col h-full">
<div className="p-6 flex items-center justify-between border-b border-white/5">
<div>
<h3 className="font-headline font-bold text-lg text-white">Import Preview</h3>
<p className="text-xs text-on-surface-variant mt-1">Reviewing 128 pending invitations from <span className="text-indigo-400 font-mono">roster_q4.xlsx</span></p>
</div>
<div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl">
<span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
<input className="bg-transparent border-none text-xs focus:ring-0 w-32" placeholder="Search preview..." type="text"/>
</div>
</div>
<div className="flex-1 overflow-auto max-h-[600px]">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface-container-low z-10">
<tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-b border-white/5">
<th className="px-6 py-4">User</th>
<th className="px-6 py-4">Email</th>
<th className="px-6 py-4">Role Mapping</th>
<th className="px-6 py-4 text-right">Confidence</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">

<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">JD</div>
<span className="text-sm font-medium text-white">Julianne Devis</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">j.devis@enterprise.ai</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-secondary-container/30 text-secondary border border-secondary/20">ADMIN</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">99%</span>
</td>
</tr>

<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-bold">MK</div>
<span className="text-sm font-medium text-white">Marcus King</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">m.king@enterprise.ai</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">MEMBER</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">98%</span>
</td>
</tr>

<tr className="hover:bg-white/5 transition-colors group bg-error/5">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-error-container/30 flex items-center justify-center text-error text-xs font-bold">??</div>
<span className="text-sm font-medium text-white italic">Undetected Name</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">support@outsourced.com</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">VIEWER</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-on-error-container">42%</span>
</td>
</tr>

<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">SL</div>
<span className="text-sm font-medium text-white">Sarah Lohan</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">s.lohan@enterprise.ai</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">MEMBER</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">94%</span>
</td>
</tr>

<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">BT</div>
<span className="text-sm font-medium text-white">Bryan Tims</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">b.tims@enterprise.ai</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">MEMBER</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">91%</span>
</td>
</tr>

<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">HP</div>
<span className="text-sm font-medium text-white">Helen Park</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">h.park@enterprise.ai</td>
<td className="px-6 py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container-high text-on-surface-variant">MEMBER</span>
</td>
<td className="px-6 py-4 text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">99%</span>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-6 border-t border-white/5 bg-surface-container-low flex items-center justify-between">
<span className="text-xs text-on-surface-variant">Showing 6 of 128 rows found.</span>
<div className="flex gap-2">
<button className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-white transition-all">
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-white transition-all">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>

<div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
<div className="bg-surface-container p-6 rounded-xl border-l-4 border-indigo-500">
<p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Total Records</p>
<p className="text-2xl font-black font-headline text-white mt-1">128</p>
</div>
<div className="bg-surface-container p-6 rounded-xl border-l-4 border-emerald-500">
<p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Ready to Invite</p>
<p className="text-2xl font-black font-headline text-emerald-400 mt-1">121</p>
</div>
<div className="bg-surface-container p-6 rounded-xl border-l-4 border-error">
<p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Requires Review</p>
<p className="text-2xl font-black font-headline text-error mt-1">7</p>
</div>
<div className="bg-surface-container p-6 rounded-xl border-l-4 border-tertiary">
<p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Est. Processing Time</p>
<p className="text-2xl font-black font-headline text-tertiary mt-1">&lt; 2s</p>
</div>
</div>
</div>

    </div>
  );
}