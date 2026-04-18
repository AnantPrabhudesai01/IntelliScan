import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

export default function ForgotPassword() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    loginWithRedirect({
      authorizationParams: {
        initial_screen: 'forgot-password',
        login_hint: email
      }
    });
  };

  return (
    <div className="bg-[var(--surface)] text-[var(--text-main)] min-h-screen flex items-center justify-center p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background detail */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--brand)]/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--brand)]/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="mb-10">
          <Link to="/sign-in" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--brand)] transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Matrix
          </Link>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden premium-grain">
          <div className="w-20 h-20 bg-[var(--brand)]/10 rounded-[1.5rem] flex items-center justify-center border border-[var(--brand)]/20 shadow-inner mb-10">
            <KeyRound size={36} className="text-[var(--brand)]" />
          </div>

          <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-4 leading-tight">Key Recovery <br/>Protocol</h1>
          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] font-label mb-10">Initiate secure authentication handshake</p>

          <form className="space-y-8 relative z-10" onSubmit={handleReset}>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label" htmlFor="email">Identity Hash (Email)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" />
                </div>
                <input 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl py-5 pl-12 pr-6 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all outline-none font-medium" 
                  id="email" placeholder="name@company.com" required type="email"
                />
              </div>
            </div>

            <button disabled={isLoading} className="w-full bg-[var(--brand)] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand)]/20 italic font-headline" type="submit">
              {isLoading ? 'Establishing Link...' : 'Continue to Reset Portal'}
            </button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--surface-card)] p-6 rounded-3xl border border-[var(--border-subtle)] flex items-start gap-4 shadow-lg premium-grain">
            <ShieldCheck size={24} className="text-[var(--brand)] shrink-0" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)]">Handshake Expiry</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-medium">Links expire after 24 hours for security.</p>
            </div>
          </div>
          <div className="bg-[var(--surface-card)] p-6 rounded-3xl border border-[var(--border-subtle)] flex items-start gap-4 shadow-lg premium-grain">
            <HelpCircle size={24} className="text-[var(--brand)] shrink-0" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)]">Infrastructure Support</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-medium">Need help? <a href="#" className="text-[var(--brand)] hover:underline">Contact Admin</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
