# 🏠 Landing Page (Public Marketing)

> **Route**: `/` (root)  
> **Component**: `LandingPage.jsx` (20,927 bytes)  
> **Access**: Public (unauthenticated)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Landing Page is the **public face of IntelliScan** — the first thing anyone sees. It showcases the product's features, highlights its AI capabilities, and drives visitors to sign up. Think of it as the sales brochure and front door combined.

**Key sections**: Hero banner, Feature highlights, Social proof, Pricing tiers, Call-to-action buttons for Sign Up / Sign In.

---

## ⚙️ Technical Frontend Workflow

### Architecture
- Fully static marketing page — **no API calls or backend dependencies**.
- Uses `react-router-dom`'s `Link` for navigation to `/signin` and `/signup`.
- Wrapped in `PublicLayout` (no sidebar, no auth required).
- Heavy use of CSS animations, gradients, and glassmorphism effects.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `PublicLayout` | Layout | Minimal public navigation shell |
| `react-router-dom` | Library | Links to `/signin` and `/signup` |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `SignInPage` | "Sign In" CTA navigates there |
| `SignUpPage` | "Get Started" CTA navigates there |

---

## 📊 Database Tables Affected
None — this is a purely static marketing page.
