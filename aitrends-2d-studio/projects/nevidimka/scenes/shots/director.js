// shots/director.js — «режиссёр»: рисует каждый кадр по описанию params.v из story/shots.json.
// v = { set, so, cam, ch[], pr[], face, ins, bp, ui[], fx, lid, split }
import { E, V, S, registerShot, getShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount,
  seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, radGrad, backdrop, text, measure, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { salon, car } from '../sets/salon.js';
import { cafe, table, cup, room, park, bench, pharmacy, entrance, stage, void_ } from '../sets/places.js';
import { CAST } from '../cast.js';
import { bathroom, street, metro, cabinet, stairs, stadium, cinema, kitchen } from '../sets/places2.js';

const SETS = { salon, cafe, room, park, pharmacy, entrance, stage, void: void_, bathroom, street, metro, cabinet, stairs, stadium, cinema, kitchen };
const at = (keys, t) => { if (!Array.isArray(keys)) return keys; let v = keys[0][1]; for (const [tt, x] of keys) if (t >= tt) v = x; return v; };
const span = (a, t, dur, e = ease.inOut) => (Array.isArray(a) ? lerp(a[0], a[1], e(clamp(t / dur))) : a ?? 0);

function camOf(v, t, dur) {
  const c = v.cam || {};
  const cam = { z: span(c.z ?? [1, 1.05], t, dur), x: span(c.x ?? [0, -24], t, dur), y: span(c.y ?? 0, t, dur), r: c.r || 0 };
  if (c.push) cam.z = lerp(c.push[0], c.push[1], ease.out(clamp(t / Math.min(dur, c.pushT || 0.8))));
  if (c.shake) { const [sx, sy] = shake(t, c.shake, 9); cam.x += sx; cam.y += sy; }
  return cam;
}

function drawSet(g, v, t, cam) {
  const fn = SETS[v.set || 'void'] || void_;
  return fn(g, t, cam, v.so || {});
}

function drawChars(g, v, t, dur, info, GY, CX, M) {
  for (const c of v.ch || []) {
    const outfit = { ...(CAST[c.w] || CAST.max), ...(c.of || {}) };
    let x = CX + (c.x || 0), facing = c.f ?? 1, pose;
    if (c.walk) {
      const [x0, x1, t0 = 0, t1 = dur] = c.walk; const k = clamp((t - t0) / (t1 - t0));
      x = CX + lerp(x0, x1, k); facing = x1 >= x0 ? 1 : -1;
      pose = k < 1 && t >= t0 ? walkPose(t * Math.PI * 2 * (c.run ? 1.6 : 0.9), { run: c.run }) : breathe(POSES[at(c.p, t) || 'stand'] || POSES.stand, t, 1, c.x || 0);
    } else {
      const p = c.p || 'stand';
      pose = Array.isArray(p) ? posesAt(t, p) : POSES[p] || POSES.stand;
      if (!c.still) pose = breathe(pose, t, 1, (c.x || 0) * 0.01 + (c.s || 1));
    }
    const talk = c.talk ? talkAmount(info.globalT, info.shot.start + (c.talk[0] ?? 0), info.shot.start + (c.talk[1] ?? 99)) : 0;
    const rim = { color: M.rim, dir: c.rim || [0, -1] };
    if (c.inv) { // невидимый: едва заметный мерцающий силуэт
      const a = (c.inv === true ? 0.13 : c.inv) * (0.8 + 0.2 * Math.sin(t * 3 + (c.x || 0)));
      drawFigure(g, { x, y: GY + (c.y || 0), s: c.s ?? 1.6, facing, outfit, pose, rot: c.rot, expr: at(c.e || 'neutral', t), alpha: a, rim: { color: '#cfe6ff', dir: [0, -1], w: 3 }, shadow: false, prop: c.prop });
      continue;
    }
    drawFigure(g, { x, y: GY + (c.y || 0), s: c.s ?? 1.6, facing, outfit, pose, rot: c.rot, expr: at(c.e || 'neutral', t), talk, look: c.look,
      blink: c.noblink ? false : (t + (c.x || 0) * 0.01) % (2.9 + ((c.s || 1) * 0.7)) > 2.78, rim, prop: c.prop, trail: c.trail, alpha: c.alpha });
    if (talk > 0) { const hy = GY - 205 * (c.s ?? 1.6); FX.rings(g, x + 6 * facing, hy, t, { count: 2, r0: 40 * (c.s ?? 1.6), r1: 70 * (c.s ?? 1.6), color: '#fff3e0', a: 0.18 }); }
  }
}

function drawProps(g, v, t, GY, CX, M) {
  for (const p of v.pr || []) {
    const x = CX + (p.x || 0);
    if (p.t === 'table') { const top = table(g, x, GY); if (p.cups) p.cups.forEach((dx) => cup(g, x + dx, top, 1.3)); }
    if (p.t === 'bench') bench(g, x, GY, p.s || 1.6);
    if (p.t === 'car') car(g, x, GY + 8, { color: p.c || '#d64a3a', s: p.s || 0.95, dir: p.dir ?? -1, M });
    if (p.t === 'chair') { g.save(); g.translate(x, 0); g.scale(p.f || 1, 1); FX.chair(g, 0, GY, p.s || 1.6, '#24181e'); g.restore(); }
    if (p.t === 'cat') cat(g, x, GY + (p.y || 0), p.s || 1, p.f || 1, t, p.pose || 'sit', M);
    if (p.t === 'stickers') stickers(g, CX, GY, p.n || 9, p.at ?? 0, t, p.wall ?? 1);
    if (p.t === 'float') floatItem(g, x, GY - (p.h || 200) + Math.sin(t * 2 + x) * 8, p.k, p.s || 1, t, p.label);
    if (p.t === 'bag') { for (let i = 0; i < 6; i++) { const k = clamp((t - (p.at || 0)) * 1.2); circle(g, x + i * 30 - 70 + k * i * 40, GY - 40 + k * (i % 2) * 10 - 10, 18, '#f29a2a'); } rr(g, x - 60, GY - 120, 110, 110, 10); g.fillStyle = '#e8e2d4'; g.fill(); }
    if (p.t === 'stroller') { rr(g, x - 70, GY - 170, 140, 100, 20); g.fillStyle = '#5a6fc4'; g.fill(); circle(g, x - 50, GY - 20, 20, '#141414'); circle(g, x + 50, GY - 20, 20, '#141414'); seg(g, [[x + 70, GY - 160], [x + 130, GY - 230]], 8, '#2a2c34'); }
    if (p.t === 'pigeon') { const px = x, py = GY - (p.h || 360); g.fillStyle = '#8a90a0'; g.beginPath(); g.ellipse(px, py, 28, 18, 0, 0, 7); g.fill(); circle(g, px + 22, py - 14, 11, '#8a90a0'); poly(g, [[px + 32, py - 14], [px + 42, py - 10], [px + 32, py - 8]], '#e0a040'); circle(g, px + 24, py - 16, 3, '#141414'); }
    if (p.t === 'turnstile') { rr(g, x - 30, GY - 160, 60, 160, 8); g.fillStyle = '#9aa0aa'; g.fill(); seg(g, [[x + 30, GY - 110], [x + 140, GY - 110]], 10, '#c9ccd4'); circle(g, x, GY - 140, 10, '#3fd07a'); }
    if (p.t === 'carrier') { const s = p.s || 1; rr(g, x - 80 * s, GY - 230 * s, 160 * s, 90 * s, 30 * s); g.fillStyle = '#8fd0f2'; g.fill(); seg(g, [[x - 60 * s, GY - 228 * s], [x, GY - 300 * s], [x + 60 * s, GY - 228 * s]], 8 * s, '#3a5280'); }
  }
}

// ── кот Шахмат: чёрный, с белой «шахматной» манишкой
function cat(g, x, GY, s, f, t, pose, M) {
  g.save(); g.translate(x, GY); g.scale(f * s, s);
  const ink = '#121216', rim = M?.rim || '#ffc68a';
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 70, 9, 0, 0, 7); g.fill();
  const tail = Math.sin(t * 3) * 0.3;
  seg(g, [[-50, -20], [-90, -40 - 30 * tail], [-100, -90]], 10, ink);
  if (pose === 'walk') { const ph = t * 8; for (const [dx, k] of [[-30, 0], [30, Math.PI]]) seg(g, [[dx, -40], [dx + Math.sin(ph + k) * 12, 0]], 9, ink); g.fillStyle = ink; g.beginPath(); g.ellipse(0, -55, 62, 30, 0, 0, 7); g.fill(); circle(g, 58, -82, 30, ink); }
  else { g.fillStyle = ink; g.beginPath(); g.ellipse(-6, -50, 48, 52, 0, 0, 7); g.fill(); circle(g, 18, -112, 32, ink); }
  const hx = pose === 'walk' ? 58 : 18, hy = pose === 'walk' ? -82 : -112;
  poly(g, [[hx - 26, hy - 14], [hx - 18, hy - 46], [hx - 4, hy - 22]], ink); poly(g, [[hx + 4, hy - 22], [hx + 18, hy - 46], [hx + 26, hy - 14]], ink);
  g.strokeStyle = alpha(rim, 0.9); g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, 32, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
  circle(g, hx - 10, hy - 2, 5, '#c9f06a'); circle(g, hx + 12, hy - 2, 5, '#c9f06a');
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f4efe6' : '#2a2a30'; g.fillRect(hx - 12 + (i % 2) * 12, hy + 30 + Math.floor(i / 2) * 12, 12, 12); }
  g.restore();
}
// жёлтые стикеры «МАКСИМ СУЩЕСТВУЕТ» по стенам
function stickers(g, CX, GY, n, t0, t, wallK) {
  const pts = [[-700, -520], [-420, -700], [-120, -560], [180, -720], [420, -540], [700, -650], [-560, -330], [300, -340], [620, -300], [-260, -380], [40, -420], [-860, -620]];
  for (let i = 0; i < Math.min(n, pts.length); i++) {
    const k = ease.outBack(clamp((t - t0 - i * 0.12) / 0.3)); if (k <= 0) continue;
    const [dx, dy] = pts[i]; g.save(); g.translate(CX + dx, GY + dy * wallK); g.rotate(((i * 37) % 9 - 4) * 0.03); g.scale(k, k);
    rr(g, -60, -48, 120, 96, 4); g.fillStyle = '#f7d84a'; g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-60, 34, 120, 14);
    text(g, 'МАКСИМ', 0, -12, { size: 22, font: FONTS.ui, weight: 900, color: '#3a2a10' }); text(g, 'СУЩЕСТВУЕТ', 0, 14, { size: 17, font: FONTS.ui, weight: 900, color: '#3a2a10' });
    g.restore();
  }
}
// парящие предметы (их держит невидимый Максим)
function floatItem(g, x, y, k, s, t, label) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 1.3) * 0.08);
  if (k === 'brush') { rr(g, -8, -90, 16, 150, 8); g.fillStyle = '#5fd0e3'; g.fill(); rr(g, -12, -110, 24, 32, 6); g.fillStyle = '#ffffff'; g.fill(); }
  if (k === 'cup') { rr(g, -34, -50, 68, 70, 10); g.fillStyle = '#f2ece4'; g.fill(); seg(g, [[34, -36], [52, -22], [34, -8]], 8, '#f2ece4'); g.fillStyle = '#6a4028'; g.fillRect(-28, -50, 56, 8); for (let i = 0; i < 3; i++) seg(g, [[-12 + i * 12, -60 - ((t * 30 + i * 10) % 30)], [-10 + i * 12, -80 - ((t * 30 + i * 10) % 30)]], 4, 'rgba(255,255,255,.4)'); }
  if (k === 'notebook') { rr(g, -70, -50, 140, 100, 6); g.fillStyle = '#3a6ea5'; g.fill(); rr(g, -62, -42, 124, 84, 4); g.fillStyle = '#fbf8f1'; g.fill(); for (let i = 0; i < 4; i++) seg(g, [[-50, -24 + i * 18], [50, -24 + i * 18]], 2, '#9ab'); }
  if (k === 'envelope') { rr(g, -90, -55, 180, 110, 6); g.fillStyle = '#f4efe4'; g.fill(); poly(g, [[-90, -55], [0, 5], [90, -55]], '#e2dccf'); if (label) text(g, label, 0, 32, { size: 18, font: FONTS.ui, weight: 900, color: '#c0453a' }); }
  if (k === 'phone') { rr(g, -40, -76, 80, 152, 12); g.fillStyle = '#0c0d12'; g.fill(); rr(g, -34, -68, 68, 136, 8); g.fillStyle = '#1d2a44'; g.fill(); glow(g, 0, 0, 120, '#7fb8ff', 0.3); }
  if (k === 'shawarma') { rr(g, -30, -80, 60, 160, 26); g.fillStyle = '#e8d2a8'; g.fill(); g.fillStyle = '#c0453a'; g.fillRect(-26, -80, 52, 20); }
  g.restore();
}

// ── вставки (крупно предмет на размытом фоне)
const INS = {
  phone(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.52, w = 330, h = 600;
    rr(g, cx - w / 2 - 16, cy - h / 2 - 16, w + 32, h + 32, 46); g.fillStyle = '#0c0d12'; g.fill();
    g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#1d2a44', '#0f1626']); rr(g, cx - w / 2, cy - h / 2, w, h, 34); g.fill();
    glow(g, cx, cy, 420, '#7fb8ff', 0.18);
    const L = v.lines || [];
    L.forEach((s, i) => text(g, s, cx, cy - 60 + i * 110, { size: i ? 52 : 120, font: FONTS.ui, weight: 900, color: i ? '#cfd8ea' : (t > (v.flip ?? 99) ? '#ff6f61' : '#ffffff'), glow: 16, glowColor: 'rgba(120,180,255,.5)' }));
    if (v.flip != null && t > v.flip) FX.rings(g, cx, cy - 60, t - v.flip, { count: 2, r0: 80, r1: 260, color: '#ff8f80', a: 0.4 });
    // рука
    seg(g, [[cx + 120, cy + 260], [E.W + 200, E.H + 200]], 90, '#0e0b12'); seg(g, [[cx + 260, cy + 360], [E.W + 300, E.H + 300]], 120, CAST.max.color);
  },
  gallery(g, t) {
    const cx = E.W / 2, cy = E.H * 0.52, w = 360, h = 620;
    rr(g, cx - w / 2 - 16, cy - h / 2 - 16, w + 32, h + 32, 46); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - w / 2, cy - h / 2, w, h, 34); g.fillStyle = '#141a28'; g.fill();
    const cols = ['#f2b06a', '#7fc0e8', '#e88a8a', '#9fd8a8', '#c9a7e8', '#f2d27a'];
    const n = Math.floor(clamp(t / 2.2) * 18);
    for (let i = 0; i < 18; i++) { const col = i % 3, row = Math.floor(i / 3), x = cx - w / 2 + 16 + col * 112, y = cy - h / 2 + 90 + row * 84;
      const a = i < n ? 1 : 0.12; g.save(); g.globalAlpha = a; rr(g, x, y, 104, 76, 8); g.fillStyle = cols[i % 6]; g.fill();
      circle(g, x + 52, y + 34, 12, '#141414'); seg(g, [[x + 52, y + 46], [x + 52, y + 66]], 8, '#141414'); if (i % 2) { circle(g, x + 76, y + 36, 11, '#141414'); } g.restore(); }
    text(g, String(Math.round(clamp(t / 2.2) * 342)), cx, cy - h / 2 + 48, { size: 50, font: FONTS.ui, weight: 900, color: '#ffd47e' });
  },
  clock(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.48, r = 300;
    glow(g, cx, cy, 700, '#fff1d6', 0.14);
    FX.clock(g, cx, cy, r, v.time ?? (10 * 3600 + 17 * 60 + t), { face: '#f2ede4' });
    if (v.tick) FX.rings(g, cx, cy, t, { count: 2, r0: r, r1: r * 1.3, color: '#fff3e0', a: 0.18 });
  },
  envelope(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.5, w = 640, h = 380, open = v.open ? ease.out(prog(t, v.open, v.open + 0.8)) : 0;
    g.save(); g.translate(cx, cy); g.rotate(-0.04);
    rr(g, -w / 2, -h / 2, w, h, 16); g.fillStyle = '#f4efe4'; g.fill();
    if (open > 0) { rr(g, -w / 2 + 40, -h / 2 - 220 * open, w - 80, h - 40, 10); g.fillStyle = '#ffffff'; g.fill(); text(g, v.note || '', 0, -h / 2 - 220 * open + 110, { size: 44, font: FONTS.ui, weight: 900, color: '#2a2630' }); }
    poly(g, [[-w / 2, -h / 2], [0, open > 0 ? -h / 2 - 160 * open : 20], [w / 2, -h / 2]], shade('#f4efe4', -0.08));
    seg(g, [[-w / 2, h / 2], [-40, 0]], 3, '#d8d0c0'); seg(g, [[w / 2, h / 2], [40, 0]], 3, '#d8d0c0');
    text(g, v.label || 'ПРЕМИЯ', 0, h / 2 - 70, { size: 64, font: FONTS.title, weight: 700, color: '#c0453a', spacing: 6 });
    g.restore();
  },
  drops(g, t) {
    const cx = E.W / 2, cy = E.H * 0.5;
    glow(g, cx, cy, 600, '#9fe0ff', 0.18);
    rr(g, cx - 110, cy - 160, 220, 340, 40); g.fillStyle = '#e8f6fb'; g.fill(); rr(g, cx - 60, cy - 250, 120, 100, 20); g.fillStyle = '#3fd07a'; g.fill();
    rr(g, cx - 90, cy - 60, 180, 140, 14); g.fillStyle = '#ffffff'; g.fill();
    text(g, 'КАПЛИ', cx, cy - 20, { size: 46, font: FONTS.title, weight: 700, color: '#2a6a8a' });
    text(g, '490 руб.', cx, cy + 40, { size: 40, font: FONTS.ui, weight: 900, color: '#c0453a' });
  },
  stopwatch(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.53, r = 280, sec = (v.from ?? 0) + t * (v.speed ?? 30);
    glow(g, cx, cy, 700, '#ffd47e', 0.12);
    rr(g, cx - 40, cy - r - 70, 80, 50, 10); g.fillStyle = '#c9ccd4'; g.fill();
    circle(g, cx, cy, r + 24, '#c9ccd4'); circle(g, cx, cy, r, '#f4f1ea');
    for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2; const L = i % 5 ? 14 : 30; seg(g, [[cx + Math.sin(a) * (r - 10), cy - Math.cos(a) * (r - 10)], [cx + Math.sin(a) * (r - 10 - L), cy - Math.cos(a) * (r - 10 - L)]], i % 5 ? 3 : 6, '#2a2630'); }
    const a = (sec / 60) * Math.PI * 2; seg(g, [[cx, cy], [cx + Math.sin(a) * r * 0.82, cy - Math.cos(a) * r * 0.82]], 8, '#e04a3a'); circle(g, cx, cy, 16, '#2a2630');
    const mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
    text(g, `${mm}:${String(ss).padStart(2, '0')}`, cx, cy + r * 0.45, { size: 78, font: FONTS.ui, weight: 900, color: '#2a2630' });
  },
  calendar(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.5, w = 460, h = 520;
    rr(g, cx - w / 2, cy - h / 2, w, h, 18); g.fillStyle = '#f2ede4'; g.fill(); g.fillStyle = '#c0453a'; rr(g, cx - w / 2, cy - h / 2, w, 130, 18); g.fill(); g.fillRect(cx - w / 2, cy - h / 2 + 90, w, 40);
    const k = v.flip != null ? ease.out(prog(t, v.flip, v.flip + 0.5)) : 0;
    text(g, k > 0.5 ? String(v.to) : String(v.from), cx, cy + 60, { size: 170, font: FONTS.ui, weight: 900, color: '#2a2630', alpha: Math.abs(1 - 2 * k) * 0.9 + 0.1 });
    text(g, 'ГОД', cx, cy - h / 2 + 66, { size: 54, font: FONTS.title, weight: 700, color: '#ffffff', spacing: 8 });
  },
  cupTop(g, t) {
    const cx = E.W / 2, cy = E.H * 0.52, r = 260;
    circle(g, cx, cy, r + 70, '#f4efe4'); circle(g, cx, cy, r, '#f4efe4'); circle(g, cx, cy, r - 24, '#c08a5a'); circle(g, cx, cy, r - 60, '#d9a874');
    g.strokeStyle = '#f4e8d8'; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy + 10, 90, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(cx, cy + 60, 90, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    // отражение лица в кофе
    circle(g, cx + Math.sin(t) * 6, cy - 10, 60, alpha('#141414', 0.35));
  },
  notify(g, t, v) { // белый экран уведомления: текст и зелёная кнопка «Принять»
    const cx = E.W / 2, cy = E.H * 0.52, w = 420, h = 720;
    rr(g, cx - w / 2 - 18, cy - h / 2 - 18, w + 36, h + 36, 50); g.fillStyle = '#0c0d12'; g.fill();
    rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.fillStyle = '#ffffff'; g.fill(); glow(g, cx, cy, 700, '#ffffff', 0.18);
    const L = v.lines || [];
    L.forEach((ln, i) => { const a = clamp((t - (v.step || 0.6) * i) / 0.3); text(g, ln, cx, cy - h / 2 + 110 + i * 64, { size: i === 0 ? 34 : 30, font: FONTS.ui, weight: 900, color: '#1a1a22', alpha: a }); });
    if (v.button !== false) { const a = clamp((t - (v.btnAt ?? 0.4)) / 0.3), press = v.press != null && t > v.press ? 0.92 : 1; g.save(); g.translate(cx, cy + 140); g.scale(press, press); g.globalAlpha = a; rr(g, -150, -46, 300, 92, 46); g.fillStyle = '#3fd07a'; g.fill(); glow(g, 0, 0, 220, '#3fd07a', 0.35); text(g, 'ПРИНЯТЬ', 0, 2, { size: 40, font: FONTS.ui, weight: 900, color: '#ffffff' }); g.restore(); }
    if (v.small !== false) for (let i = 0; i < 12; i++) { g.fillStyle = alpha('#9aa0aa', 0.6); g.fillRect(cx - w / 2 + 40, cy + 220 + i * 9, w - 80 - (i % 3) * 30, 3); }
    if (v.press != null && t > v.press) FX.rings(g, cx, cy + 140, t - v.press, { count: 2, r0: 60, r1: 260, color: '#3fd07a', a: 0.5 });
  },
  terms(g, t, v) { // мелкий шрифт: пункт договора крупно
    g.fillStyle = '#f6f4ef'; rr(g, E.W / 2 - 640, E.H * 0.12, 1280, E.H * 0.76, 20); g.fill();
    text(g, v.head || '', E.W / 2 - 560, E.H * 0.22, { size: 46, font: FONTS.ui, weight: 900, color: '#c0453a', align: 'left' });
    (v.lines || []).forEach((ln, i) => { const a = clamp((t - 0.3 - i * (v.step || 0.9)) / 0.4); text(g, ln, E.W / 2 - 560, E.H * 0.34 + i * 66, { size: 40, font: FONTS.ui, weight: 800, color: '#22222a', align: 'left', alpha: a }); });
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(E.W / 2 - 560, E.H * 0.72 + i * 16, 1100 - (i % 3) * 120, 5); }
  },
  notebook(g, t, v) { // блокнот Егора крупно, записи от руки
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.04);
    rr(g, -420, -300, 840, 600, 16); g.fillStyle = '#3a6ea5'; g.fill(); rr(g, -396, -280, 792, 560, 10); g.fillStyle = '#fbf8f1'; g.fill();
    for (let i = 0; i < 9; i++) seg(g, [[-360, -200 + i * 56], [360, -200 + i * 56]], 2, alpha('#6a8ab0', 0.35));
    seg(g, [[-300, -280], [-300, 280]], 3, alpha('#e04a3a', 0.5));
    (v.lines || []).forEach((ln, i) => { const k = clamp((t - 0.3 - i * 0.8) / 0.6); g.save(); g.beginPath(); g.rect(-280, -260 + i * 76, 640 * k, 80); g.clip(); text(g, ln, -270, -200 + i * 76, { size: i === 0 && v.big ? 62 : 48, font: FONTS.serif, weight: 900, italic: true, color: '#1d3a6a', align: 'left' }); g.restore(); });
    g.restore();
  },
  chat(g, t, v) { // рабочий чат: список участников, «Был в сети давно»
    const cx = E.W / 2, cy = E.H * 0.52, w = 440, h = 760;
    rr(g, cx - w / 2 - 18, cy - h / 2 - 18, w + 36, h + 36, 50); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.fillStyle = '#f2f4f8'; g.fill();
    text(g, 'РАБОЧИЙ ЧАТ · АВТОСАЛОН', cx, cy - h / 2 + 60, { size: 24, font: FONTS.ui, weight: 900, color: '#3a3f4f' });
    const names = v.names || ['Сергей Николаевич', 'Ольга', 'Денис', 'Максим', 'Стажёр Артём'];
    names.forEach((n, i) => { const y = cy - h / 2 + 140 + i * 110, me = n === 'Максим'; if (me) { rr(g, cx - w / 2 + 10, y - 44, w - 20, 92, 14); g.fillStyle = alpha('#ffd47e', 0.35 + 0.15 * Math.sin(t * 4)); g.fill(); }
      circle(g, cx - w / 2 + 60, y, 32, me ? '#d64a33' : ['#3a6ea5', '#8a5ad6', '#3fb950', '#f29ac0'][i % 4]); text(g, n, cx - w / 2 + 110, y - 12, { size: 28, font: FONTS.ui, weight: 900, color: '#22222a', align: 'left' });
      text(g, me ? 'был в сети давно' : 'в сети', cx - w / 2 + 110, y + 22, { size: 22, font: FONTS.ui, weight: 800, color: me ? '#9aa0aa' : '#3fb950', align: 'left' }); });
  },
  call(g, t, v) { // входящий/исходящий звонок
    const cx = E.W / 2, cy = E.H * 0.52, w = 400, h = 720;
    rr(g, cx - w / 2 - 18, cy - h / 2 - 18, w + 36, h + 36, 50); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#2a3150', '#141a2c']); g.fill();
    circle(g, cx, cy - 140, 80, '#8a5ad6'); text(g, v.name || 'МАМА', cx, cy - 20, { size: 48, font: FONTS.ui, weight: 900, color: '#ffffff' }); text(g, v.sub || 'вызов…', cx, cy + 34, { size: 28, font: FONTS.ui, weight: 800, color: '#9fb6d8' });
    const end = v.end != null && t > v.end; circle(g, cx, cy + 240, 52, end ? '#e04a3a' : '#3fd07a'); FX.rings(g, cx, cy - 140, t, { count: 3, r0: 90, r1: 180, color: '#cfd8ea', a: end ? 0 : 0.3 });
    if (end) text(g, 'ВЫЗОВ ЗАВЕРШЁН', cx, cy + 120, { size: 30, font: FONTS.ui, weight: 900, color: '#e04a3a' });
  },
  voice(g, t, v) { // голосовое сообщение: волна
    const cx = E.W / 2, cy = E.H * 0.5;
    rr(g, cx - 560, cy - 110, 1120, 220, 110); g.fillStyle = '#e9f6e4'; g.fill(); circle(g, cx - 450, cy, 64, '#3fb950'); poly(g, [[cx - 470, cy - 30], [cx - 470, cy + 30], [cx - 422, cy]], '#ffffff');
    for (let i = 0; i < 46; i++) { const x = cx - 360 + i * 17, a = Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 70 + 10, on = i / 46 < clamp(t / Math.max(1, v.dur || 4)); seg(g, [[x, cy - a / 2], [x, cy + a / 2]], 9, on ? '#3fb950' : '#a8c8a0'); }
    text(g, v.label || 'Егор → Егор', cx, cy - 170, { size: 40, font: FONTS.ui, weight: 900, color: S().ui.cream });
  },
  digital(g, t, v) { // крупные часы на телефоне 23:59
    const cx = E.W / 2, cy = E.H * 0.5; glow(g, cx, cy, 700, '#ff6f61', 0.12);
    text(g, v.s || '23:59', cx, cy, { size: 260, font: FONTS.ui, weight: 900, color: v.color || '#ffffff', glow: 30, glowColor: 'rgba(255,120,100,.6)' });
    if (v.sub) text(g, v.sub, cx, cy + 190, { size: 46, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 3 });
  },
  photo(g, t, v) { // фотография двух мальчиков / двух парней
    const cx = E.W / 2, cy = E.H * 0.5; g.save(); g.translate(cx, cy); g.rotate(0.03);
    rr(g, -360, -260, 720, 520, 10); g.fillStyle = '#fbf8f1'; g.fill(); rr(g, -330, -230, 660, 400, 4); g.fillStyle = linGrad(g, 0, -230, 0, 170, v.sea ? ['#8fb8e8', '#f2c49a'] : ['#c8d8b0', '#8fb070']); g.fill();
    for (const [dx, col, fade] of [[-90, CAST.egor.color, 0], [110, CAST.max.color, v.fade || 0]]) { g.globalAlpha = 1 - fade * clamp(t / 2); circle(g, dx, -60, 56, '#141414'); rr(g, dx - 60, 0, 120, 170, 30); g.fillStyle = col; g.fill(); if (dx < 0) { g.fillStyle = CAST.egor.headColor; g.beginPath(); g.ellipse(dx, -86, 58, 40, 0, Math.PI, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
    if (v.cap) text(g, v.cap, 0, 215, { size: 30, font: FONTS.serif, weight: 900, italic: true, color: '#3a3a44' });
    g.restore();
  },
  board(g, t, v) { // доска «Лучший продавец месяца»
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 380, cy - 300, 760, 600, 16); g.fillStyle = '#2a2c3a'; g.fill(); rr(g, cx - 350, cy - 270, 700, 540, 10); g.fillStyle = '#c9a86a'; g.fill();
    text(g, 'ЛУЧШИЙ ПРОДАВЕЦ МЕСЯЦА', cx, cy - 210, { size: 38, font: FONTS.ui, weight: 900, color: '#2a2630' });
    if (v.empty) { rr(g, cx - 140, cy - 150, 280, 340, 8); g.strokeStyle = 'rgba(0,0,0,.25)'; g.setLineDash([12, 10]); g.lineWidth = 4; g.stroke(); g.setLineDash([]); }
    else { rr(g, cx - 140, cy - 150, 280, 340, 8); g.fillStyle = '#fbf8f1'; g.fill(); circle(g, cx, cy - 40, 70, '#141414'); rr(g, cx - 90, cy + 40, 180, 140, 40); g.fillStyle = CAST.max.color; g.fill(); text(g, 'МАКСИМ', cx, cy + 230, { size: 34, font: FONTS.ui, weight: 900, color: '#2a2630' }); }
  },
  hands(g, t) { // руки держат малыша
    const cx = E.W / 2, gy = E.H * 0.78;
    glow(g, cx, E.H * 0.45, 700, '#ffd59a', 0.2);
    seg(g, [[-200, E.H + 100], [cx - 180, gy - 120]], 90, CAST.max.color); seg(g, [[E.W + 200, E.H + 100], [cx + 180, gy - 120]], 90, CAST.max.color);
    circle(g, cx - 180, gy - 120, 34, '#0e0b12'); circle(g, cx + 180, gy - 120, 34, '#0e0b12');
  },
};

// ── схемы (синий «чертёж») для научного блока
const BP = {
  blink(g, t, v) { // глаз моргает, счётчик 15–20 раз в минуту
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W * 0.36, cy = E.H * 0.5;
    const ph = (t * 0.33) % 1, lid = ph < 0.08 ? 1 - Math.abs(ph / 0.04 - 1) : 0;
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, 240, 130 * (1 - lid), 0, 0, Math.PI * 2); g.stroke();
    if (lid < 0.8) { ring(g, cx, cy, 80 * (1 - lid), 6, c); circle(g, cx, cy, 34 * (1 - lid), c); }
    const n = Math.min(v.to ?? 20, Math.floor(t * 4.5) + 1);
    text(g, v.big || `${n}`, E.W * 0.72, cy - 30, { size: 170, font: FONTS.ui, weight: 900, color: gold, glow: 20, glowColor: alpha(gold, 0.5) });
    text(g, v.sub || 'РАЗ В МИНУТУ', E.W * 0.72, cy + 90, { size: 46, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  closed(g, t) { // 10% времени глаза закрыты
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
    const x0 = 260, x1 = E.W - 260, y = E.H * 0.5; const p = ease.inOut(prog(t, 0.3, 2.2));
    text(g, 'ВРЕМЯ БОДРСТВОВАНИЯ', x0, y - 110, { size: 40, font: FONTS.ui, weight: 900, color: c, align: 'left', spacing: 2 });
    rr(g, x0, y - 36, x1 - x0, 72, 36); g.fillStyle = alpha(c, 0.15); g.fill();
    rr(g, x0, y - 36, (x1 - x0) * 0.9 * p, 72, 36); g.fillStyle = alpha(c, 0.6); g.fill();
    rr(g, x0 + (x1 - x0) * 0.9, y - 36, (x1 - x0) * 0.1 * clamp((p - 0.95) * 20), 72, 36); g.fillStyle = gold; g.fill();
    text(g, 'ГЛАЗА ОТКРЫТЫ  90%', x0 + 30, y + 110, { size: 38, font: FONTS.ui, weight: 900, color: c, align: 'left' });
    text(g, '10%  ЗАКРЫТЫ', x1, y + 110, { size: 44, font: FONTS.ui, weight: 900, color: gold, align: 'right', glow: 14, glowColor: alpha(gold, 0.5), alpha: clamp((p - 0.9) * 10) });
  },
  edit(g, t) { // мозг вырезает кадры: плёнка, из которой выпадают тёмные кадры
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, y = E.H * 0.5, fw = 220;
    const off = (t * 160) % fw;
    for (let i = -2; i < 11; i++) { const x = i * fw - off; const dark = i % 4 === 2; const drop = dark ? ease.in(clamp(((t * 160 + x) % 900) / 900)) * 0 : 0;
      rr(g, x + 10, y - 110 + drop, fw - 20, 220, 10); g.fillStyle = dark ? '#05070d' : alpha(c, 0.18); g.fill(); g.strokeStyle = alpha(c, 0.7); g.lineWidth = 3; g.stroke();
      if (dark) { seg(g, [[x + 4, y - 140], [x + 4, y + 140]], 4, gold); seg(g, [[x + fw - 4, y - 140], [x + fw - 4, y + 140]], 4, gold); text(g, '✂', x + 4, y - 170, { size: 40, color: gold, font: FONTS.ui }); }
      else { circle(g, x + fw / 2, y - 20, 34, alpha(c, 0.8)); seg(g, [[x + fw / 2, y + 14], [x + fw / 2, y + 70]], 12, alpha(c, 0.8)); } }
    text(g, 'МОЗГ ВЫРЕЗАЕТ МОРГАНИЯ', E.W / 2, E.H * 0.2, { size: 52, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  years(g, t, v) { // каждое моргание = год: счётчик возраста
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    const p = ease.inOut(prog(t, 0.4, (v.dur || 3) - 0.3)), age = Math.round(lerp(v.from ?? 21, v.to ?? 36, p));
    text(g, v.title || '1 МОРГАНИЕ = 1 ГОД', E.W / 2, E.H * 0.24, { size: 58, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    text(g, `${age}`, E.W / 2, E.H * 0.55, { size: 220, font: FONTS.ui, weight: 900, color: p > 0.5 ? acc : gold, glow: 24, glowColor: alpha(acc, 0.5) });
    text(g, v.sub || 'ЛЕТ ЗА ОДНУ МИНУТУ', E.W / 2, E.H * 0.75, { size: 44, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    UI.lineFigure(g, { x: E.W * 0.2, y: E.H * 0.72, s: 1.4 - 0.25 * p, pose: p > 0.6 ? POSES.sad : POSES.stand, color: alpha(c, 0.9) });
  },
  light(g, t) { // свет проходит сквозь невидимое тело
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cy = E.H * 0.55;
    UI.lineFigure(g, { x: E.W / 2, y: cy + 200, s: 1.6, color: alpha(c, 0.35) });
    for (let i = 0; i < 6; i++) { const y = cy - 220 + i * 70, k = ((t * 0.6 + i * 0.13) % 1); seg(g, [[200, y], [200 + (E.W - 400) * k, y]], 4, alpha(gold, 0.8)); glow(g, 200 + (E.W - 400) * k, y, 30, gold, 0.8); }
    text(g, 'СВЕТ ПРОХОДИТ НАСКВОЗЬ', E.W / 2, E.H * 0.16, { size: 52, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  eye(g, t) { // сетчатка задерживает свет
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W * 0.58, cy = E.H * 0.55;
    ring(g, cx, cy, 220, 6, c); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 200, Math.PI * 0.6, Math.PI * 1.4, true); g.stroke();
    circle(g, cx - 210, cy, 30, alpha(c, 0.6)); g.strokeStyle = gold; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, 215, -0.8, 0.8); g.stroke();
    const k = clamp(t / 1.6); for (let i = -2; i <= 2; i++) { const y0 = cy + i * 30; seg(g, [[160, y0], [lerp(160, cx + 200, k), lerp(y0, cy + i * 60, k)]], 4, alpha(gold, 0.8)); }
    text(g, 'СЕТЧАТКА', cx + 330, cy - 140, { size: 44, font: FONTS.ui, weight: 900, color: gold });
    text(g, 'видим, потому что свет задерживается', E.W / 2, E.H * 0.16, { size: 44, font: FONTS.ui, weight: 900, color: c });
  },
  blind(g, t) { // невидимый = слепой
    UI.blueprint(g); const c = UI.bpStroke(), acc = S().ui.accent;
    UI.lineFigure(g, { x: E.W / 2, y: E.H * 0.82, s: 1.8, color: alpha(c, 0.5) });
    const hy = E.H * 0.82 - 208 * 1.8; seg(g, [[E.W / 2 - 60, hy], [E.W / 2 + 60, hy]], 14, acc); 
    text(g, 'НЕВИДИМКА БЫЛ БЫ СЛЕПЫМ', E.W / 2, E.H * 0.16, { size: 54, font: FONTS.ui, weight: 900, color: acc, glow: 14, glowColor: alpha(acc, 0.5) });
  },
  cloak(g, t, v) { // плащ-невидимка из метаматериалов, 2006
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W * 0.5, cy = E.H * 0.55;
    for (let r = 80; r <= 260; r += 30) ring(g, cx, cy, r, 3, alpha(c, 0.5));
    if (!v.small) { for (let i = -4; i <= 4; i++) { g.strokeStyle = alpha(gold, 0.8); g.lineWidth = 3; g.beginPath(); for (let x = 100; x < E.W - 100; x += 10) { const d = Math.max(0, 300 - Math.abs(x - cx)) / 300; const y = cy + i * 50 + (i === 0 ? 0 : Math.sign(i) * d * d * 120) * Math.min(1, Math.abs(i) / 2); x === 100 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } }
    rr(g, cx - 40, cy - 60, 80, 120, 10); g.fillStyle = alpha(c, 0.3); g.fill();
    text(g, v.small ? 'ТОЛЬКО МИКРОВОЛНЫ · МАЛЕНЬКИЙ ЦИЛИНДР' : '2006 · УНИВЕРСИТЕТ ДЬЮКА', E.W / 2, E.H * 0.14, { size: 46, font: FONTS.ui, weight: 900, color: c, spacing: 2 });
    text(g, 'МЕТАМАТЕРИАЛЫ', E.W / 2, E.H * 0.9, { size: 40, font: FONTS.ui, weight: 900, color: gold, spacing: 3 });
  },
  spot(g, t, v) { // эффект прожектора
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    FX.lightCone(g, E.W / 2, 0, { angle: Math.PI / 2, spread: 0.25, len: E.H * 0.8, color: gold, a: 0.12 });
    UI.lineFigure(g, { x: E.W / 2, y: E.H * 0.8, s: 1.4, color: gold });
    text(g, 'ЭФФЕКТ ПРОЖЕКТОРА', E.W / 2, E.H * 0.12, { size: 56, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    if (v.bars) UI.compareBars(g, t, { rows: [{ label: 'КАЖЕТСЯ, ЗАМЕТИЛИ', v: 0.5 }, { label: 'ЗАМЕТИЛИ НА ДЕЛЕ', v: 0.25 }], x: 160, y: E.H * 0.42, w: 560 });
  },
  forget(g, t) { // порядок забывания
    UI.blueprint(g); const c = UI.bpStroke(), acc = S().ui.accent;
    const L = ['НЕЗНАКОМЫЕ', 'КОЛЛЕГИ', 'СЕМЬЯ', 'САМЫЕ БЛИЗКИЕ'];
    L.forEach((s, i) => { const k = clamp((t - i * 1.2) / 0.4), x = E.W * (0.16 + i * 0.23); ring(g, x, E.H * 0.5, 90, 5, k > 0.5 ? acc : alpha(c, 0.4)); UI.lineFigure(g, { x, y: E.H * 0.5 + 60, s: 0.55, color: alpha(c, 1 - 0.8 * k) }); text(g, s, x, E.H * 0.5 + 150, { size: 32, font: FONTS.ui, weight: 900, color: k > 0.5 ? acc : c });
      if (i < 3) seg(g, [[x + 110, E.H * 0.5], [x + E.W * 0.23 - 110, E.H * 0.5]], 3, alpha(c, 0.4)); });
    text(g, 'МИР ЗАБЫВАЕТ ПО ОЧЕРЕДИ', E.W / 2, E.H * 0.16, { size: 50, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  savings(g, t) { // начальник откладывал из зарплаты
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
    for (let i = 0; i < 8; i++) { const k = clamp((t - i * 0.4) / 0.3), h = 60 + i * 34; rr(g, E.W * 0.18 + i * 160, E.H * 0.78 - h * k, 110, h * k, 8); g.fillStyle = alpha(gold, 0.7); g.fill(); text(g, `НЕД ${i + 1}`, E.W * 0.18 + i * 160 + 55, E.H * 0.83, { size: 24, font: FONTS.ui, weight: 900, color: c }); }
    text(g, 'ИЗ СВОЕЙ ЗАРПЛАТЫ — ТЕБЕ', E.W / 2, E.H * 0.16, { size: 50, font: FONTS.ui, weight: 900, color: gold, glow: 14, glowColor: alpha(gold, 0.5) });
  },
};

// ── веки (моргание): открываются в начале и/или закрываются в конце кадра
function lids(g, k) { if (k <= 0) return; const h = (E.H / 2 + 40) * k;
  g.fillStyle = '#000'; g.beginPath(); g.moveTo(-10, -10); g.lineTo(E.W + 10, -10); g.lineTo(E.W + 10, h - 80 * k); g.quadraticCurveTo(E.W / 2, h + 120 * k, -10, h - 80 * k); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-10, E.H + 10); g.lineTo(E.W + 10, E.H + 10); g.lineTo(E.W + 10, E.H - h + 80 * k); g.quadraticCurveTo(E.W / 2, E.H - h - 120 * k, -10, E.H - h + 80 * k); g.closePath(); g.fill(); }

function drawUI(g, v, t, dur) {
  for (const u of v.ui || []) {
    const t0 = u.at ?? 0.2, tl = t - t0; if (tl < 0 || (u.until != null && t > u.until)) continue;
    const a = ease.out(clamp(tl / 0.35)) * clamp((dur - t) / 0.3);
    if (u.k === 'badge') UI.badge(g, { str: u.s, a, size: u.size || V(46, 52) });
    if (u.k === 'readout') UI.readout(g, { label: u.label, value: u.s, x: u.x ?? V(140, 90), y: u.y ?? E.H - V(170, 620), a });
    if (u.k === 'big') UI.bigLine(g, tl, { str: u.s, dur: dur - t0, y: u.y ?? E.H * 0.82, size: u.size || V(76, 70), color: u.color });
    if (u.k === 'title') UI.titleCard(g, tl, { lines: u.lines, dur: dur - t0, y: u.y ?? E.H * 0.42 });
    if (u.k === 'thought') { // мысль героя — курсивом, мягко
      const s = u.size || 64; text(g, u.s, u.x ?? E.W / 2, u.y ?? E.H * 0.15, { size: s, font: FONTS.serif, weight: 900, italic: true, color: S().ui.cream, alpha: a, glow: 18, glowColor: 'rgba(255,170,90,.5)' }); }
  }
}

function endScreen(g, t, v) {
  const ui = S().ui;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1b1426', '#2a1a2e', '#4a2a2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.9, E.W * 0.45, '#ff9a5a', 0.3);
  const a1 = ease.out(prog(t, 0.2, 0.8));
  (v.q || []).forEach((s, i) => text(g, s, E.W / 2, 130 + i * 78, { size: 58, font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' }));
  const sp = ease.outBack(prog(t, v.subAt ?? 0.6, (v.subAt ?? 0.6) + 0.5));
  if (sp > 0) { g.save(); g.translate(E.W / 2, 400); g.scale(sp, sp); rr(g, -210, -42, 420, 84, 42); g.fillStyle = '#e0302a'; g.fill(); text(g, 'ПОДПИСАТЬСЯ', 0, 2, { size: 38, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore(); }
  UI.bubble(g, E.W / 2 - 330, 400, { w: 110, h: 60 });
  const cast = v.cast ? v.cast.map((k) => CAST[k]) : [CAST.boss, CAST.egor, CAST.max, CAST.baby]; const n = cast.length, gap = 220, y0 = E.H - 150;
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: 1.2, facing: 1, outfit: of, pose: POSES.relaxed, expr: 'smile', alpha: k, rim: { color: '#ffb070', dir: [0, -1] } }); });
}

function render(g, t, info, v) {
  const dur = info.dur;
  if (v.end) { endScreen(g, t, v.end); return; }
  if (v.bp) { BP[v.bp.k](g, t, { ...v.bp, dur }); drawUI(g, v, t, dur); return; }
  const cam = camOf(v, t, dur);
  if (v.face || v.ins) {
    const bgCam = { z: (v.bgz ?? 1.5) * cam.z, x: (v.bgx ?? -150) + cam.x, y: v.bgy ?? -120 };
    let M = mood(v.so?.mood || 'day');
    blurLayer(g, v.blur ?? 12, (g) => { M = drawSet(g, v, t, bgCam).M; });
    veil(g, '#120a10', v.veil ?? 0.3);
    if (v.face) {
      const f = v.face, r = (f.r ?? V(300, 330)) * (cam.z);
      const talk = f.talk ? talkAmount(info.globalT, info.shot.start + (f.talk[0] ?? 0), info.shot.start + (f.talk[1] ?? 99)) : 0;
      const [sx, sy] = v.cam?.shake ? shake(t, v.cam.shake, 9) : [0, 0];
      if (f.inv) { g.save(); g.globalAlpha = f.inv === true ? 0.16 : f.inv; }
      bigFace(g, E.W / 2 + (f.x ?? 0) + sx + (cam.x || 0) * 0.3, E.H * (f.y ?? 0.6) + sy, r, { outfit: { ...(CAST[f.w] || CAST.max), ...(f.of || {}) }, expr: at(f.e || 'neutral', t), talk, look: f.look,
        rimColor: M.rim, rimSide: f.side ?? -1, blink: f.noblink ? false : (t % 3.1) > 2.98, tilt: f.tilt });
      if (f.inv) g.restore();
      if (talk > 0) FX.rings(g, E.W / 2 + (f.x ?? 0), E.H * (f.y ?? 0.6), t, { count: 3, r0: r * 1.1, r1: r * 1.6, color: '#fff3e0', a: 0.3 });
      if (f.tear) { const ty = E.H * (f.y ?? 0.6) - r * 0.05 + ((t * 120) % (r * 0.9)); g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(E.W / 2 + (f.x ?? 0) + r * 0.36, ty, r * 0.05, r * 0.09, 0, 0, 7); g.fill(); }
    } else {
      g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 - (cam.x || 0) * 0.2, -E.H / 2); INS[v.ins.k](g, t, v.ins); g.restore();
    }
  } else if (v.split) {
    for (let side = 0; side < 2; side++) {
      const sv = v.split[side]; g.save(); g.beginPath(); g.rect(side * E.W / 2, 0, E.W / 2, E.H); g.clip(); g.translate(side ? E.W / 4 : -E.W / 4, 0);
      const { GY, CX, M } = drawSet(g, sv, t, camOf(sv, t, dur));
      layer(g, camOf(sv, t, dur), 1, (g) => { drawProps(g, sv, t, GY, CX, M); drawChars(g, sv, t, dur, info, GY, CX, M); });
      g.restore();
      text(g, sv.label || '', side * E.W / 2 + E.W / 4, V(110, 200), { size: V(56, 64), color: S().ui.cream, glow: 16, glowColor: 'rgba(255,160,80,.6)', spacing: 4 });
    }
    g.fillStyle = '#f4efe6'; g.fillRect(E.W / 2 - 3, 0, 6, E.H);
  } else {
    const { GY, CX, M } = drawSet(g, v, t, cam);
    layer(g, cam, 1, (g) => { drawProps(g, v, t, GY, CX, M); drawChars(g, v, t, dur, info, GY, CX, M); });
    if (v.fg) blurLayer(g, 10, (g) => { g.fillStyle = alpha(shade(M.dark, -0.3), 0.85); rr(g, v.fg === 'right' ? E.W - 260 : -60, E.H * 0.35, 320, E.H * 0.8, 120); g.fill(); }, cam, 1.6);
  }
  // атмосфера
  const fx = v.fx || {};
  if (fx.dust !== false) FX.dust(g, t, { count: 34, a: 0.3 });
  if (fx.drops) FX.drops(g, t, { count: 50, color: '#d8e4ff', rMax: 8, drift: 2 });
  if (fx.rain) FX.rain(g, t);
  if (fx.freeze) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  if (fx.warm) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,170,80,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  if (fx.rings) FX.rings(g, E.W / 2 + (fx.rings[0] || 0), E.H * (fx.rings[1] || 0.45), t, { count: 3, r0: 80, r1: 520, speed: 0.6, color: '#e8f0ff', a: 0.3 });
  if (fx.speed) FX.speedLines(g, t, { count: 50, a: 0.25 });
  drawUI(g, v, t, dur);
  // веки
  if (v.lid === 'open' || v.lid === 'both') lids(g, 1 - ease.out(prog(t, 0.05, 0.7)));
  if (v.lid === 'close' || v.lid === 'both') lids(g, ease.in(prog(t, dur - 0.55, dur - 0.05)));
  if (v.lid === 'blink') { const m = dur * (v.lidAt ?? 0.55); lids(g, t < m ? ease.in(prog(t, m - 0.35, m)) : 1 - ease.out(prog(t, m + 0.15, m + 0.6))); }
}

// регистрируем все кадры из раскадровки, у которых есть params.v (кадры со своим файлом — не трогаем)
for (const s of E.shots) {
  if (!s.params?.v || getShot(s.id)) continue;
  registerShot(s.id, { draw(g, t, info) { render(g, t, info, s.params.v); } });
}
