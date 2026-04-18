import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Sparkles, ArrowRight, ArrowLeft, Users, Globe, Scan, ChevronRight, Check, Shield, Zap, BarChart3 } from 'lucide-react';
import { getStoredToken } from '../utils/auth.js';

const CRM_OPTIONS = [
  { id: 'salesforce', name: 'Salesforce', desc: 'Enterprise CRM', icon: Globe },
  { id: 'hubspot', name: 'HubSpot', desc: 'Inbound Marketing', icon: BarChart3 },
  { id: 'zoho', name: 'Zoho CRM', desc: 'SMB Solution', icon: Building2 },
  { id: 'none', name: 'No CRM Yet', desc: 'Getting started', icon: Zap },
];

const TEAM_SIZES = [
  { value: 'solo', label: 'Just Me', desc: 'Personal use' },
  { value: 'small', label: '2-10', desc: 'Small team' },
  { value: 'medium', label: '11-50', desc: 'Growing team' },
  { value: 'enterprise', label: '50+', desc: 'Enterprise' },
];

const USE_CASES = [
  { id: 'events', label: 'Trade Shows & Events', icon: Users, desc: 'Scan cards at conferences and expos' },
  { id: 'sales', label: 'Sales Prospecting', icon: Briefcase, desc: 'Build and manage a sales pipeline' },
  { id: 'networking', label: 'Personal Networking', icon: Globe, desc: 'Grow your professional network' },
  { id: 'digitize', label: 'Archive & Digitize', icon: Scan, desc: 'Convert a physical Rolodex to digital' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    crm: '',
    teamSize: '',
    useCases: [],
  });

  const totalSteps = 3;

  const toggleUseCase = (id) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter(u => u !== id)
        : [...prev.useCases, id]
    }));
  };

  const canProceed = () => {
    if (step === 0) return formData.jobTitle.trim() && formData.companyName.trim();
    if (step === 1) return formData.crm && formData.teamSize;
    if (step === 2) return formData.useCases.length > 0;
    return true;
  };

  const handleFinish = async () => {
    try {
      const token = getStoredToken();
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (e) {
      console.log('Onboarding save skipped (endpoint may not exist yet):', e.message);
    }
    navigate('/dashboard/scan');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-10 pb-12 bg-[#0e131f] font-body selection:bg-brand-600 selection:text-white">
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${i <= step ? 'bg-brand-600' : 'bg-[#242a36]'
                }`}></div>
            </div>
          ))}
        </div>

        {/* Step Header */}
        <div className="text-center mb-10">
          <h1 className="font-extrabold text-4xl md:text-5xl text-white tracking-tight mb-4 font-headline">
            {step === 0 && 'Setup your Profile'}
            {step === 1 && 'Your Workflow'}
            {step === 2 && 'How will you use IntelliScan?'}
          </h1>
          <p className="text-[#918fa1] text-lg max-w-md mx-auto font-body">
            {step === 0 && 'Tell us about your professional identity to personalize your scanning workspace.'}
            {step === 1 && 'We\'ll optimize your experience based on your tools and team size.'}
            {step === 2 && 'Select all that apply. We\'ll tailor your dashboard for the best experience.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#161c28] rounded-[2rem] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-white/[0.03]">

          {/* STEP 0: Profile */}
          {step === 0 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="group">
                <label className="block text-sm font-semibold text-[#dde2f3] mb-2 ml-1" htmlFor="job-title">Job Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <input
                    className="block font-body w-full pl-12 pr-4 py-4 bg-[#1a202c] border-0 rounded-xl text-white placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-brand-600/40 transition-all duration-200 outline-none"
                    id="job-title"
                    placeholder="e.g. Operations Manager"
                    type="text"
                    value={formData.jobTitle}
                    onChange={e => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-[#dde2f3] mb-2 ml-1" htmlFor="company-name">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#918fa1] group-focus-within:text-[#c3c0ff] transition-colors">
                    <Building2 size={20} />
                  </div>
                  <input
                    className="block font-body w-full pl-12 pr-4 py-4 bg-[#1a202c] border-0 rounded-xl text-white placeholder:text-[#918fa1]/50 focus:ring-2 focus:ring-brand-600/40 transition-all duration-200 outline-none"
                    id="company-name"
                    placeholder="e.g. Acme Tech Solutions"
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="bg-[#1a202c] rounded-xl p-4 flex items-start gap-4 border border-[#464555]/30">
                <div className="bg-brand-600/20 p-2 rounded-lg"><Sparkles size={20} className="text-[#c3c0ff]" /></div>
                <div>
                  <p className="text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1 font-headline">AI Personalization</p>
                  <p className="text-xs text-[#918fa1] leading-relaxed font-body">
                    We use your industry data to optimize the <span className="bg-brand-600/20 px-1 rounded text-[#c3c0ff] text-[10px] font-mono">OCR-V2</span> engine for your specific document types.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: CRM & Team Size */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* CRM Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#dde2f3] mb-4 ml-1">Which CRM do you use?</label>
                <div className="grid grid-cols-2 gap-3">
                  {CRM_OPTIONS.map(crm => {
                    const Icon = crm.icon;
                    return (
                      <button
                        key={crm.id}
                        onClick={() => setFormData(prev => ({ ...prev, crm: crm.id }))}
                        className={`p-4 rounded-xl border text-left transition-all ${formData.crm === crm.id
                            ? 'bg-brand-600/10 border-brand-500 ring-2 ring-brand-500/30'
                            : 'bg-[#1a202c] border-[#464555]/30 hover:border-[#464555]'
                          }`}
                      >
                        <Icon size={20} className={formData.crm === crm.id ? 'text-brand-400 mb-2' : 'text-[#918fa1] mb-2'} />
                        <p className="text-sm font-bold text-white">{crm.name}</p>
                        <p className="text-[10px] text-[#918fa1] mt-0.5">{crm.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-semibold text-[#dde2f3] mb-4 ml-1">How large is your team?</label>
                <div className="grid grid-cols-4 gap-2">
                  {TEAM_SIZES.map(size => (
                    <button
                      key={size.value}
                      onClick={() => setFormData(prev => ({ ...prev, teamSize: size.value }))}
                      className={`p-3 rounded-xl border text-center transition-all ${formData.teamSize === size.value
                          ? 'bg-brand-600/10 border-brand-500 ring-2 ring-brand-500/30'
                          : 'bg-[#1a202c] border-[#464555]/30 hover:border-[#464555]'
                        }`}
                    >
                      <p className="text-lg font-extrabold text-white">{size.label}</p>
                      <p className="text-[10px] text-[#918fa1] mt-0.5">{size.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Use Cases */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {USE_CASES.map(uc => {
                const Icon = uc.icon;
                const selected = formData.useCases.includes(uc.id);
                return (
                  <button
                    key={uc.id}
                    onClick={() => toggleUseCase(uc.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${selected
                        ? 'bg-brand-600/10 border-brand-500 ring-2 ring-brand-500/30'
                        : 'bg-[#1a202c] border-[#464555]/30 hover:border-[#464555]'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-brand-600/20' : 'bg-[#242a36]'
                      }`}>
                      {selected ? <Check size={20} className="text-brand-400" /> : <Icon size={20} className="text-[#918fa1]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{uc.label}</p>
                      <p className="text-xs text-[#918fa1] mt-0.5">{uc.desc}</p>
                    </div>
                    <ChevronRight size={18} className={selected ? 'text-brand-400' : 'text-[#464555]'} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-8 flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-4 rounded-xl border border-[#464555]/50 text-[#918fa1] font-bold hover:text-white hover:border-[#464555] transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            )}
            <button
              onClick={() => step < totalSteps - 1 ? setStep(s => s + 1) : handleFinish()}
              disabled={!canProceed()}
              className="flex-1 bg-brand-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-[#3323cc] active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 font-headline disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600"
            >
              {step < totalSteps - 1 ? (
                <>Next Step <ArrowRight size={20} /></>
              ) : (
                <>Launch Dashboard <Sparkles size={20} /></>
              )}
            </button>
          </div>

          <p className="text-center text-[#918fa1] text-xs mt-6 font-body flex items-center justify-center gap-1.5">
            <Shield size={12} /> Secure, encrypted data processing by IntelliScan Enterprise.
          </p>
        </div>
      </div>
    </div>
  );
}
