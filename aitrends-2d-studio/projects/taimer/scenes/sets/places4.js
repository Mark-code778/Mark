// sets/places4.js — декорации «Детского сада»: группа (кроватки / столики), туалет с низким зеркалом,
// коридор с календарём, площадка с забором и калиткой (в т.ч. в дыму), квартира 2010 года, прихожая,
// площадка подержанных машин, поликлиника. Всё якорится к GY и CX.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { car } from './salon.js';

const ground = () => E.H * V(0.8, 0.68);
// дымное лето 2010: оранжево-серое небо, тусклое солнце-апельсин
export const SMOKE = { sky: ['#b08a6a', '#d8a070', '#e8b884'], ambient: '#6a5a50', key: '#ffb070', rim: '#ffc68a', practical: '#ffd59a', fog: '#c8a080' };
const MD = (o, def) => { const M = mood(o.mood || def); return o.smoke ? { ...M, ...SMOKE } : M; };
function paintWall(g, GY, c, k = 0) { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(c, -0.12 + k), shade(c, k), shade(c, -0.22 + k)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H); }
function floor(g, M, GY, c) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(c || M.floor, -0.02), shade(c || M.dark, -0.2)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.18), 0.07); }
function sky(g, M, x, y, w, h, o = {}) {
  g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
  if (o.smoke) { circle(g, x + w * 0.65, y + h * 0.35, Math.min(w, h) * 0.12, '#ff8a3a'); glow(g, x + w * 0.65, y + h * 0.35, Math.min(w, h) * 0.4, '#ff9a4a', 0.35); g.fillStyle = alpha('#c8a080', 0.55); g.fillRect(x, y, w, h); }
  else if (o.night) { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#141a34', '#2a2a50']); g.fillRect(x, y, w, h); circle(g, x + w * 0.7, y + h * 0.3, 18, '#f4ecd0'); }
  else FX.sun(g, x + w * 0.7, y + h * 0.3, 30, '#fff6e2', M.key, 3);
  FX.skyline(g, { x, y: y + h, w, maxH: h * 0.4, color: alpha(o.smoke ? '#8a6a5a' : '#6a7090', 0.75), seed: 5 });
}
// детская кроватка с одеялом в утятах
export function kidBed(g, x, GY, o = {}) {
  const k = o.s ?? 1.25; g.save(); g.translate(x, GY); g.scale(k, k); g.translate(-x, -GY);
  const w = 230, c = o.c || '#f2d26a';
  g.fillStyle = '#c9a070'; g.fillRect(x - w / 2, GY - 92, 14, 92); g.fillRect(x + w / 2 - 14, GY - 120, 14, 120);
  rr(g, x - w / 2, GY - 70, w, 34, 8); g.fillStyle = '#e8e2d4'; g.fill();
  rr(g, x - w / 2 + 40, GY - 86, w - 54, 30, 12); g.fillStyle = c; g.fill();
  if (!o.plain) for (let i = 0; i < 3; i++) { const dx = x - w / 2 + 70 + i * 52, dy = GY - 72; circle(g, dx, dy, 9, '#ffe05a'); poly(g, [[dx + 8, dy - 2], [dx + 15, dy], [dx + 8, dy + 3]], '#f29a2a'); }
  rr(g, x + w / 2 - 70, GY - 98, 56, 28, 12); g.fillStyle = '#ffffff'; g.fill(); g.restore();
}
export function kidTable(g, x, GY, c = '#f2b84a') { rr(g, x - 150, GY - 92, 300, 18, 6); g.fillStyle = c; g.fill(); for (const dx of [-130, 130]) seg(g, [[x + dx, GY - 76], [x + dx, GY - 2]], 8, shade(c, -0.35)); }
export function kidChair(g, x, GY, c = '#5aa0d0') { seg(g, [[x - 22, GY], [x - 22, GY - 50], [x + 22, GY - 50], [x + 22, GY]], 6, shade(c, -0.3)); rr(g, x - 26, GY - 54, 52, 10, 4); g.fillStyle = c; g.fill(); rr(g, x + 14, GY - 110, 12, 60, 4); g.fill(); }

// ── группа детского сада
export function group(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2, wc = o.night ? '#5a6280' : '#efe2a8';
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, wc, o.smoke ? -0.08 : 0);
    g.fillStyle = alpha(o.night ? '#3a4a70' : '#9fd0a0', 0.6); g.fillRect(-E.W * 2, GY - 230, E.W * 5, 230); seg(g, [[-E.W * 2, GY - 230], [E.W * 3, GY - 230]], 6, shade(wc, -0.3));
    for (const wx of [-560, 140]) FX.windowFrame(g, { x: CX + wx, y: GY - V(640, 1000), w: 360, h: 300, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => {
      sky(g, M, x, y, w, h, { smoke: o.smoke, night: o.night });
      if (o.sheets) { g.fillStyle = alpha('#f4f1ea', 0.75); g.fillRect(x, y, w, h); for (let i = 0; i < 5; i++) seg(g, [[x + i * 80 + 20, y], [x + i * 80 + 30, y + h]], 3, alpha('#c9ccd4', 0.6)); }
    });
    // бумажные снежинки на потолке
    if (o.flakes !== false) for (let i = 0; i < 9; i++) { const fx = CX - 800 + i * 200, fy = GY - V(760, 1150) + (i % 2) * 40; seg(g, [[fx, fy - 60], [fx, fy - 20]], 1.5, alpha('#ffffff', 0.6)); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; seg(g, [[fx - Math.cos(a) * 18, fy - Math.sin(a) * 18], [fx + Math.cos(a) * 18, fy + Math.sin(a) * 18]], 4, '#ffffff'); } }
    // полка с игрушками
    const sx = CX + (o.shelfX ?? 620); rr(g, sx - 120, GY - 330, 240, 300, 8); g.fillStyle = '#c9a070'; g.fill();
    for (let r = 0; r < 2; r++) { seg(g, [[sx - 110, GY - 220 + r * 110], [sx + 110, GY - 220 + r * 110]], 6, '#8a6a44'); }
    rr(g, sx - 90, GY - 300, 50, 50, 8); g.fillStyle = '#e04a3a'; g.fill(); circle(g, sx + 10, GY - 270, 28, '#3a6ea5'); rr(g, sx + 50, GY - 300, 40, 50, 6); g.fillStyle = '#f2c21a'; g.fill();
    circle(g, sx - 50, GY - 160, 30, '#a0c050'); rr(g, sx + 10, GY - 190, 70, 40, 6); g.fillStyle = '#8a5ad6'; g.fill();
    // детские рисунки
    const cols = ['#f29ac0', '#8fd0f2', '#f2b84a', '#9fd8a8'];
    for (let i = 0; i < 4; i++) { const px = CX - 260 + i * 120, py = GY - V(420, 760); rr(g, px, py, 90, 70, 3); g.fillStyle = '#fbf8f1'; g.fill(); circle(g, px + 30, py + 30, 14, cols[i]); seg(g, [[px + 50, py + 50], [px + 80, py + 20]], 4, cols[(i + 2) % 4]); }
  });
  layer(g, cam, 0.8, (g) => {
    if (o.beds) for (let i = -3; i <= 3; i++) if (!(o.gap != null && i === o.gap)) kidBed(g, CX + i * 330, GY + 4, { c: ['#f2d26a', '#9fd8e8', '#f2b0c8', '#b8e0a0'][(i + 9) % 4], plain: i !== 0 });
    if (o.tables) for (const tx of [-420, 420]) { kidTable(g, CX + tx, GY, tx < 0 ? '#f2b84a' : '#9fd8a8'); }
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, '#a87a5a'); FX.pool(g, CX, GY + 30, 600, 60, M.key, 0.14); });
  return { GY, CX, M };
}

// ── туалет детского сада: плитка, низкие раковины и низкое зеркало
export function wash(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#cfe4ea');
    g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 2; for (let y = GY; y > -E.H; y -= 60) { g.beginPath(); g.moveTo(-E.W * 2, y); g.lineTo(E.W * 3, y); g.stroke(); } for (let x = -E.W * 2; x < E.W * 3; x += 60) { g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, GY); g.stroke(); }
    for (const dx of [-420, 0, 420]) { const x = CX + dx; rr(g, x - 70, GY - 230, 140, 40, 14); g.fillStyle = '#ffffff'; g.fill(); seg(g, [[x, GY - 190], [x, GY]], 14, '#e8ecf0'); seg(g, [[x - 6, GY - 230], [x - 6, GY - 262], [x + 22, GY - 262]], 6, '#b8bcc4');
      rr(g, x - 80, GY - 470, 160, 200, 10); g.fillStyle = '#d9dde4'; g.fill(); rr(g, x - 70, GY - 460, 140, 180, 6); g.fillStyle = linGrad(g, 0, GY - 460, 0, GY - 280, ['#e8f4fa', '#a8c8d8']); g.fill(); seg(g, [[x - 40, GY - 440], [x + 10, GY - 400]], 6, alpha('#ffffff', 0.7)); }
    // шкафчики с картинками
    for (let i = 0; i < 4; i++) { const x = CX + 640 + i * 110; rr(g, x, GY - 300, 100, 300, 6); g.fillStyle = ['#f2b84a', '#9fd8a8', '#8fd0f2', '#f29ac0'][i]; g.fill(); circle(g, x + 50, GY - 250, 22, '#ffffff'); }
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, '#8aa0a8'); });
  return { GY, CX, M };
}

// ── коридор: календарь с котятами, вешалки, шкафчики
export function corridor(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#e8d0a8'); g.fillStyle = alpha('#b07a4a', 0.5); g.fillRect(-E.W * 2, GY - 200, E.W * 5, 200);
    for (let i = -6; i <= 6; i++) { const x = CX + i * 120; if (Math.abs(x - CX - (o.calX ?? 0)) < 220) continue; rr(g, x - 50, GY - 320, 100, 320, 6); g.fillStyle = ['#f2b84a', '#9fd8a8', '#8fd0f2', '#f29ac0', '#c9a7e8'][(i + 10) % 5]; g.fill(); circle(g, x, GY - 270, 20, '#ffffff'); seg(g, [[x + 30, GY - 180], [x + 30, GY - 140]], 6, '#7a5a3a'); }
    const cx = CX + (o.calX ?? 0); rr(g, cx - 130, GY - V(640, 1000), 260, 330, 6); g.fillStyle = '#fbf8f1'; g.fill(); seg(g, [[cx - 20, GY - V(650, 1010)], [cx + 20, GY - V(650, 1010)]], 6, '#c0453a');
    const ky = GY - V(560, 920); circle(g, cx - 30, ky, 34, '#f2b06a'); circle(g, cx + 40, ky + 6, 30, '#9aa0aa'); for (const [ex, ey] of [[-30, ky], [40, ky + 6]]) { poly(g, [[cx + ex - 26, ey - 18], [cx + ex - 18, ey - 46], [cx + ex - 6, ey - 26]], ex < 0 ? '#f2b06a' : '#9aa0aa'); poly(g, [[cx + ex + 6, ey - 26], [cx + ex + 18, ey - 46], [cx + ex + 26, ey - 18]], ex < 0 ? '#f2b06a' : '#9aa0aa'); circle(g, cx + ex - 9, ey - 2, 4, '#141414'); circle(g, cx + ex + 9, ey - 2, 4, '#141414'); }
    text(g, 'ИЮНЬ', cx, GY - V(470, 830), { size: 40, font: FONTS.ui, weight: 900, color: '#c0453a' }); text(g, '2010', cx, GY - V(425, 785), { size: 34, font: FONTS.ui, weight: 900, color: '#3a3a44' });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) rr(g, cx - 112 + c * 32, GY - V(395, 755) + r * 30, 26, 22, 3), g.fillStyle = alpha('#3a3a44', 0.15), g.fill();
  });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#a87a5a'));
  return { GY, CX, M };
}

// ── площадка детского сада: забор, калитка, песочница, грибок, качели. o.smoke — оранжевый дым
export function yard(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); if (o.smoke) { circle(g, CX + 380, GY - V(760, 1150), 70, '#ff8a3a'); glow(g, CX + 380, GY - V(760, 1150), 300, '#ff9a4a', 0.4); } else FX.sun(g, CX + 380, GY - V(760, 1150), 50, '#fff6e2', M.key, 4); });
  layer(g, cam, 0.3, (g) => { FX.skyline(g, { x: -E.W, y: GY - 160, w: E.W * 3, maxH: V(360, 620), color: o.smoke ? alpha('#8a6a5a', 0.55) : alpha('#6a7a9a', 0.7), seed: 9 }); });
  layer(g, cam, 0.5, (g) => {
    for (let i = -6; i <= 6; i++) FX.tree(g, CX + i * 300 + 80, GY - 120, 1.6, o.smoke ? '#5a5a3a' : '#3a6a3a');
    // здание садика
    rr(g, CX - 900, GY - 520, 700, 520, 6); g.fillStyle = '#e8c8a0'; g.fill(); for (let i = 0; i < 4; i++) { rr(g, CX - 860 + i * 170, GY - 460, 120, 120, 4); g.fillStyle = o.smoke ? '#c9b8a8' : '#bfe0f4'; g.fill(); }
    text(g, 'ДЕТСКИЙ САД «СОЛНЫШКО»', CX - 550, GY - 290, { size: 30, font: FONTS.ui, weight: 900, color: '#c0453a' });
  });
  layer(g, cam, 0.8, (g) => {
    // песочница, грибок, качели
    const sx = CX + (o.boxX ?? -360); rr(g, sx - 140, GY - 40, 280, 40, 6); g.fillStyle = '#c9a070'; g.fill(); g.fillStyle = '#f2d8a0'; g.fillRect(sx - 130, GY - 36, 260, 14);
    seg(g, [[sx, GY - 40], [sx, GY - 230]], 12, '#c9a070'); g.fillStyle = '#e04a3a'; g.beginPath(); g.ellipse(sx, GY - 230, 170, 70, 0, Math.PI, Math.PI * 2); g.fill(); for (let i = 0; i < 5; i++) circle(g, sx - 110 + i * 55, GY - 262 + (i % 2) * 18, 12, '#ffffff');
    if (!o.noSwing) { const kx = CX + (o.swingX ?? 160); seg(g, [[kx - 120, GY], [kx - 90, GY - 300], [kx + 90, GY - 300], [kx + 120, GY]], 10, '#3a6ea5'); const sw = Math.sin(t * 1.4) * 0.2; for (const dx of [-30, 30]) seg(g, [[kx + dx, GY - 300], [kx + dx + Math.sin(sw) * 200, GY - 110]], 3, '#5a5e68'); rr(g, kx - 40 + Math.sin(sw) * 200, GY - 116, 80, 12, 4); g.fillStyle = '#e8c070'; g.fill(); }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 400, o.smoke ? ['#8a8a5a', '#5a5a3a'] : ['#7ab060', '#4a7a40']); g.fillRect(-E.W * 2, GY - 6, E.W * 5, E.H);
    // забор с калиткой
    const fx = CX + (o.fenceX ?? 520), gate = o.gate ?? 0;
    for (let x = -E.W; x < E.W * 2.2; x += 44) { const ax = x; if (ax > fx - 110 && ax < fx + 110) continue; if (o.fence === false) break; seg(g, [[ax, GY + 30], [ax, GY - 190]], 8, '#3a8a5a'); }
    if (o.fence !== false) { seg(g, [[-E.W, GY - 150], [fx - 110, GY - 150]], 8, '#3a8a5a'); seg(g, [[fx + 110, GY - 150], [E.W * 2.2, GY - 150]], 8, '#3a8a5a'); seg(g, [[-E.W, GY - 40], [fx - 110, GY - 40]], 8, '#3a8a5a'); seg(g, [[fx + 110, GY - 40], [E.W * 2.2, GY - 40]], 8, '#3a8a5a');
      seg(g, [[fx - 110, GY + 30], [fx - 110, GY - 230]], 14, '#2a6a4a'); seg(g, [[fx + 110, GY + 30], [fx + 110, GY - 230]], 14, '#2a6a4a');
      g.save(); g.translate(fx - 104, 0); g.scale(1 - 0.85 * gate, 1); for (let x = 10; x < 210; x += 40) seg(g, [[x, GY + 20], [x, GY - 200]], 7, '#4aa06a'); seg(g, [[0, GY - 150], [210, GY - 150]], 7, '#4aa06a'); seg(g, [[0, GY - 40], [210, GY - 40]], 7, '#4aa06a'); g.restore(); }
  });
  return { GY, CX, M };
}

// ── квартира 2010: ковёр на стене, сервант, телевизор-«пузатик», диван
export function flat(g, t, cam, o = {}) {
  const M = MD(o, o.night ? 'night' : 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, o.night ? '#4a4a6a' : '#c8b08a');
    for (let x = -E.W * 2; x < E.W * 3; x += 80) seg(g, [[x, -E.H], [x, GY]], 2, alpha('#ffffff', 0.08));
    // ковёр на стене
    const kx = CX + (o.rugX ?? -260); rr(g, kx - 280, GY - V(720, 1060), 560, 380, 8); g.fillStyle = '#8a2a2a'; g.fill(); rr(g, kx - 250, GY - V(690, 1030), 500, 320, 6); g.strokeStyle = '#e8b04a'; g.lineWidth = 6; g.stroke();
    for (let i = 0; i < 3; i++) { g.save(); g.translate(kx - 160 + i * 160, GY - V(530, 870)); g.rotate(Math.PI / 4); rr(g, -50, -50, 100, 100, 6); g.fillStyle = ['#1a3a6a', '#e8b04a', '#1a3a6a'][i]; g.fill(); g.restore(); }
    // окно
    FX.windowFrame(g, { x: CX + 420, y: GY - V(660, 1000), w: 320, h: 300, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { smoke: o.smoke, night: o.night }));
    // телевизор
    if (o.tv !== false) { const tx = CX + (o.tvX ?? 140); rr(g, tx - 150, GY - 140, 300, 140, 6); g.fillStyle = '#6a4a30'; g.fill(); rr(g, tx - 130, GY - 380, 260, 220, 30); g.fillStyle = '#2a2a30'; g.fill(); rr(g, tx - 110, GY - 360, 190, 170, 24);
      g.fillStyle = o.tv === 'football' ? '#3a9a4a' : o.tv === 'cartoon' ? '#8fd0f2' : '#2a3a5a'; g.fill();
      if (o.tv === 'football') { seg(g, [[tx - 15, GY - 360], [tx - 15, GY - 190]], 3, '#ffffff'); ring(g, tx - 15, GY - 275, 30, 3, '#ffffff'); for (let i = 0; i < 6; i++) circle(g, tx - 90 + ((i * 47 + t * 30) % 170), GY - 330 + (i * 37) % 120, 5, i % 2 ? '#e04a3a' : '#f29a2a'); }
      if (o.tv === 'cartoon') { circle(g, tx - 40, GY - 280, 34, '#f2c21a'); circle(g, tx + 20, GY - 260 + Math.sin(t * 5) * 10, 24, '#e04a3a'); }
      glow(g, tx - 15, GY - 275, 260, o.tv === 'football' ? '#6aff8a' : '#9fd0ff', 0.12); circle(g, tx + 100, GY - 330, 8, '#9aa0aa'); circle(g, tx + 100, GY - 300, 8, '#9aa0aa'); }
  });
  layer(g, cam, 0.8, (g) => {
    if (o.sofa !== false) { const sx = CX + (o.sofaX ?? -260), c = '#7a5a3a'; rr(g, sx - 240, GY - 180, 480, 110, 24); g.fillStyle = shade(c, -0.15); g.fill(); rr(g, sx - 260, GY - 100, 520, 84, 20); g.fillStyle = c; g.fill(); for (const ax of [-260, 220]) { rr(g, sx + ax, GY - 140, 40, 124, 16); g.fillStyle = shade(c, -0.1); g.fill(); } }
    g.fillStyle = alpha('#c87a4a', 0.4); g.beginPath(); g.ellipse(CX, GY + 40, 520, 50, 0, 0, Math.PI * 2); g.fill();
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, '#7a5034'); FX.pool(g, CX, GY + 30, 500, 60, M.practical, 0.16); });
  return { GY, CX, M };
}

// ── прихожая 2010: входная дверь, вешалка, зеркало, обувь
export function hall(g, t, cam, o = {}) {
  const M = MD(o, 'interiorWarm'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#b89a70'); for (let x = -E.W * 2; x < E.W * 3; x += 60) seg(g, [[x, -E.H], [x, GY]], 3, alpha('#8a6a44', 0.25));
    const dx = CX + (o.doorX ?? 420); FX.door(g, { x: dx, y: GY, w: 190, h: V(420, 500), color: '#6a4a30', open: o.open ?? 0, light: '#ffe2b0' }); circle(g, dx + 160, GY - 210, 8, '#e8c070');
    const hx = CX - 520; seg(g, [[hx - 140, GY - 470], [hx + 140, GY - 470]], 12, '#6a4a30'); for (let i = 0; i < 4; i++) seg(g, [[hx - 110 + i * 70, GY - 470], [hx - 110 + i * 70, GY - 440]], 6, '#3a2a20');
    rr(g, hx - 120, GY - 440, 80, 190, 30); g.fillStyle = '#3a5a7a'; g.fill(); rr(g, hx + 10, GY - 440, 90, 160, 30); g.fillStyle = '#7a4a3a'; g.fill();
    rr(g, CX - 160, GY - V(560, 900), 160, 240, 60); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, CX - 150, GY - V(550, 890), 140, 220, 54); g.fillStyle = linGrad(g, 0, GY - 550, 0, GY - 330, ['#e8f4fa', '#9ab8c8']); g.fill();
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, '#6a4a34'); for (let i = 0; i < 4; i++) { rr(g, CX - 640 + i * 70, GY + 6, 56, 22, 10); g.fillStyle = ['#3a3a44', '#c0453a', '#3a3a44', '#f2b84a'][i]; g.fill(); } });
  return { GY, CX, M };
}

// ── площадка подержанных машин на окраине: флажки, будка, «десятки»
export function lot(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); if (!o.smoke) FX.sun(g, CX + 500, GY - V(760, 1150), 50, '#fff6e2', M.key, 4); });
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, maxH: V(260, 520), color: alpha('#7a809a', 0.6), seed: 13 }));
  layer(g, cam, 0.5, (g) => {
    const bx = CX - 640; rr(g, bx - 150, GY - 300, 300, 300, 6); g.fillStyle = '#e8e2d4'; g.fill(); rr(g, bx - 110, GY - 240, 120, 90, 4); g.fillStyle = '#9fc8e8'; g.fill();
    rr(g, bx - 180, GY - 380, 360, 70, 6); g.fillStyle = '#c0453a'; g.fill(); text(g, 'АВТО С ПРОБЕГОМ', bx, GY - 345, { size: 34, font: FONTS.ui, weight: 900, color: '#ffffff' });
    seg(g, [[-E.W, GY - 420], [E.W * 2, GY - 380]], 3, '#5a5e68'); for (let i = 0; i < 40; i++) { const x = -E.W + i * 110, y = GY - 420 + (i * 110) * 40 / (E.W * 3); poly(g, [[x, y], [x + 40, y], [x + 20, y + 40]], ['#e04a3a', '#f2c21a', '#3a6ea5', '#3fb950'][i % 4]); }
  });
  layer(g, cam, 0.8, (g) => { for (const [x, c] of o.cars || [[160, '#c9ccd4'], [700, '#3a5a8a']]) car(g, CX + x, GY + 8, { color: c, s: 0.85, dir: -1, M }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 10, 0, GY + 400, ['#7a7480', '#4a4650']); g.fillRect(-E.W * 2, GY - 6, E.W * 5, E.H); });
  return { GY, CX, M };
}

// ── поликлиника: зелёная панель, кушетка, плакат, стол врача
export function clinic(g, t, cam, o = {}) {
  const M = MD(o, 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    paintWall(g, GY, '#e8ecea'); g.fillStyle = '#7aa890'; g.fillRect(-E.W * 2, GY - 300, E.W * 5, 300);
    rr(g, CX - 520, GY - V(640, 980), 220, 300, 6); g.fillStyle = '#fbf8f1'; g.fill(); text(g, o.poster?.[0] || 'ЖАРА!', CX - 410, GY - V(590, 930), { size: 40, font: FONTS.ui, weight: 900, color: '#c0453a' }); text(g, o.poster?.[1] || 'пейте воду', CX - 410, GY - V(540, 880), { size: 26, font: FONTS.ui, weight: 800, color: '#3a3a44' }); circle(g, CX - 410, GY - V(440, 780), 50, '#8fd0f2');
    FX.windowFrame(g, { x: CX + 300, y: GY - V(640, 980), w: 320, h: 280, cols: 2, frame: '#f4f1ea', bar: 10 }, (g, x, y, w, h) => sky(g, M, x, y, w, h, { smoke: o.smoke }));
    rr(g, CX + 400, GY - 180, 380, 60, 10); g.fillStyle = '#c9ccd4'; g.fill(); seg(g, [[CX + 420, GY - 120], [CX + 420, GY]], 8, '#9aa0aa'); seg(g, [[CX + 760, GY - 120], [CX + 760, GY]], 8, '#9aa0aa');
  });
  layer(g, cam, 0.8, (g) => { rr(g, CX - 220, GY - 160, 340, 20, 6); g.fillStyle = '#b08a6a'; g.fill(); g.fillStyle = '#8a6a4a'; g.fillRect(CX - 200, GY - 140, 300, 140); });
  layer(g, cam, 0.9, (g) => floor(g, M, GY, '#9aa0a0'));
  return { GY, CX, M };
}
