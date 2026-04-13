# IntelliScan: Project Requirements & Analysis

> **Note:** This document continues the academic formatting requirements for the SVIT MCA Phase-2 report, covering Assumptions, Constraints, Functional Requirements, Targeted Users, and the introduction to System Diagrams tailored specifically to the IntelliScan architecture.

---

### 1.7 Assumptions and Constraints

**Assumptions: -**

A) Users will have basic computer and mobile literacy, alongside internet access to operate the system.
B) The business utilizing the platform will maintain active SMTP credentials or Google Workspace settings to facilitate the automated email sequences.
C) Users should be employed or authorized personnel within an enterprise workspace to access the Shared Rolodex.
D) The System will primarily be accessed via a web browser on desktop for pipeline management, and via mobile browsers/tablets (Kiosk Mode) for active card scanning.
E) Adequate server resources will be available to host the web app and handle concurrent AI processing requests.

**Constraints: -**

A) AI Processing Dependency: The core OCR and demographic inference relies on the uptime and availability of the Google Gemini Vision API.
B) Real-time updates (like live cursors, team chat, and workspace deduplication) require a stable internet connection.
C) Integration with external, legacy third-party CRM systems (like older versions of SAP) may require custom API bridging in the future.
D) While designed to scale natively, processing extremely large datasets of contacts (100,000+) simultaneously may require advanced optimization in database indexing.

---

## 2. Requirement Determination & Analysis

### 2.1 Functional Requirements

The functional requirements define the key operations and features that IntelliScan must provide to meet user needs.

**A) User Authentication and Authorization: -**
The system should allow users to create accounts, log in, and manage sessions securely. Different multi-tenant access levels must be strictly enforced, i.e., Platform Super Admin, Enterprise Admin, Workspace Member, and Anonymous (for public profiles).

**B) Contact & Pipeline Management: -**
CRUD (Create, Read, Update, Delete) operations on contact details including name, company, inferred industry, inferred seniority, and contact information. Maintain real-time pipeline tracking with drag-and-drop interface, automatically updating deal stages and monetary values.

**C) AI Scanning & Intelligence Extraction: -**
The system must support image uploads (from device cameras or file systems) and utilize multimodal LLMs to not only extract raw text from business cards and flyers, but intelligently infer missing demographic data.

**D) Enterprise Deduplication Alerts: -**
Automatically analyze the workspace database using fuzzy matching and notify users immediately if they scan a contact that already exists in the Shared Rolodex to prevent duplicate sales outreach.

**E) Email Marketing & Sales Tool Management: -**
CRUD operations on email campaigns, audience segments, and workflow sequences. The system must include an "AI Composer" to generate highly personalized follow-up drafts based on the contact's inferred industry data.

**F) Public Booking & Networking Tools: -**
Read access for external individuals to view a user's Public Profile (digital business card) and interact with self-service Calendar Booking Links to schedule meetings.

### 2.2 Targeted Users: -

Primary Targeted Users are: -
A. Enterprise Sales Team
B. Event Marketing & HR Recruitment Team
C. Executive Networking Professionals

---

## 3. System Diagrams: -

Diagrams are visual representations of data, concepts, or processes that provide a concise and accessible way to convey complex information. They come in various forms, such as flowcharts, bar graphs, pie charts, Venn diagrams, and much more, each tailored to their specific purpose.

Unified Modelling Language (UML) diagrams are a set of graphical notations used to describe, design, and communicate the structure and behavior of software systems. UML diagrams are used to depict the various aspects of a software system, including its components, interactions, and relations with external systems. UML diagrams are widely used in software development, as they provide a common language and a standardized way to communicate complex systems to stakeholders and team members.

### 3.1 Confidentiality Notice: -

As part of the academic project development, the system designs, UML diagrams, and data representations included in this reporting suite preserve the functional behavior, advanced AI routing logic, and secure multi-tenant flow of the original IntelliScan system while using generalized terminology. These representations ensure compliance with privacy policies regarding synthetic user data and proprietary API integration mechanics.
