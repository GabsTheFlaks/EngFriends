import os
from PIL import Image, ImageOps

src = r"C:\Users\Gab\.gemini\antigravity\scratch\EngFriends\public\avatars\avatar_7.png"
dest = r"C:\Users\Gab\.gemini\antigravity\scratch\EngFriends\public\avatars\avatar_10.png"

with Image.open(src) as img:
    # Flip horizontally
    img_flipped = ImageOps.mirror(img)
    img_flipped.save(dest)
    print(f"Saved {dest}")
