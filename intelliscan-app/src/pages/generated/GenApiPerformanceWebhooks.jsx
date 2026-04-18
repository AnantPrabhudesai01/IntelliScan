import React from 'react';

export default function GenApiPerformanceWebhooks() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      
<div className="max-w-7xl mx-auto space-y-8">

<section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">API Performance &amp; Webhooks</h2>
<p className="text-on-surface-variant text-sm flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems operational. 12 active endpoints.
          </p>
</div>
<div className="flex gap-3">
<button className="bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span>
            Refresh Data
          </button>
<button className="bg-primary-container text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-brand-900/30 hover:scale-[1.02] active:scale-95 transition-all">
<span className="material-symbols-outlined text-[18px]" data-icon="link">link</span>
            Test Webhook
          </button>
</div>
</section>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-2xl p-6 relative overflow-hidden">
<div className="flex justify-between items-start mb-8">
<div>
<h3 className="text-lg font-bold text-white">Latency Over Time</h3>
<p className="text-on-surface-variant text-xs font-mono">P95 LATENCY: 142MS</p>
</div>
<div className="flex bg-surface-container px-2 py-1 rounded-lg">
<button className="px-3 py-1 text-[10px] font-bold text-white bg-surface-container-highest rounded-md">1H</button>
<button className="px-3 py-1 text-[10px] font-bold text-on-surface-variant">24H</button>
<button className="px-3 py-1 text-[10px] font-bold text-on-surface-variant">7D</button>
</div>
</div>

<div className="h-64 flex items-end justify-between gap-1">

<div className="w-full h-1/2 bg-surface-container-high rounded-t-sm opacity-20"></div>
<div className="w-full h-2/3 bg-surface-container-high rounded-t-sm opacity-30"></div>
<div className="w-full h-3/4 bg-primary rounded-t-sm"></div>
<div className="w-full h-1/2 bg-surface-container-high rounded-t-sm opacity-40"></div>
<div className="w-full h-5/6 bg-primary rounded-t-sm"></div>
<div className="w-full h-2/3 bg-surface-container-high rounded-t-sm opacity-30"></div>
<div className="w-full h-1/2 bg-surface-container-high rounded-t-sm opacity-20"></div>
<div className="w-full h-3/4 bg-primary-container rounded-t-sm"></div>
<div className="w-full h-full bg-primary rounded-t-sm"></div>
<div className="w-full h-1/2 bg-surface-container-high rounded-t-sm opacity-40"></div>
<div className="w-full h-2/3 bg-primary rounded-t-sm"></div>
<div className="w-full h-1/2 bg-surface-container-high rounded-t-sm opacity-20"></div>
</div>
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent pointer-events-none"></div>
</div>

<div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
<div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between">
<div className="flex justify-between items-center">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="bolt">bolt</span>
<span className="text-[10px] font-bold px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded-lg">PEAK PERFORMANCE</span>
</div>
<div>
<p className="text-on-surface-variant text-sm">Throughput</p>
<h4 className="text-4xl font-black text-white">4.2k <span className="text-sm font-medium text-on-surface-variant">req/s</span></h4>
</div>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between">
<div className="flex justify-between items-center">
<span className="material-symbols-outlined text-error text-3xl" data-icon="report">report</span>
<span className="text-[10px] font-bold px-2 py-1 bg-error-container text-on-error-container rounded-lg">-12% FROM YESTERDAY</span>
</div>
<div>
<p className="text-on-surface-variant text-sm">Error Rate</p>
<h4 className="text-4xl font-black text-white">0.04%</h4>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-2xl flex flex-col overflow-hidden border-r border-outline-variant/5">
<div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
<h3 className="text-lg font-bold text-white">Live Webhook Stream</h3>
</div>
<span className="text-xs font-mono text-on-surface-variant">WS_CONNECTED</span>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">

<div className="p-4 hover:bg-surface-container transition-colors group">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-highest text-white rounded uppercase">200 OK</span>
<span className="text-xs font-mono text-on-surface-variant">/v1/scan/complete</span>
</div>
<span className="text-[10px] text-outline-variant">12:44:02.11</span>
</div>
<p className="text-xs text-on-surface-variant truncate">Payload: {"{"}"session_id": "92k-22", "confidence": 0.98...{"}"}</p>
</div>

<div className="p-4 hover:bg-surface-container transition-colors group border-l-2 border-error">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold px-2 py-0.5 bg-error-container text-on-error-container rounded uppercase">500 ERR</span>
<span className="text-xs font-mono text-on-surface-variant">/v1/user/auth</span>
</div>
<span className="text-[10px] text-outline-variant">12:43:58.49</span>
</div>
<p className="text-xs text-error">Timeout after 3000ms. Connection reset by peer.</p>
</div>

<div className="p-4 hover:bg-surface-container transition-colors group">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-highest text-white rounded uppercase">200 OK</span>
<span className="text-xs font-mono text-on-surface-variant">/v1/billing/hook</span>
</div>
<span className="text-[10px] text-outline-variant">12:43:45.01</span>
</div>
<p className="text-xs text-on-surface-variant truncate">Payload: {"{"}"event": "subscription.updated", "id": "sub_882..."{"}"}</p>
</div>

<div className="p-4 hover:bg-surface-container transition-colors group">
<div className="flex justify-between items-start mb-2">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-highest text-white rounded uppercase">200 OK</span>
<span className="text-xs font-mono text-on-surface-variant">/v1/scan/ocr-sync</span>
</div>
<span className="text-[10px] text-outline-variant">12:43:12.82</span>
</div>
<p className="text-xs text-on-surface-variant truncate">Payload: {"{"}"pages": 12, "engine": "TESSERACT_V5"{"}"}</p>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-2xl overflow-hidden">
<div className="p-6">
<h3 className="text-lg font-bold text-white mb-6">Active Endpoints</h3>
<div className="space-y-4">

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl group transition-all hover:scale-[1.01]">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="link">link</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Document Analysis API</h4>
<p className="text-xs text-on-surface-variant">POST https://api.intelliscan.io/v1/analysis</p>
</div>
</div>
<div className="text-right flex items-center gap-8">
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Last Success</p>
<p className="text-xs text-on-surface">2 mins ago</p>
</div>
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Status</p>
<span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="check_circle" data-weight="fill" style={{}}>check_circle</span>
                      Active
                    </span>
</div>
<button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl group transition-all hover:scale-[1.01]">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="hub">hub</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Neural OCR Engine</h4>
<p className="text-xs text-on-surface-variant">POST https://api.intelliscan.io/v1/ocr</p>
</div>
</div>
<div className="text-right flex items-center gap-8">
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Last Success</p>
<p className="text-xs text-on-surface">Just now</p>
</div>
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Status</p>
<span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="check_circle" data-weight="fill" style={{}}>check_circle</span>
                      Active
                    </span>
</div>
<button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl group transition-all hover:scale-[1.01]">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary" data-icon="shield">shield</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Auth Webhook Proxy</h4>
<p className="text-xs text-on-surface-variant">GET https://api.intelliscan.io/v1/auth/verify</p>
</div>
</div>
<div className="text-right flex items-center gap-8">
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Last Success</p>
<p className="text-xs text-on-surface">14 mins ago</p>
</div>
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Status</p>
<span className="text-xs text-tertiary font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="warning" data-weight="fill" style={{}}>warning</span>
                      High Latency
                    </span>
</div>
<button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>

<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl group transition-all hover:scale-[1.01]">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="database">database</span>
</div>
<div>
<h4 className="text-sm font-bold text-white">Segment Storage Sync</h4>
<p className="text-xs text-on-surface-variant">PUT https://api.intelliscan.io/v1/segments/sync</p>
</div>
</div>
<div className="text-right flex items-center gap-8">
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Last Success</p>
<p className="text-xs text-on-surface">32 mins ago</p>
</div>
<div>
<p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Status</p>
<span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="check_circle" data-weight="fill" style={{}}>check_circle</span>
                      Active
                    </span>
</div>
<button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-12 bg-surface-container-low rounded-2xl p-6">
<div className="flex justify-between items-center mb-6">
<h3 className="text-lg font-bold text-white">Payload Size Distribution</h3>
<span className="text-xs text-on-surface-variant font-mono">AVG: 2.4MB</span>
</div>
<div className="flex h-12 w-full rounded-xl overflow-hidden mb-6">
<div className="h-full bg-primary-container w-[60%] flex items-center px-4">
<span className="text-[10px] font-black text-white uppercase tracking-wider">Small (0-1MB)</span>
</div>
<div className="h-full bg-secondary-container w-[25%] flex items-center px-4">
<span className="text-[10px] font-black text-white uppercase tracking-wider">Med (1-5MB)</span>
</div>
<div className="h-full bg-tertiary-container w-[10%] flex items-center px-4">
<span className="text-[10px] font-black text-white uppercase tracking-wider">Large</span>
</div>
<div className="h-full bg-error-container w-[5%]"></div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
<div className="p-4 bg-surface-container rounded-xl">
<p className="text-xs text-on-surface-variant mb-1">Max Payload</p>
<h5 className="text-xl font-bold text-white">124.2 MB</h5>
</div>
<div className="p-4 bg-surface-container rounded-xl">
<p className="text-xs text-on-surface-variant mb-1">Total Bandwidth (24h)</p>
<h5 className="text-xl font-bold text-white">1.8 TB</h5>
</div>
<div className="p-4 bg-surface-container rounded-xl">
<p className="text-xs text-on-surface-variant mb-1">Compression Ratio</p>
<h5 className="text-xl font-bold text-white">4.2:1</h5>
</div>
<div className="p-4 bg-surface-container rounded-xl">
<p className="text-xs text-on-surface-variant mb-1">Cache Hit Rate</p>
<h5 className="text-xl font-bold text-white">88.4%</h5>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
}
