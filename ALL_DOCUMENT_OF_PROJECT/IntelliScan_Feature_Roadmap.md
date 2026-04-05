# IntelliScan — Feature & Page Roadmap

A comprehensive list of features and new pages that can be added to differentiate IntelliScan from competitors like CamCard, Sansan, and Covve Scan.

---

## 🔥 High-Impact Features (Add Next)

### 1. Smart Contact Enrichment
> Auto-enrich scanned contacts with LinkedIn profiles, company data, and social links.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/enrichment` |
| **How** | After scanning a card, query LinkedIn/Clearbit APIs to pull profile photo, job history, company revenue, employee count |
| **Competitor** | FullContact, Clearbit |
| **Value** | Turns a flat card into a rich profile instantly |

### 2. Follow-Up Reminders & CRM Pipeline
> Set follow-up reminders on contacts + move them through a sales pipeline.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/pipeline` |
| **Components** | Kanban board (New Lead → Contacted → Meeting → Closed), reminder scheduler |
| **Why** | CamCard has no pipeline; this makes IntelliScan a mini-CRM |
| **Notification** | Browser push + email reminders |

### 3. Multi-Language Card Scanning
> Support business cards in Hindi, Japanese, Chinese, Korean, Arabic, etc.

| Detail | Description |
|--------|-------------|
| **Page** | Settings toggle in `/dashboard/settings` |
| **How** | Add a `language_hint` parameter to the Gemini prompt |
| **Competitor** | ABBYY does this well, CamCard partially |
| **Value** | Critical for Indian market (Hindi, Gujarati, Tamil cards) |

### 4. Contact Tags & Smart Folders
> Let users tag contacts (#client, #investor, #vendor) and create smart folders.

| Detail | Description |
|--------|-------------|
| **Page** | Enhanced `/dashboard/contacts` with sidebar filter |
| **Components** | Tag chips, color-coded labels, drag-to-tag, smart folders with auto-rules |
| **Why** | No competitor does tagging + auto-folders well |

### 5. Export & Integrations Hub
> One-click export to Google Contacts, Outlook, Salesforce, HubSpot, Zoho.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/integrations` |
| **Formats** | CSV, XLSX, vCard (.vcf), Google Contacts API, Outlook API |
| **Why** | Currently only exports to XLSX; adding vCard and direct CRM sync is huge |

---

## 📱 New Pages to Add

### 6. Analytics Dashboard
> Visualize scanning activity, contact growth, and networking metrics.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/analytics` |
| **Charts** | Scans per day/week/month, contacts by company, top industries, geo heatmap |
| **Library** | `recharts` or `chart.js` |
| **Why** | No competitor offers scan analytics; enterprise users love dashboards |

### 7. Team Workspace (Shared Contacts)
> Team members can share contacts, assign follow-ups, and collaborate.

| Detail | Description |
|--------|-------------|
| **Page** | `/workspace/team` |
| **Features** | Invite members by email, shared contact pool, activity log, permission roles |
| **Why** | Sansan's core feature; adding this makes IntelliScan enterprise-ready |

### 8. Contact Merge & Dedup Center
> Dedicated page to find and merge duplicate contacts across all scans.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/dedup-center` |
| **Features** | Fuzzy name matching, side-by-side comparison, one-click merge, bulk merge |
| **Why** | Currently only warns on scan; a full dedup center is more powerful |

### 9. Scan History / Activity Log
> Full timeline of all scans with thumbnails, extracted data, and status.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/scan-history` |
| **Features** | Filterable list, re-scan option, view original card image, download receipt |
| **Why** | Enterprise compliance needs audit trails |

### 10. Email Campaign Builder (Mail Merge)
> Send personalized emails to scanned contacts directly from IntelliScan.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/campaigns` |
| **Features** | Template editor, variable insertion ({name}, {company}), send via SMTP/SendGrid, open tracking |
| **Why** | Bridges the gap between contact scanning and outreach |

### 11. Digital Business Card Builder
> Enhanced `/dashboard/my-card` with QR code, NFC sharing, and custom themes.

| Detail | Description |
|--------|-------------|
| **Page** | Enhanced `/dashboard/my-card` |
| **Features** | Multiple card designs, QR code generator, NFC tap-to-share, public card URL, vCard download |
| **Competitor** | Haystack, Popl, Blinq |

### 12. Event Scanner Mode
> Dedicated mode for scanning 50+ cards at conferences/events.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/event-scanner` |
| **Features** | Rapid-fire camera mode, auto-tag with event name, post-event summary report |
| **Why** | This is where CamCard and Sansan make most of their money |

### 13. Notes & Meeting Logger
> Attach meeting notes, voice memos, and action items to contacts.

| Detail | Description |
|--------|-------------|
| **Page** | `/dashboard/contacts/:id/notes` (detail view enhancement) |
| **Features** | Rich text editor, voice-to-text memo, action item checkboxes, linked to calendar |
| **Why** | Context is everything — knowing *where* you met someone matters |

### 14. Public API & Developer Portal
> RESTful API for developers to integrate IntelliScan OCR into their own apps.

| Detail | Description |
|--------|-------------|
| **Page** | `/developer/api-docs` |
| **Features** | API key management, Swagger/OpenAPI docs, usage analytics, rate limiting, webhook config |
| **Why** | Monetization via API tier (₹499/mo for 10K API calls) |

### 15. Admin Dashboard (Super Admin Enhancements)
> Enhanced admin panel with user management, system health, and revenue tracking.

| Detail | Description |
|--------|-------------|
| **Page** | `/super-admin/dashboard` |
| **Features** | Total users chart, revenue per plan, server health monitor, flagged content review, bulk user operations |

---

## 🧠 AI-Powered Features (Gemini Integration)

### 16. Smart Contact Recommendations
> "You scanned 5 cards from TechCrunch Disrupt — want to create a group?"

### 17. Auto-CRM Insights
> "You haven't followed up with Rahul Mehta in 30 days. Here's a suggested email."

### 18. Meeting Prep AI
> Before a meeting, auto-generate a briefing doc from the contact's card + LinkedIn + past notes.

### 19. Business Card Designer AI
> Use Gemini to generate professional business card designs from your profile data.

### 20. Voice-to-Scan
> "Hey IntelliScan, scan this card" — voice-triggered camera scan using Web Speech API.

---

## 📊 Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 | Contact Tags & Smart Folders | Low | High |
| 🔴 P0 | Scan History / Activity Log | Low | High |
| 🔴 P0 | Export to vCard/Google/Outlook | Medium | High |
| 🟡 P1 | Analytics Dashboard | Medium | High |
| 🟡 P1 | Follow-Up Reminders & Pipeline | Medium | Very High |
| 🟡 P1 | Contact Merge & Dedup Center | Medium | Medium |
| 🟡 P1 | Multi-Language Scanning | Low | High |
| 🟢 P2 | Team Workspace | High | Very High |
| 🟢 P2 | Email Campaign Builder | High | High |
| 🟢 P2 | Event Scanner Mode | Medium | High |
| 🟢 P2 | Public API & Developer Portal | High | Medium |
| 🔵 P3 | Smart Contact Enrichment | High | Very High |
| 🔵 P3 | Meeting Prep AI | Medium | Medium |
| 🔵 P3 | Business Card Designer AI | Medium | Low |

---

## 🏗️ Suggested Sidebar Structure (After Adding All)

```
📱 CORE
├── Scan
├── Batch Upload
├── Scan History        ← NEW
├── Contacts
│   ├── Tags & Folders  ← NEW
│   └── Dedup Center    ← NEW
├── Pipeline            ← NEW
├── Events
├── Campaigns           ← NEW

🤖 AI TOOLS
├── AI Drafts
├── AI Coach
├── Meeting Prep        ← NEW

👤 PERSONAL
├── Digital Card
├── Analytics           ← NEW
├── Settings

🏢 ENTERPRISE
├── Team Workspace      ← NEW
├── Integrations Hub    ← NEW
├── API Portal          ← NEW

🛒 MARKETPLACE
├── Apps
├── Feedback
```

---

> **Bottom line:** IntelliScan already has a strong scanning + contact foundation. The biggest gaps vs. competitors are **CRM pipeline**, **integrations/exports**, and **analytics**. Adding those three alone would make IntelliScan competitive with ₹800/mo CamCard plans.
