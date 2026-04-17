import { Users, Filter, Download, Lock, Building2, MessageSquare, Send, X, MousePointer2, AlertTriangle, Mail, Check, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getStoredToken, safeReadStoredUser } from '../../utils/auth';

export default function SharedRolodexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [cursors, setCursors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDupAlert, setShowDupAlert] = useState(false);
  const [exportingCrm, setExportingCrm] = useState('');
  const [exportMsg, setExportMsg] = useState('');
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const parsedUser = safeReadStoredUser() || { name: 'Admin', email: 'admin@test.com' };
  const userName = parsedUser?.name || 'Admin';
  const userEmail = parsedUser?.email || 'admin@test.com';
  const userId = parsedUser?.id || 'anonymous';
  const workspaceRoom = parsedUser?.workspace_id ? `workspace-${parsedUser.workspace_id}` : `workspace-user-${userId}`;

  const myColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < userEmail.length; i++) hash = userEmail.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  }, [userEmail]);

  const fetchAll = async () => {
    setLoading(true);
    const token = getStoredToken();
    try {
      const [conRes, dupRes] = await Promise.all([
        fetch('/api/workspace/contacts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/workspace/contacts/duplicates', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (conRes.ok) setContacts(await conRes.json());
      if (dupRes.ok) {
        const dupData = await dupRes.json();
        setDuplicates(dupData.duplicates || []);
        if ((dupData.duplicates || []).length > 0) setShowDupAlert(true);
      }
    } catch (e) { console.error('Fetch error:', e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const token = getStoredToken();

    // Chat history
    fetch(`/api/chats/${encodeURIComponent(workspaceRoom)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.map(d => ({ 
            id: d.id, 
            user: d.user_name, 
            text: d.message, 
            color: d.color, 
            timestamp: d.timestamp 
          })));
        }
      })
      .catch(() => {});

    // Socket.IO
    socketRef.current = io({ auth: { token: token || '' } });
    socketRef.current.emit('join-workspace', { user: userName, workspaceId: workspaceRoom });
    socketRef.current.on('new-chat-message', (data) => setMessages(prev => [...prev, data]));
    socketRef.current.on('cursor-update', (data) => setCursors(prev => ({ ...prev, [data.id]: data })));
    socketRef.current.on('user-left', (data) => setCursors(prev => { const nc = { ...prev }; delete nc[data.id]; return nc; }));

    const handleMouseMove = (e) => socketRef.current?.emit('cursor-move', { x: e.clientX, y: e.clientY, user: userName, color: myColor });
    window.addEventListener('mousemove', handleMouseMove);
    return () => { window.removeEventListener('mousemove', handleMouseMove); socketRef.current?.disconnect(); };
  }, [workspaceRoom, userName, myColor]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    socketRef.current?.emit('send-chat', { user: userName, text: msg.trim(), color: myColor });
    setMsg('');
  };

  const handleExport = async (provider) => {
    setExportingCrm(provider);
    setExportMsg('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/crm/export/${provider}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${provider}-contacts.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setExportMsg(`✓ ${contacts.length} contacts exported to ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
    } catch (err) { setExportMsg(`✗ Export failed: ${err.message}`); }
    setExportingCrm('');
    setTimeout(() => setExportMsg(''), 4000);
  };

  const isDuplicateEmail = (email) => duplicates.some(d => d.email === (email || '').toLowerCase().trim() && d.count > 1);

  const filteredContacts = (contacts || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalProcessed = (contacts || []).length;
  const repsScanningCount = new Set((contacts || []).map(c => c.scanner_name).filter(Boolean)).size || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">Enterprise Active</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="text-xs text-gray-500">Live Team Sync</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Shared Rolodex</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Collaborative workspace showing all business cards scanned across your entire sales organization. Duplicate outreach prevention is active.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {/* CRM Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
              <Download size={16} /> Export to CRM ▾
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800">Enterprise Sync</div>
              {['salesforce', 'zoho', 'odoo']?.map(crm => (
                <button key={crm} onClick={() => handleExport(crm)} disabled={exportingCrm === crm}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors capitalize disabled:opacity-50">
                  {exportingCrm === crm ? <RefreshCw size={14} className="animate-spin" /> : <Building2 size={14} />}
                  {crm === 'zoho' ? 'Zoho CRM' : crm.charAt(0).toUpperCase() + crm.slice(1)}
                </button>
              ))}
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => { const a = document.createElement('a'); a.href = `/api/crm/export/csv?token=${encodeURIComponent(getStoredToken() || '')}`; }} className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 font-semibold transition-colors">+ Download CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export feedback */}
      {exportMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${exportMsg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
          {exportMsg}
        </div>
      )}

      {/* Duplicate Alert Banner */}
      {showDupAlert && duplicates.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">⚠️ Duplicate Outreach Detected — {duplicates.length} contact{duplicates.length > 1 ? 's' : ''} scanned by multiple team members</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Preventing double-emailing the same person. Rows marked with <span className="font-black">⚠</span> are duplicates.</p>
              <div className="mt-3 space-y-1.5">
                {duplicates?.slice(0, 3)?.map(dup => (
                  <div key={dup.email} className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <Mail size={12} />
                    <span className="font-mono font-bold">{dup.email}</span>
                    <span>— scanned by: {dup.contacts?.map(c => c.scanner_name).join(', ') || 'Team'}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowDupAlert(false)} className="text-amber-500 hover:text-amber-700 shrink-0"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20 flex-wrap gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl min-w-[280px] shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <input type="text" placeholder="Search across all team contacts..." className="bg-transparent border-none focus:ring-0 p-0 text-sm flex-1 outline-none text-gray-900 dark:text-white placeholder:text-gray-400" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-gray-500"><Users size={14} /> {repsScanningCount} Reps Scanning</span>
            <span className="flex items-center gap-1 text-emerald-500"><Building2 size={14} /> {totalProcessed.toLocaleString()} Processed</span>
            {duplicates.length > 0 && <span className="flex items-center gap-1 text-amber-500"><AlertTriangle size={14} /> {duplicates.length} Duplicates</span>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#161c28] text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-6 py-4">Contact Profile</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Scanned By</th>
                <th className="px-6 py-4">Outreach Status</th>
                <th className="px-6 py-4">Scan Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>)}
                  </tr>
                ))
              ) : (filteredContacts || []).map(contact => {
                const isDup = isDuplicateEmail(contact.email);
                return (
                  <tr key={contact.id} className={`hover:bg-gray-50/50 dark:hover:bg-[#161c28]/50 transition-colors group cursor-pointer ${isDup ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`} onClick={() => navigate('/workspace/contacts')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isDup && <AlertTriangle size={14} className="text-amber-500 shrink-0" title="Duplicate — scanned by multiple team members" />}
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black">
                          {(contact.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">{contact.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{contact.job_title || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-800/50">
                        {contact.company || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-700 dark:text-gray-300">
                          {contact.scanner_name ? contact.scanner_name.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{contact.scanner_name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isDup ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={12} /> Duplicate — multiple reps
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Check size={12} /> No conflicts
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{new Date(contact.scan_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="View Contact" onClick={e => { e.stopPropagation(); navigate('/contacts'); }}>
                        <Lock size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Cursors */}
      {Object.values(cursors || {}).map(c => (
        <div key={c.id} className="pointer-events-none fixed z-[100] transition-all duration-75 ease-out" style={{ left: c.x, top: c.y }}>
          <MousePointer2 size={16} fill={c.color} color={c.color} className="drop-shadow-md" style={{ transform: 'rotate(-25deg) translate(-2px, -2px)' }} />
          <div className="ml-3 mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md whitespace-nowrap" style={{ backgroundColor: c.color }}>{c.user}</div>
        </div>
      ))}

      {/* Team Chat */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
        {chatOpen && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-80 shadow-2xl mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><MessageSquare size={14} /> Team Chat</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-black/20 flex flex-col">
              {(!messages || messages?.length === 0) ? <p className="text-center text-xs text-gray-500 mt-10">No messages yet. Jump in!</p> : messages?.map(m => (
                <div key={m.id} className={`flex flex-col ${m.user === userName ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{m.user === userName ? 'You' : m.user}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm ${m.user === userName ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMsg} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
              <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 py-2 border border-transparent" />
              <button type="submit" className="w-9 h-9 flex items-center justify-center bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"><Send size={14} /></button>
            </form>
          </div>
        )}
        <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative">
          {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
          {!chatOpen && messages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />}
        </button>
      </div>
    </div>
  );
}
