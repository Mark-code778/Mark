// story/plan.mjs — раскадровка «Моргнул — минус год». Запуск: node story/plan.mjs → story/shots.json
// Каждая строка: [время первого слова фразы, описание кадра, v (что рисовать), доп. поля (in, sfx, amb)]
import fs from 'node:fs';
const DIR = new URL('.', import.meta.url).pathname;
const words = JSON.parse(fs.readFileSync(DIR + '../timeline/words.json', 'utf8'));
const W = words.words || words;
const VOICE_END = W[W.length - 1].end;
const DURATION = Math.round((VOICE_END + 1.5) * 100) / 100;

// ── сокращения
const max = (o) => ({ w: 'max', ...o }), egor = (o) => ({ w: 'egor', ...o }), boss = (o) => ({ w: 'boss', ...o });
const baby = (o) => ({ w: 'baby', ...o }), wife = (o) => ({ w: 'wife', ...o }), girl = (o) => ({ w: 'girl', ...o });
const L = -230, R = 230;                         // позиции в двухшоте: герой слева смотрит вправо
const SALON = { set: 'salon', so: { car: '#9aa0aa', price: ['3 899 000', 'РУБЛЕЙ'] } };
const SALON2 = { set: 'salon', so: { car: '#d64a3a', price: ['4 200 000', 'РУБЛЕЙ'], calendar: 2027 } };
const SALON3 = { set: 'salon', so: { car: '#d64a3a', price: ['4 200 000', 'РУБЛЕЙ'], calendar: 2029, mood: 'dusk' } };
const CAFE = { set: 'cafe' }, ROOM = { set: 'room' }, PARK = { set: 'park' };
const VOID = (light = '#8fb8e8', mood = 'void') => ({ set: 'void', so: { light, mood } });
const face = (base, f, o = {}) => ({ ...base, face: f, ...o });
const ins = (base, k, o = {}) => ({ ...base, ins: { k, ...o } });
const sfx = (...a) => ({ sfx: a.map(([at, name, gain = -10]) => ({ at, name, gain })) });

const P = [
  // ═══ ХОЛОДНОЕ ОТКРЫТИЕ: четыре моргания
  [0.0, 'Крупно Максим открывает глаза: ему уже 22', face(VOID('#ffc68a', 'dusk'), max({ e: [[0, 'sleepy'], [0.7, 'surprised']] }), { lid: 'open', ui: [{ k: 'badge', s: '22 ГОДА', at: 1.0 }] }), { in: { type: 'dip', dur: 0.5 }, ...sfx([0.6, 'whoosh', -12]) }],
  [3.14, 'Моргание — Егор уже женат: свадьба в парке, Максим в шоке', { ...PARK, cam: { z: [1, 1.06] }, lid: 'open', ch: [max({ x: -480, s: 1.5, e: 'shocked', p: 'handsOnHead' }), egor({ x: 60, s: 1.5, e: 'joy', p: 'cheer', f: 1 }), wife({ x: 260, s: 1.5, e: 'happy', p: 'wave', f: -1 })] }, sfx([0.4, 'shimmer', -12])],
  [7.02, 'Моргание — у Егора сын, которого зовут Максим', { ...ROOM, lid: 'open', ch: [max({ x: -420, s: 1.6, e: 'shocked', p: 'reach' }), egor({ x: 180, s: 1.6, e: 'happy', p: 'holdFront', f: -1 }), baby({ x: -20, s: 1.6, e: 'joy', p: 'wave', f: -1 })] }, sfx([0.5, 'pop', -12])],
  [11.98, 'Моргание — автосалон на Кутузовском, широкий план, Максим посреди зала', { ...SALON2, cam: { z: [1, 1.08] }, lid: 'open', ch: [max({ x: -120, s: 1.1, e: 'awe' })] }, sfx([0.4, 'heartbeat', -12])],
  [15.6, 'Гигантское лицо: не моргает четвёртую минуту, глаза слезятся', face(SALON2, max({ e: 'shocked', noblink: true, tear: true }), { cam: { z: [1, 1.08] }, fx: { freeze: true }, ui: [{ k: 'badge', s: 'НЕ МОРГАЯ · 4 МИН', at: 0.4 }] }), { in: { type: 'flash' }, ...sfx([0, 'freeze', -8], [1, 'heartbeat', -12]) }],
  [19.36, 'Сергей Николаевич протягивает конверт', { ...SALON2, cam: { z: [1.05, 1.12], x: [0, 20] }, ch: [max({ x: L, s: 1.8, e: 'shocked', still: true }), boss({ x: R, s: 1.8, f: -1, e: 'smile', p: 'reach' })] }],
  [21.96, 'Конверт крупно: «Максим, твоя премия»', ins(SALON2, 'envelope', { label: 'ПРЕМИЯ' }), sfx([0.2, 'pop', -12])],
  [23.96, 'Егор вытирает Максиму слёзы', { ...SALON2, cam: { z: [1.1, 1.16] }, ch: [max({ x: -120, s: 1.9, e: 'cry', still: true }), egor({ x: 140, s: 1.9, f: -1, e: 'smile', p: 'reach' })] }],
  [26.48, 'ТИТР: что, если каждое моргание забирает год?', { ...VOID('#ffc68a', 'dusk'), cam: { z: [1.06, 1] }, ui: [{ k: 'title', lines: ['ЧТО, ЕСЛИ КАЖДОЕ МОРГАНИЕ', 'ЗАБИРАЕТ ГОД?'], at: 0 }] }, { in: { type: 'dip', dur: 0.6 }, ...sfx([0, 'stinger', -8]) }],

  // ═══ ЗНАКОМСТВО
  [28.04, 'Максим машет в камеру: тебя зовут Максим, тебе 21', { ...VOID('#ffc68a', 'dusk'), ch: [max({ s: 2.0, x: 120, f: -1, e: 'smile', p: 'wave' })], ui: [{ k: 'badge', s: 'МАКСИМ · 21 ГОД', at: 0.4 }] }, { in: { type: 'fade', dur: 0.4 } }],
  [31.74, 'Москва, автосалон: Максим-менеджер у машины, широкий', { ...SALON, cam: { z: [1, 1.05], x: [-40, 20] }, ch: [max({ x: -60, s: 1.15, e: 'smile', p: 'explain' })] }, { amb: { name: 'roomtone', gain: -26 } }],
  [35.36, 'Начальник Сергей Николаевич обещает премию уже месяц', { ...SALON, ch: [boss({ x: L, s: 1.8, e: 'smile', p: 'talk', talk: [0, 3] }), max({ x: R, s: 1.8, f: -1, e: 'worried' })] }],
  [38.2, 'Крупно начальник в очках улыбается', face(SALON, boss({ e: 'smirk', side: 1 })), sfx([0.4, 'ding', -14])],
  [40.7, 'Лучший друг Егор знает о тебе всё — идут вместе', { ...PARK, cam: { x: [-60, 60] }, ch: [max({ walk: [-560, 40], s: 1.5, e: 'happy' }), egor({ walk: [-360, 240], s: 1.5, e: 'joy' })] }],
  [44.4, 'Тёмный подъезд ночью — Максим боится', { set: 'entrance', cam: { z: [1.02, 1.08], shake: 2 }, ch: [max({ x: -260, s: 1.5, e: 'scared', p: 'crouch' })] }, { amb: { name: 'wind', gain: -24 }, ...sfx([0.5, 'heartbeat', -12]) }],
  [48.06, 'Обычный понедельник: утро в салоне', { ...SALON, cam: { z: [1, 1.04] }, ch: [max({ x: -320, s: 1.05, e: 'neutral', walk: [-700, -300, 0, 2.6] })], ui: [{ k: 'badge', s: 'ПОНЕДЕЛЬНИК', at: 0.5 }] }, { in: { type: 'dip', dur: 0.5 }, amb: { name: 'roomtone', gain: -26 } }],
  [51.84, 'Максим у серого кроссовера', { ...SALON, so: { ...SALON.so, carX: 260 }, cam: { z: [1.08, 1.14], x: [-30, 0] }, ch: [max({ x: -380, s: 1.7, e: 'neutral', p: 'point' })] }],
  [54.6, 'Вставка: ценник 3 899 000 рублей', { ...SALON, cam: { z: [1.9, 2.0], x: [380, 380], y: [-200, -200] }, fx: { dust: true } }, sfx([0.2, 'counter', -14])],
  [57.94, 'Клиентов нет — пустой зал, Максим один', { ...SALON, cam: { z: [1, 0.96] }, ch: [max({ x: 0, s: 0.95, e: 'sad', p: 'sad' })] }],
  [59.1, 'Кофе остыл ещё в девять утра', { ...SALON, cam: { z: [1.15, 1.2] }, ch: [max({ x: -60, s: 2.0, e: 'sleepy', p: 'holdFront', prop: 'cup' })] }],
  [61.42, 'Мимо проходит Сергей Николаевич и хлопает по плечу', { ...SALON, cam: { x: [-60, 40] }, ch: [max({ x: 180, s: 1.7, f: -1, e: 'neutral', prop: 'cup', p: 'holdFront' }), boss({ walk: [-700, -60, 0, 3.0], s: 1.7, e: 'smile', p: [[0, 'stand'], [3.1, 'wave']] })] }, sfx([3.3, 'hit', -18])],
  [65.2, 'Крупно начальник: «Максим, премия на этой неделе. Точно»', face(SALON, boss({ e: 'smile', talk: [0, 4], side: 1 }))],
  [69.28, '34-й день подряд — Максим закрывает лицо рукой', { ...SALON, cam: { z: [1.1, 1.16] }, ch: [max({ x: 0, s: 1.9, e: 'sad', p: 'facepalm' })], ui: [{ k: 'badge', s: '34-Й ДЕНЬ', at: 0.6 }] }, sfx([0.6, 'blip', -12])],
  [73.12, 'Часы над кассой крупно: до конца смены 8 часов', ins(SALON, 'clock', { time: 10 * 3600 + 3 * 60, tick: true }), { ...sfx([0.2, 'clock', -12]), ui: [] }],
  [75.5, 'Максим смотрит на часы, спиной к нам, в голове одна мысль', { ...SALON, cam: { z: [1.1, 1.18], y: [0, -40] }, ch: [max({ x: -300, s: 1.8, f: -1, e: 'sleepy', p: 'sad' })] }],
  [79.84, 'Крупно: «Скорее бы всё это закончилось»', face(VOID('#9fb6d8', 'interiorCool'), max({ e: 'sad' }), { cam: { z: [1, 1.12] }, ui: [{ k: 'thought', s: '«Скорее бы всё это закончилось»', at: 0.2 }] }), sfx([0, 'riser', -14])],
  [82.22, 'И ты моргаешь — веки смыкаются', face(VOID('#9fb6d8', 'interiorCool'), max({ e: 'sleepy', noblink: true }), { cam: { push: [1.1, 1.4], pushT: 1.2 }, lid: 'close' }), sfx([0.9, 'whoosh', -8])],

  // ═══ ПЕРВЫЙ ПОТЕРЯННЫЙ ГОД
  [83.64, 'Открывает глаза — тот же салон', face(SALON2, max({ e: 'surprised' }), { lid: 'open' }), sfx([0.3, 'shimmer', -14])],
  [85.66, 'Часы над кассой показывают ту же минуту', ins(SALON2, 'clock', { time: 10 * 3600 + 17 * 60 }), sfx([0.3, 'tick', -10], [1.3, 'tick', -10], [2.3, 'tick', -10])],
  [89.0, 'Но кроссовер почему-то красный', { ...SALON2, so: { ...SALON2.so, carX: 120 }, cam: { push: [1, 1.25] }, ch: [max({ x: -520, s: 1.6, e: 'shocked', p: 'point' })] }, sfx([0.3, 'glitch', -10])],
  [91.04, 'Новый ценник 4 200 000 и календарь', { ...SALON2, cam: { z: [1.7, 1.8], x: [380, 380], y: [-200, -200] } }, sfx([0.3, 'counter', -12])],
  [94.6, 'Календарь на стене — другой год', ins(SALON2, 'calendar', { from: 2026, to: 2027, flip: 0.5 }), sfx([0.5, 'flash', -12])],
  [96.52, 'Ты достаёшь телефон', { ...SALON2, cam: { z: [1.2, 1.26] }, ch: [max({ x: 0, s: 2.0, e: 'worried', p: 'phone', prop: 'phone' })] }, sfx([0.4, 'blip', -14])],
  [98.12, 'Экран телефона: год на один больше', ins(SALON2, 'phone', { lines: ['2027', 'А ДОЛЖЕН БЫТЬ 2026'], flip: 0.8 }), sfx([0.8, 'glitch', -10])],
  [101.32, 'Мимо снова проходит Сергей Николаевич', { ...SALON2, cam: { x: [40, -40] }, ch: [max({ x: 180, s: 1.7, f: -1, e: 'worried', prop: 'phone', p: 'phone' }), boss({ walk: [-700, -60, 0, 2.6], s: 1.7, e: 'smile', p: [[0, 'stand'], [2.7, 'talk']], talk: [2.6, 6] })] }],
  [104.5, 'Крупно начальник: «Премия на этой неделе. Точно»', face(SALON2, boss({ e: 'smile', talk: [0, 3.5], side: 1 }))],
  [108.08, 'Ты не выдерживаешь: «Вы мне это говорили год назад!»', face(SALON2, max({ e: 'angry', talk: [1.2, 3.3] }), { cam: { push: [1, 1.15] } }), sfx([1.3, 'impact', -10])],
  [111.38, 'Он даже не останавливается: «Тогда квартал был другой»', { ...SALON2, cam: { x: [0, 80] }, ch: [max({ x: -320, s: 1.7, e: 'angry', p: 'shrug' }), boss({ walk: [0, 640, 0, 4], s: 1.7, e: 'smirk', talk: [0.5, 4] })] }],
  [115.98, 'Галерея: 342 новые фотографии', ins(VOID('#7fb8ff', 'interiorCool'), 'gallery'), sfx([0.2, 'counter', -14])],
  [119.62, 'На всех ты улыбаешься: кафе, набережная, море', { split: [{ ...CAFE, label: 'КАФЕ', ch: [max({ s: 1.6, e: 'joy', p: 'cheer' })] }, { ...PARK, label: 'МОРЕ', ch: [max({ s: 1.6, e: 'happy', p: 'wave' })] }] }, sfx([0.3, 'blip', -14], [1.8, 'blip', -14])],
  [124.42, 'Ты не помнишь ни одной', face(VOID('#8fb8e8'), max({ e: 'confused' }))],
  [126.16, 'Кто-то прожил этот год вместо тебя — и ему было весело', { split: [{ ...VOID('#ffc68a', 'dusk'), label: 'ОН', ch: [max({ s: 1.6, e: 'joy', p: 'cheer' })] }, { ...VOID('#8fb8e8'), label: 'ТЫ', ch: [max({ s: 1.6, e: 'sad', p: 'sad' })] }] }],
  [131.52, 'Это правда. И это не твоя вина', { ...VOID('#8fb8e8'), cam: { z: [1.08, 1] }, ch: [max({ s: 1.7, e: 'sad', p: 'sad' })] }],

  // ═══ НАУКА (схемы)
  [134.74, 'Схема: человек моргает 15–20 раз в минуту', { bp: { k: 'blink', to: 20, big: '15–20', sub: 'РАЗ В МИНУТУ' } }, { in: { type: 'zoom', dur: 0.4 }, ...sfx([0.2, 'whoosh', -12]) }],
  [138.32, 'Схема: 10% времени глаза закрыты', { bp: { k: 'closed' } }, sfx([2.0, 'blip', -12])],
  [143.8, 'Мозг вырезает эти секунды — мир не мигает', { bp: { k: 'edit' } }],
  [149.24, 'Если бы каждое моргание стоило год…', { bp: { k: 'years', from: 21, to: 21, title: '1 МОРГАНИЕ = 1 ГОД', sub: 'ТЕБЕ СЕЙЧАС' } }, sfx([0.3, 'riser', -14])],
  [152.6, '…за одну минуту ты бы состарился лет на 15', { bp: { k: 'years', from: 21, to: 36, title: 'ОДНА МИНУТА', sub: '+15 ЛЕТ' } }, sfx([0.4, 'counter', -10], [3.0, 'impact', -10])],
  [155.9, 'К обеду тебе было бы больше, чем Сергею Николаевичу', { split: [{ ...VOID('#ffc68a', 'dusk'), label: 'ТЫ К ОБЕДУ', ch: [max({ s: 1.6, e: 'shocked', p: 'sad', of: { head: 'curly' } })] }, { ...VOID('#8fb8e8'), label: 'ШЕФ', ch: [boss({ s: 1.6, e: 'smirk', p: 'crossArms', f: -1 })] }] }, sfx([1.0, 'pop', -12])],
  [159.52, 'Повезло в одном: ты ещё не знаешь, что это работает не всегда', { ...VOID('#ffc68a', 'dusk'), cam: { z: [1, 1.1] }, ch: [max({ s: 1.8, e: 'thinking', p: 'think' })] }, sfx([2.4, 'ding', -12])],

  // ═══ КОФЕЙНЯ
  [165.22, 'В обед ты бежишь к Егору — улица', { set: 'park', so: { mood: 'day' }, cam: { x: [-80, 80] }, fx: { speed: false }, ch: [max({ walk: [-800, 700], run: true, s: 1.4, e: 'worried' })] }, { in: { type: 'whip', dur: 0.3 }, ...sfx([0, 'whoosh', -8], [0.4, 'footstep', -14]) }],
  [166.9, 'Кофейня напротив салона, Егор за столиком', { ...CAFE, cam: { z: [1, 1.06] }, pr: [{ t: 'table', x: 0, cups: [40] }], ch: [egor({ x: 200, s: 1.3, f: -1, e: 'smile', p: 'sit' }), max({ walk: [-700, -200, 0, 1.6], s: 1.3, e: 'worried' })] }, { amb: { name: 'murmur', gain: -24 } }],
  [168.76, 'Капучино за 350 рублей', ins(CAFE, 'cupTop'), { ...sfx([0.2, 'blip', -14]), amb: { name: 'murmur', gain: -24 } }],
  [171.08, 'Ты рассказываешь всё, Егор жуёт круассан и слушает', { ...CAFE, pr: [{ t: 'table', x: 0, cups: [-40, 60] }], ch: [max({ x: -200, s: 1.7, e: 'worried', p: 'sit', talk: [0, 4] }), egor({ x: 200, s: 1.7, f: -1, e: 'neutral', p: 'sit' })] }, { amb: { name: 'murmur', gain: -24 } }],
  [175.6, 'Егор: «Ты неделю ходишь странный, но чтобы год пропал — это новое»', face(CAFE, egor({ e: 'smirk', talk: [0, 4.2], side: 1, x: 120 })), { amb: { name: 'murmur', gain: -24 } }],
  [180.12, 'Ты просишь: «Скажи что-нибудь, что я мог пропустить»', face(CAFE, max({ e: 'worried', talk: [0.8, 3.2], x: -120 })), { amb: { name: 'murmur', gain: -24 } }],
  [183.72, 'Он пожимает плечами: «Ничего, всё как обычно»', { ...CAFE, cam: { z: [1.15, 1.2], x: [60, 80] }, pr: [{ t: 'table', x: 0, cups: [-40, 60] }], ch: [max({ x: -200, s: 1.7, e: 'worried', p: 'sit' }), egor({ x: 200, s: 1.7, f: -1, e: 'neutral', p: 'shrug', talk: [1.6, 3.4] })] }, { amb: { name: 'murmur', gain: -24 } }],
  [187.4, 'И тут Егор: «Слушай, давай проверим. Моргни»', face(CAFE, egor({ e: [[0, 'thinking'], [1.4, 'determined']], talk: [1.5, 3.8], side: 1, x: 120 }), { cam: { push: [1, 1.12] } }), { amb: { name: 'murmur', gain: -24 } }],
  [191.5, 'Ты моргаешь', face(CAFE, max({ e: 'sleepy', noblink: true, x: -120 }), { lid: 'close' }), sfx([0.6, 'whoosh', -8])],
  [192.78, 'Егор напротив — с бородой и кольцом, закат', { ...CAFE, so: { mood: 'golden' }, lid: 'open', pr: [{ t: 'table', x: 0, cups: [-40] }], ch: [max({ x: -200, s: 1.7, e: 'shocked', p: 'sit' }), egor({ x: 200, s: 1.7, f: -1, e: 'smile', p: 'sit' })], ui: [{ k: 'badge', s: '+1 ГОД', at: 0.8 }] }, sfx([0.2, 'shimmer', -12])],
  [196.92, 'Егор: «Ты на моей свадьбе был, дурак. Даже речь произнёс»', face({ ...CAFE, so: { mood: 'golden' } }, egor({ e: 'happy', talk: [0, 4.4], side: 1, x: 120 }))],
  [201.5, '«Ты правда не помнишь?» — «И что я сказал?»', { ...CAFE, so: { mood: 'golden' }, cam: { z: [1.1, 1.14] }, pr: [{ t: 'table', x: 0, cups: [-40] }], ch: [max({ x: -200, s: 1.7, e: 'confused', p: 'sit', talk: [1.4, 2.4] }), egor({ x: 200, s: 1.7, f: -1, e: 'surprised', p: 'sit', talk: [0, 1.2] })] }],
  [204.18, '«Что надо ловить момент»', face({ ...CAFE, so: { mood: 'golden' } }, egor({ e: 'smile', talk: [0, 2], side: 1, x: 120 }), { ui: [{ k: 'thought', s: '«Надо ловить момент»', at: 0.4 }] })],
  [206.62, 'Ты смотришь в чашку с капучино', ins({ ...CAFE, so: { mood: 'golden' } }, 'cupTop')],
  [208.76, 'Тебе 23, и бесит, что тот, другой Максим, говорил хорошие речи', { split: [{ ...VOID('#8fb8e8'), label: 'ТЫ, 23', ch: [max({ s: 1.6, e: 'angry', p: 'crossArms' })] }, { set: 'stage', label: 'ТОТ МАКСИМ', ch: [max({ s: 1.6, e: 'joy', p: 'explain', talk: [0, 6] })] }] }, sfx([0.3, 'applause', -20])],
  [215.44, 'Егор молчит секунд десять', face({ ...CAFE, so: { mood: 'golden' } }, egor({ e: 'thinking', side: 1, x: 120 }), { cam: { z: [1, 1.08] } }), sfx([0.4, 'clock', -14])],
  [219.58, '«Больше не моргай. Вообще»', face({ ...CAFE, so: { mood: 'golden' } }, egor({ e: 'determined', talk: [0, 2.6], side: 1, x: 120 }), { cam: { push: [1, 1.18] } }), sfx([1.8, 'stinger', -12])],
  [222.56, 'Но ты не можешь. Через час ты чихаешь', { ...SALON2, so: { ...SALON2.so, mood: 'golden' }, cam: { z: [1.1, 1.12], shake: 0 }, ch: [max({ x: 0, s: 1.9, e: [[0, 'nervous'], [1.6, 'shocked']], p: [[0, 'stand'], [1.6, 'crouch'], [2.1, 'stand']] })] }, sfx([1.6, 'hit', -10])],
  [225.7, 'Глаза закрываются сами: «Скорее бы выходные»', face(VOID('#9fb6d8', 'interiorCool'), max({ e: 'sleepy', noblink: true }), { cam: { z: [1, 1.15] }, ui: [{ k: 'thought', s: '«Скорее бы выходные»', at: 3.2 }], lid: 'close' }), sfx([4.0, 'whoosh', -8])],

  // ═══ ВТОРОЙ ГОД — МАЛЕНЬКИЙ МАКСИМ
  [230.92, 'Открываешь глаза — дома, звонок в дверь', { ...ROOM, so: { doorOpen: 0.6 }, lid: 'open', ch: [max({ x: -200, s: 1.5, e: 'surprised' })] }, sfx([0.6, 'ding', -12])],
  [232.46, 'Егор стоит у двери, в руках люлька-переноска', { ...ROOM, so: { doorOpen: 0.9 }, cam: { z: [1.05, 1.1] }, pr: [{ t: 'carrier', x: -460, s: 1.4 }], ch: [egor({ x: -540, s: 1.7, e: 'smile', p: 'holdFront' }), max({ x: 0, s: 1.7, f: -1, e: 'surprised' })] }],
  [236.86, 'Егор тихо: «Знакомься. Это Максим»', face(ROOM, egor({ e: 'smile', talk: [0, 3.3], side: 1, x: 120 }))],
  [240.6, 'Ты смотришь на ребёнка — ему уже несколько месяцев', { ...ROOM, cam: { z: [1.3, 1.4], y: [80, 80] }, ch: [baby({ x: 40, s: 1.8, e: 'joy', p: 'wave' }), max({ x: -280, s: 1.8, e: 'awe', p: 'reach' })] }, sfx([0.5, 'pop', -14])],
  [245.94, '«Вы назвали его в мою честь?»', face(ROOM, max({ e: 'surprised', talk: [0, 1.8], x: -120 }))],
  [248.18, 'Егор улыбается: «Ты крёстный»', face(ROOM, egor({ e: 'happy', talk: [1.2, 2.2], side: 1, x: 120 }), { ui: [{ k: 'badge', s: 'КРЁСТНЫЙ', at: 1.2 }] }), sfx([1.2, 'ding', -12])],
  [250.6, '«Ты держал его на крестинах. Плакал больше всех» — воспоминание', { ...ROOM, so: { mood: 'golden' }, fx: { warm: true }, cam: { z: [1.05, 1.12] }, ch: [max({ x: -120, s: 1.6, e: 'cry', p: 'holdFront' }), baby({ x: -40, s: 1.6, e: 'smile', y: -110 }), egor({ x: 300, s: 1.6, f: -1, e: 'joy', p: 'cheer' })] }, { in: { type: 'fade', dur: 0.4 } }],
  [253.9, 'Ты ничего не помнишь. Тебе 24', face(ROOM, max({ e: 'sad' }), { ui: [{ k: 'badge', s: '24 ГОДА', at: 2.6 }] })],
  [258.56, 'Вот тут становится по-настоящему страшно', face(VOID('#5a6aa0', 'night'), max({ e: 'scared' }), { cam: { z: [1, 1.15], shake: 3 } }), { in: { type: 'dip', dur: 0.4 }, ...sfx([0.2, 'heartbeat', -8]) }],
  [262.16, 'Не из-за потерянных лет — а потому что ты понимаешь…', { ...VOID('#5a6aa0', 'night'), cam: { z: [1.1, 1] }, ch: [max({ s: 1.6, e: 'thinking', p: 'think' })] }],
  [265.66, '…Егор не просто так дошёл до этого момента', { ...PARK, so: { mood: 'dusk' }, cam: { z: [1, 1.05] }, ch: [egor({ x: -100, s: 1.2, e: 'smile', p: 'holdFront' }), wife({ x: 120, s: 1.2, f: -1, e: 'happy' }), baby({ x: 10, s: 1.2, e: 'joy', f: -1 })] }],
  [268.86, 'Каждый раз, когда ты моргал, он оставался рядом', { ...PARK, so: { mood: 'dusk' }, cam: { x: [-40, 40] }, ch: [max({ x: -150, s: 1.6, e: 'sad', p: 'sad' }), egor({ x: 120, s: 1.6, f: -1, e: 'smile', p: 'reach' })] }],
  [272.2, 'Он прожил весь этот год и со мной, и без меня', face({ ...PARK, so: { mood: 'dusk' } }, egor({ e: 'smile', side: 1, x: 120 }), { cam: { z: [1, 1.08] } })],
  [275.64, 'И ни разу не бросил', { ...PARK, so: { mood: 'dusk' }, cam: { z: [1.08, 1] }, ch: [max({ x: -110, s: 1.5, e: 'smile' }), egor({ x: 110, s: 1.5, f: -1, e: 'happy', p: 'wave' })] }, sfx([0.3, 'shimmer', -14])],

  // ═══ ЭКСПЕРИМЕНТ
  [277.4, 'Егор сразу покупает в аптеке капли', { set: 'pharmacy', cam: { z: [1, 1.05] }, ch: [egor({ x: -120, s: 1.6, e: 'determined', p: 'reach' })] }, { in: { type: 'whip', dur: 0.3 }, ...sfx([0, 'whoosh', -10]) }],
  [279.4, 'Капли за 490 рублей', ins({ set: 'pharmacy' }, 'drops'), sfx([0.2, 'counter', -12])],
  [281.18, 'Вы сидите на скамейке и не моргаете, как два кота', { ...PARK, cam: { z: [1, 1.08] }, pr: [{ t: 'bench', x: 0, s: 1.4 }], ch: [max({ x: -110, s: 1.4, e: 'shocked', p: 'sit', noblink: true }), egor({ x: 110, s: 1.4, f: -1, e: 'shocked', p: 'sit' })] }, { amb: { name: 'wind', gain: -26 } }],
  [285.54, 'Кажется, глаза сейчас вывалятся', face(PARK, max({ e: 'shocked', noblink: true }), { cam: { z: [1, 1.25], shake: 2 } }), sfx([0.3, 'riser', -12])],
  [288.66, 'Егор достаёт секундомер и засекает', { ...PARK, cam: { z: [1.25, 1.3], x: [100, 100] }, pr: [{ t: 'bench', x: 0, s: 1.4 }], ch: [max({ x: -110, s: 1.4, e: 'shocked', p: 'sit' }), egor({ x: 110, s: 1.4, f: -1, e: 'determined', p: 'phone', prop: 'phone' })] }, sfx([2.4, 'blip', -12])],
  [291.98, 'Секундомер: одна минута, две минуты', ins(PARK, 'stopwatch', { from: 55, speed: 32 }), sfx([0.2, 'clock', -12])],
  [294.56, 'Слёзы текут сами', face(PARK, max({ e: 'cry', tear: true, noblink: true }), { cam: { z: [1, 1.08] } })],
  [296.0, 'И ты наконец понимаешь, зачем людям моргать', { ...PARK, cam: { z: [1.05, 1] }, pr: [{ t: 'bench', x: 0, s: 1.4 }], ch: [max({ x: -110, s: 1.4, e: 'sad', p: 'sit' }), egor({ x: 110, s: 1.4, f: -1, e: 'worried', p: 'sit' })] }],
  [299.84, 'На третьей минуте Егор задумывается', face(PARK, egor({ e: 'thinking', side: 1, x: 120 }))],
  [303.08, '«Подожди, ты каждый раз перед этим что-то говорил»', face(PARK, egor({ e: 'surprised', talk: [0, 3], side: 1, x: 120 }), { cam: { push: [1, 1.12] } }), sfx([0.2, 'ding', -12])],
  [306.4, '«Я только сейчас вспомнил» — «Что?» — «Не помню. Но ты всегда вздыхал»', { ...PARK, cam: { z: [1.12, 1.18] }, pr: [{ t: 'bench', x: 0, s: 1.4 }], ch: [max({ x: -110, s: 1.4, e: 'confused', p: 'sit', talk: [1.8, 2.4] }), egor({ x: 110, s: 1.4, f: -1, e: 'thinking', p: 'sit', talk: [0, 1.6] })] }],
  [309.9, '«Ты всегда вздыхал»', face(PARK, egor({ e: 'determined', talk: [0, 2], side: 1, x: 120 }), { ui: [{ k: 'badge', s: 'ВЗДЫХАЛ', at: 0.8 }] })],

  // ═══ ТРЕТИЙ ГОД
  [312.16, 'Снова салон: не моргаешь уже четвёртый час', { ...SALON2, cam: { z: [1, 1.06] }, ch: [max({ x: -60, s: 1.1, e: 'shocked', noblink: true })], ui: [{ k: 'badge', s: '4-Й ЧАС', at: 0.5 }] }, { in: { type: 'dip', dur: 0.4 }, amb: { name: 'roomtone', gain: -26 } }],
  [316.16, 'Держишься на каплях и упрямстве', { ...SALON2, cam: { z: [1.2, 1.26] }, ch: [max({ x: 0, s: 2.0, e: 'determined', p: 'pointUp' })] }, sfx([0.6, 'blip', -14])],
  [318.64, 'Знакомое за спиной…', { ...SALON2, cam: { z: [1.1, 1.18] }, fg: 'right', ch: [max({ x: -200, s: 1.8, e: 'nervous' }), boss({ walk: [700, 260, 0, 2.4], s: 1.8, e: 'smile' })] }],
  [322.36, '«Максим, премия на этой неделе!»', face(SALON2, boss({ e: 'happy', talk: [0, 2.2], side: 1 }))],
  [324.76, 'Ты не выдерживаешь, злишься, жмуришься', face(SALON2, max({ e: 'angry' }), { cam: { z: [1, 1.1], shake: 6 } }), sfx([0.3, 'hit', -10])],
  [329.16, '«Ну давай уже, хватит!» — и моргаешь', face(VOID('#ff6f61', 'dusk'), max({ e: [[0, 'angry'], [1.6, 'sleepy']], noblink: true }), { cam: { push: [1, 1.3] }, ui: [{ k: 'thought', s: '«Ну давай уже, хватит!»', at: 0, until: 1.5 }], lid: 'close' }), sfx([1.8, 'whoosh', -8])],
  [332.14, 'Открываешь глаза. Тебе 25', face(SALON3, max({ e: 'shocked' }), { lid: 'open', ui: [{ k: 'badge', s: '25 ЛЕТ', at: 1.4 }] }), sfx([1.4, 'stinger', -10])],
  [335.36, 'Салон перекрашен, новая девушка на ресепшене, начальник', { ...SALON3, cam: { z: [1, 1.05], x: [60, -60] }, ch: [girl({ x: -560, s: 1.15, e: 'smile', p: 'wave' }), max({ x: -100, s: 1.15, e: 'worried' }), boss({ x: 260, s: 1.15, f: -1, e: 'smile', p: 'talk', talk: [4, 7] })] }],
  [342.04, '«Максим, премия в этом месяце! Прямо точно!»', face(SALON3, boss({ e: 'joy', talk: [0, 3.3], side: 1 }))],
  [345.86, 'В этот раз ты решаешь довести всё до конца', face(SALON3, max({ e: 'determined' }), { cam: { z: [1, 1.12] } }), sfx([0.4, 'riser', -14])],
  [349.04, 'Егор приходит с пипеткой и шепчет: «Выдержим. Ещё чуть-чуть»', { ...SALON3, cam: { x: [-40, 40] }, ch: [max({ x: -220, s: 1.7, e: 'determined', noblink: true }), egor({ walk: [700, 220, 0, 2.4], s: 1.7, e: 'determined', p: 'holdFront', talk: [4.2, 6.6] })] }],
  [355.98, 'Стоп-кадр: ты не моргаешь — минута, две, три', ins({ ...SALON3, so: { ...SALON3.so } }, 'stopwatch', { from: 50, speed: 36 }), { in: { type: 'flash' }, ...sfx([0, 'freeze', -8], [1.3, 'tick', -10], [2.4, 'tick', -10], [3.5, 'tick', -10]) }],
  [360.18, 'По щеке течёт слеза', face(SALON3, max({ e: 'sad', tear: true, noblink: true }), { cam: { z: [1, 1.1] }, fx: { freeze: true, drops: true } })],
  [362.16, 'Сергей Николаевич идёт к тебе с белым конвертом', { ...SALON3, cam: { x: [-60, 20] }, ch: [max({ x: 260, s: 1.7, f: -1, e: 'shocked', noblink: true }), egor({ x: 520, s: 1.7, f: -1, e: 'worried' }), boss({ walk: [-760, -160, 0, 2.6], s: 1.7, e: 'smile', p: [[0, 'stand'], [2.7, 'reach']] })] }],
  [365.36, '«И вот мы вернулись» — та же сцена, что в начале', { ...SALON3, cam: { z: [1.2, 1], x: [0, 0] }, ch: [max({ x: -120, s: 1.1, e: 'shocked', noblink: true }), egor({ x: 120, s: 1.1, f: -1, e: 'worried' })], ui: [{ k: 'big', s: 'МЫ ВЕРНУЛИСЬ', at: 0.2, y: 160 }] }, { in: { type: 'whip', dur: 0.3 }, ...sfx([0, 'whoosh', -10]) }],
  [367.1, 'Автосалон на Кутузовском, четвёртая минута без моргания', face(SALON3, max({ e: 'shocked', noblink: true, tear: true }), { cam: { z: [1, 1.08] }, fx: { freeze: true }, ui: [{ k: 'badge', s: 'НЕ МОРГАЯ · 4 МИН', at: 0.4 }] }), sfx([0.3, 'heartbeat', -10])],
  [373.14, 'Сергей Николаевич протягивает конверт: «Максим, твоя премия»', { ...SALON3, cam: { z: [1.05, 1.12] }, ch: [max({ x: L, s: 1.8, e: 'surprised', noblink: true }), boss({ x: R, s: 1.8, f: -1, e: 'smile', p: 'reach', talk: [2.7, 4.3] })] }],
  [377.74, '«Почти». — «Почти?!»', face(SALON3, boss({ e: 'smirk', talk: [0, 0.8], side: 1 }))],
  [379.5, '«Три тысячи? Вместо шестидесяти?»', face(SALON3, max({ e: 'angry', talk: [0, 3.4] }), { cam: { push: [1, 1.15] }, ui: [{ k: 'readout', label: 'ПРЕМИЯ:', s: '3 000 ИЗ 60 000', at: 0.3 }] }), sfx([0.3, 'buzz', -12])],
  [383.44, 'Егор наклоняется и шепчет: «Максим, я всё понял»', face(SALON3, egor({ e: 'surprised', talk: [2.5, 4.2], side: 1, x: 120 }))],
  [387.98, '«Перед каждым разом ты вздыхал и говорил „скорее бы“. Четыре раза из четырёх»', { ...SALON3, cam: { z: [1.1, 1.16] }, ch: [max({ x: L, s: 1.8, e: 'surprised' }), egor({ x: R, s: 1.8, f: -1, e: 'determined', p: 'explain', talk: [0, 5.5] })], ui: [{ k: 'badge', s: '4 ИЗ 4', at: 3.7 }] }, sfx([3.7, 'ding', -12])],
  [393.66, '«Не после чихания, не от усталости…»', face(SALON3, egor({ e: 'determined', talk: [0, 2.5], side: 1, x: 120 }))],
  [396.14, '«…только когда ты хотел, чтобы время побыстрее прошло»', { ...SALON3, cam: { z: [1.15, 1.22] }, ch: [max({ x: L, s: 1.8, e: 'awe' }), egor({ x: R, s: 1.8, f: -1, e: 'determined', p: 'point', talk: [0, 3.4] })] }],
  [399.86, 'Ты замираешь. Все четыре раза', face(VOID('#9fb6d8', 'interiorCool'), max({ e: 'awe', noblink: true }), { cam: { z: [1, 1.15] }, fx: { freeze: true, drops: true } }), { in: { type: 'flash' }, ...sfx([0, 'freeze', -8]) }],
  // эхо четырёх «скорее бы»
  [402.98, 'Вспышка: «Скорее бы вечер»', face(SALON, max({ e: 'sleepy' }), { ui: [{ k: 'thought', s: '«Скорее бы вечер»', at: 0 }] }), { in: { type: 'flash' }, ...sfx([0, 'flash', -12]) }],
  [404.24, 'Вспышка: «Ну когда уже эта премия?»', face(SALON2, max({ e: 'sad' }), { ui: [{ k: 'thought', s: '«Ну когда уже эта премия?»', at: 0 }] }), { in: { type: 'flash' }, ...sfx([0, 'flash', -12]) }],
  [406.08, 'Вспышка: «Скорее бы выходные»', face(CAFE, max({ e: 'sleepy' }), { ui: [{ k: 'thought', s: '«Скорее бы выходные»', at: 0 }] }), { in: { type: 'flash' }, ...sfx([0, 'flash', -12]) }],
  [407.62, 'Вспышка: «Давай уже, хватит!»', face(VOID('#ff6f61', 'dusk'), max({ e: 'angry' }), { ui: [{ k: 'thought', s: '«Давай уже, хватит!»', at: 0 }] }), { in: { type: 'flash' }, ...sfx([0, 'flash', -12]) }],
  [409.2, 'Ты не терял год от моргания. Ты отдавал его сам', { ...VOID('#ffc68a', 'dusk'), cam: { z: [1, 1.1] }, ch: [max({ s: 1.8, e: 'sad', p: 'sad' })], ui: [{ k: 'big', s: 'ТЫ ОТДАВАЛ ЕГО САМ', at: 2.0, y: 150 }] }, sfx([2.0, 'stinger', -10])],
  [412.96, 'Каждый раз, когда просил, чтобы он закончился', { ...VOID('#ffc68a', 'dusk'), cam: { z: [1.1, 1.0] }, ch: [max({ s: 1.6, e: 'thinking', p: 'think' })] }],
  [416.26, 'Глаза горят. Ты смотришь на Егора', face(SALON3, egor({ e: 'smile', side: 1, x: 120 }))],
  [419.24, 'На конверт', ins(SALON3, 'envelope', { label: 'ПРЕМИЯ' })],
  [420.2, 'На красный кроссовер', { ...SALON3, cam: { z: [1.6, 1.7], x: [400, 420], y: [60, 60] } }],
  [421.6, 'На Сергея Николаевича с идиотской надеждой на лице', face(SALON3, boss({ e: 'joy', side: 1 })), sfx([1.0, 'pop', -14])],

  // ═══ РАЗВЯЗКА
  [425.9, 'И впервые за много недель ты говоришь себе другое', face(VOID('#ffc68a', 'golden'), max({ e: [[0, 'neutral'], [3.0, 'smile']] }), { cam: { z: [1, 1.08] } }), { in: { type: 'fade', dur: 0.5 } }],
  [430.86, '«Пусть будет сегодня. Пусть этот день будет именно этим»', face(VOID('#ffc68a', 'golden'), max({ e: 'smile' }), { cam: { z: [1.08, 1.14] }, fx: { warm: true }, ui: [{ k: 'thought', s: '«Пусть будет сегодня»', at: 0.2 }] }), sfx([0.3, 'shimmer', -12])],
  [435.7, 'И моргаешь', face(VOID('#ffc68a', 'golden'), max({ e: 'sleepy', noblink: true }), { lid: 'blink', lidAt: 0.6 }), sfx([0.3, 'heartbeat', -10])],
  [437.02, 'Ничего не происходит', face(SALON3, max({ e: 'surprised' }), { cam: { z: [1, 1.04] } }), sfx([0.4, 'tick', -12])],
  [438.7, 'Тот же салон, тот же календарь, тот же Егор рядом', { ...SALON3, cam: { z: [1.06, 1] }, ch: [max({ x: -200, s: 1.2, e: 'happy' }), egor({ x: 20, s: 1.2, f: -1, e: 'smile' }), boss({ x: 300, s: 1.2, f: -1, e: 'neutral', p: 'holdFront' })] }],
  [442.64, 'Сергей Николаевич хмурится: «Ты чего моргаешь?»', face(SALON3, boss({ e: [[0, 'confused'], [1.0, 'angry']], talk: [1.0, 2.6], side: 1 }))],
  [446.0, 'Егор складывается пополам от смеха и вытирает слёзы', { ...SALON3, cam: { z: [1.12, 1.18] }, ch: [egor({ x: 60, s: 1.8, f: -1, e: [[0, 'joy'], [2.4, 'cry']], p: [[0, 'crouch'], [2.3, 'facepalm']] }), max({ x: -260, s: 1.8, e: 'happy' })] }, sfx([0.6, 'pop', -12])],
  [450.26, 'Первый раз за четыре года ты моргаешь просто так', face(VOID('#ffc68a', 'golden'), max({ e: 'happy' }), { cam: { z: [1, 1.06] } })],
  [455.06, 'И это лучшее чувство в твоей жизни', { ...VOID('#ffc68a', 'golden'), cam: { z: [1, 1.08] }, fx: { warm: true }, ch: [max({ s: 1.8, e: 'joy', p: 'cheer' })] }, sfx([0.3, 'shimmer', -10])],
  [458.16, 'Ты вскрываешь конверт: три тысячи рублей и записка', ins(SALON3, 'envelope', { label: '3 000 РУБ.', open: 1.6, note: '' }), sfx([1.6, 'counter', -12])],
  [462.6, 'Записка: «Остальное — в следующем месяце»', ins(SALON3, 'envelope', { label: 'ЗАПИСКА', open: 0.0, note: 'ОСТАЛЬНОЕ — ПОТОМ' }), { ...sfx([0.3, 'pop', -14]), ui: [] }],
  [464.96, 'Ты смотришь на неё и начинаешь смеяться тоже', { ...SALON3, cam: { z: [1.05, 1] }, ch: [max({ x: -140, s: 1.6, e: 'joy', p: 'cheer' }), egor({ x: 160, s: 1.6, f: -1, e: 'joy', p: 'crouch' })] }],
  [468.8, 'В субботу ты приезжаешь к Егору', { ...ROOM, so: { doorOpen: 0.7, mood: 'golden' }, cam: { z: [1, 1.05] }, ch: [max({ walk: [-640, -240, 0, 2.2], s: 1.4, e: 'happy' }), egor({ x: 260, s: 1.4, f: -1, e: 'joy', p: 'wave' })] }, { in: { type: 'dip', dur: 0.5 } }],
  [471.12, 'Маленький Максим сидит на ковре и тянет к тебе руки', { ...ROOM, so: { mood: 'golden' }, cam: { z: [1.4, 1.5], y: [90, 90] }, ch: [baby({ x: 0, s: 2.0, e: 'joy', p: 'reach', f: -1 })] }, sfx([0.6, 'pop', -14])],
  [474.42, 'Ты не помнишь крестин — но сейчас берёшь его на руки', { ...ROOM, so: { mood: 'golden' }, fx: { warm: true }, cam: { z: [1.08, 1.16] }, ch: [max({ x: -60, s: 1.8, e: 'happy', p: 'holdFront' }), baby({ x: 30, s: 1.8, e: 'joy', y: -130, p: 'cheer', f: -1 }), egor({ x: 380, s: 1.8, f: -1, e: 'smile' })] }],
  [478.3, 'И это уже твой момент', face({ ...ROOM, so: { mood: 'golden' } }, max({ e: 'happy' }), { fx: { warm: true }, ui: [{ k: 'big', s: 'ТВОЙ МОМЕНТ', at: 0.6, y: 150 }] }), sfx([0.6, 'shimmer', -12])],
  [481.16, 'И никто не заберёт его у тебя', { ...ROOM, so: { mood: 'golden' }, cam: { z: [1.15, 1] }, ch: [max({ x: -100, s: 1.5, e: 'smile', p: 'holdFront' }), baby({ x: -30, s: 1.5, e: 'smile', y: -110, f: -1 }), egor({ x: 260, s: 1.5, f: -1, e: 'smile' })] }],

  // ═══ ФИНАЛ
  [483.26, 'Вопрос зрителю: какой год ты бы пропустил, а какой не отдал бы?', { end: { q: ['Какой год ты бы пропустил,', 'а какой не отдал бы ни за что?'], subAt: 4.5 } }, { in: { type: 'fade', dur: 0.6 } }],
  [490.58, 'Подписывайся: Сергей Николаевич обещал следующую серию в следующем месяце', face(SALON3, boss({ e: 'smile', talk: [0, 6.2], side: 1 }), { ui: [{ k: 'badge', s: 'СЛЕДУЮЩАЯ СЕРИЯ — СКОРО', at: 3.0 }] })],
  [497.38, 'Каждая история начинается со слова «если»', { ...VOID('#ffc68a', 'dusk'), cam: { z: [1, 1.08] }, ui: [{ k: 'title', lines: ['КАЖДАЯ ИСТОРИЯ НАЧИНАЕТСЯ', 'СО СЛОВА «ЕСЛИ»'], at: 0.1 }] }, { in: { type: 'fade', dur: 0.5 }, ...sfx([0.2, 'shimmer', -12]) }],
];

// ── сборка
const r2 = (x) => Math.round(x * 100) / 100;
const lineAt = (a, b) => W.filter((w) => w.start >= a - 0.05 && w.start < b - 0.05).map((w) => w.word).join(' ').trim();
const shots = P.map(([t, scene, v, extra = {}], i) => {
  const start = i === 0 ? 0 : r2(Math.max(0, t - 0.15));
  const end = i + 1 < P.length ? r2(P[i + 1][0] - 0.15) : DURATION;
  const set = v.set || (v.bp ? 'blueprint' : v.end ? 'end' : v.split ? 'split' : 'void');
  return { id: `s${String(i + 1).padStart(3, '0')}`, start, end, line: lineAt(start, end), scene, set, bars: null, in: extra.in || { type: 'cut' }, sfx: extra.sfx || [], amb: extra.amb || null, params: { v } };
});
const T = (s) => shots.find((x) => x.scene.startsWith(s)).start;
const music = [
  { start: 0, end: T('ТИТР'), mood: 'mystery', intensity: 0.5 },
  { start: T('ТИТР'), end: T('Максим машет'), mood: 'wonder', intensity: 0.5 },
  { start: T('Максим машет'), end: T('Открывает глаза — тот же'), mood: 'calm', intensity: 0.3 },
  { start: T('Открывает глаза — тот же'), end: T('Схема: человек'), mood: 'mystery', intensity: 0.45 },
  { start: T('Схема: человек'), end: T('В обед'), mood: 'wonder', intensity: 0.35 },
  { start: T('В обед'), end: T('Вот тут'), mood: 'playful', intensity: 0.35 },
  { start: T('Вот тут'), end: T('Егор сразу'), mood: 'sad', intensity: 0.4 },
  { start: T('Егор сразу'), end: T('Снова салон'), mood: 'hopeful', intensity: 0.4 },
  { start: T('Снова салон'), end: T('И впервые'), mood: 'tension', intensity: 0.6 },
  { start: T('И впервые'), end: T('Вопрос зрителю'), mood: 'hopeful', intensity: 0.5 },
  { start: T('Вопрос зрителю'), end: DURATION, mood: 'triumph', intensity: 0.4 },
];
fs.writeFileSync(DIR + 'shots.json', JSON.stringify({ title: 'Что, если каждое моргание забирает год жизни?', duration: DURATION, shots, music, sfx: [] }, null, 1));
const lens = shots.map((s) => s.end - s.start).sort((a, b) => a - b);
console.log(`${shots.length} кадров, ${DURATION} c, медиана ${lens[lens.length >> 1].toFixed(2)} c, самый длинный ${lens[lens.length - 1].toFixed(2)} c`);
