import requests
import time

TARGET_PATH = "AMEBA/Alliance_zhCN.png"
DOMAINS = [
    "https://img.ihudba.com",
    "https://www.pg88.com",
    "https://api.pg88.com",
    "https://static.pg88.com", # Guess
    "https://images.ihudba.com", # Guess
    "https://cdn.ihudba.com", # Guess
]

PREFIXES = [
    "",
    "/",
    "/img/",
    "/images/",
    "/static/",
    "/assets/",
    "/img/static/",
    "/img/009vn/",
    "/img/games/",
    "/img/static/games/",
    "/img/009vn/games/",
    "/img/static/icon/",
    "/img/009vn/icon/",
    "/img/static/icons/",
    "/img/009vn/icons/",
    "/img/static/desktop/",
    "/img/009vn/desktop/",
    "/img/static/mobile/",
    "/img/009vn/mobile/",
    "/games/",
    "/gamelobby/",
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.pg88.com/'
}

def fuzz_one_image():
    print(f"Fuzzing path: {TARGET_PATH}")
    
    for domain in DOMAINS:
        for prefix in PREFIXES:
            # Construct URL variants
            variants = []
            
            # Variant 1: Direct concatenation
            variants.append(f"{domain}{prefix}{TARGET_PATH}")
            
            # Variant 2: Lowercase path
            variants.append(f"{domain}{prefix}{TARGET_PATH.lower()}")
            
            # Variant 3: Replace / with _
            variants.append(f"{domain}{prefix}{TARGET_PATH.replace('/', '_')}")
            
            # Variant 4: Try without provider folder
            filename = TARGET_PATH.split('/')[-1]
            variants.append(f"{domain}{prefix}{filename}")
            
            for url in variants:
                # Cleanup double slashes
                url = url.replace("com//", "com/").replace("//", "/")
                url = url.replace("http:/", "http://").replace("https:/", "https://")
                
                try:
                    print(f"Testing: {url}")
                    resp = requests.head(url, headers=HEADERS, timeout=1)
                    if resp.status_code == 200:
                        print(f"\n[SUCCESS] Found valid URL: {url}")
                        return
                    elif resp.status_code != 404:
                        print(f"[Code {resp.status_code}] {url}")
                except:
                    pass
                
        print(f"Finished domain {domain}")

if __name__ == "__main__":
    fuzz_one_image()
