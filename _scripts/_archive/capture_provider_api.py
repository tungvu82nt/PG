import asyncio
from playwright.async_api import async_playwright
import json
import os

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def capture_provider_api():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True, # Changed to True for server environment
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = await context.new_page()
        
        async def handle_response(response):
            if "api" in response.url and "json" in response.headers.get("content-type", ""):
                print(f"Captured API: {response.url}")
                try:
                    data = await response.json()
                    if isinstance(data, dict) and ('data' in data or 'list' in data):
                        filename = response.url.split('?')[0].replace('https://', '').replace('/', '_') + ".json"
                        filepath = os.path.join(OUTPUT_DIR, filename)
                        with open(filepath, "w", encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        print(f"  Saved to {filepath}")
                except:
                    pass

        page.on("response", handle_response)
        
        print("Navigating to pg88.com...")
        await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
        
        # Click "Nổ Hũ" (Slots) - using href pattern or text
        print("Clicking 'Nổ Hũ'...")
        # Tìm element có text "Nổ Hũ" hoặc link chứa "egame"
        # Dựa vào analyze trước đó, menu item có thể là li > a
        
        # Dump page content to debug selectors if needed
        # with open(f"{OUTPUT_DIR}/page_content.html", "w", encoding="utf-8") as f:
        #     f.write(await page.content())
            
        try:
             # Selector rộng hơn để bắt trúng
            await page.click("text=Nổ Hũ", timeout=5000)
        except:
            print("  Retry clicking via href...")
            try:
                await page.click("a[href*='egame']", timeout=5000)
            except Exception as e:
                print(f"  Click failed: {e}")

        await page.wait_for_timeout(3000)
        
        print("Clicking 'PG' provider...")
        try:
            # Click vào ảnh có src chứa 'sub-egame-pg.png' (pattern đã verify)
            await page.click("img[src*='sub-egame-pg.png']", timeout=5000)
        except:
            print("  Could not click PG logo directly. Trying generic PG text.")
            try:
                await page.click("text=PG", timeout=5000)
            except:
                print("  Click PG failed.")
        
        await page.wait_for_timeout(5000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_provider_api())
