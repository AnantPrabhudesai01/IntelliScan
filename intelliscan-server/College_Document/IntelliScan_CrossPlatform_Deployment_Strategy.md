# 🚀 IntelliScan Cross-Platform Deployment Strategy: Android & Desktop

This document outlines the detailed technical path to transition the IntelliScan web platform (currently a React + Vite Single Page Application) into a native Android application and a standalone Desktop application (Windows, macOS, Linux).

---

## 📱 Android Deployment Strategy

The most efficient way to port an existing React + Vite application to Android without rewriting the UI is using **Capacitor** (by Ionic). Capacitor wraps your modern web app in a native WebView while providing JavaScript APIs to access native device features (like the camera and filesystem).

### 1. Why Capacitor over React Native?
- **Zero UI Rewrite**: You can reuse 100% of your current Tailwind CSS and React components.
- **Vite Integration**: Capacitor works flawlessly with the existing Vite build process.
- **Native SDKs**: It provides direct bridges to native Android APIs when HTML5 isn't powerful enough.

### 2. Implementation Steps

1. **Install Dependencies**:
   ```bash
   cd intelliscan-app
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init "IntelliScan" "com.intelliscan.app" --web-dir dist
   ```

3. **Add Android Platform**:
   ```bash
   npx cap add android
   ```

4. **Build and Sync**:
   Every time you update your React code, you will run:
   ```bash
   npm run build
   npx cap sync android
   ```

5. **Deploy Context**:
   Open Android Studio, build the APK/AAB, and deploy it to the Google Play Store or distribute internally via MDM.

### 3. Critical Native Plugins for IntelliScan
For the Android app to function effectively as a scanner platform, you must swap out specific web APIs for native plugins:
- **`@capacitor/camera`**: The native camera interface is significantly faster and supports better auto-focus and flash controls for document scanning than the browser's `getUserMedia` API.
- **`@capacitor/filesystem`**: Store business card images locally on the device if the user is scanning offline at a conference.
- **`@capacitor/network`**: Detect when the device regains internet connection to automatically sync queued offline scans to the backend.

---

## 💻 Desktop Deployment Strategy

To bring IntelliScan to the Desktop (Windows, macOS) for power users (Enterprise Admins, Pipeline Managers), we recommend **Tauri**. While Electron is popular, Tauri is significantly lighter, faster, and integrates perfectly with Vite.

### 1. Why Tauri over Electron?
- **Bundle Size**: Tauri apps are typically ~5MB, whereas Electron apps start at ~80MB.
- **Resource Usage**: Tauri uses the OS's native webview (WebView2 on Windows, WebKit on macOS), resulting in far less RAM consumption — critical for a platform running AI pipelines.
- **Security**: Hardened by default, built with Rust.

### 2. Implementation Steps

1. **Install Prerequisites**: 
   - Rust toolchain (cargo)
   - C++ Build Tools (Windows) or Xcode Command Line Tools (macOS)

2. **Initialize Tauri in your React App**:
   ```bash
   cd intelliscan-app
   npm install -D @tauri-apps/cli
   npx tauri init
   ```
   *During init, configure it to run `npm run dev` for development and point the web root to `../dist`.*

3. **Update `vite.config.js`**:
   Adjust configurations to prevent Vite from obscuring Rust errors and bind to the correct host.
   ```javascript
   export default defineConfig({
     clearScreen: false,
     server: { strictPort: true },
     // ... rest of config
   })
   ```

4. **Build the Desktop App**:
   ```bash
   npm run build
   npx tauri build
   ```
   This outputs a `.msi` (Windows), `.app`/`.dmg` (macOS), or `.deb` (Linux) installer package.

### 3. Desktop-Specific Features for IntelliScan
- **System Tray**: Allow users to run IntelliScan in the background to monitor webhook deliveries or AI sequences.
- **Global Keyboard Shortcuts**: E.g., `Ctrl+Shift+I` to instantly bring up the global search or quick-add contact window.
- **File System Access**: Drag-and-drop integration for Enterprise users to bulk import hundreds of business card images straight from a desktop folder into the app.

---

## 🌐 Unified Backend & Architecture Adjustments

Deploying to native platforms requires architectural shifts in how the frontend communicates with the Node.js/SQLite backend:

1. **Centralized Cloud Hosting**: 
   The backend (`intelliscan-server`) must be deployed to the cloud (e.g., AWS EC2, DigitalOcean, or Render). Localhost will no longer work for Android or Desktop clients installed remotely.

2. **CORS Policies**:
   Update `cors` in `server/index.js` to accept requests from native app origins:
   - Android Capacitor uses: `http://localhost` or `capacitor://localhost`
   - Tauri uses: `tauri://localhost`
   ```javascript
   app.use(cors({ origin: ['https://yourdomain.com', 'capacitor://localhost', 'tauri://localhost'] }));
   ```

3. **Authentication Token Storage**:
   Browsers handle Cookies cleanly, but native apps do not. You must ensure your session tokens (JWTs) are stored using **Capacitor Preferences** (Android) or **Tauri Secure Storage** (Desktop) rather than relying on HTTP-only cookies, passing the token explicitly via the `Authorization: Bearer <token>` header in all API requests.

4. **API Base URL Environment Variables**:
   Your React app must dynamically determine where the backend lives based on the build environment (`.env.production`, `.env.android`, `.env.desktop`).
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.intelliscan.app';
   ```
