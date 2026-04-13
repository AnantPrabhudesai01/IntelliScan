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
      <div className="text-gray-900 dark:text-[#dde2f3] selection:bg-indigo-600 selection:text-white overflow-y-auto font-body transition-colors duration-300">
        <main className="relative flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-20 overflow-hidden bg-white dark:bg-transparent">
          {/* Technical Background Detail */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#a44100]/5 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          </div>

          {/* Auth Card Container */}
          <div className="relative z-10 w-full max-w-md">
            {/* Card Shell */}
            <div className="bg-white dark:bg-[#161c28] rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/[0.03] transition-colors duration-300">
              {/* Branding & Intro */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6 shadow-lg shadow-indigo-600/20">
                  <ScanLine className="text-white text-3xl" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold font-headline text-gray-900 dark:text-white tracking-tight mb-2 transition-colors">Create Account</h1>
                <p className="text-gray-600 dark:text-[#c7c4d8] font-medium font-body transition-colors">Join IntelliScan for high-precision OCR and automated scanning solutions.</p>
              </div>

              {/* Form Fields */}
              <form className="space-y-5" onSubmit={handleRegister}>
                {authError && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-md">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-red-400 font-bold text-sm capitalize mb-0.5">{authError.title}</h4>
                        <p className="text-red-300/80 text-[10px] leading-relaxed whitespace-pre-wrap">{authError.message}</p>
                      </div>
                      <button type="button" onClick={() => setAuthError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#dde2f3] ml-1 font-body">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                    </div>
                    <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#1a202c] border-none rounded-xl py-3.5 pl-12 pr-4 text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600/40 transition-all font-body outline-none" placeholder="John Doe" type="text" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#dde2f3] ml-1 font-body">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                    </div>
                    <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#1a202c] border-none rounded-xl py-3.5 pl-12 pr-4 text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600/40 transition-all font-body outline-none" placeholder="name@company.com" type="email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#dde2f3] ml-1 font-body">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                      </div>
                      <input value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#1a202c] border-none rounded-xl py-3.5 pl-12 pr-4 text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600/40 transition-all font-body outline-none" placeholder="••••••••" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#dde2f3] ml-1 font-body">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                      </div>
                      <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-[#1a202c] border-none rounded-xl py-3.5 pl-12 pr-4 text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600/40 transition-all font-body outline-none" placeholder="••••••••" type="password" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button disabled={authLoading} className="w-full bg-indigo-600 hover:bg-[#3323cc] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group font-headline" type="submit">
                    {authLoading ? 'Redirecting...' : 'Create Account'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[#c7c4d8] text-sm font-medium font-body">
                  Already have an account?
                  <Link to="/sign-in" className="text-[#c3c0ff] hover:text-white font-bold ml-1 transition-colors">Sign In</Link>
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#918fa1]">SECURE AUTH v2.4</span>
                </div>
                <div className="px-2 py-1 bg-[#242a36] rounded text-[10px] font-mono text-[#c3c0ff] uppercase">
                  Enterprise Grade
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-[#918fa1] leading-relaxed max-w-[300px] mx-auto font-body">
              By creating an account, you agree to IntelliScan's
              <a className="underline hover:text-white ml-1" href="#">Terms of Service</a> and
              <a className="underline hover:text-white ml-1" href="#">Privacy Policy</a>.
            </p>
          </div>
        </main>

        <div className="hidden lg:block fixed bottom-12 right-12 w-80 h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group z-10">
          <img alt="Data scanning" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7hRqXs2a5Oy_Tf5XivUjlxelPlayback" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <p className="text-[10px] font-bold text-[#c3c0ff] tracking-widest uppercase">IntelliScan Core</p>
            <p className="text-xs text-white/70">Optimized OCR Processing</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
