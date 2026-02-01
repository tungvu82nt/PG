
import asyncio
import os
import json
from playwright.async_api import async_playwright

DEBUG_DIR = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\ui_verification"
os.makedirs(DEBUG_DIR, exist_ok=True)

async def capture_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True) # Headless is faster and stable
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        try:
            print("Navigating...")
            await page.goto("https://www.pg88.com", timeout=60000)
            await page.wait_for_timeout(5000)
            
            # Close popup if any
            try:
                await page.evaluate("""
                    const overlay = document.querySelector('.ad-center-overlay');
                    if(overlay) overlay.remove();
                    const ad = document.querySelector('.ad-center');
                    if(ad) ad.remove();
                """)
                print("Popup removed via JS")
            except: pass
            
            # Click Login via JS
            print("Clicking Login...")
            # Find button with text "Đăng nhập"
            await page.evaluate("""
                const btns = Array.from(document.querySelectorAll('button'));
                const loginBtn = btns.find(b => b.innerText.includes('Đăng nhập'));
                if(loginBtn) loginBtn.click();
            """)
            
            await page.wait_for_timeout(3000)
            await page.screenshot(path=os.path.join(DEBUG_DIR, "login_modal_captured.png"))
            
            # Extract HTML
            modal_html = await page.content()
            with open(os.path.join(DEBUG_DIR, "login_page.html"), "w", encoding="utf-8") as f:
                f.write(modal_html)
                
            print("Login captured.")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_login())
