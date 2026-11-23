// sets/places.js — остальные декорации: кофейня, квартира Егора, парк, аптека, подъезд ночью,
// сцена (свадебная речь) и «пустота» для внутренних монологов. Всё якорится к GY и CX.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const ground = () => E.H * V(0.8, 0.68);

function floor(g, M, GY, lines = true) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
  if (lines) FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.22), 0.07);
}

// ── кофейня напротив салона: тёплый зал, большие окна на улицу, стойка, столики
export function cafe(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  const wall = shade(M.wall, -0.1), frame = shade(M.wall, -0.55);
  layer(g, cam, 0.15, (g) => {
    backdrop(g, M.sky);
    FX.skyline(g, { x: -E.W, y: GY - V(300, 600), w: E.W * 3, maxH: V(420, 700), color: mix(M.sky[0], frame, 0.6), windowColor: alpha(M.practical, 0.5), lit: 0.3, seed: 12 });
  });
  layer(g, cam, 0.5, (g) => {
    const top = -E.H, wt = GY - V(700, 1100), wb = GY - V(250, 500);
    g.save(); g.beginPath(); g.rect(-E.W * 2, top, E.W * 5, GY - top);
    for (let i = -3; i <= 3; i++) { const x = CX + i * 620 - 260; g.rect(x + 520, wt, -520, wb - wt); }
    g.fillStyle = linGrad(g, 0, wt, 0, GY, [wall, shade(wall, -0.3)]); g.fill('evenodd'); g.restore();
    for (let i = -3; i <= 3; i++) {
      const x = CX + i * 620 - 260;
      FX.windowFrame(g, { x, y: wt, w: 520, h: wb - wt, cols: 3, frame, bar: 10 }, () => {});
      glow(g, x + 260, wb - 40, 260, M.practical, 0.06);
    }
    // лампы-подвесы
    for (let i = -3; i <= 3; i++) { const lx = CX + i * 620 + 50; seg(g, [[lx, top], [lx, wt - 60]], 3, frame); poly(g, [[lx - 40, wt - 20], [lx + 40, wt - 20], [lx + 22, wt - 62], [lx - 22, wt - 62]], shade(M.dark, -0.2)); glow(g, lx, wt - 10, 200, M.practical, 0.45); }
    // стойка с кофемашиной
    const cx0 = CX + (o.counterX ?? 700);
    FX.counter(g, { x: cx0 - 260, y: GY, w: 520, h: 120, color: shade(M.wall, -0.45), top: '#b98a5c', doors: 5 });
    rr(g, cx0 - 60, GY - 210, 120, 82, 8); g.fillStyle = '#2a2a30'; g.fill(); circle(g, cx0, GY - 170, 14, '#c9c9cf');
    text(g, 'КОФЕ', cx0, wb + V(70, 90), { size: 54, font: FONTS.title, weight: 700, color: M.practical, glow: 18, glowColor: alpha(M.practical, 0.6), spacing: 6 });
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX, GY + 20, 600, 60, M.practical, 0.18); });
  return { GY, CX, M };
}
// столик кофейни; возвращает высоту столешницы
export function table(g, x, GY, o = {}) {
  const c = o.color || '#1e1418', top = GY - 140;
  seg(g, [[x, top], [x, GY - 6]], 10, c); seg(g, [[x - 50, GY - 4], [x + 50, GY - 4]], 8, c);
  rr(g, x - 120, top - 12, 240, 16, 8); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(255,210,150,.35)'; g.fillRect(x - 114, top - 12, 228, 3);
  return top - 12;
}
export function cup(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -14, -30, 28, 30, 5); g.fillStyle = '#f2ece4'; g.fill(); seg(g, [[14, -24], [22, -18], [14, -10]], 4, '#f2ece4');
  g.fillStyle = '#6a4028'; g.fillRect(-12, -30, 24, 5); g.restore();
}

// ── квартира Егора: светлая стена, окно с дневным небом, диван, дверь
export function room(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  const wall = shade(M.wall, 0.05);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(wall, -0.1), wall, shade(wall, -0.25)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    const wx = CX + V(160, 60), wy = GY - V(620, 1000), ww = 460, wh = 340;
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(wall, -0.5), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.sun(g, x + w * 0.7, y + h * 0.35, 40, '#fff6e2', M.key, 4);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: alpha(shade(wall, -0.3), 0.8), windowColor: alpha(M.practical, 0.6), seed: 3 });
    });
    FX.godRays(g, wx + ww * 0.7, wy + wh * 0.35, { count: 8, angle: Math.PI * 0.62, spread: 0.6, len: 900, a: 0.05, t });
    // дверь
    const dx = CX + (o.doorX ?? -620);
    FX.door(g, { x: dx, y: GY, w: 150, h: V(360, 420), color: shade(M.wall, -0.35), open: o.doorOpen ?? 0, light: '#ffe9c4' });
    circle(g, dx + 125, GY - 190, 7, '#e8c070');
    // картина и полка
    rr(g, CX - 240, GY - V(560, 900), 170, 120, 4); g.fillStyle = shade(wall, -0.45); g.fill(); g.fillStyle = mix(M.sky[1], wall, 0.3); g.fillRect(CX - 228, GY - V(548, 888), 146, 96);
  });
  layer(g, cam, 0.8, (g) => {
    // диван
    const sx = CX + (o.sofaX ?? 380), c = '#5a5f9a';
    rr(g, sx - 220, GY - 170, 440, 110, 30); g.fillStyle = shade(c, -0.15); g.fill();
    rr(g, sx - 240, GY - 100, 480, 80, 24); g.fillStyle = c; g.fill();
    for (const ax of [-240, 200]) { rr(g, sx + ax, GY - 140, 40, 120, 18); g.fillStyle = shade(c, -0.1); g.fill(); }
    // ковёр
    g.fillStyle = alpha('#d9a066', 0.35); g.beginPath(); g.ellipse(CX - 80, GY + 40, 420, 46, 0, 0, Math.PI * 2); g.fill();
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX + 200, GY + 30, 500, 60, M.key, 0.16); });
  return { GY, CX, M };
}

// ── парк на закате: скамейка, деревья, фонарь, дорожка
export function park(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, CX + V(520, 200), GY - V(420, 800), 70, '#fff3dc', M.key, 5);
    FX.clouds(g, { y: GY - V(780, 1300), h: 160, color: '#ffe7c7', a: 0.14, seed: 5 });
  });
  layer(g, cam, 0.3, (g) => {
    FX.skyline(g, { x: -E.W, y: GY - V(120, 260), w: E.W * 3, maxH: V(300, 500), color: mix(M.sky[1], M.dark, 0.6), windowColor: alpha(M.practical, 0.6), lit: 0.2, seed: 22 });
    FX.hills(g, { y: GY - 60, amp: 40, color: shade(M.grass, -0.35), seed: 4 });
  });
  layer(g, cam, 0.6, (g) => {
    for (let i = -6; i <= 6; i++) FX.tree(g, CX + i * 330 + (i % 2) * 60, GY - 40, 1.4 + (i % 3) * 0.2, shade(M.grass, -0.5));
    FX.lampPost(g, CX + (o.lampX ?? -520), GY - 30, 340, { light: M.practical, on: true, a: 0.2 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 400, [shade(M.grass, -0.2), shade(M.grass, -0.55)]); g.fillRect(-E.W * 2, GY - 40, E.W * 5, E.H * 2);
    g.fillStyle = alpha(shade(M.road, 0.3), 0.6); g.fillRect(-E.W * 2, GY - 6, E.W * 5, 34);
    FX.pool(g, CX + 200, GY + 10, 700, 60, M.key, 0.14);
  });
  return { GY, CX, M };
}
export function bench(g, x, GY, s = 1, color = '#3a2a26') {
  const w = 300 * s;
  for (const dx of [-w / 2 + 20, w / 2 - 20]) seg(g, [[x + dx, GY], [x + dx, GY - 70 * s]], 8 * s, shade(color, -0.3));
  rr(g, x - w / 2, GY - 78 * s, w, 14 * s, 4); g.fillStyle = color; g.fill();
  rr(g, x - w / 2, GY - 140 * s, w, 12 * s, 4); g.fill(); rr(g, x - w / 2, GY - 112 * s, w, 12 * s, 4); g.fill();
  for (const dx of [-w / 2 + 20, w / 2 - 20]) seg(g, [[x + dx, GY - 78 * s], [x + dx, GY - 146 * s]], 7 * s, shade(color, -0.3));
}

// ── аптека: холодный свет, стеллажи, зелёный крест
export function pharmacy(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.wall, -0.2), M.wall, shade(M.wall, -0.3)]); g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    for (let i = -3; i <= 3; i++) {
      const x = CX + i * 420 - 170, y = GY - V(620, 900);
      rr(g, x, y, 340, 520, 6); g.fillStyle = shade(M.wall, -0.45); g.fill();
      for (let r = 0; r < 4; r++) { g.fillStyle = shade(M.wall, -0.2); g.fillRect(x + 10, y + 120 + r * 120, 320, 8);
        for (let k = 0; k < 7; k++) { const c = ['#e8eef6', '#9fe0ff', '#f2c21a', '#ffffff', '#f29ac0'][(((i * 7 + r * 3 + k) % 5) + 5) % 5]; rr(g, x + 22 + k * 44, y + 70 + r * 120, 30, 50, 5); g.fillStyle = alpha(c, 0.8); g.fill(); } }
    }
    const kx = CX + (o.crossX ?? -60), ky = GY - V(760, 1060);
    g.fillStyle = '#3fd07a'; g.fillRect(kx - 22, ky - 70, 44, 140); g.fillRect(kx - 70, ky - 22, 140, 44); glow(g, kx, ky, 220, '#3fd07a', 0.45);
    text(g, 'АПТЕКА', kx + 230, ky, { size: 56, font: FONTS.title, weight: 700, color: '#d8ffe8', glow: 16, glowColor: 'rgba(63,208,122,.7)', spacing: 6 });
    FX.counter(g, { x: CX - 500, y: GY, w: 1000, h: 130, color: shade(M.wall, -0.5), top: '#e8eef6', doors: 6 });
  });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY); FX.pool(g, CX, GY + 20, 600, 60, M.practical, 0.18); });
  return { GY, CX, M };
}

// ── ночной подъезд: тёмная улица, фасады, один тусклый фонарь
export function entrance(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.stars(g, t); FX.moon(g, CX + 560, GY - V(720, 1200), 34); });
  layer(g, cam, 0.5, (g) => {
    FX.facade(g, { x: CX - 1500, y: GY, w: 3000, h: V(900, 1400), color: shade(M.wall, -0.2), win: M.practical, dark: shade(M.dark, -0.2), cols: 14, rows: 5, lit: 0.25, seed: 9 });
    FX.door(g, { x: CX - 90, y: GY, w: 180, h: V(300, 360), color: '#1a1c2c', open: 0.12, light: '#3a3f66' });
    g.fillStyle = '#0c0d18'; g.fillRect(CX - 140, GY - V(330, 390), 280, 20);
  });
  layer(g, cam, 0.85, (g) => { FX.lampPost(g, CX + 380, GY, 360, { light: '#ffb860', on: true, a: 0.16 }); });
  layer(g, cam, 0.9, (g) => { floor(g, M, GY, false); FX.pool(g, CX + 380, GY + 10, 260, 40, '#ffb860', 0.2); });
  return { GY, CX, M };
}

// ── сцена: свадебная речь «того» Максима
export function stage(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#1c1422'; g.fillRect(-E.W * 2, -E.H, E.W * 5, GY + E.H);
    for (let i = -14; i <= 14; i++) { const x = CX + i * 90; g.fillStyle = linGrad(g, x, 0, x + 90, 0, ['#7a2230', '#a83240', '#7a2230']); if (Math.abs(i) > 3) g.fillRect(x, -E.H, 90, GY + E.H); }
    g.fillStyle = '#8a2a36'; g.fillRect(-E.W * 2, -E.H, E.W * 5, E.H + V(140, 300));
    for (let k = 0; k < 9; k++) { const x = CX - 600 + k * 150; circle(g, x, V(150, 310), 10, '#ffe7b0'); glow(g, x, V(150, 310), 60, '#ffe7b0', 0.5); }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#5a3a2a', '#2a1a14']); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.25)', 0.08);
    FX.lightCone(g, CX, -100, { angle: Math.PI / 2, spread: 0.22, len: GY + 160, color: '#fff1d0', a: 0.16 });
    FX.pool(g, CX, GY + 10, 300, 40, '#fff1d0', 0.4);
  });
  return { GY, CX, M };
}

// ── «пустота»: тёмный градиент с мягким светом — для мыслей и крупных планов
export function void_(g, t, cam, o = {}) {
  const M = mood(o.mood || 'void'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => {
    backdrop(g, o.colors || M.sky);
    glow(g, CX + (o.lightX ?? 0), E.H * 0.4, 900, o.light || M.rim, 0.12);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = alpha('#000000', 0.25); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2); FX.pool(g, CX, GY + 10, 420, 50, o.light || M.rim, 0.18); });
  return { GY, CX, M };
}
