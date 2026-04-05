const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src/pages/generated');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  let modifiedCount = 0;

  files.forEach((file) => {
    if (file.endsWith('.jsx')) {
      const filePath = path.join(directoryPath, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Add a generic preventDefault to all <a> tags that don't already have an onClick
      // This stops the React app from reloading when a user clicks a dead link in the prototype
      const regex = /<a(\s+[^>]*?)href=(['"])(.*?)\2([^>]*?)>/g;
      
      const newContent = content.replace(regex, (match, beforeHref, quote, hrefVal, afterHref) => {
        // If it already has an onClick, don't touch it
        if (beforeHref.includes('onClick=') || afterHref.includes('onClick=')) {
          return match;
        }
        
        // If href is empty or # or / 
        if (hrefVal === '#' || hrefVal === '' || hrefVal === '/' || hrefVal.endsWith('.html')) {
          return `<a${beforeHref}href=${quote}#${quote} onClick={(e) => e.preventDefault()}${afterHref}>`;
        }
        return match;
      });

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedCount++;
      }
    }
  });

  console.log(`Successfully patched ${modifiedCount} files to prevent SPA reload breaking.`);
});
