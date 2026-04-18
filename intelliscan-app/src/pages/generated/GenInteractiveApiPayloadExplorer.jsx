import React from 'react';

export default function GenInteractiveApiPayloadExplorer() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<div className="px-8 py-6 flex items-center justify-between shrink-0">
<div>
<h1 className="font-headline text-2xl font-bold tracking-tight text-white">API Payload Explorer</h1>
<p className="text-on-surface-variant text-sm mt-1 font-body">Inspect structural transformations between raw OCR and Intelligence models.</p>
</div>
<div className="flex items-center gap-3">
<div className="bg-surface-container rounded-xl px-4 py-2 flex items-center gap-3 border border-outline-variant/15">
<span className="text-xs font-mono text-on-surface-variant">Request ID:</span>
<span className="text-xs font-mono text-primary font-semibold">req_942_x2_gemini</span>
<span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer">content_copy</span>
</div>
<button className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                        Re-run Pipeline
                    </button>
</div>
</div>

<div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden border-t border-outline-variant/10">

<section className="col-span-3 border-r border-outline-variant/10 bg-surface-container-low flex flex-col">
<div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Raw Output (Tesseract)</span>
</div>
<span className="text-[10px] bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded font-mono">v5.3.3</span>
</div>
<div className="flex-1 overflow-auto p-6 font-mono text-[11px] leading-relaxed custom-scrollbar">
<div className="space-y-1">
<p>{"{"}</p>
<p className="pl-4"><span className="json-key">"fullText"</span>: <span className="json-string">"INVOICE #9921-A\nDate: 2023-11-12\nVendor: Apex Systems...\nTotal Due: $1,240.00"</span>,</p>
<p className="pl-4"><span className="json-key">"lines"</span>: [</p>
<p className="pl-8">{"{"} <span className="json-key">"text"</span>: <span className="json-string">"INVOICE #9921-A"</span>, <span className="json-key">"bbox"</span>: [12, 45, 120, 60] {"}"},</p>
<p className="pl-8">{"{"} <span className="json-key">"text"</span>: <span className="json-string">"Date: 2023-11-12"</span>, <span className="json-key">"bbox"</span>: [12, 70, 110, 85] {"}"},</p>
<p className="pl-8">{"{"} <span className="json-key">"text"</span>: <span className="json-string">"Apex Systems Inc"</span>, <span className="json-key">"bbox"</span>: [300, 45, 450, 60] {"}"},</p>
<p className="pl-8">{"{"} <span className="json-key">"text"</span>: <span className="json-string">"Total: $1,240.00"</span>, <span className="json-key">"bbox"</span>: [400, 800, 550, 830] {"}"}</p>
<p className="pl-4">],</p>
<p className="pl-4"><span className="json-key">"blocks"</span>: 12,</p>
<p className="pl-4"><span className="json-key">"latency_ms"</span>: <span className="json-number">142</span></p>
<p>{"}"}</p>
</div>
<div className="mt-8 pt-8 border-t border-outline-variant/10 text-on-surface-variant italic">
                            // Note: Raw string contains control characters
                            // and layout artifacts from original image.
                        </div>
</div>
</section>

<section className="col-span-5 bg-surface-container flex flex-col">
<div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">visibility</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface">Extraction Visualizer</span>
</div>
<div className="flex gap-2">
<button className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
<button className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
<button className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-sm">crop_free</span></button>
</div>
</div>
<div className="flex-1 p-8 relative overflow-hidden flex items-center justify-center">

<div className="relative w-[400px] h-[520px] bg-white shadow-2xl rounded-sm overflow-hidden group">
<img className="w-full h-full object-cover opacity-90 grayscale" data-alt="Monochrome professional invoice document with clean typography and business letterhead details for data extraction visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd-1yxclL__qK2bPZoQDPZ4EBBNOvzXqgoQEaUnk2UQR1Dn9I_BBjuaArYDsABLxq-8D5rKLhKtXOrc_kuBWhq64Jy7yq-DSooALUZZsyUsXtBmvdx3EwPS8ZeWgMOqWMDrDLYrnnbKqnbv7977S7QNTDgsxef7kPawvZLmepIXL7TYp8eEbbCCUrs8x6iHGOpGhxYeioRzxepPe65G0yUmMlckmOYDnS3kvNlyc9Alt2M9OGAy2HAwJvrFuaYwjVT44ZwwfYfFPmK"/>

<div className="absolute top-[45px] left-[12px] w-[108px] h-[15px] border-2 border-primary bg-primary/10 transition-all hover:bg-primary/30 cursor-pointer"></div>
<div className="absolute top-[70px] left-[12px] w-[98px] h-[15px] border-2 border-brand-400 bg-brand-400/10 transition-all hover:bg-brand-400/30 cursor-pointer"></div>
<div className="absolute top-[45px] left-[300px] w-[150px] h-[15px] border-2 border-tertiary bg-tertiary/10 transition-all hover:bg-tertiary/30 cursor-pointer"></div>
<div className="absolute bottom-[40px] right-[20px] w-[150px] h-[30px] border-2 border-primary bg-primary/10 transition-all hover:bg-primary/30 cursor-pointer animate-pulse"></div>
<div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
</div>

<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/80 backdrop-blur-xl border border-outline-variant/20 px-4 py-2 rounded-full flex items-center gap-4 shadow-xl">
<div className="flex items-center gap-2 text-xs font-medium text-white">
<span className="w-2 h-2 rounded-full bg-primary"></span>
                                Amount Due
                            </div>
<div className="w-px h-4 bg-outline-variant/30"></div>
<div className="flex items-center gap-2 text-xs font-medium text-white">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
                                Vendor Name
                            </div>
</div>
</div>
</section>

<section className="col-span-4 border-l border-outline-variant/10 bg-surface-container-low flex flex-col">
<div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-brand-500 text-sm">auto_awesome</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface">Structured (Gemini Pro)</span>
</div>
<span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-mono">INTELLIGENCE-V4</span>
</div>
<div className="flex-1 flex flex-col overflow-hidden">

<div className="h-1/2 overflow-auto p-6 font-mono text-[11px] leading-relaxed custom-scrollbar border-b border-outline-variant/5 bg-surface-container-lowest/50">
<div className="space-y-1">
<p>{"{"}</p>
<p className="pl-4"><span className="json-key">"invoice_metadata"</span>: {"{"}</p>
<p className="pl-8"><span className="json-key">"invoice_id"</span>: <span className="json-string">"9921-A"</span>,</p>
<p className="pl-8"><span className="json-key">"currency"</span>: <span className="json-string">"USD"</span>,</p>
<p className="pl-8"><span className="json-key">"tax_status"</span>: <span className="json-string">"exempt"</span></p>
<p className="pl-4">{"}"},</p>
<p className="pl-4"><span className="json-key">"entities"</span>: [</p>
<p className="pl-8">{"{"} <span className="json-key">"type"</span>: <span className="json-string">"VENDOR"</span>, <span className="json-key">"value"</span>: <span className="json-string">"Apex Systems Inc"</span>, <span className="json-key">"conf"</span>: <span className="json-number">0.982</span> {"}"},</p>
<p className="pl-8">{"{"} <span className="json-key">"type"</span>: <span className="json-string">"DATE"</span>, <span className="json-key">"value"</span>: <span className="json-string">"2023-11-12"</span>, <span className="json-key">"conf"</span>: <span className="json-number">0.999</span> {"}"},</p>
<p className="pl-8">{"{"} <span className="json-key">"type"</span>: <span className="json-string">"TOTAL"</span>, <span className="json-key">"value"</span>: <span className="json-number">1240.00</span>, <span className="json-key">"conf"</span>: <span className="json-number">0.894</span> {"}"}</p>
<p className="pl-4">],</p>
<p className="pl-4"><span className="json-key">"validation"</span>: <span className="json-string">"passed"</span></p>
<p>{"}"}</p>
</div>
</div>

<div className="h-1/2 overflow-auto p-6 custom-scrollbar bg-surface-container-low">
<h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Confidence Metrics</h3>
<div className="space-y-4">

<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start mb-2">
<div>
<p className="text-sm font-semibold text-white">Vendor Entity</p>
<p className="text-[11px] text-on-surface-variant font-mono mt-1">Apex Systems Inc</p>
</div>
<div className="px-2 py-1 rounded bg-tertiary-container text-[10px] text-on-tertiary-container font-bold">98.2% CONF</div>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-tertiary h-full" style={{}}></div>
</div>
</div>

<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/5">
<div className="flex justify-between items-start mb-2">
<div>
<p className="text-sm font-semibold text-white">Amount Total</p>
<p className="text-[11px] text-on-surface-variant font-mono mt-1">$1,240.00</p>
</div>
<div className="px-2 py-1 rounded bg-tertiary-container text-[10px] text-on-tertiary-container font-bold">89.4% CONF</div>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-tertiary h-full" style={{}}></div>
</div>
</div>

<div className="bg-error-container/20 p-4 rounded-xl border border-error-container/30">
<div className="flex justify-between items-start mb-2">
<div>
<p className="text-sm font-semibold text-error">Handwritten Note</p>
<p className="text-[11px] text-on-error-container font-mono mt-1">"Approved by MK"</p>
</div>
<div className="px-2 py-1 rounded bg-error-container text-[10px] text-on-error-container font-bold">42.1% CONF</div>
</div>
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-error h-full" style={{}}></div>
</div>
<p className="text-[10px] text-error/80 mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">warning</span>
                                        Manual verification required for this field.
                                    </p>
</div>
</div>
</div>
</div>
</section>
</div>



    </div>
  );
}
