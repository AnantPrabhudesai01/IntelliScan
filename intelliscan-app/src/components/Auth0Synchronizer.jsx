import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setStoredAuth, clearStoredAuth } from '../utils/auth';
import { useRole } from '../context/RoleContext';

export default function Auth0Synchronizer() {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } = useAuth0();
  const { refreshAuth } = useRole();

  useEffect(() => {
    let active = true;

    const syncToken = async () => {
      if (isLoading) return;

      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          if (!active) return;

          // Provision/Sync user in the local SQLite database
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, token })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Backend sync failed');
          }
          
          const data = await response.json();
          
          // Use the LOCAL JWT returned by our backend for all future API calls
          if (active) {
            setStoredAuth({ 
              token: data.token, 
              user: data.user 
            });
            console.log("✅ Auth0 synced with local DB");
            
            // Explicitly trigger a refresh of the role context to break the loading loop
            await refreshAuth();
          }
        } catch (error) {
          console.error("Auth0 token sync failed:", error);
          if (active) {
            clearStoredAuth();
            
            // To break the loading loop in App.jsx (isAuthenticated && !token),
            // call refreshAuth to ensure state updates, and trigger logout.
            await refreshAuth();
            window.location.href = '/sign-in?error=sync_failed&error_description=Could not sync session with the server.';
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
