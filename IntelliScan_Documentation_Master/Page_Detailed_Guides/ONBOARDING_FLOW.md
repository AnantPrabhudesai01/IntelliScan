# Deep Dive: Onboarding & Account Setup

This module ensures a frictionless transition for new users from the landing page to their first successful scan.

---

## 📄 Overview
-   **Page Path**: `/onboarding` and `/sign-up`
-   **User Role**: New Guest / Prospect.
-   **Core Focus**: Educational walkthrough and configuration.

## 🔄 Technical Workflow
1.  **Identity Creation**: The user registers via `SignUpPage.jsx`. A JWT is issued and the user record is initialized.
2.  **Tier Selection**: During onboarding, users choose between Personal and Enterprise tracks.
3.  **Workspace Initialization**: If "Enterprise" is selected, a new record is created in the `workspaces` table, and the user is assigned the role of `business_admin`.
4.  **Guided Tour**: The `OnboardingPage.jsx` uses a multi-step form to:
    -   Define the primary industry.
    -   Connect a calendar (Google/Outlook) for booking links.
    -   Upload the user's *own* business card to test the extraction engine.
5.  **Activation**: Once finished, the user is redirected to the `ScanPage` to begin productive work.

## 🛠️ Key Components
-   **React Component**: `src/pages/OnboardingPage.jsx` - A stateful multi-step stepper component.
-   **Auth Utility**: `src/utils/auth.js` - Manages the session persistence during the account setup phase.
-   **Styling**: Uses an immersive "Glassmorphism" effect to create a premium first impression.

## 💡 Key Features
-   **Smart Profile Pre-fill**: If the user uploads their own card during onboarding, the AI extracts their details to populate their system profile automatically.
-   **Workspace Invite System**: Business admins can generate unique invite links for their team during this phase.

## 🔗 Dependencies
-   **Depends On**: `AuthModule`.
-   **Prerequisite For**: All Dashboard modules.
