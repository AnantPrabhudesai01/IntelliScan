# 🔑 Forgot Password & Account Recovery

> **Page Route**: `/forgot-password`  
> **Component**: `ForgotPassword.jsx`  
> **Access Level**: Public (Unauthenticated)

---

## 📖 Overview
The Forgot Password page enables users to initiate a secure password reset flow. Users enter their registered email address, and the system sends a time-limited reset token via email. The page provides clear feedback on submission status with graceful error handling.

---

## 🛠️ Technical Workflow

### 1. Reset Request
- **Input**: Email address field with validation.
- **API**: `POST /api/auth/forgot-password` with `{ email }`.
- **Backend Logic**: Generates a cryptographic `reset_token`, stores it with a 1-hour expiry in the `users` table, and dispatches a Nodemailer email with the reset link.

### 2. User Feedback
- **Success State**: Displays a confirmation message ("If an account exists, a reset link has been sent") to prevent email enumeration attacks.
- **Error Handling**: Network errors are caught and displayed inline.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `SignInPage` | Link | "Back to Sign In" navigation |
| `Nodemailer` | Backend | Sends the reset email with the token link |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Self-Service Recovery** | Users can regain access without admin intervention |
| **Security** | Time-limited tokens prevent stale recovery links |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `users` | UPDATE | Stores `reset_token` and `reset_token_expires` |
