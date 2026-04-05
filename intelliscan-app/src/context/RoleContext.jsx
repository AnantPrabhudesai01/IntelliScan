import { createContext, useContext, useEffect, useState } from 'react';
import { clearStoredAuth, getStoredToken, safeReadStoredUser, setStoredUser } from '../utils/auth';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const initialUser = safeReadStoredUser();
  const initialToken = getStoredToken();
  const [role, setRole] = useState(initialToken ? (initialUser?.role || 'anonymous') : 'anonymous');
  const [tier, setTier] = useState(initialToken ? (initialUser?.tier || 'personal') : 'personal');
  const [isAuthReady, setIsAuthReady] = useState(false);

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
        if (!cancelled) setIsAuthReady(true);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const updateRole = (newRole = 'anonymous', newTier = 'personal') => {
    setRole(newRole);
    setTier(newTier || 'personal');

    if (newRole === 'anonymous') {
      clearStoredAuth();
      return;
    }

    const storedUser = safeReadStoredUser() || {};
    const updatedUser = {
      ...storedUser,
      role: newRole,
      tier: newTier || storedUser.tier || 'personal'
    };
    setStoredUser(updatedUser);
  };

  const signOut = () => {
    clearStoredAuth();
    setRole('anonymous');
    setTier('personal');
    setIsAuthReady(true);
  };

  return (
    <RoleContext.Provider value={{ role, tier, isAuthReady, setRole: updateRole, signOut }}>
      {children}
    </RoleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => useContext(RoleContext);
