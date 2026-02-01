from playwright.sync_api import sync_playwright
import json
import time

def run():
    with sync_playwright() as p:
        print("Launching browser for login verification...")
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
        
        print("Navigating to https://www.pg88.com...")
        try:
            page.goto("https://www.pg88.com", timeout=60000)
            page.wait_for_load_state("networkidle")
            
            # Direct probe to the correct API endpoint
            print("Probing https://api.pg88.com/009vn-ecp/api/v1/login ...")
            
            result = page.evaluate("""
                async () => {
                    try {
                        const response = await fetch('https://api.pg88.com/009vn-ecp/api/v1/login', {
                            method: 'POST',
                            headers: {
                                'accept': 'application/json, text/plain, */*',
                                'content-type': 'application/json',
                                'origin': 'https://www.pg88.com'
                            },
                            body: JSON.stringify({
                                loginname: 'probe_test_user',
                                loginpassword: 'probe_password_123',
                                domain: 'www.pg88.com'
                            })
                        });
                        
                        return {
                            status: response.status,
                            headers: Object.fromEntries(response.headers.entries()),
                            body: await response.text()
                        };
                    } catch (e) {
                        return { error: e.toString() };
                    }
                }
            """)
            
            print("\n--- LOGIN PROBE RESULT ---")
            print(json.dumps(result, indent=2))
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
