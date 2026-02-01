import asyncio
from playwright.async_api import async_playwright
import json
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        page = await context.new_page()

        print("--- Capturing API Responses with Interaction ---")
        api_responses = []

        async def handle_response(response):
            if response.request.resource_type in ["fetch", "xhr"]:
                try:
                    # Filter for likely API endpoints
                    if "api" in response.url or "json" in response.url or "Get" in response.url:
                        # Skip if already captured (simple dedup by URL)
                        if any(r['url'] == response.url for r in api_responses):
                            return
                        
                        try:
                            json_body = await response.json()
                            api_responses.append({
                                "url": response.url,
                                "body": json_body
                            })
                            print(f"Captured API: {response.url}")
                        except:
                            pass # Not JSON
                except:
                    pass

        page.on("response", handle_response)

        try:
            print("Navigating to home...")
            await page.goto("https://www.pg88.com/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(5000)

            # Try to click "Nổ Hũ" or "Slots"
            print("Attempting to find and click Slots/Nổ Hũ...")
            
            # Common selectors for navigation
            potential_selectors = [
                "text=Nổ Hũ", "text=Slots", 
                "a[href*='slot']", "a[href*='electronic']",
                ".nav-item:has-text('Nổ Hũ')", ".menu-item:has-text('Nổ Hũ')"
            ]
            
            clicked = False
            for sel in potential_selectors:
                try:
                    elem = page.locator(sel).first
                    if await elem.is_visible():
                        print(f"Clicking selector: {sel}")
                        await elem.click()
                        clicked = True
                        break
                except:
                    continue
            
            if not clicked:
                print("Could not find Slots menu, trying simple scroll...")
            
            await page.wait_for_timeout(5000)
            
            # Scroll a bit more
            for i in range(3):
                await page.evaluate(f"window.scrollTo(0, document.body.scrollHeight * {i+1}/3)")
                await page.wait_for_timeout(2000)

            # Save to file
            os.makedirs("_debug", exist_ok=True)
            output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "_debug", "captured_api_responses_v2.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(api_responses, f, indent=2, ensure_ascii=False)
            
            print(f"Saved {len(api_responses)} API responses to {output_path}")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
