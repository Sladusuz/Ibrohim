# 6-video (Hikoya) uchun musiqa/SFX. Vaqtlar video/timeline6.js dan olinadi. python3 video/audio6.py -> video/out/music-hikoya.wav
import re, json
TL = json.loads(re.search(r'window\.TL=(\{.*?\});', open(__file__.replace('audio6.py', 'timeline6.js')).read(), re.S).group(1))
b1, b2, b3, b4, b5, b6, b7, END = TL['b1'], TL['b2'], TL['b3'], TL['b4'], TL['b5'], TL['b6'], TL['b7'], TL['end']
src = open(__file__.replace('audio6.py', 'audio.py')).read().split('BPM = 120')[0].replace('DUR = 37.5', 'DUR = %s' % (END + 1.8))
exec(src)
import os, wave
def thump(g=.9): return kick(.55, 110, 38) * g
def tickh(g=.2): t = T(.025); return np.sin(2 * np.pi * 3600 * t) * np.exp(-t * 220) * g
def womp(d=.9, g=.5):
    t = T(d); f = 260 * np.exp(-t * 1.6) + 90; ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sin(ph) + .3 * np.sin(2 * ph)) * np.exp(-t * 2.0) * g
def zing(f, d=.5, g=.35): t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 7) * g
def glitch(d=.35, g=.4):
    n = int(SR * d); x = rnd.standard_normal(n) * np.exp(-np.arange(n) / SR * 8); x *= (np.sin(2 * np.pi * 38 * np.arange(n) / SR) > 0); return hp(x, 4) * g
# ---------- B1: taranglik
put(pad([55, 82.4], b2 - b1, .09), b1, 1.0); put(sine(41, b2 - b1) * env(int((b2 - b1) * SR), .4, .3, .8, .6) * .3, b1, 1)
for k in range(5): put(thump(.6), b1 + .3 + k * .72, 1.0)
for k in range(int(1.2 / .07)): put(tickh(.12), b1 + .3 + k * .07, 1.0, .2)
put(boom(.9, 1.05), b1 + 2.0, 1.0); put(glitch(.4, .55), b1 + 2.0, 1.0); put(riser(1.4, .5), b2 - 1.5, 1.0)
# ---------- B2: yo'qotish
put(boom(1.0, .9), b2, 1.0); put(whoosh(.35, True, 400, 4500, .38), b2 - .2, 1.0)
for i, u in enumerate((.4, 1.5, 2.6)): put(zing(1318, .5, .4), b2 + u, 1.0, -.3); put(pop(520, .1, .45), b2 + u, 1.0, -.3)
for k in range(int(1.6 / .5)): put(tickh(.2), b2 + 3.8 + k * .5, 1.0, .3)
put(whoosh(.3, True, 300, 3000, .35), b2 + 5.1, 1.0); put(womp(1.0, .55), b2 + 5.25, 1.0, -.3); put(pop(300, .15, .5), b2 + 5.25, 1.0)
put(boom(1.4, 1.25), b2 + 6.4, 1.0); put(glitch(.45, .6), b2 + 6.4, 1.0)
put(riser(1.6, .5), b3 - 1.7, 1.0)
# ---------- B3 dan: asosiy ritm (118 bpm)
BPM = 118; B = 60 / BPM
prog = [(110, 1.189, 1.5), (87.3, 1.26, 1.5), (130.8, 1.26, 1.5), (98, 1.26, 1.5)]
put(boom(1.6, 1.3), b3, 1.0); put(whoosh(.5, False, 5000, 300, .45), b3 - .4, 1.0); put(sparkle(1.4, .32), b3 + .05, 1.0)
t0 = b3; bar = 0
while t0 < b7 + 3.0:
    r, m1, m2 = prog[bar % 4]
    for beat in range(4):
        tb = t0 + beat * B
        if tb > END - .6: break
        put(kick(.38, 150, 48), tb, .8)
        if beat % 2 == 1: put(clap(), tb, .75)
        put(hat(), tb + B / 2, .8, .3); put(hat(), tb + B / 4, .45, -.3); put(hat(), tb + 3 * B / 4, .45, .3)
        put(bass(r, B * .46), tb + B / 2, .85)
        put(pluck(r * 4 * (m1 if beat % 2 else 1), .22), tb, .26, -.3 + .2 * beat); put(pluck(r * 4 * m2, .22), tb + B / 2, .24, .3)
    put(pad([r * 2, r * 2 * m1, r * 2 * m2], 4 * B + .3, .06), t0, 1.0)
    t0 += 4 * B; bar += 1
for i, u in enumerate((1.1, 1.55, 2.0, 2.45)): put(pop(560 + 80 * i, .14, .55), b3 + u, 1.0); put(zing(1568 + 200 * i, .5, .3), b3 + u + .08, 1.0)
put(whoosh(.4, True, 300, 4000, .38), b3 + .3, 1.0)
# ---------- B4: natija
for i in range(4): put(whoosh(.3, True, 300, 4500, .4), b4 + i * 1.32 - .15, 1.0); put(pop(640, .12, .5), b4 + i * 1.32, 1.0)
for i, u in enumerate((.5, 1.82, 3.14, 4.46)): put(zing(1760, .6, .38), b4 + u, 1.0); put(zing(2349, .6, .28), b4 + u + .1, 1.0); put(kaching(.35), b4 + u + .12, 1.0)
for k in range(int(4.7 / .07)): put(tickh(.1), b4 + .5 + k * .07, 1.0, .2)
put(riser(1.0, .4), b5 - 1.0, 1.0)
# ---------- B5: oson
put(boom(.9, .8), b5, 1.0)
for k in range(int(2.7 / .125)): put(tickh(.12 + .1 * k / 22), b5 + .3 + k * .125, 1.0, .2)
for u in (.7, 1.5, 2.3): put(pop(700, .12, .45), b5 + u, 1.0); put(whoosh(.3, True, 400, 3500, .3), b5 + u - .1, 1.0)
for u in (1.3, 2.1, 2.9): put(zing(1568, .5, .3), b5 + u, 1.0)
put(zing(1760, .8, .38), b5 + 3.0, 1.0); put(zing(2349, .8, .3), b5 + 3.12, 1.0); put(sparkle(1.2, .3), b5 + 3.05, 1.0)
# ---------- B6: narx
put(riser(.7, .45), b6 - .7, 1.0); put(boom(1.3, 1.25), b6 + .1, 1.0); put(kaching(.6), b6 + .12, 1.0); put(sparkle(1.8, .38), b6 + .2, 1.0)
for k in range(12): put(pop(600 + 70 * k, .08, .26), b6 + .2 + k * .05, 1.0, -.4 + .07 * k)
put(whoosh(.45, True, 300, 3500, .35), b6 + 2.3, 1.0); put(click(.55), b6 + 2.8, 1.0); put(womp(.5, .3), b6 + 2.9, 1.0)
for i, u in enumerate((3.2, 3.9)): put(pop(700 + 130 * i, .14, .5), b6 + u, 1.0); put(zing(1568 + 280 * i, .6, .3), b6 + u + .08, 1.0)
# ---------- B7: chaqiriq
put(whoosh(.5, False, 5000, 300, .45), b7 - .3, 1.0); put(boom(1.4, 1.15), b7 + .1, 1.0); put(sparkle(1.5, .34), b7 + .2, 1.0)
put(pop(800, .16, .55), b7 + 2.6, 1.0); put(boom(.8, .6), b7 + 2.6, 1.0)
for i, f in enumerate((1568, 2093, 2637)): put(zing(f, 1.4, .3), b7 + 3.4 + i * .13, 1.0)
put(sparkle(1.5, .3), b7 + 4.2, 1.0)
fade = np.ones(N); fi = int((END + .6) * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.04 * SR)] = np.linspace(0, 1, int(.04 * SR))
out = np.stack([L * fade, R * fade], 1); out = np.tanh(out * .95); out /= max(1e-9, np.abs(out).max()) / .62
pcm = (out * 32767).astype(np.int16); os.makedirs('video/out', exist_ok=True)
with wave.open('video/out/music-hikoya.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('tayyor', round(N / SR, 1), 's')
