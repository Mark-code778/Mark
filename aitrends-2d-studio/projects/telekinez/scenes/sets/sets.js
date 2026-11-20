// sets/sets.js — все локации ролика. Каждая: fn(g, t, cam, o) -> { GY, CX, M }. Персонажи рисуются потом на глубине 1.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { OBJ } from '../lib/objs.js';

export const GROUND = () => E.H * V(0.8, 0.68);
const base = (o, def) => mood(o.mood || def);
const wallFill = (g, M, top, GY, k = -0.3) => { g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(M.wall, k + 0.08), shade(M.wall, k), shade(M.wall, k - 0.25)]); g.fillRect(-E.W, top, E.W * 3, GY - top + 4); };
const floor = (g, M, GY, lines = true, c = null) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(c || M.floor, -0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); if (lines) FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.22)', 0.08); };
const skyWin = (M, night) => (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); if (night) FX.stars(g, 0, { area: [x, y, w, h * 0.5], count: 30 }); FX.skyline(g, { x: x - 20, y: y + h + 4, w: w + 40, minH: 30, maxH: h * 0.45, color: mix(M.sky[0], '#000', 0.5), windowColor: alpha(M.practical, 0.7), lit: night ? 0.35 : 0.08, seed: 21 }); };

// ---------- спальня ----------
export function bedroom(g, t, cam, o = {}) {
  const M = base(o, 'interiorWarm'), GY = GROUND(), CX = E.W / 2, night = o.mood === 'night';
  layer(g, cam, 0.6, (g) => {
    wallFill(g, M, -E.H, GY);
    const wx = CX + 160, wy = GY - 560;
    FX.windowFrame(g, { x: wx, y: wy, w: 420, h: 380, cols: 2, rows: 2, frame: shade(M.wall, -0.55), bar: 10 }, skyWin(M, night));
    if (night) FX.moon(g, wx + 320, wy + 80, 26); else glow(g, wx + 210, wy + 190, 520, M.key, 0.35);
    FX.godRays(g, wx + 210, wy + 120, { angle: Math.PI * 0.62, spread: 0.6, len: 900, color: night ? '#b8c6ff' : M.key, a: night ? 0.05 : 0.08, t });
    g.fillStyle = shade(M.wall, -0.5); g.fillRect(CX - 560, GY - 420, 220, 160); g.fillStyle = shade(M.practical, -0.3); g.fillRect(CX - 548, GY - 408, 196, 136);
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX + 300, GY + 40, 420, 60, night ? '#b8c6ff' : M.key, 0.18); });
  layer(g, cam, 1, (g) => { FX.bed(g, { x: CX - 470, y: GY, w: 460, color: night ? '#3a3a70' : '#5a4a8a', frame: shade(M.wall, -0.6) }); OBJ.nightstand(g, CX + 60, GY, 1, { color: shade(M.wall, -0.5) }); glow(g, CX + 60, GY - 120, 120, M.practical, 0.25); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  return { GY, CX, M };
}

// ---------- кухня ----------
export function kitchen(g, t, cam, o = {}) {
  const M = base(o, 'interiorWarm'), GY = GROUND(), CX = E.W / 2, night = o.mood === 'night';
  layer(g, cam, 0.6, (g) => {
    wallFill(g, M, -E.H, GY);
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2; for (let y = GY - 420; y < GY - 130; y += 36) { g.beginPath(); g.moveTo(CX - 1200, y); g.lineTo(CX + 1200, y); g.stroke(); }
    const wx = CX - 120, wy = GY - 600; FX.windowFrame(g, { x: wx, y: wy, w: 380, h: 330, cols: 2, rows: 1, frame: shade(M.wall, -0.55), bar: 10 }, skyWin(M, night));
    glow(g, wx + 190, wy + 165, 460, night ? '#9fb0ff' : M.key, night ? 0.15 : 0.35);
    FX.godRays(g, wx + 190, wy + 120, { angle: Math.PI * 0.55, spread: 0.5, len: 800, color: M.key, a: night ? 0.03 : 0.07, t });
    OBJ.radiator(g, wx + 190, GY - 140, 1.1, {});
    if (o.wrecked) { OBJ.splat(g, wx + 120, wy + 120, 1.0, { seed: 4, drip: 1 }); OBJ.splat(g, CX + 520, GY - 690, 1.2, { seed: 7, drip: 0.6 }); }
    // верхние шкафчики и столешница справа
    g.fillStyle = shade(M.wall, -0.45); g.fillRect(CX + 360, GY - 640, 560, 190);
    g.strokeStyle = shade(M.wall, -0.65); g.lineWidth = 4; for (let i = 0; i < 4; i++) g.strokeRect(CX + 364 + i * 139, GY - 636, 135, 182);
    FX.counter(g, { x: CX + 340, y: GY - 6, w: 620, h: 150, color: shade(M.wall, -0.5), top: shade(M.wall, -0.2), doors: 5 });
    rr(g, CX + 410, GY - 210, 70, 50, 6); g.fillStyle = '#3a2a30'; g.fill();               // подставка для ножей
    for (let i = 0; i < 3; i++) seg(g, [[CX + 425 + i * 18, GY - 210], [CX + 425 + i * 18, GY - 236]], 6, '#2b2026');
    // холодильник слева
    OBJ.fridge(g, CX - 700, GY - 4, 1.25, { open: o.fridgeOpen || 0, empty: o.fridgeEmpty });
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, true, mix(M.floor, '#6a5a6a', 0.2)); FX.pool(g, CX + 70, GY + 40, 380, 60, M.key, night ? 0.08 : 0.2); });
  if (o.table !== false) layer(g, cam, 1, (g) => { OBJ.tableK(g, CX + 40, GY, 1.2, { w: 300, color: shade(M.wall, -0.4) }); });
  FX.dust(g, t, { count: 34, color: '#ffe2bd', a: 0.3 });
  return { GY, CX, M, tableTop: GY - 134 };
}

// ---------- комната (квартира Артёма) ----------
export function living(g, t, cam, o = {}) {
  const M = base(o, 'interiorWarm'), GY = GROUND(), CX = E.W / 2, night = o.mood === 'night' || o.night;
  layer(g, cam, 0.6, (g) => {
    wallFill(g, M, -E.H, GY);
    const wx = CX + 380, wy = GY - 620; FX.windowFrame(g, { x: wx, y: wy, w: 360, h: 420, cols: 2, rows: 2, frame: shade(M.wall, -0.55), bar: 10, blinds: night ? 0 : 0 }, skyWin(M, night));
    glow(g, wx + 180, wy + 200, 420, night ? '#9fb0ff' : M.key, night ? 0.12 : 0.3);
    OBJ.shelf(g, CX - 620, GY - 330, 1.2, {});
    rr(g, CX - 160, GY - 600, 160, 110, 6); g.fillStyle = shade(M.wall, -0.55); g.fill(); g.fillStyle = shade(M.practical, -0.35); g.fillRect(CX - 150, GY - 590, 140, 90);
    FX.door(g, { x: CX + 860, y: GY, w: 130, h: 260, color: shade(M.wall, -0.35), open: o.doorOpen || 0, light: M.practical });
  });
  layer(g, cam, 0.9, (g) => {
    floor(g, M, GY); g.fillStyle = alpha(shade(M.practical, -0.4), 0.35); g.beginPath(); g.ellipse(CX + 20, GY + 70, 520, 60, 0, 0, 7); g.fill();
    FX.pool(g, CX - 80, GY + 30, 520, 70, night ? '#ffcf8f' : M.key, 0.2);
  });
  layer(g, cam, 1, (g) => { if (o.sofa !== false) OBJ.sofa(g, CX + (o.sofaX ?? -60), GY + 2, 1.15, { color: '#4a5a8c' }); if (o.tv) { OBJ.tv(g, CX + 520, GY - 70, 1, {}); seg(g, [[CX + 470, GY - 70], [CX + 470, GY]], 8, '#2a2230'); seg(g, [[CX + 570, GY - 70], [CX + 570, GY]], 8, '#2a2230'); } });
  if (night) glow(g, CX - 200, GY - 520, 260, M.practical, 0.25);
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.28 });
  return { GY, CX, M };
}

// ---------- двор: многоэтажка с балконами, подъезд ----------
export const yardBalcony = () => ({ x: E.W / 2 + 160, y: GROUND() - 5 * 150 - 60 });  // балкон 5-го этажа (на глубине 1)
export function yard(g, t, cam, o = {}) {
  const M = base(o, 'golden'), GY = GROUND(), CX = E.W / 2, night = o.mood === 'night' || o.mood === 'dusk';
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); if (o.mood === 'night') { FX.stars(g, t, { count: 90 }); FX.moon(g, CX - 500, GY - 1100, 30); } else FX.sun(g, CX - 700, GY - 1050, 50, '#fff3dc', M.key, 4); FX.clouds(g, { y: GY - 1500, h: 400, a: 0.12, seed: 5 }); });
  layer(g, cam, 0.4, (g) => { FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 200, maxH: 520, minW: 120, maxW: 260, color: mix(M.sky[0], M.dark, 0.5), windowColor: alpha(M.practical, 0.6), lit: night ? 0.3 : 0.06, seed: 31 }); });
  layer(g, cam, 1, (g) => {
    // фасад дома: 9 этажей, этаж = 150
    const L = CX - 900, W = 1800, top = GY - 9 * 150 - 30;
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(M.wall, -0.05), shade(M.wall, -0.3)]); g.fillRect(L, top, W, GY - top);
    const r = rng(41);
    for (let f = 0; f < 9; f++) for (let c = 0; c < 8; c++) {
      const wx = L + 60 + c * 220, wy = GY - (f + 1) * 150 + 30, lit = night ? r() < 0.55 : r() < 0.12;
      g.fillStyle = lit ? M.practical : shade(M.sky[1], -0.45); g.fillRect(wx, wy, 90, 90); if (lit) glow(g, wx + 45, wy + 45, 110, M.practical, 0.12);
      g.fillStyle = shade(M.wall, -0.5); g.fillRect(wx + 43, wy, 4, 90);
      if (c % 2 === 1) { g.fillStyle = shade(M.wall, -0.42); g.fillRect(wx - 20, wy + 70, 150, 12); g.fillStyle = alpha(shade(M.wall, -0.55), 0.9); g.fillRect(wx - 20, wy + 82, 150, 40); }
    }
    // подъезд
    g.fillStyle = shade(M.wall, -0.55); g.fillRect(CX - 90, GY - 220, 180, 220); g.fillStyle = shade(M.dark, -0.2); g.fillRect(CX - 60, GY - 190, 120, 190);
    poly(g, [[CX - 130, GY - 230], [CX + 130, GY - 230], [CX + 110, GY - 210], [CX - 110, GY - 210]], shade(M.wall, -0.6)); circle(g, CX, GY - 205, 8, M.practical); glow(g, CX, GY - 200, 160, M.practical, night ? 0.5 : 0.2);
  });
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.road, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    g.fillStyle = alpha(shade(M.road, -0.3), 0.6); g.fillRect(-E.W, GY, E.W * 3, 10);
    FX.tree(g, CX - 1050, GY + 10, 1.8, shade(M.grass, -0.55)); FX.tree(g, CX + 1080, GY + 10, 2.0, shade(M.grass, -0.55));
    FX.lampPost(g, CX - 620, GY + 4, 330, { color: shade(M.dark, -0.2), light: M.practical, on: night, a: 0.16 });
    rr(g, CX + 380, GY - 46, 170, 12, 4); g.fillStyle = shade(M.wall, -0.6); g.fill(); seg(g, [[CX + 395, GY - 34], [CX + 395, GY]], 6, shade(M.wall, -0.6)); seg(g, [[CX + 535, GY - 34], [CX + 535, GY]], 6, shade(M.wall, -0.6));
    if (o.car) OBJ.car(g, CX + (o.carX ?? -420), GY + 4, 1.0, { color: '#8a9bb0', lit: night });
  });
  FX.dust(g, t, { count: 22, color: '#ffe8c8', a: 0.25 });
  return { GY, CX, M };
}

// ---------- дворовое футбольное поле ----------
export function field(g, t, cam, o = {}) {
  const M = base(o, 'dusk'), GY = GROUND(), CX = E.W / 2, night = o.mood === 'night';
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); if (!night) FX.sun(g, CX + 520, GY - 380, 56, '#fff3dc', M.key, 5); else FX.stars(g, t, { count: 80 }); });
  layer(g, cam, 0.35, (g) => { FX.skyline(g, { x: -E.W, y: GY - 150, w: E.W * 3, minH: 120, maxH: 380, minW: 100, maxW: 220, color: mix(M.sky[0], M.dark, 0.6), windowColor: alpha(M.practical, 0.7), lit: 0.3, seed: 52 }); });
  layer(g, cam, 0.7, (g) => { g.strokeStyle = alpha(shade(M.dark, 0.2), 0.8); g.lineWidth = 3; for (let x = -E.W; x < E.W * 2; x += 46) { g.beginPath(); g.moveTo(x, GY - 200); g.lineTo(x, GY); g.stroke(); } seg(g, [[-E.W, GY - 200], [E.W * 2, GY - 200]], 6, shade(M.dark, 0.1));
    for (const lx of [CX - 900, CX + 900]) FX.lampPost(g, lx, GY - 20, 420, { color: shade(M.dark, -0.3), light: M.practical, on: true, a: 0.12 }); });
  layer(g, cam, 1, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, [shade(M.grass, -0.1), shade(M.grass, -0.55)]); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-E.W, GY + 60, E.W * 3, 4);
    if (o.goal !== false) OBJ.goal(g, CX + (o.goalX ?? 560), GY + 8, 1.4, {}); });
  FX.dust(g, t, { count: 24, color: '#ffe8c8', a: 0.28 });
  return { GY, CX, M };
}

// ---------- подъезд: лестница снизу-слева вверх-направо ----------
export const stairY = (x) => GROUND() - Math.max(0, (x - (E.W / 2 - 500))) * 0.55;  // высота ступени над x
export function stairwell(g, t, cam, o = {}) {
  const M = base(o, 'interiorCool'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade('#5a6a7a', -0.35), shade('#3a4656', -0.3)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    g.fillStyle = shade('#4a6a5a', -0.35); g.fillRect(-E.W, GY - 260, E.W * 3, 260);            // крашеная панель стены
    FX.windowFrame(g, { x: CX - 150, y: GY - 780, w: 220, h: 300, cols: 2, rows: 2, frame: '#2a3040', bar: 8 }, skyWin(mood(o.out || 'day'), false));
    glow(g, CX - 40, GY - 630, 320, '#dfe8ff', 0.2);
    circle(g, CX + 300, GY - 760, 14, '#fff6d8'); glow(g, CX + 300, GY - 760, 220, '#fff2c8', 0.35);
  });
  layer(g, cam, 1, (g) => {
    floor(g, M, GY, false, '#3a3a48');
    const x0 = CX - 500; g.fillStyle = '#6a7080';
    if (o.door5) OBJ.door(g, CX + 620, GY, 1.2, { color: '#6a4a3a', open: o.door5Open || 0, locks: o.locks || 0 });
    const nSt = o.door5 ? 10 : 30;
    for (let i = 0; i < nSt; i++) { const sx = x0 + i * 60, sy = GY - i * 33; g.fillStyle = i % 2 ? '#707688' : '#666c7c'; g.fillRect(sx, sy - 33, 60, 33 + i * 33 + 40); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(sx, sy - 33, 60, 4); }
    g.strokeStyle = '#2a2a33'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - 40, GY - 140); g.lineTo(x0 + nSt * 60, GY - 140 - (nSt * 60 + 40) * 0.55); g.stroke();
    for (let i = 0; i < nSt; i += 2) seg(g, [[x0 + i * 60, GY - i * 33 - 33], [x0 + i * 60, GY - i * 33 - 33 - 110]], 3, '#2a2a33');
  });
  FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.22 });
  return { GY, CX, M };
}

// ---------- пустая квартира Лёхи, ночь ----------
export function emptyflat(g, t, cam, o = {}) {
  const M = base(o, 'night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade('#3a3a58', -0.3), shade('#2a2a44', -0.4)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    FX.windowFrame(g, { x: CX - 420, y: GY - 700, w: 840, h: 560, cols: 3, rows: 1, frame: '#14141e', bar: 12 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.stars(g, t, { area: [x, y, w, h * 0.4], count: 40 }); FX.skyline(g, { x, y: y + h + 2, w, minH: 80, maxH: 380, color: '#10122a', windowColor: '#ffcf8a', lit: 0.4, seed: 66 }); });
    glow(g, CX, GY - 420, 700, '#8fa0ff', 0.12);
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, true, '#3a3040'); FX.pool(g, CX, GY + 40, 520, 70, '#9fb0ff', 0.14); });
  layer(g, cam, 1, (g) => { OBJ.box(g, CX - 620, GY, 1.3, {}); OBJ.box(g, CX - 560, GY - 90, 1.0, { w: 80, h: 60 }); OBJ.box(g, CX + 640, GY, 1.4, { w: 110 }); OBJ.box(g, CX + 520, GY, 1.0, {}); seg(g, [[CX + 200, -200], [CX + 200, GY - 760]], 3, '#14141e'); circle(g, CX + 200, GY - 750, 14, '#ffe7b0'); glow(g, CX + 200, GY - 740, 380, '#ffd59a', 0.35); });
  FX.dust(g, t, { count: 30, color: '#dfe2ff', a: 0.22 });
  return { GY, CX, M };
}

// ---------- дорога со светофором ----------
export function road(g, t, cam, o = {}) {
  const M = base(o, 'dusk'), GY = GROUND(), CX = E.W / 2, sp = o.speed || 0;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX - 400, GY - 420, 50, '#fff3dc', M.key, 5); });
  layer(g, cam, 0.35, (g) => { g.save(); g.translate(-((t * sp * 0.2) % 600), 0); FX.skyline(g, { x: -E.W, y: GY - 240, w: E.W * 4, minH: 160, maxH: 480, minW: 90, maxW: 220, color: mix(M.sky[0], M.dark, 0.55), windowColor: alpha(M.practical, 0.7), lit: 0.35, seed: 71 }); g.restore(); });
  layer(g, cam, 0.8, (g) => { g.save(); g.translate(-((t * sp * 0.6) % 700), 0); for (let x = -E.W; x < E.W * 3; x += 700) FX.lampPost(g, x, GY - 200, 380, { color: shade(M.dark, -0.3), light: M.practical, on: true, a: 0.1 }); g.restore();
    if (o.light) { const lx = CX + (o.lightX ?? 300); seg(g, [[lx, GY - 190], [lx, GY - 560]], 10, '#22222a'); rr(g, lx - 26, GY - 700, 52, 150, 10); g.fillStyle = '#16161c'; g.fill(); circle(g, lx, GY - 670, 16, o.light === 'green' ? '#2a3a2a' : '#ff4a3a'); circle(g, lx, GY - 625, 16, '#3a3a22'); circle(g, lx, GY - 580, 16, o.light === 'green' ? '#4af08a' : '#2a3a2a'); glow(g, lx, o.light === 'green' ? GY - 580 : GY - 670, 90, o.light === 'green' ? '#4af08a' : '#ff4a3a', 0.6); } });
  layer(g, cam, 1, (g) => { g.fillStyle = linGrad(g, 0, GY - 200, 0, GY + 300, [shade(M.road, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 200, E.W * 3, E.H * 2); g.fillStyle = shade(M.road, 0.15); g.fillRect(-E.W, GY - 210, E.W * 3, 14);
    g.save(); g.translate(-((t * sp) % 260), 0); g.fillStyle = 'rgba(255,240,200,.55)'; for (let x = -E.W; x < E.W * 3; x += 260) g.fillRect(x, GY - 70, 140, 8); g.restore(); });
  FX.dust(g, t, { count: 16, color: '#ffe8c8', a: 0.2 });
  return { GY, CX, M };
}

// ---------- гараж ----------
export function garage(g, t, cam, o = {}) {
  const M = base(o, 'interiorCool'), GY = GROUND(), CX = E.W / 2, out = mood(o.out || 'dusk');
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade('#3a3a4c', -0.35), shade('#2e2e3e', -0.35)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // открытые ворота слева — наружу закат
    const gx = CX - 1150, gw = 560; g.fillStyle = linGrad(g, 0, GY - 520, 0, GY, out.sky); g.fillRect(gx, GY - 520, gw, 520);
    FX.skyline(g, { x: gx, y: GY, w: gw, minH: 60, maxH: 260, color: mix(out.sky[0], '#000', 0.5), windowColor: alpha(out.practical, 0.7), lit: 0.3, seed: 81 });
    g.strokeStyle = '#1a1a22'; g.lineWidth = 18; g.strokeRect(gx, GY - 520, gw, 520); glow(g, gx + gw / 2, GY - 260, 600, out.key, 0.25);
    // перфорированная панель с инструментами + верстак справа
    g.fillStyle = shade('#4a4a5a', -0.3); g.fillRect(CX + 260, GY - 640, 600, 300);
    for (let i = 0; i < 6; i++) seg(g, [[CX + 320 + i * 90, GY - 600], [CX + 320 + i * 90, GY - 500 - (i % 3) * 30]], 8, ['#c9cdd4', '#d63a2a', '#c9cdd4', '#e1b12c', '#c9cdd4', '#3a6ea5'][i]);
    FX.counter(g, { x: CX + 240, y: GY, w: 640, h: 150, color: '#3a3038', top: '#5a4a48', doors: 4 });
    g.fillStyle = '#2a2a33'; g.fillRect(CX - 300, GY - 560, 340, 14); for (let i = 0; i < 5; i++) { g.fillStyle = ['#c96f45', '#3a6ea5', '#d6d0c0', '#6a8f4e', '#a85a3a'][i]; g.fillRect(CX - 290 + i * 64, GY - 620, 50, 60); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#4a4a52', '#1e1e26']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(CX + 40, GY + 60, 380, 40, 0, 0, 7); g.fill(); });
  // одна тёплая лампа под потолком — ключевой свет
  layer(g, cam, 0.95, (g) => { seg(g, [[CX + 20, -400], [CX + 20, GY - 820]], 3, '#14141c'); poly(g, [[CX - 30, GY - 800], [CX + 70, GY - 800], [CX + 50, GY - 830], [CX - 10, GY - 830]], '#22222a'); circle(g, CX + 20, GY - 796, 14, '#fff2c8'); glow(g, CX + 20, GY - 790, 200, '#ffd59a', 0.7); FX.lightCone(g, CX + 20, GY - 790, { angle: Math.PI / 2, spread: 0.9, len: 900, color: '#ffd59a', a: 0.14 }); FX.pool(g, CX + 20, GY + 50, 520, 70, '#ffd59a', 0.25); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.32 });
  return { GY, CX, M };
}

// ---------- дача: дом, забор, огород ----------
export function dacha(g, t, cam, o = {}) {
  const M = base(o, 'golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX + 600, GY - 520, 60, '#fff3dc', M.key, 5); FX.clouds(g, { y: GY - 900, h: 300, a: 0.14, seed: 9 }); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 120, amp: 120, color: mix(M.grass, M.sky[0], 0.5), seed: 3 }); for (let i = 0; i < 9; i++) FX.pine(g, CX - 1400 + i * 340, GY - 100, 0.9 + (i % 3) * 0.2, mix(M.grass, M.dark, 0.6)); });
  layer(g, cam, 0.7, (g) => {
    const hx = CX - 820; g.fillStyle = '#7a5236'; g.fillRect(hx - 220, GY - 360, 440, 360); poly(g, [[hx - 260, GY - 360], [hx + 260, GY - 360], [hx, GY - 560]], '#5a2e2a');
    g.fillStyle = '#ffd28a'; g.fillRect(hx - 150, GY - 280, 90, 90); glow(g, hx - 105, GY - 235, 120, M.practical, 0.3); g.fillStyle = '#3a2418'; g.fillRect(hx + 40, GY - 230, 100, 230);
    g.strokeStyle = shade('#a87b52', -0.3); g.lineWidth = 8; for (let x = CX - 560; x < CX + 1500; x += 40) { g.beginPath(); g.moveTo(x, GY - 10); g.lineTo(x, GY - 140); g.stroke(); } seg(g, [[CX - 560, GY - 110], [CX + 1500, GY - 110]], 6, shade('#a87b52', -0.3));
  });
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.grass, -0.15), shade(M.grass, -0.6)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    if (o.beds !== false) { const dug = o.dug ?? 0; for (let i = 0; i < 5; i++) { const by = GY + 24 + i * 34; g.fillStyle = mix('#5a3a26', '#3a2418', (i / 5 < dug) ? 1 : 0); g.fillRect(CX - 200 + i * 10, by, 900, 18); if (i / 5 < dug) { g.fillStyle = 'rgba(255,220,180,.12)'; g.fillRect(CX - 200 + i * 10, by, 900, 3); } } }
    FX.tree(g, CX + 1100, GY + 10, 2.0, shade(M.grass, -0.5));
  });
  FX.dust(g, t, { count: 30, color: '#fff0cc', a: 0.32 });
  FX.godRays(g, CX + 600, GY - 520, { angle: Math.PI * 0.8, spread: 0.9, len: 1400, color: M.key, a: 0.05, t });
  return { GY, CX, M };
}

// ---------- телестудия (экстрасенсы, Рэнди) ----------
export function tvstudio(g, t, cam, o = {}) {
  const M = base(o, 'night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#0e0a18', '#2a1430']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#5a1a2a' : '#4a1424'; g.fillRect(CX - 1100 + i * 250, GY - 760, 250, 760); }
    for (const sx of [-420, 0, 420]) FX.lightCone(g, CX + sx, -40, { angle: Math.PI / 2 + sx * 0.0004, spread: 0.32, len: 1100, color: '#fff2d8', a: 0.12 });
    rr(g, CX - 260, GY - 720, 520, 110, 12); g.fillStyle = '#1a1220'; g.fill(); if (o.label) { glow(g, CX, GY - 665, 300, '#ffd47e', 0.25); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#3a2a30', '#120a10']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.pool(g, CX, GY + 30, 520, 70, '#fff2d8', 0.3); });
  layer(g, cam, 1, (g) => { if (o.table !== false) OBJ.tableK(g, CX + 60, GY, 1.2, { w: 260, color: '#2a1a22' }); });
  layer(g, cam, 1.5, (g) => { FX.crowd(g, t, { y: GY + 210, rows: 3, rowH: 40, size: 3, color: '#0a0610', seed: 4 }); });
  return { GY, CX, M };
}

// ---------- больничная палата / лаборатория имплантов ----------
export function hospital(g, t, cam, o = {}) {
  const M = base(o, 'interiorCool'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.55, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#3a4a5e', '#2a3446']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    FX.windowFrame(g, { x: CX - 760, y: GY - 640, w: 420, h: 360, cols: 2, rows: 1, frame: '#1a2230', bar: 10, blinds: 20 }, skyWin(mood('golden'), false)); glow(g, CX - 550, GY - 460, 420, '#ffd59a', 0.28);
    FX.screen(g, { x: CX + 420, y: GY - 600, w: 260, h: 160, glowC: '#7fe8ff', a: 0.25 }, (g, x, y, w, h) => { g.strokeStyle = '#7fe8ff'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 40; i++) g.lineTo(x + 8 + i * 6.3, y + h / 2 - Math.sin(i * 0.8 + t * 4) * 18 * (i % 7 === 0 ? 2 : 0.6)); g.stroke(); });
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#4a5468', '#1a1e2a']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.2)', 0.08); FX.pool(g, CX - 300, GY + 40, 520, 70, '#ffd59a', 0.18); });
  FX.dust(g, t, { count: 26, color: '#e8f0ff', a: 0.22 });
  return { GY, CX, M };
}

// ---------- лаборатория (жонглёры, учёные) ----------
export function lab(g, t, cam, o = {}) {
  const M = base(o, 'interiorCool'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.55, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#2e3a52', '#222a3e']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    rr(g, CX - 520, GY - 620, 560, 300, 8); g.fillStyle = '#e8ecf2'; g.fill(); g.strokeStyle = '#3a6ea5'; g.lineWidth = 4; g.beginPath(); g.arc(CX - 240, GY - 470, 90, 0, 6.28); g.stroke(); seg(g, [[CX - 470, GY - 360], [CX - 330, GY - 420]], 4, '#d63a2a');
    for (let i = 0; i < 4; i++) { seg(g, [[CX + 200 + i * 170, -300], [CX + 200 + i * 170, GY - 760]], 3, '#14141c'); circle(g, CX + 200 + i * 170, GY - 750, 12, '#eaf2ff'); glow(g, CX + 200 + i * 170, GY - 740, 200, '#cfe0ff', 0.3); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#3a4458', '#141824']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.2)', 0.07); FX.pool(g, CX + 200, GY + 40, 600, 70, '#cfe0ff', 0.16); });
  FX.dust(g, t, { count: 24, color: '#e8f0ff', a: 0.2 });
  return { GY, CX, M };
}

// ---------- космическая станция ----------
export function station(g, t, cam, o = {}) {
  const M = base(o, 'void'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, ['#02030a', '#060a1a']); FX.stars(g, t, { count: 160, area: [-E.W, -E.H, E.W * 3, E.H * 3] }); const ex = CX + 420, ey = GY + 300; g.fillStyle = radGrad(g, ex - 200, ey - 300, 50, 900, ['#7ab8ff', '#2a5aa8', '#0a1a3a']); circle(g, ex, ey, 760, '#2a5aa8'); g.fillStyle = radGrad(g, ex - 200, ey - 300, 50, 900, ['#9ad0ff', '#2a6ab8', '#0a1a3a']); g.beginPath(); g.arc(ex, ey, 760, 0, 7); g.fill(); glow(g, ex, ey - 700, 500, '#9ad0ff', 0.3); });
  layer(g, cam, 0.6, (g) => { g.save(); g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, E.H * 3); g.arc(CX + 200, GY - 420, 330, 0, 7, true); g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#4a4e5a', '#2a2c36']); g.fill('evenodd'); g.restore(); ring(g, CX + 200, GY - 420, 340, 26, '#6a6e7a');
    for (let i = 0; i < 6; i++) { rr(g, CX - 1000 + i * 70, GY - 700 + (i % 3) * 120, 50, 90, 6); g.fillStyle = '#353844'; g.fill(); circle(g, CX - 975 + i * 70, GY - 680 + (i % 3) * 120, 5, ['#5fd39a', '#ff6f61', '#ffd47e'][i % 3]); } });
  FX.dust(g, t, { count: 20, color: '#dfe8ff', a: 0.18 });
  return { GY, CX, M };
}

// ---------- парк, утро (пробежки) ----------
export function park(g, t, cam, o = {}) {
  const M = base(o, 'golden'), GY = GROUND(), CX = E.W / 2, sp = o.speed || 0;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX - 520, GY - 360, 60, '#fff3dc', M.key, 6); });
  layer(g, cam, 0.3, (g) => { g.save(); g.translate(-((t * sp * 0.15) % 800), 0); FX.hills(g, { y: GY - 100, amp: 90, color: mix(M.grass, M.sky[0], 0.45), seed: 6 }); g.restore(); });
  layer(g, cam, 0.7, (g) => { g.save(); g.translate(-((t * sp * 0.5) % 900), 0); for (let i = -3; i < 8; i++) FX.tree(g, i * 450, GY - 30, 1.7 + (i % 2) * 0.3, shade(M.grass, -0.45)); g.restore(); });
  layer(g, cam, 1, (g) => { g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 400, [shade(M.grass, -0.1), shade(M.grass, -0.55)]); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2); g.fillStyle = shade('#c9a77a', -0.3); g.fillRect(-E.W, GY - 6, E.W * 3, 70); });
  FX.godRays(g, CX - 520, GY - 360, { angle: Math.PI * 0.2, spread: 1.2, len: 1600, color: M.key, a: 0.06, t });
  FX.dust(g, t, { count: 30, color: '#fff0cc', a: 0.3 });
  return { GY, CX, M };
}

// ---------- высотка снаружи ночью (9-й этаж, полёт за окном) ----------
export function tower(g, t, cam, o = {}) {
  const M = base(o, 'night'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 120, area: [-E.W, -E.H * 2, E.W * 3, E.H * 3] }); FX.moon(g, CX + 600, GY - 1300, 34); });
  layer(g, cam, 0.4, (g) => FX.skyline(g, { x: -E.W, y: GY - 60, w: E.W * 3, minH: 200, maxH: 700, minW: 120, maxW: 260, color: '#151838', windowColor: alpha(M.practical, 0.8), lit: 0.3, seed: 91 }));
  layer(g, cam, 1, (g) => {
    const L = CX - 420, W = 840, top = GY - 10 * 150; g.fillStyle = linGrad(g, 0, top, 0, GY, ['#3a3a5a', '#22223a']); g.fillRect(L, top, W, GY - top);
    const r = rng(93); for (let f = 0; f < 9; f++) for (let c = 0; c < 4; c++) { const wx = L + 50 + c * 200, wy = GY - (f + 1) * 150 + 30, hi = o.hi === f + 1 && c === 1, lit = hi || r() < 0.5; g.fillStyle = lit ? (hi ? '#ffe7b0' : M.practical) : '#1a1c30'; g.fillRect(wx, wy, 110, 90); if (lit) glow(g, wx + 55, wy + 45, hi ? 220 : 110, M.practical, hi ? 0.5 : 0.12); g.fillStyle = '#14141e'; g.fillRect(wx + 53, wy, 4, 90); }
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#2a2a3a', '#0a0a14']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
  });
  return { GY, CX, M };
}

// ---------- пустая тёмная сцена (для «пятен перед глазами», памяти) ----------
export function voidset(g, t, cam, o = {}) { const M = base(o, 'void'), GY = GROUND(), CX = E.W / 2; layer(g, cam, 0.2, (g) => { backdrop(g, M.sky); glow(g, CX, GY - 300, 900, M.rim, 0.08); }); layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [M.floor, M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); }); FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.2 }); return { GY, CX, M }; }

export const SETS = { bedroom, kitchen, living, yard, field, stairwell, emptyflat, road, garage, dacha, tvstudio, hospital, lab, station, park, tower, void: voidset };
