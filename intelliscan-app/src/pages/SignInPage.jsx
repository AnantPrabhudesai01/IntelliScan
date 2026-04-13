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
  const [mockLoading, setMockLoading] = useState(null); // 'okta', 'windowslive' or null
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
    // Standard Auth0 flow for both Individual (Google) and Enterprise (SAML/OIDC)
    loginWithRedirect({ authorizationParams: { connection } });
  };

  return (
    <PublicLayout hideFooter>
      <div className="text-gray-900 dark:text-[#dde2f3] selection:bg-indigo-600 selection:text-white transition-colors duration-300">
        <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 pt-16 relative overflow-hidden bg-white dark:bg-transparent transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-[#161c28]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-8 md:p-10 rounded-[2rem] shadow-xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transition-colors duration-300">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 mb-6 group transition-all duration-300">
                <ScanLine className="text-indigo-500 text-3xl group-hover:scale-110 transition-transform" size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-headline transition-colors">SignIn to IntelliScan</h1>
              <p className="text-gray-600 dark:text-[#c7c4d8] font-medium font-body transition-colors text-sm">Select your access type to continue.</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl mb-8 border border-gray-200 dark:border-white/5 relative">
              <button 
                type="button"
                onClick={() => setActiveTab('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'individual' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-gray-500 dark:text-[#918fa1] hover:text-[#dde2f3]'}`}
              >
                <Shield size={16} />
                Individual
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('enterprise')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'enterprise' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-gray-500 dark:text-[#918fa1] hover:text-[#dde2f3]'}`}
              >
                <ShieldCheck size={16} />
                Workplace
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
            <form className="space-y-6" onSubmit={handleLogin}>
              {activeTab === 'individual' ? (
                <>
                  {/* Login Method Toggle (Only for Individual) */}
                  <div className="flex bg-gray-100 dark:bg-[#1a202c]/50 p-1 rounded-xl mb-6 border border-gray-200 dark:border-white/5">
                    <button 
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'email' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-[#918fa1]'}`}
                    >
                      Email
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'phone' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-[#918fa1]'}`}
                    >
                      Phone
                    </button>
                  </div>

                  {loginMethod === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-[#c7c4d8] ml-1 font-body" htmlFor="email">Email Address</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-gray-400 dark:text-[#918fa1] text-xl group-focus-within:text-indigo-600 dark:group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                          </div>
                          <input value={email} onChange={(e) => setEmail(e.target.value)} className="font-body block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1a202c] border-gray-200 dark:border-0 border rounded-xl text-gray-900 dark:text-[#dde2f3] placeholder:text-gray-400 dark:placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" id="email" name="email" placeholder="name@email.com" required type="email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-sm font-semibold text-gray-700 dark:text-[#c7c4d8] font-body" htmlFor="password">Password</label>
                          <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 dark:text-[#c3c0ff] hover:underline transition-all font-body">Forgot?</Link>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400 dark:text-[#918fa1] text-xl group-focus-within:text-indigo-600 dark:group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                          </div>
                          <input value={password} onChange={(e) => setPassword(e.target.value)} className="font-body block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1a202c] border-gray-200 dark:border-0 border rounded-xl text-gray-900 dark:text-[#dde2f3] placeholder:text-gray-400 dark:placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" id="password" name="password" placeholder="••••••••" required type="password" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-[#c7c4d8] ml-1 font-body" htmlFor="phone">Mobile Number</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <ScanLine className="text-gray-400 dark:text-[#918fa1] text-xl group-focus-within:text-indigo-600 dark:group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                        </div>
                        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="font-body block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1a202c] border-gray-200 dark:border-0 border rounded-xl text-gray-900 dark:text-[#dde2f3] placeholder:text-gray-400 dark:placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" id="phone" placeholder="+91 98765 43210" required type="tel" />
                      </div>
                    </div>
                  )}

                  <button disabled={isAuth0Loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 mt-6 font-headline disabled:opacity-50" type="submit">
                    {isAuth0Loading ? 'Processing...' : 'Sign In'}
                  </button>

                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/5"></div></div>
                    <span className="relative px-4 bg-white dark:bg-[#161c28] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#918fa1]">Personal Social Access</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleSso('google-oauth2')}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-4 rounded-xl font-bold text-lg border border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm font-headline"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-[#c7c4d8] ml-1 font-body" htmlFor="corp-email">Work Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="text-gray-400 dark:text-[#918fa1] text-xl group-focus-within:text-indigo-600 transition-colors" size={20} />
                      </div>
                      <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="font-body block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1a202c] border-gray-200 dark:border-0 border rounded-xl text-gray-900 dark:text-[#dde2f3] placeholder:text-gray-400 dark:placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" 
                        id="corp-email" 
                        placeholder="name@company.com" 
                        type="email" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleSso('enterprise-oidc')}
                      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 mt-2"
                    >
                      Authenticate with SSO
                    </button>
                  </div>

                  <div className="relative py-4 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/5"></div></div>
                    <span className="relative px-4 bg-white dark:bg-[#161c28] text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#918fa1]">Or select provider</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      type="button" 
                      onClick={() => handleSso('okta')}
                      className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#252b38] hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">O</div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Okta Identity</div>
                        </div>
                      </div>
                      <Lock size={16} className="text-gray-400" />
                    </button>

                    <button 
                       type="button" 
                       onClick={() => handleSso('windowslive')}
                       className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1a202c] border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#252b38] hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">A</div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Microsoft Azure</div>
                        </div>
                      </div>
                      <Lock size={16} className="text-gray-400" />
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Handshake Simulation Overlay */}
            {mockLoading && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 animate-in fade-in">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"></div>
                
                <div className="relative w-full max-w-sm bg-white dark:bg-[#1a202c] rounded-[2.5rem] p-10 shadow-2xl border border-white/5 text-center overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
                  
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto relative group">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin duration-700"></div>
                      <Building2 className={`text-indigo-500 transition-all duration-500 ${mockLoading ? 'scale-110' : 'scale-90'}`} size={36} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-headline">
                    Connecting to {mockLoading === 'okta' ? 'Okta' : 'Microsoft'}
                  </h3>
                  <p className="text-gray-500 dark:text-[#918fa1] text-xs font-medium leading-relaxed mb-8">
                    Authenticating your workforce credentials via Secure Edge Handshake. Please wait...
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-[#918fa1]/50 uppercase tracking-widest justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Encrypted Channel Established
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-[#918fa1]/50 uppercase tracking-widest justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-75"></span>
                      Verifying Corporate Policy
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Divider */}
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-[#c7c4d8] font-medium font-body">
                Don't have an account? 
                <Link to="/sign-up" className="text-[#c3c0ff] font-bold hover:underline ml-2 transition-all">Sign Up</Link>
              </p>
            </div>
          </div>
          {/* Trust Badges */}
          <div className="mt-8 flex justify-center gap-6 grayscale opacity-40 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#c7c4d8]">
              <Shield size={16} /> ISO 27001
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#c7c4d8]">
              <ShieldCheck size={16} /> SOC2 TYPE II
            </div>
          </div>
        </div>
      </main>
      
      {/* Decorative Corner Element */}
      <div className="fixed bottom-0 right-0 p-12 pointer-events-none opacity-20 hidden lg:block">
        <div className="w-64 h-64 border-r-2 border-b-2 border-indigo-600/30 rounded-br-[4rem]"></div>
      </div>
      </div>
    </PublicLayout>
  );
}
