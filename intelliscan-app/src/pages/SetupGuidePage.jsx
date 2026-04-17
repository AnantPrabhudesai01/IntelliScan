import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Server, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Info,
  Terminal,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SetupGuidePage = () => {
  const [activeView, setActiveView] = useState('user'); // 'user' | 'admin'
  const webhookUrl = 'https://intelli-scan-psi.vercel.app/api/webhooks/whatsapp';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const userSteps = [
    {
      title: 'Join the Scanning Pool',
      icon: <MessageSquare className="w-6 h-6 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Click the button below or send the "Join" command to start scanning from your mobile device.
          </p>
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono uppercase">WhatsApp Number</span>
              <span className="text-emerald-300 font-mono">+1 415 523 8886</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono uppercase">Command</span>
              <code className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">join baseball-eventually</code>
            </div>
          </div>
          <p className="text-sm text-gray-400 italic">
            You will receive a confirmation: "You are all set!..."
          </p>
        </div>
      )
    },
    {
      title: 'Submit Your First Card',
      icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Just take a clear photo of any business card and send it to the number.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Single Scan</div>
              <p className="text-[9px] text-gray-500 leading-tight">One photo of one card extract instantly.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Batch Scan</div>
              <p className="text-[9px] text-gray-500 leading-tight">Send many cards in one photo (up to 25).</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const adminSteps = [
    {
      title: 'Twilio Console Configuration',
      icon: <Server className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 italic text-sm">
            This is a one-time setup for the account owner to link their Vercel API to Twilio.
          </p>
          <div className="space-y-2">
            <a 
              href="https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Twilio Console <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-sm text-gray-400">
              Set the <strong>"When a message comes in"</strong> URL to:
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3 border border-white/5 group">
            <code className="text-xs text-gray-300 truncate flex-1">{webhookUrl}</code>
            <button 
              onClick={() => copyToClipboard(webhookUrl)}
              className="p-2 hover:bg-white/5 rounded-md"
            >
              <Copy className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            </button>
          </div>
          <p className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded">
            <strong>Warning:</strong> Method must be <strong>POST</strong>.
          </p>
        </div>
      )
    },
    {
      title: 'Environment Variables',
      icon: <Terminal className="w-6 h-6 text-gray-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Ensure these keys are present in Vercel:</p>
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="pb-2 font-mono">KEY</th>
                  <th className="pb-2 font-mono">VALUE</th>
                </tr>
              </thead>
              <tbody className="font-mono pt-2">
                <tr><td className="py-1 pr-4">TWILIO_ACCOUNT_SID</td><td className="text-purple-400">AC...</td></tr>
                <tr><td className="py-1">TWILIO_AUTH_TOKEN</td><td className="text-purple-400">*********</td></tr>
                <tr><td className="py-1">ENABLE_WHATSAPP</td><td className="text-green-400">true</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12 pb-20">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard/scan" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Scanner
          </Link>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveView('user')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeView === 'user' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              User Guide
            </button>
            <button 
              onClick={() => setActiveView('admin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeView === 'admin' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Admin Setup
            </button>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
            {activeView === 'user' ? 'WhatsApp Mobile Scan' : 'Twilio Backend Config'}
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {activeView === 'user' 
              ? 'Start scanning business cards by simply sending a photo to our WhatsApp line.'
              : 'Technical configuration for developers to link Twilio to the IntelliScan API.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6">
          {(activeView === 'user' ? userSteps : adminSteps).map((step, index) => (
            <div 
              key={index}
              className={`group relative bg-[#121214] rounded-2xl p-8 border hover:shadow-2xl transition-all duration-500 ${activeView === 'user' ? 'border-white/5 hover:border-emerald-500/30' : 'border-white/5 hover:border-purple-500/30'}`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-[#1A1A1E] flex items-center justify-center border border-white/5 transition-colors ${activeView === 'user' ? 'group-hover:bg-emerald-500/10' : 'group-hover:bg-purple-500/10'}`}>
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeView === 'user' ? 'text-emerald-500' : 'text-purple-500'}`}>STEP 0{index + 1}</span>
                    <h3 className="text-xl font-bold text-white/90">{step.title}</h3>
                  </div>
                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeView === 'user' && (
          <div className="bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl p-8 border border-emerald-500/10 text-center">
            <Info className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Did you know?</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              You can also type <code className="text-emerald-400">export</code> in WhatsApp at any time to receive your entire contact list as an Excel file!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupGuidePage;
