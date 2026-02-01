import json
import re
from collections import defaultdict

RESP_PATH = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_api_responses.json"

UUID_RE = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.(?:webp|png|jpg|jpeg|gif)")
FILE_RE = re.compile(r"\b[a-zA-Z0-9_\-]+\.(?:webp|png|jpg|jpeg|gif)\b")

with open(RESP_PATH, "r", encoding="utf-8") as f:
    responses = json.load(f)

by_url = defaultdict(set)
all_matches = set()

for r in responses:
    url = r.get("url", "")
    data = r.get("data")
    blob = json.dumps(data, ensure_ascii=False)

    for m in UUID_RE.findall(blob):
        by_url[url].add(m)
        all_matches.add(m)

print(f"Responses: {len(responses)}")
print(f"UUID+ext matches: {len(all_matches)}")

for url, matches in sorted(by_url.items(), key=lambda x: (-len(x[1]), x[0]))[:20]:
    print(f"\n{len(matches)} matches in {url}")
    for m in sorted(list(matches))[:10]:
        print(f"  - {m}")

# also show non-uuid filenames if any (rare)
by_url2 = defaultdict(set)
all_matches2 = set()
for r in responses:
    url = r.get("url", "")
    data = r.get("data")
    blob = json.dumps(data, ensure_ascii=False)
    for m in FILE_RE.findall(blob):
        if UUID_RE.fullmatch(m):
            continue
        if m.lower() in {"rcb.png"}:
            continue
        by_url2[url].add(m)
        all_matches2.add(m)

print(f"\nNon-UUID filename matches: {len(all_matches2)}")
for url, matches in sorted(by_url2.items(), key=lambda x: (-len(x[1]), x[0]))[:10]:
    print(f"\n{len(matches)} matches in {url}")
    for m in sorted(list(matches))[:10]:
        print(f"  - {m}")
