import { Link } from 'react-router-dom';
import { ScanLine, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { getStoredToken } from '../utils/auth';

const DarkModeToggle = () => {
  const { isDark, toggle } = useDarkMode();
  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {isDark ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-600" />}
    </button>
  );
};

export default function PublicLayout({ children, hideFooter = false }) {
  const token = getStoredToken();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">

      {/* Public Top Navbar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={token ? '/dashboard/scan' : '/'} className="flex items-center gap-2">
            <ScanLine size={24} className="text-indigo-600" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">IntelliScan</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Features</Link>
            <Link to="/#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Pricing</Link>
          </nav>
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
