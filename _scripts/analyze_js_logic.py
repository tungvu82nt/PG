import re
import os

# Configuration
SOURCE_FILE = r"d:\Tool\WEB\LOVABLE\Y1\Y3\source_code_dump\www.pg88.com_main.a71518d8.js"
OUTPUT_FILE = r"d:\Tool\WEB\LOVABLE\Y1\Y3\source_code_dump\js_logic_analysis.txt"

def analyze_js():
    try:
        with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    report = "=== ANALYSIS OF MAIN.JS ===\n\n"

    # 1. Search for API Base URL usage
    # We know the domain is api.009sfym.com, let's see how it's used
    api_domain_regex = r'["\']https://api\.009sfym\.com["\']'
    report += "--- API DOMAIN USAGE ---\n"
    matches = list(re.finditer(api_domain_regex, content))
    for m in matches:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 100)
        context = content[start:end]
        report += f"Context: ...{context}...\n\n"

    # 2. Search for Login/Auth Endpoints
    # Look for common auth patterns like "/login", "POST", "signin"
    report += "--- AUTHENTICATION LOGIC ---\n"
    auth_patterns = [
        r'["\']/?api/user/login["\']',
        r'["\']/?v\d+/user/login["\']',
        r'["\']/login["\']',
        r'["\']POST["\'].{1,50}login',
        r'authenticate',
        r'Authorization',
        r'Bearer\s'
    ]
    
    for pattern in auth_patterns:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        if matches:
            report += f"Pattern '{pattern}': found {len(matches)} matches.\n"
            for m in matches[:3]: # Show first 3 matches
                start = max(0, m.start() - 150)
                end = min(len(content), m.end() + 150)
                context = content[start:end]
                report += f"Match: ...{context}...\n"
            report += "\n"

    # 3. Search for Request Interceptors (axios/fetch)
    # Often found near "interceptors.request.use" or headers configuration
    report += "--- REQUEST HEADERS / INTERCEPTORS ---\n"
    header_patterns = [
        r'headers\s*:\s*\{',
        r'["\']Content-Type["\']',
        r'interceptors\.request',
        r'Authorization\s*='
    ]
    
    for pattern in header_patterns:
        matches = list(re.finditer(pattern, content))
        if matches:
            report += f"Pattern '{pattern}': found {len(matches)} matches.\n"
            for m in matches[:3]:
                start = max(0, m.start() - 100)
                end = min(len(content), m.end() + 200)
                context = content[start:end]
                report += f"Context: ...{context}...\n"
            report += "\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"Analysis saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    analyze_js()
