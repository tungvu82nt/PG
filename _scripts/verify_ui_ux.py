
import asyncio
import os
import json
from playwright.async_api import async_playwright

DEBUG_DIR = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\ui_verification"
os.makedirs(DEBUG_DIR, exist_ok=True)

async def extract_element_details(page, selector, name):
    try:
        if await page.locator(selector).count() > 0:
            # Take screenshot of element
            await page.locator(selector).first.screenshot(path=os.path.join(DEBUG_DIR, f"{name}.png"))
            
            # Extract computed styles and HTML
            details = await page.eval_on_selector(selector, """
                el => {
                    const s = window.getComputedStyle(el);
                    return {
                        html: el.outerHTML,
                        styles: {
                            width: s.width,
                            height: s.height,
                            backgroundColor: s.backgroundColor,
                            color: s.color,
                            fontFamily: s.fontFamily,
                            fontSize: s.fontSize,
                            border: s.border,
                            borderRadius: s.borderRadius,
                            boxShadow: s.boxShadow,
                            display: s.display,
                            position: s.position,
                            zIndex: s.zIndex
                        },
                        innerText: el.innerText
                    }
                }
            """)
            return details
    except Exception as e:
        print(f"Error extracting {name}: {e}")
    return None

async def verify_ui():
    async with async_playwright() as p:
        print("Launching browser...")
        # Try headless=False to let user see if they are watching, but it might fail in some envs
        # We will stick to headless=True for stability unless requested, but user said "Open browser"
        # Let's try headless=False, if it fails, fallback? 
        # Actually, for an agent, headless=True is safer. I will generate artifacts.
        browser = await p.chromium.launch(headless=False, args=["--start-maximized"]) 
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        try:
            print("Navigating to pg88.com...")
            await page.goto("https://www.pg88.com", timeout=60000)
            
            # Wait for initial load
            await page.wait_for_timeout(5000)
            
            # Handle Ad Center Popup / Overlay
            print("Checking for popups...")
            try:
                # Wait a bit for popup
                await page.wait_for_timeout(2000)
                # Check if overlay exists and is visible
                if await page.locator(".ad-center-overlay").is_visible() or await page.locator(".ad-center").is_visible():
                    print("Popup detected. Attempting to close...")
                    # Try common close selectors
                    close_selectors = [
                        ".ad-center .close", 
                        ".ad-center .close-btn", 
                        ".ad-center svg", 
                        ".ad-center-close",
                        "button[class*='close']"
                    ]
                    closed = False
                    for sel in close_selectors:
                        if await page.locator(sel).count() > 0 and await page.locator(sel).first.is_visible():
                            await page.locator(sel).first.click()
                            print(f"Closed popup using {sel}")
                            closed = True
                            break
                    
                    if not closed:
                        # If can't find close button, try clicking outside (on overlay)
                        if await page.locator(".ad-center-overlay").is_visible():
                            await page.locator(".ad-center-overlay").click(position={"x": 10, "y": 10})
                            print("Clicked overlay to close")
                        else:
                            # Last resort: Remove from DOM
                            await page.evaluate("document.querySelector('.ad-center').remove()")
                            await page.evaluate("if(document.querySelector('.ad-center-overlay')) document.querySelector('.ad-center-overlay').remove()")
                            print("Removed popup via JS")
                
                await page.wait_for_timeout(1000)
            except Exception as e:
                print(f"Popup handling warning: {e}")

            # 1. Inspect Header
            print("Inspecting Navbar...")
            header_details = await extract_element_details(page, "header", "navbar")
            
            # 2. Inspect Register Modal/Button interaction
            print("Inspecting Register Interaction...")
            # Click Register button
            # Based on previous analysis: text=Đăng ký
            reg_btn = page.get_by_text("Đăng ký", exact=False).first
            if await reg_btn.count() > 0:
                await reg_btn.click(force=True)
                await page.wait_for_timeout(3000)
                await page.screenshot(path=os.path.join(DEBUG_DIR, "register_modal_open.png"))
                
                # Extract Register Modal Details
                # Try to find common modal classes
                modal_sel = ".ant-modal-content" # Common in AntD
                if await page.locator(modal_sel).count() == 0:
                     modal_sel = "div[role='dialog']"
                
                if await page.locator(modal_sel).count() > 0:
                    reg_details = await extract_element_details(page, modal_sel, "register_modal")
                
            # Reset Page for next test
            print("Reloading for Login test...")
            await page.reload()
            await page.wait_for_timeout(3000)
            
            # Handle popup again if it appears
            try:
                if await page.locator(".ad-center-overlay").is_visible():
                     await page.evaluate("document.querySelector('.ad-center').remove()")
                     await page.evaluate("if(document.querySelector('.ad-center-overlay')) document.querySelector('.ad-center-overlay').remove()")
            except: pass

            # 3. Inspect Login Interaction
            print("Inspecting Login Interaction...")
            login_btn = page.get_by_text("Đăng nhập", exact=False).first
            if await login_btn.count() > 0:
                await login_btn.click(force=True)
                await page.wait_for_timeout(3000)
                await page.screenshot(path=os.path.join(DEBUG_DIR, "login_modal_open.png"))
                
                # Extract Login Modal Details
                if await page.locator(modal_sel).count() > 0:
                    login_details = await extract_element_details(page, modal_sel, "login_modal")
                
            # 4. Inspect Mobile View (Footer/Menu)
            print("Inspecting Mobile View...")
            # We need a new context for mobile
            await context.close()
            
            context_mobile = await browser.new_context(**p.devices['iPhone 12'])
            page_mobile = await context_mobile.new_page()
            await page_mobile.goto("https://www.pg88.com", timeout=60000)
            await page_mobile.wait_for_timeout(3000)
            
            await page_mobile.screenshot(path=os.path.join(DEBUG_DIR, "mobile_full.png"))
            
            # Inspect Bottom Bar
            # Usually fixed at bottom
            # We will just screenshot the bottom area
            
            print("Verification Complete. Artifacts saved.")
            
            # Save collected data
            data = {
                "header": header_details
            }
            with open(os.path.join(DEBUG_DIR, "ui_details.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path=os.path.join(DEBUG_DIR, "error.png"))
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_ui())
