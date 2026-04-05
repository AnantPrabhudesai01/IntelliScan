import React from 'react';

export default function GenApiWebhookConfiguration2() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 space-y-2">
<h3 className="text-3xl font-extrabold font-headline text-white">Event Delivery Configuration</h3>
<p className="text-on-surface-variant body-md max-w-2xl">
                        Streamline your workflow by subscribing to system events. IntelliScan Enterprise delivers real-time JSON payloads to your endpoints with retry logic and high-security signing.
                    </p>
</div>
<div className="flex items-start justify-end">
<button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
<span className="material-symbols-outlined">add</span>
                        Create Webhook
                    </button>
</div>
</section>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

<div className="xl:col-span-4 space-y-6">
<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-sm">
<h4 className="text-sm font-bold uppercase tracking-widest text-[#4f46e5] mb-6">New Endpoint</h4>
<form className="space-y-5">
<div className="space-y-2">
<label className="text-xs font-semibold text-on-surface-variant uppercase">Endpoint URL</label>
<input className="w-full bg-surface-container rounded-xl border-none text-white focus:ring-1 focus:ring-[#4f46e5] px-4 py-3 placeholder:text-on-surface-variant/30 text-sm" placeholder="https://api.yourdomain.com/webhook" type="text"/>
</div>
<div className="space-y-2">
<label className="text-xs font-semibold text-on-surface-variant uppercase">Signing Secret</label>
<div className="relative">
<input className="w-full bg-surface-container rounded-xl border-none text-white focus:ring-1 focus:ring-[#4f46e5] px-4 py-3 text-sm" type="password" value="whsec_8374hd928374hfkdj"/>
<button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white" type="button">
<span className="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
</div>
<div className="space-y-3">
<label className="text-xs font-semibold text-on-surface-variant uppercase">Event Subscriptions</label>
<div className="space-y-2">
<label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline-variant/5 cursor-pointer hover:bg-surface-container transition-colors">
<input checked="" className="rounded bg-surface-container-highest border-none text-[#4f46e5] focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface">scan.completed</span>
</label>
<label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline-variant/5 cursor-pointer hover:bg-surface-container transition-colors">
<input className="rounded bg-surface-container-highest border-none text-[#4f46e5] focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface">scan.failed</span>
</label>
<label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline-variant/5 cursor-pointer hover:bg-surface-container transition-colors">
<input checked="" className="rounded bg-surface-container-highest border-none text-[#4f46e5] focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface">contact.created</span>
</label>
</div>
</div>
<div className="pt-4">
<button className="w-full bg-surface-container-high hover:bg-surface-container-highest text-white py-3 rounded-xl font-medium transition-all border border-outline-variant/10" type="submit">
                                    Save Configuration
                                </button>
</div>
</form>
</div>

<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
<div className="flex items-center justify-between mb-4">
<h4 className="text-xs font-bold text-on-surface-variant uppercase">Avg. Latency</h4>
<span className="material-symbols-outlined text-sm text-[#4f46e5]">bolt</span>
</div>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-bold font-headline text-white">124ms</span>
<span className="text-xs text-tertiary font-medium">-12% vs last week</span>
</div>
</div>
</div>

<div className="xl:col-span-8 space-y-6">
<div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden shadow-lg">
<div className="p-6 border-b border-outline-variant/5 flex justify-between items-center bg-surface-container/20">
<div>
<h4 className="text-sm font-bold text-white">Configured Endpoints</h4>
<p className="text-[11px] text-on-surface-variant uppercase mt-1">2 Active / 0 Inactive</p>
</div>
<div className="flex gap-2">
<button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-sm">refresh</span>
</button>
</div>
</div>

<div className="p-6 hover:bg-surface-container/30 transition-all border-b border-outline-variant/5 group">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="space-y-1">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
<span className="font-mono text-sm text-white font-medium">https://production.crm.io/hooks/intelli</span>
</div>
<div className="flex gap-2 pl-5">
<span className="px-2 py-0.5 rounded bg-secondary-container/30 text-on-secondary-container text-[10px] font-mono border border-outline-variant/10">scan.completed</span>
<span className="px-2 py-0.5 rounded bg-secondary-container/30 text-on-secondary-container text-[10px] font-mono border border-outline-variant/10">scan.failed</span>
</div>
</div>
<div className="flex items-center gap-8 md:text-right">
<div>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Success Rate</p>
<p className="text-sm font-bold text-white">99.8%</p>
</div>
<div className="hidden sm:block">
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Last Fired</p>
<p className="text-sm text-on-surface">2 mins ago</p>
</div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm">edit</span></button>
<button className="p-2 rounded-lg hover:bg-surface-container-high text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
</div>
</div>
</div>
</div>

<div className="p-6 hover:bg-surface-container/30 transition-all border-b border-outline-variant/5 group">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="space-y-1">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
<span className="font-mono text-sm text-white font-medium">https://worker-v2.internal-infra.net</span>
</div>
<div className="flex gap-2 pl-5">
<span className="px-2 py-0.5 rounded bg-secondary-container/30 text-on-secondary-container text-[10px] font-mono border border-outline-variant/10">contact.created</span>
</div>
</div>
<div className="flex items-center gap-8 md:text-right">
<div>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Success Rate</p>
<p className="text-sm font-bold text-white">100%</p>
</div>
<div className="hidden sm:block">
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Last Fired</p>
<p className="text-sm text-on-surface">14 hours ago</p>
</div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-sm">edit</span></button>
<button className="p-2 rounded-lg hover:bg-surface-container-high text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-lg overflow-hidden">
<div className="p-6 flex justify-between items-center">
<h4 className="text-sm font-bold text-white">Recent Deliveries</h4>
<span className="text-xs text-[#4f46e5] font-semibold cursor-pointer hover:underline">View All Logs</span>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container/40 text-on-surface-variant text-[10px] uppercase tracking-widest">
<tr>
<th className="px-6 py-3 font-semibold">Timestamp</th>
<th className="px-6 py-3 font-semibold">Event Type</th>
<th className="px-6 py-3 font-semibold">Status</th>
<th className="px-6 py-3 font-semibold">Response</th>
<th className="px-6 py-3 font-semibold text-right">Latency</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5 text-sm">
<tr className="hover:bg-surface-container-high/40">
<td className="px-6 py-4 font-mono text-[11px] text-on-surface-variant">2024-05-24 14:22:10</td>
<td className="px-6 py-4 text-white">scan.completed</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="bg-tertiary-container/20 text-on-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold">200 OK</span>
</div>
</td>
<td className="px-6 py-4 text-on-surface-variant font-mono text-[11px]">{"{"} "status": "success" {"}"}</td>
<td className="px-6 py-4 text-right font-mono text-[11px] text-on-surface-variant">42ms</td>
</tr>
<tr className="hover:bg-surface-container-high/40">
<td className="px-6 py-4 font-mono text-[11px] text-on-surface-variant">2024-05-24 14:21:05</td>
<td className="px-6 py-4 text-white">contact.created</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="bg-tertiary-container/20 text-on-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold">200 OK</span>
</div>
</td>
<td className="px-6 py-4 text-on-surface-variant font-mono text-[11px]">{"{"} "id": "rec_9934" {"}"}</td>
<td className="px-6 py-4 text-right font-mono text-[11px] text-on-surface-variant">88ms</td>
</tr>
<tr className="hover:bg-surface-container-high/40">
<td className="px-6 py-4 font-mono text-[11px] text-on-surface-variant">2024-05-24 14:18:55</td>
<td className="px-6 py-4 text-white">scan.failed</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">500 ERR</span>
</div>
</td>
<td className="px-6 py-4 text-error font-mono text-[11px]">{"{"} "error": "timeout" {"}"}</td>
<td className="px-6 py-4 text-right font-mono text-[11px] text-on-surface-variant">5000ms</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>



    </div>
  );
}