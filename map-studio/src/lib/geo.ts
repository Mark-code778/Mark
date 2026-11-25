import {geoPath, GeoProjection} from 'd3-geo';
import {LonLat} from './types';

type Line = LonLat[];
const lineCache = new WeakMap<object, Line[]>();
const lenCache = new WeakMap<Line, number[]>();

/** All lines (rings included) of a feature/geometry. */
export function linesOf(f: any): Line[] {
  if (lineCache.has(f)) return lineCache.get(f)!;
  const g = f.geometry ?? f;
  let out: Line[] = [];
  if (g.type === 'LineString') out = [g.coordinates];
  else if (g.type === 'MultiLineString' || g.type === 'Polygon') out = g.coordinates;
  else if (g.type === 'MultiPolygon') out = g.coordinates.flat();
  lineCache.set(f, out);
  return out;
}

function cumLen(l: Line) {
  let c = lenCache.get(l);
  if (c) return c;
  c = [0];
  for (let i = 1; i < l.length; i++) {
    const [x0, y0] = l[i - 1], [x1, y1] = l[i];
    let dx = x1 - x0;
    if (dx > 180) dx -= 360;
    if (dx < -180) dx += 360;
    dx *= Math.cos(((y0 + y1) * Math.PI) / 360);
    c.push(c[i - 1] + Math.hypot(dx, y1 - y0));
  }
  lenCache.set(l, c);
  return c;
}

/** First fraction p of a line, measured along the ground: this is how lines "draw themselves on". */
export function trim(l: Line, p: number): Line {
  if (p >= 1) return l;
  if (p <= 0 || l.length < 2) return [];
  const c = cumLen(l);
  const target = c[c.length - 1] * p;
  const out: Line = [l[0]];
  for (let i = 1; i < l.length; i++) {
    if (c[i] >= target) {
      const k = (target - c[i - 1]) / (c[i] - c[i - 1] || 1);
      out.push([l[i - 1][0] + (l[i][0] - l[i - 1][0]) * k, l[i - 1][1] + (l[i][1] - l[i - 1][1]) * k]);
      return out;
    }
    out.push(l[i]);
  }
  return out;
}

export function pathOfLines(lines: Line[], proj: GeoProjection, p = 1): string {
  const coords = p >= 1 ? lines : lines.map((l) => trim(l, p)).filter((l) => l.length > 1);
  if (!coords.length) return '';
  return geoPath(proj)({type: 'MultiLineString', coordinates: coords}) ?? '';
}

export const pathOf = (geom: any, proj: GeoProjection) => geoPath(proj)(geom) ?? '';

/** "3,8 км" — Russian number formatting */
export function fmtKm(km: number, decimals?: number) {
  const d = decimals ?? (km < 10 ? 1 : 0);
  return km.toLocaleString('ru-RU', {minimumFractionDigits: d, maximumFractionDigits: d}) + ' км';
}

export function fmtCoord(lon: number, lat: number) {
  const f = (v: number) => {
    const a = Math.abs(v);
    const d = Math.floor(a);
    const m = Math.floor((a - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}′`;
  };
  let L = ((lon + 540) % 360) - 180;
  return `${f(lat)} ${lat >= 0 ? 'с. ш.' : 'ю. ш.'}   ${f(L)} ${L >= 0 ? 'в. д.' : 'з. д.'}`;
}
