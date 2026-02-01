import json
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_LIST_PATH = os.path.join(BASE_DIR, '_debug', 'full_game_list_real.json')

TARGET_UUIDS = [
    "98e20603-39bd-49a8-88fd-f138f4190827", # Kho Báu Aztec
    "1a987bf2-47de-469f-ab31-dcaac1fde5cd", # Đường Mạt Chược 2
    "13fc3271-0abc-46c8-8acb-9c2bb4567880"  # Siêu Cấp Ace
]

def find_uuid():
    print(f"Loading {GAME_LIST_PATH}...")
    with open(GAME_LIST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    games = []
    if isinstance(data, dict):
        if 'gameWithTags' in data and 'data' in data['gameWithTags']:
             games = data['gameWithTags']['data']
        elif 'data' in data:
             games = data['data']
    
    print(f"Scanning {len(games)} games for target UUIDs...")
    
    found_count = 0
    for game in games:
        # Convert game object to string to search easily
        game_str = json.dumps(game)
        
        for uuid in TARGET_UUIDS:
            if uuid in game_str:
                print(f"\n[FOUND MATCH] UUID: {uuid}")
                print(f"Game Name: {game.get('gamename', {}).get('vi-VN', 'Unknown')}")
                print(f"Game ID: {game.get('gameid')}")
                print(f"Provider: {game.get('gameproviderid')}")
                
                # Find which key holds the UUID
                for k, v in game.items():
                    if str(v) == uuid:
                        print(f"  -> Found in key: '{k}'")
                    if isinstance(v, str) and uuid in v:
                        print(f"  -> Found in value of '{k}': {v}")
                found_count += 1

    if found_count == 0:
        print("\nNo UUIDs found in game list. The UUIDs might come from a different API (e.g. /hot_games or CMS API).")

if __name__ == "__main__":
    find_uuid()
