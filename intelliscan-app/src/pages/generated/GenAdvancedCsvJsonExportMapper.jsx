import React from 'react';

export default function GenAdvancedCsvJsonExportMapper() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
<div className="space-y-2">
<div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
<span className="material-symbols-outlined text-base" data-icon="arrow_back">arrow_back</span>
                        Back to Workspace
                    </div>
<h2 className="text-4xl font-extrabold font-headline tracking-tight text-white">Export Mapper</h2>
<p className="text-on-surface-variant font-body max-w-xl">Configure how your IntelliScan intelligence maps to external systems. Define field logic, validation rules, and export schema.</p>
</div>
<div className="flex gap-3">
<div className="flex flex-col items-end gap-2">
<span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Target System</span>
<div className="flex bg-surface-container p-1 rounded-xl">
<button className="px-4 py-1.5 bg-primary-container text-white rounded-lg text-xs font-semibold">Salesforce</button>
<button className="px-4 py-1.5 text-on-surface-variant hover:text-white rounded-lg text-xs font-semibold">HubSpot</button>
<button className="px-4 py-1.5 text-on-surface-variant hover:text-white rounded-lg text-xs font-semibold">Custom</button>
</div>
</div>
</div>
</section>

<div className="bg-surface-container-low rounded-2xl p-6 border-l-4 border-indigo-500 flex items-center justify-between">
<div className="flex gap-4 items-center">
<div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
<span className="material-symbols-outlined" data-icon="cloud_sync" data-weight="fill">cloud_sync</span>
</div>
<div>
<h4 className="font-bold text-white font-headline">Bulk Synchronization in Progress</h4>
<p className="text-xs text-on-surface-variant">Processing 14,204 records for Salesforce CRM Migration</p>
</div>
</div>
<div className="w-1/3 flex flex-col gap-2">
<div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
<span>74% Complete</span>
<span>Estimated: 4m 12s</span>
</div>
<div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-indigo-500 rounded-full w-3/4"></div>
</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 space-y-6">
<div className="bg-surface-container rounded-2xl p-6 shadow-xl">
<div className="flex justify-between items-center mb-6">
<h3 className="text-lg font-bold font-headline text-white flex items-center gap-2">
<span className="material-symbols-outlined text-indigo-500" data-icon="account_tree">account_tree</span>
                                Field Translation Logic
                            </h3>
<div className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-black text-indigo-400">
                                12 ACTIVE FIELDS
                            </div>
</div>
<div className="space-y-4">

<div className="grid grid-cols-12 gap-4 items-center bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">IntelliScan Field</label>
<div className="flex items-center gap-3 bg-surface-container-high px-3 py-2.5 rounded-xl">
<span className="material-symbols-outlined text-indigo-400 text-sm" data-icon="person">person</span>
<span className="text-sm font-semibold text-white">Full Name</span>
</div>
</div>
<div className="col-span-2 flex justify-center pt-6">
<span className="material-symbols-outlined text-outline" data-icon="trending_flat">trending_flat</span>
</div>
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">Target Key (Salesforce)</label>
<input className="w-full bg-surface-container-high border-none rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 py-2.5 px-3" type="text" value="LastName"/>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">IntelliScan Field</label>
<div className="flex items-center gap-3 bg-surface-container-high px-3 py-2.5 rounded-xl">
<span className="material-symbols-outlined text-indigo-400 text-sm" data-icon="mail">mail</span>
<span className="text-sm font-semibold text-white">Email Address</span>
</div>
</div>
<div className="col-span-2 flex justify-center pt-6">
<span className="material-symbols-outlined text-outline" data-icon="trending_flat">trending_flat</span>
</div>
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">Target Key (Salesforce)</label>
<input className="w-full bg-surface-container-high border-none rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 py-2.5 px-3" type="text" value="Email"/>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-center bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">IntelliScan Field</label>
<div className="flex items-center gap-3 bg-surface-container-high px-3 py-2.5 rounded-xl">
<span className="material-symbols-outlined text-indigo-400 text-sm" data-icon="fact_check">fact_check</span>
<span className="text-sm font-semibold text-white">Confidence Score</span>
</div>
</div>
<div className="col-span-2 flex justify-center pt-6">
<span className="material-symbols-outlined text-outline" data-icon="trending_flat">trending_flat</span>
</div>
<div className="col-span-5">
<label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">Target Key (Salesforce)</label>
<input className="w-full bg-surface-container-high border-none rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 py-2.5 px-3" type="text" value="AI_Confidence_Index__c"/>
</div>
</div>
</div>
<button className="mt-8 flex items-center justify-center gap-2 w-full py-3 border border-dashed border-outline/30 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all text-sm font-medium">
<span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                            Add Custom Field Mapping
                        </button>
</div>

<div className="bg-surface-container rounded-2xl overflow-hidden shadow-xl border border-outline-variant/5">
<div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
<h3 className="text-lg font-bold font-headline text-white">Live Transformation Preview</h3>
<button className="text-xs font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-tighter">
<span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
                                Refresh Sample
                            </button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left text-sm font-body">
<thead>
<tr className="bg-surface-container-high/50 text-on-surface-variant font-bold uppercase text-[10px]">
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4">LastName</th>
<th className="px-6 py-4">Email</th>
<th className="px-6 py-4">AI_Confidence_Index__c</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container-high transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">VALIDATED</span>
</td>
<td className="px-6 py-4 text-white font-medium">Alexander, Julian</td>
<td className="px-6 py-4 text-on-surface-variant">j.alex@vortex-labs.io</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">
                                                98.2%
                                            </span>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">VALIDATED</span>
</td>
<td className="px-6 py-4 text-white font-medium">Chen, Wei</td>
<td className="px-6 py-4 text-on-surface-variant">wchen@nova.systems</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-tertiary-container text-on-tertiary-container">
                                                94.8%
                                            </span>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">REVIEW</span>
</td>
<td className="px-6 py-4 text-white font-medium">Unknown (Scanned)</td>
<td className="px-6 py-4 text-on-surface-variant">mark.t@missing.com</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-error-container text-on-error-container">
                                                42.1%
                                            </span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>

<div className="space-y-6">

<div className="bg-surface-container rounded-2xl p-6 shadow-xl border border-outline-variant/10">
<h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Export Configuration</h3>
<div className="space-y-4">
<div>
<label className="block text-xs font-semibold text-white mb-3">Format</label>
<div className="grid grid-cols-2 gap-2">
<button className="flex flex-col items-center justify-center p-4 bg-primary-container text-white rounded-xl ring-2 ring-indigo-400">
<span className="material-symbols-outlined mb-2" data-icon="csv">csv</span>
<span className="text-xs font-bold">CSV</span>
</button>
<button className="flex flex-col items-center justify-center p-4 bg-surface-container-high text-on-surface-variant hover:text-white rounded-xl transition-all">
<span className="material-symbols-outlined mb-2" data-icon="javascript">javascript</span>
<span className="text-xs font-bold">JSON</span>
</button>
<button className="flex flex-col items-center justify-center p-4 bg-surface-container-high text-on-surface-variant hover:text-white rounded-xl transition-all">
<span className="material-symbols-outlined mb-2" data-icon="table_chart">table_chart</span>
<span className="text-xs font-bold">XLSX</span>
</button>
<button className="flex flex-col items-center justify-center p-4 bg-surface-container-high text-on-surface-variant hover:text-white rounded-xl transition-all">
<span className="material-symbols-outlined mb-2" data-icon="storage">storage</span>
<span className="text-xs font-bold">PARQUET</span>
</button>
</div>
</div>
<div className="pt-6 border-t border-outline-variant/10">
<label className="block text-xs font-semibold text-white mb-3">Post-Processing</label>
<div className="space-y-3">
<label className="flex items-center gap-3 cursor-pointer">
<input checked="" className="w-4 h-4 bg-surface-container-high border-none rounded text-indigo-500 focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface-variant">Deduplicate entries</span>
</label>
<label className="flex items-center gap-3 cursor-pointer">
<input className="w-4 h-4 bg-surface-container-high border-none rounded text-indigo-500 focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface-variant">Anonymize PII</span>
</label>
<label className="flex items-center gap-3 cursor-pointer">
<input checked="" className="w-4 h-4 bg-surface-container-high border-none rounded text-indigo-500 focus:ring-0" type="checkbox"/>
<span className="text-sm text-on-surface-variant">Append engine metadata</span>
</label>
</div>
</div>
</div>
<button className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
<span className="material-symbols-outlined" data-icon="rocket_launch">rocket_launch</span>
                            Execute Migration
                        </button>
</div>

<div className="bg-surface-container rounded-2xl p-6 glass-card border border-outline-variant/10 overflow-hidden relative">
<div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
<h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Active Mapper Engine</h4>
<div className="flex items-center gap-4">
<div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-indigo-400" data-icon="hub">hub</span>
</div>
<div>
<p className="text-sm font-bold text-white">Transmutation-V4</p>
<p className="text-[10px] text-on-surface-variant">Proprietary AI Logic Engine</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[9px] font-bold">OCR-V2</span>
<span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[9px] font-bold">NLP-XL</span>
</div>
</div>
</div>
</div>

    </div>
  );
}