// Exports the Chrome Web Store art from the site's hidden #/shot/<name> pages.
// Usage (from the project folder):
//   cd tools && npm i            (once)
//   python3 -m http.server 8765 &   (serve the project folder)
//   node tools/export-store.mjs [chrome-path]
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const chromePath = process.argv[2] || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
const base = process.env.BASE || 'http://localhost:8765/index.html';
const out = fileURLToPath(new URL('../assets/store/', import.meta.url));
mkdirSync(out, { recursive: true });
const jobs = [
  ['browser', 1280, 800, 'screenshot-1-see-it-at-the-door.png'],
  ['layers', 1280, 800, 'screenshot-2-three-tests-one-answer.png'],
  ['sign', 1280, 800, 'screenshot-3-plain-words.png'],
  ['dyor', 1280, 800, 'screenshot-4-no-reviews-checklist.png'],
  ['trip', 1280, 800, 'screenshot-5-decoy-phrase-tripwire.png'],
  ['promo', 440, 280, 'small-promo-tile-440x280.png'],
  ['marquee', 1400, 560, 'marquee-tile-1400x560.png']
];
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
for (const [name, w, h, file] of jobs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem('cn:intro-seen', '1'); } catch (e) { } });
  await page.goto(`${base}#/shot/${name}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: out + file, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('wrote', file, `${w}x${h}`);
  await ctx.close();
}
await browser.close();
