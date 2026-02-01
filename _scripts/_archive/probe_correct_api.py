import requests
import json
import os

BASE_URL = "https://api.pg88.com/009vn-ecp/api/v1"
ENDPOINTS = [
    "games/floating",
    "gamelobby/hot_games",
    "gamelobby/egame",
    "games/popular",
    "games/recommend",
    "cms/games"
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.pg88.com',
    'Referer': 'https://www.pg88.com/'
}

def probe_apis():
    for ep in ENDPOINTS:
        url = f"{BASE_URL}/{ep}"
        print(f"Testing {url}...")
        try:
            resp = requests.get(url, headers=HEADERS, params={'lang': 'vi-VN', 'platform': '2'}, timeout=5)
            print(f"  Status: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                filename = f"d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/api_probe_{ep.replace('/', '_')}.json"
                with open(filename, "w", encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"  Saved to {filename}")
                
                # Check for UUIDs
                content = json.dumps(data)
                if "98e20603" in content:
                    print("  [BINGO] Found Kho Bau Aztec UUID in this API!")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    probe_apis()
