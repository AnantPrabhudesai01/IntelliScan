import React from 'react';
import { Target, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NeuralExtractionHeatmap() {
  const fields = [
    { name: 'Full Name', success: 98, trend: '+0.2%', count: '4.1k' },
    { name: 'Job Title', success: 94, trend: '+1.5%', count: '3.8k' },
    { name: 'Company', success: 96, trend: '-0.1%', count: '3.9k' },
    { name: 'Email Address', success: 99, trend: 'stable', count: '4.2k' },
    { name: 'Phone (Direct)', success: 85, trend: '-2.4%', count: '2.1k' },
    { name: 'Phone (Mobile)', success: 89, trend: '+0.8%', count: '2.4k' },
    { name: 'Website URL', success: 92, trend: '+4.1%', count: '1.2k' },
    { name: 'LinkedIn URL', success: 88, trend: '+1.2%', count: '1.1k' },
    { name: 'Address / HQ', success: 74, trend: '+0.5%', count: '0.8k' },
    { name: 'Logo / Brand', success: 62, trend: '-5.2%', count: '0.5k' },
    { name: 'Notes / Bio', success: 58, trend: '+2.1%', count: '0.4k' },
    { name: 'Scan Artifacts', success: 99, trend: 'stable', count: '4.2k' },
  ];

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <Target size={180} />
      </div>

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-headline font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Neural Field Precision</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
             Analytics based on last <span className="text-brand-500">10,000 extractions</span>
          </p>
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
           <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
             <Activity size={16} />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 relative z-10">
        {fields.map((field) => {
          let bgColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
          let icon = <CheckCircle2 size={12} />;
          
          if (field.success < 70) {
            bgColor = 'bg-red-500/10 border-red-500/20 text-red-500';
            icon = <AlertCircle size={12} />;
          } else if (field.success < 90) {
            bgColor = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
            icon = <Activity size={12} />;
          }

          return (
            <div 
              key={field.name} 
              className={`p-4 rounded-2xl border ${bgColor} flex flex-col justify-between h-28 transition-all hover:scale-[1.02] cursor-default shadow-sm hover:shadow-md`}
            >
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{field.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black italic tracking-tighter">{field.success}%</span>
                  <span className="text-[8px] font-bold opacity-60 ml-auto whitespace-nowrap">{field.count} pts</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-current/10 pt-2 mt-auto">
                 <span className="flex items-center gap-1">{icon}</span>
                 <span className={`text-[8px] font-black uppercase tracking-widest ${field.trend.includes('-') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {field.trend}
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
         <div className="flex items-center gap-5">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal (&gt;90%)</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Review (70-90%)</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Failed (&lt;70%)</span>
         </div>
         <button className="text-brand-600 dark:text-brand-400 hover:underline">Improve Extraction Accuracy →</button>
      </footer>
    </div>
  );
}
