import json
from collections import Counter

path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_crawled_images.json'
with open(path, 'r', encoding='utf-8') as f:
    images = json.load(f)

print(f"Total images: {len(images)}")
alts = [img.get('alt', '') for img in images]
print(f"Empty alts: {alts.count('')}")

c = Counter(alts)
print("Top 20 Alts:")
for k, v in c.most_common(20):
    print(f"{k}: {v}")

# Check for specific games
print("\nChecking for specific games:")
for name in ["Kho Báu Aztec", "Đường Mạt Chược", "Nổ Hũ"]:
    count = alts.count(name)
    print(f"{name}: {count}")
