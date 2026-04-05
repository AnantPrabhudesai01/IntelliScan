import React from 'react';

export default function GenSystemMaintenanceDowntimeSchedule() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<span className="text-indigo-500 font-bold tracking-widest text-xs uppercase mb-2 block">Maintenance Control</span>
<h2 className="text-4xl font-extrabold tracking-tighter text-white">System Downtime Scheduler</h2>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/10">
<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
<span className="text-xs font-semibold text-on-surface-variant">System Online</span>
</div>
<button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-indigo-900/20 active:scale-95 transition-all">
<span className="material-symbols-outlined text-lg" data-icon="calendar_add_on">calendar_add_on</span>
                        Schedule Event
                    </button>
</div>
</div>

<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 lg:col-span-8 space-y-8">

<section className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden">
<div className="flex items-center justify-between mb-8">
<h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
<span className="material-symbols-outlined text-indigo-400" data-icon="timeline">timeline</span>
                                Engine Availability Matrix
                            </h3>
<div className="flex gap-2">
<button className="text-xs font-bold text-white/50 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/10">W</button>
<button className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg">M</button>
<button className="text-xs font-bold text-white/50 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/10">Q</button>
</div>
</div>
<div className="space-y-6">

<div className="relative">
<div className="flex justify-between items-center mb-2">
<span className="text-xs font-mono text-on-surface-variant">GEMINI-PRO-1.5</span>
<span className="text-[10px] px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full font-bold">99.8%</span>
</div>
<div className="h-6 w-full bg-surface-container-high rounded-lg overflow-hidden flex gap-[2px]">
<div className="flex-1 bg-emerald-500/40"></div>
<div className="flex-1 bg-emerald-500/40"></div>
<div className="w-8 bg-error-container/60 group relative cursor-pointer">
<div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 glass-panel rounded-lg text-[10px] w-32 border border-outline-variant/30">
                                            Oct 24: v1.2 Patch
                                        </div>
</div>
<div className="flex-[3] bg-emerald-500/40"></div>
<div className="flex-1 bg-emerald-500/40"></div>
<div className="flex-1 bg-emerald-500/40"></div>
</div>
</div>

<div className="relative">
<div className="flex justify-between items-center mb-2">
<span className="text-xs font-mono text-on-surface-variant">TESSERACT-OCR</span>
<span className="text-[10px] px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full font-bold">94.2%</span>
</div>
<div className="h-6 w-full bg-surface-container-high rounded-lg overflow-hidden flex gap-[2px]">
<div className="flex-[5] bg-emerald-500/40"></div>
<div className="w-12 bg-indigo-500/40 animate-pulse"></div>
<div className="flex-[2] bg-emerald-500/40"></div>
</div>
</div>

<div className="relative">
<div className="flex justify-between items-center mb-2">
<span className="text-xs font-mono text-on-surface-variant">EXTERNAL-API-GW</span>
<span className="text-[10px] px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full font-bold">100%</span>
</div>
<div className="h-6 w-full bg-surface-container-high rounded-lg overflow-hidden flex gap-[2px]">
<div className="w-full bg-emerald-500/40"></div>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
<div className="mb-8">
<h3 className="text-xl font-bold text-white mb-2">New Maintenance Window</h3>
<p className="text-sm text-on-surface-variant">Configure downtime parameters and user communication protocols.</p>
</div>
<form className="space-y-8">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Start Time</label>
<input className="w-full bg-surface-container border-none rounded-xl text-white px-4 py-3 focus:ring-1 focus:ring-indigo-500" type="datetime-local"/>
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Expected Duration</label>
<select className="w-full bg-surface-container border-none rounded-xl text-white px-4 py-3 focus:ring-1 focus:ring-indigo-500">
<option>15 Minutes (Hotfix)</option>
<option>1 Hour (Routine)</option>
<option>4 Hours (Major Update)</option>
<option>Custom Range</option>
</select>
</div>
</div>
<div className="space-y-4">
<label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Impacted Engines</label>
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<label className="flex items-center gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
<input checked="" className="rounded bg-surface-container-highest border-none text-indigo-600 focus:ring-0 w-5 h-5" type="checkbox"/>
<span className="text-sm font-semibold">Gemini</span>
</label>
<label className="flex items-center gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
<input className="rounded bg-surface-container-highest border-none text-indigo-600 focus:ring-0 w-5 h-5" type="checkbox"/>
<span className="text-sm font-semibold">Tesseract</span>
</label>
<label className="flex items-center gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
<input checked="" className="rounded bg-surface-container-highest border-none text-indigo-600 focus:ring-0 w-5 h-5" type="checkbox"/>
<span className="text-sm font-semibold">API GW</span>
</label>
<label className="flex items-center gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
<input className="rounded bg-surface-container-highest border-none text-indigo-600 focus:ring-0 w-5 h-5" type="checkbox"/>
<span className="text-sm font-semibold">Database</span>
</label>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between">
<label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Broadcast Message</label>
<span className="text-[10px] text-on-surface-variant">User Visibility: Public</span>
</div>
<textarea className="w-full bg-surface-container border-none rounded-xl text-white px-4 py-3 focus:ring-1 focus:ring-indigo-500 placeholder:text-outline/40" placeholder="e.g. System upgrade in progress. OCR results may be delayed by 5-10 minutes..." rows="3"></textarea>
</div>
<div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-amber-500" data-icon="warning">warning</span>
<p className="text-xs text-on-surface-variant max-w-xs leading-tight">Proceeding will notify 1,240 active organization administrators.</p>
</div>
<div className="flex gap-4">
<button className="text-sm font-bold text-on-surface-variant hover:text-white transition-colors" type="button">Discard</button>
<button className="bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-900/40" type="submit">Deploy Schedule</button>
</div>
</div>
</form>
</section>
</div>

<div className="col-span-12 lg:col-span-4 space-y-8">

<div className="space-y-6">
<h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Maintenance Queue</h3>

<div className="bg-surface-container p-5 rounded-xl border-l-4 border-indigo-500 relative group overflow-hidden">
<div className="absolute top-0 right-0 p-3">
<span className="flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
</span>
</div>
<div className="flex items-start gap-4">
<div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
<span className="material-symbols-outlined" data-icon="sync">sync</span>
</div>
<div>
<h4 className="text-sm font-bold text-white mb-1">Load Balancer Optimization</h4>
<p className="text-[11px] text-on-surface-variant mb-3">Service: API, Engines</p>
<div className="flex items-center gap-2">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-indigo-500 h-full w-3/4"></div>
</div>
<span className="text-[10px] font-mono text-indigo-400">75%</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container p-5 rounded-xl border-l-4 border-outline-variant/30 hover:bg-surface-container-high transition-colors">
<div className="flex items-start gap-4">
<div className="p-2 bg-surface-container-highest rounded-lg text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="event">event</span>
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<h4 className="text-sm font-bold text-white">DB Vacuum Routine</h4>
<span className="text-[9px] bg-outline-variant/20 px-1.5 py-0.5 rounded text-on-surface-variant font-mono">OCT 28</span>
</div>
<p className="text-[11px] text-on-surface-variant">Impact: Dashboard latency</p>
<div className="mt-3 flex gap-2">
<button className="text-[10px] font-bold text-indigo-400 hover:underline">Edit</button>
<button className="text-[10px] font-bold text-error/70 hover:text-error">Cancel</button>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-low/50 p-5 rounded-xl border border-outline-variant/5">
<div className="flex items-start gap-4 opacity-50">
<div className="p-2 bg-surface-container-highest rounded-lg text-emerald-500">
<span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">SSL Renewal</h4>
<p className="text-[11px] text-on-surface-variant">Completed 2h ago</p>
</div>
</div>
</div>
</div>

<div className="bg-[#1a202c]/50 p-6 rounded-2xl border border-indigo-500/10">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-indigo-500 text-lg" data-icon="auto_awesome">auto_awesome</span>
<h3 className="text-sm font-bold text-white">AI Engine Health</h3>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center text-xs">
<span className="text-on-surface-variant">OCR-V2 Confidence</span>
<span className="text-indigo-400 font-mono">98.2%</span>
</div>
<div className="flex justify-between items-center text-xs">
<span className="text-on-surface-variant">Avg. Scan Latency</span>
<span className="text-indigo-400 font-mono">1.4s</span>
</div>
<div className="flex justify-between items-center text-xs">
<span className="text-on-surface-variant">Concurrent Tasks</span>
<span className="text-indigo-400 font-mono">842</span>
</div>
</div>
<button className="w-full mt-6 py-2 border border-outline-variant/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-all">
                            View Detailed Telemetry
                        </button>
</div>

<div className="rounded-xl overflow-hidden h-48 relative group">
<img alt="Server hardware close up" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" data-alt="Macro photo of high-tech data center server hardware with blue and violet LED lights in a dark room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv19fuLg52GsrBHB_lvdsFPj2PsrSkp8pJHpfybQGlJyzpJoB-0UXqlUYb26XaiHpnMALjPcAhG36-hYUqI1RsJn6x86pETVzPoWwfzu0FxtJzoICwmDYFNj19QmXqLu45pBZOF_OfP1ptSM_4jMcvBwHlGC5hWgbtZM_CExbjQdvms65ZPXh1rGcNaiZW7tGE3LYhiFTVJ0w6M-jvXh19KRhbj1a69qEjRt2CefRnOz3_WYYcgL19KXRgIoxHewnc-4VDbhlTb_-Y"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
<div className="absolute bottom-4 left-4">
<p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Secure Core</p>
<p className="text-xs text-white font-medium">Node: Alpha-Delta-9</p>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}