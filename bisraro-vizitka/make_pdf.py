"""out/*.png rasmlaridan aniq o'lchamli, siqilmagan (lossless) PDF yig'adi."""
import pymupdf
MM = 72 / 25.4
def pdf(name, pages, w, h):
    d = pymupdf.open()
    for png in pages:
        p = d.new_page(width=w * MM, height=h * MM)
        p.insert_image(p.rect, filename=png)
    d.set_metadata({'title': 'BISRARO', 'author': 'BISRARO'})
    d.save(name, deflate=True); print(name, len(d), 'bet')
pdf('out/bisraro-vizitka-print.pdf', ['out/bisraro-front.png', 'out/bisraro-back.png'], 94, 54)
pdf('out/bisraro-qr-poster.pdf', ['out/bisraro-qr.png'], 120, 150)
