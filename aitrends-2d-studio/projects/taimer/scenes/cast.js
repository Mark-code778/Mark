// cast.js — второй канал: Артём (25, оранжевое худи) и лучший друг Лёха (синее худи). «Таймеры жизни».
export const ARTEM = { top: 'hoodie', color: '#e8622a', legs: '#2f3a52', head: 'none' };                        // Артём: оранжевое худи
export const LEHA = { top: 'hoodie', color: '#4aa8e8', legs: '#3a3a44', head: 'none' };                         // Лёха: синее худи
export const LEHAF = { top: 'jersey', color: '#4aa8e8', legs: '#f4f1ea', head: 'none', number: '10' };          // Лёха в форме
export const MOM = { top: 'dress', color: '#c06a8a', legs: '#3a2a34', head: 'bun', headColor: '#3a2a2a' };       // мама
export const DAD = { top: 'tshirt', color: '#6a7a5a', legs: '#2f3340', head: 'temples', headColor: '#bfc3c8' };  // папа, 54
export const DED = { top: 'tshirt', color: '#8a7a5a', legs: '#3a3a30', head: 'greyHair', headColor: '#e8eaee', face: 'glasses' }; // дедушка, 82
export const GRAN = { top: 'dress', color: '#7a5a9a', legs: '#2a2a30', head: 'greyBun', headColor: '#e4e4ea', face: 'glasses' }; // бабушка на лавочке
export const LADY = { top: 'dress', color: '#5a8a6a', legs: '#2a2a30', head: 'greyBun', headColor: '#d8d8e0' };   // вторая бабушка / пожилая жена
export const OLDM = { top: 'suit', color: '#5a5a66', legs: '#2a2a30', head: 'greyHair', headColor: '#d8dae0' };  // пожилой муж
export const NEIGH = { top: 'trench', color: '#5a6070', legs: '#22222a', head: 'none' };                         // сосед
export const SELLER = { top: 'tshirt', color: '#d8a050', legs: '#2a2a30', head: 'bun', headColor: '#6a3a2a' };  // продавщица
export const METRO = { top: 'trench', color: '#4a5a4a', legs: '#22222a', head: 'temples', headColor: '#9aa0a8' }; // мужчина из метро
export const CAFEW = { top: 'trench', color: '#c0453a', legs: '#2a2a30', head: 'ponytail' };                      // женщина у кофейни
export const GIRL1 = { top: 'tshirt', color: '#d8a050', legs: '#2a2a30', head: 'ponytail' };                      // коллега
export const GIRL2 = { top: 'hoodie', color: '#9a5ad6', legs: '#2a2a30', head: 'curly' };                          // коллега
export const COLL = { top: 'suit', color: '#3a4a6a', legs: '#22222a', head: 'none' };                             // коллега
export const KID = { top: 'tshirt', color: '#f2c84a', legs: '#3a5a8a', head: 'spiky', kid: true };
export const KID2 = { top: 'dress', color: '#e86a9a', legs: '#2a2a30', head: 'ponytail', kid: true };
export const COACH = { top: 'tracksuit', color: '#c0453a', legs: '#2a2a30', head: 'cap', headColor: '#2a2a30' };  // тренер
export const REF = { top: 'jersey', color: '#1e1e24', legs: '#1e1e24', head: 'none' };                            // судья
export const RIVAL = { top: 'jersey', color: '#e8e2d4', legs: '#2a2a30', head: 'none', number: '4' };             // защитник
export const MEDIC = { top: 'tracksuit', color: '#d84a3a', legs: '#2a2a30', head: 'none' };                       // скорая
export const DOC = { top: 'labcoat', color: '#e8f2f4', legs: '#3a3a44', head: 'none', face: 'glasses' };          // врач
export const PASSER = { top: 'none', head: 'none' };
export const CAST = { artem: ARTEM, leha: LEHA, lehaf: LEHAF, mom: MOM, dad: DAD, ded: DED, gran: GRAN, lady: LADY, oldm: OLDM, neigh: NEIGH, seller: SELLER, metro: METRO, cafew: CAFEW,
  girl1: GIRL1, girl2: GIRL2, coll: COLL, kid: KID, kid2: KID2, coach: COACH, ref: REF, rival: RIVAL, medic: MEDIC, doc: DOC, passer: PASSER,
  max: ARTEM, egor: LEHA, boss: DOC, baby: GIRL1 };
