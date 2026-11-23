"""Эпическая БЫСТРАЯ мажорная музыка для 30-секундного трейлера «Тот самый Новый год».
Сразу удар -> быстрый струнный остинато + бубенцы -> барабаны и медные акценты на склейках -> удар на «Бом!» ->
героический «Jingle Bells» в меди и хоре (170 уд/мин) -> короткая пауза -> мощный мажорный аккорд на титре.
Запуск: python3 story/trailer_music_epic.py <out.wav>
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 30.0
CUTS = [2.0, 4.0, 5.2, 6.2, 8.6, 10.66, 11.56, 12.46, 13.26, 14.81, 15.56]
TITLE = 26.96
NAMES = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(n): return 440.0 * 2 ** ((NAMES[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)
rng = np.random.default_rng(21)
out = np.zeros((int(SR * (DUR + 4)), 2))

def add(x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(out) or i < 0: return
    n = min(len(x), len(out) - i)
    out[i:i + n, 0] += x[:n] * g * (1 - max(0, pan)); out[i:i + n, 1] += x[:n] * g * (1 + min(0, pan))
def tt(d): return np.arange(int(SR * d)) / SR
def saw(f, t, nh=14, bright=1.0):
    s = np.zeros_like(t)
    for k in range(1, nh + 1):
        if f * k > 10000: break
        s += np.sin(2 * np.pi * f * k * t) / k * (bright ** (k - 1))
    return s
def env(t, a, d, r):
    return np.minimum(1, t / max(a, 1e-4)) * (1 - np.clip((t - (d - r)) / max(r, 1e-4), 0, 1))

CH = {'C': ['C', 'E', 'G'], 'G': ['G', 'B', 'D'], 'Am': ['A', 'C', 'E'], 'F': ['F', 'A', 'C'], 'G7': ['G', 'B', 'F']}
def stab(ch, octv=3, d=0.35, bright=0.85):   # короткий резкий удар медных
    t = tt(d + 0.15); s = sum(saw(hz(n + str(octv)), t, 18, bright) + 0.6 * saw(hz(n + str(octv + 1)), t, 12, bright) for n in CH[ch]) / len(CH[ch])
    return s * np.minimum(1, t / 0.006) * np.exp(-t * 6)
def brass(f, d):
    t = tt(d + 0.12); return (saw(f, t, 18, 0.86) + 0.5 * saw(f * 1.003, t, 14, 0.84)) * env(t, 0.015, d + 0.12, 0.12)
def strings16(f, d):
    t = tt(d); return saw(f, t, 12, 0.8) * np.minimum(1, t / 0.004) * np.exp(-t * 14)
def choir(freqs, d):
    t = tt(d); s = np.zeros_like(t)
    for f in freqs:
        for det in (0.996, 1.0, 1.004):
            ff = f * det; s += np.sin(2 * np.pi * ff * t) + 0.55 * np.sin(2 * np.pi * 2 * ff * t) + 0.35 * np.sin(2 * np.pi * 3 * ff * t)
    return s / (len(freqs) * 3) * env(t, 0.08, d, 0.3)
def kick():
    t = tt(0.4); f = 50 + 110 * np.exp(-t * 25); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
def snare():
    t = tt(0.25); return (rng.standard_normal(len(t)) * 0.7 + np.sin(2 * np.pi * 200 * t) * 0.5) * np.exp(-t * 20)
def taiko():
    t = tt(0.8); f = 55 + 80 * np.exp(-t * 16); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + rng.standard_normal(len(t)) * np.exp(-t * 45) * 0.3
def hat():
    t = tt(0.06); x = np.diff(np.concatenate([[0], rng.standard_normal(len(t))])); return x * np.exp(-t * 70)
def jingle():
    t = tt(0.12); s = np.zeros_like(t)
    for _ in range(8):
        f = rng.uniform(5000, 9500); d0 = rng.uniform(0, 0.01); s += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - d0) * 50) * (t >= d0)
    return s / 8
def crash(d=2.5):
    t = tt(d); x = np.diff(np.concatenate([[0], rng.standard_normal(len(t))])); return x * np.exp(-t * 2.0)
def bell(f, d=3.0):
    t = tt(d); return sum(np.sin(2 * np.pi * f * m * t) * a * np.exp(-t * dc) for m, a, dc in [(1, 1, 1.0), (2.0, 0.5, 1.5), (2.76, 0.3, 2.0), (5.4, 0.15, 3.0)])
def riser(d):
    t = tt(d); k = (t / d) ** 2; return rng.standard_normal(len(t)) * k * 0.25 + np.sin(2 * np.pi * (300 + 1500 * k) * t) * k * 0.2
JG = [jingle() for _ in range(6)]

# ---------- 0–15.6: быстрый мажорный драйв (140 уд/мин) ----------
bpm = 140; b = 60 / bpm
prog = ['C', 'G', 'Am', 'F']
add(stab('C', 3, 0.5), 0.0, 0.9); add(taiko(), 0.0, 0.9); add(crash(), 0.0, 0.35)
n16 = int(15.5 / (b / 4))
for k in range(n16):
    t = k * b / 4; bar = int(t / (4 * b)) % 4; ch = CH[prog[bar]]
    up = min(1.0, 0.55 + t / 15.5 * 0.45)
    note = [ch[0], ch[2], ch[1], ch[2]][k % 4]
    add(strings16(hz(note + '4'), b / 4 + 0.05), t, 0.13 * up, -0.25)
    if k % 2 == 0: add(strings16(hz(ch[0] + '2'), b / 2), t, 0.13 * up, 0.25)
    add(JG[k % 6], t, (0.10 if k % 4 == 0 else 0.05) * up, 0.4)
    if t >= 5.2:                                  # полные барабаны с 5.2 с
        beat_i = k // 4
        if k % 4 == 0 and beat_i % 2 == 0: add(kick(), t, 0.75)
        if k % 4 == 0 and beat_i % 2 == 1: add(snare(), t, 0.45)
        if k % 2 == 1: add(hat(), t, 0.10)
    elif k % 8 == 0: add(kick(), t, 0.5)
for bar in range(int(15.5 / (4 * b)) + 1):        # хор под драйв
    add(choir([hz(n + '4') for n in CH[prog[bar % 4]]], 4 * b + 0.1), bar * 4 * b, 0.10)
for c in CUTS:                                    # резкие медные акценты на склейках
    bar = int(c / (4 * b)) % 4
    add(stab(prog[bar], 3, 0.3), c, 0.55); add(taiko(), c, 0.6)
# барабанная дробь перед «Бом!»
for i in range(16):
    t = 13.9 + 1.6 * (1 - (1 - i / 16) ** 1.6)
    add(snare(), t, 0.15 + 0.25 * i / 16)
add(riser(1.7), 13.9, 0.55)
# «Бом!» — мощный удар с колоколом
add(stab('C', 2, 0.9), 15.66, 1.0); add(taiko(), 15.66, 1.0); add(kick(), 15.66, 0.9); add(crash(), 15.66, 0.5); add(bell(hz('C4')), 15.66, 0.3); add(bell(hz('G4')), 15.66, 0.2)

# ---------- 16.56–26.45: героический «Jingle Bells» (170 уд/мин) ----------
bpm = 170; b = 60 / bpm; ts = 16.56
mel = [('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('G5', 1), ('C5', 1.5), ('D5', .5), ('E5', 4),
       ('F5', 1), ('F5', 1), ('F5', 1.5), ('F5', .5), ('F5', 1), ('E5', 1), ('E5', 1), ('E5', .5), ('E5', .5), ('G5', 1), ('G5', 1), ('F5', 1), ('D5', 1)]
t = ts
for n, d in mel:
    f = hz(n); add(brass(f, d * b * 0.92), t, 0.20, -0.1); add(brass(f / 2, d * b * 0.92), t, 0.16, 0.1); add(brass(f * 2, d * b * 0.9), t, 0.05)
    t += d * b
mel_end = t
bars = ['C', 'C', 'C', 'C', 'F', 'C', 'G7']
for i, ch in enumerate(bars):
    tb = ts + i * 4 * b
    add(choir([hz(n + '4') for n in CH[ch]] + [hz(CH[ch][0] + '3')], 4 * b), tb, 0.16)
    for j in range(16):                            # плотный остинато шестнадцатыми
        nn = CH[ch][[0, 2, 1, 2][j % 4]]
        add(strings16(hz(nn + '4'), b / 4 + 0.05), tb + j * b / 4, 0.10, -0.3)
        add(JG[j % 6], tb + j * b / 4, 0.08 if j % 4 == 0 else 0.04, 0.4)
    for j in range(4):                             # барабаны: бочка/малый + тайко на сильных
        tj = tb + j * b
        add(kick() if j % 2 == 0 else snare(), tj, 0.8 if j % 2 == 0 else 0.5)
        if j == 0: add(taiko(), tj, 0.7); add(stab(ch, 3, 0.3), tj, 0.4)
        add(hat(), tj + b / 2, 0.12)
add(crash(), ts, 0.4)
add(riser(1.4), mel_end - 1.4, 0.4)
# пауза перед титром и удар
c0 = int(SR * (TITLE - 0.42)); c1 = int(SR * TITLE); fd = int(SR * 0.04)
out[c0:c0 + fd] *= np.linspace(1, 0, fd)[:, None]; out[c0 + fd:c1] = 0
add(stab('C', 2, 2.5, 0.9), TITLE, 0.9); add(stab('C', 3, 2.5, 0.9), TITLE, 0.6); add(taiko(), TITLE, 1.0); add(kick(), TITLE, 1.0); add(crash(3.0), TITLE, 0.55)
add(choir([hz('C4'), hz('E4'), hz('G4'), hz('C5')], 3.0), TITLE, 0.3)
for n in ('C5', 'G5', 'C6'): add(bell(hz(n)), TITLE, 0.12)

out = out[: int(SR * DUR)]
f = int(SR * 0.6); out[-f:] *= np.linspace(1, 0, f)[:, None]
out = np.tanh(out * 1.6) / np.tanh(1.6)
out /= np.max(np.abs(out)) + 1e-9; out *= 0.9
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('wrote', sys.argv[1], 'тема кончается на', round(mel_end, 2))
