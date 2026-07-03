// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Intimidation UI
// Screen for intimidation-system.js: tier, score breakdown,
// active effects, and the clothing wardrobe/shop.
// Load AFTER game-ui.js (it hooks into render()).
// ============================================================

// --- State self-heal -----------------------------------------
function ensureIntimidationState() {
  if (typeof gameState === 'undefined' || !gameState) return null;
  if (!gameState.intimidation && typeof initIntimidationState === 'function') {
    gameState.intimidation = initIntimidationState();
  }
  return gameState.intimidation;
}

// --- Score breakdown (mirrors calculateIntimidation sources) --
function getIntimidationBreakdown(state) {
  const rows = [];

  // 1. Combat skill (x2)
  const combatSkill = state.skills && state.skills.combat ? state.skills.combat : 0;
  rows.push({ emoji: '🥊', name: 'Combat Skill', detail: 'Level ' + combatSkill + ' × 2', pts: combatSkill * 2 });

  // 2. Fear reputation (x0.25)
  const fear = state.rep && state.rep.fear ? state.rep.fear : 0;
  rows.push({ emoji: '😨', name: 'Fear Reputation', detail: Math.round(fear) + ' fear × 0.25', pts: Math.floor(fear * 0.25) });

  // 3. Weapon carried
  let weaponPts = 0, weaponDetail = 'Unarmed';
  if (state.equippedWeapon && state.equippedWeapon !== 'fists' && typeof WEAPONS !== 'undefined') {
    const weapon = WEAPONS.find(w => w.id === state.equippedWeapon);
    if (weapon) {
      weaponPts = Math.min(15, Math.floor(weapon.damage / 10));
      weaponDetail = (weapon.emoji || '') + ' ' + weapon.name;
    }
  }
  rows.push({ emoji: '🔫', name: 'Weapon', detail: weaponDetail, pts: weaponPts });

  // 4. Crew presence
  let crewPts = 0;
  const crewCount = (state.henchmen || []).length;
  for (const h of (state.henchmen || [])) {
    if (h.type === 'enforcer' || h.type === 'assassin') crewPts += 3;
    else if (h.type === 'bodyguard') crewPts += 2;
    else if (h.type === 'thug') crewPts += 1;
  }
  rows.push({ emoji: '👥', name: 'Crew Presence', detail: crewCount + ' member' + (crewCount === 1 ? '' : 's'), pts: crewPts });

  // 5. Clothing
  let clothPts = 0, clothDetail = 'Street Clothes';
  if (state.intimidation && state.intimidation.clothing && typeof CLOTHING_ITEMS !== 'undefined') {
    const c = CLOTHING_ITEMS.find(ci => ci.id === state.intimidation.clothing);
    if (c) { clothPts = c.intimidation; clothDetail = c.emoji + ' ' + c.name; }
  }
  rows.push({ emoji: '👔', name: 'Clothing', detail: clothDetail, pts: clothPts });

  // 6. Vehicle
  let vehPts = 0, vehDetail = 'None';
  const vehicleState = state.vehicleState || state.vehicles || {};
  if (vehicleState.activeVehicle && typeof VEHICLES !== 'undefined') {
    const vehicle = VEHICLES.find(vh => vh.id === vehicleState.activeVehicle);
    if (vehicle) {
      if (vehicle.tier === 'exotic' || vehicle.tier === 'luxury') vehPts = 8;
      else if (vehicle.tier === 'muscle' || vehicle.tier === 'military') vehPts = 6;
      else if (vehicle.tier === 'performance') vehPts = 5;
      else if (vehicle.tier === 'suv') vehPts = 4;
      vehDetail = (vehicle.emoji || '🚗') + ' ' + vehicle.name;
    }
  }
  rows.push({ emoji: '🚗', name: 'Vehicle', detail: vehDetail, pts: vehPts });

  // Bonus sources (kingpin level + abilities) shown as one extra row when present
  let bonusPts = 0;
  if (typeof KINGPIN_LEVELS !== 'undefined' && state.xp) {
    bonusPts += Math.min(10, KINGPIN_LEVELS.filter(l => state.xp >= l.xpRequired).length);
  }
  if (typeof getAbilityBonus === 'function') {
    const ab = getAbilityBonus(state, 'intimidation');
    if (ab > 0) bonusPts += ab;
  }
  if (bonusPts > 0) rows.push({ emoji: '👑', name: 'Status & Abilities', detail: 'Kingpin level / perks', pts: Math.floor(bonusPts) });

  return rows;
}

// --- Main screen ----------------------------------------------
function renderIntimidation() {
  if (typeof INTIMIDATION_LEVELS === 'undefined' || typeof calculateIntimidation !== 'function') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#ff4488">😈 INTIMIDATION</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }
  const intim = ensureIntimidationState() || { clothing: 'street_clothes', ownedClothing: ['street_clothes'], totalIntimidations: 0, successfulIntimidations: 0 };

  const level = getIntimidationLevel(gameState);
  const score = level.score;

  // Progress toward next tier
  const nextLevel = INTIMIDATION_LEVELS.find(l => l.minScore > score) || null;
  let progressHtml;
  if (nextLevel) {
    const span = nextLevel.minScore - level.minScore;
    const pct = span > 0 ? Math.min(100, Math.max(0, Math.round(((score - level.minScore) / span) * 100))) : 0;
    progressHtml = `
      <div style="margin:0.5rem 0">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-dim)">
          <span>${level.emoji} ${level.name}</span>
          <span>Next: ${nextLevel.emoji} ${nextLevel.name} (${nextLevel.minScore} pts)</span>
        </div>
        <div class="stat-bar"><div class="stat-fill" style="width:${pct}%;background:#ff4488"></div></div>
        <div style="text-align:right;font-size:0.7rem;color:var(--text-dim)">${score} / ${nextLevel.minScore} pts (${nextLevel.minScore - score} to go)</div>
      </div>`;
  } else {
    progressHtml = `
      <div style="margin:0.5rem 0">
        <div class="stat-bar"><div class="stat-fill" style="width:100%;background:#ff4488"></div></div>
        <div style="text-align:right;font-size:0.7rem;color:#ff4488">MAX TIER — ${score}/100 pts</div>
      </div>`;
  }

  // Score breakdown table
  const breakdown = getIntimidationBreakdown(gameState);
  const breakdownRows = breakdown.map(r => `
    <tr>
      <td style="padding:0.2rem 0.4rem">${r.emoji} ${r.name}</td>
      <td style="padding:0.2rem 0.4rem;color:var(--text-dim);font-size:0.75rem">${r.detail}</td>
      <td style="padding:0.2rem 0.4rem;text-align:right;color:${r.pts > 0 ? '#00ff88' : '#888'};font-weight:700">+${r.pts}</td>
    </tr>`).join('');
  const breakdownHtml = `
    <div class="card" style="border-color:#ff4488;margin-bottom:1rem">
      <div class="card-header"><span>📊 Score Breakdown</span><span style="color:#ff4488;font-weight:700">${score}/100</span></div>
      <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
        <tbody>${breakdownRows}</tbody>
      </table>
      <div style="font-size:0.65rem;color:var(--text-dim);margin-top:0.3rem">Crew points past 15 count at half value. Total is capped at 100.</div>
    </div>`;

  // Active effects from current tier
  const fx = level.effects || {};
  const effectChips = [
    { emoji: '💰', label: 'Deal Prices', value: fx.priceMod ? Math.round(fx.priceMod * -100) + '% better' : 'No bonus' },
    { emoji: '🙅', label: 'NPCs Resist You', value: Math.round((fx.resistChance || 0) * 100) + '%' },
    { emoji: '🏳️', label: 'Enemies Surrender', value: Math.round((fx.surrenderChance || 0) * 100) + '%' },
    { emoji: '🛡️', label: 'Racket Protection', value: '+' + Math.round((fx.protectionBonus || 0) * 100) + '%' },
  ].map(e => '<span class="perk-chip" style="font-size:0.7rem">' + e.emoji + ' ' + e.label + ': ' + e.value + '</span>').join('');
  const effectsHtml = `
    <div class="card" style="border-color:#00ff88;margin-bottom:1rem">
      <div class="card-header"><span>⚡ Active Effects — ${level.emoji} ${level.name}</span></div>
      <p style="font-size:0.75rem;color:var(--text-dim);margin:0.2rem 0">${level.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${effectChips}</div>
    </div>`;

  // Intimidation attempt stats
  const total = intim.totalIntimidations || 0;
  const wins = intim.successfulIntimidations || 0;
  const statsLine = total > 0
    ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:0.5rem">Intimidation attempts: ${total} | Folded: ${wins} (${Math.round((wins / total) * 100)}%)</div>`
    : '';

  // Wardrobe: owned + shop
  const owned = intim.ownedClothing || [];
  const clothingCards = (typeof CLOTHING_ITEMS !== 'undefined' ? CLOTHING_ITEMS : []).map(c => {
    const isOwned = owned.includes(c.id);
    const isEquipped = intim.clothing === c.id;
    const stats = `<span style="color:#ff4488">😈 +${c.intimidation} intimidation</span>${c.repBonus ? ` | <span style="color:${c.repBonus > 0 ? '#00aaff' : '#ff6666'}">⭐ ${c.repBonus > 0 ? '+' : ''}${c.repBonus} rep</span>` : ''}`;
    let actionHtml;
    if (isEquipped) {
      actionHtml = '<span class="neon-green">✅ Equipped</span>';
    } else if (isOwned) {
      actionHtml = `<button class="btn btn-sm btn-secondary" style="border-color:#4488ff;color:#4488ff" onclick="doEquipClothing('${c.id}')">👕 Equip</button>`;
    } else {
      const canAfford = gameState.cash >= c.price;
      actionHtml = `<button class="btn btn-sm btn-buy" ${canAfford ? '' : 'disabled style="opacity:0.4;cursor:not-allowed"'} onclick="doBuyClothing('${c.id}')">💵 Buy ($${c.price.toLocaleString()})</button>${canAfford ? '' : ' <span style="font-size:0.7rem;color:#ff6666">Not enough cash</span>'}`;
    }
    return `<div class="prop-card" style="border-color:${isEquipped ? '#00ff88' : isOwned ? '#4488ff' : '#555'}">
      <div class="prop-header">${c.emoji} ${c.name} ${isEquipped ? '✅' : ''}</div>
      <div class="prop-details">${c.desc}<br>${stats}<br>${actionHtml}</div>
    </div>`;
  }).join('');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#ff4488">😈 INTIMIDATION</h2>
      <div style="text-align:center;margin-bottom:0.5rem">
        <span style="font-size:1.4rem">${level.emoji}</span>
        <span style="font-size:1.2rem;color:#ff4488;font-weight:700"> ${level.name}</span>
        <span style="color:var(--text-dim)"> — ${score}/100</span>
      </div>
      ${progressHtml}
      ${statsLine}
      ${breakdownHtml}
      ${effectsHtml}
      <h3 style="color:#ff4488;margin:0.5rem 0">👔 WARDROBE & CLOTHING SHOP</h3>
      <p style="font-size:0.75rem;color:var(--text-dim);margin-bottom:0.5rem">What you wear changes how people see you. Only one outfit can be equipped at a time. Cash: $${gameState.cash.toLocaleString()}</p>
      ${clothingCards}
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>`;
}

// --- Handlers -------------------------------------------------
function doBuyClothing(id) {
  ensureIntimidationState();
  const result = buyClothing(gameState, id);
  gameState.messageLog.push(result.msg);
  if (result.success) {
    showNotification(result.msg, 'success');
    playSound('cash');
  } else {
    showNotification(result.msg, 'error');
    playSound('error');
  }
  render();
}

function doEquipClothing(id) {
  ensureIntimidationState();
  const result = equipClothing(gameState, id);
  gameState.messageLog.push(result.msg);
  if (result.success) {
    showNotification(result.msg, 'success');
    playSound('click');
  } else {
    showNotification(result.msg, 'error');
    playSound('error');
  }
  render();
}

function openIntimidation() {
  currentScreen = 'intimidation';
  render();
}

// --- Hook the 'intimidation' screen into the main render loop --
// game-ui.js's render() switch has no case for it, so wrap render()
// (this file must be loaded after game-ui.js).
(function hookIntimidationScreen() {
  if (typeof render !== 'function' || render._intimidationHooked) return;
  const _origRender = render;
  render = function () {
    if (typeof currentScreen !== 'undefined' && currentScreen === 'intimidation') {
      const app = document.getElementById('app');
      if (app) {
        // Mirror the modal-dismissal behavior of the original render()
        if (_origRender._lastScreen !== currentScreen) {
          const mc = document.getElementById('modal-container');
          if (mc && mc.innerHTML) mc.innerHTML = '';
          _origRender._lastScreen = currentScreen;
        }
        app.innerHTML = renderIntimidation();
        if (typeof updateMusic === 'function') updateMusic();
        return;
      }
    }
    return _origRender.apply(this, arguments);
  };
  render._intimidationHooked = true;
})();
