# 🚨 System Incident Center (Super Admin)

> **Page Route**: `/admin/incidents`  
> **Component**: `SystemIncidentCenter.jsx`  
> **Access Level**: Super Admin Only

---

## 📖 Overview
The System Incident Center is the platform's operational war room. It provides Super Admins with a real-time view of system incidents, outages, and degraded performance events. Admins can create, update, and resolve incidents, post status updates, and track mean-time-to-resolution (MTTR) metrics.

---

## 🛠️ Technical Workflow

### 1. Incident Management
- **Create**: `POST /api/admin/incidents` with `{ title, severity, description, affected_services }`.
- **Update Status**: `PUT /api/admin/incidents/:id` to change status (Investigating → Identified → Monitoring → Resolved).
- **Post Updates**: `POST /api/admin/incidents/:id/updates` for timeline-style status messages.

### 2. Severity Levels
| Level | Color | Description |
|---|---|---|
| Critical | Red | Complete service outage affecting all users |
| Major | Orange | Significant degradation in core functionality |
| Minor | Yellow | Limited impact on non-critical features |
| Maintenance | Blue | Planned maintenance window |

### 3. Operations Metrics
- **Active Incidents**: Count of unresolved incidents.
- **MTTR**: Average time from creation to resolution across all historical incidents.
- **Uptime**: Calculated availability percentage for the current billing period.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `EnginePerformance` | Data | Incident creation may be triggered by performance anomalies |
| `JobQueuesPage` | Data | Queue failures may indicate systemic issues |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Operational Transparency** | Clear communication of system health to internal teams |
| **Post-Mortem Tracking** | Resolved incident timelines support RCA analysis |
| **SLA Monitoring** | Uptime metrics feed into customer SLA commitments |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `incidents` | INSERT/SELECT/UPDATE | Full lifecycle of incident records |
| `incident_updates` | INSERT/SELECT | Timeline of status messages per incident |
