// sets/items.js — предметы. drawItem(g, name, x, y, s, t, o): (x, y) = точка опоры (низ предмета / место в руке).
// ВСЕ надписи на предметах идут через fitText(): текст ужимается и переносится так, чтобы не выходить за рамки предмета.
import { E, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, measure, FONTS, clamp, ease, prog, lerp } from '/engine/core.js';

// Текст строго внутри прямоугольника (cx, cy — центр; w, h — размер области).
export function fitText(g, str, cx, cy, w, h, o = {}) {
  const font = o.font || FONTS.ui, weight = o.weight || 900, lines = String(str).split('\n');
  let size = Math.min(o.size || h / lines.length * 0.72, (h / lines.length) * 0.78);
  for (const ln of lines) { const mw = measure(g, ln, size, font, weight, o.spacing || 0); if (mw > w) size *= w / mw; }
  const lh = size * 1.15, y0 = cy - (lh * (lines.length - 1)) / 2;
  lines.forEach((ln, i) => text(g, ln, cx, y0 + i * lh, { size, font, weight, color: o.color || '#fff', align: 'center', spacing: o.spacing || 0, alpha: o.alpha ?? 1, maxW: w, glow: o.glow || 0, glowColor: o.glowColor }));
  return size;
}
// табличка/вывеска: прямоугольник с текстом (с отступами внутри)
export function sign(g, cx, cy, w, h, str, o = {}) {
  rr(g, cx - w / 2, cy - h / 2, w, h, Math.min(12, h * 0.25)); g.fillStyle = o.bg || '#2a2228'; g.fill();
  if (o.border !== false) { g.strokeStyle = alpha('#000000', 0.35); g.lineWidth = 3; g.stroke(); }
  const pad = Math.max(8, h * 0.18);
  fitText(g, str, cx, cy + 1, w - pad * 2, h - pad * 1.2, { color: o.fg || '#fff', font: o.font || FONTS.ui, weight: o.weight || 900, alpha: o.alpha ?? 1 });
}

export function drawItem(g, name, x, y, s = 1, t = 0, o = {}) {
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(s, s); if (o.a != null) g.globalAlpha *= o.a;
  const f = ITEMS[name]; if (f) f(g, t, o); g.restore();
}

const ink = '#0e0b12';
const ITEMS = {
  toothbrush(g) { rr(g, -6, -150, 12, 150, 6); g.fillStyle = '#4ab0d8'; g.fill(); rr(g, -9, -190, 18, 44, 4); g.fillStyle = '#e8f0ff'; g.fill(); for (let i = 0; i < 6; i++) seg(g, [[-9, -186 + i * 7], [-20, -186 + i * 7]], 3, '#ffffff'); },
  kettle(g) { rr(g, -70, -120, 140, 120, 30); g.fillStyle = '#c8ccd8'; g.fill(); seg(g, [[-40, -120], [-30, -160], [30, -160], [40, -120]], 12, '#2a2a34'); poly(g, [[70, -80], [120, -120], [125, -110], [70, -50]], '#c8ccd8'); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-50, -110, 12, 90); },
  mug(g) { rr(g, -26, -56, 52, 56, 8); g.fillStyle = '#f2ece4'; g.fill(); ring(g, 34, -30, 14, 7, '#f2ece4'); g.fillStyle = '#6a3a1a'; g.fillRect(-22, -54, 44, 8); },
  cup(g) { rr(g, -26, -56, 52, 56, 8); g.fillStyle = '#e0f0ff'; g.fill(); ring(g, 34, -30, 14, 7, '#e0f0ff'); g.fillStyle = '#8a4a2a'; g.fillRect(-22, -54, 44, 8); },
  spoon(g) { seg(g, [[0, 0], [0, -80]], 6, '#d8dce8'); g.fillStyle = '#d8dce8'; g.beginPath(); g.ellipse(0, -92, 12, 18, 0, 0, Math.PI * 2); g.fill(); },
  sandwich(g, t, o) { const bites = o.bites || 0; g.save(); g.beginPath(); g.rect(-80 + bites * 40, -60, 200, 80); g.clip(); rr(g, -80, -40, 160, 34, 10); g.fillStyle = '#e8b878'; g.fill(); g.fillStyle = '#5aa860'; g.fillRect(-78, -48, 156, 10); g.fillStyle = '#d85a4a'; g.fillRect(-74, -58, 148, 12); rr(g, -80, -84, 160, 30, 12); g.fillStyle = '#d8a060'; g.fill(); g.restore(); },
  glass(g) { g.fillStyle = 'rgba(220,235,255,.35)'; g.beginPath(); g.moveTo(-26, -120); g.lineTo(26, -120); g.lineTo(18, -60); g.lineTo(-18, -60); g.closePath(); g.fill(); g.fillStyle = '#c83a5a'; g.beginPath(); g.moveTo(-22, -100); g.lineTo(22, -100); g.lineTo(18, -62); g.lineTo(-18, -62); g.fill(); seg(g, [[0, -60], [0, -8]], 5, 'rgba(220,235,255,.7)'); seg(g, [[-22, -4], [22, -4]], 6, 'rgba(220,235,255,.7)'); },
  cake(g, t) { rr(g, -110, -90, 220, 90, 10); g.fillStyle = '#f2d8c8'; g.fill(); g.fillStyle = '#c84a6a'; g.fillRect(-110, -60, 220, 16); for (let i = -2; i <= 2; i++) { seg(g, [[i * 36, -90], [i * 36, -130]], 6, '#7fd0d6'); circle(g, i * 36, -140 + Math.sin(t * 9 + i) * 2, 6, '#ffd47e'); glow(g, i * 36, -140, 40, '#ffb070', 0.6); } },
  pen(g) { seg(g, [[0, 0], [0, -110]], 10, '#2a5ab0'); poly(g, [[-5, 0], [5, 0], [0, 16]], '#d8c8a0'); },
  newspaper(g, t, o) { const w = 520, h = 340; g.fillStyle = '#e8e2d2'; g.fillRect(-w / 2, -h, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-w / 2, -h, w, 40); for (let c = 0; c < 3; c++) for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-w / 2 + 20 + c * 168, -h + 60 + i * 30, 150, 8); }
    if (o.text) { const p = o.p ?? 1; const lines = o.text.split('\n'); const shown = []; let budget = Math.floor(o.text.replace(/\n/g, '').length * p); for (const ln of lines) { const k = Math.max(0, Math.min(ln.length, budget)); shown.push(ln.slice(0, k)); budget -= k; }
      // крупные буквы ручкой — фиксированный размер под полный текст, чтобы строки не вылезали за газету
      const size = fitSizeLines(g, lines, w - 60, h - 50); const lh = size * 1.15, y0 = -h / 2 - (lh * (lines.length - 1)) / 2;
      shown.forEach((ln, i) => text(g, ln, -w / 2 + 30, y0 + i * lh, { size, font: FONTS.ui, weight: 900, color: '#1f3a8a', align: 'left' })); } },
  phone(g, t, o) { // крупный смартфон (вставка): экран с именем
    rr(g, -110, -440, 220, 440, 28); g.fillStyle = '#121218'; g.fill(); rr(g, -96, -420, 192, 400, 18); g.fillStyle = o.screen || '#1c2a3a'; g.fill(); glow(g, 0, -220, 260, '#7fd0d6', 0.15);
    if (o.name) { circle(g, 0, -300, 44, '#6a7a9a'); fitText(g, o.name, 0, -220, 170, 40, { color: '#ffffff' }); }
    if (o.sub) fitText(g, o.sub, 0, -180, 170, 26, { color: '#9fb6d8', weight: 800 });
    if (o.call) { circle(g, -50, -80, 28, '#3ac86a'); circle(g, 50, -80, 28, '#e0403a'); } },
  wallet(g) { rr(g, -60, -44, 120, 44, 8); g.fillStyle = '#a0402a'; g.fill(); g.fillStyle = '#7a2a1a'; g.fillRect(-60, -30, 120, 6); },
  handbag(g) { rr(g, -70, -90, 140, 90, 12); g.fillStyle = '#5a3a5a'; g.fill(); g.strokeStyle = '#3a2238'; g.lineWidth = 8; g.beginPath(); g.arc(0, -90, 40, Math.PI, 0); g.stroke(); },
  buckwheat(g) { rr(g, -40, -110, 80, 110, 6); g.fillStyle = '#e0b040'; g.fill(); circle(g, 0, -60, 22, '#8a5a2a'); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-36, -104, 72, 14); },
  basket(g) { rr(g, -90, -80, 180, 80, 8); g.fillStyle = '#c84a3a'; g.fill(); g.strokeStyle = '#a03a2a'; g.lineWidth = 3; for (let i = -70; i <= 70; i += 20) { g.beginPath(); g.moveTo(i, -76); g.lineTo(i, -4); g.stroke(); } seg(g, [[-80, -80], [-60, -130], [60, -130], [80, -80]], 6, '#3a3440'); },
  umbrella(g, t, o) { const open = o.open ?? 1; seg(g, [[0, 0], [0, -320]], 7, '#2a2228'); g.strokeStyle = '#2a2228'; g.lineWidth = 7; g.beginPath(); g.arc(14, 0, 14, 0, Math.PI); g.stroke();
    const w = 200 * (0.25 + 0.75 * open); g.fillStyle = '#ffd21a'; g.beginPath(); g.moveTo(-w, -300 + (1 - open) * 40); g.quadraticCurveTo(0, -460, w, -300 + (1 - open) * 40); for (let i = 3; i >= -3; i--) { const xx = (i / 3) * w; g.quadraticCurveTo(xx + w / 6, -320, xx, -300 + (1 - open) * 40); } g.closePath(); g.fill(); glow(g, 0, -360, 260, '#ffd21a', 0.25); circle(g, 0, -420 + (1 - open) * 30, 8, '#2a2228'); },
  hat(g) { g.fillStyle = '#e0503a'; g.beginPath(); g.ellipse(0, -10, 50, 42, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-52, -14, 104, 16); circle(g, 0, -58, 14, '#ffffff'); },
  money(g) { for (let i = 0; i < 3; i++) { g.save(); g.rotate(-0.1 + i * 0.1); rr(g, -70, -40 - i * 4, 140, 64, 6); g.fillStyle = '#6ab08a'; g.fill(); ring(g, 0, -8 - i * 4, 18, 3, '#3a7a5a'); g.restore(); } },
  package(g) { g.fillStyle = '#e8e0d0'; g.beginPath(); g.moveTo(-70, 0); g.lineTo(70, 0); g.lineTo(60, -150); g.lineTo(-60, -150); g.closePath(); g.fill(); g.strokeStyle = '#bab0a0'; g.lineWidth = 6; g.beginPath(); g.moveTo(-30, -150); g.quadraticCurveTo(0, -200, 30, -150); g.stroke(); },
  cutpaper(g) { for (let i = 0; i < 9; i++) { g.save(); g.translate(-60 + (i % 3) * 50, -30 - Math.floor(i / 3) * 24); g.rotate((i * 0.37) % 0.6 - 0.3); g.fillStyle = '#e8e2d2'; g.fillRect(-26, -10, 52, 20); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-20, -4, 40, 3); g.restore(); } },
  ticket(g) { rr(g, -60, -34, 120, 34, 4); g.fillStyle = '#f2c21a'; g.fill(); seg(g, [[20, -32], [20, -2]], 2, '#a07a10'); },
  pies(g, t, o) { const n = o.n ?? 6; g.fillStyle = '#f2ece4'; g.beginPath(); g.ellipse(0, -8, 150, 26, 0, 0, Math.PI * 2); g.fill(); for (let i = 0; i < n; i++) { const px = -90 + (i % 4) * 60, py = -28 - Math.floor(i / 4) * 26; g.fillStyle = '#d89a50'; g.beginPath(); g.ellipse(px, py, 34, 18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,230,180,.5)'; g.beginPath(); g.ellipse(px - 6, py - 6, 16, 6, 0, 0, Math.PI * 2); g.fill(); } },
  pie(g) { g.fillStyle = '#d89a50'; g.beginPath(); g.ellipse(0, -18, 34, 18, 0, 0, Math.PI * 2); g.fill(); },
  honestybox(g, t, o) { // коробка честности + картинка над ней
    rr(g, -140, -150, 280, 150, 8); g.fillStyle = '#7a5a3a'; g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(-60, -150, 120, 10);
    sign(g, 0, -80, 220, 60, o.label || 'КАССА ЧЕСТНОСТИ', { bg: '#f2e6c8', fg: '#3a2a1a' });
    if (o.pic) { const py = -420; rr(g, -150, py - 120, 300, 220, 6); g.fillStyle = '#f4efe6'; g.fill(); g.strokeStyle = '#3a3440'; g.lineWidth = 8; g.stroke();
      if (o.pic === 'eyes') for (const dx of [-60, 60]) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(dx, py, 50, 28, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 4; g.stroke(); circle(g, dx + 4, py, 18, '#3a5a8a'); circle(g, dx + 4, py, 8, '#0e0b12'); }
      else for (let i = 0; i < 3; i++) { const fx = -80 + i * 80; seg(g, [[fx, py + 80], [fx, py - 10]], 5, '#3a8a4a'); for (let k = 0; k < 5; k++) circle(g, fx + Math.cos(k * 1.26) * 22, py - 30 + Math.sin(k * 1.26) * 22, 14, ['#e05a7a', '#f2c21a', '#a05ad6'][i]); circle(g, fx, py - 30, 10, '#ffd47e'); } } },
  laptop(g, t, o) { rr(g, -230, -300, 460, 290, 14); g.fillStyle = '#1a1a22'; g.fill(); g.fillStyle = '#20304a'; g.fillRect(-214, -284, 428, 258); poly(g, [[-260, 0], [260, 0], [230, -14], [-230, -14]], '#8a8ea0'); },
  keys(g) { ring(g, 0, -20, 16, 5, '#c8c8d0'); seg(g, [[10, -10], [50, 20]], 6, '#c8c8d0'); seg(g, [[40, 12], [46, 4]], 5, '#c8c8d0'); },
  cookie(g) { circle(g, 0, -20, 26, '#c88a4a'); for (const [a, b] of [[-8, -26], [10, -16], [-2, -8]]) circle(g, a, b, 5, '#4a2a1a'); },
  ring(g, t) { ring(g, 0, -30, 26, 9, '#f2c21a'); glow(g, 0, -30, 90, '#ffd47e', 0.6); circle(g, 0, -60, 9, '#9fe8ff'); },
  vr(g) { rr(g, -60, -40, 120, 50, 14); g.fillStyle = '#e8e8f0'; g.fill(); g.fillStyle = '#1a1a22'; g.fillRect(-50, -24, 100, 22); },
  tshirt(g, t, o) { g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(-90, -200); g.lineTo(-40, -220); g.quadraticCurveTo(0, -190, 40, -220); g.lineTo(90, -200); g.lineTo(120, -140); g.lineTo(80, -120); g.lineTo(80, 0); g.lineTo(-80, 0); g.lineTo(-80, -120); g.lineTo(-120, -140); g.closePath(); g.fill(); circle(g, 0, -110, 46, '#e0a070'); circle(g, -16, -118, 6, ink); circle(g, 16, -118, 6, ink); seg(g, [[-18, -92], [18, -92]], 6, '#a03a3a'); g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(0, -150, 52, 20, 0, Math.PI, 0); g.fill(); },
  dog(g, t, o) { const wag = Math.sin(t * 14) * 0.5, jump = o.jump ? Math.abs(Math.sin(t * 6)) * 40 : 0; g.translate(0, -jump); const c = '#c8904a', d = '#8a5a2a';
    seg(g, [[-60, -70], [-90 - 20 * Math.cos(wag), -110 + 20 * Math.sin(wag)]], 10, d); g.fillStyle = c; g.beginPath(); g.ellipse(0, -80, 70, 34, 0, 0, Math.PI * 2); g.fill();
    for (const lx of [-44, -24, 30, 50]) seg(g, [[lx, -60], [lx, 0]], 12, d); circle(g, 72, -118, 32, c); g.fillStyle = d; g.beginPath(); g.ellipse(60, -144, 12, 22, -0.5, 0, Math.PI * 2); g.fill(); circle(g, 100, -112, 8, ink); circle(g, 80, -126, 5, ink); if (o.tongue) { g.fillStyle = '#e05a6a'; g.fillRect(84, -100, 10, 18); } },
  cat(g, t, o) { g.fillStyle = o.color || '#3a3440'; g.beginPath(); g.ellipse(0, -40, 46, 30, 0, 0, Math.PI * 2); g.fill(); circle(g, 40, -70, 22, o.color || '#3a3440'); poly(g, [[26, -86], [32, -108], [42, -88]], o.color || '#3a3440'); poly(g, [[44, -88], [54, -106], [58, -84]], o.color || '#3a3440'); seg(g, [[-44, -40], [-70, -80 + Math.sin(t * 3) * 10]], 8, o.color || '#3a3440'); circle(g, 48, -72, 3, '#9fe86a'); },
  giraffe(g, t, o) { const c = '#e8b050', sp = '#a06a2a', look = o.look || 0; for (const lx of [-70, -40, 50, 80]) seg(g, [[lx, -260], [lx, 0]], 18, c); g.fillStyle = c; g.beginPath(); g.ellipse(0, -300, 130, 70, 0, 0, Math.PI * 2); g.fill();
    const nx = 90 + look * 20; seg(g, [[60, -330], [nx, -740]], 44, c); g.fillStyle = c; g.beginPath(); g.ellipse(nx + 50 * (look < 0 ? -1 : 1), -760, 70, 34, look < 0 ? 0.3 : -0.3, 0, Math.PI * 2); g.fill();
    for (const [a, b] of [[-60, -300], [20, -320], [80, -280], [-10, -270], [70, -500], [80, -620], [60, -420]]) { g.fillStyle = sp; g.beginPath(); g.ellipse(a, b, 20, 14, 0.4, 0, Math.PI * 2); g.fill(); }
    seg(g, [[nx - 10, -790], [nx - 14, -830]], 8, sp); seg(g, [[nx + 14, -790], [nx + 16, -830]], 8, sp); circle(g, nx + 50 * (look < 0 ? -1 : 1), -770, 9, ink); },
  sheep(g, t) { g.fillStyle = '#d8d0c8'; for (const [a, b] of [[-30, -60], [0, -70], [30, -60], [-10, -45], [20, -45]]) { g.beginPath(); g.arc(a, b, 30, 0, Math.PI * 2); g.fill(); } circle(g, 52, -66, 18, '#2a2228'); for (const lx of [-30, 30]) seg(g, [[lx, -40], [lx, 0]], 7, '#2a2228'); },
  car(g, t, o) { rr(g, -220, -110, 440, 90, 30); g.fillStyle = '#2a2a3a'; g.fill(); g.fillStyle = '#2a2a3a'; g.beginPath(); g.moveTo(-130, -110); g.lineTo(-80, -180); g.lineTo(90, -180); g.lineTo(150, -110); g.fill(); g.fillStyle = 'rgba(160,190,230,.35)'; g.beginPath(); g.moveTo(-110, -115); g.lineTo(-72, -170); g.lineTo(0, -170); g.lineTo(0, -115); g.fill(); g.beginPath(); g.moveTo(10, -115); g.lineTo(10, -170); g.lineTo(84, -170); g.lineTo(130, -115); g.fill(); for (const wx of [-130, 130]) { circle(g, wx, -20, 38, '#0e0e14'); circle(g, wx, -20, 16, '#5a5a66'); } if (o.lights !== false) { circle(g, 214, -80, 10, '#fff4d0'); glow(g, 214, -80, 120, '#fff4d0', 0.5); } circle(g, -214, -80, 8, '#ff3a3a'); glow(g, -214, -80, 60, '#ff3a3a', 0.5); },
  landline(g, t, o) { rr(g, -70, -50, 140, 50, 12); g.fillStyle = '#b83a3a'; g.fill(); if (!o.off) { rr(g, -80, -78, 160, 30, 14); g.fillStyle = '#a02a2a'; g.fill(); } circle(g, 0, -26, 16, '#e8d8c8'); },
  handset(g) { rr(g, -18, -140, 36, 140, 16); g.fillStyle = '#a02a2a'; g.fill(); rr(g, -26, -150, 52, 36, 12); g.fill(); rr(g, -26, -30, 52, 36, 12); g.fill(); },
  coat(g, t, o) { g.fillStyle = shade(o.color || '#7a5040', -0.25); g.beginPath(); g.moveTo(-34, -200); g.lineTo(34, -200); g.lineTo(42, 0); g.lineTo(-42, 0); g.closePath(); g.fill(); seg(g, [[0, -200], [0, -222]], 4, '#c8b890'); },
  shoes(g, t, o) { const k = o.p ?? 1; for (const dx of [-70, 70]) { rr(g, dx - 60, -40, 120, 40, 16); g.fillStyle = '#e8e8f0'; g.fill(); g.fillStyle = '#3a6ea5'; g.fillRect(dx - 60, -14, 120, 14); }
    g.strokeStyle = '#f2c21a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-70, -36); g.bezierCurveTo(-30, -36 - 60 * k, 30, -36 - 60 * k, 70, -36); g.stroke(); if (k > 0.8) { circle(g, 0, -36 - 44 * k, 12, '#f2c21a'); } },
  note(g, t) { circle(g, 0, 0, 12, '#ffd47e'); seg(g, [[10, 0], [10, -46], [30, -38]], 5, '#ffd47e'); glow(g, 0, -20, 50, '#ffd47e', 0.4); },
  crown(g) { poly(g, [[-60, 0], [60, 0], [70, -70], [35, -30], [0, -80], [-35, -30], [-70, -70]], '#f2c21a'); glow(g, 0, -40, 140, '#ffd47e', 0.5); },
  bag2(g) { rr(g, -50, -90, 100, 90, 10); g.fillStyle = '#e8dcc8'; g.fill(); seg(g, [[-30, -90], [-20, -120], [20, -120], [30, -90]], 5, '#b0a088'); },
  phone2(g, t, o) { rr(g, -14, -26, 28, 50, 5); g.fillStyle = '#121218'; g.fill(); g.fillStyle = o.screen || '#2a4a6a'; g.fillRect(-11, -22, 22, 42); if (o.cracked) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 7; i++) { const a = i * 0.9; g.moveTo(4, -6); g.lineTo(4 + Math.cos(a) * 18, -6 + Math.sin(a) * 26); } g.stroke(); } },
  bigphone(g, t, o) { rr(g, -110, -440, 220, 440, 28); g.fillStyle = '#121218'; g.fill(); rr(g, -96, -420, 192, 400, 18); g.fillStyle = '#1c2a3a'; g.fill();
    if (o.cat !== false) { g.fillStyle = '#c8904a'; g.beginPath(); g.ellipse(0, -200, 60, 40, 0, 0, 7); g.fill(); circle(g, 50, -240, 30, '#c8904a'); poly(g, [[34, -262], [40, -290], [52, -266]], '#c8904a'); poly(g, [[56, -266], [66, -288], [72, -258]], '#c8904a'); circle(g, 58, -244, 4, '#0e0b12'); }
    if (o.cracked) { g.save(); g.beginPath(); rr(g, -96, -420, 192, 400, 18); g.clip(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; const cx = o.cx ?? 30, cy = o.cy ?? -300; for (let i = 0; i < 11; i++) { const a = i * 0.57 + 0.2; let x = cx, y = cy; g.beginPath(); g.moveTo(x, y); for (let k = 1; k < 5; k++) { x += Math.cos(a + Math.sin(k * 3 + i) * 0.3) * 60; y += Math.sin(a + Math.sin(k * 3 + i) * 0.3) * 60; g.lineTo(x, y); } g.stroke(); } for (const r of [20, 46]) ring(g, cx, cy, r, 2, 'rgba(255,255,255,.7)'); g.restore(); }
    if (o.clock) fitText(g, o.clock, 0, -360, 170, 44, { color: '#ffffff' }); },
  apple(g) { circle(g, 0, -26, 26, '#d8402a'); circle(g, -8, -34, 8, 'rgba(255,255,255,.25)'); seg(g, [[0, -50], [4, -62]], 4, '#4a2a1a'); g.fillStyle = '#4ab060'; g.beginPath(); g.ellipse(12, -58, 10, 5, -0.5, 0, 7); g.fill(); },
  coin(g, t, o) { const k = Math.abs(Math.cos((o.spin ?? 0) * t * 12)) + 0.08; g.fillStyle = '#f2c21a'; g.beginPath(); g.ellipse(0, -24, 24, 24 * k, 0, 0, 7); g.fill(); g.strokeStyle = '#b08a10'; g.lineWidth = 3; g.stroke(); glow(g, 0, -24, 60, '#ffd47e', 0.4); },
  cappuccino(g) { rr(g, -34, -50, 68, 50, 10); g.fillStyle = '#f2ece4'; g.fill(); g.fillStyle = '#c8a070'; g.beginPath(); g.ellipse(0, -48, 30, 7, 0, 0, 7); g.fill(); ring(g, 44, -26, 14, 7, '#f2ece4'); g.fillStyle = '#e8e2d6'; g.beginPath(); g.ellipse(0, 0, 54, 8, 0, 0, 7); g.fill(); },
  stain(g) { g.fillStyle = 'rgba(120,72,32,.85)'; for (const [a, b, r] of [[0, 0, 22], [14, 10, 14], [-12, 12, 12], [4, 24, 9]]) { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); } },
  ball(g, t, o) { g.save(); g.translate(0, -26); g.rotate((o.spin || 0) * t); circle(g, 0, 0, 26, '#f2efe8'); for (let i = 0; i < 5; i++) { const a = i * 1.256; circle(g, Math.cos(a) * 14, Math.sin(a) * 14, 7, '#1a1622'); } circle(g, 0, 0, 8, '#1a1622'); g.restore(); },
  tire(g, t, o) { g.save(); if (o.flat) g.scale(1, 0.35); circle(g, 0, -60, 60, '#1a1a20'); circle(g, 0, -60, 26, '#3a3a44'); ring(g, 0, -60, 44, 4, '#2a2a32'); g.restore(); },
  tires(g, t, o) { const n = o.n ?? 6; for (let i = 0; i < n; i++) { const row = i < 3 ? 0 : i < 5 ? 1 : 2, col = row === 0 ? i : row === 1 ? i - 3 : 0; g.save(); g.translate(-110 + col * 110 + row * 55, -row * 44); g.scale(1, 0.4); circle(g, 0, -60, 60, '#1a1a20'); circle(g, 0, -60, 26, '#3a3a44'); g.restore(); } },
  form(g, t, o) { g.fillStyle = '#f2ece0'; g.fillRect(-120, -160, 240, 160); g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 5; i++) g.fillRect(-100, -130 + i * 26, 200, 3); if (o.text) fitText(g, o.text, 0, -80, 200, 60, { color: '#1f3a8a', weight: 900 }); },
  barrel(g) { g.fillStyle = '#9a6a3a'; g.beginPath(); g.ellipse(0, -70, 60, 72, 0, 0, 7); g.fill(); g.fillStyle = '#6a4a2a'; g.fillRect(-60, -110, 120, 8); g.fillRect(-60, -38, 120, 8); },
  mic(g) { seg(g, [[0, 0], [0, -40]], 8, '#2a2a34'); circle(g, 0, -48, 12, '#8a8aa0'); },
  chips(g) { rr(g, -40, -90, 80, 90, 10); g.fillStyle = '#f2c21a'; g.fill(); g.fillStyle = '#e04a3a'; g.fillRect(-40, -60, 80, 24); },
  choco(g) { rr(g, -60, -24, 120, 24, 4); g.fillStyle = '#5a3a2a'; g.fill(); g.fillStyle = '#c83a3a'; g.fillRect(-60, -24, 50, 24); },
  headphones(g) { g.strokeStyle = '#f4f4f8'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 30, Math.PI, 0); g.stroke(); rr(g, -38, -6, 16, 26, 6); g.fillStyle = '#f4f4f8'; g.fill(); rr(g, 22, -6, 16, 26, 6); g.fill(); },
  hammer(g) { seg(g, [[0, 0], [0, -90]], 8, '#8a5a2a'); rr(g, -26, -104, 52, 20, 4); g.fillStyle = '#5a5a66'; g.fill(); },
  sheet(g) { g.fillStyle = '#8a9098'; g.fillRect(-160, -18, 320, 18); g.strokeStyle = '#6a7078'; g.lineWidth = 3; for (let i = -150; i < 160; i += 30) { g.beginPath(); g.moveTo(i, -18); g.lineTo(i, 0); g.stroke(); } },
  seeds(g) { g.fillStyle = '#e8dcc8'; g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(36, -60); g.lineTo(-36, -60); g.fill(); g.fillStyle = '#2a2228'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-20 + i * 8, -62 - (i % 2) * 4, 3, 6, 0.3, 0, 7); g.fill(); } },
  photo(g, t, o) { g.fillStyle = '#f4efe6'; g.fillRect(-90, -130, 180, 130); g.fillStyle = o.c || '#7aa0c8'; g.fillRect(-78, -118, 156, 88); circle(g, 30, -90, 14, '#ffd47e'); poly(g, [[-78, -30], [-20, -80], [30, -30]], '#3a6a4a'); },
  puddle(g) { g.fillStyle = 'rgba(140,170,220,.45)'; g.beginPath(); g.ellipse(0, 0, 160, 26, 0, 0, Math.PI * 2); g.fill(); },
  candybox(g, t, o) { rr(g, -130, -80, 260, 80, 8); g.fillStyle = '#a02a4a'; g.fill(); g.fillStyle = '#f2c21a'; g.fillRect(-130, -48, 260, 10); if (o.open) { g.fillStyle = '#6ab08a'; for (let i = 0; i < 4; i++) g.fillRect(-100 + i * 50, -100 - i * 3, 70, 30); } },
};
// размер шрифта, при котором ВСЕ строки влезают в w×h
function fitSizeLines(g, lines, w, h) { let size = (h / lines.length) / 1.15; for (const ln of lines) { const mw = measure(g, ln, size, FONTS.ui, 900); if (mw > w) size *= w / mw; } return size; }
