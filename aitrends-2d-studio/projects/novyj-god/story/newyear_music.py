"""Тихая новогодняя музыка (синтез): колокольчики-челеста, мягкий пэд, бубенцы.
Мелодии — народные/общественное достояние: «Jingle Bells» (1857) и «В лесу родилась ёлочка» (Л. Бекман, 1903).
Запуск: python3 story/newyear_music.py <длительность_с> <out.wav>
"""
import sys, wave
import numpy as np

SR = 44100
N = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(name):
    nm, octv = name[:-1], int(name[-1])
    nm = {'Bb': 'A#', 'Eb': 'D#'}.get(nm, nm)
    return 440.0 * 2 ** ((N[nm] + 12 * (octv + 1) - 69) / 12)

def celesta(f, dur):
    t = np.arange(int(SR * (dur + 1.2))) / SR
    env = np.exp(-t * 3.2) * np.minimum(1, t / 0.004)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 9)
    return s * env

def pad(freqs, dur):
    t = np.arange(int(SR * (dur + 0.8))) / SR
    env = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (dur + 0.8 - t) / 0.8))
    s = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs)
    return s * env / len(freqs)

def bell(rng):
    n = int(SR * 0.18); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))  # грубый ВЧ-фильтр
    return x * np.exp(-t * 28)

CH = {'C': ['C3', 'E3', 'G3'], 'F': ['F3', 'A3', 'C4'], 'G': ['G2', 'B2', 'D3', 'F3'], 'Bb': ['Bb2', 'D3', 'F3'], 'Am': ['A2', 'C3', 'E3'], 'Dm': ['D3', 'F3', 'A3']}

JB = [('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('G5', 1), ('C5', 1.5), ('D5', .5), ('E5', 4),
      ('F5', 1), ('F5', 1), ('F5', 1.5), ('F5', .5), ('F5', 1), ('E5', 1), ('E5', 1), ('E5', .5), ('E5', .5), ('E5', 1), ('D5', 1), ('D5', 1), ('E5', 1), ('D5', 2), ('G5', 2),
      ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('G5', 1), ('C5', 1.5), ('D5', .5), ('E5', 4),
      ('F5', 1), ('F5', 1), ('F5', 1.5), ('F5', .5), ('F5', 1), ('E5', 1), ('E5', 1), ('E5', .5), ('E5', .5), ('G5', 1), ('G5', 1), ('F5', 1), ('D5', 1), ('C5', 4)]
JB_CH = ['C', 'C', 'C', 'C', 'F', 'C', 'G', 'G', 'C', 'C', 'C', 'C', 'F', 'C', 'G', 'C']
EL = [('C5', .5), ('A5', .5), ('A5', .5), ('G5', .5), ('A5', .5), ('F5', .5), ('C5', .5), ('C5', .5),
      ('C5', .5), ('A5', .5), ('A5', .5), ('Bb5', .5), ('G5', .5), ('C6', 1.5),
      ('C6', .5), ('D5', .5), ('D5', .5), ('Bb5', .5), ('Bb5', .5), ('A5', .5), ('G5', .5), ('F5', .5),
      ('F5', .5), ('Bb5', .5), ('Bb5', .5), ('A5', .5), ('G5', .5), ('F5', 1.5)]
EL_CH = ['F', 'F', 'F', 'C', 'Bb', 'F', 'Bb', 'F']

def section(mel, chords, bpm, rng, bells=True, mel_gain=1.0):
    beat = 60 / bpm; total = (sum(d for _, d in mel) if mel else 4 * len(chords)) * beat
    out = np.zeros(int(SR * (total + 2)))
    t = 0.0
    for n, d in mel:
        s = celesta(hz(n), d * beat) * 0.32 * mel_gain; i = int(t * SR); out[i:i + len(s)] += s[: len(out) - i]; t += d * beat
    bar = total / len(chords)
    for k, c in enumerate(chords):
        s = pad([hz(x) for x in CH[c]], bar) * 0.16; i = int(k * bar * SR); out[i:i + len(s)] += s[: len(out) - i]
        b = celesta(hz(CH[c][0][:-1] + '2'), bar) * 0.12; out[i:i + len(b)] += b[: len(out) - i]
    if bells:
        for k in range(int(total / beat)):
            s = bell(rng) * (0.05 if k % 2 else 0.08); i = int(k * beat * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out[: int(SR * total)]

def build(seconds):
    rng = np.random.default_rng(7)
    parts = [section([], ['C', 'Am', 'F', 'G'], 92, rng, bells=False),
             section(JB, JB_CH, 96, rng), section(EL, EL_CH, 80, rng, bells=False), section(EL, EL_CH, 80, rng),
             section([], ['F', 'Dm', 'Bb', 'C'], 92, rng, bells=False), section(JB, JB_CH, 96, rng, mel_gain=0.85)]
    # пустые секции (только аккорды) задаём длиной 4 такта
    loop = np.concatenate([p if len(p) else np.zeros(1) for p in parts])
    xf = int(SR * 2.0); need = int(SR * seconds); out = np.zeros(need + xf)
    pos = 0; ramp = np.linspace(0, 1, xf)
    while pos < need:
        seg = loop.copy(); seg[:xf] *= ramp; seg[-xf:] *= ramp[::-1]
        end = min(len(out), pos + len(seg)); out[pos:end] += seg[: end - pos]; pos += len(seg) - xf
    out = out[:need]
    fade = int(SR * 3); out[-fade:] *= np.linspace(1, 0, fade); out[:int(SR * 1.5)] *= np.linspace(0, 1, int(SR * 1.5))
    out /= np.max(np.abs(out)) + 1e-9
    return (out * 0.7).astype(np.float32)

if __name__ == '__main__':
    dur, path = float(sys.argv[1]), sys.argv[2]
    x = build(dur); st = np.stack([x, x], 1)
    pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('wrote', path, f'{dur:.1f}s')
