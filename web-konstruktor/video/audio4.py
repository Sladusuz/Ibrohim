# 4-video (izoh, yorug' uslub) uchun musiqa/SFX: jo'shqin pop, marimba, chertish. Ishlatish: python3 video/audio4.py -> video/out/music-izoh.wav
import sys
src = open(__file__.replace('audio4.py', 'audio.py')).read().split('BPM = 120')[0].replace('DUR = 37.5', 'DUR = 38.8')
exec(src)
import os, wave
BPM = 112; B = 60 / BPM
def marimba(f, d=.32, g=.5):
    t = T(d); x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 11); return x * g
def snap(g=.5): n = int(SR * .09); t = np.arange(n) / SR; return hp(rnd.standard_normal(n), 3) * np.exp(-t * 70) * g
def shaker(g=.2): n = int(SR * .08); t = np.arange(n) / SR; return hp(rnd.standard_normal(n), 3) * np.exp(-t * 45) * np.sin(np.pi * np.clip(t / .08, 0, 1)) * g
def wah(d=.9, g=.3):  # kulgili "pasayuvchi" ovoz
    t = T(d); f = 300 * np.exp(-t * 1.1) + 110; ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-t * 1.6) * (1 + .4 * np.sin(2 * np.pi * 6 * t)) * g
def blip(f, d=.14, g=.4): t = T(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 26) * g
def ticker(g=.18): t = T(.03); return np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 200) * g
C = {'C': 261.63, 'D': 293.66, 'E': 329.63, 'G': 392.0, 'A': 440.0, 'c': 523.25, 'd': 587.33, 'e': 659.25, 'g': 783.99}
# --- 0-4: quruq, hazil (snap + yengil marimba)
for k in range(8): put(shaker(.16), .3 + k * B / 2, 1.0, .3)
for k, n in enumerate('CEGEC'): put(marimba(C[n] , .3, .22), .5 + k * B, 1.0, -.2 + k * .1)
for t1 in (.4, 1.25, 2.1): put(blip(1318, .22, .45), t1, 1.0, -.3); put(blip(1760, .18, .25), t1 + .06, 1.0, -.3)
put(wah(1.0, .4), 3.35, 1.0)
for t1 in (1.1, 1.95, 2.8): put(pop(900, .09, .35), t1, 1.0, .3)
# --- sahna o'tishlari
for t1 in (4.0, 9.1, 19.2, 27.0, 33.1): put(whoosh(.55, True, 300, 4500, .38), t1 - .5, 1.0); put(pop(520, .16, .6), t1, 1.0); put(sparkle(.9, .18), t1 + .05, 1.0)
# --- asosiy ritm 4.0 -> 37.0: major, 112 bpm
prog = [('C', 'E', 'G'), ('A', 'C', 'E'), ('F', 'A', 'C'), ('G', 'D', 'G')]
fq = {'C': 130.81, 'E': 164.81, 'G': 196.0, 'A': 110.0, 'F': 87.31, 'D': 146.83}
melody = [['c', 'e', 'g', 'e'], ['e', 'c', 'A', 'c'], ['c', 'A', 'F', 'A'] if False else ['c', 'A', 'G', 'A'], ['d', 'G', 'D', 'G']]
t0 = 4.0; bar = 0
while t0 < 37.2:
    ch = prog[bar % 4]; root = fq[ch[0]]
    for beat in range(4):
        tb = t0 + beat * B
        if tb > 37.0: break
        put(kick(.35, 150, 50), tb, .75)
        if beat % 2 == 1: put(clap(), tb, .7)
        put(shaker(.2), tb + B / 2, 1.0, .3); put(shaker(.12), tb + B / 4, 1.0, -.3); put(shaker(.12), tb + 3 * B / 4, 1.0, .3)
        put(bass(root * (1 if beat != 3 else 1.5), B * .46), tb + B / 2, .8)
        for s_ in range(2):
            n = melody[bar % 4][(beat * 2 + s_) % 4]; fr = C.get(n) or fq.get(n, 220) * 2
            put(marimba(fr, .3, .34), tb + s_ * B / 2, 1.0, -.3 + .3 * s_)
    put(pad([root * 2, fq[ch[1]] * 2, fq[ch[2]] * 2], 4 * B + .3, .045), t0, 1.0)
    t0 += 4 * B; bar += 1
# --- S1 (4-9)
put(pop(700, .15, .5), 5.0, 1.0, -.2); put(boom(.7, .5), 6.65, 1.0); put(sparkle(1.0, .25), 6.7, 1.0); put(click(.45), 7.45, 1.0); put(pop(840, .14, .45), 8.05, 1.0)
# --- S2 (9-19): har foyda: ding + tekshirish belgisi
for t1 in (10.25, 12.25, 14.45, 16.65):
    put(pop(600, .14, .5), t1, 1.0, .2); put(ding(1568, .7, .3), t1 + .55, 1.0); put(blip(2093, .16, .35), t1 + .6, 1.0)
put(pop(780, .16, .5), 18.05, 1.0)
# --- S3 (19-27): taymer
for k in range(int((26.2 - 19.9) / .125)): put(ticker(.14 + .06 * (k / 50)), 19.9 + k * .125, 1.0, .2)
for t1 in (20.4, 22.9, 25.0): put(whoosh(.35, True, 400, 3500, .3), t1 - .12, 1.0)
for k in range(15): put(click(.22 + .08 * rnd.random()), 23.5 + k * .1, 1.0, .1)
put(ding(1760, .8, .35), 26.3, 1.0); put(ding(2349, .8, .28), 26.42, 1.0); put(sparkle(1.2, .3), 26.35, 1.0)
# --- S4 (27-33): narx
put(boom(.9, .9), 27.6, 1.0); put(kaching(.55), 27.62, 1.0); put(sparkle(1.6, .35), 27.7, 1.0)
for k in range(10): put(pop(600 + 60 * k, .08, .25), 27.65 + k * .05, 1.0, -.4 + k * .09)
put(whoosh(.5, True, 300, 3500, .35), 29.9, 1.0); put(click(.5), 30.4, 1.0)
for i, t1 in enumerate((30.7, 31.3, 31.9)): put(pop(700 + 120 * i, .14, .5), t1, 1.0); put(ding(1568 + 260 * i, .6, .25), t1 + .08, 1.0)
# --- S5 (33-38)
put(boom(1.0, .8), 33.4, 1.0); put(sparkle(1.3, .3), 33.5, 1.0); put(pop(800, .16, .55), 35.0, 1.0); put(boom(.7, .6), 35.0, 1.0)
put(ding(1568, 1.2, .35), 35.7, 1.0); put(ding(2093, 1.2, .3), 35.85, 1.0); put(ding(2637, 1.6, .25), 36.0, 1.0); put(sparkle(1.4, .3), 36.7, 1.0)
fade = np.ones(N); fi = int(37.4 * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
out = np.stack([L * fade, R * fade], 1); out = np.tanh(out * .95); out /= max(1e-9, np.abs(out).max()) / .62
pcm = (out * 32767).astype(np.int16); os.makedirs('video/out', exist_ok=True)
with wave.open('video/out/music-izoh.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('tayyor', round(N / SR, 1), 's')
