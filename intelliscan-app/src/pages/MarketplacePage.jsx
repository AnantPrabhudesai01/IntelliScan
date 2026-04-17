import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Download, Cloud, Globe, MessageSquare, 
  Database, ArrowRight, CheckCircle2, Settings2, X, ExternalLink, 
  Zap, RefreshCw, Check, AlertTriangle, Plus, LayoutGrid, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth';

const apps = [
  {
    id: 'salesforce', name: 'Salesforce CRM', icon: Cloud, category: 'CRM', color: 'text-[#00a1e0]', 
    desc: 'Automatically sync parsed business cards as new Leads or Contacts in Salesforce.',
    featured: true,
    rating: 4.9
  },
  {
    id: 'hubspot', name: 'HubSpot', icon: Globe, category: 'Marketing', color: 'text-[#ff5a5f]', 
    desc: 'Enrich incoming scanned prospects with HubSpot marketing data instantly.',
    featured: true,
    rating: 4.8
  },
  {
    id: 'slack', name: 'Slack Alerts', icon: MessageSquare, category: 'Communication', color: 'text-indigo-400', 
    desc: 'Get a direct message in Slack whenever a VIP contact is scanned at an event.',
    rating: 4.7
  },
  {
    id: 'snowflake', name: 'Snowflake Sync', icon: Database, category: 'Data Warehouse', color: 'text-indigo-400', 
    desc: 'Enterprise data warehouse pipeline. Requires business admin approval.',
    rating: 4.5
  },
  {
    id: 'sheets', name: 'Google Sheets', icon: Database, category: 'Export', color: 'text-emerald-500', 
    desc: 'Real-time appending of scanned contacts to a shared Google Sheet.',
    rating: 4.6
  }
];

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3 animate-slide-in">
      <Check size={16} /> {msg}
    </div>
  );
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const categories = ['All', 'CRM', 'Marketing', 'Communication', 'Data Warehouse', 'Export'];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || {});
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 w-full animate-fade-in bg-[var(--surface)]">
      <Toast msg={toast} />

      {/* Hero Discovery Banner */}
      <div className="bg-gradient-to-br from-[#21132E] via-[#2A1B3D] to-[#3D2650] rounded-[40px] p-8 md:p-14 mb-12 text-white relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(33,19,46,0.5)]">
        <div className="absolute top-0 right-0 w-full h-full">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} className="text-amber-400 animate-pulse" /> New Release: Salesforce v2.1
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.9] italic">
               The Data <br/>
               <span className="text-indigo-400">Bridge</span> Hub
            </h1>
            <p className="text-lg text-indigo-100/70 font-medium max-w-md leading-relaxed uppercase tracking-tight">
               Build your enterprise lead-flow. Automatically route AI-extracted intelligence directly into your existing toolstack.
            </p>
            <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10 w-full md:w-[450px] focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-inner">
               <Search className="text-white/20 ml-4 mr-3 my-auto" size={24} />
               <input
                 type="text"
                 placeholder="Search 100+ business integrations..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="bg-transparent border-none text-white placeholder-white/20 focus:outline-none w-full py-3.5 font-bold text-lg"
               />
            </div>
          </div>

          {/* Featured Dynamic Card */}
          <div className="hidden lg:block relative group">
             <div className="absolute inset-0 bg-indigo-600/20 blur-[60px] group-hover:bg-indigo-600/40 transition-all duration-1000" />
             <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <Cloud className="text-[#00a1e0]" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic">Salesforce</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Integration</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">Sync contacts instantly from business cards into Salesforce Leads. Automated field mapping and duplicate detection included.</p>
                <Link to="/marketplace/salesforce" className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest group/btn">
                  View App Detail <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-10">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
              <Filter size={14} /> Ecosystem filters
            </h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all
                    ${activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-indigo-600/5 dark:bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl relative overflow-hidden">
             <Star size={60} className="absolute -right-4 -bottom-4 text-indigo-500/10" />
             <h4 className="font-black text-sm text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-tight italic">Built your own?</h4>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-4">Integrate your bespoke tools using our Intelligence API.</p>
             <Link to="/api-docs" className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                Read API Specs <ArrowRight size={12} />
             </Link>
          </section>

          <section className="p-6 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Linked Briges</p>
             <div className="flex items-end justify-between mb-4">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{Object.keys(integrations).length}</h2>
                <span className="text-xs font-bold text-gray-400 mb-1">/ {apps.length} Total</span>
             </div>
             <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{ width: `${(Object.keys(integrations).length / apps.length) * 100}%` }}
                />
             </div>
          </section>
        </div>

        {/* Content Grid */}
        <div className="flex-1 space-y-8">
           <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{activeCategory} Marketplace</h2>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                 <LayoutGrid size={14} /> Showing {filteredApps.length} Apps
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {filteredApps.map(app => {
               const activeInt = integrations[app.id];
               const isInstalled = !!activeInt?.isActive;
               return (
                 <Link 
                   key={app.id} 
                   to={`/marketplace/${app.id}`}
                   className="group relative bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-[32px] p-8 hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-500"
                 >
                   {isInstalled && (
                     <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                        <Check size={10} /> Active
                     </div>
                   )}
                   
                   <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                        <app.icon size={32} className={app.color} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">{app.name}</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{app.category}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300" />
                           <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                              <Star size={10} fill="currentColor" /> {app.rating}
                           </div>
                        </div>
                      </div>
                   </div>

                   <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-1">
                     {app.desc}
                   </p>

                   <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5 mt-auto">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isInstalled ? 'Configure Bridge' : 'Read Specs'}</span>
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <ArrowRight size={18} />
                      </div>
                   </div>
                 </Link>
               );
             })}

             {/* Add Custom Trigger */}
             <div 
               onClick={() => navigate('/api-docs')}
               className="group relative bg-dashed border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 hover:border-indigo-400 transition-all duration-500 min-h-[260px]"
             >
                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-inner">
                   <Plus size={32} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-lg font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight italic">Request Bridge</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-10">Use our Intelligence SDK to connect your bespoke workflow.</p>
             </div>
           </div>

           {filteredApps.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <Search size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white italic">No bridges detected</h3>
                <p className="text-xs text-gray-500 font-medium">Clear search terms to reveal all verified integrations.</p>
                <button onClick={() => setSearch('')} className="mt-6 px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm hover:shadow-md transition-all">Reset Discovery</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
