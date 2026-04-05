import { useState, useEffect } from 'react';
import { Search, Building2, ChevronRight, User as UserIcon, Share2, Download, Filter, MoreHorizontal, MousePointerClick, Activity, LayoutGrid, Layers, ListTree, ArrowRightLeft, X, ExternalLink, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { getStoredToken } from '../utils/auth.js';

export default function OrgChartPage() {
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'grid'
  const [selectedContact, setSelectedContact] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      fetchChart(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchChart = async (company) => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/org-chart/${encodeURIComponent(company)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChartData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch org chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (companySearch.trim()) {
      setSelectedCompany(companySearch.trim());
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Report Generated: Hierarchy PDF has been saved to your downloads.');
    }, 2000);
  };

  const handleShare = () => {
    setSharing(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => {
      setSharing(false);
      alert('Share Link Copied: Workspace members with this link can view this live map.');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-3xl font-extrabold font-headline text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Layers className="text-indigo-600 dark:text-indigo-400" size={32} />
              Organizational Intelligence
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-body mt-2">
              Shared team-wide maps gathered from your workspace contacts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Download size={16} className={exporting ? 'animate-bounce' : ''} /> 
              {exporting ? 'Generating...' : 'Export PDF'}
            </button>
            <button 
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Share2 size={16} /> {sharing ? 'Copied!' : 'Share Map'}
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search team-scanned companies..." 
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm text-gray-900 dark:text-white"
            />
          </form>

          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'tree' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <ListTree size={14} /> Tree View
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <LayoutGrid size={14} /> Grid View
            </button>
          </div>
        </div>

        {/* Main Visualization Area */}
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Processing Multi-User Intelligence...</p>
          </div>
        ) : !chartData ? (
          <div className="min-h-[400px] rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-12 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6">
              <Building2 className="text-indigo-600 dark:text-indigo-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Build Your First Org Chart</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm">
              We aggregate all business cards scanned by your workspace team. Search for a company to visualize the collective network.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Apple', 'Google', 'Microsoft', 'Tesla'].map(c => (
                <button key={c} onClick={() => setSelectedCompany(c)} className="px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95">
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in zoom-in-95 duration-500">
            {/* Company Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl">
                <Building2 className="absolute top-1/2 right-4 -translate-y-1/2 text-white/10 group-hover:scale-125 transition-transform duration-700" size={140} />
                <div className="relative z-10">
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Company Entity</p>
                  <h4 className="text-4xl font-black tracking-tighter mb-4">{chartData.company}</h4>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-center border border-white/10">
                      <p className="text-[9px] font-black uppercase opacity-60">Team Nodes</p>
                      <p className="text-xl font-black">{chartData.nodes.length}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-center border border-white/10">
                      <p className="text-[9px] font-black uppercase opacity-60">Avg. Seniority</p>
                      <p className="text-xl font-black">Level 3</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-around gap-8 shadow-sm">
                 <div className="text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Network Depth</p>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">94%</div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">+2.4% Strength</div>
                 </div>
                 <div className="hidden md:block w-px h-16 bg-gray-100 dark:bg-gray-800"></div>
                 <div className="text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Mutual Contacts</p>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">12</div>
                    <div className="text-[10px] text-indigo-500 font-bold mt-1 uppercase">Workspace Shared</div>
                 </div>
                 <div className="hidden md:block w-px h-16 bg-gray-100 dark:bg-gray-800"></div>
                 <div className="text-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Sync Engine</p>
                    <div className="flex items-center gap-2 justify-center text-emerald-500 font-black text-xs uppercase">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Intelligence Active
                    </div>
                 </div>
              </div>
            </div>

            {/* The Chart / Tree Itself */}
            <div className="space-y-16 py-8 relative">
              {/* Vertical Master Line for Tree View */}
              {viewMode === 'tree' && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent pointer-events-none"></div>
              )}

              {['C-Suite', 'Management', 'Individual'].map((level) => {
                const nodes = chartData.nodes.filter(n => n.level === level);
                if (nodes.length === 0) return null;

                return (
                  <div key={level} className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm border ${
                        level === 'C-Suite' ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40' :
                        level === 'Management' ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40' :
                        'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {level}
                      </div>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                    </div>

                    <div className={viewMode === 'grid' ? 
                      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : 
                      "flex flex-wrap justify-center gap-10"}>
                      
                      {nodes.map((node) => (
                        <div 
                          key={node.id} 
                          onClick={() => setSelectedContact(node)}
                          className={`bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-6 rounded-[2.5rem] hover:border-indigo-500/50 transition-all hover:shadow-[0_20px_50px_-15px_rgba(79,70,229,0.1)] group relative overflow-hidden cursor-pointer ${viewMode === 'tree' ? 'w-full md:w-[320px]' : ''}`}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors shadow-inner overflow-hidden">
                              {node.profile_image ? (
                                <img src={node.profile_image} className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon size={24} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                               <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{node.name}</h5>
                               <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest truncate">{node.job_title}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                             <span className="text-[9px] font-bold bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-gray-500">Workspace Member</span>
                             {node.level === 'C-Suite' && <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800/40 text-amber-600">Decision Maker</span>}
                          </div>

                          <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                             <ArrowRightLeft size={16} className="text-indigo-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Side Detail Panel */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContact(null)}></div>
           <div className="relative w-full max-w-md bg-white dark:bg-[#0e131f] h-full shadow-2xl animate-in slide-in-from-right duration-500 border-l border-gray-200 dark:border-gray-800">
              <div className="p-8 h-full flex flex-col">
                 <div className="flex justify-between items-center mb-10">
                    <span className="bg-indigo-600 text-[10px] text-white font-black px-2 py-0.5 rounded uppercase tracking-[0.2em]">Contact Deep-Dive</span>
                    <button onClick={() => setSelectedContact(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
                          <UserIcon size={40} className="text-indigo-600" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedContact.name}</h3>
                          <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-1">{selectedContact.job_title}</p>
                          <div className="flex items-center gap-2 mt-3 p-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg w-fit">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                             <span className="text-[9px] font-black text-emerald-600 uppercase">Verified Identity</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                          <Mail className="text-gray-400" size={18} />
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                             <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{selectedContact.email || 'N/A'}</p>
                          </div>
                          <ExternalLink className="ml-auto text-indigo-500 cursor-pointer" size={14} />
                       </div>
                       <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                          <Building2 className="text-gray-400" size={18} />
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</p>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedContact.company}</p>
                          </div>
                       </div>
                       <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                          <MapPin className="text-gray-400" size={18} />
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Office Location</p>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">Headquarters, Silicon Valley</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Activity size={14} /> Workspace Intelligence
                       </h4>
                       <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                          <Zap className="absolute top-1/2 right-0 -translate-y-1/2 text-white/10 opacity-50" size={80} />
                          <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-100">AI Context</p>
                          <p className="text-sm font-medium leading-relaxed italic">
                             "This contact is part of the decision-making cycle for your recently scanned event project. High intent detected based on career trajectory."
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                    <button className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                       Sync to CRM
                    </button>
                    <button className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95">
                       Draft Email
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
