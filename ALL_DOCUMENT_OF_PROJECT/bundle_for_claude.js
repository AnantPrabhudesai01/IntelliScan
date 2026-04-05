const fs = require('fs');
const path = require('path');

const projectRoot = 'd:\\Anant\\Project\\CardToExcel\\stitch (1)MoreSCreens';
const artifactPath = 'C:\\Users\\anant\\.gemini\\antigravity\\brain\\565c932f-5189-4c82-ae6f-cd942a174d6f\\IntelliScan_Comprehensive_Analysis.md';

const filesToInclude = [
  { name: 'Backend Entry (index.js)', path: 'intelliscan-server\\index.js' },
  { name: 'Server Package.json', path: 'intelliscan-server\\package.json' },
  { name: 'Frontend Routes (App.jsx)', path: 'intelliscan-app\\src\\App.jsx' },
  { name: 'Frontend SignIn Example', path: 'intelliscan-app\\src\\pages\\SignInPage.jsx' },
  { name: 'Frontend Workspace Issue', path: 'intelliscan-app\\src\\pages\\workspace\\SharedRolodexPage.jsx' },
  { name: 'Vite Config', path: 'intelliscan-app\\vite.config.js' },
  { name: 'Technical Addendum', path: 'intelliscan_stitch_technicaladdendum.md' }
];

let output = "Hello Claude! I am providing you with the complete architectural breakdown, gap analysis, and core source code files for the IntelliScan project. Please read through this entire document to understand the current state of the application.\n\n";

output += "====================================================\n";
output += "PART 1: PROJECT ARCHITECTURE, PIPELINES & GAP ANALYSIS\n";
output += "====================================================\n\n";

if (fs.existsSync(artifactPath)) {
  output += fs.readFileSync(artifactPath, 'utf8') + '\n\n';
}

output += "====================================================\n";
output += "PART 2: CORE SOURCE CODE REPOSITORIES\n";
output += "====================================================\n\n";

for (const file of filesToInclude) {
  const fullPath = path.join(projectRoot, file.path);
  if (fs.existsSync(fullPath)) {
    output += `### File: ${file.name} (${file.path})\n`;
    output += "```javascript\n";
    output += fs.readFileSync(fullPath, 'utf8');
    output += "\n```\n\n";
  }
}

const outputPath = path.join(projectRoot, 'IntelliScan_Context_For_Claude.txt');
fs.writeFileSync(outputPath, output);
console.log('Successfully bundled context for Claude to: ' + outputPath);
