// story/plan.mjs — раскадровка ролика «Тот самый Новый год, который мы никогда не забудем». Запуск: node story/plan.mjs  -> story/shots.json
// Каждый кадр: K(якорь, параметры, опции). Якорь — время начала фразы (с) или [время, 'слово'] (кадр начинается с этого слова).
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.dirname(new URL(import.meta.url).pathname), PROJ = path.dirname(DIR);
const words = JSON.parse(fs.readFileSync(path.join(PROJ, 'timeline/words.json'), 'utf8')).words;
const VOICE = 1443.135, DURATION = +(VOICE + 1.5).toFixed(2);
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

// ---------- каст «Тот самый Новый год» ----------
const Zm = fig('Z'), T = fig('T'), KD = fig('K'), Q = fig('Q'), U = fig('U'), O = fig('O'), I = fig('I'), SN = fig('S'), OS = fig('R'), MC = fig('N');
const W0 = (x = 0) => ({ z: [1, 1.05], x: [x + 20, x - 20], y: 0 });         // единственный план для сцен с людьми: фигуры всегда одного размера
const ZOOM = (x = 0, y = 0, z = 1.8) => ({ z: [z, z + 0.08], x: [x + 10, x - 10], y });   // наезд только на предметы (без людей)
const sitCar = (o = {}) => ({ p: 'sit', y: 84, f: 1, shadow: false, ...o });
const CAR = (e = {}, extra = {}) => [Zm(170, sitCar({ e: e.Z || 'happy', ...(extra.Z || {}) })), A(280, sitCar({ e: e.A || 'neutral', ...(extra.A || {}) })), D(-365, sitCar({ e: e.D || 'neutral', ...(extra.D || {}) })), B(-220, sitCar({ e: e.B || 'smile', ...(extra.B || {}) }))];
const SHELL = (o = {}) => ({ o: 'carShell', x: 0, y: 0, s: 1, front: true, abs: true, ...o });
const CARO = (more = [], sh = {}) => [{ o: 'steering', x: 365, y: 255, s: 0.55, back: true }, { o: 'holodets', x: -293, y: 196, coat: true, s: 0.6 }, ...more, SHELL(sh)];
const KIT = { mood: 'interiorWarm' };
const LIV = (more = {}) => ({ sofa: true, ...more });
const TREE = (more = {}) => ({ o: 'tree', x: 620, y: 0, h: 300, back: true, ...more });
const amb2 = { ...amb, room: { name: 'roomtone', gain: -26 }, wind: { name: 'wind', gain: -22 }, storm: { name: 'wind', gain: -16 } };

// ================= ХОЛОДНОЕ ОТКРЫТИЕ: МАШИНА В ПОЛЕ =================
K(0.00, st('snowfield', { storm: 1 }, W0(-100), [], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#4a6a8a', lit: true }, { o: 'blink', x: 110, y: 110 }, { o: 'blink', x: -300, y: 110 }], { badge: { str: '23:57', at: 0.2 } }), { scene: 'заглохшая машина посреди снежного поля, метель', amb: amb2.storm, in: { type: 'fade', dur: 0.8 } });
K(1.84, st('carIn', { hazard: true }, W0(), [A(280, sitCar({ e: 'worried' }))], CARO([{ o: 'steering', x: 365, y: 255, s: 0.55, back: true }])), { scene: 'ты сидишь в заглохшей машине' });
K(5.26, st('carIn', { hazard: true }, W0(), [A(280, sitCar({ e: 'neutral' })), Zm(170, sitCar({ e: 'smile' }))], CARO()), { scene: 'рядом Лёха в костюме Деда Мороза' });
K(8.38, st('carIn', { hazard: true }, W0(), CAR({ A: 'neutral', Z: 'smile', B: 'smile', D: 'thinking' }), CARO([{ o: 'radio', attach: 2, s: 0.8, ay: 10, dial: 0.5 }])), { scene: 'бабушка с холодцом, дедушка крутит радио' });
K(15.32, ins('snowfield', { storm: 1 }, [{ o: 'car', x: 0, y: 0, s: 0.8, color: '#4a6a8a' }], { blur: 0, cam: { z: [1, 1.05], x: [0, 0], y: 0 }, read: [{ label: 'ДО ДОМА', value: '40 КМ', at: 0.2, y: 230 }] }), { scene: 'до дома 40 км' });
K(16.96, ins('kremlinNight', {}, [], { blur: 6, read: [{ label: 'ДО НОВОГО ГОДА', value: '3 МИНУТЫ', at: 0.2, color: '#ff6f61' }] }), { scene: 'до Нового года 3 минуты', sfx: sfx([0.2, 'tick', -12], [1.2, 'tick', -12]) });
K(19.18, face('A', 'confused', 'carIn', { so: { hazard: true } }), { scene: 'самый странный Новый год в твоей жизни' });
K(22.02, st('snowfield', { storm: 1 }, { z: [1.05, 1.0], x: [0, 0], y: 0 }, [], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#4a6a8a' }], { big: { str: '31 ДЕКАБРЯ, УТРО', at: 2.5, color: 'cream' } }), { scene: 'вернёмся на утро 31 декабря', sfx: sfx([2.5, 'whoosh', -12]) });
K(28.28, { tpl: 'title', set: 'kremlinNight' }, { in: { type: 'fade', dur: 0.5 }, bars: 'scope', scene: 'титр «Тот самый Новый год, который мы никогда не забудем»', sfx: sfx([0.05, 'stinger', -8]) });

// ================= 31 ДЕКАБРЯ: УТРО =================
K(34.64, st('bedroom', { mood: 'interiorWarm' }, W0(-120), [A(-260, { lie: -1, y: 50, e: 'sleepy' })], [{ o: 'phone', x: 60, y: 96, back: true }, { o: 'bubble', x: 360, y: 380, s: 1.0, label: '8:00', w: 160, h: 70 }]), { scene: 'не бой курантов, а мамин голос в 8 утра', amb: amb2.room, in: { type: 'dip', dur: 0.5 } });
K(40.34, face('M', 'happy', 'kitchen', { talk: [0, 5.4], so: KIT }), { scene: '«Ты проснулся? Сбегай за майонезом! И за горошком. И хлеба — две буханки»' });
K([40.34, 'горошком'], ins('kitchen', KIT, [{ o: 'paper', x: 0, y: 40, s: 2.0, w: 170, h: 200, lines: ['МАЙОНЕЗ', 'ГОРОШЕК', 'ХЛЕБ × 2'] }], { blur: 10 }), { scene: 'майонез, горошек, хлеб', sfx: sfx([0.1, 'pop', -12]) });
K(45.82, st('yardW', { mood: 'golden' }, W0(), [A(-600, { walk: { to: 100, at: 0, dur: 3.5 }, e: 'smile', prop: 'phone' })]), { scene: 'ты едешь к родителям, ты уже взрослый', amb: amb.city });
K(49.70, line('НОВЫЙ ГОД — ЭТО СВЯТОЕ', 'yardW', { so: { mood: 'golden' } }), { scene: 'но Новый год — это святое' });
K(51.86, st('kitchen', KIT, W0(200), [M(560, { p: [[0, 'holdFront'], [1.5, 'point'], [3.0, 'crossArms']], e: 'determined', f: -1 })], [{ o: 'holodets', x: 470, y: 156 }, { o: 'holodets', x: 640, y: 156, s: 0.9 }, { o: 'holodets', x: 790, y: 156, s: 0.8 }]), { scene: 'мама у плиты как полководец перед битвой', amb: amb2.room });
K(57.92, ins('kitchen', KIT, [{ o: 'holodets', x: -260, y: 156, s: 1.4, lidOff: true }, { o: 'holodets', x: -40, y: 156, s: 1.3 }, { o: 'holodets', x: 170, y: 156, s: 1.3, lidOff: true }, { o: 'holodets', x: 370, y: 156, s: 1.2 }], { blur: 0, cam: { z: [1.6, 1.65], x: [450, 440], y: 40 }, read: { value: '4 КАСТРЮЛИ', at: 0.6 } }), { scene: 'на плите 4 кастрюли' });
K(60.56, ins('kitchen', KIT, [{ o: 'pan', x: 0, y: 200, s: 2.6, sh: 2 }], { blur: 12 }), { scene: 'в духовке что-то шкварчит', sfx: sfx([0.1, 'rain', -20, { dur: 1.6 }]) });
K(62.50, ins('kitchen', KIT, [{ o: 'veg', x: 60, y: 300, s: 2.0, n: 12 }], { blur: 0, cam: { z: [1.5, 1.55], x: [60, 60], y: -140 } }), { scene: 'на подоконнике яйца, морковка, картошка в мундире' });
K(67.08, line('БУДУЩЕЕ ОЛИВЬЕ', 'kitchen', { so: KIT }), { scene: 'будущее оливье', sfx: sfx([0.1, 'ding', -12]) });
K(68.50, ins('kitchen', KIT, [{ o: 'paper', x: -700, y: 360, s: 1.0, w: 150, h: 300, lines: ['СПИСОК'] }], { blur: 0, cam: { z: [1.5, 1.55], x: [-700, -700], y: -100 }, dim: { x1: -600, y1: 360, x2: -600, y2: 660, str: '0,5 М', at: 0.8 } }), { scene: 'на холодильнике список в полметра' });
K(72.04, ins('kitchen', KIT, [{ o: 'paper', x: 0, y: 40, s: 2.2, w: 220, h: 300, lines: ['ОЛИВЬЕ', 'ШУБА', 'ХОЛОДЕЦ (БАБУШКА)', 'КУРИЦА', 'НАРЕЗКА', 'МАНДАРИНЫ', 'ШАМПАНСКОЕ'] }], { blur: 12 }), { scene: 'оливье, шуба, холодец, курица, нарезка, мандарины, шампанское', sfx: sfx([0.2, 'swish', -14]) });
K(79.24, line('НИЧЕГО НЕ ЗАБЫТЬ', 'kitchen', { so: KIT }), { scene: 'ничего не забыть' });
K(80.92, ins('kitchen', KIT, [{ o: 'paper', x: 0, y: 40, s: 2.2, w: 220, h: 200, lines: ['НЕ ТРОГАТЬ!', 'ЭТО НА', 'НОВЫЙ ГОД'], ink: '#b0222a', arrow: true }], { blur: 12 }), { scene: 'маминым почерком: «Не трогать. Это на Новый год»' });
K(88.72, ins('kitchen', { ...KIT, fridgeOpen: 1 }, [], { blur: 0, cam: { z: [1.7, 1.75], x: [-700, -700], y: 140 }, read: { value: 'КОЛБАСА, ИКРА, РЫБА', at: 0.6 } }), { scene: 'нижняя полка: колбаса, икра, красная рыба' });
K(93.46, line('ГЛАВНЫЙ ЗАКОН НОВОГОДНЕЙ КУХНИ', 'kitchen', { so: KIT }), { scene: 'главный закон новогодней кухни', sfx: sfx([0.1, 'stinger', -12]) });
K(96.20, ins('kitchen', { ...KIT, fridgeOpen: 1 }, [], { blur: 6, big: { str: 'ОСОБОЕ ПОЛОЖЕНИЕ', at: 0.6, color: 'red' } }), { scene: 'всё вкусное переходит на особое положение' });
K(101.12, ins('kitchen', KIT, [{ o: 'cross', x: -400, y: 360, s: 1.0, k: [[0.2, 0], [0.5, 1]] }, { o: 'cross', x: 0, y: 360, s: 1.0, k: [[0.9, 0], [1.2, 1]] }, { o: 'cross', x: 400, y: 360, s: 1.0, k: [[2.6, 0], [2.9, 1]] }], { blur: 14, read: [{ value: 'КОЛБАСА', at: 0.2, x: 200, y: 640 }, { value: 'СЫР', at: 0.9, x: 860, y: 640 }, { value: 'КОНФЕТЫ', at: 2.6, x: 1260, y: 640 }] }), { scene: 'колбасу нельзя, сыр нельзя, конфеты тем более', sfx: sfx([0.3, 'buzz', -14], [1.0, 'buzz', -14], [2.7, 'buzz', -14]) });
K(106.52, st('kitchen', { ...KIT, fridgeOpen: [[0, 0], [2.0, 0], [2.6, 1]] }, W0(-300), [A(-200, { walk: { to: -530, at: 0, dur: 2.0 }, p: [[0, 'stand'], [2.1, 'reach']], e: [[0, 'smirk'], [4.5, 'shocked']], f: -1 })], [], { }), { scene: 'подходишь к холодильнику, открываешь дверцу' });
K(112.80, face('M', 'angry', 'kitchen', { talk: [0, 1.9], so: KIT, ringsOn: '#ff8a7a' }), { scene: '«Не трогай, это на Новый год!» — из ванной' });
K(115.24, face('A', 'confused', 'kitchen', { so: { ...KIT, fridgeOpen: 1 } }), { scene: 'как она это делает?' });
K(116.72, line(['ЗАГАДКА', 'ДЛЯ ВСЕХ ПОКОЛЕНИЙ'], 'kitchen', { so: KIT, at: [0, 1.0], colors: ['cream', 'gold'] }), { scene: 'загадка, которую человечество не может разгадать' });

// ================= ОЛИВЬЕ =================
K(121.04, st('kitchen', KIT, W0(-60), [A(-150, { p: 'sit', e: 'determined', f: 1 })], [{ o: 'stool', x: -160, back: true }, { o: 'board', x: 60, y: 134 }, { o: 'bowl', x: 200, y: 134, s: 0.8 }], { badge: { str: 'ЗАДАЧА: ОЛИВЬЕ', at: 0.3 } }), { scene: 'главная задача на сегодня — резать оливье' });
K(124.50, st('kitchen', KIT, W0(-60), [A(-150, { p: [[0, 'sit'], [0.5, 'holdFront']], e: 'neutral', f: 1 })], [{ o: 'stool', x: -160, back: true }, { o: 'board', x: 60, y: 134 }, { o: 'veg', x: 210, y: 134, n: 12 }]), { scene: 'садишься за стол с доской и ножом, гора овощей' });
K(129.78, ins('kitchen', KIT, [{ o: 'board', x: 0, y: 200, s: 2.6 }, { o: 'knife', path: [[0, [-40, 260]], [0.25, [-40, 220]], [0.5, [-40, 260]], [0.75, [-40, 220]], [1.0, [-40, 260]], [1.25, [-40, 220]], [1.5, [-40, 260]], [1.75, [-40, 220]], [2.0, [-40, 260]], [2.25, [-40, 220]], [2.5, [-40, 260]], [2.75, [-40, 220]], [3.0, [-40, 260]], [3.25, [-40, 220]], [3.5, [-40, 260]], [3.75, [-40, 220]], [4.0, [-40, 260]]], ease: 'linear', s: 2.4, rot: -0.2 }], { blur: 12, big: { str: 'КУБИКИ, КУБИКИ, КУБИКИ', at: 2.0, top: true, color: 'cream', size: 60 } }), { scene: 'медитативный процесс: кубики, кубики, кубики', sfx: sfx([0.25, 'tick', -18], [0.75, 'tick', -18], [1.25, 'tick', -18], [1.75, 'tick', -18], [2.25, 'tick', -18], [2.75, 'tick', -18]) });
K(134.10, st('kitchen', KIT, W0(-40), [A(-150, { p: 'sit', e: 'neutral', f: 1 }), M(500, { walk: { to: 160, at: 0, dur: 1.4 }, p: [[0, 'stand'], [1.6, 'think']], e: 'thinking', f: -1, look: [[1.6, [-0.5, 0.6]]] })], [{ o: 'stool', x: -160, back: true }, { o: 'board', x: 60, y: 134 }, { o: 'bowl', x: 200, y: 134, s: 0.8 }]), { scene: 'мама заглядывает в миску' });
K(137.46, face('M', 'angry', 'kitchen', { talk: [0, 2.4], so: KIT }), { scene: '«Мельче режь! Ты что, для свиней режешь?»' });
K(140.10, ins('kitchen', KIT, [{ o: 'bowl', x: 0, y: 160, s: 2.4, fine: true }], { blur: 12, badge: { str: 'ЧЕРЕЗ 5 МИНУТ', at: 1.4 } }), { scene: 'ты режешь мельче. через пять минут…', sfx: sfx([1.4, 'tick', -12]) });
K(142.74, face('M', 'shocked', 'kitchen', { talk: [0, 2.1], so: KIT }), { scene: '«Ну куда так мелко, это же каша будет!»' });
K(145.38, st('hermitage', {}, W0(), [O(-60, { p: 'explain', e: 'smile' })], [{ o: 'bowl', x: 250, y: 120, s: 1.0 }], { badge: { str: '150+ ЛЕТ НАЗАД', at: 0.8 } }), { in: { type: 'dip', dur: 0.5 }, scene: 'оливье придумали больше полутора веков назад', amb: amb.murmur });
K(151.18, st('hermitage', {}, W0(), [O(-60, { p: 'point', e: 'smirk' })], [], { call: { p: [-60, 260], to: [380, 470], str: 'ЛЮСЬЕН ОЛИВЬЕ', at: 0.5, w: 420 }, read: { value: '«ЭРМИТАЖ»', at: 2.6 } }), { scene: 'повар-француз Люсьен Оливье, ресторан «Эрмитаж» в Москве', sfx: sfx([0.5, 'pop', -12]) });
K(157.56, ins('hermitage', {}, [{ o: 'bowl', x: 0, y: 160, s: 2.6 }], { blur: 10, read: { value: 'СОВСЕМ НЕ ПОХОЖ', at: 0.4, color: '#ff6f61' } }), { scene: 'его салат был совсем не похож на наш' });
K(160.04, ins('hermitage', {}, [], { blur: 12, read: [{ value: 'РЯБЧИКИ', at: 0.2, x: 160, y: 420 }, { value: 'РАКОВЫЕ ШЕЙКИ', at: 1.6, x: 160, y: 520 }, { value: 'КАПЕРСЫ', at: 2.9, x: 160, y: 620 }, { value: 'ЯЗЫК', at: 3.5, x: 160, y: 720 }, { label: 'СОУС:', value: 'СЕКРЕТ', at: 4.6, x: 1100, y: 560, color: '#ff6f61' }] }), { scene: 'рябчики, раковые шейки, каперсы, язык и секретный соус', sfx: sfx([0.2, 'pop', -14], [1.6, 'pop', -14], [2.9, 'pop', -14], [3.5, 'pop', -14], [4.6, 'stinger', -12]) });
K(167.56, st('hermitage', {}, W0(), [O(-60, { p: 'shrug', e: 'smirk' })]), { scene: 'говорят, он так и не раскрыл рецепт' });
K(169.92, ins('kitchen', KIT, [{ o: 'bowl', x: 0, y: 160, s: 2.6 }], { blur: 10, tint: 'memory', read: { value: 'СОВЕТСКОЕ ВРЕМЯ', at: 0.4 } }), { scene: 'наш оливье с колбасой родился в советское время' });
K([169.92, 'когда'], ins('kitchen', KIT, [{ o: 'cross', x: 0, y: 380, s: 1.2, k: [[0.4, 0], [0.8, 1]] }], { blur: 12, tint: 'memory', read: { value: 'РЯБЧИКОВ НЕТ', at: 0.2, color: '#ff6f61' } }), { scene: 'рябчиков в магазинах было не сыскать' });

// ================= ГИРЛЯНДА И ЁЛКА =================
K(178.18, st('living', LIV(), W0(), [P(-200, { p: 'sitFloor', e: 'angry', f: 1 })], [{ o: 'garland', x: -60, y: 0, tangle: true }]), { in: { type: 'dip', dur: 0.4 }, scene: 'в гостиной папа воюет с гирляндой', amb: amb2.room });
K(180.92, line('ОБЯЗАТЕЛЬНАЯ ЧАСТЬ ПРАЗДНИКА', 'living', {}), { scene: 'это тоже обязательная часть праздника' });
K(183.50, ins('living', {}, [{ o: 'box', x: -200, y: 40, s: 2.2, w: 120, h: 80 }, { o: 'garland', x: 260, y: 40, s: 2, tangle: true }], { blur: 10, read: { value: 'ЧЕСТНОЕ СЛОВО', at: 1.4 } }), { scene: 'убирали аккуратно — а в коробке клубок' });
K(194.54, st('living', LIV(), W0(), [P(-200, { p: [[0, 'sitFloor'], [1.5, 'facepalm'], [3.0, 'sitFloor']], e: 'angry', f: 1, say: { str: '#@!*%', at: 3.2, until: 6, w: 200 } })], [{ o: 'garland', x: -60, y: 0, tangle: true }], { badge: { str: '40 МИНУТ', at: 0.5 } }), { scene: 'папа распутывает уже 40 минут и ругается', sfx: sfx([3.3, 'buzz', -14]) });
K(201.20, st('living', LIV(), W0(), [P(100, { p: [[0, 'stand'], [1.0, 'reach']], e: 'happy', f: 1 })], [{ o: 'garland', x: -400, y: 360, w: 700, half: 'left', lit: [[0, 0], [2.8, 0], [2.9, 1]] }]), { scene: 'распутал, вставил в розетку…', sfx: sfx([2.8, 'blip', -10]) });
K(205.46, ins('living', {}, [{ o: 'garland', x: -600, y: 300, s: 2, w: 600, half: 'left' }], { blur: 8, read: { value: 'ГОРИТ ПОЛОВИНА', at: 0.4, color: '#ff6f61' } }), { scene: 'горит ровно половина лампочек' });
K(207.78, face('P', 'neutral', 'living', { noBlink: true }), { scene: 'папа молча смотрит на гирлянду' });
K(209.90, ins('living', {}, [{ o: 'garland', x: -600, y: 300, s: 2, w: 600, half: 'left' }], { blur: 8 }), { scene: 'гирлянда молча смотрит на папу' });
K(212.72, face('P', 'smirk', 'living', { talk: [0, 4.4] }), { scene: '«Ничего, повесим той стороной, которая горит, к людям»' });
K(217.24, st('living', LIV(), W0(150), [P(250, { p: 'reach', e: 'happy', f: 1 }), M(-100, { p: 'holdFront', e: 'smile', f: 1 }), A(-380, { p: 'holdFront', e: 'happy', f: 1 })], [TREE()]), { scene: 'ёлку ставили всей семьёй, живую' });
K(221.38, st('living', LIV(), W0(300), [], [TREE()], { tint: 'memory' }), { scene: 'пахнет хвоей и немного детством', sfx: sfx([0.2, 'shimmer', -14]) });
K(225.12, st('living', LIV(), W0(300), [M(460, { p: 'reach', e: 'smile', f: 1 })], [TREE(), { o: 'mandarin', x: 560, y: 220, r: 9, color: '#e2394f' }]), { scene: 'мама вешает стеклянные шары из своего детства' });
K(230.10, st('living', LIV(), W0(300), [P(460, { p: 'pointUp', e: 'determined', f: 1 })], [TREE({ star: true })]), { scene: 'папа водружает красную звезду' });
K(232.94, st('living', LIV(), W0(300), [], [TREE(), { o: 'cat', path: [[0, [200, 0]], [0.8, [200, 0]], [2.2, [500, 0]]], s: 1.0, mode: 'sit' }]), { scene: 'кот слезает с батареи и садится под ёлкой' });
K([232.94, 'смотрит'], ins('living', {}, [{ o: 'cat', x: -150, y: 40, s: 2.6, mode: 'sit' }, { o: 'mandarin', x: 250, y: 300, r: 30, color: '#f2c21a' }], { blur: 10, read: { value: 'ШАРИК НЕ ДОЖИВЁТ', at: 3.4, color: '#ff6f61' } }), { scene: 'кот смотрит на нижний шарик — к утру шарик не доживёт', sfx: sfx([3.4, 'boing', -14]) });
K(244.00, st('hermitage', {}, W0(), [I(-60, { p: 'explain', e: 'determined' })], [{ o: 'paper', x: 160, y: 120, s: 0.9, w: 140, h: 180, lines: ['УКАЗ'] }], { badge: { str: '300+ ЛЕТ', at: 0.6 } }), { in: { type: 'dip', dur: 0.5 }, scene: 'ёлку наряжают больше 300 лет: указ Петра Первого', amb: amb.murmur });
K([244.00, 'встречать'], st('hermitage', {}, W0(), [I(-160, { p: 'point', e: 'smile' })], [{ o: 'tree', x: 300, y: 0, h: 200, star: false, balls: false, lowBall: false }], { read: { value: '1 ЯНВАРЯ', at: 0.4 } }), { scene: 'встречать Новый год 1 января, украшать дом ветками ели' });
K(256.84, line('УДИВИТЕЛЬНАЯ ИСТОРИЯ', 'living', { so: { night: true } }), { scene: 'в советское время с ёлкой случилась удивительная история' });
K(260.68, ins('living', { night: true }, [{ o: 'tree', x: 0, y: 40, h: 280, s: 1.0, lit: 0 }, { o: 'cross', x: 0, y: 220, s: 1.4, k: [[0.5, 0], [0.9, 1]] }], { blur: 10, tint: 'memory', read: { value: '1920-Е: ЗАПРЕТ', at: 0.3, color: '#ff6f61' } }), { scene: 'в 20-х ёлку запретили' });
K(264.60, st('living', { night: true }, W0(300), [M(380, { p: 'reach', e: 'nervous', f: 1 })], [TREE({ lit: 0.3 })], { tint: 'memory', badge: { str: 'ПОЧТИ 10 ЛЕТ ТАЙКОМ', at: 0.3 } }), { scene: 'почти 10 лет ёлку ставили тайком' });
K([264.60, 'только'], st('living', {}, W0(300), [], [TREE({ star: true })], { read: { value: '1930-Е: ВЕРНУЛИ', at: 0.3 } }), { scene: 'в середине 30-х вернули, со звездой' });
K(273.08, st('living', LIV(), W0(150), [], [TREE()]), { scene: 'с тех пор она с нами каждый год' });
K(275.02, ins('living', {}, [{ o: 'vase', x: 0, y: 160, s: 2.4 }], { blur: 10 }), { scene: 'мандарины в вазе — тоже обязательные' });
K(279.02, line('ПОЧЕМУ ИМЕННО МАНДАРИНЫ?', 'living', {}), { scene: 'почему именно мандарины?' });
K(280.96, ins('kitchen', KIT, [{ o: 'mandarins', x: 0, y: 160, s: 2.4, n: 6 }], { blur: 12, tint: 'memory', read: [{ value: 'АБХАЗИЯ', at: 1.8 }, { value: 'ГРУЗИЯ', at: 6.3, x: 900 }] }), { scene: 'в советское время мандарины созревали к концу года в Абхазии и Грузии' });
K(290.64, ins('living', {}, [{ o: 'mandarin', x: 0, y: 200, s: 1, r: 90 }], { blur: 10, big: { str: 'ГЛАВНЫЙ ЗАПАХ НОВОГО ГОДА', at: 1.0, top: true, size: 64 } }), { scene: 'так мандарины стали главным запахом Нового года', sfx: sfx([1.0, 'shimmer', -12]) });
K(295.02, face('A', 'smile', 'living', { objs: [{ o: 'mandarin', x: -380, y: 300, r: 40 }] }), { scene: 'запах мандариновой корки и ощущение чуда' });

// ================= ЛЁХА — ДЕД МОРОЗ =================
K(302.86, st('kitchen', KIT, W0(-60), [A(-150, { p: [[0, 'sit'], [0.6, 'phone']], prop: 'phone', e: 'smile', f: 1 })], [{ o: 'stool', x: -160, back: true }, { o: 'bowl', x: 100, y: 134, s: 0.8 }]), { in: { type: 'dip', dur: 0.4 }, scene: 'около полудня звонит Лёха', sfx: sfx([0.2, 'phonering', -14]), amb: amb2.room });
K(305.24, st('stairwell', {}, W0(-200), [Zm(-300, { walk: { to: 100, at: 0, dur: 3.2 }, e: 'happy', prop: 'phone' })], [{ o: 'sack', attach: 0, hand: 'B', ay: 40 }]), { scene: 'Лёха подрабатывает Дедом Морозом' });
K(308.78, st('living', LIV(), W0(), [Zm(260, { p: [[0, 'wave'], [1.5, 'holdFront']], e: 'happy', f: -1 }), Q(-60, { p: 'cheer', e: 'joy' }), U(-260, { p: 'stand', e: 'smile' })], [TREE(), { o: 'sack', x: 420, y: 0 }, { o: 'mandarin', attach: 0, r: 12 }]), { scene: 'ходит по квартирам, поздравляет детей, получает мандарины' });
K(313.28, face('Z', 'nervous', 'stairwell', { talk: [0, 4.8], sweat: true, read: { value: '14 ЗАКАЗОВ', at: 2.0 } }), { scene: '«Тём, у меня сегодня 14 заказов»' });
K(318.38, st('stairwell', {}, W0(-100), [Zm(-100, { p: [[0, 'stand'], [0.6, 'fall'], [1.2, 'stand']], e: 'shocked' })]), { scene: 'два раза наступил на бороду', sfx: sfx([0.6, 'boing', -12]) });
K(320.96, st('living', LIV(), W0(), [Zm(160, { p: 'stand', e: 'worried', f: -1, beardTilt: [[0, 0], [0.6, 0.5], [1.4, 0]] }), Q(-60, { p: 'reach', e: 'smirk', f: 1 })], [TREE()]), { scene: 'один ребёнок проверял, настоящая ли борода' });
K([320.96, 'другой'], face('Q', 'joy', 'living', { talk: [0, 1.4], objs: [{ o: 'bubble', x: 420, y: 400, s: 1.4, label: 'ДИНОЗАВРА!', w: 300, h: 100 }] }), { scene: 'другой попросил живого динозавра, маленького' });
K(330.20, ins('emptyflat', {}, [], { blur: 4, read: { value: 'РОДИТЕЛИ ЛЁХИ — ДАЛЕКО', at: 0.4 } }), { scene: 'Лёхины родители живут на другом конце страны' });
K(336.92, face('Z', 'smile', 'stairwell', { talk: [1.6, 3.6] }), { scene: 'каждый год отшучивается: «я с друзьями»' });
K([338.64, 'ты'], st('emptyflat', {}, W0(), [Zm(-40, { p: 'sitFloor', e: 'sleepy' })], [{ o: 'tv', x: 400, y: 0, s: 1.0 }, { o: 'pirozhki', x: 120, y: 0, n: 3 }], { tint: 'dark' }), { scene: 'в прошлом году пельмени и сон перед телевизором в костюме', sfx: sfx([2.0, 'heartbeat', -16]) });
K(350.28, face('A', 'smile', 'kitchen', { talk: [0, 7.3], so: KIT, objs: [{ o: 'phone', x: -260, y: 380, s: 3, rot: 0.2 }] }), { scene: '«Лёх, приезжай к нам, мама на тебя оливье нарезала. Отказы не принимаются»' });
K(357.76, face('Z', [[0, 'sad'], [1.6, 'thinking']], 'stairwell', { talk: [2.6, 4.2] }), { scene: 'Лёха долго молчит, потом: «А шуба будет?»' });
K([362.4, 'будет'], face('A', 'happy', 'kitchen', { talk: [0, 0.8], so: KIT }), { scene: '«Будет»' });
K(363.92, face('Z', 'joy', 'stairwell', { talk: [0, 1.0] }), { scene: '«Тогда приеду»', sfx: sfx([0.6, 'ding', -12]) });

// ================= БАБУШКА И ДЕДУШКА =================
K(365.12, st('village', { mood: 'golden' }, W0(200), [B(-200, { p: 'holdFront', e: 'smile' }), D(-420, { p: 'stand', e: 'smile' })], [{ o: 'bag', x: -60, y: 0 }, { o: 'bag', x: -100, y: 0, color: '#c9a26a' }], { read: { value: '120 КМ', at: 2.2, y: 230 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'бабушка с дедушкой живут в деревне в 120 км', amb: amb2.wind });
K(372.02, st('winterroad', { mood: 'golden', speed: 200 }, W0(), [B(-80, { p: 'holdFront', e: 'smile' }), D(120, { p: 'stand', e: 'smile' })], [{ o: 'bag', x: -200, y: 0 }, { o: 'bag', x: -260, y: 0, color: '#c9a26a' }, { o: 'bag', x: 260, y: 0 }]), { scene: 'каждый год 31-го — рейсовый автобус и огромные сумки' });
K([372.02, 'говорит'], face('B', 'worried', 'kitchen', { talk: [0, 3.6], so: { mood: 'night' } }), { scene: '«Вы ничего не едите, кому я столько холодца наварила»' });
K(384.20, ins('kitchen', KIT, [{ o: 'holodets', x: 0, y: 160, s: 2.8 }], { blur: 12, big: { str: 'ЛЕГЕНДА СЕМЬИ', at: 0.4, top: true } }), { scene: 'бабушкин холодец — легенда семьи', sfx: sfx([0.4, 'shimmer', -12]) });
K(386.76, ins('kitchen', KIT, [0, 1, 2].map((i) => ({ o: 'box', x: -200 + i * 200, y: 40, w: 120, h: 160, s: 1.4, color: '#d9b8a0' })), { blur: 12, read: { value: 'МОЖНО СТРОИТЬ ДОМ', at: 1.6 } }), { scene: 'холодец такой крепкий, что из него можно строить дом', sfx: sfx([1.6, 'boing', -14]) });
K(392.68, ins('village', { mood: 'golden' }, [{ o: 'holodets', x: -220, y: 140, s: 2.4 }, { o: 'holodets', x: 260, y: 140, s: 2.4, coat: true }], { blur: 10 }), { scene: 'эмалированная кастрюля с отбитым краем, укутанная в пальто' });
K(400.12, st('kitchen', KIT, W0(-60), [A(-150, { p: 'phone', prop: 'phone', e: [[0, 'smile'], [1.6, 'worried']], f: 1 }), M(460, { p: 'holdFront', e: 'neutral', f: -1 })], [{ o: 'stool', x: -160, back: true }, { o: 'board', x: 60, y: 134 }], { badge: { str: '15:00', at: 0.3 } }), { scene: 'в три часа звонит бабушка, голос встревоженный', sfx: sfx([0.1, 'phonering', -12]) });
K(403.96, st('village', { storm: 1 }, W0(200), [B(160, { p: 'phone', prop: 'phone', e: 'worried', talk: [0, 5.8] })]), { scene: '«Тёма, автобус отменили, метель, дорогу замело»', amb: amb2.storm });
K(409.90, face('A', 'worried', 'kitchen', { so: KIT }), { scene: 'пауза' });
K(411.30, face('B', 'sad', 'village', { so: { storm: 1 }, talk: [3.2, 9.3] }), { scene: '«Ну ничего, Тёмочка, мы с дедом и тут посидим, вы без нас отмечайте»' });
K(421.16, st('kitchen', KIT, W0(200), [M(300, { p: [[0, 'holdFront'], [1.8, 'sit']], e: 'sad', f: -1 })], [{ o: 'stool', x: 300, back: true }]), { scene: 'мама откладывает нож и садится на табуретку' });
K(425.88, st('village', {}, W0(200), [B(100, { p: 'sit', e: 'sad' }), D(-100, { p: 'sit', e: 'sad' })], [{ o: 'stool', x: 100, back: true }, { o: 'stool', x: -100, back: true }], { badge: { str: 'НИ РАЗУ', at: 3.6 } }), { scene: 'бабушка и дедушка ни разу не встречали Новый год без вас' });
K(430.28, face('D', 'sad', 'village', { read: { value: '80+', at: 0.2 } }), { scene: 'а им уже за 80' });
K(431.84, st('kitchen', KIT, W0(), [M(300, { p: 'sit', e: 'sad', f: -1 }), A(-150, { p: 'stand', e: 'sad', f: 1 }), P(80, { p: 'stand', e: 'sad', f: 1 })], [{ o: 'stool', x: 300, back: true }]), { scene: 'никто не говорит вслух' });
K(435.82, line(['СКОЛЬКО ЕЩЁ ТАКИХ ПРАЗДНИКОВ', 'У ВАС ОСТАЛОСЬ ВМЕСТЕ?'], 'kitchen', { so: KIT, at: [0, 0.8], colors: ['cream', 'gold'], size: 66 }), { scene: 'сколько ещё праздников осталось вместе?', sfx: sfx([0.2, 'heartbeat', -12]) });
K(439.50, st('kitchen', KIT, W0(-20), [A(80, { p: 'stand', e: 'thinking', f: 1, look: [0.6, -0.3] })]), { scene: 'смотришь в окно — снега почти нет' });
K(442.94, ins('kitchen', KIT, [], { blur: 6, read: [{ value: '15:00', at: 0.2 }, { value: '120 КМ', at: 2.6, x: 900 }] }), { scene: 'смотришь на часы: три часа дня. 120 километров', sfx: sfx([0.2, 'tick', -12]) });
K(447.38, bp('start', { ats: [9, 9, 9, 9], lbl: '19:00 — ДЕРЕВНЯ, 22:00 — ДОМА', lblAt: 0.3 }), { scene: 'к семи в деревне, к десяти обратно' });
K(452.28, face('A', 'determined', 'kitchen', { so: KIT }), { scene: 'ты успеваешь', sfx: sfx([0.2, 'ding', -12]) });
K(455.00, face('A', 'determined', 'kitchen', { talk: [0, 2.5], so: KIT, fx: -60 }), { scene: '«Мам, я за ними съезжу»' });
K(457.56, face('M', 'worried', 'kitchen', { talk: [0, 4.3], so: KIT }), { scene: 'мама возражает: метель, дорога, Новый год, оливье' });
K(462.40, st('kitchen', KIT, W0(), [P(160, { p: 'reach', e: 'neutral', f: -1 }), A(-80, { p: 'reach', e: 'smile', f: 1 })], [{ o: 'key', attach: 0, s: 0.6 }]), { scene: 'папа молча протягивает ключи от старой машины', sfx: sfx([0.6, 'blip', -12]) });
K(465.92, face('P', 'neutral', 'kitchen', { talk: [0, 4.9], so: KIT }), { scene: '«Она проходимее твоей. Только аккуратно. Цепи в багажнике»' });

// ================= ЛЁХА ЕДЕТ С ТОБОЙ =================
K(471.16, st('yardW', {}, W0(-200), [A(-200, { p: 'phone', prop: 'phone', e: 'neutral', f: 1 })], [{ o: 'car', x: 300, y: 0, s: 1.0, color: '#4a6a8a' }]), { scene: 'в последний момент звонит Лёха', sfx: sfx([0.1, 'phonering', -12]), amb: amb.city });
K(474.04, face('Z', 'happy', 'stairwell', { talk: [0, 4.4] }), { scene: '«Тём, отменился последний заказ, ребёнок заболел. Я свободен. Где ты?»' });
K([474.04, 'еду'], face('A', 'neutral', 'yardW', { talk: [0, 3.6] }), { scene: '«Еду в деревню за бабушкой с дедушкой»' });
K(482.18, face('Z', [[0, 'thinking'], [1.6, 'determined']], 'stairwell', { talk: [2.0, 3.6] }), { scene: 'Лёха молчит секунду: «Подожди меня у подъезда»' });
K(485.84, st('yardW', {}, W0(0), [Zm(-700, { walk: { to: 80, at: 0, dur: 3.4, run: true }, e: 'happy' })], [{ o: 'car', x: 300, y: 0, s: 1.0, color: '#4a6a8a', driver: true, driverColor: '#ee7a2b' }, { o: 'sack', attach: 0, hand: 'B', ay: 40 }], { badge: { str: '+20 МИНУТ', at: 0.3 } }), { scene: 'через 20 минут Лёха в полном костюме Деда Мороза' });
K(491.62, st('yardW', {}, W0(0), [Zm(0, { p: 'holdFront', e: 'smile' })], [{ o: 'sack', x: -150, y: 0 }, { o: 'staff', attach: 0, ay: 120 }], { call: { p: [-150, 60], to: [-500, 420], str: 'МЕШОК', at: 0.3, w: 240 } }), { scene: 'с мешком, с посохом — переодеться не успел' });
K(495.24, st('carIn', { storm: false }, W0(), [A(280, sitCar({ e: 'smirk' })), Zm(170, sitCar({ e: 'happy', talk: [0, 4.4] }))], CARO().slice(0, 1)), { scene: '«Ну что, Снегурочка? Поехали за подарками» — басом' });
K(499.70, st('tvstudio', {}, W0(), [SN(-60, { p: 'wave', e: 'smile' })], [], { read: { value: 'НАША, РУССКАЯ ПРИДУМКА', at: 0.6 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'Снегурочка — чисто наша придумка', amb: amb.murmur });
K(503.34, st('tvstudio', {}, W0(), [SN(-200, { p: 'stand', e: 'smile' }), X(200, { p: 'shrug', e: 'confused', f: -1 })], [], { read: { value: 'У САНТЫ ВНУЧКИ НЕТ', at: 0.4, color: '#ff6f61' } }), { scene: 'ни у одного Санта-Клауса нет внучки' });
K(506.76, st('yardW', { flakes: 60 }, W0(), [SN(80, { p: 'stand', e: 'happy' })], [], { tint: 'memory' }), { scene: 'девочка, слепленная из снега, из старинных сказок' });
K(511.18, st('tvstudio', {}, W0(), [OS(-260, { p: 'explain', e: 'smile' }), SN(200, { p: 'wave', e: 'happy', f: -1 })], [], { call: { p: [-260, 260], to: [-260, 470], str: 'А. Н. ОСТРОВСКИЙ', at: 0.6, w: 460 }, read: { value: '1873', at: 5.4 } }), { scene: 'драматург Островский, пьеса «Снегурочка», 1873', sfx: sfx([5.4, 'pop', -12]) });
K(520.16, st('club', {}, W0(), [Zm(-120, { p: 'wave', e: 'happy' }), SN(120, { p: 'wave', e: 'happy' }), KD(-400, { p: 'cheer', e: 'joy' }), KD(380, { p: 'cheer', e: 'joy' })]), { scene: 'на ёлки вместе с Дедом Морозом — с советского времени; ни один утренник без неё' });

// ================= ДОРОГА В ДЕРЕВНЮ =================
K(529.68, st('winterroad', { storm: 0.6, speed: 260 }, W0(), [], [{ o: 'car', x: 0, y: 0, s: 1.0, color: '#4a6a8a', lights: true, driver: true, driverColor: '#ee7a2b' }], { read: { value: '4 ЧАСА ВМЕСТО 2', at: 0.6, y: 230 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'дорога занимает 4 часа вместо двух', amb: amb2.storm });
K(533.40, st('winterroad', { storm: 1.2, speed: 160 }, W0(), [], [{ o: 'car', x: 0, y: 0, s: 1.0, color: '#4a6a8a', lights: true }]), { scene: 'чем дальше от города, тем сильнее метель' });
K(535.90, st('carIn', { storm: true, fog: 0.4 }, W0(), [A(280, sitCar({ e: 'nervous' })), Zm(170, sitCar({ e: 'neutral' }))], CARO().slice(0, 1)), { scene: 'дворники не справляются, едете медленно' });
K(541.26, st('carIn', {}, W0(), [A(280, sitCar({ e: 'smile' })), Zm(170, sitCar({ e: 'joy', talk: [0, 6], p: [[0, 'sit'], [1.0, 'explain'], [3.0, 'sit']] }))], CARO().slice(0, 1)), { scene: 'Лёха развлекает: поёт басом, рассказывает истории' });
K(548.14, face('Z', 'smirk', 'carIn', { talk: [0, 8.2] }), { scene: '«Если остановят — скажу, что везу подарки детям. Деда Мороза не оштрафуют»' });

// ================= ДЕРЕВНЯ =================
K(557.02, st('village', {}, W0(200), [], [{ o: 'car', x: -650, y: 0, s: 1.0, color: '#4a6a8a', lights: true }], { badge: { str: '19:00', at: 0.3 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'приезжаете около семи: дом в снегу, тёплые окна, дым из трубы', amb: amb2.wind });
K(567.30, st('village', { doorOpen: true }, W0(100), [B(220, { walk: { to: 60, at: 0, dur: 1.2, run: true }, e: [[0, 'surprised'], [1.6, 'joy']], f: -1 })], [{ o: 'car', x: -650, y: 0, s: 1.0, color: '#4a6a8a' }]), { scene: 'бабушка выбегает на крыльцо в платке и тапочках' });
K(571.26, st('village', { doorOpen: true }, W0(-100), [B(60, { p: [[0, 'stand'], [1.0, 'handsOnHead'], [2.5, 'cheer']], e: [[0, 'surprised'], [1.0, 'awe']], f: -1 }), Zm(-420, { p: 'wave', e: 'happy', f: 1 })], [{ o: 'car', x: -650, y: 0, s: 1.0, color: '#4a6a8a' }, { o: 'sack', x: -560, y: 0 }]), { scene: 'видит Деда Мороза с мешком и всплёскивает руками' });
K(576.74, face('B', 'joy', 'village', { talk: [0, 3.2] }), { scene: '«Батюшки! Дед! Иди сюда! К нам Дед Мороз приехал!»' });
K([578.82, 'дедушка'], st('village', { doorOpen: true }, W0(-100), [D(120, { walk: { to: -60, at: 0, dur: 1.2 }, p: [[0, 'stand'], [1.4, 'think']], e: 'thinking', f: -1, look: [0.3, -0.3] }), Zm(-380, { p: 'stand', e: 'smile', f: 1 })]), { scene: 'дедушка долго разглядывает Лёху, бороду и красный халат' });
K(587.08, face('D', 'confused', 'village', { talk: [0, 6.4] }), { scene: '«Мороз, ты это… чего так поздно-то? Мы тебя с прошлого года ждём»' });
K(593.60, face('Z', 'smirk', 'village', { talk: [3.0, 6.0] }), { scene: 'Лёха басом: «Пробки, дедушка, пробки»', sfx: sfx([5.8, 'boing', -16]) });
K(599.70, st('village', { mood: 'interiorWarm' }, W0(200), [B(80, { walk: { to: 420, at: 0, dur: 2 }, p: 'carry', e: 'determined' })], [{ o: 'bag', attach: 0, ay: 30 }], { badge: { str: 'СБОРЫ: 1 ЧАС', at: 0.3 } }), { scene: 'сборы занимают час — бабушка не может уехать просто так' });
K(603.84, ins('village', {}, [{ o: 'holodets', x: -560, y: 140, s: 1.6 }, { o: 'pirozhki', x: -250, y: 140, s: 1.6, when: [1.6, 99] }, { o: 'jar', x: 30, y: 140, s: 1.8, when: [3.0, 99] }, { o: 'jar', x: 230, y: 140, s: 1.6, when: [3.8, 99] }, { o: 'pirozhki', x: 470, y: 140, s: 1.4, when: [5.0, 99] }, { o: 'socks', x: 680, y: 160, s: 2, color: '#3fb950', when: [6.8, 99] }], { blur: 10 }), { scene: 'холодец, пирожки с капустой, огурцы, варенье, пирожки с яблоками, вязаные подарки', sfx: sfx([1.6, 'pop', -14], [3.0, 'pop', -14], [3.8, 'pop', -14], [5.0, 'pop', -14], [6.8, 'pop', -14]) });
K(614.06, st('village', {}, W0(-200), [A(-300, { walk: { to: -520, at: 0, dur: 1.6 }, p: 'bagHeavy', e: 'nervous' })], [{ o: 'car', x: -650, y: 0, s: 1.0, color: '#4a6a8a' }, ...[0, 1, 2, 3, 4, 5].map((i) => ({ o: 'bag', x: -860 + i * 50, y: 0, s: 0.9, color: i % 2 ? '#c9a26a' : '#efe9df' })), { o: 'bag', attach: 0, ay: 50 }], { timer: { from: 1, to: 7, t0: 0.4, t1: 2.8, suf: ' СУМОК', ease: false } }), { scene: 'выносишь сумки — семь штук' });
K(617.90, face('A', 'confused', 'village', { talk: [0, 2.0] }), { scene: '«Бабуль, мы же всего на пару дней»' });
K(620.02, face('B', 'determined', 'village', { talk: [1.6, 3.0] }), { scene: 'бабушка непреклонна: «А вдруг там есть нечего?»' });

// ================= ОБРАТНО: МЕТЕЛЬ =================
K([620.02, 'девять'], st('winterroad', { mood: 'night', storm: 1.3, speed: 120 }, W0(), [], [{ o: 'car', x: 0, y: 0, s: 1.0, color: '#4a6a8a', lights: true }], { badge: { str: '21:00', at: 0.2 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'в девять выезжаете, метель разыгралась вовсю', amb: amb2.storm });
K(628.94, st('carIn', { fog: 0.5 }, W0(), [A(280, sitCar({ e: 'determined', p: 'holdFront' }))], CARO().slice(0, 1)), { scene: 'дороги почти не видно, ты вцепился в руль' });
K(632.72, st('carIn', {}, W0(), CAR({ A: 'determined', Z: 'smile', B: 'smile', D: 'neutral' }), CARO([{ o: 'pirozhki', attach: 0, s: 0.6, ay: 10 }])), { scene: 'Лёха с пирожками, бабушка с дедушкой и холодец в пальто' });
K(644.62, face('D', 'smile', 'carIn', { talk: [0, 9.0], tint: 'memory', read: { label: '1960-Е:', value: '20 ЧЕЛОВЕК — 1 МАНДАРИН', at: 3.6 } }), { scene: 'дедушка рассказывает про общежитие в 60-х' });
K(654.14, st('carIn', {}, W0(), CAR({ A: 'smile', Z: 'joy', B: 'happy', D: 'smile' }, { Z: { talk: [0, 4.4], p: [[0, 'sit'], [0.4, 'explain']] } }), CARO()), { scene: 'Лёха рассказывает про сегодняшние заказы' });
K(658.64, st('living', LIV(), W0(), [Zm(200, { p: 'handsOnHead', e: 'shocked', f: -1 })], [{ o: 'cat', path: [[0, [-200, 0]], [2.6, [-500, 0]]], s: 1.3, color: '#8a6a4a', mode: 'swipe' }, { o: 'sack', path: [[0, [-120, 0]], [2.6, [-430, 0]]] }], { tint: 'memory' }), { scene: 'огромный дог утащил мешок под диван', sfx: sfx([0.4, 'swish', -12]) });
K(663.78, st('living', LIV(), W0(), [Zm(200, { p: 'wave', e: 'nervous', f: -1 }), P(-200, { p: 'point', e: 'joy', f: 1, say: { str: 'ЛЁХА МОРОЗ!', at: 1.0, w: 300, until: 6 } })], [TREE()], { tint: 'memory' }), { scene: 'папа ребёнка — бывший одноклассник: «Лёха Мороз!»' });
K(670.58, st('living', LIV(), W0(), [Zm(200, { p: 'shrug', e: 'nervous', f: -1 }), U(-80, { p: 'point', e: 'thinking', f: 1, say: { str: 'ПАХНЕТ ШАУРМОЙ?', at: 0.8, w: 340, until: 6 } })], [TREE()], { tint: 'memory' }), { scene: 'девочка: почему от Деда Мороза пахнет шаурмой?' });
K(675.80, st('carIn', {}, W0(), CAR({ A: 'happy', Z: 'joy', B: 'joy', D: 'happy' }, { B: { jit: 2 } }), CARO([{ o: 'holodets', x: -293, y: 196, coat: true, s: 0.6, sh: [[0.6, 6], [1.4, 0]] }]).slice(0, 1).concat([{ o: 'holodets', x: -293, y: 196, coat: true, s: 0.6, sh: [[0.6, 6], [1.4, 0]] }])), { scene: 'бабушка смеётся так, что чуть не роняет холодец', sfx: sfx([0.6, 'boing', -14]) });
K(679.22, st('carIn', {}, W0(), CAR({ A: 'smile', Z: 'happy', B: 'smile', D: 'joy' }, { D: { p: [[0, 'sit'], [0.4, 'reach']], talk: [2.3, 6.6] } }), CARO()), { scene: 'дедушка хлопает Лёху по плечу: «Хороший ты парень, Мороз!»' });

// ================= МАШИНА ГЛОХНЕТ =================
K(685.82, st('snowfield', { storm: 1.3 }, W0(-100), [], [{ o: 'car', path: [[0, [-700, 0]], [5.0, [-100, 0]], [6.4, [-80, 0]]], ease: 'out', s: 1.0, color: '#4a6a8a', lights: true, sh: [[6.0, 6], [7.4, 0]] }], { badge: { str: '23:30', at: 0.3 } }), { scene: 'посреди поля машина дёргается, чихает и глохнет', sfx: sfx([6.2, 'glitch', -8, { pitch: 0.6 }]) });
K(694.18, ins('carIn', {}, [{ o: 'key', x: 0, y: 300, s: 4, rotKey: [[0, 0], [0.4, 0.8], [1.0, 0], [1.4, 0.8], [2.0, 0]] }], { blur: 10 }), { scene: 'поворачиваешь ключ — стартер скрипит', sfx: sfx([0.4, 'glitch', -10, { pitch: 0.5 }], [1.4, 'glitch', -10, { pitch: 0.5 }]) });
K(698.32, face('A', [[0, 'determined'], [1.2, 'nervous'], [2.0, 'worried']], 'carIn', {}), { scene: 'ещё раз. ещё. тишина', sfx: sfx([0.1, 'glitch', -12, { pitch: 0.5 }], [1.0, 'glitch', -14, { pitch: 0.4 }]) });
K(701.40, st('carIn', {}, W0(), CAR({ A: 'worried', Z: 'worried', B: 'worried', D: 'worried' }), CARO()), { scene: 'только ветер и метель за окном', sfx: sfx([0.2, 'wind', -14, { dur: 2 }]) });
K(704.02, st('snowfield', { storm: 1.2 }, W0(-100), [A(160, { walk: { to: 340, at: 0, dur: 2 }, e: 'worried', f: 1, y: -14 })], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#4a6a8a' }], { read: { value: 'СНЕГ ПО КОЛЕНО', at: 1.6, y: 230 } }), { scene: 'выходишь — снег по колено, ни огонька' });
K(709.34, ins('snowfield', { storm: 1 }, [{ o: 'phone', x: 0, y: 100, s: 7, label: '▂', screen: '#8fd3ff', sh: 1 }], { blur: 10 }), { scene: 'одна полоска связи' });
K(713.86, face('A', 'worried', 'snowfield', { so: { storm: 1 }, talk: [1.5, 6.4], objs: [{ o: 'phone', x: -260, y: 380, s: 3, rot: 0.2 }] }), { scene: '«Мам, мы застряли. Все живы, не волнуйтесь»' });
K(720.46, ins('snowfield', { storm: 1 }, [{ o: 'phone', x: 0, y: 100, s: 7, label: '×', screen: '#ff6f61' }], { blur: 10 }), { scene: 'и связь обрывается', sfx: sfx([0.2, 'buzz', -10]) });

// ================= БЕЗ ТРЁХ МИНУТ ПОЛНОЧЬ =================
K(722.38, st('snowfield', { storm: 1 }, W0(-100), [], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#4a6a8a', lit: true }, { o: 'blink', x: 110, y: 110 }, { o: 'blink', x: -300, y: 110 }], { badge: { str: '23:57', at: 0.4 } }), { scene: 'и вот мы снова там, откуда начали', in: { type: 'flash', dur: 0.3 }, amb: amb2.storm });
K(729.44, st('carIn', { hazard: true }, W0(), CAR({ A: 'neutral', Z: 'smile', B: 'smile', D: 'neutral' }), CARO()), { scene: 'прохладно, аварийка, бабушка укутала всех в шарфы' });
K(736.92, st('carIn', { hazard: true }, W0(), CAR({ A: 'neutral', Z: 'neutral', B: 'neutral', D: 'determined' }), CARO([{ o: 'radio', attach: 2, s: 0.8, ay: 10, dial: [[0, 0], [3, 2.5], [9, 3.2]] }])), { scene: 'дедушка крутит радио: шипение, треск…', sfx: sfx([0.4, 'glitch', -16], [2.0, 'glitch', -16]) });
K([736.92, 'вдруг'], ins('kremlinNight', {}, [], { blur: 3 }), { scene: 'сквозь помехи — голос диктора и звук, который все узнают', sfx: sfx([0.4, 'riser', -14]) });
K(747.44, st('kremlinNight', {}, { z: [1.1, 1.2], x: [0, 0], y: -320 }, [], [], { big: { str: 'КУРАНТЫ', at: 0.1, top: true } }), { scene: 'куранты', sfx: sfx([0.1, 'clock', -8]) });
K(748.48, face('B', 'joy', 'carIn', { talk: [0, 2.0] }), { scene: '«Дед, поймал!» — кричит бабушка' });
K(751.12, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'surprised', Z: 'joy', B: 'happy', D: 'smile' }, { Z: { p: [[0, 'sit'], [1.0, 'holdFront']] } }), CARO([{ o: 'mandarins', attach: 0, n: 6, s: 0.7, when: [2.4, 99] }])), { scene: 'Лёха достаёт из мешка — мандарины! Целый пакет', sfx: sfx([2.4, 'ding', -10]) });
K(758.52, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'happy', Z: 'joy', B: 'smile', D: 'smile' }, { D: { p: [[0, 'sit'], [1.6, 'holdFront']] } }), CARO([{ o: 'pirozhki', attach: 3, s: 0.6, ay: 10 }, { o: 'thermos', attach: 2, s: 0.7, ay: 20, when: [2.2, 99] }])), { scene: 'бабушка разворачивает пирожки, дедушка достаёт термос' });
K(765.08, ins('carIn', { warm: true }, [0, 1, 2, 3].map((i) => ({ o: 'pcup', x: -300 + i * 200, y: 240, s: 2.2, when: [0.4 + i * 0.5, 99] })), { blur: 10 }), { scene: 'и раздаёт пластиковые стаканчики, которые всегда возит с собой' });
K(770.34, face('Z', 'determined', 'carIn', { talk: [1.8, 5.0], so: { warm: true } }), { scene: 'Лёха басом: «Так, у каждого желание. Пишем»' });
K(775.34, ins('carIn', { warm: true }, [{ o: 'notebook', x: 0, y: 220, s: 3.4 }], { blur: 10 }), { scene: 'блокнот, в котором дети писали ему письма', sfx: sfx([0.4, 'swish', -14]) });
K(779.66, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'thinking', Z: 'determined', B: 'thinking', D: 'thinking' }, { A: { p: 'holdFront' }, B: { p: 'holdFront' }, D: { p: 'holdFront' } }), CARO()), { scene: 'вырываете листочки, пишете желания' });
K(782.50, face('A', [[0, 'thinking'], [3.2, 'smile']], 'carIn', { so: { warm: true } }), { scene: 'ты в последнюю секунду пишешь одно слово', sfx: sfx([3.2, 'swish', -14]) });
K(787.88, bp('start', { ats: [9, 9, 9, 9], lbl: 'ЖЕЛАНИЕ → ПЕПЕЛ → БОКАЛ → 12 УДАРОВ', lblAt: 0.3 }), { scene: 'традиция: написать желание, сжечь, пепел в бокал, выпить до 12-го удара' });
K(798.26, st('kremlinNight', { fireworks: true }, { z: [1.0, 1.05], x: [0, 0], y: 0 }, [], [], { read: { value: 'МИЛЛИОНЫ ПЫТАЮТСЯ', at: 1.4, y: 230 } }), { scene: 'успеть почти невозможно, но миллионы пытаются' });
K(804.82, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'smirk', Z: 'smirk', B: 'smile', D: 'smile' }, { Z: { p: 'shrug' } }), CARO()), { scene: 'жечь бумажки в машине — плохая идея, прячете в карманы' });

// ================= БОЙ КУРАНТОВ =================
K(812.02, st('kremlinNight', {}, { z: [1.15, 1.18], x: [0, 0], y: -320 }, [], [], { big: { str: 'БОМ!', at: 0, top: true } }), { scene: 'первый удар', in: { type: 'flash', dur: 0.2 }, sfx: sfx([0, 'clock', -6]) });
K(814.44, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'smile', Z: 'happy', B: 'happy', D: 'smile' }), CARO()), { scene: 'сидите в тесной машине, прижавшись друг к другу' });
K(817.80, face('B', 'happy', 'carIn', { so: { warm: true }, read: { value: '2', at: 0, color: '#ffd47e' } }), { scene: 'бом! бабушка держит дедушку за руку', sfx: sfx([0, 'clock', -8]) });
K(821.24, face('Z', 'joy', 'carIn', { so: { warm: true }, beardTilt: 0.6, read: { value: '3', at: 0 } }), { scene: 'бом! Лёха в съехавшей набок бороде', sfx: sfx([0, 'clock', -8]) });
K(824.70, face('A', [[0, 'smile'], [2.0, 'awe']], 'carIn', { so: { warm: true }, zoom: 0.1, read: { value: '4', at: 0 } }), { scene: 'бом! ничего лучше в жизни ещё не было', sfx: sfx([0, 'clock', -8]) });
K(831.14, st('carIn', { storm: true, warm: true }, W0(), CAR({ A: 'smile', Z: 'joy', B: 'happy', D: 'smile' }), CARO(), { timer: { from: 5, to: 9, t0: 0, t1: 4.2, suf: '', ease: false } }), { scene: 'бом! бом! бом! за окном метель', sfx: sfx([0, 'clock', -10], [1.5, 'clock', -10], [1.9, 'clock', -10], [3.6, 'clock', -10], [4.2, 'clock', -10]) });
K(835.68, ins('carIn', { warm: true }, [{ o: 'mandarins', x: -200, y: 220, s: 2.2, n: 5 }, { o: 'pirozhki', x: 260, y: 220, s: 2.2 }], { blur: 10, timer: { from: 10, to: 12, t0: 2.7, t1: 3.6, suf: '', ease: false } }), { scene: 'в салоне пахнет мандаринами и пирожками. бом! бом!', sfx: sfx([2.8, 'clock', -8], [3.4, 'clock', -8]) });
K(840.64, st('carIn', { hazard: true, warm: true, fog: 0.6 }, W0(), CAR({ A: 'joy', Z: 'joy', B: 'joy', D: 'joy' }, { A: { talk: [0, 1.5] }, Z: { talk: [0, 1.5], p: 'cheer' }, B: { talk: [0, 1.5] }, D: { talk: [0, 1.5] } }), CARO(), { big: { str: 'С НОВЫМ ГОДОМ!', at: 0.1, top: true } }), { in: { type: 'flash', dur: 0.3 }, scene: '«С Новым годом!» — стёкла запотевают', sfx: sfx([0.1, 'cheer', -10], [0.2, 'stinger', -10]) });
K(844.96, ins('carIn', { warm: true, fog: 0.6 }, [0, 1, 2, 3].map((i) => ({ o: 'pcup', path: [[0, [-420 + i * 280, 220]], [0.6, [-60 + i * 40, 300]], [1.2, [-420 + i * 280, 220]]], s: 2.2 })), { blur: 10 }), { scene: 'стукаетесь стаканчиками с чаем', sfx: sfx([0.6, 'ding', -10]) });
K(847.74, st('carIn', { hazard: true, warm: true, fog: 0.6 }, W0(), CAR({ A: 'happy', Z: 'joy', B: 'cry', D: 'happy' }, { A: { p: 'reach', f: -1 }, Z: { p: 'reach', f: -1 }, B: { p: 'reach' }, D: { p: 'reach' } }), CARO()), { scene: 'обнимаетесь, неловко, через сиденье. бабушка плачет и смеётся' });
K(853.14, face('D', 'happy', 'carIn', { so: { warm: true } }), { scene: 'дедушка целует бабушку в щёку', sfx: sfx([0.6, 'pop', -16]) });
K(854.98, face('Z', 'determined', 'carIn', { talk: [2.1, 8.3], so: { warm: true } }), { scene: '«Дед Мороз разрешает всем съесть по мандарину. Новый год уже наступил»' });
K(863.48, st('carIn', { hazard: true, warm: true, fog: 0.5 }, W0(-200), CAR({ A: 'smile', Z: 'smile', B: 'smile', D: 'thinking' }, { D: { look: [-0.8, -0.3], f: -1 } }), CARO()), { scene: 'дедушка смотрит в запотевшее окно' });
K(869.90, face('D', 'smile', 'carIn', { talk: [0, 3.3], so: { warm: true }, read: { value: '82 НОВЫХ ГОДА', at: 1.2 } }), { scene: '«У меня было 82 Новых года»' });
K(873.54, st('carIn', {}, W0(), [D(-255, sitCar({ e: 'smile' }))], [{ o: 'mandarin', x: -130, y: 250, r: 12 }], { tint: 'memory', read: [{ value: 'ОБЩЕЖИТИЕ', at: 0.2, x: 200, y: 300 }, { value: 'КАЗАРМА', at: 2.3, x: 760, y: 300 }, { value: 'РОДДОМ', at: 4.0, x: 1300, y: 300 }] }), { scene: 'общежитие, армия, роддом под окнами, когда родился твой папа' });
K(881.02, face('D', 'joy', 'carIn', { talk: [0, 7.8], so: { warm: true } }), { scene: '«…но в машине посреди поля с Дедом Морозом — впервые. Жизнь до конца удивляет»' });

// ================= ТРАКТОР =================
K(889.06, st('snowfield', { storm: 0.8, lights: true, lightsK: 0.2, lightsX: 700 }, W0(-200), [], [{ o: 'car', x: -300, y: 0, s: 1.0, color: '#4a6a8a', lit: true }, { o: 'blink', x: -90, y: 110 }], { }), { scene: 'вдали в поле появляется свет — два жёлтых огня', sfx: sfx([0.4, 'riser', -14]) });
K(893.82, st('snowfield', { storm: 0.8, lights: true, lightsK: [[0, 0.3], [4.8, 0.8]], lightsX: 600 }, W0(-200), [], [{ o: 'car', x: -300, y: 0, s: 1.0, color: '#4a6a8a', lit: true }]), { scene: 'огни приближаются, раскачиваясь в метели' });
K(897.24, st('carIn', { hazard: true, lights: true, lightsK: 0.9 }, W0(), CAR({ A: 'surprised', Z: 'surprised', B: 'scared', D: 'surprised' }), CARO()), { scene: 'вы замираете, свет ярче, рокот мотора', sfx: sfx([2.6, 'hum', -10, { dur: 2.5, pitch: 0.5 }]) });
K(902.86, st('snowfield', { storm: 0.7 }, W0(), [], [{ o: 'car', x: -500, y: 0, s: 1.0, color: '#4a6a8a', lit: true }, { o: 'tractor', path: [[0, [900, 0]], [4.0, [250, 0]]], ease: 'out', s: 1.2, lights: true, lit: true, driver: true, flip: true }]), { scene: 'из метели выезжает огромный трактор с гирляндой на кабине', sfx: sfx([0, 'hum', -8, { dur: 4, pitch: 0.5 }]) });
K(908.64, st('snowfield', { storm: 0.6 }, W0(), [T(300, { walk: { to: -200, at: 0.4, dur: 2.6 }, e: 'neutral', f: -1 })], [{ o: 'car', x: -500, y: 0, s: 1.0, color: '#4a6a8a', lit: true }, { o: 'tractor', x: 450, y: 0, s: 1.2, lights: true, lit: true, flip: true, back: true }]), { scene: 'из трактора вылезает мужик в тулупе и ушанке' });
K(911.90, st('carIn', { hazard: true, lights: true, lightsK: 0.6 }, W0(), CAR({ A: 'surprised', Z: 'smile', B: 'surprised', D: 'surprised' }), CARO([{ o: 'thermos', attach: 2, s: 0.7, ay: 20 }]), { }), { scene: 'стучит в окно, заглядывает внутрь', sfx: sfx([0.6, 'hit', -12], [0.9, 'hit', -12]) });
K(915.58, face('T', [[0, 'neutral'], [2.0, 'surprised'], [4.0, 'awe']], 'snowfield', { so: { storm: 0.5 }, look: [[0, [0.6, 0]], [1.2, [0.2, 0]], [2.4, [-0.2, 0]], [3.4, [-0.6, 0]]] }), { scene: 'видит тебя, бабушку с холодцом, дедушку с термосом и Деда Мороза' });
K(922.10, face('T', 'confused', 'snowfield', { so: { storm: 0.5 }, talk: [1.6, 11.0] }), { scene: '«Ну дела. С Новым годом, что ли? Гляжу — аварийка мигает. Дед Мороз-то настоящий?»' });
K(933.68, face('Z', 'smirk', 'carIn', { talk: [1.3, 1.9] }), { scene: 'Лёха басом: «А то»', sfx: sfx([1.9, 'ding', -14]) });
K(936.30, st('winterroad', { mood: 'night', storm: 0.4, speed: 120 }, W0(), [], [{ o: 'tractor', x: 300, y: 0, s: 1.1, lights: true, lit: true }, { o: 'car', x: -330, y: 0, s: 1.0, color: '#4a6a8a', lit: true }], { read: { value: '3 КМ', at: 2.2, y: 230 } }), { scene: 'тракторист тащит вас тросом в свою деревню, всего 3 км' });

// ================= ДЕРЕВЕНСКИЙ КЛУБ =================
K(942.04, st('club', {}, W0(), [KD(-500, { p: 'dance', e: 'joy' }), KD(-300, { p: 'cheer', e: 'happy' }), X(100, { p: 'talk', e: 'happy' }), KD(300, { p: 'cheer', e: 'joy' })]), { in: { type: 'dip', dur: 0.4 }, scene: 'в деревенском клубе вовсю идёт праздник', amb: amb.murmur });
K(947.20, st('club', {}, W0(200), [KD(-200, { p: 'wave', e: 'happy' }), KD(0, { p: 'cheer', e: 'joy' }), KD(200, { p: 'wave', e: 'smile' })], [], { read: [{ value: 'МУЗЫКА', at: 0.2, x: 160, y: 200 }, { value: 'ЁЛКА ДО ПОТОЛКА', at: 2.4, x: 160, y: 300 }, { value: 'СНЕЖИНКИ', at: 3.8, x: 160, y: 400 }] }), { scene: 'музыка, столы, ёлка до потолка, дети-снежинки' });
K(952.08, st('club', {}, W0(-200), [T(-700, { walk: { to: -450, at: 0, dur: 1.4 }, e: 'smile' }), Zm(-900, { walk: { to: -650, at: 0.6, dur: 1.6 }, e: 'happy' }), KD(-100, { p: [[0, 'stand'], [2.4, 'cheer']], e: [[0, 'surprised'], [2.4, 'joy']], f: -1 }), KD(100, { p: [[0, 'stand'], [2.6, 'jump']], e: [[0, 'surprised'], [2.6, 'joy']], f: -1 })], [{ o: 'sack', attach: 1, hand: 'B', ay: 40 }]), { scene: 'заходит настоящий Дед Мороз — дети визжат', sfx: sfx([2.4, 'cheer', -8]) });
K(960.14, st('club', {}, W0(), [Zm(0, { p: 'cheer', e: 'joy' }), KD(-260, { p: 'cheer', e: 'joy' }), KD(260, { p: 'cheer', e: 'joy' })], [], { badge: { str: 'ЗАКАЗ №15 · БЕСПЛАТНО', at: 0.4 } }), { scene: 'Лёха отрабатывает пятнадцатый заказ, бесплатно' });
K(964.04, st('club', {}, W0(), [Zm(0, { p: 'wave', e: 'joy' }), ...[0, 1, 2, 3, 4, 5].map((i) => KD(-600 + i * 240 + (i > 2 ? 240 : 0), { walk: { to: -600 + i * 240 + (i > 2 ? 240 : 0) + 120, at: 0, dur: 3, ease: false }, e: 'joy', f: 1 }))]), { scene: 'стишки, хороводы, «ёлочка, гори!»' });
K(967.08, st('club', {}, W0(), [Zm(0, { p: 'holdFront', e: 'happy' }), KD(-220, { p: 'reach', e: 'joy', f: 1 }), KD(220, { p: 'reach', e: 'joy', f: -1 })], [{ o: 'mandarin', attach: 0, r: 12 }]), { scene: 'раздаёт последние мандарины' });
K(969.28, st('club', {}, W0(), [B(-300, { p: 'holdFront', e: 'happy' }), Zm(0, { p: 'holdFront', e: 'joy' }), KD(220, { p: 'cheer', e: 'joy', f: -1 })], [{ o: 'pirozhki', attach: 0, s: 0.6 }]), { scene: 'бабушка достаёт пирожки с яблоками — Дед Мороз раздаёт их как подарки' });
K(976.96, st('club', {}, W0(), [B(-300, { p: 'cheer', e: 'joy' }), KD(0, { p: 'jump', e: 'joy' }), KD(220, { p: 'cheer', e: 'joy' })]), { scene: 'дети в восторге, бабушка в восторге' });
K(979.96, face('B', 'joy', 'club', {}), { scene: 'бабушка впервые видит, чтобы пирожки так быстро расходились' });
K(984.30, st('ustyug', {}, W0(), [Zm(-500, { p: 'wave', e: 'happy' })]), { in: { type: 'dip', dur: 0.4 }, scene: 'у Деда Мороза есть резиденция — Великий Устюг', amb: amb2.wind });
K(988.36, ins('ustyug', {}, [], { blur: 4, read: [{ value: 'ВЕЛИКИЙ УСТЮГ', at: 0.4 }, { label: 'С КОНЦА', value: '1990-Х', at: 3.0, x: 1100 }] }), { scene: 'с конца 90-х его родина — Великий Устюг в Вологодской области' });
K(994.66, ins('ustyug', {}, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ o: 'paper', path: [[0, [-900 + i * 60, 600]], [2 + i * 0.3, [0, 160]]], s: 0.4, w: 140, h: 100, lines: ['ПИСЬМО'], rot: (i - 4) * 0.1 })), { blur: 4, read: { value: 'СОТНИ ТЫСЯЧ ПИСЕМ', at: 2.4 } }), { scene: 'терем, почта, сотни тысяч писем от детей', sfx: sfx([0.6, 'swish', -14]) });
K(1001.80, face('Z', 'smirk', 'club', { talk: [0, 5.2] }), { scene: 'Лёха хочет терем — хотя бы маленький, на даче' });
K(1007.44, st('club', { tables: false }, W0(-200), [MC(-500, { p: 'crouch', e: 'thinking' })], [{ o: 'car', x: -300, y: 0, s: 1.0, color: '#4a6a8a', back: true }], { read: { value: 'ОТСЫРЕЛИ ПРОВОДА', at: 4.4 } }), { scene: 'механик смотрит машину: просто отсырели провода' });
K(1015.72, st('village', {}, W0(), [], [{ o: 'car', x: -200, y: 0, s: 1.0, color: '#4a6a8a', lights: true, sh: [[0, 3], [0.6, 0]] }], { badge: { str: '+30 МИНУТ', at: 0.3 } }), { scene: 'через полчаса мотор снова заводится', sfx: sfx([0.2, 'carpass', -10]) });
K(1018.12, st('winterroad', { mood: 'night', speed: 260 }, W0(), [], [{ o: 'tractor', x: 300, y: 0, s: 1.1, lights: true, lit: true }, { o: 'car', x: -330, y: 0, s: 1.0, color: '#4a6a8a', lights: true }]), { scene: 'тракторист провожает до трассы, мигая гирляндой, как маяк' });

// ================= ДОМА: ВТОРОЙ НОВЫЙ ГОД =================
K(1022.54, st('yardW', { mood: 'night' }, W0(), [], [{ o: 'car', x: -100, y: 0, s: 1.0, color: '#4a6a8a', lights: true }], { badge: { str: '01:00', at: 0.3 } }), { in: { type: 'dip', dur: 0.4 }, scene: 'подъезжаете к дому почти в час ночи', amb: amb.city });
K(1026.02, st('stairwell', {}, W0(), [A(-560, { walk: { to: -300, at: 0, dur: 3 }, e: 'worried' })]), { scene: 'поднимаешься по лестнице, тревожно' });
K(1029.46, st('living', { night: true }, W0(), [M(-200, { p: 'sit', e: 'sad' }), P(80, { p: 'sit', e: 'sad' })], [TREE({ lit: 0.5 }), { o: 'table', x: 200, y: 0, s: 0.9 }], { tint: 'dream' }), { scene: 'представляешь родителей за пустым столом' });
K(1035.98, ins('stairwell', { door5: true, door5Open: [[0, 0], [2.0, 0.8]] }, [], { blur: 0, cam: { z: [2.0, 2.05], x: [620, 620], y: 140 } }), { scene: 'открываешь дверь своим ключом', sfx: sfx([0.6, 'tick', -10]) });
K(1038.34, st('living', { night: true, tv: true }, W0(), [M(-160, { p: 'sit', e: 'sad' }), P(40, { p: 'sit', e: 'sad' })], [TREE({ lit: 0.5 }), { o: 'garland', x: -600, y: 420, w: 500, half: 'left' }]), { scene: 'горит только гирлянда — та половина, что работает' });
K(1045.34, ins('living', { night: true }, [{ o: 'table', x: 0, y: 0, s: 2.0, w: 500 }, { o: 'bowl', x: -300, y: 220, s: 1.6 }, { o: 'holodets', x: -60, y: 220, s: 1.0 }, { o: 'pirozhki', x: 200, y: 220, s: 1.2 }, { o: 'bucket', x: 400, y: 220, s: 1.4 }], { blur: 10, read: { value: 'НЕТРОНУТО', at: 1.6, color: '#ff6f61' } }), { scene: 'на столе всё нетронутое: оливье, шуба, курица, шампанское' });
K(1051.00, face('M', 'cry', 'living', { so: { night: true } }), { scene: 'никто ничего не ел. мама поднимает красные от слёз глаза' });
K(1055.84, face('M', 'cry', 'living', { so: { night: true }, talk: [0, 2.4] }), { scene: '«Вы живы, Господи, я думала…»' });
K(1058.52, st('living', { night: true, tv: true }, W0(), [P(40, { p: [[0, 'sit'], [1.0, 'stand'], [2.4, 'phone']], e: 'determined' }), M(-200, { p: 'sit', e: 'sad' })], [TREE({ lit: 0.5 })]), { scene: 'папа встаёт, смотрит на часы' });
K(1063.96, face('P', 'determined', 'living', { so: { night: true }, talk: [0, 3.0], read: { value: '00:55', at: 0.2 } }), { scene: '«Так, без пяти час, все к столу, быстро!»' });
K(1067.40, st('living', { night: true }, W0(), [M(-300, { p: 'shrug', e: 'confused' }), A(-60, { p: 'shrug', e: 'confused' }), P(220, { p: 'holdFront', e: 'smirk', f: -1 })], [TREE({ lit: 0.5 }), { o: 'champagne', attach: 2, s: 0.8 }]), { scene: 'никто не понимает, папа разливает шампанское' });
K(1072.58, face('P', 'smirk', 'living', { so: { night: true }, talk: [0, 11.1], read: { value: 'КАЛИНИНГРАД: −1 ЧАС', at: 3.4 } }), { scene: '«В Калининграде ещё старый год! Встречаем по-калининградски»' });
K(1084.02, line('И ЭТО ПРАВДА', 'living', { so: { night: true } }), { scene: 'и это правда' });
K(1085.38, bp('zones', { wave: [[0, 11], [1, 11]], lbl: '11 ЧАСОВЫХ ПОЯСОВ' }), { in: { type: 'zoom', dur: 0.4 }, scene: '11 часовых поясов — Новый год наступает 11 раз' });
K(1093.44, bp('zones', { wave: [[0, 0], [0.8, 1], [6.4, 1], [9.8, 11]], lbl: 'ПЕРВЫЕ — КАМЧАТКА И ЧУКОТКА' }), { scene: 'первыми — Камчатка и Чукотка, последними — Калининград' });
K(1103.54, bp('zones', { wave: [[0, 1], [7.4, 11]], lbl: 'ПРАЗДНИК ПОЧТИ ПОЛСУТОК' }), { scene: 'праздник катится волной с востока на запад почти полсуток', sfx: sfx([0.4, 'whoosh', -14]) });
K(1111.16, st('living', { night: true, tv: true }, W0(), [M(-400, { p: 'stand', e: 'happy' }), P(-180, { p: 'phone', prop: 'phone', e: 'smile' }), A(40, { p: 'stand', e: 'happy' }), Zm(260, { p: 'stand', e: 'joy', f: -1 }), B(480, { p: 'stand', e: 'happy', f: -1 }), D(700, { p: 'stand', e: 'smile', f: -1 })], [TREE({ x: 900 })]), { scene: 'и вы встречаете Новый год второй раз — всей семьёй' });
K(1117.46, ins('living', { night: true }, [{ o: 'table', x: 0, y: 0, s: 2.0, w: 500 }, { o: 'holodets', x: -60, y: 220, s: 1.4, lidOff: true }, { o: 'jar', x: 250, y: 220, s: 1.4 }], { blur: 10, read: { value: '120 КМ В ПАЛЬТО', at: 3.0 } }), { scene: 'бабушкин холодец проехал 120 км и не помялся; дедушка открывает огурцы' });
K(1125.92, face('Z', 'happy', 'living', { so: { night: true }, beardTilt: [[0, 0], [1.6, 2.5]] }), { scene: 'Лёха снимает, наконец, бороду' });
K(1128.00, st('living', { night: true, tv: true }, W0(), [M(-400, { p: 'stand', e: 'happy', talk: true }), P(-180, { p: 'stand', e: 'happy', talk: true }), A(40, { p: 'stand', e: 'happy', talk: true }), Zm(260, { p: 'stand', e: 'joy', f: -1, talk: true }), B(480, { p: 'stand', e: 'happy', f: -1, talk: true }), D(700, { p: 'stand', e: 'smile', f: -1, talk: true })], [TREE({ x: 900 })], { timer: { from: 10, to: 8, t0: 2.0, t1: 4.6, suf: '', ease: false } }), { scene: 'все хором: десять, девять, восемь' });
K(1133.16, st('living', { night: true, tv: true }, W0(), [M(-400, { p: 'cheer', e: 'joy' }), P(-180, { p: 'cheer', e: 'joy' }), A(40, { p: 'cheer', e: 'joy' }), Zm(260, { p: 'cheer', e: 'joy', f: -1 }), B(480, { p: 'cheer', e: 'joy', f: -1 }), D(700, { p: 'cheer', e: 'joy', f: -1 })], [TREE({ x: 900 })], { big: { str: 'С НОВЫМ ГОДОМ!', at: 0.1, top: true } }), { in: { type: 'flash', dur: 0.3 }, scene: '«С Новым годом!»', sfx: sfx([0.1, 'cheer', -8]) });
K(1135.42, ins('living', { night: true }, [{ o: 'tree', x: 0, y: 0, h: 300, s: 1.6, ballGone: false }, { o: 'cat', x: 320, y: 0, s: 1.8, mode: 'swipe' }], { blur: 0, cam: { z: [1.2, 1.25], x: [100, 100], y: 60 } }), { scene: 'кот выбирает момент, чтобы сбросить нижний шарик' });
K(1142.04, ins('living', { night: true }, [{ o: 'shards', x: 0, y: 40, s: 2.4, k: [[0, 0], [0.3, 1]] }], { blur: 10, cam: { z: [1, 1.05], x: [0, 0], y: 0, sh: [[0, 10], [0.5, 0]] } }), { scene: 'шарик со звоном разбивается', sfx: sfx([0.05, 'impact', -8], [0.1, 'ding', -8, { pitch: 1.6 }]) });
K(1143.90, face('M', 'shocked', 'living', { so: { night: true } }), { scene: 'мама хватается за голову' });
K(1145.52, face('P', 'smile', 'living', { so: { night: true }, talk: [0, 1.6] }), { scene: 'папа: «На счастье»' });
K(1147.40, st('living', { night: true, tv: true }, W0(), [M(-400, { p: 'shrug', e: 'joy', jit: 1.5 }), P(-180, { p: 'shrug', e: 'joy', jit: 1.5 }), A(40, { p: 'cheer', e: 'joy', jit: 1.5 }), Zm(260, { p: 'cheer', e: 'joy', f: -1, jit: 1.5 }), B(480, { p: 'shrug', e: 'joy', f: -1, jit: 1.5 }), D(700, { p: 'shrug', e: 'joy', f: -1, jit: 1.5 })], [TREE({ x: 900 })], { }), { scene: 'все смеются так, что соседи стучат по батарее', sfx: sfx([1.6, 'hit', -12], [1.9, 'hit', -12], [2.2, 'hit', -12]) });
K(1150.60, ins('bedroom', { mood: 'night' }, [], { blur: 4, read: { value: 'СОСЕДИ УЖЕ СПЯТ', at: 0.4 } }), { scene: 'соседи встречали по-московски и уже легли спать' });

// ================= ТОТ САМЫЙ СТОЛ =================
K(1155.04, st('living', { night: true, sofa: false }, W0(), [M(-460, { p: 'sit', e: 'happy' }), P(-260, { p: 'sit', e: 'smile' }), A(-60, { p: 'sit', e: 'happy' }), Zm(140, { p: 'sit', e: 'joy' }), B(340, { p: 'sit', e: 'smile' }), D(540, { p: 'sit', e: 'smile' })], [{ o: 'table', x: 40, y: 0, s: 1.6, w: 680 }, { o: 'bowl', x: -200, y: 150, s: 0.8 }, { o: 'holodets', x: 40, y: 150, s: 0.6 }, { o: 'pirozhki', x: 260, y: 150, s: 0.8 }, { o: 'mandarins', x: 460, y: 150, s: 0.7 }, TREE({ x: 900 })]), { scene: 'начинается тот самый новогодний стол' });
K(1158.44, face('B', 'worried', 'living', { so: { night: true }, talk: [1.8, 3.6] }), { scene: 'бабушка: «Вы ничего не едите»' });
K(1162.16, ins('living', { night: true }, [0, 1, 2].map((i) => ({ o: 'bowl', x: -300 + i * 300, y: 120, s: 1.6, when: [i * 0.6, 99] })), { blur: 10, timer: { from: 1, to: 3, t0: 0, t1: 1.4, suf: '-Я ТАРЕЛКА', ease: false } }), { scene: 'хотя ты съел уже третью тарелку оливье', sfx: sfx([0.6, 'pop', -14], [1.2, 'pop', -14]) });
K(1164.74, face('D', 'happy', 'living', { so: { night: true }, talk: [0, 6.0], objs: [{ o: 'tractor', x: 420, y: 160, s: 0.6, flip: true }] }), { scene: 'дедушка в пятый раз рассказывает про трактор — с новыми подробностями' });
K(1171.46, st('living', { night: true, sofa: false }, W0(), [M(-160, { p: 'sit', e: 'joy' }), P(60, { p: 'sit', e: 'happy', p: [[0, 'sit'], [1.6, 'reach']], f: -1 })], [{ o: 'table', x: -40, y: 0, s: 1.2, w: 420 }, TREE({ x: 700 })]), { scene: 'мама, наконец, смеётся, папа обнимает её' });
K(1175.30, st('living', { night: true, sofa: false }, W0(), [Zm(-120, { p: 'sit', e: 'happy', f: 1 }), B(120, { p: 'sit', e: 'smile', f: -1, talk: true })], [{ o: 'notebook', attach: 0, s: 0.6 }, { o: 'table', x: 0, y: 0, s: 1.0, w: 300 }]), { scene: 'Лёха записывает рецепт пирожков — будет раздавать детям' });
K(1182.12, st('living', { night: true, sofa: false }, W0(200), [Zm(240, { lie: 1, y: 40, e: 'sleepy' })], [{ o: 'box', x: 240, y: 0, w: 320, h: 40, color: '#6a7a9a', back: true }, TREE({ x: 520 }), { o: 'cat', x: 0, y: 0, mode: 'sleep', s: 1.2 }], { badge: { str: '5:00', at: 0.3 } }), { in: { type: 'dip', dur: 0.5 }, scene: 'спать в пять утра: Лёха на раскладушке под ёлкой, рядом кот', sfx: sfx([1.0, 'clock', -20]) });
K(1191.52, st('bedroom', { mood: 'night' }, W0(-120), [B(-360, { lie: -1, y: 50, e: 'sleepy' }), D(-120, { lie: 1, y: 50, e: 'sleepy' })]), { scene: 'бабушка с дедушкой в твоей старой комнате' });
K(1194.32, st('living', { night: true }, W0(), [A(-60, { lie: 1, y: 70, e: 'sleepy' })], [TREE({ lit: 0.5 })]), { scene: 'ты на диване. пахнет хвоей, мандаринами и холодцом', sfx: sfx([1.6, 'shimmer', -18]) });

// ================= 1 ЯНВАРЯ =================
K(1200.20, line(['1 ЯНВАРЯ —', 'ОТДЕЛЬНЫЙ ПРАЗДНИК'], 'living', { at: [0, 0.6], colors: ['cream', 'gold'] }), { in: { type: 'dip', dur: 0.5 }, scene: '1 января — отдельный праздник' });
K(1203.02, st('living', { tv: true }, W0(), [M(-300, { p: 'stand', e: 'sleepy' }), P(0, { p: 'stand', e: 'sleepy' })], [TREE()], { badge: { str: '13:00', at: 0.3 } }), { scene: 'никто не спешит, все встают к обеду', amb: amb2.room });
K(1205.86, face('M', 'smile', 'living', { talk: [0, 2.0] }), { scene: 'мама: сегодня не готовлю, будем доедать' });
K(1209.16, ins('kitchen', KIT, [{ o: 'bowl', x: 0, y: 120, s: 3.4 }], { blur: 10, read: { value: 'ПОЛТАЗИКА', at: 1.8 } }), { scene: 'оливье осталось ровно полтазика', sfx: sfx([1.8, 'boing', -14]) });
K(1213.34, st('living', { tv: true }, W0(), [P(-60, { lie: 1, y: 70, e: [[0, 'smile'], [3.0, 'sleepy']] }), B(-500, { p: 'sit', e: 'smile' })], [TREE()]), { scene: 'по телевизору старое кино, которое все видели сто раз' });
K(1219.76, st('living', { tv: true }, W0(), [P(-60, { lie: 1, y: 70, e: 'sleepy' })], [TREE()], { say: null }), { scene: 'папа засыпает на середине фильма, как каждый год' });
K(1223.06, st('living', { tv: true, sofa: false }, W0(), [B(-300, { p: 'sit', e: 'smile' }), D(60, { p: 'sit', e: 'thinking', talk: [1.4, 7.3] })], [{ o: 'stool', x: -300, back: true }, { o: 'stool', x: 60, back: true }, { o: 'socks', attach: 0, s: 0.8 }, { o: 'paper', attach: 1, s: 0.5, w: 140, h: 120, lines: ['КРОССВОРД'] }]), { scene: 'бабушка вяжет, дедушка решает кроссворд: зимний праздник из пяти букв' });
K(1230.70, st('yardW', { mood: 'day', flakes: 140 }, W0(), [], [], { }), { scene: 'на улице наконец выпадает снег — тихий, пушистый', amb: amb2.wind, sfx: sfx([0.4, 'shimmer', -16]) });
K(1238.36, st('yardW', { mood: 'day', flakes: 120 }, W0(), [A(-500, { walk: { to: -200, at: 0, dur: 2.4 }, e: 'smile' }), Zm(-700, { walk: { to: -20, at: 0, dur: 3.0 }, e: 'smile' })]), { scene: 'вы с Лёхой во дворе — Лёха, конечно, в костюме' });
K(1245.38, st('yardW', { mood: 'day', flakes: 120 }, W0(), [Zm(-20, { p: 'stand', e: 'surprised' }), Q(-700, { walk: { to: -200, at: 0, dur: 2.2, run: true }, e: 'joy' }), U(700, { walk: { to: 160, at: 0, dur: 2.2, run: true }, e: 'joy', f: -1 }), KD(900, { walk: { to: 340, at: 0.4, dur: 2.2, run: true }, e: 'joy', f: -1 })]), { scene: 'дети во дворе бегут к нему со всех сторон', sfx: sfx([0.4, 'cheer', -14]) });
K(1249.58, face('Z', [[0, 'sad'], [1.4, 'smile']], 'yardW', { so: { mood: 'day' }, talk: [4.2, 9.3], read: { value: 'ЗАКАЗ №16', at: 4.8 } }), { scene: '«Ну что, ребятки, шестнадцатый заказ. Последний. Стишки рассказывать будем?»' });

// ================= НАУКА: ЭФФЕКТ НОВОГО СТАРТА =================
K(1259.46, line('ЧТО ГОВОРИТ НАУКА?', 'living', {}), { in: { type: 'zoom', dur: 0.4 }, scene: 'что самое интересное в Новом годе с точки зрения науки?' });
K(1263.86, bp('start', { ats: [5.8, 7.2, 8.4, 9.9], lblAt: 15 }), { scene: 'люди охотнее начинают новое после важных дат', sfx: sfx([5.8, 'pop', -14], [7.2, 'pop', -14], [8.4, 'pop', -14], [9.9, 'ding', -12]) });
K(1276.16, bp('start', { ats: [0, 0, 0, 0], lblAt: 0.4 }), { scene: 'учёные называют это эффектом нового старта', sfx: sfx([0.4, 'stinger', -12]) });
K(1279.22, ins('living', {}, [{ o: 'book', x: -260, y: 160, s: 3, label: 'ГЛАВА 1', color: '#3a6ea5' }, { o: 'book', x: 260, y: 160, s: 3, label: 'ГЛАВА 2', color: '#c0453a', when: [2.4, 99] }], { blur: 12 }), { scene: 'новая дата — новая глава жизни' });
K(1285.16, bp('icons', { items: [['cross', 'БРОСИТЬ КУРИТЬ', 0.7], ['shovel', 'СПОРТЗАЛ'], ['book', 'ЯЗЫК']], ats: [1.4, 2.6, 3.6] }), { scene: 'бросить курить, пойти в спортзал, выучить язык', sfx: sfx([1.4, 'pop', -14], [2.6, 'pop', -14], [3.6, 'pop', -14]) });
K(1290.26, ins('parkW', {}, [], { blur: 6, read: { value: 'ДО ВЕСНЫ НЕ ДОЖИВАЮТ', at: 0.4, color: '#ff6f61' } }), { scene: 'большинство обещаний не доживает до весны' });
K(1293.84, bp('start', { ats: [9, 9, 9, 0.2], lbl: 'ПООБЕЩАЛ — ШАНСОВ БОЛЬШЕ', lblAt: 1.2 }), { scene: 'но у пообещавших шансов заметно больше', sfx: sfx([1.2, 'ding', -12]) });
K(1303.18, line('ТАК ЧТО ОБЕЩАТЬ СТОИТ', 'living', {}), { scene: 'так что обещать стоит' });
K(1305.26, st('living', {}, W0(), [A(-60, { lie: 1, y: 70, e: 'sleepy' })], [{ o: 'bowl', x: 200, y: 0, s: 1.0 }], { badge: { str: 'ФЕВРАЛЬ', at: 0.3 } }), { scene: 'даже если в феврале ты снова на диване с остатками оливье', sfx: sfx([1.6, 'boing', -16]) });

// ================= ЖЕЛАНИЯ =================
K(1309.48, st('carIn', { storm: false }, W0(), [A(280, sitCar({ e: 'smile' })), Zm(170, sitCar({ e: 'neutral', p: [[0, 'sit'], [4.0, 'reach']] }))], [{ o: 'steering', x: 365, y: 255, s: 0.55, back: true }, { o: 'wish', attach: 1, s: 0.4, label: '', when: [4.4, 99] }]), { in: { type: 'dip', dur: 0.5 }, scene: 'вечером 1 января ты отвозишь Лёху — он достаёт бумажку с желанием', amb: amb.city });
K(1319.02, ins('carIn', { storm: false }, [{ o: 'wish', x: 0, y: 360, s: 3.2, label: 'ЧТОБЫ НА СЛЕДУЮЩИЙ ГОД\nБЫЛО КУДА ПРИЕХАТЬ' }], { blur: 12 }), { scene: '«чтобы на следующий год было куда приехать»' });
K(1324.22, st('carIn', { storm: false }, W0(), [A(280, sitCar({ e: 'smile', p: 'reach', f: -1 })), Zm(170, sitCar({ e: 'surprised' }))], [{ o: 'steering', x: 365, y: 255, s: 0.55, back: true }]), { scene: 'ты молча достаёшь свою' });
K(1326.32, ins('carIn', { storm: false }, [{ o: 'wish', x: 0, y: 360, s: 3.2, label: 'ВМЕСТЕ' }], { blur: 12 }), { scene: 'на ней одно слово: «Вместе»', sfx: sfx([3.6, 'shimmer', -10]) });
K(1331.10, face('Z', [[0, 'thinking'], [3.2, 'cry']], 'carIn', { so: { storm: false }, talk: [3.2, 5.2] }), { scene: '«Слушай, похоже, сбылось»' });
K(1336.36, st('carIn', { storm: false }, W0(), [A(280, sitCar({ e: 'smile', look: [-0.4, 0] })), Zm(170, sitCar({ e: 'cry', f: -1, p: [[0, 'sit'], [1.6, 'facepalm']] }))], [{ o: 'steering', x: 365, y: 255, s: 0.55, back: true }]), { scene: 'он отворачивается и вытирает глаза рукавом красного халата' });

// ================= ФИНАЛ: ГЛАВНОЕ — С КЕМ =================
K(1343.64, line('КАК ПРОХОДИТ НОВЫЙ ГОД В КАЖДОЙ СЕМЬЕ?', 'living', { size: 62 }), { in: { type: 'dip', dur: 0.5 }, scene: 'знаешь, как проходит Новый год в каждой семье?' });
K(1346.36, st('kitchen', KIT, W0(200), [M(560, { p: 'point', e: 'determined', f: -1 })], [{ o: 'paper', x: -700, y: 360, s: 1.0, w: 150, h: 300, lines: ['СПИСОК'] }], { tint: 'memory' }), { scene: 'мама на кухне, список на холодильнике, «не трогай»' });
K(1351.54, st('living', LIV(), W0(), [P(-200, { p: 'sitFloor', e: 'angry', f: 1 })], [{ o: 'garland', x: -60, y: 0, tangle: true }, { o: 'cat', x: 500, y: 0, mode: 'sit' }, TREE({ x: 700 })], { tint: 'memory' }), { scene: 'папа и гирлянда. кот и ёлка' });
K(1354.72, ins('kitchen', KIT, [{ o: 'bowl', x: -200, y: 120, s: 3 }, { o: 'bowl', x: 260, y: 120, s: 3 }], { blur: 10, tint: 'memory' }), { scene: 'оливье тазиками' });
K(1356.14, face('B', 'worried', 'kitchen', { tint: 'memory' }), { scene: 'бабушка, которой кажется, что вы ничего не едите' });
K(1359.36, st('living', { tv: true }, W0(300), [P(-60, { lie: 1, y: 70, e: 'sleepy' })], [], { tint: 'memory' }), { scene: 'старое кино по телевизору' });
K(1360.94, line(['У ВСЕХ ОДИНАКОВОЕ —', 'И В ЭТОМ ВСЯ ПРЕЛЕСТЬ'], 'living', { at: [0, 1.4], colors: ['cream', 'gold'] }), { scene: 'это у всех одинаковое — и в этом вся прелесть' });
K(1364.96, ins('kitchen', { ...KIT, fridgeOpen: 1 }, [], { blur: 6, big: { str: 'НЕЛЬЗЯ ПРИГОТОВИТЬ ЗАРАНЕЕ', at: 0.6, size: 62 } }), { scene: 'одну вещь невозможно приготовить заранее' });
K(1374.64, st('carIn', { hazard: true, warm: true }, W0(), CAR({ A: 'happy', Z: 'joy', B: 'happy', D: 'smile' }), CARO(), { big: { str: 'ЭТО ЛЮДИ РЯДОМ', at: 0.3, top: true } }), { scene: 'это люди, которые сидят рядом, когда бьют куранты' });
K(1379.02, st('club', {}, W0(), [T(-300, { p: 'cheer', e: 'joy' }), Zm(0, { p: 'cheer', e: 'joy' }), KD(-120, { p: 'cheer', e: 'joy' }), KD(160, { p: 'cheer', e: 'joy' }), B(300, { p: 'cheer', e: 'joy' })]), { scene: 'неважно где: за столом, в машине, в деревенском клубе' });
K(1386.32, line('ГЛАВНОЕ — С КЕМ', 'club', {}), { scene: 'главное — с кем', sfx: sfx([0.1, 'stinger', -10]) });
K(1387.94, st('bedroom', { mood: 'interiorWarm' }, W0(-120), [A(-260, { lie: -1, y: 50, e: [[0, 'sleepy'], [3.0, 'smile']] })], [{ o: 'phone', x: 60, y: 96, back: true, sh: [[0, 3], [2, 3], [2.1, 0]] }], { badge: { str: '8:00', at: 0.3 } }), { scene: 'мама в восемь утра попросит сбегать за майонезом — не ворчи', sfx: sfx([0.3, 'phonering', -12]) });
K(1394.38, st('yardW', { mood: 'golden' }, W0(), [A(-600, { walk: { to: 300, at: 0, dur: 3.6, run: true }, e: 'happy' })], [{ o: 'bag', attach: 0, ay: 50 }]), { scene: 'сбегай. и за горошком тоже' });
K(1396.76, face('A', 'smile', 'yardW', { so: { mood: 'golden' }, objs: [{ o: 'phone', x: -260, y: 380, s: 3, rot: 0.2 }] }), { scene: 'позвони бабушке с дедушкой', sfx: sfx([0.2, 'phonering', -16]) });
K(1398.70, st('yardW', { mood: 'golden' }, W0(), [A(-200, { p: 'wave', e: 'happy', f: 1 }), Zm(300, { walk: { to: 60, at: 0, dur: 1.8 }, e: 'joy', f: -1 })]), { scene: 'позови друга, которому не с кем встречать праздник' });
K(1402.58, st('living', { night: true, tv: true }, W0(), [M(-400, { p: 'stand', e: 'happy', f: 1 }), P(-180, { p: 'stand', e: 'happy', f: 1 }), A(40, { p: 'stand', e: 'awe', f: -1 }), Zm(260, { p: 'stand', e: 'joy', f: -1 }), B(480, { p: 'stand', e: 'happy', f: -1 }), D(700, { p: 'stand', e: 'smile', f: -1 })], [TREE({ x: 900 })]), { scene: 'когда бьют куранты — смотри не на телевизор, а на тех, кто рядом' });
K(1407.52, st('kremlinNight', { fireworks: true }, { z: [1.0, 1.06], x: [0, 0], y: 0 }, [], [], { big: { str: 'САМОЕ ГЛАВНОЕ НОВОГОДНЕЕ ЧУДО', at: 0.2, size: 60 } }), { scene: 'это и есть самое главное новогоднее чудо', sfx: sfx([0.2, 'shimmer', -10]) });

// ================= ВОПРОС И ПОДПИСКА =================
K(1411.82, line('А ТЕПЕРЬ ВОПРОС ТЕБЕ', 'void', {}), { in: { type: 'dip', dur: 0.4 }, scene: 'вопрос тебе' });
K(1413.48, { tpl: 'q', str: ['Какой Новый год был', 'самым необычным в твоей жизни?'] }, { scene: 'вопрос 1', captions: false });
K(1416.70, { tpl: 'q', str: ['А какая новогодняя традиция', 'есть только в вашей семье?'] }, { scene: 'вопрос 2', captions: false });
K(1420.56, { tpl: 'q', str: ['Напиши в комментариях'], bubble: 0.2 }, { scene: 'напиши в комментариях', sfx: sfx([0.2, 'pop', -10]) });
K(1423.96, { tpl: 'sub', ring: true }, { scene: 'подпишись и нажми на колокольчик', sfx: sfx([0.5, 'ding', -10]) });
K(1428.78, { tpl: 'sub', finger: true, press: 1.2 }, { scene: 'самый простой подарок — даже резать ничего не нужно', sfx: sfx([1.2, 'blip', -8]) });
K(1435.00, { tpl: 'endcard', lines: ['С НАСТУПАЮЩИМ', 'НОВЫМ ГОДОМ!'] }, { in: { type: 'fade', dur: 0.5 }, scene: 'с наступающим! пусть рядом будут те, с кем хочется встречать куранты', sfx: sfx([0.2, 'stinger', -10]) });

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
// салон машины: у каждого кадра с людьми — корпус машины поверх (аварийка/запотевание из параметров локации)
for (const it of items) { const P = it.params; if (P.tpl === 'st' && P.set === 'carIn' && (P.figs || []).length) { P.objs = (P.objs || []).filter((o) => o.o !== 'carShell'); const so = P.so || {}; P.objs.push({ o: 'carShell', x: 0, y: 0, s: 1, front: true, abs: true, hazard: !!so.hazard, fog: typeof so.fog === 'number' ? so.fog : 0, headlights: !!so.lights }); } }
// длинные кадры (> 7 с) делим: вторая половина — крупное лицо главного в кадре героя (или смена ракурса лица)
const split = [];
for (const sh of shots) {
  const d = sh.end - sh.start, P = sh.params;
  const canSt = P.tpl === 'st' && (P.figs || []).length && !P.blur;
  const canFace = P.tpl === 'face';
  if (d <= 7 || !(canSt || canFace)) { split.push(sh); continue; }
  const mid = sh.start + d / 2, wds = words.filter((w) => w.start > sh.start + 2 && w.start < sh.end - 2);
  const cut = wds.length ? wds.reduce((b, w) => (Math.abs(w.start - mid) < Math.abs(b.start - mid) ? w : b)).start - 0.08 : mid;
  const a1 = { ...sh, end: +cut.toFixed(2) }, a2 = { ...sh, start: +cut.toFixed(2), sfx: [], in: { type: 'cut' }, scene: sh.scene + ' (крупно)' };
  if (canSt) { const f = P.figs.find((x) => x.talk) || P.figs[0]; const e = Array.isArray(f.e) ? f.e[f.e.length - 1][1] : f.e || 'neutral'; a2.params = { tpl: 'face', w: f.w, e, set: P.set, so: P.so, talk: f.talk ? true : undefined, fx: (f.x || 0) > 0 ? 80 : -80, tint: P.tint }; }
  else a2.params = { ...P, fx: (P.fx || 0) ? -P.fx : 90, side: -(P.side ?? -1), zoom: 0.08, objs: [] , talk: P.talk ? [Math.max(0, P.talk[0] - (cut - sh.start)), P.talk[1] - (cut - sh.start)] : undefined, read: undefined, badge: undefined, timer: undefined };
  split.push(a1, a2);
}
shots.length = 0; split.forEach((s, i) => shots.push({ ...s, id: 's' + String(i + 1).padStart(3, '0'), line: words.filter((w) => w.start >= s.start - 0.05 && w.start < s.end - 0.05).map((w) => w.word).join(' ') }));
const bad = shots.filter((s) => s.end - s.start < 0.45);
if (bad.length) console.log('КОРОТКИЕ:', bad.map((s) => `${s.id} ${s.start}-${s.end} ${s.scene}`).join('\n'));
const long = shots.filter((s) => s.end - s.start > 7.5);
if (long.length) console.log('ДЛИННЫЕ:', long.map((s) => `${s.id} ${(s.end - s.start).toFixed(1)}с ${s.scene}`).join('\n'));
const music = [];
fs.writeFileSync(path.join(PROJ, 'story/shots.json'), JSON.stringify({ title: 'Тот самый Новый год, который мы никогда не забудем', duration: DURATION, shots, music, sfx: [] }, null, 1));
console.log(`shots: ${shots.length}, duration ${DURATION}s, median ${(shots.map((s) => s.end - s.start).sort((a, b) => a - b)[Math.floor(shots.length / 2)]).toFixed(2)}s`);
