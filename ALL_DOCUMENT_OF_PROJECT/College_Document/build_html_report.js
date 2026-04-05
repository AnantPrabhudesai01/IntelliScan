const fs = require('fs');
const { marked } = require('marked');

try {
  const md1 = fs.readFileSync('IntelliScan_Project_Document_Ch1_Ch3.md', 'utf8');
  const md2 = fs.readFileSync('IntelliScan_Project_Document_Ch4_Ch8.md', 'utf8');
  const fullMd = md1 + '\n\n---\n\n' + md2;

  // Set marked options for standard table rendering
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  // Parse to HTML
  let htmlBody = marked.parse(fullMd);

  // We want to force a page break for every top-level Chapter/Heading (h1)
  htmlBody = htmlBody.replace(/<h1/g, '</div><div class="page"><h1');

  // Fix the missing first div start
  htmlBody = '<div class="page">' + htmlBody + '</div>';
  
  // Clean up any empty pages created by the split
  htmlBody = htmlBody.replace(/<div class="page">\s*<\/div>/g, '');

  // Custom regex to replace the image placeholders from markdown into actual <img> tags
  htmlBody = htmlBody.replace(/<blockquote>\s*<p>\s*<strong>\[INSERT IMAGE:\s*([^\]]+)\]<\/strong>\s*<\/p>\s*<\/blockquote>/g, 
    '<div class="diagram-placeholder" style="text-align: center; margin: 30px 0; page-break-inside: avoid;"><img src="$1" style="max-width: 100%; height: auto; border: 1px solid #ccc; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="$1"><p style="font-size: 12px; color: #555; margin-top: 8px;"><strong>Figure:</strong> $1</p></div>');

  const css = \`
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; background-color: #e5e5e5; color: #000; margin: 0; padding: 20px; font-size: 12pt; line-height: 1.5; }
    
    /* A4 Paper standard sizing */
    .page { 
      width: 210mm; 
      min-height: 297mm; 
      padding: 25mm 20mm; /* standard margins */
      margin: 0 auto 30px auto; 
      background: white; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
      position: relative;
    }
    
    h1 { font-size: 22pt; text-align: center; text-transform: uppercase; margin-top: 0; margin-bottom: 24pt; border-bottom: 2px solid #000; padding-bottom: 15px; page-break-after: avoid; }
    h2 { font-size: 16pt; margin-top: 30pt; margin-bottom: 12pt; font-weight: bold; page-break-after: avoid; }
    h3 { font-size: 14pt; margin-top: 20pt; margin-bottom: 10pt; font-weight: bold; page-break-after: avoid; }
    
    p { margin-bottom: 12pt; text-align: justify; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 15pt; margin-bottom: 20pt; font-size: 11pt; page-break-inside: avoid; }
    th, td { border: 1px solid #000; padding: 8pt; text-align: left; vertical-align: top; }
    th { background-color: #f2f2f2; font-weight: bold; }
    
    ul, ol { margin-bottom: 15pt; margin-top: 5pt; padding-left: 24pt; }
    li { margin-bottom: 6pt; text-align: justify; }
    
    code { font-family: Consolas, monospace; font-size: 10pt; background: #f4f4f4; padding: 2px 5px; border: 1px solid #ddd; border-radius: 3px; }
    pre { background: #f9f9f9; border: 1px solid #ccc; padding: 12pt; overflow-x: auto; font-family: Consolas, monospace; font-size: 10pt; page-break-inside: avoid; border-radius: 4px; }
    pre code { background: none; border: none; padding: 0; }
    
    hr { border: none; border-top: 1px dashed #ccc; margin: 30px 0; }
    
    @media print {
      body { background: white; padding: 0; margin: 0; }
      .page { 
        margin: 0; 
        box-shadow: none; 
        border: none; 
        width: 210mm; 
        height: 297mm;
        padding: 20mm; 
        page-break-after: always; /* Ensure strict printing layout */
      }
      .no-print { display: none !important; }
    }
  \`;

  const template = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>IntelliScan - Complete Project Report</title>
    <style>\${css}</style>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 20px; padding: 15px; background: #e8f4fd; border: 1px solid #b6d4FE; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 6px;">
        <h3 style="margin-top: 0; color: #004085;">📋 Ready for Submission</h3>
        <p style="margin-bottom: 0; color: #004085;">
           This document is formatted for A4 Paper standard. To save as a PDF: press <b>Ctrl + P</b> (or Cmd + P) and choose "Save as PDF".<br>
           To edit in Word: Press <b>Ctrl + A</b> (Select All), <b>Ctrl + C</b> (Copy), and then Paste into a blank Microsoft Word document.
        </p>
    </div>
    
    <!-- We skip inserting the first extra empty div, doing it cleanly -->
    \${htmlBody}
    
</body>
</html>\`;

  fs.writeFileSync('IntelliScan_Complete_Project_Report.html', template);
  console.log('Successfully built IntelliScan_Complete_Project_Report.html!');
} catch (e) {
  console.error("Failed to build HTML report:", e);
}
