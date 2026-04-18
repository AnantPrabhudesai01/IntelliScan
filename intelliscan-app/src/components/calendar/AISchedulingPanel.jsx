import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, CheckCircle2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { generateGoogleCalendarLink } from '../../utils/calendarUtils';
import { getStoredToken } from '../../utils/auth.js';

export default function AISchedulingPanel({ title, onSelectTime }) {
  const [duration, setDuration] = useState(30);
  const [preferredDate, setPreferredDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/ai/suggest-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          title,
          duration_minutes: duration,
          preferred_date: preferredDate
        })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('AI Suggestion failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 w-80 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="text-white" size={16} />
          </div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">AI Scheduler</h2>
        </div>
        <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider">Smart Slot Discovery</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Meeting Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    duration === d ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Target Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <button
            onClick={getSuggestions}
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {loading ? 'Analyzing...' : 'Find Best Slots'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((s, i) => (
            <div
              key={i}
              className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-left hover:border-brand-500 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {format(new Date(s.start), 'h:mm a')}
                </span>
                <div className="flex gap-2">
                  {s.start && (
                    <a 
                      href={generateGoogleCalendarLink({ title, start_datetime: s.start, end_datetime: s.end, description: s.reason })}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-brand-600 hover:text-white rounded-lg text-gray-400 transition-all shadow-sm"
                      title="Add to Google Calendar"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button 
                    onClick={() => onSelectTime(s)}
                    className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-brand-600 hover:text-white rounded-lg text-gray-400 transition-all shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed italic">
                {s.reason}
              </p>
            </div>
          ))
        ) : !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
            <Sparkles size={48} className="mb-4 text-gray-300" />
            <p className="text-sm font-bold text-gray-400">AI will suggest the best meeting times based on your availability.</p>
          </div>
        )}
      </div>
    </div>
  );
}
