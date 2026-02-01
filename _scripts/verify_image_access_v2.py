import requests

URL_PATH = "/img/009vn/floatingads/1ab2ba80-5eba-4959-8da9-88b5e3e399e5.gif"

DOMAINS = [
    "https://img.ihudba.com",
    "https://www.pg88.com",
    "https://api.009sfym.com/009vn-ecp",
    "https://static.pg88.com",
    "https://img.009sfym.com"
]

def verify_access():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for domain in DOMAINS:
        url = f"{domain}{URL_PATH}"
        print(f"Checking {url}...")
        try:
            resp = requests.head(url, headers=headers, timeout=5)
            print(f"  Status: {resp.status_code}")
            if resp.status_code == 200:
                print("  --> SUCCESS!")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    verify_access()
