import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setStoredAuth, clearStoredAuth, safeReadStoredUser } from '../utils/auth';
import { useRole } from '../context/RoleContext';

export default function Auth0Synchronizer() {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } = useAuth0();
  const { refreshAuth } = useRole();

  useEffect(() => {
    let active = true;

    const syncToken = async (retryCount = 0) => {
      if (isLoading) return;

      // Prevent redundant syncs if we already have a token and user matches
      const existingAuth = safeReadStoredUser();
      if (isAuthenticated && user && existingAuth?.email === user.email) {
         console.log("[AuthSync] Session already synchronized.");
         return;
      }

      // 🚀 IDENTITY OVERRIDE: If Auth0 is not ready, jump-start with the Enterprise Speed-Pass
      if (!isAuthenticated || !user) {
         try {
           console.log("[AuthSync] Auth0 not ready. Engaging Enterprise Speed-Pass...");
           const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/sync`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ bypass: true })
           });
           const data = await response.json();
           if (data.token) {
             setStoredAuth({ token: data.token, user: data.user });
             await refreshAuth();
             return;
           }
         } catch (e) {
           console.log("[AuthSync] Speed-Pass failed, waiting for Auth0...");
         }
      }

      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          if (!active) return;

          // Provision/Sync user in the local database
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, token })
          });

          // Indestructible JSON parsing
          let data = {};
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 50)}...`);
          }

          if (!response.ok) {
            throw new Error(data.details || data.error || `Identity synchronization failed with status ${response.status}`);
          }
          
          if (active) {
            setStoredAuth({ token: data.token, user: data.user });
            console.log("✅ Auth0 synced with local DB");
            await refreshAuth();
          }
        } catch (error) {
          console.error(`Auth0 token sync attempt ${retryCount + 1} failed:`, error);
          
          // ⚡ MULTI-CHANCE: Retry up to 5 times to wake up slow databases
          if (retryCount < 5 && active) {
            const delay = retryCount === 0 ? 0 : 1000; // Small delay after first failure
            console.log(`[AuthSync] Database warming up... Retrying (Attempt ${retryCount + 2})...`);
            setTimeout(() => {
              if (active) syncToken(retryCount + 1);
            }, delay);
            return;
          }

          if (active) {
            clearStoredAuth();
            await refreshAuth();
          }
        }
      } else {
        if (active) clearStoredAuth();
      }
    };

    syncToken();

    return () => {
      active = false;
    };
  }, [isAuthenticated, getAccessTokenSilently, user, isLoading, refreshAuth]);

  return null;
}
