// shots/extra5.js — вставки и схемы «Что, если над каждым висит таймер жизни?».
// Вставки: зеркало / селфи с пустотой над головой, руки на груди (непрямой массаж), дефибриллятор крупно, сообщение.
// Схемы: правила цветов, гигантский таймер, массаж сердца, утолщённая стенка сердца, сожаления, связанные таймеры,
// большой процент, «50 на 50», море таймеров.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { fit } from './extra.js';
import { fmtLife } from './director.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418';
const RED = '#ff4a4a', YEL = '#ffc83a', GRN = '#4ad07a';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1, align = 'center') => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a, align });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
function pill(g, x, y, s, c, size = 60, a = 1) {
  g.save(); g.globalAlpha *= a; g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(s).width + s.length * 2 + size * 0.9, h = size * 1.5;
  rr(g, x - w / 2, y - h / 2, w, h, size * 0.3); g.fillStyle = 'rgba(10,8,16,.85)'; g.fill(); g.strokeStyle = alpha(c, 0.85); g.lineWidth = size * 0.07; g.stroke();
  glow(g, x, y, w * 0.6, c, 0.16); text(g, s, x, y + 2, { size, font: FONTS.ui, weight: 900, color: c, glow: 18, glowColor: alpha(c, 0.7), spacing: 2 }); g.restore();
}
function emptyBox(g, x, y, w, h, t) { g.save(); g.setLineDash([18, 14]); g.lineDashOffset = -t * 20; rr(g, x - w / 2, y - h / 2, w, h, 16); g.strokeStyle = 'rgba(220,226,240,.55)'; g.lineWidth = 5; g.stroke(); g.restore(); }
function headBust(g, cx, cy, r, color) { circle(g, cx, cy, r, INK); g.fillStyle = color; g.beginPath(); g.ellipse(cx, cy + r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill(); for (const dx of [-0.34, 0.34]) circle(g, cx + dx * r, cy - r * 0.16, r * 0.11, '#f4efe6'); }

export const INS7 = {
  mirror2(g, t, v) { // зеркало: над головой пусто
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 440, cy - 440, 880, 840, 30); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, cx - 410, cy - 410, 820, 780, 20); g.fillStyle = linGrad(g, 0, cy - 410, 0, cy + 370, ['#8a9ab0', '#5a6a80']); g.fill();
    g.save(); rr(g, cx - 410, cy - 410, 820, 780, 20); g.clip(); const r = 220; headBust(g, cx, cy + 110, r, OR);
    seg(g, [[cx - 50, cy + 110 + r * 0.34], [cx + 50, cy + 110 + r * 0.34]], 12, '#f4efe6');
    poly(g, [[cx + 140, cy - 410], [cx + 260, cy - 410], [cx - 60, cy + 370], [cx - 180, cy + 370]], 'rgba(255,255,255,.08)'); g.restore();
    if (v.cap) { text(g, v.cap, cx, E.H * 0.95, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 14 }); }
  },
  selfie(g, t, v) { // селфи на телефоне: пусто
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 270, cy - 460, 540, 880, 56); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - 240, cy - 425, 480, 810, 28); g.fillStyle = linGrad(g, 0, cy - 425, 0, cy + 385, ['#a898c0', '#6a5a80']); g.fill();
    g.save(); rr(g, cx - 240, cy - 425, 480, 810, 28); g.clip(); headBust(g, cx, cy + 120, 170, OR); seg(g, [[cx - 40, cy + 178], [cx + 40, cy + 178]], 10, '#f4efe6'); g.restore();
    const fl = clamp(1 - Math.abs(t - 0.4) / 0.15); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, E.W, E.H); }
    if (v.cap) text(g, v.cap, cx, E.H * 0.95, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 14 });
  },
  cpr(g, t, v) { // руки на груди: давишь
    const cx = E.W / 2, cy = E.H * 0.6, k = Math.max(0, Math.sin(t * Math.PI * 2 * (v.rate || 1.8))), d = k * 30;
    g.fillStyle = v.shirt || '#4a5a4a'; g.beginPath(); g.ellipse(cx, cy + 260, 760, 300, 0, Math.PI, Math.PI * 2); g.fill(); g.fillStyle = shade(v.shirt || '#4a5a4a', -0.2); g.fillRect(cx - 760, cy + 255, 1520, 300);
    for (const [dx, a] of [[-1, -0.32], [1, 0.32]]) { g.save(); g.translate(cx + dx * 70, cy - 90 + d); g.rotate(a); rr(g, -85, -900, 170, 900, 80); g.fillStyle = OR; g.fill(); rr(g, -92, -60, 184, 70, 30); g.fillStyle = shade(OR, -0.25); g.fill(); g.restore(); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy - 10 + d, 190, 95, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx, cy - 80 + d, 170, 80, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(cx - 120 + i * 80, cy - 130 + d, 34, 22, 0, 0, 7); g.fill(); }
    if (v.count !== false) { const n = Math.floor(t * (v.rate || 1.8)) % 30 + 1; text(g, String(n), cx + 520, cy - 300, { size: 140, font: FONTS.ui, weight: 900, color: S().ui.gold, glow: 20 }); }
    if (v.cap) text(g, v.cap, cx, E.H * 0.12, { size: 54, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 14 });
    if (v.tm) pill(g, cx - 560, E.H * 0.3, v.tm[Math.floor(t * 2.2) % v.tm.length], RED, 54, (t * 4) % 1 < 0.7 ? 1 : 0.35);
  },
  aedcu(g, t, v) { // дефибриллятор крупно
    const cx = E.W / 2, cy = E.H * 0.52; rr(g, cx - 420, cy - 300, 840, 600, 50); g.fillStyle = '#2aa05a'; g.fill(); rr(g, cx - 380, cy - 260, 760, 520, 30); g.fillStyle = '#f4f1ea'; g.fill();
    rr(g, cx - 300, cy - 210, 600, 200, 16); g.fillStyle = '#10141e'; g.fill(); const st = v.step || 'pads';
    const msg = { pads: 'НАКЛЕЙТЕ ЭЛЕКТРОДЫ', away: 'НЕ КАСАЙТЕСЬ ПАЦИЕНТА', shock: 'РАЗРЯД!', cpr: 'НАЧНИТЕ МАССАЖ' }[st] || st;
    text(g, msg, cx, cy - 110, { size: fit(g, msg, 540, 50, 900), font: FONTS.ui, weight: 900, color: st === 'shock' ? '#ff6a4a' : '#7fe0a0', glow: 12 });
    const blink = (t * 3) % 1 < 0.6; circle(g, cx - 140, cy + 120, 60, st === 'pads' && blink ? '#ffd23a' : '#a08a3a'); circle(g, cx + 140, cy + 120, 70, st === 'shock' && blink ? '#ff3a2a' : '#8a3a2a');
    poly(g, [[cx + 150, cy + 80], [cx + 120, cy + 125], [cx + 145, cy + 125], [cx + 130, cy + 165], [cx + 165, cy + 112], [cx + 140, cy + 112]], '#fff');
    if (st === 'shock') { const f = clamp(1 - Math.abs(t - 0.5) / 0.12); if (f > 0) { g.fillStyle = `rgba(255,255,255,${f * 0.8})`; g.fillRect(0, 0, E.W, E.H); } }
    // волны голоса
    for (let i = 0; i < 3; i++) { g.strokeStyle = alpha('#2aa05a', 0.6 - i * 0.15); g.lineWidth = 8; g.beginPath(); g.arc(cx + 440, cy - 110, 40 + i * 40 + ((t * 60) % 40), -0.7, 0.7); g.stroke(); }
  },
  msg(g, t, v) { // телефон: сообщения без ответа
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 300, cy - 500, 600, 1000, 60); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - 270, cy - 460, 540, 920, 30); g.fillStyle = '#1a2030'; g.fill();
    text(g, v.title || 'ЛЁХА', cx, cy - 400, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' });
    (v.lines || ['Лёх, прости', 'Ты где?', 'Ответь, пожалуйста']).forEach((s, i) => { const a = fadeIn(t, 0.3 + i * 0.6); g.save(); g.globalAlpha = a; rr(g, cx - 40 - s.length * 13, cy - 280 + i * 120, s.length * 26 + 60, 80, 24); g.fillStyle = OR; g.fill(); text(g, s, cx - 10, cy - 240 + i * 120, { size: 36, font: FONTS.ui, weight: 800, color: '#fff' }); g.restore(); });
    if (v.read !== false) text(g, v.sub || 'не прочитано', cx + 130, cy + 120, { size: 28, font: FONTS.ui, weight: 800, color: '#8a90a0' });
  },
};

export const BP7 = {
  rules(g, t, v) { // правила: красный / жёлтый / зелёный
    UI.blueprint(g); const c = UI.bpStroke(); T(g, v.title || 'ПРАВИЛА', E.H * 0.14, 60);
    const R = [['< 5 ЛЕТ', '3Г 114Д', RED], ['5–15 ЛЕТ', '11 ЛЕТ', YEL], ['> 15 ЛЕТ', '52 ГОДА', GRN]]; const n = v.only ?? 3;
    R.slice(0, n).forEach(([lab, val, col], i) => { const a = fadeIn(t, 0.2 + (i === n - 1 ? 0.2 : 0) + (v.all ? i * 0.4 : 0)), x = E.W * (0.22 + i * 0.28); pill(g, x, E.H * 0.44, val, col, 64, a); Lb(g, lab, x, E.H * 0.62, 54, col, a); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.84, 48, S().ui.gold, fadeIn(t, 0.8));
  },
  bigtimer(g, t, v) { // огромный таймер
    UI.blueprint(g); if (v.title) T(g, v.title, E.H * 0.16, 56);
    let s = v.s; if (s == null) { const sec = Array.isArray(v.sec) ? lerp(v.sec[0], v.sec[1], ease.inOut(clamp(t / (v.secT || 2)))) : v.sec - t * (v.rate ?? 1); s = fmtLife(sec, v.fmt); }
    if (v.glitch && (t * 3) % 1 < 0.6) s = /^\d\d:\d\d:\d\d$/.test(s) ? fmtLife(((Math.floor(t * 3) * 7919) % 300) + 20, 'hms') : s.replace(/\d+/g, (n) => String(Math.max(1, +n + ((Math.floor(t * 3) * 7) % 9) - 4)));
    const col = v.c || RED, blink = v.blink ? ((t * 3) % 1 < 0.65 ? 1 : 0.3) : 1;
    pill(g, E.W / 2, E.H * 0.5, s, col, v.size || 130, fadeIn(t, 0.1) * blink);
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.78, 50, S().ui.gold, fadeIn(t, 0.7));
  },
  cprbp(g, t, v) { // как давить
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'НЕПРЯМОЙ МАССАЖ СЕРДЦА', E.H * 0.12, 56);
    const cx = E.W * 0.32, cy = E.H * 0.6; g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy + 60, 300, 110, 0, Math.PI, Math.PI * 2); g.stroke(); seg(g, [[cx - 300, cy + 60], [cx + 300, cy + 60]], 6, c);
    const k = Math.max(0, Math.sin(t * Math.PI * 2 * 1.8)), d = k * 40; seg(g, [[cx, cy - 330 + d], [cx, cy - 70 + d]], 14, gold); poly(g, [[cx - 40, cy - 90 + d], [cx + 40, cy - 90 + d], [cx, cy - 40 + d]], gold);
    const items = v.items || [['100–120', 'РАЗ В МИНУТУ'], ['5–6 СМ', 'В ГЛУБИНУ'], ['СИЛЬНО', 'И БЫСТРО']];
    items.forEach(([a, b], i) => { const al = fadeIn(t, 0.3 + i * 0.5); Lb(g, a, E.W * 0.7, E.H * (0.34 + i * 0.2), 74, gold, al); Lb(g, b, E.W * 0.7, E.H * (0.34 + i * 0.2) + 62, 38, c, al); });
  },
  hcm(g, t, v) { // нормальное сердце vs утолщённая стенка
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ГИПЕРТРОФИЧЕСКАЯ КАРДИОМИОПАТИЯ', E.H * 0.12, 54);
    const draw = (x, wall, lab, col, a) => { g.save(); g.globalAlpha = a; const y = E.H * 0.52, beat = 1 + 0.03 * Math.sin(t * 7); g.translate(x, y); g.scale(beat, beat);
      g.fillStyle = alpha(col, 0.85); g.beginPath(); g.ellipse(0, 0, 210, 260, 0, 0, 7); g.fill(); g.fillStyle = '#10182a'; g.beginPath(); g.ellipse(10, 20, 210 - wall, 260 - wall, 0, 0, 7); g.fill(); g.restore();
      Lb(g, lab, x, E.H * 0.88, 44, col, a); };
    draw(E.W * 0.3, 50, 'ОБЫЧНОЕ', c, fadeIn(t, 0.2)); draw(E.W * 0.7, 130, 'СТЕНКА ТОЛЩЕ', '#ff7a6a', fadeIn(t, 0.9));
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.24, 44, gold, fadeIn(t, 1.4));
  },
  regrets(g, t, v) { // о чём жалеют
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'О ЧЁМ ЖАЛЕЮТ В КОНЦЕ', E.H * 0.12, 56);
    const L = v.lines || ['ЖИЛ НЕ СВОЕЙ ЖИЗНЬЮ', 'СЛИШКОМ МНОГО РАБОТАЛ', 'ПОТЕРЯЛ СВЯЗЬ С ДРУЗЬЯМИ']; const n = v.only ?? L.length;
    L.slice(0, n).forEach((s, i) => { const a = fadeIn(t, 0.3 + i * (v.step ?? 0.6)), y = E.H * (0.32 + i * 0.17); Lb(g, String(i + 1), E.W * 0.2, y, 80, gold, a); Lb(g, s, E.W * 0.27, y, fit(g, s, E.W * 0.68, 62, 900), c, a, 'left'); });
    if (v.cross) { const a = fadeIn(t, 0.4); Lb(g, v.cross, E.W / 2, E.H * 0.86, 50, '#ff7a6a', a); }
  },
  net(g, t, v) { // таймеры связаны
    UI.blueprint(g); const c = UI.bpStroke(); if (v.title) T(g, v.title, E.H * 0.12, 56);
    const N = v.nodes || [['ТЫ', '?', '#c8d0e0', 0.5, 0.52], ['ПАПА', '16 ЛЕТ', GRN, 0.2, 0.32], ['ЛЁХА', '51 ГОД', GRN, 0.8, 0.32], ['МУЖЧИНА ИЗ МЕТРО', '11 ЛЕТ', YEL, 0.22, 0.78], ['ДЕДУШКА', '1Г 6М', RED, 0.78, 0.78]];
    N.forEach(([, , , x, y], i) => { if (i) { const a = fadeIn(t, 0.4 + i * 0.3); g.save(); g.globalAlpha = a; seg(g, [[E.W * N[0][3], E.H * N[0][4]], [E.W * x, E.H * y]], 5, alpha(c, 0.7)); g.restore(); } });
    N.forEach(([lab, val, col, x, y], i) => { const a = fadeIn(t, 0.2 + i * 0.3); if (i === 0) { g.save(); g.globalAlpha *= a; circle(g, E.W * x, E.H * y, 46, OR); g.restore(); Lb(g, lab, E.W * x, E.H * y + 80, 40, c, a); return; } pill(g, E.W * x, E.H * y, val, col, 50, a); Lb(g, lab, E.W * x, E.H * y + 70, 34, c, a); });
    // бегущие импульсы
    N.slice(1).forEach(([, , col, x, y], i) => { const k = (t * 0.5 + i * 0.25) % 1; circle(g, lerp(E.W * N[0][3], E.W * x, k), lerp(E.H * N[0][4], E.H * y, k), 9, S().ui.gold); });
  },
  pct(g, t, v) { // большой процент с кольцом
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; if (v.title) T(g, v.title, E.H * 0.13, 56);
    const k = ease.out(prog(t, 0.2, 1.4)), cx = E.W / 2, cy = E.H * 0.52, R = 230; ring(g, cx, cy, R, 34, alpha(c, 0.25));
    g.strokeStyle = v.c || gold; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (v.p / 100) * k); g.stroke();
    { const str = (v.pre || '') + Math.round(v.p * k) + '%'; Lb(g, str, cx, cy, str.length > 4 ? 84 : 120, v.c || gold); } if (v.sub) Lb(g, v.sub, cx, E.H * 0.88, 46, c, fadeIn(t, 1));
  },
  coin(g, t, v) { // 50 на 50
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; if (v.title) T(g, v.title, E.H * 0.13, 56);
    const cx = E.W / 2, cy = E.H * 0.5, sq = Math.abs(Math.cos(t * 6 * (1 - clamp(t / 2.4)))); g.save(); g.translate(cx, cy); g.scale(Math.max(0.05, sq), 1); circle(g, 0, 0, 200, gold); ring(g, 0, 0, 170, 8, shade(gold, -0.3)); g.restore();
    Lb(g, '50 / 50', cx, cy, 90, '#2a2010', sq); if (v.sub) Lb(g, v.sub, cx, E.H * 0.86, 46, c, fadeIn(t, 1));
  },
  sea(g, t, v) { // море таймеров (метро / улица)
    UI.blueprint(g); if (v.title) T(g, v.title, E.H * 0.1, 54);
    const cols = [GRN, GRN, YEL, GRN, RED, GRN, YEL, GRN]; for (let i = 0; i < (v.n || 36); i++) { const x = E.W * (0.08 + (i % 9) * 0.105) + ((Math.floor(i / 9) % 2) * 50), y = E.H * (0.28 + Math.floor(i / 9) * 0.17), a = fadeIn(t, (i % 7) * 0.08 + Math.floor(i / 9) * 0.15);
      const yrs = 3 + ((i * 37) % 70), col = cols[(i * 5) % cols.length], s = col === RED ? `${(i % 4) + 1}Г ${(i * 13) % 300}Д` : `${yrs} ЛЕТ`; pill(g, x, y, s, col, 28, a); }
  },
};
