import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Trash2, ArrowRight, Upload, Filter, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getStoredToken } from '../../utils/auth.js';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function ContactListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  async function fetchLists() {
    try {
      const res = await fetch('/api/email/lists', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) setLists(data.lists);
      setLoading(false);
    } catch (err) {
      console.error('Fetch lists failed:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/email/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(newList)
      });
      const data = await res.json();
      if (data.success) {
        fetchLists();
        setNewList({ name: '', description: '' });
        setShowModal(false);
      }
    } catch (err) {
      console.error('Create list failed:', err);
    }
  };

  const handleDeleteList = async (e, id) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteList = async () => {
    if (!pendingDeleteId) return;
    try {
      await fetch(`/api/email/lists/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      fetchLists();
    } catch (err) {
      console.error('Delete list failed:', err);
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const filteredLists = lists.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Audience Segment"
        message="Are you sure you want to delete this list? Please note: This will NOT delete the contacts themselves, but it will permanently remove this segment grouping and any associated campaign history for this list."
        confirmText="Remove Segment"
        cancelText="Keep Segment"
        type="danger"
        onConfirm={confirmDeleteList}
        onCancel={() => setShowDeleteModal(false)}
      />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Audience <span className="text-indigo-500">Segments</span></h1>
          <p className="text-gray-400 font-medium">Manage and segment your contact lists for targeted engagement.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> Create New List
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Search segments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-gray-800/20 rounded-2xl border border-gray-800 animate-pulse" />
          ))
        ) : filteredLists.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl group">
             <Users size={64} className="mx-auto text-gray-700 mb-6 group-hover:text-indigo-500/50 transition-colors" />
             <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Zero Segments Found</h3>
             <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Build your first segment to start sending personalized AI campaigns.</p>
             <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest border border-gray-700">Create Segment Now</button>
          </div>
        ) : (
          filteredLists.map((list) => (
            <div 
              key={list.id} 
              onClick={() => navigate(`/dashboard/email-marketing/lists/${list.id}`)}
              className="group bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all -translate-y-4 group-hover:translate-y-0">
                <button 
                  onClick={(e) => handleDeleteList(e, list.id)}
                  className="p-2 bg-rose-500/10 text-rose-400/50 hover:text-rose-400 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl border transition-all ${
                  list.contact_count > 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-gray-800 text-gray-600 border-gray-700'
                }`}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm tracking-tight group-hover:text-indigo-400 transition-colors">{list.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_theme(colors.emerald.500)]" />
                    {list.type} Segment
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-0.5">Reach</p>
                    <p className="text-2xl font-black text-white">{list.contact_count || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-1">Last Sync</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                      <Calendar size={12} className="text-gray-600" />
                      {format(new Date(list.updated_at), 'MMM dd')}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-500/50 uppercase tracking-widest">Active Audience</span>
                  <ArrowRight size={16} className="text-gray-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Plus className="text-indigo-500" /> New Audience List
            </h2>
            <form onSubmit={handleCreateList} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">List Name</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Fintech Decision Makers"
                  value={newList.name}
                  onChange={(e) => setNewList({...newList, name: e.target.value})}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Internal notes about this segment..."
                  value={newList.description}
                  onChange={(e) => setNewList({...newList, description: e.target.value})}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Create Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
