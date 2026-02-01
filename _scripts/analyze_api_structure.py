import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_RESPONSES_PATH = os.path.join(BASE_DIR, '_debug', 'captured_api_responses.json')

def analyze_api():
    if not os.path.exists(API_RESPONSES_PATH):
        print("File not found.")
        return

    with open(API_RESPONSES_PATH, 'r', encoding='utf-8') as f:
        responses = json.load(f)

    print(f"Loaded {len(responses)} API responses.")
    
    for i, entry in enumerate(responses):
        url = entry.get('url', '')
        print(f"\n--- Response {i+1}: {url} ---")
        
        body = entry.get('body')
        if not body:
            print("  (Empty Body)")
            continue
            
        if isinstance(body, dict):
            keys = list(body.keys())
            print(f"  Keys: {keys}")
            
            # Nếu có data dạng list, xem thử item đầu tiên
            if 'data' in body:
                data = body['data']
                if isinstance(data, list) and len(data) > 0:
                    print(f"  Data List Length: {len(data)}")
                    print(f"  First Item Keys: {list(data[0].keys()) if isinstance(data[0], dict) else type(data[0])}")
                    # In thử item đầu tiên để soi
                    print(f"  Sample Item: {json.dumps(data[0], ensure_ascii=False)[:200]}...")
                elif isinstance(data, dict):
                    print(f"  Data Dict Keys: {list(data.keys())}")
            
            # Nếu response là enabledGameProviders
            if 'enabledGameProviders' in url:
                if isinstance(body, list): # Có thể body là list luôn?
                     print(f"  List Length: {len(body)}")
                     if len(body) > 0:
                         print(f"  Sample: {json.dumps(body[0], ensure_ascii=False)[:200]}")
                elif 'data' in body:
                    # Đã in ở trên
                    pass

        elif isinstance(body, list):
            print(f"  Body is List with length: {len(body)}")
            if len(body) > 0:
                print(f"  Sample Item: {json.dumps(body[0], ensure_ascii=False)[:200]}...")

if __name__ == "__main__":
    analyze_api()
