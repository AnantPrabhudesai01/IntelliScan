import React from 'react';
import { format } from 'date-fns';
import { X, MapPin, Clock, Users, Video, Edit2, Trash2, Calendar as CalendarIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarLink } from '../../utils/calendarUtils';

export default function EventDetailPopover({ event, onClose, onEdit, onDelete }) {
  if (!event) return null;

  const getEventColor = (color) => {
    const hex = color || '#7b2fff';
    return { bg: `${hex}15`, text: hex, accent: hex };
  };

  const colors = getEventColor(event.color);

  return (
    <div className="flex flex-col w-80 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header with color stripe */}
      <div className="h-2 w-full" style={{ backgroundColor: colors.accent }}></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1">{event.title}</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <Clock size={14} className="text-indigo-500" />
              <span>{format(new Date(event.start_datetime), 'EEEE, MMM do')}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 dark:text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <Clock size={16} className="text-gray-400" />
            </div>
            <span>{format(new Date(event.start_datetime), 'h:mm a')} – {format(new Date(event.end_datetime), 'h:mm a')}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.conference_link && (
            <div className="flex items-center gap-3 text-sm font-bold">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
                <Video size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <a href={event.conference_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Join Online Meeting
              </a>
            </div>
          )}

          {event.description && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                {event.description}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <a 
              href={generateGoogleCalendarLink(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <ExternalLink size={14} /> Add to Google Calendar
            </a>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-black rounded-xl transition-all"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete(event)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-black rounded-xl transition-all"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
