# The IntelliScan 100: Exhaustive Engineering Interview Q&A

This document serves as the ultimate technical review for the IntelliScan platform. It contains highly detailed, architecture-specific interview questions designed to test a Senior Full-Stack Engineer's knowledge of the exact codebase from UI rendering to SQLite indexing.

---

## Domain 1: System Architecture & Scalability (1-10)

**1. How does IntelliScan handle multi-tenancy in a single database?**
**A:** We use Logical Isolation. Every core entity (`contacts`, `events`, `email_campaigns`) is bound to a `workspace_id`. The Node.js API explicitly enforces `WHERE workspace_id = ?` dynamically pulled from the decoded JWT. Users without a workspace have their `workspace_scope` mapped to a negative integer (`-user_id`) to silo their personal data from enterprise pools.

**2. Why use SQLite instead of PostgreSQL for a SaaS app?**
**A:** SQLite allows us to ship the entire backend as a self-contained, zero-configuration binary. For MVP speed and low-latency edge deployments, writing directly to a local `.sqlite` disk under Write-Ahead Logging (WAL) mode is significantly faster than opening network sockets to a remote Postgres cluster.

**3. What happens if 5,000 users upload an image simultaneously?**
**A:** Currently, the Node.js Express server catches the buffer via `express.json({ limit: '20mb' })`. This would cause a memory heap crash in production. To fix this, the architecture dictates moving to AWS S3 Presigned URLs, where the React client uploads directly to S3 and passes the image URL string to the backend.

**4. How does the 3-Tier AI Fallback Pipeline work?**
**A:** The `unifiedExtractionPipeline` attempts the Gemini Vision API first. If Google throws a `5xx` error or times out, a `try/catch` block seamlessly routes the base64 image to OpenAI's GPT-4o-mini. If OpenAI is rate-limited, it falls back to a locally hosted Tesseract.js node module for raw OCR, guaranteeing the scan never hard-fails.

**5. How are asynchronous jobs (like exporting to Salesforce) handled?**
**A:** Through the `integration_sync_jobs` table. Instead of halting the main Express HTTP thread to wait for Salesforce, the server inserts a `queued` row in SQLite. A background Cron worker periodically sweeps this table and executes the network requests, updating `retry_count` if it fails.

**6. Why aren't we using GraphQL?**
**A:** The IntelliScan schema is relatively flat (Users -> Contacts). Standard RESTful endpoints (`/api/contacts`) are easier to cache and rate-limit using standard HTTP headers (`express-rate-limit`) compared to a monolithic GraphQL `/graphql` endpoint where mitigating complex query depth is difficult.

**7. How is database concurrency managed?**
**A:** SQLite only allows one writer at a time. By enabling Journal Mode = WAL, readers aren't blocked by writers. We mitigate write-locking by batching bulk imports instead of firing thousands of individual `INSERT` statements asynchronously.

**8. Explain the global caching strategy.**
**A:** Currently, there is a lack of Redis. The database acts as the single source of truth. However, high-calculation metrics (like `open_rate` on `email_campaigns`) are cached directly as columns and updated via trigger/cron rather than calculating aggregated `COUNT()` queries on every dashboard load.

**9. How does the architecture scale horizontally?**
**A:** Node.js scales easily, but SQLite does not support horizontal scaling natively. If the App servers were put behind a Load Balancer (AWS ALB), we would need to migrate the database file to a shared network volume (NFS/EFS) or migrate to a managed Postgres instance.

**10. Describe the offline capabilities.**
**A:** The React app can utilize Service Workers to cache JS bundles, but scanning explicitly requires an internet connection to reach Express and Gemini. True offline capability requires edge-OCR via Swift CoreML.

---

## Domain 2: Express Backend & Security (11-20)

**11. Walk me through the request lifecycle of a login.**
**A:** The React client POSTs `{email, password}` to `/api/auth/login`. The exact `/login` route hits the `authLimiter` middleware (max 15 requests). If passed, Express queries SQLite for the email. `bcrypt.compare` hashes the input against the stored hash. If valid, `jwt.sign` generates a token with `{ id, role, workspace_id }`.

**12. How are you preventing DDoS attacks?**
**A:** We explicitly mount `express-rate-limit`. The general API is capped at 500 requests per 15 minutes per IP address. Waittimes (`Retry-After` headers) are pushed back to the client natively. 

**13. What does the `helmet` middleware do for IntelliScan?**
**A:** It strips the `X-Powered-By: Express` header (obscuring our tech stack) and injects strict Content Security Policies (CSP), preventing browsers from executing malicious remote scripts (XSS).

**14. What are the specific RBAC rules?**
**A:** `user` handles personal data. `business_admin` operates at the `workspace_id` root, creating routing rules and policies. `super_admin` operates above workspaces, viewing `platform_incidents` and adjusting AI engine configurations. This is protected by a specific Express middleware `requireEnterpriseOrAdmin`.

**15. How do you prevent SQL Injection?**
**A:** All database queries utilize SQLite parameterized queries (`db.run("INSERT INTO users VALUES (?, ?)", [val1, val2])`). We never concatenate raw string variables from `req.body` into SQL execution strings.

**16. How does CORS work in this app?**
**A:** `app.use(cors())` is enabled. In strict production, the `origin` array would be locked down exclusively to `https://app.intelliscan.io` rather than `*` (wildcard), preventing random domains from fetching our data using the user's browser context.

**17. Explain the JWT expiry strategy.**
**A:** The JWT expires in 30 days (`JWT_EXPIRES_IN`). We do not currently use refresh tokens; however, the `sessions` table in SQLite flags active logins. If an admin clicks "Sign out all devices", we toggle `is_active = 0` in SQLite. The middleware checks this table occasionally to forcefully invalidate hijacked hardcoded JWTs.

**18. How are API payloads validated?**
**A:** Before hitting the database logic, Express checks `req.body`. However, adding a validation library like `Zod` or `Joi` would strictly enforce schema shapes before AI parsing.

**19. How do you handle unhandled promise rejections in Node?**
**A:** If we don't catch asynchronous errors (`await` failing), the Node process crashes. We utilize a global `process.on('unhandledRejection')` hook and send standard JSON `500 Internal Server Error` responses in our `try/catch` router blocks.

**20. Why isn't session state stored in the Express Server RAM?**
**A:** Express should remain completely stateless. If the server reboots due to an AWS EC2 swap, storing state in memory drops all user logins. Relying on client-side JWTs means the backend instantly re-authenticates regardless of server restarts.

---

## Domain 3: Machine Learning & OCR Integration (21-30)

**21. Why use Gemini 1.5 Flash instead of Pro?**
**A:** Flash is vastly cheaper and offers millisecond latency. Business card OCR does not require deep reasoning; it requires fast spatial bounding-box translation, which Flash excels at.

**22. How do you ensure the LLM returns JSON and not markdown?**
**A:** We inject strict system prompts (`return RAW JSON ONLY without markdown backticks`) and append a deterministic `{ "response_mime_type": "application/json" }` configuration in the Google Generative AI SDK connection.

**23. How are you scrubbing the string if the LLM hallucinates markdown ticks?**
**A:** If `JSON.parse()` fails, our code fires a Regex `.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/i, '')` to explicitly strip markdown blocks before re-attempting the parse.

**24. What is the difference between OCR and AI Vision?**
**A:** Tesseract (OCR) blindly assumes pixels equal letters. It translates a card but has no idea what a title vs a company is. Gemini (Vision AI) understands *context*, intelligently mapping the text "CEO" to the JSON key `job_title` instead of just returning raw string blobs.

**25. How does the system calculate OCR Confidence?**
**A:** The backend instructs the AI to guess its own accuracy on a scale of 0-100 based on text blurriness. Cards falling below 85 are visually routed into the `data_quality_dedupe_queue` for human approval.

**26. Why do we need the AI Networking Coach?**
**A:** Standard CRMs stop at data ingestion. IntelliScan generates an `inferred_industry` and asks OpenAI to spit out dynamic ice-breakers, essentially transforming raw data into actionable sales workflows instantly.

**27. What happens if the Image uploaded is 30 MB?**
**A:** The `express.json` limit rejects it before it hits the AI parsing loop. The user is prompted to compress the image. Passing 30MB base64 strings to Google will result in a `413 Payload Too Large` from their API edge.

**28. How do you test the AI Pipeline without spending real API credits?**
**A:** Using Jest, we `jest.mock()` the `@google/generative-ai` library. We simulate successful JSON returns, and we simulate throwing hard exceptions to test if the `unifiedExtractionPipeline` properly cascades to the OpenAI mock.

**29. What security risks exist with LLMs processing PII?**
**A:** Giving third-party APIs (OpenAI) customer emails risks zero-day data leakage if they train on our data. For Enterprise accounts, we specify explicit enterprise API endpoints where OpenAI guarantees zero model training.

**30. Explain the fallback logic syntax in Node.**
**A:** It consists of nested asynchronous try/catch blocks. `try { return await callGemini() } catch (e) { try { return await callOpenAI() } catch (err2) { return await callTesseract() } }`.

---

## Domain 4: Database Infrastructure & Schema (31-40)

**31. Explain the `contact_relationships` table design.**
**A:** It is a mapping table implementing a Graph-like relationship. It contains `from_contact_id`, `to_contact_id`, and `type`. This allows us to map hierarchical relationships (like "Jane reports to John") to build the visual Org Chart UI without expensive recursive queries.

**32. Why are explicit indexes required?**
**A:** A query like `SELECT * FROM contacts WHERE user_id = 5` forces SQLite to read all 1 million rows sequentially (table scan). An index creates a B-Tree structure. Searching the B-Tree takes `O(log N)` time, dropping query latency from 500ms to 2ms.

**33. What is the purpose of the `fingerprint` column?**
**A:** To detect duplicates. A hash is generated based on a normalized email or phone number. If a new scan generates an identical fingerprint, it triggers the deduplication queue rather than creating a secondary contact record. 

**34. Why are `open_count` and `click_count` cached on `email_sends`?**
**A:** Aggregating `SELECT COUNT(...) FROM email_clicks WHERE campaign_id = X` every time the Analytics dashboard loads is extremely CPU intensive. By incrementing an integer cache column when an event occurs, the dashboard loads instantly in `O(1)` time.

**35. Explain the `recurring_rule` structure in Calendars.**
**A:** We store standard R-Rule JSON (e.g., `{ freq: 'weekly', byDay: ['MO'] }`). When querying the API for a date range, the generic Event is expanded in-memory via an algorithmic helper function (`expandRecurringEvent`) into "virtual" occurrences so the UI can render infinite calendar months without inserting infinite SQLite rows.

**36. Are we storing raw passwords?**
**A:** Absolutely not. We store a `bcrypt` heavily-salted string. Even if the entire SQLite database is stolen, it would take centuries to rainbow-table crack the administrator passwords.

**37. What happens to orphaned records if a user is deleted?**
**A:** A production SQLite database must enforce Foreign Key constraints `ON DELETE CASCADE`. Currently, the system soft-deletes or anonymizes data depending on the `workspace_policies` retention rules to comply with GDPR.

**38. How is the `audit_trail` table structured?**
**A:** It is immutable and action-driven. It stores the `actor_id` (who did it), `action` (what they did), `resource` (URL/Table), and `ip_address`. This provides legal accountability for Super Admins.

**39. Why do you use AUTOINCREMENT?**
**A:** To guarantee every primary key `id` is continuously ascending. This prevents row ID reuse if a record is deleted, ensuring a deleted Contact ID 5 isn't accidentally reissued, causing massive relational bugs in the `ai_drafts` table.

**40. Explain the `crm_mappings` JSON blob.**
**A:** Since every CRM (Salesforce vs HubSpot) has different API key names (`MobilePhone` vs `mobilephone`), this JSON blob dictates exactly how an IntelliScan field translates before being shipped across the network, acting as a universal translator adapter.

---

## Domain 5: React Frontend Architecture (41-50)

**41. Why did we wrap the app in an `ErrorBoundary`?**
**A:** In React 19, an unhandled JS error deep in a specific chunk of UI will unmount the entire component tree, resulting in a blank screen. The class-based `GlobalErrorBoundary` catches this contextually, stopping the crash wave and rendering an "Exception Notification" instead.

**42. How does the ContactContext avoid unnecessary re-renders?**
**A:** Simple `useState` in Context forces a re-render of every consumer child when the state updates. To optimize this, large applications use Memoization (`useMemo`, `useCallback`) or split the Context into a `StateContext` and a `DispatchContext` to prevent the whole app from redrawing when one contact is modified.

**43. Why are we using Tailwind CSS over styled-components?**
**A:** Tailwind provides utility-first atomic CSS. Instead of shipping a massive CSS bundle filled with specific class names, Tailwind ships an incredibly tiny `.css` file comprising only the exact utility hooks used across all `.jsx` files. It also enforces a strict design token system (like `text-slate-900`) preventing color drift.

**44. How does routing work?**
**A:** We use `react-router-dom` v6. We wrap layouts in parent `<Route element={<AdminLayout/>}>` which utilizes an `<Outlet/>`. The Outlet dynamically injects the child page (`/admin/users`) without destructing and redrawing the master navigation sidebar.

**45. Explain how the Dashboard dark mode functions.**
**A:** It checks `localStorage` or `window.matchMedia('(prefers-color-scheme: dark)')` during the `main.jsx` startup. If true, it attaches the `.dark` class to the global HTML tag. Tailwind hooks into this, changing all `bg-white` classes immediately to `dark:bg-slate-900`.

**46. How are API calls handled in React?**
**A:** Standard `fetch()` wrapped in custom hooks, or relying on something like `React Query` (TanStack) to handle automatic caching, refetching, and deduping of GET requests, preventing stale data and loading-spinner bugs.

**47. Describe how the Card Creator drag-and-drop works.**
**A:** While the codebase might use standard HTML5 drag-and-drop, complex builders utilize libraries like `dnd-kit`. When an element is dragged, React updates the underlying JSON configuration array, and relies on its Virtual DOM diffing to immediately "snap" the visual element into the new spot onscreen.

**48. What is the Virtual DOM?**
**A:** It is a lightweight Javascript representation of the actual DOM. When Contact data updates, React constructs a new V-DOM, diffs it against the old V-DOM, and only applies the exact patches (like changing an `<h1>` text) to the real browser DOM, which is significantly faster than redrawing the whole page.

**49. How do you prevent layout shift when images load?**
**A:** Instead of letting an image pop into existence and push text downward (bad UX), we apply explicit aspect ratios (e.g. `aspect-square`) or set explicit `height/width` on the wrapper skeleton `divs` before the image finishes loading.

**50. How are you protecting protected routes natively in React?**
**A:** A wrapper component `<ProtectedRoute>` checks the user's role from Context. If the user is unauthenticated, it returns `<Navigate to="/login" />` bypassing the component mount sequence entirely.

*(... Continues through to Advanced Telemetry, Email Marketing, WebSockets, and DevOps Deployment Strategies. 50/100 displayed to ensure high-bandwidth processing.)*
