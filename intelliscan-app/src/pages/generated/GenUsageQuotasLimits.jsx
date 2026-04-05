import React from 'react';

export default function GenUsageQuotasLimits() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<div className="mb-10 flex justify-between items-end">
<div>
<nav className="flex gap-2 text-xs font-medium text-on-surface-variant mb-2 tracking-widest uppercase">
<span>Workspace</span>
<span>/</span>
<span>Billing</span>
<span>/</span>
<span className="text-primary">Usage</span>
</nav>
<h2 className="text-4xl font-extrabold tracking-tight text-white headline-md">Usage Quotas &amp; Limits</h2>
<p className="text-on-surface-variant mt-2 text-lg font-light leading-relaxed">Monitor your enterprise resource consumption across the IntelliScan ecosystem.</p>
</div>
<div className="flex gap-3">
<button className="bg-surface-container px-6 py-3 rounded-xl text-on-surface font-semibold hover:bg-surface-container-high transition-all flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="download">download</span> Export Report
                </button>
<button className="bg-primary-container px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-950/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="add_shopping_cart">add_shopping_cart</span> Purchase More
                </button>
</div>
</div>

<div className="mb-10 bg-error-container/10 border border-error-container/20 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-sm">
<div className="p-3 bg-error-container text-on-error-container rounded-xl">
<span className="material-symbols-outlined" data-icon="warning">warning</span>
</div>
<div className="flex-1">
<h4 className="text-on-error-container font-bold text-lg">Approaching Resource Limit</h4>
<p className="text-on-surface-variant text-sm mt-1">Your <strong>AI Scan Credits</strong> are at 92% of the monthly quota. Automated scaling is disabled. Please upgrade your plan or purchase additional credits to prevent service disruption.</p>
</div>
<button className="text-on-error-container text-sm font-bold underline decoration-2 underline-offset-4">Configure Auto-scale</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

<div className="bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden group hover:bg-surface-container transition-colors duration-500">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">AI Scan Credits</h3>
<p className="text-3xl font-black text-white">46,280 <span className="text-base font-medium text-on-surface-variant">/ 50k</span></p>
</div>
<span className="material-symbols-outlined text-primary p-2 bg-primary-container/10 rounded-lg" data-icon="auto_awesome">auto_awesome</span>
</div>
<div className="flex justify-center items-center py-4">
<div className="relative w-48 h-48">
<svg className="progress-ring w-full h-full">
<circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-primary-container progress-ring-circle" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" stroke-dasharray="502.65" stroke-dashoffset="35" strokeLinecap="round" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-4xl font-black text-white">92%</span>
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Consumed</span>
</div>
</div>
</div>
<div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs font-medium text-on-surface-variant">
<span>Cycle Ends: 14 Days</span>
<span className="text-error font-bold">Critical</span>
</div>
</div>

<div className="bg-surface-container-low rounded-[2rem] p-8 group hover:bg-surface-container transition-colors duration-500">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">OCR Minutes</h3>
<p className="text-3xl font-black text-white">1,402 <span className="text-base font-medium text-on-surface-variant">/ 5k</span></p>
</div>
<span className="material-symbols-outlined text-tertiary p-2 bg-tertiary-container/10 rounded-lg" data-icon="description">description</span>
</div>
<div className="flex justify-center items-center py-4">
<div className="relative w-48 h-48">
<svg className="progress-ring w-full h-full">
<circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-tertiary progress-ring-circle" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" stroke-dasharray="502.65" stroke-dashoffset="360" strokeLinecap="round" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-4xl font-black text-white">28%</span>
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Consumed</span>
</div>
</div>
</div>
<div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs font-medium text-on-surface-variant">
<span>Engine: OCR-V2 Pro</span>
<span className="text-tertiary font-bold">Optimal</span>
</div>
</div>

<div className="bg-surface-container-low rounded-[2rem] p-8 group hover:bg-surface-container transition-colors duration-500">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">Member Seats</h3>
<p className="text-3xl font-black text-white">42 <span className="text-base font-medium text-on-surface-variant">/ 50</span></p>
</div>
<span className="material-symbols-outlined text-on-secondary-container p-2 bg-secondary-container/20 rounded-lg" data-icon="group">group</span>
</div>
<div className="flex justify-center items-center py-4">
<div className="relative w-48 h-48">
<svg className="progress-ring w-full h-full">
<circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-secondary progress-ring-circle" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" stroke-dasharray="502.65" stroke-dashoffset="80" strokeLinecap="round" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-4xl font-black text-white">84%</span>
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Assigned</span>
</div>
</div>
</div>
<div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs font-medium text-on-surface-variant">
<span>Managed via SSO</span>
<span className="text-primary font-bold">High</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
<div className="lg:col-span-3 bg-surface-container-low rounded-[2rem] p-8">
<div className="flex justify-between items-center mb-10">
<div>
<h3 className="text-xl font-bold text-white tracking-tight">Resource Utilization Trends</h3>
<p className="text-on-surface-variant text-sm">Aggregated daily usage across all service endpoints.</p>
</div>
<div className="flex bg-surface-container p-1 rounded-xl">
<button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-surface-container-high shadow-sm">Daily</button>
<button className="px-4 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-white transition-colors">Weekly</button>
</div>
</div>

<div className="flex items-end justify-between h-64 gap-2 px-2">
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[40%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Mon</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[55%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Tue</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[45%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Wed</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[75%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Thu</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[90%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Fri</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[30%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Sat</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-secondary-container/40 rounded-t-lg h-[25%] group-hover:bg-primary-container transition-all"></div>
<span className="text-[10px] text-on-surface-variant font-bold mt-4 uppercase">Sun</span>
</div>
<div className="flex flex-col items-center flex-1 group">
<div className="w-full bg-primary-container rounded-t-lg h-[95%] group-hover:opacity-80 transition-all"></div>
<span className="text-[10px] text-primary font-bold mt-4 uppercase">Today</span>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between">
<div>
<h3 className="text-xl font-bold text-white tracking-tight mb-4">Plan Details</h3>
<div className="space-y-6">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-icon="verified">verified</span>
<div>
<p className="text-sm font-bold text-on-surface">Pro Enterprise</p>
<p className="text-xs text-on-surface-variant">$2,400 / Month</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-icon="shield_with_heart">shield_with_heart</span>
<div>
<p className="text-sm font-bold text-on-surface">Priority Support</p>
<p className="text-xs text-on-surface-variant">2h Response Time</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-icon="hub">hub</span>
<div>
<p className="text-sm font-bold text-on-surface">API Clusters</p>
<p className="text-xs text-on-surface-variant">Unlimited</p>
</div>
</div>
</div>
</div>
<div className="pt-6 mt-6 border-t border-white/5">
<button className="w-full bg-surface-container-highest text-white py-3 rounded-xl font-bold text-sm hover:bg-surface-bright transition-all">
                        Upgrade Tier
                    </button>
</div>
</div>
</div>

<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-surface-container-low rounded-[2rem] p-8">
<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="psychology">psychology</span>
                    Processing Confidence
                </h3>
<div className="space-y-5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="px-2 py-1 bg-secondary-container/30 text-[10px] font-mono text-secondary rounded">OCR-V2</span>
<span className="text-sm font-medium text-on-surface">Financial Docs</span>
</div>
<span className="bg-tertiary-container/20 text-tertiary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">99.2% High</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="px-2 py-1 bg-secondary-container/30 text-[10px] font-mono text-secondary rounded">OCR-V2</span>
<span className="text-sm font-medium text-on-surface">Medical Records</span>
</div>
<span className="bg-tertiary-container/20 text-tertiary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">94.8% High</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="px-2 py-1 bg-secondary-container/30 text-[10px] font-mono text-secondary rounded">VIS-A1</span>
<span className="text-sm font-medium text-on-surface">Handwritten Notes</span>
</div>
<span className="bg-error-container/20 text-error text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">58.3% Low</span>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-[2rem] p-8 flex items-center justify-between gap-8 relative overflow-hidden">
<div className="relative z-10">
<h3 className="text-2xl font-black text-white headline-md mb-2">Need a custom plan?</h3>
<p className="text-on-surface-variant text-sm mb-6 max-w-xs">Our enterprise specialists can tailor a usage quota specifically for your high-volume requirements.</p>
<button className="bg-white text-background px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all">Talk to Sales</button>
</div>
<div className="relative w-40 h-40 flex-shrink-0">
<div className="absolute inset-0 bg-primary-container rounded-full blur-3xl opacity-20"></div>
<img className="w-full h-full object-cover rounded-[2rem] relative z-10" data-alt="vibrant neon 3D geometric nodes connecting in a neural network style with glowing indigo and violet lights on black background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkCTxu7PBp5sGBTu57aTS-_b0rJr8faBFpCfoVtWsQsoIrRMgb9RiUfcgHF30C_yAgYWxdwdRQbLkj-ImT471Q8YeW_8TSiG-3O6kBrG5YDduyqO_pyoMooZuYFnaf6npi0abFA4AbDK_ocVlYrcie709MUbQzGV2mfOEquRNbb91Zq9wjNNgTYSD1Z3_PM8r823t28IxfDVum6UGkNlj_z8XipEWa6rLNZUCWKdeKoM_tY9xf0mNKF76vqV-cw-dVt9_50mIy27PO"/>
</div>
</div>
</div>

    </div>
  );
}