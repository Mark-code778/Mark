"""Музыка для 30-секундного трейлера: тихий вступ -> нарастание -> быстрый «Jingle Bells» с барабанами -> финальный удар.
Запуск: python3 story/trailer_music.py <out.wav>
"""
import sys, wave
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import newyear_music as m

SR = m.SR
DUR = 30.0

def kick():
    n = int(SR * 0.35); t = np.arange(n) / SR
    f = 110 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def snare(seed=1):
    n = int(SR * 0.2); t = np.arange(n) / SR; r = np.random.default_rng(seed)
    return (r.standard_normal(n) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 22)

def crash(seed=2, length=2.0):
    n = int(SR * length); t = np.arange(n) / SR; r = np.random.default_rng(seed)
    x = np.diff(np.concatenate([[0], r.standard_normal(n)]))
    return x * np.exp(-t * 2.2) * 0.5

def riser(length):
    n = int(SR * length); t = np.arange(n) / SR; r = np.random.default_rng(5)
    x = r.standard_normal(n); x = np.diff(np.concatenate([[0], x]))
    return x * (t / length) ** 2 * 0.35 + np.sin(2 * np.pi * (200 + 600 * (t / length) ** 2) * t) * (t / length) ** 2 * 0.15

def build():
    out = np.zeros(int(SR * (DUR + 3)))
    # 0–6 c: тихий вступ — колокольчики по аккордам, мягкие бубенцы
    beat = 60 / 175
    intro = [('C5', 'E5', 'G5'), ('A4', 'C5', 'E5'), ('F4', 'A4', 'C5'), ('G4', 'B4', 'D5')]
    for k, ch in enumerate(intro):
        for j, n in enumerate(ch * 2):
            m.add(out, m.glock(m.hz(n), 0.4), k * 1.25 + j * 0.16, 0.22)
    for k in range(10): m.add(out, m.JINGLE[k % 4], k * 0.5, 0.05)
    # 3.2–6.4 c: нарастание
    m.add(out, riser(2.4), 2.6, 1.0)
    # 6.4 c: удар + быстрый «Jingle Bells» (припев) 150 bpm с барабанами
    t0 = 5.0
    jb = m.section(m.JB, m.JB_CH, 175, 4)
    m.add(out, jb, t0, 1.0)
    m.add(out, crash(), t0, 0.9)
    nbeats = int(len(jb) / SR / beat)
    for k in range(nbeats):
        tt = t0 + k * beat
        m.add(out, kick(), tt, 0.55 if k % 2 == 0 else 0.4)
        if k % 2 == 1: m.add(out, snare(k), tt, 0.28)
    # финал: удар и звон
    tend = t0 + len(jb) / SR
    m.add(out, crash(7, 3.0), tend, 1.0); m.add(out, kick(), tend, 0.8)
    for n in ('C5', 'E5', 'G5', 'C6'): m.add(out, m.glock(m.hz(n), 2.5), tend, 0.3)
    out = out[: int(SR * DUR)]
    f = int(SR * 1.2); out[-f:] *= np.linspace(1, 0, f)
    out /= np.max(np.abs(out)) + 1e-9
    return (out * 0.85).astype(np.float32), tend

if __name__ == '__main__':
    x, tend = build()
    pcm = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype(np.int16)
    with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('wrote', sys.argv[1], 'финальный удар на', round(tend, 2), 'c')
