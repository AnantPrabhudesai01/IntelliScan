import { useEffect, useRef, useState } from 'react';
import { Camera, Scan, X, CheckCircle, ChevronRight, DollarSign, Calendar, Zap, LayoutGrid, Info, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../../utils/auth';
import ConfirmationModal from '../../components/common/ConfirmationModal';

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function KioskMode() {
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState('capture'); // 'capture', 'qualify', 'success'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qualification, setQualification] = useState({ budget: '', timeline: '', role: '' });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const token = getStoredToken();

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setErrorMsg('');
      // Use hybrid constraints: prefer environment, but take anything available
      const constraints = { 
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      
      // Attachment happens in useEffect now to avoid null ref issues
    } catch (err) {
      console.error('Camera Error:', err);
      setErrorMsg('Could not access camera. Please check permissions or upload a file instead.');
    }
  };

  // Helper to attach stream once video element is in DOM
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    setErrorMsg('');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera to save resources while processing
      stopCamera();

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg'
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || 'Failed to scan card.');
      }

      if (!payload?.name && !payload?.email && !payload?.company) {
        throw new Error('Our AI couldn\'t find any contact details in that frame. Please try again with better lighting.');
      }

      setContactData(payload);
      setStep('qualify');
    } catch (error) {
      setErrorMsg(error.message);
      setIsScanning(false);
      // Restart camera on error so user can try again
      startCamera();
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const payload = await res.json();
        setEvents(Array.isArray(payload) ? payload : []);
      } catch {
        // Silent fallback for kiosk mode.
      }
    };
    loadEvents();
  }, [token]);

  const resetForNextLead = () => {
    setStep('capture');
    setContactData(null);
    setErrorMsg('');
    setQualification({ budget: '', timeline: '', role: '' });
    stopCamera();
  };

  const processImageFile = async (file) => {
    if (!file || !token) return;

    setErrorMsg('');
    setIsScanning(true);
    try {
      const base64 = await toDataUrl(file);
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg'
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || 'Failed to scan card image.');
      }

      if (!payload?.name && !payload?.email && !payload?.company) {
        throw new Error('OCR succeeded but no contact fields were detected. Please retake the photo.');
      }

      setContactData(payload);
      setStep('qualify');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to scan this card. Please retry.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
    event.target.value = '';
  };

  const handleFinish = async () => {
    if (!contactData || !token) return;

    setIsSaving(true);
    setErrorMsg('');
    try {
      const notes = [
        qualification.budget ? `Kiosk Budget: ${qualification.budget}` : '',
        qualification.timeline ? `Kiosk Timeline: ${qualification.timeline}` : '',
        qualification.role ? `Kiosk Buying Role: ${qualification.role}` : ''
      ].filter(Boolean).join(' | ');

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...contactData,
          job_title: contactData.job_title || contactData.title || '',
          event_id: selectedEventId ? Number(selectedEventId) : null,
          notes
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setShowDuplicateModal(true);
          return;
        }
        throw new Error(payload?.error || payload?.message || 'Failed to save lead from kiosk mode.');
      }

      setStep('success');
      setTimeout(() => {
        resetForNextLead();
      }, 2500);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to finalize lead.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">EVENT KIOSK</h1>
          <p className="text-indigo-400 font-bold tracking-widest text-[10px] uppercase">Automated Lead Capture System v3.0</p>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {step === 'capture' && (
          <div className="text-center space-y-10 py-10 animate-in zoom-in-95 duration-500">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <canvas ref={canvasRef} className="hidden" />

            {isCameraActive ? (
              <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] rounded-[3rem] overflow-hidden border-4 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Digital Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
                  <div className="absolute inset-0 border-[40px] border-black/20 backdrop-blur-[1px]"></div>
                  
                  {/* Animated Laser Line */}
                  <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scanner-line top-0 z-20"></div>
                  
                  {/* Corner Brackets */}
                  <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
                  <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-48 border-2 border-dashed border-white/40 rounded-2xl flex items-center justify-center">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Align Card Here</p>
                    </div>
                  </div>
                </div>

                {/* Shutter Effect */}
                {isScanning && (
                  <div className="absolute inset-0 bg-white animate-flash z-50"></div>
                )}

                <button 
                  onClick={stopCamera}
                  className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all z-30"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div 
                className="relative inline-block mx-auto group cursor-pointer"
                onClick={startCamera}
              >
                <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] group-hover:bg-indigo-600/40 transition-all"></div>
                <div className="relative w-80 h-80 border-4 border-dashed border-indigo-500/30 rounded-[3rem] flex items-center justify-center bg-[#161c28]/80 backdrop-blur-xl group-hover:border-indigo-500 transition-colors overflow-hidden">
                  <Camera size={120} className="text-indigo-500 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-5xl font-black tracking-tight text-white uppercase italic">
                {isCameraActive ? 'Position Business Card' : 'Scan Guest Card'}
              </h2>
              <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
                {isCameraActive 
                  ? 'Hold the card steady within the frame for automatic data extraction.' 
                  : 'Open the live scanner to instantly create a qualified lead from any card.'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={isCameraActive ? captureAndScan : startCamera}
                disabled={isScanning}
                className={`w-full max-w-md ${isCameraActive ? 'bg-indigo-600 text-white' : 'bg-transparent border-2 border-indigo-500 text-indigo-400'} py-6 rounded-3xl font-black text-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4`}
              >
                {isScanning ? (
                  <>
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    DIGITIZING...
                  </>
                ) : (
                  <>
                    {isCameraActive ? <Scan size={30} /> : <Camera size={30} />}
                    {isCameraActive ? 'ANALYZE CARD' : 'OPEN LIVE SCANNER'}
                  </>
                )}
              </button>

              {!isCameraActive && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2 transition-colors"
                >
                  <UploadCloud size={16} /> or upload from device
                </button>
              )}
            </div>

            {events.length > 0 && (
              <div className="max-w-sm mx-auto text-left py-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Assign Event</label>
                <select
                  value={selectedEventId}
                  onChange={(event) => setSelectedEventId(event.target.value)}
                  className="w-full bg-[#11182a] border border-white/15 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500"
                >
                  <option value="">No Event Assigned</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-center gap-8 pt-8 grayscale opacity-40">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><CheckCircle size={16} /> GDPR Compliant</div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Zap size={16} /> Live OCR</div>
            </div>
          </div>
        )}

        {step === 'qualify' && contactData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-10 duration-500">
            <div className="space-y-8">
              {/* Back / Re-scan button */}
              <button
                onClick={resetForNextLead}
                className="flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm transition-colors group"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                <span className="group-hover:underline">Re-scan / Back</span>
              </button>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <LayoutGrid size={160} />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white mb-6">
                    {(contactData.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase italic">
                    {contactData.name || 'Unknown Contact'}
                  </h3>
                  <p className="text-xl text-indigo-400 font-bold mb-1">{contactData.title || contactData.job_title || 'No title detected'}</p>
                  <p className="text-gray-400 font-medium">{contactData.company || 'No company detected'}</p>
                  <p className="text-gray-500 text-sm mt-2">{contactData.email || contactData.phone || 'No direct contact detected'}</p>

                  <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center gap-10">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">OCR Status</p>
                      <span className="text-emerald-500 font-black italic">Verified</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Confidence</p>
                      <span className="text-emerald-500 font-black italic">{Number(contactData.confidence || 0)}%</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Intelligence</p>
                      <span className="text-indigo-400 font-black italic text-[11px] whitespace-nowrap">{contactData.engine_used || 'Gemini AI'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-600 rounded-[2rem] p-8 text-white flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Info size={32} />
                </div>
                <p className="font-bold text-lg leading-snug">
                  Verify details, apply qualification, and finalize to store this lead in your workspace contacts.
                </p>
              </div>
            </div>

            <div className="space-y-8 bg-[#161c28] p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-3xl font-black tracking-tight text-white italic underline underline-offset-8">Qualify Lead</h3>

              <div className="space-y-8 pt-6">
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" /> Projected Budget
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['<$10k', '$10k - $50k', '$50k+', 'Not Discussed'].map((budget) => (
                      <button
                        key={budget}
                        onClick={() => setQualification({ ...qualification, budget })}
                        className={`py-4 rounded-2xl font-black text-sm border transition-all ${qualification.budget === budget ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" /> Implementation Timeline
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['ASAP', '1-3 Months', '6+ Months', 'Informational'].map((timeline) => (
                      <button
                        key={timeline}
                        onClick={() => setQualification({ ...qualification, timeline })}
                        className={`py-4 rounded-2xl font-black text-sm border transition-all ${qualification.timeline === timeline ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                      >
                        {timeline}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Buying Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Decision Maker', 'Influencer', 'Evaluator', 'Unknown'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setQualification({ ...qualification, role })}
                        className={`py-4 rounded-2xl font-black text-sm border transition-all ${qualification.role === role ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-4 active:scale-95 group disabled:opacity-60"
                  >
                    {isSaving ? 'FINALIZING...' : 'FINALIZE LEAD'} <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in-105 duration-700">
            <div className="w-48 h-48 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_100px_rgba(16,185,129,0.3)] border-8 border-white animate-bounce">
              <CheckCircle size={100} />
            </div>
            <div className="space-y-4">
              <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase">THANK YOU!</h2>
              <p className="text-2xl text-emerald-400 font-black tracking-widest uppercase">Lead Captured Successfully</p>
              <p className="text-gray-400 font-medium text-xl mt-4">Lead has been saved and follow-up draft automation is now available.</p>
            </div>
            <div className="pt-6 flex items-center gap-4 text-gray-600 font-black text-xs uppercase tracking-[0.3em]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              READY FOR NEXT GUEST
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-12 left-0 right-0 text-center pointer-events-none opacity-20">
        <p className="text-4xl font-black tracking-tighter text-white">IntelliScan Pro</p>
      </div>

      <ConfirmationModal
        isOpen={showDuplicateModal}
        type="warning"
        title="Duplicate Lead Detected"
        message="This guest already exists in your workspace leads. To prevent duplicate outreach sequences, this entry has been blocked. You can still view their original record in the dashboard."
        confirmText="Acknowledged"
        onConfirm={() => { setShowDuplicateModal(false); resetForNextLead(); }}
        onCancel={() => { setShowDuplicateModal(false); resetForNextLead(); }}
      />
    </div>
  );
}
