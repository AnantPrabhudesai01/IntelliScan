import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setStoredAuth, clearStoredAuth, safeReadStoredUser } from '../utils/auth';
import { useRole } from '../context/RoleContext';

export default function Auth0Synchronizer() {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } = useAuth0();
  const { refreshAuth } = useRole();

  useEffect(() => {
    let active = true;

    const syncToken = async () => {
      if (isLoading) return;

      // Prevent redundant syncs if we already have a token and user matches
      const existingAuth = safeReadStoredUser();
      if (isAuthenticated && user && existingAuth?.email === user.email) {
         console.log("[AuthSync] Session already synchronized.");
         return;
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
          
          // Use the LOCAL JWT returned by our backend for all future API calls
          if (active) {
            setStoredAuth({ 
              token: data.token, 
              user: data.user 
            });
            console.log("✅ Auth0 synced with local DB");
            
            // Explicitly trigger a refresh of the role context
            await refreshAuth();
          }
        } catch (error) {
          console.error("Auth0 token sync failed:", error);
          if (active) {
            clearStoredAuth();
            await refreshAuth();
            
            // Redirect with descriptive error to help debugging
            const desc = encodeURIComponent(error.message || 'Unknown identity error');
            window.location.href = `/sign-in?error=sync_failed&error_description=${desc}`;
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
