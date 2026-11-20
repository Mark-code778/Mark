// shots/bp.js — научные «чертежи» (тёмно-синяя сетка, светлые линии, золотые акценты). Все подписи — в пределах своих рамок.
import { E, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, text, measure, FONTS, S } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import * as FX from '/engine/fx2d.js';
import { fitText, drawItem } from '../sets/items.js';

const BPC = () => S().ui.blueprint, GOLD = () => S().ui.gold, CREAM = () => S().ui.cream, RED = () => S().ui.accent;
const lbl = (g, str, x, y, w, a = 1, color = CREAM(), size = 34) => fitText(g, str, x, y, w, size * 1.3 * String(str).split('\n').length, { color, alpha: a, size });
const fade = (t, a, d = 0.4) => clamp((t - a) / d);
const z = (g, t, info) => { const k = 1 + 0.04 * t / info.dur; g.translate(E.W / 2, E.H / 2); g.scale(k, k); g.translate(-E.W / 2, -E.H / 2); };
function eyeShape(g, cx, cy, r, a = 1, dashed = false) { g.save(); g.globalAlpha *= a; if (dashed) g.setLineDash([14, 12]); ring(g, cx, cy, r, 5, BPC()); g.setLineDash([]); g.restore(); }
function box(g, x, y, w, h, a = 1, col = BPC()) { g.save(); g.globalAlpha *= a; rr(g, x, y, w, h, 18); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.fillStyle = alpha(col, 0.06); g.fill(); g.restore(); }

export const BP = {
  // свет проходит сквозь невидимый глаз
  eye(g, t, info) { g.save(); z(g, t, info);
    for (const [cx, inv, title] of [[E.W * 0.3, false, 'ОБЫЧНЫЙ ГЛАЗ'], [E.W * 0.7, true, 'НЕВИДИМЫЙ ГЛАЗ']]) {
      const a = fade(t, inv ? 1.2 : 0.2), cy = E.H * 0.5; eyeShape(g, cx, cy, 130, a, inv);
      if (!inv) { g.save(); g.globalAlpha *= a; g.strokeStyle = GOLD(); g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, 130, -0.8, 0.8); g.stroke(); g.restore(); }
      for (let i = -2; i <= 2; i++) { const p = ease.out(prog(t, (inv ? 1.4 : 0.4) + i * 0.05, (inv ? 2.6 : 1.6))); const y = cy + i * 30; const xEnd = inv ? cx + 400 : cx + 124 * Math.cos(Math.asin(clamp(i * 30 / 130, -1, 1)));
        seg(g, [[cx - 400, y], [lerp(cx - 400, xEnd, p), y]], 4, alpha(GOLD(), 0.9)); if (!inv && p > 0.98) glow(g, xEnd, y, 30, GOLD(), 0.8); }
      lbl(g, title, cx, E.H * 0.24, 520, a, CREAM(), 40);
      lbl(g, inv ? 'свет проходит насквозь' : 'сетчатка ловит свет', cx, E.H * 0.78, 520, fade(t, inv ? 2.4 : 1.6), inv ? RED() : GOLD(), 34); }
    g.restore(); },
  // роман Уэллса
  book(g, t, info) { g.save(); z(g, t, info); const a = fade(t, 0.1), cx = E.W / 2, cy = E.H / 2, w = 420, h = 580; g.globalAlpha *= a;
    rr(g, cx - w / 2, cy - h / 2, w, h, 12); g.fillStyle = '#2a3a5a'; g.fill(); g.strokeStyle = GOLD(); g.lineWidth = 5; g.stroke(); g.fillStyle = alpha(GOLD(), 0.5); g.fillRect(cx - w / 2 + 30, cy - h / 2, 14, h);
    fitText(g, 'Г. УЭЛЛС', cx + 10, cy - 180, w - 100, 50, { color: CREAM() }); fitText(g, 'ЧЕЛОВЕК-\nНЕВИДИМКА', cx + 10, cy - 30, w - 100, 160, { color: GOLD(), font: FONTS.title, weight: 700 }); fitText(g, '1897', cx + 10, cy + 200, w - 140, 50, { color: CREAM() });
    g.restore();
    // ...на самом деле ничего бы не видел: перечёркнутый глаз
    const k = fade(t, 1.5); if (k > 0) { const ex = E.W * 0.78, ey = E.H * 0.5; g.save(); g.globalAlpha *= k; eyeShape(g, ex, ey, 90, 1, true); seg(g, [[ex - 110, ey - 110], [ex + 110, ey + 110]], 10, RED()); lbl(g, 'СЛЕПОЙ', ex, ey + 160, 300, 1, RED(), 40); g.restore(); } },
  // «2000 лет» + кольцо Гига
  ring(g, t, info) { g.save(); z(g, t, info); const cx = E.W / 2, cy = E.H * 0.45, a = fade(t, 0.2);
    g.save(); g.globalAlpha *= a; ring(g, cx, cy, 150, 30, GOLD()); glow(g, cx, cy, 380, GOLD(), 0.25); circle(g, cx, cy - 170, 26, '#9fe8ff'); glow(g, cx, cy - 170, 90, '#9fe8ff', 0.5); g.restore();
    lbl(g, 'КОЛЬЦО ГИГА', cx, E.H * 0.8, 700, fade(t, 0.8), CREAM(), 46);
    for (let i = 0; i < 8; i++) { const an = t * 0.4 + i * 0.785; circle(g, cx + Math.cos(an) * 260, cy + Math.sin(an) * 260, 3, alpha(BPC(), 0.6)); } g.restore(); },
  years(g, t, info) { g.save(); z(g, t, info); const v = Math.round(lerp(0, 2000, ease.out(prog(t, 0.2, 1.6)))); const a = fade(t, 0.1);
    text(g, v + '+', E.W / 2, E.H * 0.45, { size: 200, font: FONTS.ui, weight: 900, color: GOLD(), glow: 30, glowColor: alpha(GOLD(), 0.6), alpha: a, maxW: E.W * 0.8 });
    lbl(g, 'ЛЕТ ЭТОМУ ВОПРОСУ', E.W / 2, E.H * 0.66, 900, fade(t, 0.8), CREAM(), 48); g.restore(); },
  // касса честности: цветы vs глаза
  honesty(g, t, info, p) { g.save(); z(g, t, info); const pic = p.pic || 'both';
    if (pic !== 'bars') { const k = pic === 'both' ? (t < info.dur / 2 ? 'flowers' : 'eyes') : pic; drawItem(g, 'honestybox', E.W / 2, E.H * 0.86, 1.25, t, { pic: k === 'none' ? null : k }); if (p.money) { const mp = ease.inOut(prog(t, 0.4, 1.6)); drawItem(g, 'money', E.W / 2, lerp(E.H * 0.3, E.H * 0.66, mp), 1, t, { a: 1 - prog(t, 1.5, 1.8) }); } if (k !== 'none') lbl(g, k === 'eyes' ? 'НЕДЕЛЯ: ГЛАЗА' : 'НЕДЕЛЯ: ЦВЕТЫ', E.W * 0.82, E.H * 0.16, 520, fade(t % (info.dur / 2), 0.2), k === 'eyes' ? GOLD() : CREAM(), 38); }
    else { const rows = [['ЦВЕТЫ', 0.3, BPC()], ['ГЛАЗА', 0.9, GOLD()]]; rows.forEach(([l, v, c], i) => { const y = E.H * (0.4 + i * 0.2), pr = ease.out(prog(t, 0.3 + i * 0.5, 1.3 + i * 0.5)); lbl(g, l, E.W * 0.17, y, 280, 1, CREAM(), 44); rr(g, E.W * 0.28, y - 26, E.W * 0.55, 52, 26); g.fillStyle = alpha(c, 0.15); g.fill(); rr(g, E.W * 0.28, y - 26, Math.max(52, E.W * 0.55 * v * pr), 52, 26); g.fillStyle = c; g.fill(); });
      text(g, '×3', E.W * 0.9, E.H * 0.6, { size: 120, font: FONTS.ui, weight: 900, color: GOLD(), glow: 24, glowColor: alpha(GOLD(), 0.6), alpha: fade(t, 1.8), maxW: E.W * 0.16 }); lbl(g, 'ПЛАТИЛИ БОЛЬШЕ', E.W / 2, E.H * 0.84, 800, fade(t, 2), CREAM(), 40); }
    g.restore(); },
  // VR: человек смотрит вниз и не видит тела
  vr(g, t, info) { g.save(); z(g, t, info); const cx = E.W * 0.36, gy = E.H * 0.82;
    UI.lineFigure(g, { x: cx, y: gy, s: 2.2, pose: { ...POSES.stand, head: [8, -200] }, color: alpha('#e8f0ff', 0.25 + 0.15 * Math.sin(t * 3)) });
    g.save(); g.setLineDash([12, 10]); ring(g, cx + 18, gy - 440, 52, 4, BPC()); g.restore(); rr(g, cx - 30, gy - 470, 110, 50, 14); g.strokeStyle = GOLD(); g.lineWidth = 5; g.stroke();
    FX.lightCone(g, cx + 60, gy - 440, { angle: 1.2, spread: 0.4, len: 400, color: GOLD(), a: 0.18 });
    box(g, E.W * 0.56, E.H * 0.3, 640, 300, fade(t, 0.6)); lbl(g, 'ОЧКИ VR', E.W * 0.56 + 320, E.H * 0.3 + 90, 560, fade(t, 0.8), GOLD(), 44); lbl(g, 'иллюзия невидимого тела', E.W * 0.56 + 320, E.H * 0.3 + 190, 560, fade(t, 1.1), CREAM(), 34);
    g.restore(); },
  // пульс: невидимые волнуются меньше
  heart(g, t, info) { g.save(); z(g, t, info); const x0 = E.W * 0.12, x1 = E.W * 0.88, rows = [['ВИДИМОЕ ТЕЛО', E.H * 0.38, RED(), 1.0], ['НЕВИДИМОЕ ТЕЛО', E.H * 0.7, BPC(), 0.45]];
    rows.forEach(([l, y, c, amp], i) => { lbl(g, l, x0 + 220, y - 110, 440, fade(t, 0.2 + i * 0.4), c, 36); const p = ease.inOut(prog(t, 0.2 + i * 0.4, info.dur * 0.8));
      g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 300 * p; k++) { const u = k / 300, x = lerp(x0, x1, u), ph = (u * (i ? 7 : 12)) % 1; const yy = y - (ph > 0.45 && ph < 0.5 ? 90 * amp : ph > 0.5 && ph < 0.55 ? -60 * amp : 0); k ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); });
    lbl(g, 'СТРЕСС НИЖЕ', E.W * 0.78, E.H * 0.88, 460, fade(t, info.dur * 0.6), GOLD(), 40); g.restore(); },
  // мошенники: страх + спешка = тревога
  scam(g, t, info) { g.save(); z(g, t, info); const y = E.H * 0.42;
    const B = [[E.W * 0.2, 'СТРАХ', RED()], [E.W * 0.5, 'СПЕШКА', RED()], [E.W * 0.8, 'РЕЖИМ ТРЕВОГИ', GOLD()]];
    B.forEach(([x, l, c], i) => { const a = fade(t, 0.2 + i * 0.6); box(g, x - 220, y - 90, 440, 180, a, c); lbl(g, l, x, y, 380, a, c, 46); });
    lbl(g, '+', E.W * 0.35, y, 60, fade(t, 0.8), CREAM(), 60); lbl(g, '→', E.W * 0.65, y, 80, fade(t, 1.4), CREAM(), 60);
    lbl(g, 'проверять и думать — некогда', E.W / 2, E.H * 0.72, 900, fade(t, 2), CREAM(), 38);
    const k = fade(t, 1.4); if (k > 0) { glow(g, E.W * 0.8, y, 280 + 30 * Math.sin(t * 8), RED(), 0.25 * k); } g.restore(); },
  // правило: никто не присылает курьера за наличными
  rule(g, t, info) { g.save(); z(g, t, info); const items = ['ПОЛИЦИЯ', 'СЛЕДОВАТЕЛИ', 'БАНКИ'];
    items.forEach((l, i) => { const x = E.W * (0.22 + i * 0.28), a = fade(t, 0.2 + i * 0.4); box(g, x - 200, E.H * 0.24, 400, 150, a); lbl(g, l, x, E.H * 0.24 + 75, 340, a, CREAM(), 44); });
    const a2 = fade(t, 1.6); box(g, E.W * 0.2, E.H * 0.56, E.W * 0.6, 200, a2, RED()); lbl(g, 'НИКОГДА НЕ ПРИСЫЛАЮТ\nКУРЬЕРА ЗА НАЛИЧНЫМИ', E.W / 2, E.H * 0.56 + 100, E.W * 0.6 - 80, a2, RED(), 50);
    g.restore(); },
  // эффект прожектора: ожидание 50% vs реальность 25%
  spotlight(g, t, info) { g.save(); z(g, t, info); const D = [[E.W * 0.3, 'ДУМАЛ', 0.5], [E.W * 0.7, 'НА ДЕЛЕ', 0.25]];
    D.forEach(([cx, l, v], i) => { const a = fade(t, 0.2 + i * 1.2), cy = E.H * 0.5, r = 170, p = ease.out(prog(t, 0.4 + i * 1.2, 1.4 + i * 1.2));
      g.save(); g.globalAlpha *= a; ring(g, cx, cy, r, 4, BPC()); g.fillStyle = i ? GOLD() : RED(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v * p); g.closePath(); g.fill(); g.restore();
      lbl(g, l, cx, cy - r - 70, 400, a, CREAM(), 44); lbl(g, Math.round(v * 100 * p) + '%', cx, cy + r + 70, 300, a, i ? GOLD() : RED(), 60); });
    g.restore(); },
  // луч прожектора над одним человеком, все остальные смотрят в телефоны
  beam(g, t, info) { g.save(); z(g, t, info); const cx = E.W / 2, gy = E.H * 0.85;
    FX.lightCone(g, cx, -50, { angle: Math.PI / 2, spread: 0.25, len: E.H * 1.1, color: GOLD(), a: 0.35 * fade(t, 0.2) });
    UI.lineFigure(g, { x: cx, y: gy, s: 1.6, pose: POSES.stand, color: GOLD() });
    for (let i = 0; i < 8; i++) { const x = E.W * (0.08 + i * 0.12) + (i >= 4 ? 140 : -140); UI.lineFigure(g, { x, y: gy, s: 1.6, pose: POSES.phone, color: alpha('#e8f0ff', 0.45), facing: i % 2 ? 1 : -1 }); }
    lbl(g, 'ВСЕ ЗАНЯТЫ СОБОЙ', cx, E.H * 0.12, 800, fade(t, info.dur * 0.5), CREAM(), 46); g.restore(); },
  // как защитить близких: положить трубку и перезвонить самому
  callback(g, t, info) { g.save(); z(g, t, info); const steps = ['ПРОСЯТ ДЕНЕГ\nОТ ТВОЕГО ИМЕНИ', 'ПОЛОЖИ\nТРУБКУ', 'ПЕРЕЗВОНИ\nСАМ'];
    steps.forEach((l, i) => { const x = E.W * (0.2 + i * 0.3), a = fade(t, 0.3 + i * 0.7), c = i === 2 ? GOLD() : i === 0 ? RED() : CREAM(); box(g, x - 230, E.H * 0.36, 460, 260, a, c); lbl(g, l, x, E.H * 0.36 + 130, 380, a, c, 46); if (i < 2) lbl(g, '→', x + 150 + 0.15 * E.W - 150 + 0, E.H * 0.36 + 130, 60, fade(t, 0.8 + i * 0.7), CREAM(), 56); });
    g.restore(); },
  // собаки: мир запахов
  smell(g, t, info) { g.save(); z(g, t, info); drawItem(g, 'dog', E.W * 0.32, E.H * 0.8, 2.2, t, {});
    for (let i = 0; i < 6; i++) { const k = ((t * 0.5 + i / 6) % 1), x = lerp(E.W * 0.85, E.W * 0.45, k), y = E.H * 0.48 + Math.sin(k * 12 + i) * 40; g.strokeStyle = alpha(GOLD(), 0.8 * (1 - k)); g.lineWidth = 5; g.beginPath(); g.arc(x, y, 30 + k * 20, -0.8, 0.8); g.stroke(); }
    lbl(g, 'МИР ЗАПАХОВ', E.W * 0.72, E.H * 0.2, 640, fade(t, 0.3), GOLD(), 50); lbl(g, 'запах тот же, что и раньше', E.W * 0.72, E.H * 0.3, 640, fade(t, 1), CREAM(), 34); g.restore(); },
};
