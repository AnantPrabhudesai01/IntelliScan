# 📅 Calendar Page (Enterprise Scheduling)

> **Route**: `/dashboard/calendar`  
> **Component**: `CalendarPage.jsx` (356 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Calendar is a full-featured **scheduling system** built right into the CRM. You can create meetings, manage multiple calendars (Work, Personal, Team), and use **AI Scheduling** to find optimal meeting times.

**Key features**:
- **Week/Day Views**: A time grid showing events across hours, just like Google Calendar.
- **AI Scheduling Panel**: Sparkle button opens an AI assistant that suggests the best meeting times.
- **Multi-Calendar**: Toggle visibility of different calendars (color-coded).
- **Mini Calendar Sidebar**: Quick date navigation and calendar management.
- **Booking Links**: Built-in integration with the availability and booking pages.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `view` | `'day' \| 'week'` | Current calendar view mode |
| `currentDate` | `Date` | The focal date for the visible calendar range |
| `events` | `array` | Calendar events within the visible time range |
| `calendars` | `array` | User's calendar list (each with a color) |
| `selectedCalendarIds` | `array` | Which calendars are currently visible |
| `isModalOpen` | `boolean` | Controls the event creation/edit modal |
| `selectedEvent` | `object` | Event currently being created or edited |
| `popoverEvent` | `object` | Event selected for detail popover |
| `showAiPanel` | `boolean` | Toggles the AI Scheduling side panel |

### Key Functions
1. **`fetchCalendars()`**: Loads user calendars from `GET /api/calendar/calendars`.
2. **`fetchEvents()`**: Loads events within the current week range from `GET /api/calendar/events`.
3. **`handleSaveEvent(formData)`**: Creates (`POST`) or reschedules (`PATCH`) events.
4. **`confirmDeleteEvent()`**: Deletes an event via `DELETE /api/calendar/events/:id`.
5. **`toggleCalendar(id)`**: Shows/hides a calendar's events in the view.

### Lifecycle
```
Component Mounts
    → fetchCalendars() → loads all user calendars
    → fetchEvents() → loads events for current week
    → Render TimeGrid + MiniCalendar + sidebar
User Clicks Time Slot on Grid
    → setSelectedEvent({ start, end }) → open EventModal
    → User fills title/details → handleSaveEvent()
    → POST /api/calendar/events → events refreshed
User Clicks ✦ AI Sparkle Button
    → AISchedulingPanel opens on the right side
    → AI suggests optimal 30/60-min time slots
    → User selects → auto-fills EventModal
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/calendar/calendars` | Fetch all user calendars |
| `GET` | `/api/calendar/events` | Fetch events by date range and calendar IDs |
| `POST` | `/api/calendar/events` | Create a new calendar event |
| `PATCH` | `/api/calendar/events/:id/reschedule` | Reschedule an existing event |
| `DELETE` | `/api/calendar/events/:id` | Delete a calendar event |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `TimeGrid` | Component | The main week/day grid renderer |
| `MiniCalendar` | Component | Sidebar calendar widget |
| `EventModal` | Component | Form for creating/editing events |
| `EventDetailPopover` | Component | Popup with event details |
| `AISchedulingPanel` | Component | AI time-slot suggestion engine |
| `date-fns` | Library | Date math (startOfWeek, endOfWeek, etc.) |
| `auth.js` | Utility | JWT token management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ContactsPage` | "Schedule Meeting" button navigates here |
| `AvailabilityPage` | Manages available time slots for booking |
| `BookingLinksPage` | Creates public shareable booking URLs |
| `BookingPage` | Public-facing booking form based on availability set here |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `calendars` | SELECT | User's calendar list and colors |
| `calendar_events` | SELECT, INSERT, UPDATE, DELETE | Full CRUD for calendar events |
| `availability_slots` | SELECT | Used by AI panel to suggest free time |
