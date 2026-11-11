    /* ==========================================================
       THE CAGE + CANARY (hero, intro, check page share this)
       ========================================================== */
    const SPOTS = [{ x: 100, perch: 283 }, { x: 202, perch: 283 }, { x: 150, perch: 229 }];
    const BS = .78; /* bird scale inside the cage */
    function noteFly(host, x, y, col) {
      if (!motionOK()) return;
      const n = document.createElement('span'); n.className = 'note';
      n.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none;z-index:6`;
      n.innerHTML = noteSVG(col || C.INK, 20 + Math.random() * 10);
      host.appendChild(n);
      gsap.fromTo(n, { opacity: 0, scale: .4, rotation: -10 }, { opacity: 1, scale: 1, duration: .2 });
      gsap.to(n, { x: 24 + Math.random() * 46, y: -(60 + Math.random() * 60), rotation: 18, opacity: 0, duration: 1.3 + Math.random() * .5, delay: .18, ease: 'power1.out', onComplete: () => n.remove() });
    }

    class CageBird {
      constructor(host, opts = {}) {
        this.host = host; this.opts = opts; this.spot = 0; this.flip = false; this.covered = false; this.T = []; this.dead = false;
        this.asleep = false; this.lastAct = performance.now(); this.lastMove = 0; this.lastStartle = 0; this.mx = -1e4; this.my = -1e4;
        host.innerHTML = cageSVG();
        this.svg = host.querySelector('svg'); this.slot = host.querySelector('[data-bird]');
        this.slot.innerHTML = `<g class="cb-bird">${birdG()}</g>`;
        this.g = this.slot.firstChild; this.q = s => this.g.querySelector(s);
        this.all = this.q('.b-all'); this.head = this.q('.b-head'); this.wing = this.q('.b-wing'); this.tail = this.q('.b-tail'); this.torso = this.q('.b-torso');
        this.beakLow = this.q('.b-beak-low'); this.eye = this.q('.b-eye'); this.lid = this.q('.b-lid');
        this.ruff = this.q('.b-ruff'); this.crest = this.q('.b-crest'); this.tuft = this.q('.b-tuft');
        this.cloth = host.querySelector('.cloth'); this.sway = host.querySelector('.cage-sway'); this.bell = host.querySelector('.c-bell');
        if (opts.rope === false) { const rp = host.querySelector('.c-rope'); if (rp) rp.setAttribute('d', 'M150 -26V42'); }
        this.place(0, false, true);
        if (this.cloth) this.cloth.style.transform = 'translateY(-900px)';
        if (hasGsap) { gsap.set(this.cloth, { y: -900 }); this.startIdle(); }
        if (opts.interactive) this.bind();
      }
      pos(i, flip) { const s = SPOTS[i]; return { x: s.x + (flip ? 80 * BS : -80 * BS), y: s.perch - 130 * BS, scaleX: flip ? -BS : BS, scaleY: BS }; }
      place(i, flip) {
        this.spot = i; this.flip = flip; const p = this.pos(i, flip);
        if (hasGsap) gsap.set(this.g, { ...p, svgOrigin: '0 0' });
        else this.g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${p.scaleX} ${p.scaleY})`);
      }
      /* ---- life: breathing, blinking, tail, pecking, preening, looking around, ringing the bell ---- */
      startIdle() {
        if (!motionOK()) return;
        this.T.push(gsap.to(this.sway, { rotation: 1.6, svgOrigin: '150 -28', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        this.breath = gsap.to(this.torso, { scaleY: 1.035, svgOrigin: '74 112', duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }); this.T.push(this.breath);
        this.T.push(gsap.to(this.tuft, { rotation: 4, svgOrigin: '98 24', duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        const loop = (fn, a, b) => { const c = gsap.delayedCall(a + Math.random() * (b - a), () => { if (!this.dead && !document.hidden && !this.asleep) fn(); loop(fn, a, b); }); this.T.push(c); };
        const calm = () => !this.busy && !this.covered && !this.singing && !this.hovering;
        loop(() => this.blink(), 1.8, 4.6);
        loop(() => this.flutter(), 4, 8);
        loop(() => this.tailWag(), 2.5, 5.5);
        loop(() => { if (calm()) this.lookAround(); }, 3, 6);
        loop(() => { if (calm()) this.peck(); }, 6, 11);
        loop(() => { if (calm()) this.preen(); }, 10, 17);
        if (!this.opts.noHop) loop(() => { if (calm()) this.hop(); }, 4, 7);
      }
      blink() { if (this.asleep || this.covered) return; gsap.fromTo(this.eye, { scaleY: 1 }, { scaleY: .08, svgOrigin: '106 42', duration: .07, yoyo: true, repeat: 1 }); }
      flutter() { if (this.covered) return; gsap.fromTo(this.wing, { rotation: 0 }, { rotation: -11, svgOrigin: '60 76', duration: .09, yoyo: true, repeat: 5, ease: 'sine.inOut' }); }
      tailWag() { gsap.fromTo(this.tail, { rotation: 0 }, { rotation: -8, svgOrigin: '40 84', duration: .11, yoyo: true, repeat: 5, ease: 'sine.inOut' }); }
      lookAround() {
        const d = Math.random() < .5 ? -1 : 1; const tl = gsap.timeline();
        tl.to(this.eye, { x: 2.6 * d, y: -1, duration: .12 }, 0).to(this.head, { rotation: 9 * d, svgOrigin: '98 46', duration: .3, ease: 'power2.out' }, 0)
          .to(this.head, { rotation: -6 * d, svgOrigin: '98 46', duration: .35, ease: 'power2.inOut' }, '+=.5')
          .to(this.eye, { x: 0, y: 0, duration: .12 }, '<').to(this.head, { rotation: 0, svgOrigin: '98 46', duration: .3 }, '+=.3');
      }
      peck() {
        if (this.spot === 2) return;
        const tl = gsap.timeline(); const d = 34;
        for (let i = 0; i < 3; i++) tl.to(this.head, { rotation: d, svgOrigin: '98 46', duration: .1, ease: 'power2.in' }).to(this.head, { rotation: 4, svgOrigin: '98 46', duration: .12, ease: 'power2.out' }, '+=.04');
        tl.to(this.head, { rotation: 0, svgOrigin: '98 46', duration: .2 }); sound.chirp && Math.random() < .3 && sound.tone(1800, 1500, .05, 0, .02);
      }
      preen() {
        const tl = gsap.timeline();
        tl.to(this.head, { rotation: 52, svgOrigin: '98 46', duration: .3, ease: 'power2.out' }).to(this.wing, { rotation: -16, svgOrigin: '60 76', duration: .3 }, 0)
          .to(this.head, { rotation: 44, svgOrigin: '98 46', duration: .1, yoyo: true, repeat: 5 }).to(this.head, { rotation: 0, svgOrigin: '98 46', duration: .3 }).to(this.wing, { rotation: 0, svgOrigin: '60 76', duration: .3 }, '<');
      }
      ring() { if (!this.bell || !motionOK()) return; gsap.fromTo(this.bell, { rotation: -16 }, { rotation: 0, svgOrigin: '222 150', duration: 1.4, ease: 'elastic.out(1,.25)' }); sound.tone(2600, 2500, .5, 0, .03); }
      hop(to) {
        if (!motionOK() || this.covered || this.asleep) return;
        let n = to != null ? to : (this.spot + 1 + Math.floor(Math.random() * 2)) % SPOTS.length;
        if (n === this.spot) n = (n + 1) % SPOTS.length;
        const flip = SPOTS[n].x < SPOTS[this.spot].x;
        const a = this.pos(this.spot, this.flip), b = this.pos(n, flip); this.spot = n; this.flip = flip; this.busy = true;
        const mid = Math.min(a.y, b.y) - 40;
        gsap.timeline({ onComplete: () => { this.busy = false; } })
          .to(this.all, { scaleY: .88, svgOrigin: '80 126', duration: .08, yoyo: true, repeat: 1 }, 0)
          .set(this.g, { scaleX: b.scaleX }, .08)
          .to(this.g, { x: b.x, duration: .46, ease: 'power1.inOut' }, .08)
          .to(this.g, { y: mid, duration: .23, ease: 'power2.out' }, .08)
          .to(this.g, { y: b.y, duration: .23, ease: 'power2.in' }, .31)
          .to(this.all, { scaleY: 1.07, svgOrigin: '80 126', duration: .12, yoyo: true, repeat: 1 }, .12)
          .fromTo(this.wing, { rotation: 0 }, { rotation: -34, svgOrigin: '60 76', duration: .07, yoyo: true, repeat: 7 }, .08)
          .to(this.tail, { rotation: 10, svgOrigin: '40 84', duration: .2, yoyo: true, repeat: 1 }, .1)
          .call(() => { if (n === 2) this.ring(); }, null, .54);
        sound.chirp();
      }
      look(cx, cy) {
        if (!motionOK() || this.covered || this.singing || this.asleep) return;
        const r = this.head.getBoundingClientRect(); const hx = r.left + r.width / 2, hy = r.top + r.height / 2;
        const dx = cx - hx, dy = cy - hy; const wantFlip = dx < -30;
        if (wantFlip !== this.flip && !this.busy && Math.abs(dx) > 60) { this.flip = wantFlip; const p = this.pos(this.spot, wantFlip); gsap.to(this.g, { x: p.x, scaleX: p.scaleX, duration: .25, ease: 'power2.out' }); }
        const ang = clamp(Math.atan2(dy, Math.abs(dx) + 40) * 57.3, -24, 26);
        gsap.to(this.head, { rotation: ang, svgOrigin: '98 46', duration: .3, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(this.eye, { x: clamp(Math.abs(dx) / 90, 0, 2.6), y: clamp(dy / 70, -2, 2), duration: .2, overwrite: 'auto' });
      }
      startle() {
        const now = performance.now(); if (now - this.lastStartle < 2600 || this.covered || this.asleep || this.busy || !motionOK()) return; this.lastStartle = now; this.busy = true;
        const p = this.pos(this.spot, this.flip); this.puff(true);
        gsap.timeline({ onComplete: () => { this.busy = false; this.puff(false); } })
          .to(this.eye, { scale: 1.3, svgOrigin: '106 42', duration: .08 }, 0)
          .to(this.g, { y: p.y - 22, duration: .12, ease: 'power2.out' }, 0).to(this.g, { y: p.y, duration: .22, ease: 'bounce.out' }, .12)
          .fromTo(this.wing, { rotation: 0 }, { rotation: -40, svgOrigin: '60 76', duration: .06, yoyo: true, repeat: 7 }, 0)
          .to(this.eye, { scale: 1, svgOrigin: '106 42', duration: .2 }, .7);
        sound.chirp(); this.ring();
      }
      curious() {
        if (this.covered || this.asleep || this.busy || this.singing || !motionOK()) return;
        gsap.timeline().to(this.head, { rotation: 14, svgOrigin: '98 46', duration: .18 }).to(this.head, { rotation: -8, svgOrigin: '98 46', duration: .22, yoyo: true, repeat: 3 }).to(this.head, { rotation: 0, svgOrigin: '98 46', duration: .25 });
      }
      sleepy(on) {
        if (!motionOK() || this.asleep === on || this.covered) return; this.asleep = on;
        gsap.to(this.eye, { opacity: on ? 0 : 1, duration: .2 }); gsap.to(this.lid, { opacity: on ? 1 : 0, duration: .2 });
        gsap.to(this.head, { rotation: on ? 22 : 0, svgOrigin: '98 46', duration: .6, ease: 'power2.inOut', overwrite: 'auto' });
        if (this.breath) this.breath.timeScale(on ? .45 : 1);
        clearInterval(this._z);
        if (on) { this._z = setInterval(() => { if (!document.hidden) this.zzz(); }, 1700); this.zzz(); }
        else { this.blink(); sound.chirp(); }
      }
      zzz() {
        const r = this.host.getBoundingClientRect(), b = this.head.getBoundingClientRect(); if (!motionOK()) return;
        const z = document.createElement('span'); z.textContent = 'z'; z.style.cssText = `position:absolute;left:${b.right - r.left - 6}px;top:${b.top - r.top}px;pointer-events:none;font:900 22px var(--f-head);color:var(--ink);z-index:6`;
        this.host.appendChild(z); gsap.fromTo(z, { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: .3 }); gsap.to(z, { y: -54, x: 20, opacity: 0, rotation: 14, duration: 2, delay: .3, ease: 'power1.out', onComplete: () => z.remove() });
      }
      mouth(open) { gsap.to(this.beakLow, { rotation: open ? 24 : 0, svgOrigin: '120 51', duration: .12, overwrite: 'auto' }); }
      sing() {
        if (this.covered || this.singing) return; if (this.asleep) this.sleepy(false); this.singing = true; sound.song();
        const r = this.host.getBoundingClientRect(); const b = this.head.getBoundingClientRect();
        const bx = b.right - r.left, by = b.top - r.top;
        if (!motionOK()) { this.mouth(true); noteFly(this.host, bx, by); setTimeout(() => { this.singing = false; }, 600); return; }
        this.mouth(true);
        const tl = gsap.timeline({ onComplete: () => { this.singing = false; this.mouth(false); } });
        tl.to(this.head, { rotation: -18, svgOrigin: '98 46', duration: .18 })
          .to(this.all, { scaleY: 1.06, scaleX: 1.02, svgOrigin: '80 126', duration: .14, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0)
          .to(this.head, { rotation: -8, duration: .2, yoyo: true, repeat: 3, svgOrigin: '98 46' }, .18)
          .to(this.wing, { rotation: -14, svgOrigin: '60 76', duration: .12, yoyo: true, repeat: 7 }, 0)
          .to(this.tail, { rotation: -9, svgOrigin: '40 84', duration: .14, yoyo: true, repeat: 5 }, 0)
          .to(this.head, { rotation: 0, duration: .2, svgOrigin: '98 46' });
        for (let i = 0; i < 6; i++) setTimeout(() => { if (!this.dead) { this.mouth(i % 2 === 0); noteFly(this.host, bx + i * 4, by + i * 6, i % 2 ? C.INK : (i % 3 ? C.T : C.OR)); } }, i * 160);
        setTimeout(() => this.mouth(false), 6 * 160);
      }
      cover() {
        if (this.covered) return; if (this.asleep) this.sleepy(false); this.covered = true;
        if (!motionOK()) { this.cloth.style.transform = 'translateY(0)'; this.opts.onCover && this.opts.onCover(true); return; }
        gsap.to(this.cloth, { y: 0, duration: .65, ease: 'bounce.out' });
        gsap.fromTo(this.svg, { x: 0 }, { x: 4, duration: .05, repeat: 9, yoyo: true, delay: .25, clearProps: 'x' });
        this.puff(true); sound.quiet(); setTimeout(() => sound.thud(), 220);
        const r = this.host.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height * .8, 'dust', 14);
        this.opts.onCover && this.opts.onCover(true);
      }
      uncover() {
        if (!this.covered) return; this.covered = false;
        if (!motionOK()) { this.cloth.style.transform = 'translateY(-900px)'; this.opts.onCover && this.opts.onCover(false); return; }
        gsap.to(this.cloth, { y: -900, duration: .5, ease: 'power2.in', onComplete: () => { this.puff(false); this.chirpUp(); } });
        this.opts.onCover && this.opts.onCover(false);
      }
      chirpUp() { sound.chirp(); if (motionOK()) { const y = this.pos(this.spot, this.flip).y; gsap.fromTo(this.g, { y: y - 14 }, { y, duration: .5, ease: 'bounce.out' }); gsap.fromTo(this.wing, { rotation: 0 }, { rotation: -30, svgOrigin: '60 76', duration: .07, yoyo: true, repeat: 5 }); } }
      puff(on) {
        if (!hasGsap) return;
        gsap.to([this.ruff, this.crest], { opacity: on ? 1 : 0, duration: .15 }); gsap.to(this.tuft, { opacity: on ? 0 : 1, duration: .15 });
        gsap.to(this.q('.b-body'), { scale: on ? 1.05 : 1, svgOrigin: '74 80', duration: .2 });
      }
      bind() {
        const h = this.host; let hold = null, held = false;
        const poke = () => { this.lastAct = performance.now(); if (this.asleep) this.sleepy(false); };
        const down = e => { if (e.button > 0) return; poke(); held = false; hold = setTimeout(() => { held = true; this.cover(); }, 380); };
        const up = () => { clearTimeout(hold); if (held) { this.uncover(); held = false; } };
        h.addEventListener('pointerdown', down); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        h.addEventListener('click', () => { if (!this.covered) this.sing(); });
        h.addEventListener('keydown', e => {
          poke();
          if (e.key === 'Enter' && !e.shiftKey || e.key === ' ') { e.preventDefault(); if (!this.covered) this.sing(); }
          else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); this.covered ? this.uncover() : this.cover(); }
        });
        h.addEventListener('contextmenu', e => e.preventDefault());
        let lt = performance.now(), lx = 0, ly = 0;
        this._move = e => {
          if (!FINE || document.hidden) return; poke(); const now = performance.now();
          const dt = Math.max(1, now - lt), sp = Math.hypot(e.clientX - lx, e.clientY - ly) / dt; lt = now; lx = e.clientX; ly = e.clientY; this.lastMove = now; this.mx = e.clientX; this.my = e.clientY;
          const r = h.getBoundingClientRect(); const near = e.clientX > r.left - 140 && e.clientX < r.right + 140 && e.clientY > r.top - 100 && e.clientY < r.bottom + 100;
          if (near && sp > 2.4) this.startle();
          if (this._lk) return; this._lk = requestAnimationFrame(() => { this._lk = 0; this.look(e.clientX, e.clientY); });
        };
        addEventListener('pointermove', this._move, { passive: true });
        addEventListener('keydown', poke, { passive: true }); addEventListener('scroll', poke, { passive: true });
        h.addEventListener('pointerenter', () => { this.hovering = true; }); h.addEventListener('pointerleave', () => { this.hovering = false; });
        /* falls asleep when nobody has touched the page for a while, wakes on any movement */
        this._sleep = setInterval(() => {
          const now = performance.now(); if (document.hidden || this.covered) return;
          const r = h.getBoundingClientRect(); const seen = r.bottom > 0 && r.top < innerHeight;
          if (seen && now - this.lastAct > 24000) this.sleepy(true);
          else if (this.hovering && !this.busy && now - this.lastMove > 1600 && Math.random() < .5) this.curious();
        }, 1800);
      }
      destroy() { this.dead = true; clearInterval(this._z); clearInterval(this._sleep); this.T.forEach(t => t.kill && t.kill()); this._move && removeEventListener('pointermove', this._move); if (hasGsap) gsap.killTweensOf([this.g, this.all, this.head, this.wing, this.tail, this.torso, this.beakLow, this.cloth, this.sway, this.eye, this.bell, this.tuft]); }
    }

    /* ==========================================================
       CURSOR BIRD: follows the pointer, reacts to what it passes
       ========================================================== */
    const cursorBird = (() => {
      const el = $('#cursorBird'); let on = false, x = 0, y = 0, tx = 0, ty = 0, lastX = 0, face = 1, over = null, lastCheck = 0, drag = false, mode = null;
      let g, wrap, ruff, crest, wingEl, tailEl, lastRot = 0;
      function setup() {
        if (RM || !hasGsap) return;
        mode = FINE ? 'follow' : 'drag';
        el.innerHTML = birdSVG('cbird');
        wrap = el.firstChild; g = wrap; ruff = el.querySelector('.b-ruff'); crest = el.querySelector('.b-crest'); wingEl = el.querySelector('.b-wing'); tailEl = el.querySelector('.b-tail');
        if (mode === 'follow') {
          addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tx = e.clientX + 18; ty = e.clientY + 16; if (!on) { x = tx; y = ty; on = true; el.classList.add('on'); } }, { passive: true });
          document.addEventListener('mouseleave', () => { on = false; el.classList.remove('on'); });
        } else {
          el.classList.add('drag-bird'); el.style.pointerEvents = 'auto'; x = tx = innerWidth - 74; y = ty = innerHeight - 110; on = true; el.classList.add('on');
          el.setAttribute('role', 'img'); el.setAttribute('aria-hidden', 'true');
          el.addEventListener('pointerdown', e => { drag = true; el.setPointerCapture(e.pointerId); e.preventDefault(); });
          el.addEventListener('pointermove', e => { if (!drag) return; tx = e.clientX - 28; ty = e.clientY - 24; x = tx; y = ty; });
          el.addEventListener('pointerup', () => { drag = false; });
        }
        requestAnimationFrame(loop);
      }
      function react(now) {
        if (now - lastCheck < 110) return; lastCheck = now;
        const px = x + 10, py = y + 10; el.style.visibility = 'hidden';
        const t = document.elementFromPoint(mode === 'follow' ? tx - 18 : x + 28, mode === 'follow' ? ty - 16 : y + 24); el.style.visibility = '';
        const fake = t && t.closest && t.closest('[data-fake]'), trust = t && t.closest && t.closest('[data-trust]');
        const cur = fake || trust || null;
        if (cur === over) return;
        if (over) { over.classList.remove('stamped', 'perked'); }
        over = cur;
        gsap.killTweensOf(el.firstChild.querySelector('.b-head'));
        if (fake) {
          fake.classList.add('stamped'); wrapState('puff');
          const r = fake.getBoundingClientRect(); fx.burst(r.left + r.width - 60, r.top + 60, 'dust', 10); sound.thud();
        } else if (trust) { trust.classList.add('perked'); wrapState('perk'); sound.chirp(); }
        else wrapState('calm');
      }
      function wrapState(s) {
        const head = el.querySelector('.b-head'), beak = el.querySelector('.b-beak-low');
        gsap.to(ruff, { opacity: s === 'puff' ? 1 : 0, duration: .15 }); gsap.to(crest, { opacity: s === 'puff' ? 1 : 0, duration: .15 });
        gsap.to(head, { rotation: s === 'perk' ? -16 : s === 'puff' ? 8 : 0, svgOrigin: '98 46', duration: .25 });
        gsap.to(beak, { rotation: s === 'perk' ? 22 : 0, svgOrigin: '120 51', duration: .15 });
        gsap.fromTo(el.firstChild, { y: 0 }, { y: s === 'calm' ? 0 : -8, duration: .18, yoyo: true, repeat: 1 });
      }
      function loop(now) {
        if (!document.hidden && on) {
          x += (tx - x) * .16; y += (ty - y) * .16;
          const spd = Math.hypot(tx - x, ty - y);
          const rot = spd > 5 ? Math.sin(now / 38) * clamp(spd * .9, 10, 34) : spd > 1.5 ? Math.sin(now / 60) * 8 : 0;
          if (Math.abs(rot - lastRot) > .5 || rot === 0 && lastRot !== 0) { lastRot = rot; gsap.set(wingEl, { rotation: rot, svgOrigin: '60 76' }); gsap.set(tailEl, { rotation: -rot * .3, svgOrigin: '40 84' }); }
          const vx = tx - lastX; if (Math.abs(vx) > 3) { face = vx < 0 ? -1 : 1; lastX = tx; }
          el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scaleX(${face})`;
          react(now);
        }
        requestAnimationFrame(loop);
      }
      return { setup };
    })();

    /* ==========================================================
       HALFTONE SUN (hero) + background dots. Cheap: redraws on pointer moves only.
       ========================================================== */
    function initSun() {
      const cv = $('#sun'), ctx = cv.getContext('2d'); let w = 0, h = 0, dpr = 1, px = .5, py = .5, raf = 0, vis = true;
      const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
      function draw() {
        raf = 0; if (!w) return; ctx.clearRect(0, 0, w, h);
        const R = Math.min(w, h) * .46, cx = w * .5, cy = h * .52, step = Math.max(11, Math.round(R / 22));
        const mx = px * w, my = py * h;
        for (let y = cy - R - step; y < cy + R + step; y += step) {
          const row = Math.round((y - cy) / step);
          for (let x0 = cx - R - step; x0 < cx + R + step; x0 += step) {
            const x = x0 + (row % 2 ? step / 2 : 0); const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
            if (d > R) continue;
            const edge = d / R; let r = step * .62 * (1 - edge * edge * .55);
            const dm = Math.hypot(x - mx, y - my); r += Math.max(0, 1 - dm / 140) * step * .35;
            ctx.fillStyle = edge > .86 ? '#FFE79A' : '#FFD23F';
            ctx.beginPath(); ctx.arc(x, y, Math.max(.6, r), 0, 7); ctx.fill();
          }
        }
      }
      const req = () => { if (!raf && vis && !document.hidden) raf = requestAnimationFrame(draw); };
      size(); addEventListener('resize', size);
      new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) req(); }).observe(cv);
      if (FINE && !RM) addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height; req(); }, { passive: true });
    }
    function initBg() {
      const cv = $('#bg'), ctx = cv.getContext('2d');
      const paint = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
        const blob = (cx, cy, R, col) => { const s = 14; ctx.fillStyle = col; for (let y = cy - R; y < cy + R; y += s) for (let x = cx - R; x < cx + R; x += s) { const d = Math.hypot(x - cx, y - cy); if (d > R) continue; const r = (1 - d / R) * s * .42; if (r > .5) { ctx.beginPath(); ctx.arc(x + ((y / s | 0) % 2 ? s / 2 : 0), y, r, 0, 7); ctx.fill(); } } };
        blob(w * 1.02, h * .06, Math.min(w, 760) * .55, 'rgba(242,183,5,.26)');
        blob(-w * .02, h * .98, Math.min(w, 700) * .45, 'rgba(230,57,70,.14)');
      };
      paint(); let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(paint, 150); });
    }
