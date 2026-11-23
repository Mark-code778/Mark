# build_shots.py — собирает story/shots.json из таймлайна фраз и покадрового плана ниже.
# Запуск: python3 story/build_shots.py (из папки проекта). Тайминг берётся из timeline/*.json (Whisper).
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
SENT = json.load(open(os.path.join(PROJ, 'timeline/sentences.json')))
WORDS = json.load(open(os.path.join(PROJ, 'timeline/words.json')))['words']
CFG = json.load(open(os.path.join(PROJ, 'config.json')))

# ---------- конструкторы ----------
def a(c, x, p='stand', f=1, e=None, **kw): d = {'c': c, 'x': x, 'p': p, 'f': f}; d.update({'e': e} if e else {}); d.update(kw); return d
def S(set_, actors=(), **kw): d = {'tpl': 'scene', 'set': set_, 'actors': list(actors)}; d.update(kw); return d
def F(c, e='neutral', set_='living', **kw): d = {'tpl': 'face', 'c': c, 'e': e, 'set': set_}; d.update(kw); return d
def I(set_, items, **kw): d = {'tpl': 'insert', 'set': set_, 'items': items}; d.update(kw); return d
def C(str_, set_='void', **kw): d = {'tpl': 'card', 'str': str_, 'set': set_}; d.update(kw); return d
def BP(id_, **kw): d = {'tpl': 'bp', 'id': id_}; d.update(kw); return d
def it(n, x, y, s=1, **kw): d = {'n': n, 'x': x, 'y': y, 's': s}; d.update(kw); return d
def day(n): return [{'k': 'badge', 'str': f'ДЕНЬ {n}'}]
def q(str_, x=0.5, y=0.2, w=560, h=120, **kw): d = {'k': 'quote', 'str': str_, 'x': x, 'y': y, 'w': w, 'h': h}; d.update(kw); return d
GY = 0.8
A_ = lambda x, p='stand', f=1, e=None, **kw: a('A', x, p, f, e, **kw)   # Артём (невидим, пока ghost сцены не выключен)
L_ = lambda x, p='stand', f=-1, e=None, **kw: a('L', x, p, f, e, **kw)
MERGE = 'MERGE'
TALK = {'talk': True}

exec(open(os.path.join(HERE, 'plan.py'), encoding='utf-8').read())
# ---------- сборка ----------
def word_index(t):
    for i, w in enumerate(WORDS):
        if w['start'] >= t - 0.01: return i
    return len(WORDS) - 1

shots = []; dur = round(CFG['duration'] + 1.5, 2)
for i, s in enumerate(SENT):
    spec = PLAN.get(i)
    if spec is None: raise SystemExit(f'нет плана для фразы {i}: {s["text"]}')
    if spec == MERGE:
        shots[-1]['line'] += ' ' + s['text']; continue
    specs = spec if isinstance(spec, list) else [spec]
    # делим фразу по словам поровну между кадрами
    w0 = word_index(s['start']); ws = [w for w in WORDS[w0:] if w['start'] < s['end'] - 0.01] or [WORDS[w0]]
    n = len(specs)
    for k, sp in enumerate(specs):
        a_ = ws[int(len(ws) * k / n)]; b_ = ws[int(len(ws) * (k + 1) / n) - 1] if k < n - 1 else ws[-1]
        st = 0.0 if not shots else max(shots[-1]['_t0'] + 0.5, a_['start'] - 0.15)
        line = ' '.join(w['word'] for w in ws[int(len(ws) * k / n): int(len(ws) * (k + 1) / n)])
        sp = dict(sp); sh = {'id': f's{len(shots) + 1:03d}', '_t0': round(st, 2), 'line': line, '_i': i}
        if '_in' in sp: sh['in'] = sp.pop('_in')
        if '_sfx' in sp: sh['sfx'] = sp.pop('_sfx')
        if 'sfx' in sp: sh.setdefault('sfx', []).extend(x for x in sp.pop('sfx') if x['name'] != 'roomtone')
        if '_ui' in sp: sp['ui'] = sp.pop('_ui')
        setn = sp.get('set', 'void'); am = AMB.get(setn, ('roomtone', -32)); sh['amb'] = {'name': am[0], 'gain': am[1]}
        sh['set'] = setn; sh['scene'] = sp.get('tpl', 'scene') + ':' + setn; sh['params'] = sp
        if sp.get('tpl') in ('title', 'card'): sh['bars'] = 'scope'
        if sp.get('tpl') == 'end': sh['bars'] = 'none'
        shots.append(sh)
for k, sh in enumerate(shots):
    sh['start'] = sh.pop('_t0'); sh['end'] = shots[k + 1]['_t0'] if k + 1 < len(shots) else dur
for sh in shots: sh['end'] = round(sh['end'], 2)
# защита от слишком коротких кадров
music = []; starts = {sh['_i']: sh['start'] for sh in reversed(shots)}
for j, (si, m, inten) in enumerate(MUSIC):
    st = 0 if j == 0 else starts[si]; en = dur if j + 1 == len(MUSIC) else starts[MUSIC[j + 1][0]]
    music.append({'start': round(st, 2), 'end': round(en, 2), 'mood': m, 'intensity': inten})
for sh in shots: sh.pop('_i', None)
out = {'title': CFG['title'], 'duration': dur, 'shots': shots, 'music': music, 'sfx': []}
json.dump(out, open(os.path.join(HERE, 'shots.json'), 'w'), ensure_ascii=False, indent=1)
lens = sorted(sh['end'] - sh['start'] for sh in shots)
print(f'{len(shots)} shots, duration {dur}s, median {lens[len(lens)//2]:.2f}s, min {lens[0]:.2f}s, max {lens[-1]:.2f}s')
