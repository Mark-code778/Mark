'use strict';
/* ============ Drim: ядро (утилиты, настройки, API, состояние) ============ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function h(tag, props, ...children) {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className += (el.className ? ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'selected' || k === 'muted') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, children);
  return el;
}
// Безопасная замена содержимого: null/false пропускаются, массивы разворачиваются
function fill(el, ...children) {
  el.textContent = '';
  return append(el, children);
}
function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false || c === true) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const ICONS = {
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
  videoOff: '<path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>',
  clip: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  send: '<path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.99.99 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  micOff: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  reply: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  forward: '<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  edit: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  compose: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  bellOff: '<path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/>',
  archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  channel: '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
  poll: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checks: '<polyline points="16 7 6 17 2 13"/><polyline points="22 7 12 17 10.5 15.5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  down: '<polyline points="6 9 12 15 18 9"/>',
  up: '<polyline points="18 15 12 9 6 15"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>',
  checkSquare: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  eraser: '<path d="M20 20H7L3 16a1.41 1.41 0 0 1 0-2L13 4a1.41 1.41 0 0 1 2 0l5 5a1.41 1.41 0 0 1 0 2l-8 8"/><line x1="18" y1="13" x2="11" y2="6"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.74-.39-1.01-.24-.27-.38-.62-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/>',
};
const FILLED = new Set(['send', 'play', 'pause']);
function icon(name, cls = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'i' + (FILLED.has(name) ? ' fill' : '') + (cls ? ' ' + cls : ''));
  svg.innerHTML = ICONS[name] || '';
  return svg;
}

// ---------- форматирование ----------
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); };
const fmtTime = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function isToday(ts) { return dayKey(ts) === dayKey(Date.now()); }
function isYesterday(ts) { return dayKey(ts) === dayKey(Date.now() - 864e5); }
function fmtChatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isToday(ts)) return fmtTime(ts);
  if (Date.now() - ts < 6 * 864e5) return WEEKDAYS[d.getDay()];
  if (d.getFullYear() === new Date().getFullYear()) return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()];
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2);
}
function fmtDay(ts) {
  if (isToday(ts)) return 'Сегодня';
  if (isYesterday(ts)) return 'Вчера';
  const d = new Date(ts);
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
}
function fmtLastSeen(u) {
  if (!u) return '';
  if (u.online) return 'в сети';
  const ts = u.lastSeen;
  if (!ts) return 'был(а) давно';
  const diff = Date.now() - ts;
  if (diff < 60e3) return 'был(а) только что';
  if (diff < 3600e3) return `был(а) ${Math.floor(diff / 60e3)} мин. назад`;
  if (isToday(ts)) return 'был(а) сегодня в ' + fmtTime(ts);
  if (isYesterday(ts)) return 'был(а) вчера в ' + fmtTime(ts);
  const d = new Date(ts);
  return `был(а) ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}
function fmtSize(b) {
  if (b < 1024) return b + ' Б';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' КБ';
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' МБ';
  return (b / 1073741824).toFixed(2) + ' ГБ';
}
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const hh = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (hh ? hh + ':' + pad(m) : m) + ':' + pad(s);
}
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function formatText(text) {
  let s = escapeHtml(text || '');
  const stash = [];
  const keep = (html) => '\u0000' + (stash.push(html) - 1) + '\u0000';
  s = s.replace(/```(?:[a-z0-9]*\n)?([\s\S]*?)```/g, (_, c) => keep('<pre>' + c.replace(/\n$/, '') + '</pre>'));
  s = s.replace(/`([^`\n]+)`/g, (_, c) => keep('<code>' + c + '</code>'));
  s = s.replace(/\b(https?:\/\/[^\s<\u0000]+[^\s<\u0000.,:;"')\]!?])/g, (url) => keep(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`));
  s = s.replace(/\*\*([^\n]+?)\*\*/g, '<b>$1</b>');
  s = s.replace(/__([^\n]+?)__/g, '<i>$1</i>');
  s = s.replace(/~~([^\n]+?)~~/g, '<s>$1</s>');
  s = s.replace(/\|\|([^\n]+?)\|\|/g, '<span class="spoiler">$1</span>');
  s = s.replace(/(^|[\s(])@([a-z0-9_]{3,32})\b/gi, '$1<span class="mention" data-u="$2">@$2</span>');
  s = s.replace(/(^|\n)&gt; ?([^\n]*)/g, '$1<blockquote>$2</blockquote>');
  s = s.replace(/<\/blockquote>\n<blockquote>/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[i]);
}
function plainText(text) {
  return String(text || '').replace(/```|`|\*\*|__|~~|\|\|/g, '').replace(/\s+/g, ' ').trim();
}
const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null;
function emojiOnlyCount(text) {
  const t = String(text || '').trim();
  if (!t || t.length > 40) return 0;
  if (!/^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u.test(t) || /^[\d#*\s]+$/.test(t)) return 0;
  const n = segmenter ? [...segmenter.segment(t.replace(/\s/g, ''))].length : 1;
  return n <= 3 ? n : 0;
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
const tmpId = () => 'tmp_' + Math.random().toString(36).slice(2, 10);

// ---------- хранилище ----------
const store = {
  get(k, def = null) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* недоступно */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* недоступно */ } },
};

// ---------- настройки ----------
const ACCENTS = [
  ['#6366F1', '#8B5CF6', 'Индиго'], ['#3B82F6', '#06B6D4', 'Океан'], ['#10B981', '#14B8A6', 'Мята'],
  ['#EC4899', '#F43F5E', 'Роза'], ['#F97316', '#F59E0B', 'Закат'], ['#8B5CF6', '#D946EF', 'Аметист'],
];
const WALLS = [['none', 'Без обоев'], ['aurora', 'Сияние'], ['dots', 'Точки'], ['grid', 'Сетка'], ['sunset', 'Закат'], ['night', 'Ночь']];
const settings = Object.assign(
  { theme: 'auto', accent: 0, fontSize: 15, wall: 'aurora', enterSend: true, notify: true, sound: true, preview: true },
  store.get('drim.settings', {}),
);
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function applySettings() {
  const root = document.documentElement;
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && darkMQ.matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  const [a, b] = ACCENTS[settings.accent] || ACCENTS[0];
  root.style.setProperty('--accent', a);
  root.style.setProperty('--accent-2', b);
  root.style.setProperty('--font-size', settings.fontSize + 'px');
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#151824' : '#FFFFFF';
  $$('.chat, .empty-chat').forEach((el) => { el.dataset.wall = settings.wall; });
}
function saveSettings() { store.set('drim.settings', settings); applySettings(); }
darkMQ.addEventListener?.('change', applySettings);
applySettings();

// ---------- HTTP API ----------
const api = {
  token: store.get('drim.token'),
  async post(path, body) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: 'Bearer ' + this.token } : {}) },
      body: JSON.stringify(body || {}),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Ошибка сети');
    return j;
  },
  upload(file, onProgress, name) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(name || file.name || 'file'));
      xhr.setRequestHeader('X-File-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      xhr.onload = () => {
        let j = {};
        try { j = JSON.parse(xhr.responseText); } catch { /* пусто */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(j); else reject(new Error(j.error || 'Не удалось загрузить файл'));
      };
      xhr.onerror = () => reject(new Error('Ошибка сети при загрузке'));
      xhr.send(file);
    });
  },
};

// ---------- WebSocket ----------
const ws = {
  sock: null, reqs: new Map(), seq: 0, connected: false, retry: 0, stopped: false, everConnected: false,
  connect() {
    this.stopped = false;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const s = new WebSocket(`${proto}://${location.host}/ws?token=${encodeURIComponent(api.token)}`);
    this.sock = s;
    s.onopen = () => { this.connected = true; this.retry = 0; onConnected(); };
    s.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.type === 'response') {
        const r = this.reqs.get(m.reqId);
        if (r) { this.reqs.delete(m.reqId); clearTimeout(r.t); m.ok ? r.resolve(m.data) : r.reject(new Error(m.error)); }
        return;
      }
      try { handleEvent(m); } catch (err) { console.error('event', m.type, err); }
    };
    s.onclose = (e) => {
      if (this.sock !== s) return;
      this.connected = false;
      for (const r of this.reqs.values()) { clearTimeout(r.t); r.reject(new Error('Нет соединения')); }
      this.reqs.clear();
      if (e.code === 4001) { logout(true); return; }
      if (this.stopped) return;
      setConnState(false);
      setTimeout(() => { if (!this.stopped) this.connect(); }, Math.min(800 * 2 ** this.retry++, 10000));
    };
  },
  stop() { this.stopped = true; if (this.sock) { const s = this.sock; this.sock = null; s.close(); } this.connected = false; },
  request(type, data) {
    return new Promise((resolve, reject) => {
      if (!this.connected) return reject(new Error('Нет соединения с сервером'));
      const reqId = ++this.seq;
      const t = setTimeout(() => { this.reqs.delete(reqId); reject(new Error('Сервер не отвечает')); }, 20000);
      this.reqs.set(reqId, { resolve, reject, t });
      this.sock.send(JSON.stringify({ type, reqId, data }));
    });
  },
  emit(type, data) { if (this.connected) this.sock.send(JSON.stringify({ type, data })); },
};
const rq = (type, data) => ws.request(type, data).catch((e) => { toast(e.message, true); throw e; });

// ---------- состояние ----------
const S = {
  me: null,
  users: new Map(),
  chats: new Map(),
  msgs: new Map(), // chatId -> { list, hasMore, loaded, loading }
  active: null,
  folder: 'all',
  search: '',
  typing: new Map(), // chatId -> Map(userId -> {kind, t})
  reply: null,
  edit: null,
  selected: new Set(),
  drafts: store.get('drim.drafts', {}),
  infoOpen: false,
  unreadMarker: null,
  animate: new Set(),
};
function msgStore(chatId) {
  let st = S.msgs.get(chatId);
  if (!st) S.msgs.set(chatId, (st = { list: [], hasMore: true, loaded: false, loading: false }));
  return st;
}
function upsertUser(u) {
  if (!u) return;
  const old = S.users.get(u.id);
  S.users.set(u.id, old ? Object.assign(old, u) : u);
  if (S.me && u.id === S.me.id) Object.assign(S.me, u);
}
function upsertChat(c) {
  if (!c) return null;
  const old = S.chats.get(c.id);
  if (old && old.preview && !c.preview) delete old.preview;
  if (old && !old.preview && c.preview) return old;
  const merged = old ? Object.assign(old, c) : c;
  S.chats.set(c.id, merged);
  return merged;
}

// ---------- представления чатов ----------
function peerId(chat) {
  if (!chat || chat.type !== 'private') return null;
  return chat.members.find((m) => m !== S.me.id) || S.me.id;
}
function chatTitle(chat) {
  if (!chat) return '';
  if (chat.type === 'saved') return 'Избранное';
  if (chat.type === 'private') { const u = S.users.get(peerId(chat)); return u ? u.name : 'Пользователь'; }
  return chat.title || 'Без названия';
}
function userName(uid) {
  const u = S.users.get(uid);
  return u ? u.name : 'Пользователь';
}
function initials(name) {
  const p = String(name || '?').trim().split(/\s+/);
  return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase();
}
function avatarEl({ name, color, avatar, online, saved }, size = 48) {
  const inner = h('div.av-inner', { style: { '--c': color || 'var(--accent)' } });
  if (saved) inner.append(icon('bookmark'));
  else if (avatar) inner.append(h('img', { src: avatar, alt: '', loading: 'lazy', draggable: 'false' }));
  else inner.append(initials(name));
  return h('div.avatar', { class: (online ? 'online' : '') + (saved ? ' saved' : ''), style: { '--s': size + 'px' } }, inner);
}
function userAvatar(uid, size, showOnline = true) {
  const u = S.users.get(uid) || { name: '?' };
  return avatarEl({ name: u.name, color: u.color, avatar: u.avatar, online: showOnline && u.online && uid !== S.me.id }, size);
}
function chatAvatar(chat, size = 48, showOnline = true) {
  if (chat.type === 'saved') return avatarEl({ saved: true }, size);
  if (chat.type === 'private') return userAvatar(peerId(chat), size, showOnline);
  return avatarEl({ name: chat.title, color: chat.color, avatar: chat.avatar }, size);
}
function msgPreview(m) {
  if (!m) return '';
  const cap = m.text ? ' ' + plainText(m.text) : '';
  switch (m.type) {
    case 'image': return '🖼 ' + (cap.trim() || 'Фото');
    case 'video': return '🎬 ' + (cap.trim() || 'Видео');
    case 'file': return '📎 ' + (m.file ? m.file.name : 'Файл');
    case 'voice': return '🎤 Голосовое сообщение';
    case 'sticker': return m.text + ' Стикер';
    case 'poll': return '📊 ' + (m.poll ? m.poll.question : m.text || 'Опрос');
    case 'location': return '📍 Геопозиция';
    case 'call': return (m.call && m.call.video ? '📹 ' : '📞 ') + 'Звонок';
    default: return plainText(m.text);
  }
}
function canPost(chat) {
  if (!chat || chat.preview) return false;
  if (chat.type === 'channel') return isAdmin(chat);
  return true;
}
function isAdmin(chat, uid = S.me.id) { return !!chat && (chat.ownerId === uid || (chat.admins || []).includes(uid)); }
function chatSubtitle(chat) {
  if (chat.type === 'saved') return { text: 'заметки, ссылки и файлы' };
  const typing = typingText(chat.id);
  if (typing) return { text: typing, on: true, typing: true };
  if (chat.type === 'private') {
    const u = S.users.get(peerId(chat));
    if (peerId(chat) === S.me.id) return { text: 'это вы' };
    return { text: fmtLastSeen(u), on: u && u.online };
  }
  const n = chat.membersCount || (chat.members || []).length;
  if (chat.type === 'channel') return { text: `${n} ${plural(n, 'подписчик', 'подписчика', 'подписчиков')}` };
  const online = (chat.members || []).filter((m) => S.users.get(m)?.online).length;
  return { text: `${n} ${plural(n, 'участник', 'участника', 'участников')}` + (online > 1 ? `, ${online} в сети` : '') };
}
function typingText(chatId) {
  const map = S.typing.get(chatId);
  if (!map || !map.size) return '';
  const chat = S.chats.get(chatId);
  const entries = [...map.entries()];
  const [uid, { kind }] = entries[0];
  const verb = kind === 'voice' ? 'записывает голосовое' : kind === 'file' ? 'отправляет файл' : 'печатает';
  if (chat && chat.type === 'private') return verb + '…';
  if (entries.length > 1) return `${entries.length} ${plural(entries.length, 'человек', 'человека', 'человек')} печатают…`;
  return `${userName(uid).split(' ')[0]} ${verb}…`;
}

// ---------- тосты и звуки ----------
function toast(text, err = false) {
  let box = $('.toasts');
  if (!box) document.body.append((box = h('div.toasts')));
  const t = h('div.toast', { class: err ? 'err' : '' }, text);
  box.append(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2600);
}
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}
function playTone(notes, vol = 0.08) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  let t = ctx.currentTime;
  for (const [freq, dur] of notes) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
    t += dur * 0.8;
  }
}
const sounds = {
  incoming: () => settings.sound && playTone([[880, 0.12], [1320, 0.18]]),
  sent: () => settings.sound && playTone([[660, 0.06]], 0.03),
};
