# DRAW.IO AI PROMPTS - SHORT VERSION (Under 10,000 chars each)

---

## PROMPT 1: USE CASE DIAGRAM (CONDENSED)

**IntelliScan Use Case Diagram**

Create a UML Use Case Diagram for IntelliScan - Business Card Intelligence Platform with 5 actors.

**ACTORS:**
1. End User (Blue) - Scan cards, manage contacts
2. Business Admin (Orange) - Team/contact/campaign management
3. Super Admin (Purple) - System health, users, AI config
4. Guest User (Green) - Booking, kiosk scanning
5. CRM System (Gray) - External integration

**END USER (14 use cases):**
Sign In, Scan Card, Review Data, Edit Fields, Save Contact, Search, View Details, Export, Email Campaign, Track Opens, Calendar, Analytics, Settings, Help

**ADMIN (19 use cases):**
Manage Team, Invite Members, Assign Roles, Activity Log, Manage Contacts, Assign Contacts, Tags, Merge Duplicates, Setup CRM, Map Fields, Data Retention, Campaigns, Templates, Automation, Workspace Settings, Analytics, Billing, API Logs, Integrations

**SUPER ADMIN (15 use cases):**
Monitor Health, API Metrics, Manage Users, Audit Trail, Security Policy, API Keys, Configure AI, Select Model, Train Model, Manage Plans, Revenue Reports, Payment Gateway, Backups, Integrations, System Logs

**GUEST USER (14 use cases):**
Create Booking, View Calendar, Select Time, Contact Info, Confirm, ICS File, Scan Kiosk, Upload, Take Photo, View Data, Edit Fields, Submit, Profile, Help

**STYLING:**
- System boundary rectangle (dashed)
- Color-coded actors by type
- Association lines for primary flows
- Dashed lines for include/extend
- Actors on left, use cases grouped by type

---

## PROMPT 2: ACTIVITY DIAGRAMS (CONDENSED)

**IntelliScan Activity Diagrams - 4 Workflows**

Create 4 separate UML Activity Diagrams showing key workflows.

**WORKFLOW 1: Card Scanning**
Start → Open App → Source Type (decision) → [Camera|Upload|Manual] → AI Extract → Validate (decision) → [OK→Save|Invalid→Review] → Success → End

Colors: Blue=user, Purple=AI, Green=save

**WORKFLOW 2: Email Campaign**
Start → Create → Recipients → Compose → Templates → Preview (decision) → [No→Edit|Yes→Schedule] → Send → Fork [Track Opens|Track Clicks|Track Conversions] → Report → End

Colors: Red=creation, Orange=send, Green=tracking

**WORKFLOW 3: Contact Management**
Start → Access List → Action (decision) → [Search|View|Edit] → Tags → Assign Team → Duplicates? → [Yes→Merge|No→Skip] → Export → End

**WORKFLOW 4: CRM Sync**
Start → Initiate → Auth (decision) → [Fail→Retry|Success→Get Contacts] → Map Fields → Push → Update Status → Report → End

Include merge/fork bars for parallel flows.

---

## PROMPT 3: INTERACTION DIAGRAMS (CONDENSED)

**IntelliScan Interaction Diagrams - 4 Components Flows**

Create 4 UML Interaction/Collaboration Diagrams.

**INTERACTION 1: Card Scanning**
User → App → Camera/Storage → OCR → AI Model → Database
Messages: Click Scan → Request → Capture → Send Image → Extract → Process → Scores → Display → Edit → Save → Confirm → Success

**INTERACTION 2: Email Campaign**
Admin → Dashboard → Email Service → Tracking → Database → Analytics
Messages: Create → Validate → Fetch Template → Prepare → Add Pixels → Queue → Send → Track Opens/Clicks → Log → Process → Display Stats → Report

**INTERACTION 3: CRM Sync**
Admin → Dashboard → Sync Service → Auth → CRM API → Database
Messages: Click Sync → Validate → OAuth → Token → Query → Contacts → Map → Push → Confirm → Update → Report

**INTERACTION 4: Team Collaboration**
Admin → Team Service → Permissions → Contact Service → Database → Notifications
Messages: Invite → Create → Assign → Email → Accept → Update → Filter → Display → Log → Notify

Show components as boxes, numbered bidirectional arrows, professional layout.

---

## PROMPT 4: SEQUENCE DIAGRAMS (CONDENSED)

**IntelliScan Sequence Diagrams - 4 Interactions**

Create 4 detailed UML Sequence Diagrams.

**SEQUENCE 1: Card Scanning (7 actors)**
User, Mobile App, Camera, Vision API, AI Engine, Database, Web Server

Flow: Click Scan → Request Permission → Access → Capture → Load → Send to Vision API → OCR Process → Return Text → Send to AI → Validate → Return Structured → Display → Confirm → Send to DB → Save → Confirm → Success

**SEQUENCE 2: Email Campaign (7 actors)**
Admin, Dashboard, Email Service, Queue, SMTP, Tracking DB, Analytics

Flow: Create with recipients → Validate → Fetch template → Prepare → Pixels → Unsubscribe → Queue → Batch → Send → Status → Log → Monitor Opens → Monitor Clicks → Record → Process → Display → Report

**SEQUENCE 3: CRM Sync (6 actors)**
Admin, Dashboard, Sync Service, Auth, CRM API, Database

Flow: Click Sync → Initiate → Validate → Request Token → Return Token → Query DB → Get List → Map Fields → Transform → Push Batch → Validate → Return Result → Parse → Update → Confirm → Notify → Display Report

**SEQUENCE 4: Team Invitation (5 actors)**
Admin, Backend, Email, Database, Member

Flow: Click Invite → Email & Role → Validate → Create Invitation → Token → Send Email → Receive → Click Link → Verify → Signup Form → Password → Hash & Activate → Update Role → Welcome Email → Login → Notify Admin

Include activation boxes, dashed returns, lifelines.

---

## PROMPT 5: CLASS DIAGRAM (CONDENSED)

**IntelliScan Class Diagram**

Create UML Class Diagram with 10 main classes and relationships.

**User**: id, email, password, firstName, lastName, role, subscriptionPlan, createdAt | login(), logout(), updateProfile()

**Contact**: id, userId, name, email, phone, company, jobTitle, confidence, source, tags | save(), update(), delete(), merge(), export()

**Card**: id, contactId, imageUrl, side, extractedText, status, modelVersion | extractData(), getScores()

**Campaign**: id, createdBy, name, subject, body, recipientCount, sentAt, opens, clicks | create(), schedule(), send(), getMetrics()

**CRMIntegration**: id, workspaceId, provider, apiKey, syncStatus, lastSync, mappings | authenticate(), pushContacts(), pullContacts()

**AIModel**: id, name, version, accuracy, language, isActive | extractData(), validateData(), updateModel()

**Team**: id, workspaceId, name, memberCount | addMember(), assignContacts()

**Workspace**: id, name, plan, storageUsed, teamCount | createTeam(), updatePlan()

**Analytics**: id, userId, metricName, value, timestamp | recordMetric(), getMetrics()

**AuditLog**: id, userId, action, resourceType, timestamp | logAction()

**RELATIONSHIPS:**
User→Contact (1:*), User→Workspace (1:*), User→Team (1:*)
Workspace→Contact (1:*), Workspace→Team (1:*), Workspace→CRM (1:1)
Contact→Card (1:*), Contact→Campaign (1:*), Contact→AIModel
Campaign→Analytics (1:*)

Color-code classes, show multiplicity on relationships.

---

## USAGE:
1. Copy ONE prompt at a time
2. Go to https://app.diagrams.net/
3. Click File → New
4. Click "Ask AI" button (top-right)
5. Paste prompt
6. AI generates diagram
7. Save as .drawio file
