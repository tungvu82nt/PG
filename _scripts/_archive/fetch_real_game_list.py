import requests
import json
import os

URL = "https://api.pg88.com/009vn-ecp/api/v1/games/allGameList"
PARAMS = {
    "limit": "10000",
    "offset": "0",
    "platform": "2",
    "sort": "ASC",
    "sortcolumn": "producttypeid"
}
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.pg88.com',
    'Referer': 'https://www.pg88.com/'
}

OUTPUT_FILE = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/full_game_list_real.json"

def fetch_games():
    print(f"Fetching {URL}...")
    try:
        resp = requests.get(URL, headers=HEADERS, params=PARAMS, timeout=10)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            with open(OUTPUT_FILE, "w", encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved to {OUTPUT_FILE}")
            
            # Analyze data for image paths
            if 'data' in data:
                games = data['data']
                print(f"Total games: {len(games)}")
                
                # Check sample for image fields
                if len(games) > 0:
                    print("Sample keys:", games[0].keys())
                    
                    # Look for non-empty image paths
                    has_img = [g for g in games if g.get('imagepath')]
                    print(f"Games with imagepath: {len(has_img)}")
                    if has_img:
                        print("Sample imagepath:", has_img[0]['imagepath'])
        else:
            print("Response:", resp.text[:500])
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_games()
