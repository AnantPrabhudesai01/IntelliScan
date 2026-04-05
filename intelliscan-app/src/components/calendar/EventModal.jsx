import React, { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import {
  X, 
  Clock, 
  MapPin, 
  AlignLeft, 
  Users, 
  Bell, 
  Repeat, 
  Sparkles, 
  Loader2, 
  Video, 
  Globe, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';
import ColorPicker from './ColorPicker';
import RecurrenceSelector from './RecurrenceSelector';
import AttendeeInput from './AttendeeInput';
import { generateGoogleCalendarLink } from '../../utils/calendarUtils';

export default function EventModal({ event, calendars, isOpen, onClose, onSave }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedEvent, setSavedEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    calendar_id: calendars?.[0]?.id || '',
    start_datetime: format(new Date(), "yyyy-MM-dd'T'HH:00"),
    end_datetime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:00"),
    all_day: false,
    location: '',
    description: '',
    color: '#7b2fff',
    recurrence_rule: null,
    conference_link: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    attendees: [],
    reminders: [{ method: 'email', minutes_before: 15 }]
  });

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start_datetime: format(new Date(event.start_datetime), "yyyy-MM-dd'T'HH:mm"),
        end_datetime: format(new Date(event.end_datetime), "yyyy-MM-dd'T'HH:mm"),
        attendees: event.attendees || [],
        reminders: event.reminders || [{ method: 'email', minutes_before: 15 }]
      });
    } else {
      setFormData(prev => ({
        ...prev,
        calendar_id: calendars?.[0]?.id || '',
        title: '',
        description: '',
        location: ''
      }));
    }
    setIsSuccess(false);
    setSavedEvent(null);
  }, [event, calendars, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setSavedEvent(formData);
      setIsSuccess(true);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiDescription = async () => {
    if (!formData.title) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/calendar/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ title: formData.title, notes: formData.description })
      });
      const data = await res.json();
      if (data.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      }
    } catch (err) {
      console.error('AI description failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {isSuccess ? (
          <div className="p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white font-headline tracking-tight">Event Scheduled!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Your event has been confirmed and synced to IntelliScan.</p>
            </div>
            
            <div className="w-full bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-2">
               <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{savedEvent.title}</p>
               <p className="text-xs font-bold text-indigo-600">{format(new Date(savedEvent.start_datetime), 'EEEE, MMMM do · h:mm a')}</p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <a 
                href={generateGoogleCalendarLink(savedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <ExternalLink size={18} /> Add to Google Calendar
              </a>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <CalendarIcon className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {event ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Enterprise Scheduler</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 style-scrollbar flex flex-col gap-8">
              {/* Main Title Input */}
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Add Event Title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 text-gray-900 dark:text-white"
                />
                <div className="flex gap-4">
                  <select 
                    value={formData.calendar_id}
                    onChange={(e) => setFormData({ ...formData, calendar_id: e.target.value })}
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-black px-3 py-1.5 rounded-xl border-none outline-none appearance-none cursor-pointer"
                  >
                    {calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ColorPicker value={formData.color} onChange={(c) => setFormData({ ...formData, color: c })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <Clock size={12} className="text-indigo-500" /> Timing
                    </label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={formData.start_datetime}
                          onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={formData.end_datetime}
                          onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <Repeat size={12} className="text-indigo-500" /> Recurrence
                    </label>
                    <RecurrenceSelector 
                      value={formData.recurrence_rule} 
                      onChange={(rule) => setFormData({ ...formData, recurrence_rule: rule })} 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <MapPin size={12} className="text-indigo-500" /> Location / Link
                    </label>
                    <input
                      type="text"
                      placeholder="Office, Room 4b, or Google Meet URL"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <Users size={12} className="text-indigo-500" /> Guests
                    </label>
                    <AttendeeInput 
                      attendees={formData.attendees} 
                      onChange={(atts) => setFormData({ ...formData, attendees: atts })} 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        <AlignLeft size={12} className="text-indigo-500" /> Description
                      </label>
                      <button
                        type="button"
                        onClick={handleAiDescription}
                        disabled={aiLoading}
                        className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
                      >
                        {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        AI Ghostwriter
                      </button>
                    </div>
                    <textarea
                      placeholder="Details about the meeting..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <Bell size={12} className="text-indigo-500" /> Notifications
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Remind me</span>
                      <input
                        type="number"
                        value={formData.reminders[0]?.minutes_before || 15}
                        onChange={(e) => setFormData({ ...formData, reminders: [{ ...formData.reminders[0], minutes_before: parseInt(e.target.value) }] })}
                        className="w-16 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">mins before</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
