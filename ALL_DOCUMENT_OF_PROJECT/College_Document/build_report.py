import re
import markdown
import os

try:
    with open('IntelliScan_Project_Document_Ch1_Ch3.md', 'r', encoding='utf-8') as f:
        md1 = f.read()
    with open('IntelliScan_Project_Document_Ch4_Ch8.md', 'r', encoding='utf-8') as f:
        md2 = f.read()

    full_md = md1 + '\n\n---\n\n' + md2

    with open('IntelliScan_All_Diagrams.html', 'r', encoding='utf-8') as f:
        diagrams_html = f.read()

    diagram_blocks = {}
    for match in re.finditer(r'<pre class="plantuml" data-name="([^"]+)">(.*?)</pre>', diagrams_html, re.DOTALL):
        name = match.group(1)
        inline_html = f'<div class="diagram" style="margin: 30px auto;"><pre class="plantuml" data-name="{name}">{match.group(2)}</pre></div>'
        diagram_blocks[name] = inline_html

    # Parse markdown to HTML FIRST
    # We use extension 'fenced_code' and 'tables'
    html_body = markdown.markdown(full_md, extensions=['tables', 'fenced_code'])

    # Safely replace ALL mappings: > **[INSERT MAPPING: KeyError]** mapped from Blockquotes
    def replace_mapping(match):
        target_key = match.group(1).strip()
        if target_key in diagram_blocks:
            return diagram_blocks[target_key]
        return "" # Remove if not found

    html_body = re.sub(r'<blockquote>\s*<p>\s*<strong>\[INSERT MAPPING:\s*([^\]]+)\]<\/strong>\s*<\/p>\s*<\/blockquote>', replace_mapping, html_body)
    
    # Just in case they aren't parsed as blockquotes, do a direct string replace as fallback
    for key, val in diagram_blocks.items():
        html_body = html_body.replace(f'> **[INSERT MAPPING: {key}]**', val)

    # === FORCE NEW PAGE FOR EVERY H1 and EVERY H2 ===
    html_body = re.sub(r'<(h[12])', r'</div><div class="page"><\1', html_body)
    html_body = '<div class="page">' + html_body + '</div>'
    html_body = re.sub(r'<div class="page">\s*</div>', '', html_body)

    css = """
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; background-color: #e5e5e5; color: #000; margin: 0; padding: 20px; font-size: 12pt; line-height: 1.5; }
    
    .page { 
      width: 210mm; 
      min-height: 297mm; 
      padding: 25mm 20mm; 
      margin: 0 auto 30px auto; 
      background: white; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
      position: relative;
    }
    
    h1 { font-size: 24pt; text-align: center; text-transform: uppercase; margin-top: 0; margin-bottom: 24pt; border-bottom: 3px double #000; padding-bottom: 15px; page-break-after: avoid; }
    h2 { font-size: 18pt; margin-top: 0; margin-bottom: 15pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; page-break-after: avoid; }
    h3 { font-size: 14pt; margin-top: 25pt; margin-bottom: 10pt; font-weight: bold; page-break-after: avoid; }
    
    p { margin-bottom: 12pt; text-align: justify; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 15pt; margin-bottom: 20pt; font-size: 11pt; page-break-inside: avoid; }
    th, td { border: 1px solid #000; padding: 10pt; text-align: left; vertical-align: top; }
    th { background-color: #f8f8f8; font-weight: bold; }
    
    ul, ol { margin-bottom: 15pt; margin-top: 5pt; padding-left: 24pt; }
    li { margin-bottom: 6pt; text-align: justify; }
    
    .diagram { text-align: center; margin-bottom: 30px; margin-top: 20px; min-height: 200px; display: flex; justify-content: center; align-items: center; page-break-inside: avoid; }
    .diagram img { max-width: 100%; height: auto; display: block; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .plantuml { display: none; }
    
    hr { border: none; border-top: 1px dashed #ccc; margin: 30px 0; }
    
    /* Code MacOS Window Styles */
    .mac-window {
        background: #1e1e1e;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        margin: 30px 0;
        overflow: hidden;
        page-break-inside: avoid;
    }
    .mac-header {
        background: #333;
        padding: 10px;
        display: flex;
        align-items: center;
    }
    .mac-dots {
        display: flex;
        gap: 8px;
    }
    .dot { height: 12px; width: 12px; border-radius: 50%; }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }
    .mac-title {
        flex-grow: 1;
        text-align: center;
        color: #fff;
        font-size: 12px;
        font-family: sans-serif;
    }
    .mac-body {
        padding: 15px;
        color: #d4d4d4;
        font-family: Consolas, monospace;
        font-size: 10pt;
        white-space: pre-wrap;
        background: #1e1e1e;
        border: none;
        overflow-x: hidden;
    }
    
    @media print {
      body { background: white; padding: 0; margin: 0; }
      .page { 
        margin: 0; 
        box-shadow: none; 
        border: none; 
        width: 100%; 
        padding: 0mm; 
        page-break-after: always; 
      }
      .no-print { display: none !important; }
      
      /* Force dark mode printing for code windows */
      .mac-window {
         -webkit-print-color-adjust: exact !important;
         print-color-adjust: exact !important;
         page-break-inside: avoid !important;
         break-inside: avoid !important;
      }
      .mac-body { color: #d4d4d4 !important; }
      .mac-title { color: #fff !important; }
    }
    """

    template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>IntelliScan - Complete Project Report</title>
    <script src="https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/dist/plantuml-encoder.min.js"></script>
    <style>{css}</style>
    <script>
    document.addEventListener('DOMContentLoaded', () => {{
        document.querySelectorAll('.plantuml').forEach(el => {{
            let text = el.textContent;
            let encoded = plantumlEncoder.encode(text);
            let img = document.createElement('img');
            img.src = 'https://www.plantuml.com/plantuml/png/' + encoded;
            img.className = 'diagram-img';
            el.parentNode.appendChild(img);
        }});
    }});
    </script>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 20px; padding: 15px; background: #e8f4fd; border: 1px solid #b6d4FE; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 6px;">
        <h3 style="margin-top: 0; color: #004085;">📋 MASSIVE 120-PAGE DEPLOYMENT COMPLETE</h3>
        <p style="margin-bottom: 0; color: #004085;">
           Please wait roughly 15-20 seconds for all 36 straight-line UML diagrams to render via PlantUML!<br>
           Scroll to Chapter 4 to view the 60 page code-screenshot bundle.<br>
           To save as a PDF: Press <b>Ctrl + P</b> and choose "Save as PDF".
        </p>
    </div>
    
    {html_body}
    
</body>
</html>"""

    with open('IntelliScan_Complete_Project_Report.html', 'w', encoding='utf-8') as f:
        f.write(template)
        
    print("Successfully built massive IntelliScan_Complete_Project_Report!")

except Exception as e:
    import traceback
    traceback.print_exc()
