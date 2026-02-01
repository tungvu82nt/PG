import requests
import json
import os

# Cookie string from user
COOKIE_STR = "_fbp=fb.1.1769530719962.194374598306584409;_gta_uni=823749984.227914248.094934686275;__vnp_guest_id=227914248;__cf_bm=Fl5hPfyx_22_OtXQPgMbJG_eNGqRTnvnWmlyoNBOu7Q-1769544991-1.0.1.1-aPTa5EU3NTKw084F7lJ7tUGSQhnegnnNsc7SOcWhVauPb9F1Mz9oykCf75I5eUYbE0_vccS0QNTmavFT7aOenutoigOI9k6Nv9zEofXHj6c;"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"

# Headers
HEADERS = {
    'User-Agent': USER_AGENT,
    'Cookie': COOKIE_STR,
    'Referer': 'https://www.pg88.com/',
    'Origin': 'https://www.pg88.com',
    'Content-Type': 'application/json'
}

# API Endpoints to test
ENDPOINTS = [
    {
        "url": "https://api.pg88.com/009vn-ecp/api/v1/member/info",
        "method": "GET",
        "desc": "Member Info (Check Auth)"
    },
    {
        "url": "https://api.pg88.com/009vn-ecp/api/v1/gamelobby/categories",
        "method": "GET",
        "desc": "Game Categories"
    },
    {
        "url": "https://api.pg88.com/009vn-ecp/api/v1/games/allGameList",
        "method": "GET",
        "params": {"limit": "20", "offset": "0", "platform": "2"},
        "desc": "All Game List (Auth check)"
    },
    {
        "url": "https://api.pg88.com/009vn-ecp/api/v1/gamelobby/hot_games",
        "method": "GET",
        "params": {"limit": "20", "platform": "2"},
        "desc": "Hot Games (Lobby)"
    }
]

def run_tests():
    print("Starting Authenticated API Probe...")
    print("-" * 50)
    
    results = {}
    
    for ep in ENDPOINTS:
        print(f"Testing: {ep['desc']} ({ep['url']})")
        try:
            if ep['method'] == 'GET':
                resp = requests.get(ep['url'], headers=HEADERS, params=ep.get('params'), timeout=10)
            else:
                resp = requests.post(ep['url'], headers=HEADERS, json=ep.get('data'), timeout=10)
                
            print(f"Status: {resp.status_code}")
            
            try:
                data = resp.json()
                results[ep['desc']] = data
                
                # Preview response
                preview = json.dumps(data, indent=2)[:500]
                print(f"Response Preview:\n{preview}\n")
                
                # Check specific fields
                if 'imagepath' in str(data):
                    print(">>> FOUND 'imagepath' in response!")
                if 'icon' in str(data):
                    print(">>> FOUND 'icon' in response!")
                    
            except:
                print(f"Response (Text): {resp.text[:200]}")
                
        except Exception as e:
            print(f"Error: {e}")
            
        print("-" * 50)
        
    # Save results
    with open('d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/auth_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("Results saved to _debug/auth_test_results.json")

if __name__ == "__main__":
    run_tests()
