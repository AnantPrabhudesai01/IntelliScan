# IntelliScan UML Diagrams (Core Set)

Generated: 2026-04-04  
Format: Mermaid.js (`flowchart`, `stateDiagram-v2`, `sequenceDiagram`, `classDiagram`)

This file contains:

1. One Use Case Diagram (full system, core roles).
2. Five Activity Diagrams (based on five key use cases).
3. Five Interaction (Sequence) Diagrams (same five use cases).
4. Five Class Diagrams (same five use cases).

---

## A) Use Case Diagram (1)

### Use Case Diagram: IntelliScan (All Roles, Core Capabilities)

```mermaid
flowchart LR
  subgraph Actors
    A0["Anonymous Visitor"]
    A1["Personal User (Free/Pro)"]
    A2["Workspace Admin (Enterprise)"]
    A3["Super Admin"]
    S1["AI Provider (Gemini/OpenAI)"]
    S2["Payment Gateway (Razorpay)"]
    S3["Email Provider (SMTP)"]
  end

  subgraph "IntelliScan Platform"
    UC_AUTH(["Authenticate & Restore Session"])
    UC_SCAN1(["Scan Single Card"])
    UC_SCANM(["Scan Group Photo (Multi-Card)"])
    UC_BATCH(["Batch Upload Queue"])
    UC_SAVE(["Save Contact"])
    UC_CONTACTS(["Contacts CRM (Search, Filter, Enrich, Export)"])
    UC_EVENTS(["Events (Create, Assign, Filter Contacts)"])
    UC_DRAFTS(["AI Drafts (Generate, Send)"])
    UC_CAMPAIGNS(["Email Campaigns (Audience, AI Copy, Send, Track)"])
    UC_BILLING(["Billing Upgrade (Create Order, Verify Payment)"])
    UC_POLICIES(["Compliance Policies (Retention, Redaction)"])
    UC_DQ(["Data Quality (Dedupe Queue, Merge/Dismiss)"])
    UC_ADMIN(["Platform Admin (Models, Incidents, Integration Health)"])
  end

  A0 --> UC_AUTH
  A0 --> UC_SCAN1

  A1 --> UC_AUTH
  A1 --> UC_SCAN1
  A1 --> UC_SCANM
  A1 --> UC_BATCH
  A1 --> UC_SAVE
  A1 --> UC_CONTACTS
  A1 --> UC_EVENTS
  A1 --> UC_DRAFTS
  A1 --> UC_BILLING

  A2 --> UC_CONTACTS
  A2 --> UC_CAMPAIGNS
  A2 --> UC_POLICIES
  A2 --> UC_DQ
  A2 --> UC_BILLING

  A3 --> UC_ADMIN

  UC_SCAN1 -.->|includes| UC_SAVE
  UC_SCANM -.->|includes| UC_SAVE
  UC_BATCH -.->|includes| UC_SCAN1
  UC_CONTACTS -.->|extends| UC_DRAFTS
  UC_CAMPAIGNS -.->|includes| UC_CONTACTS

  UC_SCAN1 --> S1
  UC_SCANM --> S1
  UC_CAMPAIGNS --> S3
  UC_BILLING --> S2
```

Key use cases selected for the remaining diagrams:

1. Authenticate & Restore Session
2. Scan Single Card -> Save Contact -> Contacts
3. Scan Group Photo -> Save All -> Contacts
4. Email Campaigns -> Send -> Track
5. Billing Upgrade -> Tier/Quota Update

---

## B) Activity Diagrams (5)

### Activity 1: Authenticate & Restore Session

```mermaid
flowchart TD
  A([Open App]) --> B{Token Present in Storage?}
  B -- No --> C([Route to /sign-in])
  B -- Yes --> D[Load stored user role/tier (optimistic)]
  D --> E[GET /api/auth/me]
  E --> F{Response}
  F -- 200 OK --> G[Update local user profile]
  G --> H([Resolve home route and render layout])
  F -- 401/403 --> I[Clear storage + cookies]
  I --> C
  F -- 5xx/Network --> J[Keep optimistic session]
  J --> H
```

### Activity 2: Single Card Scan -> Save Contact

```mermaid
flowchart TD
  A([Upload single-card image]) --> B{Validate file type/size}
  B -- Invalid --> C([Show UI error])
  B -- Valid --> D[GET /api/user/quota]
  D --> E{Quota OK?}
  E -- No --> F([Show upgrade prompt])
  E -- Yes --> G[POST /api/scan (imageBase64, mimeType)]
  G --> H{Extraction OK?}
  H -- No --> I([Show failure banner])
  H -- Yes --> J[Render extraction preview]
  J --> K([User clicks Save Contact])
  K --> L[POST /api/contacts (normalized fields + event_id + image_url)]
  L --> M{Saved?}
  M -- 409 Duplicate --> N([Show duplicate warning])
  M -- 403 Limit --> F
  M -- 200 OK --> O[Update ContactContext state]
  O --> P([Contact appears in Contacts + downstream pages])
```

### Activity 3: Group Photo Scan -> Save All New

```mermaid
flowchart TD
  A([Upload group-photo image]) --> B[GET /api/user/quota]
  B --> C{Group quota OK?}
  C -- No --> D([Show upgrade prompt])
  C -- Yes --> E[POST /api/scan-multi]
  E --> F{Cards detected?}
  F -- No --> G([Show "no cards detected" help state])
  F -- Yes --> H[Normalize cards + mark duplicates]
  H --> I([Render results table: 2-25 cards])
  I --> J([User clicks Save All New])
  J --> K{For each card not duplicate}
  K --> L[POST /api/contacts]
  L --> M{Saved?}
  M -- Duplicate --> N[Mark as duplicate in UI]
  M -- Success --> O[Mark as saved in UI]
  O --> P([Contacts list updates immediately])
```

### Activity 4: Email Campaign (Audience -> AI Copy -> Send -> Track)

```mermaid
flowchart TD
  A([Open Workspace Campaigns]) --> B[GET /api/campaigns]
  B --> C([Select target industry + seniority])
  C --> D[GET /api/campaigns/audience-preview]
  D --> E{Audience > 0?}
  E -- No --> F([Suggest scanning more contacts])
  E -- Yes --> G([Auto-write email content])
  G --> H[POST /api/campaigns/auto-write]
  H --> I([User reviews subject/body])
  I --> J([Send campaign])
  J --> K[POST /api/campaigns/send]
  K --> L[SMTP delivery attempt]
  L --> M([Recipients receive email with tracking])
  M --> N([Open/Click events fire tracking endpoints])
  N --> O([Campaign analytics updates])
```

### Activity 5: Billing Upgrade (Razorpay) -> Tier/Quota Refresh

```mermaid
flowchart TD
  A([Open Billing Page]) --> B[GET /api/billing/plans]
  B --> C([User selects Pro/Enterprise])
  C --> D[POST /api/billing/create-order]
  D --> E{Simulated order?}
  E -- Yes --> F([Demo mode: skip gateway])
  E -- No --> G([Launch Razorpay Checkout])
  G --> H([Payment success])
  H --> I[POST /api/billing/verify-payment]
  F --> I
  I --> J{Verified?}
  J -- No --> K([Show verification failed])
  J -- Yes --> L[DB: users.tier updated + invoice row created]
  L --> M([Frontend refreshes /api/auth/me])
  M --> N([New tier unlocks quotas + gated features])
```

---

## C) Interaction (Sequence) Diagrams (5)

### Interaction 1: Session Restore on App Load

```mermaid
sequenceDiagram
  participant U as User
  participant FE as React App
  participant RC as RoleContext
  participant API as Express API
  participant DB as users/sessions

  U->>FE: Open app / refresh
  FE->>RC: Bootstrap from storage
  RC->>API: GET /api/auth/me (Bearer token)
  API->>DB: Validate token + load user profile
  DB-->>API: user(role,tier,...)
  API-->>RC: 200 OK + user JSON
  RC-->>FE: role/tier ready
  FE-->>U: Render correct dashboard route
```

### Interaction 2: Single Scan -> Save Contact

```mermaid
sequenceDiagram
  participant U as User
  participant FE as ScanPage
  participant API as /api/scan
  participant PIPE as unifiedExtractionPipeline
  participant GEM as Gemini/OpenAI
  participant DB as contacts/user_quotas
  participant CC as ContactContext

  U->>FE: Upload single image
  FE->>API: POST /api/scan (base64)
  API->>DB: ensureQuotaRow + check used_count
  DB-->>API: quota ok
  API->>PIPE: run extraction prompt
  PIPE->>GEM: generateContent / chat.completions
  GEM-->>PIPE: JSON extraction
  PIPE-->>API: normalized fields
  API-->>FE: 200 extracted contact preview
  U->>FE: Click "Save Contact"
  FE->>CC: addContact(contact)
  CC->>DB: POST /api/contacts
  DB-->>CC: 200 created {id}
  CC-->>FE: update contacts state
  FE-->>U: Contact visible in Contacts page
```

### Interaction 3: Group Scan -> Save All

```mermaid
sequenceDiagram
  participant U as User
  participant FE as ScanPage(Group)
  participant API as /api/scan-multi
  participant PIPE as unifiedExtractionPipeline
  participant GEM as Gemini/OpenAI
  participant DB as contacts/user_quotas

  U->>FE: Upload group photo
  FE->>API: POST /api/scan-multi (base64)
  API->>DB: check group_scans_used
  DB-->>API: quota ok
  API->>PIPE: run group-photo prompt
  PIPE->>GEM: generateContent
  GEM-->>PIPE: { cards: [...] }
  PIPE-->>API: parsed cards array
  API->>DB: detect duplicates (email/name)
  API-->>FE: 200 cards + is_duplicate flags
  U->>FE: Click "Save All New"
  loop For each non-duplicate card
    FE->>DB: POST /api/contacts
    DB-->>FE: 200 created
  end
  FE-->>U: Saved cards appear in Contacts list
```

### Interaction 4: Email Campaign Send + Tracking

```mermaid
sequenceDiagram
  participant Admin as Workspace Admin
  participant FE as EmailCampaignsPage
  participant API as Express API
  participant DB as contacts/email_campaigns/email_sends
  participant SMTP as SMTP Provider
  participant Recipient as Recipient Inbox

  Admin->>FE: Open Campaign Builder
  FE->>API: GET /api/campaigns/audience-preview
  API->>DB: SELECT contacts by inferred fields
  DB-->>API: audience list
  API-->>FE: audience size
  Admin->>FE: Click "Auto-Write Email"
  FE->>API: POST /api/campaigns/auto-write
  API-->>FE: subject/body
  Admin->>FE: Click "Send"
  FE->>API: POST /api/campaigns/send
  API->>DB: INSERT email_campaigns + recipients
  API->>SMTP: sendMail (per recipient)
  SMTP-->>Recipient: Deliver email
  Recipient->>API: GET /api/email/track/open/:trackingId (pixel)
  API->>DB: INSERT/UPDATE email_sends opens
  Recipient->>API: GET /api/email/track/click/:trackingId (link)
  API->>DB: INSERT email_clicks
  API-->>FE: Analytics available
```

### Interaction 5: Billing Upgrade (Razorpay)

```mermaid
sequenceDiagram
  participant User as User
  participant FE as BillingPage
  participant API as Express API
  participant RZP as Razorpay
  participant DB as billing_orders/users/billing_invoices

  User->>FE: Select plan (pro/enterprise)
  FE->>API: POST /api/billing/create-order
  API->>RZP: Create order (amount, currency)
  RZP-->>API: order_id
  API->>DB: INSERT billing_orders(status=created)
  API-->>FE: order_id + key_id
  FE->>RZP: Open checkout
  RZP-->>FE: payment_id + signature
  FE->>API: POST /api/billing/verify-payment
  API->>API: Verify signature (HMAC)
  API->>DB: UPDATE billing_orders(status=paid)
  API->>DB: UPDATE users.tier
  API->>DB: INSERT billing_invoices
  API-->>FE: 200 verified + upgraded
  FE-->>User: UI unlocks new tier + quotas
```

---

## D) Class Diagrams (5)

### Class 1: Authentication & Access Profile

```mermaid
classDiagram
  class User {
    +int id
    +string name
    +string email
    +string role
    +string tier
    +int? workspace_id
  }

  class Session {
    +int id
    +int user_id
    +string token
    +datetime created_at
    +datetime expires_at
  }

  class AccessProfile {
    +string role
    +string tier
    +map feature_flags
    +Limits limits
  }

  class RoleContext {
    +string role
    +string tier
    +bool isAuthReady
    +bootstrap()
    +signOut()
  }

  class AuthAPI {
    +POST /api/auth/login()
    +POST /api/auth/register()
    +GET /api/auth/me()
  }

  User "1" --> "0..*" Session : has
  RoleContext --> AuthAPI : calls
  AuthAPI --> AccessProfile : returns
```

### Class 2: Single Scan Pipeline

```mermaid
classDiagram
  class ScanPage {
    +uploadImage()
    +requestScan()
    +saveContact()
  }

  class ScanAPI {
    +POST /api/scan(imageBase64,mimeType)
  }

  class UnifiedExtractionPipeline {
    +tryGemini()
    +tryOpenAI()
    +tryTesseract()
    +normalizeExtractedCard()
  }

  class UserQuota {
    +int user_id
    +int used_count
    +int limit_amount
    +int group_scans_used
    +datetime last_reset_date
  }

  class Contact {
    +int id
    +int user_id
    +string name
    +string email
    +string company
    +string job_title
    +int confidence
    +string engine_used
    +int deal_score
    +string detected_language
  }

  class ContactContext {
    +contacts[]
    +addContact(contact)
    +deleteContact(id)
  }

  ScanPage --> ScanAPI : calls
  ScanAPI --> UnifiedExtractionPipeline : uses
  ScanAPI --> UserQuota : checks
  ContactContext --> Contact : stores
```

### Class 3: Group Scan Pipeline

```mermaid
classDiagram
  class ScanMultiAPI {
    +POST /api/scan-multi(imageBase64,mimeType)
  }

  class DuplicateChecker {
    +checkAgainstDB(email,name,phone,company)
    +checkIntraBatch(fingerprint)
  }

  class MultiScanResult {
    +string engine_used
    +Contact[] cards
    +int total_detected
  }

  ScanMultiAPI --> UnifiedExtractionPipeline : uses
  ScanMultiAPI --> DuplicateChecker : uses
  MultiScanResult "1" *-- "many" Contact : contains
```

### Class 4: Email Campaign System

```mermaid
classDiagram
  class EmailCampaign {
    +int id
    +int workspace_id
    +string name
    +string subject
    +string body
    +string status
    +datetime created_at
  }

  class AudienceBuilder {
    +buildAudience(industry,seniority)
    +dedupeEmails()
  }

  class EmailSend {
    +int id
    +int campaign_id
    +string email
    +int open_count
    +datetime sent_at
  }

  class EmailClick {
    +int id
    +int send_id
    +string url
    +datetime clicked_at
  }

  class CampaignAPI {
    +GET /api/campaigns/audience-preview()
    +POST /api/campaigns/auto-write()
    +POST /api/campaigns/send()
  }

  CampaignAPI --> AudienceBuilder : uses
  EmailCampaign "1" --> "many" EmailSend : sends
  EmailSend "1" --> "many" EmailClick : clicks
```

### Class 5: Billing (Razorpay) + Invoices

```mermaid
classDiagram
  class BillingOrder {
    +int id
    +int user_id
    +int workspace_id
    +string plan_id
    +int amount_paise
    +string currency
    +string razorpay_order_id
    +string status
    +bool simulated
  }

  class Invoice {
    +int id
    +int workspace_id
    +string invoice_number
    +int amount_cents
    +string currency
    +string status
    +datetime issued_at
  }

  class RazorpayClient {
    +createOrder(amount,currency,receipt,notes)
    +verifySignature(orderId,paymentId,signature)
  }

  class BillingAPI {
    +POST /api/billing/create-order()
    +POST /api/billing/verify-payment()
    +GET /api/workspace/billing/overview()
  }

  BillingAPI --> RazorpayClient : uses
  BillingAPI --> BillingOrder : persists
  BillingAPI --> Invoice : creates
  BillingOrder --> User : upgrades tier
```

