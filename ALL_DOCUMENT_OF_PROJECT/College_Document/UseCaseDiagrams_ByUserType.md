# IntelliScan Use Case Diagrams - Detailed Analysis

## 1. COMPLETE SYSTEM USE CASE DIAGRAM

### System Actors
- **End User** (Personal account holder)
- **Business Admin** (Enterprise workspace administrator)
- **Super Admin** (Platform administrator)
- **External System** (CRM integrations, Email services, AI APIs)

### Main System Use Cases

```
System Boundary: IntelliScan Platform Management

┌─────────────────────────────────────────────────┐
│                 IntelliScan                      │
│              Platform Features                   │
└─────────────────────────────────────────────────┘

1. CARD SCANNING & CONTACT ENGINE
   ├── Scan Physical Business Card
   ├── Review AI Extractions
   ├── Manually Edit Contact Fields
   ├── Export Contact to CRM/CSV
   └── Merge Duplicate Contacts

2. COLLABORATIVE WORKSPACE & TEAM MANAGEMENT
   ├── Invite Team Members
   ├── Manage Assignee Roles
   ├── Assign Contacts to Team Members
   ├── Send Real-Time Messages
   └── Share Contacts with Team

3. EMAIL CAMPAIGN AUTOMATION
   ├── Create Mass Email Campaign
   ├── Use Gemini AI Auto-Writer
   ├── Track Email Opens/Clicks
   ├── Review Send Analytics
   └── Manage Email Sequences

4. CALENDAR & SCHEDULING
   ├── Create Calendar Events
   ├── Add Event Attendees
   ├── Generate Booking Links
   ├── AI Suggest Best Meeting Times
   └── Send Calendar Reminders

5. CONTACT MANAGEMENT & CRM
   ├── Search Contacts with Global Search
   ├── Filter by Tags/Company/Role
   ├── Create Contact Tags
   ├── Track Contact Interactions
   └── Export Contact Batches

6. KIOSK MODE (Event Scanning)
   ├── Capture Multiple Cards in Batch
   ├── Queue Cards for Processing
   ├── Sync with Backend
   └── Bulk Import to Workspace

7. ANALYTICS & REPORTING
   ├── View Scan Statistics
   ├── Track Email Campaign Metrics
   ├── Monitor User Activity
   └── Generate Custom Reports

8. BILLING & SUBSCRIPTION
   ├── View Current Plan/Usage
   ├── Upgrade to Higher Tier
   ├── Download Invoice History
   └── Manage Payment Methods

9. ADMIN CONFIGURATION
   ├── Configure Workspace Settings
   ├── Set Data Retention Policies
   ├── Manage API Integrations
   ├── Configure Webhook Rules
   └── Monitor System Health
```

---

## 2. END USER (Personal Account) USE CASES

**User Profile:** Individual professional using IntelliScan for personal contact management

### Primary Use Cases

```
┌─────────────────────────────────────────┐
│      END USER (Personal User)            │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   Normal Flow             Premium Flow
   (Free Tier)            (Pro/Enterprise)

CORE WORKFLOW:
├── Register & Sign In
├── SCAN CARD
│   ├── Upload Card Image
│   ├── Take Photo via Camera
│   └── Review AI Extraction
├── MANAGE CONTACTS
│   ├── Search by Name/Email
│   ├── View Contact Details
│   ├── Edit Manual Fields
│   ├── Add Notes/Tags
│   └── Create Contact Groups
├── EXPORT DATA
│   ├── Export to CSV
│   ├── Export to Excel
│   └── Export to Personal CRM
├── FOLLOW-UP
│   ├── Send Email Draft
│   ├── Schedule Follow-up Reminder
│   └── Track Email Opens
└── ACCOUNT MANAGEMENT
    ├── Update Profile
    ├── View Usage Quota
    ├── Change Password
    └── Download Data

PREMIUM-ONLY USE CASES (Pro/Enterprise):
├── CREATE EMAIL CAMPAIGNS
│   ├── Write Mass Email
│   ├── Use AI to Draft Subject/Body
│   ├── Schedule Send
│   └── View Click/Open Analytics
├── CALENDAR EVENTS
│   ├── Create Meeting Invites
│   ├── Share Calendar
│   └── Get AI Time Suggestions
└── ADVANCED SEARCH
    ├── Filter by Confidence Score
    ├── Find Duplicates
    └── Search Across Exports
```

### Frequency of Use Cases
- **Daily:** Scan cards, view contacts, search
- **Weekly:** Export data, follow up, send emails
- **Monthly:** Review analytics, update plan, manage tags
- **Annually:** Download invoices, manage settings

---

## 3. TEAM MEMBER (Business Admin) USE CASES

**User Profile:** Administrator in a team/enterprise workspace managing collective contacts

### Primary Use Cases

```
┌─────────────────────────────────────────┐
│  BUSINESS ADMIN (Team Administrator)    │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   Workspace Mgmt        Team Coordination

ADMIN WORKFLOW:

1. TEAM MANAGEMENT
   ├── Invite Team Members
   │   ├── Send Email Invites
   │   ├── Set Default Role (Editor/Viewer)
   │   └── Bulk Invite from CSV
   ├── Manage Member Roles
   │   ├── Assign Role (Admin/Editor/Viewer)
   │   ├── Revoke Access
   │   └── Change Permissions
   ├── View Team Activity Log
   │   ├── See Who Scanned Cards
   │   ├── Track Contact Edits
   │   └── Monitor Exports
   └── Set Usage Limits
       ├── Allocate Scan Quota
       └── Control Email Limits

2. SHARED CONTACT MANAGEMENT
   ├── View All Team Contacts
   ├── Assign Contacts to Members
   ├── Create Shared Tags
   ├── Merge Duplicate Contacts Enterprise-wide
   ├── Set Data Quality Rules
   └── Archive Inactive Contacts

3. CRM INTEGRATION & MAPPING
   ├── Connect External CRM (Salesforce, HubSpot)
   ├── Map IntelliScan Fields to CRM Fields
   ├── Auto-Sync Contacts to CRM
   ├── Configure Sync Frequency
   └── Test Mapping Rules

4. EMAIL CAMPAIGN MANAGEMENT
   ├── Create Team-wide Campaign Templates
   ├── Manage Contact Lists
   ├── Schedule Campaign Distribution
   ├── Review Campaign Analytics by Member
   └── Set Campaign Approval Workflow

5. WORKSPACE SETTINGS
   ├── Configure Workspace Name/Logo
   ├── Set Data Retention Policy
   │   ├── Auto-delete after N days
   │   ├── Archive old records
   │   └── GDPR compliance mode
   ├── Enable/Disable Features
   │   ├── Email Marketing
   │   ├── Calendar
   │   ├── Kiosk Mode
   │   └── API Access
   └── Manage Billing
       ├── View Usage Report
       ├── Manage Payment Method
       └── Download Invoices

6. ROUTING RULES & AUTOMATION
   ├── Set Auto-routing Rules
   │   ├── Route by Domain
   │   ├── Route by Role Keyword
   │   └── Route to Specific Member
   ├── Create Automation Workflows
   │   ├── Auto-tag on Scan
   │   ├── Auto-assign to AE
   │   └── Auto-send Follow-up Email
   └── Test Rules Before Publishing

7. WORKSPACE SECURITY
   ├── Manage API Keys
   ├── Create and Revoke Webhooks
   ├── View Audit Logs
   ├── Set IP Whitelist
   └── Enable 2FA for Team

8. SHARED ROLODEX (Enterprise)
   ├── Create Shared Contact Database
   ├── Set Read/Write Access Levels
   ├── Monitor Shared Access
   └── Manage Shared Record Versions

9. WORKSPACE ANALYTICS
   ├── View Team Scan History
   ├── Track Contact Quality Metrics
   ├── Monitor Campaign Performance
   ├── See Member Activity Dashboard
   └── Export Analytics Report
```

### Access Control
- **Can view:** All team contacts and activity
- **Cannot view:** Other workspace data or super-admin settings
- **Can manage:** Team members, workspace settings, shared resources

---

## 4. SUPER ADMIN (Platform Administrator) USE CASES

**User Profile:** Platform-level administrator with full system access

### Primary Use Cases

```
┌─────────────────────────────────────────┐
│   SUPER ADMIN (Platform Administrator)  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────────────────┐
        │                                   │
        ▼                                   ▼
   System Oversight               AI/Infrastructure

SUPER ADMIN WORKFLOW:

1. PLATFORM MONITORING
   ├── View System Health Dashboard
   │   ├── API Response Times
   │   ├── Database Performance
   │   ├── Server Load
   │   └── Error Rates
   ├── Monitor Active Sessions
   ├── View System Logs
   └── Track Resource Usage

2. USER & WORKSPACE MANAGEMENT
   ├── View All Users Across Platform
   ├── View All Workspaces
   ├── Manage User Billing
   │   ├── Upgrade/Downgrade Plans
   │   ├── Override Limits
   │   └── Apply Discounts
   ├── Suspend/Reactivate Users
   ├── Recover Deleted Data
   └── Manage Compliance Holds

3. AI MODEL MANAGEMENT
   ├── Configure AI Extraction Engine
   │   ├── Select Primary Model (Gemini/OpenAI)
   │   ├── Set Confidence Threshold
   │   └── Configure Fallback Logic
   ├── Monitor AI Accuracy
   │   ├── View Extraction Error Rate
   │   ├── See Common Extraction Failures
   │   └── Feedback Loop Management
   ├── Manage AI Model Versions
   │   ├── Deploy New Model Version
   │   ├── Rollback to Previous Version
   │   └── A/B Test Models
   ├── Custom Model Training
   │   ├── Upload Training Data
   │   ├── Train Custom Extractor
   │   └── Monitor Training Progress
   └── AI Configuration by Domain
       └── Set industry-specific rules

4. SECURITY & COMPLIANCE
   ├── View Audit Trail (All Actions)
   │   ├── User Login/Logout
   │   ├── Data Access Logs
   │   ├── Admin Actions
   │   └── Failed Auth Attempts
   ├── Manage Data Security
   │   ├── Enable Encryption at Rest
   │   ├── Set Data Residency
   │   ├── Configure Backup Policy
   │   └── GDPR/CCPA Compliance
   ├── Manage Access Tokens & Keys
   │   ├── Rotate API Keys
   │   ├── Revoke Compromised Keys
   │   └── Set Key Expiration
   ├── Set Security Policies
   │   ├── Require 2FA
   │   ├── IP Whitelist Rules
   │   ├── Password Policies
   │   └── Session Timeout
   └── Compliance Reporting
       ├── Generate Audit Reports
       ├── HIPAA/SOC2 Attestations
       └── Data Residency Proof

5. BILLING & PAYMENT SYSTEM
   ├── View Platform-wide Revenue
   ├── Manage Payment Gateway Settings
   ├── Configure Subscription Plans
   │   ├── Create New Tier
   │   ├── Set Pricing & Features
   │   └── Define Quota Limits
   ├── Handle Billing Disputes
   ├── Manage Discounts/Coupons
   ├── Override User Charges
   └── View Payment Analytics

6. INTEGRATION MANAGEMENT
   ├── Manage Third-party API Integrations
   │   ├── Enable/Disable CRM Connectors
   │   ├── Set API Rate Limits
   │   ├── Configure Webhook Handlers
   │   └── Monitor API Health
   ├── Manage Email Service Configuration
   │   ├── Configure SMTP Server
   │   ├── Set Email Rate Limits
   │   └── Test Email Delivery
   ├── AI Service Configuration
   │   ├── Configure Gemini API Keys
   │   ├── Configure OpenAI API Keys
   │   └── Set Cost Limits
   └── Database Administration
       ├── View Database Stats
       ├── Run Maintenance Jobs
       └── Manage Backups

7. INCIDENT & ERROR MANAGEMENT
   ├── View Error Dashboard
   │   ├── Recent Errors
   │   ├── Error Frequency
   │   └── Affected Users
   ├── Manage System Incidents
   │   ├── Declare Incident
   │   ├── Post Status Update
   │   ├── Notify Users
   │   └── Resolve Incident
   ├── Manage Error Handling Policy
   │   ├── Alert Thresholds
   │   ├── Auto-remediation Rules
   │   └── Notification Settings
   └── Review & Analyze Incidents

8. FEATURE FLAGS & ROLLOUTS
   ├── Manage Feature Flags
   │   ├── Enable/Disable Features
   │   ├── Set Rollout Percentage
   │   └── Target by User Segment
   ├── Scheduled Rollouts
   │   ├── Stage Deployments
   │   ├── Blue/Green Deploy
   │   └── Canary Releases
   ├── Revert Failed Features
   └── A/B Test Features

9. WEBHOOKS & CUSTOM AUTOMATION
   ├── Configure Webhook Endpoints
   ├── Set Retry Policies
   ├── Monitor Webhook Health
   ├── Test Webhook Delivery
   └── Custom Event Triggers

10. REPORTING & ANALYTICS
    ├── Generate System Reports
    │   ├── User Growth
    │   ├── Feature Adoption
    │   ├── API Usage
    │   └── Revenue Metrics
    ├── View Product Analytics
    ├── Monitor Churn Rate
    └── Export Data for BI
```

### Access Levels
- **Full system access:** All workspaces, all users, all data
- **Can override:** Any user limits, any billing, any configurations
- **Can suspend:** Users, workspaces, features
- **Can access:** System logs, audit trails, production databases

---

## 5. GUEST USER (Unauthenticated) USE CASES

**User Profile:** External person with a specific access link

### Primary Use Cases

```
┌──────────────────────────────────────┐
│   GUEST USER (External/Unauthenticated)
└──────────────────────────────────────┘

LIMITED USE CASES:

1. PUBLIC PAGE ACCESS (No Auth Required)
   ├── View Public Profile
   │   └── See shared contact info
   ├── Access Public Analytics Page
   │   └── View event attendee stats
   └── View Help/Documentation
       └── FAQs and tutorials

2. BOOKING PAGE (Link-based Access)
   ├── View Availability Calendar
   ├── Select Meeting Time
   ├── Enter Contact Information
   │   ├── Name
   │   ├── Email
   │   ├── Company (optional)
   │   └── Message (optional)
   └── Confirm Booking
       └── Receive ICS via Email

3. PUBLIC SCANNER (Kiosk Link)
   ├── Scan Business Card
   │   ├── Upload Image
   │   └── Take Photo
   ├── View Extracted Data
   ├── Edit Fields (if enabled)
   └── Submit to Organizer

4. SIGN-UP & REGISTRATION
   ├── Create Account
   │   ├── Enter Email
   │   ├── Create Password
   │   └── Verify Email
   └── Set Initial Profile
       ├── Name
       ├── Company
       └── Role
```

### Restrictions
- **Cannot:** View private contacts, send emails, create workspace
- **Can only:** Access public-shared pages via direct link
- **Auth required:** To access dashboard or manage any data

---

## 6. EXTERNAL INTEGRATIONS (System Actors)

```
┌──────────────────────────────────────┐
│   EXTERNAL SYSTEMS & INTEGRATIONS    │
└──────────────────────────────────────┘

1. CRM SYSTEMS
   ├── Salesforce
   │   ├── Sync Contacts
   │   ├── Create Leads
   │   └── Update Opportunities
   ├── HubSpot
   │   ├── Add to Contact List
   │   ├── Create Deal
   │   └── Log Activity
   └── Other CRM via API
       └── Generic Contact Sync

2. EMAIL SERVICES
   ├── Nodemailer (SMTP)
   │   ├── Send Campaign Emails
   │   └── Send Notifications
   ├── SendGrid
   ├── Mailgun
   └── Custom SMTP

3. AI SERVICES
   ├── Google Gemini Vision API
   │   ├── Extract Card Text
   │   └── Suggest Auto-responses
   ├── OpenAI API
   │   ├── Generate Email Content
   │   └── Extract Card Info
   └── Tesseract OCR (Fallback)

4. CALENDAR SERVICES
   ├── Google Calendar
   │   ├── Create Events
   │   └── Check Availability
   ├── Microsoft Outlook
   └── ICS Standard Format

5. PAYMENT & BILLING
   ├── Razorpay/Stripe
   │   ├── Process Subscription
   │   ├── Handle Refunds
   │   └── Manage Invoices
   └── Tax Service (Avalara)

6. STORAGE & CDN
   ├── AWS S3
   │   ├── Store Card Images
   │   └── Archive Data
   └── CloudFront (CDN)

7. COMMUNICATION
   ├── Slack Webhooks
   │   └── Post Notifications
   ├── SMS Services
   │   └── Send Alerts
   └── Twilio
```

---

## 7. USE CASE DEPENDENCIES & RELATIONSHIPS

### Primary Flow
```
Guest → Sign-up → End User → Team Invite → Business Admin
                                ↓
                          (Optional) Super Admin
```

### Feature Availability by Tier

| Feature | Free | Pro | Enterprise | Super Admin |
|---------|------|-----|------------|------------|
| Scan Cards | ✓ (10/mo) | ✓ (100/mo) | ✓ Unlimited | ✓ |
| Search Contacts | ✓ | ✓ | ✓ | ✓ |
| Email Campaigns | ✗ | ✓ | ✓ | ✓ |
| Team Members | ✗ | ✓ (5) | ✓ (25) | ✓ |
| Calendar | ✗ | ✓ | ✓ | ✓ |
| CRM Integration | ✗ | ✓ (1) | ✓ (3) | ✓ |
| Custom Models | ✗ | ✗ | ✓ | ✓ |
| API Access | ✗ | ✓ | ✓ | ✓ |
| Audit Logs | ✗ | ✗ | ✓ | ✓ |
| Admin Panel | ✗ | ✗ | ✗ | ✓ |

---

## Summary

**IntelliScan** supports 5 main user personas:

1. **End User** - Individual professionals managing personal contacts
2. **Business Admin** - Team leaders managing shared workspace
3. **Super Admin** - Platform administrators with full system control
4. **Guest User** - External people with limited link-based access
5. **Systems** - External integrations (CRM, Email, AI APIs)

Each has distinct use cases, permissions, and workflows optimized for their role.
