import asyncio
from playwright.async_api import async_playwright
import json
import os

OUTPUT_DIR = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load token
with open(r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_token.json', 'r') as f:
    auth_data = json.load(f)

async def remove_overlays(page):
    await page.evaluate("""() => {
        document.querySelectorAll('.ad-center-overlay, .ad-center, .modal, .popup').forEach(el => el.remove());
    }""")

async def click_nav_tab(page, label):
    await remove_overlays(page)
    nav_item = page.locator("div.navigation .nav-item", has_text=label).first
    if await nav_item.count():
        await nav_item.click(timeout=10000)
        return
    h3_item = page.locator(f"h3:has-text('{label}')").first
    await h3_item.click(timeout=10000)

async def smart_scroll(page, max_scrolls=50):
    print("  Smart scrolling...")
    last_height = await page.evaluate("document.body.scrollHeight")
    no_change_count = 0
    
    for i in range(max_scrolls):
        await page.keyboard.press("PageDown")
        await page.wait_for_timeout(800) # Wait for content load
        
        new_height = await page.evaluate("document.body.scrollHeight")
        if new_height == last_height:
            no_change_count += 1
            if no_change_count >= 5: # Stop if no change for 5 presses
                print("  Reached bottom or no new content.")
                break
        else:
            no_change_count = 0
            last_height = new_height
            
        if i % 10 == 0:
            print(f"  Scroll {i}/{max_scrolls}...")

async def crawl_authenticated():
    print("Starting authenticated crawler...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        
        # Inject auth token
        await context.add_init_script(f"""
            localStorage.setItem('token', '{auth_data['token']}');
            localStorage.setItem('playerid', '{auth_data['playerid']}');
            localStorage.setItem('currency', '{auth_data['currency']}');
            localStorage.setItem('__vnp_guest_id', '{auth_data['__vnp_guest_id']}');
        """)
        
        page = await context.new_page()
        
        # Monitor API requests
        api_responses = []
        page.on("response", lambda response: asyncio.create_task(handle_response(response, api_responses)))

        print("Navigating to pg88.com...")
        try:
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(5000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Remove Overlays (Ad popups)
        print("Removing overlays...")
        await remove_overlays(page)
        await page.wait_for_timeout(1000)

        # Define categories based on Home navigation tabs
        categories = [
            {"name": "Slots", "label": "NỔ HŨ"},
            {"name": "Fish", "label": "BẮN CÁ"},
            {"name": "Card", "label": "GAME BÀI"},
            {"name": "Live", "label": "CASINO"},
            {"name": "Cockfight", "label": "ĐÁ GÀ"},
            {"name": "Lottery", "label": "XỔ SỐ"},
            {"name": "Sport", "label": "THỂ THAO"}
        ]
        
        # Also try "CASINO" if LIVE CASINO fails
        # But for now let's stick to the list.
        
        all_images = []

        for cat in categories:
            print(f"Processing Category: {cat['name']}...")
            try:
                # Ensure we are on Home or just click the tab
                # If we are deep in a category, clicking another tab should work.
                
                print(f"  Clicking tab '{cat['label']}'...")
                await click_nav_tab(page, cat['label'])

                await page.wait_for_timeout(5000) # Wait for load
                
                # Check current URL
                print(f"  Current URL: {page.url}")
                
                # Scroll to trigger lazy load
                await smart_scroll(page, max_scrolls=60)
                    
                # Extract images for this category
                print(f"  Extracting images from {cat['name']}...")
                cat_images = await page.evaluate("""(category) => {
                    return Array.from(document.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt,
                        category: category,
                        dataset: img.dataset,
                        width: img.width,
                        height: img.height,
                        visible: img.offsetParent !== null
                    }));
                }""", cat['name'])
                
                print(f"  Found {len(cat_images)} raw images in {cat['name']}.")
                all_images.extend(cat_images)
                
                # INCREMENTAL SAVE
                temp_valid = [img for img in all_images if 'ihudba' in img['src']]
                temp_unique = {img['src']: img for img in temp_valid}.values()
                with open(os.path.join(OUTPUT_DIR, "auth_crawled_images_partial.json"), "w", encoding='utf-8') as f:
                    json.dump(list(temp_unique), f, ensure_ascii=False, indent=2)

                # Save HTML and Screenshot for debugging
                content = await page.content()
                with open(os.path.join(OUTPUT_DIR, f"debug_{cat['name']}.html"), "w", encoding="utf-8") as f:
                    f.write(content)
                await page.screenshot(path=os.path.join(OUTPUT_DIR, f"debug_{cat['name']}.png"), full_page=True)
                
            except Exception as e:
                print(f"  Error processing {cat['name']}: {e}")
                # Try to recover by going home
                try:
                    await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=30000)
                    await remove_overlays(page)
                except:
                    pass

        # Filter and Save (Relaxed filter: any image from ihudba)
        valid_images = [img for img in all_images if 'ihudba' in img['src']]
        print(f"Total unique images found: {len(valid_images)}")
        
        # Remove duplicates based on src
        unique_images = {img['src']: img for img in valid_images}.values()
        
        print(f"Total unique images after dedup: {len(unique_images)}")

        with open(os.path.join(OUTPUT_DIR, "auth_crawled_images.json"), "w", encoding='utf-8') as f:
            json.dump(list(unique_images), f, ensure_ascii=False, indent=2)
            
        # Save API responses
        with open(os.path.join(OUTPUT_DIR, "auth_api_responses.json"), "w", encoding='utf-8') as f:
            json.dump(api_responses, f, ensure_ascii=False, indent=2)

        await browser.close()

async def handle_response(response, container):
    if "api" in response.url and "json" in response.headers.get("content-type", ""):
        try:
            data = await response.json()
            container.append({
                "url": response.url,
                "data": data
            })
        except:
            pass

if __name__ == "__main__":
    asyncio.run(crawl_authenticated())
