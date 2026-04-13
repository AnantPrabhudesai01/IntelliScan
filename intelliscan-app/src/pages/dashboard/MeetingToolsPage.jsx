import { useState, useRef } from 'react';
import { Smartphone, Download, Share2, Camera, Video, Monitor, Layout, CheckCircle, ExternalLink } from 'lucide-react';
import { safeReadStoredUser } from '../../utils/auth.js';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';

export default function MeetingToolsPage() {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [selectedBg, setSelectedBg] = useState('dark-modern');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isDownloading, setIsDownloading] = useState(false);

  const storedUser = safeReadStoredUser();
  const displayName = storedUser?.name || (storedUser?.email ? storedUser.email.split('@')[0] : 'Your Name');
  const profileSlug = storedUser?.email ? storedUser.email.split('@')[0] : 'profile';
  const profileUrl = `${window.location.origin}/u/${encodeURIComponent(profileSlug)}`;

  const backgrounds = [
    { id: 'dark-modern', name: 'Dark Modern', color: 'bg-[#0e131f]', accent: 'bg-indigo-600' },
    { id: 'glass-blur', name: 'Glass Blur', color: 'bg-gradient-to-br from-indigo-900 via-slate-900 to-black', accent: 'bg-white/10' },
    { id: 'minimal-white', name: 'Minimal White', color: 'bg-white', accent: 'bg-gray-100', text: 'text-gray-900' },
    { id: 'cyber-neon', name: 'Cyber Neon', color: 'bg-black', accent: 'bg-purple-600' }
  ];

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `intelliscan-presence-${selectedBg}-${aspectRatio.replace(':', '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
    setIsDownloading(false);
  };

  const handleShare = (type) => {
    if (type === 'profile') {
      window.open(profileUrl, '_blank');
    } else if (type === 'linkedin') {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
      window.open(linkedinUrl, '_blank');
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-gray-800">
        <div>
           <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-4 italic uppercase">
             <Video className="text-indigo-600 animate-pulse" size={40} />
             Meeting Presence Tools
           </h2>
           <p className="text-lg text-gray-500 font-medium mt-2 max-w-2xl">
             Generate professional virtual backgrounds and digital presence assets with your integrated business card QR code.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={handleDownload} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95">
             {isDownloading ? 'GENERATING HIGH-RES...' : 'DOWNLOAD ASSETS'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Configuration Controls */}
        <div className="space-y-10">
           <section className="space-y-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={18} className="text-indigo-500" /> Choose Style Template
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {backgrounds.map(bg => (
                   <button 
                     key={bg.id} 
                     onClick={() => setSelectedBg(bg.id)}
                     className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${selectedBg === bg.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                   >
                      <div className={`w-full h-16 rounded-xl ${bg.color} border border-black/5 shadow-inner`}></div>
                      <span className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase italic leading-none">{bg.name}</span>
                   </button>
                 ))}
              </div>
           </section>

           <section className="space-y-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Monitor size={18} className="text-indigo-500" /> Platform Optimization
              </h3>
              <div className="space-y-3">
                 {[
                   { label: 'Zoom / Google Meet (16:9)', ratio: '16:9' },
                   { label: 'Microsoft Teams (4:3)', ratio: '4:3' },
                   { label: 'Mobile Portrait (9:16)', ratio: '9:16' }
                 ].map((p, i) => (
                    <button 
                      key={p.ratio} 
                      onClick={() => setAspectRatio(p.ratio)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${aspectRatio === p.ratio ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600' : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'}`}
                    >
                       <span className="font-bold text-sm tracking-tight">{p.label}</span>
                       <CheckCircle size={16} className={aspectRatio === p.ratio ? 'opacity-100' : 'opacity-0'} />
                    </button>
                 ))}
              </div>
           </section>

           <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[2.5rem] flex items-start gap-4">
              <Smartphone className="text-amber-600 shrink-0" size={24} />
              <p className="text-xs font-bold leading-relaxed text-amber-900 dark:text-amber-400">
                PRO TIP: In your meeting app settings (Zoom/Teams), turn off "Mirror my video" so your QR code appears correctly to other participants.
              </p>
           </div>
        </div>

        {/* Middle/Right: Live Preview Area */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Video size={18} className="text-indigo-500" /> Multi-Layer Asset Preview
           </h3>
           
           <div className="relative group max-w-4xl mx-auto">
              {/* The Virtual Background Preview */}
              <div 
                ref={previewRef}
                className={`rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white dark:border-gray-800 transition-all duration-700 ${backgrounds.find(b => b.id === selectedBg).color} ${
                  aspectRatio === '16:9' ? 'aspect-video' : 
                  aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-[9/16] max-w-sm mx-auto'
                }`}
              >
                 
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 skew-x-[-12deg] translate-x-1/2"></div>
                 
                 {/* The Fake User Video Circle */}
                 <div className="absolute bottom-[-20%] left-[-10%] w-3/4 h-full bg-gray-200/20 backdrop-blur-md rounded-full shadow-2xl border-2 border-white/20"></div>
                 
                 {/* QR & Info Panel (Top Right) */}
                 <div className="absolute top-12 right-12 w-80 bg-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-1000">
                    <div className="bg-white p-4 rounded-3xl inline-block shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                       <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}`} 
                          alt="Profile QR"
                          className="w-32 h-32"
                       />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase">{displayName}</h4>
                       <p className="text-indigo-300 font-bold tracking-widest text-[10px] uppercase mb-4">Enterprise Consultant</p>
                       <p className="text-white/60 text-[10px] font-medium leading-normal italic px-1">
                          Scan to save my details & view my portfolio instantly from anywhere in the world.
                       </p>
                    </div>
                 </div>

                 {/* Branding (Bottom Right) */}
                 <div className="absolute bottom-8 right-12 text-white/20 font-black text-xl tracking-tighter uppercase italic">
                    IntelliScan Digital Presence
                 </div>
              </div>

              {/* Overlay Label */}
              <div className="absolute -top-4 -right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                 LIVE ASSET GENERATOR v1
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div 
                onClick={() => handleShare('linkedin')}
                className="bg-white dark:bg-[#161c28] border border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:border-indigo-500 transition-all cursor-pointer"
              >
                 <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Smartphone size={32} />
                 </div>
                 <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase italic flex items-center gap-2">Mobile Handout <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></h4>
                    <p className="text-xs text-gray-400 font-bold">Share to LinkedIn Bio</p>
                 </div>
              </div>

              <div 
                onClick={() => handleShare('profile')}
                className="bg-white dark:bg-[#161c28] border border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:border-indigo-500 transition-all cursor-pointer"
              >
                 <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Share2 size={32} />
                 </div>
                 <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase italic flex items-center gap-2">Digital Profile <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></h4>
                    <p className="text-xs text-gray-400 font-bold">Public Microsite View</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
