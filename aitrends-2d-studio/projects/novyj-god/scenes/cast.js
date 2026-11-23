// cast.js — «Тот самый Новый год». Все взрослые одного роста (s общий), дети — kid: true (ниже).
export const ARTEM = { top: 'hoodie', color: '#ee7a2b', head: 'none', legs: '#2e3448' };                         // Тёма — оранжевое худи
export const LEHA = { top: 'hoodie', color: '#2f6fe0', head: 'none', legs: '#2b2b33' };                          // Лёха в обычной одежде — синее худи
export const LEHA_DM = { top: 'trench', color: '#c8322a', legs: '#2f6fe0', head: 'none', santa: true, hoodBlue: true }; // Лёха — Дед Мороз: красный халат, синие штаны и капюшон
export const MAMA = { top: 'dress', color: '#c24f7c', head: 'bun', apron: true };
export const PAPA = { top: 'tshirt', color: '#6f8f45', head: 'none', legs: '#34405a' };
export const BABA = { top: 'dress', color: '#8a5ad6', head: 'none', platok: '#d9534f' };                        // бабушка — фиолетовое платье, красный платок
export const DED = { top: 'tracksuit', color: '#7a5a3a', color2: '#d9c9a8', head: 'none', legs: '#3a3a44', moustache: true, ushanka: false };
export const TRACTOR = { top: 'trench', color: '#8b6b4a', head: 'none', legs: '#2a2a33', ushanka: '#5a4636' };   // тракторист — тулуп и ушанка
export const KID = { top: 'dress', color: '#e8f2ff', head: 'none', kid: true, snowflake: true };                // дети-снежинки
export const KID2 = { top: 'tshirt', color: '#5fbf7a', head: 'beanie', headColor: '#e2394f', kid: true };       // ребёнок во дворе
export const KID3 = { top: 'tshirt', color: '#f2c21a', head: 'beanie', headColor: '#3a6ea5', kid: true };
export const CHEF = { top: 'labcoat', head: 'none', chef: true, moustache: true };                                // Люсьен Оливье
export const PETR = { top: 'suit', color: '#2f5a3a', color2: '#c0392b', head: 'curly', moustache: true };        // Пётр I
export const SNEG = { top: 'dress', color: '#7fc8ff', head: 'none', kokoshnik: true };                          // Снегурочка
export const OSTR = { top: 'suit', color: '#3a3540', color2: '#ffffff', head: 'none', beard: '#8b6b4a' };        // Островский
export const MECH = { top: 'tracksuit', color: '#3a4a6a', color2: '#e1b12c', head: 'none', ushanka: '#3a3a44' };
export const MAN = { top: 'none' };

export const WHO = { A: ARTEM, L: LEHA, Z: LEHA_DM, M: MAMA, P: PAPA, B: BABA, D: DED, T: TRACTOR, K: KID, Q: KID2, U: KID3, O: CHEF, I: PETR, S: SNEG, R: OSTR, N: MECH, X: MAN };
export const CAST = [ARTEM, LEHA_DM, MAMA, PAPA, BABA, DED];
export const POWER = '#ffd47e';   // «волшебное» тёплое свечение (новогоднее чудо)
