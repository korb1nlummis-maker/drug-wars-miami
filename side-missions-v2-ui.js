/**
 * side-missions-v2-ui.js - Drug Wars: Miami Vice Edition
 * Player-facing UI for the Side Missions V2 system (side-missions-v2.js).
 *
 * 40 multi-chapter mission chains were previously processed daily but invisible.
 * This file adds a "Side Ops" screen with:
 *   - Available Chains  (offers with 14-day expiry, requirements, Start button)
 *   - Active Chains     (current chapter, outcome choices, time limits, Abandon)
 *   - Completed / Failed log + stats
 *
 * Self-wiring: this file does NOT require edits to game-ui.js. It wraps the
 * global render() to handle the 'sidechains' screen and injects a sidebar
 * button next to the Campaign button on the main game screen.
 * Load it AFTER game-ui.js (a <script src="side-missions-v2-ui.js"> tag in
 * index.html); it also self-hooks on DOMContentLoaded if loaded earlier.
 */

// ============================================================
// STATE HELPERS
// ============================================================

// Self-heal: make sure gameState.sideMissionsV2 exists (older saves).
function ensureSideMissionsV2State() {
  if (typeof gameState === 'undefined' || !gameState) return null;
  if (!gameState.sideMissionsV2) {
    gameState.sideMissionsV2 = typeof initSideMissionsV2State === 'function'
      ? initSideMissionsV2State()
      : { activeChains: {}, completedChains: [], failedChains: [], availableChains: [], chainLog: [], stats: { totalStarted: 0, totalCompleted: 0, totalFailed: 0 } };
  }
  const sm = gameState.sideMissionsV2;
  // Heal partially-missing fields on old/corrupted saves
  if (!sm.activeChains) sm.activeChains = {};
  if (!sm.completedChains) sm.completedChains = [];
  if (!sm.failedChains) sm.failedChains = [];
  if (!sm.availableChains) sm.availableChains = [];
  if (!sm.chainLog) sm.chainLog = [];
  if (!sm.stats) sm.stats = { totalStarted: 0, totalCompleted: 0, totalFailed: 0 };
  return sm;
}

function sideChainById(id) {
  if (typeof getChainById === 'function') return getChainById(id);
  if (typeof SIDE_MISSIONS_V2 !== 'undefined') return SIDE_MISSIONS_V2.find(c => c.id === id) || null;
  return null;
}

// Human-readable requirement list for a chain condition, with met/unmet flags.
// Mirrors checkChainCondition() in side-missions-v2.js.
function describeChainRequirements(state, cond) {
  const reqs = [];
  if (!cond) return reqs;
  const day = state.day || 0;
  const cash = state.cash || 0;
  const heat = state.heat || 0;
  const crew = (state.henchmen || []).length;
  const act = typeof getCurrentActNumber === 'function' ? getCurrentActNumber(state) : 1;
  if (cond.minDay) reqs.push({ label: `Reach Day ${cond.minDay}`, met: day >= cond.minDay });
  if (cond.minCash) reqs.push({ label: `$${cond.minCash.toLocaleString()} cash on hand`, met: cash >= cond.minCash });
  if (cond.minHeat) reqs.push({ label: `Heat ${cond.minHeat}+`, met: heat >= cond.minHeat });
  if (cond.minCrew) reqs.push({ label: `${cond.minCrew}+ crew members`, met: crew >= cond.minCrew });
  if (cond.minAct) reqs.push({ label: `Reach Act ${cond.minAct}`, met: act >= cond.minAct });
  if (cond.hasBusiness) reqs.push({ label: 'Own a business', met: !(state.businesses && (!state.businesses.owned || state.businesses.owned.length === 0)) });
  return reqs;
}

// Last resolved outcome, shown as a result banner at the top of the screen.
let _sideChainLastResult = null;

// ============================================================
// RENDER: SIDE OPS SCREEN
// ============================================================

function renderSideChains() {
  if (typeof gameState === 'undefined' || !gameState) {
    if (typeof currentScreen !== 'undefined') currentScreen = 'title';
    return typeof renderTitle === 'function' ? renderTitle() : '';
  }
  const sm = ensureSideMissionsV2State();
  const day = gameState.day || 0;
  const dataLoaded = typeof SIDE_MISSIONS_V2 !== 'undefined';

  // --- Result banner (last chapter outcome) ---
  let resultHtml = '';
  if (_sideChainLastResult) {
    const r = _sideChainLastResult;
    resultHtml = `
      <div class="card" style="border-color:${r.failed ? '#ff4466' : r.completed ? 'var(--neon-green)' : 'var(--neon-cyan)'}">
        <div class="card-header">
          <span>${r.emoji || '📜'} ${r.chainName}</span>
          <span class="${r.failed ? '' : r.completed ? 'neon-green' : 'neon-cyan'}" style="${r.failed ? 'color:#ff4466' : ''}">${r.failed ? '✖ ABANDONED' : r.completed ? '✓ CHAIN COMPLETE' : 'CHAPTER RESOLVED'}</span>
        </div>
        <p style="font-size:0.9rem">${r.text}</p>
        <button class="btn btn-sm btn-secondary" onclick="_sideChainLastResult=null; render();">Dismiss</button>
      </div>`;
  }

  // --- Available chains (offers, expire 14 days after offeredDay) ---
  const offers = (sm.availableChains || []).map(a => {
    const chain = sideChainById(a.id);
    if (!chain) return '';
    const age = day - (a.offeredDay || 0);
    const daysLeft = Math.max(0, 14 - age);
    const reqs = describeChainRequirements(gameState, chain.condition);
    const conditionsMet = typeof checkChainCondition === 'function' ? checkChainCondition(gameState, chain.condition) : reqs.every(r => r.met);
    const unmet = reqs.filter(r => !r.met);
    const reqsHtml = reqs.length > 0 ? `
      <div style="font-size:0.78rem;margin-top:0.3rem">
        ${reqs.map(r => `<div style="color:${r.met ? '#00ff88' : '#ff6644'}">${r.met ? '✓' : '✗'} ${r.label}</div>`).join('')}
      </div>` : '';
    return `
      <div class="card" style="border-color:${conditionsMet ? 'var(--neon-yellow)' : 'var(--text-dim)'}">
        <div class="card-header">
          <span>${chain.emoji || '📋'} ${chain.name}</span>
          <span style="font-size:0.8rem;color:${daysLeft <= 3 ? '#ff6644' : '#aaa'}">⏰ ${daysLeft} day${daysLeft === 1 ? '' : 's'} left</span>
        </div>
        <p class="text-dim" style="font-size:0.85rem;margin-bottom:0.2rem">${chain.chapters && chain.chapters[0] ? chain.chapters[0].description : ''}</p>
        <div style="font-size:0.75rem;color:#88ccff">${(chain.category || 'general').toUpperCase()} · ${chain.chapters ? chain.chapters.length : '?'} chapters</div>
        ${reqsHtml}
        ${conditionsMet
          ? `<button class="btn btn-sm btn-buy" style="margin-top:0.5rem" onclick="doStartSideChain('${chain.id}')">▶ Start Chain</button>`
          : `<button class="btn btn-sm btn-secondary" style="margin-top:0.5rem;opacity:0.5;cursor:not-allowed" disabled title="Requirements not met">🔒 ${unmet.length > 0 ? 'Requires: ' + unmet.map(r => r.label).join(', ') : 'Requirements not met'}</button>`}
      </div>`;
  }).join('');

  // --- Active chains (current chapter + outcome choices) ---
  const activeIds = Object.keys(sm.activeChains || {});
  const activeHtml = activeIds.map(chainId => {
    const active = sm.activeChains[chainId];
    const chain = sideChainById(chainId);
    if (!chain || !active) return '';
    const totalChapters = chain.chapters ? chain.chapters.length : 0;
    const chapter = chain.chapters ? chain.chapters[active.currentChapter] : null;
    if (!chapter) return '';
    const chapterPct = totalChapters > 0 ? Math.round((active.currentChapter / totalChapters) * 100) : 0;

    // Time limit countdown (chain fails in daily processing when elapsed > daysLimit)
    let timerHtml = '';
    if (chapter.daysLimit) {
      const elapsed = day - (active.chapterStartDay !== undefined ? active.chapterStartDay : active.startDay || 0);
      const daysLeft = Math.max(0, chapter.daysLimit - elapsed);
      const timePct = Math.max(0, Math.min(100, Math.round((daysLeft / chapter.daysLimit) * 100)));
      timerHtml = `
        <div style="margin-top:0.3rem">
          <div style="display:flex;justify-content:space-between;font-size:0.75rem">
            <span style="color:${daysLeft <= 2 ? '#ff4466' : '#ffcc00'}">⏳ Time limit: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining</span>
          </div>
          <div class="stat-bar" style="height:4px"><div class="stat-fill" style="width:${timePct}%;background:${daysLeft <= 2 ? '#ff4466' : '#ffcc00'}"></div></div>
        </div>`;
    }

    // Outcome choice buttons. Disable choices whose upfront cost exceeds cash on
    // hand (resolveChainChapter itself does not check affordability).
    const choicesHtml = (chapter.outcomes || []).map((o, idx) => {
      const cost = o.effects && typeof o.effects.cash === 'number' && o.effects.cash < 0 ? -o.effects.cash : 0;
      const affordable = cost === 0 || (gameState.cash || 0) >= cost;
      if (!affordable) {
        return `<button class="btn btn-sm btn-secondary" style="display:block;width:100%;text-align:left;margin:0.25rem 0;opacity:0.5;cursor:not-allowed" disabled title="Not enough cash">🔒 ${o.label} (need $${cost.toLocaleString()})</button>`;
      }
      return `<button class="btn btn-sm ${o.endsChain ? 'btn-secondary' : 'btn-buy'}" style="display:block;width:100%;text-align:left;margin:0.25rem 0" onclick="doResolveSideChain('${chainId}', ${idx})">${o.endsChain ? '🚪' : '▶'} ${o.label}</button>`;
    }).join('');

    return `
      <div class="card card-highlight" style="border-color:var(--neon-cyan)">
        <div class="card-header">
          <span>${chain.emoji || '📋'} ${chain.name}</span>
          <span class="neon-cyan" style="font-size:0.8rem">Chapter ${active.currentChapter + 1}/${totalChapters}</span>
        </div>
        <div class="stat-bar" style="height:5px"><div class="stat-fill" style="width:${chapterPct}%;background:var(--neon-cyan)"></div></div>
        <div style="margin-top:0.4rem;font-weight:bold;color:var(--neon-yellow)">${chapter.title}</div>
        <p class="text-dim" style="font-size:0.85rem">${chapter.description}</p>
        ${timerHtml}
        <div style="margin-top:0.5rem;font-size:0.7rem;color:#aaa;text-transform:uppercase;letter-spacing:1px">Choose your move</div>
        ${choicesHtml}
        <button class="btn btn-sm btn-secondary" style="margin-top:0.4rem;border-color:#ff4466;color:#ff4466" onclick="doAbandonSideChain('${chainId}')">✖ Abandon Chain</button>
      </div>`;
  }).join('');

  // --- Completed / failed log ---
  const completedHtml = (sm.completedChains || []).map(id => {
    const chain = sideChainById(id);
    if (!chain) return '';
    const entry = (sm.chainLog || []).slice().reverse().find(l => l.id === id && l.action === 'completed');
    return `<div style="padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.85rem">
      <span style="color:#00ff88">✓</span> ${chain.emoji || ''} ${chain.name}
      <span class="text-dim" style="font-size:0.75rem">${entry ? ' — Day ' + entry.day : ''}</span>
    </div>`;
  }).join('');

  const failedHtml = (sm.failedChains || []).map(id => {
    const chain = sideChainById(id);
    if (!chain) return '';
    const entry = (sm.chainLog || []).slice().reverse().find(l => l.id === id && l.action === 'failed');
    return `<div style="padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.85rem">
      <span style="color:#ff4466">✗</span> ${chain.emoji || ''} ${chain.name}
      <span class="text-dim" style="font-size:0.75rem">${entry ? ' — Day ' + entry.day + (entry.reason ? ' (' + entry.reason + ')' : '') : ''}</span>
    </div>`;
  }).join('');

  const stats = sm.stats || { totalStarted: 0, totalCompleted: 0, totalFailed: 0 };
  const totalChains = dataLoaded ? SIDE_MISSIONS_V2.length : (typeof SIDE_MISSIONS_V2_COUNT !== 'undefined' ? SIDE_MISSIONS_V2_COUNT : 40);

  return `
    <div class="screen-container">
      ${typeof renderToolbar === 'function' ? renderToolbar() : ''}
      ${typeof backButton === 'function' ? backButton() : ''}
      <h2 class="section-title" style="text-align:center">📜 SIDE OPS</h2>
      <p class="text-dim" style="text-align:center;font-size:0.85rem;margin-bottom:1rem">
        Mission chains from the streets of Miami. Offers expire after 14 days.
        Started: ${stats.totalStarted} · Completed: ${stats.totalCompleted}/${totalChains} · Failed: ${stats.totalFailed}
      </p>
      ${resultHtml}
      <h3 class="neon-cyan" style="margin:1rem 0 0.5rem">🎬 Active Chains (${activeIds.length})</h3>
      ${activeHtml || '<p class="text-dim">No active chains. Start one from the offers below.</p>'}
      <h3 class="neon-yellow" style="margin:1rem 0 0.5rem">📋 Available Chains (${(sm.availableChains || []).length})</h3>
      ${offers || '<p class="text-dim">No offers on the table. New chains surface as you play — keep hustling and check back after a few days.</p>'}
      ${(completedHtml || failedHtml) ? `
        <h3 class="text-dim" style="margin:1rem 0 0.5rem">🗂️ History</h3>
        <div class="card">
          ${completedHtml ? `<div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.3rem">Completed (${(sm.completedChains || []).length})</div>${completedHtml}` : ''}
          ${failedHtml ? `<div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin:0.5rem 0 0.3rem">Failed (${(sm.failedChains || []).length})</div>${failedHtml}` : ''}
        </div>` : ''}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}

// ============================================================
// HANDLERS
// ============================================================

function doStartSideChain(chainId) {
  const sm = ensureSideMissionsV2State();
  if (!sm) return;
  const chain = sideChainById(chainId);
  if (!chain) {
    if (typeof showNotification === 'function') showNotification('Mission chain not found.', 'error');
    if (typeof playSound === 'function') playSound('error');
    return;
  }
  if (typeof checkChainCondition === 'function' && !checkChainCondition(gameState, chain.condition)) {
    if (typeof showNotification === 'function') showNotification('You don\'t meet the requirements for this chain yet.', 'error');
    if (typeof playSound === 'function') playSound('error');
    return;
  }
  if (typeof startChainV2 !== 'function') {
    if (typeof showNotification === 'function') showNotification('Side missions system not loaded.', 'error');
    return;
  }
  const firstChapter = startChainV2(gameState, chainId);
  if (!firstChapter) {
    if (typeof showNotification === 'function') showNotification('Could not start that chain.', 'error');
    if (typeof playSound === 'function') playSound('error');
    return;
  }
  if (typeof playSound === 'function') playSound('click');
  if (typeof showNotification === 'function') showNotification(`Chain started: ${chain.name}`, 'success');
  if (gameState.messageLog) gameState.messageLog.push(`📜 Side op started: ${chain.emoji || ''} ${chain.name} — "${firstChapter.title}"`);
  _sideChainLastResult = null;
  render();
}

function doResolveSideChain(chainId, outcomeIndex) {
  const sm = ensureSideMissionsV2State();
  if (!sm) return;
  const chain = sideChainById(chainId);
  const active = sm.activeChains ? sm.activeChains[chainId] : null;
  if (!chain || !active) {
    if (typeof showNotification === 'function') showNotification('That chain is no longer active.', 'error');
    if (typeof playSound === 'function') playSound('error');
    render();
    return;
  }
  const chapter = chain.chapters[active.currentChapter];
  const outcome = chapter && chapter.outcomes ? chapter.outcomes[outcomeIndex] : null;
  if (!outcome) {
    if (typeof showNotification === 'function') showNotification('Invalid choice.', 'error');
    return;
  }
  // Affordability guard: resolveChainChapter applies negative cash unchecked.
  const cost = outcome.effects && typeof outcome.effects.cash === 'number' && outcome.effects.cash < 0 ? -outcome.effects.cash : 0;
  if (cost > 0 && (gameState.cash || 0) < cost) {
    if (typeof showNotification === 'function') showNotification(`Not enough cash — you need $${cost.toLocaleString()}.`, 'error');
    if (typeof playSound === 'function') playSound('error');
    return;
  }
  if (typeof resolveChainChapter !== 'function') {
    if (typeof showNotification === 'function') showNotification('Side missions system not loaded.', 'error');
    return;
  }
  const res = resolveChainChapter(gameState, chainId, outcomeIndex);
  if (!res) {
    if (typeof showNotification === 'function') showNotification('Could not resolve that chapter.', 'error');
    if (typeof playSound === 'function') playSound('error');
    render();
    return;
  }

  const gained = outcome.effects && typeof outcome.effects.cash === 'number' && outcome.effects.cash > 0;
  if (typeof playSound === 'function') playSound(gained ? 'cash' : 'click');

  _sideChainLastResult = {
    chainName: chain.name,
    emoji: chain.emoji,
    completed: !!res.completed,
    failed: false,
    text: res.result || 'Done.'
  };

  if (gameState.messageLog) {
    gameState.messageLog.push(`📜 ${chain.emoji || ''} ${chain.name} — ${chapter.title}: ${res.result || outcome.label}`);
    if (res.completed) gameState.messageLog.push(`🏁 Side op chain complete: ${chain.name}`);
  }
  if (typeof showNotification === 'function') {
    showNotification(res.completed ? `Chain complete: ${chain.name}!` : `Chapter complete — "${chain.name}" continues.`, 'success');
  }
  render();
}

function doAbandonSideChain(chainId) {
  const sm = ensureSideMissionsV2State();
  if (!sm || !sm.activeChains || !sm.activeChains[chainId]) {
    render();
    return;
  }
  const chain = sideChainById(chainId);
  const name = chain ? chain.name : chainId;
  if (typeof confirm === 'function' && !confirm(`Abandon "${name}"? The chain will count as failed and cannot be restarted.`)) return;
  if (typeof failChainV2 === 'function') {
    failChainV2(gameState, chainId, 'Abandoned');
  } else {
    // Minimal fallback mirroring failChainV2
    delete sm.activeChains[chainId];
    if (!sm.failedChains.includes(chainId)) sm.failedChains.push(chainId);
    sm.stats.totalFailed++;
    sm.chainLog.push({ id: chainId, action: 'failed', reason: 'Abandoned', day: gameState.day || 0 });
  }
  if (typeof playSound === 'function') playSound('error');
  if (typeof showNotification === 'function') showNotification(`Abandoned: ${name}`, 'error');
  if (gameState.messageLog) gameState.messageLog.push(`✖ Side op abandoned: ${name}`);
  _sideChainLastResult = { chainName: name, emoji: chain ? chain.emoji : '📜', completed: false, failed: true, text: 'You walked away. The opportunity is gone for good.' };
  render();
}

function openSideChainsScreen() {
  if (typeof playSound === 'function') playSound('click');
  currentScreen = 'sidechains';
  render();
}

// ============================================================
// SELF-WIRING: render() hook + sidebar nav button
// (No edits to existing files required.)
// ============================================================

function _sideChainsBadgeCount() {
  if (typeof gameState === 'undefined' || !gameState || !gameState.sideMissionsV2) return 0;
  const sm = gameState.sideMissionsV2;
  return Object.keys(sm.activeChains || {}).length + (sm.availableChains || []).length;
}

function _injectSideChainsNavButton() {
  if (typeof document === 'undefined') return;
  const app = document.getElementById('app');
  if (!app) return;
  const existing = document.getElementById('side-chains-nav-btn');
  if (existing) return;

  // Anchor next to the Campaign sidebar button
  let anchor = null;
  const buttons = app.querySelectorAll('button.btn-sidebar');
  for (let i = 0; i < buttons.length; i++) {
    const oc = buttons[i].getAttribute('onclick') || '';
    if (oc.indexOf("currentScreen='campaign'") !== -1) { anchor = buttons[i]; break; }
  }
  if (!anchor && buttons.length > 0) anchor = buttons[buttons.length - 1];
  if (!anchor || !anchor.parentNode) return;

  const btn = document.createElement('button');
  btn.id = 'side-chains-nav-btn';
  btn.className = 'btn btn-sidebar btn-secondary';
  btn.style.borderColor = '#cc88ff';
  btn.style.color = '#cc88ff';
  const n = _sideChainsBadgeCount();
  btn.textContent = `📜 Side Ops${n > 0 ? ' (' + n + ')' : ''}`;
  btn.setAttribute('onclick', 'openSideChainsScreen()');
  anchor.parentNode.insertBefore(btn, anchor.nextSibling);
}

(function _hookSideChainsIntoRender() {
  function applyHook() {
    if (typeof render !== 'function') return false;
    if (render._sideChainsHooked) return true;
    const _origRender = render;
    render = function () {
      _origRender.apply(this, arguments);
      if (typeof currentScreen === 'undefined') return;
      if (currentScreen === 'sidechains') {
        const app = document.getElementById('app');
        if (app) app.innerHTML = renderSideChains();
      } else if (currentScreen === 'game') {
        _injectSideChainsNavButton();
      }
    };
    render._sideChainsHooked = true;
    return true;
  }
  if (!applyHook() && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', applyHook);
  }
})();
