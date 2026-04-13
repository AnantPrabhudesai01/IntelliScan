# 🏢 Organizational Intelligence & Company Mapping

> **Page Route**: `/dashboard/org-chart`  
> **Component**: `OrgChartPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Org Chart page aggregates business cards scanned by *all workspace members* to reconstruct the internal hierarchy of target companies. It provides a collaborative "Company Intelligence Map" that visualizes C-Suite, Management, and Individual-level contacts within any organization, enabling strategic account-based selling.

---

## 🛠️ Technical Workflow

### 1. Company Search & Chart Generation
- **Search**: Users type a company name; `fetchChart(company)` calls `GET /api/org-chart/:company`.
- **Backend Logic**: Queries the `contacts` table for all workspace contacts matching the company, then infers seniority levels (C-Suite, Management, Individual) from job title keywords.
- **Quick-Start**: Provides one-click shortcuts for common companies (Apple, Google, Microsoft, Tesla).

### 2. Dual View Modes
- **Tree View**: Hierarchical vertical layout with a decorative center line, grouped by seniority tiers.
- **Grid View**: Flat card grid (`grid-cols-3`) for rapid visual scanning.

### 3. Contact Deep-Dive Panel
- **Slide-in Drawer**: Clicking a node opens a full-screen right-side panel with:
  - Contact details (email, company, office location)
  - AI Context ("This contact is part of the decision-making cycle…")
  - CRM Sync and Draft Email action buttons.

### 4. Collaboration Features
- **Share Map**: Copies the current URL to clipboard for workspace sharing.
- **Export PDF**: Triggers a simulated report generation for offline distribution.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `contacts` table | Database | Source for all scanned individuals' data |
| `ContactsPage` | Link | "Sync to CRM" action redirects to the CRM export workflow |
| `DraftsPage` | Link | "Draft Email" opens the AI composer for the selected contact |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Account-Based Intelligence** | Maps an entire target organization from fragmented scanned cards |
| **Collaborative Sales** | Multiple team members' scans are merged into a single view |
| **Decision-Maker Identification** | C-Suite tagging highlights key stakeholders for sales prioritization |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT (filtered) | Groups contacts by `company` and infers `level` from `job_title` |
| `workspaces` | SELECT | Ensures multi-tenant isolation (only workspace-owned contacts appear) |
