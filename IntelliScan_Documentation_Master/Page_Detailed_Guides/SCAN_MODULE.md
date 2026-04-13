# Deep Dive: AI Scanning & Extraction Module

The AI Scanning Module is the technological heart of IntelliScan. It converts unstructured image data into high-fidelity CRM entities.

---

## 📄 Overview
-   **Page Path**: `/dashboard/scan`
-   **User Role**: Free, Pro, Enterprise.
-   **Core Dependency**: Google Gemini Pro Vision API.

## 🔄 Technical Workflow
1.  **Capture**: The user uploads an image (JPG/PNG) via the `ScanPage.jsx` component.
2.  **Preprocessing**: The image is validated for size and format.
3.  **AI Transmission**: The image buffer is sent to the `/api/scan` endpoint.
4.  **Prompt Engineering**: The server sends the image to Gemini with a highly structured prompt requesting:
    -   Name, Email, Job Title.
    -   Company, Address, Phone.
    -   Social Media Slugs (LinkedIn, Twitter).
    -   **Inference**: Seniority (Junior to C-Level) and Industry (e.g., HVAC, SaaS).
5.  **Validation**: The extraction confidence is returned to the UI.
6.  **Persistence**: Upon user confirmation, the data is saved to the `contacts` table in the SQLite DB.

## 🛠️ Key Components
-   **React Component**: `src/pages/ScanPage.jsx` - Handles the drag-and-drop and extraction preview.
-   **API Controller**: `intelliscan-server/routes/scan.js` - Manages the Gemini API key and prompt logic.
-   **Data Model**: Mapped to the `Contact` entity which includes `confidence_score` and `inferred_industry`.

## 💎 Premium Features (Enterprise)
-   **Batch Scan**: Upload a `.zip` file of 50 cards for concurrent processing.
-   **Kiosk Mode**: A separate full-screen interface (`/dashboard/kiosk`) designed for high-traffic events.

## 🔗 Dependencies
-   **Depends On**: `AuthModule` (to verify user quota).
-   **Prerequisite For**: `ContactsPage`, `LeadPipeline`, `AI_Coach`.
