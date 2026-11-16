// sets/world.js — every location of "Моргни". Each set: fn(g, t, cam, opts) -> { GY, CX, M }.
// Characters are drawn by the shots at depth 1 on GY. Walls/floors/skies extend far past the frame.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, rng, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GROUND = () => E.H * V(0.8, 0.68);
const WIDE = (g, fill, y0, y1) => { g.fillStyle = fill; g.fillRect(-E.W * 1.5, y0, E.W * 4, y1 - y0); };

// ---------- props shared by several sets ----------
// side-view crossover, facing +x when f = 1; y = ground line
export function car(g, x, y, s = 1, color = '#8e96a3', f = 1, o = {}) {
  const ink = '#0e0b12', hi = shade(color, 0.35), lo = shade(color, -0.35);
  g.save(); g.translate(x, y); g.scale(s * f, s);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(0, 2, 340, 20, 0, 0, Math.PI * 2); g.fill();
  // cabin
  poly(g, [[-245, -168], [-165, -272], [150, -276], [262, -168]], shade(color, -0.12));
  // glass
  g.save(); g.beginPath(); g.moveTo(-215, -172); g.lineTo(-152, -258); g.lineTo(140, -261); g.lineTo(234, -172); g.closePath(); g.clip();
  g.fillStyle = linGrad(g, 0, -235, 0, -150, ['#3a4660', '#151a26']); g.fillRect(-260, -260, 520, 120);
  g.fillStyle = 'rgba(220,235,255,.22)'; g.beginPath(); g.moveTo(-90, -240); g.lineTo(-40, -240); g.lineTo(-110, -150); g.lineTo(-160, -150); g.fill();
  g.fillStyle = 'rgba(220,235,255,.12)'; g.beginPath(); g.moveTo(40, -240); g.lineTo(60, -240); g.lineTo(-10, -150); g.lineTo(-30, -150); g.fill();
  g.restore();
  seg(g, [[-12, -262], [-6, -170]], 12, shade(color, -0.12));
  // body
  rr(g, -318, -178, 640, 130, 48); g.fillStyle = linGrad(g, 0, -178, 0, -48, [hi, color, lo]); g.fill();
  g.fillStyle = shade(color, -0.55); g.fillRect(-300, -64, 600, 18);
  seg(g, [[-300, -128], [300, -128]], 3, alpha(hi, 0.8)); for (const rx of [-190, 200]) { g.fillStyle = '#1c1c24'; g.beginPath(); g.arc(rx, -52, 74, Math.PI, 0); g.fill(); } seg(g, [[-200, -282], [140, -284]], 6, '#2a2a34');
  
  // lights
  rr(g, 290, -160, 26, 18, 6); g.fillStyle = '#fff3d6'; g.fill(); glow(g, 305, -151, 60, '#fff1d0', o.lights ? 0.8 : 0.25);
  rr(g, -318, -160, 18, 22, 5); g.fillStyle = '#d0302a'; g.fill(); glow(g, -310, -148, 40, '#ff3a2a', 0.2);
  // wheels
  for (const wx of [-190, 200]) {
    circle(g, wx, -50, 62, ink); circle(g, wx, -50, 36, '#9aa0aa'); circle(g, wx, -50, 13, '#4a4e58');
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + (o.spin || 0); seg(g, [[wx, -50], [wx + Math.cos(a) * 32, -50 + Math.sin(a) * 32]], 7, '#6a707c'); }
  }
  g.restore();
}
// price stand; returns nothing
export function priceStand(g, x, y, s, str, M, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[0, 0], [0, -150]], 6, '#20202c'); seg(g, [[-40, 0], [40, 0]], 6, '#20202c');
  rr(g, -90, -250, 180, 110, 10); g.fillStyle = '#f4f1ea'; g.fill();
  rr(g, -90, -250, 180, 30, 10); g.fillStyle = o.accent || '#c0392b'; g.fill(); g.fillRect(-90, -232, 180, 12);
  text(g, 'ЦЕНА', 0, -236, { size: 18, font: FONTS.ui, weight: 900, color: '#fff' });
  text(g, str, 0, -184, { size: str.length > 9 ? 27 : 32, font: FONTS.ui, weight: 900, color: '#1a1622' });
  text(g, 'РУБ.', 0, -156, { size: 16, font: FONTS.ui, weight: 900, color: '#6a6470' });
  glow(g, 0, -195, 140, '#ffffff', 0.08);
  g.restore();
}
export function calendar(g, x, y, s, year, M) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -70, -90, 140, 180, 6); g.fillStyle = '#efeae2'; g.fill();
  g.fillStyle = '#c0392b'; g.fillRect(-70, -90, 140, 46); for (const dx of [-40, 40]) { circle(g, dx, -90, 7, '#2a2a32'); }
  text(g, String(year), 0, -66, { size: 30, font: FONTS.ui, weight: 900, color: '#fff' });
  g.fillStyle = '#9a949e'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) g.fillRect(-56 + c * 20, -28 + r * 22, 10, 8);
  g.restore();
}
function ceilingLights(g, y, M, xs, w = 220) {
  for (const x of xs) { rr(g, x - w / 2, y - 6, w, 12, 6); g.fillStyle = '#f2f6ff'; g.fill(); glow(g, x, y, w * 1.1, M.practical, 0.18); }
}
function plant(g, x, y, s = 1, col = '#1e3a2e') {
  rr(g, x - 26 * s, y - 60 * s, 52 * s, 60 * s, 8 * s); g.fillStyle = '#2a2430'; g.fill();
  for (const [dx, dy, r] of [[0, -110, 34], [-30, -86, 26], [30, -90, 28], [-12, -140, 22], [18, -132, 24]]) circle(g, x + dx * s, y + dy * s, r * s, col);
}

// ---------- 1. Car showroom on Kutuzovsky ----------
// opts: carColor, price, year, clock (seconds of day), repaint, mood, sign
export function showroom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = GROUND(), CX = E.W / 2;
  const wall = o.repaint ? '#4a3346' : M.wall, wallD = shade(wall, -0.35);
  const winL = CX - 1900, winR = CX + 220, winT = GY - 700, winB = GY - 40;
  layer(g, cam, 0.15, (g) => {                       // outside: sky + Moscow skyline seen through the glass
    backdrop(g, o.mood === 'golden' ? ['#4a3a6a', '#d88a6a', '#f7cf98'] : ['#1a2244', '#3a4a80', '#8a90b8']);
    if (o.mood === 'golden') FX.sun(g, CX - 500, GY - 520, 46, '#fff3dc', '#ffcf8f', 5);
    FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 120, maxH: 380, color: o.mood === 'golden' ? '#5a3a4a' : '#232a48', windowColor: alpha(M.practical === '#9fe0ff' ? '#ffd59a' : M.practical, 0.7), lit: 0.3, seed: 21 });
    // a Stalin high-rise with a spire — Kutuzovsky
    const sx = CX - 720, sb = GY - 120, c = o.mood === 'golden' ? '#4a2e3e' : '#1b2140';
    g.fillStyle = c; g.fillRect(sx - 160, sb - 300, 320, 300); g.fillRect(sx - 100, sb - 430, 200, 140); g.fillRect(sx - 55, sb - 520, 110, 100); poly(g, [[sx - 22, sb - 520], [sx + 22, sb - 520], [sx, sb - 640]], c);
    g.fillStyle = alpha('#ffd59a', 0.6); const r = rng(5); for (let yy = sb - 290; yy < sb - 10; yy += 22) for (let xx = sx - 150; xx < sx + 150; xx += 18) if (r() < 0.35) g.fillRect(xx, yy, 6, 9);
    circle(g, sx, sb - 645, 7, '#ff6a50'); glow(g, sx, sb - 645, 40, '#ff6a50', 0.7);
    FX.fog(g, GY - 260, 260, M.fog, 0.35);
  });
  layer(g, cam, 0.5, (g) => {                        // back wall with the big glass front
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(wall, -0.5), wall]);
    g.fillRect(-E.W * 1.5, -E.H, E.W * 4, winT + E.H); g.fillRect(winR, winT - 2, E.W * 3, winB - winT + 4); g.fillRect(-E.W * 1.5, winB - 2, E.W * 4, GY - winB + 4); g.fillRect(-E.W * 1.5, winT - 2, winL + E.W * 1.5, winB - winT + 4);
    g.fillStyle = 'rgba(160,190,255,.06)'; g.fillRect(winL, winT, winR - winL, winB - winT);
    g.fillStyle = shade(wall, -0.55); for (let x = winL; x <= winR; x += 300) g.fillRect(x - 7, winT, 14, winB - winT); g.fillRect(winL, winT + 170, winR - winL, 10);
    g.strokeStyle = shade(wall, -0.55); g.lineWidth = 14; g.strokeRect(winL, winT, winR - winL, winB - winT);
    for (let x = winL + 150; x < winR; x += 300) FX.godRays(g, x, winT + 40, { count: 3, angle: Math.PI / 2 + 0.35, spread: 0.25, len: 900, color: M.key, a: 0.035, t });
    // brand sign on the solid wall
    const sgx = CX + 700, sgy = GY - 610;
    text(g, o.sign || 'АВТОСАЛОН', sgx, sgy, { size: 60, color: o.repaint ? '#ffd59a' : '#cfe6ff', glow: 26, glowColor: alpha(o.repaint ? '#ffb070' : '#7fc8ff', 0.9), spacing: 8 });
    if (o.repaint) { g.fillStyle = '#c0395a'; g.fillRect(winR + 14, GY - 120, E.W * 3, 22); }
    else { g.fillStyle = '#3a6ea5'; g.fillRect(winR + 14, GY - 120, E.W * 3, 22); }
    // cash desk with the clock above it
    const kx = CX + 760;
    FX.clock(g, kx, GY - 420, 62, o.clock ?? 10 * 3600 + 7 * 60 + t, { face: '#eef0f6', ink: '#14121c' }); glow(g, kx, GY - 420, 150, '#e8f0ff', 0.12);
    rr(g, kx - 90, GY - 330, 180, 48, 8); g.fillStyle = shade(wall, -0.55); g.fill(); text(g, 'КАССА', kx, GY - 305, { size: 30, font: FONTS.ui, weight: 900, color: '#9fd8ff', glow: 10, glowColor: 'rgba(120,200,255,.8)', spacing: 3 });
    FX.counter(g, { x: kx - 260, y: GY, w: 520, h: 130, color: shade(wall, -0.45), top: shade(wall, 0.15), doors: 5 });
    FX.screen(g, { x: kx - 70, y: GY - 205, w: 110, h: 64, glowC: '#9fd8ff', a: 0.15 });
    calendar(g, CX + 1180, GY - 430, 1, o.year ?? 2024, M);
    plant(g, CX + 1400, GY, 1.2);
  });
  layer(g, cam, 0.85, (g) => {                       // glossy floor + reflections
    WIDE(g, linGrad(g, 0, GY - 40, 0, GY + 500, [shade(M.floor, 0.12), shade(M.dark, -0.1)]), GY - 40, E.H * 2);
    g.save(); g.globalCompositeOperation = 'lighter'; for (let x = winL + 150; x < winR; x += 300) { g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 260, [alpha('#9fb8ff', 0.1), alpha('#9fb8ff', 0)]); g.fillRect(x - 110, GY - 40, 220, 300); } g.restore();
    FX.floorLines(g, GY - 40, GY + 500, 'rgba(0,0,0,.18)', 0.09);
    ceilingLights(g, V(40, 80), M, [CX - 1100, CX - 500, CX + 100, CX + 700, CX + 1300]);
    // the car on its display platform
    const carX = CX - 470;
    g.fillStyle = shade(M.floor, 0.25); g.beginPath(); g.ellipse(carX, GY - 24, 400, 46, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(M.floor, -0.2); g.fillRect(carX - 400, GY - 24, 800, 16);
    FX.pool(g, carX, GY - 30, 420, 60, '#cfe0ff', 0.18);
    car(g, carX, GY - 30, 1, o.carColor || '#8e96a3', 1);
    if (o.price) priceStand(g, carX - 430, GY - 10, 1, o.price, M);
  });
  return { GY, CX, M, carX: CX - 470, deskX: CX + 760 };
}

// ---------- 2. Coffee shop across the street ----------
export function cafe(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = GROUND(), CX = E.W / 2;
  const wl = CX - 950, wr = CX + 250, wt = GY - 680, wb = GY - 250;
  layer(g, cam, 0.2, (g) => {                       // the street outside + the showroom across it
    backdrop(g, ['#232a50', '#5a4a78', '#c08a8a']);
    FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, minH: 100, maxH: 300, color: '#2a2440', windowColor: alpha('#ffd59a', 0.6), lit: 0.3, seed: 31 });
    g.fillStyle = '#1d1a2c'; g.fillRect(CX - 1100, GY - 520, 1500, 290);
    g.fillStyle = alpha('#9fd0ff', 0.55); for (let x = CX - 1060; x < CX + 380; x += 180) g.fillRect(x, GY - 440, 150, 190);
    glow(g, CX - 350, GY - 340, 600, '#9fd0ff', 0.12);
    text(g, 'АВТОСАЛОН', CX - 350, GY - 480, { size: 54, color: '#cfe6ff', glow: 20, glowColor: 'rgba(120,200,255,.9)', spacing: 6 });
    car(g, CX - 520, GY - 255, 0.32, '#8e96a3', 1);
    g.fillStyle = '#16141f'; g.fillRect(-E.W, GY - 232, E.W * 3, 40);
    for (let x = -E.W; x < E.W * 2; x += 420) FX.lampPost(g, x + 120, GY - 232, 200, { light: '#ffd59a', a: 0.12 });
  });
  layer(g, cam, 0.5, (g) => {                       // warm interior wall with the big window
    const wall = M.wall, wd = shade(wall, -0.4);
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(wall, -0.45), wall]);
    g.fillRect(-E.W * 1.5, -E.H, E.W * 4, wt + E.H); g.fillRect(-E.W * 1.5, wb, E.W * 4, GY - wb + 4); g.fillRect(-E.W * 1.5, wt - 2, wl + E.W * 1.5, wb - wt + 4); g.fillRect(wr, wt - 2, E.W * 3, wb - wt + 4);
    g.fillStyle = wd; g.fillRect(wl, wt, 16, wb - wt); g.fillRect(wr - 16, wt, 16, wb - wt); g.fillRect((wl + wr) / 2 - 8, wt, 16, wb - wt); g.fillRect(wl, wt, wr - wl, 16); g.fillRect(wl - 30, wb, wr - wl + 60, 22);
    text(g, 'КОФЕЙНЯ', (wl + wr) / 2, wt + 70, { size: 34, color: alpha('#ffe7c0', 0.22), spacing: 10 });
    // counter + espresso machine + menu
    const cx = CX + 760;
    rr(g, cx - 210, GY - 600, 420, 190, 12); g.fillStyle = '#1c1416'; g.fill();
    text(g, 'МЕНЮ', cx, GY - 565, { size: 26, font: FONTS.ui, weight: 900, color: '#ffe7c0', spacing: 4 });
    text(g, 'КАПУЧИНО ....... 350', cx, GY - 515, { size: 24, font: FONTS.ui, weight: 900, color: '#f4efe6' });
    text(g, 'ЛАТТЕ ............. 380', cx, GY - 478, { size: 24, font: FONTS.ui, weight: 900, color: alpha('#f4efe6', 0.6) });
    text(g, 'КРУАССАН ....... 220', cx, GY - 441, { size: 24, font: FONTS.ui, weight: 900, color: alpha('#f4efe6', 0.6) });
    FX.counter(g, { x: cx - 330, y: GY, w: 660, h: 150, color: shade(wall, -0.5), top: '#6a4a3a', doors: 6 });
    rr(g, cx - 120, GY - 260, 160, 110, 10); g.fillStyle = '#b8b4bc'; g.fill(); rr(g, cx - 100, GY - 240, 120, 30, 6); g.fillStyle = '#2a2630'; g.fill();
    for (const x of [cx + 140, cx + 200]) { rr(g, x - 20, GY - 210, 40, 60, 6); g.fillStyle = '#f2ece4'; g.fill(); }
    for (const x of [CX - 600, CX - 100, cx]) { seg(g, [[x, -100], [x, GY - 760]], 3, '#120c10'); g.fillStyle = '#2a1e1a'; g.beginPath(); g.moveTo(x - 50, GY - 700); g.lineTo(x + 50, GY - 700); g.lineTo(x + 20, GY - 760); g.lineTo(x - 20, GY - 760); g.fill(); circle(g, x, GY - 696, 14, '#fff3d6'); glow(g, x, GY - 690, 220, M.practical, 0.55); FX.lightCone(g, x, GY - 696, { angle: Math.PI / 2, spread: 0.9, len: 650, color: M.practical, a: 0.07 }); }
  });
  layer(g, cam, 0.85, (g) => {
    WIDE(g, linGrad(g, 0, GY - 40, 0, GY + 500, [shade(M.floor, 0.1), M.dark]), GY - 40, E.H * 2);
    FX.floorLines(g, GY - 40, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    FX.pool(g, CX - 100, GY, 520, 70, M.practical, 0.2);
  });
  return { GY, CX, M };
}
export function cafeTable(g, x, GY, o = {}) {
  const top = GY - 140, c = '#1a1214';
  seg(g, [[x, top], [x, GY - 6]], 10, c); seg(g, [[x - 50, GY - 4], [x + 50, GY - 4]], 8, c);
  rr(g, x - 140, top - 14, 280, 16, 8); g.fillStyle = '#3a2a24'; g.fill(); g.fillStyle = 'rgba(255,210,150,.4)'; g.fillRect(x - 134, top - 14, 268, 3);
  return { top: top - 14 };
}
export function cupProp(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e8e2d8'; g.beginPath(); g.ellipse(0, 0, 26, 6, 0, 0, Math.PI * 2); g.fill();
  rr(g, -15, -32, 30, 32, 6); g.fillStyle = '#f4efe6'; g.fill(); seg(g, [[15, -26], [23, -20], [15, -12]], 4, '#f4efe6');
  g.fillStyle = '#c89a6a'; g.beginPath(); g.ellipse(0, -32, 14, 4, 0, 0, Math.PI * 2); g.fill();
  if (o.steam) for (let i = 0; i < 3; i++) { const k = ((o.t || 0) * 0.5 + i / 3) % 1; seg(g, [[-6 + i * 6, -40 - k * 40], [-2 + i * 6 + Math.sin(k * 6) * 4, -56 - k * 40]], 3, alpha('#ffffff', 0.25 * (1 - k))); }
  g.restore();
}
export function chairSide(g, x, GY, s, f, color = '#20161a') { g.save(); g.translate(x, 0); g.scale(f, 1); FX.chair(g, -18 * s, GY, s, color); g.restore(); }

// ---------- 3. Max's apartment doorway, night ----------
export function doorway(g, t, cam, o = {}) {
  const M = mood('night'), GY = GROUND(), CX = E.W / 2, dx = CX + (o.doorX ?? 0), dw = 320, dh = 600;
  layer(g, cam, 0.5, (g) => {
    // landing beyond the door (lit, green-painted stairwell)
    g.fillStyle = '#2e4a3e'; g.fillRect(dx - 400, GY - 900, 800, 900); g.fillStyle = '#8a8a78'; g.fillRect(dx - 400, GY - 900, 800, 480);
    seg(g, [[dx - 400, GY - 420], [dx + 400, GY - 420]], 6, '#1e3028');
    circle(g, dx + 40, GY - 690, 16, '#fff3d0'); glow(g, dx + 40, GY - 680, 380, '#ffd59a', 0.7);
    FX.lightCone(g, dx + 40, GY - 690, { angle: Math.PI / 2, spread: 1.2, len: 900, color: '#ffd59a', a: 0.18 });
    for (let i = 0; i < 4; i++) { g.fillStyle = '#4a4438'; g.fillRect(dx + 120 + i * 24, GY - 150 - i * 34, 200, 12); }
    // dark apartment wall around the door
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#0e1020', '#232744']);
    g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY - dh + E.H); g.fillRect(-E.W * 1.5, GY - dh - 2, dx - dw / 2 + E.W * 1.5, dh + 4); g.fillRect(dx + dw / 2, GY - dh - 2, E.W * 3, dh + 4);
    g.strokeStyle = '#3a3044'; g.lineWidth = 22; g.strokeRect(dx - dw / 2, GY - dh, dw, dh);
    // open door leaf (inside)
    poly(g, [[dx - dw / 2, GY - dh], [dx - dw / 2 - 150, GY - dh - 50], [dx - dw / 2 - 150, GY + 40], [dx - dw / 2, GY]], '#3b2c26'); circle(g, dx - dw / 2 - 128, GY - dh / 2, 8, '#c8b48a');
    // coat hooks + mirror in the hallway
    for (const hx of [CX - 680, CX - 610]) { seg(g, [[hx, GY - 520], [hx, GY - 380]], 26, '#1a1620'); }
    rr(g, CX + 380, GY - 560, 150, 260, 70); g.fillStyle = '#1a2036'; g.fill(); g.strokeStyle = '#3a3044'; g.lineWidth = 8; g.stroke();
    g.fillStyle = 'rgba(200,220,255,.12)'; g.fillRect(CX + 410, GY - 520, 20, 180);
  });
  layer(g, cam, 0.85, (g) => {
    WIDE(g, linGrad(g, 0, GY - 10, 0, GY + 400, ['#2a2230', '#0c0a12']), GY - 10, E.H * 2);
    FX.pool(g, dx, GY + 20, 360, 70, '#ffd59a', 0.35);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [alpha('#ffd59a', 0.18), alpha('#ffd59a', 0)]); g.beginPath(); g.moveTo(dx - dw / 2, GY); g.lineTo(dx + dw / 2, GY); g.lineTo(dx + dw * 0.9, GY + 300); g.lineTo(dx - dw * 0.9, GY + 300); g.fill(); g.restore();
  });
  return { GY, CX, M, doorX: dx };
}

// ---------- 4. Park bench at dusk (eye-drops scene) ----------
export function park(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX + 520, GY - 330, 60, '#fff3dc', M.key, 4.5); FX.clouds(g, { y: GY - 700, h: 200, color: '#ffe0c0', a: 0.14, seed: 4 }); });
  layer(g, cam, 0.3, (g) => { FX.skyline(g, { x: -E.W, y: GY - 200, w: E.W * 3, minH: 60, maxH: 260, color: mix(M.sky[1], M.dark, 0.7), windowColor: alpha(M.practical, 0.6), lit: 0.18, seed: 41 }); });
  layer(g, cam, 0.5, (g) => {
    FX.hills(g, { y: GY - 120, amp: 40, color: shade(M.grass, -0.45), seed: 3 });
    const tc = shade(M.dark, -0.1); for (const x of [-500, -150, 260, 1500, 1900, 2300]) FX.tree(g, x, GY - 70, 1.7, tc);
    // pharmacy kiosk with a green cross
    const px = CX - 900; g.fillStyle = '#1c1a26'; g.fillRect(px - 150, GY - 330, 300, 260); g.fillStyle = alpha('#bfffd8', 0.5); g.fillRect(px - 120, GY - 260, 240, 140);
    g.fillStyle = '#3fe08a'; g.fillRect(px - 14, GY - 420, 28, 76); g.fillRect(px - 38, GY - 396, 76, 28); glow(g, px, GY - 382, 160, '#3fe08a', 0.6);
    text(g, 'АПТЕКА', px, GY - 300, { size: 32, color: '#c8ffe0', glow: 14, glowColor: 'rgba(60,224,138,.9)', spacing: 4 });
  });
  layer(g, cam, 0.85, (g) => {
    WIDE(g, linGrad(g, 0, GY - 60, 0, GY + 400, [shade(M.grass, -0.35), shade(M.dark, -0.2)]), GY - 60, E.H * 2);
    g.fillStyle = shade(M.road, 0.1); g.fillRect(-E.W, GY - 14, E.W * 3, 70);
    for (const x of [CX - 520, CX + 640]) FX.lampPost(g, x, GY - 20, 380, { light: M.practical, a: 0.16 });
    FX.pool(g, CX, GY + 10, 500, 60, M.key, 0.18);
  });
  return { GY, CX, M };
}
export function bench(g, x, GY, s = 1, c = '#1e1620') {
  g.save(); g.translate(x, GY); g.scale(s, s);
  for (const dx of [-170, 170]) seg(g, [[dx, 0], [dx, -70]], 10, c);
  rr(g, -210, -84, 420, 18, 6); g.fillStyle = '#5a3a2a'; g.fill(); rr(g, -210, -66, 420, 10, 4); g.fill();
  for (const yy of [-150, -122]) { rr(g, -210, yy, 420, 18, 6); g.fillStyle = '#5a3a2a'; g.fill(); }
  for (const dx of [-170, 170]) seg(g, [[dx - 6, -80], [dx - 14, -156]], 8, c);
  g.fillStyle = 'rgba(255,200,140,.25)'; g.fillRect(-206, -150, 412, 3);
  g.restore();
}

// ---------- 5. Egor's living room (Saturday, golden) ----------
export function home(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.wall, -0.4), M.wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    const wx = CX - 760, wy = GY - 680, ww = 620, wh = 470;
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(M.wall, -0.55), bar: 12 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#f7cf98', '#e8956b', '#8a5a86']); g.fillRect(x, y, w, h);
      FX.sun(g, x + w * 0.35, y + h * 0.45, 48, '#fff7e6', '#ffcf8f', 4);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: alpha('#5a3a4a', 0.85), windowColor: alpha('#ffd59a', 0.5), seed: 51 });
    });
    FX.godRays(g, wx + ww * 0.4, wy + wh * 0.5, { count: 6, angle: 0.75, spread: 0.6, len: 1500, color: '#ffd9a0', a: 0.07, t });
    // framed wedding photo + shelf
    rr(g, CX + 300, GY - 640, 200, 150, 6); g.fillStyle = '#e8d8b8'; g.fill(); g.fillStyle = '#f2c9a0'; g.fillRect(CX + 314, GY - 626, 172, 122);
    circle(g, CX + 370, GY - 570, 16, '#14101a'); circle(g, CX + 430, GY - 572, 16, '#14101a'); g.fillStyle = '#3fb950'; g.fillRect(CX + 352, GY - 595, 36, 10); g.fillStyle = '#fff'; poly(g, [[CX + 415, GY - 555], [CX + 445, GY - 555], [CX + 455, GY - 505], [CX + 405, GY - 505]], '#ffffff');
    seg(g, [[CX + 600, GY - 520], [CX + 900, GY - 520]], 10, '#2a1c1a'); for (let i = 0; i < 6; i++) { g.fillStyle = ['#c0392b', '#3a6ea5', '#f2c21a', '#5fd39a'][i % 4]; g.fillRect(CX + 610 + i * 26, GY - 580, 18, 56); }
    // sofa
    rr(g, CX + 320, GY - 250, 640, 210, 40); g.fillStyle = '#5a3a5a'; g.fill(); rr(g, CX + 300, GY - 150, 680, 120, 30); g.fillStyle = '#6a4468'; g.fill();
  });
  layer(g, cam, 0.85, (g) => {
    WIDE(g, linGrad(g, 0, GY - 40, 0, GY + 400, [shade(M.floor, 0.12), M.dark]), GY - 40, E.H * 2);
    FX.floorLines(g, GY - 40, GY + 400, 'rgba(0,0,0,.22)', 0.08);
    g.fillStyle = '#7a3a3a'; g.beginPath(); g.ellipse(CX - 60, GY + 10, 560, 70, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#d8a060'; g.lineWidth = 6; g.beginPath(); g.ellipse(CX - 60, GY + 10, 500, 56, 0, 0, Math.PI * 2); g.stroke();
    FX.pool(g, CX - 200, GY, 500, 80, '#ffcf8f', 0.25);
    for (const [bx, c] of [[CX - 420, '#f2c21a'], [CX - 380, '#3a6ea5'], [CX - 400, '#c0392b']]) { rr(g, bx - 18, GY - 30 - (c === '#c0392b' ? 36 : 0), 36, 36, 4); g.fillStyle = c; g.fill(); }
  });
  return { GY, CX, M };
}

// ---------- 6. Wedding hall ----------
export function wedding(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => {
    backdrop(g, ['#2a1a2e', '#4a2a3a', '#6a3a3a']);
    for (const x of [-700, -100, 500, 1100, 1700, 2300]) FX.windowFrame(g, { x: x, y: GY - 700, w: 300, h: 520, cols: 2, rows: 3, frame: '#2a1820', bar: 8, arch: true }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#3d3360', '#e8956b']); g.fillRect(x, y, w, h); });
  });
  layer(g, cam, 0.6, (g) => {
    for (let k = 0; k < 3; k++) { const y0 = GY - 760 + k * 50; g.strokeStyle = 'rgba(40,24,30,.9)'; g.lineWidth = 2; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, y0 + Math.sin(x / 140 + k) * 26); g.stroke(); for (let x = -E.W + (k * 37) % 70; x <= E.W * 2; x += 70) { const y = y0 + Math.sin(x / 140 + k) * 26 + 8; circle(g, x, y, 6, '#ffe7b0'); glow(g, x, y, 30, '#ffcf8a', 0.5 + 0.2 * Math.sin(t * 3 + x)); } }
    // flower arch
    g.strokeStyle = '#e8d8c8'; g.lineWidth = 16; g.beginPath(); g.arc(CX, GY - 300, 300, Math.PI, 0); g.stroke(); g.fillRect(CX - 308, GY - 300, 16, 300); g.fillRect(CX + 292, GY - 300, 16, 300);
    const r = rng(9); for (let i = 0; i < 40; i++) { const a = Math.PI + r() * Math.PI; circle(g, CX + Math.cos(a) * 300, GY - 300 + Math.sin(a) * 300, 12 + r() * 10, ['#f29ac0', '#ffffff', '#f7cf98'][i % 3]); }
  });
  layer(g, cam, 0.85, (g) => {
    WIDE(g, linGrad(g, 0, GY - 30, 0, GY + 400, ['#5a3a34', '#2a1814']), GY - 30, E.H * 2);
    FX.floorLines(g, GY - 30, GY + 400, 'rgba(0,0,0,.25)', 0.08);
    FX.pool(g, CX, GY, 600, 80, '#ffcf8a', 0.28);
  });
  return { GY, CX, M };
}

// ---------- 7. Dark stairwell (Max is afraid of dark entrances) ----------
export function stairwell(g, t, cam, o = {}) {
  const M = mood('night'), GY = GROUND(), CX = E.W / 2;
  const flick = (Math.sin(t * 37) > 0.6 || Math.sin(t * 5.3) > 0.85) ? 0.15 : 1;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#1a2a24'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2); g.fillStyle = '#2a2a30'; g.fillRect(-E.W, -E.H, E.W * 3, GY - 420 + E.H);
    for (let i = 0; i < 10; i++) { g.fillStyle = '#121a18'; g.fillRect(CX + 200 + i * 60, GY - 60 - i * 42, 400, 14); }
    for (let i = 0; i < 6; i++) { rr(g, CX - 760 + i * 70, GY - 420, 60, 80, 4); g.fillStyle = '#2a3a44'; g.fill(); }
    circle(g, CX - 100, GY - 720, 14, flick > 0.5 ? '#fff3d0' : '#4a4430'); glow(g, CX - 100, GY - 710, 420, '#ffd59a', 0.45 * flick);
    FX.lightCone(g, CX - 100, GY - 720, { angle: Math.PI / 2, spread: 1.0, len: 900, color: '#ffd59a', a: 0.12 * flick });
  });
  layer(g, cam, 0.85, (g) => { WIDE(g, linGrad(g, 0, GY - 20, 0, GY + 400, ['#1a1a22', '#06060a']), GY - 20, E.H * 2); FX.pool(g, CX - 100, GY, 300, 50, '#ffd59a', 0.3 * flick); });
  return { GY, CX, M, flick };
}

// ---------- 8. Seaside promenade (only in the phone gallery) ----------
export function sea(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, ['#4a3a6a', '#e8956b', '#f9d49c']); FX.sun(g, CX + 200, GY - 330, 70, '#fff3dc', '#ffcf8f', 4); });
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, GY - 280, 0, GY, ['#3a6a8a', '#1a3a5a']); g.fillRect(-E.W, GY - 280, E.W * 3, 280); for (let i = 0; i < 12; i++) FX.lensStreak(g, CX + 200 + Math.sin(i) * 80, GY - 260 + i * 20, 300 - i * 15, '#ffd59a', 0.5, 4); });
  layer(g, cam, 0.85, (g) => { WIDE(g, '#4a3a3a', GY - 20, E.H * 2); seg(g, [[-E.W, GY - 120], [E.W * 2, GY - 120]], 8, '#1a1418'); for (let x = -E.W; x < E.W * 2; x += 90) seg(g, [[x, GY - 120], [x, GY - 20]], 6, '#1a1418'); });
  return { GY, CX, M };
}

// ---------- 9. Dark studio void with a light pool (symbolic shots) ----------
export function studio(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = GROUND(), CX = E.W / 2, c = o.color || M.wall;
  layer(g, cam, 0.4, (g) => { backdrop(g, [shade(c, -0.7), shade(c, -0.3), shade(c, -0.55)]); glow(g, CX, GY - 300, 700, o.light || M.key, 0.12); });
  layer(g, cam, 0.85, (g) => { WIDE(g, linGrad(g, 0, GY - 10, 0, GY + 300, [shade(c, -0.4), shade(c, -0.8)]), GY - 10, E.H * 2); FX.pool(g, CX, GY + 10, 420, 70, o.light || M.key, 0.3); FX.lightCone(g, CX, -100, { angle: Math.PI / 2, spread: 0.5, len: 1100, color: o.light || M.key, a: 0.1 }); });
  return { GY, CX, M };
}

export const SETS = { showroom, cafe, doorway, park, home, wedding, stairwell, sea, studio };
