# SSO & Enterprise Authentication Setup Guide

This guide ensures that your **Okta** and **Azure AD** buttons work correctly with real sessions, and that users are automatically provisioned in your SQLite database.

## 1. Auth0 Dashboard Configuration

### A. Enterprise Connections
To make the "Workplace" login buttons work, you must enable the corresponding connections in Auth0:
1. Go to **Authentication > Enterprise**.
2. **For Okta**: Create an "Okta" connection. Ensure the "Connection Name" is set exactly to `okta`.
3. **For Azure AD**: Create an "Azure AD" connection. Ensure the "Connection Name" is set exactly to `windowslive`.
4. **Enable Clients**: In the "Applications" tab for each connection, ensure that your "IntelliScan" application is toggled **ON**.

### B. Callback URLs
Ensure your Auth0 Application has the following URLs configured:
- **Allowed Callback URLs**: `http://localhost:5173/`, `http://localhost:5173/sso-callback`
- **Allowed Web Origins**: `http://localhost:5173`
- **Allowed Logout URLs**: `http://localhost:5173`

## 2. Environment Variables (.env)

Ensure your frontend and backend `.env` files contain the correct Auth0 credentials:

### Frontend (`intelliscan-app/.env`)
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (`intelliscan-server/.env`)
```env
# Shared JWT Secret (Used to sign the local session)
JWT_SECRET=your-secure-secret-key-here
JWT_EXPIRES_IN=24h
```

## 3. How Provisioning Works

When a user logs in via Auth0:
1. The **Frontend** retrieves the Auth0 User object.
2. The **Auth0Synchronizer** sends this data to `POST /api/auth/sync` on your server.
3. The **Backend**:
   - Checks if the user exists in the `users` table.
   - If not, it **automatically inserts them**.
   - If the email belongs to a corporate domain (not Gmail/Outlook), it **promotes them to Enterprise tier** and creates a dedicated **Workspace**.
   - Returns a local JWT that keeps the user logged in.

## 4. Verification Steps

1. **Clear Local Storage**: Run `localStorage.clear()` in your browser console to start fresh.
2. **Sign In**: Use the "Continue with Google" or "Workplace" buttons.
3. **Database Check**: Open your `intelliscan.db` and run:
   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
   ```
   You should see your real login email and name appearing there instantly.
