'use strict';
/* ============ Drim: вход, каркас, список чатов, поиск, меню ============ */

const UI = {};
const isMobile = () => matchMedia('(max-width: 760px)').matches;

// ---------- всплывающие меню ----------
let activePopover = null;
function closePopover() {
  if (activePopover) { activePopover.remove(); activePopover.onClose?.(); activePopover = null; }
}
function openPopover(content, { x, y, anchor, place = 'bottom-start', onClose } = {}) {
  closePopover();
  const pop = h('div.popover', null, content);
  pop.onClose = onClose;
  document.body.append(pop);
  const r = pop.getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  let left, top;
  if (anchor) {
    const a = anchor.getBoundingClientRect();
    left = place.endsWith('end') ? a.right - r.width : a.left;
    top = place.startsWith('top') ? a.top - r.height - 6 : a.bottom + 6;
    if (top + r.height > vh - 8) top = a.top - r.height - 6;
    if (top < 8) top = a.bottom + 6;
  } else {
    left = x; top = y;
    if (left + r.width > vw - 8) left = x - r.width;
    if (top + r.height > vh - 8) top = Math.max(8, y - r.height);
  }
  left = Math.max(8, Math.min(left, vw - r.width - 8));
  top = Math.max(8, Math.min(top, vh - r.height - 8));
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
  activePopover = pop;
  return pop;
}
function menuEl(items) {
  return h('div.menu', null, items.filter(Boolean).map((it) => {
    if (it === '-') return h('div.menu-sep');
    if (it instanceof Node) return it;
    return h('button.menu-item', {
      class: it.danger ? 'danger' : '',
      onclick: (e) => { e.stopPropagation(); closePopover(); it.action(); },
    }, icon(it.icon), it.label);
  }));
}
function showMenu(items, pos) { return openPopover(menuEl(items), pos); }
document.addEventListener('mousedown', (e) => {
  if (activePopover && !activePopover.contains(e.target) && !e.target.closest('[data-popover-toggle]')) closePopover();
}, true);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (activePopover) { closePopover(); return; }
  const layers = $('#layers');
  const top = layers && layers.lastElementChild;
  if (top && top.closeLayer) { top.closeLayer(); return; }
  if (S.selected.size) { clearSelection(); return; }
  if (S.edit || S.reply) { cancelReplyEdit(); return; }
  if (S.infoOpen) { toggleInfo(false); return; }
});
window.addEventListener('resize', closePopover);

function longPress(el, fn) {
  let t = null, sx = 0, sy = 0;
  el.addEventListener('touchstart', (e) => {
    const p = e.touches[0]; sx = p.clientX; sy = p.clientY;
    t = setTimeout(() => { t = null; fn({ clientX: sx, clientY: sy, preventDefault() {}, target: e.target }); navigator.vibrate?.(15); }, 480);
  }, { passive: true });
  const cancel = () => { if (t) clearTimeout(t); t = null; };
  el.addEventListener('touchmove', (e) => { const p = e.touches[0]; if (Math.hypot(p.clientX - sx, p.clientY - sy) > 10) cancel(); }, { passive: true });
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchcancel', cancel);
}

// ---------- модальные окна ----------
function openLayer(el, onClose) {
  const layers = $('#layers');
  el.closeLayer = () => { el.remove(); onClose?.(); };
  layers.append(el);
  return el;
}
function modal({ title, body, footer, wide, onClose, back }) {
  let ov;
  const close = () => ov.closeLayer();
  const m = h('div.modal', { class: wide ? 'wide' : '', onmousedown: (e) => e.stopPropagation() },
    h('div.modal-head', null,
      back ? h('button.icon-btn', { onclick: back, title: 'Назад' }, icon('back')) : null,
      h('h3', null, title), h('button.icon-btn', { onclick: close, title: 'Закрыть' }, icon('x'))),
    h('div.modal-body', null, body),
    footer ? h('div.modal-foot', null, footer) : null);
  ov = h('div.overlay', { onmousedown: (e) => { if (e.target === ov) close(); } }, m);
  openLayer(ov, onClose);
  const f = m.querySelector('[autofocus]');
  if (f && !isMobile()) f.focus();
  return { el: m, close };
}
function confirmDialog(title, text, okLabel = 'OK', danger = false) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const md = modal({
      title,
      body: h('p.confirm-text', null, text),
      footer: [
        h('button.btn.btn-ghost', { onclick: () => { finish(false); md.close(); } }, 'Отмена'),
        h('button.btn', { class: danger ? 'btn-danger' : 'btn-primary', onclick: () => { finish(true); md.close(); } }, okLabel),
      ],
      onClose: () => finish(false),
    });
  });
}

// ---------- экран входа ----------
function renderAuth() {
  const app = $('#app');
  let mode = 'login';
  const err = h('div.error-text');
  const uname = h('input.input', { placeholder: 'например, anna_drim', autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false' });
  const name = h('input.input', { placeholder: 'Как вас зовут?', autocomplete: 'name' });
  const pass = h('input.input', { type: 'password', placeholder: 'Не меньше 6 символов', autocomplete: 'current-password' });
  const nameField = h('label.field.hidden', null, h('span', null, 'Ваше имя'), name);
  const submit = h('button.btn.btn-primary.btn-block', { type: 'submit' }, 'Войти');
  const tabs = h('div.tabs', null,
    h('button.on', { type: 'button', onclick: () => setMode('login') }, 'Вход'),
    h('button', { type: 'button', onclick: () => setMode('register') }, 'Регистрация'));
  function setMode(m) {
    mode = m;
    tabs.children[0].classList.toggle('on', m === 'login');
    tabs.children[1].classList.toggle('on', m === 'register');
    nameField.classList.toggle('hidden', m === 'login');
    submit.textContent = m === 'login' ? 'Войти' : 'Создать аккаунт';
    pass.autocomplete = m === 'login' ? 'current-password' : 'new-password';
    err.textContent = '';
  }
  const form = h('form', {
    onsubmit: async (e) => {
      e.preventDefault();
      err.textContent = '';
      submit.disabled = true;
      try {
        const res = await api.post(mode === 'login' ? '/api/login' : '/api/register', { username: uname.value, name: name.value, password: pass.value });
        api.token = res.token;
        store.set('drim.token', res.token);
        startApp();
      } catch (ex) { err.textContent = ex.message; } finally { submit.disabled = false; }
    },
  }, tabs,
  h('label.field', null, h('span', null, 'Имя пользователя'), uname),
  nameField,
  h('label.field', null, h('span', null, 'Пароль'), pass),
  err, submit);
  fill(app, h('div.auth', null, h('div.auth-card', null,
    h('div.auth-logo', null, h('img', { src: '/icons/icon.svg', alt: 'Drim' }), h('h1', null, 'Drim'), h('p', null, 'Общение, которое ощущается как мечта ✨')),
    form)));
  uname.focus();
}

// ---------- каркас приложения ----------
function renderMain() {
  UI.searchInput = h('input', { placeholder: 'Поиск', type: 'search', oninput: (e) => { S.search = e.target.value; UI.searchClear.classList.toggle('hidden', !S.search); onSearch(); } });
  UI.searchClear = h('button.icon-btn.clear.hidden', { onclick: () => { UI.searchInput.value = ''; S.search = ''; UI.searchClear.classList.add('hidden'); renderChatList(); } }, icon('x'));
  UI.folders = h('div.folders');
  UI.sbBody = h('div.sb-body');
  UI.connBar = h('div.conn-bar.hidden', null, h('div.spinner'), 'Подключение…');
  const fab = h('button.fab', { title: 'Новое сообщение', 'data-popover-toggle': '', onclick: (e) => {
    if (activePopover) { closePopover(); return; }
    openPopover(menuEl([
      { icon: 'user', label: 'Новое сообщение', action: newChatModal },
      { icon: 'users', label: 'Новая группа', action: () => newGroupModal('group') },
      { icon: 'channel', label: 'Новый канал', action: () => newGroupModal('channel') },
    ]), { anchor: e.currentTarget, place: 'top-end' });
  } }, icon('compose'));
  UI.sidebar = h('aside.sidebar', null,
    h('div.sb-header', null,
      h('button.icon-btn', { onclick: openDrawer, title: 'Меню' }, icon('menu')),
      h('div.search-box', null, icon('search'), UI.searchInput, UI.searchClear)),
    UI.folders, UI.sbBody, fab, UI.connBar);
  UI.chatArea = h('main.chat-area');
  UI.layout = h('div.layout', { dataset: { view: 'list' } }, UI.sidebar, UI.chatArea);
  fill($('#app'), UI.layout);
  renderEmptyChat();
}
function setConnState(ok) {
  if (!UI.connBar) return;
  clearTimeout(setConnState.t);
  if (ok) UI.connBar.classList.add('hidden');
  else setConnState.t = setTimeout(() => UI.connBar.classList.remove('hidden'), 600);
}
function renderEmptyChat() {
  UI.c = null;
  fill(UI.chatArea, h('div.empty-chat', { dataset: { wall: settings.wall } },
    h('img', { src: '/icons/icon.svg', alt: '' }),
    h('h2', null, 'Добро пожаловать в Drim'),
    h('div', null, 'Выберите чат слева или начните новый разговор'),
    h('div.pill', null, '🔒 Ваши сообщения доставляются мгновенно')));
}

// ---------- боковое меню ----------
function openDrawer() {
  let ov;
  const close = () => { ov.closeLayer(); };
  const me = S.me;
  const themeLabel = () => (document.documentElement.dataset.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');
  const drawer = h('div.drawer', null,
    h('div.drawer-head', null,
      avatarEl({ name: me.name, color: me.color, avatar: me.avatar, online: true }, 64),
      h('div.dn', null, me.name), h('div.du', null, '@' + me.username)),
    menuEl([
      { icon: 'user', label: 'Мой профиль', action: () => { close(); profileModal(); } },
      { icon: 'bookmark', label: 'Избранное', action: () => { close(); const s = [...S.chats.values()].find((c) => c.type === 'saved'); if (s) openChat(s.id); } },
      '-',
      { icon: 'userPlus', label: 'Новое сообщение', action: () => { close(); newChatModal(); } },
      { icon: 'users', label: 'Создать группу', action: () => { close(); newGroupModal('group'); } },
      { icon: 'channel', label: 'Создать канал', action: () => { close(); newGroupModal('channel'); } },
      { icon: 'archive', label: 'Архив', action: () => { close(); setFolder('archive'); } },
      '-',
      { icon: document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', label: themeLabel(), action: () => { close(); settings.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; saveSettings(); } },
      { icon: 'settings', label: 'Настройки', action: () => { close(); settingsModal(); } },
      { icon: 'logout', label: 'Выйти', danger: true, action: async () => { close(); if (await confirmDialog('Выход', 'Вы уверены, что хотите выйти из аккаунта?', 'Выйти', true)) logout(); } },
    ]),
    h('div.drawer-foot', null, h('img', { src: '/icons/icon.svg', alt: '' }), 'Drim 1.0 · мессенджер мечты'));
  // menuEl закрывает popover; в меню-драйвере закрываем сам драйвер
  ov = h('div', null, h('div.drawer-overlay', { onclick: close }), drawer);
  openLayer(ov);
}

// ---------- папки и список чатов ----------
const FOLDERS = [
  ['all', 'Все', (c) => !c.settings.archived],
  ['unread', 'Непрочитанные', (c) => !c.settings.archived && c.unread > 0],
  ['private', 'Личные', (c) => !c.settings.archived && (c.type === 'private' || c.type === 'saved')],
  ['group', 'Группы', (c) => !c.settings.archived && c.type === 'group'],
  ['channel', 'Каналы', (c) => !c.settings.archived && c.type === 'channel'],
  ['archive', 'Архив', (c) => c.settings.archived],
];
function setFolder(f) {
  S.folder = f;
  if (S.search) { UI.searchInput.value = ''; S.search = ''; UI.searchClear.classList.add('hidden'); }
  renderChatList();
}
function visibleChats() { return [...S.chats.values()].filter((c) => !c.preview && c.settings); }
function sortChats(list) {
  return list.sort((a, b) => (b.settings.pinned - a.settings.pinned) || (b.lastActivity - a.lastActivity));
}
function renderFolders() {
  const chats = visibleChats();
  fill(UI.folders, ...FOLDERS.filter(([id, , fn]) => id === 'all' || id === S.folder || chats.some(fn)).map(([id, label, fn]) => {
    const unread = id === 'unread' ? 0 : chats.filter(fn).filter((c) => c.unread > 0 && !c.settings.muted).length;
    return h('button', { class: S.folder === id ? 'on' : '', onclick: () => setFolder(id) }, label, unread ? h('span.count', null, unread) : null);
  }));
}
function renderChatList() {
  if (!UI.sbBody) return;
  updateTitleBadge();
  renderFolders();
  if (S.search.trim()) return renderSearchResults();
  const fn = (FOLDERS.find((f) => f[0] === S.folder) || FOLDERS[0])[2];
  const list = sortChats(visibleChats().filter(fn));
  if (!list.length) {
    fill(UI.sbBody, h('div.empty-list', null,
      h('div.big', null, S.folder === 'archive' ? '🗄️' : '💬'),
      S.folder === 'all' ? h('div', null, 'Пока нет чатов.', h('br'), 'Нажмите ✏️ внизу, чтобы начать общение.') : h('div', null, 'Здесь пока пусто')));
    return;
  }
  fill(UI.sbBody, ...list.map(chatItem));
}
function chatItem(chat) {
  const last = chat.lastMessage;
  const typing = typingText(chat.id);
  let preview;
  if (typing) preview = h('span.typing', null, typing);
  else if (!last) preview = chat.type === 'saved' ? 'Сохраняйте здесь важное' : 'Нет сообщений';
  else if (last.type === 'system') preview = last.text;
  else {
    const mine = last.senderId === S.me.id;
    const who = chat.type === 'group' || (mine && chat.type !== 'saved' && chat.type !== 'channel')
      ? h('span.who', null, (mine ? 'Вы' : userName(last.senderId).split(' ')[0]) + ': ') : null;
    preview = [who, msgPreview(last)];
  }
  let status = null;
  if (last && last.senderId === S.me.id && last.type !== 'system' && chat.type !== 'saved' && chat.type !== 'channel') {
    status = icon(chat.peerRead >= last.seq ? 'checks' : 'check');
  }
  const typeIcon = chat.type === 'group' ? icon('users') : chat.type === 'channel' ? icon('channel') : null;
  const el = h('div.chat-item', {
    class: S.active === chat.id ? 'on' : '',
    onclick: () => openChat(chat.id),
    oncontextmenu: (e) => { e.preventDefault(); chatContextMenu(chat, e); },
  },
  chatAvatar(chat, 54),
  h('div.ci-main', null,
    h('div.ci-top', null,
      h('div.ci-name', null, typeIcon, h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, chatTitle(chat)), chat.settings.muted ? icon('bellOff') : null),
      h('div.ci-time', null, status, fmtChatTime(last ? last.createdAt : chat.createdAt))),
    h('div.ci-bottom', null,
      h('div.ci-text', null, preview),
      chat.unread ? h('div.badge', { class: chat.settings.muted ? 'muted' : '' }, chat.unread > 999 ? '999+' : chat.unread)
        : chat.settings.pinned ? h('div.ci-icons', null, icon('pin')) : null)));
  longPress(el, (e) => chatContextMenu(chat, e));
  return el;
}
function chatContextMenu(chat, e) {
  const st = chat.settings;
  const set = (patch) => rq('chatSettings', { chatId: chat.id, ...patch });
  showMenu([
    chat.type !== 'saved' && { icon: 'archive', label: st.archived ? 'Вернуть из архива' : 'В архив', action: () => set({ archived: !st.archived }) },
    !st.archived && { icon: 'pin', label: st.pinned ? 'Открепить' : 'Закрепить', action: () => set({ pinned: !st.pinned }) },
    chat.type !== 'saved' && { icon: st.muted ? 'bell' : 'bellOff', label: st.muted ? 'Включить звук' : 'Без звука', action: () => set({ muted: !st.muted }) },
    chat.unread && { icon: 'checks', label: 'Пометить прочитанным', action: () => rq('read', { chatId: chat.id, seq: chat.seq }) },
    '-',
    { icon: 'eraser', label: 'Очистить историю', danger: true, action: () => clearHistory(chat) },
    chat.type !== 'saved' && { icon: 'trash', label: deleteLabel(chat), danger: true, action: () => deleteChat(chat) },
  ], { x: e.clientX, y: e.clientY });
}
function deleteLabel(chat) {
  if (chat.type === 'private') return 'Удалить чат';
  if (chat.ownerId === S.me.id) return chat.type === 'channel' ? 'Удалить канал' : 'Удалить группу';
  return chat.type === 'channel' ? 'Покинуть канал' : 'Покинуть группу';
}
async function clearHistory(chat) {
  if (!await confirmDialog('Очистить историю', 'Сообщения будут удалены только у вас. Продолжить?', 'Очистить', true)) return;
  await rq('clearHistory', { chatId: chat.id });
}
async function deleteChat(chat) {
  const label = deleteLabel(chat);
  const text = chat.type === 'private' ? `Удалить чат с ${chatTitle(chat)}? История будет удалена у вас.`
    : chat.ownerId === S.me.id ? `«${chatTitle(chat)}» будет удалён(а) для всех участников.` : `Вы уверены, что хотите покинуть «${chatTitle(chat)}»?`;
  if (!await confirmDialog(label, text, label, true)) return;
  await rq('deleteChat', { chatId: chat.id });
}

// ---------- поиск ----------
let searchToken = 0;
const onSearch = debounce(() => renderChatList(), 220);
async function renderSearchResults() {
  const q = S.search.trim().toLowerCase();
  const my = ++searchToken;
  const local = sortChats(visibleChats().filter((c) => chatTitle(c).toLowerCase().includes(q) ||
    (c.type === 'private' && (S.users.get(peerId(c))?.username || '').includes(q.replace(/^@/, '')))));
  const section = (title, items) => (items.length ? [h('div.section-title', null, title), ...items] : []);
  const draw = (users = [], pubChats = [], msgs = [], loading = true) => {
    if (my !== searchToken) return;
    const knownPeers = new Set(local.filter((c) => c.type === 'private').map(peerId));
    const localIds = new Set(local.map((c) => c.id));
    const globalUsers = users.filter((u) => !knownPeers.has(u.id) && u.id !== S.me.id);
    const globalChats = pubChats.filter((c) => !localIds.has(c.id));
    const nodes = [
      ...section('Чаты и контакты', local.map(chatItem)),
      ...section('Глобальный поиск', [
        ...globalUsers.map((u) => userRow(u, { onclick: () => openPrivate(u.id), sub: '@' + u.username })),
        ...globalChats.map((c) => publicChatRow(c)),
      ]),
      ...section('Сообщения', msgs.map(searchMsgRow).filter(Boolean)),
    ];
    if (!nodes.length) nodes.push(loading ? h('div.empty-list', null, h('div.spinner', { style: { margin: 'auto' } })) : h('div.empty-list', null, h('div.big', null, '🔍'), 'Ничего не найдено'));
    fill(UI.sbBody, ...nodes);
  };
  draw();
  try {
    const [r, m] = await Promise.all([
      ws.request('searchUsers', { q }),
      q.length >= 2 ? ws.request('searchMessages', { q }) : { results: [] },
    ]);
    r.users.forEach(upsertUser);
    draw(r.users, r.chats, m.results, false);
  } catch { draw([], [], [], false); }
}
function userRow(u, { onclick, sub, right, cls } = {}) {
  return h('div.user-row', { onclick, class: cls || '' },
    userAvatar(u.id, 46),
    h('div.ur-main', null, h('div.ur-name', null, u.id === S.me.id ? 'Вы' : u.name),
      h('div.ur-sub', { class: !sub && u.online ? 'on' : '' }, sub || fmtLastSeen(u))),
    right || null);
}
function publicChatRow(c) {
  const n = c.membersCount;
  return h('div.user-row', { onclick: () => { upsertChat(c); openChat(c.id); } },
    chatAvatar(c, 46),
    h('div.ur-main', null, h('div.ur-name', null, c.title),
      h('div.ur-sub', null, `${c.type === 'channel' ? 'Канал' : 'Группа'} · ${n} ${c.type === 'channel' ? plural(n, 'подписчик', 'подписчика', 'подписчиков') : plural(n, 'участник', 'участника', 'участников')}`)));
}
function searchMsgRow(m) {
  const chat = S.chats.get(m.chatId);
  if (!chat) return null;
  return h('div.chat-item', { onclick: () => openChat(chat.id, { msgId: m.id, seq: m.seq }) },
    chatAvatar(chat, 46, false),
    h('div.ci-main', null,
      h('div.ci-top', null, h('div.ci-name', null, chatTitle(chat)), h('div.ci-time', null, fmtChatTime(m.createdAt))),
      h('div.ci-bottom', null, h('div.ci-text', null, (m.senderId === S.me.id ? 'Вы: ' : '') + msgPreview(m)))));
}
async function openPrivate(userId) {
  const r = await rq('openPrivate', { userId });
  r.users.forEach(upsertUser);
  upsertChat(r.chat);
  if (S.search) { UI.searchInput.value = ''; S.search = ''; UI.searchClear.classList.add('hidden'); }
  renderChatList();
  openChat(r.chat.id);
}
function updateTitleBadge() {
  const n = visibleChats().filter((c) => !c.settings.muted).reduce((s, c) => s + (c.unread || 0), 0);
  document.title = n ? `(${n}) Drim` : 'Drim';
  try { if (navigator.setAppBadge) n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch { /* не поддерживается */ }
}
