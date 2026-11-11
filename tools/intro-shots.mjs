import { chromium } from 'playwright-core'; import { existsSync } from 'node:fs';
const [out, w = 1440, h = 900, tag = 'd'] = process.argv.slice(2);
const exe = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
const b = await chromium.launch({ executablePath: exe, headless: true });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => m.type() === 'error' && !/404/.test(m.text()) && errs.push(m.text()));
await p.goto('http://localhost:8765/index.html#/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.evaluate(() => { window.__introTl.pause(); });
for (const t of [0.6, 1, 1.6, 2, 2.5, 3, 3.5, 4, 4.6, 5]) { await p.evaluate(t => { window.__introTl.seek(t, false); }, t); await p.waitForTimeout(250); await p.screenshot({ path: `${out}/intro-${tag}-${t}.png` }); }
console.log('dur', await p.evaluate(() => window.__introTl.duration()), 'errors', errs); await b.close();
