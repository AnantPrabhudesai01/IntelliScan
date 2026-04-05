# IntelliScan — Complete Use Case Diagrams (All Features)

> Every diagram below uses valid **Mermaid.js** `flowchart` syntax to represent Use Case relationships.  
> **Actors** are shown as 👤 labeled boxes, **Use Cases** as rounded ovals `([...])`, **include** as dashed arrows `-.->`, and **extend** as dotted arrows `-.->`.  
> Paste any block into [mermaid.live](https://mermaid.live) to see the rendered graphic.

---

## GLOBAL: Full Project Use Case (All Roles)

```mermaid
flowchart LR
    subgraph Actors
        A0["Anonymous Visitor"]
        A1["Personal User (Free/Pro)"]
        A2["Enterprise User"]
        A3["Enterprise Admin"]
        A4["Super Admin"]
    end

    subgraph "IntelliScan Platform"
        UC_AUTH(["Authenticate (Sign in, Sign up, Sessions)"])
        UC_PUBLIC(["Public Pages (Landing, Pricing, Public Stats)"])
        UC_KIOSK(["Event Kiosk Scan (Token Link)"])
        UC_SCAN(["Scan Single Card"])
        UC_GROUP(["Scan Group Photo (Multi-card)"])
        UC_CONTACTS(["Contacts CRM (Search, Edit, Export)"])
        UC_EVENTS(["Events & Campaigns (Tagging)"])
        UC_DRAFTS(["AI Drafts (Generate, Send)"])
        UC_COACH(["AI Networking Coach Insights"])
        UC_CAL(["Calendar & Booking Links"])
        UC_EMAIL(["Email Marketing (Templates, Lists, Campaigns, Tracking)"])
        UC_INTEGRATIONS(["Integrations (CRM Mapping, Webhooks)"])
        UC_DQ(["Data Quality (Dedupe Queue, Merge)"])
        UC_POLICIES(["Compliance Policies (Retention, Redaction, Audit Storage)"])
        UC_BILLING(["Billing & Upgrades (Razorpay Orders)"])
        UC_ADMIN(["Platform Admin (Health, Models, Incidents, Queues)"])
    end

    A0 --> UC_PUBLIC
    A0 --> UC_AUTH
    A0 --> UC_CAL
    A0 --> UC_KIOSK

    A1 --> UC_AUTH
    A1 --> UC_SCAN
    A1 --> UC_CONTACTS
    A1 --> UC_EVENTS
    A1 --> UC_DRAFTS
    A1 --> UC_COACH
    A1 --> UC_CAL
    A1 --> UC_BILLING

    A2 --> UC_SCAN
    A2 --> UC_GROUP
    A2 --> UC_CONTACTS
    A2 --> UC_EVENTS
    A2 --> UC_DRAFTS
    A2 --> UC_COACH
    A2 --> UC_CAL
    A2 --> UC_EMAIL

    A3 --> UC_CONTACTS
    A3 --> UC_EMAIL
    A3 --> UC_INTEGRATIONS
    A3 --> UC_DQ
    A3 --> UC_POLICIES
    A3 --> UC_BILLING

    A4 --> UC_ADMIN
    A4 --> UC_INTEGRATIONS
    A4 --> UC_POLICIES
```

---

## FEATURE 1: Authentication & User Onboarding

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

---

## FEATURE 2: Intelligent OCR Scanner (Single Card)

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

---

## FEATURE 3: Multi-Card / Group Photo Scanner

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

---

## FEATURE 4: Contact Management (CRUD)

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

---

## FEATURE 5: AI Dual-Engine Fallback System

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

---

## FEATURE 6: Smart Calendar & Event Scheduling

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

---

## FEATURE 7: AI Networking Coach & Insights

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

---

## FEATURE 8: Email Marketing & Campaign System

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

---

## FEATURE 9: CRM Integration (Salesforce / HubSpot)

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
