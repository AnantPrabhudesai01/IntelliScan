# 🖥️ Event Kiosk & Automated Lead Capture

> **Page Route**: `/dashboard/kiosk`  
> **Component**: `KioskMode.jsx`  
> **Access Level**: All Authenticated Users (Optimized for tablets at events)

---

## 📖 Overview
The Kiosk Mode is a specialized, hands-free interface designed for physical events like trade shows and conferences. It allows exhibitors to place a tablet at their booth for rapid, automated lead capture. It features a simplified "Capture → Qualify → Success" loop that maximizes lead velocity.

---

## 🛠️ Technical Workflow

### 1. The Capture Loop (`/api/scan`)
- **Camera Access**: Uses the browser's `capture="environment"` attribute to trigger the rear camera on mobile/tablet devices.
- **OCR Processing**: Converts the photo to a Base64 `dataUrl` and sends it to `POST /api/scan`.
- **Extraction**: The Gemini-powered OCR extracts `name`, `email`, `company`, and `title` in real-time.

### 2. Lead Qualification
- **Manual Input**: Once scanned, the "Qualify" step allows exhibitors to quickly select a **Budget**, **Implementation Timeline**, and **Buying Role**.
- **Context Preservation**: The lead is automatically assigned to a pre-selected **Event ID** if configured.

### 3. Persistence & Reset
- **Finalization**: `handleFinish()` commits the data to `POST /api/contacts`.
- **Auto-Reset**: After showing a success screen for 2.5 seconds, the page automatically clears and returns to the "Capture" state for the next guest.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ScanPage` | Link | Kiosk mode is an "extreme" version of the standard scan page for speed |
| `EventsPage` | API | Loads existing events to categorize incoming kiosk leads |
| `apiClient` | Utility | Handles the data transmission for OCR and Lead storage |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **High-Velocity Capture** | Captures a lead every 15-30 seconds without manual typing |
| **Real-time Distribution** | If a webhook is connected, kiosk leads can be synced to Salesforce instantly |
| **BANT Qualification** | Collects Budget, Authority, Need, and Timeline data at the point of contact |

---

## 📋 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | INSERT | Stores the newly scanned lead and its qualification notes |
| `events` | SELECT | Fetches the event list for the "Assign Event" dropdown |
| `crm_sync_log` | INSERT | If auto-sync is active, record the sync trigger for this lead |
