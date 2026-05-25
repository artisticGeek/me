"""
Generates og-image.png — the social-preview card shown on LinkedIn,
WhatsApp, Twitter, Slack, etc. when sharing https://agampreetsingh.me.
Standard size: 1200x630.
"""
from PIL import Image, ImageDraw, ImageFont
import os

base = r"D:\SeriousProjects\me\agampreet-site"
logo_src = os.path.join(base, "favicon_refined.png")
out = os.path.join(base, "og-image.png")

W, H = 1200, 630
PAPER  = (255, 246, 235)  # --paper
INK    = (46, 42, 36)     # --ink
ACCENT = (138, 106, 53)   # --accent
SOFT   = (108, 98, 84)    # --ink-soft

img = Image.new("RGB", (W, H), PAPER)
draw = ImageDraw.Draw(img)

# Subtle accent stripe down the left edge
draw.rectangle((0, 0, 8, H), fill=ACCENT)

# Paste logo on the left
logo = Image.open(logo_src).convert("RGBA")
logo_size = 360
logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
logo_x = 90
logo_y = (H - logo_size) // 2
img.paste(logo, (logo_x, logo_y), logo)

# Fonts — fall back gracefully
def font(name, size, italic=False, bold=False):
    candidates = []
    if italic and bold: candidates += [f"{name} Bold Italic.ttf", f"{name}bi.ttf"]
    if italic: candidates += [f"{name} Italic.ttf", f"{name}i.ttf", f"{name}-Italic.ttf"]
    if bold:   candidates += [f"{name} Bold.ttf",   f"{name}b.ttf", f"{name}-Bold.ttf"]
    candidates += [f"{name}.ttf", f"{name}-Regular.ttf"]
    for c in candidates:
        for d in [r"C:\Windows\Fonts", os.path.join(os.environ.get("LOCALAPPDATA",""), "Microsoft", "Windows", "Fonts")]:
            p = os.path.join(d, c)
            if os.path.exists(p):
                try: return ImageFont.truetype(p, size)
                except: pass
    return ImageFont.load_default()

f_name    = font("georgia", 66, bold=True)
f_kicker  = font("georgia", 30, italic=True)
f_meta    = font("arial",   22)
f_chip    = font("arial",   18, bold=True)

text_x = logo_x + logo_size + 70
text_y = 150

# Eyebrow chip
chip_text = "AGAMPREETSINGH.ME"
chip_w = draw.textlength(chip_text, font=f_chip)
draw.rectangle((text_x, text_y, text_x + chip_w + 28, text_y + 36), fill=ACCENT)
draw.text((text_x + 14, text_y + 5), chip_text, font=f_chip, fill=PAPER)

# Name
text_y += 70
draw.text((text_x, text_y), "Agampreet Singh", font=f_name, fill=INK)

# Kicker (italic accent)
text_y += 100
draw.text((text_x, text_y), "Software Engineer · ~8 Years", font=f_kicker, fill=ACCENT)

# Description
text_y += 60
draw.text((text_x, text_y), "Backend Systems & Platform Architecture", font=f_meta, fill=SOFT)
text_y += 36
draw.text((text_x, text_y), "DP World · BlackRock · Deutsche Telekom", font=f_meta, fill=SOFT)

# Thin rule near the bottom
draw.line((text_x, H - 90, W - 90, H - 90), fill=ACCENT, width=2)

img.save(out, "PNG", optimize=True)
print(f"Created: og-image.png ({os.path.getsize(out)//1024} KB, {W}x{H})")
