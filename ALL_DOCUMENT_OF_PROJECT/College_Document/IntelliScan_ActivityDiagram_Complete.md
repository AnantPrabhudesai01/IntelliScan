# IntelliScan — Complete Activity Diagrams

> **Purpose**: Detailed UML Activity Diagrams for every feature module of the IntelliScan platform.  
> **Format**: Mermaid flowchart syntax (start/end nodes, decisions, actions, swimlanes).  
> **Coverage**: 15 activity diagrams covering all major workflows.

---

## TABLE OF CONTENTS

1. [User Registration Activity](#1-user-registration-activity)
2. [User Login Activity](#2-user-login-activity)
3. [Single Card Scan Activity](#3-single-card-scan-activity)
4. [Batch Multi-Scan Activity](#4-batch-multi-scan-activity)
5. [Contact Management Activity](#5-contact-management-activity)
6. [Contact Search & Filter Activity](#6-contact-search--filter-activity)
7. [AI Email Draft Generation Activity](#7-ai-email-draft-generation-activity)
8. [Workspace Invitation Activity](#8-workspace-invitation-activity)
9. [Calendar Event Creation Activity](#9-calendar-event-creation-activity)
10. [Booking Link & Appointment Activity](#10-booking-link--appointment-activity)
11. [Email Campaign Lifecycle Activity](#11-email-campaign-lifecycle-activity)
12. [Contact Deduplication Activity](#12-contact-deduplication-activity)
13. [CRM Export Activity](#13-crm-export-activity)
14. [Platform Incident Management Activity](#14-platform-incident-management-activity)
15. [AI Engine Configuration Activity](#15-ai-engine-configuration-activity)

---

## 1. USER REGISTRATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User visits /sign-up page"]
    A --> B["User enters Name, Email, Password"]
    B --> C{"Is email format valid?"}
    C -- No --> D["Show validation error"]
    D --> B
    C -- Yes --> E["POST /api/auth/register"]
    E --> F{"Does email already exist in DB?"}
    F -- Yes --> G["Return 400: Email already registered"]
    G --> B
    F -- No --> H["Hash password with bcrypt (10 salt rounds)"]
    H --> I["INSERT INTO users (name, email, password, role='user', tier='personal')"]
    I --> J["Initialize user_quotas (limit=10 for personal)"]
    J --> K["Sign JWT token with user id, email, role"]
    K --> L["Create session record in sessions table"]
    L --> M["Return JWT token + user object to frontend"]
    M --> N["Frontend stores token in localStorage"]
    N --> O{"Is this first login?"}
    O -- Yes --> P["Redirect to /onboarding"]
    P --> Q["User completes onboarding wizard"]
    Q --> R["POST /api/onboarding (save preferences)"]
    R --> S["Redirect to /dashboard/scan"]
    O -- No --> S
    S --> ENDD(("◉"))
```

---

## 2. USER LOGIN ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User visits /sign-in page"]
    A --> B["User enters Email and Password"]
    B --> C["POST /api/auth/login"]
    C --> D{"Does user exist with this email?"}
    D -- No --> E["Return 401: Invalid credentials"]
    E --> B
    D -- Yes --> F["Fetch user record from database"]
    F --> G{"bcrypt.compare(input, stored hash)"}
    G -- Mismatch --> H["Return 401: Invalid credentials"]
    H --> I["Log audit: LOGIN_FAILED"]
    I --> B
    G -- Match --> J["Sign JWT token (id, email, role)"]
    J --> K["Create/update session in sessions table"]
    K --> L["Log audit: LOGIN_SUCCESS"]
    L --> M["Return token + user to frontend"]
    M --> N["Frontend stores token + user in localStorage"]
    N --> O["RoleContext reads role and tier"]
    O --> P{"What is user role?"}
    P -- "user" --> Q["Redirect to /dashboard/scan"]
    P -- "business_admin" --> R["Redirect to /workspace/dashboard"]
    P -- "super_admin" --> S["Redirect to /admin/dashboard"]
    Q --> ENDD(("◉"))
    R --> ENDD
    S --> ENDD
```

---

## 3. SINGLE CARD SCAN ACTIVITY

This is the **core feature** of the platform — scanning a business card with AI.

```mermaid
flowchart TD
    START(("●")) --> A["User navigates to /dashboard/scan"]
    A --> B{"Choose input method"}
    B -- "Upload" --> C["Select image file from device"]
    B -- "Camera" --> D["Capture photo via device camera"]
    C --> E["Convert image to Base64 string"]
    D --> E
    E --> F["Display image preview to user"]
    F --> G["User clicks 'Process Card' button"]
    G --> H["POST /api/scan with Base64 image"]
    H --> I["Server: Check user authentication (JWT)"]
    I --> J{"Is JWT valid?"}
    J -- No --> K["Return 401: Unauthorized"]
    K --> ENDD(("◉"))
    J -- Yes --> L["Check user scan quota"]
    L --> M{"used_count < limit_amount?"}
    M -- No --> N["Return 429: Quota exceeded"]
    N --> ENDD
    M -- Yes --> O{"Select AI Engine"}
    O -- "Primary" --> P["Send image to Google Gemini Vision API"]
    O -- "Fallback 1" --> Q["Send image to OpenAI Vision API"]
    O -- "Fallback 2" --> R["Process with local Tesseract OCR"]
    P --> S{"AI extraction successful?"}
    Q --> S
    R --> S
    S -- No --> T["Return 500: Extraction failed"]
    T --> ENDD
    S -- Yes --> U["Parse AI response into JSON"]
    U --> V["Extract: name, email, phone, company, job_title, city"]
    V --> W["Calculate confidence score (0-100%)"]
    W --> X{"Duplicate check: email exists in contacts?"}
    X -- Yes --> Y["Return 409: Duplicate contact detected"]
    Y --> Z["Frontend shows duplicate warning with existing contact"]
    Z --> ENDD
    X -- No --> AA["INSERT INTO contacts table"]
    AA --> AB["UPDATE user_quotas: used_count + 1"]
    AB --> AC["Log audit_trail: CARD_SCAN"]
    AC --> AD["Emit Socket.IO event: contact:new"]
    AD --> AE["Return extracted contact JSON to frontend"]
    AE --> AF["Frontend: ContactContext.addContact()"]
    AF --> AG["Display extracted data with edit option"]
    AG --> AH{"User wants to edit fields?"}
    AH -- Yes --> AI["User modifies fields manually"]
    AI --> AJ["Save updated contact"]
    AH -- No --> AK["Contact saved successfully"]
    AJ --> AK
    AK --> AL["Contact appears in /dashboard/contacts"]
    AL --> ENDD
```

---

## 4. BATCH MULTI-SCAN ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User selects multiple card images"]
    A --> B["Images added to BatchQueueContext"]
    B --> C["Display batch queue with thumbnails"]
    C --> D["User clicks 'Process All'"]
    D --> E["POST /api/scan-multi with image array"]
    E --> F["Server iterates through each image"]
    F --> G["For each image in batch:"]
    G --> H["Check remaining quota"]
    H --> I{"Quota available?"}
    I -- No --> J["Skip remaining images"]
    J --> M
    I -- Yes --> K["Process with Gemini Vision AI"]
    K --> L{"Extraction successful?"}
    L -- No --> L2["Mark as failed, add to error list"]
    L2 --> G
    L -- Yes --> L3["Check duplicate by email"]
    L3 --> L4{"Is duplicate?"}
    L4 -- Yes --> L5["Mark as duplicate, skip save"]
    L5 --> G
    L4 -- No --> L6["INSERT contact into database"]
    L6 --> L7["Update quota counter"]
    L7 --> L8["Emit Socket.IO: scan:progress"]
    L8 --> G
    G --> M["Compile batch results summary"]
    M --> N["Return: successful, failed, duplicates counts"]
    N --> O["Frontend displays batch results"]
    O --> P["All new contacts visible in ContactsPage"]
    P --> ENDD(("◉"))
```

---

## 5. CONTACT MANAGEMENT ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User navigates to /dashboard/contacts"]
    A --> B["GET /api/contacts (with auth token)"]
    B --> C["Server queries: SELECT * FROM contacts WHERE user_id = ?"]
    C --> D["Return contacts array to frontend"]
    D --> E["ContactContext stores contacts in state"]
    E --> F["Render contact list with search/filter bar"]
    F --> G{"User action?"}
    
    G -- "View Detail" --> H["Open contact detail panel"]
    H --> H1["Show all fields: name, email, phone, company, tags"]
    H1 --> H2["Show linked events, relationships, scan history"]
    H2 --> F

    G -- "Edit" --> I["Open edit form with pre-filled fields"]
    I --> I1["User modifies fields"]
    I1 --> I2["PUT /api/contacts/:id"]
    I2 --> I3["UPDATE contacts SET ... WHERE id = ?"]
    I3 --> I4["ContactContext.updateContact()"]
    I4 --> F

    G -- "Delete" --> J["Show delete confirmation dialog"]
    J --> J1{"User confirms?"}
    J1 -- No --> F
    J1 -- Yes --> J2["DELETE /api/contacts/:id"]
    J2 --> J3["DELETE FROM contacts WHERE id = ?"]
    J3 --> J4["ContactContext.deleteContact()"]
    J4 --> F

    G -- "Add Tags" --> K["Open tag editor"]
    K --> K1["User adds/removes tags"]
    K1 --> K2["UPDATE contacts SET tags = ? WHERE id = ?"]
    K2 --> F

    G -- "Export" --> L{"Export format?"}
    L -- "Excel" --> L1["Frontend generates XLSX using xlsx library"]
    L1 --> L2["Download file to user device"]
    L2 --> F
    L -- "CRM" --> L3["See CRM Export Activity (Section 13)"]

    G -- "Add Manual" --> M["Open blank contact form"]
    M --> M1["User enters contact details"]
    M1 --> M2["POST /api/contacts"]
    M2 --> M3["INSERT INTO contacts"]
    M3 --> M4["ContactContext.addContact()"]
    M4 --> F
```

---

## 6. CONTACT SEARCH & FILTER ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User is on /dashboard/contacts"]
    A --> B{"Search type?"}
    
    B -- "Text Search" --> C["User types in search bar"]
    C --> D["Frontend filters contacts by name/email/company"]
    D --> E["Display filtered results instantly"]
    E --> ENDD(("◉"))

    B -- "Semantic AI Search" --> F["User types natural language query"]
    F --> F1["Example: 'marketing managers from Mumbai'"]
    F1 --> G["GET /api/contacts/semantic-search?q=..."]
    G --> H["Server sends query to Gemini AI"]
    H --> I["AI interprets intent and matches contacts"]
    I --> J["Return ranked results with relevance score"]
    J --> K["Display AI-ranked results"]
    K --> ENDD

    B -- "Advanced Filter" --> L["User opens filter panel"]
    L --> L1["Select: Company, City, Industry, Seniority, Tags"]
    L1 --> L2["Apply filter combinations"]
    L2 --> L3["Frontend filters from ContactContext"]
    L3 --> L4["Display filtered contact list"]
    L4 --> ENDD

    B -- "Global Search" --> M["User presses Cmd+K"]
    M --> N["CommandPalette opens"]
    N --> O["User types search query"]
    O --> P["GET /api/search/global?q=..."]
    P --> Q["Server searches across: contacts, events, drafts"]
    Q --> R["Return categorized results"]
    R --> S["User clicks result to navigate"]
    S --> ENDD
```

---

## 7. AI EMAIL DRAFT GENERATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User selects a contact in ContactsPage"]
    A --> B["User clicks 'Generate AI Draft'"]
    B --> C["Open draft generation modal"]
    C --> D["User selects tone: Professional / Casual / Follow-up"]
    D --> E["POST /api/drafts/generate"]
    E --> F["Server prepares AI prompt with contact context"]
    F --> F1["Include: contact name, company, previous interactions"]
    F1 --> G["Send prompt to Gemini AI"]
    G --> H{"AI generation successful?"}
    H -- No --> I["Return error: generation failed"]
    I --> C
    H -- Yes --> J["AI returns email subject + body"]
    J --> K["INSERT INTO ai_drafts (user_id, contact_id, subject, body, tone)"]
    K --> L["Return draft to frontend"]
    L --> M["Display draft in editor"]
    M --> N{"User action?"}
    N -- "Edit" --> O["User modifies subject/body"]
    O --> P["PUT /api/drafts/:id"]
    P --> M
    N -- "Send" --> Q["POST /api/drafts/:id/send"]
    Q --> R["Create SMTP transporter"]
    R --> S["Send email via Nodemailer"]
    S --> T{"Send successful?"}
    T -- Yes --> U["UPDATE ai_drafts SET status='sent', sent_at=NOW()"]
    U --> V["Show success notification"]
    T -- No --> W["Show send error"]
    W --> M
    N -- "Discard" --> X["DELETE /api/drafts/:id"]
    X --> Y["DELETE FROM ai_drafts WHERE id = ?"]
    Y --> Z["Return to contacts page"]
    V --> Z
    Z --> ENDD(("◉"))
```

---

## 8. WORKSPACE INVITATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Enterprise Admin visits /workspace/members"]
    A --> B["Admin clicks 'Invite Member'"]
    B --> C["Enter: Email, Name, Role"]
    C --> D["POST /api/workspace/members/invite"]
    D --> E{"Admin has workspace_id?"}
    E -- No --> F["Auto-create workspace_id"]
    F --> F1["UPDATE admin user with new workspace_id"]
    F1 --> G
    E -- Yes --> G{"Target email already in this workspace?"}
    G -- Yes --> H["Return 400: Already a member"]
    H --> C
    G -- No --> I{"Target email belongs to another org?"}
    I -- Yes --> J["Return 400: Belongs to another organization"]
    J --> C
    I -- No --> K{"Target user exists in system?"}
    K -- Yes --> L["UPDATE existing user: set workspace_id, role, tier=enterprise"]
    K -- No --> M["Create skeleton user account"]
    M --> M1["Generate random password"]
    M1 --> M2["Hash with bcrypt"]
    M2 --> M3["INSERT INTO users (name, email, password, role, workspace_id, tier)"]
    M3 --> N
    L --> N["Generate invitation token (crypto.randomBytes 32)"]
    N --> O["INSERT INTO workspace_invitations (token, expires 7 days)"]
    O --> P["Create SMTP transporter from env"]
    P --> Q{"SMTP configured?"}
    Q -- Yes --> R["Send invitation email with accept link"]
    R --> R1["Email includes: role, workspace name, accept button"]
    Q -- No --> S["Log: SMTP not configured, skip email"]
    R1 --> T["Log audit: SEND_INVITATION"]
    S --> T
    T --> U["Return success to frontend"]
    U --> V["Show 'Invitation sent' toast"]
    V --> W["Invitee receives email"]
    W --> X["Invitee clicks 'Accept Invitation' link"]
    X --> Y["Navigate to /accept-invitation?token=..."]
    Y --> Z["POST /api/workspaces/invitations/:token/accept"]
    Z --> AA{"Token valid and not expired?"}
    AA -- No --> AB["Return 404/400: Invalid or expired"]
    AB --> ENDD(("◉"))
    AA -- Yes --> AC["UPDATE users SET workspace_id, role"]
    AC --> AD["UPDATE workspace_invitations SET status='accepted'"]
    AD --> AE["Log audit: ACCEPT_INVITATION"]
    AE --> AF["User redirected to workspace dashboard"]
    AF --> ENDD
```

---

## 9. CALENDAR EVENT CREATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["User navigates to /dashboard/calendar"]
    A --> B["GET /api/calendar/calendars"]
    B --> C["Display calendar grid (month/week/day view)"]
    C --> D["User clicks on time slot or 'New Event'"]
    D --> E["Open EventModal component"]
    E --> F["User enters: Title, Description, Start, End"]
    F --> G{"Add recurrence?"}
    G -- Yes --> H["Select: Daily / Weekly / Monthly / Yearly"]
    H --> H1["Set interval, count, until date"]
    H1 --> I
    G -- No --> I{"Add attendees?"}
    I -- Yes --> J["Enter attendee emails"]
    J --> J1["Search contacts for auto-complete"]
    J1 --> K
    I -- No --> K{"Set reminder?"}
    K -- Yes --> L["Select: 5min / 15min / 30min / 1hr before"]
    L --> M
    K -- No --> M{"Use AI suggestion?"}
    M -- Yes --> N["POST /api/calendar/ai/suggest-time"]
    N --> N1["AI analyzes attendee availability"]
    N1 --> N2["Return suggested time slots"]
    N2 --> N3["User selects suggested time"]
    N3 --> O
    M -- No --> O["User clicks 'Create Event'"]
    O --> P["POST /api/calendar/events"]
    P --> Q["INSERT INTO calendar_events"]
    Q --> R{"Has attendees?"}
    R -- Yes --> S["INSERT INTO event_attendees for each"]
    S --> S1["INSERT INTO event_contact_links"]
    S1 --> S2["Send invitation emails via Nodemailer"]
    S2 --> T
    R -- No --> T{"Has reminder?"}
    T -- Yes --> U["INSERT INTO event_reminders"]
    U --> V
    T -- No --> V["Log audit: EVENT_CREATED"]
    V --> W["Return event to frontend"]
    W --> X["Event appears on calendar grid"]
    X --> Y["Cron job monitors reminders every 5 min"]
    Y --> Y1{"Reminder due?"}
    Y1 -- Yes --> Y2["Send reminder email via SMTP"]
    Y1 -- No --> Y3["Continue monitoring"]
    Y2 --> ENDD(("◉"))
    Y3 --> ENDD
```

---

## 10. BOOKING LINK & APPOINTMENT ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Admin visits /dashboard/calendar/booking-links"]
    A --> B["Admin clicks 'Create Booking Link'"]
    B --> C["Enter: Title, Duration, Buffer, Max/Day, Color"]
    C --> D["POST /api/calendar/booking-links"]
    D --> E["INSERT INTO booking_links (slug, title, duration_minutes)"]
    E --> F["Generate unique slug for public URL"]
    F --> G["Return booking link: /book/:slug"]
    G --> H["Admin shares link with external users"]
    
    H --> I["External user visits /book/:slug"]
    I --> J["GET /api/calendar/booking/:slug"]
    J --> K["Fetch booking link config + admin availability"]
    K --> L["Display available time slots"]
    L --> M["External user selects time slot"]
    M --> N["User enters: Name, Email, Notes"]
    N --> O["POST creates calendar event"]
    O --> P["INSERT INTO calendar_events"]
    P --> Q["INSERT INTO event_attendees"]
    Q --> R["Send confirmation email to both parties via SMTP"]
    R --> S["Event appears on admin's calendar"]
    S --> ENDD(("◉"))
```

---

## 11. EMAIL CAMPAIGN LIFECYCLE ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Admin visits /dashboard/email-marketing"]
    A --> B["Admin clicks 'Create Campaign'"]
    B --> C["Navigate to /dashboard/email-marketing/campaigns/new"]
    C --> D["Enter: Campaign Name, Subject Line"]
    D --> E{"Write body method?"}
    
    E -- "Manual" --> F["User writes email body in rich editor"]
    E -- "AI Auto-Write" --> G["POST /api/campaigns/auto-write"]
    G --> G1["Gemini AI generates email copy"]
    G1 --> G2["Return AI-written subject + body"]
    G2 --> F
    E -- "Template" --> H["Browse /dashboard/email-marketing/templates"]
    H --> H1["Select template from library"]
    H1 --> H2["Template body loaded into editor"]
    H2 --> F

    F --> I["Select target audience"]
    I --> J{"List selection method?"}
    J -- "Existing List" --> K["Choose from /dashboard/email-marketing/lists"]
    J -- "New List" --> L["Create new list with contact filters"]
    L --> L1["POST /api/email-lists"]
    L1 --> L2["Add contacts to list"]
    L2 --> K
    K --> M["GET /api/campaigns/audience-preview"]
    M --> N["Display matching contact count"]
    N --> O["Admin reviews campaign preview"]
    O --> P{"Action?"}
    
    P -- "Save Draft" --> Q["POST /api/campaigns (status=draft)"]
    Q --> Q1["INSERT INTO email_campaigns"]
    Q1 --> ENDD(("◉"))

    P -- "Schedule" --> R["Select send date/time"]
    R --> R1["UPDATE email_campaigns SET scheduled_at, status=scheduled"]
    R1 --> ENDD

    P -- "Send Now" --> S["Trigger campaign send"]
    S --> T["For each recipient in target list:"]
    T --> U["INSERT INTO email_sends (email, status=pending)"]
    U --> V["Create Nodemailer transporter"]
    V --> W["Send email with tracking pixel + link tracking"]
    W --> X{"Send successful?"}
    X -- Yes --> Y["UPDATE email_sends SET status=sent, sent_at=NOW()"]
    X -- No --> Z["UPDATE email_sends SET status=bounced, bounce_reason"]
    Y --> AA["Increment campaign: sent_count"]
    Z --> AB["Increment campaign: failed_count"]
    AA --> AC["Continue to next recipient"]
    AB --> AC
    AC --> T

    T --> AD["Campaign send complete"]
    AD --> AE["UPDATE email_campaigns SET status=sent, sent_at=NOW()"]
    AE --> AF["Admin views analytics at /campaigns/:id"]
    AF --> AG["Track: opens, clicks, bounces, unsubscribes"]
    AG --> ENDD
```

---

## 12. CONTACT DEDUPLICATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Admin visits /workspace/data-quality"]
    A --> B["GET /api/workspace/data-quality/dedupe-queue"]
    B --> C["Server scans contacts for matching fingerprints"]
    C --> D["Group contacts by: same email OR same name+company"]
    D --> E["For each duplicate group:"]
    E --> F["INSERT INTO data_quality_dedupe_queue"]
    F --> F1["Store: fingerprint, contact_ids_json, confidence, reason"]
    F1 --> G["Return queue to frontend"]
    G --> H["Display deduplication queue with match details"]
    H --> I["Admin reviews duplicate pair"]
    I --> J{"Admin action?"}

    J -- "Merge" --> K["Admin selects primary contact"]
    K --> L["POST /api/workspace/data-quality/queue/:id/merge"]
    L --> M["Server merges fields from secondary into primary"]
    M --> M1["UPDATE primary contact with missing fields"]
    M1 --> M2["Re-link relationships, events, drafts"]
    M2 --> M3["DELETE secondary contact"]
    M3 --> M4["UPDATE dedupe_queue SET status=merged"]
    M4 --> N["Show merge success"]
    N --> H

    J -- "Dismiss" --> O["POST /api/workspace/data-quality/queue/:id/dismiss"]
    O --> P["UPDATE dedupe_queue SET status=dismissed"]
    P --> Q["Add resolution note"]
    Q --> H

    J -- "Skip" --> H

    H --> ENDD(("◉"))
```

---

## 13. CRM EXPORT ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Admin visits /workspace/crm-mapping"]
    A --> B["GET /api/crm/config"]
    B --> C{"CRM provider connected?"}
    
    C -- No --> D["Admin clicks 'Connect CRM'"]
    D --> E["Select provider: Salesforce / HubSpot / Zoho"]
    E --> F["Enter API credentials"]
    F --> G["POST /api/crm/connect"]
    G --> H["Validate credentials with provider"]
    H --> I{"Valid?"}
    I -- No --> J["Show error: invalid credentials"]
    J --> D
    I -- Yes --> K["Save connection config"]
    K --> L["GET /api/crm/schema"]
    L --> M["Display provider fields"]
    M --> N["Admin maps IntelliScan fields to CRM fields"]
    N --> N1["name → Contact.Name, email → Contact.Email, etc."]
    N1 --> O["POST /api/crm/config (save mapping)"]
    O --> P
    
    C -- Yes --> P["Admin selects contacts for export"]
    P --> Q["POST /api/contacts/export-crm"]
    Q --> R["Server reads crm_mappings for user"]
    R --> S["Transform contacts using field mapping"]
    S --> T["For each contact:"]
    T --> U["Map fields: IntelliScan → CRM schema"]
    U --> V["Send to CRM provider API"]
    V --> W{"Export successful?"}
    W -- Yes --> X["UPDATE contacts SET crm_synced=1, crm_synced_at"]
    W -- No --> Y["Log error in crm_sync_log"]
    X --> Z["INSERT crm_sync_log (status=success)"]
    Y --> Z
    Z --> T
    T --> AA["Return export summary"]
    AA --> AB["Display: synced count, failed count"]
    AB --> ENDD(("◉"))
```

---

## 14. PLATFORM INCIDENT MANAGEMENT ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Super Admin visits /admin/incidents"]
    A --> B["GET /api/admin/incidents"]
    B --> C["Display active incidents list"]
    C --> D{"Admin action?"}

    D -- "Create New" --> E["Click 'Report Incident'"]
    E --> F["Enter: Title, Severity, Service, Impact"]
    F --> G["POST /api/admin/incidents"]
    G --> H["INSERT INTO platform_incidents (status=open)"]
    H --> I["Log audit: INCIDENT_CREATED"]
    I --> C

    D -- "Acknowledge" --> J["Select open incident"]
    J --> K["POST /api/admin/incidents/:id/ack"]
    K --> L["UPDATE: status=acknowledged, acknowledged_by, acknowledged_at"]
    L --> M["Log audit: INCIDENT_ACKNOWLEDGED"]
    M --> C

    D -- "Resolve" --> N["Select acknowledged incident"]
    N --> O["Enter resolution notes"]
    O --> P["POST /api/admin/incidents/:id/resolve"]
    P --> Q["UPDATE: status=resolved, updated_at"]
    Q --> R["Log audit: INCIDENT_RESOLVED"]
    R --> C

    D -- "Delete" --> S["Select incident"]
    S --> T["Confirm deletion"]
    T --> U["DELETE /api/admin/incidents/:id"]
    U --> V["DELETE FROM platform_incidents WHERE id = ?"]
    V --> C

    D -- "View Details" --> W["Open incident detail panel"]
    W --> W1["Show: timeline, severity, service, impact"]
    W1 --> C

    C --> ENDD(("◉"))
```

---

## 15. AI ENGINE CONFIGURATION ACTIVITY

```mermaid
flowchart TD
    START(("●")) --> A["Super Admin visits /admin/engine-performance"]
    A --> B["GET /api/engine/stats"]
    B --> C["Display: OCR accuracy, avg latency, throughput"]
    C --> D["GET /api/engine/config"]
    D --> E["Show current config: model, confidence threshold, timeout"]
    E --> F{"Admin action?"}

    F -- "Tune Parameters" --> G["Modify: confidence_threshold, max_tokens, temperature"]
    G --> H["PUT /api/engine/config"]
    H --> I["UPDATE engine_config SET value WHERE key = ?"]
    I --> J["Log audit: ENGINE_CONFIG_UPDATED"]
    J --> E

    F -- "View Model History" --> K["GET /api/engine/versions"]
    K --> L["Display version list with accuracy/latency metrics"]
    L --> M{"Select action?"}
    M -- "Rollback" --> N["POST /api/engine/versions/:id/rollback"]
    N --> O["UPDATE model_versions SET status=active for target"]
    O --> P["UPDATE current active model to standby"]
    P --> Q["Log audit: MODEL_ROLLBACK"]
    Q --> E
    M -- "Back" --> E

    F -- "Test in Sandbox" --> R["Navigate to API Sandbox"]
    R --> S["Upload test image"]
    S --> T["POST /api/sandbox/test"]
    T --> U["Process with current engine config"]
    U --> V["INSERT INTO api_sandbox_calls (payload, response, latency)"]
    V --> W["Display: extracted data, latency, confidence"]
    W --> X["GET /api/sandbox/logs"]
    X --> Y["Show test history"]
    Y --> E

    F -- "View Stats" --> Z["Display charts: scans/day, accuracy trend, p95 latency"]
    Z --> E

    E --> ENDD(("◉"))
```

---

## ACTIVITY DIAGRAM SUMMARY

| # | Activity Diagram | Module | Steps | Decision Points | External Systems |
|:--|:----------------|:-------|:------|:-----------------|:-----------------|
| 1 | User Registration | Auth | 15 | 2 | bcrypt, JWT |
| 2 | User Login | Auth | 14 | 3 | bcrypt, JWT |
| 3 | Single Card Scan | Scanner | 25 | 6 | Gemini AI, Tesseract, Socket.IO |
| 4 | Batch Multi-Scan | Scanner | 16 | 3 | Gemini AI, Socket.IO |
| 5 | Contact Management | Contacts | 20 | 4 | xlsx library |
| 6 | Contact Search | Contacts | 15 | 4 | Gemini AI |
| 7 | AI Draft Generation | AI/Email | 18 | 4 | Gemini AI, Nodemailer |
| 8 | Workspace Invitation | Workspace | 22 | 6 | Nodemailer, bcrypt |
| 9 | Calendar Event | Calendar | 20 | 5 | Gemini AI, Nodemailer |
| 10 | Booking Link | Calendar | 14 | 1 | Nodemailer |
| 11 | Email Campaign | Email | 24 | 5 | Gemini AI, Nodemailer |
| 12 | Contact Dedup | Quality | 15 | 2 | — |
| 13 | CRM Export | CRM | 18 | 3 | External CRM API |
| 14 | Incident Mgmt | Admin | 16 | 1 | — |
| 15 | AI Engine Config | Admin | 18 | 3 | Gemini AI |
| | **TOTALS** | | **270 steps** | **52 decisions** | |

---

> **END OF ACTIVITY DIAGRAMS DOCUMENT**  
> 15 detailed Mermaid activity diagrams covering all major workflows.  
> Total: 270 action steps, 52 decision points, 8 external system interactions.
