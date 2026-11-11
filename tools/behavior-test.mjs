import { chromium } from 'playwright-core'; import { existsSync } from 'node:fs';
const exe = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
const URL = 'http://localhost:8765/index.html';
const b = await chromium.launch({ executablePath: exe, headless: true });
let fail = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) fail++; };
const mk = async (opts = {}) => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts }); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/404|Failed to load resource/.test(m.text()) && p.errs.push(m.text())); return p; };
/* a) intro plays once per session */
let p = await mk(); await p.goto(URL + '#/'); await p.waitForTimeout(300);
ok(await p.evaluate(() => document.documentElement.classList.contains('intro-on')), 'intro starts on first visit');
await p.waitForTimeout(5800);
ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'intro ends after ~5s');
ok(await p.evaluate(() => sessionStorage.getItem('cn:intro-seen') === '1'), 'intro marks session');
await p.reload(); await p.waitForTimeout(400);
ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'no intro on second load in session');
/* replay */
await p.evaluate(() => document.querySelector('#replayIntro').click()); await p.waitForTimeout(400);
ok(await p.evaluate(() => document.documentElement.classList.contains('intro-on')), 'replay intro starts');
await p.waitForTimeout(5800);
ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'replay intro ends');
ok(p.errs.length === 0, 'no console errors (intro): ' + p.errs.join('|')); await p.context().close();
/* b) skip via Esc, Enter, Space, click, button */
for (const how of ['Escape', 'Enter', 'Space', 'click', 'button']) {
  p = await mk(); await p.goto(URL + '#/'); await p.waitForTimeout(900);
  if (how === 'click') await p.mouse.click(300, 300); else if (how === 'button') await p.click('#iSkip'); else await p.keyboard.press(how === 'Space' ? ' ' : how);
  await p.waitForTimeout(700);
  ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'skip with ' + how); await p.context().close();
}
/* c) reduced motion */
p = await mk({ reducedMotion: 'reduce' }); await p.goto(URL + '#/'); await p.waitForTimeout(1500);
ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'reduced motion: no intro');
ok(await p.evaluate(() => getComputedStyle(document.querySelector('#cursorBird')).display === 'none'), 'reduced motion: cursor bird hidden');
ok(await p.evaluate(() => document.querySelector('#story').classList.contains('static')), 'reduced motion: story is static');
ok(await p.evaluate(() => document.querySelector('#heroH').textContent.trim() === 'Send the canary first.'), 'reduced motion: headline text final');
ok(p.errs.length === 0, 'no console errors (reduced motion): ' + p.errs.join('|')); await p.context().close();
/* d) no GSAP (CDN blocked) */
p = await mk(); await p.route(/cdnjs\.cloudflare\.com/, r => r.abort()); await p.goto(URL + '#/'); await p.waitForTimeout(1500);
ok(await p.evaluate(() => !document.documentElement.classList.contains('intro-on')), 'no GSAP: no intro lock');
ok(await p.evaluate(() => document.querySelector('#heroH').textContent.trim() === 'Send the canary first.'), 'no GSAP: headline rendered');
ok(await p.evaluate(() => document.querySelectorAll('#scenCards .popup').length === 4), 'no GSAP: scenario cards rendered');
for (const r of ['/demo', '/check', '/stopper', '/report', '/calls', '/how', '/install']) { await p.evaluate(r => { location.hash = '#' + r; }, r); await p.waitForTimeout(500); }
ok(p.errs.length === 0, 'no GSAP: no console errors across routes: ' + p.errs.join('|')); await p.context().close();
/* e) router + Esc + interactions */
p = await mk(); await p.addInitScript(() => sessionStorage.setItem('cn:intro-seen', '1')); await p.goto(URL + '#/'); await p.waitForTimeout(1500);
for (const r of ['/demo', '/check', '/stopper', '/report', '/calls', '/how', '/install']) { await p.click(r === '/install' ? '#footer a[href="#/install"]' : `.nav a[data-route="${r}"]`); await p.waitForTimeout(900); ok(await p.evaluate(r => document.querySelector(`.page.on`).dataset.page === r, r), 'route ' + r); }
await p.keyboard.press('Escape'); await p.waitForTimeout(900);
ok(await p.evaluate(() => document.querySelector('.page.on').dataset.page === '/'), 'Esc returns home');
/* cursor bird reacts */
await p.evaluate(() => document.querySelector('#fake').scrollIntoView()); await p.waitForTimeout(600);
const box = await p.locator('.fake-card').first().boundingBox(); await p.mouse.move(box.x + 60, box.y + 80, { steps: 8 }); await p.mouse.move(box.x + 90, box.y + 100, { steps: 5 }); await p.waitForTimeout(500);
ok(await p.evaluate(() => document.querySelector('.fake-card').classList.contains('stamped')), 'cursor bird stamps a fake card');
/* hero cage: click sings, hold covers */
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
const cb = await p.locator('#heroCage').boundingBox();
await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await p.mouse.down(); await p.waitForTimeout(700);
ok(await p.evaluate(() => window.__heroCage.covered), 'press and hold covers the cage');
await p.mouse.up(); await p.waitForTimeout(800);
ok(await p.evaluate(() => !window.__heroCage.covered), 'release uncovers');
/* practice site */
await p.evaluate(() => document.querySelector('#practice').scrollIntoView()); await p.waitForTimeout(500);
await p.click('#practiceStage [data-connect]'); await p.waitForTimeout(3200);
ok(await p.evaluate(() => document.querySelector('#practiceStage .popup').dataset.v === 'silent'), 'practice site ends Silent');
await p.click('#practiceStage [data-act=block]'); await p.waitForTimeout(300);
ok((await p.textContent('#practiceStage .pres')).includes('Good call. The canary never left the cage.'), 'practice: Block copy');
/* link checker + counters */
await p.goto(URL + '#/check'); await p.waitForTimeout(700);
await p.fill('#chkIn', 'https://phantom.app'); await p.click('#checkForm button[type=submit]'); await p.waitForTimeout(8500);
ok((await p.textContent('#chkCard .sentence')).startsWith('Singing.'), 'checker: phantom.app Singing');
await p.fill('#chkIn', 'not a link!!'); await p.click('#checkForm button[type=submit]'); await p.waitForTimeout(300);
ok((await p.textContent('#chkErr')).includes("doesn't look like a website address"), 'checker: invalid link error');
await p.goto(URL + '#/calls'); await p.waitForTimeout(1500);
ok(await p.evaluate(() => document.querySelector('[data-tiles] .v[data-k=checked]').dataset.v === '1'), 'counter: sites tested = 1 (real use)');
ok(await p.evaluate(() => document.querySelector('[data-tiles] .v[data-k=calls]').dataset.v === '0'), 'counter: warning calls = 0 (honest)');
/* stopper */
await p.goto(URL + '#/stopper'); await p.waitForTimeout(700);
await p.fill('#stopStage textarea', 'my wallet is empty and sad please help me'); await p.waitForTimeout(300);
ok(await p.evaluate(() => !document.querySelector('#stopStage .cloth-drop').classList.contains('on')), 'stopper ignores ordinary text');
await p.click('#stopStage [data-fill]'); await p.waitForTimeout(900);
ok(await p.evaluate(() => document.querySelector('#stopStage .cloth-drop').classList.contains('on') && document.querySelector('#stopStage textarea').value === ''), 'stopper: test words stop + field cleared');
/* decoy phrase scrambler + tripwire */
await p.click('#stopStage [data-decoy]'); await p.waitForTimeout(3200);
ok(await p.evaluate(() => document.querySelectorAll('#stopStage .dchip.lock').length === 12 && !document.querySelector('#stopStage [data-give]').disabled), 'decoy: 12 words scrambled and locked');
ok(await p.evaluate(() => { const w = [...document.querySelectorAll('#stopStage .dchip')].map(c => c.textContent); return w.length === 12 && w.join(' ') !== 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'; }), 'decoy: is not the typed phrase');
await p.screenshot({ path: process.env.SHOTS + '/decoy-1.png' });
await p.click('#stopStage [data-give]'); await p.waitForTimeout(700);
await p.click('#stopStage [data-trip]'); await p.waitForTimeout(1600);
ok(await p.evaluate(() => document.querySelector('#notif').classList.contains('on') && document.querySelector('#notif').textContent.includes('decoy phrase was just used')), 'tripwire: notification appears when the site uses the decoy');
await p.screenshot({ path: process.env.SHOTS + '/decoy-2.png' });
await p.click('#notif [data-nf-x]'); await p.waitForTimeout(300);
ok(await p.evaluate(() => !document.querySelector('#notif').classList.contains('on')), 'tripwire: dismiss works');
/* report + wallet modal */
await p.goto(URL + '#/report'); await p.waitForTimeout(700);
await p.fill('#rpHost', 'tide-pool.finance'); await p.click('[data-signbtn]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => document.querySelector('#walletModal').classList.contains('on')), 'report: sign opens wallet modal');
ok(await p.evaluate(() => document.querySelectorAll('#wList .wopt').length === 5), 'wallet modal lists 5 wallets');
await p.keyboard.press('Escape'); await p.click('#rpForm button[type=submit]'); await p.waitForTimeout(700);
ok((await p.textContent('#reportHost')).includes('Your report is in the queue'), 'report: success copy');
ok(p.errs.length === 0, 'no console errors (interactions): ' + p.errs.join('|')); await p.context().close();
/* f) install state flip */
p = await mk(); await p.addInitScript(() => sessionStorage.setItem('cn:intro-seen', '1')); await p.goto(URL + '#/install'); await p.waitForTimeout(1000);
ok((await p.textContent('#installHero')).includes('Waiting for approval from Google. Come back later.'), 'install: pending pill copy');
ok(await p.evaluate(() => !document.querySelector('#installHero a[href*="chrome"]') && !!document.querySelector('#installHero a.link')), 'install: no dead Add to Chrome link; X link present');
await p.evaluate(() => { window.CANARY_CONFIG.extensionStatus = 'live'; window.CANARY_CONFIG.installUrl = 'https://example.org/store'; });
await p.context().close();
console.log(fail ? fail + ' FAILED' : 'all behavior checks passed'); await b.close(); process.exit(fail ? 1 : 0);
