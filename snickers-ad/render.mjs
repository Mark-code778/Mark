import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import { spawn } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('.');
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{ const p=path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'}); r.end(d);});});
await new Promise(res=>srv.listen(0,res)); const port = srv.address().port;
const mode = process.argv[2];
const browser = await chromium.launch({ args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
async function newPage(){ const page = await browser.newPage({ viewport:{width:1920,height:1080}, deviceScaleFactor:1 });
  page.on('pageerror', e=>console.error('PAGEERR', e.message)); page.on('console', m=>{ if(m.type()==='error') console.error('CONSOLE', m.text()); });
  await page.goto(`http://localhost:${port}/src/index.html`); await page.waitForFunction('window.READY===true', null, {timeout:180000}); return page; }
if (mode === 'stills') {
  const page = await newPage(); fs.mkdirSync('stills',{recursive:true});
  for (const t of process.argv.slice(3).map(Number)) { const t0=Date.now(); await page.evaluate(x=>window.renderAt(x), t); await page.screenshot({path:`stills/t${t.toFixed(2)}.jpg`, type:'jpeg', quality:85}); console.log(t, Date.now()-t0,'ms'); }
} else {
  // frames mode: worker index, workers count
  const [wi, wn] = [Number(process.argv[3]), Number(process.argv[4])];
  const FPS=60, N=1200; const per=Math.ceil(N/wn); const a=wi*per, b=Math.min(N,a+per);
  const page = await newPage();
  const ff = spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','60','-c:v','png','-i','-','-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-r','60',`out/seg${wi}.mp4`],{stdio:['pipe','inherit','inherit']});
  const t0=Date.now();
  for (let f=a; f<b; f++){ await page.evaluate(x=>window.renderAt(x), f/FPS); const buf = await page.screenshot({type:'png'}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if((f-a)%60===0) console.log(`w${wi} frame ${f} ${((Date.now()-t0)/(f-a+1)).toFixed(0)}ms/f`); }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
}
await browser.close(); srv.close();
