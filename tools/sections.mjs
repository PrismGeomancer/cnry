// Usage: node tools/sections.mjs <outdir> <route> <width> <height> id1,id2,...   (scrolls to each element and screenshots)
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const [out, route = '/', w = 1440, h = 900, ids = ''] = process.argv.slice(2);
const exe = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].filter(Boolean).find(existsSync);
const b = await chromium.launch({ executablePath: exe, headless: true });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: +w < 700, isMobile: +w < 700 });
const p = await ctx.newPage(); const errs = [];
p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
await p.addInitScript(() => { try { sessionStorage.setItem('cn:intro-seen', '1'); } catch (e) { } });
await p.goto('http://localhost:8765/index.html#' + route, { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);
for (const id of ids.split(',').filter(Boolean)) {
  await p.evaluate(id => { const el = document.querySelector(id.startsWith('y') ? 'body' : '#' + id); if (id.startsWith('y')) window.scrollTo(0, +id.slice(1)); else window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, id);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}/${id}.png` });
}
console.log('errors:', errs.length ? '\n' + errs.join('\n') : 'none');
await b.close();
