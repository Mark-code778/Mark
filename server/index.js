'use strict';
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const db = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const D = db.data;

const COLORS = ['#7C5CFF', '#FF6B8B', '#22C55E', '#F59E0B', '#06B6D4', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#A855F7'];
const MSG_TYPES = new Set(['text', 'image', 'video', 'file', 'voice', 'sticker', 'poll', 'location', 'call']);
const MAX_TEXT = 4096;

const rid = (n = 12) => crypto.randomBytes(n).toString('base64url');
const now = () => Date.now();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

class UserError extends Error {}
const fail = (m) => { throw new UserError(m); };

// ---------- пароли и сессии ----------
function hashPassword(pw, salt = rid(16)) {
  return { salt, hash: crypto.scryptSync(String(pw), salt, 64).toString('hex') };
}
function checkPassword(pw, user) {
  const h = crypto.scryptSync(String(pw), user.salt, 64);
  const ref = Buffer.from(user.hash, 'hex');
  return h.length === ref.length && crypto.timingSafeEqual(h, ref);
}
function newSession(uid) {
  const token = rid(32);
  D.sessions[token] = uid;
  return token;
}

// ---------- представления ----------
const sockets = new Map(); // uid -> Set<ws>
const msgIndex = new Map(); // id -> message
for (const list of Object.values(D.messages)) for (const m of list) msgIndex.set(m.id, m);

function snippet(m) {
  if (!m) return null;
  return { id: m.id, seq: m.seq, senderId: m.senderId, type: m.type, deleted: !!m.deleted,
    text: (m.text || (m.poll ? m.poll.question : '') || (m.file ? m.file.name : '')).slice(0, 200),
    thumb: m.type === 'image' && m.file ? m.file.url : undefined };
}

function userView(u) {
  if (!u) return null;
  return {
    id: u.id, username: u.username, name: u.name, bio: u.bio || '',
    avatar: u.avatar || null, color: u.color, online: sockets.has(u.id), lastSeen: u.lastSeen || u.createdAt,
  };
}
function selfView(u) { return { ...userView(u), createdAt: u.createdAt }; }

function msgView(m) {
  if (!m) return null;
  const v = {
    id: m.id, chatId: m.chatId, seq: m.seq, senderId: m.senderId, type: m.type, text: m.text || '',
    createdAt: m.createdAt, editedAt: m.editedAt || null, reactions: m.reactions || {},
  };
  if (m.file) v.file = m.file;
  if (m.replyTo) { v.replyTo = m.replyTo; v.reply = snippet(msgIndex.get(m.replyTo)); }
  if (m.forwardFrom) v.forwardFrom = m.forwardFrom;
  if (m.poll) v.poll = m.poll;
  if (m.location) v.location = m.location;
  if (m.call) v.call = m.call;
  return v;
}

function chatMsgs(chatId) { return D.messages[chatId] || (D.messages[chatId] = []); }
function stateOf(chat, uid) {
  if (!chat.state[uid]) chat.state[uid] = { lastRead: chat.seq || 0, muted: false, pinned: false, archived: false, clearedSeq: 0, hidden: false };
  return chat.state[uid];
}
function isMember(chat, uid) { return chat.members.includes(uid); }
function isAdmin(chat, uid) { return chat.ownerId === uid || (chat.admins || []).includes(uid); }

function lastVisible(chat, uid) {
  const st = chat.state[uid] || {};
  const msgs = chatMsgs(chat.id);
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.seq <= (st.clearedSeq || 0)) return null;
    if (!m.deleted) return m;
  }
  return null;
}
function unreadCount(chat, uid) {
  const st = chat.state[uid] || {};
  const lr = Math.max(st.lastRead || 0, st.clearedSeq || 0);
  const msgs = chatMsgs(chat.id);
  let c = 0;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.seq <= lr) break;
    if (!m.deleted && m.senderId !== uid && m.type !== 'system') c++;
  }
  return c;
}

function chatPreview(chat) {
  return {
    id: chat.id, type: chat.type, title: chat.title, description: chat.description || '',
    avatar: chat.avatar || null, color: chat.color, isPublic: !!chat.isPublic, membersCount: chat.members.length,
    preview: true,
  };
}

function chatView(chat, uid) {
  const st = stateOf(chat, uid);
  let peerRead = 0;
  for (const m of chat.members) if (m !== uid) peerRead = Math.max(peerRead, (chat.state[m] || {}).lastRead || 0);
  const last = lastVisible(chat, uid);
  return {
    id: chat.id, type: chat.type, title: chat.title || null, description: chat.description || '',
    avatar: chat.avatar || null, color: chat.color, members: chat.members, admins: chat.admins || [],
    ownerId: chat.ownerId || null, isPublic: !!chat.isPublic, membersCount: chat.members.length,
    inviteCode: chat.type !== 'private' && chat.type !== 'saved' && isAdmin(chat, uid) ? chat.inviteCode : undefined,
    pinned: chat.pinned || [], pinnedMsgs: (chat.pinned || []).slice(-20).map((id) => snippet(msgIndex.get(id))).filter(Boolean), createdAt: chat.createdAt, seq: chat.seq || 0,
    lastMessage: msgView(last), lastActivity: last ? last.createdAt : chat.createdAt,
    unread: unreadCount(chat, uid), lastRead: st.lastRead || 0, peerRead,
    settings: { muted: !!st.muted, pinned: !!st.pinned, archived: !!st.archived },
  };
}

// ---------- доставка событий ----------
function emitToUser(uid, event) {
  const set = sockets.get(uid);
  if (!set) return;
  const s = JSON.stringify(event);
  for (const ws of set) if (ws.readyState === 1) ws.send(s);
}
function emitChat(chat, uids = chat.members, withUsers = false) {
  const users = withUsers ? chat.members.map((id) => userView(D.users[id])).filter(Boolean) : undefined;
  for (const uid of uids) emitToUser(uid, { type: 'chat', chat: chatView(chat, uid), users });
}
function emitToAllOnline(event) {
  const s = JSON.stringify(event);
  for (const set of sockets.values()) for (const ws of set) if (ws.readyState === 1) ws.send(s);
}
function broadcastPresence(uid) {
  const u = D.users[uid];
  if (u) emitToAllOnline({ type: 'presence', userId: uid, online: sockets.has(uid), lastSeen: u.lastSeen });
}

// ---------- сообщения ----------
function pushMessage(chat, uid, fields, clientId) {
  chat.seq = (chat.seq || 0) + 1;
  const m = {
    id: rid(9), chatId: chat.id, seq: chat.seq, senderId: uid, type: 'text', text: '',
    reactions: {}, createdAt: now(), ...fields,
  };
  chatMsgs(chat.id).push(m);
  msgIndex.set(m.id, m);
  if (uid) stateOf(chat, uid).lastRead = chat.seq;
  for (const mid of chat.members) {
    const st = stateOf(chat, mid);
    if (st.hidden) st.hidden = false;
    if (st.archived && !st.muted && mid !== uid) st.archived = false;
  }
  db.save();
  const sender = userView(D.users[uid]);
  for (const mid of chat.members) {
    emitToUser(mid, { type: 'message', message: msgView(m), chat: chatView(chat, mid), sender, clientId: mid === uid ? clientId : undefined });
  }
  return m;
}
function systemMessage(chat, text) {
  return pushMessage(chat, null, { type: 'system', text });
}
function nameOf(uid) { const u = D.users[uid]; return u ? u.name : 'Пользователь'; }

function findMsg(chat, msgId) {
  const m = msgIndex.get(msgId);
  if (!m || m.deleted || m.chatId !== chat.id) fail('Сообщение не найдено');
  return m;
}
function emitMsgUpdate(chat, m) {
  for (const uid of chat.members) emitToUser(uid, { type: 'messageUpdate', message: msgView(m) });
}

function getChat(chatId, uid, allowPublic = false) {
  const chat = D.chats[chatId];
  if (!chat) fail('Чат не найден');
  if (!isMember(chat, uid) && !(allowPublic && chat.isPublic)) fail('Нет доступа к чату');
  return chat;
}

function cleanFile(f) {
  if (!f || typeof f !== 'object') return null;
  const url = String(f.url || '');
  if (!/^\/uploads\/[A-Za-z0-9_\-]+(\.[a-z0-9]{1,10})?$/.test(url)) fail('Некорректный файл');
  return {
    url, name: String(f.name || 'file').slice(0, 200), size: Number(f.size) || 0, mime: String(f.mime || '').slice(0, 100),
    duration: Number(f.duration) || undefined, width: Number(f.width) || undefined, height: Number(f.height) || undefined,
    waveform: Array.isArray(f.waveform) ? f.waveform.slice(0, 64).map((x) => Math.max(0, Math.min(1, Number(x) || 0))) : undefined,
  };
}

function createPrivate(a, b) {
  const key = [a, b].sort().join(':');
  let chat = Object.values(D.chats).find((c) => c.type === 'private' && c.peerKey === key);
  if (chat) return chat;
  chat = {
    id: rid(9), type: 'private', peerKey: key, members: a === b ? [a] : [a, b], admins: [], createdAt: now(),
    seq: 0, state: {}, pinned: [],
  };
  D.chats[chat.id] = chat;
  return chat;
}

function removeFromChat(chat, uid) {
  chat.members = chat.members.filter((m) => m !== uid);
  chat.admins = (chat.admins || []).filter((m) => m !== uid);
  delete chat.state[uid];
  if (chat.ownerId === uid) {
    chat.ownerId = chat.admins[0] || chat.members[0] || null;
    if (chat.ownerId && !chat.admins.includes(chat.ownerId)) chat.admins.push(chat.ownerId);
  }
  emitToUser(uid, { type: 'chatRemove', chatId: chat.id });
  if (chat.members.length === 0) {
    for (const m of chatMsgs(chat.id)) msgIndex.delete(m.id);
    delete D.chats[chat.id];
    delete D.messages[chat.id];
  }
}

// ---------- действия WebSocket ----------
const actions = {
  init(uid) {
    const me = D.users[uid];
    const chats = Object.values(D.chats).filter((c) => isMember(c, uid));
    const ids = new Set([uid]);
    for (const c of chats) if (c.type !== 'channel' || isAdmin(c, uid)) c.members.forEach((m) => ids.add(m));
    for (const c of chats) {
      for (const m of chatMsgs(c.id).slice(-60)) if (m.senderId) ids.add(m.senderId);
    }
    return {
      me: selfView(me),
      chats: chats.map((c) => chatView(c, uid)),
      users: [...ids].map((id) => userView(D.users[id])).filter(Boolean),
    };
  },

  getUsers(uid, { ids }) {
    return (Array.isArray(ids) ? ids.slice(0, 500) : []).map((id) => userView(D.users[id])).filter(Boolean);
  },

  searchUsers(uid, { q }) {
    const s = String(q || '').trim().toLowerCase().replace(/^@/, '');
    if (!s) return { users: [], chats: [] };
    const users = Object.values(D.users)
      .filter((u) => u.username.includes(s) || u.name.toLowerCase().includes(s))
      .slice(0, 20).map(userView);
    const chats = Object.values(D.chats)
      .filter((c) => c.isPublic && (c.title || '').toLowerCase().includes(s))
      .slice(0, 20).map((c) => (isMember(c, uid) ? chatView(c, uid) : chatPreview(c)));
    return { users, chats };
  },

  getMessages(uid, { chatId, before, fromSeq, limit = 50 }) {
    const chat = getChat(chatId, uid, true);
    const cleared = (chat.state[uid] || {}).clearedSeq || 0;
    let msgs = chatMsgs(chatId).filter((m) => !m.deleted && m.seq > cleared);
    if (fromSeq != null) {
      msgs = msgs.filter((m) => m.seq >= Number(fromSeq));
      const first = msgs[0];
      const older = first ? chatMsgs(chatId).some((m) => !m.deleted && m.seq > cleared && m.seq < first.seq) : false;
      return { messages: msgs.slice(0, 3000).map(msgView), hasMore: older };
    }
    if (before) msgs = msgs.filter((m) => m.seq < Number(before));
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return { messages: msgs.slice(-lim).map(msgView), hasMore: msgs.length > lim };
  },

  openPrivate(uid, { userId }) {
    if (!D.users[userId]) fail('Пользователь не найден');
    const chat = createPrivate(uid, userId);
    stateOf(chat, uid).hidden = false;
    if (userId !== uid) stateOf(chat, userId);
    db.save();
    return { chat: chatView(chat, uid), users: chat.members.map((m) => userView(D.users[m])) };
  },

  createChat(uid, { type, title, description, memberIds, avatar, isPublic }) {
    if (type !== 'group' && type !== 'channel') fail('Неизвестный тип чата');
    const t = String(title || '').trim().slice(0, 64);
    if (!t) fail('Введите название');
    const members = [uid, ...new Set((Array.isArray(memberIds) ? memberIds : []).filter((m) => D.users[m] && m !== uid))];
    const chat = {
      id: rid(9), type, title: t, description: String(description || '').slice(0, 255), color: pick(COLORS),
      avatar: avatar ? cleanFile({ url: avatar }).url : null, members, admins: [uid], ownerId: uid,
      isPublic: !!isPublic, inviteCode: rid(8), createdAt: now(), seq: 0, state: {}, pinned: [],
    };
    D.chats[chat.id] = chat;
    members.forEach((m) => stateOf(chat, m));
    systemMessage(chat, type === 'channel' ? `Канал «${t}» создан` : `${nameOf(uid)} создал(а) группу «${t}»`);
    emitChat(chat, chat.members, true);
    return { chat: chatView(chat, uid) };
  },

  updateChat(uid, { chatId, title, description, avatar, isPublic }) {
    const chat = getChat(chatId, uid);
    if (chat.type === 'private' || chat.type === 'saved') fail('Нельзя изменить этот чат');
    if (!isAdmin(chat, uid)) fail('Только администраторы могут менять настройки');
    if (title !== undefined) {
      const t = String(title).trim().slice(0, 64);
      if (!t) fail('Введите название');
      if (t !== chat.title) { chat.title = t; systemMessage(chat, `${nameOf(uid)} изменил(а) название на «${t}»`); }
    }
    if (description !== undefined) chat.description = String(description).slice(0, 255);
    if (avatar !== undefined) chat.avatar = avatar ? cleanFile({ url: avatar }).url : null;
    if (isPublic !== undefined) chat.isPublic = !!isPublic;
    db.save();
    emitChat(chat);
    return { chat: chatView(chat, uid) };
  },

  addMembers(uid, { chatId, userIds }) {
    const chat = getChat(chatId, uid);
    if (chat.type !== 'group' && chat.type !== 'channel') fail('Нельзя добавить участников');
    if (!isAdmin(chat, uid)) fail('Только администраторы могут добавлять участников');
    const added = (Array.isArray(userIds) ? userIds : []).filter((m) => D.users[m] && !chat.members.includes(m));
    if (!added.length) return { chat: chatView(chat, uid) };
    added.forEach((m) => { chat.members.push(m); stateOf(chat, m); });
    systemMessage(chat, `${nameOf(uid)} добавил(а) ${added.map(nameOf).join(', ')}`);
    emitChat(chat, chat.members, true);
    return { chat: chatView(chat, uid) };
  },

  removeMember(uid, { chatId, userId }) {
    const chat = getChat(chatId, uid);
    if (!isAdmin(chat, uid)) fail('Недостаточно прав');
    if (userId === chat.ownerId) fail('Нельзя удалить владельца');
    if (!chat.members.includes(userId)) fail('Пользователь не в чате');
    removeFromChat(chat, userId);
    systemMessage(chat, `${nameOf(uid)} удалил(а) ${nameOf(userId)}`);
    emitChat(chat);
    db.save();
    return true;
  },

  setAdmin(uid, { chatId, userId, admin }) {
    const chat = getChat(chatId, uid);
    if (chat.ownerId !== uid) fail('Только владелец может назначать администраторов');
    if (!chat.members.includes(userId)) fail('Пользователь не в чате');
    chat.admins = (chat.admins || []).filter((m) => m !== userId);
    if (admin) chat.admins.push(userId);
    db.save();
    emitChat(chat);
    return true;
  },

  joinChat(uid, { chatId, inviteCode }) {
    let chat;
    if (inviteCode) chat = Object.values(D.chats).find((c) => c.inviteCode && c.inviteCode === inviteCode);
    else { chat = D.chats[chatId]; if (chat && !chat.isPublic) chat = null; }
    if (!chat) fail('Ссылка недействительна или чат не найден');
    if (!chat.members.includes(uid)) {
      chat.members.push(uid);
      stateOf(chat, uid);
      if (chat.type === 'group') systemMessage(chat, `${nameOf(uid)} присоединился(-ась) к группе`);
      emitChat(chat, chat.type === 'channel' ? [uid] : chat.members, true);
      db.save();
    }
    return { chat: chatView(chat, uid), users: chat.members.map((m) => userView(D.users[m])).filter(Boolean) };
  },

  leaveChat(uid, { chatId }) {
    const chat = getChat(chatId, uid);
    if (chat.type === 'private' || chat.type === 'saved') fail('Из этого чата нельзя выйти');
    removeFromChat(chat, uid);
    if (D.chats[chat.id]) {
      if (chat.type === 'group') systemMessage(chat, `${nameOf(uid)} покинул(а) группу`);
      emitChat(chat);
    }
    db.save();
    return true;
  },

  deleteChat(uid, { chatId }) {
    const chat = getChat(chatId, uid);
    if (chat.type === 'private' || chat.type === 'saved') {
      const st = stateOf(chat, uid);
      st.clearedSeq = chat.seq || 0;
      st.lastRead = chat.seq || 0;
      st.hidden = chat.type === 'private';
      db.save();
      emitToUser(uid, chat.type === 'private' ? { type: 'chatRemove', chatId } : { type: 'chat', chat: chatView(chat, uid) });
      return true;
    }
    if (chat.ownerId === uid) {
      for (const m of chat.members) emitToUser(m, { type: 'chatRemove', chatId });
      for (const m of chatMsgs(chatId)) msgIndex.delete(m.id);
      delete D.chats[chatId];
      delete D.messages[chatId];
      db.save();
      return true;
    }
    return actions.leaveChat(uid, { chatId });
  },

  clearHistory(uid, { chatId }) {
    const chat = getChat(chatId, uid);
    const st = stateOf(chat, uid);
    st.clearedSeq = chat.seq || 0;
    st.lastRead = chat.seq || 0;
    db.save();
    emitToUser(uid, { type: 'chat', chat: chatView(chat, uid), cleared: true });
    return true;
  },

  chatSettings(uid, { chatId, muted, pinned, archived }) {
    const chat = getChat(chatId, uid);
    const st = stateOf(chat, uid);
    if (muted !== undefined) st.muted = !!muted;
    if (pinned !== undefined) st.pinned = !!pinned;
    if (archived !== undefined) { st.archived = !!archived; if (st.archived) st.pinned = false; }
    db.save();
    emitToUser(uid, { type: 'chat', chat: chatView(chat, uid) });
    return true;
  },

  sendMessage(uid, d) {
    const chat = getChat(d.chatId, uid);
    if (chat.type === 'channel' && !isAdmin(chat, uid)) fail('Публиковать в канале могут только администраторы');
    let type = d.type || 'text';
    const fields = {};

    if (d.forward) {
      const src = getChat(d.forward.chatId, uid, true);
      const orig = findMsg(src, d.forward.msgId);
      if (orig.type === 'system' || orig.type === 'call') fail('Это сообщение нельзя переслать');
      type = orig.type;
      fields.text = orig.text;
      if (orig.file) fields.file = orig.file;
      if (orig.location) fields.location = orig.location;
      if (orig.poll) fields.poll = { ...orig.poll, options: orig.poll.options.map((o) => ({ text: o.text, voters: [] })) };
      const of = orig.forwardFrom;
      fields.forwardFrom = of || (src.type === 'channel'
        ? { name: src.title, chatId: src.id }
        : { name: nameOf(orig.senderId), userId: orig.senderId });
    } else {
      if (!MSG_TYPES.has(type)) fail('Неизвестный тип сообщения');
      const text = String(d.text || '').slice(0, MAX_TEXT);
      fields.text = type === 'text' ? text.trim() : text;
      if (['image', 'video', 'file', 'voice'].includes(type)) {
        fields.file = cleanFile(d.file);
        if (!fields.file) fail('Файл не прикреплён');
      } else if (type === 'text' && !fields.text) {
        fail('Пустое сообщение');
      } else if (type === 'sticker') {
        fields.text = String(d.text || '').slice(0, 16);
        if (!fields.text) fail('Пустой стикер');
      } else if (type === 'poll') {
        const p = d.poll || {};
        const question = String(p.question || '').trim().slice(0, 255);
        const options = (Array.isArray(p.options) ? p.options : []).map((o) => String(o).trim().slice(0, 100)).filter(Boolean).slice(0, 10);
        if (!question || options.length < 2) fail('Нужен вопрос и минимум 2 варианта');
        fields.poll = { question, options: options.map((t) => ({ text: t, voters: [] })), multiple: !!p.multiple, anonymous: p.anonymous !== false };
      } else if (type === 'location') {
        const lat = Number(d.location && d.location.lat), lon = Number(d.location && d.location.lon);
        if (!isFinite(lat) || !isFinite(lon)) fail('Некорректная геопозиция');
        fields.location = { lat, lon };
      } else if (type === 'call') {
        const c = d.call || {};
        fields.call = { video: !!c.video, duration: Number(c.duration) || 0, status: ['ok', 'missed', 'declined', 'busy'].includes(c.status) ? c.status : 'ok' };
      }
    }
    if (d.replyTo) {
      const r = msgIndex.get(d.replyTo);
      if (r && !r.deleted && r.chatId === chat.id) fields.replyTo = r.id;
    }
    fields.type = type;
    const m = pushMessage(chat, uid, fields, typeof d.clientId === 'string' ? d.clientId.slice(0, 40) : undefined);
    return { message: msgView(m) };
  },

  editMessage(uid, { chatId, msgId, text }) {
    const chat = getChat(chatId, uid);
    const m = findMsg(chat, msgId);
    if (m.senderId !== uid) fail('Можно редактировать только свои сообщения');
    if (!['text', 'image', 'video', 'file'].includes(m.type) || m.forwardFrom) fail('Это сообщение нельзя изменить');
    const t = String(text || '').slice(0, MAX_TEXT).trim();
    if (!t && m.type === 'text') fail('Пустое сообщение');
    m.text = t;
    m.editedAt = now();
    db.save();
    emitMsgUpdate(chat, m);
    return { message: msgView(m) };
  },

  deleteMessage(uid, { chatId, msgIds, msgId }) {
    const chat = getChat(chatId, uid);
    const ids = Array.isArray(msgIds) ? msgIds : [msgId];
    for (const id of ids) {
      const m = msgIndex.get(id);
      if (!m || m.deleted || m.chatId !== chat.id) continue;
      const canDelete = m.senderId === uid || (chat.type !== 'private' && isAdmin(chat, uid)) || chat.type === 'saved';
      if (!canDelete) fail('Нет прав на удаление');
      m.deleted = true;
      m.text = ''; delete m.file; delete m.poll; delete m.location; m.reactions = {};
      chat.pinned = (chat.pinned || []).filter((p) => p !== m.id);
    }
    db.save();
    for (const mid of chat.members) {
      emitToUser(mid, { type: 'messageDelete', chatId: chat.id, ids, chat: chatView(chat, mid) });
    }
    return true;
  },

  react(uid, { chatId, msgId, emoji }) {
    const chat = getChat(chatId, uid);
    const m = findMsg(chat, msgId);
    const e = String(emoji || '').slice(0, 16);
    if (!e) fail('Нет реакции');
    const had = (m.reactions[e] || []).includes(uid);
    for (const k of Object.keys(m.reactions)) {
      m.reactions[k] = m.reactions[k].filter((x) => x !== uid);
      if (!m.reactions[k].length) delete m.reactions[k];
    }
    if (!had) (m.reactions[e] = m.reactions[e] || []).push(uid);
    db.save();
    emitMsgUpdate(chat, m);
    return true;
  },

  pinMessage(uid, { chatId, msgId, pin }) {
    const chat = getChat(chatId, uid);
    if ((chat.type === 'group' || chat.type === 'channel') && !isAdmin(chat, uid)) fail('Закреплять могут только администраторы');
    findMsg(chat, msgId);
    chat.pinned = (chat.pinned || []).filter((p) => p !== msgId);
    if (pin) chat.pinned.push(msgId);
    db.save();
    emitChat(chat);
    return true;
  },

  votePoll(uid, { chatId, msgId, options }) {
    const chat = getChat(chatId, uid);
    const m = findMsg(chat, msgId);
    if (!m.poll) fail('Это не опрос');
    let opts = (Array.isArray(options) ? options : []).map(Number).filter((i) => i >= 0 && i < m.poll.options.length);
    if (!m.poll.multiple) opts = opts.slice(0, 1);
    m.poll.options.forEach((o, i) => {
      o.voters = o.voters.filter((v) => v !== uid);
      if (opts.includes(i)) o.voters.push(uid);
    });
    db.save();
    emitMsgUpdate(chat, m);
    return true;
  },

  read(uid, { chatId, seq }) {
    const chat = getChat(chatId, uid);
    const st = stateOf(chat, uid);
    const s = Math.min(Number(seq) || 0, chat.seq || 0);
    if (s <= (st.lastRead || 0)) return true;
    st.lastRead = s;
    db.save();
    emitToUser(uid, { type: 'chat', chat: chatView(chat, uid) });
    if (chat.type !== 'channel') {
      for (const m of chat.members) if (m !== uid) emitToUser(m, { type: 'read', chatId, userId: uid, seq: s });
    }
    return true;
  },

  typing(uid, { chatId, kind }) {
    const chat = D.chats[chatId];
    if (!chat || !isMember(chat, uid) || chat.type === 'channel') return true;
    const k = ['text', 'voice', 'file', 'stop'].includes(kind) ? kind : 'text';
    for (const m of chat.members) if (m !== uid) emitToUser(m, { type: 'typing', chatId, userId: uid, kind: k });
    return true;
  },

  searchMessages(uid, { q, chatId }) {
    const s = String(q || '').trim().toLowerCase();
    if (s.length < 2) return { results: [] };
    const chats = chatId ? [getChat(chatId, uid, true)] : Object.values(D.chats).filter((c) => isMember(c, uid));
    const results = [];
    for (const c of chats) {
      const cleared = (c.state[uid] || {}).clearedSeq || 0;
      for (const m of chatMsgs(c.id)) {
        if (m.deleted || m.seq <= cleared || m.type === 'system') continue;
        const hay = ((m.text || '') + ' ' + (m.file ? m.file.name : '') + ' ' + (m.poll ? m.poll.question : '')).toLowerCase();
        if (hay.includes(s)) results.push(m);
      }
    }
    results.sort((a, b) => b.createdAt - a.createdAt);
    return { results: results.slice(0, 80).map(msgView) };
  },

  getChatMedia(uid, { chatId }) {
    const chat = getChat(chatId, uid, true);
    const cleared = (chat.state[uid] || {}).clearedSeq || 0;
    const msgs = chatMsgs(chat.id).filter((m) => !m.deleted && m.seq > cleared);
    const media = [], files = [], voice = [], links = [];
    for (const m of msgs) {
      if (m.type === 'image' || m.type === 'video') media.push(msgView(m));
      else if (m.type === 'file') files.push(msgView(m));
      else if (m.type === 'voice') voice.push(msgView(m));
      if (/https?:\/\//i.test(m.text || '')) links.push(msgView(m));
    }
    const r = (a) => a.reverse().slice(0, 200);
    return { media: r(media), files: r(files), voice: r(voice), links: r(links) };
  },

  updateProfile(uid, { name, bio, avatar, username, color }) {
    const u = D.users[uid];
    if (name !== undefined) {
      const n = String(name).trim().slice(0, 64);
      if (!n) fail('Имя не может быть пустым');
      u.name = n;
    }
    if (bio !== undefined) u.bio = String(bio).slice(0, 140);
    if (avatar !== undefined) u.avatar = avatar ? cleanFile({ url: avatar }).url : null;
    if (color !== undefined && COLORS.includes(color)) u.color = color;
    if (username !== undefined) {
      const un = String(username).trim().toLowerCase().replace(/^@/, '');
      if (!/^[a-z0-9_]{3,32}$/.test(un)) fail('Имя пользователя: 3–32 символа (латиница, цифры, _)');
      if (un !== u.username && Object.values(D.users).some((x) => x.username === un)) fail('Это имя пользователя уже занято');
      u.username = un;
    }
    db.save();
    emitToAllOnline({ type: 'user', user: userView(u) });
    return { me: selfView(u) };
  },

  changePassword(uid, { oldPassword, newPassword }) {
    const u = D.users[uid];
    if (!checkPassword(oldPassword || '', u)) fail('Неверный текущий пароль');
    if (String(newPassword || '').length < 6) fail('Новый пароль должен быть не короче 6 символов');
    Object.assign(u, hashPassword(newPassword));
    db.save();
    return true;
  },

  // Сигналинг для звонков WebRTC: сервер только пересылает данные собеседнику.
  callSignal(uid, { to, payload }) {
    if (!D.users[to] || to === uid) fail('Пользователь не найден');
    if (!payload || typeof payload !== 'object') fail('Пустой сигнал');
    if (payload.kind === 'offer' && !sockets.has(to)) return { delivered: false };
    emitToUser(to, { type: 'call', from: uid, fromUser: userView(D.users[uid]), payload });
    return { delivered: true };
  },
};

// ---------- HTTP ----------
const app = express();
app.disable('x-powered-by');

function auth(req, res, next) {
  const token = String(req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const uid = D.sessions[token];
  if (!uid || !D.users[uid]) return res.status(401).json({ error: 'Требуется вход' });
  req.uid = uid;
  req.token = token;
  next();
}

app.post('/api/register', express.json(), (req, res) => {
  const { username, name, password } = req.body || {};
  const un = String(username || '').trim().toLowerCase().replace(/^@/, '');
  if (!/^[a-z0-9_]{3,32}$/.test(un)) return res.status(400).json({ error: 'Имя пользователя: 3–32 символа (латиница, цифры, _)' });
  if (String(password || '').length < 6) return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  if (Object.values(D.users).some((u) => u.username === un)) return res.status(400).json({ error: 'Это имя пользователя уже занято' });
  const user = {
    id: rid(9), username: un, name: String(name || '').trim().slice(0, 64) || un, bio: '',
    avatar: null, color: pick(COLORS), createdAt: now(), lastSeen: now(), ...hashPassword(password),
  };
  D.users[user.id] = user;
  const saved = { id: rid(9), type: 'saved', members: [user.id], admins: [], createdAt: now(), seq: 0, state: {}, pinned: [] };
  D.chats[saved.id] = saved;
  stateOf(saved, user.id);
  const token = newSession(user.id);
  db.save();
  res.json({ token, user: selfView(user) });
});

app.post('/api/login', express.json(), (req, res) => {
  const { username, password } = req.body || {};
  const un = String(username || '').trim().toLowerCase().replace(/^@/, '');
  const user = Object.values(D.users).find((u) => u.username === un);
  if (!user || !checkPassword(password || '', user)) return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
  const token = newSession(user.id);
  db.save();
  res.json({ token, user: selfView(user) });
});

app.post('/api/logout', auth, (req, res) => {
  delete D.sessions[req.token];
  db.save();
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => res.json({ user: selfView(D.users[req.uid]) }));

app.post('/api/upload', auth, express.raw({ type: () => true, limit: '100mb' }), (req, res) => {
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: 'Пустой файл' });
  let name = 'file';
  try { name = decodeURIComponent(req.get('X-File-Name') || 'file'); } catch { /* оставляем имя по умолчанию */ }
  name = name.replace(/[\\/\r\n]/g, '_').slice(0, 200);
  const mime = String(req.get('X-File-Type') || 'application/octet-stream').slice(0, 100);
  const ext = (path.extname(name).toLowerCase().match(/^\.[a-z0-9]{1,10}$/) || [''])[0];
  const fid = rid(12) + ext;
  fs.writeFile(path.join(db.UPLOAD_DIR, fid), buf, (err) => {
    if (err) return res.status(500).json({ error: 'Не удалось сохранить файл' });
    res.json({ url: '/uploads/' + fid, name, size: buf.length, mime });
  });
});

app.use('/uploads', express.static(db.UPLOAD_DIR, {
  maxAge: '30d',
  immutable: true,
  setHeaders(res, filePath) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox");
    if (!/\.(png|jpe?g|gif|webp|avif|bmp|mp4|webm|ogg|oga|mp3|m4a|wav|mov)$/i.test(filePath)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  },
}));
app.use(express.static(PUBLIC_DIR, { maxAge: 0 }));

// ---------- WebSocket ----------
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

function send(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const uid = D.sessions[url.searchParams.get('token') || ''];
  const user = uid && D.users[uid];
  if (!user) { ws.close(4001, 'unauthorized'); return; }
  ws.uid = uid;
  ws.isAlive = true;
  let set = sockets.get(uid);
  const wasOnline = !!set;
  if (!set) sockets.set(uid, (set = new Set()));
  set.add(ws);
  if (!wasOnline) broadcastPresence(uid);

  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const { type, reqId, data } = msg || {};
    const fn = Object.prototype.hasOwnProperty.call(actions, type) ? actions[type] : null;
    const reply = (ok, payload) => { if (reqId) send(ws, ok ? { type: 'response', reqId, ok, data: payload } : { type: 'response', reqId, ok, error: payload }); };
    if (!fn) return reply(false, 'Неизвестное действие');
    try {
      const result = await fn(uid, data && typeof data === 'object' ? data : {}, ws);
      reply(true, result === undefined ? null : result);
    } catch (e) {
      if (!(e instanceof UserError)) console.error('[ws]', type, e);
      reply(false, e instanceof UserError ? e.message : 'Ошибка сервера');
    }
  });
  ws.on('close', () => {
    const s = sockets.get(uid);
    if (!s) return;
    s.delete(ws);
    if (s.size === 0) {
      sockets.delete(uid);
      user.lastSeen = now();
      db.save();
      broadcastPresence(uid);
    }
  });
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000).unref();

server.listen(PORT, () => {
  console.log(`✨ Drim запущен: http://localhost:${PORT}`);
});
