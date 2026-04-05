import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import { ContactProvider } from './context/ContactContext';
import { RoleProvider } from './context/RoleContext';
import { BatchQueueProvider } from './context/BatchQueueContext';

// Apply dark class on initial load BEFORE first render
const stored = localStorage.getItem('intelliscan-dark-mode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'true' || (stored === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <ContactProvider>
          <BatchQueueProvider>
            <GlobalErrorBoundary>
              <App />
            </GlobalErrorBoundary>
          </BatchQueueProvider>
        </ContactProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>
);
