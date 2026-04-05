import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScanLine, Users, Settings, LogOut, Bell, Sun, Moon, Zap, Store, MessageSquare, UploadCloud, Calendar, Mail, Menu, User, ChevronDown, Target, Smartphone, X, BarChart2, ListTree, Monitor, Sparkles, Palette, Trophy, Layers, Webhook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import ChatbotWidget from '../components/ChatbotWidget';
import SignalsCard from '../components/SignalsCard';
import { useRole } from '../context/RoleContext';
import { getStoredToken, safeReadStoredUser } from '../utils/auth';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const { signOut } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [quota, setQuota] = useState({ used: 0, limit: 100, tier: 'personal' });

  const user = safeReadStoredUser() || { name: 'Guest', email: 'guest@intelliscan.pro', role: 'anonymous' };

  const workspaceTag =
    user?.role === 'super_admin'
      ? 'ADM'
      : quota?.tier === 'enterprise'
        ? 'ENT'
        : quota?.tier === 'pro'
          ? 'PRO'
          : 'FREE';

  // Dynamic Navigation Items based on tier
  const dynamicNavItems = [
    { to: '/dashboard/scan',        label: 'Scan',          icon: ScanLine },
    { to: '/dashboard/contacts',    label: 'Contacts',      icon: Users    },
    { to: '/dashboard/calendar',    label: 'Calendar',      icon: Calendar },
    { to: '/dashboard/leaderboard', label: 'Leaderboard',   icon: Trophy   },
    { to: '/dashboard/events',      label: 'Legacy Events', icon: ListTree },
    { to: '/dashboard/drafts',      label: 'AI Drafts',     icon: Mail },
    { to: '/dashboard/coach',       label: 'AI Coach',      icon: Target },
    { to: '/dashboard/email-marketing', label: 'Email Marketing', icon: Mail },
    { to: '/dashboard/email/sequences', label: 'AI Sequences', icon: Zap, tag: 'NEW' },
    { to: '/workspace/analytics', label: 'Analytics', icon: BarChart2, tag: workspaceTag },
    { to: '/workspace/org-chart', label: 'Org Chart', icon: ListTree, tag: workspaceTag },
    { to: '/dashboard/presence',    label: 'Meeting Presence', icon: Monitor },
    { to: '/dashboard/kiosk',       label: 'Event Kiosk',   icon: Sparkles  },
    { to: '/dashboard/my-card',     label: 'Digital Card',  icon: Smartphone },
    { to: '/dashboard/card-creator', label: 'Card Creator',  icon: Palette },
    { to: '/marketplace',           label: 'Apps',          icon: Store    },
    { to: '/dashboard/feedback',    label: 'Feedback',      icon: MessageSquare },
    { to: '/dashboard/settings',    label: 'Settings',      icon: Settings },
  ];

  const isEnterpriseOrHigher = quota?.tier === 'enterprise' || user?.role === 'business_admin' || user?.role === 'super_admin';
  const isProOrHigher = isEnterpriseOrHigher || quota?.tier === 'pro';
  const enterpriseOnlyLabels = ['Email Marketing', 'Analytics', 'Org Chart', 'Meeting Presence', 'Event Kiosk', 'Apps'];
  const proOrHigherLabels = ['Card Creator'];
  
  const filteredNavItems = dynamicNavItems.filter(item => {
    if (enterpriseOnlyLabels.includes(item.label) && !isEnterpriseOrHigher) return false;
    if (proOrHigherLabels.includes(item.label) && !isProOrHigher) return false;
    return true;
  });


  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  useEffect(() => {
    const fetchQuota = async () => {
      const token = getStoredToken();
      if (!token) return;
      try {
        const res = await fetch('/api/user/quota', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuota(data);
        }
      } catch (err) {
        console.error('Failed to fetch quota:', err);
      }
    };
    fetchQuota();

    const handleQuotaUpdate = () => fetchQuota();
    window.addEventListener('quota-update', handleQuotaUpdate);
    return () => window.removeEventListener('quota-update', handleQuotaUpdate);
  }, [location.pathname]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Logo header inside sidebar */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link to="/dashboard/scan" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ScanLine className="text-white" size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">IntelliScan</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>
          <div className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  location.pathname === item.to
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={location.pathname === item.to ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'} />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-tighter ${
                    location.pathname === item.to ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </Link>
            ))}
          </div>

      {/* Plan Status */}
      <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-2">Plan Status</div>
        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
          {quota.tier === 'enterprise' ? 'ENTERPRISE PLAN' : quota.tier === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}
        </h4>
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Credit Points</span>
            <span className="font-bold text-gray-900 dark:text-white">{quota.used} / {quota.limit}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}></div>
          </div>
        </div>
        <Link to="/subscription-plan-comparison" className="w-full py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:shadow-md transition-all">
          <Zap size={14} className="text-amber-500" fill="currentColor" /> Upgrade
        </Link>
      </div>

      {/* Profile */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{user.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-body overflow-hidden">
      {/* Inline sidebar — pushes content right, no overlay, no double-header */}
      {sidebarOpen && (
        <aside className="w-64 shrink-0 bg-white dark:bg-gray-950 flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-sm overflow-y-auto">
          {renderSidebarContent()}
        </aside>
      )}


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Universal Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <Menu size={22} />
            </button>
            {/* Hide logo in header when sidebar is open — sidebar has its own logo */}
            {!sidebarOpen && (
              <Link to="/dashboard/scan" className="flex items-center gap-2">
                <ScanLine size={22} className="text-indigo-600" />
                <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">IntelliScan</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quota & Upgrade Section (Desktop only for header) */}
            <div className="hidden sm:flex items-center gap-2 relative">
              <button 
                onClick={() => setQuotaOpen(!quotaOpen)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors ${quota.tier === 'enterprise' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {quota.tier === 'enterprise' ? 'ENTERPRISE' : 'FREE'} <ChevronDown size={14} />
              </button>
              
              {quotaOpen && (
                <div className="absolute top-10 right-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Plan Quota</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{quota.limit > quota.used ? `${quota.limit - quota.used} Credits Left` : 'Quota Exceeded'}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Credits Used</span>
                      <span className="font-bold text-gray-900 dark:text-white">{quota.used} / {quota.limit}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4">You are on the free tier. Upgrade for unlimited automated data extraction and bulk Excel exports.</p>
                  <Link to="/subscription-plan-comparison" onClick={() => setQuotaOpen(false)} className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    View Enterprise Plans
                  </Link>
                </div>
              )}

              <Link to="/subscription-plan-comparison" className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition-all shadow-amber-500/20">
                <Zap size={12} fill="currentColor" /> Upgrade
              </Link>
            </div>

            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden sm:block">
              <Bell size={18} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); setQuotaOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={toggle}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </div>
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto h-full">
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
      <ChatbotWidget role="user" />
    </div>
  );
}
