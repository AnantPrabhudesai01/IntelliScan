import { useParams } from 'react-router-dom';
import { Download, Mail, Phone, Briefcase, Globe, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.company}\nTITLE:${profile.title}\nTEL;TYPE=WORK,VOICE:${profile.phone}\nEMAIL;TYPE=WORK,INTERNET:${profile.email}\nURL:${profile.website}\nEND:VCARD`;
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
        <div className="max-w-md w-full bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'This public profile does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f18] flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      
      <div className="w-full max-w-sm bg-white dark:bg-[#161c28] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 border-4 border-white dark:border-[#161c28] shadow-md">
              {profile.avatar_text}
            </div>
          </div>
        </div>

        <div className="px-6 pt-16 pb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h1>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">{profile.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-6">{profile.company}</p>

          <button 
            onClick={handleDownloadVCard}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mb-8 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
          >
            <Download size={18} />
            Save Contact
          </button>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <a href={`tel:${profile.phone}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">{profile.phone}</a>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <a href={`mailto:${profile.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium break-all">{profile.email}</a>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Globe size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <span className="font-medium">{profile.website}</span>
            </div>

             <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <span className="font-medium">{profile.location}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 p-4 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Powered by IntelliScan</p>
        </div>
      </div>
    </div>
  );
}
