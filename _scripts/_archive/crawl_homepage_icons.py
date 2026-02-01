import asyncio
from playwright.async_api import async_playwright
import json
import os
import sys

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def crawl_homepage_icons():
    print("Starting homepage crawler...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
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
            await page.goto("https://www.pg88.com/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(5000)
        except Exception as e:
            print(f"Navigation warning: {e}")

        # Scroll deeply to load everything on homepage
        print("Scrolling down...")
        for i in range(10):
            await page.mouse.wheel(0, 1000)
            await page.wait_for_timeout(1000)
            
        # Extract images
        print("Extracting images...")
        images = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                className: img.className,
                parentElement: img.parentElement ? img.parentElement.className : ''
            }));
        }""")
        
        print(f"Found {len(images)} images.")
        
        # Filter
        interesting = []
        for img in images:
            src = img.get('src', '')
            if not src: continue
            if 'http' not in src: continue
            
            # Exclude obvious UI elements
            if any(x in src for x in ['icon-', 'logo', 'banner', 'arrow', 'bg']):
                continue
                
            interesting.append(img)
            
        print(f"Filtered to {len(interesting)} potential game images.")
        
        output_path = os.path.join(OUTPUT_DIR, "homepage_images.json")
        with open(output_path, "w", encoding='utf-8') as f:
            json.dump(interesting, f, ensure_ascii=False, indent=2)
            
        print(f"Saved to {output_path}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(crawl_homepage_icons())
