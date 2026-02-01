import asyncio
from playwright.async_api import async_playwright
import json
import os

async def get_js_urls():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()

        js_urls = set()

        # Listen to requests
        page.on("request", lambda request: js_urls.add(request.url) if request.resource_type == "script" or request.url.endswith(".js") else None)

        print("Navigating to https://www.pg88.com/ ...")
        try:
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Save to file
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "_debug")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "js_urls.json")
        
        sorted_urls = sorted(list(js_urls))
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(sorted_urls, f, indent=2)
            
        print(f"Found {len(sorted_urls)} JS files.")
        for url in sorted_urls:
            print(f"  - {url}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(get_js_urls())
