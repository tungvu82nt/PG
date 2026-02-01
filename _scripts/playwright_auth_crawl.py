import json
import asyncio
from playwright.async_api import async_playwright

# User provided cookie string
COOKIE_STR = "_fbp=fb.1.1769530719962.194374598306584409;_gta_uni=823749984.227914248.094934686275;__vnp_guest_id=227914248;__cf_bm=Fl5hPfyx_22_OtXQPgMbJG_eNGqRTnvnWmlyoNBOu7Q-1769544991-1.0.1.1-aPTa5EU3NTKw084F7lJ7tUGSQhnegnnNsc7SOcWhVauPb9F1Mz9oykCf75I5eUYbE0_vccS0QNTmavFT7aOenutoigOI9k6Nv9zEofXHj6c;"

def parse_cookies(cookie_str, domain=".pg88.com"):
    cookies = []
    for pair in cookie_str.split(';'):
        if '=' in pair:
            name, value = pair.strip().split('=', 1)
            cookies.append({
                "name": name,
                "value": value,
                "domain": domain,
                "path": "/"
            })
    return cookies

async def run():
    async with async_playwright() as p:
        # Launch browser (headless=True for speed, False for debugging)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        
        # Set cookies
        cookies = parse_cookies(COOKIE_STR)
        await context.add_cookies(cookies)
        
        page = await context.new_page()
        
        # Store intercepted responses
        intercepted_data = []

        # Handler for responses
        async def handle_response(response):
            url = response.url
            if "api/v1" in url and response.status == 200:
                try:
                    # Filter for game related endpoints
                    if any(x in url for x in ["gameList", "hot_games", "categories", "game_list"]):
                        print(f"Intercepted API: {url}")
                        data = await response.json()
                        intercepted_data.append({
                            "url": url,
                            "data": data
                        })
                except:
                    pass

        page.on("response", handle_response)
        
        print("Navigating to https://www.pg88.com/ ...")
        try:
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Navigation warning: {e}")

        # Wait a bit for lazy loading / extra APIs
        print("Waiting for APIs to load...")
        await page.wait_for_timeout(10000)
        
        # Scroll down to trigger lazy loading
        print("Scrolling...")
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(5000)

        # Save data
        output_path = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/playwright_intercepted.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(intercepted_data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {len(intercepted_data)} API responses to {output_path}")
        
        # Take a screenshot for verification
        await page.screenshot(path="d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/screenshot_auth.png")
        print("Screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
