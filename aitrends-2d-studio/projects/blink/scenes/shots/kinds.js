// shots/kinds.js — every shot in story/shots.json is drawn by a reusable template chosen by params.k.
// The storyboard (story/build.mjs) only fills in data: set, actors, poses, expressions, camera, inserts, text.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, radGrad, text, measure, rng, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos, face } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, car, priceStand, calendar, cafeTable, cupProp, chairSide, bench } from '../sets/world.js';
import { CAST } from '../cast.js';

const ui = () => E.style.ui;
// ---------- small helpers ----------
const step = (v, t) => { if (!Array.isArray(v)) return v; let cur = v[0][1]; for (const [tt, val] of v) if (t >= tt) cur = val; return cur; };
const poseOf = (p) => (typeof p === 'string' ? POSES[p] || POSES.stand : p);
function poseAt(a, t) { if (!a.pose) return POSES.stand; if (!Array.isArray(a.pose)) return poseOf(a.pose); return posesAt(t, a.pose.map(([tt, p]) => [tt, poseOf(p)]), 0.3); }
export function camAt(c = {}, t, dur) {
  const k = (c.ease === 'out' ? ease.out : ease.inOut)(clamp(t / dur));
  const v = (x, d) => (Array.isArray(x) ? lerp(x[0], x[1], k) : x ?? d);
  const cam = { z: v(c.z, null) ?? 1 + 0.06 * k, x: v(c.x, 0), y: v(c.y, 0), r: v(c.r, 0) };
  if (c.shake) { const [sx, sy] = shake(t, c.shake, 2.2); cam.x += sx; cam.y += sy; }
  return cam;
}
function drawSet(g, name, t, cam, o) { return (SETS[name] || SETS.studio)(g, t, cam, o || {}); }
// eyelids closing: k = 0 open … 1 shut
export function lids(g, k) {
  if (k <= 0) return; const h = E.H / 2 * ease.inOut(k) + 2;
  g.save(); g.fillStyle = '#05040a';
  g.beginPath(); g.moveTo(-50, -50); g.lineTo(E.W + 50, -50); g.lineTo(E.W + 50, h - 40); g.quadraticCurveTo(E.W / 2, h + 70, -50, h - 40); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-50, E.H + 50); g.lineTo(E.W + 50, E.H + 50); g.lineTo(E.W + 50, E.H - h + 40); g.quadraticCurveTo(E.W / 2, E.H - h - 70, -50, E.H - h + 40); g.closePath(); g.fill();
  g.restore();
}
function blinkOverlay(g, t, info) {
  if (info.blinkIn) lids(g, 1 - prog(t, 0.05, info.blinkIn));
  if (info.blinkOut) lids(g, prog(t, info.dur - info.blinkOut, info.dur - 0.02));
}
// overlays: on-screen text and badges, timed in shot-local seconds
function overlays(g, t, info) {
  const bar = info.shot?.bars === 'scope' ? 138 : info.shot?.bars === 'none' ? 0 : 60;
  for (const o0 of info.ov || []) {
    const o = { ...o0 }; if (o.y != null && o.k !== 'age') o.y = clamp(o.y, bar + 70, E.H - bar - 60);
    const at = o.at ?? 0.2, end = o.end ?? info.dur, a = clamp(Math.min((t - at) / 0.3, (end - t) / 0.3)); if (a <= 0) continue;
    if (o.k === 'age') {           // corner age badge: "ТЕБЕ 23"
      const pop = ease.outBack(prog(t, at, at + 0.4)), x = V(110, 80), y = V(o.y ?? 120, 220);
      g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(pop, pop);
      text(g, o.label ?? 'ТЕБЕ', 0, -30, { size: 26, font: FONTS.ui, weight: 900, color: alpha(ui().cream, 0.75), align: 'left', spacing: 4 });
      text(g, String(o.v), -4, 22, { size: 84, font: FONTS.ui, weight: 900, color: ui().gold, align: 'left', glow: 22, glowColor: alpha(ui().gold, 0.6) });
      g.restore();
    } else if (o.k === 'line') {   // big glowing word(s)
      const s = 1 + 0.03 * (t - at); g.save(); g.globalAlpha *= a; g.translate(o.x ?? E.W / 2, o.y ?? E.H * 0.2); g.scale(s, s);
      const size = o.size ?? V(78, 72), sz = Math.min(size, (E.W * 0.86) / Math.max(1, measure(g, o.s, size) / size));
      text(g, o.s, 0, 0, { size: sz, color: o.color === 'accent' ? ui().accent : o.color === 'cream' ? ui().cream : ui().gold, glow: 28, glowColor: alpha(o.color === 'accent' ? ui().accent : '#ff9a40', 0.75), spacing: 3, align: o.align || 'center' });
      g.restore();
    } else if (o.k === 'sub') {    // smaller cream label
      text(g, o.s, o.x ?? E.W / 2, o.y ?? E.H * 0.82, { size: o.size ?? 40, font: FONTS.ui, weight: 900, color: ui().cream, alpha: a, spacing: 3, glow: 12, glowColor: 'rgba(0,0,0,.9)', align: o.align || 'center' });
    } else if (o.k === 'readout') UI.readout(g, { label: o.label, value: o.v, x: o.x ?? V(130, 80), y: o.y ?? E.H - V(240, 600), size: o.size ?? 64, a, align: o.align || 'left', color: o.color === 'accent' ? ui().accent : ui().gold });
    else if (o.k === 'badge') UI.badge(g, { str: o.s, a });
    else if (o.k === 'counter') {  // ticking number e.g. "1:00 → 3:00"
      const v = lerp(o.from, o.to, ease.inOut(prog(t, at, o.until ?? end))); const str = o.fmt === 'mmss' ? `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}` : Math.round(v).toLocaleString('ru-RU');
      UI.readout(g, { label: o.label, value: str + (o.unit || ''), x: o.x ?? V(130, 80), y: o.y ?? E.H - V(240, 600), size: o.size ?? 64, a, color: o.color === 'accent' ? ui().accent : ui().gold });
    }
  }
}
function atmosphere(g, t, info, M) {
  const fx = info.fx ?? ['dust'];
  if (fx.includes('dust')) FX.dust(g, t, { count: 36, color: M?.practical || '#ffe2bd', a: 0.3, seed: info.seed || 3 });
  if (fx.includes('rain')) FX.rain(g, t, { count: 200, a: 0.25 });
  if (fx.includes('tears')) FX.drops(g, t, { count: 24, color: '#cfe0ff', rMax: 8, drift: 2 });
  if (fx.includes('streak')) FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 1.2, M?.practical || '#ffe0b0', 0.15);
}
// freeze-frame look: cool tint + hanging drops + rings + badge
function freezeLook(g, t, info) {
  if (!info.freeze) return;
  FX.drops(g, t, { count: 40, color: '#d8e4ff', rMax: 9, drift: 2, seed: 7 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  if (info.freeze.badge) UI.badge(g, { str: info.freeze.badge, a: ease.out(prog(t, 0.3, 0.8)) });
}

// beard: a dark-brown crescent along the jaw that leaves the mouth area clear, with a little stubble texture
function bigBeard(g, cx, cy, r, talk) {
  g.save(); g.beginPath(); g.arc(cx, cy, r * 0.985, 0.08 * Math.PI, 0.92 * Math.PI); g.ellipse(cx, cy + r * 0.3, r * 0.42, r * 0.3, 0, Math.PI, 0, true); g.closePath();
  g.fillStyle = '#3a2416'; g.fill(); g.clip(); const R = rng(3); g.fillStyle = 'rgba(255,220,180,.18)'; for (let i = 0; i < 140; i++) { const a = 0.1 * Math.PI + R() * 0.8 * Math.PI, d = r * (0.6 + R() * 0.38); g.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.012, r * 0.03); } g.restore();
}
// ---------- actors ----------
function beard(g, hx, hy, r, f) { g.save(); g.fillStyle = '#4a2c1a'; g.beginPath(); g.arc(hx, hy, r * 1.0, (f > 0 ? 0.0 : 0.35) * Math.PI, (f > 0 ? 0.65 : 1.0) * Math.PI); g.lineTo(hx + r * 0.3 * f, hy + r * 0.3); g.closePath(); g.fill(); g.restore(); }
export function drawActor(g, a, t, info, GY, M, CX = E.W / 2) {
  const of = { ...(CAST[a.who] || {}), ...(a.outfit || {}) }, dur = info.dur;
  let x = CX + (a.x || 0), pose;
  if (a.walk) {
    const [x0, x1, run] = a.walk, [w0, w1] = a.walkT || [0, dur], k = prog(t, w0, w1);
    x = CX + lerp(x0, x1, k); const moving = t >= w0 && t <= w1;
    pose = moving ? walkPose((t - w0) * 2 * Math.PI * (run ? 1.6 : 0.9), { run }) : breathe(poseOf(t > w1 ? a.endPose || 'stand' : 'stand'), t, 1, a.seed || 0);
  } else pose = a.still ? poseAt(a, t) : breathe(poseAt(a, t), t, 1, a.seed || (a.x || 0) / 100);
  const s = a.s ?? 1.5, f = step(a.f ?? 1, t), per = a.blinkP || 3.1 + ((a.x || 0) % 7) * 0.13;
  const talk = a.talk ? talkAmount(info.globalT, a.talk[0], a.talk[1]) : 0;
  const o = { x, y: GY + (a.y || 0), s, facing: f, pose, outfit: of, expr: step(a.expr || 'neutral', t), talk, blink: !a.noBlink && (t % per) > per - 0.13, look: a.look, rim: { color: a.rimColor || M.rim, dir: a.rim || [0, -1], w: 4.5 }, prop: a.prop, rot: a.rot, alpha: a.alpha, shadow: a.shadow, dim: a.dim };
  if (a.trail) o.trail = a.trail;
  drawFigure(g, o);
  const [hx, hy, hr] = headPos(o);
  if (a.beard) beard(g, hx, hy, hr, f);
  if (talk > 0) FX.rings(g, hx, hy, t, { count: 2, r0: hr * 1.6, r1: hr * 3.2, color: '#fff3e0', a: 0.3 });
  if (a.tear) { const k = (t * 0.6) % 1; g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(hx + hr * 0.4 * f, hy + hr * (0.1 + k * 0.6), hr * 0.08, hr * 0.14, 0, 0, 7); g.fill(); }
  if (a.sweat) { g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(hx - hr * 0.7 * f, hy - hr * 0.6 + ((t * 0.8) % 1) * hr * 0.5, hr * 0.09, hr * 0.15, 0, 0, 7); g.fill(); }
  if (a.mark) FX.rings(g, hx, hy, t, { count: 3, r0: hr * 1.5, r1: hr * 4, color: M.rim, a: 0.4, speed: 1 });
  return { hx, hy, hr, x };
}
// small set props placed by shots
function drawProps(g, list, t, GY, M, CX) {
  for (const p of list || []) {
    const x = CX + (p.x || 0), y = GY + (p.y || 0);
    if (p.k === 'table') { const tb = cafeTable(g, x, GY); if (p.cups) p.cups.forEach((dx, i) => cupProp(g, x + dx, tb.top, 1.1, { steam: p.steam, t })); if (p.croissant) { g.fillStyle = '#d89a50'; g.beginPath(); g.ellipse(x + p.croissant, tb.top - 10, 30, 12, 0, Math.PI, 0); g.fill(); } }
    else if (p.k === 'chair') chairSide(g, x, GY, p.s ?? 1.5, p.f ?? 1);
    else if (p.k === 'bench') bench(g, x, GY, p.s ?? 1.2);
    else if (p.k === 'car') car(g, x, y, p.s ?? 1, p.color, p.f ?? 1, { lights: p.lights });
    else if (p.k === 'price') priceStand(g, x, y, p.s ?? 1, p.v, M);
    else if (p.k === 'cup') cupProp(g, x, y, p.s ?? 1, { steam: p.steam, t });
    else if (p.k === 'carrier') carrier(g, x, y, p.s ?? 1, t, p);
    else if (p.k === 'envelope') envelope(g, x, y, p.s ?? 1, p.rot || 0, p);
    else if (p.k === 'mic') { seg(g, [[x, y], [x, y - 40]], 6, '#20202a'); circle(g, x, y - 46, 10, '#3a3a44'); }
    else if (p.k === 'glass') { g.fillStyle = alpha('#fff3d6', 0.6); poly(g, [[x - 10, y - 50], [x + 10, y - 50], [x + 4, y - 20], [x - 4, y - 20]], alpha('#ffe7a0', 0.8)); seg(g, [[x, y - 20], [x, y]], 3, alpha('#ffffff', 0.7)); }
  }
}
export function carrier(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#2a2a34'; g.lineWidth = 8; g.beginPath(); g.arc(0, -40, 70, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.fillStyle = '#3a6ea5'; g.beginPath(); g.moveTo(-90, -40); g.quadraticCurveTo(0, 40, 90, -40); g.closePath(); g.fill();
  g.fillStyle = '#8fd0f2'; g.beginPath(); g.ellipse(0, -36, 84, 14, 0, 0, Math.PI * 2); g.fill();
  circle(g, -30, -52, 22, E.style.ink); face(g, -30, -52, 22, { expr: o.expr || 'smile', blink: (t % 2.7) > 2.55, front: true });
  g.restore();
}
export function envelope(g, x, y, s, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -80, -50, 160, 100, 6); g.fillStyle = '#f4f1ea'; g.fill(); g.strokeStyle = '#c8c0b0'; g.lineWidth = 3; g.beginPath(); g.moveTo(-80, -50); g.lineTo(0, 10); g.lineTo(80, -50); g.stroke();
  if (o.label) text(g, o.label, 0, 28, { size: 18, font: FONTS.ui, weight: 900, color: '#8a8070' });
  g.restore();
}

// ---------- template: set (wide / medium / two-shot) ----------
function kSet(g, t, info) {
  const cam = camAt(info.cam, t, info.dur);
  const { GY, CX, M } = drawSet(g, info.set, info.freeze ? 0 : t, cam, info.so);
  layer(g, cam, 1, (g) => {
    drawProps(g, info.props, t, GY, M, CX);
    for (const a of info.actors || []) drawActor(g, a, info.freeze && !a.live ? 0 : t, info, GY, M, CX);
    drawProps(g, info.propsFront, t, GY, M, CX);
  });
  if (info.fg) blurLayer(g, 10, (g) => { for (const a of info.fg) drawActor(g, a, t, info, GY, M, CX); }, cam, 1.6);
  if (info.veil) veil(g, info.veil[0], info.veil[1]);
  atmosphere(g, t, info, M); freezeLook(g, t, info);
}
// ---------- template: giant face close-up ----------
function kFace(g, t, info) {
  const bg = info.bg || { set: 'studio' };
  blurLayer(g, 14, (g) => drawSet(g, bg.set, t, bg.cam || { z: 1.5, x: bg.x ?? -150, y: -160 }, bg.so)); veil(g, '#0a0812', 0.35);
  const M = mood(bg.mood || (bg.set === 'showroom' ? 'interiorCool' : bg.set === 'cafe' || bg.set === 'home' ? 'interiorWarm' : bg.set === 'park' ? 'dusk' : bg.set === 'doorway' || bg.set === 'stairwell' ? 'night' : 'dusk'));
  const z = info.zoom ?? [1, 1.06], r = V(info.r ?? 300, 330) * lerp(z[0], z[1], ease.inOut(t / info.dur));
  const [sx, sy] = info.shake ? shake(t, info.shake, 3) : [0, 0];
  const cx = E.W / 2 + (info.x ?? 0) + sx, cy = E.H * V(0.6, 0.55) + (info.y ?? 0) + sy;
  const of = { ...(CAST[info.who] || {}), ...(info.outfit || {}) };
  const per = info.blinkP ?? 3.3, blink = info.blinkAt ? info.blinkAt.some(([a, b]) => t >= a && t <= b) : !info.noBlink && (t % per) > per - 0.13;
  const talk = info.talk ? talkAmount(info.globalT, info.talk[0], info.talk[1]) : 0;
  bigFace(g, cx, cy, r, { outfit: of, expr: step(info.expr || 'neutral', t), talk, blink, look: info.look, rimColor: M.rim, rimSide: info.side ?? -1, tilt: info.tilt });
  if (info.beard) bigBeard(g, cx, cy, r, talk);
  if (of.face === 'glasses') { seg(g, [[cx - r * 0.08, cy - r * 0.16], [cx + r * 0.08, cy - r * 0.16]], r * 0.05, E.style.feature); for (const sd of [-1, 1]) seg(g, [[cx + sd * r * 0.6, cy - r * 0.18], [cx + sd * r * 0.92, cy - r * 0.26]], r * 0.05, E.style.feature); }
  if (info.tear) { for (const [i, dx] of [[0, -0.34], [1, 0.34]]) { if (info.tear === 1 && i === 0) continue; const k = prog(t, 0.3 + i * 0.4, info.dur); g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(cx + dx * r, cy - r * 0.05 + k * r * 0.6, r * 0.05, r * 0.08, 0, 0, 7); g.fill(); seg(g, [[cx + dx * r, cy - r * 0.05], [cx + dx * r, cy - r * 0.05 + k * r * 0.55]], r * 0.03, alpha('#9fd8ff', 0.45)); } }
  if (info.sweat) { g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(cx - r * 0.75, cy - r * 0.5 + ((t * 0.5) % 1) * r * 0.4, r * 0.06, r * 0.1, 0, 0, 7); g.fill(); }
  if (talk > 0) FX.rings(g, cx, cy, t, { count: 3, r0: r * 1.1, r1: r * 1.6, color: '#fff3e0', a: 0.3 });
  if (info.redEyes) for (const dx of [-0.34, 0.34]) { g.strokeStyle = alpha('#ff5a4a', 0.55); g.lineWidth = r * 0.02; for (let i = 0; i < 4; i++) { const a = i * 1.6; g.beginPath(); g.moveTo(cx + dx * r + Math.cos(a) * r * 0.2, cy - r * 0.16 + Math.sin(a) * r * 0.2); g.lineTo(cx + dx * r + Math.cos(a) * r * 0.08, cy - r * 0.16 + Math.sin(a) * r * 0.08); g.stroke(); } }
  FX.dust(g, t, { count: 24, color: M.practical, a: 0.25 });
  freezeLook(g, t, info);
}
// ---------- template: inserts (hands, objects, screens) ----------
function hand(g, x, y, s, sleeve, o = {}) {   // a hand reaching in from the bottom-right (or mirrored with o.f = -1)
  const ink = E.style.ink; g.save(); g.translate(x, y); g.scale(s * (o.f || 1), s);
  seg(g, [[0, 0], [260, 380]], 70, ink); seg(g, [[120, 170], [300, 480]], 100, sleeve);
  circle(g, 0, 0, 52, ink); for (let i = 0; i < 4; i++) seg(g, [[-10, -10 + i * 22], [-62 - (i === 0 ? 4 : 0), -34 + i * 24]], 24, ink); seg(g, [[20, -20], [-10, -70]], 24, ink);
  if (o.ring) { ring(g, -42, -12, 13, 7, '#ffd47e'); glow(g, -42, -12, 30, '#ffd47e', 0.6); }
  g.restore();
}
function phoneScreen(g, x, y, w, h, t, info) {
  rr(g, x - 14, y - 14, w + 28, h + 28, 34); g.fillStyle = '#0a0a10'; g.fill();
  g.save(); rr(g, x, y, w, h, 22); g.clip();
  const mode = info.screen || 'year';
  if (mode === 'year') {
    g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#1a2450', '#5a4a8a', '#c08aa0']); g.fillRect(x, y, w, h);
    text(g, info.time || '10:07', x + w / 2, y + h * 0.24, { size: w * 0.26, font: FONTS.ui, weight: 800, color: '#f4f1ff' });
    const y0 = info.yearFrom ?? 2024, y1 = info.yearTo ?? y0 + 1, k = prog(t, info.flipAt ?? 0.8, (info.flipAt ?? 0.8) + 0.4);
    const yr = k < 0.5 ? y0 : y1; const sc = 1 + 0.25 * Math.sin(k * Math.PI);
    g.save(); g.translate(x + w / 2, y + h * 0.42); g.scale(sc, sc); text(g, `${info.date || '15 МАРТА'} ${yr}`, 0, 0, { size: w * 0.075, font: FONTS.ui, weight: 900, color: k > 0.5 ? '#ffd47e' : '#dfe4ff', glow: k > 0.5 ? 14 : 0, glowColor: 'rgba(255,200,100,.8)' }); g.restore();
  } else if (mode === 'gallery') {
    g.fillStyle = '#101018'; g.fillRect(x, y, w, h); text(g, 'ГАЛЕРЕЯ', x + 24, y + 46, { size: 30, font: FONTS.ui, weight: 900, color: '#fff', align: 'left' });
    const cols = 3, cw = (w - 16) / cols, sc = (t * (info.scroll ?? 60)) % (cw * 2);
    const scenes = ['sea', 'cafe', 'sea', 'park', 'home', 'sea', 'cafe', 'park', 'sea', 'wedding', 'cafe', 'sea', 'park', 'sea', 'cafe'];
    for (let i = 0; i < 15; i++) { const cx = x + 4 + (i % cols) * (cw + 4), cy = y + 70 + Math.floor(i / cols) * (cw + 4) - sc; if (cy > y + h || cy + cw < y) continue;
      g.save(); g.beginPath(); g.rect(cx, cy, cw, cw); g.clip(); g.translate(cx, cy); g.scale(cw / E.W * 1.9, cw / E.W * 1.9); g.translate(-E.W * 0.22, -E.H * 0.32);
      const st = SETS[scenes[i]](g, 0, { z: 1, x: (i * 97) % 300 - 150 }, {}); drawActor(g, { who: 'MAX', x: (i % 2 ? -120 : 80), s: 1.8, expr: 'joy', pose: i % 3 ? 'cheer' : 'wave', noBlink: true, still: true }, 0, info, st.GY, st.M, st.CX); g.restore(); }
    rr(g, x + w - 150, y + h - 70, 130, 46, 23); g.fillStyle = 'rgba(0,0,0,.7)'; g.fill();
    const n = Math.round(lerp(info.countFrom ?? 0, info.count ?? 342, ease.out(prog(t, 0.2, 1.6)))); text(g, `+${n}`, x + w - 85, y + h - 47, { size: 28, font: FONTS.ui, weight: 900, color: '#ffd47e' });
  } else if (mode === 'photo') {
    g.save(); g.translate(x, y); g.scale(w / E.W * 2.2, w / E.W * 2.2); g.translate(-E.W * 0.32, -E.H * 0.18);
    const st = SETS[info.photo || 'sea'](g, 0, { z: 1 }, {}); drawActor(g, { who: 'MAX', x: 0, s: 2, expr: 'joy', pose: 'cheer', noBlink: true, still: true }, 0, info, st.GY, st.M, st.CX); g.restore();
  }
  g.restore();
}
function kInsert(g, t, info) {
  const what = info.what, M = mood(info.mood || 'interiorCool');
  const bg = info.bg || { set: 'showroom' };
  blurLayer(g, 16, (g) => drawSet(g, bg.set, t, bg.cam || { z: 1.7, x: bg.x ?? 200, y: bg.y ?? -120 }, bg.so)); veil(g, '#0a0812', 0.4);
  const cam = camAt(info.cam || { z: [1, 1.08] }, t, info.dur);
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H / 2;
    if (what === 'clock') {
      const sec = info.clock ?? 10 * 3600 + 7 * 60; const spin = info.spin ? info.spin * ease.inOut(prog(t, 0.2, info.dur - 0.2)) : 0;
      glow(g, cx, cy, 520, '#e8f0ff', 0.12); FX.clock(g, cx, cy, V(300, 330), sec + spin + (info.tick ? Math.floor(t) : 0), { face: '#eef0f6', ink: '#14121c' });
    } else if (what === 'phone') {
      const pw = V(380, 420), ph = pw * 1.95, px = cx - pw / 2 + (info.px || 0), py = cy - ph / 2 + 60 + (1 - ease.out(prog(t, 0, 0.5))) * 200;
      hand(g, px + pw * 0.75, py + ph * 0.8, 1.6, CAST.MAX.color); phoneScreen(g, px, py, pw, ph, t, info);
      glow(g, px + pw / 2, py + ph / 2, pw * 1.2, '#9fb8ff', 0.15);
    } else if (what === 'price') {
      const k = prog(t, info.flipAt ?? 0.6, (info.flipAt ?? 0.6) + 0.5); g.save(); g.translate(cx, cy + 240); g.scale(3.2, 3.2);
      priceStand(g, 0, 0, 1, k > 0.5 ? info.v2 || info.v : info.v, M, { accent: k > 0.5 ? '#d84a3a' : '#c0392b' }); g.restore();
      if (info.v2 && k > 0.5) FX.rings(g, cx, cy - 120, t - (info.flipAt ?? 0.6), { count: 2, r0: 120, r1: 420, color: '#ffd47e', a: 0.35, speed: 1.2 });
    } else if (what === 'calendar') {
      g.save(); g.translate(cx, cy); const k = prog(t, info.flipAt ?? 0.6, (info.flipAt ?? 0.6) + 0.4); g.scale(3.4, 3.4 * (1 - 0.6 * Math.sin(k * Math.PI))); calendar(g, 0, 0, 1, k > 0.5 ? info.year2 ?? info.year : info.year, M); g.restore();
    } else if (what === 'envelope') {
      const k = ease.out(prog(t, 0, 0.8)); hand(g, cx + 160 - (1 - k) * 300, cy + 80, 1.5, info.sleeve || CAST.BOSS.color, { f: -1 });
      envelope(g, cx + 40 - (1 - k) * 300, cy - 30, 2.6, -0.12, { label: info.label || 'ПРЕМИЯ' });
      if (info.take) { const k2 = ease.out(prog(t, info.take, info.take + 0.6)); hand(g, cx - 240 + (1 - k2) * -300, cy + 120, 1.5, CAST.MAX.color); }
    } else if (what === 'note') {
      const k = ease.out(prog(t, 0, 0.8)); g.save(); g.translate(cx, cy + (1 - k) * 200); g.rotate(-0.04);
      rr(g, -460, -260, 920, 520, 10); g.fillStyle = '#f4efe2'; g.fill(); g.strokeStyle = '#d8d0c0'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(-420, -170 + i * 56); g.lineTo(420, -170 + i * 56); g.stroke(); }
      text(g, info.s1 || 'Остальное —', 0, -90, { size: 72, font: FONTS.serif, weight: 900, italic: true, color: '#2a3a7a', alpha: clamp((t - 0.5) / 0.4) });
      text(g, info.s2 || 'в следующем месяце', 0, 10, { size: 72, font: FONTS.serif, weight: 900, italic: true, color: '#2a3a7a', alpha: clamp((t - 1.0) / 0.4) });
      text(g, info.s3 || 'С. Н.', 300, 140, { size: 52, font: FONTS.serif, weight: 900, italic: true, color: '#2a3a7a', alpha: clamp((t - 1.5) / 0.4) });
      g.restore();
      if (info.money) { const k3 = ease.outBack(prog(t, 0.2, 0.7)); g.save(); g.translate(cx - 520, cy + 260); g.rotate(0.2); g.scale(k3, k3); for (let i = 0; i < 3; i++) { rr(g, -130 + i * 12, -60 - i * 10, 260, 120, 6); g.fillStyle = i === 2 ? '#7aa0d8' : '#5a7ab0'; g.fill(); text(g, '1000', 0 + i * 12, -i * 10, { size: 44, font: FONTS.ui, weight: 900, color: '#e8f0ff' }); } g.restore(); }
    } else if (what === 'drops') {
      g.save(); g.translate(cx, cy + 140); g.scale(2.2, 2.2);
      rr(g, -50, -200, 100, 200, 18); g.fillStyle = '#e8f2ff'; g.fill(); rr(g, -50, -120, 100, 80, 6); g.fillStyle = '#3a8ad8'; g.fill(); text(g, 'КАПЛИ', 0, -80, { size: 22, font: FONTS.ui, weight: 900, color: '#fff' });
      poly(g, [[-22, -200], [22, -200], [8, -270], [-8, -270]], '#f4f4f8'); rr(g, -30, -214, 60, 20, 6); g.fillStyle = '#c8d0dc'; g.fill();
      g.restore();
      const k = ease.outBack(prog(t, 0.4, 0.9)); g.save(); g.translate(cx + 330, cy - 160); g.rotate(0.15); g.scale(k, k); rr(g, -110, -50, 220, 100, 12); g.fillStyle = '#ffd47e'; g.fill(); text(g, info.v || '490 РУБ.', 0, 2, { size: 46, font: FONTS.ui, weight: 900, color: '#1a1622' }); g.restore();
      glow(g, cx, cy - 100, 400, '#9fd8ff', 0.15);
    } else if (what === 'stopwatch') {
      const v = lerp(info.from ?? 0, info.to ?? 120, ease.linear(prog(t, 0.2, info.dur - 0.2)));
      hand(g, cx + 140, cy + 240, 1.5, CAST.EGOR.color, { f: 1 });
      circle(g, cx, cy, 250, '#1a1a22'); circle(g, cx, cy, 230, '#f2efe8'); rr(g, cx - 30, cy - 300, 60, 50, 10); g.fillStyle = '#1a1a22'; g.fill();
      for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, L = i % 5 ? 14 : 30; seg(g, [[cx + Math.cos(a) * (215 - L), cy + Math.sin(a) * (215 - L)], [cx + Math.cos(a) * 215, cy + Math.sin(a) * 215]], i % 5 ? 3 : 6, '#1a1622'); }
      const a = (v % 60) / 60 * Math.PI * 2 - Math.PI / 2; seg(g, [[cx, cy], [cx + Math.cos(a) * 190, cy + Math.sin(a) * 190]], 7, '#e04a3a'); circle(g, cx, cy, 14, '#1a1622');
      text(g, `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`, cx, cy + 90, { size: 70, font: FONTS.ui, weight: 900, color: '#1a1622' });
    } else if (what === 'cup') {
      g.save(); g.translate(cx, cy + 200); g.scale(5, 5); cupProp(g, 0, 0, 1, { steam: info.steam, t }); g.restore();
      if (info.cold) { for (let i = 0; i < 6; i++) FX.sparkle(g, cx - 120 + i * 50, cy - 20 + Math.sin(i * 2) * 30, 14, '#cfe8ff', 0.5); }
    } else if (what === 'ring') {
      rr(g, -E.W, cy + 120, E.W * 3, 600, 0); g.fillStyle = '#3a2a24'; g.fill(); cupProp(g, cx - 380, cy + 120, 3.2, {});
      hand(g, cx + 80, cy + 60, 1.8, CAST.EGOR.color, { ring: true });
      FX.sparkle(g, cx + 80 - 42 * 1.8, cy + 60 - 12 * 1.8, 34, '#fff3c0', 0.6 + 0.4 * Math.sin(t * 6));
    } else if (what === 'carrier') {
      carrier(g, cx, cy + 160, 3.4, t, { expr: info.expr || 'smile' });
    } else if (what === 'eyes') {          // extreme close-up of Max's eyes
      bigFace(g, cx, cy + V(260, 200), V(900, 820), { outfit: CAST.MAX, expr: step(info.expr || 'neutral', t), blink: info.blinkAt ? info.blinkAt.some(([a, b]) => t >= a && t <= b) : false, rimColor: M.rim, look: info.look });
      if (info.redEyes) for (const dx of [-0.34, 0.34]) { g.strokeStyle = alpha('#ff5a4a', 0.6); g.lineWidth = 5; for (let i = 0; i < 6; i++) { const a = i * 1.05; g.beginPath(); g.moveTo(cx + dx * 900 + Math.cos(a) * 170, cy + 260 - 150 + Math.sin(a) * 170); g.lineTo(cx + dx * 900 + Math.cos(a) * 90, cy + 260 - 150 + Math.sin(a) * 90); g.stroke(); } }
    }
  });
  FX.dust(g, t, { count: 24, color: M.practical, a: 0.22 });
  freezeLook(g, t, info);
}
// ---------- template: blueprint explainers ----------
function kBlueprint(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), gold = ui().gold, cr = ui().cream, cx = E.W / 2, cy = E.H / 2;
  const mode = info.mode;
  if (mode === 'rate') {          // a head that blinks; counter 0 -> 15-20
    const per = 60 / 17.5 / 4;      // sped up x4 for the diagram
    const closed = (t % per) < 0.09;
    ring(g, cx - 360, cy, 170, 5, c); for (const dx of [-60, 60]) { if (closed) seg(g, [[cx - 360 + dx - 34, cy - 20], [cx - 360 + dx + 34, cy - 20]], 6, c); else { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.ellipse(cx - 360 + dx, cy - 20, 36, 22, 0, 0, 7); g.stroke(); circle(g, cx - 360 + dx, cy - 20, 10, c); } }
    const n = Math.min(Math.floor(t / per), 99); text(g, String(n), cx + 260, cy - 40, { size: 180, font: FONTS.ui, weight: 900, color: gold, glow: 30, glowColor: alpha(gold, 0.6) });
    text(g, 'МОРГАНИЙ', cx + 260, cy + 80, { size: 40, font: FONTS.ui, weight: 900, color: cr, spacing: 6 });
    const a = clamp((t - (info.at ?? 1.2)) / 0.4); text(g, '15–20 РАЗ В МИНУТУ', cx, E.H - 170, { size: 56, color: gold, alpha: a, glow: 18, glowColor: alpha(gold, 0.5), spacing: 3 });
  } else if (mode === 'closed') {   // the waking day bar with 10% black slivers
    const x0 = 200, x1 = E.W - 200, y = cy - 20, p = ease.inOut(prog(t, 0.2, 2.2));
    text(g, 'ДЕНЬ БЕЗ СНА · 16 ЧАСОВ', x0, y - 110, { size: 34, font: FONTS.ui, weight: 900, color: cr, align: 'left', spacing: 4 });
    rr(g, x0, y - 40, x1 - x0, 80, 12); g.fillStyle = alpha(c, 0.15); g.fill(); rr(g, x0, y - 40, (x1 - x0) * p, 80, 12); g.fillStyle = alpha(c, 0.5); g.fill();
    const r = rng(4); for (let i = 0; i < 40; i++) { const u = (i + r() * 0.6) / 40; if (u > p) break; g.fillStyle = '#05070e'; g.fillRect(x0 + u * (x1 - x0), y - 40, (x1 - x0) * 0.0025 * (1 + r()), 80); }
    const a = clamp((t - (info.at ?? 1.4)) / 0.4); text(g, '≈ 10%', cx, y + 170, { size: 130, font: FONTS.ui, weight: 900, color: gold, alpha: a, glow: 26, glowColor: alpha(gold, 0.6) });
    text(g, 'ГЛАЗА ЗАКРЫТЫ', cx, y + 270, { size: 40, font: FONTS.ui, weight: 900, color: cr, alpha: a, spacing: 6 });
  } else if (mode === 'cut') {      // film strip; black frames are cut out and the strip closes up
    const fw = 230, fh = 170, y = cy - 40, off = -((t * 160) % (fw + 20));
    for (let i = -1; i < 11; i++) { const x = off + i * (fw + 20), black = (i % 4) === 2, k = black ? ease.inOut(prog(t, 0.8, 1.6)) : 0;
      g.save(); g.globalAlpha *= 1 - k; g.translate(0, -k * 260); rr(g, x, y - fh / 2, fw, fh, 10); g.fillStyle = black ? '#02030a' : alpha(c, 0.18); g.fill(); g.strokeStyle = c; g.lineWidth = 3; g.stroke();
      if (!black) UI.lineFigure(g, { x: x + fw / 2, y: y + 60, s: 0.5, color: alpha(cr, 0.8), pose: POSES.walk || POSES.stand });
      else text(g, 'МОРГ', x + fw / 2, y, { size: 30, font: FONTS.ui, weight: 900, color: alpha(c, 0.6) });
      g.restore(); }
    for (let x = -40; x < E.W + 40; x += 40) { rr(g, x, y - fh / 2 - 40, 20, 16, 4); g.fillStyle = alpha(c, 0.5); g.fill(); rr(g, x, y + fh / 2 + 24, 20, 16, 4); g.fill(); }
    const a = clamp((t - 1.2) / 0.4); text(g, 'МОЗГ ВЫРЕЗАЕТ ЭТИ СЕКУНДЫ', cx, E.H - 170, { size: 54, color: gold, alpha: a, glow: 18, glowColor: alpha(gold, 0.5), spacing: 3 });
  } else if (mode === 'age') {      // one minute of blinking = 15 years
    UI.dataCard(g, t, { title: 'ЕСЛИ МОРГАНИЕ = 1 ГОД', subtitle: 'ТВОЙ ВОЗРАСТ ЧЕРЕЗ МИНУТУ', from: 21, to: 36, decimals: 0, unit: '', start: 0.6, dur: info.dur - 1.4, labels: [[0, '21'], [0.5, '28'], [1, '36']], total: info.dur });
  } else if (mode === 'lunch') {    // by lunch you'd be older than the boss
    const p = ease.out(prog(t, 0.3, 1.6)), q = ease.out(prog(t, 1.0, 2.6));
    const bar = (y, w, label, val, col) => { text(g, label, 260, y - 50, { size: 34, font: FONTS.ui, weight: 900, color: cr, align: 'left', spacing: 3 }); rr(g, 260, y - 22, 1300, 44, 22); g.fillStyle = alpha(col, 0.15); g.fill(); rr(g, 260, y - 22, Math.max(44, 1300 * w), 44, 22); g.fillStyle = col; g.fill(); text(g, val, 260 + 1300 * w + 30, y, { size: 52, font: FONTS.ui, weight: 900, color: col, align: 'left' }); };
    bar(cy - 100, 0.55 * p, 'СЕРГЕЙ НИКОЛАЕВИЧ', p > 0.05 ? '52' : '', c);
    const age = Math.round(lerp(21, 81, q)); bar(cy + 110, 0.86 * q, 'ТЫ К ОБЕДУ', q > 0.05 ? String(age) : '', ui().accent);
  } else if (mode === 'pattern') {  // Egor's discovery: before every blink you said "скорее бы"
    const items = info.items || [];
    text(g, info.head || '4 ИЗ 4', cx, 150, { size: 64, color: gold, glow: 20, glowColor: alpha(gold, 0.5), alpha: clamp(t / 0.4), spacing: 4 });
    seg(g, [[160, cy + 40], [E.W - 160, cy + 40]], 4, alpha(c, 0.6));
    items.forEach((it, i) => { const x = 300 + i * ((E.W - 600) / Math.max(1, items.length - 1)), at = it.at ?? 0.3 + i * 0.5, a = clamp((t - at) / 0.35), pop = ease.outBack(prog(t, at, at + 0.4));
      g.save(); g.globalAlpha *= a; circle(g, x, cy + 40, 14 * pop, gold); glow(g, x, cy + 40, 60, gold, 0.5);
      UI.bubble(g, x, cy - 90, { w: 330, h: 90, color: '#f4efe6', str: null, dots: false }); text(g, it.s, x, cy - 88, { size: 30, font: FONTS.ui, weight: 900, color: '#1a1622' });
      text(g, it.age, x, cy + 120, { size: 40, font: FONTS.ui, weight: 900, color: cr }); text(g, 'ЛЕТ', x, cy + 162, { size: 22, font: FONTS.ui, weight: 900, color: alpha(cr, 0.6), spacing: 3 });
      g.restore(); });
  }
  overlays(g, t, info);
}
// ---------- template: title / big line / end screen ----------
function kTitle(g, t, info) {
  const bg = info.bg || { set: 'showroom' };
  blurLayer(g, 6, (g) => drawSet(g, bg.set, t, { z: 1.0 + 0.04 * t, x: -200 }, bg.so)); veil(g, '#0a0812', 0.45);
  UI.titleCard(g, t, { lines: info.lines, sub: info.sub, dur: info.dur });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.35 });
}
function kLine(g, t, info) {
  const bg = info.bg || { set: 'studio' };
  blurLayer(g, 12, (g) => drawSet(g, bg.set, t, bg.cam || { z: 1.2 + 0.03 * t, x: 0 }, bg.so)); veil(g, '#0a0812', 0.5);
  UI.bigLine(g, t, { str: info.s, dur: info.dur, color: info.color === 'accent' ? ui().accent : info.color === 'cream' ? ui().cream : ui().gold });
  if (info.s2) text(g, info.s2, E.W / 2, E.H / 2 + 110, { size: 44, font: FONTS.ui, weight: 900, color: ui().cream, alpha: clamp((t - (info.at2 ?? 0.8)) / 0.4), spacing: 4 });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
}
function kEnd(g, t, info) {
  UI.endScreen(g, t, { question: info.q || 'Какой год ты бы пропустил?', cast: [CAST.BOSS, CAST.MAX, CAST.EGOR, CAST.WIFE, CAST.BABY], rim: '#ffb070', subscribe: 'Подписаться' });
  if (info.s2) text(g, info.s2, E.W / 2, V(400, 700), { size: 40, font: FONTS.ui, weight: 900, color: alpha(ui().cream, 0.85), alpha: clamp((t - 1) / 0.5), spacing: 2 });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
}

const KINDS = { set: kSet, face: kFace, insert: kInsert, bp: kBlueprint, title: kTitle, line: kLine, end: kEnd };
for (const s of E.shots) {
  const k = s.params?.k; if (!k || k === '3d') continue;
  const fn = KINDS[k]; if (!fn) continue;
  registerShot(s.id, { draw(g, t, info) { fn(g, t, info); if (k !== 'bp') overlays(g, t, info); blinkOverlay(g, t, info); } });
}
