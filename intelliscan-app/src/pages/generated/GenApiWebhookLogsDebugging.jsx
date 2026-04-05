import React from 'react';

export default function GenApiWebhookLogsDebugging() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-8 max-w-7xl mx-auto space-y-8">

<section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<div className="flex items-center gap-3 mb-2">
<span className="bg-tertiary-container/20 text-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-tighter">Event: document.processed</span>
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<span className="text-xs text-on-surface-variant">Active Endpoint</span>
</div>
<h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">https://api.acme-corp.com/hooks/v1/scan-events</h1>
<p className="text-on-surface-variant mt-2 max-w-2xl font-body">Deep-dive logs for webhook ID <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-primary">wh_92lskj290sl</code>. Monitor delivery attempts, latency, and debug response payloads.</p>
</div>
<div className="flex gap-3">
<button className="bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-variant transition-all">
<span className="material-symbols-outlined text-sm">settings</span> Configure
                    </button>
<button className="bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary-container/20 transition-all">
<span className="material-symbols-outlined text-sm">send</span> Send Test Hook
                    </button>
</div>
</section>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div className="bg-surface-container-low p-5 rounded-2xl">
<p className="text-xs text-on-surface-variant font-semibold mb-1">Success Rate (24h)</p>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-bold text-white">99.4%</span>
<span className="text-[10px] text-emerald-400 font-bold">+0.2%</span>
</div>
</div>
<div className="bg-surface-container-low p-5 rounded-2xl">
<p className="text-xs text-on-surface-variant font-semibold mb-1">Avg. Latency</p>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-bold text-white">142ms</span>
<span className="text-[10px] text-on-surface-variant font-bold">P95: 310ms</span>
</div>
</div>
<div className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-error">
<p className="text-xs text-on-surface-variant font-semibold mb-1">Failed Attempts</p>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-bold text-white">12</span>
<span className="text-[10px] text-error font-bold">Needs Action</span>
</div>
</div>
<div className="bg-surface-container-low p-5 rounded-2xl">
<p className="text-xs text-on-surface-variant font-semibold mb-1">Total Payload</p>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-bold text-white">4.2 MB</span>
<span className="text-[10px] text-on-surface-variant font-bold">Processed today</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

<div className="lg:col-span-5 bg-surface-container-low rounded-2xl overflow-hidden flex flex-col h-[700px]">
<div className="p-4 bg-surface-container-high/50 flex items-center justify-between">
<h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface-variant">Attempt History</h3>
<div className="flex gap-2">
<span className="bg-surface-container px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-primary-container/20 hover:text-primary transition-colors">ALL</span>
<span className="bg-surface-container px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-error-container/20 hover:text-error transition-colors">FAILED</span>
</div>
</div>
<div className="flex-1 overflow-y-auto code-scroll">

<div className="p-4 bg-surface-container border-l-4 border-primary cursor-pointer hover:brightness-110 transition-all">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">200 OK</span>
<span className="text-[10px] text-on-surface-variant font-mono">ID: att_281x...</span>
</div>
<span className="text-[10px] text-on-surface-variant">2 mins ago</span>
</div>
<p className="text-xs font-mono text-on-surface truncate mb-1">POST /hooks/v1/scan-events</p>
<div className="flex items-center justify-between">
<span className="text-[10px] text-outline">Latency: 88ms</span>
<span className="text-[10px] text-outline">4.2kb</span>
</div>
</div>

<div className="p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container/50 transition-all">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="bg-error-container/20 text-error px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">500 ERR</span>
<span className="text-[10px] text-on-surface-variant font-mono">ID: att_29x2...</span>
</div>
<span className="text-[10px] text-on-surface-variant">15 mins ago</span>
</div>
<p className="text-xs font-mono text-on-surface truncate mb-1">POST /hooks/v1/scan-events</p>
<div className="flex items-center justify-between">
<span className="text-[10px] text-outline">Latency: 450ms</span>
<button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">replay</span> Redeliver
                                </button>
</div>
</div>

<div className="p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container/50 transition-all">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">200 OK</span>
<span className="text-[10px] text-on-surface-variant font-mono">ID: att_299a...</span>
</div>
<span className="text-[10px] text-on-surface-variant">1 hour ago</span>
</div>
<p className="text-xs font-mono text-on-surface truncate mb-1">POST /hooks/v1/scan-events</p>
<div className="flex items-center justify-between">
<span className="text-[10px] text-outline">Latency: 112ms</span>
<span className="text-[10px] text-outline">3.9kb</span>
</div>
</div>

<div className="p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container/50 transition-all">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="bg-tertiary-container/20 text-tertiary px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">408 TO</span>
<span className="text-[10px] text-on-surface-variant font-mono">ID: att_301b...</span>
</div>
<span className="text-[10px] text-on-surface-variant">3 hours ago</span>
</div>
<p className="text-xs font-mono text-on-surface truncate mb-1">POST /hooks/v1/scan-events</p>
<div className="flex items-center justify-between">
<span className="text-[10px] text-outline">Latency: 10,000ms</span>
<button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">replay</span> Redeliver
                                </button>
</div>
</div>

<div className="p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container/50 transition-all opacity-60">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">200 OK</span>
<span className="text-[10px] text-on-surface-variant font-mono">ID: att_305c...</span>
</div>
<span className="text-[10px] text-on-surface-variant">Yesterday</span>
</div>
<p className="text-xs font-mono truncate mb-1">POST /hooks/v1/scan-events</p>
</div>
</div>
</div>

<div className="lg:col-span-7 space-y-6">

<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5 shadow-2xl">
<div className="p-4 bg-surface-container-high/50 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">upload</span>
<h3 className="font-headline font-bold text-sm">Request Payload</h3>
</div>
<button className="text-[10px] font-bold text-on-surface-variant hover:text-white flex items-center gap-1">
<span className="material-symbols-outlined text-sm">content_copy</span> Copy JSON
                            </button>
</div>
<div className="p-6 bg-[#080e1a] font-mono text-sm leading-relaxed overflow-x-auto code-scroll">
<div className="space-y-1">
<p><span className="text-purple-400">"event"</span>: <span className="text-emerald-400">"document.processed"</span>,</p>
<p><span className="text-purple-400">"created_at"</span>: <span className="text-emerald-400">"2023-11-20T14:48:01Z"</span>,</p>
<p><span className="text-purple-400">"data"</span>: {"{"}</p>
<p className="pl-4"><span className="text-purple-400">"document_id"</span>: <span className="text-emerald-400">"doc_88219"</span>,</p>
<p className="pl-4"><span className="text-purple-400">"status"</span>: <span className="text-emerald-400">"success"</span>,</p>
<p className="pl-4"><span className="text-purple-400">"confidence_score"</span>: <span className="text-orange-400">0.982</span>,</p>
<p className="pl-4"><span className="text-purple-400">"engine_version"</span>: <span className="text-emerald-400">"OCR-V2.4"</span>,</p>
<p className="pl-4"><span className="text-purple-400">"fields_extracted"</span>: [<span className="text-emerald-400">"invoice_no"</span>, <span className="text-emerald-400">"total_amount"</span>]</p>
<p>{"}"}</p>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5 shadow-2xl">
<div className="p-4 bg-surface-container-high/50 border-b border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-emerald-400">download</span>
<h3 className="font-headline font-bold text-sm">Response Body</h3>
</div>
<span className="text-[10px] text-on-surface-variant">Latency: <span className="text-emerald-400 font-bold">88ms</span></span>
</div>
<div className="p-6 bg-[#080e1a] font-mono text-sm leading-relaxed overflow-x-auto code-scroll">
<div className="space-y-1">
<p><span className="text-purple-400">"status"</span>: <span className="text-emerald-400">"received"</span>,</p>
<p><span className="text-purple-400">"message"</span>: <span className="text-emerald-400">"Webhook acknowledged successfully."</span>,</p>
<p><span className="text-purple-400">"trace_id"</span>: <span className="text-emerald-400">"TRC-9901-XLA"</span></p>
</div>
</div>
</div>

<div className="bg-surface-container rounded-2xl p-6">
<h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Transmission Headers</h4>
<div className="grid grid-cols-2 gap-y-3 gap-x-8">
<div className="space-y-1">
<p className="text-[10px] text-outline uppercase font-bold">Content-Type</p>
<p className="text-xs font-mono">application/json</p>
</div>
<div className="space-y-1">
<p className="text-[10px] text-outline uppercase font-bold">X-IntelliScan-Signature</p>
<p className="text-xs font-mono truncate text-primary">sha256=2b9...8a1c</p>
</div>
<div className="space-y-1">
<p className="text-[10px] text-outline uppercase font-bold">User-Agent</p>
<p className="text-xs font-mono">IntelliScan-Hookshot/2.0</p>
</div>
<div className="space-y-1">
<p className="text-[10px] text-outline uppercase font-bold">Connection</p>
<p className="text-xs font-mono">keep-alive</p>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-high border border-primary-container/30 p-4 rounded-2xl flex items-center justify-between shadow-xl">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">info</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Pending Retries</h4>
<p className="text-xs text-on-surface-variant">There are 3 events that failed to deliver in the last hour.</p>
</div>
</div>
<button className="bg-primary-container text-white px-6 py-2 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
                    Retry All Failures
                </button>
</div>
</div>

    </div>
  );
}