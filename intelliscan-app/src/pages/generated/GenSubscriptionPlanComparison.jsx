import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Mail, ArrowRight, ChevronDown, ChevronUp, Star, ShieldCheck, Globe, Database, Cpu, Layers, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStoredToken, safeReadStoredUser } from '../../utils/auth.js';
import checkoutService from '../../utils/checkoutService';

const COMPARISON_DATA = [
  { feature: 'Monthly AI Credit Points', starter: '100', advanced: '5,000', scale: 'Unlimited' },
  { feature: 'Core Scanning Engine', starter: 'Gemini Flash', advanced: 'Gemini Pro Vision', scale: 'Custom Training' },
  { feature: 'OCR Confidence Scoring', starter: 'Basic', advanced: 'High Precision', scale: 'Deep Metadata' },
  { feature: 'CRM Integration', starter: 'Not Included', advanced: 'Live Sync', scale: 'Custom Bridge' },
  { feature: 'Google Sheets Export', starter: 'Manual CSV', advanced: 'Real-time Push', scale: 'Unlimited Sync' },
  { feature: 'AI Follow-up Drafts', starter: 'Basic Templates', advanced: 'Ultra Personalized', scale: 'Persona Mimicry' },
  { feature: 'API Access', starter: 'No', advanced: 'Standard REST', scale: 'Whitelabel + Webhooks' },
  { feature: 'Workspace Members', starter: '1 Seat', advanced: 'up to 10 Seats', scale: 'Unlimited' },
  { feature: 'Support Tier', starter: 'Community', advanced: 'Priority Email', scale: 'Dedicated Manager' },
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
  
  const user = safeReadStoredUser();
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

    if (user?.tier === planId) {
      showToast('You are already on this plan!', 'info');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await checkoutService.handleUpgrade(planId, setStatusText);
      if (result.success) {
        showToast(result.message || 'Payment Successful! Your account is being upgraded...');
        setTimeout(() => navigate('/dashboard/scan'), 1500);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setStatusText(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white selection:bg-indigo-500/30 font-sans pb-24 overflow-x-hidden relative">
      
      {/* Dynamic Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-2xl shadow-indigo-500/20"></div>
          <p className="text-lg font-black italic uppercase tracking-tighter animate-pulse">{statusText || 'Processing secure payment...'}</p>
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in slide-in-from-bottom-2">
          <Zap size={14} className="fill-current"/> INTELLISCAN TIER SYSTEM 2.0
        </div>
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 leading-none mb-8">
          SCALE YOUR <br/> NETWORKING.
        </h1>
        <p className="max-w-xl mx-auto text-gray-400 text-lg leading-relaxed font-medium">
          Unlock industrial-grade AI precision and real-time CRM synchronization with our project-tailored professional plans.
        </p>
      </div>

      {/* Pricing Grids */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
        
        {/* Starter Plan */}
        <div className="group bg-white/5 border border-white/10 rounded-[32px] p-10 flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500 hover:shadow-2xl shadow-indigo-500/5">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">PERSONAL</span>
              <Layers size={20} className="text-gray-500" />
            </div>
            <h3 className="text-4xl font-extrabold italic tracking-tighter mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black">₹0</span>
              <span className="text-gray-500 text-xs font-bold uppercase">/ Forever</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">Essential tools for individual professionals building their first digital database.</p>
            <ul className="space-y-4 mb-12">
              {[
                { label: '100 AI Credit Points / mo', ok: true },
                { label: 'Gemini Flash Engine', ok: true },
                { label: 'Basic CRM Export', ok: true },
                { label: 'Standard Community Support', ok: true }
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                  <Check size={16} className="text-indigo-500 stroke-[3px]" /> {f.label}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => isLoggedIn ? navigate('/dashboard/scan') : navigate('/sign-up')} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-[0.98]">
            {isLoggedIn ? 'Access Scanner' : 'Create Free Account'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative group bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-[32px] p-10 flex flex-col justify-between shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] transition-all duration-500 z-10 border border-white/10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#161c28] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
            <Star size={12} className="fill-current" /> MOST RECOMMENDED
          </div>
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-black/10 px-3 py-1 rounded-full">PROFESSIONAL</span>
              <Cpu size={20} className="text-indigo-200" />
            </div>
            <h3 className="text-4xl font-extrabold italic tracking-tighter text-white mb-2">Advanced</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-white">₹49</span>
              <span className="text-indigo-200 text-sm font-bold uppercase">/ mo</span>
            </div>
            <p className="text-indigo-100/70 text-sm font-medium leading-relaxed mb-10">Industrial-grade precision for high-volume networking and automated CRM delivery.</p>
            <ul className="space-y-4 mb-12">
              {[
                '5,000 AI Credit Points / mo',
                'Gemini Pro Vision Engine',
                'Real-time CRM Sync (Live)',
                'Priority Verification Support',
                'Custom AI Identity Policy'
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                  <Check size={18} className="text-indigo-200 bg-white/10 p-0.5 rounded-full stroke-[3px]" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => handleUpgrade('pro')} className="w-full py-5 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <Zap size={16} fill="currentColor"/> {user?.tier === 'pro' ? 'Current Plan' : 'UPGRADE NOW'}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="group bg-white/5 border border-white/10 rounded-[32px] p-10 flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500 hover:shadow-2xl shadow-indigo-500/5">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">ENTERPRISE</span>
              <Globe size={20} className="text-gray-500" />
            </div>
            <h3 className="text-4xl font-extrabold italic tracking-tighter mb-2">Scale</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black font-headline tracking-tighter uppercase italic">CUSTOM</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">Industrial scale scanning for organizations requiring dedicated infra and custom AI training.</p>
            <ul className="space-y-4 mb-12">
              {[
                'Unlimited Bulk Scans',
                'SSO / SAML Security',
                'Dedicated Success Manager',
                'Whitelabel Card Systems',
                'Workspace API Cluster'
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                  <Check size={16} className="text-indigo-500 stroke-[3px]" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => setShowSalesModal(true)} className="w-full py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Mail size={16} /> TALK TO SALES
          </button>
        </div>
      </div>

      {/* Detail Matrix */}
      <section className="mt-32 max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Feature Comparison Matrix</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>
        
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Infrastructure Layers</th>
                <th className="px-8 py-6 text-sm font-black italic tracking-tight">Starter</th>
                <th className="px-8 py-6 text-sm font-black italic tracking-tight text-indigo-400 underline decoration-indigo-400/30 decoration-4 underline-offset-8">Advanced</th>
                <th className="px-8 py-6 text-sm font-black italic tracking-tight">Scale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-5 text-xs font-bold text-gray-400">{row.feature}</td>
                  <td className="px-8 py-5 text-xs font-medium text-gray-500">{row.starter}</td>
                  <td className="px-8 py-5 text-xs font-black text-white italic">{row.advanced}</td>
                  <td className="px-8 py-5 text-xs font-medium text-white/50">{row.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security Banner */}
      <div className="max-w-4xl mx-auto px-6 mt-24">
        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-lg font-black italic tracking-tight uppercase">Bank-Grade Transactions</h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Secured by Razorpay. 256-Bit SSL Encryption.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 saturate-0 opacity-50">
            <div className="text-[10px] font-black tracking-[.2em] uppercase border-r border-white/10 pr-6 hidden md:block">WE ACCEPT</div>
            <span className="font-extrabold italic text-sm tracking-tighter italic">VISA</span>
            <span className="font-extrabold italic text-sm tracking-tighter italic">MASTERCARD</span>
            <span className="font-extrabold italic text-sm tracking-tighter italic">UPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
