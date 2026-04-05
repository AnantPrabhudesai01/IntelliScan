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
          purpose: 'Product Update',
          tone: 'Professional & Exciting',
          industry: 'Technology',
          companyName: 'IntelliScan',
          recipientType: 'Business Decision Makers',
          keyMessage: 'We have launched a new AI-powered card creator.',
          callToAction: 'Try it now'
        })
      });
      const data = await res.json();
      if (data.success) {
        setCampaign(prev => ({
          ...prev,
          subject: data.template.subject,
          preview_text: data.template.preview_text,
          html_body: data.template.html_body,
          text_body: data.template.text_body
        }));
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    }
    setAiGenerating(false);
  };

  const handleSave = async (isSend = false) => {
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
        if (isSend) {
          await fetch(`/api/email/campaigns/${data.campaign.id}/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getStoredToken()}` }
          });
        }
        navigate('/dashboard/email-marketing/campaigns');
      }
    } catch (err) {
      console.error('Save/Send failed:', err);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (templateIdRaw) => {
    const templateId = templateIdRaw ? Number(templateIdRaw) : null;
    if (!templateIdRaw) {
      setCampaign(prev => ({ ...prev, template_id: null }));
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

  const steps = [
    { id: 1, label: 'Setup', icon: <Mail size={16} /> },
    { id: 2, label: 'Audience', icon: <Users size={16} /> },
    { id: 3, label: 'Design', icon: <FileText size={16} /> },
    { id: 4, label: 'Review', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col gap-6">
      {/* Step Progress */}
      <div className="flex items-center justify-between bg-gray-900/40 p-4 rounded-3xl border border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-12 ml-4">
          {steps.map((s) => (
            <div key={s.id} className={`flex items-center gap-3 transition-all duration-300 ${step >= s.id ? 'opacity-100' : 'opacity-30 grayscale'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
                step === s.id ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white scale-110' : 
                step > s.id ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-white' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {s.id !== 4 && <div className="ml-4 w-8 h-px bg-gray-800" />}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-2xl transition-all border border-gray-700">
              <ArrowLeft size={18} />
            </button>
          )}
          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)} 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/30 disabled:text-emerald-200/60 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-600/20"
            >
              {loading ? 'Sending...' : <>Initialize Send <Send size={16} /></>}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden min-h-0">
        {/* Editor Area */}
        <div className="bg-gray-900/40 p-8 rounded-3xl border border-gray-800 overflow-y-auto backdrop-blur-sm custom-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div>
                <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Campaign <span className="text-indigo-500">Identity</span></h2>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Define the core metadata of this intelligence outreach.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Campaign Name (Internal)</label>
                  <input 
                    type="text" 
                    value={campaign.name}
                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                    placeholder="e.g. Q1 Product Expansion - Decision Makers"
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold tracking-tight"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Subject Line</label>
                  <input 
                    type="text" 
                    value={campaign.subject}
                    onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                    placeholder="Catch their attention..."
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold tracking-tight"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Preview Text</label>
                  <input 
                    type="text" 
                    value={campaign.preview_text}
                    onChange={(e) => setCampaign({...campaign, preview_text: e.target.value})}
                    placeholder="Short description under the subject..."
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Sender Name</label>
                    <input 
                      type="text" 
                      value={campaign.from_name}
                      onChange={(e) => setCampaign({...campaign, from_name: e.target.value})}
                      className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Reply-To Email</label>
                    <input 
                      type="email" 
                      value={campaign.reply_to}
                      onChange={(e) => setCampaign({...campaign, reply_to: e.target.value})}
                      className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Target <span className="text-indigo-500">Audience</span></h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Select one or more intelligence segments to target.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {lists.length === 0 ? (
                  <div className="p-8 text-center bg-gray-800/20 border border-gray-800 border-dashed rounded-3xl">
                    <Users className="mx-auto text-gray-700 mb-4" size={40} />
                    <p className="text-gray-500 font-bold">No audience segments found.</p>
                    <Link to="/dashboard/email-marketing/lists" className="text-indigo-400 text-xs font-black uppercase mt-2 inline-block">Manage Lists</Link>
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
                      className={`p-6 bg-black/30 border-2 rounded-3xl cursor-pointer transition-all ${
                        campaign.list_ids.includes(list.id) ? 'border-indigo-600 shadow-xl shadow-indigo-600/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl border ${campaign.list_ids.includes(list.id) ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20' : 'bg-gray-800 text-gray-600 border-gray-700'}`}>
                            <Users size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{list.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{list.contact_count} Profiles Synced</p>
                          </div>
                        </div>
                        {campaign.list_ids.includes(list.id) && <CheckCircle size={20} className="text-indigo-500" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Content <span className="text-indigo-500">Design</span></h3>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Design your intelligence vector using AI or manual HTML.</p>
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/40 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {aiGenerating ? 'Processing...' : (
                    <><Sparkles size={14} /> AI Orchestrator</>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Template Library</label>
                    <select
                      value={campaign.template_id ?? ''}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full bg-black/30 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold tracking-tight"
                    >
                      <option value="">Custom / No Template</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || `Template ${t.id}`}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {templates.length ? `${templates.length} templates available` : 'No templates found yet'}
                      {' '}·{' '}
                      <Link to="/dashboard/email-marketing/templates" className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30">
                        Open Library
                      </Link>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Variables</p>
                    <div className="text-[10px] text-gray-400 font-mono leading-relaxed">
                      <div>{'{{firstName}}'} · {'{{company}}'} · {'{{title}}'}</div>
                      <div>{'{{unsubscribe_link}}'} · {'{{senderName}}'}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest">Master HTML Template</label>
                    <span className="text-[10px] font-mono text-indigo-400 cursor-help underline decoration-indigo-500/30">Variable Guide</span>
                  </div>
                  <textarea 
                    rows="15"
                    value={campaign.html_body}
                    onChange={(e) => setCampaign({...campaign, html_body: e.target.value})}
                    placeholder="Enter raw HTML or let AI generate..."
                    className="w-full bg-black/40 border-2 border-gray-800 rounded-3xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs leading-relaxed"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-[10px] text-amber-500 leading-normal font-bold uppercase tracking-tight">
                    Ensure the <code className="bg-amber-500/20 px-1 rounded text-white">{'{{unsubscribe_link}}'}</code> placeholder is present to comply with global CAN-SPAM and GDPR regulations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
               <div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Final <span className="text-indigo-500">Review</span></h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Verify the orchestration parameters before mission deployment.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Reach</span>
                    <span className="text-sm font-black text-white">{campaign.list_ids.length} Segments selected</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sender Profile</span>
                    <span className="text-sm font-black text-white">{campaign.from_email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Regulation Auth</span>
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-tight">Compliant - Unsubscribe Found</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => handleSave(false)}
                    disabled={loading}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-gray-700 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Saving...' : <><Save size={18} /> Save as Revision</>}
                  </button>
                  <label className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-indigo-600/20 transition-all">
                    <div className="flex items-center gap-3">
                      <Clock className="text-indigo-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Schedule Mission</span>
                    </div>
                    <input type="datetime-local" className="bg-transparent border-none text-[10px] font-bold text-indigo-400 focus:ring-0" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-500">
           <div className="mb-4 flex items-center justify-between px-2">
             <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <Wand2 size={12} className="text-indigo-500" /> Intelligence Vector Preview
             </h4>
             <div className="flex gap-4">
               <div className="flex items-center gap-1.5 grayscale opacity-50">
                 <Smartphone size={12} className="text-white" />
                 <span className="text-[9px] font-black text-white uppercase tracking-tighter">Mobile</span>
               </div>
                <div className="flex items-center gap-1.5">
                 <Monitor size={12} className="text-indigo-500" />
                 <span className="text-[9px] font-black text-white uppercase tracking-tighter text-indigo-400 underline decoration-indigo-500/50">Desktop</span>
               </div>
             </div>
           </div>
           <EmailPreview 
            html={campaign.html_body} 
            subject={campaign.subject} 
            previewText={campaign.preview_text} 
           />
        </div>
      </div>
    </div>
  );
}
