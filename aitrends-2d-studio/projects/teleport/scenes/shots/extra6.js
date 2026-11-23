// shots/extra6.js — вставки и схемы «Что, если бы ты умел телепортироваться?».
// Вставки: фото / видео пляжа в телефоне (не работает), ролик из аэропорта с хлопком.
// Схемы: откуда хлопок (воздух), квантовая телепортация Земля — спутник, вращение Земли и скорости на широтах,
// каюта Галилея, горизонт, цепочка прыжков, граница, город распался на точки, гиппокамп, «время — это мышца».
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import * as FX from '/engine/fx2d.js';
import { CAST } from '../cast.js';
import { fit, who, phoneFrame, avatar } from './extra.js';

const OR = CAST.artem.color, BL = CAST.leha.color, INK = '#141418';
const T = (g, s, y = E.H * 0.13, size = 60, color) => { const sz = fit(g, s, E.W - 160, size, 900); text(g, s, E.W / 2, y, { size: sz, font: FONTS.ui, weight: 900, color: color || UI.bpStroke(), spacing: 3 }); };
const Lb = (g, s, x, y, size, color, a = 1, align = 'center') => text(g, s, x, y, { size, font: FONTS.ui, weight: 900, color, alpha: a, align });
const fadeIn = (t, at, d = 0.4) => ease.out(clamp((t - at) / d));
function arrow(g, x0, y0, x1, y1, w, c, head = 22) { seg(g, [[x0, y0], [x1, y1]], w, c); const an = Math.atan2(y1 - y0, x1 - x0); poly(g, [[x1 + Math.cos(an) * head * 0.6, y1 + Math.sin(an) * head * 0.6], [x1 + Math.cos(an + 2.5) * head, y1 + Math.sin(an + 2.5) * head], [x1 + Math.cos(an - 2.5) * head, y1 + Math.sin(an - 2.5) * head]], c); }
function pill(g, x, y, s, c, size = 40, a = 1, fill = 'rgba(10,8,16,.85)') {
  g.save(); g.globalAlpha *= a; g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(s).width + s.length * 2 + size * 0.9, h = size * 1.5;
  rr(g, x - w / 2, y - h / 2, w, h, size * 0.3); g.fillStyle = fill; g.fill(); g.strokeStyle = alpha(c, 0.85); g.lineWidth = size * 0.07; g.stroke(); text(g, s, x, y + 2, { size, font: FONTS.ui, weight: 900, color: c, spacing: 1 }); g.restore();
}
function beachPhoto(g, x, y, w, h) { g.fillStyle = linGrad(g, 0, y, 0, y + h * 0.45, ['#7ab8e8', '#cfe6f6']); g.fillRect(x, y, w, h * 0.45); g.fillStyle = '#3a8ac0'; g.fillRect(x, y + h * 0.45, w, h * 0.25); g.fillStyle = '#e8d2a0'; g.fillRect(x, y + h * 0.7, w, h * 0.3); circle(g, x + w * 0.75, y + h * 0.16, h * 0.06, '#fff6d8'); for (let i = 0; i < 4; i++) seg(g, [[x + 20 + i * w * 0.24, y + h * (0.52 + (i % 2) * 0.08)], [x + 80 + i * w * 0.24, y + h * (0.52 + (i % 2) * 0.08)]], 4, alpha('#ffffff', 0.5)); }
function bigX(g, cx, cy, r, k) { if (k <= 0) return; g.save(); g.globalAlpha = k; seg(g, [[cx - r, cy - r], [cx + r, cy + r]], 30, '#e8403a'); seg(g, [[cx + r, cy - r], [cx - r, cy + r]], 30, '#e8403a'); g.restore(); }
function earth(g, cx, cy, R, rot = 0) {
  glow(g, cx, cy, R * 1.5, '#6ab0ff', 0.25); circle(g, cx, cy, R, '#2a6ac8'); g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
  for (const [lo, la, r] of [[0.3, -0.3, 0.32], [1.6, 0.1, 0.26], [2.8, -0.45, 0.3], [4.1, 0.35, 0.22], [5.2, -0.1, 0.28]]) { const ph = lo + rot, x = Math.sin(ph); if (Math.cos(ph) < -0.1) continue; g.fillStyle = '#4a9a5a'; g.beginPath(); g.ellipse(cx + x * R * 0.8, cy + la * R, r * R * Math.max(0.2, Math.cos(ph)), r * R * 0.8, 0, 0, 7); g.fill(); }
  circle(g, cx + R * 0.35, cy - R * 0.1, R * 1.05, 'rgba(0,0,10,.25)'); g.restore();
}

export const INS8 = {
  phonepic(g, t, v) { // снимок / видео пляжа в телефоне, а ты остаёшься на диване
    const cx = E.W / 2, cy = E.H * 0.5, w = 520, h = 900; phoneFrame(g, cx, cy, w, h, '#101218');
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.clip(); beachPhoto(g, cx - w / 2, cy - h / 2 + 120, w, 620); g.restore();
    if (v.mode === 'video') { circle(g, cx, cy - 20, 70, 'rgba(0,0,0,.5)'); poly(g, [[cx - 22, cy - 56], [cx - 22, cy + 16], [cx + 40, cy - 20]], '#fff'); rr(g, cx - w / 2 + 30, cy + 280, w - 60, 10, 5); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill(); rr(g, cx - w / 2 + 30, cy + 280, (w - 60) * ((t * 0.2) % 1), 10, 5); g.fillStyle = '#e04a3a'; g.fill(); }
    text(g, v.mode === 'video' ? 'ВИДЕО · СОЧИ' : 'ФОТО · СОЧИ', cx, cy - h / 2 + 70, { size: 32, font: FONTS.ui, weight: 900, color: '#cfd8ea' });
    bigX(g, cx, cy - 20, 220, ease.out(prog(t, v.x ?? 1.2, (v.x ?? 1.2) + 0.25)));
    if (v.cap) text(g, v.cap, cx, E.H * 0.95, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 14 });
  },
  window(g, t, v) { // окно квартиры на пятом этаже: на подоконнике кактус
    g.fillStyle = '#c8bfb4'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let y = 0; y < E.H; y += 160) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, y, E.W, 6); }
    const cx = E.W / 2, cy = E.H * 0.5; rr(g, cx - 380, cy - 330, 760, 620, 10); g.fillStyle = '#f4f1ea'; g.fill(); rr(g, cx - 350, cy - 300, 700, 560, 6); g.fillStyle = linGrad(g, 0, cy - 300, 0, cy + 260, ['#e8c890', '#c89a6a']); g.fill();
    rr(g, cx + 90, cy - 40, 220, 140, 6); g.fillStyle = '#7a5a3a'; g.fill(); rr(g, cx + 140, cy - 80, 50, 46, 8); g.fillStyle = '#e8622a'; g.fill(); seg(g, [[cx, cy - 300], [cx, cy + 260]], 14, '#f4f1ea'); seg(g, [[cx - 350, cy - 40], [cx + 350, cy - 40]], 10, '#f4f1ea');
    rr(g, cx - 420, cy + 260, 840, 34, 6); g.fillStyle = '#f4f1ea'; g.fill(); const r = 1.6; g.save(); g.translate(cx - 200, cy + 262); g.scale(r, r); rr(g, -26, -40, 52, 40, 5); g.fillStyle = '#c0703a'; g.fill(); rr(g, -14, -110, 28, 74, 14); g.fillStyle = '#4a9a5a'; g.fill(); rr(g, 8, -90, 26, 14, 7); g.fill(); rr(g, 22, -110, 12, 30, 6); g.fill(); circle(g, 0, -112, 7, '#e86a9a'); g.restore();
    poly(g, [[cx + 60, cy - 300], [cx + 160, cy - 300], [cx - 60, cy + 260], [cx - 160, cy + 260]], 'rgba(255,255,255,.12)');
    if (v.cap) text(g, v.cap, cx, E.H * 0.93, { size: 50, font: FONTS.ui, weight: 900, color: S().ui.cream, glow: 14 });
  },
  clip(g, t, v) { // ролик из аэропорта: хлопок — и парень из воздуха у стойки регистрации
    const cx = E.W * 0.4, cy = E.H * 0.5, w = 1000, h = 600; rr(g, cx - w / 2 - 20, cy - h / 2 - 20, w + 40, h + 40, 44); g.fillStyle = '#0c0d12'; g.fill();
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 26); g.clip(); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#c8d0dc', '#a8b0bc']); g.fillRect(cx - w / 2, cy - h / 2, w, h);
    rr(g, cx + 80, cy - 220, 220, 56, 6); g.fillStyle = '#2a5a8a'; g.fill(); text(g, 'РЕГИСТРАЦИЯ', cx + 190, cy - 192, { size: 24, font: FONTS.ui, weight: 900, color: '#fff' }); rr(g, cx + 20, cy + 110, 340, 190, 6); g.fillStyle = '#e8eaee'; g.fill();
    who(g, 'agent', cx + 190, cy + 140, 1.2, { e: (t > (v.pop ?? 0.9) + 0.1) ? 'shocked' : 'neutral', p: 'stand', f: -1 });
    const pk = t - (v.pop ?? 0.9); if (pk > 0) who(g, 'artem', cx - 160, cy + 290, 1.2, { e: 'smile', p: 'relaxed', a: 1 }); if (pk > 0 && pk < 0.2) { glow(g, cx - 160, cy + 140, 300, '#fff4d8', (0.2 - pk) * 5); }
    if (pk > 0 && pk < 0.8) { g.save(); g.globalAlpha = 1 - pk / 0.8; ring(g, cx - 160, cy + 150, 40 + pk * 400, 8, '#fff'); g.restore(); text(g, 'ХЛОП!', cx - 160, cy - 140, { size: 80, font: FONTS.ui, weight: 900, color: '#ffd84a', glow: 18, glowColor: 'rgba(255,140,40,.8)', alpha: 1 - pk / 0.8 }); }
    g.restore(); if (Math.floor(t * 2) % 2) circle(g, cx - w / 2 + 40, cy - h / 2 + 40, 14, '#e04a3a'); text(g, 'REC', cx - w / 2 + 92, cy - h / 2 + 40, { size: 28, font: FONTS.ui, weight: 900, color: '#ffffff' });
    const k = ease.out(prog(t, v.at ?? 1.4, (v.at ?? 1.4) + (v.dur ?? 2.4))), n = Math.round(lerp(v.from ?? 0, v.to ?? 4800000, k));
    const rx = E.W * 0.82; text(g, n.toLocaleString('ru-RU').replace(/,| /g, ' '), rx, cy - 30, { size: 74, font: FONTS.ui, weight: 900, color: '#ffffff' }); text(g, v.label || 'просмотров', rx, cy + 40, { size: 34, font: FONTS.ui, weight: 800, color: '#9aa4b8' });
    if (v.when) text(g, v.when, rx, cy + 140, { size: 56, font: FONTS.ui, weight: 900, color: S().ui.gold, glow: 16, glowColor: 'rgba(255,190,90,.5)' });
  },
};

export const BP8 = {
  airpop(g, t, v) { // откуда хлопок: появился — воздух выталкивает; исчез — воздух схлопывается в пустоту
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ВСЁ ДЕЛО В ВОЗДУХЕ', E.H * 0.12, 58);
    const sides = v.mode === 'both' ? ['in', 'out'] : [v.mode || 'in'];
    sides.forEach((m, i) => { const cx = sides.length > 1 ? E.W * (0.28 + i * 0.44) : E.W / 2, cy = E.H * 0.56, a = fadeIn(t, 0.2 + i * 0.6);
      g.save(); g.globalAlpha *= a;
      if (m === 'in') who(g, 'artem', cx, cy + 230, 1.55, { e: 'surprised', p: 'stand' }); else { g.save(); g.setLineDash([14, 12]); g.strokeStyle = alpha(c, 0.8); g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, 80, 220, 0, 0, 7); g.stroke(); g.restore(); }
      for (let k = 0; k < 10; k++) { const an = (k / 10) * Math.PI * 2, ph = ((t * 0.9 + k * 0.07) % 1), out = m === 'in', r0 = out ? 150 + ph * 120 : 330 - ph * 140, r1 = out ? r0 + 70 : r0 - 70;
        arrow(g, cx + Math.cos(an) * r0, cy + Math.sin(an) * r0 * 0.9, cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * 0.9, 6, out ? gold : '#8fd0ff', 18); }
      if (m === 'out') { const b = ((t * 0.9) % 1); if (b > 0.85) ring(g, cx, cy, 60 + (b - 0.85) * 900, 6, alpha('#ffffff', (1 - b) * 6)); }
      Lb(g, m === 'in' ? 'ПОЯВИЛСЯ: ВОЗДУХ ВЫТАЛКИВАЕТ' : 'ИСЧЕЗ: ВОЗДУХ СХЛОПЫВАЕТСЯ', cx, E.H * 0.9, sides.length > 1 ? 36 : 46, m === 'in' ? gold : '#8fd0ff');
      g.restore(); });
  },
  quantum(g, t, v) { // телепортация квантового состояния: Земля — спутник, 2017
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'КВАНТОВАЯ ТЕЛЕПОРТАЦИЯ', E.H * 0.11, 58);
    const ex = E.W * 0.24, ey = E.H * 0.78, sx = E.W * 0.78, sy = E.H * 0.32; earth(g, ex, ey + 180, 330, t * 0.1);
    rr(g, sx - 60, sy - 24, 120, 48, 8); g.fillStyle = '#c8ccd6'; g.fill(); for (const d of [-1, 1]) { rr(g, sx + d * 70 - (d < 0 ? 110 : 0), sy - 18, 110, 36, 4); g.fillStyle = '#3a5aa8'; g.fill(); }
    const px = ex + 40, py = ey - 140; circle(g, px, py, 22, gold); glow(g, px, py, 80, gold, 0.4 + 0.2 * Math.sin(t * 6)); Lb(g, 'ЧАСТИЦА', px, py + 60, 30, c);
    const k = ease.inOut(prog(t, 0.6, 1.8)); g.save(); g.setLineDash([16, 14]); g.lineDashOffset = -t * 60; g.strokeStyle = alpha(gold, 0.8); g.lineWidth = 5; g.beginPath(); g.moveTo(px, py); g.lineTo(lerp(px, sx, k), lerp(py, sy + 60, k)); g.stroke(); g.restore();
    if (v.dist !== false) Lb(g, v.dist || '> 1 200 КМ', (px + sx) / 2 - 60, (py + sy) / 2 - 30, 44, c, fadeIn(t, 1.2));
    const b = fadeIn(t, 1.8); if (b > 0) { circle(g, sx, sy + 60, 22 * b, gold); glow(g, sx, sy + 60, 80, gold, 0.4 * b); Lb(g, 'ТОЧНАЯ КОПИЯ', sx, sy + 120, 30, c, b); }
    if (v.sub) Lb(g, v.sub, E.W * 0.62, E.H * 0.86, 44, gold, fadeIn(t, 1.4));
  },
  globe(g, t, v) { // Земля вращается: стрелки скорости на разных широтах. marks: [label, широта°, скорость, цвет]
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; if (v.title) T(g, v.title, E.H * 0.11, 58);
    const cx = E.W * (v.cx ?? 0.36), cy = E.H * 0.56, R = 340; earth(g, cx, cy, R, t * 0.6);
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); for (const la of [-60, -30, 0, 30, 60]) { const y = cy - R * Math.sin(la * Math.PI / 180), rx = R * Math.cos(la * Math.PI / 180); g.strokeStyle = alpha('#ffffff', la ? 0.25 : 0.6); g.lineWidth = la ? 2 : 4; g.beginPath(); g.ellipse(cx, y, rx, rx * 0.12, 0, 0, Math.PI); g.stroke(); } g.restore();
    seg(g, [[cx, cy - R - 60], [cx, cy + R + 60]], 3, alpha(c, 0.5)); const rk = (t * 0.6) % (Math.PI * 2); g.save(); g.strokeStyle = gold; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy - R - 30, 60, 14, 0, 0.2, Math.PI * 1.6); g.stroke(); g.restore(); Lb(g, 'ВРАЩЕНИЕ', cx + 140, cy - R - 30, 28, gold);
    const max = v.max || 1700; (v.marks || []).forEach(([lab, la, sp, col], i) => { const a = fadeIn(t, 0.4 + i * (v.step ?? 0.7)); if (a <= 0) return; const r = la * Math.PI / 180, x = cx + R * Math.cos(r) * 0.62, y = cy - R * Math.sin(r);
      g.save(); g.globalAlpha *= a; circle(g, x, y, 14, col || gold); const L = 40 + (sp / max) * 640 * ease.out(prog(t, 0.4 + i * (v.step ?? 0.7), 1.2 + i * (v.step ?? 0.7))); arrow(g, x + 20, y, x + 20 + L, y, 10, col || gold, 26);
      Lb(g, lab, x + 40 + L + 20, y - 26, 34, c, 1, 'left'); Lb(g, `${sp.toLocaleString('ru-RU').replace(/ /g, ' ')} КМ/Ч`, x + 40 + L + 20, y + 22, 40, col || gold, 1, 'left'); g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 42, gold, fadeIn(t, 1.4));
  },
  galileo(g, t, v) { // каюта корабля: мяч падает так же, вода льётся так же
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ГАЛИЛЕЙ · ≈400 ЛЕТ НАЗАД', E.H * 0.11, 56);
    const sx = E.W * 0.5 + Math.sin(t * 0.5) * 20, sy = E.H * 0.7, bob = Math.sin(t * 1.6) * 4;
    g.save(); g.translate(0, bob); poly(g, [[sx - 560, sy - 40], [sx + 560, sy - 40], [sx + 460, sy + 120], [sx - 460, sy + 120]], alpha(c, 0.25)); seg(g, [[sx - 560, sy - 40], [sx + 560, sy - 40], [sx + 460, sy + 120], [sx - 460, sy + 120], [sx - 560, sy - 40]], 5, c);
    rr(g, sx - 300, sy - 420, 600, 380, 10); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = c; g.lineWidth = 5; g.stroke(); Lb(g, 'КАЮТА', sx, sy - 390, 28, c);
    const fk = (t * 0.7) % 1, by = lerp(sy - 330, sy - 80, ease.in(fk)); seg(g, [[sx - 140, sy - 340], [sx - 140, sy - 60]], 2, alpha(gold, 0.35)); circle(g, sx - 140, by, 26, gold);
    rr(g, sx + 90, sy - 330, 60, 70, 8); g.fillStyle = '#8fd0ff'; g.fill(); seg(g, [[sx + 120, sy - 260], [sx + 120, sy - 120]], 8, '#8fd0ff'); rr(g, sx + 80, sy - 120, 80, 60, 6); g.strokeStyle = '#8fd0ff'; g.lineWidth = 5; g.stroke();
    g.restore();
    for (let i = 0; i < 8; i++) { const x = ((i * 300 - t * 120) % (E.W + 300)) + E.W + 150; seg(g, [[x - E.W - 300, sy + 140 + (i % 2) * 20], [x - E.W - 180, sy + 140 + (i % 2) * 20]], 4, alpha('#8fd0ff', 0.6)); }
    arrow(g, E.W * 0.12, sy + 210, E.W * 0.3, sy + 210, 8, gold, 24); Lb(g, 'КОРАБЛЬ ПЛЫВЁТ', E.W * 0.21, sy + 260, 30, gold);
    if (v.sub) Lb(g, v.sub, E.W * 0.7, E.H * 0.93, 40, gold, fadeIn(t, 1));
  },
  horizon(g, t, v) { // горизонт: рост 1,7 м → 5 км; крыша 16 этажей → 25 км; Останкино → 65 км
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ДО ГОРИЗОНТА', E.H * 0.11, 58);
    const Rc = 2600, ccx = E.W * 0.5, ccy = E.H * 0.82 + Rc; g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.arc(ccx, ccy, Rc, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42); g.stroke();
    const ox = E.W * 0.12, surfY = (x) => ccy - Math.sqrt(Rc * Rc - (x - ccx) ** 2);
    const S3 = [['РОСТ 1,7 М', 0, 5, 'man'], ['КРЫША 16 ЭТАЖЕЙ', 120, 25, 'house'], ['ОСТАНКИНСКАЯ БАШНЯ', 300, 65, 'tower']]; const n = v.only ?? 3;
    S3.slice(0, n).forEach(([lab, hgt, km, kind], i) => { const cur = i === n - 1, a = cur ? fadeIn(t, 0.3) : 1; if (a <= 0) return; const x0 = ox, y0 = surfY(x0), eyeY = y0 - 110 - hgt * 1.4, hx = x0 + 260 + km * 16, hy = surfY(hx);
      g.save(); g.globalAlpha *= cur ? a : a * 0.35;
      if (kind === 'man') who(g, 'artem', x0, y0, 0.85, { e: 'smile' }); if (kind === 'house') { rr(g, x0 - 50, eyeY, 100, y0 - eyeY, 4); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); } if (kind === 'tower') { poly(g, [[x0 - 30, y0], [x0 - 6, eyeY], [x0 + 6, eyeY], [x0 + 30, y0]], alpha(c, 0.5)); seg(g, [[x0, eyeY], [x0, eyeY - 60]], 4, c); }
      circle(g, x0, eyeY, 9, gold); g.setLineDash([14, 10]); seg(g, [[x0, eyeY], [hx, hy]], 4, gold); g.setLineDash([]); circle(g, hx, hy, 12, gold);
      if (cur) { pill(g, hx + 10, hy - 80, `≈ ${km} КМ`, gold, 50); Lb(g, lab, x0 + 40, eyeY - 60, 38, c, 1, 'left'); } g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.94, 42, gold, fadeIn(t, 1.4));
  },
  hops(g, t, v) { // цепочка прыжков по знакомым точкам: nodes [label], step, title, sub, done
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; if (v.title) T(g, v.title, E.H * 0.12, 56);
    const N = v.nodes || [], n = N.length, step = v.step ?? 0.6, P = N.map((_, i) => [E.W * (0.1 + 0.8 * (n > 1 ? i / (n - 1) : 0.5)), E.H * (0.56 + Math.sin(i * 1.3) * 0.1)]);
    g.save(); g.setLineDash([12, 12]); seg(g, P, 5, alpha(c, 0.5)); g.restore();
    const cur = v.done ? n - 1 : Math.min(n - 1, Math.floor(Math.max(0, t - 0.3) / step));
    N.forEach((lab, i) => { const [x, y] = P[i], on = i <= cur; circle(g, x, y, on ? 20 : 14, on ? gold : alpha(c, 0.5)); const sz = fit(g, lab, 300, 36, 900); Lb(g, lab, x, y + (i % 2 ? -64 : 64), sz, on ? c : alpha(c, 0.45));
      const dt = t - 0.3 - i * step; if (!v.done && dt > 0 && dt < 0.5) { ring(g, x, y, 20 + dt * 160, 5, alpha('#ffffff', 1 - dt * 2)); Lb(g, v.word || 'ХЛОП', x + 30, y - 110, 40, '#ffd84a', 1 - dt * 2); } });
    { const [x, y] = P[cur]; glow(g, x, y, 90, OR, 0.5); circle(g, x, y, 14, OR); }
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.9, 44, gold, fadeIn(t, v.subAt ?? 1));
  },
  border(g, t, v) { // одна, зато очень большая страна: за границу — нельзя
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ТВОЯ КАРТА МИРА', E.H * 0.11, 58);
    const P = [[0.1, 0.52], [0.16, 0.36], [0.3, 0.3], [0.42, 0.24], [0.6, 0.22], [0.78, 0.2], [0.9, 0.28], [0.92, 0.42], [0.84, 0.5], [0.78, 0.64], [0.6, 0.66], [0.44, 0.7], [0.3, 0.72], [0.18, 0.66]].map(([x, y]) => [E.W * x, E.H * y]);
    poly(g, P, alpha(c, 0.12)); g.save(); g.setLineDash([16, 12]); seg(g, [...P, P[0]], 5, c); g.restore();
    for (let i = 0; i < 26; i++) { const x = E.W * (0.2 + ((i * 37) % 60) / 100), y = E.H * (0.34 + ((i * 53) % 30) / 100), a = fadeIn(t, 0.2 + (i % 9) * 0.08); g.save(); g.globalAlpha *= a; circle(g, x, y, 8, gold); glow(g, x, y, 30, gold, 0.3); g.restore(); }
    const ak = ease.out(prog(t, 1.0, 1.8)), ax = E.W * 0.1, ay = E.H * 0.6; arrow(g, ax + 140, ay, lerp(ax + 140, ax - 60, ak), ay + 40 * ak, 8, '#ff7a6a', 24); bigX(g, ax + 10, ay + 40, 50, fadeIn(t, 1.8));
    Lb(g, v.sub || 'ЗА ГРАНИЦУ — ТОЛЬКО С ПАСПОРТНЫМ КОНТРОЛЕМ', E.W / 2, E.H * 0.88, 42, gold, fadeIn(t, 1.2));
  },
  points(g, t, v) { // город распался на отдельные точки
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; if (v.title) T(g, v.title, E.H * 0.11, 56);
    const fade = 1 - ease.inOut(prog(t, v.fadeAt ?? 1.0, (v.fadeAt ?? 1.0) + 1.6));
    g.save(); g.globalAlpha = 0.15 + 0.6 * fade; for (let i = 0; i < 9; i++) { seg(g, [[E.W * 0.08, E.H * (0.22 + i * 0.08)], [E.W * 0.92, E.H * (0.24 + i * 0.075)]], 4, c); seg(g, [[E.W * (0.1 + i * 0.1), E.H * 0.2], [E.W * (0.12 + i * 0.095), E.H * 0.88]], 4, c); } g.restore();
    const L = v.labels || [['ДОМ', 0.24, 0.62], ['РАБОТА', 0.46, 0.34], ['АЭРОПОРТ', 0.78, 0.3], ['ПЛЯЖ', 0.74, 0.74], ['ДЕРЕВНЯ', 0.32, 0.8]];
    L.forEach(([s, x, y], i) => { const a = fadeIn(t, 0.2 + i * 0.25); g.save(); g.globalAlpha *= a; glow(g, E.W * x, E.H * y, 80, gold, 0.45); circle(g, E.W * x, E.H * y, 18, gold); Lb(g, s, E.W * x, E.H * y - 50, 36, '#fff1dc'); g.restore(); });
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.95, 42, gold, fadeIn(t, 1.6));
  },
  hippo(g, t, v) { // гиппокамп: память о пространстве (у таксистов — больше)
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ГИППОКАМП', E.H * 0.11, 58);
    const cx = E.W * 0.42, cy = E.H * 0.54; g.save(); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, 420, 290, 0, 0, 7); g.stroke();
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx - 300 + i * 120, cy - 120 + (i % 2) * 40, 80, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); } g.beginPath(); g.ellipse(cx + 160, cy + 290, 70, 110, 0.3, 0, Math.PI); g.stroke(); g.restore();
    const big = v.big ? 1 + 0.35 * ease.out(prog(t, 0.8, 1.8)) : 1, pul = 0.5 + 0.2 * Math.sin(t * 5); g.save(); g.translate(cx + 40, cy + 70); g.scale(big, big); g.fillStyle = alpha(gold, 0.8);
    g.beginPath(); g.moveTo(-150, 0); g.bezierCurveTo(-120, -60, 20, -70, 90, -20); g.bezierCurveTo(130, 10, 120, 70, 70, 60); g.bezierCurveTo(30, 50, 40, 10, 0, 0); g.bezierCurveTo(-40, -10, -100, 20, -150, 0); g.fill(); g.restore(); glow(g, cx + 40, cy + 60, 220 * big, gold, pul * 0.5);
    seg(g, [[cx + 140, cy + 60], [E.W * 0.7, cy - 40]], 4, gold); Lb(g, v.label || 'ПАМЯТЬ О ПРОСТРАНСТВЕ', E.W * 0.71, cy - 40, 38, gold, fadeIn(t, 0.6), 'left');
    if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.92, 42, c, fadeIn(t, 1.2));
  },
  heart(g, t, v) { // время — это мышца: клетки сердца гаснут с каждой минутой
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold; T(g, v.title || 'ВРЕМЯ — ЭТО МЫШЦА', E.H * 0.11, 58);
    const cx = E.W * 0.4, cy = E.H * 0.55, s = 3.6, beat = 1 + 0.04 * Math.max(0, Math.sin(t * 7)); g.save(); g.translate(cx, cy); g.scale(s * beat, s * beat);
    g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(-90, -10, -60, -90, 0, -50); g.bezierCurveTo(60, -90, 90, -10, 0, 40); g.closePath(); g.save(); g.clip();
    const dead = ease.inOut(prog(t, v.from ?? 0.6, (v.from ?? 0.6) + (v.dur ?? 3))) * (v.max ?? 0.45); for (let i = 0; i < 18; i++) for (let j = 0; j < 14; j++) { const x = -90 + i * 10, y = -90 + j * 10, h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453, d = (h - Math.floor(h)) * 0.999 < dead; g.fillStyle = d ? '#5a5a66' : '#d8384a'; g.fillRect(x, y, 9, 9); }
    g.restore(); g.restore(); const m = Math.floor(lerp(0, v.min ?? 40, ease.inOut(prog(t, v.from ?? 0.6, (v.from ?? 0.6) + (v.dur ?? 3)))));
    Lb(g, `${m} МИН`, E.W * 0.76, cy - 40, 110, '#ff7a6a'); Lb(g, 'БЕЗ ПОМОЩИ', E.W * 0.76, cy + 50, 40, c); if (v.sub) Lb(g, v.sub, E.W / 2, E.H * 0.92, 42, gold, fadeIn(t, 1.2));
  },
};
