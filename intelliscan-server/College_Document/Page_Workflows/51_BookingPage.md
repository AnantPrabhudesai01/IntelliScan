# 📅 Public Booking Page

> **Page Route**: `/book/:slug`  
> **Component**: `BookingPage.jsx` (calendar)  
> **Access Level**: Public (No authentication required)

---

## 📖 Overview
The Booking Page is a public-facing, Calendly-style scheduling interface. External contacts receive a shareable booking link and can self-schedule meetings by selecting a date, choosing a time slot, and providing their name, email, and meeting notes. It is the outward-facing counterpart to the internal BookingLinksPage.

---

## 🛠️ Technical Workflow

### 1. Link Resolution (`/api/calendar/booking/:slug`)
- **Unauthenticated GET**: Fetches the booking link metadata (title, duration, description) and host information using the URL slug.
- **404 Handling**: If the slug is invalid or deactivated, a full-screen 404 view is rendered.

### 2. Multi-Step Scheduling Flow
| Step | UI | Action |
|---|---|---|
| **1. Date & Time** | 14-day rolling calendar grid + time slot buttons | User picks a date and clicks a slot |
| **2. Confirm Details** | Form with Name, Email, Notes | User submits booking details |
| **3. Success** | Confirmation card with date/time/timezone | Calendar invitation sent to email |

### 3. Date-FNS Integration
- Uses `date-fns` (`format`, `addDays`, `isSameDay`) for calendar rendering and date formatting.
- **Timezone Detection**: Automatically detects the booker's timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `BookingLinksPage` | Source | Internal users create the booking links that power this page |
| `CalendarPage` | Link | Confirmed bookings appear on the host's calendar |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Self-Service Scheduling** | External contacts book meetings without email back-and-forth |
| **Lead Capture** | Every booking collects name, email, and context notes |
| **Professional Presence** | Branded scheduling page enhances the user's professional image |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `booking_links` | SELECT | Resolves the slug to a booking link record |
| `calendar_events` | INSERT | Creates a new event on the host's calendar |
| `contacts` | INSERT/UPDATE | Optionally creates or enriches a contact from the booker's info |
