# 📹 Meeting Presence Tools & Asset Generator

> **Page Route**: `/dashboard/presence`  
> **Component**: `MeetingToolsPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Meeting Presence Tools allow users to project a professional digital identity during virtual meetings (Zoom, Google Meet, Microsoft Teams). It generates custom-branded virtual backgrounds that embed the user's digital business card QR code, turning every video call into a lead generation opportunity.

---

## 🛠️ Technical Workflow

### 1. Asset Customization
- **Theme Selection**: Users choose from 4 core presets: Dark Modern, Glass Blur, Minimal White, and Cyber Neon.
- **Platform Optimization**: Adjusts the aspect ratio for Zoom/Meet (16:9) or Microsoft Teams.
- **Dynamic QR Embedding**: The `profileUrl` is fetched from the user's slug and converted into a live QR code via an external API (`api.qrserver.com`) for the preview.

### 2. Live Preview Engine
- **Layered Rendering**: Uses absolute positioning and CSS backdrops (blur, gradients) to simulate the final high-res output.
- **Real-time Updates**: React state `selectedBg` triggers immediate stylistic shifts across the preview container.

### 3. High-Res Export
- **Generation**: `handleDownload()` triggers a high-resolution export of the card container.
- **Optimization**: Advises users to disable "Mirror my video" in their meeting clients to ensure the QR code remains scannable for participants.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `PublicProfile` | Route | Provides the destination URL for the embedded QR code |
| `MyCardPage` | Logic | Shares design tokens (colors, logo) with the digital presence assets |
| `DashboardLayout` | Layout | Wraps the tool in the standard user navigational frame |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Passive Lead Gen** | Allows meeting participants to scan the user's background and save their contact details without interrupting the flow |
| **Brand Consistency** | Ensures every team member has a uniform, high-quality look during external client calls |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT | Read display name and job title for the background overlay |
| `user_preferences` | UPDATE | (Future) Saves the user's preferred background style |
