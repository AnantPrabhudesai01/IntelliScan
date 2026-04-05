import React from 'react';

export default function GenUserFeedbackBugReporting() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      


<div className="flex-1 p-10 max-w-7xl w-full mx-auto">

<div className="mb-10">
<div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">
<span>Dashboard</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span>Support</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-primary-fixed">Feedback</span>
</div>
<h2 className="text-4xl font-extrabold text-white font-headline tracking-tight">System Feedback &amp; Support</h2>
<p className="text-on-surface-variant mt-2 max-w-2xl">Shape the future of IntelliScan. Report bugs, suggest features, or reach out for technical assistance.</p>
</div>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-3xl p-8 shadow-sm">
<div className="flex items-center gap-4 mb-8">
<div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-3xl">message</span>
</div>
<div>
<h3 className="text-xl font-bold text-white">Submit a Report</h3>
<p className="text-sm text-on-surface-variant">Estimated response time: &lt; 4 hours</p>
</div>
</div>
<form className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Ticket Type</label>
<div className="grid grid-cols-3 gap-3">
<button className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-2xl border border-primary-container/40 text-primary-fixed group transition-all" type="button">
<span className="material-symbols-outlined mb-2 group-hover:scale-110 transition-transform">bug_report</span>
<span className="text-xs font-medium">Bug</span>
</button>
<button className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-2xl border border-transparent hover:bg-surface-container-high text-on-surface-variant transition-all" type="button">
<span className="material-symbols-outlined mb-2">lightbulb</span>
<span className="text-xs font-medium">Feature</span>
</button>
<button className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-2xl border border-transparent hover:bg-surface-container-high text-on-surface-variant transition-all" type="button">
<span className="material-symbols-outlined mb-2">contact_support</span>
<span className="text-xs font-medium">Other</span>
</button>
</div>
</div>
<div className="space-y-2">
<label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Priority Level</label>
<select className="w-full bg-surface-container border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary text-on-surface appearance-none">
<option>Low (UI Polish)</option>
<option>Medium (Functional Gaps)</option>
<option>High (Workflow Blockers)</option>
<option className="text-error">Critical (System Downtime)</option>
</select>
</div>
</div>
<div className="space-y-2">
<label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Subject</label>
<input className="w-full bg-surface-container border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary text-on-surface" placeholder="Short summary of the issue..." type="text"/>
</div>
<div className="space-y-2">
<label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Detailed Description</label>
<textarea className="w-full bg-surface-container border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary text-on-surface" placeholder="Please describe the steps to reproduce or your specific suggestion..." rows="5"></textarea>
</div>

<div className="space-y-2">
<label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Attachments &amp; Screenshots</label>
<div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-surface-container/50 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-primary transition-colors">
<span className="material-symbols-outlined text-2xl">cloud_upload</span>
</div>
<div className="text-center">
<p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
<p className="text-xs text-on-surface-variant mt-1">PNG, JPG or PDF (max. 10MB)</p>
</div>
</div>
</div>
<div className="flex justify-end pt-4">
<button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold flex items-center gap-3 active:scale-95 transition-all shadow-lg shadow-primary-container/20" type="submit">
<span>Submit Report</span>
<span className="material-symbols-outlined text-lg">send</span>
</button>
</div>
</form>
</div>

<div className="col-span-12 lg:col-span-4 space-y-6">

<div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 shadow-xl">
<h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Active Tickets
                        </h4>
<div className="space-y-4">

<div className="group cursor-pointer">
<div className="flex items-start justify-between mb-2">
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container uppercase">In Review</span>
<span className="text-[10px] font-mono text-outline">#TIC-8842</span>
</div>
<h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">OCR Engine Latency in Batch Mode</h5>
<p className="text-xs text-on-surface-variant mt-1">Updated 2h ago by Support AI</p>
<div className="mt-3 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{}}></div>
</div>
</div>
<div className="h-[1px] bg-outline-variant/10 w-full"></div>

<div className="group cursor-pointer">
<div className="flex items-start justify-between mb-2">
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container uppercase">Pending</span>
<span className="text-[10px] font-mono text-outline">#TIC-8901</span>
</div>
<h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">Bulk Export to CSV Field Misalignment</h5>
<p className="text-xs text-on-surface-variant mt-1">Updated 5h ago</p>
</div>
<div className="h-[1px] bg-outline-variant/10 w-full"></div>

<div className="group cursor-pointer opacity-60">
<div className="flex items-start justify-between mb-2">
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant uppercase">Resolved</span>
<span className="text-[10px] font-mono text-outline">#TIC-8730</span>
</div>
<h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">Profile Avatar Upload Error</h5>
<p className="text-xs text-on-surface-variant mt-1">Closed 2 days ago</p>
</div>
</div>
<button className="w-full mt-8 py-3 text-xs font-bold text-primary-fixed hover:text-white transition-colors border-t border-outline-variant/10">
                            VIEW ALL TICKETS
                        </button>
</div>

<div className="bg-primary-container/10 rounded-3xl p-6 border border-primary-container/20">
<h4 className="text-sm font-bold text-primary-fixed mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-lg">fire_extinguisher</span>
                            Support Resources
                        </h4>
<div className="space-y-3">
<a className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl group" href="#" onClick={(e) => e.preventDefault()}>
<span className="text-xs font-medium text-on-surface">Knowledge Base</span>
<span className="material-symbols-outlined text-sm text-outline group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl group" href="#" onClick={(e) => e.preventDefault()}>
<span className="text-xs font-medium text-on-surface">API Documentation</span>
<span className="material-symbols-outlined text-sm text-outline group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl group" href="#" onClick={(e) => e.preventDefault()}>
<span className="text-xs font-medium text-on-surface">System Status</span>
<span className="material-symbols-outlined text-sm text-outline group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
</a>
</div>
</div>

<div className="relative overflow-hidden rounded-3xl p-6 group">
<div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] to-[#140f54] opacity-90"></div>
<img alt="Technical editorial background" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" data-alt="abstract tech circuitry pattern with glowing blue lines and deep indigo shadows in a macro shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJjiedDQegBzxIg_33fD1j41DyAvrhLkgJ8-dc0eBkJ1ZHavfs64EUOCk_BObSxfpWlyAf4J7poT6ZL3x_BLai1QdrR6sTa-2rLNX1tIFdw_RzhBvNHlDGkcRITVIf_rDGF7mdJZ6Yw5aJbgDWcSt8VpJLgJjaqgSB_krk7J5Q1lZjVtad_aihcTY43NhiDh9B5dEoAHdtldtcDAkWjrqd40kWmh44arPT3j-AmI13ST8dsK4a1coFKYn4oQqnq2ikMvfBRVgiksBw"/>
<div className="relative z-10">
<h4 className="text-white font-bold text-lg mb-1">Enterprise Support</h4>
<p className="text-indigo-100/70 text-xs mb-4">Dedicated account assistance available 24/7 for high-priority incidents.</p>
<button className="bg-white text-[#140f54] px-4 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all">
                                CHAT WITH AGENT
                            </button>
</div>
</div>
</div>
</div>
</div>



    </div>
  );
}