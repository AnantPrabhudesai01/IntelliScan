# IntelliScan — Global Interaction (Sequence) Diagram

This diagram provides a high-level overview of how the **User, Frontend, Backend API, AI Services (Gemini/OpenAI Cluster), and SQLite Database** interact across a standard session.

```mermaid
sequenceDiagram
    participant User
    participant UI as React Frontend
    participant API as Express Backend
    participant DB as SQLite DB
    participant AI as AI Engine Cluster

    User->>UI: Logs in with credentials
    UI->>API: POST /api/auth/login
    API->>DB: Validate user & tier
    DB-->>API: User details returned
    API-->>UI: 200 OK + JWT Status
    UI-->>User: Navigate to Dashboard

    User->>UI: Uploads business card
    UI->>API: POST /api/scan (Base64 Image)
    API->>DB: Check scan quota & AI status
    DB-->>API: Quota Approved
    API->>AI: generateWithFallback(Image)
    Note over AI: Primary (Gemini) -> Fallback (OpenAI)
    AI-->>API: Structured Contact JSON
    API->>DB: INSERT into contacts table
    API-->>UI: 200 OK + Extracted Data
    UI-->>User: Render Contact Preview

    User->>UI: Export to CSV / Save to CRM
    UI->>API: POST /api/export
    API->>DB: Fetch user contact range
    DB-->>API: Returns contact collection
    API-->>UI: Downloadable CSV Stream
    UI-->>User: Trigger Browser Download
```

> **Note**: For the 20 detailed, feature-specific interaction (sequence) diagrams, please refer to the `IntelliScan_InteractionDiagrams.md` file in your project folder.
