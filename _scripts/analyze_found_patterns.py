import json
import os
from urllib.parse import urlparse

INPUT_FILE = "d:/Tool/WEB/LOVABLE/Y1/Y3/_debug/homepage_images.json"

def analyze():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        images = json.load(f)
        
    patterns = {}
    
    for img in images:
        src = img.get('src', '')
        if not src: continue
        
        parsed = urlparse(src)
        path = parsed.path
        
        # Generalize path (replace UUIDs with {UUID}, numbers with {ID})
        parts = path.split('/')
        generalized_parts = []
        for p in parts:
            if len(p) > 20 and '-' in p: # Likely UUID
                generalized_parts.append('{UUID}')
            elif p.isdigit():
                generalized_parts.append('{ID}')
            else:
                generalized_parts.append(p)
                
        pattern = f"{parsed.netloc}{'/'.join(generalized_parts)}"
        
        if pattern not in patterns:
            patterns[pattern] = []
        patterns[pattern].append(src)
        
    print(f"Found {len(patterns)} unique URL patterns:\n")
    for pat, samples in patterns.items():
        print(f"Pattern: {pat}")
        print(f"Count: {len(samples)}")
        print(f"Sample: {samples[0]}")
        print("-" * 50)

if __name__ == "__main__":
    analyze()
