#!/usr/bin/env python3
"""Spetsifikatsiya matnini ovozga moslaydi.  python3 align.py v1 [voice.mp3]   (mp3 bo'lmasa taxminiy vaqt)
Natija: tl/<id>.js (window.TLK), tl/<id>.tts.txt (ElevenLabs uchun matn)."""
import sys, json, re, subprocess, os
H = os.path.dirname(os.path.abspath(__file__))
vid = sys.argv[1]; mp3 = sys.argv[2] if len(sys.argv) > 2 else None
specs = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./specs.js')))"], cwd=H))
sp = specs[vid]
def expand(chunk):
    disp = re.sub(r'<<(.*?)::(.*?)>>', r'\1', chunk); spk = re.sub(r'<<(.*?)::(.*?)>>', r'\2', chunk)
    return disp.strip(), re.sub(r'[*_^~]', '', spk).strip()
scenes = []; words = []  # words: (scene, chunk, text, weight, endpause)
tts = []
for si, s in enumerate(sp['scenes']):
    chunks = [expand(c) for c in s['say'].split('|')]
    sw = []
    for ci, (d, k) in enumerate(chunks):
        for w in k.split():
            clean = re.sub(r"[^\w'’ʻ]", '', w, flags=re.U)
            pause = .5 if re.search(r'[.?!]$', w) else (.2 if re.search(r'[,:;—-]$', w) else 0)
            words.append(dict(sc=si, ch=ci, txt=clean, wt=max(2, len(clean)) + 1, pause=pause)); sw.append(clean)
    scenes.append(dict(chunks=chunks, sw=sw))
    tts.append(s.get('tag', '') + ' ' + ' '.join(k for d, k in chunks) + ' [pause 0.4s]')
open(f'{H}/tl/{vid}.tts.txt', 'w').write('\n'.join(tts) + '\n')
tot = sum(w['wt'] for w in words)
if mp3:
    out = subprocess.run(['ffmpeg', '-i', mp3, '-af', 'silencedetect=noise=-33dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).expand(r'\1') if False else 0)
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out); dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    sil = []; st = None
    for ln in out.splitlines():
        a = re.search(r'silence_start: ([\d.]+)', ln); b = re.search(r'silence_end: ([\d.]+)', ln)
        if a: st = float(a.group(1))
        if b and st is not None: sil.append((st, float(b.group(1)))); st = None
    if st is not None: sil.append((st, dur))
    iv = []; cur = 0.0
    for a, b in sil:
        if a - cur > .05: iv.append((cur, a))
        cur = b
    if dur - cur > .05: iv.append((cur, dur))
    ST = sum(b - a for a, b in iv)
    def real(sp_t):  # nutq soati -> haqiqiy vaqt
        acc = 0
        for a, b in iv:
            if sp_t <= acc + (b - a): return a + (sp_t - acc)
            acc += b - a
        return iv[-1][1]
    cum = 0
    for w in words:
        w['t0'] = real(ST * cum / tot); cum += w['wt']; w['t1'] = real(ST * cum / tot)
    END = dur + .9
else:
    t = .3; RATE = 14.0
    for w in words:
        w['t0'] = t; t += w['wt'] / RATE; w['t1'] = t; t += w['pause']
    END = t + 1.4
sc_out = []; caps = []; k = 0
for si, s in enumerate(scenes):
    ws = [w for w in words if w['sc'] == si]
    start = 0 if si == 0 else max(sc_out[-1]['start'] + .5, ws[0]['t0'] - .12)
    sc_out.append(dict(start=round(start, 2), words=[round(w['t0'], 2) for w in ws], sw=[w['txt'] for w in ws]))
    for ci, (d, kk) in enumerate(s['chunks']):
        cw = [w for w in ws if w['ch'] == ci]
        if not cw: continue
        nxt = [w for w in ws if w['ch'] == ci + 1]
        t1 = cw[-1]['t1'] + .12
        if nxt and nxt[0]['t0'] - cw[-1]['t1'] < .6: t1 = nxt[0]['t0']
        caps.append([d, round(cw[0]['t0'], 2), round(t1, 2)])
open(f'{H}/tl/{vid}.js', 'w').write('window.TLK=' + json.dumps(dict(scenes=sc_out, caps=caps, end=round(END, 2)), ensure_ascii=False) + ';')
print(vid, 'tayyor', round(END, 1), 's', 'REAL' if mp3 else 'taxmin')
