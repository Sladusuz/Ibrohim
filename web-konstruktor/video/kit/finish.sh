#!/bin/bash
# bash video/kit/finish.sh v1 /path/voice.mp3  -> video/out/impro-v1.mp4 (ovozli, tayyor)
set -e; ID=$1; IN=$2; cd "$(dirname "$0")/.."
ffmpeg -y -v error -i "$IN" -af "adelay=300|300,apad=pad_dur=0.2" -ar 44100 -ac 1 out/voice-$ID.wav
python3 kit/align.py $ID out/voice-$ID.wav
node kitfx.js $ID
python3 kit/audio_kit.py $ID
DUR=$(python3 -c "import re,json;print(json.loads(re.search(r'window\.TLK=(\{.*\});',open('kit/tl/$ID.js').read(),re.S).group(1))['end'])")
AD=kit/kit.html QS=v=$ID OUT=silent-$ID node render.js full 30 $DUR | tail -1
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/voice-$ID.wav)
bash mux.sh out/voice-$ID.wav out/music-$ID.wav out/silent-$ID.mp4 out/impro-$ID.mp4 "0:$VD:0:1"
ffprobe -v error -show_entries format=duration -of csv=p=0 out/impro-$ID.mp4
