import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, Plus, ArrowLeft, Save, Trash2, Clock, Sparkles, User, Send, CheckCircle2 } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

export default function SequenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState(null);
  const [steps, setSteps] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    fetchSequenceData();
    fetchModels();
  }, [id]);

  const fetchModels = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/system/ai-models', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableModels(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI models:', err);
    }
  };

  const fetchSequenceData = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      // Fetch sequence basic info
      const seqRes = await fetch(`/api/email-sequences/sequences/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!seqRes.ok) throw new Error('Failed to fetch sequence');
      const seqData = await seqRes.json();
      setSequence(seqData.sequence);
      setSteps(seqData.steps || []);
      setEnrollments(seqData.enrollments || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading sequence data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddStep = () => {
    const newStep = {
      order_index: steps.length + 1,
      delay_days: 1,
      subject: "Follow-up",
      html_body: "Hi {{name}},\n\nJust following up on our meeting at {{company}}...",
      ai_intent: "Write a friendly follow-up email",
      ai_model: "gemini"
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleDeleteStep = (index) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order_index: i + 1 }));
    setSteps(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/email-sequences/sequences/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: sequence.name, steps })
      });
      if (res.ok) {
        showToast('✦ Sequence saved successfully');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      showToast('failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative">
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in ${
          toast.type === 'error' ? 'bg-red-900/90 text-red-100 border-red-500/50' : 'bg-indigo-900/90 text-indigo-100 border-indigo-500/50 backdrop-blur-xl'
        }`}>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <input 
              type="text"
              value={sequence?.name || ''}
              onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
              className="text-3xl font-black text-white tracking-tighter uppercase leading-none bg-transparent border-none outline-none focus:text-indigo-400 transition-colors w-full"
              placeholder="Sequence Name"
            />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">AI Outreach Lifecycle</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Step Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-headline font-black text-white flex items-center gap-2">
              <Zap size={20} className="text-indigo-400" /> Sequence Steps
            </h2>
            <button 
              onClick={handleAddStep}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-indigo-400 hover:text-white hover:border-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Add Step
            </button>
          </div>

          <div className="space-y-4 relative">
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gray-800 border-l border-dashed border-gray-700" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-12 group">
                {/* Step Pin */}
                <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-black text-gray-400 group-hover:border-indigo-500 transition-colors">
                  {idx + 1}
                </div>
                
                <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700 transition-all backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Subject Template</label>
                      <input 
                        type="text" 
                        value={step.subject}
                        onChange={(e) => handleUpdateStep(idx, 'subject', e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Wait Days</label>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <input 
                          type="number" 
                          value={step.delay_days}
                          onChange={(e) => handleUpdateStep(idx, 'delay_days', parseInt(e.target.value))}
                          className="bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 w-24 font-bold"
                        />
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Days after last</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={12} /> AI Intent
                      </label>
                      <textarea 
                        placeholder="e.g., Congratulate them on meeting at the booth..."
                        value={step.ai_intent || ''}
                        onChange={(e) => handleUpdateStep(idx, 'ai_intent', e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 h-20 resize-none font-medium leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">AI Model Engine</label>
                      <select 
                        value={step.ai_model || 'gemini'}
                        onChange={(e) => handleUpdateStep(idx, 'ai_model', e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 font-bold appearance-none"
                      >
                        <option value="gemini">Gemini 3 Flash (Default)</option>
                        {availableModels.map(m => (
                          <option key={m.id} value={m.apiId}>{m.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-600 mt-2 font-medium italic">High reliability with fallback support.</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fallback Email Body</label>
                      <button 
                        onClick={() => handleDeleteStep(idx)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea 
                      value={step.html_body}
                      onChange={(e) => handleUpdateStep(idx, 'html_body', e.target.value)}
                      className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-[13px] text-gray-400 outline-none focus:border-indigo-500 h-24 font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              onClick={handleAddStep}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-400 text-xs font-black uppercase tracking-widest transition-all"
            >
              <Plus size={16} /> New Follow-up Step
            </button>
          </div>
        </div>

        {/* Right: Active Analytics & Enrollments */}
        <div className="space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Sequence Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Enrollments</span>
                <span className="text-lg font-black text-white">{enrollments.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Automation Mode</span>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">AI Generative</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Status</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 flex flex-col h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-400" /> Active Leads
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <User size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No leads enrolled.</p>
                </div>
              ) : (
                enrollments.map((enr, i) => (
                  <div key={i} className="flex items-center justify-between group bg-gray-950/30 p-2 rounded-xl hover:bg-indigo-500/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/20">
                        {enr.contact_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-black text-white leading-none">{enr.contact_name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                            enr.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {enr.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step {enr.current_step_index + 1} • {new Date(enr.next_send_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-700 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
