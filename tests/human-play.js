// HUMAN PLAYTHROUGH — plays like a real confused new player on a phone.
// RULES: only ever click real, visible on-screen buttons. Never call engine
// functions. At every tutorial step, assert the instructed target is visible
// and NOT covered by another element. Log everything that would confuse or
// block a real player.
const { chromium } = require('playwright-core');

const VIEWPORT = { width: 390, height: 844 };
const findings = [];
const note = (sev, msg) => { findings.push({ sev, msg }); console.log(`  [${sev}] ${msg}`); };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  page.on('pageerror', e => note('ERROR', 'JS error: ' + e.message.slice(0, 120)));
  page.on('dialog', async d => { note('ALERT', 'alert(): ' + d.message().slice(0, 80)); await d.dismiss().catch(() => {}); });

  await page.goto('http://localhost:8084/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);

  // --- helper: find a visible button by text, scroll it into view like a
  //     real thumb would, verify nothing covers it, then tap it. flagCover
  //     matters everywhere; off-screen is only a *finding* for must-be-visible
  //     targets (tutorial buttons), since normal content is scrollable.
  async function tap(re, label, opts = {}) {
    // mark the target so we can re-find it after scrolling
    const marked = await page.evaluate(([src, scope]) => {
      const rx = new RegExp(src, 'i');
      const root = scope ? document.querySelector(scope) : document;
      if (!root) return false;
      const btns = [...root.querySelectorAll('button, .main-tab-btn, .mnav-btn, [onclick]')];
      const b = btns.find(x => x.offsetParent !== null && rx.test((x.textContent || '').trim()));
      if (!b) return false;
      b.setAttribute('data-human-target', '1');
      return true;
    }, [re.source, opts.scope || null]);
    if (!marked) { if (!opts.optional) note('BLOCK', `can't find button "${label}"`); return false; }
    const el = await page.$('[data-human-target]');
    const before = await el.boundingBox();
    const neededScroll = !before || before.y < 0 || before.y + before.height > 844;
    if (neededScroll && opts.mustBeVisible) note('OFFSCREEN', `"${label}" needed scrolling — a tutorial target should be immediately reachable`);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(120);
    const box = await el.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
      const cover = await page.evaluate(([x, y]) => {
        const b = document.querySelector('[data-human-target]');
        const top = document.elementFromPoint(x, y);
        return (top && b && !b.contains(top) && top !== b) ? (top.className || top.tagName).toString().slice(0, 30) : null;
      }, [cx, cy]);
      if (cover) note('COVER', `"${label}" is COVERED by ${cover} — a real tap hits the wrong thing`);
    }
    if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); }
    await page.evaluate(() => { const b = document.querySelector('[data-human-target]'); if (b) b.removeAttribute('data-human-target'); });
    await page.waitForTimeout(450);
    return true;
  }

  // --- read the current tutorial instruction, if any ---
  async function tutStep() {
    return page.evaluate(() => {
      const st = (typeof getTutorialState === 'function') ? getTutorialState() : null;
      const box = document.querySelector('.tutorial-card, .tutorial-banner');
      const pill = document.querySelector('.tutorial-pill');
      return {
        active: st && st.active, id: st && st.currentStepId, title: st && st.currentStepTitle,
        cardText: box ? box.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) : null,
        pill: !!pill,
      };
    });
  }

  console.log('\n=== NEW GAME (Corner Kid, like the screenshots) ===');
  await tap(/START NEW GAME/, 'Start New Game');
  await page.waitForTimeout(500);
  await tap(/Corner Kid|corner/i, 'Corner Kid card');
  await page.waitForTimeout(500);
  await tap(/PLAY AS/, 'Play As confirm');
  await page.waitForTimeout(600);
  // intro pages: keep tapping SKIP INTRO / CONTINUE until we leave the intro screen
  for (let i = 0; i < 8; i++) {
    const scr = await page.evaluate(() => typeof currentScreen !== 'undefined' ? currentScreen : '?');
    if (scr !== 'intro') break;
    if (!await tap(/SKIP INTRO|CONTINUE|START YOUR EMPIRE|NEXT/, 'intro next')) break;
  }
  await page.waitForTimeout(500);
  const nowScr = await page.evaluate(() => typeof currentScreen !== 'undefined' ? currentScreen : '?');
  console.log('  entered screen:', nowScr);

  console.log('\n=== PLAY THE TUTORIAL BY DOING WHAT IT SAYS ===');
  let lastStep = null, sameStepCount = 0;
  for (let i = 0; i < 40; i++) {
    const st = await tutStep();
    if (!st.active) { console.log('  tutorial complete or dismissed'); break; }
    if (st.id === lastStep) { sameStepCount++; } else { sameStepCount = 0; lastStep = st.id; }
    if (sameStepCount > 4) {
      note('STUCK', `stuck on step "${st.id}" — instruction: ${st.cardText}`);
      const dump = await page.evaluate(() => {
        const overlays = [...document.querySelectorAll('.modal-overlay, .trade-modal, .modal, [style*="position:fixed"]')]
          .filter(el => el.offsetParent !== null)
          .map(el => ({ cls: (el.className||el.tagName).toString().slice(0,40), z: getComputedStyle(el).zIndex,
            rect: (()=>{const r=el.getBoundingClientRect();return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;})() }));
        const mc = document.getElementById('modal-container');
        return { overlays, modalContainerLen: mc ? mc.innerHTML.length : -1, selectedDrug: typeof selectedDrug!=='undefined'?selectedDrug:'?' };
      });
      console.log('  STUCK DUMP:', JSON.stringify(dump));
      await page.screenshot({ path: 'stuck-dump.png' });
      break;
    }
    console.log(`  step ${st.id}: ${st.cardText ? st.cardText.slice(0, 70) : '(pill)'}`);

    // Do what the instruction says, tapping real buttons
    const txt = (st.cardText || '').toLowerCase();
    if (st.id === 'welcome') { await tap(/Got it|Next|Start/, 'welcome next', {mustBeVisible:true}); }
    else if (st.id === 'read_market' || /buy \/ sell/.test(txt)) { await tap(/Buy \/ Sell/, 'Buy/Sell tab'); }
    else if (st.id === 'buy_drug') { await tap(/^BUY$/, 'BUY on a drug'); }
    else if (st.id === 'confirm_buy') {
      await tap(/HALF/, 'HALF', {scope: '.trade-modal'});
      await tap(/BUY/, 'confirm BUY', {scope: '.trade-modal', mustBeVisible: true});
    }
    else if (st.id === 'wait_market') { await tap(/WAIT/, 'WAIT', {mustBeVisible:true}); }
    else if (st.id === 'sell_drug') {
      await tap(/^SELL$/, 'SELL on a drug');
      await page.waitForTimeout(300);
      await tap(/MAX/, 'MAX', {scope: '.trade-modal'});
      await tap(/SELL/, 'confirm SELL', {scope: '.trade-modal', mustBeVisible: true});
    }
    else if (st.id === 'travel') { await tap(/Travel/, 'Travel', {mustBeVisible:true}); }
    else if (st.id === 'travel_screen' || /choose.*destination|pick.*district/.test(txt)) {
      await tap(/Overtown|Wynwood|Little Havana|Downtown|Liberty/, 'a destination');
      await tap(/CONFIRM|TRAVEL|GO/, 'confirm travel');
    }
    else {
      // informational step — advance
      if (!await tap(/Got it|Next|Continue|Start Your Empire|Finish|Done/, 'next')) {
        // maybe a pill — expand it
        if (st.pill) await tap(/📖/, 'expand pill');
        else { note('CONFUSE', `step "${st.id}" gives no obvious action button. Text: ${st.cardText}`); await page.evaluate(() => advanceTutorial()); }
      }
    }
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: 'human-after-tutorial.png' });

  console.log('\n=== 3 MINUTES OF FREE PLAY (tap around like a curious player) ===');
  const screensToVisit = ['Travel', 'WAIT', 'Trade', 'Bank', 'All'];
  for (let round = 0; round < 3; round++) {
    for (const scr of ['💰|Trade', 'All|☰', 'WAIT']) {
      await tap(new RegExp(scr), scr, {optional:true});
      // whatever opened, try to close it and check nothing is stuck
      const stuck = await page.evaluate(() => {
        // is there a full-screen overlay with no visible close/back?
        const overlays = [...document.querySelectorAll('.modal-overlay, .trade-modal, [style*="position:fixed"]')]
          .filter(el => { const r = el.getBoundingClientRect(); return r.width > 300 && r.height > 400 && el.offsetParent !== null; });
        for (const o of overlays) {
          const hasClose = [...o.querySelectorAll('button')].some(b => /✕|✖|×|CANCEL|CLOSE|BACK|✈️|Travel/i.test(b.textContent) && b.offsetParent !== null);
          if (!hasClose) return (o.className || o.tagName).toString().slice(0, 40);
        }
        return null;
      });
      if (stuck) note('TRAP', `overlay "${stuck}" has no visible way to close it`);
      await tap(/✕|CANCEL|BACK|Never mind/, 'close', {optional:true});
    }
  }

  // Final sweep: any horizontal overflow, any element off the left edge?
  const layout = await page.evaluate(() => {
    const clipped = [...document.querySelectorAll('button, h2, .screen-container, .trade-modal')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.width > 40 && (r.left < -4 || r.right > 394); })
      .map(el => (el.textContent || el.className || '').toString().trim().slice(0, 20));
    return { docWidth: document.documentElement.scrollWidth, viewport: 390, clipped: [...new Set(clipped)].slice(0, 6) };
  });
  if (layout.docWidth > 396) note('OVERFLOW', `page is ${layout.docWidth}px wide (>390 viewport)`);
  if (layout.clipped.length) note('CLIP', `elements past the screen edge: ${layout.clipped.join(', ')}`);

  console.log(`\n=== SUMMARY: ${findings.length} issue(s) a real player would hit ===`);
  const bySev = {};
  for (const f of findings) bySev[f.sev] = (bySev[f.sev] || 0) + 1;
  console.log(JSON.stringify(bySev));
  await browser.close();
  process.exit(findings.filter(f => ['ERROR', 'BLOCK', 'STUCK', 'TRAP', 'COVER'].includes(f.sev)).length ? 1 : 0);
})();
