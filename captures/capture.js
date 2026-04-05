const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const routes = [
  { path: '/', name: 'landing_page' },
  { path: '/sign-in', name: 'sign_in' },
  { path: '/sign-up', name: 'sign_up' },
  { path: '/forgot-password', name: 'forgot_password' },
  { path: '/onboarding', name: 'onboarding' },
  { path: '/dashboard/scan', name: 'user_scan' },
  { path: '/dashboard/contacts', name: 'user_contacts' },
  { path: '/dashboard/settings', name: 'user_settings' },
  { path: '/workspace/dashboard', name: 'workspace_dashboard' },
  { path: '/workspace/contacts', name: 'workspace_contacts' },
  { path: '/workspace/members', name: 'workspace_members' },
  { path: '/workspace/scanner-links', name: 'workspace_scanner_links' },
  { path: '/workspace/analytics', name: 'workspace_analytics' },
  { path: '/workspace/billing', name: 'workspace_billing' },
  { path: '/admin/dashboard', name: 'super_admin_dashboard' },
  { path: '/admin/engine-performance', name: 'super_admin_performance' }
];

(async () => {
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
  if (!fs.existsSync('videos')) fs.mkdirSync('videos');

  const browser = await chromium.launch({ headless: true });

  for (const route of routes) {
    console.log(`Capturing: ${route.name}`);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: 'videos/', size: { width: 1440, height: 900 } }
    });

    const page = await context.newPage();
    
    // Setup auth
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1, name: 'Admin User', email: 'admin@company.com', role: 'super_admin'
      }));
    });

    // Navigate to actual route
    await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });
    
    // Wait for minimum 10 seconds to record the video
    await page.waitForTimeout(10000);

    // Take full page screenshot
    await page.screenshot({ path: `screenshots/${route.name}.png`, fullPage: true });

    // Close context to save video
    await context.close();

    // The video is saved with a random name, so we find and rename the newest .webm file
    const files = fs.readdirSync('videos/');
    const webmFiles = files.filter(f => f.endsWith('.webm')).map(f => ({
      name: f,
      time: fs.statSync(path.join('videos', f)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    if (webmFiles.length > 0) {
      const latestVideo = webmFiles[0].name;
      const newVideoPath = path.join('videos', `${route.name}.webm`);
      // If a previous video exists with this name, remove it
      if (fs.existsSync(newVideoPath)) fs.unlinkSync(newVideoPath);
      fs.renameSync(path.join('videos', latestVideo), newVideoPath);
    }
  }

  await browser.close();
  console.log('All screenshots and videos captured successfully.');
})();
