// Builds index.html from /src. Usage: node tools/build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = fileURLToPath(new URL('../src/', import.meta.url));
const out = fileURLToPath(new URL('../index.html', import.meta.url));
const r = f => readFileSync(dir + f, 'utf8');
export function engineSource() {
  let checker = r('_p_checker.js');
  checker = checker.replace('    const isKnownHost', '    let KN = KNOWN;\n    const isKnownHost');
  const bip = `    const BIP39_RAW = "${r('_bip39.txt').trim()}";\n    const TH = CFG.thresholds;\n`;
  return [bip, checker, r('_p_age.js'), r('engine_mid.js'), r('_p_tx.js')].join('\n');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const js = [r('core.js'), engineSource(), r('ui_a.js'), r('ui_b.js'), r('ui_c.js'), existsSync(dir + 'intro.js') ? '\n    /* ===== INTRO (removable block) ===== */\n' + r('intro.js') + '\n    /* ===== /INTRO ===== */\n' : '', r('boot.js')].join('\n');
  const logoUri = 'data:image/png;base64,' + readFileSync(dir + '_logo.png').toString('base64');
  const html0 = r('head.html') + '<style>\n' + r('style.css') + '\n</style>\n' + r('body.html') + '\n<script type="module">\n' + js + '\n</script>\n</body>\n</html>\n';
  const html = html0.replace('__LOGO_PNG__', () => logoUri);
  writeFileSync(out, html);
  /* syntax-check the module script before declaring success (no files left behind) */
  const tmp = join(mkdtempSync(join(tmpdir(), 'canary-')), 'module.mjs'); writeFileSync(tmp, js.replace('__LOGO_PNG__', ''));
  const chk = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  if (chk.status !== 0) { console.error(chk.stderr); process.exit(1); }
  console.log('built index.html', (html.length / 1024).toFixed(0) + ' KB, module syntax OK');
}
