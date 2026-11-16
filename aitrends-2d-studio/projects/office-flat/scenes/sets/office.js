// sets/office.js — flat open-plan office: tall window band with a pale winter skyline, concrete pillars,
// light grey-blue wall, desks with blue monitors, striped dark floor, gentle snow. Anchored to GY / CX.
import { E, layer, linGrad, rr, seg, circle, alpha, rng } from '/engine/core.js';

export const OFFICE = {
  wall: '#8b91a4', wallLow: '#8d93a6', pillar: '#7c8295', pillarEdge: '#868c9f', frame: '#3d4357', sill: '#868ca0',
  sky: ['#9fb0c8', '#c4cdd9', '#dcdcd8'], bldg: '#717b93', bldgFar: '#8792a8', bldgWin: '#9ca7bd',
  desk: '#e2d2b0', deskEdge: '#c9b893', leg: '#2d3140', mon: '#1c1f2a', screen: '#5f9ed2', screenHi: '#78b2e0',
  floor: '#6c6b78', floorLine: '#5e5d6a', floorTop: '#7a7986', snow: '#ffffff',
};
export const officeGround = () => E.H * 0.765;

function skyline(g, x0, w, base, seed, col, win, maxH) {
  const r = rng(seed); let x = x0;
  while (x < x0 + w) {
    const bw = 40 + r() * 70, bh = 50 + r() * maxH, top = base - bh;
    g.fillStyle = col; g.fillRect(x, top, bw, bh + 2);
    if (r() < 0.35) g.fillRect(x + bw * 0.45, top - 22 - r() * 20, 3, 30);            // antenna
    g.fillStyle = win;
    for (let yy = top + 12; yy < base - 10; yy += 16) for (let xx = x + 8; xx < x + bw - 8; xx += 14) if (r() < 0.55) g.fillRect(xx, yy, 4, 5);
    x += bw + 4 + r() * 18;
  }
}

export function office(g, t, cam) {
  const C = OFFICE, GY = officeGround(), CX = E.W / 2;
  const WIN_TOP = -40, WIN_BOT = E.H * 0.31;
  layer(g, cam, 0.9, (g) => {
    // wall
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [C.wall, C.wallLow]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 2);
    // window bays between pillars
    const pillars = [-490, 130, 720, 1310, 1895, 2480];
    for (let i = 0; i < pillars.length - 1; i++) {
      const x0 = pillars[i] + 60, x1 = pillars[i + 1] - 60;
      g.save(); g.beginPath(); g.rect(x0, WIN_TOP, x1 - x0, WIN_BOT - WIN_TOP); g.clip();
      g.fillStyle = linGrad(g, 0, WIN_TOP, 0, WIN_BOT, C.sky); g.fillRect(x0, WIN_TOP, x1 - x0, WIN_BOT - WIN_TOP);
      skyline(g, x0 - 40, x1 - x0 + 80, WIN_BOT, 40 + i * 7, C.bldgFar, alpha('#c9d1de', 0.5), 150);
      skyline(g, x0 - 20, x1 - x0 + 60, WIN_BOT, 11 + i * 13, C.bldg, alpha(C.bldgWin, 0.9), 230);
      g.restore();
      // frame + mullions
      g.strokeStyle = C.frame; g.lineWidth = 10; g.strokeRect(x0, WIN_TOP, x1 - x0, WIN_BOT - WIN_TOP);
      const m = (x0 + x1) / 2; seg(g, [[m, WIN_TOP], [m, WIN_BOT]], 9, C.frame, 'butt');
      g.fillStyle = C.sill; g.fillRect(x0 - 8, WIN_BOT + 4, x1 - x0 + 16, 7);
    }
    // pillars
    for (const p of pillars) { g.fillStyle = C.pillar; g.fillRect(p - 58, -E.H, 116, GY + E.H); g.fillStyle = C.pillarEdge; g.fillRect(p - 58, -E.H, 8, GY + E.H); }
  });
  layer(g, cam, 0.95, (g) => {
    // desks with monitors
    for (const dx of [-1090, -520, 0, 520, 1090, 1610]) {
      const x = CX + dx, top = E.H * 0.585, w = 280;
      seg(g, [[x - w / 2 + 22, top], [x - w / 2 + 22, GY + 2]], 6, C.leg, 'butt');
      seg(g, [[x + w / 2 - 22, top], [x + w / 2 - 22, GY + 2]], 6, C.leg, 'butt');
      rr(g, x - w / 2, top - 9, w, 12, 6); g.fillStyle = C.desk; g.fill();
      g.fillStyle = C.deskEdge; g.fillRect(x - w / 2 + 6, top, w - 12, 3);
      seg(g, [[x, top - 9], [x, top - 34]], 5, C.mon, 'butt');
      rr(g, x - 60, top - 120, 120, 88, 6); g.fillStyle = C.mon; g.fill();
      g.fillStyle = C.screen; g.fillRect(x - 54, top - 114, 108, 76);
      g.fillStyle = alpha(C.screenHi, 0.6); g.beginPath(); g.moveTo(x - 54, top - 114); g.lineTo(x - 14, top - 114); g.lineTo(x - 54, top - 70); g.closePath(); g.fill();
    }
  });
  layer(g, cam, 1.0, (g) => {
    // floor with planks
    g.fillStyle = C.floor; g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    g.fillStyle = C.floorTop; g.fillRect(-E.W, GY, E.W * 3, 5);
    for (let y = GY + 20, k = 0; y < E.H + 400; y += 16 + k * 1.5, k++) { g.fillStyle = C.floorLine; g.fillRect(-E.W, y, E.W * 3, 3); }
  });
  return { GY, CX };
}

// soft drifting snow / dust specks over the whole frame (screen space)
export function snow(g, t, o = {}) {
  const { count = 70, seed = 9 } = o, r = rng(seed);
  for (let i = 0; i < count; i++) {
    const sp = 0.4 + r(), x0 = r() * E.W, y0 = r() * E.H, rad = 1.6 + r() * 3.2, a = 0.25 + r() * 0.45;
    const x = ((x0 + Math.sin(t * 0.7 * sp + i) * 26 + t * 8) % E.W + E.W) % E.W, y = (y0 + t * 30 * sp) % (E.H + 10);
    circle(g, x, y, rad, alpha(OFFICE.snow, a));
  }
}
