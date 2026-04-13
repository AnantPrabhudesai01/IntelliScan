import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ChatbotWidget from '../components/ChatbotWidget';
import { useRole } from '../context/RoleContext';
import { resolveHomeRoute, safeReadStoredUser, setStoredUser } from '../utils/auth';
import {
  ScanLine, Home, Users, Link2, BarChart2, CreditCard,
  Settings, LogOut, Bell, Sun, Moon, Menu, User as UserIcon, Crown, Activity,
  Shield, Database, Cpu, Webhook, Briefcase, FileText, ChevronDown, ChevronRight,
  X, Key, Globe, Bell as BellIcon, Lock, Mail, Smartphone, Save, Check, AlertTriangle, Building, MessageSquare, GitCommit, ListTree, Zap, Layers, Trophy, Calendar
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from '../components/NotificationCenter';

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

function AdminSettingsPanel({ user, role, onClose, onSave, toggleDark, isDarkMode }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-base">{form.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Account Settings</h2>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-brand-50 text-brand-600'}`}>
                {role === 'super_admin' ? 'Super Admin' : 'Enterprise Admin'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-5 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${tab === t.id ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'profile' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand/40 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand/40 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand/40 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timezone</label>
                  <select value={form.timezone} onChange={e => setForm(f => ({...f, timezone: e.target.value}))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand/40 outline-none">
                    {['UTC-8 (Pacific)', 'UTC-5 (Eastern)', 'UTC+0 (London)', 'UTC+1 (Berlin)', 'UTC+5:30 (India)', 'UTC+8 (Singapore)', 'UTC+10 (Sydney)'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800/30">
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                  <strong>Role:</strong> {role === 'super_admin' ? 'Super Admin — Full platform access with infrastructure control' : 'Business Admin — Workspace management and team analytics'}
                </p>
              </div>
            </>
          )}
          {tab === 'notifications' && (
            <div className="space-y-3">
              {[
                { key: 'notifications_email', label: 'Email Notifications', desc: 'Receive system alerts and summaries by email' },
                { key: 'notifications_security', label: 'Security Alerts', desc: 'Get notified of suspicious login attempts or policy violations' },
                { key: 'notifications_system', label: 'System Events', desc: 'Infrastructure state changes, scaling events, rollbacks' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${form[item.key] ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-700'}`}
                    onClick={() => setForm(f => ({...f, [item.key]: !f[item.key]}))}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[item.key] ? 'left-[22px]' : 'left-0.5'}`} />
                  </div>
                </label>
              ))}
            </div>
          )}
          {tab === 'security' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-brand" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of login security via authenticator app</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${form.two_factor ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-700'}`}
                  onClick={() => setForm(f => ({...f, two_factor: !f.two_factor}))}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.two_factor ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
              </label>
              <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Session Timeout</p>
                <select value={form.session_timeout} onChange={e => setForm(f => ({...f, session_timeout: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/40">
                  {['15', '30', '60', '120'].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20 flex gap-2">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Last sign-in: Today at 03:08 from Windows · Chrome 124. <span className="font-bold underline cursor-pointer">View all sessions</span></p>
              </div>
            </div>
          )}
          {tab === 'platform' && role === 'super_admin' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-amber-400" />
                <p className="text-[10px] text-amber-400 font-bold">Super Admin Only — Platform-wide settings</p>
              </div>
              {[
                { icon: Globe, label: 'Default Scan Region', desc: 'Primary inference region for new organizations', val: 'US-East' },
                { icon: Database, label: 'Data Residency Policy', desc: 'Controls where user scan data is stored', val: 'EU-Compliant (GDPR)' },
                { icon: Key, label: 'Platform API Rate Limit', desc: 'Max API calls per workspace per minute', val: '2,000 req/min' },
                { icon: Building, label: 'Max Orgs per License Tier', desc: 'Enterprise plan organization cap', val: '500 orgs' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2.5">
                    <item.icon size={15} className="text-brand" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-1 rounded-md">{item.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-brand" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Global Announcement Email</p>
                    <p className="text-xs text-gray-500 mt-0.5">Send a platform-wide notice to all organization admins</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-brand border border-brand/30 px-3 py-1 rounded-md hover:bg-brand/10 transition-all">
                  Compose
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <button onClick={toggleDark} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 ${saved ? 'bg-green-600 text-white' : 'bg-brand hover:bg-brand-light text-white'}`}>
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, role = 'business_admin' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useRole();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const { unreadCount } = useNotifications();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileOpen]);

  const renderSidebarContent = ({ isMobile = false } = {}) => (
    <div className="flex flex-col h-full bg-[#21132E] text-white select-none">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#3D2650] shrink-0">
        <Link to={homePath} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <ScanLine size={18} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">IntelliScan</span>
        </Link>
        {isMobile && (
          <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto p-1.5 text-sidebar-text hover:text-white rounded-md hover:bg-sidebar-hover transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role Badge */}
      <div className="px-3 pt-3 pb-1.5 shrink-0">
        <span className={`text-[9px] font-bold px-2 py-1 rounded w-full flex justify-center tracking-wider
          ${role === 'super_admin'
            ? 'bg-purple-500/20 text-purple-300'
            : 'bg-brand/30 text-brand-200'}`}>
          {role === 'super_admin' ? 'SUPER ADMIN' : 'ENTERPRISE ADMIN'}
        </span>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto sidebar-scroll">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h4 className="px-3 text-[9px] font-bold text-sidebar-text/60 uppercase tracking-widest mb-1.5">{group.section}</h4>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    onClick={() => isMobile && setMobileSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative
                      ${isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}`}>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-light rounded-r-full" />}
                    {Icon && <Icon size={16} className={isActive ? 'text-brand-light' : 'text-sidebar-text'} />}
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Footer */}
      <div className="border-t border-[#3D2650] p-3 shrink-0">
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-hover transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-text truncate">{user.email}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
                    <span className="text-white font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-brand-50 text-brand-600'}`}>
                    {role === 'super_admin' ? 'Super Admin' : 'Workspace Admin'}
                  </span>
                </div>
              </div>

              <button onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2.5 font-medium"><Settings size={14} /> Settings</div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button onClick={() => { setNotifOpen(true); setProfileOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center gap-2.5 font-medium">
                  <BellIcon size={14} /> Notifications 
                  {unreadCount > 0 && (
                    <span className="ml-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 font-medium">
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
              </button>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0F0F0] dark:bg-[#111118] font-body">
      {settingsOpen && (
        <AdminSettingsPanel
          user={user} role={role}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
          toggleDark={toggleTheme} isDarkMode={isDarkMode}
        />
      )}
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Desktop Sidebar — always visible */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col shadow-lg z-10">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col shadow-2xl z-10">
            {renderSidebarContent({ isMobile: true })}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-12 flex items-center justify-between px-4 bg-white dark:bg-[#1A1A2E] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-brand" />
            <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">IntelliScan Admin</span>
          </div>
          <button onClick={() => setNotifOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </button>
        </header>

        {/* Desktop Slim Header */}
        <header className="hidden lg:flex h-12 items-center justify-between px-5 bg-white dark:bg-[#1A1A2E] border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-gray-400 dark:text-gray-500">{role === 'super_admin' ? 'Platform' : 'Workspace'}</span>
            <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
            <span className="font-semibold text-gray-800 dark:text-white capitalize">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative">
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <ChatbotWidget role={role} />
    </div>
  );
}
