"""
Generates a high-contrast AR tracking marker optimized for MindAR.
Key principles:
  - Lots of unique features at multiple scales (large shapes + fine detail)
  - Strongly asymmetric (no repeated/symmetric patterns)
  - High contrast black on white
  - Rich corners and edges (where keypoint detectors look first)
"""
from PIL import Image, ImageDraw, ImageFont
import math, random

random.seed(42)
SIZE = 1000
img = Image.new("RGB", (SIZE, SIZE), "white")
d = ImageDraw.Draw(img)

def rnd(a, b): return random.randint(a, b)

# ── Background grid (fine texture for micro features) ──────────────────────
for x in range(0, SIZE, 20):
    for y in range(0, SIZE, 20):
        if (x // 20 + y // 20) % 2 == 0:
            d.rectangle([x, y, x+10, y+10], fill=(230, 230, 230))

# ── Outer frame with irregular notches ─────────────────────────────────────
margin = 30
d.rectangle([margin, margin, SIZE-margin, SIZE-margin], outline="black", width=8)

# Corner brackets (asymmetric sizes)
brackets = [(0,0,80,80), (0,1,60,60), (1,0,70,70), (1,1,90,90)]
corners = [(margin, margin), (SIZE-margin-1, margin),
           (margin, SIZE-margin-1), (SIZE-margin-1, SIZE-margin-1)]
offsets = [(1,1), (-1,1), (1,-1), (-1,-1)]
lengths = [90, 65, 75, 55]
for i, (cx, cy) in enumerate(corners):
    ox, oy = offsets[i]
    L = lengths[i]
    d.line([(cx, cy), (cx + ox*L, cy)], fill="black", width=10)
    d.line([(cx, cy), (cx, cy + oy*L)], fill="black", width=10)

# Edge tick marks (different spacings on each side — key for asymmetry)
for pos in [150, 310, 490, 700, 850]:
    d.rectangle([margin-4, pos-4, margin+12, pos+4], fill="black")
for pos in [200, 400, 620, 820]:
    d.rectangle([SIZE-margin-12, pos-4, SIZE-margin+4, pos+4], fill="black")
for pos in [180, 380, 560, 750, 900]:
    d.rectangle([pos-4, margin-4, pos+4, margin+12], fill="black")
for pos in [250, 450, 680]:
    d.rectangle([pos-4, SIZE-margin-12, pos+4, SIZE-margin+4], fill="black")

# ── Large asymmetric shapes ─────────────────────────────────────────────────
# Top-left: filled triangle
d.polygon([(80,80),(280,120),(100,300)], fill="black")
d.polygon([(90,90),(270,128),(108,288)], fill="white")

# Top-right: solid circle ring
cx, cy, r = 760, 140, 90
d.ellipse([cx-r, cy-r, cx+r, cy+r], fill="black")
d.ellipse([cx-60, cy-60, cx+60, cy+60], fill="white")
d.ellipse([cx-30, cy-30, cx+30, cy+30], fill="black")

# Bottom-left: cross / plus sign
d.rectangle([65, 720, 225, 760], fill="black")
d.rectangle([125, 660, 165, 820], fill="black")

# Bottom-right: jagged star
def star(cx, cy, r1, r2, n, angle_off=0):
    pts = []
    for i in range(n*2):
        angle = math.pi * i / n + angle_off
        r = r1 if i % 2 == 0 else r2
        pts.append((cx + r*math.cos(angle), cy + r*math.sin(angle)))
    return pts

d.polygon(star(820, 820, 90, 45, 7, 0.3), fill="black")
d.polygon(star(820, 820, 55, 28, 7, 0.3), fill="white")

# Center: complex diamond / rotated square
cx, cy = 500, 500
for size, color in [(130,"black"),(100,"white"),(70,"black"),(45,"white"),(22,"black")]:
    d.polygon([(cx,cy-size),(cx+size,cy),(cx,cy+size),(cx-size,cy)], fill=color)

# ── Medium scattered shapes ─────────────────────────────────────────────────
shapes = [
    # (type, args, fill)
    ("rect",  [340, 80, 460, 150], "black"),
    ("rect",  [350, 90, 450, 140], "white"),
    ("ellipse",[180, 380, 290, 460], "black"),
    ("ellipse",[195, 393, 275, 447], "white"),
    ("rect",  [600, 300, 680, 420], "black"),
    ("rect",  [614, 314, 666, 406], "white"),
    ("rect",  [680, 340, 720, 380], "black"),
    ("ellipse",[300, 620, 400, 700], "black"),
    ("ellipse",[315, 635, 385, 685], "white"),
    ("rect",  [550, 700, 660, 760], "black"),
    ("rect",  [562, 712, 648, 748], "white"),
    ("ellipse",[420, 200, 490, 260], "black"),
    ("ellipse",[432, 212, 478, 248], "white"),
    ("rect",  [140, 460, 230, 530], "black"),
    ("rect",  [150, 470, 220, 520], "white"),
]
for shape, args, fill in shapes:
    if shape == "rect":
        d.rectangle(args, fill=fill)
    elif shape == "ellipse":
        d.ellipse(args, fill=fill)

# ── Diagonal lines cluster (top-right quadrant) ───────────────────────────
for i in range(8):
    x0 = 560 + i*18
    d.line([(x0, 200), (x0+60, 320)], fill="black", width=4)

# ── Dot field (bottom-center — small features for fine scale) ─────────────
positions = [
    (410,780),(440,810),(470,780),(500,800),(530,775),(560,810),
    (420,840),(455,860),(490,840),(525,855),(555,830),
    (430,885),(470,900),(510,885),(548,900),
]
for i, (px, py) in enumerate(positions):
    r = 6 + (i % 3)*4
    d.ellipse([px-r, py-r, px+r, py+r], fill="black")

# ── Text labels (very stable features) ────────────────────────────────────
try:
    font_lg = ImageFont.truetype("arial.ttf", 64)
    font_sm = ImageFont.truetype("arial.ttf", 28)
except:
    font_lg = ImageFont.load_default()
    font_sm = ImageFont.load_default()

d.text((370, 430), "AR", fill="white", font=font_lg)
d.text((105, 150), "01", fill="black", font=font_sm)
d.text((840, 650), "7X", fill="black", font=font_sm)
d.text((600, 600), "◆", fill="black", font=font_sm)

# ── Thin detail lines (add micro-features) ────────────────────────────────
line_data = [
    [(240,330),(340,380),(310,440)],
    [(700,460),(740,500),(720,560),(760,580)],
    [(170,590),(250,570),(270,630)],
    [(460,100),(480,180),(520,160)],
]
for pts in line_data:
    d.line(pts, fill="black", width=3)

# Save
out = "public/images/target-0.png"
img.save(out, "PNG")
print(f"Saved {out}  ({SIZE}x{SIZE}px)")
