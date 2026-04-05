import React, { useState, useEffect } from 'react';
import { Link, Copy, Edit2, Trash2, Plus, Loader2, CheckCircle2, Globe, Clock, Sparkles } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

export default function BookingLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const [formData, setFormData] = useState({
    title: '30 Minute Meeting',
    slug: 'meeting-30',
    duration_minutes: 30,
    color: '#7b2fff',
    questions: [
      { id: 1, label: 'Name', required: true, type: 'text' },
      { id: 2, label: 'Email', required: true, type: 'email' },
      { id: 3, label: 'Company', required: false, type: 'text' },
      { id: 4, label: 'Notes', required: false, type: 'textarea' }
    ]
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/calendar/booking-links', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calendar/booking-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowNewModal(false);
        fetchLinks();
      }
    } catch (err) {
      console.error('Failed to create link:', err);
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Booking Links</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Calendly-style Scheduling</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} /> Create New Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <div key={link.id} className="group bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="h-2" style={{ backgroundColor: link.color || '#7b2fff' }}></div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <Clock size={20} className="text-indigo-600" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  link.is_active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                }`}>
                  {link.is_active ? 'Active' : 'Paused'}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2 truncate">
                {link.title}
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-widest">
                {link.duration_minutes} Minute Session
              </p>

              <div className="flex-1"></div>

              <div className="space-y-3 pt-6 border-t border-gray-50 dark:border-gray-900">
                <button
                  onClick={() => copyToClipboard(link.slug)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-black rounded-2xl border border-gray-100 dark:border-gray-800 transition-all"
                >
                  {copiedSlug === link.slug ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copiedSlug === link.slug ? 'Copied URL!' : 'Copy Link'}
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black rounded-xl border border-gray-100 dark:border-gray-800 transition-all uppercase tracking-widest">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 dark:text-red-900/50 hover:text-red-600 dark:hover:text-red-400 text-[10px] font-black rounded-xl border border-gray-100 dark:border-gray-800 transition-all uppercase tracking-widest">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="col-span-full py-20 bg-white dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] flex flex-col items-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
              <Globe size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">No Booking Links Yet</h3>
            <p className="text-gray-500 font-medium max-w-sm">Create a professional booking link to share with your contacts and automate your schedule.</p>
          </div>
        )}
      </div>

      {/* New Link Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                   <Plus className="text-white" size={20} />
                 </div>
                 <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">New Booking Link</h2>
               </div>
               <button onClick={() => setShowNewModal(false)} className="text-gray-400"><Trash2 size={20}/></button>
             </div>
             <form onSubmit={handleCreate} className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Event Title</label>
                 <input
                   type="text"
                   value={formData.title}
                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Static Slug URL</label>
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-gray-400">/book/</span>
                   <input
                     type="text"
                     value={formData.slug}
                     onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                     className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Duration (min)</label>
                   <input
                     type="number"
                     value={formData.duration_minutes}
                     onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                     className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Color Theme</label>
                   <input
                     type="color"
                     value={formData.color}
                     onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                     className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer"
                   />
                 </div>
               </div>
               <button
                 type="submit"
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
               >
                 Activate Booking Link
               </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
