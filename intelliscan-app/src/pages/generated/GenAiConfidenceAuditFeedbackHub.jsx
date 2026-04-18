import React from 'react';

export default function GenAiConfidenceAuditFeedbackHub() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="p-8 max-w-[1600px] mx-auto">

<div className="flex flex-col mb-8 gap-2">
<div className="flex items-center gap-3">
<h2 className="text-3xl font-headline font-bold text-white tracking-tight">AI Confidence Audit</h2>
<span className="bg-secondary-container/30 text-secondary-fixed px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border border-secondary-container/20">Task ID: #OCR-88219</span>
</div>
<p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">Reviewing high-priority extraction for <span className="text-primary font-semibold">Global Logistics Corp.</span> Field confidence flags triggered for manual verification.</p>
</div>

<div className="grid grid-cols-12 gap-6 items-start">

<div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
<div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 shadow-sm">
<div className="flex items-center justify-between mb-4">
<span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
<span className="material-symbols-outlined text-sm">image</span>
                                Source Document
                            </span>
<div className="flex gap-2">
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-lg">zoom_in</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-lg">refresh</span>
</button>
</div>
</div>
<div className="relative group rounded-lg overflow-hidden border border-outline-variant/5">
<img className="w-full aspect-[3/2] object-cover rounded-lg group-hover:scale-105 transition-transform duration-700" data-alt="a high-resolution close-up of a professional business card with clean typography held against a dark grey background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAspJbItpPLRupIj8G64aV-DAvQQCxnWvkoiI6jxwn9AHZ1UZSgoH0kmspzUEaoYRdc4WxqdJa8xd6fMlLclnGfvy_kTE419P__QC6p8joF1dj_UIkryvtVqTH5wUow4qtSe-uJUPf8prEVMYoFaVyyj32T4EF5EGNC4v5Wc489dMwKwXOHgiXrAhF9nU3lKBEgkUDaWnS3hAYA7NlsBObS6aPSU54UJgOgREblYDFmfCScCF6Bv2xmY45N9MwqiuoyaiHMGVsOc79v"/>

<div className="absolute top-[20%] left-[10%] w-[40%] h-[10%] border-2 border-primary/50 bg-primary/10 rounded-sm"></div>
<div className="absolute top-[45%] left-[10%] w-[35%] h-[8%] border-2 border-tertiary-container/50 bg-tertiary-container/10 rounded-sm animate-pulse"></div>
<div className="absolute top-[58%] left-[10%] w-[55%] h-[8%] border-2 border-error/50 bg-error/10 rounded-sm"></div>
</div>
</div>
<div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 flex flex-col gap-3">
<h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Metadata</h4>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-[10px] text-on-surface-variant/60 uppercase">Extracted By</p>
<p className="text-sm font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                                    Gemini-1.5-Pro
                                </p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant/60 uppercase">Latency</p>
<p className="text-sm font-semibold text-on-surface">1.42s</p>
</div>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
<div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
<div className="p-6 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-low">
<h3 className="text-lg font-headline font-bold text-white">Extracted Entities</h3>
<div className="flex items-center gap-3">
<span className="flex items-center gap-1.5 px-3 py-1 bg-tertiary-container/10 text-tertiary-fixed-dim text-xs font-medium rounded-full border border-tertiary-container/20">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                                    Manual Audit Required
                                </span>
</div>
</div>

<div className="p-6 flex flex-col gap-6">

<div className="grid grid-cols-12 gap-4 items-center group">
<label className="col-span-3 text-sm font-medium text-on-surface-variant">Full Name</label>
<div className="col-span-7 relative">
<input className="w-full bg-surface-container border-none rounded-xl text-sm py-3 px-4 focus:ring-1 focus:ring-primary/40 transition-all text-white font-medium" type="text" value="Alexander Thorne"/>
</div>
<div className="col-span-2 flex justify-end">
<div className="flex flex-col items-end">
<span className="text-[10px] font-mono text-tertiary-fixed-dim bg-tertiary-container/20 px-2 py-0.5 rounded-md border border-tertiary-container/10">98.2%</span>
<span className="text-[8px] uppercase tracking-tighter text-on-surface-variant/40 mt-1">Confidence</span>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group">
<label className="col-span-3 text-sm font-medium text-on-surface-variant">Job Title</label>
<div className="col-span-7 relative">
<input className="w-full bg-surface-container border-2 border-tertiary-container/30 rounded-xl text-sm py-3 px-4 focus:ring-1 focus:ring-tertiary-container transition-all text-white font-medium" type="text" value="Seni0r Logistics Analys1"/>
<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
<span className="material-symbols-outlined text-tertiary-container text-lg">warning</span>
</div>
</div>
<div className="col-span-2 flex justify-end">
<div className="flex flex-col items-end">
<span className="text-[10px] font-mono text-tertiary-fixed-dim bg-tertiary-container/40 px-2 py-0.5 rounded-md border border-tertiary-container/20">84.5%</span>
<span className="text-[8px] uppercase tracking-tighter text-on-surface-variant/40 mt-1">Confidence</span>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group">
<label className="col-span-3 text-sm font-medium text-on-surface-variant">Email Address</label>
<div className="col-span-7 relative">
<input className="w-full bg-surface-container border-2 border-error-container/40 rounded-xl text-sm py-3 px-4 focus:ring-1 focus:ring-error transition-all text-white font-medium" type="text" value="a.thorne@gloco"/>
<div className="absolute right-3 top-1/2 -translate-y-1/2">
<span className="material-symbols-outlined text-error text-lg" style={{}}>error</span>
</div>
</div>
<div className="col-span-2 flex justify-end">
<div className="flex flex-col items-end">
<span className="text-[10px] font-mono text-error bg-error-container/20 px-2 py-0.5 rounded-md border border-error-container/20">52.1%</span>
<span className="text-[8px] uppercase tracking-tighter text-on-surface-variant/40 mt-1">Confidence</span>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group">
<label className="col-span-3 text-sm font-medium text-on-surface-variant">Company</label>
<div className="col-span-7 relative">
<input className="w-full bg-surface-container border-none rounded-xl text-sm py-3 px-4 focus:ring-1 focus:ring-primary/40 transition-all text-white font-medium" type="text" value="Global Logistics Corp."/>
</div>
<div className="col-span-2 flex justify-end">
<div className="flex flex-col items-end">
<span className="text-[10px] font-mono text-tertiary-fixed-dim bg-tertiary-container/20 px-2 py-0.5 rounded-md border border-tertiary-container/10">99.8%</span>
<span className="text-[8px] uppercase tracking-tighter text-on-surface-variant/40 mt-1">Confidence</span>
</div>
</div>
</div>

<div className="mt-4 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
<div className="flex gap-2">
<span className="bg-surface-container-high text-[10px] font-mono text-on-surface-variant/80 px-2 py-1 rounded border border-outline-variant/10">ENGINE: GEMINI_V1.5</span>
<span className="bg-surface-container-high text-[10px] font-mono text-on-surface-variant/80 px-2 py-1 rounded border border-outline-variant/10">POST-PROCESS: TESSERACT_OCR</span>
</div>
<div className="flex items-center gap-2">
<button className="text-xs font-semibold text-primary-container hover:underline">Re-scan with Tesseract</button>
</div>
</div>
</div>

<div className="p-6 bg-surface-container border-t border-outline-variant/10 flex items-center justify-between">
<button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-highest text-on-surface font-semibold text-sm hover:bg-surface-variant transition-all active:scale-95">
<span className="material-symbols-outlined text-lg">flag</span>
                                Flag for Review
                            </button>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-3 rounded-xl text-on-surface-variant font-semibold text-sm hover:text-white transition-all">
                                    Discard
                                </button>
<button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-container text-white font-bold text-sm shadow-xl shadow-primary-container/30 hover:brightness-110 active:scale-95 transition-all">
<span className="material-symbols-outlined text-lg" style={{}}>check_circle</span>
                                    Approve Extraction
                                </button>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
<h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Field Validation History</h5>
<div className="space-y-3">
<div className="flex items-center justify-between">
<span className="text-xs text-on-surface-variant">Phone Number</span>
<span className="text-[10px] text-primary font-bold">VERIFIED</span>
</div>
<div className="flex items-center justify-between">
<span className="text-xs text-on-surface-variant">Logo Detection</span>
<span className="text-[10px] text-tertiary-fixed-dim font-bold">MATCH FOUND</span>
</div>
</div>
</div>
<div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
<h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">CRM Integration</h5>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-[#00A1E0]/10 flex items-center justify-center">
<span className="material-symbols-outlined text-[#00A1E0] text-lg">cloud_sync</span>
</div>
<div>
<p className="text-xs font-bold text-white leading-tight">Salesforce Sync</p>
<p className="text-[10px] text-on-surface-variant">Queue: Ready to Push</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

    </div>
  );
}
