import React, { useState, useEffect } from 'react';
import { Target, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

export default function NeuralExtractionHeatmap() {
  const [fields, setFields] = useState([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/neural-precision', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFields(data.matrix || []);
        setTotalProcessed(data.totalProcessed || 0);
      }
    } catch (err) {
      console.error('Neural precision fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <Target size={180} />
      </div>

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-headline font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Neural Field Precision</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
             Analytics based on last <span className="text-brand-500">{loading ? '...' : formatNumber(totalProcessed)} extractions</span>
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
