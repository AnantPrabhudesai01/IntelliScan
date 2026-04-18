import React from 'react';

export default function GenAdvancedSegmentBuilder() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="grid grid-cols-12 gap-6">

<section className="col-span-12 lg:col-span-8 space-y-6">

<div className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-secondary-container/30 flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="filter_alt">filter_alt</span>
</div>
<h2 className="text-xl font-bold text-white">Logic Engine</h2>
</div>
<div className="flex items-center bg-surface-container rounded-lg p-1">
<button className="px-4 py-1.5 bg-primary-container text-xs font-bold rounded-md shadow-sm">AND</button>
<button className="px-4 py-1.5 text-on-surface-variant text-xs font-bold hover:text-white transition-colors">OR</button>
</div>
</div>

<div className="space-y-4">

<div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/5">
<div className="flex-1 grid grid-cols-3 gap-4">
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Attribute</label>
<select className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40">
<option>Confidence Score</option>
<option>Industry</option>
<option>Lead Source</option>
<option>Last Activity</option>
</select>
</div>
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Operator</label>
<select className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40">
<option>Greater Than (&gt;)</option>
<option>Less Than (&lt;)</option>
<option>Equals (=)</option>
</select>
</div>
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Value</label>
<input className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40" type="text" value="0.90"/>
</div>
</div>
<button className="p-2 text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
<div className="flex justify-center -my-2 relative z-10">
<div className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-black text-primary border border-outline-variant/20 uppercase tracking-widest">AND</div>
</div>

<div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/5">
<div className="flex-1 grid grid-cols-3 gap-4">
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Attribute</label>
<select className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40">
<option>Industry</option>
<option>Confidence Score</option>
<option>Lead Source</option>
</select>
</div>
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Operator</label>
<select className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40">
<option>Equals (=)</option>
<option>Contains</option>
<option>Does Not Equal (!=)</option>
</select>
</div>
<div className="relative">
<label className="absolute -top-2 left-3 px-1 bg-surface-container text-[10px] font-bold text-primary uppercase tracking-tighter">Value</label>
<input className="w-full bg-surface-container-high border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40" type="text" value="Fintech"/>
</div>
</div>
<button className="p-2 text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined">delete</span>
</button>
</div>

<button className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold flex items-center justify-center gap-2 group">
<span className="material-symbols-outlined group-hover:rotate-90 transition-transform" data-icon="add">add</span>
                            Add Condition Clause
                        </button>
</div>
</div>

<div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm">
<div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="visibility">visibility</span>
<h3 className="font-bold text-lg">Real-time Preview</h3>
<span className="ml-2 px-2 py-0.5 bg-tertiary-container/20 text-tertiary text-[10px] font-bold rounded uppercase tracking-tighter">1,248 Matched</span>
</div>
<div className="flex items-center gap-2">
<span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest mr-2">Sort by</span>
<button className="text-sm font-semibold text-primary flex items-center gap-1">
                                Confidence
                                <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/30 text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.15em]">
<th className="px-6 py-4">Contact Entity</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4">Engine</th>
<th className="px-6 py-4 text-right">Confidence</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full overflow-hidden bg-surface-variant">
<img alt="Executive profile" className="w-full h-full object-cover" data-alt="professional portrait of a middle-aged male executive in a dark suit with neutral studio lighting and gray background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrFrGKLz5oDHfNrL1PSd_kJbPbQhpCSbQHsRIPstK9G07IZcWyPBXtjsp8SfnOk885WF5pvlo72F4GvTXZjXvIaLPrm-1TWi9NdXcfoiSQfcYOOPq7ednBe0e2sSBLAxcbIybqh7PBsrrs39XmmZy8Jr7FKHHMjwccNNaDN7LRZ9Nw6Ejq1eEH7TiFYwgH8OJPA_CT1vBdb1IPEpbX3aWt88LLSPycBkCoG3XdqNqgI65I1zqpf3FcDs84g6suwL0jljZCPdJsrixC"/>
</div>
<div>
<div className="font-bold text-sm group-hover:text-primary transition-colors">Alex Rivera</div>
<div className="text-xs text-on-surface-variant">CTO, Nexus Dynamics</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-tighter">Fintech</span>
</td>
<td className="px-6 py-5">
<span className="font-mono text-[10px] bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded">OCR-V2.5</span>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2.5 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-lg shadow-sm">98.4%</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full overflow-hidden bg-surface-variant">
<img alt="Executive profile" className="w-full h-full object-cover" data-alt="smiling young professional woman with auburn hair in a modern sunlit office environment with soft focus greenery" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIc6qGgsq08SIEXuGfLYrOVnk__GoZI8WM2tDadkIe2zKlNodsCah2MCdAimm9fHFr3t5d8XIfZArJQb5Va-syF2UAzGSbr0665ltda2ymPPdfXKh_1p1QW21PzIAhlO8gNNyfEYK8VIdW68GcTZtflnEZ-kZcXpBPgnWxZXTgo3UBBvTkD94Lp4uQfgPP4wdY-WXokjfwEaSGxio-d6zUurg5pa9_fyeY0C6Hf7uBmVhMVKl-9agtLlLqiNmXfhNQKKzhfGX8--X7"/>
</div>
<div>
<div className="font-bold text-sm group-hover:text-primary transition-colors">Sarah Chen</div>
<div className="text-xs text-on-surface-variant">Head of Growth, FinLeap</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-tighter">Fintech</span>
</td>
<td className="px-6 py-5">
<span className="font-mono text-[10px] bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded">GPT-4-LENS</span>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2.5 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-lg shadow-sm">94.1%</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group border-none">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full overflow-hidden bg-surface-variant">
<img alt="Executive profile" className="w-full h-full object-cover" data-alt="close-up of a creative director with glasses in a minimalist architectural space with dramatic high contrast lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEUydxtCY6FfbquRFeI2HmB1AGmDTjbTFs8ZotmtPHIlNlfnDmvxOqQ7H7Waeufp_c_sbvxUbSmCxx5HBV_WoQbROp0I1vw5n9PBjTrjcB7UsWUpZEXibsD-jyo7wvDBuKAgNufQuP6yBCcoDdhn1Kb_u7AZ28MNhU1VyXKAVWN5ZY2BuahlEm2O01n4fmxtcRiu9NIosvA_UlK6j8lUX63Qz3Oy1cgMtZUBIx8pa61DaM00g0zfzyU49nnnLcxgtYfcNalJ3WqOn1"/>
</div>
<div>
<div className="font-bold text-sm group-hover:text-primary transition-colors">Marcus Thorne</div>
<div className="text-xs text-on-surface-variant">Compliance VP, StellarPay</div>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-tighter">Fintech</span>
</td>
<td className="px-6 py-5">
<span className="font-mono text-[10px] bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded">OCR-V2.5</span>
</td>
<td className="px-6 py-5 text-right">
<span className="px-2.5 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-lg shadow-sm">91.7%</span>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-4 bg-surface-container/20 flex justify-center border-t border-outline-variant/10">
<button className="text-xs font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors">Show All 1,248 Matches</button>
</div>
</div>
</section>


</div>

    </div>
  );
}
