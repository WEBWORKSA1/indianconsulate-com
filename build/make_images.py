#!/usr/bin/env python3
"""Generate assets/img/og-image.png and icon-512.png (run in CI; needs Pillow)."""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
os.makedirs(IMG, exist_ok=True)

def font(name, size):
    for d in ("/usr/share/fonts/truetype/dejavu/", "/usr/share/fonts/dejavu/"):
        if os.path.exists(d + name):
            return ImageFont.truetype(d + name, size)
    return ImageFont.load_default(size=size)

def logo(d, x, y, s):
    d.rounded_rectangle([x, y, x + s, y + s], radius=int(s * .27), fill="#0e2a47")
    u = s / 36
    d.rectangle([x + 11 * u, y + 10 * u, x + 15 * u, y + 26 * u], fill="#e8871e")
    d.arc([x + 13 * u, y + 12.5 * u, x + 28 * u, y + 27.5 * u], start=40, end=320, fill="#ffffff", width=max(2, int(3.6 * u)))

W, H = 1200, 630
im = Image.new("RGB", (W, H), "#f7f4ee"); d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, 14], fill="#e8871e"); d.rectangle([0, H - 14, W, H], fill="#0f766e")
logo(d, 80, 90, 120)
d.text((230, 105), "IndianConsulate.com", font=font("DejaVuSans-Bold.ttf", 58), fill="#0e2a47")
d.text((232, 180), "Independent consular services guide", font=font("DejaVuSans.ttf", 30), fill="#5b6876")
for i, line in enumerate(["OCI & e-OCI · Passport renewal abroad", "India e-Visa · Surrender certificates", "Attestation · PCC · Emergencies"]):
    d.text((80, 290 + 65 * i), line, font=font("DejaVuSerif-Bold.ttf", 48), fill="#0e2a47")
d.text((80, 520), "Free guides & tools · Not a government website", font=font("DejaVuSans.ttf", 28), fill="#0f766e")
im.save(os.path.join(IMG, "og-image.png"), optimize=True)
ic = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); logo(ImageDraw.Draw(ic), 16, 16, 480)
ic.save(os.path.join(IMG, "icon-512.png"), optimize=True)
print("images ok")
