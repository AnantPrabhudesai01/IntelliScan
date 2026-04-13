# Deep Dive: Platform Governance (Super Admin)

This module is designed for the platform owners to monitor the health, performance, and integrity of the entire IntelliScan ecosystem.

---

## 📄 Overview
-   **Page Path**: `/admin/dashboard` and `/admin/engine-performance`
-   **User Role**: Platform Super Admin.
-   **Core Focus**: Infrastructure & Cost Management.

## 🔄 Technical Workflow
1.  **Telemetry Ingestion**: The backend logs every AI processing event, including its cost and latency.
2.  **Health Dashboard**: The `AdminDashboard.jsx` fetches system-wide statistics (Total Workspaces, Active Scans).
3.  **Engine Performance**: `EnginePerformance.jsx` visualizes the specific performance of Gemini Pro Vision vs Tesseract (Legacy Fallback).
4.  **Incident Detection**: The **System Incident Center** monitors failed SMTP relays or AI timeouts and creates automated tickets.
5.  **Model Tuning**: Admins can adjust the "Confidence Threshold" required for an automated save.

## 🛠️ Key Components
-   **React Component**: `src/pages/EnginePerformance.jsx` - Renders complex line charts for AI latency.
-   **Feedback Hub**: `src/pages/SuperAdminFeedbackPage.jsx` - Aggregates user feedback from all workspaces for global product improvement.
-   **Audit Logs**: Tracks administrative actions across all organizations.

## ⚙️ Administrative Features
-   **Model Versioning**: Toggle between `gemini-1.5-pro` and other available LLM endpoints.
-   **Workspace Provisioning**: Manually override seat counts or storage quotas for specific Enterprise clients.
-   **Global Settings**: Update platform-wide legal policies or maintenance alerts.

## 🔗 Dependencies
-   **Depends On**: `Backend Logs` & `Telemetry Providers`.
-   **Controls**: All other modules (via quota management and API key rotation).
