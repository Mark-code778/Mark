"""Эпическая музыка для 30-секундного трейлера «Тот самый Новый год».
Шкатулка + гул -> струнный остинато, часы, барабаны на склейках -> медь и хор: «Jingle Bells» эпично -> пауза -> удар на титре.
Запуск: python3 story/trailer_music_epic.py <out.wav>
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 30.0
CUTS = [2.0, 4.0, 5.2, 6.2, 8.6, 10.66, 11.56, 12.46, 13.26, 14.81, 15.56, 16.56, 17.36, 20.46, 21.46, 22.36, 23.36, 25.26]
TITLE = 26.96
NAMES = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(n): return 440.0 * 2 ** ((NAMES[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)
rng = np.random.default_rng(11)
out = np.zeros((int(SR * (DUR + 4)), 2))

def add(x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(out): return
    n = min(len(x), len(out) - i)
    out[i:i + n, 0] += x[:n] * g * (1 - max(0, pan)); out[i:i + n, 1] += x[:n] * g * (1 + min(0, pan))

def tt(d): return np.arange(int(SR * d)) / SR
def saw(f, t, nh=14, bright=1.0):
    s = np.zeros_like(t)
    for k in range(1, nh + 1):
        if np.max(f) * k > 9000: break
        s += np.sin(2 * np.pi * f * k * t) / k * (bright ** (k - 1))
    return s
def env(t, a, r, d):  # атака a, удержание до d, затухание r
    e = np.minimum(1, t / max(a, 1e-4)); tail = np.clip((t - (d - r)) / max(r, 1e-4), 0, 1); return e * (1 - tail)

def musicbox(f, d=1.2):
    t = tt(d + 1.0); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3.98 * f * t) * np.exp(-t * 8)) * np.exp(-t * 3) * np.minimum(1, t / 0.002)
def drone(freqs, d):
    t = tt(d); return sum(saw(f, t, 8, 0.6) for f in freqs) / len(freqs) * env(t, 1.5, 1.5, d)
def strings_note(f, d):
    t = tt(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t); return saw(f * vib, t, 12, 0.72) * env(t, 0.02, 0.05, d)
def brass(f, d):
    t = tt(d + 0.3); b = np.minimum(1, t / 0.08) ** 0.7
    return (saw(f, t, 16, 0.78) + 0.5 * saw(f * 1.004, t, 10, 0.7)) * env(t, 0.06, 0.3, d + 0.3) * (0.6 + 0.4 * b)
def choir(freqs, d):
    t = tt(d); s = np.zeros_like(t)
    for f in freqs:
        for det in (0.997, 1.0, 1.003):
            ff = f * det * (1 + 0.006 * np.sin(2 * np.pi * 5 * t + det * 50))
            s += np.sin(2 * np.pi * ff * t) + 0.5 * np.sin(2 * np.pi * 2 * ff * t) + 0.35 * np.sin(2 * np.pi * 3 * ff * t)
    return s / (len(freqs) * 3) * env(t, 0.6, 0.8, d)
def taiko(g=1.0):
    t = tt(1.2); f = 40 + 70 * np.exp(-t * 14)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    n = rng.standard_normal(len(t)) * np.exp(-t * 40) * 0.35
    return (body + n) * g
def boom():
    t = tt(3.0); f = 32 + 60 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4) + rng.standard_normal(len(t)) * np.exp(-t * 18) * 0.25
def braam(root='C2', d=3.0):
    t = tt(d); fs = [hz(root), hz(root) * 1.5, hz(root) * 2, hz(root) * 2.5]
    s = sum(saw(f, t, 18, 0.85) for f in fs) / 4
    return s * np.minimum(1, t / 0.03) * np.exp(-t * 0.9)
def tick():
    t = tt(0.05); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160) + rng.standard_normal(len(t)) * np.exp(-t * 200) * 0.3
def riser(d):
    t = tt(d); k = (t / d) ** 2
    return rng.standard_normal(len(t)) * k * 0.3 + np.sin(2 * np.pi * (120 + 900 * k) * t) * k * 0.25
def bellbig(f):
    t = tt(4.0); return sum(np.sin(2 * np.pi * f * m * t) * a * np.exp(-t * dcy) for m, a, dcy in [(1, 1, 0.8), (2.0, 0.5, 1.2), (2.76, 0.35, 1.6), (5.4, 0.2, 3)])
def crash(d=3.0):
    t = tt(d); x = np.diff(np.concatenate([[0], rng.standard_normal(len(t))])); return x * np.exp(-t * 1.8)

# ---- 0–5.2: шкатулка + низкий гул ----
add(drone([hz('C2'), hz('G2')], 6.0), 0.0, 0.22)
mb = [('E6', 0.0), ('E6', 0.45), ('E6', 0.9), ('E6', 1.8), ('E6', 2.25), ('E6', 2.7), ('E6', 3.6), ('G6', 4.05), ('C6', 4.5), ('D6', 4.85)]
for n, t0 in mb: add(musicbox(hz(n)), t0 + 0.15, 0.20, 0.3)
add(boom(), 4.0, 0.35)
# ---- 5.2–17.0: нарастание: остинато, часы, барабаны на склейках ----
beat = 60 / 100
prog = [('A', ['A', 'C', 'E']), ('F', ['F', 'A', 'C']), ('C', ['C', 'E', 'G']), ('G', ['G', 'B', 'D'])]
t0 = 5.2; k = 0
while t0 + k * beat / 2 < 17.0:
    t = t0 + k * beat / 2; bar = int((t - t0) / (beat * 4)) % 4; root, ch = prog[bar]
    note = [ch[0], ch[1], ch[2], ch[1]][k % 4]
    intensity = min(1.0, 0.35 + (t - t0) / 11.8 * 0.65)
    add(strings_note(hz(note + '3'), beat / 2), t, 0.10 * intensity, -0.3)
    add(strings_note(hz(root + '2'), beat / 2), t, 0.08 * intensity, 0.2)
    if k % 2 == 0: add(tick(), t, 0.10 * intensity, 0.5)
    k += 1
for bar in range(int((17.0 - 5.2) / (beat * 4)) + 1):  # хоровые аккорды под остинато
    root, ch = prog[bar % 4]; tb = 5.2 + bar * beat * 4
    add(choir([hz(c + '4') for c in ch], beat * 4 + 0.6), tb, 0.12 * min(1, 0.4 + bar * 0.2))
for c in CUTS:
    if 5.0 <= c <= 17.5: add(taiko(), c, 0.55)
add(boom(), 15.66, 0.75); add(bellbig(hz('C3')), 15.66, 0.35)   # «Бом!»
add(riser(2.0), 15.0, 0.5)
# ---- 17.0–26.6: эпичная тема «Jingle Bells»: медь + хор + большие барабаны ----
bpm = 100; b = 60 / bpm; ts = 17.0
mel = [('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('G4', 1), ('C4', 1.5), ('D4', .5), ('E4', 4)]
t = ts
for n, d in mel:
    add(brass(hz(n), d * b * 0.95), t, 0.22, -0.15); add(brass(hz(n[:-1] + '3'), d * b * 0.95), t, 0.14, 0.15)
    t += d * b
chords = [['C', 'E', 'G'], ['A', 'C', 'E'], ['F', 'A', 'C'], ['C', 'E', 'G']]
for i, ch in enumerate(chords):
    tb = ts + i * 4 * b
    add(choir([hz(c + '4') for c in ch] + [hz(ch[0] + '3')], 4 * b + 0.4), tb, 0.22)
    add(braam(ch[0] + '2', 4 * b), tb, 0.16)
    for j in range(8):  # большие барабаны: восьмые с акцентами
        tj = tb + j * b / 2
        add(taiko(), tj, 0.55 if j in (0, 3, 6) else 0.25)
add(crash(2.5), ts, 0.25)
add(riser(2.4), 24.2, 0.6)
# пауза перед титром (26.6–26.96), затем удар на титре
cut_from = int(SR * 26.55); cut_to = int(SR * TITLE)
fade = np.linspace(1, 0, int(SR * 0.05))
out[cut_from:cut_from + len(fade)] *= fade[:, None]; out[cut_from + len(fade):cut_to] = 0
add(braam('C2', 3.2), TITLE, 0.5); add(boom(), TITLE, 0.9); add(crash(3.0), TITLE, 0.4)
for n in ('C5', 'G5', 'C6', 'E6'): add(bellbig(hz(n)), TITLE, 0.12)
add(choir([hz('C4'), hz('E4'), hz('G4'), hz('C5')], 3.0), TITLE, 0.25)

out = out[: int(SR * DUR)]
f = int(SR * 0.8); out[-f:] *= np.linspace(1, 0, f)[:, None]
# мягкий лимитер
out = np.tanh(out * 1.4) / np.tanh(1.4)
out /= np.max(np.abs(out)) + 1e-9; out *= 0.9
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1])
