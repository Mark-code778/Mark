// shots/extra2.js — вставки «Детского сада»: заряд телефона, экран 2026, ладошка, старое фото бабушки,
// зарядки, iPhone 4, игра/коты, компот, футбол, ставка, термометр, заметка, запись видео, проценты по клипам,
// альбом 2010, приказ о премии, рамка. Схема: детская амнезия.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, mix, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { POSES, drawFigure } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { who, avatar, wrap, fit, phoneFrame, photoSky } from './extra.js';

const pctCol = (n) => (n <= 5 ? '#e04a3a' : n <= 25 ? '#f2a03a' : '#3fd07a');
function battery(g, x, y, w, n, col) { rr(g, x, y, w, w * 0.45, w * 0.08); g.strokeStyle = '#f4efe6'; g.lineWidth = w * 0.05; g.stroke(); rr(g, x + w, y + w * 0.13, w * 0.07, w * 0.19, 3); g.fillStyle = '#f4efe6'; g.fill();
  const iw = Math.max(0, (w - w * 0.14) * clamp(n / 100)); if (iw > 0) { rr(g, x + w * 0.07, y + w * 0.07, Math.max(iw, w * 0.04), w * 0.31, w * 0.04); g.fillStyle = col || pctCol(n); g.fill(); } }
// пейзаж для фото/видео: кухня, двор в дыму, комната
function scene(g, x, y, w, h, kind) {
  if (kind === 'kitchen') { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#f2dcb0', '#c8a070']); g.fillRect(x, y, w, h); g.fillStyle = '#e8ecf0'; g.fillRect(x + w * 0.04, y + h * 0.2, w * 0.18, h * 0.8); rr(g, x + w * 0.7, y + h * 0.15, w * 0.24, h * 0.3, 4); g.fillStyle = '#bfe0f4'; g.fill(); g.fillStyle = '#b08a6a'; g.fillRect(x, y + h * 0.82, w, h * 0.18); }
  else if (kind === 'yard') { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#c8906a', '#e8b884']); g.fillRect(x, y, w, h); circle(g, x + w * 0.75, y + h * 0.25, h * 0.08, '#ff8a3a'); glow(g, x + w * 0.75, y + h * 0.25, h * 0.4, '#ff9a4a', 0.4); g.fillStyle = '#7a7a4a'; g.fillRect(x, y + h * 0.8, w, h * 0.2); for (let i = 0; i < w; i += w / 24) seg(g, [[x + i, y + h * 0.82], [x + i, y + h * 0.5]], 5, '#3a8a5a'); seg(g, [[x, y + h * 0.58], [x + w, y + h * 0.58]], 5, '#3a8a5a'); g.fillStyle = alpha('#c8a080', 0.35); g.fillRect(x, y, w, h); }
  else if (kind === 'room') { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#c8b08a', '#8a6a4a']); g.fillRect(x, y, w, h); rr(g, x + w * 0.1, y + h * 0.15, w * 0.35, h * 0.35, 4); g.fillStyle = '#8a2a2a'; g.fill(); }
  else { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#bfe0f4', '#7aa0c0']); g.fillRect(x, y, w, h); }
}
// бабушка с мукой на щеке (крупно, по пояс)
function granny(g, x, y, s, o = {}) { who(g, o.hat ? 'grannyh' : 'granny', x, y, s, { e: o.e || 'happy', p: o.p || 'relaxed', f: o.f ?? 1 }); if (o.flour) { const hx = x + 10 * s, hy = y - 207 * s; circle(g, hx + 14 * s, hy + 8 * s, 6 * s, alpha('#ffffff', 0.85)); circle(g, hx + 20 * s, hy + 12 * s, 4 * s, alpha('#ffffff', 0.7)); } }

export const INS4 = {
  batt(g, t, v) { // огромный индикатор заряда: from → to
    const cx = E.W / 2, cy = E.H * 0.5; const k = ease.inOut(prog(t, v.at ?? 0.5, (v.at ?? 0.5) + (v.dur ?? 1.2))); const n = Math.round(lerp(v.from ?? v.n ?? 100, v.to ?? v.n ?? 100, k));
    glow(g, cx, cy, 600, pctCol(n), 0.12 + (n <= 5 ? 0.08 * Math.abs(Math.sin(t * 4)) : 0));
    battery(g, cx - 330, cy - 200, 660, n); text(g, `${n}%`, cx, cy - 52, { size: 170, font: FONTS.ui, weight: 900, color: '#ffffff', glow: 20, glowColor: alpha(pctCol(n), 0.6) });
    if (v.sub) text(g, v.sub, cx, cy + 220, { size: fit(g, v.sub, E.W - 300, 56), font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  screen26(g, t, v) { // экран смартфона: 100%, нет сети, время сбивается
    const cx = E.W / 2, cy = E.H * 0.52, w = 520, h = 860; phoneFrame(g, cx, cy, w, h, '#14182a');
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.clip(); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#2a3a7a', '#7a3a8a', '#e8906a']); g.fillRect(cx - w / 2, cy - h / 2, w, h); g.restore();
    const glitch = v.glitch !== false && Math.floor(t * 6) % 3 === 0; const tm = glitch ? ['??:??', '00:00', '12:6?', '88:88'][Math.floor(t * 7) % 4] : (v.time || '14:07');
    text(g, tm, cx + (glitch ? Math.sin(t * 90) * 8 : 0), cy - 220, { size: 120, font: FONTS.ui, weight: 900, color: '#ffffff' });
    text(g, v.date || 'понедельник', cx, cy - 130, { size: 32, font: FONTS.ui, weight: 800, color: alpha('#ffffff', 0.8) });
    battery(g, cx + 120, cy - h / 2 + 30, 80, v.n ?? 100); text(g, `${v.n ?? 100}%`, cx + 90, cy - h / 2 + 48, { size: 26, font: FONTS.ui, weight: 900, color: '#fff', align: 'right' });
    const rows = v.rows || ['СЕТИ НЕТ', 'ИНТЕРНЕТА НЕТ']; rows.forEach((r, i) => { const a = clamp((t - 0.6 - i * 0.6) / 0.3); if (a <= 0) return; g.save(); g.globalAlpha *= a; rr(g, cx - w / 2 + 40, cy + 20 + i * 110, w - 80, 90, 20); g.fillStyle = alpha('#ffffff', 0.85); g.fill(); text(g, r, cx, cy + 66 + i * 110, { size: fit(g, r, w - 140, 36), font: FONTS.ui, weight: 900, color: '#c0453a' }); g.restore(); });
  },
  palm(g, t, v) { // маленькая пухлая ладошка с пластырем
    const cx = E.W / 2, cy = E.H * 0.62, s = 1 + 0.02 * Math.sin(t * 2); g.save(); g.translate(cx, cy); g.scale(s, s);
    const ink = '#15121c'; seg(g, [[0, 420], [0, 120]], 120, ink); circle(g, 0, 0, 170, ink);
    [[-150, -90, -0.7], [-75, -170, -0.25], [10, -190, 0], [95, -165, 0.25]].forEach(([x, y, a], i) => { g.save(); g.translate(x, y); g.rotate(a); rr(g, -32, -95, 64, 140, 32); g.fillStyle = ink; g.fill(); if (i === 1) { rr(g, -36, -50, 72, 38, 8); g.fillStyle = '#f2c89a'; g.fill(); for (let k = 0; k < 3; k++) circle(g, -14 + k * 14, -31, 3, '#c89a6a'); } g.restore(); });
    g.save(); g.translate(150, 20); g.rotate(0.9); rr(g, -32, -80, 64, 120, 32); g.fillStyle = ink; g.fill(); g.restore();
    g.strokeStyle = alpha(S().ui.cream, 0.7); g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 176, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    g.restore(); if (v.cap) text(g, v.cap, cx, E.H * 0.12, { size: 54, font: FONTS.serif, italic: true, weight: 900, color: S().ui.cream });
  },
  oldphoto(g, t, v) { // мутный снимок на старую «мыльницу»: бабушка с маленьким тобой, лицо засвечено солнцем
    const cx = E.W / 2, cy = E.H * 0.5; g.save(); g.translate(cx, cy); g.rotate(-0.04);
    rr(g, -400, -300, 800, 600, 8); g.fillStyle = '#f4ecd8'; g.fill(); g.save(); rr(g, -360, -260, 720, 450, 4); g.clip(); scene(g, -360, -260, 720, 450, v.clear ? 'kitchen' : 'yard');
    granny(g, -40, 380, 2.1, { e: 'happy', flour: v.clear }); if (!v.clear) who(g, 'maxk', 110, 330, 2.1, { f: -1, e: 'happy', p: 'wave' });
    if (!v.clear) { glow(g, -10, -120, 260, '#ffffff', 0.95); glow(g, -10, -120, 160, '#ffffff', 1); g.fillStyle = alpha('#f4e0b0', 0.35); g.fillRect(-360, -260, 720, 450); }
    g.restore(); text(g, v.cap || (v.clear ? 'бабушка · 2010' : 'фото, 2010'), 0, 240, { size: 36, font: FONTS.serif, italic: true, weight: 900, color: '#5a4a44' });
    if (!v.clear) { g.fillStyle = alpha('#c8a070', 0.18); g.fillRect(-400, -300, 800, 600); }
    g.restore();
  },
  chargers(g, t, v) { // зарядки 2010 года не подходят к разъёму телефона
    const cy = E.H * 0.55; rr(g, 120, cy - 260, 900, 520, 16); g.fillStyle = '#8a6a44'; g.fill(); rr(g, 150, cy - 230, 840, 460, 10); g.fillStyle = '#5a4430'; g.fill();
    const plugs = [['РАСКЛАДУШКА', 'round'], ['ПЛЕЕР', 'mini'], ['СТАРЫЙ USB', 'wide']]; plugs.forEach(([lab, kind], i) => { const x = 300 + i * 260, y = cy - 40; seg(g, [[x - 60, y + 160], [x - 20, y + 60], [x, y]], 10, '#1a1a20'); rr(g, x - 30, y - 90, 60, 90, 10); g.fillStyle = '#2a2a30'; g.fill();
      if (kind === 'round') circle(g, x, y - 110, 10, '#c9ccd4'); else { rr(g, x - (kind === 'wide' ? 22 : 12), y - 112, kind === 'wide' ? 44 : 24, 20, 3); g.fillStyle = '#c9ccd4'; g.fill(); }
      text(g, lab, x, y + 190, { size: 26, font: FONTS.ui, weight: 900, color: '#f4efe6' });
      const k = clamp((t - 0.6 - i * 0.5) / 0.3); if (k > 0) { seg(g, [[x - 40 * k, y - 170 - 40 * k], [x + 40 * k, y - 170 + 40 * k]], 12, '#e04a3a'); seg(g, [[x + 40 * k, y - 170 - 40 * k], [x - 40 * k, y - 170 + 40 * k]], 12, '#e04a3a'); } });
    const px = 1460; rr(g, px - 130, cy - 300, 260, 520, 40); g.fillStyle = '#0c0d12'; g.fill(); rr(g, px - 116, cy - 286, 232, 492, 30); g.fillStyle = '#1d2a44'; g.fill(); rr(g, px - 34, cy + 200, 68, 22, 11); g.fillStyle = '#c9ccd4'; g.fill();
    text(g, 'НУЖЕН ЭТОТ РАЗЪЁМ', px, cy - 360, { size: 34, font: FONTS.ui, weight: 900, color: S().ui.cream }); if (v.sub) text(g, v.sub, E.W / 2, E.H * 0.93, { size: 44, font: FONTS.ui, weight: 900, color: '#ffd47e' });
  },
  iphone(g, t, v) { // июнь 2010: выходит iPhone 4, а у тебя телефон на 15 лет новее
    const y = E.H * 0.55; for (const [x, lab, sub, nw] of [[E.W * 0.3, 'iPhone 4', 'ИЮНЬ 2010 · НОВИНКА', false], [E.W * 0.7, 'ТВОЙ ТЕЛЕФОН', '+15 ЛЕТ', true]]) {
      const w = nw ? 280 : 200, h = nw ? 560 : 400; rr(g, x - w / 2 - 12, y - h / 2 - 12, w + 24, h + 24, nw ? 40 : 30); g.fillStyle = nw ? '#0c0d12' : '#1a1a20'; g.fill(); rr(g, x - w / 2, y - h / 2, w, h, nw ? 30 : 14); g.fillStyle = nw ? linGrad(g, 0, y - h / 2, 0, y + h / 2, ['#2a3a7a', '#e8906a']) : '#2a3040'; g.fill();
      if (!nw) { circle(g, x, y + h / 2 + 2, 14, '#3a3a44'); for (let i = 0; i < 12; i++) { rr(g, x - 80 + (i % 4) * 44, y - 160 + Math.floor(i / 4) * 60, 34, 34, 8); g.fillStyle = ['#3fb950', '#3a6ea5', '#f2b84a', '#e04a3a'][i % 4]; g.fill(); } }
      text(g, lab, x, y - h / 2 - 70, { size: 52, font: FONTS.ui, weight: 900, color: S().ui.cream }); text(g, sub, x, y + h / 2 + 70, { size: 40, font: FONTS.ui, weight: 900, color: nw ? '#ffd47e' : '#9fb6d8' }); }
  },
  game(g, t, v) { // телефон в руках: игра с бегущим мальчиком или видео с котами
    const cx = E.W / 2, cy = E.H * 0.52, w = 860, h = 480; rr(g, cx - w / 2 - 22, cy - h / 2 - 22, w + 44, h + 44, 50); g.fillStyle = '#0c0d12'; g.fill();
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 30); g.clip();
    if (v.mode === 'cats') { g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#f2dcb0', '#c8a070']); g.fillRect(cx - w / 2, cy - h / 2, w, h); const jx = Math.sin(t * 3) * 120;
      for (const [dx, col, s] of [[-180 + jx, '#f2b06a', 1.2], [160, '#9aa0aa', 1]]) { const x = cx + dx, y = cy + 120; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 90 * s, 60 * s, 0, 0, 7); g.fill(); circle(g, x + 70 * s, y - 60 * s, 46 * s, col); poly(g, [[x + 36 * s, y - 90 * s], [x + 48 * s, y - 140 * s], [x + 70 * s, y - 100 * s]], col); poly(g, [[x + 80 * s, y - 100 * s], [x + 100 * s, y - 140 * s], [x + 108 * s, y - 86 * s]], col); circle(g, x + 58 * s, y - 64 * s, 6 * s, '#141414'); circle(g, x + 86 * s, y - 64 * s, 6 * s, '#141414'); }
      FX.rings(g, cx, cy, t, { count: 2, r0: 60, r1: 200, color: '#ffffff', a: 0.15 }); }
    else { g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#5aa0e8', '#bfe0f4']); g.fillRect(cx - w / 2, cy - h / 2, w, h); const off = (t * 600) % 200;
      for (let i = -1; i < 6; i++) { const x = cx - w / 2 + i * 200 - off; rr(g, x, cy + 80, 180, 160, 6); g.fillStyle = '#b07a4a'; g.fill(); g.fillStyle = '#7ab060'; g.fillRect(x, cy + 80, 180, 20); if (i % 2) { circle(g, x + 90, cy + 20, 16, '#f2c21a'); } }
      drawFigure(g, { x: cx - 180, y: cy + 80 - Math.abs(Math.sin(t * 6)) * 60, s: 0.9, facing: 1, outfit: { top: 'tshirt', color: '#e04a3a', legs: '#3a5280', head: 'cap', headColor: '#e04a3a' }, pose: POSES.jump, expr: 'joy', rim: false, shadow: false });
      text(g, String(1200 + Math.floor(t * 137)), cx + w / 2 - 80, cy - h / 2 + 50, { size: 40, font: FONTS.ui, weight: 900, color: '#ffffff', align: 'right' }); }
    g.restore(); if (v.batt != null) { battery(g, cx + w / 2 - 110, cy - h / 2 - 90, 90, v.batt); text(g, `${v.batt}%`, cx + w / 2 - 130, cy - h / 2 - 70, { size: 34, font: FONTS.ui, weight: 900, color: '#fff', align: 'right' }); }
  },
  compote(g, t, v) { // стакан компота переходит к другому
    const cx = E.W / 2 + lerp(0, v.dx ?? 0, ease.inOut(prog(t, v.at ?? 0.6, (v.at ?? 0.6) + 0.8))), cy = E.H * 0.6;
    g.save(); rr(g, cx - 120, cy - 220, 240, 300, 18); g.clip(); g.fillStyle = alpha('#ffffff', 0.2); g.fillRect(cx - 120, cy - 220, 240, 300); g.fillStyle = linGrad(g, 0, cy - 130, 0, cy + 80, ['#e8705a', '#a03a3a']); g.fillRect(cx - 120, cy - 130 + Math.sin(t * 3) * 4, 240, 220);
    for (const [x, y, c] of [[-50, 20, '#f2c21a'], [30, 50, '#c0453a'], [60, -10, '#f2c21a']]) circle(g, cx + x, cy + y, 22, c); g.restore();
    rr(g, cx - 120, cy - 220, 240, 300, 18); g.strokeStyle = alpha('#ffffff', 0.7); g.lineWidth = 6; g.stroke(); seg(g, [[cx - 80, cy - 190], [cx - 80, cy + 40]], 8, alpha('#ffffff', 0.4));
    text(g, v.cap || 'КОМПОТ', E.W / 2, E.H * 0.16, { size: 64, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 14, glowColor: 'rgba(255,200,120,.5)' }); if (v.sub) text(g, v.sub, E.W / 2, E.H * 0.9, { size: 44, font: FONTS.serif, italic: true, weight: 900, color: S().ui.cream });
  },
  score(g, t, v) { // табло финала: ИСПАНИЯ — НИДЕРЛАНДЫ
    const cx = E.W / 2, cy = E.H * 0.48; rr(g, cx - 720, cy - 170, 1440, 340, 30); g.fillStyle = '#10141e'; g.fill(); rr(g, cx - 720, cy - 170, 1440, 340, 30); g.strokeStyle = '#3a4a6a'; g.lineWidth = 6; g.stroke();
    const goal = v.goal != null && t > v.goal, a = goal ? 1 : 0; text(g, 'ИСПАНИЯ', cx - 440, cy - 30, { size: 66, font: FONTS.ui, weight: 900, color: '#ffffff' }); text(g, 'НИДЕРЛАНДЫ', cx + 440, cy - 30, { size: 60, font: FONTS.ui, weight: 900, color: '#ffffff' });
    rr(g, cx - 66, -100 + cy, 132, 50, 0); text(g, `${a} : 0`, cx, cy - 20, { size: 130, font: FONTS.ui, weight: 900, color: goal ? '#ffd47e' : '#ffffff', glow: goal ? 24 : 0, glowColor: 'rgba(255,210,120,.7)' });
    rr(g, cx - 120, cy + 80, 240, 64, 14); g.fillStyle = '#e04a3a'; g.fill(); text(g, v.min || "116'", cx, cy + 113, { size: 44, font: FONTS.ui, weight: 900, color: '#fff' });
    text(g, v.title || 'ФИНАЛ · 11 ИЮЛЯ 2010', cx, cy - 250, { size: 48, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 3 });
    if (goal) { FX.rings(g, cx, cy, t - v.goal, { count: 3, r0: 100, r1: 700, color: '#ffd47e', a: 0.4 }); text(g, v.who || 'ГОЛ! ИНЬЕСТА', cx, cy + 260, { size: 80, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 18, glowColor: 'rgba(255,200,120,.6)' }); }
  },
  bet(g, t, v) { // квитанция ставки
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(0.03); rr(g, -330, -380, 660, 760, 6); g.fillStyle = '#fbf8f1'; g.fill(); for (let x = -330; x < 330; x += 30) poly(g, [[x, 380], [x + 15, 396], [x + 30, 380]], '#fbf8f1');
    const L = [['СТАВКА', 900, 56], ['ЧЕМПИОНАТ МИРА 2010', 800, 32], ['ФИНАЛ', 800, 32], ['ИСПАНИЯ — ПОБЕДА', 900, 40], ['СЧЁТ 1:0', 900, 40], ['СУММА: 500 ₽', 900, 44]];
    L.forEach(([s, w, z], i) => text(g, s, 0, -300 + i * 92, { size: z, font: FONTS.ui, weight: w, color: '#2a2630' })); seg(g, [[-280, -240], [280, -240]], 3, alpha('#2a2630', 0.4));
    if (v.win != null && t > v.win) { const k = ease.outBack(clamp((t - v.win) / 0.4)); g.save(); g.translate(40, 250); g.rotate(-0.2); g.scale(k, k); rr(g, -170, -60, 340, 120, 14); g.strokeStyle = '#3fb950'; g.lineWidth = 10; g.stroke(); text(g, 'ВЫИГРЫШ', 0, 4, { size: 60, font: FONTS.ui, weight: 900, color: '#3fb950' }); g.restore(); }
    g.restore();
  },
  thermo(g, t, v) { // термометр: 38,2 — самый жаркий день
    const cx = E.W * 0.36, cy = E.H * 0.5; const k = ease.out(prog(t, 0.3, 2.0)); rr(g, cx - 40, cy - 380, 80, 640, 40); g.fillStyle = '#e8ecf0'; g.fill(); circle(g, cx, cy + 300, 90, '#e04a3a'); rr(g, cx - 22, cy + 240 - 600 * k, 44, 600 * k + 20, 22); g.fillStyle = '#e04a3a'; g.fill();
    for (let i = 0; i < 9; i++) seg(g, [[cx + 50, cy + 220 - i * 70], [cx + 80, cy + 220 - i * 70]], 4, '#f4efe6');
    glow(g, cx, cy + 300, 260, '#ff6a3a', 0.4); text(g, `${lerp(20, 38.2, k).toFixed(1).replace('.', ',')}°`, E.W * 0.66, cy - 60, { size: 200, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 24, glowColor: 'rgba(255,140,60,.6)' });
    text(g, v.sub || '29 ИЮЛЯ 2010 · МОСКВА', E.W * 0.66, cy + 110, { size: 44, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 }); text(g, 'САМЫЙ ЖАРКИЙ ДЕНЬ В ИСТОРИИ', E.W * 0.66, cy + 180, { size: 34, font: FONTS.ui, weight: 900, color: '#ff8a5a', alpha: clamp((t - 1.6) / 0.4) });
  },
  memo(g, t, v) { // заметка в телефоне — без заглавных, твоими сокращениями
    const cx = E.W / 2, cy = E.H * 0.52, w = 580, h = 880, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#fbf7e8');
    text(g, 'Заметки', x0 + 40, cy - h / 2 + 60, { size: 40, font: FONTS.ui, weight: 900, color: '#c9a020', align: 'left' }); text(g, v.date || 'пн, 2026 · 23:58', x0 + 40, cy - h / 2 + 110, { size: 26, font: FONTS.ui, weight: 800, color: '#9a9080', align: 'left' });
    let y = cy - h / 2 + 180; (v.lines || []).forEach((ln, i) => { const a = clamp((t - 0.3 - i * (v.step ?? 0.5)) / 0.3); if (a <= 0) return; const L = wrap(g, ln, w - 80, 34, 800); g.save(); g.globalAlpha *= a; L.forEach((s, k) => text(g, s, x0 + 40, y + k * 46, { size: 34, font: FONTS.ui, weight: 800, color: i === v.hi ? '#c0453a' : '#2a2630', align: 'left' })); g.restore(); y += L.length * 46 + 18; });
  },
  rec2(g, t, v) { // запись видео на телефон: видоискатель, REC, заряд, субтитр
    const cx = E.W / 2, cy = E.H * 0.47, w = 1100, h = 620; rr(g, cx - w / 2 - 22, cy - h / 2 - 22, w + 44, h + 44, 50); g.fillStyle = '#0c0d12'; g.fill();
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 30); g.clip(); scene(g, cx - w / 2, cy - h / 2, w, h, v.bg || 'kitchen');
    if (v.close) { granny(g, cx, cy + h / 2 + 470, 4.2, { e: v.e || 'smile', hat: v.hat, flour: v.flour }); } else { granny(g, cx - 40, cy + h / 2 + 30, 2.4, { e: v.e || 'happy', hat: v.hat, flour: v.flour, p: v.p }); if (v.kid) who(g, 'maxk', cx + 200, cy + h / 2 + 30, 2.4, { f: -1, e: 'happy' }); }
    if (v.off != null && t > v.off) { g.fillStyle = '#000'; g.fillRect(cx - w / 2, cy - h / 2, w, h); }
    g.restore();
    if (!(v.off != null && t > v.off)) { if (Math.floor(t * 2) % 2) circle(g, cx - w / 2 + 50, cy - h / 2 + 50, 16, '#e04a3a'); text(g, 'REC', cx - w / 2 + 110, cy - h / 2 + 50, { size: 34, font: FONTS.ui, weight: 900, color: '#ffffff' });
      const s = Math.floor(t); text(g, `00:${String(Math.min(59, s + (v.t0 || 0))).padStart(2, '0')}`, cx, cy - h / 2 + 50, { size: 34, font: FONTS.ui, weight: 900, color: '#ffffff' });
      if (v.batt != null) { battery(g, cx + w / 2 - 130, cy - h / 2 + 32, 80, v.batt); text(g, `${v.batt}%`, cx + w / 2 - 150, cy - h / 2 + 50, { size: 30, font: FONTS.ui, weight: 900, color: pctCol(v.batt), align: 'right' }); }
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { seg(g, [[cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 30)], [cx + sx * (w / 2 - 90), cy + sy * (h / 2 - 30)]], 5, '#ffffff'); seg(g, [[cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 30)], [cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 90)]], 5, '#ffffff'); } }
    if (v.line) { const L = wrap(g, v.line, E.W - 260, 46, 900, FONTS.serif, true); L.slice(0, 2).forEach((s, i) => text(g, s, cx, cy + h / 2 + 70 + i * 56, { size: 46, font: FONTS.serif, italic: true, weight: 900, color: S().ui.cream })); }
  },
  clips(g, t, v) { // список записей: каждая стоит процентов
    const cx = E.W / 2, top = E.H * 0.18; const L = v.items || []; let total = v.start ?? 23;
    text(g, v.title || 'ЧТО ПОМЕСТИТСЯ В ТЕЛЕФОН', cx, top - 40, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
    L.forEach(([lab, p, kind], i) => { const a = clamp((t - 0.3 - i * (v.step ?? 0.8)) / 0.3); if (a <= 0) return; total -= p; const y = top + 60 + i * 150; g.save(); g.globalAlpha *= a;
      rr(g, cx - 640, y, 1280, 124, 20); g.fillStyle = alpha('#141a28', 0.85); g.fill(); g.save(); rr(g, cx - 624, y + 12, 160, 100, 10); g.clip(); scene(g, cx - 624, y + 12, 160, 100, kind || 'kitchen'); granny(g, cx - 544, y + 200, 0.7, { flour: kind === 'kitchen' }); g.restore();
      if (kind !== 'photo') poly(g, [[cx - 556, y + 46], [cx - 556, y + 78], [cx - 528, y + 62]], alpha('#ffffff', 0.85));
      text(g, lab, cx - 430, y + 62, { size: fit(g, lab, 800, 38, 900), font: FONTS.ui, weight: 900, color: '#f4efe6', align: 'left' }); text(g, `−${p}%`, cx + 600, y + 62, { size: 54, font: FONTS.ui, weight: 900, color: '#ff8a5a', align: 'right' }); g.restore(); });
    if (v.total !== false) { battery(g, cx + 420, E.H - 140, 110, Math.max(0, total)); text(g, `${Math.max(0, total)}%`, cx + 400, E.H - 116, { size: 56, font: FONTS.ui, weight: 900, color: pctCol(total), align: 'right' }); }
  },
  album10(g, t, v) { // галерея: альбом «2010», которого раньше не было
    const cx = E.W / 2, cy = E.H * 0.52, w = 560, h = 880; phoneFrame(g, cx, cy, w, h, '#141a28');
    text(g, 'Альбом «2010»', cx, cy - h / 2 + 60, { size: 40, font: FONTS.ui, weight: 900, color: '#ffd47e' });
    const items = [['kitchen', 'фото'], ['kitchen', 'пирожки'], ['room', 'колыбельная'], ['room', 'мультик'], ['yard', 'калитка · 1:00']];
    items.forEach(([k, lab], i) => { const a = clamp((t - 0.4 - i * (v.step ?? 0.35)) / 0.3); if (a <= 0) return; const col = i % 2, row = Math.floor(i / 2), x = cx - w / 2 + 30 + col * 255, y = cy - h / 2 + 110 + row * 240, tw = i === 4 ? 500 : 245, th = 220;
      g.save(); g.globalAlpha *= a; rr(g, x, y, tw, th, 10); g.clip(); scene(g, x, y, tw, th, k); granny(g, x + tw / 2, y + th + 110, 1.2, { flour: k === 'kitchen', hat: k === 'yard', e: i === 4 ? 'smile' : 'happy' }); if (i) poly(g, [[x + 16, y + th - 40], [x + 16, y + th - 14], [x + 38, y + th - 27]], '#ffffff');
      rr(g, x, y + th - 44, tw, 44, 0); g.fillStyle = alpha('#000000', 0.45); g.fill(); text(g, lab, x + tw - 14, y + th - 22, { size: 24, font: FONTS.ui, weight: 900, color: '#ffffff', align: 'right' }); g.restore(); });
  },
  order(g, t, v) { // приказ о премии с подписью
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.02); rr(g, -420, -460, 840, 920, 6); g.fillStyle = '#fbf8f1'; g.fill();
    text(g, 'ПРИКАЗ', 0, -380, { size: 64, font: FONTS.ui, weight: 900, color: '#2a2630', spacing: 6 }); text(g, 'о выплате премии', 0, -315, { size: 38, font: FONTS.ui, weight: 800, color: '#2a2630' });
    ['Менеджеру по продажам', 'Максиму — премию', 'ПОЛНОСТЬЮ.', '', 'Директор: С. Н.'].forEach((s, i) => text(g, s, -340, -200 + i * 70, { size: 38, font: FONTS.ui, weight: i === 2 ? 900 : 800, color: i === 2 ? '#c0453a' : '#2a2630', align: 'left' }));
    const k = clamp((t - 0.6) / 0.8); g.strokeStyle = '#2a3a8a'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 40 * k; i++) { const x = 40 + i * 7, y = 120 + Math.sin(i * 0.7) * 26 - i * 1.2; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    if (t > 1.5) { const s = ease.outBack(clamp((t - 1.5) / 0.4)); g.save(); g.translate(-160, 300); g.rotate(-0.2); g.scale(s, s); ring(g, 0, 0, 110, 8, '#c0453a'); text(g, 'ОДОБРЕНО', 0, 0, { size: 40, font: FONTS.ui, weight: 900, color: '#c0453a' }); g.restore(); }
    g.restore();
  },
  frame(g, t, v) { // мутное фото в рамке и новая заставка на телефоне
    const cy = E.H * 0.52; g.fillStyle = linGrad(g, 0, cy + 200, 0, E.H, ['#8a6a4a', '#5a4430']); g.fillRect(-E.W, cy + 200, E.W * 3, E.H);
    const fx = E.W * 0.34; rr(g, fx - 250, cy - 300, 500, 520, 10); g.fillStyle = '#6a4a30'; g.fill(); g.save(); rr(g, fx - 210, cy - 260, 420, 440, 4); g.clip(); scene(g, fx - 210, cy - 260, 420, 440, 'yard'); granny(g, fx - 20, cy + 480, 2, {}); who(g, 'maxk', fx + 90, cy + 420, 2, { f: -1, e: 'happy' }); glow(g, fx - 10, cy - 100, 200, '#ffffff', 0.95); g.fillStyle = alpha('#f4e0b0', 0.35); g.fillRect(fx - 210, cy - 260, 420, 440); g.restore();
    const px = E.W * 0.7, w = 360, h = 640; phoneFrame(g, px, cy - 20, w, h, '#14182a'); g.save(); rr(g, px - w / 2, cy - 20 - h / 2, w, h, 36); g.clip(); scene(g, px - w / 2, cy - 20 - h / 2, w, h, 'kitchen'); granny(g, px, cy + 420, 2.2, { flour: true, e: 'happy' }); g.restore();
    text(g, '07:00', px, cy - 230, { size: 70, font: FONTS.ui, weight: 900, color: '#ffffff', glow: 10, glowColor: 'rgba(0,0,0,.6)' });
  },
};

export const BP4 = {
  amnesia(g, t, v) { // детская амнезия: сколько помнят в 5–7 и в 8–9 лет
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, base = E.H * 0.8;
    text(g, v.title || 'ДЕТСКАЯ АМНЕЗИЯ', E.W / 2, E.H * 0.13, { size: 60, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    if (v.sub) text(g, v.sub, E.W / 2, E.H * 0.22, { size: 36, font: FONTS.ui, weight: 900, color: gold });
    const bars = v.bars || [['5–7 ЛЕТ', 0.6, 'больше половины'], ['8–9 ЛЕТ', 0.34, 'около трети']];
    bars.forEach(([lab, val, s], i) => { const x = E.W * (0.33 + i * 0.34), k = ease.out(prog(t, 0.4 + i * 0.6, 1.4 + i * 0.6)), h = 520 * val * k; rr(g, x - 120, base - h, 240, h, 10); g.fillStyle = alpha(i ? acc : gold, 0.8); g.fill();
      text(g, lab, x, base + 50, { size: 44, font: FONTS.ui, weight: 900, color: c }); if (k > 0.9) text(g, s, x, base - h - 40, { size: 38, font: FONTS.ui, weight: 900, color: i ? acc : gold }); });
    seg(g, [[E.W * 0.15, base], [E.W * 0.85, base]], 5, c);
  },
  brain(g, t, v) { // мозг ребёнка растёт — новые воспоминания вытесняют старые
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W / 2, cy = E.H * 0.55, r = 200 + 30 * clamp(t / 3);
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, r * 1.3, r, 0, 0, 7); g.stroke(); seg(g, [[cx, cy - r], [cx, cy + r]], 3, alpha(c, 0.5));
    for (let i = 0; i < 14; i++) { const a = i * 2.4, rr2 = (i % 5) * 34 + 30, k = clamp((t - i * 0.18) / 0.3); circle(g, cx + Math.cos(a) * rr2 * 1.3, cy + Math.sin(a) * rr2 * 0.9, 14 * k, i < 6 ? alpha(acc, 1 - clamp((t - 1.2 - i * 0.2) / 0.5) * 0.8) : gold); }
    text(g, v.title || 'НОВЫЕ ВОСПОМИНАНИЯ ВЫТЕСНЯЮТ СТАРЫЕ', cx, E.H * 0.14, { size: 50, font: FONTS.ui, weight: 900, color: c, spacing: 2 });
  },
};
