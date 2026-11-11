# CANARY: Claude Code build prompt (landing site + interactive checker)

Paste everything below the line into Claude Code.

---

ROLE
You are a senior creative developer and crypto-product designer. Build me a complete, working, animation-heavy landing site for a new Solana security project. It must feel like a fresh, original project, not a template and not a copy of any reference. Motion and interaction are a big part of the product feel: the visitor should want to play with it.

THE PROJECT
- Name: CANARY
- One-line concept: A browser extension for Solana that sends a decoy "canary" wallet to a new site first, listens to what the site tries, and tells you in plain words before your real wallet ever connects.
- Narrative / villain / promise: Miners used to send a canary down the shaft first. If it went quiet, they turned back. Fake sites, fake mints and fake wallet apps look exactly like the real ones, and the only way to know is to test them before your real wallet is anywhere near. Tagline: "Send the canary first." Second line: "When the canary goes quiet, don't connect."
- The three tests:
  1. Ask around: what do others say about this site? Scam reports and community vouches. If nobody has reviewed it, Canary says so and hands you a short DYOR checklist.
  2. Spot the fake: look-alike spelling, brand-new domain, suspicious address tricks.
  3. Send the canary: the site is shown a decoy wallet with a small believable balance. Anything it tries to take or approve is translated into plain words before your real wallet is involved.
- One extra feature: Seed phrase stopper. If you type or paste a 12 or 24 word recovery phrase into a website, Canary stops you before the page can read it. Almost no website ever needs it.
- Live status (the "watch it work" feel): the toolbar icon always shows the canary's state, so you can see it working without opening anything.
- Three verdict states, inverted from the usual: **Singing** (nothing found, stay alert), **Ruffled** (something's off, look closer), **Silent** (stop). Never use the word "safe".
- The algorithm: "the Ear". It starts rule-based and learns new warning calls over time from confirmed reports, community vouches and corrections. Public counters show what it has learned.
- Audience: Solana meme-coin traders and holders who connect to a new site every day.
- Chain and wallets: Solana: Phantom, Solflare, Backpack.
- Reference (structure and feeling only): an "install it and forget it" security tool whose appeal is that you can see it working live. Borrow nothing else. Do NOT copy any layout, wording, claims, statistics, press quotes, awards, pricing or visuals from that reference or from any other security product.
- My X link: CONFIG.x, placeholder "https://x.com/" until I fill it.
- Install status: CONFIG.extensionStatus is "pending" or "live" (default "pending"), and CONFIG.installUrl holds the Chrome Web Store link once live.
  - While "pending", every install button becomes a non-clickable pill with a small hourglass-and-feather icon that reads: "Waiting for approval from Google. Come back later." A secondary text link next to it reads "Follow on X for the launch" and goes to CONFIG.x. Do not render a dead "Add to Chrome" link.
  - When "live" and installUrl is set, the pill becomes "Add to Chrome" linking to installUrl. Switching is one config change.
  - The site must still fully showcase the extension through designed visuals (see EXTENSION SHOWCASE). Do not show store ratings, user counts, "featured" badges, a Chrome Web Store logo, press quotes, testimonials or awards.

DIFFERENTIATION RULE
Before building, state in two lines how this identity differs from typical crypto security sites (blue shields, padlocks, navy gradients, glassmorphism) and from dark, orange-on-black "guard dog" or "sentinel" looks. Do not use a shield, padlock, dog or robot guard as the main mark.

STEP 0: PLAN FIRST (short, then build without further questions)
1. Narrative angle (already chosen): "Send the canary first". Write 3 hero headline variants in the plan, pick one for the hero and say why in one line. Candidates: "Send the canary first." / "When the canary goes quiet, don't connect." / "Test the site before it tests you."
2. Visual direction (already chosen): "Sunlit riso paper".
   - Look: risograph / paper cut-out. Flat overprinted colour layers with slight misregistration, halftone dots, paper grain, hand-cut shapes with soft drop shadows. Warm, friendly, slightly retro mine-safety-poster energy. It must be light, not a dark theme.
   - Palette: canary yellow #FFD23F, ink navy #14213D, cream paper #FFF6DC, tomato red #E63946 (alerts and Silent only), plus soft tints of those. No neon, no purple gradients.
   - Type: chunky soft display for headlines (e.g. Fraunces 900 with soft/wonk axes, or Gloock), friendly sans for body (e.g. Figtree), mono for data (e.g. IBM Plex Mono). Give fallbacks.
   - Verdicts must not rely on colour alone: Singing = open-beak icon with music notes, Ruffled = feathers-up icon with a dashed border, Silent = closed-beak icon under a cage cloth with a heavy border and a subtle shake.
3. Hero object (already chosen): an original, hand-cut canary in a brass birdcage hanging from a hook. The canary's head follows the cursor, it hops between perches, and clicking makes it sing (a ripple of notes and a soft chirp if sound is on). It is not any existing cartoon canary or bird mascot.
You may deviate only if you find a clearly better option. If so, say so in one line.

TECH
One index.html (everything embedded), ES module script, vanilla JS, GSAP 3 + ScrollTrigger via a pinned CDN version (cdnjs or jsDelivr), canvas 2D for halftone/paper effects and particles, SVG for the bird, cage and icons. No build step, no heavy frameworks, no three.js. Fonts from Google Fonts with fallbacks. If GSAP fails to load, the page must still render fully (static layout, no intro, plain CSS transitions).

ANIMATION AND INTERACTION (core of the brief)
1. Cage as cursor: on desktop, a small canary follows the pointer with a springy delay and reacts to what it passes: it perks up over trustworthy-looking elements and puffs up over "fake" cards, which then get a red SILENT stamp. On touch, a draggable canary does the same, and everything important is also visible without it.
2. Hero canary: head follows the pointer, idle wing flutter and hops, sings on click or tap (note ripple, tiny bob). Press and hold on the cage to throw the cage cloth over it (the Silent state) and release to uncover.
3. Pinned scroll story (GSAP ScrollTrigger): a fake "claim your airdrop" site in a browser frame. As the user scrolls, Test 1 lights up (asking around), Test 2 lights up (look-alike letters get circled), Test 3 lights up (the canary is lowered into the site on a rope as a decoy wallet; a hidden transfer request appears and is rewritten into plain words), ending with the canary going quiet and a SILENT stamp. Scrubbed by scroll, with a replay button.
4. "Practice site" (the one interactive walkthrough): a clearly labelled fake site we built (fictional brand, invented address, no real brand names) with a Connect Wallet button. Clicking triggers the Canary popup mock, which runs the three tests with animation and lets the visitor choose Block it / Go anyway. Nothing connects to a wallet. Label: "Practice site: a fake site we built so you can see Canary work. Nothing here touches a wallet."
5. Link checker (real tool, see below): the canary hops from perch to perch as each test runs, then a verdict stamp slams down.
6. Seed phrase stopper demo (see below): typing the public test words triggers a cage-cloth drop and a stop screen.
7. Counters: numbers count up when scrolled into view and show only real values (see data rules).
8. Micro-interactions: magnetic buttons, stamp-slam on verdicts, paper-cut hover tilt on cards, a text scramble on the headline that resolves to the final words, subtle misregistration shift on hover. Keep everything 60fps; throttle pointer handlers; pause when the tab is hidden.
9. Sound: off by default, toggle in the top bar. WebAudio-generated chirps, a short song for Singing, and a low flutter for Ruffled. No audio files.
10. Respect prefers-reduced-motion: no intro, no scrubbed scroll story (show it as static steps), no cursor-follow bird (static), no shakes.

5-SECOND CINEMATIC INTRO
Step 1: concept (already chosen, build this unless you find it doesn't fit).
Concept: "Down the Shaft". Black-to-cream: the screen starts dark with a single headlamp beam, descending a mine shaft. A brass cage swings into the light with a sleepy canary inside. Three wooden doors on the shaft wall open one at a time, each showing a site address behind it (fictional, not real brands, e.g. claim-lunaris-drop.top, wallet-verify.app, free-mint-now.io). At the first two the canary chirps and a Singing note floats up; at the third the cage rattles, the feathers puff, the canary goes quiet and a red SILENT stamp lands. Then the lamp swings up, the shaft walls fall away into cream paper, and the canary perks up and settles into the exact hero composition of the home page. It fits because the whole product is "send the canary first", and the final frame is the page's first frame.
State the concept and why it fits in one sentence before building.

Step 2: rules.
- Exactly 5 seconds, ending with a clean hand-off. The final frame matches the page's first frame so the crossfade is seamless. One continuous camera and motion idea. Slow start, accelerating finish. Timing guide: 0–1.0s dark descent, headlamp beam; 1.0–1.8s cage swings in, canary wakes; 1.8–3.6s three doors open (≈0.6s each), chirp, chirp, silence and stamp; 3.6–4.3s lamp swings up, walls dissolve to cream; 4.3–5.0s canary settles into the hero.
- Built with GSAP timelines from the site's own data in JS. No filler text. Use the project's palette, fonts and logo.
- Small unobtrusive HUD caption (e.g. "LEVEL 03 / 03: SILENT") and a SKIP button. Skippable by button, click, Esc, Enter or Space.
- Play once per browser session (sessionStorage) and never when prefers-reduced-motion is set. Decide this in an inline script in <head> by adding a class to <html>, so the page never flashes before the intro. Lock scroll while it plays.
- Expose a promise (introDone) so the page's own entrance animations start only after the hand-off. Add a "Replay intro" link in the footer.
- Works at desktop and phone width; adapt the framing for portrait.
- Keep it as a clearly marked, removable block (an INTRO section in the CSS and a separate intro.js module, or one commented block if a single file is required).
- Verify: capture frames at 1s, 2s, 3s, 4s, 4.6s and 5s at desktop and phone size, look at them, fix anything broken or off-brand. Confirm skip, once-per-session, reduced motion and replay all work and the console has no errors.

PAGES (hash router: #/ , #/demo, #/check, #/stopper, #/report, #/calls, #/how, #/install)
- Top bar: logo, nav (Demo, Check a link, Seed stopper, Warning calls, How it works, Report), install pill, sound toggle. "Demo" is the first nav item and is visually emphasised (yellow pill). Esc returns home. A GSAP page transition (a torn-paper wipe) between pages.
- HOME: hero, "Fake sites look real" section, the three tests, the pinned scroll story, the extension showcase, the Practice site, the warning-call counters, install CTA, FAQ, footer.
- CHECK, STOPPER, REPORT, CALLS (public stats), HOW, INSTALL pages as described below.
- Footer on every page: nav links, X link, short disclaimer, "Replay intro".

DEMO PAGE (#/demo, required, the clearest proof of what the extension does)
The extension is not installable yet, so visitors must be able to try it here. Build a dedicated Demo page and link to it from the hero ("Watch the demo"), the top bar, the install pill area and the footer. Everything on it is clearly labelled "Demo" and uses fictional sites only (invented names and addresses, no real brands, no real wallets, nothing connects).
Layout: a split view. Left, a fictional website in a browser frame. Right, the Canary popup exactly as the extension will show it. A scenario picker (tabs) above, a stepper below (Connect → Test 1 → Test 2 → Test 3 → Verdict) with Next / Replay, and Block it / Go anyway buttons that react.
Four scenarios (each fully interactive and animated):
1. Fake airdrop. Site: "LUNARIS DROP", address claim-lunaris-drop.top, asks to connect to claim tokens. Outcome: Silent. The decoy wallet is shown to the site, a hidden "move all tokens" request appears and is rewritten in plain words.
2. Look-alike swap. Site: "TIDEPOOL SWAP" copied from a fictional real site "Tidepool" at tidepool.finance, fake address tide-pool.finance (one hyphen added). Outcome: Silent, with the look-alike letters circled in orange against the real address.
3. Brand-new project nobody has reviewed. Site: "MOSSBACK MINT", a young domain, no reports. Outcome: Ruffled, and the DYOR checklist opens.
4. A site that checks out. Site: "TIDEPOOL" at tidepool.finance (the fictional real one). Outcome: Singing, with the line "Nothing found. That doesn't make it safe. Stay alert." This shows the extension doesn't cry wolf.
Bonus tab 5: Recovery phrase. A fake restore page; the public test words trigger the seed phrase stopper (same behaviour as #/stopper).
Each scenario ends with a "What just happened" box in two or three plain sentences, and a share button ("I tried Canary's demo...").
Rules: the demo logic must be driven by the same rule engine as the real Link Checker where possible (not hard-coded screenshots), with scripted inputs for the fictional sites. Label the page "Demo" and add the caption: "Everything on this page is a demo with fictional sites. Nothing here touches a wallet."
Demo copy: Title "See Canary in action". Subtitle "Pick a scam. Hit Connect. Watch the canary work." Tabs: "Fake airdrop" / "Look-alike swap" / "Nobody's reviewed it" / "A site that checks out" / "Recovery phrase". Stepper labels: Connect / Ask around / Spot the fake / Send the canary / Verdict. Buttons: Next / Replay / Block it / Go anyway. After Block: "Good call. The canary never left the cage." After Go anyway: "In real life, this is where you'd sign."

EXTENSION SHOWCASE (required, works while the install is pending)
The extension is not installable yet, so the site must make it feel real through design. Build every visual in HTML/CSS/SVG (no stock photos, no screenshots of other products), in the riso paper style, as polished product art. Place the showcase on Home (a dedicated section) and a fuller gallery on the Install page.
1. Browser scene: a generic browser window frame (our own design, not a copy of any real browser's UI or logo) with the Canary toolbar icon pinned and the popup open over a fake site. The three verdict states are shown as three popup versions the visitor can switch between with a segmented control; the stamp slams in on each switch.
2. Toolbar icon states: the canary icon singing, ruffled and silent (under a cloth), animated between states.
3. Three tests popup: the rows (Ask around, Spot the fake, Send the canary) filling in one by one, looping gently, with look-alike letters circled in the address.
4. Decoy wallet card: the "canary wallet" with a small believable balance and the site's request shown beside it, rewritten into plain words ("This lets the site move all your USDC. Canary went quiet.").
5. No-reviews state: the DYOR checklist card exactly as the extension will show it.
6. Seed phrase stopper card: the stop screen shown over a fake form.
7. Settings mockup: sound on/off, trusted sites list, "What I can see" list.
8. Store-listing art (also deliverables): export PNG files at Chrome Web Store sizes with a headless browser: 1280x800 screenshots (the 5 best scenes), a 440x280 small promo tile and a 1400x560 marquee tile. Save to /assets/store/.
9. Interaction: scenes tilt with the pointer, the popup is clickable (Block it / Go anyway react), scenes animate in with ScrollTrigger. On touch, use tap and swipe.
10. Honesty rules for visuals: captions say what the extension does, never claim user counts, ratings, partnerships or store badges, and never show real brands or logos. Use fictional site names.
11. Showcase copy: Title "See it at the door". Subtitle "This is what Canary does the moment a site asks for your wallet." Captions: "Singing: nothing found. Stay alert." / "Ruffled: something's off. Look closer." / "Silent: stop. This looks like a scam." / "Three tests, one answer." / "What the site tried to take, in plain words." / "You stay in control."

LINK CHECKER (real, client-side)
Input: a site address (accept with or without https://). Run these checks in the browser and animate them as the three tests:
- Test 1, Ask around: look the domain up in (a) `blocklist.json` shipped with the site (starts empty, loaded with graceful failure), (b) locally stored reports and vouches, (c) optional `CONFIG.api` lookup if set. Results: "Reported as a scam", "Vouched for by the community", or "Nobody has reviewed this yet". For the last one, show the DYOR checklist (see copy).
- Test 2, Spot the fake: parse the URL safely; flag punycode / mixed-script (homoglyph) hosts; flag look-alike spelling against `CONFIG.knownSites` using edit distance and common swaps (rn→m, 0→o, l→i, doubled letters, added hyphens, extra words like "claim", "verify", "airdrop"); flag soft-risk TLDs only as a minor signal; flag very long subdomain chains; check domain age via RDAP where the browser allows it, with a friendly "couldn't check age" fallback.
- Test 3, Send the canary: on this page, explain that the decoy-wallet test runs inside the extension, and offer a "Paste a transaction request" box that decodes simple Solana transaction data if the user pastes a base64 transaction (token transfers, SetAuthority, Approve/delegate, system transfers) into plain words. If decoding fails, say so plainly.
- `CONFIG.knownSites`: a list of well-known legitimate Solana wallet/dApp domains for look-alike matching. Verify each canonical domain with a web search before including it, keep only domains you can confirm, and keep the list easy to edit. Do not invent domains.
- Verdict logic is rule-based and shown on the page under "How Canary decides". Silent if on a blocklist or reported, or a close look-alike of a known site, or a homoglyph host. Ruffled if two or more softer flags (new domain, risky TLD, scam-style keywords, no reviews). Otherwise Singing. Never output "safe".
- Thresholds live in CONFIG (minDomainAgeDays, lookalikeDistance, softFlagsForRuffled).

SEED PHRASE STOPPER DEMO (#/stopper)
- Explain the feature and show a fake sign-in form (fictional brand). A button "Fill with the public test words" inserts the public BIP39 test phrase (the well-known "abandon … about" vector, which controls no funds). Detection runs locally against the BIP39 English word list and checks 12/24-word sequences, with the checksum validity as a bonus signal. When triggered: the cage cloth drops, the field is cleared, and the stop screen appears.
- Big warning above the field: "Never type your real recovery phrase anywhere on this site. Use the test words. Nothing here is stored or sent."
- Do not store, log or transmit anything typed into the field. Add a note that the real extension does the same check on your device and never sends what you type anywhere.
- If the BIP39 word list can't be embedded or fetched, say so plainly and fall back to a simpler pattern check.

WALLET (optional, only for reports)
- The checker and every other page work without a wallet. Say so: "You never need to connect a wallet to use Canary."
- The Report page offers an optional "Sign to add weight" button. Connect modal lists Phantom, Solflare, Backpack, Coinbase, Trust with Detected/Install labels (opens the download page if not installed). Use each wallet's injected provider. Support connect, disconnect, accountChanged, quiet reconnect (onlyIfTrusted).
- Reports only ever request a signMessage signature. Never request transactions or move funds, and say so in the UI.
- Handle errors with friendly messages.

LOCAL FUNCTIONALITY AND CONFIG
- State in localStorage with try/catch wrappers. Optional `CONFIG.api` that mirrors reports/vouches to a backend and returns warning-call stats.
- A single window.CANARY_CONFIG object at the top: x, extensionStatus, installUrl, rpc, api, knownSites, thresholds, feature flags (sound, intro, wallet, api).

CONTENT AND DATA RULES
- Be upfront that the interactive demos are demos. The words "Demo", "Practice site" and "public test words" are allowed and required on the Demo page, the Practice site and the stopper page. Everywhere else, no "demo", "example", "sample" or "placeholder" wording, and nothing fictional may ever be presented as a real record (reports, users, stats).
- Do NOT fabricate activity. Stats start at their true values (zero) and rise only from real use: sites tested in this browser, reports submitted, and, if CONFIG.api is set, the totals it returns. No invented reports, reviews, user names, "protected wallets", dollar amounts saved, testimonials, press quotes or partner logos.
- The warning-calls feed starts with its honest empty state until the first call is learned.
- Copy: short, concrete, no jargon walls. Every page must be understandable in 5 seconds.

BRAND
- Mark: an original hand-cut canary in profile, mid-song, with a tiny cage-door hook behind it; reduces to bird head and beak at 16px for the favicon. Provide an SVG version and write me a ready-to-paste image prompt for generating a polished version. When I send back a PNG, make its background transparent (flood/silhouette mask, anti-aliased edges), embed it as a base64 data URI, and use it in the header and favicon.
- Never copy a real brand, character, logo or existing artwork.

---

## COPY DECK (use verbatim unless it breaks the layout)

**Meta title:** Canary: Send the canary first.
**Meta description:** A Solana browser extension that tests a site with a decoy wallet before your real wallet ever connects.

### Home
- Headline: Send the canary first.
- Sentence: Canary is a browser extension for Solana. Before a new site ever sees your real wallet, it shows the site a decoy, listens to what the site tries, and tells you in plain words.
- Sub-line: When the canary goes quiet, don't connect.
- Buttons: Watch the demo / Check a link / install pill (pending: "Waiting for approval from Google. Come back later." + text link "Follow on X for the launch"; live: "Add to Chrome")
- Home section "See Canary in action": four scenario cards (Fake airdrop, Look-alike swap, Nobody's reviewed it, A site that checks out), each with a small looping animation of the popup verdict and a "Try it" button that opens that scenario on the Demo page.
- Hover hint: Move your mouse. The canary will follow.

**Section: Fake sites look real.**
- Title: Fake sites look real. The only way to know is to test them.
- Body: Miners used to send a canary down the shaft first. If it went quiet, they turned back. Canary does the same for fake mints, fake airdrops and fake wallet apps, before your real wallet is anywhere near them.
- Three cards: Fake mint pages / Fake airdrop claims / Fake wallet and swap apps.

**Section: Three tests.**
- Title: Three tests. Before you connect.
- Test 1, Ask around: "What do other people say about this site? Canary checks scam reports and community vouches. If nobody has looked at it yet, it tells you so and walks you through a quick check of your own."
- Test 2, Spot the fake: "Look-alike spelling, brand-new domains, address tricks. If a site is dressed up as something it isn't, Canary notices."
- Test 3, Send the canary: "Canary shows the site a decoy wallet with a small balance. If the site tries to take it, or asks for something it shouldn't, you hear about it before your real wallet is involved, in plain words."

**Section: Seed phrase stopper**
- Title: Your recovery phrase never goes on a website.
- Body: If you type or paste your 12 or 24 recovery words into a web page, Canary stops you before the page can read them. Almost no website ever needs them.
- Link: See it work

**Section: Always on, always visible**
- Title: Watch it work.
- Body: The canary lives in your toolbar. Singing means nothing found. Ruffled means look closer. Silent means stop.

**The three verdicts**
- Singing: Nothing found. Stay alert.
- Ruffled: Something's off. Look closer before you go on.
- Silent: Stop. This looks like a scam.

**Section: The Ear**
- Title: The Ear gets sharper
- Body: Every confirmed scam teaches Canary a new warning call. Sites built from the same kit, using the same wallets or the same tricks get caught faster next time.
- Counters: Sites tested (in this browser) / Reports received / Warning calls learned / Silent calls this week
- Under counters: Warning calls learned this week: [N]
- Empty state: No warning calls yet. The first ones are learned at launch.

**Practice site section**
- Title: Try to fool the canary
- Body: Here's a fake site we built. Hit Connect and watch Canary stop you.
- Label: Practice site: a fake site we built so you can see Canary work. Nothing here touches a wallet.
- Fake site content (fictional brand): "LUNARIS DROP. Claim your free 500 token airdrop. Connect your wallet to claim." Address bar: claim-lunaris-drop.top. Button: Connect Wallet.
- Popup on click: THE CANARY WENT QUIET (then the tests run)
- Buttons: Block it / Go anyway
- After Block: Good call. The canary never left the cage.
- After Go anyway: In real life, this is where you'd sign. The canary would stay silent until you left.

**FAQ**
- Does Canary hold my funds or keys? No. It never asks for your seed phrase or private keys and it never moves funds.
- What is the decoy wallet? A throwaway wallet with a small balance that Canary shows to a new site instead of your real one, so it can see what the site tries to do.
- Do I need to connect my wallet to use the site? No. The checker works without a wallet.
- Does it say a site is safe? No. It says Singing, Ruffled or Silent. Singing means nothing was found, not that it's safe.
- What if a site has no reviews? Canary says so and gives you a short checklist to do your own research.
- How does it get smarter? From confirmed reports, community vouches and corrections.
- Which wallets? Phantom, Solflare and Backpack.
- Which browsers? Chrome first.

### Check page
- Title: Check a link
- Subtitle: Paste a site address. The canary takes a look.
- Field label: Site address
- Hint: Paste the address of the site that's asking you to connect.
- Button: Send the canary
- Empty card: Paste a link and the canary will check it.
- Loading: The canary is listening…
- Test row titles: 1 Ask around · 2 Spot the fake · 3 Send the canary
- Test 1 results: Reported as a scam / Vouched for by the community / Nobody has reviewed this yet
- DYOR checklist (shown when nobody has reviewed it):
  - Title: Nobody's looked at this one. Do your own research.
  - Steps:
    1. Go to the project's official X account and see which website it links to. Does it match this address exactly?
    2. Check how old the site and the X account are. Brand-new is a red flag.
    3. Search "[site name] scam" and read what comes up.
    4. Look for a real team, real docs and a real community, not just a mint button.
    5. If you still want to try it, use a fresh wallet with a small amount.
- Result sentences:
  - Singing: "Singing. Canary found nothing wrong with [site]. That doesn't make it safe, so stay alert."
  - Ruffled: "Ruffled. [Reason 1] and [reason 2]. Look closer before you connect."
  - Silent: "Silent. [Reason]. Don't connect."
- Under verdict: Canary warns. You decide.
- Section: How Canary decides: "Silent" if the site is reported, blocklisted or a close look-alike of a well-known site. "Ruffled" if there are two or more softer flags, like a brand-new domain, scam-style words or no reviews. Otherwise "Singing". Every flag is listed above, with its reason.
- Transaction paste box: Paste a transaction request (optional) / Read it / Couldn't read that. It may be in a format Canary doesn't support yet.
- Errors:
  - Invalid link: That doesn't look like a website address. Check it and try again.
  - Network: Couldn't reach a data source. The other checks still ran.
  - Age: Couldn't check the site's age this time.
- Share: Share on X, pre-written: I sent the canary to [site] before connecting: [verdict]. Send the canary first. [link]

### Seed phrase stopper page
- Title: The seed phrase stopper
- Subtitle: See what happens when a recovery phrase lands on a web page.
- Warning: Never type your real recovery phrase anywhere on this site. Use the test words. Nothing here is stored or sent.
- Button: Fill with the public test words
- Fake form (fictional brand): "ORBITAL VAULT. Restore your wallet. Enter your 12-word recovery phrase."
- Stop screen: Stopped. That looked like a recovery phrase. No real website needs it. Your words never left your device.
- Buttons: Clear it / Learn why
- Why: Anyone who has your recovery phrase controls your wallet, forever. Fake restore pages exist to collect it.

### Report page
- Title: Report a site
- Subtitle: Help the Ear learn.
- Fields: Site address / What happened (Asked me to connect and I lost funds · Fake copy of a known site · Fake airdrop or mint · Asked for my recovery phrase · Other) / Details (optional) / Link to proof (optional)
- Wallet option: Sign to add weight (optional). Canary only asks you to sign a message. It never moves your funds.
- Button: Send report
- Success: Thanks. Your report is in the queue. A warning call is learned once it's checked.
- Note: Don't include seed phrases, private keys or personal details.
- Vouch buttons on a result: This site is legit / Report this site

### Warning calls page
- Title: Warning calls
- Subtitle: What the Ear has learned so far.
- Tiles: Sites tested in this browser / Reports received / Warning calls learned / Silent calls this week
- How a call is learned: 1 Reported. 2 Checked. 3 Matched with similar sites. 4 Added to the Ear.
- Feed card fields: address (partly covered by a cloth until hovered), first seen, verdict, "heard [n] times"
- Empty state: No warning calls yet. The first ones are learned at launch.

### How it works
- Title: How Canary works
- 4 steps:
  1. Install. Add Canary to Chrome.
  2. Browse. It stays quiet until a site asks to connect or sign.
  3. Test. Three tests run, with a decoy wallet, before your real one connects.
  4. Decide. Singing, Ruffled or Silent, with reasons. You choose.
- What Canary watches for: Look-alike addresses / Brand-new domains / Sites reported by others / Requests that let a site move all your tokens / Recovery phrases typed into web pages
- What the extension can see: the address of the site you're on, and when that site asks to connect or sign. It does not read your passwords or your keys. (Adjust this list to match the extension once it's built.)
- Line: Canary warns. You decide. It can't see everything, so never sign something you don't understand.

### Install page
- Title: Add Canary
- Button (live): Add to Chrome
- Status (pending, default): Waiting for approval from Google. Come back later.
  - Supporting line: Canary has been submitted and is waiting for Google's review. Follow on X and you'll hear the moment it's live.
  - Link: Follow on X for the launch
  - Keep the three steps and the full showcase visible below.
- 3 steps: Install → Pin it → Browse as usual
- Permissions block: What it can see / What it never touches
- Roadmap: Now: Chrome · Next: alerts when something changes on your wallet · Later: other browsers

### Top bar / modal
- Nav: Demo · Check a link · Seed stopper · Warning calls · How it works · Report
- Wallet button: Connect wallet / [first 4…last 4] / Disconnect
- Modal title: Connect a wallet (optional)
- Modal note: Only needed to sign a report. Canary only asks you to sign a message and never moves your funds.
- Toasts: Wallet connected. / Wallet disconnected. / Signature cancelled. Nothing was sent. / Link copied.

### Footer (every page)
- Links: Check a link · Seed stopper · Warning calls · How it works · Report · X · Replay intro
- Disclaimer: Canary is a warning tool, not financial advice or a guarantee. Scams change fast and you can lose funds even if the canary keeps singing.

### Extension popup (also used in the Practice site and hero mockup)
- Header: THE CANARY WENT QUIET (Silent) / THE CANARY IS NERVOUS (Ruffled) / THE CANARY IS SINGING (Singing)
- Site line: [address]
- Test rows: 1 Ask around / 2 Spot the fake / 3 Send the canary, each with a status and one-line reason
- Verdict stamp: SINGING / RUFFLED / SILENT
- Buttons: Block it / Go anyway
- Footnote: Canary warns. You decide.

---

## ENGINEERING RULES
- Route ALL internal #links through a click handler that sets location.hash and calls the router. Plain anchor links can fail in previews or embedded frames.
- Use position-based z-index carefully: top bar above pages, pages above background canvas, intro, modal and toast above everything.
- After every build, extract the module script and run `node --check`; confirm every `$('#id')` selector has a matching id in the HTML.
- Test the router headlessly (stub GSAP if the network is blocked) and take screenshots. Say plainly what you could and couldn't test (for example, real wallet providers).
- Performance: cap particle counts, use transforms and opacity for animation, throttle pointer handlers, pause when the tab is hidden, test at phone width. Keep paper-grain and halftone effects cheap (pre-rendered canvas or CSS).
- Accessibility: keyboard reachable controls, visible focus states, ARIA labels on the verdict stamps, AA contrast on the light theme (navy on cream, never yellow text on cream).
- Never copy a real brand, character, logo or existing artwork.

## PROCESS
- Create a task list and keep it updated. Narrate minimally.
- Build in stages: palette and paper style → hero canary and cursor bird → pages → link checker → seed stopper demo → scroll story, showcase and practice site → intro → wallet (report signing) → polish.
- Verify before delivering. Deliver the file, then summarise in a few lines: what it is, what was and wasn't tested, what I can configure, how to flip CONFIG.extensionStatus from "pending" to "live", and one next step.

## DELIVERABLES
- index.html (everything embedded), intro.js (or a clearly marked intro block), blocklist.json (empty array), logo SVG, and the image-generation prompt for the logo.
- /assets/store/: Chrome Web Store screenshots (1280x800 PNG, up to 5), small promo tile (440x280) and marquee tile (1400x560), exported from the showcase scenes.
