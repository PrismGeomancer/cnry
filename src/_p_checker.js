    const SCAM_WORDS = ['claim', 'verify', 'verification', 'airdrop', 'giveaway', 'free', 'bonus', 'reward', 'rewards', 'connect', 'secure', 'official', 'support', 'login', 'validate', 'recover', 'restore', 'unlock', 'presale', 'whitelist', 'eligible', 'mint', 'wallet', 'drop'];
    const FILLER = new Set([...SCAM_WORDS, 'app', 'apps', 'sol', 'solana', 'swap', 'dex', 'now', 'live', 'io', 'web', 'site', 'online', 'the', 'my', 'get', 'new', 'portal', 'dapp', 'token', 'tokens', 'finance', 'protocol']);
    const RISKY_TLDS = new Set(['xyz', 'top', 'live', 'click', 'icu', 'sbs', 'cfd', 'cyou', 'buzz', 'rest', 'quest', 'monster', 'link', 'vip', 'win', 'zip', 'mov', 'site', 'online', 'shop', 'store', 'tk', 'ml', 'ga', 'cf', 'gq', 'cam', 'lol']);
    const FREE_HOSTS = ['vercel.app', 'netlify.app', 'pages.dev', 'web.app', 'firebaseapp.com', 'github.io', 'framer.app', 'framer.website', 'framer.media', 'webflow.io', 'wixsite.com', 'weebly.com', 'blogspot.com', 'herokuapp.com', 'onrender.com', 'glitch.me', 'replit.app', 'repl.co', 'workers.dev', 'surge.sh', 'carrd.co', 'notion.site', 'godaddysites.com', 'bubbleapps.io', 'typedream.app', 'strikingly.com', '000webhostapp.com'];
    const PUB_SECOND = new Set(['co', 'com', 'org', 'net', 'gov', 'edu', 'ac']);
    const CONFUSABLES = { 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y', 'і': 'i', 'ї': 'i', 'ј': 'j', 'ѕ': 's', 'һ': 'h', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w', 'ɡ': 'g', 'ɑ': 'a', 'ο': 'o', 'α': 'a', 'ν': 'v', 'ρ': 'p', 'ι': 'i', 'κ': 'k', 'τ': 't', 'υ': 'u', 'χ': 'x', 'ѵ': 'v', 'ӏ': 'l', 'ǀ': 'l', 'ⅼ': 'l', 'ⅰ': 'i', 'ꓲ': 'l', 'ᴏ': 'o', 'ᴍ': 'm', 'ʜ': 'h', 'ᴛ': 't', 'ᴀ': 'a', 'ɴ': 'n', 'ᴘ': 'p' };

    /* ---- punycode decode (RFC 3492) ---- */
    function puniDecode(input) {
      const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700; let n = 128, i = 0, bias = 72; const out = [];
      let basic = input.lastIndexOf('-'); if (basic < 0) basic = 0;
      for (let j = 0; j < basic; ++j) out.push(input.charCodeAt(j));
      const adapt = (delta, num, first) => { let k = 0; delta = first ? Math.floor(delta / damp) : delta >> 1; delta += Math.floor(delta / num); for (; delta > ((base - tMin) * tMax) >> 1; k += base) delta = Math.floor(delta / (base - tMin)); return Math.floor(k + (base - tMin + 1) * delta / (delta + skew)); };
      for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length;) {
        const oldi = i;
        for (let w = 1, k = base; ; k += base) {
          const c = input.charCodeAt(idx++); const digit = c - 48 < 10 ? c - 22 : c - 65 < 26 ? c - 65 : c - 97 < 26 ? c - 97 : base;
          if (digit >= base) throw new Error('bad punycode');
          i += digit * w; const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (digit < t) break; w *= base - t;
        }
        const len = out.length + 1; bias = adapt(i - oldi, len, oldi === 0); n += Math.floor(i / len); i %= len; out.splice(i++, 0, n);
      }
      return String.fromCodePoint(...out);
    }
    const scriptsOf = s => {
      const set = new Set();
      for (const ch of s) {
        if (/[A-Za-z]/.test(ch)) set.add('Latin'); else if (/[Ѐ-ӿ]/.test(ch)) set.add('Cyrillic'); else if (/[Ͱ-Ͽ]/.test(ch)) set.add('Greek');
        else if (/[À-ɏḀ-ỿ]/.test(ch)) set.add('Latin'); else if (/[0-9\-.]/.test(ch)) { /* neutral */ } else set.add('Other');
      }
      return set;
    };
    const asciiSkeleton = s => {
      let out = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return Array.from(out).map(c => CONFUSABLES[c] || c).join('');
    };
    const skel = s => asciiSkeleton(s).replace(/-/g, '').replace(/rn/g, 'm').replace(/vv/g, 'w').replace(/0/g, 'o').replace(/[1il|]/g, 'l').replace(/3/g, 'e').replace(/5/g, 's').replace(/4/g, 'a').replace(/7/g, 't').replace(/(.)\1+/g, '$1');
    function editDistance(a, b) {
      const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
      const d = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; });
      for (let j = 0; j <= n; j++) d[0][j] = j;
      for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      return d[m][n];
    }
    function regDomain(host) {
      const l = host.split('.'); if (l.length <= 2) return host;
      const tld = l[l.length - 1], sl = l[l.length - 2];
      if (tld.length === 2 && PUB_SECOND.has(sl)) return l.slice(-3).join('.');
      return l.slice(-2).join('.');
    }
    const freeHostOf = host => FREE_HOSTS.find(f => host === f || host.endsWith('.' + f));
    function siteLabel(host) {
      const f = freeHostOf(host);
      if (f) { const rest = host.slice(0, host.length - f.length - 1); return rest ? rest.split('.').pop() : ''; }
      return regDomain(host).split('.')[0];
    }

    /* known sites, indexed once */
    const KNOWN = CFG.knownSites.map(k => {
      const doms = k.domains.map(d => d.toLowerCase());
      const labels = new Set(doms.map(d => regDomain(d).split('.')[0]));
      labels.add(k.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      return { name: k.name, domains: doms, labels: Array.from(labels) };
    });
    const isKnownHost = host => KN.find(k => k.domains.some(d => host === d || host.endsWith('.' + d)));
    const GENERIC_BRANDS = new Set(['solana', 'solanafm']);

    /* ---- blocklist (shipped file, loaded with graceful failure) ---- */
    let BLOCK = new Map(); let blockLoaded = false;
    async function loadBlocklist() {
      if (location.protocol === 'file:') { blockLoaded = true; return; } /* browsers block fetch() on file://; serve the folder to use blocklist.json */
      try {
        const r = await fetch('blocklist.json', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
        const arr = await r.json();
        (Array.isArray(arr) ? arr : []).forEach(e => {
          const h = (typeof e === 'string' ? e : e && e.host || '').toLowerCase().trim(); if (h) BLOCK.set(h, typeof e === 'object' ? e : {});
        });
      } catch (e) { /* file missing or opened from disk: treated as empty */ }
      blockLoaded = true;
    }
    function blockHit(host) { for (const [h, v] of BLOCK) if (host === h || host.endsWith('.' + h)) return { host: h, ...v }; return null; }

    /* ---- local reports / vouches ---- */
    const reportsFor = host => store.get('reports', []).filter(r => host === r.host || host.endsWith('.' + r.host));
    const vouchesFor = host => store.get('vouches', []).filter(r => host === r.host || host.endsWith('.' + r.host));

    async function apiFetch(path, opts = {}, ms = 5000) {
      if (!CFG.api || CFG.features.api === false) return null;
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
      try {
        const r = await fetch(CFG.api.replace(/\/$/, '') + path, { ...opts, signal: ctl.signal, headers: { 'content-type': 'application/json', ...(opts.headers || {}) } });
        if (!r.ok) throw new Error(r.status); return await r.json();
      } finally { clearTimeout(t); }
    }

    function parseInput(raw) {
      let s = (raw || '').trim().replace(/\s+/g, '');
      if (!s || /[<>"'`\\]/.test(s)) return null;
      let explicitHttp = /^http:\/\//i.test(s);
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s;
      let u; try { u = new URL(s); } catch (e) { return null; }
      if (!/^https?:$/.test(u.protocol)) return null;
      const host = u.hostname.toLowerCase().replace(/\.$/, '');
      if (!host || host.length > 253) return null;
      const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');
      if (!isIP && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return null;
      return { url: u, host, isIP, explicitHttp, user: u.username };
    }

    /* ---- Layer 2 ---- */
    function layer2(p) {
      const hard = [], soft = []; const host = p.host;
      const known = isKnownHost(host);
      if (p.isIP) { soft.push({ w: 1, short: 'the address is a bare IP number', long: 'The address is a bare IP number, not a name.' }); }
      if (p.user) {
        const tricky = /[.:]/.test(p.user) || KN.some(k => k.labels.some(l => p.user.toLowerCase().includes(l)));
        (tricky ? hard : soft).push({ w: 1, short: 'a name before an @ hides the real address', long: `There's a name before an @ ("${p.user}"). Only what comes after the @ is the real site.` });
      }
      if (p.explicitHttp) soft.push({ w: 1, short: "it doesn't use a secure connection", long: "The address starts with http://, which isn't encrypted.", minor: true });
      if (!p.isIP) {
        const labels = host.split('.'); const reg = regDomain(host); const regN = reg.split('.').length;
        /* punycode / mixed script / homoglyph */
        const puny = labels.filter(l => l.startsWith('xn--'));
        let decodedHost = host;
        if (puny.length) {
          let bad = false, decoded = labels.map(l => { if (!l.startsWith('xn--')) return l; try { return puniDecode(l.slice(4)); } catch (e) { bad = true; return l; } });
          decodedHost = decoded.join('.');
          const sc = scriptsOf(decoded.join(''));
          const sk = asciiSkeleton(decodedHost);
          const label = siteLabel(sk);
          const target = KN.find(k => !isKnownHost(host) && (k.labels.includes(label) || k.labels.some(l => skel(l) === skel(label))));
          if (target) hard.push({ w: 1, short: `its letters imitate ${target.name}`, long: `Some letters look like Latin ones but aren't. Written out, the address imitates ${target.name}. Real address shown by your browser: ${host}.` });
          else if (sc.size > 1 || bad) hard.push({ w: 1, short: 'it mixes alphabets in one address', long: 'The address mixes letters from different alphabets, a common way to fake a real name.' });
          else soft.push({ w: 1, short: 'the address uses special characters', long: `The address uses special characters (punycode): ${decodedHost}.` });
        }
        /* embedded known domain / brand in subdomain */
        if (!known) {
          for (const k of KN) {
            const d = k.domains.find(d => host.startsWith(d + '.') || host.includes('.' + d + '.'));
            if (d) { hard.push({ w: 1, short: `it puts ${d} inside a different address`, long: `${d} appears inside the address, but the site really belongs to ${reg}.` }); break; }
          }
        }
        /* look-alike spelling */
        if (!known) {
          const base = siteLabel(host); const subs = labels.slice(0, Math.max(0, labels.length - regN));
          let best = null;
          const consider = (kind, k, kl, dist, text) => { if (!best || dist < best.dist) best = { kind, k, kl, dist, text }; };
          const cand = base.toLowerCase();
          const tokens = cand.split('-').filter(Boolean);
          const stripped = tokens.filter(t => !FILLER.has(t)).join('');
          for (const k of KN) for (const kl of k.labels) {
            if (kl.length < 3) continue;
            const sameTld = k.domains.some(d => d === reg);
            if (sameTld) continue;
            if (cand === kl) { consider('same-name', k, kl, 0, `uses the name of ${k.name} with a different ending`); continue; }
            if (skel(cand) === skel(kl)) { consider('swap', k, kl, 0, `looks like ${k.domains[0]}, with look-alike characters swapped in`); continue; }
            if (!GENERIC_BRANDS.has(kl) && tokens.length > 1 && tokens.includes(kl) && tokens.every(t => t === kl || FILLER.has(t))) { consider('words', k, kl, 0, `looks like ${k.domains[0]} with extra words added`); continue; }
            if (!GENERIC_BRANDS.has(kl) && kl.length >= 5) {
              if (stripped && stripped !== cand && (stripped === kl || skel(stripped) === skel(kl))) { consider('words', k, kl, 0, `looks like ${k.domains[0]} with extra words added`); continue; }
              if (cand.includes(kl)) {
                const rest = cand.replace(kl, ''); const generic = rest.split('-').join('').length === 0 || rest.split('-').filter(Boolean).every(t => FILLER.has(t)) || SCAM_WORDS.some(w => rest.includes(w));
                consider(generic ? 'words' : 'contains', k, kl, 0, generic ? `looks like ${k.domains[0]} with extra words added` : `contains the name of ${k.name}`); continue;
              }
            }
            const maxD = kl.length < 5 ? 0 : Math.min(TH.lookalikeDistance, Math.floor(kl.length / 4));
            if (maxD > 0 && Math.abs(cand.length - kl.length) <= maxD) { const dd = editDistance(cand, kl); if (dd > 0 && dd <= maxD) consider('close', k, kl, dd, `is spelled almost like ${k.domains[0]}`); }
          }
          if (best) {
            const isHard = best.kind !== 'contains' && !(best.kind === 'same-name' && best.kl.length < 6);
            (isHard ? hard : soft).push({ w: 1, short: `the address ${best.text}`, long: `The address ${best.text}. The real one is ${best.k.domains[0]}.`, target: best.k.name });
          }
          /* brand as a subdomain of an unrelated site */
          if (!best) for (const s of subs) for (const k of KN) for (const kl of k.labels) if (!GENERIC_BRANDS.has(kl) && kl.length >= 5 && s === kl) hard.push({ w: 1, short: `it uses ${k.name}'s name as a prefix on another site`, long: `"${s}" is just a prefix. The site really belongs to ${reg}.` });
        }
        /* scam-style words */
        const tokenSet = host.replace(/\.[a-z0-9-]+$/, '').split(/[.\-0-9]+/);
        const found = Array.from(new Set(SCAM_WORDS.filter(w => tokenSet.includes(w) || (w.length >= 6 && host.split('.').slice(0, -1).join('.').includes(w)))));
        if (found.length && !known) soft.push({ w: 1, short: `it uses scam-style words (${found.slice(0, 3).join(', ')})`, long: `The address uses words scams like: ${found.join(', ')}.` });
        /* TLD */
        const tld = labels[labels.length - 1];
        if (RISKY_TLDS.has(tld) && !known) soft.push({ w: .5, short: `it ends in .${tld}`, long: `.${tld} endings are cheap and common on scam sites. Many honest sites use them too, so this counts for little.`, minor: true });
        /* free site builders */
        const fh = freeHostOf(host);
        if (fh && !known) soft.push({ w: 1, short: `it is hosted on a free site builder (${fh})`, long: `The site sits on ${fh}, where anyone can publish a page in minutes.` });
        /* subdomain chain */
        if (labels.length - regN >= 3 && !known) soft.push({ w: 1, short: 'it has a long chain of subdomains', long: `The address chains ${labels.length - regN} extra parts before the real domain (${reg}).` });
      }
      return { hard, soft, known };
    }

