// lib/objs.js — предметы сюжета (2D), свечение телекинеза и надписи, которые всегда помещаются в свою рамку.
// Каждый предмет рисуется от точки (x, y) = низ-центр предмета, масштаб s (1 = в масштабе фигуры s=1).
import { E, S, clamp, lerp, ease, prog, alpha, shade, mix, seg, circle, ring, rr, poly, linGrad, radGrad, glow, text, measure, FONTS, rng } from '/engine/core.js';
import { soccerBall } from '/engine/rig2d.js';
import { POWER } from '../cast.js';

// ---------- надпись строго внутри прямоугольника (ширина и высота) ----------
export function fitText(g, str, cx, cy, maxW, maxH, o = {}) {
  const font = o.font || FONTS.ui, weight = o.weight || 900;
  const lines = String(str).split('\n');
  let size = o.size || maxH;
  const widest = Math.max(...lines.map((l) => measure(g, l, 100, font, weight) / 100));
  size = Math.min(size, (maxW * 0.9) / Math.max(0.01, widest), (maxH * 0.86) / (lines.length * 1.12));
  const lh = size * 1.12, y0 = cy - (lh * (lines.length - 1)) / 2;
  g.save(); g.beginPath(); g.rect(cx - maxW / 2, cy - maxH / 2, maxW, maxH); g.clip();
  lines.forEach((l, i) => text(g, l, cx, y0 + i * lh + size * 0.04, { size, font, weight, color: o.color || '#fff', glow: o.glow || 0, glowColor: o.glowColor, spacing: o.spacing || 0, alpha: o.alpha ?? 1 }));
  g.restore();
  return size;
}

// ---------- свечение телекинеза ----------
export function power(g, x, y, r, t, a = 1, seed = 1) {
  if (a <= 0.01) return;
  glow(g, x, y, r * 1.6, POWER, 0.45 * a);
  const R = rng(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const ph = R() * 6.28, sp = 0.6 + R() * 0.8, rad = r * (0.7 + R() * 0.6);
    const ang = ph + t * sp * 1.6, px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad * 0.7 - ((t * 30 * sp) % 30);
    circle(g, px, py, 2.4 + R() * 2.2, alpha('#e6d4ff', 0.75 * a));
  }
  g.restore();
}
// волны силы от головы героя к цели
export function powerWave(g, x1, y1, x2, y2, t, a = 1) {
  if (a <= 0.01) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const n = 5;
  for (let i = 0; i < n; i++) {
    const u = ((t * 0.9 + i / n) % 1);
    const px = lerp(x1, x2, u), py = lerp(y1, y2, u) - Math.sin(u * Math.PI) * 30;
    ring(g, px, py, 10 + u * 26, 3, alpha(POWER, a * 0.55 * (1 - u)));
  }
  g.restore();
}

const INK = () => S().ink;

// ---------- предметы ----------
export const OBJ = {
  phone(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -11 * s, -38 * s, 22 * s, 38 * s, 4 * s); g.fillStyle = '#15131b'; g.fill(); g.fillStyle = o.screen || '#8fd3ff'; g.fillRect(-8.5 * s, -35 * s, 17 * s, 31 * s); glow(g, 0, -19 * s, 30 * s, o.screen || '#8fd3ff', 0.35); if (o.label) fitText(g, o.label, 0, -19 * s, 16 * s, 12 * s, { color: '#15131b' }); g.restore(); },
  mug(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); const c = o.color || '#e85d5d'; rr(g, -16 * s, -36 * s, 32 * s, 36 * s, 5 * s); g.fillStyle = c; g.fill(); seg(g, [[16 * s, -28 * s], [26 * s, -20 * s], [16 * s, -10 * s]], 5 * s, c); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(4 * s, -32 * s, 10 * s, 30 * s); g.fillStyle = '#5a321e'; g.fillRect(-13 * s, -35 * s, 26 * s, 5 * s); g.restore(); },
  cup(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.fillStyle = '#f2ece4'; g.beginPath(); g.ellipse(0, -2 * s, 30 * s, 6 * s, 0, 0, 7); g.fill(); rr(g, -17 * s, -28 * s, 34 * s, 26 * s, 8 * s); g.fill(); seg(g, [[17 * s, -22 * s], [26 * s, -16 * s], [16 * s, -9 * s]], 4 * s, '#f2ece4'); g.fillStyle = '#a5582a'; g.fillRect(-14 * s, -28 * s, 28 * s, 4 * s);
    if (o.steam !== false) { const t = o.t || 0; for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3 * s; g.beginPath(); for (let k = 0; k <= 10; k++) { const yy = -32 * s - k * 5 * s, xx = (i - 1) * 9 * s + Math.sin(t * 3 + k * 0.6 + i) * 4 * s; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } }
    g.restore(); },
  egg(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.fillStyle = '#fbf1de'; g.beginPath(); g.ellipse(0, -13 * s, 10 * s, 13 * s, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(3 * s, -11 * s, 6 * s, 10 * s, 0, 0, 7); g.fill(); g.restore(); },
  splat(g, x, y, s, o) { const R = rng(o.seed || 3), dirt = !!o.dirt; g.fillStyle = dirt ? '#5a3a26' : '#fbf6ea'; g.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = (22 + R() * 18) * s; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8); } g.closePath(); g.fill(); if (dirt) { for (let i = 0; i < 7; i++) circle(g, x + (R() - 0.5) * 120 * s, y + (R() - 0.5) * 50 * s, (6 + R() * 8) * s, i % 2 ? '#c96f45' : '#3f7d3c'); circle(g, x + 20 * s, y - 10 * s, 7 * s, '#e2394f'); } else { circle(g, x + 3 * s, y, 12 * s, '#f5b82a'); for (let i = 0; i < 5; i++) circle(g, x + (R() - 0.5) * 80 * s, y + (R() - 0.5) * 60 * s, (3 + R() * 4) * s, '#fbf6ea'); } if (o.drip) seg(g, [[x, y + 14 * s], [x, y + (14 + 40 * clamp(o.drip)) * s]], 6 * s, '#f5b82a'); },
  pan(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.fillStyle = '#25232c'; g.beginPath(); g.ellipse(0, -8 * s, 34 * s, 9 * s, 0, 0, 7); g.fill(); g.fillRect(-34 * s, -10 * s, 68 * s, 10 * s); seg(g, [[30 * s, -8 * s], [78 * s, -14 * s]], 7 * s, '#25232c'); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-30 * s, -14 * s, 50 * s, 2 * s); g.restore(); },
  knife(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); poly(g, [[0, -3 * s], [46 * s, -3 * s], [56 * s, 2 * s], [0, 5 * s]], '#d7dde6'); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(4 * s, -2 * s, 40 * s, 2 * s); rr(g, -30 * s, -4 * s, 30 * s, 10 * s, 3 * s); g.fillStyle = '#2b2026'; g.fill(); g.restore(); },
  fridge(g, x, y, s, o) { const w = 110 * s, h = 230 * s, c = o.color || '#e9ecf1'; rr(g, x - w / 2, y - h, w, h, 10 * s); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + w * 0.3, y - h, w * 0.2, h); seg(g, [[x - w / 2 + 4 * s, y - h * 0.62], [x + w / 2 - 4 * s, y - h * 0.62]], 3 * s, shade(c, -0.25));
    const open = clamp(o.open || 0);
    if (open > 0) { g.fillStyle = '#fff6dc'; g.fillRect(x - w / 2 + 6 * s, y - h + 6 * s, w - 12 * s, h - 12 * s); glow(g, x, y - h * 0.5, h * 0.8, '#fff3cf', 0.5 * open); g.fillStyle = '#cfd6de'; for (let i = 1; i < 4; i++) g.fillRect(x - w / 2 + 8 * s, y - h + i * h * 0.22, w - 16 * s, 4 * s);
      if (!o.empty) { circle(g, x - 20 * s, y - h * 0.7, 12 * s, '#e2394f'); rr(g, x + 6 * s, y - h * 0.5 - 30 * s, 22 * s, 30 * s, 3 * s); g.fillStyle = '#f2f2f2'; g.fill(); circle(g, x - 18 * s, y - h * 0.3, 10 * s, '#8fd16a'); }
      const dw = w * (1 - open * 0.85); g.fillStyle = shade(c, -0.08); g.fillRect(x - w / 2 - (w - dw) * 0.15, y - h, dw * 0.3, h); }
    else seg(g, [[x + w / 2 - 14 * s, y - h * 0.8], [x + w / 2 - 14 * s, y - h * 0.66]], 6 * s, '#9aa3b2'); },
  sofa(g, x, y, s, o) { const c = o.color || '#4a5a8c', w = 300 * s; rr(g, x - w / 2, y - 70 * s, w, 50 * s, 12 * s); g.fillStyle = c; g.fill(); rr(g, x - w / 2 + 10 * s, y - 135 * s, w - 20 * s, 70 * s, 16 * s); g.fillStyle = shade(c, -0.15); g.fill(); for (const sx of [-1, 1]) { rr(g, x + sx * (w / 2 - 14 * s) - 22 * s, y - 100 * s, 44 * s, 80 * s, 14 * s); g.fillStyle = shade(c, -0.08); g.fill(); } g.fillStyle = INK(); g.fillRect(x - w / 2 + 16 * s, y - 20 * s, 10 * s, 20 * s); g.fillRect(x + w / 2 - 26 * s, y - 20 * s, 10 * s, 20 * s); },
  washer(g, x, y, s, o) { const w = 110 * s, h = 120 * s; rr(g, x - w / 2, y - h, w, h, 8 * s); g.fillStyle = '#eef0f4'; g.fill(); g.fillStyle = '#c9ced8'; g.fillRect(x - w / 2, y - h, w, 18 * s); ring(g, x, y - h * 0.45, 34 * s, 8 * s, '#9aa3b2'); circle(g, x, y - h * 0.45, 28 * s, '#6fa8d8'); circle(g, x - 8 * s, y - h * 0.5, 8 * s, 'rgba(255,255,255,.5)'); },
  pizza(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -48 * s, -14 * s, 96 * s, 14 * s, 2 * s); g.fillStyle = '#d6b27a'; g.fill(); g.fillStyle = '#b8935c'; g.fillRect(-48 * s, -14 * s, 96 * s, 3 * s); circle(g, 0, -7 * s, 4 * s, '#c0392b'); g.restore(); },
  remote(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.3); rr(g, -26 * s, -7 * s, 52 * s, 14 * s, 5 * s); g.fillStyle = '#22252e'; g.fill(); circle(g, 18 * s, 0, 3.5 * s, '#e2394f'); for (let i = 0; i < 4; i++) circle(g, (-14 + i * 7) * s, 0, 2 * s, '#8a8f9c'); g.restore(); },
  socks(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); const c = o.color || '#e2394f'; seg(g, [[0, -40 * s], [0, -8 * s], [18 * s, -4 * s]], 13 * s, c); seg(g, [[-4 * s, -40 * s], [4 * s, -40 * s]], 14 * s, '#ffffff'); g.restore(); },
  toothbrush(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); seg(g, [[-40 * s, 0], [30 * s, 0]], 7 * s, o.color || '#4fb3e8'); rr(g, 22 * s, -12 * s, 16 * s, 9 * s, 2 * s); g.fillStyle = '#ffffff'; g.fill(); g.restore(); },
  bag(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -24 * s, -56 * s, 48 * s, 56 * s, 6 * s); g.fillStyle = o.color || '#efe9df'; g.fill(); g.strokeStyle = '#cfc6b8'; g.lineWidth = 3 * s; g.beginPath(); g.arc(0, -56 * s, 12 * s, Math.PI, 0); g.stroke(); circle(g, -8 * s, -60 * s, 9 * s, '#8fd16a'); circle(g, 9 * s, -58 * s, 8 * s, '#f2c21a'); seg(g, [[14 * s, -56 * s], [20 * s, -76 * s]], 6 * s, '#e8c88a'); g.restore(); },
  book(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -18 * s, -54 * s, 36 * s, 54 * s, 3 * s); g.fillStyle = o.color || '#c0453a'; g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-18 * s, -54 * s, 5 * s, 54 * s); if (o.label) fitText(g, o.label, 3 * s, -27 * s, 28 * s, 20 * s, { color: '#fff3dc' }); g.restore(); },
  wrench(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); seg(g, [[-36 * s, 0], [30 * s, 0]], 9 * s, '#c9cdd4'); g.fillStyle = '#c9cdd4'; g.beginPath(); g.arc(36 * s, 0, 12 * s, 0.6, Math.PI * 2 - 0.6); g.lineTo(36 * s, 0); g.closePath(); g.fill(); circle(g, -38 * s, 0, 8 * s, '#c9cdd4'); circle(g, -38 * s, 0, 3.5 * s, '#2a2830'); g.restore(); },
  shovel(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); seg(g, [[0, -10 * s], [0, -170 * s]], 7 * s, '#a87b52'); seg(g, [[-10 * s, -170 * s], [10 * s, -170 * s]], 7 * s, '#a87b52'); g.fillStyle = '#8d939c'; g.beginPath(); g.moveTo(-18 * s, -40 * s); g.lineTo(18 * s, -40 * s); g.lineTo(14 * s, 6 * s); g.quadraticCurveTo(0, 18 * s, -14 * s, 6 * s); g.closePath(); g.fill(); g.restore(); },
  jack(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.tilt || 0); const c = o.isNew ? '#d63a2a' : '#7a4a36'; g.fillStyle = shade(c, -0.2); g.fillRect(-36 * s, -12 * s, 72 * s, 12 * s); const h = (o.h ?? 46) * s; seg(g, [[-24 * s, -12 * s], [0, -12 * s - h * 0.5], [-24 * s, -12 * s - h]], 6 * s, c); seg(g, [[24 * s, -12 * s], [0, -12 * s - h * 0.5], [24 * s, -12 * s - h]], 6 * s, c); g.fillStyle = c; g.fillRect(-28 * s, -16 * s - h, 56 * s, 7 * s);
    if (!o.isNew) { const R = rng(4); for (let i = 0; i < 9; i++) circle(g, (R() - 0.5) * 60 * s, -R() * h - 10 * s, (2 + R() * 3) * s, '#4a2a1a'); } g.restore(); },
  stand(g, x, y, s, o) { g.save(); g.translate(x, y); poly(g, [[-28 * s, 0], [28 * s, 0], [8 * s, -60 * s], [-8 * s, -60 * s]], o.color || '#e1b12c'); g.fillStyle = shade(o.color || '#e1b12c', -0.25); g.fillRect(-12 * s, -72 * s, 24 * s, 12 * s); g.restore(); },
  needle(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -1.2); seg(g, [[-30 * s, 0], [30 * s, 0]], 2.4 * s, '#d9dee5'); g.strokeStyle = '#d9dee5'; g.lineWidth = 1.5 * s; g.beginPath(); g.ellipse(-24 * s, 0, 5 * s, 2 * s, 0, 0, 7); g.stroke(); g.restore(); },
  thread(g, x1, y1, x2, y2, k, s) { const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); g.strokeStyle = '#e2394f'; g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + ex) / 2, Math.max(y1, ey) + 40 * s, ex, ey); g.stroke(); },
  glass(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); const lv = o.level ?? 0.6; g.fillStyle = 'rgba(120,190,255,.55)'; g.fillRect(-15 * s, -46 * s * lv, 30 * s, 46 * s * lv); g.strokeStyle = 'rgba(230,240,255,.8)'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(-17 * s, -50 * s); g.lineTo(-15 * s, 0); g.lineTo(15 * s, 0); g.lineTo(17 * s, -50 * s); g.stroke(); g.restore(); },
  ball(g, x, y, s, o) { const r = (o.r || 12) * s; circle(g, x, y - r, r, o.color || '#cfe34a'); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2 * s; g.beginPath(); g.arc(x - r * 0.9, y - r, r * 0.8, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(x + r * 0.9, y - r, r * 0.8, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); },
  soccer(g, x, y, s, o) { soccerBall(g, x, y - 16 * s, 16 * s, o.rot || 0); },
  pot(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); poly(g, [[-22 * s, -40 * s], [22 * s, -40 * s], [16 * s, 0], [-16 * s, 0]], '#c96f45'); g.fillStyle = '#a95a36'; g.fillRect(-25 * s, -46 * s, 50 * s, 8 * s); for (const [dx, dy, r] of [[-14, -58, 16], [12, -60, 17], [0, -72, 16]]) circle(g, dx * s, dy * s, r * s, '#3f7d3c'); for (const [dx, dy] of [[-10, -78], [12, -76], [2, -88], [-18, -66]]) circle(g, dx * s, dy * s, 6.5 * s, '#e2394f'); g.restore(); },
  car(g, x, y, s, o) { // Нива / машина, вид сбоку; o.color, o.jeep
    const jeep = !!o.jeep, c = o.color || (jeep ? '#22242c' : '#5c7a4a'), w = (jeep ? 470 : 400) * s, h = (jeep ? 150 : 120) * s, wr = (jeep ? 40 : 34) * s;
    g.save(); g.translate(x, y); g.scale(o.flip ? -1 : 1, 1); g.rotate(o.rot || 0);
    rr(g, -w / 2, -h * 0.75 - wr * 0.6, w, h * 0.45, 14 * s); g.fillStyle = c; g.fill();
    g.beginPath(); g.moveTo(-w * 0.34, -h * 0.75 - wr * 0.6 + 2); g.lineTo(-w * 0.26, -h - wr * 0.7 - (jeep ? 20 * s : 0)); g.lineTo(w * 0.2, -h - wr * 0.7 - (jeep ? 20 * s : 0)); g.lineTo(w * 0.34, -h * 0.75 - wr * 0.6 + 2); g.closePath(); g.fill();
    g.fillStyle = o.lit ? '#ffe7b0' : '#9fb4c8'; const wy = -h - wr * 0.7 - (jeep ? 20 * s : 0) + 8 * s, wh = h * 0.24 + (jeep ? 10 * s : 0);
    g.fillRect(-w * 0.24, wy, w * 0.2, wh); g.fillRect(-w * 0.01, wy, w * 0.19, wh);
    if (o.driver) { circle(g, w * 0.08, wy + wh * 0.62, 13 * s, INK()); if (o.driverColor) { g.fillStyle = o.driverColor; g.fillRect(w * 0.08 - 12 * s, wy + wh * 0.8, 24 * s, wh * 0.4); } }
    g.fillStyle = shade(c, -0.25); g.fillRect(-w / 2, -h * 0.4 - wr * 0.6, w, 6 * s);
    circle(g, w / 2 - 8 * s, -h * 0.62 - wr * 0.6, 7 * s, '#fff2c2'); if (o.lights) glow(g, w / 2 + 10 * s, -h * 0.62 - wr * 0.6, 120 * s, '#fff2c2', 0.4);
    circle(g, -w / 2 + 6 * s, -h * 0.62 - wr * 0.6, 6 * s, '#d63a2a');
    if (!o.noMirror) { g.fillStyle = shade(c, -0.1); g.fillRect(w * 0.26, -h * 0.82 - wr * 0.6, 16 * s, 10 * s); }
    for (const wx of [-w * 0.3, w * 0.3]) { circle(g, wx, -wr, wr, '#141218'); circle(g, wx, -wr, wr * 0.45, '#8a8f9c'); }
    if (o.rust) { const R = rng(7); for (let i = 0; i < 8; i++) circle(g, (R() - 0.5) * w * 0.8, -h * 0.55 - R() * 20 * s, (3 + R() * 6) * s, '#7a4a2a'); }
    g.restore(); },
  mirror(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -16 * s, -12 * s, 32 * s, 22 * s, 4 * s); g.fillStyle = '#22242c'; g.fill(); g.fillStyle = '#9fb4c8'; g.fillRect(-12 * s, -9 * s, 24 * s, 15 * s); g.restore(); },
  dishes(g, x, y, s, o) { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#e8e4dc' : '#d8d2c8'; g.beginPath(); g.ellipse(x + Math.sin(i * 1.7) * 6 * s, y - i * 9 * s, 44 * s, 8 * s, 0, 0, 7); g.fill(); } for (const [dx, dy] of [[30, -60], [-28, -56]]) { rr(g, x + dx * s - 9 * s, y + dy * s - 26 * s, 18 * s, 26 * s, 3 * s); g.fillStyle = '#c8e0f0'; g.fill(); } circle(g, x - 6 * s, y - 70 * s, 6 * s, '#c0392b'); },
  tableK(g, x, y, s, o) { const w = (o.w || 260) * s, c = o.color || '#5a3a2e'; rr(g, x - w / 2, y - 112 * s, w, 14 * s, 4 * s); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(255,220,170,.25)'; g.fillRect(x - w / 2 + 4, y - 112 * s, w - 8, 3); for (const sx of [-1, 1]) seg(g, [[x + sx * (w / 2 - 16 * s), y - 100 * s], [x + sx * (w / 2 - 20 * s), y]], 8 * s, shade(c, -0.3)); },
  stool(g, x, y, s, o) { rr(g, x - 28 * s, y - 74 * s, 56 * s, 10 * s, 4 * s); g.fillStyle = o.color || '#3a2a2a'; g.fill(); for (const dx of [-20, 20]) seg(g, [[x + dx * 0.4 * s, y - 70 * s], [x + dx * s, y]], 5 * s, o.color || '#3a2a2a'); },
  nightstand(g, x, y, s, o) { rr(g, x - 40 * s, y - 80 * s, 80 * s, 80 * s, 4 * s); g.fillStyle = o.color || '#3a2a30'; g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x - 34 * s, y - 50 * s, 68 * s, 3 * s); circle(g, x, y - 34 * s, 3 * s, '#c9b08a'); },
  box(g, x, y, s, o) { const w = (o.w || 90) * s, h = (o.h || 70) * s; g.fillStyle = o.color || '#b88a5a'; g.fillRect(x - w / 2, y - h, w, h); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x - w / 2, y - h, w, 8 * s); g.fillStyle = '#d8c09a'; g.fillRect(x - 6 * s, y - h, 12 * s, h * 0.5); },
  tv(g, x, y, s, o) { rr(g, x - 110 * s, y - 130 * s, 220 * s, 130 * s, 6 * s); g.fillStyle = '#0c0c12'; g.fill(); g.fillStyle = o.on === false ? '#1a1c26' : '#3a6ea5'; g.fillRect(x - 102 * s, y - 122 * s, 204 * s, 114 * s); if (o.on !== false) glow(g, x, y - 65 * s, 220 * s, '#7fb0ff', 0.25); },
  shelf(g, x, y, s, o) { const w = 160 * s; for (let i = 0; i < 3; i++) { const yy = y - i * 70 * s; g.fillStyle = '#3a2a30'; g.fillRect(x - w / 2, yy, w, 8 * s); for (let k = 0; k < 6; k++) { g.fillStyle = ['#c0453a', '#3a6ea5', '#e1b12c', '#5fa86a', '#8a5ad6', '#d9d0c0'][(k + i) % 6]; g.fillRect(x - w / 2 + 8 * s + k * 24 * s, yy - (44 + (k * 7) % 14) * s, 18 * s, (44 + (k * 7) % 14) * s); } } },
  door(g, x, y, s, o) { const w = 110 * s, h = 230 * s, c = o.color || '#5a3a2e'; g.fillStyle = shade(c, -0.45); g.fillRect(x - w / 2 - 8 * s, y - h - 8 * s, w + 16 * s, h + 8 * s); const open = clamp(o.open || 0); if (open > 0) { g.fillStyle = o.light || '#ffe7b0'; g.fillRect(x - w / 2, y - h, w, h); glow(g, x, y - h / 2, h, o.light || '#ffe7b0', 0.3 * open); } g.fillStyle = c; g.fillRect(x - w / 2 + w * open, y - h, w * (1 - open), h); circle(g, x + w / 2 - 14 * s - w * open * 0.0, y - h * 0.48, 5 * s, '#e1c36a'); if (o.locks) for (let i = 0; i < o.locks; i++) { rr(g, x + w / 2 - 24 * s, y - h * 0.62 - i * 26 * s, 14 * s, 18 * s, 3 * s); g.fillStyle = '#d8c070'; g.fill(); } },
  wheelchair(g, x, y, s, o) { g.save(); g.translate(x, y); g.scale(o.flip ? -1 : 1, 1); ring(g, -6 * s, -46 * s, 46 * s, 7 * s, '#9aa3b2'); ring(g, -6 * s, -46 * s, 4 * s, 4 * s, '#9aa3b2'); circle(g, 50 * s, -10 * s, 10 * s, '#5a5f6c'); seg(g, [[-40 * s, -150 * s], [-36 * s, -70 * s], [40 * s, -70 * s], [50 * s, -16 * s]], 7 * s, '#6a707c'); g.restore(); },
  robotArm(g, x, y, s, o) { // o.a = 0..1 подъём к губам; от базы (x,y) на столе
    const k = clamp(o.a ?? 0), c = '#c9d2de', d = '#6a7484';
    const p0 = [x, y], p1 = [x + lerp(-20, -40, k) * s, y + lerp(-90, -120, k) * s], p2 = [x + lerp(60, (o.reachX ?? -130), k) * s, y + lerp(-110, (o.reachY ?? -150), k) * s];
    rr(g, x - 30 * s, y - 14 * s, 60 * s, 14 * s, 4 * s); g.fillStyle = d; g.fill();
    seg(g, [p0, p1], 18 * s, c); seg(g, [p1, p2], 14 * s, c); circle(g, p1[0], p1[1], 12 * s, d); circle(g, p0[0], p0[1] - 4 * s, 12 * s, d);
    seg(g, [[p2[0], p2[1]], [p2[0] - 14 * s, p2[1] - 10 * s]], 6 * s, d); seg(g, [[p2[0], p2[1]], [p2[0] - 14 * s, p2[1] + 10 * s]], 6 * s, d);
    glow(g, p1[0], p1[1], 30 * s, '#7fe8ff', 0.4);
    return p2; },
  monitor(g, x, y, s, o) { rr(g, x - 90 * s, y - 130 * s, 180 * s, 110 * s, 6 * s); g.fillStyle = '#0c0c12'; g.fill(); g.fillStyle = '#16202c'; g.fillRect(x - 82 * s, y - 122 * s, 164 * s, 94 * s); seg(g, [[x, y - 20 * s], [x, y]], 10 * s, '#2a2a33'); seg(g, [[x - 30 * s, y], [x + 30 * s, y]], 8 * s, '#2a2a33'); glow(g, x, y - 75 * s, 160 * s, '#7fd0d6', 0.2); if (o.chess) chess(g, x, y - 75 * s, 80 * s, o.t || 0, o.mv || 0); },
  calendar(g, x, y, s, o) { rr(g, x - 70 * s, y - 160 * s, 140 * s, 160 * s, 6 * s); g.fillStyle = '#f4efe6'; g.fill(); g.fillStyle = '#d63a2a'; g.fillRect(x - 70 * s, y - 160 * s, 140 * s, 36 * s); fitText(g, o.top || '', x, y - 142 * s, 124 * s, 30 * s, { color: '#fff' }); fitText(g, o.label || '', x, y - 70 * s, 124 * s, 80 * s, { color: '#2a2430' }); if (o.circle) { g.strokeStyle = alpha('#d63a2a', clamp(o.circle)); g.lineWidth = 5 * s; g.beginPath(); g.ellipse(x, y - 70 * s, 66 * s, 44 * s, -0.1, 0, Math.PI * 2 * clamp(o.circle)); g.stroke(); } },
  money(g, x, y, s, o) { rr(g, x - 110 * s, y - 80 * s, 220 * s, 80 * s, 8 * s); g.fillStyle = '#2a2a33'; g.fill(); seg(g, [[x - 30 * s, y - 80 * s], [x - 30 * s, y - 96 * s], [x + 30 * s, y - 96 * s], [x + 30 * s, y - 80 * s]], 7 * s, '#2a2a33'); if (o.open) { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#6fbf6a' : '#5aa85a'; g.fillRect(x - 96 * s + i * 32 * s, y - 70 * s, 28 * s, 56 * s); } } circle(g, x, y - 40 * s, 6 * s, '#d4af37'); },
  spoon(g, x, y, s, o) { g.save(); g.translate(x, y); const b = o.bend || 0; g.strokeStyle = '#d9dee5'; g.lineWidth = 6 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0, -40 * s, Math.sin(b) * 40 * s, -40 * s - Math.cos(b) * 40 * s); g.stroke(); g.fillStyle = '#d9dee5'; g.beginPath(); g.ellipse(Math.sin(b) * 46 * s, -40 * s - Math.cos(b) * 46 * s, 9 * s, 14 * s, b, 0, 7); g.fill(); g.restore(); },
  compass(g, x, y, s, o) { circle(g, x, y - 50 * s, 50 * s, '#c9a24a'); circle(g, x, y - 50 * s, 42 * s, '#f4efe6'); g.save(); g.translate(x, y - 50 * s); g.rotate(o.a || 0); poly(g, [[0, -36 * s], [7 * s, 0], [-7 * s, 0]], '#d63a2a'); poly(g, [[0, 36 * s], [7 * s, 0], [-7 * s, 0]], '#3a3a44'); g.restore(); circle(g, x, y - 50 * s, 4 * s, '#2a2430'); },
  mri(g, x, y, s, o) { rr(g, x - 140 * s, y - 230 * s, 280 * s, 230 * s, 30 * s); g.fillStyle = '#e8ecf2'; g.fill(); circle(g, x, y - 120 * s, 80 * s, '#2a3448'); circle(g, x, y - 120 * s, 70 * s, '#3a4a66'); glow(g, x, y - 120 * s, 90 * s, '#7fd0ff', 0.3); rr(g, x - 30 * s, y - 92 * s, 260 * s, 20 * s, 6 * s); g.fillStyle = '#c9ced8'; g.fill(); },
  elevator(g, x, y, s, o) { g.fillStyle = '#5a5f6c'; g.fillRect(x - 90 * s, y - 250 * s, 180 * s, 250 * s); g.fillStyle = '#9aa3b2'; g.fillRect(x - 80 * s, y - 240 * s, 78 * s, 240 * s); g.fillRect(x + 2 * s, y - 240 * s, 78 * s, 240 * s); rr(g, x - 70 * s, y - 180 * s, 140 * s, 70 * s, 6 * s); g.fillStyle = '#f4efe6'; g.fill(); fitText(g, o.label || 'НЕ РАБОТАЕТ', x, y - 145 * s, 128 * s, 58 * s, { color: '#d63a2a' }); },
  sign(g, x, y, s, o) { const w = (o.w || 260) * s, h = (o.h || 110) * s; seg(g, [[x - w * 0.35, y], [x - w * 0.35, y - h - 60 * s]], 7 * s, '#4a4a55'); seg(g, [[x + w * 0.35, y], [x + w * 0.35, y - h - 60 * s]], 7 * s, '#4a4a55'); rr(g, x - w / 2, y - h - 120 * s, w, h, 8 * s); g.fillStyle = o.color || '#f4efe6'; g.fill(); g.strokeStyle = o.border || '#d63a2a'; g.lineWidth = 6 * s; g.stroke(); fitText(g, o.label || '', x, y - h / 2 - 120 * s, w - 24 * s, h - 20 * s, { color: o.textColor || '#2a2430' }); },
  stamp(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(-0.12); const w = 520 * s, h = 120 * s; g.strokeStyle = '#d63a2a'; g.lineWidth = 10 * s; rr(g, -w / 2, -h / 2, w, h, 14 * s); g.stroke(); fitText(g, o.label || '', 0, 0, w - 40 * s, h - 24 * s, { color: '#d63a2a', font: FONTS.title, weight: 700 }); g.restore(); },
  radiator(g, x, y, s, o) { for (let i = 0; i < 8; i++) { rr(g, x - 110 * s + i * 28 * s, y - 110 * s, 22 * s, 100 * s, 8 * s); g.fillStyle = '#d9d6dc'; g.fill(); } g.fillStyle = '#bfbcc4'; g.fillRect(x - 112 * s, y - 30 * s, 230 * s, 6 * s); },
  cabinet(g, x, y, s, o) { g.fillStyle = o.color || '#6a4a3a'; g.fillRect(x - 120 * s, y - 120 * s, 240 * s, 120 * s); g.strokeStyle = shade(o.color || '#6a4a3a', -0.35); g.lineWidth = 4 * s; g.strokeRect(x - 116 * s, y - 116 * s, 116 * s, 112 * s); g.strokeRect(x + 0 * s, y - 116 * s, 116 * s, 112 * s); circle(g, x - 14 * s, y - 60 * s, 4 * s, '#e1c36a'); circle(g, x + 14 * s, y - 60 * s, 4 * s, '#e1c36a'); },
  kettle(g, x, y, s, o) { g.save(); g.translate(x, y); g.fillStyle = '#d0d4dc'; g.beginPath(); g.moveTo(-26 * s, 0); g.lineTo(-22 * s, -40 * s); g.quadraticCurveTo(0, -52 * s, 22 * s, -40 * s); g.lineTo(26 * s, 0); g.closePath(); g.fill(); seg(g, [[-20 * s, -46 * s], [0, -62 * s], [20 * s, -46 * s]], 4 * s, '#2a2830'); seg(g, [[24 * s, -20 * s], [42 * s, -36 * s]], 6 * s, '#d0d4dc'); g.restore(); },
  wand(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.6); seg(g, [[-60 * s, 0], [60 * s, 0]], 9 * s, '#b07a4a'); seg(g, [[40 * s, 0], [60 * s, 0]], 9 * s, '#f4efe6'); g.restore(); glow(g, x + Math.cos(o.rot ?? -0.6) * 60 * s, y + Math.sin(o.rot ?? -0.6) * 60 * s, 40 * s, '#ffd47e', 0.6); },
  cross(g, x, y, s, o) { const k = clamp(o.k ?? 1), r = 90 * s; g.save(); g.globalAlpha *= k; seg(g, [[x - r, y - r], [x + r, y + r]], 14 * s, '#e0453a'); seg(g, [[x + r, y - r], [x - r, y + r]], 14 * s, '#e0453a'); g.restore(); },
  check(g, x, y, s, o) { const k = clamp(o.k ?? 1); g.save(); g.globalAlpha *= k; seg(g, [[x - 60 * s, y], [x - 15 * s, y + 45 * s], [x + 70 * s, y - 55 * s]], 16 * s, '#5fd39a'); g.restore(); },
  hat(g, x, y, s, o) { poly(g, [[x - 40 * s, y], [x + 40 * s, y], [x + 6 * s, y - 90 * s]], o.color || '#5a3aa0'); g.fillStyle = shade(o.color || '#5a3aa0', -0.2); g.beginPath(); g.ellipse(x, y, 52 * s, 10 * s, 0, 0, 7); g.fill(); for (const [dx, dy] of [[-10, -30], [8, -52], [0, -14]]) circle(g, x + dx * s, y + dy * s, 4 * s, '#ffd47e'); },
  bubble(g, x, y, s, o) { const w = (o.w || 200) * s, h = (o.h || 90) * s; rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.fillStyle = o.color || '#f4efe6'; g.fill(); poly(g, [[x - w * 0.2, y + h / 2 - 4], [x - w * 0.32 * (o.tail ?? 1), y + h / 2 + 24 * s], [x - w * 0.02, y + h / 2 - 4]], o.color || '#f4efe6'); fitText(g, o.label || '', x, y, w - h * 0.6, h * 0.8, { color: '#2a2430' }); },
  battery(g, x, y, s, o) { const lv = clamp(o.level ?? 1), w = 160 * s, h = 70 * s; rr(g, x - w / 2, y - h, w, h, 10 * s); g.strokeStyle = '#f4efe6'; g.lineWidth = 6 * s; g.stroke(); g.fillStyle = '#f4efe6'; g.fillRect(x + w / 2, y - h * 0.68, 10 * s, h * 0.36); g.fillStyle = lv > 0.35 ? '#5fd39a' : '#e0453a'; g.fillRect(x - w / 2 + 8 * s, y - h + 8 * s, (w - 16 * s) * lv, h - 16 * s); },
  goal(g, x, y, s, o) { const w = 340 * s, h = 170 * s; g.strokeStyle = 'rgba(230,236,245,.25)'; g.lineWidth = 1.5; for (let i = 0; i <= 14; i++) { g.beginPath(); g.moveTo(x - w / 2 + i * w / 14, y - h); g.lineTo(x - w / 2 + 20 * s + i * (w - 40 * s) / 14, y - 10 * s); g.stroke(); } for (let j = 0; j <= 6; j++) { g.beginPath(); g.moveTo(x - w / 2, y - h + j * h / 6); g.lineTo(x + w / 2, y - h + j * h / 6); g.stroke(); } seg(g, [[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], 9 * s, '#f2efe8'); },
  hand(g, x, y, s, o) { // крупная кисть (инсерт); o.sleeve цвет рукава, o.fist 0..1, o.dir (-1 рукав слева / 1 справа), o.ink
    const ink = o.ink || INK(), dir = o.dir ?? 1, fist = clamp(o.fist || 0);
    g.save(); g.translate(x, y); g.scale(dir * s, s);
    seg(g, [[30, 30], [600, 260]], 70, ink); if (o.sleeve) seg(g, [[150, 80], [700, 300]], 100, o.sleeve);
    circle(g, 0, 0, 52, ink);
    for (let i = 0; i < 4; i++) { const a = -2.5 + i * 0.36, L = lerp(100, 40, fist); seg(g, [[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * L, Math.sin(a) * L + fist * 30]], 20, ink); }
    seg(g, [[10, 26], [-lerp(70, 30, fist), lerp(56, 30, fist)]], 21, ink);
    if (o.shake) { /* дрожь задаётся смещением снаружи */ }
    if (o.blisters) for (const [bx, by] of [[-20, -6], [8, 10], [-6, 24]]) { circle(g, bx, by, 9, '#e8b8a0'); circle(g, bx - 2, by - 2, 3, '#fff3e6'); }
    g.restore(); },
  ghostArm(g, x1, y1, x2, y2, t, o = {}) { // полупрозрачная фиолетовая «рука» силы
    const a = o.a ?? 1, wob = o.wob || 0, baby = !!o.baby; if (a <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    const mx = (x1 + x2) / 2 + Math.sin(t * 3) * wob, my = (y1 + y2) / 2 - 60 + Math.cos(t * 2.3) * wob;
    g.strokeStyle = alpha(POWER, 0.35 * a); g.lineCap = 'round'; g.lineWidth = baby ? 26 : 34; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
    g.lineWidth = baby ? 12 : 16; g.strokeStyle = alpha('#e6d4ff', 0.45 * a); g.stroke();
    const hr = baby ? 26 : 40; glow(g, x2, y2, hr * 2.2, POWER, 0.5 * a); circle(g, x2, y2, hr, alpha(POWER, 0.45 * a));
    for (let i = 0; i < 4; i++) { const an = -2.2 + i * 0.45 + Math.sin(t * (baby ? 9 : 2) + i) * (baby ? 0.5 : 0.08); seg(g, [[x2, y2], [x2 + Math.cos(an) * hr * 1.6, y2 + Math.sin(an) * hr * 1.6]], baby ? 9 : 12, alpha(POWER, 0.5 * a)); }
    g.restore(); },
  sneaker(g, x, y, s, o) { g.save(); g.translate(x, y); rr(g, -70 * s, -50 * s, 140 * s, 50 * s, 22 * s); g.fillStyle = o.color || '#f4efe6'; g.fill(); g.fillStyle = '#d0d4dc'; g.fillRect(-70 * s, -12 * s, 140 * s, 12 * s); const k = clamp(o.k ?? 1); g.strokeStyle = '#d63a2a'; g.lineWidth = 5 * s; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-30 * s + i * 18 * s, -44 * s); g.lineTo(-20 * s + i * 18 * s, -30 * s); g.stroke(); } g.beginPath(); g.ellipse(-10 * s - 30 * s * k, -58 * s, 26 * s * k + 2, 14 * s * k + 2, -0.4, 0, 7); g.stroke(); g.beginPath(); g.ellipse(10 * s + 30 * s * k, -58 * s, 26 * s * k + 2, 14 * s * k + 2, 0.4, 0, 7); g.stroke(); g.restore(); },
  blood(g, x, y, s, o) { const k = clamp(o.k ?? 1); seg(g, [[x, y], [x + 2 * s, y + 46 * s * k]], 7 * s, '#c0262a'); circle(g, x + 2 * s, y + 46 * s * k, 5 * s, '#c0262a'); },
  moustache(g, x, y, r) { g.fillStyle = '#e8e2d8'; g.beginPath(); g.ellipse(x - r * 0.2, y, r * 0.24, r * 0.09, 0.25, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + r * 0.2, y, r * 0.24, r * 0.09, -0.25, 0, 7); g.fill(); },
};

// шахматная доска на экране (для парня с имплантом)
export function chess(g, cx, cy, size, t, mv) {
  const n = 8, c = size / n * 2, x0 = cx - size, y0 = cy - size * 0.55, cs = (size * 2) / n, csY = (size * 1.1) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#c9a77a' : '#f0dcb8'; g.fillRect(x0 + i * cs, y0 + j * csY, cs + 0.5, csY + 0.5); }
  const k = clamp(mv), px = x0 + lerp(4.5, 4.5, k) * cs, py = y0 + lerp(6.5, 4.5, k) * csY;
  circle(g, px, py, cs * 0.3, '#ffffff'); circle(g, x0 + 3.5 * cs, y0 + 1.5 * csY, cs * 0.3, '#2a2430'); circle(g, x0 + 5.5 * cs, y0 + 1.5 * csY, cs * 0.3, '#2a2430');
  // курсор
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(px + 6, py + 4); g.lineTo(px + 6, py + 22); g.lineTo(px + 11, py + 17); g.lineTo(px + 18, py + 18); g.closePath(); g.fill();
}
