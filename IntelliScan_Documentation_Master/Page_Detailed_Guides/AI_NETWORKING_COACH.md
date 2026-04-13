# Deep Dive: AI Networking Coach

The AI Networking Coach act as a personal CRM consultant, analyzing contact data to provide strategic growth insights.

---

## 📄 Overview
-   **Page Path**: `/dashboard/coach`
-   **User Role**: Pro, Enterprise.
-   **Core Logic**: Generative AI contextual analysis (Gemini).

## 🔄 Technical Workflow
1.  **Data Aggregation**: The `CoachPage.jsx` fetches all contacts for the current user/workspace.
2.  **Health Scoring**: A local algorithm calculates "Network Health" based on:
    -   Recency of scans.
    -   Completeness of contact data.
    -   Seniority distribution.
3.  **Insight Generation**: The top-tier contacts are sent to the AI with a prompt: *"Identify the top 3 high-value networking opportunities and suggest a follow-up strategy for each."*
4.  **Actionable Items**: The UI renders these as "Missions" or "Next Best Actions".
5.  **Interactive Loop**: Users can "Review Draft" which directly links to the **AI Drafts** module.

## 🛠️ Key Components
-   **React Component**: `src/pages/dashboard/CoachPage.jsx` - Renders the health gauges and AI mission cards.
-   **Hook**: `useCoachData.js` - Manages the state of insights and progress tracking.
-   **AI Integration**: Specifically utilizes specific system instructions to prioritize specific industries (e.g., Finance, Tech).

## 💡 Key Features
-   **Network Health Dashboard**: Visual representation of "Strong Momentum" vs "Needs Attention".
-   **Focus Segments**: Automatically identifies the strongest clusters in your network (e.g., "Director level in Manufacturing").
-   **Drip Integration**: One-click transition from a coach insight to an automated email sequence.

## 🔗 Dependencies
-   **Depends On**: `SCAN_MODULE` (to have data to analyze).
-   **Prerequisite For**: `EMAIL_MARKETING_HUB` (strategic input for campaigns).
