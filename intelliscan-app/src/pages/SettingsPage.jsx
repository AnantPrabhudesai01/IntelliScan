import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Camera, Lock, Monitor, Smartphone, Globe, Cloud, Blocks, MessageSquare, Plus, LogOut, Shield, RefreshCw, Trash2, Laptop, Check, ExternalLink, Settings2, X, Sparkles, User, Image as ImageIcon, Smartphone as PhoneIcon } from 'lucide-react';
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

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState(null);

  const showToast = (msg, type = 'success') => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3000); 
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await apiClient.put('/profile', {
        name: profile.name,
        phone_number: profile.phone_number,
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
      const res = await apiClient.post('/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatar_url: res.data.avatarUrl }));
      showToast('Profile photo updated!');
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.error || err.message), 'error');
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
      const res = await apiClient.post('/profile/generate-ai', { prompt: aiPrompt, type: aiType });
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
      const res = await apiClient.get('/profile/avatar-library');
      setAvatarLibrary(res.data);
      setShowLibraryModal(true);
    } catch (err) {
      showToast('Failed to load library', 'error');
    }
  };

  const selectFromLibrary = async (url) => {
    try {
      await apiClient.post('/profile/set-avatar', { avatarUrl: url });
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
      setDebugOtp(res.data.debugCode);
      showToast('OTP sent to your registered phone');
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

  useEffect(() => {
    if (activeTab === 'Security') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await apiClient.get('/sessions/me');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  const handleRevokeSession = async (id) => {
    try {
      await apiClient.delete(`/sessions/${id}`);
      fetchSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await apiClient.delete('/sessions/others');
      fetchSessions();
    } catch (err) {
      console.error('Failed to clear other sessions:', err);
    }
  };

  const renderTabHeader = (name) => {
    const isActive = activeTab === name;
    return (
      <button 
        onClick={() => setActiveTab(name)}
        className={`pb-4 tracking-wide whitespace-nowrap font-headline font-bold text-sm transition-colors ${isActive ? 'text-gray-900 border-b-2 border-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent dark:text-gray-400 dark:hover:text-white'}`}
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
        onConfirm={() => startUpload(pendingUploadFile)}
        onCancel={() => setShowPolicyModal(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white flex items-center gap-3 animate-slide-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'}`}>
          {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161c28] w-full max-w-md rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold font-headline dark:text-white">AI {aiType === 'logo' ? 'Logo' : 'Avatar'} Creator</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-body">Enter a prompt and our AI will generate a unique {aiType} for you.</p>
            <div className="space-y-4">
              <textarea 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                rows={3}
                placeholder="e.g. A futuristic blue tech minimalist avatar..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button 
                disabled={isGenerating || !aiPrompt}
                onClick={handleGenerateAI}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="bg-white dark:bg-[#161c28] w-full max-w-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline dark:text-white">Select from Library</h3>
              <button onClick={() => setShowLibraryModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {avatarLibrary.map(item => (
                <button 
                  key={item.id}
                  onClick={() => selectFromLibrary(item.url)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all"
                >
                  <img src={item.url} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center">
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
          <div className="bg-white dark:bg-[#161c28] w-full max-w-md rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline dark:text-white">Update Email Address</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2 font-body">Step 1: Enter your new email address. We'll send an OTP to your registered phone number to verify this change.</p>
                <input 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  type="email"
                  placeholder="new.email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button 
                  disabled={otpLoading || !newEmail}
                  onClick={requestEmailOTP}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button 
                  disabled={otpLoading || otpCode.length < 6}
                  onClick={verifyEmailOTP}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                  Verify & Update
                </button>
                <button onClick={() => setOtpSent(false)} className="w-full text-xs text-indigo-600 font-bold hover:underline">Change Email Address</button>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white font-headline">Account Settings</h1>
      </header>
      
      <div className="flex items-center gap-8 mb-10 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {renderTabHeader('Personal Info')}
        {renderTabHeader('Security')}
        {renderTabHeader('Integrations')}
        {renderTabHeader('Notifications')}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {activeTab === 'Personal Info' && (
          <>
            {/* Profile Picture Section */}
            <section className="col-span-12 md:col-span-5 lg:col-span-4 bg-white dark:bg-[#161c28] rounded-xl p-8 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-indigo-100 dark:ring-indigo-900/30 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800/50 transition-all flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `http://localhost:5000${profile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-headline font-bold text-indigo-300 dark:text-indigo-700">{profile.name?.charAt(0).toUpperCase() || <User size={40}/>}</span>
                  )}
                  {isUploading && <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center"><RefreshCw className="animate-spin text-indigo-600" /></div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-6 right-0 bg-indigo-600 p-2.5 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-[#161c28]">
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-headline font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-body uppercase tracking-widest font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">{profile.role}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg ${profile.tier === 'enterprise' ? 'bg-indigo-600 text-white' : profile.tier === 'pro' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
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
                    <button onClick={() => { setAiType('avatar'); setShowAIModal(true); }} className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center gap-2">
                      <Sparkles size={14} /> AI Avatar Generator
                    </button>
                    {profile.tier === 'pro' && (
                      <button onClick={() => { setAiType('logo'); setShowAIModal(true); }} className="w-full py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all border border-amber-100 dark:border-amber-900/40 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> AI Logo Generator
                      </button>
                    )}
                  </>
                )}
                
                <button onClick={fetchLibrary} className="w-full py-2.5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Blocks size={14} /> Browse Avatar Library
                </button>
              </div>

              {profile.tier === 'enterprise' && (
                <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <Shield size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Enterprise Formal Policy</span>
                  </div>
                  <p className="text-[10px] text-red-700 dark:text-red-300 leading-tight">Photos must follow company identity guidelines. Changes are audited.</p>
                </div>
              )}
            </section>

            {/* Personal Info Form */}
            <section className="col-span-12 md:col-span-7 lg:col-span-8 bg-white dark:bg-[#161c28] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in relative">
               {/* Background Pattern */}
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Settings2 size={120} />
              </div>
              
              <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-600" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Full Name</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="text" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Workspace Affiliation</label>
                  <input className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-500 cursor-not-allowed" type="text" disabled value="IntelliScan Demo Workspace" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Email Address</label>
                    <button onClick={() => setShowEmailModal(true)} className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline">Request Change via OTP</button>
                  </div>
                  <input className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-500 cursor-not-allowed" type="email" disabled value={profile.email}/>
                </div>

                <div className="space-y-2 md:col-span-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Registered Phone (for OTP)</label>
                   <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Smartphone size={18} />
                    </div>
                    <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="text" value={profile.phone_number || ''} placeholder="e.g. 9876543210" onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}/>
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1 font-medium">Used for secure login and email verification.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Bio (Optional)</label>
                  <textarea 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all resize-none font-body" 
                    rows={3} 
                    placeholder="Tell the network about yourself..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleSaveChanges}
                  className={`px-8 py-3 font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2 ${savedProfile ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {savedProfile ? <><Check size={16} /> Saved!</> : 'Update Profile'}
                </button>
              </div>
            </section>
          </>
        )}


        {activeTab === 'Security' && (
          <>
            {/* Security / Password Section */}
            <section className="col-span-12 lg:col-span-6 bg-white dark:bg-[#161c28] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">Authentication & Security</h3>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-headline font-bold text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Add an extra layer of security to your account.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 px-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit border border-emerald-200 dark:border-emerald-800/40">
                    <Shield className="text-emerald-700 dark:text-emerald-400" size={16} />
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold tracking-tight uppercase">Active via Authenticator</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Current Password</label>
                    <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all cursor-not-allowed" disabled placeholder="••••••••••••" type="password"/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">New Password</label>
                      <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="password"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Confirm Password</label>
                      <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="password"/>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm">Update Security Credentials</button>
              </div>
            </section>

            {/* Session Management / Active Devices Section */}
            <section className="col-span-12 lg:col-span-6 bg-white dark:bg-[#161c28] rounded-xl p-8 flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Monitor className="text-indigo-600 dark:text-indigo-400" size={24} />
                  <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">Device Sessions</h3>
                </div>
                <button onClick={fetchSessions} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                  <RefreshCw size={16} className={isLoadingSessions ? "animate-spin" : ""} />
                </button>
              </div>
              
              <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Current Session */}
                {currentSession && (
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="mt-1 p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Laptop size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="font-headline font-bold text-gray-900 dark:text-white truncate">{currentSession.device_info}</p>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded block whitespace-nowrap">This Device</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-body mb-2">{currentSession.location} • {currentSession.ip_address}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Active Now</p>
                    </div>
                  </div>
                )}

                {/* Other Sessions */}
                {otherSessions.map(session => (
                  <div key={session.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800/60 transition-colors group">
                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                      {session.device_info.includes('Mobile') || session.device_info.includes('iPhone') || session.device_info.includes('Android') ? <Smartphone size={20} /> : <Monitor size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="font-headline font-bold text-gray-900 dark:text-white truncate">{session.device_info}</p>
                        <button onClick={() => handleRevokeSession(session.id)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <Trash2 size={12} /> Revoke
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-body mb-2">{session.location} • {session.ip_address}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Last Active: {new Date(session.last_active).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {isLoadingSessions && <div className="text-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading devices...</div>}
                
                {!isLoadingSessions && sessions.length === 0 && (
                  <div className="text-center py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">No active sessions found. Log in again.</div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={handleRevokeAllOtherSessions}
                  disabled={otherSessions.length === 0}
                  className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 py-3 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <LogOut size={16} /> Log out of all other sessions
                </button>
              </div>
            </section>
          </>
        )}

        {/* Notifications and Integrations */}
        {activeTab === 'Integrations' && (
          <section className="col-span-12 bg-white dark:bg-[#161c28] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in">
            {toast && (
              <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3">
                <Check size={16} /> {toast}
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Blocks className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">Connected Services</h3>
              </div>
              <button onClick={() => navigate('/marketplace')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                Browse Marketplace <ExternalLink size={13} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                  <Cloud size={24} className="text-[#00a1e0]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Salesforce</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Auto-sync active</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                  <Globe size={24} className="text-[#ff5a5f]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">HubSpot</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Auth required</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                  <MessageSquare size={24} className="text-[#4a154b]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Slack</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              
              <div onClick={() => navigate('/marketplace')}
                className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center min-h-[140px]">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors mb-3">
                  <Plus size={20} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Add Service</p>
                <p className="text-[10px] text-gray-400 mt-1">Browse Marketplace →</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Notifications' && (
          <section className="col-span-12 md:col-span-8 bg-white dark:bg-[#161c28] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in">
             <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-6">Alert Preferences</h3>
             <div className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">Notification settings coming soon</div>
          </section>
        )}

      </div>
    </div>
  );
}
