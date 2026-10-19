# 2-3-videolar uchun musiqa/SFX. Ishlatish: python3 video/audio2.py talaba|klinika  -> video/out/music-<nom>.wav
# audio.py dagi sintez funksiyalari qayta ishlatiladi (BPM qatorigacha bo'lgan qismi).
import sys, re
which = sys.argv[1]
src = open(__file__.replace('audio2.py', 'audio.py')).read().split('BPM = 120')[0]
CFG = {'talaba': dict(dur=30.5, drop=8.05, end=30.0, fade=28.6), 'klinika': dict(dur=32.5, drop=9.0, end=32.0, fade=30.8)}[which]
src = src.replace('DUR = 37.5', 'DUR = %s' % CFG['dur'])
exec(src)
import os, wave
BPM = 120; B = 60 / BPM; N_ = N
duck = np.ones(N)
def kick_at(t0, g=1.0): put(kick(), t0, .85 * g)
D = CFG['drop']; E = CFG['end']
# ---- drop'gacha: keskin muhit
put(pad([55, 82.4, 110], D - .1, .09), 0, 1.0); put(sine(41, D) * env(int(D * SR), .5, .3, .8, .8) * .25, 0, 1)
for k in range(int(D / .5)): put(tick(.2), k * .5 + .1, 1.0, .3)
# bass-puls drop'gacha
t0 = 3.3
while t0 < D - .3: kick_at(t0, .7); put(bass(55 if int((t0 - 3.3) / B) % 4 else 49, .4), t0 + B / 2, .7); t0 += B
put(riser(D - 6.2 if False else 1.6, .45), D - 1.7, 1.0)
if which == 'talaba':
    for t1 in (.5, 1.2, 1.9, 2.6, 3.0): put(ding(1480 + 90 * (t1 > 2), .8, .3), t1, 1.0, -.3 + t1 / 6)   # bildirishnoma: muddat
    for t1 in (3.5, 4.6, 5.7, 6.8): put(boom(.6, .6), t1, 1.0); put(whoosh(.4, True, 300, 4000, .3), t1 - .2, 1.0)
else:
    for k in range(3): put(click(.45), 1.0 + k * .12, 1.0)
    for t1 in (1.2, 1.55, 1.9): put(pop(520 + 60 * (t1 > 1.5), .12, .4), t1, 1.0)
    put(boom(1.0, .8), 2.5, 1.0)
    for k in range(int(1.0 / .09)): put(tick(.12 + .1 * k / 11), 2.6 + k * .09, 1.0, .2)
    for t1 in (3.7, 4.7, 5.7, 6.7): put(boom(.7, .7), t1, 1.0); put(whoosh(.45, True, 300, 4000, .35), t1 - .22, 1.0)
# ---- drop
put(whoosh(.5, False, 5000, 300, .5), D - .3, 1.0); put(boom(2.0, 1.15), D, 1.0); put(sparkle(1.4, .35), D + .1, 1.0)
chords = [(110, 130.8, 164.8), (87.3, 110, 130.8), (130.8, 164.8, 196), (98, 123.5, 146.8)]
roots = [55, 43.65, 65.4, 49]; penta = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3]
arp = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 5, 4, 2, 3]; mul = [1, .794, 1.189, .89]
t0 = D; bar = 0
while t0 < E + .5:
    cb = chords[bar % 4]; dd = 4 * B
    put(pad(cb, dd + .4, .07), t0, 1.0)
    for beat in range(4):
        tb = t0 + beat * B
        if tb > E - 1.2: break
        kick_at(tb, 1.0); put(hat(), tb + B / 2, .9, .3); put(hat(), tb + B / 4, .5, -.3); put(hat(), tb + 3 * B / 4, .5, .3)
        if beat % 2 == 1: put(clap(), tb, .85)
        put(bass(roots[bar % 4] * (1 if beat != 3 else 1.5), B * .45), tb + B / 2, .9)
        for s in range(4): put(pluck(penta[arp[(beat * 4 + s) % 16]] * mul[bar % 4]), tb + s * B / 4, .26, -.4 + .2 * s)
    t0 += dd; bar += 1
put(ding(1760, 2.0, .35), E - 1.2, 1.0); put(ding(2349, 2.0, .25), E - 1.05, 1.0)
# ---- hodisa ovozlari (sahnaga bog'liq)
if which == 'talaba':
    for t1 in (10.3, 13.4, 20.3, 25.6): put(whoosh(.6, True, 300, 4500, .4), t1 - .1, 1.0)
    for t1 in (10.9, 11.5, 12.1, 12.7): put(pop(500 + 90 * ((t1 * 3) % 4), .12, .4), t1, 1.0)
    put(pop(800, .15, .5), 13.6, 1.0)
    for k in range(14): put(click(.25 + .1 * rnd.random()), 15.4 + k * .1, 1.0, .1)
    put(click(.6), 17.4, 1.0); put(ding(1568, .8, .35), 17.5, 1.0); put(ding(2093, .8, .28), 17.62, 1.0)
    put(whoosh(.5, True, 400, 3500, .35), 18.2, 1.0); put(ding(1318, .9, .35), 19.3, 1.0); put(ding(1760, .9, .3), 19.5, 1.0); put(sparkle(1.4, .3), 19.4, 1.0)
    put(boom(.7, .6), 25.9, 1.0); put(kaching(.5), 25.9, 1.0); put(sparkle(1.6, .3), 26.0, 1.0)
else:
    put(whoosh(.6, True, 300, 4500, .4), 11.2, 1.0); put(pop(520), 11.5, 1.0, .3)
    for t1 in (12.7, 14.5, 16.4): put(pop(700, .12, .4), t1, 1.0, -.2)
    for k in range(22): put(click(.25 + .1 * rnd.random()), 17.2 + k * .075, 1.0, .1)
    put(click(.6), 19.0, 1.0); put(ding(1568, .8, .35), 19.4, 1.0); put(ding(2093, .8, .28), 19.52, 1.0); put(sparkle(1.4, .3), 19.5, 1.0)
    put(whoosh(.7, True, 300, 5000, .45), 20.3, 1.0); put(boom(.9, .8), 20.9, 1.0); put(sparkle(1.6, .35), 21.0, 1.0); put(kaching(.45), 21.0, 1.0)
    for t1 in (23.0, 24.6): put(whoosh(.6, True, 300, 4000, .4), t1 - .2, 1.0)
    put(whoosh(.5, True, 300, 4500, .4), 27.5, 1.0)
put(boom(.8, .8), E - 4.3 if which == 'klinika' else E - 4.2, 1.0)
put(pop(900, .18, .6), E - 3.0, 1.0); put(whoosh(.5, False, 5000, 300, .5), E - 2.7, 1.0)
for k in range(3): put(pop(700 + 140 * k, .14, .45), E - 2.1 + k * .45, 1.0)
fade = np.ones(N); fi = int(CFG['fade'] * SR); fade[fi:] = np.linspace(1, 0, N - fi); fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
out = np.stack([L * fade, R * fade], 1); out = np.tanh(out * .95); out /= max(1e-9, np.abs(out).max()) / .62
pcm = (out * 32767).astype(np.int16); os.makedirs('video/out', exist_ok=True)
with wave.open('video/out/music-%s.wav' % which, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('tayyor', which, round(N / SR, 1), 's')
