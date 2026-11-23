// sets/places5.js — декорации «Если бы ты не чувствовал боли»: кухня общаги с плитой, комната общаги,
// качалка, футбольное поле, раздевалка, больница (палата / операционная), стоматология, тату-салон,
// улица в Пакистане, лепрозорий в Индии, Шотландия. Всё якорится к GY и CX.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const ground = () => E.H * V(0.8, 0.68);
function paintWall(g, GY, c, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(c, -0.12 + k), shade(c, k), shade(c, -0.22 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }
function floor(g, M, GY, c) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(c || M.floor, -0.02), shade(c || M.dark, -0.2)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.18), 0.07); }
function tiles(g, x0, y0, w, h, c, sz = 60) { g.fillStyle = c; g.fillRect(x0, y0, w, h); g.strokeStyle = alpha('#000000', 0.08); g.lineWidth = 2; for (let x = x0; x <= x0 + w; x += sz) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + h); g.stroke(); } for (let y = y0; y <= y0 + h; y += sz) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + w, y); g.stroke(); } }
function sky(g, M, x, y, w, h, o = {}) {
  if (o.night) { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#10142c', '#262a4c']); g.fillRect(x, y, w, h); circle(g, x + w * 0.7, y + h * 0.3, 16, '#f4ecd0'); }
  else { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.sun(g, x + w * 0.7, y + h * 0.3, 28, '#fff6e2', M.key, 3); }
  FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: alpha('#5a6080', 0.75), windowColor: alpha('#ffd59a', 0.5), seed: 7 });
}
const dim = (g, k) => { if (!k) return; g.fillStyle = `rgba(8,10,24,${k})`; g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5); };

// сковородка (ручкой влево при dir=-1). hot — раскалённое дно, smoke — дымок
export function pan(g, x, y, o = {}) {
  const d = o.dir ?? -1, s = o.s ?? 1, t = o.t || 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[0, -14], [d * 190, -30]], 16, '#1a1a1e'); seg(g, [[d * 150, -27], [d * 200, -31]], 18, '#3a2a20');
  g.fillStyle = '#26262c'; g.beginPath(); g.ellipse(-d * 30, -14, 120, 22, 0, 0, 7); g.fill(); rr(g, -d * 30 - 112, -20, 224, 22, 10); g.fill();
  if (o.hot) { glow(g, -d * 30, 0, 140, '#ff6a2a', 0.35 + 0.08 * Math.sin(t * 6)); g.fillStyle = alpha('#ff7a3a', 0.6); g.fillRect(-d * 30 - 100, -2, 200, 6); }
  if (o.smoke) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i * 0.25) % 1); g.strokeStyle = alpha('#e8e4f0', 0.35 * (1 - k)); g.lineWidth = 8; g.beginPath(); const bx = -d * 30 - 60 + i * 40; g.moveTo(bx, -30 - k * 40); g.quadraticCurveTo(bx + 20 * Math.sin(t * 2 + i), -80 - k * 120, bx - 10, -140 - k * 160); g.stroke(); }
  g.restore();
}
// газовая плита: две конфорки, духовка
function stove(g, x, GY, o) {
  rr(g, x - 130, GY - 240, 260, 240, 10); g.fillStyle = '#ece8e0'; g.fill(); rr(g, x - 100, GY - 180, 200, 140, 8); g.fillStyle = '#2a2a30'; g.fill(); rr(g, x - 90, GY - 170, 180, 30, 6); g.fillStyle = alpha('#9aa0aa', 0.4); g.fill();
  for (let i = 0; i < 4; i++) circle(g, x - 90 + i * 60, GY - 210, 9, '#3a3a44');
  g.fillStyle = '#1e1e24'; g.fillRect(x - 130, GY - 252, 260, 14);
  if (o.flame) for (const dx of [-60, 60]) for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI; const fx = x + dx + Math.cos(a) * 34, fl = 14 + 6 * Math.sin((o.t || 0) * 20 + i); poly(g, [[fx - 5, GY - 252], [fx, GY - 252 - fl], [fx + 5, GY - 252]], i % 2 ? '#5ab0ff' : '#3a7aff'); }
}

// ── кухня общаги: кафель, плита, стол, окно, лампочка под потолком
export function dorm(g, t, cam, o = {}) {
  const M = mood(o.mood || (o.night ? 'night' : 'interiorWarm')), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, o.night ? '#6a7090' : '#e8dcc0');
    tiles(g, -E.W * 2, GY - 330, E.W * 5, 330, o.night ? '#5a7a80' : '#a8d0c8', 56);
    FX.windowFrame(g, { x: CX + V(420, 200), y: GY - V(700, 1000), w: 320, h: 300, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { night: o.night || o.dark }));
    // полка с банками
    const sx = CX - 520; seg(g, [[sx - 150, GY - 560], [sx + 150, GY - 560]], 10, '#8a5a3c');
    ['#e8c070', '#c0453a', '#7aa0c0', '#f4efe6'].forEach((c, i) => { rr(g, sx - 130 + i * 70, GY - 640, 50, 80, 8); g.fillStyle = c; g.fill(); });
    if (o.mitt !== false) { seg(g, [[CX + 40, GY - 470], [CX + 40, GY - 450]], 4, '#9aa0aa'); rr(g, CX + 10, GY - 450, 60, 90, 22); g.fillStyle = '#d64a5a'; g.fill(); }
    // лампочка
    seg(g, [[CX - 120, -E.H], [CX - 120, GY - V(760, 1150)]], 3, '#2a2a30'); circle(g, CX - 120, GY - V(745, 1135), 18, o.dark ? '#5a5a60' : '#fff2c8'); if (!o.dark) glow(g, CX - 120, GY - V(745, 1135), 260, '#ffe2a0', 0.3);
  });
  layer(g, cam, 0.8, (g) => {
    stove(g, CX + (o.stoveX ?? 300), GY, { flame: o.flame, t });
    if (o.pan === 'stove') pan(g, CX + (o.stoveX ?? 300) + 10, GY - 252, { dir: -1, hot: o.hot, t });
    const tx = CX + (o.tableX ?? -360); rr(g, tx - 200, GY - 170, 400, 22, 6); g.fillStyle = '#c8a070'; g.fill(); for (const dx of [-180, 180]) seg(g, [[tx + dx, GY - 150], [tx + dx, GY]], 10, '#8a6a4a');
    if (o.pan === 'table') pan(g, tx + 20, GY - 170, { dir: 1, hot: o.hot, smoke: o.smoke, t });
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, o.night ? '#4a4a5a' : '#a08a6a'));
  return { GY, CX, M, fg: o.dark ? (g) => dim(g, 0.45) : null };
}

// ── комната общаги: две кровати, стол, плакат, список над кроватью
export function dormroom(g, t, cam, o = {}) {
  const M = mood(o.mood || (o.night ? 'night' : 'interiorWarm')), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, o.night ? '#5a6080' : '#d8c8a8');
    for (let x = -E.W * 2; x < E.W * 3; x += 90) seg(g, [[x, -E.H], [x, GY]], 3, alpha('#000000', 0.04));
    FX.windowFrame(g, { x: CX - 160, y: GY - V(700, 1000), w: 320, h: 300, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { night: o.night }));
    rr(g, CX + 380, GY - 690, 200, 260, 4); g.fillStyle = '#2a3a5a'; g.fill(); circle(g, CX + 480, GY - 590, 50, '#f2c21a'); text(g, 'ROCK', CX + 480, GY - 470, { size: 36, font: FONTS.ui, weight: 900, color: '#f4efe6' });
    if (o.list) { const lx = CX + (o.listX ?? -560); g.save(); g.translate(lx, GY - 560); g.rotate(-0.03); rr(g, -110, -130, 220, 260, 4); g.fillStyle = '#fbf8f1'; g.fill(); text(g, 'КАЖДОЕ УТРО', 0, -96, { size: 22, font: FONTS.ui, weight: 900, color: '#c0453a' }); for (let i = 0; i < 4; i++) { ring(g, -84, -50 + i * 46, 10, 3, '#3a3a44'); seg(g, [[-60, -50 + i * 46], [80 - (i % 2) * 30, -50 + i * 46]], 5, alpha('#3a3a44', 0.5)); } circle(g, 0, -126, 8, '#c0453a'); g.restore(); }
  });
  layer(g, cam, 0.8, (g) => {
    FX.bed(g, { x: CX + (o.bedL ?? -820), y: GY, w: 460, color: '#c06a3a', frame: '#5a4030', pillow: '#f4efe6' });
    FX.bed(g, { x: CX + (o.bedR ?? 420), y: GY, w: 460, color: '#3a7ab0', frame: '#5a4030', pillow: '#f4efe6' });
    if (o.desk !== false) { const dx = CX + (o.deskX ?? 40); rr(g, dx - 140, GY - 160, 280, 18, 4); g.fillStyle = '#8a6a4a'; g.fill(); seg(g, [[dx - 120, GY - 142], [dx - 120, GY]], 8, '#6a4a30'); seg(g, [[dx + 120, GY - 142], [dx + 120, GY]], 8, '#6a4a30'); rr(g, dx - 60, GY - 210, 120, 50, 6); g.fillStyle = '#2a2a30'; g.fill(); }
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, o.night ? '#3a3a4a' : '#8a6a4a'));
  return { GY, CX, M, fg: o.night ? (g) => dim(g, 0.25) : null };
}

// ── качалка: тёмные стены, зеркала, стойка с блинами, скамья для жима
export function gym(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#3a3f4f'); g.fillStyle = '#c0453a'; g.fillRect(-E.W * 2, GY - 420, E.W * 5, 14);
    for (let i = -3; i <= 3; i++) { rr(g, CX + i * 420 - 180, GY - 760, 360, 300, 6); g.fillStyle = linGrad(g, 0, GY - 760, 0, GY - 460, ['#5a6a80', '#3a4658']); g.fill(); seg(g, [[CX + i * 420 - 120, GY - 740], [CX + i * 420 - 40, GY - 480]], 6, alpha('#ffffff', 0.12)); }
    text(g, 'IRON', CX - 620, GY - 860, { size: 60, font: FONTS.ui, weight: 900, color: alpha('#f4efe6', 0.25), spacing: 10 });
    const rx = CX + 560; seg(g, [[rx - 80, GY], [rx - 80, GY - 320]], 10, '#1a1a1e'); seg(g, [[rx + 80, GY], [rx + 80, GY - 320]], 10, '#1a1a1e');
    for (let i = 0; i < 4; i++) { circle(g, rx, GY - 60 - i * 70, 42 - i * 6, '#1e1e24'); circle(g, rx, GY - 60 - i * 70, 10, '#5a5a66'); }
  });
  layer(g, cam, 0.8, (g) => { const bx = CX + (o.benchX ?? 0); rr(g, bx - 230, GY - 100, 380, 30, 10); g.fillStyle = '#2a2a30'; g.fill(); seg(g, [[bx - 200, GY - 70], [bx - 200, GY]], 10, '#1a1a1e'); seg(g, [[bx + 120, GY - 70], [bx + 120, GY]], 10, '#1a1a1e');
    seg(g, [[bx - 150, GY - 70], [bx - 150, GY - 300]], 10, '#9aa0aa'); seg(g, [[bx - 110, GY - 70], [bx - 110, GY - 300]], 10, '#9aa0aa'); });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#2a2a30'));
  return { GY, CX, M };
}
// штанга (над лежащим героем); press — фаза жима 0..1
export function barbell(g, x, y, o = {}) {
  seg(g, [[x - 330, y], [x + 330, y]], 10, '#c9ccd4');
  for (const d of [-1, 1]) { rr(g, x + d * 260 - 18, y - 80, 36, 160, 8); g.fillStyle = '#1e1e24'; g.fill(); rr(g, x + d * 300 - 14, y - 64, 28, 128, 8); g.fill(); }
}

// ── любительское футбольное поле вечером: маленькая трибуна, сетка, ворота
export function field(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, M.sky); FX.sun(g, CX + 500, GY - 760, 50, '#fff6e2', M.key, 4); FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, maxH: 260, color: alpha('#5a5070', 0.7), seed: 11 }); });
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#3a3a50'; g.fillRect(-E.W * 2, GY - 330, E.W * 5, 220); FX.crowd(g, t, { y: GY - 320, rows: 4, rowH: 46, size: 1.3, color: '#4a4660', w: E.W * 3, x: -E.W, cheer: o.cheer ?? 0.2 });
    for (const x of [-800, 800]) { seg(g, [[CX + x, GY - 1000], [CX + x, GY - 330]], 10, '#1a1c2a'); rr(g, CX + x - 90, GY - 1060, 180, 70, 8); g.fillStyle = '#e8f0ff'; g.fill(); glow(g, CX + x, GY - 1030, 260, '#e8f0ff', 0.3); } });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 110, 0, GY + 400, ['#3a7a44', '#1f4a2a']); g.fillRect(-E.W * 2, GY - 110, E.W * 5, E.H * 2);
    for (let i = -10; i < 10; i++) { g.fillStyle = alpha('#ffffff', i % 2 ? 0.035 : 0); g.fillRect(CX + i * 220, GY - 110, 220, E.H); }
    if (o.goalX != null) { const gx = CX + o.goalX; g.strokeStyle = '#f4f1ea'; g.lineWidth = 12; g.beginPath(); g.moveTo(gx - 260, GY); g.lineTo(gx - 260, GY - 300); g.lineTo(gx + 260, GY - 300); g.lineTo(gx + 260, GY); g.stroke(); g.strokeStyle = alpha('#ffffff', 0.25); g.lineWidth = 2; for (let i = -240; i < 260; i += 30) { g.beginPath(); g.moveTo(gx + i, GY - 290); g.lineTo(gx + i + 20, GY - 10); g.stroke(); } }
  });
  return { GY, CX, M };
}

// ── раздевалка: шкафчики, скамейка, холодный свет
export function locker(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => { paintWall(g, GY, '#9aa8b0'); tiles(g, -E.W * 2, GY - 260, E.W * 5, 260, '#c8d4d8', 50);
    for (let i = -6; i <= 6; i++) { const x = CX + i * 170; rr(g, x - 80, GY - 620, 160, 560, 6); g.fillStyle = i % 2 ? '#4a6a9a' : '#4a7aa8'; g.fill(); for (let k = 0; k < 4; k++) seg(g, [[x - 40, GY - 590 + k * 12], [x + 40, GY - 590 + k * 12]], 4, alpha('#000000', 0.25)); circle(g, x + 54, GY - 360, 7, '#c9ccd4'); }
    seg(g, [[CX - 300, -E.H], [CX - 300, GY - V(760, 1100)]], 3, '#2a2a30'); rr(g, CX - 380, GY - V(770, 1110), 160, 16, 4); g.fillStyle = '#e8f0ff'; g.fill(); glow(g, CX - 300, GY - V(760, 1100), 300, '#e8f0ff', 0.2); });
  layer(g, cam, 0.8, (g) => { rr(g, CX - 600, GY - 110, 1200, 26, 8); g.fillStyle = '#b08a5a'; g.fill(); for (const dx of [-560, 0, 560]) seg(g, [[CX + dx, GY - 90], [CX + dx, GY]], 10, '#6a6a74'); });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#6a7078'));
  return { GY, CX, M };
}

// ── больница: палата (кровать, капельница, монитор) или операционная (o.or — лампа, зелёные стены)
export function ward(g, t, cam, o = {}) {
  const M = mood(o.night ? 'night' : 'interiorCool'), GY = ground(), CX = E.W / 2, bx = CX + (o.bedX ?? 0);
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, o.or ? '#5a9a88' : o.night ? '#5a6a80' : '#cfe0dc'); g.fillStyle = o.or ? '#3a7a68' : '#8ab8b0'; g.fillRect(-E.W * 2, GY - 260, E.W * 5, 260);
    if (!o.or) FX.windowFrame(g, { x: CX - 760, y: GY - V(700, 1000), w: 320, h: 300, cols: 2, frame: '#f4f1ea', bar: 10, blinds: 0.3 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { night: o.night }));
    // монитор с пульсом
    const mx = bx + 420; rr(g, mx - 100, GY - 620, 200, 140, 10); g.fillStyle = '#1a1e24'; g.fill(); g.strokeStyle = '#3fe07a'; g.lineWidth = 4; g.beginPath();
    for (let i = 0; i <= 40; i++) { const x = mx - 86 + i * 4.3, ph = ((i / 40) + t * 0.6) % 1, y = GY - 550 - (ph > 0.45 && ph < 0.5 ? 40 : ph > 0.5 && ph < 0.53 ? -18 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); seg(g, [[mx, GY - 480], [mx, GY]], 8, '#9aa0aa');
    // капельница
    const ix = bx - 420; seg(g, [[ix, GY], [ix, GY - 640]], 6, '#c9ccd4'); seg(g, [[ix - 40, GY - 640], [ix + 40, GY - 640]], 6, '#c9ccd4'); rr(g, ix - 30, GY - 630, 60, 90, 14); g.fillStyle = alpha('#d8f0ff', 0.8); g.fill(); seg(g, [[ix, GY - 540], [ix + 120, GY - 300], [bx - 160, GY - 150]], 2, alpha('#d8f0ff', 0.7));
    if (o.or) { seg(g, [[bx, -E.H], [bx, GY - V(820, 1150)]], 10, '#9aa0aa'); g.fillStyle = '#e8ecf0'; g.beginPath(); g.ellipse(bx, GY - V(800, 1130), 220, 60, 0, 0, 7); g.fill(); glow(g, bx, GY - V(780, 1110), 420, '#ffffff', 0.35); FX.lightCone(g, bx, GY - V(780, 1110), { angle: Math.PI / 2, spread: 0.3, len: 800, color: '#ffffff', a: 0.08 }); }
  });
  layer(g, cam, 0.8, (g) => { if (o.bed !== false) { rr(g, bx - 300, GY - 190, 600, 50, 12); g.fillStyle = '#e8ecf0'; g.fill(); rr(g, bx - 300, GY - 200, 130, 40, 14); g.fillStyle = '#ffffff'; g.fill(); seg(g, [[bx - 290, GY - 300], [bx - 290, GY]], 12, '#9aa0aa'); seg(g, [[bx + 290, GY - 220], [bx + 290, GY]], 12, '#9aa0aa'); for (const dx of [-260, 260]) circle(g, bx + dx, GY - 14, 14, '#3a3a44'); } });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, o.or ? '#4a6a60' : '#9aa8a8'));
  return { GY, CX, M, fg: o.night ? (g) => dim(g, 0.2) : null };
}
// одеяло поверх лежащего в больничной кровати
export function blanket(g, x, GY, c = '#9ac8e8') { rr(g, x - 150, GY - 232, 440, 60, 24); g.fillStyle = c; g.fill(); g.strokeStyle = alpha('#000000', 0.12); g.lineWidth = 3; g.stroke(); }

// ── стоматология: кресло, лампа на кронштейне, шкафчик, плакат с зубом
export function dentist(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ground(), CX = E.W / 2, cx = CX + (o.chairX ?? 0);
  layer(g, cam, 0.5, (g) => { paintWall(g, GY, '#d8ecee'); g.fillStyle = '#7ac0c8'; g.fillRect(-E.W * 2, GY - 240, E.W * 5, 240);
    rr(g, CX - 760, GY - 720, 220, 280, 6); g.fillStyle = '#fbf8f1'; g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(CX - 700, GY - 660); g.quadraticCurveTo(CX - 650, GY - 690, CX - 600, GY - 660); g.lineTo(CX - 610, GY - 540); g.lineTo(CX - 640, GY - 600); g.lineTo(CX - 660, GY - 600); g.lineTo(CX - 690, GY - 540); g.closePath(); g.fill(); g.strokeStyle = '#7ac0c8'; g.lineWidth = 5; g.stroke();
    rr(g, CX + 500, GY - 300, 320, 300, 10); g.fillStyle = '#e8ecf0'; g.fill(); for (let i = 0; i < 3; i++) seg(g, [[CX + 520, GY - 220 + i * 80], [CX + 800, GY - 220 + i * 80]], 3, '#c9ccd4');
    seg(g, [[cx + 300, -E.H], [cx + 300, GY - 700], [cx + 120, GY - 560]], 10, '#c9ccd4'); g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(cx + 110, GY - 545, 70, 34, -0.4, 0, 7); g.fill(); glow(g, cx + 100, GY - 520, 200, '#fffbe8', 0.4); });
  layer(g, cam, 0.8, (g) => { g.save(); g.translate(cx, GY); rr(g, -60, -120, 120, 120, 10); g.fillStyle = '#9aa0aa'; g.fill(); g.rotate(-0.12); rr(g, -260, -200, 520, 70, 30); g.fillStyle = '#4aa0b0'; g.fill(); g.restore(); g.save(); g.translate(cx - 240, GY - 210); g.rotate(-0.9); rr(g, -40, -160, 80, 190, 30); g.fillStyle = '#4aa0b0'; g.fill(); g.restore(); });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#a8b4b8'));
  return { GY, CX, M };
}

// ── тату-салон: тёмные стены, неоновая вывеска, эскизы на стене, кушетка
export function tattoo(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2, cx = CX + (o.couchX ?? 0);
  layer(g, cam, 0.5, (g) => { paintWall(g, GY, '#3a2a34');
    const nx = CX - 420, ny = GY - 740, fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3); glow(g, nx, ny, 360, '#ff4a8a', 0.3 * fl); text(g, 'TATTOO', nx, ny, { size: 96, font: FONTS.ui, weight: 900, color: '#ffd0e4', glow: 30, glowColor: 'rgba(255,60,140,.9)', spacing: 8 });
    for (let i = 0; i < 6; i++) { const x = CX + 160 + (i % 3) * 190, y = GY - 760 + Math.floor(i / 3) * 210; rr(g, x - 80, y - 90, 160, 180, 4); g.fillStyle = '#f4ecd8'; g.fill(); g.strokeStyle = ['#c0453a', '#2a2a30', '#3a6ea5'][i % 3]; g.lineWidth = 5; g.beginPath(); if (i % 2) g.arc(x, y, 44, 0, 7); else { g.moveTo(x - 40, y + 40); g.lineTo(x, y - 50); g.lineTo(x + 40, y + 40); g.closePath(); } g.stroke(); }
    seg(g, [[CX + 600, -E.H], [CX + 600, GY - V(760, 1100)]], 3, '#1a1a1e'); circle(g, CX + 600, GY - V(750, 1090), 20, '#fff2c8'); glow(g, CX + 600, GY - V(750, 1090), 300, '#ffe2a0', 0.35); });
  layer(g, cam, 0.8, (g) => { rr(g, cx - 300, GY - 140, 600, 50, 18); g.fillStyle = '#1a1a1e'; g.fill(); rr(g, cx - 300, GY - 170, 140, 50, 20); g.fill(); seg(g, [[cx - 240, GY - 100], [cx - 240, GY]], 12, '#3a3a44'); seg(g, [[cx + 240, GY - 100], [cx + 240, GY]], 12, '#3a3a44'); });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#2a2228'));
  return { GY, CX, M };
}

// ── улица в Пакистане: пыльный тёплый свет, низкие дома, навесы, угли (o.coals)
export function bazaar(g, t, cam, o = {}) {
  const M = mood('golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#e8b880', '#f2cf9a', '#f8e0b8']); FX.sun(g, CX + 520, GY - 760, 60, '#fff6e2', '#ffb070', 4); });
  layer(g, cam, 0.5, (g) => {
    const cols = ['#d8b890', '#c8a07a', '#e0c8a0', '#b88a68', '#d0b08a'];
    for (let i = -5; i <= 5; i++) { const x = CX + i * 300, h = 420 + ((i * 37) % 5) * 50; g.fillStyle = cols[(i + 10) % 5]; g.fillRect(x - 150, GY - h, 300, h); g.fillStyle = shade(cols[(i + 10) % 5], -0.35); for (const dx of [-70, 50]) { rr(g, x + dx - 30, GY - h + 70, 60, 80, 30); g.fill(); }
      poly(g, [[x - 150, GY - 230], [x + 150, GY - 230], [x + 120, GY - 170], [x - 120, GY - 170]], ['#c0453a', '#2a8a7a', '#e8a020', '#5a6ad0'][(i + 10) % 4]); }
    FX.crowd(g, t, { y: GY - 60, rows: 2, rowH: 40, size: 1.2, color: alpha('#6a4a3a', 0.6), w: E.W * 3, x: -E.W, cheer: o.cheer ?? 0 });
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#c8a070', '#8a6a48']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    if (o.coals != null) { const cx = CX + o.coals; rr(g, cx - 240, GY - 10, 480, 30, 10); g.fillStyle = '#2a1a14'; g.fill(); for (let i = 0; i < 16; i++) circle(g, cx - 220 + i * 29, GY - 4 + (i % 3) * 4, 12, i % 3 ? '#ff6a2a' : '#ffb03a'); glow(g, cx, GY, 300, '#ff6a2a', 0.4 + 0.1 * Math.sin(t * 7)); } });
  return { GY, CX, M };
}

// ── лепрозорий в Индии, середина XX века: веранда с арками, пальма, кровати
export function india(g, t, cam, o = {}) {
  const M = mood('golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#f2c890', '#f8dcae', '#fbe8c8']); });
  layer(g, cam, 0.5, (g) => { g.fillStyle = '#f0e2c4'; g.fillRect(-E.W * 2, GY - 620, E.W * 5, 620);
    for (let i = -4; i <= 4; i++) { const x = CX + i * 320; g.fillStyle = '#c8a878'; g.beginPath(); g.moveTo(x - 110, GY); g.lineTo(x - 110, GY - 360); g.arc(x, GY - 360, 110, Math.PI, 0); g.lineTo(x + 110, GY); g.closePath(); g.fill(); }
    g.fillStyle = '#b05a3a'; g.fillRect(-E.W * 2, GY - 660, E.W * 5, 50); text(g, o.sign || 'ВЕЛЛОР · ИНДИЯ · 1950-е', CX, GY - 720, { size: 40, font: FONTS.ui, weight: 900, color: '#6a3a2a', spacing: 4 });
    for (const dx of [-560, 0, 560]) FX.bed(g, { x: CX + dx - 180, y: GY, w: 360, color: '#e8dcc4', frame: '#6a5040', pillow: '#fbf8f1' }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#c09a70', '#8a6a48']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    const px = CX + 860; seg(g, [[px, GY], [px - 30, GY - 600]], 26, '#6a4a2a'); for (let i = 0; i < 6; i++) { const a = -Math.PI + i * 0.5; g.strokeStyle = '#3a7a3a'; g.lineWidth = 22; g.beginPath(); g.moveTo(px - 30, GY - 600); g.quadraticCurveTo(px - 30 + Math.cos(a) * 160, GY - 700, px - 30 + Math.cos(a) * 280, GY - 560 + Math.abs(Math.sin(a)) * 40); g.stroke(); } });
  return { GY, CX, M };
}

// ── Шотландия: зелёные холмы, серое небо, каменный домик
export function hills(g, t, cam, o = {}) {
  const M = mood('day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, ['#8a9ab0', '#b8c4d0', '#dfe4e8']); FX.clouds(g, { y: 120, h: 200, a: 0.35, count: 8 }); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 220, amp: 220, color: '#5a8a5a', seed: 3 }); FX.hills(g, { y: GY - 80, amp: 140, color: '#4a7a48', seed: 9 }); });
  layer(g, cam, 0.6, (g) => { const hx = CX + 520; g.fillStyle = '#9a9890'; g.fillRect(hx - 200, GY - 300, 400, 300); poly(g, [[hx - 230, GY - 300], [hx, GY - 460], [hx + 230, GY - 300]], '#4a4a54'); rr(g, hx - 40, GY - 160, 80, 160, 6); g.fillStyle = '#6a3a2a'; g.fill(); for (const dx of [-130, 130]) { rr(g, hx + dx - 40, GY - 230, 80, 70, 4); g.fillStyle = '#ffe2a0'; g.fill(); }
    for (let i = 0; i < 12; i++) { g.fillStyle = alpha('#000000', 0.1); g.fillRect(hx - 200 + (i % 4) * 100, GY - 300 + Math.floor(i / 4) * 100, 98, 2); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#5a8a4a', '#2f5a2a']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); });
  return { GY, CX, M };
}
