import React, { useState, useEffect } from 'react';
import { Mail, Search, Plus, Filter, MoreVertical, Edit3, Trash2, Copy, Send, BarChart2, Clock, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import EmailStatusBadge from '../../components/email/EmailStatusBadge';
import { format } from 'date-fns';
import { getStoredToken } from '../../utils/auth.js';

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/email/campaigns', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const res = await fetch(`/api/email/campaigns/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      if (res.ok) fetchCampaigns();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Campaign"
        message="Are you sure you want to permanently delete this campaign? This action cannot be undone and all associated analytics will be lost."
        confirmText="Delete Permanently"
        cancelText="Keep Campaign"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Campaigns</h1>
          <p className="text-gray-400 text-sm">Orchestrate and monitor your email outreach sequences.</p>
        </div>
        <Link 
          to="/dashboard/email-marketing/campaigns/new"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'sending', 'sent'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === status 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/50 animate-pulse rounded-2xl border border-gray-800" />
          ))
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800 border-dashed">
            <Mail size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-white font-bold">No campaigns found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new campaign.</p>
          </div>
        ) : (
          filteredCampaigns.map(c => (
            <div key={c.id} className="group bg-gray-900/40 hover:bg-white/5 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-300 flex items-center gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                c.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                c.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-gray-800 text-gray-500 border-gray-700'
              }`}>
                <Mail size={22} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{c.name}</h3>
                  <EmailStatusBadge status={c.status} />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Mail size={12} /> {c.total_recipients || 0} Recipients</span>
                  <span className="flex items-center gap-1 border-l border-gray-800 pl-4"><Clock size={12} /> {format(new Date(c.created_at), 'PPP')}</span>
                </div>
              </div>

              {c.status === 'sent' && (
                <div className="hidden lg:flex gap-8 px-8 border-l border-gray-800 items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{c.open_rate || 0}%</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{c.click_rate || 0}%</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Click Rate</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {c.status === 'sent' ? (
                  <button 
                    onClick={() => navigate(`/dashboard/email-marketing/campaigns/${c.id}`)}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700"
                    title="View Analytics"
                  >
                    <BarChart2 size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/dashboard/email-marketing/campaigns/${c.id}/edit`)}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700"
                    title="Edit Campaign"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
                <button 
                   onClick={() => handleDelete(c.id)}
                   className="p-2.5 bg-gray-800 hover:bg-rose-500/20 text-gray-600 hover:text-rose-400 rounded-xl transition-all border border-gray-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
