// Usage: npx tsx scripts/prepare.ts <slug>
// Reads videos/<slug>/shots.json (+ timeline.json, voiceover.mp3 if present) and writes public/current/:
//   video.json  – shots with frame timing + the satellite images each shot needs
//   geo.json    – Natural Earth layers cropped to the places the video visits
//   world.json  – light world outlines for globe views
// Satellite imagery is downloaded (once, cached) from NASA GIBS into public/tiles/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {geoBounds} from 'd3-geo';
import {cameraAt, resolveShots, viewBox} from '../src/lib/camera';
import {CLOSE_START, FPS, GLOBE_FULL, W} from '../src/lib/theme';
import type {GeoImage, Shot, VideoData, VideoMeta} from '../src/lib/types';

const slug = process.argv[2];
if (!slug) throw new Error('usage: prepare.ts <slug>');
const dir = path.resolve('videos', slug);
const src = JSON.parse(fs.readFileSync(path.join(dir, 'shots.json'), 'utf8')) as {meta: VideoMeta; shots: Shot[]};
const cur = path.resolve('public/current');
const tiles = path.resolve('public/tiles');
fs.mkdirSync(cur, {recursive: true});
fs.mkdirSync(tiles, {recursive: true});

const LAYERS = {
  wide: {name: 'BlueMarble_ShadedRelief_Bathymetry', maxPxPerDeg: 240},
  close: {name: 'Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual', maxPxPerDeg: 3600},
};
const MAX_PX = 12000;

// ---------- timing ----------
const shots = resolveShots(src.shots);
const tlPath = path.join(dir, 'timeline.json');
const timeline = fs.existsSync(tlPath) ? (JSON.parse(fs.readFileSync(tlPath, 'utf8')) as {shots: {id: string; start: number; end: number}[]}) : null;
let acc = 0;
const timed = shots.map((s, i) => {
  let from: number, frames: number;
  if (timeline) {
    const t = timeline.shots.find((x) => x.id === s.id);
    if (!t) throw new Error('timeline missing shot ' + s.id);
    const next = timeline.shots[i + 1];
    from = i === 0 ? 0 : Math.round(t.start * FPS);
    const end = next ? Math.round(next.start * FPS) : Math.round((t.end + 2) * FPS);
    frames = end - from;
  } else {
    from = acc;
    frames = Math.round(s.duration * FPS);
  }
  acc = from + frames;
  return {s, from, frames};
});

// ---------- imagery ----------

async function fetchWms(layer: string, w: number, s: number, e: number, n: number, pxW: number, pxH: number) {
  // EPSG:4326 is GIBS's native grid: full resolution and no antimeridian artefacts. The renderer warps it to Mercator.
  const key = crypto.createHash('md5').update(['4326', layer, w, s, e, n, pxW, pxH].map(String).join('|')).digest('hex').slice(0, 12);
  const file = path.join(tiles, `${key}.jpg`);
  if (!fs.existsSync(file)) {
    const url = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${layer}&STYLES=&CRS=EPSG:4326&BBOX=${s},${w},${n},${e}&WIDTH=${pxW}&HEIGHT=${pxH}&FORMAT=image/jpeg`;
    for (let attempt = 1; ; attempt++) {
      try {
        const r = await fetch(url);
        if (!r.ok || !(r.headers.get('content-type') ?? '').includes('image')) throw new Error(`${r.status} ${await r.text().catch(() => '')}`.slice(0, 200));
        fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
        console.log(`  fetched ${layer.split('_')[0]} ${pxW}x${pxH} -> ${key}.jpg`);
        break;
      } catch (err) {
        if (attempt >= 4) throw err;
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      }
    }
  }
  return `tiles/${key}.jpg`;
}

async function imagesFor(cam: {from: any; to: any}): Promise<GeoImage[]> {
  type B = {w: number; s: number; e: number; n: number; need: number};
  const buckets = new Map<string, B>();
  for (let i = 0; i <= 40; i++) {
    const c = cameraAt(cam, i / 40);
    if (c.span >= GLOBE_FULL) continue;
    const v = viewBox(c);
    const pxPerDeg = (W / (c.span / (111.32 * Math.cos((c.center[1] * Math.PI) / 180)))) * 1.2;
    const level = Math.floor(Math.log2(c.span) / 2);
    for (const layer of ['wide', 'close'] as const) {
      if (layer === 'close' && c.span > CLOSE_START) continue;
      const need = Math.min(pxPerDeg, LAYERS[layer].maxPxPerDeg);
      const k = `${layer}|${level}`;
      const b = buckets.get(k);
      if (!b) buckets.set(k, {...v, need});
      else buckets.set(k, {w: Math.min(b.w, v.w), e: Math.max(b.e, v.e), s: Math.min(b.s, v.s), n: Math.max(b.n, v.n), need: Math.max(b.need, need)});
    }
  }
  const out: GeoImage[] = [];
  for (const [k, b] of buckets) {
    const [layer, lv] = k.split('|') as ['wide' | 'close', string];
    // split at the antimeridian
    const pieces: [number, number, number][] = []; // [w,e,shift]
    if (b.w < -180) pieces.push([b.w + 360, 180, -360], [-180, b.e, 0]);
    else if (b.e > 180) pieces.push([b.w, 180, 0], [-180, b.e - 360, 360]);
    else pieces.push([b.w, b.e, 0]);
    for (const [w, e] of pieces) {
      if (e - w < 1e-4) continue;
      let need = b.need;
      const latStretch = 1 / Math.cos((((b.n + b.s) / 2) * Math.PI) / 180);
      const hDeg = (b.n - b.s) * latStretch; // rows per degree of latitude follow Mercator's local stretch
      const big = Math.max(e - w, hDeg) * need;
      if (big > MAX_PX) need *= MAX_PX / big;
      const pxW = Math.max(16, Math.round((e - w) * need));
      const pxH = Math.max(16, Math.round(hDeg * need));
      const ee = e >= 180 ? 179.99999 : e;
      const ww = w <= -180 ? -179.99999 : w;
      const file = await fetchWms(LAYERS[layer].name, ww, b.s, ee, b.n, pxW, pxH);
      out.push({file, layer, w: ww, s: b.s, e: ee, n: b.n, level: Number(lv)});
    }
  }
  // draw order: wide before close, coarse (high level) before fine
  return out.sort((a, b) => (a.layer === b.layer ? b.level - a.level : a.layer === 'wide' ? -1 : 1));
}

async function worldImage() {
  const file = path.join(tiles, 'world.jpg');
  if (!fs.existsSync(file)) {
    const url = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${LAYERS.wide.name}&STYLES=&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=8192&HEIGHT=4096&FORMAT=image/jpeg`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('world image ' + r.status);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    console.log('  fetched world.jpg (globe texture)');
  }
}

// ---------- geo crop ----------
type Box = {w: number; s: number; e: number; n: number};
function lonOverlap(a0: number, a1: number, b0: number, b1: number) {
  for (const k of [-360, 0, 360]) if (a0 + k <= b1 && a1 + k >= b0) return true;
  return false;
}
function hits(f: any, boxes: Box[]) {
  const [[w, s], [e, n]] = geoBounds(f);
  const segs: [number, number][] = e >= w ? [[w, e]] : [[w, 180], [-180, e]];
  return boxes.some((b) => n >= b.s && s <= b.n && segs.some(([x0, x1]) => lonOverlap(x0, x1, b.w, b.e)));
}
const load = (f: string) => JSON.parse(fs.readFileSync(path.resolve('public/geo', f), 'utf8'));
const slim = (fc: any, boxes: Box[], keep: string[] = []) => ({
  type: 'FeatureCollection',
  features: fc.features.filter((f: any) => f.geometry && hits(f, boxes)).map((f: any) => ({type: 'Feature', geometry: f.geometry, properties: Object.fromEntries(keep.map((k) => [k, f.properties[k]]))})),
});

(async () => {
  await worldImage();
  const boxes: Box[] = [];
  const outShots: VideoData['shots'] = [];
  for (const {s, from, frames} of timed) {
    const {cam, allOverlays, ...rest} = s;
    let images: GeoImage[] = [];
    {
      console.log(`shot ${s.id}`);
      images = await imagesFor(cam);
      for (let i = 0; i <= 10; i++) {
        const c = cameraAt(cam, i / 10);
        if (c.span < GLOBE_FULL) boxes.push(viewBox(c, 0.3));
      }
    }
    outShots.push({...(rest as Shot), camera: cam, overlays: allOverlays, keep: false, from, frames, images});
  }
  const usesStates = src.shots.some((s) => s.overlays?.some((o) => o.type === 'borders' && o.states));
  const geo = {
    coast: slim(load('ne_10m_coastline.json'), boxes),
    borders: slim(load('ne_10m_admin_0_boundary_lines_land.json'), boxes),
    maritime: slim(load('ne_10m_admin_0_boundary_lines_maritime_indicator.json'), boxes),
    states: usesStates ? slim(load('ne_10m_admin_1_states_provinces_lines.json'), boxes) : {type: 'FeatureCollection', features: []},
    countries: slim(load('ne_10m_admin_0_countries.json'), boxes, ['ADM0_A3', 'NAME_RU']),
  };
  fs.writeFileSync(path.join(cur, 'geo.json'), JSON.stringify(geo));
  if (!fs.existsSync(path.join(cur, 'world.json'))) {
    const w = load('ne_50m_admin_0_countries.json');
    fs.writeFileSync(path.join(cur, 'world.json'), JSON.stringify(slim(w, [{w: -180, e: 180, s: -90, n: 90}], ['ADM0_A3'])));
  }
  const vo = ['voiceover.mp3', '../../voiceover.mp3'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f)) ?? (fs.existsSync('voiceover.mp3') ? path.resolve('voiceover.mp3') : null);
  if (vo) fs.copyFileSync(vo, path.join(cur, 'voiceover.mp3'));
  const data: VideoData = {meta: src.meta, fps: FPS, shots: outShots, audio: vo ? 'current/voiceover.mp3' : null, totalFrames: acc};
  fs.writeFileSync(path.join(cur, 'video.json'), JSON.stringify(data, null, 1));
  console.log(`ok: ${outShots.length} shots, ${(acc / FPS).toFixed(1)} s, geo ${(fs.statSync(path.join(cur, 'geo.json')).size / 1e6).toFixed(1)} MB, audio: ${vo ? 'yes' : 'no'}`);
})();
