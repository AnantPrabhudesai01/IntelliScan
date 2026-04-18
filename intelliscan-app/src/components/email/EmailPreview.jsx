import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor, ShieldCheck, Mail, Info } from 'lucide-react';

export default function EmailPreview({ html, subject, previewText }) {
  const [device, setDevice] = useState('desktop');
  const iframeRef = useRef(null);

  // Inject styles for animations and base reset
  const baseStyles = `
    <style>
      body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333333; line-height: 1.5; }
      .container { max-width: 600px; margin: 0 auto; }
      img { max-width: 100%; height: auto; display: block; }
      
      /* Animation Support */
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      .delay-3 { animation-delay: 0.3s; }

      /* Mobile Responsive Tweaks within Iframe */
      @media only screen and (max-width: 480px) {
        body { padding: 15px; }
        .mobile-stack { width: 100% !important; display: block !important; }
      }
    </style>
  `;

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        // Wrap content in a container and add animations to top-level elements if they aren't there
        const animatedHtml = html 
          ? html.replace(/<(h[1-6]|p|div|table|img|a)/gi, (match) => match.includes('class=') 
              ? match.replace('class="', 'class="animate ') 
              : match.replace('>', ' class="animate">'))
          : '';

        doc.write(`${baseStyles}<div class="container">${animatedHtml || '<p style="text-align:center; color:#999; margin-top:100px; font-style:italic;">Design something extraordinary...</p>'}</div>`);
        doc.close();
      }
    }
  }, [html, device]);

  return (
    <div className="flex flex-col h-full bg-[#0b1120] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* Device Toggle Floating Bar */}
      <div className="absolute top-4 right-4 z-10 flex bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
        <button 
          onClick={() => setDevice('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${device === 'mobile' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-white'}`}
        >
          <Smartphone size={14} /> Mobile
        </button>
        <button 
          onClick={() => setDevice('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${device === 'desktop' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-white'}`}
        >
          <Monitor size={14} /> Desktop
        </button>
      </div>

      {/* Inbox Simulation UI */}
      <div className="px-8 py-6 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
             <Mail size={20} />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">To: (Placeholder Client)</span>
               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest italic animate-pulse">
                 <ShieldCheck size={8} /> Trusted Sender
               </span>
             </div>
             <h4 className="text-sm font-bold text-gray-400 truncate mt-0.5">Subject: {subject || '(Set a subject line)'}</h4>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
           <Info size={14} className="text-gray-600 mt-0.5" />
           <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
             Preview: {previewText || "How this email will appear in your recipient's inbox..."}
           </p>
        </div>
      </div>

      {/* Render Area with Device Frame */}
      <div className="flex-1 overflow-auto bg-[#04070a] p-10 flex justify-center items-start scrollbar-hide">
        <div 
          className="bg-white transition-all duration-700 ease-[cubic-bezier(0.16, 1, 0.3, 1)] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden rounded-md flex flex-col"
          style={{ 
            width: device === 'mobile' ? '375px' : '100%', 
            maxWidth: '700px',
            minHeight: device === 'mobile' ? '667px' : '500px',
            border: device === 'mobile' ? '12px solid #1a1a1a' : 'none',
            borderRadius: device === 'mobile' ? '40px' : '4px',
          }}
        >
          <iframe 
            ref={iframeRef}
            className="w-full h-full border-none flex-1"
            title="Email Content Preview"
          />
        </div>
      </div>
    </div>
  );
}
