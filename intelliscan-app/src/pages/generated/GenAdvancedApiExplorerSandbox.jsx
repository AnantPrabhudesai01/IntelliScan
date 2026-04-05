import React from 'react';

export default function GenAdvancedApiExplorerSandbox() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="flex-1 p-8 overflow-hidden flex flex-col gap-6">

<div className="flex items-end justify-between">
<div>
<h2 className="text-3xl font-extrabold font-headline tracking-tight text-white">API Sandbox</h2>
<p className="text-on-surface-variant mt-2 max-w-2xl">Test your extraction payloads against our production-grade OCR engines. Real-time feedback, confidence scoring, and raw JSON response data.</p>
</div>
<div className="flex items-center gap-3">
<div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/10 flex items-center gap-3">
<span className="material-symbols-outlined text-indigo-400 text-sm">key</span>
<code className="text-xs text-on-surface-variant font-mono">sk_prod_********8291</code>
<button className="text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined text-sm">content_copy</span>
</button>
</div>
<button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-bold font-headline flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
<span className="material-symbols-outlined text-lg">play_arrow</span>
                        Try it Out
                    </button>
</div>
</div>

<div className="grid grid-cols-12 grid-rows-6 gap-6 flex-1 min-h-0">

<div className="col-span-12 lg:col-span-5 row-span-6 bg-surface-container-low rounded-xl overflow-hidden flex flex-col shadow-lg border border-outline-variant/5">
<div className="px-6 py-4 bg-surface-container flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-indigo-400">code</span>
<span className="text-sm font-bold uppercase tracking-widest text-on-surface">Request Payload</span>
</div>
<div className="flex items-center gap-2">
<span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded uppercase font-bold">POST</span>
<span className="text-xs font-mono text-on-surface-variant">/v2/extract</span>
</div>
</div>
<div className="flex-1 p-6 font-mono text-sm overflow-auto hide-scrollbar bg-surface-container-low relative">
<div className="absolute left-0 top-0 w-12 h-full bg-surface-container-lowest flex flex-col items-center py-6 text-outline-variant/40 select-none text-[10px]">
<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
</div>
<div className="ml-10 text-indigo-300">
<pre className="whitespace-pre-wrap">{"{"}
  <span className="text-on-surface-variant">"engine"</span>: <span className="text-tertiary">"OCR-PRO-V3"</span>,
  <span className="text-on-surface-variant">"options"</span>: {"{"}
    <span className="text-on-surface-variant">"confidence_threshold"</span>: <span className="text-tertiary">0.85</span>,
    <span className="text-on-surface-variant">"auto_rotate"</span>: <span className="text-tertiary">true</span>,
    <span className="text-on-surface-variant">"extract_tables"</span>: <span className="text-tertiary">true</span>
  {"}"},
  <span className="text-on-surface-variant">"document"</span>: {"{"}
    <span className="text-on-surface-variant">"type"</span>: <span className="text-tertiary">"remote_url"</span>,
    <span className="text-on-surface-variant">"url"</span>: <span className="text-tertiary">"https://cdn.is.ai/samples/inv_92.pdf"</span>
  {"}"}
{"}"}</pre>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-7 row-span-4 bg-surface-container rounded-xl overflow-hidden flex flex-col shadow-2xl border border-outline-variant/10">
<div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
<div className="flex gap-6">
<button className="text-sm font-bold text-white border-b-2 border-primary pb-1">Response View</button>
<button className="text-sm font-medium text-on-surface-variant hover:text-white transition-all">Visual Overlay</button>
<button className="text-sm font-medium text-on-surface-variant hover:text-white transition-all">Headers</button>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span className="text-xs font-bold text-emerald-500 uppercase">200 OK</span>
</div>
<span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Time: 420ms</span>
</div>
</div>
<div className="flex-1 grid grid-cols-2">

<div className="p-6 border-r border-white/5 space-y-4">
<div className="bg-surface-container-low p-4 rounded-xl">
<p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Confidence Score</p>
<div className="flex items-center justify-between">
<span className="text-2xl font-black font-headline text-white">98.4<span className="text-indigo-500">%</span></span>
<div className="bg-tertiary-container text-on-tertiary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">High Confidence</div>
</div>
<div className="w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
<div className="w-[98.4%] h-full bg-indigo-500"></div>
</div>
</div>
<div className="space-y-3">
<p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Extracted Entities</p>
<div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high transition-all group">
<div className="flex flex-col">
<span className="text-xs text-on-surface-variant">Merchant Name</span>
<span className="text-sm font-bold text-white">TECH-GLOBAL SOLUTIONS</span>
</div>
<span className="text-[10px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">0.99</span>
</div>
<div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high transition-all group">
<div className="flex flex-col">
<span className="text-xs text-on-surface-variant">Total Amount</span>
<span className="text-sm font-bold text-white">$12,450.00</span>
</div>
<span className="text-[10px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">0.98</span>
</div>
<div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high transition-all group border-l-2 border-error">
<div className="flex flex-col">
<span className="text-xs text-on-surface-variant">Invoice Date</span>
<span className="text-sm font-bold text-white">2024-05-12?</span>
</div>
<div className="bg-error-container text-on-error-container text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Check</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 font-mono text-xs overflow-auto hide-scrollbar">
<pre className="text-on-secondary-container">{"{"}
  "status": "success",
  "request_id": "req_88291aZ",
  "data": {"{"}
    "merchant": "TECH-GLOBAL SOLUTIONS",
    "tax_id": "99-1234567",
    "total": 12450.00,
    "currency": "USD",
    "line_items": [
      {"{"}
        "desc": "AI Compute Credits",
        "qty": 1000,
        "price": 12.45
      {"}"}
    ],
    "meta": {"{"}
      "engine": "OCR-PRO-V3",
      "version": "3.1.2-alpha"
    {"}"}
  {"}"}
{"}"}</pre>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-7 row-span-2 bg-surface-container-low rounded-xl p-6 border border-outline-variant/5 shadow-inner">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-on-surface-variant">list_alt</span>
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">System Execution Logs</span>
</div>
<button className="text-[10px] text-indigo-400 hover:underline">Clear Logs</button>
</div>
<div className="space-y-2 overflow-auto max-h-24 hide-scrollbar">
<div className="flex gap-4 font-mono text-[11px]">
<span className="text-outline-variant">14:20:01.002</span>
<span className="text-emerald-500 font-bold">[INFO]</span>
<span className="text-on-surface-variant">Authentication successful. Session validated.</span>
</div>
<div className="flex gap-4 font-mono text-[11px]">
<span className="text-outline-variant">14:20:01.421</span>
<span className="text-indigo-400 font-bold">[POST]</span>
<span className="text-on-surface-variant">Request received by gateway. Routing to engine OCR-PRO-V3...</span>
</div>
<div className="flex gap-4 font-mono text-[11px]">
<span className="text-outline-variant">14:20:01.842</span>
<span className="text-emerald-500 font-bold">[DONE]</span>
<span className="text-on-surface-variant">Extraction complete. 14 entities identified with 98.4% mean confidence.</span>
</div>
</div>
</div>
</div>
</section>



    </div>
  );
}