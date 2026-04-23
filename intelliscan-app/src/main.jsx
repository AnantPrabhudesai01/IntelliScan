import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import { ContactProvider } from './context/ContactContext';
import { RoleProvider } from './context/RoleContext';
import { BatchQueueProvider } from './context/BatchQueueContext';
import { LanguageProvider } from './context/LanguageContext';
import { Auth0Provider } from '@auth0/auth0-react';
import Auth0Synchronizer from './components/Auth0Synchronizer';

// Apply dark class on initial load BEFORE first render
const stored = localStorage.getItem('intelliscan-dark-mode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'true' || (stored === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Auth0Provider
          domain={import.meta.env.VITE_AUTH0_DOMAIN || "dev-1s0xix56z6m3jc0i.jp.auth0.com"}
          clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || "xovwCn299yoIc2F5HpxfBq24joO1Rleg"}
          authorizationParams={{ 
            redirect_uri: window.location.origin,
            audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN || "dev-1s0xix56z6m3jc0i.jp.auth0.com"}/api/v2/`,
            scope: "openid profile email offline_access"
          }}
          onRedirectCallback={(appState) => {
            // 🛡️ Deep Cleanup: Force-clear security tokens from URL immediately
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Smooth Transition: Take user to dashboard or their intended destination
            const target = appState?.returnTo || '/dashboard';
            window.location.assign(target); 
          }}
        >
          <RoleProvider>
            <Auth0Synchronizer />
            <ContactProvider>
              <BatchQueueProvider>
                <GlobalErrorBoundary>
                  <App />
                </GlobalErrorBoundary>
              </BatchQueueProvider>
            </ContactProvider>
          </RoleProvider>
        </Auth0Provider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
