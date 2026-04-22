import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { getStoredToken } from '../../utils/auth';
import apiClient from '../../api/client';

import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await apiClient.get('/billing/plans');
        const list = Array.isArray(res.data?.plans) ? res.data.plans : [];
        if (mounted) setPlans(list);
      } catch (e) {
        console.error('Pricing load failed:', e);
        if (mounted) {
          // Fallback
          setPlans([
            { id: 'personal', name: 'Personal', price: 0, badge: 'Starter', features: ['100 Scan Credits / month', 'Gemini Flash OCR Engine'] },
            { id: 'pro', name: 'Pro', price: 49, badge: 'Advanced', features: ['5,000 Scan Credits / month', 'Gemini Pro Vision Engine'] },
            { id: 'enterprise', name: 'Enterprise', price: 1999, badge: 'Scale', features: ['Unlimited Scan Credits', 'Custom AI Training'] }
          ]);
        }
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
            {plans.map((p) => {
              const features = Array.isArray(p.features) ? p.features : [];
              const negatives = Array.isArray(p.negatives) ? p.negatives : [];
              
              return (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col group hover:bg-white/[0.07] transition-all duration-300">
                  <header className="mb-6">
                    <p className="text-brand-400 font-black text-xs uppercase tracking-widest mb-2">{p.badge || 'Plan'}</p>
                    <h3 className="text-white font-black text-3xl italic tracking-tighter">{p.name}</h3>
                  </header>
                  
                  <div className="mb-8">
                    {Number(p.price || 0) === 0 ? (
                      <p className="text-5xl font-black text-white italic tracking-tighter">Free</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-white/40 font-bold text-xl">{CURRENCY_SYMBOL}</span>
                        <span className="text-5xl font-black text-white italic tracking-tighter">{formatCurrency(p.price)}</span>
                        <span className="text-white/40 font-bold text-xs uppercase ml-1">/ month</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 mb-10">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 group/item">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform">
                          <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-sm font-bold text-white/80 group-hover/item:text-white transition-colors">{f}</p>
                      </div>
                    ))}
                    {negatives.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 opacity-40">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <p className="text-sm font-medium text-white/60">{n}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    {p.id === 'personal' ? (
                      <Link to="/sign-up" className="w-full flex items-center justify-center px-6 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                        Get Started Free
                      </Link>
                    ) : (
                      <Link
                        to={hasToken ? `/dashboard/checkout/${p.id}` : `/sign-up?plan=${p.id}`}
                        className="w-full flex items-center justify-center px-6 py-4 rounded-2xl bg-brand-600 text-white font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 shadow-xl shadow-brand-600/20"
                      >
                        {hasToken ? 'Upgrade Now' : `Start with ${p.name}`}
                      </Link>
                    )}
                    <Link to="/contact" className="w-full flex items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                      Contact Sales
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

