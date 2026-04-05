import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Lock, Monitor, Smartphone, Globe, Cloud, Blocks, MessageSquare, Plus, LogOut, Shield, RefreshCw, Trash2, Laptop, Check, ExternalLink, Settings2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken } from '../utils/auth.js';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedProfile, setSavedProfile] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSaveChanges = () => {
    setSavedProfile(true);
    showToast('Profile changes saved successfully!');
    setTimeout(() => setSavedProfile(false), 2000);
  };

  useEffect(() => {
    if (activeTab === 'Security') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const token = getStoredToken();
      const res = await axios.get('/api/sessions/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = getStoredToken();
      await axios.delete(`/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const token = getStoredToken();
      await axios.delete('/api/sessions/others', {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Alex Sterling', email: 'alex.sterling@intelliscan.ai', role: 'Enterprise Admin' };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 space-y-10 animate-fade-in w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white font-headline">Account Settings</h1>
      </header>
      
      {/* Sub-Navigation (Tabs) */}
      <div className="flex items-center gap-8 mb-10 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {renderTabHeader('Personal Info')}
        {renderTabHeader('Security')}
        {renderTabHeader('Integrations')}
        {renderTabHeader('Notifications')}
      </div>

      {/* Settings Grid Content based on activeTab */}
      <div className="grid grid-cols-12 gap-6">
        
        {activeTab === 'Personal Info' && (
          <>
            {/* Profile Picture Section */}
            <section className="col-span-12 md:col-span-5 lg:col-span-4 bg-white dark:bg-[#161c28] rounded-xl p-8 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-indigo-100 dark:ring-indigo-900/30 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800/50 transition-all flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-4xl font-headline font-bold text-indigo-300 dark:text-indigo-700">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <button className="absolute bottom-6 right-0 bg-indigo-600 p-2 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all outline outline-2 outline-white dark:outline-gray-900">
                  <Camera size={16} />
                </button>
              </div>
              <h3 className="text-xl font-headline font-bold text-gray-900 dark:text-white mb-1">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-body uppercase tracking-widest font-bold text-[10px]">{user.role}</p>
              <div className="w-full space-y-3">
                <button className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all border border-gray-200 dark:border-gray-700">Upload New Photo</button>
                <button className="w-full py-2.5 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">Remove Picture</button>
              </div>
            </section>

            {/* Personal Info Form */}
            <section className="col-span-12 md:col-span-7 lg:col-span-8 bg-white dark:bg-[#161c28] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in">
              <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Full Name</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="text" defaultValue={user.name}/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Company / Workspace</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="text" defaultValue="IntelliScan HQ"/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Email Address</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" type="email" defaultValue={user.email}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-label">Bio (Optional)</label>
                  <textarea className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all resize-none" rows={3} placeholder="Write something about yourself..."/>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleSaveChanges}
                  className={`px-8 py-3 font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2 ${savedProfile ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {savedProfile ? <><Check size={16} /> Saved!</> : 'Save Changes'}
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

        {/* Notifications and Integrations - Mockups when active */}
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
