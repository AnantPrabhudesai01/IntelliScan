import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Zap, Crown, Building2, RefreshCw, ArrowUpRight, Shield, Star, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getStoredToken } from '../utils/auth';
import apiClient from '../api/client';
import { formatCurrency, CURRENCY_SYMBOL } from '../utils/currency';
import ApiUsagePredictor from '../components/billing/ApiUsagePredictor';

// Frontend definitions for icons and local mapping only
const PLAN_ICONS = {
  personal: { icon: Shield, color: 'text-gray-400', bg: 'bg-white/10' },
  pro: { icon: Zap, color: 'text-brand-400', bg: 'bg-brand-500/20' },
  enterprise: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/20' }
};

function PlanCard({ plan, currentTier, onUpgrade, loading }) {
  const cfg = PLAN_ICONS[plan.id] || PLAN_ICONS.personal;
  const IconComp = cfg.icon;
  const isCurrentPlan = currentTier === plan.id;
  const tierWeights = { personal: 0, pro: 1, enterprise: 2 };
  const isDowngrade = tierWeights[plan.id] < tierWeights[currentTier];
  
  const isPro = plan.id === 'pro';
  
  const features = Array.isArray(plan.features) ? plan.features : [];
  const negatives = Array.isArray(plan.negatives) ? plan.negatives : [];

  return (
    <div className={`relative rounded-[32px] border-hairline p-8 flex flex-col transition-all duration-500 hover:shadow-2xl 
      ${isPro 
        ? 'border-[var(--brand)] bg-[var(--brand)]/5 shadow-[var(--brand)]/5' 
        : 'border-[var(--border-subtle)] bg-[var(--surface-card)]'}`}>
      
      {plan.badge && (
        <span className={`absolute -top-3 left-8 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm 
          ${isPro ? 'bg-[var(--brand)] text-white' : 'bg-[var(--text-main)] text-[var(--surface)]'}`}>
          {plan.badge}
        </span>
      )}

      <div className="flex items-center gap-4 mb-8 pt-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--brand)]/10`}>
          <IconComp size={24} className="text-[var(--brand)]" />
        </div>
        <h3 className="font-headline font-black italic text-2xl text-[var(--text-main)] uppercase tracking-tighter">{plan.name}</h3>
      </div>

      <div className="mb-8">
        {plan.price === 0 ? (
          <p className="text-4xl font-headline font-black text-[var(--text-main)] italic tracking-tighter">Selection</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[var(--text-muted)]">{CURRENCY_SYMBOL}</span>
            <span className="text-5xl font-headline font-black text-[var(--text-main)] italic tracking-tighter">{formatCurrency(plan.price)}</span>
            <span className="text-[var(--text-muted)] font-black text-[10px] uppercase ml-2">/ cycle</span>
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-3 text-sm font-semibold text-[var(--text-muted)] group">
            <CheckCircle2 size={18} className="shrink-0 text-[var(--brand)] transition-transform group-hover:scale-110" />
            {f}
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="py-4 rounded-2xl bg-[var(--surface)] border-hairline border-[var(--border-strong)] text-center text-[10px] font-black uppercase tracking-widest text-[var(--brand)]">Current Active Tier</div>
      ) : (
        <button onClick={() => onUpgrade(plan.id)} disabled={loading}
          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg 
            ${isPro 
              ? 'bg-[var(--brand)] hover:brightness-110 text-white shadow-[var(--brand)]/20' 
              : 'bg-[var(--text-main)] text-[var(--surface)] hover:opacity-90 shadow-black/10'
            } disabled:opacity-60`}>
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <><Sparkles size={16} /> {isDowngrade ? `Switch to ${plan.name}` : `Upgrade to ${plan.name}`}</>}
        </button>
      )}
    </div>
  );
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { tier: contextTier, refreshAuth } = useRole();
  const token = getStoredToken();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState(contextTier || 'personal');
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
        const [plansRes, quotaRes, overviewRes, methodsRes, invoicesRes] = await Promise.all([
          apiClient.get('/billing/plans'),
          apiClient.get('/user/quota'),
          apiClient.get('/workspace/billing/overview'),
          apiClient.get('/workspace/billing/payment-methods'),
          apiClient.get('/workspace/billing/invoices')
        ]);
        
        if (plansRes.data?.plans) setPlans(plansRes.data.plans);
        if (quotaRes.data) {
          const qData = quotaRes.data;
          setQuota(qData);
          // Standardize tier detection: Prefer context (JWT) but allow quota (API) fallback
          setCurrentTier(contextTier || qData.tier || 'personal');
        }
        if (overviewRes.data) setWorkspaceBilling(overviewRes.data);
        if (methodsRes.data?.methods) setPaymentMethods(methodsRes.data.methods);
        if (invoicesRes.data?.invoices) setInvoices(invoicesRes.data.invoices);
      } catch (e) { 
        console.error('Billing load failed:', e);
        // Fallback for plans if they are empty
        setPlans([
          { id: 'personal', name: 'Personal', price: 0, badge: 'Starter', features: ['100 Scan Credits / mo', 'Basic OCR Engine', 'Personal Workspace', 'Mobile Web App Access'] },
          { id: 'pro', name: 'Pro', price: 49, badge: 'Advanced', features: ['5,000 Scan Credits / mo', 'Pro Vision AI Engine', 'AI Networking Coach', 'Digital Business Card', '24/7 Priority Support'] },
          { id: 'enterprise', name: 'Enterprise', price: 1999, badge: 'Scale', features: ['Unlimited Scan Credits', 'Custom AI Training', 'Team Management', 'Export to any CRM', 'Priority API Access', 'Single Sign-On (SSO)'] }
        ]);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleUpgrade = (planId) => {
    navigate(`/dashboard/checkout/${planId}`);
  };

  const refreshPaymentMethods = async () => {
    try {
      const res = await apiClient.get('/workspace/billing/payment-methods');
      const payload = res.data;
      setPaymentMethods(payload.methods || []);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    }
  };

  const refreshInvoices = async () => {
    try {
      const res = await apiClient.get('/workspace/billing/invoices');
      const payload = res.data;
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
      const res = await apiClient.get('/workspace/billing/invoices/export');
      const text = res.data;

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
      const res = await apiClient.get(`/workspace/billing/invoices/${invoiceId}/receipt`);
      const text = res.data;

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
              Plan: <span className="font-bold text-brand-600 dark:text-brand-400 uppercase">{currentTier}</span>
            </p>
          </div>
          <button onClick={() => navigate('/dashboard/scan')} className="flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Go Scan <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="flex justify-between items-end mb-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{quota?.used || 0} / {quota?.limit || 10} scans used</p>
          <span className={`text-sm font-black ${usedPct >= 85 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{usedPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${usedPct >= 85 ? 'bg-red-500' : usedPct >= 60 ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${usedPct}%` }} />
        </div>
        {usedPct >= 85 && <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Approaching limit — upgrade to avoid disruption.</p>}

        {/* Auto-pay Toggle */}
        {currentTier !== 'personal' && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Auto-Pay Renewal</h4>
              <p className="text-xs text-gray-500">Automatically renew your {currentTier} plan when it expires.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={quota?.auto_pay || false}
                onChange={async (e) => {
                  const enabled = e.target.checked;
                  try {
                    const res = await fetch('/api/billing/auto-pay', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ enabled })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setQuota(prev => ({ ...prev, auto_pay: data.auto_pay }));
                    setMessage({ text: data.message, type: 'success' });
                  } catch (err) {
                    setMessage({ text: err.message, type: 'error' });
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
            </label>
          </div>
        )}
      </div>

      <ApiUsagePredictor />

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
              className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline"
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
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={pmForm.card_number}
                onChange={(e) => setPmForm((p) => ({ ...p, card_number: e.target.value }))}
                placeholder="Card number"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={pmForm.exp_month}
                  onChange={(e) => setPmForm((p) => ({ ...p, exp_month: e.target.value }))}
                  placeholder="Exp month (MM)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  value={pmForm.exp_year}
                  onChange={(e) => setPmForm((p) => ({ ...p, exp_year: e.target.value }))}
                  placeholder="Exp year (YYYY)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60"
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
              className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline"
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
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
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
      <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/50 rounded-2xl p-6 flex gap-4">
        <Star size={20} className="text-brand-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-brand-900 dark:text-brand-200 text-sm mb-1">Enable Real Payments</p>
          <p className="text-xs text-brand-700 dark:text-brand-400 leading-relaxed">
            Add your Razorpay keys to <code className="bg-brand-100 dark:bg-brand-900 px-1.5 py-0.5 rounded font-mono">intelliscan-server/.env</code>:
            {' '}<code className="bg-brand-100 dark:bg-brand-900 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_ID</code> and
            {' '}<code className="bg-brand-100 dark:bg-brand-900 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_SECRET</code>.
            Get them free from <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">razorpay.com</a> → Settings → API Keys → Test Mode.
          </p>
        </div>
      </div>
    </div>
  );
}
