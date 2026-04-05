import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="bg-[#0e131f] text-[#dde2f3] min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-body">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c3c0ff]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="mb-8">
          <Link to="/sign-in" className="inline-flex items-center gap-2 text-[#c3c0ff] hover:text-white transition-colors duration-200 font-semibold group font-body">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
        </div>

        <div className="bg-[#161c28] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 bg-[#1a202c] rounded-2xl flex items-center justify-center border border-white/5 shadow-inner mb-8">
            <KeyRound size={32} className="text-[#c3c0ff]" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 font-headline">Reset Password</h1>
          <p className="text-[#918fa1] text-lg leading-relaxed mb-8 font-body">
            Enter the email address associated with your account and we'll send you a secure link to reset your password.
          </p>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#c7c4d8] font-body" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors" />
                </div>
                <input 
                  className="font-body w-full bg-[#1a202c] border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-indigo-600/40 transition-all outline-none" 
                  id="email" placeholder="name@company.com" required type="email"
                />
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-[#3323cc] text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] active:scale-[0.98] transition-all font-headline" type="submit">
              Send Reset Link
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-[#1a202c] p-4 rounded-xl border border-white/5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-[#c3c0ff] shrink-0 mt-0.5" />
            <p className="text-xs text-[#918fa1] font-medium leading-relaxed font-body">Links expire after 24 hours for security.</p>
          </div>
          <div className="bg-[#1a202c] p-4 rounded-xl border border-white/5 flex items-start gap-3">
            <HelpCircle size={20} className="text-[#c3c0ff] shrink-0 mt-0.5" />
            <p className="text-xs text-[#918fa1] font-medium leading-relaxed font-body">Need help? <a href="#" className="text-[#da7ff] hover:underline">Support</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
