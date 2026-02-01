import asyncio
import json
import os
from playwright.async_api import async_playwright

# Ensure output directory exists
OUTPUT_DIR = r"D:\Tool\WEB\LOVABLE\Y1\Y3\_debug\ui_inspection"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_URL = "https://www.pg88.com"

async def remove_overlays(page):
    print("Removing overlays...")
    overlays = [
        ".ad-center-overlay", 
        ".ad-center", 
        ".app-loading-bg", 
        ".app-loading-custom",
        "#vnp_eyechat",
        "#vnp_chat",
        ".modal-mask",
        ".ant-modal-mask"
    ]
    for selector in overlays:
        try:
            await page.evaluate(f"document.querySelectorAll('{selector}').forEach(el => el.remove())")
        except:
            pass
    await page.wait_for_timeout(1000)

async def extract_computed_styles(page, selector, label):
    """Extracts comprehensive computed styles for a given selector."""
    try:
        # Check if element exists
        count = await page.locator(selector).count()
        if count == 0:
            print(f"Skipping {label}: Element not found ({selector})")
            return None

        # Extract styles
        styles = await page.eval_on_selector(selector, """
            el => {
                const s = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                // Helper to get pseudo-element styles
                const getPseudo = (type) => {
                    const ps = window.getComputedStyle(el, type);
                    return ps.content !== 'none' ? {
                        content: ps.content,
                        display: ps.display,
                        color: ps.color
                    } : null;
                };

                return {
                    box: {
                        width: rect.width + 'px',
                        height: rect.height + 'px',
                        top: rect.top + 'px',
                        left: rect.left + 'px'
                    },
                    typography: {
                        fontFamily: s.fontFamily,
                        fontSize: s.fontSize,
                        fontWeight: s.fontWeight,
                        lineHeight: s.lineHeight,
                        color: s.color,
                        textAlign: s.textAlign,
                        textTransform: s.textTransform,
                        letterSpacing: s.letterSpacing
                    },
                    layout: {
                        display: s.display,
                        position: s.position,
                        zIndex: s.zIndex,
                        overflow: s.overflow,
                        padding: s.padding,
                        margin: s.margin,
                        gap: s.gap
                    },
                    appearance: {
                        backgroundColor: s.backgroundColor,
                        backgroundImage: s.backgroundImage,
                        backgroundSize: s.backgroundSize,
                        backgroundPosition: s.backgroundPosition,
                        border: s.border,
                        borderRadius: s.borderRadius,
                        boxShadow: s.boxShadow,
                        opacity: s.opacity,
                        cursor: s.cursor
                    },
                    flexGrid: {
                        flexDirection: s.flexDirection,
                        alignItems: s.alignItems,
                        justifyContent: s.justifyContent,
                        gridTemplateColumns: s.gridTemplateColumns
                    },
                    pseudo: {
                        before: getPseudo('::before'),
                        after: getPseudo('::after')
                    }
                }
            }
        """)
        return styles
    except Exception as e:
        print(f"Error extracting {label}: {str(e)}")
        return None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=["--start-maximized", "--disable-blink-features=AutomationControlled"])
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        print(f"Navigating to {TARGET_URL}...")
        try:
            await page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Navigation warning: {e}")

        # Wait for potential popups/loading
        await page.wait_for_timeout(5000)
        await remove_overlays(page)

        # Define Elements to Inspect with Fallbacks
        elements_to_inspect = {
            "GLOBAL_BODY": "body",
            "HEADER_CONTAINER": "header",
            "HEADER_LOGO": "header img, .logo img",
            "HEADER_NAV_BAR": "nav, .nav-container",
            "HEADER_NAV_ITEM": "nav a, header li a, .nav-item",
            "HEADER_NAV_ITEM_ACTIVE": "nav a.active, header li.active a, .nav-item.active",
            
            "HERO_SECTION": ".banner, .carousel",
            "HERO_PAGINATION": ".swiper-pagination",
            
            "GAME_CATEGORY_BAR": ".game-category, .category-bar, div[class*='category']",
            "GAME_CATEGORY_ITEM": ".game-category-item, .category-item",
            
            "MAIN_CONTENT": "main",
            
            "GAME_GRID": ".game-list, div[class*='game-list']",
            "GAME_CARD": ".game-item, div[class*='game-item']",
            
            "FOOTER_CONTAINER": "footer",
            "FOOTER_LINKS": "footer a",
            
            "LOGIN_BUTTON": "button:has-text('Đăng nhập'), .login-btn",
            "REGISTER_BUTTON": "button:has-text('Đăng ký'), .register-btn",
        }

        results = {}

        print("Extracting styles...")
        for label, selector in elements_to_inspect.items():
            selectors = selector.split(",")
            style_data = None
            for s in selectors:
                s = s.strip()
                style_data = await extract_computed_styles(page, s, label)
                if style_data:
                    break
            
            if style_data:
                results[label] = style_data
                print(f"✅ Captured {label}")
            else:
                print(f"❌ Failed to capture {label}")

        # Capture Hover States
        print("Capturing hover states...")
        try:
            reg_btn = page.locator("button:has-text('Đăng ký'), .register-btn").first
            if await reg_btn.count() > 0:
                # Force hover
                await reg_btn.hover(force=True) 
                await page.wait_for_timeout(500)
                results["REGISTER_BUTTON_HOVER"] = await extract_computed_styles(page, "button:has-text('Đăng ký'), .register-btn", "REGISTER_BUTTON_HOVER")
                print("✅ Captured REGISTER_BUTTON_HOVER")
        except Exception as e:
            print(f"Hover capture failed: {e}")

        # Save to JSON
        output_file = os.path.join(OUTPUT_DIR, "full_ui_spec.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"Full UI Spec saved to {output_file}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
