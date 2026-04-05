import React from 'react';

export default function GenStrategicAccountReviews() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

<div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-6 relative overflow-hidden group">
<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-8xl" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Total Workspace ROI</h3>
<div className="flex items-baseline gap-2 mb-2">
<span className="text-5xl font-extrabold text-white tracking-tighter">$4.2M</span>
<span className="text-primary font-bold text-sm">+14% QoQ</span>
</div>
<p className="text-on-surface-variant text-sm mb-6">Estimated savings based on manual process automation throughput.</p>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[72%]"></div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
<div>
<h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">User Adoption</h3>
<div className="text-3xl font-bold text-white mb-1">88.4%</div>
<div className="flex items-center gap-1 text-primary text-xs font-bold">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
<span>Active Growth</span>
</div>
</div>
<div className="flex gap-1 mt-6 items-end h-12">
<div className="w-full bg-primary-container/20 h-[40%] rounded-t-sm"></div>
<div className="w-full bg-primary-container/20 h-[60%] rounded-t-sm"></div>
<div className="w-full bg-primary-container/20 h-[55%] rounded-t-sm"></div>
<div className="w-full bg-primary-container/20 h-[80%] rounded-t-sm"></div>
<div className="w-full bg-primary-container h-full rounded-t-sm"></div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
<div>
<h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Scan Volume</h3>
<div className="text-3xl font-bold text-white mb-1">1.2M</div>
<div className="text-on-surface-variant text-xs font-medium">Across 14 Workspaces</div>
</div>
<div className="mt-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        Peak Capacity 92%
                    </span>
</div>
</div>
</section>

<section className="bg-surface-container-low rounded-xl overflow-hidden">
<div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
<h3 className="font-headline font-bold text-lg text-white">Active Accounts Health</h3>
<div className="flex items-center gap-4">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" data-icon="search">search</span>
<input className="bg-surface-container border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 placeholder:text-outline/50" placeholder="Filter entities..." type="text"/>
</div>
<button className="p-2 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined" data-icon="filter_list">filter_list</span></button>
</div>
</div>
<div className="overflow-x-auto no-scrollbar">
<table className="w-full text-left border-collapse">
<thead>
<tr className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest bg-surface-container-lowest/50">
<th className="px-8 py-4">Account Entity</th>
<th className="px-6 py-4">Intelligence Model</th>
<th className="px-6 py-4">Health Score</th>
<th className="px-6 py-4">Monthly Scan Vol</th>
<th className="px-6 py-4 text-right">Confidence</th>
<th className="px-8 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="group hover:bg-surface-container-high/50 transition-all duration-200">
<td className="px-8 py-5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">GN</div>
<div>
<div className="text-sm font-bold text-white">Global Nexus Corp</div>
<div className="text-xs text-on-surface-variant">Active since Oct 2023</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded-md bg-secondary-container/20 text-on-secondary-container text-[10px] font-mono font-bold uppercase">OCR-ULTRA-V4</span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="flex-1 h-1.5 w-16 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 w-[94%]"></div>
</div>
<span className="text-xs font-bold text-white">94</span>
</div>
</td>
<td className="px-6 py-5">
<div className="text-sm font-medium text-white">442,102</div>
<div className="text-[10px] text-primary font-bold">↑ 12.4%</div>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2 py-1 rounded-md bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">98.2% CI</span>
</td>
<td className="px-8 py-5 text-right">
<button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="group hover:bg-surface-container-high/50 transition-all duration-200">
<td className="px-8 py-5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">VS</div>
<div>
<div className="text-sm font-bold text-white">Vanguard Systems</div>
<div className="text-xs text-on-surface-variant">Active since Jan 2024</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded-md bg-secondary-container/20 text-on-secondary-container text-[10px] font-mono font-bold uppercase">LLM-EXTRACT-BETA</span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="flex-1 h-1.5 w-16 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-amber-500 w-[62%]"></div>
</div>
<span className="text-xs font-bold text-white">62</span>
</div>
</td>
<td className="px-6 py-5">
<div className="text-sm font-medium text-white">128,990</div>
<div className="text-[10px] text-error font-bold">↓ 3.1%</div>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2 py-1 rounded-md bg-error-container text-on-error-container text-[10px] font-bold">58.4% CI</span>
</td>
<td className="px-8 py-5 text-right">
<button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="group hover:bg-surface-container-high/50 transition-all duration-200">
<td className="px-8 py-5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">TC</div>
<div>
<div className="text-sm font-bold text-white">Titan Capital</div>
<div className="text-xs text-on-surface-variant">Active since Aug 2022</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded-md bg-secondary-container/20 text-on-secondary-container text-[10px] font-mono font-bold uppercase">OCR-HYBRID-V2</span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="flex-1 h-1.5 w-16 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 w-[89%]"></div>
</div>
<span className="text-xs font-bold text-white">89</span>
</div>
</td>
<td className="px-6 py-5">
<div className="text-sm font-medium text-white">892,114</div>
<div className="text-[10px] text-primary font-bold">↑ 22.8%</div>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2 py-1 rounded-md bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">94.1% CI</span>
</td>
<td className="px-8 py-5 text-right">
<button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="px-8 py-4 bg-surface-container-lowest/30 flex items-center justify-between text-xs text-on-surface-variant font-medium">
<div>Showing 3 of 14 Enterprise Entities</div>
<div className="flex gap-2">
<button className="p-1 hover:text-white transition-colors"><span className="material-symbols-outlined" data-icon="keyboard_arrow_left">keyboard_arrow_left</span></button>
<button className="p-1 text-white font-bold px-2 bg-surface-container rounded">1</button>
<button className="p-1 hover:text-white transition-colors px-2">2</button>
<button className="p-1 hover:text-white transition-colors"><span className="material-symbols-outlined" data-icon="keyboard_arrow_right">keyboard_arrow_right</span></button>
</div>
</div>
</section>

<section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
<div className="relative z-10">
<h4 className="text-xl font-bold font-headline text-white mb-2">Workspace Optimization Needed</h4>
<p className="text-on-surface-variant text-sm mb-6 max-w-xl">Our analysis detects low confidence scores across the "Vanguard Systems" entity. Recommended action: Upgrade to OCR-ULTRA-V4 or initiate engine recalibration.</p>
<button className="bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-bold px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2">
<span>Deploy Recalibration</span>
<span className="material-symbols-outlined text-sm" data-icon="auto_fix_high">auto_fix_high</span>
</button>
</div>
<div className="absolute right-0 top-0 h-full w-1/3 opacity-40 mix-blend-overlay">
<img alt="Abstract tech background" className="h-full w-full object-cover" data-alt="Abstract 3D rendering of flowing data lines and glowing nodes in shades of deep indigo and electric purple" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5VZZdEj8lW_fiizbCkOgXK_GDPsROO_ysdgYlH5cHc99rJoJniHEzNmz_Pl0xk6LdBe2dGYhqyNY3KCp7GZs-VTYdoAzSxQtigHZk4BLWX7C1PYrWn5BuAUtnWfjDRDArybWuWAlziuqi5hJDKL16XwJd9s4mdoR0Ed6lbGsegNl8gZl0NsMQ3tddHEfBpcK7zFlNnG5jF8iRnw4Z0WOmhyQ5ujcel3-aFJsCdIM8HG7aQE4VjSniCQ91G5vqEn6Oc0iHzUvPvI3X"/>
</div>
</div>
<div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-8 flex flex-col justify-center glass-card">
<div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
<span className="material-symbols-outlined text-indigo-400" data-icon="shield_with_heart" data-weight="fill" style={{}}>shield_with_heart</span>
</div>
<h4 className="text-lg font-bold text-white mb-2">Compliance Alert</h4>
<p className="text-on-surface-variant text-xs leading-relaxed mb-4">3 accounts require updated SOC2 data processing addendums. Onboarding progress for "Global Nexus" is at 82%.</p>
<a className="text-primary text-xs font-bold flex items-center gap-1 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    View Compliance Manager
                    <span className="material-symbols-outlined text-[10px]" data-icon="open_in_new">open_in_new</span>
</a>
</div>
</section>

    </div>
  );
}