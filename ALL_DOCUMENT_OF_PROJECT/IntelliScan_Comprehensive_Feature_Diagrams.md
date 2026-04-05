# IntelliScan: Comprehensive Feature-by-Feature Diagrams

As per the academic requirement that **"all mentioned diagrams must be built for each feature,"** this document provides exactly four complete UML diagrams (`Use Case`, `Activity`, `Interaction/Sequence`, and `Class`) meticulously mapped to every core functionality of the IntelliScan Platform.

> **Note on Rendering**: These are generated using standard `Mermaid.js` syntax. To view the visual graphics, paste these code blocks into [Mermaid Live Editor](https://mermaid.live) or use any Markdown viewer that supports Mermaid (like GitHub, Notion, or VS Code).

---

# FEATURE 1: Intelligent OCR Scanner (Single & Multi-Card)

## 1.1 Use Case Diagram
```mermaid
usecaseDiagram
    actor PersonalUser as Personal User
    actor EnterpriseUser as Enterprise User
    
    usecase "Upload Image" as UC1
    usecase "Perform Batch Scan" as UC2
    usecase "Validate Dimensions" as UC3
    usecase "Extract Text via LLM" as UC4
    usecase "Normalize Contact JSON" as UC5
    usecase "Save to SQLite" as UC6
    
    PersonalUser --> UC1
    EnterpriseUser --> UC1
    EnterpriseUser --> UC2
    
    UC1 ..> UC3 : <<include>>
    UC2 ..> UC3 : <<include>>
    UC3 ..> UC4 : <<include>>
    UC4 ..> UC5 : <<include>>
    UC5 ..> UC6 : <<include>>
```

## 1.2 Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> UploadReceived
    UploadReceived --> VerifyUserQuota
    
    state VerifyUserQuota {
        [*] --> CheckDB
        CheckDB --> QuotaOK
        CheckDB --> UpgradeRequired: Exceeds Limit
    }
    
    VerifyUserQuota --> LLMExtraction: QuotaOK
    LLMExtraction --> FormatJSON
    FormatJSON --> CalculateDealScore
    CalculateDealScore --> FinalizeRecord
    FinalizeRecord --> ReturnDashboardPreview
    ReturnDashboardPreview --> [*]
```

## 1.3 Interaction Diagram (Sequence)
```mermaid
sequenceDiagram
    participant User
    participant Router as scan-multi Route
    participant Pipeline as unifiedExtractionPipeline()
    participant LLM as Gemini API
    participant DB as SQLite DB

    User->>Router: POST /api/scan-multi (Image)
    Router->>DB: Check quota limits
    DB-->>Router: Limit Approved
    Router->>Pipeline: Pass image + bulk prompt
    Pipeline->>LLM: model.generateContent()
    LLM-->>Pipeline: Return RAW JSON Array
    Pipeline->>Pipeline: extractJsonObjectFromText()
    loop Foreach Scanned Card
        Pipeline->>DB: INSERT INTO contacts
    end
    Pipeline-->>User: 200 OK (5 Contacts Saved)
```

## 1.4 Class Diagram
```mermaid
classDiagram
    class ScanController {
        +processSingleScan()
        +processMultiScan()
    }
    class ExtractionPipeline {
        +sanitizeImageBase64()
        +executeLLM()
        +normalizeCardFormat()
    }
    class ContactRecord {
        +int id
        +string name
        +string email
        +string company
        +int deal_score
        +insert()
    }
    
    ScanController --> ExtractionPipeline : utilizes
    ExtractionPipeline --> ContactRecord : creates
```

---

# FEATURE 2: Dual-Engine AI Fallback System

## 2.1 Use Case Diagram
```mermaid
usecaseDiagram
    actor AppBackend as Express Server
    actor AppAdmin as SuperAdmin
    
    usecase "Route AI Prompt" as UC1
    usecase "Execute Primary (Gemini)" as UC2
    usecase "Execute Fallback (OpenAI)" as UC3
    usecase "Pause Failing Engine" as UC4
    usecase "Return 500 Error" as UC5
    
    AppBackend --> UC1
    UC1 ..> UC2 : Primary Execution
    UC2 ..> UC3 : <<extend>> If 429/Timeout
    UC3 ..> UC5 : <<extend>> If Complete Failure
    AppAdmin --> UC4
```

## 2.2 Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> RequestAIGeneration
    RequestAIGeneration --> CheckPrimaryEngine
    
    state PrimaryAttempt {
        [*] --> CallGemini
        CallGemini --> ReturnPayload: Success
        CallGemini --> CatchError: Timeout/Missing Key
    }
    
    CheckPrimaryEngine --> PrimaryAttempt
    PrimaryAttempt --> FallbackAttempt: CatchError
    
    state FallbackAttempt {
        [*] --> FetchOpenAIKey
        FetchOpenAIKey --> CallChatGPT
        CallChatGPT --> ReturnPayload: Success
        CallChatGPT --> TotalFailure: Network Error
    }
    
    FallbackAttempt --> LogErrorAndReturn500: TotalFailure
    ReturnPayload --> [*]
```

## 2.3 Interaction Diagram
```mermaid
sequenceDiagram
    participant Endpoint as Any AI Routine
    participant Fallback as generateWithFallback()
    participant EngineDB as ai_models
    participant Gemini
    participant OpenAI

    Endpoint->>Fallback: Ask for generation
    Fallback->>EngineDB: Poll 'deployed' status
    Fallback->>Gemini: Attempt Primary AI
    Gemini--xFallback: Error 429
    Fallback->>EngineDB: Fetch 'open_ai_api_key'
    Fallback->>OpenAI: Attempt Secondary AI
    OpenAI-->>Fallback: Success Valid JSON
    Fallback-->>Endpoint: Seamless Response Delivered
```

## 2.4 Class Diagram
```mermaid
classDiagram
    class AI_Endpoint {
        +generateDescription()
        +draftEmail()
    }
    class FallbackWrapper {
        +generateWithFallback(prompt)
        -checkPrimaryKey()
        -executeSecondary()
    }
    class EngineDatabase {
        +fetchStatus(type)
        +updateStatus(id)
    }
    
    AI_Endpoint --> FallbackWrapper : calls
    FallbackWrapper --> EngineDatabase : verifies
```

---

# FEATURE 3: Smart Calendar & CRM Scheduling

## 3.1 Use Case Diagram
```mermaid
usecaseDiagram
    actor User as Calendar User
    
    usecase "Create Event" as UC1
    usecase "Generate Ghostwriter Desc." as UC2
    usecase "Delete Event" as UC3
    usecase "Send Email Notification" as UC4
    usecase "Skip Email Failure" as UC5
    
    User --> UC1
    User --> UC3
    
    UC1 ..> UC2 : <<include>>
    UC1 ..> UC4 : <<include>>
    UC3 ..> UC4 : <<include>>
    UC4 ..> UC5 : <<extend>> Server Catch Block
```

## 3.2 Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> InitiateEventDeletion
    InitiateEventDeletion --> RenderCustomModal
    RenderCustomModal --> Confirmed
    Confirmed --> RemoveSQLiteRecord
    
    state SMTP_Worker {
        [*] --> DispatchCancellationEmail
        DispatchCancellationEmail --> Delivered
        DispatchCancellationEmail --> SMTP_Timeout
        SMTP_Timeout --> SuppressCrash
    }
    
    RemoveSQLiteRecord --> SMTP_Worker
    SMTP_Worker --> Return200OK
    Return200OK --> UpdateUIViaSocket
    UpdateUIViaSocket --> [*]
```

## 3.3 Interaction Diagram
```mermaid
sequenceDiagram
    participant PC as Personal User
    participant Router as DELETE /api/calendar/events
    participant Db as sqlite_database
    participant Mailer as Nodemailer
    
    PC->>Router: Delete Calendar Event #15
    Router->>Db: DELETE FROM calendar_events
    Db-->>Router: Row count = 1
    Router->>Mailer: sendMail()
    alt Email Fails
        Mailer--xRouter: Socket Timeout
        Router-->>Router: catch(console.error) -> Suppress
    end
    Router-->>PC: 200 OK Application Does Not Crash
```

## 3.4 Class Diagram
```mermaid
classDiagram
    class CalendarEvent {
        +int event_id
        +string title
        +datetime start
        +boolean all_day
        +delete()
    }
    class EventAttendee {
        +string email
        +string status
    }
    class GhostwriterAI {
        +suggestTime()
        +autogenerateDescription()
    }
    
    CalendarEvent "1" *-- "many" EventAttendee : invites
    CalendarEvent --> GhostwriterAI : utilizes
```

---

# FEATURE 4: AI Coaching & Analytics Suite

## 4.1 Use Case Diagram
```mermaid
usecaseDiagram
    actor SalesActor as B2B Professional
    
    usecase "View Leaderboard" as UC1
    usecase "Filter Missing Context" as UC2
    usecase "Flag Stale Connections" as UC3
    usecase "Draft Follow-up Output" as UC4
    
    SalesActor --> UC1
    SalesActor --> UC2
    SalesActor --> UC3
    UC3 ..> UC4 : <<extend>>
```

## 4.2 Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> LoadNetworkCoach
    LoadNetworkCoach --> AggregateContacts
    
    state ContactFiltering {
        [*] --> EvaluateScanDate
        EvaluateScanDate --> FlagStale: Date > 14 Days
        EvaluateScanDate --> MarkFresh: Date < 14 Days
    }
    
    AggregateContacts --> ContactFiltering
    ContactFiltering --> SupplyLLMStats
    SupplyLLMStats --> GenerateActionPlan
    GenerateActionPlan --> RenderMetricsList
    RenderMetricsList --> [*]
```

## 4.3 Interaction Diagram
```mermaid
sequenceDiagram
    participant Dashboard
    participant API as /api/coach/insights
    participant DB as contacts table
    participant LLM as generateWithFallback()
    
    Dashboard->>API: GET Coach Metrics
    API->>DB: SELECT * FROM contacts WHERE user=1
    DB-->>API: 120 Contacts found
    API->>API: Process stale count and industries
    API->>LLM: Prompt with generated statistics
    LLM-->>API: Actionable Tasks JSON
    API-->>Dashboard: Return specific networking actions
```

## 4.4 Class Diagram
```mermaid
classDiagram
    class DashboardController {
        +getGlobalStats()
        +getCoachInsights()
    }
    class NetworkFilter {
        +int total
        +int staleCount
        +int missingContext
        +aggregateIndustries()
    }
    class ActionItem {
        +string intent
        +string description
        +string color
    }
    
    DashboardController --> NetworkFilter : initiates
    NetworkFilter "1" *-- "many" ActionItem : transforms into
```
