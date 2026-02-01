import json

path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_api_responses.json'
with open(path, 'r', encoding='utf-8') as f:
    responses = json.load(f)

for r in responses:
    if "games/tags" in r['url']:
        print(f"URL: {r['url']}")
        print(json.dumps(r['data'], indent=2, ensure_ascii=False)[:2000])
        print("-" * 80)
