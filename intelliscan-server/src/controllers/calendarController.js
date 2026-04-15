/**
 * Calendar Controller — Handles calendars, events, sharing, and AI scheduling
 */
const crypto = require('crypto');
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { expandRecurringEvent } = require('../utils/calendarUtils');
const { createSmtpTransporterFromEnv } = require('../utils/smtp');
const { generateWithFallback } = require('../services/aiService');
const { getIo } = require('../services/notificationService');

// --- CALENDAR MANAGEMENT ---

exports.getCalendars = async (req, res) => {
  try {
    const userId = req.user.id;
    let own = await dbAllAsync('SELECT * FROM calendars WHERE user_id = ? ORDER BY id ASC', [userId]);
    
    // Deduplication logic: if multiple primary calendars exist, clean them up
    const primaryCals = own.filter(c => c.is_primary);
    if (primaryCals.length > 1) {
      const keepId = primaryCals[0].id;
      const deleteIds = primaryCals.slice(1).map(c => c.id);
      const placeholders = deleteIds.map(() => '?').join(',');
      await dbRunAsync(`DELETE FROM calendars WHERE id IN (${placeholders})`, deleteIds);
      // Re-fetch clean list
      own = await dbAllAsync('SELECT * FROM calendars WHERE user_id = ? ORDER BY id ASC', [userId]);
    }

    const shared = await dbAllAsync(`
      SELECT c.* FROM calendars c
      JOIN calendar_shares s ON c.id = s.calendar_id
      WHERE s.shared_with_user_id = ? AND s.accepted = 1
    `, [userId]);
    res.json({ success: true, calendars: [...own, ...shared] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createCalendar = async (req, res) => {
  const { name, description, color, timezone, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Calendar name is required' });
  try {
    const result = await dbRunAsync(
      'INSERT INTO calendars (user_id, name, description, color, timezone, type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, description, color || '#7b2fff', timezone || 'UTC', type || 'personal']
    );
    const calendar = await dbGetAsync('SELECT * FROM calendars WHERE id = ?', [result.lastID]);
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateCalendar = async (req, res) => {
  const { name, description, color, is_visible, timezone } = req.body;
  try {
    await dbRunAsync(
      `UPDATE calendars SET name = ?, description = ?, color = ?, is_visible = ?, timezone = ?
       WHERE id = ? AND user_id = ?`,
      [name, description, color, is_visible, timezone, req.params.id, req.user.id]
    );
    const calendar = await dbGetAsync('SELECT * FROM calendars WHERE id = ?', [req.params.id]);
    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCalendar = async (req, res) => {
  try {
    const cal = await dbGetAsync('SELECT is_primary FROM calendars WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (cal?.is_primary) return res.status(400).json({ error: 'Cannot delete primary calendar' });
    await dbRunAsync('DELETE FROM calendars WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.shareCalendar = async (req, res) => {
  const { email, permission } = req.body;
  const calendarId = req.params.id;
  try {
    const token = crypto.randomBytes(20).toString('hex');
    await dbRunAsync(
      'INSERT INTO calendar_shares (calendar_id, shared_with_email, permission, share_token) VALUES (?, ?, ?, ?)',
      [calendarId, email, permission || 'view', token]
    );

    const smtp = createSmtpTransporterFromEnv();
    if (smtp) {
      const serverUrl = process.env.SERVER_URL || 'https://intelliscan.vercel.app';
      await smtp.transporter.sendMail({
        from: smtp.from,
        to: email,
        subject: `${req.user.name} shared a calendar with you`,
        html: `<p>You've been invited to view/edit a calendar. Click to accept:</p>
               <a href="${serverUrl}/api/calendar/accept-share/${token}">Accept Calendar Invitation</a>`
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.acceptCalendarShare = async (req, res) => {
  try {
    const share = await dbGetAsync('SELECT * FROM calendar_shares WHERE share_token = ?', [req.params.token]);
    if (!share) return res.status(404).send('Invalid or expired invitation token.');

    const user = await dbGetAsync('SELECT id FROM users WHERE email = ?', [share.shared_with_email]);
    await dbRunAsync('UPDATE calendar_shares SET accepted = 1, shared_with_user_id = ? WHERE id = ?', [user?.id || null, share.id]);

    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:50px;">' +
      '<h1>Calendar invitation accepted!</h1>' +
      '<p>You can now view this calendar in your IntelliScan dashboard.</p>' +
      '<a href="/">Back to IntelliScan</a></body></html>');
  } catch (err) {
    res.status(500).send('Error accepting invitation.');
  }
};

// --- EVENTS CRUD ---

exports.getEvents = async (req, res) => {
  const { start, end, calendar_ids } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Start and end ranges are required.' });

  try {
    const calIds = (calendar_ids || '').split(',').filter(Boolean);
    if (calIds.length === 0) return res.json({ success: true, events: [] });

    // 1. Fetch static (non-recurring) events in range
    const placeholders = calIds.map(() => '?').join(',');
    const staticEvents = await dbAllAsync(`
      SELECT * FROM calendar_events
      WHERE calendar_id IN (${placeholders})
      AND recurrence_rule IS NULL
      AND (
        (start_datetime <= ? AND end_datetime >= ?) OR
        (start_datetime >= ? AND start_datetime <= ?)
      )
    `, [...calIds, end, start, start, end]);

    // 2. Fetch recurring events templates
    const recurringTemplates = await dbAllAsync(`
      SELECT * FROM calendar_events
      WHERE calendar_id IN (${placeholders})
      AND recurrence_rule IS NOT NULL
    `, [...calIds]);

    // 3. Expand recurring events
    let expanded = [];
    recurringTemplates.forEach(tpl => {
      expanded = [...expanded, ...expandRecurringEvent(tpl, start, end)];
    });

    // 4. Merge and sort
    const all = [...staticEvents, ...expanded].sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    res.json({ success: true, events: all });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendees = await dbAllAsync('SELECT * FROM event_attendees WHERE event_id = ?', [req.params.id]);
    const reminders = await dbAllAsync('SELECT * FROM event_reminders WHERE event_id = ?', [req.params.id]);

    res.json({ success: true, event, attendees, reminders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  const {
    calendar_id, title, description, location,
    start_datetime, end_datetime, all_day,
    color, recurrence_rule, conference_link, conference_type,
    timezone, attendees, reminders
  } = req.body;

  if (!title || !start_datetime || !end_datetime) {
    return res.status(400).json({ error: 'Title, start, and end times are required.' });
  }

  try {
    const result = await dbRunAsync(`
      INSERT INTO calendar_events (
        calendar_id, user_id, title, description, location,
        start_datetime, end_datetime, all_day, color,
        recurrence_rule, conference_link, conference_type, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      calendar_id, req.user.id, title, description, location,
      start_datetime, end_datetime, all_day ? 1 : 0, color,
      recurrence_rule ? JSON.stringify(recurrence_rule) : null,
      conference_link, conference_type, timezone || 'UTC'
    ]);

    const eventId = result.lastID;

    // Attendees
    if (Array.isArray(attendees)) {
      const smtp = createSmtpTransporterFromEnv();
      const serverUrl = process.env.SERVER_URL || 'https://intelliscan.vercel.app';
      for (const att of attendees) {
        const token = crypto.randomBytes(16).toString('hex');
        await dbRunAsync(
          'INSERT INTO event_attendees (event_id, email, name, response_token) VALUES (?, ?, ?, ?)',
          [eventId, att.email, att.name, token]
        );
        if (smtp) {
          await smtp.transporter.sendMail({
            from: smtp.from,
            to: att.email,
            subject: `Invitation: ${title}`,
            html: `<p>You are invited to: <strong>${title}</strong></p>
                   <p>Time: ${new Date(start_datetime).toLocaleString()}</p>
                   <p><a href="${serverUrl}/api/calendar/respond/${token}?status=accepted">Accept</a> | 
                      <a href="${serverUrl}/api/calendar/respond/${token}?status=declined">Decline</a></p>`
          }).catch(err => console.error('SMTP Attendee Email Error:', err));
        }
      }
    }

    // Reminders
    if (Array.isArray(reminders)) {
      for (const rem of reminders) {
        await dbRunAsync(
          'INSERT INTO event_reminders (event_id, user_id, method, minutes_before) VALUES (?, ?, ?, ?)',
          [eventId, req.user.id, rem.method || 'email', rem.minutes_before]
        );
      }
    }

    // Notify Creator
    const user = await dbGetAsync('SELECT email, name FROM users WHERE id = ?', [req.user.id]);
    const smtp = createSmtpTransporterFromEnv();
    if (smtp && user) {
      const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${new Date(start_datetime).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(end_datetime).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;

      await smtp.transporter.sendMail({
        from: smtp.from,
        to: user.email,
        subject: `Event Created: ${title}`,
        html: `
          <div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #eee; border-radius:12px; padding:30px;">
            <h2 style="color:#4f46e5; margin-top:0;">Event Scheduled Successfully!</h2>
            <p>Your event <strong>${title}</strong> has been added to your IntelliScan calendar.</p>
            <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
              <p style="margin:5px 0;"><strong>Time:</strong> ${new Date(start_datetime).toLocaleString()}</p>
              ${location ? `<p style="margin:5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            <a href="${gCalLink}" style="display:inline-block; background:#4f46e5; color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">Add to Google Calendar</a>
          </div>`
      }).catch(err => console.error('SMTP Creator Email Error:', err));
    }

    const newEvent = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [eventId]);
    const io = getIo();
    if (io) io.emit('calendar:event-created', { event: newEvent });

    res.json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.rescheduleEvent = async (req, res) => {
  const { start_datetime, end_datetime, recurrence_id } = req.body;
  try {
    const io = getIo();
    if (recurrence_id) {
      // Create an exception for this instance of a recurring event
      const original = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
      const result = await dbRunAsync(`
        INSERT INTO calendar_events (
          calendar_id, user_id, title, description, location,
          start_datetime, end_datetime, all_day, color,
          recurrence_id, is_recurring_exception, parent_event_id, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `, [
        original.calendar_id, original.user_id, original.title, original.description, original.location,
        start_datetime, end_datetime, original.all_day, original.color,
        recurrence_id, original.id, original.timezone
      ]);
      const newEvent = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [result.lastID]);
      if (io) io.emit('calendar:event-updated', { event: newEvent, exception: true });
      return res.json({ success: true, event: newEvent });
    } else {
      await dbRunAsync(
        'UPDATE calendar_events SET start_datetime = ?, end_datetime = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [start_datetime, end_datetime, req.params.id, req.user.id]
      );
      const event = await dbGetAsync('SELECT * FROM calendar_events WHERE id = ?', [req.params.id]);
      if (io) io.emit('calendar:event-updated', { event });
      res.json({ success: true, event });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const result = await dbRunAsync(
      'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }
    const io = getIo();
    if (io) io.emit('calendar:event-deleted', { eventId: parseInt(req.params.id) });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRsvp = async (req, res) => {
  const { status } = req.query;
  try {
    const attendee = await dbGetAsync('SELECT * FROM event_attendees WHERE response_token = ?', [req.params.token]);
    if (!attendee) return res.status(404).send('Invalid token.');

    await dbRunAsync(
      'UPDATE event_attendees SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, attendee.id]
    );

    const event = await dbGetAsync('SELECT title, start_datetime FROM calendar_events WHERE id = ?', [attendee.event_id]);
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;">
              <h1>Rsvp Updated</h1>
              <p>You have ${status} the invitation to <strong>${event?.title}</strong>.</p>
              <p>Time: ${new Date(event?.start_datetime).toLocaleString()}</p>
              </body></html>`);
  } catch (err) {
    res.status(500).send('Error updating RSVP.');
  }
};

// --- AVAILABILITY & BOOKING ---

exports.getAvailability = async (req, res) => {
  try {
    const slots = await dbAllAsync('SELECT * FROM availability_slots WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAvailability = async (req, res) => {
  const { slots } = req.body; // [{day_of_week, start_time, end_time}]
  try {
    await dbRunAsync('DELETE FROM availability_slots WHERE user_id = ?', [req.user.id]);
    for (const s of slots) {
      await dbRunAsync(
        'INSERT INTO availability_slots (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.user.id, s.day_of_week, s.start_time, s.end_time]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createBookingLink = async (req, res) => {
  const { title, slug, duration_minutes, questions, color } = req.body;
  try {
    const result = await dbRunAsync(`
      INSERT INTO booking_links (user_id, title, slug, duration_minutes, questions, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, slug, duration_minutes, JSON.stringify(questions), color]);
    const link = await dbGetAsync('SELECT * FROM booking_links WHERE id = ?', [result.lastID]);
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBookingLinks = async (req, res) => {
  try {
    const links = await dbAllAsync('SELECT * FROM booking_links WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const link = await dbGetAsync('SELECT * FROM booking_links WHERE slug = ? AND is_active = 1', [req.params.slug]);
    if (!link) return res.status(404).json({ error: 'Booking link not found' });
    const user = await dbGetAsync('SELECT name, email FROM users WHERE id = ?', [link.user_id]);
    const availability = await dbAllAsync('SELECT * FROM availability_slots WHERE user_id = ?', [link.user_id]);
    res.json({ success: true, booking_link: link, host: user, availability });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- AI CALENDAR TOOLS ---

exports.suggestTime = async (req, res) => {
  const { title, duration_minutes, preferred_date, notes } = req.body;
  try {
    const startRange = new Date(preferred_date);
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date(preferred_date);
    endRange.setHours(23, 59, 59, 999);

    const busy = await dbAllAsync(`
      SELECT start_datetime, end_datetime FROM calendar_events
      WHERE user_id = ? AND start_datetime <= ? AND end_datetime >= ?
    `, [req.user.id, endRange.toISOString(), startRange.toISOString()]);

    const prompt = `Given these busy slots: ${JSON.stringify(busy)}
      Suggest 3 optimal times for a ${duration_minutes} minute meeting called "${title}" on ${preferred_date}.
      Notes: ${notes || 'None'}
      Return ONLY JSON: { "suggestions": [{ "start": "ISO", "end": "ISO", "reason": "text" }], "summary": "text" }`;

    const text = await generateWithFallback(prompt);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in AI response');
      const cleanJson = jsonMatch[0].trim();
      res.json(JSON.parse(cleanJson));
    } catch (parseErr) {
      console.error('AI JSON Parse Error:', text, parseErr);
      res.status(500).json({ success: false, error: 'AI failed to generate a valid schedule. Please try again.' });
    }
  } catch (err) {
    console.error('Calendar AI Suggest Time Error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Engine failed' });
  }
};

exports.generateDescription = async (req, res) => {
  const { title, notes } = req.body;
  try {
    const prompt = `Write a professional, concise calendar event description for: ${title}. ${notes ? 'Context: ' + notes : ''}. No markdown.`;
    const text = await generateWithFallback(prompt);
    res.json({ success: true, description: text.trim() });
  } catch (err) {
    console.error('Calendar AI Generate Description Error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Engine failed' });
  }
};
