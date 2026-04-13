import { useEffect, useState } from 'react';
import { Check, Zap, Crown, Building2, RefreshCw, ArrowUpRight, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getStoredToken, setStoredAuth } from '../utils/auth';

const PLAN_FEATURES = {
  personal: {
    color: 'gray', icon: Shield, badge: 'Free',
    features: ['10 card scans/month', '1 business card design', 'Basic AI extraction', 'CSV & vCard export'],
    limits: ['No workspace sharing', 'No CRM sync', 'No analytics']
  },
  pro: {
    color: 'indigo', icon: Zap, badge: 'Popular',
    features: ['100 card scans/month', 'Unlimited card designs', 'AI industry & seniority enrichment', 'CRM export (Salesforce, Zoho, Odoo)', 'Full analytics dashboard', 'Priority support'],
    limits: ['1 seat only', 'No shared Rolodex']
  },
  enterprise: {
    color: 'amber', icon: Crown, badge: 'Best Value',
    features: ['Unlimited scans', 'Up to 50 seats', 'Shared Rolodex (team view)', 'Live duplicate detection', 'Lead routing automation', 'CRM sync & API access', 'Workspace analytics', 'Dedicated support'],
    limits: []
  }
};

function PlanCard({ plan, currentTier, onUpgrade, loading }) {
  const cfg = PLAN_FEATURES[plan.id] || PLAN_FEATURES.personal;
  const IconComp = cfg.icon;
  const isCurrentPlan = currentTier === plan.id;
  const isDowngrade = plan.id === 'personal' && currentTier !== 'personal';
  const colorMap = { gray: 'border-gray-200 dark:border-gray-800', indigo: 'border-indigo-400 dark:border-indigo-600', amber: 'border-amber-400 dark:border-amber-600' };
  const badgeMap = { Popular: 'bg-indigo-600 text-white', 'Best Value': 'bg-amber-500 text-white', Free: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' };

  return (
    <div className={`relative bg-white dark:bg-gray-900 rounded-3xl border-2 ${colorMap[cfg.color]} p-8 flex flex-col hover:shadow-2xl transition-shadow ${plan.id === 'pro' ? 'shadow-indigo-100 dark:shadow-indigo-900/20 shadow-xl' : 'shadow-sm'}`}>
      {cfg.badge && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${badgeMap[cfg.badge]}`}>
          {cfg.badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' : cfg.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <IconComp size={20} className={cfg.color === 'indigo' ? 'text-indigo-600' : cfg.color === 'amber' ? 'text-amber-600' : 'text-gray-500'} />
        </div>
        <h3 className="font-headline font-extrabold text-xl text-gray-900 dark:text-white">{plan.name}</h3>
      </div>
      <div className="mb-6">
        {plan.price === 0 ? (
          <p className="text-4xl font-black text-gray-900 dark:text-white">Free</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-500">₹</span>
            <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price.toLocaleString()}</span>
            <span className="text-gray-500 font-medium">/mo</span>
          </div>
        )}
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {cfg.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <Check size={16} className={`shrink-0 mt-0.5 ${cfg.color === 'indigo' ? 'text-indigo-500' : cfg.color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`} />
            {f}
          </li>
        ))}
        {cfg.limits.map(l => (
          <li key={l} className="flex items-start gap-2.5 text-sm text-gray-400">
            <span className="shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center text-gray-300 font-bold text-xs">–</span>
            {l}
          </li>
        ))}
      </ul>
      {isCurrentPlan ? (
        <div className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center text-sm font-bold text-gray-600 dark:text-gray-300">Current Plan</div>
      ) : isDowngrade ? (
        <div className="py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">Included with Free</div>
      ) : (
        <button onClick={() => onUpgrade(plan.id)} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
            cfg.color === 'amber' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
          } disabled:opacity-60`}>
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <><ArrowUpRight size={16} /> Upgrade to {plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</>}
        </button>
      )}
    </div>
  );
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useRole();
  const token = getStoredToken();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState('personal');
  const [quota, setQuota] = useState(null);
  const [workspaceBilling, setWorkspaceBilling] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [pmForm, setPmForm] = useState({ card_number: '', exp_month: '', exp_year: '', holder_name: '', make_primary: true });
  const [pmSaving, setPmSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [plansRes, quotaRes, overviewRes, methodsRes, invoicesRes] = await Promise.all([
          fetch('/api/billing/plans'),
          fetch('/api/user/quota', { headers }),
          fetch('/api/workspace/billing/overview', { headers }),
          fetch('/api/workspace/billing/payment-methods', { headers }),
          fetch('/api/workspace/billing/invoices', { headers })
        ]);
        if (plansRes.ok) setPlans((await plansRes.json()).plans || []);
        if (quotaRes.ok) {
          const qData = await quotaRes.json();
          setQuota(qData);
          setCurrentTier(qData.tier || 'personal');
        }
        if (overviewRes.ok) setWorkspaceBilling(await overviewRes.json());
        if (methodsRes.ok) setPaymentMethods((await methodsRes.json()).methods || []);
        if (invoicesRes.ok) setInvoices((await invoicesRes.json()).invoices || []);
      } catch (e) { console.error('Billing load failed:', e); }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleUpgrade = (plan) => {
    navigate(`/dashboard/checkout/${plan}`);
  };

  const refreshPaymentMethods = async () => {
    try {
      const liveToken = getStoredToken();
      const res = await fetch('/api/workspace/billing/payment-methods', { headers: { Authorization: `Bearer ${liveToken}` } });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setPaymentMethods(payload.methods || []);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    }
  };

  const refreshInvoices = async () => {
    try {
      const liveToken = getStoredToken();
      const res = await fetch('/api/workspace/billing/invoices', { headers: { Authorization: `Bearer ${liveToken}` } });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setInvoices(payload.invoices || []);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleAddPaymentMethod = async () => {
    setPmSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const liveToken = getStoredToken();
      const res = await fetch('/api/workspace/billing/payment-methods', {
        method: 'POST',
        headers: { Authorization: `Bearer ${liveToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: pmForm.card_number,
          exp_month: Number(pmForm.exp_month),
          exp_year: Number(pmForm.exp_year),
          holder_name: pmForm.holder_name,
          make_primary: Boolean(pmForm.make_primary)
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setShowAddMethod(false);
      setPmForm({ card_number: '', exp_month: '', exp_year: '', holder_name: '', make_primary: true });
      await refreshPaymentMethods();
      setMessage({ text: 'Payment method added.', type: 'success' });
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setPmSaving(false);
    }
  };

  const downloadExportCsv = async () => {
    try {
      const liveToken = getStoredToken();
      const res = await fetch('/api/workspace/billing/invoices/export', {
        headers: { Authorization: `Bearer ${liveToken}` }
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed with status ${res.status}`);

      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    }
  };

  const downloadReceipt = async (invoiceId, invoiceNumber) => {
    try {
      const liveToken = getStoredToken();
      const res = await fetch(`/api/workspace/billing/invoices/${invoiceId}/receipt`, {
        headers: { Authorization: `Bearer ${liveToken}` }
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed with status ${res.status}`);

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber || 'receipt'}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    }
  };

  const usedPct = quota ? Math.min(100, Math.round(((quota.used || 0) / Math.max(quota.limit, 1)) * 100)) : 0;

  if (loading) return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse space-y-8">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
      <div className="grid grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-96 bg-gray-100 dark:bg-gray-900 rounded-3xl" />)}</div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Billing & Plans</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Choose the plan that fits your scanning needs. Upgrade or downgrade anytime.</p>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
      )}

      {/* Current Usage */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Current Usage</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Plan: <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{currentTier}</span>
            </p>
          </div>
          <button onClick={() => navigate('/dashboard/scan')} className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Go Scan <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{quota?.used || 0} / {quota?.limit || 10} scans used</p>
          <span className={`text-sm font-black ${usedPct >= 85 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{usedPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${usedPct >= 85 ? 'bg-red-500' : usedPct >= 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${usedPct}%` }} />
        </div>
        {usedPct >= 85 && <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Approaching limit — upgrade to avoid disruption.</p>}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-headline font-extrabold text-gray-900 dark:text-white mb-2">Choose Your Plan</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">All plans include AI-powered OCR extraction. Payments are processed via Razorpay.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} currentTier={currentTier} onUpgrade={handleUpgrade} loading={upgrading === plan.id} />
          ))}
        </div>
      </div>

      {/* Workspace Billing: Payment Methods + Billing History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Payment Methods</h3>
            <button
              onClick={() => setShowAddMethod((v) => !v)}
              className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showAddMethod ? 'Cancel' : 'Add New'}
            </button>
          </div>

          {showAddMethod ? (
            <div className="space-y-3">
              <input
                value={pmForm.holder_name}
                onChange={(e) => setPmForm((p) => ({ ...p, holder_name: e.target.value }))}
                placeholder="Cardholder name"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={pmForm.card_number}
                onChange={(e) => setPmForm((p) => ({ ...p, card_number: e.target.value }))}
                placeholder="Card number"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={pmForm.exp_month}
                  onChange={(e) => setPmForm((p) => ({ ...p, exp_month: e.target.value }))}
                  placeholder="Exp month (MM)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={pmForm.exp_year}
                  onChange={(e) => setPmForm((p) => ({ ...p, exp_year: e.target.value }))}
                  placeholder="Exp year (YYYY)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={Boolean(pmForm.make_primary)}
                  onChange={(e) => setPmForm((p) => ({ ...p, make_primary: e.target.checked }))}
                />
                Make primary
              </label>
              <button
                onClick={handleAddPaymentMethod}
                disabled={pmSaving}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
              >
                {pmSaving ? 'Saving...' : 'Save Payment Method'}
              </button>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Note: This is a demo vault. Only the last 4 digits and expiry are stored.
              </p>
            </div>
          ) : null}

          <div className={`space-y-3 ${showAddMethod ? 'mt-5 pt-5 border-t border-gray-100 dark:border-gray-800' : ''}`}>
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No payment methods on file yet.</p>
            ) : (
              paymentMethods.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                      •••• {m.last4} <span className="text-gray-400 font-bold text-xs ml-2 uppercase">{m.brand}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expires {String(m.exp_month).padStart(2, '0')}/{String(m.exp_year).slice(-2)}
                    </p>
                  </div>
                  {m.is_primary ? (
                    <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Billing History</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {workspaceBilling?.billing_cycle?.period_label ? `Current cycle: ${workspaceBilling.billing_cycle.period_label}` : 'Invoices are generated after successful upgrades.'}
              </p>
            </div>
            <button
              onClick={downloadExportCsv}
              className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/40">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-sm text-gray-500 dark:text-gray-400">
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-950/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-extrabold text-gray-900 dark:text-white">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '--'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {inv.currency} {inv.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          String(inv.status || '').toLowerCase() === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {String(inv.status || 'paid')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => downloadReceipt(inv.id, inv.invoice_number)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pro tip — Razorpay keys */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 flex gap-4">
        <Star size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1">Enable Real Payments</p>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
            Add your Razorpay keys to <code className="bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded font-mono">intelliscan-server/.env</code>:
            {' '}<code className="bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_ID</code> and
            {' '}<code className="bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_SECRET</code>.
            Get them free from <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">razorpay.com</a> → Settings → API Keys → Test Mode.
          </p>
        </div>
      </div>
    </div>
  );
}
