    const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    function b58enc(bytes) {
      const digits = [];
      for (const b of bytes) { let carry = b; for (let j = 0; j < digits.length; j++) { carry += digits[j] << 8; digits[j] = carry % 58; carry = (carry / 58) | 0; } while (carry) { digits.push(carry % 58); carry = (carry / 58) | 0; } }
      let s = ''; for (const b of bytes) { if (b === 0) s += '1'; else break; }
      for (let i = digits.length - 1; i >= 0; i--) s += B58[digits[i]];
      return s;
    }
    function b58dec(str) {
      const bytes = [];
      for (const c of str) { const v = B58.indexOf(c); if (v < 0) throw new Error('bad base58'); let carry = v; for (let j = 0; j < bytes.length; j++) { carry += bytes[j] * 58; bytes[j] = carry & 255; carry >>= 8; } while (carry) { bytes.push(carry & 255); carry >>= 8; } }
      for (const c of str) { if (c === '1') bytes.push(0); else break; }
      return new Uint8Array(bytes.reverse());
    }
    function fromB64(s) {
      s = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
      const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u;
    }
    function readShort(buf, o) { let len = 0, size = 0; for (; ;) { const b = buf[o.i++]; if (b === undefined) throw new Error('eof'); len |= (b & 0x7f) << (size * 7); size++; if (!(b & 0x80)) break; if (size > 3) throw new Error('bad len'); } return len; }
    function parseMessage(buf, start) {
      const o = { i: start }; let version = 'legacy';
      if (buf[o.i] & 0x80) { version = buf[o.i] & 0x7f; if (version !== 0) throw new Error('version'); o.i++; }
      const nSig = buf[o.i++]; o.i += 2;
      const nKeys = readShort(buf, o); if (nKeys > 256 || nKeys < 1) throw new Error('keys');
      const keys = []; for (let k = 0; k < nKeys; k++) { if (o.i + 32 > buf.length) throw new Error('eof'); keys.push(b58enc(buf.slice(o.i, o.i + 32))); o.i += 32; }
      o.i += 32;
      const nIx = readShort(buf, o); if (nIx > 64) throw new Error('ix'); const ix = [];
      for (let k = 0; k < nIx; k++) {
        const prog = buf[o.i++]; const na = readShort(buf, o); const accts = Array.from(buf.slice(o.i, o.i + na)); o.i += na;
        const dl = readShort(buf, o); const data = buf.slice(o.i, o.i + dl); o.i += dl; if (o.i > buf.length) throw new Error('eof');
        if (prog >= nKeys && version !== 0) throw new Error('prog');
        ix.push({ prog, accts, data });
      }
      let lookups = 0;
      if (version === 0) { lookups = readShort(buf, o); for (let k = 0; k < lookups; k++) { o.i += 32; const w = readShort(buf, o); o.i += w; const r = readShort(buf, o); o.i += r; } }
      if (o.i !== buf.length) throw new Error('trailing');
      return { version, keys, ix, nSig, lookups };
    }
    function parseTx(buf) {
      try { const o = { i: 0 }; const n = readShort(buf, o); if (n <= 16) return parseMessage(buf, o.i + n * 64); } catch (e) { /* try raw message */ }
      return parseMessage(buf, 0);
    }
    const PROGS = { '11111111111111111111111111111111': 'System Program', 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022 Program', 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Program', 'ComputeBudget111111111111111111111111111111': 'Compute Budget', 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'Memo', 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo': 'Memo' };
    const shortA = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : 'an account';
    const codeA = a => a ? `<code title="${esc(a)}">${esc(shortA(a))}</code>` : 'an account loaded from a lookup table';
    function fmtAmt(raw, dec) {
      if (dec == null) return raw.toString();
      const s = raw.toString().padStart(dec + 1, '0'); const whole = s.slice(0, s.length - dec), frac = s.slice(s.length - dec).replace(/0+$/, '');
      return whole + (frac ? '.' + frac : '');
    }
    const U64MAX = (1n << 64n) - 1n;
    function decodeTx(buf) {
      const m = parseTx(buf); const lines = [];
      const K = i => (i < m.keys.length ? m.keys[i] : null);
      const u64 = (d, off) => new DataView(d.buffer, d.byteOffset, d.byteLength).getBigUint64(off, true);
      for (const ix of m.ix) {
        const pid = K(ix.prog); const name = PROGS[pid] || null; const d = ix.data; const A = n => K(ix.accts[n]);
        try {
          if (pid === '11111111111111111111111111111111') {
            const disc = new DataView(d.buffer, d.byteOffset, d.byteLength).getUint32(0, true);
            if (disc === 2) { const l = u64(d, 4); lines.push({ sev: 'warn', html: `Sends <b>${fmtAmt(l, 9)} SOL</b> from ${codeA(A(0))} to ${codeA(A(1))}.` }); }
            else if (disc === 1) lines.push({ sev: 'danger', html: `Hands control of account ${codeA(A(0))} to another program (${codeA(esc(d.length >= 36 ? b58enc(d.slice(4, 36)) : ''))}). Whoever runs that program can then use the account.` });
            else if (disc === 0) lines.push({ sev: 'info', html: `Creates a new account (${codeA(A(1))}).` });
            else if (disc === 11) lines.push({ sev: 'warn', html: `Sends SOL from ${codeA(A(0))} using a seed-based transfer.` });
            else lines.push({ sev: 'info', html: `A System Program setup step (type ${disc}). It doesn't move funds on its own.` });
          } else if (pid === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || pid === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
            const t = d[0];
            if (t === 3) lines.push({ sev: 'warn', html: `Moves <b>${u64(d, 1)}</b> raw token units from account ${codeA(A(0))} to ${codeA(A(1))}.` });
            else if (t === 12) lines.push({ sev: 'warn', html: `Moves <b>${fmtAmt(u64(d, 1), d[9])}</b> of token ${codeA(A(1))} from account ${codeA(A(0))} to ${codeA(A(2))}.` });
            else if (t === 4 || t === 13) {
              const amt = u64(d, 1); const unl = amt >= (1n << 63n); const mint = t === 13 ? A(1) : null; const del = t === 13 ? A(2) : A(1);
              lines.push({ sev: 'danger', html: `<b>Lets ${codeA(del)} spend ${unl ? 'ALL' : 'up to ' + (t === 13 ? fmtAmt(amt, d[9]) : amt.toString() + ' raw units') + ' of'} the ${mint ? 'token ' + codeA(mint) + ' in' : 'tokens in'} account ${codeA(A(0))}</b>${unl ? ' (an unlimited amount)' : ''}. This is how drainers move tokens without asking again.` });
            }
            else if (t === 5) lines.push({ sev: 'info', html: `Takes back permission a delegate had over account ${codeA(A(0))}.` });
            else if (t === 6) {
              const kinds = ['mint new tokens of', 'freeze accounts of', 'fully own the token account', 'close the token account', 'change the fee settings of', 'close the mint', 'move tokens from', 'pause', 'change the metadata of'];
              const k = kinds[d[1]] || 'control'; const has = d[2] === 1; const nu = has ? b58enc(d.slice(3, 35)) : null;
              lines.push(has
                ? { sev: 'danger', html: `<b>Gives ${codeA(nu)} the power to ${k} ${codeA(A(0))}</b>${d[1] === 2 ? '. They would own it, including everything in it' : ''}.` }
                : { sev: 'warn', html: `Removes the one who can ${k} ${codeA(A(0))}, for good.` });
            }
            else if (t === 9) lines.push({ sev: 'warn', html: `Closes token account ${codeA(A(0))} and sends what's left in it to ${codeA(A(1))}.` });
            else if (t === 8) lines.push({ sev: 'warn', html: `Burns <b>${u64(d, 1)}</b> raw token units from ${codeA(A(0))}. Burned tokens are gone.` });
            else if (t === 15) lines.push({ sev: 'warn', html: `Burns <b>${fmtAmt(u64(d, 1), d[9])}</b> tokens from ${codeA(A(0))}. Burned tokens are gone.` });
            else if (t === 7 || t === 14) lines.push({ sev: 'info', html: `Creates new tokens into ${codeA(A(1))}.` });
            else lines.push({ sev: 'info', html: `Sets up or syncs a token account (${name}, type ${t}). It doesn't move funds.` });
          } else if (pid === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') lines.push({ sev: 'info', html: `Creates a token account for ${codeA(A(2))} if it doesn't exist yet.` });
          else if (pid === 'ComputeBudget111111111111111111111111111111') lines.push({ sev: 'info', html: 'Sets the network fee. It is not a transfer.' });
          else if (name === 'Memo') lines.push({ sev: 'info', html: 'Attaches a short note.' });
          else lines.push({ sev: 'warn', html: `Calls a program Canary doesn't know yet: ${codeA(pid)}. It can do anything that program allows, so be careful.` });
        } catch (e) { lines.push({ sev: 'warn', html: `Part of this request (${name || codeA(pid)}) couldn't be read.` }); }
      }
      if (m.lookups) lines.push({ sev: 'info', html: `This transaction also uses ${m.lookups} address lookup table${m.lookups > 1 ? 's' : ''}, so some accounts can't be named here.` });
      const level = lines.some(l => l.sev === 'danger') ? 'danger' : lines.some(l => l.sev === 'warn') ? 'warn' : 'info';
      return { lines, level, version: m.version };
    }
