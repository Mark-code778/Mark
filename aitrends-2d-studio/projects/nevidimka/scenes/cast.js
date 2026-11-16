// cast.js — у каждого героя один фирменный цвет, одинаковый во всём ролике.
export const MAX = { top: 'hoodie', color: '#d64a33', legs: '#3a5280', head: 'none' };                       // Максим: оранжевое худи, джинсы
export const EGOR = { top: 'tshirt', color: '#3fb950', legs: '#4a3f38', head: 'cap', headColor: '#3fb950' };   // Егор: зелёная кепка и футболка
export const BOSS = { top: 'suit', color: '#4a4d5a', color2: '#e8e2d4', legs: '#22222a', face: 'glasses', head: 'none' }; // Сергей Николаевич
export const MOM = { top: 'dress', color: '#8a5ad6', head: 'bun' };                                          // мама: сиреневое платье, пучок
export const INTERN = { top: 'tshirt', color: '#3a6ea5', head: 'spiky' };                                    // стажёр: синяя футболка
export const NEIGHBOR = { top: 'dress', color: '#f29ac0', head: 'curly' };                                   // соседка с апельсинами
export const WOMAN = { top: 'tracksuit', color: '#e8c070', head: 'ponytail', headColor: '#e8c070' };         // женщина с тележкой
export const PASSER = { top: 'none', head: 'none' };                                                          // прохожие — просто силуэты
export const COACH = { top: 'tracksuit', color: '#2a5aa0', color2: '#ffffff', head: 'cap', headColor: '#2a5aa0' };
export const CAST = { max: MAX, egor: EGOR, boss: BOSS, mom: MOM, intern: INTERN, neighbor: NEIGHBOR, woman: WOMAN, passer: PASSER, coach: COACH };
