import React from 'react';

export default function GenHelpCenterDocs() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<section className="relative overflow-hidden py-24 px-8 flex flex-col items-center justify-center text-center">
<div className="absolute inset-0 z-0">
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-container/10 blur-[120px] rounded-full"></div>
</div>
<div className="relative z-10 max-w-3xl w-full">
<h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">How can we help?</h1>
<p className="text-on-surface-variant text-lg mb-10 max-w-xl mx-auto">Search our comprehensive guides for everything from OCR setup to advanced AI engine tuning.</p>
<div className="glass-effect p-2 rounded-2xl flex items-center gap-3 border border-outline-variant/10 shadow-2xl">
<span className="material-symbols-outlined text-primary ml-4" data-icon="search">search</span>
<input className="bg-transparent border-none w-full py-4 text-lg focus:ring-0 text-on-surface outline-none" placeholder="Search for articles, API endpoints, or tutorials..." type="text"/>
<button className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-primary-container/90">Search</button>
</div>
<div className="mt-6 flex flex-wrap justify-center gap-3">
<span className="text-sm text-on-surface-variant">Popular:</span>
<a className="text-sm text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>API Authentication</a>
<a className="text-sm text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Batch Processing</a>
<a className="text-sm text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Billing FAQ</a>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-8 py-20">
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

<div className="md:col-span-2 bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container-high transition-all cursor-pointer">
<div className="flex justify-between items-start mb-12">
<div className="bg-primary-container/20 p-4 rounded-2xl">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="rocket_launch">rocket_launch</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
<h3 className="font-headline text-2xl font-bold text-white mb-3">Getting Started</h3>
<p className="text-on-surface-variant leading-relaxed">Everything you need to set up your account and trigger your first scan in under 5 minutes.</p>
</div>

<div className="md:col-span-2 bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container-high transition-all cursor-pointer">
<div className="flex justify-between items-start mb-12">
<div className="bg-tertiary-container/20 p-4 rounded-2xl">
<span className="material-symbols-outlined text-tertiary text-3xl" data-icon="neurology">neurology</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
<h3 className="font-headline text-2xl font-bold text-white mb-3">AI Engine Configuration</h3>
<p className="text-on-surface-variant leading-relaxed">Deep dive into OCR models, confidence thresholds, and custom training parameters.</p>
</div>

<div className="md:col-span-1 bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container-high transition-all cursor-pointer">
<div className="mb-12 bg-secondary-container/20 w-fit p-4 rounded-2xl">
<span className="material-symbols-outlined text-secondary text-3xl" data-icon="groups">groups</span>
</div>
<h3 className="font-headline text-xl font-bold text-white mb-3">Teams</h3>
<p className="text-on-surface-variant text-sm">Roles, permissions, and collaborative workflows.</p>
</div>

<div className="md:col-span-1 bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container-high transition-all cursor-pointer">
<div className="mb-12 bg-surface-variant/40 w-fit p-4 rounded-2xl">
<span className="material-symbols-outlined text-on-surface text-3xl" data-icon="payments">payments</span>
</div>
<h3 className="font-headline text-xl font-bold text-white mb-3">Billing</h3>
<p className="text-on-surface-variant text-sm">Subscriptions, credit usage, and invoice history.</p>
</div>

<div className="md:col-span-2 bg-surface-container-low p-8 rounded-3xl flex flex-row items-center gap-8 group hover:bg-surface-container-high transition-all cursor-pointer">
<div className="bg-error-container/20 p-4 rounded-2xl">
<span className="material-symbols-outlined text-error text-3xl" data-icon="verified_user">verified_user</span>
</div>
<div>
<h3 className="font-headline text-xl font-bold text-white mb-1">Security &amp; Privacy</h3>
<p className="text-on-surface-variant text-sm">Data encryption and SOC2 compliance documents.</p>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-lowest py-24">
<div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
<div>
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Developer First
                    </div>
<h2 className="font-headline text-4xl font-extrabold text-white mb-6 leading-tight">Built by developers,<br/>for developers.</h2>
<p className="text-on-surface-variant text-lg mb-8 leading-relaxed">Our robust REST API allows you to integrate IntelliScan into your existing stack with just a few lines of code. Access OCR data, confidence scores, and raw metadata programmatically.</p>
<ul className="space-y-4 mb-10">
<li className="flex items-center gap-3 text-on-surface">
<span className="material-symbols-outlined text-primary" data-icon="check_circle">check_circle</span>
                            Official SDKs for Node, Python, and Go
                        </li>
<li className="flex items-center gap-3 text-on-surface">
<span className="material-symbols-outlined text-primary" data-icon="check_circle">check_circle</span>
                            99.99% API Uptime SLA
                        </li>
<li className="flex items-center gap-3 text-on-surface">
<span className="material-symbols-outlined text-primary" data-icon="check_circle">check_circle</span>
                            Webhooks for real-time event updates
                        </li>
</ul>
<button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                        Explore API Reference
                        <span className="material-symbols-outlined" data-icon="arrow_right_alt">arrow_right_alt</span>
</button>
</div>
<div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl">
<div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-b border-outline-variant/10">
<div className="flex gap-2">
<div className="w-3 h-3 rounded-full bg-red-500/30"></div>
<div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
<div className="w-3 h-3 rounded-full bg-green-500/30"></div>
</div>
<span className="text-xs font-mono text-on-surface-variant">scan_document.py</span>
</div>
<div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">1</span>
<span className="text-[#4f46e5]">import</span> <span className="text-white">intelliscan</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">2</span>
<span>  </span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">3</span>
<span className="text-white">client = intelliscan.<span className="text-[#c3c0ff]">Client</span>(api_key=<span className="text-[#a44100]">"sk_live_..."</span>)</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">4</span>
<span>  </span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">5</span>
<span className="text-[#c7c4d8]"># Process document with high-precision engine</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">6</span>
<span className="text-white">result = client.scans.<span className="text-[#c3c0ff]">create</span>({"{"}</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">7</span>
<span className="text-white">    <span className="text-[#c3c0ff]">"file"</span>: <span className="text-[#a44100]">"invoice_9921.pdf"</span>,</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">8</span>
<span className="text-white">    <span className="text-[#c3c0ff]">"engine"</span>: <span className="text-[#a44100]">"ocr-v2-premium"</span>,</span>
</div>
<div className="flex gap-4 mb-2">
<span className="text-outline-variant select-none">9</span>
<span className="text-white">    <span className="text-[#c3c0ff]">"webhook_url"</span>: <span className="text-[#a44100]">"https://api.yourdomain.com/v1"</span></span>
</div>
<div className="flex gap-4">
<span className="text-outline-variant select-none">10</span>
<span className="text-white">{"}"})</span>
</div>
</div>
<div className="bg-surface-container-high px-8 py-4 flex items-center justify-between border-t border-outline-variant/10">
<span className="text-xs text-on-surface-variant italic">Powered by OCR-V2 Premium Engine</span>
<div className="bg-tertiary-container text-on-tertiary-container text-[10px] px-2 py-0.5 rounded font-mono font-bold">CONFIDENCE 99.8%</div>
</div>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-8 py-24">
<h2 className="font-headline text-3xl font-bold text-white mb-12">Latest Technical Guides</h2>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
<div className="space-y-6">
<h4 className="text-primary font-bold uppercase tracking-widest text-xs">Recent Updates</h4>
<div className="space-y-4">
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">Introducing OCR-V3 Hybrid Engine</h5>
<p className="text-sm text-on-surface-variant">Enhanced recognition for handwritten forms and cursive text.</p>
</a>
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">New API Endpoint: /batch-export</h5>
<p className="text-sm text-on-surface-variant">Export up to 10,000 scanned entities in a single JSON payload.</p>
</a>
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">SOC2 Type II Report Available</h5>
<p className="text-sm text-on-surface-variant">Download our latest security compliance audit from the dashboard.</p>
</a>
</div>
</div>
<div className="space-y-6">
<h4 className="text-tertiary font-bold uppercase tracking-widest text-xs">Best Practices</h4>
<div className="space-y-4">
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">Optimizing Confidence Scores</h5>
<p className="text-sm text-on-surface-variant">How to set automated workflows based on AI confidence levels.</p>
</a>
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">Improving Scan Quality</h5>
<p className="text-sm text-on-surface-variant">A guide to image preprocessing and DPI recommendations.</p>
</a>
<a className="block p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10" href="#" onClick={(e) => e.preventDefault()}>
<h5 className="text-on-surface font-semibold mb-1">Managing High-Volume Keys</h5>
<p className="text-sm text-on-surface-variant">Rotating API keys without interrupting production traffic.</p>
</a>
</div>
</div>
<div className="relative rounded-3xl overflow-hidden group">
<img alt="Cybersecurity grid" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" data-alt="abstract close-up of a high-tech glowing computer circuit board with neon blue lines and dark metallic surfaces" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFyw3f68mBNKVWPFbYmmm9BQHb1ZsrehiF7JfOgB9b608XN3UdaR2Lj9-YwB8MK4s2hkfOuUfU3UGow3Cihnx4ARgscBT0Mi_X49jPlqmN2Drubt_LoVy1FpnV41LVplTnw3BVIkqG2os3LK596ZHOtDWgtNcsDZ3m1g-IPfTqexm3S79TGNjveW6CZ64yfKxtNraIIvoK6MwiqmwOCtI4sswEJXLfPN-7mYYwyD9-h4JRUeewQ-wCw0_1gAdF8Hzsb7vFLWE8WF25"/>
<div className="relative z-10 p-8 h-full flex flex-col justify-end bg-gradient-to-t from-surface to-transparent">
<h4 className="text-white text-2xl font-bold mb-4">Integrate IntelliScan with Slack &amp; Zapier</h4>
<p className="text-on-surface-variant mb-6 text-sm">Automate your document processing pipeline with our no-code integrations.</p>
<button className="bg-white/10 backdrop-blur-md text-white border border-white/20 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">Read Integration Guide</button>
</div>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-8 py-20">
<div className="bg-primary-container rounded-[2rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
<div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[80px] rounded-full"></div>
<div className="relative z-10 max-w-lg text-center md:text-left">
<h2 className="font-headline text-4xl font-extrabold text-white mb-4">Still need help?</h2>
<p className="text-on-primary-container text-lg">Our technical support engineers are available 24/7 for Enterprise customers and during business hours for all users.</p>
</div>
<div className="relative z-10 flex flex-col sm:flex-row gap-4">
<button className="bg-white text-[#4f46e5] px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-on-primary-container transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="mail">mail</span>
                        Email Support
                    </button>
<button className="bg-primary-fixed-variant border-2 border-white/20 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="chat">chat</span>
                        Live Chat
                    </button>
</div>
</div>
</section>

    </div>
  );
}