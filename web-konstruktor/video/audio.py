# Videoning musiqa va ovoz effektlari (numpy bilan sintez). Ishlatish: python3 video/audio.py  -> video/out/music.wav
import numpy as np, wave, os, sys
SR = 44100; DUR = 37.5; N = int(SR * DUR); rnd = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
def put(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    l, r = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    L[i:i + n] += sig[:n] * l; R[i:i + n] += sig[:n] * r
T = lambda d: np.arange(int(SR * d)) / SR
def env(n, a=.005, d=.2, s=0.0, r=.1):
    e = np.ones(n); na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, max(na, 1)); 
    if nd: e[na:na + nd] = np.linspace(1, s, nd)[:max(0, n - na)] if na < n else e[na:na + nd]
    e[na + nd:] = s
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def lp(x, k):  # oddiy past chastotali filtr (harakatlanuvchi o'rtacha)
    if k <= 1: return x
    return np.convolve(x, np.ones(k) / k, mode='same')
def hp(x, k): return x - lp(x, k)
def sine(f, d): t = T(d); return np.sin(2 * np.pi * f * t)
def saw(f, d, h=8): t = T(d); return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, h + 1)) * .6
def kick(d=.45, f0=170, f1=46):
    t = T(d); f = f1 + (f0 - f1) * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 7) + .25 * np.sin(2 * ph) * np.exp(-t * 14)) * 1.15
def clap(d=.25):
    n = int(SR * d); x = np.zeros(n)
    for o in (0, .012, .026): i = int(o * SR); x[i:] += rnd.standard_normal(n - i) * np.exp(-T(d)[:n - i] * 40)
    return hp(x, 12) * .5 * np.exp(-T(d) * 14)
def hat(d=.06, o=False):
    n = int(SR * (.25 if o else d)); return hp(rnd.standard_normal(n), 4) * np.exp(-T(n / SR) * (14 if o else 70)) * .22
def pluck(f, d=.22): t = T(d); return (saw(f, d, 5) * np.exp(-t * 14) + .3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 22)) * .5
def bass(f, d): x = lp(saw(f, d, 6), 6) + sine(f, d) * .8; return x * env(len(x), .004, .05, .85, .06) * .9
def pad(freqs, d, g=.07):
    x = sum(saw(f, d, 4) + saw(f * 1.004, d, 4) for f in freqs) / len(freqs); x = lp(x, 14); return x * env(len(x), .6, .3, .9, .8) * g
def whoosh(d=1.0, rise=True, f0=300, f1=5000, g=.5):
    t = T(d); u = t / d; ff = f0 * (f1 / f0) ** (u if rise else 1 - u); ph = 2 * np.pi * np.cumsum(ff) / SR
    n = rnd.standard_normal(len(t)); x = hp(n, 6) * (.6 + .4 * np.sin(ph)); e = np.sin(np.pi * u) ** (1.5 if rise else 1) * (u if rise else 1)
    return x * e * g
def boom(d=1.4, g=1.0):
    t = T(d); f = 38 + 60 * np.exp(-t * 6); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 2.4) + .5 * lp(rnd.standard_normal(len(t)), 40) * np.exp(-t * 4)) * g
def ding(f, d=.9, g=.4):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 14)) * np.exp(-t * 4.2) * g
def pop(f, d=.12, g=.5): t = T(d); return np.sin(2 * np.pi * (f + 200 * np.exp(-t * 60)) * t) * np.exp(-t * 32) * g
def click(g=.45): t = T(.05); return hp(rnd.standard_normal(len(t)), 5) * np.exp(-t * 120) * g + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * .2
def tick(g=.25): t = T(.04); return np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 160) * g
def kaching(g=.5):
    d = 1.4; t = T(d); x = np.zeros(len(t))
    for o, f in ((0, 1318), (.09, 1760), (.18, 2349)):
        i = int(o * SR); tt = t[:len(t) - i]; x[i:] += (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.99 * tt)) * np.exp(-tt * 3.2)
    return x * g
def ring(d=.9, g=.45):
    t = T(d); a = np.sin(2 * np.pi * 880 * t) * (np.sin(2 * np.pi * 25 * t) > 0); b = np.sin(2 * np.pi * 660 * t) * (np.sin(2 * np.pi * 25 * t) > 0)
    return (a + b) * .5 * env(len(t), .01, .05, .9, .05) * g
def sparkle(d=1.2, g=.25):
    x = np.zeros(int(SR * d))
    for k in range(18):
        f = 2200 + 2600 * rnd.random(); o = rnd.random() * .8; i = int(o * SR); tt = T(.25); s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 18) * (.4 + .6 * rnd.random()); x[i:i + len(tt)] += s[:len(x) - i]
    return x * g
def riser(d, g=.35):
    t = T(d); u = t / d; f = 120 * (16 ** u); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * .5 + hp(rnd.standard_normal(len(t)), 5) * .8 * u) * (u ** 1.6) * g
BPM = 120; B = 60 / BPM
duck = np.ones(N)
def kick_at(t0, g=1.0):
    put(kick(), t0, .85 * g); i = int(t0 * SR); n = int(.28 * SR); e = np.arange(n) / SR; duck[i:i + n] = np.minimum(duck[i:i + n], 1 - .55 * np.exp(-e / .08))
music = {'L': np.zeros(N), 'R': np.zeros(N)}
# ===== 0.0-3.3: qorong'i muhit
put(pad([55, 82.4, 110], 3.6, .09), 0.0, 1.0); put(sine(41, 3.6) * env(int(3.6 * SR), .5, .3, .8, .8) * .25, 0, 1)
for k in range(8): put(tick(.22), k * .5 + .1, 1.0, .3)
for k, f in enumerate((1568, 1319, 1760, 1480, 1245)): put(ding(f, .9, .33), .55 + k * .38, 1.0, -.25 + k * .12)
put(riser(1.3, .3), 2.0, 1.0)
# ===== 3.3-8.2: keskinlik
put(boom(1.6, .9), 3.3, 1.0)
for k in range(10): 
    t0 = 3.3 + k * B; 
    if t0 < 8.2: kick_at(t0, .8)
    for j in range(2):
        t1 = t0 + j * B / 2
        if t1 < 8.2: put(hat(), t1, .8 + .2 * (t1 - 3.3) / 5, .3)
    if t0 < 8.2 and k % 2 == 1: put(clap(), t0, .7)
for k, (t0, f) in enumerate(((3.3, 55), (3.8, 55), (4.3, 58.3), (4.8, 55), (5.3, 49), (5.8, 55), (6.3, 58.3), (6.8, 65.4), (7.3, 55), (7.8, 73.4))):
    put(bass(f, .42), t0 + B / 2 * 0, .8)
for t0 in (3.35, 4.0, 4.8, 5.6, 6.35): put(boom(.6, .5), t0, 1.0); put(whoosh(.45, True, 300, 4000, .35), t0 - .22, 1.0)
t = np.arange(int(4.0 * SR)) / SR; 
for k in range(int(3.6 / .08)): put(tick(.12 + .12 * k / 45), 4.4 + k * (.08 - .05 * k / 45), 1.0, .2)
put(riser(1.6, .5), 6.7, 1.0)
# ===== 8.3: drop
put(whoosh(.5, False, 5000, 300, .5), 8.0, 1.0); put(boom(2.0, 1.1), 8.3, 1.0); put(sparkle(1.4, .35), 8.4, 1.0)
chords = [(110, 130.8, 164.8), (87.3, 110, 130.8), (130.8, 164.8, 196), (98, 123.5, 146.8)]  # Am F C G
roots = [55, 43.65, 65.4, 49]
penta = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3]
arp_pat = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 5, 4, 2, 3]
t0 = 8.3; bar = 0
while t0 < 33.4:
    cb = chords[bar % 4]; dd = 4 * B
    put(pad(cb, dd + .4, .07), t0, 1.0)
    for beat in range(4):
        tb = t0 + beat * B
        kick_at(tb, 1.0)
        put(hat(), tb + B / 2, .9, .3); put(hat(), tb + B / 4, .5, -.3); put(hat(), tb + 3 * B / 4, .5, .3)
        if beat % 2 == 1: put(clap(), tb, .85)
        if beat == 3: put(hat(d=.06, o=True), tb + B / 2, .7)
        put(bass(roots[bar % 4] * (1 if beat != 3 else 1.5), B * .45), tb + B / 2, .9)
        for s in range(4):
            idx = arp_pat[(beat * 4 + s) % 16]; f = penta[idx] * (cb[0] / 110 if bar % 4 in (1, 2, 3) else 1) 
            put(pluck(f * (1 if bar % 4 in (0,) else (0.794 if bar % 4 == 1 else (1.189 if bar % 4 == 2 else 0.89)))), tb + s * B / 4, .26, -.4 + .2 * s)
    t0 += dd; bar += 1
# ===== 33-37.5: yakun
for k in range(8):
    tb = 33.4 + k * B
    if tb < 35.7: kick_at(tb, 1.0); put(hat(), tb + B / 2, .8)
put(pad(chords[0], 4.0, .1), 33.4, 1.0); put(ding(1760, 2.0, .35), 35.6, 1.0); put(ding(2349, 2.0, .25), 35.75, 1.0)
# ===== hodisa ovozlari
put(pop(520), 11.3, 1.0, .3); put(pop(780), 13.0, 1.0, -.3); 
for k in range(5): put(tick(.2), 12.1 + k * .17, 1.0)
put(click(.5), 14.7, 1.0); put(click(.5), 16.5, 1.0); put(whoosh(.5, True, 400, 3000, .3), 10.45, 1.0)
put(pop(900, .15, .5), 15.1, 1.0); put(kaching(.5), 17.0, 1.0); put(sparkle(1.6, .3), 17.0, 1.0); put(boom(.8, .5), 17.0, 1.0)
for k in range(3): put(ring(.9, .45), 17.7 + k * 1.0, 1.0)
put(whoosh(.7, True, 300, 5000, .45), 19.6, 1.0); put(whoosh(1.4, True, 300, 3500, .35), 20.3, 1.0); put(whoosh(.7, True, 400, 4000, .4), 22.8, 1.0)
for k in range(28): put(click(.28 + .1 * rnd.random()), 25.0 + k * .043, 1.0, .1)
put(click(.6), 26.5, 1.0); put(ding(1568, .8, .35), 26.6, 1.0); put(ding(2093, .8, .28), 26.72, 1.0)
for t1 in (27.4, 27.9, 28.9): put(whoosh(.5, True, 300, 4500, .4), t1 - .1, 1.0)
put(boom(.7, .7), 28.1, 1.0); put(boom(.9, .8), 29.0, 1.0); put(hp(rnd.standard_normal(int(SR * .25)), 4) * np.exp(-T(.25) * 12) * .5, 29.0, 1.0)
for k in range(3): put(pop(700 + 140 * k, .14, .45), 29.9 + k * .45, 1.0)
put(whoosh(.5, False, 5000, 300, .5), 32.0, 1.0); put(boom(2.0, 1.2), 32.4, 1.0); put(sparkle(1.6, .35), 32.5, 1.0)
put(pop(900, .18, .6), 33.2, 1.0); put(sparkle(1.2, .3), 33.3, 1.0)
# aralashtirish: musiqa (duck) + effektlar
mix_L = L.copy(); mix_R = R.copy()
fade = np.ones(N); fi = int(36.0 * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
out = np.stack([mix_L * fade, mix_R * fade], 1)
# yumshoq cheklash (soft clip) va normalizatsiya
out = np.tanh(out * 0.95) ; out /= max(1e-9, np.abs(out).max()) / 0.62
pcm = (out * 32767).astype(np.int16)
os.makedirs('video/out', exist_ok=True)
with wave.open('video/out/music.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('music.wav tayyor', round(N / SR, 1), 's')
