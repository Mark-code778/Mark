// sets/places6.js — декорации «Что, если ты станешь в 100 раз быстрее?»: городская улица с зеброй, светофором
// и остановкой, магазин у дома, комната Артёма с компьютером, кухня бабушки. Плюс реквизит: кружка с котиком,
// облако кофе, банка варенья, палочка, зонт, летучие мыши, машина сбоку. Всё якорится к GY и CX.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, text, FONTS, clamp, lerp, ease } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const ground = () => E.H * V(0.8, 0.68);
function paintWall(g, GY, c, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(c, -0.12 + k), shade(c, k), shade(c, -0.22 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }
function floor(g, M, GY, c) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(c || M.floor, -0.02), shade(c || M.dark, -0.2)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.18), 0.07); }
const dim = (g, k) => { if (!k) return; g.fillStyle = `rgba(8,10,24,${k})`; g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5); };
function sky(g, M, x, y, w, h, o = {}) {
  if (o.night) { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#10142c', '#262a4c']); g.fillRect(x, y, w, h); circle(g, x + w * 0.7, y + h * 0.3, 16, '#f4ecd0'); }
  else { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); }
  FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: alpha('#5a6080', 0.75), windowColor: alpha('#ffd59a', 0.5), seed: 7 });
}

// ── реквизит
// кружка с котиком (кошачьи ушки на ободке). broken — осколки
export function mug(g, x, y, o = {}) {
  const s = o.s ?? 1; g.save(); g.translate(x, y); g.scale(s, s);
  if (o.broken) { for (const [dx, dy, r, a] of [[-60, -10, 26, 0.4], [-10, -40, 20, -0.8], [40, -6, 30, 1.2], [80, -30, 16, 2.1], [-90, -36, 14, 0.9]]) { g.save(); g.translate(dx, dy); g.rotate(a + (o.t || 0) * 0.3); poly(g, [[-r, 0], [r * 0.4, -r], [r, r * 0.5], [-r * 0.2, r * 0.8]], '#f4efe6'); g.restore(); } g.restore(); return; }
  rr(g, -46, -110, 92, 110, 14); g.fillStyle = '#f4efe6'; g.fill(); ring(g, 58, -58, 26, 10, '#f4efe6');
  poly(g, [[-30, -106], [-22, -132], [-10, -106]], '#f4efe6'); poly(g, [[10, -106], [22, -132], [30, -106]], '#f4efe6');
  circle(g, -12, -62, 5, '#2a2a30'); circle(g, 12, -62, 5, '#2a2a30'); poly(g, [[-5, -50], [5, -50], [0, -44]], '#f29ac0');
  for (const d of [-1, 1]) { seg(g, [[d * 18, -46], [d * 36, -50]], 2, '#2a2a30'); seg(g, [[d * 18, -42], [d * 36, -38]], 2, '#2a2a30'); }
  if (o.full) { g.fillStyle = '#6a4028'; g.fillRect(-40, -106, 80, 10); }
  g.restore();
}
// облако кофе в форме кружки, медленно оседает
export function coffee(g, x, y, o = {}) {
  const s = o.s ?? 1, k = o.sink ?? 0; g.save(); g.translate(x, y + k * 40); g.scale(s, s);
  g.fillStyle = alpha('#7a4a28', 0.88); g.beginPath(); g.ellipse(0, -60, 44, 54 - k * 10, 0, 0, 7); g.fill();
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 50 + (i % 4) * 12; circle(g, Math.cos(a) * r * 0.9, -60 + Math.sin(a) * r * 0.8 + k * 20, 6 + (i % 3) * 3, alpha('#8a5a34', 0.85)); }
  glow(g, -14, -80, 40, '#f4c890', 0.25); g.restore();
}
// банка варенья
export function jar(g, x, y, o = {}) {
  const s = o.s ?? 1; g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  rr(g, -34, -90, 68, 90, 14); g.fillStyle = '#b02a3a'; g.fill(); rr(g, -38, -104, 76, 18, 6); g.fillStyle = '#e8c070'; g.fill();
  rr(g, -26, -66, 52, 34, 4); g.fillStyle = '#f4efe6'; g.fill(); glow(g, -14, -60, 30, '#ffffff', 0.2); g.restore();
}
// палочка бабушки
export function cane(g, x, GY, s = 1) { seg(g, [[x, GY], [x, GY - 160 * s]], 7 * s, '#5a3a24'); g.strokeStyle = '#5a3a24'; g.lineWidth = 7 * s; g.beginPath(); g.arc(x - 14 * s, GY - 160 * s, 14 * s, 0, Math.PI, true); g.stroke(); }
// зонт над головой
export function umbrella(g, x, y, c = '#2a3a5a') {
  g.fillStyle = c; g.beginPath(); g.moveTo(x - 160, y); g.quadraticCurveTo(x, y - 170, x + 160, y);
  for (let i = 4; i >= 0; i--) g.quadraticCurveTo(x - 160 + i * 64 + 32, y - 26, x - 160 + i * 64, y); g.fill();
  seg(g, [[x, y - 90], [x, y + 160]], 6, '#1a1a20');
}
// летучая мышь
export function bat(g, x, y, s, t, ph = 0) {
  const fl = Math.sin(t * 9 + ph) * 0.6; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#16121e'; g.strokeStyle = 'rgba(190,170,240,.7)'; g.lineWidth = 2.5;
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(d * 30, -20 - fl * 20); g.lineTo(d * 60, -6 - fl * 30); g.lineTo(d * 48, 8); g.lineTo(d * 34, 2); g.lineTo(d * 22, 10); g.closePath(); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(0, 2, 10, 14, 0, 0, 7); g.fill(); poly(g, [[-8, -8], [-6, -20], [-1, -10]], '#16121e'); poly(g, [[8, -8], [6, -20], [1, -10]], '#16121e'); g.restore();
}
// легковушка сбоку (носом по dir)
export function sedan(g, x, GY, o = {}) {
  const d = o.dir ?? 1, c = o.c || '#c0302a'; g.save(); g.translate(x, GY); g.scale(d * (o.s ?? 1), o.s ?? 1);
  rr(g, -230, -120, 460, 80, 30); g.fillStyle = c; g.fill();
  g.beginPath(); g.moveTo(-140, -118); g.lineTo(-90, -190); g.lineTo(80, -190); g.lineTo(150, -118); g.closePath(); g.fillStyle = shade(c, -0.1); g.fill();
  poly(g, [[-120, -122], [-82, -176], [-10, -176], [-10, -122]], '#9fc4e0'); poly(g, [[4, -122], [4, -176], [72, -176], [124, -122]], '#9fc4e0');
  circle(g, 200, -90, 14, '#fff2b0'); if (o.lights) glow(g, 220, -90, 200, '#fff2b0', 0.4);
  for (const wx of [-140, 140]) { circle(g, wx, -40, 44, '#16161c'); circle(g, wx, -40, 20, '#9aa0aa'); }
  if (o.driver) { circle(g, -30, -150, 22, '#141418'); rr(g, -14, -142, 20, 30, 4); g.fillStyle = '#7fb8ff'; g.fill(); glow(g, -4, -128, 40, '#7fb8ff', 0.5); }
  g.restore();
}
// светофор (пешеходный): light — 'green' | 'red'
export function tlight(g, x, GY, light = 'green') {
  seg(g, [[x, GY], [x, GY - 520]], 14, '#2a2a30'); rr(g, x - 46, GY - 620, 92, 170, 14); g.fillStyle = '#1a1a20'; g.fill();
  circle(g, x, GY - 578, 30, light === 'red' ? '#ff3a2a' : '#4a1a1a'); circle(g, x, GY - 498, 30, light === 'green' ? '#3fe07a' : '#1a3a24');
  glow(g, x, light === 'red' ? GY - 578 : GY - 498, 120, light === 'red' ? '#ff3a2a' : '#3fe07a', 0.45);
}

// ── городская улица: дома, тротуар, проезжая часть; zebra — пешеходный переход, tl — светофор (x), shelter — остановка (x)
export function city(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.clouds(g, { y: GY - V(800, 1300), h: 160, color: o.rain ? '#9aa0b0' : '#ffffff', a: o.rain ? 0.4 : 0.12, seed: 6 }); });
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - V(420, 700), w: E.W * 3, maxH: V(420, 700), color: mix(M.sky[0], M.dark, 0.5), windowColor: alpha(M.practical, 0.4), lit: 0.15, seed: 14 }));
  layer(g, cam, 0.5, (g) => {
    const cols = [shade(M.wall, 0.05), shade(M.wall, -0.12), shade(M.wall, 0.12), shade(M.wall, -0.05)];
    for (let i = -4; i <= 4; i++) FX.facade(g, { x: CX + i * 460 - 230, y: GY - 130, w: 450, h: V(520 + (i % 3) * 70, 900), color: cols[(i + 8) % 4], win: alpha(M.practical, 0.8), dark: shade(M.dark, -0.1), cols: 4, rows: 4, lit: o.lit ?? 0.2, seed: 20 + i });
    if (o.shop != null) { const sx = CX + o.shop; rr(g, sx - 200, GY - 390, 400, 260, 6); g.fillStyle = alpha(M.practical, 0.55); g.fill(); g.strokeStyle = shade(M.dark, -0.3); g.lineWidth = 10; g.strokeRect(sx - 200, GY - 390, 400, 260); rr(g, sx - 160, GY - 450, 320, 50, 8); g.fillStyle = '#3a8a5a'; g.fill(); text(g, 'ПРОДУКТЫ', sx, GY - 424, { size: 34, font: FONTS.ui, weight: 900, color: '#f4efe6' }); }
  });
  layer(g, cam, 0.9, (g) => {
    // тротуар
    g.fillStyle = shade(M.road, 0.45); g.fillRect(-E.W * 2, GY - 130, E.W * 5, 130); seg(g, [[-E.W * 2, GY - 6], [E.W * 3, GY - 6]], 12, shade(M.road, 0.6));
    // проезжая часть
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.road, -0.05), shade(M.road, -0.25)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    if (o.zebra != null) for (let i = -3; i <= 3; i++) { g.save(); g.translate(CX + o.zebra + i * 90, GY + 10); g.transform(1, 0, -0.5, 1, 0, 0); g.fillStyle = alpha('#f4efe6', 0.85); g.fillRect(-28, 0, 56, 210); g.restore(); }
    else for (let i = -8; i < 10; i++) { rr(g, CX + i * 240, GY + 100, 130, 12, 6); g.fillStyle = alpha('#f4efe6', 0.6); g.fill(); }
    if (o.rain) { g.fillStyle = alpha('#c8d8f0', 0.12); g.fillRect(-E.W * 2, GY, E.W * 5, 200); }
    for (const lx of [-900, 900]) FX.lampPost(g, CX + lx, GY - 6, 330, { light: M.practical, on: !!o.night, a: 0.18 });
    if (o.shelter != null) { const sx = CX + o.shelter; rr(g, sx - 260, GY - 420, 520, 26, 6); g.fillStyle = '#2a3440'; g.fill(); g.fillStyle = alpha('#bfe0f4', 0.25); g.fillRect(sx - 250, GY - 394, 500, 300); seg(g, [[sx - 250, GY - 394], [sx - 250, GY - 6]], 10, '#2a3440'); seg(g, [[sx + 250, GY - 394], [sx + 250, GY - 6]], 10, '#2a3440'); rr(g, sx - 160, GY - 150, 320, 18, 6); g.fillStyle = '#6a5040'; g.fill(); rr(g, sx + 150, GY - 560, 70, 70, 35); g.fillStyle = '#2a7ac0'; g.fill(); text(g, 'А', sx + 185, GY - 524, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' }); }
    if (o.tl != null) tlight(g, CX + o.tl, GY - 6, o.light || 'green');
  });
  return { GY, CX, M };
}

// ── магазин у дома: стеллажи, касса, кафель
export function shop(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#d8e0d8');
    for (let r = 0; r < 4; r++) for (const sx of [-760, -260, 240]) { const x = CX + sx, y = GY - 620 + r * 140; rr(g, x - 210, y + 100, 420, 14, 4); g.fillStyle = '#9aa0aa'; g.fill();
      for (let i = 0; i < 9; i++) { const c = ['#e8622a', '#3a8a5a', '#f2c21a', '#4aa8e8', '#c0453a', '#f4efe6'][(i * 5 + r * 3 + (sx + 760) / 500 * 2) % 6]; rr(g, x - 200 + i * 46, y + 40 - (i % 3) * 10, 38, 60 + (i % 3) * 10, 4); g.fillStyle = c; g.fill(); } }
    for (let i = -3; i <= 3; i++) { rr(g, CX + i * 380 - 120, -E.H + 60, 240, 20, 6); g.fillStyle = '#f4fbff'; g.fill(); glow(g, CX + i * 380, -E.H + 80, 300, '#e8f4ff', 0.25); }
  });
  layer(g, cam, 0.8, (g) => { // касса справа
    const kx = CX + (o.tillX ?? 640); rr(g, kx - 220, GY - 190, 440, 190, 10); g.fillStyle = '#3a4452'; g.fill(); rr(g, kx - 230, GY - 206, 460, 24, 6); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, kx + 80, GY - 290, 110, 84, 8); g.fillStyle = '#1a1a22'; g.fill(); rr(g, kx + 90, GY - 282, 90, 60, 4); g.fillStyle = '#3fd07a'; g.fill();
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = '#c8ccd0'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); g.strokeStyle = alpha('#000000', 0.08); g.lineWidth = 2; for (let x = -E.W * 2; x < E.W * 3; x += 120) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x + (x - CX) * 0.6, GY + 400); g.stroke(); } for (let y = GY; y < GY + 400; y += 50) { g.beginPath(); g.moveTo(-E.W * 2, y); g.lineTo(E.W * 3, y); g.stroke(); } });
  return { GY, CX, M };
}

// ── комната Артёма: стол с компьютером, полка с книгами, окно (pigeon — голубь застыл за окном), кровать
export function myroom(g, t, cam, o = {}) {
  const M = mood(o.mood || (o.night ? 'night' : 'interiorWarm')), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, o.night ? '#4a5070' : '#a898c0');
    const wx = CX + (o.winX ?? -300);
    FX.windowFrame(g, { x: wx, y: GY - V(700, 1000), w: 340, h: 300, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => {
      sky(g, M, x, y, w, h, { night: o.night });
      if (o.pigeon) { const px = x + w * 0.62, py = y + h * 0.4; g.fillStyle = '#8a90a0'; g.beginPath(); g.ellipse(px, py, 34, 20, 0, 0, 7); g.fill(); circle(g, px + 28, py - 14, 13, '#8a90a0'); poly(g, [[px + 38, py - 14], [px + 50, py - 10], [px + 38, py - 7]], '#e0a040'); g.fillStyle = '#7a8090'; g.beginPath(); g.moveTo(px - 10, py - 6); g.lineTo(px - 50, py - 70); g.lineTo(px + 14, py - 12); g.fill(); g.beginPath(); g.moveTo(px - 4, py - 4); g.lineTo(px + 30, py - 78); g.lineTo(px + 18, py - 8); g.fill(); circle(g, px + 30, py - 17, 3, '#141414'); }
    });
    // книжная полка
    const bx = CX + 520; seg(g, [[bx - 170, GY - 560], [bx + 170, GY - 560]], 10, '#6a4a30'); seg(g, [[bx - 170, GY - 420], [bx + 170, GY - 420]], 10, '#6a4a30');
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const n = o.books ?? 9; if (r === 1 && i >= n) continue; rr(g, bx - 160 + i * 36, GY - 650 + r * 140 + (i % 3) * 6, 30, 86 - (i % 3) * 6, 3); g.fillStyle = ['#c0453a', '#3a6ea5', '#e8c070', '#3a8a5a', '#8a5ad6'][(i + r * 2) % 5]; g.fill(); }
    rr(g, CX - 760, GY - 640, 180, 220, 4); g.fillStyle = '#2a2a3a'; g.fill(); text(g, 'GG', CX - 670, GY - 530, { size: 72, font: FONTS.ui, weight: 900, color: '#e8622a' });
  });
  layer(g, cam, 0.8, (g) => {
    const dx = CX + (o.deskX ?? 180);
    rr(g, dx - 230, GY - 230, 460, 22, 6); g.fillStyle = '#5a4030'; g.fill(); seg(g, [[dx - 210, GY - 210], [dx - 210, GY]], 10, '#3a2a20'); seg(g, [[dx + 210, GY - 210], [dx + 210, GY]], 10, '#3a2a20');
    rr(g, dx - 130, GY - 440, 260, 170, 10); g.fillStyle = '#141418'; g.fill(); rr(g, dx - 118, GY - 428, 236, 146, 6); g.fillStyle = o.screen || '#2a4a7a'; g.fill(); glow(g, dx, GY - 360, 260, o.screen || '#5a9aff', 0.35);
    seg(g, [[dx, GY - 270], [dx, GY - 232]], 14, '#2a2a30'); rr(g, dx - 110, GY - 248, 160, 14, 4); g.fillStyle = '#2a2a30'; g.fill(); rr(g, dx + 80, GY - 250, 40, 18, 9); g.fillStyle = '#e8622a'; g.fill();
    if (o.bed !== false) FX.bed(g, { x: CX - 900, y: GY, w: 460, color: '#e8622a', frame: '#4a3020', pillow: '#f4efe6' });
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, o.night ? '#3a3a4a' : '#8a6a4a'));
  return { GY, CX, M, fg: o.night ? (g) => dim(g, 0.2) : null };
}

// ── кухня бабушки: обои в цветочек, окно с занавесками, стол с чайником, часы с кукушкой
export function gkitchen(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#e8d8b0');
    for (let x = -E.W * 2; x < E.W * 3; x += 120) for (let y = -E.H; y < GY; y += 120) { const ox = (Math.floor(y / 120) % 2) * 60; circle(g, x + ox, y, 8, alpha('#c06a5a', 0.25)); for (let k = 0; k < 4; k++) circle(g, x + ox + Math.cos(k * 1.57) * 12, y + Math.sin(k * 1.57) * 12, 6, alpha('#c06a5a', 0.18)); }
    const wx = CX + (o.winX ?? 260);
    FX.windowFrame(g, { x: wx, y: GY - V(720, 1000), w: 360, h: 320, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { night: o.night }));
    for (const d of [-1, 1]) { g.fillStyle = '#c0453a'; g.beginPath(); g.moveTo(wx + d * 200, GY - 740); g.quadraticCurveTo(wx + d * 150, GY - 560, wx + d * 210, GY - 380); g.lineTo(wx + d * 230, GY - 380); g.lineTo(wx + d * 230, GY - 740); g.fill(); }
    rr(g, wx - 230, GY - 752, 460, 16, 6); g.fillStyle = '#8a5a3c'; g.fill();
    // часы
    const cx2 = CX - 560; rr(g, cx2 - 70, GY - 700, 140, 170, 10); g.fillStyle = '#6a4028'; g.fill(); poly(g, [[cx2 - 86, GY - 700], [cx2, GY - 770], [cx2 + 86, GY - 700]], '#5a3420'); FX.clock(g, cx2, GY - 620, 52, 15 * 3600 + t * 60, { face: '#f2ede4' }); seg(g, [[cx2 - 20, GY - 530], [cx2 - 20, GY - 440]], 3, '#3a2a20'); circle(g, cx2 - 20, GY - 430, 12, '#c8a040');
    // сервант
    rr(g, CX - 900, GY - 420, 260, 420, 8); g.fillStyle = '#7a5034'; g.fill(); g.fillStyle = alpha('#d8ecf4', 0.35); g.fillRect(CX - 880, GY - 400, 220, 160); for (let i = 0; i < 4; i++) circle(g, CX - 850 + i * 54, GY - 300, 18, '#f4efe6');
  });
  layer(g, cam, 0.8, (g) => {
    const tx = CX + (o.tableX ?? -40); rr(g, tx - 280, GY - 200, 560, 26, 8); g.fillStyle = '#f4efe6'; g.fill(); for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#c0453a' : '#f4efe6'; g.fillRect(tx - 280 + i * 56, GY - 178, 56, 30); }
    for (const dx of [-250, 250]) seg(g, [[tx + dx, GY - 150], [tx + dx, GY]], 12, '#6a4a30');
    if (o.tea !== false) { rr(g, tx - 40, GY - 290, 90, 80, 30); g.fillStyle = '#e8e4f0'; g.fill(); seg(g, [[tx + 50, GY - 260], [tx + 90, GY - 290]], 10, '#e8e4f0'); circle(g, tx + 5, GY - 296, 10, '#c0453a'); for (const dx of [-170, 150]) { rr(g, tx + dx, GY - 236, 50, 36, 8); g.fillStyle = '#f4efe6'; g.fill(); ring(g, tx + dx + 56, GY - 218, 10, 5, '#f4efe6'); }
      for (let i = 0; i < 3; i++) { const k = (t * 0.4 + i / 3) % 1; g.strokeStyle = alpha('#ffffff', 0.3 * (1 - k)); g.lineWidth = 5; g.beginPath(); g.moveTo(tx + 90 + i * 8, GY - 300 - k * 80); g.quadraticCurveTo(tx + 100 + i * 8, GY - 330 - k * 80, tx + 88 + i * 8, GY - 360 - k * 80); g.stroke(); } }
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#9a7050'));
  return { GY, CX, M, fg: o.night ? (g) => dim(g, 0.25) : null };
}

// ── коридор в квартире родителей: обои в полоску, двери, вешалка, ламинат
export function hallway(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#c8a888');
    for (let x = -E.W * 2; x < E.W * 3; x += 70) { g.fillStyle = alpha('#ffffff', 0.08); g.fillRect(x, -E.H, 30, GY + E.H); }
    g.fillStyle = '#8a6a50'; g.fillRect(-E.W * 2, GY - 60, E.W * 5, 60);
    for (const dx of [-620, 560]) { const x = CX + dx; rr(g, x - 110, GY - 470, 220, 470, 6); g.fillStyle = '#f4efe6'; g.fill(); rr(g, x - 90, GY - 450, 180, 430, 4); g.fillStyle = '#e8dcc8'; g.fill(); circle(g, x + 70, GY - 230, 10, '#c8a040'); }
    const rx = CX - 60; seg(g, [[rx - 160, GY - 520], [rx + 160, GY - 520]], 12, '#5a3a24'); for (let i = 0; i < 4; i++) seg(g, [[rx - 120 + i * 80, GY - 520], [rx - 120 + i * 80, GY - 490]], 8, '#5a3a24');
    rr(g, rx - 140, GY - 500, 80, 220, 30); g.fillStyle = '#3a6ea5'; g.fill(); rr(g, rx + 20, GY - 500, 90, 260, 30); g.fillStyle = '#8a3a3a'; g.fill();
    rr(g, CX + 140, GY - 640, 160, 220, 80); g.fillStyle = '#d8c8a8'; g.fill(); rr(g, CX + 152, GY - 628, 136, 196, 70); g.fillStyle = alpha('#bfe0f4', 0.7); g.fill();
    seg(g, [[CX - 300, -E.H], [CX - 300, GY - V(760, 1150)]], 3, '#2a2a30'); circle(g, CX - 300, GY - V(745, 1135), 18, '#fff2c8'); glow(g, CX - 300, GY - V(745, 1135), 260, '#ffe2a0', 0.3);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, ['#b08a60', '#6a4a30']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); g.strokeStyle = alpha('#000000', 0.12); g.lineWidth = 2; for (let x = -E.W * 2; x < E.W * 3; x += 160) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x + (x - CX) * 0.8, GY + 400); g.stroke(); } glow(g, CX, GY + 60, 500, '#fff2d8', 0.12); });
  return { GY, CX, M };
}
