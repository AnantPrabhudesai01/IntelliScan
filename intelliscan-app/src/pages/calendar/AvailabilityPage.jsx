import React, { useState, useEffect } from 'react';
import { Clock, Save, Loader2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

const DAYS = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 0, label: 'Sunday' }
];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`/api/calendar/availability/${user.id}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/calendar/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ slots })
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Availability updated successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to update availability.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId) => {
    const exists = slots.find(s => s.day_of_week === dayId);
    if (exists) {
      setSlots(slots.filter(s => s.day_of_week !== dayId));
    } else {
      setSlots([...slots, { day_of_week: dayId, start_time: '09:00', end_time: '17:00' }]);
    }
  };

  const updateTime = (dayId, field, value) => {
    setSlots(slots.map(s => s.day_of_week === dayId ? { ...s, [field]: value } : s));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">My Availability</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Global Working Hours</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
          status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold uppercase tracking-wide">{status.message}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="p-8 space-y-6">
          {DAYS.map((day) => {
            const slot = slots.find(s => s.day_of_week === day.id);
            const isActive = !!slot;

            return (
              <div key={day.id} className={`flex flex-col md:flex-row md:items-center gap-6 p-4 rounded-3xl transition-all ${
                isActive ? 'bg-gray-50 dark:bg-gray-900 shadow-inner' : 'opacity-40 grayscale group hover:opacity-70'
              }`}>
                <div className="flex items-center gap-4 w-48">
                  <button
                    onClick={() => toggleDay(day.id)}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      isActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      isActive ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{day.label}</span>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTime(day.id, 'start_time', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none tabular-nums"
                      />
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">to</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTime(day.id, 'end_time', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none tabular-nums"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unavailable</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
         <div className="flex-1 text-center md:text-left z-10">
           <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Connect Your Calendars</h3>
           <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-lg">
             Ready to automate your scheduling? Go to your calendar and share links with clients.
           </p>
         </div>
         <div className="z-10 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
           <Calendar className="text-white" size={48} />
         </div>
         <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
