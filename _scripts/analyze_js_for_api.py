import json
import os
import requests
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_URLS_PATH = os.path.join(BASE_DIR, '_debug', 'js_urls.json')

def analyze_js():
    if not os.path.exists(JS_URLS_PATH):
        print("JS URLs file not found.")
        return

    with open(JS_URLS_PATH, 'r', encoding='utf-8') as f:
        urls = json.load(f)

    # Filter important files
    target_files = [u for u in urls if 'main' in u or 'Game' in u or 'Home' in u or 'vendor' in u]
    
    print(f"Analyzing {len(target_files)} key JS files...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    api_patterns = set()

    for url in target_files:
        print(f"Fetching {url}...")
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                content = resp.text
                
                # Regex to find API paths
                # Look for strings starting with /api/ or containing api/v1
                matches = re.findall(r'["\'](/api/[^"\']+)["\']', content)
                matches += re.findall(r'["\']([^"\']*api/v1/[^"\']+)["\']', content)
                
                for m in matches:
                    api_patterns.add(m)
                    
                # Look for image paths logic
                # matches_img = re.findall(r'["\']([^"\']*\.png|[^"\']*\.webp)["\']', content)
                # if matches_img:
                #     print(f"  Found {len(matches_img)} image references in {url.split('/')[-1]}")

            else:
                print(f"  Failed: {resp.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

    print("\n--- Discovered API Endpoints ---")
    sorted_apis = sorted(list(api_patterns))
    for api in sorted_apis:
        print(api)

    # Save findings
    with open(os.path.join(BASE_DIR, '_debug', 'discovered_apis.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted_apis, f, indent=2)

if __name__ == "__main__":
    analyze_js()
