# 📸 Scan Page (Intelligent Capture)

> **Route**: `/dashboard/scan`  
> **Component**: `ScanPage.jsx` (782 lines)  
> **Access**: All authenticated users (user, business_admin, super_admin)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Scan Page is the **heart of IntelliScan**. It's where the magic happens—you upload a photo of a business card, and the AI instantly reads it and extracts all the contact information (name, email, phone, company, job title) automatically. Think of it as a "Super-powered camera" for business cards.

You have **three modes**:
1. **Single Card**: Upload one card, get one contact.
2. **Group Photo**: Lay 5-25 cards flat on a table, take one photo, and the AI finds ALL of them.
3. **Batch Upload**: Select up to 20 individual card images and process them all in parallel.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `scanMode` | `'single' \| 'multi' \| 'batch'` | Controls which scanning pipeline is active |
| `selectedImage` | `string (base64)` | The raw image data uploaded by the user |
| `scannedData` | `object` | The AI-extracted contact fields (single mode) |
| `multiResults` | `object` | Array of extracted cards (group photo mode) |
| `batchResults` | `array` | Results from parallel batch processing |
| `quotaData` | `object` | User's remaining scan credits |
| `isDuplicate` | `boolean` | Whether the scanned contact already exists |
| `mutualInfo` | `object` | Workspace intelligence—teammates at same company |

### Key Functions
1. **`processSingleImage(base64, mimeType)`**: Sends the image to `POST /api/scan`. Receives structured JSON with extracted fields.
2. **`processMultiImage(base64, mimeType)`**: Sends the image to `POST /api/scan-multi`. Gemini detects and separates multiple cards from one photo.
3. **`processBatchImages(files)`**: Iterates through up to 20 files, sending each to `POST /api/scan` in parallel using `Promise.all`.
4. **`handleSave()`**: Persists the extracted contact to the database via `ContactContext.addContact()`.

### Lifecycle
```
User uploads image
    → FileReader converts to base64
    → POST /api/scan (with JWT auth header)
    → Gemini Vision AI extracts fields
    → Response displayed in editable preview
    → User clicks "Save Contact & Deduct Credit"
    → Contact persisted to SQLite
    → Quota decremented via window event
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/scan` | Single card AI extraction via Gemini |
| `POST` | `/api/scan-multi` | Group photo multi-card extraction |
| `GET` | `/api/user/quota` | Fetch remaining scan credits |
| `GET` | `/api/events` | List events for tagging scans |
| `GET` | `/api/contacts` | Duplicate detection check |
| `GET` | `/api/contacts/mutual?company=X` | Workspace intelligence lookup |
| `POST` | `/api/contacts` | Save extracted contact (via ContactContext) |

### Backend Processing Flow (Single Scan)
1. Server receives base64 image + mimeType.
2. Image is sent to **Google Gemini 1.5 Flash/Pro** with a structured prompt.
3. Gemini returns a JSON object with fields: `name`, `company`, `title`, `email`, `phone`, `website`, `address`, `confidence`, `inferred_industry`, `inferred_seniority`.
4. Server normalizes the response using `normalizeExtractedCard()`.
5. Server checks for multi-card detection (returns HTTP 422 if multiple cards found in single mode).
6. Response sent back to frontend.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides sidebar navigation and dark mode shell |
| `ContactContext` | Context | Provides `addContact()` for saving to database |
| `RoleContext` | Context | User authentication and tier checking |
| `auth.js` | Utility | `getStoredToken()` for JWT bearer headers |
| `EventsPage` | Data | Fetches events list to tag scans to specific events |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ContactsPage` | All contacts displayed there originate from scans done here |
| `Leaderboard` | Scan counts feed the gamification leaderboard |
| `AnalyticsPage` | Scan volume metrics are tracked from this page's activity |
| `CoachPage` | AI Coach analyzes scan patterns and freshness |
| `EmailSequencesPage` | Contacts created here can be enrolled in sequences |
| `DraftsPage` | AI drafts are generated for contacts created here |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `contacts` | INSERT | New contact record with all extracted fields |
| `user_quotas` | UPDATE | Decrement `used_count` after successful save |
| `scan_history` | INSERT | Audit log of scan operations |
