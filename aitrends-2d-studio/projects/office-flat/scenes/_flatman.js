// _flatman.js — flat-vector stickman in the "office" look (black round head with a thin cream edge,
// full-colour clothes on thick rounded limbs, black hands and shoes, white minimal face).
// Local space: feet at (0,0), up is -y, facing +x (f = -1 mirrors). Height at s = 1 ≈ 550 logical px.
import { S, seg, circle, ring, rr, shade, alpha } from '/engine/core.js';

export const EDGE = '#f4ead6';            // the cream edge light along the top of every shape
export const OUTFITS = {
  hoodie: { top: 'hoodie', color: '#e05a2b', legs: '#34507e', hood: true },
  suit:   { top: 'suit', color: '#4a4c57', legs: '#2a2932', shirt: '#f2f0ea', tie: '#141418' },
};
// arm poses: shoulder-relative elbow + hand points (facing +x)
export const ARMS = {
  down:     { el: [6, 82], ha: [10, 160] },
  fistUp:   { el: [30, 82], ha: [72, 46] },     // forearm raised forward (arguing)
  pointFwd: { el: [70, 8], ha: [140, 16] },     // straight arm toward the other person
  shrug:    { el: [-28, 70], ha: [16, 70] },
  hip:      { el: [-30, 70], ha: [-4, 126] },
};
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const blendArm = (a, b, k) => ({ el: lerp2(a.el, b.el, k), ha: lerp2(a.ha, b.ha, k) });

export function drawFlat(g, o) {
  const s = o.s ?? 1, f = o.f ?? 1, of = o.outfit, t = o.t || 0, ph = o.seed || 0;
  const breath = Math.sin(t * 2.2 + ph) * 2.2;
  const ink = S().ink;
  g.save(); g.translate(o.x, o.y);
  // contact shadow
  g.fillStyle = 'rgba(40,40,52,.35)'; g.beginPath(); g.ellipse(0, 4 * s, 66 * s, 9 * s, 0, 0, Math.PI * 2); g.fill();
  g.scale(f * s, s);
  const HIP = [0, -250], SH = [4, -425 + breath], HEAD = [8 + (o.lean || 0), -500 + breath * 1.1];
  const legF = { k: [16, -125], ft: [18, -14] }, legB = { k: [-12, -125], ft: [-20, -14] };
  const armF = o.armF || ARMS.down, armB = o.armB || ARMS.down;
  const abs = (a) => ({ el: [SH[0] + a.el[0], SH[1] + a.el[1]], ha: [SH[0] + a.ha[0], SH[1] + a.ha[1]] });
  const aF = abs(armF), aB = abs(armB);
  const sleeve = of.color, sleeveB = shade(of.color, -0.22);

  // pass 0: cream edge = whole silhouette nudged up, pass 1: real colours
  for (const pass of [0, 1]) {
    const E0 = pass === 0, dy = E0 ? -5 : 0, grow = E0 ? 2.5 : 0;
    const col = (c) => (E0 ? EDGE : c);
    g.save(); g.translate(E0 ? -1.5 : 0, dy);
    // far arm
    seg(g, [SH, aB.el, aB.ha], 28 + grow, col(sleeveB));
    circle(g, aB.ha[0], aB.ha[1], 14 + grow * 0.5, col(ink));
    // legs (far then near) + shoes
    for (const [L, c] of [[legB, shade(of.legs, -0.25)], [legF, of.legs]]) {
      seg(g, [[HIP[0] + (L === legF ? 12 : -12), HIP[1]], L.k, L.ft], 32 + grow, col(c));
      seg(g, [[L.ft[0] - 6, -10], [L.ft[0] + 34, -10]], 24 + grow, col(L === legF ? ink : '#1d1d24'));
    }
    // hood bunched behind the neck
    if (of.hood) { g.fillStyle = col(shade(of.color, -0.12)); g.beginPath(); g.ellipse(SH[0] - 28, SH[1] - 8, 30 + grow, 24 + grow, -0.4, 0, Math.PI * 2); g.fill(); }
    // torso
    const tw = 36, top = SH[1] - 14, bot = HIP[1] + (of.top === 'suit' ? 4 : 10);
    g.fillStyle = col(of.color); g.beginPath();
    g.moveTo(SH[0] - tw - grow, top + 18); g.quadraticCurveTo(SH[0] - tw, top - grow, SH[0] - tw + 22, top - grow);
    g.lineTo(SH[0] + tw - 18, top - grow); g.quadraticCurveTo(SH[0] + tw + grow, top - grow, SH[0] + tw + grow, top + 22);
    g.lineTo(HIP[0] + tw + 2 + grow, bot); g.lineTo(HIP[0] - tw - 2 - grow, bot); g.closePath(); g.fill();
    if (!E0) {
      if (of.top === 'hoodie') { g.fillStyle = shade(of.color, -0.18); g.fillRect(HIP[0] - tw - 2, bot - 14, tw * 2 + 4, 14); }
      if (of.top === 'suit') {
        g.fillStyle = of.shirt; g.beginPath(); g.moveTo(SH[0] + 10, top + 2); g.lineTo(SH[0] + 24, top + 2); g.lineTo(SH[0] + 20, top + 120); g.lineTo(SH[0] + 13, top + 120); g.closePath(); g.fill();
        seg(g, [[SH[0] + 17, top + 10], [SH[0] + 17, top + 108]], 5, of.tie, 'butt');
        g.fillStyle = shade(of.color, -0.2); g.fillRect(HIP[0] - tw - 2, bot - 6, tw * 2 + 4, 6);
      }
    }
    // near arm
    seg(g, [SH, aF.el, aF.ha], 30 + grow, col(sleeve));
    circle(g, aF.ha[0], aF.ha[1], 15 + grow * 0.5, col(ink));
    // head
    circle(g, HEAD[0], HEAD[1], 58 + grow, col(ink));
    g.restore();
  }
  // face (drawn un-mirrored so it reads correctly, but placed on the facing side)
  g.restore();
  const hx = o.x + (HEAD[0] + 18) * f * s, hy = o.y + HEAD[1] * s;
  flatFace(g, hx, hy, 58 * s, { ...o.face, f });
}

// minimal white face: eyes (dot with pupil / ring glasses), brows, mouth
export function flatFace(g, x, y, r, o = {}) {
  const W = '#ffffff', ink = S().ink, f = o.f || 1;
  const ex = [x - r * 0.3, x + r * 0.3], ey = y - r * 0.08;
  const look = o.look || [f * 0.35, 0];
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.glasses) {
    for (const cx of ex) { ring(g, cx, ey, r * 0.27, r * 0.07, W); circle(g, cx, ey, r * 0.18, W); circle(g, cx + look[0] * r * 0.07, ey + look[1] * r * 0.07, r * 0.07, ink); }
    seg(g, [[ex[0] + r * 0.27, ey], [ex[1] - r * 0.27, ey]], r * 0.05, W);
  } else if (o.blink) {
    for (const cx of ex) seg(g, [[cx - r * 0.12, ey], [cx + r * 0.12, ey]], r * 0.07, W);
  } else {
    for (const cx of ex) { g.fillStyle = W; g.beginPath(); g.ellipse(cx, ey, r * 0.15, r * 0.13, 0, 0, Math.PI * 2); g.fill(); circle(g, cx + look[0] * r * 0.06, ey + look[1] * r * 0.05, r * 0.065, ink); }
  }
  const by = ey - r * (o.glasses ? 0.38 : 0.3), bw = r * 0.16;
  if (o.brows === 'angry') { seg(g, [[ex[0] - bw, by - r * 0.08], [ex[0] + bw, by + r * 0.06]], r * 0.07, W); seg(g, [[ex[1] - bw, by + r * 0.06], [ex[1] + bw, by - r * 0.08]], r * 0.07, W); }
  if (o.brows === 'worried') { seg(g, [[ex[0] - bw, by + r * 0.06], [ex[0] + bw, by - r * 0.06]], r * 0.06, W); seg(g, [[ex[1] - bw, by - r * 0.06], [ex[1] + bw, by + r * 0.06]], r * 0.06, W); }
  if (o.brows === 'raised') for (const cx of ex) { g.strokeStyle = W; g.lineWidth = r * 0.06; g.beginPath(); g.arc(cx, by + r * 0.1, r * 0.15, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  const mx = x, my = y + r * 0.38, talk = o.talk || 0;
  g.strokeStyle = W; g.lineWidth = r * 0.07;
  if (talk > 0.08) { g.fillStyle = W; g.beginPath(); g.ellipse(mx, my, r * 0.15, r * (0.04 + 0.13 * talk), 0, 0, Math.PI * 2); g.fill(); }
  else if (o.mouth === 'wavy') { g.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; const px = mx - r * 0.2 + u * r * 0.4, py = my + Math.sin(u * Math.PI * 2) * r * 0.05; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  else if (o.mouth === 'smile') { g.beginPath(); g.arc(mx, my - r * 0.14, r * 0.17, 0.4, Math.PI - 0.4); g.stroke(); }
  else if (o.mouth === 'frown') { g.beginPath(); g.arc(mx, my + r * 0.16, r * 0.16, Math.PI + 0.5, Math.PI * 2 - 0.5); g.stroke(); }
  else seg(g, [[mx - r * 0.1, my], [mx + r * 0.1, my]], r * 0.06, W);
  g.restore();
}
