// Usage: node scripts/frames.mjs out/frames.jpg 40 160 300 ...  -> renders those frames and tiles them 2 across (960x540 each)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [out, ...frames] = process.argv.slice(2);
const browserExecutable = fs.existsSync('/opt/pw-browsers/chromium-1243/chrome-linux64/chrome') ? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' : null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'MapExplainer', browserExecutable});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
const files = [];
for (const f of frames) {
  const file = path.join(tmp, `${f}.jpg`);
  await renderStill({serveUrl, composition: comp, frame: Number(f), output: file, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable});
  files.push(file);
}
const n = files.length, cols = n > 1 ? 2 : 1;
const filt = files.map((_, i) => `[${i}:v]scale=960:540,drawtext=text='f${frames[i]}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(';');
const layout = files.map((_, i) => `${(i % cols) * 960}_${Math.floor(i / cols) * 540}`).join('|');
fs.mkdirSync(path.dirname(out), {recursive: true});
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
  n > 1 ? `${filt};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${n}:layout=${layout}:fill=black` : filt.replace(/\[v0\]$/, ''), '-q:v', '3', out]);
fs.rmSync(tmp, {recursive: true});
console.log('wrote', out);
