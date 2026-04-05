# SEQUENCE DIAGRAM PROMPT FOR DRAW.IO

Create comprehensive UML Sequence Diagrams for IntelliScan showing detailed message interactions and temporal ordering between system actors and components.

## SEQUENCE DIAGRAM 1: COMPLETE BUSINESS CARD SCANNING WORKFLOW

### Overview
This sequence diagram illustrates the complete timeline and message exchanges from when an end user decides to scan a business card through the final confirmation of successful save. It shows all interactions in time order with activation boxes and return messages.

### Actors/Participants (8 Total)
1. **End User** - Person performing the scan
2. **Mobile App** - React/React Native frontend
3. **Device Camera/Storage** - Native OS Camera API or file system
4. **Image Processing Queue** - Server-side image handler
5. **OCR Service** - Tesseract or Cloud Vision API
6. **AI Validation Engine** - Machine learning service
7. **REST API Server** - Node.js/Express backend
8. **Contact Database** - PostgreSQL/MongoDB

### Timeline & Message Sequence

**Frame 1-5: User Initiation (0-2 seconds)**

**Message 1: User Clicks Scan Button**
- From: End User
- To: Mobile App
- Type: Synchronous user action
- Content: Touch/click on "Scan Business Card" button
- App shows: Loading spinner, "Preparing camera..."

**Message 2: Mobile App Requests Camera Permission**
- From: Mobile App
- To: Device Camera/Storage
- Type: Asynchronous system call
- Content: `navigator.mediaDevices.getUserMedia({video: {facingMode: "camera"}})`
- Time: ~100ms

**Message 3: Device Grants/Denies Permission**
- From: Device Camera/Storage
- To: Mobile App
- Type: Asynchronous return
- Content: Permission granted OR denied based on OS settings
- If denied: Display error dialog "Camera permission required"

**Message 4: Camera Preview Activated**
- From: Device Camera/Storage
- To: Mobile App
- Type: Callback/event
- Content: Camera stream started, preview visible on screen
- User sees: Real-time camera preview with framing guides

**Message 5: App Displays Camera Interface**
- From: Mobile App
- To: End User
- Type: UI update (not a message, but shown for completeness)
- Content: "Position your business card in the frame, then tap the capture button"

**Frame 6-10: Card Capture (2-5 seconds)**

**Message 6: User Captures Card Image**
- From: End User
- To: Mobile App
- Type: User action
- Content: Tap "Capture" button when card is in frame
- App shows: Photo preview with "Confirm Photo" and "Retake" options

**Message 7: Card Image Loaded in Memory**
- From: Mobile App
- To: Mobile App
- Type: Self-call/internal processing
- Content: Load image file into app memory, create blob
- Processing time: ~200ms
- Data size: 2-5 MB (JPEG compressed)

**Message 8: Compress Image for Transmission**
- From: Mobile App
- To: Mobile App
- Type: Self-processing
- Content: Reduce image resolution/quality to ~1 MB for faster transmission
- Algorithm: JPEG compression, resize to 1920x1080 max

**Message 9: Display Image Preview to User**
- From: Mobile App
- To: End User
- Type: UI display
- Content: "Please review the capture and confirm above"

**Message 10: User Confirms Image**
- From: End User
- To: Mobile App
- Type: User action
- Content: Tap "Use This Photo" button
- App shows: Loading indicator "Extracting information..."

**Frame 11-20: OCR Processing (5-15 seconds)**

**Message 11: Mobile App Sends Image to Image Processor**
- From: Mobile App
- To: Image Processing Queue
- Type: HTTP POST (asynchronous background)
- Endpoint: `POST /api/v1/processing/extract-from-image`
- Headers: 
  - `Authorization: Bearer {jwt_token}`
  - `Content-Type: multipart/form-data`
- Payload: 
  - Image file (binary)
  - Metadata: {timestamp: "2026-04-04T10:30:00Z", deviceType: "iOS", appVersion: "2.1.0"}
- Network time: ~1-3 seconds (depending on network speed and image size)
- Activation box starts on Image Processing Queue

**Message 12: Image Processing Queue Acknowledges Receipt**
- From: Image Processing Queue
- To: Mobile App
- Type: Synchronous HTTP 202 Accepted
- Content: {"processing_id": "proc-abc123", "status": "queued", "estimated_wait": "5 seconds"}
- App shows: "Processing your card... please wait" with progress indicator

**Message 13: Image Processing Queue Processes Image**
- From: Image Processing Queue
- To: Image Processing Queue
- Type: Self-call
- Content: 
  - Image validation (check if image is readable, proper orientation)
  - Image enhancement (contrast adjustment, rotation, cropping to card boundary)
  - Noise reduction
- Processing time: 1-2 seconds
- Activation continues on Image Processing Queue

**Message 14: Send Processed Image to OCR Service**
- From: Image Processing Queue
- To: OCR Service
- Type: Direct service call (or HTTP POST if microservice)
- Content: Optimized image data
- Method: RPC or `POST /ocr/process` with binary image payload
- Time: <100ms

**Message 15: OCR Service Processes Image**
- From: OCR Service
- To: OCR Service
- Type: Self-processing
- Content: 
  - Feed image to Tesseract (or Google Vision API)
  - Character recognition on all regions of image
  - Text layout analysis (grouping text by spatial proximity)
  - Bounding box computation for each detected word
- Processing time: 2-4 seconds (varies by model)
- Activation box on OCR Service

**Message 16: OCR Returns Raw Text with Metadata**
- From: OCR Service
- To: Image Processing Queue
- Type: Synchronous return
- Content: 
  ```json
  {
    "raw_text": "John Smith\nSenior Developer\njohn.smith@techcorp.com\n(555) 123-4567\nTech Corp\n123 Tech Street\nSan Francisco, CA 94102",
    "confidence": 0.85,
    "word_confidence_scores": {...},
    "bounding_boxes": {...},
    "detected_language": "en"
  }
  ```
- Confidence: 0.85 (overall OCR confidence)

**Message 17: Image Processing Queue Sends to AI Engine**
- From: Image Processing Queue
- To: AI Validation Engine
- Type: HTTP POST to REST API
- Endpoint: `POST /api/v1/ai/structure-contact`
- Headers: 
  - `Authorization: Bearer {service_token}`
  - `Content-Type: application/json`
- Payload: 
  ```json
  {
    "raw_text": "...",
    "ocr_confidence": 0.85,
    "card_category": "business_card",
    "language": "en",
    "request_id": "req-12345"
  }
  ```
- Network time: ~500ms
- Activation box starts on AI Validation Engine

**Message 18: AI Engine Processes Text**
- From: AI Validation Engine
- To: AI Validation Engine
- Type: Self-processing
- Content:
  - **Named Entity Recognition (NER)**: Identify person name, company, title
  - **Pattern Matching**: Detect emails using regex, phone numbers, URLs
  - **Field Extraction**: Parse company, location, department
  - **Confidence Scoring**: ML model assigns confidence 0-1 to each field
  - **Validation Rules**: Check email format validity, phone number format standardization
- Processing time: 1-2 seconds (model inference)
- Models used: Custom-trained BERT/RoBERTa for NER, rule-based for contact detection
- Activation continues

**Message 19: AI Engine Returns Structured Contact**
- From: AI Validation Engine
- To: Image Processing Queue
- Type: Synchronous return
- Content:
  ```json
  {
    "contact": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@techcorp.com",
      "phone": "+1-555-123-4567",
      "company": "Tech Corp",
      "jobTitle": "Senior Developer",
      "address": "123 Tech Street, San Francisco, CA 94102"
    },
    "confidence_scores": {
      "firstName": 0.98,
      "lastName": 0.97,
      "email": 0.96,
      "phone": 0.94,
      "company": 0.91,
      "jobTitle": 0.89,
      "address": 0.72
    },
    "extraction_quality": "high"
  }
  ```

**Message 20: Image Processing Queue Sends Result to Mobile App**
- From: Image Processing Queue
- To: Mobile App
- Type: HTTP POST callback or WebSocket message OR polling response
- Content: Structured contact with confidence scores
- Delivery method: Webhook callback (preferred) or Mobile app polling every 1 second

**Frame 21-30: User Review & Approval (15-25 seconds)**

**Message 21: Mobile App Receives Extraction Results**
- From: Image Processing Queue
- To: Mobile App
- Type: Network delivery
- Content: Complete structured contact object
- App processes: Store data locally, prepare UI for display
- Activation ends on Image Processing Queue

**Message 22: Mobile App Displays Extracted Data to User**
- From: Mobile App
- To: End User
- Type: UI update
- Content: Present extracted contact fields in editable form
- UI shows:
  - Each field (firstName, lastName, email, phone, company, jobTitle, address)
  - Confidence indicator (green circle for >90%, yellow for 70-90%, red for <70%)
  - Edit button on each field
  - "Confirm & Save" button
  - "Retake Photo" button
- User sees: "Please review the extracted information and make corrections if needed"

**Message 23: User Reviews Extracted Data**
- From: End User
- To: Mobile App
- Type: User review/reading
- Content: User reads through each field, checks accuracy
- Processing time: 10-20 seconds (typical user review time)
- No app message sent yet

**Message 24: User Corrects Email Field** (Example of optional edit)
- From: End User
- To: Mobile App
- Type: Optional user action (not all users perform)
- Content: User notices email is "john.smith@techcorp.com" but should be "john.smith@techcorp.io"
- App shows: Text field with keyboard, inline error checking

**Message 25: User Confirms Corrected Data**
- From: End User
- To: Mobile App
- Type: User action
- Content: Tap "Confirm & Save" button after reviewing all fields
- App shows: "Saving contact..."
- Final contact object: Same as extracted, with user corrections applied

**Message 26: Mobile App Prepares Final Contact Object**
- From: Mobile App
- To: Mobile App
- Type: Self-processing
- Content:
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@techcorp.io",  // corrected
    "phone": "+1-555-123-4567",
    "company": "Tech Corp",
    "jobTitle": "Senior Developer",
    "address": "123 Tech Street, San Francisco, CA 94102",
    "source": "mobile_camera_scan",
    "deviceId": "device-123",
    "scannedAt": "2026-04-04T10:30:25Z",
    "extractedAt": "2026-04-04T10:30:32Z"
  }
  ```
- Processing time: <100ms

**Frame 27-35: Save to Backend (25-35 seconds)**

**Message 27: Mobile App Sends Final Contact to API**
- From: Mobile App
- To: REST API Server
- Type: HTTP POST
- Endpoint: `POST /api/v1/contacts/create`
- Method: Request
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Content-Type: application/json`
  - `X-Request-ID: req-unique-id`
- Body: Final contact object (JSON)
- Network time: ~1-2 seconds
- Activation box starts on REST API Server

**Message 28: REST API Validates Contact Data**
- From: REST API Server
- To: REST API Server
- Type: Self-validation
- Content:
  - Validate all required fields present
  - Validate email format: `john.smith@techcorp.io` matches email regex
  - Validate phone format: Normalize to E.164 format
  - Check for duplicate contacts (by email and phone)
  - Check data length limits
  - Sanitize inputs (prevent SQL injection, XSS)
- Processing time: <100ms
- Validation result: PASS (all checks successful) OR FAIL (return 400 Bad Request)

**Message 29: REST API Saves Contact to Database**
- From: REST API Server
- To: Contact Database
- Type: Database operation (SQL INSERT or document insert)
- Method: INSERT INTO contacts (...) VALUES (...)
- SQL/Query:
  ```sql
  INSERT INTO contacts (
    id, user_id, first_name, last_name, email, phone, company, job_title, 
    address, source, scanned_at, created_at, updated_at
  ) VALUES (
    'contact-uuid', 'user-uuid', 'John', 'Smith', 'john.smith@techcorp.io',
    '+15551234567', 'Tech Corp', 'Senior Developer',
    '123 Tech Street, San Francisco, CA 94102', 'mobile_camera_scan',
    '2026-04-04T10:30:25Z', NOW(), NOW()
  )
  ```
- Database processing time: ~50ms
- Transaction handling: ACID transaction guaranteed
- Activation continues on Database

**Message 30: Database Returns Generated ID**
- From: Contact Database
- To: REST API Server
- Type: Synchronous return
- Content:
  ```json
  {
    "id": "contact-550e8400-e29b-41d4-a716-446655440000",
    "created": true,
    "timestamp": "2026-04-04T10:30:33Z"
  }
  ```
- Activation ends on Database

**Message 31: REST API Returns Success Response**
- From: REST API Server
- To: Mobile App
- Type: HTTP 201 Created response
- Status Code: 201
- Headers:
  - `Location: /api/v1/contacts/contact-550e8400...`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "success": true,
    "message": "Contact saved successfully",
    "contact": {
      "id": "contact-550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@techcorp.io",
      "phone": "+1-555-123-4567",
      "company": "Tech Corp",
      "jobTitle": "Senior Developer",
      "address": "123 Tech Street, San Francisco, CA 94102",
      "createdAt": "2026-04-04T10:30:33Z"
    },
    "timestamp": "2026-04-04T10:30:33Z"
  }
  ```
- Network time: ~1-2 seconds
- Activation ends on REST API Server

**Frame 32-35: Final UI Display (35-40 seconds)**

**Message 32: Mobile App Receives Success Response**
- From: REST API Server
- To: Mobile App
- Type: HTTP response received
- Processing: App parses JSON, caches new contact info locally, notifies local storage

**Message 33: Mobile App Displays Success Confirmation**
- From: Mobile App
- To: End User
- Type: UI display
- Content: "✓ Contact saved successfully!"
- Additional UI elements:
  - Display saved contact summary (name, email, company)
  - Show buttons: [Scan Another Card], [View Contact], [Share Contact], [Go to Contacts]
- Duration: Show for 2-3 seconds then offer next actions

**Message 34: User Chooses Next Action**
- From: End User
- To: Mobile App
- Type: User choice
- Content: User taps "Scan Another Card" (most common flow loops back to Message 1)
- OR: User taps "View Contact" (navigates to contact detail screen)
- OR: User taps "Home" (returns to dashboard)

**Message 35: Scan Workflow Completes**
- From: Mobile App
- To: End User
- Type: Final state
- Content: UI returns to initial state ready for next scan
- Total workflow time: ~35-40 seconds

### Timeline Summary
- User initiation: 0-2 sec
- Camera & capture: 2-5 sec
- OCR processing: 5-12 sec
- AI processing: 12-15 sec
- User review: 15-25 sec
- Backend save: 25-35 sec
- **TOTAL: 35-40 seconds** from user action to saved contact

### Activation Box Legend
- Filled boxes indicate when each actor is actively processing
- Dashed return arrows show responses
- Parallel processing shown where applicable (none in this sequence, all sequential)

---

## SEQUENCE DIAGRAM 2: EMAIL CAMPAIGN EXECUTION WITH TRACKING

### Overview
Complete timeline of email campaign creation through final metrics reporting, including asynchronous tracking events.

### Actors (7 Total)
1. **Admin User**
2. **Campaign Dashboard**
3. **Email Service**
4. **Queue Manager**
5. **SMTP Provider**
6. **Tracking Pixel Server**
7. **Analytics Dashboard**

### Detailed Message Flow (35 messages)

**Phase 1: Campaign Creation (0-30 seconds)**

**Message 1-5: Campaign Setup**
- Admin clicks "Create Campaign"
- Dashboard shows form for campaign details
- Admin enters: name="Q2 Outreach", subject="Let's Talk Growth", recipients=500
- Admin clicks "Compose Email"
- Dashboard loads email editor

**Message 6-10: Email Composition**
- Admin selects template
- Admin composes body with merge fields {{FirstName}}, {{Company}}
- Admin adds CTA button "Schedule Call"
- Admin clicks "Preview Email"
- Dashboard shows preview with first recipient's data

**Message 11-15: Campaign Submission**
- Admin clicks "Continue to Schedule"
- Admin selects "Send Immediately"
- Dashboard: POST /api/v1/campaigns/create with campaign object
- Email Service receives and validates campaign
- Email Service returns campaign_id: "camp-12345"

**Phase 2: Email Preparation (30 seconds - 2 minutes)**

**Message 16: Generate Recipients**
- Email Service queries database for 500 recipients
- Database returns recipient list with names, emails, companies

**Message 17: Personalize Emails**
- Email Service loops through 500 recipients
- For each: {{FirstName}} → actual name, {{Company}} → actual company
- Result: 500 personalized email objects

**Message 18: Add Tracking Elements**
- Self-message: Add unique tracking pixel: <img src="track.intelliscan.com/p/camp-12345/user-abc" />
- Self-message: Generate unique tracking URL for CTA button: "intelliscan.com/track/click/camp-12345/user-abc?url=calendly.com/..."
- Result: Each of 500 emails has unique tracking IDs

**Message 19: Queue Emails**
- Email Service → Queue Manager: POST /queue/batch with 500 emails
- Queue Manager acknowledges receipt
- Queue Manager → Email Service: "Batch queued, processing_id=batch-xyz"

**Phase 3: Sending (2-5 minutes)**

**Message 20: Begin Batch Processing**
- Queue Manager self-message: Segment 500 emails into 5 batches of 100
- Initialize send loop

**Message 21-22: Send Batch 1**
- Queue Manager → SMTP Provider: POST /v1/mail/send with 100 emails
- SMTP Provider processes and queues with mail servers

**Message 23: Return Send Status**
- SMTP Provider → Queue Manager: Response with status for each email (sent/failed)
- Queue Manager logs send statistics

**Messages 24-25: Send Batches 2-5**
- Repeat messages 21-22 four more times for remaining batches
- All 500 emails queued with SMTP Provider

**Phase 4: Email Delivery (5-10 minutes) - Asynchronous**

**Messages 26-28: First Recipient Opens Email**
- (Time: +6 minutes) User opens email in Gmail
- Tracking pixel image loads automatically
- Pixel request: GET track.intelliscan.com/p/camp-12345/user-abc
- Tracking Pixel Server logs open event with timestamp and user info
- Tracking Pixel Server → Analytics Database: Log {"event": "open", "user_id": "user-abc", "timestamp": "..."}

**Messages 29-30: User Clicks CTA Link**
- (Time: +8 minutes) User clicks "Schedule Call" button
- Click redirect: user sent to intelliscan.com/track/click endpoint first
- Tracking records click: {"event": "click", "user_id": "user-abc", "link_id": "cta-button", "timestamp": "..."}
- Analytics Database receives and processes event
- User redirected to actual target (Calendly)

**Messages 31-32: Additional Opens/Clicks (Ongoing)**
- (Time: +10, +15, +20, +30 minutes, ...) Other recipients open emails
- Each open sends tracking pixel request
- Each click sends tracking click request
- All logged asynchronously to Analytics Database

**Phase 5: Metrics Calculation & Display (30+ minutes)**

**Message 33: Calculate Campaign Metrics**
- Analytics Dashboard polls every 5 seconds
- Analytics Dashboard → Analytics Database: SELECT COUNT(*) FROM opens WHERE campaign_id='camp-12345'
- Database returns: opens=127, total_sent=500
- Calculates: open_rate = 127/500 = 25.4%

**Message 34: Display Real-Time Dashboard**
- Analytics Dashboard shown to Admin with live numbers:
  - Sent: 500
  - Delivered: 498 (2 bounced)
  - Opened: 127 (25.4%)
  - Clicked: 34 (6.8% of sent, 26.8% of opens)
  - Conversion: 7 (1.4%)

**Message 35: Admin Reviews Campaign Report**
- Admin views full report with graphs showing open rate over time, click breakdown by link
- Option to download report as PDF

---

## SEQUENCE DIAGRAM 3: CRM SYNCHRONIZATION WORKFLOW

### Overview
Complete CRM sync from initiation through final status update, including authentication and error handling.

### Actors (6 Total)
1. **Admin User**
2. **Admin Dashboard**
3. **CRM Sync Service**
4. **Authentication Service**
5. **CRM API** (e.g., Salesforce)
6. **IntelliScan Database**

### Detailed Message Flow (26 messages)

**Phase 1: Initiation (0-5 seconds)**

**Message 1: Admin Clicks Sync**
- From: Admin User
- To: Admin Dashboard
- Content: Click "Sync Contacts with Salesforce"

**Message 2: Request Sync Start**
- From: Admin Dashboard
- To: CRM Sync Service
- Endpoint: POST /api/v1/integrations/salesforce/sync
- Headers: Auth token
- Body: {"sync_direction": "push_to_crm"}

**Message 3: Validate Configuration**
- From: CRM Sync Service
- To: CRM Sync Service
- Self-message: Verify Salesforce credentials exist, API endpoint configured

**Phase 2: Authentication (5-10 seconds)**

**Message 4: Request OAuth Token**
- From: CRM Sync Service
- To: Authentication Service
- Endpoint: POST /oauth/get-token
- Payload: {"provider": "salesforce", "client_id": "...", "client_secret": "..."}

**Message 5: Validate Credentials**
- From: Authentication Service
- To: Authentication Service
- Self-message: Check stored credentials validity

**Message 6: Request Token from Salesforce**
- From: Authentication Service
- To: CRM API (Salesforce)
- Endpoint: POST https://login.salesforce.com/services/oauth2/token
- Body: Client credentials and scope

**Message 7: Return OAuth Token**
- From: CRM API
- To: Authentication Service
- Content: {"access_token": "00Dxx...", "instance_url": "https://myinstance.salesforce.com", "expires_in": 3600}

**Message 8: Return Token to Sync Service**
- From: Authentication Service
- To: CRM Sync Service
- Content: OAuth token ready, valid for 1 hour

**Phase 3: Data Preparation (10-20 seconds)**

**Message 9: Query IntelliScan Contacts**
- From: CRM Sync Service
- To: IntelliScan Database
- Query: SELECT * FROM contacts WHERE synced_to_crm=false OR modified_at > last_sync_timestamp
- Returns: ~500 contacts modified since last sync

**Message 10: Return Contact List**
- From: IntelliScan Database
- To: CRM Sync Service
- Content: Array of 500 contact objects

**Message 11: Load Field Mappings**
- From: CRM Sync Service
- To: CRM Sync Service (or Field Mapping Service)
- Self-message: Load configuration {"intelliscan_firstName": "FirstName__c", "intelliscan_email": "Email", ...}

**Message 12: Transform Contacts**
- From: CRM Sync Service
- To: CRM Sync Service
- Self-message: Loop through 500 contacts, transform each to Salesforce field names and formats
- Processing time: ~1-2 seconds

**Message 13: Segment into Batches**
- From: CRM Sync Service
- To: CRM Sync Service
- Self-message: Split contacts into 5 batches of 100 contacts each
- Reason: Salesforce API has batch limits (usually 200 per request, but 100 is safer)

**Phase 4: Push to CRM (20-60 seconds)**

**Message 14-18: Push Batch 1**
- From: CRM Sync Service
- To: CRM API
- Endpoint: POST https://myinstance.salesforce.com/services/data/v57.0/composite/sobjects
- Headers: Authorization: Bearer {oauth_token}
- Body: {"allOrNone": false, "records": [100 contact objects in Salesforce format]}
- Processing time: ~3-5 seconds per batch

**Message 19: Return Sync Result for Batch 1**
- From: CRM API
- To: CRM Sync Service
- Content: Array with result for each contact: {"id": "0031...", "sf_id": "a031...", "success": true} or {"success": false, "error": "REQUIRED_FIELD_MISSING"}

**Messages 20-22: Push Batches 2-5**
- Repeat messages 14-19 for remaining 4 batches
- Total push time: ~15-25 seconds for all 500 contacts

**Phase 5: Status Update (60-70 seconds)**

**Message 23: Update Database with Sync Results**
- From: CRM Sync Service
- To: IntelliScan Database
- SQL: UPDATE contacts SET synced_to_crm=true, crm_contact_id=sf_id, last_sync_timestamp=NOW() WHERE id IN (...) AND sync_successful
- Also update: INSERT INTO sync_errors (...) for failed contacts

**Message 24: Return Confirmation**
- From: IntelliScan Database
- To: CRM Sync Service
- Content: "Updated 498 contacts, 2 failed"

**Phase 6: Completion & Reporting (70-75 seconds)**

**Message 25: Compile and Send Report**
- From: CRM Sync Service
- To: Admin Dashboard
- Content: Sync completion with statistics:
  ```json
  {
    "status": "completed",
    "total_attempted": 500,
    "successful": 498,
    "failed": 2,
    "success_rate": "99.6%",
    "duration_seconds": 45,
    "failed_contacts": [
      {"id": "contact-123", "error": "Email field is required in Salesforce"},
      {"id": "contact-456", "error": "Company field exceeds Salesforce field length"}
    ]
  }
  ```

**Message 26: Display Report to Admin**
- From: Admin Dashboard
- To: Admin User
- Content: Show sync summary "498 of 500 contacts synced successfully!" with options [View Failed], [Retry], [Schedule Auto-Sync]

---

## SEQUENCE DIAGRAM 4: TEAM MEMBER INVITATION & ONBOARDING

### Overview
Complete workflow from admin invitation through new team member's first login and access verification.

### Actors (5 Total)
1. **Admin User**
2. **Team Management Dashboard**
3. **Invitation Service**
4. **Email Service**
5. **New Team Member**

### Detailed Message Flow (20 messages)

**Phase 1: Invitation Creation (0-5 seconds)**

**Message 1-2: Admin Initiates Invite**
- Admin clicks "Invite Team Member" button
- Dashboard displays form: email field, role dropdown (Viewer/Editor/Manager/Admin)

**Message 3: Admin Enters Details**
- Admin types: "jane.doe@company.com" and selects role "Editor"

**Message 4: Submit Invite Request**
- Dashboard → Team Mgmt Service: POST /api/v1/team/invite
- Payload: {"email": "jane.doe@company.com", "role": "Editor", "workspace_id": "ws-123"}

**Message 5: Validate & Create Invitation**
- Team Mgmt Service self-message: Generate unique token, set expiration to 7 days, store in DB
- Returns: invitation_id and token to dashboard

**Phase 2: Email Delivery (5-10 seconds)**

**Message 6: Request Invitation Email**
- Team Mgmt Service → Email Service: POST /send-email
- Payload: {"template": "team_invitation", "recipient": "jane.doe@company.com", "data": {"invitation_link": "https://intelliscan.com/join?token=abc123xyz", "role": "Editor", "workspace": "Tech Corp", "inviter": "John Admin"}}

**Message 7: Compose & Send Email**
- Email Service self-message: Render HTML email, add branding, prepare for send

**Message 8: Send to SMTP Provider**
- Email Service → SMTP Provider: Send email

**Message 9: Confirm Send**
- SMTP Provider → Email Service: Email queued/sent successfully

**Message 10: Notify Admin**
- Team Mgmt Service → Dashboard: Invitation sent notification

**Phase 3: Email Reception (Asynchronous, time varies)**

**Message 11: Member Receives Email**
- Email Service → New Team Member: Email received in inbox
- Content: "You've been invited to join Tech Corp workspace as an Editor"

**Phase 4: Invitation Acceptance (Varies, assume +30 minutes)**

**Message 12: Member Clicks Invitation Link**
- New Team Member clicks link: "https://intelliscan.com/join?token=abc123xyz"

**Message 13: Verify Token**
- Invitation Service verifies token: valid, not expired, hasn't been used yet

**Message 14: Display Signup Form**
- Invitation Service → New Team Member: Show form with email pre-filled, password field,

 terms
- Form shows: "Email: jane.doe@company.com (read-only), Password: [field], Confirm Password: [field], I agree to Terms [checkbox]"

**Message 15: Member Creates Account**
- New Team Member enters password and accepts terms, clicks "Create Account"

**Message 16: Hash Password & Create User**
- Signup Service self-message: Hash password with bcrypt
- Signup Service → User Service: POST /users/create with hashed password
- User Service creates user record in database

**Message 17: Return User ID**
- User Service → Signup Service: {"user_id": "user-uuid", "created": true}

**Message 18: Assign Permissions**
- Signup Service → Permission Service: Add role "Editor" to user in workspace
- Permission Service stores: user_id, workspace_id, role "Editor" with associated permissions

**Message 19: Send Welcome Email**
- Signup Service → Email Service: Send welcome email with login link

**Message 20: Display Success & Redirect**
- Signup Service → New Team Member: "Welcome! Your account is ready. Click [Login] to continue"

### Completion
- New member is now active team member with Editor role
- Can view/create/edit team contacts
- Has access to assigned contacts and team dashboards
- Audit log records: "jane.doe@company.com invited and activated by John Admin at 2026-04-04 10:35:00"

---

## SEQUENCE NOTES FOR DRAW.IO

When rendering these sequence diagrams in draw.io:
1. Draw vertical lines (lifelines) for each actor/component
2. Number all messages in sequence order
3. Use solid arrows for requests, dashed arrows for returns
4. Use activation boxes (thin rectangles) on lifelines to show when component is active/processing
5. Label each message with content and sometimes data type
6. Show self-messages as loops back to same lifeline
7. Add timing annotations (seconds, milliseconds) next to key steps
8. Use alt/opt frames for alternative flows and optional steps (if supported)
9. Color code messages by type: green for successful operations, red for errors, blue for data transfer
10. Include network latency estimates between distributed components
