import React from 'react';

export default function GenApiWebhookConfiguration1() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      
<div className="max-w-5xl mx-auto space-y-12">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
<span>Workspace</span>
<span className="material-symbols-outlined text-[10px]">chevron_right</span>
<span>API</span>
<span className="material-symbols-outlined text-[10px]">chevron_right</span>
<span className="text-primary">Webhooks</span>
</nav>
<h1 className="text-4xl font-extrabold font-headline tracking-tight text-white">Webhook Configuration</h1>
<p className="text-on-surface-variant mt-2 max-w-2xl">Manage real-time notifications for scan events. IntelliScan will send a POST request to the specified URL when events occur.</p>
</div>
<button className="px-6 py-2.5 bg-primary-container text-on-primary-container font-semibold rounded-xl active:scale-95 duration-200 shadow-lg shadow-primary-container/20 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">bolt</span>
                        New Configuration
                    </button>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 space-y-6">
<section className="bg-surface-container-low rounded-xl p-8 shadow-sm">
<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-brand-400">settings_ethernet</span>
                                Endpoint Details
                            </h3>
<div className="space-y-6">

<div className="space-y-2">
<label className="text-sm font-medium text-on-surface-variant ml-1">Webhook URL</label>
<div className="relative">
<input className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/30" placeholder="https://your-api.com/webhooks/intelliscan" type="url"/>
<div className="absolute right-3 top-3 flex items-center gap-2">
<span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase tracking-wider">POST</span>
</div>
</div>
</div>

<div className="space-y-2">
<label className="text-sm font-medium text-on-surface-variant ml-1">Signing Secret</label>
<div className="flex gap-3">
<div className="relative flex-1">
<input className="w-full bg-surface-container text-on-surface-variant/50 px-4 py-3 rounded-xl border-none font-mono text-sm tracking-widest" readonly="" type="password" value="sk_enterprise_live_928374829374"/>
<button className="absolute right-3 top-3 text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
<button className="p-3 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-xl transition-all active:scale-95" title="Regenerate Secret">
<span className="material-symbols-outlined">refresh</span>
</button>
</div>
<p className="text-xs text-on-surface-variant/60 ml-1 italic">Used to verify the payload signature. Do not share this key.</p>
</div>
</div>
</section>
<section className="bg-surface-container-low rounded-xl p-8 shadow-sm">
<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-brand-400">checklist</span>
                                Event Selection
                            </h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<label className="flex items-start gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-all group">
<input checked="" className="mt-1 w-5 h-5 rounded border-none bg-surface-container-highest text-primary focus:ring-offset-surface focus:ring-primary" type="checkbox"/>
<div className="flex-1">
<div className="font-semibold text-white group-hover:text-primary transition-colors">scan.completed</div>
<div className="text-xs text-on-surface-variant">Triggered when a document scan is finished successfully.</div>
</div>
</label>
<label className="flex items-start gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-all group">
<input className="mt-1 w-5 h-5 rounded border-none bg-surface-container-highest text-primary focus:ring-offset-surface focus:ring-primary" type="checkbox"/>
<div className="flex-1">
<div className="font-semibold text-white group-hover:text-primary transition-colors">ocr.failed</div>
<div className="text-xs text-on-surface-variant">Fires if the engine cannot extract text with &gt;40% confidence.</div>
</div>
</label>
<label className="flex items-start gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-all group">
<input checked="" className="mt-1 w-5 h-5 rounded border-none bg-surface-container-highest text-primary focus:ring-offset-surface focus:ring-primary" type="checkbox"/>
<div className="flex-1">
<div className="font-semibold text-white group-hover:text-primary transition-colors">contact.created</div>
<div className="text-xs text-on-surface-variant">Notification when new metadata results in a CRM entry.</div>
</div>
</label>
<label className="flex items-start gap-3 p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-all group">
<input className="mt-1 w-5 h-5 rounded border-none bg-surface-container-highest text-primary focus:ring-offset-surface focus:ring-primary" type="checkbox"/>
<div className="flex-1">
<div className="font-semibold text-white group-hover:text-primary transition-colors">system.health</div>
<div className="text-xs text-on-surface-variant">Periodic updates on API latency and node performance.</div>
</div>
</label>
</div>
</section>
</div>

<div className="space-y-6">
<section className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
<h3 className="font-bold text-white mb-4">Configuration Health</h3>
<div className="space-y-4">
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Status</span>
<span className="flex items-center gap-1.5 text-emerald-400 font-medium">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Active
                                    </span>
</div>
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Success Rate</span>
<span className="text-white font-mono">99.82%</span>
</div>
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Avg Latency</span>
<span className="text-white font-mono">142ms</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mt-2">
<div className="h-full bg-primary-container" style={{}}></div>
</div>
</div>
</section>
<div className="flex flex-col gap-3">
<button className="w-full py-3 bg-surface-container-high text-white rounded-xl font-medium hover:bg-surface-variant transition-all border border-outline-variant/20 flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm">open_run</span>
                                Test Connection
                            </button>
<button className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-all shadow-lg">
                                Save Changes
                            </button>
<button className="w-full py-2 text-on-surface-variant/60 text-xs hover:text-error transition-colors">
                                Disable this webhook
                            </button>
</div>

<div className="bg-surface-container-low/50 p-4 rounded-xl space-y-3">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-brand-300 text-sm">info</span>
</div>
<span className="text-[10px] text-on-surface-variant leading-tight">
                                    IntelliScan uses Ed25519 signatures for high-security payload verification.
                                </span>
</div>
</div>
</div>
</div>

<section className="space-y-4">
<div className="flex items-center justify-between">
<h3 className="text-xl font-bold text-white font-headline">Recent Delivery Attempts</h3>
<div className="flex items-center gap-2">
<span className="text-xs text-on-surface-variant">Showing last 50 attempts</span>
<button className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant">
<span className="material-symbols-outlined text-sm">download</span>
</button>
</div>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/50 border-b border-outline-variant/5">
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Event</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Payload ID</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Timestamp</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Response</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container/30 transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
<span className="text-sm font-mono text-emerald-400">200 OK</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-sm font-medium text-white">scan.completed</span>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">evt_8kL2x0P1q5</span>
</td>
<td className="px-6 py-4">
<span className="text-xs text-on-surface-variant">2023-11-24 14:02:11</span>
</td>
<td className="px-6 py-4 text-right">
<span className="text-xs font-mono text-brand-300">12ms</span>
</td>
</tr>
<tr className="hover:bg-surface-container/30 transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
<span className="text-sm font-mono text-emerald-400">200 OK</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-sm font-medium text-white">scan.completed</span>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">evt_9mZ3y1R2s6</span>
</td>
<td className="px-6 py-4">
<span className="text-xs text-on-surface-variant">2023-11-24 13:58:04</span>
</td>
<td className="px-6 py-4 text-right">
<span className="text-xs font-mono text-brand-300">18ms</span>
</td>
</tr>
<tr className="hover:bg-surface-container/30 transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
<span className="text-sm font-mono text-error">500 ERR</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-sm font-medium text-white">contact.created</span>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">evt_1aX4v2W3t7</span>
</td>
<td className="px-6 py-4">
<span className="text-xs text-on-surface-variant">2023-11-24 13:45:22</span>
</td>
<td className="px-6 py-4 text-right">
<span className="text-xs font-mono text-error">Timeout</span>
</td>
</tr>
<tr className="hover:bg-surface-container/30 transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
<span className="text-sm font-mono text-emerald-400">201 CRE</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-sm font-medium text-white">scan.completed</span>
</td>
<td className="px-6 py-4">
<span className="text-xs font-mono text-on-surface-variant">evt_2bY5u3Q4v8</span>
</td>
<td className="px-6 py-4">
<span className="text-xs text-on-surface-variant">2023-11-24 13:22:15</span>
</td>
<td className="px-6 py-4 text-right">
<span className="text-xs font-mono text-brand-300">21ms</span>
</td>
</tr>
</tbody>
</table>
<div className="px-6 py-4 bg-surface-container-high/20 flex justify-center">
<button className="text-xs font-semibold text-primary hover:text-white transition-colors uppercase tracking-widest">Load More Data</button>
</div>
</div>
</section>
</div>

    </div>
  );
}
