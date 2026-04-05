import { Plus, TrendingUp, Search, Link as LinkIcon, Copy, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ScannerLinksPage() {
  const links = [
    {
      id: 1,
      name: 'Main Entrance Portal',
      url: 'intelli.scan/e/main-portal-x9',
      status: 'Active',
      scans: '12,402',
      engine: 'OCR-V2',
      date: 'Oct 12, 2023'
    },
    {
      id: 2,
      name: 'HR Document Drop',
      url: 'intelli.scan/e/hr-internal-01',
      status: 'Active',
      scans: '3,891',
      engine: 'OCR-V2',
      date: 'Nov 04, 2023'
    },
    {
      id: 3,
      name: 'Archive Legacy Link',
      url: 'intelli.scan/e/legacy-archive',
      status: 'Disabled',
      scans: '45,012',
      engine: 'Legacy',
      date: 'Jan 15, 2023'
    },
    {
      id: 4,
      name: 'Mobile Client Upload',
      url: 'intelli.scan/e/mobile-v3',
      status: 'Active',
      scans: '22,986',
      engine: 'OCR-PRO',
      date: 'Dec 28, 2023'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-headline mb-2">Scanner Links</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and monitor your active intelligent ingestion endpoints.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={20} /> Generate New Link
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-12 lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Active Links</p>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter">12</h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp size={16} />
            <span>+2 this month</span>
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Global Scan Volume</p>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter">84,291</h3>
          </div>
          
          {/* Aesthetic Bars */}
          <div className="flex gap-4 h-12 items-end">
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-1/2 w-full bg-indigo-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-3/4 w-full bg-indigo-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-1/4 w-full bg-indigo-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-full w-full bg-indigo-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white font-headline">All Active Endpoints</h4>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/40 w-full md:w-64 text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400" 
              placeholder="Search links..." 
              type="text" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/20 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 md:px-8 py-5">Link Name</th>
                <th className="px-6 md:px-8 py-5">URL Endpoint</th>
                <th className="px-6 md:px-8 py-5">Status</th>
                <th className="px-6 md:px-8 py-5">Total Scans</th>
                <th className="px-6 md:px-8 py-5 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800/50">
              {links.map(link => (
                <tr key={link.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${link.status === 'Disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${link.status === 'Active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                         <LinkIcon size={20} />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{link.name}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg w-fit border border-gray-200 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                      <code className={`text-xs tracking-tight ${link.status === 'Active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{link.url}</code>
                      <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                     <div className="flex items-center gap-2">
                        {/* Toggle switch visual */}
                        <div className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${link.status === 'Active' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${link.status === 'Active' ? 'right-1' : 'left-1 dark:bg-gray-400'}`}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{link.status}</span>
                     </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                     <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <span className="text-gray-900 dark:text-white font-bold">{link.scans}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{link.engine}</span>
                     </div>
                  </td>
                  <td className="px-6 md:px-8 py-6 text-right text-gray-500 dark:text-gray-400">
                    {link.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/10">
          <span>Showing 1-{links.length} of {links.length} Scanner Links</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors font-semibold flex items-center disabled:opacity-50" disabled><ChevronLeft size={16} /> Prev</button>
            <div className="flex gap-2">
               <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded font-bold shadow-sm">1</span>
            </div>
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors font-semibold flex items-center disabled:opacity-50" disabled>Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
