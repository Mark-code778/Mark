// sets/salon.js — автосалон на Кутузовском (по референсу): большие окна с городом, колонны,
// ряд столов с мониторами, дощатый пол, машина в зале, часы над кассой, экран с ценой.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const salonGround = () => E.H * V(0.8, 0.68);

// машина в профиль (смотрит вправо при dir=1)
export function car(g, x, GY, o = {}) {
  const { color = '#9aa0aa', s = 1, dir = 1, M } = o;
  g.save(); g.translate(x, GY); g.scale(dir * s, s);
  const body = shade(color, -0.05), dark = shade(color, -0.35), hi = shade(color, 0.25);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 4, 300, 18, 0, 0, Math.PI * 2); g.fill();
  // кузов
  g.fillStyle = body; g.beginPath(); g.moveTo(-290, -40); g.lineTo(-290, -110); g.quadraticCurveTo(-280, -138, -230, -142);
  g.lineTo(-150, -146); g.lineTo(-90, -222); g.quadraticCurveTo(-70, -238, -30, -238); g.lineTo(110, -238); g.quadraticCurveTo(150, -236, 175, -205);
  g.lineTo(215, -150); g.lineTo(270, -138); g.quadraticCurveTo(300, -128, 300, -96); g.lineTo(300, -40); g.closePath(); g.fill();
  // стёкла
  g.fillStyle = M ? mix(M.sky[0], '#0f1420', 0.5) : '#2a3448';
  g.beginPath(); g.moveTo(-132, -150); g.lineTo(-80, -214); g.lineTo(10, -214); g.lineTo(10, -150); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(26, -150); g.lineTo(26, -214); g.lineTo(108, -214); g.quadraticCurveTo(140, -212, 158, -186); g.lineTo(186, -150); g.closePath(); g.fill();
  g.fillStyle = alpha('#ffffff', 0.12); g.beginPath(); g.moveTo(-70, -210); g.lineTo(-40, -210); g.lineTo(-90, -154); g.lineTo(-118, -154); g.closePath(); g.fill();
  // блик по кузову и молдинги
  seg(g, [[-280, -112], [290, -112]], 3, alpha(hi, 0.7)); seg(g, [[-150, -90], [210, -90]], 2, alpha(dark, 0.6));
  rr(g, 280, -122, 18, 14, 5); g.fillStyle = '#fff1c4'; g.fill(); rr(g, -292, -118, 12, 14, 4); g.fillStyle = '#d64a3a'; g.fill();
  for (const wx of [-185, 185]) { circle(g, wx, -40, 52, '#121218'); circle(g, wx, -40, 26, '#8a8e98'); circle(g, wx, -40, 9, '#2a2c34'); }
  g.restore();
}

export function salon(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = salonGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.12), wallDark = shade(M.wall, -0.4), frame = shade(M.wall, -0.55);
  // небо и город за окнами
  layer(g, cam, 0.15, (g) => {
    backdrop(g, M.sky);
    FX.skyline(g, { x: -E.W, y: GY - V(210, 520), w: E.W * 3, minH: 120, maxH: V(430, 700), color: mix(M.sky[0], wallDark, 0.55), windowColor: alpha(M.practical, 0.35), lit: o.night ? 0.5 : 0.12, seed: 31 });
    FX.skyline(g, { x: -E.W, y: GY - V(140, 420), w: E.W * 3, minH: 80, maxH: V(300, 520), color: mix(M.sky[0], wallDark, 0.75), windowColor: alpha(M.practical, 0.5), lit: o.night ? 0.6 : 0.18, seed: 7 });
  });
  // стена с окнами и колоннами
  layer(g, cam, 0.5, (g) => {
    const top = -E.H, winTop = GY - V(820, 1260), winBot = GY - V(430, 700);
    g.save(); g.beginPath(); g.rect(-E.W * 2, top, E.W * 5, GY - top + 4);
    for (let i = -4; i <= 4; i++) { const wx = CX + i * 560 - 230; g.rect(wx + 460, winTop, -460, winBot - winTop); }
    g.fillStyle = linGrad(g, 0, winTop, 0, GY, [shade(wall, 0.05), wall, wallDark]); g.fill('evenodd'); g.restore();
    for (let i = -4; i <= 4; i++) {
      const wx = CX + i * 560 - 230, ww = 460;
      g.strokeStyle = frame; g.lineWidth = 12; g.strokeRect(wx, winTop, ww, winBot - winTop);
      g.fillStyle = frame; g.fillRect(wx + ww / 2 - 4, winTop, 8, winBot - winTop);
      g.fillStyle = alpha('#ffffff', 0.05); g.fillRect(wx + 20, winTop + 10, 40, winBot - winTop - 20);
      // колонна между окнами
      g.fillStyle = linGrad(g, wx - 100, 0, wx - 50, 0, [shade(wall, -0.18), shade(wall, -0.08)]); g.fillRect(wx - 100, top, 64, GY - top);
    }
    g.fillStyle = shade(wall, -0.3); g.fillRect(-E.W * 2, GY - 26, E.W * 5, 26);
    // часы над кассой
    FX.clock(g, CX + (o.clockX ?? -420), winBot + V(130, 160), 40, o.clockTime ?? (10 * 3600 + 17 * 60 + t * 0.5), { face: '#efe9df' });
    // экран с ценой
    if (o.price) {
      const sx = CX + (o.priceX ?? 380), sy = winBot + V(70, 90), sw = 300, sh = 150;
      FX.screen(g, { x: sx - sw / 2, y: sy, w: sw, h: sh, bg: '#141a28', glowC: '#9fc8ff', a: 0.18 }, (g, x, y, w, h) => {
        text(g, o.price[0], x + w / 2, y + h * 0.38, { size: 44, font: FONTS.ui, weight: 900, color: '#ffd47e' });
        if (o.price[1]) text(g, o.price[1], x + w / 2, y + h * 0.72, { size: 26, font: FONTS.ui, weight: 800, color: '#cfd8ea', spacing: 2 });
      });
    }
    // календарь
    if (o.calendar) { const kx = CX + (o.calX ?? -700), ky = winBot + V(90, 120); rr(g, kx - 50, ky, 100, 120, 6); g.fillStyle = '#f2ede4'; g.fill(); g.fillStyle = '#c0453a'; g.fillRect(kx - 50, ky, 100, 26); text(g, String(o.calendar), kx, ky + 74, { size: 40, font: FONTS.ui, weight: 900, color: '#2a2630' }); }
  });
  // ряд столов с мониторами
  layer(g, cam, 0.75, (g) => {
    for (let i = -3; i <= 3; i++) {
      const dx = CX + i * 520 + 30, dy = GY - 6;
      seg(g, [[dx - 110, dy], [dx - 110, dy - 100]], 5, shade(M.dark, -0.2)); seg(g, [[dx + 110, dy], [dx + 110, dy - 100]], 5, shade(M.dark, -0.2));
      rr(g, dx - 128, dy - 108, 256, 10, 4); g.fillStyle = '#d9c8a8'; g.fill();
      seg(g, [[dx, dy - 108], [dx, dy - 138]], 5, '#20232c'); seg(g, [[dx - 24, dy - 108], [dx + 24, dy - 108]], 5, '#20232c');
      rr(g, dx - 56, dy - 214, 112, 78, 5); g.fillStyle = '#1c2029'; g.fill(); g.fillStyle = linGrad(g, 0, dy - 208, 0, dy - 142, ['#6ab0e8', '#3d7fc0']); g.fillRect(dx - 49, dy - 207, 98, 64);
      glow(g, dx, dy - 175, 90, '#7fc0ff', 0.08);
    }
  });
  // пол-доски
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.05), shade(M.dark, -0.1)]); g.fillRect(-E.W * 2, GY, E.W * 5, E.H * 2);
    FX.floorLines(g, GY, GY + 700, alpha('#000000', 0.22), 0.07);
    FX.pool(g, CX, GY + 30, 700, 70, M.sky[1] || M.key, 0.1);
  });
  if (o.car) layer(g, cam, 0.95, (g) => car(g, CX + (o.carX ?? 480), GY + 8, { color: o.car, s: o.carS ?? 0.95, dir: o.carDir ?? -1, M }));
  return { GY, CX, M };
}
