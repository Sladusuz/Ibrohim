import math, random, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
import imageio_ffmpeg

BASE = "/tmp/claude-0/-home-user-Ibrohim/f9781732-fb41-582f-950c-1c876da197d0"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Ibrohim/sladus_reels.mp4"
W, H, FPS = 1080, 1920, 30
GOLD = (222, 184, 92)
GOLD_L = (250, 226, 150)
CREAM = (255, 247, 232)

FS = "/usr/share/fonts/truetype/liberation/"
def font(name, size): return ImageFont.truetype(FS + name, size)
F_LOGO = font("LiberationSerif-Bold.ttf", 150)
F_TITLE = font("LiberationSerif-Bold.ttf", 92)
F_SUB = font("LiberationSerif-Italic.ttf", 48)
F_SMALL = font("LiberationSans-Bold.ttf", 34)
F_TAG = font("LiberationSerif-Italic.ttf", 58)

def ease(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3
def clamp(x): return max(0.0, min(1.0, x))

def load(n): return Image.open(f"{BASE}/images/{n}").convert("RGB")

def cover(img, w, h):
    return ImageOps.fit(img, (w, h), Image.LANCZOS)

def bg_from(img):
    b = cover(img, W // 4, H // 4).filter(ImageFilter.GaussianBlur(10)).resize((W, H), Image.BILINEAR)
    return Image.blend(b, Image.new("RGB", (W, H), (15, 9, 5)), 0.55)

def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    return m

# gold dust particles
random.seed(7)
PARTS = [(random.uniform(0, W), random.uniform(0, H), random.uniform(1.5, 5), random.uniform(20, 70),
          random.uniform(0, 6.28)) for _ in range(70)]

def particles(canvas, t, strength=1.0):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x, y, r, sp, ph in PARTS:
        yy = (y - sp * t) % H
        xx = x + 18 * math.sin(t * 0.8 + ph)
        a = int(strength * (110 + 110 * math.sin(t * 2 + ph)))
        d.ellipse((xx - r, yy - r, xx + r, yy + r), fill=GOLD_L + (max(0, a),))
    glow = layer.filter(ImageFilter.GaussianBlur(3))
    canvas.alpha_composite(glow)
    canvas.alpha_composite(layer)

def text_center(canvas, txt, fnt, y, color, alpha=1.0, glow=True, spacing=0, dy=0):
    if alpha <= 0: return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if spacing:
        widths = [d.textlength(c, font=fnt) + spacing for c in txt]
        x = (W - sum(widths) + spacing) / 2
        for c, w in zip(txt, widths):
            d.text((x, y + dy), c, font=fnt, fill=color + (255,)); x += w
    else:
        tw = d.textlength(txt, font=fnt)
        d.text(((W - tw) / 2, y + dy), txt, font=fnt, fill=color + (255,))
    if glow:
        g = layer.filter(ImageFilter.GaussianBlur(14))
        ga = g.getchannel("A").point(lambda v: int(v * 0.8 * alpha))
        g.putalpha(ga); canvas.alpha_composite(g)
    layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(layer)

def gold_line(canvas, y, half, alpha=1.0):
    if half <= 0: return
    d = ImageDraw.Draw(canvas)
    d.line((W / 2 - half, y, W / 2 + half, y), fill=GOLD + (int(255 * alpha),), width=3)

# ---------- scenes ----------
INTRO_BG = Image.new("RGB", (W, H))
g = np.linspace(0, 1, H)[:, None]
r = np.sqrt(((np.arange(W) - W / 2) / W) ** 2 + ((np.arange(H)[:, None] - H * 0.45) / H) ** 2)
arr = np.clip(np.stack([60 - 140 * r, 38 - 90 * r, 18 - 45 * r], -1), 0, 255).astype(np.uint8)
INTRO_BG = Image.fromarray(arr, "RGB")

def intro(t, dur):
    c = INTRO_BG.convert("RGBA")
    particles(c, t, clamp(t / 1.0))
    p = ease(t / 1.3)
    text_center(c, "SLADUS", F_LOGO, 760, GOLD_L, alpha=p, spacing=int(40 - 25 * p))
    gold_line(c, 950, 320 * ease((t - 0.8) / 1.0))
    text_center(c, "World of Sweet Perfection", F_TAG, 990, CREAM, alpha=ease((t - 1.3) / 0.9), dy=30 * (1 - ease((t - 1.3) / 0.9)))
    return c

PRODUCTS = [
    ("1.webp", "Bisraro Buni", "Yumshoq shokolad — har kuni zavq", (0.02, 0.10)),
    ("3.jpg", "Sladus Duo Milk", "Sut va shokolad uyg'unligi", (0.0, 0.06)),
    ("4.webp", "Fantos & Bunibi", "Kakao ta'mi, ichida mayin krem", (0.10, 0.02)),
    ("2.webp", "Dolor", "Bayram va omad kayfiyati", (0.06, 0.0)),
]
PRE = []
for fn, name, sub, drift in PRODUCTS:
    img = load(fn)
    iw, ih = img.size
    fw = 960; fh = int(min(1240, fw * ih / iw))
    PRE.append(dict(img=img, bg=bg_from(img), fw=fw, fh=fh, name=name, sub=sub, drift=drift,
                    mask=rounded_mask(fw, fh, 36)))

SHADOW_CACHE = {}
def shadow(fw, fh):
    k = (fw, fh)
    if k not in SHADOW_CACHE:
        s = Image.new("RGBA", (fw + 160, fh + 160), (0, 0, 0, 0))
        ImageDraw.Draw(s).rounded_rectangle((80, 95, 80 + fw, 95 + fh), 40, fill=(0, 0, 0, 170))
        SHADOW_CACHE[k] = s.filter(ImageFilter.GaussianBlur(30))
    return SHADOW_CACHE[k]

def product(idx):
    P = PRE[idx]
    def render(t, dur):
        prog = t / dur
        # background slow zoom
        bz = 1.0 + 0.06 * prog
        bw, bh = int(W * bz), int(H * bz)
        bg = P["bg"].resize((bw, bh), Image.BILINEAR).crop(((bw - W) // 2, (bh - H) // 2, (bw - W) // 2 + W, (bh - H) // 2 + H))
        c = bg.convert("RGBA")
        particles(c, t + idx * 3, 0.7)
        # foreground Ken Burns: crop window of source
        img = P["img"]; iw, ih = img.size
        fw, fh = P["fw"], P["fh"]
        z = 1.0 + 0.12 * ease(prog * 1.1)
        cw, ch = iw / z, (iw / z) * fh / fw
        if ch > ih / z * 1.0001 and ch > ih: ch = ih; cw = ch * fw / fh
        dx, dy = P["drift"]
        cx = (iw - cw) / 2 + (iw - cw) / 2 * (dx * 8) * (prog - 0.5)
        cy = (ih - ch) / 2 + (ih - ch) / 2 * (dy * 8) * (prog - 0.5)
        cx = max(0, min(iw - cw, cx)); cy = max(0, min(ih - ch, cy))
        fg = img.resize((fw, fh), Image.LANCZOS, box=(cx, cy, cx + cw, cy + ch))
        # entrance: rise + scale
        e = ease(t / 0.9)
        top = int(250 + (1240 - fh) / 2 * 0.3 + 60 * (1 - e))
        x0 = (W - fw) // 2
        sh = shadow(fw, fh)
        sa = sh.copy(); sa.putalpha(sa.getchannel("A").point(lambda v: int(v * e)))
        c.alpha_composite(sa, (x0 - 80, top - 80))
        fga = fg.convert("RGBA")
        fga.putalpha(P["mask"].point(lambda v: int(v * e)))
        c.alpha_composite(fga, (x0, top))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((x0 - 2, top - 2, x0 + fw + 1, top + fh + 1), 38, outline=GOLD + (int(230 * e),), width=3)
        # shine sweep across card
        sp = (t - 0.6) / 1.2
        if 0 < sp < 1:
            sw = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
            sx = int(-300 + (fw + 600) * sp)
            ImageDraw.Draw(sw).polygon([(sx, 0), (sx + 120, 0), (sx - 180, fh), (sx - 300, fh)], fill=(255, 245, 210, 70))
            sw = sw.filter(ImageFilter.GaussianBlur(25))
            sw.putalpha(Image.composite(sw.getchannel("A"), Image.new("L", (fw, fh), 0), P["mask"]))
            c.alpha_composite(sw, (x0, top))
        # texts
        text_center(c, "S L A D U S", F_SMALL, 140, GOLD, alpha=ease(t / 0.8), glow=False)
        ty = top + fh + 70
        a1 = ease((t - 0.5) / 0.7)
        text_center(c, P["name"], F_TITLE, ty, GOLD_L, alpha=a1, dy=40 * (1 - a1))
        gold_line(c, ty + 128, 200 * ease((t - 0.9) / 0.6))
        a2 = ease((t - 1.0) / 0.7)
        text_center(c, P["sub"], F_SUB, ty + 155, CREAM, alpha=a2, glow=False, dy=30 * (1 - a2))
        return c
    return render

GRID = [cover(p["img"], 470, 470) for p in PRE]
GMASK = rounded_mask(470, 470, 30)
def outro(t, dur):
    c = INTRO_BG.convert("RGBA")
    particles(c, t + 20, 1.0)
    pos = [(60, 330), (550, 330), (60, 820), (550, 820)]
    for i, (im, (x, y)) in enumerate(zip(GRID, pos)):
        e = ease((t - i * 0.18) / 0.6)
        if e <= 0: continue
        s = int(470 * (0.8 + 0.2 * e))
        tile = im.resize((s, s), Image.LANCZOS).convert("RGBA")
        tile.putalpha(GMASK.resize((s, s)).point(lambda v: int(v * e)))
        off = (470 - s) // 2
        c.alpha_composite(tile, (x + off, y + off))
        ImageDraw.Draw(c).rounded_rectangle((x + off, y + off, x + off + s, y + off + s), 30, outline=GOLD + (int(220 * e),), width=3)
    a = ease((t - 1.0) / 0.9)
    text_center(c, "SLADUS", F_LOGO, 1370, GOLD_L, alpha=a, dy=40 * (1 - a))
    gold_line(c, 1560, 300 * ease((t - 1.5) / 0.8))
    b = ease((t - 1.8) / 0.9)
    text_center(c, "Har bir bo'lakda — mukammallik.", F_TAG, 1600, CREAM, alpha=b, dy=30 * (1 - b))
    # fade to gold light at end
    fl = clamp((t - (dur - 0.8)) / 0.8)
    if fl > 0:
        c = Image.blend(c, Image.new("RGBA", (W, H), (255, 236, 190, 255)), fl * 0.85)
    return c

XF = 0.6
TIMELINE = [(intro, 3.6)] + [(product(i), 4.6) for i in range(4)] + [(outro, 5.0)]
starts = []; s = 0.0
for fn, d in TIMELINE:
    starts.append(s); s += d - XF
TOTAL = s + XF

def frame(T):
    active = [(fn, T - st, d) for (fn, d), st in zip(TIMELINE, starts) if st <= T < st + d]
    if len(active) == 1:
        fn, t, d = active[0]; return fn(t, d)
    (f1, t1, d1), (f2, t2, d2) = active[:2]
    a, b = f1(t1, d1), f2(t2, d2)
    return Image.blend(a, b, ease(t2 / XF))

ff = imageio_ffmpeg.get_ffmpeg_exe()
n = int(TOTAL * FPS)
proc = subprocess.Popen([ff, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                         "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
only = [float(x) for x in sys.argv[2:]]
if only:
    for T in only: frame(T).convert("RGB").save(f"{BASE}/scratchpad/f_{T}.jpg")
    proc.stdin.close(); proc.wait(); sys.exit()
for i in range(n):
    proc.stdin.write(frame(i / FPS).convert("RGB").tobytes())
    if i % 90 == 0: print(f"{i}/{n}", flush=True)
proc.stdin.close(); proc.wait()
print("done", TOTAL, "s")
