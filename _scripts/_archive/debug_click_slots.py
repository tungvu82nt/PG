import asyncio
from playwright.async_api import async_playwright
import json
import os

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"

async def debug_click():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        # Load token
        with open(r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_token.json', 'r') as f:
            auth_data = json.load(f)
            
        await context.add_init_script(f"""
            localStorage.setItem('token', '{auth_data['token']}');
            localStorage.setItem('playerid', '{auth_data['playerid']}');
        """)

        print("Navigating to Home...")
        await page.goto("https://www.pg88.com/", wait_until="networkidle")
        await page.wait_for_timeout(5000)
        
        # Remove overlays
        print("Removing overlays...")
        await page.evaluate("""() => {
            document.querySelectorAll('.ad-center-overlay, .ad-center, .modal, .popup').forEach(el => el.remove());
        }""")
        await page.wait_for_timeout(1000)
        
        print("Clicking 'NỔ HŨ'...")
        try:
            # Click the element with text "NỔ HŨ"
            await page.click("text=NỔ HŨ", timeout=10000)
            await page.wait_for_timeout(5000)
            
            print("Clicked. Waiting for content...")
            await page.wait_for_timeout(5000)
            
            # Count images
            count = await page.locator("img").count()
            print(f"Image count after click: {count}")
            
            # Screenshot
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "debug_click_slots.png"))
            
        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "debug_error_click.png"))

        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_click())