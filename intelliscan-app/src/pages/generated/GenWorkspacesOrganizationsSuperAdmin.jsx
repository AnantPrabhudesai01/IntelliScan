import React, { useState, useEffect } from 'react';
import { Building2, Crown, Activity, Users, Plus, Settings, CreditCard, Trash2, MoreVertical, X, Check, Loader2 } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

const REGIONS = ['North America', 'Europe', 'Asia', 'South America', 'Middle East'];
const INDUSTRIES = ['Logistics', 'Aerospace', 'FinTech', 'Healthcare', 'SaaS', 'Retail', 'Education'];
const PLAN_TIERS = ['enterprise', 'pro', 'personal'];

function AddOrgModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', owner_email: '', tier: 'enterprise' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.owner_email.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onAdd();
        onClose();
      } else {
        alert(data.error || 'Failed to create organization');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pt-20" onClick={onClose}>
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Organization</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Organization Name *</label>
            <input autoFocus required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Owner Email (Must exist) *</label>
            <input required type="email" value={form.owner_email} onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="admin@acme.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Plan Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {PLAN_TIERS.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tier: t }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all uppercase ${form.tier === t ? 'bg-brand-600 border-brand-500 text-white' : 'bg-[#0d1117] border-white/10 text-gray-300 hover:border-brand-500/50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Create Organization</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GenWorkspacesOrganizationsSuperAdmin() {
  const [orgs, setOrgs] = useState([]);
  const [globalStats, setGlobalStats] = useState({ workspaces: 0, users: 0, scans: 0, models: 0, calls_30d: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Entities');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchOrgs = async () => {
    try {
      const token = getStoredToken();
      const [orgsRes, statsRes] = await Promise.all([
        fetch('/api/admin/workspaces', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const orgsData = await orgsRes.json();
      const statsData = await statsRes.json();
      
      if (orgsData.success) setOrgs(orgsData.workspaces);
      if (statsData.success) setGlobalStats(statsData.stats);
    } catch (err) {
      console.error('Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const totalOrgs = globalStats.workspaces || orgs.length;
  const enterpriseTiers = orgs.filter(o => o.tier === 'enterprise').length;
  const monthlyScans = globalStats.scans || orgs.reduce((sum, o) => sum + (o.scans || 0), 0);
  const totalUsers = globalStats.users || orgs.reduce((sum, o) => sum + (o.used_seats || 0), 0);
  const avgSeatUtil = globalStats.avg_seat_util || (totalOrgs > 0 ? ((totalUsers / (totalOrgs * 20)) * 100).toFixed(1) : 0);


  const filteredOrgs = orgs.filter(o => {
    if (filter === 'Delinquent') return o.status === 'Delinquent';
    if (filter === 'Trialing') return o.tier === 'personal';
    return true;
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    fetchOrgs();
    showToast(`Organization has been successfully created!`);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/workspaces/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrgs();
        showToast(`"${name}" has been removed.`, 'error');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const formatScans = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  const stats = [
    { label: 'Total Organizations', value: totalOrgs.toLocaleString(), badge: 'GLOBAL', icon: Building2, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Enterprise Tiers', value: enterpriseTiers, badge: 'PREMIUM', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'System Wide Scans', value: formatScans(monthlyScans), badge: 'TRAFFIC', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total active Users', value: totalUsers.toLocaleString(), badge: 'IDENTITY', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];


  return (
    <div className="w-full h-full animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white transition-all flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <Trash2 size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Add Organization Modal */}
      {showModal && <AddOrgModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      <section className="p-8 flex-1 overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((item) => (
            <div key={item.label} className="bg-[#161c28] border border-white/5 p-6 rounded-2xl shadow-sm hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-lg flex items-center justify-center`}>
                  {React.createElement(item.icon, { size: 20 })}
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{item.badge}</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-1 transition-all duration-500">{item.value}</h3>
              <p className="text-sm text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#161c28] border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <div className="bg-[#0d1117] p-1 rounded-xl flex">
                {['All Entities', 'Delinquent', 'Trialing'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg">
              <Plus size={18} /> Add Organization
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0d1117]/50">
                  {['Organization Name', 'Plan Tier', 'Seat Utilization', 'Scan Volume', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrgs.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">No organizations match this filter.</td></tr>
                ) : filteredOrgs.map(org => (
                  <tr key={org.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center font-bold text-brand-400 text-sm">{org.name[0]}</div>
                        <div>
                          <p className="font-bold text-white text-sm">{org.name}</p>
                          <p className="text-[10px] text-gray-500">{org.owner_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {org.tier === 'enterprise' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black uppercase border border-amber-500/20"><Crown size={10} /> Enterprise</span>
                      ) : org.tier === 'pro' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-[10px] font-black uppercase border border-brand-500/20">Professional</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-gray-400 rounded-full text-[10px] font-black uppercase border border-white/10">Free Tier</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[80px] overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all duration-300"
                            style={{ width: `${(org.used_seats / 50) * 100}%` }} />
                        </div>
                        <span className="text-xs font-mono text-white">{org.used_seats}/50</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-white">{(org.scans || 0).toLocaleString()} <span className="text-[10px] text-gray-500">SCANS</span></p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 text-green-400 text-[10px] font-bold uppercase"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Active</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all" title="Billing"><CreditCard size={16} /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all" title="Settings"><Settings size={16} /></button>
                        <button onClick={() => handleDelete(org.id, org.name)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="text-white font-bold">{filteredOrgs.length}</span> of <span className="text-white font-bold">{orgs.length}</span> Organizations
            </p>
            <div className="text-xs text-gray-500 font-mono">
              Enterprise MRR: <span className="text-green-400 font-bold">${(enterpriseTiers * 1200 + (orgs.filter(o => o.tier === 'Professional').length * 299)).toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-[#161c28] border border-white/5 p-6 rounded-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Billing Health Overview</h4>
            <p className="text-sm text-gray-400 max-w-lg mb-6">
              Aggregate collection status for Enterprise clients.&nbsp;
              <span className="text-red-400 font-bold">{orgs.filter(o => o.status === 'Delinquent').length} entities</span> require immediate attention.
            </p>
            <div className="flex gap-4">
              <div className="bg-[#0d1117] p-4 rounded-xl flex-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-1">Projected MRR</p>
                <p className="text-2xl font-black text-white">${(enterpriseTiers * 1200 + (orgs.filter(o => o.tier === 'Professional').length * 299)).toLocaleString()}</p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-xl flex-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-1">Delinquent Risk</p>
                <p className="text-2xl font-black text-red-400">${(orgs.filter(o => o.status === 'Delinquent').length * 299).toLocaleString()}</p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-xl flex-1 border border-brand-500/20">
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-400 mb-1">Churn Potential</p>
                <p className="text-2xl font-black text-white">
                  {totalOrgs > 0 ? ((orgs.filter(o => o.status === 'Delinquent').length / totalOrgs) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-gradient-to-br from-brand-600 to-brand-900 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <Crown size={32} className="text-white/50 mb-4" />
              <h4 className="text-xl font-black text-white leading-tight">AI Deployment Insights</h4>
              <p className="text-sm text-brand-200 mt-2">
                {enterpriseTiers} enterprise orgs across {new Set(orgs.map(o => o.region)).size} regions. 
                {avgSeatUtil > 80 ? ' Capacity expansion recommended.' : ' Capacity is healthy.'}
              </p>
            </div>
            <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10 active:scale-95">
              Generate Scale Report
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
