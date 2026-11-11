    /* ==========================================================
       CORE: helpers, storage, sound, icons, canary + cage art
       ========================================================== */
    const CFG = window.CANARY_CONFIG;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const hasGsap = typeof window.gsap !== 'undefined';
    const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap && hasST) gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    if (!hasGsap) root.classList.add('nogsap');
    const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let RM = rmQuery.matches;
    root.classList.toggle('rm', RM);
    rmQuery.addEventListener && rmQuery.addEventListener('change', e => { RM = e.matches; root.classList.toggle('rm', RM); });
    const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const motionOK = () => hasGsap && !RM;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const fmtN = n => Number(n).toLocaleString('en-US');

    /* ---------- storage (always wrapped) ---------- */
    const store = {
      get(k, d) { try { const v = localStorage.getItem('cn:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem('cn:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
      sget(k, d) { try { const v = sessionStorage.getItem('cn:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      sset(k, v) { try { sessionStorage.setItem('cn:' + k, JSON.stringify(v)); } catch (e) { } }
    };

    /* ---------- toast ---------- */
    let toastT;
    function toast(msg) {
      const t = $('#toast'); t.textContent = msg; t.classList.add('on');
      clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
    }

    /* ---------- sound: generated, off by default ---------- */
    const sound = {
      on: false, ctx: null,
      init() {
        this.on = CFG.features.sound !== false && !!store.get('sound', false);
        const b = $('#soundBtn');
        if (CFG.features.sound === false) { b.hidden = true; return; }
        this.paint();
        b.addEventListener('click', () => {
          this.on = !this.on; store.set('sound', this.on); this.paint();
          if (this.on) { this.ensure(); this.chirp(); }
        });
      },
      paint() {
        const b = $('#soundBtn');
        b.setAttribute('aria-pressed', String(this.on));
        b.title = this.on ? 'Sound is on' : 'Sound is off';
        b.setAttribute('aria-label', this.on ? 'Sound on. Turn off' : 'Sound off. Turn on');
        b.innerHTML = this.on
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
      },
      ensure() {
        if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { this.ctx = new AC(); } catch (e) { return null; } }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      },
      tone(f0, f1, d, at = 0, vol = .06, type = 'sine') {
        const c = this.ensure(); if (!c) return;
        const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d * .8);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .03);
      },
      chirp() { if (!this.on) return; this.tone(2300, 3600, .11); this.tone(3400, 2500, .09, .12); },
      song() {
        if (!this.on) return;
        [[2200, 3000], [3100, 3900], [2800, 2300], [3300, 4100], [2600, 3500], [3800, 2900]].forEach((p, i) => this.tone(p[0], p[1], .13, i * .15, .055));
      },
      flutter() {
        if (!this.on) return; const c = this.ensure(); if (!c) return;
        const len = c.sampleRate * .5, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (.5 + .5 * Math.sin(i / c.sampleRate * 2 * Math.PI * 24));
        const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = buf; f.type = 'lowpass'; f.frequency.value = 520; g.gain.setValueAtTime(.12, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .48);
        s.connect(f).connect(g).connect(c.destination); s.start();
      },
      thud() {
        if (!this.on) return; const c = this.ensure(); if (!c) return;
        this.tone(130, 44, .22, 0, .16);
      },
      alarm() { if (!this.on) return; [[1500, 900], [1500, 900], [1100, 600]].forEach((p, i) => this.tone(p[0], p[1], .18, i * .22, .07, 'triangle')); },
      quiet() { if (!this.on) return; this.tone(900, 260, .4, 0, .05); }
    };

    /* ==========================================================
       ART: canary, cage, icons, logo (all original SVG)
       ========================================================== */
    const C = { Y: '#FFD23F', G: '#F2B705', B: '#FFE79A', INK: '#14213D', OR: '#F2842C', OR2: '#D96A1A', T: '#E63946', CREAM: '#FFF6DC' };

    /* the bird, facing right, in a 160x140 box. Hooks: .b-head .b-wing .b-tail .b-torso .b-beak-low .b-eye .b-lid .b-ruff .b-tuft */
    function birdG(opts = {}) {
      const dash = opts.ruffled ? ' stroke-dasharray="5 4"' : '';
      const BR = '#D9A21B';
      const ink = (d, w = 2.4) => `<g class="b-ink" transform="translate(2.4 2.2)" fill="none" stroke="${C.INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${dash}><path d="${d}"/></g>`;
      const scal = (pts, col, op) => `<path d="${pts.map(([x, y]) => `M${x} ${y}q4 5 8 0`).join('')}" fill="none" stroke="${col}" stroke-width="1.9" stroke-linecap="round" opacity="${op}"/>`;
      return `<g class="b-all">
<g class="b-ruff" opacity="${opts.ruffled ? 1 : 0}">
  <path d="M36 62 L20 48 L44 54Z M54 46 L44 28 L66 42Z M78 40 L78 20 L92 38Z M104 52 L124 44 L112 64Z" fill="${C.G}"/>
  <path d="M30 86 L12 90 L32 98Z M40 104 L28 120 L52 110Z" fill="${C.G}"/>
</g>
<g class="b-tail">
  <path d="M40 78L3 66L13 81Z" fill="${C.G}"/><path d="M40 84L0 87L13 97Z" fill="${BR}"/><path d="M40 90L5 107L23 101Z" fill="${C.G}"/>
  ${ink('M40 78L3 66L13 81L0 87L13 97L5 107L23 101L40 92')}
</g>
<g class="b-legs" stroke="${C.OR}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M68 112V128M61 130H75M65 126l-2 4M71 126l2 4"/><path d="M90 110V128M83 130H97M87 126l-2 4M93 126l2 4"/></g>
<g class="b-torso">
  <path class="b-body" d="M30 78C26 50 50 36 78 38C108 40 124 60 118 86C112 108 84 118 58 112C40 108 32 96 30 78Z" fill="${C.Y}"/>
  <ellipse cx="80" cy="98" rx="27" ry="12" fill="${C.B}"/>
  <path d="M104 62C112 70 116 80 112 92" fill="none" stroke="${C.B}" stroke-width="5" stroke-linecap="round" opacity=".7"/>
  ${scal([[58, 94], [72, 100], [86, 94], [66, 106], [80, 108]], BR, .6)}${scal([[50, 54], [62, 47], [76, 44]], BR, .55)}
  ${ink('M30 78C26 50 50 36 78 38C108 40 124 60 118 86C112 108 84 118 58 112C40 108 32 96 30 78Z')}
</g>
<g class="b-wing">
  <path d="M50 82L22 96L40 94L26 106L54 94Z" fill="${BR}"/>
  <path d="M44 70C60 56 94 60 102 80C86 96 56 94 44 70Z" fill="${C.G}"/>
  <path d="M52 74L88 82M54 81L84 91M62 66L94 76" stroke="${BR}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <g fill="${C.INK}" opacity=".22"><circle cx="70" cy="72" r="1.7"/><circle cx="78" cy="68" r="1.7"/><circle cx="86" cy="72" r="1.7"/><circle cx="74" cy="78" r="1.7"/><circle cx="82" cy="80" r="1.7"/><circle cx="66" cy="80" r="1.7"/></g>
  ${ink('M44 70C60 56 94 60 102 80C86 96 56 94 44 70Z')}
</g>
<g class="b-head">
  <path class="b-crest" d="M84 26L80 6L92 18L98 2L104 20L116 10L112 30Z" fill="${C.G}" opacity="${opts.ruffled ? 1 : 0}"/>
  <path class="b-tuft" d="M88 26L85 13L93 21L98 10L102 22L109 14L108 29Z" fill="${C.G}"/>
  <circle cx="98" cy="46" r="24" fill="${C.Y}"/>
  <path d="M82 36C86 28 94 25 102 26" fill="none" stroke="${C.B}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
  <circle cx="95" cy="57" r="5.5" fill="${C.T}" opacity=".34"/>
  <g class="b-ink" transform="translate(2.4 2.2)" fill="none" stroke="${C.INK}" stroke-width="2.4" stroke-linejoin="round"${dash}><circle cx="98" cy="46" r="24"/><path d="M88 26L85 13L93 21L98 10L102 22L109 14L108 29"/></g>
  <g class="b-eye"><circle cx="106" cy="42" r="${opts.ruffled ? 6 : 5.2}" fill="${C.INK}"/><circle cx="107.9" cy="40.1" r="1.8" fill="#fff"/><circle cx="104.6" cy="44.2" r=".8" fill="#fff" opacity=".7"/></g>
  <path class="b-lid" d="M100 43q6 5 12 0" fill="none" stroke="${C.INK}" stroke-width="2.4" stroke-linecap="round" opacity="0"/>
  <path class="b-beak-up" d="M119 39L142 46L120 51Z" fill="${C.OR}" stroke="${C.INK}" stroke-width="1.2" stroke-linejoin="round"/>
  <path class="b-beak-low" d="M120 51L138 53L120 58Z" fill="${C.OR2}" stroke="${C.INK}" stroke-width="1.2" stroke-linejoin="round"/>
  <circle cx="126" cy="44" r="1" fill="${C.INK}" opacity=".7"/>
</g>
</g>`;
    }
    function birdSVG(cls = '', opts = {}) { return `<svg class="bird ${cls}" viewBox="0 0 160 140" aria-hidden="true">${birdG(opts)}</svg>`; }

    function noteSVG(col = C.INK, s = 20) {
      return `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><ellipse cx="6" cy="15" rx="4.5" ry="3.4" fill="${col}" transform="rotate(-18 6 15)"/><path d="M10 14V3l7 2.5v3.5L10 6.5" fill="${col}" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    }

    /* the cage, 300x400 box, hung from a ring at the top */
    function cageSVG(opts = {}) {
      const bars = [];
      for (let i = 0; i < 9; i++) {
        const x = 62 + i * 22; const d = `M${x} 332L${x} 162Q${x} 74 150 52`;
        bars.push(`<path d="${d}" transform="translate(1.6 1.4)" stroke="${C.INK}" stroke-width="5" fill="none"/>`);
      }
      const bars2 = [];
      for (let i = 0; i < 9; i++) { const x = 62 + i * 22; bars2.push(`<path d="M${x} 332L${x} 162Q${x} 74 150 52" stroke="#D9A21B" stroke-width="3" fill="none"/>`); }
      let hem = ''; for (let i = 0; i < 7; i++) hem += 'q17 26 34 0';
      const clothPath = `M150 30C112 34 62 66 44 150L32 336${hem}L256 150C238 66 188 34 150 30Z`;
      return `<svg class="cage" viewBox="-10 -40 320 440" aria-hidden="true">
<g class="cage-sway">
  <path class="c-rope" d="M150 -26V42M150 -38V-1600" stroke="${C.INK}" stroke-width="4"/>
  <circle cx="150" cy="-28" r="10" fill="none" stroke="${C.INK}" stroke-width="4"/>
  <g class="cage-body">
    <ellipse cx="150" cy="342" rx="108" ry="20" fill="rgba(20,33,61,.12)" transform="translate(0 36)"/>
    <path class="c-glow" d="M62 332L62 162Q62 74 150 52Q238 74 238 162L238 332Z" fill="#FFF6DC" opacity=".8"/>
    <g class="c-back">${bars.join('')}${bars2.join('')}</g>
    <g class="c-perches" stroke="${C.INK}" stroke-width="6" stroke-linecap="round"><path d="M70 286H230"/><path d="M96 232H204"/></g>
    <g class="c-bell" transform="translate(222 150)"><path d="M0 0V16" stroke="${C.INK}" stroke-width="2.4"/><path d="M-10 30Q-9 12 0 12Q9 12 10 30Z" fill="#D9A21B" stroke="${C.INK}" stroke-width="2.4" stroke-linejoin="round"/><circle cy="33" r="3" fill="${C.INK}"/></g>
    <g class="c-bird" data-bird></g>
    <path d="M44 150H256" stroke="${C.INK}" stroke-width="5"/><path d="M44 150H256" stroke="#D9A21B" stroke-width="3" transform="translate(0 -1)"/>
    <path d="M40 332H260L248 362H52Z" fill="#D9A21B" stroke="${C.INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M40 332H260" stroke="${C.INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M70 362l-6 14M230 362l6 14" stroke="${C.INK}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="150" cy="44" rx="18" ry="11" fill="#D9A21B" stroke="${C.INK}" stroke-width="3.5"/>
    <rect x="212" y="214" width="26" height="40" rx="5" fill="none" stroke="${C.INK}" stroke-width="3" opacity=".0"/>
  </g>
  <g class="cloth" ${opts.noCloth ? 'style="display:none"' : ''}>
    <path d="${clothPath}" fill="${C.INK}" stroke="${C.INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 80C70 150 66 230 62 330M150 44V330M220 80C230 150 234 230 238 330" stroke="#2B3A5E" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M40 300H260" stroke="${C.T}" stroke-width="12" opacity=".95"/>
    <g fill="${C.CREAM}" opacity=".5"><circle cx="100" cy="120" r="3"/><circle cx="130" cy="96" r="3"/><circle cx="176" cy="130" r="3"/><circle cx="206" cy="108" r="3"/><circle cx="116" cy="190" r="3"/><circle cx="186" cy="220" r="3"/><circle cx="90" cy="250" r="3"/><circle cx="214" cy="266" r="3"/></g>
  </g>
</g></svg>`;
    }

    /* verdict icons (32x32): singing = open beak + notes, ruffled = feathers up + dashed border, silent = closed beak under a cloth */
    function iconSVG(v, cls = '') {
      const ink = C.INK;
      if (v === 'singing') return `<svg class="vi ${cls}" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 9L8 4.5L11.5 7L13.5 3.5L15.5 7.5L18 5L17.5 10Z" fill="${C.G}" stroke="${ink}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="14" cy="18" r="10.5" fill="${C.Y}" stroke="${ink}" stroke-width="2"/><circle cx="14" cy="16" r="1.8" fill="${ink}"/><path d="M23 14L31 11.5V17.5Z" fill="${C.OR}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/><path d="M23 19.5L30 21.5L23 23Z" fill="${C.OR2}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 6.5a1.6 1.2 0 1 0 .01 0M6.4 6.5V1.5L9.5 2.4" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      if (v === 'ruffled') return `<svg class="vi ${cls}" viewBox="0 0 32 32" aria-hidden="true"><path d="M8 11L4 3L12 8L14 1L18 8L24 3L22 11" fill="${C.G}" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="14" cy="19" r="10.5" fill="${C.Y}" stroke="${ink}" stroke-width="2.2" stroke-dasharray="3.5 2.6"/><circle cx="14" cy="17.5" r="2.4" fill="${ink}"/><circle cx="14.8" cy="16.7" r=".8" fill="#fff"/><path d="M24 16L31 19.5L24 22Z" fill="${C.OR}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 14l-2-2M2 22l-2 2" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      return `<svg class="vi ${cls}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="14" cy="21" r="9" fill="${C.Y}" stroke="${ink}" stroke-width="2"/><path d="M22 20L29 22.5L22 25Z" fill="${C.OR}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 22C2 10 8 3 15 3S28 10 28 22V27q-2 3-4 0q-2 3-4 0q-2 3-4 0q-2 3-4 0q-2 3-4 0q-2 3-4 0q-2 3-4 0Z" fill="${ink}" stroke="${ink}" stroke-width="2.8" stroke-linejoin="round" transform="translate(0 -1)"/><path d="M2.4 22H27.6" stroke="${C.T}" stroke-width="3.4" transform="translate(0 -1.5)"/><path d="M9 11C8 15 7.6 18 7.4 20" stroke="#2B3A5E" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
    }
    const VERDICT = {
      singing: { label: 'Singing', line: 'Nothing found. Stay alert.', head: 'THE CANARY IS SINGING', aria: 'Singing: nothing found. Stay alert.' },
      ruffled: { label: 'Ruffled', line: "Something's off. Look closer before you go on.", head: 'THE CANARY IS NERVOUS', aria: "Ruffled: something's off. Look closer." },
      silent: { label: 'Silent', line: 'Stop. This looks like a scam.', head: 'THE CANARY WENT QUIET', aria: 'Silent: stop. This looks like a scam.' }
    };
    function stampHTML(v, extra = '') {
      const d = VERDICT[v];
      return `<span class="stamp ${v} ${extra}" role="img" aria-label="${esc(d.aria)}">${iconSVG(v)}<span>${d.label.toUpperCase()}</span></span>`;
    }

    /* toolbar icon: a canary in a square, three states */
    function tbIcon(v) {
      const badge = v === 'silent' ? `<circle cx="25" cy="7" r="6" fill="${C.T}" stroke="${C.INK}" stroke-width="1.6"/><path d="M25 4.4V8M25 9.4V9.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` : v === 'ruffled' ? `<circle cx="25" cy="7" r="6" fill="${C.OR}" stroke="${C.INK}" stroke-width="1.6"/><path d="M25 4.4V8M25 9.4V9.8" stroke="${C.INK}" stroke-width="1.8" stroke-linecap="round"/>` : '';
      return `<svg class="tbi" viewBox="0 0 32 32" aria-hidden="true">${iconSVG(v).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}${badge}</svg>`;
    }

    const LOGO_URI = "__LOGO_PNG__";
    function logoSVG(cls = '') {
      return `<img class="${cls}" src="${LOGO_URI}" alt="" aria-hidden="true" width="256" height="256" decoding="async" style="max-width:100%;height:auto;display:block">`;
    }

    /* small helpers for UI icons */
    const I = {
      alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
      cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
      hourglass: '<svg viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M7 3h10v4.5L12 12.5L17 17.5V22H7v-4.5L12 12.5L7 7.5Z" fill="#FFE79A" stroke="#14213D" stroke-width="2" stroke-linejoin="round"/><path d="M21 4c3 1 5 4 5 8-3 0-5-3-5-8Z" fill="#FFD23F" stroke="#14213D" stroke-width="1.8" stroke-linejoin="round"/><path d="M21 4l-2 9" stroke="#14213D" stroke-width="1.6" stroke-linecap="round"/></svg>',
      chromeLogo: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#DB4437" d="M6.68 14A20 20 0 0 1 41.32 14L32.66 19A10 10 0 0 0 15.34 19Z"/><path fill="#F4B400" d="M41.32 14A20 20 0 0 1 24 44L24 34A10 10 0 0 0 32.66 19Z"/><path fill="#0F9D58" d="M24 44A20 20 0 0 1 6.68 14L15.34 19A10 10 0 0 0 24 34Z"/><circle cx="24" cy="24" r="9.5" fill="#fff"/><circle cx="24" cy="24" r="7" fill="#4285F4"/></svg>',
      chrome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v10M7 10l5 5 5-5M5 20h14"/></svg>'
    };

    /* simple particle layer on #fx: feathers + dust. Capped. */
    const fx = (() => {
      const cv = $('#fx'), ctx = cv.getContext('2d'); let w = 0, h = 0, dpr = 1; const ps = []; let raf = 0;
      const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size(); addEventListener('resize', size);
      function tick() {
        ctx.clearRect(0, 0, w, h);
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i]; p.life -= 1; if (p.life <= 0) { ps.splice(i, 1); continue; }
          p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.r += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.min(1, p.life / 20);
          ctx.fillStyle = p.c;
          if (p.k === 'f') { ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.6, p.s * .6, 0, 0, 7); ctx.fill(); } else { ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 7); ctx.fill(); }
          ctx.restore();
        }
        raf = ps.length ? requestAnimationFrame(tick) : 0;
        if (!ps.length) ctx.clearRect(0, 0, w, h);
      }
      return {
        burst(x, y, kind = 'feathers', n = 14) {
          if (RM || document.hidden) return;
          n = Math.min(n, 28);
          const cols = kind === 'dust' ? ['#14213D', '#E63946', '#FFD23F'] : ['#FFD23F', '#F2B705', '#FFE79A'];
          for (let i = 0; i < n; i++) {
            if (ps.length > 70) ps.shift();
            const a = Math.random() * 6.28, sp = 1.5 + Math.random() * 4;
            ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, g: kind === 'dust' ? .15 : .07, r: Math.random() * 6, vr: (Math.random() - .5) * .3, s: kind === 'dust' ? 1.6 + Math.random() * 2.6 : 3 + Math.random() * 4, c: cols[i % cols.length], life: 55 + Math.random() * 30, k: kind === 'dust' ? 'd' : 'f' });
          }
          if (!raf) raf = requestAnimationFrame(tick);
        }
      };
    })();
