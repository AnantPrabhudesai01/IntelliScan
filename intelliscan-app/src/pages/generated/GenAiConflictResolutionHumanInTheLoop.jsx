import React from 'react';

export default function GenAiConflictResolutionHumanInTheLoop() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-8 max-w-7xl mx-auto w-full space-y-8">

<div className="flex flex-col md:flex-row justify-between items-end gap-6">
<div>
<div className="flex items-center gap-2 mb-2">
<span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Action Required</span>
<span className="text-on-surface-variant text-sm font-medium">Resolution Queue / Case #8829-X</span>
</div>
<h1 className="text-4xl font-extrabold font-headline tracking-tight text-white">Manual Conflict Resolution</h1>
<p className="text-on-surface-variant mt-2 max-w-xl">IntelliScan detected contradictory data between Gemini Pro and Tesseract OCR engines. Please verify the contact metadata for the scanned entity below.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-white hover:bg-surface-variant transition-colors border border-outline-variant/10">
<span className="material-symbols-outlined text-[20px]" data-icon="refresh">refresh</span>
<span>Re-scan</span>
</button>
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error-container/20 text-error hover:bg-error-container/30 transition-colors border border-error/20">
<span className="material-symbols-outlined text-[20px]" data-icon="flag">flag</span>
<span>Flag for Review</span>
</button>
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
<span className="material-symbols-outlined text-[20px]" data-icon="check_circle">check_circle</span>
<span>Approve Merged</span>
</button>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

<div className="lg:col-span-4 space-y-4">
<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/5 h-full flex flex-col">
<div className="flex items-center justify-between mb-4">
<h3 className="font-headline font-bold text-lg text-white">Source Image</h3>
<div className="flex gap-2">
<button className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="zoom_in">zoom_in</span></button>
<button className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="download">download</span></button>
</div>
</div>
<div className="flex-1 bg-surface-container-highest rounded-lg overflow-hidden relative group">
<img className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" data-alt="high quality scan of a business card with minimalist black and white typography on heavy textured paper background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_29RwzcoW_pbI2CQPdBvtiKV9yzFMXzQUPWe67doPpyG7p7dR0-TyIWa0SevXQAetxsL_ff71pPQ-upqc7CapAFMBKkqbvnjGbZVbAYaYPa-Uo48YRjgwD6Dgvk9jPSJ841yg9LKwfdrNUEgen-kk4IknaMChEOoC_6fixA5lKsQIU8gQvu0eaC8VPhbA2eu8m5LGa_mnesX4OVWzlyuEHY_ENNLhL41vOVL3hFr0s_PEWh05tQslRSNFRg-grOMywQ4UBMdnzP9U"/>
<div className="absolute inset-0 border-2 border-primary/20 pointer-events-none"></div>

<div className="absolute top-1/4 left-1/4 w-32 h-8 border border-primary bg-primary/10 rounded-sm"></div>
<div className="absolute top-1/2 left-1/3 w-40 h-6 border border-tertiary bg-tertiary/10 rounded-sm"></div>
</div>
<div className="mt-4 p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-sm" data-icon="info">info</span>
<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Metadata</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Uploaded: 2 minutes ago • ID: SCAN-992-ALPHA • Source: Mobile App (v4.2.0)</p>
</div>
</div>
</div>

<div className="lg:col-span-8 space-y-6">

<div className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden">
<div className="grid grid-cols-12 bg-surface-container p-4 border-b border-outline-variant/10">
<div className="col-span-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Field Name</div>
<div className="col-span-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary"></span> Gemini Pro 
                                </div>
<div className="col-span-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span> Tesseract V4
                                </div>
<div className="col-span-1"></div>
</div>
<div className="divide-y divide-outline-variant/10">

<div className="grid grid-cols-12 p-4 items-center bg-error-container/5">
<div className="col-span-3">
<span className="text-sm font-semibold text-white">Full Name</span>
</div>
<div className="col-span-4 relative group pr-4">
<div className="p-3 rounded-xl bg-surface-container border-2 border-primary hover:border-primary-container transition-all cursor-pointer">
<div className="text-sm font-medium text-white">Alexander MacEwan</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-1.5 py-0.5 rounded font-bold">98% CONF</span>
</div>
</div>
<div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined" data-icon="radio_button_checked">radio_button_checked</span>
</div>
</div>
<div className="col-span-4 pr-4">
<div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-outline transition-all cursor-pointer">
<div className="text-sm font-medium text-on-surface-variant">Alex Macewen</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-error-container text-on-error-container text-[10px] px-1.5 py-0.5 rounded font-bold">54% CONF</span>
</div>
</div>
</div>
<div className="col-span-1 flex justify-end">
<button className="p-2 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined" data-icon="edit">edit</span></button>
</div>
</div>

<div className="grid grid-cols-12 p-4 items-center bg-error-container/5">
<div className="col-span-3">
<span className="text-sm font-semibold text-white">Phone Number</span>
</div>
<div className="col-span-4 pr-4">
<div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-outline transition-all cursor-pointer">
<div className="text-sm font-medium text-on-surface-variant">+1 (555) 902-1200</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-1.5 py-0.5 rounded font-bold">92% CONF</span>
</div>
</div>
</div>
<div className="col-span-4 pr-4 relative group">
<div className="p-3 rounded-xl bg-surface-container border-2 border-primary hover:border-primary-container transition-all cursor-pointer">
<div className="text-sm font-medium text-white">1-555-902-1200</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-1.5 py-0.5 rounded font-bold">96% CONF</span>
</div>
</div>
<div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary opacity-100">
<span className="material-symbols-outlined" data-icon="radio_button_checked">radio_button_checked</span>
</div>
</div>
<div className="col-span-1 flex justify-end">
<button className="p-2 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined" data-icon="edit">edit</span></button>
</div>
</div>

<div className="grid grid-cols-12 p-4 items-center">
<div className="col-span-3">
<span className="text-sm font-semibold text-on-surface-variant">Email Address</span>
</div>
<div className="col-span-8">
<div className="flex items-center gap-4 p-3 rounded-xl bg-surface-container/40 border border-outline-variant/5">
<span className="text-sm font-medium text-on-surface-variant/60 italic">a.macewan@technexus.io</span>
<div className="flex items-center gap-2">
<span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase">Consensus Reached</span>
<span className="material-symbols-outlined text-green-400 text-sm" data-icon="verified" style={{}}>verified</span>
</div>
</div>
</div>
<div className="col-span-1 flex justify-end">
<button className="p-2 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined" data-icon="lock">lock</span></button>
</div>
</div>

<div className="grid grid-cols-12 p-4 items-center bg-error-container/5">
<div className="col-span-3">
<span className="text-sm font-semibold text-white">Job Title</span>
</div>
<div className="col-span-4 pr-4">
<div className="p-3 rounded-xl bg-surface-container border-2 border-primary hover:border-primary-container transition-all cursor-pointer">
<div className="text-sm font-medium text-white">SVP, Engineering</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-1.5 py-0.5 rounded font-bold">99% CONF</span>
</div>
</div>
</div>
<div className="col-span-4 pr-4">
<div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-outline transition-all cursor-pointer">
<div className="text-sm font-medium text-on-surface-variant">SIP Eng.</div>
<div className="mt-2 flex items-center gap-2">
<span className="bg-error-container text-on-error-container text-[10px] px-1.5 py-0.5 rounded font-bold">41% CONF</span>
</div>
</div>
</div>
<div className="col-span-1 flex justify-end">
<button className="p-2 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined" data-icon="edit">edit</span></button>
</div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
<h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="edit_note">edit_note</span>
                                Final Merged Result (Edit Manually)
                            </h4>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-1.5">
<label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
<input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white transition-all" type="text" value="Alexander MacEwan"/>
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Job Title</label>
<input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white transition-all" type="text" value="SVP, Engineering"/>
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Email</label>
<input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white transition-all" type="text" value="a.macewan@technexus.io"/>
</div>
<div className="space-y-1.5">
<label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Phone</label>
<input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white transition-all" type="text" value="1-555-902-1200"/>
</div>
</div>
</div>

<div className="flex flex-wrap gap-4">
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/20 border border-secondary/10">
<span className="text-[10px] font-mono text-secondary">ENGINE: GEMINI-PRO-V1.5</span>
<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
</div>
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/20 border border-secondary/10">
<span className="text-[10px] font-mono text-secondary">ENGINE: TESSERACT-OCR-4</span>
<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
</div>
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/20 border border-secondary/10">
<span className="text-[10px] font-mono text-secondary">PARSER: NLP-CONTACT-EXTRACTOR</span>
<span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}