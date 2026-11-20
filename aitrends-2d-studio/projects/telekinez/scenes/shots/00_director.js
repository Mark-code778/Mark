// shots/00_director.js — «режиссёр»: рисует каждый кадр по описанию из story/shots.json (params.tpl).
// Шаблоны: st (сцена: локация + герои + предметы), face (гигантское лицо), line (крупная строка), bp (схема), title, q, sub, endcard.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, measure, FONTS, rng, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos, face as drawFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, GROUND } from '../sets/sets.js';
import { WHO, CAST, POWER } from '../cast.js';
import { OBJ, power, powerWave, fitText } from '../lib/objs.js';
import { BP } from '../lib/bp.js';

// ---------- свои позы ----------
const Q = (o) => o;
export const P = {
  plankUp: Q({ head: [108, -84], sh: [76, -72], hip: [0, -48], eF: [78, -36], hF: [80, 0], eB: [72, -36], hB: [72, 0], kF: [-50, -30], fF: [-100, -6], kB: [-52, -29], fB: [-104, -6] }),
  plankDown: Q({ head: [108, -50], sh: [76, -40], hip: [0, -30], eF: [50, -22], hF: [80, 0], eB: [46, -22], hB: [72, 0], kF: [-50, -18], fF: [-100, -6], kB: [-52, -18], fB: [-104, -6] }),
  sitFloor: Q({ head: [8, -124], sh: [4, -90], hip: [0, -16], eF: [22, -56], hF: [46, -34], eB: [14, -56], hB: [38, -34], kF: [46, -30], fF: [94, -6], kB: [42, -28], fB: [90, -6] }),
  pocket: Q({ head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [18, -134], hF: [6, -104], eB: [-16, -134], hB: [-6, -104], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] }),
  reachUp: Q({ head: [8, -206], sh: [3, -172], hip: [0, -100], eF: [30, -200], hF: [58, -232], eB: [22, -196], hB: [50, -226], kF: [12, -50], fF: [14, 0], kB: [-8, -50], fB: [-18, 0] }),
  strain: Q({ head: [14, -196], sh: [8, -164], hip: [-2, -94], eF: [40, -166], hF: [78, -176], eB: [34, -162], hB: [72, -170], kF: [22, -48], fF: [18, 0], kB: [-18, -46], fB: [-28, 0] }),
  kneelReach: Q({ head: [12, -168], sh: [6, -134], hip: [0, -62], eF: [34, -152], hF: [66, -176], eB: [24, -148], hB: [58, -170], kF: [36, -46], fF: [36, 0], kB: [-6, -4], fB: [-48, 0] }),
  dig1: Q({ head: [28, -194], sh: [18, -162], hip: [0, -100], eF: [34, -134], hF: [48, -118], eB: [22, -130], hB: [40, -92], kF: [12, -50], fF: [14, 0], kB: [-6, -50], fB: [-12, 0] }),
  dig2: Q({ head: [12, -206], sh: [6, -172], hip: [0, -100], eF: [26, -150], hF: [42, -146], eB: [18, -144], hB: [34, -116], kF: [8, -50], fF: [8, 0], kB: [-6, -50], fB: [-12, 0] }),
  knees: Q({ head: [32, -168], sh: [22, -138], hip: [0, -96], eF: [34, -110], hF: [30, -64], eB: [26, -110], hB: [22, -62], kF: [16, -50], fF: [10, 0], kB: [-4, -50], fB: [-12, 0] }),
  pull: Q({ head: [-22, -194], sh: [-16, -162], hip: [0, -96], eF: [20, -128], hF: [50, -110], eB: [14, -126], hB: [44, -104], kF: [12, -50], fF: [18, 0], kB: [-14, -48], fB: [-28, 0] }),
  carry: Q({ head: [6, -208], sh: [2, -174], hip: [0, -100], eF: [24, -150], hF: [44, -160], eB: [18, -148], hB: [38, -156], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  armUp: Q({ head: [6, -208], sh: [2, -174], hip: [0, -100], eF: [24, -196], hF: [44, -222], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  stretch: Q({ head: [-14, -204], sh: [-8, -172], hip: [0, -100], eF: [-24, -150], hF: [-6, -112], eB: [-30, -148], hB: [-10, -108], kF: [8, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] }),
  bagHeavy: Q({ head: [-6, -200], sh: [-6, -168], hip: [0, -98], eF: [14, -134], hF: [22, -96], eB: [-12, -132], hB: [-14, -98], kF: [8, -50], fF: [10, 0], kB: [-8, -50], fB: [-14, 0] }),
  fly: Q({ head: [4, -212], sh: [0, -176], hip: [0, -100], eF: [14, -214], hF: [20, -250], eB: [-8, -212], hB: [-6, -248], kF: [6, -50], fF: [8, -2], kB: [-6, -54], fB: [-14, -10] }),
};
const pose = (p) => (typeof p === 'string' ? P[p] || POSES[p] || POSES.stand : p);
const poseKeys = (p) => (Array.isArray(p) ? p.map(([tt, q]) => [tt, pose(q)]) : [[0, pose(p || 'stand')]]);
const at = (v, t, def) => { if (v == null) return def; if (!Array.isArray(v) || !Array.isArray(v[0])) return v; let cur = v[0][1]; for (const [tt, x] of v) if (t >= tt) cur = x; return cur; };
const ex = (e, t) => at(e, t, 'neutral');

// ---------- камера ----------
function camAt(c = {}, t, dur) {
  const k = ease.inOut(t / dur);
  const pick = (v, d) => (Array.isArray(v) ? lerp(v[0], v[1], k) : v ?? d);
  const cam = { z: pick(c.z, 1 + 0.06 * k), x: pick(c.x, -24 * k), y: pick(c.y, 0), r: pick(c.r, 0) };
  if (c.sh) { const amp = typeof c.sh === 'number' ? c.sh : at(c.sh, t, 0); const [sx, sy] = shake(t, amp, 14, 5); cam.x += sx; cam.y += sy; }
  return cam;
}

// ---------- фигуры ----------
function figState(f, t, info) {
  const s = info.s ?? 1, CX = E.W / 2, GY = GROUND();
  let x = CX + (f.x || 0), y = GY - (f.y || 0), p = posesAt(t, poseKeys(f.p)), moving = false, facing = at(f.f, t, 1);
  if (f.walk) { const w = f.walk, k = prog(t, w.at || 0, (w.at || 0) + (w.dur || 2)); x = CX + lerp(f.x || 0, w.to, w.ease === false ? k : ease.inOut(k)); if (k > 0 && k < 1) { moving = true; const ph = t * Math.PI * 2 * (w.run ? 1.6 : 0.9); p = walkPose(ph, { run: !!w.run }); } }
  if (f.pushup) { const u = f.pushup; if (t >= (u.at || 0) && t <= (u.until ?? 1e9)) { const ph = 0.5 - 0.5 * Math.cos((t - (u.at || 0)) * Math.PI * 2 * (u.rate || 1)); p = posesAt(0, [[0, P.plankUp]]); p = Object.fromEntries(Object.keys(P.plankUp).map((k2) => [k2, [lerp(P.plankUp[k2][0], P.plankDown[k2][0], ph), lerp(P.plankUp[k2][1], P.plankDown[k2][1], ph)]])); } }
  if (f.bob) y += Math.sin(t * (f.bob.rate || 4) * Math.PI) * (f.bob.amp || 10) * s;
  let fl = 0; if (f.fl) { const q = f.fl; fl = ease.inOut(prog(t, q.at || 0, (q.at || 0) + (q.dur || 0.8))) * (q.until != null ? 1 - ease.inOut(prog(t, q.until, q.until + (q.down || 0.6))) : 1); y -= fl * (q.h ?? 60) * s + (q.bob !== false ? Math.sin(t * 2.2) * 6 * s * fl : 0); }
  if (f.jit) { const a = at(f.jit, t, 0); const [jx, jy] = shake(t, a, 22, 7); x += jx; y += jy; }
  let rot = f.rot || 0; if (f.lie) { rot = f.lie * Math.PI / 2; y += (100 - 14) * s; }
  if (f.dx) x += Array.isArray(f.dx) ? key(t, f.dx) : f.dx;
  if (!moving && !f.pushup && !f.lie && f.breathe !== false) p = breathe(p, t, 1, (f.w || 'A').charCodeAt(0));
  return { x, y, s, facing, pose: p, rot, fl };
}
function drawFig(g, f, t, info, M) {
  const st = figState(f, t, info), of = WHO[f.w] || WHO.X;
  const talk = f.talk ? (f.talk === true ? talkAmount(info.globalT) : talkAmount(info.globalT, info.shot.start + f.talk[0], info.shot.start + f.talk[1])) : 0;
  if (st.fl > 0.02 && f.fl?.glow !== false) power(g, st.x, st.y - 120 * st.s, 120 * st.s, t, st.fl, 3);
  const o = { x: st.x, y: st.y, s: st.s, facing: st.facing, pose: st.pose, rot: st.rot, outfit: of, expr: ex(f.e, t), talk, look: at(f.look, t, undefined), blink: (t + (f.w || 'A').charCodeAt(0) * 0.37) % 3.3 > 3.18, rim: { color: f.rimC || M.rim, dir: info.rimDir || [0, -1], w: 4 }, alpha: f.alpha, prop: f.prop, shadow: f.shadow ?? (st.fl < 0.2), trail: f.trail, dim: f.dim };
  drawFigure(g, o);
  const [hx, hy, hr] = headPos(o);
  if (of.moustache) OBJ.moustache(g, hx + st.facing * hr * 0.34, hy + hr * 0.22, hr);
  if (f.blood) OBJ.blood(g, hx + st.facing * hr * 0.45, hy + hr * 0.1, st.s * 0.5, { k: prog(t, f.blood, f.blood + 1) });
  if (f.yolk) { OBJ.splat(g, hx - hr * 0.3, hy - hr * 0.6, st.s * 0.3, { seed: 2 }); OBJ.splat(g, st.x + 6 * st.s, st.y - 150 * st.s, st.s * 0.35, { seed: 5 }); }
  if (f.eyes) { const a = at(f.eyes, t, 0); if (a) { glow(g, hx + st.facing * hr * 0.4, hy - hr * 0.1, hr * 1.4, POWER, 0.6 * a); } }
  if (f.say) { const sy = f.say; if (t >= (sy.at || 0) && t <= (sy.until ?? 1e9)) OBJ.bubble(g, hx + (sy.dx ?? 140) * st.s, hy - (sy.dy ?? 90) * st.s, st.s * (sy.s || 1), { label: sy.str, w: sy.w || 220, h: sy.h || 90, tail: sy.tail ?? 1 }); }
  if (f.rings) FX.rings(g, hx, hy, t, { count: 3, r0: hr * 1.3, r1: hr * 3, color: f.rings === true ? '#fff1e6' : f.rings, a: 0.4 });
  return { ...st, hx, hy, hr, o };
}

// ---------- предметы ----------
function objPos(ob, t, figs, info = {}) {
  const CX = E.W / 2, GY = GROUND();
  let x = ob.x || 0, y = ob.y || 0;
  if (ob.orbit != null) { const j = info.juggle || { cx: ob.x || 0, cy: ob.y || 0, r: 46 }, a = t * 3.2 + ob.orbit * 2.094, wob = j.wobble ? Math.sin(t * 7 + ob.orbit) * 18 * j.wobble : 0; x = j.cx + Math.cos(a) * j.r + wob; y = j.cy + Math.sin(a) * j.r * 0.8 + wob; }
  if (ob.path) { const v = key(t, ob.path, ob.ease === 'linear' ? ease.linear : ob.ease === 'out' ? ease.out : ob.ease === 'in' ? ease.in : ease.inOut); x = v[0]; y = v[1]; }
  let X = CX + x, Y = GY - y;
  if (ob.attach != null && figs[ob.attach]) { const fs = figs[ob.attach], h = fs.pose[ob.hand === 'B' ? 'hB' : 'hF']; X = fs.x + h[0] * fs.facing * fs.s + (ob.ax || 0); Y = fs.y + h[1] * fs.s + (ob.ay || 0); }
  if (ob.sh) { const a = at(ob.sh, t, 0); const [sx, sy] = shake(t, a, 20, 11); X += sx; Y += sy; }
  if (ob.bob) Y += Math.sin(t * 2.4 + x * 0.01) * ob.bob;
  return [X, Y];
}
function drawObj(g, ob, t, info, figs) {
  if (ob.when && (t < ob.when[0] || t > ob.when[1])) return;
  const [X, Y] = objPos(ob, t, figs, info), s = (ob.s ?? 1) * (ob.abs ? 1 : info.s ?? 1);
  g.save(); if (ob.alpha != null) g.globalAlpha *= ob.alpha;
  const rot = (ob.rot || 0) + (ob.spin ? ob.spin * t : 0) + (ob.rotKey ? key(t, ob.rotKey) : 0);
  const pwA = ob.pw ? (ob.pw === true ? 1 : clamp(prog(t, ob.pw[0], ob.pw[0] + 0.3) * (ob.pw[1] != null ? 1 - prog(t, ob.pw[1], ob.pw[1] + 0.3) : 1))) : 0;
  if (pwA > 0.01) power(g, X, Y - (ob.ph || 40) * s, (ob.pr || 60) * s, t, pwA, 7);
  const fn = OBJ[ob.o]; if (!fn) { g.restore(); return; }
  const extra = {}; for (const k2 of ['open', 'level', 'k', 'a', 'mv', 'bend', 'fist', 'circle', 'drip', 'h', 'tilt']) if (Array.isArray(ob[k2]) && Array.isArray(ob[k2][0])) extra[k2] = key(t, ob[k2]);
  fn(g, X, Y, s, { ...ob, ...extra, rot, t });
  g.restore();
}

// ---------- наложения (экранные и сценические) ----------
function overlays(g, t, info, cam, M) {
  const ui = S().ui, CX = E.W / 2, GY = GROUND();
  if (info.dim) layer(g, cam, 1, (g) => { for (const d of [].concat(info.dim)) UI.dimension(g, t, { x1: CX + d.x1, y1: GY - d.y1, x2: CX + d.x2, y2: GY - d.y2, str: d.str, start: d.at || 0 }); });
  if (info.call) layer(g, cam, 1, (g) => { for (const c of [].concat(info.call)) { const p = ease.out(prog(t, c.at || 0, (c.at || 0) + 0.5)); if (p <= 0) continue; const ax = CX + c.p[0], ay = GY - c.p[1], tx = CX + c.to[0], ty = GY - c.to[1]; circle(g, ax, ay, 7, ui.cream); seg(g, [[ax, ay], [lerp(ax, tx, p), lerp(ay, ty, p)]], 3, alpha(ui.cream, 0.85)); const w = Math.min(c.w || 360, 900), h = 64, bx = clamp(tx, w / 2 + 40, E.W - w / 2 - 40); rr(g, bx - w / 2, ty - h / 2, w, h, 14); g.fillStyle = alpha('#120e18', 0.78 * p); g.fill(); fitText(g, c.str, bx, ty, w - 24, h - 10, { color: c.color || ui.gold, alpha: p }); } });
  if (info.badge) { const b = info.badge; const a = ease.out(prog(t, b.at || 0, (b.at || 0) + 0.4)) * clamp((info.dur - t) / 0.3); const str = Array.isArray(b.str) ? at(b.str, t, '') : b.str; if (a > 0) UI.badge(g, { str, a, color: b.color || ui.gold }); }
  if (info.timer) { const m = info.timer, k = prog(t, m.t0 ?? 0, m.t1 ?? info.dur), v = lerp(m.from, m.to, m.ease === false ? k : ease.inOut(k)); const a = ease.out(prog(t, m.t0 ?? 0, (m.t0 ?? 0) + 0.3)); UI.readout(g, { label: m.label || null, value: (m.dec ? v.toFixed(m.dec) : Math.round(v).toLocaleString('ru-RU')) + (m.suf || ''), x: m.x ?? V(140, 90), y: m.y ?? E.H - V(190, 620), a, color: m.color || ui.gold, size: m.size || V(56, 60) }); }
  if (info.read) { for (const r of [].concat(info.read)) { const a = ease.out(prog(t, r.at || 0, (r.at || 0) + 0.35)) * clamp((info.dur - t) / 0.3); if (a > 0) UI.readout(g, { label: r.label || null, value: r.value, x: r.x ?? V(140, 90), y: r.y ?? E.H - V(190, 620), a, color: r.color || ui.gold, size: r.size || V(56, 60), align: r.align || 'left' }); } }
  if (info.big) { for (const b of [].concat(info.big)) { if (t < (b.at || 0) || t > (b.until ?? info.dur)) continue; UI.bigLine(g, t - (b.at || 0), { str: b.str, dur: (b.until ?? info.dur) - (b.at || 0), y: b.y ?? E.H * (b.top ? 0.2 : 0.5), size: b.size || V(84, 76), color: b.color === 'red' ? ui.accent : b.color === 'cream' ? ui.cream : b.color || ui.gold }); } }
  if (info.spots) { const R = rng(5); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const x = R() * E.W + Math.sin(t * 0.7 + i) * 60, y = R() * E.H + Math.cos(t * 0.5 + i) * 40; glow(g, x, y, 60 + R() * 120, ['#ff6ac8', '#5ff2e8', '#ffd47e', '#9a7cff'][i % 4], 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + i))); } g.restore(); }
  if (info.tint) tint(g, info.tint, t);
  if (info.freeze) { FX.drops(g, t, { count: 40, color: '#d8e4ff', rMax: 9, drift: 3 }); g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(120,90,255,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
}
function tint(g, k, t) {
  g.save();
  if (k === 'memory') { g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,190,120,.55)'; g.fillRect(0, 0, E.W, E.H); g.globalCompositeOperation = 'source-over'; veil(g, '#2a1a10', 0.18); g.fillStyle = 'rgba(255,240,220,.06)'; g.fillRect(0, 0, E.W, E.H); }
  if (k === 'cold') { g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.5)'; g.fillRect(0, 0, E.W, E.H); }
  if (k === 'red') { g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,40,40,.55)'; g.fillRect(0, 0, E.W, E.H); }
  if (k === 'dream') { g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(120,160,255,.45)'; g.fillRect(0, 0, E.W, E.H); g.globalCompositeOperation = 'source-over'; veil(g, '#0a0a20', 0.2); }
  if (k === 'dark') { veil(g, '#05030a', 0.35); }
  g.restore();
}

// ---------- шаблоны ----------
const TPL = {};
TPL.st = (g, t, info) => {
  const cam = camAt(info.cam, t, info.dur), setFn = SETS[info.set || 'void'];
  const so = { ...(info.so || {}) }; for (const k2 in so) if (Array.isArray(so[k2]) && Array.isArray(so[k2][0])) so[k2] = key(t, so[k2]);
  let res;
  if (info.blur) { blurLayer(g, info.blur, (g) => { res = setFn(g, t, info.bcam || { z: 1.5, x: info.bx || 0, y: info.by || -120 }, so); }); veil(g, '#120a10', info.veil ?? 0.3); }
  else res = setFn(g, t, cam, so);
  const M = res?.M || mood('dusk');
  const figs = []; const objs = info.objs || [], figDefs = info.figs || [];
  layer(g, cam, 1, (g) => {
    const states = figDefs.map((f) => figState(f, t, info));
    objs.filter((o) => o.back).forEach((o) => drawObj(g, o, t, info, states));
    figDefs.forEach((f, i) => { figs[i] = drawFig(g, f, t, info, M); });
    objs.filter((o) => !o.back && !o.front).forEach((o) => drawObj(g, o, t, info, figs));
    if (info.pw) for (const w of [].concat(info.pw)) { const a = clamp(prog(t, w.at || 0, (w.at || 0) + 0.3) * (w.until != null ? 1 - prog(t, w.until, w.until + 0.3) : 1)); const fr = figs[w.from || 0]; if (!fr || a <= 0) continue; let tx, ty; if (w.obj != null) { [tx, ty] = objPos(objs[w.obj], t, figs, info); ty -= (objs[w.obj].ph || 30) * (info.s ?? 1); } else { tx = E.W / 2 + w.to[0]; ty = GROUND() - w.to[1]; } powerWave(g, fr.hx, fr.hy, tx, ty, t, a); glow(g, fr.hx + fr.facing * fr.hr * 0.4, fr.hy - fr.hr * 0.1, fr.hr * 1.2, POWER, 0.5 * a); }
    if (info.thread) { const th = info.thread, k = ease.inOut(prog(t, th.at || 0, (th.at || 0) + (th.dur || 2))); OBJ.thread(g, E.W / 2 + th.x1, GROUND() - th.y1, E.W / 2 + th.x2, GROUND() - th.y2, k, 1.4); }
    if (info.stream) { const st2 = info.stream, x1 = E.W / 2 + st2.x1, y1 = GROUND() - st2.y1, x2 = E.W / 2 + st2.x2, y2 = GROUND() - st2.y2; g.strokeStyle = 'rgba(140,200,255,.75)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 120, x2, y2); g.stroke(); power(g, (x1 + x2) / 2, Math.min(y1, y2) - 60, 80, t, 0.6, 4); }
    if (info.ghost) { const gh = info.ghost, fr = figs[gh.from || 0]; const a = clamp(prog(t, gh.at || 0, (gh.at || 0) + 0.4)); const tg = key(t, gh.path); OBJ.ghostArm(g, fr.hx, fr.hy, E.W / 2 + tg[0], GROUND() - tg[1], t, { a: a * (gh.a ?? 1), wob: gh.wob || 0, baby: gh.baby }); }
  });
  if (info.fg) blurLayer(g, 10, (g) => objs.filter((o) => o.front).forEach((o) => drawObj(g, o, t, info, figs)), cam, 1.6);
  else layer(g, cam, 1, (g) => objs.filter((o) => o.front).forEach((o) => drawObj(g, o, t, info, figs)));
  if (info.fx === 'rain') FX.rain(g, t, { count: 180 });
  overlays(g, t, info, cam, M);
};
TPL.face = (g, t, info) => {
  const setFn = SETS[info.set || 'void'];
  const so = { ...(info.so || {}) };
  let res; blurLayer(g, info.blur ?? 14, (g) => { res = setFn(g, t, info.bcam || { z: 1.6, x: info.bx || 0, y: info.by || -160 }, so); }); veil(g, '#120a10', info.veil ?? 0.35);
  const M = res?.M || mood('dusk'), of = WHO[info.w] || WHO.A;
  const r = (info.r || V(300, 330)) * (1 + (info.zoom ?? 0.04) * ease.inOut(t / info.dur));
  let cx = E.W / 2 + (info.fx || 0), cy = E.H * V(0.6, 0.55) + (info.fy || 0);
  if (info.sh) { const [sx, sy] = shake(t, at(info.sh, t, 0), 18, 3); cx += sx; cy += sy; }
  const talk = info.talk ? (info.talk === true ? talkAmount(info.globalT) : talkAmount(info.globalT, info.shot.start + info.talk[0], info.shot.start + info.talk[1])) : 0;
  const tilt = info.nod ? Math.sin(prog(t, info.nod[0], info.nod[1]) * Math.PI * 2) * 0.08 : at(info.tilt, t, 0);
  const cyN = info.nod ? cy + Math.sin(prog(t, info.nod[0], info.nod[1]) * Math.PI * 2) * 22 : cy;
  if (info.eyes) { const a = at(info.eyes, t, 0); if (a) glow(g, cx, cyN - r * 0.1, r * 1.8, POWER, 0.35 * a); }
  bigFace(g, cx, cyN, r, { outfit: of, expr: ex(info.e, t), talk, blink: (t % 3.2) > 3.08 && !info.noBlink, look: at(info.look, t, [0, 0]), rimColor: info.rimC || M.rim, rimSide: info.side ?? -1, tilt });
  if (of.moustache) OBJ.moustache(g, cx, cyN + r * 0.2, r * 0.8);
  if (info.blood != null) { const k = prog(t, info.blood, info.blood + 1.2); if (k > 0) { seg(g, [[cx + r * 0.2, cyN + r * 0.12], [cx + r * 0.22, cyN + r * (0.12 + 0.34 * k)]], r * 0.035, '#c0262a'); circle(g, cx + r * 0.22, cyN + r * (0.12 + 0.34 * k), r * 0.03, '#c0262a'); } }
  if (info.eyesGlow) { const a = at(info.eyesGlow, t, 0); if (a) for (const dx of [-0.34, 0.34]) glow(g, cx + dx * r, cyN - r * 0.16, r * 0.35, POWER, 0.8 * a); }
  if (info.sweat) { g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(cx - r * 0.75, cyN - r * 0.5 + (t * 40) % 60, r * 0.06, r * 0.1, 0, 0, 7); g.fill(); }
  if (info.ringsOn) FX.rings(g, cx, cyN, t, { count: 3, r0: r * 1.1, r1: r * 1.7, color: info.ringsOn === true ? '#fff3e0' : info.ringsOn, a: 0.35 });
  if (talk > 0 && !info.noRings) FX.rings(g, cx, cyN, t, { count: 3, r0: r * 1.1, r1: r * 1.6, color: '#fff3e0', a: 0.3 });
  const figs = [];
  for (const ob of info.objs || []) drawObj(g, { ...ob, abs: true, x: ob.x, y: ob.y }, t, info, figs);
  FX.dust(g, t, { count: 18, a: 0.25 });
  overlays(g, t, info, { z: 1 }, M);
};
TPL.line = (g, t, info) => {
  const setFn = SETS[info.set || 'void'];
  blurLayer(g, info.blur ?? 12, (g) => setFn(g, t, { z: 1.3 + 0.05 * t, x: info.bx || 0, y: info.by || -100 }, info.so || {})); veil(g, '#0c0810', info.veil ?? 0.45);
  const ui = S().ui;
  const lines = [].concat(info.str);
  const gap = V(110, 120), y0 = E.H / 2 - ((lines.length - 1) * gap) / 2;
  lines.forEach((s, i) => { const a0 = (info.at || [])[i] ?? 0; if (t < a0) return; UI.bigLine(g, t - a0, { str: s, dur: info.dur - a0, y: y0 + i * gap, size: info.size || V(84, 76), color: (info.colors || [])[i] === 'red' ? ui.accent : (info.colors || [])[i] === 'cream' ? ui.cream : ui.gold }); });
  overlays(g, t, info, { z: 1 }, mood('dusk'));
};
TPL.bp = (g, t, info) => { UI.blueprint(g, {}); const fn = BP[info.bp]; if (fn) fn(g, t, info); overlays(g, t, info, { z: 1 }, mood('void')); };
TPL.title = (g, t, info) => {
  const cam = { z: 1.02 + 0.05 * t / info.dur, x: -20 * t / info.dur };
  SETS.yard(g, t, cam, { mood: 'dusk' }); veil(g, '#0c0810', 0.45);
  power(g, E.W / 2, E.H * 0.5, 420, t, 0.6, 11);
  UI.titleCard(g, t, { lines: ['ЧТО ЕСЛИ', 'У ТЕБЯ ТЕЛЕКИНЕЗ?'], dur: info.dur });
};
TPL.q = (g, t, info) => {
  const ui = S().ui;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1b1426', '#2a1a2e', '#4a2a2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.9, E.W * 0.45, '#ff9a5a', 0.3);
  power(g, E.W / 2, E.H * 0.82, 260, t, 0.5, 4);
  const a = ease.out(prog(t, 0.15, 0.7));
  const lines = [].concat(info.str);
  const boxW = E.W * 0.84, lh = V(84, 90), y0 = E.H * 0.38 - ((lines.length - 1) * lh) / 2;
  lines.forEach((s, i) => fitText(g, s, E.W / 2, y0 + i * lh, boxW, lh, { font: FONTS.serif, weight: 900, color: ui.cream, alpha: a, size: V(64, 66) }));
  if (info.bubble) { const k = ease.outBack(prog(t, info.bubble, info.bubble + 0.5)); g.save(); g.translate(E.W / 2, E.H * 0.68); g.scale(k, k); OBJ.bubble(g, 0, 0, 1.6, { label: '', w: 220, h: 100 }); for (let i = -1; i <= 1; i++) circle(g, i * 60, 0, 12, S().ink); g.restore(); }
  const n = CAST.length, gap = V(170, 120);
  CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: E.H - V(40, 300) + (1 - k) * 40, s: V(0.75, 0.95), facing: 1, outfit: of, pose: breathe(POSES.relaxed, t, 1, i), expr: 'smile', alpha: k * 0.9, rim: { color: '#ffb070', dir: [0, -1] } }); if (of.moustache) { const [hx, hy, hr] = headPos({ x: E.W / 2 + (i - (n - 1) / 2) * gap, y: E.H - V(40, 300), s: V(0.75, 0.95), pose: POSES.relaxed }); OBJ.moustache(g, hx + hr * 0.34, hy + hr * 0.22, hr); } });
};
TPL.sub = (g, t, info) => {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1b1426', '#2a1a2e', '#4a2a2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.9, E.W * 0.45, '#ff9a5a', 0.3);
  const press = info.press != null ? ease.out(prog(t, info.press, info.press + 0.15)) * (1 - ease.out(prog(t, info.press + 0.3, info.press + 0.6))) : 0;
  const sp = ease.outBack(prog(t, 0.1, 0.6)) * (1 - 0.06 * press);
  const pw = 520, ph = 120, px = E.W / 2 - 110, py = E.H * 0.42;
  g.save(); g.translate(px, py); g.scale(sp, sp); rr(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fillStyle = '#e0302a'; g.fill();
  fitText(g, 'ПОДПИСАТЬСЯ', 0, 2, pw - 70, ph - 34, { color: '#fff' }); g.restore();
  // колокольчик
  const bk = ease.outBack(prog(t, 0.5, 0.9)), bx = E.W / 2 + 260, by = E.H * 0.42, sw = Math.sin(t * 9) * 0.25 * (info.ring ? 1 : 0);
  g.save(); g.translate(bx, by); g.rotate(sw); g.scale(bk, bk); g.fillStyle = '#ffd47e'; g.beginPath(); g.moveTo(-46, 30); g.quadraticCurveTo(-46, -50, 0, -54); g.quadraticCurveTo(46, -50, 46, 30); g.closePath(); g.fill(); g.fillRect(-56, 26, 112, 12); circle(g, 0, 50, 12, '#ffd47e'); g.restore();
  if (info.hero) { const s = V(1.5, 1.6); drawFigure(g, { x: E.W / 2 - 600, y: E.H - 40, s, facing: 1, outfit: WHO.A, pose: info.press != null ? posesAt(t, [[0, 'stand'], [Math.max(0, info.press - 0.4), 'point']]) : posesAt(t, [[0, 'stand'], [0.4, 'point'], [info.dur - 0.9, 'shrug']]), expr: info.press != null ? 'smile' : at([[0, 'determined'], [info.dur - 0.9, 'smirk']], t), rim: { color: '#ffb070', dir: [0, -1] } }); if (info.press == null) powerWave(g, E.W / 2 - 520, E.H - 40 - 200 * s, px - pw / 2, py, t, 0.7); }
  if (info.finger) { const k = ease.inOut(prog(t, 0, info.press ?? 0.6)); OBJ.hand(g, lerp(E.W + 200, px + pw / 2 - 10, k), lerp(E.H + 100, py + ph / 2 + 40, k), 0.7, { sleeve: WHO.A.color, fist: 0.6, dir: 1 }); }
};
TPL.endcard = (g, t, info) => {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#120c1e', '#2a1a2e', '#4a2a2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.95, E.W * 0.5, '#ff9a5a', 0.35); power(g, E.W / 2, E.H * 0.3, 380, t, 0.45, 8);
  UI.titleCard(g, t, { lines: ['ДО ВСТРЕЧИ В НОВОМ ВЫПУСКЕ', 'ЧТО ЕСЛИ…'], dur: info.dur + 10, y: E.H * 0.32 });
  const n = CAST.length, gap = V(170, 120);
  CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.1, 0.8 + i * 0.1)); const x = E.W / 2 + (i - (n - 1) / 2) * gap, y = E.H - V(60, 300); const ps = posesAt(t, [[0, 'relaxed'], [0.9 + i * 0.1, 'wave']]); drawFigure(g, { x, y: y + (1 - k) * 40, s: V(0.95, 1.0), facing: 1, outfit: of, pose: breathe(ps, t, 1, i), expr: 'happy', alpha: k, rim: { color: '#ffb070', dir: [0, -1] } }); if (of.moustache) { const [hx, hy, hr] = headPos({ x, y: y + (1 - k) * 40, s: V(0.95, 1.0), pose: ps }); OBJ.moustache(g, hx + hr * 0.34, hy + hr * 0.22, hr); } });
};

// ---------- регистрация всех кадров с params.tpl ----------
for (const sh of E.shots) {
  const tpl = sh.params?.tpl; if (!tpl || !TPL[tpl]) continue;
  registerShot(sh.id, { draw(g, t, info) { TPL[tpl](g, t, info); } });
}
