# INTERACTION/COLLABORATION DIAGRAM PROMPTS FOR DRAW.IO

Create comprehensive UML Interaction/Collaboration Diagrams for IntelliScan showing detailed component interactions and message flows between system parts.

## INTERACTION DIAGRAM 1: BUSINESS CARD SCANNING FLOW

### Overview
This interaction diagram illustrates the complete message flow when a user scans a business card, from initial capture through final storage in the database. It shows how multiple system components collaborate to extract and save contact information.

### Components/Participants
1. **End User** - The person performing the card scan action
2. **Mobile App** - React/Vue frontend application on user's device
3. **Camera/File Storage** - Native device camera or file system
4. **Image Processing Service** - Server-side image handler
5. **OCR Engine** - Optical Character Recognition service (possibly Tesseract, Google Vision API, or Azure Computer Vision)
6. **AI Model Service** - Machine learning service for data validation and structuring
7. **Web Server API** - Backend REST API server
8. **Contact Database** - Primary data store for contacts

### Detailed Message Flow

**Message 1: User Initiates Scan**
- From: End User
- To: Mobile App
- Content: "Click Scan Card button"
- Type: User action trigger

**Message 2: Request Camera Permission**
- From: Mobile App
- To: Camera/File Storage
- Content: "Request camera access permission"
- Return: "Permission granted" or "Permission denied"

**Message 3: Camera Access**
- From: Camera/File Storage
- To: Mobile App
- Content: "Camera is ready and accessible"

**Message 4: Capture/Select Business Card**
- From: End User
- To: Mobile App
- Content: "Capture photo of business card using camera button" OR "Select image file from device storage"
- Data: Image file (JPEG/PNG)

**Message 5: Load Image**
- From: Mobile App
- To: Camera/File Storage
- Content: "Load captured image into memory"
- Returns: Image object in application memory

**Message 6: Send Image to OCR Engine**
- From: Mobile App
- To: Image Processing Service
- Method: HTTP POST request
- Payload: Base64-encoded image, with metadata (image size, orientation, quality score)
- Endpoint: `/api/v1/ocr/process`

**Message 7: Image Processing**
- From: Image Processing Service
- To: Image Processing Service
- Content: Internal processing - image rotation, quality enhancement, contrast adjustment
- Type: Self-message indicating internal processing

**Message 8: Send to OCR**
- From: Image Processing Service
- To: OCR Engine
- Content: Optimized image data
- Returns: Raw extracted text (unstructured)
- Example Return: "Name: John Smith\nEmail: john@company.com\nPhone: 555-0123\nCompany: Tech Corp..."

**Message 9: Return Raw OCR Text**
- From: OCR Engine
- To: Mobile App
- Content: Extracted text blob and confidence metadata
- Metadata includes: Per-word confidence scores, bounding box information

**Message 10: Send Text to AI Model**
- From: Mobile App
- To: AI Model Service
- Method: HTTP POST REST API call
- Payload: {"raw_text": "...", "model_version": "v2.1", "language": "en"}
- Endpoint: `/api/v1/ai/structure-contact`

**Message 11: AI Data Extraction & Validation**
- From: AI Model Service
- To: AI Model Service
- Content: Internal ML processing - parsing, entity recognition, field extraction
- Sub-processes:
  - Named Entity Recognition to identify name components
  - Email pattern matching and validation
  - Phone number parsing and normalization
  - Company name extraction
  - Job title classification
  - Address parsing

**Message 12: Return Structured Contact Data**
- From: AI Model Service
- To: Mobile App
- Content: Structured JSON object with extracted fields
- Data: {"firstName": "John", "lastName": "Smith", "email": "john@company.com", "phone": "+1-555-0123", "company": "Tech Corp", "jobTitle": "Senior Developer", "confidence_scores": {"email": 0.98, "phone": 0.95, ...}}

**Message 13: Display Extracted Fields for Review**
- From: Mobile App
- To: End User
- Content: Show extracted contact fields in editable form on screen
- User sees: Each field with confidence indicators (color-coded: green=high confidence, yellow=medium, red=low)

**Message 14: User Reviews & Approves Data**
- From: End User
- To: Mobile App
- Content: "Edit fields as needed, then click Confirm"
- Actions: User may correct fields, add missing info, or approve as-is

**Message 15: Send Final Verified Contact to Web Server**
- From: Mobile App
- To: Web Server API
- Method: HTTP POST
- Endpoint: `/api/v1/contacts/create`
- Payload: {"firstName": "John", "lastName": "Smith", "email": "john@company.com", "phone": "+1-555-0123", "company": "Tech Corp", "jobTitle": "Senior Developer", "source": "mobile_scan", "extractedAt": "2026-04-04T10:30:00Z"}
- Authentication: JWT token in Authorization header

**Message 16: Validate Contact Data**
- From: Web Server API
- To: Web Server API
- Content: Server-side validation - check required fields, validate email format, normalize phone, check for duplicates
- Type: Self-message

**Message 17: Save Contact to Database**
- From: Web Server API
- To: Contact Database
- Method: SQL INSERT query or ORM .save() method
- Data: Complete contact record with metadata
- Returns: Generated contact ID (UUID)

**Message 18: Confirm Save Success**
- From: Contact Database
- To: Web Server API
- Content: "Contact saved successfully with ID: {uuid}"
- Status: 200 OK with contact object

**Message 19: Return Success Response**
- From: Web Server API
- To: Mobile App
- Content: JSON response {"success": true, "contactId": "abc-123-def", "message": "Contact saved"}
- HTTP Status: 201 Created

**Message 20: Display Success Confirmation**
- From: Mobile App
- To: End User
- Content: "Contact saved successfully!" message with options
- Options offered: [Scan Another Card], [View Saved Contact], [Share], [Home]

### Message Numbering & Sequence
All 20 messages are numbered in order of execution. Key points:
- Messages 1-5: User interaction and mobile app setup
- Messages 6-9: Image transmission and OCR processing
- Messages 10-12: AI model structuring
- Messages 13-14: User review (back-and-forth may occur)
- Messages 15-20: Data transmission to backend and database storage

### Data Flow Annotations
- Image size: typically 2-5 MB for high-quality photos
- OCR processing time: 1-3 seconds
- AI processing time: 0.5-1 second
- Database save time: <100ms
- Round-trip latency including network: 2-5 seconds total

### Error Handling Paths (Alternative Flows)
- If camera permission denied → Return error to user
- If OCR confidence too low → Request user to retake photo
- If AI validation fails → Show manual entry form
- If database save fails → Retry mechanism with exponential backoff
- If network timeout → Queue for offline sync when connection restored

---

## INTERACTION DIAGRAM 2: EMAIL CAMPAIGN EXECUTION

### Overview
This diagram shows how the email campaign system components interact to create, prepare, send, and track email messages. It demonstrates both synchronous API calls and asynchronous event processing.

### Components/Participants
1. **Admin User** - The person creating and managing campaigns
2. **Campaign Dashboard** - Frontend web interface for campaign creation
3. **Campaign Service** - Backend service managing campaign lifecycle
4. **Email Template Engine** - Renders email templates with personalization
5. **SMTP Provider** - Third-party email sending service (e.g., SendGrid, AWS SES)
6. **Email Queue Manager** - Manages batched email dispatch
7. **Tracking Service** - Monitors opens and clicks
8. **Analytics Database** - Stores campaign metrics and engagement data

### Detailed Message Flow

**Message 1: Create Campaign**
- From: Admin User
- To: Campaign Dashboard
- Content: Enter campaign name, subject, select recipients, compose email
- Data: Form submission with campaign details

**Message 2: Submit Campaign Data**
- From: Campaign Dashboard
- To: Campaign Service
- Method: HTTP POST
- Endpoint: `/api/v1/campaigns/create`
- Payload: Campaign object with recipients, subject, body template, send preferences

**Message 3: Validate Recipients**
- From: Campaign Service
- To: Campaign Service
- Content: Verify recipient list - check contact validity, remove duplicates, validate email addresses
- Type: Self-message

**Message 4: Query Recipient Contacts**
- From: Campaign Service
- To: Contact Database (implied)
- Content: Fetch full contact details for all recipients
- Returns: Contact records with email addresses and personalization fields

**Message 5: Fetch Email Template**
- From: Campaign Service
- To: Email Template Engine
- Content: Load template for campaign (e.g., "business_outreach_v2")
- Returns: Template HTML/text with merge field placeholders

**Message 6: Prepare Emails**
- From: Email Template Engine
- To: Email Template Engine
- Content: For each recipient, substitute merge fields with actual values
  - {{FirstName}} → "John"
  - {{Company}} → "Tech Corp"
  - {{MeetingLink}} → personal calendar link
- Creates personalized email for each recipient

**Message 7: Add Tracking Elements**
- From: Campaign Service
- To: Tracking Service
- Content: "Generate tracking pixels and URLs for this campaign"
- Returns: Unique tracking pixel code and unique tracking URLs for each link

**Message 8: Configure Tracking**
- From: Campaign Service
- To: Campaign Service
- Content: Embed tracking pixel and URLs into personalized emails
- Sub-task: Add unsubscribe link, preference center link

**Message 9: Add Compliance Elements**
- From: Campaign Service
- To: Campaign Service
- Content: Add CAN-SPAM compliant elements - company address, unsubscribe option, opt-out preferences
- Type: Self-message

**Message 10: Queue Emails for Sending**
- From: Campaign Service
- To: Email Queue Manager
- Content: Submit batch of prepared, personalized emails to send queue
- Payload: Array of email objects with recipient, subject, content, tracking IDs

**Message 11: Acknowledge Queue Receipt**
- From: Email Queue Manager
- To: Campaign Service
- Content: "Batch queued successfully, processing_id: {id}"
- Returns: Queue status and processing ID

**Message 12: Update Campaign Status**
- From: Campaign Service
- To: Analytics Database
- Content: Update campaign record - status = "QUEUED", queued_at = timestamp, recipient_count
- Type: Database write operation

**Message 13: Begin Batch Processing**
- From: Email Queue Manager
- To: Email Queue Manager
- Content: Pick batch from queue, segment into smaller batches (e.g., 100 emails per batch)
- Type: Self-message, internal queue processing

**Message 14: Send Batch to SMTP Provider**
- From: Email Queue Manager
- To: SMTP Provider
- Method: HTTP POST to SMTP API
- Endpoint: `/messages/send-batch`
- Payload: Array of emails with authentication token
- Batch size: Typically 100-500 emails per request

**Message 15: SMTP Processing**
- From: SMTP Provider
- To: SMTP Provider
- Content: Validate emails, apply virus scanning, check spam filters, queue to mail servers
- Type: Self-message, third-party processing

**Message 16: Return Send Status**
- From: SMTP Provider
- To: Email Queue Manager
- Content: Response with status for each email - "sent", "queued", "failed" with error codes
- Example: [{"email": "john@company.com", "status": "sent", "message_id": "sg-123456"}, ...]

**Message 17: Log Send Attempts**
- From: Email Queue Manager
- To: Analytics Database
- Content: Record send attempt results - timestamp, recipient, status, error details
- Type: Insert records into tracking database

**Message 18: Update Campaign Statistics**
- From: Email Queue Manager
- To: Analytics Database
- Content: Increment sent count, failed count, update delivery status
- Type: Database update

**Message 19: Monitor Open Events (Asynchronous)**
- From: SMTP Provider (webhook callback)
- To: Tracking Service
- Content: When recipient opens email, tracking pixel is loaded
- Trigger: Pixel load event (1x1 GIF with unique ID)
- Data: {"campaign_id": "...", "recipient_id": "...", "timestamp": "...", "ip": "...", "user_agent": "..."}

**Message 20: Monitor Click Events (Asynchronous)**
- From: Recipient Email Client (when link clicked)
- To: Tracking Service
- Content: User clicks tracked link, redirect through tracking endpoint
- Data: {"campaign_id": "...", "recipient_id": "...", "link_id": "...", "timestamp": "..."}

**Message 21: Record Open Event**
- From: Tracking Service
- To: Analytics Database
- Content: Store open event with timestamp, user location if available
- Type: Insert into opens table

**Message 22: Record Click Event**
- From: Tracking Service
- To: Analytics Database
- Content: Store click event with link identifier, timestamp
- Type: Insert into clicks table

**Message 23: Calculate Campaign Metrics**
- From: Tracking Service
- To: Analytics Database
- Content: Query opens and clicks, calculate metrics:
  - Total sent: X
  - Delivered: Y
  - Bounced: Z
  - Open rate: Y/(X-Z)%
  - Click rate: clicks/opens%
  - Unique opens vs. total opens
- Returns: Calculated metrics

**Message 24: Display Metrics to Admin**
- From: Analytics Database
- To: Campaign Dashboard
- Content: Real-time campaign metrics and statistics
- Updates: Refreshed every few seconds via WebSocket or polling

**Message 25: Admin Views Campaign Report**
- From: Campaign Dashboard
- To: Admin User
- Content: Display campaign dashboard with graphs, metrics, engagement trends
- Visualizations: Line charts for opens over time, map for geographic distribution, list of top clickers

### Campaign Lifecycle Status Progression
- Created → Queued → Sending → Sent → Archived
- Each status change is logged with timestamp
- Admins can pause/resume campaigns while Queued or Sending

---

## INTERACTION DIAGRAM 3: CRM INTEGRATION SYNCHRONIZATION

### Overview
This diagram illustrates the interaction between IntelliScan and external CRM systems during contact synchronization. It shows API authentication, data mapping, batch processing, and error handling.

### Components/Participants
1. **Admin User** - Initiates sync operation
2. **Admin Dashboard** - Interface for managing integrations
3. **CRM Sync Service** - Orchestrates sync process
4. **Authentication Service** - Handles OAuth tokens
5. **CRM Provider API** - External CRM system (Salesforce, HubSpot, etc.)
6. **IntelliScan Database** - Local contact data store
7. **Field Mapper** - Maps IntelliScan fields to CRM fields
8. **Error Handler** - Manages sync failures and retries

### Detailed Message Flow

**Message 1: Initiate Sync**
- From: Admin User
- To: Admin Dashboard
- Content: Click "Sync with CRM" button
- Action: User confirms CRM sync from dashboard

**Message 2: Request Sync Start**
- From: Admin Dashboard
- To: CRM Sync Service
- Method: HTTP POST
- Endpoint: `/api/v1/integrations/crm/sync`
- Payload: {"crm_id": "salesforce-prod", "sync_direction": "push_only"}

**Message 3: Validate Configuration**
- From: CRM Sync Service
- To: CRM Sync Service
- Content: Check CRM configuration exists, has valid API credentials, sync parameters valid
- Type: Self-message, validation

**Message 4: Request OAuth Token**
- From: CRM Sync Service
- To: Authentication Service
- Content: "Get fresh OAuth token for Salesforce"
- Payload: {"crm_provider": "salesforce", "client_id": "...", "client_secret": "..."}

**Message 5: Validate Credentials**
- From: Authentication Service
- To: Authentication Service
- Content: Verify stored credentials are valid
- Type: Self-message

**Message 6: Request Token from CRM Provider**
- From: Authentication Service
- To: CRM Provider API
- Method: HTTP POST to OAuth endpoint
- Endpoint: `/oauth/token`
- Payload: Client credentials and scope permissions
- Returns: access_token with expiration time

**Message 7: Return OAuth Token**
- From: CRM Provider API
- To: Authentication Service
- Content: {"access_token": "...", "token_type": "Bearer", "expires_in": 3600}

**Message 8: Cache Token Locally**
- From: Authentication Service
- To: Authentication Service
- Content: Store token in memory with TTL, set refresh timer
- Type: Self-message

**Message 9: Send Token to Sync Service**
- From: Authentication Service
- To: CRM Sync Service
- Content: OAuth token ready for API requests

**Message 10: Query IntelliScan for New Contacts**
- From: CRM Sync Service
- To: IntelliScan Database
- Method: SQL query or ORM query
- Content: SELECT contacts WHERE modified_at > last_sync_timestamp
- Returns: Contact records modified since last successful sync

**Message 11: Return Contact List**
- From: IntelliScan Database
- To: CRM Sync Service
- Content: Array of contact objects to be synced
- Data: Typically 50-1000 contacts depending on update frequency

**Message 12: Load Field Mappings**
- From: CRM Sync Service
- To: Field Mapper
- Content: "Get field mappings for Salesforce"
- Returns: Mapping configuration - {"intelliscan_firstName": "FirstName__c", "intelliscan_email": "Email", ...}

**Message 13: Transform Contacts**
- From: Field Mapper
- To: Field Mapper
- Content: For each IntelliScan contact, transform to CRM format
  - Map field names according to configuration
  - Convert data types as needed
  - Apply formatting rules (phone number formatting, date format, etc.)
- Type: Self-message

**Message 14: Return Transformed Contacts**
- From: Field Mapper
- To: CRM Sync Service
- Content: Contacts in CRM-compatible format
- Example: {"FirstName": "John", "LastName": "Smith", "Email": "john@company.com",...}

**Message 15: Segment into Batches**
- From: CRM Sync Service
- To: CRM Sync Service
- Content: Split contacts into manageable batches (e.g., 100 per batch)
- Type: Self-message

**Message 16: Push Batch to CRM API**
- From: CRM Sync Service
- To: CRM Provider API
- Method: HTTP POST (or PATCH for updates)
- Endpoint: `/services/data/v57.0/composite/sobjects`
- Headers: Authorization: Bearer {oauth_token}
- Payload: Batch of contacts in JSON format
- Records per batch: 25-200 depending on CRM

**Message 17: Validate Batch in CRM**
- From: CRM Provider API
- To: CRM Provider API
- Content: Validate each record against CRM schema, required fields, data types
- Type: Self-message

**Message 18: Process Contacts in CRM**
- From: CRM Provider API
- To: CRM Provider API
- Content: Create new contacts or update existing contacts
- Type: Self-message, CRM operations

**Message 19: Return Sync Result**
- From: CRM Provider API
- To: CRM Sync Service
- Content: Sync result array with status for each contact
- Example: [{"id": "...", "status": "success", "crm_id": "0011...", "errors": []}, {"id": "...", "status": "error", "error_code": "REQUIRED_FIELD_MISSING", "error_message": "Email is required"}]

**Message 20: Parse Sync Response**
- From: CRM Sync Service
- To: CRM Sync Service
- Content: Analyze response, separate successful from failed syncs, extract error details
- Type: Self-message

**Message 21: Update Database with Sync Status**
- From: CRM Sync Service
- To: IntelliScan Database
- Content: For each contact:
  - If success: Set crm_synced=true, crm_contact_id={id}, last_sync_timestamp=now()
  - If error: Store error_code, error_message for admin review
- Type: Database update operations

**Message 22: Log Failed Syncs**
- From: CRM Sync Service
- To: Error Handler
- Content: Failed contact IDs and error details for retry queue
- Data: {"contact_id": "...", "error": "...", "retry_count": 0, "created_at": "..."}

**Message 23: Notify Admin of Sync Start**
- From: CRM Sync Service
- To: Admin Dashboard
- Content: WebSocket message or Server-Sent Event: "Sync in progress..."
- Update: Progress indicator starts

**Message 24: Update Sync Progress**
- From: CRM Sync Service
- To: Admin Dashboard
- Content: Real-time progress updates {"processed": 150, "total": 1000, "success": 148, "failed": 2}
- Frequency: Every batch completion

**Message 25: Compile Final Report**
- From: CRM Sync Service
- To: CRM Sync Service
- Content: Calculate final statistics:
  - Total contacts: X
  - Successfully synced: Y
  - Failed: Z
  - Success rate: Y/X%
  - Sync duration
  - Timestamps
- Type: Self-message

**Message 26: Send Completion Notification**
- From: CRM Sync Service
- To: Admin Dashboard
- Content: Sync completed with summary
- Data: {"status": "completed", "total": 1000, "success": 998, "failed": 2, "duration_seconds": 45}

**Message 27: Display Sync Report**
- From: Admin Dashboard
- To: Admin User
- Content: Show sync summary and detailed report
- Options: [View Failed Contacts], [Retry Failed], [Export Report], [Schedule Next Sync]

### Error Handling Flows
- Token expired → Re-request fresh token
- API rate limit exceeded → Backoff and retry
- Network timeout → Queue for retry after delay
- Validation error → Log with contact details for manual review
- Partial batch failure → Continue with next batch, retry failed records later

---

## INTERACTION DIAGRAM 4: TEAM COLLABORATION & ACCESS CONTROL

### Overview
This diagram shows interactions when an admin invites a team member, assigns permissions, and controls access to shared contacts and features.

### Components/Participants
1. **Admin User** - Team manager/workspace admin
2. **Team Dashboard** - Admin interface for team management
3. **Team Management Service** - Backend service for team operations
4. **Permission Service** - Manages role-based access control (RBAC)
5. **User Service** - Manages user accounts and profiles
6. **Email Service** - Sends notifications
7. **Audit Service** - Logs all team/permission changes
8. **Access Control Middleware** - Enforces permissions at runtime

### Detailed Message Flow

**Message 1: Admin Opens Team Management**
- From: Admin User
- To: Team Dashboard
- Content: Navigate to Team Members section
- Action: Click "Manage Team" or "Invite Member"

**Message 2: Request Team Member Invite Form**
- From: Team Dashboard
- To: Team Management Service
- Method: HTTP GET
- Endpoint: `/api/v1/team/invite-form`
- Returns: Form with available roles and permissions

**Message 3: Admin Enters Invite Details**
- From: Admin User
- To: Team Dashboard
- Content: Enter email address, select role (Viewer, Editor, Manager, Admin)
- Data: {"email": "newmember@company.com", "role": "Editor"}

**Message 4: Submit Invite Request**
- From: Team Dashboard
- To: Team Management Service
- Method: HTTP POST
- Endpoint: `/api/v1/team/invite-member`
- Payload: Invite details with email and role
- Headers: Authentication token for admin

**Message 5: Validate Invite Details**
- From: Team Management Service
- To: Team Management Service
- Content: Validate email format, check if user already exists, verify role is valid
- Type: Self-message

**Message 6: Check Existing User**
- From: Team Management Service
- To: User Service
- Method: HTTP GET
- Endpoint: `/api/v1/users/check-email/{email}`
- Returns: User exists or not found

**Message 7: User Not Found Response**
- From: User Service
- To: Team Management Service
- Content: User does not exist yet, can invite as new user

**Message 8: Create Pending Invitation**
- From: Team Management Service
- To:Team Management Service
- Content: Generate unique invitation token, set expiration (7 days)
- Type: Self-message

**Message 9: Store Invitation in Database**
- From: Team Management Service
- To: Invitation Database
- Method: INSERT
- Data: {"invitation_token": "...", "email": "...", "role": "...", "created_by": "...", "workspace_id": "...", "expires_at": "...", "status": "pending"}

**Message 10: Return Invitation ID**
- From: Invitation Database
- To: Team Management Service
- Content: Insertion successful, invitation_id generated

**Message 11: Generate Invitation Email**
- From: Team Management Service
- To: Email Service
- Content: "Send invitation email to newmember@company.com"
- Payload: {"recipient": "newmember@company.com", "invitation_link": "https://intelliscan.com/join?token=...", "inviter": "Admin Name", "workspace": "Workspace Name", "role": "Editor"}

**Message 12: Send Invitation Email**
- From: Email Service
- To: Email Service
- Content: Format email with branding, invitation link, role details
- Type: Self-message

**Message 13: Email Dispatch**
- From: Email Service
- To: SMTP Provider
- Method: HTTP POST
- Endpoint: `/send`
- Content: Complete email with invitation link
- Returns: Send status

**Message 14: Email Delivered**
- From: SMTP Provider
- To: Email Service
- Content: {"status": "queued", "message_id": "..."} or {"status": "delivered"}

**Message 15: Notify Admin of Invite Sent**
- From: Team Management Service
- To: Team Dashboard
- Content: "Invitation sent successfully to newmember@company.com"
- Status update: Invitation entry marked as "sent"

**Message 16: Update Team View**
- From: Team Dashboard
- To: Admin User
- Content: Add new team member entry to pending invitations list
- Show: Email, role, sent date, resend option

**Message 17: Log Invitation Activity**
- From: Team Management Service
- To: Audit Service
- Content: Log team member invitation event
- Data: {"action": "invite_team_member", "email": "newmember@company.com", "role": "Editor", "inviter_id": "...", "timestamp": "..."}

**Message 18: Pending Member Receives Email**
- From: SMTP Provider
- To: Pending Member Email
- Content: Email with acceptance link
- Action: Member receives notification

**Message 19: Member Clicks Invitation Link**
- From: Pending Member
- To: Team Dashboard Sign-up
- Content: Click link from email
- URL: "https://intelliscan.com/join?token={invitation_token}"

**Message 20: Verify Invitation Token**
- From: Sign-up Service
- To: Invitation Database
- Content: Validate token - check if valid, not expired, not already used
- Query: SELECT invitations WHERE token={token} AND expires_at > NOW() AND status='pending'

**Message 21: Token Valid Response**
- From: Invitation Database
- To: Sign-up Service
- Content: Token is valid, return associated email and role

**Message 22: Display Signup Form**
- From: Sign-up Service
- To: Pending Member
- Content: Show signup form with email pre-filled, password field, accept terms
- Fields: Email (read-only), Password, Confirm Password, Accept Terms (checkbox)

**Message 23: Member Submits Signup**
- From: Pending Member
- To: Sign-up Service
- Content: Enter password and accept terms
- Data: {"email": "newmember@company.com", "password": "...", "accept_terms": true}

**Message 24: Hash Password**
- From: Sign-up Service
- To: Sign-up Service
- Content: Securely hash password using bcrypt
- Type: Self-message

**Message 25: Create User Account**
- From: Sign-up Service
- To: User Service
- Method: HTTP POST
- Endpoint: `/api/v1/users/create`
- Payload: {"email": "...", "password_hash": "...", "workspace_id": "..."}

**Message 26: Store User in Database**
- From: User Service
- To: User Database
- Method: INSERT
- Data: New user record with email, hashed password, created timestamp, active=true

**Message 27: Return New User ID**
- From: User Database
- To: User Service
- Content: {"user_id": "uuid", "email": "newmember@company.com"}

**Message 28: Assign Role to User**
- From: Team Management Service
- To: Permission Service
- Content: "Assign Editor role to user in workspace"
- Payload: {"user_id": "...", "workspace_id": "...", "role": "Editor"}

**Message 29: Create Permission Record**
- From: Permission Service
- To: Permission Database
- Method: INSERT
- Data: {"user_id": "...", "workspace_id": "...", "role": "Editor", "created_at": "..."}
- Permissions granted: read contacts, create contacts, edit own contacts, view team contacts (based on role)

**Message 30: Permission Assignment Complete**
- From: Permission Database
- To: Permission Service
- Content: Role successfully assigned

**Message 31: Mark Invitation as Used**
- From: Team Management Service
- To: Invitation Database
- Method: UPDATE
- Content: Set invitation status='used', used_at=NOW()

**Message 32: Send Welcome Email**
- From: User Service
- To: Email Service
- Content: "Send welcome email with login instructions"
- Payload: {"recipient": "newmember@company.com", "workspace": "Workspace Name", "login_url": "https://intelliscan.com/login"}

**Message 33: Welcome Email Sent**
- From: Email Service
- To: SMTP Provider
- Method: Send welcome message

**Message 34: Notify Admin of Member Accepted**
- From: Team Management Service
- To: Team Dashboard
- Content: "newmember@company.com has accepted invitation and is now active"
- Update: Move from pending to active members list

**Message 35: Log Member Activation**
- From: Team Management Service
- To: Audit Service
- Content: Log team member activation event
- Data: {"action": "team_member_activated", "email": "newmember@company.com", "role": "Editor", "timestamp": "..."}

**Message 36: New Member Logs In**
- From: New Member
- To: Login Service
- Content: Enter email and password
- Returns: JWT token if credentials valid

**Message 37: Access Control Check**
- From: Access Control Middleware
- To: Permission Service
- Content: Check if user has permission for requested resource
- Example: "Can this user access /contacts/view?"

**Message 38: Check User Permissions**
- From: Permission Service
- To: Permission Database
- Method: SELECT
- Content: Retrieve user's role and associated permissions
- Returns: Permissions list based on role

**Message 39: Grant or Deny Access**
- From: Access Control Middleware
- To: Middleware Response
- Content: If user has required permission, allow request; otherwise deny with 403 Forbidden

**Message 40: Admin Views Updated Team**
- From: Team Dashboard
- To: Admin User
- Content: Show updated team member list with new active member
- Display: Name, email, role, joined date, last activity, assigned contacts count

### Access Control Model
- **Viewer role**: Can view contacts, view reports, read-only access
- **Editor role**: Can view, create, edit contacts, view team contacts
- **Manager role**: Can manage contacts, assign to team, view team metrics
- **Admin role**: Full access including team management, settings, billing
- Permissions enforced at API gateway level for all requests
- Contact-level permissions: Users see only contacts assigned to them or entire team depending on role

