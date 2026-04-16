import { useParams } from 'react-router-dom';
import { Download, Mail, Phone, Globe, MapPin, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * PublicProfile Component
 * 
 * This component is the public-facing gateway for digital business cards.
 * it renders the card using the AI-suggested 'Magic Design' specification.
 */
export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    link.setAttribute('download', `${slug}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] flex items-center justify-center">
         <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Sparkles size={28} className="rotate-12" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Identity Not Resolved</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || 'This public profile may have been moved or deactivated.'}</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm">
            Back to IntelliScan
          </a>
        </div>
      </div>
    );
  }

  const d = profile.design_json || {};
  const isDark = d.layout === 'bold_dark';
  const isGlass = d.layout === 'glassmorphism';

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-700"
      style={{ 
        background: `linear-gradient(${d.gradient_angle || '135deg'}, ${d.primary || '#4F46E5'}, ${d.secondary || '#7C3AED'})`,
        fontFamily: d.font || 'Inter'
      }}
    >
      {/* Gloss Highlight Overlay */}
      <div className="fixed inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
      
      <div className={`w-full max-w-sm rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative group transition-all duration-700 border-4 border-white/10 ${isGlass ? 'bg-white/10 backdrop-blur-2xl' : 'bg-white dark:bg-[#161c28]'}`}>
        
        {/* Profile Content */}
        <div className={`px-8 pt-12 pb-10 text-center relative z-10 ${isDark || isGlass ? 'text-white' : 'text-gray-900'}`}>
          
          <div className={`w-28 h-28 rounded-3xl flex items-center justify-center text-5xl font-black shadow-2xl mx-auto mb-8 transition-transform group-hover:rotate-6 duration-500 ${isDark || isGlass ? 'bg-white/20 backdrop-blur-3xl border border-white/30' : 'bg-indigo-600 text-white'}`}>
            {profile.avatar_text}
          </div>

          <h1 className="text-3xl font-black tracking-tighter mb-1">{profile.name}</h1>
          <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark || isGlass ? 'text-white/80' : 'text-indigo-600'}`}>{profile.headline}</p>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${isDark || isGlass ? 'text-white/50' : 'text-gray-400'}`}>{profile.company}</p>

          <div className={`text-sm font-medium leading-relaxed mb-10 opacity-90 px-2 line-clamp-4 ${isDark || isGlass ? 'text-white/80' : 'text-gray-600'}`}>
            {profile.bio}
          </div>

          <button 
            onClick={handleDownloadVCard}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 mb-10 hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${isDark || isGlass ? 'bg-white text-indigo-900 shadow-white/10' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
          >
            <Download size={20} />
            SAVE CONTACT
          </button>

          <div className="space-y-6 text-left">
            {[
              { icon: Phone, label: profile.phone, href: `tel:${profile.phone}` },
              { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
              { icon: MapPin, label: profile.location || 'Global Presence', href: '#' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 transition-transform hover:translate-x-1">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${isDark || isGlass ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                  <item.icon size={18} className={isDark || isGlass ? 'text-white/70' : 'text-indigo-600'} />
                </div>
                {item.href !== '#' ? (
                  <a href={item.href} className="text-sm font-bold truncate hover:underline">{item.label}</a>
                ) : (
                  <span className="text-sm font-bold truncate opacity-80">{item.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <div className={`border-t p-5 text-center relative z-10 ${isDark || isGlass ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark || isGlass ? 'text-white/40' : 'text-gray-400'}`}>
               Powered by <span className={isDark || isGlass ? 'text-white' : 'text-indigo-600'}>IntelliScan</span>
            </p>
        </div>
      </div>
      
      {/* Decorative background flair */}
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-black/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}
