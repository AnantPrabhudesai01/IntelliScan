import { 
  MapPin, Calendar, Users, ChevronRight, Plus, Search, Filter, X, 
  Globe, Target, TrendingUp, BarChart3, Clock, Sparkles, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredToken } from '../../utils/auth.js';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, map
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', date: '', type: 'Conference' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLocationSugg, setShowLocationSugg] = useState(false);
  const [locationResults, setLocationResults] = useState([]);

  useEffect(() => {
    if (!formData.location || formData.location.length < 2) {
      setLocationResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(formData.location)}&limit=5`);
        const data = await res.json();
        const simplified = data.features.map(f => {
          const p = f.properties;
          return [p.name, p.city, p.country].filter(Boolean).join(', ');
        });
        setLocationResults([...new Set(simplified)]);
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if(res.ok) {
        // Add ROI & Metadata mocks for 2.0 Feel
        const enriched = data.map(evt => ({
          ...evt,
          target_leads: 500,
          growth: '+12%',
          top_industries: ['Tech', 'SaaS', 'Fintech'],
          reach: Math.floor(Math.random() * 100)
        }));
        setEvents(enriched);
      }
    } catch(err) { 
      console.error('Failed to fetch events', err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getStoredToken();
      // 1. Create the marketing event
      await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      // 2. Automatically sync with Calendar
      // Parsing "Nov 12 - 14" loosely by creating a generic start date
      await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Campaign: ${formData.name}`,
          description: `Networking hub for ${formData.location}. Scheduled during: ${formData.date}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString() // +1 day default block
        })
      });

      setIsModalOpen(false);
      setFormData({ name: '', location: '', date: '', type: 'Conference' });
      fetchEvents();
    } catch(err) { 
      console.error(err); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-200 dark:border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
               <Target size={24} />
             </div>
             <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Campaign Center</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed ml-12">
            Orchestrate trade-show leads and monitor regional expansion metrics in real-time.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           {/* View Switcher */}
           <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 flex shadow-inner">
             <button 
               onClick={() => setViewMode('grid')}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
             >
               Explorer
             </button>
             <button 
               onClick={() => setViewMode('map')}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
             >
               Global Map
             </button>
           </div>
           
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
           >
             <Plus size={18} /> Add Campaign
           </button>
        </div>
      </header>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {[
           { label: 'Active Hubs', value: '14', icon: Globe, color: 'indigo' },
           { label: 'Avg lead/hr', value: '42.8', icon: Activity, color: 'emerald' },
           { label: 'Conversion', value: '18.2%', icon: TrendingUp, color: 'amber' },
           { label: 'Org Reach', value: '92%', icon: BarChart3, color: 'purple' },
         ].map((kpi, i) => (
           <div key={i} className="bg-white dark:bg-[#1A1A2E] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                 <kpi.icon size={80} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                 <div className={`p-2 bg-${kpi.color}-500/10 text-${kpi.color}-500 rounded-xl`}>
                   <kpi.icon size={18} />
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{kpi.value}</p>
           </div>
         ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt, idx) => {
            const progress = (evt.attendees_count / evt.target_leads) * 100;
            return (
              <div key={idx} className="group relative bg-white dark:bg-[#161c28] border border-gray-100 dark:border-white/10 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-500 flex flex-col">
                <div className="p-8 flex-1 space-y-6">
                  {/* Status & Menu */}
                  <div className="flex items-center justify-between">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      evt.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {evt.status === 'active' ? '● System Active' : 'Completed'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-500">
                       <Clock size={14} /> {evt.date}
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic truncate">{evt.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mt-1">
                      <MapPin size={16} className="text-indigo-400" /> {evt.location}
                    </div>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap gap-2">
                     {evt.top_industries.map(tag => (
                       <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-[9px] font-black text-gray-500 uppercase rounded-lg border border-gray-200 dark:border-white/5 transition-colors group-hover:border-indigo-500/20 group-hover:text-indigo-400">
                         {tag}
                       </span>
                     ))}
                  </div>

                  {/* ROI Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Target ROI</span>
                       <span className="text-sm font-black text-gray-900 dark:text-white">{evt.attendees_count} <span className="text-[10px] opacity-40">/ {evt.target_leads}</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner p-0.5">
                       <div 
                         className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                         style={{ width: `${Math.min(progress, 100)}%` }}
                       />
                    </div>
                  </div>
                </div>
                
                <Link 
                  to={`/dashboard/contacts?eventId=${evt.id}`} 
                  className="mx-8 mb-8 mt-2 p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center justify-between group/btn hover:bg-indigo-600 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-indigo-600 group-hover/btn:bg-white/10 group-hover/btn:text-white transition-colors">
                        <Users size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 group-hover/btn:text-white/60 uppercase tracking-widest">Intelligence Hub</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white group-hover/btn:text-white">View Extracted Leads</p>
                     </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </Link>
              </div>
            );
          })}

          {/* Add Empty State / CTA */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="group relative bg-dashed border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-600/[0.03] hover:border-indigo-500/50 transition-all duration-500 min-h-[400px]"
          >
             <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Plus size={32} className="text-gray-400 group-hover:text-white transition-colors" />
             </div>
             <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight italic">Initiate Campaign</h3>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-10">Expand your reach. Create a professional hub for your next networking event.</p>
          </div>
        </div>
      ) : (
        /* Enhanced Map View (Mock visualization) */
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-white/10 rounded-[40px] p-12 shadow-2xl animate-in zoom-in-95 duration-500 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <Globe size={800} className="absolute -top-40 -left-40" />
           </div>
           
           <Globe size={80} className="text-indigo-600 dark:text-indigo-400 mb-8 animate-pulse" />
           <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Global Expansion Explorer</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg mt-4 leading-relaxed">
             This interactive Map view is processing your <b>{events.reduce((a, b) => a + b.attendees_count, 0)}</b> worldwide leads. 
             Regional clusters are detected in <b>North America</b>, <b>Western Europe</b>, and <b>APAC</b>.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl relative z-10">
              {[
                { label: 'Europe Cluster', value: '4.2k Leads', color: 'bg-indigo-500' },
                { label: 'NA Hubs', value: '8.9k Leads', color: 'bg-emerald-500' },
                { label: 'APAC Velocity', value: '1.4k Leads', color: 'bg-amber-500' },
              ].map((m, i) => (
                <div key={i} className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 flex flex-col items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${m.color} shadow-lg shadow-${m.color.split('-')[1]}-500/40`} />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                   <p className="text-xl font-black text-gray-900 dark:text-white">{m.value}</p>
                </div>
              ))}
           </div>

           <button 
             onClick={() => setViewMode('grid')}
             className="mt-12 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
           >
             Return to Explorer
           </button>
        </div>
      )}

      {/* Modal - Modernized */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A2E] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">New Campaign</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Orchestrating Regional Hub</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                   Campaign Identity <Sparkles size={12} className="text-indigo-400" />
                </label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Q4 Global AI Summit" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block w-full">Location Hub</label>
                  <div className="relative">
                    <input 
                      required 
                      value={formData.location} 
                      onFocus={() => setShowLocationSugg(true)}
                      onBlur={() => setTimeout(() => setShowLocationSugg(false), 200)}
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      type="text" 
                      className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      placeholder="e.g. San Francisco" 
                    />
                    <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  {showLocationSugg && locationResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {locationResults.map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, location: city});
                            setShowLocationSugg(false);
                          }}
                          className="w-full px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                        >
                          <Globe size={12} className="text-indigo-400" />
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block w-full">Campaign Slot</label>
                  <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="text" className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Nov 12 - 14" />
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-all">Discard</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-70">
                  {isSubmitting ? 'Syncing...' : 'Live Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
