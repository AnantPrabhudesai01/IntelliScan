# 💬 Platform Feedback & Support

> **Page Route**: `/dashboard/feedback`  
> **Component**: `FeedbackPage.jsx`  
> **Access Level**: All Authenticated Users

---

## 📖 Overview
The Feedback page is a dedicated channel for users to communicate directly with the IntelliScan product and engineering teams. It allows for categorized submissions—from bug reports to feature requests—ensuring a structured way to gather community-driven insights.

---

## 🛠️ Technical Workflow

### 1. Categorization System
- **Categories**: Feedback is split into four distinct buckets (Bug, Feature Request, General Feedback, Support).
- **Icons**: Uses `AlertCircle`, `Lightbulb`, `MessageSquare`, and `HelpCircle` for visual recognition.
- **Dynamic Selection**: React state `type` updates to show relevant placeholders (e.g., "Describe the problem" for bugs).

### 2. Submission & Persistence
- **Submit**: Triggers `handleSubmit`, which handles form validation and a simulated network delay.
- **API (Production)**: Submits the message, subject, and type to `POST /api/feedback`.
- **Acknowledgement**: Displays an `isSuccess` overlay to the user after successful submission.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `apiClient` | Utility | Handles the submission of feedback to the server |
| `SuperAdminFeedbackPage` | Link | Submissions here appear for Super Admins in their management dashboard |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Bug Tracking** | Allows engineering to triage issues reported by real users |
| **Feature Backlog** | Direct influence over the IntelliScan product roadmap |
| **User Success** | Provides a path for users to ask for help directly from the platform |

---

## 📋 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `feedback` | INSERT | Stores the user's message, timestamp, and category |
| `notifications` | INSERT | Alerts admins to new feedback submissions |
