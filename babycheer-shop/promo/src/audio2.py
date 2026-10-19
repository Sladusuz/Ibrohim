import json, subprocess, wave, numpy as np
from scipy.signal import lfilter, butter
SR = 44100
TL = json.load(open('timeline.json')); BEAT = TL['beat']; S = TL['scenes']; TOTAL = TL['total'] + 0.3
N = int(TOTAL * SR); rng = np.random.default_rng(11)
BED = [np.zeros(N), np.zeros(N)]; FX = [np.zeros(N), np.zeros(N)]
def put(bus, sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0: return
    a = max(0, -i); s = sig[a:][: N - max(i, 0)] * gain; i = max(i, 0)
    l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    bus[0][i:i + len(s)] += s * l; bus[1][i:i + len(s)] += s * r
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, o=2): b, a = butter(o, min(fc, SR * .45) / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, max(fc, 20) / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), min(hi, SR * .45) / (SR / 2)], 'band'); return lfilter(b, a, x)
def noise(d): return rng.standard_normal(int(d * SR))
def env(t, a=.003, d=.3, p=3): return np.minimum(1, t / a) * np.exp(-t * (1 / d) * p)
def kick(power=1.0):
    t = tt(.4); f = 42 + 130 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(np.sin(ph) * np.exp(-t * 8) * 1.8 * power) + .3 * np.exp(-t * 120) * noise(.4)[: len(t)]
def sub808(f, d=.55):
    t = tt(d); fr = f * (1 + 1.4 * np.exp(-t * 40)); return np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * np.minimum(1, t / .004) * np.exp(-t * 3.4)
def clap():
    t = tt(.3); n = bp(noise(.3), 900, 6500); e = sum(np.exp(-np.clip(t - o, 0, None) * (45 if k < 3 else 16)) * (t >= o) for k, o in enumerate([0, .011, .022, .034])) / 2.2
    return n * e * 1.4 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28) * .35
def hat(o=False, v=1.0):
    d = .28 if o else .06; t = tt(d); return hp(noise(d), 7000) * np.exp(-t * (13 if o else 75)) * .5 * v
def pluck(f, d=.24):
    t = tt(d); w = np.sign(np.sin(2 * np.pi * f * t)) * .35 + np.sin(2 * np.pi * f * 1.004 * t) * .5 + np.sin(2 * np.pi * f * 2 * t) * .22; return lp(w, 4200) * np.exp(-t * 13) * np.minimum(1, t / .002)
def supersaw(f, d, cut=2400):
    t = tt(d); w = sum(2 * ((f * (1 + dt) * t) % 1) - 1 for dt in (-.012, -.006, 0, .006, .012)) / 5; e = np.minimum(1, t / .03) * np.minimum(1, (d - t) / .15); return lp(w, cut) * e
def pad(f, d): return supersaw(f, d, 1400) * .22
def bell(f, d=1.6):
    t = tt(d); return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dk) for r, a, dk in [(1, 1, 2.6), (2.76, .6, 3.4), (5.4, .35, 5), (8.93, .2, 7)]) * .4
def music_box(f, d=1.4):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 3 * t)) * np.exp(-t * 3.2) * np.minimum(1, t / .002) * .45
def blip(f=1500, d=.14): t = tt(d); return np.sin(2 * np.pi * np.cumsum(f * (1 + .3 * np.exp(-t * 30))) / SR) * np.exp(-t * 28) * .5
def ping(f=1180, d=.9):
    t = tt(d); x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7); o = np.zeros(len(t)); k = int(.18 * SR); o += x; o[k:] += x[:-k] * .45; return o * .5
def whoosh(d=.5, up=True, vol=1.0):
    n = noise(d); t = np.arange(len(n)) / len(n); out = np.zeros_like(n); steps = 24; seg = len(n) // steps
    for i in range(steps):
        fc = 250 + 8500 * ((i / steps) if up else (1 - i / steps)) ** 1.6; s0 = i * seg; out[s0:s0 + seg] = lp(n[s0:s0 + seg + 256], fc, 1)[:seg] if len(n[s0:s0 + seg + 256]) >= seg else 0
    return out * np.sin(np.pi * t) ** 1.4 * 1.8 * vol
def riser(d):
    t = tt(d); n = noise(d); out = np.zeros_like(n); steps = 40; seg = len(n) // steps
    for i in range(steps): out[i * seg:(i + 1) * seg] = hp(n[i * seg:(i + 1) * seg + 128], 300 + 8000 * (i / steps) ** 2, 1)[:seg]
    sw = np.sin(2 * np.pi * np.cumsum(180 + 2400 * (t / d) ** 2) / SR) * .22
    return (out * 1.3 + sw) * (t / d) ** 1.7
def impact(d=2.0):
    t = tt(d); f = 62 * np.exp(-t * 1.6) + 26; body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0) * 1.3; crash = hp(noise(d), 500) * np.exp(-t * 3.5) * .45
    return np.tanh(body + crash)
def revcrash(d=1.2): t = tt(d); return hp(noise(d), 1500) * (t / d) ** 2.2 * .5
def engine(d=1.2, f0=55, f1=210):
    t = tt(d); ff = f0 * (f1 / f0) ** (t / d); w = 2 * ((np.cumsum(ff) / SR) % 1) - 1; return np.tanh(lp(w, 900) * 2.2 + lp(noise(d), 600) * .35) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .7
def boing(d=.45): t = tt(d); f = 180 + 700 * np.sin(np.pi * np.clip(t / d, 0, 1) * .5); return np.sin(2 * np.pi * np.cumsum(f * (1 + .06 * np.sin(t * 60))) / SR) * np.exp(-t * 7) * .5
def thud(d=.4): t = tt(d); f = 95 * np.exp(-t * 10) + 38; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * 1.1
def confpop(): t = tt(.5); e = np.exp(-t * 16) + .6 * np.exp(-np.clip(t - .07, 0, None) * 22) * (t > .07); return lp(hp(noise(.5), 2400), 9000) * e * .55
def glitch(d=.12): n = noise(d); t = tt(d); return np.sign(n) * np.where((np.arange(len(n)) // 90) % 2, .5, .15) * np.exp(-t * 18) * .6
def sparkle(n=7, d=.9, base=2200):
    out = np.zeros(int(d * SR)); 
    for i in range(n): f = base * (1.19 ** i); k = int(i * d / n / 1.7 * SR); t = tt(.35); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 11) * .35; out[k:k + len(s)] += s[: len(out) - k]
    return out
def bike_bell(): return bell(2350, 1.1) * .9
def tick(): t = tt(.05); return hp(noise(.05), 3000) * np.exp(-t * 80) * .6

# ---------- musiqa ----------
ROOT = [55, 43.65, 65.41, 49]; CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
st = [x['start'] for x in S] + [TL['total']]
def sec(t):
    for i in range(9):
        if st[i] <= t < st[i + 1]: return i
    return 8
nb = int(TOTAL / BEAT) + 1
for b in range(nb):
    t0 = b * BEAT; i = sec(t0); bar = (b // 4) % 4; q = b % 4
    if t0 >= TOTAL: break
    if i == 0:
        if b % 2 == 0: put(BED, kick(.5), t0, 0, .5)  # yurak urishi
        if b == 0: put(BED, supersaw(55, BEAT * 7, 500) * .5, 0, 0, .9)
        continue
    breakdown = (i == 5 and t0 < st[5] + BEAT * 8)
    if i == 7: put(BED, kick(1.2), t0, 0, 1.0); put(BED, kick(1.0), t0 + BEAT / 2, 0, .55)
    elif not breakdown:
        put(BED, kick(), t0, 0, .95)
        if q in (1, 3): put(BED, clap(), t0, 0, .8)
    else:
        if q == 0: put(BED, kick(.5), t0, 0, .5)
    put(BED, hat(False, .8 if not breakdown else .4), t0 + BEAT / 2, .3, .8)
    if not breakdown and q == 3: put(BED, hat(True), t0 + BEAT * .75, -.3, .7)
    if not breakdown and i in (2, 4, 6, 7, 8) and q == 3:
        for k in range(4): put(BED, hat(False, .5), t0 + BEAT * (.5 + k * .125), 0, .6)
    # bass
    if not breakdown:
        put(BED, sub808(ROOT[bar], BEAT * .9), t0, 0, .8)
        if q in (1, 3): put(BED, sub808(ROOT[bar], BEAT * .45), t0 + BEAT * .5, 0, .55)
    else:
        put(BED, sub808(ROOT[bar], BEAT * 1.8), t0, 0, .35) if q % 2 == 0 else None
    # arp / lead
    pat = [0, 2, 1, 2, 0, 1, 2, 1]
    if i in (1, 2, 3, 4, 6, 7, 8) or (i == 5 and not breakdown):
        for k in range(4): put(BED, pluck(CH[bar][pat[(b * 4 + k) % 8] % 3] * 2, .2), t0 + k * BEAT / 4, -.5 if k % 2 else .5, .55 if i != 8 else .7)
    if q == 0: [put(BED, pad(f * (1 if not breakdown else 1), BEAT * 4), t0, 0, 1.0) for f in CH[bar]]
    if breakdown:
        mel = [659.25, 783.99, 880, 783.99, 659.25, 523.25, 587.33, 659.25]
        for k in range(2): put(BED, music_box(mel[(b * 2 + k) % 8] * (1 if k == 0 else 1.5)), t0 + k * BEAT / 2, .2, .8)
    if i == 8 and q == 0: put(BED, supersaw(CH[bar][0], BEAT * 4, 3200), t0, 0, .35)

# ---------- effektlar ----------
def at(i, k): return S[i]['wt'][min(k, len(S[i]['wt']) - 1)]
for sc in S[1:]: put(FX, whoosh(.5, True, .9), sc['start'] - .22, 0, .55)
put(FX, riser(at(0, 5) - .08 - .2), .1, 0, .5)
ign = at(0, 5) - .08; put(FX, impact(2.0), ign, 0, .95); put(FX, whoosh(.6, False), ign - .05, 0, .5); put(FX, sparkle(8, 1.0, 1800), ign + .1, 0, .6); put(FX, kick(1.2), ign, 0, 1.0)
# joy
s1 = S[1]; put(FX, impact(1.4), s1['start'] + .03, 0, .7); put(FX, confpop(), s1['start'] + .05, 0, .7)
j1, j2 = at(1, 1), at(1, 2); put(FX, boing(), j1 - .02, 0, .55); put(FX, thud(), j1 + .62, 0, .7); put(FX, confpop(), j1, 0, .65); put(FX, boing(.35), j2 - .02, .2, .5); put(FX, thud(), j2 + .5, 0, .6); put(FX, confpop(), j2 + .05, 0, .6)
# mashinalar
put(FX, engine(1.0, 60, 240), S[2]['start'] + .05, 0, .55)
put(FX, blip(1400), at(2, 1) + .12, 0, .6); sw = at(2, 3); put(FX, engine(.9, 80, 320), sw - .25, 0, .7); put(FX, whoosh(.5, True, 1.0), sw - .3, 0, .6); put(FX, blip(1800), sw + .45, 0, .6); put(FX, sparkle(6, .8, 1700), sw + .3, 0, .4)
put(FX, engine(at(2, 7) - at(2, 5), 90, 380), at(2, 5), 0, .6); put(FX, impact(1.4), at(2, 7), 0, .75); put(FX, revcrash(.5), at(2, 7) - .5, 0, .6)
# velokalyaska
rt = at(3, 2); put(FX, whoosh(.7, True, .9), rt - .2, 0, .55); put(FX, bike_bell(), rt + .75, -.2, .75); put(FX, bike_bell(), rt + 1.0, -.2, .6); put(FX, thud(), rt + .8, 0, .5)
put(FX, blip(1300), at(3, 4), 0, .55); put(FX, blip(1700), at(3, 6), 0, .55)
# samokat
put(FX, whoosh(.6, True, 1.0), S[4]['start'] - .1, 0, .6); put(FX, sparkle(7, .9, 2000), at(4, 1) - .05, 0, .55); put(FX, blip(1500), at(4, 1) + .1, 0, .55); put(FX, blip(1900), at(4, 3) + .1, 0, .5); put(FX, sparkle(9, 1.1, 1900), at(4, 5), 0, .6)
# kalyaska
for k, tm in enumerate([at(5, 0), at(5, 2) , at(5, 4), at(5, 6)]): put(FX, bell([1046.5, 1318.5, 1568, 2093][k], 1.8), tm, .2, .5)
for k in (2, 4, 6): put(FX, blip(1250 + k * 80), at(5, k) + .05, 0, .4)
# yetkazib berish
put(FX, ping(1200), at(6, 0), 0, .9); put(FX, thud(), at(6, 4) - .1, 0, .9); put(FX, bell(1760, 1.4), at(6, 4) - .08, .3, .8); put(FX, impact(1.2), at(6, 4) - .1, 0, .5)
for i in range(11): put(FX, blip(900 + i * 110, .12), at(6, 5) + i * .09 + .1, (-.5 + i * .1), .5)
put(FX, whoosh(.5, True), at(6, 5) - .15, 0, .5)
# shoshiltirish
u0 = S[7]['start']
for h in range(7): put(FX, glitch(), u0 + h * BEAT, 0, .55); put(FX, hat(True), u0 + h * BEAT + BEAT * .5, .2, .6)
for k in range(12): put(FX, clap(), u0 + S[7]['dur'] - 3 * BEAT + k * BEAT / 4, 0, .3 + .05 * k)
put(FX, impact(.9), at(7, 2) - .1, 0, .6); put(FX, glitch(.2), at(7, 2) - .1, 0, .8); put(FX, glitch(.2), at(7, 4) - .05, 0, .8)
put(FX, riser(S[7]['dur'] * .9), u0 + S[7]['dur'] * .1, 0, .6)
# CTA
c0 = S[8]['start']; put(FX, impact(2.6), c0, 0, 1.0); put(FX, kick(1.3), c0, 0, 1.0); put(FX, sparkle(9, 1.2, 1900), c0 + .1, 0, .6); put(FX, confpop(), c0 + .15, 0, .6)
for i in range(5): put(FX, blip(1000 + i * 200, .16), c0 + .5 + i * .12, (-.6 + i * .3), .55)
put(FX, blip(900), c0 + 1.2, 0, .5); put(FX, tick(), at(8, 5) - .05, 0, .9); put(FX, ping(1400), at(8, 5) - .05, 0, .6); put(FX, confpop(), at(8, 9), 0, .7); put(FX, sparkle(8, 1.0, 2100), at(8, 9), 0, .5)

# ---------- ovoz ----------
voice = np.zeros(N)
for s in S:
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f"audio/l{s['i']}.wav", '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']); v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    i0 = int(s['vstart'] * SR); voice[i0:i0 + len(v)] += v[: N - i0]
voice = voice / (np.max(np.abs(voice)) + 1e-9) * .95
voice = hp(voice, 70, 2)
ve = np.convolve(np.abs(voice), np.ones(int(.05 * SR)) / int(.05 * SR), 'same'); ve = np.convolve(np.clip(ve * 7, 0, 1), np.ones(int(.14 * SR)) / int(.14 * SR), 'same')
bed_duck = 1 - .55 * ve; fx_duck = 1 - .25 * ve
# kick bilan musiqa "pompa" (sidechain): kick vaqtlarida pasayish
pump = np.ones(N)
for b in range(nb):
    t0 = b * BEAT
    if t0 < st[1] or t0 >= TOTAL: continue
    i0 = int(t0 * SR); k = np.arange(int(BEAT * .5 * SR)) / SR; pump[i0:i0 + len(k)] *= 1 - .45 * np.exp(-k * 14)
out = []
for ch in range(2):
    bed = BED[ch]; bed = bed / (np.max(np.abs(BED[0])) + 1e-9) * .8
    out.append(np.tanh(bed * pump * bed_duck * 1.1) * .62 + np.tanh(FX[ch] * fx_duck * .9) * .75 + voice * .98)
fade = np.clip((TOTAL - np.arange(N) / SR) / .8, 0, 1)
L, R = out[0] * fade, out[1] * fade; pk = max(np.max(np.abs(L)), np.max(np.abs(R))); L /= pk / .93; R /= pk / .93
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
with wave.open('mix2.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('mix2 ok', TOTAL)
