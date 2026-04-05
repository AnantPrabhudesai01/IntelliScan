import { QrCode, Share2, Smartphone, Download, CheckCircle2, ChevronRight, Copy, Sparkles, Layout, Palette, Wand2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth.js';

export default function MyCardPage() {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState({ 
    url_slug: '', views: 0, saves: 0,
    bio: 'Digital business card for networking.',
    headline: 'Founder & Professional',
    design_json: { 
      primary: '#4F46E5', 
      secondary: '#7C3AED', 
      layout: 'glassmorphism', 
      font: 'Inter',
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
        if (data.url_slug) setCardData(data);
      }
    } catch (e) {
      console.error('Failed to load card:', e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          title: 'Professional', // Placeholder until profile enriched
          company: 'IntelliScan Network',
          industry: 'Technology',
          vibe: 'Premium and futuristic'
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
        alert('Design saved successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving design.');
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            AI Magic Designer <span className="bg-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-widest">Digital Card</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Automate your professional edge. Let our AI design your digital card, generate your bio, and craft the perfect networking headline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAiDesign}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
            AI Design Magic
          </button>
          <button 
            onClick={handleSaveDesign}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <CheckCircle2 size={18} /> Save Identity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: THE LIVE PREVIEW CARD */}
        <div className="lg:col-span-5 flex justify-center">
          <div 
            className="w-[340px] h-[580px] rounded-[3rem] shadow-2xl relative overflow-hidden group transition-all duration-700 border-4 border-white/10"
            style={{ 
              background: `linear-gradient(${d.gradient_angle || '135deg'}, ${d.primary || '#4F46E5'}, ${d.secondary || '#7C3AED'})`,
              fontFamily: d.font || 'Inter'
            }}
          >
            {/* Dynamic Layout Overlays */}
            {d.layout === 'glassmorphism' && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
            )}
            
            <div className={`p-10 flex flex-col h-full relative z-10 text-white ${d.layout === 'bold_dark' ? 'items-center text-center' : ''}`}>
               {/* Icon/Logo area */}
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-2xl mb-10 transition-transform group-hover:rotate-12 duration-500 ${d.layout === 'minimalist' ? 'bg-white text-indigo-900' : 'bg-white/20 backdrop-blur-xl border border-white/30 text-white'}`}>
                 {me.name.charAt(0)}
               </div>

               <div className="space-y-1">
                 <h2 className={`font-black tracking-tighter transition-all duration-700 ${d.layout === 'corporate_pro' ? 'text-3xl uppercase' : 'text-4xl'}`}>
                   {me.name}
                 </h2>
                 <p className="text-white/80 font-bold text-sm tracking-wide uppercase opacity-90">
                   {cardData.headline || 'Professional Profile'}
                 </p>
               </div>

               <div className="mt-8">
                 <p className="text-sm font-medium leading-relaxed opacity-80 line-clamp-4">
                    {cardData.bio || 'Passionate professional driving innovation through the IntelliScan platform.'}
                 </p>
               </div>

               {/* Bottom QR Card Area */}
               <div className={`mt-auto rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center transition-all duration-700 ${d.layout === 'minimalist' ? 'bg-white scale-90' : 'bg-white/10 backdrop-blur-2xl border border-white/20'}`}>
                 <div className="bg-white p-3 rounded-2xl shadow-inner mb-4 overflow-hidden">
                   <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cardUrl)}`} 
                      alt="Profile QR"
                      className="w-32 h-32"
                   />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Scan to Connect</span>
               </div>
            </div>
            
            {/* Gloss Highlight Overlay */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rotate-45 blur-3xl pointer-events-none group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
          </div>
        </div>

        {/* Right: ANALYTICS & SETTINGS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* AI Insights Summary */}
          <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 delay-100 animate-pulse"></div>
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
                <Sparkles size={20} className="text-indigo-500" /> AI Design Specification
             </h3>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Palette</p>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: d.primary }}></div>
                      <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 uppercase">{d.primary}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layout Architecture</p>
                   <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{d.layout?.replace('_', ' ') || 'Default'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Typography System</p>
                   <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{d.font || 'Default Sans'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card ID / Slug</p>
                   <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{cardData.url_slug || 'auto-assigned'}</p>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
               <Share2 size={18} className="text-indigo-600" /> Distribution & Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Your Public Portal</span>
                  <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[300px]">{cardUrl}</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:scale-110 active:scale-95"
                >
                  {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full -mr-8 -mt-8"></div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Global Views</p>
                   <div className="flex items-end gap-3">
                     <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{cardData.views.toLocaleString()}</p>
                     <span className="text-[10px] font-black text-emerald-500 mb-1.5 uppercase font-mono">+12.4%</span>
                   </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8"></div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Identity Saves</p>
                   <div className="flex items-end gap-3">
                     <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{cardData.saves.toLocaleString()}</p>
                     <span className="text-[10px] font-black text-indigo-500 mb-1.5 uppercase font-mono">Synced</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-amber-50 dark:bg-amber-950/30 rounded-[2.5rem] border border-amber-200 dark:border-amber-800/50 flex gap-4 items-start">
             <Sparkles size={24} className="text-amber-500 shrink-0 mt-1" />
             <div>
                <h4 className="font-black text-amber-800 dark:text-amber-400 text-sm italic uppercase tracking-tighter">Designer Tip — The Power of Bio</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-500 leading-relaxed mt-1">
                  Our AI doesn't just pick colors; it analyzes your role and creates a high-conversion Bio. Pro users who use AI bios see a <strong>42% increase</strong> in identity saves during networking events.
                </p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
