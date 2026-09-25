import cv2
import os
import json
import numpy as np
from PIL import Image

def analyze_video(video_path="public/character.mp4"):
    if not os.path.exists(video_path):
        print(f"Error: {video_path} does not exist.")
        return

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps if fps > 0 else 0

    print("=== Video Information ===")
    print(f"Resolution: {width}x{height}")
    print(f"FPS: {fps}")
    print(f"Total Frames: {total_frames}")
    print(f"Duration: {duration:.2f} seconds")

    # Sample corners for background color detection
    bg_samples = []
    frames = []
    
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
        
        # Sample corners: top-left (10, 10), top-right (w-10, 10), bottom-left (10, h-10), bottom-right (w-10, h-10)
        h, w, _ = frame.shape
        c1 = frame[10, 10]
        c2 = frame[10, w - 10]
        c3 = frame[h - 10, 10]
        c4 = frame[h - 10, w - 10]
        bg_samples.extend([c1, c2, c3, c4])
        idx += 1

    cap.release()

    # BGR to RGB
    bg_samples = np.array(bg_samples) # BGR
    mean_bgr = np.median(bg_samples, axis=0).astype(int)
    mean_rgb = [int(mean_bgr[2]), int(mean_bgr[1]), int(mean_bgr[0])]
    hex_color = f"#{mean_rgb[0]:02x}{mean_rgb[1]:02x}{mean_rgb[2]:02x}"
    print(f"Detected Background Color: RGB({mean_rgb[0]}, {mean_rgb[1]}, {mean_rgb[2]}) | Hex: {hex_color}")

    # Save metadata
    meta = {
        "width": width,
        "height": height,
        "fps": fps,
        "total_frames": len(frames),
        "duration": duration,
        "background_rgb": mean_rgb,
        "background_hex": hex_color
    }

    with open("public/video_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    return frames, meta

if __name__ == "__main__":
    analyze_video()
