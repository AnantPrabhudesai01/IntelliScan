import React, { useState, useEffect } from 'react';
import { Zap, Plus, ArrowRight, Sparkles, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [error, setError] = useState(null);

  async function fetchSequences() {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/email-sequences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setSequences(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch sequences:', err);
      setError('Failed to load sequences. ' + err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSequences();
  }, []);

  const handleCreateSequence = async () => {
    if (!newSequenceName.trim()) return;
    setIsCreating(true);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/email-sequences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newSequenceName,
          steps: [
            { step_number: 1, delay_days: 0, subject: "Great meeting you!", template_body: "Hi {{name}}, it was great connecting at {{company}}..." },
            { step_number: 2, delay_days: 3, subject: "Sharing some insights", template_body: "Hi {{name}}, I thought you might find this article interesting..." },
            { step_number: 3, delay_days: 7, subject: "Quick coffee chat?", template_body: "Hi {{name}}, are you open for a 15-minute call next week?" }
          ]
        })
      });
      if (res.ok) {
        setNewSequenceName('');
        setIsCreating(false);
        fetchSequences();
      }
    } catch (err) {
      console.error('Failed to create sequence:', err);
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            AI <span className="text-indigo-500">Outreach</span> Sequences
          </h1>
          <p className="text-gray-400 font-medium">Automated multi-step networking loops powered by Gemini AI.</p>
        </div>
        <div className="flex bg-gray-900 border border-gray-800 p-2 rounded-2xl items-center gap-3">
          <input 
            type="text" 
            placeholder="New sequence name..." 
            className="bg-transparent border-none outline-none text-sm font-bold text-white pl-2 w-48"
            value={newSequenceName}
            onChange={(e) => setNewSequenceName(e.target.value)}
          />
          <button 
            onClick={handleCreateSequence}
            disabled={isCreating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : <><Plus size={16} /> Create</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Sequences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl h-48 animate-pulse" />
          ))
        ) : sequences.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-900/40 border-2 border-dashed border-gray-800 rounded-3xl">
            <Sparkles size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-bold">No sequences yet. Start by defining your outreach flow.</p>
          </div>
        ) : (
          sequences.map((seq) => (
            <div key={seq.id} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl group hover:border-indigo-500/50 transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                    <button className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{seq.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-4">3 Step Sequence</p>
                
                <div className="space-y-3 relative">
                  <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-800" />
                  <div className="flex items-center gap-3 relative">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-gray-900" />
                    <span className="text-[11px] font-bold text-gray-300">Step 1: Immediate Outreach</span>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-900" />
                    <span className="text-[11px] font-bold text-gray-500">Step 2: Value-Add (3 Days)</span>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-900" />
                    <span className="text-[11px] font-bold text-gray-500">Step 3: Coffee Chat (7 Days)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> AI Active
                </span>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-tighter">
                  View Detail <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pro Tips */}
      <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl">
        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" /> Sequencing Best Practices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-400">Step 1: Relevancy</p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Use AI to reference a specific piece of news from their company to build trust immediately.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-400">Step 2: Value-Add</p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Wait at least 3 days. Send a resource or insight related to their inferred industry.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-400">Step 3: The Ask</p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Keep the call-to-action low friction. Suggest a 15-minute quick sync rather than a long meeting.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-400">Engagement</p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Sequences auto-stop if a contact responds, ensuring a human touch takes over.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
