// shots/templates.js — регистрирует ВСЕ кадры из story/shots.json по их params (tpl + описание).
// Правила проекта: все персонажи одного среднего роста (один масштаб на кадр, без kid),
// Артём невидим (призрачный контур) до 30-го дня, любые надписи не выходят за рамки своего предмета.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, measure, FONTS, rng, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS } from '../sets/world.js';
import { drawItem, fitText, sign } from '../sets/items.js';
import { CAST } from '../cast.js';
import { BP } from './bp.js';

export const SCALE = { w: 1.05, m: 1.55, c: 2.1 };   // общий, средний, крупный — одинаково для ВСЕХ персонажей кадра
const XP = {
  floorSit: { head: [10, -112], sh: [4, -80], hip: [0, -8], eF: [20, -46], hF: [44, -30], eB: [8, -44], hB: [28, -30], kF: [44, -46], fF: [80, 0], kB: [40, -42], fB: [72, 0] },
  hug: { head: [10, -206], sh: [4, -172], hip: [0, -100], eF: [40, -150], hF: [62, -170], eB: [34, -146], hB: [56, -166], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  toast: { head: [4, -208], sh: [1, -174], hip: [0, -100], eF: [22, -196], hF: [30, -236], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  lean: { head: [-22, -200], sh: [-14, -168], hip: [0, -100], eF: [8, -132], hF: [14, -100], eB: [-24, -132], hB: [-26, -98], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  mop: { head: [12, -200], sh: [6, -168], hip: [0, -100], eF: [26, -140], hF: [40, -120], eB: [20, -140], hB: [34, -150], kF: [10, -50], fF: [12, 0], kB: [-8, -50], fB: [-14, 0] },
};
const P = (name) => (typeof name === 'string' ? XP[name] || POSES[name] || POSES.stand : name);
const kv = (v, u) => (Array.isArray(v) && Array.isArray(v[0]) ? key(u, v.map(([a, b]) => [a, b])) : v);
const pick = (v, u) => { if (!Array.isArray(v) || !Array.isArray(v[0])) return v; let r = v[0][1]; for (const [a, b] of v) if (u >= a) r = b; return r; };

function camAt(c, u, t) {
  const e = ease.inOut(u); let cam = { z: 1, x: 0, y: 0, r: 0 };
  const base = typeof c === 'object' && c ? c : {};
  const kind = typeof c === 'string' ? c : base.k || 'push';
  if (kind === 'push') cam = { z: 1 + 0.07 * e, x: -25 * e, y: 0 };
  if (kind === 'pull') cam = { z: 1.1 - 0.09 * e, x: 20 * e, y: 0 };
  if (kind === 'left') cam = { z: 1.04, x: 50 - 100 * e, y: 0 };
  if (kind === 'right') cam = { z: 1.04, x: -50 + 100 * e, y: 0 };
  if (kind === 'slow') cam = { z: 1.02 + 0.03 * e, x: 10 * e, y: 0 };
  if (kind === 'shake') { const [sx, sy] = shake(t, 9, 6); cam = { z: 1.06, x: sx, y: sy }; }
  if (kind === 'roll') cam = { z: 1.05 + 0.04 * e, x: 0, y: 0, r: 0.025 * Math.sin(t * 0.9) };
  if (base.z) cam.z = Array.isArray(base.z) ? lerp(base.z[0], base.z[1], e) : base.z;
  if (base.x != null) cam.x += Array.isArray(base.x) ? lerp(base.x[0], base.x[1], e) : base.x;
  if (base.y != null) cam.y += Array.isArray(base.y) ? lerp(base.y[0], base.y[1], e) : base.y;
  if (base.r) cam.r = base.r;
  return cam;
}

// ---------- персонаж (в т.ч. невидимый Артём) ----------
function actor(g, a, t, u, info, ctx) {
  const s = ctx.s, of = CAST[a.c] || CAST.PLAIN, dur = info.dur;
  let x = E.W * (a.x ?? 0.5), y = ctx.GY + (a.dy || 0) * E.H, f = a.f ?? 1, pose;
  if (a.walk) { const [x0, x1] = a.walk, k = a.wk ? ease.inOut(prog(u, a.wk[0], a.wk[1])) : u; x = E.W * lerp(x0, x1, k); f = x1 >= x0 ? 1 : -1; if (a.f != null) f = a.f;
    const moving = !a.wk || (u > a.wk[0] && u < a.wk[1]); pose = moving ? walkPose(t * Math.PI * 2 * (a.run ? 1.6 : 0.9), { run: !!a.run }) : Array.isArray(a.p) ? posesAt(u * dur, a.p.map(([k2, n]) => [k2 * dur, P(n)]), 0.3) : P(a.p || 'stand'); }
  else if (Array.isArray(a.p)) pose = posesAt(u * dur, a.p.map(([k2, n]) => [k2 * dur, P(n)]), 0.3);
  else pose = P(a.p || 'stand');
  if (!a.walk && a.breathe !== false) pose = breathe(pose, t, 1, (a.seed || 0) + a.c.length);
  const expr = pick(a.e, u) || 'neutral';
  const ghost = a.c === 'A' && ctx.ghost && !a.vis;
  const rim = { color: ctx.M.rim, dir: a.rim || ctx.rimDir || [0, -1], w: 4.5 };
  const o = { x, y, s, facing: f, pose, outfit: of, expr, rim, rot: a.rot || 0, look: a.look, blink: (t + (a.seed || 0)) % 3.3 > 3.18, talk: a.talk ? talkAmount(info.globalT) : 0, prop: a.prop, shadow: !ghost && !a.rot };
  const sitting = (typeof a.p === 'string' && /^sit/.test(a.p)) || (Array.isArray(a.p) && a.p.some(([, n]) => /^sit/.test(n)));
  if (sitting && a.chair !== false && !a.walk) { g.save(); g.translate(x, 0); g.scale(f, 1); FX.chair(g, -18 * s, ctx.GY, s, shade(ctx.M.dark, -0.2)); g.restore(); }
  if (ghost) {
    g.save(); g.globalAlpha *= 0.2; drawFigure(g, { ...o, rim: { ...rim, color: '#fff2dc' } }); g.restore();
    // мерцание «воздуха» вокруг невидимки
    const r = rng(7); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const px = x + (r() - 0.5) * 70 * s, py = y - r() * 230 * s, k = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); circle(g, px, py, 1.6 * s, alpha('#fff2dc', 0.18 * k)); } g.restore();
  } else drawFigure(g, o);
  if (a.hold) { const p2 = pose, hx = x + p2.hF[0] * f * s, hy = y + p2.hF[1] * s; const items = Array.isArray(a.hold) ? a.hold : [a.hold]; items.forEach(it => { const n = typeof it === 'string' ? it : it.n; drawItem(g, n, hx + (it.dx || 0) * s, hy + (it.dy || 0) * s, (it.s || 0.6) * s / 1.55, t, { ...(it.o || {}), rot: it.rot || 0 }); }); }
  if (a.talk && !ghost) { const [hx, hy, hr] = headPos(o); FX.rings(g, hx, hy, t, { count: 2, r0: hr * 1.4, r1: hr * 3, color: '#fff1e6', a: 0.25 }); }
  if (a.voice) { const [hx, hy, hr] = headPos(o); FX.rings(g, hx, hy, t, { count: 3, r0: hr * 1.2, r1: hr * 3.4, color: '#fff1e6', a: 0.35 }); }
}

function items(g, list, t, u) {
  for (const it of list || []) {
    let x = it.x, y = it.y, rot = it.rot || 0;
    if (it.path) { const k = it.path.map(([a, px, py, pr]) => [a, [px, py, pr ?? rot]]); const v = key(u, k); x = v[0]; y = v[1]; rot = v[2]; }
    if (it.bob) y += Math.sin(t * 3 + (it.seed || 0)) * it.bob / E.H;
    if (it.show && (u < it.show[0] || u > it.show[1])) continue;
    const o = { ...(it.o || {}), rot }; if (it.o?.pk) o.p = clamp((u - it.o.pk[0]) / (it.o.pk[1] - it.o.pk[0]));
    if (it.o?.bitesK) o.bites = Math.floor(clamp(u * it.o.bitesK, 0, it.o.bitesK)) / 1;
    if (it.o?.nFrom != null) o.n = Math.round(lerp(it.o.nFrom, it.o.nTo ?? 0, clamp(u * 1.1)));
    if (it.shake) { x += Math.sin(t * 40) * it.shake / E.W; y += Math.cos(t * 37) * it.shake / E.H; }
    drawItem(g, it.n, x * E.W, y * E.H, it.s || 1, t, o);
    if (it.glow) glow(g, x * E.W, y * E.H - 60 * (it.s || 1), 180 * (it.s || 1), it.glow, 0.25);
  }
}

// ---------- оверлеи (надписи, бейджи, цифры) ----------
function overlays(g, list, t, u, info) {
  for (const o of list || []) {
    const st = (o.at ?? 0) * info.dur; const lt = t - st; if (lt < 0) continue;
    const a = clamp(lt / 0.3) * clamp((info.dur - t) / 0.25);
    if (o.k === 'badge') UI.badge(g, { str: o.str, a, color: o.color });
    if (o.k === 'readout') UI.readout(g, { label: o.label, value: o.value, x: (o.x ?? 0.08) * E.W, y: (o.y ?? 0.83) * E.H, a, align: o.align || 'left', color: o.color });
    if (o.k === 'line') UI.bigLine(g, lt, { str: o.str, dur: info.dur - st, y: (o.y ?? 0.5) * E.H, size: o.size || 84, color: o.color });
    if (o.k === 'callout') UI.callout(g, lt, { at: [o.at2[0] * E.W, o.at2[1] * E.H], to: [o.to[0] * E.W, o.to[1] * E.H], str: o.str, size: o.size || 34 });
    if (o.k === 'quote') { // реплика персонажа в «пузыре» — текст строго внутри пузыря
      const w = o.w || 560, h = o.h || 120, x = (o.x ?? 0.5) * E.W, y = (o.y ?? 0.2) * E.H, sc = ease.outBack(clamp(lt / 0.35));
      g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc); rr(g, -w / 2, -h / 2, w, h, 26); g.fillStyle = 'rgba(255,248,236,.95)'; g.fill();
      const tx = o.tail ?? 0; poly(g, [[tx * w * 0.4 - 24, h / 2 - 4], [tx * w * 0.4 + 24, h / 2 - 4], [tx * w * 0.4 + (o.tailDir ?? -1) * 50, h / 2 + 40]], 'rgba(255,248,236,.95)');
      fitText(g, o.str, 0, 0, w - 60, h - 30, { color: '#1a1622', font: FONTS.ui, weight: 900 }); g.restore();
    }
    if (o.k === 'counter') { const v = Math.round(lerp(o.from, o.to, ease.out(clamp(lt / (o.d || 1))))); UI.readout(g, { label: o.label, value: (o.pre || '') + v + (o.unit || ''), x: (o.x ?? 0.5) * E.W, y: (o.y ?? 0.5) * E.H, a, align: 'center', size: o.size || 72, color: o.color }); }
  }
}

// ---------- шаблоны ----------
const TPL = {
  scene: (p) => ({ draw(g, t, info) {
    const u = t / info.dur, cam = camAt(p.cam, u, t); const setF = SETS[p.set] || SETS.void;
    const ctx = { ...setF(g, t, cam, p.so || {}), s: typeof p.s === 'number' ? p.s : SCALE[p.s || 'm'], ghost: p.ghost !== false, rimDir: p.rimDir };
    layer(g, cam, 1, g => { items(g, p.back, t, u); for (const a of p.actors || []) actor(g, a, t, u, info, ctx); items(g, p.items, t, u); });
    if (p.fgBlur) blurLayer(g, 10, g => { const c = CAST[p.fgBlur.c] || CAST.PLAIN; drawFigure(g, { x: E.W * p.fgBlur.x, y: E.H * 1.25, s: 3.4, facing: p.fgBlur.f ?? 1, outfit: c, pose: POSES.stand, rim: { color: ctx.M.rim, dir: [0, -1], w: 5 }, alpha: p.fgBlur.c === 'A' && p.ghost !== false ? 0.2 : 1 }); }, cam, 1.6);
    atmos(g, t, p, ctx.M);
    overlays(g, p.ui, t, u, info);
  } }),
  // крупный план лица. Для невидимого Артёма — «пустое» лицо: только мерцающий контур
  face: (p) => ({ draw(g, t, info) {
    const u = t / info.dur; const setF = SETS[p.set] || SETS.void;
    let M; blurLayer(g, 14, g => { M = setF(g, t, { z: 1.4, x: p.bgx ?? -120, y: -120 }, p.so || {}).M; }); veil(g, '#0a0810', 0.35); M = M || mood('dusk');
    const r = 300 * (1 + 0.05 * u), cx = E.W * (p.x ?? 0.5), cy = E.H * 0.6;
    const of = CAST[p.c] || CAST.PLAIN, ghost = p.c === 'A' && p.ghost !== false;
    g.save(); if (ghost) g.globalAlpha *= 0.22;
    bigFace(g, cx, cy, r, { outfit: of, expr: pick(p.e, u) || 'neutral', talk: p.talk ? talkAmount(info.globalT) : 0, blink: t % 3.4 > 3.28, look: p.look || [0, 0], rimColor: M.rim, rimSide: p.side ?? -1, tilt: p.tilt || 0 });
    g.restore();
    if (ghost) { const rr0 = rng(3); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const a2 = rr0() * 6.28, d = r * (0.9 + rr0() * 0.15); circle(g, cx + Math.cos(a2) * d, cy + Math.sin(a2) * d, 2.5, alpha('#fff2dc', 0.25 + 0.2 * Math.sin(t * 3 + i))); } g.restore(); }
    if (p.tears) { g.fillStyle = '#9fd8ff'; for (const dx of [-0.34, 0.34]) { const yy = cy - r * 0.1 + ((t * 120 + dx * 500) % (r * 0.8)); g.beginPath(); g.ellipse(cx + dx * r, yy, r * 0.04, r * 0.07, 0, 0, 7); g.fill(); } }
    items(g, p.items, t, u);
    if (p.talk) FX.rings(g, cx, cy, t, { count: 3, r0: r * 1.1, r1: r * 1.6, color: '#fff1e6', a: 0.18 });
    FX.dust(g, t, { count: 30, a: 0.3 });
    overlays(g, p.ui, t, u, info);
  } }),
  // вставка: предмет крупно на размытом фоне
  insert: (p) => ({ draw(g, t, info) {
    const u = t / info.dur; const setF = SETS[p.set] || SETS.void; let M;
    blurLayer(g, 16, g => { M = setF(g, t, { z: 1.6, x: p.bgx ?? 160, y: -60 }, p.so || {}).M; }); veil(g, '#0a0810', 0.3);
    const cam = camAt(p.cam || 'push', u, t);
    layer(g, cam, 1, g => { items(g, p.items, t, u); if (p.hand) hand(g, p.hand, t, u); });
    if (p.rings) FX.rings(g, p.rings[0] * E.W, p.rings[1] * E.H, t, { count: 3, r0: 60, r1: 320, color: '#fff3e0', a: 0.4 });
    FX.dust(g, t, { count: 36, a: 0.35 });
    overlays(g, p.ui, t, u, info);
  } }),
  title: (p) => ({ draw(g, t, info) {
    SETS.bathroom(g, t, { z: 1.12 + 0.04 * t / info.dur, x: -30 }, {}); veil(g, '#0a0812', 0.55);
    UI.titleCard(g, t, { lines: p.lines, sub: p.sub, dur: info.dur });
    FX.dust(g, t, { count: 50, a: 0.4 });
  } }),
  card: (p) => ({ draw(g, t, info) {
    const setF = SETS[p.set] || SETS.void; blurLayer(g, 12, g => setF(g, t, { z: 1.2 + 0.05 * t / info.dur, x: 0 }, p.so || {})); veil(g, '#08060c', 0.55);
    UI.bigLine(g, t, { str: p.str, dur: info.dur, y: E.H * (p.sub ? 0.44 : 0.5), size: p.size || 120 });
    if (p.sub) { const a = clamp((t - 0.3) / 0.4) * clamp((info.dur - t) / 0.3); text(g, p.sub, E.W / 2, E.H * 0.6, { size: 44, font: FONTS.ui, weight: 900, color: '#fff1dc', alpha: a, maxW: E.W * 0.85, spacing: 2 }); }
    FX.dust(g, t, { count: 40, a: 0.35 });
    overlays(g, p.ui, t, t / info.dur, info);
  } }),
  bp: (p) => ({ draw(g, t, info) { UI.blueprint(g); const f = BP[p.id]; if (f) f(g, t, info, p); overlays(g, p.ui, t, t / info.dur, info); } }),
  call: (p) => ({ draw(g, t, info) { callScreen(g, t, info, p); overlays(g, p.ui, t, t / info.dur, info); } }),
  end: (p) => ({ draw(g, t, info) {
    const M = mood('dusk');
    UI.endScreen(g, t, { question: p.q || 'А что бы услышал ты?', cast: [CAST.A, CAST.L, CAST.MOM, CAST.DAD, CAST.GRAN], moodColors: [M.sky[0], M.sky[1], M.wall], rim: M.rim, subscribe: 'Подписаться' });
    FX.dust(g, t, { count: 40, a: 0.35 });
  } }),
};

// рука крупным планом (вставки): ладонь касается / держит
function hand(g, h, t, u) {
  const x = lerp(h.x0, h.x1, ease.inOut(prog(u, h.k?.[0] ?? 0, h.k?.[1] ?? 0.6))) * E.W, y = lerp(h.y0, h.y1, ease.inOut(prog(u, h.k?.[0] ?? 0, h.k?.[1] ?? 0.6))) * E.H;
  const c = h.ghost ? alpha('#fff2dc', 0.25) : '#0e0b12', sl = CAST[h.c || 'GRAN'].color || '#8a5ad6', dir = h.dir ?? 1;
  g.save(); if (h.ghost) g.globalAlpha *= 0.5;
  seg(g, [[x, y], [x - dir * 900, y + 500]], 90, h.ghost ? alpha(sl, 0.3) : sl); circle(g, x, y, 60, c); for (let i = 0; i < 4; i++) seg(g, [[x, y], [x + dir * (60 + i * 6), y - 70 + i * 40]], 24, c);
  g.restore();
}

function atmos(g, t, p, M) {
  const fx = p.fx || ['dust'];
  if (fx.includes('dust')) FX.dust(g, t, { count: 40, color: M.practical, a: 0.3 });
  if (fx.includes('rain')) FX.rain(g, t, { a: 0.25 });
  if (fx.includes('snow')) FX.snow(g, t, {});
  if (fx.includes('streak')) FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 1.2, M.practical, 0.15);
  if (fx.includes('speed')) FX.speedLines(g, t, { a: 0.25 });
  if (fx.includes('hearts')) for (let i = 0; i < 6; i++) { const x = E.W * (0.3 + i * 0.08), y = E.H * 0.5 - ((t * 60 + i * 50) % 300); glow(g, x, y, 30, '#ff8aa0', 0.5); }
}

// видеозвонок: сетка участников, у Артёма — пустая плитка без камеры
function callScreen(g, t, info, p) {
  backdrop(g, ['#10141e', '#161c2a']); const u = t / info.dur;
  const tiles = p.tiles || ['A', 'BOSS', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'];
  const names = p.names || ['Артём', 'Начальник', 'Коллега', 'Коллега', 'Коллега', 'Коллега'];
  const W = 560, H = 330, gx = 40, gy = 40, x0 = (E.W - (W * 3 + gx * 2)) / 2, y0 = 150;
  const z = 1 + 0.04 * u; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  tiles.forEach((c, i) => { const x = x0 + (i % 3) * (W + gx), y = y0 + Math.floor(i / 3) * (H + gy); const spk = p.speaker === i;
    rr(g, x, y, W, H, 18); g.fillStyle = '#222a3a'; g.fill(); if (spk) { g.strokeStyle = '#5fd39a'; g.lineWidth = 6; g.stroke(); }
    g.save(); g.beginPath(); rr(g, x, y, W, H, 18); g.clip();
    if (c === 'A') { fitText(g, 'Камера выключена', x + W / 2, y + H / 2 - 20, W - 80, 40, { color: '#6f84a6', weight: 800 }); }
    else { glow(g, x + W / 2, y + H * 0.4, 260, '#ffd59a', 0.15); bigFace(g, x + W / 2, y + H * 0.62, 110, { outfit: CAST[c] || CAST.PLAIN, expr: spk ? (p.spkE || 'neutral') : 'neutral', talk: spk ? talkAmount(info.globalT) : 0, rimColor: '#ffc68a', blink: (t + i) % 3.3 > 3.2 }); }
    g.restore();
    rr(g, x + 14, y + H - 50, Math.min(W - 28, measure(g, names[i], 26, FONTS.ui, 900) + 30), 38, 10); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
    text(g, names[i], x + 29, y + H - 31, { size: 26, font: FONTS.ui, weight: 900, color: '#ffffff', align: 'left', maxW: W - 58 });
    if (c === 'A') { circle(g, x + W - 40, y + 40, 18, p.micOn ? '#5fd39a' : '#e0403a'); } });
  g.restore();
}

// --- регистрация всех кадров ---
for (const sh of E.shots) { const p = sh.params || {}; const f = TPL[p.tpl || 'scene']; if (f) registerShot(sh.id, f(p)); }
