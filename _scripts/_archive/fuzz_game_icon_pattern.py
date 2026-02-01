import requests
import json
import os

GAME_LIST_PATH = "d:/Tool/WEB/LOVABLE/Y1/Y3/processed_data/game_list_full.json"

PATTERNS = [
    "/img/009vn/game/{gameid}.png",
    "/img/009vn/icon/{gameid}.png",
    "/img/static/game/{gameid}.png",
    "/img/static/icon/{gameid}.png",
    "/img/009vn/gamelobby/{gameid}.png",
    "/img/009vn/games/{gameid}.png",
    # Thử với provider ID
    "/img/009vn/{provider}/{gameid}.png",
    "/img/static/{provider}/{gameid}.png",
    "/img/static/gplogo/h-dark/{provider}.png" # Đã verify
]

BASE_URL = "https://img.ihudba.com"

def fuzz_icons():
    with open(GAME_LIST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    games = data.get('gameWithTags', {}).get('data', [])
    
    # Filter PG games
    pg_games = [g for g in games if g.get('gameproviderid') == 'PG'][:3]
    
    print(f"Testing with {len(pg_games)} PG games...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for game in pg_games:
        gid = game['gameid']
        pid = game['gameproviderid']
        print(f"\nGame: {gid} (Provider: {pid})")
        
        for p in PATTERNS:
            path = p.format(gameid=gid, provider=pid.lower())
            url = f"{BASE_URL}{path}"
            
            try:
                resp = requests.head(url, headers=headers, timeout=2)
                if resp.status_code == 200:
                    print(f"  [SUCCESS] Found: {url}")
                # else:
                #     print(f"  [404] {path}")
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    fuzz_icons()
