# 💳 Billing & Subscription Management

> **Page Route**: `/billing`  
> **Component**: `BillingPage.jsx`  
> **Access Level**: All Authenticated Users

---

## 📖 Overview
The Billing page is the commercial heart of IntelliScan. It manages the full subscription lifecycle: plan comparison, Razorpay-powered payment processing, quota monitoring, payment method vault, and invoice history with downloadable receipts. It directly integrates with India's Razorpay payment gateway for real transaction handling.

---

## 🛠️ Technical Workflow

### 1. Plan Comparison & Upgrade
- **Plans Fetched**: `GET /api/billing/plans` returns 3 tiers (Personal/Free, Pro, Enterprise) with features, pricing, and limits.
- **Upgrade Flow**: `handleUpgrade(plan)` creates a server-side order via `POST /api/billing/create-order`, then launches the Razorpay Checkout widget.
- **Payment Verification**: After Razorpay callback, `POST /api/billing/verify-payment` validates the `razorpay_signature` server-side using HMAC-SHA256. On success, the user's JWT is refreshed with the new tier.

### 2. Quota Monitoring
- **Usage Bar**: Fetches `GET /api/user/quota` to display `used / limit` scans with a dynamic progress bar.
- **Threshold Alerts**: Warns at 85% usage with a red warning message prompting upgrade.

### 3. Payment Method Vault
- **Add Method**: `POST /api/workspace/billing/payment-methods` stores masked card data (last 4 digits, expiry).
- **Primary Selection**: Toggle to set which card is charged on renewal.

### 4. Invoice History
- **Table View**: Lists all invoices with number, date, amount, status, and receipt download.
- **CSV Export**: `GET /api/workspace/billing/invoices/export` generates a full billing history CSV.
- **Receipt Download**: `GET /api/workspace/billing/invoices/:id/receipt` returns a text receipt file.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `RoleContext` | Context | Provides `refreshAuth()` to update the user's tier post-upgrade |
| `Razorpay SDK` | External | Dynamically loaded checkout widget for payment processing |
| `ScanPage` | Link | "Go Scan" button redirects users to use their quota |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Revenue Collection** | The sole monetization touchpoint for the SaaS product |
| **Tier Gating** | Determines which features are locked/unlocked across the entire platform |
| **Financial Audit** | Provides downloadable receipts for enterprise accounting |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `subscription_plans` | SELECT | Fetches available plan definitions |
| `users` | SELECT/UPDATE | Reads current tier; updates tier after successful payment |
| `invoices` | INSERT/SELECT | Creates invoice on upgrade; lists history |
| `payment_methods` | INSERT/SELECT | Stores and retrieves masked card data |
| `orders` | INSERT/UPDATE | Tracks Razorpay order creation and verification |
