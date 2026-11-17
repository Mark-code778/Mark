'use strict';
/* ============ Drim: модальные окна, панель информации, просмотр медиа ============ */

function knownContacts() {
  const ids = new Set();
  for (const c of S.chats.values()) if (!c.preview && c.type === 'private') ids.add(peerId(c));
  for (const c of S.chats.values()) if (!c.preview && c.type === 'group') (c.members || []).forEach((m) => ids.add(m));
  ids.delete(S.me.id);
  return [...ids].map((id) => S.users.get(id)).filter(Boolean).sort((a, b) => (b.online - a.online) || a.name.localeCompare(b.name));
}

// Поле поиска пользователей с подгрузкой глобальных результатов
function userPicker({ onPick, multi = false, selected = new Set(), exclude = new Set(), onChange }) {
  const listEl = h('div');
  const chips = h('div.chips');
  const inp = h('input.input', { placeholder: 'Поиск по имени или @username', autofocus: true });
  let found = [];
  const draw = () => {
    const q = inp.value.trim().toLowerCase().replace(/^@/, '');
    const base = knownContacts().filter((u) => !exclude.has(u.id));
    const filtered = q ? base.filter((u) => u.name.toLowerCase().includes(q) || u.username.includes(q)) : base;
    const ids = new Set(filtered.map((u) => u.id));
    const extra = found.filter((u) => !ids.has(u.id) && !exclude.has(u.id) && u.id !== S.me.id);
    const all = [...filtered, ...extra];
    if (multi) {
      fill(chips, ...[...selected].map((id) => S.users.get(id)).filter(Boolean).map((u) =>
        h('span.chip', { onclick: () => { selected.delete(u.id); onChange?.(); draw(); } }, userAvatar(u.id, 24, false), u.name.split(' ')[0], icon('x'))));
    }
    fill(listEl, ...(all.length ? all.map((u) => userRow(u, {
      cls: selected.has(u.id) ? 'sel' : '',
      sub: '@' + u.username + (u.online ? ' · в сети' : ''),
      right: multi ? h('span.check', null, icon('check')) : null,
      onclick: () => {
        if (!multi) return onPick(u);
        selected.has(u.id) ? selected.delete(u.id) : selected.add(u.id);
        onChange?.(); draw();
      },
    })) : [h('div.ip-empty', null, q ? 'Никого не найдено' : 'Введите имя, чтобы найти людей в Drim')]));
  };
  inp.oninput = debounce(async () => {
    const q = inp.value.trim();
    draw();
    if (!q) { found = []; return; }
    try { const r = await ws.request('searchUsers', { q }); r.users.forEach(upsertUser); found = r.users; draw(); } catch { /* офлайн */ }
  }, 220);
  draw();
  return { el: h('div', null, h('div.field', null, inp), chips, listEl), selected };
}

function newChatModal() {
  let md;
  const picker = userPicker({ onPick: (u) => { md.close(); openPrivate(u.id); } });
  md = modal({ title: 'Новое сообщение', body: picker.el });
}

function avatarPicker(current, name, color, onFile) {
  let preview = avatarEl({ name, color, avatar: current }, 104);
  const box = h('div.avatar-pick');
  const draw = () => {
    preview.append(h('div.cam', null, icon('camera')));
    preview.onclick = () => {
      const inp = h('input', { type: 'file', accept: 'image/*' });
      inp.onchange = async () => {
        const f = inp.files[0];
        if (!f) return;
        try {
          const small = await resizeImage(f, 512);
          const up = await api.upload(small, null, 'avatar.jpg');
          onFile(up.url);
          preview = avatarEl({ name, color, avatar: up.url }, 104);
          fill(box, preview); draw();
        } catch (e) { toast(e.message, true); }
      };
      inp.click();
    };
  };
  box.append(preview); draw();
  return box;
}
function resizeImage(file, max) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // квадратная обрезка по центру и уменьшение до max×max
      const side = Math.min(img.width, img.height);
      const cv = document.createElement('canvas');
      cv.width = cv.height = Math.min(max, side);
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => resolve(b || file), 'image/jpeg', 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function newGroupModal(type) {
  const isChannel = type === 'channel';
  let avatar = null;
  const title = h('input.input', { placeholder: isChannel ? 'Название канала' : 'Название группы', maxlength: 64, autofocus: true });
  const desc = h('textarea.textarea', { placeholder: 'Описание (необязательно)', maxlength: 255, rows: 2 });
  const pub = h('input', { type: 'checkbox' });
  const btn = h('button.btn.btn-primary', null, 'Создать');
  const picker = userPicker({ multi: true });
  const md = modal({
    title: isChannel ? 'Новый канал' : 'Новая группа',
    wide: true,
    body: [
      avatarPicker(null, '?', '#8B5CF6', (u) => { avatar = u; }),
      h('label.field', null, h('span', null, 'Название'), title),
      h('label.field', null, h('span', null, 'Описание'), desc),
      h('div.setting-row', null, icon('globe'), h('div.sr-main', null, h('div', null, isChannel ? 'Публичный канал' : 'Публичная группа'), h('div.sr-sub', null, 'Её можно будет найти через поиск')), h('label.switch', null, pub, h('i'))),
      h('div.setting-group', null, isChannel ? 'Подписчики (необязательно)' : 'Участники'),
      picker.el,
    ],
    footer: [h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'), btn],
  });
  btn.onclick = async () => {
    if (!title.value.trim()) { title.focus(); return toast('Введите название', true); }
    btn.disabled = true;
    try {
      const r = await rq('createChat', { type, title: title.value, description: desc.value, memberIds: [...picker.selected], avatar, isPublic: pub.checked });
      upsertChat(r.chat);
      md.close();
      renderChatList();
      openChat(r.chat.id);
    } catch { btn.disabled = false; }
  };
}

function editChatModal(chat) {
  let avatar = chat.avatar;
  const title = h('input.input', { value: chat.title, maxlength: 64 });
  const desc = h('textarea.textarea', { maxlength: 255, rows: 2 });
  desc.value = chat.description || '';
  const pub = h('input', { type: 'checkbox', checked: !!chat.isPublic });
  const link = `${location.origin}/#join=${chat.inviteCode}`;
  const md = modal({
    title: chat.type === 'channel' ? 'Настройки канала' : 'Настройки группы',
    body: [
      avatarPicker(chat.avatar, chat.title, chat.color, (u) => { avatar = u; }),
      h('label.field', null, h('span', null, 'Название'), title),
      h('label.field', null, h('span', null, 'Описание'), desc),
      h('div.setting-row', null, icon('globe'), h('div.sr-main', null, h('div', null, 'Публичный доступ'), h('div.sr-sub', null, 'Доступен через глобальный поиск')), h('label.switch', null, pub, h('i'))),
      chat.inviteCode ? h('div.setting-row', { style: { cursor: 'pointer' }, onclick: () => copyText(link) }, icon('link'), h('div.sr-main', null, h('div', null, 'Пригласительная ссылка'), h('div.sr-sub', { style: { wordBreak: 'break-all' } }, link)), icon('copy')) : null,
      chat.ownerId === S.me.id ? h('button.btn.btn-danger.btn-block', { style: { marginTop: '14px' }, onclick: () => { md.close(); deleteChat(chat); } }, icon('trash'), chat.type === 'channel' ? 'Удалить канал' : 'Удалить группу') : null,
    ],
    footer: [
      h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'),
      h('button.btn.btn-primary', { onclick: async () => {
        await rq('updateChat', { chatId: chat.id, title: title.value, description: desc.value, avatar, isPublic: pub.checked });
        md.close();
        toast('Сохранено');
      } }, 'Сохранить'),
    ],
  });
}

function addMembersModal(chat) {
  const btn = h('button.btn.btn-primary', { disabled: true }, 'Добавить');
  const picker = userPicker({ multi: true, exclude: new Set(chat.members), onChange: () => { btn.disabled = !picker.selected.size; } });
  const md = modal({ title: chat.type === 'channel' ? 'Добавить подписчиков' : 'Добавить участников', body: picker.el, footer: [h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'), btn] });
  btn.onclick = async () => { await rq('addMembers', { chatId: chat.id, userIds: [...picker.selected] }); md.close(); };
}

function profileModal() {
  const me = S.me;
  let avatar = me.avatar;
  const name = h('input.input', { value: me.name, maxlength: 64 });
  const uname = h('input.input', { value: me.username, maxlength: 32, autocapitalize: 'off', spellcheck: 'false' });
  const bio = h('textarea.textarea', { maxlength: 140, rows: 2, placeholder: 'Пара слов о себе' });
  bio.value = me.bio || '';
  const oldP = h('input.input', { type: 'password', placeholder: 'Текущий пароль', autocomplete: 'current-password' });
  const newP = h('input.input', { type: 'password', placeholder: 'Новый пароль', autocomplete: 'new-password' });
  const md = modal({
    title: 'Мой профиль',
    body: [
      avatarPicker(me.avatar, me.name, me.color, (u) => { avatar = u; }),
      avatar ? h('div', { style: { textAlign: 'center', marginTop: '-10px', marginBottom: '10px' } }, h('button.btn.btn-ghost', { style: { height: '32px' }, onclick: (e) => { avatar = null; e.target.remove(); toast('Фото будет удалено после сохранения'); } }, 'Удалить фото')) : null,
      h('label.field', null, h('span', null, 'Имя'), name),
      h('label.field', null, h('span', null, 'Имя пользователя'), uname),
      h('div.hint', null, 'По нему вас смогут найти: @' + me.username),
      h('label.field', null, h('span', null, 'О себе'), bio),
      h('div.setting-group', null, 'Смена пароля'),
      h('div.field', null, oldP), h('div.field', null, newP),
      h('button.btn.btn-ghost', { onclick: async () => {
        if (!oldP.value || !newP.value) return toast('Заполните оба поля', true);
        await rq('changePassword', { oldPassword: oldP.value, newPassword: newP.value });
        oldP.value = newP.value = '';
        toast('Пароль изменён');
      } }, icon('key'), 'Изменить пароль'),
    ],
    footer: [
      h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'),
      h('button.btn.btn-primary', { onclick: async () => {
        const r = await rq('updateProfile', { name: name.value, username: uname.value, bio: bio.value, avatar });
        Object.assign(S.me, r.me); upsertUser(r.me);
        md.close(); toast('Профиль обновлён');
      } }, 'Сохранить'),
    ],
  });
}

function settingsModal() {
  const body = h('div');
  const draw = () => {
    const seg = (key, opts) => h('div.seg', null, opts.map(([v, l]) => h('button', { class: settings[key] === v ? 'on' : '', onclick: () => { settings[key] = v; saveSettings(); draw(); } }, l)));
    const toggle = (key, title, sub, after) => {
      const inp = h('input', { type: 'checkbox', checked: !!settings[key], onchange: () => { settings[key] = inp.checked; saveSettings(); after?.(inp.checked); } });
      return h('div.setting-row', null, h('div.sr-main', null, h('div', null, title), sub ? h('div.sr-sub', null, sub) : null), h('label.switch', null, inp, h('i')));
    };
    fill(body, 
      h('div.setting-group', { style: { marginTop: '4px' } }, 'Оформление'),
      h('div', { style: { padding: '6px 4px' } }, seg('theme', [['light', '☀️ Светлая'], ['dark', '🌙 Тёмная'], ['auto', '⚙️ Авто']])),
      h('div.sr-sub', { style: { margin: '10px 4px 0' } }, 'Цвет акцента'),
      h('div.swatches', null, ACCENTS.map(([a, b, n], i) => h('button.swatch', { title: n, class: settings.accent === i ? 'on' : '', style: { background: `linear-gradient(135deg, ${b}, ${a})` }, onclick: () => { settings.accent = i; saveSettings(); draw(); } }))),
      h('div.sr-sub', { style: { margin: '10px 4px 0' } }, 'Обои чатов'),
      h('div.walls', null, WALLS.map(([id, n]) => h('button.wall.chat', { class: settings.wall === id ? 'on' : '', dataset: { wall: id }, style: { display: 'grid' }, onclick: () => { settings.wall = id; saveSettings(); draw(); } }, h('span', { style: { background: 'var(--panel)', padding: '1px 8px', borderRadius: '8px' } }, n)))),
      h('div.sr-sub', { style: { margin: '10px 4px 4px' } }, `Размер текста: ${settings.fontSize}px`),
      h('input', { type: 'range', min: 13, max: 19, value: settings.fontSize, oninput: (e) => { settings.fontSize = +e.target.value; saveSettings(); e.target.previousSibling.textContent = `Размер текста: ${settings.fontSize}px`; } }),
      h('div.setting-group', null, 'Чаты'),
      toggle('enterSend', 'Отправка по Enter', 'Shift+Enter — новая строка. Ctrl+Enter отправляет всегда'),
      h('div.setting-group', null, 'Уведомления'),
      toggle('notify', 'Системные уведомления', 'Показывать уведомления о новых сообщениях', (on) => { if (on && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }),
      toggle('preview', 'Текст в уведомлении', 'Показывать содержимое сообщения'),
      toggle('sound', 'Звуки', 'Звук при получении и отправке'),
      h('div.setting-group', null, 'О приложении'),
      h('div.setting-row', null, h('img', { src: '/icons/icon.svg', style: { width: '48px', height: '48px', borderRadius: '13px' } }),
        h('div.sr-main', null, h('div', { style: { fontWeight: 700 } }, 'Drim 1.0'), h('div.sr-sub', null, 'Мессенджер в реальном времени. Можно установить как приложение через меню браузера.'))),
    );
    applySettings();
  };
  draw();
  modal({ title: 'Настройки', body });
}

function forwardModal(msgs) {
  if (!msgs.length) return;
  let md;
  const listEl = h('div');
  const inp = h('input.input', { placeholder: 'Кому переслать?', autofocus: true });
  const draw = () => {
    const q = inp.value.trim().toLowerCase();
    const chats = sortChats(visibleChats().filter(canPost).filter((c) => chatTitle(c).toLowerCase().includes(q)));
    const saved = chats.find((c) => c.type === 'saved');
    const ordered = saved ? [saved, ...chats.filter((c) => c !== saved)] : chats;
    fill(listEl, ...ordered.map((c) => h('div.user-row', { onclick: async () => {
      md.close();
      await forwardTo(c.id, msgs);
      clearSelection();
      if (c.id !== S.active && c.type !== 'saved') openChat(c.id);
    } }, chatAvatar(c, 46), h('div.ur-main', null, h('div.ur-name', null, chatTitle(c)), h('div.ur-sub', null, chatSubtitle(c).text)))));
  };
  inp.oninput = draw;
  draw();
  md = modal({ title: msgs.length > 1 ? `Переслать ${msgs.length} ${plural(msgs.length, 'сообщение', 'сообщения', 'сообщений')}` : 'Переслать', body: [h('div.field', null, inp), listEl] });
}

function pollModal() {
  const q = h('input.input', { placeholder: 'Задайте вопрос', maxlength: 255, autofocus: true });
  const optsBox = h('div.poll-opts');
  const addOpt = (v = '') => {
    if (optsBox.childElementCount >= 10) return;
    const inp = h('input.input', { placeholder: `Вариант ${optsBox.childElementCount + 1}`, maxlength: 100, value: v });
    inp.oninput = () => { if (inp === optsBox.lastElementChild.firstChild && inp.value) addOpt(); };
    const row = h('div.po', null, inp, h('button.icon-btn', { onclick: () => { if (optsBox.childElementCount > 2) row.remove(); } }, icon('x')));
    optsBox.append(row);
  };
  addOpt(); addOpt();
  const multi = h('input', { type: 'checkbox' });
  const anon = h('input', { type: 'checkbox', checked: true });
  const md = modal({
    title: 'Новый опрос',
    body: [
      h('label.field', null, h('span', null, 'Вопрос'), q),
      h('div.field', null, h('span', { style: { display: 'block', fontSize: '13px', color: 'var(--muted)', margin: '0 0 6px 4px' } }, 'Варианты ответа'), optsBox),
      h('div.setting-row', null, h('div.sr-main', null, 'Анонимное голосование'), h('label.switch', null, anon, h('i'))),
      h('div.setting-row', null, h('div.sr-main', null, 'Несколько ответов'), h('label.switch', null, multi, h('i'))),
    ],
    footer: [h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'), h('button.btn.btn-primary', { onclick: async () => {
      const options = $$('input', optsBox).map((i) => i.value.trim()).filter(Boolean);
      if (!q.value.trim() || options.length < 2) return toast('Нужен вопрос и минимум 2 варианта', true);
      md.close();
      await sendMsg({ type: 'poll', poll: { question: q.value, options, multiple: multi.checked, anonymous: anon.checked } });
    } }, 'Создать')],
  });
}

function sendFilesModal(files, forceFiles = false) {
  files = files.slice(0, 10);
  const media = files.every((f) => /^(image|video)\//.test(f.type) && !/svg/.test(f.type));
  const asFile = h('input', { type: 'checkbox', checked: forceFiles || !media });
  const caption = h('input.input', { placeholder: 'Добавить подпись…', autofocus: true });
  const progress = h('div.upload-progress.hidden', null, h('i', { style: { width: '0%' } }));
  const previews = h('div', { style: { display: 'grid', gridTemplateColumns: files.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: '6px', marginBottom: '14px' } },
    files.map((f) => {
      if (f.type.startsWith('image/')) return h('img', { src: URL.createObjectURL(f), style: { width: '100%', maxHeight: files.length > 1 ? '160px' : '320px', objectFit: 'cover', borderRadius: '12px' } });
      if (f.type.startsWith('video/')) return h('video', { src: URL.createObjectURL(f), muted: true, style: { width: '100%', maxHeight: '240px', borderRadius: '12px', background: '#000' } });
      return h('div.m-file', null, h('div.f-icon', null, icon('file')), h('div', null, h('div.f-name', null, f.name), h('div.f-size', null, fmtSize(f.size))));
    }));
  const btn = h('button.btn.btn-primary', null, 'Отправить');
  const md = modal({
    title: files.length > 1 ? `Отправить ${files.length} ${plural(files.length, 'файл', 'файла', 'файлов')}` : 'Отправить файл',
    body: [previews, h('div.field', null, caption),
      media ? h('div.setting-row', null, h('div.sr-main', null, 'Отправить как файл', h('div.sr-sub', null, 'Без сжатия и предпросмотра')), h('label.switch', null, asFile, h('i'))) : null,
      progress],
    footer: [h('button.btn.btn-ghost', { onclick: () => md.close() }, 'Отмена'), btn],
  });
  caption.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); btn.click(); } };
  btn.onclick = async () => {
    const big = files.find((f) => f.size > 100 * 1048576);
    if (big) return toast(`Файл «${big.name}» больше 100 МБ`, true);
    btn.disabled = true;
    progress.classList.remove('hidden');
    try {
      await uploadAndSend(files, caption.value.trim(), asFile.checked, (p) => { progress.firstChild.style.width = Math.round(p * 100) + '%'; });
      md.close();
    } catch (e) { toast(e.message, true); btn.disabled = false; }
  };
}

// ---------- панель информации ----------
let infoTab = 'media';
function toggleInfo(force) {
  S.infoOpen = force ?? !S.infoOpen;
  if (S.infoOpen) renderInfo(); else $('.info-panel')?.remove();
  updateHeader();
}
async function renderInfo() {
  const chat = S.chats.get(S.active);
  if (!chat) return;
  let panel = $('.info-panel');
  if (!panel) { panel = h('aside.info-panel'); UI.chatArea.append(panel); }
  const isPriv = chat.type === 'private';
  const peer = isPriv ? S.users.get(peerId(chat)) : null;
  const sub = chatSubtitle(chat);
  const admin = isAdmin(chat);
  const st = chat.settings || {};
  const actionBtn = (ic, label, fn, danger) => h('button', { class: danger ? 'danger' : '', onclick: fn }, icon(ic), label);

  const hero = h('div.ip-hero', null,
    (() => { const a = chatAvatar(chat, 110); a.onclick = () => { const src = isPriv ? peer?.avatar : chat.avatar; if (src) openImage(src, chatTitle(chat)); }; return a; })(),
    h('div.n', null, chatTitle(chat)),
    h('div.s', { class: sub.on ? 'on' : '' }, sub.text));
  const actions = h('div.ip-actions', null,
    isPriv && peer && peer.id !== S.me.id ? [actionBtn('phone', 'Звонок', () => startCall(peer.id, false)), actionBtn('video', 'Видео', () => startCall(peer.id, true))] : null,
    !chat.preview && chat.type !== 'saved' ? actionBtn(st.muted ? 'bell' : 'bellOff', st.muted ? 'Звук' : 'Без звука', () => rq('chatSettings', { chatId: chat.id, muted: !st.muted })) : null,
    !chat.preview && admin && (chat.type === 'group' || chat.type === 'channel') ? actionBtn('userPlus', 'Добавить', () => addMembersModal(chat)) : null,
    !chat.preview && admin && (chat.type === 'group' || chat.type === 'channel') ? actionBtn('edit', 'Изменить', () => editChatModal(chat)) : null,
    chat.preview ? actionBtn('userPlus', chat.type === 'channel' ? 'Подписаться' : 'Вступить', () => joinChat(chat.id)) : null,
    !chat.preview && (chat.type === 'group' || chat.type === 'channel') && chat.ownerId !== S.me.id ? actionBtn('logout', 'Выйти', () => deleteChat(chat), true) : null);

  const rows = h('div.ip-section');
  if (peer) {
    rows.append(h('div.ip-row.click', { onclick: () => copyText('@' + peer.username) }, icon('at'), h('div', null, h('div.v', null, '@' + peer.username), h('div.k', null, 'Имя пользователя'))));
    if (peer.bio) rows.append(h('div.ip-row', null, icon('info'), h('div', null, h('div.v', null, peer.bio), h('div.k', null, 'О себе'))));
  }
  if (!isPriv && chat.description) rows.append(h('div.ip-row', null, icon('info'), h('div', null, h('div.v', { html: formatText(chat.description) }), h('div.k', null, 'Описание'))));
  if (chat.inviteCode) {
    const link = `${location.origin}/#join=${chat.inviteCode}`;
    rows.append(h('div.ip-row.click', { onclick: () => copyText(link) }, icon('link'), h('div', { style: { minWidth: 0 } }, h('div.v', null, link), h('div.k', null, 'Пригласительная ссылка — нажмите, чтобы скопировать'))));
  }
  if (!isPriv && chat.type !== 'saved') rows.append(h('div.ip-row', null, icon(chat.isPublic ? 'globe' : 'lock'), h('div', null, h('div.v', null, chat.isPublic ? 'Публичный' : 'Частный'), h('div.k', null, chat.type === 'channel' ? 'Тип канала' : 'Тип группы'))));

  let members = null;
  if ((chat.type === 'group' || (chat.type === 'channel' && admin)) && chat.members) {
    const sorted = [...chat.members].sort((a, b) => (isAdmin(chat, b) - isAdmin(chat, a)) || ((S.users.get(b)?.online ? 1 : 0) - (S.users.get(a)?.online ? 1 : 0)));
    members = h('div.ip-section', null, h('div.section-title', null, `${chat.members.length} ${chat.type === 'channel' ? plural(chat.members.length, 'подписчик', 'подписчика', 'подписчиков') : plural(chat.members.length, 'участник', 'участника', 'участников')}`),
      sorted.map((uid) => {
        const u = S.users.get(uid) || { id: uid, name: 'Пользователь', username: '' };
        const tag = chat.ownerId === uid ? 'владелец' : isAdmin(chat, uid) ? 'админ' : null;
        const canManage = admin && uid !== S.me.id && uid !== chat.ownerId;
        return userRow(u, {
          onclick: () => { if (uid !== S.me.id) openPrivate(uid); },
          right: h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, tag ? h('span.tag', null, tag) : null,
            canManage ? h('button.icon-btn', { onclick: (e) => { e.stopPropagation(); memberMenu(chat, uid, e); } }, icon('more')) : null),
        });
      }));
  }

  const tabsBox = h('div.ip-tabs');
  const tabBody = h('div');
  const mediaSection = h('div.ip-section', null, tabsBox, tabBody);
  fill(panel, 
    h('div.ip-head', null, h('button.icon-btn', { onclick: () => toggleInfo(false) }, icon('x')), h('h3', null, isPriv || chat.type === 'saved' ? 'Информация' : chat.type === 'channel' ? 'О канале' : 'О группе')),
    h('div.ip-body', null, hero, actions, rows.childElementCount ? rows : null, members, mediaSection));

  let data = null;
  const drawTab = () => {
    const tabs = [['media', 'Медиа'], ['files', 'Файлы'], ['voice', 'Голосовые'], ['links', 'Ссылки']];
    fill(tabsBox, ...tabs.map(([id, l]) => h('button', { class: infoTab === id ? 'on' : '', onclick: () => { infoTab = id; drawTab(); } }, l + (data && data[id].length ? ` ${data[id].length}` : ''))));
    if (!data) { fill(tabBody, h('div.ip-empty', null, h('div.spinner', { style: { margin: 'auto' } }))); return; }
    const items = data[infoTab];
    if (!items.length) { fill(tabBody, h('div.ip-empty', null, 'Здесь пока ничего нет')); return; }
    if (infoTab === 'media') {
      fill(tabBody, h('div.media-grid', null, items.map((m) => h('div', { onclick: () => openViewer(m, items) },
        m.type === 'image' ? h('img', { src: m.file.url, loading: 'lazy' }) : [h('video', { src: m.file.url + '#t=0.1', preload: 'metadata', muted: true }), h('div.m-media', { style: { position: 'absolute', inset: 0, background: 'none' } }, h('div.play', null, h('span', { style: { width: '36px', height: '36px' } }, icon('play'))))]))));
    } else if (infoTab === 'links') {
      fill(tabBody, ...items.map((m) => {
        const url = (m.text.match(/https?:\/\/[^\s]+/) || [''])[0];
        return h('a.ip-list-item', { href: url, target: '_blank', rel: 'noopener noreferrer' }, h('div.f-icon', null, icon('link')), h('div.t', null, h('div', null, url.replace(/^https?:\/\//, '')), h('div.sub', null, plainText(m.text).slice(0, 80))));
      }));
    } else {
      fill(tabBody, ...items.map((m) => h('div.ip-list-item', { onclick: () => (infoTab === 'files' ? downloadFile(m.file) : jumpTo(m.id, m.seq)) },
        h('div.f-icon', null, icon(infoTab === 'voice' ? 'mic' : 'file')),
        h('div.t', null, h('div', null, infoTab === 'voice' ? userName(m.senderId) : m.file.name),
          h('div.sub', null, (infoTab === 'voice' ? fmtDur(m.file.duration) : fmtSize(m.file.size)) + ' · ' + fmtChatTime(m.createdAt))))));
    }
  };
  drawTab();
  try { data = await ws.request('getChatMedia', { chatId: chat.id }); } catch { data = { media: [], files: [], voice: [], links: [] }; }
  if (S.active === chat.id) drawTab();
}
function memberMenu(chat, uid, e) {
  const owner = chat.ownerId === S.me.id;
  const adm = isAdmin(chat, uid);
  showMenu([
    { icon: 'chat', label: 'Написать', action: () => openPrivate(uid) },
    owner && { icon: 'shield', label: adm ? 'Снять права админа' : 'Сделать админом', action: () => rq('setAdmin', { chatId: chat.id, userId: uid, admin: !adm }) },
    { icon: 'trash', label: chat.type === 'channel' ? 'Удалить из канала' : 'Удалить из группы', danger: true, action: async () => {
      if (await confirmDialog('Удалить участника', `Удалить ${userName(uid)} из «${chat.title}»?`, 'Удалить', true)) rq('removeMember', { chatId: chat.id, userId: uid });
    } },
  ], { anchor: e.currentTarget, place: 'bottom-end' });
}

// ---------- просмотр медиа ----------
function openImage(src, title) {
  openViewer({ type: 'image', file: { url: src, name: title }, senderId: null, createdAt: Date.now(), text: '' }, null);
}
function openViewer(m, list) {
  const items = list || msgStore(m.chatId).list.filter((x) => x.type === 'image' || x.type === 'video');
  let idx = Math.max(0, items.findIndex((x) => x.id === m.id));
  if (!list && idx < 0) idx = 0;
  const all = items.length ? items : [m];
  let ov;
  const top = h('div.viewer-top');
  const body = h('div.viewer-body');
  const cap = h('div.viewer-caption');
  const draw = () => {
    const cur = all[idx] || m;
    fill(top, 
      cur.senderId ? userAvatar(cur.senderId, 40, false) : null,
      h('div.vt-main', null, h('div', { style: { fontWeight: 600 } }, cur.senderId ? userName(cur.senderId) : cur.file.name || ''), h('div.vt-sub', null, cur.senderId ? fmtDay(cur.createdAt) + ', ' + fmtTime(cur.createdAt) : '')),
      h('button.icon-btn', { title: 'Скачать', onclick: () => downloadFile(cur.file) }, icon('download')),
      cur.id ? h('button.icon-btn', { title: 'Переслать', onclick: () => { ov.closeLayer(); forwardModal([cur]); } }, icon('forward')) : null,
      h('button.icon-btn', { title: 'Закрыть', onclick: () => ov.closeLayer() }, icon('x')));
    fill(body, 
      cur.type === 'video' ? h('video', { src: cur.file.url, controls: true, autoplay: true, playsinline: true }) : h('img', { src: cur.file.url, alt: '' }),
      all.length > 1 && idx > 0 ? h('button.viewer-nav.prev', { onclick: (e) => { e.stopPropagation(); idx--; draw(); } }, icon('left')) : null,
      all.length > 1 && idx < all.length - 1 ? h('button.viewer-nav.next', { onclick: (e) => { e.stopPropagation(); idx++; draw(); } }, icon('right')) : null);
    cap.innerHTML = cur.text ? formatText(cur.text) : '';
  };
  const keys = (e) => {
    if (e.key === 'ArrowLeft' && idx > 0) { idx--; draw(); }
    if (e.key === 'ArrowRight' && idx < all.length - 1) { idx++; draw(); }
  };
  ov = h('div.viewer', { onclick: (e) => { if (e.target === body || e.target === ov) ov.closeLayer(); } }, top, body, cap);
  document.addEventListener('keydown', keys);
  openLayer(ov, () => document.removeEventListener('keydown', keys));
  draw();
}
