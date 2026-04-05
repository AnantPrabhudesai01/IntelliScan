# 🌳 IntelliScan Exhaustive Directory Tree

Below is the complete, exhaustive list of every single file and folder within the React frontend (`intelliscan-app`) and the Node.js backend (`intelliscan-server`). 

*(Note: Third-party dependency folders like `node_modules` have been excluded for clarity as they contain thousands of auto-generated package files).*

---

## 🟦 1. Frontend (`intelliscan-app/`)
```text
intelliscan-app/
├── public/
│   └── vite.svg
│
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── index.html
├── README.md
│
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    │
    ├── components/
    │   └── (Contains your reusable buttons, cards, and modal components)
    │
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── BatchQueueContext.jsx
    │   ├── ContactContext.jsx
    │   └── ThemeContext.jsx
    │
    ├── layouts/
    │   ├── AdminLayout.jsx
    │   ├── DashboardLayout.jsx
    │   └── PublicLayout.jsx
    │
    └── pages/
        ├── AnalyticsPage.jsx
        ├── ContactsPage.jsx
        ├── ScanPage.jsx
        ├── SettingsPage.jsx
        ├── BillingPage.jsx
        ├── ApiDocsPage.jsx
        ├── FeedbackPage.jsx
        ├── LandingPage.jsx
        ├── SignInPage.jsx
        ├── SignUpPage.jsx
        ├── ForgotPassword.jsx
        ├── MarketplacePage.jsx
        ├── MembersPage.jsx
        ├── OnboardingPage.jsx
        ├── PublicAnalyticsPage.jsx
        ├── ScannerLinksPage.jsx
        ├── WorkspaceContacts.jsx
        ├── WorkspaceDashboard.jsx
        │
        ├── admin/
        │   ├── AiTrainingTuningSuperAdmin.jsx
        │   ├── CustomModelsPage.jsx
        │   ├── DataPoliciesPage.jsx
        │   ├── IntegrationsSuperAdmin.jsx
        │   ├── SharedRolodexPage.jsx
        │   └── WebhooksPage.jsx
        │
        ├── dashboard/
        │   ├── BatchUploadPage.jsx
        │   ├── CoachPage.jsx
        │   ├── DraftsPage.jsx
        │   ├── EventsPage.jsx
        │   └── MyCardPage.jsx
        │
        └── generated/
            ├── GenAnalyticsExtended.jsx
            ├── GenApiDocsExtended.jsx
            ├── GenBatchUploadQueue.jsx
            ├── GenContactDetailModal.jsx
            ├── GenContactListFilters.jsx
            ├── GenDashboardHome.jsx
            ├── GenDataExportTools.jsx
            ├── GenEventsCampaigns.jsx
            ├── GenImportWizard.jsx
            ├── GenLandingPageV2.jsx
            ├── GenNetworkingCoach.jsx
            ├── GenOrganizationSettings.jsx
            ├── GenScanCameraInterface.jsx
            ├── GenScanReviewEdit.jsx
            ├── GenShareContactLink.jsx
            ├── GenSubscriptionPlanComparison.jsx
            ├── GenUserProfile.jsx
            └── GenWorkspaceMembersView.jsx
```

---

## 🟩 2. Backend (`intelliscan-server/`)
```text
intelliscan-server/
├── index.js            # The main server logic, Express routes, and Gemini API integration
├── database.sqlite     # Your persistent local database file
├── .env                # Your Gemini API Key and JWT secrets
├── package.json        
├── package-lock.json
│
└── node_modules/       # (Hidden: Contains Express, SQLite3, Google Generative AI, Cors, etc.)
```
