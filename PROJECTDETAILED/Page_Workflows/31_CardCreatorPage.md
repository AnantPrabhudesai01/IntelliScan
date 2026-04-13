# 🎨 AI Card Creator & Design Engine

> **Page Route**: `/dashboard/card-creator`  
> **Component**: `CardCreatorPage.jsx`  
> **Access Level**: All Authenticated Users

---

## 📖 Overview
The Card Creator is an AI-driven design studio where users can build both physical and digital business cards. Instead of manual layout tools, users describe their "vibe" or industry, and the Gemini AI engine generates a complete branding package, including color palettes, typography, and layout styles.

---

## 🛠️ Technical Workflow

### 1. AI Design Generation (`/api/cards/generate-design`)
- **Vibe Analysis**: The user's input (e.g., "Minimalist tech startup") is sent to the backend.
- **Gemini-Pro-Vision**: The AI returns a `designData` object containing `style`, `accentColor`, `fontClass`, and `designNotes`.
- **Constraint Handling**: If a user is on a free tier and requests a premium style (e.g., "Luxury"), the API returns a `requiresUpgrade` flag.

### 2. Live Rendering Engine
- **Presets**: The frontend maintains a `PRESETS` library (Minimal, Bold, Luxury, Tech, Glass, Neon).
- **Dynamic CSS**: Uses React state to apply real-time styles (gradients, blurs, and grid patterns) to the card preview.
- **Variant Testing**: Supports toggling between "Front," "Dark," and "Compact" views.

### 3. Asset Export & Persistence
- **PNG Export**: Uses the `html-to-image` library to capture the card's DOM and generate a high-quality 3x pixel-ratio PNG.
- **vCard Generation**: Compiles the user's data into a `.vcf` file for instant contact distribution.
- **Database Save**: `handleSave()` commits the final design to `POST /api/cards/save`.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `html-to-image` | Library | Performs the client-side snapshot of the card for PNG export |
| `MyCardPage` | Link | Designs saved here are used as the default for the user's public profile |
| `apiClient` | Utility | Handles the AI design generation and card storage |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Branding-as-a-Service** | Allows users without design skills to create high-end professional cards |
| **Physical/Digital Bridge** | Provides a scannable PNG that can be printed or used as a phone wallpaper |
| **vCard Automation** | Ensures the user's digital card is always up-to-date in other people's phones |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `user_cards` | INSERT/UPDATE | Stores the final card configuration and AI-generated design notes |
| `card_styles` | SELECT | Reads the available preset definitions for the style picker |
| `subscription_plans` | SELECT | Checks if the user has access to premium AI design generation |
