import { chromium } from 'playwright-core'; import { existsSync } from 'node:fs';
const [out, w = 1440, h = 900, ...fr] = process.argv.slice(2);
const exe = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
const b = await chromium.launch({ executablePath: exe, headless: true });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.addInitScript(() => sessionStorage.setItem('cn:intro-seen', '1'));
await p.goto('http://localhost:8765/index.html#/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
const [s, e] = await p.evaluate(() => { const st = ScrollTrigger.getAll().find(t => t.pin); return [st.start, st.end]; });
console.log('story', s, e);
for (const f of fr) { await p.evaluate(y => window.scrollTo(0, y), s + (e - s) * +f); await p.waitForTimeout(1300); await p.screenshot({ path: `${out}/story-${f}.png` }); }
console.log('errors', errs);
await b.close();
