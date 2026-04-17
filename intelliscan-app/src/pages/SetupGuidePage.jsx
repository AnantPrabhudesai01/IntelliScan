import React from 'react';
import { 
  MessageSquare, 
  Settings, 
  Server, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SetupGuidePage = () => {
  const webhookUrl = 'https://intelli-scan-psi.vercel.app/api/webhooks/whatsapp';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const steps = [
    {
      title: 'Join the Twilio Sandbox',
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Open WhatsApp and send the connection command to the project's sandbox number.
          </p>
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">SANDBOX NUMBER</span>
              <span className="text-purple-300 font-mono">+1 415 523 8886</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">MESSAGE COMMAND</span>
              <code className="bg-purple-500/10 text-purple-300 px-2 py-1 rounded">join baseball-eventually IS-XXXX</code>
            </div>
          </div>
          <p className="text-sm text-gray-400 italic">
            You will receive a confirmation: "You are all set!..." followed by "Phone number linked."
          </p>
        </div>
      )
    },
    {
      title: 'Configure Webhook',
      icon: <Server className="w-6 h-6 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Link your Vercel deployment to Twilio to receive images in real-time.
          </p>
          <div className="space-y-2">
            <a 
              href="https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Twilio Sandbox Settings <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-sm text-gray-400">
              Find the field <strong>"When a message comes in"</strong> and enter:
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3 border border-white/5 group">
            <code className="text-xs text-gray-300 truncate flex-1">{webhookUrl}</code>
            <button 
              onClick={() => copyToClipboard(webhookUrl)}
              className="p-2 hover:bg-white/5 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            </button>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-400">
              Ensure the method is set to <strong>POST</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Link Your Account',
      icon: <Smartphone className="w-6 h-6 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Connect your personal WhatsApp identity to your IntelliScan dashboard.
          </p>
          <ol className="space-y-3 text-sm text-gray-400 list-decimal list-inside">
            <li>Go to <strong>Settings &gt; Personal Info</strong></li>
            <li>Click <strong>"1-Click WhatsApp Connect"</strong></li>
            <li>Send the generated code to the Sandbox number.</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12 pb-20">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            <Smartphone className="w-3 h-3" /> Mobile Scanning Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
            WhatsApp Setup Guide
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Transform your phone into a powerful AI-scanning tool in less than 2 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative bg-[#121214] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A1A1E] flex items-center justify-center border border-white/5 group-hover:bg-purple-500/10 transition-colors">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-purple-500 font-bold">STEP 0{index + 1}</span>
                    <h3 className="text-xl font-semibold text-white/90">{step.title}</h3>
                  </div>
                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h4 className="text-lg font-semibold text-purple-300">Ready to start scanning?</h4>
              <p className="text-sm text-gray-400">
                Just take a photo of any business card and send it to the sandbox number. 
                Our AI will extract the details and sync them to your dashboard instantly.
              </p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-400 transition-colors flex items-center gap-2"
            >
              Return to App <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuidePage;
