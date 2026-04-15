import React, { useState, useRef } from 'react';
import { Sparkles, Download, Save, RefreshCw, CreditCard, Palette, Type, Zap } from 'lucide-react';
import { getStoredToken } from '../utils/auth';

const API = '/api';

const PRESETS = {
  minimal: { bg: '#ffffff', text: '#111111', text2: '#555555', accentPos: 'left', showGrid: false, showCircles: false, fontClass: 'font-serif' },
  bold:    { bg: '#0f0f1a', text: '#ffffff', text2: '#a0a0c0', accentPos: 'left', showGrid: false, showCircles: true, fontClass: 'font-sans' },
  luxury:  { bg: '#1a0a00', text: '#f5e6c8', text2: '#c9a84c', accentPos: 'bottom', showGrid: false, showCircles: false, fontClass: 'font-serif' },
  tech:    { bg: '#000d1a', text: '#00f5d4', text2: '#007d6d', accentPos: 'left', showGrid: true, showCircles: false, fontClass: 'font-mono' },
  glass:   { bg: 'rgba(30,30,60,0.85)', text: '#ffffff', text2: 'rgba(255,255,255,0.6)', accentPos: 'none', showGrid: false, showCircles: true, fontClass: 'font-sans' },
  neon:    { bg: '#000000', text: '#ffffff', text2: '#888888', accentPos: 'left', showGrid: true, showCircles: false, fontClass: 'font-mono' }
};

const STYLE_LABELS = [
  { key: 'minimal', label: 'Minimal', color: '#e0e0e0' },
  { key: 'bold', label: 'Bold', color: '#7b2fff' },
  { key: 'luxury', label: 'Luxury', color: '#c9a84c' },
  { key: 'tech', label: 'Tech', color: '#00f5d4' },
  { key: 'glass', label: 'Glass', color: '#4cc9f0' },
  { key: 'neon', label: 'Neon', color: '#f72585' },
];

const SWATCHES = ['#00f5d4','#7b2fff','#ffb703','#e63946','#f72585','#4cc9f0','#80b918','#ffffff'];

export default function CardCreatorPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '', company: '', email: '', phone: '', website: '', vibe: '' });
  const [style, setStyle] = useState('bold');
  const [accentColor, setAccentColor] = useState('#7b2fff');
  const [variant, setVariant] = useState('front');
  const [generating, setGenerating] = useState(false);
  const [aiDesign, setAiDesign] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const cardRef = useRef(null);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const preset = PRESETS[style] || PRESETS.bold;
  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Your Name';
  const initials = `${(form.firstName || 'Y')[0]}${(form.lastName || 'N')[0]}`.toUpperCase();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const [upgradeMsg, setUpgradeMsg] = useState('');

  async function handleGenerate() {
    setGenerating(true);
    setUpgradeMsg('');
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/cards/generate-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.requiresUpgrade) {
        setUpgradeMsg(data.error);
        return;
      }
      if (data.success) {
        const d = data.design;
        setAiDesign(d);
        if (d.style) setStyle(d.style);
        if (d.accentColor) setAccentColor(d.accentColor);
        showToast('AI design generated successfully');
      }
    } catch (err) {
      console.error('AI generation failed:', err);
      showToast('Generation failed — using defaults');
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
        body: JSON.stringify({ cardData: form, designData: { style, accentColor, ...aiDesign } })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        showToast('Card saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Save failed');
    }
  }

  function handleExportVCard() {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${fullName}`,
      form.title ? `TITLE:${form.title}` : '',
      form.company ? `ORG:${form.company}` : '',
      form.email ? `EMAIL:${form.email}` : '',
      form.phone ? `TEL:${form.phone}` : '',
      form.website ? `URL:${form.website}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.firstName || 'contact'}-${form.lastName || 'card'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('vCard downloaded');
  }

  async function handleDownloadPNG() {
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${form.company || 'intelliscan'}-card.png`;
      a.click();
      showToast('PNG downloaded');
    } catch (err) {
      console.error('PNG export failed:', err);
      showToast('PNG export failed — check console');
    }
  }

  const cycleStyle = () => {
    const keys = Object.keys(PRESETS);
    const idx = keys.indexOf(style);
    setStyle(keys[(idx + 1) % keys.length]);
  };

  // Card background style
  const cardBg = style === 'glass'
    ? { background: 'linear-gradient(135deg, rgba(30,30,70,0.9), rgba(60,20,80,0.7))', backdropFilter: 'blur(24px)' }
    : { backgroundColor: preset.bg };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 md:p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <CreditCard className="text-white" size={20} />
          </div>
          AI Card Creator
        </h1>
        <p className="text-gray-400 text-sm ml-[52px]">Describe yourself, AI designs the perfect card</p>
        <div className="flex gap-2 mt-3 ml-[52px] flex-wrap">
          {['Gemini AI', 'Live Preview', '6 Styles', 'PNG Export'].map(b => (
            <span key={b} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">{b}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Form */}
        <div className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">First Name</label>
              <input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="John" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Last Name</label>
              <input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Job Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="Product Designer" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Company</label>
            <input value={form.company} onChange={e => updateField('company', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="IntelliScan Inc." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
              <input value={form.email} onChange={e => updateField('email', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="john@co.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone</label>
              <input value={form.phone} onChange={e => updateField('phone', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="+1 555-0100" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Website / LinkedIn</label>
            <input value={form.website} onChange={e => updateField('website', e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" placeholder="linkedin.com/in/johndoe" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Industry / Vibe</label>
            <textarea value={form.vibe} onChange={e => updateField('vibe', e.target.value)} rows={2} className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none" placeholder="Tech startup, cybersecurity, creative agency..." />
          </div>

          {/* Style Picker */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5"><Palette size={12} /> Card Style</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_LABELS.map(s => (
                <button key={s.key} onClick={() => setStyle(s.key)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${style === s.key ? 'border-violet-500 ring-2 ring-violet-500/40 bg-violet-500/10 text-white' : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'}`}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5"><Type size={12} /> Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {SWATCHES.map(c => (
                <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'scale-125 ring-2 ring-white border-white' : 'border-gray-600 hover:border-gray-400'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={generating} className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-wait text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20">
            {generating ? (
              <><RefreshCw size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Generate with AI</>
            )}
          </button>

          {/* Upgrade Banner */}
          {upgradeMsg && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <Zap size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-amber-200 font-semibold">{upgradeMsg}</p>
                <a href="/subscription-plan-comparison" className="text-xs font-bold text-amber-400 hover:text-amber-300 underline mt-1 inline-block">
                  View Plans & Upgrade →
                </a>
              </div>
            </div>
          )}

          {/* Save Button */}
          {aiDesign && (
            <button onClick={handleSave} className={`w-full py-3 border font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${saved ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'}`}>
              <Save size={16} /> {saved ? 'Saved!' : 'Save Card'}
            </button>
          )}
        </div>

        {/* RIGHT — Preview */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Variant Tabs */}
          <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
            {['front', 'dark', 'compact'].map(v => (
              <button key={v} onClick={() => setVariant(v)} className={`flex-1 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all ${variant === v ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {v === 'front' ? 'Front' : v === 'dark' ? 'Dark Var' : 'Compact'}
              </button>
            ))}
          </div>

          {/* Card Canvas */}
          <div 
            ref={cardRef} 
            className={`relative overflow-hidden rounded-[20px] mx-auto transition-all duration-500 ${variant === 'compact' ? 'w-[280px] h-[480px]' : 'w-full max-w-[480px] aspect-[1.75/1]'}`} 
            style={{ 
              ...cardBg, 
              backgroundColor: variant === 'dark' ? '#08080c' : (variant === 'compact' ? '#111111' : cardBg.backgroundColor),
              boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
              border: variant === 'dark' ? `1px solid ${accentColor}40` : 'none'
            }}
          >
            {/* Accent Styling */}
            {variant !== 'compact' && (
              <>
                {preset.accentPos === 'left' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }} />
                )}
                {preset.accentPos === 'bottom' && (
                  <div className="absolute left-0 right-0 bottom-0 h-1" style={{ backgroundColor: accentColor }} />
                )}
              </>
            )}

            {/* Pattern overlays */}
            {(preset.showGrid || variant === 'dark') && (
              <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="gridLarge" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke={accentColor} strokeWidth="1"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#gridLarge)" />
              </svg>
            )}

            {/* Glowing accents for Dark/Compact */}
            {(variant === 'dark' || variant === 'compact') && (
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${accentColor}15` }} />
            )}

            {/* Content Rendering: FRONT / DARK */}
            {variant !== 'compact' && (
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-2xl font-black tracking-tighter ${preset.fontClass}`} style={{ color: variant === 'dark' ? '#ffffff' : preset.text }}>{fullName}</h2>
                    <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>{form.title || 'Your Title'}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] mt-2 opacity-60" style={{ color: variant === 'dark' ? '#a0a0c0' : preset.text2 }}>{form.company || 'COMPANY NAME'}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-6xl font-black opacity-[0.1] leading-none select-none" style={{ color: variant === 'dark' ? '#ffffff' : preset.text }}>{initials}</span>
                    {aiDesign?.tagline && (
                      <span className="mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded border" style={{ borderColor: `${accentColor}40`, color: accentColor }}>{aiDesign.tagline}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1.5 font-mono text-[10px] tracking-tight" style={{ color: variant === 'dark' ? '#8080a0' : preset.text2 }}>
                    {form.email && <p className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center" style={{ color: accentColor }}>@</span> {form.email}</p>}
                    {form.phone && <p className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center" style={{ color: accentColor }}>✆</span> {form.phone}</p>}
                    {form.website && <p className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center" style={{ color: accentColor }}>⌘</span> {form.website}</p>}
                  </div>
                  <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1 opactiy-40">
                       {Array.from({ length: 9 }).map((_, i) => (
                         <div key={i} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: i % 2 === 0 ? accentColor : 'transparent', opacity: 0.3 }} />
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Rendering: COMPACT (Vertical) */}
            {variant === 'compact' && (
              <div className="absolute inset-0 p-8 flex flex-col items-center text-center z-10 h-full">
                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6">
                  {initials}
                </div>
                
                <h2 className="text-xl font-black text-white tracking-tighter mb-1">{fullName}</h2>
                <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: accentColor }}>{form.title || 'Brand Strategy'}</p>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                
                <div className="space-y-4 w-full text-left">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Zap size={14} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-500 uppercase">Contact</p>
                      <p className="text-xs font-bold text-gray-300 truncate">{form.email || 'hello@brand.com'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CreditCard size={14} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-500 uppercase">Organization</p>
                      <p className="text-xs font-bold text-gray-300 truncate">{form.company || 'IntelliScan Founder'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 w-full flex flex-col items-center">
                   <div className="bg-white p-2 rounded-xl mb-3">
                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">QR DECOR</div>
                   </div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Scan to connect</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Design Notes */}
          {aiDesign && (
            <div className="bg-gray-900/80 border border-violet-500/30 rounded-xl p-4">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> AI Design Notes
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{aiDesign.designNotes}</p>
              <div className="flex gap-2 mt-3">
                {aiDesign.mood && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">{aiDesign.mood}</span>
                )}
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/20">{style}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={handleExportVCard} className="py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-300 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-400 transition-all flex flex-col items-center gap-1">
              <CreditCard size={14} /> vCard
            </button>
            <button onClick={handleDownloadPNG} className="py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-300 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-400 transition-all flex flex-col items-center gap-1">
              <Download size={14} /> PNG
            </button>
            <button onClick={cycleStyle} className="py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-300 text-xs font-semibold hover:border-violet-500 hover:text-violet-400 transition-all flex flex-col items-center gap-1">
              <RefreshCw size={14} /> Restyle
            </button>
            <button onClick={handleGenerate} disabled={generating} className="py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-300 text-xs font-semibold hover:border-amber-500 hover:text-amber-400 transition-all flex flex-col items-center gap-1 disabled:opacity-50">
              <Zap size={14} /> Regen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
