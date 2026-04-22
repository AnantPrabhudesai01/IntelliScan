import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ScanLine, Shield, ShieldCheck, AlertCircle, X, Loader2, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getStoredToken, resolveHomeRoute, tryDecodeJwtPayload, safeReadStoredUser } from '../utils/auth';
import PublicLayout from '../layouts/PublicLayout';

export default function SignInPage() {
  const { isAuthenticated, loginWithRedirect, isLoading: isAuth0Loading } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = getStoredToken();
    if (isAuthenticated && token) {
      const storedUser = safeReadStoredUser();
      const derivedUser = storedUser || tryDecodeJwtPayload(token) || { role: 'user' };
      navigate(resolveHomeRoute(derivedUser), { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'enterprise'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check for Auth0 error params in URL
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      setAuthError({
        title: error.replace(/_/g, ' '),
        message: errorDescription || 'An unexpected error occurred during authentication.'
      });
      // Clean up the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async () => {
    loginWithRedirect();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    loginWithRedirect({ authorizationParams: { login_hint: email } });
  };

  const handleSso = async (connection) => {
    // Immediate redirect to Auth0 for enterprise/social connections
    loginWithRedirect({ 
      authorizationParams: { 
        connection,
        login_hint: activeTab === 'enterprise' ? email : undefined
      } 
    });
  };

  return (
    <PublicLayout hideFooter>
      <div className="text-[var(--text-main)] selection:bg-[var(--brand)] selection:text-white transition-colors duration-300">
        <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 pt-16 relative overflow-hidden bg-[var(--surface)] transition-colors duration-300">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--brand)]/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-8 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden premium-grain">
             {/* Subtle Pattern overlay */}
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
               <ScanLine size={120} />
             </div>

            <div className="text-center mb-12 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-[var(--brand)]/10 mb-8 border border-[var(--brand)]/20 shadow-inner">
                <ScanLine className="text-[var(--brand)]" size={32} />
              </div>
              <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase mb-3">Commit Identity</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] font-label">Initialize session protocol</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex bg-[var(--surface)] p-1 rounded-2xl mb-10 border border-[var(--border-subtle)] relative z-10">
              <button 
                type="button"
                onClick={() => setActiveTab('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all relative z-10 ${activeTab === 'individual' ? 'bg-[var(--brand)] text-white shadow-xl shadow-[var(--brand)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                <Shield size={14} /> Individual
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('enterprise')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all relative z-10 ${activeTab === 'enterprise' ? 'bg-[var(--brand)] text-white shadow-xl shadow-[var(--brand)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                <ShieldCheck size={14} /> Workplace
              </button>
            </div>

            {/* Auth Error Notification */}
            {authError && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-400 font-bold text-sm capitalize mb-0.5">{authError.title}</h4>
                    <p className="text-red-300/80 text-[10px] leading-relaxed whitespace-pre-wrap">{authError.message}</p>
                  </div>
                  <button onClick={() => setAuthError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
              {activeTab === 'individual' ? (
                <>
                  {/* Login Method Toggle */}
                  <div className="flex border-b border-[var(--border-subtle)] mb-8">
                    <button 
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`pb-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${loginMethod === 'email' ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      Email Protocol
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`pb-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${loginMethod === 'phone' ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      Phone Access
                    </button>
                  </div>

                  {loginMethod === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Identity Hash (Email)</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Mail className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                          </div>
                          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all outline-none font-medium" placeholder="name@email.com" required type="email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] font-label">Vault Key</label>
                          <Link to="/forgot-password" title="Forgot Password" className="text-[9px] font-black uppercase text-[var(--brand)] hover:underline tracking-widest">Recover Key</Link>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Lock className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                          </div>
                          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all outline-none font-medium" placeholder="••••••••" required type="password" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Mobile Link</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <ScanLine className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                        </div>
                        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all outline-none font-medium" placeholder="+91 98765 43210" required type="tel" />
                      </div>
                    </div>
                  )}

                  <button disabled={isAuth0Loading} className="w-full bg-[var(--brand)] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand)]/20 mt-8 italic font-headline" type="submit">
                    {isAuth0Loading ? 'Processing Data...' : 'Authorize Login'}
                  </button>

                  <div className="relative my-8 text-center pt-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]"></div></div>
                    <span className="relative px-6 bg-[var(--surface-card)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Secure Handshake</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleSso('google-oauth2')}
                    className="w-full flex items-center justify-center gap-4 bg-[var(--surface)] text-[var(--text-main)] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-[var(--border-subtle)] hover:bg-[var(--surface-card)] active:scale-[0.98] transition-all shadow-sm font-headline"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Work Identity</label>
                       <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Building2 className="text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={18} />
                        </div>
                        <input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="w-full pl-12 pr-5 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 focus:ring-[var(--brand)]/30 transition-all outline-none font-medium" 
                          id="corp-email" 
                          placeholder="name@company.com" 
                          type="email" 
                        />
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleSso('enterprise-oidc')}
                      className="w-full bg-[var(--brand)] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand)]/20 italic font-headline"
                    >
                      Authenticate with SSO
                    </button>
                  </div>

                  <div className="relative my-8 text-center pt-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]"></div></div>
                    <span className="relative px-6 bg-[var(--surface-card)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Corporate Grid</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <button 
                      type="button" 
                      onClick={() => handleSso('okta')}
                      className="flex items-center justify-between px-8 py-5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl hover:bg-[var(--surface-card)] hover:border-[var(--brand)]/30 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform italic font-headline">O</div>
                        <div className="text-left">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group-hover:text-[var(--brand)]">Okta Identity</div>
                          <div className="text-[8px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Enterprise Node</div>
                        </div>
                      </div>
                      <ShieldCheck size={14} className="text-blue-500 animate-pulse" />
                    </button>

                    <button 
                       type="button" 
                       onClick={() => handleSso('google-apps')}
                       className="flex items-center justify-between px-8 py-5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl hover:bg-[var(--surface-card)] hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-white shadow-lg shadow-gray-200/20 group-hover:scale-110 transition-transform">
                          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group-hover:text-[var(--brand)]">Google Workspace</div>
                          <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Enterprise Hub</div>
                        </div>
                      </div>
                      <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
                    </button>
                  </div>
                </>
              )}
            </form>


            {/* Footer Links */}
            <div className="mt-12 pt-10 border-t border-[var(--border-subtle)] text-center relative z-10">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                No access credentials? 
                <Link to="/sign-up" className="text-[var(--brand)] hover:underline ml-2">Register Node</Link>
              </p>
            </div>
          </div>

          {/* Infrastructure Badges */}
          <div className="mt-12 flex justify-center gap-10 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] uppercase text-[var(--text-muted)]">
              <Shield size={14} /> ISO 27001
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] uppercase text-[var(--text-muted)]">
              <ShieldCheck size={14} /> SOC2 TYPE II
            </div>
          </div>
        </div>
      </main>
      
      {/* Structural Accent */}
      <div className="fixed bottom-0 right-0 p-16 pointer-events-none opacity-10 hidden lg:block">
        <div className="w-64 h-64 border-r border-b border-[var(--brand)]/20 rounded-br-[5rem]"></div>
      </div>
      </div>
    </PublicLayout>
  );
}
