// story/build.mjs — writes story/shots.json for "Моргни".  node projects/blink/story/build.mjs
// Each entry: sh(start, params, extra). start = time (s) the illustrated phrase begins; the shot starts 0.15 s earlier
// and runs until the next shot starts (shots are contiguous). Talk windows are global seconds from the transcript.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const words = JSON.parse(fs.readFileSync(path.join(DIR, '../timeline/words.json'), 'utf8')).words;
const VOICE = 500.767, DURATION = +(VOICE + 1.5).toFixed(2);
const nrm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');
// W('премия', 60) -> start time of the first word starting with "премия" after 60 s; WE -> its end time
const findW = (m, after) => words.find((w) => w.start >= after - 0.05 && nrm(w.word).startsWith(nrm(m)));
const W = (m, after = 0) => { const w = findW(m, after); if (!w) throw new Error(`word not found: ${m} after ${after}`); return w.start; };
const WE = (m, after = 0) => findW(m, after).end;
const talk = (a, b) => [+(a - 0.05).toFixed(2), +(b + 0.05).toFixed(2)];

// ---------- helpers ----------
const A = (who, x, o = {}) => ({ who, x, s: 1.5, ...o });
const SR = (so = {}) => ({ set: 'showroom', so });                       // showroom background spec
const grey = { carColor: '#8e96a3', year: 2024 }, red = { carColor: '#c8352c', price: '4 200 000', year: 2025 }, red3 = { ...red, year: 2026 }, paint = { ...red, year: 2027, repaint: true };
const face = (who, expr, o = {}) => ({ k: 'face', who, expr, bars: 'scope', ...o });
const eyes = (o = {}) => ({ k: 'insert', what: 'eyes', bars: 'scope', ...o });
const line = (s, o = {}) => ({ k: 'line', s, ...o });
const age = (v, at = 0.3) => ({ k: 'age', v, at });
const sub = (s, at = 0.3, o = {}) => ({ k: 'sub', s, at, ...o });
const big = (s, at = 0.3, o = {}) => ({ k: 'line', s, at, ...o });
const sfx = (name, at = 0, gain = -10) => ({ name, at, gain });
const AMB = { showroom: { name: 'hum', gain: -30 }, cafe: { name: 'murmur', gain: -27 }, park: { name: 'wind', gain: -30 }, doorway: { name: 'roomtone', gain: -28 }, home: { name: 'roomtone', gain: -30 }, wedding: { name: 'murmur', gain: -26 }, stairwell: { name: 'hum', gain: -26 } };

// wide establishing view of the showroom (replaces the low-poly 3D orbits: the 2D look is stronger)
const wide = (so, actors, o = {}) => ({ k: 'set', set: 'showroom', so, cam: { z: [0.86, 0.95], x: [-260, -120] }, actors, fx: ['dust', 'streak'], ...o });
const S = [];
const sh = (t, params, extra = {}) => S.push({ t, params, ...extra });

// =============== COLD OPEN: four blinks ===============
sh(0, eyes({ blinkAt: [[0.45, 0.75]], blinkIn: 0.5, expr: 'neutral' }), { sfx: [sfx('whoosh', 0.5, -14)] });
sh(1.1, { k: 'set', set: 'park', so: { mood: 'day' }, cam: { z: [1.05, 1.12] }, actors: [A('MAX', -60, { expr: [[0, 'surprised'], [0.8, 'confused']], s: 1.7 })], ov: [age(22, 0.6)], blinkIn: 0.35 }, { sfx: [sfx('pop', 0.6, -12)] });
sh(3.14, face('MAX', 'neutral', { bg: { set: 'park' }, blinkAt: [[0.35, 0.65]] }), { sfx: [sfx('swish', 0.3, -14)] });
sh(4.5, { k: 'set', set: 'wedding', cam: { z: [1.08, 1.14], x: [-40, 0] }, actors: [A('EGOR', 30, { expr: 'joy', pose: 'cheer', f: 1 }), A('WIFE', 170, { expr: 'happy', f: -1, pose: 'wave' }), A('MAX', -380, { expr: 'shocked', pose: 'handsOnHead', s: 1.6 })], ov: [age(23, 0.4), big('ЖЕНАТ.', 0.8)], blinkIn: 0.35 }, { sfx: [sfx('shimmer', 0.6, -12)], amb: AMB.wedding });
sh(7.02, { k: 'set', set: 'home', cam: { z: [1.1, 1.16], x: [0, 30] }, actors: [A('EGOR', 140, { f: -1, pose: 'holdFront', expr: 'happy' }), A('MAX', -330, { expr: 'shocked', s: 1.6 })], propsFront: [{ k: 'carrier', x: 115, y: -230, s: 0.65 }], ov: [age(24, 0.4)], blinkIn: 0.35 }, { sfx: [sfx('pop', 0.5, -12)], amb: AMB.home });
sh(9.6, { k: 'insert', what: 'carrier', bg: { set: 'home' }, ov: [big('МАКСИМ.', W('максим', 10) - 9.45)] });
sh(11.98, wide(red, [A('MAX', 120, { f: -1, expr: 'scared', still: true, s: 1.2 }), A('EGOR', -60, { f: 1, beard: true, expr: 'worried', s: 1.2 }), A('BOSS', 330, { f: -1, pose: 'holdFront', expr: 'happy', s: 1.2 })], { cam: { z: [0.85, 1.0], x: [-200, 60] }, ov: [age(25, 0.4)], blinkIn: 0.35 }), { sfx: [sfx('heartbeat', 0.4, -12)], amb: AMB.showroom });
sh(W('кутузовском', 12), { k: 'set', set: 'showroom', so: red, cam: { z: [1.3, 1.4], x: [120, 160], y: -60 }, actors: [A('MAX', 150, { expr: 'scared', f: -1, s: 1.6, still: true, pose: 'stand' })], ov: [sub('КУТУЗОВСКИЙ ПРОСПЕКТ', 0.2, { y: 980 })] });
sh(W('не', 15.5), eyes({ redEyes: true, shake: 3, ov: [{ k: 'counter', label: 'НЕ МОРГАЯ', from: 236, to: 240, fmt: 'mmss', at: 0.2, until: 3 }] }), { sfx: [sfx('heartbeat', 0, -10), sfx('heartbeat', 1.4, -10)] });
sh(19.36, { k: 'set', set: 'showroom', so: red, cam: { z: [1.25, 1.32], x: [180, 220], y: -40 }, actors: [A('MAX', 60, { expr: 'scared', f: 1, still: true }), A('BOSS', 330, { f: -1, pose: 'holdFront', expr: 'happy' })], propsFront: [{ k: 'envelope', x: 270, y: -235, s: 0.4 }] });
sh(21.96, face('BOSS', 'happy', { bg: SR(red), side: 1, talk: talk(21.96, 23.52), x: 160 }));
sh(23.96, { k: 'set', set: 'showroom', so: red, cam: { z: [1.35, 1.42], x: [80, 100], y: -70 }, actors: [A('MAX', 0, { expr: 'cry', f: 1, pose: 'sad' }), A('EGOR', 230, { f: -1, pose: 'reach', expr: 'happy', beard: true })] }, { sfx: [sfx('shimmer', 0.5, -16)] });
// =============== TITLE + SETUP ===============
sh(26.48, { k: 'title', lines: ['ЕСЛИ БЫ КАЖДОЕ', 'МОРГАНИЕ СТОИЛО ГОД'], bg: SR(grey), bars: 'scope' }, { in: { type: 'dip', dur: 0.4 }, sfx: [sfx('riser', 0, -12), sfx('stinger', 0.6, -8)] });
sh(28.04, { k: 'set', set: 'studio', so: { color: '#4a3646' }, cam: { z: [1.1, 1.18] }, actors: [A('MAX', 0, { expr: [[0, 'smile'], [1.2, 'happy']], pose: [[0, 'stand'], [0.4, 'wave'], [1.6, 'relaxed']], s: 1.9 })], ov: [sub('МАКСИМ', 0.3, { y: 220, size: 56 }), age(21, W('тебе', 29.5) - 27.9)] }, { in: { type: 'fade', dur: 0.4 }, sfx: [sfx('pop', 0.3, -14)] });
sh(31.74, wide(grey, [A('MAX', 160, { f: -1, expr: 'neutral', s: 1.2 })], { cam: { z: [0.8, 0.9], x: [-500, -300] }, ov: [sub('МОСКВА · АВТОСАЛОН', 0.3, { y: 160 })] }), { sfx: [sfx('whoosh', 0, -12)], amb: AMB.showroom });
sh(W('менеджером', 32), { k: 'set', set: 'showroom', so: grey, cam: { z: [1.12, 1.18], x: [-160, -120] }, actors: [A('MAX', -80, { f: -1, pose: [[0, 'stand'], [0.3, 'point']], expr: 'smile' })], ov: [sub('МЕНЕДЖЕР', 0.3, { y: 960 })] });
sh(35.36, { k: 'set', set: 'showroom', so: grey, cam: { z: [1.35, 1.4], x: [500, 540], y: -60 }, actors: [A('BOSS', 420, { f: -1, pose: 'crossArms', expr: 'smirk' })], ov: [sub('СЕРГЕЙ НИКОЛАЕВИЧ', 0.3, { y: 960 })] });
sh(W('обещает', 36.5), { k: 'set', set: 'showroom', so: grey, cam: { z: [1.22, 1.28], x: [220, 260], y: -40 }, actors: [A('MAX', 60, { f: 1, pose: 'think', expr: 'thinking' }), A('BOSS', 330, { f: -1, pose: 'explain', expr: 'happy' })], ov: [big('ПРЕМИЯ', 0.4, { y: 170 }), { k: 'counter', label: 'ОБЕЩАЕТ УЖЕ', from: 1, to: 34, unit: ' ДН.', at: 0.6, until: 2.6 }] }, { sfx: [sfx('counter', 0.6, -16)] });
sh(40.7, { k: 'set', set: 'park', so: { mood: 'golden' }, cam: { z: [1.1, 1.12], x: [-100, 120] }, actors: [A('MAX', 0, { walk: [-420, 160], expr: 'happy', s: 1.6 }), A('EGOR', 0, { walk: [-250, 330], expr: 'joy', s: 1.6, talk: talk(41.6, 43.5) })], ov: [sub('ЕГОР', 0.4, { y: 960 })] }, { amb: AMB.park });
sh(W('даже', 44), { k: 'set', set: 'stairwell', cam: { z: [1.15, 1.25], shake: 2 }, actors: [A('MAX', -140, { expr: 'scared', pose: 'crouch', f: 1, sweat: true })], fx: ['dust'] }, { sfx: [sfx('heartbeat', 0.2, -12), sfx('buzz', 1.2, -18)], amb: AMB.stairwell });
sh(48.06, wide(grey, [A('MAX', 160, { f: -1, expr: 'sleepy', s: 1.2 })], { so: { ...grey, mood: 'interiorCool', clock: 9 * 3600 }, ov: [big('ПОНЕДЕЛЬНИК', 0.6, { y: 150 })] }), { in: { type: 'fade', dur: 0.5 }, sfx: [sfx('tick', 0.5, -12)], amb: AMB.showroom });
// =============== MONDAY IN THE SHOWROOM ===============
sh(51.84, { k: 'set', set: 'showroom', so: { ...grey, price: '3 899 000' }, cam: { z: [1.05, 1.1], x: [-120, -80] }, actors: [A('MAX', 160, { f: -1, expr: 'neutral' })] }, { amb: AMB.showroom });
sh(W('за', 54.3), { k: 'insert', what: 'price', v: '3 899 000', bg: SR(grey) }, { sfx: [sfx('blip', 0.3, -14)] });
sh(57.94, { k: 'set', set: 'showroom', so: { ...grey, price: '3 899 000' }, cam: { z: [0.92, 0.95], x: [100, 60] }, actors: [A('MAX', 160, { f: -1, pose: [[0, 'stand'], [0.3, 'shrug']], expr: 'sad', s: 1.2 })], ov: [sub('КЛИЕНТОВ: 0', 0.3, { y: 960 })] });
sh(59.1, { k: 'insert', what: 'cup', cold: true, bg: SR(grey), ov: [{ k: 'readout', label: 'ОСТЫЛ В', v: '9:00', at: 0.4 }] });
sh(61.42, { k: 'set', set: 'showroom', so: grey, cam: { z: [1.18, 1.22], x: [180, 220], y: -40 }, actors: [A('MAX', 40, { f: 1, prop: 'cup', pose: 'holdFront', expr: [[0, 'neutral'], [2.6, 'sleepy']] }), A('BOSS', 0, { walk: [700, 230], walkT: [0, 2.2], endPose: 'reach', f: -1, expr: 'happy' })] }, { sfx: [sfx('footstep', 0.3, -16), sfx('footstep', 0.9, -16), sfx('hit', 2.4, -16)] });
sh(W('максим', 64), face('BOSS', [[0, 'happy'], [3.2, 'smirk']], { bg: SR(grey), side: 1, x: 140, talk: talk(W('максим', 64), WE('точно', 67)) }));
sh(69.28, { k: 'set', set: 'showroom', so: grey, cam: { z: [1.4, 1.5], x: [40, 60], y: -80 }, actors: [A('MAX', 40, { pose: 'facepalm', expr: 'sad' })], ov: [{ k: 'counter', label: 'ДЕНЬ', from: 1, to: 34, at: 0.3, until: 2.4, x: 1180, y: 560 }] }, { sfx: [sfx('counter', 0.3, -16), sfx('buzz', 2.6, -18)] });
sh(73.12, { k: 'insert', what: 'clock', clock: 10 * 3600 + 7 * 60, tick: true, bg: SR(grey), ov: [big('ДО КОНЦА СМЕНЫ 8 ЧАСОВ', 0.4, { y: 120, size: 60 })] }, { sfx: [sfx('clock', 0, -14)] });
sh(75.5, { k: 'set', set: 'showroom', so: grey, cam: { z: [1.15, 1.2], x: [420, 440], y: -60 }, actors: [A('MAX', 380, { f: 1, look: [0.6, -0.9], expr: [[0, 'neutral'], [2.5, 'thinking']], pose: [[0, 'stand'], [2.4, 'think']] })] }, { sfx: [sfx('clock', 0.2, -18)] });
sh(79.84, face('MAX', 'sleepy', { bg: SR(grey), ov: [sub('«Скорее бы всё это закончилось»', 0.3, { y: 960 })] }), { sfx: [sfx('whoosh', 0.2, -20)] });
sh(82.22, eyes({ blinkAt: [[0.6, 1.25]], blinkOut: 0.0 }), { sfx: [sfx('slowmo', 0.3, -12)] });
sh(83.64, { k: 'set', set: 'showroom', so: { ...red }, cam: { z: [1.08, 1.12], x: [-60, -40] }, actors: [A('MAX', 160, { f: -1, expr: 'surprised' })], blinkIn: 0.7, ov: [age(22, 0.6)] }, { sfx: [sfx('ding', 0.6, -12)] });
sh(85.66, { k: 'insert', what: 'clock', clock: 10 * 3600 + 7 * 60, bg: SR(red), ov: [sub('ТА ЖЕ МИНУТА', 0.5, { y: 120 })] }, { sfx: [sfx('tick', 0.3, -12)] });
sh(89.0, { k: 'set', set: 'showroom', so: red, cam: { z: [1.15, 1.35], x: [-420, -440], ease: 'out' }, actors: [A('MAX', 140, { f: -1, expr: 'shocked', pose: 'handsOnHead' })] }, { sfx: [sfx('impact', 0.4, -10)] });
sh(91.04, { k: 'insert', what: 'price', v: '3 899 000', v2: '4 200 000', flipAt: 0.5, bg: SR(red) }, { sfx: [sfx('blip', 0.5, -12)] });
sh(W('а', 93), { k: 'insert', what: 'calendar', year: 2024, year2: 2025, flipAt: 0.6, bg: SR(red), ov: [sub('НОВЫЙ КАЛЕНДАРЬ', 0.4, { y: 140 })] }, { sfx: [sfx('swish', 0.6, -12)] });
sh(96.52, { k: 'insert', what: 'phone', screen: 'year', yearFrom: 2024, yearTo: 2025, flipAt: W('на', 99.5) - 96.37, bg: SR(red), ov: [age(22, 3.4)] }, { sfx: [sfx('phonebuzz', 0.2, -14), sfx('stinger', 2.9, -10)] });
sh(101.32, { k: 'set', set: 'showroom', so: red, cam: { z: [1.18, 1.22], x: [180, 220], y: -40 }, actors: [A('MAX', 40, { f: 1, expr: 'confused' }), A('BOSS', 0, { walk: [700, 260], walkT: [0, 2.0], endPose: 'talk', f: -1, expr: 'happy' })] }, { sfx: [sfx('footstep', 0.3, -16), sfx('footstep', 0.9, -16)] });
sh(W('максим', 103.5), face('BOSS', [[0, 'happy'], [2.6, 'smirk']], { bg: SR(red), side: 1, x: 140, talk: talk(W('максим', 103.5), WE('точно', 106)) }));
sh(108.08, face('MAX', 'angry', { bg: SR(red), zoom: [1, 1.15], shake: 2 }), { sfx: [sfx('hit', 0.2, -14)] });
sh(109.46, { k: 'set', set: 'showroom', so: red, cam: { z: [1.28, 1.32], x: [200, 220], y: -50 }, actors: [A('MAX', 60, { f: 1, pose: 'point', expr: 'angry', talk: talk(109.46, 111.3) }), A('BOSS', 340, { f: -1, expr: 'neutral' })] });
sh(111.38, { k: 'set', set: 'showroom', so: red, cam: { z: [1.15, 1.18], x: [200, 260], y: -40 }, actors: [A('MAX', 60, { f: 1, pose: 'shrug', expr: 'confused' }), A('BOSS', 0, { walk: [340, 900], f: 1, expr: 'smirk' })] }, { sfx: [sfx('footstep', 0.2, -16), sfx('footstep', 0.8, -16)] });
sh(113.76, face('BOSS', 'smirk', { bg: SR(red), side: 1, x: 260, talk: talk(113.76, 115.46), tilt: 0.06 }));
// =============== THE GALLERY ===============
sh(115.98, { k: 'insert', what: 'phone', screen: 'gallery', count: 342, bg: SR(red), ov: [big('342 ФОТО', 1.2, { y: 120, x: 1500, size: 64 })] }, { sfx: [sfx('counter', 0.2, -14)] });
sh(119.62, { k: 'insert', what: 'phone', screen: 'photo', photo: 'sea', bg: SR(red), ov: [sub('ТЫ НА ВСЕХ УЛЫБАЕШЬСЯ', 0.3, { y: 140 })] }, { sfx: [sfx('swish', 0.1, -16)] });
sh(121.46, { k: 'insert', what: 'phone', screen: 'photo', photo: 'cafe', bg: SR(red) }, { sfx: [sfx('swish', 0.05, -16)] });
sh(W('набережной', 122), { k: 'insert', what: 'phone', screen: 'photo', photo: 'park', bg: SR(red) }, { sfx: [sfx('swish', 0.05, -16)] });
sh(W('у', 123), { k: 'insert', what: 'phone', screen: 'photo', photo: 'sea', bg: SR(red) }, { sfx: [sfx('swish', 0.05, -16)] });
sh(124.42, face('MAX', 'confused', { bg: SR(red) }));
sh(126.16, { k: 'set', set: 'studio', so: { color: '#3a2a4a' }, cam: { z: [1.05, 1.12] }, actors: [A('MAX', -260, { expr: 'sad', pose: 'sad', s: 1.8 }), A('MAX', 260, { expr: 'joy', pose: [[0, 'cheer'], [1.2, 'wave'], [2.4, 'cheer'], [3.6, 'jump'], [4.2, 'cheer']], alpha: 0.45, s: 1.8, rimColor: '#9fd8ff' })], ov: [sub('КТО-ТО ДРУГОЙ', 0.6, { x: 1220, y: 300 })] }, { sfx: [sfx('shimmer', 0.6, -16)] });
sh(131.52, line('ЭТО ПРАВДА.', { color: 'cream' }));
sh(132.62, line('И ЭТО НЕ ТВОЯ ВИНА.'), { sfx: [sfx('ding', 0.4, -14)] });
// =============== SCIENCE ===============
sh(134.74, { k: 'bp', mode: 'rate', at: W('15', 135) - 134.59, bars: 'none' }, { in: { type: 'zoom', dur: 0.4 }, sfx: [sfx('whoosh', 0, -12)] });
sh(138.32, { k: 'bp', mode: 'closed', at: W('10', 139) - 138.17, bars: 'none' }, { sfx: [sfx('blip', 1.4, -14)] });
sh(143.8, { k: 'bp', mode: 'cut', bars: 'none' }, { sfx: [sfx('swish', 0.8, -12)] });
sh(149.24, { k: 'bp', mode: 'age', bars: 'none' }, { sfx: [sfx('counter', 0.6, -16), sfx('stinger', 5.6, -12)] });
sh(155.9, { k: 'bp', mode: 'lunch', bars: 'none' }, { sfx: [sfx('pop', 0.3, -14), sfx('pop', 1.0, -14)] });
sh(159.52, face('MAX', 'thinking', { bg: SR(red), x: -120 }), { in: { type: 'zoom', dur: 0.4 } });
sh(161.58, line('РАБОТАЕТ ЭТО НЕ ВСЕГДА.', { color: 'accent', bg: SR(red) }), { sfx: [sfx('stinger', 0.3, -12)] });
// =============== CAFE ===============
sh(165.22, { k: 'set', set: 'park', so: { mood: 'day' }, cam: { z: [1.05, 1.08], x: [-200, 200] }, actors: [A('MAX', 0, { walk: [-900, 700, true], expr: 'determined', s: 1.6 })], fx: ['dust', 'streak'] }, { in: { type: 'whip', dur: 0.35 }, sfx: [sfx('whoosh', 0.1, -10), sfx('footstep', 0.4, -16), sfx('footstep', 0.7, -16)] });
sh(166.9, { k: 'set', set: 'cafe', cam: { z: [1.0, 1.05], x: [-120, -60] }, props: [{ k: 'chair', x: -230, f: 1 }, { k: 'chair', x: 230, f: -1 }, { k: 'table', x: 0, cups: [-60, 70], steam: true }], actors: [A('EGOR', 230, { f: -1, pose: 'sit', expr: 'smile' })], ov: [sub('КОФЕЙНЯ НАПРОТИВ САЛОНА', 0.3, { y: 980 })] }, { amb: AMB.cafe });
sh(168.76, { k: 'insert', what: 'cup', steam: true, bg: { set: 'cafe' }, mood: 'interiorWarm', ov: [{ k: 'readout', label: 'КАПУЧИНО', v: '350 РУБ.', at: 0.4 }] }, { sfx: [sfx('blip', 0.4, -14)] });
const cafeTwo = (maxO = {}, egorO = {}, o = {}) => ({ k: 'set', set: 'cafe', cam: { z: [1.2, 1.25], x: [-80, -60], y: -30 }, props: [{ k: 'chair', x: -230, f: 1 }, { k: 'chair', x: 230, f: -1 }, { k: 'table', x: 0, cups: [-60, 70], croissant: 110 }], actors: [A('MAX', -230, { pose: 'sit', expr: 'neutral', ...maxO }), A('EGOR', 230, { f: -1, pose: 'sit', expr: 'neutral', ...egorO })], ...o });
sh(171.08, cafeTwo({ pose: [[0, 'sit'], [0.4, { head: [6, -180], sh: [1, -146], hip: [0, -72], eF: [26, -112], hF: [52, -128], eB: [12, -110], hB: [30, -84], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }]], expr: 'worried', talk: talk(171.1, 173.4) }, { expr: [[0, 'neutral'], [2.5, 'thinking']] }), { amb: AMB.cafe });
sh(175.6, face('EGOR', 'smirk', { bg: { set: 'cafe' }, side: 1, x: 140, talk: talk(175.6, 179.8) }));
sh(180.12, face('MAX', 'worried', { bg: { set: 'cafe' }, talk: talk(181.12, 183.32), x: -120 }));
sh(183.72, cafeTwo({ expr: 'worried' }, { pose: [[0, 'sit'], [0.3, { head: [4, -184], sh: [0, -150], hip: [0, -72], eF: [26, -130], hF: [40, -150], eB: [-22, -130], hB: [-36, -150], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }]], expr: 'smile', talk: talk(185.4, 187.08) }));
sh(187.4, face('EGOR', [[0, 'thinking'], [1.4, 'smirk']], { bg: { set: 'cafe' }, side: 1, x: 140, talk: talk(188.92, 190.38) }));
sh(190.7, face('EGOR', 'determined', { bg: { set: 'cafe' }, side: 1, x: 140, zoom: [1.1, 1.18], talk: talk(190.7, 191.16), ov: [big('МОРГНИ.', 0.1, { y: 160 })] }));
sh(191.5, eyes({ blinkAt: [[0.35, 0.8]], bg: { set: 'cafe' } }), { sfx: [sfx('slowmo', 0.2, -12)] });
sh(192.78, cafeTwo({ expr: 'shocked', pose: 'sitBack' }, { expr: 'smile', beard: true }, { blinkIn: 0.5, ov: [age(23, 0.5)] }), { sfx: [sfx('ding', 0.5, -12)] });
sh(W('на', 194.5), { k: 'insert', what: 'ring', bg: { set: 'cafe' }, mood: 'interiorWarm', ov: [sub('КОЛЬЦО', 0.4, { y: 140 })] }, { sfx: [sfx('shimmer', 0.3, -12)] });
sh(196.92, face('EGOR', 'happy', { bg: { set: 'cafe' }, side: 1, x: 140, beard: true, talk: talk(196.92, 198.9) }));
sh(199.98, { k: 'set', set: 'wedding', cam: { z: [1.15, 1.2], x: [0, 30] }, actors: [A('MAX', -60, { pose: 'explain', expr: 'joy', talk: talk(200.0, 201.2) }), A('EGOR', 260, { f: -1, expr: 'joy', beard: true, pose: 'cheer' }), A('WIFE', 420, { f: -1, expr: 'happy' })], propsFront: [{ k: 'glass', x: -20, y: -235 }], fx: ['dust', 'streak'] }, { in: { type: 'dipWhite', dur: 0.4 }, sfx: [sfx('applause', 0.2, -18)], amb: AMB.wedding });
sh(201.5, face('EGOR', 'confused', { bg: { set: 'cafe' }, side: 1, x: 140, beard: true, talk: talk(201.5, 202.64) }), { amb: AMB.cafe });
sh(202.92, face('MAX', 'confused', { bg: { set: 'cafe' }, x: -120, talk: talk(202.92, 203.86) }));
sh(204.18, { k: 'set', set: 'wedding', cam: { z: [1.35, 1.42], x: [-40, -30], y: -80 }, actors: [A('MAX', -40, { pose: 'explain', expr: 'joy', talk: talk(204.18, 206.2) })], propsFront: [{ k: 'glass', x: -20, y: -235 }], ov: [big('«ЛОВИ МОМЕНТ»', 0.6, { y: 170 })], fx: ['dust', 'streak'] }, { in: { type: 'dipWhite', dur: 0.3 }, sfx: [sfx('applause', 1.4, -20)], amb: AMB.wedding });
sh(206.62, { k: 'insert', what: 'cup', bg: { set: 'cafe' }, mood: 'interiorWarm', cam: { z: [1.15, 1.25] } }, { amb: AMB.cafe });
sh(208.76, face('MAX', 'angry', { bg: { set: 'cafe' }, x: -120, ov: [age(23, 0.4)] }));
sh(W('тот', 211), { k: 'set', set: 'studio', so: { color: '#4a3a3a', light: '#ffd59a' }, cam: { z: [1.05, 1.1] }, actors: [A('MAX', -280, { expr: 'angry', pose: 'crossArms', s: 1.8 }), A('MAX', 260, { expr: 'joy', pose: 'explain', alpha: 0.45, s: 1.8, rimColor: '#9fd8ff', talk: talk(211.6, 215.1) })], ov: [sub('«ДРУГОЙ» МАКСИМ', 0.4, { x: 1240, y: 300 })] }, { sfx: [sfx('applause', 0.8, -22)] });
sh(215.44, cafeTwo({ expr: 'worried' }, { expr: [[0, 'neutral'], [2.5, 'determined']], beard: true, pose: [[0, 'sit'], [2.4, { ...{ head: [6, -180], sh: [1, -146], hip: [0, -72], eF: [16, -110], hF: [-6, -116], eB: [10, -112], hB: [12, -118], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] } }]] }, { cam: { z: [1.2, 1.32], x: [-80, 0], y: -40 } }));
sh(219.58, face('EGOR', 'determined', { bg: { set: 'cafe' }, side: 1, x: 140, beard: true, zoom: [1.05, 1.15], talk: talk(219.58, 222.04), ov: [big('БОЛЬШЕ НЕ МОРГАЙ.', 0.2, { y: 150 }), big('ВООБЩЕ.', W('вообще', 221) - 219.43, { y: 980, color: 'accent', size: 60 })] }), { sfx: [sfx('stinger', 0.2, -14)] });
sh(222.56, eyes({ redEyes: true, shake: 4, bg: { set: 'cafe' } }), { sfx: [sfx('heartbeat', 0.1, -12)] });
sh(224.0, cafeTwo({ pose: [[0, 'sit'], [0.6, { head: [-4, -192], sh: [-4, -150], hip: [0, -72], eF: [16, -120], hF: [12, -150], eB: [10, -112], hB: [8, -140], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }], [0.95, { head: [26, -150], sh: [12, -134], hip: [0, -72], eF: [30, -104], hF: [34, -136], eB: [22, -104], hB: [30, -132], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }]], expr: [[0, 'worried'], [0.5, 'sleepy'], [0.95, 'shocked']] }, { expr: 'surprised', beard: true }, { ov: [big('АПЧХИ!', 0.95, { y: 200, color: 'accent' })], cam: { z: [1.2, 1.25], x: -60, y: -30, shake: 0 } }), { sfx: [sfx('impact', 0.95, -12)] });
sh(225.7, eyes({ blinkOut: 2.4, bg: { set: 'cafe' } }), { sfx: [sfx('slowmo', 1.0, -14)] });
sh(229.1, line('«СКОРЕЕ БЫ ВЫХОДНЫЕ»', { color: 'cream', bg: { set: 'studio', so: { color: '#1a1420' } } }), { sfx: [sfx('whoosh', 0.2, -20)] });
// =============== THE BABY AT THE DOOR ===============
sh(230.92, { k: 'set', set: 'doorway', cam: { z: [1.0, 1.04], x: [-160, -140] }, actors: [A('MAX', -520, { f: 1, expr: 'surprised', s: 1.7 })], blinkIn: 0.7 }, { sfx: [sfx('ding', 0.6, -14)], amb: AMB.doorway });
sh(232.46, { k: 'set', set: 'doorway', cam: { z: [1.05, 1.1], x: [-120, -100] }, actors: [A('EGOR', 0, { f: -1, pose: 'holdFront', expr: 'smile', beard: true, s: 1.6 }), A('MAX', -520, { f: 1, expr: 'shocked', s: 1.7 })], propsFront: [{ k: 'carrier', x: -30, y: -215, s: 0.7 }] });
sh(234.2, { k: 'insert', what: 'carrier', bg: { set: 'doorway' }, mood: 'night', ov: [sub('ПЕРЕНОСКА-ЛЮЛЬКА', 0.4, { y: 140 })] });
sh(236.86, { k: 'set', set: 'doorway', cam: { z: [1.35, 1.42], x: [-30, -20], y: -80 }, actors: [A('EGOR', 0, { f: -1, pose: 'holdFront', expr: 'smile', beard: true, s: 1.6, talk: talk(236.86, 240.16) })], propsFront: [{ k: 'carrier', x: -30, y: -215, s: 0.7 }], ov: [age(24, 0.4), big('ЭТО МАКСИМ.', W('это', 239) - 236.71, { y: 170 })] });
sh(240.6, face('MAX', [[0, 'awe'], [3, 'thinking']], { bg: { set: 'doorway' }, look: [0.3, 0.6], x: -120 }));
sh(245.94, face('MAX', 'surprised', { bg: { set: 'doorway' }, x: -120, talk: talk(245.94, 247.76) }));
sh(248.18, face('EGOR', [[0, 'smile'], [1.2, 'happy']], { bg: { set: 'doorway' }, side: 1, x: 140, beard: true, talk: talk(249.6, 250.32), ov: [big('ТЫ КРЕСТНЫЙ.', W('ты', 249.4) - 248.03, { y: 160 })] }));
sh(250.6, { k: 'set', set: 'studio', so: { color: '#5a4a3a', light: '#ffe2a8' }, cam: { z: [1.1, 1.16] }, actors: [A('MAX', -40, { pose: 'holdFront', expr: 'cry', s: 1.9, alpha: 0.75 })], propsFront: [{ k: 'carrier', x: 60, y: -235, s: 0.8 }], ov: [sub('КРЕСТИНЫ', 0.3, { y: 160 }), big('ПЛАКАЛ БОЛЬШЕ ВСЕХ', W('плакал', 252) - 250.45, { y: 980, size: 56 })], fx: ['dust', 'streak'] }, { in: { type: 'dipWhite', dur: 0.4 }, sfx: [sfx('shimmer', 0.3, -16)] });
sh(253.9, face('MAX', 'sad', { bg: { set: 'doorway' }, x: -120 }), { in: { type: 'fade', dur: 0.3 } });
sh(256.62, line('ТЕБЕ 24.', { bg: { set: 'doorway' } }), { sfx: [sfx('impact', 0.2, -12)] });
sh(258.56, face('MAX', 'scared', { bg: { set: 'stairwell' }, shake: 3, zoom: [1, 1.2], sweat: true }), { sfx: [sfx('heartbeat', 0.2, -10), sfx('heartbeat', 1.6, -10)] });
sh(262.16, { k: 'set', set: 'studio', so: { color: '#2a2a40', light: '#9fb8ff' }, cam: { z: [1.0, 1.08] }, actors: [A('MAX', 0, { pose: 'sad', expr: 'worried', s: 1.7 })], ov: [sub('НЕ ИЗ-ЗА ПОТЕРЯННЫХ ЛЕТ', 0.4, { y: 180 })] });
sh(265.66, { k: 'set', set: 'doorway', cam: { z: [1.15, 1.22], x: [-60, -40], y: -40 }, actors: [A('EGOR', 0, { f: -1, pose: 'holdFront', expr: 'smile', beard: true, s: 1.6 })], propsFront: [{ k: 'carrier', x: -30, y: -215, s: 0.7 }], fx: ['dust', 'streak'] });
sh(268.86, { k: 'set', set: 'showroom', so: red, cam: { z: [1.2, 1.26], x: [60, 90], y: -40 }, actors: [A('MAX', -80, { expr: 'sleepy' }), A('EGOR', 130, { f: -1, expr: 'smile', beard: true })] }, { in: { type: 'fade', dur: 0.3 } });
sh(W('он', 270), { k: 'set', set: 'cafe', cam: { z: [1.2, 1.26], x: [-80, -50], y: -30 }, props: [{ k: 'chair', x: -230, f: 1 }, { k: 'chair', x: 230, f: -1 }, { k: 'table', x: 0, cups: [-60, 70] }], actors: [A('MAX', -230, { pose: 'sit', expr: 'sleepy' }), A('EGOR', 230, { f: -1, pose: 'sit', expr: 'smile', beard: true })] }, { in: { type: 'fade', dur: 0.3 } });
sh(272.2, { k: 'set', set: 'home', cam: { z: [1.15, 1.22], x: [0, 30] }, actors: [A('EGOR', -60, { pose: 'holdFront', expr: 'happy', beard: true }), A('WIFE', 190, { f: -1, expr: 'smile' })], propsFront: [{ k: 'carrier', x: -30, y: -225, s: 0.7 }] }, { in: { type: 'fade', dur: 0.3 }, amb: AMB.home });
sh(275.64, face('EGOR', 'smile', { bg: { set: 'home' }, side: 1, x: 140, beard: true, ov: [sub('И НИ РАЗУ НЕ БРОСИЛ', 0.3, { y: 980 })] }), { sfx: [sfx('shimmer', 0.3, -18)] });
// =============== EYE DROPS ON THE BENCH ===============
sh(277.4, { k: 'set', set: 'park', cam: { z: [1.05, 1.08], x: [-500, -300] }, actors: [A('EGOR', 0, { walk: [-760, -260, true], walkT: [0, 1.8], endPose: 'cheer', expr: 'happy', beard: true, s: 1.6 })] }, { sfx: [sfx('footstep', 0.3, -16), sfx('footstep', 0.6, -16)], amb: AMB.park });
sh(W('капли', 278.5), { k: 'insert', what: 'drops', v: '490 РУБ.', bg: { set: 'park' }, mood: 'dusk' }, { sfx: [sfx('pop', 0.4, -12)] });
const benchTwo = (maxO = {}, egorO = {}, o = {}) => ({ k: 'set', set: 'park', cam: { z: [1.15, 1.2], x: [-20, 10], y: -30 }, props: [{ k: 'bench', x: 0 }], actors: [A('MAX', -110, { pose: 'sit', expr: 'awe', y: -8, s: 1.4, noBlink: true, ...maxO }), A('EGOR', 110, { f: -1, pose: 'sit', expr: 'awe', y: -8, s: 1.4, noBlink: true, beard: true, ...egorO })], ...o });
sh(281.18, benchTwo({ f: 1 }, {}, { cam: { z: [1.0, 1.08], x: [-30, 0] }, ov: [sub('КАК ДВА КОТА', W('как', 284) - 281.03, { y: 980 })] }));
sh(285.54, eyes({ redEyes: true, shake: 5, bg: { set: 'park' }, mood: 'dusk' }), { sfx: [sfx('heartbeat', 0.2, -12)] });
sh(288.66, { k: 'insert', what: 'stopwatch', from: 0, to: 4, bg: { set: 'park' }, mood: 'dusk' }, { sfx: [sfx('tick', 0.2, -12), sfx('clock', 0.6, -16)] });
sh(291.98, { k: 'insert', what: 'stopwatch', from: 60, to: 120, bg: { set: 'park' }, mood: 'dusk', ov: [big('1 МИНУТА', 0.1, { y: 120, end: 1.2 }), big('2 МИНУТЫ', W('две', 292.5) - 291.83, { y: 120 })] }, { sfx: [sfx('clock', 0, -14)] });
sh(294.56, face('MAX', 'sad', { bg: { set: 'park' }, x: -120, tear: 2, noBlink: true, redEyes: true }), { sfx: [sfx('shimmer', 0.3, -18)] });
sh(296.0, benchTwo({ expr: 'cry' }, { expr: 'cry' }, { cam: { z: [1.2, 1.3], x: [0, 10], y: -40 }, fx: ['dust', 'tears'] }));
sh(299.84, face('EGOR', 'thinking', { bg: { set: 'park' }, side: 1, x: 140, beard: true, noBlink: true, redEyes: true, ov: [{ k: 'readout', label: 'ТАЙМЕР', v: '3:00', at: 0.3, x: 120 }] }));
sh(303.08, face('EGOR', 'surprised', { bg: { set: 'park' }, side: 1, x: 140, beard: true, talk: talk(303.08, 306.16), noBlink: true }));
sh(306.4, benchTwo({ expr: 'confused' }, { pose: 'point', expr: 'surprised', talk: talk(306.4, 308.18) }));
sh(308.32, face('MAX', 'confused', { bg: { set: 'park' }, x: -120, talk: talk(308.32, 308.72), noBlink: true }));
sh(309.1, face('EGOR', [[0, 'confused'], [0.8, 'thinking']], { bg: { set: 'park' }, side: 1, x: 140, beard: true, talk: talk(309.1, 311.86), ov: [sub('ТЫ ВСЕГДА ВЗДЫХАЛ', W('но', 309.8) - 308.95, { y: 980 })] }));
// =============== BACK AT WORK: SECOND TRY ===============
sh(312.16, { k: 'set', set: 'showroom', so: red3, cam: { z: [1.0, 1.06], x: [-80, -40] }, actors: [A('MAX', 160, { f: -1, expr: 'awe', still: true, noBlink: true })], ov: [{ k: 'counter', label: 'БЕЗ МОРГАНИЯ', from: 0, to: 4, unit: ' Ч', at: 0.4, until: 3.4 }] }, { in: { type: 'dip', dur: 0.4 }, amb: AMB.showroom });
sh(316.16, { k: 'set', set: 'showroom', so: red3, cam: { z: [1.45, 1.5], x: [130, 140], y: -100 }, actors: [A('MAX', 160, { f: -1, expr: 'determined', noBlink: true, pose: { head: [6, -204], sh: [1, -172], hip: [0, -100], eF: [26, -170], hF: [24, -232], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] } })] }, { sfx: [sfx('blip', 0.6, -16)] });
sh(318.64, { k: 'set', set: 'showroom', so: red3, cam: { z: [1.15, 1.2], x: [380, 400], y: -40 }, actors: [A('BOSS', 0, { walk: [900, 520], walkT: [0.4, 3.4], f: -1, expr: 'happy' })], fg: [A('MAX', -340, { f: 1, s: 3.2, y: 330, noBlink: true })] }, { sfx: [sfx('footstep', 1.0, -18), sfx('footstep', 1.6, -18), sfx('footstep', 2.2, -18)] });
sh(322.36, face('BOSS', 'happy', { bg: SR(red3), side: 1, x: 140, talk: talk(322.36, 324.44) }));
sh(324.76, face('MAX', [[0, 'angry'], [2.2, 'sleepy']], { bg: SR(red3), x: -120, shake: 2, blinkAt: [[2.4, 2.9]] }), { sfx: [sfx('hit', 0.3, -16)] });
sh(329.16, line('«НУ, ДАВАЙ УЖЕ, ХВАТИТ!»', { color: 'accent', bg: { set: 'studio', so: { color: '#1a1420' } } }), { sfx: [sfx('impact', 0.1, -12)] });
sh(330.88, eyes({ blinkAt: [[0.3, 1.1]], bg: SR(red3) }), { sfx: [sfx('slowmo', 0.2, -12)] });
sh(332.14, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.05, 1.1], x: [-60, -40] }, actors: [A('MAX', 160, { f: -1, expr: 'shocked' })], blinkIn: 0.6 }, { sfx: [sfx('ding', 0.5, -12)] });
sh(333.72, line('ТЕБЕ 25.', { bg: SR(paint) }), { sfx: [sfx('impact', 0.2, -12)] });
sh(335.36, wide(paint, [A('MAX', 140, { f: -1, expr: 'shocked', s: 1.2 }), A('BOSS', 420, { f: -1, expr: 'happy', s: 1.2 }), A('GIRL', 760, { f: -1, expr: 'smile', s: 1.2, y: -10 })], { cam: { z: [0.82, 0.92], x: [-100, 120] }, ov: [sub('САЛОН ПЕРЕКРАШЕН', 0.3, { y: 160 })] }), { sfx: [sfx('whoosh', 0.2, -14)] });
sh(W('на', 337.6), { k: 'set', set: 'showroom', so: paint, cam: { z: [1.4, 1.45], x: [780, 790], y: -110 }, actors: [A('GIRL', 760, { f: -1, pose: 'wave', expr: 'smile', y: -10 })], ov: [sub('НОВАЯ ДЕВУШКА', 0.3, { y: 980 })] });
sh(W('а', 339.5), { k: 'set', set: 'showroom', so: paint, cam: { z: [1.25, 1.3], x: [200, 230], y: -50 }, actors: [A('MAX', 60, { f: 1, expr: 'worried', noBlink: true }), A('BOSS', 330, { f: -1, pose: 'talk', expr: 'happy' })] });
sh(342.04, face('BOSS', [[0, 'happy'], [2.4, 'joy']], { bg: SR(paint), side: 1, x: 140, talk: talk(342.04, 345.32) }));
sh(345.86, face('MAX', 'determined', { bg: SR(paint), x: -120, noBlink: true, zoom: [1, 1.1] }), { sfx: [sfx('riser', 0.2, -16)] });
sh(349.04, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.15, 1.2], x: [60, 100], y: -40 }, actors: [A('MAX', 60, { f: 1, expr: 'determined', noBlink: true }), A('EGOR', 0, { walk: [-700, -140], walkT: [0, 2.6], endPose: 'holdFront', expr: 'determined', beard: true, f: 1 })] }, { sfx: [sfx('footstep', 0.3, -16), sfx('footstep', 0.9, -16)] });
sh(353.44, face('EGOR', 'determined', { bg: SR(paint), side: 1, x: 140, beard: true, talk: talk(353.44, 355.46), ov: [sub('«ВЫДЕРЖИМ»', 0.2, { y: 980 })] }));
sh(355.98, eyes({ redEyes: true, shake: 3, bg: SR(paint) }), { sfx: [sfx('heartbeat', 0.1, -10)] });
sh(357.44, { k: 'insert', what: 'stopwatch', from: 60, to: 180, bg: SR(paint), ov: [big('1', 0.1, { y: 120, end: 0.85 }), big('2', W('две', 358) - 357.29, { y: 120, end: W('три', 359) - 357.29 }), big('3', W('три', 359) - 357.29, { y: 120 })] }, { sfx: [sfx('tick', 0.1, -12), sfx('tick', 0.95, -12), sfx('tick', 2.0, -12)] });
sh(360.18, face('MAX', 'determined', { bg: SR(paint), x: -120, tear: 1, noBlink: true, redEyes: true }), { sfx: [sfx('shimmer', 0.4, -18)] });
sh(362.16, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.15, 1.2], x: [200, 220], y: -40 }, actors: [A('MAX', 60, { f: 1, expr: 'determined', noBlink: true }), A('EGOR', -120, { f: 1, expr: 'worried', beard: true }), A('BOSS', 0, { walk: [800, 330], walkT: [0, 2.8], endPose: 'holdFront', f: -1, expr: 'happy' })], propsFront: [] }, { sfx: [sfx('footstep', 0.3, -16), sfx('footstep', 0.9, -16)] });
sh(365.36, { k: 'set', set: 'showroom', so: red, cam: { z: [1.3, 1.36], x: [160, 180], y: -50, r: [-0.02, 0.01] }, freeze: { badge: '4:00' }, actors: [A('MAX', 60, { f: 1, expr: 'scared', still: true }), A('BOSS', 330, { f: -1, pose: 'holdFront', expr: 'happy' })], propsFront: [{ k: 'envelope', x: 270, y: -235, s: 0.4 }], ov: [big('И ВОТ МЫ ВЕРНУЛИСЬ', 0.3, { y: 170 })], bars: 'scope' }, { in: { type: 'flash', dur: 0.45 }, sfx: [sfx('freeze', 0.05, -8)] });
// =============== BACK TO THE COLD OPEN ===============
sh(367.1, wide(paint, [A('MAX', 120, { f: -1, expr: 'scared', still: true, noBlink: true, s: 1.2 }), A('EGOR', -60, { f: 1, beard: true, expr: 'worried', s: 1.2 }), A('BOSS', 330, { f: -1, pose: 'holdFront', expr: 'happy', s: 1.2 })], { cam: { z: [1.0, 0.86], x: [60, -200] }, ov: [sub('КУТУЗОВСКИЙ ПРОСПЕКТ', 0.4, { y: 980 })] }), { amb: AMB.showroom });
sh(W('не', 370.5), eyes({ redEyes: true, shake: 3, bg: SR(paint), ov: [{ k: 'counter', label: 'НЕ МОРГАЯ', from: 236, to: 240, fmt: 'mmss', at: 0.2, until: 2.2 }] }), { sfx: [sfx('heartbeat', 0.1, -10)] });
sh(373.14, { k: 'insert', what: 'envelope', bg: SR(paint), label: 'ПРЕМИЯ' }, { sfx: [sfx('swish', 0.2, -14)] });
sh(375.84, face('BOSS', 'happy', { bg: SR(paint), side: 1, x: 140, talk: talk(375.84, 377.4) }));
sh(377.74, face('BOSS', 'smirk', { bg: SR(paint), side: 1, x: 140, talk: talk(377.74, 378.52), tilt: 0.05 }));
sh(378.68, face('MAX', 'confused', { bg: SR(paint), x: -120, talk: talk(378.68, 379.3), noBlink: true }));
sh(379.64, line('63 000?', { s2: 'ВМЕСТО 60 000?', at2: W('вместо', 381) - 379.49, bg: SR(paint) }), { sfx: [sfx('blip', 0.2, -14), sfx('blip', 1.8, -14)] });
sh(383.44, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.4, 1.5], x: [-20, 0], y: -80 }, actors: [A('MAX', 60, { f: 1, expr: 'confused', noBlink: true }), A('EGOR', -130, { f: 1, pose: { head: [22, -196], sh: [12, -168], hip: [0, -100], eF: [24, -140], hF: [30, -116], eB: [-6, -136], hB: [-8, -102], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }, expr: 'determined', beard: true })] });
sh(385.96, face('EGOR', 'surprised', { bg: SR(paint), side: 1, x: 140, beard: true, talk: talk(385.96, 387.64) }));
sh(387.98, { k: 'bp', mode: 'pattern', head: '4 РАЗА ИЗ 4', items: [{ s: '«Скорее бы…»', age: '21→22', at: 0.4 }, { s: '«Скорее бы…»', age: '22→23', at: 1.0 }, { s: '«Скорее бы…»', age: '23→24', at: 1.6 }, { s: '«Хватит!»', age: '24→25', at: 2.2 }], bars: 'none' }, { in: { type: 'zoom', dur: 0.4 }, sfx: [sfx('pop', 0.4, -14), sfx('pop', 1.0, -14), sfx('pop', 1.6, -14), sfx('pop', 2.2, -14), sfx('stinger', 3.8, -12)] });
sh(393.66, face('EGOR', 'determined', { bg: SR(paint), side: 1, x: 140, beard: true, talk: talk(393.66, 399.54) }));
sh(396.14, { k: 'insert', what: 'clock', clock: 10 * 3600, spin: 3 * 3600, bg: SR(paint), ov: [big('ЧТОБЫ ВРЕМЯ ПРОШЛО ПОБЫСТРЕЕ', 0.4, { y: 120, size: 56 })] }, { sfx: [sfx('clock', 0, -12), sfx('whoosh', 1.5, -14)] });
sh(399.86, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.45, 1.5], x: [60, 70], y: -90, r: [-0.015, 0.0] }, freeze: { badge: 'ПАУЗА' }, actors: [A('MAX', 60, { f: 1, expr: 'shocked', still: true, noBlink: true })], bars: 'scope' }, { in: { type: 'flash', dur: 0.35 }, sfx: [sfx('freeze', 0.05, -10)] });
sh(401.14, face('MAX', 'awe', { bg: SR(paint), x: -120, noBlink: true, zoom: [1.05, 1.2] }));
sh(402.98, { k: 'set', set: 'showroom', so: grey, cam: { z: [1.35, 1.4], x: [380, 400], y: -60 }, actors: [A('MAX', 380, { f: 1, expr: 'sleepy', pose: 'think' })], ov: [sub('«Скорее бы вечер»', 0.15, { y: 980, size: 46 }), age(21, 0.15)], veil: ['#302010', 0.2] }, { in: { type: 'dipWhite', dur: 0.25 } });
sh(404.24, { k: 'set', set: 'showroom', so: red, cam: { z: [1.25, 1.3], x: [200, 220], y: -50 }, actors: [A('MAX', 60, { f: 1, expr: 'angry', pose: 'crossArms' }), A('BOSS', 330, { f: -1, expr: 'happy', pose: 'talk' })], ov: [sub('«Ну когда уже эта премия?»', 0.15, { y: 980, size: 46 }), age(22, 0.15)], veil: ['#302010', 0.2] }, { in: { type: 'dipWhite', dur: 0.25 } });
sh(406.08, cafeTwo({ expr: 'sleepy' }, { expr: 'surprised', beard: true }, { ov: [sub('«Скорее бы выходные»', 0.15, { y: 980, size: 46 }), age(23, 0.15)], veil: ['#302010', 0.2] }), { in: { type: 'dipWhite', dur: 0.25 } });
sh(407.62, { k: 'set', set: 'showroom', so: red3, cam: { z: [1.4, 1.45], x: [140, 150], y: -90 }, actors: [A('MAX', 160, { f: -1, expr: 'angry', pose: 'facepalm' })], ov: [sub('«Давай уже, хватит!»', 0.15, { y: 980, size: 46 }), age(24, 0.15)], veil: ['#302010', 0.2] }, { in: { type: 'dipWhite', dur: 0.25 } });
sh(409.2, line('ТЫ НЕ ТЕРЯЛ ГОД ОТ МОРГАНИЯ.', { color: 'cream', bg: SR(paint) }), { in: { type: 'dip', dur: 0.3 } });
sh(411.36, line('ТЫ ОТДАВАЛ ЕГО САМ.', { color: 'accent', bg: SR(paint) }), { sfx: [sfx('stinger', 0.1, -10)] });
sh(412.96, { k: 'set', set: 'studio', so: { color: '#2a2a40', light: '#9fb8ff' }, cam: { z: [1.05, 1.12] }, actors: [A('MAX', -60, { pose: 'sad', expr: 'sad', s: 1.8 })], ov: [{ k: 'counter', label: 'ОТДАНО', from: 0, to: 4, unit: ' ГОДА', at: 0.4, until: 2.6, x: 1150, y: 540 }] }, { sfx: [sfx('counter', 0.4, -16)] });
sh(416.26, eyes({ redEyes: true, bg: SR(paint), expr: 'determined' }), { sfx: [sfx('heartbeat', 0.1, -14)] });
sh(417.72, face('EGOR', 'smile', { bg: SR(paint), side: 1, x: 140, beard: true }));
sh(419.24, { k: 'insert', what: 'envelope', bg: SR(paint), label: 'ПРЕМИЯ' });
sh(420.2, { k: 'set', set: 'showroom', so: paint, cam: { z: [1.5, 1.55], x: [-470, -460], y: -60 } }, { sfx: [sfx('shimmer', 0.2, -18)] });
sh(421.6, face('BOSS', [[0, 'happy'], [2, 'smile']], { bg: SR(paint), side: 1, x: 140, ov: [sub('С ИДИОТСКОЙ НАДЕЖДОЙ', 1.6, { y: 980 })] }));
// =============== THE TURN ===============
sh(425.9, face('MAX', [[0, 'neutral'], [2.6, 'smile']], { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, x: -120, noBlink: true, zoom: [1, 1.08] }), { sfx: [sfx('riser', 1.4, -16)] });
sh(430.86, line('«ПУСТЬ БУДЕТ СЕГОДНЯ»', { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } } }), { in: { type: 'fade', dur: 0.3 }, sfx: [sfx('shimmer', 0.2, -12)] });
sh(432.6, face('MAX', 'happy', { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, x: -120, noBlink: true, ov: [sub('«Пусть этот день будет именно этим»', 0.3, { y: 980, size: 44 })] }));
sh(435.7, eyes({ blinkAt: [[0.3, 0.75]], expr: 'happy', bg: { set: 'showroom', so: { ...paint, mood: 'golden' } } }), { sfx: [sfx('slowmo', 0.1, -14)] });
sh(437.02, { k: 'set', set: 'showroom', so: { ...paint, mood: 'golden' }, cam: { z: [1.15, 1.18], x: [100, 120], y: -40 }, actors: [A('MAX', 60, { f: 1, expr: 'surprised' }), A('EGOR', -140, { f: 1, expr: 'neutral', beard: true }), A('BOSS', 330, { f: -1, expr: 'happy', pose: 'holdFront' })], blinkIn: 0.4, ov: [big('НИЧЕГО НЕ ПРОИСХОДИТ.', 0.5, { y: 170, size: 64 })] }, { sfx: [sfx('ding', 0.4, -14)] });
sh(438.7, { k: 'insert', what: 'calendar', year: 2027, bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, ov: [sub('ТОТ ЖЕ КАЛЕНДАРЬ', 0.2, { y: 140 })] });
sh(W('тот', 440), { k: 'set', set: 'showroom', so: { ...paint, mood: 'golden' }, cam: { z: [1.3, 1.35], x: [-20, 0], y: -60 }, actors: [A('MAX', 60, { f: 1, expr: 'joy' }), A('EGOR', -140, { f: 1, expr: 'happy', beard: true })], ov: [sub('ТОТ ЖЕ ЕГОР РЯДОМ', 0.3, { y: 980 })] });
sh(442.64, face('BOSS', 'confused', { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, side: 1, x: 140 }));
sh(444.62, face('BOSS', 'angry', { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, side: 1, x: 140, talk: talk(444.62, 445.66) }));
sh(446.0, { k: 'set', set: 'showroom', so: { ...paint, mood: 'golden' }, cam: { z: [1.15, 1.2], x: [100, 130], y: -40 }, actors: [A('MAX', 60, { f: 1, expr: 'smile' }), A('EGOR', -150, { f: 1, beard: true, expr: 'joy', pose: [[0, 'stand'], [0.4, { head: [30, -150], sh: [20, -126], hip: [0, -90], eF: [36, -100], hF: [40, -80], eB: [14, -96], hB: [24, -150], kF: [10, -46], fF: [6, 0], kB: [-6, -46], fB: [-12, 0] }]] }), A('BOSS', 330, { f: -1, expr: 'confused', pose: 'holdFront' })], fx: ['dust', 'streak'] }, { sfx: [sfx('applause', 0.4, -26)] });
sh(450.26, face('MAX', 'joy', { bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, x: -120, blinkP: 1.2, zoom: [1, 1.06] }), { sfx: [sfx('shimmer', 0.6, -16)] });
sh(455.06, wide({ ...paint, mood: 'golden' }, [A('MAX', 120, { f: -1, pose: 'cheer', expr: 'joy', s: 1.2 }), A('EGOR', -60, { f: 1, beard: true, pose: 'cheer', expr: 'joy', s: 1.2 }), A('BOSS', 330, { f: -1, expr: 'confused', s: 1.2 })], { cam: { z: [1.0, 0.84], x: [60, -220] }, ov: [big('ЛУЧШЕЕ ЧУВСТВО', 0.6, { y: 170 })] }), { sfx: [sfx('powerup', 0.2, -16)] });
sh(458.16, { k: 'insert', what: 'envelope', take: 0.4, bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, label: 'ПРЕМИЯ' }, { sfx: [sfx('swish', 0.4, -14)] });
sh(459.8, { k: 'insert', what: 'note', money: true, bg: { set: 'showroom', so: { ...paint, mood: 'golden' } }, ov: [{ k: 'readout', label: 'ВНУТРИ', v: '3 000 РУБ.', at: 0.3, y: 980 }] }, { sfx: [sfx('pop', 0.3, -14)] });
sh(462.6, { k: 'insert', what: 'note', bg: { set: 'showroom', so: { ...paint, mood: 'golden' } } }, { sfx: [sfx('ding', 1.2, -16)] });
sh(464.96, { k: 'set', set: 'showroom', so: { ...paint, mood: 'golden' }, cam: { z: [1.2, 1.25], x: [100, 130], y: -40 }, actors: [A('MAX', 60, { f: 1, expr: [[0, 'smirk'], [1.2, 'joy']], pose: [[0, 'holdFront'], [1.2, { head: [26, -170], sh: [16, -146], hip: [0, -96], eF: [30, -110], hF: [34, -90], eB: [10, -110], hB: [18, -90], kF: [8, -48], fF: [6, 0], kB: [-6, -48], fB: [-12, 0] }]] }), A('EGOR', -150, { f: 1, beard: true, expr: 'joy', pose: 'cheer' }), A('BOSS', 330, { f: -1, expr: 'confused', pose: 'shrug' })], fx: ['dust', 'streak'] });
// =============== SATURDAY ===============
sh(468.8, { k: 'set', set: 'home', cam: { z: [1.0, 1.06], x: [-60, 0] }, actors: [A('EGOR', 380, { f: -1, beard: true, expr: 'happy', pose: 'wave' }), A('MAX', 0, { walk: [-900, -420], walkT: [0, 1.8], endPose: 'wave', expr: 'happy' })], ov: [big('СУББОТА', 0.4, { y: 160 })], fx: ['dust', 'streak'] }, { in: { type: 'dip', dur: 0.5 }, amb: AMB.home });
sh(471.12, { k: 'set', set: 'home', cam: { z: [1.3, 1.36], x: [-60, -40], y: -40 }, actors: [A('BABY', 60, { f: -1, pose: 'sit', expr: 'happy', s: 1.4 }), A('MAX', -330, { f: 1, expr: 'smile' })], fx: ['dust', 'streak'] });
sh(W('тянет', 472.5), { k: 'set', set: 'home', cam: { z: [1.7, 1.76], x: [40, 50], y: -10 }, actors: [A('BABY', 60, { f: -1, pose: { head: [8, -176], sh: [4, -144], hip: [0, -72], eF: [30, -170], hF: [56, -196], eB: [24, -168], hB: [48, -190], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }, expr: 'joy', s: 1.4 })], fx: ['dust', 'streak'] });
sh(474.42, { k: 'set', set: 'home', cam: { z: [1.3, 1.36], x: [-60, -40], y: -40 }, actors: [A('MAX', -120, { f: 1, pose: [[0, 'stand'], [1.0, 'kneel']], expr: 'smile' }), A('BABY', 60, { f: -1, pose: 'sit', expr: 'joy', s: 1.4 })], fx: ['dust', 'streak'] });
sh(W('но', 476.5), { k: 'set', set: 'home', cam: { z: [1.2, 1.3], x: [-80, -60], y: -60 }, actors: [A('MAX', -80, { f: 1, pose: 'cheer', expr: 'joy' }), A('BABY', -60, { f: -1, pose: 'cheer', expr: 'joy', s: 1.3, y: -390, shadow: false }), A('EGOR', 330, { f: -1, beard: true, expr: 'happy' })], fx: ['dust', 'streak'] }, { sfx: [sfx('shimmer', 0.3, -14)] });
sh(W('это', 479.2), face('MAX', 'joy', { bg: { set: 'home' }, x: -120, ov: [big('ЭТО ТВОЙ МОМЕНТ.', 0.2, { y: 150 })] }));
sh(481.16, { k: 'set', set: 'home', cam: { z: [1.05, 0.95] }, actors: [A('MAX', -80, { f: 1, pose: 'cheer', expr: 'joy' }), A('BABY', -60, { f: -1, pose: 'cheer', expr: 'joy', s: 1.3, y: -390, shadow: false }), A('EGOR', 330, { f: -1, beard: true, expr: 'happy' }), A('WIFE', 470, { f: -1, expr: 'smile' })], ov: [sub('И НИКТО НЕ ЗАБЕРЁТ ЕГО У ТЕБЯ', 0.3, { y: 980 })], fx: ['dust', 'streak'] });
// =============== OUTRO ===============
sh(483.26, { k: 'end', q: 'Какой год ты бы пропустил?', s2: 'А какой не отдал бы ни за что?', bars: 'none' }, { in: { type: 'dip', dur: 0.5 }, sfx: [sfx('pop', 0.8, -14)] });
sh(490.58, { k: 'set', set: 'showroom', so: { ...paint, mood: 'golden' }, cam: { z: [1.3, 1.36], x: [380, 400], y: -60 }, actors: [A('BOSS', 380, { f: -1, pose: 'talk', expr: [[0, 'happy'], [3, 'smirk']], talk: talk(W('сергей', 492), 496.88) })], ov: [sub('СЛЕДУЮЩАЯ СЕРИЯ — В СЛЕДУЮЩЕМ МЕСЯЦЕ', 1.6, { y: 980, size: 40 })] }, { sfx: [sfx('blip', 1.6, -14)] });
sh(497.38, { k: 'title', lines: ['КАЖДАЯ ИСТОРИЯ НАЧИНАЕТСЯ', 'СО СЛОВА «ЕСЛИ»'], bg: SR({ ...paint, mood: 'golden' }), bars: 'scope' }, { in: { type: 'fade', dur: 0.5 }, sfx: [sfx('stinger', 0.3, -12)] });

// ---------- assemble ----------
S.sort((a, b) => a.t - b.t);
const music = [
  [0, 'tension', 0.6], [26.3, 'calm', 0.3], [82.0, 'mystery', 0.5], [134.6, 'wonder', 0.45], [165.1, 'playful', 0.35], [222.4, 'mystery', 0.45],
  [262.0, 'sad', 0.4], [277.2, 'playful', 0.45], [312.0, 'tension', 0.6], [365.2, 'dark', 0.75], [409.1, 'sad', 0.45], [430.7, 'hopeful', 0.55], [468.6, 'triumph', 0.5], [483.1, 'hopeful', 0.4],
];
const shots = S.map((e, i) => {
  const start = i === 0 ? 0 : +Math.max(0, e.t - 0.15).toFixed(2), next = S[i + 1];
  const end = next ? +Math.max(0, next.t - 0.15).toFixed(2) : DURATION;
  const { k, bars, ...params } = e.params;
  const shot = { id: `s${String(i + 1).padStart(3, '0')}`, start, end, line: '', scene: k + (params.set ? ':' + params.set : params.what ? ':' + params.what : params.mode ? ':' + params.mode : ''), params: { k, ...params }, in: e.in || { type: 'cut' }, sfx: e.sfx || [], ...(e.amb ? { amb: e.amb } : {}) };
  if (bars) shot.bars = bars;
  shot.line = words.filter((w) => w.start >= start - 0.05 && w.start < end - 0.05).map((w) => w.word).join(' ');
  return shot;
});
// carry ambience forward until the location changes
let amb = null; for (const s of shots) { if (s.amb) amb = s.amb; else if (['showroom', 'cafe', 'park', 'doorway', 'home', 'wedding', 'stairwell'].some((n) => s.scene.endsWith(n)) && amb) s.amb = amb; }
for (const s of shots) if (s.end - s.start < 0.5) console.warn('SHORT', s.id, s.start, s.end, s.scene);
const out = { title: 'Моргни', duration: DURATION, shots, music: music.map(([st, mood, intensity], i) => ({ start: st, end: music[i + 1]?.[0] ?? DURATION, mood, intensity })) };
fs.writeFileSync(path.join(DIR, 'shots.json'), JSON.stringify(out, null, 1));
console.log(`wrote ${shots.length} shots, ${DURATION}s, median ${shots.map((s) => s.end - s.start).sort((a, b) => a - b)[shots.length >> 1].toFixed(2)}s`);
