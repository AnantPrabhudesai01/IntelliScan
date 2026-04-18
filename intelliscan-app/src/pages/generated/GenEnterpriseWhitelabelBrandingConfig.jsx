import React from 'react';

export default function GenEnterpriseWhitelabelBrandingConfig() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 lg:col-span-5 space-y-6">

<section className="bg-surface-container-low p-6 rounded-xl space-y-6">
<h3 className="text-lg font-headline font-semibold text-primary-fixed-dim flex items-center gap-2">
<span className="material-symbols-outlined text-sm">palette</span> Visual Identity
                    </h3>
<div className="space-y-4">
<label className="block">
<span className="text-sm font-medium text-on-surface-variant mb-2 block">Primary Logo</span>
<div className="border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-xl p-8 transition-colors flex flex-col items-center justify-center cursor-pointer group">
<span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary transition-colors">upload_file</span>
<span className="text-sm text-on-surface-variant">Click to upload or drag SVG/PNG</span>
<span className="text-[10px] text-outline mt-1 uppercase tracking-widest">Recommended: 240x60px</span>
</div>
</label>
<div className="grid grid-cols-2 gap-4">
<label className="block">
<span className="text-sm font-medium text-on-surface-variant mb-2 block">Favicon</span>
<div className="bg-surface-container p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
<div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-outline">image</span>
</div>
<button className="text-xs font-bold text-primary uppercase tracking-wider">Replace</button>
</div>
</label>
<label className="block">
<span className="text-sm font-medium text-on-surface-variant mb-2 block">Brand Color</span>
<div className="bg-surface-container p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
<div className="w-10 h-10 bg-[#4f46e5] rounded-lg shadow-inner"></div>
<input className="bg-transparent border-none text-xs font-mono text-on-surface w-full focus:ring-0 p-0" type="text" value="#4F46E5"/>
</div>
</label>
</div>
</div>
</section>

<section className="bg-surface-container-low p-6 rounded-xl space-y-6">
<h3 className="text-lg font-headline font-semibold text-primary-fixed-dim flex items-center gap-2">
<span className="material-symbols-outlined text-sm">public</span> Network Config
                    </h3>
<div className="space-y-4">
<label className="block">
<span className="text-sm font-medium text-on-surface-variant mb-2 block">Custom Domain</span>
<div className="relative">
<span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-lg">link</span>
<input className="w-full bg-surface-container border-none rounded-xl py-3 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/40" placeholder="scans.acmecorp.com" type="text"/>
</div>
</label>
<div className="p-4 bg-primary-container/5 border border-primary-container/10 rounded-xl">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
<p className="text-xs text-on-surface-variant leading-relaxed">
                                    Point your CNAME record to <code className="text-primary-fixed-dim font-mono">ingress.intelliscan.io</code>. SSL certificates will be provisioned automatically upon propagation.
                                </p>
</div>
</div>
</div>
</section>
</div>

<div className="col-span-12 lg:col-span-7 space-y-6">
<div className="flex items-center justify-between">
<h3 className="text-xl font-headline font-bold text-white tracking-tight">Real-time Preview</h3>
<div className="flex bg-surface-container-low p-1 rounded-lg">
<button className="px-4 py-1.5 bg-surface-container-highest text-white text-xs font-bold rounded-md shadow-sm">Dashboard</button>
<button className="px-4 py-1.5 text-on-surface-variant text-xs font-bold rounded-md">Login Page</button>
</div>
</div>

<div className="relative aspect-video bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl">

<div className="absolute inset-0 flex flex-col p-4 bg-surface-dim">

<div className="h-10 w-full flex items-center justify-between px-4 bg-surface-container rounded-lg mb-4">
<div className="flex items-center gap-3">
<div className="h-4 w-20 bg-primary/20 rounded-full animate-pulse"></div>
<div className="h-4 w-4 bg-surface-container-highest rounded-sm"></div>
</div>
<div className="flex items-center gap-2">
<div className="h-6 w-6 rounded-full bg-surface-container-highest"></div>
<div className="h-6 w-6 rounded-full bg-surface-container-highest"></div>
</div>
</div>

<div className="grid grid-cols-3 gap-4 flex-1">
<div className="col-span-1 space-y-4">
<div className="h-32 bg-surface-container rounded-xl flex items-center justify-center">
<div className="text-center">
<div className="h-6 w-12 bg-primary/30 rounded-full mx-auto mb-2"></div>
<div className="h-2 w-16 bg-outline-variant rounded-full mx-auto"></div>
</div>
</div>
<div className="h-48 bg-surface-container-low rounded-xl p-4 space-y-2">
<div className="h-3 w-3/4 bg-surface-container-highest rounded"></div>
<div className="h-3 w-1/2 bg-surface-container-highest rounded"></div>
<div className="h-20 w-full bg-surface-container-highest/20 rounded-lg mt-4"></div>
</div>
</div>
<div className="col-span-2 space-y-4">
<div className="h-12 w-full flex items-center justify-between px-4 bg-surface-container rounded-xl">
<div className="h-3 w-32 bg-outline-variant rounded"></div>
<div className="h-6 w-20 bg-primary rounded-lg"></div>
</div>
<div className="h-auto bg-surface-container rounded-xl p-6">
<div className="flex justify-between items-end mb-8">
<div className="space-y-2">
<div className="h-4 w-40 bg-on-surface-variant/30 rounded"></div>
<div className="h-8 w-24 bg-white/10 rounded"></div>
</div>
<div className="h-24 w-48 flex items-end gap-1">
<div className="h-8 w-4 bg-primary/40 rounded-t"></div>
<div className="h-12 w-4 bg-primary/40 rounded-t"></div>
<div className="h-16 w-4 bg-primary/60 rounded-t"></div>
<div className="h-20 w-4 bg-primary/80 rounded-t"></div>
<div className="h-14 w-4 bg-primary/50 rounded-t"></div>
<div className="h-24 w-4 bg-primary rounded-t"></div>
</div>
</div>
<div className="space-y-4">
<div className="flex gap-4">
<div className="h-12 w-12 rounded-xl bg-surface-container-highest"></div>
<div className="flex-1 space-y-2">
<div className="h-3 w-1/3 bg-on-surface-variant/20 rounded"></div>
<div className="h-2 w-1/2 bg-on-surface-variant/10 rounded"></div>
</div>
</div>
<div className="flex gap-4">
<div className="h-12 w-12 rounded-xl bg-surface-container-highest"></div>
<div className="flex-1 space-y-2">
<div className="h-3 w-1/4 bg-on-surface-variant/20 rounded"></div>
<div className="h-2 w-1/3 bg-on-surface-variant/10 rounded"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="absolute bottom-6 left-6 flex items-center gap-3">
<div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="text-xs font-bold text-white tracking-widest uppercase">Live Workspace View</span>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 group hover:border-primary/30 transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
<span className="material-symbols-outlined">auto_fix_high</span>
</div>
<div className="w-10 h-5 bg-primary/20 rounded-full relative">
<div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full"></div>
</div>
</div>
<h4 className="font-bold text-on-surface">Auto-Theming AI</h4>
<p className="text-xs text-on-surface-variant mt-1">Automatically match UI accents to uploaded logo colors.</p>
</div>
<div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 group hover:border-primary/30 transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-tertiary-container rounded-lg text-on-tertiary-container">
<span className="material-symbols-outlined">verified_user</span>
</div>
<div className="w-10 h-5 bg-surface-container-highest rounded-full relative">
<div className="absolute left-1 top-1 w-3 h-3 bg-outline rounded-full"></div>
</div>
</div>
<h4 className="font-bold text-on-surface">Branded Emails</h4>
<p className="text-xs text-on-surface-variant mt-1">Apply workspace branding to all system notifications.</p>
</div>
</div>
</div>
</div>

<section className="mt-12">
<div className="flex items-center justify-between mb-6">
<h3 className="text-lg font-headline font-bold text-on-surface">Recent Branding Changes</h3>
<button className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                    Full Audit Log <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<table className="w-full text-left text-sm">
<thead className="bg-surface-container-high/50 text-on-surface-variant">
<tr>
<th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Administrator</th>
<th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Action</th>
<th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Subject</th>
<th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Timestamp</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-6 py-4 flex items-center gap-3">
<div className="w-7 h-7 bg-primary-container rounded-full flex items-center justify-center text-[10px] font-bold">SD</div>
<span className="font-medium">Sarah Drumm</span>
</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 bg-secondary-container/30 text-secondary-fixed text-[10px] font-bold rounded uppercase">Updated CSS</span>
</td>
<td className="px-6 py-4 text-on-surface-variant font-mono text-xs">primary_brand_color → #4F46E5</td>
<td className="px-6 py-4 text-outline text-xs">2 mins ago</td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-6 py-4 flex items-center gap-3">
<div className="w-7 h-7 bg-tertiary-container rounded-full flex items-center justify-center text-[10px] font-bold">MK</div>
<span className="font-medium">Marcus Kane</span>
</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 bg-primary-container/30 text-primary-fixed-dim text-[10px] font-bold rounded uppercase">DNS Link</span>
</td>
<td className="px-6 py-4 text-on-surface-variant font-mono text-xs">custom_domain → scans.acme.com</td>
<td className="px-6 py-4 text-outline text-xs">1 hour ago</td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-6 py-4 flex items-center gap-3">
<div className="w-7 h-7 bg-surface-container-highest rounded-full flex items-center justify-center text-[10px] font-bold text-outline">SYS</div>
<span className="font-medium">System Agent</span>
</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded uppercase">Auto-Backup</span>
</td>
<td className="px-6 py-4 text-on-surface-variant font-mono text-xs">branding_v24_recovery.json</td>
<td className="px-6 py-4 text-outline text-xs">4 hours ago</td>
</tr>
</tbody>
</table>
</div>
</section>

    </div>
  );
}
