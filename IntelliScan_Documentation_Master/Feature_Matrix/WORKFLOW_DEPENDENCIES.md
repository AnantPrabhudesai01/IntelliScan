# IntelliScan: Workflow & Dependencies

This document maps the logical flow of data through the IntelliScan system and explains the hierarchy of access levels.

---

## 🗺️ Visual Data Flow

1.  **Ingestion Phase**: 
    - `LandingPage` (Guest) $\rightarrow$ `PublicProfile` (View Card) $\rightarrow$ `BookingPage` (Book Meeting).
    - OR `ScanPage` (User) $\rightarrow$ **AI Vision Engine** $\rightarrow$ `ContactsPage` (Structured Data).

2.  **Organization Phase**:
    - `ContactsPage` $\rightarrow$ `SharedRolodex` (Workspace) $\rightarrow$ `PipelinePage` (Kanban Board).
    - `SharedRolodex` $\rightarrow$ `OrgChart` (Hierarchy) $\rightarrow$ `DataQualityCenter` (Validation).

3.  **Action Phase**:
    - `PipelinePage` $\rightarrow$ `AI Coach` (Strategy) $\rightarrow$ `CampaignBuilder` (Automation).
    - `CampaignBuilder` $\rightarrow$ `EmailSequences` (Drips) $\rightarrow$ `SignalsPage` (Telemetry).

4.  **Admin Phase**:
    - `AdminDashboard` (SuperAdmin) $\rightarrow$ `EnginePerformance` (Monitoring).
    - `AdminDashboard` $\rightarrow$ `CustomModels` (Switching AI).

---

## ⛓️ Page Dependencies & Roles

### 1. Public Level (No Login)
*   **Pages**: `LandingPage`, `PublicProfile`, `BookingPage`, `SignIn`, `SignUp`.
*   **Dependency**: None. Open to the internet for lead generation.

### 2. Personal Level (Free/Pro User)
*   **Pages**: `ScanPage`, `ContactsPage`, `Settings`, `MyCard`, `CardCreator`.
*   **Internal Linkages**:
    - `ScanPage` relies on the `intelliscan-server` AI extraction endpoint.
    - `ContactsPage` depends on the `contacts` table in the User's partition of the DB.

### 3. Business Level (Enterprise Admin)
*   **Pages**: `WorkspaceDashboard`, `MembersPage`, `CrmMapping`, `RoutingRules`, `SharedRolodex`.
*   **Dependencies**:
    - Requires a **WorkspaceID**.
    - `MembersPage` controls access to `SharedRolodex`.
    - `CrmMapping` is the prerequisite for exporting leads to Salesforce/HubSpot.

### 4. Platform Level (Super Admin)
*   **Pages**: `SystemHealth`, `EnginePerformance`, `Incidents`, `CustomModels`.
*   **Dependencies**:
    - Requires the `super_admin` bit in the user record.
    - Directly interacts with the server's telemetry logs and global `.env` settings.

---

## 🛠️ Core Functional Processes

| Process | Starting Page | Technical Step | Ending Page |
| :--- | :--- | :--- | :--- |
| **New Lead Capture** | `ScanPage` | Multi-modal Vision AI Parse | `ContactsPage` |
| **Team Handover** | `SharedRolodex` | `Update assignee_id` | `PipelinePage` |
| **Nurture Loop** | `PipelinePage` | Trigger AI Email Sequence | `Campaigns` |
| **Health Check** | `AdminDash` | Ping API Latency Endpoints | `Performance` |
