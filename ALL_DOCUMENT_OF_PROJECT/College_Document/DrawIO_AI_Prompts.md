# IntelliScan UML Diagrams - AI Prompts for Draw.io

## 1. USE CASE DIAGRAM PROMPT

Create a comprehensive UML Use Case Diagram for the IntelliScan - Business Card Intelligence Platform.

**SYSTEM OVERVIEW:**
IntelliScan is a comprehensive business card scanning and contact management platform with AI-powered data extraction, CRM integration, email marketing campaigns, team collaboration, and advanced analytics.

**ACTORS (5 types):**
1. End User (Blue) - Personal users who scan cards and manage contacts
2. Business Admin (Orange) - Team leads managing workspace, contacts, and campaigns
3. Super Admin (Purple) - Platform administrators managing system health, security, users, and AI
4. Guest User (Green) - External users with limited access for booking and kiosk scanning
5. CRM System (Gray) - External CRM software for integration

**END USER USE CASES (14):**
- Sign In / Sign Up
- Scan Business Card (primary)
- Review Extracted Data
- Edit Contact Fields
- Save Contact
- Search Contacts
- View Contact Details
- Export Contacts (CSV/Excel)
- Send Email Campaign
- Track Email Opens
- View Calendar/Schedule
- View Analytics
- Manage Settings
- Access Help & Documentation

**BUSINESS ADMIN USE CASES (19):**
- Manage Team Members
- Invite Team Members
- Assign Roles & Permissions
- View Activity Log
- Manage Contacts
- Assign Contacts to Team
- Add Contact Tags
- Merge Duplicate Contacts
- Setup CRM Integration
- Map CRM Fields
- Configure Data Retention
- Create Email Campaigns
- Configure Email Templates
- Setup Automation Rules
- Configure Workspace Settings
- View Team Analytics
- Manage Billing
- View API Logs
- Configure Integrations

**SUPER ADMIN USE CASES (15):**
- Monitor System Health
- View API Metrics
- Manage User Accounts
- View Audit Trail
- Configure Security Policy
- Manage API Keys
- Configure AI Engine
- Select AI Model
- Train Custom Model
- Manage Subscription Plans
- View Revenue Reports
- Configure Payment Gateway
- Setup Database Backups
- Manage Integrations
- View System Logs

**GUEST USER USE CASES (14):**
- Create Booking
- View Calendar Availability
- Select Time Slot
- Enter Contact Information
- Confirm Booking
- Receive ICS File
- Use Scan Kiosk
- Scan Card at Kiosk
- Upload Card Image
- Take Photo
- View Extracted Data
- Edit Extracted Fields
- Submit Data
- View Help

**RELATIONSHIPS:**
- End User includes Sign In before other use cases
- Business Admin includes Setup CRM Integration before Configure CRM Fields
- Super Admin includes Monitor Health before View API Metrics
- Scan Card uses AI Engine (actor relationship)
- Send Email Campaign extends Manage Contacts
- All actors can access View Help & Documentation

**STYLING:**
- Use clear system boundary rectangle
- Color-code actors by type
- Use association lines for primary flows
- Use dashed lines for include/extend relationships
- Place actors on left side
- Group related use cases vertically

---

## 2. ACTIVITY DIAGRAM PROMPT

Create detailed Activity Diagrams for the IntelliScan platform covering 4 major features/workflows.

**WORKFLOW 1: CARD SCANNING PROCESS**
Start → User Opens App → Select Card Source (decision: Camera/Upload/Manual Entry) → 
If Camera: Scan with Camera → If Upload: Upload from File → If Manual: Enter Manually →
All paths merge → AI Extraction Engine → Validate Data (decision: Valid/Invalid) →
If Invalid: Review & Manual Correction → If Valid: Save Contact → Display Success → End

Include:
- Start/End ellipses (filled black circles)
- Rounded rectangles for actions
- Diamonds for decisions
- Merge/Fork nodes where paths split and rejoin
- Color code: Blue for user actions, Purple for AI processing, Green for save operations

**WORKFLOW 2: EMAIL CAMPAIGN FLOW**
Start → Create Campaign → Select Recipients → Compose Email → Add Templates & Merge Fields →
Preview Email (decision: Approve?) → If No: Edit Email → If Yes: Schedule Send →
Send Campaign → Parallel tracking paths:
  Path A: Track Email Opens
  Path B: Track Email Clicks
  Path C: Track Conversions
All paths merge → Generate Report → Display Results → End

Include:
- Parallel processing with fork/join bars
- Color code: Red for campaign creation, Orange for scheduling, Green for tracking

**WORKFLOW 3: CONTACT MANAGEMENT FLOW**
Start → Access Contact List → Select Action (decision) →
  Path 1: Search Contacts → View Results
  Path 2: View Contact Details
  Path 3: Edit Contact
All merge → Apply Tags → Assign to Team → Merge Duplicates (decision) →
If Duplicates Found: Merge Process → If No Duplicates: Skip →
Export Contacts → End

Include:
- Multiple decision paths
- Color code: Blue for search/view, Red for edit, Green for export

**WORKFLOW 4: CRM SYNC PROCESS**
Start → Admin Initiates Sync → Connect to CRM (decision: Auth Success?) →
If Failed: Retry/Error Handling → If Success: Get Contacts from IntelliScan →
Map Fields → Push to CRM → Monitor Sync Status (parallel: Error handling) →
Update Sync Timestamp → Generate Sync Report → End

**STYLING:**
- Use standard UML activity diagram symbols
- Clear flow directions
- Labeled transitions
- Contrasting colors for different operation types
- Legend showing color meanings

---

## 3. INTERACTION/COLLABORATION DIAGRAM PROMPT

Create UML Interaction Diagrams showing component interactions for IntelliScan platform.

**DIAGRAM 1: CARD SCANNING INTERACTION**
Components: End User → Mobile App → Camera/File Storage → OCR Engine → AI Model → Database

Interactions:
1. User clicks "Scan Card"
2. Mobile App requests camera access
3. Camera captures/user uploads image
4. App sends image to OCR Engine
5. OCR extracts raw text
6. AI Model processes & validates extracted data
7. AI returns confidence scores & structured data
8. Mobile App displays extracted fields for review
9. User confirms/edits data
10. App sends final contact to Database
11. Database confirms save
12. App displays success message

**DIAGRAM 2: EMAIL CAMPAIGN INTERACTION**
Components: Admin → Campaign Manager → Email Service → Tracking Service → Database → Analytics Engine

Interactions:
1. Admin creates campaign with recipients
2. Campaign Manager validates recipients
3. System fetches email templates
4. Email Service prepares emails with tracking pixels
5. Email Service sends campaign batch
6. Tracking Service monitors opens & clicks
7. Results logged to Database
8. Analytics Engine processes metrics
9. Dashboard displays real-time statistics
10. Reports generated and sent to Admin

**DIAGRAM 3: CRM INTEGRATION INTERACTION**
Components: Dashboard → Sync Service → Authentication Layer → CRM API → IntelliScan DB

Interactions:
1. Admin initiates CRM sync from Dashboard
2. Sync Service validates configuration
3. Authentication Layer requests OAuth token
4. CRM API returns token
5. Sync Service queries IntelliScan Database for new contacts
6. Database returns contact list
7. Sync Service maps IntelliScan fields to CRM fields
8. Sync Service pushes contacts to CRM API
9. CRM API confirms successful sync
10. Sync Service updates sync_status & last_sync_timestamp
11. Dashboard displays sync report

**DIAGRAM 4: TEAM COLLABORATION INTERACTION**
Components: Admin → Team Management Service → Permission Service → Contact Service → Database → Notification Service

Interactions:
1. Admin invites team member
2. Team Management creates member profile
3. Permission Service assigns roles
4. System sends invitation email via Notification Service
5. Member accepts invitation
6. Permission Service updates access rights
7. Contact Service filters contacts by member's assignments
8. Dashboard displays member's assigned contacts
9. Changes logged to audit trail in Database
10. Activity notification sent to other admins

**STYLING:**
- Show components as rectangles
- Bidirectional arrows with numbered interactions
- Include data type labels on interactions
- Professional layout with clear communication paths
- Legend for colors

---

## 4. SEQUENCE DIAGRAM PROMPT

Create UML Sequence Diagrams for critical IntelliScan workflows with detailed actor/component interactions.

**SEQUENCE 1: BUSINESS CARD SCANNING SEQUENCE**
Actors/Components: End User | Mobile App | Camera/Storage | Vision API | AI Engine | Database | Web Server

Message Flow:
1. End User: Click "Scan Card"
2. Mobile App: Request camera permission
3. Camera: Camera access granted
4. End User: Capture or select business card image
5. Mobile App: Load image into memory
6. Mobile App: Send image to Vision API (request OCR)
7. Vision API: Process image with OCR
8. Vision API: Return raw text (name, email, phone, company)
9. Mobile App: Send extracted text to AI Engine
10. AI Engine: Validate and structure data (confidence scores)
11. AI Engine: Return structured contact object
12. Mobile App: Display extracted fields to user for review
13. End User: Approve/edit extracted data
14. Mobile App: Send final contact to Database (via Web Server)
15. Web Server: Validate and save contact
16. Database: Persist contact and return confirmation
17. Web Server: Return success response
18. Mobile App: Display "Contact Saved Successfully"
19. Mobile App: Show next action options (scan another, view contacts, etc.)

Include: Activation boxes, return messages (dashed), participant lifelines

**SEQUENCE 2: EMAIL CAMPAIGN EXECUTION SEQUENCE**
Actors: Admin | Campaign Dashboard | Email Service | Queue Manager | SMTP Provider | Tracking DB | Analytics

Message Flow:
1. Admin: Create campaign with subject, body, recipients
2. Campaign Dashboard: Validate recipient list
3. Campaign Dashboard: Fetch email template
4. Email Service: Prepare emails with personalization
5. Email Service: Add tracking pixels to emails
6. Email Service: Add unsubscribe links
7. Email Service: Queue emails for sending
8. Queue Manager: Batch process emails
9. Queue Manager: Send to SMTP Provider (batch)
10. SMTP Provider: Return delivery status
11. Queue Manager: Log send attempts to Tracking DB
12. Email Service: Monitor open events (pixel hits)
13. Email Service: Monitor click events
14. Tracking DB: Record open/click timestamps
15. Analytics: Process metrics and generate statistics
16. Campaign Dashboard: Display real-time campaign metrics
17. Admin: View open rate, click rate, conversion data

Include: Parallel sequences for sending and tracking

**SEQUENCE 3: CRM SYNCHRONIZATION SEQUENCE**
Actors: Admin | App Dashboard | Sync Service | Auth Service | CRM Provider API | IntelliScan Database

Message Flow:
1. Admin: Click "Sync CRM"
2. App Dashboard: Initiate sync request
3. Sync Service: Validate CRM configuration
4. Auth Service: Request OAuth token from CRM
5. CRM Provider: Return authorization token
6. Sync Service: Query IntelliScan Database for new/updated contacts
7. Database: Return contact list (filtered by sync timestamp)
8. Sync Service: Map IntelliScan fields to CRM field names
9. Sync Service: Transform contact objects for CRM format
10. Sync Service: Send batch push to CRM Provider API
11. CRM Provider: Validate and process contacts
12. CRM Provider: Return sync result (success/failures)
13. Sync Service: Parse response and log errors
14. Sync Service: Update sync_status in Database
15. Database: Return update confirmation
16. Sync Service: Send completion notification
17. App Dashboard: Display "Sync Complete" with statistics
18. Admin: View sync report (X contacts synced, Y errors)

**SEQUENCE 4: TEAM MEMBER INVITATION SEQUENCE**
Actors: Admin | App Backend | Email Service | Database | Pending Member | New Member

Message Flow:
1. Admin: Click "Invite Team Member"
2. Admin: Enter email address and select role
3. App Backend: Validate email format
4. App Backend: Check if email already exists
5. App Backend: Create pending invitation in Database
6. Database: Return invitation token
7. App Backend: Send invitation email via Email Service
8. Email Service: Include activation link with token
9. Email Service: Send from no-reply@intelliscan.com
10. Pending Member: Receive invitation email
11. Pending Member: Click activation link
12. App Backend: Verify invitation token
13. App Backend: Redirect to signup form
14. Pending Member: Create password
15. App Backend: Hash password and activate account
16. App Backend: Update user role in Database
17. Database: Return confirmation
18. App Backend: Send welcome email
19. New Member: Account activated, can login
20. Admin: Receive notification of successful invitation

Include: Alternative flows (invalid email, expired token)

---

## 5. CLASS DIAGRAM PROMPT

Create a comprehensive UML Class Diagram for the IntelliScan system showing data models and relationships.

**CLASSES:**

**User**
- id: UUID
- email: String (unique)
- password: String (hashed)
- firstName: String
- lastName: String
- role: Enum (EndUser, Admin, SuperAdmin, Guest)
- subscriptionPlan: String
- createdAt: DateTime
- Methods: login(), logout(), updateProfile(), changePassword()

**Contact**
- id: UUID
- userId: UUID
- firstName: String
- lastName: String
- email: String
- phone: String
- company: String
- jobTitle: String
- extractionConfidence: Float
- source: Enum
- tags: List<String>
- Methods: save(), update(), delete(), merge(), export()

**Card**
- id: UUID
- contactId: UUID
- imageUrl: String
- cardSide: Enum (Front, Back)
- extractedText: String
- processingStatus: Enum
- aiModelVersion: String
- Methods: extractData(), getConfidenceScores()

**Campaign**
- id: UUID
- createdBy: UUID
- name: String
- subject: String
- body: String
- recipientCount: Int
- sentAt: DateTime
- openCount: Int
- clickCount: Int
- Methods: create(), schedule(), send(), getMetrics()

**CRMIntegration**
- id: UUID
- workspaceId: UUID
- provider: Enum
- apiKey: String (encrypted)
- syncStatus: Enum
- lastSyncAt: DateTime
- fieldMappings: Map<String, String>
- Methods: authenticate(), testConnection(), pushContacts(), pullContacts()

**AIModel**
- id: UUID
- name: String
- version: String
- accuracy: Float
- language: String
- isActive: Boolean
- Methods: extractData(), validateData(), updateModel()

**Team**
- id: UUID
- workspaceId: UUID
- name: String
- memberCount: Int
- Methods: addMember(), removeMember(), assignContacts()

**Workspace**
- id: UUID
- name: String
- subscriptionPlan: String
- storageUsed: Long
- teamCount: Int
- Methods: createTeam(), updatePlan(), getStorageUsage()

**Analytics**
- id: UUID
- userId: UUID
- metricName: String
- metricValue: Float
- timestamp: DateTime
- Methods: recordMetric(), getMetrics(), generateReport()

**AuditLog**
- id: UUID
- userId: UUID
- action: String
- resourceType: String
- timestamp: DateTime
- Methods: logAction(), getAuditTrail()

**RELATIONSHIPS:**
- User (1) → (*) Contact
- User (1) → (*) Workspace
- User (1) → (*) Team
- Workspace (1) → (*) Contact
- Workspace (1) → (*) Team
- Contact (1) → (*) Card
- Contact (1) → (*) Campaign
- Campaign (1) → (*) Analytics
- Workspace (1) → (1) CRMIntegration
- Contact (1) → (*) AIModel (processed by)

---

## How to Use These Prompts:

1. Copy any prompt above
2. Go to https://app.diagrams.net/
3. Click **File → New**
4. Look for **"Ask AI"** button (usually top-right)
5. Paste the prompt
6. Draw.io AI will generate the diagram
7. Customize colors, positioning, and details as needed

**Save all diagrams as .drawio files in:**
`d:\Anant\Project\CardToExcel\stitch (1)MoreSCreens\intelliscan-server\College_Document\`
