import { Mail, Edit, Trash2, Send, Clock, User, Building2, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth.js';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if(res.ok) setDrafts(data);
    } catch(err) { console.error('Failed to fetch drafts', err); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDrafts();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSend = async (id) => {
    try {
      const res = await fetch(`/api/drafts/${id}/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${getStoredToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.sent) {
        setDrafts(prev => prev.filter(d => d.id !== id));
        showToast(`✅ ${data.message}`);
      } else if (data.success === false && data.message) {
        showToast(data.message);
      } else {
        setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'sent' } : d));
        showToast(data.message || 'Draft dispatched!');
      }
    } catch(err) {
      console.error('Failed to send draft:', err);
      showToast('Failed to send draft. Please retry.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/drafts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      setDrafts(prev => prev.filter(d => d.id !== id));
      showToast('Draft deleted permanently from database.');
    } catch(err) {
      console.error('Failed to delete draft:', err);
      showToast('Failed to delete draft. Please retry.');
    }
  };

  const handleSaveEdit = () => {
    if (!editingDraft) return;
    setDrafts(prev => prev.map(d => d.id === editingDraft.id ? { ...editingDraft, status: 'ready' } : d));
    setEditingDraft(null);
    showToast('Draft updated and marked as Ready to Send.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold">
          <CheckCircle2 size={18} className="text-green-400 dark:text-green-600" />
          {toast}
        </div>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingDraft(null)}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit AI Draft</h3>
              <button onClick={() => setEditingDraft(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">To</label>
                <input type="text" disabled value={`${editingDraft.contact_name}`} className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                <input type="text" value={editingDraft.subject} onChange={e => setEditingDraft({...editingDraft, subject: e.target.value})} className="w-full mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                <textarea rows={6} value={editingDraft.body} onChange={e => setEditingDraft({...editingDraft, body: e.target.value})} className="w-full mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-serif leading-relaxed" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-950">
              <button onClick={() => setEditingDraft(null)} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">Save & Mark Ready</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          AI Drafts <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-black">{drafts.length}</span>
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review and send personalized follow-up emails instantly generated by Gemini AI after each scan.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <Mail className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inbox Zero!</h3>
          <p className="text-sm text-gray-500">All AI drafts have been processed and sent.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {drafts.map((draft) => (
            <div key={draft.id} className="p-5 flex flex-col sm:flex-row gap-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
              {/* Left side info */}
              <div className="sm:w-64 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 pb-4 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${draft.status === 'ready' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {draft.status === 'ready' ? 'Ready to Send' : 'Needs Review'}
                  </p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm"><User size={14} className="text-gray-400" /> {draft.contact_name}</p>
                {draft.contact_email && (
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 mt-1 truncate"><Mail size={11} /> {draft.contact_email}</p>
                )}
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-3"><Clock size={12} /> {new Date(draft.created_at).toLocaleString()}</p>
              </div>
              
              {/* Email Preview */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Subject:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{draft.subject}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300 font-serif leading-relaxed line-clamp-2 italic">
                    "{draft.body}"
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 transition-opacity">
                  <button onClick={() => handleDelete(draft.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Draft">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setEditingDraft(draft)} className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleSend(draft.id)} className="flex items-center gap-2 px-5 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/30">
                    <Send size={14} /> Send Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
