import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'intelliscan-language';

const LanguageContext = createContext(null);

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'gu', label: 'Gujarati' }
];

// Keep translations intentionally small and focused.
// We can expand this gradually without refactoring every page at once.
const DICT = {
  en: {
    nav_product: 'Product',
    nav_features: 'Features',
    nav_pricing: 'Pricing',
    nav_about: 'About',
    nav_clients: 'Clients',
    nav_services: 'Services',
    nav_careers: 'Careers',
    nav_faq: 'FAQ',
    nav_contact: 'Contact',
    nav_sign_in: 'Sign In',
    nav_sign_up: 'Sign Up'
  },
  hi: {
    nav_product: 'उत्पाद',
    nav_features: 'विशेषताएं',
    nav_pricing: 'मूल्य',
    nav_about: 'परिचय',
    nav_clients: 'क्लाइंट्स',
    nav_services: 'सेवाएं',
    nav_careers: 'करियर',
    nav_faq: 'प्रश्न',
    nav_contact: 'संपर्क',
    nav_sign_in: 'लॉग इन',
    nav_sign_up: 'साइन अप'
  },
  gu: {
    nav_product: 'ઉત્પાદન',
    nav_features: 'ફીચર્સ',
    nav_pricing: 'કિંમત',
    nav_about: 'અમારા વિશે',
    nav_clients: 'ગ્રાહકો',
    nav_services: 'સેવા',
    nav_careers: 'કારકિર્દી',
    nav_faq: 'પ્રશ્નો',
    nav_contact: 'સંપર્ક',
    nav_sign_in: 'સાઇન ઇન',
    nav_sign_up: 'સાઇન અપ'
  }
};

function safeReadStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(safeReadStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const value = useMemo(() => {
    const dict = DICT[language] || DICT.en;
    const t = (key) => dict[key] || DICT.en[key] || key;
    return { language, setLanguage, t, languages: LANGUAGES };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

