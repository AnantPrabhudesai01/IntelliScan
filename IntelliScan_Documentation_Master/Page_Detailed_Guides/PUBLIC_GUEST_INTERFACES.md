# Deep Dive: Public Guest Interfaces

These interfaces are the "front door" of the platform, enabling lead generation without requiring a login for the prospect.

---

## 📄 Overview
-   **Page Path**: `/` (Landing), `/u/:slug` (Profile), `/book/:slug` (Booking).
-   **User Role**: Public Guest / Lead.
-   **Core Focus**: Conversion and Appointment Scheduling.

## 🔄 Technical Workflow
1.  **Digital Business Card**: A user shares their public URL (e.g., `intelliscan.io/u/anant`). The system fetches the user's data from the `users` table via the `slug`.
2.  **Public Profile**: The `PublicProfile.jsx` renders a high-fidelity digital card with links to social media and a "Book a Meeting" button.
3.  **Booking Logic**: Clicking "Book" takes the guest to `BookingPage.jsx`. The system queries the host's `availability` table (synchronized with an external calendar).
4.  **Meeting Confirmation**: Once a slot is picked, a record is created in `calendar_bookings`. The host and guest both receive automated confirmation emails via NodeMailer.

## 🛠️ Key Components
-   **React Component**: `src/pages/generated/PublicProfile.jsx` - Renders the personal branding for each sales rep.
-   **Booking Widget**: `src/pages/calendar/BookingPage.jsx` - A specialized widget that handles timezone conversions and slot validation.
-   **Metadata**: Generates OpenGraph tags so that when the link is shared on LinkedIn, it looks professional.

## 💡 Key Features
-   **vCard Download**: Prospects can download a `.vcf` file directly from the public profile to their phone contacts.
-   **Zero-Sign-In Booking**: Prospects don't need an IntelliScan account to book a meeting; they only need to provide their name and email.

## 🔗 Dependencies
-   **Depends On**: `MyCardPage` (for setup) and `AvailabilityPage` (for slot management).
-   **Prerequisite For**: `SignalsPage` (as every visit/booking is tracked as an engagement signal).
