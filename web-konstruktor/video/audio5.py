# 5-video (Ikki havola) uchun musiqa/SFX: taranglik -> yengillik -> kuchli drop. python3 video/audio5.py -> video/out/music-split.wav
src = open(__file__.replace('audio5.py', 'audio.py')).read().split('BPM = 120')[0].replace('DUR = 37.5', 'DUR = 41.0')
exec(src)
import os, wave
def thump(g=.9): return kick(.5, 120, 40) * g
def tickh(g=.2): t = T(.025); return np.sin(2 * np.pi * 3600 * t) * np.exp(-t * 220) * g
def womp(d=.9, g=.5):
    t = T(d); f = 260 * np.exp(-t * 1.6) + 90; ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sin(ph) + .3 * np.sin(2 * ph)) * np.exp(-t * 2.0) * g
def zing(f, d=.5, g=.35): t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 7) * g
def arp(root, d, g=.3):
    x = np.zeros(int(SR * d))
    for k, m in enumerate((1, 1.26, 1.5, 2, 1.5, 1.26)):
        i = int(k * d / 6 * SR); tt = T(.2); y = (np.sin(2 * np.pi * root * m * tt) + .3 * np.sin(2 * np.pi * root * m * 3 * tt)) * np.exp(-tt * 16) * g; n = min(len(y), len(x) - i); x[i:i + n] += y[:n]
    return x
# ---------- 0-3.3: taranglik
put(pad([55, 82.4], 3.4, .08), 0, 1.0); put(sine(41, 3.4) * env(int(3.4 * SR), .4, .3, .8, .6) * .3, 0, 1)
for k in range(3): put(thump(.55), .25 + k * 1.0, 1.0)
for i, t1 in enumerate((.35, .69, 1.03, 1.37)): put(boom(.45, .55), t1, 1.0); put(pop(480 + 60 * i, .1, .5), t1, 1.0, -.3 + .2 * i)
put(pop(1200, .2, .4), 1.95, 1.0); put(zing(1568, .5, .3), 1.97, 1.0)
put(riser(1.4, .55), 1.9, 1.0); put(boom(.9, .9), 2.35, 1.0)
# ---------- 3.3: bo'linish
put(boom(1.4, 1.1), 3.3, 1.0); put(whoosh(.4, True, 400, 5000, .45), 3.1, 1.0); put(sparkle(.8, .25), 3.4, 1.0)
for k in range(int((5.35 - 3.7) / .16)): put(tickh(.16), 3.7 + k * .16, 1.0, -.25)
put(arp(523, .9, .32), 4.4, 1.0, .3); put(zing(1568, .6, .35), 5.0, 1.0, .3); put(zing(2093, .6, .3), 5.12, 1.0, .3)
put(womp(.9, .55), 5.4, 1.0, -.3)
for t1 in (5.9, 6.05): put(pop(900, .1, .4), t1, 1.0)
put(riser(1.0, .4), 7.6, 1.0)
# ---------- 8.8 -> 34: asosiy ritm (112 bpm, yengil-yuqori)
BPM = 112; B = 60 / BPM
prog = [(110, 1.189, 1.5), (87.3, 1.26, 1.5), (130.8, 1.26, 1.5), (98, 1.26, 1.5)]
t0 = 8.8; bar = 0
while t0 < 34.0:
    r, m1, m2 = prog[bar % 4]
    for beat in range(4):
        tb = t0 + beat * B
        if tb > 33.9: break
        put(kick(.38, 150, 48), tb, .8)
        if beat % 2 == 1: put(clap(), tb, .75)
        put(hat(), tb + B / 2, .8, .3); put(hat(), tb + B / 4, .45, -.3); put(hat(), tb + 3 * B / 4, .45, .3)
        put(bass(r, B * .46), tb + B / 2, .85)
        put(pluck(r * 4 * (m1 if beat % 2 else 1), .22), tb, .26, -.3 + .2 * beat)
        put(pluck(r * 4 * m2, .22), tb + B / 2, .24, .3)
    put(pad([r * 2, r * 2 * m1, r * 2 * m2], 4 * B + .3, .06), t0, 1.0)
    t0 += 4 * B; bar += 1
# ---------- sayohat hodisalari
for t1 in (10.0, 12.2, 14.4, 16.5): put(whoosh(.35, True, 300, 4000, .4), t1 - .2, 1.0); put(pop(560, .14, .6), t1, 1.0); put(zing(1568, .5, .28), t1 + .1, 1.0)
put(click(.5), 17.0, 1.0); put(pop(900, .12, .45), 17.05, 1.0)
for k in range(24): put(click(.2 + .08 * rnd.random()), 18.0 + k * .038, 1.0, .1)
put(zing(1318, .7, .4), 18.7, 1.0); put(zing(1760, .7, .35), 18.85, 1.0)
for k in range(16): put(pop(700 + 40 * k, .06, .28), 18.95 + k * .035, 1.0, -.4 + .05 * k)
put(kaching(.55), 19.45, 1.0); put(sparkle(1.4, .32), 19.45, 1.0)
# ---------- 19.2 oson
put(boom(.9, .85), 19.2, 1.0); put(whoosh(.4, True, 300, 4500, .4), 19.0, 1.0)
for k in range(int((26.0 - 20.0) / .125)): put(tickh(.12 + .08 * k / 48), 20.0 + k * .125, 1.0, .2)
for t1 in (20.3, 22.4, 24.7): put(whoosh(.35, True, 400, 3500, .32), t1 - .12, 1.0); put(pop(640, .12, .45), t1 + .05, 1.0)
for k in range(15): put(click(.22 + .08 * rnd.random()), 23.0 + k * .105, 1.0, .1)
put(pop(900, .14, .5), 25.9, 1.0); put(zing(1760, .8, .38), 26.3, 1.0); put(zing(2349, .8, .3), 26.42, 1.0); put(sparkle(1.2, .3), 26.35, 1.0)
# ---------- 27.4 narx
put(riser(.8, .45), 26.8, 1.0); put(boom(1.2, 1.15), 27.6, 1.0); put(kaching(.6), 27.62, 1.0); put(sparkle(1.8, .38), 27.7, 1.0)
for k in range(12): put(pop(600 + 70 * k, .08, .26), 27.7 + k * .05, 1.0, -.4 + .07 * k)
put(whoosh(.45, True, 300, 3500, .35), 29.9, 1.0); put(click(.55), 30.4, 1.0); put(womp(.5, .3), 30.5, 1.0)
for i, t1 in enumerate((30.8, 31.4, 32.0)): put(pop(700 + 130 * i, .14, .5), t1, 1.0); put(zing(1568 + 280 * i, .6, .3), t1 + .08, 1.0)
# ---------- 34.1 CTA
put(whoosh(.5, False, 5000, 300, .45), 33.7, 1.0); put(boom(1.4, 1.1), 34.3, 1.0); put(sparkle(1.5, .34), 34.4, 1.0)
put(pop(800, .16, .55), 36.4, 1.0); put(boom(.8, .6), 36.4, 1.0)
for i, f in enumerate((1568, 2093, 2637)): put(zing(f, 1.4, .3), 37.2 + i * .13, 1.0)
put(sparkle(1.5, .3), 38.0, 1.0)
fade = np.ones(N); fi = int(39.8 * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.04 * SR)] = np.linspace(0, 1, int(.04 * SR))
out = np.stack([L * fade, R * fade], 1); out = np.tanh(out * .95); out /= max(1e-9, np.abs(out).max()) / .62
pcm = (out * 32767).astype(np.int16); os.makedirs('video/out', exist_ok=True)
with wave.open('video/out/music-split.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('tayyor', round(N / SR, 1), 's')
