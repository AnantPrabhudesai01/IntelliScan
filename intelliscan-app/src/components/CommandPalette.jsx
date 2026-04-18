import { useState, useEffect } from 'react';
import { Search, X, User, Calendar, Mail, Command, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth.js';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Toggle open/close with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const token = getStoredToken();
        const res = await fetch(`/api/search/global?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.type === 'contact') navigate(`/dashboard/contacts?id=${item.id}`);
    if (item.type === 'event') navigate(`/dashboard/events`);
    if (item.type === 'campaign') navigate(`/workspace/campaigns`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 sm:px-6 md:px-20 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#161c28] rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden animate-in slide-in-from-top-4 duration-300 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 relative">
          <Search className="text-gray-400 mr-4" size={24} />
          <input 
            autoFocus
            type="text" 
            placeholder="Type to search contacts, events, or campaigns..." 
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-medium placeholder:text-gray-400 font-body text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ESC</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto font-body">
          {loading && (
            <div className="p-10 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 text-sm font-bold tracking-tight">Accessing Neural Database...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Results</p>
              {results.map((item, idx) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                    idx === activeIndex ? 'bg-brand-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${idx === activeIndex ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {item.type === 'contact' && <User size={18} />}
                      {item.type === 'event' && <Calendar size={18} />}
                      {item.type === 'campaign' && <Mail size={18} />}
                    </div>
                    <div>
                      <p className="font-bold tracking-tight">{item.title}</p>
                      <p className={`text-xs ${idx === activeIndex ? 'text-brand-100' : 'text-gray-400'}`}>{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={idx === activeIndex ? 'opacity-100' : 'opacity-0'} />
                </div>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">No results found for "{query}"</h3>
              <p className="text-sm text-gray-400 mt-1">Try searching for a different name or company.</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="p-10 text-center">
               <div className="flex justify-center gap-6 mb-8 text-brand-500/20">
                  <User size={48} />
                  <Mail size={48} />
                  <Command size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Search Intelligence Center</h3>
               <p className="text-gray-500 dark:text-gray-400 px-10">
                 Quickly find anything in your IntelliScan workspace. Use arrow keys to navigate and Enter to jump to any page.
               </p>
               <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {['Recent Scans', 'Events', 'Campaigns', 'Personal Settings'].map(tag => (
                    <button key={tag} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:text-brand-500 transition-colors">
                      {tag}
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="p-1 px-1.5 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">↑↓</span>
            Navigate
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="p-1 px-1.5 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">ENTER</span>
            Select
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-auto">
             <Zap size={10} className="text-amber-500" />
             AI Search Platform v1.2
          </div>
        </div>
      </div>
    </div>
  );
}
