    /* ---- full analysis: the three tests, rule-based ----
       opts.extraKnown : extra {name, domains} sites to match against (used for the scenario's "real" site)
       opts.scripted   : { reported, vouched, ageDays } scripted inputs for scripted scenarios (skips network lookups) */
    async function analyze(raw, onStage, opts = {}) {
      const p = parseInput(raw);
      if (!p) return { error: "That doesn't look like a website address. Check it and try again." };
      const host = p.host; const reg = regDomain(host);
      const out = { host, reg, p, notes: [], flags: [] };
      const sc = opts.scripted || null;
      const setKN = () => { KN = opts.extraKnown ? KNOWN.concat(opts.extraKnown.map(indexKnown)) : KNOWN; };
      setKN();
      if (!sc && !blockLoaded) await loadBlocklist();
      setKN();

      /* test 1: ask around */
      let l1 = { status: 'warn', key: 'none', headline: 'Nobody has reviewed this yet', body: '' }; let netFail = false;
      const bl = sc ? null : blockHit(host); const lr = sc ? [] : reportsFor(host); const lv = sc ? [] : vouchesFor(host);
      let api = null;
      if (!sc && CFG.api && CFG.features.api !== false) { try { api = await apiFetch('/lookup?host=' + encodeURIComponent(host)); } catch (e) { netFail = true; } }
      setKN();
      const known = isKnownHost(host);
      if (bl || (api && (api.blocklisted || api.reported)) || lr.length || (sc && sc.reported)) {
        l1 = { status: 'bad', key: 'reported', headline: 'Reported as a scam', body: sc ? 'Other people have reported this address.' : bl ? (bl.reason || 'This address is on the Canary blocklist.') : (lr.length && !(api && api.reported)) ? 'You reported this site from this browser.' : 'Reports from other people match this address.' };
      } else if ((api && api.vouches > 0) || lv.length || (sc && sc.vouched)) {
        l1 = { status: 'ok', key: 'vouched', headline: 'Vouched for by the community', body: sc ? 'People have vouched for this address.' : lv.length && !(api && api.vouches) ? 'You vouched for this site from this browser.' : 'People have vouched for this address.' };
      } else if (known) {
        l1 = { status: 'ok', key: 'known', headline: `Matches a well-known site: ${known.name}`, body: `This is one of the addresses ${known.name} uses. Nobody has reviewed it on Canary yet, but that's expected for a site this well known.` };
      } else l1.body = 'No scam reports and no vouches for this address.';
      out.l1 = l1; if (netFail) out.notes.push("Couldn't reach a data source. The other checks still ran.");

      /* test 2: spot the fake (address checks are instant; only the age lookup waits on the network) */
      setKN();
      const l2 = layer2(p); const soft = l2.soft.slice();
      out.hardCount = l2.hard.length;
      onStage && onStage(1, out);
      let age = null;
      if (sc && sc.ageDays != null) age = { days: sc.ageDays };
      else if (!sc && !p.isIP && !opts.skipAge) age = await domainAge(host);
      if (age && age.days != null && age.days < TH.minDomainAgeDays) soft.push({ w: 1, short: `the domain was registered ${age.days <= 1 ? 'today' : age.days + ' days ago'}`, long: `The domain was registered ${age.days <= 1 ? 'today' : age.days + ' days ago'}. Brand-new sites are a red flag.` });
      if (l1.key === 'none') soft.push({ w: 1, short: 'nobody has reviewed it', long: 'Nobody has reviewed this site yet.' });
      out.hard = l2.hard; out.soft = soft; out.age = age; out.known = !!known;
      out.softSum = soft.reduce((a, f) => a + f.w, 0);
      const young = age && age.days != null && age.days < TH.minDomainAgeDays;
      const lbad = l2.hard.length + l2.soft.length;
      out.l2 = {
        status: l2.hard.length ? 'bad' : (lbad || young) ? 'warn' : 'ok',
        headline: l2.hard.length ? 'Looks like a fake' : (lbad || young) ? "Something's off" : 'Nothing odd in the address'
      };
      if (age && age.failed) out.notes.push("Couldn't check the site's age this time.");
      onStage && onStage(2, out);

      /* verdict */
      let verdict = 'singing';
      if (l1.status === 'bad' || l2.hard.length) verdict = 'silent';
      else if (out.softSum >= TH.softFlagsForRuffled) verdict = 'ruffled';
      out.verdict = verdict;
      if (verdict === 'singing') out.sentence = `Singing. Canary found nothing wrong with ${host}. That doesn't make it safe, so stay alert.`;
      else if (verdict === 'ruffled') {
        const rs = soft.filter(f => !f.minor).concat(soft.filter(f => f.minor)).slice(0, 2).map(f => f.short);
        out.sentence = `Ruffled. ${cap(rs[0] || 'a few small things are off')}${rs[1] ? ' and ' + rs[1] : ''}. Look closer before you connect.`;
      } else {
        const r = l1.status === 'bad' ? (l1.key === 'reported' ? 'this site has been reported as a scam' : 'it is reported') : l2.hard[0].short;
        out.sentence = `Silent. ${cap(r)}. Don't connect.`;
      }
      out.flagList = [
        ...(l1.status === 'bad' ? [{ sev: 'hard', text: l1.headline + '. ' + l1.body }] : []),
        ...l2.hard.map(f => ({ sev: 'hard', text: f.long })),
        ...soft.map(f => ({ sev: 'soft', minor: f.minor, text: f.long }))
      ];
      return out;
    }
    function indexKnown(k) {
      const doms = k.domains.map(d => d.toLowerCase());
      const labels = new Set(doms.map(d => regDomain(d).split('.')[0]));
      labels.add(k.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      return { name: k.name, domains: doms, labels: Array.from(labels) };
    }

    /* ---- record + remote bits ---- */
    function recordCheck(host, verdict) {
      const c = store.get('checks', []); c.push({ host, verdict, ts: Date.now() }); store.set('checks', c.slice(-500));
    }
    async function sendVouch(host) {
      const v = store.get('vouches', []); if (!v.some(x => x.host === host)) { v.push({ host, ts: Date.now() }); store.set('vouches', v); }
      try { await apiFetch('/vouch', { method: 'POST', body: JSON.stringify({ host }) }); } catch (e) { /* kept locally */ }
    }

    /* ==========================================================
       DECOY REQUESTS: build real Solana transaction bytes for the scenarios,
       then read them with the same decoder the Check page uses.
       ========================================================== */
    function fakeKey(seed) { const b = new Uint8Array(32); for (let i = 0; i < 32; i++) b[i] = ((seed * 97 + i * 53 + ((i * i * seed) | 0)) ^ (seed << 3)) & 255; b[31] |= 1; return b; }
    function buildMessage(keys, ixs) {
      const out = [1, 0, 1, keys.length]; keys.forEach(k => out.push(...k));
      out.push(...new Uint8Array(32).fill(7)); out.push(ixs.length);
      ixs.forEach(ix => out.push(ix.prog, ix.accts.length, ...ix.accts, ix.data.length, ...ix.data));
      return Uint8Array.from(out);
    }
    function demoTx(kind) {
      if (kind === 'approveAll') {
        const keys = [fakeKey(11), fakeKey(12), fakeKey(13), b58dec('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')];
        return buildMessage(keys, [{ prog: 3, accts: [1, 2, 0], data: [4, 255, 255, 255, 255, 255, 255, 255, 255] }]);
      }
      if (kind === 'sendSol') {
        const keys = [fakeKey(21), fakeKey(22), b58dec('11111111111111111111111111111111')];
        const lam = 12000000000n; const d = [2, 0, 0, 0]; for (let i = 0; i < 8; i++) d.push(Number((lam >> BigInt(8 * i)) & 255n));
        return buildMessage(keys, [{ prog: 2, accts: [0, 1], data: d }]);
      }
      return null;
    }
    const toB64 = u8 => { let s = ''; u8.forEach(b => s += String.fromCharCode(b)); return btoa(s); };

    /* ==========================================================
       RECOVERY PHRASE DETECTION (BIP39)
       ========================================================== */
    const BIP39 = BIP39_RAW.split(' ');
    const BIP_IDX = new Map(BIP39.map((w, i) => [w, i]));
    const BIP39_OK = BIP39.length === 2048;
    function sha256(msg) {
      const P = []; for (let n = 2; P.length < 64; n++) { let ok = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { ok = false; break; } if (ok) P.push(n); }
      const fr = x => Math.floor((x - Math.floor(x)) * 4294967296);
      const K = P.map(p => fr(Math.cbrt(p))); const H = P.slice(0, 8).map(p => fr(Math.sqrt(p)));
      const l = msg.length, bits = l * 8; const pad = ((l + 9 + 63) >> 6) << 6; const m = new Uint8Array(pad); m.set(msg); m[l] = 0x80;
      const dv = new DataView(m.buffer); dv.setUint32(pad - 4, bits >>> 0); dv.setUint32(pad - 8, Math.floor(bits / 4294967296));
      const w = new Uint32Array(64); const rr = (x, n) => (x >>> n) | (x << (32 - n));
      for (let o = 0; o < pad; o += 64) {
        for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
        for (let i = 16; i < 64; i++) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
        let [a, b, c, d, e, f, g, h] = H;
        for (let i = 0; i < 64; i++) {
          const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0;
          const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
          h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
      }
      const out = new Uint8Array(32); const ov = new DataView(out.buffer); H.forEach((x, i) => ov.setUint32(i * 4, x >>> 0)); return out;
    }
    function mnemonicChecksumOK(words) {
      const bits = words.map(w => BIP_IDX.get(w).toString(2).padStart(11, '0')).join('');
      const cs = words.length / 3; const ent = bits.slice(0, bits.length - cs); const bytes = new Uint8Array(ent.length / 8);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(ent.slice(i * 8, i * 8 + 8), 2);
      return sha256(bytes)[0].toString(2).padStart(8, '0').slice(0, cs) === bits.slice(bits.length - cs);
    }
    /* A decoy phrase is made up from scratch (random entropy), NOT derived from or scrambled from anything of yours.
       It is a valid-looking BIP39 phrase (checksum included) that opens none of your wallets. */
    function makeDecoyPhrase(n = 12) {
      const bytes = new Uint8Array(n === 24 ? 32 : 16); crypto.getRandomValues(bytes);
      const bits = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('');
      const cs = bytes.length * 8 / 32; const all = bits + sha256(bytes)[0].toString(2).padStart(8, '0').slice(0, cs);
      const out = []; for (let i = 0; i < all.length / 11; i++) out.push(BIP39[parseInt(all.slice(i * 11, i * 11 + 11), 2)]);
      return out;
    }
    /* returns { hit, n, checksum, mode } . Nothing is kept. */
    function detectSeed(text) {
      const t = String(text || '').toLowerCase().split(/[^a-z]+/).filter(Boolean);
      if (BIP39_OK) {
        for (const n of [24, 21, 18, 15, 12]) {
          for (let i = 0; i + n <= t.length; i++) {
            const win = t.slice(i, i + n);
            if (win.every(w => BIP_IDX.has(w))) return { hit: true, n, checksum: mnemonicChecksumOK(win), mode: 'wordlist' };
          }
        }
        return { hit: false, mode: 'wordlist' };
      }
      /* fallback: the word list could not be loaded, so use a simpler pattern check */
      if ((t.length === 12 || t.length === 24) && t.every(w => /^[a-z]{3,8}$/.test(w))) return { hit: true, n: t.length, checksum: null, mode: 'pattern' };
      return { hit: false, mode: 'pattern' };
    }
