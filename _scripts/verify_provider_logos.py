import json
import os
import asyncio
from typing import Dict, List, Optional, Tuple
from playwright.async_api import async_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_LIST_PATH = os.path.join(BASE_DIR, 'processed_data', 'game_list_full.json')
PROVIDER_MAPPING_PATH = os.path.join(BASE_DIR, '_debug', 'provider_logos', '_mapping.txt')


def _load_mapping_txt(path: str) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    if not os.path.exists(path):
        return mapping

    with open(path, 'r', encoding='utf-8') as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            if key and value:
                mapping[key] = value
    return mapping


async def _check_image_url(context, url: str) -> Tuple[Optional[int], str]:
    try:
        resp = await context.request.get(url, timeout=15000)
        content_type = (resp.headers or {}).get('content-type', '')
        return resp.status, content_type
    except Exception as e:
        return None, str(e)


async def verify_mapping_file():
    mapping = _load_mapping_txt(PROVIDER_MAPPING_PATH)
    if not mapping:
        print(f"Provider mapping not found or empty: {PROVIDER_MAPPING_PATH}")
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            extra_http_headers={"Accept": "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.5"},
        )

        ok: List[str] = []
        bad: List[Tuple[str, str, Optional[int], str]] = []

        for pid, url in sorted(mapping.items()):
            status, info = await _check_image_url(context, url)
            if status == 200 and 'image' in info:
                ok.append(pid)
            else:
                bad.append((pid, url, status, info))

        await browser.close()

    print(f"Verified mapping entries: {len(mapping)}")
    print(f"OK: {len(ok)} | FAIL: {len(bad)}")
    if bad:
        print("Failures:")
        for pid, url, status, info in bad:
            print(f"- {pid} => {url} | status={status} | info={info}")

async def verify_logos():
    # 1. Load Providers
    if not os.path.exists(GAME_LIST_PATH):
        print("Game list not found")
        return

    with open(GAME_LIST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    providers = set()
    if isinstance(data, dict) and 'gameWithTags' in data:
        for game in data['gameWithTags']['data']:
            pid = game.get('gameproviderid')
            if pid:
                providers.add(pid)
    
    print(f"Found {len(providers)} unique providers.")
    sorted_providers = sorted(list(providers))
    
    # 2. Test URLs
    base_url = "https://img.ihudba.com/img/static/gplogo/h-dark/"
    extensions = [".png", ".svg", ".webp", "_h_dark.png", "_h_light.png"]
    
    # Test a subset first
    test_providers = sorted_providers[:5] + ['PG', 'JILI', 'CQ9'] 
    test_providers = list(set(test_providers)) # unique

    print(f"Testing {len(test_providers)} providers: {test_providers}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        success_count = 0
        
        for pid in test_providers:
            for ext in extensions:
                url = f"{base_url}{pid}{ext}"
                try:
                    resp = await page.request.get(url)
                    content_type = (resp.headers or {}).get('content-type', '')
                    if resp.status == 200 and 'image' in content_type:
                        print(f"[SUCCESS] Found: {url}")
                        success_count += 1
                        break # Found one valid format for this provider
                    else:
                        pass # print(f"[FAIL] {url} - {resp.status}")
                except Exception as e:
                    print(f"[ERROR] {url} - {e}")
        
        await browser.close()
        print(f"Verification finished. Found {success_count} valid logos.")

if __name__ == "__main__":
    asyncio.run(verify_mapping_file())
