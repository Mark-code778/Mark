"""Synthesizes background music + SFX and mixes with the voiceover (voice starts at 1.2s)."""
import numpy as np, subprocess
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; DUR = 20.0; N = int(SR * DUR)
VOICE_OFF = 1.2
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def env(n, a, d):  # attack + exp decay (seconds)
    t = np.arange(n) / SR; e = np.exp(-t / max(d, 1e-4)); at = int(a * SR)
    if at > 0: e[:at] *= np.linspace(0, 1, at)
    return e
def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR); x = x[: max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[0, i:i + len(x)] += x * gain * l * 1.414; buf[1, i:i + len(x)] += x * gain * r * 1.414
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def reverb(st, dur=1.8, mix=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    out = st.copy()
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 3.2); ir = lp(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
        out[ch] = st[ch] * (1 - mix) + fftconvolve(st[ch], ir)[: st.shape[1]] * mix * 1.2
    return out

# ================= MUSIC =================
BPM = 112; BEAT = 60 / BPM
mus = np.zeros((2, N))
DROP = 8.7

# --- part A: tense, sparse (0 .. 8.1) ---
def saw(f, d, det=0.0):
    t = t_(d); ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))
padA = np.zeros(int(8.15 * SR))
for m in [45, 52, 57, 60, 64]:  # A minor
    for det in (-0.004, 0.004):
        padA += saw(mtof(m), 8.15, det) * 0.06
padA = lp(padA, 900)
fade = np.minimum(1, np.arange(len(padA)) / (SR * 1.0))
padA *= fade
# tape-stop at 7.85..8.15: progressively slow playback
ts0 = int(7.85 * SR); seg = padA[ts0:]
rate = np.linspace(1, 0.05, len(seg)); pos = np.cumsum(rate); pos = np.clip(pos, 0, len(seg) - 1)
padA[ts0:] = np.interp(pos, np.arange(len(seg)), seg) * np.linspace(1, 0, len(seg))
add(mus, padA, 0, 0.9)
# ticking clock + low heartbeat pulse
tick = hp(rng.standard_normal(int(0.02 * SR)), 3000) * env(int(0.02 * SR), 0.0005, 0.006)
k = 0
t = 0.6
while t < 7.8:
    add(mus, tick, t, 0.22 if k % 2 == 0 else 0.13, pan=0.3 if k % 2 else -0.3)
    if k % 2 == 0:
        tt = t_(0.25); thump = np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * env(len(tt), 0.002, 0.08)
        add(mus, thump, t, 0.35)
    t += BEAT; k += 1

# --- part B: warm groove from DROP ---
def ep(m, d, vel=1.0):  # electric-piano-ish tone
    t = t_(d); f = mtof(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 10) + 0.06 * np.sin(2 * np.pi * 7.1 * f * t) * np.exp(-t * 25))
    x *= (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t))
    return x * env(len(t), 0.004, 0.9) * vel
def kick():
    t = t_(0.45); f = 48 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.16) + hp(rng.standard_normal(len(t)), 2000) * env(len(t), 0, 0.004) * 0.3
def clap():
    n = int(0.3 * SR); x = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for o in (0, 0.011, 0.022): i = int(o * SR); e[i:] += env(n - i, 0.0005, 0.012 if o < 0.02 else 0.09)
    return x * e * 0.8
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); return hp(rng.standard_normal(n), 7000) * env(n, 0.0005, 0.08 if open_ else 0.018)
def bass(m, d):
    t = t_(d); f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * lp(saw(f, d), 600)
    return x * env(len(t), 0.005, d * 0.9) * np.minimum(1, (d - t) / 0.03 + 0.001).clip(0, 1)

# chord progression (1 bar each): Fmaj9, Dm9, Bbmaj9, C6/9
prog = [([41], [57, 60, 64, 67]), ([38], [57, 60, 65, 64 + 0]), ([46], [57, 60, 62, 65]), ([48], [55, 60, 62, 64])]
prog = [([41], [57, 60, 64, 67]), ([38], [53, 57, 60, 64]), ([46], [53, 57, 60, 62]), ([48], [55, 60, 62, 64])]
BAR = 4 * BEAT
END_GROOVE = 18.9
drums = np.zeros((2, N)); keys = np.zeros((2, N)); bassb = np.zeros((2, N))
bar_i = 0; t0 = DROP
while t0 < END_GROOVE:
    root, ch = prog[bar_i % 4]
    # keys: syncopated stabs
    for off, dur, v in [(0, 1.4, 1.0), (1.5, 0.45, 0.6), (2.5, 1.3, 0.85), (3.5, 0.4, 0.5)]:
        tt = t0 + off * BEAT
        if tt >= END_GROOVE: continue
        for j, m in enumerate(ch):
            add(keys, ep(m, dur * BEAT + 0.6, v), tt + j * 0.006, 0.09, pan=(j - 1.5) * 0.25)
    # bass
    for off, dur, dm in [(0, 0.9, 0), (1.5, 0.4, 0), (2, 0.9, 12), (3, 0.45, 7), (3.5, 0.4, 0)]:
        tt = t0 + off * BEAT
        if tt < END_GROOVE: add(bassb, bass(root[0] + dm, dur * BEAT), tt, 0.32)
    # drums
    for b in range(4):
        tt = t0 + b * BEAT
        if tt >= END_GROOVE: break
        if b in (0, 2): add(drums, kick(), tt, 0.75)
        if b == 2 and bar_i % 2 == 1: add(drums, kick(), tt + 0.75 * BEAT, 0.5)
        if b in (1, 3): add(drums, clap(), tt, 0.32)
        add(drums, hat(), tt, 0.10, pan=0.35); add(drums, hat(b == 3), tt + 0.5 * BEAT + 0.012, 0.13 if b == 3 else 0.08, pan=0.35)
    bar_i += 1; t0 += BAR
# final chord ring
add(keys, sum(ep(m, 2.5) for m in [53, 57, 60, 64, 67, 72]), END_GROOVE, 0.08)
add(bassb, bass(41, 1.6), END_GROOVE, 0.3)
add(drums, kick(), END_GROOVE, 0.6)
# rising pluck arpeggio during charging (12.0 .. 13.45)
arp = [65, 69, 72, 76, 77, 81, 84, 88]
n_steps = int((13.45 - 12.0) / (BEAT / 4)) + 1
for i in range(n_steps):
    tt = 12.0 + i * BEAT / 4
    m = arp[i % len(arp)] - 12 + 12 * (i // len(arp))
    add(keys, ep(min(m, 96), 0.35, 0.5 + 0.5 * i / n_steps), tt, 0.07, pan=0.5 * np.sin(i))
mus += reverb(keys, 2.0, 0.35) + reverb(bassb, 0.6, 0.05) + reverb(drums, 1.0, 0.12)
# fade out at end
mus[:, int(19.2 * SR):] *= np.linspace(1, 0, N - int(19.2 * SR))

# ================= SFX =================
sfx = np.zeros((2, N))
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, shape='exp'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if shape == 'exp' else np.linspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def whoosh(d, f0, f1, peak=0.6):
    n = int(d * SR); x = noise(d); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / n)
        out[i:i + blk] = bp(x[max(0, i - 2048):i + blk], max(60, fc * 0.6), min(18000, fc * 1.6))[-len(x[i:i + blk]):]
    t = np.arange(n) / n; e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    return out * e
def glitch(d=0.22):
    n = int(d * SR); x = noise(d); crush = np.repeat(x[::40], 40)[:n]
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(rng.choice([400, 900, 1600, 2400], n // 800 + 1).repeat(800)[:n]) / SR))
    g = (rng.random(n // 600 + 1) > 0.35).repeat(600)[:n]
    return (bp(crush, 500, 8000) * 0.6 + tone * 0.25) * g * env(n, 0.001, d * 0.6)
def ping(f=1320):
    t = t_(0.6); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 8)) * env(len(t), 0.002, 0.18)
def beep(f, d=0.14):
    t = t_(d); x = np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t) * 0.6
    return lp(x, 3000) * np.minimum(1, np.minimum(t / 0.005, (d - t) / 0.01))
def thud(f=70, d=0.35):
    t = t_(d); return np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t * 25)) / SR) * env(len(t), 0.001, 0.09) + lp(noise(d), 400) * env(len(t), 0, 0.03) * 0.5
def impact():
    t = t_(2.2); boom = np.sin(2 * np.pi * np.cumsum(38 + 140 * np.exp(-t * 14)) / SR) * env(len(t), 0.001, 0.55)
    crack = hp(noise(2.2), 1500) * env(len(t), 0.0005, 0.05)
    body = lp(noise(2.2), 1200) * env(len(t), 0.001, 0.25)
    return boom * 1.0 + crack * 0.5 + body * 0.4
def crunch(d=0.35):
    n = int(d * SR); out = np.zeros(n)
    for _ in range(90):
        i = rng.integers(0, n - 800); L = rng.integers(80, 700)
        out[i:i + L] += bp(rng.standard_normal(L), 800, 7000) * env(L, 0.0002, L / SR / 4) * rng.uniform(0.3, 1)
    return out * np.linspace(1, 0.3, n)
def pop(f0=300, f1=900):
    t = t_(0.18); return sweep(f0, f1, 0.18) * env(len(t), 0.002, 0.05)
def chime(base=84):
    out = np.zeros(int(2.5 * SR))
    for j, m in enumerate([base, base + 4, base + 7, base + 12]):
        t = t_(2.5 - j * 0.05); f = mtof(m)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 4)) * env(len(t), 0.002, 0.9)
        out[int(j * 0.05 * SR):] += x[: len(out) - int(j * 0.05 * SR)]
    return out
def shimmer(d=1.4):
    out = np.zeros(int(d * SR))
    for i in range(40):
        st = rng.uniform(0, d - 0.3); m = rng.choice([88, 91, 93, 96, 98, 100])
        t = t_(0.3); x = np.sin(2 * np.pi * mtof(m) * t) * env(len(t), 0.003, 0.07)
        i0 = int(st * SR); out[i0:i0 + len(x)] += x * np.sin(np.pi * st / d)
    return out

for w in (1.2, 2.96, 4.24, 5.48): add(sfx, glitch(), w - 0.02, 0.35, pan=rng.uniform(-0.3, 0.3))
for w, f in ((1.25, 1320), (3.01, 1175), (4.29, 1046)): add(sfx, ping(f), w + 0.05, 0.16, pan=-0.4)
add(sfx, beep(880), 5.95, 0.16, 0.4); add(sfx, beep(660, 0.25), 6.15, 0.16, 0.4)
add(sfx, whoosh(0.7, 3000, 300), 7.0, 0.35, -0.3)
for tt, g in ((7.62, 0.35), (7.78, 0.25), (7.9, 0.2)): add(sfx, thud(90, 0.3), tt, g, -0.2)
add(sfx, whoosh(0.8, 2000, 200), 7.25, 0.3, 0.4); add(sfx, thud(55, 0.45), 8.02, 0.55, 0.3)
tv = sweep(2400, 80, 0.38) * env(int(0.38 * SR), 0.001, 0.2); add(sfx, tv, 8.12, 0.18)
add(sfx, whoosh(0.55, 300, 6000, 0.95), 8.17, 0.4)            # reverse-riser into hit
add(sfx, impact(), 8.7, 0.8)
add(sfx, whoosh(0.4, 4000, 600, 0.3), 8.68, 0.4, 0.5)
add(sfx, crunch(), 8.95, 0.5, 0.1)
for w in (8.97, 9.56, 10.26, 10.9): add(sfx, pop(260, 820), w, 0.28, pan=0.35)
add(sfx, whoosh(0.5, 500, 5000, 0.6), 11.55, 0.4, 0.2)          # bar flies away
riser = sweep(180, 1400, 1.5) * np.linspace(0, 1, int(1.5 * SR)) ** 1.5
add(sfx, lp(riser, 4000), 11.97, 0.09)
add(sfx, whoosh(1.5, 400, 9000, 0.97), 11.97, 0.22)
add(sfx, chime(84), 13.45, 0.16)
add(sfx, whoosh(0.4, 400, 8000, 0.9), 13.52, 0.4)
add(sfx, impact() * 0.5 + np.pad(shimmer(1.4), (0, int(0.8 * SR))), 13.9, 0.45)
add(sfx, shimmer(1.2), 14.55, 0.35, 0.3)
add(sfx, thud(60, 0.4), 15.14, 0.3)
add(sfx, shimmer(1.0), 17.65, 0.25, -0.3)
sfx = reverb(sfx, 1.2, 0.18)

# ================= VOICE + MIX =================
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'audio/voice.mp3', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
v = hp(v, 70); v = v / np.max(np.abs(v)) * 0.89
voice = np.zeros((2, N)); add(voice, v, VOICE_OFF, 1.0)
# ducking envelope from voice
e = np.abs(voice[0]); e = lp(e, 8, 1); e = e / e.max()
duck = 1 - 0.55 * np.clip(e * 3, 0, 1)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vr = rms(v[np.abs(v) > 0.02])
mus *= (vr / rms(mus[:, int(DROP * SR):int(16 * SR)])) * 10 ** (-17 / 20)   # music ~17 dB under voice
mus *= duck
sfx_gain = 0.55
mix = voice + mus + sfx * sfx_gain
pk = np.max(np.abs(mix)); mix = mix / pk * 0.95
for name, x in (('mix', mix), ('music', mus / np.max(np.abs(mus)) * 0.9), ('sfx', sfx / np.max(np.abs(sfx)) * 0.9)):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', f'audio/{name}.wav'], input=x.T.astype(np.float32).tobytes())
print('done', 'peak', pk)
