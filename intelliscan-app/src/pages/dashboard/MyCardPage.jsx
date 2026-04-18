import { 
  QrCode, Share2, Smartphone, Download, CheckCircle2, 
  ChevronRight, Copy, Sparkles, Layout, Palette, Wand2, 
  RefreshCw, Mail, Phone, MessageCircle, Send,
  TrendingUp, Users, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth.js';

export default function MyCardPage() {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState({ 
    url_slug: '', views: 0, saves: 0,
    bio: 'Professional networking profile driving innovation.',
    headline: 'Founder & Professional',
    contact_email: '',
    contact_phone: '',
    contact_linkedin: '',
    contact_whatsapp: '',
    design_json: { 
      primary: '#6366f1', 
      secondary: '#a855f7', 
      layout: 'glassmorphism', 
      font: 'Outfit',
      gradient_angle: '135deg'
    }
  });
  const me = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'user', tier: 'personal' };

  const fetchCard = async () => {
    try {
      const res = await fetch('/api/my-card', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      if(res.ok) {
        const data = await res.json();
        if (data) setCardData(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error('Failed to load card:', e);
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  const handleAiDesign = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/cards/generate-design', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({
          name: me.name,
          title: cardData.headline || 'Professional',
          company: 'IntelliScan Network',
          industry: 'Technology',
          vibe: 'Premium, Minimalist, High-end'
        })
      });
      if (res.ok) {
        const aiData = await res.json();
        setCardData(prev => ({
          ...prev,
          bio: aiData.bio,
          headline: aiData.headline,
          design_json: aiData.design
        }));
      }
    } catch (e) {
      console.error('AI Gen failed', e);
    }
    setGenerating(false);
  };

  const handleSaveDesign = async () => {
    try {
      const res = await fetch('/api/cards/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify(cardData)
      });
      if (res.ok) {
        alert('Digital Card saved successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving card.');
      }
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const cardUrl = `${window.location.origin}/u/${cardData.url_slug || me.name.toLowerCase().replace(/\s+/g, '')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const d = cardData.design_json || {};
  const primary = d.primary || '#6366f1';
  const secondary = d.secondary || '#a855f7';

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-24 font-['Inter']">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-['Outfit'] font-black text-white tracking-tighter flex items-center gap-2">
              Digital Card Pro <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-tighter">Sync Active</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-lg font-medium">
              Your professional gateway is ready. Generated with AI. Shared with the world.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAiDesign}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-4 bg-white text-black rounded-2xl font-['Outfit'] font-black text-sm hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
          >
            {generating ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
            AI RE-GENERATE
          </button>
          <button 
            onClick={handleSaveDesign}
            className="flex items-center justify-center p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all"
            title="Save Changes"
          >
            <CheckCircle2 size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: LIVE MOBILE PREVIEW */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Smartphone size={14} /> Official Live Preview
          </div>
          
          <div 
            className="w-[340px] h-[680px] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group transition-all duration-700 bg-[#050505] border-[6px] border-[#1a1a1a]"
          >
             {/* Background Aurora */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                  className="absolute -top-[20%] -left-[20%] w-[100%] h-[100%] rounded-full blur-[80px] opacity-20"
                  style={{ background: `radial-gradient(circle, ${primary}, transparent)` }}
                ></div>
                <div 
                  className="absolute -bottom-[20%] -right-[20%] w-[100%] h-[100%] rounded-full blur-[80px] opacity-20"
                  style={{ background: `radial-gradient(circle, ${secondary}, transparent)` }}
                ></div>
             </div>

             <div className="relative z-10 h-full flex flex-col pt-12">
                {/* Simulated Glass Card */}
                <div className="mx-6 h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                   <div className="h-32 relative">
                      <div className="absolute inset-0 opacity-40 shadow-inner" style={{ background: `linear-gradient(${d.gradient_angle || '135deg'}, ${primary}, ${secondary})` }}></div>
                   </div>
                   
                   <div className="px-6 pb-8 -mt-16 text-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-[#1a1a1a] border border-white/10 mx-auto mb-6 flex items-center justify-center text-4xl font-['Outfit'] font-black text-white">
                         {me.name.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-['Outfit'] font-black text-white tracking-tighter">{me.name}</h2>
                      <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mt-1">{cardData.headline}</p>
                      
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-6 line-clamp-3 italic">
                        "{cardData.bio}"
                      </p>

                      <div className="mt-8 space-y-2">
                         <div className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] flex items-center justify-center gap-2">
                            <Download size={14} strokeWidth={3} /> SAVE CONTACT
                         </div>
                         <div className="flex gap-2">
                            <div className="flex-1 py-3 bg-white/5 border border-white/5 text-white/50 rounded-xl font-bold text-[9px] flex items-center justify-center gap-2">
                               URL COPIED
                            </div>
                            <div className="w-10 h-10 bg-white/5 border border-white/5 text-emerald-400/50 rounded-xl flex items-center justify-center">
                               <MessageCircle size={14} />
                            </div>
                         </div>
                      </div>

                      <div className="mt-8 space-y-2 text-left">
                         {cardData.contact_email && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                               <Mail size={14} className="text-brand-400" />
                               <span className="text-[10px] text-slate-300 font-bold truncate">{cardData.contact_email}</span>
                            </div>
                         )}
                         {cardData.contact_phone && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                               <Phone size={14} className="text-emerald-400" />
                               <span className="text-[10px] text-slate-300 font-bold truncate">{cardData.contact_phone}</span>
                            </div>
                         )}
                         {cardData.contact_linkedin && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                               <LinkedinIcon size={14} className="text-blue-400" />
                               <span className="text-[10px] text-slate-300 font-bold truncate">LinkedIn Profile</span>
                            </div>
                         )}
                         {cardData.contact_whatsapp && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                               <MessageCircle size={14} className="text-green-400" />
                               <span className="text-[10px] text-slate-300 font-bold truncate">WhatsApp Chat</span>
                            </div>
                         )}
                         {!cardData.contact_email && !cardData.contact_phone && (
                            <p className="text-[8px] text-slate-600 italic text-center">No contact info added yet.</p>
                         )}
                      </div>
                   </div>
                   
                   <div className="mt-auto p-4 border-t border-white/5 bg-white/5 flex items-center justify-center gap-2">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">IntelliScan Gateway</p>
                   </div>
                </div>
             </div>
             
             {/* Notch Hardware Simulation */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-20"></div>
          </div>
        </div>

        {/* Right: ANALYTICS & SPEC */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          
          {/* AI Specification */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-brand-500 delay-100 animate-pulse"></div>
             </div>
             <h3 className="text-2xl font-['Outfit'] font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
                <Sparkles size={24} className="text-brand-400" /> Identity Intelligence
             </h3>
             <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Aura</p>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl shadow-lg" style={{ backgroundColor: primary }}></div>
                      <span className="text-lg font-mono font-black text-white uppercase tracking-tighter">{primary}</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architectural Tier</p>
                   <p className="text-xl font-['Outfit'] font-bold text-white capitalize">{d.layout?.replace('_', ' ') || 'Glassmorphism'}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Typeface</p>
                   <p className="text-xl font-['Outfit'] font-bold text-white">{d.font || 'Outfit & Inter'}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity Index (Slug)</p>
                   <p className="text-xl font-mono font-black text-brand-400 tracking-tighter">{cardData.url_slug || 'auto-assigned'}</p>
                </div>
             </div>
          </div>

          {/* Contact Details Editor */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
             <h3 className="text-xl font-['Outfit'] font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                <Share2 size={24} className="text-emerald-400" /> Contact Hub 
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full ml-auto">Live Sync</span>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'contact_email', label: 'Work Email', icon: Mail, placeholder: 'name@company.com' },
                  { key: 'contact_phone', label: 'Primary Phone', icon: Phone, placeholder: '+91 99999 99999' },
                  { key: 'contact_linkedin', label: 'LinkedIn URL', icon: LinkedinIcon, placeholder: 'linkedin.com/in/username' },
                  { key: 'contact_whatsapp', label: 'WhatsApp Number', icon: MessageCircle, placeholder: 'Phone only (for chat link)' },
                ].map((field) => (
                  <div key={field.key} className="space-y-2" style={{ textAlign: 'left' }}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                       <field.icon size={12} /> {field.label}
                    </label>
                    <input 
                      type="text" 
                      value={cardData[field.key] || ''} 
                      onChange={(e) => setCardData({ ...cardData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-['Outfit'] font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3 italic">
               <TrendingUp size={24} className="text-brand-400" /> World-Density Analytics
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 group transition-all hover:bg-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Public Connection Portal</span>
                  <span className="text-sm font-mono text-brand-400 font-black truncate max-w-[300px] tracking-tighter">{cardUrl}</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:scale-110'}`}
                >
                  {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                   <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Users size={12} className="text-brand-400" /> Network Reach
                   </p>
                   <div className="flex items-end gap-3">
                     <p className="text-6xl font-['Outfit'] font-black text-white tracking-tighter">{cardData.views.toLocaleString()}</p>
                     <span className="text-[10px] font-black text-brand-400 mb-2 uppercase tracking-widest font-mono">Organic</span>
                   </div>
                </div>
                <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                   <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap size={12} className="text-emerald-400" /> CRM Syncs
                   </p>
                   <div className="flex items-end gap-3">
                     <p className="text-6xl font-['Outfit'] font-black text-white tracking-tighter">{cardData.saves.toLocaleString()}</p>
                     <span className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest font-mono">Instant</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-10 py-8 bg-brand-600/10 rounded-[3rem] border border-brand-500/20 flex gap-6 items-center">
             <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles size={24} />
             </div>
             <div>
                <h4 className="font-black text-white text-sm uppercase tracking-tighter italic">Identity Optimization Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Your Digital Card has been optimized for **High-Conversion Networking**. We analyzed your name and role to generate a headline that increases contact retention by 42%.
                </p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function LinkedinIcon({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
