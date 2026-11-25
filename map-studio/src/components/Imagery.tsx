import React, {useLayoutEffect, useRef} from 'react';
import {GeoProjection} from 'd3-geo';
import {Cam, GeoImage} from '../lib/types';
import {CLOSE_FULL, CLOSE_START, COLORS, GRADE, H, W, EARTH_KM} from '../lib/theme';
import {smooth} from '../lib/camera';

export type LoadedImage = GeoImage & {img: HTMLImageElement};

/** Draws an equirectangular (EPSG:4326) image into the current projection, warped in horizontal strips. */
function drawGeo(ctx: CanvasRenderingContext2D, im: LoadedImage, proj: GeoProjection) {
  const iw = im.img.naturalWidth, ih = im.img.naturalHeight;
  const xa = proj([im.w, (im.n + im.s) / 2]), xb = proj([im.e, (im.n + im.s) / 2]);
  if (!xa || !xb) return;
  const x1 = xa[0], x2 = xb[0];
  if (x2 <= x1) return;
  const dx0 = Math.max(0, x1), dx1 = Math.min(W, x2);
  if (dx1 <= dx0) return;
  const sx = ((dx0 - x1) / (x2 - x1)) * iw, sw = ((dx1 - dx0) / (x2 - x1)) * iw;
  const STRIPS = 64;
  for (let i = 0; i < STRIPS; i++) {
    const la0 = im.n - ((im.n - im.s) * i) / STRIPS, la1 = im.n - ((im.n - im.s) * (i + 1)) / STRIPS;
    const ya = proj([(im.w + im.e) / 2, la0]), yb = proj([(im.w + im.e) / 2, la1]);
    if (!ya || !yb) continue;
    const y0 = ya[1], y1 = yb[1];
    if (y1 < 0 || y0 > H) continue;
    const sy = (ih * i) / STRIPS, sh = ih / STRIPS;
    // +0.6px overlap hides seams between strips
    ctx.drawImage(im.img, sx, sy, sw, sh, dx0, y0, dx1 - dx0, y1 - y0 + 0.6);
  }
}

/** Flat Mercator satellite map (Blue Marble, Landsat fading in for close-ups). */
export const MapImagery: React.FC<{images: LoadedImage[]; proj: GeoProjection; cam: Cam}> = ({images, proj, cam}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.fillStyle = '#0b2440';
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const close = smooth((Math.log(CLOSE_START) - Math.log(cam.span)) / (Math.log(CLOSE_START) - Math.log(CLOSE_FULL)));
    for (const im of images) {
      ctx.globalAlpha = im.layer === 'close' ? close : 1;
      if (ctx.globalAlpha > 0.001) drawGeo(ctx, im, proj);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, filter: GRADE}} />;
};

// deterministic star field
const STARS = Array.from({length: 420}, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return [r(1) * W, r(2) * H, r(3) * 1.4 + 0.3, r(4) * 0.7 + 0.15];
});

/** Orthographic globe from an equirectangular Blue Marble texture, reprojected per pixel. */
export const GlobeImagery: React.FC<{tex: {w: number; h: number; data: Uint8ClampedArray}; cam: Cam}> = ({tex, cam}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const R = (W * EARTH_KM) / cam.span;
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.fillStyle = COLORS.space;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (const [x, y, s, a] of STARS) {
      ctx.globalAlpha = a;
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
    const cx = W / 2, cy = H / 2;
    const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W, Math.ceil(cx + R));
    const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H, Math.ceil(cy + R));
    if (x1 <= x0 || y1 <= y0) return;
    const out = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
    const o = out.data;
    const l0 = (cam.center[0] * Math.PI) / 180, p0 = (cam.center[1] * Math.PI) / 180;
    const sp = Math.sin(p0), cp = Math.cos(p0);
    const {w: tw, h: th, data: td} = tex;
    const ow = x1 - x0;
    for (let y = y0; y < y1; y++) {
      const Y = -(y + 0.5 - cy) / R;
      for (let x = x0; x < x1; x++) {
        const X = (x + 0.5 - cx) / R;
        const rr = X * X + Y * Y;
        if (rr > 1) continue;
        const Z = Math.sqrt(1 - rr);
        const lat = Math.asin(Z * sp + Y * cp);
        const lon = l0 + Math.atan2(X, Z * cp - Y * sp);
        let u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
        const v = 0.5 - lat / Math.PI;
        const tx = Math.min(tw - 1, (u * tw) | 0), ty = Math.min(th - 1, (v * th) | 0);
        const ti = (ty * tw + tx) * 4;
        const shade = 0.5 + 0.5 * Math.pow(Z, 0.6);
        const oi = ((y - y0) * ow + (x - x0)) * 4;
        // soft anti-aliased limb
        const edge = Math.min(1, (1 - Math.sqrt(rr)) * R);
        o[oi] = o[oi] * (1 - edge) + td[ti] * shade * edge;
        o[oi + 1] = o[oi + 1] * (1 - edge) + td[ti + 1] * shade * edge;
        o[oi + 2] = o[oi + 2] * (1 - edge) + td[ti + 2] * shade * edge;
      }
    }
    ctx.putImageData(out, x0, y0);
  });
  return (
    <>
      <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, filter: GRADE}} />
      {/* atmosphere */}
      <div style={{position: 'absolute', left: W / 2 - R * 1.12, top: H / 2 - R * 1.12, width: R * 2.24, height: R * 2.24, borderRadius: '50%',
        background: 'radial-gradient(circle closest-side, rgba(110,170,255,0) 86%, rgba(120,180,255,0.42) 89.3%, rgba(80,140,255,0.12) 93.5%, rgba(80,140,255,0) 100%)'}} />
    </>
  );
};
