# IntelliScan — CRITICAL TECHNICAL ADDENDUM
## 4 Mandatory Architectural Rules — Append to Main Screen Prompt

> This is a MANDATORY addendum. Paste this AFTER the 15-screen prompt. These 4 rules override any conflicting patterns Stitch would use by default. Every rule below is NON-NEGOTIABLE.

---

## ⚠️ RULE 1 — ICONOGRAPHY: lucide-react ONLY

You must use `lucide-react` exclusively for every single icon across all 15 screens. No other icon library (react-icons, heroicons, FontAwesome, MUI icons, etc.) is permitted anywhere in the codebase.

Install: `npm install lucide-react`

### Complete Icon Mapping — Use These Exact Names

| UI Element | lucide-react Component |
|---|---|
| Home / Dashboard | `<Home />` |
| Contacts / People | `<Users />` |
| Single User / Avatar | `<User />` |
| Building / Company | `<Building2 />` |
| Scanner / Scan action | `<ScanLine />` |
| Camera | `<Camera />` |
| Upload / File | `<Upload />` |
| Link / URL | `<Link2 />` |
| QR Code | `<QrCode />` |
| Analytics / Chart | `<BarChart2 />` |
| Billing / Credit Card | `<CreditCard />` |
| Settings / Gear | `<Settings />` |
| Sign Out / Logout | `<LogOut />` |
| Copy to clipboard | `<Copy />` |
| Edit / Pencil | `<Pencil />` |
| Delete / Trash | `<Trash2 />` |
| Add / Plus | `<Plus />` |
| Close / X | `<X />` |
| Check / Success | `<Check />` |
| Warning / Alert | `<AlertTriangle />` |
| Info | `<Info />` |
| Email / Mail | `<Mail />` |
| Phone | `<Phone />` |
| Globe / Website | `<Globe />` |
| Location / Address | `<MapPin />` |
| LinkedIn | `<Linkedin />` |
| Search | `<Search />` |
| Filter | `<Filter />` |
| Download / Export | `<Download />` |
| More options (⋮) | `<MoreVertical />` |
| Chevron Right | `<ChevronRight />` |
| Chevron Down | `<ChevronDown />` |
| External Link | `<ExternalLink />` |
| Star / Favorite | `<Star />` |
| Sun (light mode) | `<Sun />` |
| Moon (dark mode) | `<Moon />` |
| Menu (hamburger) | `<Menu />` |
| Bell / Notifications | `<Bell />` |
| Shield / Security | `<Shield />` |
| Zap / Fast | `<Zap />` |
| Activity / Health | `<Activity />` |
| Key | `<Key />` |
| Lock | `<Lock />` |
| Refresh | `<RefreshCw />` |
| Eye (show password) | `<Eye />` |
| Eye Off (hide pwd) | `<EyeOff />` |
| Send (invite) | `<Send />` |
| Image | `<Image />` |
| File Text | `<FileText />` |
| Workspace / Office | `<Briefcase />` |
| Crown / Admin | `<Crown />` |
| Toggle / Switch | `<ToggleRight />` |

### Usage Pattern
```jsx
import { Home, Users, ScanLine, Trash2 } from 'lucide-react';

// Always pass size and className — never use default size alone
<Home size={20} className="text-gray-500 dark:text-gray-400" />
<ScanLine size={24} className="text-indigo-600" />
```

---

## ⚠️ RULE 2 — DRY LAYOUT ARCHITECTURE: THREE LAYOUT WRAPPERS

**Never duplicate sidebar or navbar code.** Create exactly three layout components and wrap every route in the correct one. This is mandatory — zero exceptions.

### File Structure for Layouts
```
src/
└── layouts/
    ├── PublicLayout.jsx          ← Landing, Sign In, Sign Up, Onboarding, Public Scanner
    ├── DashboardLayout.jsx       ← All Normal User pages
    └── AdminLayout.jsx           ← All Business Admin + Super Admin pages
```

---

### Layout 1 — `PublicLayout.jsx`

Used by: `/` · `/sign-in` · `/sign-up` · `/forgot-password` · `/onboarding` · `/scan/:token`

```jsx
// src/layouts/PublicLayout.jsx
import { Link } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

export default function PublicLayout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">

      {/* Public Top Navbar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ScanLine size={24} className="text-indigo-600" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">IntelliScan</span>
          </Link>
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Features</Link>
            <Link to="/#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Pricing</Link>
          </nav>
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/sign-in" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600">Sign In</Link>
            <Link to="/sign-up" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started Free
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <ScanLine size={20} className="text-indigo-600" />
                <span className="font-semibold text-gray-900 dark:text-white">IntelliScan</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
                <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
                <Link to="/sign-in" className="hover:text-indigo-600">Sign In</Link>
              </div>
              <p className="text-sm text-gray-400">© 2026 IntelliScan. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
```

---

### Layout 2 — `DashboardLayout.jsx`

Used by: `/dashboard/scan` · `/dashboard/contacts` · `/dashboard/settings`

```jsx
// src/layouts/DashboardLayout.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScanLine, Users, Settings, LogOut, Bell, Sun, Moon, User } from 'lucide-react';
import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

const navItems = [
  { to: '/dashboard/scan',     label: 'Scan',     icon: ScanLine },
  { to: '/dashboard/contacts', label: 'Contacts', icon: Users    },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Left: Logo */}
          <Link to="/dashboard/scan" className="flex items-center gap-2">
            <ScanLine size={22} className="text-indigo-600" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">IntelliScan</span>
          </Link>

          {/* Center: Nav Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === to
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Plan Badge + Bell + Profile Dropdown */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              FREE
            </span>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Bell size={18} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">jane@company.com</p>
                  </div>
                  <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Settings size={15} /> Settings
                  </Link>
                  {/* ✅ DARK MODE TOGGLE — inside profile dropdown */}
                  <button onClick={toggle}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      {isDark ? <Sun size={15} /> : <Moon size={15} />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-200'} relative`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                  <button onClick={() => navigate('/sign-in')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
              ${location.pathname === to ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
```

---

### Layout 3 — `AdminLayout.jsx`

Used by: ALL `/workspace/*` pages AND all `/admin/*` pages

```jsx
// src/layouts/AdminLayout.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import {
  ScanLine, Home, Users, Link2, BarChart2, CreditCard,
  Settings, LogOut, Bell, Sun, Moon, Menu, X, User, Crown, Activity
} from 'lucide-react';

// Separate nav configs for Business Admin vs Super Admin
const businessAdminNav = [
  { to: '/workspace/dashboard',      label: 'Dashboard',      icon: Home       },
  { to: '/workspace/contacts',       label: 'All Contacts',   icon: Users      },
  { to: '/workspace/members',        label: 'Members',        icon: User       },
  { to: '/workspace/scanner-links',  label: 'Scanner Links',  icon: Link2      },
  { to: '/workspace/analytics',      label: 'Analytics',      icon: BarChart2  },
  { to: '/workspace/billing',        label: 'Billing',        icon: CreditCard },
  { to: '/workspace/settings',       label: 'Settings',       icon: Settings   },
];

const superAdminNav = [
  { to: '/admin/dashboard',          label: 'Platform Overview', icon: Crown    },
  { to: '/admin/workspaces',         label: 'Workspaces',        icon: Users    },
  { to: '/admin/engine-performance', label: 'Engine Performance',icon: Activity },
  { to: '/admin/system-health',      label: 'System Health',     icon: Home     },
  { to: '/admin/settings',           label: 'Settings',          icon: Settings },
];

export default function AdminLayout({ children, role = 'business_admin' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = role === 'super_admin' ? superAdminNav : businessAdminNav;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <ScanLine size={22} className="text-indigo-600" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">IntelliScan</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4 pb-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
          ${role === 'super_admin'
            ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'}`}>
          {role === 'super_admin' ? '👑 SUPER ADMIN' : '🏢 BUSINESS ADMIN'}
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${location.pathname === to
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom: User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Jane Smith</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">jane@company.com</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              {/* ✅ DARK MODE TOGGLE — inside profile dropdown */}
              <button onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-200'} relative`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
              <Link to={role === 'super_admin' ? '/admin/settings' : '/workspace/settings'}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Settings size={15} /> Settings
              </Link>
              <button onClick={() => navigate('/sign-in')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

      {/* Desktop Sidebar — always visible ≥ lg */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-white dark:bg-gray-950 flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar (mobile hamburger + page title area) */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={22} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <ScanLine size={20} className="text-indigo-600" />
            <span className="font-bold text-gray-900 dark:text-white">IntelliScan</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### Route Wiring — Apply layouts in `App.jsx`

```jsx
// src/App.jsx — Wire every route to its correct layout
import { Routes, Route } from 'react-router-dom';
import PublicLayout   from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout    from './layouts/AdminLayout';

// Public Pages
import LandingPage       from './pages/LandingPage';
import SignInPage        from './pages/SignInPage';
import SignUpPage        from './pages/SignUpPage';
import ForgotPassword    from './pages/ForgotPassword';
import OnboardingPage    from './pages/OnboardingPage';
import PublicScannerPage from './pages/PublicScannerPage';

// Normal User Pages
import ScanPage          from './pages/dashboard/ScanPage';
import ContactsPage      from './pages/dashboard/ContactsPage';
import SettingsPage      from './pages/dashboard/SettingsPage';

// Business Admin Pages
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';
import WorkspaceContacts  from './pages/workspace/WorkspaceContacts';
import MembersPage        from './pages/workspace/MembersPage';
import ScannerLinksPage   from './pages/workspace/ScannerLinksPage';
import AnalyticsPage      from './pages/workspace/AnalyticsPage';
import BillingPage        from './pages/workspace/BillingPage';

// Super Admin Pages
import AdminDashboard     from './pages/admin/AdminDashboard';
import EnginePerformance  from './pages/admin/EnginePerformance';

export default function App() {
  return (
    <Routes>
      {/* ── PUBLIC ROUTES ── */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/sign-in" element={<PublicLayout hideFooter><SignInPage /></PublicLayout>} />
      <Route path="/sign-up" element={<PublicLayout hideFooter><SignUpPage /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout hideFooter><ForgotPassword /></PublicLayout>} />
      <Route path="/onboarding" element={<PublicLayout hideFooter><OnboardingPage /></PublicLayout>} />
      <Route path="/scan/:token" element={<PublicLayout hideFooter><PublicScannerPage /></PublicLayout>} />

      {/* ── NORMAL USER ROUTES ── */}
      <Route path="/dashboard/scan"     element={<DashboardLayout><ScanPage /></DashboardLayout>} />
      <Route path="/dashboard/contacts" element={<DashboardLayout><ContactsPage /></DashboardLayout>} />
      <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />

      {/* ── BUSINESS ADMIN ROUTES ── */}
      <Route path="/workspace/dashboard"     element={<AdminLayout role="business_admin"><WorkspaceDashboard /></AdminLayout>} />
      <Route path="/workspace/contacts"      element={<AdminLayout role="business_admin"><WorkspaceContacts /></AdminLayout>} />
      <Route path="/workspace/members"       element={<AdminLayout role="business_admin"><MembersPage /></AdminLayout>} />
      <Route path="/workspace/scanner-links" element={<AdminLayout role="business_admin"><ScannerLinksPage /></AdminLayout>} />
      <Route path="/workspace/analytics"     element={<AdminLayout role="business_admin"><AnalyticsPage /></AdminLayout>} />
      <Route path="/workspace/billing"       element={<AdminLayout role="business_admin"><BillingPage /></AdminLayout>} />

      {/* ── SUPER ADMIN ROUTES ── */}
      <Route path="/admin/dashboard"          element={<AdminLayout role="super_admin"><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/engine-performance" element={<AdminLayout role="super_admin"><EnginePerformance /></AdminLayout>} />
    </Routes>
  );
}
```

---

## ⚠️ RULE 3 — STRICT MOCK DATA SCHEMA

Every contact object used anywhere in the UI — tables, cards, recent scans, contact drawers, export previews — MUST conform to this exact TypeScript-style schema:

```typescript
interface Contact {
  id: string;                           // UUID string e.g. "c1a2b3c4-..."
  name: string | null;                  // Full name from card
  title: string | null;                 // Job title e.g. "VP of Sales"
  company: string | null;               // Company name e.g. "Acme Corp"
  email: string | null;                 // Work email
  phone: string | null;                 // Phone number with country code
  website: string | null;               // Company website URL
  address: string | null;               // Physical address (can be multi-line)
  linkedin: string | null;              // LinkedIn profile URL
  confidence: number;                   // Float 0.00–1.00 e.g. 0.97
  engine_used: 'gemini' | 'tesseract';  // Which AI engine processed this card
}
```

### Complete Mock Dataset — Use This Verbatim

```javascript
// src/data/mockContacts.js
export const mockContacts = [
  {
    id: "c1a2b3c4-0001-4f3a-a1b2-000000000001",
    name: "Rajesh Mehta",
    title: "Chief Technology Officer",
    company: "TechNova Solutions",
    email: "rajesh.mehta@technova.io",
    phone: "+91 98765 43210",
    website: "https://technova.io",
    address: "Level 5, Cyber City, Gurugram, Haryana 122002",
    linkedin: "https://linkedin.com/in/rajeshmehta",
    confidence: 0.98,
    engine_used: "gemini"
  },
  {
    id: "c1a2b3c4-0002-4f3a-a1b2-000000000002",
    name: "Priya Sharma",
    title: "Head of Product",
    company: "Fintech Dynamics",
    email: "priya.sharma@fintechdyn.com",
    phone: "+91 87654 32109",
    website: "https://fintechdyn.com",
    address: "BKC, Bandra East, Mumbai, Maharashtra 400051",
    linkedin: "https://linkedin.com/in/priyasharma",
    confidence: 0.95,
    engine_used: "gemini"
  },
  {
    id: "c1a2b3c4-0003-4f3a-a1b2-000000000003",
    name: "Arjun Patel",
    title: "Sales Director",
    company: "CloudEdge Pvt Ltd",
    email: "arjun@cloudedge.in",
    phone: "+91 76543 21098",
    website: "https://cloudedge.in",
    address: "SG Highway, Ahmedabad, Gujarat 380054",
    linkedin: null,
    confidence: 0.91,
    engine_used: "gemini"
  },
  {
    id: "c1a2b3c4-0004-4f3a-a1b2-000000000004",
    name: "Sneha Iyer",
    title: "Marketing Manager",
    company: "BrandWave Agency",
    email: "sneha.iyer@brandwave.co",
    phone: "+91 65432 10987",
    website: null,
    address: "Koramangala, Bengaluru, Karnataka 560034",
    linkedin: "https://linkedin.com/in/snehaiyer",
    confidence: 0.88,
    engine_used: "tesseract"
  },
  {
    id: "c1a2b3c4-0005-4f3a-a1b2-000000000005",
    name: "Vikram Nair",
    title: "Founder & CEO",
    company: "StartupLabs Inc.",
    email: "vikram@startuplabs.in",
    phone: "+91 54321 09876",
    website: "https://startuplabs.in",
    address: "T-Hub, HITEC City, Hyderabad, Telangana 500081",
    linkedin: "https://linkedin.com/in/vikramnair",
    confidence: 0.97,
    engine_used: "gemini"
  },
  {
    id: "c1a2b3c4-0006-4f3a-a1b2-000000000006",
    name: "Ananya Das",
    title: "Business Development Lead",
    company: "GrowthAxis",
    email: null,
    phone: "+91 43210 98765",
    website: "https://growthaxis.com",
    address: "Sector 62, Noida, Uttar Pradesh 201301",
    linkedin: null,
    confidence: 0.73,
    engine_used: "tesseract"
  },
  {
    id: "c1a2b3c4-0007-4f3a-a1b2-000000000007",
    name: "Rohan Kapoor",
    title: "VP Engineering",
    company: "DeepStack Technologies",
    email: "rohan.kapoor@deepstack.dev",
    phone: "+91 32109 87654",
    website: "https://deepstack.dev",
    address: "Powai, Mumbai, Maharashtra 400076",
    linkedin: "https://linkedin.com/in/rohankapoor",
    confidence: 0.99,
    engine_used: "gemini"
  },
  {
    id: "c1a2b3c4-0008-4f3a-a1b2-000000000008",
    name: "Meera Krishnan",
    title: "Chief Financial Officer",
    company: "Horizon Capital",
    email: "meera.k@horizoncap.in",
    phone: "+91 21098 76543",
    website: null,
    address: "Anna Salai, Chennai, Tamil Nadu 600002",
    linkedin: "https://linkedin.com/in/meerakrishnan",
    confidence: 0.94,
    engine_used: "gemini"
  }
];
```

### Field Rendering Rules

When rendering a contact field that is `null`:
```jsx
// Show a dash and grayed-out style — never crash on null
<span className={value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}>
  {value ?? "—"}
</span>
```

When rendering `confidence` score:
```jsx
// Color-coded badge
const confidenceColor = confidence >= 0.95 ? 'text-green-700 bg-green-100 dark:bg-green-950 dark:text-green-400'
  : confidence >= 0.80 ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400'
  : 'text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-400';

<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor}`}>
  {Math.round(confidence * 100)}% match
</span>
```

When rendering `engine_used`:
```jsx
<span className={`text-xs font-semibold px-2 py-0.5 rounded-full
  ${engine_used === 'gemini'
    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
  {engine_used === 'gemini' ? '✦ Gemini AI' : 'OCR'}
</span>
```

---

## ⚠️ RULE 4 — DARK MODE ARCHITECTURE

### Setup: Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',   // ← REQUIRED: class-based dark mode (not 'media')
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### useDarkMode Hook

```javascript
// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Persist preference in localStorage
    const stored = localStorage.getItem('intelliscan-dark-mode');
    if (stored !== null) return stored === 'true';
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('intelliscan-dark-mode', String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
```

### Initialize in App Root

```jsx
// src/main.jsx
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply dark class on initial load BEFORE first render (prevents flash)
const stored = localStorage.getItem('intelliscan-dark-mode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'true' || (stored === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
```

### Dark Mode Color Pairs — Apply to EVERY Component

For every element, always include both light and dark classes:

| Element | Light | Dark |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-gray-900` |
| Card / surface | `bg-white` | `dark:bg-gray-950` |
| Sidebar | `bg-white` | `dark:bg-gray-950` |
| Elevated card | `bg-white shadow-sm` | `dark:bg-gray-900 dark:border dark:border-gray-800` |
| Modal | `bg-white` | `dark:bg-gray-900` |
| Border | `border-gray-200` | `dark:border-gray-800` |
| Primary text | `text-gray-900` | `dark:text-white` |
| Secondary text | `text-gray-600` | `dark:text-gray-300` |
| Muted text | `text-gray-400` | `dark:text-gray-500` |
| Input background | `bg-white` | `dark:bg-gray-800` |
| Input border | `border-gray-300` | `dark:border-gray-600` |
| Input text | `text-gray-900` | `dark:text-white` |
| Input placeholder | `placeholder-gray-400` | `dark:placeholder-gray-500` |
| Table header | `bg-gray-50` | `dark:bg-gray-900` |
| Table row hover | `hover:bg-gray-50` | `dark:hover:bg-gray-800` |
| Divider | `divide-gray-200` | `dark:divide-gray-800` |
| Nav active | `bg-indigo-50 text-indigo-600` | `dark:bg-indigo-950 dark:text-indigo-400` |
| Badge gray | `bg-gray-100 text-gray-600` | `dark:bg-gray-800 dark:text-gray-300` |
| Badge indigo | `bg-indigo-100 text-indigo-700` | `dark:bg-indigo-950 dark:text-indigo-300` |
| Badge green | `bg-green-100 text-green-700` | `dark:bg-green-950 dark:text-green-400` |
| Badge amber | `bg-amber-100 text-amber-700` | `dark:bg-amber-950 dark:text-amber-400` |
| Badge red | `bg-red-100 text-red-700` | `dark:bg-red-950 dark:text-red-400` |

### Example Component With Correct Dark Mode

```jsx
// A stat card with correct light + dark classes
function StatCard({ label, value, change, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{change}</p>
    </div>
  );
}
```

---

## FINAL CHECKLIST — Stitch Must Verify Before Output

Before generating any component, confirm:

- [ ] Every icon imported from `lucide-react` only — zero other icon libraries
- [ ] Every page route wrapped in `<PublicLayout>`, `<DashboardLayout>`, or `<AdminLayout>` — never raw
- [ ] Sidebar and navbar code exists in ONE place only — the layout files
- [ ] Every contact object matches the exact mock schema (id, name, title, company, email, phone, website, address, linkedin, confidence, engine_used)
- [ ] `engine_used` is always `'gemini'` or `'tesseract'` — never any other string
- [ ] `confidence` is a float 0.00–1.00 — never a percentage integer
- [ ] `tailwind.config.js` has `darkMode: 'class'`
- [ ] Every component has BOTH light and dark Tailwind classes on every background, border, and text element
- [ ] Dark mode toggle is inside the profile dropdown in both `DashboardLayout` and `AdminLayout`
- [ ] `useDarkMode` hook reads and writes to `localStorage` under key `'intelliscan-dark-mode'`
- [ ] Initial dark class applied in `main.jsx` before first React render (no flash on reload)



1. Global State (Mock Backend):
Do not hardcode the mockContacts array directly inside the page components. You must create a React Context called <ContactProvider> (or use Zustand) that holds the contacts array and provides addContact(), deleteContact(), and updateContact() methods. Wrap the application in this provider so that if I "scan" a card on the Scan page, it actually appears on the Contacts page.

2. Role-Based Routing (Guards):
In App.jsx, do not leave the /workspace/* and /admin/* routes unprotected. Create a <RoleGuard allowedRoles={['business_admin', 'super_admin']}> component that wraps these routes. If a user without the correct role tries to access them, render a <Navigate to="/sign-in" /> redirect.