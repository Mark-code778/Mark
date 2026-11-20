// story/plan.mjs — раскадровка ролика «Что если у тебя телекинез». Запуск: node story/plan.mjs  -> story/shots.json
// Каждый кадр: K(якорь, параметры, опции). Якорь — время начала фразы (с) или [время, 'слово'] (кадр начинается с этого слова).
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.dirname(new URL(import.meta.url).pathname), PROJ = path.dirname(DIR);
const words = JSON.parse(fs.readFileSync(path.join(PROJ, 'timeline/words.json'), 'utf8')).words;
const VOICE = 1063.993, DURATION = +(VOICE + 1.5).toFixed(2);
const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');

const plan = [];
const K = (anchor, params, o = {}) => plan.push({ anchor, params, ...o });

// ---------- помощники ----------
const fig = (w) => (x, o = {}) => ({ w, x, ...o });
const A = fig('A'), L = fig('L'), P = fig('P'), D = fig('D'), M = fig('M'), B = fig('B'), X = fig('X'), J = fig('J'), N = fig('N'), R = fig('R'), Y = fig('Y'), W = fig('W'), KG = fig('K'), C = fig('C'), SC = fig('S'), F = fig('F');
const WIDE = (x = 0, y = 0, z = [1, 1.06]) => ({ z, x: [x + 20, x - 20], y });
const MED = (x = 0, y = 170, z = [1.55, 1.63]) => ({ z, x: [x + 16, x - 16], y });
const CLOSE = (x = 0, y = 110, z = [2.3, 2.42]) => ({ z, x: [x + 8, x - 8], y });
const st = (set, so, cam, figs = [], objs = [], more = {}) => ({ tpl: 'st', set, so, cam, s: 1.2, figs, objs, ...more });
const ins = (set, so, objs, more = {}) => ({ tpl: 'st', set, so, blur: 12, cam: { z: [1, 1.05], x: [10, -10], y: 0 }, s: 1.2, figs: [], objs, ...more });
const face = (w, e, set, more = {}) => ({ tpl: 'face', w, e, set, ...more });
const line = (str, set, more = {}) => ({ tpl: 'line', str, set, ...more });
const bp = (name, more = {}) => ({ tpl: 'bp', bp: name, ...more });
const fl = (at, h, more = {}) => ({ at, h, ...more });
const sfx = (...l) => l.map(([at, name, gain = -10, more = {}]) => ({ at, name, gain, ...more }));
const K_ = { kitchen: { mood: 'interiorWarm' }, kitchenN: { mood: 'night' }, living: { mood: 'interiorWarm' }, livingN: { mood: 'interiorWarm', night: true } };
const amb = { roomtone: { name: 'roomtone', gain: -24 }, city: { name: 'city', gain: -26 }, wind: { name: 'wind', gain: -28 }, hum: { name: 'hum', gain: -26 }, murmur: { name: 'murmur', gain: -28 } };

// ================= ХОЛОДНОЕ ОТКРЫТИЕ =================
K(0.0, st('bedroom', {}, WIDE(-120, 60, [1.25, 1.33]), [A(-130, { p: [[0, 'sit'], [1.1, 'reach']], e: [[0, 'sleepy'], [1.2, 'neutral']], y: 40 })], [{ o: 'phone', x: 60, y: 96, back: true }]), { scene: 'спальня, утро: Артём садится на кровати и тянется к телефону', amb: amb.roomtone });
K([0, 'прыгает'], st('bedroom', {}, CLOSE(-20, 140, [2.1, 2.25]), [A(-130, { p: 'reach', e: [[0, 'surprised'], [0.6, 'awe']], y: 40, eyes: [[0, 1]] })], [{ o: 'phone', path: [[0, [60, 96]], [0.25, [60, 150]], [0.75, [-40, 228]]], ease: 'out', pw: [0, 0.9], ph: 20, pr: 40 }], { pw: { at: 0, until: 0.8, obj: 0 } }), { scene: 'телефон сам прыгает в ладонь', sfx: sfx([0.05, 'whoosh', -12], [0.7, 'pop', -10]) });
K(3.70, face('A', [[0, 'surprised'], [0.4, 'awe']], 'bedroom', { eyesGlow: [[0.3, 1]], ringsOn: '#c8a8ff' }), { scene: 'гигантское лицо Артёма, в глазах фиолетовое свечение', in: { type: 'flash', dur: 0.35 }, bars: 'scope', sfx: sfx([0, 'shimmer', -8]) });
K(5.26, st('kitchen', { wrecked: true }, WIDE(0, 40), [A(-150, { p: 'shocked', e: 'shocked', yolk: true, p: [[0, 'handsOnHead']] })], [{ o: 'pan', path: [[0, [500, 400]], [1.2, [-500, 520]]], spin: 6, pw: true }, { o: 'egg', path: [[0, [-600, 200]], [1.4, [300, 600]]], spin: 4, pw: true }, { o: 'mug', path: [[0, [200, 140]], [1.4, [-300, 500]]], spin: 3, pw: true }], { cam: { z: [1, 1.05], x: [0, 0], y: 40, sh: 4 }, badge: { str: 'МЕСЯЦ 1', at: 0.2 } }), { scene: 'разгромленная кухня, всё летает', sfx: sfx([0.2, 'whoosh', -10], [0.9, 'hit', -12]) });
K([5.26, 'выиграешь'], st('living', { sofa: false }, MED(-40, 230, [1.45, 1.5]), [A(-180, { pushup: { rate: 2.2 }, y: 34, fl: fl(0, 34, { dur: 0.1, bob: false }), e: 'smirk', f: 1 }), L(200, { p: 'crossArms', f: -1, e: [[0, 'confused'], [1.2, 'shocked']] })], [], { timer: { from: 90, to: 100, t0: 0.2, t1: 2.2, suf: '' } }), { scene: 'спор с Лёхой: 100 отжиманий', sfx: sfx([2.2, 'ding', -10]) });
K([5.26, 'станешь'], st('living', K_.livingN, WIDE(-60, 60, [1.2, 1.27]), [A(-60, { lie: 1, y: 70, e: 'sleepy' })], [{ o: 'remote', path: [[0, [500, 200]], [1.6, [40, 180]]], pw: true }, { o: 'cup', path: [[0, [-600, 160]], [2.0, [-140, 190]]], pw: true, bob: 6 }], { so: { night: true, tv: true }, badge: { str: 'САМЫЙ ЛЕНИВЫЙ', at: 0.6 } }), { scene: 'Артём лежит на диване, всё прилетает само', amb: amb.roomtone });
K(13.20, st('garage', {}, WIDE(40, 80, [1.15, 1.25]), [A(-480, { p: 'strain', e: 'determined', eyes: [[0, 1]] })], [{ o: 'car', x: 80, y: 90, s: 1.0, pw: true, ph: 60, pr: 230, sh: 2, rust: true }], { pw: { at: 0.3, obj: 0 }, bars: 'scope' }), { scene: 'гараж: Артём держит Ниву силой мысли', amb: amb.hum, sfx: sfx([0, 'riser', -12]), bars: 'scope' });
K([13.20, 'знать'], face('A', 'determined', 'garage', { blood: 0.4, sweat: true, sh: 3, eyesGlow: [[0, 1]] }), { bars: 'scope', scene: 'лицо Артёма, напряжение, кровь из носа', sfx: sfx([0.2, 'heartbeat', -8]) });
K(21.34, st('garage', {}, CLOSE(-20, 250, [2.0, 2.15]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 64, s: 1.0, pw: true, ph: 60, pr: 230, sh: 3 }], { cam: { z: [2.0, 2.15], x: [-20, -20], y: 250, sh: 3 } }), { bars: 'scope', scene: 'папа под нависшей машиной', sfx: sfx([0, 'heartbeat', -6]) });

// ================= ТИТР И ПРАВИЛА =================
K(23.28, { tpl: 'title' }, { in: { type: 'fade', dur: 0.5 }, bars: 'scope', sfx: sfx([0.05, 'stinger', -6]), scene: 'титр «Что если у тебя телекинез?»' });
K(25.92, bp('rules', { cone: 2.3 }), { in: { type: 'zoom', dur: 0.4 }, sfx: sfx([0.4, 'pop', -12], [1.0, 'pop', -12], [2.4, 'shimmer', -12]), scene: 'схема: взгляд → мысль → предмет; всё, что видишь' });
K(29.04, bp('weight'), { sfx: sfx([0.3, 'counter', -16]), scene: 'шкала: чем тяжелее, тем труднее' });
K(31.46, bp('spooncar'), { sfx: sfx([0.3, 'blip', -12], [1.4, 'buzz', -12]), scene: 'ложка легко, машина — на пределе' });
K(34.28, face('A', [[0, 'worried'], [0.5, 'nervous']], 'kitchen', { so: K_.kitchen, ringsOn: '#ff8a7a', sweat: true }), { scene: 'головная боль после усилия', sfx: sfx([0.3, 'heartbeat', -10]) });
K([34.28, 'зверский'], st('kitchen', { fridgeOpen: 1 }, MED(-560, 200), [A(-520, { p: 'holdFront', e: 'happy', f: -1 })], [{ o: 'pizza', attach: 0, ay: -6 }]), { scene: 'зверский голод: Артём у холодильника', amb: amb.roomtone });

// ================= КУХНЯ: ПЕРВОЕ УТРО =================
K(38.80, st('kitchen', {}, WIDE(-40, 40), [A(-150, { p: [[0, 'sit'], [0.4, 'facepalm']], e: 'sleepy' })], [{ o: 'stool', x: -160, back: true }, { o: 'mug', x: 120, y: 134 }]), { in: { type: 'dip', dur: 0.5 }, scene: 'кухня, утро: Артём думает, что не проснулся', amb: amb.roomtone });
K(41.08, st('kitchen', {}, CLOSE(-80, 120, [2.2, 2.3]), [A(-150, { p: 'sit', e: 'thinking', look: [1, 0.3], eyes: [[1.5, 1]] })], [{ o: 'stool', x: -160, back: true }, { o: 'mug', x: 120, y: 134 }], { pw: { at: 1.6, obj: 1 } }), { scene: 'смотрит на кружку и мысленно тянет её' });
K(44.78, ins('kitchen', {}, [{ o: 'mug', x: 0, y: 134, s: 2.6, sh: [[0, 0], [0.2, 8], [0.5, 0]] }], { cam: { z: [1.9, 1.95], x: [40, 30], y: 200 }, blur: 0 }), { scene: 'кружка дёргается', sfx: sfx([0.2, 'hit', -14, { pitch: 1.6 }]) });
K(45.90, ins('kitchen', {}, [{ o: 'mug', path: [[0, [160, 134]], [0.8, [160, 134]], [1.1, [110, 134]], [1.9, [110, 134]], [2.2, [40, 134]], [2.9, [40, 134]], [3.3, [-40, 134]]], ease: 'out', s: 2.0, pw: [0.6], ph: 30, pr: 60 }], { cam: { z: [1.8, 1.9], x: [60, 0], y: 200 }, blur: 0 }), { scene: 'кружка рывками ползёт по столу', sfx: sfx([0.9, 'swish', -16], [2.1, 'swish', -16], [3.0, 'swish', -16]) });
K(49.58, face('A', 'joy', 'kitchen', { sh: 6, talk: [0.1, 1.6], noRings: true }), { scene: 'Артём хохочет', sfx: sfx([0.2, 'pop', -14]) });
K(51.56, st('kitchen', {}, WIDE(-200, 40, [1.1, 1.15]), [A(-150, { p: [[0, 'sit'], [1.0, 'point']], e: 'smirk', f: -1 })], [{ o: 'stool', x: -160, back: true }], { pw: { at: 1.3, to: [-560, 160] } }), { scene: 'решает готовить завтрак, не вставая' });
K(54.42, ins('kitchen', { fridgeOpen: [[0, 0], [0.7, 1]] }, [], { blur: 0, cam: { z: [1.7, 1.75], x: [-700, -690], y: 120 } }), { scene: 'холодильник открывается сам', sfx: sfx([0.1, 'whoosh', -14], [0.4, 'shimmer', -14]) });
K(56.48, st('kitchen', { fridgeOpen: 1 }, WIDE(-300, 60), [A(-150, { p: 'point', e: 'joy', f: -1 })], [0, 1, 2, 3, 4].map((i) => ({ o: 'egg', path: [[0, [-660, 160 + i * 20]], [0.3 + i * 0.15, [-660, 160 + i * 20]], [1.6 + i * 0.1, [-380 + i * 50, 320 + (i % 2) * 40]]], ease: 'out', pw: [0.2], ph: 12, pr: 22 })), { read: { value: '× 5', at: 1.5 } }), { scene: 'из холодильника вылетают пять яиц', sfx: sfx([0.4, 'whoosh', -12], [1.5, 'pop', -12]) });
K(58.80, face('A', [[0, 'smile'], [1.2, 'worried']], 'kitchen', { look: [[0, [0, -0.5]], [1.4, [0.6, -0.7]]] }), { scene: 'силы ты не чувствуешь' });
K(62.24, st('kitchen', {}, WIDE(-200, 80), [A(-150, { p: 'explain', e: [[0, 'neutral'], [1.6, 'shocked']], f: -1 })], [{ o: 'egg', path: [[0, [-380, 320]], [1.4, [-300, 330]], [1.8, [-200, 900]]], ease: 'in', pw: [0, 1.8] }]), { scene: 'хотел аккуратно…' });
K([62.24, 'яйцо'], ins('kitchen', {}, [{ o: 'splat', x: -100, y: 600, s: 2.4, when: [0.35, 9] }, { o: 'egg', path: [[0, [-100, 300]], [0.35, [-100, 590]]], ease: 'in', s: 2, when: [0, 0.35] }], { blur: 0, cam: { z: [1.5, 1.55], x: [-100, -100], y: -260, sh: [[0.35, 10], [0.7, 0]] } }), { scene: 'яйцо врезается в потолок', sfx: sfx([0.35, 'hit', -6]) });
K(65.92, ins('kitchen', {}, [{ o: 'splat', x: 80, y: 380, s: 2.2, when: [0.3, 9], drip: [[0.3, 0], [1.0, 1]] }, { o: 'egg', path: [[0, [-500, 300]], [0.3, [80, 370]]], ease: 'in', s: 2, when: [0, 0.3] }], { blur: 0, cam: { z: [1.6, 1.62], x: [80, 80], y: -60 } }), { scene: 'второе — в окно', sfx: sfx([0.3, 'hit', -8]) });
K(67.18, ins('kitchen', {}, [{ o: 'pan', path: [[0, [-500, 300]], [0.45, [60, 190]], [0.7, [20, 120]], [1.6, [-20, 20]]], ease: 'out', s: 2.2, rotKey: [[0, 0], [0.45, 3], [1.6, 4]], pw: [0, 0.45] }], { blur: 0, cam: { z: [1.5, 1.5], x: [60, 60], y: 120, sh: [[0.45, 12], [0.8, 0]] } }), { scene: 'сковородка бьёт по батарее', sfx: sfx([0.45, 'impact', -6], [0.5, 'ding', -10, { pitch: 0.7 }]) });
K(69.40, ins('kitchen', {}, [{ o: 'knife', path: [[0, [440, 220]], [0.2, [440, 280]], [0.8, [-200, 470]]], ease: 'out', s: 2.4, rotKey: [[0, -1.6], [0.2, -1.6], [0.8, 3.1]], pw: [0, 0.8] }], { blur: 0, cam: { z: [1.25, 1.3], x: [150, 0], y: -100 } }), { scene: 'нож срывается с подставки', sfx: sfx([0.15, 'swish', -6]) });
K([69.40, '20'], st('kitchen', {}, CLOSE(-160, 60, [2.0, 2.1]), [A(-150, { p: 'sit', e: 'shocked', f: 1 })], [{ o: 'stool', x: -160, back: true }, { o: 'cabinet', x: -330, y: 240, s: 1.6, back: true, color: '#6a4a3a' }, { o: 'knife', x: -230, y: 300, s: 1.8, rot: 3.1, sh: [[0, 4], [0.4, 0]] }], { dim: { x1: -180, y1: 296, x2: -100, y2: 296, str: '20 СМ', at: 0.6 } }), { scene: 'нож в дверце шкафа в 20 см от головы', bars: 'scope', in: { type: 'flash', dur: 0.25 }, sfx: sfx([0, 'impact', -5], [0.6, 'blip', -12]) });
K(75.00, st('kitchen', { wrecked: true }, WIDE(-100, 40, [1.15, 1.08]), [A(-150, { p: 'sit', e: 'sad', yolk: true })], [{ o: 'stool', x: -160, back: true }, { o: 'pan', x: 300, y: 0, s: 1.5, rot: 0.3 }, { o: 'splat', x: 500, y: 6, s: 1.4 }, { o: 'splat', x: -480, y: 4, s: 1.2, seed: 6 }, { o: 'mug', x: 220, y: 0, rot: 1.57 }]), { scene: 'разгромленная кухня, Артём весь в желтке' });
K([75.00, 'понимаешь'], face('A', 'thinking', 'kitchen', { so: { wrecked: true } }), { scene: 'понимаешь главное' });
K(80.00, ins('void', {}, [{ o: 'wand', x: 0, y: 300, s: 2.6 }, { o: 'cross', x: 0, y: 300, s: 1.8, k: [[0.4, 0], [0.8, 1]] }], { blur: 0 }), { scene: 'не волшебная палочка', sfx: sfx([0.5, 'buzz', -12]) });
K(82.10, st('kitchen', {}, MED(-40, 170), [A(-300, { p: 'point', e: 'awe', f: 1 })], [], { ghost: { at: 0.2, path: [[0, [-200, 260]], [1.3, [260, 200]]] } }), { scene: 'это как новая рука', sfx: sfx([0.2, 'shimmer', -12]) });
K(83.82, st('kitchen', {}, MED(-40, 170), [A(-300, { p: 'point', e: 'confused', f: 1 })], [], { ghost: { at: 0, path: [[0, [260, 200]], [1.2, [200, 220]]], baby: true, wob: 50 } }), { scene: 'только рука младенца' });
K(85.26, st('kitchen', {}, WIDE(0, 40), [A(-150, { p: [[0, 'point'], [1.6, 'handsOnHead']], e: 'scared', f: 1 })], [{ o: 'mug', x: 120, y: 134, sh: 6, pw: true }, { o: 'pan', x: 520, y: 150, sh: 8, pw: true }, { o: 'egg', x: -60, y: 134, sh: 5 }], { ghost: { at: 0, path: [[0, [100, 300]], [1, [500, 260]], [2, [-100, 400]], [3.4, [300, 200]]], wob: 90 }, cam: { z: [1.02, 1.08], x: [0, -20], y: 40, sh: 3 } }), { scene: 'сильная, но неуправляемая', sfx: sfx([0.4, 'hit', -14], [1.6, 'hit', -14]) });
K(88.78, face('A', 'determined', 'kitchen', {}), { bars: 'scope', scene: 'пока не научишься — опасен' });
K(91.72, st('kitchen', {}, CLOSE(-200, 70, [2.1, 2.2]), [A(-150, { p: 'sit', e: 'worried', f: 1, look: [-0.6, -0.4] })], [{ o: 'cabinet', x: -330, y: 240, s: 1.6, back: true }, { o: 'knife', x: -230, y: 300, s: 1.8, rot: 3.1 }]), { scene: 'прежде всего, для себя' });

// ================= СПОР С ЛЁХОЙ =================
K(94.22, st('living', {}, WIDE(80, 40), [A(-200, { p: 'stand', e: 'smirk', f: 1 }), L(700, { walk: { to: 220, at: 0, dur: 1.4 }, p: [[0, 'stand'], [1.5, 'wave']], e: 'happy', f: -1 })], [], { so: { doorOpen: [[0, 0.9], [1.6, 0]] } }), { in: { type: 'dip', dur: 0.5 }, scene: 'Лёха приходит в гости', amb: amb.roomtone, sfx: sfx([0.3, 'footstep', -16], [0.8, 'footstep', -16]) });
K(96.26, face('A', 'smirk', 'living', { fx: -80, look: [0.7, 0] }), { scene: 'сначала проверить' });
K(97.42, st('living', {}, MED(0, 170), [A(-160, { p: [[0, 'talk'], [1.4, 'point']], e: 'smirk', f: 1 }), L(160, { p: 'crossArms', e: 'smirk', f: -1 })]), { scene: 'предлагаешь спор: кто больше отожмётся' });
K(100.88, ins('kitchen', { mood: 'interiorWarm' }, [{ o: 'dishes', x: 0, y: 140, s: 2.4 }], { blur: 6, cam: { z: [1.4, 1.45], x: [0, 0], y: 160 }, badge: { str: '7 ДНЕЙ', at: 0.4 } }), { scene: 'проигравший неделю моет посуду', sfx: sfx([0.4, 'pop', -12]) });
K(103.08, st('living', { sofa: false }, MED(80, 230, [1.4, 1.5]), [L(40, { pushup: { rate: 2.6 }, e: 'happy' }), A(-380, { p: 'crossArms', e: 'worried' })]), { scene: 'Лёха отжимается лучше', sfx: sfx([0.3, 'footstep', -20], [0.7, 'footstep', -20], [1.1, 'footstep', -20]) });
K(105.58, face('L', 'smirk', 'living', { fx: 60 }), { scene: 'Лёха соглашается не раздумывая' });
K(108.10, st('living', { sofa: false }, MED(40, 240, [1.4, 1.45]), [L(40, { pushup: { rate: 3, until: 1.4 }, p: [[0, 'plankUp'], [1.5, 'plankDown']], e: [[0, 'determined'], [1.4, 'sad']] })], [], { timer: { from: 25, to: 40, t0: 0, t1: 1.4, suf: '' } }), { scene: 'Лёха делает 40 и падает', sfx: sfx([1.5, 'hit', -10]) });
K(110.52, st('living', { sofa: false }, MED(-80, 240, [1.4, 1.45]), [A(-120, { pushup: { rate: 3.2 }, e: 'smirk' }), L(320, { lie: 1, e: 'sad' })], [], { timer: { from: 41, to: 80, t0: 0, t1: 3.4 } }), { scene: 'ты — 50, 60, 80', sfx: sfx([0, 'counter', -14]) });
K(114.46, face('L', [[0, 'neutral'], [0.4, 'confused']], 'living', { fx: 80, look: [-0.6, 0.4] }), { scene: 'на 90-м Лёха щурится', read: { value: '90', at: 0 } });
K(116.36, st('living', { sofa: false }, MED(80, 200), [A(-120, { pushup: { rate: 3 }, y: 30, fl: fl(0, 30, { dur: 0.1, bob: false }), e: 'smirk' }), L(260, { p: [[0, 'sitFloor'], [0.5, 'stand'], [1.0, 'crossArms']], e: 'confused', f: -1 })], [], { read: { value: '100', at: 0 } }), { scene: 'на 100-м Лёха встаёт', sfx: sfx([0.1, 'ding', -10]) });
K(118.16, face('L', 'confused', 'living', { talk: [0, 2.1], fx: 60 }), { scene: '«Тём, у тебя руки не сгибаются»' });
K(120.44, st('living', { sofa: false }, CLOSE(-120, 270, [2.1, 2.2]), [A(-140, { p: 'plankUp', y: 36, fl: fl(0, 36, { dur: 0.1 }), e: 'nervous' })], [], { dim: { x1: -40, y1: 2, x2: -40, y2: 36, str: 'НАД ПОЛОМ', at: 0.5 } }), { scene: 'руки не касаются пола — качаешься над полом' });
K(123.08, st('living', { sofa: false }, MED(-100, 220), [A(-140, { p: 'plankUp', y: 40, fl: fl(0, 40, { dur: 0.1 }), e: 'smirk', eyes: [[0, 1]] }), L(240, { p: 'pointUp', e: 'shocked', f: -1 })]), { scene: 'приподнимал себя силой мысли', sfx: sfx([0.2, 'shimmer', -14]) });
K(126.06, st('living', {}, MED(-20, 180), [A(-160, { e: 'smile', f: 1, p: [[0, 'sit'], [0.5, 'explain']] }), L(160, { p: 'sit', e: 'surprised', f: -1 })]), { scene: 'рассказываешь всё Лёхе на диване' });
K(128.68, st('living', {}, WIDE(0, 40), [A(-500, { p: 'sit', e: 'nervous' }), L(-200, { walk: { to: 500, at: 0, dur: 2.6 }, p: 'handsOnHead', e: 'shocked', say: { str: '#@!*%', at: 0.6, until: 3 } })]), { scene: 'Лёха ходит по комнате и повторяет одно слово', sfx: sfx([0.6, 'buzz', -12], [1.8, 'buzz', -12]) });
K([128.68, 'которое'], face('L', 'shocked', 'living', { talk: [0, 2.0], objs: [{ o: 'bubble', x: 420, y: 360, s: 1.4, label: '#@!*%', w: 240, h: 100 }] }), { scene: 'слово, которое мы не скажем', sfx: sfx([0.1, 'buzz', -10]) });
K(134.40, face('L', [[0, 'thinking'], [1.2, 'smirk']], 'living', { talk: [1.2, 3.6], fx: 40 }), { scene: '«Посуду мою я, но с одним условием»' });
K(138.14, st('living', {}, MED(0, 170), [A(-160, { p: 'stand', e: 'neutral', f: 1 }), L(160, { p: 'point', e: 'happy', f: -1, talk: [0, 2.0] })]), { scene: '«Ты меня научишь хоть чему-нибудь»' });
K(140.78, face('A', 'confused', 'living', { talk: [0, 1.6], fx: -60 }), { scene: '«Чему? Это не учится»' });
K(142.66, face('L', 'happy', 'living', { talk: [0, 2.3], fx: 60 }), { scene: '«Тогда хоть поднимешь меня. Один раз»' });
K(145.78, st('living', {}, WIDE(0, -60, [1.0, 1.06]), [A(-260, { p: 'pointUp', e: 'determined', f: 1, eyes: [[0, 1]] }), L(140, { p: 'cheer', e: 'joy', fl: fl(0, 420, { dur: 1.2 }), f: -1 })], [], { pw: { at: 0.2, to: [140, 600] } }), { scene: 'Лёха висит под потолком и орёт от восторга', sfx: sfx([0.1, 'whoosh', -10], [0.8, 'cheer', -16]) });
K(149.08, st('kitchen', { mood: 'night', fridgeOpen: 1, fridgeEmpty: true }, WIDE(-300, 60), [A(-420, { p: 'holdFront', e: 'happy', f: -1 })], [{ o: 'dishes', x: 120, y: 134, s: 0.8 }, { o: 'pizza', attach: 0 }]), { scene: 'съедаешь всё из холодильника', amb: amb.roomtone });
K(152.20, face('A', 'sad', 'kitchen', { so: { mood: 'night' } }), { scene: 'и всё равно голоден' });
K(153.62, face('A', 'nervous', 'kitchen', { so: { mood: 'night' }, ringsOn: '#ff8a7a', sh: 3 }), { scene: 'голова раскалывается', sfx: sfx([0.1, 'heartbeat', -10]) });

// ================= НАУКА: МОЗГ И ЭНЕРГИЯ =================
K(156.20, bp('brain', { lbl: 1.3 }), { in: { type: 'zoom', dur: 0.4 }, scene: 'схема: мозг — самый прожорливый орган', sfx: sfx([1.3, 'pop', -12]) });
K(160.52, bp('mass', { split: 3.6 }), { scene: '2% массы тела, но пятая часть энергии', sfx: sfx([0.3, 'counter', -16], [3.8, 'counter', -16]) });
K(168.44, st('living', {}, WIDE(-60, 40), [A(-60, { lie: 1, y: 70, e: 'sleepy' })], [], { so: { tv: true } }), { scene: 'лежишь на диване' });
K([168.44, 'твой'], st('living', {}, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'determined', eyes: [[0, 1]] })], [{ o: 'book', path: [[0, [300, 0]], [1.4, [300, 260]]], pw: true }, { o: 'cup', path: [[0, [-400, 0]], [1.6, [-380, 300]]], pw: true }], { read: { label: 'ЭНЕРГИЯ', value: '↓', at: 1.2, color: '#ff6f61' } }), { scene: 'а мозг ещё и поднимает предметы — это работа' });
K(175.52, st('kitchen', { mood: 'night' }, MED(40, 180), [A(-150, { p: [[0, 'sit'], [0.4, 'think']], e: 'happy' })], [{ o: 'stool', x: -160, back: true }, { o: 'dishes', x: 120, y: 134, s: 0.8 }, { o: 'pizza', x: 40, y: 134 }]), { scene: 'организм требует платить — едой' });

// ================= ТРЕНИРОВКИ =================
K(178.46, st('living', { night: true }, WIDE(0, 40), [A(-100, { p: 'sitFloor', e: 'determined' })], [{ o: 'ball', path: [[0, [140, 0]], [1.0, [140, 120]], [2, [140, 100]]], pw: [0.3] }], { badge: { str: [[0, 'ДЕНЬ 1'], [1.0, 'ДЕНЬ 2'], [1.6, 'ДЕНЬ 3'], [2.2, 'ДЕНЬ 4']], at: 0 } }), { in: { type: 'dip', dur: 0.5 }, scene: 'две недели тренировок, каждый день', amb: amb.roomtone });
K(181.66, ins('living', { night: true }, [{ o: 'ball', x: 0, y: 260, s: 3, pw: true, ph: 36, pr: 50, bob: 8 }], { blur: 10 }), { scene: 'сначала теннисный мячик' });
K(183.60, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'determined', eyes: [[0, 1]] })], [{ o: 'ball', path: [[0, [120, 0]], [0.7, [120, 160]], [1.6, [120, 160]], [2.4, [120, 2]]], pw: [0, 2.4] }], { pw: { at: 0, obj: 0, until: 2.4 } }), { scene: 'поднять, удержать, опустить' });
K(186.68, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'determined', eyes: [[0, 1]] })], [0, 1, 2].map((i) => ({ o: 'ball', color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i], when: [i === 2 ? 1.6 : 0, 9], path: [[0, [120 + i * 20, 160]], [3.6, [120 + i * 20, 160]]], pw: true, bob: 0, sh: 0 })).map((b, i) => ({ ...b, path: undefined, x: 120, y: 200, orbit: i })), { juggle: { cx: 120, cy: 200, r: 60 } }), { scene: 'два мячика, потом три — по кругу, как жонглёр', sfx: sfx([1.6, 'pop', -14]) });
K(190.52, line('И ТУТ ЕСТЬ НАУКА', 'lab', {}), { in: { type: 'zoom', dur: 0.4 }, scene: 'переход к науке' });
K(192.58, st('lab', {}, WIDE(0, 30), [SC(-500, { p: 'holdFront', prop: 'paper', e: 'thinking' }), X(-100, { p: 'cheer', e: 'happy' }), X(250, { p: 'cheer', e: 'neutral' }), X(560, { p: 'cheer', e: 'smile' })], [[-100, 0], [250, 1], [560, 2]].flatMap(([x, k]) => [0, 1, 2].map((i) => ({ o: 'ball', x, y: 300, orbit: i, color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i] })))), { scene: 'учёные учат людей жонглировать', amb: amb.roomtone });
K([192.58, 'смотрели'], st('lab', {}, MED(80, 200), [SC(-260, { p: 'point', e: 'thinking' })], [{ o: 'mri', x: 220, y: 0, s: 1.3 }, { o: 'monitor', x: -500, y: 0, s: 1.2 }]), { scene: 'смотрят на мозг томографом', sfx: sfx([0.2, 'hum', -18, { dur: 2 }]) });
K(198.80, bp('juggle', { reg: [[0, 0.35], [1.5, 0.35], [4.5, 0.75]], lbl: 'ВОСПРИЯТИЕ ДВИЖЕНИЯ', lblAt: 2.4, arrow: 'up' }), { scene: 'через три месяца участки мозга выросли', sfx: sfx([2.4, 'pop', -12]) , badge: true });
K(205.40, bp('juggle', { solo: true, reg: [[0, 0.75], [1.6, 1.0]], lbl: 'МОЗГ ВЫРОС ПОД НАВЫК', lblAt: 0.3, arrow: 'up' }), { scene: 'мозг вырос под новый навык', sfx: sfx([0.3, 'ding', -12]) });
K(208.26, st('lab', {}, WIDE(0, 30), [X(-300, { p: 'sit', e: 'sleepy' }), X(100, { p: 'sit', e: 'neutral' }), X(460, { p: 'phone', prop: 'phone', e: 'neutral' })], [{ o: 'stool', x: -310, back: true }, { o: 'stool', x: 90, back: true }, { o: 'ball', x: -150, y: 0 }, { o: 'ball', x: 200, y: 0, color: '#ff8a5a' }, { o: 'ball', x: 300, y: 0, color: '#8fd3ff' }], { badge: { str: '3 МЕСЯЦА', at: 0.3 } }), { scene: 'три месяца не жонглировали' });
K(210.78, bp('juggle', { solo: true, reg: [[0, 1.0], [1.6, 0.35]], lbl: 'УЧАСТКИ УМЕНЬШИЛИСЬ', lblAt: 0.4, arrow: 'down' }), { scene: 'участки снова уменьшились', sfx: sfx([0.4, 'buzz', -14]) });
K(212.98, line(['ЗАПОМНИ ЭТО.'], 'lab', {}), { scene: 'запомни это', sfx: sfx([0.1, 'stinger', -10]) });
K(215.70, ins('living', { night: true }, [{ o: 'glass', x: -200, y: 180, s: 2.4, level: [[0, 0.9], [3.6, 0.1]], pw: true, rot: 0.7 }, { o: 'glass', x: 200, y: 120, s: 2.4, level: [[0, 0.05], [3.6, 0.85]] }], { blur: 10, badge: { str: 'ДЕНЬ 14', at: 0.3 }, stream: { x1: -150, y1: 270, x2: 200, y2: 230 } }), { scene: 'переливаешь воду из стакана в стакан, ни капли', sfx: sfx([0.3, 'shimmer', -16]) });
K(220.50, ins('living', { night: true }, [{ o: 'sneaker', x: 0, y: 160, s: 2.6, k: [[0, 0.1], [1.6, 1]], pw: true, ph: 50, pr: 120 }], { blur: 10 }), { scene: 'шнурки завязываются сами' });
K(222.92, st('living', { night: true }, WIDE(0, 40), [A(-640, { p: 'point', e: 'determined', eyes: [[0, 1]] })], [{ o: 'needle', x: 560, y: 260, s: 1.6, pw: true, ph: 0, pr: 50 }], { thread: { x1: 360, y1: 230, x2: 540, y2: 270, at: 0.5, dur: 2 }, pw: { at: 0.3, to: [560, 260] } }), { scene: 'вдеваешь нитку в иголку с другого конца комнаты' });
K(225.96, st('yard', { mood: 'dusk' }, WIDE(-160, 30), [A(-640, { p: 'strain', e: 'determined', eyes: [[0, 1]] })], [{ o: 'car', path: [[0, [-100, 0]], [1.2, [-100, 0]], [2.4, [-100, 38]]], s: 1.0, color: '#8a9bb0', pw: [1.0], ph: 50, pr: 220 }], { pw: { at: 0.9, obj: 0 }, dim: { x1: 140, y1: 0, x2: 140, y2: 38, str: 'ЛАДОНЬ', at: 2.6 } }), { scene: 'поднимаешь машину на ладонь от земли', amb: amb.city, sfx: sfx([1.0, 'riser', -12]) });
K(230.70, st('yard', { mood: 'dusk' }, MED(-200, 200), [A(-560, { p: 'strain', e: 'determined', jit: 2 })], [{ o: 'car', x: -100, y: 38, s: 1.0, color: '#8a9bb0', pw: true, ph: 50, pr: 220, sh: 2 }], { timer: { from: 0, to: 3, t0: 0, t1: 1.4, suf: ' С', ease: false } }), { scene: 'ровно на три секунды', sfx: sfx([0.2, 'tick', -12], [0.7, 'tick', -12], [1.2, 'tick', -12]) });
K(232.48, face('A', 'sad', 'yard', { so: { mood: 'dusk' }, blood: 0.2, ringsOn: '#ff8a7a' }), { scene: 'кровь носом, голова болит до утра', sfx: sfx([0.2, 'heartbeat', -10]) });
K(236.36, line('МАШИНА — ЭТО ПРЕДЕЛ.', 'yard', { so: { mood: 'dusk', car: true }, colors: ['red'] }), { scene: 'машина — предел' });

// ================= ГОРШОК С ГЕРАНЬЮ =================
K(238.02, st('yard', {}, WIDE(0, -80, [0.95, 1.0]), [A(-700, { walk: { to: -300, at: 0, dur: 2.8 }, e: 'neutral', f: 1 })]), { in: { type: 'dip', dur: 0.5 }, scene: 'двор, через пару дней', amb: amb.city });
K(241.12, st('yard', {}, MED(-180, 170), [A(-300, { walk: { to: -120, at: 0, dur: 1.4 }, p: [[0, 'stand'], [1.5, 'stand']], e: [[0, 'neutral'], [1.8, 'surprised']], look: [[1.6, [0.4, -1]]] })]), { scene: 'идёшь через двор и слышишь сверху' });
K(243.76, st('yard', {}, WIDE(315, -420, [1.25, 1.25]), [B(315, { y: 650, p: 'shrug', e: 'shocked', say: { str: 'ОЙ!', at: 0, until: 1.0, dx: 120, dy: 60, w: 160 } })], [{ o: 'pot', path: [[0, [360, 660]], [0.4, [380, 660]]], s: 1.0 }]), { scene: '«Ой!» — бабушка на балконе 5-го этажа', sfx: sfx([0.05, 'pop', -10]) });
K([243.76, 'с'], st('yard', {}, WIDE(250, -260, [0.82, 0.84]), [B(315, { y: 650, p: 'reach', e: 'shocked' }), X(300, { p: 'phone', prop: 'phone', e: 'neutral', f: -1 })], [{ o: 'pot', path: [[0, [380, 660]], [3.3, [320, 470]]], ease: 'in', spin: 1.2 }], { read: { value: '5 ЭТАЖ', at: 0.2 } }), { scene: 'падает горшок с геранью', sfx: sfx([0, 'whoosh', -10]) });
K(247.62, st('yard', {}, WIDE(250, -40, [1.05, 1.12]), [X(300, { p: 'phone', prop: 'phone', e: 'neutral', f: -1 })], [{ o: 'pot', path: [[0, [320, 700]], [3.4, [310, 440]]], ease: 'in', spin: 1.5 }]), { scene: 'прямо на мужчину у подъезда с телефоном', sfx: sfx([0, 'riser', -12]) });
K(251.80, face('A', 'determined', 'yard', { eyesGlow: [[0.6, 1]], look: [0.5, -0.8], zoom: 0.12 }), { scene: 'не успеваешь подумать — просто смотришь', bars: 'scope', sfx: sfx([0.6, 'shimmer', -8]) });
K([251.80, 'горшок'], st('yard', {}, MED(300, 60, [1.5, 1.6]), [X(300, { p: 'phone', prop: 'phone', e: 'neutral', f: -1 })], [{ o: 'pot', x: 310, y: 420, pw: true, ph: 40, pr: 80, bob: 3 }], { freeze: true, dim: { x1: 400, y1: 300, x2: 400, y2: 420, str: '1 М', at: 0.6 } }), { in: { type: 'flash', dur: 0.35 }, bars: 'scope', scene: 'СТОП-КАДР: горшок замер в метре над головой', sfx: sfx([0, 'freeze', -5]) });
K(257.98, st('yard', {}, MED(250, 60), [X(300, { p: 'phone', prop: 'phone', e: 'smile', f: -1 })], [{ o: 'pot', x: 310, y: 420, pw: true, ph: 40, pr: 80, bob: 4 }]), { scene: 'мужчина ничего не замечает', sfx: sfx([0.4, 'phonebuzz', -18]) });
K(259.98, st('yard', {}, WIDE(300, -300, [0.85, 0.87]), [B(315, { y: 650, p: 'reach', e: 'surprised' }), A(-500, { p: 'pointUp', e: 'determined', eyes: [[0, 1]] })], [{ o: 'pot', path: [[0, [310, 420]], [4.5, [350, 660]]], ease: 'inOut', pw: true, bob: 6 }]), { scene: 'горшок плывёт обратно наверх', sfx: sfx([0.2, 'shimmer', -14]) });
K([259.98, 'прямо'], st('yard', {}, MED(330, -380, [1.6, 1.7]), [B(315, { y: 650, p: [[0, 'reach'], [1.3, 'holdFront']], e: 'shocked' })], [{ o: 'pot', path: [[0, [380, 700]], [1.3, [345, 680]]], pw: [0, 1.4] }, { o: 'pot', attach: 0, when: [1.3, 9] }].slice(0, 1)), { scene: 'прямо в руки ошарашенной бабушки' });
K(267.72, face('B', 'shocked', 'yard', { tilt: [[0, 0], [0.3, 0.06], [0.6, -0.06], [0.9, 0]] }), { scene: 'бабушка крестится' });
K(269.08, st('yard', {}, WIDE(200, 30), [X(300, { walk: { to: 900, at: 0.3, dur: 2.6 }, p: 'phone', prop: 'phone', e: 'smile', f: 1 }), A(-450, { p: 'stand', e: 'confused', f: 1 })]), { scene: 'мужчина уходит, не отрываясь от телефона' });
K(272.14, st('yard', { mood: 'golden' }, MED(-200, 170), [A(-200, { p: 'holdFront', e: 'worried', jit: 1.5 })]), { scene: 'стоишь посреди двора, трясутся руки' });
K(275.84, face('A', 'worried', 'yard', { sh: 1.5 }), { scene: 'не от усилия' });
K([277.02, 'горшок'], ins('yard', {}, [{ o: 'pot', path: [[0, [0, 500]], [0.5, [0, 120]]], ease: 'in', s: 2.2, when: [0, 0.5] }, { o: 'splat', x: 0, y: 110, s: 2.0, dirt: true, when: [0.5, 9] }], { tint: 'dream', cam: { z: [1.3, 1.3], x: [0, 0], y: 0, sh: [[0.5, 10], [0.9, 0]] } }), { scene: 'горшок разлетелся бы перед глазами', sfx: sfx([0.5, 'impact', -6]) });
K(282.02, ins('yard', {}, [{ o: 'pot', path: [[0, [-500, 500]], [1.0, [300, 640]]], s: 1.6, spin: 4, when: [0, 1.0] }], { tint: 'dream', blur: 0, cam: { z: [1.4, 1.42], x: [100, 100], y: -400, sh: [[1.0, 8], [1.4, 0]] }, spots: false }), { scene: 'или улетел бы в соседнее окно', sfx: sfx([1.0, 'glitch', -8]) });

// ================= ДВОРОВЫЙ ФУТБОЛ =================
K(285.42, st('field', {}, WIDE(0, 20), [A(-600, { walk: { to: -150, at: 0, dur: 2.6 }, e: 'happy', prop: 'ball' }), L(-760, { walk: { to: -330, at: 0, dur: 2.6 }, e: 'smile' })]), { in: { type: 'dip', dur: 0.5 }, scene: 'вечером на дворовое поле', amb: amb.wind });
K(288.42, st('field', {}, WIDE(300, 30), [L(560, { p: [[0, 'ready'], [1.6, 'dive']], rot: 0, e: [[0, 'determined'], [1.6, 'shocked']], f: -1 }), A(-500, { p: [[0, 'stand'], [0.6, 'kick'], [1.0, 'stand']], e: 'smirk', eyes: [[0.8, 1]] })], [{ o: 'soccer', path: [[0, [-420, 0]], [0.7, [-420, 0]], [1.4, [100, 200]], [2.2, [420, 60]], [2.6, [560, 80]]], spin: 8, pw: [0.8] }]), { scene: 'Лёха на воротах не может взять ни одного мяча', sfx: sfx([0.7, 'kick', -8], [2.4, 'whistle', -18]) });
K(292.18, st('field', {}, WIDE(0, 30), [L(560, { p: 'ready', e: 'confused', f: -1 })], [{ o: 'soccer', path: [[0, [-700, 60]], [0.8, [-400, 260]], [1.6, [-100, 80]], [2.4, [150, 280]], [3.2, [420, 90]], [3.9, [620, 120]]], spin: 8, pw: true }], { trail: true }), { scene: 'мячи летят по дуге, змейкой', sfx: sfx([0.2, 'whoosh', -12], [1.6, 'whoosh', -12]) });
K(296.18, st('field', {}, MED(450, 170, [1.3, 1.35]), [L(500, { p: 'ready', e: 'confused', f: [[0, -1], [1.1, 1], [2.0, -1], [3.0, 1]] })], [{ o: 'soccer', path: [[0, [0, 120]], [0.8, [380, 160]], [1.4, [620, 160]], [2.0, [500, 200]], [2.6, [380, 140]], [3.3, [640, 90]], [3.8, [700, 80]]], spin: 9, pw: true }]), { scene: 'мяч облетает Лёху по кругу и залетает в ворота', sfx: sfx([3.4, 'hit', -10], [3.5, 'cheer', -20]) });
K(301.06, face('L', 'angry', 'field', { talk: [0, 1.4] }), { scene: '«Это нечестно!» — орёт Лёха' });
K(303.34, face('A', 'smirk', 'field', { talk: [0, 1.0], fx: -40 }), { scene: '«Это наука», — говоришь ты' });
K(305.30, line('И ОТЧАСТИ ТЫ ПРАВ', 'field', {}), { in: { type: 'zoom', dur: 0.4 }, scene: 'и отчасти ты прав' });
K(307.14, bp('arc'), { scene: 'мяч и без телекинеза умеет летать по дуге', sfx: sfx([0.2, 'kick', -10]) });
K(310.32, bp('magnus', { stage: 1 }), { scene: 'одна сторона навстречу воздуху, другая — по ходу' });
K(315.78, bp('magnus', { stage: 2 }), { scene: 'давление больше/меньше — мяч уводит вбок', sfx: sfx([0.2, 'pop', -12], [1.4, 'pop', -12], [2.6, 'swish', -10]) });
K(321.92, line('ЭФФЕКТ МАГНУСА', 'field', {}), { scene: 'эффект Магнуса', sfx: sfx([0.1, 'stinger', -10]) });
K(324.50, st('field', { mood: 'night' }, WIDE(200, 30), [F(-400, { p: [[0, 'ready'], [0.5, 'kick'], [0.9, 'stand']], e: 'determined' }), X(100, { p: 'crossArms' }), X(150, { p: 'crossArms' }), X(200, { p: 'crossArms' })], [{ o: 'soccer', path: [[0, [-330, 0]], [0.5, [-330, 0]], [1.6, [150, 360]], [2.6, [560, 140]]], spin: 10 }]), { scene: 'штрафной: мяч падает «сухим листом»', sfx: sfx([0.5, 'kick', -8]) });
K([324.50, 'мячи'], st('field', { mood: 'night' }, WIDE(250, 30), [X(100, { p: 'crossArms' }), X(160, { p: 'crossArms' }), X(220, { p: 'crossArms' })], [{ o: 'soccer', path: [[0, [-500, 60]], [0.8, [0, 160]], [1.4, [160, 60]], [2.0, [400, 100]], [2.6, [600, 120]]], spin: 10, trailDots: true }]), { scene: 'мяч огибает стенку', sfx: sfx([2.5, 'cheer', -16]) });
K(330.66, st('field', { mood: 'night' }, MED(-200, 180), [F(-200, { p: 'kick', e: 'determined' })], [], { badge: { str: 'ГОДЫ ТРЕНИРОВОК', at: 0.3 } }), { scene: 'футболистам нужны годы тренировок' });
K([330.66, 'тебе'], face('A', 'smirk', 'field', { eyesGlow: [[0.2, 1]] }), { scene: 'а тебе — один взгляд', sfx: sfx([0.2, 'shimmer', -12]) });
K(335.20, st('field', {}, MED(450, 170, [1.3, 1.35]), [L(480, { p: 'ready', e: 'angry', f: -1 })], [{ o: 'soccer', path: [[0, [-200, 140]], [1.0, [300, 260]], [1.8, [560, 90]], [2.2, [640, 80]]], spin: 9, pw: true }], { badge: { str: '3 : 0', at: 2.0 } }), { scene: 'третий гол змейкой', sfx: sfx([2.0, 'hit', -10]) });
K([335.20, 'леха'], st('field', {}, MED(200, 180), [L(0, { p: 'point', e: 'angry', f: 1 })], [{ o: 'sign', x: 360, y: 0, s: 1.4, label: 'ТЕЛЕКИНЕЗ\nЗАПРЕЩЁН', w: 260, h: 120 }]), { scene: 'Лёха объявляет: телекинез в дворовом футболе запрещён' });
K(341.28, face('L', 'determined', 'field', {}), { scene: 'навсегда' });
K(342.16, ins('field', {}, [{ o: 'stamp', x: 0, y: 420, s: 1.0, label: 'ОКОНЧАТЕЛЬНО' }], { blur: 12, cam: { z: [1.2, 1.0], x: [0, 0], y: 0, sh: [[0, 10], [0.4, 0]] } }), { scene: 'решение окончательное и обжалованию не подлежит', sfx: sfx([0, 'impact', -6]) });

// ================= ПЕРЕЕЗД =================
K(346.30, st('tower', { hi: 9 }, WIDE(0, -150, [0.9, 0.95]), [L(-120, { p: 'holdFront', e: 'happy' }), A(140, { p: 'stand', e: 'smile', f: -1 })], [{ o: 'box', x: -360, y: 0 }, { o: 'box', x: -470, y: 0, w: 70, h: 60 }]), { in: { type: 'dip', dur: 0.5 }, scene: 'через неделю Лёха переезжает', amb: amb.city });
K(348.38, st('tower', { hi: 9 }, WIDE(0, -650, [0.85, 0.88]), [], [], { call: { p: [-115, 1275], to: [420, 1150], str: '9 ЭТАЖ', at: 0.3 } }), { scene: 'новая квартира на девятом этаже', sfx: sfx([0.3, 'pop', -12]) });
K(350.52, ins('stairwell', {}, [{ o: 'elevator', x: 0, y: 0, s: 1.6, label: 'НЕ РАБОТАЕТ' }], { blur: 6, cam: { z: [1.2, 1.25], x: [0, 0], y: 60 } }), { scene: 'лифт сломан', sfx: sfx([0.1, 'buzz', -12]) });
K(352.00, st('stairwell', {}, WIDE(0, -40), [A(-260, { y: 132, p: 'carry', e: 'nervous', jit: 1 }), L(-60, { y: 242, p: 'carry', e: 'sad', jit: 1 })], [{ o: 'sofa', x: -150, y: 250, s: 0.8, rot: -0.5 }], { tint: 'dream', badge: { str: '3 ДНЯ МУЧЕНИЙ', at: 0.5 } }), { scene: 'раньше — три дня мучений и сорванные спины' });
K(357.36, st('stairwell', {}, WIDE(100, -100), [], [{ o: 'fridge', path: [[0, [-300, 140]], [2.8, [200, 420]]], ease: 'linear', s: 0.9, pw: true, ph: 110, pr: 140, bob: 4 }]), { scene: 'по лестнице сам плывёт холодильник', sfx: sfx([0.2, 'shimmer', -14]) });
K(360.26, st('stairwell', {}, WIDE(100, -100), [], [{ o: 'sofa', path: [[0, [-500, 60]], [3.0, [0, 330]]], ease: 'linear', s: 0.7, rot: -0.45, pw: true, ph: 60, pr: 150, bob: 4 }, { o: 'washer', path: [[0, [-800, -100]], [3.0, [-400, 120]]], ease: 'linear', s: 0.9, pw: true, ph: 60, pr: 80, bob: 4 }]), { scene: 'за ним диван, за диваном — стиральная машина' });
K(363.36, st('stairwell', {}, MED(-150, 80), [L(-380, { y: 66, walk: { to: -180, at: 0, dur: 2.8 }, e: 'happy' }), A(-560, { y: -0, walk: { to: -340, at: 0, dur: 2.8 }, e: 'smirk', eyes: [[0, 1]] })], [{ o: 'pizza', attach: 0, ay: -4 }]), { scene: 'вы с Лёхой идёте сзади с пиццей' });
K(366.38, st('stairwell', { door5: true, door5Open: [[0, 0], [0.8, 0.8]] }, WIDE(300, 40), [N(620, { walk: { to: 460, at: 0.8, dur: 1.4 }, e: 'neutral', f: -1 })], [{ o: 'bag', attach: 0, color: '#2a2a33', ay: 30 }], { badge: { str: '5 ЭТАЖ', at: 0.2 } }), { scene: 'на пятом этаже выходит соседка с мусором' });
K(370.18, face('N', [[0, 'surprised'], [0.6, 'shocked']], 'stairwell', { objs: [{ o: 'fridge', x: -560, y: -150, s: 1.6, pw: true, ph: 110, pr: 140, bob: 6 }] }), { scene: 'видит холодильник, поднимающийся сам' });
K(373.80, st('stairwell', { door5: true, door5Open: [[0, 0.8], [1.8, 0.8], [2.4, 0]] }, WIDE(300, 40), [N(460, { walk: { to: 640, at: 0.3, dur: 1.4 }, e: 'shocked', f: 1 })]), { scene: 'молча заходит обратно' });
K([373.80, 'закрывает'], ins('stairwell', { door5: true, locks: 2 }, [], { blur: 0, cam: { z: [2.2, 2.25], x: [620, 620], y: 140 } }), { scene: 'закрывает дверь на два замка', sfx: sfx([0.2, 'tick', -6], [0.7, 'tick', -6]) });
K(379.36, st('emptyflat', {}, WIDE(0, 30), [A(-160, { p: 'sitFloor', e: 'smile', f: 1 }), L(160, { p: 'sitFloor', e: 'happy', f: -1 })], [{ o: 'pizza', x: 0, y: 0, s: 1.2 }]), { in: { type: 'dip', dur: 0.5 }, scene: 'вечер, пустая квартира, остывшая пицца', amb: amb.roomtone });
K(385.02, face('L', 'smile', 'emptyflat', { talk: [1.6, 5.8], fx: 40 }), { scene: '«Знаешь, раньше я бы тебя позвал…»' });
K(390.88, st('emptyflat', {}, MED(0, 140), [A(-160, { p: 'sitFloor', e: 'smile', f: 1 }), L(160, { p: 'sitFloor', e: 'happy', f: -1, talk: [0, 1.6] })]), { scene: '«…а сейчас ты сам пришёл»' });
K(392.56, face('A', 'smile', 'emptyflat', { look: [0.3, 0.3] }), { scene: 'дело не в силе' });
K(395.76, st('emptyflat', {}, WIDE(0, 60, [1.05, 1.15]), [A(-160, { p: 'sitFloor', e: 'smile', f: 1 }), L(160, { p: 'sitFloor', e: 'happy', f: -1 })], [{ o: 'pizza', x: 0, y: 0, s: 1.2 }]), { scene: 'впервые было не тяжело помочь' });

// ================= БЫВАЕТ ЛИ ТЕЛЕКИНЕЗ =================
K(399.96, line(['А ТЕЛЕКИНЕЗ', 'БЫВАЕТ НА САМОМ ДЕЛЕ?'], 'tvstudio', { at: [0, 0.5], colors: ['cream', 'gold'] }), { in: { type: 'dip', dur: 0.5 }, scene: 'бывает ли телекинез на самом деле?', sfx: sfx([0.1, 'stinger', -10]) });
K(403.94, st('tvstudio', {}, WIDE(0, 30), [Y(-60, { p: 'explain', e: 'smirk' })], [{ o: 'spoon', x: 120, y: 134, s: 1.2 }]), { scene: 'люди утверждали, что двигают предметы мыслью', amb: amb.murmur });
K(408.30, ins('tvstudio', {}, [{ o: 'spoon', x: 0, y: 200, s: 3, bend: [[0, 0], [1.5, 1.1]] }], { blur: 10 }), { scene: 'гнули ложки на телешоу', sfx: sfx([0.4, 'applause', -18]) });
K([408.30, 'крутили'], ins('tvstudio', {}, [{ o: 'compass', x: 0, y: 150, s: 3, a: [[0, 0], [1.5, 5]] }], { blur: 10 }), { scene: 'крутили стрелки компасов' });
K(411.44, st('tvstudio', {}, MED(0, 170), [R(-100, { p: 'explain', e: 'smile' })], [], { call: { p: [-80, 260], to: [380, 420], str: 'ДЖЕЙМС РЭНДИ', at: 0.6, w: 420 } }), { scene: 'фокусник Джеймс Рэнди', sfx: sfx([0.6, 'pop', -12]) });
K([411.44, 'больше'], st('tvstudio', {}, MED(0, 170), [R(-100, { p: 'point', e: 'smirk' })], [], { read: { value: '50+ ЛЕТ', at: 0.3 } }), { scene: 'больше 50 лет' });
K([411.44, 'крупный'], ins('tvstudio', {}, [{ o: 'money', x: 0, y: 160, s: 2.4, open: 1 }], { blur: 10, read: { value: '$1 000 000', at: 0.5 } }), { scene: 'крупный денежный приз', sfx: sfx([0.5, 'ding', -10]) });
K([411.44, 'в'], st('tvstudio', {}, WIDE(0, 30), [Y(-60, { p: 'reach', e: 'determined' }), R(300, { p: 'crossArms', e: 'smirk', f: -1 })], [{ o: 'spoon', x: 120, y: 134, s: 1.2 }]), { scene: 'честная проверка' });
K(422.08, ins('tvstudio', {}, [{ o: 'money', x: 0, y: 160, s: 2.4 }], { blur: 10, read: { label: 'ЗАБРАЛИ:', value: '0', at: 0.4, color: '#ff6f61' } }), { scene: 'приз так никто и не забрал', sfx: sfx([0.4, 'buzz', -12]) });
K(425.12, st('hospital', {}, WIDE(0, 30), [], [{ o: 'wheelchair', x: -40, y: 0, s: 1.2 }], { figs2: true }), { in: { type: 'dip', dur: 0.5 }, scene: 'другая история, настоящая', amb: amb.hum });
K(428.08, st('hospital', {}, MED(-60, 170), [W(-60, { p: 'sit', e: 'sad' })], [{ o: 'wheelchair', x: -60, y: 0, s: 1.0, back: true }], { badge: { str: '15 ЛЕТ', at: 1.2 } }), { scene: 'после инсульта 15 лет не могла пошевелиться' });
K([428.08, 'силой'], st('hospital', {}, MED(60, 180), [W(-120, { p: 'sit', e: 'determined', eyes: [[0, 1]] })], [{ o: 'wheelchair', x: -120, y: 0, s: 1.0, back: true }, { o: 'tableK', x: 220, y: 0, s: 1.0, w: 220, back: true }, { o: 'robotArm', x: 220, y: 112, s: 1.2, a: [[0, 0], [2.0, 0.4]] }]), { scene: 'силой мысли управляла роботизированной рукой', sfx: sfx([0.3, 'hum', -18, { dur: 1.5 }]) });
K(435.98, st('hospital', {}, CLOSE(-20, 110, [1.9, 2.0]), [W(-120, { p: 'sit', e: [[0, 'determined'], [1.8, 'happy']] })], [{ o: 'wheelchair', x: -120, y: 0, s: 1.0, back: true }, { o: 'tableK', x: 220, y: 0, s: 1.0, w: 220, back: true }, { o: 'robotArm', x: 220, y: 112, s: 1.2, a: [[0, 0.4], [2.0, 1]], reachX: -170, reachY: -110 }, { o: 'cup', path: [[0, [130, 230]], [2.0, [10, 270]]], s: 0.8 }]), { scene: 'сама поднесла к губам кружку с кофе' });
K(438.70, face('W', 'cry', 'hospital', { badge: { str: 'ВПЕРВЫЕ ЗА 15 ЛЕТ', at: 0.2 } }), { scene: 'впервые за 15 лет', sfx: sfx([0.2, 'shimmer', -12]) });
K(440.68, bp('bci', { comp: 3.6 }), { in: { type: 'zoom', dur: 0.4 }, scene: 'датчик в мозге → сигналы → компьютер → робот', sfx: sfx([0.3, 'pop', -12], [3.6, 'pop', -12]) });
K(447.82, st('hospital', {}, WIDE(0, 30), [KG(-120, { p: 'sit', e: 'neutral', f: 1 })], [{ o: 'wheelchair', x: -120, y: 0, s: 1.0, back: true }, { o: 'tableK', x: 180, y: 0, s: 1.0, w: 240, back: true }, { o: 'monitor', x: 180, y: 112, s: 1.0, chess: true }], { read: { value: '2024', at: 0.2 } }), { scene: '2024 год: парень с параличом и имплантом', sfx: sfx([0.2, 'pop', -12]) });
K([447.82, 'играл'], ins('hospital', {}, [{ o: 'monitor', x: 0, y: 40, s: 3.4, chess: true, mv: [[0.3, 0], [2.6, 1]] }], { blur: 8 }), { scene: 'играл в шахматы на компьютере', sfx: sfx([2.6, 'blip', -10]) });
K([447.82, 'без'], face('K', 'determined', 'hospital', { eyesGlow: [[0.3, 0.6]] }), { scene: 'без рук — просто думая, куда двинуть курсор' });
K(459.66, line('ТЕЛЕКИНЕЗ УЖЕ СУЩЕСТВУЕТ', 'hospital', {}), { scene: 'так что телекинез уже существует', sfx: sfx([0.1, 'shimmer', -10]) });
K(462.50, st('tvstudio', {}, MED(0, 170), [Y(-60, { p: 'shrug', e: 'confused', alpha: 0.7 })], [], { tint: 'dark' }), { scene: 'не тем, кто хочет показать фокус' });
K([462.50, 'тем'], st('hospital', {}, MED(60, 180), [W(-120, { p: 'sit', e: 'happy' })], [{ o: 'wheelchair', x: -120, y: 0, s: 1.0, back: true }, { o: 'tableK', x: 220, y: 0, s: 1.0, w: 220, back: true }, { o: 'robotArm', x: 220, y: 112, s: 1.2, a: 0.6 }]), { scene: 'а тем, кому по-настоящему нужен' });

// ================= ДЖИП: СИЛА НА ЗЛОСТЬ =================
K(468.38, face('A', 'scared', 'road', { so: { mood: 'dusk' }, tint: 'dark' }), { in: { type: 'dip', dur: 0.5 }, scene: 'однажды ты пугаешься самого себя', sfx: sfx([0.1, 'heartbeat', -10]) });
K(472.08, st('road', { speed: 600 }, WIDE(0, 30), [], [{ o: 'car', x: -200, y: 0, s: 1.0, color: '#8a9bb0', driver: true, driverColor: '#ee7a2b', lights: true }]), { scene: 'едешь на своей машине', amb: amb.city, sfx: sfx([0.2, 'carpass', -14]) });
K([472.08, 'тебя'], st('road', { speed: 600 }, WIDE(0, 30), [], [{ o: 'car', x: -200, y: 0, s: 1.0, color: '#8a9bb0', driver: true, driverColor: '#ee7a2b' }, { o: 'car', path: [[0, [-1200, -40]], [1.2, [100, 10]], [1.8, [260, 10]]], ease: 'out', s: 1.0, jeep: true, driver: true }]), { scene: 'подрезает здоровенный джип', sfx: sfx([0.6, 'carpass', -8], [1.0, 'buzz', -12]) });
K(476.24, face('J', 'angry', 'road', { talk: [0.2, 4.5], fx: 80, objs: [{ o: 'bubble', x: -520, y: 420, s: 1.4, label: '#@!*%', w: 240, h: 100 }] }), { scene: 'водитель высовывается, орёт и машет кулаком', sfx: sfx([0.3, 'buzz', -12]) });
K(481.18, face('A', 'angry', 'road', { tint: 'red', ringsOn: '#ff6f61', sh: 2 }), { scene: 'ты просто злишься' });
K(483.94, st('road', { light: 'red', speed: 0 }, WIDE(150, 40), [], [{ o: 'car', x: 200, y: 0, s: 1.0, jeep: true, driver: true, sh: [[0, 0], [0.6, 8]], pw: [0.5], ph: 80, pr: 260 }, { o: 'car', x: -360, y: 0, s: 1.0, color: '#8a9bb0', driver: true, driverColor: '#ee7a2b' }]), { scene: 'джип на светофоре трясётся — сам', sfx: sfx([0.6, 'glitch', -10], [1.6, 'hit', -14]) });
K(487.80, ins('road', { light: 'red' }, [{ o: 'mirror', path: [[0, [200, 220]], [0.4, [200, 220]], [1.2, [240, 8]]], ease: 'in', s: 3, rotKey: [[0.4, 0], [1.2, 2]] }], { blur: 10, cam: { z: [1, 1], x: [0, 0], y: 0, sh: [[1.2, 10], [1.6, 0]] } }), { scene: 'зеркало отламывается и падает', sfx: sfx([0.4, 'hit', -10], [1.2, 'impact', -8]) });
K(490.16, st('road', { light: 'red' }, WIDE(200, 40), [J(560, { p: 'handsOnHead', e: 'scared', look: [[0, [-1, 0]], [1, [1, 0]], [2, [-1, 0]]], f: [[0, -1], [1, 1], [2, -1]] })], [{ o: 'car', x: 200, y: 0, s: 1.0, jeep: true, noMirror: true }]), { scene: 'водитель выскакивает и в ужасе оглядывается' });
K(493.02, ins('road', {}, [{ o: 'hand', x: -200, y: 300, s: 0.9, sleeve: '#ee7a2b', fist: 0.3, dir: -1, sh: 3 }, { o: 'hand', x: 260, y: 300, s: 0.9, sleeve: '#ee7a2b', fist: 0.3, dir: 1, sh: 3 }], { tint: 'cold', blur: 14 }), { scene: 'у тебя холодеют руки' });
K(494.88, face('A', 'shocked', 'road', { tint: 'cold' }), { scene: 'ты ничего не решал; сила сработала сама' });
K(497.96, line('НА ЗЛОСТЬ.', 'road', { colors: ['red'] }), { scene: 'на злость', sfx: sfx([0, 'stinger', -10]) });
K(498.88, ins('void', {}, [{ o: 'hand', x: 0, y: 420, s: 1.1, sleeve: '#ee7a2b', fist: [[0, 0], [0.8, 1]], dir: 1, pw: true, ph: 0, pr: 140 }], { blur: 0 }), { scene: 'как рука, сжимающаяся в кулак раньше мысли', sfx: sfx([0.7, 'hit', -10]) });
K(503.20, st('yard', { mood: 'night' }, WIDE(-300, 30), [], [{ o: 'car', x: -300, y: 0, s: 1.0, color: '#8a9bb0', driver: true, driverColor: '#ee7a2b' }]), { in: { type: 'dip', dur: 0.5 }, scene: 'вечером долго сидишь в машине во дворе', amb: amb.city });
K(505.88, face('A', 'thinking', 'yard', { so: { mood: 'night' } }), { scene: 'и понимаешь…' });
K([505.88, 'слушается'], bp('thoughts'), { scene: 'сила слушается и плохих мыслей', sfx: sfx([0.6, 'pop', -12], [1.7, 'buzz', -12]) });
K(511.82, bp('headarms', { split: 2.3 }), { scene: 'тренировать нужно не только руки, но и голову', sfx: sfx([2.3, 'ding', -10]) });
K(515.58, st('living', { night: true }, MED(-100, 120), [A(-100, { p: 'sitFloor', e: [[0, 'sleepy'], [4.5, 'smile']], f: 1 })], [], { timer: { from: 1, to: 5, t0: 1.0, t1: 4.6, suf: '', ease: false, label: 'ВДОХ' } }), { scene: 'учишься делать вдох и считать до пяти', amb: amb.roomtone });
K(522.14, face('A', [[0, 'smile'], [0.8, 'smirk']], 'living', { so: { night: true } }), { scene: 'помогает. почти всегда' });

// ================= ДАЧА =================
K(524.86, st('dacha', {}, WIDE(-200, 30), [A(-900, { walk: { to: -560, at: 0, dur: 2.2 }, e: 'happy' })]), { in: { type: 'dip', dur: 0.5 }, scene: 'дача к дедушке', amb: amb.wind });
K(527.52, st('dacha', {}, MED(200, 170), [D(200, { p: [[0, 'dig1'], [0.6, 'dig2'], [1.2, 'dig1'], [1.8, 'dig2'], [2.4, 'dig1'], [3.0, 'dig2'], [3.6, 'dig1']], e: 'determined' })], [{ o: 'shovel', attach: 0, ay: 60, rot: 0.3 }], { read: { value: '80 ЛЕТ', at: 0.3 } }), { scene: 'деду 80, каждую весну перекапывает огород' });
K(531.70, st('dacha', {}, WIDE(250, 0, [0.95, 1.0]), [D(-200, { p: 'dig1', e: 'determined' })], [{ o: 'shovel', attach: 0, ay: 60, rot: 0.3 }], { dim: { x1: -200, y1: -40, x2: 700, y2: -40, str: '6 СОТОК', at: 0.2 } }), { scene: 'шесть соток. лопатой' });
K(533.76, st('dacha', {}, MED(0, 170), [A(-220, { p: 'reach', e: 'smile', f: 1 }), D(160, { p: [[0, 'crossArms'], [0.6, 'point']], e: 'angry', f: -1 })]), { scene: 'ругается, если кто-то пытается помочь' });
K(536.38, st('dacha', {}, WIDE(-400, 30), [D(-500, { walk: { to: -760, at: 0.2, dur: 2.2 }, e: 'neutral', f: -1 }), A(-100, { p: 'pocket', e: 'smirk', f: -1 })]), { scene: 'дед уходит ставить чайник' });
K(539.56, st('dacha', { dug: [[0, 0], [2.4, 1]] }, WIDE(250, 20), [A(-260, { p: 'pocket', e: 'smirk', eyes: [[0, 1]] })], [], { badge: { str: '5 МИНУТ', at: 0.3 }, pw: { at: 0.2, to: [400, 0] } }), { scene: 'перекапываешь огород за пять минут', sfx: sfx([0.3, 'shimmer', -14]) });
K(542.38, ins('dacha', { dug: 0.5 }, [0, 1, 2].map((i) => ({ o: 'box', x: -300 + i * 300, y: 0, w: 220, h: 50, color: '#5a3a26', path: [[0, [-300 + i * 300, 0]], [0.6 + i * 0.3, [-300 + i * 300, 0]], [1.4 + i * 0.3, [-300 + i * 300, 260]], [2.6 + i * 0.3, [-300 + i * 300, 0]]], rotKey: [[0.8 + i * 0.3, 0], [2.4 + i * 0.3, 3.14]], pw: [0.5], ph: 20, pr: 130 })), { blur: 6, cam: { z: [1.3, 1.35], x: [0, 0], y: 120 } }), { scene: 'земля поднимается пластами и переворачивается', sfx: sfx([0.6, 'whoosh', -14], [2.4, 'hit', -16]) });
K(546.86, st('dacha', { dug: 1 }, WIDE(250, 0, [0.95, 0.98]), [], [], { dim: { x1: -200, y1: -10, x2: 700, y2: -10, str: 'КАК ПО ЛИНЕЙКЕ', at: 0.2 } }), { scene: 'ровно как по линейке', sfx: sfx([0.2, 'ding', -12]) });
K(548.90, st('dacha', { dug: 1 }, WIDE(-500, 30), [D(-760, { walk: { to: -500, at: 0.1, dur: 1.4 }, e: 'neutral' })], [{ o: 'kettle', attach: 0, ay: 10 }]), { scene: 'дедушка выходит с чайником' });
K(550.68, face('D', [[0, 'neutral'], [0.6, 'surprised']], 'dacha', { look: [[0, [0.8, 0.3]], [1.4, [-0.8, 0]]] }), { scene: 'смотрит на огород' });
K(551.94, st('dacha', { dug: 1 }, MED(-150, 170), [A(-20, { p: 'pocket', e: 'smile', f: -1 }), D(-360, { p: 'holdFront', e: 'confused', f: 1 })], [{ o: 'kettle', attach: 1, ay: 10 }]), { scene: 'смотрит на тебя, чистого, с руками в карманах', sfx: sfx([0.6, 'shimmer', -16]) });
K(555.26, face('D', 'thinking', 'dacha', { look: [0.6, 0] }), { scene: 'долго молчит, а потом говорит' });
K(557.74, face('D', 'confused', 'dacha', { talk: [0, 1.9] }), { scene: '«Не знаю, как ты это сделал»' });
K(559.88, face('D', 'smile', 'dacha', { talk: [0, 2.8], zoom: 0.1 }), { scene: '«Но земля, Тёма, руки любит»' });
K(563.02, face('A', 'confused', 'dacha', { fx: -40 }), { scene: 'ты тогда не понял' });
K(564.92, st('dacha', { dug: 1 }, MED(-150, 170), [A(-20, { p: 'shrug', e: 'smirk', f: -1 }), D(-360, { walk: { to: -760, at: 0.3, dur: 1.8 }, e: 'neutral', f: -1 })]), { scene: 'подумал, что дед просто ворчит' });
K(567.32, st('dacha', { mood: 'dusk', dug: 1 }, WIDE(0, 0, [1.0, 1.08]), [A(-100, { p: 'stand', e: 'neutral' })]), { scene: 'поймёшь ты это потом', sfx: sfx([0.2, 'heartbeat', -16]) });

// ================= ГАРАЖ: ДОМКРАТ =================
K(569.70, st('garage', { out: 'golden' }, WIDE(-700, 30), [A(-1000, { walk: { to: -640, at: 0, dur: 1.8 }, e: 'happy' })]), { in: { type: 'dip', dur: 0.5 }, scene: 'суббота у родителей', amb: amb.hum });
K(571.88, st('garage', {}, WIDE(40, 40), [P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }]), { scene: 'папа в гараже копается в старой Ниве' });
K(575.18, st('garage', {}, MED(0, 120, [1.5, 1.6]), [P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }], { call: { p: [40, 30], to: [400, 360], str: 'ДОМКРАТ', at: 1.2, w: 300 } }), { scene: 'лежит под машиной, машина на домкрате' });
K(578.48, ins('garage', {}, [{ o: 'jack', x: 0, y: 30, s: 3.2 }], { blur: 12, read: { value: 'СТАРШЕ ТЕБЯ', at: 0.5, color: '#ff6f61' } }), { scene: 'древний домкрат' });
K(581.14, face('A', 'worried', 'garage', { talk: [0, 1.8] }), { scene: '«Пап, может, подставки поставишь?»' });
K(583.50, face('P', 'smirk', 'garage', { talk: [0, 4.0], read: { value: '30 ЛЕТ', at: 0.6 } }), { scene: '«Тёма, я под этой машиной 30 лет лежу. Учить меня будешь»' });
K(588.04, face('A', 'sad', 'garage', { look: [0, 0.4] }), { scene: 'ты вздыхаешь, давно перестал спорить' });
K(591.32, st('garage', {}, WIDE(-100, 40), [A(-560, { p: 'crossArms', e: 'neutral', f: 1 }), P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }]), { scene: 'ты ещё не рассказал родителям' });
K(594.00, st('garage', {}, WIDE(-150, 40), [A(-560, { p: 'point', e: 'smirk', f: 1, eyes: [[0.4, 1]] }), P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }, { o: 'wrench', path: [[0, [520, 120]], [0.6, [520, 120]], [1.4, [480, 6]], [4, [-200, 6]]], pw: [0.5] }], { pw: { at: 0.4, obj: 2 } }), { scene: 'силой мысли подаёшь папе ключи' });
K(598.74, ins('garage', {}, [{ o: 'wrench', path: [[0, [500, 10]], [3.2, [-150, 10]]], ease: 'out', s: 2.4, pw: true, ph: 0, pr: 60 }], { blur: 0, cam: { z: [2.2, 2.3], x: [-100, -160], y: 230 } }), { scene: 'ключ скользит по бетону к руке', sfx: sfx([0.2, 'swish', -16]) });
K(602.66, ins('garage', {}, [{ o: 'wrench', x: -150, y: 10, s: 2.4, when: [0, 0.5] }, { o: 'hand', path: [[0, [-420, 40]], [0.5, [-200, 30]], [1.2, [-420, 40]]], s: 0.5, fist: [[0.4, 0], [0.6, 1]], dir: -1, sleeve: '#6f8f45' }], { blur: 0, cam: { z: [2.2, 2.3], x: [-160, -160], y: 230 } }), { scene: 'папа берёт ключ', sfx: sfx([0.55, 'hit', -18]) });
K(604.80, face('P', 'smile', 'garage', { talk: [0, 1.8], so: {}, veil: 0.5 }), { scene: '«Надо же, как удачно лёг»' });
K(607.22, face('A', 'smirk', 'garage', { fx: -40 }), { scene: 'ты прячешь улыбку' });

// ================= ЛЕНЬ =================
K(608.84, st('living', {}, WIDE(-60, 40), [A(-400, { walk: { to: -100, at: 0, dur: 1.2 }, p: [[0, 'stand'], [1.3, 'fall']], e: 'happy' })], [], { so: { tv: true } }), { in: { type: 'dip', dur: 0.5 }, scene: 'наступает самое приятное время', amb: amb.roomtone });
K(611.60, st('living', {}, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'smirk', p: 'shrug' })], [], { so: { tv: true } }), { scene: 'больше не встаёшь с дивана. зачем?' });
K(613.98, st('living', {}, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'smirk' })], [{ o: 'remote', path: [[0, [700, 200]], [1.2, [-20, 190]]], ease: 'out', pw: true }], { so: { tv: true } }), { scene: 'пульт прилетает сам', sfx: sfx([0.1, 'whoosh', -14]) });
K(615.70, ins('living', {}, [{ o: 'cup', path: [[0, [-500, 200]], [1.2, [0, 260]]], s: 2.4, pw: true, ph: 30, pr: 70, bob: 6 }], { blur: 10 }), { scene: 'чай приплывает сам' });
K(617.02, st('living', { doorOpen: 0.5, tv: true }, WIDE(300, 40), [A(-60, { lie: 1, y: 70, e: 'smirk' })], [{ o: 'pizza', path: [[0, [860, 0]], [0.4, [860, 0]], [2.0, [300, 180]]], s: 1.3, pw: [0.3] }]), { scene: 'пицца поднимается с коврика у двери', sfx: sfx([0.4, 'shimmer', -14]) });
K(619.34, ins('living', {}, [{ o: 'socks', path: [[0, [-300, 300]], [1.4, [0, 200]]], s: 2.4, rot: 1.57, pw: true, ph: 0, pr: 70 }, { o: 'socks', path: [[0, [-500, 360]], [1.6, [80, 200]]], s: 2.4, rot: 1.57, pw: true, ph: 0, pr: 70 }], { blur: 10 }), { scene: 'носки сами надеваются на ноги' });
K(621.36, st('tower', {}, WIDE(0, [-300, -800], [1.0, 1.0]), [A(250, { y: 300, p: 'fly', e: 'smirk', fl: fl(0, 900, { dur: 3.4, glow: true }) })]), { scene: 'лифт: поднимаешь себя на нужный этаж за окном', sfx: sfx([0.2, 'whoosh', -12]) });
K([622.20, 'пока'], face('X', 'confused', 'tower', { objs: [{ o: 'bubble', x: 420, y: 380, s: 1.4, label: 'ПТИЦА?', w: 240, h: 100 }] }), { scene: 'соседи думают, что видели птицу' });
K(627.44, face('A', 'smirk', 'tower', { fx: -40 }), { scene: 'хе-хе' });
K(628.02, st('living', { tv: true }, WIDE(0, 40), [A(-60, { lie: 1, y: 70, e: 'smirk' }), L(500, { p: 'talk', e: 'smirk', f: -1 })], [{ o: 'remote', x: 300, y: 260, s: 2.0, pw: true, bob: 8 }]), { scene: 'Лёха: ты превратился в пульт от телевизора' });
K(631.06, st('living', { tv: true }, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'happy' })], [{ o: 'remote', x: -300, y: 260, pw: true, bob: 6 }, { o: 'cup', x: 0, y: 300, pw: true, bob: 7 }, { o: 'book', x: 300, y: 280, pw: true, bob: 5 }]), { scene: 'лежишь и всем управляешь' });
K(633.06, face('A', 'smirk', 'living', { talk: [0, 1.6] }), { scene: 'это не лень, а…' });
K([633.06, 'оптимизация'], line('ОПТИМИЗАЦИЯ', 'living', {}), { scene: '…оптимизация', sfx: sfx([0, 'ding', -12]) });
K(636.28, st('yard', {}, WIDE(0, 30), [A(-500, { walk: { to: 300, at: 0, dur: 5.0 }, e: 'smirk' })], [0, 1, 2, 3].map((i) => ({ o: 'bag', path: [[0, [-700 - i * 130, 90]], [5.0, [100 - i * 130, 90]]], ease: 'linear', pw: true, bob: 10, ph: 30, pr: 40 }))), { scene: 'пакеты летят за тобой, как утята за мамой', amb: amb.city });
K(641.84, st('living', {}, MED(-450, 200), [A(-460, { p: 'stand', e: 'smirk', f: 1 })], [{ o: 'book', path: [[0, [-700, 520]], [1.6, [-380, 260]]], pw: true, back: false }]), { scene: 'книга с верхней полки летит сама' });
K(644.82, face('A', 'smirk', 'living', { objs: [{ o: 'toothbrush', x: 60, y: -80, s: 3, rotKey: [[0, -0.1], [0.2, 0.1], [0.4, -0.1], [0.6, 0.1], [0.8, -0.1], [1, 0.1], [1.2, -0.1], [1.4, 0.1], [1.6, -0.1], [1.8, 0.1]], pw: true, ph: 0, pr: 50 }] }), { scene: 'зубы чистишь силой мысли', sfx: sfx([0.2, 'swish', -16]) });
K(647.04, st('living', {}, MED(-100, 160), [A(-100, { p: 'phone', prop: 'phone', e: 'smirk' })], [{ o: 'toothbrush', x: -40, y: 252, s: 1.0, bob: 6, rotKey: [[0, -0.2], [0.3, 0.2], [0.6, -0.2], [0.9, 0.2], [1.2, -0.2], [1.5, 0.2], [1.8, -0.2], [2.1, 0.2], [2.4, -0.2], [2.7, 0.2]], pw: true, ph: 0, pr: 30 }]), { scene: 'щётка скачет по зубам, пока смотришь в телефон' });
K(650.18, st('living', { doorOpen: 0.8 }, WIDE(300, 40), [M(820, { p: 'facepalm', e: 'sad', f: -1 }), A(200, { p: 'phone', prop: 'phone', e: 'smirk' })], [{ o: 'toothbrush', x: 240, y: 252, s: 1.0, bob: 6, pw: true, ph: 0, pr: 30 }]), { scene: 'мама видит это' });
K([650.18, 'стал'], st('living', {}, MED(-100, 160), [A(-100, { p: 'shrug', e: 'smirk' })], [{ o: 'hat', x: -94, y: 286, s: 1.0, pw: true, ph: 30, pr: 60 }]), { scene: 'похож на ленивого волшебника из мультика', sfx: sfx([0.2, 'shimmer', -12]) });

// ================= РАСПЛАТА ЗА ЛЕНЬ =================
K(656.14, face('A', 'confused', 'stairwell', {}), { in: { type: 'dip', dur: 0.5 }, scene: 'через неделю — что-то странное', sfx: sfx([0.2, 'heartbeat', -14]) });
K(659.02, st('stairwell', {}, WIDE(-100, 0), [A(-560, { y: 0, walk: { to: -300, at: 0, dur: 2 }, p: [[0, 'stand'], [2.2, 'knees']], e: [[0, 'neutral'], [2.2, 'nervous']] })], [], { badge: { str: '3 ЭТАЖ', at: 0.3 } }), { scene: 'на третьем этаже сбилось дыхание' });
K(663.86, st('stairwell', {}, MED(-300, 170), [A(-300, { p: 'knees', e: 'nervous', jit: 2 })]), { scene: 'ноги будто ватные' });
K(665.50, st('yard', {}, MED(-100, 170), [A(-300, { walk: { to: 0, at: 0, dur: 3.0 }, p: 'bagHeavy', e: 'nervous' })], [{ o: 'bag', attach: 0, ay: 50 }]), { scene: 'донёс один пакет руками', amb: amb.city });
K([665.50, 'дрожат'], ins('yard', {}, [{ o: 'hand', x: 0, y: 380, s: 0.9, sleeve: '#ee7a2b', fist: 0.2, dir: 1, sh: 4 }], { blur: 14 }), { scene: 'дрожат пальцы' });
K(671.04, line('И ЭТО ПО-НАСТОЯЩЕМУ', 'yard', {}), { in: { type: 'zoom', dur: 0.4 }, scene: 'и это тоже по-настоящему' });
K(673.24, bp('muscle', { k: [[0, 1], [2.5, 1], [5.5, 0.25]], lbl: 'НЕ НУЖНЫ — РАЗБИРАЕМ', lblAt: 2.2 }), { scene: 'мышцы не работают — организм их разбирает', sfx: sfx([2.2, 'buzz', -12]) });
K(679.48, st('station', {}, WIDE(0, 60), [C(-200, { p: 'fly', rot: 0.6, fl: fl(0, 300, { dur: 0.1, glow: false }), e: 'happy' })]), { in: { type: 'dip', dur: 0.4 }, scene: 'лучше всего видно на космонавтах', amb: amb.hum });
K(681.68, st('station', {}, WIDE(0, 60), [C(-300, { p: 'relaxed', rot: -0.4, fl: fl(0, 260, { dur: 0.1, glow: false }), e: 'smile' }), C(200, { p: 'fly', rot: 1.2, fl: fl(0, 340, { dur: 0.1, glow: false }), e: 'happy' })]), { scene: 'в невесомости мышцам не надо держать тело' });
K(684.18, bp('astro', { start: 2.5 }), { scene: 'НАСА: за 1–2 недели до пятой части мышц', sfx: sfx([2.5, 'counter', -14]) });
K(691.42, st('station', {}, MED(0, 170), [C(-40, { walk: { to: -40, at: 0, dur: 99 }, p: 'stand', e: 'determined' })], [], { read: { value: '2 ЧАСА В ДЕНЬ', at: 0.5 }, runner: true }), { scene: 'на станции тренируются по два часа в день' });
K(696.44, face('A', 'sleepy', 'living', {}), { scene: 'а ты не тренируешься вообще' });
K(698.50, st('living', {}, WIDE(0, 40), [A(-300, { p: 'fly', rot: 1.4, y: 160, walk: { to: 200, at: 0, dur: 2, ease: false }, fl: fl(0, 0, {}), e: 'happy', shadow: false })]), { scene: 'летаешь по квартире, как в невесомости' });
K(700.72, st('living', {}, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'smirk' })], [], { call: { p: [-60, 90], to: [-460, 330], str: 'СТАНЦИЯ', at: 0.6, w: 300 } }), { scene: 'только станция у тебя — диван' });
K(703.02, face('A', 'neutral', 'living', { tint: 'dark' }), { scene: 'и есть ещё одна вещь, которую ты не замечаешь', sfx: sfx([0.3, 'heartbeat', -12]) });
K(706.48, ins('living', {}, [{ o: 'cup', x: 0, y: 220, s: 2.4, pw: true, ph: 30, pr: 70, bob: 5 }], { blur: 12, read: { label: 'МАКСИМУМ:', value: 'ЧАШКА', at: 0.6 } }), { scene: 'ни разу не поднимал ничего тяжелее чашки' });
K(710.70, bp('icons', { ats: [2.1, 2.7, 3.4], top: 'ТОЧНОСТЬ: 0' }), { scene: 'ни разу не тренировал точность: только пульт, чай, носки', sfx: sfx([2.1, 'pop', -12], [2.7, 'pop', -12], [3.4, 'pop', -12]) });
K(715.58, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'smirk' })], [0, 1, 2].map((i) => ({ o: 'ball', x: 120, y: 200, orbit: i, color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i] })), { juggle: { cx: 120, cy: 200, r: 60, wobble: 1 } }), { scene: 'по привычке пытаешься жонглировать', amb: amb.roomtone });
K(719.28, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'shocked' })], [0, 1, 2].map((i) => ({ o: 'ball', color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i], path: [[0, [100 + i * 40, 230 - i * 20]], [0.5 + i * 0.12, [120 + i * 60, 0]], [0.8 + i * 0.12, [130 + i * 60, 40]], [1.1 + i * 0.12, [140 + i * 60, 0]]], ease: 'in' }))), { scene: 'и роняешь их. все три', sfx: sfx([0.5, 'hit', -14], [0.65, 'hit', -14], [0.8, 'hit', -14]) });
K(721.38, face('A', 'worried', 'living', { so: { night: true } }), { scene: 'сила стала неуклюжей' });
K(723.80, st('living', { night: true }, MED(-40, 170), [A(-300, { p: 'point', e: 'sad', f: 1 })], [], { ghost: { at: 0, path: [[0, [100, 260]], [1.8, [150, 120]]], a: 0.5, wob: 20 } }), { scene: 'как рука, которой давно не пользовались' });
K(725.94, bp('juggle', { reg: [[0, 0.9], [2, 0.9]], lbl: 'ПОМНИШЬ ЖОНГЛЁРОВ?', lblAt: 0.3 }), { in: { type: 'zoom', dur: 0.4 }, scene: 'помнишь жонглёров из эксперимента?' });
K(728.20, bp('juggle', { solo: true, reg: [[0, 0.4], [2.2, 1.0]], lbl: 'ТРЕНИРУЕШЬ — РАСТЁТ', lblAt: 0.3, arrow: 'up' }), { scene: 'мозг растёт под навык' });
K(731.02, bp('juggle', { solo: true, reg: [[0, 1.0], [2.4, 0.3]], lbl: 'БРОСИЛ — УМЕНЬШАЕТСЯ', lblAt: 0.3, arrow: 'down' }), { scene: 'и снова уменьшается, когда бросаешь', sfx: sfx([0.4, 'buzz', -12]) });
K(733.98, line('ТЫ БРОСИЛ.', 'living', { colors: ['red'], so: { night: true } }), { scene: 'ты бросил', sfx: sfx([0, 'stinger', -10]) });
K(734.90, st('living', { night: true }, MED(-60, 200), [A(-60, { lie: 1, y: 70, e: 'smirk', p: 'wave' })]), { scene: 'решаешь начать завтра' });
K(737.80, ins('living', { night: true }, [{ o: 'calendar', x: 0, y: 80, s: 2.6, top: 'ОБЯЗАТЕЛЬНО', label: 'ПОНЕДЕЛЬНИК', circle: [[0.6, 0], [1.6, 1]] }], { blur: 12 }), { scene: 'обязательно. с понедельника', sfx: sfx([0.6, 'swish', -14]) });

// ================= КУЛЬМИНАЦИЯ =================
K(740.62, ins('void', {}, [{ o: 'calendar', x: 0, y: 80, s: 2.6, top: 'НЕДЕЛЯ', label: 'ВОСКРЕСЕНЬЕ', circle: [[0.4, 0], [1.4, 1]] }], { blur: 0, tint: 'dark' }), { in: { type: 'dip', dur: 0.6 }, scene: 'до понедельника ты не доживаешь', sfx: sfx([0.2, 'heartbeat', -8]) });
K(743.02, st('garage', {}, WIDE(-500, 40), [A(-1000, { walk: { to: -640, at: 0, dur: 2.4 }, e: 'happy' }), L(-1180, { walk: { to: -820, at: 0, dur: 2.4 }, e: 'smile' })]), { scene: 'в воскресенье заезжаете к папе в гараж', amb: amb.hum });
K(746.26, st('garage', {}, MED(-300, 170), [L(-500, { p: 'holdFront', e: 'happy', f: 1 }), P(-100, { p: 'explain', e: 'smile', f: -1 })]), { scene: 'папа обещал Лёхе помочь с проводкой' });
K(748.80, st('garage', {}, WIDE(40, 40), [P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }]), { scene: 'папа опять лежит под Нивой' });
K(750.92, ins('garage', {}, [{ o: 'jack', x: 0, y: 30, s: 3.2 }], { blur: 12, read: { value: 'ОПЯТЬ ОДИН ДОМКРАТ', at: 0.3, color: '#ff6f61' } }), { scene: 'опять на одном домкрате' });
K(752.84, st('garage', {}, WIDE(-300, 40), [A(-700, { p: 'talk', e: 'happy', f: 1 }), L(-480, { p: 'crossArms', e: 'joy', f: -1 }), P(-120, { lie: 1, e: 'neutral' })], [{ o: 'jack', x: 40, y: 0, s: 1.2 }, { o: 'car', x: 40, y: 40, s: 1.0, rust: true }]), { scene: 'ты у ворот рассказываешь Лёхе ерунду' });
K(756.46, face('A', [[0, 'smile'], [0.6, 'surprised']], 'garage', { fx: -40, look: [[0.6, [0.8, 0]]] }), { scene: 'и тут слышишь звук', sfx: sfx([0.6, 'glitch', -10, { pitch: 0.5 }]) });
K(758.36, ins('garage', {}, [{ o: 'jack', x: 0, y: 30, s: 3.2, tilt: [[0, 0], [1.0, 0.08]], sh: 3 }], { blur: 12 }), { scene: 'металлический скрип', sfx: sfx([0.1, 'glitch', -6, { pitch: 0.4 }]) });
K(759.66, face('A', 'shocked', 'garage', { fx: -40, look: [0.8, 0.3] }), { scene: 'оборачиваешься' });
K([759.66, 'старый'], ins('garage', {}, [{ o: 'jack', x: 0, y: 30, s: 3.2, tilt: [[0, 0.08], [2.2, 0.2]], sh: 2 }], { blur: 12 }), { scene: 'старый домкрат перекашивается', sfx: sfx([0.3, 'riser', -10]) });
K(763.82, ins('garage', {}, [{ o: 'jack', x: 0, y: 30, s: 3.2, tilt: [[0, 0.2], [1.0, 0.28], [1.4, 1.3]], ease: 'in', sh: 3 }], { blur: 12, cam: { z: [1, 1.05], x: [0, 0], y: 0, sh: [[1.4, 12], [1.9, 0]] } }), { scene: 'медленно… а потом резко', sfx: sfx([1.4, 'impact', -6]) });
K(766.28, face('A', 'shocked', 'garage', { talk: [0, 0.6], sh: 6, zoom: 0.2 }), { bars: 'scope', scene: '«Па!»', in: { type: 'flash', dur: 0.2 } });
K(767.48, st('garage', {}, MED(40, 100, [1.4, 1.45]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'jack', x: 140, y: 0, s: 1.2, tilt: 1.3 }, { o: 'car', path: [[0, [40, 40]], [0.9, [40, 16]]], ease: 'in', s: 1.0, rust: true }], { cam: { z: [1.4, 1.45], x: [40, 40], y: 100, sh: [[0, 6], [0.9, 0]] } }), { bars: 'scope', scene: 'машина падает', sfx: sfx([0, 'whoosh', -8]) });
K(768.74, st('garage', {}, MED(40, 100, [1.45, 1.5]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'jack', x: 140, y: 0, s: 1.2, tilt: 1.3 }, { o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240 }], { freeze: true }), { in: { type: 'flash', dur: 0.3 }, bars: 'scope', scene: 'СТОП-КАДР: машина замерла', sfx: sfx([0, 'freeze', -4]) });
K(769.92, st('garage', {}, CLOSE(-20, 270, [2.3, 2.4]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }], { dim: { x1: -40, y1: 40, x2: -40, y2: 96, str: 'ЛАДОНЬ', at: 0.4 } }), { bars: 'scope', scene: 'в ладони над папиной грудью' });
K(772.26, face('A', 'determined', 'garage', { eyesGlow: [[0, 1]], sh: 3 }), { bars: 'scope', scene: 'ты держишь её', sfx: sfx([0, 'heartbeat', -8]) });
K(773.70, st('garage', {}, WIDE(-150, 40), [A(-620, { p: 'strain', e: 'determined', jit: 1.5, eyes: [[0, 1]] }), L(-820, { p: 'handsOnHead', e: 'shocked' }), P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }, { o: 'jack', x: 140, y: 0, s: 1.2, tilt: 1.3 }], { pw: { at: 0, obj: 0 } }), { scene: 'даже не помнишь, как начал' });
K(775.48, st('garage', {}, WIDE(-100, 40, [1.05, 1.12]), [A(-620, { p: 'strain', e: 'determined', jit: 2, eyes: [[0, 1]] }), P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1.5 }], { read: { value: '1 000+ КГ', at: 0.4, color: '#ff6f61' }, pw: { at: 0, obj: 0 } }), { scene: 'больше тонны металла висит в воздухе', sfx: sfx([0.4, 'blip', -12]) });
K(778.08, st('garage', {}, MED(-300, 170), [A(-300, { p: [[0, 'strain'], [1.5, 'kneelReach']], e: 'nervous', jit: 2 })], [{ o: 'car', x: -300, y: 330, s: 0.8, alpha: 0.3, sh: 2 }], { tint: 'cold' }), { scene: 'чувствуешь вес, будто машина на плечах', sfx: sfx([0.4, 'heartbeat', -8]) });
K(782.50, face('A', 'nervous', 'garage', { ringsOn: '#ffffff', sh: 3 }), { scene: 'в голове звенит', sfx: sfx([0, 'hum', -10, { dur: 1.2, pitch: 2 }]) });
K(783.74, st('garage', {}, WIDE(0, 40), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240 }], { blur: 10, spots: true }), { scene: 'перед глазами цветные пятна' });
K(786.14, st('yard', { mood: 'dusk' }, WIDE(-160, 30), [A(-640, { p: 'strain', e: 'determined' })], [{ o: 'car', x: -100, y: 38, s: 1.0, color: '#8a9bb0', pw: true, ph: 50, pr: 220 }], { tint: 'memory', timer: { from: 0, to: 3, t0: 0.2, t1: 1.8, suf: ' С', ease: false } }), { scene: 'держал машину только три секунды', sfx: sfx([0.3, 'tick', -12]) });
K([786.14, 'это'], st('yard', { mood: 'dusk' }, MED(-200, 200), [A(-560, { p: 'cheer', e: 'joy' })], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#8a9bb0' }], { tint: 'memory', badge: { str: '2 НЕДЕЛИ НАЗАД', at: 0.2 } }), { scene: 'это было две недели назад, когда ты тренировался' });
K(792.14, face('A', 'nervous', 'garage', { sh: 3, sweat: true, timer: { from: 0, to: 5, t0: 0, t1: 1.4, suf: ' С', ease: false, color: '#ff6f61' } }), { scene: 'а сейчас проходит пять', sfx: sfx([0.2, 'tick', -10], [1.2, 'tick', -10]) });
K(794.08, st('garage', {}, MED(40, 100), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }], { read: { value: '10 С', at: 0, color: '#ff6f61' } }), { scene: 'десять', sfx: sfx([0.1, 'tick', -8]) });
K(795.12, st('garage', {}, MED(40, 100, [1.5, 1.55]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 6 }]), { scene: 'машина дрожит', sfx: sfx([0.1, 'glitch', -10, { pitch: 0.5 }]) });
K(796.62, st('garage', {}, CLOSE(-20, 270, [2.3, 2.35]), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', path: [[0, [40, 16]], [0.6, [40, 8]]], ease: 'out', s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 2 }], { read: { value: '−1 СМ', at: 0.5, color: '#ff6f61' } }), { bars: 'scope', scene: 'опускается на сантиметр', sfx: sfx([0.5, 'hit', -12, { pitch: 0.6 }]) });
K(798.54, face('P', 'scared', 'garage', { veil: 0.55, noBlink: true }), { bars: 'scope', scene: 'папа замер и не дышит' });
K(801.28, face('A', 'shocked', 'garage', { talk: [0, 0.6], sh: 4, blood: 0 }), { scene: '«Лёха!» — хрипишь ты' });
K(803.06, face('A', 'nervous', 'garage', { talk: [0, 2.3], sh: 4, blood: 0, sweat: true }), { scene: '«Вытаскивай его. Я долго не удержу»' });
K(805.90, st('garage', {}, WIDE(-200, 40), [L(-800, { walk: { to: -360, at: 0, dur: 1.2, run: true }, e: 'determined' }), P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }]), { scene: 'Лёха бросается к машине', sfx: sfx([0.1, 'footstep', -10], [0.4, 'footstep', -10], [0.7, 'footstep', -10]) });
K(807.78, st('garage', {}, WIDE(-200, 40), [L(-420, { walk: { to: -640, at: 0, dur: 2.4 }, p: 'pull', e: 'determined', f: 1 }), P(-120, { lie: 1, e: 'scared', dx: [[0, 0], [2.4, -220]] })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }]), { scene: 'хватает папу за ноги и тянет по бетону', sfx: sfx([0.3, 'swish', -14], [1.3, 'swish', -14]) });
K(810.40, st('garage', {}, MED(-300, 80), [P(-340, { lie: 1, e: 'determined', dx: [[0, 0], [2.4, -100]], p: [[0, 'lie'], [0.5, 'reach'], [1.0, 'lie'], [1.5, 'reach']] })], [{ o: 'car', x: 40, y: 16, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 1 }]), { scene: 'папа помогает себе руками, обдирает куртку' });
K(813.14, face('A', 'determined', 'garage', { eyesGlow: [[0, 1]], sh: 2, blood: 0 }), { scene: 'думаешь только об одном' });
K(815.54, ins('living', { night: true }, [0, 1, 2].map((i) => ({ o: 'ball', x: 0, y: 300, orbit: i, color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i], s: 2 })), { blur: 12, tint: 'memory', juggle: { cx: 0, cy: 300, r: 140 } }), { scene: 'о мячиках', sfx: sfx([0.1, 'shimmer', -12]) });
K(816.56, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'determined', eyes: [[0, 1]] })], [0, 1, 2].map((i) => ({ o: 'ball', x: 120, y: 200, orbit: i, color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i] })), { tint: 'memory', juggle: { cx: 120, cy: 200, r: 60 } }), { scene: 'держал три мячика по кругу, не давая упасть' });
K(820.38, line('УДЕРЖАТЬ.', 'garage', {}), { scene: 'удержать', sfx: sfx([0, 'heartbeat', -8]) });
K(821.08, st('garage', {}, MED(40, 100), [P(-120, { lie: 1, e: 'scared' })], [{ o: 'car', x: 40, y: 12, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 3 }], { big: { str: 'НЕ УРОНИТЬ.', at: 0.1, top: true, color: 'cream' } }), { scene: 'не уронить' });
K(822.32, line('УДЕРЖАТЬ.', 'garage', { colors: ['red'] }), { scene: 'удержать', sfx: sfx([0, 'heartbeat', -6]) });
K(823.62, st('garage', {}, WIDE(-100, 40), [A(-620, { p: 'strain', e: 'nervous', jit: 2 }), P(-120, { lie: 1, e: 'scared', dx: -320 })], [{ o: 'car', x: 40, y: 12, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 2 }], { timer: { from: 14, to: 20, t0: 0, t1: 1.9, suf: ' С', color: '#ff6f61' } }), { scene: 'пятнадцать секунд… двадцать', sfx: sfx([0.3, 'tick', -10], [1.3, 'tick', -10]) });
K(825.74, face('A', 'nervous', 'garage', { blood: 0, sh: 3 }), { scene: 'из носа течёт кровь' });
K(827.56, st('garage', {}, MED(-500, 170), [A(-560, { p: [[0, 'strain'], [0.8, 'knees']], e: 'nervous', jit: 3 })]), { scene: 'колени подгибаются', sfx: sfx([0.8, 'hit', -14]) });
K(829.06, st('garage', {}, CLOSE(-560, 260, [2.0, 2.1]), [A(-560, { p: 'knees', e: 'nervous', jit: 4 })], [], { tint: 'cold' }), { scene: 'ноги, которые ты не тренировал, не держат' });
K(833.52, st('garage', {}, WIDE(-200, 40), [A(-620, { p: [[0, 'knees'], [0.6, 'kneelReach']], e: 'determined', eyes: [[0, 1]], jit: 2 }), L(-400, { p: 'pull', e: 'determined', f: -1 }), P(-560, { lie: 1, e: 'scared', dx: 0 })], [{ o: 'car', x: 40, y: 12, s: 1.0, rust: true, pw: true, ph: 60, pr: 240, sh: 2 }], { pw: { at: 0.6, obj: 0 } }), { scene: 'падаешь на колено, но смотришь на машину', sfx: sfx([0.5, 'hit', -12]) });
K(836.76, face('A', 'determined', 'garage', { eyesGlow: [[0, 1]], blood: 0, zoom: 0.15, sh: 2 }), { bars: 'scope', scene: 'только на машину' });
K(837.88, face('L', 'shocked', 'garage', { talk: [0, 1.9], sh: 2 }), { scene: '«Всё, вытащил!» — кричит Лёха' });
K(840.94, face('A', [[0, 'determined'], [0.4, 'sleepy']], 'garage', { blood: 0 }), { scene: 'ты отпускаешь', sfx: sfx([0.3, 'whoosh', -10]) });
K(842.38, st('garage', {}, WIDE(0, 40), [], [{ o: 'car', path: [[0, [40, 12]], [0.3, [40, -10]]], ease: 'in', s: 1.0, rust: true }, { o: 'jack', x: 140, y: 0, s: 1.2, tilt: 1.3 }], { cam: { z: [1.05, 1.05], x: [0, 0], y: 40, sh: [[0.3, 22], [1.4, 0]] } }), { scene: 'Нива с грохотом падает на бетон', sfx: sfx([0.3, 'impact', -3], [0.35, 'thunder', -14]) });
K(844.92, st('garage', {}, CLOSE(-20, 260, [2.2, 2.3]), [], [{ o: 'car', x: 40, y: -10, s: 1.0, rust: true }], { call: { p: [-40, 10], to: [-250, 170], str: 'ТУТ БЫЛ ПАПА', at: 0.6, w: 420, color: '#ff6f61' } }), { bars: 'scope', scene: 'туда, где только что была папина грудь' });
K(848.10, st('garage', {}, WIDE(-200, 40, [1.1, 1.05]), [A(-640, { lie: -1, e: 'sleepy' }), L(-380, { p: 'sitFloor', e: 'sad' }), P(-140, { p: 'sitFloor', e: 'shocked', f: -1 })], [{ o: 'car', x: 300, y: -10, s: 1.0, rust: true }]), { in: { type: 'dip', dur: 0.6 }, scene: 'несколько минут никто ничего не говорит', amb: amb.hum });
K(850.46, st('garage', {}, MED(-160, 120), [P(-140, { p: 'sitFloor', e: 'shocked', f: [[0, 1], [1.4, -1], [2.6, 1], [3.8, -1]] })], [{ o: 'car', x: 300, y: -10, s: 1.0, rust: true }]), { scene: 'папа держится за голову, смотрит то на машину, то на тебя' });
K(855.80, st('garage', {}, MED(-600, 100), [A(-640, { lie: -1, e: 'sleepy', blood: 0 })]), { scene: 'лежишь на холодном бетоне' });
K([855.80, 'такая'], face('A', 'sleepy', 'garage', { blood: 0, tilt: 0.2 }), { scene: 'слабость, будто пробежал марафон' });
K(862.24, face('P', 'shocked', 'garage', { talk: [0, 0.7] }), { scene: '«Тёма!» — наконец говорит папа' });
K(864.60, face('P', 'confused', 'garage', { talk: [0, 1.7] }), { scene: '«Это ты сделал?»' });
K(866.80, face('A', 'sad', 'garage', { nod: [0.1, 0.9], blood: 0 }), { scene: 'ты киваешь' });
K(868.32, face('P', 'thinking', 'garage', {}), { scene: 'папа долго молчит' });
K(869.90, st('garage', {}, MED(-300, 120), [A(-560, { p: 'sitFloor', e: 'sleepy', f: 1 }), P(-140, { p: 'sitFloor', e: 'thinking', f: -1 })]), { scene: 'а потом тихо, с новой интонацией' });
K(873.04, face('P', 'smirk', 'garage', { talk: [0, 3.0] }), { scene: '«И ключ тогда тоже ты подвинул»' });
K(876.66, st('garage', {}, MED(-300, 120), [A(-560, { p: 'sitFloor', e: 'joy', f: 1, jit: 1 }), L(-760, { p: 'sitFloor', e: 'joy', f: 1, jit: 1 }), P(-140, { p: 'sitFloor', e: 'joy', f: -1, jit: 1 })]), { scene: 'все трое начинаете смеяться' });
K(879.80, st('garage', {}, CLOSE(-400, 60, [1.8, 1.9]), [A(-560, { p: 'sitFloor', e: 'cry', f: 1, jit: 1 }), P(-140, { p: 'sitFloor', e: 'cry', f: -1, jit: 1 })]), { scene: 'нервно, до слёз, на полу гаража' });

// ================= ПОСЛЕ =================
K(883.44, st('kitchen', { mood: 'night' }, MED(-60, 170), [A(-150, { p: [[0, 'sit'], [0.3, 'talk']], e: 'sad', f: 1 }), M(260, { p: 'stand', e: 'worried', f: -1 })], [{ o: 'stool', x: -160, back: true }]), { in: { type: 'dip', dur: 0.6 }, scene: 'вечером рассказываешь всё маме', amb: amb.roomtone });
K(885.64, face('M', 'cry', 'kitchen', { so: { mood: 'night' } }), { scene: 'мама сначала плачет' });
K([885.64, 'кормит'], st('kitchen', { mood: 'night' }, MED(40, 180), [A(-150, { p: [[0, 'sit'], [0.3, 'think'], [0.8, 'sit'], [1.2, 'think']], e: 'happy', f: 1 }), M(300, { p: 'holdFront', e: 'smile', f: -1 })], [{ o: 'stool', x: -160, back: true }, { o: 'dishes', x: 40, y: 134, s: 0.5 }, { o: 'pizza', x: 140, y: 134 }, { o: 'cup', x: -20, y: 134 }]), { scene: 'кормит ужином на троих' });
K(889.62, face('A', 'happy', 'kitchen', { talk: [0, 2.4], noRings: true, so: { mood: 'night' } }), { scene: 'голоден, как волк' });
K(892.44, st('yard', { mood: 'night' }, WIDE(0, 30), [P(-500, { walk: { to: 100, at: 0, dur: 3.6 }, p: 'carry', e: 'determined' })], [{ o: 'box', attach: 0, w: 70, h: 50, color: '#d63a2a', ay: 30 }]), { scene: 'папа покупает новый домкрат', amb: amb.city });
K(896.64, ins('garage', {}, [{ o: 'jack', x: 0, y: 20, s: 2.6, isNew: true }, { o: 'stand', x: -380, y: 20, s: 2.4 }, { o: 'stand', x: 380, y: 20, s: 2.4 }], { blur: 10 }), { scene: 'и две страховочные подставки', sfx: sfx([0.2, 'ding', -10]) });
K(899.36, st('bedroom', { mood: 'night' }, WIDE(-200, 60), [A(-260, { lie: -1, y: 50, e: 'neutral' })]), { in: { type: 'dip', dur: 0.6 }, scene: 'ночью ты не можешь уснуть', amb: amb.roomtone });
K(901.94, face('A', 'thinking', 'bedroom', { so: { mood: 'night' }, veil: 0.55 }), { scene: 'прокручиваешь в голове' });
K(904.02, line(['20 СЕКУНД'], 'bedroom', { so: { mood: 'night' } }), { scene: '20 секунд. ты удержал машину 20 секунд', sfx: sfx([0.2, 'tick', -10]) });
K(908.00, st('garage', {}, WIDE(-100, 40), [A(-620, { p: 'strain', e: 'determined' }), P(-560, { p: 'stand', e: 'smile', f: 1 })], [{ o: 'car', path: [[0, [40, 120]], [5, [40, 40]]], s: 1.0, rust: true, pw: true, ph: 60, pr: 240 }, { o: 'jack', x: 40, y: 0, s: 1.2, isNew: true }], { tint: 'dream' }), { scene: 'тренированный ты аккуратно поставил бы её на домкрат' });
K(915.42, face('A', 'sad', 'bedroom', { so: { mood: 'night' }, veil: 0.55 }), { scene: 'а сейчас едва не уронил её на папу' });
K(918.06, line(['НЕ СИЛА ПРОПАЛА —', 'ТЫ ПЕРЕСТАЛ ЕЮ ЗАНИМАТЬСЯ'], 'bedroom', { so: { mood: 'night' }, at: [0, 1.8], colors: ['cream', 'red'], size: 64 }), { scene: 'не потому что сила пропала, а потому что перестал заниматься' });
K(922.98, st('dacha', { dug: 1 }, MED(200, 170), [D(200, { p: 'dig1', e: 'smile' })], [{ o: 'shovel', attach: 0, ay: 60, rot: 0.3 }], { tint: 'memory' }), { scene: 'вспоминаешь деда на даче' });
K(926.12, line('ЗЕМЛЯ РУКИ ЛЮБИТ.', 'dacha', { so: { dug: 1 } }), { scene: '«Земля руки любит»', sfx: sfx([0.1, 'shimmer', -10]) });
K(927.86, face('A', 'awe', 'bedroom', { so: { mood: 'night' } }), { scene: 'он не только про огород говорил' });
K(931.98, st('bedroom', { mood: 'night' }, WIDE(200, 80, [1.2, 1.3]), [A(140, { p: 'stand', e: 'thinking', f: 1 })]), { scene: 'знаешь, что самое странное?' });
K(933.92, bp('takes', { items: ['МЫШЦЫ', 'НАВЫКИ', 'ПРИВЫЧКИ'], ats: [0.4, 1.4, 2.4], fadeOut: true }), { scene: 'сила забирает всё, что ты перестал делать сам' });
K(939.86, bp('takes', { items: ['МЫШЦЫ', 'НАВЫК', 'ВСТАВАТЬ С ДИВАНА'], ats: [0.2, 1.8, 3.6], fadeOut: true }), { scene: 'мышцы, навык, даже привычку вставать с дивана', sfx: sfx([0.2, 'pop', -12], [1.8, 'pop', -12], [3.6, 'pop', -12]) });
K(946.60, st('lab', {}, MED(-200, 170), [SC(-200, { p: 'explain', e: 'smile' })]), { scene: 'учёные говорят так', amb: amb.roomtone });
K(948.60, line('ИСПОЛЬЗУЙ ИЛИ ПОТЕРЯЕШЬ', 'lab', {}), { scene: 'используй или потеряешь', sfx: sfx([0.05, 'stinger', -8]) });
K(950.60, bp('juggle', { reg: [[0, 0.4], [2.0, 1.0], [4.2, 0.35]], lbl: 'РАСТЁТ — И СЖИМАЕТСЯ', lblAt: 0.3 }), { scene: 'мозг жонглёров растёт и сжимается' });
K(955.28, st('station', {}, WIDE(0, 60), [C(-100, { p: 'relaxed', rot: -0.3, fl: fl(0, 260, { dur: 0.1, glow: false }), e: 'worried' })], [], { read: { value: 'МЫШЦЫ ТАЮТ', at: 0.5, color: '#ff6f61' } }), { scene: 'мышцы астронавтов тают' });
K(958.60, line('ЭТО РАБОТАЕТ ДЛЯ ВСЕГО', 'void', {}), { scene: 'правило работает для всего' });
K(960.68, ins('lab', {}, [{ o: 'book', x: 0, y: 160, s: 3.4, label: 'ABC', color: '#3a6ea5' }], { blur: 12, tint: 'memory' }), { scene: 'для языка, который учил в школе' });
K(962.92, st('yard', {}, WIDE(-100, 30), [A(-400, { p: 'phone', prop: 'phone', e: 'neutral', f: 1 }), L(600, { p: 'wave', e: 'sad', f: -1, alpha: 0.7 })]), { scene: 'для дружбы, на которую не хватает времени' });
K(965.28, ins('living', {}, [{ o: 'phone', x: 0, y: 140, s: 6, label: 'МАМА', screen: '#5fd39a', sh: 2 }], { blur: 12 }), { scene: 'для разговоров с родителями', sfx: sfx([0.2, 'phonering', -14]) });
K(968.14, st('kitchen', {}, MED(40, 180), [A(-150, { p: [[0, 'sit'], [0.6, 'reach'], [1.4, 'think']], e: 'smile', f: 1 })], [{ o: 'stool', x: -160, back: true }, { o: 'mug', path: [[0, [120, 134]], [0.6, [120, 134]], [1.2, [-60, 260]]], when: [0, 9] }]), { in: { type: 'dip', dur: 0.5 }, scene: 'стал реже пользоваться телекинезом — только когда нужно', amb: amb.roomtone });
K(973.38, st('park', { speed: 500 }, WIDE(0, 30), [A(-200, { walk: { to: -200, at: 0, dur: 99, run: true, ease: false }, e: 'happy' }), L(150, { walk: { to: 150, at: 0, dur: 99, run: true, ease: false }, e: 'smile' })]), { scene: 'каждое утро бегаешь с Лёхой', amb: amb.wind });
K(975.84, st('park', {}, MED(0, 170), [A(-200, { p: 'knees', e: 'nervous' }), L(150, { p: 'point', e: 'joy', f: -1 })]), { scene: 'до первого поворота, задыхаясь' });
K(978.44, st('park', { speed: 700 }, WIDE(0, 30), [A(-200, { walk: { to: -200, at: 0, dur: 99, run: true, ease: false }, e: 'determined' }), L(150, { walk: { to: 150, at: 0, dur: 99, run: true, ease: false }, e: 'happy' })], [], { read: { value: '5 КМ', at: 0.4 } }), { scene: 'через месяц — 5 километров', sfx: sfx([0.4, 'ding', -12]) });
K(980.38, st('living', { night: true }, MED(0, 190), [A(-160, { p: 'sitFloor', e: 'determined', eyes: [[0, 1]] })], [0, 1, 2].map((i) => ({ o: 'ball', x: 120, y: 200, orbit: i, color: ['#cfe34a', '#ff8a5a', '#8fd3ff'][i] })), { juggle: { cx: 120, cy: 200, r: 60 } }), { scene: 'по вечерам тренируешь силу', amb: amb.roomtone });
K([980.38, 'стаканы'], ins('living', { night: true }, [{ o: 'glass', x: -200, y: 180, s: 2.4, level: [[0, 0.9], [2.4, 0.1]], pw: true, rot: 0.7 }, { o: 'glass', x: 200, y: 120, s: 2.4, level: [[0, 0.05], [2.4, 0.85]] }, { o: 'needle', x: 0, y: 380, s: 1.6, pw: true, ph: 0, pr: 40 }], { blur: 10, stream: { x1: -150, y1: 270, x2: 200, y2: 230 } }), { scene: 'мячики, стаканы, иголка с ниткой' });
K(984.86, st('garage', {}, MED(0, 140), [A(-300, { p: [[0, 'stand'], [1.4, 'reach']], e: 'smile', f: 1 }), P(120, { lie: 1, e: 'smile' })], [{ o: 'stand', x: 0, y: 0, s: 1.0 }, { o: 'stand', x: 380, y: 0, s: 1.0 }, { o: 'car', x: 200, y: 50, s: 1.0, rust: true }, { o: 'wrench', attach: 0, when: [0, 9] }], { read: { value: 'РУКАМИ', at: 4.1 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'по выходным подаёшь папе ключи — руками', amb: amb.hum });
K(989.72, st('dacha', { mood: 'golden' }, MED(-300, 170), [A(-300, { p: 'holdFront', e: 'smile' })], [{ o: 'shovel', attach: 0, ay: 60, rot: 0.2 }], { read: { value: 'ОБЫЧНАЯ', at: 3.5 } }), { scene: 'весной берёшь лопату. обычную', amb: amb.wind });
K(994.14, st('dacha', { dug: 0.4 }, WIDE(100, 30), [A(-100, { p: [[0, 'dig1'], [0.6, 'dig2'], [1.2, 'dig1'], [1.8, 'dig2']], e: 'determined' }), D(300, { p: [[0, 'dig2'], [0.6, 'dig1'], [1.2, 'dig2'], [1.8, 'dig1']], e: 'smile', f: -1 })], [{ o: 'shovel', attach: 0, ay: 60, rot: 0.3 }, { o: 'shovel', attach: 1, ay: 60, rot: -0.3 }]), { scene: 'копаете вдвоём, рядом' });
K(996.46, st('dacha', { dug: 0.6 }, MED(-200, 170), [D(-60, { p: [[0, 'talk'], [1.6, 'point']], e: 'happy', f: -1 }), A(220, { p: 'holdFront', e: 'smile', f: -1 })], [{ o: 'shovel', attach: 1, ay: 60, rot: 0.2 }]), { scene: 'дед рассказывает, как строил дом' });
K(1000.56, st('dacha', { dug: 0.7 }, MED(0, 170), [A(0, { p: 'stretch', e: 'nervous' })]), { scene: 'ноют спина и плечи' });
K([1000.56, 'на'], ins('dacha', {}, [{ o: 'hand', x: 0, y: 380, s: 1.0, sleeve: '#ee7a2b', dir: 1, blisters: true }], { blur: 12 }), { scene: 'на ладонях мозоли' });
K(1004.50, face('D', 'smile', 'dacha', {}), { scene: 'дед улыбается в усы' });
K(1007.58, st('dacha', { mood: 'dusk', dug: 1 }, WIDE(100, 30, [1.05, 1.12]), [A(-60, { p: 'relaxed', e: 'smile', f: 1 }), D(200, { p: 'relaxed', e: 'smile', f: -1 })], [{ o: 'shovel', x: 40, y: 0, rot: 0.15 }, { o: 'shovel', x: 290, y: 0, rot: -0.15 }]), { scene: 'ты знаешь, о чём он думает' });
K(1012.18, line('ЗЕМЛЯ РУКИ ЛЮБИТ.', 'dacha', { so: { mood: 'dusk', dug: 1 } }), { scene: 'земля руки любит', sfx: sfx([0.1, 'shimmer', -10]) });
K(1013.72, st('garage', {}, MED(100, 60), [P(120, { lie: 1, e: 'smile' })], [{ o: 'stand', x: 0, y: 0, s: 1.0 }, { o: 'stand', x: 380, y: 0, s: 1.0 }, { o: 'car', x: 200, y: 50, s: 1.0, rust: true }, { o: 'wrench', path: [[0, [-600, 6]], [3.6, [-60, 6]]], ease: 'out', pw: true, ph: 0, pr: 40 }]), { scene: 'хотя иногда ключ всё-таки сам скользит к ладони', amb: amb.hum, sfx: sfx([0.3, 'shimmer', -14]) });
K(1018.94, st('garage', {}, MED(-100, 120), [A(-500, { p: 'pocket', e: 'smirk', f: 1 }), P(120, { lie: 1, e: 'smile', p: [[0, 'lie'], [2.4, 'wave']] })], [{ o: 'stand', x: 0, y: 0, s: 1.0 }, { o: 'stand', x: 380, y: 0, s: 1.0 }, { o: 'car', x: 200, y: 50, s: 1.0, rust: true }, { o: 'bubble', x: -60, y: 260, s: 1.1, label: 'СПАСИБО, ТЁМ', w: 300, h: 90, when: [2.6, 9] }]), { scene: '«Спасибо, Тём» — не поднимая головы' });
K(1023.56, face('A', 'smile', 'garage', { zoom: 0.08 }), { scene: 'он теперь всегда знает', sfx: sfx([0.2, 'shimmer', -14]) });

// ================= ФИНАЛ =================
K(1026.02, line('А ТЕПЕРЬ ВОПРОС ТЕБЕ', 'void', {}), { in: { type: 'dip', dur: 0.5 }, scene: 'вопрос тебе' });
K(1027.78, { tpl: 'q', str: ['Если бы у тебя был телекинез,', 'что бы ты перестал делать руками?'] }, { scene: 'вопрос 1', captions: false });
K(1032.34, { tpl: 'q', str: ['А что бы ты никогда', 'не стал отдавать силе мысли?'] }, { scene: 'вопрос 2', captions: false });
K(1035.88, { tpl: 'q', str: ['Напиши в комментариях'], bubble: 0.2 }, { scene: 'напиши в комментариях', sfx: sfx([0.2, 'pop', -10]) });
K(1037.96, st('garage', {}, WIDE(100, 40), [], [{ o: 'jack', x: 0, y: 0, s: 1.2 }, { o: 'car', x: 100, y: 40, s: 1.0, rust: true }], { read: { value: 'ВАЖНО', at: 0.3, color: '#ff6f61' } }), { in: { type: 'dip', dur: 0.4 }, scene: 'одна важная вещь' });
K(1039.94, bp('safety', { ok: false, crossAt: 2.0 }), { scene: 'не лезьте под машину на одном домкрате', sfx: sfx([2.0, 'buzz', -10]) });
K(1046.14, bp('safety', { ok: true }), { scene: 'ставьте страховочные подставки', sfx: sfx([0.6, 'ding', -10]) });
K(1048.92, st('living', {}, MED(0, 170), [A(-160, { p: [[0, 'stand'], [0.5, 'shrug']], e: 'smirk', f: 1 }), L(160, { p: [[0, 'stand'], [2.4, 'shrug']], e: 'smile', f: -1 })]), { scene: 'у тебя, скорее всего, нет телекинеза. и у меня тоже', amb: amb.roomtone });
K(1052.40, { tpl: 'sub', ring: true }, { scene: 'подпишись и нажми на колокольчик', sfx: sfx([0.5, 'ding', -10]) });
K(1057.08, { tpl: 'sub', hero: true }, { scene: 'силой мысли, к сожалению, не получится', sfx: sfx([0.4, 'shimmer', -12], [1.7, 'buzz', -14]) });
K(1059.44, { tpl: 'sub', finger: true, press: 0.6 }, { scene: 'придётся пальцем', sfx: sfx([0.6, 'blip', -6]) });
K(1060.54, { tpl: 'endcard' }, { in: { type: 'fade', dur: 0.5 }, scene: 'до встречи в новом выпуске «Что если…»', sfx: sfx([0.2, 'stinger', -10]) });

// ---------- сборка: времена, строки, проверки ----------
function startOf(a) {
  if (typeof a === 'number') return Math.max(0, a - 0.12);
  const [t0, w] = a; const nw = norm(w);
  const hit = words.find((x) => x.start >= t0 - 0.05 && norm(x.word).startsWith(nw));
  if (!hit) throw new Error(`слово «${w}» после ${t0} не найдено`);
  return Math.max(0, hit.start - 0.1);
}
const items = plan.map((p) => ({ ...p, start: +startOf(p.anchor).toFixed(2) }));
items.sort((a, b) => a.start - b.start);
const shots = items.map((p, i) => {
  const start = i === 0 ? 0 : p.start, end = i + 1 < items.length ? items[i + 1].start : DURATION;
  const lineText = words.filter((w) => w.start >= start - 0.05 && w.start < end - 0.05).map((w) => w.word).join(' ');
  return { id: 's' + String(i + 1).padStart(3, '0'), start, end: +end.toFixed(2), line: lineText, scene: p.scene || '', set: p.params.set || null, bars: p.bars || null, in: p.in || { type: 'cut' }, sfx: p.sfx || [], ...(p.amb ? { amb: p.amb } : {}), ...(p.captions === false ? { captions: false } : {}), params: p.params, notes: '' };
});
const bad = shots.filter((s) => s.end - s.start < 0.45);
if (bad.length) console.log('КОРОТКИЕ:', bad.map((s) => `${s.id} ${s.start}-${s.end} ${s.scene}`).join('\n'));
const long = shots.filter((s) => s.end - s.start > 7.5);
if (long.length) console.log('ДЛИННЫЕ:', long.map((s) => `${s.id} ${(s.end - s.start).toFixed(1)}с ${s.scene}`).join('\n'));
const music = [
  { start: 0, end: 23.2, mood: 'tension', intensity: 0.55 },
  { start: 23.2, end: 94.1, mood: 'playful', intensity: 0.5 },
  { start: 94.1, end: 156.1, mood: 'playful', intensity: 0.6 },
  { start: 156.1, end: 238.0, mood: 'wonder', intensity: 0.45 },
  { start: 238.0, end: 285.3, mood: 'mystery', intensity: 0.55 },
  { start: 285.3, end: 346.2, mood: 'playful', intensity: 0.65 },
  { start: 346.2, end: 399.8, mood: 'hopeful', intensity: 0.45 },
  { start: 399.8, end: 468.2, mood: 'wonder', intensity: 0.4 },
  { start: 468.2, end: 524.7, mood: 'dark', intensity: 0.5 },
  { start: 524.7, end: 569.6, mood: 'calm', intensity: 0.35 },
  { start: 569.6, end: 608.7, mood: 'mystery', intensity: 0.35 },
  { start: 608.7, end: 656.0, mood: 'playful', intensity: 0.5 },
  { start: 656.0, end: 740.5, mood: 'sad', intensity: 0.4 },
  { start: 740.5, end: 766.1, mood: 'tension', intensity: 0.6 },
  { start: 766.1, end: 842.3, mood: 'epic', intensity: 0.9 },
  { start: 842.3, end: 883.3, mood: 'sad', intensity: 0.35 },
  { start: 883.3, end: 968.0, mood: 'hopeful', intensity: 0.4 },
  { start: 968.0, end: 1026.0, mood: 'triumph', intensity: 0.5 },
  { start: 1026.0, end: DURATION, mood: 'hopeful', intensity: 0.5 },
];
fs.writeFileSync(path.join(PROJ, 'story/shots.json'), JSON.stringify({ title: 'Что если у тебя телекинез', duration: DURATION, shots, music, sfx: [] }, null, 1));
console.log(`shots: ${shots.length}, duration ${DURATION}s, median ${(shots.map((s) => s.end - s.start).sort((a, b) => a - b)[Math.floor(shots.length / 2)]).toFixed(2)}s`);
