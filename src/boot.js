    /* ==========================================================
       STORE ART: hidden #/shot/<name> pages used to export PNGs (see tools/export-store.mjs)
       ========================================================== */
    async function enterShot(name) {
      document.body.classList.add('is-shot'); const host = $('#shotHost'); host.innerHTML = '';
      const dims = { promo: [440, 280], marquee: [1400, 560] }[name] || [1280, 800];
      const box = document.createElement('div'); box.className = 'shotbox'; box.style.cssText = `width:${dims[0]}px;height:${dims[1]}px;position:relative;background:var(--cream) var(--grain);overflow:hidden`;
      host.appendChild(box);
      const head = (t, sub, light) => `<div style="position:absolute;left:56px;top:44px;right:56px;z-index:3"><h2 style="font-size:58px;letter-spacing:-.025em;color:var(--ink);text-shadow:.045em .04em 0 var(--yellow)">${t}</h2><p style="font-size:22px;margin:10px 0 0;color:var(--ink-2)">${sub}</p></div>`;
      const dots = `<div style="position:absolute;right:-80px;top:-80px;width:460px;height:460px;border-radius:50%;background:var(--yellow);opacity:.85"></div>`;
      const stage = (inner, top = 200) => `<div style="position:absolute;left:0;right:0;top:${top}px;bottom:0;display:grid;place-items:center">${inner}</div>`;
      const sc0 = SC[0], ev0 = await evalScenario(sc0);
      if (name === 'browser') {
        box.innerHTML = dots + head('See it at the door.', 'This is what Canary does the moment a site asks for your wallet.');
        const w = document.createElement('div'); w.style.cssText = 'position:absolute;left:56px;right:56px;top:210px;bottom:48px'; box.appendChild(w);
        w.innerHTML = siteHTML(sc0); const b = $('[data-site]', w); b.style.cssText = 'height:100%;display:flex;flex-direction:column'; $('.site', b).style.cssText += ';flex:1;padding-right:380px';
        const ph = document.createElement('div'); ph.style.cssText = 'position:absolute;right:26px;top:58px;z-index:5;transform:scale(1.04);transform-origin:top right'; w.style.position = 'absolute'; w.appendChild(ph);
        const pop = createPopup(ph, { addr: sc0.addr, rows: ev0.rows, verdict: ev0.verdict }, { buttons: true }); pop.goto(4, false); setToolbar(b, 'silent'); $('.site', b).classList.add('dim');
      } else if (name === 'layers') {
        box.innerHTML = dots + head('Three tests, one answer.', 'Ask around. Spot the fake. Send the canary.');
        const ph = document.createElement('div'); ph.style.cssText = 'position:absolute;left:50%;top:196px;transform:translateX(-50%) scale(1.2);transform-origin:top center'; box.appendChild(ph);
        const pop = createPopup(ph, { addr: sc0.addr, rows: ev0.rows, verdict: ev0.verdict }, { buttons: true }); pop.goto(4, false);
      } else if (name === 'sign') {
        box.innerHTML = dots + head('What the site tried, in plain words.', 'Canary shows the site a decoy wallet, not yours.');
        const d = decoyPanel(sc0, ev0); d.style.cssText = 'position:absolute;left:56px;top:230px;width:898px;gap:24px;zoom:1.3'; box.appendChild(d);
      } else if (name === 'dyor') {
        box.innerHTML = dots + head('No reviews? Here is your checklist.', 'Canary tells you when nobody has looked at a site yet.');
        const w = document.createElement('div'); w.style.cssText = 'position:absolute;left:50%;top:230px;transform:translateX(-50%);zoom:1.45;width:520px'; w.innerHTML = dyorHTML(); box.appendChild(w);
      } else if (name === 'set') {
        box.innerHTML = dots + head('You stay in control.', 'Sound, trusted sites and what the extension can see.');
        const s = await buildScene('settings'); const art = $('.art', s); art.style.cssText = 'background:transparent;box-shadow:none;position:absolute;left:50%;top:210px;transform:translateX(-50%);zoom:1.5;min-height:0'; $('figcaption', s).remove(); box.appendChild(art);
      } else if (name === 'trip') {
        box.innerHTML = dots + head('Hand a scam site a decoy.', 'Hear about it the moment it tries to use it.');
        const words = 'shy dignity virtual exit normal know over portion promote traffic hint educate'.split(' ');
        const w = document.createElement('div'); w.style.cssText = 'position:absolute;left:56px;top:270px;width:540px;background:var(--ink);border-radius:22px;padding:28px;color:var(--cream)';
        w.innerHTML = `<h4 style="font-size:30px;color:var(--blush);margin-bottom:6px">Here is your decoy</h4><p style="margin:0 0 16px;font-size:16px;color:#E9E4D2">Made up from nothing. Opens none of your wallets.</p><div class="dchips" style="width:100%">${words.map(x => `<span class="dchip lock">${x}</span>`).join('')}</div>`;
        const n = document.createElement('div'); n.className = 'notif on'; n.style.cssText = 'position:absolute;left:626px;top:290px;right:auto;width:598px;display:grid'; n.innerHTML = tripwireHTML('orbital-vault.example', false);
        box.appendChild(w); box.appendChild(n);
      } else if (name === 'promo') {
        box.style.background = 'var(--yellow)';
        box.innerHTML = `<div style="position:absolute;left:24px;top:24px;display:flex;gap:10px;align-items:center;font-family:var(--f-head);font-weight:900;font-size:26px"><span style="width:44px">${logoSVG()}</span>Canary</div>
<h2 style="position:absolute;left:24px;bottom:30px;font-size:46px;max-width:250px;line-height:.92;text-shadow:.045em .04em 0 var(--paper)">Send the canary first.</h2>
<div style="position:absolute;right:14px;bottom:8px;width:140px;height:230px" id="pcage"></div>`;
        const cbb = new CageBird($('#pcage', box), { noHop: true }); cbb.cloth.style.transform = 'translateY(-900px)';
      } else if (name === 'marquee') {
        box.style.background = 'var(--yellow)';
        box.innerHTML = `<div style="position:absolute;left:64px;top:56px;display:flex;gap:12px;align-items:center;font-family:var(--f-head);font-weight:900;font-size:34px"><span style="width:56px">${logoSVG()}</span>Canary</div>
<h2 style="position:absolute;left:64px;top:150px;font-size:96px;max-width:640px;line-height:.9;letter-spacing:-.03em;text-shadow:.045em .04em 0 var(--paper)">Send the canary first.</h2>
<p style="position:absolute;left:64px;bottom:56px;font-size:26px;font-weight:600;max-width:560px;margin:0">A Solana extension that tests a site with a decoy wallet before your real wallet connects.</p>
<div id="mphone" style="position:absolute;right:340px;top:70px;transform:scale(.86);transform-origin:top left"></div>
<div id="mcage" style="position:absolute;right:56px;top:30px;width:240px;height:500px"></div>`;
        const ph = $('#mphone', box); const pop = createPopup(ph, { addr: sc0.addr, rows: ev0.rows, verdict: ev0.verdict }, { buttons: false }); pop.goto(4, false);
        const cbb = new CageBird($('#mcage', box), { noHop: true }); cbb.cloth.style.transform = 'translateY(-900px)';
      }
      document.title = 'Store art · ' + name;
    }

    /* ==========================================================
       GLOBAL UI + BOOT
       ========================================================== */
    /* the small canary on the footer edge: breathes, blinks, watches the cursor, sings when clicked */
    function initFooterBird() {
      const h = $('#footBird'); if (!h) return; h.innerHTML = birdSVG('fb');
      const q = s => $(s, h); const head = q('.b-head'), torso = q('.b-torso'), wing = q('.b-wing'), tail = q('.b-tail'), eye = q('.b-eye'), beak = q('.b-beak-low'), all = q('.b-all');
      let busy = false;
      const sing = () => {
        if (busy) return; busy = true; sound.song(); const r = h.getBoundingClientRect();
        for (let i = 0; i < 5; i++) setTimeout(() => noteFly(h, r.width * .9 + i * 4, r.height * .2 + i * 4, i % 2 ? C.Y : C.B), i * 150);
        if (!motionOK()) { setTimeout(() => { busy = false; }, 800); return; }
        gsap.to(beak, { rotation: 24, svgOrigin: '120 51', duration: .12, yoyo: true, repeat: 9 });
        gsap.timeline({ onComplete: () => { busy = false; } }).to(head, { rotation: -16, svgOrigin: '98 46', duration: .18 }).to(all, { scaleY: 1.06, svgOrigin: '80 126', duration: .14, yoyo: true, repeat: 5 }, 0).to(head, { rotation: 0, svgOrigin: '98 46', duration: .25 }, '+=.3');
      };
      h.addEventListener('click', sing); h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sing(); } });
      if (!motionOK()) return;
      gsap.to(torso, { scaleY: 1.035, svgOrigin: '74 112', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const loop = (fn, a, b) => gsap.delayedCall(a + Math.random() * (b - a), () => { if (!document.hidden && !busy) fn(); loop(fn, a, b); });
      loop(() => gsap.fromTo(eye, { scaleY: 1 }, { scaleY: .08, svgOrigin: '106 42', duration: .07, yoyo: true, repeat: 1 }), 2, 5);
      loop(() => gsap.fromTo(tail, { rotation: 0 }, { rotation: -9, svgOrigin: '40 84', duration: .11, yoyo: true, repeat: 5 }), 3, 6);
      loop(() => gsap.fromTo(wing, { rotation: 0 }, { rotation: -12, svgOrigin: '60 76', duration: .09, yoyo: true, repeat: 5 }), 6, 10);
      if (FINE) { let raf = 0; addEventListener('pointermove', e => { if (raf || busy) return; raf = requestAnimationFrame(() => { raf = 0; const r = head.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); gsap.to(head, { rotation: clamp(Math.atan2(dy, Math.abs(dx) + 60) * 57.3, -22, 24), svgOrigin: '98 46', duration: .3, overwrite: 'auto' }); }); }, { passive: true }); }
    }
    function initGlobalUI() {
      initFooterBird(); $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }));
      document.addEventListener('pointerdown', e => { lastClick = { x: e.clientX, y: e.clientY }; }, { passive: true });
      document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href^="#/"]'); if (!a) return;
        e.preventDefault(); const p = a.getAttribute('href').slice(1); navigate(ROUTES.includes(p) ? p : '/');
      });
      addEventListener('hashchange', route);
      addEventListener('keydown', e => {
        if (introRunning) return;
        if (e.key === 'Escape') { if ($('#walletModal').classList.contains('on')) { closeWalletModal(); return; } if ($('#nav').classList.contains('open')) { $('#nav').classList.remove('open'); return; } if (curRoute !== '/' && curRoute !== '/shot') navigate('/'); }
      });
      $('#menuBtn').addEventListener('click', () => { const n = $('#nav'); const o = n.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', String(o)); });
      $('#wClose').addEventListener('click', closeWalletModal);
      $('#walletModal').addEventListener('click', e => { if (e.target.id === 'walletModal') closeWalletModal(); });
      $('#storyReplay').addEventListener('click', replayStory);
      $('#replayIntro').addEventListener('click', e => {
        e.preventDefault(); const go = () => { window.scrollTo(0, 0); root.classList.add('intro-on'); playIntro({ replay: true }); };
        if (curRoute !== '/') { navigate('/'); setTimeout(go, 700); } else go();
      });
      $('[data-skip]').addEventListener('click', e => { e.preventDefault(); const m = $('#main'); m.setAttribute('tabindex', '-1'); m.focus(); });
      document.addEventListener('visibilitychange', () => { if (hasGsap) { document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake(); } });
    }
    async function boot() {
      sound.init(); fillStatic(); renderInstall(); initGlobalUI(); initBg(); initDemo();
      if (!hasGsap) { $('#storyReplay').hidden = true; }
      route();
      cursorBird.setup(); initMagnets(); initTilt();
      if (root.classList.contains('intro-on')) { if (hasGsap) { try { playIntro(); } catch (err) { console.error(err); root.classList.remove('intro-on'); $('#intro').hidden = true; window.__introResolve(); } } else { root.classList.remove('intro-on'); $('#intro').hidden = true; window.__introResolve(); } }
      const w = store.get('wallet', null); if (w && w.id && CFG.features.wallet !== false) { const def = WALLETS.find(x => x.id === w.id); def && connectWallet(def, true); }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { hasST && ScrollTrigger.refresh(); });
    }
    boot();
