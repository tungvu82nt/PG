import requests
import json
import os

# Load token
with open(r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_token.json', 'r') as f:
    auth_data = json.load(f)

token = auth_data['token'].replace('"', '') # Remove extra quotes if present
guest_id = auth_data['__vnp_guest_id']

HEADERS = {
    'Authorization': f'Bearer {token}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.pg88.com/',
    'Origin': 'https://www.pg88.com',
    'x-platform-id': '2',
    'x-domain-name': 'www.pg88.com'
}

BASE_URL = "https://api.pg88.com/009vn-ecp/api/v1"

ENDPOINTS = [
    "/member/info",
    "/games/myFavorite?sort=ASC&sortcolumn=gamename&sortlang=en-US",
    "/games/recent",
    "/games/allGameList?limit=100&offset=0&platform=2&sort=ASC&sortcolumn=producttypeid",
    "/gamelobby/categories"
]

results = {}

for endpoint in ENDPOINTS:
    url = BASE_URL + endpoint
    print(f"Checking {url}...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            try:
                data = resp.json()
                results[endpoint] = data
                # Check for image paths in data
                str_data = json.dumps(data)
                if "imagepath" in str_data or "img" in str_data:
                    print(f"  -> Found 'imagepath' or 'img' in response!")
            except:
                print("  -> Not JSON")
        else:
            print(f"  -> Error: {resp.text[:100]}")
    except Exception as e:
        print(f"  -> Exception: {e}")

# Save results
output_path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\authenticated_scan_results.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nSaved results to {output_path}")
