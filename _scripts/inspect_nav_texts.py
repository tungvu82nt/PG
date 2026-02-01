import asyncio
import json
from playwright.async_api import async_playwright

TOKEN_PATH = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_token.json"

async def main():
    with open(TOKEN_PATH, "r", encoding="utf-8") as f:
        auth = json.load(f)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        await context.add_init_script(f"""
            localStorage.setItem('token', '{auth['token']}');
            localStorage.setItem('playerid', '{auth['playerid']}');
            localStorage.setItem('currency', '{auth['currency']}');
            localStorage.setItem('__vnp_guest_id', '{auth['__vnp_guest_id']}');
        """)

        page = await context.new_page()
        await page.goto("https://www.pg88.com/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)
        await page.evaluate("""() => {
            document.querySelectorAll('.ad-center-overlay, .ad-center, .modal, .popup').forEach(el => el.remove());
        }""")

        data = await page.evaluate("""() => {
            const norm = (s) => (s || '').replace(/\s+/g,' ').trim();
            const pick = (sel) => Array.from(document.querySelectorAll(sel)).map(el => ({
                tag: el.tagName,
                text: norm(el.innerText || el.textContent),
                className: el.className || '',
            })).filter(x => x.text);

            return {
                h3: pick('h3'),
                navCandidates: pick('nav a, header a, header h3, header div, header span'),
            };
        }""")

        print("H3 texts (unique):")
        seen = set()
        for item in data["h3"]:
            if item["text"].lower() in seen:
                continue
            seen.add(item["text"].lower())
            print(f"- {item['text']} ({item['tag']}) class={item['className']}")

        print("\nHeader/nav candidates containing LIVE/CASINO:")
        for item in data["navCandidates"]:
            t = item["text"].lower()
            if "live" in t or "casino" in t:
                print(f"- {item['text']} ({item['tag']}) class={item['className']}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
