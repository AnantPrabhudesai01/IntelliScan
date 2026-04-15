import { useState, useRef, useEffect } from 'react';
import { useContacts } from '../context/ContactContext';
import { Upload, Camera, RefreshCw, Lightbulb, Sparkles, Save, Edit3, X, ZoomIn, FileText, Layers, CheckCircle2, Users, Zap } from 'lucide-react';
import { getStoredToken } from '../utils/auth';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';

export default function ScanPage() {
  const { addContact } = useContacts();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(() => {
    try {
      const saved = localStorage.getItem('intelliscan_cached_scan');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [selectedImage, setSelectedImage] = useState(() => {
    return localStorage.getItem('intelliscan_cached_image') || null;
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [scanMode, setScanMode] = useState('single'); // 'single' | 'multi' | 'batch'
  const [multiResults, setMultiResults] = useState(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);
  const [savedMap, setSavedMap] = useState({}); // { idx: 'saved' | 'saving' | 'duplicate' | 'error' }
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, done: 0, processing: false });
  const [batchResults, setBatchResults] = useState([]);
  const [batchSavedMap, setBatchSavedMap] = useState({}); // { idx: 'saved' | 'saving' | 'error' }
  const fileInputRef = useRef(null);
  const [switchToGroupBanner, setSwitchToGroupBanner] = useState(false);
  const [quotaData, setQuotaData] = useState(null);
  const [batchLimit, setBatchLimit] = useState(10);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [mutualInfo, setMutualInfo] = useState({ count: 0, company: '' });
  const [locationData, setLocationData] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const res = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json');
            const data = await res.json();
            setLocationData({
              latitude: lat,
              longitude: lon,
              location_name: data.address?.city || data.address?.town || data.address?.country || 'Unknown Location'
            });
          } catch(e) {
            setLocationData({ latitude: lat, longitude: lon, location_name: 'Locating...' });
          }
        },
        (err) => console.log('Geolocation error', err)
      );
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return undefined;

    const fetchQuota = async () => {
      try {
        const res = await fetch('/api/user/quota', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setQuotaData(data);
      } catch (err) {
        console.error('Quota fetch failed:', err);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Events fetch failed:', err);
      }
    };

    const fetchAccess = async () => {
      try {
        const res = await fetch('/api/access/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const limit = Number(data?.limits?.batch_upload_limit || 10);
        setBatchLimit(Number.isFinite(limit) && limit > 0 ? limit : 10);
      } catch (err) {
        console.error('Access fetch failed:', err);
      }
    };

    fetchQuota();
    fetchEvents();
    fetchAccess();
    
    // Auto-restore scroll position or any other mount-time logic
    window.scrollTo(0, 0);

    const onQuotaUpdate = () => fetchQuota();
    window.addEventListener('quota-update', onQuotaUpdate);

    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowLightbox(false);
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('quota-update', onQuotaUpdate);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);


  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
  // Persist scan state to localStorage
  useEffect(() => {
    if (scannedData) {
      localStorage.setItem('intelliscan_cached_scan', JSON.stringify(scannedData));
    } else {
      localStorage.removeItem('intelliscan_cached_scan');
    }
    
    if (selectedImage) {
      localStorage.setItem('intelliscan_cached_image', selectedImage);
    } else {
      localStorage.removeItem('intelliscan_cached_image');
    }
  }, [scannedData, selectedImage]);
      processBatchImages(files);
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      if (scanMode === 'single') {
        processSingleImage(reader.result, file.type);
      } else {
        processMultiImage(reader.result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const processBatchImages = async (files) => {
    const effectiveLimit = Math.min(Math.max(Number(batchLimit) || 10, 1), 200);
    const capped = files.slice(0, effectiveLimit);
    setErrorMsg('');
    if (files.length > capped.length) {
      setErrorMsg(`Batch upload limit: only the first ${effectiveLimit} images will be processed on your current plan.`);
    }
    setBatchResults([]);
    setBatchSavedMap({});
    setBatchProgress({ total: capped.length, done: 0, processing: true });
    // Keep any limit warning above; clear scan errors otherwise.
    const token = getStoredToken();
    const pending = capped.map((file, idx) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ imageBase64: reader.result, mimeType: file.type })
          });
          const data = await res.json();
          setBatchProgress(prev => ({ ...prev, done: prev.done + 1 }));
          if (res.ok && data.name) resolve({ idx, status: 'ok', data, filename: file.name });
          else resolve({ idx, status: 'error', error: data.error || 'No data extracted', filename: file.name });
        } catch (err) {
          setBatchProgress(prev => ({ ...prev, done: prev.done + 1 }));
          resolve({ idx, status: 'error', error: err.message, filename: file.name });
        }
      };
      reader.readAsDataURL(file);
    }));
    const results = await Promise.all(pending);
    setBatchResults(results);
    setBatchProgress(prev => ({ ...prev, processing: false }));
  };

  const saveBatchCard = async (result, idx) => {
    setBatchSavedMap(prev => ({ ...prev, [idx]: 'saving' }));
    try {
      await addContact({ ...result.data, image_url: null, scan_date: new Date().toISOString(), engine_used: 'Gemini Batch', ...(locationData || {}) });
      setBatchSavedMap(prev => ({ ...prev, [idx]: 'saved' }));
      window.dispatchEvent(new Event('quota-update'));
    } catch (err) {
      setBatchSavedMap(prev => ({ ...prev, [idx]: err?.response?.status === 409 ? 'duplicate' : 'error' }));
    }
  };

  const saveAllBatch = async () => {
    const list = scanMode === 'batch' ? batchResults : (multiResults?.cards || []).map((c, i) => ({ data: c, idx: i, status: 'ok' }));
    const filtered = list.filter(r => r.status === 'ok' && (scanMode === 'batch' ? batchSavedMap[r.idx] : savedMap[r.idx]) !== 'saved');
    if (filtered.length === 0) return;
    for (const item of filtered) {
      await saveBatchCard(item, item.idx);
    }
  };

  const processSingleImage = async (base64, mimeType) => {
    setIsScanning(true);
    setErrorMsg('');
    setScannedData(null);
    setMultiResults(null);
    setIsDuplicate(false);
    setSwitchToGroupBanner(false);
    setMutualInfo({ count: 0, company: '' });

    try {
      const token = getStoredToken();
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error (${response.status}). Please check if the backend is running.`);
      }

      const extracted = await response.json();

      if (!response.ok) {
        // Special case: Multi-card detected in single-card mode
        if (response.status === 422 && extracted.is_multi_card) {
          setSwitchToGroupBanner(true);
          return;
        }
        throw new Error(extracted.error || 'The Extraction Engine encountered a technical issue. Please try a clearer photo.');
      }
      
      if (!extracted.name && !extracted.company && !extracted.email) {
        setErrorMsg("Validation Error: Our AI engine could not confidently detect any contact data in this image.");
        return;
      }

      setScannedData(extracted);
      setIsScanning(false); 

      // Duplicate check (runs in background)
      try {
        const contactsRes = await fetch('/api/contacts', { headers: { Authorization: `Bearer ${token}` } });
        if (contactsRes.ok) {
          const existing = await contactsRes.json();
          const nameLower = (extracted.name || '').toLowerCase().trim();
          const emailLower = (extracted.email || '').toLowerCase().trim();
          const isDup = (existing || []).some(c => (nameLower && c.name?.toLowerCase().trim() === nameLower) || (emailLower && c.email?.toLowerCase().trim() === emailLower));
          if (isDup) setIsDuplicate(true);
        }
      } catch (e) { console.error(e); }

      // Check for Mutual Connections (Workspace Intelligence)
      if (extracted.company) {
        try {
          const mutualRes = await fetch(`/api/contacts/mutual?company=${encodeURIComponent(extracted.company)}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (mutualRes.ok) {
            const mData = await mutualRes.json();
            setMutualInfo({ count: mData.mutualCount, company: extracted.company });
          }
        } catch (e) { console.error('Mutual check error:', e); }
      }

    } catch (err) {
      setErrorMsg(err.message || 'Connection lost: The IntelliScan backend is not responding.');
      setIsScanning(false);
    } finally {
      // Logic handled in try/catch to improve UI responsiveness 
    }
  };

  const processMultiImage = async (base64, mimeType) => {
    setIsScanning(true);
    setErrorMsg('');
    setScannedData(null);
    setMultiResults(null);
    setSavedMap({});

    try {
      const token = getStoredToken();
      const response = await fetch('/api/scan-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response. This usually means the API server is down or misconfigured (Status: ${response.status})`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process group image.');
      }

      setMultiResults(data);
      // Group Photo scans consume quota on scan, not on save.
      window.dispatchEvent(new Event('quota-update'));
    } catch (err) {
      console.error('Fetch Error:', err);
      setErrorMsg(err.message || 'Failed to process group image.');
    } finally {
      setIsScanning(false);
    }
  };

  const saveMultiCard = async (card, idx) => {
    setSavedMap(prev => ({ ...prev, [idx]: 'saving' }));
    try {
      await addContact({
        ...card,
        job_title: card.title || '',
        event_id: selectedEventId || null,
        scan_date: new Date().toISOString(),
        image_url: selectedImage,
        engine_used: multiResults?.engine_used || 'Gemini 2.5 Multi',
        ...(locationData || {})
      });
      setSavedMap(prev => ({ ...prev, [idx]: 'saved' }));
      window.dispatchEvent(new Event('quota-update'));
    } catch (err) {
      setSavedMap(prev => ({ ...prev, [idx]: err.response?.status === 409 ? 'duplicate' : 'error' }));
    }
  };

  const saveAllMulti = async () => {
    if (!multiResults?.cards) return;
    for (let i = 0; i < multiResults.cards.length; i++) {
      const card = multiResults.cards[i];
      if (!card.is_duplicate && !savedMap[i]) {
        await saveMultiCard(card, i);
      }
    }
  };

  const checkAiHealth = async () => {
    setIsCheckingHealth(true);
    setHealthData(null);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/ai-health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to reach health endpoint');
      const data = await res.json();
      setHealthData(data);
      setShowHealthModal(true);
    } catch (err) {
      toast.error('Diagnostic Error: ' + err.message, {
        style: { borderRadius: '10px', background: '#21132E', color: '#fff', fontSize: '13px', border: '1px solid #3D2650' }
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      try {
        await addContact({
          image_url: selectedImage,
          event_id: selectedEventId || null,
          ...(locationData || {}),
          ...scannedData
        });
        setScannedData(null);
        setSelectedImage(null);
        localStorage.removeItem('intelliscan_cached_scan');
        localStorage.removeItem('intelliscan_cached_image');
        window.dispatchEvent(new Event('quota-update'));
        toast.success('Contact saved successfully!', {
          style: { borderRadius: '10px', background: '#21132E', color: '#fff', fontSize: '13px', border: '1px solid #3D2650' }
        });
      } catch (err) {
        const status = err?.response?.status;
        const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
        if (status === 409) {
          setShowDuplicateModal(true);
        } else if (status === 403) {
          setErrorMsg(apiMsg || 'Credit points exhausted. Please upgrade to continue saving scans.');
        } else {
          setErrorMsg(apiMsg || err?.message || 'Failed to save contact. Please try again.');
        }
      }
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-headline tracking-tight">Intelligent Capture</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm">
            Extract data from a single card or scan a group photo of multiple cards laid out together.
          </p>
        </div>

        {/* Options Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {events.length > 0 && (
            <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-xl self-start shadow-sm border border-gray-200 dark:border-gray-700">
              <select 
                value={selectedEventId} 
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-gray-300 pr-2 cursor-pointer"
              >
                <option value="">No Event Assigned</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => { setScanMode('single'); setMultiResults(null); setScannedData(null); setSelectedImage(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'single' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FileText size={14} /> Single Card
            </button>
            {(() => {
              const used = quotaData?.group_scans_used || 0;
              const limit = quotaData?.group_limits?.group || 1;
              const isLocked = quotaData?.tier === 'personal' && used >= limit;
              return (
                <button 
                  onClick={() => { 
                    if (isLocked) return;
                    setScanMode('multi'); setScannedData(null); setMultiResults(null); setSelectedImage(null); 
                  }}
                  disabled={isLocked}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'multi' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isLocked ? 'Free Plan: Group Photo limit reached (1/1)' : 'Extract multiple cards from a single photograph'}
                >
                  <Layers size={14} /> Group Photo {isLocked && '🔒'}
                </button>
              );
            })()}
            <button
              onClick={() => { setScanMode('batch'); setScannedData(null); setMultiResults(null); setSelectedImage(null); setBatchResults([]); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'batch' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Upload up to 20 card images at once for parallel AI processing"
            >
              <Zap size={14} /> Batch Upload
            </button>
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 font-bold text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Batch Mode Dropzone */}
      {scanMode === 'batch' && (
        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap size={28} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="font-extrabold text-gray-900 dark:text-white text-lg">Batch Upload Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select up to <strong>20 card images</strong> at once for parallel AI processing</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-3 font-semibold">Click to select images or drag & drop</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Progress Bar */}
          {batchProgress.processing && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Processing {batchProgress.total} cards in parallel...</p>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{batchProgress.done}/{batchProgress.total}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${batchProgress.total > 0 ? (batchProgress.done / batchProgress.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {/* Group Photo Results */}
          {multiResults && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in group/multi">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight text-sm">
                    <Sparkles size={16} className="text-indigo-500" />
                    Intelligent Group Capture
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{multiResults.cards.length} distinct cards extracted from one image</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => { setMultiResults(null); setSavedMap({}); setSelectedImage(null); }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                   >
                      Discard All
                   </button>
                   <button onClick={saveAllBatch} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                      <Save size={14} /> Save All
                   </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[350px] overflow-y-auto custom-scrollbar">
                {multiResults.cards.map((card, idx) => {
                  const status = savedMap[idx];
                  const result = { data: card, idx, status: 'ok' };
                  return (
                    <div 
                      key={idx} 
                      onMouseEnter={() => setHoveredCardIdx(idx)}
                      onMouseLeave={() => setHoveredCardIdx(null)}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${hoveredCardIdx === idx ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black transition-all ${hoveredCardIdx === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{card.name || '—'}</p>
                        <p className="text-xs text-gray-500 truncate">{card.company || ''} {card.title ? `· ${card.title}` : ''}</p>
                      </div>
                      <div className="shrink-0">
                        {status === 'saved' ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>
                        ) : status === 'duplicate' ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Duplicate</span>
                        ) : (
                          <button onClick={() => saveBatchCard(result, idx)} disabled={status === 'saving'}
                            className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-60 flex items-center gap-1">
                            {status === 'saving' ? <><RefreshCw size={10} className="animate-spin" /> Saving</> : <><Save size={10} /> Save</>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Batch Mode Results */}
          {batchResults.length > 0 && !batchProgress.processing && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white">Batch Results</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{batchResults.filter(r => r.status === 'ok').length} of {batchResults.length} cards extracted successfully</p>
                </div>
                <button onClick={saveAllBatch} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                  <Save size={14} /> Save All
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {batchResults.map((result) => {
                  const status = batchSavedMap[result.idx];
                  return (
                    <div key={result.idx} className={`flex items-center gap-4 px-5 py-4 ${result.status === 'error' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{result.idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        {result.status === 'ok' ? (
                          <>
                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{result.data.name || '—'}</p>
                            <p className="text-xs text-gray-500 truncate">{result.data.company || ''} {result.data.job_title ? `· ${result.data.job_title}` : ''}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-red-600 dark:text-red-400 text-sm truncate">{result.filename}</p>
                            <p className="text-xs text-red-400">{result.error}</p>
                          </>
                        )}
                      </div>
                      <div className="shrink-0">
                        {result.status === 'error' ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Failed</span>
                        ) : status === 'saved' ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>
                        ) : status === 'duplicate' ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Duplicate</span>
                        ) : (
                          <button onClick={() => saveBatchCard(result, result.idx)} disabled={status === 'saving'}
                            className="text-xs font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-1">
                            {status === 'saving' ? <><RefreshCw size={10} className="animate-spin" /> Saving</> : <><Save size={10} /> Save</>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-card detected in single mode — actionable guidance banner */}
      {switchToGroupBanner && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3 flex-1">
            <Layers size={22} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Multiple Cards Detected!</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">This image contains more than one business card. Please upload <strong>one card at a time</strong> in Single Card mode, or switch to <strong>Group Photo</strong> mode to extract all cards at once.</p>
            </div>
          </div>
          <button
            onClick={() => { setScanMode('multi'); setSwitchToGroupBanner(false); setScannedData(null); setMultiResults(null); setSelectedImage(null); }}
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <Layers size={14} /> Switch to Group Photo
          </button>
        </div>
      )}

      {isDuplicate && !errorMsg && (
        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-4 rounded-xl border border-amber-200 dark:border-amber-700 font-bold text-sm flex items-start gap-2">
          ⚠️ <span><strong>Duplicate Detected:</strong> This contact (same name or email) already exists in your contacts list. You can still save it if you want a separate entry.</span>
        </div>
      )}

      {mutualInfo.count > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700 font-bold text-sm flex items-start gap-2">
          <Users size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Shared Intelligence:</strong> {mutualInfo.count} teammate contact{mutualInfo.count !== 1 ? 's' : ''} found at {mutualInfo.company}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileUpload} 
            />
            
            <div 
              onClick={() => !isScanning && fileInputRef.current.click()}
              className={`relative bg-white dark:bg-gray-900 p-8 rounded-2xl border ${isScanning ? 'border-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'border-gray-200/80 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50/50 dark:hover:bg-gray-800'} flex flex-col items-center justify-center min-h-[300px] text-center transition-all cursor-pointer shadow-[var(--shadow-vibrant)] group-hover:shadow-xl`}
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500">
                {isScanning ? (
                  <RefreshCw className="text-indigo-600 dark:text-indigo-400 text-3xl animate-spin" size={32} />
                ) : scanMode === 'single' ? (
                  <Upload className="text-indigo-600 dark:text-indigo-400 text-3xl" size={32} />
                ) : (
                  <Layers className="text-indigo-600 dark:text-indigo-400 text-3xl" size={32} />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-headline">
                {isScanning ? 'Gemini AI is scanning...' : scanMode === 'single' ? 'Drop Single Card' : 'Drop Group Photo'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs px-4">
                {scanMode === 'single' ? 'Extract details from one card.' : 'Snap a photo of 5-25 cards laid flat.'}
              </p>
              {selectedImage && !isScanning && (
                <button 
                  onClick={(e) => { e.stopPropagation(); processSingleImage(selectedImage, 'image/jpeg'); }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30"
                >
                  Re-scan Image
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-[var(--shadow-vibrant)]">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
              <Lightbulb size={16} /> Pro Tip
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Ensure you have set exactly <code>GEMINI_API_KEY</code> in the server <code>.env</code> file. Our integration parses skewed images and complex fonts effortlessly via student tier access.
            </p>
            <button 
              onClick={checkAiHealth}
              disabled={isCheckingHealth}
              className="mt-4 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
            >
              {isCheckingHealth ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
              {isCheckingHealth ? 'Running Diagnostics...' : 'Check System & AI Health'}
            </button>
          </div>
        </div>

        {/* Right: Extracted Data / Multi Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ────── MULTI RESULTS VIEW ────── */}
          {scanMode === 'multi' && multiResults && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                       <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Group Detection Results</h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{multiResults.cards.length} contacts identified</p>
                    </div>
                  </div>
                  <button onClick={saveAllMulti} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">
                    <Zap size={14} /> Save All New
                  </button>
               </div>

               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                         <th className="px-6 py-4">Contact Details</th>
                         <th className="px-6 py-4 hidden md:table-cell">Job & Company</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                       {multiResults.cards.map((card, idx) => {
                         const status = savedMap[idx];
                         const isDup = card.is_duplicate;
                         return (
                           <tr key={idx} className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-800/30 ${isDup ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                   {card.name ? card.name.charAt(0).toUpperCase() : '?'}
                                 </div>
                                 <div>
                                   <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                     {card.name || 'Unknown'}
                                     {card.detected_language && (
                                       <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/40">
                                         {card.detected_language}
                                       </span>
                                     )}
                                     {isDup && <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">DUP</span>}
                                   </div>
                                   {card.name_native && card.name_native !== card.name && (
                                     <div className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-tight">
                                       {card.name_native}
                                     </div>
                                   )}
                                   <div className="text-xs text-gray-500 dark:text-gray-400">{card.email || card.phone || 'No contact info'}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600 dark:text-gray-300">
                               <div className="font-medium">{card.title || 'No Title'}</div>
                               {card.title_native && card.title_native !== card.title && (
                                 <div className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-tight">
                                   {card.title_native}
                                 </div>
                               )}
                               <div className="text-xs text-gray-500">{card.company || 'No Company'}</div>
                               {card.company_native && card.company_native !== card.company && (
                                 <div className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-tight">
                                   {card.company_native}
                                 </div>
                               )}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                 <CheckCircle2 size={12} /> {card.confidence}% Match
                               </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right">
                               {!isDup && status !== 'saved' && (
                                 <button 
                                   onClick={() => saveMultiCard(card, idx)} 
                                   disabled={status === 'saving'}
                                   className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                 >
                                   {status === 'saving' ? 'Saving...' : 'Save Card'}
                                 </button>
                               )}
                               {status === 'saved' && (
                                 <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                                   <CheckCircle2 size={14} /> Saved
                                 </span>
                               )}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}

          {/* ────── SINGLE EXTRACTION VIEW ────── */}
          {scanMode === 'single' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-6 md:p-8 rounded-2xl shadow-[var(--shadow-vibrant)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-8 relative">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-headline">Extraction Preview</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Live OCR Processing</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${
                    scannedData?.engine_used?.includes('Gemini') || scannedData?.engine_used?.includes('ChatGPT')
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/40'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/40'
                  }`}>
                    <Sparkles size={12} className={scannedData?.engine_used?.includes('Gemini') ? 'animate-pulse' : ''} />
                    {scannedData?.engine_used?.includes('Gemini') || scannedData?.engine_used?.includes('ChatGPT') ? '✦ AI Enabled' : '✦ Local Smart Mode'}
                  </div>
                </div>
              </div>

              <div className={`space-y-6 transition-opacity duration-500 ${scannedData ? 'opacity-100' : 'opacity-30 pointer-events-none filter blur-sm'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  
                  {/* Field Generator */}
                  {[
                    { key: 'name', label: 'Full Name' },
                    { key: 'company', label: 'Company' },
                    { key: 'title', label: 'Job Title' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'website', label: 'Website' },
                    { key: 'linkedin_url', label: 'LinkedIn Profile' },
                    { key: 'deal_score', label: 'Deal Intelligence' },
                  ].map(field => (
                    <div key={field.key} className="relative group">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-black uppercase tracking-tighter text-gray-500 dark:text-gray-400">{field.label}</label>
                        {field.key === 'deal_score' ? (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${scannedData?.deal_score > 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {scannedData?.deal_score || 0}% PROSPECT
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                             {scannedData?.confidence || 0}% match
                          </span>
                        )}
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 group-focus-within:border-indigo-400 transition-colors">
                        <input 
                          className="bg-transparent border-none p-0 w-full text-gray-900 dark:text-white font-semibold focus:ring-0 text-sm outline-none" 
                          type="text" 
                          value={scannedData?.[field.key] || ''} 
                          onChange={(e) => setScannedData({...scannedData, [field.key]: e.target.value})}
                          placeholder={`Enter ${field.label}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full-width Address */}
                <div className="relative group">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-gray-500 dark:text-gray-400">Physical Address</label>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 group-focus-within:border-indigo-400 transition-colors">
                    <textarea 
                      className="bg-transparent border-none p-0 w-full text-gray-900 dark:text-white font-semibold focus:ring-0 text-sm resize-none outline-none" 
                      rows={2} 
                      value={scannedData?.address || ''} 
                      onChange={(e) => setScannedData({...scannedData, address: e.target.value})}
                    />
                  </div>
                </div>

                {/* AI Summary / Bio */}
                {scannedData?.bio && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                     <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 block flex items-center gap-2">
                        <Sparkles size={12} /> AI Relationship Insight
                     </label>
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 italic font-medium leading-relaxed">
                        "{scannedData.bio}"
                     </p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-6 flex flex-wrap gap-4 items-center justify-between border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all group"
                    >
                      <Save size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
                      Save Contact & Deduct Credit
                    </button>
                  </div>
                  <button 
                    onClick={() => { 
                      setScannedData(null); 
                      setSelectedImage(null); 
                      localStorage.removeItem('intelliscan_cached_scan');
                      localStorage.removeItem('intelliscan_cached_image');
                    }}
                    className="text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-red-500 text-xs font-bold transition-colors"
                  >
                    <X size={14} /> Clear Result
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Scanned Image Preview */}
          {(selectedImage || scannedData) && (
            <div 
              onClick={() => setShowLightbox(true)}
              className="bg-white dark:bg-gray-900 rounded-2xl p-2 relative group overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in aspect-video cursor-zoom-in"
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-950">
                <img 
                  className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.02] ${scannedData || multiResults ? 'grayscale-0 opacity-100' : 'grayscale-[0.5] opacity-60'}`} 
                  src={selectedImage} 
                  alt="Scan preview" 
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 dark:bg-gray-900/90 p-3 rounded-2xl shadow-2xl backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ZoomIn className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                </div>
                
                {/* Visual Mapper Overlays */}
                {multiResults && multiResults.cards && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                    {multiResults.cards.map((card, idx) => {
                      if (!card.box_2d || !Array.isArray(card.box_2d)) return null;
                      const [ymin, xmin, ymax, xmax] = card.box_2d;
                      const isHovered = hoveredCardIdx === idx;
                      const isSaved = savedMap[idx] === 'saved';
                      
                      return (
                        <g key={idx}>
                          <rect
                            x={xmin}
                            y={ymin}
                            width={xmax - xmin}
                            height={ymax - ymin}
                            fill={isHovered ? 'rgba(79, 70, 229, 0.15)' : 'transparent'}
                            stroke={isHovered ? '#4f46e5' : isSaved ? '#10b981' : 'rgba(79, 70, 229, 0.3)'}
                            strokeWidth={isHovered ? '4' : '2'}
                            strokeDasharray={isSaved ? '' : '10,5'}
                            className="transition-all duration-200"
                          />
                          {isHovered && (
                             <text
                               x={xmin}
                               y={ymin - 10}
                               fill="#4f46e5"
                               className="text-[24px] font-black"
                             >
                               {card.name || `#${idx+1}`}
                             </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 flex justify-between items-center z-10">
                <span className="bg-gray-900/80 backdrop-blur px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-1 shadow-lg">
                  <FileText size={10} /> Visual Mapper Mode
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDuplicateModal}
        type="warning"
        title="Duplicate Contact Detected"
        message="This contact (or their email) already exists in your Shared Rolodex. To prevent data fragmentation, we've blocked this save automatically. You can check your existing contacts to find this record."
        confirmText="Understood"
        onConfirm={() => setShowDuplicateModal(false)}
        onCancel={() => setShowDuplicateModal(false)}
      />

      {/* AI Health Modal */}
      {showHealthModal && healthData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161c28] w-full max-w-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl relative">
            <button onClick={() => setShowHealthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold font-headline dark:text-white flex items-center gap-2">
                <Zap className="text-indigo-500" /> AI System Diagnostics
              </h3>
              <p className="text-xs text-gray-500 mt-1">Real-time connectivity results for your configured engines.</p>
            </div>

            <div className="space-y-4">
              {['gemini', 'openai'].map(engine => {
                const status = healthData[engine];
                const isHealthy = status?.status === 'healthy';
                return (
                  <div key={engine} className={`p-4 rounded-xl border ${isHealthy ? 'bg-emerald-50/30 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50/30 border-red-200 dark:border-red-800/50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black uppercase text-[11px] tracking-widest text-gray-500">{engine === 'gemini' ? 'Google Gemini AI' : 'OpenAI ChatGPT'}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isHealthy ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {status?.status || 'Unknown'}
                      </span>
                    </div>
                    {isHealthy ? (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Ready for high-fidelity extraction (Model: {status.modelUsed})
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold">{status?.error || 'Unknown Error'}</p>
                        
                        {/* FIX GUIDELINES */}
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/30">
                          <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">How to Fix:</p>
                          {status?.code === 429 ? (
                            <a href="https://platform.openai.com/account/billing" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                              <Layers size={10} /> Add Credits to OpenAI Dashboard →
                            </a>
                          ) : status?.code === 404 ? (
                            <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                              <Layers size={10} /> Enable Generative AI API in Google Console →
                            </a>
                          ) : (
                            <p className="text-[10px] text-gray-500 italic">Verify your .env file has the correct GEMINI_API_KEY/OPENAI_API_KEY with no extra spaces.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="p-4 rounded-xl border bg-indigo-50/30 border-indigo-200 dark:border-indigo-800/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black uppercase text-[11px] tracking-widest text-indigo-500">IntelliScan Local Engine</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-600">STABLE</span>
                </div>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Ready as high-accuracy fallback (Tesseract + Heuristics)
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowHealthModal(false)}
              className="mt-8 w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-xl hover:opacity-90 transition-opacity"
            >
              CLOSE DIAGNOSTICS
            </button>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showLightbox && selectedImage && (
        <div 
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setShowLightbox(false)}
        >
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md"></div>
          
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6">
            <button 
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <X size={20} /> Close Preview
            </button>
            
            <div 
              className="relative w-full h-full flex items-center justify-center bg-transparent rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Large scan preview" 
                className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in-95 duration-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
