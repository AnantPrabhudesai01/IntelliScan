# 🪐 IntelliScan: Complete Project & Architecture Overview

This document provides an exhaustive, in-depth overview of the entire IntelliScan platform. It covers the technology stack, third-party services, core features, user roles, tier limits, and the underlying data architecture. This is the definitive guide to understanding the complete scope of the project.

---

## 🛠️ 1. Comprehensive Tech Stack

The platform is designed as a modern, decoupled **Client-Server** application, utilizing a JavaScript-based full-stack architecture.

### Frontend (Client)
*   **Core Framework:** React 18
*   **Build Tool:** Vite (Chosen for instant HMR and fast compilation)
*   **Styling:** Tailwind CSS (Utility-first CSS framework for rapid UI development)
*   **Iconography:** Lucide-React (Consistent, customizable SVG icons)
*   **Routing:** React Router DOM (Client-side navigation and route protection)
*   **State Management:** React Context API (Decentralized state for Auth, Contacts, and Batch Uploads)
*   **Network Requests:** `fetch` API and `axios`

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js 
*   **Database:** SQLite3 (Local, serverless relational database)
*   **Authentication:** JSON Web Tokens (`jsonwebtoken`) and `bcryptjs` for password hashing
*   **Real-Time Communication:** Socket.io (Used for live engine statistics and workspace collaboration)
*   **Environment Management:** `dotenv`

---

## 🔌 2. Third-Party Integrations & Services

IntelliScan relies on several key external services to power its advanced features:

1.  **Google Generative AI (Gemini):**
    *   **Models Used:** `gemini-1.5-flash` (Primary Fallback/Free Tier), `gemini-2.0-flash` (High Performance/Enterprise).
    *   **Purpose:** Multi-modal OCR (Optical Character Recognition) to extract structured JSON data (Name, Email, Phone, Company, Job Title) from raw images of business cards. Also powers the "Networking Coach" for follow-up advice.
2.  **Razorpay (Integrated):**
    *   **Purpose:** Payment gateway for upgrading subscription tiers (Personal -> Pro -> Enterprise).
    *   **Implementation:** Backend creates Razorpay orders and verifies payment signatures, then upgrades `users.tier` and updates `user_quotas`.
    *   **Dev/Demo Mode:** If Razorpay keys are missing, the server can return simulated orders so the UI remains demoable.

---

## ✨ 3. Core Features & Capabilities

The platform is divided into several major feature modules:

### A. Intelligent Capture (OCR Core)
*   **Single Card Scan:** Extracts highly accurate contact metadata from a single photograph of a business card. Automatically rejects non-card images.
*   **Group Photo Extraction (Multi-Scan):** A specialized AI prompt and UI that extracts *multiple* distinct contacts from a single photograph of 5-25 cards laid out on a table.

### B. High-Volume Batch Queue
*   **Background Processing:** Users can drag-and-drop multiple images. The system processes them in the background (queued -> processing -> completed/failed) without locking the UI.
*   **Floating Progress Indicator:** A global tracker shows the user how many cards are left in the AI engine's queue.

### C. Events & Campaigns Management
*   **Segmentation:** Users can create custom "Events" (e.g., "CES 2026", "Web Summit").
*   **Tagging:** Scans can be assigned to a specific event in real-time, allowing marketing teams to measure exactly how many leads were generated per trade show.

### D. AI Networking Coach
*   **Follow-up Generator:** Analyzes the extracted contact details and generates personalized email templates or LinkedIn connection requests based on the user's customized goal (e.g., "Schedule a Demo", "Casual Coffee").

### E. Team Workspaces (Enterprise Only)
*   **Shared Rolodex:** Allows multiple users to view the same contact database.
*   **Live Collaboration:** Socket.io integration to show when other team members are online, viewing the same workspace, or chatting.

---

## 👥 4. User Roles, Tiers & Quotas

The system features dynamic, granular access control based on user subscription levels. Enforcement happens on both the UI (feature locking) and the Backend API (request rejection).

### A. The Subscription Tiers
1.  **Starter (Free / Personal):**
    *   **Limits:** 10 single scans, 1 Group Photo scan.
    *   **Batch Upload Limit:** Maximum 10 images at a time.
2.  **Professional (Personal Pro):**
    *   **Limits:** 100 single scans, 10 Group Photo scans.
    *   **Batch Upload Limit:** Maximum 50 images at a time.
    *   *Cost Simulation:* ₹49/month.
3.  **Enterprise (Business Custom):**
    *   **Limits:** Unlimited (Technically 99,999) single and group scans.
    *   **Batch Upload Limit:** Maximum 100+ images at a time.
    *   *Features:* Unlocks Workspace collaboration and advanced data export.

### B. System Access Roles
*   **Anonymous/Public:** Can access the landing page, pricing comparison, and public analytics.
*   **Standard User:** Logged into the dashboard. Capabilities defined by their Tier (above).
*   **Platform/Super Admin:** Has access to the `/admin` routing layer to view aggregate global data, tune AI models, and manage system-wide webhooks.

---

## 🗄️ 5. Data Architecture (Database Schema)

The persistent data is stored in a structured relational format within `database.sqlite`:

1.  **`users` Table:**
    *   `id` (PK), `email` (Unique), `password` (Hashed), `role`, `tier`, `created_at`
2.  **`user_quotas` Table (Tracks usage limits):**
    *   `user_id` (FK), `overall_limit`, `used_count`, `group_scans_limit`, `group_scans_used`
3.  **`contacts` Table (The Core CRM data):**
    *   `id` (PK), `user_id` (FK - Owner), `event_id` (FK - Campaign tag), `name`, `email`, `phone`, `company`, `job_title`, `website`, `address`, `confidence`, `image_url`
4.  **`events` Table:**
    *   `id` (PK), `user_id` (FK), `name`, `location`, `date`, `type`, `status`
5.  **`workspace_chats` Table:**
    *   `id` (PK), `workspace_id`, `user_name`, `message`, `timestamp`

---

## 🚀 6. Security & Infrastructure

To meet "Major Company" standards, the architecture implements the following protections:

*   **Global Error Handling:** All backend crashes or unexpected exceptions are caught by a global Express middleware, preventing the Node.js server from exiting and returning a safe JSON `{ error: ... }` response.
*   **Request Logging:** Every API call is logged with its duration and HTTP method to monitor performance bottlenecks.
*   **Stateless Authentication:** JWT tokens strictly control API access without relying on server-side session memory.
*   **Health Checks:** Exposes `/api/health` for uptime monitoring and load-balancer readiness.
