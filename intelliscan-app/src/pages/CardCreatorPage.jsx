import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, Save, RefreshCw, CreditCard, Palette, Type, Zap, Image as ImageIcon, ShieldCheck, Crown, Cpu, Atom, Upload } from 'lucide-react';
import { getStoredToken } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';

const API = '/api';

const ELITE_STYLES = {
  glass: { 
    bg: 'rgba(15, 15, 25, 0.8)', 
    accent: '#818cf8', 
    border: 'rgba(255, 255, 255, 0.1)',
    cardClass: 'backdrop-blur-2xl border-white/10 shadow-brand-500/20',
    icon: <Sparkles size={14} />
  },
  executive: { 
    bg: '#0a0a0a', 
    accent: '#ffffff', 
    border: '#1a1a1a',
    cardClass: 'border-white/5 shadow-white/5',
    icon: <ShieldCheck size={14} />
  },
  futurist: { 
    bg: '#020617', 
    accent: '#22d3ee', 
    border: '#0ea5e9',
    cardClass: 'border-cyan-500/20 shadow-cyan-500/10',
    icon: <Atom size={14} />
  },
  signature: { 
    bg: '#0f172a', 
    accent: '#f472b6', 
    border: '#db2777',
    cardClass: 'border-pink-500/20 shadow-pink-500/10',
    icon: <Crown size={14} />
  },
  bold_dark: { 
    bg: '#000000', 
    accent: '#facc15', 
    border: '#eab308',
    cardClass: 'border-yellow-500/20 shadow-yellow-500/10',
    icon: <Cpu size={14} />
  }
};

export default function CardCreatorPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({ 
    firstName: '', lastName: '', title: '', company: '', 
    email: '', phone: '', website: '', vibe: '' 
  });
  const [activeStyle, setActiveStyle] = useState('glass');
  const [logoUrl, setLogoUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [aiDesign, setAiDesign] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    async function loadCard() {
      try {
        const token = getStoredToken();
        const res = await fetch(`${API}/my-card`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.headline) {
          // Attempt to parse names from headline if possible, or just use as is
          // For now, let's assume we store the raw form in design_json too
          const design = data.design_json || {};
          if (design.formData) setForm(design.formData);
          if (design.logoUrl) setLogoUrl(design.logoUrl);
          if (design.activeStyle) setActiveStyle(design.activeStyle);
          setAiDesign(design);
        }
      } catch (err) {
        console.error('Failed to load identity');
      }
    }
    loadCard();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const updateField = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  async function handleGenerateLogo() {
    if (!form.company) return showToast('Please enter a company name first');
    setGeneratingLogo(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/cards/generate-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ company: form.company, industry: form.vibe || 'Technology', vibe: 'Professional, High-end' })
      });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(data.logoUrl);
        showToast('✦ Premium Logo Generated!');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast('Logo seed failed — please try again');
    } finally {
      setGeneratingLogo(false);
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setGeneratingLogo(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/cards/upload-logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(data.logoUrl);
        showToast('Logo Uploaded Successfully');
      }
    } catch (err) {
      showToast('Upload failed');
    } finally {
      setGeneratingLogo(false);
    }
  };

  async function handleGenerateDesign() {
    setGenerating(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/cards/generate-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.design) {
        setAiDesign(data.design);
        if (data.design.style) setActiveStyle(data.design.style);
        showToast('✦ Premium Visuals Synthesized');
      }
    } catch (err) {
      showToast('Design logic failure');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/cards/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          headline: aiDesign?.headline || `${form.title} at ${form.company}`,
          bio: aiDesign?.bio || 'Professional identity generated by IntelliScan.',
          design_json: { ...aiDesign, logoUrl, activeStyle },
          url_slug: `${form.firstName}-${form.lastName}-${Date.now()}`.toLowerCase()
        })
      });
      if (res.ok) {
        setSaved(true);
        showToast('Card Identity Persisted.');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      showToast('Cloud sync failed');
    }
  }

  const handleDownloadPNG = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${form.firstName || 'User'}-Identity-Card.png`;
      a.click();
    } catch (err) {
      showToast('Export failed');
    }
  };

  const currentStyle = ELITE_STYLES[activeStyle] || ELITE_STYLES.glass;
  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Executive Name';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} p-6 lg:p-12 selection:bg-brand-500/30 transition-colors duration-500`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] bg-brand-600/90 backdrop-blur-md px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/20 animate-bounce text-white">
          {toast}
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-xl shadow-brand-500/20">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h1 className={`text-4xl font-black tracking-tighter uppercase leading-none italic bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white to-gray-500' : 'from-brand-600 to-brand-900 underline decoration-brand-200 decoration-4 underline-offset-8'}`}>
                Identity <span className="text-brand-500">Workbench</span>
              </h1>
              <div className="flex items-center gap-2 mt-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${isDark ? 'text-gray-500 border-white/10' : 'text-brand-600 border-brand-100 bg-brand-50'} rounded-full flex items-center gap-1.5`}>
                  <Cpu size={10} className="text-brand-400" /> AI Neural Engine 3.1
                </span>
                <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-full flex items-center gap-1.5">
                  <ShieldCheck size={10} /> Professional Grade
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className={`px-6 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'} border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all flex items-center gap-2 shadow-sm`}>
            <Save size={14} className={saved ? "text-emerald-400" : ""} /> {saved ? 'Synced' : 'Cloud Sync'}
          </button>
          <button onClick={handleDownloadPNG} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20 text-white">
            <Download size={14} /> Export PNG
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-12 items-start">
        {/* LEFT COMPONENT — CONTROLS */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'} border rounded-[32px] p-8 backdrop-blur-sm premium-grain`}>
            <h2 className={`text-sm font-black ${isDark ? 'text-gray-400' : 'text-brand-900'} uppercase tracking-[0.3em] mb-8 flex items-center gap-3`}>
              <Zap size={16} className="text-yellow-400" /> Identity Matrix
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest ml-1`}>First Designation</label>
                <input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} className={`w-full ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-700`} placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest ml-1`}>Surname</label>
                <input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} className={`w-full ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-700`} placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest ml-1`}>Professional Title</label>
                <input value={form.title} onChange={e => updateField('title', e.target.value)} className={`w-full ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand-500 outline-none transition-all`} placeholder="Chief Strategy Officer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest ml-1`}>Corporation</label>
                  <input value={form.company} onChange={e => updateField('company', e.target.value)} className={`w-full ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand-500 outline-none transition-all`} placeholder="Starlight Capital" />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest ml-1`}>Industry Sector</label>
                  <input value={form.vibe} onChange={e => updateField('vibe', e.target.value)} className={`w-full ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand-500 outline-none transition-all`} placeholder="Quantum Computing, Biotech" />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={generatingLogo}
                className={`flex-1 py-4 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black'} font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40`}
              >
                <Upload size={16} /> 
                {generatingLogo ? 'Processing...' : 'Upload Logo'}
              </button>
              <button onClick={handleGenerateLogo} disabled={generatingLogo} className={`flex-1 py-4 ${isDark ? 'bg-brand-600 hover:bg-brand-500' : 'bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50'} font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-lg shadow-brand-500/10`}>
                {generatingLogo ? <RefreshCw className="animate-spin" size={16} /> : <ImageIcon size={16} />} 
                {generatingLogo ? 'Synthesizing...' : 'Forge AI Logo'}
              </button>
              <button onClick={handleGenerateDesign} disabled={generating} className="flex-1 py-4 bg-gradient-to-r from-brand-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-600/20 disabled:opacity-40">
                {generating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {generating ? 'Calculating...' : 'Synthesize Identity'}
              </button>
            </div>
          </div>

          {/* Style Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(ELITE_STYLES).map(([key, cfg]) => (
              <button 
                key={key} 
                onClick={() => setActiveStyle(key)}
                className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 group ${activeStyle === key ? 'bg-brand-500/10 border-brand-500 shadow-lg shadow-brand-500/10 scale-105' : `${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'} hover:border-brand-300`}`}
              >
                <div className={`p-2 rounded-xl border transition-colors ${activeStyle === key ? 'bg-brand-500 border-white/20' : `${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'} group-hover:bg-brand-50`}`}>
                  {React.cloneElement(cfg.icon, { size: 16, className: activeStyle === key ? 'text-white' : 'text-gray-400' })}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${activeStyle === key ? 'text-brand-500' : 'text-gray-400'}`}>{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT — LIVE PREVIEW */}
        <div className="lg:sticky lg:top-12 space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Identity Viewport</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
            </div>
          </div>

          <div 
            ref={cardRef}
            className={`w-full aspect-[1.75/1] rounded-[40px] relative overflow-hidden transition-all duration-700 shadow-2xl premium-grain ${currentStyle.cardClass}`}
            style={{ 
              background: activeStyle === 'glass' ? 'linear-gradient(135deg, rgba(30,30,80,0.8), rgba(15,15,30,0.9))' : currentStyle.bg,
              padding: '40px'
            }}
          >
            {/* Background Texture Patterns */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%">
                <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#fff" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#dotPattern)" />
              </svg>
            </div>

            {/* Glowing Aura for Premium Look */}
            <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: currentStyle.accent }} />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="text-3xl font-black tracking-tighter leading-none mb-2" style={{ color: currentStyle.accent === '#ffffff' ? '#ffffff' : '#ffffff' }}>
                    {form.firstName || 'Executive'}
                    <br />
                    <span className="opacity-40">{form.lastName || 'Profile'}</span>
                  </h3>
                  <div className="h-0.5 w-12 mb-4 rounded-full" style={{ backgroundColor: currentStyle.accent }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 leading-tight">{form.title || 'CHIEF OF OPERATIONS'}</p>
                  <p className="text-[11px] font-black text-white/90 tracking-tight">{form.company || 'Global Industries Inc.'}</p>
                </div>

                {/* LOGO AREA */}
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <ImageIcon size={20} />
                      <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1.5 opacity-40">
                  <p className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-white/20" /> {form.email || 'DESIGNATION@ENTERPRISE.COM'}
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-white/20" /> {form.phone || '+1 800-SYNTH-AI'}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                   <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-black tracking-widest leading-none" style={{ color: currentStyle.accent }}>ID:{Math.random().toString(36).substring(7).toUpperCase()}</p>
                   </div>
                   {aiDesign?.tagline && (
                      <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 italic">{aiDesign.tagline}</p>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Branding Summary */}
          {aiDesign && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute right-[-10px] top-[-10px] opacity-[0.02]">
                  <Sparkles size={100} />
               </div>
               <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Atom size={12} /> Design Neural Logic
               </h4>
               <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                  "{aiDesign.designNotes}"
               </p>
               <div className="mt-4 flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[8px] font-black uppercase tracking-widest border border-brand-500/20">{aiDesign.mood}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-[8px] font-black uppercase tracking-widest border border-white/10">{activeStyle} engine</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
