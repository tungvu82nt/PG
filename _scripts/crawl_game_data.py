from playwright.sync_api import sync_playwright
import json
import time
import os

def run():
    output_dir = "processed_data"
    os.makedirs(output_dir, exist_ok=True)
    
    with sync_playwright() as p:
        print("Launching browser for data crawling...")
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
        
        # Container for captured data
        captured_data = {}

        def handle_response(response):
            try:
                if "allGameList" in response.url and response.status == 200:
                    print(f"Captured Game List from: {response.url}")
                    data = response.json()
                    captured_data['game_list'] = data
                    
                if "promos" in response.url and response.status == 200:
                    print(f"Captured Promos from: {response.url}")
                    try:
                        data = response.json()
                        captured_data['promos'] = data
                    except:
                        pass
            except Exception as e:
                # Ignore errors parsing non-json or other issues
                pass

        page.on("response", handle_response)

        print("Navigating to https://www.pg88.com to trigger API calls...")
        try:
            page.goto("https://www.pg88.com", timeout=60000)
            page.wait_for_load_state("networkidle")
            
            # Scroll down to trigger lazy loading if needed
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(3)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(2)
            
            # Explicitly fetch the game list if it wasn't caught automatically
            if 'game_list' not in captured_data:
                print("Game list not captured automatically, attempting manual fetch via page context...")
                game_data = page.evaluate("""
                    async () => {
                        try {
                            const response = await fetch('https://api.pg88.com/009vn-ecp/api/v1/games/allGameList?limit=10000&offset=0&platform=2&sort=ASC&sortcolumn=producttypeid', {
                                headers: {
                                    'accept': 'application/json, text/plain, */*',
                                    'content-type': 'application/json'
                                }
                            });
                            return await response.json();
                        } catch (e) {
                            return { error: e.toString() };
                        }
                    }
                """)
                captured_data['game_list'] = game_data

            # Save data
            if 'game_list' in captured_data:
                file_path = os.path.join(output_dir, "game_list_full.json")
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(captured_data['game_list'], f, indent=2, ensure_ascii=False)
                print(f"Successfully saved game list to {file_path}")
            else:
                print("Failed to capture game list data.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
