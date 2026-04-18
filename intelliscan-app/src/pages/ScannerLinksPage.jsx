import { Plus, TrendingUp, Search, Link as LinkIcon, Copy, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getStoredToken } from '../utils/auth';

export default function ScannerLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const loadLinks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch('/api/scanner-links', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setLinks(payload.links || []);
    } catch (e) {
      console.error('Failed to load scanner links:', e);
      setError(e.message || 'Failed to load scanner links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const filteredLinks = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return links;
    return links.filter((l) => {
      const name = String(l.name || '').toLowerCase();
      const slug = String(l.slug || '').toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [links, query]);

  const activeCount = useMemo(() => links.filter((l) => l.is_active).length, [links]);
  const totalScans = useMemo(() => links.reduce((acc, l) => acc + Number(l.scan_count || 0), 0), [links]);

  const createLink = async () => {
    const name = window.prompt('New scanner link name?');
    if (!name) return;
    try {
      const token = getStoredToken();
      const res = await fetch('/api/scanner-links', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      await loadLinks();
    } catch (e) {
      console.error('Failed to create link:', e);
      setError(e.message || 'Failed to create link');
    }
  };

  const toggleLink = async (link) => {
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/scanner-links/${link.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !link.is_active })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setLinks((prev) => prev.map((l) => (l.id === link.id ? payload.link : l)));
    } catch (e) {
      console.error('Failed to toggle link:', e);
      setError(e.message || 'Failed to update link');
    }
  };

  const copyLink = async (link) => {
    const url = `${window.location.origin}/scan/${link.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      setError('Failed to copy link');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-headline mb-2">Scanner Links</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and monitor your active intelligent ingestion endpoints.</p>
        </div>
        <button onClick={createLink} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-500/20">
          <Plus size={20} /> Generate New Link
        </button>
      </header>

      {error ? (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      ) : null}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-12 lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Active Links</p>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter">{loading ? '—' : activeCount}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp size={16} />
            <span>Workspace endpoints</span>
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Global Scan Volume</p>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter">{loading ? '—' : totalScans.toLocaleString()}</h3>
          </div>
          
          {/* Aesthetic Bars */}
          <div className="flex gap-4 h-12 items-end">
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-1/2 w-full bg-brand-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-3/4 w-full bg-brand-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-1/4 w-full bg-brand-500 rounded-full"></div>
            </div>
            <div className="h-full w-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-end">
              <div className="h-full w-full bg-brand-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white font-headline">All Active Endpoints</h4>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/40 w-full md:w-64 text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400" 
              placeholder="Search links..." 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
              {loading ? (
                <tr>
                  <td className="px-6 md:px-8 py-10 text-gray-500 dark:text-gray-400" colSpan={5}>Loading scanner links...</td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td className="px-6 md:px-8 py-10 text-gray-500 dark:text-gray-400" colSpan={5}>
                    No scanner links yet. Click “Generate New Link” to create one.
                  </td>
                </tr>
              ) : (
                filteredLinks.map(link => {
                  const status = link.is_active ? 'Active' : 'Disabled';
                  const url = `${window.location.host}/scan/${link.slug}`;
                  const date = link.created_at ? new Date(link.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '--';
                  return (
                <tr key={link.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${status === 'Disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${status === 'Active' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                         <LinkIcon size={20} />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{link.name}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg w-fit border border-gray-200 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                      <code className={`text-xs tracking-tight ${status === 'Active' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>{url}</code>
                      <button onClick={() => copyLink(link)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                     <div className="flex items-center gap-2">
                        {/* Toggle switch visual */}
                        <button
                          type="button"
                          onClick={() => toggleLink(link)}
                          className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${status === 'Active' ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                          aria-label="Toggle scanner link"
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${status === 'Active' ? 'right-1' : 'left-1 dark:bg-gray-400'}`}></div>
                        </button>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{status}</span>
                     </div>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                     <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <span className="text-gray-900 dark:text-white font-bold">{Number(link.scan_count || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{link.engine || 'OCR-V2'}</span>
                     </div>
                  </td>
                  <td className="px-6 md:px-8 py-6 text-right text-gray-500 dark:text-gray-400">
                    {date}
                  </td>
                </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/10">
          <span>Showing {filteredLinks.length} Scanner Links</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors font-semibold flex items-center disabled:opacity-50" disabled><ChevronLeft size={16} /> Prev</button>
            <div className="flex gap-2">
               <span className="w-6 h-6 flex items-center justify-center bg-brand-600 text-white rounded font-bold shadow-sm">1</span>
            </div>
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors font-semibold flex items-center disabled:opacity-50" disabled>Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
