from faster_whisper import WhisperModel
import json
m = WhisperModel("small", device="cpu", compute_type="int8")
import numpy as np
a=np.fromfile("audio/voice16k.raw",dtype=np.float32)
segs, info = m.transcribe(a, language="ru", word_timestamps=True)
words=[]
for s in segs:
    for w in s.words:
        words.append({"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)})
json.dump(words, open("audio/words.json","w"), ensure_ascii=False, indent=0)
for w in words: print(w)
