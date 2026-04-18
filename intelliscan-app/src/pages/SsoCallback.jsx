import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { setStoredAuth, resolveHomeRoute } from '../utils/auth';

export default function SsoCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRole } = useRole();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userJson = params.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        // 1. Save to local storage
        setStoredAuth({ token, user });
        
        // 2. Sync the global role state
        setRole(user.role, user.tier);
        
        // 3. Go to the dashboard
        const home = resolveHomeRoute(user);
        navigate(home, { replace: true });
      } catch (err) {
        console.error('Failed to parse SSO user:', err);
        navigate('/sign-in?auth_error=parse_failed', { replace: true });
      }
    } else {
      navigate('/sign-in?auth_error=missing_params', { replace: true });
    }
  }, [location, navigate, setRole]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e131f] text-[#dde2f3]">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-semibold tracking-wide">Finalizing Secure Session...</p>
    </div>
  );
}
