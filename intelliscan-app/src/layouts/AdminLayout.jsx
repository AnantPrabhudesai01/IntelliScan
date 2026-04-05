import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import ChatbotWidget from '../components/ChatbotWidget';
import { useRole } from '../context/RoleContext';
import { resolveHomeRoute, safeReadStoredUser, setStoredUser } from '../utils/auth';
import {
  ScanLine, Home, Users, Link2, BarChart2, CreditCard,
  Settings, LogOut, Bell, Sun, Moon, Menu, User as UserIcon, Crown, Activity,
  Shield, Database, Cpu, Webhook, Briefcase, FileText, ChevronDown, ChevronRight,
  X, Key, Globe, Bell as BellIcon, Lock, Mail, Smartphone, Save, Check, AlertTriangle, Building, MessageSquare, GitCommit, ListTree, Zap, Layers, Trophy, Calendar
} from 'lucide-react';

const businessAdminNav = [
  { section: 'Overview', items: [
    { to: '/workspace/dashboard',      label: 'Dashboard',      icon: Home       },
    { to: '/workspace/contacts',       label: 'All Contacts',   icon: Users      },
    { to: '/workspace/members',        label: 'Members',        icon: UserIcon   },
    { to: '/workspace/pipeline',       label: 'Sales Pipeline', icon: Layers     },
    { to: '/workspace/scanner-links',  label: 'Scanner Links',  icon: Link2      },
  ]},
  { section: 'Integrations', items: [
    { to: '/workspace/crm-mapping',    label: 'CRM Mapping',    icon: Database   },
    { to: '/workspace/routing-rules',  label: 'Lead Routing',   icon: GitCommit  },
    { to: '/workspace/shared',         label: 'Shared Rolodex', icon: Users      },
    { to: '/workspace/webhooks',       label: 'Webhook Config', icon: Webhook    },
    { to: '/workspace/data-quality',   label: 'Data Quality',   icon: Shield     },
  ]},
  { section: 'Management', items: [
    { to: '/dashboard/calendar',    label: 'Calendar',      icon: Calendar },
    { to: '/dashboard/leaderboard', label: 'Leaderboard',   icon: Trophy },
    { to: '/dashboard/events',      label: 'Legacy Events', icon: ListTree },
    { to: '/workspace/campaigns',      label: 'Email Campaigns',icon: Mail       },
    { to: '/workspace/billing',        label: 'Billing',        icon: CreditCard },
    { to: '/workspace/data-policies',  label: 'Data Policies',  icon: Shield     },
    { to: '/workspace/settings',       label: 'Settings',       icon: Settings   },
  ]}
];

const superAdminNav = [
  { section: 'Core Platform', items: [
    { to: '/admin/dashboard',          label: 'Platform Overview', icon: Crown    },
    { to: '/workspaces-organizations-super-admin', label: 'Organizations', icon: Briefcase },
    { to: '/system-health-super-admin',   label: 'System Health',     icon: Activity },
    { to: '/admin/incidents',             label: 'Incidents',         icon: AlertTriangle },
    { to: '/admin/feedback',              label: 'User Feedback',     icon: MessageSquare },
  ]},
  { section: 'AI Engine', items: [
    { to: '/admin/engine-performance', label: 'Performance',       icon: BarChart2 },
    { to: '/admin/custom-models',      label: 'Custom Models',     icon: Cpu },
    { to: '/admin/integration-health', label: 'Integration Health',icon: Database },
    { to: '/ai-training-tuning-super-admin', label: 'Model Tuning',    icon: Cpu },
    { to: '/ai-model-versioning-rollback',  label: 'Versioning',      icon: Database },
  ]},
  { section: 'Security & Auth', items: [
    { to: '/audit-logs-security',          label: 'Audit Logs',      icon: Shield },
    { to: '/privacy-gdpr-command-center',   label: 'GDPR Center',     icon: FileText },
    { to: '/advanced-security-audit-logs-1', label: 'Adv. Security',   icon: Shield },
  ]},
  { section: 'API & Developers', items: [
    { to: '/advanced-api-explorer-sandbox', label: 'API Sandbox',     icon: Webhook },
    { to: '/api-integrations',            label: 'Integrations',    icon: Link2 },
    { to: '/advanced-api-webhook-monitor',  label: 'Webhooks',        icon: Activity },
  ]}
];

function AdminSettingsPanel({ user, role, onClose, onSave, toggleDark, isDark }) {
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user.name || 'Admin User',
    email: user.email || 'admin@company.com',
    phone: user.phone || '+1 (555) 000-0000',
    timezone: user.timezone || 'UTC+0',
    notifications_email: true,
    notifications_security: true,
    notifications_system: true,
    two_factor: false,
    session_timeout: '30',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: Lock },
    ...(role === 'super_admin' ? [{ id: 'platform', label: 'Platform', icon: Globe }] : []),
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{form.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${role === 'super_admin' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                {role === 'super_admin' ? 'Super Admin' : 'Enterprise Admin'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={22} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/10 px-6 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${tab === t.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {tab === 'profile' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timezone</label>
                  <select value={form.timezone} onChange={e => setForm(f => ({...f, timezone: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {['UTC-8 (Pacific)', 'UTC-5 (Eastern)', 'UTC+0 (London)', 'UTC+1 (Berlin)', 'UTC+5:30 (India)', 'UTC+8 (Singapore)', 'UTC+10 (Sydney)'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  <strong>Role:</strong> {role === 'super_admin' ? 'Super Admin — Full platform access with infrastructure control' : 'Business Admin — Workspace management and team analytics'}
                </p>
              </div>
            </>
          )}
          {tab === 'notifications' && (
            <div className="space-y-4">
              {[
                { key: 'notifications_email', label: 'Email Notifications', desc: 'Receive system alerts and summaries by email' },
                { key: 'notifications_security', label: 'Security Alerts', desc: 'Get notified of suspicious login attempts or policy violations' },
                { key: 'notifications_system', label: 'System Events', desc: 'Infrastructure state changes, scaling events, rollbacks' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all relative ${form[item.key] ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    onClick={() => setForm(f => ({...f, [item.key]: !f[item.key]}))}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form[item.key] ? 'left-7' : 'left-1'}`} />
                  </div>
                </label>
              ))}
            </div>
          )}
          {tab === 'security' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of login security via authenticator app</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all relative ${form.two_factor ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                  onClick={() => setForm(f => ({...f, two_factor: !f.two_factor}))}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.two_factor ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Session Timeout</p>
                <select value={form.session_timeout} onChange={e => setForm(f => ({...f, session_timeout: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                  {['15', '30', '60', '120'].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 flex gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Last sign-in: Today at 03:08 from Windows · Chrome 124. <span className="font-bold underline cursor-pointer">View all sessions</span></p>
              </div>
            </div>
          )}
          {tab === 'platform' && role === 'super_admin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <p className="text-xs text-amber-400 font-bold">Super Admin Only — Platform-wide settings</p>
              </div>
              {[
                { icon: Globe, label: 'Default Scan Region', desc: 'Primary inference region for new organizations', val: 'US-East' },
                { icon: Database, label: 'Data Residency Policy', desc: 'Controls where user scan data is stored', val: 'EU-Compliant (GDPR)' },
                { icon: Key, label: 'Platform API Rate Limit', desc: 'Max API calls per workspace per minute', val: '2,000 req/min' },
                { icon: Building, label: 'Max Orgs per License Tier', desc: 'Enterprise plan organization cap', val: '500 orgs' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">{item.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Global Announcement Email</p>
                    <p className="text-xs text-gray-500 mt-0.5">Send a platform-wide notice to all organization admins</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">
                  Compose
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <button onClick={toggleDark} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, role = 'business_admin' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const { signOut } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navGroups = role === 'super_admin' ? superAdminNav : businessAdminNav;

  const [user, setUser] = useState(safeReadStoredUser() || { name: 'Admin User', email: 'admin@company.com' });
  const homePath = resolveHomeRoute({ role: user?.role || role });

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  const handleSaveSettings = (form) => {
    const updated = { ...user, ...form };
    setUser(updated);
    setStoredUser(updated);
  };

  const NOTIFS = [
    { type: 'warn', msg: 'EU-Central node latency exceeded 150ms', time: '2m ago' },
    { type: 'info', msg: "Workspace 'Quantum_AI' migrated to NODE_04", time: '8m ago' },
    { type: 'err',  msg: 'DB replication timeout on AS-South cluster', time: '14m ago' },
    { type: 'info', msg: 'OCR confidence score reached 98.4% avg', time: '31m ago' },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link to={homePath} className="flex items-center gap-2">
          <ScanLine size={22} className="text-indigo-600" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">IntelliScan</span>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-1 rounded w-full flex justify-center tracking-wider
          ${role === 'super_admin'
            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
          {role === 'super_admin' ? 'SUPER ADMIN' : 'ENTERPRISE ADMIN'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto style-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{group.section}</h4>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                    ${location.pathname === to
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}>
                  {Icon && <Icon size={16} />}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0 bg-gray-50 dark:bg-gray-900/50">
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${role === 'super_admin' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                    {role === 'super_admin' ? 'Super Admin' : 'Workspace Admin'}
                  </span>
                </div>
              </div>

              <button onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 font-medium"><Settings size={15} /> Settings</div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button onClick={() => { setNotifOpen(true); setProfileOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center gap-3 font-medium"><BellIcon size={15} /> Notifications <span className="ml-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{NOTIFS.length}</span></div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 font-medium">
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </div>
              </button>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-body">
      {settingsOpen && (
        <AdminSettingsPanel
          user={user} role={role}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
          toggleDark={toggle} isDark={isDark}
        />
      )}
      {notifOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
          <div className="bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-white/10 rounded-2xl w-full sm:w-96 sm:mr-4 sm:mb-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={18} /></button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
              {NOTIFS.map((n, i) => (
                <div key={i} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'err' ? 'bg-red-500' : n.type === 'warn' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{n.msg}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 dark:border-white/10 text-center">
              <button className="text-xs text-indigo-500 font-bold hover:underline">Mark all as read</button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex-col shadow-sm z-10">
        {renderSidebarContent()}
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-gray-950 flex flex-col shadow-2xl animate-in slide-in-from-left">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-indigo-600" />
            <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">IntelliScan Enterprise</span>
          </div>
          <button onClick={() => setNotifOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .style-scrollbar::-webkit-scrollbar { width: 4px; }
        .style-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .style-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
        .dark .style-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(75, 85, 99, 0.4); }
      `}} />
      <ChatbotWidget role={role} />
    </div>
  );
}
