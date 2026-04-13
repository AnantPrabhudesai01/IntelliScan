# 📝 Sign Up Page (Registration)

> **Route**: `/signup`  
> **Component**: `SignUpPage.jsx` (10,510 bytes)  
> **Access**: Public (unauthenticated)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Sign Up page lets new users **create an IntelliScan account**. They choose a plan tier (Personal or Enterprise), enter their details, and the system creates their account with appropriate role-based permissions.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `name` | `string` | User's full name |
| `email` | `string` | User's email |
| `password` | `string` | User's chosen password |
| `tier` | `string` | Selected plan: 'personal' or 'enterprise' |
| `loading` | `boolean` | Prevents double submission |
| `error` | `string` | Error message for registration failures |

### Key Functions
1. **`handleSignUp(e)`**: Submits registration data to `POST /api/auth/register`.
2. On success: auto-login with returned JWT → redirect to `/onboarding` or `/dashboard/scan`.
3. On failure: displays validation errors.

### Lifecycle
```
User fills form → Selects tier → Submit
    → POST /api/auth/register { name, email, password, tier }
    → Server creates user with bcrypt hash
    → Auto-assigns role: 'user' (personal) or 'business_admin' (enterprise)
    → Creates default workspace for enterprise users
    → Returns: { token, user }
    → Redirect to dashboard
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |

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
| `OnboardingPage` | New users may be directed to onboarding |
| `SignInPage` | "Already have an account?" link |
| Every dashboard page | User account created here is the foundation |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `users` | INSERT | Creates the new user record with hashed password |
| `workspaces` | INSERT | Auto-creates a workspace for enterprise tier |
| `workspace_members` | INSERT | Auto-enrolls the creator as workspace owner |
| `user_quotas` | INSERT | Initializes scan quota based on tier |
