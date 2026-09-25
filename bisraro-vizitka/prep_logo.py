"""Asl logodan (logo-original.webp) oq fonni olib tashlab, aniq doira shaklidagi shaffof PNG yasaydi."""
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

src = Image.open('logo-original.webp').convert('RGB')
a = np.asarray(src).astype(np.float32)
diff = np.abs(a - 255).sum(2)                   # oqdan farqi
# tashqi oq maydon: chetdan boshlab oqqa yaqin, bir-biriga ulangan piksellar
lab, _ = ndimage.label(diff < 45)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
outside = np.isin(lab, list(border))
inside = ~outside
inside = ndimage.binary_fill_holes(inside)
# yumshoq chet: tashqi chegaradan 3 px ichkarigacha oqlikka qarab alfa
dist_in = ndimage.distance_transform_edt(inside)
alpha = np.clip(dist_in / 3.0, 0, 1)
edge = (dist_in > 0) & (dist_in < 3)
alpha[edge] = np.maximum(alpha[edge] * 0.4, np.clip(diff[edge] / 120.0, 0, 1))
# oq "halo" ni olib tashlash (un-premultiply white)
al = np.clip(alpha, 1e-3, 1)[..., None]
rgb = np.clip((a - (1 - al) * 255) / al, 0, 255)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
img = Image.fromarray(rgba, 'RGBA')
ys, xs = np.nonzero(alpha > .5)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
print('bbox', box, 'w', box[2] - box[0], 'h', box[3] - box[1])
img = img.crop(box)
S = 1200
img = img.resize((S, S), Image.LANCZOS)          # ozgina ellipslikni aniq doiraga keltirish
# aniq doira niqobi (4x supersample, silliq chet)
m = Image.new('L', (S * 4, S * 4), 0)
from PIL import ImageDraw
ImageDraw.Draw(m).ellipse((6, 6, S * 4 - 7, S * 4 - 7), fill=255)
m = m.resize((S, S), Image.LANCZOS)
al = Image.fromarray(np.minimum(np.asarray(img.getchannel('A')), np.asarray(m)))
img.putalpha(al)
rgb = img.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
rgb.putalpha(al)
rgb.save('logo-bisraro.png', optimize=True)
print('saved', rgb.size)
