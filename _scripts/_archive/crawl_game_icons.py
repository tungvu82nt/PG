import asyncio
from playwright.async_api import async_playwright
import json
import os
import sys

# Ensure output directory exists
OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def crawl_game_icons():
    print("Starting crawler...")
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch(
            headless=True, # Headless mode for server
            args=['--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        page = await context.new_page()
        
        print("Navigating to pg88.com...")
        try:
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")
            # Continue anyway if partial load
        
        # Click "Nổ Hũ" (Slots)
        print("Clicking 'Nổ Hũ'...")
        clicked = False
        try:
            await page.click("text=Nổ Hũ", timeout=10000)
            clicked = True
        except:
            print("Text click failed. Trying href...")
            try:
                # Try finding link with egame
                await page.click("a[href*='egame']", timeout=5000)
                clicked = True
            except:
                print("Click Nổ Hũ failed.")
                
        if clicked:
            await page.wait_for_timeout(5000)
            
            # Click PG Soft provider if possible
            print("Clicking 'PG' provider...")
            try:
                await page.click("img[src*='sub-egame-pg.png']", timeout=5000)
                await page.wait_for_timeout(5000)
            except:
                print("Click PG failed or not found. Continuing with current view.")

            # Scroll to trigger lazy load
            print("Scrolling...")
            for i in range(5):
                await page.mouse.wheel(0, 1000)
                await page.wait_for_timeout(2000)
        
        # Extract all images
        print("Extracting images...")
        images = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.naturalWidth,
                height: img.naturalHeight
            }));
        }""")
        
        print(f"Found {len(images)} images total.")
        
        # Filter interesting ones
        interesting = []
        for img in images:
            src = img.get('src', '')
            if not src: continue
            
            # Skip known generic images
            if any(x in src for x in ['sub-egame-', 'sub-menu', 'banner', 'logo', 'icon-']):
                continue
                
            interesting.append(img)
            
        print(f"Filtered to {len(interesting)} interesting images.")
        
        output_path = os.path.join(OUTPUT_DIR, "crawled_images_v2.json")
        with open(output_path, "w", encoding='utf-8') as f:
            json.dump(interesting, f, ensure_ascii=False, indent=2)
            
        print(f"Saved to {output_path}")
        
        # Print samples
        for img in interesting[:10]:
            print(f"Sample: {img['src']}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(crawl_game_icons())
