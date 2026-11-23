// lib/ny.js — новогодние предметы и головные уборы. Предметы: fn(g, x, y, s, o), (x, y) — низ-центр.
import { E, S, clamp, lerp, ease, prog, alpha, shade, mix, seg, circle, ring, rr, poly, linGrad, radGrad, glow, text, FONTS, rng } from '/engine/core.js';
import { fitText } from './objs.js';

// ---------- головные уборы и бороды поверх фигуры/крупного лица ----------
// (hx, hy) центр головы, r радиус, f — направление взгляда (1/-1), big — крупный план (лицо анфас)
export function headExtras(g, of, hx, hy, r, f = 1, big = false, o = {}) {
  const fx = big ? 0 : f * r * 0.34;           // смещение «лица» в профиль
  if (of.hoodBlue && !big) { g.fillStyle = '#2f6fe0'; g.beginPath(); g.ellipse(hx - f * r * 0.55, hy + r * 1.05, r * 0.7, r * 0.42, -0.3 * f, 0, 7); g.fill(); }
  if (of.hoodBlue && big) { g.fillStyle = '#2f6fe0'; g.beginPath(); g.ellipse(hx, hy + r * 1.25, r * 0.95, r * 0.35, 0, 0, 7); g.fill(); }
  if (of.santa) {
    const tilt = o.beardTilt || 0;
    // борода
    g.save(); g.translate(hx + fx * 0.6 + tilt * r * 0.3, hy + r * 0.25); g.rotate(tilt * 0.35);
    g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(-r * 0.72, -r * 0.1); g.quadraticCurveTo(-r * 0.75, r * 0.9, 0, r * 1.15); g.quadraticCurveTo(r * 0.75, r * 0.9, r * 0.72, -r * 0.1); g.quadraticCurveTo(0, r * 0.25, -r * 0.72, -r * 0.1); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-r * 0.2, r * 0.05, r * 0.28, r * 0.12, 0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(r * 0.2, r * 0.05, r * 0.28, r * 0.12, -0.2, 0, 7); g.fill();
    g.restore();
    // шапка
    g.save(); g.translate(hx, hy - r * 0.55);
    g.fillStyle = '#c8322a'; g.beginPath(); g.moveTo(-r * 0.95, 0); g.quadraticCurveTo(-r * 0.2, -r * 1.5, -f * r * 1.1, -r * 0.55); g.quadraticCurveTo(r * 0.5, -r * 0.9, r * 0.95, 0); g.closePath(); g.fill();
    rr(g, -r * 1.02, -r * 0.18, r * 2.04, r * 0.36, r * 0.18); g.fillStyle = '#f4f1ea'; g.fill();
    circle(g, -f * r * 1.15, -r * 0.5, r * 0.22, '#f4f1ea'); g.restore();
  }
  if (of.platok) {
    const c = of.platok; g.fillStyle = c; g.beginPath(); g.arc(hx, hy, r * 1.08, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(hx + r * 1.05, hy + r * 0.2); g.lineTo(hx + fx * 0.3, hy + r * 1.05); g.lineTo(hx - r * 1.05, hy + r * 0.2); g.closePath(); g.save(); g.clip(); g.restore();
    g.beginPath(); g.moveTo(hx - r * 1.08, hy + r * 0.05); g.arc(hx, hy, r * 1.08, Math.PI, Math.PI * 2); g.lineTo(hx + r * 1.08, hy + r * 0.05); g.quadraticCurveTo(hx, hy - r * 0.55, hx - r * 1.08, hy + r * 0.05); g.fill();
    for (let i = 0; i < 6; i++) circle(g, hx - r * 0.7 + i * r * 0.28, hy - r * 0.6 + Math.abs(i - 2.5) * r * 0.1, r * 0.07, '#fff3d6');
    poly(g, [[hx - f * r * 0.7, hy + r * 0.6], [hx - f * r * 0.95, hy + r * 0.95], [hx - f * r * 0.55, hy + r * 0.9]], shade(c, -0.15));
  }
  if (of.ushanka) {
    const c = of.ushanka; g.fillStyle = c; g.beginPath(); g.ellipse(hx, hy - r * 0.45, r * 1.12, r * 0.75, 0, Math.PI, Math.PI * 2); g.fill();
    rr(g, hx - r * 1.15, hy - r * 0.6, r * 2.3, r * 0.38, r * 0.15); g.fillStyle = shade(c, 0.25); g.fill();
    for (const sx of [-1, 1]) { rr(g, hx + sx * r * 0.95 - r * 0.2, hy - r * 0.35, r * 0.4, r * 0.75, r * 0.18); g.fillStyle = shade(c, 0.15); g.fill(); }
  }
  if (of.chef) { g.fillStyle = '#f4f1ea'; rr(g, hx - r * 0.75, hy - r * 1.35, r * 1.5, r * 0.8, r * 0.1); g.fill(); for (const dx of [-0.5, 0, 0.5]) circle(g, hx + dx * r, hy - r * 1.4, r * 0.45, '#f4f1ea'); }
  if (of.kokoshnik) { g.fillStyle = '#5fb0ff'; g.beginPath(); g.moveTo(hx - r * 1.0, hy - r * 0.4); g.quadraticCurveTo(hx, hy - r * 2.0, hx + r * 1.0, hy - r * 0.4); g.closePath(); g.fill(); for (let i = 0; i < 5; i++) circle(g, hx - r * 0.6 + i * r * 0.3, hy - r * 0.75 - Math.sin((i / 4) * Math.PI) * r * 0.5, r * 0.08, '#ffffff'); }
  if (of.snowflake) { g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1.5, r * 0.08); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(hx + Math.cos(a) * r * 0.35, hy - r * 1.25 + Math.sin(a) * r * 0.35); g.lineTo(hx - Math.cos(a) * r * 0.35, hy - r * 1.25 - Math.sin(a) * r * 0.35); g.stroke(); } }
  if (of.beard) { g.fillStyle = of.beard; g.beginPath(); g.ellipse(hx + fx * 0.6, hy + r * 0.62, r * 0.55, r * 0.45, 0, 0, Math.PI); g.fill(); }
}

const INK = () => S().ink;
const BALLC = ['#e2394f', '#f2c21a', '#3a8ee0', '#c04fd0', '#3fb950', '#ff8a3a'];

export const NY = {
  // ёлка: o.h высота (у.е. при s=1), o.lit 0..1 доля горящих огней, o.star, o.balls
  tree(g, x, y, s, o) {
    const h = (o.h || 300) * s, w = h * 0.55, t = o.t || 0, lit = o.lit ?? 1;
    g.fillStyle = '#5a3a26'; g.fillRect(x - 10 * s, y - 24 * s, 20 * s, 24 * s);
    const tiers = 4;
    for (let i = 0; i < tiers; i++) { const ty = y - 20 * s - i * h * 0.21, tw = w * (1 - i * 0.2); poly(g, [[x - tw / 2, ty], [x + tw / 2, ty], [x, ty - h * 0.36]], i % 2 ? '#2f6b3f' : '#2a5f38'); }
    const R = rng(o.seed || 5);
    for (let i = 0; i < 18; i++) { const u = R(), v = R(); const yy = y - 30 * s - u * h * 0.78, half = w * 0.45 * (1 - u * 0.85), xx = x + (v - 0.5) * 2 * half; const on = R() < lit; const c = BALLC[i % 6]; const blink = 0.6 + 0.4 * Math.sin(t * 3 + i); circle(g, xx, yy, 4.5 * s, on ? c : shade(c, -0.6)); if (on) glow(g, xx, yy, 18 * s, c, 0.35 * blink); }
    if (o.balls !== false) for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7.5, yy = y - 40 * s - u * h * 0.7, xx = x + (i % 2 ? 1 : -1) * w * 0.3 * (1 - u); circle(g, xx, yy, 9 * s, BALLC[(i + 2) % 6]); circle(g, xx - 3 * s, yy - 3 * s, 3 * s, 'rgba(255,255,255,.6)'); }
    if (o.lowBall !== false) { const bx = x + w * 0.32, by = y - 46 * s; seg(g, [[bx, by - 14 * s], [bx, by - 4 * s]], 1.5 * s, '#d8d0c0'); if (!o.ballGone) { circle(g, bx, by + 6 * s, 11 * s, '#f2c21a'); circle(g, bx - 3 * s, by + 2 * s, 3.5 * s, 'rgba(255,255,255,.7)'); } }
    if (o.star !== false) { const sy = y - 20 * s - h * 0.9, sr = 20 * s; g.fillStyle = '#e2394f'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? sr * 0.45 : sr; g.lineTo(x + Math.cos(a) * rr2, sy + Math.sin(a) * rr2); } g.closePath(); g.fill(); glow(g, x, sy, 60 * s, '#ff6a5a', 0.5); }
  },
  // гирлянда-провод от (x,y) на ширину o.w, o.lit 0..1 (половина = 0.5 — горит одна сторона), o.tangle — клубок
  garland(g, x, y, s, o) {
    const t = o.t || 0;
    if (o.tangle) { const R = rng(9); g.strokeStyle = '#2a3a2a'; g.lineWidth = 3 * s; g.beginPath(); for (let i = 0; i < 60; i++) { const a = R() * 6.28, rad = R() * 60 * s; g.lineTo(x + Math.cos(a) * rad * 1.4, y - 50 * s + Math.sin(a) * rad); } g.stroke(); for (let i = 0; i < 26; i++) { const a = R() * 6.28, rad = R() * 55 * s; circle(g, x + Math.cos(a) * rad * 1.4, y - 50 * s + Math.sin(a) * rad, 4 * s, BALLC[i % 6]); } return; }
    const w = (o.w || 400) * s, n = Math.max(6, Math.round(w / (28 * s))), lit = o.lit ?? 1;
    g.strokeStyle = '#1e2a1e'; g.lineWidth = 2.5 * s; g.beginPath(); for (let i = 0; i <= n; i++) { const xx = x + (i / n) * w, yy = y + Math.sin((i / n) * Math.PI) * (o.sag ?? 30) * s; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
    for (let i = 0; i <= n; i++) { const xx = x + (i / n) * w, yy = y + Math.sin((i / n) * Math.PI) * (o.sag ?? 30) * s + 6 * s; const on = (o.half === 'left' ? i / n < 0.5 : o.half === 'right' ? i / n >= 0.5 : true) && lit > 0; const c = BALLC[i % 6]; circle(g, xx, yy, 5 * s, on ? c : shade(c, -0.65)); if (on) glow(g, xx, yy, 22 * s, c, 0.4 * (0.7 + 0.3 * Math.sin(t * 4 + i))); }
  },
  bowl(g, x, y, s, o) { g.fillStyle = o.color || '#e8e2d8'; g.beginPath(); g.moveTo(x - 60 * s, y - 40 * s); g.quadraticCurveTo(x, y + 14 * s, x + 60 * s, y - 40 * s); g.closePath(); g.fill(); g.fillStyle = '#f2e6b8'; g.beginPath(); g.ellipse(x, y - 40 * s, 58 * s, 12 * s, 0, 0, 7); g.fill(); const R = rng(4); for (let i = 0; i < 16; i++) { g.fillStyle = ['#f2c14e', '#e8743a', '#7fbf5a', '#f4efe6', '#e88aa0'][i % 5]; const sz = (o.fine ? 3 : 7) * s; g.fillRect(x + (R() - 0.5) * 90 * s, y - 46 * s + (R() - 0.5) * 12 * s, sz, sz); } if (o.mush) { g.fillStyle = 'rgba(240,230,190,.9)'; g.beginPath(); g.ellipse(x, y - 42 * s, 50 * s, 9 * s, 0, 0, 7); g.fill(); } },
  board(g, x, y, s, o) { rr(g, x - 80 * s, y - 10 * s, 160 * s, 10 * s, 4 * s); g.fillStyle = '#c99a62'; g.fill(); const R = rng(2); for (let i = 0; i < 14; i++) { g.fillStyle = ['#f2c14e', '#e8743a', '#7fbf5a'][i % 3]; g.fillRect(x - 60 * s + R() * 70 * s, y - 18 * s + R() * 4 * s, 7 * s, 7 * s); } },
  veg(g, x, y, s, o) { const R = rng(o.seed || 7); for (let i = 0; i < (o.n || 9); i++) { const c = ['#c9a26a', '#e8743a', '#5fa84a', '#f4efe6'][i % 4], dx = (R() - 0.5) * 100 * s, dy = -R() * 40 * s; g.fillStyle = c; g.beginPath(); g.ellipse(x + dx, y + dy - 10 * s, (i % 4 === 1 ? 6 : 13) * s, (i % 4 === 1 ? 20 : 10) * s, i % 4 === 1 ? 0.8 : 0, 0, 7); g.fill(); } },
  paper(g, x, y, s, o) { const w = (o.w || 140) * s, h = (o.h || 220) * s; g.save(); g.translate(x, y - h / 2); g.rotate(o.rot || 0); g.fillStyle = '#f7f1e2'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-w / 2, -h / 2, w, 10 * s);
    const lines = o.lines || []; const lh = (h - 24 * s) / Math.max(1, lines.length);
    lines.forEach((l, i) => fitText(g, l, 0, -h / 2 + 16 * s + lh * (i + 0.5), w - 18 * s, lh * 0.9, { color: o.ink || '#2a2a44', font: o.font || FONTS.ui, weight: 900 }));
    if (o.arrow) { seg(g, [[0, h / 2 - 30 * s], [0, h / 2 - 6 * s]], 4 * s, '#c0262a'); poly(g, [[-8 * s, h / 2 - 14 * s], [8 * s, h / 2 - 14 * s], [0, h / 2 - 2 * s]], '#c0262a'); }
    g.restore(); },
  holodets(g, x, y, s, o) { // эмалированная кастрюля с отбитым краем; o.coat — укутана в пальто
    if (o.coat) { g.fillStyle = '#5a4a3a'; g.beginPath(); g.ellipse(x, y - 40 * s, 66 * s, 46 * s, 0, 0, 7); g.fill(); seg(g, [[x - 40 * s, y - 70 * s], [x + 30 * s, y - 20 * s]], 6 * s, '#3a2e24'); circle(g, x + 10 * s, y - 50 * s, 4 * s, '#c9a24a'); circle(g, x - 6 * s, y - 34 * s, 4 * s, '#c9a24a'); return; }
    rr(g, x - 55 * s, y - 70 * s, 110 * s, 70 * s, 10 * s); g.fillStyle = '#f2f2ee'; g.fill(); g.fillStyle = '#3a6ea5'; g.fillRect(x - 58 * s, y - 74 * s, 116 * s, 9 * s); circle(g, x + 30 * s, y - 70 * s, 6 * s, '#2a2a33');
    for (const dx of [-1, 1]) seg(g, [[x + dx * 55 * s, y - 55 * s], [x + dx * 68 * s, y - 55 * s]], 7 * s, '#3a6ea5');
    poly(g, [[x - 20 * s, y - 40 * s], [x - 8 * s, y - 32 * s], [x - 18 * s, y - 26 * s]], '#c96f45'); // цветочек
    if (o.lidOff) { g.fillStyle = '#d9c9a0'; g.beginPath(); g.ellipse(x, y - 70 * s, 52 * s, 9 * s, 0, 0, 7); g.fill(); } },
  mandarin(g, x, y, s, o) { const r = (o.r || 14) * s; circle(g, x, y - r, r, '#ff8a1e'); circle(g, x - r * 0.3, y - r * 1.3, r * 0.25, 'rgba(255,255,255,.35)'); g.fillStyle = '#3f8a3a'; g.beginPath(); g.ellipse(x + r * 0.3, y - r * 2.0, r * 0.45, r * 0.2, -0.5, 0, 7); g.fill(); },
  mandarins(g, x, y, s, o) { for (let i = 0; i < (o.n || 6); i++) NY.mandarin(g, x + ((i % 3) - 1) * 26 * s, y - Math.floor(i / 3) * 18 * s, s, {}); },
  vase(g, x, y, s, o) { g.fillStyle = 'rgba(200,230,255,.5)'; g.beginPath(); g.moveTo(x - 60 * s, y - 50 * s); g.quadraticCurveTo(x, y + 10 * s, x + 60 * s, y - 50 * s); g.closePath(); g.fill(); NY.mandarins(g, x, y - 36 * s, s, { n: 6 }); },
  champagne(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -12 * s, -60 * s, 24 * s, 60 * s, 8 * s); g.fillStyle = '#1e3a2a'; g.fill(); g.fillRect(-5 * s, -84 * s, 10 * s, 26 * s); g.fillStyle = '#d4af37'; g.fillRect(-6 * s, -86 * s, 12 * s, 14 * s); g.fillStyle = '#f4efe6'; g.fillRect(-12 * s, -40 * s, 24 * s, 16 * s); g.restore(); },
  bucket(g, x, y, s, o) { NY.champagne(g, x, y - 20 * s, s, { rot: 0.15 }); poly(g, [[x - 34 * s, y - 46 * s], [x + 34 * s, y - 46 * s], [x + 26 * s, y], [x - 26 * s, y]], '#c9cdd4'); },
  glassC(g, x, y, s, o) { g.strokeStyle = 'rgba(230,240,255,.85)'; g.lineWidth = 2.5 * s; g.beginPath(); g.moveTo(x - 9 * s, y - 50 * s); g.lineTo(x - 6 * s, y - 22 * s); g.lineTo(x + 6 * s, y - 22 * s); g.lineTo(x + 9 * s, y - 50 * s); g.stroke(); seg(g, [[x, y - 22 * s], [x, y]], 2.5 * s, 'rgba(230,240,255,.85)'); seg(g, [[x - 8 * s, y], [x + 8 * s, y]], 2.5 * s, 'rgba(230,240,255,.85)'); g.fillStyle = 'rgba(255,220,120,.7)'; g.fillRect(x - 7 * s, y - 42 * s, 14 * s, 18 * s); },
  radio(g, x, y, s, o) { rr(g, x - 70 * s, y - 70 * s, 140 * s, 70 * s, 10 * s); g.fillStyle = '#6a4a32'; g.fill(); rr(g, x - 60 * s, y - 60 * s, 70 * s, 50 * s, 6 * s); g.fillStyle = '#2a2018'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[x - 55 * s, y - 52 * s + i * 9 * s], [x + 5 * s, y - 52 * s + i * 9 * s]], 2 * s, '#4a3a2a'); circle(g, x + 38 * s, y - 35 * s, 14 * s, '#d9c9a0'); seg(g, [[x + 38 * s, y - 35 * s], [x + 38 * s + Math.cos(o.dial || 0) * 11 * s, y - 35 * s + Math.sin(o.dial || 0) * 11 * s]], 3 * s, '#2a2018'); seg(g, [[x + 50 * s, y - 70 * s], [x + 90 * s, y - 150 * s]], 3 * s, '#9aa3b2'); if (o.on) glow(g, x - 25 * s, y - 35 * s, 60 * s, '#ffd47e', 0.4); },
  thermos(g, x, y, s, o) { rr(g, x - 13 * s, y - 70 * s, 26 * s, 70 * s, 8 * s); g.fillStyle = '#3a8a5a'; g.fill(); rr(g, x - 11 * s, y - 84 * s, 22 * s, 16 * s, 4 * s); g.fillStyle = '#c9cdd4'; g.fill(); g.fillStyle = '#f4efe6'; g.fillRect(x - 13 * s, y - 46 * s, 26 * s, 8 * s); },
  pcup(g, x, y, s, o) { poly(g, [[x - 11 * s, y - 32 * s], [x + 11 * s, y - 32 * s], [x + 8 * s, y], [x - 8 * s, y]], 'rgba(240,240,250,.9)'); g.fillStyle = 'rgba(160,90,40,.8)'; g.fillRect(x - 9 * s, y - 26 * s, 18 * s, 6 * s); if (o.steam !== false) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2 * s; const t = o.t || 0; g.beginPath(); for (let k = 0; k < 8; k++) g.lineTo(x + Math.sin(t * 3 + k) * 3 * s, y - 36 * s - k * 5 * s); g.stroke(); } },
  sack(g, x, y, s, o) { g.fillStyle = '#c8322a'; g.beginPath(); g.moveTo(x - 50 * s, y); g.quadraticCurveTo(x - 62 * s, y - 70 * s, x - 18 * s, y - 92 * s); g.lineTo(x + 18 * s, y - 92 * s); g.quadraticCurveTo(x + 62 * s, y - 70 * s, x + 50 * s, y); g.closePath(); g.fill(); seg(g, [[x - 20 * s, y - 92 * s], [x + 20 * s, y - 92 * s]], 6 * s, '#f2c21a'); for (const [dx, dy] of [[-20, -40], [15, -60], [25, -25]]) { g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(x + dx * s, y + dy * s, 5 * s, 0, 7); g.fill(); } },
  staff(g, x, y, s, o) { seg(g, [[x, y], [x, y - 230 * s]], 6 * s, '#d8c9a8'); circle(g, x, y - 236 * s, 12 * s, '#9fd8ff'); glow(g, x, y - 236 * s, 40 * s, '#cfefff', 0.5); },
  tractor(g, x, y, s, o) { g.save(); g.translate(x, y); g.scale(o.flip ? -1 : 1, 1); const c = '#2f7a3a';
    rr(g, -170 * s, -150 * s, 230 * s, 80 * s, 10 * s); g.fillStyle = c; g.fill(); rr(g, -150 * s, -300 * s, 140 * s, 160 * s, 8 * s); g.fillStyle = shade(c, -0.1); g.fill(); g.fillStyle = o.lit ? '#ffe7b0' : '#9fb4c8'; g.fillRect(-138 * s, -286 * s, 116 * s, 80 * s);
    if (o.driver) circle(g, -80 * s, -240 * s, 22 * s, INK());
    circle(g, -120 * s, -70 * s, 70 * s, '#141218'); circle(g, -120 * s, -70 * s, 30 * s, '#e1b12c'); circle(g, 40 * s, -42 * s, 42 * s, '#141218'); circle(g, 40 * s, -42 * s, 18 * s, '#e1b12c');
    circle(g, 60 * s, -128 * s, 12 * s, '#fff6d0'); if (o.lights) { glow(g, 70 * s, -128 * s, 260 * s, '#fff2c2', 0.55); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,240,190,.12)'; g.beginPath(); g.moveTo(70 * s, -128 * s); g.lineTo(900 * s, -280 * s); g.lineTo(900 * s, 60 * s); g.closePath(); g.fill(); g.restore(); }
    // гирлянда на кабине
    const tt = o.t || 0; for (let i = 0; i <= 8; i++) { const xx = -150 * s + i * 17.5 * s, yy = -300 * s + Math.sin(i / 8 * Math.PI) * 8 * s; const cc = BALLC[i % 6], on = Math.sin(tt * 5 + i) > -0.2; circle(g, xx, yy, 5 * s, on ? cc : shade(cc, -0.6)); if (on) glow(g, xx, yy, 20 * s, cc, 0.45); }
    g.restore(); },
  jar(g, x, y, s, o) { rr(g, x - 22 * s, y - 60 * s, 44 * s, 60 * s, 8 * s); g.fillStyle = 'rgba(180,220,180,.55)'; g.fill(); for (let i = 0; i < 4; i++) { g.fillStyle = '#4f8a3a'; g.beginPath(); g.ellipse(x - 10 * s + (i % 2) * 18 * s, y - 14 * s - i * 11 * s, 7 * s, 13 * s, 0.3, 0, 7); g.fill(); } g.fillStyle = '#c9a24a'; g.fillRect(x - 20 * s, y - 66 * s, 40 * s, 8 * s); },
  pirozhki(g, x, y, s, o) { g.fillStyle = '#e8e2d8'; g.beginPath(); g.ellipse(x, y - 4 * s, 70 * s, 12 * s, 0, 0, 7); g.fill(); for (let i = 0; i < (o.n || 5); i++) { g.fillStyle = '#d99a4a'; g.beginPath(); g.ellipse(x - 40 * s + i * 20 * s, y - 14 * s - (i % 2) * 8 * s, 18 * s, 10 * s, 0.1, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,200,.35)'; g.fillRect(x - 48 * s + i * 20 * s, y - 20 * s - (i % 2) * 8 * s, 14 * s, 3 * s); } },
  cat(g, x, y, s, o) { // кот сидит: o.mode = 'sit' | 'sleep' | 'swipe' (лапа), o.f направление
    const f = o.f || 1, c = o.color || '#3a3036', t = o.t || 0; g.save(); g.translate(x, y); g.scale(f * s, s);
    if (o.mode === 'sleep') { g.fillStyle = c; g.beginPath(); g.ellipse(0, -18, 46, 20, 0, 0, 7); g.fill(); circle(g, 34, -22, 16, c); poly(g, [[26, -34], [32, -46], [38, -34]], c); poly(g, [[38, -34], [44, -46], [48, -32]], c); seg(g, [[28, -22], [36, -22]], 2, '#f4efe6'); g.restore(); return; }
    const tail = Math.sin(t * 2.2) * 0.4; g.strokeStyle = c; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-22, -10); g.quadraticCurveTo(-60, -10 + tail * 20, -50, -60 + tail * 30); g.stroke();
    g.fillStyle = c; g.beginPath(); g.ellipse(0, -36, 30, 38, 0, 0, 7); g.fill(); circle(g, 8, -86, 24, c); poly(g, [[-8, -102], [-4, -124], [8, -106]], c); poly(g, [[12, -106], [24, -124], [28, -100]], c);
    circle(g, 2, -90, 6, '#c8e86a'); circle(g, 18, -90, 6, '#c8e86a'); circle(g, 3, -90, 2.5, '#141218'); circle(g, 19, -90, 2.5, '#141218');
    if (o.mode === 'swipe') { const k = Math.abs(Math.sin(t * 6)); seg(g, [[14, -50], [36 + k * 20, -70 - k * 20]], 9, c); } else seg(g, [[10, -10], [12, 0]], 9, c);
    g.restore(); },
  shards(g, x, y, s, o) { const R = rng(3), k = clamp(o.k ?? 1); for (let i = 0; i < 12; i++) { const a = R() * 3.14 + 3.14, d = (20 + R() * 60) * s * k; poly(g, [[x + Math.cos(a) * d, y + Math.sin(a) * d * 0.4], [x + Math.cos(a) * d + 8 * s, y + Math.sin(a) * d * 0.4 + 3 * s], [x + Math.cos(a) * d + 2 * s, y + Math.sin(a) * d * 0.4 + 8 * s]], i % 2 ? '#f2c21a' : '#fff3b0'); } },
  wish(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.05); g.fillStyle = '#fbf6e8'; g.fillRect(-90 * s, -60 * s, 180 * s, 60 * s); g.strokeStyle = 'rgba(90,120,200,.35)'; g.lineWidth = 1.5 * s; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-90 * s, -60 * s + i * 15 * s); g.lineTo(90 * s, -60 * s + i * 15 * s); g.stroke(); } fitText(g, o.label || '', 0, -30 * s, 166 * s, 50 * s, { color: '#1e2a6a', font: FONTS.serif, weight: 900 }); g.restore(); },
  notebook(g, x, y, s, o) { rr(g, x - 40 * s, y - 56 * s, 80 * s, 56 * s, 4 * s); g.fillStyle = '#e2394f'; g.fill(); g.fillStyle = '#fbf6e8'; g.fillRect(x - 34 * s, y - 50 * s, 68 * s, 44 * s); for (let i = 0; i < 4; i++) seg(g, [[x - 28 * s, y - 42 * s + i * 10 * s], [x + 26 * s, y - 42 * s + i * 10 * s]], 1.5 * s, 'rgba(60,60,140,.4)'); },
  steering(g, x, y, s, o) { ring(g, x, y, 60 * s, 12 * s, '#22222a'); seg(g, [[x - 58 * s, y], [x + 58 * s, y]], 10 * s, '#22222a'); seg(g, [[x, y], [x, y + 58 * s]], 10 * s, '#22222a'); },
  kremlin(g, x, y, s, o) { // Спасская башня с курантами
    const c = '#8a2a24', w = 120 * s; g.fillStyle = c; g.fillRect(x - w / 2, y - 420 * s, w, 420 * s); g.fillRect(x - w * 0.38, y - 520 * s, w * 0.76, 110 * s); poly(g, [[x - w * 0.3, y - 520 * s], [x + w * 0.3, y - 520 * s], [x, y - 700 * s]], '#3a6a4a');
    poly(g, [[x - 14 * s, y - 700 * s], [x + 14 * s, y - 700 * s], [x, y - 730 * s]], '#e2394f'); glow(g, x, y - 714 * s, 50 * s, '#ff4a3a', 0.7);
    circle(g, x, y - 360 * s, 44 * s, '#f4efe6'); ring(g, x, y - 360 * s, 44 * s, 6 * s, '#d4af37'); const a = (o.a ?? -Math.PI / 2); seg(g, [[x, y - 360 * s], [x + Math.cos(a) * 34 * s, y - 360 * s + Math.sin(a) * 34 * s]], 4 * s, '#1a1622'); seg(g, [[x, y - 360 * s], [x + Math.cos(a - 0.05) * 24 * s, y - 360 * s + Math.sin(a - 0.05) * 24 * s]], 6 * s, '#1a1622');
    for (let i = 0; i < 5; i++) { g.fillStyle = '#ffd88a'; g.fillRect(x - 40 * s + i * 18 * s, y - 220 * s, 8 * s, 30 * s); } glow(g, x, y - 360 * s, 140 * s, '#fff3d6', 0.25); },
  terem(g, x, y, s, o) { g.fillStyle = '#8a5a3a'; g.fillRect(x - 160 * s, y - 220 * s, 320 * s, 220 * s); poly(g, [[x - 190 * s, y - 220 * s], [x + 190 * s, y - 220 * s], [x, y - 380 * s]], '#c0453a'); g.fillRect(x - 60 * s, y - 470 * s, 120 * s, 150 * s); poly(g, [[x - 80 * s, y - 470 * s], [x + 80 * s, y - 470 * s], [x, y - 580 * s]], '#3a6ea5'); for (const dx of [-100, 0, 100]) { g.fillStyle = '#ffe7b0'; g.fillRect(x + dx * s - 25 * s, y - 170 * s, 50 * s, 60 * s); glow(g, x + dx * s, y - 140 * s, 70 * s, '#ffd88a', 0.3); } g.fillStyle = '#f4f8ff'; g.fillRect(x - 200 * s, y - 226 * s, 400 * s, 10 * s); },
  key(g, x, y, s, o) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); rr(g, -14 * s, -24 * s, 28 * s, 24 * s, 6 * s); g.fillStyle = '#2a2a33'; g.fill(); rr(g, -4 * s, 0, 8 * s, 34 * s, 2 * s); g.fillStyle = '#c9cdd4'; g.fill(); g.fillRect(4 * s, 14 * s, 6 * s, 4 * s); g.fillRect(4 * s, 24 * s, 6 * s, 4 * s); g.restore(); },
  // корпус машины поверх сидящих людей (низ дверей, стойки, крыша, колёса, стёкла)
  carShell(g, x, y, s, o) {
    const c = o.color || '#4a6a8a', d = shade(c, -0.25), t = o.t || 0, B = y - 215, R = y - 370;
    const KX = 0.85; g.save(); g.translate(x, 0); g.scale(KX, 1); g.translate(-x, 0);
    // крыша и стойки
    g.fillStyle = c;
    g.beginPath(); g.moveTo(x - 620, B); g.lineTo(x - 490, R); g.lineTo(x + 380, R); g.lineTo(x + 500, B); g.lineTo(x + 470, B); g.lineTo(x + 360, R + 18); g.lineTo(x - 470, R + 18); g.lineTo(x - 580, B); g.closePath(); g.fill();
    poly(g, [[x - 10, R + 10], [x + 26, R + 10], [x + 30, B], [x - 14, B]], d);        // средняя стойка
    poly(g, [[x - 580, B], [x - 470, R + 18], [x - 446, R + 18], [x - 548, B]], d);
    // стёкла: лёгкий голубой отблеск + блики
    const glass = (pts) => { g.save(); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip(); g.fillStyle = 'rgba(170,200,255,.10)'; g.fillRect(x - 800, R - 10, 1600, 400); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 10; for (const k of [0, 1]) { g.beginPath(); g.moveTo(x - 400 + k * 520 + ((t * 20) % 40), B); g.lineTo(x - 300 + k * 520 + ((t * 20) % 40), R); g.stroke(); } if (o.fog) { g.fillStyle = `rgba(232,238,250,${0.38 * o.fog})`; g.fillRect(x - 800, R - 10, 1600, 400); } g.restore(); };
    glass([[x - 548, B], [x - 446, R + 18], [x - 10, R + 18], [x - 14, B]]);
    glass([[x + 30, B], [x + 26, R + 18], [x + 360, R + 18], [x + 470, B]]);
    // нижняя часть: двери, капот, багажник
    g.fillStyle = c; g.beginPath(); g.moveTo(x - 760, B + 20); g.quadraticCurveTo(x - 760, B, x - 700, B); g.lineTo(x + 520, B); g.quadraticCurveTo(x + 760, B + 4, x + 785, B + 50); g.lineTo(x + 790, y - 100); g.quadraticCurveTo(x + 790, y - 60, x + 750, y - 60); g.lineTo(x - 740, y - 60); g.quadraticCurveTo(x - 770, y - 60, x - 768, y - 100); g.closePath(); g.fill();
    g.fillStyle = shade(c, 0.12); g.fillRect(x - 700, B + 4, 1220, 10);                                            // блик по поясу
    g.fillStyle = d; g.fillRect(x - 760, y - 120, 1550, 12);                                                     // молдинг
    for (const dx of [-14, 30]) seg(g, [[x + dx, B + 6], [x + dx, y - 70]], 3, d);                               // швы дверей
    seg(g, [[x - 548, B + 6], [x - 560, y - 74]], 3, d); seg(g, [[x + 470, B + 6], [x + 470, y - 74]], 3, d);
    for (const hx of [x - 120, x + 330]) { rr(g, hx, B + 30, 50, 10, 5); g.fillStyle = shade(c, 0.3); g.fill(); }  // ручки
    rr(g, x + 440, B - 30, 40, 24, 6); g.fillStyle = d; g.fill();                                                 // зеркало
    // фары и фонари
    rr(g, x + 745, B + 30, 40, 26, 8); g.fillStyle = '#fff2c2'; g.fill(); if (o.headlights) glow(g, x + 790, B + 44, 220, '#fff2c2', 0.5);
    rr(g, x - 770, B + 30, 26, 26, 6); g.fillStyle = '#c0262a'; g.fill();
    if (o.hazard) { const on = Math.floor(t * 2.2) % 2 === 0; for (const hx of [x + 760, x - 760]) { circle(g, hx, B + 74, 10, on ? '#ffb02a' : '#6a4a1a'); if (on) glow(g, hx, B + 74, 120, '#ffb02a', 0.55); } }
    // снег на крыше и капоте
    g.fillStyle = 'rgba(240,244,255,.9)'; rr(g, x - 480, R - 10, 850, 14, 7); g.fill(); rr(g, x + 520, B - 6, 240, 10, 5); g.fill();
    g.restore();
    // колёса и арки (вне сжатия, чтобы остались круглыми)
    for (const wx of [x - 480 * KX, x + 480 * KX]) { g.fillStyle = '#141218'; g.beginPath(); g.arc(wx, y - 70, 92, Math.PI, 0); g.fill(); circle(g, wx, y - 70, 70, '#141218'); circle(g, wx, y - 70, 34, '#8a8f9c'); circle(g, wx, y - 70, 10, '#3a3a44'); }
  },
  blink(g, x, y, s, o) { const on = Math.floor((o.t || 0) * 2.2) % 2 === 0; circle(g, x, y, 8 * s, on ? '#ffb02a' : '#5a3a1a'); if (on) glow(g, x, y, 90 * s, '#ffb02a', 0.6); },
  table(g, x, y, s, o) { // праздничный стол со скатертью
    const w = (o.w || 420) * s; g.fillStyle = o.cloth || '#f4efe6'; g.fillRect(x - w / 2, y - 110 * s, w, 30 * s); poly(g, [[x - w / 2, y - 80 * s], [x + w / 2, y - 80 * s], [x + w / 2 - 6 * s, y - 40 * s], [x - w / 2 + 6 * s, y - 40 * s]], shade(o.cloth || '#f4efe6', -0.08)); for (const dx of [-1, 1]) seg(g, [[x + dx * (w / 2 - 20 * s), y - 40 * s], [x + dx * (w / 2 - 20 * s), y]], 8 * s, '#4a3028'); },
};
