'use strict';
/* ============ Drim: окно чата ============ */

const elCache = new WeakMap(); // объект сообщения -> DOM-элемент

async function openChat(chatId, opts = {}) {
  const chat = S.chats.get(chatId);
  if (!chat) return;
  closePopover();
  if (S.active !== chatId) {
    saveDraft();
    stopRecording(true);
    S.reply = null; S.edit = null; S.selected.clear();
    S.active = chatId;
    S.unreadMarker = chat.unread > 0 ? (chat.lastRead || 0) + 1 : null;
    if (isMobile() && UI.layout.dataset.view !== 'chat') history.pushState({ drim: 'chat' }, '');
    UI.layout.dataset.view = 'chat';
    renderChat();
    renderChatList();
  }
  const st = msgStore(chatId);
  if (opts.msgId) {
    if (!st.list.some((m) => m.id === opts.msgId)) await loadAround(chatId, opts.seq);
    renderMessages();
    highlightMsg(opts.msgId);
    return;
  }
  if (!st.loaded) {
    fill(UI.c.list, h('div.load-more', null, h('div.spinner')));
    await loadMessages(chatId);
    if (S.active !== chatId) return;
  }
  renderMessages({ initial: true });
  markRead();
  if (!isMobile()) UI.c.input?.focus();
}
function closeChat(fromHistory = false) {
  saveDraft();
  stopRecording(true);
  S.active = null;
  S.infoOpen = false;
  UI.layout.dataset.view = 'list';
  if (!fromHistory && isMobile() && history.state && history.state.drim) history.back();
  setTimeout(() => { if (!S.active) renderEmptyChat(); }, isMobile() ? 300 : 0);
  $('.info-panel')?.remove();
  renderChatList();
}
window.addEventListener('popstate', () => { if (S.active && isMobile()) closeChat(true); });

async function loadMessages(chatId) {
  const st = msgStore(chatId);
  if (st.loading) return;
  st.loading = true;
  try {
    const r = await ws.request('getMessages', { chatId, limit: 60 });
    st.list = r.messages;
    st.hasMore = r.hasMore;
    st.loaded = true;
    await ensureUsers(r.messages);
  } catch (e) { toast(e.message, true); } finally { st.loading = false; }
}
async function loadOlder() {
  const chatId = S.active;
  const st = msgStore(chatId);
  if (!st.loaded || !st.hasMore || st.loading || !st.list.length) return;
  st.loading = true;
  try {
    const r = await ws.request('getMessages', { chatId, before: st.list[0].seq, limit: 60 });
    await ensureUsers(r.messages);
    const ids = new Set(st.list.map((m) => m.id));
    st.list = [...r.messages.filter((m) => !ids.has(m.id)), ...st.list];
    st.hasMore = r.hasMore;
    if (S.active === chatId) renderMessages({ keepTop: true });
  } catch { /* повторим при следующем скролле */ } finally { st.loading = false; }
}
async function loadAround(chatId, seq) {
  const st = msgStore(chatId);
  const r = await rq('getMessages', { chatId, fromSeq: Math.max(1, (seq || 1) - 25) });
  await ensureUsers(r.messages);
  st.list = r.messages;
  st.hasMore = r.hasMore;
  st.loaded = true;
}
async function ensureUsers(msgs) {
  const missing = [...new Set(msgs.map((m) => m.senderId).filter((id) => id && !S.users.has(id)))];
  if (!missing.length) return;
  try { (await ws.request('getUsers', { ids: missing })).forEach(upsertUser); } catch { /* не критично */ }
}

// ---------- каркас окна чата ----------
function renderChat() {
  const chat = S.chats.get(S.active);
  const c = UI.c = {};
  c.title = h('div.ch-title');
  c.sub = h('div.ch-sub');
  c.avatarBox = h('div');
  const actions = h('div.ch-actions');
  c.header = h('header.chat-header', null,
    h('button.icon-btn.back', { onclick: () => closeChat(), title: 'Назад' }, icon('back')),
    h('div.ch-info', { onclick: () => toggleInfo() }, c.avatarBox, h('div', { style: { minWidth: 0 } }, c.title, c.sub)),
    actions);
  c.actions = actions;
  c.searchBar = h('div.chat-search.hidden');
  c.pinned = h('div.pinned-bar.hidden');
  c.list = h('div.msg-list');
  c.scroller = h('div.messages', null, c.list);
  c.scrollBtn = h('button.scroll-down.hidden', { onclick: () => scrollToBottom(true) }, icon('down'));
  c.composer = h('footer.composer');
  c.root = h('section.chat', { dataset: { wall: settings.wall } }, c.header, c.searchBar, c.pinned, c.scroller, c.scrollBtn, c.composer);
  fill(UI.chatArea, c.root);

  c.scroller.addEventListener('scroll', () => {
    if (c.scroller.scrollTop < 300) loadOlder();
    const atBottom = isAtBottom();
    c.scrollBtn.classList.toggle('hidden', atBottom);
    if (atBottom) markRead();
  }, { passive: true });

  // drag & drop файлов
  let dragDepth = 0, dz = null;
  c.root.addEventListener('dragenter', (e) => {
    if (!canPost(S.chats.get(S.active)) || !e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    if (dragDepth++ === 0) c.root.append(dz = h('div.drop-zone', null, icon('file'), 'Отпустите, чтобы отправить'));
  });
  c.root.addEventListener('dragover', (e) => { if (dz) e.preventDefault(); });
  c.root.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; dz?.remove(); dz = null; } });
  c.root.addEventListener('drop', (e) => {
    if (!dz) return;
    e.preventDefault(); dragDepth = 0; dz.remove(); dz = null;
    if (e.dataTransfer.files.length) sendFilesModal([...e.dataTransfer.files]);
  });

  updateHeader();
  renderPinned();
  renderComposer();
  if (S.infoOpen) renderInfo();
}

function updateHeader() {
  const c = UI.c;
  const chat = S.chats.get(S.active);
  if (!c || !chat) return;
  fill(c.avatarBox, chatAvatar(chat, 42));
  fill(c.title, chatTitle(chat), chat.settings?.muted ? icon('bellOff') : null);
  const sub = chatSubtitle(chat);
  c.sub.className = 'ch-sub' + (sub.on ? ' on' : '');
  fill(c.sub, sub.typing ? h('span.typing-dots', null, h('i'), h('i'), h('i')) : null, sub.text);
  const peer = chat.type === 'private' && peerId(chat) !== S.me.id ? peerId(chat) : null;
  fill(c.actions, 
    h('button.icon-btn', { title: 'Поиск в чате', onclick: toggleChatSearch }, icon('search')),
    peer ? h('button.icon-btn', { title: 'Аудиозвонок', onclick: () => startCall(peer, false) }, icon('phone')) : null,
    peer ? h('button.icon-btn.hide-m', { title: 'Видеозвонок', onclick: () => startCall(peer, true) }, icon('video')) : null,
    h('button.icon-btn.hide-m', { title: 'Информация', class: S.infoOpen ? 'active' : '', onclick: () => toggleInfo() }, icon('info')),
    h('button.icon-btn', { title: 'Ещё', onclick: (e) => headerMenu(chat, e) }, icon('more')));
}
function headerMenu(chat, e) {
  const peer = chat.type === 'private' && peerId(chat) !== S.me.id ? peerId(chat) : null;
  const items = [
    { icon: 'info', label: 'Информация', action: () => toggleInfo(true) },
    peer && { icon: 'video', label: 'Видеозвонок', action: () => startCall(peer, true) },
    chat.type !== 'saved' && !chat.preview && { icon: chat.settings.muted ? 'bell' : 'bellOff', label: chat.settings.muted ? 'Включить звук' : 'Выключить звук', action: () => rq('chatSettings', { chatId: chat.id, muted: !chat.settings.muted }) },
    !chat.preview && { icon: 'checkSquare', label: 'Выбрать сообщения', action: () => { toast('Нажимайте на сообщения, чтобы выбрать'); S.selecting = true; renderComposer(); } },
    isAdmin(chat) && (chat.type === 'group' || chat.type === 'channel') && { icon: 'edit', label: 'Изменить', action: () => editChatModal(chat) },
    '-',
    !chat.preview && { icon: 'eraser', label: 'Очистить историю', danger: true, action: () => clearHistory(chat) },
    !chat.preview && chat.type !== 'saved' && { icon: 'trash', label: deleteLabel(chat), danger: true, action: () => deleteChat(chat) },
  ];
  showMenu(items, { anchor: e.currentTarget, place: 'bottom-end' });
}

// ---------- закреплённые ----------
let pinnedIdx = -1;
function renderPinned() {
  const c = UI.c, chat = S.chats.get(S.active);
  if (!c || !chat) return;
  const list = chat.pinnedMsgs || [];
  if (!list.length) { c.pinned.classList.add('hidden'); return; }
  if (pinnedIdx < 0 || pinnedIdx >= list.length) pinnedIdx = list.length - 1;
  const p = list[pinnedIdx];
  c.pinned.classList.remove('hidden');
  fill(c.pinned, 
    h('div.line'),
    h('div.pb-body', null,
      h('div.pb-title', null, list.length > 1 ? `Закреплённое сообщение #${pinnedIdx + 1}` : 'Закреплённое сообщение'),
      h('div.pb-text', null, p.text ? plainText(p.text) : msgPreview(p))),
    (isAdmin(chat) || chat.type === 'private' || chat.type === 'saved')
      ? h('button.icon-btn', { title: 'Открепить', onclick: (e) => { e.stopPropagation(); rq('pinMessage', { chatId: chat.id, msgId: p.id, pin: false }); } }, icon('x')) : null);
  c.pinned.onclick = () => {
    openChat(chat.id, { msgId: p.id, seq: p.seq });
    pinnedIdx = pinnedIdx > 0 ? pinnedIdx - 1 : list.length - 1;
    setTimeout(renderPinned, 50);
  };
}

// ---------- лента сообщений ----------
function isAtBottom() {
  const s = UI.c && UI.c.scroller;
  return !s || s.scrollHeight - s.scrollTop - s.clientHeight < 120;
}
function scrollToBottom(smooth = false) {
  const s = UI.c && UI.c.scroller;
  if (!s) return;
  s.scrollTo({ top: s.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}
function renderMessages({ initial = false, keepTop = false, toBottom = false } = {}) {
  const c = UI.c, chat = S.chats.get(S.active);
  if (!c || !chat) return;
  const st = msgStore(S.active);
  const s = c.scroller;
  const wasBottom = isAtBottom();
  const prevH = s.scrollHeight, prevTop = s.scrollTop;
  const nodes = [];
  if (st.hasMore && st.loaded) nodes.push(h('div.load-more', null, h('div.spinner')));
  const list = st.list;
  let lastDay = null, unreadNode = null;
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    const day = dayKey(m.createdAt);
    if (day !== lastDay) { nodes.push(h('div.date-sep', null, h('span', null, fmtDay(m.createdAt)))); lastDay = day; }
    if (S.unreadMarker && m.seq >= S.unreadMarker && !unreadNode && m.senderId !== S.me.id) {
      unreadNode = h('div.unread-sep', null, 'Непрочитанные сообщения');
      nodes.push(unreadNode);
    }
    if (m.type === 'system') { nodes.push(h('div.sys-msg', null, m.text)); continue; }
    const prev = list[i - 1], next = list[i + 1];
    const same = (a, b) => a && b && a.type !== 'system' && b.type !== 'system' && a.senderId === b.senderId &&
      dayKey(a.createdAt) === dayKey(b.createdAt) && Math.abs(a.createdAt - b.createdAt) < 5 * 60e3;
    let el = elCache.get(m);
    if (!el) {
      el = buildMsg(m, chat);
      elCache.set(m, el);
      if (S.animate.has(m.id) || m.pending) { el.classList.add('new'); el.style.animation = 'msgIn .22s ease'; S.animate.delete(m.id); }
    }
    el.classList.toggle('first', !same(prev, m));
    el.classList.toggle('last', !same(m, next));
    el.classList.toggle('selected', S.selected.has(m.id));
    updateMsgStatus(el, m, chat);
    nodes.push(el);
  }
  if (!list.length && st.loaded) {
    nodes.push(h('div.sys-msg', { style: { margin: 'auto', padding: '16px 22px' } },
      chat.type === 'saved' ? '📌 Пересылайте сюда сообщения, сохраняйте заметки и файлы' : chat.preview ? 'Здесь пока нет сообщений' : '👋 Сообщений пока нет — напишите первым!'));
  }
  fill(c.list, ...nodes);
  if (initial) {
    if (unreadNode) unreadNode.scrollIntoView({ block: 'center' });
    else scrollToBottom();
  } else if (keepTop) {
    s.scrollTop = prevTop + (s.scrollHeight - prevH);
  } else if (toBottom || wasBottom) {
    scrollToBottom();
  }
  c.scrollBtn.classList.toggle('hidden', isAtBottom());
  const badge = chat.unread ? h('span.badge', null, chat.unread) : null;
  fill(c.scrollBtn, icon('down'), badge);
}
function updateMsgStatus(el, m, chat) {
  const st = el._status;
  if (!st) return;
  let name = 'check';
  if (m.pending) name = 'clock';
  else if (chat.type === 'saved' || chat.peerRead >= m.seq) name = 'checks';
  if (st.dataset.name !== name) { st.dataset.name = name; fill(st, icon(name)); }
}
function refreshStatuses() {
  const chat = S.chats.get(S.active);
  if (!UI.c || !chat) return;
  for (const m of msgStore(S.active).list) { const el = elCache.get(m); if (el) updateMsgStatus(el, m, chat); }
}
function highlightMsg(id) {
  const m = msgStore(S.active).list.find((x) => x.id === id);
  const el = m && elCache.get(m);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.classList.remove('highlight');
  void el.offsetWidth;
  el.classList.add('highlight');
}
async function jumpTo(id, seq) {
  const st = msgStore(S.active);
  if (!st.list.some((m) => m.id === id)) {
    if (!seq) return;
    await loadAround(S.active, seq);
    renderMessages();
  }
  highlightMsg(id);
}

function senderColor(uid) { return S.users.get(uid)?.color || 'var(--accent)'; }

function buildMsg(m, chat) {
  const out = m.senderId === S.me.id && chat.type !== 'channel';
  const groupIn = chat.type === 'group' && !out;
  const el = h('div.msg', { class: out ? 'out' : 'in', dataset: { id: m.id } });
  if (m.pending) el.classList.add('pending');
  if (groupIn) {
    el.append(h('div.m-avatar', null, (() => {
      const a = userAvatar(m.senderId, 36, false);
      a.onclick = (e) => { e.stopPropagation(); if (m.senderId !== S.me.id) openPrivate(m.senderId); };
      return a;
    })()));
  }
  const col = h('div.m-col');
  const bubble = h('div.bubble');
  const emojiN = m.type === 'text' && !m.replyTo && !m.forwardFrom ? emojiOnlyCount(m.text) : 0;
  const mediaOnly = (m.type === 'image' || m.type === 'video') && !m.text && !m.replyTo && !m.forwardFrom;
  if (m.type === 'sticker') bubble.classList.add('sticker');
  else if (emojiN) bubble.classList.add('big-emoji');
  else if (mediaOnly) bubble.classList.add('media-only');

  if (groupIn && !mediaOnly && m.type !== 'sticker') {
    bubble.append(h('div.m-sender', { style: { color: senderColor(m.senderId) }, onclick: () => openPrivate(m.senderId) }, userName(m.senderId)));
  }
  if (chat.type === 'channel' && m.forwardFrom == null && !mediaOnly && m.type !== 'sticker') {
    bubble.append(h('div.m-sender', { style: { color: chat.color } }, chat.title));
  }
  if (m.forwardFrom) {
    bubble.append(h('div.m-fwd', {
      onclick: () => { if (m.forwardFrom.userId && m.forwardFrom.userId !== S.me.id) openPrivate(m.forwardFrom.userId); },
    }, 'Переслано от', h('b', null, m.forwardFrom.name)));
  }
  if (m.reply) {
    const r = m.reply;
    bubble.append(h('div.m-reply', { onclick: (e) => { e.stopPropagation(); jumpTo(r.id, r.seq); } },
      h('div.line'),
      r.thumb ? h('img', { src: r.thumb, style: { width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flex: 'none' } }) : null,
      h('div.r-body', null,
        h('div.r-name', null, r.deleted ? 'Удалено' : chat.type === 'channel' ? chat.title : userName(r.senderId)),
        h('div.r-text', null, r.deleted ? 'Сообщение удалено' : (r.text ? plainText(r.text) : msgPreview(r))))));
  }
  bubble.append(...msgContent(m, chat));

  const meta = h('span.m-meta', null,
    m.editedAt ? h('span', null, 'изм.') : null,
    fmtTime(m.createdAt));
  if (out) { el._status = h('span.read'); meta.append(el._status); }
  if (m.type === 'text' || ((m.type === 'image' || m.type === 'video' || m.type === 'file') && m.text)) {
    const t = bubble.querySelector('.m-text:last-of-type');
    (t || bubble).append(meta);
  } else bubble.append(meta);
  col.append(bubble);

  const reacts = Object.entries(m.reactions || {}).filter(([, u]) => u.length);
  if (reacts.length) {
    col.append(h('div.reactions', null, reacts.map(([e, users]) => h('button.reaction', {
      class: users.includes(S.me.id) ? 'mine' : '',
      title: users.map(userName).join(', '),
      onclick: (ev) => { ev.stopPropagation(); react(m, e); },
    }, e, h('b', null, users.length > 1 || chat.type !== 'private' ? users.length : '')))));
  }
  el.append(col);

  el.addEventListener('contextmenu', (e) => { if (e.target.closest('a') && !e.shiftKey) return; e.preventDefault(); msgMenu(m, e); });
  el.addEventListener('dblclick', (e) => { if (!S.selected.size && canPost(chat) && !e.target.closest('.m-voice, .m-poll')) { getSelection()?.removeAllRanges(); setReply(m); } });
  el.addEventListener('click', (e) => {
    if (S.selected.size || S.selecting) { e.preventDefault(); toggleSelect(m); return; }
    const sp = e.target.closest('.spoiler');
    if (sp) sp.classList.toggle('shown');
    const mention = e.target.closest('.mention');
    if (mention) {
      const u = [...S.users.values()].find((x) => x.username === mention.dataset.u);
      if (u && u.id !== S.me.id) openPrivate(u.id);
      else if (!u) toast('Пользователь @' + mention.dataset.u + ' не найден');
    }
  });
  longPress(el, (e) => msgMenu(m, e));
  return el;
}

function msgContent(m, chat) {
  const parts = [];
  const text = () => h('div.m-text', { html: formatText(m.text) });
  const f = m.file;
  switch (m.type) {
    case 'image': {
      const ratio = f.width && f.height ? `${f.width} / ${f.height}` : null;
      parts.push(h('div.m-media', { onclick: () => openViewer(m) },
        h('img', { src: f.url, alt: '', loading: 'lazy', style: ratio ? { aspectRatio: ratio } : null })));
      if (m.text) parts.push(text());
      break;
    }
    case 'video': {
      const ratio = f.width && f.height ? `${f.width} / ${f.height}` : '16 / 9';
      parts.push(h('div.m-media', { onclick: () => openViewer(m) },
        h('video', { src: f.url + '#t=0.1', preload: 'metadata', muted: true, playsinline: true, style: { aspectRatio: ratio } }),
        h('div.play', null, h('span', null, icon('play'))),
        f.duration ? h('span', { style: { position: 'absolute', left: '8px', top: '8px', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: '8px', padding: '1px 7px', fontSize: '12px' } }, fmtDur(f.duration)) : null));
      if (m.text) parts.push(text());
      break;
    }
    case 'file':
      parts.push(h('a.m-file', { href: f.url, download: f.name, target: '_blank', onclick: (e) => e.stopPropagation() },
        h('div.f-icon', null, icon('download')),
        h('div', { style: { minWidth: 0 } }, h('div.f-name', null, f.name), h('div.f-size', null, fmtSize(f.size) + ' · ' + (f.name.split('.').pop() || '').toUpperCase().slice(0, 6)))));
      if (m.text) parts.push(text());
      break;
    case 'voice': parts.push(voicePlayer(m)); break;
    case 'sticker': parts.push(h('span.stk', null, m.text)); break;
    case 'poll': parts.push(pollEl(m)); break;
    case 'location': {
      const { lat, lon } = m.location;
      parts.push(h('a.m-loc', { href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`, target: '_blank', rel: 'noopener noreferrer' },
        h('div.map', null, icon('mapPin')),
        h('div', null, h('div', { style: { fontWeight: 600 } }, 'Геопозиция'), h('div', { style: { fontSize: '13px', opacity: 0.75 } }, `${lat.toFixed(5)}, ${lon.toFixed(5)}`), h('div', { style: { fontSize: '13px', textDecoration: 'underline' } }, 'Открыть на карте'))));
      break;
    }
    case 'call': {
      const c = m.call || {};
      const mine = m.senderId === S.me.id;
      const bad = c.status !== 'ok';
      const label = c.status === 'missed' ? (mine ? 'Отменённый звонок' : 'Пропущенный звонок')
        : c.status === 'declined' ? 'Отклонённый звонок' : c.status === 'busy' ? 'Абонент занят'
          : mine ? 'Исходящий звонок' : 'Входящий звонок';
      const peer = chat.type === 'private' ? peerId(chat) : null;
      parts.push(h('div.m-call', null,
        h('button.c-icon', { class: bad ? 'bad' : '', title: 'Перезвонить', onclick: (e) => { e.stopPropagation(); if (peer && peer !== S.me.id) startCall(peer, c.video); } }, icon(c.video ? 'video' : 'phone')),
        h('div', null, h('div', { style: { fontWeight: 600 } }, (c.video ? 'Видео: ' : '') + label), h('div', { style: { fontSize: '13px', opacity: 0.75 } }, c.status === 'ok' ? fmtDur(c.duration) : fmtTime(m.createdAt)))));
      break;
    }
    default: parts.push(text());
  }
  return parts;
}

// ---------- голосовые ----------
let currentAudio = null;
function voicePlayer(m) {
  const f = m.file;
  const wf = f.waveform && f.waveform.length ? f.waveform : Array.from({ length: 40 }, (_, i) => 0.25 + 0.6 * Math.abs(Math.sin(i * 1.7 + m.seq)));
  const bars = wf.map((v) => h('i', { style: { height: Math.max(12, v * 100) + '%' } }));
  const btn = h('button.vplay', { title: 'Воспроизвести' }, icon('play'));
  const time = h('div.vtime', null, fmtDur(f.duration));
  const wave = h('div.wave', null, bars);
  let audio = null;
  const paint = () => {
    const p = audio && audio.duration && isFinite(audio.duration) ? audio.currentTime / audio.duration : 0;
    const k = Math.round(p * bars.length);
    bars.forEach((b, i) => b.classList.toggle('on', i < k));
    time.textContent = audio && !audio.paused ? fmtDur(audio.currentTime) : fmtDur(f.duration);
  };
  const ensure = () => {
    if (audio) return audio;
    audio = new Audio(f.url);
    audio.ontimeupdate = paint;
    audio.onended = () => { fill(btn, icon('play')); audio.currentTime = 0; paint(); };
    audio.onpause = () => fill(btn, icon('play'));
    audio.onplay = () => fill(btn, icon('pause'));
    return audio;
  };
  btn.onclick = (e) => {
    e.stopPropagation();
    const a = ensure();
    if (a.paused) { if (currentAudio && currentAudio !== a) currentAudio.pause(); currentAudio = a; a.play().catch(() => toast('Не удалось воспроизвести', true)); } else a.pause();
  };
  wave.onclick = (e) => {
    e.stopPropagation();
    const a = ensure();
    const r = wave.getBoundingClientRect();
    const seek = () => { if (isFinite(a.duration)) { a.currentTime = ((e.clientX - r.left) / r.width) * a.duration; paint(); } };
    if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true });
    if (a.paused) btn.onclick(e);
  };
  return h('div.m-voice', null, btn, h('div', { style: { flex: 1, minWidth: 0 } }, wave, time));
}

// ---------- опросы ----------
function pollEl(m) {
  const p = m.poll;
  const total = new Set(p.options.flatMap((o) => o.voters)).size;
  const voted = p.options.some((o) => o.voters.includes(S.me.id));
  const chat = S.chats.get(m.chatId);
  const box = h('div.m-poll', null,
    h('div.q', null, p.question),
    h('div.kind', null, (p.anonymous ? 'Анонимный опрос' : 'Открытый опрос') + (p.multiple ? ' · несколько ответов' : '')));
  let picked = new Set();
  p.options.forEach((o, i) => {
    const pct = total ? Math.round((o.voters.length / total) * 100) : 0;
    const mine = o.voters.includes(S.me.id);
    const btn = h('button.poll-opt', {
      class: mine ? 'mine' : '',
      title: !p.anonymous && o.voters.length ? o.voters.map(userName).join(', ') : '',
      onclick: (e) => {
        e.stopPropagation();
        if (chat.preview) return toast('Вступите, чтобы голосовать');
        if (p.multiple && !voted) { picked.has(i) ? picked.delete(i) : picked.add(i); btn.classList.toggle('mine', picked.has(i)); submit.classList.toggle('hidden', !picked.size); return; }
        rq('votePoll', { chatId: m.chatId, msgId: m.id, options: mine ? [] : [i] });
      },
    },
    voted ? h('div.bar', { style: { width: pct + '%' } }) : null,
    h('div.row', null, voted ? h('span.pct', null, pct + '%') : h('span.check', { style: { width: '18px', height: '18px' } }), h('span.t', null, o.text), mine ? icon('check') : null));
    box.append(btn);
  });
  const submit = h('button.btn.btn-ghost.hidden', { style: { height: '34px', width: '100%' }, onclick: (e) => { e.stopPropagation(); rq('votePoll', { chatId: m.chatId, msgId: m.id, options: [...picked] }); } }, 'Голосовать');
  box.append(submit);
  box.append(h('div.total', null, total ? `${total} ${plural(total, 'голос', 'голоса', 'голосов')}` : 'Пока нет голосов',
    voted ? h('button', { style: { marginLeft: '10px', textDecoration: 'underline', fontSize: '13px' }, onclick: (e) => { e.stopPropagation(); rq('votePoll', { chatId: m.chatId, msgId: m.id, options: [] }); } }, 'Отменить голос') : null));
  return box;
}

// ---------- действия с сообщениями ----------
function react(m, emoji) {
  rq('react', { chatId: m.chatId, msgId: m.id, emoji });
  addRecentEmoji(emoji);
}
function canDelete(m, chat) {
  return m.senderId === S.me.id || chat.type === 'saved' || ((chat.type === 'group' || chat.type === 'channel') && isAdmin(chat));
}
function msgMenu(m, e) {
  if (m.pending) return;
  const chat = S.chats.get(m.chatId);
  if (!chat || chat.preview && !chat.isPublic) return;
  const own = m.senderId === S.me.id;
  const pinned = (chat.pinned || []).includes(m.id);
  const canPin = !chat.preview && (chat.type === 'private' || chat.type === 'saved' || isAdmin(chat));
  const reactRow = !chat.preview ? h('div.react-row', null, DRIM_REACTIONS.map((r) => h('button', { onclick: () => { closePopover(); react(m, r); } }, r))) : null;
  const items = [
    reactRow,
    canPost(chat) && { icon: 'reply', label: 'Ответить', action: () => setReply(m) },
    m.text && m.type !== 'sticker' && { icon: 'copy', label: 'Копировать текст', action: () => copyText(plainText(m.text)) },
    own && !m.forwardFrom && ['text', 'image', 'video', 'file'].includes(m.type) && { icon: 'edit', label: 'Изменить', action: () => setEdit(m) },
    canPin && { icon: 'pin', label: pinned ? 'Открепить' : 'Закрепить', action: () => rq('pinMessage', { chatId: chat.id, msgId: m.id, pin: !pinned }) },
    m.type !== 'call' && { icon: 'forward', label: 'Переслать', action: () => forwardModal([m]) },
    chat.type !== 'saved' && m.type !== 'call' && { icon: 'bookmark', label: 'В Избранное', action: () => forwardTo(savedChat()?.id, [m]) },
    m.file && { icon: 'download', label: 'Скачать', action: () => downloadFile(m.file) },
    !chat.preview && { icon: 'checkSquare', label: 'Выбрать', action: () => toggleSelect(m) },
    canDelete(m, chat) && '-',
    canDelete(m, chat) && { icon: 'trash', label: 'Удалить', danger: true, action: () => deleteMessages([m]) },
  ];
  showMenu(items, { x: e.clientX, y: e.clientY });
}
function savedChat() { return [...S.chats.values()].find((c) => c.type === 'saved'); }
function copyText(t) {
  navigator.clipboard?.writeText(t).then(() => toast('Скопировано'), () => toast('Не удалось скопировать', true));
}
function downloadFile(f) {
  const a = h('a', { href: f.url, download: f.name || 'file' });
  document.body.append(a); a.click(); a.remove();
}
async function deleteMessages(msgs) {
  const n = msgs.length;
  const chat = S.chats.get(msgs[0].chatId);
  const forAll = chat.type !== 'saved' ? ' Они будут удалены у всех участников.' : '';
  if (!await confirmDialog(n > 1 ? `Удалить ${n} ${plural(n, 'сообщение', 'сообщения', 'сообщений')}` : 'Удалить сообщение', 'Это действие нельзя отменить.' + forAll, 'Удалить', true)) return;
  await rq('deleteMessage', { chatId: chat.id, msgIds: msgs.map((m) => m.id) });
  clearSelection();
}
async function forwardTo(chatId, msgs) {
  if (!chatId) return;
  for (const m of msgs) await rq('sendMessage', { chatId, forward: { chatId: m.chatId, msgId: m.id } });
  toast(chatId === savedChat()?.id ? 'Сохранено в Избранное' : 'Переслано');
}

// ---------- выделение ----------
function toggleSelect(m) {
  if (m.pending || m.type === 'system') return;
  S.selected.has(m.id) ? S.selected.delete(m.id) : S.selected.add(m.id);
  if (!S.selected.size) S.selecting = false;
  const el = elCache.get(m);
  if (el) el.classList.toggle('selected', S.selected.has(m.id));
  renderComposer();
}
function clearSelection() {
  S.selected.clear();
  S.selecting = false;
  $$('.msg.selected').forEach((e) => e.classList.remove('selected'));
  renderComposer();
}
function selectedMsgs() { return msgStore(S.active).list.filter((m) => S.selected.has(m.id)); }

// ---------- ответ / редактирование ----------
function setReply(m) {
  S.edit = null;
  S.reply = m;
  renderComposer();
  UI.c.input?.focus();
}
function setEdit(m) {
  S.reply = null;
  S.edit = m;
  renderComposer();
  const t = UI.c.input;
  if (t) { t.value = m.text || ''; autoGrow(t); t.focus(); t.setSelectionRange(t.value.length, t.value.length); updateSendBtn(); }
}
function cancelReplyEdit() {
  const wasEdit = !!S.edit;
  S.reply = null; S.edit = null;
  renderComposer();
  if (wasEdit && UI.c.input) { UI.c.input.value = S.drafts[S.active] || ''; autoGrow(UI.c.input); updateSendBtn(); }
}

// ---------- поле ввода ----------
function saveDraft() {
  if (!S.active || !UI.c || !UI.c.input || S.edit) return;
  const v = UI.c.input.value;
  if (v.trim()) S.drafts[S.active] = v; else delete S.drafts[S.active];
  store.set('drim.drafts', S.drafts);
}
function autoGrow(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 200) + 'px'; }
function updateSendBtn() {
  const c = UI.c;
  if (!c || !c.sendBtn) return;
  const hasText = c.input.value.trim().length > 0;
  const showSend = hasText || S.edit;
  const want = showSend ? (S.edit ? 'check' : 'send') : 'mic';
  if (c.sendBtn.dataset.icon !== want) {
    c.sendBtn.dataset.icon = want;
    fill(c.sendBtn, icon(want));
    c.sendBtn.title = showSend ? 'Отправить' : 'Голосовое сообщение';
  }
}
let typingSentAt = 0;
function sendTyping(kind = 'text') {
  if (Date.now() - typingSentAt < 2500 && kind === 'text') return;
  typingSentAt = kind === 'stop' ? 0 : Date.now();
  ws.emit('typing', { chatId: S.active, kind });
}

function composerMode(chat) {
  if (S.selected.size || S.selecting) return 'select';
  return chat.preview ? 'preview' : canPost(chat) ? 'post' : 'readonly';
}
function renderComposer() {
  const c = UI.c, chat = S.chats.get(S.active);
  if (!c || !chat) return;
  c.mode = composerMode(chat);
  const hadFocus = c.input && document.activeElement === c.input;
  const oldVal = c.input ? c.input.value : null;
  c.input = null; c.sendBtn = null;
  if (S.selected.size || S.selecting) {
    const n = S.selected.size;
    const msgs = selectedMsgs();
    const canDel = n && msgs.every((m) => canDelete(m, chat));
    fill(c.composer, h('div.select-bar', null,
      h('button.icon-btn', { onclick: clearSelection, title: 'Отмена' }, icon('x')),
      h('div.cnt', null, n ? `Выбрано: ${n}` : 'Выберите сообщения'),
      n ? h('button.btn.btn-ghost', { onclick: () => forwardModal(msgs.filter((m) => m.type !== 'call')) }, icon('forward'), 'Переслать') : null,
      n && canDel ? h('button.btn.btn-danger', { onclick: () => deleteMessages(msgs) }, icon('trash'), 'Удалить') : null));
    return;
  }
  if (chat.preview) {
    fill(c.composer, h('div.join-bar', null, h('button.btn', { onclick: () => joinChat(chat.id) }, chat.type === 'channel' ? 'Подписаться' : 'Вступить в группу')));
    return;
  }
  if (!canPost(chat)) {
    fill(c.composer, h('div.join-bar', null, h('button.btn', { onclick: () => rq('chatSettings', { chatId: chat.id, muted: !chat.settings.muted }) },
      chat.settings.muted ? 'Включить уведомления' : 'Выключить уведомления')));
    return;
  }
  if (c.recording) return renderRecording();

  const t = h('textarea', {
    rows: 1, placeholder: chat.type === 'channel' ? 'Публикация…' : 'Сообщение',
    oninput: () => { autoGrow(t); updateSendBtn(); if (t.value.trim()) sendTyping(); },
    onkeydown: (e) => {
      if (e.key === 'Enter' && !e.isComposing && ((settings.enterSend && !e.shiftKey) || e.ctrlKey || e.metaKey)) { e.preventDefault(); submitComposer(); }
      else if (e.key === 'ArrowUp' && !t.value) {
        const mine = [...msgStore(S.active).list].reverse().find((m) => m.senderId === S.me.id && !m.forwardFrom && ['text', 'image', 'video', 'file'].includes(m.type));
        if (mine) { e.preventDefault(); setEdit(mine); }
      }
    },
    onpaste: (e) => {
      const files = [...(e.clipboardData?.files || [])];
      if (files.length) { e.preventDefault(); sendFilesModal(files); }
    },
  });
  c.input = t;
  const extra = [];
  if (S.reply || S.edit) {
    const m = S.reply || S.edit;
    extra.push(h('div.composer-extra', null, icon(S.edit ? 'edit' : 'reply'),
      h('div.ce-body', { style: { cursor: 'pointer' }, onclick: () => jumpTo(m.id, m.seq) },
        h('div.ce-title', null, S.edit ? 'Редактирование' : 'Ответ ' + (chat.type === 'channel' ? chat.title : userName(m.senderId))),
        h('div.ce-text', null, msgPreview(m) || '…')),
      h('button.icon-btn', { onclick: cancelReplyEdit, title: 'Отмена' }, icon('x'))));
  }
  const emojiBtn = h('button.icon-btn', { title: 'Эмодзи и стикеры', 'data-popover-toggle': '', onclick: (e) => toggleEmojiPanel(e.currentTarget) }, icon('smile'));
  const attachBtn = h('button.icon-btn', { title: 'Прикрепить', 'data-popover-toggle': '', onclick: (e) => attachMenu(e.currentTarget) }, icon('clip'));
  c.sendBtn = h('button.send-btn', {
    onclick: () => (t.value.trim() || S.edit ? submitComposer() : startRecording()),
  });
  fill(c.composer, h('div.composer-inner', null,
    h('div.composer-box', null, extra, h('div.composer-row', null, attachBtn, t, emojiBtn)),
    c.sendBtn));
  t.value = oldVal != null ? oldVal : (S.drafts[S.active] || '');
  autoGrow(t);
  updateSendBtn();
  if (hadFocus) t.focus();
}
async function submitComposer() {
  const c = UI.c, chat = S.chats.get(S.active);
  const text = c.input.value.trim();
  if (S.edit) {
    const m = S.edit;
    if (!text && m.type === 'text') return deleteMessages([m]);
    if (text !== (m.text || '')) await rq('editMessage', { chatId: chat.id, msgId: m.id, text }).catch(() => {});
    S.edit = null;
    c.input.value = S.drafts[S.active] || '';
    renderComposer();
    return;
  }
  if (!text) return;
  c.input.value = '';
  autoGrow(c.input);
  delete S.drafts[S.active];
  store.set('drim.drafts', S.drafts);
  const replyTo = S.reply ? S.reply.id : undefined;
  if (S.reply) { S.reply = null; renderComposer(); }
  updateSendBtn();
  sendTyping('stop');
  // большие тексты отправляем по частям
  const chunks = [];
  for (let i = 0; i < text.length; i += 4000) chunks.push(text.slice(i, i + 4000));
  for (const [i, chunk] of chunks.entries()) await sendMsg({ type: 'text', text: chunk, replyTo: i ? undefined : replyTo });
}
async function sendMsg(data, chatId = S.active) {
  const clientId = tmpId();
  const st = msgStore(chatId);
  const chat = S.chats.get(chatId);
  const temp = {
    id: clientId, chatId, seq: (chat.seq || 0) + 0.5, senderId: S.me.id, createdAt: Date.now(), reactions: {}, pending: true,
    reply: data.replyTo ? (() => { const r = st.list.find((x) => x.id === data.replyTo); return r && { id: r.id, seq: r.seq, senderId: r.senderId, type: r.type, text: r.text }; })() : undefined,
    replyTo: data.replyTo, ...data,
  };
  if (data.type !== 'call' && data.type !== 'poll' && st.loaded) {
    st.list.push(temp);
    if (S.active === chatId) renderMessages({ toBottom: true });
  }
  try {
    await ws.request('sendMessage', { chatId, clientId, ...data });
    sounds.sent();
  } catch (e) {
    toast(e.message, true);
  } finally {
    const i = st.list.indexOf(temp);
    if (i >= 0) { st.list.splice(i, 1); if (S.active === chatId) renderMessages(); }
  }
}

// ---------- эмодзи и стикеры ----------
function addRecentEmoji(e) {
  const rec = store.get('drim.recentEmoji', []);
  store.set('drim.recentEmoji', [e, ...rec.filter((x) => x !== e)].slice(0, 32));
}
function insertAtCursor(t, text) {
  const s = t.selectionStart ?? t.value.length, e = t.selectionEnd ?? t.value.length;
  t.value = t.value.slice(0, s) + text + t.value.slice(e);
  t.selectionStart = t.selectionEnd = s + text.length;
  autoGrow(t); updateSendBtn();
}
function toggleEmojiPanel(anchor) {
  if (activePopover && activePopover.classList.contains('emoji-pop')) { closePopover(); return; }
  let tab = 'emoji';
  const body = h('div.ep-body');
  const nav = h('div.ep-nav');
  const tabs = h('div.ep-tabs');
  const draw = () => {
    fill(tabs, 
      h('button', { class: tab === 'emoji' ? 'on' : '', onclick: () => { tab = 'emoji'; draw(); } }, 'Эмодзи'),
      h('button', { class: tab === 'stickers' ? 'on' : '', onclick: () => { tab = 'stickers'; draw(); } }, 'Стикеры'));
    if (tab === 'emoji') {
      const cats = DRIM_EMOJI.map((c) => (c.id === 'recent' ? { ...c, list: store.get('drim.recentEmoji', []) } : c)).filter((c) => c.list.length);
      fill(body, ...cats.map((c) => [h('div.ep-cat', { id: 'ep-' + c.id }, c.name),
        h('div.ep-grid', null, c.list.map((e) => h('button', { onclick: () => { addRecentEmoji(e); if (UI.c.input) insertAtCursor(UI.c.input, e); } }, e)))]).flat());
      fill(nav, ...cats.map((c) => h('button', { title: c.name, onclick: () => body.querySelector('#ep-' + c.id)?.scrollIntoView() }, c.icon)));
      nav.classList.remove('hidden');
    } else {
      fill(body, ...DRIM_STICKERS.map((p) => [h('div.ep-cat', null, p.name),
        h('div.ep-grid.stickers', null, p.list.map((s) => h('button', { onclick: () => { closePopover(); sendMsg({ type: 'sticker', text: s, replyTo: S.reply?.id }); if (S.reply) { S.reply = null; renderComposer(); } } }, s)))]).flat());
      nav.classList.add('hidden');
    }
    body.scrollTop = 0;
  };
  draw();
  const pop = openPopover(h('div.emoji-panel', null, tabs, body, nav), { anchor, place: 'top-end' });
  pop.classList.add('emoji-pop');
}

// ---------- вложения ----------
function pickFiles(accept, multiple = true) {
  const inp = h('input', { type: 'file', accept, multiple });
  inp.onchange = () => { if (inp.files.length) sendFilesModal([...inp.files], accept === '*/*'); };
  inp.click();
}
function attachMenu(anchor) {
  if (activePopover) { closePopover(); return; }
  openPopover(menuEl([
    { icon: 'image', label: 'Фото или видео', action: () => pickFiles('image/*,video/*') },
    { icon: 'file', label: 'Файл', action: () => pickFiles('*/*') },
    { icon: 'poll', label: 'Опрос', action: pollModal },
    { icon: 'mapPin', label: 'Геопозиция', action: sendLocation },
  ]), { anchor, place: 'top-start' });
}
function sendLocation() {
  if (!navigator.geolocation) return toast('Геолокация недоступна', true);
  toast('Определяем местоположение…');
  navigator.geolocation.getCurrentPosition(
    (p) => sendMsg({ type: 'location', location: { lat: p.coords.latitude, lon: p.coords.longitude } }),
    () => toast('Нет доступа к геопозиции', true), { enableHighAccuracy: true, timeout: 15000 });
}
function mediaInfo(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (v) => { URL.revokeObjectURL(url); resolve(v); };
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => done({});
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => done({ width: v.videoWidth, height: v.videoHeight, duration: v.duration });
      v.onerror = () => done({});
      v.src = url;
    } else done({});
  });
}
async function uploadAndSend(files, caption, asFiles, onProgress) {
  const chatId = S.active;
  const replyTo = S.reply?.id;
  if (S.reply) { S.reply = null; renderComposer(); }
  sendTyping('file');
  let doneBytes = 0;
  const total = files.reduce((s, f) => s + f.size, 0) || 1;
  for (const [i, file] of files.entries()) {
    const kind = asFiles ? 'file' : file.type.startsWith('image/') && !/svg/.test(file.type) ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
    const info = kind === 'file' ? {} : await mediaInfo(file);
    const up = await api.upload(file, (p) => onProgress?.((doneBytes + p * file.size) / total));
    doneBytes += file.size;
    await sendMsg({ type: kind, file: { ...up, ...info }, text: i === files.length - 1 ? caption : '', replyTo: i === 0 ? replyTo : undefined }, chatId);
  }
  sendTyping('stop');
}

// ---------- запись голосовых ----------
async function startRecording() {
  const c = UI.c;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('Запись звука не поддерживается браузером', true);
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return toast('Нет доступа к микрофону', true); }
  const types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
  const mimeType = types.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const ctx = getAudioCtx();
  let analyser = null;
  if (ctx) { analyser = ctx.createAnalyser(); analyser.fftSize = 256; ctx.createMediaStreamSource(stream).connect(analyser); }
  c.recording = { rec, stream, chunks, start: Date.now(), levels: [], analyser, chatId: S.active };
  rec.start(250);
  sendTyping('voice');
  renderRecording();
  const buf = new Uint8Array(128);
  c.recording.timer = setInterval(() => {
    const r = c.recording;
    if (!r) return;
    let lvl = 0.15;
    if (analyser) { analyser.getByteTimeDomainData(buf); let sum = 0; for (const v of buf) sum += ((v - 128) / 128) ** 2; lvl = Math.min(1, Math.sqrt(sum / buf.length) * 4); }
    r.levels.push(lvl);
    if (r.timeEl) r.timeEl.textContent = fmtDur((Date.now() - r.start) / 1000);
    if (r.waveEl) { r.waveEl.append(h('i', { style: { height: Math.max(8, lvl * 100) + '%' } })); if (r.waveEl.childElementCount > 120) r.waveEl.firstChild.remove(); }
    if (r.levels.length % 25 === 0) sendTyping('voice');
  }, 100);
}
function renderRecording() {
  const c = UI.c, r = c.recording;
  r.timeEl = h('span.rec-time', null, fmtDur((Date.now() - r.start) / 1000));
  r.waveEl = h('div.rec-wave');
  fill(c.composer, h('div.composer-inner', null,
    h('div.composer-box', null, h('div.rec-row', null,
      h('button.icon-btn', { title: 'Отменить', onclick: () => stopRecording(true) }, icon('trash')),
      h('span.rec-dot'), r.timeEl, r.waveEl)),
    h('button.send-btn', { title: 'Отправить', onclick: () => stopRecording(false) }, icon('send'))));
}
function stopRecording(cancel) {
  const c = UI.c;
  const r = c && c.recording;
  if (!r) return;
  c.recording = null;
  clearInterval(r.timer);
  const duration = (Date.now() - r.start) / 1000;
  r.rec.onstop = async () => {
    r.stream.getTracks().forEach((t) => t.stop());
    sendTyping('stop');
    if (cancel || duration < 0.6) { if (!cancel) toast('Слишком короткое сообщение'); return; }
    const type = r.rec.mimeType || 'audio/webm';
    const blob = new Blob(r.chunks, { type });
    const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm';
    const n = 48, lv = r.levels;
    const waveform = Array.from({ length: n }, (_, i) => {
      const a = Math.floor((i * lv.length) / n), b = Math.max(a + 1, Math.floor(((i + 1) * lv.length) / n));
      const s = lv.slice(a, b); return s.length ? Math.max(...s) : 0.1;
    });
    try {
      const up = await api.upload(blob, null, `voice-${Date.now()}.${ext}`);
      await sendMsg({ type: 'voice', file: { ...up, mime: type, duration, waveform } }, r.chatId);
    } catch (e) { toast(e.message, true); }
  };
  try { r.rec.stop(); } catch { r.stream.getTracks().forEach((t) => t.stop()); }
  if (S.active === r.chatId) renderComposer();
}

// ---------- чтение ----------
function markRead() {
  const chat = S.chats.get(S.active);
  if (!chat || chat.preview || document.hidden) return;
  if (!isAtBottom()) return;
  const last = [...msgStore(S.active).list].reverse().find((m) => !m.pending);
  if (!last || ((chat.lastRead || 0) >= last.seq && !chat.unread)) return;
  chat.lastRead = last.seq;
  chat.unread = 0;
  ws.emit('read', { chatId: chat.id, seq: last.seq });
  renderChatList();
  if (UI.c) fill(UI.c.scrollBtn, icon('down'));
}
window.addEventListener('focus', () => markRead());
document.addEventListener('visibilitychange', () => { if (!document.hidden) markRead(); });

// ---------- поиск в чате ----------
function toggleChatSearch() {
  const bar = UI.c.searchBar;
  if (!bar.classList.contains('hidden')) { bar.classList.add('hidden'); return; }
  let results = [], idx = 0;
  const count = h('span.count');
  const inp = h('input', { placeholder: 'Поиск по сообщениям', type: 'search' });
  const go = (d) => {
    if (!results.length) return;
    idx = (idx + d + results.length) % results.length;
    count.textContent = `${idx + 1} из ${results.length}`;
    jumpTo(results[idx].id, results[idx].seq);
  };
  inp.oninput = debounce(async () => {
    const q = inp.value.trim();
    if (q.length < 2) { results = []; count.textContent = ''; return; }
    try { results = (await ws.request('searchMessages', { q, chatId: S.active })).results; } catch { results = []; }
    idx = -1;
    count.textContent = results.length ? '' : 'Не найдено';
    if (results.length) go(1);
  }, 300);
  inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); } };
  fill(bar, h('div.search-box', null, icon('search'), inp), count,
    h('button.icon-btn', { title: 'Предыдущее (новее)', onclick: () => go(-1) }, icon('up')),
    h('button.icon-btn', { title: 'Следующее (старее)', onclick: () => go(1) }, icon('down')),
    h('button.icon-btn', { title: 'Закрыть', onclick: () => bar.classList.add('hidden') }, icon('x')));
  bar.classList.remove('hidden');
  inp.focus();
}

async function joinChat(chatId) {
  const r = await rq('joinChat', { chatId });
  r.users?.forEach(upsertUser);
  upsertChat(r.chat);
  renderChatList();
  if (S.active === chatId) { renderComposer(); updateHeader(); if (S.infoOpen) renderInfo(); }
  toast(r.chat.type === 'channel' ? 'Вы подписались на канал' : 'Вы вступили в группу');
}
