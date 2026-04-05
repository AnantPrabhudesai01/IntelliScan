const fs = require('fs');
const content = fs.readFileSync('lint_results.json', 'utf8');
let out = '';
try {
  const data = JSON.parse(content);
  data.filter(f => f.errorCount > 0 || f.warningCount > 0).forEach(f => {
    out += 'File: ' + f.filePath + '\n';
    f.messages.forEach(m => out += `  Line ${m.line}: ${m.message} (${m.ruleId})\n`);
  });
  fs.writeFileSync('lint_errors.txt', out, 'utf8');
} catch(e) {
  console.error("Parse error:", e);
}
