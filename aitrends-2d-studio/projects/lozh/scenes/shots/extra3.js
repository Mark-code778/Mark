// shots/extra3.js — вставки и схемы «Если бы ты не чувствовал боли»: сковородка, деталька конструктора, просмотры,
// комментарии, сверление, тату, рентген пальца и колена, глаз с царапиной, список, термометр, книга Бранда,
// таблетка, прихватка. Схемы: ноцицепторы, две дороги, рефлекс, мозг, обрыв цепи, ген-ворота, капсаицин,
// аппендицит, ёрзанье, сустав Шарко, проказа, перчатки, кибербол, парацетамол, Джо Кэмерон, эволюция.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, mix, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { who, avatar, wrap, fit, phoneFrame } from './extra.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1) => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
// рука героя (кисть + рукав худи) — для крупных планов
function arm(g, x, y, ang, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  rr(g, -420, -70, 420, 140, 60); g.fillStyle = o.sleeve || OR; g.fill(); rr(g, -60, -76, 50, 152, 20); g.fillStyle = shade(o.sleeve || OR, -0.25); g.fill();
  if (o.mitt) { rr(g, -20, -90, 200, 180, 70); g.fillStyle = '#d64a5a'; g.fill(); rr(g, -24, -94, 40, 188, 16); g.fillStyle = '#f4efe6'; g.fill(); }
  else { g.fillStyle = INK; g.beginPath(); g.ellipse(70, 0, 95, 70, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { rr(g, 120, -58 + i * 34, 80 - Math.abs(i - 1.5) * 10, 28, 14); g.fill(); } rr(g, 40, -110, 30, 70, 15); g.fill();
    if (o.bandage) { rr(g, 10, -72, 120, 144, 20); g.fillStyle = '#f4f1ea'; g.fill(); for (let i = 0; i < 4; i++) seg(g, [[14, -50 + i * 32], [126, -40 + i * 32]], 3, '#d8d0c0'); } }
  g.restore();
}
// мозг (вид сбоку) — контур с извилинами
function brain(g, cx, cy, r, c, w = 6) {
  g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(cx - r * 1.2, cy + r * 0.2);
  g.bezierCurveTo(cx - r * 1.4, cy - r * 0.9, cx - r * 0.2, cy - r * 1.25, cx + r * 0.5, cy - r * 0.95); g.bezierCurveTo(cx + r * 1.35, cy - r * 0.6, cx + r * 1.4, cy + r * 0.45, cx + r * 0.8, cy + r * 0.65);
  g.bezierCurveTo(cx + r * 0.4, cy + r * 0.85, cx - r * 0.2, cy + r * 0.6, cx - r * 0.5, cy + r * 0.7); g.bezierCurveTo(cx - r * 1.0, cy + r * 0.8, cx - r * 1.25, cy + r * 0.55, cx - r * 1.2, cy + r * 0.2); g.stroke();
  g.lineWidth = w * 0.6; for (const [a, b, d] of [[-0.8, -0.5, 0.4], [-0.2, -0.75, 0.35], [0.5, -0.4, 0.4], [-0.6, 0.15, 0.35], [0.2, 0.1, 0.3]]) { g.beginPath(); g.arc(cx + a * r, cy + b * r, d * r, 0.3, 2.6); g.stroke(); }
  seg(g, [[cx + r * 0.2, cy + r * 0.62], [cx + r * 0.35, cy + r * 1.25]], w * 1.4, c);
}
// контур тела с точками
function body(g, cx, cy, s, c) { UI.lineFigure(g, { x: cx, y: cy, s, color: c }); }
const headY = (cy, s) => cy - 208 * s;

export const INS5 = {
  pan(g, t, v) { // голая рука берёт раскалённую сковородку
    const cx = E.W * 0.52, cy = E.H * 0.6; glow(g, cx, cy, 700, '#ff6a2a', 0.22 + 0.05 * Math.sin(t * 5));
    g.save(); g.translate(cx, cy); g.fillStyle = '#26262c'; g.beginPath(); g.ellipse(160, 0, 380, 90, 0, 0, 7); g.fill(); g.fillStyle = '#3a3a44'; g.beginPath(); g.ellipse(160, -16, 340, 70, 0, 0, 7); g.fill();
    for (let i = 0; i < 6; i++) { const k = (t * 0.6 + i / 6) % 1; g.strokeStyle = alpha(v.smoke ? '#d8d0d8' : '#ffb07a', 0.4 * (1 - k)); g.lineWidth = v.smoke ? 18 : 6; g.beginPath(); const bx = -80 + i * 90; g.moveTo(bx, -60 - k * 60); g.quadraticCurveTo(bx + 40 * Math.sin(t * 2 + i), -200 - k * 120, bx - 20, -300 - k * 180); g.stroke(); }
    seg(g, [[-200, -10], [-560, -40]], 36, '#1a1a1e'); g.restore();
    arm(g, cx - 380, cy - 40, -0.06, 1.0, { bandage: v.bandage });
    if (v.deg !== false) text(g, v.deg || '200°+', E.W * 0.8, E.H * 0.22, { size: 120, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 24, glowColor: 'rgba(255,120,60,.7)' });
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.9, { size: 56, font: FONTS.serif, weight: 900, italic: true, color: S().ui.cream, glow: 16, glowColor: 'rgba(255,140,80,.6)' });
  },
  mitt(g, t, v) { // в конце: рука в прихватке берёт сковородку
    const cx = E.W * 0.52, cy = E.H * 0.6; glow(g, cx, cy, 600, '#ffb07a', 0.15);
    g.save(); g.translate(cx, cy); g.fillStyle = '#26262c'; g.beginPath(); g.ellipse(160, 0, 380, 90, 0, 0, 7); g.fill(); seg(g, [[-200, -10], [-560, -40]], 36, '#1a1a1e'); g.restore();
    const k = ease.inOut(prog(t, 0.2, 1.2)); arm(g, cx - 380 - (1 - k) * 300, cy - 40 - (1 - k) * 160, -0.06, 1.0, { mitt: true });
  },
  lego(g, t, v) { // босая нога на детальке конструктора
    const cx = E.W / 2, cy = E.H * 0.72; g.fillStyle = linGrad(g, 0, cy - 400, 0, E.H, ['#a08060', '#6a4a30']); g.fillRect(0, cy - 60, E.W, E.H);
    rr(g, cx - 120, cy - 70, 240, 90, 10); g.fillStyle = '#d63a3a'; g.fill(); for (let i = 0; i < 4; i++) { rr(g, cx - 100 + i * 52, cy - 100, 40, 32, 8); g.fill(); }
    const k = ease.in(prog(t, 0.3, 0.9)); g.save(); g.translate(cx - 60, cy - 120 - (1 - k) * 260); rr(g, -320, -80, 520, 150, 70); g.fillStyle = INK; g.fill(); for (let i = 0; i < 5; i++) circle(g, 200 + 6 * i, -50 + i * 26, 22 - i * 2, INK); rr(g, -360, -380, 150, 330, 60); g.fill(); rr(g, -380, -400, 190, 120, 40); g.fillStyle = CAST.artem.legs; g.fill(); g.restore();
    if (t > 0.9) FX.rings(g, cx, cy - 60, t - 0.9, { count: 2, r0: 60, r1: 260, color: '#ffffff', a: 0.3 });
    if (v.cap) text(g, v.cap, cx, E.H * 0.16, { size: 64, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 16, glowColor: 'rgba(255,140,80,.6)' });
  },
  views(g, t, v) { // видео в соцсети: счётчик просмотров растёт
    const cx = E.W / 2, cy = E.H * 0.52, w = 560, h = 900, x0 = cx - w / 2, y0 = cy - h / 2; phoneFrame(g, cx, cy, w, h, '#101218');
    const vy = y0 + 70, vh = 420; g.save(); rr(g, x0 + 20, vy, w - 40, vh, 20); g.clip(); g.fillStyle = linGrad(g, 0, vy, 0, vy + vh, ['#3a2a3a', '#1a1420']); g.fillRect(x0, vy, w, vh);
    const kind = v.kind || 'candle';
    if (kind === 'candle') { rr(g, cx - 24, vy + 250, 48, 150, 6); g.fillStyle = '#f4efe6'; g.fill(); const fl = 1 + 0.1 * Math.sin(t * 17); g.fillStyle = '#ffb03a'; g.beginPath(); g.ellipse(cx, vy + 220, 20 * fl, 40 * fl, 0, 0, 7); g.fill(); glow(g, cx, vy + 210, 200, '#ffb03a', 0.5); arm(g, cx - 120, vy + 140, 0, 0.42); }
    else if (kind === 'nettle') { for (let i = 0; i < 9; i++) { g.fillStyle = '#3a8a3a'; g.beginPath(); g.ellipse(x0 + 80 + i * 50, vy + 330 - (i % 3) * 40, 26, 50, (i % 2 ? 0.4 : -0.4), 0, 7); g.fill(); } arm(g, cx - 160, vy + 220, 0.2, 0.42); }
    else if (kind === 'ice') { g.fillStyle = '#d8ecf8'; g.fillRect(x0, vy + 200, w, vh); g.fillStyle = '#1a3a5a'; g.beginPath(); g.ellipse(cx, vy + 300, 180, 50, 0, 0, 7); g.fill(); circle(g, cx, vy + 270, 46, INK); text(g, '40:00', cx, vy + 80, { size: 60, font: FONTS.ui, weight: 900, color: '#ffffff' }); }
    else if (kind === 'pepper') { g.fillStyle = '#e02a2a'; g.beginPath(); g.moveTo(cx - 160, vy + 200); g.quadraticCurveTo(cx + 40, vy + 120, cx + 180, vy + 300); g.quadraticCurveTo(cx, vy + 280, cx - 160, vy + 240); g.fill(); seg(g, [[cx - 160, vy + 220], [cx - 200, vy + 180]], 14, '#3a8a3a'); text(g, '2 200 000 ЕД.', cx, vy + 380, { size: 34, font: FONTS.ui, weight: 900, color: '#ffd47e' }); }
    rr(g, x0 + 36, vy + 16, 80, 34, 8); g.fillStyle = '#e02a2a'; g.fill(); text(g, 'LIVE', x0 + 76, vy + 34, { size: 22, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore();
    const k = ease.out(prog(t, v.at ?? 0.3, (v.at ?? 0.3) + (v.dur ?? 2.2))), n = Math.round(lerp(v.from ?? 0, v.to ?? 1000000, k));
    text(g, n.toLocaleString('ru-RU').replace(/,/g, ' '), cx, vy + vh + 110, { size: 84, font: FONTS.ui, weight: 900, color: '#ffffff' });
    text(g, v.label || 'просмотров', cx, vy + vh + 180, { size: 34, font: FONTS.ui, weight: 800, color: '#9aa4b8' });
    for (let i = 0; i < 3; i++) { avatar(g, i ? 'passer' : 'artem', x0 + 70, vy + vh + 260 + i * 0, 30, '#2a3048'); }
    text(g, '@artem.bez.boli', x0 + 120, vy + vh + 262, { size: 28, font: FONTS.ui, weight: 900, color: '#cfd8ea', align: 'left' });
    if (v.when) text(g, v.when, E.W * 0.82, E.H * 0.5, { size: 70, font: FONTS.ui, weight: 900, color: S().ui.gold, glow: 18, glowColor: 'rgba(255,190,90,.5)' });
  },
  comments(g, t, v) { // комментарии делятся на два лагеря
    const cx = E.W / 2, cy = E.H * 0.52, w = 760, h = 880, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#f2f4f8');
    text(g, 'Комментарии · 48 213', x0 + 40, cy - h / 2 + 60, { size: 34, font: FONTS.ui, weight: 900, color: '#22222a', align: 'left' });
    const C = v.items || [['Это монтаж', 0], ['Где записаться к нему на курсы?!', 1], ['100% монтаж, видно же', 0], ['Брат, научи так же', 1], ['Фейк. Отписка', 0], ['Это лучшее, что я видел', 1]];
    C.forEach(([s, side], i) => { const a = fadeIn(t, 0.3 + i * 0.45, 0.3); if (a <= 0) return; const y = cy - h / 2 + 150 + i * 120; g.save(); g.globalAlpha *= a;
      circle(g, x0 + 70, y, 34, ['#8a5ad6', '#3fb950', '#f29ac0', '#5aa0d0', '#f2b84a', '#c0453a'][i % 6]); const L = wrap(g, s, w - 260, 32, 800); rr(g, x0 + 120, y - 44, w - 220, 88, 20); g.fillStyle = side ? '#e4f6e4' : '#fbe4e4'; g.fill();
      text(g, L[0], x0 + 150, y, { size: 32, font: FONTS.ui, weight: 800, color: '#22222a', align: 'left' }); text(g, side ? '♥' : '?', x0 + w - 60, y, { size: 40, font: FONTS.ui, weight: 900, color: side ? '#3fb950' : '#e04a3a' }); g.restore(); });
  },
  feed(g, t, v) { // лента в телефоне, пока сверлят зуб: таймер 40 минут
    const cx = E.W * 0.4, cy = E.H * 0.52, w = 500, h = 860, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#f2f4f8');
    g.save(); rr(g, x0, cy - h / 2, w, h, 36); g.clip(); const off = (t * 160) % 300; for (let i = 0; i < 5; i++) { const y = cy - h / 2 + 30 + i * 300 - off; rr(g, x0 + 24, y, w - 48, 200, 16); g.fillStyle = ['#f2b06a', '#7fc0e8', '#e88a8a', '#9fd8a8', '#c9a7e8'][i % 5]; g.fill(); seg(g, [[x0 + 24, y + 230], [x0 + w - 140, y + 230]], 12, '#c9ccd4'); seg(g, [[x0 + 24, y + 260], [x0 + w - 220, y + 260]], 12, '#dfe2e8'); } g.restore();
    const m = Math.floor(lerp(v.from ?? 0, v.to ?? 40, clamp(t / 3))); text(g, `${m} мин`, E.W * 0.74, E.H * 0.42, { size: 150, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 20, glowColor: 'rgba(255,190,90,.5)' });
    text(g, v.sub || 'СВЕРЛЕНИЯ · БЕЗ ЗАМОРОЗКИ', E.W * 0.74, E.H * 0.56, { size: 40, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  ribs(g, t, v) { // татуировка на рёбрах: узор проявляется, часы бегут
    const cx = E.W * 0.38, cy = E.H * 0.55; g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 300, 400, 0, 0, 7); g.fill();
    g.strokeStyle = alpha('#3a3a48', 0.9); g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx + 260, cy - 200 + i * 70, 260, Math.PI * 0.82, Math.PI * 1.1); g.stroke(); }
    const k = clamp(t / (v.dur || 3)); g.save(); g.beginPath(); g.rect(cx - 300, cy - 400, 600, 800 * k); g.clip(); g.strokeStyle = '#ffb07a'; g.lineWidth = 8; g.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 4, r = 30 + i * 3.4; const x = cx + Math.cos(a) * r * 0.7, y = cy - 220 + i * 7.5 + Math.sin(a) * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
    const h = Math.floor(lerp(0, 5, k)); text(g, `${h}:${String(Math.floor((k * 300) % 60)).padStart(2, '0')}`, E.W * 0.74, E.H * 0.42, { size: 150, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 20, glowColor: 'rgba(255,190,90,.5)' });
    text(g, v.sub || 'ЧАСОВ В КРЕСЛЕ', E.W * 0.74, E.H * 0.56, { size: 44, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  xfinger(g, t, v) { // рентген кисти: сломанный палец
    const cx = E.W / 2, cy = E.H * 0.52; rr(g, cx - 480, cy - 380, 960, 760, 16); g.fillStyle = '#0a1018'; g.fill(); glow(g, cx, cy, 500, '#9fd8ff', 0.15);
    const c = alpha('#dff2ff', 0.85); g.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = -0.55 + i * 0.28, bx = cx + Math.sin(a) * 120, by = cy + 160 - Math.cos(a) * 120; const L = i === 0 ? 2 : 3;
      let px = bx, py = by; for (let j = 0; j < L; j++) { const len = 110 - j * 22, nx = px + Math.sin(a) * len, ny = py - Math.cos(a) * len; seg(g, [[px, py], [nx, ny]], 30 - j * 4, c); px = nx + Math.sin(a) * 12; py = ny - Math.cos(a) * 12; } }
    g.fillStyle = c; g.beginPath(); g.ellipse(cx, cy + 240, 150, 110, 0, 0, 7); g.fill();
    const a = -0.55 + 3 * 0.28, bx = cx + Math.sin(a) * 120 + Math.sin(a) * 140, by = cy + 160 - Math.cos(a) * 120 - Math.cos(a) * 140; const k = fadeIn(t, 0.6, 0.4);
    if (k > 0) { ring(g, bx, by, 70, 6, alpha('#ff5a4a', k)); seg(g, [[bx - 20, by - 14], [bx + 4, by + 2], [bx - 6, by + 10], [bx + 20, by + 18]], 5, alpha('#ff5a4a', k)); text(g, 'ПЕРЕЛОМ', bx + 330, by - 60, { size: 50, font: FONTS.ui, weight: 900, color: '#ff8a7a', alpha: k }); }
  },
  eye(g, t, v) { // глаз: красный, с царапиной на роговице
    const cx = E.W / 2, cy = E.H * 0.52; g.fillStyle = '#f2e0dc'; g.beginPath(); g.ellipse(cx, cy, 520, 260, 0, 0, 7); g.fill();
    g.save(); g.beginPath(); g.ellipse(cx, cy, 520, 260, 0, 0, 7); g.clip(); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, r0 = 520; g.strokeStyle = alpha('#d0303a', 0.55); g.lineWidth = 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * 260); g.quadraticCurveTo(cx + Math.cos(a + 0.2) * 360, cy + Math.sin(a + 0.2) * 180, cx + Math.cos(a) * 250, cy + Math.sin(a) * 160); g.stroke(); }
    circle(g, cx, cy, 200, '#6a4a30'); circle(g, cx, cy, 90, INK); circle(g, cx - 60, cy - 60, 30, alpha('#ffffff', 0.7)); g.restore();
    const k = clamp((t - 0.5) / 0.8); if (k > 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 140, cy - 80); g.lineTo(cx - 140 + 260 * k, cy - 80 + 150 * k); g.stroke(); glow(g, cx, cy, 200, '#ffffff', 0.15 * k); text(g, 'ЦАРАПИНА НА РОГОВИЦЕ', cx, E.H * 0.12, { size: 54, font: FONTS.ui, weight: 900, color: S().ui.cream, alpha: k, spacing: 2 }); }
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.ellipse(cx, cy, 520, 260, 0, 0, 7); g.stroke();
  },
  list(g, t, v) { // список над кроватью: каждое утро
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.02); rr(g, -440, -400, 880, 800, 10); g.fillStyle = '#fbf8f1'; g.fill(); circle(g, 0, -380, 16, '#c0453a');
    text(g, 'КАЖДОЕ УТРО', 0, -300, { size: 70, font: FONTS.ui, weight: 900, color: '#c0453a', spacing: 4 });
    const L = v.lines || ['Осмотри язык', 'Осмотри глаза', 'Осмотри ноги', 'Измерь температуру'];
    L.forEach((s, i) => { const y = -170 + i * 140, a = fadeIn(t, 0.3 + i * (v.step ?? 0.45)); ring(g, -340, y, 34, 6, '#3a3a44'); text(g, s, -270, y, { size: 58, font: FONTS.serif, weight: 900, italic: true, color: '#1d3a6a', align: 'left', alpha: a });
      if (v.check && t > v.check + i * 0.3) { g.strokeStyle = '#3fb950'; g.lineWidth = 12; g.beginPath(); g.moveTo(-360, y); g.lineTo(-340, y + 22); g.lineTo(-300, y - 30); g.stroke(); } });
    g.restore();
  },
  temp(g, t, v) { // электронный градусник
    const cx = E.W * 0.4, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.5); rr(g, -480, -70, 900, 140, 70); g.fillStyle = '#f4f6f8'; g.fill(); rr(g, 380, -30, 220, 60, 30); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, -330, -48, 360, 96, 14); g.fillStyle = '#c8d8c0'; g.fill();
    const k = ease.out(prog(t, 0.2, 1.6)); text(g, `${lerp(36.6, v.to ?? 38.5, k).toFixed(1).replace('.', ',')}°`, -150, 4, { size: 82, font: FONTS.ui, weight: 900, color: k > 0.6 ? '#c0302a' : '#22222a' }); g.restore();
    if (v.sub) text(g, v.sub, E.W * 0.74, E.H * 0.8, { size: 46, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  xknee(g, t, v) { // рентген колена: у 20-летнего — колено старика
    const cx = E.W / 2, cy = E.H * 0.52; rr(g, cx - 380, cy - 420, 760, 840, 16); g.fillStyle = '#0a1018'; g.fill(); glow(g, cx, cy, 500, '#9fd8ff', 0.15);
    const c = alpha('#dff2ff', 0.85), bad = v.bad ? fadeIn(t, 0.6, 0.8) : 0, gap = lerp(46, 10, bad);
    rr(g, cx - 90, cy - 420, 180, 360, 30); g.fillStyle = c; g.fill(); g.beginPath(); g.ellipse(cx - 60, cy - 70, 90, 60, 0, 0, 7); g.ellipse(cx + 60, cy - 70, 90, 60, 0, 0, 7); g.fill();
    rr(g, cx - 140, cy - 70 + gap, 280, 90, 30); g.fill(); rr(g, cx - 80, cy + gap, 160, 420, 30); g.fill();
    if (bad > 0) { for (const [x, y] of [[-60, -40], [40, -20], [-20, 60], [70, 90]]) seg(g, [[cx + x, cy + y], [cx + x + 30, cy + y + 30 - 50], [cx + x + 10, cy + y + 50]], 4, alpha('#ff5a4a', bad)); text(g, 'ХРЯЩ СТЁРТ', cx + 470, cy - 80, { size: 50, font: FONTS.ui, weight: 900, color: '#ff8a7a', alpha: bad }); text(g, 'КОСТЬ В ТРЕЩИНАХ', cx + 470, cy + 10, { size: 40, font: FONTS.ui, weight: 900, color: '#ff8a7a', alpha: bad }); }
    text(g, v.cap || '20 ЛЕТ', cx - 560, cy, { size: 70, font: FONTS.ui, weight: 900, color: S().ui.gold });
  },
  book(g, t, v) { // книга Пола Бранда
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.05); rr(g, -330, -440, 660, 880, 14); g.fillStyle = '#8a2a2a'; g.fill(); rr(g, -330, -440, 50, 880, 8); g.fillStyle = '#6a1a1a'; g.fill();
    ring(g, 30, -140, 120, 6, '#f2d27a'); seg(g, [[30, -260], [30, -20]], 6, '#f2d27a');
    const L = v.lines || ['БОЛЬ —', 'ДАР, КОТОРЫЙ', 'НИКОМУ', 'НЕ НУЖЕН']; L.forEach((s, i) => text(g, s, 30, 70 + i * 74, { size: fit(g, s, 520, 64, 900), font: FONTS.ui, weight: 900, color: '#f4efe6', alpha: fadeIn(t, 0.2 + i * 0.3) }));
    text(g, v.author || 'ПОЛ БРАНД', 30, 390, { size: 40, font: FONTS.ui, weight: 900, color: '#f2d27a', spacing: 4 }); g.restore();
  },
  pill(g, t, v) { // таблетка на ладони — финальный вопрос
    const cx = E.W / 2, cy = E.H * 0.62; glow(g, cx, cy - 120, 500, '#9fd0ff', 0.25 + 0.05 * Math.sin(t * 3));
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy + 60, 340, 170, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { rr(g, cx - 300 + i * 150, cy - 220 + Math.abs(i - 1.5) * 30, 110, 260, 55); g.fill(); } rr(g, cx - 420, cy + 120, 840, 400, 100); g.fillStyle = OR; g.fill();
    g.save(); g.translate(cx, cy - 20); g.rotate(-0.3); rr(g, -90, -40, 180, 80, 40); g.fillStyle = '#f4f1ea'; g.fill(); rr(g, 0, -40, 90, 80, 40); g.fillStyle = '#4aa8e8'; g.fill(); g.fillRect(0, -40, 40, 80); g.restore();
    if (v.cap) text(g, v.cap, cx, E.H * 0.14, { size: fit(g, v.cap, E.W - 200, 66, 900), font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 16, glowColor: 'rgba(120,180,255,.6)' });
  },
};

export const BP5 = {
  noci(g, t, v) { // ноцицепторы: датчики опасности по всему телу
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.3, cy = E.H * 0.93, s = 3.2, H = 250 * s;
    body(g, cx, cy, s, alpha(c, 0.7));
    const pts = []; for (let i = 0; i < 70; i++) { const yy = 0.04 + ((i * 53) % 88) / 100; pts.push([cx + ((((i * 37) % 21) - 10) / 10) * H * (yy > 0.5 && yy < 0.78 ? 0.14 : 0.06), cy - yy * H]); }
    pts.forEach(([x, y], i) => { const k = fadeIn(t, 0.2 + i * 0.03, 0.2); if (k > 0) { circle(g, x, y, 7 * k, gold); glow(g, x, y, 22, gold, 0.3 * k); } });
    T(g, v.title || 'НОЦИЦЕПТОРЫ', E.H * 0.13, 64);
    const L = v.list || []; L.forEach((s2, i) => { const a = fadeIn(t, 0.6 + i * 0.5); Lb(g, s2, E.W * 0.7, E.H * 0.32 + i * 110, 52, i === L.length - 1 && v.hiLast ? acc : c, a); });
    if (v.sub) Lb(g, v.sub, E.W * 0.7, E.H * 0.24, 46, gold, fadeIn(t, 0.4));
  },
  roads(g, t, v) { // две дороги: быстрая (толстая, с изоляцией) и медленная (тонкая)
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, x0 = E.W * 0.12, x1 = E.W * 0.82;
    T(g, v.title || 'ДВЕ ДОРОГИ СИГНАЛА', E.H * 0.12, 60); brain(g, E.W * 0.9, E.H * 0.5, 90, c, 5);
    const rows = [['fast', E.H * 0.36, 26, gold, 'БЫСТРАЯ · ДО 30 М/С', 'острая «АЙ!»', 1.2], ['slow', E.H * 0.7, 8, acc, 'МЕДЛЕННАЯ · ~1 М/С', 'тупая, ноющая', 4.5]];
    for (const [k, y, w, col, lab, sub, dur] of rows) { const on = !v.only || v.only === k || v.only === 'both'; const a = on ? 1 : 0.25;
      seg(g, [[x0, y], [x1, y]], w, alpha(c, 0.35 * a)); if (k === 'fast') for (let x = x0 + 30; x < x1; x += 90) { rr(g, x, y - w * 0.9, 70, w * 1.8, w * 0.9); g.fillStyle = alpha(col, 0.35 * a); g.fill(); }
      if (on) { const p = ((t - 0.3) % (dur + 0.6)) / dur; if (t > 0.3 && p <= 1) { const px = lerp(x0, x1, p); circle(g, px, y, w * 0.9 + 10, col); glow(g, px, y, 80, col, 0.6); } }
      Lb(g, lab, (x0 + x1) / 2, y - 70, 46, alpha(col, a) === col ? col : col, a); Lb(g, sub, (x0 + x1) / 2, y + 70, 38, c, a); }
    circle(g, x0, E.H * 0.53, 40, alpha(acc, 0.6)); Lb(g, 'УДАР', x0, E.H * 0.53 + 76, 32, c);
  },
  reflex(g, t, v) { // рефлекторная дуга: спинной мозг решает сам
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    T(g, v.title || 'РЕФЛЕКС', E.H * 0.12, 60);
    const H = [E.W * 0.2, E.H * 0.72], SP = [E.W * 0.55, E.H * 0.55], BR = [E.W * 0.55, E.H * 0.24];
    rr(g, SP[0] - 40, E.H * 0.34, 80, E.H * 0.5, 40); g.strokeStyle = c; g.lineWidth = 5; g.stroke(); Lb(g, 'СПИННОЙ МОЗГ', SP[0] + 250, SP[1], 38, c); brain(g, BR[0], BR[1], 80, c, 5); Lb(g, 'ГОЛОВНОЙ МОЗГ', BR[0] + 280, BR[1], 38, c);
    circle(g, H[0], H[1], 50, alpha(acc, 0.5)); Lb(g, 'ГОРЯЧО', H[0], H[1] + 90, 36, acc);
    const p1 = prog(t, 0.3, 1.0), p2 = prog(t, 1.0, 1.6), p3 = prog(t, 1.8, 2.8);
    seg(g, [H, [lerp(H[0], SP[0], p1), lerp(H[1], SP[1], p1)]], 8, gold); if (p2 > 0) seg(g, [SP, [lerp(SP[0], H[0] + 60, p2), lerp(SP[1], H[1] - 140, p2)]], 8, acc);
    if (p2 >= 1) { Lb(g, 'РУКА ОТДЁРНУТА', H[0] + 60, H[1] - 220, 44, acc); }
    if (p3 > 0) { seg(g, [SP, [SP[0], lerp(SP[1], BR[1] + 60, p3)]], 5, alpha(c, 0.8)); if (p3 >= 1) Lb(g, '…и только потом «ГОРЯЧО!»', E.W * 0.55, E.H * 0.92, 40, c); }
  },
  brain3(g, t, v) { // в мозге работают сразу несколько отделов
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.4, cy = E.H * 0.52;
    brain(g, cx, cy, 260, c, 7); T(g, v.title || 'СИГНАЛ В ГОЛОВНОМ МОЗГЕ', E.H * 0.12, 56);
    const Z = [[cx + 90, cy - 170, 'ГДЕ БОЛИТ', gold], [cx - 160, cy - 40, 'НАСКОЛЬКО ПЛОХО', acc], [cx + 120, cy + 60, 'ЗАПОМНИТЬ', '#7fe0a8']];
    Z.slice(0, v.n ?? 3).forEach(([x, y, s, col], i) => { const k = fadeIn(t, 0.3 + i * 0.6); if (k <= 0) return; const hi = v.hi == null || v.hi === i; circle(g, x, y, 56 * k, alpha(col, hi ? 0.7 : 0.25)); glow(g, x, y, 140, col, hi ? 0.4 * k : 0.1);
      seg(g, [[x + 50, y], [E.W * 0.7, E.H * (0.3 + i * 0.2)]], 3, alpha(col, 0.7 * k)); Lb(g, s, E.W * 0.82, E.H * (0.3 + i * 0.2), 46, col, k * (hi ? 1 : 0.4)); });
  },
  cut(g, t, v) { // цепочка оборвана: сигнализация отключена
    UI.blueprint(g); const c = UI.bpStroke(), acc = S().ui.accent, y = E.H * 0.52;
    const N = [[E.W * 0.15, 'ДАТЧИК'], [E.W * 0.5, 'СПИННОЙ МОЗГ'], [E.W * 0.85, 'ГОЛОВА']];
    N.forEach(([x, s]) => { ring(g, x, y, 80, 6, c); Lb(g, s, x, y + 140, 40, c); });
    seg(g, [[N[0][0] + 80, y], [N[1][0] - 80, y]], 6, alpha(c, 0.4)); seg(g, [[N[1][0] + 80, y], [N[2][0] - 80, y]], 6, alpha(c, 0.4));
    const k = fadeIn(t, 0.4, 0.3); for (const x of [(N[0][0] + N[1][0]) / 2, (N[1][0] + N[2][0]) / 2]) { seg(g, [[x - 50 * k, y - 50 * k], [x + 50 * k, y + 50 * k]], 14, acc); seg(g, [[x - 50 * k, y + 50 * k], [x + 50 * k, y - 50 * k]], 14, acc); }
    T(g, v.title || 'СИГНАЛИЗАЦИЯ ОТКЛЮЧЕНА', E.H * 0.16, 62, acc);
  },
  gene(g, t, v) { // один сломанный ген — «ворота» для сигнала боли
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    T(g, v.title || 'ОДИН СЛОМАННЫЙ ГЕН', E.H * 0.12, 60);
    if (v.mode !== 'gate') { const cy = E.H * 0.52; for (let i = 0; i < 40; i++) { const x = E.W * 0.1 + i * 40, a = i * 0.45 + t; const y1 = cy + Math.sin(a) * 120, y2 = cy - Math.sin(a) * 120, bad = i >= 18 && i <= 21;
        circle(g, x, y1, 12, bad ? acc : c); circle(g, x, y2, 12, bad ? acc : c); seg(g, [[x, y1], [x, y2]], 4, alpha(bad ? acc : c, 0.5)); }
      const k = fadeIn(t, 0.8); ring(g, E.W * 0.1 + 19.5 * 40, cy, 200, 6, alpha(acc, k)); Lb(g, 'SCN9A', E.W * 0.1 + 19.5 * 40, cy + 270, 46, acc, k); return; }
    const cx = E.W / 2, cy = E.H * 0.55; g.fillStyle = alpha(c, 0.15); g.fillRect(0, cy - 60, E.W, 120); seg(g, [[0, cy - 60], [E.W, cy - 60]], 4, c); seg(g, [[0, cy + 60], [E.W, cy + 60]], 4, c);
    const open = !v.broken; rr(g, cx - 120, cy - 90, 80, 180, 20); g.fillStyle = gold; g.fill(); rr(g, cx + 40, cy - 90, 80, 180, 20); g.fill();
    if (!open) { seg(g, [[cx - 40, cy - 70], [cx + 40, cy + 70]], 12, acc); seg(g, [[cx - 40, cy + 70], [cx + 40, cy - 70]], 12, acc); }
    for (let i = 0; i < 8; i++) { const p = ((t * 0.5 + i / 8) % 1), y = lerp(cy - 400, cy + 400, p); const blocked = !open && y > cy - 110; circle(g, cx, blocked ? cy - 120 - (i % 3) * 30 : y, 16, acc); }
    Lb(g, open ? 'ВОРОТА ОТКРЫТЫ — СИГНАЛ ПРОХОДИТ' : 'ВОРОТА СЛОМАНЫ — СИГНАЛ НЕ ПРОХОДИТ', cx, E.H * 0.9, 46, open ? c : acc);
  },
  capsa(g, t, v) { // острота — это боль: капсаицин и жар цепляются к одному датчику
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W / 2, cy = E.H * 0.56;
    T(g, v.title || 'ОСТРОТА — ЭТО НЕ ВКУС, А БОЛЬ', E.H * 0.12, 58);
    ring(g, cx, cy, 120, 8, gold); Lb(g, 'ДАТЧИК ЖАРА', cx, cy + 190, 42, gold);
    const k1 = ease.inOut(prog(t, 0.3, 1.3)), k2 = ease.inOut(prog(t, 1.0, 2.0));
    g.fillStyle = '#e02a2a'; g.beginPath(); const px = lerp(E.W * 0.12, cx - 170, k1); g.moveTo(px - 80, cy - 30); g.quadraticCurveTo(px, cy - 80, px + 90, cy); g.quadraticCurveTo(px, cy + 10, px - 80, cy + 20); g.fill(); Lb(g, 'КАПСАИЦИН', E.W * 0.15, cy - 160, 40, acc);
    const fx = lerp(E.W * 0.88, cx + 170, k2); poly(g, [[fx - 40, cy + 40], [fx, cy - 70], [fx + 40, cy + 40]], '#ffb03a'); Lb(g, 'ОГОНЬ', E.W * 0.85, cy - 160, 40, '#ffb03a');
    if (k2 >= 1) { glow(g, cx, cy, 260, acc, 0.5); Lb(g, 'МОЗГ: «ВО РТУ ОГОНЬ!»', cx, E.H * 0.9, 50, acc); }
  },
  appx(g, t, v) { // аппендицит: боль ведёт к хирургу вовремя (или нет)
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.3, cy = E.H * 0.93, s = 3.2, H = 250 * s;
    body(g, cx, cy, s, alpha(c, 0.7)); const nav = [cx, cy - 0.56 * H], rl = [cx - 0.05 * H, cy - 0.49 * H];
    T(g, v.title || 'АППЕНДИЦИТ', E.H * 0.11, 60);
    if (v.you) { const k = clamp(t / 3); circle(g, rl[0], rl[1], 34 + 10 * Math.sin(t * 6), alpha(acc, 0.35 + 0.3 * k)); Lb(g, 'НЕ БОЛИТ', E.W * 0.7, E.H * 0.36, 64, c); Lb(g, '3 ДНЯ', E.W * 0.7, E.H * 0.5, 110, acc); Lb(g, 'С БОМБОЙ В ЖИВОТЕ', E.W * 0.7, E.H * 0.64, 50, acc); return; }
    const p = ease.inOut(prog(t, 0.6, 2.2)), x = lerp(nav[0], rl[0], p), y = lerp(nav[1], rl[1], p), r = 30 + 40 * p;
    circle(g, x, y, r, alpha(acc, 0.6)); glow(g, x, y, r * 3, acc, 0.4);
    const L = v.list || ['БОЛЬ У ПУПКА', 'СПРАВА ВНИЗУ', 'НЕ МОЖЕШЬ ХОДИТЬ', 'ОПЕРАЦИЯ ВОВРЕМЯ']; L.forEach((s2, i) => Lb(g, `${i + 1}. ${s2}`, E.W * 0.7, E.H * (0.3 + i * 0.14), 50, i === L.length - 1 ? gold : c, fadeIn(t, 0.4 + i * (v.step ?? 0.7))));
  },
  fidget(g, t, v) { // крошечная боль заставляет менять позу тысячи раз в день
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    T(g, v.title || 'ТЫСЯЧИ РАЗ В ДЕНЬ', E.H * 0.12, 60);
    const ph = Math.sin(t * 2.4); UI.lineFigure(g, { x: E.W * 0.35 + ph * 20, y: E.H * 0.93, s: 3.2, color: c, pose: ph > 0 ? POSES.relaxed : POSES.stand, facing: ph > 0 ? 1 : -1 });
    circle(g, E.W * 0.35 + (ph > 0 ? 40 : -40), E.H * 0.93 - 0.2 * 800, 26, alpha(acc, 0.6 + 0.3 * Math.abs(ph)));
    const n = Math.floor(clamp(t / 3) * 1000); Lb(g, `×${n}`, E.W * 0.7, E.H * 0.45, 150, gold); Lb(g, v.sub || '«подвинься — тут сдавило»', E.W * 0.7, E.H * 0.62, 46, c);
  },
  charcot(g, t, v) { // сустав Шарко
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.38, cy = E.H * 0.55, k = ease.inOut(prog(t, 0.6, 2.4));
    T(g, v.title || 'СУСТАВ ШАРКО', E.H * 0.12, 62);
    g.strokeStyle = c; g.lineWidth = 6; rr(g, cx - 80, cy - 420, 160, 330, 40); g.stroke(); rr(g, cx - 70, cy + 60 - k * 20, 140, 330, 40); g.stroke();
    rr(g, cx - 120, cy - 110, 240, 50 * (1 - k) + 6, 20); g.fillStyle = alpha(gold, 0.7 * (1 - k) + 0.1); g.fill(); rr(g, cx - 120, cy + 10 - k * 40, 240, 50 * (1 - k) + 6, 20); g.fill();
    if (k > 0.5) for (const [x, y] of [[-40, -60], [30, 80], [-20, 140]]) seg(g, [[cx + x, cy + y], [cx + x + 20, cy + y + 30], [cx + x + 4, cy + y + 50]], 4, acc);
    Lb(g, 'ХРЯЩ', cx + 250, cy - 85, 46, gold); Lb(g, k > 0.5 ? 'СТЁРТ' : 'ЦЕЛ', cx + 250, cy - 25, 46, k > 0.5 ? acc : c);
    Lb(g, 'ЧЕЛОВЕК НЕ ЧУВСТВОВАЛ,', E.W * 0.76, E.H * 0.62, 42, c, fadeIn(t, 1.2)); Lb(g, 'КАК ЕГО ПОВРЕЖДАЕТ', E.W * 0.76, E.H * 0.69, 42, c, fadeIn(t, 1.2));
  },
  leprosy(g, t, v) { // проказа убивает нервы — плоть не гниёт сама
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.36, cy = E.H * 0.6;
    T(g, v.title || 'ПРОКАЗА', E.H * 0.12, 62);
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy + 60, 150, 130, 0, 0, 7); g.stroke(); for (let i = 0; i < 4; i++) { rr(g, cx - 130 + i * 70, cy - 230 + Math.abs(i - 1.5) * 20, 50, 200, 25); g.stroke(); } rr(g, cx - 230, cy - 20, 60, 160, 28); g.stroke();
    const k = ease.inOut(prog(t, 0.6, 2.2)); for (let i = 0; i < 5; i++) { const x = cx - 180 + i * 70; seg(g, [[cx, cy + 260], [x + 25, cy - 150 + Math.abs(i - 2) * 20]], 4, alpha(gold, 1 - k * 0.85)); }
    Lb(g, 'НЕРВЫ', E.W * 0.74, E.H * 0.3, 50, gold, 1 - k * 0.5); if (k > 0.6) Lb(g, 'УБИТЫ БАКТЕРИЕЙ', E.W * 0.74, E.H * 0.38, 46, acc);
    const L = v.list || []; L.forEach((s2, i) => Lb(g, s2, E.W * 0.74, E.H * (0.56 + i * 0.09), 44, c, fadeIn(t, 1.2 + i * 0.5)));
  },
  gloves(g, t, v) { // перчатки с датчиками, которые пищат
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.36, cy = E.H * 0.58;
    T(g, v.title || 'ЗАМЕНА БОЛИ?', E.H * 0.12, 62);
    g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.ellipse(cx, cy + 60, 160, 140, 0, 0, 7); g.stroke(); for (let i = 0; i < 4; i++) { rr(g, cx - 140 + i * 74, cy - 240 + Math.abs(i - 1.5) * 20, 56, 210, 28); g.stroke(); } rr(g, cx - 250, cy - 20, 64, 170, 30); g.stroke();
    const beep = Math.sin(t * 10) > 0.4; for (let i = 0; i < 5; i++) { const x = i < 4 ? cx - 112 + i * 74 : cx - 218, y = i < 4 ? cy - 200 + Math.abs(i - 1.5) * 20 : cy + 10; circle(g, x, y, 14, beep ? acc : gold); if (beep) glow(g, x, y, 50, acc, 0.5); }
    if (beep) Lb(g, 'ПИ-ПИ-ПИ', cx + 330, cy - 160, 54, acc);
    if (v.fail) { const k = fadeIn(t, 0.4); Lb(g, 'ПИСК МОЖНО ИГНОРИРОВАТЬ', E.W * 0.7, E.H * 0.6, 46, c, k); Lb(g, 'БОЛЬ — НЕЛЬЗЯ', E.W * 0.7, E.H * 0.72, 66, gold, fadeIn(t, 1.2)); }
  },
  cyber(g, t, v) { // кибербол: двое перестают бросать мяч третьему
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    T(g, v.title || 'ЭКСПЕРИМЕНТ «КИБЕРБОЛ»', E.H * 0.11, 58);
    const P = [[E.W * 0.22, E.H * 0.42], [E.W * 0.5, E.H * 0.42], [E.W * 0.36, E.H * 0.82]];
    P.forEach(([x, y], i) => UI.lineFigure(g, { x, y: y + 150, s: 1.2, color: i === 2 ? gold : c }));
    Lb(g, 'ТЫ', P[2][0] + 90, P[2][1] + 60, 40, gold);
    const ex = v.excl ? t > (v.excl ?? 0) : false, seq = ex ? [0, 1] : [0, 1, 2];
    const step = Math.floor(t / 0.7), ph = (t / 0.7) % 1, a = P[seq[step % seq.length]], b = P[seq[(step + 1) % seq.length]];
    const bx = lerp(a[0], b[0], ph), by = lerp(a[1] - 140, b[1] - 140, ph) - Math.sin(ph * Math.PI) * 120; circle(g, bx, by, 20, '#f4efe6');
    if (v.brain) { const k = fadeIn(t, 0.5); brain(g, E.W * 0.78, E.H * 0.5, 160, c, 5); circle(g, E.W * 0.75, E.H * 0.47, 50 * k, alpha(acc, 0.7)); glow(g, E.W * 0.75, E.H * 0.47, 160, acc, 0.5 * k); Lb(g, '«НАСКОЛЬКО ЭТО УЖАСНО»', E.W * 0.78, E.H * 0.84, 40, acc, k); }
  },
  para(g, t, v) { // парацетамол три недели — реже обиды
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, base = E.H * 0.8;
    T(g, v.title || 'ПАРАЦЕТАМОЛ · 3 НЕДЕЛИ', E.H * 0.12, 60); Lb(g, 'КАК ЧАСТО ЛЮДИ ЧУВСТВОВАЛИ ОБИДУ', E.W / 2, E.H * 0.22, 38, gold);
    [['ПУСТЫШКА', 0.8, c], ['ПАРАЦЕТАМОЛ', 0.55, acc]].forEach(([lab, val, col], i) => { const x = E.W * (0.36 + i * 0.28), k = ease.out(prog(t, 0.4 + i * 0.5, 1.4 + i * 0.5)), h = 460 * val * k; rr(g, x - 110, base - h, 220, h, 10); g.fillStyle = alpha(col, 0.75); g.fill(); Lb(g, lab, x, base + 50, 40, col); });
    seg(g, [[E.W * 0.2, base], [E.W * 0.8, base]], 5, c);
  },
  onesys(g, t, v) { // одна система тревоги — для тела и для разбитого сердца
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W / 2, cy = E.H * 0.55;
    T(g, v.title || 'ОДНА СИСТЕМА ТРЕВОГИ', E.H * 0.12, 60); ring(g, cx, cy, 120, 8, gold); glow(g, cx, cy, 200, gold, 0.3 + 0.1 * Math.sin(t * 4)); Lb(g, 'ТРЕВОГА', cx, cy, 40, gold);
    const k1 = fadeIn(t, 0.3), k2 = fadeIn(t, 0.9); seg(g, [[cx - 140, cy], [E.W * 0.22, cy]], 5, alpha(c, k1)); seg(g, [[cx + 140, cy], [E.W * 0.78, cy]], 5, alpha(c, k2));
    Lb(g, 'БОЛЬ ТЕЛА', E.W * 0.16, cy, 46, c, k1); g.save(); g.globalAlpha = k2; const hx = E.W * 0.84, hy = cy - 20; g.fillStyle = acc; g.beginPath(); g.moveTo(hx, hy + 60); g.bezierCurveTo(hx - 90, hy, hx - 60, hy - 70, hx, hy - 30); g.bezierCurveTo(hx + 60, hy - 70, hx + 90, hy, hx, hy + 60); g.fill(); seg(g, [[hx - 6, hy - 30], [hx + 10, hy], [hx - 8, hy + 20], [hx + 6, hy + 50]], 6, UI.bpStroke()); g.restore(); Lb(g, 'РАЗБИТОЕ СЕРДЦЕ', E.W * 0.84, cy + 130, 40, acc, k2);
  },
  jo(g, t, v) { // Джо Кэмерон: боль приглушена, тревоги почти нет
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    T(g, v.title || 'ДЖО КЭМЕРОН · ШОТЛАНДИЯ', E.H * 0.12, 58);
    const rows = v.rows || [['БОЛЬ', 0.25], ['ТРЕВОГА', 0.15], ['ЕСТЕСТВЕННОЕ ОБЕЗБОЛИВАЮЩЕЕ', 0.95]];
    rows.forEach(([lab, val], i) => { const y = E.H * (0.34 + i * 0.18), k = ease.out(prog(t, 0.3 + i * 0.5, 1.3 + i * 0.5)); Lb(g, lab, E.W / 2, y - 50, 40, c); rr(g, E.W * 0.2, y, E.W * 0.6, 40, 20); g.fillStyle = alpha(c, 0.15); g.fill(); rr(g, E.W * 0.2, y, E.W * 0.6 * val * k, 40, 20); g.fillStyle = i === 2 ? gold : acc; g.fill(); });
  },
  evo(g, t, v) { // сотни миллионов лет проверки
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, y = E.H * 0.58;
    T(g, v.title || 'ОДНА ИЗ САМЫХ ДРЕВНИХ СИСТЕМ', E.H * 0.12, 56);
    const k = ease.inOut(prog(t, 0.2, 2.6)); seg(g, [[E.W * 0.08, y], [lerp(E.W * 0.08, E.W * 0.92, k), y]], 6, c);
    const M = [[0.12, '600 МЛН', 'медузы'], [0.32, '500 МЛН', 'рыбы'], [0.55, '300 МЛН', 'рептилии'], [0.75, '200 МЛН', 'млекопитающие'], [0.9, 'СЕЙЧАС', 'человек']];
    M.forEach(([p, a, b], i) => { if (k < (p - 0.08) / 0.84) return; const x = E.W * p; circle(g, x, y, 16, i === 4 ? gold : c); Lb(g, a, x, y - 70, 38, gold); Lb(g, b, x, y + 70, 34, c); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.86, 46, acc, fadeIn(t, 1.4));
  },
  guard(g, t, v) { // боль как охранник
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.36;
    T(g, v.title || 'БОЛЬ — ЭТО ОХРАННИК', E.H * 0.12, 60); UI.lineFigure(g, { x: cx, y: E.H * 0.93, s: 3.2, color: v.fired ? alpha(c, 0.25) : gold });
    rr(g, cx - 50, E.H * 0.93 - 800 - 10, 100, 30, 6); g.fillStyle = v.fired ? alpha(c, 0.25) : gold; g.fill();
    const L = v.list || ['ОСТАНОВИСЬ', 'ЗДЕСЬ ЧТО-ТО НЕ ТАК', 'ПОЗАБОТЬСЯ ОБО МНЕ']; L.forEach((s2, i) => Lb(g, `«${s2}»`, E.W * 0.7, E.H * (0.36 + i * 0.16), 50, i === 2 ? gold : c, fadeIn(t, 0.3 + i * (v.step ?? 0.7))));
    if (v.fired) { const k = fadeIn(t, 0.4); Lb(g, 'УВОЛЕН', cx, E.H * 0.5, 90, acc, k); }
  },
  sweat(g, t, v) { // при некоторых формах — ещё и не потеешь
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.34;
    T(g, v.title || 'ТЕЛО НЕ МОЖЕТ ОХЛАДИТЬСЯ', E.H * 0.12, 58); UI.lineFigure(g, { x: cx, y: E.H * 0.93, s: 3.2, color: c });
    for (let i = 0; i < 6; i++) { const x = cx - 170 + i * 70, y = E.H * 0.3 + (i % 2) * 90; g.save(); g.globalAlpha = 0.5; g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(x, y, 12, 18, 0, 0, 7); g.fill(); g.restore(); seg(g, [[x - 18, y - 18], [x + 18, y + 18]], 5, acc); }
    const k = ease.out(prog(t, 0.4, 2.4)); const tx = E.W * 0.72, ty = E.H * 0.52; rr(g, tx - 26, ty - 260, 52, 420, 26); g.strokeStyle = c; g.lineWidth = 5; g.stroke(); circle(g, tx, ty + 190, 50, acc); rr(g, tx - 14, ty + 150 - 400 * k, 28, 400 * k, 14); g.fillStyle = acc; g.fill();
    Lb(g, `${lerp(36.6, 41, k).toFixed(1).replace('.', ',')}°`, tx + 190, ty - 60, 70, acc);
  },
};
