import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Camera, Lock, Monitor, Smartphone, Globe, Cloud, Blocks, MessageSquare, Plus, LogOut, Shield, RefreshCw, Trash2, Laptop, Check, ExternalLink, Settings2, X, Sparkles, User, Image as ImageIcon, Smartphone as PhoneIcon, Tablet, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken, setStoredAuth } from '../utils/auth.js';
import ConfirmationModal from '../components/common/ConfirmationModal';

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedProfile, setSavedProfile] = useState(false);
  
  
  // New States
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    tier: '',
    avatar_url: '',
    phone_number: '',
    bio: ''
  });
  const [originalPhone, setOriginalPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [localPhone, setLocalPhone] = useState('');

  const parsePhone = (phone) => {
    if (!phone) return { code: '+91', local: '' };
    const codes = ['+91', '+1', '+44', '+61', '+971'];
    for (const code of codes) {
      if (phone.startsWith(code)) return { code, local: phone.slice(code.length) };
    }
    return { code: '+91', local: phone.replace(/^\+/, '') };
  };
  const [isUploading, setIsUploading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState('avatar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarLibrary, setAvatarLibrary] = useState([]);
  
  // OTP States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Phone State Machine & Discovery
  const [phoneStatus, setPhoneStatus] = useState('LOCKED'); // LOCKED, UNLOCKING, EDIT, VERIFYING_NEW
  const [discoveryCode, setDiscoveryCode] = useState('');
  const [isPollingDiscovery, setIsPollingDiscovery] = useState(false);
  const pollIntervalRef = useRef(null);

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    user: '',
    pass: '',
    from_email: '',
    from_name: ''
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpVerified, setSmtpVerified] = useState(false);

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState(null);
  const [policyViolationError, setPolicyViolationError] = useState(null);

  const showToast = (msg, type = 'success') => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3000); 
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile.tier) {
      fetchWorkspaceSettings();
    }
  }, [profile.tier]);

  const fetchWorkspaceSettings = async () => {
    try {
      const res = await apiClient.get('/workspace/settings');
      if (res.data && res.data.settings?.smtp) {
        setSmtpConfig(res.data.settings.smtp);
        if (res.data.settings.smtp.pass === '********') setSmtpVerified(true);
      }
    } catch (err) {
      console.error('Failed to fetch workspace settings:', err);
    }
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    try {
      await apiClient.post('/workspace/settings/smtp', smtpConfig);
      showToast('SMTP configuration saved successfully!');
      fetchWorkspaceSettings();
    } catch (err) {
      showToast('Failed to save SMTP settings: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      const res = await apiClient.post('/workspace/settings/smtp/test', smtpConfig);
      showToast(res.data.message || 'Connection test successful!');
      setSmtpVerified(true);
    } catch (err) {
      showToast('Connection failed: ' + (err.response?.data?.error || err.message), 'error');
      setSmtpVerified(false);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setProfile(res.data);
      const phone = res.data.phone_number || '';
      setOriginalPhone(phone);
      const parsed = parsePhone(phone);
      setCountryCode(parsed.code);
      setLocalPhone(parsed.local);
      
      // Initialize state machine
      if (phone) {
        setPhoneStatus('LOCKED');
      } else {
        setPhoneStatus('EDIT');
      }
      
      // Always ensure we have a discovery code available for the Communications tab
      generateDiscoveryCode();
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const [whatsappStatus, setWhatsappStatus] = useState({ loading: true, active: false, diagnostics: null });

  const checkWhatsappConnectivity = async () => {
    setWhatsappStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await apiClient.get('/whatsapp/health');
      setWhatsappStatus({
        loading: false,
        active: res.data.service_status?.includes('ACTIVE'),
        diagnostics: res.data
      });
    } catch (err) {
      setWhatsappStatus({ loading: false, active: false, diagnostics: null });
    }
  };

  useEffect(() => {
    checkWhatsappConnectivity();
  }, []);

  const generateDiscoveryCode = () => {
    const existingCode = localStorage.getItem('discoveryCode');
    if (existingCode) {
      setDiscoveryCode(existingCode);
      return;
    }
    const code = `IS-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('discoveryCode', code);
    setDiscoveryCode(code);
  };

  const handleSaveChanges = async () => {
    const currentNumber = countryCode + localPhone;
    if (currentNumber !== originalPhone) {
      showToast('Action required: Please verify your new WhatsApp number via OTP before saving your profile.', 'error');
      const phoneLabel = document.querySelector('.font-label');
      if (phoneLabel) phoneLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      await apiClient.put('/user/profile', {
        name: profile.name,
        bio: profile.bio
      });
      setSavedProfile(true);
      showToast('Profile changes saved successfully!');
      setTimeout(() => setSavedProfile(false), 2000);
    } catch (err) {
      showToast('Failed to save profile: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

   const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Constrain check for Enterprise
    if (profile.tier === 'enterprise') {
      setPendingUploadFile(file);
      setShowPolicyModal(true);
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await apiClient.post('/user/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatar_url: res.data.avatarUrl }));
      showToast('Profile photo updated!');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      if (errMsg.includes('Identity Policy Violation')) {
        setPolicyViolationError(errMsg);
      } else {
        showToast('Upload failed: ' + errMsg, 'error');
      }
    } finally {
      setIsUploading(false);
      setShowPolicyModal(false);
      setPendingUploadFile(null);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await apiClient.post('/user/profile/generate-ai', { prompt: aiPrompt, type: aiType });
      setProfile(prev => ({ ...prev, avatar_url: res.data.imageUrl }));
      setShowAIModal(false);
      showToast(`AI ${aiType} generated!`);
    } catch (err) {
      showToast('AI Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await apiClient.get('/user/profile/avatar-library');
      setAvatarLibrary(res.data);
      setShowLibraryModal(true);
    } catch (err) {
      showToast('Failed to load library', 'error');
    }
  };

  const selectFromLibrary = async (url) => {
    try {
      await apiClient.post('/user/profile/set-avatar', { avatarUrl: url });
      setProfile(prev => ({ ...prev, avatar_url: url }));
      setShowLibraryModal(false);
      showToast('Avatar updated!');
    } catch (err) {
      showToast('Failed to update avatar', 'error');
    }
  };

  const requestEmailOTP = async () => {
    if (!newEmail) return;
    setOtpLoading(true);
    try {
      const res = await apiClient.post('/auth/request-otp', { 
        email: profile.email, 
        type: 'email_change',
        newEmail: newEmail 
      });
      setOtpSent(true);
      setDebugOtp(res.data.debug_code || res.data.debugCode);
      showToast('OTP sent to your registered WhatsApp');
    } catch (err) {
      showToast('Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    setOtpLoading(true);
    try {
      await apiClient.post('/auth/verify-otp', { code: otpCode, type: 'email_change' });
      setProfile(prev => ({ ...prev, email: newEmail }));
      setShowEmailModal(false);
      setOtpSent(false);
      setOtpCode('');
      showToast('Email updated successfully!');
    } catch (err) {
      showToast('Invalid or expired code', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const requestPhoneOTP = async () => {
    if (!profile.phone_number) return;
    setOtpLoading(true);
    try {
      const res = await apiClient.post('/auth/request-otp', { 
        type: 'phone_change',
        phone: profile.phone_number 
      });
      setOtpSent(true);
      setDebugOtp(res.data.debug_code || res.data.debugCode);
      setShowPhoneModal(true);
      showToast('OTP sent to your WhatsApp number');
    } catch (err) {
      showToast('Failed to send OTP: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyPhoneOTP = async () => {
    setOtpLoading(true);
    const newPhoneNumber = countryCode + localPhone;
    const isUnlocking = phoneStatus === 'UNLOCKING';
    
    try {
      await apiClient.post('/auth/verify-otp', { 
        code: otpCode, 
        type: isUnlocking ? 'unlock_phone' : 'phone_change' 
      });
      
      if (isUnlocking) {
        setPhoneStatus('EDIT');
        generateDiscoveryCode();
        showToast('Identity verified. You can now change your number.');
      } else {
        setOriginalPhone(newPhoneNumber);
        setProfile(prev => ({ ...prev, phone_number: newPhoneNumber }));
        setPhoneStatus('LOCKED');
        showToast('Phone updated successfully!');
      }
      
      setShowPhoneModal(false);
      setOtpSent(false);
      setOtpCode('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Invalid or expired code', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const startPhoneDiscovery = (forcedCode = null) => {
    setIsPollingDiscovery(true);
    showToast('Waiting for WhatsApp message...', 'info');
    
    // Use the explicitly passed code, or the current state, or the localStorage fallback
    const codeToPoll = forcedCode || discoveryCode || localStorage.getItem('discoveryCode');
    console.log(`[Discovery] Starting heartbeat poll for code: ${codeToPoll}`);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await apiClient.post('/auth/whatsapp/discovery', { 
          code: codeToPoll,
          autoLink: true
        });
        if (res.data.success && res.data.phone_number) {
           const parsed = parsePhone(res.data.phone_number);
           setCountryCode(parsed.code);
           setLocalPhone(parsed.local);
           setOriginalPhone(res.data.phone_number);
           setPhoneStatus('LOCKED');
           setIsPollingDiscovery(false);
           clearInterval(pollIntervalRef.current);
           showToast('WhatsApp Account Linked Successfully! 🚀');
           fetchProfile(); // Refresh entire state
        }
      } catch (e) {
        // Continue polling until timeout or success
      }
    }, 3000);

    // Stop polling after 4 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        setIsPollingDiscovery(false);
      }
    }, 240000);
  };

  const requestUnlockOTP = async () => {
    setOtpLoading(true);
    try {
      const res = await apiClient.post('/auth/request-otp', { type: 'unlock_phone' });
      setOtpSent(true);
      setDebugOtp(res.data.debug_code || res.data.debugCode);
      setShowPhoneModal(true);
      setPhoneStatus('UNLOCKING');
      showToast('OTP sent to your verified WhatsApp');
    } catch (err) {
      showToast('Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Security') {
      fetchSessions();
      // Set up real-time polling every 30 seconds
      pollIntervalRef.current = setInterval(fetchSessions, 30000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeTab]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await apiClient.get('/auth/sessions/me');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const formatDeviceInfo = (ua) => {
    if (!ua) return 'Unknown Device';
    
    // Browser Detection
    let browser = 'Unknown Browser';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
    else browser = ua.split(' ')[0] || 'Browser';

    // OS Detection
    let os = 'Unknown OS';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('iPhone')) os = 'iOS';
    else if (ua.includes('iPad')) os = 'iPadOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Linux')) os = 'Linux';
    else os = 'System';

    return `${browser} • ${os}`;
  };

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  const handleRevokeSession = async (id) => {
    try {
      await apiClient.delete(`/auth/sessions/${id}`);
      fetchSessions();
      showToast('Session revoked successfully');
    } catch (err) {
      console.error('Failed to revoke session:', err);
      showToast('Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await apiClient.delete('/auth/sessions/others');
      fetchSessions();
      showToast('All other sessions revoked');
    } catch (err) {
      console.error('Failed to revoke sessions:', err);
      showToast('Failed to revoke sessions', 'error');
    }
  };



  const renderTabHeader = (name) => {
    const isActive = activeTab === name;
    return (
      <button 
        onClick={() => setActiveTab(name)}
        className={`pb-4 tracking-wide whitespace-nowrap font-headline font-bold text-sm transition-colors ${isActive ? 'text-gray-900 border-b-2 border-brand-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent dark:text-gray-400 dark:hover:text-white'}`}
      >
        {name}
      </button>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 space-y-10 animate-fade-in w-full">
      <ConfirmationModal 
        isOpen={showPolicyModal}
        title="Enterprise Identity Policy"
        message="As an Enterprise user, your profile photo must adhere to company identity guidelines and maintain a professional appearance. This action will be audited by your administrator."
        confirmText="Acknowledge & Upload"
        type="info"
        onConfirm={async () => {
          await startUpload(pendingUploadFile);
          setShowPolicyModal(false);
          setPendingUploadFile(null);
        }}
        onCancel={() => {
          setShowPolicyModal(false);
          setPendingUploadFile(null);
        }}
      />

      <ConfirmationModal 
        isOpen={!!policyViolationError}
        title="Identity Policy Violation"
        message={policyViolationError}
        confirmText="I Understand"
        type="danger"
        onConfirm={() => setPolicyViolationError(null)}
        onCancel={() => setPolicyViolationError(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white flex items-center gap-3 animate-slide-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-brand-600'}`}>
          {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-card)] w-full max-w-md rounded-2xl p-8 border border-[var(--border-subtle)] shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[var(--brand)]" size={24} />
                <h3 className="text-xl font-bold font-headline text-[var(--text-main)]">AI {aiType === 'logo' ? 'Logo' : 'Avatar'} Creator</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20} /></button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 font-body">Enter a prompt and our AI will generate a unique {aiType} for you.</p>
            <div className="space-y-4">
              <textarea 
                className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all text-[var(--text-main)] resize-none"
                rows={3}
                placeholder="e.g. A futuristic blue tech minimalist avatar..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button 
                disabled={isGenerating || !aiPrompt}
                onClick={handleGenerateAI}
                className="w-full py-3 bg-[var(--brand)] text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-card)] w-full max-w-2xl rounded-2xl p-8 border border-[var(--border-subtle)] shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline text-[var(--text-main)]">Select from Library</h3>
              <button onClick={() => setShowLibraryModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {avatarLibrary.map(item => (
                <button 
                  key={item.id}
                  onClick={() => selectFromLibrary(item.url)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--brand)] transition-all"
                >
                  <img src={item.url} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[var(--brand)]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <Check className="text-white" size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email OTP Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-card)] w-full max-w-md rounded-2xl p-8 border border-[var(--border-subtle)] shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline text-[var(--text-main)]">Update Email Address</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20} /></button>
            </div>
            
            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2 font-body">Step 1: Enter your new email address. We'll send an OTP to your registered phone number to verify this change.</p>
                <input 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                  type="email"
                  placeholder="new.email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button 
                  disabled={otpLoading || !newEmail}
                  onClick={requestEmailOTP}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <PhoneIcon size={18} />}
                  Send OTP to Phone
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2 font-body">Step 2: Enter the 6-digit code sent to your phone.</p>
                {debugOtp && (
                  <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-2 rounded-lg text-xs font-bold text-center border border-amber-200">
                    DEBUG: Received Code: {debugOtp}
                  </div>
                )}
                <input 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button 
                  disabled={otpLoading || otpCode.length < 6}
                  onClick={verifyEmailOTP}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                  Verify & Update
                </button>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setOtpSent(false)} className="w-full text-xs text-brand-600 font-bold hover:underline">Change Email Address</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone OTP Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161c28] w-full max-w-md rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline dark:text-white">Verify Phone Number</h3>
              <button onClick={() => { setShowPhoneModal(false); setOtpSent(false); setOtpCode(''); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2 font-body">
                Enter the 6-digit code sent to: <br/>
                <strong className="text-gray-900 dark:text-gray-200">
                  {phoneStatus === 'UNLOCKING' ? originalPhone : newPhoneNumber}
                </strong>
              </p>
              
              {debugOtp && (
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-2 rounded-lg text-xs font-bold text-center border border-amber-200">
                  DEBUG: Received Code: {debugOtp}
                </div>
              )}

              <input 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />

              <div className="flex flex-col gap-3">
                <button 
                  disabled={otpLoading || otpCode.length < 6}
                  onClick={verifyPhoneOTP}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                  Verify & Save Phone
                </button>

                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={phoneStatus === 'UNLOCKING' ? requestUnlockOTP : requestPhoneOTP}
                  className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline py-1"
                >
                  Didn't get the code? Resend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--brand)] rounded-2xl text-white shadow-lg shadow-[var(--brand)]/20">
            <Settings2 size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--text-main)] font-headline uppercase italic">Account Settings</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium ml-14 mt-1">Configure your personal scanning workspace and enterprise identity.</p>
      </header>
      
      <div className="flex items-center gap-2 p-1 bg-[var(--surface-card)] rounded-2xl w-fit border border-[var(--border-subtle)] shadow-sm">
        {[
          { id: 'Personal Info', icon: User, allowed: ['free', 'pro', 'enterprise'] },
          { id: 'Security', icon: Lock, allowed: ['free', 'pro', 'enterprise'] },
          { id: 'Integrations', icon: Blocks, allowed: ['pro', 'enterprise'] },
          { id: 'Communications', icon: MessageSquare, allowed: ['free', 'pro', 'enterprise'] }
        ].filter(tab => tab.allowed.includes(profile.tier?.toLowerCase() || 'free')).map(tab => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Icon size={14} /> {tab.id}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {activeTab === 'Personal Info' && (
          <>
            {/* Profile Picture Section */}
            <section className="col-span-12 md:col-span-5 lg:col-span-4 bg-[var(--surface-card)] rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-[var(--border-subtle)] shadow-sm animate-fade-in relative overflow-hidden premium-grain">
               {/* Background Glow */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--brand)] via-purple-500 to-[var(--brand)] opacity-50"></div>
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-brand-100 dark:ring-brand-900/30 group-hover:ring-brand-200 dark:group-hover:ring-brand-800/50 transition-all flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${import.meta.env.VITE_API_BASE_URL || ''}${profile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />

                  ) : (
                    <span className="text-4xl font-headline font-bold text-brand-300 dark:text-brand-700">{profile.name?.charAt(0).toUpperCase() || <User size={40}/>}</span>
                  )}
                  {isUploading && <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center"><RefreshCw className="animate-spin text-brand-600" /></div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-6 right-0 bg-brand-600 p-2.5 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-[#161c28]">
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-headline font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-body uppercase tracking-widest font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">{profile.role}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg ${profile.tier === 'enterprise' ? 'bg-brand-600 text-white' : profile.tier === 'pro' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {profile.tier}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-2.5">
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                  <ImageIcon size={14} /> Upload Custom Photo
                </button>
                
                {(profile.tier === 'pro' || profile.tier === 'enterprise') && (
                  <>
                    <button onClick={() => { setAiType('avatar'); setShowAIModal(true); }} className="w-full py-2.5 bg-[var(--brand)]/10 text-[var(--brand)] text-sm font-bold rounded-xl hover:bg-[var(--brand)]/20 transition-all border border-[var(--brand)]/20 flex items-center justify-center gap-2">
                      <Sparkles size={14} /> AI Avatar Generator
                    </button>
                    {profile.tier === 'pro' && (
                      <button onClick={() => { setAiType('logo'); setShowAIModal(true); }} className="w-full py-2.5 bg-amber-500/10 text-amber-500 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-all border border-amber-500/20 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> AI Logo Generator
                      </button>
                    )}
                  </>
                )}
                
                <button onClick={fetchLibrary} className="w-full py-2.5 text-[var(--text-muted)] text-sm font-bold hover:bg-[var(--surface)] rounded-xl transition-all flex items-center justify-center gap-2">
                  <Blocks size={14} /> Browse Avatar Library
                </button>
              </div>

              {profile.tier === 'enterprise' && (
                <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <Shield size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Formal Policy</span>
                  </div>
                  <p className="text-[10px] text-red-500/70 leading-relaxed font-medium">Photos must follow company identity guidelines. Changes are audited.</p>
                </div>
              )}
            </section>

            {/* Personal Info Form */}
            <section className="col-span-12 md:col-span-7 lg:col-span-8 bg-[var(--surface-card)] rounded-2xl p-8 border border-[var(--border-subtle)] shadow-sm animate-fade-in relative overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-[var(--text-main)]">
                <Settings2 size={120} />
              </div>
              
              <h3 className="text-lg font-headline font-black italic tracking-tighter uppercase text-[var(--text-main)] mb-6 flex items-center gap-2">
                <User size={20} className="text-[var(--brand)]" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Full Name</label>
                  <input className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none transition-all font-medium" type="text" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Account Identification</label>
                  <input className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-muted)] italic font-black text-xs uppercase cursor-not-allowed" type="text" disabled value={profile.tier === 'enterprise' ? 'Enterprise Managed Node' : 'Personal Independent Node'} />
                </div>
                
                {profile.tier === 'enterprise' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Workspace Affiliation</label>
                    <input className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-muted)] italic font-black text-xs uppercase cursor-not-allowed" type="text" disabled value="IntelliScan Demo Workspace" />
                  </div>
                )}
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Email Address</label>
                    <button onClick={() => setShowEmailModal(true)} className="text-[10px] font-black uppercase text-[var(--brand)] hover:underline tracking-widest">Request Change via OTP</button>
                  </div>
                  <input className="w-full bg-[var(--surface-card)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-[var(--text-muted)] font-bold cursor-not-allowed" type="email" disabled value={profile.email}/>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label flex items-center gap-2">
                       Registered Phone (for OTP)
                       {profile.phone_number && phoneStatus === 'LOCKED' && (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-fade-in">
                           <Check size={10} className="stroke-[4px]" /> Verified
                         </span>
                       )}
                     </label>
                     <div className="flex items-center gap-2">
                        {phoneStatus === 'LOCKED' && (
                          <button 
                            onClick={requestUnlockOTP} 
                            disabled={otpLoading}
                            className="text-[9px] font-black uppercase tracking-widest text-[var(--brand)] hover:text-white hover:bg-[var(--brand)] bg-[var(--brand)]/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm border border-[var(--brand)]/20"
                          >
                            <Shield size={12}/> Security Unlock
                          </button>
                        )}
                     </div>
                   </div>

                   <div className="flex gap-2 relative mt-2">
                      <select 
                        disabled={phoneStatus === 'LOCKED' || phoneStatus === 'UNLOCKING'}
                        className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-2 py-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all min-w-[100px] cursor-pointer disabled:opacity-50"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                          <Smartphone size={18} />
                        </div>
                        <input 
                          disabled={phoneStatus === 'LOCKED' || phoneStatus === 'UNLOCKING'}
                          className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all disabled:text-[var(--text-muted)] disabled:bg-[var(--surface-card)]" 
                          type="tel" 
                          value={localPhone} 
                          placeholder="e.g. 9876543210" 
                        />
                      </div>
                   </div>
                   <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-tight">Verified device is strictly locked for identity protection.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Bio (Optional)</label>
                  <textarea 
                    className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all resize-none font-medium text-sm" 
                    rows={3} 
                    placeholder="Tell the network about yourself..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col items-end gap-3">
                <button 
                  onClick={handleSaveChanges}
                  disabled={(countryCode + localPhone) !== originalPhone}
                  className={`px-12 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 
                    ${(countryCode + localPhone) !== originalPhone ? 'bg-[var(--surface)] text-[var(--text-muted)] cursor-not-allowed' : 
                      savedProfile ? 'bg-emerald-500 text-white' : 'bg-[var(--brand)] text-white hover:brightness-110'}`}
                >
                  {savedProfile ? <><Check size={16} /> Saved!</> : 'Update Architecture'}
                </button>
              </div>
            </section>
          </>
        )}


        {activeTab === 'Security' && (
          <>
            {/* Security / Password Section */}
            <section className="col-span-12 lg:col-span-6 bg-[var(--surface-card)] rounded-2xl p-8 border border-[var(--border-subtle)] shadow-sm animate-fade-in premium-grain">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[var(--brand)]/10 rounded-xl text-[var(--brand)]">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-headline font-black italic tracking-tighter uppercase text-[var(--text-main)]">Vault & Authentication</h3>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                      <h4 className="font-headline font-black italic tracking-tight text-[var(--text-main)] mb-1 uppercase text-sm">Two-Factor Authentication</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Double-layer identity verification.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[var(--border-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 px-4 bg-emerald-500/10 rounded-xl w-fit border border-emerald-500/20 relative z-10">
                    <Shield className="text-emerald-500" size={14} />
                    <p className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Encryption Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Current Master Key</label>
                    <input className="w-full bg-[var(--surface-card)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all cursor-not-allowed font-medium" disabled placeholder="••••••••••••" type="password"/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">New Master Key</label>
                      <input className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all font-medium" type="password"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Confirm Key</label>
                      <input className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--brand)]/40 outline-none transition-all font-medium" type="password"/>
                    </div>
                  </div>
                </div>
                <button className="w-full py-4 bg-[var(--text-main)] text-[var(--surface)] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-xl">Update Security Architecture</button>
              </div>
            </section>

            {/* Session Management / Active Devices Section */}
            <section className="col-span-12 lg:col-span-6 bg-[var(--surface-card)] rounded-2xl p-8 flex flex-col border border-[var(--border-subtle)] shadow-sm animate-fade-in relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[var(--brand)]/10 rounded-xl text-[var(--brand)]">
                    <Monitor size={20} />
                  </div>
                  <h3 className="text-xl font-headline font-black italic tracking-tighter uppercase text-[var(--text-main)]">Active Infrastructure</h3>
                </div>
                <button onClick={fetchSessions} className="p-2 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">
                  <RefreshCw size={18} className={isLoadingSessions ? "animate-spin" : ""} />
                </button>
              </div>
              
              <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Current Session */}
                {currentSession && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl border-hairline border-[var(--brand)]/30 bg-[var(--brand)]/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <Zap size={60} />
                    </div>
                    <div className="mt-1 p-2 bg-[var(--brand)] rounded-lg text-white shadow-lg shadow-[var(--brand)]/20">
                      {currentSession.device_info?.includes('iPhone') || currentSession.device_info?.includes('Android') ? <Smartphone size={18} /> : currentSession.device_info?.includes('iPad') ? <Tablet size={18} /> : <Monitor size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-headline font-black italic tracking-tight text-[var(--text-main)] truncate uppercase text-sm">{formatDeviceInfo(currentSession.device_info)}</p>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-[var(--brand)] text-white rounded-md block whitespace-nowrap shadow-sm">Active Instance</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mb-2">{currentSession.location} • {currentSession.ip_address}</p>
                      <p className="text-[9px] text-[var(--brand)] font-black uppercase tracking-widest">Master Session • Zero Latency</p>
                    </div>
                  </div>
                )}

                {/* Other Sessions */}
                {otherSessions.map(session => (
                  <div key={session.id} className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--brand)]/30 hover:bg-[var(--surface)] transition-all group">
                    <div className="mt-1 p-2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors">
                      {session.device_info.includes('iPhone') || session.device_info.includes('Android') ? <Smartphone size={18} /> : session.device_info.includes('iPad') ? <Tablet size={18} /> : <Monitor size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-headline font-black italic tracking-tight text-[var(--text-main)] truncate uppercase text-sm">{formatDeviceInfo(session.device_info)}</p>
                        <button onClick={() => handleRevokeSession(session.id)} className="text-[9px] font-black text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-[var(--surface)] px-2 py-1 rounded-md border border-[var(--border-subtle)] shadow-sm">
                          <Trash2 size={12} /> Terminate
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mb-2">{session.location} • {session.ip_address}</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Last Synced: {new Date(session.last_active).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {isLoadingSessions && <div className="text-center py-8 text-[9px] font-black text-[var(--brand)] uppercase tracking-[0.3em] animate-pulse">Syncing Global Matrix...</div>}
                
                {!isLoadingSessions && sessions.length === 0 && (
                  <div className="text-center py-8 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">No foreign nodes detected.</div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                <button 
                  onClick={handleRevokeAllOtherSessions}
                  disabled={otherSessions.length === 0}
                  className="w-full flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 py-4 rounded-2xl transition-all disabled:opacity-30 border-hairline border-red-500/20"
                >
                  <LogOut size={16} /> Purge All Foreign Sessions
                </button>
              </div>
            </section>
          </>
        )}

        {/* Notifications and Integrations */}
        {activeTab === 'Integrations' && (
          <section className="col-span-12 bg-[var(--surface-card)] rounded-2xl p-8 border border-[var(--border-subtle)] shadow-sm animate-fade-in premium-grain">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--brand)]/10 rounded-xl text-[var(--brand)]">
                  <Blocks size={20} />
                </div>
                <h3 className="text-xl font-headline font-black italic tracking-tighter uppercase text-[var(--text-main)]">Connected Intelligence</h3>
              </div>
              <button onClick={() => navigate('/marketplace')}
                className="px-6 py-3 bg-[var(--brand)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[var(--brand)]/20">
                Browse Ecosystem <ExternalLink size={13} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Salesforce', icon: Cloud, color: '#00a1e0', status: 'Auto-sync active', pulse: true },
                { name: 'HubSpot', icon: Globe, color: '#ff5a5f', status: 'Auth required', pulse: false, warning: true },
                { name: 'Slack', icon: MessageSquare, color: '#4a154b', status: 'Active', pulse: true }
              ].map(service => (
                <div key={service.name} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--brand)]/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-card)] flex items-center justify-center shadow-sm mb-6 border border-[var(--border-subtle)] group-hover:scale-110 transition-transform">
                    <service.icon size={24} style={{ color: service.color }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black italic tracking-tight text-[var(--text-main)] mb-1 uppercase font-headline">{service.name}</p>
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest">{service.status}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${service.warning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} ${service.pulse ? 'animate-pulse' : ''}`}></div>
                  </div>
                </div>
              ))}
              
              <div onClick={() => navigate('/marketplace')}
                className="bg-[var(--surface)]/50 p-6 rounded-2xl border-hairline border-dashed border-[var(--border-strong)] hover:border-[var(--brand)]/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center min-h-[140px]">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-card)] flex items-center justify-center group-hover:bg-[var(--brand)] group-hover:text-white transition-all mb-4 border border-[var(--border-subtle)]">
                  <Plus size={18} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--brand)]">Extend Ecosystem</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-1 font-bold">Browse Marketplace →</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Communications' && (
          <section className="col-span-12 bg-[var(--surface-card)] rounded-[2.5rem] p-8 md:p-14 border border-[var(--border-subtle)] shadow-2xl animate-fade-in relative overflow-hidden premium-grain">
             {/* Background Effects */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--brand)]/10 rounded-full blur-[100px] pointer-events-none"></div>

             <div className="relative z-10 flex flex-col lg:flex-row gap-16">
               {/* Left Side: Setup Wizard */}
               <div className="lg:w-7/12 space-y-10">
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black font-headline tracking-tighter text-[var(--text-main)] uppercase italic">WhatsApp Magic Link</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Hardware-free mobile scanning pipeline.</p>
                  </div>

                  <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[var(--brand)] via-[var(--border-subtle)] to-transparent border-dashed"></div>

                    {/* Step 1 */}
                    <div className="relative flex gap-10 pb-12 group">
                      <div className="z-10 bg-[var(--brand)] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-xl shadow-xl shadow-[var(--brand)]/30 group-hover:scale-110 transition-transform italic">1</div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-headline font-black italic tracking-tight text-[var(--text-main)] mt-2 uppercase">Interface Sandbox</h4>
                        <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed font-medium">Initialize the secure connection tunnel by joining the automated node.</p>
                        <a 
                          href="https://wa.me/14155238886?text=join%20baseball-eventually" 
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { startPhoneDiscovery(); }}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--brand)] text-[var(--brand)] font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-sm group-hover:shadow-lg"
                        >
                          <Smartphone size={16} /> Protocol Activation
                        </a>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex gap-10 pb-12 group">
                      <div className="z-10 bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-xl group-hover:bg-[var(--brand)] group-hover:text-white group-hover:border-[var(--brand)] transition-all italic">2</div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mt-2">
                           <h4 className="text-lg font-headline font-black italic tracking-tight text-[var(--text-main)] uppercase">Node Pairing</h4>
                           <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase rounded-lg border border-amber-500/20 tracking-widest">Encrypted</div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed font-medium">Verify your session with the architectural pairing code provided below.</p>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                           <a 
                            href={`https://wa.me/14155238886?text=${encodeURIComponent(discoveryCode || 'IS-KEY')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-main)] text-[var(--surface)] font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-all"
                           >
                            <MessageSquare size={16} /> Finalize Pairing ({discoveryCode})
                           </a>
                           
                           <button 
                            onClick={() => { 
                              navigator.clipboard.writeText(discoveryCode); 
                              showToast('Key copied to vault!');
                            }}
                            className="p-4 bg-[var(--surface)] text-[var(--text-muted)] rounded-2xl hover:text-[var(--brand)] border border-[var(--border-subtle)] transition-colors"
                           >
                             <Copy size={16} />
                           </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex gap-10 group">
                      <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-xl transition-all italic ${profile.phone_number ? 'bg-emerald-500 text-white' : 'bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>3</div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-headline font-black italic tracking-tight text-[var(--text-main)] mt-2 uppercase">Integrity Status</h4>
                        <div className="flex items-center gap-4">
                           {whatsappStatus.loading ? (
                             <div className="flex items-center gap-3 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest animate-pulse">
                               <RefreshCw size={16} className="animate-spin" /> Hardware Syncing...
                             </div>
                           ) : profile.phone_number ? (
                             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20 rounded-2xl shadow-sm">
                               <Check size={16} strokeWidth={4} /> Instance Linked ({profile.phone_number})
                             </div>
                           ) : (
                             <div className="flex items-center gap-3 px-6 py-3 bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-black uppercase border border-[var(--border-subtle)] rounded-2xl">
                               Awaiting Handshake
                             </div>
                           )}
                           <button onClick={checkWhatsappConnectivity} className="p-3 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors bg-[var(--surface)] rounded-xl border border-[var(--border-subtle)]">
                             <RefreshCw size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Right Side: Status & Settings */}
               <div className="lg:w-5/12 space-y-8">
                  {/* Status Panel */}
                  <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[2rem] p-10 space-y-10 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-[var(--text-main)]">
                        <Cpu size={120} />
                     </div>
                     <div className="flex items-center justify-between relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] font-headline italic">Engine Status</p>
                        {whatsappStatus.active ? (
                          <div className="flex items-center gap-3 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                             <span className="text-[9px] font-black text-emerald-500 tracking-[0.2em]">GRID ACTIVE</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-amber-500 tracking-[0.2em] px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">MAINTENANCE</span>
                        )}
                     </div>

                     <div className="space-y-6 relative z-10">
                        {[
                          { icon: Sparkles, color: '[var(--brand)]', title: 'AI OCR Pipeline', desc: 'Neural sorting prioritized' },
                          { icon: Shield, color: 'emerald-500', title: 'Vault Protection', desc: 'Secure Magic Link rotation' }
                        ].map(item => (
                          <div key={item.title} className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-[var(--surface-card)] flex items-center justify-center shadow-lg border border-[var(--border-subtle)]">
                                <item.icon size={20} className={`text-${item.color}`} />
                             </div>
                             <div>
                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest font-headline italic">{item.title}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">{item.desc}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col gap-6 relative z-10">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] italic leading-relaxed">"Eliminate the friction between a handshake and your CRM. Point, shoot, and scale."</p>
                        <button 
                          onClick={() => navigate('/setup-guide')}
                          className="w-full py-4 bg-[var(--text-main)] text-[var(--surface)] font-black text-[9px] uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-xl"
                        >
                          Advanced Setup Documentation
                        </button>
                     </div>
                  </div>

                  {/* SMTP Panel */}
                  <div className={`bg-[var(--brand)] rounded-[2rem] p-10 text-white space-y-6 shadow-2xl shadow-[var(--brand)]/30 transition-all duration-500 relative overflow-hidden ${showSmtpConfig ? 'lg:col-span-12' : ''}`}>
                     <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <RefreshCw size={100} className={isTestingSmtp ? 'animate-spin' : ''} />
                     </div>
                     <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                           <h4 className="text-xl font-headline font-black italic uppercase tracking-tight">SMTP Engine</h4>
                        </div>
                        <button 
                          onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                          className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                        >
                          {showSmtpConfig ? 'Close Node' : 'Initialize'}
                        </button>
                     </div>
                     <p className="text-xs text-white/70 leading-relaxed font-medium relative z-10 max-w-xs">Distribute AI follow-ups instantly through your professional infrastructure.</p>
                     
                     {!showSmtpConfig ? (
                       <div className="flex items-center justify-between bg-white/10 p-5 rounded-[1.5rem] border border-white/10 relative z-10">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Connectivity Status</span>
                          <span className="text-[10px] font-black italic tracking-widest">{smtpVerified ? 'VERIFIED' : 'UNINITIALIZED'}</span>
                       </div>
                     ) : (
                       <div className="space-y-6 pt-8 border-t border-white/10 animate-fade-in relative z-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {[
                               { label: 'SMTP Host', val: 'host', placeholder: 'smtp.gmail.com' },
                               { label: 'Port', val: 'port', placeholder: '587' },
                               { label: 'Username', val: 'user', placeholder: 'you@company.com' },
                               { label: 'Master Key', val: 'pass', placeholder: '••••••••••••', type: 'password' },
                               { label: 'Sender Identity', val: 'from_name', placeholder: 'John Doe | IntelliScan' },
                               { label: 'Origin Email', val: 'from_email', placeholder: 'you@company.com' }
                             ].map(field => (
                              <div key={field.label} className="space-y-2">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-white/40">{field.label}</label>
                                 <input 
                                   type={field.type || 'text'}
                                   value={smtpConfig[field.val]}
                                   onChange={(e) => setSmtpConfig({ ...smtpConfig, [field.val]: e.target.value })}
                                   placeholder={field.placeholder}
                                   className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-white/30 outline-none placeholder:text-white/30 font-medium transition-all"
                                 />
                              </div>
                             ))}
                          </div>
                          <div className="flex gap-4 pt-4">
                             <button 
                               onClick={handleTestSmtp}
                               disabled={isTestingSmtp}
                               className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 italic"
                             >
                               {isTestingSmtp ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                               Verify Node
                             </button>
                             <button 
                               onClick={handleSaveSmtp}
                               disabled={isSavingSmtp}
                               className="flex-1 py-4 bg-white text-[var(--brand)] rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl hover:brightness-110 transition-all italic"
                             >
                               {isSavingSmtp ? 'Architecting...' : 'Commit Settings'}
                             </button>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
             </div>
          </section>
        )}

      </div>
    </div>
  );
}
