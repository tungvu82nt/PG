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
        await page.goto("https://www.pg88.com/gamelobby/egame", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)
        await page.evaluate("""() => {
            document.querySelectorAll('.ad-center-overlay, .ad-center, .modal, .popup').forEach(el => el.remove());
        }""")

        for _ in range(10):
            await page.keyboard.press("PageDown")
            await page.wait_for_timeout(300)

        samples = await page.evaluate("""() => {
            const norm = (s) => (s || '').replace(/\s+/g,' ').trim();
            const bad = (s) => {
                const t = s.toLowerCase();
                if (!t) return true;
                if (t.includes('yêu thích')) return true;
                if (t.includes('thông báo')) return true;
                if (t.match(/\d{2}:\d{2}/)) return true;
                if (t.length > 80) return true;
                return false;
            };

            const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src && img.src.includes('ihudba') && img.width >= 80 && img.height >= 80);
            const out = [];

            for (const img of imgs.slice(0, 60)) {
                let name = '';
                let node = img;
                for (let i = 0; i < 6; i++) {
                    node = node.parentElement;
                    if (!node) break;
                    const txt = norm(node.innerText);
                    if (!bad(txt)) { name = txt; break; }
                }
                out.push({ src: img.src, alt: img.alt || '', guessedName: name });
            }
            return out;
        }""")

        print("Sample guessed names (first 30):")
        for s in samples[:30]:
            print(f"- name='{s['guessedName']}' alt='{s['alt']}' src='{s['src']}'")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
