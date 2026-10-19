import json, re, subprocess, sys
lines = json.load(open('lines3.json'))
MINDUR = [4.6, 6.2, 5.6, 5.2, 4.4, 9.8, 7.6, 8.8, 5.4, 7.0]  # sahna uchun minimal davomiylik
GAP = [.55, .5, .5, .45, .45, .6, .5, .6, .6, 1.0]
asr = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else None
starts = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
t = 0.0; scenes = []
for i, text in enumerate(lines):
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'audio/l{i}.wav']).decode())
    dur = max(d + GAP[i] + .2, MINDUR[i]); vstart = t + .2
    ws = text.split(); w = [len(re.sub(r"[^\w']", '', x)) + 2 + (2.5 if re.search(r'[.,!?]["]?$', x) else 0) for x in ws]; tot = sum(w); acc = 0.0; wt = []
    for j in range(len(ws)): wt.append(round(vstart + acc / tot * d, 3)); acc += w[j]
    if asr and starts:
        cut = starts['cut'][i]; toks = [x['a'] for x in asr if starts['s'][i] - .05 <= x['a'] < (starts['s'][i + 1] - .05 if i < 9 else 999)]
        n = len(ws); wt = []
        for j in range(n):
            if j == 0: e = starts['s'][i]
            else:
                f = j * (len(toks) - 1) / (n - 1) if len(toks) > 1 else 0; lo = int(f); hi = min(lo + 1, len(toks) - 1); e = toks[lo] + (toks[hi] - toks[lo]) * (f - lo)
            wt.append(round(vstart + (e - cut), 3))
    scenes.append({'i': i, 'start': round(t, 3), 'dur': round(dur, 3), 'vstart': round(vstart, 3), 'vdur': d, 'text': text, 'wt': wt}); t += dur
json.dump({'beat': 0.625, 'total': round(t + 1.2, 3), 'scenes': scenes}, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(t + 1.2, 2), [(s['i'], round(s['start'], 1), round(s['dur'], 1)) for s in scenes])
