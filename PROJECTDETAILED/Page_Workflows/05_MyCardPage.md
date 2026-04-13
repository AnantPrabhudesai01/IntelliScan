# 📱 My Card Page (Digital Identity)

> **Route**: `/dashboard/my-card`  
> **Component**: `MyCardPage.jsx` (279 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
Forget paper cards—the My Card page lets you create a high-tech, **AI-designed digital business card**. You can choose your "Vibe" (Professional, Minimalist, Corporate), and the AI will generate a bio and headline that makes you look like a pro.

**Key features**:
- **AI Design Magic**: One click and Gemini creates a unique layout, color palette, and professional bio for you.
- **Live Preview**: See your digital card as you build it—it looks just like a sleek mobile profile.
- **Scan to Connect**: A personalized QR code that anyone can scan to instantly add your info to their phone.
- **Public Portal**: A unique link (e.g., `intelliscan.com/u/yourname`) to share your professional profile anywhere.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `cardData` | `object` | Stores the card's URL slug, views, saves, bio, and design JSON |
| `generating` | `boolean` | Loading state during AI design generation |
| `copied` | `boolean` | Success state after copying the card's URL |
| `me` | `object` | Current user's profile info (name, role, tier) from localStorage |

### Key Functions
1. **`fetchCard()`**: Loads the user's existing card configuration from `GET /api/my-card`.
2. **`handleAiDesign()`**: Sends user details to `POST /api/cards/generate-design` → Gemini returns AI-curated design tokens and bio.
3. **`handleSaveDesign()`**: Persists the `cardData` (including the design JSON) to `POST /api/cards/save`.
4. **`handleCopy()`**: Writes the public URL to the user's clipboard.
5. **QR Generation**: Uses `api.qrserver.com` to dynamically generate a QR code for the `cardUrl`.

### Lifecycle
```
Page Initialized
    → fetchCard() reads current user's card settings
    → UI displays the live preview with current design_json
User clicks "AI Design Magic"
    → handleAiDesign() → POST /api/cards/generate-design
    → Gemini returns: Primary/Secondary Colors, Layout Type, Bio, Headline
    → State 'cardData' updated → Preview re-renders instantly
User clicks "Save Identity"
    → POST /api/cards/save (with updated JSON)
    → Changes persisted to SQLite
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/my-card` | Retrieves the user's personal card configuration |
| `POST` | `/api/cards/generate-design` | AI engine generates design tokens (colors, layout) and bio |
| `POST` | `/api/cards/save` | Saves the updated card profile and design settings |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common dashboard container |
| `Lucide Icons` | Library | Iconography for QrCode, Wand2, Palette, etc. |
| `api.qrserver.com` | External API | Dynamic QR code image generation |
| `auth.js` | Utility | Handles user authentication tokens |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `PublicProfile` | Dynamically renders the card based on the `design_json` saved here |
| `ContactsPage` | Users can share their card from the contacts view |
| `AnalyticsPage` | Tracks global views and identity saves from the public portal |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `business_cards` | SELECT, INSERT, UPDATE | Stores the `design_json`, `bio`, `headline`, and `url_slug` |
| `users` | SELECT | Sources the user's name and role for initial card generation |
