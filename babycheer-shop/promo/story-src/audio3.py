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


def pop():
    t = tt(.12); f = 500 + 900 * (t / .12); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32) * .5 + hp(noise(.12), 3000) * np.exp(-t * 120) * .12

# ---------- hikoya musiqasi ----------
BEAT = 0.625
SS = [s['start'] for s in S] + [TL['total']]
def at(i, k): return S[i]['wt'][min(k, len(S[i]['wt']) - 1)]
NOTE = {'A3': 220, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392, 'A4': 440, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880}
MINOR = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
MAJOR = [[261.63, 329.63, 392], [196, 246.94, 293.66], [220, 261.63, 329.63], [174.61, 220, 261.63]]
ROOT_MIN = [55, 43.65, 65.41, 49]; ROOT_MAJ = [65.41, 49, 55, 43.65]
MEL_SAD = ['E5', 'C5', 'D5', 'A4', 'E5', 'D5', 'C5', 'B4', 'A4', 'C5', 'E5', 'D5']
MEL_HOPE = ['G4', 'C5', 'E5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'C5', 'G4', 'A4']
def sec(t):
    for i in range(10):
        if SS[i] <= t < SS[i + 1]: return i
    return 9
bell_t = at(7, 3); boxT = at(7, 7) + .15; eyes_t = at(7, 9) - .1; app_t4 = at(6, 7) + .55
nb = int(TOTAL / BEAT) + 1
for b in range(nb):
    t0 = b * BEAT; i = sec(t0); bar = (b // 4) % 4; q = b % 4
    if t0 >= TOTAL: break
    hopeful = i >= 6
    ch = (MAJOR if hopeful else MINOR)[bar]; rt = (ROOT_MAJ if hopeful else ROOT_MIN)[bar]
    # pad (har taktda)
    if q == 0 and i != 7 or (i == 7 and q == 0 and t0 >= boxT - .2): [put(BED, pad(f * (.5 if i < 3 else 1), BEAT * 4.2), t0, 0, (2.4 if i <= 6 else 1.2)) for f in ch]
    # musiqa qutisi (yig'loqi) yoki umid melodiyasi
    if i <= 6 and q == 0: put(BED, sub808(rt * 2, BEAT * 3.6) * .6, t0, 0, .9)
    if i in (0, 1, 2, 3, 4, 5):
        if b % 2 == 0 and not (i == 0 and t0 < 1.0): put(BED, music_box(NOTE[MEL_SAD[(b // 2) % len(MEL_SAD)]]), t0, .2, 1.3 if i < 3 else 1.0)
        if i in (1, 2) and q in (0, 2): put(BED, kick(.4), t0, 0, .45)  # yurak urishi
        if i in (3, 4, 5) and q in (0, 2): put(BED, tick(), t0, 0, .5)
    if i == 5 and t0 > SS[5] + 3.0: [put(BED, supersaw(f, BEAT * 2, 1800), t0, 0, .12 * (t0 - SS[5]) / 7) for f in ch] if q % 2 == 0 else None
    if i == 6:  # ilova: yengil ritm
        put(BED, kick(.7), t0, 0, .6 if q in (0, 2) else 0.0) if q in (0, 2) else None
        put(BED, hat(False, .6), t0 + BEAT / 2, .3, .6)
        for k in range(2): put(BED, pluck(ch[(b + k) % 3] * 2, .2), t0 + k * BEAT / 2, -.4 if k else .4, .55)
    if i == 7:
        if t0 < bell_t - .1 and q == 0: put(BED, music_box(NOTE['E5']), t0, .2, .35)
        if t0 >= boxT - .15:  # quvonchli drop
            put(BED, kick(), t0, 0, .95)
            if q in (1, 3): put(BED, clap(), t0, 0, .8)
            put(BED, hat(False, .8), t0 + BEAT / 2, .3, .8); put(BED, sub808(rt, BEAT * .9), t0, 0, .8)
            for k in range(4): put(BED, pluck(ch[[0, 2, 1, 2][k] % 3] * 2, .2), t0 + k * BEAT / 4, -.5 if k % 2 else .5, .55)
    if i == 8:
        if q in (0, 2): put(BED, kick(.7), t0, 0, .55)
        if b % 2 == 0: put(BED, music_box(NOTE[MEL_HOPE[(b // 2) % len(MEL_HOPE)]] * 1.0), t0, .2, .7)
        put(BED, supersaw(ch[0] * 2, BEAT * 2, 3000), t0, 0, .12) if q % 2 == 0 else None
    if i == 9:
        put(BED, kick(), t0, 0, .95)
        if q in (1, 3): put(BED, clap(), t0, 0, .8)
        put(BED, hat(False, .8), t0 + BEAT / 2, .3, .8)
        if q == 3: put(BED, hat(True), t0 + BEAT * .75, -.3, .7)
        put(BED, sub808(rt, BEAT * .9), t0, 0, .8)
        for k in range(4): put(BED, pluck(ch[[0, 2, 1, 2][k] % 3] * 2, .2), t0 + k * BEAT / 4, -.5 if k % 2 else .5, .6)

# ---------- effektlar ----------
for k in (0, 1, 2): pass
# shamol (tungi fon): S0..S2
def wind(d):
    n = noise(d); t = np.arange(len(n)) / SR; mod = .5 + .5 * np.sin(2 * np.pi * .13 * t) * np.sin(2 * np.pi * .07 * t + 1); return bp(n, 120, 900) * mod * .5
put(FX, wind(SS[3]), 0, 0, .35)
put(FX, riser(S[0]['dur'] * .7), S[0]['start'] + S[0]['dur'] * .3, 0, .35); put(FX, tick(), at(0, 1), 0, .9)
for i, k in [(1, 0), (2, 0)]: put(FX, whoosh(.5, False, .5), S[i]['start'] - .1, 0, .3)
# o'yinchoq mashinalar uzoqdan (past gum)
def hum(d): t = tt(d); return np.sin(2 * np.pi * 120 * t) * (.5 + .5 * np.sin(2 * np.pi * 3 * t)) * .06 + lp(noise(d), 300) * .05
put(FX, hum(S[1]['dur']), S[1]['start'], .4, .6)
# tug'ilgan kun
put(FX, whoosh(.45, True, .6), at(2, 3) - .25, 0, .5); put(FX, bell(1318.5, 1.6), at(2, 4), .2, .6)
for i in range(7): put(FX, whoosh(.4, True, .4), at(2, 4) + i * .08, (-.6 + i * .2), .25)
# xabarlar
CHATM = [(at(3, 1) + .1, at(3, 2), 'in'), (at(4, 2) + .05, at(4, 3), 'out'), (at(5, 1) + .1, at(5, 2), 'in'), (at(5, 13) + .35, at(5, 14) + .5, 'out')]
for tp, tm, d in CHATM:
    n = int((tm - tp) / .13)
    for k in range(max(0, n)): put(FX, blip(1100 + (k % 3) * 120, .06), tp + k * .13, 0, .18)
    put(FX, pop(), tm, .3 if d == 'in' else -.3, .6); put(FX, whoosh(.25, True, .4), tm - .12, 0, .35) if d == 'out' else put(FX, bell(1568, .5), tm, .3, .3)
put(FX, sparkle(5, .6, 2400), at(5, 2) + .5, 0, .3)
# ilova
put(FX, whoosh(.7, True, .8), S[6]['start'] + .1, 0, .55)
for tt_ in (at(6, 3), at(6, 5) + .1, at(6, 7) - .15): put(FX, blip(1800, .08), tt_, 0, .6); put(FX, thud(.2), tt_, 0, .35)
put(FX, sparkle(7, .9, 2000), app_t4 - .45, 0, .6); put(FX, bell(1568, 1.5), app_t4 - .4, .2, .6); put(FX, confpop(), app_t4 - .4, 0, .55)
# ertalab
for k in range(6): put(FX, np.sin(2 * np.pi * np.cumsum(np.linspace(3200, 4600, int(.12 * SR))) / SR) * np.exp(-tt(.12) * 18) * .2, S[7]['start'] + .2 + k * .35 + (k % 2) * .08, (-.5 + k * .2), .5)
put(FX, bell(659.25, 1.8), bell_t, .1, .9); put(FX, bell(523.25, 2.2), bell_t + .5, .1, .9)
run_t = at(7, 5)
for k in range(5): put(FX, thud(.15), run_t + k * .22, 0, .25)
put(FX, hp(lp(noise(1.0), 900), 200) * np.sin(np.pi * tt(1.0) / 1.0) * .5, at(7, 6), 0, .55)  # eshik g'ichirlashi
put(FX, supersaw(261.63, 2.2, 3500) * (tt(2.2) / 2.2) ** 1.6 * .5, at(7, 6) + .1, 0, .5)
put(FX, hp(noise(.5), 1200) * np.exp(-tt(.5) * 9) * .4, boxT, 0, .6); put(FX, hp(noise(.5), 1200) * np.exp(-tt(.5) * 9) * .4, boxT + .12, 0, .45)
put(FX, sparkle(10, 1.4, 1700), boxT + .1, 0, .7); put(FX, impact(1.4), boxT + .15, 0, .6); put(FX, confpop(), boxT + .2, 0, .65)
put(FX, revcrash(.6), eyes_t - .55, 0, .6); put(FX, impact(1.6), eyes_t, 0, .8); put(FX, sparkle(9, 1.2, 2100), eyes_t + .05, 0, .8)
# yakun
e0 = S[8]['start']; put(FX, impact(2.2), at(8, 0), 0, .85); put(FX, sparkle(8, 1.2, 1800), at(8, 0), 0, .5)
put(FX, whoosh(.4, True, .5), at(8, 1) - .2, 0, .4); put(FX, whoosh(.4, True, .5), at(8, 3) - .2, 0, .4); put(FX, impact(1.0), at(8, 4) - .02, 0, .6)
put(FX, riser(S[8]['dur'] * .6), e0 + S[8]['dur'] * .4, 0, .5)
c0 = S[9]['start']; put(FX, impact(2.6), c0, 0, 1.0); put(FX, kick(1.3), c0, 0, 1.0); put(FX, sparkle(9, 1.2, 1900), c0 + .1, 0, .6); put(FX, confpop(), c0 + .15, 0, .6)
for i in range(5): put(FX, blip(1000 + i * 200, .16), c0 + .5 + i * .12, (-.6 + i * .3), .55)
put(FX, blip(900), c0 + 1.2, 0, .5); put(FX, ping(1400), at(9, 5) - .05, 0, .6); put(FX, confpop(), at(9, 9), 0, .7); put(FX, sparkle(8, 1.0, 2100), at(9, 9), 0, .5)

# ---------- ovoz va aralashtirish ----------
voice = np.zeros(N)
for s in S:
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f"audio/l{s['i']}.wav", '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']); v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    i0 = int(s['vstart'] * SR); voice[i0:i0 + len(v)] += v[: N - i0]
voice = voice / (np.max(np.abs(voice)) + 1e-9) * .95; voice = hp(voice, 70, 2)
ve = np.convolve(np.abs(voice), np.ones(int(.05 * SR)) / int(.05 * SR), 'same'); ve = np.convolve(np.clip(ve * 7, 0, 1), np.ones(int(.14 * SR)) / int(.14 * SR), 'same')
bed_duck = 1 - .5 * ve; fx_duck = 1 - .22 * ve
pump = np.ones(N)
for b in range(nb):
    t0 = b * BEAT
    if (sec(t0) in (9,) or (sec(t0) == 7 and t0 >= boxT - .15)) and t0 < TOTAL:
        i0 = int(t0 * SR); k = np.arange(min(int(BEAT * .5 * SR), N - i0)) / SR; pump[i0:i0 + len(k)] *= 1 - .4 * np.exp(-k * 14)
out = []
for ch_ in range(2):
    bed = BED[ch_] / (np.max(np.abs(BED[0])) + 1e-9) * .8
    out.append(np.tanh(bed * pump * bed_duck * 1.1) * .62 + np.tanh(FX[ch_] * fx_duck * .9) * .75 + voice * .98)
fade = np.clip((TOTAL - np.arange(N) / SR) / .8, 0, 1)
L, R = out[0] * fade, out[1] * fade; pk = max(np.max(np.abs(L)), np.max(np.abs(R))); L /= pk / .93; R /= pk / .93
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
with wave.open('mix3.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('mix3 ok', TOTAL)
