import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ScanLine, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useRole } from '../context/RoleContext';
import { setStoredAuth } from '../utils/auth';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role: 'user' });
      const { token, user } = response.data;
      setStoredAuth({ token, user });
      setRole(user.role, user.tier);
      navigate('/dashboard/scan');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[#0e131f] text-[#dde2f3] min-h-screen selection:bg-indigo-600 selection:text-white overflow-y-auto font-body">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#0e131f]">
        <nav className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold text-white tracking-tighter font-headline">IntelliScan</Link>
          </div>
          <div className="hidden md:flex items-center gap-8 font-['Manrope'] font-semibold tracking-tight">
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Product</a>
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Solutions</a>
            <a className="text-[#c7c4d8] hover:text-white transition-colors duration-200" href="#">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="text-[#c7c4d8] font-['Manrope'] font-semibold hover:text-white transition-colors duration-200">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="relative flex items-center justify-center min-h-screen px-4 py-20 overflow-hidden">
        {/* Technical Background Detail */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#a44100]/5 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Auth Card Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Card Shell */}
          <div className="bg-[#161c28] rounded-[2rem] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-white/[0.03]">
            {/* Branding & Intro */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6 shadow-lg shadow-indigo-600/20">
                <ScanLine className="text-white text-3xl" size={32} />
              </div>
              <h1 className="text-3xl font-extrabold font-headline text-white tracking-tight mb-2">Create Account</h1>
              <p className="text-[#c7c4d8] font-medium font-body">Join IntelliScan for high-precision OCR and automated scanning solutions.</p>
            </div>

            {/* Form Fields */}
            <form className="space-y-5" onSubmit={handleRegister}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center mb-4">
                  {error}
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
                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-[#3323cc] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group font-headline" type="submit">
                  {loading ? 'Creating...' : 'Create Account'}
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
  );
}
