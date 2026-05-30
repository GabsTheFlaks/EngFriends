import os

folder = r"C:\Users\Gab\.gemini\antigravity\scratch\EngFriends\public\avatars"
for i in range(1, 11):
    old_name = f"avatar_{i}.png"
    new_name = f"avatar_{i-1}.png"
    old_path = os.path.join(folder, old_name)
    new_path = os.path.join(folder, new_name)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
print("Renamed successfully")
