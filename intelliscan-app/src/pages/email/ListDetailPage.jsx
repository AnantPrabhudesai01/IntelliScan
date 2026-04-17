import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, ArrowLeft, Download, Filter, Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getStoredToken } from '../../utils/auth.js';
import toast from 'react-hot-toast';

export default function ListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [matchingContacts, setMatchingContacts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  async function fetchListData() {
    try {
      const res = await fetch(`/api/email/lists/${id}`, {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setList(data.list);
        setContacts(data.contacts);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch list details failed:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListData();
  }, [id]);

  const handleFetchMatchingContacts = async () => {
    setImporting(true);
    try {
      // In a real app, this would be a filtered CRM/Contacts fetch
      // For now, we fetch all and let user pick
      const res = await fetch('/api/contacts', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data?.contacts || []);

      // Filter out those already in the list
      const existingEmails = new Set((contacts || []).map(c => String(c.email || '').toLowerCase()).filter(Boolean));

      const toListShape = (c) => {
        const parts = String(c?.name || '').trim().split(/\s+/).filter(Boolean);
        const first_name = parts[0] || '';
        const last_name = parts.slice(1).join(' ');
        return {
          id: c?.id,
          email: c?.email,
          first_name,
          last_name,
          company: c?.company || '',
          selected: false
        };
      };

      const available = rows
        .filter(c => c?.email && !existingEmails.has(String(c.email).toLowerCase()))
        .map(toListShape);

      setMatchingContacts(available);
    } catch (err) {
      console.error('Fetch contacts failed:', err);
    }
    setImporting(false);
  };

  const handleImport = async (selectedContacts) => {
    setIsInjecting(true);
    try {
      const res = await fetch(`/api/email/lists/${id}/contacts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ contacts: selectedContacts })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Contacts injected successfully!', {
          style: { borderRadius: '10px', background: '#21132E', color: '#fff' }
        });
        fetchListData();
        setShowImportModal(false);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Connection error: Failed to reach marketing server');
    } finally {
      setIsInjecting(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/dashboard/email-marketing/lists')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Audiences
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-white tracking-widest uppercase truncate max-w-xl">
              {loading ? 'Loading...' : list?.name}
            </h1>
            {!loading && (
              <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                {list?.contact_count} Active Contacts
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setShowImportModal(true);
              handleFetchMatchingContacts();
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} /> Add Contacts
          </button>
          <button className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-gray-700">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between bg-gray-800/20">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search segment contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-2">
            Viewing {filteredContacts.length} of {contacts.length} total
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/10 text-[10px] font-black uppercase text-gray-600 tracking-widest">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Added</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-600 italic">No contacts in this segment. Use "Add Contacts" to begin.</td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter shadow-lg shadow-indigo-600/20">
                          {c.first_name?.[0] || c.email?.[0]}
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {c.first_name ? `${c.first_name} ${c.last_name || ''}` : 'Unknown Ident'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{c.company || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-400 font-mono">{c.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        c.subscribed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {c.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-500 font-mono">{format(new Date(c.added_at), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-rose-500/10 text-gray-600 hover:text-rose-400 transition-all rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <Sparkles className="text-indigo-400" /> Intake Intelligence
                </h2>
                <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-white transition-colors">Close</button>
              </div>

              <div className="flex-1 overflow-auto bg-gray-800/30 border border-gray-800 rounded-2xl mb-6">
                {importing ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Scoping CRM Data...</p>
                  </div>
                ) : matchingContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 p-8 text-center">
                    <CheckCircle className="text-emerald-500 mb-4" size={32} />
                    <p className="text-sm font-bold text-white">Audience Fully Synced</p>
                    <p className="text-xs text-gray-500 mt-1">All compatible IntelliScan contacts are already in this segment.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-800 bg-gray-800/10 text-[9px] font-black uppercase text-gray-600 tracking-widest">
                          <th className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={matchingContacts.length > 0 && matchingContacts.every(c => c.selected)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setMatchingContacts(prev => prev.map(item => ({ ...item, selected: checked })));
                              }}
                            />
                          </th>
                          <th className="px-4 py-3">Contact</th>
                         <th className="px-4 py-3">Email</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800/30">
                        {matchingContacts.map(mc => (
                          <tr key={mc.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  id={`mc-${mc.id}`} 
                                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                                  checked={!!mc.selected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setMatchingContacts(prev => prev.map(item => item.id === mc.id ? {...item, selected: checked} : item));
                                  }}
                                />
                            </td>
                            <td className="px-4 py-3">
                              <label htmlFor={`mc-${mc.id}`} className="text-xs font-bold text-gray-200 uppercase tracking-tighter h-full w-full block cursor-pointer">
                                {mc.first_name || 'Nameless'} {mc.last_name || ''}
                              </label>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 font-mono tracking-tighter">{mc.email}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                )}
              </div>

              <div className="flex gap-4">
                  disabled={matchingContacts.filter(m => m.selected).length === 0 || isInjecting}
                  onClick={() => handleImport(matchingContacts.filter(m => m.selected))}
                  className="flex-1 py-4 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                 >
                   {isInjecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                   {isInjecting ? 'Processing Architecture...' : `Inject ${matchingContacts.filter(m => m.selected).length} selected profiles`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
