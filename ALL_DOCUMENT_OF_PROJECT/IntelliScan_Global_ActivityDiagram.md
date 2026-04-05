# IntelliScan — Global System Activity Diagram

This diagram represents the **High-Level Operational Flow** of the entire IntelliScan platform, from initial landing and authentication through the core OCR scanning loop to CRM synchronization and logout.

```mermaid
stateDiagram-v2
    [*] --> LandingPage
    LandingPage --> LoginPage: Login Clicked
    LandingPage --> RegistrationPage: Sign Up Clicked

    state Authentication {
        [*] --> ValidateCredentials
        ValidateCredentials --> MFA_Check: Success (if enabled)
        ValidateCredentials --> ErrorMessage: Fail
        MFA_Check --> GenerateJWT
    }

    LoginPage --> Authentication
    RegistrationPage --> Authentication

    Authentication --> Dashboard: JWT Authorized

    state DashboardActions {
        [*] --> MainMenu
        MainMenu --> QuickScan: Upload Card
        MainMenu --> MultiScan: Bulk Upload
        MainMenu --> ContactManager: View Rolodex
        MainMenu --> CalendarEngine: Schedule Event
        MainMenu --> EmailMarketing: Launch Campaign
        MainMenu --> UserSettings: Config Keys/Theme
    }

    Dashboard --> DashboardActions

    state OCR_Scanning_Pipeline {
        [*] --> ImageValidation
        ImageValidation --> QuotaStatus: Valid
        QuotaStatus --> AI_Extraction_Attempt: Active
        
        state AI_Fallback_Logic {
            [*] --> TryGemini
            TryGemini --> SuccessResponse: OK
            TryGemini --> TryOpenAI: Gemini Error (429/500)
            TryOpenAI --> SuccessResponse: OK
            TryOpenAI --> TesseractOCR: OpenAI Error
        }
        
        AI_Extraction_Attempt --> AI_Fallback_Logic
        AI_Fallback_Logic --> SaveToSQLite: Success
    }

    state CRM_Lifecycle {
        [*] --> NormalizeJSON
        NormalizeJSON --> AICalculateDealScore
        AICalculateDealScore --> PushToSalesforce: (If Linked)
        AICalculateDealScore --> TriggerWebhook: (If Enabled)
    }

    QuickScan --> OCR_Scanning_Pipeline
    MultiScan --> OCR_Scanning_Pipeline
    OCR_Scanning_Pipeline --> CRM_Lifecycle
    CRM_Lifecycle --> DashboardActions

    DashboardActions --> Logout
    Logout --> [*]
```

> **Note**: For the 20 individual feature-specific activity diagrams, please refer to the `IntelliScan_ActivityDiagrams.md` file already in your project folder.
