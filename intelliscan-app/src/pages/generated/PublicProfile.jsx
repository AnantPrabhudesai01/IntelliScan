import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, Mail, Phone, Globe, MapPin, Sparkles, 
  MessageCircle, Share2, Send, CheckCircle2, ChevronLeft 
} from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * PublicProfile Component - Digital Card Pro
 */
export default function PublicProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/profile/${encodeURIComponent(slug)}`);
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
        if (!cancelled) setProfile(payload);
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setError(err.message || 'Profile not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const handleDownloadVCard = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.company}\nTITLE:${profile.headline}\nTEL;TYPE=WORK,VOICE:${profile.phone}\nEMAIL;TYPE=WORK,INTERNET:${profile.email}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareProfile = (platform) => {
    const url = window.location.href;
    const text = `Connect with ${profile.name} on IntelliScan:`;
    const links = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('Professional Connection')}&body=${encodeURIComponent(text + '\n' + url)}`
    };
    if (links[platform]) window.open(links[platform], '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0f18] flex items-center justify-center">
         <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
         </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-6 font-['Outfit']">
        <div className="max-w-md w-full bg-[#161c28] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent"></div>
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
             <MapPin size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Identity Not Resolved</h2>
          <p className="text-slate-400 mb-10 leading-relaxed text-sm">This digital gateway is currently private or the connection has been moved. Verify the link with the profile owner.</p>
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all">
            <ChevronLeft size={18} /> BACK TO INTELLISCAN
          </button>
        </div>
      </div>
    );
  }

  const d = profile.design_json || {};
  const primary = d.primary || '#6366f1';
  const secondary = d.secondary || '#a855f7';

  return (
    <div 
      className="min-h-screen font-['Inter'] selection:bg-white/20 overflow-x-hidden transition-colors duration-500 bg-[var(--surface)] text-[var(--text-main)]"
    >
      {/* Animated Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[40%] -left-[20%] w-[100%] h-[100%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${primary}, transparent)` }}
        ></div>
        <div 
          className="absolute -bottom-[40%] -right-[20%] w-[100%] h-[100%] rounded-full blur-[120px] opacity-20 animate-pulse delay-700"
          style={{ background: `radial-gradient(circle, ${secondary}, transparent)` }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-24 flex flex-col items-center">
        
        {/* Main Glass Card */}
        <div className="w-full glass-card premium-grain rounded-[4rem] overflow-hidden transition-all duration-700 hover:shadow-indigo-500/20 group">
          
          {/* Header Banner */}
          <div className="h-40 relative overflow-hidden">
             <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-1000" style={{ background: `linear-gradient(${d.gradient_angle || '135deg'}, ${primary}, ${secondary})` }}></div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <div className="px-8 pb-12 -mt-20 relative text-center">
             {/* Avatar Box */}
             <div className="w-36 h-36 rounded-[2.5rem] bg-[var(--surface-card)] p-1 mx-auto mb-8 shadow-2xl relative group-hover:-translate-y-2 transition-transform duration-500 border border-[var(--border-subtle)]">
                <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-6xl font-['Outfit'] font-black text-[var(--text-main)] relative overflow-hidden">
                   <span className="relative z-10 drop-shadow-lg">{profile.avatar_text}</span>
                   <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-4 border-[var(--surface-card)]">
                   <CheckCircle2 size={16} />
                </div>
             </div>

             <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-['Outfit'] font-black text-[var(--text-main)] tracking-tighter">{profile.name}</h1>
                <div className="flex items-center justify-center gap-2">
                   <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">{profile.headline || 'Verified Professional'}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                   <span className="text-[var(--text-muted)] text-xs font-bold">{profile.company || 'Enterprise Partner'}</span>
                </div>
             </div>

             <p className="text-slate-300 text-sm leading-relaxed mb-10 px-4 font-medium opacity-80 italic">
                "{profile.bio}"
             </p>

             <div className="grid grid-cols-1 gap-3 mb-10">
                <button 
                  onClick={handleDownloadVCard}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-['Outfit'] font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 active:scale-95 transition-all"
                >
                  <Download size={20} strokeWidth={3} /> SAVE TO CONTACTS
                </button>
                <div className="flex gap-2">
                   <button onClick={copyLink} className="flex-1 py-4 bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-[1.5rem] font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all">
                      {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <LinkIcon size={16} />}
                      {copied ? 'COPIED!' : 'COPY URL'}
                   </button>
                   <button onClick={() => shareProfile('whatsapp')} className="w-14 h-14 bg-[var(--surface-card)] border border-[var(--border-subtle)] text-emerald-400 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
                      <MessageCircle size={20} />
                   </button>
                </div>
             </div>

             {/* Connection Grid */}
             <div className="space-y-3">
                {[
                  { icon: Mail, label: profile.email, href: `mailto:${profile.email}`, color: 'text-indigo-400' },
                  { icon: Phone, label: profile.phone, href: `tel:${profile.phone}`, color: 'text-emerald-400' },
                  { icon: LinkedinIcon, label: 'LinkedIn Profile', href: '#', color: 'text-blue-400' }
                ].map((item, idx) => (
                  <a key={idx} href={item.href} className="flex items-center gap-4 p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-all group/item shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} border border-[var(--border-subtle)]`}>
                      <item.icon size={18} />
                    </div>
                    <span className="flex-1 text-left text-sm font-bold text-[var(--text-main)]">{item.label}</span>
                    <ChevronLeft size={16} className="text-gray-400 rotate-180 group-hover/item:translate-x-1 transition-transform" />
                  </a>
                ))}
             </div>
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated Identity via <span className="text-white">IntelliScan</span></p>
          </div>
        </div>
        
        <p className="mt-12 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Designed by AI in real-time</p>
      </div>
    </div>
  );
}

function LinkIcon({ size, className }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
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
