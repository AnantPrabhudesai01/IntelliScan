import fs from 'fs';
import path from 'path';

const stitchDir = path.resolve('../stitch');
const pagesDir = path.resolve('./src/pages/generated');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Ensure we don't recreate the Core Screens we already did by hand beautifully
const skipFolders = [
  'landing_page', 'sign_in', 'sign_up', 'forgot_password_recovery', 'onboarding_wizard', 'public_scanner_page',
  'user_scan_page', 'my_contacts', 'profile_security_settings',
  'workspace_dashboard', 'team_contacts', 'team_members', 'scanner_links_management', 'analytics_dashboard', 'organization_profile_billing_settings',
  'platform_overview_super_admin', 'engine_performance_super_admin'
];

const folders = fs.readdirSync(stitchDir).filter(f => fs.statSync(path.join(stitchDir, f)).isDirectory());

function toPascalCase(str) {
  return str.match(/[a-z0-9]+/gi)
    .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join('');
}

let routesConfig = [];

for (const folder of folders) {
  if (skipFolders.includes(folder)) continue; // Skip core screens

  const htmlPath = path.join(stitchDir, folder, 'code.html');
  if (!fs.existsSync(htmlPath)) continue;
  
  let html = fs.readFileSync(htmlPath, 'utf8');
  let content = '';
  
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    content = mainMatch[1];
  } else {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) content = bodyMatch[1];
  }
  
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/ig, '');
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/ig, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/ig, '');
  
  // FIX: Escape literal curly braces because JSX treats them as logic blocks!
  content = content.replace(/\{|\}/g, m => m === '{' ? '{"{"}' : '{"}"}');
  
  content = content.replace(/class=/g, 'className=');
  content = content.replace(/for=/g, 'htmlFor=');
  content = content.replace(/<!--[\s\S]*?-->/g, ''); 
  
  // Wipe styles (we use safe React {{}} which won't get caught by the escaping above)
  content = content.replace(/style="([^"]*)"/g, 'style={{}}');
  
  content = content.replace(/<input([^>]*?(?<!\/))>/g, '<input$1 />');
  content = content.replace(/<img([^>]*?(?<!\/))>/g, '<img$1 />');
  content = content.replace(/<br([^>]*?(?<!\/))>/g, '<br$1 />');
  content = content.replace(/<hr([^>]*?(?<!\/))>/g, '<hr$1 />');

  // SVG nuances
  content = content.replace(/stroke-width=/g, 'strokeWidth=');
  content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
  content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  content = content.replace(/fill-rule=/g, 'fillRule=');
  content = content.replace(/clip-rule=/g, 'clipRule=');
  content = content.replace(/stroke-opacity=/g, 'strokeOpacity=');
  content = content.replace(/stop-color=/g, 'stopColor=');
  content = content.replace(/stop-opacity=/g, 'stopOpacity=');
  content = content.replace(/font-variation-settings=/g, 'fontVariationSettings=');
  content = content.replace(/xmlns:xlink=/g, 'xmlnsXlink=');
  content = content.replace(/xml:space=/g, 'xmlSpace=');
  
  // Handle some rogue attributes
  content = content.replace(/tabindex=/g, 'tabIndex=');

  const componentName = 'Gen' + toPascalCase(folder);
  const routePath = folder.replace(/_/g, '-');
  
  const jsxCode = `import React from 'react';

export default function ${componentName}() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      ${content}
    </div>
  );
}`;

  fs.writeFileSync(path.join(pagesDir, `${componentName}.jsx`), jsxCode);
  
  routesConfig.push({
    name: componentName,
    path: routePath,
    folder: folder
  });
}

fs.writeFileSync(path.join(pagesDir, 'routes.json'), JSON.stringify(routesConfig, null, 2));
console.log(`Successfully mass-migrated ${routesConfig.length} screens into React Components with curly brace escaping!`);
