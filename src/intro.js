    /* "Down the Shaft": 5 seconds. Dark descent, headlamp, a cage swings in, three doors open
       (singing, singing, silent), the lamp swings up, the walls dissolve to paper and the canary
       settles into the exact hero composition. Built from the site's own data (SC, VERDICT, art). */
    let introRunning = false, introTl = null;
    function playIntro(opts = {}) {
      if (!hasGsap) { window.__introResolve(); root.classList.remove('intro-on'); return; }
      const el = $('#intro'), scene = $('#iScene'), cream = $('#iCream'), hud = $('#iHud'), skip = $('#iSkip');
      introRunning = true; el.hidden = false; el.style.opacity = 1; scene.innerHTML = '';
      const hero = $('#heroCage'); const hr = hero.getBoundingClientRect();
      const doorData = [{ host: 'claim-lunaris-drop.top', v: 'singing' }, { host: 'wallet-verify.app', v: 'singing' }, { host: 'free-mint-now.io', v: 'silent' }];
      /* shaft: walls, rungs, lamp beam, vignette, doors */
      const shaft = document.createElement('div'); shaft.className = 'i-shaft';
      shaft.innerHTML = `<div class="i-wall l"></div><div class="i-wall r"></div><div class="i-rungs"></div>
<div class="i-lamp"><div class="i-cone"></div></div><div class="i-dark"></div>
<div class="i-doors">${doorData.map((d, i) => `<div class="door" data-i="${i}"><div class="behind"><span class="adr">${d.host}</span><span class="dv">${iconSVG(d.v)}</span><span class="dl">${VERDICT[d.v].label.toUpperCase()}</span></div><div class="leaf"><i></i></div></div>`).join('')}</div>`;
      scene.appendChild(shaft); scene.appendChild(cream);
      cream.style.opacity = 0;
      /* the cage clone sits exactly where the hero cage is, so the last frame IS the first frame */
      const ic = document.createElement('div'); ic.className = 'i-cage';
      ic.style.cssText = `position:fixed;left:${hr.left}px;top:${hr.top}px;width:${hr.width}px;height:${hr.height}px;transform-origin:50% 0`;
      scene.appendChild(ic);
      const cb = new CageBird(ic, { noHop: true });
      cb.svg.style.cssText = 'width:100%;height:100%;overflow:visible';
      const stampEl = document.createElement('div'); stampEl.className = 'i-stamp'; stampEl.innerHTML = stampHTML('silent', 'xl'); scene.appendChild(stampEl);
      const q = s => $(s, shaft); const doors = $$('.door', shaft);
      const setHud = t => { hud.textContent = t; };
      const sh = Math.min(.85, (innerHeight * .5) / Math.max(hr.height, 1));
      const cx = innerWidth / 2 - (hr.left + hr.width / 2), cy = innerHeight * .08 - hr.top;
      const bx = () => { const r = hero.getBoundingClientRect(); return { x: 0, y: 0, dx: r.left - hr.left, dy: r.top - hr.top }; };
      /* initial state */
      gsap.set(ic, { x: cx, y: -innerHeight * 1.1, scale: sh, rotation: 0, transformOrigin: '50% 0' });
      gsap.set(cb.head, { rotation: 26, svgOrigin: '98 46' }); gsap.set(cb.eye, { scaleY: .1, svgOrigin: '106 42' });
      gsap.set(q('.i-lamp'), { opacity: 0, rotation: 0, transformOrigin: '50% 0' });
      gsap.set(doors.map(d => $('.leaf', d)), { rotationY: 0, transformOrigin: 'left center' });
      gsap.set($$('.behind', shaft), { opacity: 0 }); gsap.set(stampEl, { opacity: 0 });
      gsap.set(hud, { opacity: 1 }); gsap.set(skip, { opacity: 1 });
      setHud('LEVEL 00 / 03: DESCENDING');
      const rungs = q('.i-rungs'); const ry = { y: 0 };
      const shake = () => gsap.fromTo(ic, { x: '+=0' }, { x: '+=7', duration: .045, yoyo: true, repeat: 9, ease: 'none' });
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish });
      introTl = tl; window.__introTl = tl;
      /* 0.0 - 1.0: dark descent, headlamp */
      tl.to(q('.i-lamp'), { opacity: 1, duration: .5 }, .1)
        .to(q('.i-lamp'), { rotation: 5, duration: .5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, .2)
        .to(ry, { y: -1300, duration: 3.6, ease: 'power1.in', onUpdate: () => { rungs.style.backgroundPosition = `0 ${ry.y}px`; } }, 0)
        .to(q('.i-dark'), { opacity: .55, duration: 1.4 }, 0)
        /* 1.0 - 1.8: the cage swings in, the canary wakes */
        .to(ic, { y: cy, duration: .8, ease: 'power3.out' }, 1.0)
        .fromTo(ic, { rotation: 11 }, { rotation: 0, duration: .9, ease: 'elastic.out(1,.35)' }, 1.45)
        .call(() => setHud('LEVEL 00 / 03: WAKING'), null, 1.2)
        .to(cb.eye, { scaleY: 1, duration: .15 }, 1.62).to(cb.head, { rotation: 0, svgOrigin: '98 46', duration: .3 }, 1.66)
        .call(() => sound.chirp(), null, 1.7)
        .to(q('.i-dark'), { opacity: .15, duration: .5 }, 1.5);
      /* 1.8 - 3.6: three doors, ~0.6s each */
      doors.forEach((d, i) => {
        const t = 1.8 + i * .6; const leaf = $('.leaf', d), behind = $('.behind', d); const silent = doorData[i].v === 'silent';
        tl.call(() => setHud(`LEVEL 0${i + 1} / 03: ${silent ? 'SILENT' : 'SINGING'}`), null, t)
          .set(behind, { opacity: 1 }, t)
          .to(leaf, { rotationY: -108, duration: .28, ease: 'power2.out' }, t);
        if (!silent) {
          tl.call(() => { cb.mouth(true); sound.chirp(); const b = cb.head.getBoundingClientRect(), r = ic.getBoundingClientRect(); noteFly(ic, b.right - r.left, b.top - r.top, C.INK); }, null, t + .22)
            .call(() => cb.mouth(false), null, t + .5)
            .to(cb.head, { rotation: -12, svgOrigin: '98 46', duration: .15, yoyo: true, repeat: 1 }, t + .22);
        } else {
          tl.call(() => { shake(); sound.flutter(); }, null, t + .22)
            .to([cb.ruff, cb.crest], { opacity: 1, duration: .15 }, t + .2)
            .to(cb.cloth, { y: 0, duration: .45, ease: 'bounce.out' }, t + .3)
            .call(() => sound.quiet(), null, t + .34)
            .fromTo(stampEl, { opacity: 0, scale: 2.6, rotation: -16, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1, rotation: -6, xPercent: -50, yPercent: -50, duration: .22, ease: 'back.out(2)' }, t + .5)
            .call(() => { sound.thud(); const r = stampEl.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 'dust', 14); }, null, t + .52);
        }
      });
      /* 3.6 - 4.3: the lamp swings up, the walls dissolve to paper */
      tl.call(() => setHud(''), null, 3.62)
        .to(q('.i-lamp'), { rotation: -95, opacity: 0, duration: .6, ease: 'power2.in' }, 3.6)
        .to(cream, { opacity: 1, duration: .7, ease: 'power1.inOut' }, 3.65)
        .to(stampEl, { opacity: 0, scale: .9, duration: .3 }, 3.7)
        .to(cb.cloth, { y: -900, duration: .45, ease: 'power2.in' }, 3.7)
        .to([cb.ruff, cb.crest], { opacity: 0, duration: .2 }, 3.8)
        .to([hud, skip], { opacity: 0, duration: .4 }, 3.8)
        /* 4.3 - 5.0: the canary perks up and the cage settles into the hero */
        .to(ic, { x: () => bx().dx, y: () => bx().dy, scale: 1, rotation: 0, duration: .7, ease: 'power3.inOut' }, 4.3)
        .call(() => { sound.chirp(); gsap.fromTo(cb.g, { y: '-=12' }, { y: '+=0', duration: .5, ease: 'bounce.out' }); }, null, 4.55)
        .to({}, { duration: 0 }, 5);
      tl.duration(5);
      const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); skipIntro(); } };
      const onClick = () => skipIntro();
      const off = () => { removeEventListener('keydown', onKey, true); el.removeEventListener('click', onClick); };
      addEventListener('keydown', onKey, true); el.addEventListener('click', onClick);
      skip.onclick = e => { e.stopPropagation(); skipIntro(); };
      function skipIntro() { if (!introRunning) return; tl.kill(); off(); gsap.to(el, { opacity: 0, duration: .22, onComplete: finish }); }
      function finish() {
        if (!introRunning) return; introRunning = false; off();
        root.classList.remove('intro-on');
        if (!opts.replay) { store.sset('intro-seen', 1); try { sessionStorage.setItem('cn:intro-seen', '1'); } catch (e) { } }
        gsap.to(el, { opacity: 0, duration: .18, onComplete: () => { el.hidden = true; el.style.opacity = 1; cb.destroy(); scene.innerHTML = ''; } });
        window.__introResolve && window.__introResolve();
        if (opts.replay) scramble($('#heroH'), 'Send the canary first.');
      }
    }
