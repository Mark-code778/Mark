// shots/director.js — «режиссёр»: рисует каждый кадр по описанию params.v из story/shots.json.
// v = { set, so, cam, ch[], pr[], face, ins, bp, ui[], fx, lid, split }
import { E, V, S, registerShot, getShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, talkAmount,
  seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, radGrad, backdrop, text, measure, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { salon, car } from '../sets/salon.js';
import { cafe, table, cup, room, park, bench, pharmacy, entrance, stage, void_ } from '../sets/places.js';
import { CAST } from '../cast.js';

const SETS = { salon, cafe, room, park, pharmacy, entrance, stage, void: void_ };
const at = (keys, t) => { if (!Array.isArray(keys)) return keys; let v = keys[0][1]; for (const [tt, x] of keys) if (t >= tt) v = x; return v; };
const span = (a, t, dur, e = ease.inOut) => (Array.isArray(a) ? lerp(a[0], a[1], e(clamp(t / dur))) : a ?? 0);

function camOf(v, t, dur) {
  const c = v.cam || {};
  const cam = { z: span(c.z ?? [1, 1.05], t, dur), x: span(c.x ?? [0, -24], t, dur), y: span(c.y ?? 0, t, dur), r: c.r || 0 };
  if (c.push) cam.z = lerp(c.push[0], c.push[1], ease.out(clamp(t / Math.min(dur, c.pushT || 0.8))));
  if (c.shake) { const [sx, sy] = shake(t, c.shake, 9); cam.x += sx; cam.y += sy; }
  return cam;
}

function drawSet(g, v, t, cam) {
  const fn = SETS[v.set || 'void'] || void_;
  return fn(g, t, cam, v.so || {});
}

function drawChars(g, v, t, dur, info, GY, CX, M) {
  for (const c of v.ch || []) {
    const outfit = { ...(CAST[c.w] || CAST.max), ...(c.of || {}) };
    let x = CX + (c.x || 0), facing = c.f ?? 1, pose;
    if (c.walk) {
      const [x0, x1, t0 = 0, t1 = dur] = c.walk; const k = clamp((t - t0) / (t1 - t0));
      x = CX + lerp(x0, x1, k); facing = x1 >= x0 ? 1 : -1;
      pose = k < 1 && t >= t0 ? walkPose(t * Math.PI * 2 * (c.run ? 1.6 : 0.9), { run: c.run }) : breathe(POSES[at(c.p, t) || 'stand'] || POSES.stand, t, 1, c.x || 0);
    } else {
      const p = c.p || 'stand';
      pose = Array.isArray(p) ? posesAt(t, p) : POSES[p] || POSES.stand;
      if (!c.still) pose = breathe(pose, t, 1, (c.x || 0) * 0.01 + (c.s || 1));
    }
    const talk = c.talk ? talkAmount(info.globalT, info.shot.start + (c.talk[0] ?? 0), info.shot.start + (c.talk[1] ?? 99)) : 0;
    const rim = { color: M.rim, dir: c.rim || [0, -1] };
    drawFigure(g, { x, y: GY + (c.y || 0), s: c.s ?? 1.6, facing, outfit, pose, rot: c.rot, expr: at(c.e || 'neutral', t), talk, look: c.look,
      blink: c.noblink ? false : (t + (c.x || 0) * 0.01) % (2.9 + ((c.s || 1) * 0.7)) > 2.78, rim, prop: c.prop, trail: c.trail, alpha: c.alpha });
    if (talk > 0) { const hy = GY - 205 * (c.s ?? 1.6); FX.rings(g, x + 6 * facing, hy, t, { count: 2, r0: 40 * (c.s ?? 1.6), r1: 70 * (c.s ?? 1.6), color: '#fff3e0', a: 0.18 }); }
  }
}

function drawProps(g, v, t, GY, CX, M) {
  for (const p of v.pr || []) {
    const x = CX + (p.x || 0);
    if (p.t === 'table') { const top = table(g, x, GY); if (p.cups) p.cups.forEach((dx) => cup(g, x + dx, top, 1.3)); }
    if (p.t === 'bench') bench(g, x, GY, p.s || 1.6);
    if (p.t === 'car') car(g, x, GY + 8, { color: p.c || '#d64a3a', s: p.s || 0.95, dir: p.dir ?? -1, M });
    if (p.t === 'chair') { g.save(); g.translate(x, 0); g.scale(p.f || 1, 1); FX.chair(g, 0, GY, p.s || 1.6, '#24181e'); g.restore(); }
    if (p.t === 'carrier') { const s = p.s || 1; rr(g, x - 80 * s, GY - 230 * s, 160 * s, 90 * s, 30 * s); g.fillStyle = '#8fd0f2'; g.fill(); seg(g, [[x - 60 * s, GY - 228 * s], [x, GY - 300 * s], [x + 60 * s, GY - 228 * s]], 8 * s, '#3a5280'); }
  }
}

// ── вставки (крупно предмет на размытом фоне)
const INS = {
  phone(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.52, w = 330, h = 600;
    rr(g, cx - w / 2 - 16, cy - h / 2 - 16, w + 32, h + 32, 46); g.fillStyle = '#0c0d12'; g.fill();
    g.fillStyle = linGrad(g, 0, cy - h / 2, 0, cy + h / 2, ['#1d2a44', '#0f1626']); rr(g, cx - w / 2, cy - h / 2, w, h, 34); g.fill();
    glow(g, cx, cy, 420, '#7fb8ff', 0.18);
    const L = v.lines || [];
    L.forEach((s, i) => text(g, s, cx, cy - 60 + i * 110, { size: i ? 52 : 120, font: FONTS.ui, weight: 900, color: i ? '#cfd8ea' : (t > (v.flip ?? 99) ? '#ff6f61' : '#ffffff'), glow: 16, glowColor: 'rgba(120,180,255,.5)' }));
    if (v.flip != null && t > v.flip) FX.rings(g, cx, cy - 60, t - v.flip, { count: 2, r0: 80, r1: 260, color: '#ff8f80', a: 0.4 });
    // рука
    seg(g, [[cx + 120, cy + 260], [E.W + 200, E.H + 200]], 90, '#0e0b12'); seg(g, [[cx + 260, cy + 360], [E.W + 300, E.H + 300]], 120, CAST.max.color);
  },
  gallery(g, t) {
    const cx = E.W / 2, cy = E.H * 0.52, w = 360, h = 620;
    rr(g, cx - w / 2 - 16, cy - h / 2 - 16, w + 32, h + 32, 46); g.fillStyle = '#0c0d12'; g.fill(); rr(g, cx - w / 2, cy - h / 2, w, h, 34); g.fillStyle = '#141a28'; g.fill();
    const cols = ['#f2b06a', '#7fc0e8', '#e88a8a', '#9fd8a8', '#c9a7e8', '#f2d27a'];
    const n = Math.floor(clamp(t / 2.2) * 18);
    for (let i = 0; i < 18; i++) { const col = i % 3, row = Math.floor(i / 3), x = cx - w / 2 + 16 + col * 112, y = cy - h / 2 + 90 + row * 84;
      const a = i < n ? 1 : 0.12; g.save(); g.globalAlpha = a; rr(g, x, y, 104, 76, 8); g.fillStyle = cols[i % 6]; g.fill();
      circle(g, x + 52, y + 34, 12, '#141414'); seg(g, [[x + 52, y + 46], [x + 52, y + 66]], 8, '#141414'); if (i % 2) { circle(g, x + 76, y + 36, 11, '#141414'); } g.restore(); }
    text(g, String(Math.round(clamp(t / 2.2) * 342)), cx, cy - h / 2 + 48, { size: 50, font: FONTS.ui, weight: 900, color: '#ffd47e' });
  },
  clock(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.48, r = 300;
    glow(g, cx, cy, 700, '#fff1d6', 0.14);
    FX.clock(g, cx, cy, r, v.time ?? (10 * 3600 + 17 * 60 + t), { face: '#f2ede4' });
    if (v.tick) FX.rings(g, cx, cy, t, { count: 2, r0: r, r1: r * 1.3, color: '#fff3e0', a: 0.18 });
  },
  envelope(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.5, w = 640, h = 380, open = v.open ? ease.out(prog(t, v.open, v.open + 0.8)) : 0;
    g.save(); g.translate(cx, cy); g.rotate(-0.04);
    rr(g, -w / 2, -h / 2, w, h, 16); g.fillStyle = '#f4efe4'; g.fill();
    if (open > 0) { rr(g, -w / 2 + 40, -h / 2 - 220 * open, w - 80, h - 40, 10); g.fillStyle = '#ffffff'; g.fill(); text(g, v.note || '', 0, -h / 2 - 220 * open + 110, { size: 44, font: FONTS.ui, weight: 900, color: '#2a2630' }); }
    poly(g, [[-w / 2, -h / 2], [0, open > 0 ? -h / 2 - 160 * open : 20], [w / 2, -h / 2]], shade('#f4efe4', -0.08));
    seg(g, [[-w / 2, h / 2], [-40, 0]], 3, '#d8d0c0'); seg(g, [[w / 2, h / 2], [40, 0]], 3, '#d8d0c0');
    text(g, v.label || 'ПРЕМИЯ', 0, h / 2 - 70, { size: 64, font: FONTS.title, weight: 700, color: '#c0453a', spacing: 6 });
    g.restore();
  },
  drops(g, t) {
    const cx = E.W / 2, cy = E.H * 0.5;
    glow(g, cx, cy, 600, '#9fe0ff', 0.18);
    rr(g, cx - 110, cy - 160, 220, 340, 40); g.fillStyle = '#e8f6fb'; g.fill(); rr(g, cx - 60, cy - 250, 120, 100, 20); g.fillStyle = '#3fd07a'; g.fill();
    rr(g, cx - 90, cy - 60, 180, 140, 14); g.fillStyle = '#ffffff'; g.fill();
    text(g, 'КАПЛИ', cx, cy - 20, { size: 46, font: FONTS.title, weight: 700, color: '#2a6a8a' });
    text(g, '490 руб.', cx, cy + 40, { size: 40, font: FONTS.ui, weight: 900, color: '#c0453a' });
  },
  stopwatch(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.53, r = 280, sec = (v.from ?? 0) + t * (v.speed ?? 30);
    glow(g, cx, cy, 700, '#ffd47e', 0.12);
    rr(g, cx - 40, cy - r - 70, 80, 50, 10); g.fillStyle = '#c9ccd4'; g.fill();
    circle(g, cx, cy, r + 24, '#c9ccd4'); circle(g, cx, cy, r, '#f4f1ea');
    for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2; const L = i % 5 ? 14 : 30; seg(g, [[cx + Math.sin(a) * (r - 10), cy - Math.cos(a) * (r - 10)], [cx + Math.sin(a) * (r - 10 - L), cy - Math.cos(a) * (r - 10 - L)]], i % 5 ? 3 : 6, '#2a2630'); }
    const a = (sec / 60) * Math.PI * 2; seg(g, [[cx, cy], [cx + Math.sin(a) * r * 0.82, cy - Math.cos(a) * r * 0.82]], 8, '#e04a3a'); circle(g, cx, cy, 16, '#2a2630');
    const mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
    text(g, `${mm}:${String(ss).padStart(2, '0')}`, cx, cy + r * 0.45, { size: 78, font: FONTS.ui, weight: 900, color: '#2a2630' });
  },
  calendar(g, t, v) {
    const cx = E.W / 2, cy = E.H * 0.5, w = 460, h = 520;
    rr(g, cx - w / 2, cy - h / 2, w, h, 18); g.fillStyle = '#f2ede4'; g.fill(); g.fillStyle = '#c0453a'; rr(g, cx - w / 2, cy - h / 2, w, 130, 18); g.fill(); g.fillRect(cx - w / 2, cy - h / 2 + 90, w, 40);
    const k = v.flip != null ? ease.out(prog(t, v.flip, v.flip + 0.5)) : 0;
    text(g, k > 0.5 ? String(v.to) : String(v.from), cx, cy + 60, { size: 170, font: FONTS.ui, weight: 900, color: '#2a2630', alpha: Math.abs(1 - 2 * k) * 0.9 + 0.1 });
    text(g, 'ГОД', cx, cy - h / 2 + 66, { size: 54, font: FONTS.title, weight: 700, color: '#ffffff', spacing: 8 });
  },
  cupTop(g, t) {
    const cx = E.W / 2, cy = E.H * 0.52, r = 260;
    circle(g, cx, cy, r + 70, '#f4efe4'); circle(g, cx, cy, r, '#f4efe4'); circle(g, cx, cy, r - 24, '#c08a5a'); circle(g, cx, cy, r - 60, '#d9a874');
    g.strokeStyle = '#f4e8d8'; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy + 10, 90, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(cx, cy + 60, 90, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    // отражение лица в кофе
    circle(g, cx + Math.sin(t) * 6, cy - 10, 60, alpha('#141414', 0.35));
  },
  hands(g, t) { // руки держат малыша
    const cx = E.W / 2, gy = E.H * 0.78;
    glow(g, cx, E.H * 0.45, 700, '#ffd59a', 0.2);
    seg(g, [[-200, E.H + 100], [cx - 180, gy - 120]], 90, CAST.max.color); seg(g, [[E.W + 200, E.H + 100], [cx + 180, gy - 120]], 90, CAST.max.color);
    circle(g, cx - 180, gy - 120, 34, '#0e0b12'); circle(g, cx + 180, gy - 120, 34, '#0e0b12');
  },
};

// ── схемы (синий «чертёж») для научного блока
const BP = {
  blink(g, t, v) { // глаз моргает, счётчик 15–20 раз в минуту
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W * 0.36, cy = E.H * 0.5;
    const ph = (t * 0.33) % 1, lid = ph < 0.08 ? 1 - Math.abs(ph / 0.04 - 1) : 0;
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, 240, 130 * (1 - lid), 0, 0, Math.PI * 2); g.stroke();
    if (lid < 0.8) { ring(g, cx, cy, 80 * (1 - lid), 6, c); circle(g, cx, cy, 34 * (1 - lid), c); }
    const n = Math.min(v.to ?? 20, Math.floor(t * 4.5) + 1);
    text(g, v.big || `${n}`, E.W * 0.72, cy - 30, { size: 170, font: FONTS.ui, weight: 900, color: gold, glow: 20, glowColor: alpha(gold, 0.5) });
    text(g, v.sub || 'РАЗ В МИНУТУ', E.W * 0.72, cy + 90, { size: 46, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  closed(g, t) { // 10% времени глаза закрыты
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
    const x0 = 260, x1 = E.W - 260, y = E.H * 0.5; const p = ease.inOut(prog(t, 0.3, 2.2));
    text(g, 'ВРЕМЯ БОДРСТВОВАНИЯ', x0, y - 110, { size: 40, font: FONTS.ui, weight: 900, color: c, align: 'left', spacing: 2 });
    rr(g, x0, y - 36, x1 - x0, 72, 36); g.fillStyle = alpha(c, 0.15); g.fill();
    rr(g, x0, y - 36, (x1 - x0) * 0.9 * p, 72, 36); g.fillStyle = alpha(c, 0.6); g.fill();
    rr(g, x0 + (x1 - x0) * 0.9, y - 36, (x1 - x0) * 0.1 * clamp((p - 0.95) * 20), 72, 36); g.fillStyle = gold; g.fill();
    text(g, 'ГЛАЗА ОТКРЫТЫ  90%', x0 + 30, y + 110, { size: 38, font: FONTS.ui, weight: 900, color: c, align: 'left' });
    text(g, '10%  ЗАКРЫТЫ', x1, y + 110, { size: 44, font: FONTS.ui, weight: 900, color: gold, align: 'right', glow: 14, glowColor: alpha(gold, 0.5), alpha: clamp((p - 0.9) * 10) });
  },
  edit(g, t) { // мозг вырезает кадры: плёнка, из которой выпадают тёмные кадры
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, y = E.H * 0.5, fw = 220;
    const off = (t * 160) % fw;
    for (let i = -2; i < 11; i++) { const x = i * fw - off; const dark = i % 4 === 2; const drop = dark ? ease.in(clamp(((t * 160 + x) % 900) / 900)) * 0 : 0;
      rr(g, x + 10, y - 110 + drop, fw - 20, 220, 10); g.fillStyle = dark ? '#05070d' : alpha(c, 0.18); g.fill(); g.strokeStyle = alpha(c, 0.7); g.lineWidth = 3; g.stroke();
      if (dark) { seg(g, [[x + 4, y - 140], [x + 4, y + 140]], 4, gold); seg(g, [[x + fw - 4, y - 140], [x + fw - 4, y + 140]], 4, gold); text(g, '✂', x + 4, y - 170, { size: 40, color: gold, font: FONTS.ui }); }
      else { circle(g, x + fw / 2, y - 20, 34, alpha(c, 0.8)); seg(g, [[x + fw / 2, y + 14], [x + fw / 2, y + 70]], 12, alpha(c, 0.8)); } }
    text(g, 'МОЗГ ВЫРЕЗАЕТ МОРГАНИЯ', E.W / 2, E.H * 0.2, { size: 52, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
  },
  years(g, t, v) { // каждое моргание = год: счётчик возраста
    UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, acc = S().ui.accent;
    const p = ease.inOut(prog(t, 0.4, (v.dur || 3) - 0.3)), age = Math.round(lerp(v.from ?? 21, v.to ?? 36, p));
    text(g, v.title || '1 МОРГАНИЕ = 1 ГОД', E.W / 2, E.H * 0.24, { size: 58, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    text(g, `${age}`, E.W / 2, E.H * 0.55, { size: 220, font: FONTS.ui, weight: 900, color: p > 0.5 ? acc : gold, glow: 24, glowColor: alpha(acc, 0.5) });
    text(g, v.sub || 'ЛЕТ ЗА ОДНУ МИНУТУ', E.W / 2, E.H * 0.75, { size: 44, font: FONTS.ui, weight: 900, color: c, spacing: 3 });
    UI.lineFigure(g, { x: E.W * 0.2, y: E.H * 0.72, s: 1.4 - 0.25 * p, pose: p > 0.6 ? POSES.sad : POSES.stand, color: alpha(c, 0.9) });
  },
};

// ── веки (моргание): открываются в начале и/или закрываются в конце кадра
function lids(g, k) { if (k <= 0) return; const h = (E.H / 2 + 40) * k;
  g.fillStyle = '#000'; g.beginPath(); g.moveTo(-10, -10); g.lineTo(E.W + 10, -10); g.lineTo(E.W + 10, h - 80 * k); g.quadraticCurveTo(E.W / 2, h + 120 * k, -10, h - 80 * k); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-10, E.H + 10); g.lineTo(E.W + 10, E.H + 10); g.lineTo(E.W + 10, E.H - h + 80 * k); g.quadraticCurveTo(E.W / 2, E.H - h - 120 * k, -10, E.H - h + 80 * k); g.closePath(); g.fill(); }

function drawUI(g, v, t, dur) {
  for (const u of v.ui || []) {
    const t0 = u.at ?? 0.2, tl = t - t0; if (tl < 0 || (u.until != null && t > u.until)) continue;
    const a = ease.out(clamp(tl / 0.35)) * clamp((dur - t) / 0.3);
    if (u.k === 'badge') UI.badge(g, { str: u.s, a, size: u.size || V(46, 52) });
    if (u.k === 'readout') UI.readout(g, { label: u.label, value: u.s, x: u.x ?? V(140, 90), y: u.y ?? E.H - V(170, 620), a });
    if (u.k === 'big') UI.bigLine(g, tl, { str: u.s, dur: dur - t0, y: u.y ?? E.H * 0.82, size: u.size || V(76, 70), color: u.color });
    if (u.k === 'title') UI.titleCard(g, tl, { lines: u.lines, dur: dur - t0, y: u.y ?? E.H * 0.42 });
    if (u.k === 'thought') { // мысль героя — курсивом, мягко
      const s = u.size || 64; text(g, u.s, u.x ?? E.W / 2, u.y ?? E.H * 0.15, { size: s, font: FONTS.serif, weight: 900, italic: true, color: S().ui.cream, alpha: a, glow: 18, glowColor: 'rgba(255,170,90,.5)' }); }
  }
}

function endScreen(g, t, v) {
  const ui = S().ui;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1b1426', '#2a1a2e', '#4a2a2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.9, E.W * 0.45, '#ff9a5a', 0.3);
  const a1 = ease.out(prog(t, 0.2, 0.8));
  (v.q || []).forEach((s, i) => text(g, s, E.W / 2, 130 + i * 78, { size: 58, font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' }));
  const sp = ease.outBack(prog(t, v.subAt ?? 0.6, (v.subAt ?? 0.6) + 0.5));
  if (sp > 0) { g.save(); g.translate(E.W / 2, 400); g.scale(sp, sp); rr(g, -210, -42, 420, 84, 42); g.fillStyle = '#e0302a'; g.fill(); text(g, 'ПОДПИСАТЬСЯ', 0, 2, { size: 38, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore(); }
  UI.bubble(g, E.W / 2 - 330, 400, { w: 110, h: 60 });
  const cast = [CAST.boss, CAST.egor, CAST.max, CAST.baby]; const n = cast.length, gap = 220, y0 = E.H - 150;
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: 1.2, facing: 1, outfit: of, pose: POSES.relaxed, expr: 'smile', alpha: k, rim: { color: '#ffb070', dir: [0, -1] } }); });
}

function render(g, t, info, v) {
  const dur = info.dur;
  if (v.end) { endScreen(g, t, v.end); return; }
  if (v.bp) { BP[v.bp.k](g, t, { ...v.bp, dur }); drawUI(g, v, t, dur); return; }
  const cam = camOf(v, t, dur);
  if (v.face || v.ins) {
    const bgCam = { z: (v.bgz ?? 1.5) * cam.z, x: (v.bgx ?? -150) + cam.x, y: v.bgy ?? -120 };
    let M = mood(v.so?.mood || 'day');
    blurLayer(g, v.blur ?? 12, (g) => { M = drawSet(g, v, t, bgCam).M; });
    veil(g, '#120a10', v.veil ?? 0.3);
    if (v.face) {
      const f = v.face, r = (f.r ?? V(300, 330)) * (cam.z);
      const talk = f.talk ? talkAmount(info.globalT, info.shot.start + (f.talk[0] ?? 0), info.shot.start + (f.talk[1] ?? 99)) : 0;
      const [sx, sy] = v.cam?.shake ? shake(t, v.cam.shake, 9) : [0, 0];
      bigFace(g, E.W / 2 + (f.x ?? 0) + sx + (cam.x || 0) * 0.3, E.H * (f.y ?? 0.6) + sy, r, { outfit: { ...(CAST[f.w] || CAST.max), ...(f.of || {}) }, expr: at(f.e || 'neutral', t), talk, look: f.look,
        rimColor: M.rim, rimSide: f.side ?? -1, blink: f.noblink ? false : (t % 3.1) > 2.98, tilt: f.tilt });
      if (talk > 0) FX.rings(g, E.W / 2 + (f.x ?? 0), E.H * (f.y ?? 0.6), t, { count: 3, r0: r * 1.1, r1: r * 1.6, color: '#fff3e0', a: 0.3 });
      if (f.tear) { const ty = E.H * (f.y ?? 0.6) - r * 0.05 + ((t * 120) % (r * 0.9)); g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(E.W / 2 + (f.x ?? 0) + r * 0.36, ty, r * 0.05, r * 0.09, 0, 0, 7); g.fill(); }
    } else {
      g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 - (cam.x || 0) * 0.2, -E.H / 2); INS[v.ins.k](g, t, v.ins); g.restore();
    }
  } else if (v.split) {
    for (let side = 0; side < 2; side++) {
      const sv = v.split[side]; g.save(); g.beginPath(); g.rect(side * E.W / 2, 0, E.W / 2, E.H); g.clip(); g.translate(side ? E.W / 4 : -E.W / 4, 0);
      const { GY, CX, M } = drawSet(g, sv, t, camOf(sv, t, dur));
      layer(g, camOf(sv, t, dur), 1, (g) => { drawProps(g, sv, t, GY, CX, M); drawChars(g, sv, t, dur, info, GY, CX, M); });
      g.restore();
      text(g, sv.label || '', side * E.W / 2 + E.W / 4, V(110, 200), { size: V(56, 64), color: S().ui.cream, glow: 16, glowColor: 'rgba(255,160,80,.6)', spacing: 4 });
    }
    g.fillStyle = '#f4efe6'; g.fillRect(E.W / 2 - 3, 0, 6, E.H);
  } else {
    const { GY, CX, M } = drawSet(g, v, t, cam);
    layer(g, cam, 1, (g) => { drawProps(g, v, t, GY, CX, M); drawChars(g, v, t, dur, info, GY, CX, M); });
    if (v.fg) blurLayer(g, 10, (g) => { g.fillStyle = alpha(shade(M.dark, -0.3), 0.85); rr(g, v.fg === 'right' ? E.W - 260 : -60, E.H * 0.35, 320, E.H * 0.8, 120); g.fill(); }, cam, 1.6);
  }
  // атмосфера
  const fx = v.fx || {};
  if (fx.dust !== false) FX.dust(g, t, { count: 34, a: 0.3 });
  if (fx.drops) FX.drops(g, t, { count: 50, color: '#d8e4ff', rMax: 8, drift: 2 });
  if (fx.rain) FX.rain(g, t);
  if (fx.freeze) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  if (fx.warm) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,170,80,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  if (fx.rings) FX.rings(g, E.W / 2 + (fx.rings[0] || 0), E.H * (fx.rings[1] || 0.45), t, { count: 3, r0: 80, r1: 520, speed: 0.6, color: '#e8f0ff', a: 0.3 });
  if (fx.speed) FX.speedLines(g, t, { count: 50, a: 0.25 });
  drawUI(g, v, t, dur);
  // веки
  if (v.lid === 'open' || v.lid === 'both') lids(g, 1 - ease.out(prog(t, 0.05, 0.7)));
  if (v.lid === 'close' || v.lid === 'both') lids(g, ease.in(prog(t, dur - 0.55, dur - 0.05)));
  if (v.lid === 'blink') { const m = dur * (v.lidAt ?? 0.55); lids(g, t < m ? ease.in(prog(t, m - 0.35, m)) : 1 - ease.out(prog(t, m + 0.15, m + 0.6))); }
}

// регистрируем все кадры из раскадровки, у которых есть params.v (кадры со своим файлом — не трогаем)
for (const s of E.shots) {
  if (!s.params?.v || getShot(s.id)) continue;
  registerShot(s.id, { draw(g, t, info) { render(g, t, info, s.params.v); } });
}
