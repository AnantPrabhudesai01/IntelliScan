# 🛰️ Intelligence Center & Real-Time Signals

> **Page Route**: `/dashboard/signals`  
> **Component**: `SignalsPage.jsx`  
> **Access Level**: Enterprise Tier

---

## 📖 Overview
The Intelligence Center is IntelliScan's "Proactive Networking" engine. It continuously monitors the digital landscape for changes within the user's contact list, such as promotions, job changes, or company-wide buying intent signals, providing actionable insights before a user even opens their CRM.

---

## 🛠️ Technical Workflow

### 1. Signal Analysis (`SignalsCard`)
- **Backend Sync**: Fetches live alerts from the `signals` database table via the AI processing engine.
- **Accuracy Tracking**: Displays a "Signal Accuracy" metric (e.g., 98.4%) based on historical user confirmation of alert validity.
- **Categorization**: Groups alerts into "Promotion," "Job Change," and "Buying Intent."

### 2. Buying Intent Detection
- **Strategic Intelligence**: AI scans public news and funding rounds.
- **Logic**: If a contact's company announces a series-B round or a shift in their tech stack, a "High Intent" signal is triggered in the user's feed.

### 3. Alert Rules
- **Configuration**: Users can define "Alert Rules" (e.g., "Only notify me for C-suite promotions") to filter the incoming signal stream.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ContactsPage` | Link | Signals are derived from the metadata of saved contacts |
| `SignalsCard` | Component | The primary UI element for alert visualization |
| `CoachPage` | Logic | Shares the same underlying AI model for networking advice |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Promotion Tracking** | Automates the "Congratulations" reach-out flow |
| **Buying Intent Monitoring** | Identifies the optimal window for sales re-engagement |
| **Industry Insights** | Aggregates micro-trends from the user's private Rolodex |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `signals` | SELECT | Reads all unread alerts for the current user |
| `contacts` | SELECT | References contact IDs to enrich signal data with names and photos |
| `signal_rules` | INSERT/UPDATE | Stores user-defined filtering logic |
