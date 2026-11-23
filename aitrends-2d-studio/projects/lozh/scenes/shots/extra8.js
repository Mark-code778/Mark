// shots/extra8.js — вставки, схемы и предметы «Что, если бы твоя ложь сбывалась?».
// Вставки: сообщение в телефоне, кружка (пустая → чай с паром), банк (баланс), контакты (имя исчезает), свитер с оленем,
// тарелка супа, будильник, купюры, салфетка с картой, иероглифы.
// Схемы: парадокс лжеца, ложь в день, полиграф, теория разума, миндалевидное тело, 10 недель без лжи,
// часы дружбы, эффект Пигмалиона, монетка, цепочка лжи. Предметы: фото на стене (исчезает), забор, лужа, кружка на полке.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { bigFace } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { fit, who, phoneFrame, wrap } from './extra.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418', CREAM = '#f4efe6', GOLDC = '#ffd47e';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1, align = 'center') => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a, align });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
const cap = (g, s, a = 1) => { if (s) text(g, s, E.W / 2, E.H * 0.885, { size: fit(g, s, E.W - 200, 46), font: FONTS.ui, weight: 900, color: CREAM, glow: 14, alpha: a, spacing: 2 }); };
function arrow(g, x0, y0, x1, y1, w, c, head = 22) { seg(g, [[x0, y0], [x1, y1]], w, c); const an = Math.atan2(y1 - y0, x1 - x0); poly(g, [[x1 + Math.cos(an) * head * 0.6, y1 + Math.sin(an) * head * 0.6], [x1 + Math.cos(an + 2.5) * head, y1 + Math.sin(an + 2.5) * head], [x1 + Math.cos(an - 2.5) * head, y1 + Math.sin(an - 2.5) * head]], c); }
function sparkles(g, cx, cy, R, t, k, col = GOLDC, n = 18) { if (k <= 0) return; for (let i = 0; i < n; i++) { const an = i * 2.39 + t * 1.5, r = R * (0.3 + ((i * 37) % 70) / 100), x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.8, a = k * (0.5 + 0.5 * Math.sin(t * 6 + i)); seg(g, [[x - 9, y], [x + 9, y]], 3, alpha(col, a)); seg(g, [[x, y - 9], [x, y + 9]], 3, alpha(col, a)); } }
// «ложь сбылась»: золотая вспышка с кольцами и искрами вокруг точки
export function lieFX(g, x, y, dt, sc = 1) {
  if (dt < 0 || dt > 1.4) return; const a = 1 - ease.in(dt / 1.4);
  glow(g, x, y, 420 * sc, '#ffd47e', 0.55 * a); glow(g, x, y, 200 * sc, '#fff6d8', 0.5 * a * clamp(1 - dt * 2));
  for (let j = 0; j < 3; j++) { const k = clamp(dt * 1.3 - j * 0.15); if (k > 0 && k < 1) ring(g, x, y, (60 + k * 520) * sc, 6 * sc * (1 - k), alpha('#ffe6a8', (1 - k) * a)); }
  for (let i = 0; i < 22; i++) { const an = i * 2.39, r = (80 + dt * 420 * (0.5 + ((i * 53) % 50) / 100)) * sc, px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 0.75, s = (6 + (i % 3) * 3) * sc;
    seg(g, [[px - s, py], [px + s, py]], 2.6 * sc, alpha('#fff1c8', a)); seg(g, [[px, py - s], [px, py + s]], 2.6 * sc, alpha('#fff1c8', a)); }
}

export const INS10 = {
  sms(g, t, v) { // исходящее сообщение: name, s (текст), at — когда «отправлено»
    const cx = E.W / 2, cy = E.H * 0.46, w = 480, h = 760, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#e8eef4');
    rr(g, x0, cy - h / 2, w, 110, 36); g.fillStyle = '#3a6ea5'; g.fill(); g.fillRect(x0, cy - h / 2 + 60, w, 50); Lb(g, v.name || 'Лёха', cx, cy - h / 2 + 64, 34, '#fff');
    const lines = wrap(g, v.s || '', w - 150, 30, 800), bh = 30 + lines.length * 40, bx = x0 + 70, by = cy - 40, k = fadeIn(t, v.at ?? 0.4, 0.3);
    if (v.inc) { const il = wrap(g, v.inc, w - 150, 30, 800), ih = 30 + il.length * 40; rr(g, x0 + 24, cy - h / 2 + 150, w - 110, ih, 18); g.fillStyle = '#fff'; g.fill(); il.forEach((ln, i) => text(g, ln, x0 + 44, cy - h / 2 + 175 + i * 40, { size: 30, font: FONTS.ui, weight: 800, color: '#22222a', align: 'left' })); }
    g.save(); g.globalAlpha *= k; g.translate(0, (1 - k) * 40); rr(g, bx, by, w - 94, bh, 18); g.fillStyle = '#d2f2c4'; g.fill(); lines.forEach((ln, i) => text(g, ln, bx + 20, by + 26 + i * 40, { size: 30, font: FONTS.ui, weight: 800, color: '#22222a', align: 'left' })); Lb(g, '✓✓ отправлено', bx + w - 110, by + bh + 26, 22, '#6a8aa0', 1, 'right'); g.restore();
    if (v.lie != null) sparkles(g, cx, by + bh / 2, 260, t, fadeIn(t, v.lie) * (1 - fadeIn(t, v.lie + 1.2)));
    cap(g, v.cap);
  },
  teacup(g, t, v) { // кружка: пустая → горячий чай с лимоном (at)
    const cx = E.W / 2, cy = E.H * 0.56, k = fadeIn(t, v.at ?? 99, 0.6);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, cy + 250, 330, 40, 0, 0, 7); g.fill();
    rr(g, cx - 230, cy - 200, 460, 450, 60); g.fillStyle = '#f2efe8'; g.fill(); g.strokeStyle = '#f2efe8'; g.lineWidth = 46; g.beginPath(); g.arc(cx + 260, cy + 10, 110, -1.2, 1.2); g.stroke();
    g.fillStyle = '#d8d4cc'; g.beginPath(); g.ellipse(cx, cy - 200, 230, 50, 0, 0, 7); g.fill();
    g.save(); g.globalAlpha *= k; g.fillStyle = '#c87a2a'; g.beginPath(); g.ellipse(cx, cy - 196, 210, 42, 0, 0, 7); g.fill(); circle(g, cx + 60, cy - 200, 52, '#f2e04a'); circle(g, cx + 60, cy - 200, 40, '#faf0a0');
    for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i / 4) % 1; g.strokeStyle = `rgba(240,240,250,${0.5 * Math.sin(ph * Math.PI)})`; g.lineWidth = 14; g.beginPath(); const x = cx - 120 + i * 80; g.moveTo(x, cy - 240 - ph * 40); g.bezierCurveTo(x - 40, cy - 300 - ph * 120, x + 40, cy - 360 - ph * 160, x, cy - 420 - ph * 200); g.stroke(); } g.restore();
    if (v.at != null) sparkles(g, cx, cy - 200, 320, t, fadeIn(t, v.at) * (1 - fadeIn(t, v.at + 1.2)));
    cap(g, v.cap);
  },
  bank(g, t, v) { // банковское приложение: баланс from → to в момент at
    const cx = E.W / 2, cy = E.H * 0.46, w = 480, h = 760; phoneFrame(g, cx, cy, w, h, '#0f2a24');
    Lb(g, 'МОЙ СЧЁТ', cx, cy - h / 2 + 90, 32, '#9fd8c0'); const k = ease.out(prog(t, v.at ?? 99, (v.at ?? 99) + 0.8)), n = Math.round(lerp(v.from ?? 2340, v.to ?? 1000000, k));
    Lb(g, n.toLocaleString('ru-RU') + ' ₽', cx, cy - 120, fit(g, '1 000 000 ₽', w - 60, 76), k > 0.99 && v.to ? GOLDC : '#ffffff');
    for (let i = 0; i < 4; i++) { rr(g, cx - w / 2 + 36, cy + 20 + i * 90, w - 72, 70, 14); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill(); }
    if (v.note) Lb(g, v.note, cx, cy + 20 + 35, 26, '#ff9a8a'); if (v.at != null) sparkles(g, cx, cy - 120, 300, t, fadeIn(t, v.at) * (1 - fadeIn(t, v.at + 1.4)));
    cap(g, v.cap);
  },
  contacts(g, t, v) { // контакты: «Лёха» исчезает (gone)
    const cx = E.W / 2, cy = E.H * 0.46, w = 480, h = 760; phoneFrame(g, cx, cy, w, h, '#f4f6f8'); Lb(g, 'КОНТАКТЫ', cx, cy - h / 2 + 70, 32, '#2a3a5a');
    const L = v.list || ['Бабушка', 'Начальник', 'Лёха', 'Мама', 'Папа', 'Сосед Игорь']; let y = cy - h / 2 + 150;
    L.forEach((s, i) => { const gone = s === (v.who || 'Лёха') && v.gone != null ? fadeIn(t, v.gone, 0.6) : 0; if (gone >= 1) return; g.save(); g.globalAlpha *= 1 - gone; circle(g, cx - w / 2 + 70, y, 30, ['#e88a8a', '#8ab0e8', BL, '#c88ad8', '#8ad8a8', '#d8c08a'][i % 6]); Lb(g, s, cx - w / 2 + 120, y, 32, '#22222a', 1, 'left'); seg(g, [[cx - w / 2 + 30, y + 46], [cx + w / 2 - 30, y + 46]], 2, '#e0e4ea'); g.restore(); y += 92 * (1 - gone); });
    if (v.empty) Lb(g, 'НЕТ ТАКОГО КОНТАКТА', cx, cy + h / 2 - 120, 28, '#c0453a');
    cap(g, v.cap);
  },
  sweater(g, t, v) { // колючий свитер с огромным кривым оленем
    const cx = E.W / 2, cy = E.H * 0.47; g.fillStyle = '#b8443a'; g.beginPath(); g.moveTo(cx - 300, cy - 280); g.lineTo(cx - 110, cy - 330); g.quadraticCurveTo(cx, cy - 270, cx + 110, cy - 330); g.lineTo(cx + 300, cy - 280); g.lineTo(cx + 470, cy + 120); g.lineTo(cx + 330, cy + 160); g.lineTo(cx + 260, cy - 40); g.lineTo(cx + 250, cy + 330); g.lineTo(cx - 250, cy + 330); g.lineTo(cx - 260, cy - 40); g.lineTo(cx - 330, cy + 160); g.lineTo(cx - 470, cy + 120); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const x = cx - 230 + i * 58; poly(g, [[x, cy + 260], [x + 22, cy + 230], [x + 44, cy + 260], [x + 22, cy + 290]], '#f2efe8'); }
    const w = Math.sin(t * 2) * 4; g.save(); g.translate(cx, cy + 20); g.rotate(-0.12); g.fillStyle = '#e8d8b0'; g.beginPath(); g.ellipse(0, 40, 130, 70, 0.1, 0, 7); g.fill(); circle(g, 120, -40, 52, '#e8d8b0');
    for (const dx of [-70, -20, 40, 90]) seg(g, [[dx, 90], [dx + w, 190]], 16, '#e8d8b0'); g.strokeStyle = '#7a5a3a'; g.lineWidth = 12; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(110 + s * 20, -80); g.lineTo(100 + s * 60, -170); g.lineTo(140 + s * 40, -200); g.moveTo(100 + s * 60, -170); g.lineTo(70 + s * 90, -190); g.stroke(); }
    circle(g, 150, -40, 9, INK); circle(g, 120, -46, 9, INK); circle(g, 168, -20, 14, '#e8403a'); g.restore();
    if (v.at != null) sparkles(g, cx, cy, 380, t, fadeIn(t, v.at) * (1 - fadeIn(t, v.at + 1.4)));
    cap(g, v.cap);
  },
  soup(g, t, v) { // тарелка маминого супа со странной фасолью
    const cx = E.W / 2, cy = E.H * 0.52; g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(cx, cy, 460, 200, 0, 0, 7); g.fill(); g.fillStyle = v.good ? '#d88a3a' : '#b89a5a'; g.beginPath(); g.ellipse(cx, cy - 10, 360, 140, 0, 0, 7); g.fill();
    for (let i = 0; i < 14; i++) { g.fillStyle = '#7a3a2a'; g.beginPath(); g.ellipse(cx - 260 + ((i * 97) % 520), cy - 90 + ((i * 53) % 160), 26, 16, i, 0, 7); g.fill(); }
    if (v.good) for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; g.strokeStyle = `rgba(240,240,250,${0.45 * Math.sin(ph * Math.PI)})`; g.lineWidth = 14; g.beginPath(); const x = cx - 100 + i * 100; g.moveTo(x, cy - 120 - ph * 30); g.bezierCurveTo(x - 40, cy - 200 - ph * 90, x + 40, cy - 260 - ph * 120, x, cy - 320 - ph * 140); g.stroke(); }
    if (v.at != null) sparkles(g, cx, cy - 20, 400, t, fadeIn(t, v.at) * (1 - fadeIn(t, v.at + 1.4)));
    cap(g, v.cap);
  },
  alarm(g, t, v) { // будильник 06:00
    const cx = E.W / 2, cy = E.H * 0.46, w = 460, h = 760; phoneFrame(g, cx, cy, w, h, '#1a1a2a'); const sh = Math.sin(t * 40) * (t < 1.4 ? 6 : 0);
    Lb(g, v.time || '06:00', cx + sh, cy - 120, 140, '#ffffff'); Lb(g, 'БУДИЛЬНИК', cx, cy - 10, 30, '#9fb6d8'); circle(g, cx, cy + 200, 60, '#e04a3a'); Lb(g, 'СТОП', cx, cy + 202, 26, '#fff');
    if (v.ring !== false) for (let i = 0; i < 3; i++) ring(g, cx, cy - 120, 180 + ((t * 120 + i * 60) % 180), 4, alpha('#ffd47e', 0.4 * (1 - ((t * 120 + i * 60) % 180) / 180)));
    cap(g, v.cap);
  },
  cash(g, t, v) { // пять тысяч: купюры
    const cx = E.W / 2, cy = E.H * 0.48, k = fadeIn(t, v.at ?? 0, 0.5);
    for (let i = 0; i < (v.n || 1); i++) { g.save(); g.translate(cx + i * 40 - 20, cy + i * 20 - 10); g.rotate(-0.08 + i * 0.06); g.globalAlpha *= k; rr(g, -330, -150, 660, 300, 16); g.fillStyle = '#d8805a'; g.fill(); rr(g, -310, -130, 620, 260, 12); g.strokeStyle = '#a85a3a'; g.lineWidth = 4; g.stroke();
      text(g, '5000', -160, -40, { size: 110, font: FONTS.ui, weight: 900, color: '#8a3a2a' }); text(g, 'ПЯТЬ ТЫСЯЧ РУБЛЕЙ', 70, 80, { size: 34, font: FONTS.ui, weight: 900, color: '#8a3a2a' }); circle(g, 200, -40, 70, '#e8a07a'); g.restore(); }
    if (v.at != null && v.spark !== false) sparkles(g, cx, cy, 380, t, fadeIn(t, v.at) * (1 - fadeIn(t, v.at + 1.4)));
    cap(g, v.cap);
  },
  napkin(g, t, v) { // салфетка: дорога к ресторану в Шанхае
    const cx = E.W / 2, cy = E.H * 0.47; g.save(); g.translate(cx, cy); g.rotate(-0.05); rr(g, -420, -340, 840, 680, 8); g.fillStyle = '#f8f6f0'; g.fill(); g.strokeStyle = '#e4e0d4'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-420, -340 + i * 170); g.lineTo(420, -340 + i * 170); g.stroke(); }
    const k = ease.inOut(prog(t, 0.3, 2.2)); g.strokeStyle = '#2a4a9a'; g.lineWidth = 8; g.setLineDash([22, 14]); g.beginPath(); const pts = [[-320, 240], [-160, 120], [-40, 160], [80, 0], [220, -60], [300, -220]]; pts.slice(0, Math.max(2, Math.ceil(k * pts.length))).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]);
    if (k > 0.95) { circle(g, 300, -220, 24, '#e8403a'); text(g, '饭店', 300, -290, { size: 64, font: FONTS.ui, weight: 900, color: '#e8403a' }); } text(g, '上海', -300, -260, { size: 72, font: FONTS.ui, weight: 900, color: '#2a4a9a' }); g.restore();
    cap(g, v.cap);
  },
  hanzi(g, t, v) { // иероглифы и тоны вспыхивают в голове
    const cx = E.W / 2, cy = E.H * 0.5; glow(g, cx, cy, 600, '#ffd47e', 0.25); const H = ['你好', '朋友', '谢谢', '北京', '上海', '中文', '欢迎', '再见'];
    H.forEach((s, i) => { const a = fadeIn(t, 0.15 * i), an = i * 0.8 + t * 0.4, r = 280 + (i % 3) * 70; text(g, s, cx + Math.cos(an) * r * 1.4, cy + Math.sin(an) * r * 0.7, { size: 70 + (i % 3) * 16, font: FONTS.ui, weight: 900, color: i % 2 ? GOLDC : CREAM, alpha: a * 0.9, glow: 12 }); });
    for (let i = 0; i < 4; i++) { const x = cx - 180 + i * 120; g.strokeStyle = alpha('#9fd8ff', 0.8); g.lineWidth = 8; g.beginPath(); g.moveTo(x - 30, cy + [0, 30, -20, 10][i]); g.quadraticCurveTo(x, cy + [0, 30, -20, 10][i] + [0, -40, 50, -30][i], x + 30, cy + [0, -10, 20, -20][i]); g.stroke(); }
    cap(g, v.cap);
  },
};

export const BP10 = {
  liar(g, t, v) { // парадокс лжеца: «я сейчас вру» — правда ⇄ ложь по кругу
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || '«Я СЕЙЧАС ВРУ»', E.H * 0.13, 62, gold);
    const cx = E.W / 2, cy = E.H * 0.56, R = 250, ph = (t * 0.7) % 2, onTruth = ph < 1;
    for (const [s, x, on] of [['ПРАВДА', cx - R * 1.4, onTruth], ['ЛОЖЬ', cx + R * 1.4, !onTruth]]) { if (on) glow(g, x, cy, 200, gold, 0.4); rr(g, x - 170, cy - 70, 340, 140, 30); g.strokeStyle = on ? gold : alpha(c, 0.6); g.lineWidth = 6; g.stroke(); Lb(g, s, x, cy + 2, 56, on ? gold : c); }
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy - 40, R * 0.95, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.beginPath(); g.arc(cx, cy + 40, R * 0.95, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    poly(g, [[cx + R * 0.83, cy - 40 - R * 0.46], [cx + R * 0.83 - 30, cy - 40 - R * 0.52], [cx + R * 0.83 - 4, cy - 40 - R * 0.3]], c); poly(g, [[cx - R * 0.83, cy + 40 + R * 0.46], [cx - R * 0.83 + 30, cy + 40 + R * 0.52], [cx - R * 0.83 + 4, cy + 40 + R * 0.3]], c);
    Lb(g, 'ЕСЛИ ВРЁШЬ — ЗНАЧИТ, ПРАВДА', cx, cy - R * 1.2, 32, c); Lb(g, 'ЕСЛИ ПРАВДА — ЗНАЧИТ, ВРЁШЬ', cx, cy + R * 1.2, 32, c);
    if (v.sub) Lb(g, v.sub, cx, E.H * 0.95, 40, gold, fadeIn(t, 1.2));
  },
  polygraph(g, t, v) { // полиграф: пульс, дыхание, пот — то есть волнение
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ПОЛИГРАФ', E.H * 0.11, 58);
    const rows = [['ПУЛЬС', '#ff7a6a', 9], ['ДЫХАНИЕ', '#9fd8ff', 2.5], ['ПОТ', gold, 1.2]], x0 = E.W * 0.2, x1 = E.W * 0.9, calm = v.mode === 'calm';
    rows.forEach(([s, col, f], i) => { const y = E.H * (0.3 + i * 0.2); Lb(g, s, E.W * 0.17, y, 34, col, 1, 'right'); g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 200; k++) { const u = k / 200, x = lerp(x0, x1, u), amp = (calm ? 18 : 18 + 40 * clamp((u - 0.4) * 3)) * (v.mode === 'liar' ? 0.5 : 1); const yy = y + Math.sin(u * f * 20 + t * 4 + i) * amp * (i === 2 ? clamp(u * 2) : 1); k ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.92, 42, gold, fadeIn(t, 1.0));
  },
  mind(g, t, v) { // теория разума: в голове у другого — свои мысли, туда можно положить неправду
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'У ДРУГИХ — СВОИ МЫСЛИ', E.H * 0.11, 56);
    const L = [E.W * 0.28, E.H * 0.6], R = [E.W * 0.72, E.H * 0.6]; circle(g, L[0], L[1], 120, alpha(c, 0.85)); circle(g, R[0], R[1], 120, alpha(c, 0.85));
    for (const [x, y] of [L, R]) { circle(g, x - 40, y - 20, 14, '#0e1a30'); circle(g, x + 40, y - 20, 14, '#0e1a30'); }
    const b = (x, y, s, a, col) => { g.save(); g.globalAlpha *= a; rr(g, x - 170, y - 70, 340, 140, 60); g.fillStyle = 'rgba(10,16,30,.9)'; g.fill(); g.strokeStyle = col; g.lineWidth = 5; g.stroke(); circle(g, x - 30, y + 100, 18, col); circle(g, x - 10, y + 140, 10, col); Lb(g, s, x, y + 2, 40, col); g.restore(); };
    b(L[0], L[1] - 320, '🍫 СЪЕЛ', 1, c); b(R[0], R[1] - 320, v.other || '«НЕ ТРОГАЛ»', fadeIn(t, 0.9), gold); arrow(g, L[0] + 180, L[1] - 320, R[0] - 190, R[1] - 320, 6, gold);
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, gold, fadeIn(t, 1.6));
  },
  amygdala(g, t, v) { // миндалевидное тело: чувство вины слабеет, ложь растёт
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'МОЗГ ПРИВЫКАЕТ К ОБМАНУ', E.H * 0.11, 56);
    const n = 6, base = E.H * 0.8; for (let i = 0; i < n; i++) { const k = ease.out(prog(t, 0.3 + i * 0.35, 0.7 + i * 0.35)), x = E.W * 0.16 + i * E.W * 0.12;
      const guilt = 380 * (1 - i * 0.15) * k, lie = 60 * (1 + i * 0.9) * k; rr(g, x - 50, base - guilt, 44, guilt, 8); g.fillStyle = alpha('#ff7a6a', 0.85); g.fill(); rr(g, x + 6, base - lie, 44, lie, 8); g.fillStyle = alpha(gold, 0.85); g.fill(); Lb(g, `ЛОЖЬ ${i + 1}`, x, base + 40, 26, c); }
    rr(g, E.W * 0.8, E.H * 0.3, 30, 30, 6); g.fillStyle = '#ff7a6a'; g.fill(); Lb(g, 'ЧУВСТВО ВИНЫ', E.W * 0.8 + 44, E.H * 0.3 + 15, 30, '#ff9a8a', 1, 'left'); rr(g, E.W * 0.8, E.H * 0.38, 30, 30, 6); g.fillStyle = gold; g.fill(); Lb(g, 'РАЗМЕР ЛЖИ', E.W * 0.8 + 44, E.H * 0.38 + 15, 30, gold, 1, 'left');
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, gold, fadeIn(t, 2.2));
  },
  honest(g, t, v) { // 10 недель без лжи: голова, напряжение — меньше; отношения — лучше
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || '10 НЕДЕЛЬ БЕЗ ЛЖИ', E.H * 0.12, 58);
    const rows = v.rows || [['ГОЛОВНАЯ БОЛЬ', -1], ['НАПРЯЖЕНИЕ', -1], ['ОТНОШЕНИЯ С БЛИЗКИМИ', 1]];
    rows.forEach(([s, d], i) => { const y = E.H * (0.36 + i * 0.17), a = fadeIn(t, 0.3 + i * 0.6); Lb(g, s, E.W * 0.58, y, 52, c, a, 'right'); const col = d > 0 ? '#7ad08a' : gold; g.save(); g.globalAlpha *= a; const x = E.W * 0.7; arrow(g, x, y - d * 60, x, y + d * 60, 12, col, 34); Lb(g, d > 0 ? 'ЛУЧШЕ' : 'МЕНЬШЕ', x + 70, y, 46, col, 1, 'left'); g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.9, 40, gold, fadeIn(t, 2.0));
  },
  hours(g, t, v) { // сколько часов нужно, чтобы стать друзьями
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'СКОЛЬКО ЧАСОВ НУЖНО ДРУЖБЕ', E.H * 0.12, 56);
    const x0 = E.W * 0.1, x1 = E.W * 0.9, y = E.H * 0.56, X = (h) => lerp(x0, x1, h / 220), k = ease.inOut(prog(t, 0.3, 2.6)), cur = (v.upto ?? 220) * k;
    rr(g, x0, y - 22, x1 - x0, 44, 22); g.fillStyle = alpha(c, 0.2); g.fill(); rr(g, x0, y - 22, X(cur) - x0, 44, 22); g.fillStyle = alpha(gold, 0.85); g.fill();
    for (const [h, s] of [[50, 'ПРИЯТЕЛЬ'], [90, 'ДРУГ'], [200, 'БЛИЗКИЙ ДРУГ']]) { const on = cur >= h; seg(g, [[X(h), y - 60], [X(h), y + 60]], 5, on ? gold : c); Lb(g, `${h} Ч`, X(h), y - 100, 46, on ? gold : c); Lb(g, s, X(h), y + 110, 36, on ? gold : c); }
    if (v.you != null) { const a = fadeIn(t, 2.6); Lb(g, v.you, E.W / 2, E.H * 0.86, 50, '#ff9a8a', a); }
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 38, c, fadeIn(t, 2.8));
  },
  pygmalion(g, t, v) { // эффект Пигмалиона: «эти дети резко поумнеют»
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЭКСПЕРИМЕНТ В ШКОЛЕ', E.H * 0.11, 56);
    const hot = [2, 7, 11], grow = v.step >= 1 ? ease.out(prog(t, 0.4, 2.0)) : 0;
    for (let i = 0; i < 14; i++) { const x = E.W * (0.09 + i * 0.063), y = E.H * 0.6, h = hot.includes(i); const sc = 0.6; if (h && v.step >= 0) glow(g, x, y - 40, 70, gold, 0.4 + 0.2 * Math.sin(t * 4)); UI.lineFigure(g, { x, y, s: sc, color: h ? gold : alpha(c, 0.6) });
      const bh = (h ? 60 + 140 * grow : 60 + 40 * grow); rr(g, x - 18, E.H * 0.85 - bh, 36, bh, 6); g.fillStyle = alpha(h ? gold : c, 0.7); g.fill(); }
    Lb(g, v.step >= 1 ? 'ЧЕРЕЗ ГОД: РОСТ РЕЗУЛЬТАТОВ' : 'ВЫБРАНЫ СЛУЧАЙНО', E.W / 2, E.H * 0.25, 40, gold, fadeIn(t, 0.5)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 38, c, fadeIn(t, 1.6));
  },
  liesday(g, t, v) { // дневник лжи: ряд мелких фраз
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'МЕЛКАЯ ЛОЖЬ', E.H * 0.12, 58);
    (v.lines || ['«Я УЖЕ ВЫХОЖУ»', '«ВСЁ НОРМАЛЬНО»', '«ОТЛИЧНАЯ СТРИЖКА»', '«НЕТ, ТЫ МЕНЯ НЕ РАЗБУДИЛ»']).forEach((s, i) => { const a = fadeIn(t, 0.2 + i * (v.step ?? 0.6)), x = E.W * (i % 2 ? 0.66 : 0.34), y = E.H * (0.36 + Math.floor(i / 2) * 0.24) + (i % 2) * 30;
      g.save(); g.globalAlpha *= a; rr(g, x - 300, y - 60, 600, 120, 60); g.fillStyle = 'rgba(10,16,30,.85)'; g.fill(); g.strokeStyle = gold; g.lineWidth = 4; g.stroke(); Lb(g, s, x, y + 2, fit(g, s, 540, 42), CREAM); g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.92, 42, gold, fadeIn(t, 2.2));
  },
};

// предметы: pr: [{ t: 'wallphoto' | 'fence' | 'puddle' | 'shelfmug', ... }]
export const PR10 = {
  wallphoto(g, x, GY, p, t) { // фото с выпускного на стене; gone — когда исчезает
    const y = GY - (p.h ?? 560), k = p.gone != null ? clamp((t - p.gone) / 0.6) : 0; if (k >= 1) { g.save(); g.globalAlpha = 0.25; rr(g, x - 110, y, 220, 160, 6); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.setLineDash([8, 8]); g.stroke(); g.restore(); return; }
    g.save(); g.globalAlpha *= 1 - k; rr(g, x - 120, y - 10, 240, 180, 8); g.fillStyle = '#6a4a30'; g.fill(); rr(g, x - 104, y + 6, 208, 148, 4); g.fillStyle = linGrad(g, 0, y, 0, y + 160, ['#bfe0f4', '#7fc0e8']); g.fill();
    g.save(); rr(g, x - 104, y + 6, 208, 148, 4); g.clip(); who(g, 'artem', x - 40, y + 230, 0.62, { e: 'joy' }); who(g, 'leha', x + 40, y + 230, 0.62, { f: -1, e: 'joy' }); g.restore(); g.restore();
    if (p.gone != null) sparkles(g, x, y + 80, 160, t, clamp(1 - Math.abs(t - p.gone - 0.3) / 0.6), GOLDC, 10);
  },
  fence(g, x, GY, p, t) { // штакетник: color, к from→color в момент at
    const w = p.w ?? 1600, n = Math.floor(w / 70); const k = p.at != null ? clamp((t - p.at) / 0.5) : 1; const col = p.from && k < 1 ? p.from : p.color || '#8a6a4a';
    seg(g, [[x - w / 2, GY - 70], [x + w / 2, GY - 70]], 14, shade(col, -0.2)); seg(g, [[x - w / 2, GY - 170], [x + w / 2, GY - 170]], 14, shade(col, -0.2));
    for (let i = 0; i < n; i++) { const px = x - w / 2 + 20 + i * 70; poly(g, [[px - 22, GY], [px + 22, GY], [px + 22, GY - 210], [px, GY - 236], [px - 22, GY - 210]], col); }
    if (p.at != null) sparkles(g, x, GY - 140, w * 0.4, t, clamp(1 - Math.abs(t - p.at - 0.4) / 0.7), GOLDC, 26);
  },
  puddle(g, x, GY, p) { g.fillStyle = alpha('#7ab0e8', 0.55); g.beginPath(); g.ellipse(x, GY + 6, p.w ?? 420, 26, 0, 0, 7); g.fill(); g.fillStyle = alpha('#cfe6ff', 0.4); g.beginPath(); g.ellipse(x - 60, GY + 2, 80, 8, 0, 0, 7); g.fill(); },
  shelfmug(g, x, GY, p, t) { // полка и кружка Артёма у Лёхи; gone — исчезает
    const y = GY - (p.h ?? 380); seg(g, [[x - 160, y], [x + 160, y]], 12, '#6a4a30'); const k = p.gone != null ? clamp((t - p.gone) / 0.6) : 0; if (k >= 1) return;
    g.save(); g.globalAlpha *= 1 - k; rr(g, x - 30, y - 70, 60, 64, 10); g.fillStyle = OR; g.fill(); g.strokeStyle = OR; g.lineWidth = 9; g.beginPath(); g.arc(x + 34, y - 40, 18, -1.3, 1.3); g.stroke(); text(g, 'Т', x, y - 38, { size: 30, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore();
  },
};
