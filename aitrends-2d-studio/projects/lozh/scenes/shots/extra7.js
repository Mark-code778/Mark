// shots/extra7.js — вставки, схемы и предметы «Что, если бы ты мог принять чужой облик?».
// Вставки: зеркало с чужим лицом (наплыв), фото актёра в телефоне, рекламный плакат, треснувшая футболка, пароль Лёхи,
// сайт компании, VR-зеркало, проигрыватель с пластинкой.
// Схемы: 5000 лиц, участок мозга для лиц, супер-распознаватели, парейдолия, куст или хищник, зеркальное фото,
// эффект ореола, экспозиция, эффект Протея, деменция, музыкальная память, «лицо — обложка», миля в чужих ботинках, большое число.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { bigFace } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { fit, who, phoneFrame } from './extra.js';
import { morphLayers, morphFX } from './morph.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418', CREAM = '#f4efe6';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1, align = 'center') => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a, align });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
const cap = (g, s, a = 1) => { if (s) text(g, s, E.W / 2, E.H * 0.885, { size: fit(g, s, E.W - 200, 46), font: FONTS.ui, weight: 900, color: CREAM, glow: 14, alpha: a, spacing: 2 }); };
function arrow(g, x0, y0, x1, y1, w, c, head = 22) { seg(g, [[x0, y0], [x1, y1]], w, c); const an = Math.atan2(y1 - y0, x1 - x0); poly(g, [[x1 + Math.cos(an) * head * 0.6, y1 + Math.sin(an) * head * 0.6], [x1 + Math.cos(an + 2.5) * head, y1 + Math.sin(an + 2.5) * head], [x1 + Math.cos(an - 2.5) * head, y1 + Math.sin(an - 2.5) * head]], c); }
function bigX(g, cx, cy, r, k) { if (k <= 0) return; g.save(); g.globalAlpha = k; seg(g, [[cx - r, cy - r], [cx + r, cy + r]], 30, '#e8403a'); seg(g, [[cx + r, cy - r], [cx - r, cy + r]], 30, '#e8403a'); g.restore(); }
// бюст: лицо по ключу персонажа (с родинкой, очками, причёской), opt: e, flip, of, tint
function bust(g, k, cx, cy, r, o = {}) {
  g.save(); if (o.a != null) g.globalAlpha *= o.a; if (o.flip) { g.translate(cx, 0); g.scale(-1, 1); g.translate(-cx, 0); }
  bigFace(g, cx, cy, r, { outfit: { ...(CAST[k] || CAST.artem), ...(o.of || {}) }, expr: o.e || 'neutral', rimColor: o.rim || '#ffc68a', blink: false }); g.restore();
}
function frame(g, x, y, w, h, bg, r = 18, border = '#e8e2d4') { rr(g, x - 14, y - 14, w + 28, h + 28, r + 8); g.fillStyle = border; g.fill(); rr(g, x, y, w, h, r); g.fillStyle = bg; g.fill(); }
function heart(g, x, y, s, c) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-26, -4, -16, -26, 0, -12); g.bezierCurveTo(16, -26, 26, -4, 0, 12); g.fillStyle = c; g.fill(); g.restore(); }

export const INS9 = {
  mirror(g, t, v) { // зеркало в ванной: в нём лицо w; mo — наплыв в другие облики; flip — отражение перевёрнуто
    const cx = E.W / 2, cy = E.H * 0.45, W = 880, H = 780; rr(g, cx - W / 2 - 26, cy - H / 2 - 26, W + 52, H + 52, 60); g.fillStyle = '#d8dce4'; g.fill();
    rr(g, cx - W / 2, cy - H / 2, W, H, 44); g.fillStyle = linGrad(g, 0, cy - H / 2, 0, cy + H / 2, ['#9fb4c8', '#5a6c84']); g.fill();
    g.save(); rr(g, cx - W / 2, cy - H / 2, W, H, 44); g.clip();
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 3; g.strokeRect(cx - W / 2 + i * 120 - 20, cy - H / 2 + j * 160, 120, 160); }
    const r = 230, fy = cy + 80, ml = morphLayers(v.w || 'artem', { ...(CAST[v.w || 'artem'] || CAST.artem), ...(v.of || {}) }, v.mo, t), sh = Math.sin(t * 70) * 8 * ml.shiver;
    for (const tt of ml.fx) morphFX(g, cx, fy + r * 1.3, tt, t, r / 150);
    for (const [of2, am] of ml.layers) { g.save(); g.globalAlpha *= am; if (v.flip) { g.translate(cx, 0); g.scale(-1, 1); g.translate(-cx, 0); }
      bigFace(g, cx + sh, fy, r, { outfit: of2, expr: Array.isArray(v.e) ? v.e.reduce((p, [tt, e]) => (t >= tt ? e : p), 'neutral') : v.e || 'neutral', rimColor: '#e8f2ff', blink: (t % 3.3) > 3.18 }); g.restore(); }
    if (v.ring) { const k = fadeIn(t, v.ring[2] ?? 0.6); g.save(); g.globalAlpha *= k; g.strokeStyle = S().ui.gold; g.lineWidth = 7; g.beginPath(); g.arc(cx + v.ring[0] * r, fy + v.ring[1] * r, 46 + Math.sin(t * 5) * 4, 0, 7); g.stroke(); g.restore(); }
    poly(g, [[cx + 160, cy - H / 2], [cx + 300, cy - H / 2], [cx - 60, cy + H / 2], [cx - 200, cy + H / 2]], 'rgba(255,255,255,.08)'); g.restore();
    cap(g, v.cap, fadeIn(t, v.capAt ?? 0.3));
  },
  actorpic(g, t, v) { // снимок известного актёра в телефоне — превращения нет
    const cx = E.W / 2, cy = E.H * 0.46, w = 470, h = 760; phoneFrame(g, cx, cy, w, h, '#20222c');
    g.save(); rr(g, cx - w / 2 + 20, cy - h / 2 + 90, w - 40, h - 260, 16); g.clip(); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#3a2a4a', '#c06a5a']); g.fillRect(cx - w / 2, cy - h / 2, w, h); bust(g, 'actor', cx, cy - 20, 150, { e: 'smirk' }); g.restore();
    Lb(g, v.name || 'ИЗВЕСТНЫЙ АКТЁР', cx, cy + h / 2 - 120, 34, CREAM);
    bigX(g, cx, cy - 20, 170, fadeIn(t, v.xAt ?? 1.2)); cap(g, v.cap);
  },
  poster(g, t, v) { // рекламный плакат: красавец во весь рост, идеальная улыбка
    const cx = E.W / 2, cy = E.H * 0.44, w = 1080, h = 760; frame(g, cx - w / 2, cy - h / 2, w, h, linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#f0c890', '#d86a5a']), 10, '#2a2a34');
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 10); g.clip(); glow(g, cx + 160, cy - 40, 520, '#fff2d0', 0.5); bust(g, 'hunk', cx + 200, cy + 30, 260, { e: 'smile' });
    for (let i = 0; i < 3; i++) { const an = t * 2 + i * 2.1; circle(g, cx + 200 + Math.cos(an) * 300, cy - 60 + Math.sin(an) * 200, 8, alpha('#ffffff', 0.7)); } g.restore();
    text(g, v.brand || 'НОВЫЙ АРОМАТ', cx - 270, cy - 160, { size: 64, font: FONTS.ui, weight: 900, color: '#ffffff', glow: 16 });
    text(g, v.slogan || 'БУДЬ СОБОЙ', cx - 270, cy - 80, { size: 44, font: FONTS.ui, weight: 900, color: '#fff1dc' }); cap(g, v.cap);
  },
  rip(g, t, v) { // футболка трещит по швам: великан в твоей одежде
    const cx = E.W / 2, cy = E.H * 0.46, k = ease.out(prog(t, 0.4, 1.0)), sw = 1 + 0.28 * k;
    g.save(); g.translate(cx, cy); g.scale(sw, 1); g.fillStyle = v.color || '#e8622a';
    g.beginPath(); g.moveTo(-300, -260); g.lineTo(-120, -320); g.quadraticCurveTo(0, -260, 120, -320); g.lineTo(300, -260); g.lineTo(380, -60); g.lineTo(250, -20); g.lineTo(240, 330); g.lineTo(-240, 330); g.lineTo(-250, -20); g.lineTo(-380, -60); g.closePath(); g.fill(); g.restore();
    if (k > 0) { g.strokeStyle = INK; g.lineWidth = 10; for (const [x0, y0, d] of [[-180, -200, 1], [160, -40, -1], [-60, 200, 1], [220, 220, -1]]) { g.beginPath(); g.moveTo(cx + x0 * sw, cy + y0); for (let i = 1; i <= 5; i++) g.lineTo(cx + (x0 + d * i * 22 * k) * sw, cy + y0 + (i % 2 ? -18 : 18) + i * 18 * k); g.stroke(); } }
    const wd = ease.outBack(prog(t, 0.5, 0.9)); if (wd > 0) { g.save(); g.translate(cx + 420, cy - 300); g.rotate(-0.15); g.scale(wd, wd); text(g, v.word || 'ТРРРЕСК!', 0, 0, { size: 110, font: FONTS.ui, weight: 900, color: '#ffe36a', glow: 18, glowColor: 'rgba(255,120,60,.8)' }); g.restore(); }
    cap(g, v.cap);
  },
  lock(g, t, v) { // телефон Лёхи: пароль не подходит
    const cx = E.W / 2, cy = E.H * 0.46, w = 460, h = 760; phoneFrame(g, cx, cy, w, h, '#1a2a44');
    Lb(g, 'ВВЕДИТЕ КОД', cx, cy - 300, 34, CREAM); const n = Math.min(4, Math.floor(t * 3) % 6), err = (t * 3) % 6 > 4.4;
    for (let i = 0; i < 4; i++) { const x = cx - 105 + i * 70; if (i < n) circle(g, x + (err ? Math.sin(t * 60) * 10 : 0), cy - 220, 16, err ? '#ff5a4a' : CREAM); else ring(g, x, cy - 220, 16, 4, CREAM); }
    for (let i = 0; i < 9; i++) { const x = cx - 130 + (i % 3) * 130, y = cy - 80 + Math.floor(i / 3) * 130; ring(g, x, y, 50, 3, alpha(CREAM, 0.5)); Lb(g, String(i + 1), x, y + 2, 44, CREAM); }
    if (err) Lb(g, 'НЕВЕРНЫЙ КОД', cx, cy + 340, 36, '#ff7a6a'); cap(g, v.cap);
  },
  site(g, t, v) { // сайт компании: «Наша команда» — начальница отдела
    const cx = E.W / 2, cy = E.H * 0.45, w = 1300, h = 760; frame(g, cx - w / 2, cy - h / 2, w, h, '#f4f6f8', 16, '#2a2c34');
    g.fillStyle = '#2a4a7a'; g.fillRect(cx - w / 2, cy - h / 2, w, 90); Lb(g, v.company || 'ТЕХНОСТРОЙ · НАША КОМАНДА', cx - w / 2 + 40, cy - h / 2 + 46, 36, '#ffffff', 1, 'left');
    g.save(); rr(g, cx - w / 2 + 80, cy - h / 2 + 150, 420, 520, 14); g.clip(); g.fillStyle = '#c8d4e4'; g.fillRect(cx - w / 2, cy - h / 2, w, h); bust(g, 'bossw', cx - w / 2 + 290, cy - h / 2 + 430, 150, { e: v.e || 'neutral' }); g.restore();
    Lb(g, v.name || 'ИРИНА СЕРГЕЕВНА', cx - 40, cy - 160, 54, '#1a1a24', 1, 'left'); Lb(g, v.role || 'НАЧАЛЬНИК ОТДЕЛА', cx - 40, cy - 90, 36, '#5a6a80', 1, 'left');
    for (let i = 0; i < 5; i++) { g.fillStyle = '#d4dae2'; g.fillRect(cx - 40, cy - 10 + i * 50, 520 - i * 40, 18); } cap(g, v.cap);
  },
  vrmirror(g, t, v) { // виртуальное зеркало: молодой в шлеме видит себя старым
    const cx = E.W / 2, cy = E.H * 0.48; frame(g, cx - 450, cy - 420, 900, 740, linGrad(g, 0, cy - 420, 0, cy + 340, ['#2a3a6a', '#4a2a6a']), 30, '#7ab0ff');
    g.save(); rr(g, cx - 450, cy - 420, 900, 760, 30); g.clip(); for (let i = 0; i < 12; i++) seg(g, [[cx - 450, cy - 420 + i * 70 + (t * 40) % 70], [cx + 450, cy - 420 + i * 70 + (t * 40) % 70]], 2, 'rgba(140,200,255,.15)');
    bust(g, 'oldm', cx, cy + 60, 230, { e: v.e || 'surprised', of: { top: 'tshirt', color: v.color || '#5a8ab0' } }); g.restore();
    Lb(g, 'VR', cx + 380, cy - 370, 40, '#9fd8ff'); cap(g, v.cap);
  },
  player(g, t, v) { // проигрыватель: пластинка крутится, ноты
    const cx = E.W / 2, cy = E.H * 0.56; rr(g, cx - 520, cy - 220, 1040, 440, 30); g.fillStyle = '#6a4a30'; g.fill(); rr(g, cx - 500, cy - 200, 1000, 400, 24); g.fillStyle = '#4a3220'; g.fill();
    const an = t * (v.stop ? 0 : 3.4); g.save(); g.translate(cx - 90, cy); g.rotate(an); circle(g, 0, 0, 190, '#141418'); for (let i = 1; i < 6; i++) ring(g, 0, 0, 60 + i * 24, 1.5, 'rgba(255,255,255,.08)'); circle(g, 0, 0, 58, v.label || '#d8384a'); circle(g, 0, 0, 8, '#e8e2d4'); seg(g, [[20, -40], [40, -20]], 4, 'rgba(255,255,255,.3)'); g.restore();
    seg(g, [[cx + 330, cy - 160], [cx + 260, cy + 40], [cx + 40, cy + 70]], 12, '#c9ccd4'); circle(g, cx + 330, cy - 160, 22, '#9aa0aa');
    if (!v.stop) for (let i = 0; i < 6; i++) { const ph = (t * 0.45 + i / 6) % 1, x = cx - 90 + Math.sin(i * 2.3 + ph * 5) * 260, y = cy - 220 - ph * 380; text(g, i % 2 ? '♪' : '♫', x, y, { size: 70, font: FONTS.ui, weight: 900, color: S().ui.gold, alpha: Math.sin(ph * Math.PI) }); }
    cap(g, v.cap);
  },
};

export const BP9 = {
  faces(g, t, v) { // сетка лиц: счётчик до 5000
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'СКОЛЬКО ЛИЦ ТЫ ЗНАЕШЬ', E.H * 0.11, 56);
    const n = Math.floor(lerp(0, v.n ?? 5000, ease.inOut(prog(t, 0.3, 2.6)))), cols = 30, rows = 12, shown = Math.ceil((n / (v.n ?? 5000)) * cols * rows);
    for (let i = 0; i < shown; i++) { const x = E.W * 0.1 + (i % cols) * 54, y = E.H * 0.22 + Math.floor(i / cols) * 46; circle(g, x, y, 16, alpha(c, 0.7)); circle(g, x - 5, y - 3, 3, '#0e1a30'); circle(g, x + 5, y - 3, 3, '#0e1a30'); }
    Lb(g, `≈ ${n.toLocaleString('ru-RU')}`, E.W / 2, E.H * 0.86, 110, gold); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.95, 38, c, fadeIn(t, 1.8));
  },
  ffa(g, t, v) { // участок мозга для лиц: на лицо — ярко, на предметы — слабо
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'УЧАСТОК МОЗГА ДЛЯ ЛИЦ', E.H * 0.11, 56);
    const cx = E.W * 0.36, cy = E.H * 0.55; g.save(); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, 380, 270, 0, 0, 7); g.stroke(); for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx - 270 + i * 110, cy - 110 + (i % 2) * 40, 70, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); } g.restore();
    const face = Math.floor(t / 1.1) % 2 === 0, pul = face ? 0.7 + 0.25 * Math.sin(t * 8) : 0.18; glow(g, cx + 120, cy + 170, 200, gold, pul); circle(g, cx + 120, cy + 170, 34, alpha(gold, 0.4 + pul * 0.6));
    const ix = E.W * 0.76, iy = E.H * 0.5; if (face) { circle(g, ix, iy, 120, alpha(c, 0.8)); circle(g, ix - 40, iy - 20, 14, '#0e1a30'); circle(g, ix + 40, iy - 20, 14, '#0e1a30'); seg(g, [[ix - 40, iy + 50], [ix + 40, iy + 50]], 10, '#0e1a30'); } else { rr(g, ix - 110, iy - 80, 220, 170, 20); g.strokeStyle = c; g.lineWidth = 8; g.stroke(); seg(g, [[ix + 110, iy - 30], [ix + 160, iy - 30], [ix + 160, iy + 40], [ix + 110, iy + 40]], 8, c); }
    Lb(g, face ? 'ЛИЦО: СИЛЬНЕЕ' : 'ПРЕДМЕТ: СЛАБЕЕ', ix, iy + 200, 40, face ? gold : c); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, c, fadeIn(t, 1.2));
  },
  supers(g, t, v) { // 1–2 из 100 — супер-распознаватели
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'СУПЕР-РАСПОЗНАВАТЕЛИ', E.H * 0.11, 56);
    for (let i = 0; i < 100; i++) { const x = E.W * 0.22 + (i % 20) * 62, y = E.H * 0.3 + Math.floor(i / 20) * 110, hot = (i === 27 || i === 72) && t > 1; if (hot) glow(g, x, y, 70, gold, 0.5 + 0.2 * Math.sin(t * 5)); UI.lineFigure(g, { x, y: y + 40, s: 0.32, color: hot ? gold : alpha(c, 0.55) }); }
    Lb(g, v.big || '1–2 ИЗ 100', E.W / 2, E.H * 0.9, 70, gold, fadeIn(t, 1.1)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.97, 34, c, fadeIn(t, 1.6));
  },
  police(g, t, v) { // записи с камер: лица в рамках, одно совпало
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ПОИСК ПО ЗАПИСЯМ С КАМЕР', E.H * 0.11, 54);
    for (let i = 0; i < 6; i++) { const x = E.W * (0.12 + (i % 3) * 0.28), y = E.H * (0.24 + Math.floor(i / 3) * 0.34), w = E.W * 0.24, h = E.H * 0.28, hit = i === 4 && t > 1.6; rr(g, x, y, w, h, 10); g.fillStyle = 'rgba(10,20,40,.6)'; g.fill(); g.strokeStyle = hit ? gold : alpha(c, 0.6); g.lineWidth = hit ? 8 : 3; g.stroke();
      for (let j = 0; j < 3; j++) UI.lineFigure(g, { x: x + w * (0.25 + j * 0.25), y: y + h * 0.92, s: 0.4, color: alpha(c, 0.6) }); Lb(g, `CAM ${i + 1}`, x + 20, y + 30, 22, alpha(c, 0.8), 1, 'left'); if ((t * 2) % 1 < 0.5) circle(g, x + w - 26, y + 26, 8, '#ff4a3a');
      if (hit) { g.strokeStyle = gold; g.lineWidth = 5; g.strokeRect(x + w * 0.5 - 40, y + h * 0.18, 80, 80); Lb(g, 'СОВПАДЕНИЕ', x + w / 2, y + h + 34, 32, gold); } }
  },
  pareidolia(g, t, v) { // лица там, где их нет: розетка, машина, тост
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ПАРЕЙДОЛИЯ', E.H * 0.11, 58);
    const items = v.only != null ? [v.only] : [0, 1, 2], n = items.length;
    items.forEach((k, i) => { const cx = E.W * (n === 1 ? 0.5 : 0.2 + i * 0.3), cy = E.H * 0.52, a = fadeIn(t, 0.2 + i * 0.5), eyes = fadeIn(t, 0.7 + i * 0.5); g.save(); g.globalAlpha *= a;
      if (k === 0) { rr(g, cx - 170, cy - 130, 340, 260, 40); g.fillStyle = '#e8e2d4'; g.fill(); for (const dx of [-60, 60]) { rr(g, cx + dx - 14, cy - 60, 28, 70, 10); g.fillStyle = '#3a3a44'; g.fill(); } g.globalAlpha *= eyes; g.strokeStyle = '#3a3a44'; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy + 70, 34, 0, Math.PI * 2); g.stroke(); }
      if (k === 1) { rr(g, cx - 220, cy - 110, 440, 220, 50); g.fillStyle = '#c0453a'; g.fill(); for (const dx of [-140, 140]) { circle(g, cx + dx, cy - 30, 46, '#fff2c0'); glow(g, cx + dx, cy - 30, 90, '#fff2c0', 0.4 * eyes); } rr(g, cx - 90, cy + 30, 180, 50, 20); g.fillStyle = '#2a2a30'; g.fill(); for (let j = 0; j < 5; j++) seg(g, [[cx - 70 + j * 35, cy + 36], [cx - 70 + j * 35, cy + 74]], 4, '#8a8a90'); }
      if (k === 2) { rr(g, cx - 160, cy - 170, 320, 330, 60); g.fillStyle = '#d8a050'; g.fill(); rr(g, cx - 130, cy - 140, 260, 270, 40); g.fillStyle = '#e8c070'; g.fill(); g.globalAlpha *= eyes; circle(g, cx - 55, cy - 40, 22, '#7a4a20'); circle(g, cx + 55, cy - 40, 22, '#7a4a20'); g.strokeStyle = '#7a4a20'; g.lineWidth = 12; g.beginPath(); g.arc(cx, cy + 20, 60, 0.3, Math.PI - 0.3); g.stroke(); }
      g.restore(); Lb(g, ['РОЗЕТКА', 'МАШИНА', 'ТОСТ'][k], cx, E.H * 0.85, 42, c, a); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 40, gold, fadeIn(t, 1.4));
  },
  bush(g, t, v) { // лучше сто раз принять куст за лицо, чем не заметить хищника
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЛУЧШЕ ПЕРЕСТРАХОВАТЬСЯ', E.H * 0.11, 56);
    for (let i = 0; i < 2; i++) { const cx = E.W * (0.3 + i * 0.4), cy = E.H * 0.55; for (let j = 0; j < 7; j++) circle(g, cx - 160 + j * 52, cy + Math.sin(j * 1.7) * 30, 90, alpha('#3a7a4a', 0.85)); const eyes = i === 1 ? fadeIn(t, 1.0) : 0.6 + 0.4 * Math.sin(t * 3);
      g.save(); g.globalAlpha *= eyes; circle(g, cx - 40, cy - 10, 14, i ? '#ffd84a' : '#c8e8c0'); circle(g, cx + 40, cy - 10, 14, i ? '#ffd84a' : '#c8e8c0'); if (i) { circle(g, cx - 40, cy - 10, 5, '#141418'); circle(g, cx + 40, cy - 10, 5, '#141418'); } g.restore();
      Lb(g, i ? 'ХИЩНИК' : 'ПРОСТО КУСТ', cx, E.H * 0.82, 44, i ? '#ff7a6a' : c); }
    Lb(g, v.sub || '100 РАЗ ОШИБИТЬСЯ  >  1 РАЗ НЕ ЗАМЕТИТЬ', E.W / 2, E.H * 0.93, 42, gold, fadeIn(t, 1.4));
  },
  mirrorpic(g, t, v) { // эксперимент: обычное фото и зеркальное — кто какое выбирает
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ОБЫЧНОЕ ИЛИ ЗЕРКАЛЬНОЕ?', E.H * 0.11, 56);
    [['ОБЫЧНОЕ', false], ['ЗЕРКАЛЬНОЕ', true]].forEach(([s, fl], i) => { const cx = E.W * (0.3 + i * 0.4), cy = E.H * 0.5; frame(g, cx - 230, cy - 260, 460, 460, '#cfe0f0', 12);
      g.save(); rr(g, cx - 230, cy - 260, 460, 460, 12); g.clip(); bust(g, 'artem', cx, cy - 10, 150, { e: 'smile', flip: fl }); g.restore(); Lb(g, s, cx, cy + 260, 40, c);
      const pick = v.step === 1 ? i === 1 : v.step === 2 ? i === 0 : null; if (pick) { const k = ease.outBack(prog(t, 0.4, 0.8)); g.save(); g.translate(cx + 190, cy - 230); g.scale(k, k); heart(g, 0, 0, 3.4, '#ff5a6a'); g.restore();
        Lb(g, v.step === 1 ? 'ВЫБИРАЕШЬ ТЫ' : 'ВЫБИРАЮТ ДРУЗЬЯ', cx, cy + 330, 44, gold, fadeIn(t, 0.6)); } });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.95, 40, gold, fadeIn(t, 1.2));
  },
  flipmole(g, t, v) { // зеркало переворачивает: родинка переезжает на другую сторону
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЗЕРКАЛО ПЕРЕВОРАЧИВАЕТ ЛИЦО', E.H * 0.11, 56);
    const k = ease.inOut(prog(t, 0.6, 1.6)); bust(g, 'artem', E.W * 0.3, E.H * 0.55, 190, { e: 'neutral' }); Lb(g, 'КАК ВИДИТ МАМА', E.W * 0.3, E.H * 0.88, 40, c);
    g.save(); g.globalAlpha *= k; bust(g, 'artem', E.W * 0.7, E.H * 0.55, 190, { e: 'neutral', flip: true }); g.restore(); Lb(g, 'КАК ВИДИШЬ ТЫ', E.W * 0.7, E.H * 0.88, 40, gold, k);
    g.save(); g.setLineDash([16, 14]); seg(g, [[E.W / 2, E.H * 0.24], [E.W / 2, E.H * 0.82]], 4, alpha(c, 0.6)); g.restore(); arrow(g, E.W * 0.44, E.H * 0.3, E.W * 0.56, E.H * 0.3, 6, gold);
    for (const [x, fl] of [[0.3, 1], [0.7, -1]]) { if (x === 0.7 && k < 0.5) continue; g.strokeStyle = gold; g.lineWidth = 6; g.beginPath(); g.arc(E.W * x + fl * -0.42 * 190, E.H * 0.55 + 0.22 * 190, 34 + Math.sin(t * 5) * 3, 0, 7); g.stroke(); }
  },
  halo(g, t, v) { // эффект ореола: красивое лицо → «умный, добрый, честный»
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЭФФЕКТ ОРЕОЛА', E.H * 0.11, 58);
    const cx = E.W / 2, cy = E.H * 0.55; glow(g, cx, cy - 40, 340, gold, 0.35 + 0.1 * Math.sin(t * 3)); g.save(); g.translate(cx, cy - 260); g.scale(1, 0.3); ring(g, 0, 0, 160, 14, gold); g.restore(); bust(g, 'hunk', cx, cy, 190, { e: 'smile' });
    (v.labels || ['УМ', 'ДОБРОТА', 'ЧЕСТНОСТЬ']).forEach((s, i) => { const a = fadeIn(t, 0.6 + i * 0.5), x = cx + [-1, 1, -1][i] * (420 + (i === 2 ? 40 : 0)), y = cy + [-140, -20, 120][i]; Lb(g, s, x, y, 52, gold, a); seg(g, [[cx + Math.sign(x - cx) * 230, cy - 40], [x - Math.sign(x - cx) * 130, y - 10]], 3, alpha(gold, 0.6 * a)); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 42, c, fadeIn(t, 2.0));
  },
  exposure(g, t, v) { // экспозиция: страх падает от вечера к вечеру
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЭКСПОЗИЦИЯ', E.H * 0.11, 58);
    const L = v.labels || ['ВЕЧЕР 1', 'ВЕЧЕР 2', 'ВЕЧЕР 3', 'ВЕЧЕР 4', 'ВЕЧЕР 5'], vals = v.vals || [0.95, 0.75, 0.5, 0.32, 0.15], base = E.H * 0.8;
    L.forEach((s, i) => { const k = ease.out(prog(t, 0.3 + i * 0.35, 0.7 + i * 0.35)), h = 480 * vals[i] * k, x = E.W / 2 + (i - (L.length - 1) / 2) * E.W * 0.16; rr(g, x - 70, base - h, 140, h, 12); g.fillStyle = alpha(i < 2 ? '#ff7a6a' : i < 4 ? gold : '#7ad08a', 0.85); g.fill(); Lb(g, s, x, base + 44, 30, c); if (v.cols) { g.fillStyle = v.cols[i]; } });
    Lb(g, v.axis || 'СТРАХ', E.W * 0.06, base - 240, 34, c, 1, 'left'); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.95, 40, gold, fadeIn(t, 2.0));
  },
  proteus(g, t, v) { // эффект Протея: аватар меняет поведение
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЭФФЕКТ ПРОТЕЯ', E.H * 0.11, 58);
    const rows = v.rows || [['ВЫСОКИЙ АВАТАР', 'УВЕРЕННЕЕ В ПЕРЕГОВОРАХ', 'guard'], ['КРАСИВЫЙ АВАТАР', 'ОХОТНЕЕ ОБЩАЕТСЯ', 'hunk']];
    rows.forEach(([a, b, k], i) => { const y = E.H * (0.38 + i * 0.3), al = fadeIn(t, 0.3 + i * 0.9); g.save(); g.globalAlpha *= al; rr(g, E.W * 0.1, y - 100, 300, 200, 20); g.strokeStyle = '#9fd8ff'; g.lineWidth = 4; g.stroke(); bust(g, k, E.W * 0.1 + 150, y + 10, 70, { e: 'smile' });
      Lb(g, a, E.W * 0.1 + 150, y + 130, 28, c); arrow(g, E.W * 0.36, y, E.W * 0.5, y, 6, gold); Lb(g, b, E.W * 0.53, y, 50, gold, 1, 'left'); g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, c, fadeIn(t, 1.8));
  },
  dementia(g, t, v) { // деменция: новые воспоминания гаснут первыми, старые держатся
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЧТО ИСЧЕЗАЕТ ПЕРВЫМ', E.H * 0.11, 56);
    const L = v.labels || ['ЗАВТРАК', 'ВЧЕРА', 'ПРОШЛЫЙ ГОД', 'ВНУК ВЫРОС', 'РАБОТА', 'СВАДЬБА · 50 ЛЕТ НАЗАД'];
    L.forEach((s, i) => { const y = E.H * (0.24 + i * 0.1), fade = i < L.length - 1 ? ease.inOut(prog(t, 0.6 + i * 0.45, 1.2 + i * 0.45)) * (1 - i * 0.12) : 0, keep = i === L.length - 1, w = 720;
      rr(g, E.W / 2 - w / 2, y - 34, w, 68, 14); g.fillStyle = keep ? alpha(gold, 0.85) : alpha(c, 0.55 * (1 - fade)); g.fill(); Lb(g, s, E.W / 2, y + 2, 34, keep ? '#1a1206' : alpha('#0e1a30', 1 - fade)); if (keep) glow(g, E.W / 2, y, 420, gold, 0.25 + 0.1 * Math.sin(t * 4)); });
    Lb(g, 'НОВОЕ', E.W / 2 - 470, E.H * 0.24, 30, c, 1, 'right'); Lb(g, 'СТАРОЕ', E.W / 2 - 470, E.H * 0.74, 30, gold, 1, 'right'); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, gold, fadeIn(t, 2.2));
  },
  music(g, t, v) { // музыкальная память держится дольше
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'МУЗЫКАЛЬНАЯ ПАМЯТЬ', E.H * 0.11, 58);
    const cx = E.W * 0.42, cy = E.H * 0.55; g.save(); g.strokeStyle = alpha(c, 0.5); g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, 380, 270, 0, 0, 7); g.stroke(); g.restore();
    for (let i = 0; i < 14; i++) { const x = cx - 300 + (i % 7) * 100, y = cy - 120 + Math.floor(i / 7) * 160, dim = ease.inOut(prog(t, 0.4 + i * 0.08, 1.2 + i * 0.08)); circle(g, x, y, 26, alpha(c, 0.6 * (1 - dim * 0.8))); }
    glow(g, cx + 60, cy + 40, 200, gold, 0.6 + 0.2 * Math.sin(t * 4)); text(g, '♫', cx + 60, cy + 60, { size: 140, font: FONTS.ui, weight: 900, color: gold, glow: 20 });
    Lb(g, v.label || 'ПЕСНИ МОЛОДОСТИ', E.W * 0.78, cy, 46, gold, fadeIn(t, 1.0)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.93, 40, c, fadeIn(t, 1.6));
  },
  cover(g, t, v) { // лицо — это обложка: книга открывается, внутри — целая жизнь
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ЛИЦО — ЭТО ОБЛОЖКА', E.H * 0.11, 58);
    const cx = E.W / 2, cy = E.H * 0.55, k = ease.inOut(prog(t, v.openAt ?? 1.4, (v.openAt ?? 1.4) + 1.0)), w = 380, h = 520;
    rr(g, cx - 4, cy - h / 2, w, h, 12); g.fillStyle = '#f2ead8'; g.fill(); for (let i = 0; i < 9; i++) { g.fillStyle = alpha('#8a7a60', 0.5 * k); g.fillRect(cx + 40, cy - h / 2 + 70 + i * 48, w - 90 - (i % 3) * 40, 12); }
    Lb(g, v.inside || 'ЦЕЛАЯ ЖИЗНЬ', cx + w / 2, cy + h / 2 - 50, 34, '#8a5a30', k);
    const cw = w * Math.cos(k * Math.PI * 0.92); g.save(); rr(g, cx + Math.min(0, cw) - (cw < 0 ? 0 : 0), cy - h / 2, Math.abs(cw), h, 12); g.fillStyle = '#3a4a7a'; g.fill(); g.clip(); if (cw > 40) { g.translate(cx + cw / 2, 0); g.scale(cw / w, 1); g.translate(-(cx + cw / 2), 0); bust(g, v.w || 'oldm', cx + cw / 2, cy - 20, 120, { e: 'neutral' }); } g.restore();
    rr(g, cx - w - 4, cy - h / 2, w, h, 12); g.fillStyle = alpha('#f2ead8', k); g.fill();
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 40, gold, fadeIn(t, 2.4));
  },
  mile(g, t, v) { // пройди милю в его ботинках
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || '«ПРОЙДИ МИЛЮ В ЕГО БОТИНКАХ»', E.H * 0.13, 54, gold);
    const n = Math.floor(clamp(t / 0.25, 0, 16)); for (let i = 0; i < n; i++) { const x = E.W * 0.1 + i * 100, y = E.H * 0.6 + (i % 2 ? 40 : -40); g.save(); g.translate(x, y); g.rotate(0.1); g.fillStyle = alpha(c, 0.75); g.beginPath(); g.ellipse(0, 0, 34, 16, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-44, 0, 14, 12, 0, 0, 7); g.fill(); g.restore(); }
    Lb(g, '1 МИЛЯ ≈ 1,6 КМ', E.W / 2, E.H * 0.84, 44, c, fadeIn(t, 1.4)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 40, gold, fadeIn(t, 2.0));
  },
  bignum(g, t, v) { // большое число: title, n (число), unit, sub
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || '', E.H * 0.16, 56);
    const n = lerp(v.from ?? 0, v.n, ease.out(prog(t, 0.2, 1.6))), s = (v.pre || '') + (v.dec ? n.toFixed(v.dec).replace('.', ',') : Math.round(n).toLocaleString('ru-RU')) + (v.suf || '') + (v.plus ? '+' : '');
    glow(g, E.W / 2, E.H * 0.48, 500, gold, 0.25); Lb(g, s, E.W / 2, E.H * 0.48, 220, gold); if (v.unit) Lb(g, v.unit, E.W / 2, E.H * 0.66, 56, c, fadeIn(t, 0.8)); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.86, 42, c, fadeIn(t, 1.6));
    if (v.icons) for (let i = 0; i < 30; i++) UI.lineFigure(g, { x: E.W * 0.1 + i * 55, y: E.H * 0.97, s: 0.28, color: alpha(c, 0.35) });
  },
  feel(g, t, v) { // слова ↔ чувства
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ОТВЕЧАТЬ НЕ НА СЛОВА, А НА ЧУВСТВА', E.H * 0.13, 54);
    const k = fadeIn(t, 1.0); Lb(g, '«А ГАЛЯ ГДЕ?»', E.W * 0.28, E.H * 0.42, 56, c); Lb(g, 'СЛОВА', E.W * 0.28, E.H * 0.52, 34, alpha(c, 0.7)); arrow(g, E.W * 0.42, E.H * 0.45, E.W * 0.56, E.H * 0.45, 6, gold);
    g.save(); g.globalAlpha *= k; Lb(g, 'МНЕ СТРАШНО.', E.W * 0.74, E.H * 0.38, 56, gold); Lb(g, 'Я ОДИН.', E.W * 0.74, E.H * 0.47, 56, gold); Lb(g, 'ЧУВСТВА', E.W * 0.74, E.H * 0.56, 34, alpha(gold, 0.8)); g.restore();
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.82, 46, CREAM, fadeIn(t, 2.0));
  },
};

// предметы на сцене: pr: [{ t: 'billboard' | 'armchair' | 'player' | 'mirrorw' | 'door' | 'vr', x, ... }]
export const PR9 = {
  billboard(g, x, GY, p, t) { const w = 560, h = 380, y = GY - (p.h ?? 640); seg(g, [[x - 180, GY], [x - 180, y + h]], 14, '#3a3a44'); seg(g, [[x + 180, GY], [x + 180, y + h]], 14, '#3a3a44');
    rr(g, x - w / 2 - 10, y - 10, w + 20, h + 20, 10); g.fillStyle = '#2a2a34'; g.fill(); g.save(); rr(g, x - w / 2, y, w, h, 6); g.clip(); g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#f0c890', '#d86a5a']); g.fillRect(x - w / 2, y, w, h); bust(g, 'hunk', x + 110, y + 230, 120, { e: 'smile' }); g.restore();
    text(g, p.s || 'НОВЫЙ АРОМАТ', x - 130, y + 80, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' }); },
  armchair(g, x, GY, p) { g.save(); g.translate(x, GY); g.scale(p.f || 1, 1); const c = p.c || '#7a4a3a'; rr(g, -120, -150, 60, 150, 20); g.fillStyle = shade(c, -0.15); g.fill(); rr(g, -130, -360, 70, 260, 30); g.fillStyle = shade(c, -0.1); g.fill(); rr(g, -100, -140, 220, 70, 20); g.fillStyle = c; g.fill(); rr(g, 70, -190, 60, 190, 20); g.fillStyle = shade(c, -0.2); g.fill(); g.restore(); },
  player(g, x, GY, p, t) { rr(g, x - 110, GY - 200, 220, 200, 10); g.fillStyle = '#6a4a30'; g.fill(); rr(g, x - 130, GY - 260, 260, 60, 10); g.fillStyle = '#4a3220'; g.fill(); g.save(); g.translate(x - 20, GY - 236); g.scale(1, 0.3); circle(g, 0, 0, 90, '#141418'); circle(g, 0, 0, 28, '#d8384a'); g.restore(); seg(g, [[x + 100, GY - 262], [x + 60, GY - 240]], 5, '#c9ccd4');
    if (p.on) for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i / 4) % 1; text(g, i % 2 ? '♪' : '♫', x - 30 + Math.sin(i * 2 + ph * 5) * 120, GY - 290 - ph * 260, { size: 50, font: FONTS.ui, weight: 900, color: '#ffd47e', alpha: Math.sin(ph * Math.PI) }); } },
  mirrorw(g, x, GY, p) { const y = GY - (p.h ?? 560); rr(g, x - 110, y, 220, 300, 18); g.fillStyle = '#c9ccd4'; g.fill(); rr(g, x - 96, y + 14, 192, 272, 12); g.fillStyle = linGrad(g, 0, y, 0, y + 300, ['#9fb4c8', '#6a7c94']); g.fill(); poly(g, [[x + 20, y + 14], [x + 70, y + 14], [x - 20, y + 286], [x - 70, y + 286]], 'rgba(255,255,255,.12)'); },
  door(g, x, GY, p) { rr(g, x - 110, GY - 470, 220, 470, 6); g.fillStyle = '#3a2a24'; g.fill(); if (p.open) { rr(g, x - 100, GY - 460, 200, 460, 4); g.fillStyle = '#f2d8a0'; g.fill(); glow(g, x, GY - 230, 260, '#ffe0a0', 0.4); poly(g, [[x + 100, GY - 460], [x + 160, GY - 490], [x + 160, GY + 20], [x + 100, GY]], '#6a4a3a'); } else { rr(g, x - 100, GY - 460, 200, 460, 4); g.fillStyle = '#6a4a3a'; g.fill(); circle(g, x + 70, GY - 230, 9, '#d8c080'); circle(g, x, GY - 360, 6, '#1a1a20'); } Lb(g, p.n || '', x, GY - 410, 30, '#e8d8b0'); },
  vr(g, x, GY, p) { /* шлем в руках — рисуется отдельно по позе, тут подставка */ rr(g, x - 60, GY - 120, 120, 120, 10); g.fillStyle = '#3a3a44'; g.fill(); rr(g, x - 50, GY - 170, 100, 50, 14); g.fillStyle = '#e8eaf0'; g.fill(); rr(g, x - 40, GY - 160, 80, 30, 10); g.fillStyle = '#2a3a6a'; g.fill(); },
};
