# ⏰ Availability Page (Working Hours)

> **Route**: `/dashboard/calendar/availability`  
> **Component**: `AvailabilityPage.jsx` (176 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Availability Page lets you define **when you're free for meetings**. For each day of the week, you toggle availability on/off and set your working hours (e.g., Monday 9:00–17:00). This powers the Booking Links — when people try to book a meeting with you, they only see slots within these hours.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `slots` | `array` | Each slot = `{ day_of_week, start_time, end_time }` |
| `loading` | `boolean` | Initial fetch state |
| `saving` | `boolean` | Save operation state |
| `status` | `object` | Success/error notification |

### Key Functions
1. **`fetchAvailability()`**: Loads existing slots from `GET /api/calendar/availability/:userId`.
2. **`handleSave()`**: Persists the current slots via `PUT /api/calendar/availability`.
3. **`toggleDay(dayId)`**: Adds/removes a day from the slots array with default 09:00–17:00.
4. **`updateTime(dayId, field, value)`**: Updates start or end time for a given day.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/calendar/availability/:userId` | Fetch current availability slots |
| `PUT` | `/api/calendar/availability` | Save/update availability configuration |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `auth.js` | Utility | JWT token management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `BookingLinksPage` | Booking slots are calculated from availability set here |
| `BookingPage` | Public booking form respects these time windows |
| `CalendarPage` | AI scheduling panel uses availability for suggestions |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `availability_slots` | SELECT, INSERT, UPDATE, DELETE | Day/time slot configuration |
