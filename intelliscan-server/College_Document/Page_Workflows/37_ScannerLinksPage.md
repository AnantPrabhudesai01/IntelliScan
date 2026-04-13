# 🔗 Scanner Links Management

> **Page Route**: `/dashboard/scanner-links`  
> **Component**: `ScannerLinksPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
Scanner Links are unique, shareable URL endpoints that allow external users (clients, event attendees) to scan their own business cards directly into an IntelliScan workspace. Each link has its own slug, activation toggle, and scan counter — turning every link into a tracked lead-collection funnel.

---

## 🛠️ Technical Workflow

### 1. Link CRUD Operations
- **Create**: `POST /api/scanner-links` — Generates a new link with a unique slug derived from the provided name.
- **Read**: `GET /api/scanner-links` — Fetches all links for the authenticated workspace.
- **Toggle**: `PATCH /api/scanner-links/:id` — Activates/deactivates a link via `is_active` boolean.
- **Search**: Client-side `useMemo` filter on link `name` and `slug`.

### 2. Endpoint Architecture
- **Public URL Pattern**: `{origin}/scan/{slug}` — when visited, loads the ScanPage in "inbound" mode, attributing all scans to the originating workspace.
- **Scan Counter**: Each link tracks total scans via `scan_count`, incrementing on every successful OCR submission routed through that slug.

### 3. Stats Overview
- **Active Links Count**: Real-time count of currently active endpoints.
- **Global Scan Volume**: Total scans across all links, visualized with aesthetic vertical bar indicators.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ScanPage` | Route | The public-facing scan interface loaded when a link is visited |
| `contacts` table | Database | Scans through these links create new contact records |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Inbound Lead Capture** | External users self-submit their card info without needing an account |
| **Event Attribution** | Each link acts as a UTM-like tracker for lead source analysis |
| **Activation Control** | Links can be temporarily disabled after an event ends |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `scanner_links` | INSERT/SELECT/UPDATE | Full CRUD for link management |
| `contacts` | INSERT | New contacts created via inbound scans through a link |
