import requests
import json

BASE_URL = "https://api.009sfym.com/009vn-ecp/api/v1/gamelobby"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.pg88.com',
    'Referer': 'https://www.pg88.com/'
}

PROVIDERS = ["PG", "JILI", "CQ9", "FC"]

def probe_provider_endpoints():
    for p in PROVIDERS:
        paths = [
            f"/egame/{p}",
            f"/egames/{p}",
            f"/games/{p}",
            f"/provider/{p}",
            f"/categories/{p}",
            f"/hot_games/{p}"
        ]
        
        for path in paths:
            url = f"{BASE_URL}{path}"
            try:
                # Try with basic params
                params = {'lang': 'vi-VN', 'platform': 'PC'}
                resp = requests.get(url, headers=HEADERS, params=params, timeout=3)
                print(f"Checking {url} -> Status: {resp.status_code}")
                
                if resp.status_code == 200:
                    print(f"  [SUCCESS] Found endpoint: {url}")
                    print(f"  Keys: {list(resp.json().keys())}")
                    # Save example
                    with open(f"d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/api_provider_{p}.json", "w") as f:
                        json.dump(resp.json(), f)
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    probe_provider_endpoints()
