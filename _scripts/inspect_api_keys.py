import json
import re
from collections import Counter, defaultdict

RESP_PATH = r"d:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_api_responses.json"

KEY_MATCH_RE = re.compile(r"img|image|icon|logo|cover|thumbnail", re.IGNORECASE)
UUID_RE = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")

with open(RESP_PATH, "r", encoding="utf-8") as f:
    responses = json.load(f)

key_counts = Counter()
by_url_examples = defaultdict(list)


def walk(obj, path="$"):
    if isinstance(obj, dict):
        for k, v in obj.items():
            k_str = str(k)
            if KEY_MATCH_RE.search(k_str):
                key_counts[k_str] += 1
                if len(by_url_examples[current_url]) < 6:
                    by_url_examples[current_url].append((f"{path}.{k_str}", v))
            walk(v, f"{path}.{k_str}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj[:200]):
            walk(v, f"{path}[{i}]")


def has_uuid_or_url(v):
    s = str(v)
    return ("http" in s) or (UUID_RE.search(s) is not None)

for r in responses:
    current_url = r.get("url", "")
    walk(r.get("data"))

print("Top matched keys:")
for k, c in key_counts.most_common(30):
    print(f"- {k}: {c}")

print("\nEndpoints with examples (filtered by UUID/URL-like values):")
for url, examples in sorted(by_url_examples.items(), key=lambda x: x[0]):
    ex2 = [(p, v) for p, v in examples if has_uuid_or_url(v)]
    if not ex2:
        continue
    print(f"\n{url}")
    for p, v in ex2[:8]:
        s = json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else str(v)
        s = s.replace("\n", " ")
        print(f"  - {p} = {s[:260]}")
