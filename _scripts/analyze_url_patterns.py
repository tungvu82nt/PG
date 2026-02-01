import json
import os
from urllib.parse import urlparse

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_LIST_PATH = os.path.join(BASE_DIR, '_debug', 'full_game_list_real.json')
FOUND_IMAGES_PATH = os.path.join(BASE_DIR, '_debug', 'found_images.json')
API_RESPONSES_PATH = os.path.join(BASE_DIR, '_debug', 'captured_api_responses.json')

def load_json(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze():
    print("--- START ANALYSIS ---")
    
    # 1. Load Data
    games_data = load_json(GAME_LIST_PATH)
    games = []
    
    # Extract games list
    if isinstance(games_data, dict):
        if 'gameWithTags' in games_data and 'data' in games_data['gameWithTags']:
             games = games_data['gameWithTags']['data']
        elif 'data' in games_data:
             games = games_data['data']
    
    print(f"Loaded {len(games)} games.")

    # 2. Extract Image Paths from DB
    db_image_paths = set()
    found_urls_in_db = set()
    
    print("\nScanning ALL fields in game data for image-like strings...")
    
    for game in games:
        # Check specific field
        path = game.get('imagepath')
        if path and path.strip():
            db_image_paths.add(path.strip())
            
        # Scan all values
        for k, v in game.items():
            if isinstance(v, str):
                if any(ext in v.lower() for ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']) or 'http' in v:
                    found_urls_in_db.add(f"{k}: {v}")

    print(f"Unique 'imagepath' values: {len(db_image_paths)}")
    if db_image_paths:
        print(f"Sample paths: {list(db_image_paths)[:5]}")
        
    print(f"\nFound {len(found_urls_in_db)} potential image URLs in other fields:")
    for item in list(found_urls_in_db)[:20]:
        print(f"  {item}")

    print("--- END ANALYSIS ---")

if __name__ == "__main__":
    analyze()
