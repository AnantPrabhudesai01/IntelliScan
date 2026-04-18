import React from 'react';

export default function GenDataExportHistoryLog() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="p-8 flex-grow">

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<p className="text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant mb-2">Total Exports</p>
<div className="flex items-end justify-between">
<h3 className="text-3xl font-bold font-['Manrope'] text-white">1,284</h3>
<span className="text-tertiary text-xs font-medium bg-tertiary-container/10 px-2 py-1 rounded-lg">+12% vs last mo</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<p className="text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant mb-2">Active Jobs</p>
<div className="flex items-end justify-between">
<h3 className="text-3xl font-bold font-['Manrope'] text-white">3</h3>
<div className="flex gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
<span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse delay-75"></span>
<span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse delay-150"></span>
</div>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<p className="text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant mb-2">Storage Used</p>
<div className="flex items-end justify-between">
<h3 className="text-3xl font-bold font-['Manrope'] text-white">4.2<span className="text-sm font-normal text-on-surface-variant ml-1">GB</span></h3>
<span className="text-on-surface-variant text-xs font-medium">68% of limit</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<p className="text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant mb-2">Avg. File Size</p>
<div className="flex items-end justify-between">
<h3 className="text-3xl font-bold font-['Manrope'] text-white">12.4<span className="text-sm font-normal text-on-surface-variant ml-1">MB</span></h3>
<span className="material-symbols-outlined text-primary" data-icon="file_present">file_present</span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between mb-6 gap-4">
<div className="flex items-center gap-2">
<button className="bg-surface-container-high text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-outline-variant/10">
<span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
            All Types
          </button>
<button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            Today
          </button>
<button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            Success Only
          </button>
</div>
<button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
<span className="material-symbols-outlined text-sm" data-icon="add">add</span>
          NEW EXPORT JOB
        </button>
</div>

<div className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden shadow-2xl">
<div className="overflow-x-auto custom-scrollbar">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/50 border-b border-outline-variant/10">
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant">Export Request</th>
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant">Format</th>
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant">Requester</th>
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant">Date &amp; Time</th>
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant">Status</th>
<th className="px-6 py-4 text-xs font-['Inter'] uppercase tracking-widest text-on-surface-variant text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="hover:bg-surface-container/30 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg" data-icon="file_text">description</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Financial_Audit_Q3_Full</p>
<p className="text-xs text-on-surface-variant">3,492 Records • 42.1 MB</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded-md bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-wider uppercase border border-secondary/10">JSON</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-surface-container">
<img className="w-full h-full rounded-full object-cover" data-alt="close-up portrait of a professional male developer with spectacles" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXPrkz1t9sbkVob81BSjgF6zh6yWakeCAwt2UsFW5pPaS5uEvpxG_fn8tLEjfFYjco0GhyGa4ExMlEeF1ALDLCB-CuxhD85_YqxMdOhSC1_H9S70hMM9CobRc0y-dAXfsJZEor6gbkkC_UpMUk2z0fX6cMqshLmh-gdE-Y6RRocpkEjaBvRlIUIByCMA5P8frhjleGlCMwZmj3faYuVqITa5pGSo6yJ-NWV7idMxF9YNbcaJ9Fv22V_ijYNosC6cFWyOMHpnQafO9I"/>
</div>
<span className="text-sm text-on-surface">Alex Rivera</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="clock">schedule</span>
<span className="text-sm">Oct 24, 2024 • 14:32</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-tertiary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="text-xs font-bold uppercase tracking-tight">Completed</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:text-white transition-colors bg-primary-container/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined" data-icon="download">download</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container/30 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg" data-icon="sync">cloud_sync</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Salesforce_Contacts_Sync</p>
<p className="text-xs text-on-surface-variant">12,100 Records • API Push</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded-md bg-tertiary-container/20 text-tertiary text-[10px] font-bold tracking-wider uppercase border border-tertiary/10">SALESFORCE</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-surface-container">
<img className="w-full h-full rounded-full object-cover" data-alt="professional female portrait in high-key lighting for team member thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATUNXcxSD1uXbvkpASnQ6ap3AqHtfYkHUpGIk6JrAMg9L2SUy_v6tlIT-IdrIdPpOAtwfeM6w5nU3JG6IZwg1x9C7-a_3NhlVOw6sUv7C-LWbGC_1VxAsz0L0Izz6CcNxdYCNbVR0OUmljf9GY_C3Soz6utNETGNvJU9NDXStrDyzTiSRBrTi1FZFJJTEFLIMCSZk-9T5gXZcgM0DhLUedBX2JxRoCYFJwAdXTKf3B_97Xj_o3NIBPwg-QIebz0pUd1YgxH6VEqvaa"/>
</div>
<span className="text-sm text-on-surface">Sarah Chen</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="clock">schedule</span>
<span className="text-sm">Oct 24, 2024 • 12:15</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
<span className="text-xs font-bold uppercase tracking-tight">Processing</span>
</div>
</td>
<td className="px-6 py-4 text-right text-on-surface-variant">
<span className="text-xs italic">In Progress</span>
</td>
</tr>

<tr className="hover:bg-surface-container/30 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg" data-icon="table">table_view</span>
</div>
<div>
<p className="text-sm font-semibold text-white">User_Activity_Logs_Daily</p>
<p className="text-xs text-on-surface-variant">540 Records • 2.8 MB</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded-md bg-outline-variant/20 text-on-surface-variant text-[10px] font-bold tracking-wider uppercase border border-outline-variant/10">CSV</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary">SYS</div>
<span className="text-sm text-on-surface">Auto-System</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="clock">schedule</span>
<span className="text-sm">Oct 24, 2024 • 00:00</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-tertiary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="text-xs font-bold uppercase tracking-tight">Completed</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:text-white transition-colors bg-primary-container/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined" data-icon="download">download</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container/30 transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-error">
<span className="material-symbols-outlined text-lg" data-icon="warning">report</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Mass_OCR_Output_Dump</p>
<p className="text-xs text-on-surface-variant">Timed Out @ 45k Records</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded-md bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-wider uppercase border border-secondary/10">JSON</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-surface-container">
<img className="w-full h-full rounded-full object-cover" data-alt="headshot of a mature business leader with grey hair against professional backdrop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCisnQzRoJ-R5g91SeilNVZMbxeGiAH1oOkLe21mMRlwktTlHzVdtDAD3f9GCPU_pyp5ljLE9ChaEoFXjzB6VD75mN45VnSRnhOEtC9Vf1ULUAP6THMOtcQ86vxNgWqwPkgVqDrIhGX61R5v7Bx8kRVjblvTtCvQZqn028tmAEzmllCdlJJunIbGO_yxLGbOioOCcD1pqkJsRWVmTKzTM2hHoIDkxlpO7S5-Rhos8pkxIIAeXe_PmJDQXTouGvJW5Qf-1hCz77acLjS"/>
</div>
<span className="text-sm text-on-surface">Marcus Thorne</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="clock">schedule</span>
<span className="text-sm">Oct 23, 2024 • 18:45</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-error">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
<span className="text-xs font-bold uppercase tracking-tight">Failed</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="text-on-surface-variant hover:text-white transition-colors p-2">
<span className="material-symbols-outlined" data-icon="info">info</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>

<div className="bg-surface-container/30 px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
<span className="text-xs text-on-surface-variant uppercase tracking-widest font-['Inter']">Showing 1-10 of 1,284 results</span>
<div className="flex gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white border border-outline-variant/10 transition-colors disabled:opacity-30" disabled="">
<span className="material-symbols-outlined text-sm leading-none" data-icon="chevron_left">chevron_left</span>
</button>
<button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-xs">1</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white border border-outline-variant/10 transition-colors">2</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white border border-outline-variant/10 transition-colors">3</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white border border-outline-variant/10 transition-colors">
<span className="material-symbols-outlined text-sm leading-none" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</section>



    </div>
  );
}
