# 🔐 Sign In Page (Authentication)

> **Route**: `/signin`  
> **Component**: `SignInPage.jsx` (9,374 bytes)  
> **Access**: Public (unauthenticated)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Sign In page is the **secure gateway** into IntelliScan. Users enter their email and password, and if the credentials match, they're logged in and redirected to the dashboard. It handles both personal and enterprise logins through a single unified interface.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `email` | `string` | User's email input |
| `password` | `string` | User's password input |
| `loading` | `boolean` | Prevents double submission |
| `error` | `string` | Error message for invalid credentials |

### Key Functions
1. **`handleSignIn(e)`**: Submits credentials to `POST /api/auth/login`.
2. On success: stores JWT token + user object in `localStorage` → redirects to `/dashboard/scan`.
3. On failure: displays error message.

### Lifecycle
```
User enters email + password → Submit
    → POST /api/auth/login { email, password }
    → Server validates against bcrypt hash in SQLite
    → Returns: { token (JWT), user: { id, name, email, role, tier } }
    → localStorage.setItem('token', token)
    → localStorage.setItem('user', JSON.stringify(user))
    → navigate('/dashboard/scan')
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user and return JWT |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `PublicLayout` | Layout | Minimal public shell |
| `auth.js` | Utility | Token storage helpers |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| Every authenticated page | All require the JWT token set here |
| `SignUpPage` | "Don't have an account?" link |
| `ForgotPassword` | "Forgot your password?" link |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT | Validates email/password against stored bcrypt hash |
