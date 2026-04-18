import React from 'react';

export default function OpenRateBar({ label, rate, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-brand-500 shadow-brand-500/50',
    emerald: 'bg-emerald-500 shadow-emerald-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    rose: 'bg-rose-500 shadow-rose-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50'
  };

  const currentColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-gray-400">
        <span>{label}</span>
        <span className="text-white">{rate}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${currentColor} shadow-[0_0_8px] transition-all duration-1000 ease-out`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}
