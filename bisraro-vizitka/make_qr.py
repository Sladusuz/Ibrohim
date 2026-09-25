import qrcode, json
URL = 'http://bisraro.uz/contacts'
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
q.add_data(URL); q.make(fit=True)
M = q.get_matrix(); n = len(M)
print('version', q.version, 'size', n)

def qr_svg(dark='#2A1A10', eye='#2A1A10', eyeInner='#8E6B24', bg=None, logo=True, quiet=4):
    S = n + quiet * 2
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="geometricPrecision">' % (S, S)]
    if bg: out.append('<rect width="%d" height="%d" rx="%.1f" fill="%s"/>' % (S, S, S*0.06, bg))
    out.append('<g transform="translate(%d %d)">' % (quiet, quiet))
    eyes = [(0, 0), (n - 7, 0), (0, n - 7)]
    def in_eye(r, c): return any(er <= r < er + 7 and ec <= c < ec + 7 for er, ec in eyes)
    c0 = n / 2; lr = n * 0.13  # logo zonasi radiusi
    def in_logo(r, c): return logo and (r + .5 - c0) ** 2 + (c + .5 - c0) ** 2 < (lr + .9) ** 2
    dots = []
    for r in range(n):
        for c in range(n):
            if M[r][c] and not in_eye(r, c) and not in_logo(r, c):
                dots.append('M%.2f %.2fh.84v.84h-.84z' % (c + .08, r + .08) if False else
                            'M%.3f,%.3fa.43,.43 0 1,0 .86,0a.43,.43 0 1,0 -.86,0' % (c + .07, r + .5))
    out.append('<path fill="%s" d="%s"/>' % (dark, ''.join(dots)))
    for er, ec in eyes:
        out.append('<path fill="%s" fill-rule="evenodd" d="M%d,%dh7v7h-7z M%d,%dh5v5h-5z" transform="" style=""/>' % (eye, ec, er, ec + 1, er + 1) if False else
                   '<rect x="%.1f" y="%.1f" width="6" height="6" rx="1.9" fill="none" stroke="%s" stroke-width="1"/>' % (ec + .5, er + .5, eye))
        out.append('<rect x="%d" y="%d" width="3" height="3" rx=".9" fill="%s"/>' % (ec + 2, er + 2, eyeInner))
    if logo:
        out.append('<circle cx="%.2f" cy="%.2f" r="%.2f" fill="%s" stroke="%s" stroke-width=".35"/>' % (c0, c0, lr, dark, eyeInner))
        out.append('<text x="%.2f" y="%.2f" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="600" font-size="%.2f" fill="#E8CD82">B</text>' % (c0, c0 + lr * .42, lr * 1.25))
    out.append('</g></svg>')
    return '\n'.join(out)

open('qr-core.svg', 'w').write(qr_svg(bg=None, quiet=0))
open('out/bisraro-qr-oddiy.svg', 'w').write(qr_svg(bg='#FFF8F0'))
