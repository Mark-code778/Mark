#!/bin/bash
# рендер кусками по 60 с (можно перезапускать: готовые куски пропускаются), затем склейка
cd "$(dirname "$0")/../.."
P=projects/rewind-10; D=$P/build/seg; mkdir -p $D
DUR=1290.12
for s in $(seq 0 60 1260); do
  e=$((s+60)); f=$D/seg_$(printf %04d $s).mp4
  [ -s "$f" ] && continue
  node render.mjs --project $P --from $s --to $e --out "$f" --workers 4 || exit 1
done
ls $D/seg_*.mp4 | sed "s/^/file '/; s/$/'/" | sed "s|file '$D/|file '|" > $D/list.txt
(cd $D && ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c copy ../video_silent.mp4) && echo ALLDONE
