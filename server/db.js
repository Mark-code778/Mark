'use strict';
// Простое файловое хранилище: всё состояние держится в памяти и
// периодически сбрасывается в data/db.json (атомарная запись через .tmp).
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DRIM_DATA || path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const data = { users: {}, chats: {}, messages: {}, sessions: {} };
try {
  Object.assign(data, JSON.parse(fs.readFileSync(FILE, 'utf8')));
} catch (e) {
  if (e.code !== 'ENOENT') console.error('[db] не удалось прочитать базу:', e.message);
}

let timer = null;
function save() {
  if (timer) return;
  timer = setTimeout(flush, 400);
}
function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, FILE);
}
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    try { flush(); } catch (e) { console.error(e); }
    process.exit(0);
  });
}

module.exports = { data, save, flush, DATA_DIR, UPLOAD_DIR };
