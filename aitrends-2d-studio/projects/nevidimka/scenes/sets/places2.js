// sets/places2.js — декорации «Невидимки»: ванная, улица, метро, кабинет начальника, подъезд с лифтом,
// стадион, кинотеатр, квартира мамы. Всё якорится к GY и CX, как и остальные декорации.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const ground = () => E.H * V(0.8, 0.68);
function floor(g, M, GY, lines = true) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
  if (lines) FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.22), 0.07);
}
function wall(g, M, GY, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.wall, -0.15 + k), shade(M.wall, k), shade(M.wall, -0.3 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }

// ── ванная: кафель, зеркало (в нём героя нет), полотенце, раковина
export function bathroom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    wall(g, M, GY, 0.12);
    g.strokeStyle = alpha('#ffffff', 0.08); g.lineWidth = 2;
    for (let x = -E.W; x < E.W * 2; x += 90) { g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, GY); g.stroke(); }
    for (let y = GY; y > -E.H; y -= 90) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    const mx = CX + (o.mirrorX ?? 0), my = GY - V(640, 1000);
    rr(g, mx - 230, my - 10, 460, 340, 20); g.fillStyle = shade(M.wall, -0.5); g.fill();
    rr(g, mx - 214, my + 6, 428, 308, 14); g.fillStyle = linGrad(g, 0, my, 0, my + 300, [mix(M.sky[0], '#ffffff', 0.25), mix(M.sky[1] || M.sky[0], '#ffffff', 0.1)]); g.fill();
    g.fillStyle = alpha('#ffffff', 0.18); poly(g, [[mx - 150, my + 20], [mx - 90, my + 20], [mx - 190, my + 290], [mx - 214, my + 290], [mx - 214, my + 200]], alpha('#ffffff', 0.15));
    glow(g, mx, my - 30, 160, M.practical, 0.45); rr(g, mx - 90, my - 40, 180, 16, 8); g.fillStyle = '#fff6dc'; g.fill();
    // раковина
    rr(g, mx - 170, GY - 250, 340, 50, 20); g.fillStyle = '#e8eef2'; g.fill(); seg(g, [[mx, GY - 200], [mx, GY - 10]], 40, '#d4dce2');
    // полотенце
    const tx = CX + (o.towelX ?? 520); seg(g, [[tx - 90, GY - 470], [tx + 90, GY - 470]], 8, '#c9ccd4'); rr(g, tx - 80, GY - 470, 160, 220, 10); g.fillStyle = '#d64a6a'; g.fill(); g.fillStyle = alpha('#ffffff', 0.25); g.fillRect(tx - 80, GY - 300, 160, 14);
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, false); FX.pool(g, CX, GY + 20, 520, 60, M.practical, 0.18); });
  return { GY, CX, M };
}

// ── улица днём: дома, витрины, тротуар, фонари, деревья
export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.clouds(g, { y: GY - V(800, 1300), h: 160, color: '#ffffff', a: 0.12, seed: 6 }); });
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - V(380, 700), w: E.W * 3, maxH: V(420, 700), color: mix(M.sky[0], M.dark, 0.5), windowColor: alpha(M.practical, 0.4), lit: 0.15, seed: 14 }));
  layer(g, cam, 0.5, (g) => {
    const cols = [shade(M.wall, 0.05), shade(M.wall, -0.12), shade(M.wall, 0.12), shade(M.wall, -0.05)];
    for (let i = -4; i <= 4; i++) FX.facade(g, { x: CX + i * 460 - 230, y: GY - 30, w: 450, h: V(560 + (i % 3) * 70, 900), color: cols[(i + 8) % 4], win: alpha(M.practical, 0.8), dark: shade(M.dark, -0.1), cols: 4, rows: 4, lit: o.lit ?? 0.2, seed: 20 + i });
    if (o.shop) { const sx = CX + o.shop; rr(g, sx - 200, GY - 290, 400, 260, 6); g.fillStyle = alpha(M.practical, 0.5); g.fill(); g.strokeStyle = shade(M.dark, -0.3); g.lineWidth = 10; g.strokeRect(sx - 200, GY - 290, 400, 260); }
  });
  layer(g, cam, 0.8, (g) => { for (const lx of [-900, -300, 300, 900]) FX.lampPost(g, CX + lx, GY, 330, { light: M.practical, on: !!o.night, a: 0.18 }); for (const tx of [-620, 620]) FX.tree(g, CX + tx, GY - 6, 1.5, shade(M.grass, -0.45)); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 300, [shade(M.road, 0.35), shade(M.road, -0.1)]); g.fillRect(-E.W * 2, GY - 30, E.W * 5, E.H * 2); FX.floorLines(g, GY - 30, GY + 600, alpha('#000000', 0.15), 0.1); });
  return { GY, CX, M };
}

// ── вагон метро: окна-туннель, поручни, сиденья
export function metro(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    wall(g, M, GY, 0.05);
    for (let i = -3; i <= 3; i++) {
      const x = CX + i * 520 - 180;
      rr(g, x, GY - V(560, 900), 360, 220, 30); g.fillStyle = '#0d0f18'; g.fill();
      for (let k = 0; k < 4; k++) { const lx = x + ((t * 900 + k * 220 + i * 80) % 420) - 30; if (lx > x + 10 && lx < x + 350) { glow(g, lx, GY - V(450, 790), 40, '#ffd28a', 0.6); } }
      rr(g, x + 20, GY - 230, 320, 70, 14); g.fillStyle = shade(M.wall, -0.4); g.fill();
    }
    seg(g, [[-E.W, GY - V(640, 980)], [E.W * 2, GY - V(640, 980)]], 8, '#c9ccd4');
    for (let i = -4; i <= 4; i++) seg(g, [[CX + i * 520, GY - V(640, 980)], [CX + i * 520, GY]], 7, '#c9ccd4');
    glow(g, CX, -100, 900, '#e8f0ff', 0.12);
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, false));
  return { GY, CX, M };
}

// ── кабинет начальника: стеклянная стена в коридор, стол, сейф в углу, жалюзи
export function cabinet(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.skyline(g, { x: -E.W, y: GY - V(260, 560), w: E.W * 3, maxH: V(460, 700), color: mix(M.sky[0], M.dark, 0.55), windowColor: alpha(M.practical, 0.35), lit: 0.15, seed: 31 }); });
  layer(g, cam, 0.5, (g) => {
    const wt = GY - V(860, 1260), wb = GY - V(360, 620);
    g.save(); g.beginPath(); g.rect(-E.W * 2, -E.H, E.W * 5, GY + E.H); g.rect(CX + 700, wt, -900, wb - wt); g.fillStyle = linGrad(g, 0, wt, 0, GY, [shade(M.wall, -0.05), shade(M.wall, -0.3)]); g.fill('evenodd'); g.restore();
    FX.windowFrame(g, { x: CX - 200, y: wt, w: 900, h: wb - wt, cols: 3, frame: shade(M.wall, -0.55), bar: 10, blinds: 10 }, () => {});
    // стеклянная стена в коридор (слева)
    const gx = CX - 980; g.fillStyle = alpha(mix(M.sky[1] || M.sky[0], '#ffffff', 0.4), 0.22); g.fillRect(gx, -E.H, 560, GY + E.H);
    for (let k = 0; k < 3; k++) seg(g, [[gx + k * 280, -E.H], [gx + k * 280, GY]], 8, shade(M.wall, -0.5));
    g.fillStyle = alpha('#ffffff', 0.08); poly(g, [[gx + 40, -E.H], [gx + 120, -E.H], [gx + 260, GY], [gx + 180, GY]], alpha('#ffffff', 0.07));
    // сейф
    const sx = CX + (o.safeX ?? 780);
    rr(g, sx - 120, GY - 300, 240, 300, 12); g.fillStyle = '#4a4e5c'; g.fill(); rr(g, sx - 100, GY - 280, 200, 260, 8); g.fillStyle = '#5c6070'; g.fill();
    circle(g, sx + 40, GY - 160, 34, '#2a2c34'); ring(g, sx + 40, GY - 160, 26, 4, '#c9ccd4'); seg(g, [[sx - 60, GY - 190], [sx - 60, GY - 130]], 10, '#c9ccd4');
    if (o.safeOpen) { rr(g, sx - 100, GY - 280, 200, 260, 8); g.fillStyle = '#1a1c24'; g.fill(); rr(g, sx - 60, GY - 200, 120, 70, 6); g.fillStyle = '#f4efe4'; g.fill(); }
    // часы на стене
    FX.clock(g, CX + 120, wt - V(80, 120), 34, o.clockTime ?? (11 * 3600 + t), { face: '#efe9df' });
  });
  layer(g, cam, 0.8, (g) => {
    const dx = CX + (o.deskX ?? 240);
    rr(g, dx - 260, GY - 150, 520, 26, 6); g.fillStyle = '#6a4a36'; g.fill(); g.fillStyle = '#4a3226'; g.fillRect(dx - 240, GY - 124, 60, 124); g.fillRect(dx + 180, GY - 124, 60, 124);
    rr(g, dx - 40, GY - 210, 110, 64, 4); g.fillStyle = '#1c2029'; g.fill(); g.fillStyle = '#3d7fc0'; g.fillRect(dx - 34, GY - 204, 98, 52);
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX + 200, GY + 20, 600, 60, M.key, 0.14); });
  return { GY, CX, M };
}

// ── подъезд: двери лифта, почтовые ящики, лампа под потолком
export function stairs(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    wall(g, M, GY, -0.05); g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W * 2, GY - V(300, 500), E.W * 5, V(300, 500));
    const lx = CX + (o.liftX ?? 300), op = o.liftOpen ?? 0;
    rr(g, lx - 180, GY - 470, 360, 470, 6); g.fillStyle = shade(M.dark, -0.2); g.fill();
    g.fillStyle = '#9aa0aa'; g.fillRect(lx - 170, GY - 460, 170 * (1 - op), 460); g.fillRect(lx + 170 * op, GY - 460, 170 * (1 - op), 460);
    if (op > 0) { g.fillStyle = alpha('#ffe9c4', 0.6); g.fillRect(lx - 170 * op, GY - 460, 340 * op, 460); }
    seg(g, [[lx, GY - 460], [lx, GY]], 3 * (1 - op), '#6a7080'); circle(g, lx + 240, GY - 240, 14, '#ffb860');
    // почтовые ящики
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { rr(g, CX - 760 + j * 80, GY - 560 + i * 70, 70, 60, 4); g.fillStyle = '#4a6a8a'; g.fill(); }
    // дверь квартиры
    FX.door(g, { x: CX + (o.doorX ?? -260), y: GY, w: 160, h: V(380, 440), color: '#5a3a30', open: o.doorOpen ?? 0, light: '#ffe2b0' });
    circle(g, CX, -40, 26, '#fff3d6'); glow(g, CX, -40, 420, M.practical, 0.35);
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX, GY + 20, 520, 60, M.practical, 0.16); });
  return { GY, CX, M };
}

// ── стадион: трибуны с толпой, прожекторы, газон, скамейка запасных
export function stadium(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); for (const x of [-700, 700]) { seg(g, [[CX + x, GY - 1100], [CX + x, GY - 380]], 12, '#1a1c2a'); rr(g, CX + x - 120, GY - 1180, 240, 90, 8); g.fillStyle = '#e8f0ff'; g.fill(); glow(g, CX + x, GY - 1140, 600, '#e8f0ff', 0.4); FX.lightCone(g, CX + x, GY - 1130, { angle: Math.PI / 2 + (x < 0 ? -0.35 : 0.35), spread: 0.35, len: 1400, color: '#e8f0ff', a: 0.08 }); } });
  layer(g, cam, 0.35, (g) => { g.fillStyle = '#1e2134'; g.fillRect(-E.W * 2, GY - 420, E.W * 5, 360); FX.crowd(g, t, { y: GY - 400, rows: 7, rowH: 44, size: 1.4, color: '#2e3250', w: E.W * 3, x: -E.W, cheer: o.cheer ?? 0.3 }); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 60, 0, GY + 400, ['#2f6a3c', '#1d4426']); g.fillRect(-E.W * 2, GY - 60, E.W * 5, E.H * 2);
    for (let i = -10; i < 10; i++) { g.fillStyle = alpha('#ffffff', i % 2 ? 0.03 : 0); g.fillRect(CX + i * 200, GY - 60, 200, E.H); }
    seg(g, [[-E.W * 2, GY - 40], [E.W * 3, GY - 40]], 5, alpha('#ffffff', 0.6));
    // скамейка запасных под козырьком
    const bx = CX + (o.benchX ?? 0); rr(g, bx - 380, GY - 320, 760, 30, 10); g.fillStyle = alpha('#c9e0ff', 0.35); g.fill(); seg(g, [[bx - 360, GY - 300], [bx - 360, GY]], 8, '#9aa0aa'); seg(g, [[bx + 360, GY - 300], [bx + 360, GY]], 8, '#9aa0aa');
    rr(g, bx - 340, GY - 90, 680, 22, 6); g.fillStyle = '#2a5aa0'; g.fill();
  });
  return { GY, CX, M };
}

// ── кинозал: экран со светом, ряды кресел
export function cinema(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = '#0c0b14'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H * 3);
    rr(g, CX - 760, GY - V(820, 1200), 1520, 560, 10); g.fillStyle = linGrad(g, CX - 760, 0, CX + 760, 0, ['#5a7ab8', '#e8c0a0', '#7aa0d8']); g.fill();
    glow(g, CX, GY - V(540, 920), 1100, '#c0d0ff', 0.25 + 0.05 * Math.sin(t * 3));
  });
  layer(g, cam, 0.9, (g) => {
    for (let r = 0; r < 3; r++) for (let i = -9; i <= 9; i++) { const x = CX + i * 120, y = GY - 20 + r * 110; rr(g, x - 50, y - 120 + r * 10, 100, 120, 18); g.fillStyle = shade('#7a2230', -0.1 * r); g.fill(); }
  });
  return { GY, CX, M };
}

// ── квартира мамы: кухня, холодильник с рисунками, полка с фото, дверь в комнату
export function kitchen(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    wall(g, M, GY, 0.08);
    const fx = CX + (o.fridgeX ?? -420);
    rr(g, fx - 130, GY - 560, 260, 560, 18); g.fillStyle = '#e8ecf0'; g.fill(); seg(g, [[fx - 130, GY - 360], [fx + 130, GY - 360]], 4, '#c9ccd4'); seg(g, [[fx + 100, GY - 520], [fx + 100, GY - 420]], 10, '#9aa0aa');
    if (!o.empty) { const cols = ['#f2c21a', '#8fd0f2', '#f29ac0', '#9fd8a8']; for (let i = 0; i < 4; i++) { rr(g, fx - 110 + (i % 2) * 110, GY - 540 + Math.floor(i / 2) * 90, 90, 76, 4); g.fillStyle = '#fbf8f1'; g.fill(); circle(g, fx - 66 + (i % 2) * 110, GY - 504 + Math.floor(i / 2) * 90, 18, cols[i]); seg(g, [[fx - 90 + (i % 2) * 110, GY - 478 + Math.floor(i / 2) * 90], [fx - 40 + (i % 2) * 110, GY - 486 + Math.floor(i / 2) * 90]], 5, cols[(i + 1) % 4]); } }
    // полка с фото
    const px = CX + (o.shelfX ?? 160); seg(g, [[px - 160, GY - 520], [px + 160, GY - 520]], 10, '#8a5a3c');
    if (!o.empty) { rr(g, px - 50, GY - 640, 100, 120, 6); g.fillStyle = '#2a2630'; g.fill(); g.fillStyle = mix(M.sky[1] || M.sky[0], '#ffffff', 0.3); g.fillRect(px - 40, GY - 630, 80, 100); circle(g, px - 12, GY - 594, 12, '#141414'); circle(g, px + 14, GY - 594, 12, '#141414'); }
    rr(g, px + 70, GY - 600, 60, 80, 6); g.fillStyle = '#b07a4a'; g.fill();
    // окно
    const wx = CX + 480; FX.windowFrame(g, { x: wx, y: GY - 640, w: 300, h: 260, cols: 2, frame: shade(M.wall, -0.5), bar: 8 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); });
    FX.counter(g, { x: CX + 360, y: GY, w: 560, h: 110, color: shade(M.wall, -0.4), top: '#d9c8a8', doors: 4 });
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX, GY + 20, 520, 60, M.practical, 0.18); });
  return { GY, CX, M };
}
