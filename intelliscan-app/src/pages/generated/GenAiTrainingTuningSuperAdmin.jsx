import React, { useRef, useState } from 'react';

export default function GenAiTrainingTuningSuperAdmin() {
  const logRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - logRef.current.offsetLeft);
    setScrollLeft(logRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - logRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    logRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-1 md:grid-cols-12 gap-6">

<div className="md:col-span-8 space-y-6">
<div className="bg-surface-container-low rounded-xl p-6 shadow-sm">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="psychology">psychology</span>
<h2 className="text-xl font-bold text-white">Neural Thresholds</h2>
</div>
<div className="flex gap-2 p-1 bg-surface-container rounded-lg">
<button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary-container text-on-primary-container">Gemini Vision</button>
<button className="px-4 py-1.5 text-xs font-semibold rounded-md text-on-surface-variant hover:text-white transition-colors">Tesseract V5</button>
</div>
</div>
<div className="space-y-10">

<div className="space-y-4">
<div className="flex justify-between items-center">
<label className="text-sm font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-xs" data-icon="verified">verified</span>
                                    OCR Confidence Threshold
                                </label>
<span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">88%</span>
</div>
<input className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" type="range" value="88"/>
<p className="text-[11px] text-on-surface-variant">Sets the minimum confidence score required for automatic field population without manual review flag.</p>
</div>

<div className="space-y-4">
<div className="flex justify-between items-center">
<label className="text-sm font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-xs" data-icon="blur_on">blur_on</span>
                                    Denoising Sensitivity
                                </label>
<span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">42%</span>
</div>
<input className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" type="range" value="42"/>
<p className="text-[11px] text-on-surface-variant">Adjusts the intensity of artifact removal on scanned low-quality or thermally printed documents.</p>
</div>
</div>
</div>

<div className="glass-panel rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden">
<div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
<span className="material-symbols-outlined text-4xl text-primary" data-icon="cloud_upload">cloud_upload</span>
</div>
<div className="flex-1">
<h3 className="text-lg font-bold text-white mb-1">Upload Training Corpus</h3>
<p className="text-sm text-on-surface-variant mb-4">Feed the engine with JSONL or CSV datasets to improve domain-specific extraction accuracy.</p>
<div className="flex flex-wrap gap-2">
<button className="px-6 py-2 bg-primary-container text-on-primary-container text-sm font-bold rounded-xl active:scale-95 transition-transform">Select Files</button>
<button className="px-6 py-2 bg-surface-container-highest text-on-surface text-sm font-bold rounded-xl hover:bg-surface-bright transition-colors">Schema Guide</button>
</div>
</div>
</div>

<div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
</div>
</div>

<div className="md:col-span-4 space-y-6">

<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/5">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-tertiary" data-icon="sync_alt">sync_alt</span>
<h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Live Retraining</h2>
</div>
<div className="space-y-6">
<div>
<div className="flex justify-between text-xs mb-2">
<span className="text-on-surface font-medium">Model Optimization</span>
<span className="text-on-surface-variant">74%</span>
</div>
<div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{}}></div>
</div>
</div>
<div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg">
<div className="p-2 bg-tertiary-container/20 rounded-lg">
<span className="material-symbols-outlined text-tertiary" data-icon="heap_snapshot_thumbnail">heap_snapshot_thumbnail</span>
</div>
<div>
<p className="text-xs font-bold text-white">Epoch 42/60</p>
<p className="text-[10px] text-on-surface-variant">ETA: 14m 22s</p>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6">
<div className="flex items-center justify-between mb-6">
<h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Domain Modules</h2>
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="info">info</span>
</div>
<div className="space-y-3">

<div className="group flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-center gap-3">
<div className="w-8 h-8 flex items-center justify-center rounded bg-indigo-500/10">
<span className="material-symbols-outlined text-indigo-400 text-sm" data-icon="gavel">gavel</span>
</div>
<div>
<p className="text-xs font-bold text-white">Legal Lexicon</p>
<p className="text-[10px] text-on-surface-variant">Active • 12k terms</p>
</div>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
</div>
</div>

<div className="group flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-center gap-3">
<div className="w-8 h-8 flex items-center justify-center rounded bg-emerald-500/10">
<span className="material-symbols-outlined text-emerald-400 text-sm" data-icon="medical_services">medical_services</span>
</div>
<div>
<p className="text-xs font-bold text-white">Medical Coding</p>
<p className="text-[10px] text-on-surface-variant">Standby • 45k terms</p>
</div>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
</div>
</div>

<div className="group flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-center gap-3">
<div className="w-8 h-8 flex items-center justify-center rounded bg-amber-500/10">
<span className="material-symbols-outlined text-amber-400 text-sm" data-icon="account_balance">account_balance</span>
</div>
<div>
<p className="text-xs font-bold text-white">Financial Standards</p>
<p className="text-[10px] text-on-surface-variant">Active • 8k terms</p>
</div>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</div>
</div>
</div>

<div className="md:col-span-12">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
<div className="px-6 py-4 bg-surface-container border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-4">
<span className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest">Retraining Activity Log</span>
<div className="flex gap-2">
<span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-mono">2 Errors</span>
<span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-mono">152 Logs</span>
</div>
</div>
<button className="text-xs text-primary font-bold hover:underline">Download Archive</button>
</div>
<div
  ref={logRef}
  onMouseDown={handleMouseDown}
  onMouseLeave={handleMouseLeave}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  className={`p-4 font-mono text-[11px] leading-relaxed max-h-48 overflow-auto space-y-1 whitespace-nowrap select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
>
<p className="text-on-surface-variant"><span className="text-outline">[14:22:01]</span> <span className="text-emerald-400">INFO:</span> Epoch 41 completed with loss: 0.0024</p>
<p className="text-on-surface-variant"><span className="text-outline">[14:22:04]</span> <span className="text-primary">TASK:</span> Initializing validation on Legal_Dataset_V2...</p>
<p className="text-on-surface-variant"><span className="text-outline">[14:23:10]</span> <span className="text-error">WARN:</span> Low gradient detected in layer 4 (attention_head_2)</p>
<p className="text-on-surface-variant"><span className="text-outline">[14:24:15]</span> <span className="text-emerald-400">INFO:</span> Starting Optimizer: AdamW (lr=2e-5, weight_decay=0.01)</p>
<p className="text-on-surface-variant"><span className="text-outline">[14:25:30]</span> <span className="text-indigo-400">SYSTEM:</span> Checkpoint saved to cluster-node-alpha-4</p>
</div>
</div>
</div>
</div>

    </div>
  );
}