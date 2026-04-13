# 🔗 Booking Links Page (Calendly-Style Scheduling)

> **Route**: `/dashboard/calendar/booking-links`  
> **Component**: `BookingLinksPage.jsx` (215 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
Booking Links gives you a **Calendly-like experience** built into IntelliScan. You create shareable links (e.g., `intelliscan.com/book/meeting-30`) that external people can use to book time on your calendar. Each link is customizable with a title, duration, color, and custom intake questions.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `links` | `array` | List of saved booking links |
| `loading` | `boolean` | Initial fetch state |
| `showNewModal` | `boolean` | Controls the creation modal visibility |
| `copiedSlug` | `string` | Tracks which link URL was just copied |
| `formData` | `object` | New booking link config (title, slug, duration, color, questions) |

### Key Functions
1. **`fetchLinks()`**: Loads all booking links from `GET /api/calendar/booking-links`.
2. **`handleCreate(e)`**: Submits a new link via `POST /api/calendar/booking-links`.
3. **`copyToClipboard(slug)`**: Copies the full booking URL to clipboard.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/calendar/booking-links` | Fetch all booking links |
| `POST` | `/api/calendar/booking-links` | Create a new booking link |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `AvailabilityPage` | Data | Time slots come from availability config |
| `auth.js` | Utility | JWT management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `BookingPage` | The public page that external visitors land on |
| `CalendarPage` | Sidebar "Links" button navigates here |
| `ContactsPage` | "Schedule Meeting" on contact cards can use these links |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `booking_links` | SELECT, INSERT | Booking link configurations |
| `availability_slots` | SELECT | Used to calculate available times |
