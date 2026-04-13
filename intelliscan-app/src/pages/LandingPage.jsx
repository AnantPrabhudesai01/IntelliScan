import { Zap, ArrowRight, PlayCircle, ScanLine, Share2, Sparkles, Shield, Lock, CheckCircle, Star, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStoredToken, resolveHomeRoute, safeReadStoredUser, tryDecodeJwtPayload } from '../utils/auth';
import PublicLayout from '../layouts/PublicLayout';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState(null);

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

    const token = getStoredToken();
    const user = safeReadStoredUser();
    if (token && !error) {
      const decoded = tryDecodeJwtPayload(token);
      const role = user?.role || decoded?.role || 'user';
      const tier = user?.tier || decoded?.tier || 'personal';
      navigate(resolveHomeRoute({ role, tier }), { replace: true });
    }
  }, [navigate, location]);

  return (
    <PublicLayout>
      <div className="selection:bg-indigo-600 selection:text-white">
        <main>
          {/* Auth Error Notification */}
          {authError && (
            <div className="max-w-7xl mx-auto px-6 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="text-red-400 font-bold capitalize mb-0.5">{authError.title}</h4>
                  <p className="text-red-300/80 text-sm whitespace-pre-wrap">{authError.message}</p>
                </div>
                <button onClick={() => setAuthError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242a36] border border-[#464555]/20 text-[#c3c0ff] text-xs font-bold tracking-widest uppercase mb-6">
                <Zap size={14} className="text-current" /> Powered by Gemini AI 1.5
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight font-headline">
                Business Card Intelligence for Modern Teams.
              </h1>
              <p className="text-[#c7c4d8] text-xl leading-relaxed mb-10 max-w-xl font-body">
                Scan, extract, and centralize contacts with 99% accuracy using Gemini AI + OCR. Turn physical handshakes into digital pipeline revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up" className="bg-indigo-600 text-[#dad7ff] px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer font-headline">
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <button className="bg-[#242a36] border border-[#464555]/30 text-[#dde2f3] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#2f3542] transition-all flex items-center justify-center gap-2 font-headline">
                  <PlayCircle size={20} /> Watch Demo
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-[#a44100] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#161c28] rounded-2xl overflow-hidden border border-[#464555]/10">
                <img alt="IntelliScan Dashboard" className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqNLxQGmf_ITbiXwqwFmmPNMzM77W-2XjT6PC_W6ho_3x8NCWhrVQhXcOJYPqdgHfF3HcvzAthqypS99d4UpOSwdA7i3PIV6_pDgNRWYW0y8I_-jKy1vdjq554tF2e_WYWxn06puOthE37nSRn95bYMU1t6KSnzPMiKI16MYnt9GlZbv7k1_M5EjQFtuRNtQ_HAE7Zi2_lbDVearpzwqz0TZHBruNp1Rezo041-zantM9j1iBAWLwEE44nUyAIaWsyXSkJ0DDxbJdw" />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-y border-[#464555]/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[#c7c4d8] font-medium text-sm mb-8 uppercase tracking-[0.2em] font-body">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-2xl font-bold text-white font-headline">VOLTA</span>
              <span className="text-2xl font-bold text-white font-headline">NEBULOUS</span>
              <span className="text-2xl font-bold text-white font-headline">AETHER</span>
              <span className="text-2xl font-bold text-white font-headline">QUANTUM</span>
              <span className="text-2xl font-bold text-white font-headline">LUMOS</span>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-[#0e131f]" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-headline">Precision-Engineered Networking</h2>
              <p className="text-[#c7c4d8] text-lg font-body">Stop losing leads to disorganized pockets. Start scanning.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
              {/* Large Feature Card */}
              <div className="md:col-span-8 bg-[#161c28] rounded-xl p-8 relative overflow-hidden group border border-[#464555]/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 mb-6">
                      <ScanLine size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 font-headline">Precision OCR</h3>
                    <p className="text-[#c7c4d8] leading-relaxed max-w-md font-body">Our neural engine handles complex layouts, handwriting, and multiple languages with a sustained 99% accuracy rate. No manual cleanup required.</p>
                  </div>
                  <div className="mt-8 bg-[#242a36] p-4 rounded-xl border border-[#464555]/10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-2 h-2 rounded-full bg-[#ffb695] animate-pulse"></div>
                      <span className="text-xs font-mono text-[#ffdbcc]">PROCESSING_CONTACT...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-[#464555]/20 rounded w-3/4"></div>
                      <div className="h-2 bg-[#464555]/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Small Feature Card */}
              <div className="md:col-span-4 bg-[#1a202c] rounded-xl p-8 border border-[#464555]/5">
                <div className="w-12 h-12 rounded-xl bg-[#c3c0ff]/20 flex items-center justify-center text-[#c3c0ff] mb-6">
                  <Share2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-headline">CRM Sync</h3>
                <p className="text-[#c7c4d8] leading-relaxed font-body">Direct bi-directional sync with Salesforce, HubSpot, and Pipedrive. One-click export for the whole team.</p>
              </div>
              
              {/* Small Feature Card 2 */}
              <div className="md:col-span-4 bg-[#1a202c] rounded-xl p-8 border border-[#464555]/5">
                <div className="w-12 h-12 rounded-xl bg-[#ffb695]/20 flex items-center justify-center text-[#ffb695] mb-6">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-headline">Smart Enrichment</h3>
                <p className="text-[#c7c4d8] leading-relaxed font-body">Automatically find LinkedIn profiles and company insights for every card you scan.</p>
              </div>
              
              {/* Medium Feature Card */}
              <div className="md:col-span-8 bg-[#161c28] rounded-xl p-8 border border-[#464555]/5 flex items-center gap-8 group">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#b0aef9]/20 flex items-center justify-center text-[#b0aef9] mb-6">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-headline">Enterprise Security</h3>
                  <p className="text-[#c7c4d8] leading-relaxed font-body">SOC2 Type II compliant with end-to-end encryption. Your contact data is strictly your business.</p>
                </div>
                <div className="hidden lg:flex w-48 h-32 bg-[#242a36] rounded-lg border border-[#464555]/10 shadow-inner overflow-hidden items-center justify-center relative">
                  <Lock size={64} className="opacity-20 text-white relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confidence Showcase */}
        <section className="py-20 bg-[#080e1a] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-6 font-headline">Confidence you can trust.</h2>
                <p className="text-[#c7c4d8] text-lg mb-8 font-body">Unlike standard OCR, IntelliScan provides confidence scoring for every extracted field, flagging any potential errors for rapid verification.</p>
                <div className="space-y-4">
                  <div className="bg-[#1a202c] p-4 rounded-xl flex items-center justify-between border border-[#464555]/5">
                    <div className="flex items-center gap-4">
                      <span className="text-[#dde2f3] font-medium font-body">Name: Sarah Jenkins</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#a44100] text-[#ffd2be] text-[10px] font-bold">98% CONFIDENCE</span>
                  </div>
                  <div className="bg-[#1a202c] p-4 rounded-xl flex items-center justify-between border border-[#464555]/5">
                    <div className="flex items-center gap-4">
                      <span className="text-[#dde2f3] font-medium font-body">Phone: +1 415 555-0192</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#a44100] text-[#ffd2be] text-[10px] font-bold">100% CONFIDENCE</span>
                  </div>
                  <div className="bg-[#1a202c] p-4 rounded-xl flex items-center justify-between border border-[#464555]/5 opacity-60">
                    <div className="flex items-center gap-4">
                      <span className="text-[#dde2f3] font-medium font-body">Email: s.jennk...</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#93000a] text-[#ffdad6] text-[10px] font-bold">54% VERIFY</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <img className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 max-w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDNQenT0RrYhy1ncmZT6Vv5JI6-BcH5ZOSI2MOjwBYiLFlK2bxPbif3oNjVJfdOQxitE79lQygptPOIIszwCKUJLwd6AqDPeG_5ZJPk5bOiF-LKMuCeoehGur8XPFYZVHuRw77PCv02Njr088IP4EoHbhO6hzFS_8vM9sWUMZ7NYYEH4LbTRANgHIAP5O9DK38WAJ2cpaiWTjPG6PH6szE8gJiAeUjYjpiB6TFf9ff7Op2isOoETYHPBFs88hYU0qTDl8zkUc9adTe" alt="Visualization" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-[#0e131f]" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 font-headline">Scalable Plans for High-Growth Teams</h2>
              <p className="text-[#c7c4d8] font-body">Simple, transparent pricing. No hidden scan limits.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-[#161c28] p-8 rounded-xl border border-[#464555]/5 flex flex-col justify-between">
                <div>
                  <span className="text-[#c7c4d8] font-bold text-sm uppercase tracking-widest mb-4 block">Personal</span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold text-[#c7c4d8]">₹</span>
                    <span className="text-4xl font-black text-white">0</span>
                    <span className="text-[#c7c4d8]">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> 10 scans per month
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> Basic AI extraction
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> CSV and vCard export
                    </li>
                  </ul>
                </div>
                <Link to="/sign-up" className="w-full py-3 rounded-xl border border-[#464555]/30 text-white font-bold hover:bg-[#242a36] transition-all font-headline text-center">Start Free</Link>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-[#1a202c] relative p-8 rounded-xl border-2 border-indigo-600 shadow-2xl flex flex-col justify-between transform scale-105 z-10 text-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-[#dad7ff] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
                <div>
                  <span className="text-gray-300 font-bold text-sm uppercase tracking-widest mb-4 block">Pro Team</span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold text-gray-300">₹</span>
                    <span className="text-4xl font-black text-white">999</span>
                    <span className="text-gray-300">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-indigo-400" /> 100 scans per month
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-indigo-400" /> AI Coach and Sequences
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-indigo-400" /> Digital card and batch upload
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-indigo-400" /> Priority support
                    </li>
                  </ul>
                </div>
                <Link to="/sign-up" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:brightness-110 transition-all font-headline text-center">Go Pro</Link>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-[#161c28] p-8 rounded-xl border border-[#464555]/5 flex flex-col justify-between">
                <div>
                  <span className="text-[#c7c4d8] font-bold text-sm uppercase tracking-widest mb-4 block">Enterprise</span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold text-[#c7c4d8]">₹</span>
                    <span className="text-4xl font-black text-white">4,999</span>
                    <span className="text-[#c7c4d8]">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> SSO & SAML Login
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> Custom API Endpoints
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> White-glove Onboarding
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#c7c4d8]">
                      <CheckCircle size={16} className="text-[#c3c0ff]" /> Dedicated Success Manager
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 rounded-xl border border-[#464555]/30 text-white font-bold hover:bg-[#242a36] transition-all font-headline">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-indigo-600 to-[#3323cc] p-12 md:p-20 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative z-10 font-headline">Ready to modernize your networking?</h2>
              <p className="text-[#dad7ff] text-xl mb-12 max-w-2xl mx-auto relative z-10">Join 10k+ teams using IntelliScan to capture more leads and close deals faster.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link to="/sign-up" className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-black text-lg hover:bg-gray-100 transition-all font-headline">Start 14-Day Free Trial</Link>
                <button className="bg-indigo-600/20 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all font-headline">Book a Demo</button>
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </PublicLayout>
  );
}
