import asyncio
from playwright.async_api import async_playwright
import json
import os
import time

# Configuration
CDN_DOMAIN = "https://img.ihudba.com"
TEST_PATHS = [
    "AMEBA/777_zhCN.png",
    "CQ9/15.png",
    "AMEBA/FaFaFa_zhCN.png",
    "PG/mahjong-ways-2.png", # Guessing
    "JILI/super-ace.png" # Guessing
]

PREFIXES_TO_TEST = [
    "",
    "/img",
    "/img/static",
    "/img/static/games",
    "/img/static/icon",
    "/img/static/icons",
    "/img/009vn",
    "/img/009vn/games",
    "/img/009vn/icon",
    "/images",
    "/assets",
    "/static"
]

async def check_url(page, url):
    try:
        response = await page.request.head(url)
        status = response.status
        print(f"[{status}] Checking: {url}")
        if status == 200:
            return True
        # Try GET if HEAD fails (sometimes CDNs block HEAD)
        if status != 404:
            response = await page.request.get(url)
            status = response.status
            print(f"[{status}] GET Retry: {url}")
            if status == 200:
                return True
    except Exception as e:
        print(f"[ERR] Error checking {url}: {e}")
    return False

async def run():
    async with async_playwright() as p:
        # Launch with anti-detection args
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        
        # Hide webdriver property
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        page = await context.new_page()
        
        print("--- Starting Game Icon URL Fuzzing ---")
        
        found_urls = []
        
        for path in TEST_PATHS:
            for prefix in PREFIXES_TO_TEST:
                # Handle slash logic carefully
                clean_prefix = prefix.rstrip('/')
                clean_path = path.lstrip('/')
                url = f"{CDN_DOMAIN}{clean_prefix}/{clean_path}"
                
                if await check_url(page, url):
                    print(f"!!! FOUND VALID URL: {url}")
                    found_urls.append(url)
                    # Break prefix loop for this path if found
                    break
        
        print(f"--- Finished Fuzzing. Found {len(found_urls)} valid URLs ---")
        
        # Also try to visit homepage and capture all requests again with more aggressive scroll
        print("--- Crawling Homepage for any Game Images ---")
        captured_requests = []
        page.on("request", lambda r: captured_requests.append(r.url) if r.resource_type == "image" else None)
        
        try:
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
            
            # Scroll down slowly to trigger lazy loading
            for i in range(10):
                await page.evaluate(f"window.scrollTo(0, document.body.scrollHeight * {i+1}/10)")
                await page.wait_for_timeout(1000)
                
            print(f"Captured {len(captured_requests)} image requests from homepage.")
            
            # Filter for likely game images
            game_candidates = [u for u in captured_requests if 'gplogo' not in u and 'sub-menu' not in u and 'ads' not in u and 'banner' not in u]
            print(f"Potential game images found: {len(game_candidates)}")
            for u in game_candidates[:20]:
                print(f"Candidate: {u}")
                
        except Exception as e:
            print(f"Homepage crawl error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
