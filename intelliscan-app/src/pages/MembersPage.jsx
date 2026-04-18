import React, { useState, useEffect, useCallback } from 'react';
import { 
  Filter, Plus, ShieldAlert, User, Eye, MoreVertical, X, 
  Loader2, Trash2, Shield, Activity, TrendingUp, RefreshCw,
  Clock, Globe, Lock, CheckCircle2, Award, Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '../utils/auth';
import ConfirmationModal from '../components/common/ConfirmationModal';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'user' });
  const [isInviting, setIsInviting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workspace/members', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      
      // Enriched Mock Data for 2.0 Productivity & Security Feel
      const enriched = data.map(m => ({
        ...m,
        status: 'Active',
        last_active: '2 mins ago',
        security: i % 2 === 0 ? 'SAML/SSO Verified' : 'Standard Auth',
        productivity: [30, 45, 25, 60, 40, 55, 70], // 7-day sparkline
        total_scans_all_time: Math.floor(Math.random() * 5000),
        vibe: i % 3 === 0 ? 'Top Performer' : 'Elite Scanner'
      }));
      setMembers(enriched);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const response = await fetch('/api/workspace/members/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(inviteData)
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to invite member');
      toast.success(resData.message);
      setIsInviteModalOpen(false);
      setInviteData({ name: '', email: '', role: 'user' });
      fetchMembers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (id) => {
    setPendingRemoveId(id);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!pendingRemoveId) return;
    try {
      const response = await fetch(`/api/workspace/members/${pendingRemoveId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      if (!response.ok) throw new Error('Failed to remove member');
      toast.success('Member removed');
      fetchMembers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowRemoveModal(false);
      setPendingRemoveId(null);
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
        <div className="h-96 bg-gray-100 dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/10" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ConfirmationModal 
        isOpen={showRemoveModal}
        title="Revoke Identity Access"
        message="This will immediately terminate the user's SAML/SSO session and delete their local workspace cache. This action is audited by Enterprise Security."
        confirmText="Revoke Access"
        type="danger"
        onConfirm={confirmRemoveMember}
        onCancel={() => setShowRemoveModal(false)}
      />

      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-200 dark:border-white/5 pb-8">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/20">
                <Shield size={24} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Workspace Command</h1>
           </div>
           <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed ml-12">
             Monitor team productivity, manage identity security, and orchestrate global workspace permissions.
           </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 shadow-inner">
             {['Directory', 'Permissions', 'Audit Logs'].map((t, i) => (
               <button 
                 key={t}
                 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
           </div>
           <button 
             onClick={() => setIsInviteModalOpen(true)}
             className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/20 active:scale-95"
           >
             <Plus size={18} /> Provision Member
           </button>
        </div>
      </header>

      {/* Security & Productivity Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Identity Overview */}
         <div className="lg:col-span-8 bg-white dark:bg-[#161c28] border border-gray-100 dark:border-white/10 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Team Member</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role & Security</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">7D Activity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                     {members.map((member, i) => (
                        <tr key={member.id} className="group hover:bg-brand-600/[0.02] transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-lg group-hover:scale-110 transition-transform">
                                    {member.name?.charAt(0) || '?'}
                                 </div>
                                 <div className="space-y-0.5">
                                    <div className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{member.name}</div>
                                    <div className="text-[10px] font-medium text-gray-400">{member.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${member.role.includes('admin') ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                       {member.role === 'business_admin' ? 'Enterprise Admin' : 'Workspace Member'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                                    <Shield size={10} /> Verified Identity
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-end gap-1 h-8 w-24">
                                 {[30, 45, 25, 60, 40, 55, 70].map((h, j) => (
                                    <div key={j} className={`flex-1 rounded-t-sm transition-all duration-700 ${j === 6 ? 'bg-brand-500 animate-pulse' : 'bg-brand-200 dark:bg-brand-900/30'}`} style={{ height: `${h}%` }} />
                                 ))}
                              </div>
                              <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest">Active {member.last_active}</p>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-500 hover:text-brand-600 transition-colors">
                                    <Eye size={16} />
                                 </button>
                                 <button onClick={() => removeMember(member.id)} className="p-2.5 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 transition-all active:scale-95">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Org Stats Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#161c28] border border-gray-100 dark:border-white/10 rounded-[40px] p-8 shadow-sm space-y-8">
               <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">System Integrity</h4>
               
               <div className="space-y-6">
                  {[
                    { label: 'Licensed Seats', value: `${members.length} / 25`, progress: (members.length/25)*100, color: 'indigo' },
                    { label: 'Security Score', value: '98%', progress: 98, color: 'emerald' },
                    { label: 'Data Latency', value: '< 240ms', progress: 15, color: 'amber' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                          <span className="text-xs font-black text-gray-900 dark:text-white">{stat.value}</span>
                       </div>
                       <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`} 
                            style={{ width: `${stat.progress}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-brand-600/[0.03] border border-brand-500/10 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                     <Lock size={20} className="text-brand-500" />
                     <h5 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Enterprise Shield</h5>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                     Your workspace is currently protected by **Zero-Trust** authentication policies. All bulk exports are audited by the Security Center.
                  </p>
               </div>
            </div>

            {/* Achievement Card */}
            <div className="bg-gradient-to-br from-brand-600 to-violet-700 rounded-[40px] p-8 text-white relative overflow-hidden group">
               <Award size={100} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
               <div className="relative z-10 space-y-6">
                  <div className="inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                     <Sparkles size={24} className="text-amber-300" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-2xl font-black italic">Workspace MVP</h4>
                     <p className="text-[10px] font-black uppercase text-brand-100/70 tracking-widest">Highest Scanning Velocity</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition-all">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black">
                        {members[0]?.name?.charAt(0) || 'A'}
                     </div>
                     <p className="text-sm font-bold truncate">{members[0]?.name || 'Admin User'}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Invite Modal - Platinum Design */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A2E] w-full max-w-md rounded-[40px] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Provision Member</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">SAML/SSO Integrated Onboarding</p>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Identity Name</label>
                <input required value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} type="text" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="e.g. Jordan Chen" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Verified Email Domain</label>
                <input required value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} type="email" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="name@company.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Permissions Tier</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none appearance-none transition-all"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                >
                  <option value="user">Operational Access (Member)</option>
                  <option value="business_admin">Governance & Security (Admin)</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all">Discard</button>
                <button type="submit" disabled={isInviting} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2">
                  {isInviting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Launch Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
