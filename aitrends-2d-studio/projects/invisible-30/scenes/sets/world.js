// sets/world.js — все локации ролика. Каждая: fn(g, t, cam, o) -> { GY, CX, M }.
// Стены/пол/небо выходят далеко за кадр, чтобы движения камеры не открывали края.
import { E, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { drawItem, sign } from './items.js';

export const GYF = 0.8;
const GYv = () => E.H * GYF, CXv = () => E.W / 2;

// ---------- shared pieces ----------
function sky(g, x, y, w, h, kind, M, t) {
  const SK = { day: ['#7fa6d6', '#c6d8ea', '#eadfce'], night: ['#070b20', '#141c44', '#2a2a5c'], golden: ['#5e5288', '#e2906a', '#f6cf98'], morning: ['#9fb8dc', '#dfe6ee', '#f6e2c8'], dusk: ['#2e2a58', '#7a4e7e', '#e08a68'] };
  const c = SK[kind] || M.sky; g.fillStyle = linGrad(g, 0, y, 0, y + h, c); g.fillRect(x, y, w, h);
  if (kind === 'night') { FX.stars(g, t, { area: [x, y, w, h * 0.6], count: 40, seed: 7 }); FX.moon(g, x + w * 0.75, y + h * 0.25, 18); }
  if (kind === 'golden' || kind === 'dusk') glow(g, x + w * 0.3, y + h * 0.75, w * 0.5, '#ffb070', 0.5);
  if (kind === 'morning' || kind === 'day') glow(g, x + w * 0.7, y + h * 0.3, w * 0.4, '#fff4dc', 0.5);
  const city = kind === 'night' ? '#0c0f24' : kind === 'golden' || kind === 'dusk' ? '#3a2840' : '#7d8aa6';
  FX.skyline(g, { x: x - 40, y: y + h * 0.72, w: w + 80, minH: h * 0.12, maxH: h * 0.4, color: city, windowColor: alpha('#ffcf8a', kind === 'night' ? 0.8 : 0.25), lit: kind === 'night' ? 0.35 : 0.08, seed: 21 });
}
export function win(g, x, y, w, h, kind, M, t, o = {}) {
  FX.windowFrame(g, { x, y, w, h, cols: o.cols || 2, rows: o.rows || 2, frame: o.frame || shade(M.wall, -0.55), bar: 8, blinds: o.blinds || 0 }, (g, x, y, w, h) => sky(g, x, y, w, h, kind, M, t));
  glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, kind === 'night' ? M.key : M.practical, kind === 'night' ? 0.08 : 0.16);
}
function wall(g, M, top, k = -0.3) { const w = shade(M.wall, k); g.fillStyle = linGrad(g, 0, top, 0, GYv(), [shade(w, 0.05), w, shade(w, -0.25)]); g.fillRect(-E.W, top - E.H * 2, E.W * 3, GYv() - top + E.H * 2 + 2); }
function floor(g, M, o = {}) { const GY = GYv(); g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(o.color || M.floor, -0.05), shade(M.dark, -0.25)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.22)', 0.07); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-E.W, GY - 3, E.W * 3, 6); }
function lamp(g, x, y, M, a = 0.5) { seg(g, [[x, y - 400], [x, y - 40]], 3, shade(M.dark, -0.3)); poly(g, [[x - 50, y], [x + 50, y], [x + 26, y - 50], [x - 26, y - 50]], shade(M.practical, -0.35)); glow(g, x, y + 10, 220, M.practical, a); FX.lightCone(g, x, y, { angle: Math.PI / 2, spread: 0.9, len: 600, color: M.practical, a: 0.12 }); }
function room(g, t, cam, M, o, back, mid) {
  const GY = GYv();
  layer(g, cam, 0.5, g => { backdrop(g, [shade(M.wall, -0.5), shade(M.wall, -0.35)]); wall(g, M, GY - 900, o.wallK ?? -0.3); back?.(g, GY); });
  layer(g, cam, 0.85, g => { floor(g, M, o); mid?.(g, GY); });
  return { GY, CX: CXv(), M };
}

// ---------- locations ----------
export const SETS = {
  // ванная: зеркало, раковина, плитка. Утренний холодный свет из маленького окна.
  bathroom(g, t, cam, o = {}) {
    const M = mood(o.mood || 'interiorCool'), CX = CXv();
    return room(g, t, cam, M, { color: '#2a3550' }, (g, GY) => {
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2; for (let x = -E.W; x < E.W * 2; x += 64) { g.beginPath(); g.moveTo(x, GY - 900); g.lineTo(x, GY); g.stroke(); } for (let y = GY; y > GY - 900; y -= 64) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
      win(g, CX - 760, GY - 760, 200, 200, 'morning', M, t, { cols: 1, rows: 1 });
      FX.godRays(g, CX - 660, GY - 660, { angle: 0.6, spread: 0.5, len: 1400, color: '#dfe8ff', a: 0.06, t });
      // зеркало
      const mx = CX + (o.mirrorX ?? 140), my = GY - 820, mw = 360, mh = 400;
      rr(g, mx - 14, my - 14, mw + 28, mh + 28, 18); g.fillStyle = shade(M.wall, -0.6); g.fill();
      g.fillStyle = linGrad(g, mx, my, mx + mw, my + mh, ['#6c7fa6', '#3c4a6c', '#55678e']); g.fillRect(mx, my, mw, mh);
      g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.clip(); g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(mx + 40, my); g.lineTo(mx + 120, my); g.lineTo(mx + 10, my + mh); g.lineTo(mx - 70, my + mh); g.fill();
      if (o.brush) { const yy = my + mh * 0.62 + Math.sin(t * 14) * 18; g.save(); g.translate(mx + mw * 0.45, yy); g.rotate(-1.35); drawItem(g, 'toothbrush', 0, 0, 0.9, t); g.restore(); }
      if (o.reflectA) { g.save(); g.translate(mx + mw * 0.5, my + mh * 0.95); g.scale(-1, 1); circle(g, 0, -250, 70, '#0e0b12'); g.fillStyle = '#f08a24'; g.beginPath(); g.ellipse(0, -40, 120, 150, 0, Math.PI, Math.PI * 2); g.fill(); circle(g, -22, -262, 9, '#f4efe6'); circle(g, 22, -262, 9, '#f4efe6'); g.strokeStyle = '#f4efe6'; g.lineWidth = 6; g.beginPath(); g.arc(0, -238, 20, 0.4, Math.PI - 0.4); g.stroke(); g.fillStyle = 'rgba(255,120,120,.35)'; g.fillRect(18, -236, 34, 8); g.restore(); }
      g.restore();
      glow(g, mx + mw / 2, my - 40, 200, '#e8f0ff', 0.35); rr(g, mx + mw / 2 - 90, my - 50, 180, 16, 8); g.fillStyle = '#e8f0ff'; g.fill();
      // раковина
      const sx = mx + mw / 2; rr(g, sx - 170, GY - 330, 340, 60, 20); g.fillStyle = '#d8dde8'; g.fill(); g.fillStyle = shade(M.wall, -0.5); g.fillRect(sx - 30, GY - 270, 60, 270);
      seg(g, [[sx, GY - 330], [sx, GY - 372], [sx + 40, GY - 372]], 10, '#aab4c8');
      if (o.cup !== false) { rr(g, sx + 110, GY - 380, 36, 50, 6); g.fillStyle = '#7fb0c8'; g.fill(); }
    });
  },
  // прихожая: входная дверь, вешалка с куртками, тумбочка для обуви
  hallway(g, t, cam, o = {}) {
    const M = mood(o.mood || 'interiorWarm'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      lamp(g, CX - 100, GY - 720, M, 0.4);
      FX.door(g, { x: CX + (o.doorX ?? 320), y: GY, w: 190, h: 470, color: shade(M.wall, -0.45), open: o.open ?? 0, light: '#cfd8f0' });
      circle(g, CX + (o.doorX ?? 320) + 160, GY - 230, 7, '#d8c8a0');
      // вешалка
      const hx = CX + (o.rackX ?? -420); seg(g, [[hx - 150, GY - 520], [hx + 150, GY - 520]], 14, shade(M.wall, -0.6));
      const fallen = o.coats === 'floor'; const cols = ['#7a5040', '#3e5a70', '#5a5068', '#80683a'];
      cols.forEach((c, i) => { const x = hx - 110 + i * 72; circle(g, x, GY - 512, 6, '#c8b890');
        if (!fallen) { g.fillStyle = shade(c, -0.25); g.beginPath(); g.moveTo(x - 30, GY - 500); g.lineTo(x + 30, GY - 500); g.lineTo(x + 38, GY - 300); g.lineTo(x - 38, GY - 300); g.closePath(); g.fill(); } });
      // тумбочка
      const bx = CX + (o.benchX ?? -40); g.fillStyle = shade(M.wall, -0.55); g.fillRect(bx - 110, GY - 120, 220, 120); g.fillStyle = shade(M.wall, -0.4); g.fillRect(bx - 116, GY - 128, 232, 12);
      FX.pool(g, CX - 100, GY + 20, 300, 40, M.practical, 0.2);
    }, (g, GY) => { if (o.coats === 'floor') { const cols = ['#7a5040', '#3e5a70', '#5a5068', '#80683a']; cols.forEach((c, i) => { g.save(); g.translate(CX + (o.rackX ?? -420) - 60 + i * 60, GY - 10); g.rotate(-0.3 + i * 0.25); g.fillStyle = shade(c, -0.25); g.fillRect(-50, -18, 100, 28); g.restore(); }); } });
  },
  // комната/спальня: кровать, окно (ночь или день)
  bedroom(g, t, cam, o = {}) {
    const night = o.night !== false, M = mood(night ? 'night' : 'interiorWarm'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      win(g, CX - 260, GY - 760, 420, 460, night ? 'night' : 'day', M, t);
      FX.godRays(g, CX - 50, GY - 540, { angle: 1.9, spread: 0.6, len: 900, color: M.key, a: 0.05, t });
      FX.bed(g, { x: CX + (o.bedX ?? 120), y: GY, w: 520, color: night ? '#3a4a80' : '#8a5a5a', frame: shade(M.wall, -0.6), pillow: '#d8d8ec' });
      if (o.lamp !== false) { const lx = CX + 720; rr(g, lx - 40, GY - 150, 80, 150, 6); g.fillStyle = shade(M.wall, -0.6); g.fill(); poly(g, [[lx - 40, GY - 210], [lx + 40, GY - 210], [lx + 26, GY - 260], [lx - 26, GY - 260]], '#ffd59a'); glow(g, lx, GY - 230, 260, M.practical, 0.5); }
    });
  },
  // кухня Артёма: окно, столешница с чайником, стол
  kitchen(g, t, cam, o = {}) {
    const M = mood(o.mood || 'interiorWarm'), CX = CXv(), kind = o.sky || 'day';
    return room(g, t, cam, M, {}, (g, GY) => {
      win(g, CX - 300, GY - 780, 440, 400, kind, M, t, { blinds: 0 });
      FX.godRays(g, CX - 80, GY - 580, { angle: 1.7, spread: 0.7, len: 1000, color: M.key, a: 0.06, t });
      FX.counter(g, { x: CX + 260, y: GY, w: 700, h: 330, color: shade(M.wall, -0.55), top: shade(M.wall, -0.2), doors: 5 });
      g.fillStyle = shade(M.wall, -0.5); g.fillRect(CX + 300, GY - 820, 620, 200);
      if (!o.noKettle) drawItem(g, 'kettle', CX + 400, GY - 338, 1, t);
      lamp(g, CX - 560, GY - 640, M, 0.45);
    }, (g, GY) => { if (o.table !== false) { const tx = CX - 560; rr(g, tx - 220, GY - 300, 440, 22, 8); g.fillStyle = shade(M.wall, -0.65); g.fill(); seg(g, [[tx - 180, GY - 280], [tx - 180, GY]], 12, shade(M.wall, -0.65)); seg(g, [[tx + 180, GY - 280], [tx + 180, GY]], 12, shade(M.wall, -0.65)); } });
  },
  // поликлиника: холодный свет, стойка регистратуры, табличка
  clinic(g, t, cam, o = {}) {
    const M = mood('interiorCool'), CX = CXv();
    return room(g, t, cam, M, { wallK: -0.1 }, (g, GY) => {
      for (const x of [-500, 0, 500]) { rr(g, CX + x - 120, GY - 860, 240, 18, 6); g.fillStyle = '#e8f4ff'; g.fill(); glow(g, CX + x, GY - 840, 260, '#cfe6ff', 0.35); }
      FX.counter(g, { x: CX - 200, y: GY, w: 700, h: 220, color: '#3a4a68', top: '#7a8aa8', doors: 1 });
      g.fillStyle = 'rgba(160,210,255,.18)'; g.fillRect(CX - 200, GY - 520, 700, 290);
      sign(g, CX + 150, GY - 600, 420, 70, 'РЕГИСТРАТУРА', { bg: '#2a6a9a', fg: '#eaf6ff' });
      seg(g, [[CX - 900, GY - 30], [CX - 450, GY - 30]], 14, '#4a5a78'); for (let i = 0; i < 4; i++) rr(g, CX - 890 + i * 112, GY - 110, 96, 70, 10), g.fillStyle = '#4f6a96', g.fill();
    });
  },
  // улица: фасады, тротуар, переход, светофор, остановка
  street(g, t, cam, o = {}) {
    const M = mood(o.mood || 'day'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.15, g => { backdrop(g, M.sky); if (o.mood === 'golden' || o.mood === 'dusk') FX.sun(g, CX + 500, GY - 600, 50, '#fff3dc', M.key, 4); FX.clouds(g, { y: 120, h: 160, color: '#ffffff', a: 0.12, seed: 4 }); FX.skyline(g, { x: -E.W, y: GY - 420, w: E.W * 3, minH: 80, maxH: 340, color: mix(M.sky[1], M.dark, 0.6), windowColor: alpha(M.practical, 0.4), lit: 0.1, seed: 9 }); });
    layer(g, cam, 0.5, g => { const cols = [shade(M.wall, -0.2), shade(M.wall, -0.35), shade(M.wall, -0.1)]; for (let i = -4; i <= 4; i++) FX.facade(g, { x: CX + i * 470 - 230, y: GY - 120, w: 460, h: 640 + (i % 2) * 120, color: cols[(i + 9) % 3], win: M.practical, dark: shade(M.wall, -0.55), cols: 4, rows: 5, lit: o.mood === 'night' ? 0.5 : 0.15, seed: 30 + i }); });
    layer(g, cam, 0.85, g => {
      g.fillStyle = shade(M.road, -0.1); g.fillRect(-E.W, GY - 120, E.W * 3, 60); g.fillStyle = shade(M.floor, -0.15); g.fillRect(-E.W, GY - 60, E.W * 3, E.H * 2);
      g.fillStyle = shade(M.road, -0.3); g.fillRect(-E.W, GY + 40, E.W * 3, E.H * 2);
      if (o.zebra !== false) for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(240,240,240,.55)'; g.fillRect(CX + (o.zebraX ?? 300) + i * 60, GY + 60, 36, 200); }
      for (const x of [-700, 700]) FX.lampPost(g, CX + x, GY - 60, 380, { on: o.mood === 'night' || o.mood === 'dusk', light: M.practical });
      if (o.light !== false) { const lx = CX + (o.lightX ?? 240); seg(g, [[lx, GY - 40], [lx, GY - 380]], 10, '#1a1820'); rr(g, lx - 26, GY - 500, 52, 130, 10); g.fillStyle = '#1a1820'; g.fill(); const red = o.red ?? true; circle(g, lx, GY - 470, 16, red ? '#ff4a3a' : '#3a1a1a'); circle(g, lx, GY - 405, 16, red ? '#1a3a24' : '#3aff8a'); glow(g, lx, red ? GY - 470 : GY - 405, 90, red ? '#ff4a3a' : '#3aff8a', 0.6); }
      if (o.stop) { const sx = CX + (o.stopX ?? -500); g.fillStyle = 'rgba(170,210,240,.22)'; g.fillRect(sx - 220, GY - 420, 440, 360); seg(g, [[sx - 230, GY - 60], [sx - 230, GY - 440], [sx + 230, GY - 440], [sx + 230, GY - 60]], 10, '#22222c'); rr(g, sx - 240, GY - 470, 480, 40, 6); g.fillStyle = '#22222c'; g.fill(); sign(g, sx, GY - 450, 300, 34, 'ОСТАНОВКА', { bg: '#2a5a9a', fg: '#ffffff' }); g.fillStyle = '#3a3440'; g.fillRect(sx - 160, GY - 170, 320, 16); }
    });
    return { GY, CX, M };
  },
  // метро: вагон изнутри
  metro(g, t, cam, o = {}) {
    const M = mood('interiorCool'), CX = CXv();
    return room(g, t, cam, M, { wallK: 0.05, color: '#3a4258' }, (g, GY) => {
      for (let i = -3; i <= 3; i++) { const x = CX + i * 420 - 150; rr(g, x, GY - 640, 300, 220, 30); g.fillStyle = '#0a0c18'; g.fill(); for (let k = 0; k < 3; k++) { const lx = x + ((t * 900 + k * 260 + i * 77) % 420) - 60; if (lx > x && lx < x + 300) glow(g, lx, GY - 530, 40, '#ffd59a', 0.5); } }
      for (let i = -3; i <= 3; i++) rr(g, CX + i * 420 - 170, GY - 220, 340, 70, 16), g.fillStyle = '#4a6a9a', g.fill();
      seg(g, [[-E.W, GY - 760], [E.W * 2, GY - 760]], 8, '#c8d0e0'); for (let i = -12; i <= 12; i++) { const x = CX + i * 140 + Math.sin(t * 2 + i) * 4; seg(g, [[x, GY - 760], [x, GY - 690]], 3, '#c8d0e0'); ring(g, x, GY - 676, 14, 4, '#c8d0e0'); }
      for (const x of [-700, 0, 700]) { rr(g, CX + x - 200, GY - 900, 400, 20, 8); g.fillStyle = '#eef4ff'; g.fill(); glow(g, CX + x, GY - 880, 300, '#dfe8ff', 0.35); }
    });
  },
  // зоопарк: вольер, жираф, деревья
  zoo(g, t, cam, o = {}) {
    const M = mood('day'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.15, g => { backdrop(g, M.sky); FX.clouds(g, { y: 140, h: 160, color: '#ffffff', a: 0.25, seed: 2 }); FX.hills(g, { y: GY - 260, amp: 60, color: shade(M.grass, -0.2), seed: 3 }); });
    layer(g, cam, 0.6, g => { for (let i = -6; i <= 6; i++) FX.tree(g, CX + i * 280 + (i % 2) * 60, GY - 30, 1.6 + (i % 3) * 0.3, shade(M.grass, -0.45)); });
    layer(g, cam, 0.85, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.grass, -0.15), shade(M.grass, -0.5)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); drawItem(g, 'giraffe', CX + (o.giraffeX ?? 260), GY + 40, 0.85, t, { look: o.look ?? 0 });
      seg(g, [[-E.W, GY - 110], [E.W * 2, GY - 110]], 8, '#5a4a3a'); seg(g, [[-E.W, GY - 60], [E.W * 2, GY - 60]], 8, '#5a4a3a'); for (let x = -E.W; x < E.W * 2; x += 120) seg(g, [[x, GY - 130], [x, GY]], 10, '#4a3a2c'); });
    return { GY, CX, M };
  },
  // магазин: стеллажи с упаковками
  store(g, t, cam, o = {}) {
    const M = mood('interiorWarm'), CX = CXv();
    return room(g, t, cam, M, { wallK: -0.15 }, (g, GY) => {
      for (const x of [-500, 0, 500]) { rr(g, CX + x - 160, GY - 880, 320, 16, 6); g.fillStyle = '#fff4e0'; g.fill(); glow(g, CX + x, GY - 860, 260, M.practical, 0.3); }
      const r = rng(5), cols = ['#c84a3a', '#e0b040', '#4a8ac8', '#5aa860', '#d8d0c0', '#a85ac8'];
      for (let sx = -2; sx <= 2; sx++) { const x0 = CX + sx * 520 - 240; g.fillStyle = shade(M.wall, -0.55); g.fillRect(x0 - 10, GY - 700, 500, 700);
        for (let row = 0; row < 4; row++) { const y = GY - 160 - row * 150; g.fillStyle = shade(M.wall, -0.2); g.fillRect(x0, y, 480, 10); for (let k = 0; k < 7; k++) { rr(g, x0 + 10 + k * 66, y - 90 - r() * 20, 54, 90 + r() * 20, 4); g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fill(); } } }
    });
  },
  // день рождения Лёхи: стол, гирлянда, бокалы, окно ночь
  party(g, t, cam, o = {}) {
    const M = mood('interiorWarm'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      win(g, CX + 420, GY - 760, 380, 420, 'night', M, t);
      const cols = ['#ff6f61', '#ffd47e', '#7fd0d6', '#b48aff']; for (let i = 0; i < 22; i++) { const x = CX - 1000 + i * 92, y = GY - 840 + Math.sin(i * 0.7) * 40 + 30; circle(g, x, y, 10, cols[i % 4]); glow(g, x, y, 50, cols[i % 4], 0.5); }
      lamp(g, CX - 300, GY - 620, M, 0.55);
    }, (g, GY) => { if (o.table !== false) { const tx = CX + (o.tableX ?? 0); rr(g, tx - 520, GY - 250, 1040, 26, 8); g.fillStyle = '#e8dcc8'; g.fill(); g.fillStyle = shade(M.wall, -0.6); g.fillRect(tx - 500, GY - 224, 1000, 30); for (const dx of [-480, 480]) seg(g, [[tx + dx, GY - 224], [tx + dx, GY]], 12, shade(M.wall, -0.65));
      drawItem(g, 'cake', tx - 60, GY - 250, 1, t); for (const dx of [-380, -240, 180, 340]) drawItem(g, 'glass', tx + dx, GY - 250, 0.9, t); } });
  },
  // кухня родителей поздно вечером: тёмный коридор + свет из кухни
  parents(g, t, cam, o = {}) {
    const M = mood('night'), CX = CXv();
    return room(g, t, cam, M, { wallK: -0.2 }, (g, GY) => {
      win(g, CX + 120, GY - 760, 360, 380, 'night', M, t);
      lamp(g, CX + 300, GY - 560, { ...M, practical: '#ffc87a' }, 0.7);
      FX.pool(g, CX + 300, GY + 20, 420, 60, '#ffc87a', 0.25);
      if (o.doorway) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(-E.W, -E.H, E.W + CX - 520, E.H * 3); seg(g, [[CX - 520, GY], [CX - 520, GY - 620]], 24, shade(M.wall, -0.6)); }
    }, (g, GY) => { const tx = CX + 300; rr(g, tx - 260, GY - 290, 520, 22, 8); g.fillStyle = shade(M.wall, -0.7); g.fill(); seg(g, [[tx - 220, GY - 270], [tx - 220, GY]], 12, shade(M.wall, -0.7)); seg(g, [[tx + 220, GY - 270], [tx + 220, GY]], 12, shade(M.wall, -0.7)); drawItem(g, 'mug', tx - 80, GY - 290, 1, t); drawItem(g, 'mug', tx + 90, GY - 290, 1, t); });
  },
  // балкон ночью: перила, огни города
  balcony(g, t, cam, o = {}) {
    const M = mood('night'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.12, g => { backdrop(g, M.sky); FX.stars(g, t, { count: 120 }); FX.moon(g, CX - 500, 200, 34); FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 120, maxH: 520, color: '#0b0e22', windowColor: '#ffcf8a', lit: 0.4, seed: 14 }); });
    layer(g, cam, 0.6, g => { g.fillStyle = shade(M.wall, -0.45); g.fillRect(CX + 520, -E.H, E.W * 2, E.H * 3); FX.door(g, { x: CX + 580, y: GY, w: 180, h: 480, color: shade(M.wall, -0.5), open: o.open ?? 0.4, light: '#ffd59a' }); });
    layer(g, cam, 0.9, g => { g.fillStyle = shade(M.floor, -0.2); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); seg(g, [[-E.W, GY - 210], [CX + 520, GY - 210]], 10, '#1a1c30'); for (let x = -E.W; x < CX + 520; x += 36) seg(g, [[x, GY - 210], [x, GY]], 4, '#1a1c30'); });
    return { GY, CX, M };
  },
  // кухня бабушки: тёплый свет, занавески, плита, стол, стационарный телефон
  gran(g, t, cam, o = {}) {
    const M = mood(o.mood || 'interiorWarm'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      win(g, CX - 200, GY - 780, 400, 420, o.sky || 'golden', M, t);
      g.fillStyle = '#c86a5a'; poly(g, [[CX - 240, GY - 800], [CX - 150, GY - 800], [CX - 190, GY - 340], [CX - 260, GY - 340]], '#b85a4a'); poly(g, [[CX + 240, GY - 800], [CX + 150, GY - 800], [CX + 190, GY - 340], [CX + 260, GY - 340]], '#b85a4a');
      FX.godRays(g, CX, GY - 580, { angle: 1.75, spread: 0.7, len: 1000, color: M.key, a: 0.07, t });
      // плита
      const px = CX + 560; g.fillStyle = '#e8e0d0'; g.fillRect(px - 150, GY - 330, 300, 330); g.fillStyle = '#2a2228'; g.fillRect(px - 120, GY - 260, 240, 170); circle(g, px - 60, GY - 336, 30, '#3a3238'); circle(g, px + 60, GY - 336, 30, '#3a3238');
      // телефон на полке
      const tx = CX - 700; g.fillStyle = shade(M.wall, -0.5); g.fillRect(tx - 120, GY - 420, 240, 16); drawItem(g, 'landline', tx, GY - 420, 1, t, { off: o.phoneOff });
      g.fillStyle = shade(M.wall, -0.55); g.fillRect(CX + 820, GY - 700, 220, 700); // шкаф
    }, (g, GY) => { if (o.table !== false) { const tx = CX + (o.tableX ?? -60); rr(g, tx - 300, GY - 280, 600, 24, 8); g.fillStyle = '#d8c8b0'; g.fill(); g.fillStyle = shade(M.wall, -0.6); seg(g, [[tx - 260, GY - 256], [tx - 260, GY]], 12, shade(M.wall, -0.65)); seg(g, [[tx + 260, GY - 256], [tx + 260, GY]], 12, shade(M.wall, -0.65)); if (o.pies) drawItem(g, 'pies', tx + (o.piesDX ?? 120), GY - 280, 1, t, { n: o.pies }); if (o.paper) { g.save(); g.translate(tx - 120, GY - 290); g.transform(1, 0, -0.6, 0.25, 0, 0); g.fillStyle = '#e8e2d2'; g.fillRect(-110, -60, 220, 60); g.restore(); } } });
  },
  // подъезд/лестница
  stairs(g, t, cam, o = {}) {
    const M = mood('interiorCool'), CX = CXv();
    return room(g, t, cam, M, { wallK: -0.2 }, (g, GY) => {
      g.fillStyle = shade(M.wall, -0.5); g.beginPath(); g.moveTo(CX - 1200, GY); for (let i = 0; i < 14; i++) { g.lineTo(CX - 1200 + i * 120, GY - i * 60); g.lineTo(CX - 1080 + i * 120, GY - i * 60); } g.lineTo(CX + 600, GY); g.closePath(); g.fill();
      seg(g, [[CX - 1200, GY - 160], [CX + 480, GY - 1000]], 6, '#8a90a8');
      glow(g, CX + 200, GY - 820, 300, '#dfe6ff', 0.4); circle(g, CX + 200, GY - 820, 16, '#eef2ff');
      FX.door(g, { x: CX + 560, y: GY, w: 170, h: 420, color: '#5a3a3a', open: o.open ?? 0, light: '#ffd59a' });
    });
  },
  // двор ночью: подъезд, фонарь, машина, деревья
  yard(g, t, cam, o = {}) {
    const M = mood(o.mood || 'night'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.15, g => { backdrop(g, M.sky); FX.stars(g, t, { count: 90 }); FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, minH: 200, maxH: 520, color: '#0c0f24', windowColor: '#ffcf8a', lit: 0.3, seed: 18 }); });
    layer(g, cam, 0.5, g => { FX.facade(g, { x: CX - 1300, y: GY - 40, w: 2600, h: 900, color: shade(M.wall, -0.2), win: M.practical, dark: shade(M.wall, -0.6), cols: 14, rows: 6, lit: 0.4, seed: 41 }); const dx = CX + (o.doorX ?? -360); g.fillStyle = '#ffd59a'; g.fillRect(dx - 60, GY - 300, 120, 260); glow(g, dx, GY - 200, 300, '#ffd59a', 0.35); rr(g, dx - 110, GY - 330, 220, 26, 6); g.fillStyle = '#1a1a26'; g.fill(); });
    layer(g, cam, 0.85, g => { g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 300, [shade(M.road, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2); FX.lampPost(g, CX + 560, GY - 30, 420, { light: M.practical, a: 0.25 }); for (const x of [-900, 900]) FX.tree(g, CX + x, GY - 30, 2.2, '#0a0c1a');
      if (o.car !== false) drawItem(g, 'car', CX + (o.carX ?? 420), GY + 30, 1.3, t, { lights: o.carLights }); });
    return { GY, CX, M };
  },
  // лифт: металлические стены, панель кнопок
  elevator(g, t, cam, o = {}) {
    const M = mood('interiorCool'), CX = CXv();
    return room(g, t, cam, M, { wallK: 0.1, color: '#4a4a58' }, (g, GY) => {
      for (let i = -3; i <= 3; i++) { g.fillStyle = i % 2 ? '#6a7080' : '#5a6070'; g.fillRect(CX + i * 300 - 150, GY - 900, 300, 900); }
      rr(g, CX + 520, GY - 520, 90, 220, 10); g.fillStyle = '#2a2a34'; g.fill(); for (let k = 0; k < 6; k++) circle(g, CX + 565, GY - 490 + k * 34, 10, k === 2 ? '#ffd47e' : '#9aa0b0');
      rr(g, CX - 200, GY - 940, 400, 20, 8); g.fillStyle = '#f4f8ff'; g.fill(); glow(g, CX, GY - 920, 400, '#e8f0ff', 0.4);
    });
  },
  // кинотеатр: окошко кассы
  cinema(g, t, cam, o = {}) {
    const M = mood('interiorWarm'), CX = CXv();
    return room(g, t, cam, M, { wallK: -0.45 }, (g, GY) => {
      for (let i = -3; i <= 3; i++) { rr(g, CX + i * 380 - 120, GY - 860, 240, 340, 8); g.fillStyle = ['#7a2a3a', '#2a4a7a', '#6a5a2a'][(i + 6) % 3]; g.fill(); glow(g, CX + i * 380, GY - 690, 220, M.practical, 0.15); }
      rr(g, CX - 260, GY - 470, 520, 470, 10); g.fillStyle = '#4a2a2a'; g.fill(); g.fillStyle = '#ffe2a8'; g.fillRect(CX - 200, GY - 420, 400, 230); glow(g, CX, GY - 300, 340, '#ffd59a', 0.35);
      g.fillStyle = '#2a1a1a'; g.fillRect(CX - 70, GY - 220, 140, 30);
      sign(g, CX, GY - 500, 260, 54, 'КАССА', { bg: '#c83a3a', fg: '#fff4e0' });
    });
  },
  // аудитория: ряды кресел, прожектор
  lecture(g, t, cam, o = {}) {
    const M = mood('interiorWarm'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.5, g => { backdrop(g, [shade(M.wall, -0.55), shade(M.wall, -0.4)]); wall(g, M, GY - 900, -0.45); rr(g, CX - 520, GY - 760, 1040, 380, 12); g.fillStyle = shade(M.wall, -0.2); g.fill(); });
    layer(g, cam, 0.85, g => { floor(g, M); FX.crowd(g, t, { y: GY - 40, rows: 4, rowH: 46, size: 2.2, color: '#2a1e2a', seed: 3, x: -E.W * 0.5, w: E.W * 2 }); });
    return { GY, CX, M };
  },
  // Древняя Греция: холмы, колонны, овцы, закат
  greece(g, t, cam, o = {}) {
    const M = mood('dusk'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.12, g => { backdrop(g, M.sky); FX.sun(g, CX + 380, GY - 300, 70, '#fff3dc', M.key, 5); FX.hills(g, { y: GY - 200, amp: 90, color: '#4a2e48', seed: 6 }); });
    layer(g, cam, 0.5, g => { FX.hills(g, { y: GY - 60, amp: 50, color: '#2e1e30', seed: 9 }); for (const x of [-700, -560, -420]) { g.fillStyle = '#3a2838'; g.fillRect(CX + x, GY - 480, 46, 420); g.fillRect(CX + x - 14, GY - 500, 74, 24); } g.fillRect(CX - 720, GY - 520, 360, 26); });
    layer(g, cam, 0.85, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#3a2a2a', '#1a1018']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); for (let i = 0; i < 5; i++) drawItem(g, 'sheep', CX + 260 + i * 150, GY + 20 + (i % 2) * 30, 0.9, t + i); });
    return { GY, CX, M };
  },
  // лаборатория (VR-эксперимент): строгая комиссия
  lab(g, t, cam, o = {}) {
    const M = mood('interiorCool'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      for (const x of [-600, 0, 600]) { rr(g, CX + x - 140, GY - 880, 280, 16, 6); g.fillStyle = '#e8f4ff'; g.fill(); glow(g, CX + x, GY - 860, 260, '#cfe6ff', 0.3); }
      FX.screen(g, { x: CX - 900, y: GY - 700, w: 360, h: 220, glowC: '#7fd0d6' }, (g, x, y, w, h) => { g.strokeStyle = '#7fd0d6'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; const yy = y + h / 2 + (i % 10 === 5 ? -60 : i % 10 === 6 ? 40 : 0); i ? g.lineTo(x + u * w, yy) : g.moveTo(x + u * w, yy); } g.stroke(); });
    }, (g, GY) => { const tx = CX + 420; rr(g, tx - 360, GY - 260, 720, 24, 6); g.fillStyle = '#3a4a68'; g.fill(); g.fillStyle = '#26324a'; g.fillRect(tx - 340, GY - 236, 680, 236); });
  },
  // офис / созвон: фон для экрана ноутбука
  void(g, t, cam, o = {}) {
    const M = mood('void'), GY = GYv(), CX = CXv();
    layer(g, cam, 0.3, g => { backdrop(g, M.sky); FX.stars(g, t, { count: 60, area: [0, 0, E.W, E.H] }); });
    layer(g, cam, 0.85, g => { g.fillStyle = shade(M.floor, -0.2); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.lightCone(g, CX, -60, { angle: Math.PI / 2, spread: 0.45, len: GY + 200, color: '#9fb8ff', a: 0.16 }); FX.pool(g, CX, GY + 10, 340, 50, '#9fb8ff', 0.3); });
    return { GY, CX, M };
  },
  // квартира Лёхи (комната с табличкой) = дневная комната
  living(g, t, cam, o = {}) {
    const M = mood('interiorWarm'), CX = CXv();
    return room(g, t, cam, M, {}, (g, GY) => {
      win(g, CX - 760, GY - 760, 380, 420, o.sky || 'day', M, t);
      FX.godRays(g, CX - 570, GY - 550, { angle: 1.3, spread: 0.7, len: 1000, color: M.key, a: 0.06, t });
      // диван
      const sx = CX + 380; rr(g, sx - 330, GY - 260, 660, 120, 30); g.fillStyle = '#6a3a3a'; g.fill(); rr(g, sx - 350, GY - 180, 700, 140, 26); g.fillStyle = '#7a4444'; g.fill();
      if (o.plaque) sign(g, CX - 120, GY - 640, 420, 150, o.plaque, { bg: '#f4ead6', fg: '#2a2228', lines: 2, font: FONTS.ui });
      lamp(g, CX + 900, GY - 620, M, 0.4);
    }, (g, GY) => { const tx = CX - 160; rr(g, tx - 200, GY - 200, 400, 20, 6); g.fillStyle = shade(M.wall, -0.65); g.fill(); seg(g, [[tx - 170, GY - 180], [tx - 170, GY]], 10, shade(M.wall, -0.65)); seg(g, [[tx + 170, GY - 180], [tx + 170, GY]], 10, shade(M.wall, -0.65)); });
  },
};
