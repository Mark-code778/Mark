// Генерирует PNG-иконки из public/icons/icon.svg (нужен Playwright).
// Запуск: node scripts/gen-icons.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const dir = path.join(__dirname, '..', 'public', 'icons');
  const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const sizes = { 'icon-512.png': 512, 'icon-192.png': 192, 'apple-touch-icon.png': 180, 'favicon-32.png': 32 };
  for (const [name, size] of Object.entries(sizes)) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.screenshot({ path: path.join(dir, name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  }
  // maskable: иконка с запасом по краям на сплошном фоне
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<html><body style="margin:0;background:linear-gradient(180deg,#1E1B4B,#312E81 60%,#4C1D95)"><div style="padding:56px">${svg.replace('<svg ', '<svg width="400" height="400" ')}</div></body></html>`);
  await page.screenshot({ path: path.join(dir, 'icon-maskable-512.png'), clip: { x: 0, y: 0, width: 512, height: 512 } });
  await browser.close();
  console.log('Иконки сгенерированы в', dir);
})();
