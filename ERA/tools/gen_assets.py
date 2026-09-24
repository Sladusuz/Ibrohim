import numpy as np, os
from PIL import Image, ImageDraw, ImageFilter

S = os.path.dirname(os.path.abspath(__file__))
OUT = '/home/user/Ibrohim/ERA/public/assets'
os.makedirs(OUT, exist_ok=True)
LW = np.array([.299, .587, .114], np.float32)


def load(p, size=None, crop=None):
    im = Image.open(p).convert('RGB')
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    if size:
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255


def save(a, name, q=80):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(f'{OUT}/{name}', quality=q, optimize=True, progressive=True)


def blur(a, r):
    if a.ndim == 3:
        return np.stack([blur(a[..., i], r) for i in range(a.shape[2])], -1)
    return np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def lumof(a): return (a @ LW)[..., None]


def noise(rng, h, w, r):
    n = blur(rng.random((h, w)).astype(np.float32), r)
    return (n - n.mean()) / (n.std() + 1e-6)


def matte(src, k=1.32):
    l = lumof(src)
    m = l + (src - l) * k
    m = (m - 0.5) * 1.1 + 0.5
    return np.clip(m * np.array([1.04, 1.0, 0.95]), 0, 1)


def gloss(m, mask, k=0.26):
    l = lumof(m)
    g = np.clip((l - 0.25) * 2.6, 0, 1) ** 2.2
    return np.clip(m + g * k * mask * np.array([1, .96, .9]), 0, 1)


def fade(m, amt=1.0):
    l = lumof(m).repeat(3, 2)
    f = m * (1 - .62 * amt) + l * .62 * amt
    f = (f - .5) * (1 - .27 * amt) + .5
    return f * np.array([.96, .94, .92]) + .035 * amt


def stains(rng, h, w, mask, n=1.0):
    blot = noise(rng, h, w, max(h, w) / 55)
    st = np.clip((blot - 0.9) * 1.3, 0, 1) * n
    rings = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(rings)
    ys, xs = np.nonzero(mask[..., 0] > .6)
    for _ in range(int(7 * n)):
        if not len(xs):
            break
        i = rng.integers(len(xs))
        r = rng.uniform(.02, .05) * w
        d.ellipse((xs[i] - r, ys[i] - r * .7, xs[i] + r, ys[i] + r * .7), outline=160, width=max(2, int(w / 500)))
    rg = np.asarray(rings.filter(ImageFilter.GaussianBlur(w / 700))).astype(np.float32) / 255
    return st[..., None] * mask, rg[..., None] * mask


def scratches(rng, h, w, mask, count, box):
    layer = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(layer)
    ys, xs = np.nonzero(mask[..., 0] > .5)
    for _ in range(count):
        if not len(xs):
            break
        i = rng.integers(len(xs))
        x, y = xs[i], ys[i]
        L = rng.uniform(.006, .03) * w
        a = rng.uniform(-.7, .7)
        pts = [(x + t * L * np.cos(a), y + t * L * np.sin(a) + np.sin(t * 3) * L * .08) for t in np.linspace(0, 1, 6)]
        d.line(pts, fill=int(rng.uniform(90, 210)), width=int(rng.integers(1, 3) * max(1, w / 1400)))
    return (np.asarray(layer.filter(ImageFilter.GaussianBlur(.6))).astype(np.float32) / 255)[..., None] * mask


def dust(rng, h, w, mask):
    sp = (rng.random((h, w)) > .982).astype(np.float32)
    sp = blur(sp, .9) * 1.6
    haze = np.clip(noise(rng, h, w, max(h, w) / 40) * .5 + .6, 0, 1)
    return (sp[..., None] * .5 + haze[..., None] * .07) * mask


def edges(mask, r):
    m = mask[..., 0]
    inner = blur(m, r)
    e = np.clip((m - inner) * 3 + np.clip(1 - np.abs(m - .5) * 2, 0, 1) * .5, 0, 1)
    return e[..., None] * (mask > .2)


def compose(base, st=None, rings=None, scr=None, dst=None, scuff=None, rng=None):
    a = base.copy()
    if st is not None:
        a = a * (1 - st * .55) + st * .55 * a * np.array([.55, .5, .42])
    if rings is not None:
        a = a + rings * .16
    if scuff is not None:
        l = lumof(a)
        a = a * (1 - scuff * .8) + scuff * .8 * (l * .5 + .42)
    if scr is not None:
        a = a + scr * .38 * np.array([.95, .9, .85])
    if dst is not None:
        a = a + dst * np.array([.92, .9, .86])
    return np.clip(a, 0, 1)


def blend(src, img, mask):
    return src * (1 - mask) + img * mask


# ============ HERO SHOE: 5 stage images ============
W, H = 1600, 900
src = load(f'{S}/src.jpg', (W, H))
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy, rx, ry = .5 * W, .463 * H, .245 * W, .162 * H
ell = np.clip(1 - (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2), 0, 1)
mask = (np.clip(ell * 3, 0, 1)[..., None] * np.clip((lumof(src) - .07) * 6, 0, 1))
rng = np.random.default_rng(11)
M = matte(src)
st, rg = stains(rng, H, W, mask)
scr = scratches(rng, H, W, mask, 170, None)
dst = dust(rng, H, W, mask)
F = fade(M)
stages = [
    compose(F, st, rg, scr, dst),       # 0 worn
    compose(F, st, rg, scr),            # 1 after brush: dust gone
    compose(fade(M, .8), None, None, scr * .5),  # 2 after cleaning: stains gone
    M,                                   # 3 after cream: colour back
    gloss(M, mask),                      # 4 polished
]
for i, s in enumerate(stages):
    save(blend(src, s, mask), f'shoe-{i}.jpg', 82)

# ============ BAG: 4 stage images ============
bag = load(f'{S}/g-1598532163257-ae3c6b2524b6.jpg', crop=(.08, .2, .96, .92))
bh, bw = bag.shape[:2]
sc = 1000 / bw
bag = np.asarray(Image.fromarray((bag * 255).astype(np.uint8)).resize((1000, int(bh * sc)), Image.LANCZOS)).astype(np.float32) / 255
H2, W2 = bag.shape[:2]
l = lumof(bag)
sat = (bag.max(2) - bag.min(2))[..., None]
bmask = np.clip((sat - .08) * 7, 0, 1) * np.clip((.8 - l) * 5, 0, 1)
bmask = np.clip(blur(bmask, 3) * 1.4, 0, 1)
rng = np.random.default_rng(5)
Mb = matte(bag, 1.12)
st, rg = stains(rng, H2, W2, bmask, 1.4)
scr = scratches(rng, H2, W2, bmask, 120, None)
dst = dust(rng, H2, W2, bmask)
sc_e = edges(bmask, 10) * 0.9 + np.clip(noise(rng, H2, W2, 6) - 1.2, 0, 1)[..., None] * bmask * .6
Fb = fade(Mb)
bst = [
    compose(Fb, st, rg, scr, dst, sc_e),
    compose(fade(Mb, .85), None, None, scr * .6, None, sc_e),
    Mb,
    gloss(Mb, bmask, .2),
]
for i, s in enumerate(bst):
    save(blend(bag, s, bmask), f'bag-{i}.jpg', 82)
print('bag', W2, H2)

# ============ GALLERY before/after ============
def auto_mask(img):
    h, w = img.shape[:2]
    border = np.concatenate([img[:8].reshape(-1, 3), img[-8:].reshape(-1, 3), img[:, :8].reshape(-1, 3), img[:, -8:].reshape(-1, 3)])
    bg = blur(img, 40)
    d = np.sqrt(((img - bg) ** 2).sum(2)) + np.sqrt(((img - np.median(border, 0)) ** 2).sum(2)) * .6
    m = np.clip((d - .09) * 5, 0, 1)
    m = blur(m, 6)
    m = np.clip((m - .15) * 2.2, 0, 1)
    return blur(m, 2)[..., None]


def m_oxford(img):
    l = lumof(img)[..., 0]; sat = img.max(2) - img.min(2)
    return np.clip((sat - .12) * 6, 0, 1) * np.clip((.9 - l) * 5, 0, 1)
def m_jacket(img):
    return np.clip((.42 - lumof(img)[..., 0]) * 5, 0, 1)
def m_brogue(img):
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    return np.clip((g - r) * 7, 0, 1) * np.clip((b - r) * 5 + .3, 0, 1)
G = [
    ('g-1614252235316-8c857d38b5f4.jpg', (.27, 0, .73, 1), 'oxford', m_oxford),
    ('g-1551028719-00167b16eac5.jpg', (0, .04, 1, .96), 'jacket', m_jacket),
    ('g-1560343090-f0409e92791a.jpg', (0, .08, 1, .92), 'brogue', m_brogue),
]
for k, (f, crop, name, mf) in enumerate(G):
    img = load(f'{S}/{f}', crop=crop)
    img = np.asarray(Image.fromarray((img * 255).astype(np.uint8)).resize((800, 1000), Image.LANCZOS)).astype(np.float32) / 255
    h, w = img.shape[:2]
    m = blur(np.clip(blur(mf(img), 2) * 1.3, 0, 1), 1)[..., None]
    rng = np.random.default_rng(20 + k)
    Mg = matte(img, 1.12)
    st, rg = stains(rng, h, w, m, 1.2)
    before = compose(fade(Mg), st, rg, scratches(rng, h, w, m, 90, None), dust(rng, h, w, m), edges(m, 8) * .5)
    save(blend(img, before, m), f'ba-{name}-before.jpg', 80)
    save(blend(img, gloss(Mg, m, .14), m), f'ba-{name}-after.jpg', 80)

print('done')
