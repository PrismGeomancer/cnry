# Canary

Landing site, interactive demo and link checker for the Canary Solana browser extension.
Everything ships as one file: **`index.html`** (HTML, CSS and JS embedded; only GSAP and Google Fonts load from a CDN).

## Run it
Open `index.html` in a browser, or serve the folder (`python3 -m http.server 8765`). Serving it is only needed for `blocklist.json` to load (browsers block `fetch` on `file://`; it then counts as empty).

## Configure (top of `index.html`, `window.CANARY_CONFIG`)
| Key | What it does |
| --- | --- |
| `x`, `xHandle` | Your X profile and handle for the share posts. |
| `extensionStatus`, `installUrl` | `"pending"` shows the "Waiting for approval from Google" pill and a "Follow on X" link. Set `"live"` and paste the Chrome Web Store link into `installUrl`: every install pill becomes "Add to Chrome". |
| `api` | Optional backend (routes documented in the config comment). Empty = everything runs in the browser. |
| `knownSites` | Legitimate domains used for look-alike matching. Edit freely. |
| `thresholds` | `minDomainAgeDays`, `lookalikeDistance`, `softFlagsForRuffled`. |
| `features` | `sound`, `intro`, `wallet`, `api` switches. |

## Flip to live
1. In `index.html` set `extensionStatus: "live"` and `installUrl: "https://chromewebstore.google.com/detail/..."`.
2. Done. No other edits.

## Source layout
`src/` holds the pieces, `node tools/build.mjs` stitches them into `index.html` and syntax-checks the script.
The intro lives in `src/intro.js` and in clearly marked `INTRO` blocks (CSS, markup, script) in the built file. Delete those blocks to remove it.

## Decoy phrases (the scrambler and tripwire)
When the seed phrase stopper catches a recovery phrase, the page can hand it a decoy instead. The decoy is made from fresh random entropy on the device (valid BIP39 words and checksum). It is **not** a scrambled copy of anything the user typed, so it reveals nothing about a real phrase. The extension is meant to watch the decoy and notify the user if a site tries to use it. On this website that part is a clearly labelled demo (the "Pretend the site uses it" button); no on-chain watching happens here.

## Tools
- `node tools/engine-test.mjs`: runs the rule engine, BIP39 detection, SHA-256 and transaction decoder headlessly.
- `node tools/behavior-test.mjs`: browser tests (needs `cd tools && npm i` and a local server on :8765).
- `node tools/export-store.mjs`: exports the Chrome Web Store art to `assets/store/`.

## Honesty rules baked in
Counters start at zero and only rise from real use in this browser (or from `api` if set). The demo and practice site use fictional sites and are labelled. Nothing is stored or sent from the seed phrase demo.
