import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearStoredAuth, getStoredToken, safeReadStoredUser, setStoredUser, tryDecodeJwtPayload } from '../utils/auth';
import { useAuth0 } from '@auth0/auth0-react';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const initialUser = safeReadStoredUser();
  const initialToken = getStoredToken();
  const initialDecoded = initialToken ? tryDecodeJwtPayload(initialToken) : null;
  const [role, setRole] = useState(initialToken ? (initialUser?.role || initialDecoded?.role || 'anonymous') : 'anonymous');
  const [tier, setTier] = useState(initialToken ? (initialUser?.tier || initialDecoded?.tier || 'personal') : 'personal');
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Derived Helpers (Source of Truth)
  const normalizedTier = (tier || 'personal').toLowerCase();
  const isFree = normalizedTier === 'personal';
  const isPro = normalizedTier === 'pro';
  const isEnterprise = normalizedTier === 'enterprise' || role === 'business_admin' || role === 'super_admin';
  const { logout, isLoading: isAuth0Loading, isAuthenticated: isAuth0Authenticated } = useAuth0();

  const refreshAuth = useCallback(async () => {
    const token = getStoredToken();
    const storedUser = safeReadStoredUser();

    if (!token) {
      setRole('anonymous');
      setTier('personal');
      setIsAuthReady(true);
      return null;
    }

    // Keep local session while we validate with server (avoid UI flashing).
    if (storedUser?.role) setRole(storedUser.role);
    if (storedUser?.tier) setTier(storedUser.tier);
    if (!storedUser?.role || !storedUser?.tier) {
      const decoded = tryDecodeJwtPayload(token);
      if (!storedUser?.role && decoded?.role) setRole(decoded.role);
      if (!storedUser?.tier && decoded?.tier) setTier(decoded.tier);
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(`auth_invalid:${res.status}`);
        }
        throw new Error(`auth_transient:${res.status}`);
      }
      const user = await res.json();
      setStoredUser(user);
      setRole(user?.role || 'user');
      setTier(user?.tier || 'personal');
      return user;
    } catch (error) {
      if (String(error.message || '').startsWith('auth_invalid:')) {
        console.warn('Session refresh invalid token, clearing auth.');
        clearStoredAuth();
        setRole('anonymous');
        setTier('personal');
      } else {
        // Transient API failures should not force logout.
        console.warn('Session refresh transient failure, keeping stored auth:', error.message);
      }
      return null;
    } finally {
      // Only mark as ready if Auth0 is also done loading
      if (!isAuth0Loading) {
        setIsAuthReady(true);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    const storedUser = safeReadStoredUser();

    if (!token) {
      setRole('anonymous');
      setTier('personal');
      setIsAuthReady(true);
      return () => { cancelled = true; };
    }

    // Optimistically keep local user so navigation doesn't flash.
    if (storedUser?.role) setRole(storedUser.role);
    if (storedUser?.tier) setTier(storedUser.tier);
    if (!storedUser?.role || !storedUser?.tier) {
      const decoded = tryDecodeJwtPayload(token);
      if (!storedUser?.role && decoded?.role) setRole(decoded.role);
      if (!storedUser?.tier && decoded?.tier) setTier(decoded.tier);
    }

    const bootstrap = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error(`auth_invalid:${res.status}`);
          }
          throw new Error(`auth_transient:${res.status}`);
        }
        const user = await res.json();
        setStoredUser(user);
        if (!cancelled) {
          setRole(user?.role || 'user');
          setTier(user?.tier || 'personal');
        }
      } catch (error) {
        if (String(error.message || '').startsWith('auth_invalid:')) {
          console.warn('Session bootstrap invalid token, clearing auth.');
          clearStoredAuth();
          if (!cancelled) {
            setRole('anonymous');
            setTier('personal');
          }
        } else {
          // Transient API failures should not force logout. Keep optimistic local session.
          console.warn('Session bootstrap transient failure, keeping stored auth:', error.message);
        }
      } finally {
        if (!cancelled && !isAuth0Loading) {
          setIsAuthReady(true);
        }
      }
    };

    // If Auth0 is loading, wait for it before bootstrapping our local state
    if (!isAuth0Loading) {
      bootstrap();
    }
    return () => { cancelled = true; };
  }, [isAuth0Loading]);

  const updateRole = (newRole = 'anonymous', newTier = 'personal') => {
    // IMPORTANT: Security hardening - don't allow client-side to set arbitrary roles.
    // The role should ONLY be set by the server response in useEffect/refreshAuth.
    if (newRole === 'anonymous') {
      setRole('anonymous');
      setTier('personal');
      clearStoredAuth();
      return;
    }

    // Tier updates are allowed (e.g. optimistic UI after payment), 
    // but should be followed by a refreshAuth() call to sync with server JWT.
    setTier(newTier || 'personal');

    const storedUser = safeReadStoredUser() || {};
    const updatedUser = {
      ...storedUser,
      // role: storedUser.role, // Do NOT update role from client input
      tier: newTier || storedUser.tier || 'personal'
    };
    setStoredUser(updatedUser);
  };

  const signOut = () => {
    clearStoredAuth();
    setRole('anonymous');
    setTier('personal');
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <RoleContext.Provider value={{ 
      role, 
      tier: normalizedTier, 
      isFree, 
      isPro, 
      isEnterprise, 
      isAuthReady, 
      setRole: updateRole, 
      refreshAuth, 
      signOut 
    }}>
      {children}
    </RoleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => useContext(RoleContext);
