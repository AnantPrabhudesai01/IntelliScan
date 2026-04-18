import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Mail, ArrowRight, ChevronDown, ChevronUp, Star, ShieldCheck, Globe, Database, Cpu, Layers, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStoredToken, safeReadStoredUser } from '../../utils/auth.js';
import { useRole } from '../../context/RoleContext';
import checkoutService from '../../utils/checkoutService';

const COMPARISON_DATA = [
  { feature: 'Monthly AI Credit Points', free: '100', pro: '5,000', enterprise: 'Unlimited' },
  { feature: 'Core Scanning Engine', free: 'Gemini Flash', pro: 'Gemini Pro Vision', enterprise: 'Custom Training' },
  { feature: 'OCR Confidence Scoring', free: 'Basic', pro: 'High Precision', enterprise: 'Deep Metadata' },
  { feature: 'CRM Integration', free: 'Not Included', pro: 'Live Sync', enterprise: 'Custom Bridge' },
  { feature: 'Google Sheets Export', free: 'Manual CSV', pro: 'Real-time Push', enterprise: 'Unlimited Sync' },
  { feature: 'AI Follow-up Drafts', free: 'Basic Templates', pro: 'Ultra Personalized', enterprise: 'Persona Mimicry' },
  { feature: 'API Access', free: 'No', pro: 'Standard REST', enterprise: 'Whitelabel + Webhooks' },
  { feature: 'Workspace Members', free: '1 Seat', pro: 'up to 10 Seats', enterprise: 'Unlimited' },
  { feature: 'Support Tier', free: 'Community', pro: 'Priority Email', enterprise: 'Dedicated Manager' },
];

function ContactSalesModal({ onClose }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!form.name || !form.email) return;
    setSending(true);
    // Mimic real API call
    setTimeout(() => { setSending(false); setSent(true); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#161c28] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="px-8 py-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">SCALE WITH INTELLISCAN</h2>
          <p className="text-sm text-gray-400 mt-1">Talk to our Enterprise architects about your custom needs.</p>
        </div>
        {sent ? (
          <div className="px-8 py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Request Received!</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">We'll be in touch within 4 business hours to discuss your custom solution.</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-white text-[#161c28] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Close Window</button>
          </div>
        ) : (
          <div className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Professional Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Corporate Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="john@enterprise.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Requirements</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="How many cards do you process monthly?" />
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-gray-400 tracking-widest hover:text-white transition-colors">Dismiss</button>
              <button onClick={handleSend} disabled={sending || !form.name || !form.email} className="flex-[2] py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 group transition-all">
                {sending ? <RefreshCw className="animate-spin" size={16} /> : <><Sparkles size={16} className="group-hover:rotate-12 transition-transform"/> Submit Proposal</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GenSubscriptionPlanComparison() {
  const navigate = useNavigate();
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState(null);
  const [toast, setToast] = useState(null);
  
  const { tier, refreshAuth } = useRole();
  const [plans, setPlans] = useState([
    { id: 'personal', name: 'Personal', price: 0, badge: 'Starter', features: ['100 Scan Credits / month', 'Gemini Flash OCR Engine', 'Basic AI Follow-up Drafts', 'Community Documentation'] },
    { id: 'pro', name: 'Pro', price: 49, badge: 'Advanced', features: ['5,000 Scan Credits / month', 'Gemini Pro Vision Engine', 'Real-time CRM Sync (Live)', 'Priority Verification Support'] },
    { id: 'enterprise', name: 'Enterprise', price: 1999, badge: 'Scale', features: ['Unlimited Scan Credits', 'Custom AI Training', 'SSO & SAML Security', 'Dedicated Account Manager'] }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/billing/plans');
        if (res.data?.plans) {
          setPlans(res.data.plans);
        }
      } catch (err) {
        console.error('Failed to load plans from API, using defaults:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const isLoggedIn = !!getStoredToken();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpgrade = async (planId) => {
    if (!isLoggedIn) {
      navigate(`/sign-up?plan=${planId}`);
      return;
    }

    if (tier === planId) {
      showToast('You are already on this plan!', 'info');
      return;
    }

    navigate(`/dashboard/checkout/${planId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-main)] selection:bg-[var(--brand)]/30 font-sans pb-24 overflow-x-hidden relative">
      
      {/* Dynamic Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--brand)]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin mb-6 shadow-2xl shadow-[var(--brand)]/20"></div>
          <p className="text-lg font-headline font-black italic uppercase tracking-tighter animate-pulse">{statusText || 'Processing secure payment...'}</p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-4 
          ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
        </div>
      )}

      {showSalesModal && <ContactSalesModal onClose={() => setShowSalesModal(false)} />}

      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-500">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Workspace</span>
          <ArrowRight size={10} />
          <span className="text-white">Subscription & Tier Comparison</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 text-center pt-12 pb-20 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-[var(--brand)] text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in slide-in-from-bottom-2">
          <Zap size={14} className="fill-current"/> INTELLISCAN TIER SYSTEM 2.0
        </div>
        <h1 className="text-6xl md:text-8xl font-headline font-black italic tracking-tighter text-[var(--text-main)] leading-none mb-8">
          SCALE YOUR <br/> NETWORKING.
        </h1>
        <p className="max-w-xl mx-auto text-[var(--text-muted)] text-lg leading-relaxed font-medium">
          Unlock industrial-grade AI precision and real-time CRM synchronization with our architectural tier infrastructure.
        </p>
 
        {/* Current Plan Badge */}
        {isLoggedIn && (
          <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-sm animate-in zoom-in-95">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Current Active Tier: <span className="text-[var(--text-main)] ml-1">{tier.toUpperCase()}</span>
            </p>
          </div>
        )}
      </div>

      {/* Pricing Grids */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
        {loading ? (
          <div className="lg:col-span-3 text-center py-20 text-[var(--text-muted)] font-bold">Loading Tier Catalog...</div>
        ) : (
          plans.map((p) => {
            const isPro = p.id === 'pro';
            const isEnt = p.id === 'enterprise';
            const isCurrent = tier === p.id;
            
            return (
              <div key={p.id} className={`group relative rounded-[32px] p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl 
                ${isPro 
                  ? 'bg-[var(--brand)] text-white shadow-[var(--brand)]/20 z-10 border border-white/10' 
                  : 'bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-colors'
                }`}>
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[var(--brand)] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                    <Star size={12} className="fill-current" /> MOST RECOMMENDED
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 
                      ${isPro ? 'text-white/70 bg-black/10' : 'text-[var(--text-muted)] bg-[var(--surface)]'}`}>
                      {p.badge || p.name.toUpperCase()}
                    </span>
                    {isPro ? <Cpu size={20} className="text-indigo-200" /> : isEnt ? <Globe size={20} className="text-[var(--text-muted)]" /> : <Layers size={20} className="text-[var(--text-muted)]" />}
                  </div>
                  
                  <h3 className={`text-4xl font-headline font-black italic tracking-tighter mb-2 ${isPro ? 'text-white' : ''}`}>{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    {p.price === 0 ? (
                      <span className={`text-4xl font-headline font-black italic ${isPro ? 'text-white' : ''}`}>Free</span>
                    ) : (
                      <>
                        <span className={`text-3xl font-headline font-black ${isPro ? 'text-white' : 'text-[var(--text-main)]'}`}>₹{p.price.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold uppercase ${isPro ? 'text-indigo-200' : 'text-[var(--text-muted)]'} ml-2`}>/ cycle</span>
                      </>
                    )}
                  </div>
                  
                  <p className={`text-sm font-medium leading-relaxed mb-10 ${isPro ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {p.id === 'personal' ? 'Essential tools for individual professionals building their first digital database.' : isPro ? 'Industrial-grade precision for high-volume networking and automated CRM delivery.' : 'Industrial scale scanning for organizations requiring dedicated infra and custom AI training.'}
                  </p>
                  
                  <ul className="space-y-4 mb-12">
                    {p.features?.map((f, i) => (
                      <li key={i} className={`flex items-center gap-3 text-sm font-bold ${isPro ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                        <Check size={18} className={`${isPro ? 'text-indigo-200 bg-white/10 p-0.5 rounded-full' : 'text-[var(--brand)]'} stroke-[3px]`} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
 
                <button 
                  onClick={() => isEnt && !isCurrent ? setShowSalesModal(true) : handleUpgrade(p.id)} 
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                      : isPro 
                        ? 'bg-white text-[var(--brand)] shadow-xl hover:bg-white/90' 
                        : 'bg-[var(--text-main)] text-[var(--surface)] hover:opacity-90 shadow-lg'
                  }`}
                >
                  {isCurrent ? <><Check size={16} strokeWidth={4} /> Current Plan</> : isEnt ? <><Mail size={16} /> TALK TO SALES</> : <><Zap size={16} /> Upgrade Now</>}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Matrix */}
      <section className="mt-32 max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border-subtle)]"></div>
          <h2 className="text-3xl font-headline font-black italic uppercase tracking-tighter">Feature Matrix</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border-subtle)]"></div>
        </div>
        
        <div className="overflow-hidden rounded-[32px] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface)] border-b border-[var(--border-subtle)]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Infrastructure Layers</th>
                <th className="px-8 py-6 text-sm font-headline font-black italic tracking-tight">Free</th>
                <th className="px-8 py-6 text-sm font-headline font-black italic tracking-tight text-[var(--brand)] underline decoration-[var(--brand)]/30 decoration-4 underline-offset-8">Pro</th>
                <th className="px-8 py-6 text-sm font-headline font-black italic tracking-tight">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--surface)]/50 transition-all group font-medium">
                  <td className="px-8 py-5 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]/20 group-hover:bg-[var(--brand)]"></div>
                    {row.feature}
                  </td>
                  <td className="px-8 py-5 text-xs text-[var(--text-muted)]">{row.free}</td>
                  <td className="px-8 py-5 text-xs font-black text-[var(--brand)] italic bg-[var(--brand)]/[0.02] border-x border-[var(--border-subtle)]">{row.pro}</td>
                  <td className="px-8 py-5 text-xs text-[var(--text-muted)]">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security Banner */}
      <div className="max-w-4xl mx-auto px-6 mt-24">
        <div className="bg-[var(--brand)]/5 border border-[var(--brand)]/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--brand)] rounded-2xl text-white shadow-xl shadow-[var(--brand)]/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-lg font-headline font-black italic tracking-tight uppercase">Architectural Transactions</h4>
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Secured by Razorpay. 256-Bit SSL Encryption.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 saturate-0 opacity-30">
            <div className="text-[10px] font-black tracking-[.2em] uppercase border-r border-[var(--border-subtle)] pr-6 hidden md:block text-[var(--text-muted)]">WE ACCEPT</div>
            <span className="font-extrabold italic text-sm tracking-tighter italic text-[var(--text-main)]">VISA</span>
            <span className="font-extrabold italic text-sm tracking-tighter italic text-[var(--text-main)]">MASTERCARD</span>
            <span className="font-extrabold italic text-sm tracking-tighter italic text-[var(--text-main)]">UPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
