import requests
import json
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_LIST_PATH = os.path.join(BASE_DIR, '_debug', 'full_game_list_real.json')

BASE_DOMAIN = "https://img.ihudba.com"
PREFIXES = [
    "/img/static/",
    "/img/static/games/",
    "/img/static/egames/",
    "/img/static/icon/",
    "/img/static/icons/",
    "/img/009vn/",
    "/img/009vn/games/",
    "/img/009vn/egames/",
    "/img/009vn/icon/",
    "/img/009vn/icons/",
    "/images/",
    "/static/images/",
    "/img/static/desktop/sub-menu/", # Just in case
]

def verify_paths():
    # Load game list
    with open(GAME_LIST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    games = []
    if isinstance(data, dict) and 'gameWithTags' in data:
        games = data['gameWithTags']['data']
    elif isinstance(data, list):
        games = data
        
    # Extract games with imagepath
    games_with_path = [g for g in games if g.get('imagepath') and g.get('imagepath').strip()]
    print(f"Found {len(games_with_path)} games with imagepath.")
    
    # Test a few samples from different providers
    samples = games_with_path[:10]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    success_count = 0
    
    for game in samples:
        rel_path = game['imagepath'].strip()
        print(f"\nTesting Game: {game.get('gameid')} - Path: {rel_path}")
        
        for prefix in PREFIXES:
            # Construct full URL
            # Handle slashes carefully
            clean_prefix = prefix.rstrip('/')
            clean_rel = rel_path.lstrip('/')
            url = f"{BASE_DOMAIN}{clean_prefix}/{clean_rel}"
            
            try:
                resp = requests.head(url, headers=headers, timeout=2)
                if resp.status_code == 200:
                    print(f"  [SUCCESS] Found: {url}")
                    success_count += 1
                    # Break prefix loop if found
                    # break 
                # else:
                #     print(f"  [404] {url}")
            except Exception as e:
                pass
                
    if success_count == 0:
        print("\nNo working URLs found with tested prefixes.")
    else:
        print(f"\nTotal successes: {success_count}")

if __name__ == "__main__":
    verify_paths()
