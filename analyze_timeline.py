import cv2
import os
import json
import numpy as np
from PIL import Image

def analyze_timeline():
    cap = cv2.VideoCapture("public/character.mp4")
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    os.makedirs("debug_frames", exist_ok=True)
    
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    print(f"Loaded {len(frames)} frames.")
    
    # Save a contact sheet or sample every 4 frames (e.g. 0, 4, 8, ... 191 = 48 frames)
    # Also let's inspect the character head region:
    # Resolution is 640x360.
    # Where is the character located? Let's find bounding box of non-background pixels.
    bg_color = np.array([7, 8, 200]) # BGR for #c80807
    
    # Let's sample frames and save a grid contact sheet so we can understand the movement
    grid_rows = 12
    grid_cols = 16
    thumb_w, thumb_h = 160, 90
    contact_sheet = Image.new("RGB", (thumb_w * grid_cols, thumb_h * grid_rows))
    
    for i, frame in enumerate(frames):
        row = i // grid_cols
        col = i % grid_cols
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Put frame number on it
        cv2.putText(rgb_frame, f"{i}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        im = Image.fromarray(rgb_frame).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        contact_sheet.paste(im, (col * thumb_w, row * thumb_h))
        
    contact_sheet.save("debug_frames/contact_sheet.jpg", quality=85)
    print("Saved contact sheet to debug_frames/contact_sheet.jpg")

    # Let's also save individual frames at intervals or key timestamps to inspect
    for i in range(0, len(frames), 8):
        rgb_frame = cv2.cvtColor(frames[i], cv2.COLOR_BGR2RGB)
        Image.fromarray(rgb_frame).save(f"debug_frames/frame_{i:03d}.jpg")
        
    print("Saved debug sample frames.")

if __name__ == "__main__":
    analyze_timeline()
