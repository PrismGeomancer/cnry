// Runs the rule engine headlessly against a set of addresses and the BIP39 / tx decoder checks.
import { engineSource } from './build.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const head = readFileSync(fileURLToPath(new URL('../src/head.html', import.meta.url)), 'utf8');
const cfgSrc = head.match(/window\.CANARY_CONFIG = (\{[\s\S]*?\n\});/)[1];
const shim = `const CFG = ${cfgSrc}; const esc = s => String(s); const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const store = { get: (k, d) => d, set() {} }; const window = {}; const location = { protocol: 'https:' };`;
const body = engineSource() + `
return { makeDecoyPhrase, analyze, detectSeed, decodeTx, demoTx, fromB64, toB64, sha256, mnemonicChecksumOK, BIP39 };`;
const E = new Function(shim + body)();
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } else console.log('ok  ', m); };
const run = async (h, o) => (await E.analyze(h, null, { skipAge: true, ...o })).verdict;
ok(await run('phantom.app') === 'singing', 'phantom.app singing');
ok(await run('jup.ag') === 'singing', 'jup.ag singing');
ok(await run('phant0m.app') === 'silent', 'phant0m.app silent');
ok(await run('claim-phantom.xyz') === 'silent', 'claim-phantom.xyz silent');
ok(await run('xn--phantm-1cf.app') !== 'singing', 'punycode not singing');
ok(await run('example.com') === 'ruffled' || await run('example.com') === 'singing', 'example.com ' + await run('example.com'));
const tide = { extraKnown: [{ name: 'Tidepool', domains: ['tidepool.finance'] }] };
ok(await run('tide-pool.finance', { scripted: { ageDays: 6 }, ...tide }) === 'silent', 'demo tide-pool.finance silent');
ok(await run('tidepool.finance', { scripted: { vouched: true, ageDays: 900 }, ...tide }) === 'singing', 'demo tidepool.finance singing');
ok(await run('mossback-mint.xyz', { scripted: { ageDays: 11 }, ...tide }) === 'ruffled', 'demo mossback ruffled');
ok(await run('claim-lunaris-drop.top', { scripted: { reported: true, ageDays: 3 }, ...tide }) === 'silent', 'demo lunaris silent');
ok(E.BIP39.length === 2048, 'bip39 2048');
const abandon = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const d = E.detectSeed(abandon); ok(d.hit && d.n === 12 && d.checksum === true, 'abandon..about detected, checksum valid');
ok(E.detectSeed('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon').checksum === false, 'bad checksum flagged');
ok(!E.detectSeed('hello world this is my seed maybe').hit, 'plain text not flagged');
ok(!E.detectSeed('abandon ability able about above absent').hit, '6 words not flagged');
const { createHash } = await import('node:crypto');
const msg = new Uint8Array([1, 2, 3, 250, 255]); ok(Buffer.from(E.sha256(msg)).toString('hex') === createHash('sha256').update(msg).digest('hex'), 'sha256 matches node');
const t1 = E.decodeTx(E.fromB64(E.toB64(E.demoTx('approveAll')))); ok(t1.level === 'danger', 'approveAll decodes danger: ' + t1.lines[0].html.replace(/<[^>]+>/g, '').slice(0, 90));
const t2 = E.decodeTx(E.demoTx('sendSol')); ok(t2.level === 'warn' && /12 SOL/.test(t2.lines[0].html), 'sendSol decodes: ' + t2.lines[0].html.replace(/<[^>]+>/g, ''));
for (const n of [12, 24]) { const d1 = E.makeDecoyPhrase(n), d2 = E.makeDecoyPhrase(n); ok(d1.length === n && E.mnemonicChecksumOK(d1) && E.detectSeed(d1.join(' ')).hit, `decoy ${n} words: valid checksum + detected by stopper`); ok(d1.join(' ') !== d2.join(' '), `decoy ${n} words: random each time`); }
console.log(fail ? fail + ' FAILED' : 'all passed'); process.exit(fail ? 1 : 0);
