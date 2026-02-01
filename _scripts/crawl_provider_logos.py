import json
import os
import asyncio
from typing import Dict, Optional
from playwright.async_api import async_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_LIST_PATH = os.path.join(BASE_DIR, "processed_data", "game_list_full.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "_debug", "provider_logos")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "_mapping.txt")

BASE_URL = "https://img.ihudba.com/img/static/desktop/sub-menu/sub-egame-{provider}.png"

async def crawl_logos():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.exists(GAME_LIST_PATH):
        raise FileNotFoundError(f"Missing game list: {GAME_LIST_PATH}")

    with open(GAME_LIST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    games = data.get("gameWithTags", {}).get("data", [])
    providers = sorted({str(g.get("gameproviderid", "")).strip().lower() for g in games if g.get("gameproviderid")})

    print(f"Found {len(providers)} providers. Starting crawl...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            extra_http_headers={"Accept": "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.5"},
        )

        mapping: Dict[str, str] = {}

        for pid in providers:
            targets = [pid]
            if "_" in pid:
                targets.append(pid.split("_")[0])
                targets.append(pid.replace("_", ""))

            found_url: Optional[str] = None
            for target in targets:
                url = BASE_URL.format(provider=target)
                try:
                    resp = await context.request.get(url, timeout=15000)
                    content_type = (resp.headers or {}).get("content-type", "")
                    if resp.status == 200 and "image" in content_type:
                        found_url = url
                        break
                except Exception as e:
                    print(f"[ERROR] {url} - {e}")

            if found_url:
                mapping[pid] = found_url
                print(f"[SUCCESS] {pid} -> {found_url}")
            else:
                print(f"[FAIL] Could not find logo for {pid}")

        await browser.close()

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for pid in sorted(mapping.keys()):
            f.write(f"{pid}={mapping[pid]}\n")

    print(f"Wrote {len(mapping)} mappings to: {OUTPUT_PATH}")

if __name__ == "__main__":
    asyncio.run(crawl_logos())
