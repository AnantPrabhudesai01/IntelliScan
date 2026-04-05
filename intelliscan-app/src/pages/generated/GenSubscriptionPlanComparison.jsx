import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Mail, ArrowRight, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

const FAQS = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'What happens if I exceed my scan limit?', a: 'On the Pro plan, you can purchase scan top-ups or simply upgrade. On the Free plan, scanning will be paused until the next month.' },
  { q: 'How accurate is the Gemini AI Engine?', a: 'Gemini provides up to 99.8% accuracy on handwritten and complex structural documents, significantly outperforming standard OCR engines.' },
  { q: 'Do you offer discounts for non-profits?', a: 'Absolutely. We offer a 50% discount for registered non-profit organizations. Please contact our support team to apply.' },
];

function ContactSalesModal({ onClose }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', employees: '500-2000', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!form.name || !form.email) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Talk to Sales</h2>
            <p className="text-sm text-gray-400 mt-0.5">Custom Enterprise plan — tailored for your team</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"><X size={20} /></button>
        </div>
        {sent ? (
          <div className="px-8 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
            <p className="text-gray-400 text-sm">Our enterprise team will reach out within 24 hours at <strong className="text-white">{form.email}</strong></p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">Close</button>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name" className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Company</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Work Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Team Size</label>
                <select value={form.employees} onChange={e => setForm(f => ({ ...f, employees: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {['1-50', '50-200', '200-500', '500-2000', '2000+'].map(v => <option key={v} value={v}>{v} employees</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Message (optional)</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Tell us about your use case..." className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>
            </div>
            <div className="px-8 py-5 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all">Cancel</button>
              <button onClick={handleSend} disabled={sending || !form.name || !form.email}
                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                {sending ? 'Sending...' : <><Mail size={15} /> Send Request</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GenSubscriptionPlanComparison() {
  const navigate = useNavigate();
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [toast, setToast] = useState(null);

  const isLoggedIn = !!getStoredToken();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) { navigate('/dashboard/scan'); showToast('Welcome! Start scanning your first card.'); }
    else navigate('/sign-up');
  };

  const handleUpgradePro = async () => {
    if (!isLoggedIn) { navigate('/sign-up?plan=pro'); return; }
    
    try {
      showToast('Processing simulated payment for Professional upgrade (₹49/mo)...');
      const token = getStoredToken();
      const res = await fetch('/api/user/simulate-upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'pro' })
      });
      
      if (res.ok) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.tier = 'pro';
        localStorage.setItem('user', JSON.stringify(userData));
        
        showToast('Success! Your account is now PROFESSIONAL. Refreshing...');
        setTimeout(() => {
          navigate('/dashboard/scan');
          window.location.reload();
        }, 1500);
      } else {
        showToast('Upgrade failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to upgrade service.');
    }
  };

  const handleEnterpriseUpgrade = async () => {
    if (!isLoggedIn) { navigate('/sign-up?plan=enterprise'); return; }
    
    try {
      showToast('Initiating Enterprise Provisioning (Simulation)...');
      const token = getStoredToken();
      const res = await fetch('/api/user/simulate-upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'enterprise' })
      });
      
      if (res.ok) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.tier = 'enterprise';
        localStorage.setItem('user', JSON.stringify(userData));
        
        showToast('Success! Enterprise Access Granted. Boosting credits...');
        setTimeout(() => {
          navigate('/dashboard/scan');
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTrial = () => {
    if (isLoggedIn) navigate('/dashboard/scan');
    else navigate('/sign-up?plan=trial');
  };

  return (
    <div className="w-full p-6 md:p-10 animate-fade-in relative">
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3">
          <Check size={16} /> {toast}
        </div>
      )}
      {showSalesModal && <ContactSalesModal onClose={() => setShowSalesModal(false)} />}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Start free, scale as you grow. No hidden fees, no surprises.</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">

        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">STARTER</span>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-1">Free</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">For individuals exploring AI-powered OCR capabilities.</p>
            <ul className="space-y-3 mb-10">
              {['100 Credit Points / month', 'Gemini OCR Engine'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
              {['No API Access', 'Community Support'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
                  <X size={16} className="text-red-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleGetStarted} className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all active:scale-95">
            {isLoggedIn ? 'Go to Scanner →' : 'Get Started Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative bg-indigo-600 p-8 rounded-2xl flex flex-col justify-between shadow-2xl shadow-indigo-500/30 hover:-translate-y-1 transition-transform scale-[1.03]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Star size={11} fill="currentColor" /> Most Popular
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">ADVANCED</span>
            <div className="flex items-baseline gap-1 mt-2 mb-1">
              <span className="text-5xl font-extrabold text-white">₹49</span>
              <span className="text-indigo-300 text-sm">/mo</span>
            </div>
            <p className="text-indigo-200 text-sm mb-8">Enhanced precision for growing teams and automated workflows.</p>
            <ul className="space-y-3 mb-10">
              {['5,000 Credit Points / month', 'Gemini AI Engine (Ultra Precision)', 'Full API Access', 'Priority Email Support'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <Check size={16} className="text-indigo-200 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleUpgradePro} className="w-full py-3.5 rounded-xl bg-white text-indigo-600 font-bold shadow-lg hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Zap size={18} /> Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">SCALE</span>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-1">Custom</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Industrial-grade scanning solutions for massive data volumes.</p>
            <ul className="space-y-3 mb-10">
              {['Unlimited Credit Points', 'Custom AI Model Training', 'SSO & SAML Auth', 'Dedicated Account Manager'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleEnterpriseUpgrade} className="w-full py-3.5 rounded-xl border-2 border-indigo-600 bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
            <Zap size={18} /> Simulate Enterprise Upgrade
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <section className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Engineered for Transparency</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest text-left border-b border-gray-200 dark:border-gray-800">
              <tr>
                {['Features', 'Free', 'Professional', 'Enterprise'].map(h => (
                  <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {[
                ['Credit Points', '100 / mo', '5,000 / mo', 'Unlimited'],
                ['Core Engine', 'Gemini Flash', 'Gemini Pro Vision', 'Custom Hybrid'],
                ['OCR Confidence Scoring', 'Basic', 'High Precision', 'Deep Metadata'],
                ['API Endpoints', 'None', 'Standard REST', 'Dedicated + Webhooks'],
                ['Single Sign-On (SSO)', 'No', 'No', 'Included'],
              ].map(([feature, free, pro, ent]) => (
                <tr key={feature} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{feature}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{free}</td>
                  <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">{pro}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <h4 className="text-gray-900 dark:text-white font-bold pr-4">{faq.q}</h4>
                {openFaq === i ? <ChevronUp size={20} className="text-indigo-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6">
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mt-20 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-12 text-center max-w-5xl mx-auto shadow-xl shadow-indigo-500/20">
        <h2 className="text-4xl font-extrabold text-white mb-4">Ready to digitize at scale?</h2>
        <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-10">Join 10,000+ developers and companies processing millions of documents every day with IntelliScan.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleStartTrial} className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight size={18} />
          </button>
          <button onClick={() => setShowSalesModal(true)} className="bg-indigo-800/50 text-white font-bold px-8 py-4 rounded-xl border border-white/10 hover:bg-indigo-800/70 transition-all active:scale-95">
            Talk to an Expert
          </button>
        </div>
      </section>
    </div>
  );
}