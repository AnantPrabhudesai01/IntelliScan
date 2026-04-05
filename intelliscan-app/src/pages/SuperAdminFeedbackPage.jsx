import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Lightbulb, HelpCircle, Check, Clock, User, ArrowRight, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';

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
  const [feedback, setFeedback] = useState(DUMMY_FEEDBACK);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const getIconForType = (type) => {
    switch (type) {
      case 'bug': return <AlertCircle size={14} className="text-red-500" />;
      case 'feature': return <Lightbulb size={14} className="text-amber-500" />;
      case 'support': return <HelpCircle size={14} className="text-emerald-500" />;
      default: return <MessageSquare size={14} className="text-indigo-500" />;
    }
  };

  const getBadgeForType = (type) => {
    switch (type) {
      case 'bug': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'feature': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'support': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock size={12}/> New</span>;
      case 'reviewed': return <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><ArrowRight size={12}/> Reviewed</span>;
      case 'resolved': return <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Resolved</span>;
      default: return null;
    }
  };

  const markAs = (id, newStatus) => {
    setFeedback(feedback.map(f => f.id === id ? { ...f, status: newStatus } : f));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const filteredData = filter === 'all' ? feedback : feedback.filter(f => f.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-gray-900 dark:text-white mb-2">User Feedback Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review, categorize, and respond to user submissions across the platform.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-[#1a2035] p-1 rounded-xl border border-gray-200 dark:border-white/5">
          {['all', 'new', 'reviewed', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {f} {f === 'new' && feedback.filter(x => x.status === 'new').length > 0 && <span className="ml-1 bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{feedback.filter(x => x.status === 'new').length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative items-start">
        {/* Inbox List */}
        <div className="lg:col-span-1 space-y-3 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a2035] rounded-2xl border border-gray-200 dark:border-white/5">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-3 opacity-50" />
              <p className="text-gray-500 text-sm font-medium">Inbox zero! No feedback found.</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-4 rounded-2xl border transition-all 
                  ${selectedItem?.id === item.id 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                    : 'bg-white dark:bg-[#1a2035] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getIconForType(item.type)}
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.id}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${selectedItem?.id === item.id ? 'text-indigo-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                  {item.subject}
                </h3>
                <p className={`text-xs line-clamp-2 mb-3 ${selectedItem?.id === item.id ? 'text-indigo-700/80 dark:text-indigo-200/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5"><User size={12}/> {item.user}</span>
                  {getStatusBadge(item.status)}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in flex flex-col h-full min-h-[500px]">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getBadgeForType(selectedItem.type)}`}>
                    {selectedItem.type.replace('-', ' ')}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItem.status !== 'resolved' && (
                      <button onClick={() => markAs(selectedItem.id, 'resolved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors">
                        <Check size={14} /> Resolve
                      </button>
                    )}
                    {selectedItem.status === 'new' && (
                      <button onClick={() => markAs(selectedItem.id, 'reviewed')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold transition-colors">
                        <ArrowRight size={14} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-headline text-gray-900 dark:text-white mb-2">{selectedItem.subject}</h2>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(selectedItem.date).toLocaleString()}</span>
                  <span>Ticket ID: {selectedItem.id}</span>
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1">
                {/* User Info Card */}
                <div className="mb-6 flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg">
                    {selectedItem.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.user}</h4>
                    <p className="text-xs text-gray-500">{selectedItem.email} • {selectedItem.role}</p>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-black/20 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                    {selectedItem.message}
                  </p>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex gap-3">
                <input type="text" placeholder="Add an internal note or reply..." className="flex-1 bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500" />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors">Send</button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]">
              <MessageSquare size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">Select a Feedback Ticket</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">Choose an item from the inbox to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
