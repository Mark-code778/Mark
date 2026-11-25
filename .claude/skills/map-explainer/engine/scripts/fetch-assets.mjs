// Downloads Natural Earth vector data (public domain) into public/geo/ and fonts into public/fonts/ (once).
import fs from 'node:fs';
import path from 'node:path';
const base = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const files = [
  'ne_10m_admin_0_countries.geojson',      // country polygons + borders (close views)
  'ne_50m_admin_0_countries.geojson',      // lighter, for world/continent views
  'ne_10m_coastline.geojson',              // coastlines that draw on
  'ne_10m_admin_0_boundary_lines_land.geojson', // land borders only (nicer than polygon outlines)
  'ne_10m_admin_0_boundary_lines_maritime_indicator.geojson', // sea borders (dashed)
  'ne_10m_admin_1_states_provinces_lines.geojson', // state/province lines
  'ne_10m_populated_places_simple.geojson', // towns + populations
  'ne_10m_geography_regions_points.geojson',
  'ne_10m_geography_marine_polys.geojson', // seas, straits, bays (for water labels)
];
const out = path.resolve('public/geo');
fs.mkdirSync(out, {recursive: true});
for (const f of files) {
  const dest = path.join(out, f.replace('.geojson', '.json'));
  if (fs.existsSync(dest)) { console.log('have', f); continue; }
  const r = await fetch(base + f);
  if (!r.ok) { console.error('FAILED', f, r.status); continue; }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  console.log('got', f, (fs.statSync(dest).size / 1e6).toFixed(1) + ' MB');
}

// Fonts with Cyrillic (Google Fonts, OFL): Inter for labels/UI, Playfair Display for headlines.
const fontDir = path.resolve('public/fonts');
fs.mkdirSync(fontDir, {recursive: true});
const fonts = [
  ['Inter', '400', 'normal', 'Inter-400.ttf'], ['Inter', '600', 'normal', 'Inter-600.ttf'], ['Inter', '800', 'normal', 'Inter-800.ttf'],
  ['Playfair+Display', '600', 'normal', 'PlayfairDisplay-600.ttf'], ['Playfair+Display', '800', 'normal', 'PlayfairDisplay-800.ttf'],
  ['Playfair+Display', '600', 'italic', 'PlayfairDisplay-600i.ttf'],
];
for (const [fam, wght, style, file] of fonts) {
  const dest = path.join(fontDir, file);
  if (fs.existsSync(dest)) continue;
  const spec = style === 'italic' ? `ital,wght@1,${wght}` : `wght@${wght}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${fam}:${spec}`, {headers: {'User-Agent': 'Mozilla/4.0'}})).text();
  const url = css.match(/src: url\((.*?)\)/)?.[1];
  if (!url) { console.error('FAILED font', file); continue; }
  fs.writeFileSync(dest, Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log('got', file);
}
