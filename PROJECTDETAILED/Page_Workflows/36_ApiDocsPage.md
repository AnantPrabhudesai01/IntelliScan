# 📚 Developer API Documentation

> **Page Route**: `/api-docs`  
> **Component**: `ApiDocsPage.jsx`  
> **Access Level**: Public / Developers

---

## 📖 Overview
The API Docs page is a fully interactive, Stripe-inspired developer portal. It documents the IntelliScan REST API v2 with copy-to-clipboard code blocks, request/response schemas, authentication guides, webhook registration, and rate-limit policies. It serves as the primary onboarding resource for third-party integrations.

---

## 🛠️ Technical Workflow

### 1. Documentation Sections
| Section | Content |
|---|---|
| **Introduction** | Base URL (`api.intelliscan.ai/v2`), versioning notice, deprecation timeline |
| **Authentication** | Bearer token format, link to key generation in Marketplace |
| **Scan Engine API** | `POST /v2/scan` — Image submission with engine options and confidence response |
| **Contacts API** | `GET /v2/contacts` (paginated list), `DELETE /v2/contacts/:id` (GDPR purge) |
| **Webhooks & Events** | `POST /v2/webhooks` — Register for `contact.created`, `scan.failed` events |
| **Errors & Rate Limits** | HTTP status codes (200/400/401/429), tier-based rate limits |

### 2. Interactive Components
- **`CodeBlock`**: Syntax-highlighted code with one-click clipboard copy and language indicator.
- **`EndpointDetails`**: Split-pane (Request | Response) with method badges (GET/POST/DELETE/PUT).
- **Sidebar Navigation**: Scroll-spy sidebar with active section highlighting.

### 3. Rate Limit Tiers
| Tier | Limit |
|---|---|
| Free | 10 req/min |
| Professional | 600 req/min |
| Enterprise | Custom |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `MarketplacePage` | Link | Users generate API keys from the Marketplace |
| `BillingPage` | Link | Rate limits are determined by the user's active tier |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Third-Party Integration** | Enables developers to build custom ingestion pipelines |
| **GDPR Compliance** | Documents the Right-to-be-Forgotten deletion endpoint |
| **Webhook-Driven Automation** | Powers real-time CRM sync via event subscriptions |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| N/A (Static Page) | — | This page reads no database tables; it is a static documentation renderer |
