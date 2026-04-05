# ACTIVITY DIAGRAM PROMPTS FOR DRAW.IO

Create comprehensive UML Activity Diagrams for the IntelliScan platform illustrating four major system workflows and user interactions.

## WORKFLOW 1: BUSINESS CARD SCANNING & CONTACT CREATION PROCESS

### Process Flow Overview
The card scanning workflow is the core feature of IntelliScan. It encompasses the complete user journey from deciding to scan a card through finalizing the contact save. This workflow demonstrates decision points, parallel processing paths, and error handling mechanisms.

### Detailed Activity Sequence

**Start Point:** User initiates scanning action
- Initial action: User Launches Mobile Application → "Open IntelliScan App"

**Primary Path Decision (First Decision Point):** "Select Card Input Source?"
- Choice A: Camera Capture Path
  - Activity: Activate Mobile Camera
  - Activity: Position Card in Frame
  - Activity: Capture Card Photo
  
- Choice B: File Upload Path
  - Activity: Navigate to Device Storage
  - Activity: Browse for Image File
  - Activity: Select and Load Image File
  
- Choice C: Manual Entry Path
  - Activity: Access Contact Entry Form
  - Activity: Manually Type Contact Information
  - Activity: Enter All Required Fields

**Convergence Point:** All three paths merge to common processing pipeline
- Merged Activity: Prepare Image/Data for Processing

**Processing Pipeline (AI Processing Phase - marked with special coloring):**
- Activity: Submit to OCR Engine (marked with purple color)
- Activity: Extract Raw Text from Image (OCR processing)
- Activity: Send Text to AI Model for Structuring (marked with purple)
- Activity: AI Model Analyzes and Validates Extracted Data (marked with purple)
- Activity: Generate Confidence Scores for Each Field (marked with purple)

**Data Validation Decision Point (Second Decision Point):** "Is Extracted Data Valid & Confident?"
- Success Path (Confidence > 80%):
  - Activity: Proceed to Save Contact (marked with green)
  
- Uncertain/Error Path (Confidence < 80%):
  - Activity: Display Data Review Screen to User
  - Activity: User Reviews Each Extracted Field
  - Activity: User Makes Manual Corrections as Needed
  - Activity: User Confirms Final Contact Data
  - Activity: Proceed to Save Contact (marked with green)

**Save & Completion Phase (marked with green color):**
- Activity: Validate Contact Against Duplicates
- Activity: Store Contact in Database
- Activity: Generate Contact ID
- Activity: Display Confirmation Message to User
- Activity: Offer Next Action Options (Scan Another, View Contact, Share, etc.)

**End Point:** Process completed, user returns to home screen

### Visual Elements Required
- Filled black circles for start/end states
- Rounded rectangles for activities/actions
- Diamond shapes for decision points with labeled exit branches
- Merge/fork bars representing parallel workflow paths
- Swimlanes by actor (User, Mobile App, OCR Engine, AI Model, Database)
- Color coding: Blue for user interactions, Purple for AI/ML processing, Green for database operations
- Clear directional arrows with labels
- Alternative paths clearly marked

---

## WORKFLOW 2: EMAIL CAMPAIGN CREATION, SENDING & TRACKING

### Process Flow Overview
The email campaign workflow enables Business Admins to create targeted email campaigns, manage delivery, and monitor engagement metrics. This workflow includes branching paths for different campaign actions and parallel tracking mechanisms.

### Detailed Activity Sequence

**Initialization Phase:**
- Start Point: Admin Initiates New Campaign
- Activity: Click "Create New Campaign" Button
- Activity: Enter Campaign Name and Description
- Activity: Select Target Audience/Recipients List

**Recipient Configuration Phase:**
- Activity: Choose Recipient Filters (by tag, company, date range, etc.)
- Activity: Review Recipient Count
- Activity: Export Recipient List for Verification
- Decision Point: "Recipient List Correct?"
  - If No: Return to Recipient Filters, Adjust Criteria
  - If Yes: Proceed to Email Composition

**Email Composition Phase (marked with red color):**
- Activity: Select or Create Email Template
- Activity: Configure Email Subject Line
- Activity: Add Personalization Tokens {{FirstName}}, {{Company}}, etc.
- Activity: Compose Email Body Content
- Activity: Add Call-to-Action Buttons/Links
- Activity: Attach Files or Resources if Needed
- Activity: Add Unsubscribe Footer (Compliance)

**Email Preparation Phase (marked with orange color):**
- Fork Point (Parallel Processing Begins):
  - Branch A: Email Template Processing
    - Activity: Apply Brand Colors and Styling
    - Activity: Insert Company Logo and Assets
    - Activity: Validate HTML Structure
    
  - Branch B: Tracking Configuration
    - Activity: Generate Unique Tracking Pixel
    - Activity: Create Click Tracking URLs
    - Activity: Configure Conversion Tracking

**Merge Point:** Both branches converge
- Activity: Combine Tracking Elements with Email Content
- Activity: Add Unsubscribe and Preference Links

**Preview & Approval Phase:**
- Activity: Generate Email Preview for Admin Review
- Activity: Send Test Email to Admin's Email Address
- Activity: Admin Reviews Test Email Rendering and Content
- Decision Point: "Email Preview Acceptable?"
  - If No: Return to Email Composition, Make Edits
  - If Yes: Proceed to Scheduling

**Scheduling Phase (marked with orange color):**
- Decision Point: "Send Immediately or Schedule?"
  - Send Now Path:
    - Activity: Move Campaign to Sending Queue
    - Activity: Set Send Status to "Active"
    
  - Schedule for Later Path:
    - Activity: Select Scheduled Send Date and Time
    - Activity: Configure Timezone for User
    - Activity: Set Campaign Status to "Scheduled"

**Sending & Delivery Phase:**
- Activity: Queue Manager Picks Up Campaign
- Activity: Segment Recipients into Batches
- Activity: Connect to SMTP Email Provider
- Activity: Send Email Batches to Recipients
- Activity: Monitor Delivery Status from Email Provider
- Activity: Log Bounce, Failure, and Success Statistics

**Tracking & Monitoring Phase (marked with green color - Parallel Paths):**
- Fork Point (Three Parallel Tracking Branches):

  - **Branch A: Open Event Tracking**
    - Activity: Embed Tracking Pixel in Email
    - Activity: Monitor Pixel Load Events
    - Activity: Record Open Timestamp and User Location (if available)
    - Activity: Increment Open Counter
    - Activity: Feed Data to Analytics Engine
    
  - **Branch B: Click Event Tracking**
    - Activity: Generate Unique Click URLs for Links
    - Activity: Monitor Click Events on Tracked Links
    - Activity: Record Click Timestamp
    - Activity: Identify Clicked Link/CTA
    - Activity: Increment Click Counter
    - Activity: Feed Data to Analytics Engine
    
  - **Branch C: Engagement Scoring**
    - Activity: Calculate Engagement Score (Opens + Clicks)
    - Activity: Identify Hot Leads (High Engagement)
    - Activity: Flag Inactive Recipients
    - Activity: Log Engagement Data

**Merge Point:** All tracking branches converge
- Activity: Data Aggregation from All Tracking Branches
- Activity: Calculate Campaign Metrics (Open Rate, Click Rate, CTR)
- Activity: Generate Campaign Performance Report

**Reporting & Completion Phase (marked with green color):**
- Activity: Display Real-Time Campaign Dashboard
- Activity: Show Metrics: Total Sent, Delivered, Opened, Clicked, Bounced
- Activity: Display Engagement by Time (Opens over time graph)
- Activity: Display Geographic Distribution if Available
- Activity: Offer Follow-up Actions (Resend, Archive, Export Report)
- Activity: Notify Admin of Campaign Completion

**End Point:** Campaign workflow completed, metrics recorded

### Visual Elements Required
- Start/end states: filled black circles
- Activities: rounded rectangles, color-coded by phase
- Decisions: diamond shapes with Yes/No branches
- Fork/merge bars for parallel processing (three-way fork for tracking)
- Swimlanes: Admin, Dashboard, Email Service, Tracking System, Analytics
- Clear flow indicators
- Legend: Red=Creation, Orange=Scheduling/Sending, Green=Tracking/Analytics

---

## WORKFLOW 3: CONTACT MANAGEMENT & TEAM ASSIGNMENT

### Process Flow Overview
Contact management workflow encompasses viewing, searching, organizing, and distributing contacts among team members. This includes quality assurance through duplicate detection and merging.

### Detailed Activity Sequence

**Entry Point:**
- Start: Admin Accesses Contacts Module
- Activity: Navigate to Team Contact Management Dashboard
- Activity: View Contact Overview and Statistics

**Contact Access Point (Primary Decision):**
- Decision Point: "Select Contact Management Action?"
  
  - **Path A: Search & Filter Contacts**
    - Activity: Enter Search Keywords
    - Activity: Apply Filter Criteria (Company, Tag, Date Range, Source)
    - Activity: Execute Search Query
    - Activity: Display Search Results
    - Activity: Select Individual Contact from Results
    
  - **Path B: View Contact List**
    - Activity: Display Full Contact List with Sorting Options
    - Activity: Apply Column Filters and Sorting
    - Activity: Browse through Contact List Pages
    - Activity: Select Individual Contact
    
  - **Path C: View Contact Details Directly**
    - Activity: Access Favorite or Recent Contacts
    - Activity: Click on Contact Name
    - Activity: Load Full Contact Profile

**Convergence Point:** All paths merge at Contact Selection
- Activity: Display Full Contact Details and Profile

**Contact Organization Phase:**
- Activity: View All Contact Fields and History
- Activity: Check Current Contact Tags
- Activity: Review Assignment Status and Team Owner
- Activity: View Contact Source and Extraction Metadata

**Organization Actions (Parallel Potential):**
- Fork Point:
  
  - **Branch A: Tag Management**
    - Activity: Select "Add Tags" Option
    - Activity: Choose Existing Tags or Create New Tags
    - Activity: Apply Selected Tags to Contact
    - Activity: Save Tag Changes
    
  - **Branch B: Team Assignment**
    - Activity: Select "Assign to Team Member" Option
    - Activity: Choose Team Member from Dropdown
    - Activity: Set Assignment Status (Assigned, In Progress, Completed)
    - Activity: Add Assignment Notes/Comments
    - Activity: Schedule Reminder for Follow-up
    - Activity: Save Assignment
    - Activity: Notification Sent to Assigned Team Member
    
  - **Branch C: Contact Editing**
    - Activity: Select "Edit Contact" Option
    - Activity: Modify Contact Fields Individually
    - Activity: Verify Updated Information
    - Activity: Save Changes to Contact Record
    - Activity: Log Modification to Audit Trail

**Merge Point:** All action branches converge
- Activity: Confirm All Changes Applied

**Duplicate Detection & Merging Phase:**
- Activity: Run Duplicate Detection Algorithm
- Decision Point: "Duplicate Contacts Found?"
  
  - **If Duplicates Located:**
    - Activity: Display List of Potential Duplicates
    - Activity: Review Similarity Score and Matching Fields
    - Activity: Confirm Merge Decision
    - Activity: Merge Duplicate Records
    - Activity: Consolidate All Data Fields
    - Activity: Preserve Contact History from Both Records
    - Activity: Delete/Archive Duplicate Record
    - Activity: Update Linked References (Campaigns, Assignments, etc.)
    - Activity: Log Merge Operation
    
  - **If No Duplicates:**
    - Activity: Skip Merge Process

**Export & Completion Phase:**
- Activity: Prepare for Data Export if Needed
- Activity: Select Export Format (CSV, Excel, VCard)
- Activity: Generate Export File
- Activity: Offer Download to Admin
- Activity: Log Export Activity
- Activity: Return to Contact Management Dashboard

**End Point:** Contact operations completed

### Visual Elements Required
- Start/end: filled circles
- Activities: rounded rectangles, color-coded (Blue=Search/View, Red=Edit, Green=Export)
- Multiple decision points with clear branching
- Fork/merge bars for parallel operations
- Swimlanes: Admin, Contact Service, Database, Notification Service
- Clear merge points showing convergence

---

## WORKFLOW 4: CRM SYNCHRONIZATION PROCESS

### Process Flow Overview
The CRM synchronization workflow manages the bidirectional data sync between IntelliScan and external CRM platforms (Salesforce, HubSpot, Pipedrive). This process includes authentication, field mapping, data transformation, and error handling.

### Detailed Activity Sequence

**Initialization Phase:**
- Start: Admin Initiates CRM Sync
- Activity: Navigate to Integrations Section
- Activity: Click "Sync CRM" or "Initiate Sync" Button
- Activity: Select Target CRM System from Dropdown (Salesforce/HubSpot/Pipedrive)
- Activity: Sync Service Validates CRM Configuration Exists

**Authentication & Validation Phase:**
- Activity: Retrieve Stored CRM API Credentials
- Activity: Connect to Authentication Service
- Activity: Request OAuth Token from CRM Provider
- Activity: CRM Provider Validates Credentials
- Decision Point: "Authentication Successful?"
  
  - **If Authentication Fails:**
    - Activity: Log Authentication Error
    - Activity: Display Error Message to Admin
    - Activity: Offer Option to Re-enter Credentials
    - Activity: Return to Configuration Screen
    
  - **If Authentication Succeeds:**
    - Activity: Receive OAuth Token from CRM
    - Activity: Store Token with Expiration Time
    - Activity: Proceed to Data Sync Phase

**Data Preparation Phase:**
- Activity: Query IntelliScan Database for New/Modified Contacts
- Activity: Filter Contacts Modified Since Last Sync (Using Timestamp)
- Activity: Count Total Contacts to Sync
- Activity: Verify Contact Data Completeness and Quality
- Activity: Identify Missing Required Fields

**Field Mapping Phase:**
- Activity: Load Field Mapping Configuration
- Activity: Review IntelliScan Fields → CRM Fields Mapping
- Activity: For Each Contact Field:
  - Sub-Activity: Check if Field Mapped to CRM Field
  - Sub-Activity: Validate Field Data Format Compatibility
  - Sub-Activity: Apply Data Transformation Rules if Needed
  - Sub-Activity: Handle Unmapped Fields (Skip or Use Default)
- Activity: Generate Transformed Contact Objects

**Batch Processing Phase:**
- Activity: Segment Contacts into Sync Batches (e.g., 100 per batch)
- Activity: Initialize Batch Counter
- Fork Point (Parallel Batch Processing):
  - For Each Batch:
    - Activity: Prepare Batch Payload in CRM API Format
    - Activity: Serialize Contact Data to JSON/XML
    - Activity: Validate Batch Structure Against CRM Schema
    - Activity: Compose API Request with OAuth Token

**Push to CRM Phase:**
- Activity: Send Batch Request to CRM API Endpoint
- Activity: CRM API Receives and Validates Request
- Activity: CRM API Processes Contacts in Batch
- Activity: CRM Creates or Updates Contact Records
- Activity: CRM Returns Response with Status for Each Contact
- Activity: Log Sync Response Details

**Response Processing & Error Handling:**
- Activity: Parse CRM API Response
- Activity: Extract Success/Failure Status for Each Contact
- Decision Point: "All Contacts Synced Successfully?"
  
  - **If Sync Issues Detected:**
    - Activity: Identify Failed Contacts and Error Codes
    - Activity: Log Error Details (Missing fields, Format mismatch, etc.)
    - Activity: Separate Failed Contacts from Successful
    - Activity: Queue Failed Contacts for Retry
    - Activity: Log Retry Timestamp
    
  - **If All Successful:**
    - Activity: Mark All Contacts as "CRM Synced"
    - Activity: Update sync_status Field in Database
    - Activity: Record Successful Sync Timestamp

**Status Update Phase:**
- Activity: Update IntelliScan Database with Sync Results
- Activity: For Each Successfully Synced Contact:
  - Sub-Activity: Set crmSynced = true
  - Sub-Activity: Set lastSyncTimestamp = current datetime
  - Sub-Activity: Store CRM Contact ID if Available
- Activity: Commit Database Changes
- Activity: Log Update Activity to Audit Trail

**Parallel Monitoring & Notification (Concurrent Activity):**
- Fork Point:
  
  - **Branch A: Sync Status Monitoring**
    - Activity: Monitor Sync Progress in Real-Time
    - Activity: Update Admin Dashboard with Progress Bar
    - Activity: Show Current Batch Number and Count
    - Activity: Display Estimated Time to Completion
    
  - **Branch B: Error Notification**
    - If Errors Detected:
      - Activity: Compose Error Summary Email
      - Activity: Include Failed Contact IDs and Error Codes
      - Activity: Send Notification to Admin
      - Activity: Store Error Log in System

**Merge Point:** Monitoring branches converge
- Activity: Consolidate Final Sync Statistics

**Reporting & Completion Phase:**
- Activity: Generate Sync Report
- Activity: Calculate Sync Metrics:
  - Total Contacts Attempted: X
  - Successfully Synced: Y
  - Failed: Z
  - Sync Duration: time
  - Success Rate: Y/X%
- Activity: Display Report to Admin
- Activity: Offer Actions (View Errors, Retry Failed, Export Report)
- Activity: Schedule Next Automatic Sync (if configured)
- Activity: Store Sync Report in System Archive

**End Point:** CRM Synchronization process completed

### Visual Elements Required
- Start/end states: filled black circles
- Activities: rounded rectangles
- Color coding: Blue=Preparation, Purple=Processing, Orange=Push/Send, Green=Success monitoring
- Decision diamonds with clear Yes/No paths
- Fork/merge bars for parallel processing
- Swimlanes: Admin, Sync Service, Authentication Service, CRM API, Database, Monitoring
- Error handling paths clearly marked
- Retry loops shown with arrows back to appropriate points
