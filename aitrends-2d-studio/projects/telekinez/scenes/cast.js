// cast.js — один цвет-примета на героя, одинаковый во всём ролике.
// Все персонажи взрослые и одного роста: kid нигде не используется, масштаб s в кадре общий для всех.
export const ARTEM = { top: 'hoodie', color: '#ee7a2b', head: 'none', legs: '#2e3448' };      // Артём, 25 лет — оранжевое худи
export const LEHA = { top: 'hoodie', color: '#2f6fe0', head: 'none', legs: '#2b2b33' };       // Лёха, лучший друг — синее худи
export const PAPA = { top: 'tshirt', color: '#6f8f45', head: 'none', legs: '#34405a' };       // папа — оливковая рабочая футболка
export const DED = { top: 'tshirt', color: '#c8a03a', head: 'capBack', headColor: '#8b6b4a', legs: '#4a4038', moustache: true }; // дедушка
export const MAMA = { top: 'dress', color: '#c24f7c', head: 'bun' };
export const BABA = { top: 'dress', color: '#8a5ad6', head: 'beanie', headColor: '#d9c9e8' }; // бабушка на балконе
export const MAN = { top: 'none' };                                                            // прохожий / массовка
export const DRIVER = { top: 'suit', color: '#2a2833', color2: '#c0392b', face: 'sunglasses' };
export const SOSED = { top: 'dress', color: '#3fb950', head: 'ponytail' };                     // соседка
export const RANDI = { top: 'suit', color: '#3a3540', color2: '#d4af37', face: 'glasses' };   // фокусник Джеймс Рэнди
export const MYSTIC = { top: 'trench', head: 'fedora', headColor: '#2c2833' };                 // «экстрасенс» с телешоу
export const WOMAN = { top: 'tshirt', color: '#e0a3c0', head: 'ponytail' };                    // пациентка с имплантом
export const GUY = { top: 'tshirt', color: '#3fb0a5', head: 'capBack', headColor: '#3fb0a5' }; // парень-шахматист
export const COSMO = { top: 'tracksuit', color: '#e8e8ef', color2: '#3a6ea5', head: 'none' };  // астронавт
export const SCI = { top: 'labcoat', face: 'glasses', head: 'none' };                          // учёный
export const FOOT = { top: 'jersey', color: '#d64a33', number: '10', color2: '#ffffff' };      // футболист

export const WHO = { A: ARTEM, L: LEHA, P: PAPA, D: DED, M: MAMA, B: BABA, X: MAN, J: DRIVER, N: SOSED, R: RANDI, Y: MYSTIC, W: WOMAN, K: GUY, C: COSMO, S: SCI, F: FOOT };
export const CAST = [ARTEM, LEHA, PAPA, DED, MAMA];
export const POWER = '#b07cff';   // цвет телекинеза — фиолетовое свечение
