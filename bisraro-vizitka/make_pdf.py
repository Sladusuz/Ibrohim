"""out/ dagi PNG rasmlardan aniq o'lchamli, siqilmagan (lossless) PDF'lar va umumiy ko'rinish rasmini yig'adi."""
import json, pymupdf
from PIL import Image, ImageDraw, ImageFont
MM = 72 / 25.4
SETS = [(json.load(open('themes.json')), 'out/bisraro-5-variant.png', 0), (json.load(open('themes2.json')), 'out/bisraro-5-variant-2.png', 5)]
THEMES = SETS[0][0] + SETS[1][0]

def pdf(name, pages, w, h):
    d = pymupdf.open()
    for png in pages:
        p = d.new_page(width=w * MM, height=h * MM)
        p.insert_image(p.rect, filename=png)
    d.set_metadata({'title': 'BISRARO', 'author': 'BISRARO'})
    d.save(name, deflate=True); print(name, len(d), 'bet')

for t in THEMES:
    base = 'out/%s/' % t['dir']
    pdf(base + 'bisraro-vizitka-print.pdf', [base + 'bisraro-front.png', base + 'bisraro-back.png'], 94, 54)
pdf('out/bisraro-qr-poster.pdf', ['out/bisraro-qr.png'], 120, 150)

# Umumiy ko'rinish: 5 variant, har qatorda old va orqa tomon (qirqish chizig'i bo'yicha)
for themes, name, first in SETS:
    W, pad, gap = 900, 70, 40
    card_w = W; card_h = round(W * 50 / 90)
    label_h = 70
    H = pad * 2 + len(themes) * (card_h + label_h + gap) - gap
    out = Image.new('RGB', (pad * 3 + card_w * 2, H), '#EDE7DF')
    dr = ImageDraw.Draw(out)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
    except OSError: font = ImageFont.load_default()
    y = pad
    for i, t in enumerate(themes):
        dr.text((pad, y + 12), '%d. %s' % (i + 1 + first, t['name']), fill='#2A1A10', font=font)
        y += label_h
        for j, side in enumerate(['front', 'back']):
            im = Image.open('out/%s/bisraro-%s.png' % (t['dir'], side)).convert('RGB')
            bw, bh = im.size; bx, by = round(bw * 2 / 94), round(bh * 2 / 54)  # 2 mm bleed'ni qirqish
            im = im.crop((bx, by, bw - bx, bh - by)).resize((card_w, card_h), Image.LANCZOS)
            x = pad + j * (card_w + pad)
            sh = Image.new('RGB', (card_w, card_h), '#CFC6BA'); out.paste(sh, (x + 6, y + 8))
            out.paste(im, (x, y))
        y += card_h + gap
    out.save(name, optimize=True); print(name, out.size)
