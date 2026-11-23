// cast.js — второй канал: Артём (25, оранжевое худи, главный герой) и лучший друг Лёха (синее худи). «Телепортация».
export const ARTEM = { top: 'hoodie', color: '#e8622a', legs: '#2f3a52', head: 'none' };                        // Артём (Тёма): оранжевое худи
export const LEHA = { top: 'hoodie', color: '#4aa8e8', legs: '#3a3a44', head: 'none' };                         // Лёха: синее худи, инженер
export const ARTEMS = { top: 'tshirt', color: '#e8622a', legs: '#e8c860', head: 'none' };                       // Артём в шортах (пляж / горы)
export const LEHAS = { top: 'tshirt', color: '#4aa8e8', legs: '#3a5a8a', head: 'none' };                        // Лёха на пляже
export const MOM = { top: 'dress', color: '#c06a8a', legs: '#3a2a34', head: 'bun', headColor: '#3a2a2a' };       // мама
export const DAD = { top: 'tshirt', color: '#6a7a5a', legs: '#2f3340', head: 'temples', headColor: '#bfc3c8', beard: '#6a5a4c' }; // папа с бородой
export const DED = { top: 'tshirt', color: '#8a7a5a', legs: '#3a3a30', head: 'greyHair', headColor: '#e8eaee', face: 'glasses' }; // дедушка
export const BABA = { top: 'dress', color: '#7a5a9a', legs: '#2a2a30', head: 'greyBun', headColor: '#e4e4ea' };   // бабушка
export const NEIGH = { top: 'dress', color: '#5a8a6a', legs: '#2a2a30', head: 'greyBun', headColor: '#d8d8e0' };  // соседка снизу / бабушка на остановке
export const BOSS = { top: 'suit', color: '#3a3a46', legs: '#22222a', head: 'temples', headColor: '#9aa0a8' };    // начальник
export const ACC1 = { top: 'tshirt', color: '#d8a050', legs: '#2a2a30', head: 'ponytail' };                       // бухгалтерия
export const ACC2 = { top: 'dress', color: '#9a5ad6', legs: '#2a2a30', head: 'curly' };
export const CLIENT = { top: 'trench', color: '#5a6070', legs: '#22222a', head: 'none' };                        // клиент без паспорта
export const BLOG = { top: 'hoodie', color: '#d84a8a', legs: '#2a2a30', head: 'cap', headColor: '#1e1e24' };      // блогер
export const AGENT = { top: 'suit', color: '#2a5a8a', legs: '#22222a', head: 'bun', headColor: '#3a2a2a' };       // стойка регистрации
export const DOC = { top: 'labcoat', color: '#e8f2f4', legs: '#3a3a44', head: 'none', face: 'glasses' };          // врач
export const NURSE = { top: 'labcoat', color: '#e8f2f4', legs: '#5a8ab0', head: 'bun', headColor: '#6a3a2a' };    // медсестра
export const PASSER = { top: 'trench', color: '#4a5a4a', legs: '#22222a', head: 'none' };
export const PASS2 = { top: 'tshirt', color: '#5a8ab0', legs: '#2a2a30', head: 'ponytail' };
export const PASS3 = { top: 'hoodie', color: '#6a6a7a', legs: '#2a2a30', head: 'beanie', headColor: '#c0453a' };
export const CAST = { artem: ARTEM, leha: LEHA, artems: ARTEMS, lehas: LEHAS, mom: MOM, dad: DAD, ded: DED, baba: BABA, neigh: NEIGH, boss: BOSS, acc1: ACC1, acc2: ACC2,
  client: CLIENT, blog: BLOG, agent: AGENT, doc: DOC, nurse: NURSE, passer: PASSER, pass2: PASS2, pass3: PASS3,
  max: ARTEM, egor: LEHA, baby: ACC1, gran: BABA, lady: NEIGH, oldm: DED, seller: ACC1, metro: PASSER, cafew: ACC2, girl1: ACC1, girl2: ACC2, coll: BOSS, kid: PASS2, kid2: PASS2, coach: BOSS, ref: BOSS, rival: BOSS, medic: NURSE, lehaf: LEHA };
