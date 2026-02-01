import requests

URL = "https://www.pg88.com/AMEBA/Alliance_zhCN.png"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

def check_content_type():
    print(f"Checking {URL}...")
    try:
        resp = requests.get(URL, headers=HEADERS, timeout=10, stream=True)
        print(f"Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('Content-Type')}")
        print(f"Content-Length: {resp.headers.get('Content-Length')}")
        
        content_preview = resp.raw.read(100)
        print(f"Content Preview: {content_preview}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_content_type()
