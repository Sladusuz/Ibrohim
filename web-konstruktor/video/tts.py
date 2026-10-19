# Ovozli versiya (TAJRIBA): gTTS o'zbekchani qo'llamaydi, shuning uchun o'zbek lotin matni turkcha ovozga moslab o'qitiladi.
import subprocess, os, re
from gtts import gTTS
LINES = [
 (0.45, 2.6, "Tun. Siz uxlayapsiz."),
 (3.4, 4.6, "Mijoz yozadi. Javob yo'q. Ular ketadi."),
 (8.8, 1.9, "Siz uxlaysiz. Bot sotadi."),
 (11.4, 8.0, "Bot javob beradi, buyurtma oladi, to'lovni qabul qiladi va sizga qo'ng'iroq qiladi."),
 (20.4, 6.8, "Saytni o'zingiz yarating. Matn ustiga bosing."),
 (28.1, 3.8, "Agentlikda ikki yarim million. Bizda o'n dollar."),
 (32.7, 3.0, "Bugun boshlang."),
]
def tr(s):  # turkcha talaffuzga yaqinlashtirish
    s = s.replace("g'", 'g').replace("o'", 'o').replace("O'", 'O').replace("'", '')
    for a, b in (('sh', 'ş'), ('ch', 'ç'), ('Sh', 'Ş'), ('Ch', 'Ç'), ('q', 'k'), ('Q', 'K'), ('x', 'h'), ('X', 'H'), ('j', 'c'), ('J', 'C')): s = s.replace(a, b)
    return s
os.makedirs('/tmp/tts', exist_ok=True); parts = []
for i, (t0, win, text) in enumerate(LINES):
    mp3 = f'/tmp/tts/{i}.mp3'; gTTS(tr(text), lang='tr').save(mp3)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).decode())
    tempo = max(1.0, min(1.3, d / win)); wav = f'/tmp/tts/{i}.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mp3, '-af', f'atempo={tempo:.3f},highpass=f=90,loudnorm=I=-16:TP=-2', '-ar', '44100', '-ac', '2', wav], check=True)
    parts.append((t0, wav)); print(i, round(d, 2), 'oyna', win, 'tempo', round(tempo, 2))
cmd = ['ffmpeg', '-y', '-v', 'error']; flt = []
for i, (t0, wav) in enumerate(parts): cmd += ['-i', wav]; flt.append(f'[{i}:a]adelay={int(t0 * 1000)}|{int(t0 * 1000)}[a{i}]')
flt.append(''.join(f'[a{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur=37.5[v]')
cmd += ['-filter_complex', ';'.join(flt), '-map', '[v]', '-t', '37.5', 'video/out/voice.wav']; subprocess.run(cmd, check=True); print('voice.wav tayyor')
