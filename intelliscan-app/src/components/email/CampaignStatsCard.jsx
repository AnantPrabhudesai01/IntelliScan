import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CampaignStatsCard({ label, value, percentage, trend = 'up', color = 'indigo' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;

    let timer = setInterval(() => {
      setDisplayValue(prev => {
        if (prev < end) return Math.min(prev + Math.ceil(end / 20), end);
        clearInterval(timer);
        return end;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-400 border-blue-500/30',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/30'
  };

  const currentStyle = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${currentStyle} shadow-lg shadow-black/20`}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400/80">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-black text-white">{percentage ? `${displayValue}%` : displayValue.toLocaleString()}</h3>
          {percentage && (
            <div className="mt-2 w-32 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-current transition-all duration-1000`} 
                style={{ width: `${displayValue}%` }}
              />
            </div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            12.5%
          </div>
        )}
      </div>
    </div>
  );
}
