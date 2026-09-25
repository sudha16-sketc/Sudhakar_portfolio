import math
import numpy as np

# Key angle calibration: (angle in radians, frame_index in 0..163)
# Note: Math.atan2(dy, dx) returns:
# Right: 0
# Down-Right: +pi/4 (0.7854)
# Down: +pi/2 (1.5708)
# Down-Left: +3pi/4 (2.3562)
# Left: +pi or -pi (3.1416 / -3.1416)
# Up-Left: -3pi/4 (-2.3562)
# Up: -pi/2 (-1.5708)
# Up-Right: -pi/4 (-0.7854)

# Video frame indices:
# Up (-pi/2): 4
# Up-Right (-pi/4): 30
# Right (0): 58
# Down-Right (+pi/4): 82
# Down (+pi/2): 102
# Down-Left (+3pi/4): 118
# Left (pi): 136
# Up-Left (-3pi/4): 152
# Up (-pi/2 wrap): 164 (wraps to 4 via frames 152 -> 163 -> 0 -> 4)

keypoints = [
    (-math.pi, 136),         # Left
    (-3*math.pi/4, 152),     # Up-Left
    (-math.pi/2, 168.0),     # Up (virtual index in unwrapped scale: 164 + 4 = 168)
    (-math.pi/4, 194.0),     # Up-Right (164 + 30 = 194)
    (0, 222.0),              # Right (164 + 58 = 222)
    (math.pi/4, 246.0),      # Down-Right (164 + 82 = 246)
    (math.pi/2, 266.0),      # Down (164 + 102 = 266)
    (3*math.pi/4, 282.0),    # Down-Left (164 + 118 = 282)
    (math.pi, 300.0)         # Left (164 + 136 = 300, which is 136 mod 164)
]

def angle_to_frame(angle):
    # angle is in [-pi, pi]
    # Interpolate along keypoints
    for i in range(len(keypoints) - 1):
        a1, f1 = keypoints[i]
        a2, f2 = keypoints[i+1]
        if a1 <= angle <= a2:
            t = (angle - a1) / (a2 - a1)
            raw_frame = f1 + t * (f2 - f1)
            frame_idx = round(raw_frame) % 164
            return frame_idx
    return 136

# Test mapping for 360 degrees
print("Testing angle to frame mapping:")
angles = [-math.pi, -3*math.pi/4, -math.pi/2, -math.pi/4, 0, math.pi/4, math.pi/2, 3*math.pi/4, math.pi]
labels = ["Left", "Up-Left", "Up", "Up-Right", "Right", "Down-Right", "Down", "Down-Left", "Left"]

for a, lbl in zip(angles, labels):
    print(f"{lbl:12s} ({a:+.3f} rad): frame {angle_to_frame(a)}")

# Check continuity around boundaries
print("\nChecking continuity around -pi/pi boundary:")
print("At -3.14 rad:", angle_to_frame(-3.14))
print("At +3.14 rad:", angle_to_frame(+3.14))
print("Checking continuity around -pi/2 (wrap 163 -> 0):")
print("At -1.65 rad:", angle_to_frame(-1.65))
print("At -1.57 rad (-pi/2):", angle_to_frame(-math.pi/2))
print("At -1.50 rad:", angle_to_frame(-1.50))
