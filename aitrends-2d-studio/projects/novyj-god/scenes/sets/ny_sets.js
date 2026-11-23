// sets/ny_sets.js — зимние и новогодние локации. Добавляются в общий SETS.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { SETS, GROUND } from './sets.js';
import { NY } from '../lib/ny.js';

const snowGround = (g, GY, c1 = '#dfe6f2', c2 = '#7a86a8') => { g.fillStyle = linGrad(g, 0, GY - 10, 0, GY + 400, [c1, c2]); g.fillRect(-E.W, GY - 10, E.W * 3, E.H * 2); };
export function blizzard(g, t, k = 1) { FX.snow(g, t, { count: Math.round(160 * k), speed: 160 * k }); FX.rain(g, t, { count: Math.round(140 * k), angle: 0.9, speed: 1500, len: 30, color: '#e8f0ff', a: 0.25 * k, w: 2 }); FX.fog(g, E.H * 0.3, E.H * 0.6, '#c8d4f0', 0.18 * k); }

// ---------- салон машины (разрез сбоку): водитель справа, задний ряд слева ----------
export function carIn(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => { backdrop(g, ['#141a33', '#2a3358', '#4a5580']); if (o.storm !== false) { FX.snow(g, t, { count: 220, speed: 260 }); FX.rain(g, t, { count: 160, angle: 1.1, speed: 1700, len: 26, color: '#e8f0ff', a: 0.3, w: 2 }); } else FX.snow(g, t, { count: 90, speed: 40 }); if (o.hazard) { const on = Math.floor(t * 2.2) % 2 === 0; if (on) { glow(g, CX - 900, GY - 300, 500, '#ffb02a', 0.25); glow(g, CX + 900, GY - 300, 500, '#ffb02a', 0.25); } } if (o.lights) glow(g, CX - 1200 + (o.lightsX || 0), GY - 340, 300 + (o.lightsK || 0) * 400, '#fff2c2', 0.5 + 0.4 * (o.lightsK || 0)); });
  layer(g, cam, 0.85, (g) => {
    // корпус-рамка салона: крыша, стойки, окна
    const L = CX - 900, R = CX + 900, top = GY - 560;
    g.fillStyle = '#1e1a22'; g.fillRect(-E.W, -E.H, E.W * 3, top - (-E.H)); g.fillRect(-E.W, GY - 120, E.W * 3, E.H * 2);
    g.fillRect(-E.W, -E.H, L - (-E.W), E.H * 3); g.fillRect(R, -E.H, E.W * 2, E.H * 3);
    for (const px of [CX - 300, CX + 360]) { g.fillStyle = '#1e1a22'; g.fillRect(px - 22, top, 44, GY - 120 - top); }
    g.fillStyle = 'rgba(200,220,255,.06)'; g.fillRect(L, top, R - L, GY - 120 - top);
    if (o.fog) { g.fillStyle = `rgba(230,236,250,${0.35 * o.fog})`; g.fillRect(L, top, R - L, GY - 120 - top); }
    // приборная панель справа
    rr(g, R - 260, GY - 250, 300, 140, 20); g.fillStyle = '#2a2530'; g.fill(); circle(g, R - 160, GY - 190, 26, '#3a3540'); glow(g, R - 160, GY - 190, 60, o.dash || '#7fd0ff', 0.25); if (o.hazard) { const on = Math.floor(t * 2.2) % 2 === 0; circle(g, R - 90, GY - 200, 10, on ? '#ff6a2a' : '#4a2a1a'); if (on) glow(g, R - 90, GY - 200, 50, '#ff6a2a', 0.6); }
    // сиденья
    for (const sx of [CX + 330, CX - 330]) { rr(g, sx - 120, GY - 330, 50, 230, 16); g.fillStyle = '#4a3a44'; g.fill(); rr(g, sx - 120, GY - 150, 220, 40, 14); g.fill(); }
  });
  layer(g, cam, 1, (g) => { g.fillStyle = '#1e1a22'; g.fillRect(-E.W, GY - 100, E.W * 3, E.H * 2); glow(g, CX, GY - 300, 900, o.warm ? '#ffcf8a' : '#9fb0ff', o.warm ? 0.16 : 0.07); });
  return { GY: GY - 110, CX, M };
}

// ---------- заснеженное поле ночью, дорога, метель ----------
export function snowfield(g, t, cam, o = {}) {
  const M = mood('night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#0e1430', '#252c58', '#4a5288']); if (!o.storm) { FX.stars(g, t, { count: 120 }); FX.moon(g, CX + 600, GY - 700, 30); } });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY - 90, amp: 70, color: '#4a5688', seed: 4 }); for (let i = 0; i < 12; i++) FX.pine(g, CX - 1600 + i * 290, GY - 80, 0.5 + (i % 3) * 0.15, '#1e2648'); });
  layer(g, cam, 1, (g) => { snowGround(g, GY, '#cdd6ec', '#5a6488'); g.fillStyle = 'rgba(120,130,170,.35)'; g.fillRect(-E.W, GY + 30, E.W * 3, 60); if (o.lights) { const k = o.lightsK ?? 1; glow(g, CX + (o.lightsX ?? -700), GY - 120, 140 + 300 * k, '#fff2c2', 0.4 + 0.4 * k); } });
  if (o.storm !== false) blizzard(g, t, o.storm || 1); else FX.snow(g, t, { count: 80, speed: 40 });
  return { GY, CX, M };
}

// ---------- деревенский дом зимой ----------
export function village(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#141a3a', '#2a3466', '#5a6aa0']); FX.stars(g, t, { count: 60 }); });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY - 100, amp: 60, color: '#5a6698', seed: 7 }); for (let i = 0; i < 10; i++) FX.pine(g, CX - 1500 + i * 330, GY - 90, 0.6, '#1e2648'); });
  layer(g, cam, 0.8, (g) => {
    const hx = CX + (o.houseX ?? 200); g.fillStyle = '#5a3a2a'; g.fillRect(hx - 300, GY - 320, 600, 320); for (let i = 0; i < 8; i++) seg(g, [[hx - 300, GY - 300 + i * 40], [hx + 300, GY - 300 + i * 40]], 3, '#3a2418');
    poly(g, [[hx - 350, GY - 320], [hx + 350, GY - 320], [hx, GY - 540]], '#3a2a2a'); poly(g, [[hx - 360, GY - 318], [hx + 360, GY - 318], [hx + 300, GY - 350], [hx, GY - 548], [hx - 300, GY - 350]], 'rgba(240,244,255,.0)');
    g.fillStyle = '#eef2fa'; g.beginPath(); g.moveTo(hx - 360, GY - 318); g.lineTo(hx, GY - 548); g.lineTo(hx + 360, GY - 318); g.lineTo(hx + 330, GY - 318); g.lineTo(hx, GY - 515); g.lineTo(hx - 330, GY - 318); g.closePath(); g.fill();
    g.fillStyle = '#4a3030'; g.fillRect(hx + 140, GY - 520, 50, 120); const R = rng(3); for (let i = 0; i < 6; i++) { const ph = (t * 0.3 + i / 6) % 1; circle(g, hx + 165 + Math.sin(ph * 6 + i) * 20, GY - 540 - ph * 260, 20 + ph * 40, `rgba(220,224,240,${0.35 * (1 - ph)})`); }
    for (const wx of [hx - 200, hx + 80]) { g.fillStyle = '#ffd88a'; g.fillRect(wx, GY - 250, 110, 110); glow(g, wx + 55, GY - 195, 200, '#ffcf8a', 0.45); seg(g, [[wx + 55, GY - 250], [wx + 55, GY - 140]], 6, '#3a2418'); seg(g, [[wx, GY - 195], [wx + 110, GY - 195]], 6, '#3a2418'); }
    g.fillStyle = '#3a2418'; g.fillRect(hx - 60 - 140, GY - 0, 0, 0);
    // крыльцо
    rr(g, hx - 40, GY - 210, 110, 210, 4); g.fillStyle = '#2a1a12'; g.fill(); if (o.doorOpen) { g.fillStyle = '#ffd88a'; g.fillRect(hx - 36, GY - 206, 102, 206); glow(g, hx + 15, GY - 100, 260, '#ffcf8a', 0.5); }
    g.fillStyle = '#6a4a3a'; g.fillRect(hx - 80, GY - 30, 190, 30);
    // забор
    g.strokeStyle = '#3a2a22'; g.lineWidth = 8; for (let x = CX - 1400; x < hx - 360; x += 44) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x, GY - 110); g.stroke(); }
  });
  layer(g, cam, 1, (g) => { snowGround(g, GY, '#e6ecf8', '#6a76a0'); });
  if (o.storm) blizzard(g, t, o.storm); else FX.snow(g, t, { count: 90, speed: 50 });
  return { GY, CX, M };
}

// ---------- деревенский клуб (праздник) ----------
export function club(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#5a3a2a', '#4a2e22']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let x = -E.W; x < E.W * 2; x += 60) seg(g, [[x, -E.H], [x, GY]], 3, 'rgba(0,0,0,.18)');
    rr(g, CX - 500, GY - 760, 1000, 90, 10); g.fillStyle = '#7a1e24'; g.fill(); // растяжка
    NY.garland(g, CX - 1100, GY - 780, 1, { w: 2200, sag: 60, t });
    NY.garland(g, CX - 1100, GY - 640, 1, { w: 2200, sag: 40, t: t + 1 });
    for (const wx of [CX - 900, CX + 700]) { g.fillStyle = '#1a2240'; g.fillRect(wx, GY - 600, 200, 260); FX.snow(g, t, { count: 12, area: [wx, GY - 600, 200, 260] }); }
  });
  layer(g, cam, 0.75, (g) => { NY.tree(g, CX + (o.treeX ?? 520), GY - 20, 2.4, { h: 330, t, seed: 11 }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7a5236', '#3a2418']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.25)', 0.08);
    if (o.tables !== false) for (const tx of [CX - 650, CX - 200]) NY.table(g, tx, GY - 10, 0.9, { w: 380, cloth: '#f2e8d6' }); });
  FX.dust(g, t, { count: 36, color: '#ffe2bd', a: 0.32 });
  return { GY, CX, M };
}

// ---------- зимняя дорога (едет машина) ----------
export function winterroad(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = GROUND(), CX = E.W / 2, sp = o.speed ?? 300;
  layer(g, cam, 0.12, (g) => { backdrop(g, o.mood === 'night' ? ['#0e1430', '#252c58', '#4a5288'] : ['#3a3a6a', '#8a7aa8', '#d8b8c0']); });
  layer(g, cam, 0.35, (g) => { g.save(); g.translate(-((t * sp * 0.15) % 600), 0); FX.hills(g, { y: GY - 110, amp: 70, color: '#6a74a0', seed: 5 }); for (let i = -4; i < 14; i++) FX.pine(g, i * 300, GY - 100, 0.6, '#2a3058'); g.restore(); });
  layer(g, cam, 1, (g) => { snowGround(g, GY - 60, '#dfe6f2', '#6a76a0'); g.fillStyle = '#8a90a8'; g.fillRect(-E.W, GY - 40, E.W * 3, 90); g.save(); g.translate(-((t * sp) % 260), 0); g.fillStyle = 'rgba(255,255,255,.6)'; for (let x = -E.W; x < E.W * 3; x += 260) g.fillRect(x, GY + 2, 120, 6); g.restore(); });
  if (o.storm) blizzard(g, t, o.storm); else FX.snow(g, t, { count: 100, speed: 60 });
  return { GY, CX, M };
}

// ---------- ресторан «Эрмитаж» XIX век ----------
export function hermitage(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.55, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#5a2a2a', '#3a1a1e']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); for (let x = CX - 1200; x < CX + 1200; x += 300) { g.fillStyle = '#7a3a34'; g.fillRect(x, GY - 700, 30, 700); } for (const cx of [CX - 400, CX + 400]) { seg(g, [[cx, -300], [cx, GY - 700]], 3, '#d4af37'); for (let i = 0; i < 7; i++) circle(g, cx - 90 + i * 30, GY - 690 + Math.sin(i / 6 * Math.PI) * 30, 9, '#fff2c8'); glow(g, cx, GY - 680, 300, '#ffd59a', 0.45); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#6a3a2a', '#2a1410']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); NY.table(g, CX + 250, GY, 1.0, { w: 360, cloth: '#f4efe6' }); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  return { GY, CX, M };
}

// ---------- ночная Москва, Спасская башня ----------
export function kremlinNight(g, t, cam, o = {}) {
  const M = mood('night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#0a1028', '#1d2550', '#3a3570']); FX.stars(g, t, { count: 100 }); });
  layer(g, cam, 0.6, (g) => { NY.kremlin(g, CX, GY - 40, 1.2, { a: o.handA ?? -Math.PI / 2 }); g.fillStyle = '#6a2420'; g.fillRect(-E.W, GY - 200, E.W * 3, 160); for (let x = -E.W; x < E.W * 2; x += 60) poly(g, [[x, GY - 200], [x + 40, GY - 200], [x + 34, GY - 236], [x + 20, GY - 250], [x + 6, GY - 236]], '#6a2420'); });
  layer(g, cam, 1, (g) => { snowGround(g, GY - 40, '#c8d0e8', '#3a4060'); });
  FX.snow(g, t, { count: 90, speed: 50 });
  if (o.fireworks) { const R = rng(2); for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i * 0.2) % 1, x = R() * E.W, y = E.H * (0.15 + R() * 0.25), c = ['#ff6a8a', '#ffd47e', '#7fe8ff', '#b07cff', '#7fffa0'][i]; for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28; circle(g, x + Math.cos(a) * ph * 140, y + Math.sin(a) * ph * 140 + ph * ph * 40, 3.5 * (1 - ph), alpha(c, 1 - ph)); } glow(g, x, y, 120 * ph, c, 0.3 * (1 - ph)); } }
  return { GY, CX, M };
}

// ---------- Великий Устюг: терем в снегу ----------
export function ustyug(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#5a6aa8', '#c8b8d8', '#fbe0c8']); FX.sun(g, CX - 600, GY - 500, 50, '#fff3dc', '#ffd8b0', 4); });
  layer(g, cam, 0.35, (g) => { for (let i = 0; i < 12; i++) FX.pine(g, CX - 1500 + i * 280, GY - 70, 0.8, '#3a5a5a'); });
  layer(g, cam, 0.8, (g) => { NY.terem(g, CX + 100, GY, 1.4, {}); });
  layer(g, cam, 1, (g) => { snowGround(g, GY, '#f4f6fc', '#a8b4d0'); });
  FX.snow(g, t, { count: 80, speed: 40 });
  return { GY, CX, M };
}

// зимние версии старых наружных локаций
const withSnow = (fn) => (g, t, cam, o = {}) => { const r = fn(g, t, cam, o); layer(g, cam, 1, (g) => { g.fillStyle = 'rgba(235,240,252,.85)'; g.fillRect(-E.W, r.GY - 6, E.W * 3, 22); }); if (o.storm) blizzard(g, t, o.storm); else FX.snow(g, t, { count: o.flakes ?? 110, speed: 50 }); return r; };
Object.assign(SETS, { carIn, snowfield, village, club, winterroad, hermitage, kremlinNight, ustyug, yardW: withSnow(SETS.yard), parkW: withSnow(SETS.park) });
