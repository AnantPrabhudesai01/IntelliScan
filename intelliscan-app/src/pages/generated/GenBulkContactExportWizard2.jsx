import React from 'react';

export default function GenBulkContactExportWizard2() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<div className="px-12 pb-24">

<div className="mb-12 flex items-center justify-between max-w-4xl mx-auto relative">
<div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant/20 -translate-y-1/2 z-0"></div>

<div className="relative z-10 flex flex-col items-center gap-2 group">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-4 ring-surface shadow-lg">
<span className="material-symbols-outlined text-sm" data-weight="fill">check</span>
</div>
<span className="text-[10px] uppercase tracking-widest font-bold text-primary">Format</span>
</div>

<div className="relative z-10 flex flex-col items-center gap-2 group">
<div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary text-primary flex items-center justify-center ring-4 ring-surface shadow-xl">
<span className="text-sm font-bold">02</span>
</div>
<span className="text-[10px] uppercase tracking-widest font-bold text-on-surface">Mapping</span>
</div>

<div className="relative z-10 flex flex-col items-center gap-2 group">
<div className="w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant flex items-center justify-center ring-4 ring-surface">
<span className="text-sm font-bold">03</span>
</div>
<span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Filter</span>
</div>

<div className="relative z-10 flex flex-col items-center gap-2 group">
<div className="w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant flex items-center justify-center ring-4 ring-surface">
<span className="text-sm font-bold">04</span>
</div>
<span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Finalize</span>
</div>
</div>

<div className="grid grid-cols-12 gap-8 max-w-6xl mx-auto">

<div className="col-span-12 lg:col-span-7 space-y-6">
<section className="bg-surface-container-low rounded-xl p-8 shadow-sm">
<div className="flex justify-between items-center mb-8">
<h3 className="text-xl font-bold font-headline">Intelligence Mapping</h3>
<div className="flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-secondary rounded-full">
<span className="material-symbols-outlined text-xs">auto_fix</span>
<span className="text-[10px] font-bold uppercase tracking-tighter">Auto-Link Active</span>
</div>
</div>

<div className="space-y-4">

<div className="flex items-center gap-6 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group">
<div className="flex-1">
<span className="text-[10px] text-on-surface-variant font-mono uppercase">Source: OCR-V2</span>
<div className="text-on-surface font-semibold">Legal Name</div>
</div>
<div className="text-primary-container">
<span className="material-symbols-outlined">trending_flat</span>
</div>
<div className="flex-1">
<select className="w-full bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary py-2 px-3">
<option>CRM: First_Name + Last_Name</option>
<option>CRM: Full_Name</option>
<option>CRM: Account_Name</option>
</select>
</div>
</div>

<div className="flex items-center gap-6 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group">
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="text-[10px] text-on-surface-variant font-mono uppercase">Source: CV-ENGINE</span>
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
</div>
<div className="text-on-surface font-semibold">Work Email</div>
</div>
<div className="text-primary-container">
<span className="material-symbols-outlined">trending_flat</span>
</div>
<div className="flex-1">
<select className="w-full bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary py-2 px-3">
<option>CRM: Email</option>
<option>CRM: Secondary_Email</option>
</select>
</div>
</div>

<div className="flex items-center gap-6 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group">
<div className="flex-1">
<span className="text-[10px] text-on-surface-variant font-mono uppercase">Source: NLP-META</span>
<div className="text-on-surface font-semibold">Confidence Score</div>
</div>
<div className="text-primary-container">
<span className="material-symbols-outlined">trending_flat</span>
</div>
<div className="flex-1">
<select className="w-full bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary py-2 px-3">
<option>CRM: Quality_Score__c</option>
<option>Ignore field</option>
</select>
</div>
</div>
</div>
<button className="mt-8 w-full py-4 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant text-sm font-medium hover:border-primary/50 hover:text-primary transition-all">
              + Add Custom Field Mapping
            </button>
</section>

<section className="bg-surface-container rounded-xl p-8 overflow-hidden relative">
<div className="absolute top-0 right-0 p-8 opacity-10">
<span className="material-symbols-outlined text-[120px]" data-icon="insights">insights</span>
</div>
<h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Export Preview</h4>
<div className="space-y-3">
<div className="grid grid-cols-3 gap-4 text-[10px] text-on-surface-variant font-mono border-b border-outline-variant/10 pb-2">
<div>NAME</div>
<div>CONFIDENCE</div>
<div>ENGINE</div>
</div>

<div className="grid grid-cols-3 gap-4 text-xs py-1">
<div className="text-on-surface truncate">Sarah Jenkins</div>
<div><span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full text-[9px]">98.2%</span></div>
<div className="text-on-surface-variant">OCR-V2</div>
</div>
<div className="grid grid-cols-3 gap-4 text-xs py-1">
<div className="text-on-surface truncate">Marcus Aurelius</div>
<div><span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full text-[9px]">94.1%</span></div>
<div className="text-on-surface-variant">OCR-V2</div>
</div>
<div className="grid grid-cols-3 gap-4 text-xs py-1 opacity-40">
<div className="text-on-surface truncate">Li Wei</div>
<div><span className="px-2 py-0.5 bg-error-container text-on-error-container rounded-full text-[9px]">58.3%</span></div>
<div className="text-on-surface-variant">OCR-V2</div>
</div>
</div>
</section>
</div>

<div className="col-span-12 lg:col-span-5 space-y-6">

<div className="bg-primary-container rounded-xl p-6 text-white shadow-xl shadow-primary-container/20">
<div className="flex justify-between items-start mb-6">
<div>
<span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Selected Target</span>
<h4 className="text-2xl font-bold font-headline mt-1">Salesforce CRM</h4>
</div>
<div className="bg-white/20 p-2 rounded-lg">
<span className="material-symbols-outlined">sync</span>
</div>
</div>
<div className="space-y-4 text-sm font-medium">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-sm">cloud_upload</span>
<span>Direct API Integration</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-sm">schedule</span>
<span>Scheduled for: Immediate</span>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-8 space-y-6 border border-outline-variant/10">
<h4 className="text-sm font-bold uppercase tracking-widest text-on-surface">Data Hygiene Filters</h4>
<div className="space-y-4">
<div>
<label className="text-[11px] text-on-surface-variant font-bold uppercase mb-2 block">Min. Confidence Score</label>
<input className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" type="range" value="85"/>
<div className="flex justify-between mt-2 text-[10px] font-mono text-primary">
<span>Exclude below 85%</span>
<span>Strict Mode</span>
</div>
</div>
<div className="pt-4 border-t border-outline-variant/10">
<label className="flex items-center gap-3 cursor-pointer group">
<div className="relative">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container rounded-full peer peer-checked:bg-primary transition-all"></div>
<div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
</div>
<span className="text-sm text-on-surface group-hover:text-primary transition-colors">Deduplicate on Import</span>
</label>
</div>
<div>
<label className="flex items-center gap-3 cursor-pointer group">
<div className="relative">
<input className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container rounded-full peer peer-checked:bg-primary transition-all"></div>
<div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
</div>
<span className="text-sm text-on-surface group-hover:text-primary transition-colors">Overwrite Existing Records</span>
</label>
</div>
</div>
</div>

<div className="flex items-center gap-4 pt-4">
<button className="flex-1 py-4 px-6 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-bright transition-all active:scale-95 duration-200">
              Back
            </button>
<button className="flex-[2] py-4 px-6 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm shadow-lg shadow-primary-container/30 hover:brightness-110 transition-all active:scale-95 duration-200 flex items-center justify-center gap-2">
              Next Step: Filter
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>



    </div>
  );
}
