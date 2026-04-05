import { Search, Download, CloudSync, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContacts } from '../context/ContactContext';

export default function WorkspaceContacts() {
  const { contacts } = useContacts();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-headline tracking-tight">Team Contacts</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and export your organization's scanned intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-sm font-semibold shadow-sm">
            <Download size={16} /> Export to CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl transition-all hover:bg-indigo-700 text-sm font-semibold shadow-sm active:scale-95">
            <CloudSync size={16} /> Push to CRM
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/40 transition-all outline-none" 
            placeholder="Search by name, company, or email..." 
            type="text"
          />
        </div>
        <div className="lg:col-span-3">
          <select className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 appearance-none outline-none">
            <option>All Engines</option>
            <option>Gemini Vision Pro</option>
            <option>IntelliScan OCR-v2</option>
          </select>
        </div>
        <div className="lg:col-span-3">
          <select className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 appearance-none outline-none">
            <option>All Confidence Levels</option>
            <option>95%+ High Precision</option>
            <option>80%+ Reliable</option>
            <option>{'<'} 80% Needs Review</option>
          </select>
        </div>
      </section>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 w-12 text-center">
                  <input className="rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact Details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email Address</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Scan Engine</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Confidence</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date Added</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {contacts.map((contact, index) => (
                <tr key={contact.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="p-4 text-center">
                    <input className="rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{contact.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{contact.title}, {contact.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{contact.email || '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-[10px] font-mono font-bold tracking-tight">
                      {contact.engine_used}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      contact.confidence >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      contact.confidence >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {contact.confidence}% {contact.confidence >= 90 ? 'High' : contact.confidence >= 70 ? 'Reliable' : 'Review'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    Oct {24 - index}, 2024
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <footer className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800/10 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Showing 1-{contacts.length} of {contacts.length + 1235} contacts</p>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold">1</button>
            <button className="px-3 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-gray-900 dark:hover:text-white">2</button>
            <button className="px-3 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-gray-900 dark:hover:text-white">3</button>
            <button className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
