from playwright.sync_api import sync_playwright
import json
import time

def run():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        )
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            java_script_enabled=True,
            locale='en-US'
        )
        
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = context.new_page()
        
        # Monitor ALL non-resource requests
        def handle_request(request):
            if request.resource_type in ["fetch", "xhr", "websocket"]:
                print(f"REQUEST [{request.resource_type}]: {request.method} {request.url}")
                if "login" in request.url or "api" in request.url:
                    print(f"HEADERS: {request.headers}")
                    if request.post_data:
                        print(f"DATA: {request.post_data}")

        def handle_response(response):
            if response.request.resource_type in ["fetch", "xhr", "websocket"]:
                if "login" in response.url or "api" in response.url:
                    print(f"RESPONSE: {response.status} {response.url}")
                    try:
                        print(f"BODY: {response.text()[:500]}") 
                    except:
                        pass

        page.on("request", handle_request)
        page.on("response", handle_response)

        print("Navigating to https://www.pg88.com...")
        try:
            page.goto("https://www.pg88.com", timeout=60000)
            page.wait_for_load_state("networkidle")
            
            # Remove potential overlays
            page.evaluate("""
                document.querySelectorAll('.ad-center, .ad-center-overlay, .modal, .popup, .overlay').forEach(e => e.remove());
            """)
            time.sleep(1)
            
            # Click login
            selectors = ["text=Đăng nhập", "text=Login", ".header-login", "button:has-text('Đăng nhập')"]
            for sel in selectors:
                if page.locator(sel).count() > 0 and page.locator(sel).first.is_visible():
                    print(f"Clicking {sel}...")
                    page.locator(sel).first.click(force=True)
                    break
            
            time.sleep(2)
            
            # Fill form
            if page.locator("input[type='password']").count() > 0:
                print("Filling login form...")
                if page.locator("input[type='text']").count() > 0:
                    page.locator("input[type='text']").first.fill("testuser123")
                page.locator("input[type='password']").first.fill("password123")
                
                # Submit
                submit_selectors = ["button[type='submit']", "text=Đăng nhập", "button:has-text('Đăng nhập')"]
                for sub in submit_selectors:
                        if page.locator(sub).count() > 0 and page.locator(sub).first.is_visible():
                            print(f"Submitting via {sub}...")
                            page.locator(sub).first.click(force=True)
                            break
                
                time.sleep(5)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
