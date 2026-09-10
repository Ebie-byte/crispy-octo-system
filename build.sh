#!/usr/bin/env bash
# VERTEXIA WEB STUDIOS — final assembly
# Renders the 9-scene Reel master: 1080x1920, 9:16, 24fps, silent AAC track.
#
#   ./build.sh <scene8-image> <scene9-image>
#
# Scenes 1-7 come from assets/. Scenes 8 and 9 are stills supplied on the
# command line so the script can run the moment they arrive.
set -euo pipefail

A="$(cd "$(dirname "$0")" && pwd)/assets"
OUT="${OUT:-$PWD/VERTEXIA_FINAL.mp4}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

S8="${1:?scene 8 image required}"
S9="${2:?scene 9 image required}"
FONTDIR="${FONTDIR:-/tmp/claude-0/-home-user-crispy-octo-system/a67f6396-30f0-5486-9afc-6e97f408ff97/scratchpad/inter/extras/ttf}"
FB="$FONTDIR/InterDisplay-SemiBold.ttf"
FM="$FONTDIR/InterDisplay-Medium.ttf"
FR="$FONTDIR/Inter-Regular.ttf"

# Preview renders fast; pass QUALITY=final for the deliverable.
if [ "${QUALITY:-preview}" = "final" ]; then ENCOPTS="-crf 16 -preset slow"; else ENCOPTS="-crf 18 -preset veryfast"; fi
ENC="-an -c:v libx264 $ENCOPTS -pix_fmt yuv420p -r 24 -video_track_timescale 24000"

# --- per-scene grade, measured and matched; see assets/MANIFEST.md ---
G1="curves=all='0/0 0.3/0.30 0.7/0.68 1/0.94',eq=brightness=0.055:contrast=1.04:saturation=1.06,colortemperature=temperature=9800:mix=0.62"
G2="curves=all='0/0 0.3/0.29 0.65/0.57 1/0.86',eq=brightness=0.008:contrast=1.05:saturation=1.10,colortemperature=temperature=9400:mix=0.40"
G3="eq=brightness=0.048:contrast=1.04:saturation=1.06,colortemperature=temperature=4300:mix=0.62"
G4="curves=all='0/0 0.3/0.30 0.7/0.68 1/0.94',eq=brightness=0.070:contrast=1.03:saturation=1.06,colortemperature=temperature=9800:mix=0.62"
G5="eq=brightness=0.032:contrast=1.05:saturation=1.05,colortemperature=temperature=6300:mix=0.30"
G6="eq=brightness=0.042:contrast=1.04:saturation=1.06,colortemperature=temperature=4400:mix=0.55"
G7="curves=all='0/0 0.3/0.30 0.65/0.60 1/0.88',eq=brightness=0.060:contrast=1.04:saturation=1.08,colortemperature=temperature=9400:mix=0.75"

BED="gblur=sigma=60,eq=brightness=-0.30:saturation=0.6"

printf 'Tired of boring websites?'      > "$WORK/t1.txt"
printf "Come explore what's possible."  > "$WORK/t2.txt"
printf 'ASLIBELLA LASH STUDIO'          > "$WORK/l5.txt"
printf 'BRIOCHE & CO.'                  > "$WORK/l6.txt"
printf 'built by Vertexia Web Studios'  > "$WORK/lsub.txt"
printf 'CREATE     BUILD     GROW'      > "$WORK/l7.txt"

# Bottom scrim for the Scene 1 hook. Generated directly: the ffmpeg geq filter
# evaluates a per-pixel expression every frame and costs minutes per segment.
python3 - "$WORK/scrim.png" <<'PY'
import sys, zlib, struct
w, h = 1080, 780
rows = bytearray()
for y in range(h):
    a = int(255 * ((y / (h - 1)) ** 1.7) * 0.86)
    rows += b'\x00' + bytes([0, 0, 0, a]) * w
def chunk(t, d):
    return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
png  = b'\x89PNG\r\n\x1a\n'
png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
png += chunk(b'IDAT', zlib.compress(bytes(rows), 9))
png += chunk(b'IEND', b'')
open(sys.argv[1], 'wb').write(png)
PY

say(){ printf '  %s\n' "$*" >&2; }
say "1/9 hook"
ffmpeg -v error -t 3.0 -i "$A/scene01_closeup.MOV" -i "$WORK/scrim.png" -filter_complex "\
[0:v]scale=1920:1920,crop=1080:1920:420:0,$G1,setsar=1[b];[b][1:v]overlay=0:1140[m];\
[m]drawtext=fontfile=$FM:textfile=$WORK/t1.txt:fontcolor=white:fontsize=64:x=(w-tw)/2:y=1560:alpha='min(max((t-0.35)/0.55\,0)\,0.97)',\
drawtext=fontfile=$FM:textfile=$WORK/t2.txt:fontcolor=white:fontsize=40:x=(w-tw)/2:y=1668:alpha='min(max((t-1.55)/0.55\,0)\,0.6)'[v]" \
 -map "[v]" $ENC -y "$WORK/01.mp4"

# Cut at 2.40s: a green light-spill artifact grows on the jacket past that point.
say "2/9 walk"
ffmpeg -v error -t 2.4 -i "$A/scene02_walking.mp4" -filter_complex "[0:v]scale=1080:1920,$G2,setsar=1[v]" -map "[v]" $ENC -y "$WORK/02.mp4"

# Billboards dissolve after 1.10s, so the clean window is stretched 2x with
# motion interpolation rather than cut short.
say "3/9 city"
ffmpeg -v error -t 1.1 -i "$A/scene03_city.mp4" -filter_complex "[0:v]scale=2306:1920,crop=1080:1920:613:0,setpts=2.0*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,$G3,setsar=1[v]" -map "[v]" $ENC -y "$WORK/03.mp4"

# In 0.70 / out 2.70 clears the blink at source 1.70 and lands on the look to camera.
say "4/9 reaction"
ffmpeg -v error -ss 0.7 -t 2.0 -i "$A/scene04_reaction.mp4" -filter_complex "[0:v]scale=2457:1920,crop=1080:1920:688:0,$G4,setsar=1[v]" -map "[v]" $ENC -y "$WORK/04.mp4"

say "5/9 aslibella card"
ffmpeg -v error -i "$A/scene05_aslibella.mov" -filter_complex "\
[0:v]split=2[bg][fg];[bg]scale=2306:1920,crop=1080:1920:300:0,$G5,$BED[bb];\
[fg]crop=1050:1312:230:0,scale=1080:1350,$G5,setsar=1[card];[bb][card]overlay=0:300[m];\
[m]drawtext=fontfile=$FB:textfile=$WORK/l5.txt:fontcolor=white@0.92:fontsize=36:x=(w-tw)/2:y=1726,\
drawtext=fontfile=$FR:textfile=$WORK/lsub.txt:fontcolor=white@0.45:fontsize=27:x=(w-tw)/2:y=1788,setsar=1[v]" \
 -map "[v]" $ENC -y "$WORK/05.mp4"

say "6/9 brioche card"
ffmpeg -v error -ss 1.0 -t 2.5 -i "$A/scene06_showcase2.mp4" -filter_complex "\
[0:v]split=2[bg][fg];[bg]scale=2880:1920,crop=1080:1920:1800:0,$G6,$BED[bb];\
[fg]crop=941:1176:412:0,scale=1080:1350,$G6,setsar=1[card];[bb][card]overlay=0:300[m];\
[m]drawtext=fontfile=$FB:textfile=$WORK/l6.txt:fontcolor=white@0.92:fontsize=40:x=(w-tw)/2:y=1726,\
drawtext=fontfile=$FR:textfile=$WORK/lsub.txt:fontcolor=white@0.45:fontsize=27:x=(w-tw)/2:y=1788,setsar=1[v]" \
 -map "[v]" $ENC -y "$WORK/06.mp4"

# CREATE / BUILD / GROW is set as type here: the sign in the plate is legible for
# only ~0.3s at the extreme frame edge before the push-in carries it away.
say "7/9 mission card"
ffmpeg -v error -t 3.0 -i "$A/scene07_mission.mp4" -filter_complex "\
[0:v]split=2[bg][fg];[bg]scale=3407:1920,crop=1080:1920:1164:0,$G7,$BED[bb];\
[fg]crop=1080:1080:836:0,$G7,setsar=1[card];[bb][card]overlay=0:340[m];\
[m]drawtext=fontfile=$FB:textfile=$WORK/l7.txt:fontcolor=white@0.88:fontsize=38:x=(w-tw)/2:y=1560:alpha='min(max((t-0.5)/0.8\,0)\,0.88)',setsar=1[v]" \
 -map "[v]" $ENC -y "$WORK/07.mp4"

# Stills 8 and 9 carry their own typography, so nothing is added over them.
# Full width on a near-black bed: both assets are dark at the edges, so the card
# boundary reads as part of the design rather than as a letterbox.
# The offer is the frame that has to convert, so it must not be the smallest
# thing on screen. Its type is centred with symmetric 363/358px margins, so a
# symmetric crop enlarges the card without altering the layout: 1000 of 1524
# columns gives a 1115px-tall card instead of 731, with ~105px of breathing room
# either side of the price. Cropped by proportion so it holds for any source size.
say "8/9 offer"
S8W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$S8")
S8CW=$(python3 -c "print(int($S8W*0.656))")
ffmpeg -v error -loop 1 -t 3.5 -i "$S8" -filter_complex "\
color=c=0x08080Aff:s=1080x1920:d=3.5[bed];\
[0:v]crop=$S8CW:ih:(iw-$S8CW)/2:0,scale=1080:-2,setsar=1[card];\
[bed][card]overlay=0:(H-h)/2:shortest=1,setsar=1[v]" -map "[v]" $ENC -y "$WORK/08.mp4"

say "9/9 end card"
ffmpeg -v error -loop 1 -t 2.6 -i "$S9" -filter_complex "\
color=c=black:s=1080x1920:d=2.6[bed];\
[0:v]scale=1080:-2,setsar=1[card];[bed][card]overlay=0:(H-h)/2:shortest=1,\
fade=t=out:st=2.0:d=0.6,setsar=1[v]" -map "[v]" $ENC -y "$WORK/09.mp4"

for f in "$WORK"/0*.mp4; do printf "file '%s'\n" "$f"; done > "$WORK/list.txt"
ffmpeg -v error -f concat -safe 0 -i "$WORK/list.txt" -c copy -y "$WORK/video.mp4"

# Silent stereo track so the master drops into an NLE without a sync offset.
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORK/video.mp4")
ffmpeg -v error -i "$WORK/video.mp4" -f lavfi -t "$DUR" -i anullsrc=r=48000:cl=stereo \
  -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart -y "$OUT"

printf '\n  %s\n  %s  %s fps  %ss\n' "$OUT" \
  "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$OUT")" \
  "$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$OUT" | cut -d/ -f1)" \
  "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")"
