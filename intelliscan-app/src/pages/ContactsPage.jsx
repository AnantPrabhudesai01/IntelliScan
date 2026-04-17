import { useState, useEffect } from 'react';
import { useContacts } from '../context/ContactContext';
import { Search, Filter, Cpu, Download, Mail, Phone, ChevronRight, AlertTriangle, UserPlus, Globe, LayoutGrid, List, Clock, Trash2, ChevronDown, RefreshCw, CheckCircle2, Calendar, Sparkles, Send, X, Wand2, Zap, ArrowRight, RotateCcw, Share2, Languages, Plus, MapPin } from 'lucide-react';
import apiClient from '../api/client';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth.js';
import VCardQRModal from '../components/VCardQRModal';

// Draggable Imports
import {
  DndContext, 
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).format(new Date(dateStr));
};

// Sortable Wrapper Component
const SortableItem = ({ id, children, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
      {/* Deduplication Hub Modal */}
      {showDedupeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#161c28] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-black text-gray-900 dark:text-white uppercase tracking-tight">Deduplication Hub</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Intelligent Rolodex Cleanup</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDedupeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {duplicateGroups.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Workspace is Clean</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">We couldn't find any duplicate contacts in your workspace. Your rolodex is optimized!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed uppercase tracking-wide">
                      We discovered <strong>{duplicateGroups.length}</strong> groups of potentially duplicate contacts based on email, phone, and name matching. Merging will consolidate all notes and tags into the primary record.
                    </p>
                  </div>

                  {duplicateGroups.map((group, idx) => (
                    <div key={group.fingerprint} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                           Match Group #{idx + 1} • {group.reason}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded">
                           {group.confidence}% Match
                        </span>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black italic">
                              {group.primary_contact.name?.[0] || 'U'}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full border-2 border-white dark:border-[#161c28]">
                               <Zap size={10} strokeWidth={3} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{group.primary_contact.name}</h4>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{group.primary_contact.company || 'Unknown Company'}</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Primary Record</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Duplicate instances FOUND ({group.duplicates.length})</p>
                          {group.duplicates.map(dupe => (
                            <div key={dupe.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 opacity-60">
                              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {dupe.name?.[0] || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{dupe.email || dupe.phone || 'No identifier'}</p>
                                <p className="text-[10px] text-gray-400">Captured {new Date(dupe.scan_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => handleMergeGroup(group)}
                          disabled={isMerging}
                          className="w-full mt-2 py-3 bg-white dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/5"
                        >
                          {isMerging ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} className="group-hover:rotate-12 transition-transform" />}
                          Resolve Duplicate Group
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex justify-end">
               <button 
                onClick={() => setShowDedupeModal(false)}
                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl shadow-black/10"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ContactsPage() {
  const { 
    contacts, deleteContact, deleteContacts, getDeletedContacts, 
    restoreContacts, emptyTrash, permanentlyDeleteContacts, 
    enrichContact, semanticSearch, reorderContacts, 
    isSyncing: backendSyncing, lastSyncTime 
  } = useContacts();
  const navigate = useNavigate();
  
  // DRAG & DROP SETUP
  const [localContacts, setLocalContacts] = useState([]);

  useEffect(() => {
    // Sync local state with context contacts
    // We allow empty array sync (e.g. after clear bin)
    if (contacts) {
      setLocalContacts(contacts);
    }
  }, [contacts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'trash'
  const [trashContacts, setTrashContacts] = useState([]);
  const [isTrashLoading, setIsTrashLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null); // contactId

  // Contact Detail Modal (click a contact to view full details)
  const [detailContact, setDetailContact] = useState(null);
  const [detailEnriching, setDetailEnriching] = useState(false);
  const [qrContact, setQrContact] = useState(null);
  const [isEnglishMode, setIsEnglishMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Deduplication Hub State
  const [showDedupeModal, setShowDedupeModal] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [isScanningDuplicates, setIsScanningDuplicates] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [dedupeMessage, setDedupeMessage] = useState('');

  const openContactDetail = (contact) => {
    if (!contact) return;
    setDetailContact(contact);
    setEditForm({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      job_title: contact.job_title || contact.title || '',
      notes: contact.notes || '',
      tags: contact.tags || '',
      inferred_industry: contact.inferred_industry || '',
      inferred_seniority: contact.inferred_seniority || ''
    });
  };

  const closeContactDetail = () => {
    setDetailEnriching(false);
    setDetailContact(null);
    setIsEditing(false);
  };

  const handleManualSave = async () => {
    if (!detailContact?.id) return;
    setIsSaving(true);
    try {
      const { updateContact: contextUpdate } = useContacts; // Note: using from destructuring at top of component
      // Actually use it from the outer scope hook: 
      // const { updateContact } = useContacts();  (already there)
      await updateContact(detailContact.id, editForm);
      setDetailContact({ ...detailContact, ...editForm });
      setIsEditing(false);
      showComposerToast('✅ Contact updated successfully!');
    } catch (err) {
      showComposerToast('Failed to save changes: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getStoredToken();
        const res = await apiClient.get('/contacts/stats', {
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
      const res = await fetch('/api/email-sequences/sequences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSequences(data || []);
    } catch (err) {
      console.error('Failed to fetch sequences:', err);
    }
  };

  const scanForDuplicates = async () => {
    setIsScanningDuplicates(true);
    setDedupeMessage('Scanning contact rolodex for exact and fuzzy matches...');
    try {
      const res = await apiClient.get('/workspace/contacts/duplicates');
      setDuplicateGroups(res.data.duplicates || []);
      setShowDedupeModal(true);
      if (res.data.duplicates?.length === 0) {
        showComposerToast('✨ Great news! No duplicates found in your workspace.');
      }
    } catch (err) {
      showComposerToast('Deduplication scan failed: ' + err.message, 'error');
    } finally {
      setIsScanningDuplicates(false);
    }
  };

  const handleMergeGroup = async (group) => {
    setIsMerging(true);
    try {
      await apiClient.post('/contacts/merge', {
        primaryId: group.primary_contact_id,
        duplicateIds: group.duplicates.map(d => d.id)
      });
      // Remove handled group
      setDuplicateGroups(prev => prev.filter(g => g.fingerprint !== group.fingerprint));
      showComposerToast('✅ Contacts successfully merged!');
      // Contact context will refresh via socket.io, but we can call it manually to be sure
      // (The context refresh is usually handled by polling or socket events)
    } catch (err) {
      showComposerToast('Merge failed: ' + err.message, 'error');
    } finally {
      setIsMerging(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrash();
    }
    setSelectedIds([]);
  }, [activeTab]);

  const fetchTrash = async () => {
    setIsTrashLoading(true);
    try {
      const data = await getDeletedContacts();
      setTrashContacts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTrashLoading(false);
    }
  };

  const handleRestore = async (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    if (idsArray.length === 1) setIsRestoring(idsArray[0]);
    try {
      await restoreContacts(idsArray);
      if (activeTab === 'trash') {
        setTrashContacts(prev => prev.filter(c => !idsArray.includes(c.id)));
      }
      setSelectedIds([]);
      showComposerToast(`✅ ${idsArray.length} contacts restored!`);
    } catch (err) {
      showComposerToast('Restore failed', 'error');
    } finally {
      setIsRestoring(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Empty entire Recycle Bin? This is permanent.")) return;
    try {
      await emptyTrash();
      setTrashContacts([]);
      setSelectedIds([]);
      showComposerToast('✨ Recycle Bin Emptied Successfully!');
    } catch (err) {
      showComposerToast('Failed to empty trash', 'error');
    }
  };


  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (search || filterConfidence || filterEngine || isSmartSearch) {
       showComposerToast('Reordering is only available without active filters.', 'info');
       return;
    }

    const oldIndex = localContacts.findIndex(c => c.id === active.id);
    const newIndex = localContacts.findIndex(c => c.id === over.id);

    const newArray = arrayMove(localContacts, oldIndex, newIndex);
    setLocalContacts(newArray);

    const orders = newArray.map((c, i) => ({ id: c.id, sort_order: i }));
    reorderContacts(orders);
  };

  const dataToFilter = activeTab === 'active' ? localContacts : trashContacts;

  const filteredContacts = smartResults || dataToFilter.filter(c => {
    const matchesEvent = filterEventId ? String(c.event_id) === filterEventId : true;
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesConf = filterConfidence ? c.confidence >= 90 : true;
    const matchesEng = filterEngine ? (c.engine_used || 'Gemini 1.5') === filterEngine : true;
    return matchesEvent && matchesSearch && matchesConf && matchesEng;
  });

  const handleExportCSV = async () => {
    if (contacts.length === 0) return;
    
    // Check tier limits for export
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tier = user?.tier || 'personal';
    
    if (tier === 'personal' && filteredContacts.length > 10) {
      alert("Free strictly limits exporting to 10 contacts. Please upgrade to the Enterprise Plan for unlimited exports.");
    }

    try {
      showComposerToast('Preparing your Magic Export...', 'loading');
      const token = getStoredToken();
      const res = await fetch('/api/contacts/export/magic', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IntelliScan_Magic_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      showComposerToast('🚀 Magic Excel Export Downloaded!');
    } catch (err) {
      showComposerToast('Export failed: ' + err.message, 'error');
    }
  };


  const handleWhatsAppAction = (contact) => {
    if (!contact.phone) return alert("No phone number found for this contact.");
    const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
    const message = encodeURIComponent(`Hi ${contact.name}, it was great meeting you at ${contact.location_context || 'the event'}! Let's stay in touch.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleExportVCard = () => {
    if (contacts.length === 0) return;
    
    // Check tier limits for export
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tier = user?.tier || 'personal';
    
    let contactsToExport = selectedIds.length > 0 
      ? filteredContacts.filter(c => selectedIds.includes(c.id))
      : filteredContacts;

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
      if (!res.ok) {
        showComposerToast(data?.error || `Send failed (HTTP ${res.status})`, 'error');
        return;
      }
      if (data.sent) {
        showComposerToast(`✅ Email sent to ${composerContact.email}!`);
        setTimeout(closeComposer, 2000);
      } else {
        showComposerToast(data?.message || 'Draft sent.', 'success');
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

  const [isSendingFollowup, setIsSendingFollowup] = useState(null); // contactId
  const handleTruecallerSearch = (phone) => {
    if (!phone) return;
    // Clean phone and ensure it has + if it looks like international
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    window.open(`https://www.truecaller.com/search/in/${cleanPhone}`, '_blank');
  };

  const handleManualFollowup = async (contact) => {
    if (!contact.email) return showComposerToast('No email found for this contact.', 'error');
    setIsSendingFollowup(contact.id);
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/contacts/${contact.id}/send-followup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showComposerToast('✦ ' + (isEnglishMode ? 'Follow-up sent!' : 'स्वागत संदेश भेजा गया!'));
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      showComposerToast('Failed: ' + err.message, 'error');
    } finally {
      setIsSendingFollowup(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      if (activeTab === 'active') {
        await deleteContacts(selectedIds);
        showComposerToast(`✅ ${selectedIds.length} leads moved to Recycle Bin.`);
      } else {
        await permanentlyDeleteContacts(selectedIds);
        setTrashContacts(prev => prev.filter(c => !selectedIds.includes(c.id)));
        showComposerToast(`💥 ${selectedIds.length} contacts erased forever!`);
      }
      setSelectedIds([]);
      setShowBulkConfirm(false);
    } catch (err) {
      console.error(err);
      showComposerToast('Operation failed', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };


  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* Vibrant Stats Dashboard */}
      {filteredContacts.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <UserPlus size={48} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px] mb-2">{activeTab === 'active' ? 'Active Leads' : 'In Recycle Bin'}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-headline font-black text-gray-900 dark:text-white">{filteredContacts.length}</p>
              <span className="text-xs font-bold text-emerald-500">+12% this week</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-50"></div>
          </div>

          <div className="relative group overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={48} className="text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px] mb-2">Avg Confidence</p>
            <p className="text-4xl font-headline font-black text-gray-900 dark:text-white">
              {filteredContacts.length > 0 
                ? Math.round(filteredContacts.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / filteredContacts.length)
                : 0}%
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-50"></div>
          </div>

          <div className="relative group overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={48} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px] mb-2">Sync Engine</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full animate-ping ${activeTab === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
              <span className="text-xl font-headline font-black text-gray-900 dark:text-white capitalize">
                {activeTab === 'active' ? 'Real-time' : 'Archived'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-50"></div>
          </div>
        </section>
      )}

      {/* Real-time Sync Status Indicator */}
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Your Contacts</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-full">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
            </div>
         </div>
         <p className="text-sm text-gray-500 font-medium">Last updated: {formatDate(lastSyncTime)}</p>
      </div>

      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2">

        <div className="flex-1 max-w-2xl flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[300px] relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input
              className={`w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-white/5 backdrop-blur-md border rounded-2xl focus:ring-4 focus:ring-indigo-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all font-body text-sm outline-none shadow-sm ${isSmartSearch ? 'border-indigo-400 ring-4 ring-indigo-500/20 shadow-indigo-500/10' : 'border-gray-200 dark:border-white/10'}`}
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

          <button 
            onClick={() => setIsEnglishMode(!isEnglishMode)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs transition-all border ${
              isEnglishMode 
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/40' 
                : 'bg-white dark:bg-[#161c28] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-amber-300'
            }`}
            title="Translate native scripts to English"
          >
            <Languages size={14} />
            {isEnglishMode ? 'English Mode' : 'Original Text'}
          </button>

          {/* Real-time Sync Indicator */}
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
              backendSyncing 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${backendSyncing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(var(--sync-color))]`} />
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} className={backendSyncing ? 'animate-bounce' : ''} />
              Live Sync
            </span>
          </div>
        </div>

        {/* Segmented Control Tab Switcher */}
        <div className="relative p-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-2xl flex border border-white/10">
          <button 
            onClick={() => setActiveTab('active')}
            className={`relative z-10 px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'active' ? 'text-indigo-600 bg-white dark:bg-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus size={14} /> Active Leads
          </button>
          <button 
            onClick={() => setActiveTab('trash')}
            className={`relative z-10 px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'trash' ? 'text-red-500 bg-white dark:bg-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Trash2 size={14} /> Recycle Bin
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
            {activeTab === 'trash' && filteredContacts.length > 0 && (
              <button 
                onClick={handleEmptyTrash} 
                className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg active:scale-95"
              >
                <Trash2 size={14} /> Clear Bin
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredContacts.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Vibrant "WOW" Empty State / Scan CTA */}
              {activeTab === 'active' && !search && !filterConfidence && !filterEngine && (
                <div 
                  onClick={() => navigate('/dashboard/scan')} 
                  className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 animate-fade-in aspect-square flex flex-col items-center justify-center"
                >
                  {/* ... (Existing Scan CTA Code) ... */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-[100px] group-hover:translate-x-12 group-hover:translate-y-12 transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex flex-col items-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                      <Plus size={40} className="text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-xl font-headline font-black text-gray-900 dark:text-white mb-2 tracking-tight">Scan New Contact</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] text-center leading-relaxed">
                      Transform a business card into a <span className="text-indigo-500 font-bold">Smart Lead</span> in seconds.
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      Get Started <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              )}
              
              {filteredContacts.map((contact) => (
                <SortableItem key={contact.id} id={contact.id} disabled={activeTab !== 'active' || search || filterConfidence || filterEngine || isSmartSearch}>
                  <div
                    onClick={() => openContactDetail(contact)}
                    className={`p-6 rounded-2xl border backdrop-blur-md transition-all cursor-pointer group relative overflow-hidden shadow-xl hover:shadow-2xl h-full ${
                      activeTab === 'trash' 
                        ? 'bg-gray-100/50 dark:bg-white/5 border-gray-200 dark:border-gray-800 opacity-80' 
                        : 'bg-white/70 dark:bg-white/5 border-white/20 dark:border-white/10 hover:border-indigo-500/50 hover:-translate-y-1'
                    } ${selectedIds.includes(contact.id) ? 'ring-2 ring-indigo-600 border-indigo-600' : ''}`}
                  >
              {activeTab === 'trash' && (
                <div className="absolute top-0 right-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-b-lg uppercase tracking-widest z-10 shadow-lg">
                  Deleted
                </div>
              )}
              {/* Checkbox overlay for grid view */}
              <div 
                className={`absolute top-4 left-4 z-20 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedIds.includes(contact.id) ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg' : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 hover:border-indigo-400'}`}
                onClick={(e) => { e.stopPropagation(); toggleSelect(contact.id); }}
              >
                {selectedIds.includes(contact.id) && <RefreshCw size={12} className="text-white fill-current" />}
              </div>
              <div className="flex justify-between items-start mb-4">
                <ContactAvatar contact={contact} />
                <div className="flex flex-col items-end gap-1">
                  <ConfidenceBadge value={contact.confidence} />
                  <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">{contact.engine_used || 'Gemini 1.5'}</span>
                </div>
              </div>

              <div className="space-y-0.5 mb-2">
                <h3 className="font-headline text-base font-bold text-gray-900 dark:text-white truncate">
                  {isEnglishMode ? (contact.name || contact.name_native || 'Unknown') : (contact.name_native || contact.name || 'Unknown')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {isEnglishMode ? (contact.job_title || contact.title || contact.title_native || 'No Title') : (contact.title_native || contact.job_title || contact.title || 'No Title')}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate">
                  {isEnglishMode ? (contact.company || contact.company_native || 'Unknown Company') : (contact.company_native || contact.company || 'Unknown Company')}
                </p>
              </div>

              {/* AI Insights Badges */}
              {(contact.inferred_industry || contact.inferred_seniority) && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {contact.inferred_industry && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                      {contact.inferred_industry}
                    </span>
                  )}
                  {contact.inferred_seniority && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/40 shadow-sm">
                      {contact.inferred_seniority}
                    </span>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 mb-4">
                <Clock size={11} />
                <span>Scanned {formatDate(contact.scan_date)}</span>
              </div>

              {activeTab === 'active' ? (
                <>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex -space-x-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleWhatsAppAction(contact); }} 
                        title="Quick WhatsApp Message"
                        className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-emerald-600 dark:text-emerald-400"
                      >
                        <Phone size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTruecallerSearch(contact.phone); }} 
                        title="Search on Truecaller"
                        className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-blue-600 dark:text-blue-400"
                      >
                        <span className="text-[8px] font-black">TC</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setQrContact(contact); }} 
                        title="Identity vCard / QR"
                        className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-indigo-600 dark:text-indigo-400"
                      >
                        <Share2 size={12} />
                      </button>
                      {contact.email && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleManualFollowup(contact); }} 
                          disabled={isSendingFollowup === contact.id}
                          title="Instant Follow-up Email"
                          className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-blue-600 dark:text-blue-400 disabled:opacity-50"
                        >
                          {isSendingFollowup === contact.id ? <RefreshCw size={10} className="animate-spin" /> : <Mail size={12} />}
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/dashboard/calendar'); }} 
                        title="Schedule Meeting"
                        className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-gray-500 dark:text-gray-400"
                      >
                        <Calendar size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openComposer(contact); }} 
                        title="✦ AI Follow-Up Composer"
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-white dark:border-[#161c28] flex items-center justify-center shadow-sm hover:z-20 hover:scale-110 transition-all text-amber-600 dark:text-amber-400"
                      >
                        <Sparkles size={12} />
                      </button>
                    </div>
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
                </>
              ) : (
              <div className="flex items-center justify-between pt-3 border-t border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRestore(contact.id); }}
                    disabled={isRestoring === contact.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                  >
                    <RotateCcw size={12} className={isRestoring === contact.id ? 'animate-spin' : ''} />
                    Restore
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedIds([contact.id]); setShowBulkConfirm(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
                  >
                    <Trash2 size={12} />
                    Delete Forever
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-600 font-semibold">
                  {contact.deleted_at ? `Deleted ${formatDate(contact.deleted_at)}` : 'In Recycle Bin'}
                </span>
              </div>
              )}
            </div>
            </SortableItem>
          ))}

          {filteredContacts.length === 0 && search && (
            <div className="col-span-1 md:col-span-3 py-12 text-center bg-gray-50 dark:bg-[#161c28]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Search className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={40} />
              <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">No contacts found</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Try adjusting your search terms.</p>
            </div>
          )}

          {filteredContacts.length === 0 && !search && activeTab === 'trash' && !isTrashLoading && (
            <div className="col-span-1 md:col-span-3 py-16 text-center bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-[#161c28]/50 dark:to-emerald-900/10 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/40">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg mb-1">All Clean!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">Your Recycle Bin is empty. Deleted contacts will appear here for recovery.</p>
            </div>
          )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#161c28] border border-gray-200/80 dark:border-gray-800 rounded-2xl overflow-hidden shadow-[var(--shadow-vibrant)]">
          {/* Header row */}
          <div className="grid grid-cols-[40px_2fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <div className="flex items-center justify-center">
               <input type="checkbox" checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            </div>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredContacts.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredContacts.map((contact, idx) => (
                  <SortableItem key={contact.id} id={contact.id} disabled={activeTab !== 'active' || search || filterConfidence || filterEngine || isSmartSearch}>
                    <div
                      onClick={() => openContactDetail(contact)}
                      className={`grid grid-cols-[40px_2fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-4 items-center group transition-colors cursor-pointer ${selectedIds.includes(contact.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'} ${idx !== filteredContacts.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/60' : ''}`}
                    >
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(contact.id)} 
                    onChange={(e) => { e.stopPropagation(); toggleSelect(contact.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <ContactAvatar contact={contact} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {isEnglishMode ? (contact.name || contact.name_native || 'Unknown') : (contact.name_native || contact.name || 'Unknown')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.email || '—'}</p>
                  </div>
                </div>

                {/* Company & Role + Badges */}
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {isEnglishMode ? (contact.company || contact.company_native || '—') : (contact.company_native || contact.company || '—')}
                  </p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                      {isEnglishMode ? (contact.job_title || contact.title || contact.title_native || 'No Title') : (contact.title_native || contact.job_title || contact.title || 'No Title')}
                    </span>
                    {contact.inferred_industry && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-900/40">
                        {contact.inferred_industry}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                  <Clock size={12} className="flex-shrink-0" />
                  <span className="truncate">
                    {activeTab === 'trash' ? `Deleted ${formatDate(contact.deleted_at)}` : `Added ${formatDate(contact.scan_date)}`}
                  </span>
                </div>

                {/* Confidence */}
                <div><ConfidenceBadge value={contact.confidence} /></div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {activeTab === 'active' ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleWhatsAppAction(contact); }} title="WhatsApp Message" className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"><Phone size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleTruecallerSearch(contact.phone); }} title="Search Truecaller" className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                        <span className="text-[10px] font-black">TC</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setQrContact(contact); }} title="Share QR/vCard" className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"><Share2 size={14} /></button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleManualFollowup(contact); }} 
                        disabled={isSendingFollowup === contact.id}
                        title="Instant Follow-up Email" 
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50"
                      >
                         {isSendingFollowup === contact.id ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openComposer(contact); }} title="AI Email Composer" className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"><Sparkles size={14} /></button>
                      <div className="relative group/seq">
                        <button 
                          onClick={(e) => { e.stopPropagation(); }} 
                          title="Enroll in AI Sequence" 
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                        >
                          <Zap size={14} />
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-2 hidden group-hover/seq:block z-[70] animate-in slide-in-from-bottom-2 duration-200">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-1 mb-1 border-b border-gray-100 dark:border-gray-800">Select Sequence</p>
                          <div className="max-h-40 overflow-y-auto">
                            {sequences.map(s => (
                              <button 
                                key={s.id}
                                onClick={(e) => { e.stopPropagation(); handleEnrollSequence(contact.id, s.id); }}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 transition-colors flex items-center gap-2"
                              >
                                <Zap size={10} /> {s.name}
                              </button>
                            ))}
                            {sequences.length === 0 && <p className="text-[10px] text-gray-500 p-2 italic">No sequences found</p>}
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRestore(contact.id); }} 
                        title="Restore" 
                        disabled={isRestoring === contact.id}
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm active:scale-95"
                      >
                        <RotateCcw size={14} className={isRestoring === contact.id ? 'animate-spin' : ''} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedIds([contact.id]); setShowBulkConfirm(true); }} 
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Permanent Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

       {/* Mass Action Bar (floating) */}
       {selectedIds.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="flex items-center gap-3 pr-6 border-r border-white/20">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                 {selectedIds.length}
               </div>
               <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap">Selected</span>
            </div>
            
            <div className="flex items-center gap-4">
               <button onClick={toggleSelectAll} className="text-xs font-black uppercase tracking-widest hover:underline">
                 {selectedIds.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
               </button>
               <div className="w-px h-6 bg-white/20" />
               {activeTab === 'active' ? (
                 <button 
                  onClick={() => setShowBulkConfirm(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 transition-all shadow-lg active:scale-95"
                 >
                   <Trash2 size={14} /> Delete 
                 </button>
               ) : (
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleRestore(selectedIds)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button 
                      onClick={() => setShowBulkConfirm(true)}
                      className="bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      <Trash2 size={14} /> Empty Bin
                    </button>
                 </div>
               )}
            </div>
         </div>
       )}



      {/* ══════════════════════════════════════════════════════════════
           CONTACT DETAIL MODAL (click a contact)
         ══════════════════════════════════════════════════════════════ */}
      {detailContact && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeContactDetail} />
          <div className="relative bg-white dark:bg-gray-950 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] border border-gray-200 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-500/20">
                  {(editForm.name || detailContact.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  {isEditing ? (
                    <input 
                      className="text-xl font-black text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-indigo-400 rounded-lg px-2 py-0.5 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">
                      {isEnglishMode ? (detailContact.name || 'Unknown Contact') : (detailContact.name_native || detailContact.name || 'Unknown Contact')}
                    </h2>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-2">
                    {isEditing ? 'Editing Contact Details' : 
                      (isEnglishMode ? (detailContact.job_title || detailContact.title || 'No title') : (detailContact.title_native || detailContact.job_title || detailContact.title || 'No title'))
                    }
                    {!isEditing && detailContact.company && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" /> 
                        {isEnglishMode ? detailContact.company : (detailContact.company_native || detailContact.company)}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ConfidenceBadge value={detailContact.confidence} />
                <button
                  onClick={closeContactDetail}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Primary Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Job Title', key: 'job_title', icon: List },
                  { label: 'Company Name', key: 'company', icon: Globe },
                  { label: 'Email Address', key: 'email', icon: Mail },
                  { label: 'Phone Number', key: 'phone', icon: Phone },
                  { label: 'Source Location', key: 'location_context', icon: MapPin },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <field.icon size={12} /> {field.label}
                    </label>
                    {isEditing ? (
                      <input 
                        className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        value={editForm[field.key]}
                        onChange={e => setEditForm({...editForm, [field.key]: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-900 dark:text-white py-1">{detailContact[field.key] || '—'}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* AI & Intelligence Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                  <div>
                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                       <Cpu size={14} /> AI Context Engine
                    </h4>
                    <p className="text-xs text-indigo-600/60 dark:text-indigo-400/60 font-medium">Automatic enrichment from public profile data.</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={async () => {
                        if (!detailContact?.id) return;
                        setDetailEnriching(true);
                        try {
                          const result = await enrichContact(detailContact.id);
                          const enrichedData = result?.data || {};
                          setDetailContact(prev => ({
                            ...prev,
                            linkedin_bio: enrichedData.bio || prev?.linkedin_bio || '',
                            ai_enrichment_news: enrichedData.latest_news || prev?.ai_enrichment_news || '',
                            inferred_industry: enrichedData.industry || prev?.inferred_industry || '',
                            inferred_seniority: enrichedData.seniority || prev?.inferred_seniority || ''
                          }));
                        } catch (err) {
                          showComposerToast('Enrichment failed', 'error');
                        } finally {
                          setDetailEnriching(false);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 flex items-center gap-2 active:scale-95"
                      disabled={detailEnriching}
                    >
                      {detailEnriching ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {detailEnriching ? 'Synthesizing...' : 'Enrich Lead'}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">Inferred Industry</p>
                      {isEditing ? (
                        <input className="w-full bg-white/50 dark:bg-white/5 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-xs font-bold" value={editForm.inferred_industry} onChange={e => setEditForm({...editForm, inferred_industry: e.target.value})} />
                      ) : (
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{detailContact.inferred_industry || 'Pending Enrichment'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">Seniority Tier</p>
                      {isEditing ? (
                        <input className="w-full bg-white/50 dark:bg-white/5 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-xs font-bold" value={editForm.inferred_seniority} onChange={e => setEditForm({...editForm, inferred_seniority: e.target.value})} />
                      ) : (
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{detailContact.inferred_seniority || 'Pending Enrichment'}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 mb-1.5 flex items-center gap-1.5">
                      <Wand2 size={12} /> Personality Analysis & Bio
                    </p>
                    <p className={`text-sm leading-relaxed ${detailContact.linkedin_bio ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                      {detailContact.linkedin_bio || 'No enrichment data available. Run "Enrich Lead" to identify professional background and personality traits.'}
                    </p>
                  </div>
                </div>

                {/* Sequence Activity Section */}
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                     <Clock size={16} className="text-indigo-500" /> Active Automations
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Enroll in Outreach Sequence</p>
                      <p className="text-[10px] text-gray-500 font-medium">Auto-send follow-ups via Gemini AI.</p>
                    </div>
                    <div className="flex gap-2">
                       <select 
                         className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                         onChange={(e) => handleEnrollSequence(detailContact.id, e.target.value)}
                         defaultValue=""
                       >
                         <option value="" disabled>Select Sequence...</option>
                         {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-2 px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Sparkles size={12} /> Conversation Notes & Tags
                </label>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[120px] resize-none"
                    value={editForm.notes}
                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Enter specific meeting context, follow-up goals, or tags..."
                  />
                ) : (
                  <div className={`p-5 rounded-2xl border ${detailContact.notes ? 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800' : 'bg-gray-50/50 dark:bg-white/5 border-dashed border-gray-200 dark:border-gray-800 italic text-gray-400'} text-sm leading-relaxed whitespace-pre-wrap`}>
                    {detailContact.notes || 'No manual notes added yet. Use "Edit" to add context from your meeting.'}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleManualSave}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-black hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                   <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-black hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2 active:scale-95"
                  >
                    Edit Contact
                  </button>
                )}
              </div>
              
              {!isEditing && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { closeContactDetail(); openComposer(detailContact); }}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 active:scale-95"
                  >
                    <Sparkles size={16} /> AI Follow-Up
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteContact(detailContact.id); closeContactDetail(); }}
                    className="px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Move to Recycle Bin"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
      {/* ── BULK CONFIRMATION MODAL ── */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {activeTab === 'active' ? 'Move to Recycle Bin?' : 'Permanent Delete?'}
              </h3>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-semibold leading-relaxed">
              {activeTab === 'active' 
                ? `You are about to move ${selectedIds.length} contact(s) to the Recycle Bin. You can restore them later if needed.` 
                : `Warning: You are about to PERMANENTLY delete ${selectedIds.length} contact(s). This action cannot be undone.`}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                disabled={isBulkDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isBulkDeleting ? 'Deleting...' : activeTab === 'active' ? 'Confirm Trash' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── SHARED QR MODAL ── */}
      {qrContact && (
        <VCardQRModal 
          contact={qrContact} 
          onClose={() => setQrContact(null)} 
        />
      )}

      {/* ── CRM SYNC NOTIFICATION ── */}
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
    </div>

  );
}
