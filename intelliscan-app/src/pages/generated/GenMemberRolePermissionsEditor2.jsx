import React from 'react';

export default function GenMemberRolePermissionsEditor2() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="flex-1 flex overflow-hidden p-8 gap-8">

<div className="w-80 flex flex-col gap-4">
<div className="flex items-center justify-between px-2">
<h3 className="font-headline font-bold text-lg text-on-surface">Available Roles</h3>
<button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                        NEW ROLE
                    </button>
</div>
<div className="space-y-3">

<div className="bg-surface-container rounded-xl p-4 border-l-4 border-primary-container shadow-sm group cursor-pointer hover:bg-surface-container-high transition-all">
<div className="flex items-center justify-between mb-1">
<span className="font-bold text-sm text-white">Business Admin</span>
<span className="bg-primary-container/20 text-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Full access to workspace settings, billing, and member management.</p>
</div>

<div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-transparent shadow-sm group cursor-pointer hover:bg-surface-container-high transition-all">
<div className="flex items-center justify-between mb-1">
<span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors">Manager</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Can manage scans and view analytics, but cannot change workspace settings.</p>
</div>

<div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-transparent shadow-sm group cursor-pointer hover:bg-surface-container-high transition-all">
<div className="flex items-center justify-between mb-1">
<span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors">Scanner</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Restricted to OCR scanning actions and inventory viewing only.</p>
</div>

<div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-transparent shadow-sm group cursor-pointer hover:bg-surface-container-high transition-all">
<div className="flex items-center justify-between mb-1">
<span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors">Viewer</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Read-only access to scan history and shared workspace documents.</p>
</div>
</div>

<div className="mt-auto bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/10">
<div className="flex items-center gap-2 mb-2 text-primary">
<span className="material-symbols-outlined text-sm" data-icon="info">info</span>
<span className="text-xs font-bold uppercase tracking-wider">System Note</span>
</div>
<p className="text-[11px] text-on-surface-variant leading-normal">
                        Role changes are audited and logged in the <span className="text-on-surface underline">Security Activity</span> panel. Changes take effect on next login.
                    </p>
</div>
</div>

<div className="flex-1 bg-surface-container-low rounded-2xl p-8 overflow-y-auto no-scrollbar shadow-inner relative">
<div className="mb-10">
<div className="flex items-center gap-3 mb-2">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="admin_panel_settings">admin_panel_settings</span>
<h2 className="font-headline font-extrabold text-2xl text-white tracking-tight">Business Admin Permissions</h2>
</div>
<p className="text-on-surface-variant max-w-2xl font-body">Define the specific operational boundaries for this role. Toggles marked with a gold star represent high-impact security privileges.</p>
</div>
<div className="grid grid-cols-1 gap-12">

<section>
<div className="flex items-center gap-4 mb-6">
<h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-xs">Contacts &amp; OCR Management</h3>
<div className="flex-1 h-px bg-outline-variant/10"></div>
</div>
<div className="grid grid-cols-2 gap-6">
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface flex items-center gap-2">
                                        View Contacts 
                                        <span className="material-symbols-outlined text-[14px] text-tertiary" data-icon="verified_user" data-weight="fill">verified_user</span>
</span>
<p className="text-[11px] text-on-surface-variant">Access to all scanned contact data and exports.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface">Delete Scans</span>
<p className="text-[11px] text-on-surface-variant">Permanently remove processed scans from storage.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface">Edit Metadata</span>
<p className="text-[11px] text-on-surface-variant">Modify OCR confidence fields and field labels.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</section>

<section>
<div className="flex items-center gap-4 mb-6">
<h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-xs">Workspace Administration</h3>
<div className="flex-1 h-px bg-outline-variant/10"></div>
</div>
<div className="grid grid-cols-2 gap-6">
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface">Manage Members</span>
<p className="text-[11px] text-on-surface-variant">Invite new users and change role assignments.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface">General Settings</span>
<p className="text-[11px] text-on-surface-variant">Change workspace name, logo, and public URL.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</section>

<section>
<div className="flex items-center gap-4 mb-6">
<h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-xs">API &amp; Technical Access</h3>
<div className="flex-1 h-px bg-outline-variant/10"></div>
</div>
<div className="grid grid-cols-2 gap-6">
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface flex items-center gap-2">
                                        Rotate API Keys
                                        <span className="material-symbols-outlined text-[14px] text-error" data-icon="priority_high">priority_high</span>
</span>
<p className="text-[11px] text-on-surface-variant">Generate new secrets and invalidate old tokens.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
<div className="space-y-1">
<span className="text-sm font-semibold text-on-surface">Manage Webhooks</span>
<p className="text-[11px] text-on-surface-variant">Configure outgoing data streams for events.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</section>

<section className="pb-20">
<div className="flex items-center gap-4 mb-6">
<h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-xs">Billing &amp; Subscription</h3>
<div className="flex-1 h-px bg-outline-variant/10"></div>
</div>
<div className="grid grid-cols-2 gap-6">
<div className="col-span-2 flex items-center justify-between p-6 bg-primary-container/10 border border-primary-container/20 rounded-2xl">
<div className="flex items-start gap-4">
<div className="bg-primary-container text-white p-2 rounded-lg">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
</div>
<div className="space-y-1">
<span className="text-sm font-bold text-white">Full Financial Access</span>
<p className="text-xs text-on-surface-variant">User can upgrade/downgrade plans, view invoices, and change payment methods. This role is currently the designated Billing Owner.</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-12 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-[24px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</section>
</div>
</div>
</div>



    </div>
  );
}