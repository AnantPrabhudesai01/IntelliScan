# IntelliScan: Use Case Diagrams & Role Analysis

> **Note:** This document continues the academic Phase-2 report. It details the system actors and presents technical Use Case Diagrams (written in standard UML flow structure) that map exactly to the IntelliScan functionality.

---

## 4.1 System Actors (Roles)

The IntelliScan platform operates on a strict Multi-Tenant Role-Based Access Control (RBAC) architecture. The system identifies four distinct actors:

1. **Public User (Anonymous):** External individuals who do not have an IntelliScan account. They interact with outward-facing features like Public Profiles and Calendar Booking links.
2. **Workspace Member (Sales Rep):** The primary daily user of the system. They attend events, scan cards, manage their personal deal pipeline, and draft follow-up emails.
3. **Enterprise Admin (Workspace Owner):** The manager of a company's workspace. They configure global Routing Rules, oversee the Shared Rolodex, manage enterprise-wide Email Campaigns, and handle Data Quality (deduplication).
4. **Platform Super Admin:** The system developer/administrator. They oversee the entire platform's health, manage the API Sandbox, tune the Google Gemini AI models, and monitor background Job Queues.

---

## 4.2 Comprehensive High-Level Use Case Diagram

This diagram provides a high-level overview of how the primary actors interact with the core modules of the IntelliScan system.

```mermaid
flowchart LR
    %% Actors
    Pub((Public User))
    Member((Sales Rep))
    Admin((Enterprise Admin))
    Super((Super Admin))

    %% System Boundary
    subgraph IntelliScan Platform
        %% Member Use Cases
        UC1([Scan Business Card with AI])
        UC2([Manage Kanban Pipeline])
        UC3([Send AI Follow-up Email])
        
        %% Admin Use Cases
        UC4([Configure Routing Rules])
        UC5([Manage Shared Rolodex])
        UC6([Launch Mass Email Campaigns])
        
        %% Public Use Cases
        UC7([View Digital Business Card])
        UC8([Book Calendar Meeting])
        
        %% Super Admin Use Cases
        UC9([Tune AI OCR Models])
        UC10([Monitor System Queues])
    end

    %% Connections
    Pub --> UC7
    Pub --> UC8
    
    Member --> UC1
    Member --> UC2
    Member --> UC3
    
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC2
    
    Super --> UC9
    Super --> UC10
```

---

## 4.3 Detailed Use Cases by Role

### A) Sales Representative (Workspace Member) Use Cases
The Sales Representative focuses on individual data capture and immediate relationship management.

```mermaid
flowchart LR
    Actor((Sales Rep))
    
    subgraph Data Capture
        SC1([Upload Card Image])
        SC2([Review AI Extracted Data])
        SC3([Trigger CRM Export])
    end
    
    subgraph Pipeline & Communication
        PL1([Move Deal to Next Stage])
        PL2([Draft Email via AI Composer])
        PL3([Chat with Team on Contact])
    end

    Actor --> SC1
    SC1 -.->|Includes| SC2
    SC2 -.->|Extends| SC3
    
    Actor --> PL1
    Actor --> PL2
    Actor --> PL3
```
* **Use Case Description:** The Rep uploads an image. They review the AI's extraction (Confidence Score). They can optionally push this data directly to Salesforce. They then move the contact into a pipeline stage and use the AI Composer to automatically draft a follow-up email based on the contact's inferred industry.

---

### B) Enterprise Admin Use Cases
The Enterprise Admin focuses on workspace hygiene, team configuration, and macro-level marketing.

```mermaid
flowchart LR
    Actor((Enterprise Admin))
    
    subgraph Administration
        AD1([Manage Team Members])
        AD2([Set PII Data Policies])
        AD3([Create Lead Routing Rules])
    end
    
    subgraph Marketing & Quality
        MQ1([Merge Duplicate Contacts])
        MQ2([Create Audience Segments])
        MQ3([View Campaign Analytics])
    end

    Actor --> AD1
    Actor --> AD2
    Actor --> AD3
    Actor --> MQ1
    Actor --> MQ2
    Actor --> MQ3
```
* **Use Case Description:** The Admin configures Routing Rules (e.g., "If AI detects an Executive, route to Senior Rep"). They monitor the Data Quality Center to merge duplicate contacts scanned by different reps. They also build Audience Segments (Lists) to send mass AI-generated email campaigns.

---

### C) Platform Super Admin Use Cases
The Super Admin operates entirely behind the scenes, ensuring the AI and background engines process correctly.

```mermaid
flowchart LR
    Actor((Super Admin))
    
    subgraph Engine Health
        EH1([View System Incident Center])
        EH2([Restart Failed CRON Jobs])
        EH3([Monitor API Key Quotas])
    end
    
    subgraph AI Configuration
        AI1([A/B Test Custom Models])
        AI2([Tune Confidence Thresholds])
        AI3([Test in API Sandbox])
    end

    Actor --> EH1
    EH1 -.->|Extends| EH2
    Actor --> EH3
    
    Actor --> AI1
    Actor --> AI2
    Actor --> AI3
```
* **Use Case Description:** The Super Admin does not deal with customer pipelines. They use the API Sandbox to test new integrations. If emails fail to send, they clear the Job Queues. They monitor the AI Training Tuning page to adjust how aggressively the Gemini model guesses missing data.

---

### D) Public User Use Cases
The Public User interacts with the unauthenticated zones of the platform.

```mermaid
flowchart LR
    Actor((Public User))
    
    subgraph External Interfaces
        EX1([Access /profile/slug URL])
        EX2([Download vCard to Phone])
        EX3([Select Meeting Time Slot])
        EX4([Submit Booking Notes])
    end

    Actor --> EX1
    EX1 -.->|Extends| EX2
    
    Actor --> EX3
    EX3 -.->|Includes| EX4
```
* **Use Case Description:** A person receives a link to a Rep's Profile. They view the digital card and click "Download vCard" to instantly save the contact to their phone. They click the Booking link, select an available calendar slot, and submit their notes to schedule a meeting.
