import re
import os
import zlib
import base64
import urllib.request

def encode_plantuml(text):
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    compressed_string = zlibbed_str[2:-4]
    
    encoded = base64.b64encode(compressed_string).decode('ascii')
    b64_dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    puml_dict = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    
    trans_map = str.maketrans(b64_dict, puml_dict)
    encoded = encoded.split('=')[0]
    return encoded.translate(trans_map)

print("Reading diagram definitions from IntelliScan_All_Diagrams.html...")
with open('IntelliScan_All_Diagrams.html', 'r', encoding='utf-8') as f:
    diagrams_html = f.read()

os.makedirs('PNG_Diagrams', exist_ok=True)

matches = list(re.finditer(r'<pre class="plantuml" data-name="([^"]+)">(.*?)</pre>', diagrams_html, re.DOTALL))
print(f"Discovered {len(matches)} diagrams to process.")
success_count = 0

for i, match in enumerate(matches, 1):
    name = match.group(1)
    code = match.group(2).strip()
    
    encoded_url = encode_plantuml(code)
    url = f"https://www.plantuml.com/plantuml/png/{encoded_url}"
    out_path = os.path.join('PNG_Diagrams', f'{name}.png')
    
    try:
        # Added Mozilla User-Agent to prevent 403 Forbidden
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            
        print(f"[{i}/{len(matches)}] Saved: {name}.png")
        success_count += 1
    except Exception as e:
        print(f"[{i}/{len(matches)}] FAILED to generate {name}.png: {e}")

print("--------------------------------------------------")
print(f"Successfully exported {success_count} PNG diagrams ready for Word insertion.")
