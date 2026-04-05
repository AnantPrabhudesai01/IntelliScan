# 📁 IntelliScan Detailed Folder Architecture

This document provides a complete breakdown of the project's directory structure, explaining the purpose of each folder and key file. This separation between the React UI (`intelliscan-app`) and the Node.js API (`intelliscan-server`) ensures the platform is highly scalable and maintainable by larger development teams.

---

```text
IntelliScan_Project_Root/
│
├── intelliscan-app/                  # 🟦 FRONTEND (React + Vite + Tailwind)
│   ├── public/                       # Static public assets (Favicon, logos)
│   │   └── vite.svg
│   │
│   ├── src/                          # Main React Source Code
│   │   ├── components/               # Reusable small UI pieces
│   │   │   └── (Buttons, Modals, Stat Cards)
│   │   │
│   │   ├── context/                  # Global State Management (React Context API)
│   │   │   ├── AuthContext.jsx       # Handles JWT Login & User Roles validation
│   │   │   ├── BatchQueueContext.jsx # Background queue for Group Photos tracking limits
│   │   │   ├── ContactContext.jsx    # Centralized state for scanned leads with DB sync
│   │   │   └── ThemeContext.jsx      # Global Dark/Light Mode toggle state
│   │   │
│   │   ├── layouts/                  # UI Wrappers with consistent Navbars & Sidebars
│   │   │   ├── AdminLayout.jsx       # Wrapper for Super Admin pages (Full access)
│   │   │   ├── DashboardLayout.jsx   # Wrapper for logged-in user pages (Standard/Pro)
│   │   │   └── PublicLayout.jsx      # Wrapper for public/marketing pages (No auth required)
│   │   │
│   │   ├── pages/                    # The main screens (Mapped directly to Routes)
│   │   │   ├── admin/                # Restricted strictly to "Platform Admins"
│   │   │   │   ├── CustomModelsPage.jsx
│   │   │   │   └── AiTrainingTuningSuperAdmin.jsx
│   │   │   │
│   │   │   ├── dashboard/            # Standard user & enterprise tier features
│   │   │   │   ├── BatchUploadPage.jsx
│   │   │   │   ├── CoachPage.jsx     # AI Networking Follow-up Assistant (Insights)
│   │   │   │   ├── DraftsPage.jsx
│   │   │   │   └── EventsPage.jsx    # Scanned contacts segmented by campaign/trade show
│   │   │   │
│   │   │   ├── workspace/            # Team collaboration pages (Enterprise Multi-seat)
│   │   │   │   ├── WorkspaceContacts.jsx
│   │   │   │   └── WorkspaceDashboard.jsx
│   │   │   │
│   │   │   ├── ScanPage.jsx          # Unified Intelligent Capture UI (Single & Group Photo)
│   │   │   ├── ContactsPage.jsx      # Global Datatable for all extracted leads (CRUD)
│   │   │   ├── AnalyticsPage.jsx     # Usage & performance metrics dashboard
│   │   │   └── SettingsPage.jsx      # User profile, API keys, and subscription upgrades
│   │   │
│   │   ├── App.jsx                   # React Router Configuration (connects layouts to pages)
│   │   ├── main.jsx                  # React DOM Entry Point
│   │   └── index.css                 # Global Tailwind CSS directives and custom base styles
│   │
│   ├── .eslintrc.cjs                 # Code quality & syntax rules
│   ├── package.json                  # Frontend dependencies (React, Lucide, Axios)
│   ├── tailwind.config.js            # Tailwind Theme Design System (Brand Colors, Custom Fonts)
│   └── vite.config.js                # Frontend build tool configuration (Proxying to port 5000)
│
│
├── intelliscan-server/               # 🟩 BACKEND (Node.js + Express + SQLite)
│   ├── index.js                      # **The Brain** (Controllers, Routes, AI Logic combined)
│   │    ├─ Auth & Middleware         # JWT Checks, 500 Global Error Handler, API Logging
│   │    ├─ `/api/scan`               # Single Card Gemini 1.5/2.0 Flash processing
│   │    ├─ `/api/scan-multi`         # Group Photo batch processing logic
│   │    ├─ `/api/events`             # CRUD operations for Event & Campaign segmentation
│   │    ├─ `/api/user/simulate-*`    # Payment/Tier upgrading logic for subscription simulation
│   │    └─ Socket.io                 # WebSockets for live engine stats and collaboration
│   │
│   ├── database.sqlite               # Centralized Relational DB (Users, Quotas, Contacts, Chat)
│   ├── .env                          # Secret environment variables (GEMINI_API_KEY, JWT_SECRET)
│   └── package.json                  # Backend dependencies (Express, @google/generative-ai, sqlite3)
│
├── IntelliScan_Folder_Architecture.md        # This Document
└── IntelliScan_Detailed_System_Architecture.md # Project Blueprint (System Logic & Data Schemas)
```

## 🧠 Architectural Principles Explained

### 1. Strict Separation of Concerns
The project forces a hard boundary between the **Client** (React) and the **Server** (Node.js). 
- If the frontend team needs to change the UI or CSS, they only modify `intelliscan-app`. 
- If the backend team needs to update the AI prompt or database schema, they only modify `intelliscan-server`.

### 2. Context Segregation (`src/context`)
By extracting complex logic (like managing the Batch Upload Queue or tracking User Roles) out of individual `pages` and into React `Context` providers, the UI components remain lightweight, focused solely on rendering data rather than computing it.

### 3. Role-Based Directory Routing (`pages/admin` vs `pages/dashboard`)
The folder structure inside `/pages` visually mirrors the platform's security model. It makes it immediately obvious to any developer which screens contain sensitive Super Admin controls versus those meant for standard Enterprise users.
