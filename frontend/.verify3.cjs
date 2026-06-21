const { chromium } = require('C:\\Users\\rakha\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright');
const fs = require('fs');
const shotDir = 'D:/smester-4/tubes/ActiVIbe/frontend/.shots3';
fs.mkdirSync(shotDir, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('.trust', { timeout: 10000 });
  await page.evaluate(() => document.querySelector('.trust')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: shotDir + '/trust-desktop.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.querySelector('.trust')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: shotDir + '/trust-mobile.png' });

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
