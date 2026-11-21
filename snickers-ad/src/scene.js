import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------- timeline (seconds, voice starts at 1.2s) ----------
const T = {
  w1: 1.2, w2: 2.96, w3: 4.24, zero: 5.48, all: 6.98, tv: 8.12, hit: 8.7, brk: 8.95,
  car: 9.56, nug: 10.26, choc: 10.9, out: 11.65, chg0: 12.0, chg1: 13.45,
  pack: 13.9, sl1: 15.16, sl2: 15.6, sl3: 15.68, tag: 16.4, end: 20,
};

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eOut = (k) => 1 - Math.pow(1 - k, 3);
const eIn = (k) => k * k * k;
const eIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eBack = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const col = (h) => new THREE.Color(h);

// ---------- renderer ----------
const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('cv').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
camera.position.set(0, 0, 10);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.6, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// lights
const amb = new THREE.HemisphereLight(0xfff1e0, 0x20140c, 0.5); scene.add(amb);
const key = new THREE.DirectionalLight(0xffe2b8, 2.4); key.position.set(4, 5, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x9fc4ff, 1.6); rim.position.set(-6, 3, -4); scene.add(rim);
const sweep = new THREE.PointLight(0xfff0d0, 0, 12, 1.5); scene.add(sweep);

// ---------- background shader ----------
const bgMat = new THREE.ShaderMaterial({
  depthWrite: false, toneMapped: false,
  uniforms: { c1: { value: col('#1b2230') }, c2: { value: col('#06080c') }, rays: { value: 0 }, time: { value: 0 }, glowPos: { value: new THREE.Vector2(0.65, 0.5) }, grain: { value: 0.035 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.9999,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform vec3 c1; uniform vec3 c2; uniform float rays; uniform float time; uniform vec2 glowPos; uniform float grain;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 p = vUv - glowPos; p.x *= 1.7777;
      float d = length(p);
      vec3 c = mix(c1, c2, smoothstep(0.0, 1.05, d));
      float a = atan(p.y, p.x);
      float r = pow(abs(sin(a*9.0 + time*0.25)), 18.0) * smoothstep(1.2, 0.05, d);
      c += c1 * r * rays * 0.9;
      c += (h(vUv*vec2(1920.0,1080.0) + fract(time*7.0)*100.0) - 0.5) * grain;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
bg.frustumCulled = false; bg.renderOrder = -10;
scene.add(bg);

// ---------- materials ----------
const M = {
  choc: new THREE.MeshPhysicalMaterial({ color: '#3b1b0e', roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  chocLight: new THREE.MeshPhysicalMaterial({ color: '#5a2c16', roughness: 0.4, clearcoat: 0.5 }),
  nougat: new THREE.MeshStandardMaterial({ color: '#dcc095', roughness: 0.9 }),
  caramel: new THREE.MeshPhysicalMaterial({ color: '#c8650c', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, emissive: '#2a0e00', emissiveIntensity: 0.3 }),
  peanut: new THREE.MeshStandardMaterial({ color: '#c58a4e', roughness: 0.6 }),
  peanutIn: new THREE.MeshStandardMaterial({ color: '#e7bb7a', roughness: 0.7 }),
};

// ---------- battery ----------
function makeBattery() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new RoundedBoxGeometry(1.36, 2.56, 0.86, 5, 0.22), new THREE.MeshStandardMaterial({ color: '#07090d', roughness: 0.6, metalness: 0.1, envMapIntensity: 0.15 }));
  g.add(core);
  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.56, 2.76, 1.04, 6, 0.3), new THREE.MeshPhysicalMaterial({ color: '#3a4760', roughness: 0.08, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 0.6 }));
  shell.renderOrder = 2; g.add(shell);
  const fg = new RoundedBoxGeometry(1.14, 2.34, 0.9, 4, 0.12); fg.translate(0, 1.17, 0);
  const fillMat = new THREE.MeshStandardMaterial({ color: '#ff3b30', emissive: '#ff3b30', emissiveIntensity: 0.9, roughness: 0.35 });
  const fill = new THREE.Mesh(fg, fillMat); fill.position.y = -1.17; g.add(fill);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 40), new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: 1, roughness: 0.25 }));
  nub.position.y = 1.5; g.add(nub);
  // bolt
  const s = new THREE.Shape();
  [[0.12, 0.62], [-0.32, -0.05], [-0.04, -0.05], [-0.14, -0.62], [0.32, 0.08], [0.04, 0.08]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  const bolt = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: '#ffc94a', emissiveIntensity: 1.3 }));
  bolt.position.set(0, 0, 0.56); bolt.scale.setScalar(1.3); g.add(bolt);
  g.userData = { fill, fillMat, bolt, shell };
  return g;
}
const battery = makeBattery(); scene.add(battery);

// charge rings
const rings = [];
for (let i = 0; i < 6; i++) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 12, 96), new THREE.MeshBasicMaterial({ color: '#ffcf5a', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  scene.add(r); rings.push(r);
}

// ---------- chocolate bar (two halves with cross-section) ----------
const BL = 2.1, BH = 0.8, BD = 1.15, BR = 0.1;
function makeHalf(sign) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(BL, BH, BD, 5, BR), M.choc);
  body.position.x = sign * BL / 2; g.add(body);
  // drizzle on top
  const pts = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push(new THREE.Vector3(sign * (0.15 + u * (BL - 0.35)), BH / 2 + 0.01, Math.sin(u * Math.PI * 7) * 0.36)); }
  const dr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.045, 10), M.chocLight);
  g.add(dr);
  // cross-section on the cut face (x = 0), facing -sign
  const face = new THREE.Group();
  face.rotation.y = -sign * Math.PI / 2; face.position.x = -sign * 0.004;
  const fw = BD - 2 * BR - 0.04, fh = BH - 2 * BR - 0.02;
  const nug = new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.04, fh * 0.5), M.nougat); nug.position.y = -fh * 0.22; face.add(nug);
  const car = new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.04, fh * 0.42), M.caramel); car.position.y = fh * 0.25; car.position.z = 0.001; face.add(car);
  const rr = rng(sign > 0 ? 7 : 11);
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), i % 2 ? M.peanut : M.peanutIn);
    p.scale.set(0.075 + rr() * 0.03, 0.055 + rr() * 0.02, 0.025);
    p.position.set(-fw / 2 + 0.1 + (i / 5) * (fw - 0.2) + (rr() - 0.5) * 0.04, fh * 0.2 + (rr() - 0.5) * 0.08, 0.004);
    face.add(p);
  }
  g.add(face);
  return g;
}
const bar = new THREE.Group();
const halfL = makeHalf(-1), halfR = makeHalf(1);
bar.add(halfL, halfR);
scene.add(bar);
// caramel strands between halves
const strands = [];
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true), M.caramel);
  strands.push({ m, y: 0.08 + (i - 1) * 0.04, z: (i - 1) * 0.28, r: 0.05 - Math.abs(i - 1) * 0.012 });
  scene.add(m);
}

// ---------- ingredients ----------
function inst(geo, mat, n) { const m = new THREE.InstancedMesh(geo, mat, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; }
const peanutGeo = new THREE.SphereGeometry(1, 20, 14); peanutGeo.scale(1, 0.72, 0.68);
const caramelGeo = new THREE.SphereGeometry(1, 24, 16); caramelGeo.scale(1, 0.85, 0.9);
const nougatGeo = new RoundedBoxGeometry(1, 1, 1, 3, 0.18);
const chunkGeo = new RoundedBoxGeometry(1, 0.7, 1.2, 2, 0.08);
const ING = [
  { mesh: inst(peanutGeo, M.peanut, 16), t0: T.brk, size: 0.13, seed: 1 },
  { mesh: inst(caramelGeo, M.caramel, 12), t0: T.car, size: 0.12, seed: 2 },
  { mesh: inst(nougatGeo, M.nougat, 12), t0: T.nug, size: 0.17, seed: 3 },
  { mesh: inst(chunkGeo, M.chocLight, 14), t0: T.choc, size: 0.2, seed: 4 },
];
ING.forEach((ing) => {
  const r = rng(ing.seed * 97);
  ing.p = [];
  for (let i = 0; i < ing.mesh.count; i++) {
    const ang = r() * Math.PI * 2;
    // biased away from left text column
    const dir = new THREE.Vector3(Math.cos(ang) * 1.3 + 0.35, Math.sin(ang) * 0.95, 0.2 + r() * 1.4);
    ing.p.push({ dir, dist: 1.4 + r() * 1.8, s: ing.size * (0.7 + r() * 0.7), rot: new THREE.Vector3(r() * 6, r() * 6, r() * 6), spin: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(2.5), ph: r() * 6.28, delay: r() * 0.12 });
  }
});
// crumbs at the break
const crumbs = inst(chunkGeo, M.choc, 26);
const crumbP = []; { const r = rng(555); for (let i = 0; i < 26; i++) crumbP.push({ v: new THREE.Vector3((r() - 0.5) * 3, r() * 2.2 + 0.4, (r() - 0.2) * 2.5), s: 0.03 + r() * 0.05, rot: new THREE.Vector3(r() * 6, r() * 6, r() * 6) }); }

// ---------- wrapped bar (packshot), original wrapper design ----------
function wrapperTexture() {
  const c = document.createElement('canvas'); c.width = 2760; c.height = 510;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#5a2a12'); g.addColorStop(0.5, '#3a180a'); g.addColorStop(1, '#25100a');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  // caramel swoosh
  x.save(); x.translate(c.width / 2, c.height / 2);
  const sg = x.createLinearGradient(-1100, 0, 1100, 0); sg.addColorStop(0, 'rgba(230,150,40,0)'); sg.addColorStop(0.5, 'rgba(240,165,55,0.95)'); sg.addColorStop(1, 'rgba(230,150,40,0)');
  x.fillStyle = sg; x.beginPath(); x.moveTo(-1250, 120); x.bezierCurveTo(-400, -40, 400, 230, 1250, 60); x.lineTo(1250, 110); x.bezierCurveTo(400, 290, -400, 20, -1250, 170); x.closePath(); x.fill();
  x.restore();
  // stripes at both ends
  x.fillStyle = 'rgba(255,205,120,0.85)'; x.fillRect(0, 40, c.width, 6); x.fillRect(0, c.height - 46, c.width, 6);
  // name
  x.font = '900 210px Unbounded'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.lineWidth = 26; x.strokeStyle = '#1d0b04'; x.strokeText('SNICKERS', c.width / 2, c.height / 2 + 6);
  const tg = x.createLinearGradient(0, 150, 0, 360); tg.addColorStop(0, '#fff6e2'); tg.addColorStop(1, '#f3cf8e');
  x.fillStyle = tg; x.fillText('SNICKERS', c.width / 2, c.height / 2 + 6);
  x.font = '700 40px Manrope'; x.fillStyle = 'rgba(255,225,170,0.9)';
  x.fillText('АРАХИС · КАРАМЕЛЬ · НУГА', c.width / 2, c.height - 95);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const pack = new THREE.Group();
let packFront;
{
  const plain = new THREE.MeshPhysicalMaterial({ color: '#3a180a', roughness: 0.28, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
  packFront = new THREE.MeshPhysicalMaterial({ map: null, roughness: 0.25, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.85, 1.3, 6, 0.2), [plain, plain, plain, plain, packFront, plain]);
  pack.add(body);
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(); const L = 0.42, Z = 0.62, n = 9;
    sh.moveTo(0, -Z); sh.lineTo(L, -Z);
    for (let i = 0; i < n; i++) { const z0 = -Z + (2 * Z * i) / n; sh.lineTo(L + 0.06, z0 + Z / n); sh.lineTo(L, z0 + (2 * Z) / n); }
    sh.lineTo(0, Z); sh.closePath();
    const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false }), plain);
    fin.rotation.x = Math.PI / 2; fin.position.set(s * 2.25, 0.035, 0); if (s < 0) fin.rotation.z = Math.PI;
    fin.scale.x = 1; pack.add(fin);
    // ridges on the fin
    for (let k = 0; k < 4; k++) {
      const rg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 1.2), new THREE.MeshPhysicalMaterial({ color: '#6b3a1c', roughness: 0.3, metalness: 0.4 }));
      rg.position.set(s * (2.35 + k * 0.08), 0, 0); pack.add(rg);
    }
  }
  scene.add(pack);
}

// ---------- golden dust ----------
function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,220,150,0.6)'); g.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
const DN = 220; const dustPos = new Float32Array(DN * 3); const dustBase = [];
{ const r = rng(42); for (let i = 0; i < DN; i++) dustBase.push([(r() - 0.5) * 16, (r() - 0.5) * 9, -6 + r() * 9, r() * 6.28, 0.2 + r() * 0.5]); }
const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ size: 0.09, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffcf7a', opacity: 0 });
const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; scene.add(dust);

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const gw = $('gw'), gwBase = gw.querySelector('.base'), gwR = gw.querySelector('.r'), gwC = gw.querySelector('.c');
let gwText = null;
function setWord(txt) {
  if (gwText === txt) return; gwText = txt;
  const html = txt.split('').map((ch) => (ch === '\n' ? '<br>' : `<span class="ch">${ch}</span>`)).join('');
  gwBase.innerHTML = html; gwR.innerHTML = html; gwC.innerHTML = html;
}
const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };
const show = (el, v) => (el.style.display = v ? '' : 'none');
const tmpV = new THREE.Vector3();
function toScreen(obj, off = new THREE.Vector3()) { obj.updateMatrixWorld(); tmpV.copy(off).applyMatrix4(obj.matrixWorld).project(camera); return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H]; }

// ---------- frame ----------
const dummy = new THREE.Object3D();
function hidePoolExcept() {}

window.renderAt = function (t) {
  // ===== background & camera =====
  let c1 = '#1b2230', c2 = '#06080c', rays = 0, gx = 0.68, grain = 0.035;
  if (t >= T.zero) { const k = prog(t, T.zero, T.all); c1 = '#' + col('#1b2230').lerp(col('#2a1214'), k).getHexString(); }
  if (t >= T.hit) { c1 = '#8a4516'; c2 = '#1a0a04'; rays = 1; gx = 0.62; }
  if (t >= T.out) { const k = prog(t, T.out, T.chg0); c1 = '#' + col('#8a4516').lerp(col('#4a2a0c'), k).getHexString(); gx = lerp(0.62, 0.69, k); rays = 0.6; }
  if (t >= T.chg0) { const k = eIO(prog(t, T.chg0, T.chg1)); c1 = '#' + col('#3a2008').lerp(col('#9a5a14'), k).getHexString(); rays = 0.4 + k; }
  if (t >= T.pack) { c1 = '#8c4a18'; c2 = '#170903'; rays = 0.9; gx = 0.5; }
  bgMat.uniforms.c1.value.set(c1); bgMat.uniforms.c2.value.set(c2);
  bgMat.uniforms.rays.value = rays; bgMat.uniforms.time.value = t; bgMat.uniforms.glowPos.value.set(gx, t >= T.pack ? 0.56 : 0.5); bgMat.uniforms.grain.value = grain;

  // camera shake on glitch hits
  let shake = 0;
  for (const w of [T.w1, T.w2, T.w3, T.zero]) shake += Math.max(0, 1 - (t - w) / 0.25) * (t >= w ? 1 : 0);
  shake += (t >= T.hit ? Math.max(0, 1 - (t - T.hit) / 0.35) : 0) * 1.6;
  const cz = t < T.hit ? lerp(10.4, 9.6, prog(t, 0, T.hit)) : t < T.out ? lerp(10, 9.2, prog(t, T.hit, T.out)) : t < T.pack ? 9.6 : lerp(10.2, 9.3, eOut(prog(t, T.pack, T.end)));
  camera.position.set((hash(t * 60) - 0.5) * 0.08 * shake, (hash(t * 60 + 9) - 0.5) * 0.08 * shake, cz);
  camera.lookAt(0, 0, 0);

  // ===== battery =====
  const B = battery, bd = B.userData;
  let bVis = false, level = 0.15, bColor = col('#ff3b30');
  if (t < T.tv + 0.1) {
    bVis = t > 0.2;
    const appear = eBack(prog(t, 0.2, 0.9));
    level = t < T.w2 ? 0.15 : t < T.w3 ? 0.1 : t < T.zero ? 0.06 : lerp(0.06, 0.01, eOut(prog(t, T.zero, T.zero + 1.0)));
    B.position.set(3.1, 0.25 - (1 - appear) * 0.4, 0);
    B.scale.setScalar(Math.max(0.001, appear));
    B.rotation.set(0.08, -0.35 + Math.sin(t * 0.8) * 0.06, 0);
    // falling over
    const fk = prog(t, 7.25, 8.05);
    if (fk > 0) { B.rotation.z = -eIn(fk) * 1.4; B.position.y -= eIn(fk) * 6.5; B.position.x += eIn(fk) * 0.6; }
    bd.bolt.visible = false;
    const blink = t > T.zero ? (Math.floor(t * 4) % 2 ? 0.35 : 1.4) : 0.9;
    bd.fillMat.emissiveIntensity = blink;
  } else if (t >= T.out && t < T.pack + 0.05) {
    bVis = true;
    const k = eBack(prog(t, T.out, T.chg0));
    const ck = eIO(prog(t, T.chg0, T.chg1));
    level = lerp(0.01, 1, ck);
    bColor = ck < 0.5 ? col('#ff3b30').lerp(col('#ff9a1a'), ck * 2) : col('#ff9a1a').lerp(col('#ffd45c'), (ck - 0.5) * 2);
    const zoom = eIn(prog(t, T.pack - 0.32, T.pack + 0.05));
    B.position.set(2.7, lerp(-6, -0.05, k), lerp(0, 8.5, zoom));
    B.scale.setScalar(1.05 + (t > T.chg1 ? Math.max(0, 0.12 * (1 - (t - T.chg1) / 0.3)) : 0));
    B.rotation.set(0.06, -0.3 + Math.sin(t * 1.2) * 0.08 + zoom * 0.5, 0);
    bd.bolt.visible = t > T.chg0 - 0.1;
    const bp = eBack(prog(t, T.chg0 - 0.1, T.chg0 + 0.25));
    bd.bolt.scale.setScalar(1.3 * bp * (1 + 0.08 * Math.sin(t * 18)));
    bd.fillMat.emissiveIntensity = 0.7 + ck * 0.35;
  }
  B.visible = bVis;
  bd.fill.scale.y = Math.max(0.02, level);
  bd.fillMat.color.copy(bColor); bd.fillMat.emissive.copy(bColor);
  // rings
  rings.forEach((r, i) => {
    let vis = false;
    if (t >= T.chg0 && t < T.pack) {
      const period = 0.32; const local = (t - T.chg0 - i * period * (1)) ; const cyc = local - Math.floor(local / (period * 6)) * period * 6;
      if (local >= 0 && t < T.chg1 + 0.6) {
        const a = cyc / 1.1; if (a < 1) { vis = true; r.position.copy(B.position); r.rotation.set(Math.PI / 2 - 0.25, 0, 0); r.scale.setScalar(1 + a * 2.6); r.material.opacity = (1 - a) * 0.9; }
      }
    }
    r.visible = vis;
  });

  // ===== bar =====
  let barVis = t >= T.hit - 0.02 && t < T.out + 0.4;
  bar.visible = barVis;
  if (barVis) {
    const inK = eOut(prog(t, T.hit, T.brk));
    const brk = eOut(prog(t, T.brk, T.brk + 1.1));
    const outK = eIn(prog(t, T.out, T.out + 0.35));
    bar.position.set(lerp(8, 1.7, inK), -0.05 + Math.sin(t * 1.3) * 0.06 + outK * 7, lerp(-2, 0, inK));
    bar.rotation.set(0.32 + Math.sin(t * 0.9) * 0.04, lerp(-2.4, -0.12, inK) + Math.sin(t * 0.7) * 0.05, lerp(0.6, -0.06, inK) + outK * 0.8);
    const sep = brk * 0.55, ang = brk * 0.72;
    halfL.position.set(-sep, brk * 0.05, 0); halfL.rotation.set(0, -ang, brk * 0.1);
    halfR.position.set(sep, -brk * 0.03, 0); halfR.rotation.set(0, ang, -brk * 0.08);
  }
  // caramel strands
  {
    const vis = barVis && t >= T.brk && t < T.out;
    const sk = prog(t, T.brk, T.brk + 1.1);
    strands.forEach((s, i) => {
      const m = s.m; m.visible = vis && sk < 0.97 - i * 0.1;
      if (!m.visible) return;
      const a = new THREE.Vector3(-0.005, s.y, s.z).applyMatrix4(halfL.matrixWorld);
      const b = new THREE.Vector3(0.005, s.y - 0.02, s.z).applyMatrix4(halfR.matrixWorld);
      bar.updateMatrixWorld(true);
      a.set(-0.005, s.y, s.z).applyMatrix4(halfL.matrixWorld); b.set(0.005, s.y - 0.02, s.z).applyMatrix4(halfR.matrixWorld);
      const mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= sk * 0.12;
      const d = b.clone().sub(a); const len = d.length();
      m.position.copy(mid); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      const rad = s.r * (1 - sk * 0.85) + 0.004;
      m.scale.set(rad, len + 0.02, rad);
    });
  }
  // ingredients
  const center = new THREE.Vector3(1.7, 0, 0.3);
  const suckTarget = new THREE.Vector3(2.7, -0.05, 0.3);
  ING.forEach((ing) => {
    const mesh = ing.mesh; let any = false;
    ing.p.forEach((p, i) => {
      const k = prog(t, ing.t0 + p.delay, ing.t0 + p.delay + 1.3);
      let s = 0;
      if (t >= ing.t0 + p.delay && t < T.chg0 + 0.6) {
        any = true;
        const e = eOut(k);
        const pos = center.clone().addScaledVector(p.dir.clone().normalize(), p.dist * e);
        pos.y += Math.sin(t * 1.4 + p.ph) * 0.08 * e;
        s = p.s * eBack(clamp(k * 2.2));
        const sk = eIn(prog(t, T.out + 0.05 + p.delay, T.chg0 + 0.45 + p.delay));
        if (sk > 0) { pos.lerp(suckTarget, sk); s *= 1 - sk; }
        dummy.position.copy(pos);
        dummy.rotation.set(p.rot.x + p.spin.x * t, p.rot.y + p.spin.y * t, p.rot.z + p.spin.z * t);
      }
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.visible = any;
  });
  // crumbs
  {
    const dt = t - T.brk; const vis = dt > 0 && dt < 1.6; crumbs.visible = vis;
    if (vis) {
      bar.updateMatrixWorld(true);
      crumbP.forEach((p, i) => {
        dummy.position.set(1.7 + p.v.x * dt * 0.8, p.v.y * dt * 0.8 - 2.2 * dt * dt, 0.3 + p.v.z * dt * 0.6);
        dummy.rotation.set(p.rot.x + dt * 5, p.rot.y + dt * 4, p.rot.z);
        dummy.scale.setScalar(p.s * (1 - prog(dt, 1.0, 1.6)));
        dummy.updateMatrix(); crumbs.setMatrixAt(i, dummy.matrix);
      });
      crumbs.instanceMatrix.needsUpdate = true;
    }
  }

  // ===== packshot =====
  pack.visible = t >= T.pack - 0.05;
  if (pack.visible) {
    const k = eOut(prog(t, T.pack, T.pack + 0.9));
    pack.position.set(0, lerp(-3.5, 0.55, k) + Math.sin((t - T.pack) * 1.1) * 0.05, lerp(-4, 0, k));
    pack.rotation.set(lerp(1.0, 0.2, k), lerp(-2.6, -0.16, k) + Math.sin((t - T.pack) * 0.6) * 0.07, lerp(0.5, 0.03, k));
    pack.scale.setScalar(1.22);
    const sw = prog(t, T.pack + 0.6, T.pack + 1.7), sw2 = prog(t, 17.6, 18.8);
    const swk = sw > 0 && sw < 1 ? sw : sw2;
    sweep.intensity = swk > 0 && swk < 1 ? Math.sin(swk * Math.PI) * 90 : 0;
    sweep.position.set(lerp(-5, 5, swk), 1.6, 2.6);
  } else sweep.intensity = 0;

  // dust
  const dAlpha = t >= T.hit ? (t < T.out ? 0.55 : t < T.pack ? 0.4 : 0.85) : 0;
  dustMat.opacity = dAlpha;
  for (let i = 0; i < DN; i++) { const b = dustBase[i]; dustPos[i * 3] = b[0] + Math.sin(t * 0.3 + b[3]) * 0.4; dustPos[i * 3 + 1] = ((b[1] + t * b[4] + 4.5) % 9) - 4.5; dustPos[i * 3 + 2] = b[2]; }
  dustGeo.attributes.position.needsUpdate = true;

  // bloom strength
  bloom.strength = t < T.hit ? 0.5 : t < T.pack ? 0.55 + (t > T.chg0 ? eIO(prog(t, T.chg0, T.chg1)) * 0.2 : 0) : 0.5;

  composer.render();

  // ===== DOM =====
  // canvas filter (S2 desaturation)
  const des = prog(t, T.zero, T.all);
  renderer.domElement.style.filter = t < T.hit ? `saturate(${1 - des * 0.75}) brightness(${1 - des * 0.25})` : 'none';
  css($('scan'), { opacity: t < T.hit ? 0.6 : 0 });

  // glitch word
  let word = null;
  if (t >= T.w1 - 0.05) word = 'СОВЕЩАНИЕ.';
  if (t >= T.w2 - 0.05) word = 'ДЕДЛАЙН.';
  if (t >= T.w3 - 0.05) word = 'ПРОБКИ.';
  if (t >= T.zero - 0.05) word = 'ЗАРЯД\nНА НУЛЕ';
  show(gw, word && t < T.tv);
  if (word && t < T.tv) {
    setWord(word);
    const wStart = [T.w1, T.w2, T.w3, T.zero].filter((w) => t >= w - 0.05).pop();
    const lt = t - wStart;
    const glitching = lt < 0.28 || (hash(Math.floor(t * 12)) > 0.9 && t < T.all);
    const fr = Math.floor(t * 60);
    const ox = glitching ? (hash(fr) - 0.5) * 40 : 0;
    gwBase.parentElement.style.color = word.startsWith('ЗАРЯД') ? '#ff5a5a' : '#f4f1ea';
    css(gwR, { transform: `translate(${ox + (glitching ? 8 : 0)}px,0)`, opacity: glitching ? 0.85 : 0 });
    css(gwC, { transform: `translate(${-ox - (glitching ? 8 : 0)}px,0)`, opacity: glitching ? 0.85 : 0 });
    if (glitching) { const a = hash(fr + 3) * 70, b = hash(fr + 7) * 70; gwBase.style.clipPath = `inset(${a}% 0 ${Math.max(0, 100 - a - 30 - b * 0.3)}% 0)`; gwBase.style.transform = `translate(${(hash(fr + 1) - 0.5) * 30}px,0) skewX(${(hash(fr + 2) - 0.5) * 20}deg)`; }
    else { gwBase.style.clipPath = 'none'; gwBase.style.transform = 'none'; }
    if (lt < 0.28) gwBase.style.clipPath = 'none';
    // entrance scale punch
    const pk = eOut(prog(t, wStart - 0.05, wStart + 0.18));
    gw.style.transform = `scale(${lerp(1.12, 1, pk)})`; gw.style.transformOrigin = 'left center';
    gw.style.opacity = pk;
    // falling letters
    const chs = gwBase.querySelectorAll('.ch');
    chs.forEach((ch, i) => {
      const t0 = T.all + 0.05 + i * 0.045 + hash(i) * 0.08; const d = Math.max(0, t - t0);
      ch.style.transform = d > 0 ? `translate(${(hash(i + 5) - 0.5) * 120 * d}px,${1600 * d * d}px) rotate(${(hash(i + 9) - 0.5) * 220 * d}deg)` : 'none';
    });
    if (t > T.all) { gwR.style.opacity = 0; gwC.style.opacity = 0; gwBase.style.clipPath = 'none'; gwBase.style.transform = 'none'; }
  }
  // notification cards
  [[T.w1, 600], [T.w2, 712], [T.w3, 824]].forEach(([t0, top], i) => {
    const el = $('card' + i); const k = eBack(prog(t, t0 + 0.05, t0 + 0.5));
    const vis = t > t0 && t < T.tv; show(el, vis);
    if (!vis) return;
    const d = Math.max(0, t - (T.all + 0.25 + i * 0.12));
    el.style.top = top + 'px';
    el.style.opacity = clamp(k * 1.4);
    el.style.transform = `translate(${lerp(-80, 0, k) + d * 60}px,${1500 * d * d}px) rotate(${(i % 2 ? 1 : -1) * 70 * d}deg)`;
  });
  // battery percent + eco pill
  {
    const vis = t > 0.6 && t < T.tv && t < 7.4; show($('pct'), vis); show($('eco'), vis && t > T.zero + 0.4);
    if (vis) {
      const [sx, sy] = toScreen(battery, new THREE.Vector3(0, -1.7, 0));
      const p = Math.round(level * 100);
      const ap = clamp(prog(t, 0.6, 1.0)) * (1 - prog(t, T.all + 0.1, 7.35));
      css($('pct'), { left: sx + 'px', top: sy + 'px', opacity: ap * (t > T.zero && Math.floor(t * 4) % 2 ? 0.45 : 1) });
      $('pct').textContent = p + '%';
      css($('eco'), { left: sx + 'px', top: sy + 70 + 'px', opacity: ap * eOut(prog(t, T.zero + 0.4, T.zero + 0.7)) });
    }
  }
  // TV power off
  {
    const k = prog(t, T.tv, T.tv + 0.3);
    const on = t >= T.tv && t < T.hit;
    show($('tvT'), on); show($('tvB'), on); show($('tvLine'), on);
    if (on) {
      $('tvT').style.transform = `scaleY(${eIn(k) * 0.998})`; $('tvB').style.transform = `scaleY(${eIn(k) * 0.998})`;
      const lk = prog(t, T.tv + 0.22, T.tv + 0.42);
      css($('tvLine'), { opacity: k > 0.6 ? 1 - lk : 0, transform: `scaleX(${1 - eIn(lk)})` });
    }
  }
  // ingredient rows
  [T.hit + 0.05, T.car, T.nug, T.choc].forEach((t0, i) => {
    const el = $('row' + i); const vis = t > t0 - 0.05 && t < T.out + 0.4; show(el, vis);
    if (!vis) return;
    const k = eOut(prog(t, t0 - 0.05, t0 + 0.35)); const o = eIn(prog(t, T.out, T.out + 0.3));
    el.style.top = 250 + i * 128 + 'px';
    el.style.opacity = k * (1 - o);
    el.style.transform = `translate(${lerp(-90, 0, k) - o * 120}px,0)`;
    el.querySelector('.wd').style.color = i === [T.hit, T.car, T.nug, T.choc].filter((x) => t >= x - 0.05).length - 1 ? '#ffffff' : 'rgba(255,236,205,0.72)';
  });
  // big percent block
  {
    const vis = t > T.out + 0.1 && t < T.pack; ['big', 'bigT', 'bigS'].forEach((id) => show($(id), vis));
    if (vis) {
      const ck = eIO(prog(t, T.chg0, T.chg1));
      const pct = Math.max(1, Math.round(lerp(1, 100, ck)));
      $('big').textContent = pct + '%';
      const a = eOut(prog(t, T.out + 0.1, T.chg0 + 0.1)); const z = eIn(prog(t, T.pack - 0.3, T.pack));
      const punch = t > T.chg1 ? 1 + 0.1 * Math.max(0, 1 - (t - T.chg1) / 0.35) : 1;
      css($('big'), { opacity: a * (1 - z), transform: `translate(${lerp(-60, 0, a)}px,0) scale(${punch})`, transformOrigin: 'left center' });
      css($('bigT'), { opacity: eOut(prog(t, 11.8, 12.15)) * (1 - z), transform: `translate(0,${lerp(30, 0, eOut(prog(t, 11.8, 12.15)))}px)` });
      css($('bigS'), { opacity: eOut(prog(t, 12.6, 12.95)) * (1 - z), transform: `translate(0,${lerp(30, 0, eOut(prog(t, 12.6, 12.95)))}px)` });
    }
  }
  // slogan
  {
    const vis = t > T.sl1 - 0.1; show($('slogan'), vis); show($('tag'), t > T.tag - 0.1);
    if (vis) {
      $('slogan').querySelectorAll('.w > span').forEach((s, i) => {
        const k = eOut(prog(t, [T.sl1, T.sl2, T.sl3][i] - 0.08, [T.sl1, T.sl2, T.sl3][i] + 0.3));
        s.style.transform = `translate(0,${lerp(110, 0, k)}%)`;
      });
      const g = 0.5 + 0.5 * Math.sin(t * 2);
      $('slogan').style.textShadow = `0 0 ${20 + g * 20}px rgba(255,190,80,.45), 0 6px 20px rgba(0,0,0,.5)`;
    }
    if (t > T.tag - 0.1) { const k = eOut(prog(t, T.tag, T.tag + 0.6)); css($('tag'), { opacity: k, letterSpacing: lerp(20, 8, k) + 'px' }); }
  }
  // flash
  {
    let f = 0;
    if (t >= T.hit) f = Math.max(f, 1 - (t - T.hit) / 0.35);
    if (t >= T.chg1) f = Math.max(f, 0.3 * (1 - (t - T.chg1) / 0.4));
    if (t >= T.pack - 0.05) f = Math.max(f, 1 - (t - (T.pack - 0.05)) / 0.45);
    for (const w of [T.w1, T.w2, T.w3]) if (t >= w) f = Math.max(f, 0.18 * (1 - (t - w) / 0.12));
    $('flash').style.opacity = clamp(f);
    $('flash').style.background = t >= T.chg1 ? '#ffe0a0' : '#fff';
  }
  // end fade + very start fade in
  $('black').style.opacity = Math.max(prog(t, 19.35, 19.95), 1 - prog(t, 0, 0.35));
};

(async () => {
  await Promise.all([
    document.fonts.load('900 100px Unbounded', 'АБВ SNICKERS 100%'),
    document.fonts.load('500 40px Unbounded', 'АБВ abc'),
    document.fonts.load('700 40px Manrope', 'АБВ abc'),
    document.fonts.load('500 40px Manrope', 'АБВ abc'),
  ]);
  await document.fonts.ready;
  packFront.map = wrapperTexture(); packFront.needsUpdate = true;
  // warm up shaders: render each phase once
  for (const t of [1, 9.5, 12.5, 15]) window.renderAt(t);
  window.renderAt(0);
  window.READY = true;
})();
