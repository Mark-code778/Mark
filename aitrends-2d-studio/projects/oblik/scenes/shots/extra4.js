// shots/extra4.js — вставки и схемы «Что, если ты станешь в 100 раз быстрее?».
// Вставки: капля-булочка и палец, кружка с котиком (тянешься / разбилась / кофе висит), подошва-лохмотья, банка в ладонях,
// прицел в игре, рука и муха, мир в окне без звука, анализ «биологический возраст», прибор на запястье.
// Схемы: уравнение «×100», сравнение столбиками, шкала слышимости, форма капли, падение кружки, звуковой удар,
// иконки (лампочка, чайники, шоколадки, сердце), переход сверху, вышка Иглмена, память и время.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, mix, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { fit, phoneFrame } from './extra.js';
import { mug, coffee, jar, sedan } from '../sets/places6.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1, align = 'center') => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a, align });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
const fmt = (n, dec = 0) => { const s = Math.abs(n) >= 1000 ? Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : n.toFixed(dec); return s.replace('.', ','); };
// кисть руки (рукав оранжевого худи) — для крупных планов
function hand(g, x, y, ang, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  rr(g, -460, -70, 460, 140, 60); g.fillStyle = o.sleeve || OR; g.fill(); rr(g, -60, -76, 50, 152, 20); g.fillStyle = shade(o.sleeve || OR, -0.25); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(70, 0, 95, 70, 0, 0, 7); g.fill();
  if (o.point) { rr(g, 120, -24, 150, 44, 22); g.fill(); rr(g, 100, 20, 70, 40, 20); g.fill(); }
  else if (o.cup) { g.beginPath(); g.ellipse(120, -40, 70, 34, -0.3, 0, 7); g.fill(); rr(g, 60, -110, 120, 50, 24); g.fill(); }
  else { for (let i = 0; i < 4; i++) { rr(g, 120, -58 + i * 34, 80 - Math.abs(i - 1.5) * 10, 28, 14); g.fill(); } rr(g, 40, -110, 30, 70, 15); g.fill(); }
  g.restore();
}
// фигура-контур
const fig = (g, x, y, s, pose, c, facing = 1) => UI.lineFigure(g, { x, y, s, pose: POSES[pose] || POSES.stand, color: c, facing });

export const INS6 = {
  drop(g, t, v) { // капля-«булочка» висит в воздухе; touch — палец касается, капля растекается
    const cx = E.W / 2 + 60, cy = E.H * 0.48 + t * 4, k = v.touch ? ease.inOut(prog(t, 0.6, 2.4)) : 0;
    glow(g, cx, cy, 340, '#bfe0ff', 0.25);
    g.save(); g.translate(cx, cy); const sq = 1 - k * 0.45;
    g.fillStyle = radGrad(g, -40, -50, 10, 220, ['rgba(255,255,255,.95)', 'rgba(170,215,255,.75)', 'rgba(90,150,230,.65)']);
    g.beginPath(); g.ellipse(0, k * 60, 190 * (1 + k * 0.5), 150 * sq, 0, Math.PI, Math.PI * 2); g.ellipse(0, k * 60, 190 * (1 + k * 0.5), 70 * sq, 0, 0, Math.PI); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 8; g.beginPath(); g.arc(-60, -60 + k * 50, 60 * sq, 3.6, 4.6); g.stroke(); g.restore();
    if (v.touch) hand(g, cx + lerp(260, 120, ease.out(prog(t, 0, 0.8))), cy + 210, -1.9, 1.1, { point: true });
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.88, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  mugcu(g, t, v) { // кружка с котиком крупно: reach — рука тянется; smash — осколки; cloud — облако кофе висит
    const cx = E.W / 2, cy = E.H * 0.66, st = v.state || 'reach';
    rr(g, -100, cy, E.W + 200, 60, 0); g.fillStyle = '#c8a070'; g.fill();
    if (st === 'reach') { mug(g, cx + 80, cy, { s: 2.6, full: true }); hand(g, lerp(cx - 700, cx - 260, ease.out(prog(t, 0.2, 2.2))), cy - 140, 0, 1.3, { cup: true }); }
    if (st === 'smash') { const k = ease.out(prog(t, 0, 0.5)); for (let i = 0; i < 9; i++) { const a = i * 0.7 - 2.2, d = 80 + k * (160 + i * 30); g.save(); g.translate(cx + Math.cos(a) * d, cy - 160 + Math.sin(a) * d * 0.7); g.rotate(i + t); poly(g, [[-36, 0], [14, -40], [40, 20], [-8, 36]], '#f4efe6'); g.restore(); }
      coffee(g, cx, cy - 40, { s: 2.6, sink: 0 }); glow(g, cx, cy - 200, 400, '#ffffff', 0.5 * (1 - k)); hand(g, cx - 200 + k * 160, cy - 160, 0, 1.3, {}); }
    if (st === 'cloud') { coffee(g, cx, cy - 40, { s: 2.8, sink: clamp(t / 12) }); for (let i = 0; i < 6; i++) { g.save(); g.translate(cx - 420 + i * 170, cy - 220 + Math.sin(i * 2) * 120 + t * 6); g.rotate(i * 1.3 + t * 0.05); poly(g, [[-30, 0], [10, -34], [34, 16], [-6, 30]], '#f4efe6'); g.restore(); } }
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.14, { size: 52, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  shoe(g, t, v) { // подошва кроссовка — лохмотья, оплавлена
    const cx = E.W / 2, cy = E.H * 0.55; g.save(); g.translate(cx, cy); g.rotate(-0.12);
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(-420, 40); g.quadraticCurveTo(-440, -160, -200, -170); g.lineTo(80, -150); g.quadraticCurveTo(360, -150, 430, 20); g.lineTo(430, 60); g.lineTo(-420, 60); g.fill();
    g.fillStyle = OR; g.fillRect(-120, -150, 160, 200); for (let i = 0; i < 4; i++) seg(g, [[-80 + i * 34, -150], [-60 + i * 34, -40]], 6, '#f4efe6');
    g.fillStyle = '#3a3036'; g.beginPath(); g.moveTo(-430, 60); for (let x = -430; x <= 440; x += 40) g.lineTo(x, 60 + 30 + ((x / 40) % 2 ? 26 : -4) + Math.sin(x) * 10); g.lineTo(440, 60); g.fill();
    for (let i = 0; i < 6; i++) { glow(g, -300 + i * 120, 90, 70, '#ff7a3a', 0.3 + 0.1 * Math.sin(t * 5 + i)); }
    for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i * 0.25) % 1); g.strokeStyle = alpha('#d8d4e0', 0.4 * (1 - k)); g.lineWidth = 9; g.beginPath(); g.moveTo(-200 + i * 130, 40 - k * 260); g.quadraticCurveTo(-180 + i * 130, -20 - k * 260, -200 + i * 130, -60 - k * 260); g.stroke(); }
    g.restore(); if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.86, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  jarcu(g, t, v) { // банка опускается со скоростью улитки; catch — ладони снизу
    const cx = E.W / 2, k = clamp(t / (v.dur || 4)), y = lerp(E.H * 0.42, E.H * (v.catch ? 0.6 : 0.5), ease.inOut(k));
    jar(g, cx, y, { s: 2.6, rot: 0.25 - k * 0.2 });
    if (v.catch) { const hk = ease.out(prog(t, 0, 1.2)); hand(g, cx - 260, E.H * 0.8 + (1 - hk) * 200, -0.35, 1.2, {}); g.save(); g.translate(cx + 260, E.H * 0.8 + (1 - hk) * 200); g.scale(-1, 1); hand(g, 0, 0, -0.35, 1.2, {}); g.restore(); }
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.14, { size: 52, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  aim(g, t, v) { // экран шутера: коридор, противник выглядывает; mode: 'calm' | 'fly' (прицел улетает) | 'win'
    const cx = E.W / 2, cy = E.H * 0.5, w = 1500, h = 840, x0 = cx - w / 2, y0 = cy - h / 2;
    rr(g, x0 - 24, y0 - 24, w + 48, h + 48, 20); g.fillStyle = '#0c0d12'; g.fill(); g.save(); rr(g, x0, y0, w, h, 8); g.clip();
    g.fillStyle = linGrad(g, 0, y0, 0, y0 + h, ['#3a4a5a', '#6a7a7a', '#4a4a44']); g.fillRect(x0, y0, w, h);
    poly(g, [[x0, y0], [cx - 200, cy - 120], [cx + 200, cy - 120], [x0 + w, y0]], '#2a3440'); poly(g, [[x0, y0 + h], [cx - 200, cy + 140], [cx + 200, cy + 140], [x0 + w, y0 + h]], '#4a4036');
    poly(g, [[x0, y0], [cx - 200, cy - 120], [cx - 200, cy + 140], [x0, y0 + h]], '#5a6a6a'); poly(g, [[x0 + w, y0], [cx + 200, cy - 120], [cx + 200, cy + 140], [x0 + w, y0 + h]], '#4a5a5a');
    g.fillStyle = '#7a8a8a'; g.fillRect(cx - 200, cy - 120, 400, 260);
    const peek = ease.out(prog(t, 0.3, 1.2)) * 70, ex = cx + 200 - peek, ey = cy + 20; const dead = v.mode === 'win' && t > 1.4;
    if (!dead) { circle(g, ex + 30, ey - 70, 34, '#8a3a9a'); rr(g, ex, ey - 36, 70, 140, 16); g.fillStyle = '#8a3a9a'; g.fill(); circle(g, ex + 18, ey - 76, 6, '#fff'); }
    g.fillStyle = '#5a6070'; g.fillRect(cx + 200, cy - 120, 120, 260);
    // прицел
    let ax = ex + 30, ay = ey - 70; if (v.mode === 'fly') { ax = cx - 300 + t * 120; ay = cy - 80 - ease.in(prog(t, 0.6, 2)) * 700; } else if (v.mode === 'calm') { ax = lerp(cx - 260, ex + 30, ease.inOut(prog(t, 0.4, 2.6))); ay = lerp(cy + 60, ey - 70, ease.inOut(prog(t, 0.4, 2.6))); }
    ring(g, ax, ay, 40, 4, '#3fe07a'); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) seg(g, [[ax + dx * 18, ay + dy * 18], [ax + dx * 60, ay + dy * 60]], 4, '#3fe07a'); circle(g, ax, ay, 4, '#3fe07a');
    if (dead) { Lb(g, 'ПОБЕДА', cx, y0 + 120, 90, '#ffd47e'); FX.rings(g, ex + 30, ey - 40, t - 1.4, { count: 2, r0: 30, r1: 160, color: '#ffd47e', a: 0.5 }); }
    Lb(g, v.kills ?? '27 / 0', x0 + w - 60, y0 + 50, 40, '#ffffff', 1, 'right');
    g.restore(); if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.96, { size: 44, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  fly(g, t, v) { // ладонь медленно опускается, муха спокойно отходит
    const cx = E.W / 2, gy = E.H * 0.78; g.fillStyle = '#c8a070'; g.fillRect(-100, gy, E.W + 200, E.H);
    const fx = cx + ease.inOut(prog(t, 0.8, 3)) * 360, fy = gy - 18; g.save(); g.translate(fx, fy); g.scale(2, 2); g.translate(-fx, -fy);
    g.fillStyle = '#1a1a22'; g.beginPath(); g.ellipse(fx, fy, 34, 20, 0, 0, 7); g.fill(); circle(g, fx + 32, fy - 6, 16, '#1a1a22'); circle(g, fx + 38, fy - 10, 9, '#8a2020');
    for (const d of [-1, 1]) { g.fillStyle = alpha('#d8ecff', 0.6); g.beginPath(); g.ellipse(fx - 10, fy - 22 + d * 4, 40, 16, d * 0.4 - 0.3, 0, 7); g.fill(); }
    for (let i = 0; i < 3; i++) seg(g, [[fx - 16 + i * 16, fy + 10], [fx - 26 + i * 18 + Math.sin(t * 10 + i) * 6, fy + 18]], 4, '#1a1a22'); g.restore();
    const hy = lerp(-200, gy - 140, ease.in(prog(t, 0, 4.5))); g.save(); g.translate(cx, hy); g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 240, 120, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) rr(g, -200 + i * 110, -40, 80, 260, 40), g.fill(); rr(g, -300, -260, 180, 300, 60); g.fillStyle = OR; g.fill(); g.restore();
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.14, { size: 46, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  labres(g, t, v) { // бланк анализа: биологический возраст
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.03); rr(g, -460, -400, 920, 800, 8); g.fillStyle = '#fbf8f1'; g.fill();
    Lb(g, 'РЕЗУЛЬТАТЫ АНАЛИЗОВ', 0, -320, 50, '#2a3a5a'); seg(g, [[-400, -280], [400, -280]], 3, '#9ab');
    Lb(g, 'Пациент: Артём, 25 лет', -400, -220, 36, '#3a3a44', 1, 'left');
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-400, -150 + i * 36, 800 - (i % 2) * 200, 8); }
    Lb(g, 'БИОЛОГИЧЕСКИЙ ВОЗРАСТ:', -400, 80, 44, '#3a3a44', 1, 'left'); const k = ease.out(prog(t, 0.6, 2.2));
    Lb(g, `${fmt(lerp(25, v.to ?? 26.4, k), 1)}`, 260, 80, 86, k > 0.5 ? '#c0302a' : '#2a2630');
    if (k >= 1) { g.strokeStyle = '#c0302a'; g.lineWidth = 8; g.beginPath(); g.ellipse(260, 80, 130, 70, 0, 0, 7); g.stroke(); }
    g.restore();
  },
  wrist(g, t, v) { // прибор на запястье: цифры мелькают слишком быстро
    const cx = E.W / 2, cy = E.H * 0.52; rr(g, -100, cy - 130, E.W + 200, 260, 0); g.fillStyle = INK; g.fill(); rr(g, -100, cy - 150, 700, 300, 40); g.fillStyle = '#5a6a8a'; g.fill();
    rr(g, cx - 280, cy - 190, 560, 380, 40); g.fillStyle = '#1a1a22'; g.fill(); rr(g, cx - 240, cy - 150, 480, 300, 20); g.fillStyle = '#0a1a10'; g.fill();
    const n = Math.floor(t * 47) % 100; const ok = v.read;
    Lb(g, ok ? '' : String((n * 37 + 11) % 100).padStart(2, '0'), cx, cy + 10, 200, '#3fe07a'); if (!ok) glow(g, cx, cy, 300, '#3fe07a', 0.2);
    if (!ok && (t * 24) % 2 < 1) { g.fillStyle = 'rgba(10,26,16,.6)'; g.fillRect(cx - 240, cy - 150, 480, 300); Lb(g, String((n * 53 + 7) % 100).padStart(2, '0'), cx, cy + 10, 200, alpha('#3fe07a', 0.6)); }
    if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.88, { size: 48, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
  mirror(g, t, v) { // зеркало: седой волос у виска
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 460, cy - 440, 920, 880, 30); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, cx - 430, cy - 410, 860, 820, 20); g.fillStyle = linGrad(g, 0, cy - 410, 0, cy + 410, ['#8a9ab0', '#5a6a80']); g.fill();
    g.save(); rr(g, cx - 430, cy - 410, 860, 820, 20); g.clip(); const r = 290; circle(g, cx, cy + 60, r, INK);
    g.fillStyle = OR; g.beginPath(); g.ellipse(cx, cy + 60 + r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
    for (const dx of [-0.34, 0.34]) circle(g, cx + dx * r, cy + 60 - r * 0.16, r * 0.11, '#f4efe6'); seg(g, [[cx - 60, cy + 60 + r * 0.32], [cx + 60, cy + 60 + r * 0.32]], 14, '#f4efe6');
    const hx = cx - r * 0.86, hy = cy + 60 - r * 0.5; g.strokeStyle = '#eef2f6'; g.lineWidth = 7; g.beginPath(); g.moveTo(hx, hy + 30); g.quadraticCurveTo(hx - 40, hy - 30, hx - 10, hy - 80); g.stroke();
    if (t > 0.8) { g.strokeStyle = '#ffd47e'; g.lineWidth = 6; g.beginPath(); g.arc(hx - 10, hy - 20, 80 + Math.sin(t * 4) * 4, 0, 7); g.stroke(); }
    g.restore(); if (v.cap) text(g, v.cap, E.W / 2, E.H * 0.95, { size: 48, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 2 });
  },
};

export const BP6 = {
  eq(g, t, v) { // «A → B»: title, a, b, op (подпись над стрелкой), sub; count:[from,to,dec] — счётчик для B
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cream = S().ui.cream, cy = E.H * 0.52;
    if (v.title) T(g, v.title, E.H * 0.16, 60);
    const a = fadeIn(t, 0.2), b = fadeIn(t, 0.9);
    const sa = v.a || '', bs = v.count ? fmt(lerp(v.count[0], v.count[1], ease.out(prog(t, 0.9, 2.2))), v.count[2] || 0) + (v.unit ? ' ' + v.unit : '') : v.b || '';
    const sz = Math.min(fit(g, sa, 640, v.size || 120, 900), fit(g, bs || ' ', 640, v.size || 120, 900));
    Lb(g, sa, E.W * 0.25, cy, sz, cream, a); Lb(g, bs, E.W * 0.75, cy, sz, gold, b); if (b > 0) glow(g, E.W * 0.75, cy, 260, gold, 0.12 * b);
    const ak = ease.out(prog(t, 0.5, 1.0)); seg(g, [[E.W * 0.43, cy], [E.W * (0.43 + 0.14 * ak), cy]], 8, c); if (ak > 0.9) poly(g, [[E.W * 0.57 + 10, cy], [E.W * 0.57 - 20, cy - 22], [E.W * 0.57 - 20, cy + 22]], c);
    if (v.op) Lb(g, v.op, E.W * 0.5, cy - 60, 52, c, ak);
    if (v.la) Lb(g, v.la, E.W * 0.25, cy + 110, 38, c, a); if (v.lb) Lb(g, v.lb, E.W * 0.75, cy + 110, 38, c, b);
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.84, 46, v.subC || gold, fadeIn(t, 1.6));
  },
  cmp(g, t, v) { // столбики: rows [[label, value, color?]], max, unit, title, sub, log
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; const R = v.rows || [];
    if (v.title) T(g, v.title, E.H * 0.14, 58);
    const max = v.max || Math.max(...R.map((r) => r[1])), x0 = E.W * 0.33, wmax = E.W * 0.5, gap = Math.min(170, (E.H * 0.6) / R.length), y0 = E.H * 0.52 - ((R.length - 1) * gap) / 2;
    R.forEach(([lab, val, col], i) => { const k = ease.out(prog(t, 0.3 + i * 0.5, 1.3 + i * 0.5)), y = y0 + i * gap; const frac = v.log ? Math.log10(1 + val) / Math.log10(1 + max) : val / max; const w = Math.max(6, wmax * frac * k);
      Lb(g, lab, x0 - 30, y, 42, c, fadeIn(t, 0.2 + i * 0.5), 'right'); rr(g, x0, y - 38, w, 76, 12); g.fillStyle = alpha(col || (i === R.length - 1 ? acc : gold), 0.8); g.fill();
      Lb(g, fmt(val * k, v.dec || 0) + (v.unit ? ' ' + v.unit : ''), x0 + w + 24, y, 46, col || gold, k > 0.05 ? 1 : 0, 'left'); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.88, 44, gold, fadeIn(t, 1.5));
  },
  hear(g, t, v) { // шкала слышимости (лог.): 20 Гц – 20 кГц светится; marks [{label, f, to, c, at}]
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cy = E.H * 0.56, x0 = 160, x1 = E.W - 160;
    T(g, v.title || 'ЧТО СЛЫШИТ УХО', E.H * 0.14, 58); const X = (f) => lerp(x0, x1, (Math.log10(f) + 0.5) / 5.5);
    rr(g, X(20), cy - 70, X(20000) - X(20), 140, 16); g.fillStyle = alpha('#3fe07a', 0.16); g.fill(); Lb(g, 'СЛЫШНО', (X(20) + X(20000)) / 2, cy - 100, 36, '#3fe07a');
    seg(g, [[x0, cy], [x1, cy]], 5, c); for (const [f, s] of [[1, '1 Гц'], [10, '10'], [100, '100'], [1000, '1 000'], [10000, '10 000'], [100000, '100 000']]) { seg(g, [[X(f), cy - 14], [X(f), cy + 14]], 4, c); Lb(g, s, X(f), cy + 50, 28, c); }
    (v.marks || []).forEach((m, i) => { const at = m.at ?? 0.4 + i * 0.6, k = m.to ? ease.inOut(prog(t, at + 0.6, at + 2.2)) : 0, a = fadeIn(t, at); if (a <= 0) return;
      const f = m.to ? Math.pow(10, lerp(Math.log10(m.f), Math.log10(m.to), k)) : m.f, x = X(f), y = cy - 190 - (i % 2) * 70, col = m.c || gold;
      seg(g, [[x, y + 30], [x, cy - 8]], 4, alpha(col, a)); circle(g, x, cy, 14, col); Lb(g, m.label, x, y, 40, col, a); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.86, 46, gold, fadeIn(t, 1.6));
  },
  dropshape(g, t) { // капля: не слеза, а булочка
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, 'ФОРМА КАПЛИ', E.H * 0.14, 60);
    const lx = E.W * 0.3, rx = E.W * 0.7, cy = E.H * 0.52;
    g.strokeStyle = c; g.lineWidth = 8; g.beginPath(); g.moveTo(lx, cy - 200); g.quadraticCurveTo(lx + 130, cy, lx + 110, cy + 60); g.arc(lx, cy + 60, 110, 0, Math.PI); g.quadraticCurveTo(lx - 130, cy, lx, cy - 200); g.stroke();
    if (t > 0.8) { seg(g, [[lx - 170, cy - 200], [lx + 170, cy + 200]], 14, acc); seg(g, [[lx + 170, cy - 200], [lx - 170, cy + 200]], 14, acc); } Lb(g, 'КАК РИСУЮТ', lx, cy + 280, 42, c);
    const k = fadeIn(t, 1.3, 0.6); g.save(); g.globalAlpha = k; g.strokeStyle = gold; g.lineWidth = 8; g.beginPath(); g.ellipse(rx, cy + 40, 170, 140, 0, Math.PI, Math.PI * 2); g.ellipse(rx, cy + 40, 170, 60, 0, 0, Math.PI); g.stroke(); glow(g, rx, cy, 240, gold, 0.12); g.restore();
    Lb(g, 'НА САМОМ ДЕЛЕ', rx, cy + 280, 42, gold, k);
  },
  fall(g, t, v) { // кружка падает со стола: обычно 0,45 с, для тебя ≈ 40 с
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, v.title || 'КРУЖКА ПАДАЕТ СО СТОЛА', E.H * 0.13, 58);
    const top = E.H * 0.3, bot = E.H * 0.8;
    for (const [x, lab, per, col] of [[E.W * 0.3, 'ОБЫЧНО · 0,45 С', 0.9, c], [E.W * 0.7, 'ДЛЯ ТЕБЯ · ≈ 40 С', 80, gold]]) {
      seg(g, [[x - 200, top], [x - 60, top]], 8, c); seg(g, [[x - 200, bot], [x + 200, bot]], 6, c);
      const ph = (t % per) / per, y = lerp(top - 10, bot - 10, ph * ph); g.save(); g.globalAlpha = 0.95; mug(g, x, y, { s: 1.6 }); g.restore(); g.save(); g.globalAlpha = 1; g.restore();
      Lb(g, lab, x, bot + 70, 44, col); }
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.2, 40, gold, fadeIn(t, 1));
  },
  sonic(g, t, v) { // бег ×100 ≈ скорость звука: фигура, конус ударной волны
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, v.title || 'ЛЁГКАЯ ТРУСЦА × 100', E.H * 0.13, 58);
    const x = E.W * 0.6, y = E.H * 0.74; fig(g, x, y, 2.6, 'kick', gold);
    for (let i = 0; i < 5; i++) { const d = 120 + i * 140 + ((t * 300) % 140); g.strokeStyle = alpha(c, 0.7 - i * 0.12); g.lineWidth = 5; g.beginPath(); g.moveTo(x + 120 - d, y - 300 - d * 0.7); g.quadraticCurveTo(x + 160, y - 300, x + 120 - d, y - 300 + d * 0.9); g.stroke(); }
    for (let i = 0; i < 10; i++) seg(g, [[x - 300 - ((t * 900 + i * 160) % 1000), y - 600 + i * 50], [x - 380 - ((t * 900 + i * 160) % 1000), y - 600 + i * 50]], 4, alpha(c, 0.5));
    Lb(g, v.big || '1 200 КМ/Ч', E.W * 0.24, E.H * 0.42, 100, gold); Lb(g, v.sub || '≈ СКОРОСТЬ ЗВУКА', E.W * 0.24, E.H * 0.56, 46, acc, fadeIn(t, 0.8));
  },
  icons(g, t, v) { // ряд иконок: ic — 'bulb' | 'kettle' | 'choc' | 'heart' | 'book' | 'min'; n, big, sub, title, left (одна иконка слева)
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; if (v.title) T(g, v.title, E.H * 0.14, 58);
    const n = v.n || 5, gap = Math.min(230, (E.W - 400) / n), x0 = E.W / 2 - ((n - 1) * gap) / 2, cy = E.H * 0.47, sc = Math.min(1, gap / 220);
    for (let i = 0; i < n; i++) { const a = ease.outBack(prog(t, 0.3 + i * (v.step ?? 0.25), 0.7 + i * (v.step ?? 0.25))); if (a <= 0) continue; g.save(); g.translate(x0 + i * gap, cy); g.scale(a * sc, a * sc); icon(g, v.ic, c, gold, acc, t + i); g.restore(); }
    if (v.big) Lb(g, v.big, E.W / 2, E.H * 0.73, 90, gold, fadeIn(t, 0.6)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.86, 44, c, fadeIn(t, 1.2));
  },
  crossing(g, t, v) { // переход сверху: бабушка, ты, машина в 15 м
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, v.title || 'ВИД СВЕРХУ', E.H * 0.1, 54);
    const ry = E.H * 0.32, rh = E.H * 0.5; seg(g, [[0, ry], [E.W, ry]], 5, c); seg(g, [[0, ry + rh], [E.W, ry + rh]], 5, c);
    for (let i = 0; i < 6; i++) { g.fillStyle = alpha(c, 0.35); g.fillRect(E.W * 0.68, ry + 20 + i * (rh / 6), 160, rh / 12); }
    const gx = E.W * 0.68 + 80, gyy = ry + rh * 0.45; circle(g, gx, gyy, 26, acc); Lb(g, 'БАБУШКА', gx + 120, gyy, 32, acc); circle(g, gx, ry + rh * 0.2, 26, OR); Lb(g, 'ТЫ', gx + 80, ry + rh * 0.2, 32, OR);
    const k = ease.inOut(prog(t, 0.4, 6)) * (v.move ? 0.25 : 0); const cx = lerp(E.W * 0.18, E.W * 0.68, k);
    rr(g, cx - 120, gyy - 60, 240, 120, 30); g.strokeStyle = gold; g.lineWidth = 6; g.stroke(); Lb(g, '60 КМ/Ч', cx, gyy, 34, gold);
    const dk = ease.out(prog(t, 0.8, 1.6)); if (dk > 0) { seg(g, [[cx + 130, gyy + 110], [cx + 130 + (gx - cx - 160) * dk, gyy + 110]], 4, gold); Lb(g, '≈ 15 М', (cx + gx) / 2, gyy + 150, 40, gold, dk); }
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.92, 44, gold, fadeIn(t, 1.4));
  },
  tower(g, t, v) { // эксперимент Иглмена: вышка 30 м, сетка, прибор на руке; mode 'fall' | 'memory'
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, v.title || 'ЭКСПЕРИМЕНТ ДЭВИДА ИГЛМЕНА', E.H * 0.1, 54);
    const tx = E.W * 0.3, top = E.H * 0.2, bot = E.H * 0.86;
    seg(g, [[tx - 60, bot], [tx - 20, top]], 6, c); seg(g, [[tx + 60, bot], [tx + 20, top]], 6, c); for (let i = 0; i < 8; i++) { const y = lerp(top, bot, i / 8); seg(g, [[tx - 20 - i * 5, y], [tx + 20 + i * 5, y + 60]], 3, alpha(c, 0.6)); }
    seg(g, [[tx + 20, top], [tx + 140, top]], 6, c); Lb(g, '30 М', tx - 120, (top + bot) / 2, 44, gold);
    const nx = tx + 300; seg(g, [[nx - 160, bot - 20], [nx + 160, bot - 20]], 6, c); for (let i = 0; i < 9; i++) seg(g, [[nx - 160 + i * 40, bot - 40], [nx - 140 + i * 40, bot - 10]], 2, alpha(c, 0.6));
    if (v.mode !== 'memory') { const k = (t % 3) / 3, fy = lerp(top - 40, bot - 70, k * k); g.save(); g.translate(nx, fy); g.rotate(Math.PI / 2); fig(g, 0, 0, 0.8, 'fall', gold); g.restore(); Lb(g, 'ЦИФРЫ НА ЗАПЯСТЬЕ?', E.W * 0.72, E.H * 0.4, 50, c); if (v.none) Lb(g, 'НЕ ПРОЧИТАЛ НИКТО', E.W * 0.72, E.H * 0.56, 60, acc, fadeIn(t, 0.6)); }
    else { const k1 = ease.out(prog(t, 0.4, 1.4)), k2 = ease.out(prog(t, 1.2, 2.4)); Lb(g, 'СКОЛЬКО ДЛИЛОСЬ ПАДЕНИЕ', E.W * 0.72, E.H * 0.3, 44, c);
      rr(g, E.W * 0.5, E.H * 0.42, 600 * k1, 70, 10); g.fillStyle = alpha(c, 0.7); g.fill(); Lb(g, 'НА САМОМ ДЕЛЕ', E.W * 0.5, E.H * 0.38, 34, c, k1, 'left');
      rr(g, E.W * 0.5, E.H * 0.6, 800 * k2, 70, 10); g.fillStyle = alpha(gold, 0.8); g.fill(); Lb(g, 'ПО ВОСПОМИНАНИЯМ', E.W * 0.5, E.H * 0.56, 34, gold, k2, 'left'); Lb(g, '+ ⅓', E.W * 0.5 + 860, E.H * 0.6 + 35, 60, acc, k2, 'left'); }
  },
  memory(g, t, v) { // память меряет время событиями: густо в детстве, пусто во взрослой рутине
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent; T(g, v.title || 'МОЗГ МЕРЯЕТ ПРОШЛОЕ СОБЫТИЯМИ', E.H * 0.12, 56);
    const rows = [['ЛЕТО В ДЕТСТВЕ', 34, gold, v.labels], ['ГОД ВО ВЗРОСЛОЙ РУТИНЕ', 4, c]]; const x0 = E.W * 0.12, x1 = E.W * 0.88;
    rows.forEach(([lab, n, col, labels], r) => { if (v.only != null && v.only !== r) return; const y = E.H * (0.4 + r * 0.28); Lb(g, lab, x0, y - 70, 40, col, 1, 'left'); seg(g, [[x0, y], [x1, y]], 4, alpha(col, 0.6));
      for (let i = 0; i < n; i++) { const a = ease.outBack(prog(t, 0.3 + i * (1.6 / n), 0.6 + i * (1.6 / n))); circle(g, lerp(x0 + 20, x1 - 20, (i + 0.5) / n) + Math.sin(i * 7) * 8, y, 14 * a, col); }
      if (labels) labels.forEach((s, i) => Lb(g, s, lerp(x0, x1, (i + 0.5) / labels.length), y + 60, 30, col, fadeIn(t, 1 + i * 0.4))); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.9, 44, acc, fadeIn(t, 1.6));
  },
};

function icon(g, k, c, gold, acc, t) {
  g.lineWidth = 8; g.strokeStyle = gold;
  if (k === 'bulb') { g.beginPath(); g.arc(0, -30, 70, 2.3, 0.84); g.stroke(); rr(g, -34, 40, 68, 50, 8); g.stroke(); glow(g, 0, -30, 160, gold, 0.25); }
  if (k === 'kettle') { rr(g, -70, -60, 140, 130, 40); g.stroke(); seg(g, [[70, -20], [120, -70]], 10, gold); g.beginPath(); g.arc(0, -70, 50, Math.PI, 0); g.stroke(); for (let i = 0; i < 3; i++) { const y = -110 - ((t * 60 + i * 20) % 60); seg(g, [[100 + i * 12, y], [104 + i * 12, y - 20]], 5, alpha(c, 0.7)); } }
  if (k === 'choc') { rr(g, -60, -90, 120, 180, 10); g.stroke(); for (let i = 1; i < 4; i++) seg(g, [[-60, -90 + i * 45], [60, -90 + i * 45]], 4, gold); seg(g, [[0, -90], [0, 90]], 4, gold); }
  if (k === 'heart') { const s = 1 + 0.08 * Math.sin(t * 12); g.save(); g.scale(s, s); g.fillStyle = alpha(acc, 0.8); g.beginPath(); g.moveTo(0, 70); g.bezierCurveTo(-110, -10, -60, -110, 0, -50); g.bezierCurveTo(60, -110, 110, -10, 0, 70); g.fill(); g.restore(); }
  if (k === 'book') { g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(-50, -80, -100, -60); g.lineTo(-100, 70); g.quadraticCurveTo(-50, 50, 0, 70); g.quadraticCurveTo(50, 50, 100, 70); g.lineTo(100, -60); g.quadraticCurveTo(50, -80, 0, -60); g.lineTo(0, 70); g.stroke(); }
  if (k === 'min') { ring(g, 0, 0, 80, 8, gold); seg(g, [[0, 0], [0, -56]], 8, gold); seg(g, [[0, 0], [40, 10]], 8, gold); }
  if (k === 'frame') { rr(g, -90, -70, 180, 140, 10); g.stroke(); circle(g, 30, -20, 20, alpha(gold, 0.6)); }
}
