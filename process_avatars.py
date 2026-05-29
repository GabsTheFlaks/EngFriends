import os
import glob
from PIL import Image

src_dir = r"C:\Users\Gab\.gemini\antigravity\brain\6f6d92b0-2f20-4bd9-87cc-0394c1ea7143"
dest_dir = r"C:\Users\Gab\.gemini\antigravity\scratch\EngFriends\public\avatars"
os.makedirs(dest_dir, exist_ok=True)

# get all uni_student images and the middle ground 3d one
images = glob.glob(os.path.join(src_dir, "uni_student_*.png"))
images.extend(glob.glob(os.path.join(src_dir, "avatar_middle_ground_3d_*.png")))

count = 1
for img_path in images:
    with Image.open(img_path) as img:
        width, height = img.size

        # Crop square focused on the center-top (where the face usually is)
        crop_size = min(width, height) * 0.7

        left = (width - crop_size) / 2
        top = (height - crop_size) * 0.35  # slightly above center
        right = (width + crop_size) / 2
        bottom = top + crop_size

        img_cropped = img.crop((left, top, right, bottom))
        img_resized = img_cropped.resize((256, 256), Image.Resampling.LANCZOS)

        # Save as avatar_1.png, avatar_2.png, etc.
        dest_path = os.path.join(dest_dir, f"avatar_{count}.png")
        img_resized.save(dest_path)
        print(f"Saved {dest_path}")
        count += 1

print(f"Total processed: {count-1}")
