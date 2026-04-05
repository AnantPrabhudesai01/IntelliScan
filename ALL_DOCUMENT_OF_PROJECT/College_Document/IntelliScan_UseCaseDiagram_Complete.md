# IntelliScan — Complete Use Case Diagrams

> **Purpose**: Comprehensive UML Use Case Diagrams covering every feature module of the IntelliScan platform.  
> **Format**: Mermaid syntax for rendering in markdown viewers.  
> **Actors**: Anonymous User, Personal User, Enterprise Admin, Super Admin, External Systems (Gemini AI, SMTP, CRM).

---

## TABLE OF CONTENTS

1. [Master Use Case Diagram (All Actors)](#1-master-use-case-diagram)
2. [Authentication & Onboarding Module](#2-authentication--onboarding-module)
3. [AI Card Scanning Module](#3-ai-card-scanning-module)
4. [Contact Management Module](#4-contact-management-module)
5. [Calendar & Scheduling Module](#5-calendar--scheduling-module)
6. [Email Marketing Module](#6-email-marketing-module)
7. [Workspace & Team Management Module](#7-workspace--team-management-module)
8. [Platform Administration Module](#8-platform-administration-module)
9. [Analytics & Intelligence Module](#9-analytics--intelligence-module)
10. [Security & Compliance Module](#10-security--compliance-module)
11. [Use Case Descriptions Table](#11-use-case-descriptions-table)

---

## 1. MASTER USE CASE DIAGRAM

This is the top-level view showing all actors and their primary interactions with the system.

```mermaid
graph TB
    subgraph Actors
        AU["👤 Anonymous User"]
        PU["👤 Personal User"]
        EA["👤 Enterprise Admin"]
        SA["👤 Super Admin"]
        AI["🤖 Gemini AI Engine"]
        SMTP["📧 SMTP Server"]
        CRM["🔗 External CRM"]
    end

    subgraph IntelliScan["IntelliScan Platform"]
        subgraph Auth["Authentication"]
            UC01["UC-01: Register Account"]
            UC02["UC-02: Login"]
            UC03["UC-03: Reset Password"]
            UC04["UC-04: Complete Onboarding"]
        end

        subgraph Scanning["AI Card Scanning"]
            UC05["UC-05: Scan Single Card"]
            UC06["UC-06: Batch Scan Cards"]
            UC07["UC-07: Review Extracted Data"]
            UC08["UC-08: Use Kiosk Mode"]
        end

        subgraph Contacts["Contact Management"]
            UC09["UC-09: View Contact List"]
            UC10["UC-10: Search Contacts"]
            UC11["UC-11: Export Contacts"]
            UC12["UC-12: Manage Relationships"]
            UC13["UC-13: Deduplicate Contacts"]
        end

        subgraph Calendar["Calendar & Scheduling"]
            UC14["UC-14: Manage Calendar Events"]
            UC15["UC-15: Set Availability"]
            UC16["UC-16: Create Booking Link"]
            UC17["UC-17: Book Appointment"]
        end

        subgraph Email["Email Marketing"]
            UC18["UC-18: Create Campaign"]
            UC19["UC-19: Manage Contact Lists"]
            UC20["UC-20: Send Campaign"]
            UC21["UC-21: View Campaign Analytics"]
        end

        subgraph Workspace["Workspace Management"]
            UC22["UC-22: Invite Team Members"]
            UC23["UC-23: Manage Members"]
            UC24["UC-24: Manage Billing"]
            UC25["UC-25: Configure Data Policies"]
        end

        subgraph Admin["Platform Administration"]
            UC26["UC-26: Monitor System Health"]
            UC27["UC-27: Manage AI Engine"]
            UC28["UC-28: Manage Incidents"]
            UC29["UC-29: Review Audit Logs"]
        end
    end

    AU --> UC01
    AU --> UC02
    AU --> UC03
    AU --> UC17

    PU --> UC04
    PU --> UC05
    PU --> UC06
    PU --> UC07
    PU --> UC08
    PU --> UC09
    PU --> UC10
    PU --> UC11

    EA --> UC12
    EA --> UC13
    EA --> UC14
    EA --> UC15
    EA --> UC16
    EA --> UC18
    EA --> UC19
    EA --> UC20
    EA --> UC21
    EA --> UC22
    EA --> UC23
    EA --> UC24
    EA --> UC25

    SA --> UC26
    SA --> UC27
    SA --> UC28
    SA --> UC29

    UC05 -.-> AI
    UC06 -.-> AI
    UC20 -.-> SMTP
    UC22 -.-> SMTP
    UC11 -.-> CRM
```

---

## 2. AUTHENTICATION & ONBOARDING MODULE

```mermaid
graph LR
    AU["👤 Anonymous User"]
    PU["👤 Personal User"]
    SMTP["📧 SMTP Server"]

    subgraph Authentication["Authentication & Onboarding System"]
        UC01["UC-01: Register Account"]
        UC02["UC-02: Login with Email/Password"]
        UC03["UC-03: Request Password Reset"]
        UC04["UC-04: Complete Onboarding Wizard"]
        UC05["UC-05: View Public Landing Page"]
        UC06["UC-06: View API Documentation"]
        UC07["UC-07: Accept Workspace Invitation"]
        UC08["UC-08: View Public Profile"]
        UC09["UC-09: Logout / Sign Out"]

        UC01_1["Validate Email Uniqueness"]
        UC01_2["Hash Password with bcrypt"]
        UC01_3["Generate JWT Token"]
        UC02_1["Verify Credentials"]
        UC02_2["Create Session Record"]
        UC03_1["Send Reset Email"]
        UC04_1["Save Onboarding Preferences"]
        UC07_1["Validate Invitation Token"]
        UC07_2["Assign to Workspace"]
    end

    AU --> UC01
    AU --> UC02
    AU --> UC03
    AU --> UC05
    AU --> UC06
    AU --> UC08
    AU --> UC07

    PU --> UC04
    PU --> UC09

    UC01 --> UC01_1
    UC01 --> UC01_2
    UC01 --> UC01_3
    UC02 --> UC02_1
    UC02 --> UC02_2
    UC03 --> UC03_1
    UC03_1 -.-> SMTP
    UC04 --> UC04_1
    UC07 --> UC07_1
    UC07 --> UC07_2
```

### Use Case Descriptions — Authentication

| ID | Use Case | Actor | Precondition | Flow | Postcondition |
|:---|:---------|:------|:-------------|:-----|:--------------|
| UC-01 | Register Account | Anonymous | No existing account with email | 1. Enter name, email, password 2. System validates uniqueness 3. bcrypt hashes password 4. INSERT into users table 5. JWT token generated | User account created, token returned |
| UC-02 | Login | Anonymous | Account exists | 1. Enter email, password 2. System fetches user by email 3. bcrypt.compare verifies 4. JWT signed 5. Session created | JWT returned, session logged |
| UC-03 | Reset Password | Anonymous | Account exists | 1. Enter email 2. System sends reset link via SMTP | Reset email sent |
| UC-04 | Complete Onboarding | Personal User | Logged in, first visit | 1. Select industry 2. Choose use case 3. Set preferences 4. POST /api/onboarding | Preferences saved |
| UC-07 | Accept Invitation | Anonymous | Valid invitation token | 1. Click invitation link 2. Register/login 3. Token validated 4. workspace_id assigned | User added to workspace |

---

## 3. AI CARD SCANNING MODULE

```mermaid
graph LR
    PU["👤 Personal User"]
    EA["👤 Enterprise Admin"]
    AI["🤖 Gemini Vision AI"]
    OCR["🔧 Tesseract OCR"]
    DB["🗄️ SQLite Database"]

    subgraph ScanningSystem["AI Card Scanning System"]
        UC10["UC-10: Upload Card Image"]
        UC11["UC-11: Capture Card via Camera"]
        UC12["UC-12: Process Single Card Scan"]
        UC13["UC-13: Process Batch Multi-Scan"]
        UC14["UC-14: Review Extracted Data"]
        UC15["UC-15: Edit Extracted Fields"]
        UC16["UC-16: Save Contact from Scan"]
        UC17["UC-17: Reject/Discard Scan Result"]
        UC18["UC-18: Use Kiosk Mode"]
        UC19["UC-19: View Scan History"]
        UC20["UC-20: Check Scan Quota"]

        UC12_1["Select AI Engine"]
        UC12_2["Send to Gemini Vision API"]
        UC12_3["Fallback to Tesseract OCR"]
        UC12_4["Parse AI Response to JSON"]
        UC12_5["Calculate Confidence Score"]
        UC12_6["Detect Duplicate by Email"]
        UC16_1["INSERT into contacts table"]
        UC16_2["Update user_quotas"]
        UC16_3["Log to audit_trail"]
        UC16_4["Emit Socket.IO event"]
    end

    PU --> UC10
    PU --> UC11
    PU --> UC12
    PU --> UC14
    PU --> UC15
    PU --> UC16
    PU --> UC17
    PU --> UC19
    PU --> UC20

    EA --> UC13
    EA --> UC18

    UC12 --> UC12_1
    UC12_1 --> UC12_2
    UC12_1 --> UC12_3
    UC12_2 -.-> AI
    UC12_3 -.-> OCR
    UC12 --> UC12_4
    UC12 --> UC12_5
    UC12 --> UC12_6

    UC16 --> UC16_1
    UC16_1 -.-> DB
    UC16 --> UC16_2
    UC16 --> UC16_3
    UC16 --> UC16_4
```

### Scan Flow — Step by Step

| Step | Action | System Component | Data |
|:-----|:-------|:-----------------|:-----|
| 1 | User uploads/captures card image | Frontend (ScanPage) | Base64 image string |
| 2 | Frontend sends POST /api/scan | Axios HTTP Client | `{ image: "data:image/jpeg;base64,..." }` |
| 3 | Backend selects AI engine | index.js scan handler | Engine priority: Gemini → OpenAI → Tesseract |
| 4 | Image sent to Gemini Vision | @google/generative-ai | Structured prompt + image |
| 5 | AI returns extracted data | Gemini API | `{ name, email, phone, company, job_title }` |
| 6 | System checks for duplicates | SQLite query | `SELECT * FROM contacts WHERE email = ?` |
| 7 | Confidence score calculated | Backend logic | Based on field completeness (0-100%) |
| 8 | Contact saved to database | SQLite INSERT | `INSERT INTO contacts (...)` |
| 9 | Quota incremented | SQLite UPDATE | `UPDATE user_quotas SET used_count = used_count + 1` |
| 10 | Audit event logged | audit_trail table | Action: CARD_SCAN, status, details |
| 11 | Real-time notification | Socket.IO emit | `contact:new` event to all connected clients |
| 12 | Result returned to frontend | Express response | JSON contact object with ID |

---

## 4. CONTACT MANAGEMENT MODULE

```mermaid
graph LR
    PU["👤 Personal User"]
    EA["👤 Enterprise Admin"]
    AI["🤖 Gemini AI"]
    CRM["🔗 External CRM"]

    subgraph ContactSystem["Contact Management System"]
        UC21["UC-21: View Contact List"]
        UC22["UC-22: Search Contacts by Field"]
        UC23["UC-23: Semantic AI Search"]
        UC24["UC-24: View Contact Detail"]
        UC25["UC-25: Edit Contact"]
        UC26["UC-26: Delete Contact"]
        UC27["UC-27: Add Tags to Contact"]
        UC28["UC-28: Export to Excel"]
        UC29["UC-29: Export to CRM"]
        UC30["UC-30: Define Relationship"]
        UC31["UC-31: View Org Chart"]
        UC32["UC-32: Enrich Contact with AI"]
        UC33["UC-33: Generate AI Draft for Contact"]
        UC34["UC-34: Detect Duplicates"]
        UC35["UC-35: Merge Duplicate Contacts"]
        UC36["UC-36: View Shared Rolodex"]
        UC37["UC-37: Set Routing Rules"]
        UC38["UC-38: View Contact Statistics"]
    end

    PU --> UC21
    PU --> UC22
    PU --> UC23
    PU --> UC24
    PU --> UC25
    PU --> UC26
    PU --> UC27
    PU --> UC28
    PU --> UC33

    EA --> UC29
    EA --> UC30
    EA --> UC31
    EA --> UC32
    EA --> UC34
    EA --> UC35
    EA --> UC36
    EA --> UC37
    EA --> UC38

    UC23 -.-> AI
    UC29 -.-> CRM
    UC32 -.-> AI
    UC33 -.-> AI
```

### Key Contact Use Cases — Detailed

| ID | Use Case | Trigger | Steps | Dependencies |
|:---|:---------|:--------|:------|:-------------|
| UC-21 | View Contact List | User navigates to /dashboard/contacts | 1. GET /api/contacts 2. ContactContext provides data 3. Render table with pagination | ContactContext, auth token |
| UC-23 | Semantic AI Search | User types natural language query | 1. GET /api/contacts/semantic-search?q=... 2. Gemini processes query 3. Returns ranked results | Gemini AI |
| UC-29 | Export to CRM | Admin clicks "Export to Salesforce" | 1. POST /api/contacts/export-crm 2. Map fields via crm_mappings 3. Send to external API 4. Log in crm_sync_log | CRM mapping config |
| UC-30 | Define Relationship | Admin selects two contacts | 1. POST /api/contacts/relationships 2. Type: reports_to/colleague 3. INSERT contact_relationships | Two valid contacts |
| UC-31 | View Org Chart | Admin visits /workspace/org-chart | 1. GET /api/org-chart/:company 2. Query contact_relationships 3. Render tree visualization | Contact relationships data |
| UC-32 | Enrich Contact | Admin clicks "Enrich" on contact | 1. POST /api/contacts/:id/enrich 2. AI infers industry, seniority, bio 3. UPDATE contact record | Gemini AI |
| UC-35 | Merge Duplicates | Admin resolves dedup queue item | 1. POST /api/workspace/data-quality/queue/:id/merge 2. Merge fields 3. DELETE secondary 4. Update references | Dedup queue data |

---

## 5. CALENDAR & SCHEDULING MODULE

```mermaid
graph LR
    EA["👤 Enterprise Admin"]
    PU["👤 Personal User"]
    AU["👤 Anonymous User"]
    AI["🤖 Gemini AI"]
    SMTP["📧 SMTP Server"]

    subgraph CalendarSystem["Calendar & Scheduling System"]
        UC40["UC-40: Create Calendar"]
        UC41["UC-41: Create Event"]
        UC42["UC-42: Edit/Reschedule Event"]
        UC43["UC-43: Add Attendees"]
        UC44["UC-44: Set Recurrence"]
        UC45["UC-45: AI Suggest Best Time"]
        UC46["UC-46: AI Generate Description"]
        UC47["UC-47: Set Event Reminder"]
        UC48["UC-48: Share Calendar"]
        UC49["UC-49: Set Availability Slots"]
        UC50["UC-50: Create Booking Link"]
        UC51["UC-51: Book Appointment"]
        UC52["UC-52: RSVP to Invitation"]
        UC53["UC-53: Link Event to Contacts"]
        UC54["UC-54: Receive Reminder Email"]
    end

    EA --> UC40
    EA --> UC41
    EA --> UC42
    EA --> UC43
    EA --> UC44
    EA --> UC45
    EA --> UC46
    EA --> UC47
    EA --> UC48
    EA --> UC49
    EA --> UC50
    EA --> UC53

    AU --> UC51
    AU --> UC52

    UC45 -.-> AI
    UC46 -.-> AI
    UC43 -.-> SMTP
    UC54 -.-> SMTP
```

### Calendar Data Flow

```
User creates event (CalendarPage)
    │
    ├── POST /api/calendar/events
    │   ├── INSERT calendar_events (title, start, end, recurrence)
    │   ├── INSERT event_attendees (email, name, status=pending)
    │   ├── INSERT event_reminders (method=email, minutes_before)
    │   └── INSERT event_contact_links (event_id, contact_id)
    │
    ├── Attendees receive email invitation (Nodemailer)
    │   └── Email contains RSVP link: /api/calendar/respond/:token
    │
    ├── Cron job (every 5 min) checks event_reminders
    │   └── If due: send reminder email via SMTP
    │
    └── User shares calendar
        └── POST /api/calendar/calendars/:id/share
            └── INSERT calendar_shares (permission: view/edit)
```

---

## 6. EMAIL MARKETING MODULE

```mermaid
graph LR
    EA["👤 Enterprise Admin"]
    AI["🤖 Gemini AI"]
    SMTP["📧 SMTP Server"]

    subgraph EmailSystem["Email Marketing System"]
        UC60["UC-60: Create Campaign"]
        UC61["UC-61: Use AI Auto-Writer"]
        UC62["UC-62: Select Email Template"]
        UC63["UC-63: Create Contact List"]
        UC64["UC-64: Add Contacts to List"]
        UC65["UC-65: Preview Audience"]
        UC66["UC-66: Send Campaign"]
        UC67["UC-67: Schedule Campaign"]
        UC68["UC-68: Track Opens"]
        UC69["UC-69: Track Clicks"]
        UC70["UC-70: View Campaign Analytics"]
        UC71["UC-71: Create Email Template"]
        UC72["UC-72: Create Email Sequence"]
        UC73["UC-73: Manage Unsubscribes"]
    end

    EA --> UC60
    EA --> UC61
    EA --> UC62
    EA --> UC63
    EA --> UC64
    EA --> UC65
    EA --> UC66
    EA --> UC67
    EA --> UC68
    EA --> UC69
    EA --> UC70
    EA --> UC71
    EA --> UC72
    EA --> UC73

    UC61 -.-> AI
    UC66 -.-> SMTP
```

### Email Campaign Lifecycle

| Phase | Use Case | API Endpoint | Database Tables |
|:------|:---------|:-------------|:----------------|
| 1. Create | UC-60: Create Campaign | POST /api/campaigns | email_campaigns |
| 2. Write | UC-61: AI Auto-Writer | POST /api/campaigns/auto-write | email_campaigns (body updated) |
| 3. Template | UC-62: Select Template | GET /api/email-templates | email_templates |
| 4. Target | UC-63-64: Build List | POST /api/email-lists | email_lists, email_list_contacts |
| 5. Preview | UC-65: Preview Audience | GET /api/campaigns/audience-preview | contacts + email_list_contacts |
| 6. Send | UC-66: Send Campaign | POST (trigger send) | email_sends, campaign_recipients |
| 7. Track | UC-68-69: Track engagement | Pixel/link tracking | email_sends (opens), email_clicks |
| 8. Analyze | UC-70: View Analytics | GET /api/campaigns/:id | Aggregated stats |

---

## 7. WORKSPACE & TEAM MANAGEMENT MODULE

```mermaid
graph LR
    EA["👤 Enterprise Admin"]
    PU["👤 Personal User"]
    SMTP["📧 SMTP Server"]

    subgraph WorkspaceSystem["Workspace & Team System"]
        UC80["UC-80: View Workspace Dashboard"]
        UC81["UC-81: Invite Member via Email"]
        UC82["UC-82: Bulk Import Members"]
        UC83["UC-83: Remove Member"]
        UC84["UC-84: Change Member Role"]
        UC85["UC-85: View Workspace Contacts"]
        UC86["UC-86: Use Workspace Chat"]
        UC87["UC-87: View Team Leaderboard"]
        UC88["UC-88: Manage Billing"]
        UC89["UC-89: Add Payment Method"]
        UC90["UC-90: View Invoices"]
        UC91["UC-91: Export Invoice"]
        UC92["UC-92: Set Data Retention Policy"]
        UC93["UC-93: Enable PII Redaction"]
        UC94["UC-94: Configure Webhooks"]
        UC95["UC-95: View CRM Pipeline"]
        UC96["UC-96: Configure CRM Mapping"]
    end

    EA --> UC80
    EA --> UC81
    EA --> UC82
    EA --> UC83
    EA --> UC84
    EA --> UC85
    EA --> UC88
    EA --> UC89
    EA --> UC90
    EA --> UC91
    EA --> UC92
    EA --> UC93
    EA --> UC94
    EA --> UC95
    EA --> UC96

    PU --> UC86
    PU --> UC87

    UC81 -.-> SMTP
```

### Invitation Flow Detail

```
Enterprise Admin invites user
    │
    ├── POST /api/workspace/members/invite
    │   ├── Check if email already in workspace → 400 error
    │   ├── Check if user exists in another org → 400 error
    │   ├── If user exists (no workspace): UPDATE workspace_id
    │   ├── If user doesn't exist: CREATE skeleton user
    │   └── Log audit: TEAM_MEMBER_INVITE
    │
    ├── POST /api/workspaces/:id/invitations
    │   ├── Generate crypto token (32 bytes hex)
    │   ├── INSERT workspace_invitations (token, expires 7 days)
    │   ├── Send email via Nodemailer with accept link
    │   └── Log audit: SEND_INVITATION
    │
    └── Invitee accepts
        ├── POST /api/workspaces/invitations/:token/accept
        ├── Validate token + check expiry
        ├── UPDATE users SET workspace_id, role
        ├── UPDATE workspace_invitations SET status=accepted
        └── Log audit: ACCEPT_INVITATION
```

---

## 8. PLATFORM ADMINISTRATION MODULE

```mermaid
graph LR
    SA["👤 Super Admin"]
    AI["🤖 AI Engine"]

    subgraph AdminSystem["Platform Administration System"]
        UC100["UC-100: View Admin Dashboard"]
        UC101["UC-101: Monitor System Health"]
        UC102["UC-102: View CPU/Memory/DB Metrics"]
        UC103["UC-103: Configure AI Engine"]
        UC104["UC-104: Tune OCR Parameters"]
        UC105["UC-105: View Model Versions"]
        UC106["UC-106: Rollback AI Model"]
        UC107["UC-107: Test API in Sandbox"]
        UC108["UC-108: View Sandbox Logs"]
        UC109["UC-109: Create Incident"]
        UC110["UC-110: Acknowledge Incident"]
        UC111["UC-111: Resolve Incident"]
        UC112["UC-112: Review Audit Logs"]
        UC113["UC-113: View All Workspaces"]
        UC114["UC-114: Monitor Integration Health"]
        UC115["UC-115: Retry Failed Sync Jobs"]
        UC116["UC-116: Review User Feedback"]
        UC117["UC-117: Manage Custom AI Models"]
        UC118["UC-118: Monitor Job Queues"]
    end

    SA --> UC100
    SA --> UC101
    SA --> UC102
    SA --> UC103
    SA --> UC104
    SA --> UC105
    SA --> UC106
    SA --> UC107
    SA --> UC108
    SA --> UC109
    SA --> UC110
    SA --> UC111
    SA --> UC112
    SA --> UC113
    SA --> UC114
    SA --> UC115
    SA --> UC116
    SA --> UC117
    SA --> UC118

    UC103 -.-> AI
    UC106 -.-> AI
    UC107 -.-> AI
```

---

## 9. ANALYTICS & INTELLIGENCE MODULE

```mermaid
graph LR
    PU["👤 Personal User"]
    EA["👤 Enterprise Admin"]
    AU["👤 Anonymous User"]
    AI["🤖 Gemini AI"]

    subgraph AnalyticsSystem["Analytics & Intelligence System"]
        UC120["UC-120: View Personal Scan Stats"]
        UC121["UC-121: View Workspace Analytics"]
        UC122["UC-122: View Public Platform Stats"]
        UC123["UC-123: View AI Networking Coach"]
        UC124["UC-124: View Networking Signals"]
        UC125["UC-125: Use Global Search"]
        UC126["UC-126: Use Command Palette"]
        UC127["UC-127: View Activity Feed"]
        UC128["UC-128: Track Page Views"]
        UC129["UC-129: AI Forecasting Insights"]
        UC130["UC-130: View Strategic Account Reviews"]
    end

    PU --> UC120
    PU --> UC123
    PU --> UC124
    PU --> UC125
    PU --> UC126
    PU --> UC128

    EA --> UC121
    EA --> UC127
    EA --> UC129
    EA --> UC130

    AU --> UC122

    UC123 -.-> AI
    UC129 -.-> AI
```

---

## 10. SECURITY & COMPLIANCE MODULE

```mermaid
graph LR
    PU["👤 Personal User"]
    EA["👤 Enterprise Admin"]
    SA["👤 Super Admin"]

    subgraph SecuritySystem["Security & Compliance System"]
        UC140["UC-140: View Active Sessions"]
        UC141["UC-141: Revoke Session"]
        UC142["UC-142: Revoke All Other Sessions"]
        UC143["UC-143: Change Password"]
        UC144["UC-144: Setup MFA"]
        UC145["UC-145: Configure SSO/SAML"]
        UC146["UC-146: View Audit Trail"]
        UC147["UC-147: Set Data Retention Rules"]
        UC148["UC-148: Enable PII Redaction"]
        UC149["UC-149: GDPR Compliance Center"]
        UC150["UC-150: View Security Threats"]
        UC151["UC-151: Rate Limit Protection"]
        UC152["UC-152: Whitelabel Branding"]
    end

    PU --> UC140
    PU --> UC141
    PU --> UC142
    PU --> UC143

    EA --> UC145
    EA --> UC146
    EA --> UC147
    EA --> UC148
    EA --> UC152

    SA --> UC144
    SA --> UC149
    SA --> UC150
    SA --> UC151
```

---

## 11. USE CASE DESCRIPTIONS TABLE

### Complete Use Case Summary (All Modules)

| ID | Use Case Name | Primary Actor | Module | API Endpoint | Database Table(s) |
|:---|:-------------|:--------------|:-------|:-------------|:-------------------|
| UC-01 | Register Account | Anonymous | Auth | POST /api/auth/register | users |
| UC-02 | Login | Anonymous | Auth | POST /api/auth/login | users, sessions |
| UC-03 | Reset Password | Anonymous | Auth | POST /api/auth/forgot | users |
| UC-04 | Complete Onboarding | Personal User | Auth | POST /api/onboarding | onboarding_prefs |
| UC-05 | View Landing Page | Anonymous | Public | — (static React) | — |
| UC-10 | Upload Card Image | Personal User | Scan | — (frontend only) | — |
| UC-11 | Capture via Camera | Personal User | Scan | — (frontend only) | — |
| UC-12 | Process Single Scan | Personal User | Scan | POST /api/scan | contacts, user_quotas, audit_trail |
| UC-13 | Batch Multi-Scan | Enterprise Admin | Scan | POST /api/scan-multi | contacts, user_quotas |
| UC-14 | Review Extracted Data | Personal User | Scan | — (frontend state) | — |
| UC-16 | Save Contact from Scan | Personal User | Scan | POST /api/contacts | contacts |
| UC-18 | Use Kiosk Mode | Enterprise Admin | Scan | POST /api/scan | contacts |
| UC-21 | View Contact List | Personal User | Contacts | GET /api/contacts | contacts |
| UC-22 | Search Contacts | Personal User | Contacts | GET /api/contacts?search= | contacts |
| UC-23 | Semantic AI Search | Personal User | Contacts | GET /api/contacts/semantic-search | contacts |
| UC-25 | Edit Contact | Personal User | Contacts | PUT /api/contacts/:id | contacts |
| UC-26 | Delete Contact | Personal User | Contacts | DELETE /api/contacts/:id | contacts |
| UC-28 | Export to Excel | Personal User | Contacts | — (frontend xlsx lib) | contacts |
| UC-29 | Export to CRM | Enterprise Admin | Contacts | POST /api/contacts/export-crm | contacts, crm_mappings |
| UC-30 | Define Relationship | Enterprise Admin | Contacts | POST /api/contacts/relationships | contact_relationships |
| UC-31 | View Org Chart | Enterprise Admin | Contacts | GET /api/org-chart/:company | contact_relationships |
| UC-32 | Enrich Contact | Enterprise Admin | Contacts | POST /api/contacts/:id/enrich | contacts |
| UC-33 | Generate AI Draft | Personal User | Drafts | POST /api/drafts/generate | ai_drafts |
| UC-34 | Detect Duplicates | Enterprise Admin | Quality | GET /api/workspace/data-quality/dedupe-queue | data_quality_dedupe_queue |
| UC-35 | Merge Duplicates | Enterprise Admin | Quality | POST /api/.../queue/:id/merge | contacts, data_quality_dedupe_queue |
| UC-40 | Create Calendar | Enterprise Admin | Calendar | POST /api/calendar/calendars | calendars |
| UC-41 | Create Event | Enterprise Admin | Calendar | POST /api/calendar/events | calendar_events, event_attendees |
| UC-42 | Reschedule Event | Enterprise Admin | Calendar | PATCH /api/calendar/events/:id/reschedule | calendar_events |
| UC-45 | AI Suggest Time | Enterprise Admin | Calendar | POST /api/calendar/ai/suggest-time | calendar_events |
| UC-47 | Set Reminder | Enterprise Admin | Calendar | — (part of event create) | event_reminders |
| UC-49 | Set Availability | Enterprise Admin | Calendar | PUT /api/calendar/availability | availability_slots |
| UC-50 | Create Booking Link | Enterprise Admin | Calendar | POST /api/calendar/booking-links | booking_links |
| UC-51 | Book Appointment | Anonymous | Calendar | POST /api/calendar/bookings | calendar_events |
| UC-52 | RSVP to Invitation | Anonymous | Calendar | GET /api/calendar/respond/:token | event_attendees |
| UC-60 | Create Campaign | Enterprise Admin | Email | POST /api/campaigns | email_campaigns |
| UC-61 | AI Auto-Writer | Enterprise Admin | Email | POST /api/campaigns/auto-write | email_campaigns |
| UC-63 | Create Contact List | Enterprise Admin | Email | POST /api/email-lists | email_lists |
| UC-65 | Preview Audience | Enterprise Admin | Email | GET /api/campaigns/audience-preview | email_list_contacts |
| UC-66 | Send Campaign | Enterprise Admin | Email | POST (trigger) | email_sends, campaign_recipients |
| UC-70 | View Analytics | Enterprise Admin | Email | GET /api/campaigns/:id | email_sends, email_clicks |
| UC-81 | Invite Member | Enterprise Admin | Workspace | POST /api/workspace/members/invite | users, workspace_invitations |
| UC-83 | Remove Member | Enterprise Admin | Workspace | DELETE /api/workspace/members/:id | users |
| UC-86 | Workspace Chat | Personal User | Workspace | Socket.IO | workspace_chats |
| UC-88 | Manage Billing | Enterprise Admin | Workspace | GET /api/workspace/billing/overview | billing_payment_methods, billing_invoices |
| UC-92 | Data Retention | Enterprise Admin | Workspace | PUT /api/workspace/data-policies | workspace_policies |
| UC-100 | Admin Dashboard | Super Admin | Admin | GET /api/enterprise/* | analytics_logs, users |
| UC-103 | Configure AI | Super Admin | Admin | PUT /api/engine/config | engine_config |
| UC-106 | Rollback Model | Super Admin | Admin | POST /api/engine/versions/:id/rollback | model_versions |
| UC-107 | API Sandbox | Super Admin | Admin | POST /api/sandbox/test | api_sandbox_calls |
| UC-109 | Create Incident | Super Admin | Admin | POST /api/admin/incidents | platform_incidents |
| UC-112 | Review Audit Logs | Super Admin | Admin | GET /api/enterprise/audit-logs | audit_trail |
| UC-114 | Integration Health | Super Admin | Admin | GET /api/admin/integrations/health | integration_sync_jobs |
| UC-120 | View Scan Stats | Personal User | Analytics | GET /api/contacts/stats | contacts |
| UC-123 | AI Coach | Personal User | Analytics | GET /api/coach/insights | contacts |
| UC-125 | Global Search | Personal User | Analytics | GET /api/search/global | contacts, events, ai_drafts |
| UC-140 | View Sessions | Personal User | Security | GET /api/sessions/me | sessions |
| UC-141 | Revoke Session | Personal User | Security | DELETE /api/sessions/:id | sessions |

---

### Actor Permissions Summary

| Use Case Count | Anonymous | Personal User | Enterprise Admin | Super Admin |
|:---------------|:----------|:--------------|:-----------------|:------------|
| Authentication | 4 | 2 | 2 | 2 |
| Scanning | 0 | 7 | 2 | 0 |
| Contacts | 0 | 8 | 10 | 0 |
| Calendar | 2 | 0 | 11 | 0 |
| Email Marketing | 0 | 0 | 14 | 0 |
| Workspace | 0 | 2 | 14 | 0 |
| Administration | 0 | 0 | 0 | 19 |
| Analytics | 1 | 6 | 4 | 0 |
| Security | 0 | 4 | 5 | 4 |
| **TOTAL** | **7** | **29** | **62** | **25** |

---

> **END OF USE CASE DOCUMENT**  
> Total Use Cases Documented: **55+ primary use cases** with sub-flows across **10 modules**.  
> All diagrams use Mermaid syntax and can be pasted into any Markdown renderer.
