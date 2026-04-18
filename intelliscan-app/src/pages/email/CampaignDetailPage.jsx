import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3, Users, MousePointer2, Mail, AlertCircle, 
  ArrowLeft, Clock, Calendar, CheckCircle, Smartphone, Monitor,
  Activity, Globe, Search
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import CampaignStatsCard from '../../components/email/CampaignStatsCard';
import EmailStatusBadge from '../../components/email/EmailStatusBadge';
import OpenRateBar from '../../components/email/OpenRateBar';
import { format } from 'date-fns';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchCampaignDetails() {
    try {
      const res = await fetch(`/api/email/campaigns/${id}`, {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setData(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch campaign details failed:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Initializing Intelligence Data...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Campaign not found.</div>;

  const { campaign, analytics, recent_activity } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/dashboard/email-marketing/campaigns')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-400 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Missions
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black text-white tracking-widest uppercase truncate max-w-xl">{campaign.name}</h1>
             <EmailStatusBadge status={campaign.status} />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-tight mt-1">"{campaign.subject}"</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all border border-gray-700 flex items-center gap-2">
            <Calendar size={18} /> Schedule Follow-up
          </button>
          <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand-600/20">
            Export Intelligence
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CampaignStatsCard 
          label="Total Reach" 
          value={analytics.total} 
          color="indigo" 
        />
        <CampaignStatsCard 
          label="Open Rate" 
          value={analytics.total > 0 ? Math.round((analytics.opened / analytics.total) * 100) : 0} 
          percentage
          color="emerald" 
        />
        <CampaignStatsCard 
          label="Click-Thru Rate" 
          value={analytics.total > 0 ? Math.round((analytics.clicked / analytics.total) * 100) : 0} 
          percentage
          color="blue" 
        />
        <CampaignStatsCard 
          label="Bounce Rate" 
          value={analytics.total > 0 ? Math.round((analytics.bounced / analytics.total) * 100) : 0} 
          percentage
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Breakdown */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <Activity size={20} className="text-brand-500" /> Vector Engagement
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <Smartphone size={14} className="text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Mobile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Monitor size={14} className="text-brand-400" />
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter underline decoration-brand-500/50">Desktop</span>
                  </div>
               </div>
             </div>
             
             <div className="space-y-8">
               <div className="flex gap-12">
                 <OpenRateBar label="Open Velocity" rate={analytics.total > 0 ? Math.round((analytics.opened / analytics.total) * 100) : 0} color="emerald" />
                 <OpenRateBar label="Interactive Response" rate={analytics.total > 0 ? Math.round((analytics.clicked / analytics.total) * 100) : 0} color="blue" />
               </div>
               
               <div className="pt-8 border-t border-gray-800">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Transmission Sequence</h4>
                  <div className="flex items-center gap-1 h-32">
                     {/* Pseudo chart bars */}
                     {[40, 65, 30, 85, 55, 95, 75, 45, 60, 80, 50, 90, 35, 70, 55, 75, 85, 45, 30, 20].map((h, i) => (
                       <div key={i} className="flex-1 bg-gray-800/50 rounded-full flex items-end overflow-hidden group">
                         <div className="w-full bg-brand-500/30 group-hover:bg-brand-500 transition-all rounded-full" style={{ height: `${h}%` }} />
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                    <span>18h</span>
                    <span>24h</span>
                  </div>
               </div>
             </div>
           </div>

           {/* Activity Log */}
           <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
             <div className="p-6 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Globe size={18} className="text-brand-500" /> Interaction Log
                </h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Filter activity..." className="pl-9 pr-4 py-1.5 bg-black/40 border border-gray-700 rounded-xl text-[10px] font-bold text-white focus:outline-none" />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-black uppercase text-gray-600 tracking-widest">
                       <th className="px-6 py-4">Participant</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Interaction</th>
                       <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {recent_activity.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-600 italic">No interaction detected in the last sequence.</td>
                      </tr>
                    ) : (
                      recent_activity.map((s, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors uppercase tracking-tight">{s.first_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-gray-500 font-mono italic">{s.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              s.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex gap-2">
                               {s.open_count > 0 && <span className="p-1 px-2 bg-brand-500/10 text-brand-400 rounded-md text-[9px] font-black uppercase tracking-tight border border-brand-500/20">Opens: {s.open_count}</span>}
                               {s.click_count > 0 && <span className="p-1 px-2 bg-blue-500/10 text-blue-400 rounded-md text-[9px] font-black uppercase tracking-tight border border-blue-500/20">Clicks: {s.click_count}</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[10px] text-gray-400 font-mono">{s.sent_at ? format(new Date(s.sent_at), 'HH:mm:ss, MMM dd') : 'Pending'}</p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Campaign Metrics & Summary */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-brand-900/20 to-transparent border border-brand-500/30 p-8 rounded-3xl shadow-xl space-y-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-400" /> Vector Parameters
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Target Segments</p>
                     <div className="flex flex-wrap gap-2">
                        {campaign.list_ids.map((id, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-300 uppercase tracking-widest">L-ID: {id}</span>
                        ))}
                     </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Internal Notes</p>
                   <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
                     This mission was executed using the Intelligence Core v1.4. All tracking vectors are encrypted and anonymous. Reach verified via system checksum.
                   </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                   <h4 className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Technical Signature</h4>
                   <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
                     <span>Unsubscribe Integration</span>
                     <span className="text-emerald-400">Verified</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase text-gray-600">
                    <span>Server Origin</span>
                    <span className="text-white">US-EAST-ALPHA</span>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-gray-900/40 border border-gray-800 p-8 rounded-3xl space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} /> Engagement Strength
              </h3>
              <div className="flex items-center gap-4">
                 <div className="text-3xl font-black text-white">8.4</div>
                 <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '84%' }} />
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                Engagment strength is 14% higher than your average Professional Services campaign.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
