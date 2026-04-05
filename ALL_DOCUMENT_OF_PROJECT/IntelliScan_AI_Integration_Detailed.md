# IntelliScan — Detailed AI Integration Analysis

This document provides a highly technical breakdown of exactly where and how **Artificial Intelligence (Google Gemini & OpenAI ChatGPT)** is utilized across the IntelliScan platform. It covers the specific API endpoints, prompt engineering strategies, and the robust fallback architecture that ensures 100% uptime.

---

## 1. Core AI Architecture: The Dual-Engine Fallback

The platform utilizes a **"Fail-Over"** strategy to ensure that AI services are always available, even if a primary provider (like Google Gemini) experiences an outage or rate limiting.

### 🧩 The `generateWithFallback()` Utility
Located at `intelliscan-server/index.js` (Line 2875), this core function manages the lifecycle of a text generation request:
1.  **Primary (Gemini 1.5 Flash)**: The system first attempts to use the Google Gemini API (using the key stored in `.env` or overridden in `engine_config`).
2.  **Fallback (OpenAI GPT-4o-mini)**: If Gemini fails (timeout, 429 rate limit, or 500 error), the system immediately catches the error and retries the exact same prompt using OpenAI's ChatGPT API.
3.  **Governance**: The system checks the `ai_models` table before every call to ensure the engine hasn't been "Paused" by a SuperAdmin.

---

## 2. Feature-Specific AI Implementation

### 👁️ Intelligent OCR Extraction (Single & Bulk)
*   **Endpoints**: `/api/scan` and `/api/scan-multi`
*   **Function**: `unifiedExtractionPipeline` (Line 3885)
*   **Logic**: This is the most complex AI implementation in the platform. It sends the business card image (Base64) along with a **massive "System Instruction" prompt** to the LLM.
*   **AI Output**:
    *   **Contact Extraction**: Name, Email, Phone, Company, Title, and Physical Address.
    *   **Native Script Detection**: Identifies names/titles in non-Latin scripts (Japanese, Hindi, etc.) and stores them in `_native` fields.
    *   **Predictive LinkedIn**: If a LinkedIn URL isn't on the card, the AI *predicts* the likely URL and generates a short professional bio.
    *   **Deal Scoring**: Calculates a lead quality score (0-100) based on company prestige and seniority tier.
    *   **Classification**: Rejects selfies, landscapes, or blurry images that aren't business cards.

### 📧 AI Ghostwriter (Email Drafts)
*   **Endpoint**: `/api/drafts/generate` (Line 5152)
*   **Logic**: Uses the `unifiedTextAIPipeline` to generate personalized outreach.
*   **Prompt Strategy**: The system passes the **Contact Context** (Name, Company, Job Title) and a **Tone Selection** (e.g., "Friendly", "Executive", "Professional").
*   **Constraint Enforcement**: The AI is strictly instructed to return a valid JSON object containing a `"subject"` and `"body"`, ensuring the React frontend can immediately render the draft in a WYSIWYG editor.

### 📅 AI Scheduling Assistant
*   **Endpoints**: `/api/calendar/ai/suggest-time` and `/api/calendar/ai/generate-description`
*   **Logic**:
    *   **Suggest Time**: The system queries the SQLite database for a user's "Busy" slots, converts them to a JSON string, and asks the AI to find 3 optimal "free windows" for a meeting.
    *   **Generate Description**: Takes a meeting title and brief notes, converting them into a polished, professional calendar invite body.

### 💬 Omni-Present Support Chatbot
*   **Endpoint**: `/api/chat/support` (Line 4272)
*   **Logic**: This bot is injected with a **Product Manual Context**. It "knows" about Credit Points, OCR pipelines, Duplicate detection, and JWT expiry.
*   **Technique**: It uses **Conversation Memory**; the React frontend sends the last several messages of the history so the AI maintains context of the help request.

---

## 3. The "AI Models" Admin Console
*   **Database Table**: `ai_models`
*   **SuperAdmin Control**: Through the `GenAiTrainingTuningSuperAdmin.jsx` page, administrators can:
    *   **Toggle Status**: Switch an engine to "Paused" (which forces the server code at line 3891 to ignore that engine and skip to the next).
    *   **Observe Telemetry**: View real-time accuracy and latency (ms) for Gemini vs. OpenAI to decide which should be the primary engine.

---

## 4. Hardware & Efficiency Stats
*   **Gemini 1.5 Flash**: Targeted for high-speed, low-cost extraction (Primary).
*   **OpenAI GPT-4o-mini**: Specialized in complex JSON formatting and reasoning (Fallback).
*   **Tesseract.js**: The "Last Resort" offline OCR used only if both cloud APIs are unavailable (0ms latency, lower accuracy).

> [!IMPORTANT]
> **Data Privacy**: All AI requests are stateless. Images are passed as Base64 strings to the AI provider but are NOT stored on the AI provider's servers for training, ensuring enterprise-grade data privacy.
