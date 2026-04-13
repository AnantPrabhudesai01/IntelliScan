import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { getStoredToken } from '../../utils/auth';

function formatRupees(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString('en-IN');
}

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/billing/plans');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `Failed with status ${res.status}`);
        const list = Array.isArray(data?.plans) ? data.plans : [];
        if (mounted) setPlans(list);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load plans.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const hasToken = Boolean(getStoredToken());

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Pricing</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            Choose a personal plan or upgrade to enterprise. Pricing is shown in INR.
          </p>
        </header>

        {loading ? (
          <div className="text-white/60 text-sm font-semibold">Loading plans...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-6 text-sm font-semibold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
                <p className="text-white font-extrabold text-xl">{p.name}</p>
                <div className="mt-4">
                  {Number(p.price || 0) === 0 ? (
                    <p className="text-4xl font-black text-white">Free</p>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/60 font-bold">₹</span>
                      <span className="text-4xl font-black text-white">{formatRupees(p.price)}</span>
                      <span className="text-white/60 font-semibold text-sm">/month</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2 text-sm text-white/70">
                  {p.id === 'personal' ? (
                    <>
                      <p>10 single scans per cycle</p>
                      <p>3 group-photo scans per cycle</p>
                      <p>Basic contact management</p>
                    </>
                  ) : p.id === 'pro' ? (
                    <>
                      <p>100 single scans per cycle</p>
                      <p>10 group-photo scans per cycle</p>
                      <p>Email marketing + sequences</p>
                      <p>Calendar + digital card</p>
                    </>
                  ) : (
                    <>
                      <p>Unlimited scans</p>
                      <p>Workspace roles + governance</p>
                      <p>Leaderboard + analytics</p>
                      <p>Webhooks + integrations</p>
                    </>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  {p.id === 'personal' ? (
                    <Link to="/sign-up" className="w-full text-center py-3 rounded-xl bg-brand hover:bg-brand-light text-white font-extrabold transition-colors">
                      Get Started Free
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={hasToken ? '/dashboard/billing' : '/sign-up'}
                        className="w-full text-center py-3 rounded-xl bg-brand hover:bg-brand-light text-white font-extrabold transition-colors"
                      >
                        {hasToken ? 'Upgrade in Dashboard' : 'Create Account'}
                      </Link>
                      <Link to="/contact" className="w-full text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold transition-colors">
                        Contact Us (Custom)
                      </Link>
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        14-day trial workflow is started from inside the dashboard after sign up.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

