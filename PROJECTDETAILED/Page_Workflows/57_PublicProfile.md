# 🌐 Public Profile & Digital Business Card

> **Page Route**: `/profile/:slug`  
> **Component**: `PublicProfile.jsx`  
> **Access Level**: Public (No authentication required)

---

## 📖 Overview
The Public Profile page is a shareable, public-facing digital business card. Each IntelliScan user gets a unique URL (`/profile/john-doe`) that displays their name, title, company, phone, email, website, and location. Visitors can save the contact directly to their phone via a **one-click vCard download** — turning every profile link into a passive lead-capture mechanism.

---

## 🛠️ Technical Workflow

### 1. Profile Resolution (`/api/public/profile/:slug`)
- **Unauthenticated GET**: Resolves the slug to a user profile containing name, title, company, phone, email, website, location, and avatar initials.
- **404 Handling**: Invalid or deleted profiles render a clean error state.

### 2. vCard Generation
- **Client-Side**: `handleDownloadVCard()` constructs a VCF 3.0 string from the profile data, creates a `Blob`, and triggers a browser download of `<slug>.vcf`.
- **Fields Mapped**: Full Name (`FN`), Organization (`ORG`), Title (`TITLE`), Phone (`TEL`), Email (`EMAIL`), Website (`URL`).

### 3. Visual Design
- **Gradient Header**: Indigo-to-purple gradient banner with centered avatar initials.
- **Contact Rows**: Phone, email, website, and location with icon-prefixed rows.
- **Branding**: "Powered by IntelliScan" footer.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `MyCardPage` | Source | Users configure their profile data in MyCard settings |
| `SettingsPage` | Config | Profile slug and visibility are managed here |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Passive Lead Capture** | Every profile view is a potential contact exchange |
| **vCard Download** | One-click save to phone contacts eliminates manual entry |
| **Professional Branding** | Clean, modern design enhances professional credibility |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT | Resolves the slug to a user profile record |
| `analytics_events` | INSERT | (Optional) Tracks profile view events for analytics |
