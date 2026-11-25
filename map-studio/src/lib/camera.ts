import {geoDistance, geoInterpolate, geoMercator, geoOrthographic, GeoProjection} from 'd3-geo';
import {Cam, Overlay, Shot} from './types';
import {DEFAULT_PUSH, EARTH_KM, GLOBE_FULL, H, MAP_FULL, W} from './theme';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
// Calm documentary ease: slow start, long gentle settle.
export const ease = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** Fill in camera continuity + kept overlays. Used by both the renderer and prepare.ts */
export function resolveShots<T extends Shot>(shots: T[]): (T & {cam: {from: Cam; to: Cam}; allOverlays: Overlay[]})[] {
  let prev: Cam | null = null;
  let prevOverlays: Overlay[] = [];
  return shots.map((s) => {
    let from: Cam, to: Cam;
    const kind = s.kind ?? 'map';
    if (s.camera?.to) {
      to = s.camera.to;
      from = s.camera.from ?? prev ?? {center: to.center, span: to.span / DEFAULT_PUSH};
    } else if (s.camera?.from) {
      from = s.camera.from;
      to = {center: from.center, span: from.span * DEFAULT_PUSH};
    } else {
      const base = prev ?? {center: [0, 20] as [number, number], span: 30000};
      from = base;
      to = {center: base.center, span: base.span * DEFAULT_PUSH};
    }
    const own = s.overlays ?? [];
    const kept = s.keep ? prevOverlays.map((o) => ({...o, t: -100})) : [];
    const allOverlays = [...kept, ...own];
    if (kind === 'map') {
      prev = to;
      prevOverlays = allOverlays;
    }
    return {...s, cam: {from, to}, allOverlays};
  });
}

/** Camera at progress p (0..1) through the shot. Long moves zoom out mid-flight. */
export function cameraAt(cam: {from: Cam; to: Cam}, p: number): Cam {
  const {from, to} = cam;
  const moving = geoDistance(from.center, to.center) > 1e-6;
  const t = moving ? ease(p) : p; // pure push-ins move at constant speed
  const center = moving ? (geoInterpolate(from.center, to.center)(t) as [number, number]) : to.center;
  const distKm = geoDistance(from.center, to.center) * EARTH_KM;
  const l0 = Math.log(from.span), l1 = Math.log(to.span);
  const bump = Math.max(0, Math.log((distKm * 1.6) / Math.max(from.span, to.span)));
  const span = Math.exp(l0 + (l1 - l0) * t + bump * Math.sin(Math.PI * t));
  return {center, span};
}

/** 0 = flat map, 1 = globe */
export const globeWeight = (span: number) =>
  smooth((Math.log(span) - Math.log(MAP_FULL)) / (Math.log(GLOBE_FULL) - Math.log(MAP_FULL)));

/** pixels per km at the centre of the frame — same for both projections */
export const pxPerKm = (c: Cam) => W / c.span;

export function mercator(c: Cam): GeoProjection {
  const lat = (c.center[1] * Math.PI) / 180;
  const s = (W * EARTH_KM * Math.cos(lat)) / c.span;
  return geoMercator().rotate([-c.center[0], 0]).center([0, c.center[1]]).scale(s).translate([W / 2, H / 2]).clipExtent([[-60, -60], [W + 60, H + 60]]);
}

export function globe(c: Cam): GeoProjection {
  const R = (W * EARTH_KM) / c.span;
  return geoOrthographic().rotate([-c.center[0], -c.center[1]]).scale(R).translate([W / 2, H / 2]).clipAngle(90).precision(0.3);
}

/** Geographic bbox of the (Mercator) frame, longitudes unwrapped around the camera centre. */
export function viewBox(c: Cam, margin = 0.08) {
  const p = mercator(c).clipExtent(null);
  const [w, n] = p.invert!([-W * margin, -H * margin])!;
  const [e, s] = p.invert!([W * (1 + margin), H * (1 + margin)])!;
  const unwrap = (lon: number) => {
    let d = lon - c.center[0];
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return c.center[0] + d;
  };
  return {w: unwrap(w), e: unwrap(e), s: Math.max(-85, s), n: Math.min(85, n)};
}
