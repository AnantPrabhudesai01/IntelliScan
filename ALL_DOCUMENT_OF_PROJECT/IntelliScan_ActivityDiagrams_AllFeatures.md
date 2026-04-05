# IntelliScan — Complete Activity Diagrams (All Features)

> Every diagram below uses valid **Mermaid.js** `stateDiagram-v2` or `flowchart TD` syntax to represent the Activity workflows and state changes for the 20 core features of IntelliScan.
> Paste any block into [mermaid.live](https://mermaid.live) to see the rendered graphic.

---

## FEATURE 1: Authentication & User Onboarding Workflow
**Description**: The process flow from an anonymous user hitting the landing page through registration and completing the onboarding wizard.

```mermaid
stateDiagram-v2
    [*] --> LandingPage
    LandingPage --> RegistrationChoice
    
    state RegistrationChoice {
        [*] --> SelectTier
        SelectTier --> EnterCredentials
        EnterCredentials --> ValidateInput
    }
    
    RegistrationChoice --> GenerateJWT : Success
    GenerateJWT --> CheckOnboardingStatus
    
    state CheckOnboardingStatus {
        [*] --> IsFirstLogin
        IsFirstLogin --> LaunchWizard : Yes
        IsFirstLogin --> LoadDashboard : No
    }
    
    LaunchWizard --> CompleteProfile
    CompleteProfile --> LoadDashboard
    LoadDashboard --> [*]
```

---

## FEATURE 2: Single Card OCR Scanning Workflow
**Description**: The step-by-step pipeline when a user uploads a photo of a single business card.

```mermaid
flowchart TD
    A([Start: Upload Base64 Image]) --> B{Validate Extension & Size}
    B -- Invalid --> C([Show Error Toast])
    B -- Valid --> D{Check Scan Quota}
    D -- Exceeded --> E([Show Upgrade Modal])
    D -- OK --> F[Check AI Engine Status]
    F --> G[Route Image to Gemini]
    G --> H{LLM Extraction Success?}
    H -- Timeout/429 --> I[Route Image to OpenAI Fallback]
    I --> J{OpenAI Extraction Success?}
    J -- Failed --> K([Return 503 Models Disabled])
    H -- Success --> L[Normalize Schema JSON]
    J -- Success --> L
    L --> M[Calculate Target Deal Score]
    M --> N[INSERT into SQLite 'contacts' table]
    N --> O([Return 200 OK & Render Preview])
```

---

## FEATURE 3: Multi-Card Group Scanner Workflow
**Description**: The logic flow for enterprise users taking a photo of a large group of cards scattered on a table.

```mermaid
stateDiagram-v2
    [*] --> GroupUploadInitiated
    GroupUploadInitiated --> VerifyEnterpriseTier
    
    VerifyEnterpriseTier --> ProcessBulkPrompt : Verified
    VerifyEnterpriseTier --> ShowLockScreen : Failed
    
    state ProcessBulkPrompt {
        [*] --> SendToLLM
        SendToLLM --> ReceiveJSONArray
        ReceiveJSONArray --> ForEachCard
    }
    
    ProcessBulkPrompt --> ValidateArray
    ValidateArray --> TransactionStart
    
    state TransactionStart {
        [*] --> InsertCard1
        InsertCard1 --> InsertCardN
        InsertCardN --> UpdateTotalQuotaUsed
    }
    
    TransactionStart --> DisplayBatchResults
    DisplayBatchResults --> [*]
```

---

## FEATURE 4: Contact Management (CRUD) Workflow
**Description**: The interaction flow for users browsing and modifying their digital Rolodex.

```mermaid
flowchart TD
    A([Start: Open Contacts]) --> B[Fetch Contacts from DB]
    B --> C{User Action}
    
    C -- Search --> D[Query Name/Company] --> E[Update UI List]
    C -- Filter --> F[Apply Industry Tags] --> E
    C -- Edit --> G[Open Edit Modal] --> H[Update DB Record] --> E
    C -- Delete --> I[Open Delete Modal] --> J[Set is_deleted=1] --> E
    C -- Export --> K[Generate CSV Buffer] --> L([Trigger File Download])
    
    E --> C
```

---

## FEATURE 5: AI Dual-Engine Fallback Workflow
**Description**: The high-level resilience workflow that forces failovers during API outages.

```mermaid
stateDiagram-v2
    [*] --> APIRequestReceived
    APIRequestReceived --> FetchEngineStatuses
    
    state EngineRouting {
        [*] --> TryPrimary
        TryPrimary --> CheckFailState
    }
    
    EngineRouting --> Success : Status 200 JSON
    EngineRouting --> TriggerFailover : Catch Error (Timeout/429)
    
    state TriggerFailover {
        [*] --> LoadSecondaryKey
        LoadSecondaryKey --> FetchSecondaryEndpoint
    }
    
    TriggerFailover --> Success : Status 200 JSON
    TriggerFailover --> HardFailure : Both Engines Dead
    
    HardFailure --> RenderGracefulError
    Success --> [*]
```

---

## FEATURE 6: Calendar & Event Scheduling Workflow
**Description**: How the app creates an event, triggers the ghostwriter, and handles SMTP email distribution.

```mermaid
flowchart TD
    A([Start: Click Create Event]) --> B[Fill Basic Details]
    B --> C{Use AI Ghostwriter?}
    C -- Yes --> D[Generate Description with LLM] --> E[Auto-fill Textarea]
    C -- No --> E
    E --> F[Add Guests]
    F --> G[Save Event to DB]
    G --> H[Queue SMTP Invites]
    H --> I{Network/SMTP Stable?}
    I -- True --> J[Emails Delivered]
    I -- False --> K[Catch Error Silently]
    J --> L([Close Modal & Update UI])
    K --> L
```

---

## FEATURE 7: AI Networking Coach Workflow
**Description**: The automated logic that parses the database to build a user's actionable "health" dashboard.

```mermaid
stateDiagram-v2
    [*] --> LoadDashboard
    LoadDashboard --> AggregateDatabase
    
    state FilteringEngine {
        [*] --> CheckScanDates
        CheckScanDates --> IdentifyOlderThan14Days
        IdentifyOlderThan14Days --> ExtractMissingFields
    }
    
    AggregateDatabase --> FilteringEngine
    FilteringEngine --> CompileStatisticsString
    CompileStatisticsString --> GenerateActionPlanViaLLM
    GenerateActionPlanViaLLM --> RenderWidgets
    RenderWidgets --> [*]
```

---

## FEATURE 8: Email Marketing Campaigns Workflow
**Description**: The flow for creating an HTML campaign, targeting users, and firing the tracking dispatch.

```mermaid
flowchart TD
    A([Start: New Campaign]) --> B[Define Subject & List]
    B --> C{Write Content Method}
    C -- AI Gen --> D[LLM Writes Copy] --> E[Template Editor]
    C -- Manual --> E
    E --> F[Send Test Email]
    F --> G{Approve?}
    G -- No --> E
    G -- Yes --> H[Initiate Broadcast Loop]
    H --> I[Inject Tracking Pixels]
    I --> J[Dispatch via SMTP]
    J --> K[Log to email_sends DB]
    K --> L([Campaign Marked as 'Sent'])
```

---

## FEATURE 9: CRM Integration (Salesforce / HubSpot) Workflow
**Description**: Step-by-step logic for mapping custom fields and performing an API-based push to an external CRM.

```mermaid
stateDiagram-v2
    [*] --> ChooseProvider
    ChooseProvider --> SetupOAuth
    
    state FieldMapping {
        [*] --> MatchIntelliScanFields
        MatchIntelliScanFields --> MatchCRMFields
        MatchCRMFields --> DefineCustomRules
    }
    
    SetupOAuth --> FieldMapping
    FieldMapping --> TestConnection
    TestConnection --> PerformSync
    
    state PerformSync {
        [*] --> IterateContacts
        IterateContacts --> SubmitPayload
        SubmitPayload --> LogToSyncHistory
    }
    
    PerformSync --> [*]
```

---

## FEATURE 10: Gamified Leaderboard Workflow
**Description**: Execution flow for calculating points across a workspace based on scans.

```mermaid
flowchart TD
    A([User Views Leaderboard]) --> B[Query all Workspace Users]
    B --> C[Count Contacts Scanned]
    C --> D[Count Deal Quality Score Avgs]
    D --> E[Calculate Point Modifier]
    E --> F[Sort Array Descending]
    F --> G[Assign Badges top 3]
    G --> H([Render Table])
```

---

## FEATURE 11: Digital Card Creator Workflow
**Description**: Flow for personalizing a digital profile and creating a shareable public link.

```mermaid
stateDiagram-v2
    [*] --> BaseProfileLoad
    BaseProfileLoad --> EditDetails
    
    state Customization {
        [*] --> ChooseTheme
        ChooseTheme --> AddSocialLinks
        AddSocialLinks --> UploadHeadshot
    }
    
    EditDetails --> Customization
    Customization --> GenerateUniqueSlug
    GenerateUniqueSlug --> StoreInDB
    StoreInDB --> RenderQRCode
    RenderQRCode --> [*]
```

---

## FEATURE 12: SuperAdmin Engine Management Workflow
**Description**: The logic handling when a Super Admin deploys or pauses a global AI Engine.

```mermaid
flowchart TD
    A([Admin Clicks 'Pause' Engine]) --> B[Check JWT Super_Admin Role]
    B -- Invalid --> C([Throw 403 Forbidden])
    B -- Valid --> D[UPDATE ai_models SET status='paused']
    D --> E[Return 200 OK]
    E --> F[Broadcast new state locally]
    F --> G[Future /api/scan requests will naturally skip this engine]
```

---

## FEATURE 13: Workspace Collaboration Workflow
**Description**: Inviting users to join a team pipeline and sharing contacts to the collective Rolodex.

```mermaid
stateDiagram-v2
    [*] --> AdminViewsWorkspace
    AdminViewsWorkspace --> GenerateInviteLink
    GenerateInviteLink --> ProspectAcceptsInvite
    
    state Assignment {
        [*] --> AssignRole
        AssignRole --> AssignDataPolicies
    }
    
    ProspectAcceptsInvite --> Assignment
    Assignment --> UserScansCard
    UserScansCard --> PushToSharedRolodex
    PushToSharedRolodex --> [*]
```

---

## FEATURE 14: Analytics & Reporting Workflow
**Description**: Executing complex aggregation queries to display real-time global telemetry.

```mermaid
flowchart TD
    A([Admin Opens Analytics]) --> B[Perform Weekly GroupBy Date Query]
    B --> C[Perform AI Accuracy Query]
    C --> D[Rank Top Industries]
    D --> E[Format ChartJS Data Sets]
    E --> F([Mount Interface Components])
    F --> G{User Adjusts Date Range}
    G -- Triggers Re-fetch --> B
```

---

## FEATURE 15: Billing & Subscriptions Workflow
**Description**: Attempting an upgrade, checking with Payment Gateway, and altering the quota limits.

```mermaid
stateDiagram-v2
    [*] --> UserClicksUpgrade
    UserClicksUpgrade --> SelectTier
    
    state PaymentProcess {
        [*] --> EnterCardDetails
        EnterCardDetails --> CreateRazorpayOrder
        CreateRazorpayOrder --> VerifyPaymentSignature
    }
    
    SelectTier --> PaymentProcess
    PaymentProcess --> CardFailed : Decline
    PaymentProcess --> DBUpdate : Success
    
    DBUpdate --> SetTierToEnterprise
    SetTierToEnterprise --> UnlockHigherQuotas
    UnlockHigherQuotas --> [*]
```

---

## FEATURE 16: AI Drafts & Auto-Responder Workflow
**Description**: Selecting a contact, fetching their context, and drafting an outreach email.

```mermaid
flowchart TD
    A([Click 'Draft Follow Up']) --> B[Load Contact Context]
    B --> C[Pass to generateWithFallback]
    C --> D[Extract Draft Object]
    D --> E[Render Email Editable Area]
    E --> F{User Action}
    F -- Save --> G[INSERT into ai_drafts]
    F -- Send --> H[Trigger SMTP Send]
    G --> I([Return to List])
    H --> I
```

---

## FEATURE 17: Kiosk Mode Conference Workflow
**Description**: The specialized rapid-fire UI loop that never leaves the camera screen.

```mermaid
stateDiagram-v2
    [*] --> LaunchKioskMode
    LaunchKioskMode --> FullScreenCamera
    
    state LoopScan {
        [*] --> CaptureImage
        CaptureImage --> SendToAPI
        SendToAPI --> DisplayToastSuccess
        DisplayToastSuccess --> ClearStateForNextScan
    }
    
    FullScreenCamera --> LoopScan
    LoopScan --> TerminateKiosk : Click Exit
    TerminateKiosk --> LoadStandardDashboard
    LoadStandardDashboard --> [*]
```

---

## FEATURE 18: Meeting Presence & Signals Workflow
**Description**: Tracking event attendees and assessing lead quality based on interaction.

```mermaid
flowchart TD
    A([View Active Meeting]) --> B[Query event_attendees table]
    B --> C{Attendee Accepted?}
    C -- Yes --> D[Flag as Present / High Signal]
    C -- No --> E[Review Resend Options]
    D --> F[Calculate Signal Score]
    F --> G([Display High Priority UI])
```

---

## FEATURE 19: Settings & Profile Config Workflow
**Description**: Altering core user configurations such as themes and API Keys.

```mermaid
stateDiagram-v2
    [*] --> OpenSettings
    OpenSettings --> ChangePreference
    
    state Modifications {
        [*] --> UpdateTheme
        UpdateTheme --> WriteToLocalStorage
        [*] --> UpdateOpenAIKey
        UpdateOpenAIKey --> StoreInEngineConfigDB
    }
    
    ChangePreference --> Modifications
    Modifications --> UpdateGlobalState
    UpdateGlobalState --> [*]
```

---

## FEATURE 20: Support Chatbot Workflow
**Description**: Users seeking help via the platform's omnipresent AI assistant widget.

```mermaid
flowchart TD
    A([User Opens Chatbot]) --> B[Type Query]
    B --> C[Prepend System Rules to Prompt]
    C --> D[Send to generateWithFallback]
    D --> E{Response OK?}
    E -- Error --> F[Render Hardcoded Fallback Help]
    E -- Success --> G[Append Message to Chat History]
    G --> H([Scroll UI to Bottom])
    F --> H
```
