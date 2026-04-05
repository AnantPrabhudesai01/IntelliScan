# IntelliScan: Technical Interview Q&A

This document contains a comprehensive list of technical interview questions that a Principal Engineer, Engineering Manager, or CTO might ask you after reviewing the IntelliScan source code and visual presentation.

---

## Domain 1: System Design & Architecture

**Q1: IntelliScan uses a single SQLite database for all clients. How do you prevent Company A from seeing Company B's business cards?**
**Answer:** The system uses strict *Logical Isolation Multi-Tenancy*. Every core table (Users, Contacts, Events) has a `workspace_id` or `workspace_scope` column. Within the Express backend, our API queries explicitly append `WHERE workspace_id = ?` using the authenticated user's JWT payload. Even if an Enterprise Admin tries to request Contact ID `500`, the database will reject it if that contact is bound to a different `workspace_id`.

**Q2: You mentioned scanning business cards. What happens if the primary cloud AI provider completely crashes during a massive trade show?**
**Answer:** The backend utilizes a **3-Tier AI Fallback Pipeline** (`unifiedExtractionPipeline`). If the primary Google Gemini Vision API times out or throws a 500 error, our Express server catches the exception and automatically reroutes the image buffer to OpenAI's GPT-4o-mini. If OpenAI is also completely down, it falls back to a locally-hosted Tesseract.js OCR engine, ensuring the user *always* gets text back, guaranteeing 100% uptime for the core feature.

**Q3: The system tracks email Opens and Clicks. How is that physically happening in the backend without overloading the server?**
**Answer:** When an email campaign is dispatched, the Node.js server appends a unique UUID (`tracking_id`) to a transparent 1x1 pixel image `<img src="/api/track/open/:tracking_id" />`. When the recipient opens the email, their client renders the image, making a GET request to our server. We instantly log the `opened_at` timestamp in the `email_sends` table. To handle high load without locking the database, we could offload these hits into an in-memory queue (like Redis) and batch-insert them into SQLite later.

---

## Domain 2: Backend (Node.js & Express)

**Q4: I see you implemented Rate Limiting. Why didn't you just use an IP checking IF-statement instead of `express-rate-limit`?**
**Answer:** An in-memory Map or IF-statement checking IPs can cause memory leaks on a production Node server if 50,000 hackers attack at once. `express-rate-limit` is battle-tested to efficiently handle tracking windows. We also applied different limit tiers: the generic `/api` allows 500 hits per 15 minutes, but the highly sensitive `/api/auth/login` endpoint strictly locks out an IP after 15 failed password attempts to mitigate distributed brute-force attacks.

**Q5: SQLite is basically a file on a disk. How does IntelliScan handle 5,000 users reading and writing to the Contacts table simultaneously without database locking errors (`SQLITE_BUSY`)?**
**Answer:** While SQLite is incredibly fast for reading (O(log n) with our explicit indexes), writes require a momentary global lock. To mitigate this in IntelliScan, we utilize Write-Ahead Logging (WAL mode) if configured, allowing concurrent readers alongside a single writer. For ultra-heavy jobs (like CRM integrations), we built `integration_sync_jobs` to queue writes sequentially rather than fighting for instant locks, providing a resilient background buffer.

**Q6: How do you handle authentication statelessness across the React frontend and Node backend?**
**Answer:** We use JWT (JSON Web Tokens). When a user successfully authenticates via `bcrypt` password validation, Node signs a token using cryptographic `JWT_SECRET`. The React app stores this token and attaches it to the `Authorization: Bearer` header on every protected fetch. The API validates the signature natively—meaning the backend doesn't need to do a database lookup for every API call, wildly increasing server performance.

---

## Domain 3: Frontend (React 19 & Vite)

**Q7: I noticed you created a `GlobalErrorBoundary.jsx` component. Why not just use `try/catch` blocks in your components?**
**Answer:** Standard `try/catch` blocks do not catch declarative React rendering cycle errors. If our AI returns malformed JSON (e.g., missing a `name` key), and React tries to render `{contact.name.toUpperCase()}`, the entire DOM tree will crash into a "White Screen of Death". The `GlobalErrorBoundary` taps into React's `componentDidCatch` lifecycle to trap these rendering exceptions gracefully, allowing the user to click "Reload" instead of losing their session.

**Q8: IntelliScan has 60+ screens. How are you managing state between the Contacts Page, the AI Composer, and the Global Sidebar?**
**Answer:** We utilize React Context Providers (`RoleContext`, `ContactContext`, `BatchQueueContext`) situated safely at the root `main.jsx`. Instead of heavily prop-drilling data down 5 levels, any deeply nested component can instantly tap into the global Contact Rolodex or the User's RBAC tier.

**Q9: Why did you choose Vite instead of Create React App (CRA) or Webpack?**
**Answer:** Vite uses native ES modules during development, meaning it doesn't have to bundle the entire 60-screen IntelliScan application every time we hit "Save". The Hot Module Replacement (HMR) is virtually instant. For production, it spins up Rollup to generate heavily optimized, tree-shaken static assets.

---

## Domain 4: AI & Machine Learning Engineering

**Q10: LLMs (Large Language Models) are notorious for hallucinating. If you ask Gemini to parse a business card into JSON, how do you prevent it from returning a conversational string like *"Here is the JSON you requested:"*?**
**Answer:** In the `unifiedExtractionPipeline`, we engineered strict **Deterministic Prompts**. We mandate that the AI output strictly adheres to a predefined JSON schema without markdown block-ticks (`\``). Additionally, we wrap the `JSON.parse(aiResponse)` in a `try/catch` block within Node.js. If the AI hallucinates conversational text, the parser catches the SyntaxError and immediately invokes a heavily-regex-scrubbed retry or falls back to the secondary engine.

**Q11: How do you handle the AI "Confidence Level" scoring system?**
**Answer:** When the Vision AI interprets the image, it's instructed to calculate a confidence threshold (0-100) based on image blurriness and standard field detection. Our Node.js code maps this score directly to the `contacts.confidence` integer. In the UI, any contact parsed with `< 85` confidence is visually flagged with a yellow warning icon, prompting a human Admin to manually verify the extraction accuracy in the Data Quality Dedupe Queue.

---

## General Behavioral / Engineering Questions

**Q12: If you had 6 more months to work on IntelliScan, what architectural changes would you make?**
**Answer:** 
1. I would migrate the local file-system image handling to direct-to-cloud **AWS S3 Presigned URLs** to eliminate massive Node.js memory pressure during bulk uploads.
2. I would adopt **Redis/BullMQ** for the Email Marketing Engine to ensure millions of queued emails don't slow down the main Express REST thread.
3. I would implement **SAML 2.0 (Okta)** to allow true zero-trust Enterprise compliance.
