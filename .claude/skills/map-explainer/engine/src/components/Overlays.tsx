import React from 'react';
import {geoCircle, geoInterpolate, GeoProjection} from 'd3-geo';
import {Cam, Overlay, LonLat} from '../lib/types';
import {COLORS, colorOf, DRAW_DUR, FONT_SANS, FONT_SERIF, H, LABEL_IN, SHADOW, W, EARTH_KM, VECTOR_FADE_START, VECTOR_FADE_END} from '../lib/theme';
import {ease, smooth} from '../lib/camera';
import {linesOf, pathOf, pathOfLines} from '../lib/geo';

export type GeoLayers = {coast: any[]; borders: any[]; maritime: any[]; states: any[]; countries: any[]};

const prog = (t: number, o: {t?: number; d?: number}, d = DRAW_DUR) => ease((t - (o.t ?? 0)) / (o.d ?? d));
const appear = (t: number, o: {t?: number}) => smooth((t - (o.t ?? 0)) / LABEL_IN);

const onScreen = (p: [number, number] | null) => !!p && p[0] > -200 && p[0] < W + 200 && p[1] > -200 && p[1] < H + 200;

/** Animated count-up for numbers inside a label: "3,8 км" goes 0,0 → 3,8 */
function countUp(text: string, p: number) {
  const m = text.match(/^([\d  ]+(?:,(\d+))?)(.*)$/);
  if (!m || p >= 1) return text;
  const val = parseFloat(m[1].replace(/[  ]/g, '').replace(',', '.'));
  const dec = m[2]?.length ?? 0;
  return (val * p).toLocaleString('ru-RU', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + m[3];
}

const Pill: React.FC<{x: number; y: number; text: string; color: string; a: number; size?: number}> = ({x, y, text, color, a, size = 34}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translateY(${(1 - a) * 12}px)`, opacity: a,
    background: COLORS.ink, color: '#fff', fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, padding: '8px 20px', borderRadius: 10,
    borderBottom: `4px solid ${color}`, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', boxShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>{text}</div>
);

export const Overlays: React.FC<{overlays: Overlay[]; proj: GeoProjection; t: number; cam: Cam; geo: GeoLayers}> = ({overlays, proj, t, cam, geo}) => {
  // Natural Earth 1:10m is ~1 km accurate: below ~15 km across, its lines no longer match the photo, so they fade out.
  const vec = smooth((Math.log(cam.span) - Math.log(VECTOR_FADE_END)) / (Math.log(VECTOR_FADE_START) - Math.log(VECTOR_FADE_END)));
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  const under: React.ReactNode[] = []; // fills + dimming go beneath lines
  const k = (i: number, s: string) => `${s}${i}`;

  overlays.forEach((o, i) => {
    if (t < (o.t ?? 0)) return;
    switch (o.type) {
      case 'coast': {
        const p = prog(t, o, 2.4);
        if (vec > 0.01) svg.push(<path key={k(i, 'c')} d={pathOfLines(geo.coast.flatMap(linesOf), proj, p)} fill="none" stroke={COLORS.coast} strokeWidth={1.6} strokeLinejoin="round" opacity={vec} />);
        break;
      }
      case 'borders': {
        if (vec <= 0.01) break;
        const p = prog(t, o, 2);
        const g: React.ReactNode[] = [];
        if (o.states) g.push(<path key={k(i, 's')} d={pathOfLines(geo.states.flatMap(linesOf), proj, p)} fill="none" stroke={COLORS.states} strokeWidth={1.3} strokeDasharray="5 5" />);
        g.push(<path key={k(i, 'm')} d={pathOfLines(geo.maritime.flatMap(linesOf), proj, p)} fill="none" stroke={COLORS.blue} strokeOpacity={0.7} strokeWidth={1.8} strokeDasharray="8 7" />);
        g.push(<path key={k(i, 'bs')} d={pathOfLines(geo.borders.flatMap(linesOf), proj, p)} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={4.5} strokeLinejoin="round" />);
        g.push(<path key={k(i, 'b')} d={pathOfLines(geo.borders.flatMap(linesOf), proj, p)} fill="none" stroke={COLORS.border} strokeWidth={2.2} strokeLinejoin="round" />);
        svg.push(<g key={k(i, 'bg')} opacity={vec}>{g}</g>);
        break;
      }
      case 'country': {
        const f = geo.countries.find((c) => c.properties.ADM0_A3 === o.code);
        if (!f) break;
        const col = colorOf(o.color);
        const p = prog(t, o, 2.2);
        const a = smooth((t - (o.t ?? 0)) / 1.2);
        if (vec <= 0.01) break;
        if (o.focus) under.push(<path key={k(i, 'f')} d={`M-20,-20H${W + 20}V${H + 20}H-20Z ${pathOf(f, proj)}`} fillRule="evenodd" fill={`rgba(0,0,0,${0.5 * a * vec})`} />);
        if (o.fill !== false) under.push(<path key={k(i, 'cf')} d={pathOf(f, proj)} fill={col} fillOpacity={0.16 * a * vec} />);
        svg.push(<path key={k(i, 'co')} d={pathOfLines(linesOf(f), proj, p)} fill="none" stroke={col} strokeWidth={3.6} strokeLinejoin="round" opacity={vec} style={{filter: `drop-shadow(0 0 6px ${col})`}} />);
        break;
      }
      case 'line': {
        const p = prog(t, o);
        const col = colorOf(o.color ?? 'white');
        svg.push(<path key={k(i, 'ls')} d={pathOfLines([o.coords], proj, p)} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={6} />);
        svg.push(<path key={k(i, 'l')} d={pathOfLines([o.coords], proj, p)} fill="none" stroke={col} strokeWidth={3} strokeDasharray={o.dashed ? '14 10' : undefined} strokeLinecap="round" />);
        if (o.text) {
          // label sits on the visible part of the line, nearest the upper third of the frame
          let best: [number, number] | null = null, bd = Infinity;
          for (let j = 0; j < o.coords.length - 1; j++)
            for (let q = 0; q <= 20; q++) {
              const a0 = o.coords[j], a1 = o.coords[j + 1];
              const pt = proj([a0[0] + ((a1[0] - a0[0]) * q) / 20, a0[1] + ((a1[1] - a0[1]) * q) / 20]);
              if (!pt || pt[0] < 80 || pt[0] > W - 80 || pt[1] < 120 || pt[1] > H - 120) continue;
              const dd2 = Math.hypot(pt[0] - W / 2, pt[1] - H * 0.28);
              if (dd2 < bd) { bd = dd2; best = pt as [number, number]; }
            }
          if (best) html.push(<Pill key={k(i, 'lt')} x={best[0]} y={best[1]} text={o.text} color={col} a={smooth((t - (o.t ?? 0) - (o.d ?? DRAW_DUR) * 0.6) / LABEL_IN)} size={26} />);
        }
        break;
      }
      case 'distance': {
        const p = prog(t, o, 2);
        const col = colorOf(o.color);
        const interp = geoInterpolate(o.from, o.to);
        const pts: LonLat[] = Array.from({length: 65}, (_, j) => interp(j / 64) as LonLat);
        const dd = pathOfLines([pts], proj, p);
        svg.push(<path key={k(i, 'ds')} d={dd} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={9} strokeLinecap="round" />);
        svg.push(<path key={k(i, 'd')} d={dd} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" />);
        const a = proj(o.from), b = proj(o.to), head = proj(interp(p) as LonLat);
        if (a) svg.push(<circle key={k(i, 'da')} cx={a[0]} cy={a[1]} r={9} fill={col} stroke="#000" strokeOpacity={0.5} strokeWidth={3} />);
        if (head && p < 1) svg.push(<circle key={k(i, 'dh')} cx={head[0]} cy={head[1]} r={6} fill="#fff" />);
        if (b && p >= 1) svg.push(<circle key={k(i, 'db')} cx={b[0]} cy={b[1]} r={9} fill={col} stroke="#000" strokeOpacity={0.5} strokeWidth={3} />);
        if (a && b) {
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          let nx = -(b[1] - a[1]), ny = b[0] - a[0];
          const L = Math.hypot(nx, ny) || 1;
          nx /= L; ny /= L;
          if (ny > 0) { nx = -nx; ny = -ny; } // label above the line
          const off = 62;
          html.push(<Pill key={k(i, 'dl')} x={mx + nx * off} y={my + ny * off} text={countUp(o.text, p)} color={col} a={smooth((t - (o.t ?? 0)) / 0.5)} size={40} />);
        }
        break;
      }
      case 'ring': {
        const p = prog(t, o, 1.8);
        const col = colorOf(o.color);
        const c = geoCircle().center(o.pos).radius((o.km / EARTH_KM) * (180 / Math.PI)).precision(1)();
        under.push(<path key={k(i, 'rf')} d={pathOf(c, proj)} fill={col} fillOpacity={0.1 * p} />);
        svg.push(<path key={k(i, 'r')} d={pathOfLines([c.coordinates[0] as LonLat[]], proj, p)} fill="none" stroke={col} strokeWidth={3} strokeDasharray="12 8" />);
        if (o.text) {
          const top = proj(c.coordinates[0][0] as LonLat); // northernmost-ish start point
          const ctr = proj(o.pos);
          if (top && ctr) html.push(<Pill key={k(i, 'rt')} x={ctr[0]} y={Math.min(top[1], ctr[1]) - 50} text={o.text} color={col} a={smooth((t - (o.t ?? 0) - 1) / LABEL_IN)} size={28} />);
        }
        break;
      }
      case 'marker': {
        const pt = proj(o.pos);
        if (!onScreen(pt)) break;
        const a = appear(t, o);
        const col = colorOf(o.color ?? 'white');
        const pulse = ((t - (o.t ?? 0)) % 2.2) / 2.2;
        svg.push(<circle key={k(i, 'mp')} cx={pt![0]} cy={pt![1]} r={10 + pulse * 34} fill="none" stroke={col} strokeOpacity={(1 - pulse) * 0.8 * a} strokeWidth={3} />);
        svg.push(<circle key={k(i, 'm')} cx={pt![0]} cy={pt![1]} r={9 * a} fill={col} stroke="#000" strokeOpacity={0.55} strokeWidth={3} />);
        if (o.text) html.push(<PlaceLabel key={k(i, 'mt')} x={pt![0]} y={pt![1]} text={o.text} a={a} side={o.side} />);
        break;
      }
      case 'label': {
        const pt = proj(o.pos);
        if (!onScreen(pt)) break;
        const a = appear(t, o);
        html.push(<Label key={k(i, 'lb')} x={pt![0]} y={pt![1]} o={o} a={a} />);
        break;
      }
    }
  });

  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {under}
        {svg}
      </svg>
      <div style={{position: 'absolute', inset: 0}}>{html}</div>
    </>
  );
};

const PlaceLabel: React.FC<{x: number; y: number; text: string; a: number; side?: 'left' | 'right'}> = ({x, y, text, a, side = 'right'}) => (
  <div style={{position: 'absolute', left: x + (side === 'right' ? 22 : -22), top: y, opacity: a,
    transform: `translate(${side === 'right' ? '0' : '-100%'}, -50%) translateX(${(1 - a) * (side === 'right' ? -10 : 10)}px)`,
    fontFamily: FONT_SANS, fontWeight: 600, fontSize: 30, color: '#fff', textShadow: SHADOW, whiteSpace: 'nowrap'}}>{text}</div>
);

const Label: React.FC<{x: number; y: number; o: Extract<Overlay, {type: 'label'}>; a: number}> = ({x, y, o, a}) => {
  if (o.kind === 'place') return <PlaceLabel x={x} y={y} text={o.text} a={a} side={o.side} />;
  if (o.kind === 'callout')
    return (
      <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: `translate(-50%,-50%) translateY(${(1 - a) * 12}px)`,
        background: COLORS.ink, borderLeft: `6px solid ${COLORS.accent}`, padding: '12px 22px', borderRadius: 6, maxWidth: 520,
        fontFamily: FONT_SANS, fontWeight: 600, fontSize: 28, lineHeight: 1.25, color: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>{o.text}</div>
    );
  const style: Record<string, React.CSSProperties> = {
    country: {fontFamily: FONT_SANS, fontWeight: 800, fontSize: 40, letterSpacing: `${0.32 - a * 0.08}em`, textTransform: 'uppercase', color: '#fff'},
    region: {fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)'},
    water: {fontFamily: FONT_SERIF, fontWeight: 600, fontStyle: 'italic', fontSize: 34, letterSpacing: '0.06em', color: COLORS.blue},
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: 'translate(-50%,-50%)', whiteSpace: 'pre', textAlign: 'center',
      textShadow: SHADOW, lineHeight: 1.15, ...style[o.kind]}}>{o.text}</div>
  );
};
