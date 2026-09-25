import cv2
import os
import json
import math
import numpy as np
from PIL import Image

def preprocess():
    video_path = "public/character.mp4"
    output_dir = "public/frames"
    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video at {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"Source Video: {width}x{height}, {fps} FPS, {total_frames} frames, {duration:.2f}s duration")

    frames = []
    bg_samples = []

    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
        # Sample border pixels (excluding bottom where suit is)
        h, w, _ = frame.shape
        bg_samples.append(frame[2, :])
        bg_samples.append(frame[:, 2])
        bg_samples.append(frame[:, w - 3])

    cap.release()
    print(f"Read {len(frames)} frames from video.")

    # Calculate background color
    bg_samples = np.concatenate(bg_samples, axis=0) # BGR
    median_bgr = np.median(bg_samples, axis=0).astype(int)
    # Convert BGR to RGB
    bg_rgb = [int(median_bgr[2]), int(median_bgr[1]), int(median_bgr[0])]
    bg_hex = f"#{bg_rgb[0]:02x}{bg_rgb[1]:02x}{bg_rgb[2]:02x}"
    print(f"Calculated Background: RGB={bg_rgb}, Hex={bg_hex}")

    # Extract all frames as optimized WebP
    print("Exporting optimized WebP frames with seamless boundary...")
    frame_files = []
    total_bytes = 0

    target_bg_bgr = np.array([8, 9, 206], dtype=float) # BGR for #ce0908
    blend_w = 8
    w_line = np.linspace(0, 1, blend_w)

    for i, frame in enumerate(frames):
        filename = f"frame-{i:03d}.webp"
        filepath = os.path.join(output_dir, filename)

        f_copy = frame.copy()
        h, w, _ = f_copy.shape

        # Feather left and right edges
        for x in range(blend_w):
            factor = w_line[x]
            f_copy[:, x] = np.clip((1 - factor) * target_bg_bgr + factor * f_copy[:, x], 0, 255).astype(np.uint8)
            f_copy[:, w - 1 - x] = np.clip((1 - factor) * target_bg_bgr + factor * f_copy[:, w - 1 - x], 0, 255).astype(np.uint8)

        # Feather top edge
        for y in range(blend_w):
            factor = w_line[y]
            f_copy[y, :] = np.clip((1 - factor) * target_bg_bgr + factor * f_copy[y, :], 0, 255).astype(np.uint8)

        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(f_copy, cv2.COLOR_BGR2RGB)
        im = Image.fromarray(rgb_frame)
        
        # Save as optimized WebP
        im.save(filepath, "WEBP", quality=88, method=6)
        file_size = os.path.getsize(filepath)
        total_bytes += file_size
        frame_files.append(filename)

    # Save copy of center frame (using feathered frame-170)
    center_frame_idx = 170
    center_filename = "frame-center.webp"
    center_filepath = os.path.join(output_dir, center_filename)
    f_center = frames[center_frame_idx].copy()
    h, w, _ = f_center.shape
    for x in range(blend_w):
        factor = w_line[x]
        f_center[:, x] = np.clip((1 - factor) * target_bg_bgr + factor * f_center[:, x], 0, 255).astype(np.uint8)
        f_center[:, w - 1 - x] = np.clip((1 - factor) * target_bg_bgr + factor * f_center[:, w - 1 - x], 0, 255).astype(np.uint8)
    for y in range(blend_w):
        factor = w_line[y]
        f_center[y, :] = np.clip((1 - factor) * target_bg_bgr + factor * f_center[y, :], 0, 255).astype(np.uint8)

    rgb_center = cv2.cvtColor(f_center, cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb_center).save(center_filepath, "WEBP", quality=90, method=6)

    avg_kb = (total_bytes / len(frames)) / 1024
    total_mb = total_bytes / (1024 * 1024)
    print(f"Exported {len(frames)} WebP frames. Total size: {total_mb:.2f} MB (Average: {avg_kb:.1f} KB/frame).")

    # Keypoints for angle interpolation
    # Format: [angle_in_radians, unwrapped_frame_index]
    keypoints = [
        [-math.pi, 136.0],        # Left
        [-3*math.pi/4, 152.0],    # Up-Left
        [-math.pi/2, 168.0],      # Up (164 + 4)
        [-math.pi/4, 194.0],      # Up-Right (164 + 30)
        [0.0, 222.0],             # Right (164 + 58)
        [math.pi/4, 246.0],       # Down-Right (164 + 82)
        [math.pi/2, 266.0],       # Down (164 + 102)
        [3*math.pi/4, 282.0],     # Down-Left (164 + 118)
        [math.pi, 300.0]          # Left (164 + 136)
    ]

    # Precompute a high-precision angle-to-frame table (720 entries, one for every 0.5 deg)
    table_size = 720
    angle_table = []
    for step in range(table_size):
        # Angle from -pi to +pi
        angle = -math.pi + (2.0 * math.pi * step) / table_size
        # Interpolate
        f_idx = 136
        for k in range(len(keypoints) - 1):
            a1, f1 = keypoints[k]
            a2, f2 = keypoints[k+1]
            if a1 <= angle <= a2:
                t = (angle - a1) / (a2 - a1)
                f_idx = int(round(f1 + t * (f2 - f1))) % 164
                break
        angle_table.append(f_idx)

    manifest = {
        "sourceVideo": "public/character.mp4",
        "dimensions": {
            "width": width,
            "height": height
        },
        "fps": fps,
        "totalVideoFrames": total_frames,
        "directionalFramesCount": 164,
        "centerFrameIndex": center_frame_idx,
        "centerFrameFile": center_filename,
        "backgroundColor": {
            "rgb": bg_rgb,
            "hex": bg_hex,
            "css": f"rgb({bg_rgb[0]}, {bg_rgb[1]}, {bg_rgb[2]})"
        },
        "keypoints": [
            {"name": "up", "angleDeg": -90, "angleRad": -math.pi/2, "frame": 4},
            {"name": "up-right", "angleDeg": -45, "angleRad": -math.pi/4, "frame": 30},
            {"name": "right", "angleDeg": 0, "angleRad": 0.0, "frame": 58},
            {"name": "down-right", "angleDeg": 45, "angleRad": math.pi/4, "frame": 82},
            {"name": "down", "angleDeg": 90, "angleRad": math.pi/2, "frame": 102},
            {"name": "down-left", "angleDeg": 135, "angleRad": 3*math.pi/4, "frame": 118},
            {"name": "left", "angleDeg": 180, "angleRad": math.pi, "frame": 136},
            {"name": "up-left", "angleDeg": -135, "angleRad": -3*math.pi/4, "frame": 152},
            {"name": "center", "angleDeg": None, "angleRad": None, "frame": 170}
        ],
        "keypointInterpolation": keypoints,
        "angleTable": angle_table,
        "deadzoneRadiusRatio": 0.12,
        "lerpAmount": 0.25
    }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest written to {manifest_path}")

if __name__ == "__main__":
    preprocess()
