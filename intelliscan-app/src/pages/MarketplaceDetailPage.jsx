import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Cloud, Globe, MessageSquare, Database, CheckCircle2, 
  ChevronLeft, Star, Users, Shield, Zap, RefreshCw, 
  ExternalLink, Settings2, Lock, Smartphone, Check, X,
  Activity, AlertCircle, Info, ArrowRight, LayoutGrid, Cpu
} from 'lucide-react';
import { getStoredToken } from '../utils/auth';

const apps = [
  {
    id: 'salesforce', 
    name: 'Salesforce CRM', 
    icon: Cloud, 
    category: 'CRM', 
    color: 'text-[#00a1e0]', 
    tagline: 'The world\'s #1 CRM, now powered by your networking.',
    desc: 'Automatically sync parsed business cards as new Leads or Contacts in Salesforce. Eliminate manual data entry and ensure your sales pipeline is always populated with high-quality, verified intelligence.',
    longDesc: 'Our Salesforce integration is built for high-scale enterprise teams. It uses the Salesforce REST API to securely push contact data as soon as cards are scanned. With intelligent field mapping, you can route contacts to specific campaigns or owners based on industry detection.',
    features: [
      'Real-time Lead & Contact creation',
      'Intelligent campaign member assignment',
      'Duplicate detection & resolution',
      'Custom field mapping support',
      'Batch sync history'
    ],
    permissions: [
      { id: 'contacts', label: 'Access to CRM Contacts', desc: 'Required to resolve duplicates and update existing records.' },
      { id: 'leads', label: 'Create Lead Records', desc: 'Required to funnel new networking prospects into your pipeline.' },
      { id: 'metadata', label: 'Read Org Metadata', desc: 'Used for custom field mapping configuration.' }
    ],
    configFields: ['Salesforce Domain', 'Access Token', 'Security Token', 'Target Object'],
    rating: 4.9,
    reviews: 1284,
    developer: 'IntelliScan Native',
    verified: true
  },
  {
    id: 'googlesheets', 
    name: 'Google Sheets', 
    icon: Database, 
    category: 'Productivity', 
    color: 'text-[#0f9d58]', 
    tagline: 'Direct-to-spreadsheet intelligence for easy analysis.',
    desc: 'Instantly append scanned contacts into a Google Sheet. Perfect for real-time collaboration, simple lead management, and custom reporting.',
    longDesc: 'The Google Sheets bridge connects your scanner to any spreadsheet in your Google Drive. Each scan appends a new row with all extracted intelligence. No more CSV exports or manual copy-pasting.',
    features: [
      'Real-time row appending',
      'Automatic column mapping',
      'Supports shared drives',
      'One-click spreadsheet creation',
      'Offline sync safe'
    ],
    permissions: [
      { id: 'sheets', label: 'Edit Spreadsheets', desc: 'Required to create and append data to your selection.' },
      { id: 'drive', label: 'View Drive Metadata', desc: 'Used to help you select the correct spreadsheet ID.' }
    ],
    configFields: ['Spreadsheet ID', 'Google Access Token', 'Target Sheet Name'],
    rating: 4.9,
    reviews: 940,
    developer: 'IntelliScan Native',
    verified: true
  },
  {
    id: 'hubspot', 
    name: 'HubSpot', 
    icon: Globe, 
    category: 'Marketing', 
    color: 'text-[#ff5a5f]', 
    tagline: 'Bridge the gap between events and marketing automation.',
    desc: 'Enrich incoming scanned prospects with HubSpot marketing data instantly. Trigger automated follow-up sequences before you even leave the conference floor.',
    longDesc: 'The HubSpot bridge allows you to map every scanned business card to a specific marketing list. It captures not just contact details, but also the inferred industry and seniority to trigger highly personalized email workflows via HubSpot Workflows.',
    features: [
      'Instant Sync to HubSpot CRM',
      'Trigger Marketing Workflows',
      'Seniority-based List Segmenting',
      'Event Origin Tracking',
      'Email follow-up automation'
    ],
    permissions: [
      { id: 'crm', label: 'CRM Access', desc: 'Required to create and manage HubSpot contact records.' },
      { id: 'workflows', label: 'Workflow Triggers', desc: 'Required to place contacts into automated sequences.' }
    ],
    configFields: ['HubSpot API Key', 'Default Pipeline', 'Initial Lifecycle Stage'],
    rating: 4.8,
    reviews: 842,
    developer: 'IntelliScan Native',
    verified: true
  },
  {
     id: 'slack', 
     name: 'Slack Alerts', 
     icon: MessageSquare, 
     category: 'Communication', 
     color: 'text-indigo-400', 
     tagline: 'Real-time networking intelligence in your team channels.',
     desc: 'Get direct messages or channel alerts whenever a VIP contact or specific industry lead is scanned.',
     longDesc: 'Stop waiting for EOD reports. Slack Alerts bring the conference floor to your team. Set up filters for "CXO" or "Fortune 500" leads and notify the right account managers on the fly.',
     features: [
       'Channel-based lead filtering',
       'Direct DM alerts for VIPs',
       'Formatted rich-text previews',
       'Click-to-CRM integration',
       'Daily activity digests'
     ],
     permissions: [
       { id: 'channels', label: 'Write to Channels', desc: 'Required to post alerts to your selected Slack channels.' },
       { id: 'users', label: 'Direct Messages', desc: 'Required to send personal alerts to individual sales reps.' }
     ],
     configFields: ['Slack Webhook URL', 'Target Channel', 'Alert Priority Threshold'],
     rating: 4.7,
     reviews: 2105,
     developer: 'Slack Technologies',
     verified: true
  }
];

export default function MarketplaceDetailPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, permissions, setup
  const [app, setApp] = useState(null);
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const foundApp = apps.find(a => a.id === appId);
    if (!foundApp) {
      navigate('/marketplace');
      return;
    }
    setApp(foundApp);
    fetchStatus(foundApp.id);
  }, [appId]);

  const fetchStatus = async (id) => {
    try {
      const res = await fetch('/api/integrations', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success && data.integrations[id]) {
        setIntegration(data.integrations[id]);
        setForm(data.integrations[id].config || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setInstalling(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ 
            appId: app.id, 
            config: form, 
            isActive: !integration?.isActive 
        })
      });
      if (res.ok) {
        fetchStatus(app.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInstalling(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="p-12 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-48 rounded"></div>
      </div>
    );
  }

  const isInstalled = !!integration?.isActive;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
        <Link to="/marketplace" className="hover:text-indigo-500 transition-colors">Marketplace</Link>
        <ChevronLeft size={12} className="rotate-180" />
        <span className="text-gray-900 dark:text-gray-100">{app.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: App Identity & Hero */}
        <div className="lg:col-span-2 space-y-10">
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white dark:bg-[#161c28] border border-gray-100 dark:border-white/10 shadow-xl flex items-center justify-center shrink-0">
               <app.icon size={56} className={app.color} />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{app.name}</h1>
                {app.verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/40">
                    <CheckCircle2 size={12} /> Verified
                  </div>
                )}
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{app.tagline}</p>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-gray-900 dark:text-white">{app.rating}</span>
                  <span className="opacity-50">({app.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Users size={16} className="text-indigo-500" />
                  <span className="text-gray-900 dark:text-white">10k+</span>
                  <span className="opacity-50">Installs</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Globe size={16} className="text-emerald-500" />
                  <span className="text-gray-900 dark:text-white">{app.developer}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-white/10 flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'permissions', label: 'Permissions', icon: Shield },
              { id: 'setup', label: 'Configuration', icon: Settings2 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
              >
                <tab.icon size={14} /> {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px] animate-in slide-in-from-left-2 duration-300">
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-body">{app.longDesc}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {app.features.map(f => (
                    <div key={f} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                  <Shield size={24} className="text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">This integration will access specific parts of your workspace to perform its duties. You can revoke this access at any time.</p>
                </div>
                <div className="space-y-3">
                  {app.permissions.map(p => (
                    <div key={p.id} className="p-5 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-white/10 rounded-2xl flex items-start gap-4 hover:border-gray-300 dark:hover:border-indigo-500/30 transition-all">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                        <Lock size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{p.label}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  {app.configFields.map(field => (
                    <div key={field}>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{field}</label>
                      <input 
                        type={field.toLowerCase().includes('token') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                        value={form[field] || ''}
                        onChange={e => setForm({...form, [field]: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all lg:placeholder:uppercase lg:placeholder:text-[9px]"
                        placeholder={`Enter your ${field.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 p-4 rounded-xl italic">
                   <Info size={14} className="text-indigo-400" />
                   {app.id === 'googlesheets' 
                     ? 'Tip: Find your Spreadsheet ID in the URL: docs.google.com/spreadsheets/d/[ID_IS_HERE]/edit'
                     : `Tip: You can find your ${app.name} credentials in your ${app.name} admin settings under "Integrations".`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Metadata Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Free</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Included in All Tiers</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleToggle}
                  disabled={installing}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isInstalled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : installing ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}
                >
                  {installing ? <RefreshCw size={18} className="animate-spin" /> : isInstalled ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                  {isInstalled ? 'Connected' : installing ? 'Linking Account...' : 'Install Integration'}
                </button>
                {isInstalled && (
                  <button 
                    onClick={handleToggle}
                    disabled={installing}
                    className="w-full py-4 bg-white dark:bg-gray-900 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Disconnect {app.name}
                  </button>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-[10px] font-black border-b border-gray-100 dark:border-white/5 pb-3">
                  <span className="text-gray-400 uppercase tracking-widest">Support</span>
                  <span className="text-gray-900 dark:text-white">Professional</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black border-b border-gray-100 dark:border-white/5 pb-3">
                  <span className="text-gray-400 uppercase tracking-widest">Last Update</span>
                  <span className="text-gray-900 dark:text-white">2 days ago</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black">
                  <span className="text-gray-400 uppercase tracking-widest">Compliance</span>
                  <div className="flex gap-1.5">
                    <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 px-1.5 py-0.5 rounded text-[8px]">SOC2</span>
                    <span className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 px-1.5 py-0.5 rounded text-[8px]">GDPR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status Card */}
          {isInstalled && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sync Active</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-400">Last Sync</span>
                  <span className="text-gray-900 dark:text-white">12s ago</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-400">Errors</span>
                  <span className="text-emerald-500">None (Healthy)</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-gray-400">Data Pipeline</span>
                   <span className="text-gray-900 dark:text-white">v2.1 Stable</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-indigo-600 rounded-3xl text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate('/setup/whatsapp')}>
             <Smartphone size={60} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform" />
             <h4 className="font-black text-sm mb-1">Need help setting up?</h4>
             <p className="text-[10px] font-medium opacity-80 leading-relaxed truncate">Read our full integration walkthrough guide.</p>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               Read Guide <ArrowRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
