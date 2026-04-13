import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ variant = 'default' }) {
  const { language, setLanguage, languages } = useLanguage();

  const base =
    variant === 'dark'
      ? 'bg-white/5 border-white/10 text-[#dde2f3] hover:bg-white/10'
      : 'bg-white dark:bg-[#1A1A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <div className="relative">
      <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${base}`}>
        <Languages size={16} className={variant === 'dark' ? 'text-white/70' : 'text-gray-500 dark:text-gray-300'} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-xs font-bold outline-none cursor-pointer"
          aria-label="Language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

