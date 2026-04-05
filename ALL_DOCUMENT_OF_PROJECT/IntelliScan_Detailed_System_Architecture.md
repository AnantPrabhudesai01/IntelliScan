# 💠 IntelliScan Detailed System Architecture

This document provides a technical blueprint of the IntelliScan platform to facilitate seamless context transfer between AI agents and engineering teams.

---

## 🏗️ 1. Architecture Overview
IntelliScan follows a **Client-Server-AI** architecture designed for multi-tenant enterprise usage.

- **Frontend:** React 18 (Vite) + Tailwind CSS + Lucide Icons.
- **Backend:** Node.js (Express) + SQLite3 + Socket.io.
- **AI Core:** Google Gemini 1.5/2.0 Flash (Multi-modal OCR & Reasoning).

---

## 💻 2. Frontend Infrastructure (React)

### 2.1 State & Context Management
The application uses a decentralized context-based state management system:
- **AuthContext:** Manages JWT tokens, user sessions, and role extraction.
- **ContactContext:** Centralized CRUD for the leads database with real-time sync.
- **BatchQueueContext:** Orchestrates high-volume background scanning, manages progress states (queued, processing, completed, failed), and enforces tier-based concurrency limits.

### 2.2 Key Route Architecture
- `/public`: Landing Page, Subscription Comparisons.
- `/auth`: SignIn/SignUp flows.
- `/dashboard`: The main internal application.
  - `ScanPage`: Unified entry point for Single and Group (Multi) scans.
  - `EventsPage`: Campaign-based lead segmentation.
  - `CoachPage`: Real-time AI followup insights.

---

## 🌐 3. Backend Infrastructure (Express)

### 3.1 Middleware Pipeline
IntelliScan uses a production-standard middleware stack:
1. **Security:** CORS (Configured for cross-origin local dev).
2. **Body Parsing:** High-limit JSON/UrlEncoded (20MB) to handle large Base64 business card photos.
3. **Logging:** Custom request logger with timestamps and duration tracking.
4. **Auth:** JWT verification middleware for protected `/api` routes.
5. **Quota Check:** Global interceptor that validates scan credits and tier limits before hitting AI engines.
6. **Error Handler:** Global centralized catch-all for JSON-based 500 error reporting.

### 3.2 AI Integration Logic (`callGeminiWithRetry`)
The backend features a robust AI orchestration helper:
- **Retry Mechanism:** Implements a 2-stage retry for `429 Too Many Requests` errors with exponential backoff.
- **Token Optimization:** Uses `gemini-1.5-flash` for high-volume free tiers and `2.0-flash` for enterprise speed.
- **Response Validation:** Strict JSON forcing in prompts with post-extraction regex cleaning.

---

## 📊 4. Database Schema (SQLite)

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| id | STRING | Primary Key |
| email | STRING | Unique login identifier |
| tier | STRING | `personal`, `pro`, `enterprise` |

### `user_quotas` table
| Column | Type | Description |
|--------|------|-------------|
| user_id | STRING | Foreign Key |
| overall_limit | INTEGER | Max single scans allowed (e.g., 10, 100, 99999) |
| used_count | INTEGER | Current single scans consumed |
| group_scans_limit| INTEGER | Max group photos allowed |
| group_scans_used | INTEGER | Current group photos consumed |

### `contacts` table
| Column | Type | Description |
|--------|------|-------------|
| id | STRING | Primary Key |
| user_id | STRING | Owner ID |
| event_id | STRING | Optional foreign key for Campaign segmentation |
| name, company, email, etc | STRING | Metadata extracted by AI |

---

## 💎 5. Business Tiering Logic

| Tier | Single Scans | Group Scans | Batch Queue Limit |
|------|--------------|--------------|-------------------|
| **Personal** | 10 | 1 | 10 files |
| **Professional**| 100 | 10 | 50 files |
| **Enterprise** | Unlimited | Unlimited | 100 files |

---

## 🗺️ 6. Deployment & Scaling Roadmap
- **Containerization:** Prototyped with `Dockerfile`.
- **Statelessness:** Transitioning from SQLite to PostgreSQL (Cloud SQL) for multi-instance scaling.
- **Monitoring:** Health check (`/api/health`) and real-time Socket.io stats integrated.

---
*Created for the IntelliScan Engineering Team (2026).*
