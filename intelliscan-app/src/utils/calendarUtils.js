/**
 * Generates a Google Calendar "Action" link for an event.
 * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&text=[TITLE]&dates=[START]/[END]&details=[DETAILS]&location=[LOCATION]
 */
export function generateGoogleCalendarLink(event) {
  if (!event || !event.start_datetime) return '#';

  const title = encodeURIComponent(event.title || 'Untitled Event');
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');
  
  // Format dates to YYYYMMDDTHHmmSSZ
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const start = formatDate(event.start_datetime);
  const end = formatDate(event.end_datetime || new Date(new Date(event.start_datetime).getTime() + 3600000).toISOString());

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Downloads a simple .ics file for the event (Universal format)
 */
export function downloadIcsFile(event) {
  if (!event || !event.start_datetime) return;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const start = formatDate(event.start_datetime);
  const end = formatDate(event.end_datetime || new Date(new Date(event.start_datetime).getTime() + 3600000).toISOString());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title || 'Untitled Event'}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(event.title || 'event').replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
