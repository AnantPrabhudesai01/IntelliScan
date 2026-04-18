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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 shadow-inner">Grid Active</span>
            <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Live Infrastructure Sync</span>
          </div>
          <h1 className="text-5xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight">Shared <br/>Rolodex</h1>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
            Collaborative intelligence hub. Universal business card synchronization active across all sales nodes. Enterprise-grade duplicate prevention is currently engaged.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchAll} className="p-3 border border-[var(--border-subtle)] bg-[var(--surface-card)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)]/30 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          {/* CRM Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 px-8 py-3.5 bg-[var(--brand)] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all italic font-headline">
              <Download size={14} /> Export Node ▾
            </button>
            <div className="absolute right-0 top-full mt-3 w-56 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden premium-grain">
              <div className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--surface)]">Atomic Sync</div>
              {['salesforce', 'zoho', 'odoo']?.map(crm => (
                <button key={crm} onClick={() => handleExport(crm)} disabled={exportingCrm === crm}
                  className="w-full flex items-center justify-between px-5 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--brand)]/5 hover:text-[var(--brand)] transition-all disabled:opacity-50 group/item">
                  <div className="flex items-center gap-3">
                    {exportingCrm === crm ? <RefreshCw size={14} className="animate-spin" /> : <Building2 size={14} className="opacity-50 group-hover:item:opacity-100 transition-opacity" />}
                    {crm === 'zoho' ? 'Zoho CRM' : crm}
                  </div>
                  <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                </button>
              ))}
              <div className="px-5 py-3 border-t border-[var(--border-subtle)]">
                <button onClick={() => { const a = document.createElement('a'); a.href = `/api/crm/export/csv?token=${encodeURIComponent(getStoredToken() || '')}`; }} className="w-full text-left text-[9px] font-black uppercase tracking-widest text-[var(--brand)] hover:underline">+ Raw CSV Dump</button>
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
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 lg:p-8 animate-shake">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="font-headline font-black italic uppercase tracking-tight text-amber-500 text-lg">Conflict Matrix Detected</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mt-1">Found {duplicates.length} duplicate scanned nodes across workplace</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {duplicates?.slice(0, 3)?.map(dup => (
                  <div key={dup.email} className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex items-center gap-3">
                    <Mail size={12} className="text-amber-500/50" />
                    <span className="text-[10px] font-black tracking-tight text-amber-500 truncate">{dup.email}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowDupAlert(false)} className="p-2 text-amber-500/40 hover:text-amber-500 transition-colors"><X size={20} /></button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-2xl overflow-hidden premium-grain">
        <div className="p-6 md:p-8 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface)]/30 backdrop-blur-md flex-wrap gap-6 relative z-10">
          <div className="flex items-center gap-4 px-6 py-4 bg-[var(--surface)]/50 border border-[var(--border-subtle)] rounded-2xl min-w-[320px] shadow-inner focus-within:border-[var(--brand)]/30 focus-within:ring-4 focus-within:ring-[var(--brand)]/5 transition-all">
            <Filter size={18} className="text-[var(--text-muted)]" />
            <input type="text" placeholder="Scan across all nodes..." className="bg-transparent border-none focus:ring-0 p-0 text-[11px] font-black uppercase tracking-widest flex-1 outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center group cursor-default">
               <p className="text-[20px] font-headline font-black italic tracking-tighter text-[var(--text-main)] group-hover:text-[var(--brand)] transition-colors">{repsScanningCount}</p>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Active Scanners</p>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]"></div>
            <div className="text-center group cursor-default">
               <p className="text-[20px] font-headline font-black italic tracking-tighter text-emerald-500">{totalProcessed.toLocaleString()}</p>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Atomic Ingest</p>
            </div>
            {duplicates.length > 0 && (
              <>
                <div className="w-px h-8 bg-[var(--border-subtle)]"></div>
                <div className="text-center group cursor-default">
                  <p className="text-[20px] font-headline font-black italic tracking-tighter text-amber-500">{duplicates.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Conflicts</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface)]/50 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.25em] border-b border-[var(--border-subtle)]">
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Infrastructure</th>
                <th className="px-8 py-5">Origin Scanner</th>
                <th className="px-8 py-5">Conflict Status</th>
                <th className="px-8 py-5">Ingest Date</th>
                <th className="px-8 py-5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-[var(--surface)] rounded w-24" /></td>)}
                  </tr>
                ))
              ) : (filteredContacts || []).map(contact => {
                const isDup = isDuplicateEmail(contact.email);
                return (
                  <tr key={contact.id} className={`hover:bg-[var(--brand)]/[0.02] transition-colors group cursor-pointer ${isDup ? 'bg-amber-500/[0.03]' : ''}`} onClick={() => navigate('/workspace/contacts')}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black border transition-all ${isDup ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-[var(--brand)]/10 border-[var(--brand)]/20 text-[var(--brand)]'}`}>
                          {isDup ? <AlertTriangle size={16} /> : (contact.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-main)] text-[13px] tracking-tight">{contact.name}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">{contact.job_title || 'Unclassified Node'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px] font-black tracking-widest text-[var(--text-main)] uppercase">
                        {contact.company || 'Private Source'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[9px] font-black text-[var(--text-muted)]">
                          {contact.scanner_name ? contact.scanner_name.split(' ').map(n => n[0]).join('') : 'AI'}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{contact.scanner_name || 'System Logic'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {isDup ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Conflict Matrix</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Clear Logic</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic font-headline opacity-60">
                      {new Date(contact.scan_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors p-2.5 rounded-xl hover:bg-[var(--brand)]/5 group/btn" title="View Detail" onClick={e => { e.stopPropagation(); navigate('/contacts'); }}>
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
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

      {/* Team Chat Widget */}
      <div className="fixed bottom-10 left-10 z-50 flex flex-col items-start translate-y-0 hover:-translate-y-1 transition-transform">
        {chatOpen && (
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] w-80 shadow-2xl mb-6 overflow-hidden animate-fade-in premium-grain">
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] flex items-center gap-3"><MessageSquare size={14} className="text-[var(--brand)]" /> Team Comm</h3>
              <button onClick={() => setChatOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><X size={18} /></button>
            </div>
            <div className="h-80 overflow-y-auto p-6 space-y-5 flex flex-col items-stretch">
              {(!messages || messages?.length === 0) ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4">
                   <MessageSquare size={40} strokeWidth={1} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Awaiting handshakes...</p>
                </div>
              ) : messages?.map(m => (
                <div key={m.id} className={`flex flex-col gap-1.5 ${m.user === userName ? 'items-end' : 'items-start'}`}>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">{m.user === userName ? 'Origin Node' : m.user}</span>
                  <div className={`px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed max-w-[85%] shadow-sm ${m.user === userName ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface)] text-[var(--text-main)] border border-[var(--border-subtle)]'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMsg} className="p-4 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] flex gap-3">
              <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Send protocol message..." className="flex-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 text-[11px] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50" />
              <button type="submit" className="w-12 h-12 flex items-center justify-center bg-[var(--brand)] rounded-xl text-white hover:brightness-110 active:scale-90 transition-all shadow-lg shadow-[var(--brand)]/20"><Send size={16} /></button>
            </form>
          </div>
        )}
        <button onClick={() => setChatOpen(!chatOpen)} className="w-16 h-16 bg-[var(--brand)] text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:brightness-110 transition-all relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {chatOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!chatOpen && messages.length > 0 && <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--brand)] animate-pulse" />}
        </button>
      </div>
    </div>
  );
}
