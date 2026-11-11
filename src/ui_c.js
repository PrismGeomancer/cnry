    /* ==========================================================
       SCROLL STORY: a fake airdrop fails the three tests (pinned, scrubbed)
       ========================================================== */
    let storyCtx = null, storyAuto = null, storyBird = null;
    function buildStoryStage(host) {
      host.innerHTML = `<div class="browser st-browser">
<div class="chrome"><div class="dots"><i></i><i></i><i></i></div><div class="addr st-addr"><b class="a1">claim-</b>lunaris-<b class="a2">drop</b><b class="a3">.top</b></div><span class="tbicon st-tb" aria-hidden="true">${tbIcon('silent')}</span></div>
<div class="site st-site" style="min-height:420px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:16px">
<div style="padding-top:12px"><div class="brandline"><span class="moon"></span>LUNARIS DROP</div><h4>Claim your free 500 token airdrop.</h4><p>Connect your wallet to claim.</p><button class="sbtn" type="button" tabindex="-1" aria-hidden="true">Connect Wallet</button>
<div class="st-tags" style="display:grid;gap:8px;margin-top:16px;justify-items:start">
<span class="chip st-t1" style="background:var(--blush);border-color:var(--tomato);font-family:var(--f-body);font-weight:700">${I.cross.replace('<svg', '<svg width="14" height="14"')} Reported as a scam</span>
<span class="chip st-t2" style="background:#FFE2B8;font-family:var(--f-body);font-weight:700">${I.alert.replace('<svg', '<svg width="14" height="14"')} Registered 3 days ago. Scam-style words.</span></div>
<div class="req st-req" style="margin-top:14px;padding:12px"><b style="font-size:.85rem">Hidden request</b><div class="raw st-raw">AQABBA…setDelegate(ALL USDC)</div><div class="plain st-plain" style="font-size:.88rem">This lets the site move all your USDC.</div></div></div>
<div style="position:relative"><div class="st-cagewrap" style="position:absolute;left:50%;top:-40px;width:104px;transform:translateX(-50%)"><div class="st-rope" style="position:absolute;left:50%;bottom:100%;width:4px;height:520px;background:var(--ink);transform:translateX(-50%);margin-bottom:-26px"></div><div class="st-cage"></div></div>
<div class="st-wallet" style="position:absolute;left:0;right:0;top:150px">${walletCardHTML()}</div></div>
<div class="scrim"></div><div class="stampslot st-stamp">${stampHTML('silent', 'xl')}</div></div></div>`;
      storyBird = new CageBird($('.st-cage', host), { noHop: true, rope: false });
    }
    function setList(n) { $$('#storyList li').forEach((li, i) => { li.classList.toggle('on', i === n); li.classList.toggle('done', i < n); }); }
    function killStory() {
      if (storyAuto) { storyAuto.kill(); storyAuto = null; }
      if (storyCtx) { const a = storyCtx.animation; storyCtx.kill(true); a && a.kill(); storyCtx = null; }
      if (storyBird) { storyBird.destroy(); storyBird = null; }
    }
    function initStory() {
      killStory(); const host = $('#storyStage'); buildStoryStage(host);
      const sec = $('#story'); const canPin = hasST && motionOK() && innerHeight >= 600 && innerWidth > 0;
      sec.classList.toggle('static', !canPin); $('#storyReplay').hidden = !canPin;
      if (!canPin) { setList(3); $('.st-site', host).classList.add('dim'); return; }
      const q = s => $(s, host);
      const cloth = storyBird.cloth, ruff = storyBird.ruff, crest = storyBird.crest;
      gsap.set([q('.st-t1'), q('.st-t2')], { opacity: 0, scale: .6, transformOrigin: 'left center' });
      gsap.set(q('.st-cagewrap'), { y: -560 }); gsap.set(q('.st-wallet'), { opacity: 0, y: 20 });
      gsap.set(q('.st-req'), { opacity: 0, y: 20 }); gsap.set(q('.st-stamp'), { opacity: 0 });
      q('.st-plain').style.opacity = 0; q('.st-raw').style.opacity = 1;
      q('.st-browser').classList.remove('flag'); q('.st-site').classList.remove('dim');
      const a1 = q('.a1'), a2 = q('.a2'), a3 = q('.a3');
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onUpdate: () => { const t = tl.time(); setList(t < 1 ? -1 : t < 3.4 ? 0 : t < 6.2 ? 1 : t < 10.6 ? 2 : 3); } });
      /* test 1 */
      tl.to(q('.st-t1'), { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2.4)' }, 1.2)
        /* test 2 */
        .call(() => {}, null, 3.4)
        .to([a1, a2, a3], { boxShadow: '0 0 0 2.5px #F2842C', backgroundColor: 'rgba(242,132,44,.28)', borderRadius: 6, duration: .5, stagger: .35 }, 3.6)
        .to(q('.st-t2'), { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2.4)' }, 4.6)
        /* test 3 */
        .to(q('.st-cagewrap'), { y: 0, duration: 1.6, ease: 'power1.inOut' }, 6.3)
        .to(q('.st-wallet'), { opacity: 1, y: 0, duration: .7 }, 8)
        .to(q('.st-req'), { opacity: 1, y: 0, duration: .7 }, 8.6)
        .to(q('.st-raw'), { opacity: .3, duration: .5 }, 9.5)
        .to(q('.st-plain'), { opacity: 1, duration: .6 }, 9.7)
        .to([ruff, crest], { opacity: 1, duration: .3 }, 10.2)
        .to(cloth, { y: 0, duration: .9, ease: 'bounce.out' }, 10.4)
        .to(q('.st-site'), { duration: .01 }, 10.6)
        .call(() => q('.st-site').classList.add('dim'), null, 11.2)
        .fromTo(q('.st-stamp'), { opacity: 0, scale: 2.6, rotation: -16 }, { opacity: 1, scale: 1, rotation: -5, duration: .45, ease: 'back.out(2)' }, 11.3)
        .to({}, { duration: .8 }, 12.2);
      tl.eventCallback('onReverseComplete', () => {});
      storyCtx = ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=2700', pin: true, scrub: .6, anticipatePin: 1, animation: tl, onUpdate: s => { if (s.progress > .55) q('.st-site').classList.toggle('dim', tl.time() > 11.2); else q('.st-site').classList.remove('dim'); } });
      storyCtx._tl = tl;
    }
    function replayStory() {
      if (!storyCtx) return; const st = storyCtx; const y0 = st.start, y1 = st.end; window.scrollTo(0, y0);
      if (storyAuto) storyAuto.kill(); const o = { y: y0 };
      const stop = () => { if (storyAuto) { storyAuto.kill(); storyAuto = null; } removeEventListener('wheel', stop); removeEventListener('touchstart', stop); removeEventListener('keydown', stop); };
      storyAuto = gsap.to(o, { y: y1, duration: 15, ease: 'none', onUpdate: () => window.scrollTo(0, o.y), onComplete: stop });
      addEventListener('wheel', stop, { passive: true, once: true }); addEventListener('touchstart', stop, { passive: true, once: true }); addEventListener('keydown', stop, { once: true });
    }

    /* ==========================================================
       CHECK A LINK
       ========================================================== */
    const defer = () => { let r; const p = new Promise(x => { r = x; }); return { promise: p, resolve: r }; };
    let cbird = null, checking = false;
    function initPerches() {
      const pr = $('#perches'); pr.innerHTML = TEST_NAMES.map((n, i) => `<div class="perch"><span>${i + 1} ${n}</span></div>`).join('') + `<div class="cb">${birdSVG()}</div>`;
      cbird = $('.cb', pr); hopTo(0, true);
    }
    function hopTo(i, now) {
      const pr = $('#perches'); if (!pr || !cbird) return; const w = pr.clientWidth; const x = (w / 3) * (i + .5) - 32;
      if (now || !motionOK()) { cbird.style.transform = `translateX(${x}px)`; if (hasGsap) gsap.set(cbird, { x }); return; }
      gsap.timeline().to(cbird, { x, duration: .5, ease: 'power1.inOut' }, 0).to(cbird, { y: -34, duration: .25, ease: 'power2.out' }, 0).to(cbird, { y: 0, duration: .25, ease: 'power2.in' }, .25);
      sound.chirp();
    }
    const SMALL = { ok: ['Nothing found', I.check], warn: ['Look closer', I.alert], bad: ['Stop', I.cross], info: ['In the extension', I.info] };
    function emptyCard() { $('#chkCard').innerHTML = `<div class="empty" style="margin-top:24px"><span aria-hidden="true">${iconSVG('singing')}</span><p style="margin:0;font-weight:600">Paste a link and the canary will check it.</p></div>`; }
    function setLrow(i, s, text) {
      const r = $(`#chkCard .lrow[data-i="${i}"]`); if (!r) return; r.dataset.s = s;
      if (text != null) $('.rt', r).innerHTML = text;
      const st = $('.st', r); st.innerHTML = SMALL[s] ? `<span style="width:18px;height:18px;display:inline-block">${SMALL[s][1]}</span> ${SMALL[s][0]}` : s === 'run' ? 'Listening…' : '';
      if (s !== 'run' && s !== 'wait' && motionOK()) gsap.fromTo(r, { scale: .98 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
    }
    const flagLi = f => `<li class="${f.minor ? 'minor' : ''}">${I.alert}<span>${esc(f.text)}</span></li>`;
    async function runCheck(raw) {
      const err = $('#chkErr'); err.textContent = '';
      if (!parseInput(raw)) { err.textContent = "That doesn't look like a website address. Check it and try again."; $('#chkIn').focus(); return; }
      if (checking) return; checking = true;
      const card = $('#chkCard');
      card.innerHTML = `<p class="loading" style="font-weight:700;margin:20px 0 0" aria-live="polite">The canary is listening…</p><div class="res">${TEST_NAMES.map((n, i) => `<div class="lrow" data-s="wait" data-i="${i}"><span class="ln">${i + 1}</span><div><h3>${n}</h3><p class="rt">Waiting.</p></div><span class="st"></span><span class="bar"></span></div>`).join('')}</div>`;
      $('#txCard').scrollIntoView && 0;
      const stages = [defer(), defer()]; hopTo(0);
      const aP = analyze(raw, (n, o) => stages[n - 1].resolve(o), {});
      const grow = (i, ms) => { const b = $(`#chkCard .lrow[data-i="${i}"] .bar`); if (!b) return; if (motionOK()) gsap.to(b, { width: '92%', duration: ms / 1000, ease: 'power1.out' }); else b.style.width = '92%'; };
      const done = i => { const b = $(`#chkCard .lrow[data-i="${i}"] .bar`); if (b) b.style.width = '100%'; };
      setLrow(0, 'run'); grow(0, 1500);
      const [o1] = await Promise.all([stages[0].promise, wait(motionOK() ? 900 : 150)]);
      done(0); setLrow(0, o1.l1.status, `${esc(o1.l1.headline)}. ${esc(o1.l1.body)}`);
      hopTo(1); setLrow(1, 'run'); grow(1, 3500);
      const [o2] = await Promise.all([stages[1].promise, wait(motionOK() ? 900 : 150)]);
      done(1);
      const top = o2.hard.concat(o2.soft).slice(0, 2).map(f => esc(cap(f.short))).join('. ');
      setLrow(1, o2.l2.status, `${esc(o2.l2.headline)}.${top ? ' ' + top + '.' : ''}`);
      hopTo(2); setLrow(2, 'run'); grow(2, 900); await wait(motionOK() ? 900 : 100); done(2);
      setLrow(2, 'info', 'The decoy wallet test runs inside the extension. Below, you can paste a transaction request and read it in plain words.');
      const res = await aP; checking = false;
      if (res.error) { err.textContent = res.error; return; }
      $('.loading', card).remove();
      recordCheck(res.host, res.verdict); updateTiles();
      const v = res.verdict; const res$ = $('.res', card);
      const shareText = `I sent the canary to ${res.host} before connecting: ${VERDICT[v].label}. Send the canary first. ${location.href.split('#')[0]}`;
      const box = document.createElement('div'); box.className = 'res'; box.setAttribute('aria-live', 'polite');
      box.innerHTML = `<div class="vbox" id="vbox">${stampHTML(v, 'xl')}<p class="sentence">${esc(res.sentence)}</p></div>
${res.flagList.length ? `<ul class="flags">${res.flagList.map(flagLi).join('')}</ul>` : ''}
${res.notes.length ? `<p class="note-small">${res.notes.map(esc).join(' ')}</p>` : ''}
${res.l1.key === 'none' ? dyorHTML().replace('class="dyor"', 'class="dyor dyor-inline" style="width:100%"') : ''}
<p style="margin:0;font-weight:700">Canary warns. You decide.</p>
<div class="actions"><button class="btn small" type="button" data-vouch>This site is legit</button><button class="btn small" type="button" data-rep>Report this site</button><a class="btn small primary" target="_blank" rel="noopener noreferrer" href="https://x.com/intent/post?text=${encodeURIComponent(shareText)}">Share on X</a><button class="btn small" type="button" data-copy>Copy result</button></div>`;
      card.appendChild(box);
      slam($('.stamp', box), $('#vbox', box));
      if (v === 'silent') { sound.quiet(); fx.burst(innerWidth / 2, innerHeight / 2, 'dust', 14); } else if (v === 'singing') sound.song(); else sound.flutter();
      $('[data-vouch]', box).addEventListener('click', async () => { await sendVouch(res.host); toast('Thanks. Your vouch is saved.'); updateTiles(); });
      $('[data-rep]', box).addEventListener('click', () => { store.sset('reportHost', res.host); navigate('/report'); });
      $('[data-copy]', box).addEventListener('click', () => copyText(shareText));
      box.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
    }
    let txBuilt = false;
    function initCheck() {
      if (!txBuilt) {
        txBuilt = true; initPerches();
        $('#checkForm').addEventListener('submit', e => { e.preventDefault(); runCheck($('#chkIn').value); });
        $('#txCard').innerHTML = `<div class="card" style="margin-top:26px"><h3 style="margin-bottom:8px">Read the fine print</h3><p class="hint-t">Signature requests are checked inside the extension. Here you can paste a transaction request and Canary will put it in plain words. Nothing leaves this page.</p>
<div class="tx-box"><label for="txIn" style="font-weight:700">Paste a transaction request (optional)</label><textarea class="field" id="txIn" spellcheck="false" placeholder="Paste a base64 transaction"></textarea><div><button class="btn" type="button" id="txBtn">Read it</button></div><div class="tx-out" id="txOut" aria-live="polite"></div></div></div>`;
        $('#txBtn').addEventListener('click', () => {
          const out = $('#txOut'); const raw = $('#txIn').value.trim(); if (!raw) { out.innerHTML = ''; return; }
          try {
            const r = decodeTx(fromB64(raw));
            const head = r.level === 'danger' ? ['silent', 'This request can hand over control of your assets.'] : r.level === 'warn' ? ['ruffled', 'This request moves funds or tokens. Make sure that is what you want.'] : ['singing', "Nothing risky in the instructions Canary can read. Stay alert."];
            out.innerHTML = `<div class="vbox" style="margin:6px 0 4px">${stampHTML(head[0])}<p class="sentence" style="font-size:1.1rem">${head[1]}</p></div>` + r.lines.map(l => `<div class="tx-line ${l.sev}">${l.sev === 'danger' || l.sev === 'warn' ? I.alert : I.info}<span>${l.html}</span></div>`).join('');
            slam(out.querySelector('.stamp'), null);
          } catch (e) { out.innerHTML = `<p class="err">Couldn't read that. It may be in a format Canary doesn't support yet.</p>`; }
        });
        emptyCard();
      }
      const pre = store.sget('checkHost', ''); if (pre) { $('#chkIn').value = pre; store.sset('checkHost', ''); }
      setTimeout(() => hopTo(0, true), 50);
    }

    /* ==========================================================
       SEED PHRASE STOPPER
       ========================================================== */
    function mountStopper(host, o = {}) {
      const uid = 'ta' + Math.random().toString(36).slice(2, 7); const SITE = 'orbital-vault.example';
      host.innerHTML = `<div class="orbital">
<div style="height:14px"></div><div class="logo-o"><span class="ring"></span>ORBITAL VAULT</div><h4>Restore your wallet</h4><p class="note-small">Enter your 12-word recovery phrase.</p>
<label class="sr" for="${uid}">Recovery phrase</label>
<textarea class="field mono" id="${uid}" rows="3" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="word1 word2 word3 ..." data-lpignore="true"></textarea>
<div class="row" style="margin-top:12px"><button class="btn primary" type="button" data-fill>Fill with the public test words</button><button class="btn" type="button" data-submit>Restore</button></div>
<p class="note-small" style="margin-top:12px">Never type your real recovery phrase anywhere on this site. Use the test words. Nothing here is stored or sent.</p>
<div class="cloth-drop" role="alert" aria-hidden="true">
 <div class="cd-step" data-step="stop">${stampHTML('silent', 'xl')}<h4>Stopped.</h4><p>That looked like a recovery phrase. No real website needs it. Your words never left your device.</p><p class="small csum" hidden></p>
  <div class="row" style="justify-content:center"><button class="btn primary small" type="button" data-decoy>Hand it a decoy instead</button><button class="btn small" type="button" data-clear>Clear it</button><button class="btn small" type="button" data-why>Learn why</button></div>
  <div class="why" hidden style="color:var(--ink);text-align:left">Anyone who has your recovery phrase controls your wallet, forever. Fake restore pages exist to collect it.</div></div>
 <div class="cd-step" data-step="decoy" hidden><h4>Scrambling a decoy</h4><div class="dchips" aria-live="polite"></div>
  <p class="small dnote">Made up from nothing. It is not a scrambled copy of your real phrase, so nothing about your real one is revealed. It opens none of your wallets.</p>
  <div class="row" style="justify-content:center"><button class="btn primary small" type="button" data-give disabled>Give it to the site</button><button class="btn small" type="button" data-back>Back</button></div></div>
 <div class="cd-step" data-step="watch" hidden><span class="eye" aria-hidden="true">${tbIcon('singing')}</span><h4>The site has the decoy.</h4>
  <p>Canary is watching it. If this site ever tries to use it, you get a notification, and you'll know not to connect your real wallet there.</p>
  <div class="row" style="justify-content:center"><button class="btn red small" type="button" data-trip>Let the site use it</button><button class="btn small" type="button" data-clear>Start over</button></div></div>
</div></div>`;
      host.classList.add('form-stage');
      const ta = $('textarea', host), cloth = $('.cloth-drop', host), orb = $('.orbital', host); let dropped = false, scrambleT = null;
      const step = n => $$('.cd-step', cloth).forEach(s => { s.hidden = s.dataset.step !== n; });
      const lift = () => {
        dropped = false; ta.value = ''; clearInterval(scrambleT);
        const end = () => { cloth.classList.remove('on'); cloth.setAttribute('aria-hidden', 'true'); step('stop'); ta.focus({ preventScroll: true }); $('.why', cloth).hidden = true; };
        if (motionOK()) gsap.to(cloth, { y: '-110%', duration: .45, ease: 'power2.in', onComplete: end }); else { cloth.style.transform = 'translateY(-110%)'; end(); }
      };
      const drop = d => {
        if (dropped) return; dropped = true; ta.value = ''; ta.blur(); step('stop');
        cloth.classList.add('on'); cloth.setAttribute('aria-hidden', 'false');
        const cs = $('.csum', cloth); if (d.checksum === true) { cs.hidden = false; cs.textContent = 'These words even pass the checksum real wallets use. That makes them look very real.'; } else cs.hidden = true;
        if (motionOK()) { gsap.fromTo(cloth, { y: '-110%' }, { y: '0%', duration: .7, ease: 'bounce.out' }); const r = host.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 'dust', 16); slam($('.stamp', cloth), null); }
        else { cloth.style.transform = 'translateY(0)'; }
        sound.quiet(); setTimeout(() => sound.thud(), 250);
        $('[data-decoy]', cloth).focus({ preventScroll: true });
      };
      const check = () => { const d = detectSeed(ta.value); if (d.hit) drop(d); };
      ta.addEventListener('input', check); ta.addEventListener('paste', () => setTimeout(check, 0)); ta.addEventListener('change', check);
      $('[data-fill]', host).addEventListener('click', () => { ta.value = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'; check(); });
      $('[data-submit]', host).addEventListener('click', () => { check(); if (!dropped) toast('Nothing was sent. This page does not store or send what you type.'); });
      $$('[data-clear]', host).forEach(b => b.addEventListener('click', lift));
      $('[data-why]', host).addEventListener('click', () => { $('.why', cloth).hidden = false; });
      /* the scrambler: a slot-machine of words that locks one by one into a freshly made decoy phrase */
      $('[data-decoy]', host).addEventListener('click', () => {
        step('decoy'); const words = makeDecoyPhrase(12); const box = $('.dchips', cloth), give = $('[data-give]', cloth); give.disabled = true;
        box.innerHTML = words.map(() => '<span class="dchip">&nbsp;</span>').join(''); const chips = $$('.dchip', box);
        $('h4', $('[data-step=decoy]', cloth)).textContent = 'Scrambling a decoy';
        const lockAt = i => 500 + i * 150; const t0 = performance.now(); clearInterval(scrambleT);
        const fin = () => { clearInterval(scrambleT); chips.forEach((c, i) => { c.textContent = words[i]; c.classList.add('lock'); }); $('h4', $('[data-step=decoy]', cloth)).textContent = 'Here is your decoy'; give.disabled = false; give.focus({ preventScroll: true }); };
        if (!motionOK()) { fin(); return; }
        scrambleT = setInterval(() => {
          const t = performance.now() - t0; let done = 0;
          chips.forEach((c, i) => { if (t >= lockAt(i)) { if (!c.classList.contains('lock')) { c.textContent = words[i]; c.classList.add('lock'); gsap.fromTo(c, { scale: 1.25 }, { scale: 1, duration: .25, ease: 'back.out(3)' }); sound.tone(1400 + i * 90, 1600 + i * 90, .06, 0, .02); } done++; } else c.textContent = BIP39[(Math.random() * 2048) | 0]; });
          if (done === chips.length) fin();
        }, 55);
      });
      $('[data-back]', host).addEventListener('click', () => { clearInterval(scrambleT); step('stop'); });
      $('[data-give]', host).addEventListener('click', () => { step('watch'); sound.chirp(); const e = $('.eye', cloth); if (motionOK()) gsap.fromTo(e, { scale: .6, rotation: -10 }, { scale: 1, rotation: 0, duration: .5, ease: 'back.out(3)' }); $('[data-trip]', cloth).focus({ preventScroll: true }); });
      /* the tripwire: the site "uses" the decoy, and Canary tells you */
      $('[data-trip]', host).addEventListener('click', async () => {
        const e = $('.eye', cloth); e.innerHTML = tbIcon('silent'); if (motionOK()) gsap.fromTo(e, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.2)' });
        $('h4', $('[data-step=watch]', cloth)).textContent = 'The canary went quiet.';
        await wait(motionOK() ? 500 : 0); showTripwire({ site: SITE, demo: true });
      });
      return { orb };
    }
    /* the notification Canary shows when a decoy phrase is used (also drawn, static, in the showcase) */
    function tripwireHTML(site, demo) {
      return `<span class="nf-ico" aria-hidden="true">${tbIcon('silent')}</span>
<div class="nf-body"><b>A decoy phrase was just used</b><p><span class="mono">${esc(site)}</span> tried to use the decoy phrase you gave it. A site that goes after a recovery phrase it was never meant to have is a scam. Don't connect your real wallet there.</p>
<div class="row">${demo ? '<button class="btn small dark" type="button" data-nf-x>Got it</button>' : '<span class="btn small dark">Got it</span><span class="btn small">What happened?</span>'}</div></div>`;
    }
    function showTripwire(o) {
      const n = $('#notif'); n.innerHTML = tripwireHTML(o.site, o.demo); n.classList.add('on'); n.setAttribute('aria-hidden', 'false');
      sound.alarm();
      if (motionOK()) { gsap.fromTo(n, { y: -30, x: 40, opacity: 0, rotation: 3 }, { y: 0, x: 0, opacity: 1, rotation: 0, duration: .5, ease: 'back.out(2)' }); gsap.fromTo($('.nf-ico', n), { rotation: -18 }, { rotation: 0, duration: .9, ease: 'elastic.out(1,.2)', delay: .2 }); const r = n.getBoundingClientRect(); fx.burst(r.left + 40, r.top + 40, 'dust', 10); }
      const x = $('[data-nf-x]', n); x && x.addEventListener('click', () => { n.classList.remove('on'); n.setAttribute('aria-hidden', 'true'); });
    }
    let stopperMounted = false;
    function initStopper() {
      if (!stopperMounted) { stopperMounted = true; mountStopper($('#stopStage')); }
      $('#stopMode').textContent = BIP39_OK ? 'Checked against the full BIP39 English word list (2,048 words). 12 and 24 word phrases are caught, and a valid checksum counts as an extra signal.' : "The word list couldn't be loaded here, so this page uses a simpler pattern check (12 or 24 lowercase words).";
    }

    /* ==========================================================
       WALLET (optional, only to sign a report)
       ========================================================== */
    const WALLETS = [
      { id: 'phantom', name: 'Phantom', get: () => (window.phantom && window.phantom.solana && window.phantom.solana.isPhantom ? window.phantom.solana : (window.solana && window.solana.isPhantom ? window.solana : null)), url: 'https://phantom.app/' },
      { id: 'solflare', name: 'Solflare', get: () => (window.solflare && window.solflare.isSolflare ? window.solflare : (window.solana && window.solana.isSolflare ? window.solana : null)), url: 'https://solflare.com/' },
      { id: 'backpack', name: 'Backpack', get: () => (window.backpack && window.backpack.isBackpack ? window.backpack : null), url: 'https://backpack.app/' },
      { id: 'coinbase', name: 'Coinbase Wallet', get: () => window.coinbaseSolana || null, url: 'https://www.coinbase.com/wallet' },
      { id: 'trust', name: 'Trust Wallet', get: () => (window.trustwallet && window.trustwallet.solana) || (window.trustWallet && window.trustWallet.solana) || null, url: 'https://trustwallet.com/' }
    ];
    const wallet = { id: null, provider: null, pk: null };
    const shortPk = pk => pk.slice(0, 4) + '…' + pk.slice(-4);
    function walletErr(e) {
      const msg = String((e && e.message) || e || '');
      if ((e && (e.code === 4001 || e.code === 'ACTION_REJECTED')) || /reject|cancel|denied|declin/i.test(msg)) return 'Signature cancelled. Nothing was sent.';
      return 'The wallet ran into a problem. Nothing was sent.';
    }
    function bindProvider(w, prov) {
      const onDisc = () => { if (wallet.provider === prov) setWallet(null, null, null, true); };
      const onAcc = pk => {
        if (wallet.provider !== prov) return;
        if (pk) { wallet.pk = pk.toString(); store.set('wallet', { id: w.id }); paintWallet(); }
        else prov.connect({ onlyIfTrusted: true }).then(r => { const k = (r && r.publicKey) || prov.publicKey; if (k) { wallet.pk = k.toString(); paintWallet(); } else onDisc(); }).catch(onDisc);
      };
      if (prov.on) { prov.on('disconnect', onDisc); prov.on('accountChanged', onAcc); prov.on('connect', k => { if (k && wallet.provider === prov) { wallet.pk = k.toString(); paintWallet(); } }); }
    }
    function setWallet(id, prov, pk, silent) {
      wallet.id = id; wallet.provider = prov; wallet.pk = pk;
      if (!id) { store.set('wallet', null); if (!silent) toast('Wallet disconnected.'); } paintWallet();
    }
    async function connectWallet(w, quiet = false) {
      const prov = w.get(); if (!prov) { if (!quiet) window.open(w.url, '_blank', 'noopener'); return false; }
      try {
        const r = await prov.connect(quiet ? { onlyIfTrusted: true } : undefined);
        const k = (r && r.publicKey) || prov.publicKey; if (!k) throw new Error('no key');
        setWallet(w.id, prov, k.toString(), true); bindProvider(w, prov); store.set('wallet', { id: w.id });
        if (!quiet) toast('Wallet connected.'); return true;
      } catch (e) { if (!quiet) toast(walletErr(e)); return false; }
    }
    async function disconnectWallet() { const p = wallet.provider; try { p && p.disconnect && await p.disconnect(); } catch (e) { } setWallet(null, null, null); }
    async function signMessage(text) {
      const bytes = new TextEncoder().encode(text); const r = await wallet.provider.signMessage(bytes, 'utf8');
      const sig = (r && r.signature) || r; return b58enc(sig instanceof Uint8Array ? sig : new Uint8Array(sig));
    }
    function openWalletModal() {
      const m = $('#walletModal'); $('#wList').innerHTML = WALLETS.map(w => { const det = !!w.get(); return `<button class="wopt" type="button" data-w="${w.id}"><span>${w.name}</span><span class="tag ${det ? 'det' : ''}">${det ? 'Detected' : 'Install'}</span></button>`; }).join('');
      $$('#wList .wopt').forEach(b => b.addEventListener('click', async () => { const w = WALLETS.find(x => x.id === b.dataset.w); const ok = await connectWallet(w); if (ok) { const f = window.__afterConnect; closeWalletModal(); if (f) f(); } }));
      m.classList.add('on'); const f = $('#wList .wopt'); f && f.focus();
    }
    function closeWalletModal() { $('#walletModal').classList.remove('on'); window.__afterConnect = null; }
    function paintWallet() {
      const el = $('#walletRow'); if (!el) return;
      el.innerHTML = wallet.pk ? `<span class="mono">${shortPk(wallet.pk)}</span><button class="btn small" type="button" data-signbtn>Sign to add weight</button><button class="btn small" type="button" data-disc>Disconnect</button>`
        : `<button class="btn small" type="button" data-conn>Connect wallet</button><button class="btn small" type="button" data-signbtn>Sign to add weight</button>`;
      const c = el.querySelector('[data-conn]'); c && c.addEventListener('click', openWalletModal);
      const d = el.querySelector('[data-disc]'); d && d.addEventListener('click', disconnectWallet);
      el.querySelector('[data-signbtn]').addEventListener('click', doSign);
    }
    let sig = null;
    async function doSign() {
      const host = parseInput($('#rpHost').value); const kind = $('input[name=rk]:checked'); const stat = $('#signStat');
      if (!host) { $('#rpErr').textContent = "That doesn't look like a website address. Check it and try again."; $('#rpHost').focus(); return; }
      if (!wallet.pk) { window.__afterConnect = doSign; openWalletModal(); return; }
      const text = `Canary report\nSite: ${host.host}\nWhat happened: ${kind ? kind.value : 'Other'}\nTime: ${new Date().toISOString()}\nNonce: ${Math.random().toString(36).slice(2, 10)}`;
      try { const s = await signMessage(text); sig = { signature: s, publicKey: wallet.pk, message: text, host: host.host }; stat.textContent = 'Signed. This report will carry more weight.'; sound.chirp(); }
      catch (e) { sig = null; toast(walletErr(e)); }
    }
    const REPORT_KINDS = ['Asked me to connect and I lost funds', 'Fake copy of a known site', 'Fake airdrop or mint', 'Asked for my recovery phrase', 'Other'];
    function initReport() {
      const host = $('#reportHost');
      host.innerHTML = `<form class="form" id="rpForm" novalidate>
<div class="fld"><label for="rpHost">Site address</label><input class="field" id="rpHost" type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false"><p class="err" id="rpErr" role="alert"></p></div>
<fieldset class="fld"><legend>What happened</legend><div class="radios">${REPORT_KINDS.map((t, i) => `<label><input type="radio" name="rk" value="${t}" ${i === 1 ? 'checked' : ''}>${t}</label>`).join('')}</div></fieldset>
<div class="fld"><label for="rpDet">Details (optional)</label><textarea class="field" id="rpDet"></textarea></div>
<div class="fld"><label for="rpProof">Link to proof (optional)</label><input class="field" id="rpProof" type="url" autocomplete="off" spellcheck="false"></div>
${CFG.features.wallet === false ? '' : `<div class="wallet-box"><strong>Sign to add weight (optional)</strong><p class="note-small">Canary only asks you to sign a message. It never moves your funds. You never need to connect a wallet to use Canary.</p><div class="row" id="walletRow"></div><p id="signStat" class="note-small" style="margin-top:8px"></p></div>`}
<p class="note-small">Don't include seed phrases, private keys or personal details.</p>
<div><button class="btn primary" type="submit" data-magnetic>Send report</button></div></form>`;
      paintWallet();
      $('#rpForm').addEventListener('submit', async e => {
        e.preventDefault(); const err = $('#rpErr'); err.textContent = '';
        const p = parseInput($('#rpHost').value); if (!p) { err.textContent = "That doesn't look like a website address. Check it and try again."; $('#rpHost').focus(); return; }
        const proof = $('#rpProof').value.trim(); if (proof && !/^https?:\/\//i.test(proof)) { err.textContent = 'The proof link should start with http:// or https://.'; return; }
        const kind = $('input[name=rk]:checked').value;
        const rep = { host: p.host, kind, details: $('#rpDet').value.trim().slice(0, 2000), proof, ts: Date.now(), signed: !!(sig && sig.host === p.host) };
        const body = { ...rep, ...(rep.signed ? { signature: sig.signature, publicKey: sig.publicKey, message: sig.message } : {}) };
        const all = store.get('reports', []); all.push(rep); store.set('reports', all.slice(-300));
        try { await apiFetch('/report', { method: 'POST', body: JSON.stringify(body) }); } catch (e2) { /* kept locally */ }
        host.innerHTML = `<div class="card y" style="display:grid;gap:14px;justify-items:start"><span id="rpStamp"><span class="stamp singing xl" role="img" aria-label="Filed"><span>FILED</span></span></span><p style="margin:0;font-weight:700;font-size:1.2rem">Thanks. Your report is in the queue. A warning call is learned once it's checked.</p>${CFG.api ? '' : '<p class="note-small" style="margin:0">Saved in this browser for now.</p>'}<button class="btn small" type="button" id="rpAgain">Report another site</button></div>`;
        slam($('#rpStamp .stamp', host), null); sig = null; updateTiles();
        $('#rpAgain').addEventListener('click', initReport);
      });
      const h = store.sget('reportHost', ''); if (h) { $('#rpHost').value = h; store.sset('reportHost', ''); }
    }

    /* ==========================================================
       WARNING CALLS: honest counters + feed
       ========================================================== */
    let remote = null;
    function currentStats() {
      const checks = store.get('checks', []); const week = Date.now() - 7 * 864e5;
      const localSilent = checks.filter(c => c.verdict === 'silent' && c.ts > week).length;
      const localReports = store.get('reports', []).length;
      return {
        checked: checks.length,
        reports: remote && remote.reports != null ? remote.reports : localReports,
        calls: remote && remote.calls != null ? remote.calls : 0,
        silentWeek: remote && remote.silentWeek != null ? remote.silentWeek : localSilent,
        callsWeek: remote && remote.callsWeek != null ? remote.callsWeek : 0,
        feed: remote && Array.isArray(remote.feed) ? remote.feed : []
      };
    }
    const TILE_DEFS = [['checked', 'Sites checked'], ['reports', 'Reports received'], ['calls', 'Warning calls learned'], ['silentWeek', 'Silent calls this week']];
    function renderTiles() {
      $$('[data-tiles]').forEach(h => { h.innerHTML = TILE_DEFS.map(([k, l]) => `<div class="card tile ${k === 'calls' ? 'y' : ''}"><div class="v" data-k="${k}" data-v="0">0</div><div class="l">${l}</div></div>`).join(''); });
      updateTiles(true);
    }
    function updateTiles(first) {
      const s = currentStats();
      $$('[data-tiles] .v').forEach(el => {
        const v = s[el.dataset.k] || 0; el.dataset.v = v;
        if (el._counted || !first && el.dataset.shown) el.textContent = fmtN(v); else if (!hasGsap || RM) el.textContent = fmtN(v);
      });
      const wk = $('#earWeek'); if (wk) wk.textContent = `Warning calls learned this week: ${fmtN(s.callsWeek)}`;
      renderFeed(s);
    }
    function countIn(el) {
      el._counted = true; const v = Number(el.dataset.v) || 0; if (!motionOK() || !v) { el.textContent = fmtN(v); return; }
      const o = { n: 0 }; gsap.to(o, { n: v, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = fmtN(Math.round(o.n)); } });
    }
    function initCounterObserver() {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !e.target._counted) countIn(e.target); }), { threshold: .5 });
      $$('[data-tiles] .v').forEach(el => io.observe(el));
    }
    function renderFeed(s) {
      const f = $('#callsFeed'); if (!f) return;
      if (!s.feed.length) { f.innerHTML = `<div class="empty"><span aria-hidden="true">${iconSVG('silent')}</span><p style="margin:0;font-weight:700">No warning calls yet. The first ones are learned at launch.</p></div>`; return; }
      f.innerHTML = `<div class="feed">${s.feed.slice(0, 40).map(r => `<div class="card feedrow" tabindex="0"><div><div class="addr mono"><span>${esc(r.host)}</span><span class="cloth"></span></div><span class="small muted">First seen ${esc(r.firstSeen || '')}</span></div><div style="text-align:right">${stampHTML(r.verdict && VERDICT[r.verdict] ? r.verdict : 'silent')}<div class="small muted" style="margin-top:6px">heard ${fmtN(r.heard || 1)} times</div></div></div>`).join('')}</div>`;
    }
    async function loadRemoteStats() {
      if (!CFG.api || CFG.features.api === false) return;
      try { const j = await apiFetch('/stats'); if (j) { remote = j; updateTiles(); } } catch (e) { /* stay on local numbers */ }
    }

    /* ==========================================================
       INSTALL STATE, FAQ, HOME STATIC BITS
       ========================================================== */
    const installState = () => CFG.extensionStatus === 'live' && CFG.installUrl ? 'live' : 'pending';
    function renderInstall() {
      const live = installState() === 'live';
      $$('[data-install]').forEach(el => {
        const k = el.dataset.install;
        if (k === 'support') { el.textContent = live ? '' : "Canary is in review on the Chrome Web Store. Follow on X and you'll hear the moment it's live."; return; }
        if (live) {
          el.innerHTML = k === 'pill' ? `<a class="pill live" href="${esc(CFG.installUrl)}" target="_blank" rel="noopener noreferrer">${I.chromeLogo} Add to Chrome</a>` : `<a class="btn primary big" href="${esc(CFG.installUrl)}" target="_blank" rel="noopener noreferrer" data-magnetic>${I.chromeLogo} Add to Chrome</a>`;
        } else {
          el.innerHTML = `<span class="pill" role="status">${I.chromeLogo}<span class="long">In review on the Chrome Web Store</span></span>` + (k === 'pill' ? '' : `<a class="link tl" href="${esc(CFG.x)}" target="_blank" rel="noopener noreferrer">Follow on X for the launch</a>`);
        }
      });
    }
    const FAQ = [
      ['Does Canary hold my funds or keys?', 'No. It never asks for your seed phrase or private keys and it never moves funds.'],
      ['What is the decoy wallet?', 'A throwaway wallet with a small balance that Canary shows to a new site instead of your real one, so it can see what the site tries to do.'],
      ['Do I need to connect my wallet to use the site?', 'No. The checker works without a wallet.'],
      ['Does it say a site is safe?', 'No. It says Singing, Ruffled or Silent. Singing means nothing was found, not that it is safe.'],
      ['What if a site has no reviews?', 'Canary says so and gives you a short checklist to do your own research.'],
      ['How does it get smarter?', 'From confirmed reports, community vouches and corrections.'],
      ['What is a decoy phrase?', 'If a page asks for your recovery phrase, Canary can give it a made-up phrase instead. It looks real but opens none of your wallets. If a site tries to use it, Canary notifies you.'],
      ['Is the decoy a scrambled version of my real phrase?', 'No. It is made up from scratch, so nothing about your real phrase is revealed. Canary never asks for your real phrase.'],
      ['Which wallets?', 'Phantom, Solflare and Backpack.'],
      ['Which browsers?', 'Chrome first.']
    ];
    function fillStatic() {
      $('#brandLogo').innerHTML = logoSVG(); $('#footLogo').innerHTML = logoSVG();
      $('#faqList').innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
      $('#fakeCards').innerHTML = [
        ['Fake mint pages', 'free-mint-now.io', 'Copies of a real launch that mint you nothing and ask for an approval.', 'Mint now', '-.6deg'],
        ['Fake airdrop claims', 'claim-lunaris-drop.top', 'Free tokens for connecting. The catch is what you sign.', 'Claim airdrop', '.5deg'],
        ['Fake wallet and swap apps', 'wallet-verify.app', 'Look-alike apps that ask for your recovery phrase or an unlimited approval.', 'Verify wallet', '-.3deg']
      ].map(([t, a, p, b, r]) => `<article class="card fake-card" data-fake style="--rot:${r}"><div class="bar"><i></i><i></i><i></i><span>${a}</span></div><div class="body"><h3>${t}</h3><p>${p}</p><span class="fakebtn">${b}</span></div></article>`).join('');
      $('#verdictCards').innerHTML = ['singing', 'ruffled', 'silent'].map(v => `<div class="card ${v === 'singing' ? 'y' : v === 'ruffled' ? 'b' : ''}" ${v === 'singing' ? 'data-trust' : ''} style="display:grid;gap:12px;justify-items:start">${stampHTML(v, 'xl')}<p style="margin:0;font-weight:600">${VERDICT[v].line}</p></div>`).join('');
      $('#stopTeaserArt').innerHTML = `<div style="width:min(200px,40vw)">${iconSVG('silent').replace('class="vi "', 'class="vi" style="width:100%;height:auto"')}</div>`;
      $('#xLink').href = CFG.x;
      /* decorate [data-fake] / [data-trust] with the stamp / mark the cursor bird triggers */
      $$('[data-fake]').forEach(el => { if (!$('.cardstamp', el)) { const s = document.createElement('span'); s.className = 'cardstamp'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = stampHTML('silent'); el.appendChild(s); } });
      $$('[data-trust]').forEach(el => { if (!$('.trustmark', el)) { const s = document.createElement('span'); s.className = 'trustmark'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = `<span style="display:block;width:38px">${iconSVG('singing')}</span>`; el.appendChild(s); } });
    }

    /* ==========================================================
       MICRO-INTERACTIONS: scramble headline, magnetic buttons, card tilt
       ========================================================== */
    const GLYPHS = 'abcdefghklmnoprstuvwy?#*&%';
    async function scramble(el, text, dur = 1.1) {
      el.setAttribute('aria-label', text);
      if (!motionOK()) { el.textContent = text; return; }
      /* build the final text first, measure each letter, then lock its width so nothing reflows while it scrambles */
      el.innerHTML = '';
      const chars = [];
      text.split(' ').forEach((w, wi, arr) => {
        const word = document.createElement('span'); word.className = 'w'; word.setAttribute('aria-hidden', 'true');
        [...w].forEach(ch => { const c = document.createElement('span'); c.textContent = ch; c.dataset.ch = ch; word.appendChild(c); chars.push(c); });
        el.appendChild(word); if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
      });
      chars.forEach(c => { c._w = c.getBoundingClientRect().width; });
      chars.forEach(c => { c.style.cssText = `display:inline-block;width:${c._w}px;text-align:center`; });
      const t0 = performance.now(); const n = chars.length;
      await new Promise(res => {
        const tick = now => {
          const p = clamp((now - t0) / (dur * 1000), 0, 1);
          chars.forEach((c, i) => { const lock = i / n * .8; c.textContent = /[a-z]/i.test(c.dataset.ch) && p < lock + .2 && p < 1 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : c.dataset.ch; });
          p < 1 ? requestAnimationFrame(tick) : res();
        };
        requestAnimationFrame(tick);
      });
      chars.forEach(c => { c.textContent = c.dataset.ch; c.style.cssText = ''; });
    }
    function initMagnets() {
      if (!FINE || RM || !hasGsap) return;
      document.addEventListener('pointermove', e => {
        const m = e.target.closest && e.target.closest('[data-magnetic]');
        $$('[data-magnetic].mag').forEach(x => { if (x !== m) { x.classList.remove('mag'); gsap.to(x, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }); } });
        if (!m) return; m.classList.add('mag'); const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * .22, y: (e.clientY - (r.top + r.height / 2)) * .3, duration: .3 });
      }, { passive: true });
    }
    function initTilt() {
      if (!FINE || RM) return; let last = null, raf = 0;
      document.addEventListener('pointermove', e => {
        if (raf) return; raf = requestAnimationFrame(() => {
          raf = 0; const c = e.target.closest && e.target.closest('.card'); if (last && last !== c) { last.style.setProperty('--px', 0); last.style.setProperty('--py', 0); }
          if (c && !c.classList.contains('fake-card')) { const r = c.getBoundingClientRect(); c.style.setProperty('--px', (((e.clientX - r.left) / r.width) - .5).toFixed(3)); c.style.setProperty('--py', (((e.clientY - r.top) / r.height) - .5).toFixed(3)); }
          last = c;
        });
      }, { passive: true });
    }

    /* ==========================================================
       ROUTER: hash routes, torn-paper wipe
       ========================================================== */
    const ROUTES = ['/', '/demo', '/check', '/stopper', '/report', '/calls', '/how', '/install'];
    const TITLES = { '/': 'Canary: Send the canary first.', '/demo': 'See it work · Canary', '/check': 'Check a link · Canary', '/stopper': 'Seed phrase stopper · Canary', '/report': 'Report a site · Canary', '/calls': 'Warning calls · Canary', '/how': 'How Canary works', '/install': 'Add Canary' };
    let currentKey = null, curRoute = '/', lastClick = { x: innerWidth / 2, y: innerHeight / 2 }, heroCage = null, installBuilt = false, homeBuilt = false;
    function parseRoute() {
      const h = location.hash.replace(/^#/, '') || '/';
      if (h.startsWith('/shot/')) return { path: '/shot', arg: h.slice(6) };
      return { path: ROUTES.includes(h) ? h : '/' };
    }
    function navigate(path) {
      if (location.hash === '#' + path || (path === '/' && (location.hash === '' || location.hash === '#'))) { route(); window.scrollTo(0, 0); return; }
      location.hash = '#' + path;
    }
    function tearPath() {
      const n = 22, pts = ['0 0', '100% 0']; for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% calc(100% - ${Math.round(Math.random() * 56)}px)`); return `polygon(${pts.join(',')})`;
    }
    function wipe(swap) {
      const w = $('#wipe'), [a, b] = $$('.sheet', w); w.classList.add('on');
      a.style.setProperty('--tear', tearPath()); b.style.setProperty('--tear', tearPath());
      gsap.set([a, b], { yPercent: -110 });
      const tl = gsap.timeline({ onComplete: () => w.classList.remove('on') });
      tl.to(a, { yPercent: 0, duration: .34, ease: 'power2.in' }, 0).to(b, { yPercent: 0, duration: .34, ease: 'power2.in' }, .1)
        .call(swap).to(b, { yPercent: -110, duration: .38, ease: 'power2.out' }, '+=.04').to(a, { yPercent: -110, duration: .38, ease: 'power2.out' }, '<.1');
    }
    function route() {
      const r = parseRoute(); const key = r.path + (r.arg || '');
      if (key === currentKey) return;
      const first = currentKey === null; const prev = currentKey; currentKey = key;
      const swap = () => {
        if (prev === '/') killStory();
        curRoute = r.path;
        $$('.page').forEach(p => p.classList.toggle('on', p.dataset.page === r.path));
        $$('.nav a').forEach(a => { const on = a.dataset.route === r.path; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
        $('#footer').hidden = r.path === '/shot';
        document.body.classList.toggle('is-shot', r.path === '/shot');
        $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
        window.scrollTo(0, 0); onEnter(r);
        document.title = TITLES[r.path] || TITLES['/'];
      };
      if (first || !motionOK() || r.path === '/shot') swap(); else wipe(swap);
    }
    function onEnter(r) {
      if (r.path === '/') { enterHome(); }
      else if (r.path === '/demo') { demoShow(store.sget('demoTab', 'airdrop')); store.sset('demoTab', 'airdrop'); }
      else if (r.path === '/check') initCheck();
      else if (r.path === '/stopper') initStopper();
      else if (r.path === '/report') initReport();
      else if (r.path === '/calls') { renderTiles(); initCounterObserver(); updateTiles(); loadRemoteStats(); }
      else if (r.path === '/install') { if (!installBuilt) { installBuilt = true; mountShowcase($('#installGallery'), ['browser', 'icons', 'tests', 'decoy', 'dyor', 'stopper', 'tripwire', 'settings']); } }
      else if (r.path === '/shot') enterShot(r.arg);
      if (r.path !== '/') { $$('.page.on h1').forEach(h => { if (motionOK() && !h._seen) { h._seen = true; gsap.from(h, { y: 26, opacity: 0, duration: .6, ease: 'power3.out' }); } }); }
      if (hasST) setTimeout(() => ScrollTrigger.refresh(), 120);
    }
    async function enterHome() {
      if (!homeBuilt) {
        homeBuilt = true;
        mountShowcase($('#homeShowcase'), ['browser', 'icons', 'tests', 'decoy', 'stopper', 'tripwire']);
        buildScenarioCards(); initPractice(); renderTiles(); initCounterObserver(); loadRemoteStats(); initSun();
        heroCage = new CageBird($('#heroCage'), { interactive: true, onCover: on => heroCoverStamp(on) });
        window.__heroCage = heroCage;
        if (hasGsap && !RM) { gsap.set('#heroCage', { opacity: 1 }); }
        await window.introDone;
        scramble($('#heroH'), 'Send the canary first.');
        if (motionOK()) { gsap.from('.hero-copy > *:not(h1)', { y: 18, opacity: 0, duration: .6, stagger: .08, ease: 'power2.out', delay: .1 }); gsap.from('.hold-hint', { opacity: 0, delay: 1.2 }); }
      }
      initStory();
      if (heroCage) { /* nothing to reset */ }
    }
    function heroCoverStamp(on) {
      const s = $('#heroStamp'); if (on) { s.innerHTML = stampHTML('silent', 'xl'); if (motionOK()) gsap.fromTo(s, { opacity: 0, scale: 2.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: -6, duration: .35, ease: 'back.out(2)', delay: .5 }); else s.style.opacity = 1; } else { if (motionOK()) gsap.to(s, { opacity: 0, duration: .2 }); else s.style.opacity = 0; }
    }
