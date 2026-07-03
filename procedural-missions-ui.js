/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Street Contracts UI
   Player-facing screen for the procedural mission generator
   (procedural-missions.js). Adds:
     - "Street Contracts" screen (currentScreen === 'contracts')
     - Sidebar entry point injected next to the Missions button
     - Accept / choose approach / complete / abandon handlers
   This file only ADDS behavior; it does not modify other files.
   It must be loaded AFTER game-ui.js and procedural-missions.js.
   ============================================================ */

// ============================================================
// HELPERS
// ============================================================

// Resolve the player's current district NAME (procedural missions
// store district display names like 'Liberty City', while
// gameState.currentLocation holds an id like 'liberty_city').
function _contractsCurrentDistrictName() {
  if (typeof gameState === 'undefined' || !gameState) return null;
  var id = gameState.currentLocation || gameState.location || '';
  if (typeof LOCATIONS !== 'undefined' && LOCATIONS && LOCATIONS.length) {
    for (var i = 0; i < LOCATIONS.length; i++) {
      if (LOCATIONS[i].id === id) return LOCATIONS[i].name;
    }
  }
  if (typeof MIAMI_DISTRICTS !== 'undefined' && MIAMI_DISTRICTS && MIAMI_DISTRICTS.length) {
    for (var j = 0; j < MIAMI_DISTRICTS.length; j++) {
      if (MIAMI_DISTRICTS[j].id === id) return MIAMI_DISTRICTS[j].name;
    }
  }
  return null;
}

// checkProceduralProgress() compares state.currentLocation against
// district NAMES. Feed it a shallow state copy whose currentLocation
// is the resolved district name so location checks actually work.
function _contractProgress(missionId) {
  if (typeof checkProceduralProgress !== 'function') return null;
  try {
    var shim = gameState;
    var districtName = _contractsCurrentDistrictName();
    if (districtName) {
      shim = Object.assign({}, gameState, { currentLocation: districtName });
    }
    return checkProceduralProgress(shim, missionId);
  } catch (e) {
    return null;
  }
}

function _contractStars(difficulty) {
  var d = Math.max(1, Math.min(5, difficulty || 1));
  var out = '';
  for (var i = 1; i <= 5; i++) out += (i <= d) ? '★' : '☆';
  return out;
}

function _contractDiffColor(tier) {
  var colors = { easy: '#00ff88', medium: '#ffcc00', hard: '#ff8844', extreme: '#ff4444' };
  return colors[tier] || '#ffcc00';
}

function _contractTemplateName(templateId) {
  if (typeof MISSION_TEMPLATES !== 'undefined' && MISSION_TEMPLATES) {
    for (var i = 0; i < MISSION_TEMPLATES.length; i++) {
      if (MISSION_TEMPLATES[i].id === templateId) {
        return MISSION_TEMPLATES[i].emoji + ' ' + MISSION_TEMPLATES[i].name;
      }
    }
  }
  return templateId || 'Contract';
}

function _contractLog(msg) {
  if (typeof gameState !== 'undefined' && gameState) {
    if (!gameState.messageLog) gameState.messageLog = [];
    gameState.messageLog.push(msg);
  }
}

// Best-effort NPC/client name for the card header.
function _contractClientName(m) {
  var d = m.missionData || {};
  var npc = d._contact || d._target || d._vip || d._owner || d._hostage ||
            d._recruit || d._planner || d._chemist || d._collector ||
            d._insider || d._defender || d._leaderA;
  if (npc && npc.displayName) return npc.displayName;
  return null;
}

// ============================================================
// SELF-HEAL / SEEDING
// ============================================================

function ensureContractsState() {
  if (typeof gameState === 'undefined' || !gameState) return null;

  // Self-heal missing state
  if (!gameState.proceduralMissions && typeof initProceduralState === 'function') {
    gameState.proceduralMissions = initProceduralState();
  }
  var proc = gameState.proceduralMissions;
  if (!proc) return null;

  // Older saves may miss newer fields
  if (!proc.availableMissions) proc.availableMissions = [];
  if (!proc.activeMissions) proc.activeMissions = [];
  if (!proc.missionLog) proc.missionLog = [];
  if (!proc.activeChains) proc.activeChains = [];
  if (!proc.completedChains) proc.completedChains = [];
  if (!proc.traits) proc.traits = [];
  if (!proc.unlockedPerks) proc.unlockedPerks = [];
  if (!proc.templateCompletions) proc.templateCompletions = {};
  if (typeof proc.totalRewardsEarned !== 'number') proc.totalRewardsEarned = 0;

  // Starter generation: if the board is empty (e.g. day 1 before the
  // first day tick), run the real daily processor once. It only
  // generates when it hasn't run for the current day, so this is safe.
  if (proc.availableMissions.length === 0 && typeof processProceduralDaily === 'function') {
    try {
      var msgs = processProceduralDaily(gameState) || [];
      for (var i = 0; i < msgs.length; i++) _contractLog(msgs[i]);
    } catch (e) { /* never break rendering */ }
  }

  return proc;
}

// ============================================================
// RENDER: STREET CONTRACTS SCREEN
// ============================================================

function renderContracts() {
  if (typeof gameState === 'undefined' || !gameState) {
    currentScreen = 'title';
    return typeof renderTitle === 'function' ? renderTitle() : '';
  }

  var proc = ensureContractsState();
  if (!proc) {
    return '<div class="screen-container">' +
      (typeof renderToolbar === 'function' ? renderToolbar() : '') +
      (typeof backButton === 'function' ? backButton() : '') +
      '<h2 class="section-title" style="color:#cc66ff">📜 STREET CONTRACTS</h2>' +
      '<p class="text-dim">The contract network is offline (procedural-missions.js not loaded).</p>' +
      '<button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var currentDay = gameState.day || gameState.currentDay || 1;
  var hereDistrict = _contractsCurrentDistrictName();

  // ---------- ACTIVE CHAINS ----------
  var chainsHtml = '';
  if (proc.activeChains.length > 0) {
    chainsHtml = proc.activeChains.map(function(ch) {
      var pct = ch.totalParts > 0 ? Math.round((ch.completedParts / ch.totalParts) * 100) : 0;
      return `
        <div class="card" style="border-color:#cc66ff">
          <div class="card-header">
            <span>🔗 ${ch.name}</span>
            <span class="neon-cyan">Part ${Math.min(ch.currentPart, ch.totalParts)}/${ch.totalParts}</span>
          </div>
          <div class="stat-bar"><div class="stat-fill" style="width:${pct}%;background:#cc66ff"></div></div>
          <p class="text-dim" style="font-size:0.8rem;margin-top:0.3rem">${(ch.narrativeArc && ch.narrativeArc[Math.min(ch.currentPart, ch.totalParts) - 1]) || ''}</p>
          <div style="font-size:0.8rem;color:var(--neon-green)">Chain bonus on completion: $${(ch.bonusReward || 0).toLocaleString()}</div>
        </div>`;
    }).join('');
  }

  // ---------- ACTIVE CONTRACTS ----------
  var activeHtml = '';
  if (proc.activeMissions.length > 0) {
    activeHtml = proc.activeMissions.map(function(m) {
      var deadline = (m.acceptedDay || currentDay) + m.duration;
      var daysLeft = deadline - currentDay;
      var urgency = daysLeft <= 0 ? '#ff0000' : daysLeft <= 1 ? '#ff6600' : '#ffcc00';
      var progress = _contractProgress(m.id);
      var ready = !!(progress && progress.canComplete);
      var hint = progress && progress.hint ? progress.hint : '';

      var modTags = (m.modifiers || []).map(function(mod) {
        return `<span style="display:inline-block;background:rgba(204,102,255,0.12);border:1px solid rgba(204,102,255,0.35);border-radius:4px;padding:0.05rem 0.35rem;margin:0.1rem 0.2rem 0.1rem 0;font-size:0.7rem" title="${mod.description || ''}">${mod.emoji} ${mod.name}</span>`;
      }).join('');

      var compTags = (m.complications || []).map(function(c) {
        return `<span style="display:inline-block;background:rgba(255,102,68,0.1);border:1px solid rgba(255,102,68,0.35);border-radius:4px;padding:0.05rem 0.35rem;margin:0.1rem 0.2rem 0.1rem 0;font-size:0.7rem" title="${c.description || ''}">⚠️ ${c.name}</span>`;
      }).join('');

      var notesHtml = (m.briefingNotes && m.briefingNotes.length > 0)
        ? `<div style="font-size:0.75rem;color:#88aaff;margin:0.3rem 0">${m.briefingNotes.map(function(n) { return '• ' + n; }).join('<br>')}</div>`
        : '';

      // Approach selection (real approach ids from the mission object,
      // including extras added by modifiers like witness / moral dilemma)
      var approachHtml = '';
      if (m.chosenApproach) {
        approachHtml = `<div style="font-size:0.8rem;color:#88ccff;margin:0.3rem 0">🧭 Approach locked in: <b>${m.chosenApproach.name}</b></div>`;
      } else if (m.approachOptions && m.approachOptions.length > 0) {
        approachHtml = `<div style="margin:0.4rem 0">
          <div style="font-size:0.75rem;color:#88ccff;margin-bottom:0.2rem">Choose your approach (optional, affects consequences):</div>
          ${m.approachOptions.map(function(a) {
            return `<button class="btn btn-sm btn-secondary" style="margin:0.15rem 0.3rem 0.15rem 0" title="${(a.description || '')}" onclick="doChooseContractApproach('${m.id}','${a.id}')">${a.name}</button>`;
          }).join('')}
        </div>`;
      }

      var chainBadge = m.chainId ? `<span style="color:#cc66ff;font-size:0.75rem"> 🔗 Chain part ${m.chainPart || '?'}</span>` : '';

      return `
        <div class="card" style="border-color:${ready ? 'var(--neon-green)' : 'var(--neon-cyan)'}${ready ? ';box-shadow:0 0 10px rgba(0,255,136,0.15)' : ''}">
          <div class="card-header">
            <span>${m.name}${chainBadge}</span>
            <span style="color:${urgency};font-weight:bold">${daysLeft <= 0 ? 'LAST CHANCE' : daysLeft + 'd left'}</span>
          </div>
          <p class="text-dim" style="font-size:0.85rem">${m.description}</p>
          <div style="font-size:0.8rem;margin:0.2rem 0">
            <span style="color:${_contractDiffColor(m.difficultyTier)}">${_contractStars(m.difficulty)}</span>
            <span class="text-dim"> ${typeof getDifficultyLabel === 'function' ? getDifficultyLabel(m.difficultyTier) : m.difficultyTier}</span>
            <span class="text-dim"> | 📍 ${m.district}${hereDistrict === m.district ? ' <span style="color:#00ff88">(you are here)</span>' : ''}</span>
          </div>
          ${modTags || compTags ? `<div>${modTags}${compTags}</div>` : ''}
          ${notesHtml}
          ${hint ? `<div style="font-size:0.75rem;color:#88aaff;font-style:italic;margin:0.3rem 0">HINT: ${hint}</div>` : ''}
          ${approachHtml}
          <div style="font-size:0.8rem;color:var(--neon-green);background:rgba(0,255,136,0.05);padding:0.3rem 0.5rem;border-radius:4px;margin:0.3rem 0">Payout: $${m.reward.toLocaleString()}</div>
          <div style="display:flex;gap:0.3rem;margin-top:0.3rem;flex-wrap:wrap">
            <button class="btn btn-sm ${ready ? 'btn-buy' : 'btn-secondary'}" onclick="doCompleteContract('${m.id}')">${ready ? '✅ Complete Contract' : '⚠️ Attempt Completion'}</button>
            <button class="btn btn-sm btn-danger" onclick="doAbandonContract('${m.id}')">❌ Abandon</button>
          </div>
        </div>`;
    }).join('');
  } else {
    activeHtml = '<p class="text-dim" style="padding:0.5rem">No active contracts. Accept one from the board below — you can run up to 3 at a time.</p>';
  }

  // ---------- AVAILABLE CONTRACTS ----------
  var atCap = proc.activeMissions.length >= 3;
  var availableHtml = '';
  if (proc.availableMissions.length > 0) {
    availableHtml = proc.availableMissions.map(function(m) {
      var boardDaysLeft = (m.generatedDay + 3) - currentDay;
      var expiryLabel = boardDaysLeft <= 0 ? 'Leaves the board tonight' : 'On the board ' + boardDaysLeft + ' more day' + (boardDaysLeft !== 1 ? 's' : '');
      var client = _contractClientName(m);

      var modTags = (m.modifiers || []).map(function(mod) {
        return `<span style="display:inline-block;background:rgba(204,102,255,0.12);border:1px solid rgba(204,102,255,0.35);border-radius:4px;padding:0.05rem 0.35rem;margin:0.1rem 0.2rem 0.1rem 0;font-size:0.7rem" title="${mod.description || ''}">${mod.emoji} ${mod.name}</span>`;
      }).join('');

      var compTags = (m.complications || []).map(function(c) {
        return `<span style="display:inline-block;background:rgba(255,102,68,0.1);border:1px solid rgba(255,102,68,0.35);border-radius:4px;padding:0.05rem 0.35rem;margin:0.1rem 0.2rem 0.1rem 0;font-size:0.7rem" title="${c.description || ''}">⚠️ ${c.name}</span>`;
      }).join('');

      var rumors = (m.narrativeComplications && m.narrativeComplications.length > 0)
        ? `<div style="font-size:0.7rem;color:#ff8844;margin-top:0.2rem">🗣️ Word on the street: ${m.narrativeComplications.length} thing${m.narrativeComplications.length > 1 ? 's' : ''} could go sideways</div>`
        : '';

      var chainBadge = m.chainId ? `<span style="color:#cc66ff;font-size:0.75rem"> 🔗 Starts/continues a chain</span>` : '';

      return `
        <div class="card" style="border-color:${_contractDiffColor(m.difficultyTier)}">
          <div class="card-header">
            <span>${m.name}${chainBadge}</span>
            <span style="color:${_contractDiffColor(m.difficultyTier)}">${_contractStars(m.difficulty)}</span>
          </div>
          ${client ? `<div style="font-size:0.75rem;color:#88aaff">Client contact: ${client}</div>` : ''}
          <p class="text-dim" style="font-size:0.85rem;margin:0.3rem 0">${m.description}</p>
          <div style="font-size:0.8rem" class="text-dim">
            📍 ${m.district} | ⏱️ ${m.duration} day${m.duration !== 1 ? 's' : ''} to finish once accepted | ${typeof getDifficultyLabel === 'function' ? getDifficultyLabel(m.difficultyTier) : m.difficultyTier}
          </div>
          ${modTags || compTags ? `<div style="margin-top:0.2rem">${modTags}${compTags}</div>` : ''}
          ${rumors}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.4rem;flex-wrap:wrap;gap:0.3rem">
            <span style="color:var(--neon-green);font-weight:bold">💵 $${m.reward.toLocaleString()}</span>
            <span style="font-size:0.7rem;color:${boardDaysLeft <= 0 ? '#ff4444' : '#888'}">${expiryLabel}</span>
          </div>
          <button class="btn btn-sm ${atCap ? 'btn-secondary' : 'btn-buy'}" style="margin-top:0.4rem" ${atCap ? 'disabled title="Max 3 active contracts"' : ''} onclick="doAcceptContract('${m.id}')">${atCap ? '⛔ Roster Full (3/3)' : '🤝 Accept Contract'}</button>
        </div>`;
    }).join('');
  } else {
    availableHtml = '<p class="text-dim" style="padding:0.5rem">The board is empty. New contracts arrive daily as word travels through the streets overnight — end the day and check back, or hit "Check the streets".</p>';
  }

  // ---------- RECENT HISTORY ----------
  var recent = (proc.missionLog || []).slice(-6).reverse();
  var historyHtml = '';
  if (recent.length > 0) {
    historyHtml = recent.map(function(entry) {
      return `<div style="display:flex;justify-content:space-between;padding:0.25rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.8rem">
        <span>${entry.success ? '<span style="color:#00ff88">✅</span>' : '<span style="color:#ff4444">❌</span>'} ${_contractTemplateName(entry.templateId)}${entry.chainId ? ' 🔗' : ''}</span>
        <span class="text-dim">Day ${entry.day}${entry.success ? ' · +$' + (entry.reward || 0).toLocaleString() : ''}</span>
      </div>`;
    }).join('');
  } else {
    historyHtml = '<p class="text-dim" style="font-size:0.8rem">No jobs on record yet. Complete contracts to build your reputation on the street.</p>';
  }

  // ---------- STATS BAR ----------
  var statsHtml = `
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;font-size:0.8rem;margin-bottom:1rem;background:rgba(0,0,0,0.2);border-radius:6px;padding:0.4rem 0.6rem">
      <span>✅ Completed: <b style="color:#00ff88">${proc.completedCount || 0}</b></span>
      <span>❌ Failed: <b style="color:#ff4444">${proc.failedCount || 0}</b></span>
      <span>💰 Earned: <b style="color:var(--neon-green)">$${(proc.totalRewardsEarned || 0).toLocaleString()}</b></span>
      <span>🔓 Perks: <b style="color:#cc66ff">${(proc.unlockedPerks || []).length}</b></span>
      <span>🎭 Traits: <b style="color:#88ccff">${(proc.traits || []).length}</b></span>
      <span>🔗 Chains done: <b style="color:#cc66ff">${(proc.completedChains || []).length}</b></span>
    </div>`;

  return `
    <div class="screen-container">
      ${typeof renderToolbar === 'function' ? renderToolbar() : ''}
      ${typeof backButton === 'function' ? backButton() : ''}
      <h2 class="section-title" style="text-align:center;color:#cc66ff">📜 STREET CONTRACTS</h2>
      <p class="text-dim" style="text-align:center;font-size:0.85rem;margin-bottom:0.6rem">Freelance jobs from Miami's underworld. 1-3 new contracts hit the board daily; unaccepted contracts vanish after 3 days.</p>
      ${statsHtml}
      ${chainsHtml ? `<h3 style="color:#cc66ff;margin:1rem 0 0.5rem">🔗 Active Chains</h3>${chainsHtml}` : ''}
      <h3 class="neon-cyan" style="margin:1rem 0 0.5rem">🎯 Active Contracts (${proc.activeMissions.length}/3)</h3>
      ${activeHtml}
      <div style="display:flex;justify-content:space-between;align-items:center;margin:1rem 0 0.5rem">
        <h3 class="neon-green" style="margin:0">📋 Available Contracts (${proc.availableMissions.length})</h3>
        <button class="btn btn-sm btn-secondary" onclick="doRefreshContracts()">🔄 Check the streets</button>
      </div>
      ${availableHtml}
      <h3 class="text-dim" style="margin:1rem 0 0.5rem">📖 Recent Jobs</h3>
      <div class="card">${historyHtml}</div>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}

// ============================================================
// HANDLERS (wired to the real procedural-missions.js functions)
// ============================================================

function openContractsScreen() {
  if (typeof playSound === 'function') playSound('click');
  ensureContractsState();
  currentScreen = 'contracts';
  render();
}

function doAcceptContract(missionId) {
  if (typeof gameState === 'undefined' || !gameState) return;
  if (typeof acceptProceduralMission !== 'function') {
    if (typeof showNotification === 'function') showNotification('Contract system unavailable.', 'error');
    return;
  }
  var result = acceptProceduralMission(gameState, missionId);
  if (result && result.success) {
    if (typeof playSound === 'function') playSound('cash');
    var name = result.mission ? result.mission.name : 'contract';
    _contractLog('📢 Contract accepted: ' + name + ' — $' + (result.mission ? result.mission.reward.toLocaleString() : '?') + ', ' + (result.mission ? result.mission.duration : '?') + ' day deadline.');
    if (typeof showNotification === 'function') showNotification('Contract accepted: ' + name, 'success');
  } else {
    if (typeof playSound === 'function') playSound('error');
    _contractLog('📢 ' + ((result && result.message) || 'Could not accept contract.'));
    if (typeof showNotification === 'function') showNotification((result && result.message) || 'Could not accept contract.', 'error');
  }
  render();
}

function doChooseContractApproach(missionId, approachId) {
  if (typeof gameState === 'undefined' || !gameState) return;
  if (typeof chooseApproach !== 'function') {
    if (typeof showNotification === 'function') showNotification('Contract system unavailable.', 'error');
    return;
  }
  var result = chooseApproach(gameState, missionId, approachId);
  if (result && result.success) {
    if (typeof playSound === 'function') playSound('click');
    _contractLog('🧭 ' + ((result.approach && result.approach.name) || 'Approach') + ' selected for the contract.');
    if (typeof showNotification === 'function') showNotification('Approach set: ' + ((result.approach && result.approach.name) || approachId), 'success');
  } else {
    if (typeof playSound === 'function') playSound('error');
    if (typeof showNotification === 'function') showNotification((result && result.message) || 'Invalid approach.', 'error');
  }
  render();
}

function doCompleteContract(missionId) {
  if (typeof gameState === 'undefined' || !gameState) return;
  if (typeof completeProceduralMission !== 'function') {
    if (typeof showNotification === 'function') showNotification('Contract system unavailable.', 'error');
    return;
  }
  var result = completeProceduralMission(gameState, missionId);
  if (result && result.success) {
    if (typeof playSound === 'function') playSound('cash');
    // Push the headline + reward to the message log (message is multi-line)
    var lines = (result.message || '').split('\n');
    if (lines[0]) _contractLog(lines[0] + ' Reward: +$' + (result.reward || 0).toLocaleString());
    // Surface notable effect lines (unlocks, chain progress) individually
    for (var i = 1; i < lines.length; i++) {
      if (lines[i].indexOf('UNLOCKED') !== -1 || lines[i].indexOf('CHAIN') !== -1) {
        _contractLog(lines[i].replace(/^\s*-\s*/, '').trim());
      }
    }
    if (typeof showNotification === 'function') showNotification('Contract complete! +$' + (result.reward || 0).toLocaleString(), 'success');
    // Let achievements react if the system is present
    if (typeof checkAchievements === 'function') { try { checkAchievements(gameState); } catch (e) {} }
  } else {
    if (typeof playSound === 'function') playSound('error');
    if (typeof showNotification === 'function') showNotification((result && result.message) || 'Could not complete contract.', 'error');
  }
  render();
}

function doAbandonContract(missionId) {
  if (typeof gameState === 'undefined' || !gameState) return;
  if (typeof failProceduralMission !== 'function') {
    if (typeof showNotification === 'function') showNotification('Contract system unavailable.', 'error');
    return;
  }
  if (typeof confirm === 'function' && !confirm('Abandon this contract? You take the failure hit: heat, lost reputation, and any chain it belongs to collapses.')) {
    return;
  }
  var result = failProceduralMission(gameState, missionId);
  if (result && result.success) {
    if (typeof playSound === 'function') playSound('error');
    var lines = (result.message || '').split('\n');
    _contractLog(lines[0] || '❌ Contract abandoned.');
    if (typeof showNotification === 'function') showNotification('Contract abandoned. Your reputation takes a hit.', 'error');
  } else {
    if (typeof playSound === 'function') playSound('error');
    if (typeof showNotification === 'function') showNotification((result && result.message) || 'Could not abandon contract.', 'error');
  }
  render();
}

function doRefreshContracts() {
  if (typeof gameState === 'undefined' || !gameState) return;
  if (typeof processProceduralDaily !== 'function') {
    if (typeof showNotification === 'function') showNotification('Contract system unavailable.', 'error');
    return;
  }
  var msgs = processProceduralDaily(gameState) || [];
  if (msgs.length > 0) {
    if (typeof playSound === 'function') playSound('cash');
    for (var i = 0; i < msgs.length; i++) _contractLog(msgs[i]);
    if (typeof showNotification === 'function') showNotification('The word is out — the board has been updated.', 'success');
  } else {
    if (typeof playSound === 'function') playSound('click');
    if (typeof showNotification === 'function') showNotification('Nothing new today. Fresh contracts arrive after the day ends.', 'info');
  }
  render();
}

// ============================================================
// WIRING: screen routing + sidebar entry point
// (game-ui.js render() has a fixed switch with no 'contracts'
// case, so we wrap it rather than edit it.)
// ============================================================

function _injectContractsSidebarButton() {
  try {
    if (document.getElementById('street-contracts-btn')) return;
    if (typeof gameState === 'undefined' || !gameState) return;
    var buttons = document.querySelectorAll('button.btn-sidebar');
    var anchor = null;
    for (var i = 0; i < buttons.length; i++) {
      var oc = buttons[i].getAttribute('onclick') || '';
      if (oc.indexOf("currentScreen='missions'") !== -1) { anchor = buttons[i]; break; }
    }
    if (!anchor) return;
    var proc = gameState.proceduralMissions;
    var availCount = proc && proc.availableMissions ? proc.availableMissions.length : 0;
    var activeCount = proc && proc.activeMissions ? proc.activeMissions.length : 0;
    var badge = availCount + activeCount > 0 ? ' (' + availCount + '📋' + (activeCount > 0 ? ' ' + activeCount + '🎯' : '') + ')' : '';
    var b = document.createElement('button');
    b.id = 'street-contracts-btn';
    b.className = 'btn btn-sidebar ' + (availCount > 0 ? 'btn-primary' : 'btn-secondary');
    b.style.borderColor = '#cc66ff';
    b.style.color = '#cc66ff';
    b.innerHTML = '📜 Contracts' + badge;
    b.onclick = openContractsScreen;
    anchor.insertAdjacentElement('afterend', b);
  } catch (e) { /* cosmetic only */ }
}

(function _patchRenderForContracts() {
  function applyPatch() {
    if (typeof window === 'undefined') return false;
    if (typeof window.render !== 'function' || window.render._contractsPatched) return false;
    var baseRender = window.render;
    var wrapped = function() {
      if (typeof currentScreen !== 'undefined' && currentScreen === 'contracts') {
        // Mirror base render's modal-dismiss behavior (it keys off render._lastScreen)
        if (wrapped._lastScreen !== currentScreen) {
          var mc = document.getElementById('modal-container');
          if (mc && mc.innerHTML) mc.innerHTML = '';
          wrapped._lastScreen = currentScreen;
        }
        var app = document.getElementById('app');
        if (app) app.innerHTML = renderContracts();
        if (typeof updateMusic === 'function') { try { updateMusic(); } catch (e) {} }
        return;
      }
      var out = baseRender.apply(this, arguments);
      // Entry point: add the Contracts button to the main game sidebar
      if (typeof currentScreen !== 'undefined' && currentScreen === 'game') {
        _injectContractsSidebarButton();
      }
      return out;
    };
    wrapped._contractsPatched = true;
    // Preserve any state the base function stored on itself
    wrapped._lastScreen = baseRender._lastScreen;
    window.render = wrapped;
    return true;
  }

  if (!applyPatch()) {
    // game-ui.js not loaded yet — retry once the document is ready
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('DOMContentLoaded', applyPatch);
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('load', applyPatch);
      }
    }
  }

  // Toolbar help text for the new screen
  try {
    if (typeof SCREEN_HELP !== 'undefined' && SCREEN_HELP && !SCREEN_HELP.contracts) {
      SCREEN_HELP.contracts = '📜 <b>Street Contracts</b> — Procedurally generated underworld jobs. 1-3 new contracts appear daily (max 5 on the board, gone after 3 days). Run up to 3 at once, pick an approach (stealth/force/social), and finish before the deadline or eat the failure: heat + lost rep. Chains pay a big bonus.';
    }
  } catch (e) {}
})();
