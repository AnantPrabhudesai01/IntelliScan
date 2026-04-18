import React from 'react';

export default function GenDynamicDashboardBuilder() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      
<div className="p-8 max-w-7xl mx-auto">


<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 lg:col-span-3">
<div className="bg-surface-container-low rounded-xl p-5 sticky top-24">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-primary text-lg">grid_view</span>
<h2 className="font-headline font-bold text-white">Widget Library</h2>
</div>
<div className="flex flex-col gap-4">

<div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10 cursor-grab hover:border-primary/40 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">drag_indicator</span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-[10px] text-on-secondary-container font-mono">CHART</span>
</div>
<h3 className="font-semibold text-sm text-white mb-1">Scan Volume</h3>
<p className="text-xs text-on-surface-variant">Daily OCR processing throughput.</p>
</div>

<div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10 cursor-grab hover:border-primary/40 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">drag_indicator</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-container text-[10px] text-on-tertiary-container font-mono">METRIC</span>
</div>
<h3 className="font-semibold text-sm text-white mb-1">Accuracy Trends</h3>
<p className="text-xs text-on-surface-variant">Confidence score variance over time.</p>
</div>

<div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10 cursor-grab hover:border-primary/40 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">drag_indicator</span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-[10px] text-on-secondary-container font-mono">LIST</span>
</div>
<h3 className="font-semibold text-sm text-white mb-1">Team Activity</h3>
<p className="text-xs text-on-surface-variant">Real-time log of scan operations.</p>
</div>

<div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10 cursor-grab hover:border-primary/40 transition-all group">
<div className="flex items-center justify-between mb-3">
<span className="material-symbols-outlined text-on-surface-variant text-base">drag_indicator</span>
<span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-[10px] text-primary font-mono">MAP</span>
</div>
<h3 className="font-semibold text-sm text-white mb-1">Top Regions</h3>
<p className="text-xs text-on-surface-variant">Geographic distribution of contacts.</p>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/10">
<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-4">Pro Tips</p>
<div className="flex items-start gap-3 opacity-60">
<span className="material-symbols-outlined text-sm">info</span>
<p className="text-xs leading-relaxed">Hold SHIFT to snap widgets to the 12-column grid system.</p>
</div>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-9">
<div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/5 min-h-[800px] relative overflow-hidden">

<div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{}}></div>
<div className="grid grid-cols-6 gap-6 relative z-10">

<div className="col-span-6 bg-surface-container p-6 rounded-2xl shadow-xl shadow-black/40 border border-outline-variant/10">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<div className="p-2 bg-primary-container/10 rounded-lg">
<span className="material-symbols-outlined text-primary">trending_up</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Accuracy Trends</h4>
<p className="text-[10px] text-on-surface-variant">Real-time AI Confidence Score</p>
</div>
</div>
<div className="flex gap-2">
<button className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors text-lg">open_with</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-lg">close</button>
</div>
</div>
<div className="h-48 flex items-end justify-between gap-1 px-4">
<div className="w-full bg-primary-container/20 rounded-t-lg h-[60%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[45%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[80%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[65%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[95%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[70%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[85%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[55%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[90%] hover:bg-primary-container transition-all"></div>
<div className="w-full bg-primary-container/20 rounded-t-lg h-[75%] hover:bg-primary-container transition-all"></div>
</div>
</div>

<div className="col-span-3 bg-surface-container p-6 rounded-2xl shadow-xl shadow-black/40 border border-outline-variant/10">
<div className="flex items-center justify-between mb-6">
<h4 className="text-sm font-bold text-white">Scan Volume</h4>
<span className="px-2 py-1 rounded bg-tertiary-container/20 text-tertiary text-[10px] font-bold">+12%</span>
</div>
<div className="flex items-baseline gap-2 mb-4">
<span className="text-4xl font-headline font-extrabold text-white">12,482</span>
<span className="text-xs text-on-surface-variant">this week</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[78%]"></div>
</div>
</div>

<div className="col-span-3 bg-surface-container p-6 rounded-2xl shadow-xl shadow-black/40 border border-outline-variant/10">
<div className="flex items-center justify-between mb-4">
<h4 className="text-sm font-bold text-white">Team Activity</h4>
<span className="material-symbols-outlined text-on-surface-variant text-base">more_horiz</span>
</div>
<div className="space-y-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">JD</div>
<div>
<p className="text-[11px] font-semibold text-on-surface">Jane Doe scanned 42 cards</p>
<p className="text-[9px] text-on-surface-variant">2 minutes ago</p>
</div>
</div>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-[10px] font-bold text-on-tertiary-container">RK</div>
<div>
<p className="text-[11px] font-semibold text-on-surface">Ryan King updated OCR tags</p>
<p className="text-[9px] text-on-surface-variant">14 minutes ago</p>
</div>
</div>
</div>
</div>

<div className="col-span-6 border-2 border-dashed border-outline-variant/20 rounded-2xl h-40 flex flex-col items-center justify-center gap-2 group hover:border-primary/40 transition-all cursor-pointer">
<span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">add_circle</span>
<p className="text-xs text-on-surface-variant font-medium">Drop a widget here to expand your dashboard</p>
</div>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}
