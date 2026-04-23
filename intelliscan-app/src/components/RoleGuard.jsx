import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getStoredToken, resolveHomeRoute, tryDecodeJwtPayload } from '../utils/auth';

export default function RoleGuard({ children, allowedRoles }) {
  const { role: contextRole, tier: contextTier, isAuthReady } = useRole();
  const token = getStoredToken();

  // 🛡️ JWT-PEEK: If context isn't ready but we have a token, decode it locally
  // This prevents the "Flash-Kick" where users see the dashboard then get sent to Sign In.
  const decoded = token ? tryDecodeJwtPayload(token) : null;
  const role = contextRole !== 'anonymous' ? contextRole : (decoded?.role || 'anonymous');
  const tier = contextTier !== 'personal' ? contextTier : (decoded?.tier || 'personal');

  if (!isAuthReady && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e131f] text-[#dde2f3]">
        <p className="text-sm font-semibold tracking-wide">Restoring session...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  // Logic: Allow if role is in list OR if user is super_admin OR if user is Enterprise (for workspace access)
  const isAllowed = !allowedRoles || 
                    allowedRoles.includes(role) || 
                    role === 'super_admin' || 
                    (tier === 'enterprise' && allowedRoles.includes('business_admin'));

  if (!isAllowed && role !== 'anonymous') {
    return <Navigate to={resolveHomeRoute({ role, tier })} replace />;
  }

  if (role === 'anonymous') {
     return <Navigate to="/sign-in" replace />;
  }

  return children;
}
