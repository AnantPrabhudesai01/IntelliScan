import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getStoredToken, resolveHomeRoute } from '../utils/auth';

export default function RoleGuard({ children, allowedRoles }) {
  const { role, tier, isAuthReady } = useRole();
  const token = getStoredToken();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e131f] text-[#dde2f3]">
        <p className="text-sm font-semibold tracking-wide">Restoring session...</p>
      </div>
    );
  }

  if (!token || role === 'anonymous') {
    return <Navigate to="/sign-in" replace />;
  }

  // Logic: Allow if role is in list OR if user is super_admin OR if user is Enterprise (for workspace access)
  const isAllowed = allowedRoles.includes(role) || 
                    role === 'super_admin' || 
                    (tier === 'enterprise' && allowedRoles.includes('business_admin'));

  if (!isAllowed) {
    return <Navigate to={resolveHomeRoute({ role })} replace />;
  }

  return children;
}
