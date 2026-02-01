import json
from urllib.parse import urlparse

path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_api_responses.json'
with open(path, 'r', encoding='utf-8') as f:
    responses = json.load(f)

urls = set()
for r in responses:
    parsed = urlparse(r['url'])
    urls.add(parsed.path)

print("Captured API Endpoints:")
for u in sorted(urls):
    print(u)
