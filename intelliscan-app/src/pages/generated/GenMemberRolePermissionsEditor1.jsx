import React from 'react';

export default function GenMemberRolePermissionsEditor1() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      

<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-3">
<span className="opacity-60">Workspace</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="opacity-60">Members</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-primary font-medium">Permissions</span>
</nav>
<h1 className="text-4xl font-headline font-extrabold text-white tracking-tight mb-2">Roles &amp; Access</h1>
<p className="text-on-surface-variant max-w-2xl leading-relaxed">
                        Define granular access control policies for your organization. Manage default system roles or configure custom permission sets for specific engineering units.
                    </p>
</div>
<button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
<span className="material-symbols-outlined" data-icon="add_moderator">add_moderator</span>
                    Create Custom Role
                </button>
</div>

<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

<div className="lg:col-span-1 flex flex-col gap-4">
<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<div className="flex items-center justify-between mb-4">
<span className="text-xs font-bold uppercase tracking-widest text-primary">Selected Config</span>
<span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
</div>
<h3 className="text-xl font-headline font-bold text-white mb-2">Admin</h3>
<p className="text-sm text-on-surface-variant mb-6">Full system access including billing and user management.</p>
<div className="space-y-3">
<div className="flex items-center justify-between text-xs">
<span className="text-on-surface-variant">Active Members</span>
<span className="text-white font-mono">04</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
<div className="bg-primary w-[35%] h-full"></div>
</div>
</div>
</div>

<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
<div className="flex items-center gap-3 mb-4">
<div className="p-2 rounded-lg bg-secondary-container/30 text-secondary">
<span className="material-symbols-outlined" data-icon="precision_manufacturing">precision_manufacturing</span>
</div>
<span className="text-sm font-bold text-white">Engine Policy</span>
</div>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-mono font-bold uppercase tracking-tighter">OCR-V2.4</span>
<span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-mono font-bold uppercase tracking-tighter">SEC-SCAN</span>
</div>
</div>
</div>

<div className="lg:col-span-3">
<div className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full border-collapse text-left">
<thead>
<tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
<th className="p-5 font-headline font-bold text-sm text-white w-1/3">Permissions</th>
<th className="p-5 font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider text-center">Admin</th>
<th className="p-5 font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider text-center">Manager</th>
<th className="p-5 font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider text-center">User</th>
<th className="p-5 font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider text-center">Auditor</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-5">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="scanner">scanner</span>
<div>
<div className="text-sm font-semibold text-white">Scan Operations</div>
<div className="text-xs text-on-surface-variant">Execute OCR and entity extraction</div>
</div>
</div>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-5">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary" data-icon="file_export">file_export</span>
<div>
<div className="text-sm font-semibold text-white">Bulk Export</div>
<div className="text-xs text-on-surface-variant">Download structured data as CSV/JSON</div>
</div>
</div>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-5">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error" data-icon="delete_sweep">delete_sweep</span>
<div>
<div className="text-sm font-semibold text-white">Data Retention</div>
<div className="text-xs text-on-surface-variant">Permanently delete scanned records</div>
</div>
</div>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
</tr>

<tr className="hover:bg-surface-container transition-colors group">
<td className="p-5">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-tertiary" data-icon="person_add">person_add</span>
<div>
<div className="text-sm font-semibold text-white">Member Invitations</div>
<div className="text-xs text-on-surface-variant">Onboard new enterprise users</div>
</div>
</div>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input checked="" className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
<td className="p-5 text-center">
<input className="w-5 h-5 rounded border-outline bg-surface-container-high text-primary focus:ring-primary/20" type="checkbox"/>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-4 bg-surface-container-lowest/50 flex justify-between items-center">
<span className="text-[10px] text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">info</span>
                                Auto-saved to Cloud Sync at 14:22:01 UTC
                            </span>
<div className="flex gap-2">
<button className="px-4 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors">Revert</button>
<button className="px-4 py-1.5 text-xs font-bold bg-primary-container text-white rounded-lg shadow-sm">Save Changes</button>
</div>
</div>
</div>
</div>
</div>

<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
<div className="md:col-span-2">
<h2 className="text-2xl font-headline font-bold text-white mb-3">Custom Role Engine</h2>
<p className="text-on-surface-variant">
                        Need something more specific? Create a role that limits users to certain data clusters or restricts scan volume. Custom roles can be derived from existing system presets.
                    </p>
</div>
<div className="flex justify-end">
<div className="relative group">
<div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
<div className="relative px-8 py-4 bg-surface-container rounded-xl flex items-center gap-4 cursor-pointer">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="auto_awesome">auto_awesome</span>
<div>
<div className="text-sm font-bold text-white">AI Policy Generator</div>
<div className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-mono">Beta Feature</div>
</div>
</div>
</div>
</div>
</div>

<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="p-5 rounded-xl bg-surface-container border border-outline-variant/10 flex items-start justify-between">
<div className="max-w-[80%]">
<h4 className="text-sm font-bold text-white mb-1">MFA Enforcement</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Require 2FA for all members with "Export" or "Delete" capabilities.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>

<div className="p-5 rounded-xl bg-surface-container border border-outline-variant/10 flex items-start justify-between">
<div className="max-w-[80%]">
<h4 className="text-sm font-bold text-white mb-1">IP Whitelisting</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Limit administrative console access to verified office network ranges.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>

<div className="p-5 rounded-xl bg-surface-container border border-outline-variant/10 flex items-start justify-between">
<div className="max-w-[80%]">
<h4 className="text-sm font-bold text-white mb-1">PII Masking</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Automatically redact sensitive fields for "Auditor" and "User" roles.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>

    </div>
  );
}