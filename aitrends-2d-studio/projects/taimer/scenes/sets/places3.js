// sets/places3.js — декорации «Машины времени»: вишнёвая Волга (сбоку и изнутри через лобовое стекло),
// крыша гаражей, пустырь на рассвете, трасса, класс, питерская парадная.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { salon } from './salon.js';
import { room, void_ } from './places.js';
import { kitchen } from './places2.js';

const ground = () => E.H * V(0.8, 0.68);
export const CHERRY = '#8e1c2c';
const CHROME = '#d9dde4';
function wall(g, M, GY, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.wall, -0.15 + k), shade(M.wall, k), shade(M.wall, -0.3 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }
function floor(g, M, GY) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.22), 0.07); }

// ── Волга сбоку (смотрит вправо при dir=1). o: color, s, dir, drive (крутить колёса), t, glowDash
export function volgaSide(g, x, GY, o = {}) {
  const { color = CHERRY, s = 1, dir = 1, t = 0, drive = false, a = 1 } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, GY + (drive ? Math.sin(t * 14) * 1.5 : 0)); g.scale(dir * s, s);
  const body = color, dark = shade(color, -0.4), hi = shade(color, 0.3);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 4, 340, 18, 0, 0, Math.PI * 2); g.fill();
  // кузов: длинный, округлый
  g.fillStyle = linGrad(g, 0, -250, 0, -30, [hi, body, dark]);
  g.beginPath(); g.moveTo(-330, -60); g.quadraticCurveTo(-345, -120, -300, -138); g.lineTo(-190, -150);
  g.quadraticCurveTo(-150, -246, -40, -250); g.lineTo(60, -250); g.quadraticCurveTo(150, -246, 190, -158);
  g.lineTo(300, -146); g.quadraticCurveTo(345, -136, 342, -80); g.lineTo(336, -46); g.lineTo(-326, -46); g.closePath(); g.fill();
  // окна
  g.fillStyle = '#1c2230';
  g.beginPath(); g.moveTo(-170, -156); g.quadraticCurveTo(-136, -228, -50, -232); g.lineTo(-4, -232); g.lineTo(-4, -156); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(10, -156); g.lineTo(10, -232); g.lineTo(56, -232); g.quadraticCurveTo(134, -228, 172, -160); g.closePath(); g.fill();
  g.strokeStyle = CHROME; g.lineWidth = 4; g.beginPath(); g.moveTo(-176, -154); g.quadraticCurveTo(-140, -236, -40, -238); g.lineTo(60, -238); g.quadraticCurveTo(140, -234, 180, -156); g.closePath(); g.stroke();
  g.fillStyle = alpha('#ffffff', 0.14); g.beginPath(); g.moveTo(-110, -222); g.lineTo(-80, -222); g.lineTo(-120, -160); g.lineTo(-146, -160); g.closePath(); g.fill();
  // хромовый молдинг и бампера
  seg(g, [[-320, -100], [330, -100]], 5, CHROME); seg(g, [[-320, -100], [330, -100]], 1.5, '#ffffff');
  rr(g, 318, -70, 34, 22, 8); g.fillStyle = CHROME; g.fill(); rr(g, -350, -70, 34, 22, 8); g.fill();
  circle(g, 330, -118, 14, '#fff3c4'); glow(g, 334, -118, 40, '#fff3c4', 0.25); rr(g, -340, -128, 14, 20, 5); g.fillStyle = '#e04a3a'; g.fill();
  // дверные ручки и олень на капоте
  seg(g, [[-60, -138], [-36, -138]], 5, CHROME); seg(g, [[120, -138], [144, -138]], 5, CHROME);
  seg(g, [[268, -150], [290, -168], [300, -162]], 4, CHROME);
  // колёса с белыми боковинами
  for (const wx of [-215, 215]) {
    g.fillStyle = dark; g.beginPath(); g.arc(wx, -46, 66, Math.PI, 0); g.fill();
    circle(g, wx, -40, 54, '#121218'); ring(g, wx, -40, 34, 10, '#efece4'); circle(g, wx, -40, 24, CHROME);
    const r = drive ? t * 18 : 0; for (let k = 0; k < 3; k++) { const an = r + k * 2.09; seg(g, [[wx, -40], [wx + Math.cos(an) * 20, -40 + Math.sin(an) * 20]], 3, '#8a8e98'); }
  }
  g.restore();
}

// ── Волга спереди: кузов с вырезом под лобовое стекло (рисуется поверх героев)
function volgaFront(g, CX, M, o) {
  const top = 250, wsT = 290, wsB = 610, hood = 610;
  // кузов с дыркой под стекло
  g.save(); g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.moveTo(CX - 430, wsT); g.lineTo(CX + 430, wsT); g.lineTo(CX + 560, wsB); g.lineTo(CX - 560, wsB); g.closePath();
  g.clip('evenodd');
  // всё вокруг машины — фон уже нарисован; рисуем только кузов
  g.fillStyle = linGrad(g, 0, top, 0, 1000, [shade(CHERRY, 0.25), CHERRY, shade(CHERRY, -0.45)]);
  g.beginPath(); g.moveTo(CX - 470, wsT + 6); g.quadraticCurveTo(CX - 460, top - 20, CX - 330, top - 24); g.lineTo(CX + 330, top - 24); g.quadraticCurveTo(CX + 460, top - 20, CX + 470, wsT + 6);
  g.lineTo(CX + 610, wsB); g.quadraticCurveTo(CX + 720, wsB + 20, CX + 730, 760); g.lineTo(CX + 740, 940); g.lineTo(CX - 740, 940); g.lineTo(CX - 730, 760); g.quadraticCurveTo(CX - 720, wsB + 20, CX - 610, wsB); g.closePath(); g.fill();
  g.restore();
  // рамка стекла
  g.strokeStyle = shade(CHERRY, -0.5); g.lineWidth = 16; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(CX - 430, wsT); g.lineTo(CX + 430, wsT); g.lineTo(CX + 560, wsB); g.lineTo(CX - 560, wsB); g.closePath(); g.stroke();
  g.strokeStyle = CHROME; g.lineWidth = 4; g.stroke();
  // блик на стекле
  g.fillStyle = alpha('#ffffff', 0.07); poly(g, [[CX - 300, wsT + 10], [CX - 200, wsT + 10], [CX - 380, wsB - 10], [CX - 480, wsB - 10]], alpha('#ffffff', 0.07));
  poly(g, [[CX + 260, wsT + 10], [CX + 300, wsT + 10], [CX + 160, wsB - 10], [CX + 120, wsB - 10]], alpha('#ffffff', 0.05));
  // зеркало заднего вида
  rr(g, CX - 70, wsT + 8, 140, 34, 10); g.fillStyle = '#20232c'; g.fill(); rr(g, CX - 62, wsT + 14, 124, 22, 7); g.fillStyle = '#4a5068'; g.fill();
  // руль водителя (справа в кадре — левый руль)
  g.strokeStyle = '#1a1416'; g.lineWidth = 16; g.beginPath(); g.ellipse(CX + 250, wsB + 6, 120, 44, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
  // капот: рёбра и олень
  g.strokeStyle = alpha('#ffffff', 0.12); g.lineWidth = 6; g.beginPath(); g.moveTo(CX - 200, hood + 20); g.quadraticCurveTo(CX, hood + 4, CX + 200, hood + 20); g.stroke();
  seg(g, [[CX, hood + 70], [CX, hood + 150]], 8, CHROME); seg(g, [[CX - 14, hood + 74], [CX, hood + 46], [CX + 22, hood + 40]], 5, CHROME);
  // решётка «пасть кита» и фары
  g.save(); rr(g, CX - 400, 790, 800, 110, 50); g.fillStyle = '#16141a'; g.fill(); g.clip();
  for (let i = -12; i <= 12; i++) seg(g, [[CX + i * 32, 790], [CX + i * 32, 900]], 6, CHROME); g.restore();
  g.strokeStyle = CHROME; g.lineWidth = 8; rr(g, CX - 400, 790, 800, 110, 50); g.stroke();
  for (const sx of [-1, 1]) { const hx = CX + sx * 560; circle(g, hx, 770, 66, CHROME); circle(g, hx, 770, 54, o.lights ? '#fff6d2' : '#c9ccd4'); if (o.lights) glow(g, hx, 770, 220, '#fff3c4', 0.5); circle(g, hx - 14 * sx, 756, 14, alpha('#ffffff', 0.7)); }
  rr(g, CX - 760, 900, 1520, 46, 22); g.fillStyle = CHROME; g.fill(); seg(g, [[CX - 740, 912], [CX + 740, 912]], 3, '#ffffff');
  g.fillStyle = '#0d0d10'; g.fillRect(CX - 640, 940, 1280, 60);
  for (const sx of [-1, 1]) { rr(g, CX + sx * 560 - 90, 930, 180, 90, 20); g.fillStyle = '#0d0d10'; g.fill(); }
}

// ── салон Волги изнутри через лобовое стекло. o.bg: 'salon'|'waste'|'road'|'parad'…, o.ox — сдвиг машины, o.lights
export const CAR_K = 0.5, CAR_BASE = 905, SEAT_Y = 958; // сиденье ниже, чтобы головы были в окне при маленькой машине
export const carGY = () => CAR_BASE - (946 - SEAT_Y) * CAR_K;
export function volga(g, t, cam, o = {}) {
  const CX = E.W / 2, ox = o.ox || 0;
  const bgFn = { salon, waste, road, room, kitchen, parad, void: void_ }[o.bg || 'salon'] || salon;
  const r = bgFn(g, t, cam, { ...(o.bgo || {}), noCar: true, empty: true });
  const M = r.M;
  const tf = (g) => { g.translate(CX + ox, CAR_BASE); g.scale(CAR_K, CAR_K); g.translate(-CX, -946); };
  // кабина: тёмный интерьер за стеклом, заднее стекло открывает фон
  layer(g, cam, 1, (g) => {
    g.save(); tf(g);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(CX, 1010, 820, 50, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(CX - 430, 290); g.lineTo(CX + 430, 290); g.lineTo(CX + 560, 610); g.lineTo(CX - 560, 610); g.closePath();
    g.moveTo(CX - 330, 330); g.lineTo(CX - 330, 470); g.quadraticCurveTo(CX, 490, CX + 330, 470); g.lineTo(CX + 330, 330); g.quadraticCurveTo(CX, 310, CX - 330, 330); g.closePath();
    g.fillStyle = alpha('#1c0f13', 0.92); g.fill('evenodd');
    for (const sx of [-1, 1]) { rr(g, CX + sx * 200 - 110, 430, 220, 200, 50); g.fillStyle = '#5a1620'; g.fill(); seg(g, [[CX + sx * 200 - 60, 460], [CX + sx * 200 - 60, 600]], 3, alpha('#000000', 0.25)); seg(g, [[CX + sx * 200 + 60, 460], [CX + sx * 200 + 60, 600]], 3, alpha('#000000', 0.25)); }
    if (o.dent) { g.fillStyle = alpha('#000000', 0.35); g.beginPath(); g.ellipse(CX - 200, 560, 70, 18, 0, 0, 7); g.fill(); }
    g.restore();
  });
  const fg = (g) => layer(g, cam, 1, (g) => { g.save(); tf(g); volgaFront(g, CX, M, o); g.restore(); });
  return { GY: carGY(), CX, M, fg };
}

// ── крыша гаражей ночью
export function roof(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 160 }); FX.moon(g, CX + 520, 200, 46); });
  layer(g, cam, 0.25, (g) => {
    FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, minH: 120, maxH: 420, color: mix(M.sky[0], '#05060c', 0.6), windowColor: alpha('#ffd59a', 0.6), lit: 0.35, seed: 12 });
  });
  layer(g, cam, 0.6, (g) => { for (let i = -6; i < 8; i++) FX.tree(g, CX + i * 260 + 40, GY - 40, 1.4, mix(M.dark, '#000', 0.4)); });
  layer(g, cam, 0.9, (g) => {
    // крыши гаражей: ряд, рубероид
    g.fillStyle = '#2a2830'; g.fillRect(-E.W * 2, GY, E.W * 5, 30);
    g.fillStyle = linGrad(g, 0, GY + 30, 0, E.H, ['#4a4452', '#26222c']); g.fillRect(-E.W * 2, GY + 30, E.W * 5, E.H);
    for (let i = -10; i < 12; i++) { const x = CX + i * 300; seg(g, [[x, GY], [x, E.H + 20]], 6, '#1a1820'); rr(g, x + 40, GY + 80, 220, 240, 6); g.fillStyle = '#5a4e4a'; g.fill(); for (let k = 0; k < 10; k++) seg(g, [[x + 50 + k * 22, GY + 84], [x + 50 + k * 22, GY + 316]], 3, alpha('#000', 0.2)); }
    glow(g, CX, GY - 10, 500, '#ffd59a', 0.06);
  });
  return { GY, CX, M };
}

// ── пустырь на рассвете (девять лет назад тут ничего не было)
export function waste(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX + 420, GY - 120, 70, '#fff3d0', '#ffb070', 5); FX.clouds(g, { count: 5, y: E.H * 0.18, color: '#ffd8b0' }); });
  layer(g, cam, 0.25, (g) => {
    FX.hills(g, { y: GY - 70, amp: 40, color: mix(M.sky[0], '#2a2030', 0.5) });
    // стройка и кран
    const kx = CX - 520; g.fillStyle = mix(M.sky[0], '#1a1420', 0.6);
    for (let i = 0; i < 14; i++) { seg(g, [[kx + 120, GY - 60 - i * 40], [kx + 140, GY - 100 - i * 40]], 3, g.fillStyle); }
    seg(g, [[kx + 120, GY - 60], [kx + 120, GY - 640]], 12, g.fillStyle); seg(g, [[kx - 160, GY - 620], [kx + 560, GY - 620]], 10, g.fillStyle); seg(g, [[kx + 420, GY - 620], [kx + 420, GY - 420]], 3, g.fillStyle);
    rr(g, kx + 300, GY - 260, 340, 200, 4); g.fill(); for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { g.fillStyle = alpha('#000', 0.3); g.fillRect(kx + 320 + j * 52, GY - 240 + i * 46, 30, 28); } g.fillStyle = mix(M.sky[0], '#1a1420', 0.6);
  });
  layer(g, cam, 0.6, (g) => {
    // ржавый забор
    for (let i = -8; i < 10; i++) { const x = CX + i * 180; rr(g, x, GY - 230, 170, 200, 4); g.fillStyle = i % 3 ? '#7a4a34' : '#8a5a3a'; g.fill(); for (let k = 0; k < 6; k++) seg(g, [[x + 12 + k * 28, GY - 226], [x + 12 + k * 28, GY - 34]], 4, alpha('#000', 0.2)); g.fillStyle = alpha('#c0703a', 0.4); g.fillRect(x + 30, GY - 120, 50, 40); }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#6a5a4a', '#3a2e2a']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H);
    // бурьян
    for (let i = -40; i < 60; i++) { const x = CX + i * 41 + ((i * 37) % 17), h = 40 + ((i * 53) % 60); const sw = Math.sin(t * 1.5 + i) * 6;
      seg(g, [[x, GY + 10], [x + sw, GY - h]], 4, '#4a5a34'); seg(g, [[x + 8, GY + 10], [x + 14 + sw, GY - h * 0.7]], 3, '#5a6a3a'); }
    FX.pool(g, CX + 300, GY + 30, 700, 60, '#ffb070', 0.15);
  });
  return { GY, CX, M };
}

// ── трасса: дорога, столбы и деревья бегут мимо
export function road(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2, sp = o.speed ?? 900;
  layer(g, cam, 0.05, (g) => { backdrop(g, M.sky); FX.clouds(g, { count: 6, y: E.H * 0.16, color: '#ffffff' }); if (o.sun) FX.sun(g, CX - 500, 220, 60); });
  layer(g, cam, 0.2, (g) => { FX.hills(g, { y: GY - 160, amp: 50, color: mix(M.grass, M.sky[0], 0.4) }); });
  layer(g, cam, 0.5, (g) => {
    const off = (t * sp * 0.35) % 260; for (let i = -6; i < 12; i++) FX.pine(g, -off + i * 260, GY - 40, 1.2 + ((i * 7) % 3) * 0.15, mix(M.grass, '#102010', 0.55));
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = M.grass; g.fillRect(-E.W * 2, GY - 40, E.W * 5, 40);
    g.fillStyle = '#4a4650'; g.fillRect(-E.W * 2, GY, E.W * 5, E.H);
    const off = (t * sp) % 240; for (let i = -2; i < 14; i++) rr(g, -off + i * 240, GY + 110, 130, 14, 7), (g.fillStyle = '#f4efe6'), g.fill();
    const po = (t * sp * 0.8) % 700; for (let i = -1; i < 5; i++) { const x = -po + i * 700; seg(g, [[x, GY - 10], [x, GY - 330]], 8, '#3a3a44'); seg(g, [[x - 40, GY - 320], [x + 40, GY - 320]], 6, '#3a3a44'); }
    if (o.sign) { const sx = ((-(t * sp * 0.8) % 2800) + 2800) % 2800 - 400; rr(g, sx, GY - 330, 300, 120, 10); g.fillStyle = '#2a6aa0'; g.fill(); text(g, o.sign, sx + 150, GY - 270, { size: 40, font: FONTS.ui, weight: 900, color: '#ffffff' }); seg(g, [[sx + 150, GY - 210], [sx + 150, GY - 10]], 8, '#3a3a44'); }
  });
  return { GY, CX, M };
}

// ── школьный класс 7 «Б»
export function school(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    wall(g, { ...M, wall: '#8aa08a' }, GY, 0.05);
    rr(g, CX - 420, GY - 640, 840, 320, 10); g.fillStyle = '#5a3a24'; g.fill(); rr(g, CX - 400, GY - 622, 800, 284, 6); g.fillStyle = '#2f5a44'; g.fill();
    text(g, o.board || '7 «Б»', CX - 200, GY - 520, { size: 72, font: FONTS.serif, italic: true, weight: 900, color: alpha('#f4efe6', 0.85) });
    text(g, '1 сентября', CX + 130, GY - 420, { size: 44, font: FONTS.serif, italic: true, weight: 900, color: alpha('#f4efe6', 0.6) });
    for (const sx of [-1, 1]) FX.windowFrame(g, { x: CX + sx * 760 - 150, y: GY - 640, w: 300, h: 340, cols: 2, frame: '#e8e2d4', bar: 10 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); });
    seg(g, [[-E.W, GY - 200], [E.W * 2, GY - 200]], 8, '#6a806a');
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, ['#8a6a4a', '#4a3424']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000', 0.2), 0.07); FX.pool(g, CX, GY + 20, 600, 60, M.practical, 0.15); });
  return { GY, CX, M };
}
export function desk(g, x, GY, w = 300) {
  rr(g, x - w / 2, GY - 140, w, 18, 6); g.fillStyle = '#c9a86a'; g.fill(); g.fillStyle = '#3a5a7a'; g.fillRect(x - w / 2 + 10, GY - 122, w - 20, 60);
  seg(g, [[x - w / 2 + 20, GY - 62], [x - w / 2 + 20, GY]], 8, '#2a2a34'); seg(g, [[x + w / 2 - 20, GY - 62], [x + w / 2 - 20, GY]], 8, '#2a2a34');
}

// ── питерская парадная: жёлтый фасад, деревянная дверь, домофон с котом, трещины на ступенях
export function parad(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#e8c27a', '#d8a85a', '#a87a3a']); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    for (let i = -4; i <= 4; i++) { if (i === 0) continue; const wx = CX + i * 340; rr(g, wx - 90, GY - 720, 180, 270, 8); g.fillStyle = '#f4efe6'; g.fill(); g.fillStyle = linGrad(g, 0, GY - 710, 0, GY - 460, ['#5a7090', '#2a3040']); g.fillRect(wx - 78, GY - 708, 156, 246); seg(g, [[wx, GY - 708], [wx, GY - 462]], 8, '#f4efe6'); seg(g, [[wx - 78, GY - 600], [wx + 78, GY - 600]], 8, '#f4efe6'); g.fillStyle = '#c8985a'; g.fillRect(wx - 110, GY - 444, 220, 20); }
    seg(g, [[-E.W * 2, GY - 820], [E.W * 3, GY - 820]], 18, '#f4e6c8');
    // арка-дверь
    g.fillStyle = '#f4e6c8'; g.beginPath(); g.moveTo(CX - 170, GY - 60); g.lineTo(CX - 170, GY - 420); g.arc(CX, GY - 420, 170, Math.PI, 0); g.lineTo(CX + 170, GY - 60); g.closePath(); g.fill();
    g.fillStyle = '#5a3424'; g.beginPath(); g.moveTo(CX - 140, GY - 60); g.lineTo(CX - 140, GY - 420); g.arc(CX, GY - 420, 140, Math.PI, 0); g.lineTo(CX + 140, GY - 60); g.closePath(); g.fill();
    seg(g, [[CX, GY - 560], [CX, GY - 60]], 6, '#3a2018'); for (const dx of [-70, 70]) { rr(g, CX + dx - 50, GY - 400, 100, 140, 6); g.strokeStyle = '#3a2018'; g.lineWidth = 5; g.stroke(); rr(g, CX + dx - 50, GY - 230, 100, 140, 6); g.stroke(); }
    // домофон с наклейкой-котом
    rr(g, CX + 200, GY - 300, 70, 110, 8); g.fillStyle = '#9aa0aa'; g.fill(); for (let i = 0; i < 9; i++) circle(g, CX + 218 + (i % 3) * 17, GY - 262 + Math.floor(i / 3) * 17, 5, '#3a3a44');
    circle(g, CX + 235, GY - 282, 9, '#141416'); poly(g, [[CX + 227, GY - 288], [CX + 229, GY - 298], [CX + 234, GY - 289]], '#141416'); poly(g, [[CX + 236, GY - 289], [CX + 241, GY - 298], [CX + 243, GY - 288]], '#141416');
    // ступени с трещинами
    for (let i = 0; i < 3; i++) { rr(g, CX - 260 + i * 30, GY - 60 + i * 20, 520 - i * 60, 24, 4); g.fillStyle = shade('#9a948a', -i * 0.08); g.fill(); }
    seg(g, [[CX - 120, GY - 58], [CX - 100, GY - 46], [CX - 112, GY - 36]], 2.5, '#4a4640'); seg(g, [[CX + 90, GY - 38], [CX + 110, GY - 26], [CX + 104, GY - 16]], 2.5, '#4a4640');
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#6a6670', '#3a3640']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H); FX.pool(g, CX, GY + 20, 600, 60, '#ffe2a8', 0.15); });
  return { GY, CX, M };
}
