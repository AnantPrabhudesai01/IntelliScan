import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Lightbulb, HelpCircle, Check, Clock, User, ArrowRight, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import apiClient from '../api/client';

const DUMMY_FEEDBACK = [
  {
    id: 'FB-001',
    type: 'bug',
    subject: 'OCR struggles with dark blue background cards',
    message: 'I tried scanning 5 cards from a specific vendor that uses a navy blue background with silver text, and the confidence score dropped to 42%. It completely missed the company name.',
    user: 'Jane Doe',
    email: 'jane@techstart.io',
    role: 'business_admin',
    date: '2026-03-26T09:14:00Z',
    status: 'new',
  },
  {
    id: 'FB-002',
    type: 'feature',
    subject: 'Direct export to HubSpot CRM',
    message: 'We currently use the CSV export feature but it would save our sales team about 2 hours a week if we could just press a button to sync directly to our HubSpot pipeline.',
    user: 'Alex Mercer',
    email: 'alex.m@acmecorp.com',
    role: 'user',
    date: '2026-03-25T14:30:00Z',
    status: 'reviewed',
  },
  {
    id: 'FB-003',
    type: 'support',
    subject: 'Cannot add new members to workspace',
    message: "I am trying to invite 3 new engineers to our workspace but I keep getting a 'Quota Exceeded' error even though we are on the Enterprise plan.",
    user: 'Sarah Jenkins',
    email: 's.jenkins@logistics.net',
    role: 'business_admin',
    date: '2026-03-24T11:20:00Z',
    status: 'resolved',
  },
  {
    id: 'FB-004',
    type: 'general',
    subject: 'Great new dashboard redesign',
    message: 'Just wanted to say the new dark mode and the network graphs on the analytics page look fantastic. Great job to the engineering team!',
    user: 'Tom Baker',
    email: 'tom@baker-design.co',
    role: 'user',
    date: '2026-03-22T16:05:00Z',
    status: 'new',
  }
];

export default function SuperAdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await apiClient.get('/feedbacks');
        setFeedback(res.data);
      } catch (err) {
        console.error('Failed to fetch feedback', err);
      }
    };

    // Initial fetch
    fetchFeedback();

    // Poll every 2 seconds for perfect real-time syncing across browsers
    const interval = setInterval(fetchFeedback, 2000);
    return () => clearInterval(interval);
  }, []);

  const getIconForType = (type) => {
    switch (type) {
      case 'bug': return <AlertCircle size={14} className="text-red-500" />;
      case 'feature': return <Lightbulb size={14} className="text-amber-500" />;
      case 'support': return <HelpCircle size={14} className="text-emerald-500" />;
      default: return <MessageSquare size={14} className="text-brand-500" />;
    }
  };

  const getBadgeForType = (type) => {
    switch (type) {
      case 'bug': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'feature': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'support': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-brand-500/10 text-brand-500 border-brand-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <span className="px-2 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock size={12} /> New</span>;
      case 'reviewed': return <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><ArrowRight size={12} /> Reviewed</span>;
      case 'resolved': return <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle2 size={12} /> Resolved</span>;
      default: return null;
    }
  };

  const markAs = async (id, newStatus) => {
    // Optimistic update
    const updated = feedback.map(f => f.id === id ? { ...f, status: newStatus } : f);
    setFeedback(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }

    // Server persistence
    try {
      await apiClient.patch(`/feedbacks/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const transmitResponse = async () => {
    if (!selectedItem || !replyText.trim() || sending) return;
    
    setSending(true);
    try {
      await apiClient.post(`/feedbacks/${selectedItem.id}/respond`, {
        response: replyText,
        status: selectedItem.status === 'new' ? 'reviewed' : selectedItem.status
      });
      
      // Update local state
      const updated = feedback.map(f => 
        f.id === selectedItem.id ? { ...f, admin_response: replyText, status: f.status === 'new' ? 'reviewed' : f.status } : f
      );
      setFeedback(updated);
      setSelectedItem({ ...selectedItem, admin_response: replyText, status: selectedItem.status === 'new' ? 'reviewed' : selectedItem.status });
      setReplyText('');
      alert('Transmission successful. Response synced to user node.');
    } catch (err) {
      console.error('Transmission failure:', err);
      alert('Failed to transmit response. Check core connection.');
    } finally {
      setSending(false);
    }
  };

  const filteredData = filter === 'all' ? feedback : feedback.filter(f => f.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-[var(--brand)]/10 rounded-2xl border border-[var(--brand)]/20 shadow-inner">
               <MessageSquare size={24} className="text-[var(--brand)]" />
             </div>
             <div>
               <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight">Neural <br/>Feedback</h1>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">User Ingestion Stream</p>
             </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
             Review, categorize, and archive atomic user submissions across the global node infrastructure. Precision response active.
          </p>
        </div>
        <div className="flex bg-[var(--surface-card)] p-1.5 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
          {['all', 'new', 'reviewed', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20 italic font-headline' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] underline-offset-4 hover:underline'}`}
            >
              {f} {f === 'new' && feedback.filter(x => x.status === 'new').length > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">{feedback.filter(x => x.status === 'new').length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative items-start">
        {/* Inbox List */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-32 max-h-[calc(100vh-12rem)] overflow-y-auto pr-4 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="py-20 bg-[var(--surface-card)] rounded-[2.5rem] border border-dashed border-[var(--border-subtle)] text-center space-y-4 premium-grain">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Matrix Empty. Inbox Zero Achieved.</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden premium-grain
                  ${selectedItem?.id === item.id
                    ? 'bg-[var(--brand)]/[0.03] border-[var(--brand)] shadow-xl shadow-[var(--brand)]/5'
                    : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border bg-white/5 ${getBadgeForType(item.type)}`}>
                      {getIconForType(item.type)}
                    </div>
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{item.id}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <h3 className={`text-sm font-headline font-black italic tracking-tighter uppercase mb-2 line-clamp-1 ${selectedItem?.id === item.id ? 'text-[var(--text-main)]' : 'text-[var(--text-main)]/80'}`}>
                  {item.subject}
                </h3>
                <p className={`text-[11px] line-clamp-2 mb-6 leading-relaxed font-medium ${selectedItem?.id === item.id ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]/60'}`}>
                  {item.message}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 italic"><User size={10} strokeWidth={3} className="text-[var(--brand)]" /> {item.user}</span>
                   <div className="scale-75 origin-right">
                     {getStatusBadge(item.status)}
                   </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in flex flex-col h-full min-h-[600px] premium-grain">
              {/* Header */}
              <div className="p-10 border-b border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-xl relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border bg-white/5 ${getBadgeForType(selectedItem.type)}`}>
                    {selectedItem.type.replace('-', ' ')}
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedItem.status !== 'resolved' && (
                      <button onClick={() => markAs(selectedItem.id, 'resolved')} className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                        <Check size={14} strokeWidth={3} /> Resolve Node
                      </button>
                    )}
                    {selectedItem.status === 'new' && (
                      <button onClick={() => markAs(selectedItem.id, 'reviewed')} className="flex items-center gap-3 px-6 py-2.5 bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-[var(--brand)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand)]/20 transition-all">
                        <ArrowRight size={14} strokeWidth={3} /> Review Pass
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight mb-4">{selectedItem.subject}</h2>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  <span className="flex items-center gap-2 italic"><Clock size={12} className="text-[var(--brand)]" /> {new Date(selectedItem.date).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                  <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                  <span>Ticket Vector: {selectedItem.id}</span>
                  <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                  <div className="scale-75 origin-left">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-10 flex-1 relative z-10">
                {/* User Info Card */}
                <div className="mb-10 flex items-center gap-6 p-6 rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-inner">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] font-headline font-black italic text-2xl shadow-inner">
                    {selectedItem.user.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">{selectedItem.user}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 italic">{selectedItem.email} <span className="mx-2 opacity-30">•</span> {selectedItem.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Atomic Transmission</p>
                   <div className="text-[14px] leading-relaxed text-[var(--text-muted)] font-medium bg-[var(--surface)] p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-inner relative overflow-hidden">
                     <p className="relative z-10 whitespace-pre-wrap">{selectedItem.message}</p>
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none italic font-headline font-black text-6xl tracking-tighter uppercase">RAW</div>
                   </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-xl flex gap-4 relative z-10">
                <input 
                  type="text" 
                  placeholder="Add infrastructure note or reply..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && transmitResponse()}
                  className="flex-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl px-8 text-[12px] font-medium text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all shadow-inner" 
                />
                <button 
                  onClick={transmitResponse}
                  disabled={sending || !replyText.trim()}
                  className="bg-[var(--brand)] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all italic font-headline disabled:opacity-50"
                >
                  {sending ? 'Transmitting...' : 'Transmit Response'}
                </button>
              </div>
              
              {/* Display existing response if any */}
              {selectedItem.admin_response && (
                <div className="mx-10 mb-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Previous Transmission</p>
                  <p className="text-[12px] text-[var(--text-muted)] italic font-medium">"{selectedItem.admin_response}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-[2.5rem] bg-[var(--surface-card)] premium-grain opacity-40">
              <div className="w-24 h-24 rounded-[2rem] bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-10 shadow-inner">
                <MessageSquare size={40} className="text-[var(--text-muted)] opacity-40" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-muted)] uppercase mb-2">Node Idle</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">Awaiting Ticket Selection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
