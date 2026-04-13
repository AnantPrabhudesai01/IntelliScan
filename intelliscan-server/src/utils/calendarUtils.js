/**
 * Expands a recurring event record into individual occurrences for a display range
 * @param {Object} event The event record from DB
 * @param {string} rangeStart Range start ISO string
 * @param {string} rangeEnd Range end ISO string
 * @returns {Array} List of occurrence objects
 */
exports.expandRecurringEvent = (event, rangeStart, rangeEnd) => {
  if (!event.recurrence_rule) return [event];

  let rule;
  try {
    rule = typeof event.recurrence_rule === 'string' ? JSON.parse(event.recurrence_rule) : event.recurrence_rule;
  } catch (e) {
    return [event];
  }

  const occurrences = [];
  let current = new Date(event.start_datetime);
  const eventDuration = new Date(event.end_datetime).getTime() - new Date(event.start_datetime).getTime();
  const rangeStartDate = new Date(rangeStart);
  const rangeEndDate = new Date(rangeEnd);
  let count = 0;
  const maxCount = rule.count || 500;

  while (current <= rangeEndDate && count < maxCount) {
    if (rule.until && current > new Date(rule.until)) break;

    if (current.getTime() + eventDuration >= rangeStartDate.getTime()) {
      occurrences.push({
        ...event,
        id: `${event.id}_${current.toISOString()}`,
        parent_event_id: event.id,
        start_datetime: current.toISOString(),
        end_datetime: new Date(current.getTime() + eventDuration).toISOString(),
        recurrence_id: current.toISOString(),
        is_virtual: true
      });
    }

    const interval = rule.interval || 1;
    const next = new Date(current);

    switch (rule.freq) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        if (rule.byDay && Array.isArray(rule.byDay) && rule.byDay.length > 0) {
          next.setDate(next.getDate() + 1);
          const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          while (!rule.byDay.includes(days[next.getDay()])) {
            next.setDate(next.getDate() + 1);
          }
        } else {
          next.setDate(next.getDate() + (7 * interval));
        }
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        next.setDate(next.getDate() + interval);
    }
    current = next;
    count++;
  }

  return occurrences;
};

