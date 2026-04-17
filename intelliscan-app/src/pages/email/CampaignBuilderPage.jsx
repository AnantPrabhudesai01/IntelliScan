import React, { useState, useEffect } from 'react';
import { Mail, Users, FileText, Send, CheckCircle, Sparkles, ArrowLeft, ArrowRight, Save, Clock, Wand2, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import EmailPreview from '../../components/email/EmailPreview';
import { getStoredToken } from '../../utils/auth.js';

export default function CampaignBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  const totalAudience = lists
    .filter(l => campaign.list_ids.includes(l.id))
    .reduce((sum, l) => sum + (l.contact_count || 0), 0);

  // Campaign State
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    preview_text: '',
    from_name: 'IntelliScan Team',
    from_email: 'hello@intelliscan.ai',
    reply_to: 'support@intelliscan.ai',
    html_body: '',
    text_body: '',
    template_id: null,
    list_ids: []
  });

  async function fetchLists() {
    try {
      const res = await fetch('/api/email/lists', { headers: { 'Authorization': `Bearer ${getStoredToken()}` } });
      const data = await res.json();
      if (data.success) setLists(data.lists || []);
    } catch (err) {
      console.error('Fetch lists failed:', err);
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/email/templates', { headers: { 'Authorization': `Bearer ${getStoredToken()}` } });
      const data = await res.json();
      if (data.success) setTemplates(data.templates || []);
    } catch (err) {
      console.error('Fetch templates failed:', err);
    }
  }

  useEffect(() => {
    fetchLists();
    fetchTemplates();
    if (location.state?.useAI) {
      setStep(3); // Start at design if AI was clicked from dashboard
    }
  }, []);

  const canProceed = () => {
    if (step === 1) return campaign.name.trim() && campaign.subject.trim();
    if (step === 2) return campaign.list_ids.length > 0;
    if (step === 3) return campaign.html_body.trim();
    return true;
  };

  const handleGenerateAI = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/email/templates/generate-ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          purpose: 'High-Conversion Newsletter',
          tone: 'Professional, Modern & Vibrant',
          industry: 'Technology',
          companyName: 'IntelliScan',
          recipientType: 'New Business Contacts',
          keyMessage: 'Introducing our advanced AI-powered card scanning technology that transforms networking into growth.',
          callToAction: 'Book a Demo'
        })
      });
      const data = await res.json();
      if (data.success) {
        setCampaign(prev => ({
          ...prev,
          subject: data.subject || prev.subject,
          html_body: data.html || prev.html_body
        }));
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    }
    setAiGenerating(false);
  };

  const handleSave = async (isSend = false) => {
    if (!canProceed()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(campaign)
      });
      const data = await res.json();
      if (data.success) {
        const campaignId = data.campaign?.id || data.id;
        if (isSend && campaignId) {
          await fetch(`/api/email/campaigns/${campaignId}/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getStoredToken()}` }
          });
          setIsLaunched(true);
          setTimeout(() => navigate('/dashboard/email-marketing/campaigns'), 2500);
        } else {
          navigate('/dashboard/email-marketing/campaigns');
        }
      }
    } catch (err) {
      console.error('Save/Send failed:', err);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (templateIdRaw) => {
    const templateId = templateIdRaw ? Number(templateIdRaw) : null;
    if (!templateIdRaw) {
      setCampaign(prev => ({ ...prev, template_id: null, html_body: '' }));
      return;
    }

    const selected = templates.find(t => String(t.id) === String(templateIdRaw));
    setCampaign(prev => ({
      ...prev,
      template_id: templateId,
      subject: selected?.subject ?? prev.subject,
      preview_text: selected?.preview_text ?? prev.preview_text,
      html_body: selected?.html_body ?? prev.html_body,
      text_body: selected?.text_body ?? prev.text_body,
    }));
  };

  const stepsList = [
    { id: 1, label: 'Setup', icon: <Mail size={16} /> },
    { id: 2, label: 'Audience', icon: <Users size={16} /> },
    { id: 3, label: 'Design', icon: <FileText size={16} /> },
    { id: 4, label: 'Review', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col gap-6 animate-fade-in">
      {/* Step Progress */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-12 ml-4">
          {stepsList.map((s) => (
            <div key={s.id} className={`flex items-center gap-3 transition-all duration-500 ${step >= s.id ? 'opacity-100' : 'opacity-25 grayscale'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                step === s.id ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] text-white scale-110' : 
                step > s.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'
              }`}>
                {step > s.id ? <CheckCircle size={20} /> : s.icon}
              </div>
              <div className="hidden md:block">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-0.5 ${step === s.id ? 'text-indigo-400' : 'text-gray-500'}`}>
                  Step 0{s.id}
                </span>
                <span className={`text-xs font-black uppercase tracking-tight ${step === s.id ? 'text-white' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {s.id !== 4 && <div className={`ml-4 w-12 h-0.5 rounded-full transition-colors duration-500 ${step > s.id ? 'bg-emerald-500/30' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < 4 ? (
            <button 
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)} 
              className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => handleSave(true)}
              disabled={loading || !canProceed()}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <>Mission Launch <Send size={16} /></>}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden min-h-0">
        {/* Editor Area */}
        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 overflow-y-auto backdrop-blur-xl custom-scrollbar-hidden shadow-inner">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-left duration-700">
              <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-indigo-600 rounded-full" />
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Campaign <span className="text-indigo-500">Parameters</span></h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Define the core identity of this outreach pulse.</p>
              </div>
              <div className="space-y-8">
                <div className="group transition-all">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Campaign Internal Descriptor</label>
                  <input 
                    type="text" 
                    value={campaign.name}
                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                    placeholder="e.g. Q1 Global Tech Expansion - Phase 1"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold tracking-tight transition-all placeholder:text-gray-700"
                  />
                </div>
                <div className="group transition-all">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Recipient Subject Line</label>
                  <input 
                    type="text" 
                    value={campaign.subject}
                    onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                    placeholder="Enter an intriguing vector..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold tracking-tight transition-all placeholder:text-gray-700"
                  />
                </div>
                <div className="group transition-all">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Inbox Preview Abstract</label>
                  <input 
                    type="text" 
                    value={campaign.preview_text}
                    onChange={(e) => setCampaign({...campaign, preview_text: e.target.value})}
                    placeholder="The secondary hook in the inbox..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium transition-all placeholder:text-gray-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group transition-all">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Sender Display Identity</label>
                    <input 
                      type="text" 
                      value={campaign.from_name}
                      onChange={(e) => setCampaign({...campaign, from_name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold transition-all"
                    />
                  </div>
                  <div className="group transition-all">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Return Logic (Reply-To)</label>
                    <input 
                      type="email" 
                      value={campaign.reply_to}
                      onChange={(e) => setCampaign({...campaign, reply_to: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono text-xs transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-left duration-700">
               <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-indigo-600 rounded-full" />
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Audience <span className="text-indigo-500">Aggregation</span></h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Deploy this vector to one or more intelligence segments.</p>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {lists.length === 0 ? (
                  <div className="p-16 text-center bg-white/5 border border-white/5 border-dashed rounded-[2rem] flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-700 mb-6">
                      <Users size={32} />
                    </div>
                    <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No intelligence segments found.</p>
                    <Link to="/dashboard/email-marketing/lists" className="text-indigo-400 text-[10px] font-black uppercase mt-4 hover:text-indigo-300 underline decoration-indigo-500/30">Sync New Audience</Link>
                  </div>
                ) : (
                  lists.map(list => (
                    <div 
                      key={list.id} 
                      onClick={() => {
                        const ids = campaign.list_ids.includes(list.id) 
                          ? campaign.list_ids.filter(id => id !== list.id)
                          : [...campaign.list_ids, list.id];
                        setCampaign({...campaign, list_ids: ids});
                      }}
                      className={`p-8 bg-black/40 border-2 rounded-[2rem] cursor-pointer transition-all duration-500 group ${
                        campaign.list_ids.includes(list.id) ? 'border-indigo-600 shadow-2xl shadow-indigo-600/20 scale-[1.02]' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl border transition-all duration-500 flex items-center justify-center ${campaign.list_ids.includes(list.id) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 text-gray-600 border-white/5'}`}>
                            <Users size={24} />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-white uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">{list.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{list.contact_count} Profiles</span>
                              <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Live Sync Agent Enabled</span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${campaign.list_ids.includes(list.id) ? 'bg-indigo-600 border-indigo-400 text-white scale-110' : 'border-white/10 opacity-20'}`}>
                           <CheckCircle size={18} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-left duration-700">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute -left-10 top-0 bottom-0 w-1 bg-indigo-600 rounded-full" />
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Creative <span className="text-indigo-500">Design</span></h2>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Architect your high-conversion intelligence vector.</p>
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="px-6 py-3 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 ring-2 ring-indigo-500/20"
                >
                  {aiGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {aiGenerating ? 'AI Orchestrating...' : 'AI Vector Orchestrator'}
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 group-focus-within:text-indigo-500 transition-colors">Strategic Template Library</label>
                    <div className="relative">
                      <select
                        value={campaign.template_id ?? ''}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-black text-xs uppercase tracking-tight appearance-none cursor-pointer"
                      >
                        <option value="">[ Manual Architecture ]</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name || `Template ${t.id}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Database size={60} />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Injection Variables</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-indigo-400 font-mono">
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded cursor-copy hover:bg-indigo-500/20 transition-colors">{'{{firstName}}'}</span>
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded cursor-copy hover:bg-indigo-500/20 transition-colors">{'{{company}}'}</span>
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded cursor-copy hover:bg-indigo-500/20 transition-colors">{'{{title}}'}</span>
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded cursor-copy hover:bg-indigo-500/20 transition-colors">{'{{unsubscribe_link}}'}</span>
                    </div>
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Semantic HTML Master Code</label>
                   <textarea 
                    rows="18"
                    value={campaign.html_body}
                    onChange={(e) => setCampaign({...campaign, html_body: e.target.value})}
                    placeholder="Drop your custom HTML blueprint or let the AI Architect build it for you..."
                    className="w-full bg-black/50 border-2 border-white/5 rounded-[2rem] p-8 text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-[11px] leading-relaxed shadow-inner scrollbar-hide"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-left duration-700">
               <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-emerald-600 rounded-full" />
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Launch <span className="text-emerald-500">Readiness</span></h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Final audit of mission parameters before broadcast.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Intelligence Reach</span>
                      <span className="text-lg font-black text-white italic">{campaign.list_ids.length} Active Segments</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Est. Recipients</span>
                      <span className="text-lg font-black text-indigo-400">~{totalAudience.toLocaleString()} Profiles</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Sender Authority</span>
                      <span className="text-sm font-bold text-gray-300">{campaign.from_email}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Reputation Score</span>
                       <span className="text-sm font-black text-emerald-400">98% Neutrality</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Compliance Engine</span>
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                        <ShieldCheck size={14} /> Global Anti-Spam Protocol Verified
                      </span>
                    </div>
                    <button onClick={() => setStep(3)} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
                      Edit Creative
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                   <button 
                    onClick={() => handleSave(false)}
                    disabled={loading}
                    className="w-full p-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={20} className="text-indigo-500" /> Save as Mission Draft</>}
                  </button>
                  <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2rem] flex items-center justify-between group hover:bg-indigo-500/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Clock size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Strategic Scheduling</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Set a specific time for peak engagement.</p>
                      </div>
                    </div>
                    <input type="datetime-local" className="bg-white/5 border border-white/10 text-[10px] font-black text-indigo-400 focus:ring-0 rounded-xl px-4 py-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="h-full animate-in slide-in-from-right duration-1000">
           <EmailPreview 
            html={campaign.html_body} 
            subject={campaign.subject} 
            previewText={campaign.preview_text} 
           />
        </div>
      </div>

      {/* Success Modal */}
      {isLaunched && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-fade-in">
          <div className="text-center space-y-8 animate-scale-up">
            <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)] relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
               <Send size={64} className="text-white relative z-10 animate-slide-up" />
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Mission <span className="text-emerald-500">Broadening</span></h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Broadcasting intelligence vector to {totalAudience} recipients...</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Broadcast Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
