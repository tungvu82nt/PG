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

        print("--- Capturing API Responses ---")
        api_responses = []

        async def handle_response(response):
            if response.request.resource_type in ["fetch", "xhr"]:
                try:
                    # Filter for likely API endpoints
                    if "api" in response.url or "json" in response.url or "Get" in response.url:
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
            await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
            
            # Scroll to trigger loads
            for i in range(5):
                await page.evaluate(f"window.scrollTo(0, document.body.scrollHeight * {i+1}/5)")
                await page.wait_for_timeout(1000)

            # Save to file
            os.makedirs("_debug", exist_ok=True)
            with open("_debug/captured_api_responses.json", "w", encoding="utf-8") as f:
                json.dump(api_responses, f, indent=2, ensure_ascii=False)
            
            print(f"Saved {len(api_responses)} API responses to _debug/captured_api_responses.json")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
