// lib/bp.js — схемы «чертёж» (тёмно-синяя сетка, светло-голубые линии, золотые акценты). Все подписи вписаны в свои рамки.
import { E, V, S, clamp, lerp, ease, prog, key, alpha, seg, circle, ring, rr, poly, glow, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { OBJ, fitText, power } from './objs.js';
import { POWER } from '../cast.js';

const C = () => S().ui.blueprint, GOLD = () => S().ui.gold, RED = () => S().ui.accent, CREAM = () => S().ui.cream;
const fade = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
// подпись в рамке-плашке, всегда внутри своей ширины
function tag(g, str, x, y, w, h, color, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; rr(g, x - w / 2, y - h / 2, w, h, 12); g.strokeStyle = alpha(color, 0.8); g.lineWidth = 2.5; g.stroke(); g.fillStyle = 'rgba(8,14,30,.6)'; g.fill(); fitText(g, str, x, y, w - 20, h - 12, { color }); g.restore(); }
function arrow(g, x1, y1, x2, y2, k, col, w = 4) { const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); seg(g, [[x1, y1], [ex, ey]], w, col); if (k > 0.95) { const a = Math.atan2(y2 - y1, x2 - x1); poly(g, [[x2, y2], [x2 - Math.cos(a - 0.45) * 22, y2 - Math.sin(a - 0.45) * 22], [x2 - Math.cos(a + 0.45) * 22, y2 - Math.sin(a + 0.45) * 22]], col); } }
function dashed(g, pts, col, w = 3, dash = [14, 12], off = 0) { g.save(); g.setLineDash(dash); g.lineDashOffset = off; seg(g, pts, w, col); g.restore(); }
// голова в профиль с мозгом; region = 0..1 размер подсвеченного участка
function head(g, x, y, r, o = {}) {
  const c = C(); g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r, Math.PI * 0.9, Math.PI * 2.35); g.stroke();
  seg(g, [[x + r * Math.cos(Math.PI * 2.35), y + r * Math.sin(Math.PI * 2.35)], [x + r * 0.55, y + r * 1.25], [x - r * 0.2, y + r * 1.3]], 5, c);
  g.beginPath(); g.ellipse(x - r * 0.05, y - r * 0.12, r * 0.66, r * 0.5, 0, 0, 7); g.fillStyle = alpha(c, 0.12); g.fill(); g.strokeStyle = alpha(c, 0.9); g.lineWidth = 3; g.stroke();
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - r * 0.45 + i * r * 0.18, y - r * 0.12 + Math.sin(i * 1.7) * r * 0.12, r * 0.12, 0.3, 2.6); g.stroke(); }
  if (o.region) { const k = o.region; glow(g, x + r * 0.25, y - r * 0.05, r * 0.6 * k + 6, GOLD(), 0.65); circle(g, x + r * 0.25, y - r * 0.05, r * 0.24 * k, alpha(GOLD(), 0.75)); }
  if (o.eat) glow(g, x - r * 0.05, y - r * 0.12, r * 1.0, RED(), 0.4 * o.eat);
}

export const BP = {
  // «Ты двигаешь предметы взглядом и мыслью. Всё, что видишь.»
  rules(g, t, info) {
    const y = E.H * 0.56, ex = E.W * 0.2, bx = E.W * 0.48, ox = E.W * 0.8;
    UI.lineFigure(g, { x: ex, y: y + 160, s: 1.2, color: '#e8f0ff' }); head(g, bx, y - 40, 110, {});
    // глаз
    const eyA = fade(t, 0.1); g.save(); g.globalAlpha *= eyA; g.strokeStyle = GOLD(); g.lineWidth = 4; g.beginPath(); g.ellipse(ex + 40, y - 120, 30, 18, 0, 0, 7); g.stroke(); circle(g, ex + 44, y - 120, 9, GOLD()); g.restore();
    arrow(g, ex + 80, y - 120, bx - 130, y - 60, ease.inOut(prog(t, 0.4, 1.0)), GOLD());
    arrow(g, bx + 130, y - 60, ox - 80, y - 60, ease.inOut(prog(t, 1.0, 1.6)), POWER);
    const lift = ease.inOut(prog(t, 1.5, 2.4)); OBJ.mug(g, ox, y + 60 - lift * 90, 2.2, { color: '#8fb8e8' }); if (lift > 0) power(g, ox, y - lift * 90, 120, t, lift, 2);
    tag(g, 'ВЗГЛЯД', ex + 40, y - 220, 220, 60, GOLD(), fade(t, 0.3)); tag(g, 'МЫСЛЬ', bx, y - 230, 220, 60, '#cfb8ff', fade(t, 0.9));
    // «всё, что видишь» — конус взгляда
    const k = fade(t, info.cone ?? 2.4, 0.6); if (k > 0) { g.save(); g.globalAlpha *= k * 0.25; poly(g, [[ex + 70, y - 120], [E.W * 1.0, y - 420], [E.W * 1.0, y + 260]], GOLD()); g.restore(); tag(g, 'ВСЁ, ЧТО ВИДИШЬ', E.W * 0.78, y - 300, 420, 64, GOLD(), k); }
  },
  // «Чем тяжелее вещь, тем труднее»: шкала усилия
  weight(g, t, info) {
    const x0 = E.W * 0.15, x1 = E.W * 0.85, y = E.H * 0.62, k = ease.inOut(prog(t, 0.2, 1.8));
    rr(g, x0, y - 18, x1 - x0, 36, 18); g.strokeStyle = C(); g.lineWidth = 3; g.stroke();
    g.save(); g.beginPath(); rr(g, x0, y - 18, (x1 - x0) * k, 36, 18); g.clip(); g.fillStyle = g.createLinearGradient(x0, 0, x1, 0); const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#5fd39a'); gr.addColorStop(0.6, GOLD()); gr.addColorStop(1, RED()); g.fillStyle = gr; g.fillRect(x0, y - 18, x1 - x0, 36); g.restore();
    const items = [['spoon', 0.03], ['mug', 0.25], ['box', 0.5], ['washer', 0.72], ['car', 0.97]];
    items.forEach(([o, u], i) => { const a = fade(t, 0.2 + u * 1.6); if (a <= 0) return; g.save(); g.globalAlpha *= a; const x = lerp(x0, x1, u); const sc = [1.4, 2.2, 1.2, 1.1, 0.45][i]; OBJ[o](g, x, y - 60, sc, { color: '#8fb8e8', bend: 0 }); g.restore(); });
    tag(g, 'ЛЕГКО', x0 + 90, y + 80, 200, 56, '#5fd39a', fade(t, 0.3)); tag(g, 'ТРУДНО', x1 - 90, y + 80, 200, 56, RED(), fade(t, 1.6));
  },
  // «Ложку легко, машину на пределе сил»
  spooncar(g, t, info) {
    const y1 = E.H * 0.4, y2 = E.H * 0.66, x0 = E.W * 0.36, w = E.W * 0.5;
    OBJ.spoon(g, E.W * 0.2, y1 + 50, 1.6, {}); OBJ.car(g, E.W * 0.2, y2 + 60, 0.55, { color: '#5c7a4a' });
    const a = ease.out(prog(t, 0.2, 0.9)), b = ease.out(prog(t, 1.3, 2.3));
    for (const [yy, v, col] of [[y1, 0.06 * a, '#5fd39a'], [y2, 0.99 * b, RED()]]) { rr(g, x0, yy - 20, w, 40, 20); g.fillStyle = alpha(C(), 0.15); g.fill(); rr(g, x0, yy - 20, Math.max(40, w * v), 40, 20); g.fillStyle = col; g.fill(); }
    tag(g, 'ЛЕГКО', x0 + w * 0.12 + 140, y1 - 70, 200, 54, '#5fd39a', a); tag(g, 'НА ПРЕДЕЛЕ', x0 + w - 150, y2 - 70, 280, 54, RED(), b);
    if (b > 0.9) glow(g, x0 + w, y2, 80, RED(), 0.6 * (0.6 + 0.4 * Math.sin(t * 10)));
  },
  // «Мозг — самый прожорливый орган»
  brain(g, t, info) {
    const x = E.W * 0.5, y = E.H * 0.5; UI.lineFigure(g, { x: x - 420, y: y + 300, s: 1.5, color: alpha('#e8f0ff', 0.4) });
    head(g, x, y - 20, 200, { eat: 0.5 + 0.5 * Math.sin(t * 3) });
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t * 0.4, R = 330 - ((t * 120 + i * 40) % 200); circle(g, x + Math.cos(a) * R, y - 20 + Math.sin(a) * R * 0.7, 8, alpha(GOLD(), 0.8)); }
    tag(g, 'САМЫЙ ПРОЖОРЛИВЫЙ ОРГАН', x, y + 300, 760, 70, GOLD(), fade(t, info.lbl ?? 1.2));
  },
  // «2% массы тела … пятая часть энергии»
  mass(g, t, info) {
    const ui = S().ui; const x = E.W * 0.3, y = E.H * 0.82;
    UI.lineFigure(g, { x, y, s: 2.4, color: '#e8f0ff' }); glow(g, x + 7, y - 500, 80, GOLD(), 0.8); circle(g, x + 7, y - 500, 30, alpha(GOLD(), 0.8));
    const sp = info.split ?? 99, k1 = ease.out(prog(t, 0.3, 1.4)), k2 = ease.out(prog(t, sp + 0.2, sp + 1.6));
    const bx = E.W * 0.5, bw = E.W * 0.4;
    text(g, 'МАССА МОЗГА', bx, E.H * 0.34, { size: V(34, 40), font: FONTS.ui, weight: 900, color: ui.cream, align: 'left' });
    rr(g, bx, E.H * 0.38, bw, 46, 23); g.fillStyle = alpha(C(), 0.15); g.fill(); rr(g, bx, E.H * 0.38, Math.max(30, bw * 0.02 * k1 * 5), 46, 23); g.fillStyle = C(); g.fill();
    text(g, Math.round(2 * k1) + ' %', bx + bw, E.H * 0.34, { size: V(56, 60), font: FONTS.ui, weight: 900, color: C(), align: 'right' });
    if (t > sp) { text(g, 'ЭНЕРГИЯ', bx, E.H * 0.56, { size: V(34, 40), font: FONTS.ui, weight: 900, color: ui.cream, align: 'left', alpha: fade(t, sp) }); rr(g, bx, E.H * 0.6, bw, 46, 23); g.fillStyle = alpha(GOLD(), 0.15); g.fill(); rr(g, bx, E.H * 0.6, Math.max(30, bw * 0.2 * k2), 46, 23); g.fillStyle = GOLD(); g.fill(); text(g, Math.round(20 * k2) + ' %', bx + bw, E.H * 0.56, { size: V(56, 60), font: FONTS.ui, weight: 900, color: GOLD(), align: 'right', alpha: fade(t, sp) }); tag(g, '≈ ПЯТАЯ ЧАСТЬ', bx + bw * 0.5, E.H * 0.74, 420, 64, GOLD(), fade(t, sp + 1)); }
  },
  // жонглёры: участок мозга растёт / уменьшается. info.reg = [[t, k], ...]
  juggle(g, t, info) {
    const x = E.W * (info.solo ? 0.5 : 0.62), y = E.H * 0.5; const reg = info.reg ? key(t, info.reg) : 0.4;
    head(g, x, y, 230, { region: reg });
    if (!info.solo) { for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.09; circle(g, E.W * 0.2 + Math.cos(a) * 70, E.H * 0.4 + Math.sin(a) * 40 - 40, 16, ['#cfe34a', '#ff8a5a', '#8fb8e8'][i]); } UI.lineFigure(g, { x: E.W * 0.2, y: E.H * 0.8, s: 1.4, pose: POSES.cheer, color: '#e8f0ff' }); }
    if (info.lbl) tag(g, info.lbl, x, y + 330, 620, 70, GOLD(), fade(t, info.lblAt ?? 0.6));
    if (info.arrow) { const up = info.arrow === 'up'; const k = ease.out(prog(t, 0.6, 1.4)); poly(g, up ? [[x + 300, y - 40 - 60 * k], [x + 340, y + 10 - 60 * k], [x + 260, y + 10 - 60 * k]] : [[x + 300, y + 60 + 60 * k], [x + 340, y + 10 + 60 * k], [x + 260, y + 10 + 60 * k]], up ? '#5fd39a' : RED()); }
  },
  // траектория по дуге
  arc(g, t, info) {
    const k = ease.inOut(prog(t, 0.2, 2.6)), x0 = E.W * 0.12, x1 = E.W * 0.88, y0 = E.H * 0.7;
    const pt = (u) => [lerp(x0, x1, u), y0 - Math.sin(u * Math.PI) * 260 - u * 60];
    dashed(g, [pt(0), pt(0.5 * 0.5), pt(0.5), pt(0.75), pt(1)].map((p, i, a) => p), alpha(C(), 0.25), 3);
    const pts = []; for (let i = 0; i <= 60; i++) { const u = (i / 60) * k; const p = pt(u); pts.push([p[0], p[1] + Math.sin(u * Math.PI) * 120 * u]); } if (pts.length > 1) seg(g, pts, 5, GOLD());
    const p = pts[pts.length - 1]; OBJ.soccer(g, p[0], p[1] + 16, 2.2, { rot: t * 6 });
  },
  // эффект Магнуса: info.stage = 1 (вращение и поток), 2 (давление и сила), 3 (название)
  magnus(g, t, info) {
    const x = E.W * 0.5, y = E.H * 0.5, R = 130, st = info.stage || 1;
    for (let i = -4; i <= 4; i++) { const yy = y + i * 55; const bend = i < 0 ? -1 : 1; const pts = []; for (let k2 = 0; k2 <= 40; k2++) { const u = k2 / 40, xx = E.W * 0.08 + u * E.W * 0.84; const d = Math.abs(xx - x), infl = Math.exp(-(d * d) / (2 * 200 * 200)); pts.push([xx, yy + infl * bend * (Math.abs(i) < 3 ? 60 : 20) * (1 / Math.max(1, Math.abs(i)))]); } dashed(g, pts, alpha(C(), i < 0 && st >= 2 ? 0.9 : 0.45), i < 0 && st >= 2 ? 4 : 2.5, [18, 14], -t * 120); }
    circle(g, x, y, R, '#0b1324'); ring(g, x, y, R, 6, '#e8f0ff'); g.save(); g.translate(x, y); g.rotate(t * 3); for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); seg(g, [[R * 0.3, 0], [R * 0.85, 0]], 4, alpha('#e8f0ff', 0.7)); } g.restore();
    g.strokeStyle = GOLD(); g.lineWidth = 6; g.beginPath(); g.arc(x, y, R + 34, -2.4, -0.7); g.stroke(); poly(g, [[x + (R + 34) * Math.cos(-0.7) + 6, y + (R + 34) * Math.sin(-0.7) + 18], [x + (R + 34) * Math.cos(-0.7) + 26, y + (R + 34) * Math.sin(-0.7) - 12], [x + (R + 34) * Math.cos(-0.7) - 12, y + (R + 34) * Math.sin(-0.7) - 10]], GOLD());
    arrow(g, E.W * 0.12, y - 330, E.W * 0.3, y - 330, 1, alpha(C(), 0.9)); tag(g, 'ВОЗДУХ', E.W * 0.2, y - 400, 230, 56, C(), 1);
    if (st === 1) { tag(g, 'НАВСТРЕЧУ ВОЗДУХУ', x - 330, y + R + 110, 480, 62, CREAM(), fade(t, 0.8)); tag(g, 'ПО ХОДУ', x + 330, y - R - 110, 300, 62, CREAM(), fade(t, 2.2)); }
    if (st >= 2) { tag(g, '+', x, y + R + 120, 110, 80, RED(), fade(t, 0.2)); tag(g, '−', x, y - R - 120, 110, 80, '#5fd39a', fade(t, 1.4)); const k = ease.out(prog(t, 2.6, 3.6)); if (k > 0) arrow(g, x, y - R - 20, x, y - R - 20 - 180 * k, k, GOLD(), 10); }
  },
  // мышцы «разбираются»: info.k = [[t, 0..1]] размер мышцы
  muscle(g, t, info) {
    const x = E.W * 0.42, y = E.H * 0.6, k = info.k ? key(t, info.k) : 1;
    seg(g, [[x - 360, y + 40], [x, y], [x + 120, y - 300]], 46, alpha('#e8f0ff', 0.12)); seg(g, [[x - 360, y + 40], [x, y], [x + 120, y - 300]], 6, '#e8f0ff');
    g.fillStyle = alpha(RED(), 0.55); g.beginPath(); g.ellipse(x - 180, y - 10 - 30 * k, 150, 20 + 70 * k, -0.1, 0, 7); g.fill(); g.strokeStyle = RED(); g.lineWidth = 3; g.stroke();
    tag(g, 'МЫШЦА', x - 180, y - 200, 220, 56, RED(), 1);
    if (info.lbl) tag(g, info.lbl, E.W * 0.75, E.H * 0.3, 520, 70, GOLD(), fade(t, info.lblAt ?? 1));
    if (info.counter) UI.readout(g, { label: 'МЫШЕЧНАЯ МАССА', value: Math.round(lerp(100, 80, ease.inOut(prog(t, info.counter, info.counter + 2)))) + ' %', x: E.W * 0.62, y: E.H * 0.6, color: RED(), size: V(70, 70) });
  },
  // нейроимплант: голова с датчиком -> сигналы -> компьютер -> робо-рука
  bci(g, t, info) {
    const hx = E.W * 0.18, hy = E.H * 0.48; head(g, hx, hy, 150, {}); rr(g, hx + 20, hy - 90, 40, 24, 5); g.fillStyle = GOLD(); g.fill(); glow(g, hx + 40, hy - 78, 60, GOLD(), 0.6);
    tag(g, 'ДАТЧИК', hx + 40, hy - 230, 220, 56, GOLD(), fade(t, 0.3));
    const s1 = ease.inOut(prog(t, 0.8, 2.0)); for (let i = 0; i < 6; i++) { const u = ((t * 0.8 + i / 6) % 1) * s1; const px = lerp(hx + 70, E.W * 0.5 - 140, u); g.strokeStyle = alpha(GOLD(), 1 - u); g.lineWidth = 3; g.beginPath(); for (let k2 = 0; k2 < 12; k2++) g.lineTo(px + k2 * 4, hy - 78 + Math.sin(k2 * 1.2 + t * 10) * 10); g.stroke(); }
    tag(g, 'СИГНАЛЫ НЕЙРОНОВ', E.W * 0.34, hy + 40, 380, 56, CREAM(), fade(t, 1.2));
    const ck = fade(t, info.comp ?? 2.4); if (ck > 0) { g.save(); g.globalAlpha *= ck; rr(g, E.W * 0.5 - 130, hy - 170, 260, 170, 10); g.strokeStyle = C(); g.lineWidth = 4; g.stroke(); seg(g, [[E.W * 0.5, hy], [E.W * 0.5, hy + 50]], 6, C()); seg(g, [[E.W * 0.5 - 60, hy + 50], [E.W * 0.5 + 60, hy + 50]], 6, C()); g.restore(); tag(g, 'КОМПЬЮТЕР', E.W * 0.5, hy - 230, 280, 56, C(), ck); arrow(g, E.W * 0.5 + 150, hy - 80, E.W * 0.68, hy - 80, ease.inOut(prog(t, (info.comp ?? 2.4) + 0.4, (info.comp ?? 2.4) + 1.0)), POWER); }
    const rk = fade(t, (info.comp ?? 2.4) + 0.9); if (rk > 0) { g.save(); g.globalAlpha *= rk; OBJ.robotArm(g, E.W * 0.82, hy + 140, 1.6, { a: 0.5 + 0.5 * Math.sin(t * 1.5), reachX: -100, reachY: -160 }); g.restore(); tag(g, 'ДВИЖЕНИЕ', E.W * 0.82, hy + 220, 260, 56, '#5fd39a', rk); }
  },
  // хорошие и плохие мысли -> одна и та же сила
  thoughts(g, t, info) {
    const x = E.W * 0.3, y = E.H * 0.5; head(g, x, y, 170, {});
    tag(g, 'ХОРОШАЯ МЫСЛЬ', x - 40, y - 300, 380, 62, '#5fd39a', fade(t, 0.3)); tag(g, 'ПЛОХАЯ МЫСЛЬ', x - 40, y + 300, 380, 62, RED(), fade(t, 1.4));
    arrow(g, x + 180, y - 40, E.W * 0.7, y - 40, ease.inOut(prog(t, 0.6, 1.4)), '#5fd39a'); arrow(g, x + 180, y + 40, E.W * 0.7, y + 40, ease.inOut(prog(t, 1.7, 2.5)), RED());
    const k = fade(t, 0.9); power(g, E.W * 0.8, y, 160, t, k, 5); tag(g, 'СИЛА', E.W * 0.8, y, 200, 70, '#cfb8ff', k);
  },
  // руки и голова
  headarms(g, t, info) {
    const x = E.W * 0.5, y = E.H * 0.86, sp = info.split ?? 2;
    UI.lineFigure(g, { x, y, s: 2.6, pose: POSES.explain, color: '#e8f0ff' });
    const a1 = fade(t, 0.2) * (1 - 0.5 * fade(t, sp)), a2 = fade(t, sp);
    glow(g, x + 100, y - 380, 140, GOLD(), 0.6 * a1); glow(g, x + 13, y - 540, 160, POWER, 0.8 * a2);
    tag(g, 'РУКИ', x + 420, y - 380, 260, 64, GOLD(), a1 + 0.3 * a2); tag(g, 'ГОЛОВА', x - 420, y - 560, 280, 64, '#cfb8ff', a2);
  },
  // сила забирает то, чего ты не делаешь
  takes(g, t, info) {
    const x = E.W * 0.3, y = E.H * 0.82; UI.lineFigure(g, { x, y, s: 2.2, pose: POSES.relaxed, color: '#e8f0ff' }); power(g, x, y - 260, 220, t, 0.8, 9);
    const items = info.items || ['МЫШЦЫ', 'НАВЫК', 'ПРИВЫЧКИ'], ats = info.ats || [0.3, 1.5, 2.7];
    items.forEach((s, i) => { const a = fade(t, ats[i]); const gone = info.fadeOut ? 1 - 0.75 * ease.inOut(prog(t, ats[i] + 0.9, ats[i] + 1.8)) : 1; tag(g, s, E.W * 0.68, E.H * (0.3 + i * 0.18), 440, 72, i === 0 ? RED() : i === 1 ? GOLD() : CREAM(), a * gone); });
  },
  // домкрат: опасно / страховочные подставки
  safety(g, t, info) {
    const x = E.W * 0.5, y = E.H * 0.72, ok = info.ok;
    OBJ.car(g, x, y - (ok ? 70 : 60), 1.2, { color: '#3a5a7a' });
    if (ok) { OBJ.stand(g, x - 160, y, 1.4, {}); OBJ.stand(g, x + 160, y, 1.4, {}); OBJ.jack(g, x, y, 1.2, { isNew: true, h: 40 }); OBJ.check(g, x + 520, y - 300, 2, { k: fade(t, 0.6) }); tag(g, 'СТРАХОВОЧНЫЕ ПОДСТАВКИ', x, y + 110, 640, 66, '#5fd39a', fade(t, 0.3)); }
    else { OBJ.jack(g, x, y, 1.3, { h: 40 }); g.save(); g.translate(x - 110, y - 22); g.rotate(Math.PI / 2); UI.lineFigure(g, { x: 0, y: 0, s: 0.9, pose: POSES.stand, color: alpha('#e8f0ff', 0.8) }); g.restore(); OBJ.cross(g, x + 520, y - 300, 1.5, { k: fade(t, info.crossAt ?? 0.8) }); tag(g, 'ТОЛЬКО ДОМКРАТ — ОПАСНО', x, y + 110, 640, 66, RED(), fade(t, info.crossAt ?? 0.8)); }
  },
  // данные НАСА: мышцы астронавтов
  astro(g, t, info) { UI.dataCard(g, t, { title: 'АСТРОНАВТЫ', subtitle: 'ПОЛЁТ 1–2 НЕДЕЛИ', from: 100, to: 80, decimals: 0, unit: '%', start: info.start ?? 0.8, dur: 2.2, labels: [[0, '100%'], [1, '−20%']], shape: 0.6, arrow: true, total: info.dur }); },
  // 3 значка: пульт, чай, носки
  icons(g, t, info) {
    const list = info.items || [['remote', 'ПУЛЬТ'], ['cup', 'ЧАЙ'], ['socks', 'НОСКИ']], ats = info.ats || [0.3, 1.2, 2.0];
    list.forEach(([o, lbl], i) => { const a = ease.outBack(prog(t, ats[i], ats[i] + 0.4)); if (a <= 0) return; const x = E.W * (0.25 + i * 0.25), y = E.H * 0.5; g.save(); g.translate(x, y); g.scale(a, a); g.translate(-x, -y); circle(g, x, y, 130, alpha(C(), 0.12)); ring(g, x, y, 130, 3, C()); OBJ[o](g, x, y + 40, 2.4, { rot: 0, steam: true, t }); g.restore(); tag(g, lbl, x, y + 200, 240, 60, GOLD(), a); });
    if (info.top) tag(g, info.top, E.W / 2, E.H * 0.17, 760, 72, RED(), fade(t, 0.1));
  },
};
