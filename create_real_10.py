import os
from PIL import Image

src = r"C:\Users\Gab\.gemini\antigravity\brain\6f6d92b0-2f20-4bd9-87cc-0394c1ea7143\media__1780035787649.jpg"
dest = r"C:\Users\Gab\.gemini\antigravity\scratch\EngFriends\public\avatars\avatar_10.png"

with Image.open(src) as img:
    width, height = img.size
    
    # Crop square focused on the center-top
    crop_size = min(width, height) * 0.7
    
    left = (width - crop_size) / 2
    top = (height - crop_size) * 0.35
    right = (width + crop_size) / 2
    bottom = top + crop_size
    
    img_cropped = img.crop((left, top, right, bottom))
    img_resized = img_cropped.resize((256, 256), Image.Resampling.LANCZOS)
    
    img_resized.save(dest)
    print(f"Saved {dest}")
