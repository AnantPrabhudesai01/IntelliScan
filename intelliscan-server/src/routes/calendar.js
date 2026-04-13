const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateToken, requireEnterpriseOrAdmin } = require('../middleware/auth');

// --- CALENDAR MANAGEMENT ---
router.get('/calendars', authenticateToken, calendarController.getCalendars);
router.post('/calendars', authenticateToken, requireEnterpriseOrAdmin, calendarController.createCalendar);
router.put('/calendars/:id', authenticateToken, requireEnterpriseOrAdmin, calendarController.updateCalendar);
router.delete('/calendars/:id', authenticateToken, requireEnterpriseOrAdmin, calendarController.deleteCalendar);
router.post('/calendars/:id/share', authenticateToken, requireEnterpriseOrAdmin, calendarController.shareCalendar);
router.get('/accept-share/:token', calendarController.acceptCalendarShare);

// --- EVENTS CRUD ---
router.get('/events', authenticateToken, requireEnterpriseOrAdmin, calendarController.getEvents);
router.get('/events/:id', authenticateToken, requireEnterpriseOrAdmin, calendarController.getEventById);
router.post('/events', authenticateToken, requireEnterpriseOrAdmin, calendarController.createEvent);
router.patch('/events/:id/reschedule', authenticateToken, requireEnterpriseOrAdmin, calendarController.rescheduleEvent);
router.delete('/events/:id', authenticateToken, requireEnterpriseOrAdmin, calendarController.deleteEvent);
router.get('/respond/:token', calendarController.updateRsvp);

// --- AI CALENDAR TOOLS ---
router.post('/ai/suggest-time', authenticateToken, requireEnterpriseOrAdmin, calendarController.suggestTime);
router.post('/ai/generate-description', authenticateToken, requireEnterpriseOrAdmin, calendarController.generateDescription);

// --- AVAILABILITY & BOOKING ---
router.get('/availability/:userId', calendarController.getAvailability);
router.put('/availability', authenticateToken, requireEnterpriseOrAdmin, calendarController.updateAvailability);
router.post('/booking-links', authenticateToken, requireEnterpriseOrAdmin, calendarController.createBookingLink);
router.get('/booking-links', authenticateToken, requireEnterpriseOrAdmin, calendarController.getBookingLinks);
router.get('/booking/:slug', calendarController.getBookingDetails);

module.exports = router;
