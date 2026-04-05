import React, { useState, useEffect } from 'react';
import { Mail, Users, FileText, Zap, Plus, ArrowRight, BarChart3, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CampaignStatsCard from '../../components/email/CampaignStatsCard';
import EmailStatusBadge from '../../components/email/EmailStatusBadge';
import { format } from 'date-fns';
import { getStoredToken } from '../../utils/auth.js';

export default function EmailMarketingPage() {
  const [stats, setStats] = useState({ total_campaigns: 0, total_sent: 0, total_opens: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchStats() {
    try {
      const res = await fetch('/api/email/analytics/overview', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async function fetchRecentCampaigns() {
    try {
      const res = await fetch('/api/email/campaigns', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecentCampaigns(data.campaigns.slice(0, 5));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchRecentCampaigns();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Intelligence <span className="text-indigo-500">Marketing</span>
          </h1>
          <p className="text-gray-400 font-medium">Enterprise email orchestration and AI-powered outreach.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/dashboard/email-marketing/campaigns/new"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} /> New Campaign
          </Link>
          <button 
            onClick={() => navigate('/dashboard/email-marketing/lists')}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-gray-700"
          >
            <Users size={18} /> Manage Lists
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CampaignStatsCard 
          label="Total Campaigns" 
          value={stats.total_campaigns} 
          color="indigo" 
        />
        <CampaignStatsCard 
          label="Total Emailed" 
          value={stats.total_sent} 
          trend="up" 
          color="blue" 
        />
        <CampaignStatsCard 
          label="Avg Open Rate" 
          value={stats.total_sent > 0 ? Math.round((stats.total_opens / stats.total_sent) * 100) : 0} 
          percentage 
          color="emerald" 
        />
        <CampaignStatsCard 
          label="Conversion Rate" 
          value={12} 
          percentage 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-500" /> Recent Activity
            </h3>
            <Link to="/dashboard/email-marketing/campaigns" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/20 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4 text-center">Engagement</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-800 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : recentCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic text-sm">No campaigns found. Start by creating one!</td>
                  </tr>
                ) : (
                  recentCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{c.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight truncate w-48 italic">"{c.subject}"</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${c.open_rate || 0}%` }} />
                            <div className="h-full bg-blue-500/50" style={{ width: `${c.click_rate || 0}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {c.open_rate || 0}% Open • {c.click_rate || 0}% Click
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <EmailStatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-gray-400 font-mono">{format(new Date(c.created_at), 'MMM dd, HH:mm')}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          to={`/dashboard/email-marketing/campaigns/${c.id}`}
                          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all inline-block"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/30 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} className="text-indigo-400" /> Intelligent Core
            </h3>
            <div className="space-y-4">
              <Link to="/dashboard/email-marketing/templates" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileText size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-200">Template Engine</span>
                </div>
                <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link to="/dashboard/email-marketing/automations" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Zap size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-200">Drip Automations</span>
                </div>
                <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
              <button 
                onClick={() => navigate('/dashboard/email-marketing/campaigns/new', { state: { useAI: true } })}
                className="w-full mt-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                AI Copywriter Active <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 text-gray-400">
              <Clock size={16} /> Best Send Time
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-800/30 p-2 rounded-lg border border-gray-700/50">
                <span className="text-[10px] font-bold text-gray-400">Tuesday, 10:00 AM</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Peak Open Rate</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Our AI engine suggests sending b2b campaigns on Tuesday mornings for maximum engagement in the Professional services sector.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
