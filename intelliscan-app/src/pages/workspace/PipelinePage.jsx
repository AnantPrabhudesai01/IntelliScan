import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ChevronRight, 
  DollarSign, 
  Filter, 
  Layers, 
  MoreHorizontal, 
  Plus, 
  Search, 
  TrendingUp,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Contact2,
  IndianRupee
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

const STAGES = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];

export default function PipelinePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [dealForm, setDealForm] = useState({ stage: 'Prospect', value: 0, notes: '', expected_close: '' });
  const [draggedOverStage, setDraggedOverStage] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Real-time Sync Listener
    const { socket } = require('../../utils/socket');
    socket.on('contacts_updated', (data) => {
      console.debug('[Socket] Pipeline update received:', data);
      fetchData();
    });

    return () => {
      socket.off('contacts_updated');
    };
  }, []);

  const fetchData = async () => {
    const token = getStoredToken();
    try {
      const res = await fetch('/api/deals', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load deals');
      setContacts(data.deals || []);
      setLoading(false);
    } catch (err) {
      console.error('Pipeline fetch failed:', err);
      setLoading(false);
    }
  };

  const updateDeal = async (contactId, newData) => {
    const token = getStoredToken();
    try {
      const res = await fetch(`/api/contacts/${contactId}/deal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newData)
      });
      if (res.ok) {
        fetchData();
        setIsUpdateModalOpen(false);
      }
    } catch (err) {
      console.error('Update deal failed:', err);
    }
  };

  const handleDragStart = (e, contactId) => {
    e.dataTransfer.setData('contactId', contactId);
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    setDraggedOverStage(null);
    const contactId = e.dataTransfer.getData('contactId');
    
    // Optimistic Update
    const updated = contacts.map(c => 
      c.id === Number(contactId) ? { ...c, deal_status: stage } : c
    );
    setContacts(updated);
    
    updateDeal(contactId, { stage });
  };

  const allowDrop = (e, stage) => {
    e.preventDefault();
    if (draggedOverStage !== stage) setDraggedOverStage(stage);
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalValue: contacts.reduce((sum, c) => sum + (c.deal_value || 0), 0),
    count: contacts.length,
    closedValue: contacts.filter(c => c.deal_status === 'Closed').reduce((sum, c) => sum + (c.deal_value || 0), 0)
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Pipeline...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 font-headline">
            <Layers className="text-brand-600" size={36} />
            Sales Pipeline
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your relationship funnel and revenue forecast.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 min-w-[180px]">
             <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                <TrendingUp size={20} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Pipeline</p>
                <p className="text-xl font-black text-gray-900 dark:text-white font-headline">{CURRENCY_SYMBOL}{formatCurrency(stats.totalValue)}</p>
             </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 min-w-[180px]">
             <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600">
                <CheckCircle2 size={20} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Closed Won</p>
                <p className="text-xl font-black text-gray-900 dark:text-white font-headline">{CURRENCY_SYMBOL}{formatCurrency(stats.closedValue)}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search deals by name or company..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[600px] overflow-x-auto pb-10">
        {STAGES.map(stage => {
          const stageContacts = filteredContacts.filter(c => (c.deal_status || 'Prospect') === stage);
          const stageValue = stageContacts.reduce((sum, c) => sum + (c.deal_value || 0), 0);

          return (
            <div 
              key={stage} 
              className="flex flex-col gap-4 min-w-[280px]"
              onDragOver={(e) => allowDrop(e, stage)}
              onDragLeave={() => setDraggedOverStage(null)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage === 'Closed' ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                  <h3 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-tighter text-sm">{stage}</h3>
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-full">{stageContacts.length}</span>
                </div>
                <p className="text-[10px] font-black text-brand-600 dark:text-brand-400">{CURRENCY_SYMBOL}{formatCurrency(stageValue)}</p>
              </div>

              <div className={`flex-1 rounded-3xl p-3 border border-dashed transition-all duration-300 space-y-4 ${
                draggedOverStage === stage 
                  ? 'bg-brand-50/50 dark:bg-brand-900/20 border-brand-400 dark:border-brand-500 shadow-inner' 
                  : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800'
              }`}>
                {stageContacts.map(contact => (
                  <div 
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    onClick={() => {
                        setSelectedContact(contact);
                        setDealForm({ 
                            stage: contact.deal_status || 'Prospect', 
                            value: contact.deal_value || 0, 
                            notes: contact.deal_notes || '', 
                            expected_close: contact.expected_close || '' 
                        });
                        setIsUpdateModalOpen(true);
                    }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 dark:hover:border-brand-500/50 transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <div className="font-black text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate pr-2">{contact.name}</div>
                       <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                          <User size={14} />
                       </div>
                    </div>
                    
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate mb-4">{contact.company || contact.title}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                       <div className="flex items-center gap-1 text-[10px] font-black text-brand-600 dark:text-brand-400">
                          <IndianRupee size={10} />
                          {formatCurrency(contact.deal_value || 0)}
                       </div>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <Calendar size={10} />
                          {contact.deal_date ? new Date(contact.deal_date).toLocaleDateString() : 'Set date'}
                       </div>
                    </div>
                  </div>
                ))}

                {stageContacts.length === 0 && (
                   <div className="py-10 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop contact here</p>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* UPDATE DEAL MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-8 space-y-6">
              <header className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white font-headline">Manage Deal</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updating opportunity for <span className="text-brand-600 font-bold">{selectedContact?.name}</span></p>
                </div>
                <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <Plus size={24} className="rotate-45" />
                </button>
              </header>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Pipeline Stage</label>
                  <select 
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({...dealForm, stage: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-bold outline-none ring-brand-500/20 focus:ring-4"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Deal Value ({CURRENCY_SYMBOL})</label>
                    <input 
                      type="number" 
                      value={dealForm.value}
                      onChange={(e) => setDealForm({...dealForm, value: Number(e.target.value)})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-bold outline-none ring-brand-500/20 focus:ring-4"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Expected Close</label>
                    <input 
                      type="date" 
                      value={dealForm.expected_close}
                      onChange={(e) => setDealForm({...dealForm, expected_close: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-bold outline-none ring-brand-500/20 focus:ring-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Notes</label>
                  <textarea 
                    value={dealForm.notes}
                    onChange={(e) => setDealForm({...dealForm, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-bold outline-none ring-brand-500/20 focus:ring-4 resize-none"
                    placeholder="Enter deal insights..."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => updateDeal(selectedContact.id, dealForm)}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 transition-all active:scale-95"
                >
                  Save Opportunity Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
