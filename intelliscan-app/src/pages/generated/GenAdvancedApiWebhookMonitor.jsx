import React from 'react';

export default function GenAdvancedApiWebhookMonitor() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-8 max-w-7xl mx-auto w-full space-y-8">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h2 className="text-4xl font-headline font-extrabold tracking-tight text-white">Webhook Monitor</h2>
<p className="text-on-surface-variant mt-1">Real-time delivery intelligence and system health</p>
</div>
<div className="flex items-center gap-3">
<button className="px-5 py-2.5 rounded-xl bg-surface-container-highest text-white font-medium hover:bg-surface-bright transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="settings_input_component">settings_input_component</span>
                            Configure Endpoints
                        </button>
<button className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold hover:opacity-90 transition-all shadow-lg shadow-primary-container/20 flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="send">send</span>
                            Send Test Hook
                        </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
<div className="md:col-span-1 bg-surface-container-low p-6 rounded-xl space-y-4">
<div className="flex items-center justify-between">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Success Rate</span>
<span className="material-symbols-outlined text-tertiary" data-icon="check_circle">check_circle</span>
</div>
<div>
<p className="text-4xl font-headline font-black text-white">99.2%</p>
<p className="text-xs text-tertiary mt-1 flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
                                +0.4% from yesterday
                            </p>
</div>
</div>
<div className="md:col-span-1 bg-surface-container-low p-6 rounded-xl space-y-4">
<div className="flex items-center justify-between">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Avg Latency (p95)</span>
<span className="material-symbols-outlined text-primary" data-icon="timer">timer</span>
</div>
<div>
<p className="text-4xl font-headline font-black text-white">142ms</p>
<p className="text-xs text-on-surface-variant mt-1">Target: &lt; 200ms</p>
</div>
</div>
<div className="md:col-span-2 bg-surface-container-low p-6 rounded-xl overflow-hidden relative">
<div className="flex items-center justify-between mb-2">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Delivery Volume (24h)</span>
<div className="flex gap-2">
<div className="w-2 h-2 rounded-full bg-primary"></div>
<div className="w-2 h-2 rounded-full bg-primary/40"></div>
</div>
</div>
<div className="h-20 flex items-end gap-1">

<div className="flex-1 bg-primary/20 rounded-t h-[40%]"></div>
<div className="flex-1 bg-primary/30 rounded-t h-[60%]"></div>
<div className="flex-1 bg-primary/40 rounded-t h-[80%]"></div>
<div className="flex-1 bg-primary/60 rounded-t h-[50%]"></div>
<div className="flex-1 bg-primary/80 rounded-t h-[90%]"></div>
<div className="flex-1 bg-primary rounded-t h-[100%]"></div>
<div className="flex-1 bg-primary/70 rounded-t h-[75%]"></div>
<div className="flex-1 bg-primary/50 rounded-t h-[55%]"></div>
<div className="flex-1 bg-primary/40 rounded-t h-[45%]"></div>
<div className="flex-1 bg-primary/30 rounded-t h-[35%]"></div>
<div className="flex-1 bg-primary/20 rounded-t h-[25%]"></div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 space-y-6">
<div className="flex items-center justify-between">
<h3 className="text-xl font-headline font-bold text-white">Delivery Attempts</h3>
<div className="flex items-center gap-2">
<span className="text-xs text-on-surface-variant">Auto-refresh: 5s</span>
<div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
</div>
</div>
<div className="space-y-3">

<div className="group bg-surface-container p-4 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer">
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
<span className="font-bold text-xs">200</span>
</div>
<div>
<p className="font-bold text-white">scan.completed</p>
<p className="text-xs text-on-surface-variant font-mono">ID: wh_8f29ax... | 14ms</p>
</div>
</div>
<div className="text-right">
<p className="text-xs font-medium text-white">2 minutes ago</p>
<span className="px-2 py-0.5 rounded-full bg-tertiary-container text-[10px] font-bold text-on-tertiary-container">SUCCESS</span>
</div>
</div>
</div>

<div className="bg-surface-container-high p-4 rounded-xl border border-primary-container/20 ring-1 ring-primary-container/10">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
<span className="font-bold text-xs">500</span>
</div>
<div>
<p className="font-bold text-white">ocr.failed</p>
<p className="text-xs text-on-surface-variant font-mono">ID: wh_a219bc... | 4.2s</p>
</div>
</div>
<div className="text-right">
<p className="text-xs font-medium text-white">12 minutes ago</p>
<span className="px-2 py-0.5 rounded-full bg-error-container text-[10px] font-bold text-on-error-container">INTERNAL ERROR</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-xs text-on-surface-variant/80 border border-outline-variant/10">
<div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-wider text-on-surface-variant">
<span>Payload Preview</span>
<button className="text-primary hover:text-white transition-colors">Copy JSON</button>
</div>
<pre className="overflow-x-auto scrollbar-hide">{"{"}
  "event": "ocr.failed",
  "created": 1698245100,
  "data": {"{"}
    "object_id": "scan_7721",
    "reason": "engine_timeout",
    "confidence": 0.12,
    "attempts": 1
  {"}"},
  "endpoint": "https://api.partner.io/webhooks"
{"}"}</pre>
</div>
</div>

<div className="group bg-surface-container p-4 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer">
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-on-tertiary-fixed-variant/20 flex items-center justify-center text-tertiary-fixed">
<span className="font-bold text-xs">408</span>
</div>
<div>
<p className="font-bold text-white">data.breach_alert</p>
<p className="text-xs text-on-surface-variant font-mono">ID: wh_9c22lk... | 10.0s</p>
</div>
</div>
<div className="text-right">
<p className="text-xs font-medium text-white">45 minutes ago</p>
<span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">TIMEOUT</span>
</div>
</div>
</div>
</div>
</div>

<div className="space-y-8">

<div className="bg-surface-container-low rounded-xl overflow-hidden">
<div className="p-6 border-b border-outline-variant/10 bg-gradient-to-br from-primary-container/10 to-transparent">
<h3 className="font-headline font-bold text-white flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl" data-icon="rebase_edit">rebase_edit</span>
                                    Retry Queue
                                </h3>
</div>
<div className="p-6 space-y-6">
<div className="flex items-center justify-between">
<div>
<p className="text-2xl font-black text-white">12</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Active retries</p>
</div>
<div className="text-right">
<p className="text-2xl font-black text-white">4m</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Next batch in</p>
</div>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[65%]"></div>
</div>
<p className="text-xs text-on-surface-variant">Queue processing at 85% capacity. No bottlenecks detected.</p>
</div>
</div>

<div className="bg-surface-container-low p-6 rounded-xl space-y-4">
<h3 className="font-headline font-bold text-white">Active Endpoints</h3>
<div className="space-y-4">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-tertiary"></div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-white truncate">Main Production API</p>
<p className="text-[10px] text-on-surface-variant truncate">https://api.internal.com/hooks</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-tertiary"></div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-white truncate">Data Warehouse Sync</p>
<p className="text-[10px] text-on-surface-variant truncate">https://warehouse.aws.com/ingest</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center gap-3 opacity-50">
<div className="w-2 h-2 rounded-full bg-on-surface-variant"></div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-white truncate">Staging Debug Hook</p>
<p className="text-[10px] text-on-surface-variant truncate">https://dev-proxy.local/v1</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</div>

<div className="glass-effect p-6 rounded-xl border border-outline-variant/10 shadow-xl">
<h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Global Status</h4>
<div className="space-y-3">
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">Ingress Node</span>
<span className="text-white font-mono">us-east-1-p01</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">Worker Load</span>
<span className="text-white font-mono">14.2%</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">API Version</span>
<span className="text-white font-mono">v2.4.0-stable</span>
</div>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}
