import React from 'react';
import { ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function SplashScreen({ message = "Synchronizing Neural Session..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050810] overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative flex flex-col items-center">
        {/* Glassmorphic Container */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-12 shadow-2xl flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
          
          {/* Animated Neural Orbit */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-4 rounded-full border-r-2 border-purple-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/50 animate-pulse">
                <ShieldCheck className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-white text-xl font-black tracking-[0.2em] uppercase font-headline">
              IntelliScan <span className="text-brand-500">AI</span>
            </h1>
            <div className="flex flex-col items-center gap-2">
              <p className="text-brand-400/80 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                {message}
              </p>
              
              {/* Sleek Progress Line */}
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-brand-600 to-purple-600 w-1/2 rounded-full animate-loading-bar" />
              </div>
            </div>
          </div>

          {/* Micro-stats Footer */}
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
              <Globe size={10} /> Edge_Node_Sync
            </div>
            <div className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
              <Cpu size={10} /> Neural_Init
            </div>
          </div>
        </div>

        {/* Floating Background Hint */}
        <p className="mt-8 text-white/20 text-[9px] font-medium tracking-widest">
          ESTABLISHING SECURE PROTOCOLS • V2.4.0
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
      `}} />
    </div>
  );
}
