# Монтаж трейлера: кадры только из готового ролика, вразброс; озвучка — короткие фразы из исходной озвучки.
import subprocess, json, wave, numpy as np, os, sys
MASTER = 'out/Тот_самый_Новый_год_который_мы_никогда_не_забудем.mp4'
VOICE = 'input/voiceover.mp3'
# (начало в ролике, длительность, [голос: начало, конец, сдвиг внутри кадра])
SEGS = [
  (0.30, 2.00, (0.00, 1.80, 0.10)),      # машина в поле — «Без трёх минут полночь.»
  (112.80, 2.00, (112.80, 114.75, 0.0)), # мама — «Не трогай, это на Новый год»
  (903.60, 1.20, None),                  # трактор в метели
  (237.00, 1.00, None),                  # кот смотрит на шарик
  (495.24, 2.40, (495.24, 499.70, 0.0)), # в машине — «Ну что, Снегурочка? Поехали за подарками»
  (534.00, 2.06, None),                  # дорога в метель (фраза продолжается)
  (183.60, 0.90, None),                  # клубок гирлянды
  (576.74, 0.90, (576.74, 577.45, 0.0)), # бабушка — «Батюшки!»
  (709.40, 0.80, None),                  # телефон, одна полоска
  (931.70, 1.55, (931.70, 933.25, 0.0)), # тракторист — «Дед Мороз-то настоящий?»
  (934.95, 0.75, (935.00, 935.55, 0.05)),# Лёха — «А то.»
  (798.30, 1.00, (812.02, 812.75, 0.10)),# Спасская башня — «Бом!»
  (1142.05, 0.80, None),                 # разбитый шарик
  (596.60, 3.10, (596.68, 599.72, 0.08)),# Лёха — «Пробки, дедушка, пробки»
  (943.00, 1.00, None),                  # клуб, дети
  (694.40, 0.90, None),                  # ключ зажигания
  (740.90, 1.00, (747.44, 748.10, 0.15)),# куранты — «Куранты.»
  (845.00, 1.90, (840.64, 842.18, 0.0)), # стаканчики — «С Новым годом!»
  (1147.50, 1.70, None),                 # вся семья смеётся
  (29.40, 3.04, None),                   # титр
]
os.makedirs('trailer/parts', exist_ok=True)
lst = []
for i, (src, dur, _) in enumerate(SEGS):
    out = f'trailer/parts/p{i:02d}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{src:.3f}', '-i', MASTER, '-t', f'{dur:.3f}', '-vf', 'fps=60,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-an', out], check=True)
    lst.append(f"file '{os.path.abspath(out)}'")
open('trailer/parts/list.txt', 'w').write('\n'.join(lst) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'trailer/parts/list.txt', '-c', 'copy', 'trailer/video_silent.mp4'], check=True)
# голосовая дорожка
SR = 48000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.float32).reshape(-1, 2)
total = sum(d for _, d, _ in SEGS); tr = np.zeros((int(SR * total) + SR, 2), np.float32)
t = 0.0
for src, dur, vo in SEGS:
    if vo:
        a, b, off = vo; clip = v[int(a * SR):int(b * SR)].copy(); f = int(0.02 * SR)
        clip[:f] *= np.linspace(0, 1, f)[:, None]; clip[-f:] *= np.linspace(1, 0, f)[:, None]
        i = int((t + off) * SR); tr[i:i + len(clip)] += clip
    t += dur
tr = tr[: int(SR * total)]
pcm = (np.clip(tr, -1, 1) * 32767).astype(np.int16)
with wave.open('trailer/voice.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('total', round(total, 2))
