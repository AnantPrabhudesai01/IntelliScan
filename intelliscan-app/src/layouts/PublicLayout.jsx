import { Link } from 'react-router-dom';
import { ScanLine, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { getStoredToken, resolveHomeRoute, safeReadStoredUser, tryDecodeJwtPayload } from '../utils/auth';

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {isDarkMode ? <Sun size={18} className="text-gray-300" /> : <Moon size={18} className="text-gray-500" />}
    </button>
  );
};

export default function PublicLayout({ children, hideFooter = false }) {
  const token = getStoredToken();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  const storedUser = safeReadStoredUser();
  const decoded = token ? tryDecodeJwtPayload(token) : null;
  const homeRoute = token
    ? resolveHomeRoute({
        role: storedUser?.role || decoded?.role || 'user',
        tier: storedUser?.tier || decoded?.tier || 'personal'
      })
    : '/';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0e131f] text-gray-900 dark:text-[#dde2f3] flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-300">

      {/* Public Top Navbar — Odoo/Zoho Enterprise Style */}
      <header className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0e131f] sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={homeRoute} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <ScanLine size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">IntelliScan</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/product" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_product')}</Link>
            <Link to="/features" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_features')}</Link>
            <Link to="/pricing" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_pricing')}</Link>
            <Link to="/about" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_about')}</Link>
            <Link to="/clients" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_clients')}</Link>
            <Link to="/services" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_services')}</Link>
            <Link to="/careers" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_careers')}</Link>
            <Link to="/faq" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_faq')}</Link>
            <Link to="/contact" className="text-sm text-white/70 hover:text-white transition-colors font-semibold">{t('nav_contact')}</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="dark" />
            <Link to="/sign-in" className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-3 py-1.5">{t('nav_sign_in')}</Link>
            <Link to="/sign-up" className="text-sm font-extrabold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-light transition-colors shadow-sm">
              {t('nav_sign_up')}
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="border-t border-white/10 bg-[#0b0f1a] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                  <ScanLine size={14} className="text-white" />
                </div>
                <span className="font-semibold text-white">IntelliScan</span>
              </div>
              <div className="flex gap-6 text-sm text-white/60">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
              <p className="text-sm text-white/40">© 2026 IntelliScan. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
