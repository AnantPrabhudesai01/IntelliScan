# 📅 Events & Campaigns Page

> **Route**: `/dashboard/events`  
> **Component**: `EventsPage.jsx` (160 lines)  
> **Access**: All authenticated users (user, business_admin, super_admin)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Events Page allows you to organize your networking activities. Instead of having one giant list of contacts, you can create "Events" (like a conference, trade show, or a specific marketing campaign) and tag your scans to them. This helps you track which events brought in the most leads and keep your follow-ups organized.

**Key features**:
- **Event Creation**: Quickly set up a new event with a name, location, and date.
- **Lead Tracking**: See at a glance how many contacts were scanned at each event.
- **Status Indicators**: Visual cues for "active" vs "completed" events.
- **Quick Filtering**: One-click navigation to see all contacts belonging to a specific event.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `events` | `array` | List of events fetched from the backend |
| `isModalOpen` | `boolean` | Controls the visibility of the "Create Event" popup |
| `formData` | `object` | Temporary storage for new event inputs (name, location, date, type) |
| `isSubmitting` | `boolean` | Prevents double-submission during API calls |

### Key Functions
1. **`fetchEvents()`**: Retrieves the list of events from `GET /api/events` using the user's JWT token.
2. **`handleCreateEvent(e)`**: Submits the form data to `POST /api/events`. On success, it refreshes the list and closes the modal.
3. **Navigation**: Uses `react-router-dom`'s `Link` to navigate to the Contacts page with a query parameter (`?eventId=ID`).

### Lifecycle
```
Component Mounts
    → fetchEvents() called
    → Request to GET /api/events (with Auth header)
    → State 'events' updated with results
    → UI renders event cards with attendee counts
User clicks "Create Event"
    → Modal opens → Form input → Submit
    → POST /api/events (payload: name, location, date, type)
    → List re-fetched → Modal closed
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/events` | Retrieves all events associated with the user/workspace |
| `POST` | `/api/events` | Creates a new event record |

### SQL Logic (Conceptual)
The backend typically performs a `JOIN` or extra subquery to count contacts per event:
```sql
SELECT e.*, (SELECT COUNT(*) FROM contacts c WHERE c.event_id = e.id) as attendees_count 
FROM events e 
WHERE e.user_id = ?
```

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common sidebar and navigation |
| `auth.js` | Utility | Handles `getStoredToken()` for API requests |
| `Lucide Icons` | Library | Visual iconography (MapPin, Users, etc.) |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ScanPage` | Users select an "Event" from this list when scanning cards |
| `ContactsPage` | Uses `eventId` query param from this page to filter results |
| `AnalyticsPage` | Uses event data to show performance by location/campaign |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `events` | SELECT, INSERT | Primary table for storing event metadata |
| `contacts` | SELECT (Count) | Used to display the number of leads per event |
