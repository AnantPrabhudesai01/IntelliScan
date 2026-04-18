import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getStoredToken } from '../utils/auth';

const TIER_RANK = { personal: 0, pro: 1, enterprise: 2 };

function normalizeTier(tier) {
  const raw = String(tier || 'personal').toLowerCase();
  if (raw === 'business') return 'enterprise';
  return raw;
}

function tierMeetsMin(tier, minTier) {
  const t = normalizeTier(tier);
  const m = normalizeTier(minTier);
  const tRank = TIER_RANK[t] ?? 0;
  const mRank = TIER_RANK[m] ?? 0;
  return tRank >= mRank;
}

export default function TierGuard({ children, minTier = 'personal', featureName = 'This feature' }) {
  const navigate = useNavigate();
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

  // Admins always allowed
  if (role === 'super_admin' || role === 'business_admin') {
    return children;
  }

  if (tierMeetsMin(tier, minTier)) {
    return children;
  }

  const required = normalizeTier(minTier);
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-extrabold text-white font-headline mb-2">Upgrade Required</h2>
        <p className="text-sm text-[#c7c4d8] font-body leading-relaxed">
          {featureName} is available on the <span className="font-bold text-white">{required.toUpperCase()}</span> plan and above.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:brightness-110 transition-all"
          >
            View Plans
          </button>
          <button
            onClick={() => navigate('/dashboard/scan')}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
          >
            Back to Scan
          </button>
        </div>
      </div>
    </div>
  );
}

