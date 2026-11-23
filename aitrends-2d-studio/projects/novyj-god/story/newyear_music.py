"""Весёлая новогодняя музыка (синтез): металлофон + бубенцы + прыгающий бас «умпа», только мажор.
Мелодии — общественное достояние: «Jingle Bells» (1857) и «В лесу родилась ёлочка» (Л. Бекман, 1903).
Запуск: python3 story/newyear_music.py <длительность_с> <out.wav>
"""
import sys, wave
import numpy as np

SR = 44100
NAMES = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def hz(n): return 440.0 * 2 ** ((NAMES[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)

def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g

def glock(f, dur):        # яркий металлофон
    L = int(SR * min(1.6, dur + 0.9)); t = np.arange(L) / SR
    env = np.exp(-t * 4.5) * np.minimum(1, t / 0.002)
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 7) + 0.25 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t * 12)) * env

def pluck(f, dur):        # бас
    L = int(SR * dur); t = np.arange(L) / SR
    env = np.exp(-t * 7) * np.minimum(1, t / 0.004)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * env

def stab(freqs, dur):     # короткий аккорд «па»
    L = int(SR * dur); t = np.arange(L) / SR
    env = np.exp(-t * 12) * np.minimum(1, t / 0.003)
    return sum(np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t) for f in freqs) / len(freqs) * env

_r = np.random.default_rng(3)
JINGLE = []
for k in range(4):        # несколько вариантов звона бубенцов
    L = int(SR * 0.12); t = np.arange(L) / SR; s = np.zeros(L)
    for _ in range(9):
        f = _r.uniform(4500, 9000); ph = _r.uniform(0, 6.28); d = _r.uniform(0, 0.012)
        s += np.sin(2 * np.pi * f * t + ph) * np.exp(-np.maximum(0, t - d) * 45) * (t >= d)
    JINGLE.append(s / 9)

CH = {'C': ['C', 'E', 'G'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'], 'G7': ['G', 'B', 'F'], 'Bb': ['Bb', 'D', 'F'], 'C7': ['C', 'E', 'Bb'], 'D7': ['D', 'F#', 'C']}

# Jingle Bells, припев (четверти), в до мажоре
JB = [('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('G5', 1), ('C5', 1.5), ('D5', .5), ('E5', 4),
      ('F5', 1), ('F5', 1), ('F5', 1.5), ('F5', .5), ('F5', 1), ('E5', 1), ('E5', 1), ('E5', .5), ('E5', .5), ('E5', 1), ('D5', 1), ('D5', 1), ('E5', 1), ('D5', 2), ('G5', 2),
      ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('E5', 1), ('E5', 2), ('E5', 1), ('G5', 1), ('C5', 1.5), ('D5', .5), ('E5', 4),
      ('F5', 1), ('F5', 1), ('F5', 1.5), ('F5', .5), ('F5', 1), ('E5', 1), ('E5', 1), ('E5', .5), ('E5', .5), ('G5', 1), ('G5', 1), ('F5', 1), ('D5', 1), ('C5', 4)]
JB_CH = ['C', 'C', 'C', 'C', 'F', 'C', 'D7', 'G7', 'C', 'C', 'C', 'C', 'F', 'C', 'G7', 'C']   # по такту (4 доли)
# «В лесу родилась ёлочка» (восьмые = 0.5 доли), фа мажор
EL = [('C5', .5), ('A5', .5), ('A5', .5), ('G5', .5), ('A5', .5), ('F5', .5), ('C5', .5), ('C5', .5), ('C5', 1),
      ('C5', .5), ('A5', .5), ('A5', .5), ('Bb5', .5), ('G5', .5), ('C6', 1.5),
      ('C6', .5), ('D6', .5), ('D6', .5), ('Bb5', .5), ('Bb5', .5), ('A5', .5), ('G5', .5), ('F5', .5), ('F5', 1),
      ('F5', .5), ('Bb5', .5), ('Bb5', .5), ('A5', .5), ('G5', .5), ('F5', 1.5)]
EL_CH = ['F', 'F', 'F', 'C7', 'F', 'Bb', 'C7', 'C7', 'F']                                   # по такту (2 доли)

def section(mel, chords, bpm, beats_per_bar, mel_gain=1.0, octave_double=False):
    beat = 60 / bpm
    total = (sum(d for _, d in mel) if mel else len(chords) * beats_per_bar) * beat
    bar = beats_per_bar * beat
    total = max(total, len(chords) * bar)
    buf = np.zeros(int(SR * (total + 2)))
    t = 0.0
    for n, d in mel:
        add(buf, glock(hz(n), d * beat), t, 0.36 * mel_gain)
        if octave_double: add(buf, glock(hz(n[:-1] + str(int(n[-1]) + 1)), d * beat), t, 0.10 * mel_gain)
        t += d * beat
    for k, c in enumerate(chords):          # бас «умпа»: корень — аккорд — квинта — аккорд
        root, fifth = CH[c][0], CH[c][2]
        b0 = k * bar
        for j in range(beats_per_bar):
            tt = b0 + j * beat
            if j % 2 == 0: add(buf, pluck(hz((root if j == 0 else fifth) + '3') / 2, beat * 0.9), tt, 0.30)
            else: add(buf, stab([hz(x + '4') for x in CH[c]], beat * 0.6), tt, 0.13)
    nb = int(total / (beat / 2))
    for k in range(nb):                      # бубенцы на восьмых, акцент на долях
        add(buf, JINGLE[k % 4], k * beat / 2, 0.07 if k % 2 else 0.12)
    return buf[: int(SR * total)]

def build(seconds):
    parts = [section([], ['C', 'F', 'G7', 'C'], 150, 4),
             section(JB, JB_CH, 150, 4), section(JB, JB_CH, 150, 4, octave_double=True),
             section(EL, EL_CH, 132, 2), section(EL, EL_CH, 132, 2, octave_double=True),
             section([], ['F', 'Bb', 'C7', 'F'], 132, 2)]
    loop = np.concatenate(parts)
    xf = int(SR * 1.0); need = int(SR * seconds); out = np.zeros(need + len(loop))
    ramp = np.linspace(0, 1, xf); pos = 0
    while pos < need:
        seg = loop.copy(); seg[:xf] *= ramp; seg[-xf:] *= ramp[::-1]
        out[pos:pos + len(seg)] += seg; pos += len(seg) - xf
    out = out[:need]
    f = int(SR * 2.5); out[-f:] *= np.linspace(1, 0, f); out[:int(SR * 0.5)] *= np.linspace(0, 1, int(SR * 0.5))
    out /= np.max(np.abs(out)) + 1e-9
    return (out * 0.8).astype(np.float32)

if __name__ == '__main__':
    dur, path = float(sys.argv[1]), sys.argv[2]
    x = build(dur)
    pcm = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('wrote', path, f'{dur:.1f}s')
