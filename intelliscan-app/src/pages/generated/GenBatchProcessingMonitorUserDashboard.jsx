import React from 'react';

export default function GenBatchProcessingMonitorUserDashboard() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<section className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h2 className="text-3xl font-extrabold font-headline tracking-tight text-white">Batch Processing</h2>
<p className="text-on-surface-variant mt-1">Monitor and manage your active document intelligence pipelines.</p>
</div>
<div className="flex items-center gap-3">
<button className="bg-surface-container-high px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-sm">filter_list</span>
                        Filter
                    </button>
<button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-brand-900/20">
<span className="material-symbols-outlined text-sm">upload</span>
                        Bulk Upload
                    </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
<div className="bg-surface-container-low p-6 rounded-xl space-y-2 border-l-2 border-primary-container">
<p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Batches</p>
<p className="text-3xl font-bold text-white">12</p>
<div className="flex items-center gap-2 text-xs text-primary">
<span className="material-symbols-outlined text-xs">trending_up</span>
<span>4 running now</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl space-y-2">
<p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Success Rate</p>
<p className="text-3xl font-bold text-white">98.2%</p>
<div className="flex items-center gap-2 text-xs text-on-tertiary-container">
<span className="material-symbols-outlined text-xs">check_circle</span>
<span>Above threshold</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl space-y-2">
<p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Failed Items</p>
<p className="text-3xl font-bold text-error">142</p>
<div className="flex items-center gap-2 text-xs text-error">
<span className="material-symbols-outlined text-xs">warning</span>
<span>Needs attention</span>
</div>
</div>
<div className="md:col-span-3 lg:col-span-1 bg-surface-container-low p-6 rounded-xl flex flex-col justify-center items-center text-center space-y-3">
<div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined">speed</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Throughput</p>
<p className="text-xs text-on-surface-variant">420 doc/min</p>
</div>
</div>
</div>

<div className="space-y-4">
<div className="flex items-center justify-between px-2">
<h3 className="text-xl font-bold text-white font-headline">Ongoing Operations</h3>
<div className="flex gap-2">
<button className="text-xs font-semibold text-primary px-3 py-1 hover:bg-primary/10 rounded-lg transition-colors">Re-process All</button>
<button className="text-xs font-semibold text-error px-3 py-1 hover:bg-error/10 rounded-lg transition-colors">Delete All</button>
</div>
</div>

<div className="group bg-surface-container-low p-6 rounded-xl transition-all duration-300 hover:bg-surface-container relative overflow-hidden">
<div className="flex flex-col md:flex-row md:items-center gap-6">
<div className="flex-1 space-y-4">
<div className="flex items-center justify-between">
<div>
<h4 className="text-lg font-bold text-white">Conference Leads - Oct 24</h4>
<p className="text-xs text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-xs">calendar_today</span>
                                        Started 14 minutes ago • ID: BATCH-8294
                                    </p>
</div>
<div className="flex items-center gap-2">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-lg">OCR-V2 Engine</span>
<span className="px-3 py-1 bg-primary-container/20 text-primary text-[10px] font-bold uppercase rounded-lg animate-pulse">Processing</span>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-medium">
<span className="text-on-surface">65% Completed</span>
<span className="text-on-surface-variant">2,450 / 3,800 items</span>
</div>
<div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[65%] rounded-full transition-all duration-1000"></div>
</div>
</div>
<div className="flex flex-wrap gap-4 pt-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-xs font-medium">2,412 Success</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-error text-sm">cancel</span>
<span className="text-xs font-medium">38 Errors</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-tertiary-container text-sm">stars</span>
<span className="text-xs font-medium">94% Confidence</span>
</div>
</div>
</div>
<div className="flex md:flex-col gap-2 min-w-[160px]">
<button className="flex-1 bg-surface-container-highest text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors">
<span className="material-symbols-outlined text-sm">download</span>
                                Download Error Report
                            </button>
<div className="flex gap-2">
<button className="flex-1 border border-outline-variant hover:border-primary px-3 py-2 rounded-xl text-xs font-medium text-on-surface transition-colors">
                                    Pause
                                </button>
<button className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</div>
</div>
</div>

<div className="group bg-surface-container-low p-6 rounded-xl transition-all duration-300 hover:bg-surface-container border-l-2 border-error/50">
<div className="flex flex-col md:flex-row md:items-center gap-6">
<div className="flex-1 space-y-4">
<div className="flex items-center justify-between">
<div>
<h4 className="text-lg font-bold text-white">Q3 Financial Invoices</h4>
<p className="text-xs text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-xs">calendar_today</span>
                                        Finished 2 hours ago • ID: BATCH-7110
                                    </p>
</div>
<div className="flex items-center gap-2">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-lg">FIN-SCAN V1</span>
<span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold uppercase rounded-lg">Completed (Failed)</span>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-medium">
<span className="text-on-surface">100% Finalized</span>
<span className="text-on-surface-variant">1,200 / 1,200 items</span>
</div>
<div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-error w-full rounded-full opacity-60"></div>
</div>
</div>
<div className="flex flex-wrap gap-4 pt-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-xs font-medium">1,096 Success</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-error text-sm">cancel</span>
<span className="text-xs font-medium">104 Errors</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-tertiary-container text-sm">stars</span>
<span className="text-xs font-medium">78% Confidence</span>
</div>
</div>
</div>
<div className="flex md:flex-col gap-2 min-w-[160px]">
<button className="flex-1 bg-error-container text-on-error-container px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-colors">
<span className="material-symbols-outlined text-sm">download</span>
                                Download Error Report
                            </button>
<div className="flex gap-2">
<button className="flex-1 bg-surface-container-highest px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-primary-container transition-colors">
                                    Re-process All
                                </button>
<button className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</div>
</div>
</div>

<div className="group bg-surface-container-low p-6 rounded-xl transition-all duration-300 hover:bg-surface-container border-l-2 border-tertiary-container/50">
<div className="flex flex-col md:flex-row md:items-center gap-6">
<div className="flex-1 space-y-4">
<div className="flex items-center justify-between">
<div>
<h4 className="text-lg font-bold text-white">Vendor Agreements - Alpha</h4>
<p className="text-xs text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-xs">calendar_today</span>
                                        Finished 5 hours ago • ID: BATCH-6922
                                    </p>
</div>
<div className="flex items-center gap-2">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-lg">LEGAL-NLP</span>
<span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase rounded-lg">Successful</span>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-medium">
<span className="text-on-surface">100% Completed</span>
<span className="text-on-surface-variant">450 / 450 items</span>
</div>
<div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-tertiary-container w-full rounded-full"></div>
</div>
</div>
<div className="flex flex-wrap gap-4 pt-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-xs font-medium">450 Success</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-tertiary-container text-sm">stars</span>
<span className="text-xs font-medium">99.8% Confidence</span>
</div>
</div>
</div>
<div className="flex md:flex-col gap-2 min-w-[160px]">
<button className="flex-1 bg-surface-container-highest text-on-surface px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-sm">visibility</span>
                                View Results
                            </button>
<div className="flex gap-2">
<button className="flex-1 bg-surface-container-highest px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-primary-container transition-colors">
                                    Export CSV
                                </button>
<button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
<div className="bg-surface-container-low p-6 rounded-xl space-y-6">
<h4 className="text-lg font-bold text-white font-headline">Top Error Types</h4>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 bg-error-container/20 rounded-xl flex items-center justify-center text-error">
<span className="material-symbols-outlined">blur_on</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Low Image Quality</span>
<span className="text-sm text-on-surface-variant">42%</span>
</div>
<div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-error w-[42%]"></div>
</div>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">description</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Unsupported Format</span>
<span className="text-sm text-on-surface-variant">28%</span>
</div>
<div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[28%]"></div>
</div>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary">
<span className="material-symbols-outlined">sync_problem</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Network Timeout</span>
<span className="text-sm text-on-surface-variant">15%</span>
</div>
<div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary w-[15%]"></div>
</div>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-outline-variant/30 group hover:border-primary/30 transition-all duration-500 cursor-pointer">
<div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-primary text-3xl">add_to_photos</span>
</div>
<h4 className="text-xl font-bold text-white font-headline">Start New Batch</h4>
<p className="text-on-surface-variant text-sm mt-2 max-w-xs mx-auto">Drag and drop folders or click here to initialize a new parallel processing session.</p>
<div className="mt-6 flex gap-2">
<span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-surface-container text-on-surface-variant rounded">PDF</span>
<span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-surface-container text-on-surface-variant rounded">JPG</span>
<span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-surface-container text-on-surface-variant rounded">PNG</span>
<span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-surface-container text-on-surface-variant rounded">TIFF</span>
</div>
</div>
</div>
</section>



    </div>
  );
}
