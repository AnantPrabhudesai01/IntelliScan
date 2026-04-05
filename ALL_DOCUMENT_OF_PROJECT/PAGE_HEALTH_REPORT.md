# IntelliScan Page Health Report

Generated: `2026-04-03T20:00:27.990Z`

## Summary

- Total routes (explicit + generated): **120**
- Explicit routes in `App.jsx`: **59**
- Generated routes in `routes.json`: **61**
- Pages missing / unreadable file mapping: **3**
- Backend API routes detected (best-effort): **145**
- Pages with missing backend endpoints: **2**
- Pages still using `localStorage.getItem('token')` directly: **0**

## Pages With Missing Backend Endpoints

- `/admin/incidents` -> `SystemIncidentCenter`
  - file: `intelliscan-app\src\pages\admin\SystemIncidentCenter.jsx`
  - missing endpoints: `/api/admin/incidents/:param/:param (LITERAL)`
- `/workspace/members` -> `MembersPage`
  - file: `intelliscan-app\src\pages\MembersPage.jsx`
  - missing endpoints: `/api/workspace/members (FETCH)`, `/api/workspace/members/invite (FETCH)`, `/api/workspace/members/:param (FETCH)`, `/api/workspace/members (LITERAL)`, `/api/workspace/members/invite (LITERAL)`, `/api/workspace/members/:param (LITERAL)`

## Pages Still Using localStorage Token Directly

- None detected.

## Backend Routes Possibly Unused By Frontend

(Best-effort: compares frontend string endpoints to backend route patterns.)

- `GET` `/api/access/matrix`
- `GET` `/api/access/me`
- `POST` `/api/admin/incidents/:id/ack`
- `POST` `/api/admin/incidents/:id/resolve`
- `GET` `/api/admin/integrations/failed-syncs`
- `GET` `/api/admin/system/health`
- `POST` `/api/analytics/log`
- `GET` `/api/auth/me`
- `GET` `/api/calendar/accept-share/:token`
- `POST` `/api/calendar/ai/generate-description`
- `POST` `/api/calendar/ai/suggest-time`
- `PUT` `/api/calendar/calendars/:id`
- `DELETE` `/api/calendar/calendars/:id`
- `POST` `/api/calendar/calendars/:id/share`
- `GET` `/api/calendar/respond/:token`
- `POST` `/api/chat/support`
- `POST` `/api/contacts/:id/enrich`
- `GET` `/api/contacts/:id/relationships`
- `POST` `/api/contacts/export-crm`
- `POST` `/api/contacts/relationships`
- `GET` `/api/contacts/semantic-search`
- `POST` `/api/crm-mappings`
- `GET` `/api/email/track/click/:trackingId`
- `GET` `/api/email/track/open/:trackingId`
- `GET` `/api/email/unsubscribe/:trackingId`
- `GET` `/api/engine/config`
- `PUT` `/api/engine/config`
- `GET` `/api/engine/versions`
- `POST` `/api/engine/versions/:id/rollback`
- `GET` `/api/enterprise/system-health`
- `GET` `/api/enterprise/webhooks`
- `GET` `/api/enterprise/workspaces`
- `DELETE` `/api/events/:id`
- `GET` `/api/health`
- `GET` `/api/sandbox/logs`
- `DELETE` `/api/sandbox/logs`
- `POST` `/api/sandbox/test`
- `GET` `/api/search/global`
- `GET` `/api/signals`
- `POST` `/api/workspace/billing/payment-methods/:id/set-primary`
