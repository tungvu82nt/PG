import os
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse
import re

# Configuration
SOURCE_DUMP_DIR = r"d:\Tool\WEB\LOVABLE\Y1\Y3\source_code_dump"
REPORT_FILE = os.path.join(SOURCE_DUMP_DIR, "source_analysis_report.md")
INPUT_FILE = r"d:\Tool\WEB\LOVABLE\Y1\Y3\processed_data\aggregated_report.json"

os.makedirs(SOURCE_DUMP_DIR, exist_ok=True)

def sanitize_filename(url):
    parsed = urlparse(url)
    path = parsed.path
    if path == "/" or not path:
        return "index.html"
    
    # Get the basename
    basename = os.path.basename(path)
    if not basename:
        return "index.html"
    
    # Sanitize characters
    return re.sub(r'[<>:"/\\|?*]', '_', basename)

def fetch_url(url, output_path):
    print(f"Fetching: {url} -> {output_path}")
    try:
        # User-Agent to avoid being blocked
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            with open(output_path, 'wb') as f:
                f.write(content)
            return True, content
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return False, None

def analyze_content(content, filename):
    try:
        text_content = content.decode('utf-8', errors='ignore')
    except:
        return []

    findings = []
    
    # Keywords to search for
    patterns = {
        "API Endpoint": r'https?://api\.[\w\-\.]+',
        "Config Object": r'window\.[\w]+Config\s*=',
        "Tracking ID": r'(UA-\d+-\d+|GTM-[\w]+|FB_PIXEL_ID)',
        "Secret/Key": r'(api_key|secret|token)["\']?\s*[:=]\s*["\']?[\w\-]+',
        "Hidden Domain": r'https?://[\w\-\.]+(?<!pg88\.com)(?<!facebook\.com)(?<!google\.com)(?<!w3\.org)' # Simple exclude list
    }

    for label, pattern in patterns.items():
        matches = re.findall(pattern, text_content, re.IGNORECASE)
        if matches:
            unique_matches = list(set(matches))[:5] # Limit to 5
            findings.append(f"- **{label}**: {', '.join(unique_matches)}")
            
    return findings

def main():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Use a set to avoid duplicates
    urls_to_fetch = set()
    if 'details' in data:
        for item in data['details']:
            if item.get('url'):
                urls_to_fetch.add(item['url'])
    
    report_content = "# Báo Cáo Phân Tích Mã Nguồn\n\n"
    
    for url in urls_to_fetch:
        filename = sanitize_filename(url)
        # Prepend domain to filename to avoid collisions (e.g. 2 index.html)
        domain = urlparse(url).netloc
        full_filename = f"{domain}_{filename}"
        output_path = os.path.join(SOURCE_DUMP_DIR, full_filename)
        
        success, content = fetch_url(url, output_path)
        
        report_content += f"## URL: {url}\n"
        if success:
            report_content += f"- **Trạng thái:** Tải thành công\n"
            report_content += f"- **File lưu:** `{full_filename}`\n"
            
            findings = analyze_content(content, full_filename)
            if findings:
                report_content += "### Phát hiện quan trọng:\n"
                for find in findings:
                    report_content += f"{find}\n"
            else:
                report_content += "- Không tìm thấy keywords nhạy cảm (API, Keys) trong phân tích sơ bộ.\n"
        else:
            report_content += f"- **Trạng thái:** Tải thất bại\n"
        
        report_content += "\n---\n"

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"Analysis complete. Report saved to {REPORT_FILE}")

if __name__ == "__main__":
    main()
