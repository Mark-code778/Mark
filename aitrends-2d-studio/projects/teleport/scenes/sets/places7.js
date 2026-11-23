// sets/places7.js — декорации «Что, если над каждым висит таймер жизни?»: двор с подъездом (лавочка, площадка, ларёк),
// платформа метро, опенспейс, балкон, дача, крыша гаражей. Реквизит: дефибриллятор на стене, датчик дыма,
// шлем, термос, грядка, саженец яблони, кофейня-витрина. Всё якорится к GY и CX.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, text, FONTS, clamp, lerp, ease } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const ground = () => E.H * V(0.8, 0.68);
function paintWall(g, GY, c, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(c, -0.12 + k), shade(c, k), shade(c, -0.22 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }
function floor(g, M, GY, c) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(c || M.floor, -0.02), shade(c || M.dark, -0.2)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.18), 0.07); }
const dim = (g, k) => { if (!k) return; g.fillStyle = `rgba(8,10,24,${k})`; g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5); };
function skyBack(g, M, CX, GY, o = {}) {
  backdrop(g, M.sky);
  if (o.night) FX.stars(g, 0, { count: 90, area: [-E.W, -E.H, E.W * 3, GY] });
  if (o.sun !== false && !o.night) FX.sun(g, CX + (o.sunX ?? 420), GY - V(720, 1100), 46, '#fff6e2', M.key, 4);
  if (o.night) FX.moon(g, CX + 520, GY - V(760, 1100), 34);
}
// панельная пятиэтажка
function panel(g, x, y, w, h, o = {}) {
  rr(g, x, y - h, w, h, 4); g.fillStyle = o.color || '#c8bfb4'; g.fill();
  const cols = Math.floor(w / 110), rows = Math.floor(h / 120);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x + 30 + c * 110, wy = y - h + 30 + r * 120, lit = ((r * 7 + c * 13) % 5) < (o.night ? 2 : 0);
    rr(g, wx, wy, 60, 70, 3); g.fillStyle = lit ? '#ffd59a' : (o.night ? '#2a3050' : '#8fb0cc'); g.fill();
    if (r > 0 && (c % 3 === 1)) { g.fillStyle = shade(o.color || '#c8bfb4', -0.18); g.fillRect(wx - 12, wy + 70, 84, 14); }
  }
}

// ── реквизит
export function aed(g, x, y, o = {}) { // автоматический дефибриллятор на стене
  rr(g, x - 60, y - 70, 120, 140, 10); g.fillStyle = '#2aa05a'; g.fill(); rr(g, x - 50, y - 60, 100, 120, 6); g.fillStyle = o.open ? '#f4f1ea' : '#34b86a'; g.fill();
  if (!o.open) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y + 20); g.bezierCurveTo(x - 46, y - 10, x - 20, y - 48, x, y - 26); g.bezierCurveTo(x + 20, y - 48, x + 46, y - 10, x, y + 20); g.fill(); poly(g, [[x + 4, y - 34], [x - 10, y - 4], [x + 2, y - 4], [x - 6, y + 14], [x + 12, y - 12], [x, y - 12]], '#2aa05a'); }
  else { rr(g, x - 34, y - 40, 68, 54, 6); g.fillStyle = '#1e2230'; g.fill(); circle(g, x - 14, y + 34, 10, '#e8c040'); circle(g, x + 16, y + 34, 10, '#e04a3a'); }
  if (o.label !== false) text(g, 'AED', x, y - 92, { size: 26, font: FONTS.ui, weight: 900, color: '#2aa05a' });
  if (o.glow) glow(g, x, y, 200, '#4ad07a', 0.3 + 0.15 * Math.sin((o.t || 0) * 5));
}
export function smokedet(g, x, y) { g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(x, y, 46, 16, 0, 0, Math.PI); g.fill(); rr(g, x - 50, y - 6, 100, 10, 3); g.fillStyle = '#e8e4dc'; g.fill(); circle(g, x + 20, y + 6, 4, '#e02a2a'); }
export function helmet(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#1e2230'; g.beginPath(); g.arc(0, -40, 46, Math.PI, 0); g.lineTo(46, 0); g.lineTo(-46, 0); g.fill(); g.fillStyle = '#7fb8e8'; g.beginPath(); g.ellipse(20, -30, 22, 16, 0, 0, 7); g.fill(); seg(g, [[-40, -40], [30, -78]], 6, '#e8622a'); g.restore(); }
export function thermos(g, x, y) { rr(g, x - 16, y - 90, 32, 90, 8); g.fillStyle = '#3a6ea5'; g.fill(); rr(g, x - 18, y - 104, 36, 18, 5); g.fillStyle = '#2a2a30'; g.fill(); }
export function gbed(g, x, y, w = 420, dug = 1) { // грядка
  rr(g, x - w / 2, y - 30, w, 36, 8); g.fillStyle = '#6a4a30'; g.fill(); g.fillStyle = '#4a3020'; for (let i = 0; i < w * dug / 40; i++) { g.beginPath(); g.ellipse(x - w / 2 + 20 + i * 40, y - 30, 16, 8, 0, Math.PI, 0); g.fill(); }
}
export function sapling(g, x, y, s = 1, apples = false) {
  g.save(); g.translate(x, y); g.scale(s, s); seg(g, [[0, 0], [0, -170]], 9, '#6a4a2a'); seg(g, [[0, -110], [-40, -150]], 5, '#6a4a2a'); seg(g, [[0, -130], [38, -170]], 5, '#6a4a2a');
  for (const [dx, dy, r] of [[-44, -158, 26], [40, -178, 28], [0, -196, 32], [-10, -150, 22], [22, -140, 20]]) circle(g, dx, dy, r, '#4a9a4a');
  if (apples) for (const [dx, dy] of [[-30, -150], [36, -168], [6, -200]]) circle(g, dx, dy, 8, '#e04a3a');
  g.restore();
}
export function ptimer(g, x, y, s, c = '#ff4a4a', sz = 26) { // маленький таймер (для толпы)
  const w = s.length * sz * 0.62 + 20; rr(g, x - w / 2, y - sz * 0.75, w, sz * 1.5, 7); g.fillStyle = 'rgba(10,8,16,.8)'; g.fill(); g.strokeStyle = alpha(c, 0.8); g.lineWidth = 2; g.stroke();
  text(g, s, x, y + 1, { size: sz, font: FONTS.ui, weight: 900, color: c, glow: 10, glowColor: alpha(c, 0.7) });
}

// ── двор: пятиэтажка с подъездом, лавочка, площадка, ларёк
export function courtyard(g, t, cam, o = {}) {
  const M = mood(o.mood || (o.night ? 'night' : 'day')), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => skyBack(g, M, CX, GY, o));
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, maxH: V(300, 520), color: alpha('#6a7a9a', 0.6), seed: 12 }));
  layer(g, cam, 0.55, (g) => {
    panel(g, CX - 1400, GY, 1600, V(760, 1100), { night: o.night });
    panel(g, CX + 380, GY, 1200, V(700, 1000), { color: '#d8c8a8', night: o.night });
    // подъезд
    const dx = CX + (o.doorX ?? -420); rr(g, dx - 90, GY - 260, 180, 260, 4); g.fillStyle = '#5a4a40'; g.fill(); rr(g, dx - 72, GY - 240, 144, 240, 4); g.fillStyle = '#3a6a8a'; g.fill();
    rr(g, dx - 130, GY - 300, 260, 30, 4); g.fillStyle = '#8a8a90'; g.fill(); circle(g, dx + 50, GY - 120, 7, '#c9ccd4');
    if (o.night) { FX.lampPost(g, dx - 160, GY, 280); }
  });
  layer(g, cam, 0.8, (g) => {
    if (o.play) { // площадка: горка и качели
      const px = CX + (o.playX ?? 560); seg(g, [[px - 120, GY], [px - 90, GY - 260], [px + 90, GY - 260], [px + 120, GY]], 10, '#e04a3a'); const sw = Math.sin(t * 1.4) * 0.25; for (const d of [-30, 30]) seg(g, [[px + d, GY - 260], [px + d + Math.sin(sw) * 180, GY - 100]], 3, '#5a5e68'); rr(g, px - 40 + Math.sin(sw) * 180, GY - 106, 80, 12, 4); g.fillStyle = '#f2c84a'; g.fill();
      const sx = px - 420; poly(g, [[sx, GY], [sx + 40, GY - 200], [sx + 80, GY - 200], [sx + 260, GY]], '#3a8ad0'); seg(g, [[sx, GY], [sx, GY - 220]], 8, '#f2c84a'); seg(g, [[sx + 60, GY], [sx + 60, GY - 220]], 8, '#f2c84a');
    }
    if (o.kiosk != null) { // ларёк
      const kx = CX + o.kiosk; rr(g, kx - 170, GY - 330, 340, 330, 6); g.fillStyle = '#e8e2d4'; g.fill(); rr(g, kx - 190, GY - 360, 380, 50, 6); g.fillStyle = '#c0453a'; g.fill();
      text(g, 'ПРОДУКТЫ', kx, GY - 334, { size: 30, font: FONTS.ui, weight: 900, color: '#fff' }); rr(g, kx - 130, GY - 290, 260, 150, 4); g.fillStyle = '#3a4a5a'; g.fill(); rr(g, kx - 150, GY - 140, 300, 14, 3); g.fillStyle = '#8a7a6a'; g.fill();
      for (let i = 0; i < 6; i++) { rr(g, kx - 120 + i * 40, GY - 270 + (i % 2) * 50, 28, 40, 3); g.fillStyle = ['#f2c84a', '#e04a3a', '#4aa8e8', '#4ad07a', '#e86a9a', '#f29a2a'][i]; g.fill(); }
    }
    if (o.bench != null) { const bx = CX + o.bench; rr(g, bx - 230, GY - 110, 460, 24, 6); g.fillStyle = '#7a5a3a'; g.fill(); rr(g, bx - 230, GY - 190, 460, 20, 6); g.fill(); seg(g, [[bx - 200, GY - 90], [bx - 200, GY]], 10, '#2a2a30'); seg(g, [[bx + 200, GY - 90], [bx + 200, GY]], 10, '#2a2a30'); }
    if (o.trees !== false) for (const d of [-860, 860]) FX.tree(g, CX + d, GY, 1.7, '#3a6a3a');
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7a7c84', '#4a4c54']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000', 0.12), 0.09); });
  return { GY, CX, M, fg: o.night ? (g) => dim(g, 0.15) : null };
}

// ── платформа метро
export function platform(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#b8b0a4');
    for (let y = GY - 900; y < GY; y += 60) { g.fillStyle = alpha('#000', 0.05); g.fillRect(-E.W, y, E.W * 3, 2); }
    g.fillStyle = '#3a6ea5'; g.fillRect(-E.W, GY - 520, E.W * 3, 60);
    text(g, o.station || 'ПЛОЩАДЬ МИРА', CX + 40, GY - 490, { size: 38, font: FONTS.ui, weight: 900, color: '#fff', spacing: 3 });
    circle(g, CX - 220, GY - 490, 40, '#c0453a'); text(g, 'М', CX - 220, GY - 488, { size: 46, font: FONTS.ui, weight: 900, color: '#fff' });
    for (let i = -3; i <= 3; i++) { const x = CX + i * 720 + 360; rr(g, x - 60, -E.H, 120, GY + E.H, 6); g.fillStyle = linGrad(g, x - 60, 0, x + 60, 0, ['#8a8478', '#d8d0c4', '#8a8478']); g.fill(); }
    for (let i = -3; i <= 3; i++) { glow(g, CX + i * 560, GY - 760, 300, '#fff4d8', 0.25); }
    if (o.aed != null) aed(g, CX + o.aed, GY - 300, { t, glow: o.aedGlow });
  });
  layer(g, cam, 0.9, (g) => {
    floor(g, M, GY, '#8a8478'); g.fillStyle = '#e8c040'; g.fillRect(-E.W * 2, GY + V(170, 260), E.W * 5, 14);
  });
  return { GY, CX, M };
}

// ── опенспейс
export function office(g, t, cam, o = {}) {
  const M = mood('day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => {
    paintWall(g, GY, '#d4d8dc');
    for (let i = -2; i <= 2; i++) FX.windowFrame(g, { x: CX + i * 520, y: GY - V(780, 1100), w: 420, h: 360, cols: 2, frame: '#f4f1ea', bar: 8 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.skyline(g, { x, y: y + h, w, maxH: h * 0.6, color: alpha('#7a86a0', 0.8), seed: 3 + i }); });
  });
  layer(g, cam, 0.65, (g) => { // дальний ряд столов
    for (let i = -3; i <= 3; i++) { const x = CX + i * 380; rr(g, x - 150, GY - 260, 300, 16, 4); g.fillStyle = '#a89a8a'; g.fill(); rr(g, x - 60, GY - 370, 120, 90, 6); g.fillStyle = '#1e2230'; g.fill(); rr(g, x - 52, GY - 362, 104, 74, 4); g.fillStyle = '#5a8ad0'; g.fill(); seg(g, [[x, GY - 280], [x, GY - 262]], 8, '#2a2a30'); }
    if (o.chat) { rr(g, CX + 560, GY - 640, 260, 150, 12); g.fillStyle = '#fbf8f1'; g.fill(); text(g, 'ЧАТ: 99+', CX + 690, GY - 565, { size: 30, font: FONTS.ui, weight: 900, color: '#c0453a' }); }
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#8a8a92'));
  return { GY, CX, M };
}

// ── балкон: перила за героями, вид на город
export function balcony(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => skyBack(g, M, CX, GY, { ...o, sunX: -300 }));
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, maxH: V(460, 700), color: alpha('#4a4060', 0.85), windowColor: alpha('#ffd59a', 0.6), seed: 21 }));
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = '#b8aca0'; g.fillRect(CX - 1400, -E.H, 340, GY + E.H); rr(g, CX - 1150, GY - 520, 160, 520, 4); g.fillStyle = '#5a4a40'; g.fill(); // стена и дверь
    g.fillStyle = '#d8d0c4'; g.fillRect(CX - 1060, GY - 230, E.W * 3, 18); for (let x = CX - 1040; x < CX + 1400; x += 36) seg(g, [[x, GY - 214], [x, GY]], 5, '#6a6a72');
    if (o.plant !== false) { rr(g, CX + 700, GY - 70, 70, 70, 6); g.fillStyle = '#c0703a'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[CX + 735, GY - 70], [CX + 700 + i * 18, GY - 160 - (i % 2) * 30]], 5, '#4a9a4a'); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#8a8078', '#5a524c']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); });
  return { GY, CX, M };
}

// ── дача: дом, забор, грядка, яблоня
export function dacha(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => skyBack(g, M, CX, GY, { ...o, sunX: 520 }));
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 160, amp: 90, color: '#6a9a5a', seed: 4 }); for (let i = -5; i <= 5; i++) FX.pine(g, CX + i * 260 + 60, GY - 120, 1.1, '#3a5a3a'); });
  layer(g, cam, 0.55, (g) => {
    const hx = CX + (o.houseX ?? 560); rr(g, hx - 260, GY - 380, 520, 380, 4); g.fillStyle = '#c89a6a'; g.fill(); for (let y = GY - 360; y < GY; y += 30) { g.fillStyle = alpha('#000', 0.08); g.fillRect(hx - 260, y, 520, 3); }
    poly(g, [[hx - 300, GY - 380], [hx, GY - 600], [hx + 300, GY - 380]], '#7a3a2a'); rr(g, hx - 80, GY - 290, 160, 130, 4); g.fillStyle = '#f4f1ea'; g.fill(); rr(g, hx - 70, GY - 280, 140, 110, 3); g.fillStyle = '#8fc0e0'; g.fill();
    for (let x = -E.W; x < E.W * 2.2; x += 40) { if (x > CX - 1000 + E.W * 0 && x > CX + 1100) continue; rr(g, x - 8, GY - 190, 16, 190, 3); g.fillStyle = '#b8945a'; g.fill(); }
  });
  layer(g, cam, 0.8, (g) => {
    if (o.bed !== false) gbed(g, CX + (o.bedX ?? -120), GY + 10, 520, o.dug ?? 1);
    if (o.tree != null) FX.tree(g, CX + o.tree, GY, 2.2, '#3a7a3a');
    if (o.sapling != null) sapling(g, CX + o.sapling, GY, o.sapS ?? 1.4, o.apples);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7ab060', '#4a7a40']); g.fillRect(-E.W * 2, GY - 4, E.W * 5, E.H * 2); });
  return { GY, CX, M };
}

// ── крыша гаражей (герои сидят на y ≈ -250)
export function garages(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => skyBack(g, M, CX, GY, { ...o, sunX: -200 }));
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - 200, w: E.W * 3, maxH: V(420, 640), color: alpha('#3a3050', 0.85), windowColor: alpha('#ffd59a', 0.6), seed: 31 }));
  layer(g, cam, 0.8, (g) => {
    for (let i = -4; i <= 4; i++) { const x = CX + i * 380; rr(g, x - 185, GY - 250, 370, 250, 2); g.fillStyle = ['#6a7a8a', '#7a6a5a', '#5a6a5a'][(i + 9) % 3]; g.fill(); rr(g, x - 140, GY - 200, 280, 200, 2); g.fillStyle = shade(['#6a7a8a', '#7a6a5a', '#5a6a5a'][(i + 9) % 3], -0.15); g.fill(); for (let y = GY - 190; y < GY; y += 24) { g.fillStyle = alpha('#000', 0.1); g.fillRect(x - 140, y, 280, 3); } }
    g.fillStyle = '#3a3a40'; g.fillRect(-E.W * 2, GY - 262, E.W * 5, 14);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#5a5a5a', '#3a3a3e']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); });
  return { GY, CX, M, fg: (g) => dim(g, o.night ? 0.2 : 0.05) };
}

// ── кофейня снаружи: витрина
export function coffeeshop(g, t, cam, o = {}) {
  const M = mood('day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#5a4a40');
    rr(g, CX - 700, GY - 620, 1000, 520, 6); g.fillStyle = '#f4d8a8'; g.fill(); rr(g, CX - 680, GY - 600, 960, 480, 4); g.fillStyle = linGrad(g, 0, GY - 600, 0, GY - 120, ['#ffe6b8', '#d8a870']); g.fill();
    for (let i = 0; i < 5; i++) { rr(g, CX - 600 + i * 180, GY - 260, 120, 60, 10); g.fillStyle = ['#f2c8d8', '#c08a5a', '#f4efe6', '#e8a0a0', '#8a5a3a'][i]; g.fill(); }
    rr(g, CX - 560, GY - 760, 720, 110, 10); g.fillStyle = '#2a2026'; g.fill(); text(g, 'КОФЕЙНЯ', CX - 200, GY - 705, { size: 64, font: FONTS.ui, weight: 900, color: '#f4d8a8', spacing: 6 });
    rr(g, CX + 380, GY - 420, 160, 420, 4); g.fillStyle = '#3a2a24'; g.fill();
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#8a8c94', '#5a5c64']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); });
  return { GY, CX, M };
}
