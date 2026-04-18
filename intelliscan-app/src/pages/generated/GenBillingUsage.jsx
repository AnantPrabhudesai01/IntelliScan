import React from 'react';

export default function GenBillingUsage() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="p-6 md:p-10 max-w-7xl mx-auto">


<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-9xl">auto_awesome</span>
</div>
<div className="relative z-10">
<div className="flex items-center gap-3 mb-6">
<span className="px-3 py-1 bg-primary-container/20 text-primary-fixed text-xs font-bold tracking-widest uppercase rounded-full border border-primary-container/30">Current Plan</span>
<span className="text-on-surface-variant text-sm">Renews on Oct 12, 2024</span>
</div>
<h3 className="text-4xl font-bold text-white mb-2">Pro Team</h3>
<p className="text-on-surface-variant max-w-md mb-8">Unleash full AI potential with advanced OCR engines, multi-user collaboration, and priority processing.</p>
<div className="flex flex-wrap gap-4">
<button className="px-6 py-3 bg-primary-container text-white rounded-xl font-bold transition-all hover:brightness-110 active:scale-95">
                                Upgrade to Enterprise
                            </button>
<button className="px-6 py-3 bg-surface-container-highest text-white rounded-xl font-bold transition-all hover:bg-surface-container-high active:scale-95">
                                Manage Subscription
                            </button>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-8 space-y-8">
<h4 className="text-lg font-bold text-white">Usage This Month</h4>

<div className="space-y-3">
<div className="flex justify-between items-end">
<label className="text-sm font-semibold text-on-surface-variant">AI Scans</label>
<span className="text-sm font-bold text-white">8,432 <span className="text-on-surface-variant font-normal">/ 10,000</span></span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{}}></div>
</div>
<p className="text-[11px] text-on-surface-variant">84% of your monthly quota used.</p>
</div>

<div className="space-y-3">
<div className="flex justify-between items-end">
<label className="text-sm font-semibold text-on-surface-variant">Team Members</label>
<span className="text-sm font-bold text-white">12 <span className="text-on-surface-variant font-normal">/ 20</span></span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary text-on-secondary rounded-full" style={{}}></div>
</div>
<p className="text-[11px] text-on-surface-variant">8 seats remaining on your current plan.</p>
</div>
<div className="pt-4 border-t border-outline-variant/10">
<a className="text-primary text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all" href="#" onClick={(e) => e.preventDefault()}>
                            View detailed analytics <span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
</div>

<div className="lg:col-span-1 bg-surface-container-low rounded-xl p-8">
<div className="flex justify-between items-center mb-6">
<h4 className="text-lg font-bold text-white">Payment Methods</h4>
<button className="text-primary text-xs font-bold uppercase tracking-wider">Add New</button>
</div>
<div className="space-y-4">
<div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10 flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-8 bg-surface-container-highest rounded flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
</div>
<div>
<p className="text-sm font-bold text-white">•••• 4242</p>
<p className="text-[11px] text-on-surface-variant">Expires 12/26</p>
</div>
</div>
<span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary font-bold text-[10px] rounded uppercase tracking-tighter">Default</span>
</div>
<div className="p-4 bg-surface-container/40 rounded-xl border border-outline-variant/5 flex items-center justify-between opacity-60">
<div className="flex items-center gap-4">
<div className="w-12 h-8 bg-surface-container-highest rounded flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
</div>
<div>
<p className="text-sm font-bold text-white">Bank Account</p>
<p className="text-[11px] text-on-surface-variant">Ending in 8890</p>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-2 bg-surface-container-low rounded-xl overflow-hidden">
<div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
<h4 className="text-lg font-bold text-white">Billing History</h4>
<button className="p-2 text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined">download</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest bg-surface-container/30">
<th className="px-8 py-4">Invoice ID</th>
<th className="px-8 py-4">Date</th>
<th className="px-8 py-4">Amount</th>
<th className="px-8 py-4">Status</th>
<th className="px-8 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="px-8 py-5 text-sm font-medium text-white">INV-2024-009</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Sep 12, 2024</td>
<td className="px-8 py-5 text-sm font-bold text-white">$249.00</td>
<td className="px-8 py-5">
<span className="px-2.5 py-1 bg-tertiary-container/10 text-tertiary text-[11px] font-bold rounded-full border border-tertiary-container/20">Paid</span>
</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline text-xs font-bold">PDF</button>
</td>
</tr>
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="px-8 py-5 text-sm font-medium text-white">INV-2024-008</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Aug 12, 2024</td>
<td className="px-8 py-5 text-sm font-bold text-white">$249.00</td>
<td className="px-8 py-5">
<span className="px-2.5 py-1 bg-tertiary-container/10 text-tertiary text-[11px] font-bold rounded-full border border-tertiary-container/20">Paid</span>
</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline text-xs font-bold">PDF</button>
</td>
</tr>
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="px-8 py-5 text-sm font-medium text-white">INV-2024-007</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Jul 12, 2024</td>
<td className="px-8 py-5 text-sm font-bold text-white">$212.40</td>
<td className="px-8 py-5">
<span className="px-2.5 py-1 bg-tertiary-container/10 text-tertiary text-[11px] font-bold rounded-full border border-tertiary-container/20">Paid</span>
</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline text-xs font-bold">PDF</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>


</div>

    </div>
  );
}
