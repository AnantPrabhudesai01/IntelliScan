const fs = require('fs');
const plantumlEncoder = require('plantuml-encoder');

const THEME = `skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
`;

const USECASE = `
@startuml
${THEME}
left to right direction

actor "Anonymous User" as anon
actor "Personal User" as puser
actor "Enterprise Admin" as eadmin
actor "Super Admin" as sadmin

rectangle "IntelliScan Platform Management" {
  
  package "Auth & Account Management" {
    usecase "Register New Account" as uc1
    usecase "Login / Reset Password" as uc2
    usecase "Manage Subscription" as uc3
  }

  package "Card Scanning & AI" {
    usecase "Scan Physical Card" as uc4
    usecase "Batch Scan Multi-Cards" as uc5
    usecase "Review AI Extractions" as uc6
  }

  package "CRM & Contact Management" {
    usecase "View / Filter Contacts" as uc7
    usecase "AI Semantic Search" as uc8
    usecase "Export Data (Excel/CRM)" as uc9
  }
  
  package "Calendar & Scheduling" {
    usecase "Schedule Calendar Event" as uc10
    usecase "AI Auto Time Suggestion" as uc11
    usecase "Book Public Appointment" as uc12
  }

  package "Workspace & Collaboration" {
    usecase "Invite Team Members" as uc13
    usecase "Manage Assignee Roles" as uc14
    usecase "Workspace Real-Time Chat" as uc15
  }

  package "Email Campaign Engine" {
    usecase "Create Mass Campaign" as uc16
    usecase "Gemini AI Auto-Writer" as uc17
    usecase "Review Send Analytics" as uc18
  }

  package "Super Admin Controls" {
    usecase "Manage Incidents / Logs" as uc19
    usecase "Configure AI Confidence" as uc20
  }
}

anon --> uc1
anon --> uc2
anon --> uc12

puser --> uc3
puser --> uc4
puser --> uc6
puser --> uc7
puser --> uc8
puser --> uc9

eadmin --> uc5
eadmin --> uc7
eadmin --> uc8
eadmin --> uc9
eadmin --> uc10
eadmin --> uc11
eadmin --> uc13
eadmin --> uc14
eadmin --> uc15
eadmin --> uc16
eadmin --> uc17
eadmin --> uc18

sadmin --> uc19
sadmin --> uc20

@enduml
`;

const ACT1 = `@startuml\n${THEME}
title Activity Diagram: AI Card Scanning Pipeline
start
:User clicks "Scan Business Card";
if (Method?) then (File Upload)
  :Select Image File;
else (Camera Capture)
  :Take Photo;
endif
:Convert to Base64;
:POST /api/scan;
:Verify JWT Token and Quota;
if (Quota Available?) then (No)
  :Return 429 Quota Exceeded;
  stop
else (Yes)
  :Send image to Gemini Vision API;
  if (Extraction Success?) then (No)
    :Send to Tesseract Fallback OCR;
  else (Yes)
  endif
  :Parse JSON extraction (Name, Email, etc.);
  if (Duplicate Email?) then (Yes)
    :Return 409 Duplicate Warning;
    stop
  else (No)
    :Insert Contact to CRM Database;
    :Log Audit Trail & Decrement Quota;
    :Return 201 Success;
  endif
endif
stop
@enduml`;

const ACT2 = `@startuml\n${THEME}
title Activity Diagram: Email Campaign Generation & Delivery
start
:Admin clicks "New Campaign";
:Enter Campaign details (Subject, Audience);
if (Content Type?) then (Manual)
  :Admin writes email body;
else (AI Auto-Write)
  :Enter brief prompt;
  :Gemini AI generates professional copy;
endif
:Review Audience Count (Filter Target List);
if (Action?) then (Save Draft)
  :Save state to Database;
  stop
else (Schedule / Send)
  :Iterate Recipient List;
  while (More Recipients?) is (Yes)
    :Render email template with variable merge;
    :Send via SMTP (Nodemailer);
    if (Delivered?) then (Yes)
      :Update status = Sent;
      :Insert invisible tracking pixel;
    else (No)
      :Mark status = Bounced;
      :Log failure reason;
    endif
  endwhile (No)
  :Update Campaign Overall Status to "Completed";
  :Notify Admin via UI;
endif
stop
@enduml`;

const ACT3 = `@startuml\n${THEME}
title Activity Diagram: User Registration & Onboarding
start
:User accesses /sign-up page;
:Enter Credentials (Name, Email, Password);
if (Validation Pass?) then (No)
  :Show UI Error Messages;
  stop
else (Yes)
  :POST /api/auth/register;
  :Check if User Exists;
  if (User Exists?) then (Yes)
    :Return User Exists Error;
    stop
  else (No)
    :Hash Password using bcrypt (Salt Rounds=10);
    :Insert User into Database;
    :Assign Default Role and Setup Quota;
    :Generate Secure JWT Token;
    :Return JWT to Client;
    :Redirect to /onboarding Setup Wizard;
  endif
endif
stop
@enduml`;

const ACT4 = `@startuml\n${THEME}
title Activity Diagram: Workspace Invitation & Onboarding
start
:Enterprise Admin clicks "Invite Member";
:Input Member Email and Assign Role;
:POST /api/workspaces/invite;
if (Domain Check Valid? AND Not Already Member?) then (No)
  :Return Invalid Request;
  stop
else (Yes)
  :Create Pending User Record (if not exists);
  :Generate 32-byte Secure Token;
  :Insert Token to workspace_invitations table;
  :Send Invitation Email via SMTP;
endif
:Invitee clicks Email Link URL;
:Verify Token validity and expiration;
if (Token Valid?) then (Yes)
  :Update User's workspace_id attribute;
  :Change Invitation Status to ACCEPTED;
  :Redirect Invitee to Workspace Dashboard;
else (No)
  :Show Expired Token Error;
  stop
endif
stop
@enduml`;

const ACT5 = `@startuml\n${THEME}
title Activity Diagram: Calendar Scheduler & Automation
start
:User selects Calendar View;
:Click "Create New Event";
:Fill core event details (Time, Duration, Title);
if (Suggest Time using AI?) then (Yes)
  :Send attendee schedules to Gemini AI;
  :AI returns 3 overlapping empty slots;
  :User selects best slot;
else (No)
  :Manually set date/time;
endif
:Select External Attendees;
:Configure event notification rule (e.g. 15min before);
:Save Event (INSERT to Database);
:Send automated Calendar ICS Invites via Email;
:Queue notification trigger in background worker (node-cron);
stop
@enduml`;


const SEQ1 = `@startuml\n${THEME}
title Interaction Diagram: AI Scan Sequence
actor "User" as user
participant "React\nFrontend" as ui
participant "API Router" as api
participant "Gemini Vision\nEngine" as gemini
participant "SQLite DB" as db
participant "Socket.IO" as wss

user -> ui : Upload Card Image
ui -> api : POST /api/scan (Base64)
api -> db : Verify Quota Available
db --> api : Quota OK
api -> gemini : Payload: Text Extraction Prompt + Base64
gemini --> api : Response JSON (Mapped fields)
api -> db : Search for Duplicate Email
db --> api : No Duplicate
api -> db : INSERT Into Contacts Table
db --> api : new inserted ID
api -> db : Decrement Remaining Quota
api -> wss : broadcast 'contact_added' event
wss --> ui : Notification Trigger
api --> ui : 201 Created (Contact object)
ui --> user : Display New Contact Card UI
@enduml`;

const SEQ2 = `@startuml\n${THEME}
title Interaction Diagram: Workspace Real-Time Chat
actor "Alice\n(Sender)" as A
participant "React\nClient A" as CA
participant "Socket API" as Sockets
participant "SQLite DB" as DB
participant "React\nClient B" as CB
actor "Bob\n(Receiver)" as B

A -> CA : Type message and press Enter
CA -> Sockets : SOCKET.emit('chat:message', {text, workspace_id})
Sockets -> Sockets : Validate Authentication Token
Sockets -> DB : INSERT message log (Audit)
DB --> Sockets : OK
Sockets -> Sockets : Find connected clients in workspace_id room
Sockets -> CB : SOCKET.emit('chat:receive', {message payload})
CB --> B : Update Chat Window UI
@enduml`;

const SEQ3 = `@startuml\n${THEME}
title Interaction Diagram: Email Follow-Up Campaign
actor "Admin" as adm
participant "Web Client" as ui
participant "Campaign API" as api
participant "SMTP Engine" as smtp
actor "Contact\nRecipient" as rec

adm -> ui : Click Send Campaign
ui -> api : POST /api/campaign/dispatch/{id}
api -> api : Parse Target Audience IDs
loop for each recipient ID in Audience
    api -> api : Render generic tracking pixel string
    api -> smtp : formatMail(recipient_email)
    smtp -> rec : Delivery (Network Transfer)
    rec --> smtp : SMTP 250 Response OK
    smtp --> api : resolve(delivered)
    api -> api : update database state for recipient
end
api --> ui : Dispatch Complete Response
ui --> adm : Redirect to Deliverability Report
@enduml`;

const SEQ4 = `@startuml\n${THEME}
title Interaction Diagram: Kiosk Mode Capture Event
actor "Attendee\nVisitor" as att
participant "Kiosk Scanner\n(Tablet)" as kiosk
participant "Backend Sync API" as api
participant "Tesseract/AI" as ai
participant "Database" as db

att -> kiosk : Show QR / Present Business Card
kiosk -> kiosk : Client-Side Processing/Cache
kiosk -> api : Async POST /api/kiosk/batch-scan (Background)
api -> ai : Queue Extraction Task
ai --> api : Return structured batch
api -> db : Execute Bulk INSERT (Contacts)
db --> api : Success Response
api --> kiosk : Sync Acknowledged
kiosk --> att : Ready for next user instantly
@enduml`;

const SEQ5 = `@startuml\n${THEME}
title Interaction Diagram: Calendar Booking Link
actor "External Client" as ext
participant "Booking\nPublic Page" as page
participant "API" as api
participant "Database" as db
participant "SMTP Helper" as mail

ext -> page : Opens public booking link (anant.com/b/slot)
page -> api : GET /api/booking/{slug}
api -> db : SELECT availability_slots WHERE slug
db --> api : Valid time matrix
api --> page : Render Time Selector
ext -> page : Chooses Date, Time, Enters Email
page -> api : POST /api/booking/confirm
api -> db : Check overlapping lock mechanism
db --> api : Lock secured
api -> db : INSERT Calendar Event
api -> mail : dispatch_ICS_calendar_invitation
mail --> ext : Email ICS attachment received
api --> page : Redirect Success Screen
@enduml`;


const CLS1 = `@startuml\n${THEME}
title Class Diagram: Core Identity & Authentication
class User {
  +int user_id
  +varchar email
  +varchar hashed_password
  +varchar role (user|admin)
  +int workspace_id
  +datetime created_at
  +boolean authenticate(pw)
  +generateJWT()
}

class Session {
  +int session_id
  +int user_id
  +varchar token_hash
  +datetime expiry
  +varchar ip_address
  +isValid()
}

class Workspace {
  +int workspace_id
  +varchar name
  +varchar plan_type
  +getMembersList()
}

class WorkspaceInvitation {
  +int id
  +int inviter_id
  +varchar invitee_email
  +varchar auth_token
  +varchar status
  +accept()
}

User "1" *-- "0..*" Session : manages >
User "0..*" -- "1" Workspace : belongs to >
Workspace "1" *-- "0..*" WorkspaceInvitation : issues >
@enduml`;

const CLS2 = `@startuml\n${THEME}
title Class Diagram: CRM Contact Domain
class Contact {
  +int contact_id
  +int owner_user_id
  +varchar full_name
  +varchar email
  +varchar mobile
  +varchar company_name
  +float ai_confidence_score
  +enrichFromWeb()
}

class ContactTag {
  +int tag_id
  +varchar label
  +varchar color_hex
}

class ContactTagLink {
  +int contact_id
  +int tag_id
}

class ContactRelationship {
  +int parent_contact_id
  +int child_contact_id
  +varchar relation_type
}

Contact "1" -- "0..*" ContactTagLink
ContactTag "1" -- "0..*" ContactTagLink
Contact "1" -- "0..*" ContactRelationship : forms hierarchy
@enduml`;

const CLS3 = `@startuml\n${THEME}
title Class Diagram: Email Marketing Architecture
class EmailCampaign {
  +int campaign_id
  +varchar title
  +varchar generic_subject
  +text html_body
  +text text_body
  +datetime scheduled_at
  +varchar send_status
  +distribute()
}

class TargetAudience {
  +int audience_id
  +varchar segment_name
  +json filtering_rules
}

class EmailDeliveryLog {
  +int log_id
  +int campaign_id
  +int contact_id
  +varchar status (sent,bounced)
  +datetime read_at
}

class AIEmailDraft {
  +int draft_id
  +int user_id
  +text generated_content
  +int rating_score
}

EmailCampaign "1" -- "1" TargetAudience : utilizes >
EmailCampaign "1" -- "0..*" EmailDeliveryLog : tracks >
AIEmailDraft "0..*" -- "1" EmailCampaign : provides content >
@enduml`;

const CLS4 = `@startuml\n${THEME}
title Class Diagram: Calendar & Scheduling Systems
class CalendarEvent {
  +int event_id
  +int creator_id
  +varchar title
  +datetime ts_start
  +datetime ts_end
  +varchar google_meet_url
  +json recurrence_matrix
  +triggerReminder()
}

class EventAttendee {
  +int relation_id
  +int event_id
  +int user_id
  +varchar rsvp_status
}

class PublicBookingLink {
  +int link_id
  +varchar slug
  +int length_minutes
  +int gap_buffer
  +isActive
}

CalendarEvent "1" -- "0..*" EventAttendee : invites >
PublicBookingLink "0..*" -- "1" CalendarEvent : instantiates >
@enduml`;

const CLS5 = `@startuml\n${THEME}
title Class Diagram: Admin Policies & Metrics
class SystemAuditLog {
  +int log_id
  +int user_id
  +varchar action_type
  +varchar target_resource
  +text json_snapshot
  +datetime timestamp
}

class UserQuotaManager {
  +int quota_id
  +int user_id
  +int total_monthly_scans
  +int consumed_scans
  +datetime reset_date
  +boolean canScan()
}

class AIModelConfig {
  +int config_id
  +varchar model_version
  +float fallback_threshold
  +int api_timeout_ms
}

class BillingInvoice {
  +int invoice_id
  +int workspace_id
  +float amount_usd
  +boolean paid
}

UserQuotaManager "1" -- "1" SystemAuditLog : updates logged via >
BillingInvoice "0..*" -- "1" UserQuotaManager : increases threshold >
@enduml`;

// Prepare array of items
const diagrams = [
  { title: "USE CASE DIAGRAM", puml: USECASE, name: "01_UseCase_PlantUML" },
  { title: "ACTIVITY DIAGRAM: Card Scanning Pipeline", puml: ACT1, name: "02_Activity_CardScan" },
  { title: "ACTIVITY DIAGRAM: Email Campaign Generation & Delivery", puml: ACT2, name: "03_Activity_Email" },
  { title: "ACTIVITY DIAGRAM: User Registration & Onboarding", puml: ACT3, name: "04_Activity_Auth" },
  { title: "ACTIVITY DIAGRAM: Workspace Invitation & Onboarding", puml: ACT4, name: "05_Activity_Workspace" },
  { title: "ACTIVITY DIAGRAM: Calendar Scheduler", puml: ACT5, name: "06_Activity_Calendar" },
  
  { title: "INTERACTION DIAGRAM: AI Scan Sequence", puml: SEQ1, name: "07_Seq_Scan" },
  { title: "INTERACTION DIAGRAM: Workspace Real-Time Chat", puml: SEQ2, name: "08_Seq_Chat" },
  { title: "INTERACTION DIAGRAM: Email Follow-Up Campaign", puml: SEQ3, name: "09_Seq_Mail" },
  { title: "INTERACTION DIAGRAM: Kiosk Mode Capture", puml: SEQ4, name: "10_Seq_Kiosk" },
  { title: "INTERACTION DIAGRAM: Calendar Booking", puml: SEQ5, name: "11_Seq_Cal" },

  { title: "CLASS DIAGRAM: Core Identity & Authentication", puml: CLS1, name: "12_Class_Auth" },
  { title: "CLASS DIAGRAM: CRM Contact Domain", puml: CLS2, name: "13_Class_CRM" },
  { title: "CLASS DIAGRAM: Email Marketing Architecture", puml: CLS3, name: "14_Class_Email" },
  { title: "CLASS DIAGRAM: Calendar & Scheduling", puml: CLS4, name: "15_Class_Cal" },
  { title: "CLASS DIAGRAM: Admin Policies & Metrics", puml: CLS5, name: "16_Class_Admin" },
];

let html = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IntelliScan — Standard UML Diagrams</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; background: #fff; color: #000; }
  .page {
    width: 1000px; margin: 20px auto; background: #fff;
    padding: 30px; page-break-after: always;
  }
  h1 { font-size: 20px; text-align: left; margin-bottom: 20px; font-weight: bold; }
  .diagram { text-align: center; margin-bottom: 30px; }
  .diagram img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  th, td { border: 1px solid #000; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; font-weight: bold; }
</style>
</head>
<body>
\`;

diagrams.forEach((d, i) => {
  html += \`
  <div class="page" id="diagram-\${i}">
    <h1>\${i + 1}. \${d.title}</h1>
    <div class="diagram">
      <img src="\${getUrl(d.puml)}" alt="\${d.name}" />
    </div>
  </div>
  \`;
});

// Add Data Dictionary Page
html += \`
  <div class="page">
    <h1>17. DETAILED DATA DICTIONARY</h1>
    
    <h2>Table: users</h2>
    <table>
      <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
      <tr><td>user_id</td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Unique identifier for the user account</td></tr>
      <tr><td>email</td><td>VARCHAR(255)</td><td>NOT NULL, UNIQUE</td><td>User's login email address</td></tr>
      <tr><td>hashed_password</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Bcrypt hashed password string</td></tr>
      <tr><td>role</td><td>VARCHAR(50)</td><td>DEFAULT 'user'</td><td>RBAC assignment (user, admin, superadmin)</td></tr>
      <tr><td>workspace_id</td><td>INTEGER</td><td>FOREIGN KEY</td><td>Reference to parent workspace entity</td></tr>
      <tr><td>created_at</td><td>DATETIME</td><td>DEFAULT CURRENT_TIMESTAMP</td><td>Account creation timestamp</td></tr>
    </table>

    <br><br>
    <h2>Table: contacts</h2>
    <table>
      <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
      <tr><td>contact_id</td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Unique system identifier for the contact</td></tr>
      <tr><td>owner_user_id</td><td>INTEGER</td><td>FOREIGN KEY</td><td>User who scanned/owns this contact</td></tr>
      <tr><td>full_name</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Extracted contact person name</td></tr>
      <tr><td>email</td><td>VARCHAR(255)</td><td></td><td>Contact's business email</td></tr>
      <tr><td>phone_mobile</td><td>VARCHAR(50)</td><td></td><td>Contact's parsed phone number</td></tr>
      <tr><td>company_name</td><td>VARCHAR(255)</td><td></td><td>Extracted company/organization name</td></tr>
      <tr><td>ai_confidence_score</td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Score metric provided by AI Engine (0-100)</td></tr>
      <tr><td>scan_source</td><td>VARCHAR(50)</td><td></td><td>camera, upload, kiosk mode</td></tr>
      <tr><td>created_at</td><td>DATETIME</td><td>DEFAULT CURRENT_TIMESTAMP</td><td>Record insertion timestamp</td></tr>
    </table>

    <br><br>
    <h2>Table: calendar_events</h2>
    <table>
      <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
      <tr><td>event_id</td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Unique event record ID</td></tr>
      <tr><td>author_id</td><td>INTEGER</td><td>FOREIGN KEY</td><td>User who generated the event</td></tr>
      <tr><td>title</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Meeting subject/agenda context</td></tr>
      <tr><td>ts_start</td><td>DATETIME</td><td>NOT NULL</td><td>ISO-8601 Start timestamp</td></tr>
      <tr><td>ts_end</td><td>DATETIME</td><td>NOT NULL</td><td>ISO-8601 End timestamp</td></tr>
      <tr><td>recurrence_rule_json</td><td>TEXT</td><td></td><td>Rule settings for recurring event slots</td></tr>
      <tr><td>booking_slug</td><td>VARCHAR(100)</td><td>UNIQUE</td><td>Public parameter for sharing booking URLs</td></tr>
    </table>
    
    <br><br>
    <h2>Table: email_campaigns</h2>
    <table>
      <tr><th>Column Name</th><th>Data Type</th><th>Constraints</th><th>Description</th></tr>
      <tr><td>campaign_id</td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Reference identifier for the campaign</td></tr>
      <tr><td>workspace_id</td><td>INTEGER</td><td>FOREIGN KEY</td><td>Organizational owner of campaign</td></tr>
      <tr><td>subject_line</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Title of the outbound email</td></tr>
      <tr><td>html_content</td><td>TEXT</td><td></td><td>Body template with variables {{Name}}</td></tr>
      <tr><td>target_audience_id</td><td>INTEGER</td><td>FOREIGN KEY</td><td>List of segment members mapped</td></tr>
      <tr><td>dispatch_status</td><td>VARCHAR(20)</td><td>DEFAULT 'draft'</td><td>States: draft, scheduling, dispatched, aborted</td></tr>
    </table>
  </div>
</body>
</html>
\`;

fs.writeFileSync('IntelliScan_All_Diagrams.html', html);
console.log("Successfully generated IntelliScan_All_Diagrams.html with 16 PlantUML image links and a rich Data Dictionary table.");
