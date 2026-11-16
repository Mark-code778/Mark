// Генератор раскадровки: node scripts/build-project.mjs -> data/project.json
// Сюжет: «Если бы каждое моргание стоило год» (Максим, Егор, Сергей Николаевич)
import { writeFileSync } from "node:fs";

const DURATION = 501;

// ── Каст ──────────────────────────────────────────────
const MAX = { id: "max", shirt: "#e8692e", sleeves: "long", pants: "#3c5288", hair: "none", outfit: "hoodie" }; // оранжевое худи
const EGOR = { id: "egor", shirt: "#3fae62", sleeves: "short", pants: "#5a4a3f", hair: "cap", hairColor: "#2e7d46", outfit: "tee" }; // зелёный
const BOSS = { id: "boss", shirt: "#454a58", sleeves: "long", pants: "#262a34", hair: "none", outfit: "suit" }; // Сергей Николаевич
const BABY = { id: "baby", shirt: "#8fd0f2", sleeves: "short", scale: 0.5, hair: "puff", hairColor: "#6b4a2b" };
const WIFE = { id: "wife", shirt: "#ffffff", sleeves: "short", hair: "bob", hairColor: "#6b4a2b", pants: "#f4f4f4" };
const GIRL = { id: "girl", shirt: "#e86aa6", sleeves: "short", hair: "bun", hairColor: "#3a2a20" };

const max = (o = {}) => ({ ...MAX, x: 0, z: 0.5, ...o });
const egor = (o = {}) => ({ ...EGOR, x: 0, z: 0.5, ...o });
const boss = (o = {}) => ({ ...BOSS, x: 0, z: 0.5, ...o });
const baby = (o = {}) => ({ ...BABY, x: 0, z: 0.5, ...o });

// ── Салон (office + машина + часы) ───────────────────
const GREY = "#9aa3ad";
const RED = "#e0453a";
const car = (color = GREY, o = {}) => ({ type: "car", x: 3.2, z: -2.2, rotation: -25, color, ...o });
const clock = (o = {}) => ({ type: "clock", x: -3.2, z: -7.8, y: 3.3, ...o });
const salon = (o = {}) => ({
  location: "office",
  props: [car(o.carColor ?? GREY), clock(), { type: "plant", x: -5.5, z: -3 }, ...(o.props ?? [])],
  screen: o.screen ?? { lines: ["АВТОСАЛОН"] },
  time: o.time,
});
const two = (a, b, o = {}) => [
  { facing: 55, ...a, x: -1.1, z: 0.4 },
  { facing: -55, ...b, x: 1.1, z: 0.4 },
];
const cam = (shot, move = "static", target, extra = {}) => ({ shot, move, ...(target !== undefined ? { target } : {}), ...extra });
const title = (text, at = 0.3, position = "center", size = "big") => ({ text, at, position, size });

// ── Сцены: [время первого слова фразы, описание] ──────
const S = [];
const sc = (t, note, spec) => S.push({ t, note, ...spec });

// ХУК — четыре моргания
sc(0, "Ты моргаешь, и тебе уже 22.", {
  location: "street", transition: "blink", camera: cam("close", "push", "max"),
  actors: [max({ face: "surprised", beats: [{ at: 1.2, face: "worried" }] })],
  title: title("22.", 1.0, "left"), sfx: [{ name: "whoosh", at: 0.2 }],
});
sc(3.14, "Моргаешь ещё раз — Егор женат.", {
  location: "park", time: "day", transition: "blink", camera: cam("medium", "dolly-in"),
  actors: [egor({ x: 0.2, action: "cheer", face: "grin" }), { ...WIFE, x: 1.5, z: 0.3, action: "cheer", face: "happy", facing: -20 }, max({ x: -2.3, z: 1, face: "surprised", facing: 40 })],
  title: title("ЖЕНАТ.", 0.6, "left", "medium"), sfx: [{ name: "sparkle", at: 0.5 }],
});
sc(7.02, "Моргаешь в третий раз — у Егора сын Максим.", {
  location: "room", transition: "blink", camera: cam("medium", "dolly-in", [0, -0.4, 0.4]),
  actors: [egor({ x: 0.9, face: "happy", facing: -30 }), baby({ x: 0, z: 0.9, action: "wave", face: "happy" }), max({ x: -1.8, face: "surprised", facing: 40, action: "scared" })],
  sfx: [{ name: "pop", at: 0.6 }],
});
sc(11.98, "Моргаешь в четвёртый раз — посреди автосалона на Кутузовском…", {
  ...salon({ carColor: RED }), transition: "blink", camera: cam("wide", "dolly-in", "max"),
  actors: [max({ x: 0, z: 0.8, face: "surprised" })],
  sfx: [{ name: "heartbeat", at: 0.6 }],
});
sc(15.6, "…не моргая четвёртую минуту.", {
  location: "studio", bg: "#2a3d5c", camera: cam("extreme", "dolly-in", "max"),
  actors: [max({ face: "scared" })], title: title("НЕ МОРГАЯ.", 0.4, "left"),
  sfx: [{ name: "heartbeat", at: 0.2 }],
});
sc(19.36, "Сергей Николаевич протягивает конверт.", {
  ...salon({ carColor: RED }), camera: cam("medium", "dolly-in", undefined, { angle: 20 }),
  actors: two(max({ face: "scared" }), boss({ held: "sign", heldText: "ПРЕМИЯ", face: "smirk", action: "point" })),
});
sc(21.96, "«Максим, твоя премия».", {
  ...salon({ carColor: RED }), camera: cam("close", "push", "boss"),
  actors: two(max({ face: "scared" }), boss({ held: "sign", heldText: "ПРЕМИЯ", face: "grin", action: "talk", talking: true })),
});
sc(23.96, "А Егор вытирает тебе слёзы.", {
  ...salon({ carColor: RED }), camera: cam("medium", "dolly-in", "max", { angle: -25 }),
  actors: [max({ x: -0.6, action: "cry", face: "sad" }), egor({ x: 0.7, z: 0.6, facing: -60, face: "happy", action: "wave" })],
});

// ЗАВЯЗКА
sc(26.48, "А теперь давай сначала.", {
  location: "studio", bg: "#f2c48d", transition: "fade", camera: cam("wide", "dolly-out", "max"),
  actors: [max({ face: "neutral" })], sfx: [{ name: "swoosh", at: 0.1 }],
});
sc(28.04, "Тебя зовут Максим. Тебе 21 год.", {
  location: "studio", bg: "#f2c48d", camera: cam("medium", "dolly-in", "max"),
  actors: [max({ action: "wave", face: "grin" })], title: title("МАКСИМ, 21.", 0.5, "left"),
});
sc(31.74, "Москва, менеджер в автосалоне.", {
  ...salon({ screen: { lines: ["АВТОСАЛОН", "МОСКВА"] } }), transition: "whip", camera: cam("wide", "pan-right"),
  actors: [max({ x: 0.5, z: 0.6, action: "point", facing: 50, face: "happy" })],
});
sc(35.36, "Начальник Сергей Николаевич больше месяца обещает премию.", {
  ...salon({ screen: { lines: ["ПРЕМИЯ", "СКОРО"] } }), camera: cam("medium", "dolly-in", undefined, { angle: 20 }),
  actors: two(boss({ action: "talk", talking: true, face: "grin" }), max({ action: "think", face: "worried" })),
});
sc(40.7, "Лучший друг Егор знает о тебе всё…", {
  location: "park", camera: cam("medium", "pan-right", "max"),
  actors: [max({ x: -3, z: 0.3, action: "walk", to: [1.5, 0.3], face: "happy" }), egor({ x: -1.8, z: 0.6, action: "walk", to: [2.7, 0.6], face: "grin", talking: true })],
});
sc(44.4, "…даже то, что ты не любишь тёмные подъезды.", {
  location: "street", time: "night", camera: cam("medium", "shake", "max"),
  actors: [max({ action: "scared", face: "scared" })], sfx: [{ name: "heartbeat", at: 0.3 }],
});
sc(48.06, "И всё это начинается в обычный понедельник.", {
  ...salon({ screen: { lines: ["ПОНЕДЕЛЬНИК"] } }), transition: "fade", camera: cam("wide", "dolly-in"),
  actors: [max({ x: -0.5, face: "neutral" })], sfx: [{ name: "tick", at: 0.5 }],
});
sc(51.84, "Серый кроссовер за 3 899 000 рублей.", {
  ...salon({ screen: { lines: ["3 899 000", "РУБЛЕЙ"] } }), camera: cam("medium", "orbit", [2.2, 0.3, -1.4]),
  actors: [max({ x: 0.4, z: 0.4, facing: 40, face: "neutral" })],
});
sc(57.94, "Клиентов нет.", {
  ...salon(), camera: cam("wide", "static", undefined, { height: 1 }),
  actors: [max({ x: 0, z: 0.4, action: "shrug", face: "sad" })],
});
sc(59.1, "Кофе остыл ещё в девять утра.", {
  ...salon(), camera: cam("close", "dolly-in", "max"),
  actors: [max({ held: "cup", face: "sleepy" })],
});
sc(61.42, "Мимо проходит Сергей Николаевич, хлопает по плечу…", {
  ...salon(), camera: cam("medium", "static", undefined, { angle: 15 }),
  actors: [max({ x: 0.9, z: 0.4, held: "cup", face: "neutral", facing: -40 }), boss({ x: -5, z: 0.8, action: "walk", to: [-0.4, 0.6], face: "grin", beats: [{ at: 3.2, action: "wave", facing: 50 }] })],
});
sc(65.2, "«Максим, премия на этой неделе. Точно».", {
  ...salon(), camera: cam("close", "dolly-in", "boss"),
  actors: two(boss({ action: "talk", talking: true, face: "grin" }), max({ held: "cup", face: "neutral" })),
});
sc(69.28, "Эту фразу ты слышишь 34-й день подряд.", {
  location: "studio", bg: "#a8c6e8", camera: cam("medium", "dolly-in", "max"),
  actors: [max({ action: "facepalm", face: "sad" })], title: title("34-Й ДЕНЬ.", 0.4, "left"),
  sfx: [{ name: "buzz", at: 0.5 }],
});
sc(73.12, "До конца смены — восемь часов.", {
  location: "studio", bg: "#f6d9a8", camera: cam("medium", "dolly-in", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["ДО КОНЦА", "СМЕНЫ 8:00"] }], sfx: [{ name: "tick", at: 0.3 }, { name: "tick", at: 1.3 }],
  title: title("8 ЧАСОВ.", 0.5, "right", "medium"),
});
sc(75.5, "Смотришь на часы над кассой, в голове одна мысль…", {
  ...salon(), camera: cam("medium", "dolly-in", "max", { angle: 40 }),
  actors: [max({ x: -1, z: 0.2, facing: -150, face: "sleepy", action: "think" })],
});
sc(79.84, "«Скорее бы всё это закончилось».", {
  location: "studio", bg: "#7d8fb3", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "sad" })], title: title("СКОРЕЕ БЫ…", 0.4, "left"),
});
sc(82.22, "И ты моргаешь.", {
  location: "studio", bg: "#7d8fb3", camera: cam("extreme", "push", "max"),
  actors: [max({ face: "sleepy" })], sfx: [{ name: "whoosh", at: 0.8 }],
});

// ПЕРВЫЙ ПОТЕРЯННЫЙ ГОД
sc(83.64, "Ты открываешь глаза.", {
  ...salon({ carColor: RED }), transition: "blink", camera: cam("close", "static", "max"),
  actors: [max({ face: "surprised" })],
});
sc(85.66, "Часы над кассой — та же минута.", {
  ...salon({ carColor: RED }), camera: cam("close", "dolly-in", [-3.2, 1.9, -7.6]),
  sfx: [{ name: "tick", at: 0.3 }, { name: "tick", at: 1.3 }, { name: "tick", at: 2.3 }],
});
sc(89.0, "Но кроссовер почему-то красный.", {
  ...salon({ carColor: RED }), camera: cam("medium", "push", [2.6, 0.2, -1.6]),
  actors: [max({ x: -0.8, z: 0.6, facing: 60, face: "surprised", action: "point" })], sfx: [{ name: "glitch", at: 0.3 }],
});
sc(91.04, "На ценнике 4 200 000, на стене новый календарь.", {
  ...salon({ carColor: RED, screen: { lines: ["4 200 000", "РУБЛЕЙ"] } }), camera: cam("wide", "dolly-in"),
  actors: [max({ x: 0, z: 0.8, facing: "away", face: "surprised" })], sfx: [{ name: "cash", at: 0.5 }],
});
sc(96.52, "Ты достаёшь телефон.", {
  ...salon({ carColor: RED }), camera: cam("close", "static", "max"),
  actors: [max({ held: "phone", face: "worried" })], sfx: [{ name: "click", at: 0.4 }],
});
sc(98.12, "Год на экране на один больше.", {
  location: "studio", bg: "#2f9e94", camera: cam("medium", "dolly-in", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["2027 → 2028", "+1 ГОД"] }], title: title("+1 ГОД.", 0.5, "left"),
  sfx: [{ name: "glitch", at: 0.4 }],
});
sc(101.32, "Мимо снова проходит Сергей Николаевич…", {
  ...salon({ carColor: RED }), camera: cam("medium", "static", undefined, { angle: -15 }),
  actors: [max({ x: 0.9, z: 0.4, held: "phone", face: "worried", facing: -40 }), boss({ x: -5, z: 0.8, action: "walk", to: [-0.4, 0.6], face: "grin", beats: [{ at: 3.0, action: "talk", talking: true, facing: 50 }] })],
});
sc(104.7, "«Максим, премия на этой неделе. Точно».", {
  ...salon({ carColor: RED }), camera: cam("close", "dolly-in", "boss"),
  actors: two(boss({ action: "talk", talking: true, face: "grin" }), max({ face: "angry" })),
});
sc(108.08, "Ты не выдерживаешь: «Вы мне это говорили год назад!»", {
  ...salon({ carColor: RED }), camera: cam("close", "push", "max"),
  actors: two(boss({ face: "neutral" }), max({ action: "angry", face: "angry", talking: true })),
  sfx: [{ name: "impact", at: 1.4 }],
});
sc(111.38, "Он даже не останавливается: «Тогда квартал был другой».", {
  ...salon({ carColor: RED }), camera: cam("medium", "pan-right", "boss"),
  actors: [max({ x: -1.2, z: 0.4, face: "angry", facing: 60 }), boss({ x: 0, z: 0.6, action: "walk", to: [4.5, 0.2], face: "smirk", talking: true })],
});
sc(115.98, "В галерее 342 новые фотографии.", {
  location: "studio", bg: "#e8a0bf", transition: "whip", camera: cam("medium", "dolly-in", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["ГАЛЕРЕЯ", "342 НОВЫХ"] }], title: title("342 ФОТО.", 0.5, "left"),
});
sc(119.62, "На всех ты улыбаешься: кафе, набережная, море.", {
  split: {
    left: { location: "cafe", label: "КАФЕ", camera: cam("medium"), actors: [max({ action: "cheer", face: "grin" })] },
    right: { location: "park", label: "МОРЕ", camera: cam("medium"), actors: [max({ action: "dance", face: "grin" })] },
  },
  sfx: [{ name: "click", at: 0.3 }, { name: "click", at: 2.0 }],
});
sc(124.42, "Ты не помнишь ни одной.", {
  location: "studio", bg: "#8a93b8", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "worried", action: "think" })],
});
sc(126.16, "Кто-то прожил этот год вместо тебя — и ему было весело.", {
  split: {
    left: { bg: "#ffd27a", label: "ОН", camera: cam("medium"), actors: [max({ action: "dance", face: "grin" })] },
    right: { bg: "#8a93b8", label: "ТЫ", camera: cam("medium"), actors: [max({ action: "shrug", face: "sad" })] },
  },
});
sc(131.52, "Это правда. И это не твоя вина.", {
  location: "studio", bg: "#8a93b8", camera: cam("medium", "dolly-out", "max"),
  actors: [max({ face: "sad" })],
});

// НАУКА
sc(134.74, "Человек моргает 15–20 раз в минуту.", {
  location: "lab", transition: "whip", screen: { lines: ["15–20 РАЗ", "В МИНУТУ"] }, camera: cam("medium", "dolly-in", undefined, { angle: 20 }),
  actors: [max({ x: 1.8, z: 0.4, facing: -60, action: "point", face: "surprised" })],
});
sc(138.32, "Примерно 10% времени глаза закрыты.", {
  location: "lab", screen: { lines: ["ГЛАЗА", "ЗАКРЫТЫ"], progress: { label: "ВРЕМЯ", from: 0, to: 10 } }, camera: cam("medium", "dolly-in"),
  actors: [max({ x: 2.6, z: 0.4, facing: -60, face: "surprised", action: "point" })],
});
sc(143.8, "Мозг вырезает эти секунды, поэтому мир не мигает.", {
  location: "lab", screen: { lines: ["МОЗГ", "МОНТИРУЕТ"] }, camera: cam("medium", "orbit", "max"),
  actors: [max({ x: 1.8, action: "think", face: "smirk" })], sfx: [{ name: "scribble", at: 0.6 }],
});
sc(149.24, "Но если бы каждое моргание стоило год…", {
  location: "studio", bg: "#3a3f66", camera: cam("medium", "dolly-in", [0, 1, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["1 МОРГАНИЕ", "= 1 ГОД"] }], sfx: [{ name: "rise", at: 0.5 }],
});
sc(152.6, "…за минуту ты бы состарился лет на 15.", {
  location: "studio", bg: "#3a3f66", camera: cam("close", "push", "max"),
  actors: [max({ face: "scared", action: "scared" })], title: title("+15 ЛЕТ.", 0.4, "left"), sfx: [{ name: "impact", at: 0.4 }],
});
sc(155.9, "К обеду тебе было бы больше, чем Сергею Николаевичу.", {
  split: {
    left: { bg: "#f7c59f", label: "ТЫ", camera: cam("medium"), actors: [max({ face: "scared", action: "scared" })] },
    right: { bg: "#8fd6df", label: "ШЕФ", camera: cam("medium"), actors: [boss({ face: "smirk", action: "idle" })] },
  },
  sfx: [{ name: "boing", at: 1.2 }],
});
sc(159.52, "Повезло в одном: ты ещё не знаешь, что это работает не всегда.", {
  location: "studio", bg: "#5a7fa8", camera: cam("medium", "dolly-in", "max"),
  actors: [max({ action: "think", face: "worried" })], title: title("НЕ ВСЕГДА.", 2.4, "left"),
});

// КОФЕЙНЯ
sc(165.22, "В обед ты бежишь к Егору.", {
  location: "street", transition: "whip", camera: cam("medium", "pan-right", "max"),
  actors: [max({ x: -5, z: 0.4, action: "run", to: [4, 0.4], face: "worried" })],
});
sc(166.9, "Кофейня напротив салона. Капучино за 350.", {
  location: "cafe", camera: cam("wide", "dolly-in"),
  actors: [egor({ x: 1.2, z: 0, held: "cup", face: "happy", action: "wave", facing: -30 }), max({ x: -2.5, z: 0.8, action: "walk", to: [-1, 0.4], face: "worried" })],
  sfx: [{ name: "ding", at: 0.4 }],
});
sc(171.08, "Ты рассказываешь всё, он слушает и жуёт круассан.", {
  location: "cafe", camera: cam("medium", "static", undefined, { angle: 20 }),
  actors: two(max({ action: "talk", talking: true, face: "worried" }), egor({ held: "cup", face: "neutral" })),
});
sc(175.6, "«Ты неделю ходишь странный, но чтобы год пропал — это новое».", {
  location: "cafe", camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "worried" }), egor({ held: "cup", action: "talk", talking: true, face: "smirk" })),
});
sc(180.12, "«Скажи что-нибудь, что я мог пропустить».", {
  location: "cafe", camera: cam("close", "dolly-in", "max"),
  actors: two(max({ action: "talk", talking: true, face: "worried" }), egor({ held: "cup", face: "neutral" })),
});
sc(183.72, "Он пожимает плечами: «Ничего, всё как обычно».", {
  location: "cafe", camera: cam("medium", "static", "egor", { angle: -20 }),
  actors: two(max({ face: "worried" }), egor({ action: "shrug", face: "neutral", talking: true })),
});
sc(187.4, "«Слушай, давай проверим. Моргни».", {
  location: "cafe", camera: cam("close", "push", "egor"),
  actors: two(max({ face: "scared" }), egor({ action: "point", face: "smirk", talking: true })),
  title: title("МОРГНИ.", 3.3, "right"),
});
sc(191.5, "Ты моргаешь.", {
  location: "cafe", camera: cam("extreme", "static", "max"),
  actors: [max({ face: "sleepy" })], sfx: [{ name: "whoosh", at: 0.6 }],
});
sc(192.78, "Егор напротив — с бородой и кольцом.", {
  location: "cafe", time: "sunset", transition: "blink", camera: cam("medium", "dolly-in", "egor"),
  actors: two(max({ face: "surprised" }), egor({ hair: "bun", held: "cup", face: "grin" })),
  title: title("ГОД СПУСТЯ.", 1.0, "left", "medium"),
});
sc(196.92, "«Ты на моей свадьбе был, дурак. Даже речь произнёс».", {
  location: "cafe", time: "sunset", camera: cam("close", "static", "egor"),
  actors: two(max({ face: "surprised" }), egor({ hair: "bun", action: "talk", talking: true, face: "grin" })),
});
sc(201.5, "«Ты правда не помнишь?» — «И что я сказал?»", {
  location: "cafe", time: "sunset", camera: cam("medium", "static", undefined, { angle: 25 }),
  actors: two(max({ face: "worried", talking: true, action: "shrug" }), egor({ hair: "bun", face: "surprised" })),
});
sc(204.18, "«Что надо ловить момент».", {
  location: "cafe", time: "sunset", camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "worried" }), egor({ hair: "bun", action: "talk", talking: true, face: "happy" })),
  title: title("ЛОВИ МОМЕНТ.", 0.3, "right"),
});
sc(206.62, "Ты смотришь в чашку с капучино.", {
  location: "cafe", time: "sunset", camera: cam("close", "dolly-in", "max"),
  actors: [max({ held: "cup", face: "sad" })],
});
sc(208.76, "Тебе 23, и бесит, что тот, другой Максим, говорил хорошие речи.", {
  split: {
    left: { bg: "#8a93b8", label: "ТЫ, 23", camera: cam("medium"), actors: [max({ face: "angry", action: "angry" })] },
    right: { location: "stage", label: "ТОТ МАКСИМ", camera: cam("medium"), actors: [max({ action: "talk", talking: true, face: "grin" })] },
  },
});
sc(215.44, "Егор молчит секунд десять…", {
  location: "cafe", time: "sunset", camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "sad" }), egor({ hair: "bun", action: "think", face: "worried" })),
  sfx: [{ name: "tick", at: 0.5 }, { name: "tick", at: 1.5 }, { name: "tick", at: 2.5 }],
});
sc(219.58, "«Больше не моргай. Вообще».", {
  location: "cafe", time: "sunset", camera: cam("close", "push", "egor"),
  actors: two(max({ face: "scared" }), egor({ hair: "bun", action: "point", talking: true, face: "angry" })),
  title: title("НЕ МОРГАЙ.", 0.3, "right"),
});
sc(222.56, "Но ты не можешь. Через час ты чихаешь.", {
  location: "street", time: "sunset", camera: cam("medium", "static", "max"),
  actors: [max({ face: "worried", beats: [{ at: 2.6, action: "jump", face: "surprised" }] })],
  sfx: [{ name: "boing", at: 2.7 }],
});
sc(225.7, "Глаза закрываются сами: «Скорее бы выходные».", {
  location: "studio", bg: "#7d8fb3", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "sleepy" })], title: title("СКОРЕЕ БЫ ВЫХОДНЫЕ.", 3.3, "left", "medium"),
});

// ВТОРОЙ ГОД — МАЛЕНЬКИЙ МАКСИМ
sc(230.92, "И открываешь их.", {
  location: "room", transition: "blink", camera: cam("close", "static", "max"),
  props: [{ type: "door", x: 2.5, z: -2 }], actors: [max({ face: "surprised" })],
});
sc(232.46, "Егор у твоей двери. В руках переноска.", {
  location: "room", camera: cam("medium", "dolly-in", undefined, { angle: 15 }),
  props: [{ type: "door", x: 2.5, z: -2 }, { type: "box", x: 1.1, z: 0.9, y: 0.95, scale: 0.55, color: "#8fd0f2" }],
  actors: [egor({ hair: "bun", x: 1.6, z: 0.4, face: "happy", facing: -50 }), max({ x: -1, z: 0.4, face: "surprised", facing: 55 })],
});
sc(236.86, "«Знакомься, — говорит он тихо. — Это Максим».", {
  location: "room", camera: cam("medium", "dolly-in", "baby"),
  actors: [egor({ hair: "bun", x: 1.4, z: 0.2, face: "happy", talking: true, facing: -40 }), baby({ x: 0.3, z: 0.9, action: "wave", face: "happy" }), max({ x: -1.2, z: 0.4, face: "surprised", facing: 50 })],
  title: title("ЭТО МАКСИМ.", 2.3, "left"),
});
sc(240.6, "Ребёнку уже несколько месяцев…", {
  location: "room", camera: cam("medium", "dolly-in", "baby"),
  actors: [baby({ x: 0, z: 0.6, face: "happy", action: "jump" }), max({ x: -1.1, z: 0, face: "worried", facing: 60 })],
});
sc(245.94, "«Вы назвали его в мою честь?»", {
  location: "room", camera: cam("close", "push", "max"),
  actors: two(max({ face: "surprised", talking: true, action: "point" }), egor({ hair: "bun", face: "happy" })),
});
sc(248.18, "Егор улыбается: «Ты крёстный».", {
  location: "room", camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "surprised" }), egor({ hair: "bun", face: "grin", talking: true })),
  title: title("КРЁСТНЫЙ.", 1.4, "right"),
});
sc(250.6, "«Ты держал его на крестинах. Плакал больше всех».", {
  location: "studio", bg: "#ffd9a8", transition: "fade", camera: cam("medium", "dolly-in"),
  actors: [max({ x: -0.7, action: "cry", face: "sad" }), egor({ hair: "bun", x: 0.8, z: 0.4, face: "grin", facing: -40 })],
});
sc(253.9, "Ты ничего не помнишь. Тебе 24.", {
  location: "room", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "sad" })], title: title("24.", 2.7, "left"),
});
sc(258.56, "Вот тут становится по-настоящему страшно.", {
  location: "studio", bg: "#1f2a44", camera: cam("extreme", "dolly-in", "max"),
  actors: [max({ face: "scared", action: "scared" })], sfx: [{ name: "heartbeat", at: 0.2 }],
});
sc(262.16, "Не из-за лет, а потому что Егор не просто так дошёл до этого.", {
  location: "studio", bg: "#1f2a44", camera: cam("medium", "dolly-out", "max"),
  actors: [max({ face: "worried", action: "think" })],
});
sc(268.86, "Каждый раз, когда ты моргал, он оставался рядом.", {
  location: "park", time: "sunset", transition: "fade", camera: cam("medium", "dolly-in", undefined, { angle: -20 }),
  actors: [max({ x: -0.6, face: "sad", facing: 30 }), egor({ hair: "bun", x: 0.6, z: 0.4, face: "happy", facing: -30 })],
});
sc(272.2, "Прожил весь год и с тобой, и без тебя. И ни разу не бросил.", {
  location: "park", time: "sunset", camera: cam("close", "dolly-in", "egor"),
  actors: [max({ x: -0.6, face: "sad", facing: 30 }), egor({ hair: "bun", x: 0.6, z: 0.4, face: "happy", facing: -30 })],
});

// ЭКСПЕРИМЕНТ
sc(277.4, "Егор покупает в аптеке капли за 490 рублей.", {
  location: "hospital", screen: { lines: ["АПТЕКА", "490 РУБ."] }, transition: "whip", camera: cam("medium", "dolly-in", "egor"),
  actors: [egor({ hair: "bun", held: "bottle", face: "grin", action: "wave" })], sfx: [{ name: "cash", at: 0.8 }],
});
sc(281.18, "Сидите на скамейке и не моргаете, как два кота.", {
  location: "park", camera: cam("medium", "dolly-in", [0, 0.5, 0]),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "surprised" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "surprised" })],
});
sc(285.54, "Кажется, глаза сейчас вывалятся.", {
  location: "park", camera: cam("extreme", "shake", "max"),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "surprised" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "surprised" })],
});
sc(288.66, "Егор достаёт секундомер и засекает.", {
  location: "park", camera: cam("close", "dolly-in", "egor"),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "surprised" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", held: "phone", face: "neutral" })],
  sfx: [{ name: "click", at: 1.8 }],
});
sc(291.98, "Одна минута, две минуты.", {
  location: "studio", bg: "#2f9e94", camera: cam("medium", "static", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["НЕ МОРГАТЬ"], progress: { label: "МИНУТЫ", from: 0, to: 66 } }],
  sfx: [{ name: "tick", at: 0.3 }, { name: "tick", at: 1.3 }],
});
sc(294.56, "Слёзы текут сами. Теперь ты понимаешь, зачем моргать.", {
  location: "park", camera: cam("close", "dolly-in", "max"),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "sad" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "worried" })],
});
sc(299.84, "На третьей минуте Егор задумывается…", {
  location: "park", camera: cam("medium", "static", "egor", { angle: -25 }),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "sad" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "worried", beats: [{ at: 2.6, face: "surprised" }] })],
});
sc(303.08, "«Подожди, ты каждый раз перед этим что-то говорил».", {
  location: "park", camera: cam("close", "push", "egor"),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "surprised" }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "surprised", talking: true })],
  sfx: [{ name: "ding", at: 0.4 }],
});
sc(308.32, "«Что?» — «Не помню. Но ты всегда вздыхал».", {
  location: "park", camera: cam("medium", "dolly-in", undefined, { angle: 20 }),
  props: [{ type: "bench", x: 0, z: -0.25 }],
  actors: [max({ x: -0.6, z: 0, action: "sit", face: "surprised", talking: true }), egor({ hair: "bun", x: 0.6, z: 0, action: "sit", face: "worried", talking: true })],
  title: title("ВЗДЫХАЛ.", 1.8, "right"),
});

// ТРЕТИЙ ГОД
sc(312.16, "Ты в салоне и не моргаешь уже четвёртый час.", {
  ...salon({ carColor: RED }), transition: "fade", camera: cam("wide", "dolly-in", "max"),
  actors: [max({ face: "surprised" })], sfx: [{ name: "tick", at: 0.4 }],
});
sc(316.16, "Держишься на каплях и упрямстве.", {
  ...salon({ carColor: RED }), camera: cam("close", "static", "max"),
  actors: [max({ held: "bottle", face: "angry" })],
});
sc(318.64, "За спиной слышишь знакомое…", {
  ...salon({ carColor: RED }), camera: cam("medium", "dolly-in", "max"),
  actors: [max({ x: 0.5, z: 0.8, face: "worried" }), boss({ x: -1.5, z: -2.2, action: "walk", to: [-0.6, -0.4], face: "grin" })],
});
sc(322.36, "«Максим, премия на этой неделе!»", {
  ...salon({ carColor: RED }), camera: cam("close", "push", "boss"),
  actors: two(boss({ action: "talk", talking: true, face: "grin" }), max({ face: "angry" })),
});
sc(324.76, "Ты злишься, жмуришься и думаешь…", {
  location: "studio", bg: "#c0504a", camera: cam("close", "shake", "max"),
  actors: [max({ action: "angry", face: "angry" })],
});
sc(329.16, "«Ну давай уже, хватит!» — и моргаешь.", {
  location: "studio", bg: "#c0504a", camera: cam("extreme", "push", "max"),
  actors: [max({ face: "angry", beats: [{ at: 1.8, face: "sleepy" }] })],
  title: title("ДАВАЙ УЖЕ, ХВАТИТ!", 0.2, "left", "medium"), sfx: [{ name: "whoosh", at: 2.0 }],
});
sc(332.14, "Ты открываешь глаза. Тебе 25.", {
  ...salon({ carColor: RED, time: "sunset" }), transition: "blink", camera: cam("close", "static", "max"),
  actors: [max({ face: "surprised" })], title: title("25.", 1.6, "left"),
});
sc(335.36, "Салон перекрашен, на ресепшене новая девушка, Сергей Николаевич…", {
  ...salon({ carColor: RED, time: "sunset", screen: { lines: ["НОВЫЙ", "САЛОН"] } }), camera: cam("wide", "pan-left"),
  actors: [max({ x: -0.5, z: 0.8, face: "worried" }), { ...GIRL, x: -3.5, z: -2.5, face: "happy", action: "wave" }, boss({ x: 1.8, z: 0.4, facing: -50, action: "talk", talking: true, face: "grin" })],
});
sc(342.04, "«Максим, премия в этом месяце! Прямо точно!»", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "boss"),
  actors: two(max({ face: "angry" }), boss({ action: "cheer", talking: true, face: "grin" })),
});
sc(345.86, "В этот раз ты решаешь довести всё до конца.", {
  location: "studio", bg: "#3a3f66", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "angry" })], sfx: [{ name: "rise", at: 0.4 }],
});
sc(349.04, "Егор приходит с пипеткой и шепчет: «Выдержим. Ещё чуть-чуть».", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "dolly-in", undefined, { angle: 20 }),
  actors: [max({ x: -0.8, z: 0.4, face: "angry", facing: 40 }), egor({ hair: "bun", x: 4, z: 0.4, held: "bottle", action: "walk", to: [0.6, 0.4], face: "worried", beats: [{ at: 3.0, action: "talk", talking: true, facing: -55 }] })],
});
sc(355.98, "Ты не моргаешь. Минуту. Две. Три.", {
  location: "studio", bg: "#2f9e94", camera: cam("medium", "static", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["НЕ МОРГАТЬ"], progress: { label: "МИНУТЫ", from: 0, to: 100 } }],
  sfx: [{ name: "tick", at: 1.3 }, { name: "tick", at: 2.4 }, { name: "tick", at: 3.5 }],
});
sc(360.18, "По щеке течёт слеза.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("extreme", "dolly-in", "max"),
  actors: [max({ face: "sad" })], sfx: [{ name: "heartbeat", at: 0.2 }],
});
sc(362.16, "Сергей Николаевич идёт к тебе с белым конвертом.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "static", "boss"),
  actors: [max({ x: 1.1, z: 0.4, face: "sad", facing: -55 }), boss({ x: -4.5, z: 0.6, held: "sign", heldText: "ПРЕМИЯ", action: "walk", to: [-1.1, 0.4], face: "grin" })],
});
sc(365.36, "И вот мы вернулись.", {
  location: "studio", bg: "#f2c48d", transition: "whip", camera: cam("wide", "static"),
  actors: [max({ face: "smirk", action: "wave" })], title: title("МЫ ВЕРНУЛИСЬ.", 0.2, "left"), sfx: [{ name: "rise", at: 0.2 }],
});
sc(367.1, "Посреди автосалона на Кутузовском, не моргая четвёртую минуту.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("wide", "dolly-in", "max", { angle: -20 }),
  actors: [max({ x: 0, z: 0.8, face: "surprised" }), egor({ hair: "bun", x: 1.6, z: 0.2, held: "bottle", face: "worried", facing: -50 })],
  sfx: [{ name: "heartbeat", at: 0.4 }],
});
sc(373.14, "Сергей Николаевич протягивает конверт: «Максим, твоя премия».", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "dolly-in", "boss"),
  actors: two(max({ face: "surprised" }), boss({ held: "sign", heldText: "ПРЕМИЯ", action: "talk", talking: true, face: "grin" })),
});
sc(377.74, "«Почти». — «Почти?! Три тысячи вместо шестидесяти?»", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "push", "max"),
  actors: two(max({ face: "angry", action: "angry", talking: true }), boss({ held: "sign", heldText: "ПРЕМИЯ", face: "smirk" })),
  title: title("ПОЧТИ?", 0.9, "left"), sfx: [{ name: "buzz", at: 0.9 }],
});
sc(383.44, "Егор шепчет: «Максим, я всё понял».", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "worried" }), egor({ hair: "bun", action: "talk", talking: true, face: "surprised" })),
  sfx: [{ name: "ding", at: 2.4 }],
});
sc(387.98, "«Перед каждым разом ты вздыхал и говорил „скорее бы“. Четыре из четырёх».", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "dolly-in", undefined, { angle: 25 }),
  actors: two(max({ face: "surprised" }), egor({ hair: "bun", action: "talk", talking: true, face: "worried" })),
  title: title("«СКОРЕЕ БЫ».", 2.0, "left"),
});
sc(393.66, "«Не после чихания, не от усталости. Только когда ты хотел, чтобы время прошло».", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "surprised" }), egor({ hair: "bun", action: "point", talking: true, face: "neutral" })),
});
sc(399.86, "Ты замираешь. Все четыре раза.", {
  location: "studio", bg: "#1f2a44", camera: cam("extreme", "dolly-in", "max"),
  actors: [max({ face: "surprised" })], sfx: [{ name: "heartbeat", at: 0.2 }],
});
// эхо: четыре «скорее бы»
sc(402.98, "Скорее бы вечер.", {
  ...salon(), transition: "flash", camera: cam("close", "static", "max"),
  actors: [max({ face: "sleepy" })], title: title("СКОРЕЕ БЫ ВЕЧЕР.", 0.1, "left", "small"),
});
sc(404.24, "Ну когда уже эта премия?", {
  location: "cafe", transition: "flash", camera: cam("close", "static", "max"),
  actors: [max({ face: "sad", held: "cup" })], title: title("КОГДА УЖЕ ПРЕМИЯ?", 0.1, "left", "small"),
});
sc(406.08, "Скорее бы выходные.", {
  location: "street", time: "sunset", transition: "flash", camera: cam("close", "static", "max"),
  actors: [max({ face: "sleepy" })], title: title("СКОРЕЕ БЫ ВЫХОДНЫЕ.", 0.1, "left", "small"),
});
sc(407.62, "Давай уже, хватит!", {
  location: "studio", bg: "#c0504a", transition: "flash", camera: cam("close", "static", "max"),
  actors: [max({ face: "angry" })], title: title("ДАВАЙ УЖЕ, ХВАТИТ!", 0.1, "left", "small"),
});
sc(409.2, "Ты не терял год от моргания. Ты отдавал его сам.", {
  location: "studio", bg: "#3a3f66", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "sad" })], title: title("ОТДАВАЛ САМ.", 2.2, "left"),
});
sc(412.96, "Каждый раз, когда просил, чтобы он закончился.", {
  location: "studio", bg: "#3a3f66", camera: cam("medium", "dolly-out", "max"),
  actors: [max({ face: "sad", action: "think" })],
});
sc(416.26, "Глаза горят. Ты смотришь на Егора.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "egor"),
  actors: two(max({ face: "sad" }), egor({ hair: "bun", face: "happy" })),
});
sc(419.24, "На конверт.", {
  location: "studio", bg: "#f2c48d", camera: cam("medium", "push", [0, 0.5, 0]),
  props: [{ type: "sign", x: 0, z: 0, label: "ПРЕМИЯ" }],
});
sc(420.2, "На красный кроссовер.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "push", [2.6, 0.2, -1.6]),
});
sc(421.6, "На Сергея Николаевича с идиотской надеждой на лице.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "boss"),
  actors: [boss({ held: "sign", heldText: "ПРЕМИЯ", face: "grin" })], sfx: [{ name: "boing", at: 1.5 }],
});

// РАЗВЯЗКА
sc(425.9, "Впервые за много недель ты говоришь себе другое…", {
  location: "studio", bg: "#f2c48d", transition: "fade", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "neutral", beats: [{ at: 3.0, face: "happy" }] })],
});
sc(430.86, "«Пусть будет сегодня. Пусть этот день будет именно этим».", {
  location: "studio", bg: "#ffd27a", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "happy" })], title: title("ПУСТЬ БУДЕТ СЕГОДНЯ.", 0.2, "left", "medium"),
  sfx: [{ name: "sparkle", at: 0.3 }],
});
sc(435.7, "И моргаешь.", {
  location: "studio", bg: "#ffd27a", camera: cam("extreme", "static", "max"),
  actors: [max({ face: "sleepy" })], sfx: [{ name: "heartbeat", at: 0.2 }],
});
sc(437.02, "Ничего не происходит.", {
  ...salon({ carColor: RED, time: "sunset" }), transition: "blink", camera: cam("close", "static", "max"),
  actors: [max({ face: "surprised" })], title: title("НИЧЕГО.", 0.8, "left"),
});
sc(438.7, "Тот же салон, тот же календарь, тот же Егор рядом.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("wide", "orbit"),
  actors: [max({ x: -0.6, z: 0.6, face: "happy" }), egor({ hair: "bun", x: 0.9, z: 0.3, face: "happy", facing: -40 }), boss({ x: 2.6, z: 0.8, held: "sign", heldText: "ПРЕМИЯ", facing: -60, face: "neutral" })],
});
sc(442.64, "Сергей Николаевич хмурится: «Ты чего моргаешь?»", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "push", "boss"),
  actors: two(max({ face: "happy" }), boss({ held: "sign", heldText: "ПРЕМИЯ", face: "angry", talking: true, action: "talk" })),
});
sc(446.0, "А Егор складывается пополам от смеха и вытирает слёзы.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "dolly-in", "egor"),
  actors: [egor({ hair: "bun", x: 0.4, action: "facepalm", face: "grin", beats: [{ at: 1.8, action: "jump", face: "grin" }] }), max({ x: -1.4, face: "grin", facing: 40 })],
  sfx: [{ name: "boing", at: 1.0 }],
});
sc(450.26, "Первый раз за четыре года ты моргаешь просто так.", {
  location: "studio", bg: "#ffd27a", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "happy" })],
});
sc(455.06, "И это лучшее чувство в твоей жизни.", {
  location: "studio", bg: "#ffd27a", camera: cam("medium", "orbit", "max"),
  actors: [max({ action: "cheer", face: "grin" })], sfx: [{ name: "sparkle", at: 0.4 }],
});
sc(458.16, "Вскрываешь конверт: три тысячи и записка.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("close", "dolly-in", "max"),
  actors: [max({ held: "sign", heldText: "3 000 РУБ.", face: "surprised" })], sfx: [{ name: "cash", at: 1.6 }],
});
sc(462.6, "«Остальное — в следующем месяце».", {
  location: "studio", bg: "#f2c48d", camera: cam("medium", "push", [0, 0.8, 0]),
  props: [{ type: "screen", x: 0, z: -0.5, scale: 1.2, lines: ["ОСТАЛЬНОЕ —", "В СЛЕДУЮЩЕМ", "МЕСЯЦЕ"] }], sfx: [{ name: "boing", at: 0.6 }],
});
sc(464.96, "Ты смотришь на неё и начинаешь смеяться тоже.", {
  ...salon({ carColor: RED, time: "sunset" }), camera: cam("medium", "dolly-out"),
  actors: [max({ x: -0.8, action: "cheer", face: "grin", held: "sign", heldText: "3 000 РУБ." }), egor({ hair: "bun", x: 0.8, action: "jump", face: "grin" })],
});
sc(468.8, "В субботу ты приезжаешь к Егору.", {
  location: "room", time: "day", transition: "fade", camera: cam("wide", "dolly-in"),
  actors: [max({ x: -3.5, z: 0.6, action: "walk", to: [-1.2, 0.6], face: "happy" }), egor({ hair: "bun", x: 1.5, z: 0.2, face: "grin", action: "wave", facing: -40 })],
});
sc(471.12, "Маленький Максим сидит на ковре и тянет к тебе руки.", {
  location: "room", camera: cam("medium", "dolly-in", "baby"),
  actors: [baby({ x: 0, z: 0.8, action: "cheer", face: "happy" })], sfx: [{ name: "pop", at: 0.8 }],
});
sc(474.42, "Ты не помнишь крестин, но сейчас берёшь его на руки — это твой момент.", {
  location: "room", camera: cam("medium", "dolly-in", undefined, { angle: 15 }),
  actors: [max({ x: -0.5, z: 0.3, face: "happy", facing: 30 }), baby({ x: 0.4, z: 0.9, action: "jump", face: "happy" }), egor({ hair: "bun", x: 2.0, z: 0, face: "happy", facing: -40 })],
});
sc(481.16, "И никто не заберёт его у тебя.", {
  location: "room", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "happy" })], title: title("ТВОЙ МОМЕНТ.", 0.4, "left"), sfx: [{ name: "ding", at: 0.4 }],
});

// ФИНАЛ
sc(483.26, "Какой год ты бы пропустил, а какой не отдал бы ни за что?", {
  split: {
    left: { bg: "#8a93b8", label: "ПРОПУСТИТЬ", camera: cam("medium"), actors: [max({ action: "shrug", face: "sleepy" })] },
    right: { bg: "#ffd27a", label: "НЕ ОТДАТЬ", camera: cam("medium"), actors: [max({ action: "cheer", face: "grin" })] },
  },
  transition: "whip",
});
sc(489.18, "Напиши в комментариях.", {
  location: "studio", bg: "#2f9e94", camera: cam("medium", "dolly-in", "max"),
  actors: [max({ action: "point", face: "grin" })], title: title("ПИШИ В КОММЕНТАХ.", 0.3, "left", "medium"),
});
sc(490.58, "Подписывайся: Сергей Николаевич обещал следующую серию в следующем месяце.", {
  location: "studio", bg: "#a8c6e8", camera: cam("medium", "dolly-in", "boss"),
  actors: [boss({ held: "sign", heldText: "СКОРО", action: "talk", talking: true, face: "grin" })],
  sfx: [{ name: "boing", at: 4.5 }],
});
sc(497.38, "Каждая история начинается со слова «если».", {
  location: "studio", bg: "#f2c48d", transition: "fade", camera: cam("close", "dolly-in", "max"),
  actors: [max({ face: "smirk", action: "wave" })], title: title("ЕСЛИ…", 0.6), sfx: [{ name: "ding", at: 0.6 }],
});

// ── Сборка ───────────────────────────────────────────
const r2 = (n) => Math.round(n * 100) / 100;
const scenes = S.map((s, i) => {
  const start = i === 0 ? 0 : r2(Math.max(0, s.t - 0.15));
  const end = i + 1 < S.length ? r2(Math.max(0, S[i + 1].t - 0.15)) : DURATION;
  const { t, ...rest } = s;
  return { start, end, ...rest };
});

// Пост-обработка: в крупных планах персонаж в фокусе смотрит почти в камеру,
// титр в крупном плане — снизу (не поверх лица), на скамейке — без крупных планов
const BENCH = (s) => (s.props ?? []).some((p) => p.type === "bench");
for (const s of scenes) {
  const c = s.camera;
  if (!c) continue;
  if (BENCH(s) && (c.shot === "close" || c.shot === "extreme")) {
    c.shot = "medium";
    if (typeof c.target === "string") delete c.target;
  }
  const close = c.shot === "close" || c.shot === "extreme";
  if (close && typeof c.target === "string") {
    const a = (s.actors ?? []).find((x) => x.id === c.target);
    if (a && typeof a.facing === "number" && Math.abs(a.facing) > 25) a.facing = Math.sign(a.facing) * 20;
  }
  if (close && s.title && (s.title.position === "left" || s.title.position === "center" || s.title.position === "right") && (s.actors ?? []).length) s.title.position = "bottom";
}

// Речевые облачка: реплика в «кавычках» из описания сцены — над тем, кто говорит
for (const s of scenes) {
  const m = s.note.match(/«([^»]+)»/);
  const talker = (s.actors ?? []).find((a) => a.talking || a.action === "talk");
  if (!m || !talker || s.split) continue;
  s.bubble = { actor: talker.id, text: m[1].replace(/[.]$/, ""), at: 0.2 };
  delete s.title;
}

const project = {
  fps: 30,
  width: 1920,
  height: 1080,
  duration: DURATION,
  theme: "pastel",
  style: "flat",
  letterbox: true,
  subtitles: false,
  audio: {
    voice: "audio/voice.mp3",
    musicParts: [
      { from: 0, src: "music/mystery.wav" },
      { from: scenes.find((s) => s.note.startsWith("А теперь")).start, src: "music/calm.wav" },
      { from: scenes.find((s) => s.note === "Ты открываешь глаза.").start, src: "music/mystery.wav", offset: 20 },
      { from: scenes.find((s) => s.note.startsWith("В обед")).start, src: "music/calm.wav", offset: 30 },
      { from: scenes.find((s) => s.note.startsWith("Вот тут")).start, src: "music/tense.wav" },
      { from: scenes.find((s) => s.note.startsWith("Впервые")).start, src: "music/upbeat.wav" },
    ],
    music: null,
    musicDb: -22,
    sfxDb: -13,
  },
  scenes,
};

writeFileSync("data/project.json", JSON.stringify(project, null, 1));
const long = scenes.filter((s) => s.end - s.start > 8).map((s) => `${s.start}-${s.end}`);
console.log(`${scenes.length} сцен, ${DURATION} c${long.length ? `; длинные: ${long.join(", ")}` : ""}`);
