import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useContacts } from './ContactContext';
import { getStoredToken } from '../utils/auth.js';

const BatchQueueContext = createContext();

export function BatchQueueProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [globalToast, setGlobalToast] = useState(null);
  const { addContact } = useContacts();
  
  const wasProcessing = useRef(false);

  useEffect(() => {
    const active = files.find(f => f.status === 'processing');
    const queued = files.find(f => f.status === 'queued');
    const allDone = files.length > 0 && files.every(f => f.status === 'completed' || f.status === 'failed');

    if (active || queued) {
      wasProcessing.current = true;
    }

    if (active) {
      const timer = setTimeout(async () => {
        const file = active;
        const nextProgress = file.progress + Math.floor(Math.random() * 25) + 15;

        if (nextProgress >= 100) {
          // ── Actually scan via Gemini API ──
          try {
            const token = getStoredToken();
            const scanRes = await fetch('/api/scan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                imageBase64: file.base64,
                mimeType: file.mimeType
              })
            });

            // Check if backend returned valid JSON
            const contentType = scanRes.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error(`Server returned non-JSON response. (Status: ${scanRes.status})`);
            }

            const data = await scanRes.json();

            if (!scanRes.ok) {
               throw new Error(data.error || 'Scan failed');
            }

            // Check if Gemini rejected (non-card image)
            if (data.rejected || (!data.name && !data.company && !data.email)) {
              setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'failed', error: 'No valid card detected.' } : f));
              return;
            }

            // Save contact to backend (includes image)
            await addContact({
              id: Math.random().toString(),
              name: data.name || 'Extracted Contact',
              company: data.company || '',
              title: data.title || '',
              email: data.email || '',
              phone: data.phone || '',
              website: data.website || '',
              address: data.address || '',
              confidence: data.confidence || 80,
              engine_used: data.engine_used || 'Gemini 1.5 Flash',
              scan_date: new Date().toISOString(),
              image_url: file.base64 // Store the card image so the ContactsPage can render it immediately
            });

            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'completed', extractedName: data.name } : f));
          } catch (err) {
            // 422 = rejected image, 409 = duplicate, or server error
            const reason = err.message || 'Scan failed';
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'failed', error: reason } : f));
          } finally {
            // Deduct quota credit for both successes AND failures (since AI processing was attempted)
            window.dispatchEvent(new Event('quota-update'));
          }
        } else {
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: nextProgress } : f));
        }
      }, 800);
      return () => clearTimeout(timer);
    } else if (queued) {
      const timer = setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === queued.id ? { ...f, status: 'processing' } : f));
      }, 300);
      return () => clearTimeout(timer);
    } else if (allDone && wasProcessing.current) {
      wasProcessing.current = false;
      const successCount = files.filter(f => f.status === 'completed').length;
      const failCount = files.filter(f => f.status === 'failed').length;
      if (successCount > 0 || failCount > 0) {
         setGlobalToast(`Batch Complete! ${successCount} contacts saved, ${failCount} invalid.`);
         setTimeout(() => setGlobalToast(null), 6000);
      }
    }
  }, [files, addContact]);

  const handleFilesAdded = (newFiles) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tier = user?.tier || 'personal';
    let limit = 10;
    if (tier === 'pro') limit = 50;
    if (tier === 'enterprise') limit = 100;

    if (files.length + newFiles.length > limit) {
      alert(`Your ${tier === 'enterprise' ? 'Enterprise' : 'Free Personal'} plan limits you to uploading ${limit} images at a time.`);
      return;
    }
    // Read each file as base64 and store it with the queue entry
    Array.from(newFiles).forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const entry = {
          id: Math.random().toString(36).substring(7),
          name: f.name,
          status: 'queued',
          progress: 0,
          base64: reader.result,      // full data URL
          mimeType: f.type,
          thumbnail: reader.result    // same as base64 for image preview
        };
        setFiles(prev => [...prev, entry]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setGlobalToast(null);
    wasProcessing.current = false;
  };

  // ── Fixed: count only queued + processing (not failed!) ──
  const pendingCount = files.filter(f => f.status === 'queued' || f.status === 'processing').length;
  const showFloatingProgress = pendingCount > 0;

  return (
    <BatchQueueContext.Provider value={{ files, handleFilesAdded, removeFile, clearAll }}>
      {children}
      
      {/* Global Success Notification */}
      {globalToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 bg-emerald-50 dark:bg-emerald-900/90 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100 px-6 py-4 rounded-xl shadow-2xl flex items-start gap-4 font-semibold max-w-sm">
          <CheckCircle2 size={24} className="text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-base mb-1">Uploads Finished</h3>
            <p className="font-normal text-sm opacity-90">{globalToast}</p>
          </div>
          <button onClick={() => setGlobalToast(null)} className="opacity-50 hover:opacity-100 p-1 shrink-0"><X size={16}/></button>
        </div>
      )}

      {/* Global Background Processing Indicator */}
      {showFloatingProgress && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 p-4 pl-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 group cursor-default transition-all hover:scale-[1.02]">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/40">
            <Loader2 size={20} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
            <div className="absolute inset-0 rounded-full border border-indigo-200 dark:border-indigo-800" />
          </div>
          <div className="flex-1 pr-2">
            <p className="text-sm font-bold text-gray-900 dark:text-white">AI Engine Processing</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {pendingCount} file{pendingCount !== 1 ? 's' : ''} left in queue
            </p>
          </div>
        </div>
      )}
    </BatchQueueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBatchQueue() {
  return useContext(BatchQueueContext);
}
