'use strict';
/* ============ Drim: запуск и обработка событий сервера ============ */

let initialized = false;

function startApp() {
  if (!api.token) { renderAuth(); return; }
  renderMain();
  fill(UI.sbBody, h('div.empty-list', null, h('div.spinner', { style: { margin: 'auto' } })));
  ws.connect();
}

async function onConnected() {
  setConnState(true);
  try {
    const r = await ws.request('init');
    S.me = r.me;
    r.users.forEach(upsertUser);
    const ids = new Set(r.chats.map((c) => c.id));
    for (const [id, c] of S.chats) if (!ids.has(id) && !c.preview) S.chats.delete(id);
    r.chats.forEach(upsertChat);
    // после переподключения перезагружаем открытые чаты
    for (const [id, st] of S.msgs) { if (id !== S.active) S.msgs.delete(id); else st.loaded = false; }
    renderChatList();
    if (S.active) {
      if (S.chats.has(S.active)) { await loadMessages(S.active); renderMessages(); updateHeader(); renderPinned(); markRead(); }
      else closeChat();
    }
    if (!initialized) {
      initialized = true;
      handleHash();
      if (settings.notify && 'Notification' in window && Notification.permission === 'default') {
        // спрашиваем разрешение на уведомления по первому клику пользователя
        document.addEventListener('click', () => Notification.requestPermission().catch(() => {}), { once: true });
      }
    }
  } catch (e) {
    toast(e.message, true);
  }
}

async function handleHash() {
  const m = location.hash.match(/^#join=([\w-]+)/);
  if (!m) return;
  history.replaceState(null, '', location.pathname);
  try {
    const r = await ws.request('joinChat', { inviteCode: m[1] });
    r.users?.forEach(upsertUser);
    upsertChat(r.chat);
    renderChatList();
    openChat(r.chat.id);
    toast(`Добро пожаловать в «${r.chat.title}»`);
  } catch (e) { toast(e.message, true); }
}
window.addEventListener('hashchange', () => { if (S.me) handleHash(); });

async function logout(expired = false) {
  if (!expired) { try { await api.post('/api/logout'); } catch { /* всё равно выходим */ } }
  ws.stop();
  cleanupCall();
  api.token = null;
  store.del('drim.token');
  store.del('drim.drafts');
  Object.assign(S, { me: null, active: null, search: '', folder: 'all', reply: null, edit: null, infoOpen: false, drafts: {} });
  S.users.clear(); S.chats.clear(); S.msgs.clear(); S.typing.clear(); S.selected.clear();
  initialized = false;
  fill($('#layers'));
  if (expired) toast('Сессия истекла, войдите снова', true);
  renderAuth();
}

// ---------- события ----------
function handleEvent(ev) {
  switch (ev.type) {
    case 'chat': {
      ev.users?.forEach(upsertUser);
      const chat = upsertChat(ev.chat);
      if (ev.cleared) { const st = msgStore(chat.id); st.list = []; st.hasMore = false; st.loaded = true; }
      renderChatList();
      if (S.active === chat.id) {
        updateHeader(); renderPinned(); refreshStatuses();
        if (ev.cleared) renderMessages();
        else if (UI.c && !UI.c.recording && UI.c.mode !== composerMode(chat)) renderComposer();
        if (S.infoOpen) renderInfo();
      }
      break;
    }
    case 'chatRemove': {
      const wasActive = S.active === ev.chatId;
      S.chats.delete(ev.chatId);
      S.msgs.delete(ev.chatId);
      if (wasActive) closeChat();
      renderChatList();
      break;
    }
    case 'message': {
      upsertUser(ev.sender);
      const chat = upsertChat(ev.chat);
      const m = ev.message;
      const st = S.msgs.get(m.chatId);
      if (st && st.loaded) {
        if (ev.clientId) { const i = st.list.findIndex((x) => x.id === ev.clientId); if (i >= 0) st.list.splice(i, 1); }
        if (!st.list.some((x) => x.id === m.id)) { S.animate.add(m.id); st.list.push(m); st.list.sort((a, b) => a.seq - b.seq); }
      }
      const typing = S.typing.get(m.chatId);
      if (typing && m.senderId) typing.delete(m.senderId);
      if (S.active === m.chatId) {
        if (st && st.loaded) renderMessages({ toBottom: m.senderId === S.me.id });
        updateHeader();
        if (m.senderId !== S.me.id) markRead();
        if (S.infoOpen && ['image', 'video', 'file', 'voice'].includes(m.type)) renderInfo();
      }
      renderChatList();
      if (m.senderId && m.senderId !== S.me.id) notifyMessage(chat, m);
      break;
    }
    case 'messageUpdate': {
      const m = ev.message;
      const st = S.msgs.get(m.chatId);
      if (st) { const i = st.list.findIndex((x) => x.id === m.id); if (i >= 0) st.list[i] = m; }
      const chat = S.chats.get(m.chatId);
      if (chat && chat.lastMessage && chat.lastMessage.id === m.id) chat.lastMessage = m;
      if (S.edit && S.edit.id === m.id) S.edit = m;
      if (S.active === m.chatId) renderMessages();
      renderChatList();
      break;
    }
    case 'messageDelete': {
      const st = S.msgs.get(ev.chatId);
      const ids = new Set(ev.ids);
      if (st) {
        st.list = st.list.filter((x) => !ids.has(x.id));
        st.list.forEach((x, i) => { if (x.reply && ids.has(x.reply.id)) st.list[i] = { ...x, reply: { ...x.reply, deleted: true } }; });
      }
      ids.forEach((id) => S.selected.delete(id));
      if (S.reply && ids.has(S.reply.id)) S.reply = null;
      if (S.edit && ids.has(S.edit.id)) S.edit = null;
      upsertChat(ev.chat);
      if (S.active === ev.chatId) { renderMessages(); renderPinned(); if (S.infoOpen) renderInfo(); }
      renderChatList();
      break;
    }
    case 'typing': {
      let map = S.typing.get(ev.chatId);
      if (!map) S.typing.set(ev.chatId, (map = new Map()));
      const old = map.get(ev.userId);
      if (old) clearTimeout(old.t);
      if (ev.kind === 'stop') map.delete(ev.userId);
      else map.set(ev.userId, { kind: ev.kind, t: setTimeout(() => { map.delete(ev.userId); onTypingChange(ev.chatId); }, 6000) });
      onTypingChange(ev.chatId);
      break;
    }
    case 'presence': {
      const u = S.users.get(ev.userId);
      if (u) { u.online = ev.online; u.lastSeen = ev.lastSeen; }
      renderChatList();
      if (S.active) updateHeader();
      break;
    }
    case 'user': {
      upsertUser(ev.user);
      renderChatList();
      if (S.active) updateHeader();
      break;
    }
    case 'read': {
      const chat = S.chats.get(ev.chatId);
      if (chat) chat.peerRead = Math.max(chat.peerRead || 0, ev.seq);
      if (S.active === ev.chatId) refreshStatuses();
      renderChatList();
      break;
    }
    case 'call': onCallSignal(ev); break;
    default: break;
  }
}
function onTypingChange(chatId) {
  renderChatList();
  if (S.active === chatId) updateHeader();
}

// ---------- уведомления ----------
function notifyMessage(chat, m) {
  if (!chat || chat.settings?.muted) return;
  const visible = !document.hidden && S.active === chat.id;
  if (visible) return;
  sounds.incoming();
  if (!settings.notify || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
  const title = chat.type === 'private' ? userName(m.senderId) : chatTitle(chat);
  const body = settings.preview ? (chat.type === 'group' ? userName(m.senderId) + ': ' : '') + msgPreview(m) : 'Новое сообщение';
  const opts = { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: chat.id, data: { chatId: chat.id }, renotify: true };
  try {
    const n = new Notification(title, opts);
    n.onclick = () => { window.focus(); openChat(chat.id); n.close(); };
  } catch {
    navigator.serviceWorker?.ready.then((reg) => reg.showNotification(title, opts)).catch(() => {});
  }
}
navigator.serviceWorker?.addEventListener('message', (e) => { if (e.data?.type === 'openChat' && S.chats.has(e.data.chatId)) openChat(e.data.chatId); });

// ---------- установка как приложения ----------
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
window.addEventListener('appinstalled', () => { installPrompt = null; toast('Drim установлен 🎉'); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
async function installApp() {
  if (installPrompt) {
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch { /* отменено */ }
    installPrompt = null;
    return;
  }
  installModal();
}

// ---------- запуск ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
setInterval(() => { if (S.me && S.active) updateHeader(); }, 60000);
startApp();
