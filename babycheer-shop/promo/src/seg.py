import json, math, subprocess
BEAT = 60/124
STARTS = [0.0, 3.11, 5.87, 12.38, 16.88, 20.73, 25.33, 29.93, 32.85]; END = 38.53
asr = json.load(open('asr.json')); lines = json.load(open('lines.json'))
cut = [max(0, s - 0.06) for s in STARTS]; cend = [STARTS[i + 1] - 0.10 for i in range(8)] + [END]
for i in range(9):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{cut[i]:.3f}', '-to', f'{cend[i]:.3f}', '-i', 'eleven.mp3', '-af', 'afade=t=in:d=0.015,afade=t=out:st=%.3f:d=0.03' % (cend[i] - cut[i] - 0.03), '-ar', '44100', '-ac', '1', f'audio/l{i}.wav'], check=True)
t = 0.0; scenes = []
for i, text in enumerate(lines):
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'audio/l{i}.wav']).decode())
    dur = math.ceil((d + 0.30) / BEAT) * BEAT
    vstart = t + 0.10
    toks = [w['a'] for w in asr if STARTS[i] - 0.05 <= w['a'] < (STARTS[i + 1] - 0.05 if i < 8 else 99)]
    n = len(text.split())
    wt = []
    for j in range(n):
        if j == 0: e = STARTS[i]
        else:
            f = j * (len(toks) - 1) / (n - 1) if len(toks) > 1 else 0; lo = int(f); hi = min(lo + 1, len(toks) - 1); e = toks[lo] + (toks[hi] - toks[lo]) * (f - lo)
        wt.append(round(vstart + (e - cut[i]), 3))
    scenes.append({'i': i, 'start': round(t, 4), 'dur': round(dur, 4), 'vstart': round(vstart, 4), 'vdur': d, 'text': text, 'wt': wt})
    t += dur
json.dump({'beat': BEAT, 'total': round(t + 2 * BEAT, 3), 'scenes': scenes}, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(t + 2 * BEAT, 2), [round(s['start'], 2) for s in scenes], [round(s['vdur'], 2) for s in scenes])
