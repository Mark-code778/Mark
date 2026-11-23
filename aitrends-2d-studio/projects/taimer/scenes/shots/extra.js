// shots/extra.js — вставки и схемы «Машины времени»: радио с датами, бензин, рычаг, переписка,
// галерея с пустыми местами, альбом класса, профиль Егора, записка, рубль, камень-ножницы-бумага; научные схемы.
import { E, S, ease, prog, clamp, lerp, rr, seg, circle, ring, poly, glow, alpha, shade, mix, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { POSES, drawFigure } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';

const CHERRY = '#8e1c2c', CHROME = '#d9dde4';
function phoneFrame(g, cx, cy, w, h, bg = '#f2f4f8') {
  rr(g, cx - w / 2 - 18, cy - h / 2 - 18, w + 36, h + 36, 50); g.fillStyle = '#0c0d12'; g.fill();
  rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.fillStyle = bg; g.fill();
}
function dash(g) { // приборная панель Волги — фон для вставок
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a0f18', CHERRY, '#2a0a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let i = 0; i < 6; i++) seg(g, [[-E.W, 140 + i * 180], [E.W * 2, 120 + i * 180]], 2, alpha('#ffffff', 0.04));
}
// фигурка-иконка (только для схем)
function tiny(g, x, y, s, col, cap) { circle(g, x, y - 60 * s, 30 * s, '#141414'); rr(g, x - 34 * s, y - 28 * s, 68 * s, 90 * s, 18 * s); g.fillStyle = col; g.fill(); if (cap) { g.fillStyle = cap; g.beginPath(); g.ellipse(x, y - 74 * s, 31 * s, 20 * s, 0, Math.PI, Math.PI * 2); g.fill(); } }
// настоящий герой на фото — тот же рисунок, что и в кадре (одежда, кепка, седина, лицо)
const OF = (k) => (typeof k === 'string' ? CAST[k] : k);
function who(g, k, x, y, s, o = {}) { drawFigure(g, { x, y, s, facing: o.f ?? 1, outfit: o.kid ? { ...OF(k), kid: true } : OF(k), pose: POSES[o.p || 'relaxed'], expr: o.e || 'smile', rim: false, shadow: false, alpha: o.a }); }
// аватарка: голова и плечи героя в круге
function avatar(g, k, cx, cy, r, bg = '#cfe0f0') { g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip(); g.fillStyle = bg; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); const s = r / 48; who(g, k, cx - 4 * s, cy - r * 0.12 + 207 * s, s); g.restore(); }
// перенос строк по ширине (текст не вылезает за рамку)
function wrap(g, str, maxW, size, weight = 800, font = FONTS.ui, italic = false) { g.save(); g.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${font}"`; const out = []; let line = '';
  for (const w of String(str).split(' ')) { const t2 = line ? line + ' ' + w : w; if (line && g.measureText(t2).width > maxW) { out.push(line); line = w; } else line = t2; } if (line) out.push(line); g.restore(); return out; }
// подобрать размер шрифта, чтобы строка влезла в ширину
function fit(g, str, maxW, size, weight = 900, font = FONTS.ui, italic = false) { g.save(); let sz = size; for (; sz > 12; sz -= 2) { g.font = `${italic ? 'italic ' : ''}${weight} ${sz}px "${font}"`; if (g.measureText(str).width <= maxW) break; } g.restore(); return sz; }
// фото-фон: небо, вода, берег
function sky(g, x, y, w, h, top, bot) { g.fillStyle = linGrad(g, 0, y, 0, y + h, [top, bot]); g.fillRect(x, y, w, h); }

export const INS3 = {
  radio(g, t, v) { // радио: вместо частот — даты; стрелка ползёт
    dash(g); const cx = E.W / 2, cy = E.H * 0.5, w = 1200, h = 300;
    rr(g, cx - w / 2 - 20, cy - h / 2 - 20, w + 40, h + 40, 40); g.fillStyle = CHROME; g.fill();
    rr(g, cx - w / 2, cy - h / 2, w, h, 26); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#f2e2b0', '#e8c880']); g.fill(); glow(g, cx, cy, 600, '#ffd59a', 0.25);
    const years = v.years || ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    years.forEach((y, i) => { const x = cx - w / 2 + 80 + i * ((w - 160) / (years.length - 1)); seg(g, [[x, cy - 40], [x, cy - 90]], 4, '#5a3a24'); text(g, y, x, cy - 110 + 220, { size: 30, font: FONTS.ui, weight: 900, color: '#5a3a24' }); for (let k = 1; k < 4; k++) if (i < years.length - 1) seg(g, [[x + k * (w - 160) / (years.length - 1) / 4, cy - 50], [x + k * (w - 160) / (years.length - 1) / 4, cy - 70]], 2, '#8a6a44'); });
    const p = ease.inOut(prog(t, v.at ?? 0.6, (v.at ?? 0.6) + (v.dur ?? 1.4)));
    const nx = cx - w / 2 + 80 + lerp(v.from ?? 1, v.to ?? 0.98, p) * (w - 160);
    seg(g, [[nx, cy - h / 2 + 20], [nx, cy + h / 2 - 20]], 6, '#e04a3a'); glow(g, nx, cy, 80, '#ff6f61', 0.4);
    rr(g, cx - 260, cy - h / 2 - 130, 520, 96, 16); g.fillStyle = '#16141a'; g.fill();
    text(g, p > 0.5 ? (v.date || '23.07.2016') : (v.date0 || v.date || '23.07.2016'), cx, cy - h / 2 - 82, { size: 60, font: FONTS.ui, weight: 900, color: '#ffb070', glow: 18, glowColor: 'rgba(255,150,80,.6)', spacing: 4 });
    if (v.time) text(g, v.time, cx, cy + h / 2 + 90, { size: 54, font: FONTS.ui, weight: 900, color: '#ffd47e', spacing: 4 });
    // круглая ручка
    const kx = cx + w / 2 + 10, ky = cy + h / 2 + 40; circle(g, kx, ky, 70, '#1a1416'); circle(g, kx, ky, 56, CHROME); const a = p * 6 + t * 0.2; seg(g, [[kx, ky], [kx + Math.cos(a) * 44, ky + Math.sin(a) * 44]], 8, '#5a5e68');
  },
  fuel(g, t, v) { // стрелка бензина: деления из четырёх
    dash(g); const cx = E.W / 2, cy = E.H * 0.62, r = 360;
    g.fillStyle = '#16141a'; g.beginPath(); g.arc(cx, cy, r + 40, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = CHROME; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, r + 40, Math.PI, 0); g.stroke();
    for (let i = 0; i <= 4; i++) { const a = Math.PI + (i / 4) * Math.PI; seg(g, [[cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10)], [cx + Math.cos(a) * (r - 70), cy + Math.sin(a) * (r - 70)]], 12, i === 0 ? '#e04a3a' : '#f4efe6'); }
    text(g, 'E', cx - r + 70, cy - 30, { size: 64, font: FONTS.ui, weight: 900, color: '#e04a3a' }); text(g, 'F', cx + r - 70, cy - 30, { size: 64, font: FONTS.ui, weight: 900, color: '#f4efe6' });
    const n0 = v.from ?? v.n ?? 4, n1 = v.to ?? v.n ?? 4, k = ease.inOut(prog(t, v.at ?? 0.6, (v.at ?? 0.6) + 1.2));
    const val = lerp(n0, n1, k) + (v.shiver ? Math.sin(t * 22) * 0.05 : 0);
    const a = Math.PI + (val / 4) * Math.PI; seg(g, [[cx, cy], [cx + Math.cos(a) * (r - 40), cy + Math.sin(a) * (r - 40)]], 14, '#ff6f61'); circle(g, cx, cy, 34, CHROME);
    glow(g, cx + Math.cos(a) * (r - 60), cy + Math.sin(a) * (r - 60), 80, '#ff6f61', 0.4);
    text(g, v.label || `${Math.round(lerp(n0, n1, k))} / 4`, cx, cy + 110, { size: 70, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 14, glowColor: 'rgba(255,200,120,.5)' });
  },
  lever(g, t, v) { // хромированный рычаг «ТУДА» (стоит почти вертикально, буквы столбиком на табличке) и красная кнопка «СЕЙЧАС»
    dash(g); const cx = E.W * 0.36, cy = E.H * 0.88;
    const pull = v.pull != null ? ease.inOut(prog(t, v.pull, v.pull + 0.5)) : 0, press = v.press != null && t > v.press && t < v.press + 0.4 ? 0.9 : 1;
    const a = 0.2 - pull * 0.55; g.save(); g.translate(cx, cy); g.rotate(a);
    rr(g, -45, -700, 90, 720, 45); g.fillStyle = linGrad(g, -45, 0, 45, 0, ['#8a909a', '#ffffff', '#c4c8d0', '#6a6e78']); g.fill();
    rr(g, -62, -790, 124, 150, 56); g.fillStyle = '#1a1416'; g.fill(); circle(g, -22, -750, 16, alpha('#ffffff', 0.25));
    rr(g, -34, -560, 68, 330, 14); g.fillStyle = '#1a1416'; g.fill(); rr(g, -34, -560, 68, 330, 14); g.strokeStyle = '#5a5e68'; g.lineWidth = 4; g.stroke();
    [...'ТУДА'].forEach((ch, i) => text(g, ch, 0, -510 + i * 76, { size: 52, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 10, glowColor: 'rgba(255,200,120,.5)' }));
    g.restore(); circle(g, cx, cy, 86, '#1a1416'); circle(g, cx, cy, 50, CHROME);
    const bx = E.W * 0.7, by = E.H * 0.55; circle(g, bx, by, 130, '#1a1416'); g.save(); g.translate(bx, by); g.scale(press, press); circle(g, 0, 0, 100, '#d6302a'); circle(g, -26, -30, 30, alpha('#ffffff', 0.35)); g.restore();
    glow(g, bx, by, 260, '#ff4a3a', v.press != null && t > v.press ? 0.5 : 0.2);
    rr(g, bx - 150, by + 150, 300, 84, 20); g.fillStyle = '#1a1416'; g.fill();
    text(g, 'СЕЙЧАС', bx, by + 192, { size: fit(g, 'СЕЙЧАС', 250, 54, 900, FONTS.ui), font: FONTS.ui, weight: 900, color: '#f4efe6', spacing: 4 });
    if (v.press != null && t > v.press) FX.rings(g, bx, by, t - v.press, { count: 2, r0: 110, r1: 320, color: '#ff8f80', a: 0.5 });
  },
  notes(g, t, v) { // заметки: даты обещаний, счётчик 36
    const cx = E.W / 2, cy = E.H * 0.52, w = 480, h = 800; phoneFrame(g, cx, cy, w, h, '#fbf7e8');
    const hd = 'ПРЕМИЯ «НА ЭТОЙ НЕДЕЛЕ»'; text(g, hd, cx, cy - h / 2 + 64, { size: fit(g, hd, w - 60, 28), font: FONTS.ui, weight: 900, color: '#c0453a' });
    const n = Math.min(36, Math.floor(clamp(t / (v.dur || 3.5)) * 36) + 1), rows = 10;
    for (let i = 0; i < Math.min(n, rows); i++) { const d = n - Math.min(n, rows) + i + 1; const y = cy - h / 2 + 130 + i * 52; text(g, `${d}. ${String(1 + ((d * 3) % 28)).padStart(2, '0')}.0${3 + Math.floor(d / 12)} — «точно»`, cx - w / 2 + 40, y, { size: 28, font: FONTS.ui, weight: 800, color: '#3a3a44', align: 'left' }); }
    rr(g, cx - 90, cy + h / 2 - 110, 180, 80, 40); g.fillStyle = '#c0453a'; g.fill(); text(g, String(n), cx, cy + h / 2 - 68, { size: 54, font: FONTS.ui, weight: 900, color: '#fff' });
  },
  msg(g, t, v) { // переписка: сообщение «мы точно не знакомы», блокировка. Текст переносится внутри пузырей.
    const cx = E.W / 2, cy = E.H * 0.52, w = 540, h = 840, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#e8eef4');
    rr(g, x0, cy - h / 2, w, 120, 36); g.fillStyle = '#3a6ea5'; g.fill(); g.fillRect(x0, cy - h / 2 + 60, w, 60);
    avatar(g, 'egor', x0 + 70, cy - h / 2 + 62, 38, '#9fc8e8'); text(g, v.name || 'Егор', x0 + 126, cy - h / 2 + 62, { size: 34, font: FONTS.ui, weight: 900, color: '#fff', align: 'left' });
    const LH = 42, FS = 31, PAD = 22; let y = cy - h / 2 + 150;
    const bubble = (s, right, a) => { const bw = w - 140, lines = wrap(g, s, bw - PAD * 2, FS, 800); const bh = PAD + lines.length * LH + 6, bx = right ? x0 + w - 24 - bw : x0 + 24;
      if (y + bh > cy + h / 2 - 150) return; g.save(); g.globalAlpha *= a; rr(g, bx, y, bw, bh, 18); g.fillStyle = right ? '#d2f2c4' : '#ffffff'; g.fill();
      lines.forEach((ln, k) => text(g, ln, bx + PAD, y + PAD + 10 + k * LH, { size: FS, font: FONTS.ui, weight: 800, color: '#22222a', align: 'left' })); g.restore(); y += bh + 14; };
    (v.mine || []).forEach((s, i) => { const a = clamp((t - i * 0.5) / 0.3); if (a > 0) bubble(s, true, a); });
    const R = v.theirs || ['Извините, мы точно не знакомы.', 'Не пишите мне больше.']; const at = v.at ?? 0.6, a = clamp((t - at) / 0.3);
    if (a > 0) R.forEach((s) => bubble(s, false, a));
    if (v.block != null && t > v.block) { const k = clamp((t - v.block) / 0.3); rr(g, x0 + 30, cy + h / 2 - 130, w - 60, 80, 20); g.fillStyle = alpha('#e04a3a', k); g.fill(); const bs = 'ВЫ В ЧЁРНОМ СПИСКЕ'; text(g, bs, cx, cy + h / 2 - 90, { size: fit(g, bs, w - 110, 30), font: FONTS.ui, weight: 900, color: alpha('#ffffff', k) }); }
  },
  call(g, t, v) { // звонок: аватарка героя, «абонент не зарегистрирован»
    const cx = E.W / 2, cy = E.H * 0.52, w = 440, h = 760; phoneFrame(g, cx, cy, w, h, '#1c2238');
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 36); g.clip(); g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#2a3150', '#141a2c']); g.fillRect(cx - w / 2, cy - h / 2, w, h); g.restore();
    const end = v.end != null && t > v.end; FX.rings(g, cx, cy - 150, t, { count: 3, r0: 96, r1: 180, color: '#cfd8ea', a: end ? 0 : 0.3 });
    avatar(g, v.who || 'egor', cx, cy - 150, 86, '#9fc8e8');
    const nm = v.name || 'ЕГОР'; text(g, nm, cx, cy - 20, { size: fit(g, nm, w - 60, 48), font: FONTS.ui, weight: 900, color: '#ffffff' });
    const sb = v.sub || 'вызов…'; text(g, sb, cx, cy + 34, { size: fit(g, sb, w - 60, 28, 800), font: FONTS.ui, weight: 800, color: '#9fb6d8' });
    circle(g, cx, cy + 250, 52, end ? '#e04a3a' : '#3fd07a');
    if (end) text(g, 'ВЫЗОВ ЗАВЕРШЁН', cx, cy + 130, { size: fit(g, 'ВЫЗОВ ЗАВЕРШЁН', w - 60, 30), font: FONTS.ui, weight: 900, color: '#e04a3a' });
  },
  rec(g, t, v) { // съёмка на телефон: видоискатель, REC, дата — в кадре настоящие Максим и начальник
    const cx = E.W / 2, cy = E.H * 0.5, w = 1000, h = 600; rr(g, cx - w / 2 - 22, cy - h / 2 - 22, w + 44, h + 44, 50); g.fillStyle = '#0c0d12'; g.fill();
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, 30); g.clip(); sky(g, cx - w / 2, cy - h / 2, w, h, '#d8cdbd', '#8a7a68');
    g.fillStyle = alpha('#ffffff', 0.25); for (let i = 0; i < 3; i++) g.fillRect(cx - w / 2 + 60 + i * 330, cy - h / 2 + 40, 240, 200);
    g.fillStyle = '#6a5a4a'; g.fillRect(cx - w / 2, cy + 180, w, 140);
    who(g, 'max', cx - 200, cy + 340, 1.75, { e: 'smile', p: 'relaxed' }); who(g, 'boss', cx + 200, cy + 340, 1.75, { f: -1, e: 'happy', p: 'explain' });
    g.restore();
    const blink = Math.floor(t * 2) % 2; if (blink) circle(g, cx - w / 2 + 50, cy - h / 2 + 50, 16, '#e04a3a'); text(g, 'REC', cx - w / 2 + 110, cy - h / 2 + 50, { size: 34, font: FONTS.ui, weight: 900, color: '#ffffff' });
    text(g, v.date || '15.04  09:12', cx + w / 2 - 170, cy - h / 2 + 50, { size: 34, font: FONTS.ui, weight: 900, color: '#ffffff' });
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { seg(g, [[cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 30)], [cx + sx * (w / 2 - 90), cy + sy * (h / 2 - 30)]], 5, '#ffffff'); seg(g, [[cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 30)], [cx + sx * (w / 2 - 30), cy + sy * (h / 2 - 90)]], 5, '#ffffff'); }
    if (v.line) text(g, v.line, cx, cy + h / 2 + 70, { size: 46, font: FONTS.serif, italic: true, weight: 900, color: S().ui.cream });
  },
  gallery2(g, t, v) { // галерея: на всех фото ты, рядом — пустое место
    const cx = E.W / 2, cy = E.H * 0.52, w = 500, h = 820; phoneFrame(g, cx, cy, w, h, '#141a28');
    const caps = ['ВЫПУСКНОЙ', 'ШАШЛЫКИ', 'ГАРАЖИ', 'ДР · ТОРТ', 'МОРЕ', 'ДАЧА'];
    const cols = [['#ffd9a0', '#f2b06a'], ['#d6f0d8', '#9fd8a8'], ['#bfe0f4', '#7fc0e8'], ['#f8c8c8', '#e88a8a'], ['#cfe4fa', '#5a9ad8'], ['#e6d6f6', '#c9a7e8']];
    const fade = v.empty ? clamp((t - (v.at ?? 0.8)) / 1.0) : 0, ex = ['happy', 'joy', 'smile', 'happy', 'joy', 'smile'];
    for (let i = 0; i < 6; i++) { const col = i % 2, row = Math.floor(i / 2), x = cx - w / 2 + 24 + col * 230, y = cy - h / 2 + 96 + row * 232, tw = 220, th = 220;
      g.save(); rr(g, x, y, tw, th, 10); g.clip(); sky(g, x, y, tw, th, cols[i][0], cols[i][1]);
      who(g, 'max', x + 70, y + th + 120, 1.1, { e: ex[i], p: i % 3 === 1 ? 'wave' : 'relaxed' });
      who(g, 'egor', x + 150, y + th + 120, 1.1, { f: -1, e: ex[(i + 1) % 6], a: 1 - fade, p: i % 3 === 2 ? 'wave' : 'relaxed' });
      if (fade > 0.9) { g.setLineDash([8, 6]); g.strokeStyle = alpha('#ffffff', 0.8); g.lineWidth = 3; rr(g, x + 116, y + 60, 70, 150, 10); g.stroke(); g.setLineDash([]); }
      rr(g, x + 8, y + 8, tw - 16, 34, 8); g.fillStyle = alpha('#ffffff', 0.8); g.fill(); text(g, caps[i], x + tw / 2, y + 26, { size: fit(g, caps[i], tw - 30, 20), font: FONTS.ui, weight: 900, color: '#22222a' }); g.restore(); }
    const tl = v.title || '8 ЛЕТ ФОТОГРАФИЙ'; text(g, tl, cx, cy - h / 2 + 52, { size: fit(g, tl, w - 60, 30), font: FONTS.ui, weight: 900, color: '#ffd47e' });
  },
  album(g, t, v) { // альбом выпускников: 7 «Б», третья парта, рядом пустой стул
    const cx = E.W / 2, cy = E.H * 0.52; g.save(); g.translate(cx, cy); g.rotate(-0.02);
    rr(g, -700, -400, 1400, 800, 16); g.fillStyle = '#3a2a5a'; g.fill(); rr(g, -670, -370, 1340, 740, 8); g.fillStyle = '#fbf8f1'; g.fill();
    text(g, '7 «Б»', 0, -310, { size: 64, font: FONTS.serif, italic: true, weight: 900, color: '#3a2a5a' });
    const kidCol = ['#3a6ea5', '#8a5ad6', '#f29ac0', '#e8c070', '#5a8a7a', '#c0453a', '#4a4d5a', '#5aa0d0', '#a0c050'], heads = ['none', 'bun', 'ponytail', 'curly', 'spiky', 'none', 'bun', 'curly'];
    const kid = (i) => ({ top: i % 3 === 0 ? 'hoodie' : 'tshirt', color: kidCol[i % kidCol.length], legs: '#3a3a44', head: heads[i % heads.length], headColor: '#5a3a24' });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -480 + c * 320, y = -140 + r * 170, me = r === 2 && c === 1;
      if (me) { who(g, 'max', x - 50, y + 80, 1.15, { kid: true, e: 'sad', p: 'relaxed' }); const k = clamp((t - (v.at ?? 1)) / 0.4); FX.chair(g, x + 55, y + 40, 0.9, '#6a5040');
        g.setLineDash([8, 6]); g.strokeStyle = alpha('#c0453a', k); g.lineWidth = 4; rr(g, x + 10, y - 70, 90, 110, 10); g.stroke(); g.setLineDash([]); }
      else { who(g, kid(r * 4 + c), x - 50, y + 80, 1.15, { kid: true, e: (r + c) % 2 ? 'smile' : 'happy' }); who(g, kid(r * 4 + c + 5), x + 55, y + 80, 1.15, { kid: true, f: -1, e: (r + c) % 2 ? 'happy' : 'smile' }); }
      rr(g, x - 120, y + 40, 240, 22, 6); g.fillStyle = '#c9a86a'; g.fill();
      if (me) { const k = clamp((t - (v.at ?? 1)) / 0.4); text(g, 'ПУСТОЙ СТУЛ', x + 55, y + 92, { size: 24, font: FONTS.ui, weight: 900, color: alpha('#c0453a', k) }); } }
    g.restore();
  },
  profile(g, t, v) { // соцсеть: Егор, 21, Петербург, инженер; аватарка с отцом на рыбалке
    const cx = E.W / 2, cy = E.H * 0.52, w = 540, h = 840, x0 = cx - w / 2; phoneFrame(g, cx, cy, w, h, '#ffffff');
    g.save(); rr(g, x0, cy - h / 2, w, h, 36); g.clip(); g.fillStyle = '#5a8ac0'; g.fillRect(x0, cy - h / 2, w, 150); g.restore();
    const ay = cy - h / 2 + 170; circle(g, cx, ay, 92, '#ffffff'); g.save(); g.beginPath(); g.arc(cx, ay, 82, 0, 7); g.clip(); sky(g, cx - 90, ay - 90, 180, 180, '#bfe0f4', '#4a7aa0');
    who(g, 'dad50', cx - 32, ay + 250, 1.25, { e: 'joy' }); who(g, 'egor', cx + 34, ay + 256, 1.25, { f: -1, e: 'happy' }); g.restore();
    text(g, 'Егор', cx, cy - h / 2 + 304, { size: 48, font: FONTS.ui, weight: 900, color: '#22222a' });
    ['21 год · Санкт-Петербург', 'Инженер · велосипед'].forEach((s, i) => text(g, s, cx, cy - h / 2 + 356 + i * 40, { size: fit(g, s, w - 60, 28, 800), font: FONTS.ui, weight: 800, color: '#6a7080' }));
    const k = clamp((t - (v.at ?? 1.2)) / 0.4); g.save(); g.globalAlpha *= k; const px = x0 + 30, py = cy + 30, pw = w - 60; rr(g, px, py, pw, 360, 16); g.fillStyle = '#eef2f6'; g.fill();
    g.save(); rr(g, px + 14, py + 14, pw - 28, 210, 10); g.clip(); sky(g, px, py, pw, 230, '#bfe0f4', '#3a6a90'); g.fillStyle = '#2f5a7a'; g.fillRect(px, py + 170, pw, 60);
    who(g, 'dad50', cx - 70, py + 300, 1.15, { e: 'joy', p: 'holdFront' }); seg(g, [[cx - 40, py + 130], [cx + 150, py + 30]], 4, '#3a2a20'); seg(g, [[cx + 150, py + 30], [cx + 170, py + 150]], 1.5, alpha('#ffffff', 0.7));
    who(g, 'egor', cx + 70, py + 300, 1.15, { f: -1, e: 'happy', p: 'wave' }); g.restore();
    wrap(g, '«Лучший батя в мире, друг, учитель и напарник по рыбалке»', pw - 40, 25, 900, FONTS.serif, true).slice(0, 3).forEach((ln, i) => text(g, ln, cx, py + 256 + i * 32, { size: 25, font: FONTS.serif, italic: true, weight: 900, color: '#22222a' }));
    g.restore();
  },
  photoDad(g, t, v) { // старая фото: 12-летний Егор с отцом на фоне Невы (или рыбалка с поседевшим отцом)
    const cx = E.W / 2, cy = E.H * 0.5; g.save(); g.translate(cx, cy); g.rotate(0.03);
    rr(g, -380, -280, 760, 560, 10); g.fillStyle = '#fbf8f1'; g.fill(); g.save(); rr(g, -350, -250, 700, 420, 4); g.clip();
    sky(g, -350, -250, 700, 420, v.fish ? '#bfe0f4' : '#dfe8f0', v.fish ? '#4a7aa0' : '#9ab4cc');
    if (!v.fish) { g.fillStyle = '#7a8aa0'; for (let i = 0; i < 8; i++) g.fillRect(-350 + i * 90, -80 - (i % 3) * 30, 70, 140 + (i % 3) * 30); g.fillStyle = '#c9a86a'; g.fillRect(-340, -150, 18, 90); g.beginPath(); g.moveTo(-331, -200); g.lineTo(-322, -150); g.lineTo(-340, -150); g.fill(); g.fillStyle = '#4a7aa0'; g.fillRect(-350, 60, 700, 120); }
    else { g.fillStyle = '#2f5a7a'; g.fillRect(-350, 20, 700, 160); g.fillStyle = '#6a8a4a'; g.fillRect(-350, 120, 700, 60); }
    if (v.fish) { who(g, 'dad50', -90, 330, 2.0, { e: 'joy', p: 'holdFront' }); seg(g, [[-40, 40], [260, -180]], 6, '#3a2a20'); seg(g, [[260, -180], [290, 40]], 2, alpha('#ffffff', 0.7)); who(g, 'egor', 110, 330, 2.0, { f: -1, e: 'happy', p: 'wave' }); }
    else { who(g, 'dad', -80, 330, 2.0, { e: 'smile' }); who(g, 'egor', 90, 330, 2.0, { f: -1, kid: true, e: 'happy', p: 'wave' }); }
    g.restore();
    text(g, v.cap || 'Нева, 2015', 0, 225, { size: fit(g, v.cap || 'Нева, 2015', 660, 34, 900, FONTS.serif, true), font: FONTS.serif, italic: true, weight: 900, color: '#3a3a44' });
    g.restore();
  },
  note(g, t, v) { // записка дрожащим почерком + рубль
    const cx = E.W / 2, cy = E.H * 0.5; g.save(); g.translate(cx - 120, cy); g.rotate(-0.05);
    rr(g, -380, -300, 760, 600, 6); g.fillStyle = '#f4ecd8'; g.fill(); seg(g, [[-380, 0], [380, 0]], 2, alpha('#000', 0.08));
    (v.lines || ['Он всегда находит тебя.', 'Ты потратил с умом.', '— Максим']).forEach((ln, i) => { const k = clamp((t - 0.3 - i * 0.9) / 0.7); g.save(); g.beginPath(); g.rect(-340, -250 + i * 150, 680 * k, 150); g.clip();
      text(g, ln, -320 + Math.sin(i * 3) * 6, -170 + i * 150 + Math.sin(t * 30 + i) * 0.8, { size: fit(g, ln, 650, 58, 900, FONTS.serif, true), font: FONTS.serif, italic: true, weight: 900, color: '#2a3a6a', align: 'left' }); g.restore(); });
    g.restore();
    if (v.coin !== false) { const x = cx + 520, y = cy + 200; circle(g, x, y, 110, '#b8bcc4'); circle(g, x, y, 96, '#d9dde4'); text(g, '1', x, y - 10, { size: 90, font: FONTS.ui, weight: 900, color: '#7a7e88' }); text(g, 'РУБЛЬ', x, y + 50, { size: 26, font: FONTS.ui, weight: 900, color: '#7a7e88' }); }
  },
  coin(g, t, v) { // рубль крупно, блестит
    const cx = E.W / 2, cy = E.H * 0.52; glow(g, cx, cy, 600, '#fff1d6', 0.18);
    g.save(); g.translate(cx, cy); g.scale(Math.cos(t * (v.spin ?? 0)) || 1, 1);
    circle(g, 0, 0, 260, '#9aa0aa'); circle(g, 0, 0, 236, '#d9dde4'); ring(g, 0, 0, 200, 4, '#9aa0aa');
    text(g, '1', 0, -30, { size: 230, font: FONTS.ui, weight: 900, color: '#7a7e88' }); text(g, 'РУБЛЬ', 0, 120, { size: 60, font: FONTS.ui, weight: 900, color: '#7a7e88', spacing: 6 }); g.restore();
    FX.sparkle(g, cx + 140, cy - 160, 40 + 10 * Math.sin(t * 4));
    if (v.cap) text(g, v.cap, cx, E.H * 0.92, { size: 46, font: FONTS.serif, italic: true, weight: 900, color: S().ui.cream });
  },
  keys(g, t, v) { // ключи и рубль на стойке
    const cx = E.W / 2, cy = E.H * 0.55; g.fillStyle = linGrad(g, 0, cy - 200, 0, E.H, ['#d9c8a8', '#a88a68']); g.fillRect(-E.W, cy - 200, E.W * 3, E.H);
    const k = ease.out(prog(t, 0.2, 0.7)); g.save(); g.translate(cx - 160, cy - 300 * (1 - k)); ring(g, 0, 0, 50, 10, '#b8bcc4'); rr(g, 30, -14, 200, 28, 8); g.fillStyle = '#c9ccd4'; g.fill(); for (let i = 0; i < 4; i++) g.fillRect(150 + i * 20, 14, 10, 18 + (i % 2) * 10); rr(g, -150, -40, 110, 80, 14); g.fillStyle = CHERRY; g.fill(); text(g, 'ГАЗ', -95, 2, { size: 30, font: FONTS.ui, weight: 900, color: '#f4efe6' }); g.restore();
    if (v.coin) { const c = ease.outBack(prog(t, v.coin, v.coin + 0.4)); if (c > 0) { const x = cx + 300, y = cy + 40; circle(g, x, y, 60 * c, '#b8bcc4'); circle(g, x, y, 52 * c, '#d9dde4'); text(g, '1₽', x, y + 2, { size: 44 * c, font: FONTS.ui, weight: 900, color: '#7a7e88' }); } }
  },
  rps(g, t, v) { // камень-ножницы-бумага: счёт 7:0
    const cx = E.W / 2, cy = E.H * 0.55; glow(g, cx, cy, 700, '#ffd59a', 0.15);
    const n = Math.min(7, Math.floor(t / (v.step || 0.5)) + 1), sh = Math.abs(Math.sin(t * Math.PI / (v.step || 0.5) * 2)) * 30;
    // левая рука (Максим) — бумага/камень, правая (Егор) — ножницы
    for (const sd of [-1, 1]) { const x = cx + sd * 360, col = sd < 0 ? CAST.max.color : CAST.egor.color; seg(g, [[x + sd * 400, cy + 300], [x + sd * 60, cy + 40 - sh]], 110, col); circle(g, x, cy - sh, 80, '#0e0b12');
      if (sd > 0) { seg(g, [[x - 20, cy - sh - 40], [x - 120, cy - sh - 150]], 34, '#0e0b12'); seg(g, [[x - 40, cy - sh], [x - 150, cy - sh - 70]], 34, '#0e0b12'); }
      else { for (let i = 0; i < 4; i++) seg(g, [[x + 30, cy - sh - 40 + i * 26], [x + 150, cy - sh - 60 + i * 26]], 26, '#0e0b12'); } }
    text(g, `${n} : 0`, cx, E.H * 0.18, { size: 120, font: FONTS.ui, weight: 900, color: '#ffd47e', glow: 18, glowColor: 'rgba(255,200,120,.5)' });
    text(g, v.cap || 'СЕМЬ РАЗ ПОДРЯД', cx, E.H * 0.3, { size: 44, font: FONTS.ui, weight: 900, color: S().ui.cream, spacing: 3 });
  },
};

export const BP3 = {
  orbit(g, t, v) { // орбита МКС: 878 дней → на 1/50 секунды в будущем
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W * 0.36, cy = E.H * 0.55;
    circle(g, cx, cy, 170, alpha(c, 0.25)); ring(g, cx, cy, 170, 5, c); g.strokeStyle = alpha(c, 0.4); g.lineWidth = 3; g.setLineDash([10, 10]); g.beginPath(); g.ellipse(cx, cy, 300, 150, -0.2, 0, 7); g.stroke(); g.setLineDash([]);
    const a = t * 1.6, sx = cx + Math.cos(a) * 300 * Math.cos(-0.2) - Math.sin(a) * 150 * Math.sin(-0.2), sy = cy + Math.cos(a) * 300 * Math.sin(-0.2) + Math.sin(a) * 150 * Math.cos(-0.2);
    rr(g, sx - 40, sy - 8, 80, 16, 4); g.fillStyle = gold; g.fill(); g.fillStyle = alpha(gold, 0.6); g.fillRect(sx - 70, sy - 26, 26, 52); g.fillRect(sx + 44, sy - 26, 26, 52);
    const k = clamp(t / 2.5); text(g, `${Math.round(878 * k)} ДНЕЙ`, E.W * 0.72, cy - 120, { size: 96, font: FONTS.ui, weight: 900, color: c });
    text(g, '+ 1/50 СЕКУНДЫ', E.W * 0.72, cy + 20, { size: 76, font: FONTS.ui, weight: 900, color: gold, glow: 18, glowColor: alpha(gold, 0.5), alpha: clamp((t - 1.6) / 0.4) });
    text(g, 'В БУДУЩЕМ', E.W * 0.72, cy + 110, { size: 46, font: FONTS.ui, weight: 900, color: c, spacing: 4, alpha: clamp((t - 1.8) / 0.4) });
    text(g, v.title || 'ПУТЕШЕСТВИЕ ВО ВРЕМЕНИ УЖЕ БЫЛО', E.W / 2, E.H * 0.13, { size: 50, font: FONTS.ui, weight: 900, color: c, spacing: 2 });
  },
  gps(g, t) { // спутники навигации: +38 мкс в сутки, без поправки — километры ошибки
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, cx = E.W * 0.3, cy = E.H * 0.62;
    g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy + 520, 600, Math.PI * 1.25, Math.PI * 1.75); g.stroke();
    for (let i = 0; i < 3; i++) { const x = cx - 260 + i * 260, y = cy - 330 + Math.sin(t + i) * 10; rr(g, x - 30, y - 20, 60, 40, 6); g.fillStyle = gold; g.fill(); g.fillStyle = alpha(gold, 0.6); g.fillRect(x - 80, y - 12, 44, 24); g.fillRect(x + 36, y - 12, 44, 24); seg(g, [[x, y + 24], [cx, cy - 60]], 2, alpha(gold, 0.4)); }
    circle(g, cx, cy - 60, 16, acc);
    text(g, '+38', E.W * 0.72, E.H * 0.42, { size: 170, font: FONTS.ui, weight: 900, color: gold, glow: 20, glowColor: alpha(gold, 0.5) });
    text(g, 'МИЛЛИОННЫХ СЕКУНДЫ В СУТКИ', E.W * 0.72, E.H * 0.55, { size: 40, font: FONTS.ui, weight: 900, color: c, spacing: 2 });
    text(g, 'без поправки — ошибка в километрах', E.W * 0.72, E.H * 0.68, { size: 40, font: FONTS.ui, weight: 900, color: acc, alpha: clamp((t - 1.5) / 0.4) });
  },
  paradox(g, t) { // парадокс дедушки: стрелка времени назад и крест
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, y = E.H * 0.55;
    seg(g, [[200, y], [E.W - 200, y]], 6, c); poly(g, [[E.W - 200, y - 22], [E.W - 160, y], [E.W - 200, y + 22]], c);
    [['ДЕДУШКА', 0.18], ['РОДИТЕЛИ', 0.42], ['ТЫ', 0.7]].forEach(([s, k], i) => { const x = E.W * k; circle(g, x, y, 14, gold); UI.lineFigure(g, { x, y: y - 40, s: 0.6, color: alpha(c, 0.9) }); text(g, s, x, y + 70, { size: 34, font: FONTS.ui, weight: 900, color: c }); });
    const p = ease.inOut(prog(t, 0.4, 1.8)); g.strokeStyle = acc; g.lineWidth = 6; g.beginPath(); g.moveTo(E.W * 0.7, y - 160); g.quadraticCurveTo(E.W * 0.45, y - 360, lerp(E.W * 0.7, E.W * 0.2, p), lerp(y - 160, y - 180, p)); g.stroke();
    if (t > 2) { const k = clamp((t - 2) / 0.3); seg(g, [[E.W * 0.7 - 60 * k, y - 100 - 60 * k], [E.W * 0.7 + 60 * k, y - 100 + 60 * k]], 12, acc); seg(g, [[E.W * 0.7 + 60 * k, y - 100 - 60 * k], [E.W * 0.7 - 60 * k, y - 100 + 60 * k]], 12, acc); }
    text(g, 'ПАРАДОКС ДЕДУШКИ', E.W / 2, E.H * 0.14, { size: 60, font: FONTS.ui, weight: 900, color: c, spacing: 4 });
  },
  branches(g, t, v) { // ветки реальности
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent, x0 = 200, y0 = E.H * 0.6;
    const p = clamp(t / 2.2); g.lineCap = 'round';
    const br = (x, y, a, len, d) => { if (d > 4) return; const k = clamp(p * 5 - d); if (k <= 0) return; const x2 = x + Math.cos(a) * len * k, y2 = y + Math.sin(a) * len * k; seg(g, [[x, y], [x2, y2]], 8 - d, d === 0 ? c : alpha(d % 2 ? gold : c, 0.85)); if (k >= 1) { br(x2, y2, a - 0.32, len * 0.8, d + 1); br(x2, y2, a + 0.32, len * 0.8, d + 1); } };
    br(x0, y0, 0, 380, 0);
    if (v.mark) { circle(g, x0 + 380, y0, 18, acc); text(g, 'ИЗМЕНЕНИЕ', x0 + 380, y0 + 60, { size: 30, font: FONTS.ui, weight: 900, color: acc }); }
    text(g, v.title || 'КАЖДОЕ ИЗМЕНЕНИЕ — НОВАЯ ВЕТКА', E.W / 2, E.H * 0.14, { size: 52, font: FONTS.ui, weight: 900, color: c, spacing: 2 });
    if (v.sub) text(g, v.sub, E.W / 2, E.H * 0.92, { size: 40, font: FONTS.ui, weight: 900, color: gold });
  },
};
export { who, avatar, wrap, fit, phoneFrame, sky as photoSky };
