import json
import os

# Load crawled images
crawled_path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\auth_crawled_images.json'
with open(crawled_path, 'r', encoding='utf-8') as f:
    crawled_images = json.load(f)

# Load full game list
game_list_path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\full_game_list_real.json'
with open(game_list_path, 'r', encoding='utf-8') as f:
    game_list_data = json.load(f)

games = game_list_data.get('gameWithTags', {}).get('data', [])
if not games:
    games = game_list_data.get('data', [])

print(f"Loaded {len(games)} games from list.")
print(f"Loaded {len(crawled_images)} crawled images.")

# Create a mapping from Game Name to full SRC
name_to_src = {}
name_to_uuid = {}

for img in crawled_images:
    name = img.get('alt')
    src = img.get('src')
    if name and src:
        uuid = src.split('/')[-1]
        name_to_uuid[name] = uuid
        name_to_src[name] = src
        
        # Also try normalizing name (lowercase)
        name_to_uuid[name.lower()] = uuid
        name_to_src[name.lower()] = src

# Map back to Game ID
mapped_games = []
for game in games:
    # Check all locale names
    found_uuid = None
    found_src = None
    
    names = game.get('gamename', {}).values()
    
    for name in names:
        if name and name in name_to_uuid:
            found_uuid = name_to_uuid[name]
            found_src = name_to_src[name]
            break
        if name and name.lower() in name_to_uuid:
            found_uuid = name_to_uuid[name.lower()]
            found_src = name_to_src[name.lower()]
            break
            
    if found_uuid:
        mapped_games.append({
            "gameid": game.get('gameid'),
            "gamename": game.get('gamename', {}).get('vi-VN', 'Unknown'),
            "provider": game.get('gameprovidername'),
            "uuid": found_uuid,
            "full_url": found_src
        })

print(f"Successfully mapped {len(mapped_games)} games.")

# Save mapping
output_path = r'd:\Tool\WEB\LOVABLE\Y1\Y3\_debug\game_uuid_mapping.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(mapped_games, f, ensure_ascii=False, indent=2)

print(f"Saved mapping to {output_path}")

# Print samples
for g in mapped_games[:5]:
    print(f"- {g['gamename']} ({g['gameid']}) -> {g['uuid']}")
