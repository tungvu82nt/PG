import random
import time
import json
from playwright.sync_api import sync_playwright

def human_scroll(page):
    """Simulates human-like scrolling."""
    for _ in range(random.randint(3, 7)):
        scroll_amount = random.randint(300, 700)
        page.mouse.wheel(0, scroll_amount)
        time.sleep(random.uniform(0.5, 1.5))

def human_mouse_move(page):
    """Simulates random mouse movements."""
    width = page.viewport_size['width']
    height = page.viewport_size['height']
    for _ in range(random.randint(5, 10)):
        x = random.randint(0, width)
        y = random.randint(0, height)
        page.mouse.move(x, y, steps=10)
        time.sleep(random.uniform(0.1, 0.3))

def run():
    with sync_playwright() as p:
        print("Launching browser with stealth settings...")
        browser = p.chromium.launch(
            headless=True, # Keep headless for server environment, but stealth args help
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
            ]
        )
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            java_script_enabled=True,
            locale='vi-VN',
            timezone_id='Asia/Ho_Chi_Minh',
            permissions=['geolocation'],
            geolocation={'latitude': 10.8231, 'longitude': 106.6297}, # Ho Chi Minh City
            has_touch=False,
            is_mobile=False,
            device_scale_factor=1,
            color_scheme='light'
        )
        
        # Anti-detection scripts
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['vi-VN', 'vi', 'en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            window.chrome = { runtime: {} };
        """)
        
        page = context.new_page()
        
        # API Capture
        api_data = []
        
        def handle_response(response):
            if response.request.resource_type in ["fetch", "xhr"]:
                if "api" in response.url or "game" in response.url:
                    print(f"CAPTURED: {response.status} {response.url}")
                    try:
                        json_data = response.json()
                        api_data.append({
                            "url": response.url,
                            "status": response.status,
                            "method": response.request.method,
                            "headers": response.request.headers,
                            "response": json_data
                        })
                    except:
                        pass

        page.on("response", handle_response)

        print("Navigating to https://www.pg88.com...")
        try:
            page.goto("https://www.pg88.com", timeout=90000, wait_until="domcontentloaded")
            time.sleep(5)
            
            # Remove overlays
            print("Removing overlays...")
            page.evaluate("""
                document.querySelectorAll('.ad-center, .ad-center-overlay, .modal, .popup, .overlay, #popup').forEach(e => e.remove());
            """)
            
            # Human interaction
            print("Simulating human behavior...")
            human_mouse_move(page)
            human_scroll(page)
            
            # Try to find game list or promo
            print("Looking for game/promo data...")
            # Click on 'Trò chơi' or similar if exists, or just wait for background requests
            time.sleep(5)
            
            # Save captured data
            with open('api_traffic_dump.json', 'w', encoding='utf-8') as f:
                json.dump(api_data, f, indent=2, ensure_ascii=False)
            print(f"Saved {len(api_data)} API responses to api_traffic_dump.json")
            
        except Exception as e:
            print(f"Error: {e}")
            # Save whatever we have
            with open('api_traffic_dump.json', 'w', encoding='utf-8') as f:
                json.dump(api_data, f, indent=2, ensure_ascii=False)
        finally:
            browser.close()

if __name__ == "__main__":
    run()
