import asyncio
from playwright.async_api import async_playwright
import json
import os

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"

async def debug_scroll():
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
            localStorage.setItem('currency', '{auth_data['currency']}');
            localStorage.setItem('__vnp_guest_id', '{auth_data['__vnp_guest_id']}');
        """)

        print("Navigating to /egame...")
        await page.goto("https://www.pg88.com/egame", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        
        # Find scrollable elements
        scrollable_info = await page.evaluate("""() => {
            const elements = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.scrollHeight > el.clientHeight && el.clientHeight > 0) {
                    elements.push({
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        scrollHeight: el.scrollHeight,
                        clientHeight: el.clientHeight,
                        diff: el.scrollHeight - el.clientHeight
                    });
                }
            }
            // Sort by scrollable area size
            return elements.sort((a, b) => b.diff - a.diff).slice(0, 5);
        }""")
        
        print("Top 5 scrollable elements:")
        print(json.dumps(scrollable_info, indent=2))
        
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "debug_scroll_check.png"))
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_scroll())