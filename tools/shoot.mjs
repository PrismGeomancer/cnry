// Usage: node tools/shoot.mjs <outdir> <route> [width] [height] [waitMs] [scrollY] [introSkip]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const [out, route = '/', w = 1440, h = 900, waitMs = 1500, scrollY = 0, noIntro = '1'] = process.argv.slice(2);
const cands = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].filter(Boolean);
const exe = cands.find(existsSync);
const b = await chromium.launch({ executablePath: exe, headless: true });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const p = await ctx.newPage(); const errs = [];
p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
if (noIntro === '1') await p.addInitScript(() => { try { sessionStorage.setItem('cn:intro-seen', '1'); } catch (e) { } });
await p.goto('http://localhost:8765/index.html#' + route, { waitUntil: 'networkidle' });
await p.waitForTimeout(+waitMs);
if (+scrollY) { await p.evaluate(y => window.scrollTo(0, y), +scrollY); await p.waitForTimeout(900); }
await p.screenshot({ path: out });
console.log('errors:', errs.length ? '\n' + errs.join('\n') : 'none');
await b.close();
