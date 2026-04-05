import React from 'react';

export default function GenErrorResolutionCenter() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-12 gap-6 items-start">

<section className="col-span-4 space-y-4">
<div className="flex items-center justify-between px-2 mb-2">
<h3 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface-variant">Active Issues</h3>
<span className="material-symbols-outlined text-on-surface-variant text-sm">filter_list</span>
</div>

<div className="bg-surface-container-high p-4 rounded-xl border-l-4 border-primary-container shadow-xl">
<div className="flex justify-between items-start mb-3">
<span className="text-[10px] font-mono bg-secondary-container/30 text-secondary px-2 py-0.5 rounded uppercase">OCR-V2 Engine</span>
<div className="flex items-center gap-1 bg-error-container/40 text-error px-2 py-0.5 rounded-full text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]" style={{}}>error</span>
                            54% Confidence
                        </div>
</div>
<h4 className="font-bold text-white mb-1">Invoice_Q4_8829.pdf</h4>
<p className="text-xs text-on-surface-variant mb-4">Mismatched tax fields in bottom-right quadrant.</p>
<div className="flex justify-between items-center text-[11px] text-on-surface-variant/60">
<span>2 mins ago</span>
<button className="text-primary font-bold flex items-center gap-1">Review <span className="material-symbols-outlined text-sm">chevron_right</span></button>
</div>
</div>

<div className="bg-surface-container-low p-4 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-3">
<span className="text-[10px] font-mono bg-secondary-container/20 text-on-surface-variant px-2 py-0.5 rounded uppercase">Vision-Pro</span>
<div className="flex items-center gap-1 bg-error-container/20 text-on-surface-variant/70 px-2 py-0.5 rounded-full text-[10px]">
<span className="material-symbols-outlined text-[12px]">warning</span>
                            41% Confidence
                        </div>
</div>
<h4 className="font-bold text-white/80 group-hover:text-white mb-1">Packing_Slip_Global.jpg</h4>
<p className="text-xs text-on-surface-variant mb-4">Handwritten signature obstruction detected.</p>
<div className="flex justify-between items-center text-[11px] text-on-surface-variant/60">
<span>14 mins ago</span>
<button className="group-hover:text-primary transition-colors font-bold">Queue</button>
</div>
</div>

<div className="bg-surface-container-low p-4 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-3">
<span className="text-[10px] font-mono bg-secondary-container/20 text-on-surface-variant px-2 py-0.5 rounded uppercase">Deep-Scan-01</span>
<div className="flex items-center gap-1 bg-error-container/20 text-on-surface-variant/70 px-2 py-0.5 rounded-full text-[10px]">
<span className="material-symbols-outlined text-[12px]">block</span>
                            Extraction Failed
                        </div>
</div>
<h4 className="font-bold text-white/80 group-hover:text-white mb-1">Receipt_9930.png</h4>
<p className="text-xs text-on-surface-variant mb-4">Blurry text prevents merchant identification.</p>
<div className="flex justify-between items-center text-[11px] text-on-surface-variant/60">
<span>45 mins ago</span>
<button className="group-hover:text-primary transition-colors font-bold">Queue</button>
</div>
</div>
</section>

<section className="col-span-8 flex flex-col gap-6">

<div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-3xl">troubleshoot</span>
</div>
<div>
<h2 className="font-headline font-bold text-lg text-white">Reviewing: Invoice_Q4_8829.pdf</h2>
<p className="text-xs text-on-surface-variant">Document ID: <span className="font-mono">8229-331-XQ</span></p>
</div>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/10">
<span className="text-xs font-medium text-on-surface-variant">Reprocess with Gemini Pro</span>
<div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
<div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
</div>
</div>
<button className="bg-primary-container hover:bg-primary-container/90 px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-container/20">Apply Fix</button>
</div>
</div>

<div className="grid grid-cols-2 gap-4 h-[600px]">

<div className="bg-surface-container rounded-xl overflow-hidden flex flex-col relative group">
<div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-secondary">visibility</span>
<span className="text-[10px] font-bold uppercase tracking-wider">Original Capture</span>
</div>
<div className="flex-1 bg-black/20 flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover opacity-80 mix-blend-lighten" data-alt="Close-up of a high-resolution commercial invoice with financial figures and a company logo on textured paper" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9olSUZk__u8XnDG0L2JoVhe5EKP8wIqX8UYbunFLjvi86eAabIsMj86e-up1ZF98tcqEvkc-Xt-Sp2w0_DfvfRigdQciYNCfZFyunrTFFBmq2pS6r0UmY1hcJTLajoV-HVzUxSehuTswNbQE0LfigOE8uRW64gA3KWJv4D5A80-BBLYUvw9bpaqW3wszzFffZMudcYnTVjhNmj40KQtp-pp9aUjlYn1VslMpJRg8N76Byh8D5r8BZot1vG7hpIS_o8iLI1xSfw8-3"/>

<div className="absolute top-1/2 left-1/4 w-32 h-8 border-2 border-error/50 bg-error/10 flex items-center justify-center">
<span className="text-[10px] text-error font-bold">LOW CONFIDENCE</span>
</div>
<div className="absolute bottom-1/4 right-1/4 w-40 h-10 border-2 border-primary-container/50 bg-primary-container/10 flex items-center justify-center">
<span className="text-[10px] text-primary-container font-bold">DETECTION AREA</span>
</div>
</div>
<div className="p-4 bg-surface-container-high/50 backdrop-blur-md border-t border-white/5 flex justify-between items-center">
<div className="flex gap-2">
<button className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
<button className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
</div>
<span className="text-[10px] text-on-surface-variant font-mono">2400 x 3600 px | 3.4 MB</span>
</div>
</div>

<div className="bg-surface-container-low rounded-xl flex flex-col border border-outline-variant/10">
<div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-error text-lg">code_off</span>
<h3 className="font-bold text-sm text-white">Extracted Metadata</h3>
</div>
<span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Schema v4.1</span>
</div>
<div className="flex-1 p-6 space-y-6 overflow-y-auto">

<div className="space-y-4">
<div>
<div className="flex justify-between items-center mb-1.5">
<label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Company Name</label>
<span className="text-[10px] bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-bold">98% Match</span>
</div>
<input className="w-full bg-surface-container-high border-0 rounded-xl text-sm focus:ring-1 focus:ring-primary-container/40" type="text" value="TECHNO-SOLUTIONS GLOBAL LTD"/>
</div>
<div>
<div className="flex justify-between items-center mb-1.5">
<label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Tax Registration</label>
<span className="text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-bold">54% - UNSTABLE</span>
</div>
<input className="w-full bg-surface-container-high border-2 border-error/20 rounded-xl text-sm focus:ring-1 focus:ring-error/40 text-error" type="text" value="GB-7729-??-L"/>
<p className="text-[10px] mt-1 text-on-surface-variant/60 italic">AI Note: Potential ink smudge or overlapping characters.</p>
</div>
<div>
<div className="flex justify-between items-center mb-1.5">
<label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Total Amount (USD)</label>
<span className="text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-bold">Missing</span>
</div>
<div className="relative">
<input className="w-full bg-surface-container-high border-0 rounded-xl text-sm focus:ring-1 focus:ring-primary-container/40 placeholder:text-on-surface-variant/30" placeholder="Enter manual value..." type="text"/>
<span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-primary-container">edit</span>
</div>
</div>
<div className="pt-4 border-t border-outline-variant/10">
<div className="bg-primary-container/5 rounded-xl p-4 border border-primary-container/10">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
<span className="text-[11px] font-bold text-primary uppercase">Engine Suggestion (Gemini Pro)</span>
</div>
<p className="text-xs text-white/90 mb-3">Predicted Tax ID: <span className="bg-primary-container/20 px-2 py-0.5 rounded font-mono">GB-7729-102-L</span></p>
<button className="w-full py-2 bg-primary-container/10 hover:bg-primary-container/20 text-primary text-[11px] font-bold rounded-lg transition-colors border border-primary-container/20">Accept Suggestion</button>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="flex justify-end gap-3 mt-4">
<button className="px-6 py-2 rounded-xl text-on-surface-variant font-medium hover:bg-white/5 transition-colors">Skip for now</button>
<button className="px-6 py-2 rounded-xl border border-outline-variant/30 text-white font-medium hover:bg-white/5 transition-colors">Discard Scan</button>
</div>
</section>
</div>

<div className="fixed bottom-8 right-8 flex items-center gap-4 bg-surface-container-highest/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/5 max-w-sm">
<div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{}}>bolt</span>
</div>
<div>
<p className="text-sm font-bold text-white">Auto-Fix Enabled</p>
<p className="text-[11px] text-on-surface-variant">The engine has automatically corrected 4 similar errors in this batch.</p>
</div>
<button className="ml-auto material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
</div>

    </div>
  );
}