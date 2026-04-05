# IntelliScan Project Architecture

## 1. Overview

This repository contains a two-part application:

- `intelliscan-app`: frontend application built with React + Vite.
- `intelliscan-server`: backend application built with Node.js + Express.

The root folder also contains documentation files, capture tooling, and project metadata.

## 2. High-Level System Architecture

### 2.1 Frontend

The frontend is a Single-Page Application (SPA) using:

- `React 19` for UI composition.
- `Vite` as the build tool.
- `react-router-dom` for client-side routing.
- `Tailwind CSS` for styling.
- `axios` for HTTP API requests.
- `socket.io-client` for real-time workspace collaboration.
- `xlsx` for spreadsheet export/import functionality.

The frontend is structured as a classic component-based React app with global providers and layout wrappers.

### 2.2 Backend

The backend is a REST/WebSocket server using:

- `Express 5` for HTTP APIs.
- `socket.io` for real-time event streaming.
- `sqlite3` as the embedded database.
- `jsonwebtoken` for JWT authentication.
- `bcryptjs` for password hashing.
- `nodemailer` for SMTP email delivery.
- `@google/generative-ai` for Gemini AI integration.
- `cors` for cross-origin support.
- `dotenv` for environment configuration.

### 2.3 Data Flow

1. Browser client loads the SPA from `intelliscan-app`.
2. User actions trigger API calls to `intelliscan-server` under `/api/*`.
3. Server authenticates requests, performs DB queries, and returns JSON.
4. The server also establishes socket connections for collaborative features.
5. AI features call Google Generative AI via `GEMINI_API_KEY`.
6. Email delivery uses SMTP settings from environment variables.

## 3. Frontend Architecture

### 3.1 Key Frontend Entry Points

- `intelliscan-app/src/main.jsx`
  - Bootstraps the React application.
  - Wraps `<App />` with `BrowserRouter` and global providers:
    - `RoleProvider`
    - `ContactProvider`
    - `BatchQueueProvider`
  - Handles initial dark mode selection.

- `intelliscan-app/src/App.jsx`
  - Defines the application routing tree.
  - Uses `RoleGuard` to enforce role-based access.
  - Uses `DashboardLayout` and `AdminLayout` for layout specialization.
  - Loads `generatedRoutes` from `src/pages/generated/routes.json`.
  - Dynamically imports generated page components with `import.meta.glob`.

### 3.2 Frontend Folder Structure

- `public/`
  - Static assets for the Vite app.
  - Contains icons and favicon.

- `src/`
  - `App.css` — application-level styles.
  - `index.css` — global styles and Tailwind utilities.
  - `App.jsx` — route definitions and global layout.
  - `main.jsx` — React root initialization.

- `src/assets/`
  - Static images used in the app.

- `src/components/`
  - `ActivityTracker.jsx` — user activity tracking UI.
  - `ChatbotWidget.jsx` — chatbot overlay widget.
  - `CommandPalette.jsx` — command palette / shortcut UI.
  - `DevTools.jsx` — developer tools UI.
  - `RoleGuard.jsx` — route protection based on user roles.
  - `SignalsCard.jsx` — signal display card.

- `src/context/`
  - `BatchQueueContext.jsx` — queue management state.
  - `ContactContext.jsx` — contact state and selection.
  - `RoleContext.jsx` — authentication and role state.

- `src/data/`
  - `mockContacts.js` — sample contact data for UI development.

- `src/hooks/`
  - `useDarkMode.jsx` — custom hook for dark mode state.

- `src/layouts/`
  - `AdminLayout.jsx` — admin workspace wrapper.
  - `DashboardLayout.jsx` — main app dashboard wrapper.
  - `PublicLayout.jsx` — public page wrapper.

- `src/pages/`
  - Primary route views such as `SignInPage.jsx`, `LandingPage.jsx`, `ContactsPage.jsx`, `WorkspaceDashboard.jsx`, etc.
  - `admin/` — super-admin pages.
  - `dashboard/` — dashboard-specific pages.
  - `workspace/` — workspace admin pages.
  - `generated/` — auto-migrated/generated page components.

- `src/utils/`
  - `auth.js` — JWT storage and helper functions.

### 3.3 Generated Page System

- `src/pages/generated/routes.json`
  - Contains entries like `{ name, path, folder }` for auto-generated pages.
  - Used by `App.jsx` to create routes dynamically.
  - `src/pages/generated/*.jsx` contains the generated page components.

### 3.4 Frontend Runtime Behavior

- Public routes are served without session context.
- Authenticated routes require stored JWT token and role checks.
- `RoleGuard` decides access eligibility for each route.
- `DashboardLayout` and `AdminLayout` apply navigation and shell behavior.
- `DevTools` and `CommandPalette` are mounted globally.

## 4. Backend Architecture

### 4.1 Key Backend Entry Points

- `intelliscan-server/index.js`
  - Creates Express app and HTTP server.
  - Creates Socket.IO server on the same HTTP port.
  - Loads environment with `dotenv`.
  - Enables CORS for all origins.
  - Parses JSON and URL-encoded bodies.
  - Applies a per-request rate limiter.
  - Opens `database.sqlite` via `sqlite3`.
  - Defines all API routes and socket events in one file.

### 4.2 Backend Core Responsibilities

- Authentication:
  - `JWT_SECRET` and `JWT_EXPIRES_IN` for token generation and validation.
  - `bcryptjs` for password hashing.
  - Middleware `authenticateToken` guards protected endpoints.
  - `requireSuperAdmin` enforces super-admin role checks.

- Data Persistence:
  - Uses `sqlite3` for local persistence.
  - Provides helper wrappers: `dbGetAsync`, `dbAllAsync`, `dbRunAsync`.
  - Stores users, contacts, workspace metadata, billing data, events, drafts, sessions, etc.

- Rate Limiting:
  - Uses application-level buckets keyed by user or IP.
  - Adjusts limits based on endpoint category (auth, scan, admin).
  - Returns `429` when exceeded.

- Real-Time Collaboration:
  - `socket.io` events:
    - `join-workspace`
    - `cursor-move`
    - `send-chat`
    - socket disconnect handling

- AI / Scan Features:
  - Uses `@google/generative-ai` to call Gemini AI.
  - Contains fallback logic when AI is unavailable.
  - Supports `/api/scan`, `/api/scan-multi`, `/api/chat/support`.

- Mailing / Notifications:
  - Uses `nodemailer` for SMTP delivery.
  - Builds mail transport from env vars.

- Billing:
  - Billing routes under `/api/workspace/billing`.
  - Payment method management and invoice export.
  - Payment provider integration and webhook-style flows.

- Export / CRM Integration:
  - `/api/contacts/export-crm`
  - `/api/crm/export/:provider`

### 4.3 Server API Surface

The backend publishes many endpoint groups, including:

- `/api/health`
- `/api/auth/*`
- `/api/user/*`
- `/api/access/*`
- `/api/search/global`
- `/api/signals`
- `/api/contacts/*`
- `/api/workspace/*`
- `/api/enterprise/*`
- `/api/scan*`
- `/api/chat/support`
- `/api/analytics/*`
- `/api/sessions/*`
- `/api/engine/*`
- `/api/sandbox/*`
- `/api/campaigns/*`
- `/api/admin/*`
- `/api/coach/*`
- `/api/cards/*`

### 4.4 Server Environment

- `PORT` — HTTP server port.
- `NODE_ENV` — environment mode.
- `JWT_SECRET` — secret for signing tokens.
- `JWT_EXPIRES_IN` — token expiration duration.
- `GEMINI_API_KEY` — Google Gemini AI key.
- `ALLOW_MOCK_AI_FALLBACK` — fallback mode for AI.
- `SMTP_*` — email delivery settings.

## 5. Folder and File Structure

### 5.1 Root Folder

- `.env.example` — root environment example.
- `.sixth` — workspace or editor metadata (project-specific file).
- `Allfeatures.md` — feature inventory.
- `bundle_for_claude.js` — automation or custom bundling script.
- `captures/` — capture utilities, screenshots, videos.
- `Competitor_Feature_Analysis_Prompt_and_Report.md` — analysis documentation.
- `IntelliScan_Complete_Project_Overview.md` — project overview documentation.
- `IntelliScan_Context_For_Claude.txt` — context guidance.
- `IntelliScan_Detailed_System_Architecture.md` — existing architecture documentation.
- `IntelliScan_Folder_Architecture.md` — existing folder documentation.
- `IntelliScan_Full_Directory_Tree.md` — existing directory tree documentation.
- `intelliscan_roadmap_requirements.html` — roadmap file.
- `intelliscan_stitch_technicaladdendum.md` — technical addendum.
- `intelliscan-app/` — frontend application.
- `intelliscan-server/` — backend application.

### 5.2 Frontend: `intelliscan-app/`

- `.env.example` — environment variable example for frontend.
- `.gitignore` — ignored files for frontend.
- `build_err.log`, `build_err.txt` — build diagnostics.
- `dist/` — built production output.
- `eslint.config.js` — ESLint configuration.
- `index.html` — Vite HTML entry template.
- `lint*` files — lint output and reports.
- `package.json` — frontend dependency graph and scripts.
- `package-lock.json` — npm lockfile.
- `postcss.config.js` — PostCSS config for Tailwind.
- `public/` — static assets.
- `README.md` — frontend README.
- `scripts/` — helper scripts for migrations and replacements.
- `src/` — app source code.
- `tailwind.config.js` — Tailwind CSS configuration.
- `temp_lint_reader.cjs`, `temp_lint_reader.js` — temp lint tooling.
- `vite.config.js` — Vite configuration.

### 5.3 Frontend Source: `intelliscan-app/src/`

- `App.css` — app-level styling.
- `App.jsx` — central route tree and page wiring.
- `index.css` — global CSS and Tailwind resets.
- `main.jsx` — React app bootstrap.

- `assets/`
  - `hero.png`, `react.svg`, `vite.svg` — static imagery.

- `components/`
  - UI support components for global behaviors.

- `context/`
  - Shared React state providers.

- `data/`
  - Mock data markup.

- `hooks/`
  - Custom hooks such as dark theme support.

- `layouts/`
  - Layout wrappers for dashboard, admin, and public pages.

- `pages/`
  - Main route views separated by concern.

- `utils/`
  - Auth helper code.

### 5.4 Backend: `intelliscan-server/`

- `.env` — active backend environment file (not committed).
- `.env.example` — backend environment example.
- `database.sqlite` — local SQLite database file used at runtime.
- `index.js` — main server implementation.
- `node_modules/` — server dependencies.
- `package.json` — backend dependencies and scripts.
- `package-lock.json` — npm lockfile.

## 6. System Design Details

### 6.1 Authentication & Authorization

- Users register and login via `/api/auth/register` and `/api/auth/login`.
- Passwords are hashed with `bcryptjs`.
- Issued JWT tokens are stored on the frontend and reused for protected requests.
- Protected endpoints require middleware `authenticateToken`.
- Additional authorization restrictions are enforced with role checks such as `requireSuperAdmin`.
- Roles include at least: `user`, `business_admin`, `super_admin`.

### 6.2 Role-Based UI Experience

- Public pages are open to all visitors.
- Authenticated dashboard pages require login.
- Business admin workspace pages require elevated workspace permissions.
- Super admin pages require the `super_admin` role.
- `RoleGuard` enforces access at the route-level in the frontend.

### 6.3 Real-Time Collaboration

- Backend opens a Socket.IO server attached to the HTTP app.
- Clients can join workspace rooms.
- Socket events include cursor movement and chat messages.
- This supports live collaboration in workspace contexts.

### 6.4 AI and Scan Capabilities

- The backend integrates with Google Gemini via `@google/generative-ai`.
- Scan-related endpoints are exposed as `/api/scan`, `/api/scan-multi`, and `/api/chat/support`.
- The server includes both AI calls and deterministic fallback behavior.

### 6.5 Data and Export Workflow

- Contacts endpoints support create, read, delete, and relationship analytics.
- Workspace features include CRM mapping, routing rules, data policies, data quality queue, campaigns, billing, analytics, and org chart.
- The frontend imports and exports spreadsheet data using `xlsx`.
- Server endpoints support CRM export and invoice export.

### 6.6 Error Handling and Monitoring

- The backend uses Express error middleware to capture unhandled errors.
- Rate limiter headers are attached to responses for client feedback.
- Health check endpoint exists at `/api/health`.

## 7. Project Tree Summary

### 7.1 Root Tree

```
.
├─ .env.example
├─ .sixth
├─ Allfeatures.md
├─ bundle_for_claude.js
├─ captures/
├─ Competitor_Feature_Analysis_Prompt_and_Report.md
├─ IntelliScan_Complete_Project_Overview.md
├─ IntelliScan_Context_For_Claude.txt
├─ IntelliScan_Detailed_System_Architecture.md
├─ IntelliScan_Folder_Architecture.md
├─ IntelliScan_Full_Directory_Tree.md
├─ intelliscan_roadmap_requirements.html
├─ intelliscan_stitch_technicaladdendum.md
├─ intelliscan-app/
└─ intelliscan-server/
```

### 7.2 Frontend Tree (Key Files)

```
intelliscan-app/
├─ package.json
├─ package-lock.json
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ eslint.config.js
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
├─ scripts/
│  ├─ massReplace.cjs
│  └─ migrate.js
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ index.css
   ├─ App.css
   ├─ components/
   ├─ context/
   ├─ data/
   ├─ hooks/
   ├─ layouts/
   ├─ pages/
   │  ├─ admin/
   │  ├─ dashboard/
   │  ├─ workspace/
   │  ├─ generated/
   │  ├─ LandingPage.jsx
   │  ├─ SignInPage.jsx
   │  ├─ ContactsPage.jsx
   │  └─ ...
   └─ utils/
      └─ auth.js
```

### 7.3 Backend Tree

```
intelliscan-server/
├─ package.json
├─ package-lock.json
├─ index.js
├─ .env.example
├─ .env
├─ database.sqlite
└─ node_modules/
```

## 8. Summary

This project is a full-stack product with a React SPA frontend and an Express-based backend.

The frontend is designed around:

- role-based route protection
- dynamic generated pages
- workspace and dashboard layouts
- client state via React context

The backend is designed around:

- secure JWT authentication
- SQLite persistence
- AI-powered scanning and chat support
- billing, workspace management, and enterprise endpoints
- real-time collaboration via Socket.IO

The file organization is cleanly separated into `intelliscan-app` and `intelliscan-server`, with root documentation files capturing features, architecture, and requirements.
