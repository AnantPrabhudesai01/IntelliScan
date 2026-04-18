import React from 'react';
import { format, startOfDay, isSameDay, differenceInMinutes, startOfWeek, addDays } from 'date-fns';
import EventPill from './EventPill';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimeGrid({ view, date, events, onEventClick, onTimeSlotClick }) {
  const startDate = view === 'week' ? startOfWeek(date) : date;
  const daysCount = view === 'week' ? 7 : 1;
  const days = Array.from({ length: daysCount }, (_, i) => addDays(startDate, i));

  const getEventPosition = (event, day) => {
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    
    // Only show if it matches the current day column
    if (!isSameDay(start, day)) return null;

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = differenceInMinutes(end, start);
    
    // 1 hour = 64px (h-16)
    const top = (startMinutes / 60) * 64;
    const height = (duration / 60) * 64;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Grid Header */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="w-16 shrink-0 border-r border-gray-100 dark:border-gray-800"></div>
        {days.map((day, i) => (
          <div key={i} className="flex-1 py-4 text-center border-r last:border-0 border-gray-100 dark:border-gray-800">
            <div className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-1">{format(day, 'EEE')}</div>
            <div className={`text-xl font-black ${isSameDay(day, new Date()) ? 'text-brand-600' : 'text-gray-900 dark:text-white'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex flex-1 overflow-y-auto relative style-scrollbar">
        {/* Time Labels */}
        <div className="w-16 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
          {HOURS.map(hour => (
            <div key={hour} className="h-16 pr-2 text-right">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tabular-nums">
                {hour === 0 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        <div className="flex flex-1 relative min-h-[1536px]"> {/* 24 hours * 64px */}
          {days.map((day, dayIdx) => (
            <div 
              key={dayIdx} 
              className="flex-1 relative border-r last:border-0 border-gray-100 dark:border-gray-800 group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const totalMinutes = Math.floor((offsetY / 64) * 60);
                const clickedDate = startOfDay(day);
                clickedDate.setMinutes(totalMinutes);
                onTimeSlotClick(clickedDate);
              }}
            >
              {/* Hour Grid Lines */}
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-50 dark:border-gray-900 last:border-0 pointer-events-none"></div>
              ))}

              {/* Events in this column */}
              {events
                .filter(e => isSameDay(new Date(e.start_datetime), day))
                .map(event => {
                  const pos = getEventPosition(event, day);
                  if (!pos) return null;
                  return (
                    <EventPill 
                      key={event.id} 
                      event={event} 
                      onClick={onEventClick} 
                      style={pos}
                    />
                  );
                })}
              
              {/* Current Time Indicator */}
              {isSameDay(day, new Date()) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                  style={{ top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 60) * 64}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
