import React, { useMemo } from 'react';
import { Globe, TrendingUp, Zap } from 'lucide-react';

export default function GlobalIntelligenceMap() {
  const hotspots = useMemo(() => [
    { id: 1, name: 'San Francisco', x: 120, y: 150, load: 84, color: 'bg-brand-500' },
    { id: 2, name: 'New York', x: 220, y: 160, load: 92, color: 'bg-emerald-500' },
    { id: 3, name: 'London', x: 440, y: 130, load: 45, color: 'bg-blue-500' },
    { id: 4, name: 'Mumbai', x: 680, y: 220, load: 78, color: 'bg-amber-500' },
    { id: 5, name: 'Singapore', x: 780, y: 280, load: 66, color: 'bg-brand-400' },
    { id: 6, name: 'Sydney', x: 880, y: 380, load: 31, color: 'bg-purple-500' },
  ], []);

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden relative group transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <Globe size={180} />
      </div>

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-headline font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Global Lead Density</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
             <span className="flex items-center gap-1 text-emerald-500"><TrendingUp size={12} /> +12% </span> vs last week
          </p>
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
           <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm">Real-time</button>
           <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">7 Day Volume</button>
        </div>
      </header>

      <div className="relative aspect-[16/9] bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden select-none">
        {/* Simple Vector Map Mockup with SVG */}
        <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 dark:opacity-10 stroke-gray-900 dark:stroke-white fill-none" strokeWidth="0.5">
          <path d="M150,150 Q250,100 350,150 T550,150 T750,150 T950,150" />
          <path d="M100,250 Q200,200 300,250 T500,250 T700,250 T900,250" />
          <circle cx="200" cy="180" r="100" className="opacity-20" />
          <circle cx="500" cy="120" r="150" className="opacity-20" />
          <circle cx="800" cy="300" r="120" className="opacity-20" />
        </svg>

        {hotspots.map((spot) => (
          <div 
            key={spot.id} 
            className="absolute group/spot cursor-pointer transition-all hover:scale-125"
            style={{ left: `${(spot.x / 1000) * 100}%`, top: `${(spot.y / 500) * 100}%` }}
          >
            {/* Outer Pulse */}
            <div className={`absolute -inset-4 rounded-full ${spot.color} opacity-20 animate-ping`} />
            {/* Core Dot */}
            <div className={`w-3 h-3 rounded-full ${spot.color} border-2 border-white dark:border-gray-900 shadow-lg relative z-10`} />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl scale-0 group-hover/spot:scale-100 transition-transform origin-bottom shadow-2xl z-50 whitespace-nowrap">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1 mb-1">
                <span className="text-white">{spot.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${spot.color} animate-pulse`} />
              </div>
              <div className="text-gray-400">Node Load: <span className="text-white">{spot.load}%</span></div>
            </div>
          </div>
        ))}

        {/* Floating Metrics Badge */}
        <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xl flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap size={16} fill="currentColor" />
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Processing</p>
                <p className="text-sm font-black italic tracking-tighter text-gray-900 dark:text-white">1.2 TB/s</p>
              </div>
           </div>
        </div>
      </div>
      
      <footer className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
        <div className="flex gap-4">
           <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> High Traffic</span>
           <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal</span>
        </div>
        <p>Telemetry: Active 2,142 Nodes</p>
      </footer>
    </div>
  );
}
