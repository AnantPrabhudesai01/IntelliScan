import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ScanLine, User, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PublicLayout from '../layouts/PublicLayout';

export default function SignUpPage() {
  const { loginWithRedirect, isLoading: authLoading } = useAuth0();
  const location = useLocation();
  const [authError, setAuthError] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Check for Auth0 error params in URL
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      setAuthError({
        title: error.replace(/_/g, ' '),
        message: errorDescription || 'An unexpected error occurred during account creation.'
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    loginWithRedirect({ 
      authorizationParams: { 
        screen_hint: 'signup',
        login_hint: email
      } 
    });
  };
  return (
    <PublicLayout hideFooter>
      <div className="text-[var(--text-main)] selection:bg-[var(--brand)] selection:text-white overflow-y-auto font-body transition-colors duration-300">
        <main className="relative flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-20 overflow-hidden bg-[var(--surface)]">
          {/* Ambient Detail */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--brand)]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--brand)]/5 rounded-full blur-[120px]"></div>
          </div>

          {/* Auth Card Container */}
          <div className="relative z-10 w-full max-w-md">
            {/* Card Shell */}
            <div className="bg-[var(--surface-card)] rounded-[3rem] p-8 md:p-14 shadow-2xl border border-[var(--border-subtle)] relative overflow-hidden transition-colors duration-300 premium-grain">
              
              {/* Branding & Intro */}
              <div className="text-center mb-12 relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-[var(--brand)]/10 mb-8 border border-[var(--brand)]/20 shadow-inner">
                  <ScanLine className="text-[var(--brand)]" size={36} />
                </div>
                <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-3">Initialize Node</h1>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] font-label">Establish new workspace link</p>
              </div>

              {/* Form Fields */}
              <form className="space-y-6 relative z-10" onSubmit={handleRegister}>
                {authError && (
                  <div className="mb-6 animate-shake">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">{authError.title}</h4>
                        <p className="text-red-500/70 text-[10px] leading-relaxed font-medium">{authError.message}</p>
                      </div>
                      <button type="button" onClick={() => setAuthError(null)} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                    </div>
                    <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-12 pr-5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all font-medium outline-none" placeholder="Master User" type="text" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Identity Hash (Email)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                    </div>
                    <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-12 pr-5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all font-medium outline-none" placeholder="name@company.com" type="email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Vault Key</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                      </div>
                      <input value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-12 pr-5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all font-medium outline-none" placeholder="••••••••" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Verify Key</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                      </div>
                      <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-12 pr-5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all font-medium outline-none" placeholder="••••••••" type="password" />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button disabled={authLoading} className="w-full bg-[var(--brand)] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand)]/20 italic font-headline flex items-center justify-center gap-3" type="submit">
                    {authLoading ? 'Provisioning...' : 'Provision Account'}
                    <ArrowRight size={18} className="translate-y-[0.5px]" />
                  </button>
                </div>
              </form>

              <div className="mt-12 text-center relative z-10">
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                  Existing link detected?
                  <Link 
                    to="/sign-in" 
                    onClick={() => localStorage.removeItem('intelliscan_logout_active')}
                    className="text-[var(--brand)] hover:underline ml-2"
                  >
                    Authenticate
                  </Link>
                </p>
              </div>

              <div className="mt-12 pt-10 border-t border-[var(--border-subtle)] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">INFRASTRUCTURE V2.4</span>
                </div>
                <div className="px-3 py-1 bg-[var(--surface)] rounded-lg text-[9px] font-black text-[var(--brand)] uppercase tracking-widest border border-[var(--border-subtle)]">
                   Tier 1 Secure
                </div>
              </div>
            </div>

            <p className="mt-12 text-center text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] leading-relaxed max-w-[320px] mx-auto relative z-10">
              Provisioning node constitutes agreement to 
              <a className="text-[var(--text-main)] hover:underline mx-1" href="#">Protocol Terms</a> and 
              <a className="text-[var(--text-main)] hover:underline ml-1" href="#">Privacy Manifest</a>.
            </p>
          </div>
        </main>

        <div className="hidden lg:block fixed bottom-16 right-16 w-96 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--border-subtle)] group z-10 transition-all hover:scale-105 hover:-rotate-1">
          <img alt="Atmospheric visualization" className="w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7hRqXs2a5Oy_Tf5XivUjlxelPlayback" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <p className="text-[9px] font-black text-[var(--brand)] tracking-[0.4em] uppercase mb-1">Architecture Visualizer</p>
            <p className="text-xs font-headline font-black italic text-[var(--text-main)] uppercase">Neural Pipeline Active</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
