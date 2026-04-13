# 🧪 Advanced API Explorer Sandbox

> **Page Route**: `/admin/api-sandbox`  
> **Component**: `AdvancedApiExplorerSandbox.jsx`  
> **Access Level**: Super Admin / Developer

---

## 📖 Overview
The API Explorer Sandbox is an interactive, Postman-like testing environment built directly into the admin dashboard. It allows Super Admins and developers to execute live API requests against the IntelliScan backend, inspect responses, and debug integration issues without leaving the platform.

---

## 🛠️ Technical Workflow

### 1. Request Builder
- **Method Selection**: Supports GET, POST, PUT, DELETE.
- **URL Input**: Pre-populated with available IntelliScan API endpoints.
- **Headers Editor**: Automatically injects the current user's Bearer token; supports custom headers.
- **Body Editor**: JSON body editor with syntax highlighting for POST/PUT requests.

### 2. Response Inspector
- **Status Code Display**: Color-coded (green for 2xx, amber for 4xx, red for 5xx).
- **Response Body**: Formatted JSON output with collapsible sections.
- **Latency Measurement**: Shows round-trip time in milliseconds.

### 3. Saved Requests
- **Collection Management**: Save frequently-used requests for quick re-execution.
- **History**: View the last 50 executed requests with their responses.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ApiDocsPage` | Reference | Developers cross-reference the API docs while testing |
| `index.js` (Backend) | Target | All requests are executed against the live backend |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Rapid Debugging** | Eliminates the need for external tools like Postman |
| **Integration Testing** | Enterprise customers test their webhook endpoints in real-time |
| **Developer Onboarding** | New team members explore the API interactively |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `api_sandbox_history` | INSERT/SELECT | Stores executed request/response pairs |
