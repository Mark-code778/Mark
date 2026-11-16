# CPU fallback for transcribe.mts (no WebGPU): same output format.
# Usage: python scripts/transcribe-cpu.py input/voice.mp3 --lang ru [--model medium]
import argparse, json, os, re, shutil, subprocess
import numpy as np
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("file")
ap.add_argument("--lang", required=True)
ap.add_argument("--model", default="medium")
a = ap.parse_args()

dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.file]).decode().strip())
model = WhisperModel(a.model, device="cpu", compute_type="int8", cpu_threads=os.cpu_count())
pcm = subprocess.check_output(["ffmpeg", "-v", "error", "-i", a.file, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"])
audio = np.frombuffer(pcm, dtype=np.float32)
segs, _ = model.transcribe(audio, language=a.lang, word_timestamps=True, beam_size=5, vad_filter=False)
words = []
for s in segs:
    for w in s.words:
        t = w.word.strip()
        if t:
            words.append({"text": t, "start": round(w.start, 3), "end": round(w.end, 3)})
    print(f"{s.end:.1f}/{dur:.1f}", flush=True)

ext = os.path.splitext(a.file)[1].lower()
os.makedirs("public/audio", exist_ok=True)
voice = f"audio/voice{ext}"
shutil.copyfile(a.file, os.path.join("public", voice))

lines, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    gap = nxt["start"] - w["end"] if nxt else 99
    if re.search(r"[.!?]$", w["text"]) or gap > 0.8 or len(cur) >= 22:
        lines.append(f"[{cur[0]['start']:.2f} - {cur[-1]['end']:.2f}] " + " ".join(x["text"] for x in cur))
        cur = []

os.makedirs("data", exist_ok=True)
json.dump({"duration": round(dur, 3), "voice": voice, "language": a.lang, "words": words},
          open("data/transcript.json", "w"), ensure_ascii=False, indent=2)
open("data/transcript.txt", "w").write(f"duration: {dur:.2f} s\nvoice: {voice}\n\n" + "\n".join(lines) + "\n")
print(f"Done: {len(words)} words, {len(lines)} lines")
