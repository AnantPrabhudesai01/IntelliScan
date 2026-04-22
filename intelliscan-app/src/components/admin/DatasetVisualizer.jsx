import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Database, ShieldCheck, AlertCircle, FileText, Sparkles } from 'lucide-react';

export default function DatasetVisualizer() {
  const qualityData = [
    { name: 'Metadata', score: 95, color: '#10b981' },
    { name: 'Field Density', score: 82, color: '#3b82f6' },
    { name: 'Image Clarity', score: 68, color: '#f59e0b' },
    { name: 'Label Consistency', score: 91, color: '#8b5cf6' },
    { name: 'Edge Cases', score: 45, color: '#ef4444' },
  ];

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
        <Database size={240} />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-headline font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Neural Dataset Readiness</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-gray-500 dark:text-gray-400">Pre-Fine-Tuning Diagnostic Scan</p>
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-600 rounded-xl">
             <ShieldCheck size={14} />
             Validated: 4,102 Nodes
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Quality Metrics */}
        <div className="space-y-4">
           {qualityData.map((item) => (
             <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{item.name}</span>
                   <span className="text-[10px] font-black tabular-nums" style={{ color: item.color }}>{item.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                </div>
             </div>
           ))}
           
           <div className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4">
              <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Instruction Required</p>
                 <p className="text-[11px] text-rose-600/80 leading-relaxed font-medium">
                   Edge case coverage is below 50%. Fine-tuning with this dataset may lead to extraction failures on high-glare or vertical-oriented business cards.
                 </p>
              </div>
           </div>
        </div>

        {/* Data Distribution */}
        <div className="bg-gray-50 dark:bg-gray-950/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
           <div className="mb-4 flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Atomic Representation</h4>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-500">
                 <Sparkles size={12} /> Auto-Clustered
              </div>
           </div>
           <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#88888822" vertical={false} />
                   <XAxis dataKey="name" hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                     itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}
                   />
                   <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 flex items-center justify-center gap-8">
              <div className="text-center">
                 <p className="text-xl font-headline font-black italic tracking-tighter text-gray-900 dark:text-white">12%</p>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Duplicate Node Rate</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
              <div className="text-center">
                 <p className="text-xl font-headline font-black italic tracking-tighter text-gray-900 dark:text-white">840ms</p>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Avg Labelling Latency</p>
              </div>
           </div>
        </div>
      </div>
      
      <footer className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
         <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
               <FileText size={14} /> Export Quality Report
            </button>
         </div>
         <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Telemetry: Ready for Inference Tuning</p>
      </footer>
    </div>
  );
}
