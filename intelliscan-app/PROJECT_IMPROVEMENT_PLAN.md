# Intelliscan Project Audit and Improvement Plan

> Generated: April 3, 2026

## 1. Project Overview

### Frontend: `intelliscan-app`
- React / Vite application
- Core direct source files: 186 (JSX/TSX 158)
- Key folders:
  - `src/pages`: 119 pages
  - `src/components`: 21 component modules (root + calendar + email)
  - `src/context`: 3 contexts
  - `src/utils`: 2 utility modules
- Route and feature breadth:
  - Admin / superadmin panels
  - Analytics and reporting
  - API docs and sandbox explorer
  - Billing, subscriptions, usage quotas
  - Calendar booking, scheduling, recurring events
  - Contacts + CRM, campaign management
  - Authentication / onboarding
  - Public branding, marketplace, settings
  - Many generated pages `src/pages/generated/Gen*` (estimated 50+ auto-generated admin pages)

### Backend: `intelliscan-server`
- Node + Express with SQLite persistence
- Core source files: 30 (JS/TS 12) after excluding dependencies
- DB schema tables: 41 (in `parsed_schema.sql`)
- Key modules:
  - `index.js`: all endpoints, auth, business logic, OCR and AI routing
  - `src/middleware/auth.js`: JWT + role gates
  - `src/utils/db.js`: SQLite async wrappers
  - `src/utils/logger.js`: audit trail SQL operations
  - `src/config/constants.js`: JWT and env defaults
  - `ensure_tables.js` / `fix_admin.js` DB setup scripts
- Seeded user count (local DB): 10 users

## 2. What is currently lacking

### 2.1 Testing / quality coverage
- Only tests found:
  - `tests/auth.test.js`
  - `tests/pipeline.test.js`
- Missing:
  - unit tests for endpoint controllers
  - integration tests (API + DB)
  - UI component tests (Jest/React Testing Library)
  - E2E (Cypress/Playwright)

### 2.2 Type safety and validation
- JavaScript only (no TypeScript)
- No request payload validation (validated body schemas)
- No typed entity models
- Potential for invalid input to query constructors

### 2.3 Modular backend architecture
- `index.js` is monolithic:
  - auth, rate limit, email, OCR, busines logic, and routes in one file
- No separate router files:
  - `routes/auth.js`, `routes/contacts.js`, `routes/campaigns.js`, etc.
- No service layer abstraction

### 2.4 Security and hardening
- CORS currently broad (unrestricted origin likely)
- lack of request body sanitization
- no CSRF tokens / form protection
- no output encoding patterns
- no explicit strong password policy and account lockout

### 2.5 Production database readiness
- SQLite is single-node, not multi-process safe for scaled production
- no migration management / seed structure (except adhoc scripts)
- recommended migrations library missing

### 2.6 Observability and telemetry
- Audit table exists; however:
  - no centralized log backplane (Winston/Pino/Datadog)
  - no metrics extraction (Prometheus etc.)
  - no request tracing

### 2.7 Access control and RBAC
- `requireAdmin` middleware uses static role set
- lacks fine-grained permissions per API uri or action
- no pluggable ABAC policy system

### 2.8 Rate limiting & DDoS resilience
- per-path limits hard-coded in memory
- no distributed limits (redis)
- minimal n-day abusive behavior protection

### 2.9 Error handling consistency
- likely local 500 or next result flows
- desired: central error handler and uniform API error envelope

### 2.10 Documentation and ease of use
- README likely minimal
- missing OpenAPI or Swagger for REST contract
- missing developer environment quick-start docs (setup script, env variables table, secrets layout)

## 3. Priority additions and improvements

### 3.1 Immediate high-impact fixes
1. Add schema validation to all endpoint request bodies
   - use `zod` / `joi` / `express-validator`
2. Extract routes from `index.js` into specific modules
   - `routes/auth.js`, `routes/workspace.js`, `routes/contacts.js`, `routes/campaigns.js` etc.
3. Add unit & integration test suite
   - server: Jest + supertest for APIs
   - UI: Jest + RTL for key page components
4. Add proper RBAC + user permission matrix
   - map `super_admin`, `admin`, `business_admin`, `user` rights
5. Replace SQLite with PostgreSQL/MySQL for multi-tenant production
   - add Prisma/Knex for migrations

### 3.2 Security hardening
- Use `helmet` with all standard headers
- Harden CORS (domain whitelist, methods only required)
- enforce HTTPS, secure cookies, HTTP strict transport security
- implement password+2FA policy and account lockout
- sanitize all SQL inputs and output responses

### 3.3 Observability and operations
- Add `winston` / `pino` to output structured logs + context
- Add request id in middleware and `X-Trace-ID` header
- Add a metrics endpoint `/metrics` (Prometheus) or SaaS integration
- Add periodic auditing of security events to alerting mechanism

### 3.4 Frontend maintainability
- add eslint, prettier configs
- enforce coding style + lint rules in CI
- split generated pages into named feature flows (if generated scaffolding is placeholder)
- add state management documentation for main context flows (`ContactContext`, `BatchQueueContext`, `RoleContext`)

### 3.5 API and front-end feature hardening
- implement pagination + sorting + filtering in data endpoints
- apply authorization checks on all data operations
- secure file/attachment uploads and sanitize file names
- verify rate-limit usage per business plan (user quotas, tier limit enforcement)

### 3.6 Documentation and workflow
- Add OpenAPI spec + UI (Swagger at `/api-docs`)
- Provide `README.md` extended sections:
  - local setup
  - dev environment
  - synchronization with server
  - rebuild procedures
  - test commands
- Create release checklist: Lint → Test → Build → Security scan

## 4. Suggested roadmap (3 phases)

### Phase 1 (1-2 Weeks)
- route refactor + validation + central middleware
- base automated tests + lint
- initial security hardening + secrets audit

### Phase 2 (2-3 Weeks)
- DB migration strategy + environment config
- observability + metrics
- role permissions matrix + feature access
- UX hardening and accessibility checks

### Phase 3 (ongoing)
- E2E tests, CI/CD automation
- scalability adaptation (k8s/deployment)
- multi-workspace tenant partitioning and load tests
- advanced AI/engine optimization and feature gating

---

## 5. Notes for implementation
- start with low-hanging bugs first: schema validation + auth defenses.
- incremental refactor of `index.js` to avoid regression.
- use `git` branches per feature with PR review.

**Result:** this project is strong but still needs structured engineering practices before safe production guarantees. This markdown plan gives a direct execution path with priorities.
