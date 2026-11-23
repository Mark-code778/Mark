// cast.js — второй канал: Артём (25, оранжевое худи, главный герой) и лучший друг Лёха (синее худи). «Чужой облик».
// mole — родинка [x, y] в долях радиуса головы (у Лёхи — «фирменная», над бровью).
export const ARTEM = { top: 'hoodie', color: '#e8622a', legs: '#2f3a52', head: 'none', mole: [-0.42, 0.22] };          // Артём (Тёма)
export const LEHA = { top: 'hoodie', color: '#4aa8e8', legs: '#3a3a44', head: 'none', mole: [0.46, -0.5] };            // Лёха: родинка над бровью
export const ARTEMT = { top: 'tshirt', color: '#e8622a', legs: '#2f3a52', head: 'none', mole: [-0.42, 0.22] };         // Артём в майке (утро)
export const LEHAT = { top: 'tshirt', color: '#4aa8e8', legs: '#3a3a44', head: 'none', mole: [0.46, -0.5] };           // Лёха в майке
export const MOM = { top: 'dress', color: '#c06a8a', legs: '#3a2a34', head: 'bun', headColor: '#3a2a2a' };
export const DAD = { top: 'tshirt', color: '#8a4a4a', legs: '#2f3340', head: 'temples', headColor: '#e4e6ea', beard: '#9a9aa0' }; // папа: клетчатая рубашка, седой
export const DED = { top: 'tshirt', color: '#8a7a5a', legs: '#3a3a30', head: 'greyHair', headColor: '#e8eaee', face: 'glasses' }; // дедушка
export const BABA = { top: 'dress', color: '#7a5a9a', legs: '#2a2a30', head: 'greyBun', headColor: '#e4e4ea' };           // бабушка Галя
export const BABAS = { top: 'dress', color: '#7a5a9a', legs: '#2a2a30', head: 'scarf', headColor: '#c04a5a' };            // бабушка в платке
export const OLDM = { top: 'trench', color: '#6a6458', legs: '#3a3a36', head: 'cap', headColor: '#8a8c92', face: 'glasses' }; // сосед с первого этажа, 80
export const GUARD = { top: 'suit', color: '#1e1e24', legs: '#18181c', head: 'none', face: 'sunglasses' };                   // охранник из подъезда
export const HUNK = { top: 'suit', color: '#e8e2d4', legs: '#3a3a46', head: 'tuft', headColor: '#1e1e24' };                 // красавец с плаката
export const BOSSW = { top: 'suit', color: '#4a3a5a', legs: '#22222a', head: 'bun', headColor: '#2a2024', face: 'glasses' }; // строгая начальница
export const CASH = { top: 'tshirt', color: '#d8a050', legs: '#2a2a30', head: 'ponytail' };                                // кассирша
export const BARI = { top: 'dress', color: '#9a5ad6', legs: '#2a2a30', head: 'curly' };                                    // официантка
export const PASSER = { top: 'trench', color: '#4a5a4a', legs: '#22222a', head: 'none' };
export const PASS2 = { top: 'tshirt', color: '#5a8ab0', legs: '#2a2a30', head: 'ponytail' };
export const PASS3 = { top: 'hoodie', color: '#6a6a7a', legs: '#2a2a30', head: 'beanie', headColor: '#c0453a' };
export const DOC = { top: 'labcoat', color: '#e8f2f4', legs: '#3a3a44', head: 'none', face: 'glasses' };
export const ACTOR = { top: 'suit', color: '#2a2a34', legs: '#22222a', head: 'spiky', headColor: '#1e1e24' };
export const LEHAG = { ...LEHA, face: 'glasses' };                                                               // Лёха в очках
export const LEHAH = { ...LEHA, head: 'tuft', headColor: '#1e1e24' };                                             // Лёха постригся
export const LEHAO = { ...LEHA, head: 'greyHair', headColor: '#dadce2', face: 'glasses' };                         // Лёха постарел
export const OLDMNG = { ...OLDM, face: 'none' };                                                                 // сосед без очков
// головные «черты» — то, что меняет облик; одежда (top / color / legs) остаётся своей
export const FACE_KEYS = ['head', 'headColor', 'hairColor', 'face', 'beard', 'mole', 'kid'];
export const CAST = { artem: ARTEM, leha: LEHA, artemt: ARTEMT, lehat: LEHAT, mom: MOM, dad: DAD, ded: DED, baba: BABA, babas: BABAS, oldm: OLDM, guard: GUARD, hunk: HUNK,
  bossw: BOSSW, lehag: LEHAG, lehah: LEHAH, lehao: LEHAO, oldmng: OLDMNG, cash: CASH, bari: BARI, passer: PASSER, pass2: PASS2, pass3: PASS3, doc: DOC, actor: ACTOR,
  max: ARTEM, egor: LEHA, boss: BOSSW, acc1: CASH, acc2: BARI, gran: BABA, lady: BABA, neigh: BABA, nurse: DOC, client: PASSER, blog: PASS3, agent: BOSSW, kid: PASS2, baby: CASH, dad50: DAD, maxk: ARTEM };
