import React from 'react';

export default function GenInteractiveFeatureToursHelpOverlays() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-6">
<div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
<p className="text-sm font-label text-on-surface-variant mb-2">Total Scanned</p>
<h3 className="text-4xl font-headline font-bold text-primary">1.2M</h3>
<div className="mt-4 flex items-center gap-1 text-xs text-tertiary">
<span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
<span>12% from last week</span>
</div>
</div>
<div className="col-span-1 bg-surface-container-low p-6 rounded-xl">
<p className="text-sm font-label text-on-surface-variant mb-2">Avg. Confidence</p>
<h3 className="text-4xl font-headline font-bold text-on-surface">98.4%</h3>
<div className="mt-4 flex items-center gap-1 text-xs text-on-surface-variant">
<span className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded-full">Optimized</span>
</div>
</div>
<div className="col-span-1 bg-surface-container-low p-6 rounded-xl border border-primary/20">
<p className="text-sm font-label text-on-surface-variant mb-2">Active Conflicts</p>
<h3 className="text-4xl font-headline font-bold text-error">42</h3>
<div className="mt-4 flex items-center gap-1 text-xs text-error">
<span className="material-symbols-outlined text-sm" data-icon="warning">warning</span>
<span>Requires Manual Resolution</span>
</div>
</div>
</div>

<div className="col-span-12 md:col-span-4 row-span-2 bg-surface-container-low p-6 rounded-xl flex flex-col">
<div className="flex justify-between items-center mb-6">
<h4 className="font-headline font-bold text-on-surface">Recent Activity</h4>
<span className="material-symbols-outlined text-on-surface-variant text-sm" data-icon="more_horiz">more_horiz</span>
</div>
<div className="space-y-6 flex-1">
<div className="flex gap-4">
<div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-on-secondary-container text-lg" data-icon="security">security</span>
</div>
<div>
<p className="text-sm text-on-surface font-medium">Compliance Breach Detected</p>
<p className="text-xs text-on-surface-variant">OCR-V2 Engine • 2m ago</p>
</div>
</div>
<div className="flex gap-4">
<div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-primary text-lg" data-icon="cloud_done">cloud_done</span>
</div>
<div>
<p className="text-sm text-on-surface font-medium">Batch Processing Complete</p>
<p className="text-xs text-on-surface-variant">System • 15m ago</p>
</div>
</div>
<div className="flex gap-4">
<div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-tertiary text-lg" data-icon="auto_awesome">auto_awesome</span>
</div>
<div>
<p className="text-sm text-on-surface font-medium">AI Agent Refined Model</p>
<p className="text-xs text-on-surface-variant">Admin • 1h ago</p>
</div>
</div>
</div>
<button className="mt-6 w-full py-2 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface-variant hover:text-white transition-colors">
                    View Full Audit Log
                </button>
</div>

<div className="col-span-12 md:col-span-8 bg-surface-container-low p-8 rounded-xl min-h-[400px]">
<div className="flex items-center justify-between mb-8">
<h3 className="font-headline font-bold text-xl text-on-surface">Pending Conflict Resolution</h3>
<div className="flex gap-2">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">All Engines</span>
<span className="px-3 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold tracking-wider uppercase">High Priority</span>
</div>
</div>
<div className="space-y-4">

<div className="group bg-surface-container p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container-high transition-all cursor-pointer">
<div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover opacity-60" data-alt="close-up of a technical document with blurred text and highlighted sections in cool tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSFwN_thTr4QrPp-f_2dc0hXrg7Qkdzc7ELV_e7XYhpKHXqXl6jab-KEIxNVeQCRP_XwaJ0p-0j3J_96UBU_E0E_ZoeyhkRA2IkLXiH_rRc-6sSVdr9nmjPKcqdLFMmRfOywfVoOK4FmfZ3MXXPUFRKGWup5iIZcJinO9QDRO9-cl6QIrTKJymD8dpZRPhsJL-DvrIoywV44xe0uVsERpOHnjzcUNmDEXqM8_MuA1sKHoKkLsAnVWWTwXOCKKwMSA5lNXCAnlM1dlu"/>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="text-sm font-bold text-on-surface">Invoice-4921-X</h5>
<span className="text-[10px] font-mono bg-secondary-container px-2 py-0.5 rounded text-on-secondary-container">OCR-V2</span>
</div>
<p className="text-xs text-on-surface-variant">Discrepancy in VAT calculation: Expected $42.00, Found $42.01</p>
</div>
<div className="text-right">
<div className="bg-error-container/20 text-error px-2 py-1 rounded-md text-[10px] font-bold mb-1">
                                58% Confidence
                            </div>
<p className="text-[10px] text-on-surface-variant">2 hours left to SLA</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>

<div className="group bg-surface-container p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container-high transition-all cursor-pointer">
<div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover opacity-60" data-alt="abstract flowing blue and purple silk texture with soft light and deep shadows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIpR5rjRqg2KP4EYCNqJFjsaaVj2AUf-wWxYNzkbmqSukALgAldKoBcSRKEt4dkGu_Ldll-e6iADOuF6fGGt7yGX3L5oolrXNRTp-2hbVQGv4veVkFsBzSG0WY2BEnSqf3_Y-9Na63ZWnHXzKBB8ni06d7JAeLybrS_rHQU-o-BvResqG3cOO46ANeTKqWCrixNVzUrmVGuQKiIyLsD22DmZ4kGB8Ca7BGHTIrqjkifQwK0gPqyFmjH36uJTCSI-d9UO0qqQJK8tV7"/>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="text-sm font-bold text-on-surface">User-Agreement-Final.pdf</h5>
<span className="text-[10px] font-mono bg-secondary-container px-2 py-0.5 rounded text-on-secondary-container">NLP-BETA</span>
</div>
<p className="text-xs text-on-surface-variant">Clause 4.2 conflicting with EU GDPR compliance standards</p>
</div>
<div className="text-right">
<div className="bg-error-container/20 text-error px-2 py-1 rounded-md text-[10px] font-bold mb-1">
                                41% Confidence
                            </div>
<p className="text-[10px] text-on-surface-variant">Critical Alert</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>

<div className="group bg-surface-container p-4 rounded-xl flex items-center gap-6 hover:bg-surface-container-high transition-all cursor-pointer">
<div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover opacity-60" data-alt="satellite imagery of Earth showing bright city lights at night against a deep blue ocean" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEbqWG8-zrnr1mRg2qQigMmia_434UREQHY0aPaGp2DsrxqWr20eku9Xgts5rD26uS5w3RrLAUlXTGMm2T5c6lwCGnnNiWcWCNXaWFSBcGs9JJmLYRHHVW4EAZ3Kn06fifQpcqLqOQoYtIDPy5JNbMGEZwK0RE_5NV-zVRiGGQvC-2h2YAJkEURilD6cxWSRejM597rQUEEwvQYfVUG-RongchnPEAiZZCJKBMj-XJHz3DGNBRkIXie5agJYHu9tnQUhsUOz8ZAM9W"/>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="text-sm font-bold text-on-surface">Data-Extract-Q3.csv</h5>
<span className="text-[10px] font-mono bg-secondary-container px-2 py-0.5 rounded text-on-secondary-container">HEURISTICS-1</span>
</div>
<p className="text-xs text-on-surface-variant">Duplicate entry detected with varying timestamp formats</p>
</div>
<div className="text-right">
<div className="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded-md text-[10px] font-bold mb-1">
                                89% Confidence
                            </div>
<p className="text-[10px] text-on-surface-variant">Auto-resolve suggested</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</div>
</div>

    </div>
  );
}
