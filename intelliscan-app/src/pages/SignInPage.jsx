import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ScanLine, Shield, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRole } from '../context/RoleContext';
import { getStoredToken, resolveHomeRoute, safeReadStoredUser, setStoredAuth } from '../utils/auth';

export default function SignInPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const user = safeReadStoredUser();
    if (token && user?.role) {
      navigate(resolveHomeRoute(user), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      setStoredAuth({ token, user });
      setRole(user.role, user.tier);
      navigate(resolveHomeRoute(user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[#0e131f] text-[#dde2f3] min-h-screen selection:bg-indigo-600 selection:text-white overflow-y-auto">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#0e131f]">
        <nav className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold text-white tracking-tighter">IntelliScan</Link>
          </div>
          <div className="hidden md:flex items-center gap-8 font-['Manrope'] font-semibold tracking-tight">
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Product</a>
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Solutions</a>
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="text-indigo-500 font-['Manrope'] font-semibold tracking-tight active:scale-95 transition-transform hover:text-white">Sign In</Link>
            <Link to="/sign-up" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-['Manrope'] font-semibold tracking-tight active:scale-95 transition-transform">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Main Content: Sign In Section */}
      <main className="min-h-screen flex items-center justify-center px-6 pt-16 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="w-full max-w-md relative z-10">
          {/* Glassmorphism Card */}
          <div className="bg-[#161c28]/80 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]">
            {/* Brand Anchor */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 mb-6 group transition-all duration-300">
                <ScanLine className="text-indigo-500 text-3xl group-hover:scale-110 transition-transform" size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 font-headline">Welcome Back</h1>
              <p className="text-[#c7c4d8] font-medium font-body">Continue your high-precision scanning journey.</p>
            </div>
            {/* Form Fields */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#c7c4d8] ml-1 font-body" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-[#918fa1] text-xl group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                  </div>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="font-body block w-full pl-11 pr-4 py-3.5 bg-[#1a202c] border-0 rounded-xl text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" id="email" name="email" placeholder="name@company.com" required type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-[#c7c4d8] font-body" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#c3c0ff] hover:underline transition-all font-body">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-[#918fa1] text-xl group-focus-within:text-[#c3c0ff] transition-colors" size={20} />
                  </div>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="font-body block w-full pl-11 pr-4 py-3.5 bg-[#1a202c] border-0 rounded-xl text-[#dde2f3] placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" id="password" name="password" placeholder="••••••••" required type="password" />
                </div>
              </div>
              <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 mt-4 font-headline disabled:opacity-50" type="submit">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative px-4 bg-[#161c28]/0 text-[10px] font-black uppercase tracking-[0.2em] text-[#918fa1]">Enterprise SSO</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => alert('Simulating Okta SSO Handshake...')}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs"
                >
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px]">O</div>
                  Okta
                </button>
                <button 
                   type="button" 
                   onClick={() => alert('Simulating Azure AD SSO Handshake...')}
                   className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs"
                >
                   <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[10px]">A</div>
                   Azure AD
                </button>
              </div>
            </form>
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
  );
}
