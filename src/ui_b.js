    /* ==========================================================
       POPUP (the extension), SCENARIOS, SEE IT WORK, TRY IT SITE, SHOWCASE
       ========================================================== */
    const TEST_NAMES = ['Ask around', 'Spot the fake', 'Send the canary'];
    const ROW_ICON = { wait: i => i + 1, run: () => '&hellip;', ok: () => I.check, warn: () => I.alert, bad: () => I.cross, info: () => I.dash };
    function slam(el, shaker) {
      if (!el) return;
      if (!motionOK()) { el.style.opacity = 1; return; }
      gsap.fromTo(el, { scale: 2.6, rotation: -16, opacity: 0 }, { scale: 1, rotation: -5, opacity: 1, duration: .34, ease: 'back.out(2.2)', onComplete: () => { const r = el.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 'dust', 8); } });
      sound.thud();
      if (shaker) gsap.fromTo(shaker, { x: -5, y: 3 }, { x: 0, y: 0, duration: .4, ease: 'elastic.out(1,.3)', delay: .2 });
    }

    function createPopup(host, spec, opts = {}) {
      const el = document.createElement('div'); el.className = 'popup'; el.dataset.v = 'listening';
      const rowHTML = (i, s, t) => `<div class="prow" data-s="${s}" data-i="${i}"><span class="pi">${ROW_ICON[s](i)}</span><div><b>${i + 1} ${TEST_NAMES[i]}</b><span class="t">${t || ''}</span></div></div>`;
      el.innerHTML = `<div class="ph"><span class="phi">${iconSVG('singing')}</span><div><b class="pht">THE CANARY IS LISTENING</b><small class="phs">${spec.addr}</small></div></div>
<div class="rows">${[0, 1, 2].map(i => rowHTML(i, 'wait', '')).join('')}</div>
<div class="pv"></div>
${opts.buttons ? '<div class="pb"><button class="btn small primary" type="button" data-act="block">Block it</button><button class="btn small" type="button" data-act="go">Go anyway</button></div>' : ''}
<div class="pres" aria-live="polite"></div>
<div class="pfoot">Canary warns. You decide.</div>`;
      host.innerHTML = ''; host.appendChild(el);
      const rows = $$('.prow', el), pv = $('.pv', el), pres = $('.pres', el);
      const btns = $$('.pb .btn', el); btns.forEach(b => b.disabled = true);
      let token = 0, step = -1;
      const api = {
        el, get step() { return step; },
        setRow(i, s, t) { const r = rows[i]; r.dataset.s = s; $('.pi', r).innerHTML = ROW_ICON[s](i); if (t != null) $('.t', r).innerHTML = t; if (s !== 'wait' && s !== 'run' && motionOK()) gsap.fromTo($('.pi', r), { scale: .4 }, { scale: 1, duration: .35, ease: 'back.out(3)' }); },
        reset() {
          token++; step = -1; el.dataset.v = 'listening'; $('.pht', el).textContent = 'THE CANARY IS LISTENING'; $('.phi', el).innerHTML = iconSVG('singing');
          rows.forEach((r, i) => { r.dataset.s = 'wait'; $('.pi', r).innerHTML = ROW_ICON.wait(i); $('.t', r).innerHTML = ''; });
          pv.innerHTML = ''; pres.textContent = ''; btns.forEach(b => b.disabled = true);
          opts.onReset && opts.onReset();
        },
        verdict(animate = true) {
          const v = spec.verdict; el.dataset.v = v; $('.pht', el).textContent = VERDICT[v].head; $('.phi', el).innerHTML = iconSVG(v);
          pv.innerHTML = stampHTML(v, 'xl'); const st = $('.stamp', pv);
          if (animate) slam(st, el); else st.style.opacity = 1;
          if (v === 'silent') sound.quiet(); else if (v === 'singing') sound.song(); else sound.flutter();
          btns.forEach(b => b.disabled = false);
          opts.onVerdict && opts.onVerdict(v);
        },
        /* jump to a step: 0 opened, 1..3 a test finished, 4 verdict */
        async goto(k, animate = true) {
          const my = ++token;
          if (k < 0) { api.reset(); return; }
          for (let s = Math.max(1, (animate ? step + 1 : 1)); s <= k; s++) {
            if (my !== token) return;
            if (s <= 3) {
              if (animate) { api.setRow(s - 1, 'run'); await wait(motionOK() ? 650 : 120); if (my !== token) return; }
              const r = spec.rows[s - 1]; api.setRow(s - 1, r.s, r.t);
              if (s === 3) opts.onTest3 && opts.onTest3();
            } else api.verdict(animate);
            step = s; opts.onStep && opts.onStep(s);
            if (animate && s < k) await wait(motionOK() ? 250 : 40);
          }
          step = k; opts.onStep && opts.onStep(k);
        },
        async run(hold = 0) { api.reset(); const my = token; await wait(450); if (my !== token) return; await api.goto(4, true); if (hold) await wait(hold); },
        stop() { token++; }
      };
      btns.forEach(b => b.addEventListener('click', () => {
        btns.forEach(x => x.disabled = true); const go = b.dataset.act === 'go';
        const txt = go ? (opts.goText || "In real life, this is where you'd sign.") : 'Good call. The canary never left the cage.';
        pres.textContent = txt; if (motionOK()) gsap.fromTo(pres, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .3 });
        if (go) sound.flutter(); else sound.chirp();
        opts.onChoice && opts.onChoice(go ? 'go' : 'block', txt);
      }));
      return api;
    }

    /* ---------- scenarios ---------- */
    const TIDE = [{ name: 'Tidepool', domains: ['tidepool.finance'] }];
    const SC = [
      {
        id: 'airdrop', tab: 'Fake airdrop', brand: 'LUNARIS DROP', h: 'Claim your free 500 token airdrop.', p: 'Connect your wallet to claim.', btn: 'Connect Wallet',
        host: 'claim-lunaris-drop.top', addr: '<b>claim-</b>lunaris-<b>drop</b>.top', scripted: { reported: true, ageDays: 3 },
        canary: { kind: 'drain', tx: 'approveAll', s: 'bad', t: 'This lets the site move all your USDC. Canary went quiet.', plain: 'This lets the site move all your USDC. Canary went quiet.' },
        what: "Canary showed the site a decoy wallet, not yours. The site tried to get permission to move every USDC in it, and Canary said so in plain words. The canary went quiet, and your real wallet never connected.",
        share: 'I sent the canary to a fake airdrop before connecting: Silent.', short: 'Hidden request to move all your tokens.'
      },
      {
        id: 'lookalike', tab: 'Look-alike swap', brand: 'TIDEPOOL SWAP', h: 'Swap any token in one click.', p: 'Connect your wallet to start swapping.', btn: 'Connect Wallet',
        host: 'tide-pool.finance', addr: 'tide<span class="circled">-</span>pool.finance', real: 'tidepool.finance', scripted: { ageDays: 6 }, extraKnown: TIDE,
        canary: { kind: 'transfer', tx: 'sendSol', s: 'bad', t: 'Asks to send 12 SOL out of the decoy wallet.', plain: 'It asks to send 12 SOL out of the decoy wallet. A swap does not need that.' },
        row2: 'Looks like tidepool.finance. A hyphen was added.',
        what: 'The address is one hyphen away from the real Tidepool, tidepool.finance. Canary compared the two letter by letter and circled the difference. Fake copies like this rely on you not looking closely.',
        share: 'I sent the canary to a look-alike swap site before connecting: Silent.', short: 'One hyphen away from the real site.'
      },
      {
        id: 'unreviewed', tab: "Nobody's reviewed it", brand: 'MOSSBACK MINT', h: 'Mint a Mossback. 999 supply.', p: 'Connect your wallet to mint.', btn: 'Connect Wallet',
        host: 'mossback-mint.xyz', addr: 'mossback-<b>mint</b>.xyz', scripted: { ageDays: 11 },
        canary: { kind: 'balances', tx: null, s: 'warn', t: 'Asks to see your token balances.', plain: 'It asks to see the token balances in the decoy wallet. That is common, so keep looking.' },
        what: "Nobody has reviewed this site yet and its domain is only days old. That isn't proof of a scam, so Canary didn't go quiet. It ruffled its feathers and opened a short checklist so you can do your own research.",
        share: "I sent the canary to a brand-new mint site before connecting: Ruffled.", short: 'Young site. No reviews yet.'
      },
      {
        id: 'checksout', tab: 'A site that checks out', brand: 'TIDEPOOL', h: 'Swap tokens at fair prices.', p: 'Connect your wallet to start swapping.', btn: 'Connect Wallet',
        host: 'tidepool.finance', addr: 'tidepool.finance', scripted: { vouched: true, ageDays: 1200 }, extraKnown: TIDE,
        canary: { kind: 'clean', tx: null, s: 'ok', t: 'Only asks to connect. Nothing to sign yet.', plain: 'It only asked to connect. There is nothing to sign yet.' },
        what: "Nothing found. The address is spelled right, the site is not new, and people have vouched for it. Canary still says stay alert, because Singing never means safe.",
        share: 'I sent the canary to a site that checks out: Singing. It does not cry wolf.', short: 'Nothing found. Stay alert.'
      }
    ];
    const SC_CACHE = {};
    async function evalScenario(sc) {
      if (SC_CACHE[sc.id]) return SC_CACHE[sc.id];
      const res = await analyze(sc.host, null, { scripted: sc.scripted, extraKnown: sc.extraKnown });
      const soft = res.soft.filter(f => f.short !== 'nobody has reviewed it');
      let t2;
      if (sc.row2) t2 = sc.row2;
      else if (res.hard.length) t2 = cap(res.hard[0].short) + '.';
      else if (soft.length) t2 = soft.slice(0, 2).map(f => cap(f.short)).join('. ') + '.';
      else t2 = 'Spelled right.' + (res.age && res.age.days >= TH.minDomainAgeDays ? ' Not brand new.' : '');
      const tx = sc.canary.tx ? decodeTx(demoTx(sc.canary.tx)) : null;
      const out = {
        res, tx, verdict: res.verdict,
        rows: [{ s: res.l1.status, t: res.l1.headline + '.' }, { s: res.l2.status, t: t2 }, { s: sc.canary.s, t: sc.canary.t }]
      };
      return (SC_CACHE[sc.id] = out);
    }

    /* ---------- fake site markup ---------- */
    function siteHTML(sc, o = {}) {
      return `<div class="browser" data-site>
<div class="chrome"><div class="dots"><i></i><i></i><i></i></div><div class="addr" title="${esc(sc.host)}">${sc.addr}</div><span class="tbicon" aria-hidden="true">${tbIcon('singing')}</span></div>
<div class="site"><div style="height:12px"></div>
<div class="brandline"><span class="moon"></span>${esc(sc.brand)}</div>
<h4>${esc(sc.h)}</h4><p>${esc(sc.p)}</p>
<button class="sbtn" type="button" data-connect>${esc(sc.btn)}</button>
${o.fine ? `<p class="fine">${o.fine}</p>` : ''}
<div class="addrcmp" hidden style="margin-top:10px;font-family:var(--f-mono);font-size:.78rem"></div>
<div class="scrim"></div><div class="stampslot"></div></div></div>`;
    }
    function setToolbar(browser, v) { const t = $('.tbicon', browser); if (t) t.innerHTML = tbIcon(v); }
    const DYOR_STEPS = ["Go to the project's official X account and see which website it links to. Does it match this address exactly?", 'Check how old the site and the X account are. Brand-new is a red flag.', 'Search "[site name] scam" and read what comes up.', 'Look for a real team, real docs and a real community, not just a mint button.', 'If you still want to try it, use a fresh wallet with a small amount.'];
    const dyorHTML = () => `<div class="dyor"><h4>Nobody's looked at this one. Do your own research.</h4><ol>${DYOR_STEPS.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
    function walletCardHTML() {
      return `<div class="wcard"><span class="cage-tag">${logoSVG()}</span><h5>Canary wallet (decoy)</h5><div class="bal">0.42 SOL</div><div class="tok"><span>USDC</span><span>120.00</span></div><div class="tok"><span>MOSS</span><span>5,000</span></div></div>`;
    }
    function decoyPanel(sc, ev) {
      const d = document.createElement('div'); d.className = 'decoy';
      const raw = sc.canary.tx ? toB64(demoTx(sc.canary.tx)).slice(0, 44) + '…' : sc.canary.kind === 'balances' ? 'getTokenAccountsByOwner(decoy)' : 'wallet_connect()';
      const line = ev.tx ? ev.tx.lines[0].html : null;
      d.innerHTML = `${walletCardHTML()}<div class="req"><b>What the site tried</b><div class="raw">${esc(raw)}</div>${line ? `<div class="readas">Canary read it as: ${line}</div>` : ''}<div class="plain" ${sc.canary.s === 'ok' ? 'style="background:var(--ok-bg);border-color:var(--ink)"' : sc.canary.s === 'warn' ? 'style="background:#FFE2B8;border-color:var(--orange)"' : ''}>${esc(sc.canary.plain)}</div></div>`;
      return d;
    }

    /* ---------- SEE IT WORK PAGE ---------- */
    const STEP_NAMES = ['Connect', 'Ask around', 'Spot the fake', 'Send the canary', 'Verdict'];
    let demoState = null;
    function initDemo() {
      const tabs = $('#demoTabs');
      tabs.innerHTML = SC.map(s => `<button role="tab" type="button" data-id="${s.id}" aria-selected="false">${esc(s.tab)}</button>`).join('') + '<button role="tab" type="button" data-id="recovery" aria-selected="false">Recovery phrase</button>';
      $$('button', tabs).forEach(b => b.addEventListener('click', () => demoShow(b.dataset.id)));
      $('#demoSteps').innerHTML = STEP_NAMES.map((n, i) => `<li data-i="${i}"><i>${i + 1}</i>${n}</li>`).join('');
      $('#demoNext').addEventListener('click', () => demoAdvance());
      $('#demoReplay').addEventListener('click', () => demoShow(demoState && demoState.id));
    }
    async function demoShow(id) {
      id = id || 'airdrop'; if (demoState && demoState.popup) demoState.popup.stop();
      $$('#demoTabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === id)));
      const site = $('#demoSite'), right = $('#demoRight'), what = $('#demoWhat');
      what.hidden = true; what.innerHTML = '';
      const isRec = id === 'recovery';
      $('.demo-top').hidden = isRec;
      if (isRec) {
        demoState = { id }; site.innerHTML = '<div id="demoStopper"></div>';
        mountStopper($('#demoStopper'), { label: 'Demo' });
        right.innerHTML = `<div class="card b" style="max-width:340px"><h3 style="margin-bottom:8px">What just happens</h3><p style="margin:0">Type or paste a 12 or 24 word recovery phrase into the fake restore page. Canary stops the page from reading it, clears the field and tells you why. Use the public test words.</p></div>`;
        return;
      }
      const sc = SC.find(s => s.id === id); const ev = await evalScenario(sc);
      if (demoState && demoState.id !== id && demoState.pending) { /* superseded */ }
      demoState = { id, sc, ev, step: -1 };
      site.innerHTML = siteHTML(sc) + '<div id="demoExtra"></div>';
      const browser = $('[data-site]', site);
      const pHost = document.createElement('div'); right.innerHTML = ''; right.appendChild(pHost);
      const cap2 = document.createElement('p'); cap2.className = 'note-small'; cap2.style.maxWidth = '320px'; cap2.textContent = 'The Canary popup, as the extension will show it.'; right.appendChild(cap2);
      const popup = createPopup(pHost, { addr: sc.addr, rows: ev.rows, verdict: ev.verdict }, {
        buttons: true,
        onVerdict: v => { setToolbar(browser, v); $('.site', browser).classList.toggle('dim', v === 'silent'); const slot = $('.stampslot', browser); slot.innerHTML = stampHTML(v, 'xl'); slam($('.stamp', slot)); if (v === 'ruffled') showDyor(); },
        onChoice: (k, txt) => showWhat(k),
        onReset: () => { setToolbar(browser, 'singing'); $('.site', browser).classList.remove('dim'); $('.stampslot', browser).innerHTML = ''; browser.classList.remove('flag'); const x = $('#demoExtra'); if (x) x.innerHTML = ''; what.hidden = true; }
      });
      popup.el.style.opacity = '.55';
      demoState.popup = popup; demoState.browser = browser;
      $('[data-connect]', browser).addEventListener('click', () => demoAdvance());
      paintSteps(-1); $('#demoNext').disabled = false; $('#demoNext').textContent = 'Next';
      if (motionOK()) gsap.from([site.firstChild, pHost], { y: 24, opacity: 0, rotation: .6, duration: .5, stagger: .08, ease: 'power2.out' });
    }
    function paintSteps(k) { $$('#demoSteps li').forEach((li, i) => { li.classList.toggle('done', i < k); li.classList.toggle('on', i === k); }); }
    async function demoAdvance() {
      const d = demoState; if (!d || !d.sc || d.busy) return; if (d.step >= 4) return;
      d.busy = true; const next = d.step + 1; d.step = next; paintSteps(next);
      const sc = d.sc, browser = d.browser;
      if (next === 0) { d.popup.el.style.opacity = 1; sound.chirp(); $('[data-connect]', browser).disabled = true; }
      if (next === 2) { browser.classList.add('flag'); if (sc.real) { const c = $('.addrcmp', browser); c.hidden = false; c.innerHTML = `Real: <b>${esc(sc.real)}</b><br>This site: <b>${esc(sc.host)}</b>`; } }
      if (next === 3) { const x = $('#demoExtra'); const panel = decoyPanel(sc, d.ev); x.innerHTML = ''; x.appendChild(panel); panel.style.marginTop = '16px'; if (motionOK()) gsap.from(panel, { y: 24, opacity: 0, duration: .5, ease: 'power2.out' }); }
      if (next >= 1 && next <= 4) await d.popup.goto(next, true); else d.popup.goto(0, true);
      d.busy = false;
      if (next >= 4) $('#demoNext').disabled = true;
    }
    function showDyor() { const x = $('#demoExtra'); if (!x) return; const w = document.createElement('div'); w.style.marginTop = '16px'; w.innerHTML = dyorHTML(); x.appendChild(w); if (motionOK()) gsap.from(w, { y: 20, opacity: 0, duration: .5 }); }
    function showWhat(k) {
      const d = demoState, w = $('#demoWhat'); const sc = d.sc;
      const tail = k === 'block' ? 'You blocked it.' : "You went ahead. In real life, this is where you'd sign.";
      const text = `I tried Canary. ${sc.share} Send the canary first.`;
      w.hidden = false;
      w.innerHTML = `<h3>What just happened</h3><p>${esc(sc.what)}</p><p style="font-weight:700">${tail}</p><div class="actions"><a class="btn small" target="_blank" rel="noopener noreferrer" href="https://x.com/intent/post?text=${encodeURIComponent(text)}">Share on X</a><button class="btn small" type="button" data-copy>Copy text</button></div>`;
      $('[data-copy]', w).addEventListener('click', () => copyText(text));
      if (motionOK()) gsap.from(w, { y: 24, opacity: 0, duration: .5 });
      setTimeout(() => w.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' }), 200);
    }
    function copyText(t) {
      const done = () => toast('Link copied.');
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, () => legacyCopy(t, done)); else legacyCopy(t, done);
    }
    function legacyCopy(t, done) { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed. Select the text and copy it yourself.'); } a.remove(); }

    /* ---------- HOME: scenario cards with looping popups ---------- */
    async function buildScenarioCards() {
      const host = $('#scenCards'); host.innerHTML = '';
      for (const sc of SC) {
        const ev = await evalScenario(sc);
        const c = document.createElement('article'); c.className = 'card scen' + (sc.id === 'checksout' ? ' b' : ''); c.style.setProperty('--rot', ['-.7deg', '.5deg', '-.4deg', '.6deg'][SC.indexOf(sc)] );
        if (sc.id === 'checksout') c.dataset.trust = '';
        c.innerHTML = `<h3>${esc(sc.tab)}</h3><p class="sp muted" style="font-size:1.02rem">${esc(sc.short)}</p><div class="mini"></div><button class="btn small dark" type="button" data-id="${sc.id}">Try it</button>`;
        host.appendChild(c);
        const pop = createPopup($('.mini', c), { addr: sc.addr, rows: ev.rows, verdict: ev.verdict }, {});
        c._pop = pop; c._vis = false;
        $('.btn', c).addEventListener('click', () => { store.sset('demoTab', sc.id); navigate('/demo'); });
      }
      const cards = $$('.scen', host);
      const io = new IntersectionObserver(es => es.forEach(e => { e.target._vis = e.isIntersecting; if (e.isIntersecting && !e.target._run) loopCard(e.target); }), { threshold: .35 });
      cards.forEach(c => io.observe(c));
      async function loopCard(c) {
        c._run = true;
        while (c._vis && c.isConnected) {
          if (document.hidden || !motionOK()) { if (!motionOK() && !c._done) { c._pop.goto(4, false); c._done = true; } await wait(1200); if (!motionOK()) break; continue; }
          await c._pop.run(); await wait(3400);
        }
        c._run = false;
      }
      if (!motionOK()) cards.forEach(c => c._pop.goto(4, false));
    }

    /* ---------- TRY IT SITE ---------- */
    async function initPractice() {
      const host = $('#practiceStage'); const sc = SC[0]; const ev = await evalScenario(sc);
      host.innerHTML = siteHTML(sc) + '<div class="popwrap"></div>';
      const browser = $('[data-site]', host), pw = $('.popwrap', host); 
      const reset = document.createElement('button'); reset.className = 'btn small'; reset.type = 'button'; reset.textContent = 'Try again'; reset.hidden = true; reset.style.marginTop = '14px'; host.appendChild(reset);
      let pop;
      const mk = () => {
        pop = createPopup(pw, { addr: sc.addr, rows: ev.rows, verdict: ev.verdict }, {
          buttons: true, goText: "In real life, this is where you'd sign. The canary would stay silent until you left.",
          onVerdict: v => { setToolbar(browser, v); $('.site', browser).classList.add('dim'); },
          onChoice: () => { reset.hidden = false; },
          onReset: () => { setToolbar(browser, 'singing'); $('.site', browser).classList.remove('dim'); }
        });
        pw.style.visibility = 'hidden';
      };
      mk();
      const btn = $('[data-connect]', browser);
      btn.addEventListener('click', async () => {
        btn.disabled = true; pw.style.visibility = 'visible'; if (motionOK()) gsap.from(pw, { y: -16, opacity: 0, duration: .35, ease: 'back.out(2)' });
        pop.reset(); sound.chirp(); await wait(350); pop.goto(4, true);
      });
      reset.addEventListener('click', () => { reset.hidden = true; btn.disabled = false; pw.style.visibility = 'hidden'; pop.reset(); });
    }

    /* ---------- SHOWCASE SCENES (also the store art) ---------- */
    const SCENE_CAPTION = {
      singing: 'Singing: nothing found. Stay alert.', ruffled: "Ruffled: something's off. Look closer.", silent: 'Silent: stop. This looks like a scam.',
      tests: 'Three tests, one answer.', decoy: 'What the site tried to take, in plain words.', settings: 'You stay in control.',
      icons: 'The canary lives in your toolbar. Singing means nothing found. Ruffled means look closer. Silent means stop.',
      dyor: "No reviews? Here's your checklist.", stopper: 'Your recovery phrase never goes on a website.', tripwire: 'Hand a scam site a decoy. Hear about it the moment it tries to use it.'
    };
    const VSC = { singing: SC[3], ruffled: SC[2], silent: SC[0] };
    function sceneShell(cls, artCls, caption) {
      const f = document.createElement('figure'); f.className = 'scene ' + cls; f.style.margin = 0;
      f.innerHTML = `<div class="art ${artCls || ''}"></div><figcaption>${caption || ''}</figcaption>`; return f;
    }
    function tiltOn(art) {
      if (!FINE || RM) return;
      art.addEventListener('pointermove', e => { const r = art.getBoundingClientRect(); art.style.setProperty('--px', (((e.clientX - r.left) / r.width) - .5).toFixed(3)); art.style.setProperty('--py', (((e.clientY - r.top) / r.height) - .5).toFixed(3)); });
      art.addEventListener('pointerleave', () => { art.style.setProperty('--px', 0); art.style.setProperty('--py', 0); });
    }
    function visLoop(el, fn, gap = 2800) {
      let on = false, vis = false;
      new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !on) go(); }, { threshold: .3 }).observe(el);
      async function go() { on = true; while (vis && el.isConnected) { if (document.hidden || RM || !hasGsap) { await wait(1200); if (RM || !hasGsap) break; continue; } await fn(); await wait(gap); } on = false; }
    }
    async function buildScene(name) {
      if (name === 'browser') {
        const f = sceneShell('wide', 'y', SCENE_CAPTION.singing); const art = $('.art', f); art.style.minHeight = '420px';
        art.innerHTML = '<div class="scene-browser"></div>'; const wrap = $('.scene-browser', art);
        const seg = document.createElement('div'); seg.className = 'seg'; seg.setAttribute('role', 'tablist'); seg.setAttribute('aria-label', 'Verdict');
        seg.innerHTML = ['singing', 'ruffled', 'silent'].map((v, i) => `<button type="button" role="tab" data-v="${v}" aria-selected="${i === 0}">${VERDICT[v].label}</button>`).join('');
        f.insertBefore(seg, f.firstChild);
        const show = async v => {
          const sc = VSC[v], ev = await evalScenario(sc);
          wrap.innerHTML = siteHTML(sc); const b = $('[data-site]', wrap); const ph = document.createElement('div'); wrap.appendChild(ph);
          const pop = createPopup(ph, { addr: sc.addr, rows: ev.rows, verdict: ev.verdict }, { buttons: true, onVerdict: x => { setToolbar(b, x); } });
          wrap.style.position = 'relative'; ph.className = 'popslot'; pop.goto(4, false);
          $('figcaption', f).textContent = SCENE_CAPTION[v];
          const st = $('.stamp', pop.el); if (motionOK() && st) slam(st, pop.el);
          $$('button', seg).forEach(x => x.setAttribute('aria-selected', String(x.dataset.v === v)));
          f._v = v;
        };
        $$('button', seg).forEach(b => b.addEventListener('click', () => show(b.dataset.v)));
        f._show = show; await show('singing'); tiltOn(art); return f;
      }
      if (name === 'icons') {
        const f = sceneShell('', 'p', SCENE_CAPTION.icons); const art = $('.art', f);
        art.innerHTML = `<div class="tbstates">${['singing', 'ruffled', 'silent'].map(v => `<div class="tbstate" data-v="${v}"><div class="tbbox">${tbIcon(v)}</div>${VERDICT[v].label}</div>`).join('')}</div>`;
        const boxes = $$('.tbbox', art);
        visLoop(art, async () => { for (const b of boxes) { gsap.to(b, { scale: 1.22, y: -8, rotation: -4, duration: .28, ease: 'back.out(3)' }); b.style.background = 'var(--yellow)'; await wait(1100); gsap.to(b, { scale: 1, y: 0, rotation: 0, duration: .3 }); b.style.background = ''; } }, 600);
        tiltOn(art); return f;
      }
      if (name === 'tests') {
        const f = sceneShell('', 'b', SCENE_CAPTION.tests); const art = $('.art', f); const sc = SC[0], ev = await evalScenario(sc);
        const ph = document.createElement('div'); art.appendChild(ph);
        const pop = createPopup(ph, { addr: sc.addr, rows: ev.rows, verdict: ev.verdict }, { buttons: true });
        if (hasGsap && !RM) visLoop(art, () => pop.run(2600), 800); else pop.goto(4, false);
        tiltOn(art); return f;
      }
      if (name === 'decoy') {
        const f = sceneShell('wide', 'bl', SCENE_CAPTION.decoy); const art = $('.art', f); const sc = SC[0], ev = await evalScenario(sc);
        art.appendChild(decoyPanel(sc, ev)); $('.decoy', art).style.maxWidth = '760px';
        const raw = $('.raw', art), plain = $('.plain', art);
        if (hasGsap && !RM) visLoop(art, async () => { gsap.set(plain, { opacity: 0, y: 8 }); gsap.set(raw, { opacity: 1 }); await wait(1100); gsap.to(raw, { opacity: .35, duration: .3 }); gsap.to(plain, { opacity: 1, y: 0, duration: .4, ease: 'back.out(2)' }); await wait(2200); }, 300);
        tiltOn(art); return f;
      }
      if (name === 'dyor') {
        const f = sceneShell('', 'y', SCENE_CAPTION.dyor); $('.art', f).innerHTML = dyorHTML(); tiltOn($('.art', f)); return f;
      }
      if (name === 'stopper') {
        const f = sceneShell('', 'bl', SCENE_CAPTION.stopper); const art = $('.art', f);
        art.innerHTML = `<div class="stopcard"><div class="fakeform"><div class="logo-o" style="display:flex;gap:8px;align-items:center;font-family:var(--f-head);font-weight:900"><span class="ring" style="width:24px;height:24px;border-radius:50%;border:3px solid var(--ink);box-shadow:0 0 0 3px var(--yellow) inset"></span>ORBITAL VAULT</div><h4 style="font-size:1.5rem;margin:8px 0 6px">Restore your wallet</h4><p class="note-small">Enter your 12-word recovery phrase.</p><div class="field mono sp-field" style="min-height:96px;font-size:.82rem;line-height:1.5"></div></div><div class="stopwall" style="opacity:0"><b>Stopped.</b><span>That looked like a recovery phrase. No real website needs it.</span></div></div>`;
        const fld = $('.sp-field', art), wall = $('.stopwall', art);
        const words = 'orchard lamp velvet anchor mirror jungle ticket spoon glide river canyon lemon'.split(' ');
        fld.textContent = words.slice(0, 3).join(' ') + ' …';
        if (hasGsap && !RM) visLoop(art, async () => { gsap.set(wall, { opacity: 0, y: -40 }); fld.textContent = ''; for (let i = 0; i < 12; i++) { fld.textContent += (i ? ' ' : '') + words[i]; await wait(110); } await wait(250); sound.thud(); gsap.to(wall, { opacity: 1, y: 0, duration: .45, ease: 'bounce.out' }); await wait(2400); gsap.to(wall, { opacity: 0, duration: .3 }); }, 400);
        tiltOn(art); return f;
      }
      if (name === 'tripwire') {
        const f = sceneShell('', 'bl', SCENE_CAPTION.tripwire); const art = $('.art', f);
        art.innerHTML = `<div class="notif-static notif on" style="position:relative;right:auto;top:auto;display:grid">${tripwireHTML('orbital-vault.example', false)}</div>`;
        const n = $('.notif-static', art); const ico = $('.nf-ico', art);
        if (hasGsap && !RM) visLoop(art, async () => { gsap.fromTo(n, { y: -24, opacity: 0, rotation: 3 }, { y: 0, opacity: 1, rotation: 0, duration: .5, ease: 'back.out(2)' }); gsap.fromTo(ico, { rotation: -18 }, { rotation: 0, duration: .9, ease: 'elastic.out(1,.2)', delay: .2 }); sound.alarm(); await wait(3600); }, 400);
        tiltOn(art); return f;
      }
      if (name === 'settings') {
        const f = sceneShell('', 'p', SCENE_CAPTION.settings); const art = $('.art', f);
        art.innerHTML = `<div class="set-card"><div class="set-row"><span>Sound</span><button class="tog" type="button" role="switch" aria-checked="false" aria-label="Sound"></button></div><div class="set-row"><span>Hand out decoy phrases</span><button class="tog" type="button" role="switch" aria-checked="true" aria-label="Hand out decoy phrases"></button></div><div class="set-row"><span>Tell me if a decoy is used</span><button class="tog" type="button" role="switch" aria-checked="true" aria-label="Tell me if a decoy is used"></button></div><div><div class="set-row" style="margin-bottom:8px"><span>Trusted sites</span></div><div class="chips trusted"><span class="chip">tidepool.finance <button type="button" data-rm aria-label="Remove tidepool.finance">&times;</button></span></div></div><div><div class="set-row" style="margin-bottom:6px"><span>What I can see</span></div><ul><li>The address of the site you're on</li><li>When that site asks to connect or sign</li></ul></div></div>`;
        $$('.tog', art).forEach(tog => tog.addEventListener('click', () => { tog.setAttribute('aria-checked', String(tog.getAttribute('aria-checked') !== 'true')); }));
        $('[data-rm]', art).addEventListener('click', () => { $('.trusted', art).innerHTML = '<span class="small muted">No trusted sites.</span>'; });
        tiltOn(art); return f;
      }
    }
    async function mountShowcase(host, names) {
      host.innerHTML = '';
      for (const n of names) { const s = await buildScene(n); if (s) host.appendChild(s); }
      if (hasST && motionOK()) $$('.scene', host).forEach(s => gsap.from(s, { y: 36, rotation: s.classList.contains('wide') ? 0 : .8, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));
    }
