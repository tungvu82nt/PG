import requests
import json
import os
import time

BASE_URL = "https://api.009sfym.com/009vn-ecp/api/v1"

# Endpoints that failed previously
ENDPOINTS = [
    "gamelobby/categories",
    "gamelobby/hot_games",
    "gamelobby/egame",
    "gamelobby/live",
    "floatingads",
    "announcements"
]

PARAMS_SETS = [
    {},
    {"lang": "vi-VN"},
    {"lang": "en-US"},
    {"platform": "PC", "lang": "vi-VN"},
    {"device": "d", "lang": "vi-VN"}, # d = desktop?
    {"device": "m", "lang": "vi-VN"}, # m = mobile?
    {"currency": "VND"},
    {"anntype": "1", "lang": "vi-VN"} # For announcements
]

def fuzz_params():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.pg88.com',
        'Referer': 'https://www.pg88.com/'
    }
    
    for ep in ENDPOINTS:
        url = f"{BASE_URL}/{ep}"
        print(f"\nFuzzing {url}...")
        
        for params in PARAMS_SETS:
            try:
                resp = requests.get(url, headers=headers, params=params, timeout=5)
                print(f"  Params: {params} -> Status: {resp.status_code}")
                
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                        keys = list(data.keys()) if isinstance(data, dict) else f"List[{len(data)}]"
                        print(f"    SUCCESS! Keys: {keys}")
                        
                        # Save successful response
                        safe_name = f"{ep.replace('/', '_')}_{list(params.values())[0] if params else 'none'}"
                        with open(f"_debug/api_fuzz_{safe_name}.json", "w", encoding="utf-8") as f:
                            json.dump(data, f, indent=2)
                        
                        break # Found working params for this endpoint, move to next
                    except:
                        pass
                elif resp.status_code == 498:
                     print(f"    Missing Field Error: {resp.text}")
            except Exception as e:
                print(f"    Error: {e}")
            
            time.sleep(0.5)

if __name__ == "__main__":
    fuzz_params()
