import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addMonths, subMonths, addMinutes } from 'date-fns';
import {
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Settings, 
  Filter, 
  Download, 
  Type, 
  Sparkles, 
  LayoutGrid, 
  List, 
  MoreHorizontal,
  PlusCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  X
} from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

import TimeGrid from '../../components/calendar/TimeGrid';
import MiniCalendar from '../../components/calendar/MiniCalendar';
import EventModal from '../../components/calendar/EventModal';
import EventDetailPopover from '../../components/calendar/EventDetailPopover';
import AISchedulingPanel from '../../components/calendar/AISchedulingPanel';

export default function CalendarPage() {
  const [view, setView] = useState('week'); // 'day' | 'week' | 'month' | 'agenda'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Panels
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCalSettings, setShowCalSettings] = useState(false);
  const [editingCal, setEditingCal] = useState(null); // { id, name, color }
  const [calSaving, setCalSaving] = useState(false);
  const [newCalName, setNewCalName] = useState('');
  const [newCalColor, setNewCalColor] = useState('#7b2fff');
  const [addingCal, setAddingCal] = useState(false);
  
  const token = getStoredToken();

  const fetchCalendars = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/calendars', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCalendars(data.calendars || []);
      setSelectedCalendarIds((data.calendars || []).map(c => c.id.toString()));
    } catch (err) {
      console.error('Failed to fetch calendars:', err);
      setLoading(false);
    }
  }, [token]);

  const fetchEvents = useCallback(async () => {
    if (selectedCalendarIds.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const start = startOfWeek(currentDate).toISOString();
      const end = endOfWeek(currentDate).toISOString();
      const res = await fetch(`/api/calendar/events?start=${start}&end=${end}&calendar_ids=${selectedCalendarIds.join(',')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedCalendarIds, token]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (formData) => {
    try {
      const method = formData.id ? 'PATCH' : 'POST';
      const url = formData.id ? `/api/calendar/events/${formData.id}/reschedule` : '/api/calendar/events';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const res = await fetch(`/api/calendar/events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPopoverEvent(null);
        setEventToDelete(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const toggleCalendar = (id) => {
    const sId = id.toString();
    setSelectedCalendarIds(prev => 
      prev.includes(sId) ? prev.filter(i => i !== sId) : [...prev, sId]
    );
  };

  const saveCalendarEdit = async () => {
    if (!editingCal) return;
    setCalSaving(true);
    try {
      await fetch(`/api/calendar/calendars/${editingCal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editingCal.name, color: editingCal.color, description: '', is_visible: 1, timezone: 'UTC' })
      });
      setEditingCal(null);
      fetchCalendars();
    } catch (err) { console.error('Failed to update calendar:', err); }
    setCalSaving(false);
  };

  const createNewCalendar = async () => {
    if (!newCalName.trim()) return;
    setAddingCal(true);
    try {
      await fetch('/api/calendar/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCalName.trim(), color: newCalColor })
      });
      setNewCalName('');
      setNewCalColor('#7b2fff');
      fetchCalendars();
    } catch (err) { console.error('Failed to create calendar:', err); }
    setAddingCal(false);
  };

  const deleteCalendar = async (calId) => {
    try {
      const res = await fetch(`/api/calendar/calendars/${calId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCalendars();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Cannot delete this calendar');
      }
    } catch (err) { console.error('Failed to delete calendar:', err); }
  };

  const PRESET_COLORS = ['#7b2fff', '#4f46e5', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#db2777', '#6366f1', '#059669', '#f59e0b'];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header Bar */}
      <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <CalendarIcon className="text-white" size={20} />
             </div>
             <div>
               <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Calendar</h1>
               <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Enterprise Edition</p>
             </div>
          </div>

          <div className="h-8 w-px bg-gray-100 dark:bg-gray-800"></div>

          <div className="flex items-center gap-4">
             <h2 className="text-lg font-black text-gray-900 dark:text-white min-w-[160px]">
               {format(currentDate, 'MMMM yyyy')}
             </h2>
             <div className="flex gap-1">
               <button 
                 onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                 <ChevronLeft size={18} className="text-gray-600" />
               </button>
               <button 
                 onClick={() => setCurrentDate(new Date())}
                 className="px-4 py-2 text-xs font-black bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all uppercase tracking-widest border border-gray-100 dark:border-gray-800"
                >
                 Today
               </button>
               <button 
                 onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
               >
                 <ChevronRight size={18} className="text-gray-600" />
               </button>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
             <button onClick={() => setView('day')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'day' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>Day</button>
             <button onClick={() => setView('week')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'week' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>Week</button>
          </div>

          <button 
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`p-3 rounded-2xl transition-all ${showAiPanel ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-white dark:bg-gray-900 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 hover:shadow-lg'}`}
          >
            <Sparkles size={18} />
          </button>

          <button 
            onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={18} /> Create Event
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-80 shrink-0 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-8 overflow-y-auto">
          
          <MiniCalendar 
            currentMonth={currentDate} 
            selectedDate={currentDate} 
            onDateClick={(d) => setCurrentDate(d)}
            onMonthChange={(m) => setCurrentDate(m)}
          />

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between">
              My Calendars
              <Settings size={12} className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setShowCalSettings(true)} />
            </h3>
            <div className="space-y-2">
              {calendars.map(cal => (
                <label key={cal.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all group">
                  <input 
                    type="checkbox" 
                    checked={selectedCalendarIds.includes(cal.id.toString())}
                    onChange={() => toggleCalendar(cal.id)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.color }}></div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 font-body">{cal.name}</span>
                </label>
              ))}
            </div>
            <button 
              onClick={() => setShowCalSettings(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Plus size={14} /> Add Calendar
            </button>
          </div>

          <div className="mt-auto space-y-4 pt-10 border-t border-gray-50 dark:border-gray-900">
             <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-3xl border border-indigo-100 dark:border-indigo-800">
               <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <ShieldCheck size={14} /> Sharing Center
               </h4>
               <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 mb-4 leading-relaxed">
                 Public booking links and team visibility controls are fully active.
               </p>
               <div className="flex gap-2">
                  <a href="/dashboard/calendar/availability" className="flex-1 py-2 text-center bg-white dark:bg-gray-800 rounded-xl text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 dark:border-indigo-700">Availability</a>
                  <a href="/dashboard/calendar/booking-links" className="flex-1 py-2 text-center bg-white dark:bg-gray-800 rounded-xl text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 dark:border-indigo-700">Links</a>
               </div>
             </div>
          </div>
        </aside>

        {/* Calendar Content Area */}
        <main className="flex-1 p-6 relative bg-gray-50/50 dark:bg-gray-950 overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm z-30">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Syncing Schedule...</span>
              </div>
            </div>
          ) : null}

          <TimeGrid 
            view={view} 
            date={currentDate} 
            events={events} 
            onEventClick={(e) => setPopoverEvent(e)}
            onTimeSlotClick={(date) => {
              setSelectedEvent({ start_datetime: date.toISOString(), end_datetime: addMinutes(date, 60).toISOString() });
              setIsModalOpen(true);
            }}
          />

          {/* Event Detail Popover */}
          {popoverEvent && (
            <div className="absolute z-50 animate-in fade-in" style={{ top: '20%', left: '30%' }}>
              <EventDetailPopover 
                event={popoverEvent} 
                onClose={() => setPopoverEvent(null)}
                onEdit={(e) => { setPopoverEvent(null); setSelectedEvent(e); setIsModalOpen(true); }}
                onDelete={handleDeleteEvent}
              />
            </div>
          )}
        </main>

        {/* AI Side Panel */}
        {showAiPanel && (
          <AISchedulingPanel 
            title="Next Step Discussion"
            onSelectTime={(slot) => {
              setSelectedEvent({ title: 'AI Suggested Meeting', start_datetime: slot.start, end_datetime: slot.end });
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Main Event Modal */}
      <EventModal 
        event={selectedEvent}
        calendars={calendars}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }}
        onSave={handleSaveEvent}
      />

      {/* Custom Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 p-8 text-center space-y-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10 mx-auto">
              <ShieldCheck size={36} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Delete Event?</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">This action cannot be undone. Are you sure you want to permanently remove <span className="text-gray-900 dark:text-white">"{eventToDelete.title}"</span>?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteEvent}
                className="flex-[1.5] py-4 text-xs font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 rounded-2xl active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Calendar Settings Modal */}
      {showCalSettings && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setShowCalSettings(false); setEditingCal(null); }}>
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Calendar Settings</h3>
              <button onClick={() => { setShowCalSettings(false); setEditingCal(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Existing Calendars */}
              {calendars.map(cal => (
                <div key={cal.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 group">
                  {editingCal?.id === cal.id ? (
                    <>
                      <div className="flex gap-1 flex-wrap">
                        {PRESET_COLORS.map(c => (
                          <button key={c} onClick={() => setEditingCal(prev => ({ ...prev, color: c }))}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${editingCal.color === c ? 'border-white dark:border-gray-300 ring-2 ring-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <input
                        value={editingCal.name}
                        onChange={e => setEditingCal(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                      <button onClick={saveCalendarEdit} disabled={calSaving}
                        className="px-3 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-all uppercase tracking-wider">
                        {calSaving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingCal(null)}
                        className="px-3 py-2 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-wider">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cal.color }}></div>
                      <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-200">{cal.name}</span>
                      {cal.is_primary ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">Primary</span>
                      ) : null}
                      <button onClick={() => setEditingCal({ id: cal.id, name: cal.name, color: cal.color || '#7b2fff' })}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Settings size={12} className="text-gray-400" />
                      </button>
                      {!cal.is_primary && (
                        <button onClick={() => { if(confirm(`Delete "${cal.name}"? All events in this calendar will be lost.`)) deleteCalendar(cal.id); }}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <X size={12} className="text-rose-400" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Add New Calendar */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Create New Calendar</p>
                <div className="flex gap-2">
                  <input
                    value={newCalName}
                    onChange={e => setNewCalName(e.target.value)}
                    placeholder="Calendar name..."
                    className="flex-1 text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && createNewCalendar()}
                  />
                  <input
                    type="color" value={newCalColor}
                    onChange={e => setNewCalColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewCalColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${newCalColor === c ? 'border-white dark:border-gray-300 ring-2 ring-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={createNewCalendar} disabled={addingCal || !newCalName.trim()}
                  className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> {addingCal ? 'Creating...' : 'Create Calendar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Loader2({ size, className }) {
  return <div className={`border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin h-${size/4} w-${size/4} ${className}`}></div>;
}
import { Loader2 as Loader2Orig } from 'lucide-react';
