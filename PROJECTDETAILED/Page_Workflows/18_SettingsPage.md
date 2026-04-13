# ⚙️ Settings & Account Management

> **Page Route**: `/dashboard/settings`  
> **Component**: `SettingsPage.jsx`  
> **Access Level**: All Authenticated Users

---

## 📖 Overview
The Settings page is the central hub for user profile management, security configuration, and integration overview. It allows users to personalize their IntelliScan experience, secure their account with 2FA, and monitor active sessions across different devices.

---

## 🛠️ Technical Workflow

### 1. Profile Management
- **State**: Manages user details (Name, Email, Job Title, Company) via a local `formData` state.
- **Persistence**: Updates the `users` table via `apiClient.put('/user/profile')` (though currently mostly client-side simulation in the snippet, it connects to the profile update API).
- **Avatar**: Supports image upload and retrieval, displaying the first letter of the name as a fallback.

### 2. Session Security (`/sessions/me`)
- **Real-time Monitoring**: Fetches active login sessions from the backend using the `authenticateToken` middleware.
- **Revocation**: Users can remotely log out other devices using `DELETE /sessions/:id`.
- **Session Details**: Displays IP address, device type (Icon-mapped: Laptop/Smartphone), and last active timestamp.

### 3. Security & 2FA
- **Password Updates**: Validates current password before allowing a change to the `password_hash` in the database.
- **Two-Factor Authentication**: Toggle for 2FA (SIMULATED in UI, hooked to the security middleware logic).

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `apiClient` | Utility | Handles authenticated requests for session management |
| `RoleContext` | Context | Determines available settings based on user tier (Free vs Pro) |
| `MarketplacePage` | Link | Users are redirected here to add new integrations |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Remote Logout** | Critical for security if a device is lost or a public computer is left logged in |
| **Profile Sync** | Ensures AI-generated email signatures and business cards use the latest personal info |
| **Integration Visibility** | Shows the status of Salesforce/HubSpot links at a glance |

---

## 📊 Database Impact
| Table | Operation | Description |
|---|---|---|
| `users` | UPDATE | Updates name, email, and preferences |
| `sessions` | SELECT/DELETE | Monitors and terminates active login tokens |
| `crm_mappings` | SELECT | Checks connection status for Marketplace summary |
