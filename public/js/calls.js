'use strict';
/* ============ Drim: аудио- и видеозвонки (WebRTC) ============ */

const RTC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };
let call = null;

function signal(to, payload) { return ws.request('callSignal', { to, payload }); }

let ringTimer = null;
function ring(kind) {
  stopRing();
  const play = () => (kind === 'in' ? playTone([[740, 0.25], [880, 0.25], [740, 0.25], [880, 0.35]], 0.09) : playTone([[440, 0.9]], 0.05));
  play();
  ringTimer = setInterval(play, kind === 'in' ? 2200 : 3000);
}
function stopRing() { clearInterval(ringTimer); ringTimer = null; }

async function getMedia(video) {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false });
  } catch (e) {
    if (video) {
      toast('Камера недоступна — звонок будет без видео', true);
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
    throw e;
  }
}

function createPeer() {
  const pc = new RTCPeerConnection(RTC_CONFIG);
  pc.onicecandidate = (e) => { if (e.candidate && call) signal(call.peer, { kind: 'ice', callId: call.id, candidate: e.candidate.toJSON() }).catch(() => {}); };
  pc.ontrack = (e) => {
    if (!call) return;
    call.remoteStream = e.streams[0];
    renderCall();
  };
  pc.onconnectionstatechange = () => {
    if (!call) return;
    if (pc.connectionState === 'connected' && !call.startedAt) { call.startedAt = Date.now(); call.status = 'active'; stopRing(); renderCall(); }
    if (pc.connectionState === 'failed') endCall('failed', true);
  };
  return pc;
}
async function flushIce() {
  if (!call || !call.pc.remoteDescription) return;
  for (const c of call.iceQueue.splice(0)) { try { await call.pc.addIceCandidate(c); } catch { /* пропускаем */ } }
}

async function startCall(peerId, video) {
  if (call) return toast('Вы уже в звонке', true);
  if (!window.RTCPeerConnection || !navigator.mediaDevices) return toast('Звонки не поддерживаются этим браузером', true);
  const u = S.users.get(peerId);
  call = { id: tmpId(), peer: peerId, video, outgoing: true, status: 'calling', iceQueue: [], muted: false, camOff: false, chatId: S.active };
  renderCall();
  try {
    call.local = await getMedia(video);
    call.video = video = call.local.getVideoTracks().length > 0;
  } catch {
    toast('Нет доступа к микрофону', true);
    cleanupCall();
    return;
  }
  if (!call) { return; }
  call.pc = createPeer();
  call.local.getTracks().forEach((t) => call.pc.addTrack(t, call.local));
  const offer = await call.pc.createOffer();
  await call.pc.setLocalDescription(offer);
  try {
    const r = await signal(peerId, { kind: 'offer', callId: call.id, video, sdp: call.pc.localDescription.toJSON() });
    if (!r.delivered) {
      toast(`${u ? u.name : 'Пользователь'} сейчас не в сети`, true);
      endCall('missed', false);
      return;
    }
  } catch { endCall('failed', false); return; }
  ring('out');
  renderCall();
  call.timeout = setTimeout(() => { if (call && call.status === 'calling') { toast('Нет ответа'); endCall('missed', true); } }, 45000);
}

async function onCallSignal(ev) {
  const { from, fromUser, payload: p } = ev;
  upsertUser(fromUser);
  if (p.kind === 'offer') {
    if (call) { signal(from, { kind: 'busy', callId: p.callId }).catch(() => {}); return; }
    call = { id: p.callId, peer: from, video: !!p.video, outgoing: false, status: 'incoming', iceQueue: [], offer: p.sdp, muted: false, camOff: false };
    ring('in');
    renderCall();
    if (document.hidden && settings.notify && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('Drim', { body: `${fromUser.name}: входящий ${p.video ? 'видео' : ''}звонок`, icon: '/icons/icon-192.png', tag: 'call' }); } catch { /* нет поддержки */ }
    }
    return;
  }
  if (!call || call.id !== p.callId || call.peer !== from) return;
  if (p.kind === 'answer') {
    clearTimeout(call.timeout);
    await call.pc.setRemoteDescription(p.sdp);
    call.status = 'connecting';
    stopRing();
    renderCall();
    flushIce();
  } else if (p.kind === 'ice') {
    if (call.pc && call.pc.remoteDescription) { try { await call.pc.addIceCandidate(p.candidate); } catch { /* пропуск */ } } else call.iceQueue.push(p.candidate);
  } else if (p.kind === 'reject') {
    toast('Звонок отклонён'); endCall('declined', false, true);
  } else if (p.kind === 'busy') {
    toast('Абонент занят'); endCall('busy', false, true);
  } else if (p.kind === 'end') {
    endCall(call.startedAt ? 'ok' : 'missed', false, true);
  }
}

async function acceptCall() {
  if (!call || call.status !== 'incoming') return;
  stopRing();
  call.status = 'connecting';
  renderCall();
  try { call.local = await getMedia(call.video); } catch { toast('Нет доступа к микрофону', true); declineCall(); return; }
  call.pc = createPeer();
  call.local.getTracks().forEach((t) => call.pc.addTrack(t, call.local));
  await call.pc.setRemoteDescription(call.offer);
  const answer = await call.pc.createAnswer();
  await call.pc.setLocalDescription(answer);
  await signal(call.peer, { kind: 'answer', callId: call.id, sdp: call.pc.localDescription.toJSON() }).catch(() => {});
  flushIce();
  renderCall();
}
function declineCall() {
  if (!call) return;
  signal(call.peer, { kind: 'reject', callId: call.id }).catch(() => {});
  cleanupCall();
}
// status: ok | missed | declined | busy | failed
function endCall(status, notifyPeer = true, remote = false) {
  if (!call) return;
  const c = call;
  if (notifyPeer) signal(c.peer, { kind: 'end', callId: c.id }).catch(() => {});
  const duration = c.startedAt ? (Date.now() - c.startedAt) / 1000 : 0;
  // запись о звонке пишет звонящий
  if (c.outgoing) {
    const st = c.startedAt ? 'ok' : status === 'declined' ? 'declined' : status === 'busy' ? 'busy' : 'missed';
    const chat = [...S.chats.values()].find((x) => x.type === 'private' && x.members.includes(c.peer));
    if (chat) ws.request('sendMessage', { chatId: chat.id, type: 'call', call: { video: c.video, duration, status: st } }).catch(() => {});
  }
  if (remote && c.startedAt) toast('Звонок завершён · ' + fmtDur(duration));
  cleanupCall();
}
function cleanupCall() {
  stopRing();
  if (!call) return;
  clearTimeout(call.timeout);
  clearInterval(call.tick);
  call.local?.getTracks().forEach((t) => t.stop());
  try { call.pc?.close(); } catch { /* уже закрыт */ }
  call = null;
  $('.call')?.closeLayer?.();
}

function renderCall() {
  if (!call) return;
  let el = $('.call');
  if (!el) {
    el = h('div.call');
    openLayer(el);
    el.closeLayer = () => el.remove();
    call.tick = setInterval(() => { if (call && call.status === 'active') { const s = el.querySelector('.cs'); if (s) s.textContent = fmtDur((Date.now() - call.startedAt) / 1000); } }, 1000);
  }
  const u = S.users.get(call.peer) || { name: 'Пользователь' };
  const statusText = {
    calling: 'Вызов…', incoming: call.video ? 'Входящий видеозвонок' : 'Входящий звонок', connecting: 'Соединение…',
    active: call.startedAt ? fmtDur((Date.now() - call.startedAt) / 1000) : '',
  }[call.status] || '';
  const hasRemoteVideo = call.remoteStream && call.remoteStream.getVideoTracks().some((t) => t.readyState === 'live');
  el.classList.toggle('has-video', !!(hasRemoteVideo && call.video));
  const btn = (ic, label, fn, cls = '', extra = '') => h('button.call-btn', { class: cls, onclick: fn }, h('span', null, icon(ic, extra)), label);

  const nodes = [];
  if (call.remoteStream) {
    const v = h('video.remote', { autoplay: true, playsinline: true });
    v.srcObject = call.remoteStream;
    if (!call.video || !hasRemoteVideo) v.style.display = 'none';
    nodes.push(v);
  }
  if (call.local && call.video && !call.camOff) {
    const lv = h('video.local', { autoplay: true, playsinline: true, muted: true });
    lv.srcObject = call.local;
    nodes.push(lv);
  }
  nodes.push(h('div.call-info', null,
    (() => { const a = userAvatar(call.peer, 130, false); if (call.status === 'calling' || call.status === 'incoming') a.classList.add('ring'); return a; })(),
    h('div.cn', null, u.name), h('div.cs', null, statusText)));
  if (call.status === 'incoming') {
    nodes.push(h('div.call-controls', null,
      btn('phone', 'Отклонить', declineCall, 'red', 'rot135'),
      btn(call.video ? 'video' : 'phone', 'Ответить', acceptCall, 'green')));
  } else {
    nodes.push(h('div.call-controls', null,
      btn(call.muted ? 'micOff' : 'mic', call.muted ? 'Вкл. микрофон' : 'Микрофон', toggleMute, call.muted ? 'off' : ''),
      call.video ? btn(call.camOff ? 'videoOff' : 'video', 'Камера', toggleCam, call.camOff ? 'off' : '') : null,
      btn('phone', 'Завершить', () => endCall(call.startedAt ? 'ok' : 'missed', true), 'red', 'rot135')));
  }
  fill(el, ...nodes);
}
function toggleMute() {
  if (!call || !call.local) return;
  call.muted = !call.muted;
  call.local.getAudioTracks().forEach((t) => { t.enabled = !call.muted; });
  renderCall();
}
function toggleCam() {
  if (!call || !call.local) return;
  call.camOff = !call.camOff;
  call.local.getVideoTracks().forEach((t) => { t.enabled = !call.camOff; });
  renderCall();
}
window.addEventListener('beforeunload', () => { if (call) signal(call.peer, { kind: 'end', callId: call.id }).catch(() => {}); });
