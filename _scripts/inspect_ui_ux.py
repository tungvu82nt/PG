
import asyncio
import os
import json
from playwright.async_api import async_playwright

DEBUG_DIR = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\ui_inspection"
os.makedirs(DEBUG_DIR, exist_ok=True)

async def extract_styles(page, selector, name):
    try:
        if await page.locator(selector).count() > 0:
            styles = await page.eval_on_selector(selector, """
                el => {
                    const s = window.getComputedStyle(el);
                    return {
                        fontFamily: s.fontFamily,
                        fontSize: s.fontSize,
                        color: s.color,
                        backgroundColor: s.backgroundColor,
                        backgroundImage: s.backgroundImage,
                        borderRadius: s.borderRadius,
                        boxShadow: s.boxShadow,
                        height: s.height,
                        padding: s.padding,
                        margin: s.margin,
                        border: s.border,
                        zIndex: s.zIndex,
                        position: s.position
                    }
                }
            """)
            print(f"Extracted styles for {name}")
            return styles
    except Exception as e:
        print(f"Error extracting {name}: {e}")
    return None

async def inspect_ui():
    async with async_playwright() as p:
        # 1. Desktop Inspection
        print("Starting Desktop Inspection...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        try:
            await page.goto("https://www.pg88.com", timeout=60000)
            
            # Wait for loader to vanish or main content to appear
            # Based on index.html, .app-loading-bg disappears
            await page.wait_for_selector(".app-loading-bg", state="hidden", timeout=30000)
            print("Loader finished.")
            
            # Wait a bit for animations
            await page.wait_for_timeout(3000)
            
            # Screenshot
            await page.screenshot(path=os.path.join(DEBUG_DIR, "desktop_home.png"), full_page=True)
            
            # Hydrated HTML
            html = await page.content()
            with open(os.path.join(DEBUG_DIR, "desktop_hydrated.html"), "w", encoding="utf-8") as f:
                f.write(html)
                
            # Extract Styles
            styles = {}
            styles['body'] = await extract_styles(page, "body", "Body")
            # Try to find header and buttons (generic selectors first, refine later if needed)
            # Assuming typical class names or analyzing the hydrated HTML later
            # Let's try to find 'header' tag or common header classes
            styles['header'] = await extract_styles(page, "header", "Header")
            if not styles['header']:
                styles['header'] = await extract_styles(page, "div[class*='header']", "Header Div")
            
            # Buttons - Look for text content "Đăng ký" or "Đăng nhập" if possible, or generic buttons
            # We know from i18n that "signin" is "Đăng nhập"
            login_btn = page.get_by_text("Đăng nhập", exact=False).first
            if await login_btn.count() > 0:
                 styles['login_btn'] = await extract_styles(page, "text=Đăng nhập", "Login Button")
            
            register_btn = page.get_by_text("Đăng ký", exact=False).first
            if await register_btn.count() > 0:
                 styles['register_btn'] = await extract_styles(page, "text=Đăng ký", "Register Button")

            with open(os.path.join(DEBUG_DIR, "desktop_styles.json"), "w", encoding="utf-8") as f:
                json.dump(styles, f, indent=2)

        except Exception as e:
            print(f"Desktop inspection failed: {e}")
            await page.screenshot(path=os.path.join(DEBUG_DIR, "desktop_error.png"))

        await context.close()
        await browser.close()
        
        # 2. Mobile Inspection
        print("Starting Mobile Inspection...")
        browser = await p.chromium.launch(headless=True)
        # Emulate iPhone 12
        iphone_12 = p.devices['iPhone 12']
        context = await browser.new_context(**iphone_12)
        page = await context.new_page()
        
        try:
            await page.goto("https://www.pg88.com", timeout=60000)
            await page.wait_for_selector(".app-loading-bg", state="hidden", timeout=30000)
            await page.wait_for_timeout(3000)
            
            await page.screenshot(path=os.path.join(DEBUG_DIR, "mobile_home.png"), full_page=True)
            
            # Mobile specific elements (Bottom Bar?)
            
        except Exception as e:
            print(f"Mobile inspection failed: {e}")
            await page.screenshot(path=os.path.join(DEBUG_DIR, "mobile_error.png"))
            
        await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_ui())
