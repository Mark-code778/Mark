// sets/places8.js — декорации «Что, если бы ты умел телепортироваться?»: пляж (с горами на горизонте), снежный хребет,
// аэропорт со стойкой регистрации, трасса (заправка / мост через Оку / кафе с беляшами / поворот у церкви / поле),
// деревня бабушки с дедушкой (дом, забор, калитка), поверхность Луны.
// Реквизит: хлопок телепортации (popFX), малинник, сарай, тапочек, кактус, капельница, большая Луна.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS, clamp, lerp, ease, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

const ground = () => E.H * V(0.8, 0.68);
function skyBack(g, M, CX, GY, o = {}) {
  backdrop(g, o.skyC || M.sky);
  if (o.night) FX.stars(g, 0, { count: 120, area: [-E.W, -E.H, E.W * 3, GY] });
  if (o.sun !== false && !o.night) FX.sun(g, CX + (o.sunX ?? 420), GY - V(720, 1100), 46, '#fff6e2', M.key, 4);
}

// ── хлопок телепортации: вспышка, ударное кольцо, пыль, надпись «ХЛОП!». dt — время от момента хлопка
export function popFX(g, x, gy, dt, o = {}) {
  if (dt < 0 || dt > 1.0) return;
  const cy = gy - 230, k = ease.out(clamp(dt / 0.55)), a = 1 - clamp(dt / 0.9);
  if (dt < 0.16) { const f = 1 - dt / 0.16; glow(g, x, cy, 420, '#fff4d8', 0.9 * f); g.fillStyle = `rgba(255,250,235,${0.85 * f})`; g.beginPath(); g.ellipse(x, cy, 70 * (1 - f * 0.5), 300, 0, 0, 7); g.fill(); }
  g.save(); g.globalAlpha = a; ring(g, x, cy, 60 + 420 * k, 14 * (1 - k) + 3, '#fff1dc'); ring(g, x, cy, 30 + 260 * k, 6, alpha('#ffd59a', 0.7)); g.restore();
  // радиальные чёрточки
  g.save(); g.globalAlpha = a; for (let i = 0; i < 14; i++) { const an = (i / 14) * Math.PI * 2 + 0.2, r0 = 120 + 260 * k, r1 = r0 + 70 * (1 - k) + 20; seg(g, [[x + Math.cos(an) * r0, cy + Math.sin(an) * r0 * 0.8], [x + Math.cos(an) * r1, cy + Math.sin(an) * r1 * 0.8]], 7, '#fff1dc'); } g.restore();
  // пыль у ног
  g.save(); g.globalAlpha = a * 0.8; for (let i = -4; i <= 4; i++) { if (!i) continue; const px = x + i * 40 * (0.6 + k * 1.6), r = 26 + 18 * k + (Math.abs(i) % 2) * 10; circle(g, px, gy - 14 - Math.abs(i) * 3 * k, r, alpha(o.dust || '#d8ccc0', 0.55)); } g.restore();
  if (o.word !== false) { const s = ease.outBack(clamp(dt / 0.22)), wa = 1 - clamp((dt - 0.6) / 0.35); if (wa > 0) { g.save(); g.translate(x + (o.wx ?? 150), cy - 300); g.rotate(-0.12); g.scale(s, s); g.globalAlpha = wa;
    text(g, o.word || 'ХЛОП!', 0, 0, { size: o.size || 110, font: FONTS.ui, weight: 900, color: '#ffd84a', glow: 24, glowColor: 'rgba(255,140,40,.9)', spacing: 4 }); g.restore(); } }
}

// ── реквизит
export function rasp(g, x, gy, s = 1) { // малинник
  g.save(); g.translate(x, gy); g.scale(s, s); const r = rng(Math.round(x) + 7);
  for (let i = 0; i < 9; i++) { const dx = (i - 4) * 46 + r() * 20, h = 150 + r() * 80; seg(g, [[dx, 0], [dx + (r() - 0.5) * 40, -h]], 5, '#5a7a3a'); }
  for (let i = 0; i < 16; i++) { const dx = (r() - 0.5) * 420, dy = -60 - r() * 160; circle(g, dx, dy, 34 + r() * 20, ['#3f7a3a', '#4f8a45', '#356a33'][i % 3]); }
  for (let i = 0; i < 18; i++) circle(g, (r() - 0.5) * 380, -60 - r() * 150, 7, '#d8304a');
  g.restore();
}
export function shed(g, x, gy) { // папин сарай
  rr(g, x - 170, gy - 300, 340, 300, 3); g.fillStyle = '#8a6a4a'; g.fill(); for (let xx = x - 160; xx < x + 170; xx += 34) seg(g, [[xx, gy - 296], [xx, gy]], 3, alpha('#000', 0.18));
  poly(g, [[x - 200, gy - 300], [x + 200, gy - 300], [x + 170, gy - 360], [x - 170, gy - 360]], '#5a5a62'); rr(g, x - 60, gy - 220, 120, 220, 3); g.fillStyle = '#6a4a30'; g.fill(); circle(g, x + 40, gy - 110, 7, '#c8b070');
}
export function slipper(g, x, gy, c = '#5a7ab0') { g.fillStyle = c; g.beginPath(); g.ellipse(x, gy - 10, 48, 16, 0, 0, 7); g.fill(); g.fillStyle = shade(c, -0.25); g.beginPath(); g.ellipse(x + 14, gy - 20, 26, 14, 0, Math.PI, 0); g.fill(); }
export function cactus(g, x, y) { rr(g, x - 26, y - 40, 52, 40, 5); g.fillStyle = '#c0703a'; g.fill(); rr(g, x - 14, y - 110, 28, 74, 14); g.fillStyle = '#4a9a5a'; g.fill(); rr(g, x + 8, y - 90, 26, 14, 7); g.fill(); rr(g, x + 22, y - 110, 12, 30, 6); g.fill(); circle(g, x, y - 112, 7, '#e86a9a'); }
export function drip(g, x, gy) { seg(g, [[x, gy], [x, gy - 520]], 6, '#9aa0aa'); seg(g, [[x - 50, gy], [x + 50, gy]], 6, '#9aa0aa'); seg(g, [[x - 40, gy - 520], [x + 40, gy - 520]], 5, '#9aa0aa'); rr(g, x - 30, gy - 510, 60, 90, 10); g.fillStyle = 'rgba(220,236,255,.8)'; g.fill(); seg(g, [[x, gy - 420], [x - 60, gy - 300], [x - 160, gy - 260]], 3, 'rgba(220,236,255,.8)'); }
export function bigMoon(g, x, y, r = 170) { glow(g, x, y, r * 3, '#dfe6ff', 0.35); circle(g, x, y, r, '#eef0f6'); for (const [dx, dy, cr] of [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.4, 0.13], [0.35, -0.35, 0.1], [-0.45, 0.25, 0.09]]) circle(g, x + dx * r, y + dy * r, cr * r, alpha('#b8bccb', 0.75)); }

// ── пляж: море, песок; o.mountains — снежные горы на горизонте (Сочи)
export function beach(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2, HZ = GY - 250;
  layer(g, cam, 0.12, (g) => { skyBack(g, M, CX, GY, { ...o, sunX: 520 }); FX.clouds(g, { y: E.H * 0.18, count: 5, a: 0.18, seed: 4 }); });
  if (o.mountains !== false) layer(g, cam, 0.2, (g) => { for (const [mx, h, w] of [[-760, 430, 520], [-420, 560, 600], [-60, 470, 520], [300, 380, 460]]) { const x = CX + mx; poly(g, [[x - w / 2, HZ + 4], [x, HZ - h], [x + w / 2, HZ + 4]], '#7a88a8'); poly(g, [[x - w * 0.16, HZ - h * 0.68], [x, HZ - h], [x + w * 0.16, HZ - h * 0.68], [x + w * 0.05, HZ - h * 0.74], [x - w * 0.04, HZ - h * 0.7]], '#f4f6fa'); } });
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, HZ, 0, GY - 70, ['#3a7ab8', '#4a9ac8', '#6abcd8']); g.fillRect(-E.W * 2, HZ, E.W * 5, GY - 70 - HZ);
    for (let i = 0; i < 9; i++) { const y = HZ + 20 + i * ((GY - 90 - HZ) / 9), off = (t * (20 + i * 6) + i * 140) % 260; for (let x = -E.W - 260 + off; x < E.W * 2; x += 260) seg(g, [[x, y], [x + 90 + i * 6, y]], 3 + i * 0.4, alpha('#ffffff', 0.25 + i * 0.03)); }
    const sw = Math.sin(t * 1.3) * 18; g.fillStyle = alpha('#ffffff', 0.7); g.beginPath(); g.moveTo(-E.W * 2, GY - 66 + sw * 0.3); for (let x = -E.W * 2; x <= E.W * 3; x += 80) g.lineTo(x, GY - 72 + Math.sin(x * 0.01 + t * 2) * 8 + sw * 0.3); g.lineTo(E.W * 3, GY - 50); g.lineTo(-E.W * 2, GY - 50); g.fill();
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 60, 0, GY + 300, ['#e8d2a0', '#d8b880', '#b8945a']); g.fillRect(-E.W * 2, GY - 58, E.W * 5, E.H * 2); const r = rng(9); g.fillStyle = alpha('#8a6a40', 0.25); for (let i = 0; i < 80; i++) g.fillRect(-E.W + r() * E.W * 3, GY - 40 + r() * 260, 6, 3); });
  return { GY, CX, M };
}

// ── снежный хребет, почти 3 км над морем
export function ridge(g, t, cam, o = {}) {
  const M = mood('day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#1a2c66', '#3a5aa0', '#8aaad8', '#d8e4f4']); FX.sun(g, CX + 560, GY - V(760, 1100), 40, '#ffffff', '#cfe0ff', 3); });
  layer(g, cam, 0.18, (g) => { g.fillStyle = linGrad(g, 0, GY - 160, 0, GY, ['#9ab8d8', '#6a90c0']); g.fillRect(-E.W * 2, GY - 150, E.W * 5, 200); text(g, 'МОРЕ', CX + 640, GY - 110, { size: 26, font: FONTS.ui, weight: 900, color: alpha('#ffffff', 0.45), spacing: 6 }); });
  layer(g, cam, 0.3, (g) => { for (const [mx, h, w] of [[-900, 360, 700], [-300, 300, 560], [400, 420, 760], [1000, 330, 600]]) { const x = CX + mx, b = GY - 120; poly(g, [[x - w / 2, b], [x, b - h], [x + w / 2, b]], '#a8b8d0'); poly(g, [[x - w * 0.22, b - h * 0.56], [x, b - h], [x + w * 0.22, b - h * 0.56]], '#f4f8ff'); } });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 90, 0, GY + 300, ['#f8fbff', '#dce8f6', '#b8cce4']); g.beginPath(); g.moveTo(-E.W * 2, E.H * 2); for (let x = -E.W * 2; x <= E.W * 3; x += 60) g.lineTo(x, GY - 10 + Math.sin(x * 0.004) * 50 + Math.sin(x * 0.013) * 14); g.lineTo(E.W * 3, E.H * 2); g.fill();
    for (const [dx, s] of [[-620, 1], [520, 1.3], [880, 0.8]]) { poly(g, [[CX + dx - 60 * s, GY + 20], [CX + dx - 10 * s, GY - 60 * s], [CX + dx + 50 * s, GY - 30 * s], [CX + dx + 80 * s, GY + 20]], '#4a5060'); poly(g, [[CX + dx - 20 * s, GY - 50 * s], [CX + dx - 10 * s, GY - 60 * s], [CX + dx + 50 * s, GY - 30 * s], [CX + dx + 30 * s, GY - 34 * s]], '#f4f8ff'); }
  });
  return { GY, CX, M, fg: (g) => { const r = rng(3); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = 0; i < 70; i++) { const y = r() * E.H, sp = 900 + r() * 700, x = ((r() * E.W * 2 + t * sp) % (E.W + 300)) - 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 50, y + 6); g.stroke(); } } };
}

// ── аэропорт: панорамные окна, табло, стойка регистрации (o.counterX)
export function airport(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#9ab8d8', '#d8e4f0']); g.fillStyle = '#7a8090'; g.fillRect(-E.W * 2, GY - 330, E.W * 5, 40);
    const px = CX - 300 + ((t * 30) % 400); poly(g, [[px - 260, GY - 400], [px + 260, GY - 400], [px + 300, GY - 380], [px - 260, GY - 370]], '#eef2f6'); poly(g, [[px - 230, GY - 400], [px - 180, GY - 520], [px - 140, GY - 520], [px - 160, GY - 400]], '#c0453a'); poly(g, [[px - 40, GY - 390], [px + 40, GY - 390], [px - 60, GY - 330], [px - 120, GY - 330]], '#d8dee6'); });
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#d8dce4'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H + GY - 900); for (let x = -E.W; x < E.W * 3; x += 260) { g.fillStyle = '#5a6070'; g.fillRect(x, GY - 900, 18, 900); }
    g.fillStyle = '#5a6070'; g.fillRect(-E.W * 2, GY - 910, E.W * 5, 22); g.fillStyle = '#c8ccd6'; g.fillRect(-E.W * 2, GY - 260, E.W * 5, 260);
    const bx = CX + (o.boardX ?? -560); rr(g, bx - 260, GY - 760, 520, 300, 10); g.fillStyle = '#12141c'; g.fill(); text(g, 'ВЫЛЕТ', bx, GY - 726, { size: 30, font: FONTS.ui, weight: 900, color: '#ffd84a', spacing: 6 });
    ['СОЧИ      08:40', 'КАЗАНЬ    09:15', 'ИРКУТСК   09:50', 'КАЛИНИНГР 10:20'].forEach((s, i) => text(g, s, bx - 220, GY - 676 + i * 52, { size: 28, font: FONTS.ui, weight: 800, color: i === 0 && (t * 2) % 1 < 0.5 ? '#ff8a5a' : '#f4e8c0', align: 'left' }));
  });
  layer(g, cam, 0.85, (g) => { if (o.counterX === false) return; const cx = CX + (o.counterX ?? 380);
    rr(g, cx - 120, GY - 640, 240, 70, 8); g.fillStyle = '#2a5a8a'; g.fill(); text(g, 'РЕГИСТРАЦИЯ', cx, GY - 604, { size: 30, font: FONTS.ui, weight: 900, color: '#ffffff' });
    seg(g, [[cx, GY - 570], [cx, GY - 520]], 4, '#5a6070');
    rr(g, cx - 220, GY - 170, 440, 170, 8); g.fillStyle = '#e8eaee'; g.fill(); rr(g, cx - 230, GY - 186, 460, 22, 6); g.fillStyle = '#9aa0aa'; g.fill(); rr(g, cx - 140, GY - 140, 280, 60, 4); g.fillStyle = '#2a5a8a'; g.fill(); text(g, '7', cx, GY - 110, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#c8ccd4', '#9aa0aa']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.12), 0.07); });
  return { GY, CX, M };
}

// ── трасса: spot = 'gas' | 'bridge' | 'cafe' | 'church' | 'field' | 'hill' | 'gate'
export function route(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2, sp = o.spot || 'field';
  layer(g, cam, 0.12, (g) => { skyBack(g, M, CX, GY, { ...o, sunX: 480 }); FX.clouds(g, { y: E.H * 0.2, count: 5, a: 0.16, seed: 7 }); });
  layer(g, cam, 0.25, (g) => { FX.hills(g, { y: GY - 170, amp: sp === 'hill' ? 40 : 70, color: '#7aa06a', seed: 5 }); for (let i = -6; i <= 6; i++) if (i % 3) FX.pine(g, CX + i * 230, GY - 140, 0.9, '#3a5a3a'); });
  layer(g, cam, 0.5, (g) => {
    if (sp === 'bridge') { // река и ферменный мост
      g.fillStyle = linGrad(g, 0, GY - 200, 0, GY - 100, ['#5a8ab8', '#3a6a98']); g.fillRect(-E.W * 2, GY - 200, E.W * 5, 110);
      for (let i = 0; i < 6; i++) seg(g, [[-E.W + ((t * 30 + i * 400) % (E.W * 3)), GY - 170 + (i % 3) * 22], [-E.W + ((t * 30 + i * 400) % (E.W * 3)) + 120, GY - 170 + (i % 3) * 22]], 3, alpha('#ffffff', 0.35));
      g.fillStyle = '#5a6070'; g.fillRect(CX - 1100, GY - 250, 2200, 26); for (let x = CX - 1100; x < CX + 1100; x += 160) { seg(g, [[x, GY - 250], [x + 80, GY - 400], [x + 160, GY - 250]], 10, '#6a7280'); } g.fillRect(CX - 1100, GY - 410, 2200, 16);
      for (const px of [-700, 0, 700]) { g.fillStyle = '#7a7a80'; g.fillRect(CX + px - 30, GY - 224, 60, 130); }
      rr(g, CX - 760, GY - 560, 220, 80, 8); g.fillStyle = '#2a5aa8'; g.fill(); text(g, 'р. ОКА', CX - 650, GY - 520, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' }); seg(g, [[CX - 650, GY - 480], [CX - 650, GY - 250]], 6, '#9aa0aa');
    }
    if (sp === 'gas') { const x = CX + 420; rr(g, x - 380, GY - 470, 760, 60, 6); g.fillStyle = '#e8eaee'; g.fill(); g.fillStyle = '#c0302a'; g.fillRect(x - 380, GY - 430, 760, 20); for (const dx of [-280, 280]) { g.fillStyle = '#d8dce4'; g.fillRect(x + dx - 16, GY - 410, 32, 410); }
      for (const dx of [-120, 120]) { rr(g, x + dx - 40, GY - 200, 80, 200, 8); g.fillStyle = '#e8eaee'; g.fill(); rr(g, x + dx - 28, GY - 180, 56, 40, 4); g.fillStyle = '#2a3040'; g.fill(); text(g, dx < 0 ? '92' : '95', x + dx, GY - 100, { size: 30, font: FONTS.ui, weight: 900, color: '#c0302a' }); }
      rr(g, CX - 700, GY - 520, 160, 300, 6); g.fillStyle = '#2a3040'; g.fill(); text(g, 'АЗС', CX - 620, GY - 480, { size: 40, font: FONTS.ui, weight: 900, color: '#ffd84a' }); ['92 56.1', '95 61.4', 'ДТ 70.2'].forEach((s, i) => text(g, s, CX - 620, GY - 420 + i * 48, { size: 26, font: FONTS.ui, weight: 800, color: '#f4e8c0' })); seg(g, [[CX - 620, GY - 220], [CX - 620, GY]], 10, '#5a6070'); }
    if (sp === 'cafe') { const x = CX + 380; rr(g, x - 330, GY - 340, 660, 340, 4); g.fillStyle = '#a8784a'; g.fill(); for (let y = GY - 330; y < GY; y += 28) { g.fillStyle = alpha('#000', 0.1); g.fillRect(x - 330, y, 660, 3); }
      poly(g, [[x - 370, GY - 340], [x + 370, GY - 340], [x + 330, GY - 420], [x - 330, GY - 420]], '#6a3a2a'); rr(g, x - 260, GY - 520, 520, 90, 10); g.fillStyle = '#c0302a'; g.fill(); text(g, 'КАФЕ «БЕЛЯШИ»', x, GY - 474, { size: 44, font: FONTS.ui, weight: 900, color: '#fff1c0' });
      for (const dx of [-200, 200]) { rr(g, x + dx - 70, GY - 270, 140, 110, 4); g.fillStyle = '#ffd59a'; g.fill(); } rr(g, x - 50, GY - 220, 100, 220, 4); g.fillStyle = '#4a2a1a'; g.fill(); }
    if (sp === 'church') { const x = CX + 460; rr(g, x - 200, GY - 380, 400, 380, 4); g.fillStyle = '#ece6d8'; g.fill(); rr(g, x - 70, GY - 560, 140, 180, 4); g.fill(); g.fillStyle = '#3a8a6a'; g.beginPath(); g.ellipse(x, GY - 580, 90, 80, 0, Math.PI, 0); g.fill(); seg(g, [[x, GY - 660], [x, GY - 760]], 8, '#d8b040'); seg(g, [[x - 30, GY - 730], [x + 30, GY - 730]], 7, '#d8b040');
      rr(g, x - 50, GY - 180, 100, 180, 50); g.fillStyle = '#5a4030'; g.fill(); for (const dx of [-130, 130]) { rr(g, x + dx - 26, GY - 300, 52, 90, 26); g.fillStyle = '#4a5a7a'; g.fill(); }
      rr(g, CX - 640, GY - 470, 260, 110, 8); g.fillStyle = '#2a5aa8'; g.fill(); seg(g, [[CX - 600, GY - 415], [CX - 440, GY - 415]], 12, '#fff'); poly(g, [[CX - 420, GY - 415], [CX - 460, GY - 445], [CX - 460, GY - 385]], '#fff'); seg(g, [[CX - 510, GY - 360], [CX - 510, GY]], 8, '#9aa0aa'); }
    if (sp === 'hospital') { const x = CX + 380; rr(g, x - 460, GY - 420, 920, 420, 4); g.fillStyle = '#e8e0d0'; g.fill(); for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) { rr(g, x - 420 + i * 124, GY - 380 + r * 160, 80, 100, 3); g.fillStyle = '#7a9ab8'; g.fill(); }
      rr(g, x - 300, GY - 500, 600, 70, 6); g.fillStyle = '#f4f4f4'; g.fill(); text(g, 'РАЙОННАЯ БОЛЬНИЦА', x, GY - 464, { size: 38, font: FONTS.ui, weight: 900, color: '#2a5aa8' });
      g.fillStyle = '#e03a3a'; g.fillRect(x + 330, GY - 498, 22, 66); g.fillRect(x + 308, GY - 476, 66, 22); rr(g, x - 70, GY - 180, 140, 180, 4); g.fillStyle = '#5a7a9a'; g.fill(); }
    if (sp === 'gate') { // калитка в деревне
      for (let x = -E.W; x < E.W * 2.2; x += 44) { if (Math.abs(x - (CX + 300)) < 90) continue; rr(g, x - 9, GY - 200, 18, 200, 3); g.fillStyle = '#9a7a4a'; g.fill(); }
      rr(g, CX + 220, GY - 220, 160, 220, 4); g.fillStyle = '#7a5a3a'; g.fill(); seg(g, [[CX + 230, GY - 30], [CX + 370, GY - 190]], 8, '#5a3a20'); }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7ab060', '#4a7a40']); g.fillRect(-E.W * 2, GY - 4, E.W * 5, E.H * 2);
    if (o.road !== false) { g.fillStyle = '#4a4a52'; g.fillRect(-E.W * 2, GY + 60, E.W * 5, 120); for (let x = -E.W * 2 + ((t * (o.speed || 0)) % 200); x < E.W * 3; x += 200) { g.fillStyle = '#e8e4d8'; g.fillRect(x, GY + 116, 100, 8); } }
  });
  return { GY, CX, M };
}

// ── деревня: бревенчатый дом, забор, калитка (o.gateX), лавка
export function village(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { skyBack(g, M, CX, GY, { ...o, sunX: -420 }); FX.clouds(g, { y: E.H * 0.2, count: 4, a: 0.16, seed: 3 }); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 200, amp: 70, color: '#7aa06a', seed: 11 }); for (let i = -5; i <= 5; i++) FX.tree(g, CX + i * 300 + 80, GY - 160, 1.2, '#3a6a3a'); });
  layer(g, cam, 0.55, (g) => {
    const hx = CX + (o.houseX ?? 460); rr(g, hx - 300, GY - 400, 600, 400, 4); g.fillStyle = '#8a5a3a'; g.fill(); for (let y = GY - 390; y < GY; y += 36) { rr(g, hx - 310, y, 620, 30, 15); g.fillStyle = shade('#8a5a3a', ((y / 36) % 2) * 0.06); g.fill(); }
    poly(g, [[hx - 340, GY - 400], [hx, GY - 620], [hx + 340, GY - 400]], '#5a6a7a'); for (const dx of [-150, 150]) { rr(g, hx + dx - 70, GY - 300, 140, 150, 4); g.fillStyle = '#f4f1ea'; g.fill(); rr(g, hx + dx - 58, GY - 288, 116, 126, 3); g.fillStyle = o.night ? '#ffd59a' : '#9ac8e0'; g.fill(); seg(g, [[hx + dx, GY - 288], [hx + dx, GY - 162]], 5, '#f4f1ea'); poly(g, [[hx + dx - 80, GY - 300], [hx + dx, GY - 340], [hx + dx + 80, GY - 300]], '#4a7ab0'); }
    const gx = CX + (o.gateX ?? -260); for (let x = -E.W; x < E.W * 2.2; x += 44) { if (Math.abs(x - gx) < 90) continue; rr(g, x - 9, GY - 190, 18, 190, 3); g.fillStyle = '#9a7a4a'; g.fill(); }
    g.fillStyle = '#7a5a3a'; g.fillRect(-E.W * 2, GY - 150, E.W * 5, 12);
    if (o.gate !== false) { g.save(); g.translate(gx - 80, GY - 210); g.scale(o.gateOpen ? 0.3 : 1, 1); rr(g, 0, 0, 160, 210, 4); g.fillStyle = '#6a4a2a'; g.fill(); seg(g, [[10, 190], [150, 20]], 8, '#4a3020'); g.restore(); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7ab060', '#4a7a40']); g.fillRect(-E.W * 2, GY - 4, E.W * 5, E.H * 2); });
  return { GY, CX, M, fg: o.night ? (g) => { g.fillStyle = 'rgba(8,10,30,.35)'; g.fillRect(0, 0, E.W, E.H); } : null };
}

// ── поверхность Луны
export function moonsurf(g, t, cam, o = {}) {
  const M = mood('void'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#020206', '#05060c']); FX.stars(g, 0, { count: 160, area: [-E.W, -E.H, E.W * 3, GY] });
    const ex = CX + 520, ey = GY - 640; glow(g, ex, ey, 260, '#6ab0ff', 0.3); circle(g, ex, ey, 110, '#2a6ac8'); g.save(); g.beginPath(); g.arc(ex, ey, 110, 0, 7); g.clip(); for (const [dx, dy, r] of [[-30, -20, 40], [40, 30, 34], [10, -60, 22]]) circle(g, ex + dx, ey + dy, r, '#4a9a5a'); circle(g, ex + 70, ey - 10, 120, 'rgba(0,0,0,.45)'); g.restore(); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 300, ['#b8b8c0', '#8a8a92', '#5a5a62']); g.beginPath(); g.moveTo(-E.W * 2, E.H * 2); for (let x = -E.W * 2; x <= E.W * 3; x += 80) g.lineTo(x, GY - 6 + Math.sin(x * 0.003) * 30); g.lineTo(E.W * 3, E.H * 2); g.fill();
    for (const [dx, dy, r] of [[-600, 60, 90], [200, 120, 60], [700, 40, 120], [-200, 220, 50]]) { g.fillStyle = alpha('#5a5a62', 0.7); g.beginPath(); g.ellipse(CX + dx, GY + dy, r, r * 0.3, 0, 0, 7); g.fill(); g.strokeStyle = alpha('#d8d8e0', 0.5); g.lineWidth = 4; g.beginPath(); g.ellipse(CX + dx, GY + dy - 4, r, r * 0.3, 0, Math.PI, 0); g.stroke(); } });
  return { GY, CX, M };
}

// ── в дороге: машина сбоку, в окнах Артём и Лёха; пейзаж едет мимо. o.jam — пробка (машины стоят), o.speed, o.mood
function carSide(g, x, gy, c, t, o = {}) {
  const b = Math.sin(t * 9) * (o.still ? 0 : 2); g.save(); g.translate(x, gy + b);
  rr(g, -300, -150, 600, 110, 40); g.fillStyle = c; g.fill(); poly(g, [[-190, -150], [-120, -250], [150, -250], [230, -150]], c);
  poly(g, [[-170, -152], [-112, -236], [10, -236], [10, -152]], '#9ac0e0'); poly(g, [[24, -152], [24, -236], [140, -236], [210, -152]], '#9ac0e0');
  if (o.heads !== false) { for (const [hx, col, k] of [[-60, '#4aa8e8', 'L'], [110, '#e8622a', 'A']]) { g.save(); g.beginPath(); g.rect(hx - 70, -236, 140, 84); g.clip(); g.fillStyle = col; g.beginPath(); g.ellipse(hx, -150, 52, 30, 0, Math.PI, 0); g.fill(); circle(g, hx, -190, 30, '#0e0b12'); circle(g, hx + 12, -196, 4.5, '#f4efe6'); circle(g, hx + 24, -196, 4.5, '#f4efe6'); g.restore(); } }
  for (const wx of [-190, 190]) { circle(g, wx, -40, 52, '#1a1a20'); circle(g, wx, -40, 24, '#9aa0aa'); const an = o.still ? 0 : t * 12; seg(g, [[wx + Math.cos(an) * 22, -40 + Math.sin(an) * 22], [wx - Math.cos(an) * 22, -40 - Math.sin(an) * 22]], 4, '#5a5a62'); }
  rr(g, 270, -120, 30, 20, 6); g.fillStyle = '#ffe8a0'; g.fill(); g.restore();
}
export function drive(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2, v = o.jam ? 0 : (o.speed ?? 1);
  layer(g, cam, 0.1, (g) => { skyBack(g, M, CX, GY, { ...o, sunX: 520 }); FX.clouds(g, { y: E.H * 0.18, count: 5, a: 0.16, seed: 2 }); });
  const scroll = (spd, period) => -(((t * v * spd) % period) + period) % period;
  layer(g, cam, 0.2, (g) => { g.save(); g.translate(scroll(40, 1200), 0); for (let k = -1; k < 4; k++) { g.save(); g.translate(k * 1200, 0); FX.hills(g, { y: GY - 200, amp: 80, color: o.mood === 'golden' ? '#7a8a5a' : '#7aa06a', seed: 9 }); g.restore(); } g.restore(); });
  layer(g, cam, 0.4, (g) => { const off = scroll(260, 300); for (let x = -E.W + off; x < E.W * 2; x += 300) FX.pine(g, x, GY - 60, 1.0, '#3a5a3a'); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#7ab060', '#4a7a40']); g.fillRect(-E.W * 2, GY - 4, E.W * 5, E.H * 2); g.fillStyle = '#4a4a52'; g.fillRect(-E.W * 2, GY + 10, E.W * 5, 160);
    const off = scroll(900, 220); for (let x = -E.W + off; x < E.W * 2; x += 220) { g.fillStyle = '#e8e4d8'; g.fillRect(x, GY + 86, 110, 8); }
    const po = scroll(900, 700); for (let x = -E.W + po; x < E.W * 2; x += 700) { seg(g, [[x, GY], [x, GY - 380]], 8, '#5a5a62'); seg(g, [[x - 40, GY - 360], [x + 40, GY - 360]], 6, '#5a5a62'); }
    if (o.jam) for (const [dx, c] of [[-760, '#c0453a'], [760, '#e8e2d4'], [1500, '#3a6ea5'], [-1500, '#5a8a5a']]) carSide(g, CX + dx, GY + 150, c, t, { still: true, heads: false });
    carSide(g, CX + (o.carX ?? 0), GY + 150, o.carC || '#d8d0c0', t, { still: !v });
  });
  return { GY, CX, M };
}

// ── крыша многоэтажки: город далеко внизу, парапет, антенны, будка выхода
export function roof9(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { skyBack(g, M, CX, GY, { ...o, sunX: 520 }); FX.clouds(g, { y: E.H * 0.2, count: 6, a: 0.2, seed: 5 }); });
  layer(g, cam, 0.2, (g) => { FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 40, maxH: 200, color: alpha('#6a7a9a', 0.55), seed: 17 }); FX.skyline(g, { x: -E.W, y: GY - 60, w: E.W * 3, minH: 30, maxH: 140, color: alpha('#5a6a88', 0.8), seed: 23 }); });
  layer(g, cam, 0.85, (g) => {
    const bx = CX + (o.boxX ?? -620); rr(g, bx - 150, GY - 330, 300, 330, 4); g.fillStyle = '#a8a29a'; g.fill(); rr(g, bx - 60, GY - 230, 120, 230, 4); g.fillStyle = '#5a5a62'; g.fill(); g.fillStyle = '#8a847c'; g.fillRect(bx - 165, GY - 340, 330, 18);
    const ax = CX + (o.antX ?? 640); seg(g, [[ax, GY - 60], [ax, GY - 520]], 7, '#5a5a62'); for (const [y, w] of [[480, 160], [420, 120], [360, 90]]) seg(g, [[ax - w / 2, GY - y], [ax + w / 2, GY - y]], 5, '#5a5a62');
    for (const vx of [CX + 260, CX + 900]) { rr(g, vx - 40, GY - 120, 80, 120, 6); g.fillStyle = '#9a948c'; g.fill(); rr(g, vx - 52, GY - 132, 104, 18, 6); g.fillStyle = '#7a746c'; g.fill(); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#6a6670', '#4a464e']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); g.fillStyle = '#8a8690'; g.fillRect(-E.W * 2, GY + 150, E.W * 5, 40); g.fillStyle = '#5a5660'; g.fillRect(-E.W * 2, GY + 190, E.W * 5, 14); });
  return { GY, CX, M };
}
