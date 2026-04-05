import React from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { Mail, MapPin, Users, Video } from 'lucide-react';

export default function EventPill({ event, onClick, style }) {
  const duration = differenceInMinutes(new Date(event.end_datetime), new Date(event.start_datetime));
  const isShort = duration <= 30;

  const getEventColor = (color) => {
    const hex = color || '#7b2fff';
    return {
      bg: `${hex}15`,
      border: `${hex}40`,
      text: hex,
      accent: hex
    };
  };

  const colors = getEventColor(event.color);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className={`absolute left-0 right-1 rounded-lg border-l-4 p-1.5 cursor-pointer select-none transition-all hover:brightness-95 hover:shadow-lg active:scale-95 group overflow-hidden`}
      style={{
        ...style,
        backgroundColor: colors.bg,
        borderLeftColor: colors.accent,
        borderColor: colors.border,
        borderStyle: 'solid',
        borderWidth: '1px 1px 1px 4px',
        zIndex: 10
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className={`flex items-center justify-between gap-1 ${isShort ? 'h-full' : 'mb-0.5'}`}>
          <span className={`text-[11px] font-bold truncate ${isShort ? 'leading-tight' : ''}`} style={{ color: colors.text }}>
            {event.title}
          </span>
          {event.conference_link && <Video size={10} className="shrink-0 opacity-60" style={{ color: colors.text }} />}
        </div>
        
        {!isShort && (
          <div className="flex flex-wrap items-center gap-2 opacity-70">
            <span className="text-[9px] font-medium" style={{ color: colors.text }}>
              {format(new Date(event.start_datetime), 'h:mm a')}
            </span>
            {event.location && (
              <div className="flex items-center gap-0.5 max-w-[50%]">
                <MapPin size={8} style={{ color: colors.text }} />
                <span className="text-[9px] truncate" style={{ color: colors.text }}>{event.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
