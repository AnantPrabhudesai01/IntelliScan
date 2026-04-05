import React from 'react';

export default function Gen404SystemErrorStates() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<div className="absolute inset-0 pointer-events-none overflow-hidden">
<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]"></div>
<div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[160px]"></div>
</div>
<div className="relative z-10 max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-20">

<div className="w-full md:w-1/2 flex flex-col items-center">
<div className="relative group">

<div className="w-64 h-64 md:w-80 md:h-80 bg-surface-container-low rounded-[2.5rem] flex items-center justify-center p-8 relative overflow-hidden group-hover:bg-surface-container transition-colors duration-500">

<div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent opacity-30"></div>

<div className="relative text-center">
<span className="font-headline font-black text-8xl md:text-9xl text-white tracking-tighter text-glow">404</span>
<div className="mt-2 h-1 w-20 bg-primary-container mx-auto rounded-full"></div>
</div>

<div className="absolute top-4 right-4 flex gap-1">
<div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
<div className="w-2 h-2 rounded-full bg-surface-variant"></div>
</div>
<div className="absolute bottom-6 left-6 right-6 h-12 border border-outline-variant/20 rounded-xl flex items-center px-4 gap-3 bg-surface-container-highest/30 backdrop-blur-sm">
<span className="material-symbols-outlined text-primary text-sm">troubleshoot</span>
<div className="flex-1 space-y-1">
<div className="h-1.5 w-full bg-outline-variant/30 rounded-full"></div>
<div className="h-1.5 w-2/3 bg-outline-variant/30 rounded-full"></div>
</div>
</div>
</div>

<div className="absolute -top-4 -right-4 bg-error-container text-on-error-container px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 shadow-xl shadow-black/40">
<span className="material-symbols-outlined text-sm" style={{}}>warning</span>
                        SYSTEM_EXCEPTION_0x404
                    </div>
</div>
</div>

<div className="w-full md:w-1/2 text-center md:text-left">


<div className="mb-10 group">
<div className="relative max-w-md">
<input className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search knowledge base or tools..." type="text"/>
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
<a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group border border-white/5" href="#" onClick={(e) => e.preventDefault()}>
<div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">dashboard</span>
</div>
<div className="text-left">
<div className="text-sm font-semibold text-white">Return Home</div>
<div className="text-xs text-on-surface-variant">Access your dashboard</div>
</div>
</a>
<a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group border border-white/5" href="/status">
<div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">analytics</span>
</div>
<div className="text-left">
<div className="text-sm font-semibold text-white">System Status</div>
<div className="text-xs text-on-surface-variant">View engine uptime</div>
</div>
</a>
<a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group border border-white/5" href="/support">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">help</span>
</div>
<div className="text-left">
<div className="text-sm font-semibold text-white">Get Support</div>
<div className="text-xs text-on-surface-variant">Contact enterprise help</div>
</div>
</a>
<a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group border border-white/5" href="/docs">
<div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">menu_book</span>
</div>
<div className="text-left">
<div className="text-sm font-semibold text-white">Documentation</div>
<div className="text-xs text-on-surface-variant">Read API references</div>
</div>
</a>
</div>
</div>
</div>



    </div>
  );
}