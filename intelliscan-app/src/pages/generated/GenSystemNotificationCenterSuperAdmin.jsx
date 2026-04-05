import React from 'react';

export default function GenSystemNotificationCenterSuperAdmin() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-surface">

<div className="grid grid-cols-4 gap-6 mb-10">
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
<span className="material-symbols-outlined text-8xl" data-icon="campaign">campaign</span>
</div>
<p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">Total Broadcasts</p>
<h3 className="text-3xl font-black text-white font-headline">128</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-tertiary text-xs font-bold">+12% this month</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
<span className="material-symbols-outlined text-8xl" data-icon="group">group</span>
</div>
<p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">Avg. Reach</p>
<h3 className="text-3xl font-black text-white font-headline">94.2%</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-primary text-xs font-bold">Excellent Engagement</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
<span className="material-symbols-outlined text-8xl" data-icon="timer">timer</span>
</div>
<p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">Engines Updated</p>
<h3 className="text-3xl font-black text-white font-headline">04</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-on-surface-variant text-xs font-medium">Last: 2 days ago</span>
</div>
</div>
<div className="bg-primary-container p-6 rounded-xl flex flex-col justify-center items-center text-center cursor-pointer hover:brightness-110 transition-all shadow-xl shadow-indigo-900/30">
<span className="material-symbols-outlined text-4xl text-white mb-2" data-icon="add_circle">add_circle</span>
<p className="text-white font-bold">Compose Global Alert</p>
<p className="text-indigo-100 text-[10px] uppercase tracking-widest mt-1">Instant Push Delivery</p>
</div>
</div>

<div className="flex justify-between items-end mb-6">
<div>
<h4 className="text-lg font-bold text-white font-headline">Recent Dispatches</h4>
<p className="text-on-surface-variant text-sm">Real-time engagement metrics for last 30 days</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 bg-surface-container text-xs font-bold rounded-lg text-on-surface border border-outline-variant/20">All Types</button>
<button className="px-4 py-2 bg-surface-container-low text-xs font-bold rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">Maintenance</button>
<button className="px-4 py-2 bg-surface-container-low text-xs font-bold rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">Product</button>
</div>
</div>

<div className="space-y-4">

<div className="bg-surface-container-low hover:bg-surface-container transition-all group rounded-xl p-5 flex items-center gap-6">
<div className="w-12 h-12 bg-error-container/20 rounded-full flex items-center justify-center text-error">
<span className="material-symbols-outlined" data-icon="report" style={{}}>report</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="font-bold text-white">Scheduled Maintenance: Database Sharding</h5>
<span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">CRITICAL</span>
</div>
<p className="text-on-surface-variant text-sm line-clamp-1">Expected downtime: 2 hours on Sunday, Oct 24th. Affecting OCR engine processing times during window.</p>
<div className="flex items-center gap-4 mt-3">
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
                                Today, 10:45 AM
                            </div>
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="person">person</span>
                                Sender: System Admin
                            </div>
</div>
</div>
<div className="flex gap-8 px-8 border-x border-outline-variant/10">
<div className="text-center">
<p className="text-xl font-bold text-white">4.2k</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Delivered</p>
</div>
<div className="text-center">
<p className="text-xl font-bold text-primary">88%</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Read Rate</p>
</div>
</div>
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined" data-icon="bar_chart_4_bars">bar_chart_4_bars</span>
</button>
</div>

<div className="bg-surface-container-low hover:bg-surface-container transition-all group rounded-xl p-5 flex items-center gap-6">
<div className="w-12 h-12 bg-tertiary-container/20 rounded-full flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" data-icon="auto_awesome" style={{}}>auto_awesome</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="font-bold text-white">Engine Update: OCR-V2.4 is Live</h5>
<span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">UPDATE</span>
</div>
<p className="text-on-surface-variant text-sm line-clamp-1">New handwriting recognition capabilities added. Accuracy increased by 14% for cursive text styles.</p>
<div className="flex items-center gap-4 mt-3">
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
                                Oct 21, 2:15 PM
                            </div>
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="person">person</span>
                                Sender: Eng Lead
                            </div>
</div>
</div>
<div className="flex gap-8 px-8 border-x border-outline-variant/10">
<div className="text-center">
<p className="text-xl font-bold text-white">12.8k</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Delivered</p>
</div>
<div className="text-center">
<p className="text-xl font-bold text-primary">42%</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Read Rate</p>
</div>
</div>
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined" data-icon="bar_chart_4_bars">bar_chart_4_bars</span>
</button>
</div>

<div className="bg-surface-container-low hover:bg-surface-container transition-all group rounded-xl p-5 flex items-center gap-6">
<div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="info" style={{}}>info</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<h5 className="font-bold text-white">New Security Policy Enforcement</h5>
<span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">GENERAL</span>
</div>
<p className="text-on-surface-variant text-sm line-clamp-1">Mandatory 2FA will be required for all enterprise accounts starting next month. Please update your profile.</p>
<div className="flex items-center gap-4 mt-3">
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
                                Oct 19, 09:00 AM
                            </div>
<div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-sm" data-icon="person">person</span>
                                Sender: Security Team
                            </div>
</div>
</div>
<div className="flex gap-8 px-8 border-x border-outline-variant/10">
<div className="text-center">
<p className="text-xl font-bold text-white">2.1k</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Delivered</p>
</div>
<div className="text-center">
<p className="text-xl font-bold text-primary">96%</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Read Rate</p>
</div>
</div>
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined" data-icon="bar_chart_4_bars">bar_chart_4_bars</span>
</button>
</div>
</div>
</div>

<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface/80 backdrop-blur-sm pointer-events-none opacity-0 transition-opacity">
<div className="bg-surface-container-low w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/10 flex flex-col pointer-events-auto">
<div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
<h3 className="text-xl font-extrabold text-white font-headline">New Global Broadcast</h3>
<button className="text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined" data-icon="close">close</span>
</button>
</div>
<div className="p-8 space-y-6">
<div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
<label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
<select className="w-full bg-surface-container border-none rounded-xl text-sm text-white py-3 px-4 focus:ring-1 focus:ring-primary-container">
<option>System Alert</option>
<option>Maintenance</option>
<option>Product Update</option>
<option>General Announcement</option>
</select>
</div>
<div className="space-y-2">
<label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Priority Level</label>
<div className="flex gap-2">
<button className="flex-1 py-3 px-2 bg-error-container/20 text-error border border-error/20 rounded-xl text-xs font-bold">CRITICAL</button>
<button className="flex-1 py-3 px-2 bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold">NORMAL</button>
</div>
</div>
</div>
<div className="space-y-2">
<label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Broadcast Subject</label>
<input className="w-full bg-surface-container border-none rounded-xl text-sm text-white py-3 px-4 focus:ring-1 focus:ring-primary-container transition-all" placeholder="e.g. Action Required: Update your API keys" type="text"/>
</div>
<div className="space-y-2">
<label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Message Content</label>
<textarea className="w-full bg-surface-container border-none rounded-xl text-sm text-white py-3 px-4 focus:ring-1 focus:ring-primary-container transition-all resize-none" placeholder="Draft your global notification message here..." rows="4"></textarea>
</div>
<div className="flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary-container/20">
<span className="material-symbols-outlined text-primary" data-icon="info">info</span>
<p className="text-xs text-on-primary-container">This broadcast will be pushed to <strong>24,802 active users</strong> immediately upon sending.</p>
</div>
</div>
<div className="p-6 bg-surface-container/50 flex justify-end gap-4 rounded-b-2xl">
<button className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-white transition-colors">Cancel</button>
<button className="px-8 py-2.5 bg-primary-container text-on-primary-container rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-lg" data-icon="send">send</span>
                        Dispatch Now
                    </button>
</div>
</div>
</div>



    </div>
  );
}