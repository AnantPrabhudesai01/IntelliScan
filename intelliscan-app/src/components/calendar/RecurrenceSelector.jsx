import React from 'react';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const DAYS = [
  { value: 'SU', label: 'S' },
  { value: 'MO', label: 'M' },
  { value: 'TU', label: 'T' },
  { value: 'WE', label: 'W' },
  { value: 'TH', label: 'T' },
  { value: 'FR', label: 'F' },
  { value: 'SA', label: 'S' }
];

export default function RecurrenceSelector({ value, onChange }) {
  const rule = value || { freq: 'none' };

  const handleFreqChange = (freq) => {
    if (freq === 'none') {
      onChange(null);
    } else {
      onChange({ freq, interval: 1, byDay: [] });
    }
  };

  const toggleDay = (day) => {
    const days = rule.byDay || [];
    const newDays = days.includes(day) 
      ? days.filter(d => d !== day) 
      : [...days, day];
    onChange({ ...rule, byDay: newDays });
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleFreqChange('none')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            rule.freq === 'none' ? 'bg-brand-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          One-time
        </button>
        {FREQUENCIES.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFreqChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rule.freq === f.value ? 'bg-brand-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rule.freq !== 'none' && (
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-gray-500">Every</span>
            <input
              type="number"
              min="1"
              value={rule.interval || 1}
              onChange={(e) => onChange({ ...rule, interval: parseInt(e.target.value) })}
              className="w-16 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <span className="text-xs font-bold text-gray-500">{rule.freq}(s)</span>
          </div>

          {rule.freq === 'weekly' && (
            <div className="flex gap-1 justify-between">
              {DAYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`w-8 h-8 rounded-full text-[10px] font-black transition-all ${
                    (rule.byDay || []).includes(d.value)
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
