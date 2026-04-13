# Deep Dive: Enterprise Pipeline & CRM Workspace

This module handles the transition of a personal lead into an organization-wide sales asset.

---

## 📄 Overview
-   **Page Path**: `/workspace/pipeline` and `/workspace/shared`
-   **User Role**: Enterprise Admin, Workspace Member.
-   **Core Interface**: Drag-and-drop Kanban Board.

## 🔄 Technical Workflow
1.  **Lead Promotion**: A user "promotes" a contact from their personal library to the **Shared Rolodex**.
2.  **State Management**: The lead enters the `contacts` table with a `workspace_id`.
3.  **Kanban Rendering**: React reads the `pipeline_stage` attribute to place the card in "New Lead", "Meeting Booked", or "Negotiation".
4.  **Drag Interaction**: Moving a card triggers a `PATCH` request to the backend to update the stage and notify the team owner.
5.  **Analytics**: Pipeline values (predicted revenue) are aggregated on the **Workspace Dashboard**.

## 🛠️ Key Components
-   **React Component**: `src/pages/workspace/PipelinePage.jsx` - Implementing the visual Kanban layout.
-   **Context**: `WorkspaceContext.js` - Stores information about the current team's quota and member list.
-   **Deduplication Logic**: Automatically checks for identical emails across all workspace members.

## 💎 Enterprise Logic
-   **Routing Rules**: Admins can define rules (e.g., "Assign all 'Real Estate' leads to Sarah").
-   **Data Quality Center**: A dedicated interface for merging fractured records.
-   **CRM Mapping**: Export data to external systems using the custom field mapper.

## 🔗 Dependencies
-   **Depends On**: `SCAN_MODULE`.
-   **Prerequisite For**: `EMAIL_MARKETING_HUB` (Campaign target selection).
