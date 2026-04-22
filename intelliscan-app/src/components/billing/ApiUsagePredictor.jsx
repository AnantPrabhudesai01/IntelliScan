import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, AlertTriangle, TrendingUp, Info } from 'lucide-react';

export default function ApiUsagePredictor() {
  // Mock data for the prediction chart (30 days)
  const data = useMemo(() => {
    const base = [
      42, 45, 41, 48, 52, 60, 65, 70, 75, 82, 
      88, 92, 95, 105, 110, 115, 120, 125, 130, 140,
      142, 148, 155, 160, 170, 182, 190, 205, 220, 240
    ];
    return base.map((val, i) => ({
      day: i + 1,
      actual: i < 20 ? val : null,
      predicted: i >= 19 ? val : null
    }));
  }, []);

  const currentUsage = 140;
  const projectedEnd = 450;
  const limit = 500;
  const utilization = (projectedEnd / limit) * 100;

  return (
    <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
        <TrendingUp size={240} />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-headline font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Credit Velocity Predictor</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-gray-500 dark:text-gray-400">Next-Gen AI Consumption Forecasting</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white rounded-xl shadow-sm cursor-default transition-all">
             <Zap size={14} className="text-brand-500 fill-current" />
             Linear Regression Active
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        {/* Prediction Stats */}
        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 shadow-inner group/stat hover:bg-[var(--brand)]/15 transition-all">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Current Usage (MTD)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-black italic tracking-tighter text-gray-900 dark:text-white">{currentUsage}</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Credits</span>
              </div>
           </div>

           <div className={`p-6 rounded-3xl border shadow-inner group/stat transition-all ${utilization > 80 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Projected EOM Consumption</p>
                {utilization > 80 && <AlertTriangle size={16} className="text-amber-500 animate-pulse" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-headline font-black italic tracking-tighter ${utilization > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{projectedEnd}</span>
                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Credits</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${utilization}%` }} />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-50">
                 {utilization.toFixed(1)}% of {limit} Credit Quota
              </p>
           </div>
           
           <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <Info size={16} className="text-brand-500 shrink-0" />
              <p className="text-[10px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-widest">Confidence Score: 0.94</span>. 
                Velocity is increasing due to APAC expansion.
              </p>
           </div>
        </div>

        {/* Prediction Chart */}
        <div className="lg:col-span-2 h-[340px] bg-gray-50 dark:bg-gray-950/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 over">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888822" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888' }} 
                label={{ value: 'MTD Timeline (Days)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#666', fontWeight: 'bold' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}
                labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorActual)" 
                animationDuration={2000}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#6366f1" 
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <footer className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
         <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-gray-400">
           <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-brand-500" /> Historical Data</span>
           <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-brand-500 border-t border-dashed" /> AI Projection</span>
         </div>
         <button className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 hover:brightness-110 transition-all flex items-center gap-2">
            Provision More Credits <TrendingUp size={12} />
         </button>
      </footer>
    </div>
  );
}
