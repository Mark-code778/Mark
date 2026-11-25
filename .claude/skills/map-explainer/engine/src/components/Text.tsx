import React from 'react';
import {OnScreenText as OST, Cam} from '../lib/types';
import {COLORS, FONT_SANS, FONT_SERIF, H, SHADOW, W} from '../lib/theme';
import {smooth, globeWeight} from '../lib/camera';
import {fmtCoord, fmtKm} from '../lib/geo';

/** On-screen text styles: hook (cold-open question), number (big reveal), caption (lower third), chapter (section card). */
export const OnScreenText: React.FC<{v: OST; t: number; dur: number}> = ({v, t, dur}) => {
  const o = typeof v === 'string' ? {text: v, style: 'caption' as const} : v;
  const t0 = o.t ?? 0.3;
  const lt = t - t0;
  if (lt < 0) return null;
  const out = 1 - smooth((t - (dur - 0.35)) / 0.35);
  const a = smooth(lt / 0.5) * out;
  switch (o.style ?? 'caption') {
    case 'hook': {
      const words = o.text.split(' ');
      return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${0.55 * out}) 0%, rgba(0,0,0,0) 70%)`}}>
          <div style={{maxWidth: 1450, textAlign: 'center', fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 92, lineHeight: 1.12, color: '#fff', textShadow: SHADOW}}>
            {words.map((w, i) => {
              const wa = smooth((lt - i * 0.09) / 0.4) * out;
              const hi = /\d/.test(w);
              return <span key={i} style={{opacity: wa, display: 'inline-block', transform: `translateY(${(1 - wa) * 18}px)`, color: hi ? COLORS.accent : '#fff', marginRight: '0.24em'}}>{w}</span>;
            })}
          </div>
        </div>
      );
    }
    case 'number':
      return (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: a, transform: `scale(${0.94 + 0.06 * a})`}}>
          {o.kicker && <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', textShadow: SHADOW, marginBottom: 6}}>{o.kicker}</div>}
          <div style={{fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 168, lineHeight: 1, color: COLORS.accent, textShadow: SHADOW, fontVariantNumeric: 'lining-nums'}}>{o.text}</div>
        </div>
      );
    case 'chapter':
      return (
        <div style={{position: 'absolute', left: 110, top: 96, opacity: a, transform: `translateX(${(1 - a) * -20}px)`}}>
          {o.kicker && <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.32em', textTransform: 'uppercase', color: COLORS.accent, textShadow: SHADOW, marginBottom: 10}}>{o.kicker}</div>}
          <div style={{fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: '#fff', textShadow: SHADOW, maxWidth: 1100}}>{o.text}</div>
        </div>
      );
    default:
      return (
        <div style={{position: 'absolute', left: 110, bottom: 140, opacity: a, transform: `translateY(${(1 - a) * 14}px)`, display: 'flex'}}>
          <div style={{width: 7, background: COLORS.accent, borderRadius: 2}} />
          <div style={{background: COLORS.ink, padding: '16px 28px', fontFamily: FONT_SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: '#fff', maxWidth: 1100, boxShadow: '0 8px 30px rgba(0,0,0,0.4)'}}>{o.text}</div>
        </div>
      );
  }
};

/** Title card (kind: "title"): the map behind is dimmed and blurred by the Shot. */
export const TitleCard: React.FC<{kicker?: string; text: string; t: number; dur: number}> = ({kicker, text, t, dur}) => {
  const a = smooth((t - 0.2) / 0.7) * (1 - smooth((t - (dur - 0.4)) / 0.4));
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
      {kicker && <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.4em', textTransform: 'uppercase', color: COLORS.accent, marginBottom: 22}}>{kicker}</div>}
      <div style={{width: 90 * a, height: 3, background: COLORS.accent, marginBottom: 30}} />
      <div style={{fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 96, color: '#fff', textAlign: 'center', maxWidth: 1400, lineHeight: 1.1, textShadow: SHADOW}}>{text}</div>
    </div>
  );
};

const nice = (km: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(km)));
  for (const m of [5, 2, 1]) if (m * p <= km) return m * p;
  return p;
};

/** Documentary HUD: coordinates + scale bar, bottom left. */
export const Hud: React.FC<{cam: Cam}> = ({cam}) => {
  const a = 1 - globeWeight(cam.span);
  if (a <= 0.01) return null;
  const km = nice((cam.span / W) * 240);
  const px = (km / cam.span) * W;
  return (
    <div style={{position: 'absolute', left: 110, bottom: 56, opacity: 0.85 * a, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 19, color: '#fff', letterSpacing: '0.08em', textShadow: SHADOW}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 10}}>
        <div style={{width: px, height: 9, borderLeft: '2px solid #fff', borderRight: '2px solid #fff', borderBottom: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.6)'}} />
        <div>{fmtKm(km, 0)}</div>
      </div>
      <div style={{fontVariantNumeric: 'tabular-nums'}}>{fmtCoord(cam.center[0], cam.center[1])}</div>
    </div>
  );
};

export const Vignette: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 75% 70% at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%), linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.35))'}} />
);

