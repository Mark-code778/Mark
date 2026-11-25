"""Align shots to the voiceover.

Usage: python3 scripts/align.py <slug> [model]
Reads videos/<slug>/voiceover.mp3 (or ./voiceover.mp3) and videos/<slug>/shots.json,
transcribes with faster-whisper (word timestamps, Russian) and writes videos/<slug>/timeline.json:
  {"shots": [{"id": "s01", "start": 0.0, "end": 4.2}, ...], "words": [...]}
Each shot starts at the first spoken word of its narration line.
Needs: pip install faster-whisper   (model downloads from huggingface.co once)
"""
import difflib, json, os, re, sys

slug = sys.argv[1]
model_name = sys.argv[2] if len(sys.argv) > 2 else "medium"
d = os.path.join("videos", slug)
audio = next(p for p in [os.path.join(d, "voiceover.mp3"), "voiceover.mp3", os.path.join("..", "voiceover.mp3")] if os.path.exists(p))
shots = json.load(open(os.path.join(d, "shots.json"), encoding="utf-8"))["shots"]

norm = lambda w: re.sub(r"[^0-9a-zа-яё]", "", w.lower().replace("ё", "е"))

from faster_whisper import WhisperModel

model = WhisperModel(model_name, device="cpu", compute_type="int8")
prompt = " ".join(s["narration"] for s in shots)[:800]
segs, info = model.transcribe(audio, language="ru", word_timestamps=True, vad_filter=True, initial_prompt=prompt)
words = [{"w": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in s.words]
duration = info.duration
print(f"transcribed {len(words)} words, {duration:.1f}s")

script, owner = [], []
for i, s in enumerate(shots):
    for w in s["narration"].split():
        if norm(w):
            script.append(norm(w)); owner.append(i)
heard = [norm(w["w"]) for w in words]

sm = difflib.SequenceMatcher(a=script, b=heard, autojunk=False)
map_a2b = {}
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        map_a2b[blk.a + k] = blk.b + k

starts = []
for i in range(len(shots)):
    idxs = [a for a, o in enumerate(owner) if o == i]
    hit = next((map_a2b[a] for a in idxs if a in map_a2b), None)
    if hit is not None:
        # step back over the unmatched first words of the line
        first_matched = next(a for a in idxs if a in map_a2b)
        hit = max(0, hit - (first_matched - idxs[0]))
    starts.append(words[hit]["start"] if hit is not None and hit < len(words) else None)

# fill gaps by interpolating on the estimated durations
for i, st in enumerate(starts):
    if st is None:
        prev = next((j for j in range(i - 1, -1, -1) if starts[j] is not None), None)
        starts[i] = (starts[prev] + sum(shots[k]["duration"] for k in range(prev, i))) if prev is not None else 0.0
        print(f"warning: shot {shots[i]['id']} not found in audio, estimated at {starts[i]:.2f}s")
starts[0] = 0.0
for i in range(1, len(starts)):
    starts[i] = max(starts[i], starts[i - 1] + 0.5)

out = {"shots": [{"id": s["id"], "start": round(starts[i], 3), "end": round(starts[i + 1] if i + 1 < len(starts) else duration, 3)} for i, s in enumerate(shots)], "words": words}
json.dump(out, open(os.path.join(d, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for s in out["shots"]:
    print(f"{s['id']}  {s['start']:7.2f} → {s['end']:7.2f}")
