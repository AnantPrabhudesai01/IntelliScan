import React from 'react';

export default function GenBulkContactExportWizard1() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="px-8 pt-8 pb-4">
<div className="max-w-4xl mx-auto flex items-center justify-between relative">

<div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2 z-0"></div>
<div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-primary-container -translate-y-1/2 z-0"></div>

<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
<span className="material-symbols-outlined">check</span>
</div>
<span className="text-xs font-semibold text-primary uppercase tracking-wider">Select Contacts</span>
</div>

<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-4 ring-surface shadow-lg">
<span className="text-sm font-bold">2</span>
</div>
<span className="text-xs font-semibold text-on-surface uppercase tracking-wider">Map Fields</span>
</div>

<div className="relative z-10 flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center ring-4 ring-surface">
<span className="text-sm font-bold">3</span>
</div>
<span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider opacity-50">Format &amp; Download</span>
</div>
</div>
</section>

<section className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
<div className="max-w-5xl mx-auto space-y-8">

<div className="text-center space-y-2">
<h1 className="text-3xl font-extrabold tracking-tight text-white">Field Mapping Interface</h1>
<p className="text-on-surface-variant max-w-xl mx-auto">Select which metadata fields from your IntelliScan database should map to your target export schema.</p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-8 space-y-4">
<div className="flex items-center justify-between px-4 pb-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
<span>IntelliScan Source Field</span>
<span className="material-symbols-outlined text-lg opacity-40">double_arrow</span>
<span>Export Target Field</span>
</div>

<div className="space-y-3">

<div className="group bg-surface-container-low p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container transition-all duration-300">
<div className="flex-1 flex items-center gap-3">
<div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined text-lg">person</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Full Name</p>
<p className="text-[10px] text-on-surface-variant">String (Sanitized)</p>
</div>
</div>
<div className="flex-none">
<span className="material-symbols-outlined text-primary opacity-40">arrow_forward</span>
</div>
<div className="flex-1">
<div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between group-hover:bg-surface-variant transition-colors">
<span className="text-sm text-on-surface">full_name</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">unfold_more</span>
</div>
</div>
<div className="flex-none flex items-center gap-2">
<div className="bg-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold text-on-tertiary-container">98% Match</div>
</div>
</div>

<div className="group bg-surface-container-low p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container transition-all duration-300">
<div className="flex-1 flex items-center gap-3">
<div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined text-lg">mail</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Email Address</p>
<p className="text-[10px] text-on-surface-variant">Validated RFC 5322</p>
</div>
</div>
<div className="flex-none">
<span className="material-symbols-outlined text-primary opacity-40">arrow_forward</span>
</div>
<div className="flex-1">
<div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between group-hover:bg-surface-variant transition-colors">
<span className="text-sm text-on-surface">contact_email</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">unfold_more</span>
</div>
</div>
<div className="flex-none flex items-center gap-2">
<div className="bg-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold text-on-tertiary-container">100% Match</div>
</div>
</div>

<div className="group bg-surface-container-low p-4 rounded-xl flex items-center gap-6 border-l-2 border-primary-container bg-surface-container">
<div className="flex-1 flex items-center gap-3">
<div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined text-lg">apartment</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Company HQ</p>
<p className="text-[10px] text-on-surface-variant">Parsed OCR data</p>
</div>
</div>
<div className="flex-none">
<span className="material-symbols-outlined text-primary opacity-40">arrow_forward</span>
</div>
<div className="flex-1">
<div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between border border-primary-container/30">
<span className="text-sm text-on-surface">organization_name</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">unfold_more</span>
</div>
</div>
<div className="flex-none flex items-center gap-2">
<div className="bg-error-container px-2 py-0.5 rounded text-[10px] font-bold text-on-error-container">Uncertain</div>
</div>
</div>

<div className="group bg-surface-container-low p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container transition-all duration-300">
<div className="flex-1 flex items-center gap-3">
<div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined text-lg">history</span>
</div>
<div>
<p className="text-sm font-semibold text-white">Scan Logic ID</p>
<p className="text-[10px] text-on-surface-variant">OCR-V2 Engine Metadata</p>
</div>
</div>
<div className="flex-none">
<span className="material-symbols-outlined text-primary opacity-40">arrow_forward</span>
</div>
<div className="flex-1">
<div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between group-hover:bg-surface-variant transition-colors opacity-50">
<span className="text-sm text-on-surface italic">Ignore Field</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">block</span>
</div>
</div>
<div className="flex-none flex items-center gap-2">
<span className="text-[10px] font-mono text-outline-variant uppercase">Exclude</span>
</div>
</div>
</div>
<button className="w-full py-4 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:border-primary-container hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium">
<span className="material-symbols-outlined">add_circle</span>
                            Add Custom Mapping Rule
                        </button>
</div>

<div className="lg:col-span-4 space-y-6">

<div className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-4">
<h3 className="text-sm font-bold text-white uppercase tracking-wider">Export Format</h3>
<div className="grid grid-cols-2 gap-3">
<div className="p-4 rounded-xl bg-surface-container-high border-2 border-primary-container flex flex-col items-center gap-2 cursor-pointer">
<span className="material-symbols-outlined text-2xl text-primary">description</span>
<span className="text-xs font-bold text-white">CSV</span>
</div>
<div className="p-4 rounded-xl bg-surface-container-high border border-transparent hover:border-outline-variant flex flex-col items-center gap-2 cursor-pointer opacity-60">
<span className="material-symbols-outlined text-2xl">code</span>
<span className="text-xs font-bold text-white">JSON</span>
</div>
<div className="p-4 rounded-xl bg-surface-container-high border border-transparent hover:border-outline-variant flex flex-col items-center gap-2 cursor-pointer opacity-60">
<span className="material-symbols-outlined text-2xl">grid_on</span>
<span className="text-xs font-bold text-white">XLSX</span>
</div>
<div className="p-4 rounded-xl bg-surface-container-high border border-transparent hover:border-outline-variant flex flex-col items-center gap-2 cursor-pointer opacity-60">
<span className="material-symbols-outlined text-2xl">cloud_upload</span>
<span className="text-xs font-bold text-white">Salesforce</span>
</div>
</div>
</div>

<div className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden group">

<div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all"></div>
<h3 className="text-sm font-bold text-white uppercase tracking-wider">Summary</h3>
<div className="space-y-4">
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Contacts selected</span>
<span className="text-white font-mono">1,248</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Mapped fields</span>
<span className="text-white font-mono">12 / 15</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Est. File Size</span>
<span className="text-white font-mono">2.4 MB</span>
</div>
<div className="pt-4 border-t border-outline-variant/30">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-tertiary text-sm">shield</span>
<span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Security Scan Status</span>
</div>
<div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full w-full bg-tertiary rounded-full"></div>
</div>
<p className="text-[10px] text-on-surface-variant mt-2 italic">Data is encrypted via AES-256 before transfer.</p>
</div>
</div>
</div>
</div>
</div>

<div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
<button className="px-6 py-3 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 font-medium">
<span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Selection
                    </button>
<div className="flex items-center gap-4">
<button className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all font-medium">
                            Save Schema as Preset
                        </button>
<button className="px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                            Initialize Export
                            <span className="material-symbols-outlined">rocket_launch</span>
</button>
</div>
</div>
</div>
</section>

    </div>
  );
}
