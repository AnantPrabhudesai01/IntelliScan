import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ScanLine, Users, Settings, LogOut, Bell, Sun, Moon, Zap, Store, MessageSquare, UploadCloud, Calendar, Mail, Menu, User, ChevronDown, Target, Smartphone, X, BarChart2, ListTree, Monitor, Sparkles, Palette, Trophy, Layers, Webhook, Search, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ChatbotWidget from '../components/ChatbotWidget';
import SignalsCard from '../components/SignalsCard';
import { useRole } from '../context/RoleContext';
import { getStoredToken, safeReadStoredUser } from '../utils/auth';
import LanguageToggle from '../components/LanguageToggle';
import SidebarSwitcher from '../components/layout/SidebarSwitcher';

import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from '../components/NotificationCenter';

export default function DashboardLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { role, tier, isPro, isEnterprise, refreshAuth, signOut } = useRole();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [quota, setQuota] = useState({ used: 0, limit: 100, tier: 'personal' });

  const user = safeReadStoredUser() || { 
    name: 'Guest', 
    email: 'guest@intelliscan.pro', 
    role: role || 'anonymous',
    tier: tier || 'personal'
  };


  const workspaceTag =
    role === 'super_admin'
      ? 'ADM'
      : isEnterprise
        ? 'ENT'
        : isPro
          ? 'PRO'
          : 'FREE';

  const dynamicNavItems = [
    { to: '/dashboard/scan',        label: 'Scan',          icon: ScanLine },
    { to: '/dashboard/contacts',    label: 'Contacts',      icon: Users    },
    { to: '/dashboard/calendar',    label: 'Calendar',      icon: Calendar },
    { to: '/dashboard/leaderboard', label: 'Leaderboard',   icon: Trophy   },
    { to: '/dashboard/events',      label: 'Legacy Events', icon: ListTree },
    { to: '/dashboard/drafts',      label: 'AI Drafts',     icon: Mail },
    { to: '/dashboard/coach',       label: 'AI Coach',      icon: Target },
    { to: '/dashboard/email-marketing', label: 'Email Marketing', icon: Mail },
    { to: '/dashboard/email-marketing/automations', label: 'AI Sequences', icon: Zap, tag: 'NEW' },
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

  const isEnterpriseOrHigher = isEnterprise;
  const isProOrHigher = isEnterprise || isPro;

  // Plan gating (matches project docs: Free should not show Pro/Enterprise-only modules)
  const enterpriseOnlyLabels = ['Leaderboard', 'Analytics', 'Org Chart', 'Pipeline', 'Members'];
  const proOrHigherLabels = ['Calendar', 'AI Coach', 'Email Marketing', 'AI Sequences', 'Meeting Presence', 'Event Kiosk', 'Digital Card', 'Card Creator', 'Apps'];
  
  const processedNavItems = dynamicNavItems
    .map(item => {
      const isEnterpriseOnly = enterpriseOnlyLabels.includes(item.label);
      const isProOnly = proOrHigherLabels.includes(item.label);
      
      let isLocked = false;
      if (isEnterpriseOnly && !isEnterpriseOrHigher) isLocked = true;
      if (isProOnly && !isProOrHigher) isLocked = true;
      
      return { ...item, isLocked, isEnterpriseOnly, isProOnly };
    })
    .filter(item => {
      // If user is Free (not Pro or Enterprise), hide all Enterprise-only items
      // and hide most Pro-only items to reduce clutter (keep maybe 1-2 for upsell or hide all if user requested)
      if (!isProOrHigher) {
        if (item.isEnterpriseOnly) return false;
        if (item.isProOnly) {
          // Keep only 'Card Creator' and 'Apps' as teaser/upsell, hide others
          const teaserLabels = ['Card Creator', 'Apps'];
          return teaserLabels.includes(item.label);
        }
      }
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
        const res = await fetch(`/api/user/quota?cb=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuota(data);
          
          // Trigger role refresh if backend has a higher tier
          if (data.tierMatch === false) {
            console.log('[Dashboard] Tier mismatch detected. Synchronizing profile...');
            await refreshAuth();
            // Re-fetch quota once profile is synced to ensure we have the correct tier-based limits
            const freshRes = await fetch('/api/user/quota', {
              headers: { Authorization: `Bearer ${getStoredToken()}` }
            });
            if (freshRes.ok) {
              const freshData = await freshRes.json();
              setQuota(freshData);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch quota:', err);
      }
    };

    fetchQuota();
    
    // Refresh quota every 2 minutes or on specific events instead of every page click
    const pollInterval = setInterval(fetchQuota, 120000);

    const handleQuotaUpdate = () => fetchQuota();
    window.addEventListener('quota-update', handleQuotaUpdate);

    // PWA Install Logic
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('quota-update', handleQuotaUpdate);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Only on mount

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = () => { setProfileOpen(false); setQuotaOpen(false); };
    if (profileOpen || quotaOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileOpen, quotaOpen]);

  const sidebarWidth = sidebarCollapsed ? 'w-[68px]' : 'w-60';

  const renderSidebarContent = ({ isMobile = false } = {}) => (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-white select-none transition-colors duration-300">
      {/* Logo */}
      <div className={`h-14 flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center px-2' : 'px-4'} border-b border-[var(--sidebar-border)] shrink-0`}>
        <Link to="/dashboard/scan" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <ScanLine className="text-white" size={18} />
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <span className="font-headline font-black text-lg tracking-tighter text-white truncate">INTELLISCAN</span>
          )}
        </Link>
        {isMobile && (
          <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto p-1.5 text-sidebar-text hover:text-white rounded-md hover:bg-sidebar-hover transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <SidebarSwitcher activeMode="personal" collapsed={sidebarCollapsed} isMobile={isMobile} />

      {/* Nav Items */}
      <nav className={`flex-1 ${sidebarCollapsed && !isMobile ? 'px-1.5' : 'px-2.5'} py-3 overflow-y-auto sidebar-scroll space-y-0.5`}>
        {processedNavItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.isLocked ? '/subscription-plan-comparison' : item.to}
              onClick={() => {
                if (isMobile) setMobileSidebarOpen(false);
                if (item.isLocked) {
                  console.log(`[Gate] Redirecting to upgrade for ${item.label}`);
                }
              }}
              title={sidebarCollapsed && !isMobile ? item.label : undefined}
              className={`flex items-center gap-2.5 ${sidebarCollapsed && !isMobile ? 'justify-center px-2 py-2.5' : 'px-3 py-2'} rounded-md text-[13px] font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : item.isLocked 
                    ? 'text-sidebar-text/50 hover:bg-white/5 cursor-pointer'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-light rounded-r-full" />
              )}
              <div className="relative">
                <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-brand-light' : 'text-sidebar-text group-hover:text-white'} ${item.isLocked ? 'opacity-40' : ''}`} />
                {item.isLocked && (
                  <div className="absolute -top-1 -right-1 bg-[var(--sidebar-bg)] rounded-full p-0.5 border border-[var(--sidebar-border)]">
                    <Zap size={8} className="text-brand-light fill-brand-light" />
                  </div>
                )}
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <>
                  <span className={`truncate flex-1 ${item.isLocked ? 'text-white/40' : ''}`}>{item.label}</span>
                  {item.isLocked ? (
                    <span className="text-[7px] font-black px-1 py-0.5 bg-brand/20 text-brand-light rounded border border-brand/30 uppercase tracking-tighter">Pro</span>
                  ) : item.tag && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight ${
                      item.tag === 'NEW' ? 'bg-green-500/20 text-green-300' : 'bg-brand/30 text-brand-200'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Status — only when expanded */}
      {(!sidebarCollapsed || isMobile) && (
        <div className="px-3 pb-3 border-t border-[var(--sidebar-border)] pt-3">
          {/* PWA Install Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full mb-3 py-2 bg-white/5 hover:bg-white/10 text-brand-light border border-brand/30 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all animate-pulse"
            >
              <Smartphone size={14} /> Install Mobile App
            </button>
          )}

          <div className="bg-[var(--sidebar-hover)] rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase text-sidebar-text tracking-wider">
                {isEnterprise ? 'Enterprise Plan' : 
                 isPro ? 'Pro Plan' : 
                 (quota.tier === 'enterprise' ? 'Enterprise Plan' : 
                  quota.tier === 'pro' ? 'Pro Plan' : 
                  'Free Plan')}
              </span>
              <span className="text-[10px] font-bold text-brand-light">{quota.used}/{Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100))}</span>
            </div>
            <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mb-2.5">
              <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${Math.min((quota.used / Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100))) * 100, 100)}%` }} />
            </div>
            {!isProOrHigher && (
              <Link to="/subscription-plan-comparison" className="w-full py-1.5 bg-brand hover:bg-brand-light text-white font-semibold text-[11px] rounded-md flex items-center justify-center gap-1.5 transition-colors">
                <Zap size={12} /> Upgrade
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Profile */}
      <div className={`border-t border-[var(--sidebar-border)] ${sidebarCollapsed && !isMobile ? 'p-2' : 'p-3'} shrink-0`}>
        <div className={`flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : 'gap-2.5'} py-1`}>
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-text truncate">{user.email}</p>
            </div>
          )}
        </div>
        <p className="px-3 text-[8px] font-black uppercase tracking-[0.3em] text-white/20 pb-2">v1.2.0-SyncFixed</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--surface)] dark:bg-[var(--surface)] font-body overflow-hidden transition-colors duration-300">
      {/* ── Desktop Sidebar (always visible) ── */}
      <aside className={`hidden lg:flex ${sidebarWidth} flex-shrink-0 flex-col transition-all duration-200 border-r border-[var(--sidebar-border)] shadow-lg z-20`}>
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col border-r border-[var(--sidebar-border)] shadow-2xl z-10">
            {renderSidebarContent({ isMobile: true })}
          </aside>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Enterprise Top Header */}
        <header className="h-12 flex items-center justify-between px-4 bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Menu size={20} />
            </button>
            {/* Desktop collapse toggle */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb-style page title */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-gray-400 dark:text-gray-500">Dashboard</span>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
              <span className="font-semibold text-gray-800 dark:text-white capitalize">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quota Badge */}
            <div className="hidden sm:flex items-center relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setQuotaOpen(!quotaOpen); setProfileOpen(false); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand text-gray-600 dark:text-gray-300 transition-colors"
              >
                {isEnterprise ? 'Enterprise' : isPro ? 'Pro' : (quota.tier === 'enterprise' ? 'Enterprise' : quota.tier === 'pro' ? 'Pro' : 'Free')}
                <ChevronDown size={12} />
              </button>
              
              {quotaOpen && (
                <div className="absolute top-9 right-0 w-60 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-4 z-50 animate-fade-in premium-grain">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan Quota</span>
                    {/* Use local limit fallback to avoid 0/100 flash */}
                    <span className="text-[10px] font-bold text-brand">
                      {Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100)) > quota.used ? `${Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100)) - quota.used} Left` : 'Exceeded'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Credits Used</span>
                      <span className="font-bold text-gray-900 dark:text-white">{quota.used} / {Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100))}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${Math.min((quota.used / Math.max(quota.limit, (isEnterprise ? 1000000 : isPro ? 5000 : 100))) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <Link to="/subscription-plan-comparison" onClick={() => setQuotaOpen(false)} className="w-full py-1.5 bg-brand/10 text-brand font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 hover:bg-brand/20 transition-colors">
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Upgrade */}
            <Link to="/subscription-plan-comparison" className="hidden sm:flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand hover:bg-brand-light text-white transition-colors">
              <Zap size={11} /> Upgrade
            </Link>

            {/* Notifications */}
            <button 
              onClick={() => setNotifOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1A1A2E]" />
              )}
            </button>

            <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

            {/* Dark Mode */}
            <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); setQuotaOpen(false); }}
                className="flex items-center gap-1.5 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{user.name.charAt(0)}</span>
                </div>
                <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl py-1 z-50 animate-fade-in premium-grain">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Settings size={15} /> Settings
                  </Link>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatbotWidget role="user" />
    </div>
  );
}
