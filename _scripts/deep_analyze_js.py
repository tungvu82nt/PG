import requests
import re

URLS = [
    "https://www.pg88.com/static/js/main.a71518d8.js",
    "https://www.pg88.com/static/js/d-Home.fcdd3fec.js"
]

def deep_analyze():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for url in URLS:
        print(f"\nAnalyzing {url}...")
        try:
            resp = requests.get(url, headers=headers)
            content = resp.text
            
            # 1. Find all API-like paths
            print("  --- Potential API Paths ---")
            apis = re.findall(r'["\']([^"\']*/api/[^"\']+)["\']', content)
            for api in sorted(list(set(apis))):
                print(f"  {api}")
                
            # 2. Find all strings that look like URL paths
            print("  --- Potential URL Paths ---")
            paths = re.findall(r'["\'](/[a-zA-Z0-9_/.-]{5,})["\']', content)
            for p in sorted(list(set(paths))):
                if not any(x in p for x in ['.svg', '.png', 'image/', 'static/', 'font']):
                    print(f"  {p}")

        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    deep_analyze()
