import sys,json
from faster_whisper import WhisperModel
m=WhisperModel('small',device='cpu',compute_type='int8')
import numpy as np, wave
for f in sys.argv[1:]:
    w=wave.open(f); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    segs,_=m.transcribe(a,language='uz',word_timestamps=True,vad_filter=False,beam_size=5)
    out=[]
    for s in segs: out.append((round(s.start,2),round(s.end,2),s.text.strip(),[(round(w.start,2),round(w.end,2),w.word) for w in s.words]))
    json.dump(out,open(f+'.json','w'),ensure_ascii=False)
    print('==',f)
    for o in out: print(o[0],o[1],o[2])
