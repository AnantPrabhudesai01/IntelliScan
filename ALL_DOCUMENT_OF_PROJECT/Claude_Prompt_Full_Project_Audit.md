# Prompt: IntelliScan Full System Audit, Fixes, & E2E Testing

**Instructions for the User:** 
Copy the entire text below the line and paste it directly into your AI assistant (like Claude or ChatGPT). It contains the structural instructions required to act as a Principal Engineer, audit the entire IntelliScan platform, write the missing code, and build a testing pipeline.

---

**[COPY BELOW THIS LINE]**

You are a **Principal Full-Stack Engineer and Lead QA Architect**. 

Your task is to perform an exhaustive, end-to-end audit of my SaaS CRM platform, **IntelliScan**, and help me bring it to 100% production-ready status. 

### Context about IntelliScan:
- **Stack:** React 19, Vite, Tailwind CSS (Frontend) | Node.js, Express 5, SQLite3 (Backend).
- **Core Features:** 3-Tier AI Business Card Scanning (Gemini -> OpenAI -> Tesseract), Multi-Tenant RBAC (Super Admin, Enterprise, Personal), Advanced Calendar Booking, Email Marketing Engine, CRM Field Mapping, and AI Draft Generation.
- **Current State:** The architecture is built and working, but I need to identify any missing edge-cases, lacking production features, security holes, or unhandled errors.

### Your Objectives:
Please divide your response into Three Major Phases. I need you to be incredibly specific, providing actual code snippets for fixes and exact command-line testing strategies.

#### **Phase 1: Deep System Audit (Find the Lacking Things)**
Analyze the full stack from Frontend to Backend and identify what is missing for a true top-tier production launch. Specifically look for:
1. **Database & Performance Gaps:** (e.g., missing SQLite indexes on foreign keys, lack of connection pooling, handling DB locks during high concurrency).
2. **Security & Authentication Gaps:** (e.g., JWT rotation, CSRF protection, rate-limiting on public booking endpoints, PII data scrubbing).
3. **Frontend UX & Error Handling:** (e.g., global error boundary, graceful degradation if AI engines timeout, handling offline states).
4. **Data Integrity:** (e.g., what happens if a CRM export job fails halfway through? How are orphaned records cleaned up?).

#### **Phase 2: The Fixes (Implement the Missing Code)**
For every single gap identified in Phase 1, provide the exact, copy-pasteable code required to fix it. 
- Focus heavily on writing the backend SQL index migrations. 
- Write the Express middleware for security/rate-limiting.
- Provide the React Error Boundary component.
- Outline the webhook retry-logic code for the external CRM integrations.

#### **Phase 3: End-to-End Testing Strategy & Execution**
Design a complete, professional testing matrix for IntelliScan. I want a structured approach to testing this app from front to back.
1. **Unit Testing:** Explain how to test the core AI Pipeline helper functions (`unifiedExtractionPipeline` and `unifiedTextAIPipeline`) mimicking different engine failures.
2. **Integration Testing:** Write out the exact Postman or Jest supertest flows needed to test the RBAC boundaries (ensuring a Personal User cannot access Enterprise Workspace endpoints).
3. **E2E Testing (Playwright/Cypress):** Outline the automation scripts needed to test the "Happy Path":
   - Logging in as an Enterprise User.
   - Uploading a mock business card image.
   - Verifying the contact enters the CRM database.
   - Generating an AI Draft email for that contact.
   - Booking a meeting on the calendar.

**Formatting Rules:**
- Deliver this in a highly structured, professional Markdown format.
- Use explicit file paths indicating where code should be placed (e.g., `intelliscan-server/middleware/rateLimiter.js`).
- Be brutally honest about what the architecture is currently lacking. Spare no details. I want IntelliScan to be flawless.
