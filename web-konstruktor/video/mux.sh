# usage: mux.sh voice.mp3 music.wav silent.mp4 out.mp4 "start:end:at:tempo ..."
V=$1; M=$2; S=$3; O=$4; shift 4; i=0; FC=""; LAB=""
for seg in $@; do IFS=: read a b at tp <<<"$seg"; ms=$(python3 -c "print(int($at*1000))")
FC="$FC[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print(round($b-$a-0.04,3))"):d=0.04,atempo=$tp,adelay=$ms|$ms[v$i];"; LAB="$LAB[v$i]"; i=$((i+1)); done
FC="$FC${LAB}amix=inputs=$i:normalize=0,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,volume=1.6[vo];[vo]asplit[vo1][vo2];[1:a]volume=0.62[mu];[mu][vo1]sidechaincompress=threshold=0.03:ratio=8:attack=10:release=350[du];[du][vo2]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=9,apad[a]"
ffmpeg -y -loglevel error -i $V -i $M -i $S -filter_complex "$FC" -map 2:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t $(ffprobe -v error -show_entries format=duration -of csv=p=0 $S) -movflags +faststart $O
