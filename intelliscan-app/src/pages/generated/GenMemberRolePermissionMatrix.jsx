import React from 'react';

export default function GenMemberRolePermissionMatrix() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="flex-1 p-8 pb-32 overflow-y-auto custom-scrollbar">
<div className="max-w-6xl mx-auto">
<div className="flex justify-between items-end mb-10">
<div>
<div className="flex items-center gap-2 text-primary mb-2">
<span className="material-symbols-outlined text-sm" data-icon="shield">shield</span>
<span className="text-xs font-bold tracking-widest uppercase">Security &amp; Governance</span>
</div>
<h2 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2">Role Permissions</h2>
<p className="text-on-surface-variant max-w-xl">Configure granular access control and define functional boundaries across the workspace infrastructure.</p>
</div>
<button className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-semibold border border-outline-variant/20 hover:border-primary/40 transition-all active:scale-95">
<span className="material-symbols-outlined" data-icon="add_moderator">add_moderator</span>
                            Custom Role
                        </button>
</div>

<div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10">
<div className="overflow-x-auto custom-scrollbar">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container border-b border-outline-variant/10">
<th className="p-6 min-w-[300px] align-bottom">
<span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Capability Matrix</span>
</th>

<th className="p-6 text-center">
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
</div>
<span className="font-headline font-bold text-on-surface">Admin</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Full System Access</span>
</div>
</th>
<th className="p-6 text-center">
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
</div>
<span className="font-headline font-bold text-on-surface">Manager</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Team Lead</span>
</div>
</th>
<th className="p-6 text-center">
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="person">person</span>
</div>
<span className="font-headline font-bold text-on-surface">User</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Standard Op</span>
</div>
</th>
<th className="p-6 text-center">
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="visibility">visibility</span>
</div>
<span className="font-headline font-bold text-on-surface">Viewer</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Read Only</span>
</div>
</th>
</tr>
</thead>
<tbody>

<tr className="bg-surface-container-lowest/50">
<td className="px-6 py-3" colspan="5">
<span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Workspace Management</span>
</td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Edit Workspaces</span>
<span className="text-xs text-on-surface-variant">Modify global environment settings and aliases</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Manage Billing</span>
<span className="text-xs text-on-surface-variant">Access invoices and update payment methods</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>

<tr className="bg-surface-container-lowest/50">
<td className="px-6 py-3" colspan="5">
<span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Security &amp; Infrastructure</span>
</td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">View API Keys</span>
<span className="text-xs text-on-surface-variant">Reveal and rotate sensitive integration tokens</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Audit Logs Access</span>
<span className="text-xs text-on-surface-variant">Download complete system event history</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>

<tr className="bg-surface-container-lowest/50">
<td className="px-6 py-3" colspan="5">
<span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Data Operations</span>
</td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Delete Contacts</span>
<span className="text-xs text-on-surface-variant">Permanently purge scanned entity data</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="p-6">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Export Intelligence</span>
<span className="text-xs text-on-surface-variant">Bulk export results to CSV/JSON format</span>
</div>
</td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
<td className="p-6 text-center"><input checked="" className="w-5 h-5 rounded bg-surface-container border-outline-variant text-indigo-500 focus:ring-indigo-500" type="checkbox"/></td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="mt-6 flex items-center justify-between text-on-surface-variant text-sm px-2">
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-indigo-500"></div>
<span>Active Permission</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-surface-container-high border border-outline-variant"></div>
<span>Restricted Action</span>
</div>
</div>
<p className="italic opacity-60 flex items-center gap-2">
<span className="material-symbols-outlined text-base" data-icon="info">info</span>
                            Changes take effect after next user login session.
                        </p>
</div>
</div>
</div>

<div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-6">
<div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
<div className="flex items-center gap-4 px-2">
<div className="w-10 h-10 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="pending" style={{}}>pending</span>
</div>
<div>
<p className="font-bold text-on-surface leading-tight">Unsaved Changes</p>
<p className="text-xs text-on-surface-variant">4 modifications pending validation</p>
</div>
</div>
<div className="flex items-center gap-3">
<button className="px-5 py-2.5 text-on-surface-variant font-semibold hover:text-on-surface transition-colors">
                            Discard
                        </button>
<button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all active:scale-95">
                            Save Workspace Rules
                        </button>
</div>
</div>
</div>

    </div>
  );
}