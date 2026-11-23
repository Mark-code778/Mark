// shots/morph.js — «чужой облик»: наплыв одного облика в другой с мерцанием.
import { ease, prog, clamp, seg, circle, ring, glow, alpha } from '/engine/core.js';
import { CAST, FACE_KEYS } from '../cast.js';
// ── чужой облик: mo = [t, ключ, full?] или список таких; меняются «черты» (голова, причёска, очки, борода, родинка),
// по умолчанию меняется весь облик; keep — одежда остаётся своей. Переход — наплыв ±MW с мерцанием.
const MW = 0.32;
export function morphOutfit(selfKey, base, key, keep) {
  if (key === selfKey) return base;
  const tgt = CAST[key] || CAST.max; if (!keep) return { ...tgt };
  const o = { ...base }; for (const k of FACE_KEYS) delete o[k]; for (const k of FACE_KEYS) if (tgt[k] != null) o[k] = tgt[k]; if (!o.head) o.head = 'none'; return o;
}
export function morphLayers(selfKey, base, mo, t) {
  if (!mo) return { layers: [[base, 1]], fx: [], shiver: 0 };
  const list = Array.isArray(mo[0]) ? mo : [mo]; let cur = base, prev = null, k = 1; const fx = []; let shiver = 0;
  let curKey = selfKey; for (const [tt, key, keep, nofx] of list) { const nxt = morphOutfit(selfKey, base, key, keep); if (!nofx) fx.push(tt); if (t >= tt - MW) { prev = cur; cur = nxt; curKey = key; k = prog(t, tt - MW, tt + MW); } if (!nofx) shiver = Math.max(shiver, clamp(1 - Math.abs(t - tt) / 0.45)); }
  return { layers: prev && k < 1 ? [[prev, 1 - ease.inOut(k)], [cur, ease.inOut(k)]] : [[cur, 1]], fx, shiver, disg: curKey !== selfKey && k >= 1 && !(list.length && list[list.length - 1][3]) };
}
export function morphFX(g, x, gy, tt, t, sc = 1) {
  const dt = t - tt; if (dt < -0.5 || dt > 1.0) return;
  const a = dt < 0 ? ease.out((dt + 0.5) / 0.5) : 1 - ease.in(dt / 1.0), H = 360 * sc;
  glow(g, x, gy - H * 0.5, 300 * sc, '#b89aff', 0.55 * a); glow(g, x, gy - H * 0.5, 160 * sc, '#9fe8ff', 0.35 * a);
  for (let i = 0; i < 26; i++) { const an = i * 0.85 + t * 7, hh = ((i * 37) % 100) / 100, y = gy - 10 * sc - ((hh + dt * 0.6) % 1) * H * 1.1, rx = (70 + 25 * Math.sin(i * 1.7)) * sc, px = x + Math.cos(an) * rx;
    const front = Math.sin(an) > 0; circle(g, px, y, (2.5 + (i % 3) * 1.6) * sc * (front ? 1.2 : 0.8), alpha(i % 2 ? '#e0ccff' : '#a8f0ff', a * (front ? 0.95 : 0.45))); }
  for (let j = 0; j < 3; j++) { const ph = ((dt + 0.5) * 1.4 + j / 3) % 1; g.save(); g.translate(x, gy - 4 * sc); g.scale(1, 0.26); ring(g, 0, 0, (50 + ph * 170) * sc, 5 * sc, alpha('#c8b0ff', a * (1 - ph) * 0.8)); g.restore(); }
  g.save(); g.globalAlpha *= a * 0.35; for (let j = 0; j < 7; j++) { const yy = gy - ((j / 7 + t * 1.3) % 1) * H; seg(g, [[x - 90 * sc, yy], [x + 90 * sc, yy]], 3 * sc, '#e8f6ff'); } g.restore();
}

// «под чужим лицом»: изредка вокруг фигуры вспыхивают сиреневые искорки
export function disgFX(g, x, gy, t, sc = 1) {
  for (let i = 0; i < 4; i++) { const ph = (t * 0.55 + i * 0.27) % 1, a = Math.sin(ph * Math.PI) * 0.8; if (a <= 0.05) continue;
    const px = x + Math.sin(i * 2.4 + Math.floor(t * 0.55 + i * 0.27) * 1.7) * 70 * sc, py = gy - (60 + ((i * 71) % 260)) * sc - ph * 40 * sc;
    glow(g, px, py, 16 * sc, '#c8a8ff', a * 0.6); seg(g, [[px - 7 * sc, py], [px + 7 * sc, py]], 2.2 * sc, alpha('#efe4ff', a)); seg(g, [[px, py - 7 * sc], [px, py + 7 * sc]], 2.2 * sc, alpha('#efe4ff', a)); }
}
