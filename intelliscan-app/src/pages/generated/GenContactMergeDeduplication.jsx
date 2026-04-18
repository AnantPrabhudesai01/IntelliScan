import React from 'react';

export default function GenContactMergeDeduplication() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      
<div className="max-w-7xl mx-auto p-8">

<div className="flex items-end justify-between mb-10">
<div>
<h2 className="text-3xl font-headline font-extrabold tracking-tight text-white mb-2">Deduplication Workspace</h2>
<p className="text-on-surface-variant max-w-xl">Review and resolve 14 pending contact conflicts identified by OCR-V2. Higher similarity scores indicate probable duplicates.</p>
</div>
<div className="flex gap-3">
<button className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-bright transition-colors">
                        Bulk Dismiss (3)
                    </button>
<button className="px-6 py-2.5 rounded-xl bg-primary-container text-white font-bold shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Merge Selected
                    </button>
</div>
</div>

<div className="grid grid-cols-12 gap-8 items-start">

<div className="col-span-4 flex flex-col gap-4">
<div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
<span className="text-sm font-bold text-white uppercase tracking-widest opacity-50">Pending Pairs</span>
<span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold">14 NEW</span>
</div>

<div className="bg-surface-container rounded-xl p-5 border-l-4 border-primary ring-1 ring-white/5 shadow-xl">
<div className="flex justify-between items-start mb-3">
<div className="flex flex-col">
<span className="text-white font-bold">Jonathan Aris</span>
<span className="text-xs text-on-surface-variant">Aris &amp; Co Partners</span>
</div>
<span className="bg-tertiary-container text-on-tertiary-container text-xs font-black px-2 py-1 rounded-lg">94% Match</span>
</div>
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-surface-container overflow-hidden">
<img className="w-full h-full object-cover" data-alt="professional portrait of a businessman with a clean background for identity verification" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAksdqdFtNloW8-t52IHK3KFGowkXPPJqrj-dqVwyj3l9wV2_iSfqlL4HoSc30-0UoEiJZz2meFLKPTT7aSpvsP-Uecr8p9TnQnX0Wgig0qiNaqEi5YilAGyAaDjJMX6I4K7dcw8_rwf391DyB_S8gs179YEFmiimTZOrWesErZOJvBnMCJdGJ87UwDgNapJ-P9TRZPumaiDbFhR67qcROp2zJKvXtU4gxMjOdioJTvb8FSkievLTleOESjGrqRBsBA4hBb45HRtSVa"/>
</div>
<div className="w-6 h-6 rounded-full border-2 border-surface-container overflow-hidden">
<img className="w-full h-full object-cover" data-alt="sharp professional profile photo of a male executive in corporate attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBHfnVy35QErb9Ciwdn7rIrDxDLPLY1Fcve5MfqJ58DCRcnxZm1UYQzQ-oD6CMC0nFr5LIrnhmnFwc2PwoEpqub27ScrGhIgjwHJm79r26-VF-KbLgz3GH5ow7gqGG_QdHJmbS83-dUyqH2FV0x4TGRFQR8vNnwimd8Prqmvd7x2hKpIRhxCNWDjx2ue-9ql224Au6Q82Str5KEgVSZ_FrSDqczjfN6EQi7lg792yIJy1OpqZLoh_BS73RMl4WFywt8NgcYGt3NFI5"/>
</div>
</div>
</div>

<div className="bg-surface-container-low hover:bg-surface-container rounded-xl p-5 border-l-4 border-transparent transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-col">
<span className="text-white/80 group-hover:text-white font-bold transition-colors">Sarah Henderson</span>
<span className="text-xs text-on-surface-variant">Global Logistics</span>
</div>
<span className="bg-surface-variant text-on-surface-variant text-xs font-bold px-2 py-1 rounded-lg">82% Match</span>
</div>
</div>
<div className="bg-surface-container-low hover:bg-surface-container rounded-xl p-5 border-l-4 border-transparent transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-col">
<span className="text-white/80 group-hover:text-white font-bold transition-colors">Marcus T. Thorne</span>
<span className="text-xs text-on-surface-variant">Redwood Ventures</span>
</div>
<span className="bg-surface-variant text-on-surface-variant text-xs font-bold px-2 py-1 rounded-lg">76% Match</span>
</div>
</div>
</div>

<div className="col-span-8 space-y-6">

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl">

<div className="grid grid-cols-2 bg-surface-container-high/50">
<div className="p-6 border-r border-white/5">
<div className="flex items-center gap-4 mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="database">database</span>
</div>
<div>
<p className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant mb-1">Source: Main CRM</p>
<h3 className="text-lg font-headline font-bold text-white leading-tight">Jonathan Aris</h3>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-[10px] font-mono bg-secondary-container/30 text-secondary-fixed-dim px-2 py-0.5 rounded border border-secondary-container">ID: 4492-X</span>
<span className="text-[10px] font-mono bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded">Scanned: 24 Oct</span>
</div>
</div>
<div className="p-6 bg-primary-container/5">
<div className="flex items-center gap-4 mb-4">
<div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-white" data-icon="document_scanner">document_scanner</span>
</div>
<div>
<p className="text-[10px] font-black uppercase tracking-tighter text-primary mb-1">Source: New Scan</p>
<h3 className="text-lg font-headline font-bold text-white leading-tight">Jon Aris</h3>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-[10px] font-mono bg-primary-container/40 text-on-primary-container px-2 py-0.5 rounded border border-primary/20">OCR-V2 Engine</span>
<span className="text-[10px] font-mono bg-tertiary-container text-white px-2 py-0.5 rounded font-bold">New Data</span>
</div>
</div>
</div>

<div className="p-8 space-y-4">

<div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
<div className="col-span-3">Attribute</div>
<div className="col-span-4 text-center">Value A</div>
<div className="col-span-1"></div>
<div className="col-span-4 text-center">Value B</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group py-2">
<div className="col-span-3 text-xs font-bold text-on-surface-variant">Full Name</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input checked="" className="hidden peer" name="merge_name" type="radio"/>
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface">
                                            Jonathan Aris
                                        </div>
</label>
</div>
<div className="col-span-1 flex justify-center">
<span className="material-symbols-outlined text-outline-variant text-sm" data-icon="compare_arrows">compare_arrows</span>
</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input className="hidden peer" name="merge_name" type="radio"/>
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface">
                                            Jon Aris
                                        </div>
</label>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group py-2">
<div className="col-span-3 text-xs font-bold text-on-surface-variant flex items-center gap-2">
                                    Job Title
                                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input className="hidden peer" name="merge_title" type="radio"/>
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface line-through opacity-50">
                                            Senior Analyst
                                        </div>
</label>
</div>
<div className="col-span-1 flex justify-center">
<span className="material-symbols-outlined text-error text-sm" data-icon="warning" data-weight="fill">warning</span>
</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input checked="" className="hidden peer" name="merge_title" type="radio"/>
<div className="p-3 rounded-xl border border-primary/40 bg-primary-container/10 peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface relative">
                                            Managing Partner
                                            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-tertiary text-on-tertiary text-[9px] px-1.5 rounded-full font-bold">98% CONFIDENCE</span>
</div>
</label>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group py-2">
<div className="col-span-3 text-xs font-bold text-on-surface-variant">Company</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input checked="" className="hidden peer" name="merge_company" type="radio"/>
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface">
                                            Aris &amp; Co Partners
                                        </div>
</label>
</div>
<div className="col-span-1 flex justify-center">
<span className="material-symbols-outlined text-outline-variant text-sm" data-icon="equal" data-weight="fill">equal</span>
</div>
<div className="col-span-4">
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low opacity-40 text-sm text-on-surface italic">
                                        Aris &amp; Co Partners
                                    </div>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center group py-2">
<div className="col-span-3 text-xs font-bold text-on-surface-variant">Email Address</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input checked="" className="hidden peer" name="merge_email" type="radio"/>
<div className="p-3 rounded-xl border border-white/5 bg-surface-container-low peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface truncate">
                                            j.aris@aris-partners.com
                                        </div>
</label>
</div>
<div className="col-span-1 flex justify-center">
<span className="material-symbols-outlined text-outline-variant text-sm" data-icon="add_circle">add_circle</span>
</div>
<div className="col-span-4">
<label className="block cursor-pointer">
<input checked="" className="hidden peer" name="merge_email_secondary" type="checkbox"/>
<div className="p-3 rounded-xl border border-primary/40 bg-primary-container/10 peer-checked:bg-primary-container/20 peer-checked:border-primary/40 transition-all text-sm text-on-surface relative">
                                            jon.aris@personal.io
                                            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-secondary text-on-secondary text-[9px] px-1.5 rounded-full font-bold">ADD AS ALT</span>
</div>
</label>
</div>
</div>
</div>

<div className="p-6 bg-surface-container-low border-t border-white/5 flex justify-between items-center">
<div className="flex items-center gap-2 text-xs text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="info">info</span>
                                Auto-merging 3 matching fields based on organizational policy.
                            </div>
<div className="flex gap-3">
<button className="px-6 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:text-white transition-colors">
                                    Dismiss as Non-Duplicate
                                </button>
<button className="px-8 py-2 rounded-lg text-sm font-bold bg-white text-background hover:bg-on-primary-container transition-colors">
                                    Confirm Merge
                                </button>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-6">
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
<h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Detection Logic</h4>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold text-white">94%</div>
<div>
<p className="text-sm font-bold text-white">Probabilistic Identity Link</p>
<p className="text-[11px] text-on-surface-variant">Matched via: Domain similarity (80%), Name phonetic (95%), Geo-location proximity.</p>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 relative overflow-hidden">
<div className="absolute inset-0 opacity-10 pointer-events-none">
<img className="w-full h-full object-cover" data-alt="abstract tech pattern with glowing blue nodes and network connections on a dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4EObKXk283M8tBVk_5T6Am2vd5OHiJgc4DvFo7qYrOAolv_LJE1V8mtkpDVQlsDIL-1XVnBWFYgZeyWBapzZu8Se_yosRVGEbSsXp-nV2neBnsLiJi130N6SistF7A820fsL8Qk6xoqK-wp5TvsoOKADa46R81iCsh-bsEMymZIVAqGy0VqwNSeiCRmImpE5vcdQ3rKChhB9tKOhG8EArkqJ215xqfvVaFcAsokmQnmUmjZmIPY3_-iuXK3FNJO6E1oNbS6ZUjhZv"/>
</div>
<div className="relative z-10">
<h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Original Artifact</h4>
<div className="flex items-center gap-3 bg-surface-container p-2 rounded-lg border border-white/5">
<span className="material-symbols-outlined text-primary" data-icon="image">image</span>
<div className="flex flex-col">
<span className="text-[10px] text-white font-bold">business_card_22.png</span>
<span className="text-[9px] text-on-surface-variant">Processed by OCR-V2.1</span>
</div>
<button className="ml-auto text-primary hover:text-white transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="open_in_new">open_in_new</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}
