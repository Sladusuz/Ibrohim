# Musiqa/SFX: python3 video/kit/audio_kit.py v1  -> video/out/music-<id>.wav   (tl/<id>.js + tl/<id>.fx.json kerak)
import re, json, sys, os
H = os.path.dirname(os.path.abspath(__file__)); vid = sys.argv[1]
TL = json.loads(re.search(r'window\.TLK=(\{.*\});', open(f'{H}/tl/{vid}.js').read(), re.S).group(1))
FX = json.load(open(f'{H}/tl/{vid}.fx.json'))
END = TL['end']; starts = [s['start'] for s in TL['scenes']]
src = open(f'{H}/../audio.py').read().split('BPM = 120')[0].replace('DUR = 37.5', 'DUR = %s' % (END + 1.8))
exec(src)
import wave
def zing(f, d=.5, g=.35): t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 7) * g
def tickh(g=.2): t = T(.025); return np.sin(2 * np.pi * 3600 * t) * np.exp(-t * 220) * g
BPM = 116; B = 60 / BPM
prog = [(110, 1.189, 1.5), (87.3, 1.26, 1.5), (130.8, 1.26, 1.5), (98, 1.26, 1.5)]
# kirish: past tarang pad (1-sahna boshigacha), keyin ritm
s1 = starts[1] if len(starts) > 1 else 4.0
put(pad([55, 82.4], s1 + .2, .09), 0, 1.0)
put(riser(max(.8, s1 - .1), .4), 0, 1.0)
t0 = s1; bar = 0
while t0 < END - .5:
    r, m1, m2 = prog[bar % 4]
    for beat in range(4):
        tb = t0 + beat * B
        if tb > END - .4: break
        put(kick(.38, 150, 48), tb, .75)
        if beat % 2 == 1: put(clap(), tb, .6)
        put(hat(), tb + B / 2, .6, .3); put(hat(), tb + B / 4, .35, -.3); put(hat(), tb + 3 * B / 4, .35, .3)
        put(bass(r, B * .46), tb + B / 2, .75)
        put(pluck(r * 4 * (m1 if beat % 2 else 1), .22), tb, .2, -.3 + .2 * beat); put(pluck(r * 4 * m2, .22), tb + B / 2, .18, .3)
    put(pad([r * 2, r * 2 * m1, r * 2 * m2], 4 * B + .3, .06), t0, 1.0)
    t0 += 4 * B; bar += 1
for i, s in enumerate(starts):
    if i == 0: put(boom(1.0, .8), s + .05, 1.0); put(sparkle(1.0, .25), s + .1, 1.0); continue
    put(whoosh(.4, False, 5000, 300, .4), s - .3, 1.0); put(boom(1.1, .9), s, 1.0)
last = -1
for e in sorted(FX, key=lambda x: x['t']):
    t = e['t']
    if e['k'] in ('scene',): continue
    if e['k'] == 'shake': put(boom(.9, .8), t, 1.0); continue
    if t - last < .22: continue
    last = t; k = e['k']
    if k in ('pill', 'chip', 'photo', 'logo'): put(pop(620, .12, .45), t, 1.0, -.2); put(zing(1318, .45, .25), t + .06, 1.0)
    elif k in ('list', 'cards', 'flow'): put(pop(540, .12, .4), t, 1.0, .2); put(zing(1568, .4, .2), t + .06, 1.0)
    elif k in ('num', 'ring'): put(boom(.7, .6), t, 1.0); put(kaching(.35), t + .1, 1.0); put(sparkle(1.2, .22), t + .15, 1.0)
    elif k in ('notif', 'chat'): put(zing(1760, .6, .3), t, 1.0); put(pop(700, .12, .35), t, 1.0)
    elif k == 'btn': put(pop(800, .16, .5), t, 1.0); put(boom(.8, .6), t, 1.0); put(zing(2093, 1.0, .25), t + .1, 1.0)
    else: put(whoosh(.3, True, 400, 3500, .22), t - .1, 1.0)
for i, f in enumerate((1568, 2093, 2637)): put(zing(f, 1.4, .26), END - 2.2 + i * .13, 1.0)
fade = np.ones(N); fi = int((END + .6) * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.04 * SR)] = np.linspace(0, 1, int(.04 * SR))
out = np.stack([L * fade, R * fade], 1); out = np.tanh(out * .95); out /= max(1e-9, np.abs(out).max()) / .62
pcm = (out * 32767).astype(np.int16)
with wave.open(f'{H}/../out/music-{vid}.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('musiqa', vid, round(N / SR, 1), 's')
