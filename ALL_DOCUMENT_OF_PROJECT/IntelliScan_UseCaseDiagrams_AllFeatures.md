    # IntelliScan — Complete Use Case Diagrams (All Features)

> Every diagram below uses valid **Mermaid.js** `flowchart` syntax to represent Use Case relationships.  
> **Actors** are shown as 👤 labeled boxes, **Use Cases** as rounded ovals `([...])`, **include** as dashed arrows `-.->`, and **extend** as dotted arrows `-.->`.  
> Paste any block into [mermaid.live](https://mermaid.live) to see the rendered graphic.

---

## FEATURE 1: Authentication & User Onboarding

**Description**: The gateway module securing access to all platform capabilities. Supports JWT-based login, multi-tier registration (Personal / Enterprise / SuperAdmin), password recovery via email, and a guided first-time onboarding wizard.

```mermaid
flowchart LR
    subgraph Actors
        A1["👤 Anonymous Visitor"]
        A2["👤 Registered User"]
    end

    subgraph "Authentication System"
        UC1(["Sign Up (Register Account)"])
        UC2(["Sign In (JWT Login)"])
        UC3(["Forgot Password"])
        UC4(["Reset Password via Email"])
        UC5(["Complete Onboarding Wizard"])
        UC6(["Select Tier: Personal / Enterprise"])
        UC7(["Validate JWT Token"])
        UC8(["Redirect to Dashboard"])
    end

    A1 --> UC1
    A1 --> UC2
    A1 --> UC3

    UC1 -.->|includes| UC6
    UC1 -.->|includes| UC5
    UC2 -.->|includes| UC7
    UC7 -.->|includes| UC8
    UC3 -.->|includes| UC4

    A2 --> UC2
```

**Detailed Use Cases**:

| Use Case ID | Name | Actor | Precondition | Flow | Postcondition |
|---|---|---|---|---|---|
| UC-A1 | Sign Up | Anonymous Visitor | User is not registered | User fills name, email, password, selects tier → Server hashes password, stores in `users` table → JWT returned | Account created, token stored in localStorage |
| UC-A2 | Sign In | Any User | Account Exists | Email + Password validated → JWT Generated → UI loads Dashboard | Session active for 24 hours |
| UC-A3 | Forgot Password | Anonymous Visitor | Email exists in DB | User enters email → Server sends reset link via SMTP → User clicks link and sets new password | Password updated |
| UC-A4 | Onboarding Wizard | New User | First login detected | Step-by-step guided tour: upload photo, set company, configure notification preferences | Profile complete |

---

## FEATURE 2: Intelligent OCR Scanner (Single Card)

**Description**: The core value proposition. Users upload or photograph a single business card. The image is transmitted as Base64 to the backend, where it enters the `unifiedExtractionPipeline`. The AI model (Gemini or OpenAI fallback) parses the image and returns a structured JSON contact profile.

```mermaid
flowchart LR
    subgraph Actors
        U1["👤 Personal User"]
        U2["👤 Enterprise User"]
    end

    subgraph "Single Card OCR System"
        UC1(["Upload / Capture Card Image"])
        UC2(["Validate File Type & Size"])
        UC3(["Check User Scan Quota"])
        UC4(["Check AI Engine Status"])
        UC5(["Send Image to Gemini LLM"])
        UC6(["Fallback to OpenAI GPT-4o-mini"])
        UC7(["Fallback to Tesseract.js"])
        UC8(["Extract Structured JSON"])
        UC9(["Normalize Contact Schema"])
        UC10(["Calculate AI Deal Score"])
        UC11(["Detect Language & Industry"])
        UC12(["Save Contact to Database"])
        UC13(["Display Extraction Preview"])
        UC14(["Reject Non-Card Image"])
    end

    U1 --> UC1
    U2 --> UC1

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC5 -.->|extends| UC6
    UC6 -.->|extends| UC7
    UC5 -.->|includes| UC8
    UC6 -.->|includes| UC8
    UC8 -.->|includes| UC9
    UC9 -.->|includes| UC10
    UC9 -.->|includes| UC11
    UC10 -.->|includes| UC12
    UC12 -.->|includes| UC13
    UC2 -.->|extends| UC14
```

**Detailed Use Cases**:

| Use Case ID | Name | Actor | Precondition | Flow | Postcondition |
|---|---|---|---|---|---|
| UC-S1 | Upload Card Image | Any Authenticated User | User is on /dashboard/scan | User drags image or clicks upload → File validated (JPG/PNG/WebP, <5MB) | Image ready for processing |
| UC-S2 | Check Scan Quota | System | User uploaded image | System queries `user_quotas` table → Compares against tier limits (Personal: 50, Enterprise: 99999) | Quota approved or 403 error |
| UC-S3 | AI Extraction | System | Quota approved | Image sent to `unifiedExtractionPipeline` → Gemini processes → If fail, OpenAI processes → If fail, Tesseract OCR | Structured JSON returned |
| UC-S4 | Normalize Schema | System | Raw JSON received | Fields mapped to standard schema (name, email, phone, company, job_title, deal_score, linkedin_url) | Clean contact record |
| UC-S5 | Calculate Deal Score | System | Contact normalized | AI assigns 0-100 score based on title seniority, company domain, email domain type | Deal score stored |
| UC-S6 | Reject Non-Card | System | AI detects non-card image | Returns `{rejected: true}` with human-readable reason | 422 error shown to user |

---

## FEATURE 3: Multi-Card / Group Photo Scanner

**Description**: Enterprise-exclusive feature allowing scanning of multiple business cards laid out in a single group photograph. The AI identifies and separates each card, returning an array of structured contacts.

```mermaid
flowchart LR
    subgraph Actors
        E1["👤 Enterprise User"]
    end

    subgraph "Multi-Card Scanning System"
        UC1(["Upload Group Photo"])
        UC2(["Validate Enterprise Tier"])
        UC3(["Check Group Scan Quota"])
        UC4(["Send to AI with Bulk Prompt"])
        UC5(["AI Identifies Individual Cards"])
        UC6(["Extract Array of Contacts"])
        UC7(["Normalize Each Contact"])
        UC8(["Bulk Insert to Database"])
        UC9(["Increment Quota Counter"])
        UC10(["Display All Extracted Cards"])
        UC11(["Show Upgrade Prompt"])
    end

    E1 --> UC1

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC3 -.->|extends| UC11
    UC4 -.->|includes| UC5
    UC5 -.->|includes| UC6
    UC6 -.->|includes| UC7
    UC7 -.->|includes| UC8
    UC8 -.->|includes| UC9
    UC9 -.->|includes| UC10
```

**Detailed Use Cases**:

| Use Case ID | Name | Precondition | Flow | Postcondition |
|---|---|---|---|---|
| UC-M1 | Upload Group Photo | User is Enterprise tier | User uploads photo with 2-10 cards visible | Image queued |
| UC-M2 | Check Group Quota | Image uploaded | System queries `group_scans_used` from `user_quotas` | Approved or upgrade prompt |
| UC-M3 | AI Bulk Parse | Quota approved | LLM receives special prompt instructing array output → Returns `{cards: [...]}` | Array of contacts |
| UC-M4 | Bulk Insert | Array received | Loop through each card → normalize → INSERT → increment quota | All contacts saved |

---

## FEATURE 4: Contact Management (CRUD)

**Description**: Full lifecycle management of scanned contacts — viewing, searching, editing, soft-deleting, exporting to CSV/vCard, and sharing within workspaces.

```mermaid
flowchart LR
    subgraph Actors
        U1["👤 Personal User"]
        U2["👤 Enterprise User"]
    end

    subgraph "Contact Management System"
        UC1(["View All Contacts"])
        UC2(["Search Contacts by Name/Company"])
        UC3(["Filter by Industry/Seniority"])
        UC4(["Edit Contact Details"])
        UC5(["Delete Contact (Soft Delete)"])
        UC6(["Export Contacts to CSV"])
        UC7(["Export Contact to vCard"])
        UC8(["View Contact Detail Card"])
        UC9(["Add Notes to Contact"])
        UC10(["Share Contact to Workspace"])
        UC11(["Mask Personal Email/Phone"])
    end

    U1 --> UC1
    U1 --> UC4
    U1 --> UC5
    U1 --> UC6

    U2 --> UC1
    U2 --> UC4
    U2 --> UC10

    UC1 -.->|includes| UC2
    UC1 -.->|includes| UC3
    UC1 -.->|includes| UC11
    UC8 -.->|extends| UC9
    UC8 -.->|extends| UC7
```

**Detailed Use Cases**:

| Use Case ID | Name | Actor | Flow | Postcondition |
|---|---|---|---|---|
| UC-C1 | View All Contacts | Any User | Fetch paginated contacts from `contacts` table scoped to user_id | Contact list rendered |
| UC-C2 | Search Contacts | Any User | User types in search box → API filters by name, company, email LIKE query | Filtered results shown |
| UC-C3 | Edit Contact | Any User | User clicks edit → Modal opens → Changes saved via PUT /api/contacts/:id | Record updated |
| UC-C4 | Soft Delete | Any User | User clicks delete → Confirmation → `is_deleted=1` flag set | Contact hidden from list |
| UC-C5 | Export CSV | Any User | User clicks export → Server generates CSV buffer → Browser downloads file | .csv file downloaded |
| UC-C6 | Mask PII | System | Personal email domains (gmail, yahoo) auto-masked as `pr***@gmail.com` | Privacy enforced |

---

## FEATURE 5: AI Dual-Engine Fallback System

**Description**: The architectural backbone ensuring 99.9% AI uptime. Every AI-powered feature routes through `generateWithFallback()`, which attempts Gemini first and silently fails over to OpenAI ChatGPT if the primary engine crashes.

```mermaid
flowchart TB
    subgraph Actors
        SYS["⚙️ Backend System"]
        SA["👤 SuperAdmin"]
    end

    subgraph "AI Fallback Architecture"
        UC1(["Receive AI Generation Request"])
        UC2(["Query ai_models DB for Engine Status"])
        UC3(["Attempt Primary: Google Gemini"])
        UC4(["Retry on 429 Rate Limit"])
        UC5(["Attempt Fallback: OpenAI ChatGPT"])
        UC6(["Fetch API Key from engine_config"])
        UC7(["Return Successful AI Response"])
        UC8(["Return Static Fallback Content"])
        UC9(["Log Error to Console"])
        UC10(["Pause/Deploy Engine via Admin Panel"])
    end

    SYS --> UC1
    SA --> UC10

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC3 -.->|extends| UC4
    UC3 -.->|extends| UC5
    UC5 -.->|includes| UC6
    UC5 -.->|includes| UC7
    UC3 -.->|includes| UC7
    UC5 -.->|extends| UC8
    UC5 -.->|extends| UC9
    UC10 -.->|includes| UC2
```

**Detailed Use Cases**:

| Use Case ID | Name | Flow | Postcondition |
|---|---|---|---|
| UC-F1 | Route AI Request | Any endpoint (Ghostwriter, Coach, Campaign) calls `generateWithFallback(prompt)` | Prompt queued |
| UC-F2 | Check Engine Status | Query `ai_models` table → If Gemini status='paused', skip directly to OpenAI | Engine selected |
| UC-F3 | Try Gemini | Call `GoogleGenerativeAI.generateContent()` → Parse response text | JSON or Error |
| UC-F4 | Retry on 429 | If error is rate-limit, wait `retryAfterMs` then retry up to 2 times | Success or escalate |
| UC-F5 | Try OpenAI | Call `openai.chat.completions.create()` with same prompt | JSON or final error |
| UC-F6 | Static Fallback | If both engines fail, return pre-built hardcoded response | UI never crashes |

---

## FEATURE 6: Smart Calendar & Event Scheduling

**Description**: A fully integrated scheduling engine supporting event creation with AI-generated descriptions, automated SMTP email invitations to attendees, custom deletion confirmation modals, and public booking link generation.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Enterprise User"]
        G["👤 External Guest"]
    end

    subgraph "Calendar & Scheduling System"
        UC1(["View Monthly/Weekly Calendar"])
        UC2(["Create New Event"])
        UC3(["AI Generate Event Description"])
        UC4(["AI Suggest Optimal Time Slot"])
        UC5(["Add Attendees by Email"])
        UC6(["Send SMTP Email Invitation"])
        UC7(["Suppress SMTP Failure Gracefully"])
        UC8(["Delete Event with Custom Modal"])
        UC9(["Confirm Deletion via Branded UI"])
        UC10(["Set Event Reminder"])
        UC11(["Create Public Booking Link"])
        UC12(["Configure Availability Slots"])
        UC13(["Guest Books via Public URL"])
        UC14(["Sync Event to Calendar DB"])
    end

    U --> UC1
    U --> UC2
    U --> UC8
    U --> UC11
    U --> UC12
    G --> UC13

    UC2 -.->|includes| UC5
    UC2 -.->|extends| UC3
    UC2 -.->|extends| UC4
    UC5 -.->|includes| UC6
    UC6 -.->|extends| UC7
    UC2 -.->|includes| UC14
    UC8 -.->|includes| UC9
    UC2 -.->|extends| UC10
    UC11 -.->|includes| UC12
    UC13 -.->|includes| UC14
```

**Detailed Use Cases**:

| Use Case ID | Name | Actor | Flow | Postcondition |
|---|---|---|---|---|
| UC-CAL1 | Create Event | Enterprise User | Fill title, date/time, guests → Click Save → INSERT into `calendar_events` | Event appears on calendar |
| UC-CAL2 | AI Ghostwriter | Enterprise User | Click "AI Ghostwriter" → `generateWithFallback()` generates description | Text auto-filled |
| UC-CAL3 | Send Invites | System | For each attendee email → SMTP dispatch → If fails, `.catch(console.error)` suppresses crash | Emails sent or silently skipped |
| UC-CAL4 | Delete Event | Enterprise User | Click delete → Custom `DeleteConfirmationModal` renders → Confirm → DELETE from DB | Event removed, UI updated |
| UC-CAL5 | Public Booking | External Guest | Guest visits `/book/:slug` → Selects available slot → Event auto-created | Meeting booked |

---

## FEATURE 7: AI Networking Coach & Insights

**Description**: An intelligent analytics engine that aggregates the user's entire contact database, identifies stale connections (no interaction >14 days), detects missing context fields, and uses AI to generate actionable networking recommendations.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "AI Coach & Insights System"
        UC1(["Load Coach Dashboard"])
        UC2(["Fetch All User Contacts"])
        UC3(["Identify Stale Connections > 14 Days"])
        UC4(["Detect Missing Context Fields"])
        UC5(["Aggregate Industry Distribution"])
        UC6(["Aggregate Seniority Distribution"])
        UC7(["Generate AI Prompt with Stats"])
        UC8(["AI Returns Health Score 0-100"])
        UC9(["AI Returns Momentum Status"])
        UC10(["AI Returns 3 Action Items"])
        UC11(["Display Gamified Dashboard"])
        UC12(["Click CTA: Draft Follow-ups"])
        UC13(["Click CTA: Auto-Enrich Data"])
    end

    U --> UC1

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC2 -.->|includes| UC4
    UC2 -.->|includes| UC5
    UC2 -.->|includes| UC6
    UC3 -.->|includes| UC7
    UC7 -.->|includes| UC8
    UC7 -.->|includes| UC9
    UC7 -.->|includes| UC10
    UC10 -.->|includes| UC11
    UC11 -.->|extends| UC12
    UC11 -.->|extends| UC13
```

**Detailed Use Cases**:

| Use Case ID | Name | Flow | Postcondition |
|---|---|---|---|
| UC-CO1 | Fetch Contacts | SELECT all contacts for user → Count total, stale, missing fields | Statistics computed |
| UC-CO2 | Identify Stale | Compare `scan_date` to `now - 14 days` → Flag as stale | Stale count ready |
| UC-CO3 | AI Analysis | Feed stats into `generateWithFallback(prompt)` → AI returns JSON with health_score, momentum_status, and actions array | Insights generated |
| UC-CO4 | Render Dashboard | Parse AI JSON → Display health score gauge, momentum badge, 3 actionable cards with CTAs | Interactive dashboard |

---

## FEATURE 8: Email Marketing & Campaign System

**Description**: An enterprise-grade email marketing suite supporting campaign creation, HTML template design, contact list segmentation, AI-powered cold email auto-writing, open/click tracking, and automation workflows.

```mermaid
flowchart LR
    subgraph Actors
        E["👤 Enterprise Admin"]
    end

    subgraph "Email Marketing System"
        UC1(["View Campaign Dashboard"])
        UC2(["Create New Campaign"])
        UC3(["Select Email Template"])
        UC4(["Design Custom HTML Template"])
        UC5(["AI Auto-Write Campaign Email"])
        UC6(["Select Target Contact Lists"])
        UC7(["Preview Email with Variables"])
        UC8(["Schedule Campaign Send Time"])
        UC9(["Send Campaign Immediately"])
        UC10(["Track Email Opens"])
        UC11(["Track Link Clicks"])
        UC12(["View Campaign Analytics"])
        UC13(["Manage Contact Lists"])
        UC14(["Import Contacts into List"])
        UC15(["Handle Unsubscribe Requests"])
        UC16(["Setup Email Automation"])
    end

    E --> UC1
    E --> UC2
    E --> UC13
    E --> UC16

    UC2 -.->|includes| UC3
    UC2 -.->|extends| UC4
    UC2 -.->|extends| UC5
    UC2 -.->|includes| UC6
    UC2 -.->|includes| UC7
    UC2 -.->|extends| UC8
    UC2 -.->|extends| UC9
    UC9 -.->|includes| UC10
    UC9 -.->|includes| UC11
    UC10 -.->|includes| UC12
    UC13 -.->|includes| UC14
    UC9 -.->|extends| UC15
```

**Detailed Use Cases**:

| Use Case ID | Name | Flow | Postcondition |
|---|---|---|---|
| UC-EM1 | Create Campaign | Admin fills name, subject, body → Selects template → Assigns target lists | Campaign saved as draft |
| UC-EM2 | AI Auto-Write | Click auto-write → System sends industry + seniority to `generateWithFallback()` → AI writes subject + body | Email content generated |
| UC-EM3 | Send Campaign | System loops through list contacts → Sends via SMTP → Inserts tracking pixel → Logs to `email_sends` | Emails dispatched |
| UC-EM4 | Track Opens | Recipient opens email → Tracking pixel fires GET request → `open_count` incremented | Analytics updated |
| UC-EM5 | Track Clicks | Recipient clicks link → Redirect through tracking endpoint → `click_count` incremented | Click data logged |

---

## FEATURE 9: CRM Integration (Salesforce / HubSpot)

**Description**: Allows enterprise admins to map IntelliScan contact fields to external CRM platforms, establish OAuth connections, and synchronize scanned contacts directly into their sales pipeline.

```mermaid
flowchart LR
    subgraph Actors
        E["👤 Enterprise Admin"]
    end

    subgraph "CRM Integration System"
        UC1(["Select CRM Provider"])
        UC2(["Configure Field Mappings"])
        UC3(["Map IntelliScan Fields to CRM Fields"])
        UC4(["Add Custom Field Mappings"])
        UC5(["Test Connection"])
        UC6(["Sync Contacts to CRM"])
        UC7(["View Sync Activity Log"])
        UC8(["Handle Sync Errors"])
        UC9(["Disconnect CRM Provider"])
    end

    E --> UC1
    E --> UC6
    E --> UC9

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC2 -.->|extends| UC4
    UC2 -.->|includes| UC5
    UC6 -.->|includes| UC7
    UC6 -.->|extends| UC8
```

---

## FEATURE 10: Gamified Leaderboard

**Description**: A competitive ranking system comparing scan activity, contact quality, and engagement metrics across all users in the platform to drive adoption and networking productivity.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "Leaderboard & Gamification"
        UC1(["View Global Leaderboard"])
        UC2(["Calculate User Rank"])
        UC3(["Aggregate Total Scans & Points"])
        UC4(["Determine Weekly Top Performer"])
        UC5(["Display Trophy & Badges"])
        UC6(["Compare Against Team Members"])
        UC7(["Filter by Time Period"])
    end

    U --> UC1

    UC1 -.->|includes| UC2
    UC1 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC1 -.->|extends| UC6
    UC1 -.->|extends| UC7
```

---

## FEATURE 11: Digital Card Creator & My Card

**Description**: Users can design and customize their own digital business card with personal branding, then share it via a unique public URL or QR code.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any User"]
        V["👤 External Viewer"]
    end

    subgraph "Digital Card System"
        UC1(["Open Card Creator"])
        UC2(["Fill Personal Details"])
        UC3(["Choose Card Template/Theme"])
        UC4(["Upload Profile Photo"])
        UC5(["Add Social Media Links"])
        UC6(["Preview Digital Card"])
        UC7(["Save Digital Card"])
        UC8(["Generate Public Profile URL"])
        UC9(["Share QR Code"])
        UC10(["View Public Profile Page"])
    end

    U --> UC1
    U --> UC6
    V --> UC10

    UC1 -.->|includes| UC2
    UC1 -.->|includes| UC3
    UC1 -.->|extends| UC4
    UC1 -.->|extends| UC5
    UC6 -.->|includes| UC7
    UC7 -.->|includes| UC8
    UC8 -.->|extends| UC9
    UC8 -.->|includes| UC10
```

---

## FEATURE 12: SuperAdmin Platform Management

**Description**: The top-level administrative console providing full control over AI engine deployment, system health monitoring, user management, feedback triage, and incident response.

```mermaid
flowchart LR
    subgraph Actors
        SA["👤 Super Admin"]
    end

    subgraph "SuperAdmin Control Panel"
        UC1(["View Admin Dashboard"])
        UC2(["Monitor AI Engine Performance"])
        UC3(["Deploy / Pause AI Models"])
        UC4(["Update AI Model Status in DB"])
        UC5(["Add New Custom AI Model"])
        UC6(["View Global Platform Telemetry"])
        UC7(["Manage All User Accounts"])
        UC8(["Review User Feedback"])
        UC9(["Respond to Feedback Tickets"])
        UC10(["View Job Queues & Background Tasks"])
        UC11(["Manage System Incidents"])
        UC12(["Configure API Keys in engine_config"])
    end

    SA --> UC1
    SA --> UC2
    SA --> UC3
    SA --> UC8
    SA --> UC11

    UC1 -.->|includes| UC6
    UC1 -.->|includes| UC7
    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC2 -.->|extends| UC5
    UC8 -.->|includes| UC9
    UC1 -.->|includes| UC10
    UC3 -.->|includes| UC12
```

---

## FEATURE 13: Workspace & Team Collaboration

**Description**: Enterprise workspace management enabling team-based contact sharing, member invitation, role assignment, shared rolodex, and collaborative deal pipeline tracking.

```mermaid
flowchart LR
    subgraph Actors
        A["👤 Enterprise Admin"]
        M["👤 Team Member"]
    end

    subgraph "Workspace Management System"
        UC1(["View Workspace Dashboard"])
        UC2(["Invite Team Members"])
        UC3(["Assign Member Roles"])
        UC4(["View Shared Workspace Contacts"])
        UC5(["Configure Routing Rules"])
        UC6(["Set Data Retention Policies"])
        UC7(["Access Shared Rolodex"])
        UC8(["View Org Chart"])
        UC9(["Monitor Data Quality Center"])
        UC10(["Manage Webhooks"])
        UC11(["Manage Deal Pipeline"])
        UC12(["Track Pipeline Stages"])
    end

    A --> UC1
    A --> UC2
    A --> UC5
    A --> UC10
    M --> UC4
    M --> UC7

    UC1 -.->|includes| UC4
    UC2 -.->|includes| UC3
    UC1 -.->|includes| UC8
    UC1 -.->|includes| UC9
    UC11 -.->|includes| UC12
    A --> UC11
```

---

## FEATURE 14: Analytics & Reporting Dashboard

**Description**: Visual analytics providing scan volume trends, engine accuracy metrics, contact quality scores, and team performance metrics.

```mermaid
flowchart LR
    subgraph Actors
        A["👤 Enterprise Admin"]
    end

    subgraph "Analytics & Reporting"
        UC1(["View Analytics Dashboard"])
        UC2(["View Scan Volume Over Time"])
        UC3(["View Engine Accuracy Metrics"])
        UC4(["View Average Confidence Score"])
        UC5(["Filter Analytics by Date Range"])
        UC6(["View Top Scanned Industries"])
        UC7(["Compare Team Member Performance"])
        UC8(["Export Analytics Report"])
        UC9(["View Public Analytics Page"])
    end

    A --> UC1

    UC1 -.->|includes| UC2
    UC1 -.->|includes| UC3
    UC1 -.->|includes| UC4
    UC1 -.->|extends| UC5
    UC1 -.->|includes| UC6
    UC1 -.->|extends| UC7
    UC1 -.->|extends| UC8
```

---

## FEATURE 15: Billing & Subscription Management

**Description**: Tier-based subscription management enabling plan comparison, upgrade flows, credit point tracking, and payment history.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "Billing & Subscription System"
        UC1(["View Current Plan Status"])
        UC2(["Compare Subscription Plans"])
        UC3(["Upgrade Tier"])
        UC4(["View Credit Points Balance"])
        UC5(["View Payment History"])
        UC6(["Download Invoice"])
        UC7(["Cancel Subscription"])
    end

    U --> UC1
    U --> UC2

    UC1 -.->|includes| UC4
    UC2 -.->|extends| UC3
    UC1 -.->|includes| UC5
    UC5 -.->|extends| UC6
    UC1 -.->|extends| UC7
```

---

## FEATURE 16: AI Drafts & Email Ghostwriter

**Description**: AI-powered follow-up email drafting that analyzes a contact's profile and generates personalized, professional outreach emails ready to send.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "AI Drafts System"
        UC1(["View AI Drafts Page"])
        UC2(["Select Contact for Draft"])
        UC3(["AI Generates Email Draft"])
        UC4(["Edit Generated Draft"])
        UC5(["Save Draft to Database"])
        UC6(["Send Draft via SMTP"])
        UC7(["View Draft History"])
        UC8(["Delete Saved Draft"])
    end

    U --> UC1
    U --> UC2

    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC5 -.->|extends| UC6
    UC1 -.->|includes| UC7
    UC7 -.->|extends| UC8
```

---

## FEATURE 17: Kiosk Mode (Conference Scanner)

**Description**: A dedicated full-screen scanning mode designed for trade show booths and conference reception desks, allowing rapid continuous card scanning without navigating the full dashboard.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Booth Operator"]
    end

    subgraph "Kiosk Mode System"
        UC1(["Launch Kiosk Mode"])
        UC2(["Enter Full-Screen Interface"])
        UC3(["Rapid-Scan Card"])
        UC4(["Auto-Save Contact"])
        UC5(["Show Quick Success Toast"])
        UC6(["Reset for Next Scan"])
        UC7(["Exit Kiosk Mode"])
    end

    U --> UC1

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC5 -.->|includes| UC6
    UC6 -.->|includes| UC3
    UC1 -.->|extends| UC7
```

---

## FEATURE 18: Meeting Presence & Signals

**Description**: Provides real-time awareness of meeting readiness, attendee presence tracking, and intent signals from contacts who interact with shared content.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Enterprise User"]
    end

    subgraph "Meeting & Signals System"
        UC1(["View Meeting Tools"])
        UC2(["Check Attendee Presence"])
        UC3(["View Active Signals"])
        UC4(["Detect Contact Re-engagement"])
        UC5(["Flag High-Priority Leads"])
        UC6(["Set Meeting Reminders"])
    end

    U --> UC1
    U --> UC3

    UC1 -.->|includes| UC2
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC1 -.->|extends| UC6
```

---

## FEATURE 19: Settings & Profile Configuration

**Description**: Centralized user settings for profile management, API key configuration, notification preferences, theme toggling, and session management.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "Settings System"
        UC1(["View Settings Page"])
        UC2(["Update Profile Information"])
        UC3(["Change Password"])
        UC4(["Configure SMTP Settings"])
        UC5(["Set Gemini API Key"])
        UC6(["Set OpenAI API Key"])
        UC7(["Toggle Dark/Light Theme"])
        UC8(["Configure Notification Preferences"])
        UC9(["View Active Sessions"])
        UC10(["Logout from All Devices"])
    end

    U --> UC1

    UC1 -.->|includes| UC2
    UC1 -.->|includes| UC3
    UC1 -.->|includes| UC4
    UC1 -.->|includes| UC5
    UC1 -.->|includes| UC6
    UC1 -.->|extends| UC7
    UC1 -.->|extends| UC8
    UC1 -.->|includes| UC9
    UC9 -.->|extends| UC10
```

---

## FEATURE 20: Support Chatbot

**Description**: An AI-powered floating chatbot widget accessible from every page, providing instant platform assistance using Gemini/OpenAI with automatic fallback.

```mermaid
flowchart LR
    subgraph Actors
        U["👤 Any Authenticated User"]
    end

    subgraph "Support Chatbot System"
        UC1(["Open Floating Chat Widget"])
        UC2(["Type Support Question"])
        UC3(["Send Message to AI Backend"])
        UC4(["AI Processes via generateWithFallback"])
        UC5(["Display AI Response in Chat"])
        UC6(["View Chat History"])
        UC7(["Minimize Chat Widget"])
        UC8(["Escalate to Human Support"])
    end

    U --> UC1

    UC1 -.->|includes| UC2
    UC2 -.->|includes| UC3
    UC3 -.->|includes| UC4
    UC4 -.->|includes| UC5
    UC1 -.->|includes| UC6
    UC1 -.->|extends| UC7
    UC5 -.->|extends| UC8
```

---

## Summary Table: All Features × Use Case Count

| # | Feature | Use Cases | Actors Involved |
|---|---|---|---|
| 1 | Authentication & Onboarding | 8 | Anonymous, Registered User |
| 2 | Single Card OCR Scanner | 14 | Personal, Enterprise |
| 3 | Multi-Card Group Scanner | 10 | Enterprise Only |
| 4 | Contact Management | 11 | Personal, Enterprise |
| 5 | AI Dual-Engine Fallback | 10 | System, SuperAdmin |
| 6 | Calendar & Scheduling | 14 | Enterprise, External Guest |
| 7 | AI Coach & Insights | 13 | Any User |
| 8 | Email Marketing | 16 | Enterprise Admin |
| 9 | CRM Integration | 9 | Enterprise Admin |
| 10 | Gamified Leaderboard | 7 | Any User |
| 11 | Digital Card Creator | 10 | Any User, External Viewer |
| 12 | SuperAdmin Management | 12 | SuperAdmin Only |
| 13 | Workspace Collaboration | 12 | Enterprise Admin, Members |
| 14 | Analytics & Reporting | 9 | Enterprise Admin |
| 15 | Billing & Subscriptions | 7 | Any User |
| 16 | AI Drafts & Ghostwriter | 8 | Any User |
| 17 | Kiosk Mode | 7 | Booth Operator |
| 18 | Meeting & Signals | 6 | Enterprise User |
| 19 | Settings & Configuration | 10 | Any User |
| 20 | Support Chatbot | 8 | Any User |
| **Total** | **20 Features** | **201 Use Cases** | **7 Actor Types** |
