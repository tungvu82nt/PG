import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOUND_IMAGES_PATH = os.path.join(BASE_DIR, '_debug', 'found_images.json')

def check_gplogo():
    if not os.path.exists(FOUND_IMAGES_PATH):
        print("File not found.")
        return

    with open(FOUND_IMAGES_PATH, 'r', encoding='utf-8') as f:
        images = json.load(f)

    print("--- GP Logo Images ---")
    for url in images:
        if 'gplogo' in url:
            print(url)

if __name__ == "__main__":
    check_gplogo()
