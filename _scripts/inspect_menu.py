import asyncio
from playwright.async_api import async_playwright
import json
import os

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"

async def inspect_menu():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        page = await browser.new_page()
        
        # Load token
        with open(r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_token.json', 'r') as f:
            auth_data = json.load(f)
            
        await page.add_init_script(f"""
            localStorage.setItem('token', '{auth_data['token']}');
            localStorage.setItem('playerid', '{auth_data['playerid']}');
        """)

        print("Navigating to Home...")
        await page.goto("https://www.pg88.com/", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        
        # Inspect All Text
        print("Inspecting All Text...")
        text_content = await page.evaluate("""() => {
            return document.body.innerText;
        }""")
        
        print(text_content[:2000]) # Print first 2000 chars
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_menu())