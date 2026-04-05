import { useState, useEffect } from 'react';
import { useContacts } from '../context/ContactContext';
import { Search, Filter, Cpu, Download, Mail, Phone, ChevronRight, AlertTriangle, UserPlus, Globe, LayoutGrid, List, Clock, Trash2, ChevronDown, RefreshCw, CheckCircle2, Calendar, Sparkles, Send, X, Wand2, Zap, ArrowRight } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth.js';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).format(new Date(dateStr));
};

export default function ContactsPage() {
  const { contacts, deleteContact, enrichContact, semanticSearch } = useContacts();
  const navigate = useNavigate();
  const location = new URLSearchParams(window.location.search);
  const filterEventId = location.get('eventId');
  
  const [search, setSearch] = useState('');
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [enrichingId, setEnrichingId] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [isEnrolling, setIsEnrolling] = useState(null); // contactId

  const [filterConfidence, setFilterConfidence] = useState(false);
  const [filterEngine, setFilterEngine] = useState('');
  const [stats, setStats] = useState({ totalScanned: 0, avgConfidence: 0 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // CRM Export State
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // AI Composer Modal State
  const [composerContact, setComposerContact] = useState(null);
  const [composerTone, setComposerTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null); // { id, subject, body }
  const [composerToast, setComposerToast] = useState(null);
  const [isSendingDraft, setIsSendingDraft] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getStoredToken();
        const res = await axios.get('/api/contacts/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch contact stats:', err);
      }
    };
    fetchStats();
    fetchSequences();
  }, [contacts]);

  const fetchSequences = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/email-sequences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSequences(data || []);
    } catch (err) {
      console.error('Failed to fetch sequences:', err);
    }
  };

  useEffect(() => {
    if (isSmartSearch && search.length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await semanticSearch(search);
          setSmartResults(results);
        } catch (err) {
          console.error('Smart search error', err);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSmartResults(null);
    }
  }, [search, isSmartSearch]);

  const filteredContacts = smartResults || contacts.filter(c => {
    const matchesEvent = filterEventId ? String(c.event_id) === filterEventId : true;
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesConf = filterConfidence ? c.confidence >= 90 : true;
    const matchesEng = filterEngine ? (c.engine_used || 'Gemini 1.5') === filterEngine : true;
    return matchesEvent && matchesSearch && matchesConf && matchesEng;
  });

  const handleExportCSV = () => {
    if (contacts.length === 0) return;
    
    // Check tier limits for export
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tier = user?.tier || 'personal';
    
    let contactsToExport = filteredContacts;
    if (tier === 'personal' && contactsToExport.length > 10) {
      alert("Free strictly limits exporting to 10 contacts. Please upgrade to the Enterprise Plan for unlimited exports.");
      contactsToExport = contactsToExport.slice(0, 10);
    }

    const exportData = contactsToExport.map(c => ({
      FullName: c.name,
      Company: c.company,
      JobTitle: c.job_title || c.title,
      Email: c.email,
      Phone: c.phone,
      Confidence: `${c.confidence}%`,
      DateScanned: formatDate(c.scan_date)
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "IntelliScan_Contacts.xlsx");
  };

  const handleExportVCard = () => {
    if (contacts.length === 0) return;
    
    // Check tier limits for export
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tier = user?.tier || 'personal';
    
    let contactsToExport = filteredContacts;
    if (tier === 'personal' && contactsToExport.length > 10) {
      alert("Free strictly limits exporting to 10 contacts. Please upgrade to the Enterprise Plan for unlimited exports.");
      contactsToExport = contactsToExport.slice(0, 10);
    }

    let vcardData = '';
    contactsToExport.forEach(c => {
      vcardData += `BEGIN:VCARD\nVERSION:3.0\n`;
      vcardData += `FN:${c.name || 'Unknown'}\n`;
      if (c.company) vcardData += `ORG:${c.company}\n`;
      if (c.job_title || c.title) vcardData += `TITLE:${c.job_title || c.title}\n`;
      if (c.phone) vcardData += `TEL;TYPE=WORK,VOICE:${c.phone}\n`;
      if (c.email) vcardData += `EMAIL;TYPE=WORK,INTERNET:${c.email}\n`;
      vcardData += `END:VCARD\n`;
    });

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'IntelliScan_Contacts.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCRM = async (provider) => {
    if (contacts.length === 0) {
      setSyncMessage('No contacts to export.');
      setTimeout(() => setSyncMessage(''), 3000);
      setExportDropdownOpen(false);
      return;
    }

    setIsSyncing(true);
    setExportDropdownOpen(false);

    try {
      const token = getStoredToken();
      const res = await fetch(`/api/crm/export/${provider}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_ids: filteredContacts.map(c => c.id) })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${provider}-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);

      const providerLabel = provider === 'zoho' ? 'Zoho CRM' : provider.charAt(0).toUpperCase() + provider.slice(1);
      setSyncMessage(`✅ ${filteredContacts.length} contacts exported to ${providerLabel}! Import the CSV in your CRM to add them.`);
      setTimeout(() => setSyncMessage(''), 6000);
    } catch (err) {
      console.error('CRM export failed:', err);
      setSyncMessage(`❌ Export failed: ${err.message}`);
      setTimeout(() => setSyncMessage(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // ── AI COMPOSER FUNCTIONS ──
  const openComposer = (contact) => {
    setComposerContact(contact);
    setGeneratedDraft(null);
    setComposerTone('professional');
    setComposerToast(null);
    setIsSendingDraft(false);
  };

  const closeComposer = () => {
    setComposerContact(null);
    setGeneratedDraft(null);
    setComposerToast(null);
  };

  const showComposerToast = (msg, type = 'success') => {
    setComposerToast({ msg, type });
    setTimeout(() => setComposerToast(null), 4000);
  };

  const generateDraft = async () => {
    if (!composerContact) return;
    setIsGenerating(true);
    setGeneratedDraft(null);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contact_id: composerContact.id,
          contact_name: composerContact.name,
          contact_email: composerContact.email,
          company: composerContact.company,
          job_title: composerContact.job_title || composerContact.title,
          tone: composerTone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedDraft({ id: data.id, subject: data.subject, body: data.body });
    } catch (err) {
      showComposerToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendDraft = async () => {
    if (!generatedDraft?.id) return;
    setIsSendingDraft(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/drafts/${generatedDraft.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sent) {
        showComposerToast(`✅ Email sent to ${composerContact.email}!`);
        setTimeout(closeComposer, 2000);
      } else {
        showComposerToast(data.message || 'Draft saved (SMTP not configured)', 'warning');
      }
    } catch (err) {
      showComposerToast('Send failed: ' + err.message, 'error');
    } finally {
      setIsSendingDraft(false);
    }
  };

  const handleEnrollSequence = async (contactId, sequenceId) => {
    setIsEnrolling(contactId);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/contacts/${contactId}/enroll-sequence`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ sequenceId })
      });
      if (res.ok) {
        showComposerToast('✦ Lead enrolled in AI Sequence!');
      } else {
        throw new Error('Enrollment failed');
      }
    } catch (err) {
      showComposerToast('Enrollment failed: ' + err.message, 'error');
    } finally {
      setIsEnrolling(null);
    }
  };

  const handleEnrich = async (contactId) => {
    if (!contactId) return;
    setEnrichingId(contactId);
    try {
      await enrichContact(contactId);
    } catch (err) {
      console.error('Enrichment failed:', err);
    } finally {
      setEnrichingId(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedDraft?.id) return;
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/drafts/${generatedDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: generatedDraft.subject, body: generatedDraft.body })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to save draft');
      showComposerToast('Draft saved.', 'success');
    } catch (err) {
      showComposerToast(`Save failed: ${err.message}`, 'error');
    }
  };


  const ContactAvatar = ({ contact }) => {
    if (contact.image_url) {
      return (
        <div 
          className="w-10 h-10 rounded-xl bg-cover bg-center flex-shrink-0 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-150 transition-transform origin-top-left z-10"
          style={{ backgroundImage: `url(${contact.image_url})` }}
          onClick={(e) => {
            e.stopPropagation();
            const win = window.open();
            win.document.write(`<img src="${contact.image_url}" style="max-width:100%; max-height:100vh; object-fit:contain; display:block; margin:auto;" />`);
          }}
          title="Click to view original card image"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg uppercase flex-shrink-0 shadow-sm">
        {contact.name ? contact.name.charAt(0) : '?'}
      </div>
    );
  };

  const ConfidenceBadge = ({ value }) => (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
      value < 60
        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40'
    }`}>
      {value}% Match
    </span>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* CRM Sync Notification Overlay */}
      {(isSyncing || syncMessage) && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900 shadow-xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px]">
            {isSyncing ? (
              <>
                <RefreshCw size={24} className="text-indigo-600 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Authorizing CRM Link...</p>
                  <p className="text-xs text-gray-500">Injecting {filteredContacts.length} contacts.</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Sync Complete</p>
                  <p className="text-xs text-gray-500">{syncMessage}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-lg flex items-center gap-2">
          <div className="flex-1 relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input
              className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-[#161c28] border rounded-xl focus:ring-2 focus:ring-indigo-500/40 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all font-body text-sm outline-none shadow-sm ${isSmartSearch ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-800'}`}
              placeholder={isSmartSearch ? "Describe who you're looking for..." : "Search by name, email, or company..."}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <RefreshCw size={14} className="text-indigo-500 animate-spin" />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsSmartSearch(!isSmartSearch)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs transition-all border ${
              isSmartSearch 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/40 translate-y-[-1px]' 
                : 'bg-white dark:bg-[#161c28] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
            }`}
          >
            <Sparkles size={14} /> Smart Search
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm">
            <button onClick={() => setFilterConfidence(!filterConfidence)} className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${filterConfidence ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Filter size={14} /> &gt;90%
            </button>
            <button onClick={() => setFilterEngine(filterEngine ? '' : 'Gemini 2.5')} className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${filterEngine ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Cpu size={14} /> Gemini
            </button>
          </div>

          {/* Grid / List Toggle */}
          <div className="flex items-center bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm">
            <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} title="List View" className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <List size={16} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportVCard}
              className="bg-white dark:bg-[#161c28] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm"
              title="Export as universal vCard format"
            >
              <Download size={16} /> vCard
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-l-xl font-semibold text-sm flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-md focus:ring-4 focus:ring-indigo-500/30 border-r border-indigo-500"
            >
              <Download size={16} /> CSV
            </button>
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="bg-indigo-600 text-white px-2 py-2.5 rounded-r-xl font-semibold text-sm flex items-center hover:bg-indigo-700 active:scale-95 transition-all shadow-md focus:ring-4 focus:ring-indigo-500/30 h-full"
                title="Direct CRM Integrations"
              >
                <ChevronDown size={16} />
              </button>
              {exportDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                    <Globe size={13} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Enterprise Sync</span>
                  </div>
                  <button onClick={() => handleExportCRM('salesforce')} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    Salesforce
                  </button>
                  <button onClick={() => handleExportCRM('zoho')} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    Zoho CRM
                  </button>
                  <button onClick={() => handleExportCRM('odoo')} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    Odoo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Always show Scan New Contact at the top */}
          {!search && !filterConfidence && !filterEngine && (
            <div onClick={() => navigate('/dashboard/scan')} className="bg-gray-50 dark:bg-[#161c28]/50 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer shadow-sm hover:bg-white dark:hover:bg-[#161c28]">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm border border-gray-100 dark:border-gray-700">
                <UserPlus size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="font-headline font-bold text-gray-900 dark:text-white">Scan New Contact</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[150px] leading-relaxed">Upload a business card or document to auto-extract info.</p>
            </div>
          )}

          {filteredContacts.map((contact) => (
            <div key={contact.id} className={`bg-white dark:bg-[#161c28] p-5 rounded-xl border hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md ${contact.confidence < 60 ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <ContactAvatar contact={contact} />
                <div className="flex flex-col items-end gap-1">
                  <ConfidenceBadge value={contact.confidence} />
                  <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">{contact.engine_used || 'Gemini 1.5'}</span>
                </div>
              </div>

              <div className="space-y-0.5 mb-4">
                <h3 className="font-headline text-base font-bold text-gray-900 dark:text-white truncate">{contact.name || 'Unknown Reference'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.job_title || contact.title || 'No Title'}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate">{contact.company || 'Unknown Company'}</p>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 mb-4">
                <Clock size={11} />
                <span>Scanned {formatDate(contact.scan_date)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60">
                <div className="flex -space-x-1.5">
                  {contact.email && <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} title="Send Email" className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all"><Mail size={12} className="text-gray-500 dark:text-gray-400" /></a>}
                  {contact.phone && <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} title="Call Contact" className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all"><Phone size={12} className="text-gray-500 dark:text-gray-400" /></a>}
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/dashboard/calendar'); }} 
                    title="Schedule Meeting"
                    className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-indigo-600 dark:text-indigo-400"
                  >
                    <Calendar size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openComposer(contact); }} 
                    title="✦ AI Follow-Up Email"
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-amber-600 dark:text-amber-400"
                  >
                    <Sparkles size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEnrich(contact.id); }} 
                    disabled={enrichingId === contact.id}
                    title="✦ AI Data Enrichment"
                    className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-indigo-600 dark:text-indigo-400 disabled:opacity-50"
                  >
                    {enrichingId === contact.id ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                  </button>
                  {sequences.length > 0 && (
                    <div className="relative group/seq">
                      <button 
                        onClick={(e) => e.stopPropagation()} 
                        disabled={isEnrolling === contact.id}
                        title="✦ Enroll in AI Sequence"
                        className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-emerald-600 dark:text-emerald-400"
                      >
                        {isEnrolling === contact.id ? <RefreshCw size={10} className="animate-spin" /> : <Zap size={10} />}
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/seq:block bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-2 min-w-[160px] z-[50]">
                         <p className="text-[9px] font-black uppercase text-gray-500 mb-2 px-2">Select AI Sequence</p>
                         {sequences.map(seq => (
                           <button 
                            key={seq.id} 
                            onClick={(e) => { e.stopPropagation(); handleEnrollSequence(contact.id, seq.id); }}
                            className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-between"
                           >
                             {seq.name} <ArrowRight size={10} />
                           </button>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={14} /></button>
                  <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && search && (
            <div className="col-span-1 md:col-span-3 py-12 text-center bg-gray-50 dark:bg-[#161c28]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Search className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={40} />
              <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">No contacts found</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Try adjusting your search terms.</p>
            </div>
          )}

        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Contact</span>
            <span>Company / Role</span>
            <span>Scanned At</span>
            <span>Confidence</span>
            <span></span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={36} />
              <p className="text-gray-500 font-bold">No contacts match your filters.</p>
            </div>
          ) : (
            filteredContacts.map((contact, idx) => (
              <div key={contact.id} className={`grid grid-cols-[2fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-4 items-center group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer ${idx !== filteredContacts.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/60' : ''}`}>

                {/* Name & Email */}
                <div className="flex items-center gap-3 min-w-0">
                  <ContactAvatar contact={contact} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{contact.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.email || '—'}</p>
                  </div>
                </div>

                {/* Company & Role */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.company || '—'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.job_title || contact.title || 'No Title'}</p>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="flex-shrink-0" />
                  <span className="truncate">{formatDate(contact.scan_date)}</span>
                </div>

                {/* Confidence */}
                <div><ConfidenceBadge value={contact.confidence} /></div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openComposer(contact); }} title="AI Follow-Up" className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"><Sparkles size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={14} /></button>
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dashboard Stats */}
      <section className="mt-4 p-1 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl flex flex-wrap divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800/80">
        <div className="flex-1 min-w-[150px] p-6 text-center">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Scanned</p>
          <p className="text-3xl font-headline font-extrabold text-gray-900 dark:text-white">{stats.totalScanned}</p>
        </div>
        <div className="flex-1 min-w-[150px] p-6 text-center">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Avg Confidence</p>
          <p className="text-3xl font-headline font-extrabold text-gray-900 dark:text-white">{stats.avgConfidence}%</p>
        </div>
        <div className="flex-1 min-w-[150px] p-6 text-center">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Sync Status</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Live</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           AI FOLLOW-UP EMAIL COMPOSER MODAL
         ══════════════════════════════════════════════════════════════ */}
      {composerContact && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeComposer} />
          <div className="relative bg-white dark:bg-gray-950 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] border border-gray-200 dark:border-gray-800">

            {/* ── HEADER ── */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-amber-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg uppercase shadow-md">
                  {composerContact.name ? composerContact.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{composerContact.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {composerContact.job_title || composerContact.title || ''}
                    {composerContact.company ? ` · ${composerContact.company}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                  <Sparkles size={12} /> Gemini AI
                </span>
                <button onClick={closeComposer} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Tone Picker */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Email Tone</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'professional', label: '💼 Professional', desc: 'Formal & polished' },
                    { key: 'friendly', label: '😊 Friendly', desc: 'Warm & personable' },
                    { key: 'executive', label: '🏛️ Executive', desc: 'C-suite ready' },
                    { key: 'cold_outreach', label: '🎯 Cold Outreach', desc: 'Value-driven intro' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setComposerTone(t.key)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        composerTone === t.key
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              {!generatedDraft && !isGenerating && (
                <button
                  onClick={generateDraft}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
                >
                  <Wand2 size={18} /> Generate Follow-Up with Gemini ✦
                </button>
              )}

              {/* Loading Skeleton */}
              {isGenerating && (
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <RefreshCw size={18} className="text-indigo-500 animate-spin" />
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Gemini is crafting your email...</span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4" />
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-4/5" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3" />
                  </div>
                </div>
              )}

              {/* Generated Draft — Editable */}
              {generatedDraft && !isGenerating && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Recipient */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">To</label>
                    <div className="mt-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {composerContact.email || <span className="italic text-gray-400">No email on file</span>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Subject</label>
                    <input
                      type="text"
                      value={generatedDraft.subject}
                      onChange={e => setGeneratedDraft({ ...generatedDraft, subject: e.target.value })}
                      className="w-full mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow font-semibold"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Message</label>
                    <textarea
                      rows={8}
                      value={generatedDraft.body}
                      onChange={e => setGeneratedDraft({ ...generatedDraft, body: e.target.value })}
                      className="w-full mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow resize-none font-serif leading-relaxed"
                    />
                  </div>

                  {/* Regenerate */}
                  <button
                    onClick={generateDraft}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            {generatedDraft && !isGenerating && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 gap-3">
                <button onClick={closeComposer} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Mail size={14} /> Save Draft
                  </button>
                  <button
                    onClick={handleSendDraft}
                    disabled={isSendingDraft || !composerContact.email}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSendingDraft ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    {isSendingDraft ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Composer Toast */}
            {composerToast && (
              <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl animate-in slide-in-from-bottom-3 duration-300 ${
                composerToast.type === 'error' ? 'bg-red-600 text-white' :
                composerToast.type === 'warning' ? 'bg-amber-500 text-white' :
                'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              }`}>
                {composerToast.msg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
