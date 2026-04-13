# 🚀 User Onboarding & Personalization

> **Page Route**: `/onboarding`  
> **Component**: `OnboardingPage.jsx`  
> **Access Level**: New Users (Post-Signup)

---

## 📖 Overview
The Onboarding page is the first experience a new user has after authenticating. It serves to personalize their workspace by gathering professional context, including job roles, company details, CRM preferences, and primary use cases. This data is used to optimize the AI's feature recommendations and scanning engine.

---

## 🛠️ Technical Workflow

### 1. Multi-Step Form Design
- **Step 0 (Profile)**: Captures `jobTitle` and `companyName`. Highlights the "OCR-V2" engine optimization for the user's specific context.
- **Step 1 (Workflow)**: Selects an existing CRM (Salesforce, HubSpot, Zoho) and determines the team size (Solo to Enterprise).
- **Step 2 (Use Cases)**: Multi-selects primary goals (Trade Shows, Sales Prospecting, etc.).

### 2. State & Persistence
- **Form Data**: A single `formData` object stores all inputs throughout the steps.
- **Submission**: On the final step, `handleFinish()` triggers `POST /api/onboarding` to synchronize these preferences to the user's profile.
- **Redirection**: Automatically navigates the user to `/dashboard/scan` once the profile is initialized.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `apiClient` | Utility | Sends the final onboarding payload to the server |
| `ScanPage` | Link | The primary destination after completing the walkthrough |
| `RoleGuard` | Middleware | Ensures only authenticated users can access the onboarding flow |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Personalized Insights** | Directly influences the "Coach" and "Signals" AI components |
| **Engine Selection** | Helps the system choose the best backend model for the user's scanning habits |
| **Workspace Setup** | Automates the creation of a private or shared Rolodex based on team size |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `users` | UPDATE | Sets `job_title`, `company`, and `onboarding_complete` flag |
| `user_preferences` | INSERT | Stores the CRM and team size for feature enablement |
| `workspaces` | UPDATE/INSERT | Pre-configures workspace settings based on onboarding team size |
