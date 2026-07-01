// regional-bosses-ui.js — Player-facing UI for the Regional Bosses system
// ============================================================
// Renders all 52 regional bosses (regional-bosses.js) grouped by region,
// with status badges, vulnerability intel, control bonuses and actions:
// Negotiate / Bribe / Fight / Assassinate / Exploit / Install Puppet /
// Reinforce Puppet.
//
// Integration:
//   - Add a dispatch case:  case 'regionalbosses': app.innerHTML = renderRegionalBosses(); break;
//   - Open with:            currentScreen = 'regionalbosses'; render();
//
// This file is a plain global script (no modules), matching the rest of
// the codebase. It only READS the systems in regional-bosses.js and the
// global gameState; it edits no other file.
// ============================================================

// Currently expanded region section (accordion). null = auto-pick.
let bossUIExpandedRegion = null;

// Bosses' region ids vs world-regions.js region ids differ for the US.
const BOSS_UI_REGION_MAP = { us: 'us_cities' };

// ============================================================
// STATE / HELPER ACCESSORS
// ============================================================

/**
 * Get (and self-heal) the boss sub-state.
 * The engine stores it at gameState.bosses (see game-engine.js initState /
 * game-ui.js migration), created via initBossState().
 */
function bossUIGetState() {
  if (!gameState) return null;
  if (!gameState.bosses && typeof initBossState === 'function') {
    gameState.bosses = initBossState();
  }
  if (!gameState.bosses) {
    gameState.bosses = { bossStatus: {}, defeatedBosses: [], installedPuppets: [], destabilizedDistricts: {}, bossRelations: {} };
  }
  const bs = gameState.bosses;
  // Heal any missing sub-objects (old saves / fallback shapes)
  if (!bs.bossStatus || typeof bs.bossStatus !== 'object') bs.bossStatus = {};
  if (!Array.isArray(bs.defeatedBosses)) bs.defeatedBosses = [];
  if (!Array.isArray(bs.installedPuppets)) bs.installedPuppets = [];
  if (!bs.destabilizedDistricts || typeof bs.destabilizedDistricts !== 'object') bs.destabilizedDistricts = {};
  if (!bs.bossRelations || typeof bs.bossRelations !== 'object') bs.bossRelations = {};
  return bs;
}

/** Active (non-injured) crew type ids, with 'diplomat_crew' aliased to 'diplomat'. */
function bossUIGetCrewTypes() {
  const types = [];
  (gameState.henchmen || []).forEach(h => {
    if (h.injured) return;
    if (h.type && !types.includes(h.type)) types.push(h.type);
  });
  // regional-bosses.js checks for 'diplomat', but the hireable crew type id is 'diplomat_crew'
  if (types.includes('diplomat_crew') && !types.includes('diplomat')) types.push('diplomat');
  return types;
}

/**
 * Skills object for regional-bosses.js checks (speech / stealth / intelligence).
 * The skill tree has no 'speech' or 'intelligence' ids, so map the closest
 * equivalents: persuasion -> speech, streetwise -> intelligence.
 */
function bossUIGetSkills() {
  const s = (gameState && gameState.skills) || {};
  const skills = Object.assign({}, s);
  if (!skills.speech) skills.speech = s.persuasion || 0;
  if (!skills.intelligence) skills.intelligence = s.streetwise || 0;
  if (!skills.stealth) skills.stealth = s.stealth || 0;
  return skills;
}

/** Player combat power: equipped weapon damage + active crew combat (+ perks). Mirrors game-engine combat. */
function bossUIGetPlayerCombat() {
  let power = 10;
  if (typeof WEAPONS !== 'undefined' && Array.isArray(WEAPONS)) {
    const weapon = WEAPONS.find(w => w.id === gameState.equippedWeapon) || WEAPONS[0];
    if (weapon && typeof weapon.damage === 'number') power = weapon.damage;
  }
  (gameState.henchmen || []).forEach(h => {
    if (h.injured) return;
    const t = (typeof HENCHMEN_TYPES !== 'undefined') ? HENCHMEN_TYPES.find(x => x.id === h.type) : null;
    if (t) power += (t.combat || 0);
  });
  if (typeof hasPerk === 'function') {
    if (hasPerk(gameState, 'muscle')) power = Math.round(power * 1.25);
    if (hasPerk(gameState, 'immortal')) power = Math.round(power * 1.15);
  }
  return Math.max(1, power);
}

/** Is the world region for a given boss-region id unlocked? */
function bossUIRegionUnlocked(bossRegionId) {
  const worldRegionId = BOSS_UI_REGION_MAP[bossRegionId] || bossRegionId;
  if (typeof isRegionUnlocked !== 'function') return true; // fail open if world system absent
  return isRegionUnlocked(gameState, worldRegionId);
}

/** District display name (falls back to the raw id). */
function bossUIDistrictName(districtId) {
  if (typeof getWorldDistrictById === 'function') {
    const d = getWorldDistrictById(districtId);
    if (d && d.name) return d.name;
  }
  return districtId;
}

function bossUIMoney(n) {
  return '$' + Math.round(n || 0).toLocaleString();
}

function bossUIClampPct(chance) {
  return Math.round(Math.max(5, Math.min(95, chance * 100)));
}

/** Spend cash (also reduces dirty-money component first, matching the dirty/clean split). */
function bossUISpendCash(amount) {
  gameState.cash = Math.max(0, (gameState.cash || 0) - amount);
  if (typeof gameState.dirtyMoney === 'number' && gameState.dirtyMoney > 0) {
    const fromDirty = Math.min(gameState.dirtyMoney, amount);
    gameState.dirtyMoney -= fromDirty;
    amount -= fromDirty;
  }
  if (typeof gameState.cleanMoney === 'number' && amount > 0) {
    gameState.cleanMoney = Math.max(0, gameState.cleanMoney - amount);
  }
}

/** Gain loot (drug money = dirty). */
function bossUIGainLoot(amount) {
  if (!amount || amount <= 0) return;
  gameState.cash = (gameState.cash || 0) + amount;
  if (typeof gameState.dirtyMoney === 'number') gameState.dirtyMoney += amount;
}

function bossUILog(msg) {
  if (gameState && Array.isArray(gameState.messageLog)) gameState.messageLog.push(msg);
}

/** Apply a shared post-action result: heat, loot, damage, log, notify, sound. */
function bossUIApplyResult(result, moneySpent) {
  if (moneySpent && moneySpent > 0) bossUISpendCash(moneySpent);
  if (result.heatGenerated && typeof addHeat === 'function') addHeat(gameState, result.heatGenerated);
  if (result.loot) bossUIGainLoot(result.loot);
  if (result.playerDamagePct) {
    // Never drop below 1 hp from this screen — death flow belongs to combat system
    gameState.health = Math.max(1, (gameState.health || 100) - result.playerDamagePct);
  }
  bossUILog(result.message);
  showNotification(result.message, result.success ? 'success' : 'error');
  playSound(result.success ? (result.loot ? 'cash' : 'click') : 'error');
  render();
}

// ============================================================
// SUCCESS-CHANCE PREVIEWS (mirror regional-bosses.js formulas)
// ============================================================

function bossUINegotiateChance(boss, bs, skills, crew) {
  let chance = 0.40;
  if (crew.includes('diplomat')) chance += 0.15;
  if ((skills.speech || 0) >= 3) chance += 0.10;
  chance += ((bs.bossRelations[boss.id] || 0) / 200);
  if (boss.personality === 'diplomatic') chance += 0.15;
  if (boss.personality === 'aggressive' || boss.personality === 'psychotic') chance -= 0.15;
  if (boss.personality === 'paranoid') chance -= 0.10;
  return bossUIClampPct(chance);
}

function bossUIFightChance(boss, bs, playerCombat) {
  const bossTotal = boss.combat + (boss.bodyguards * 8);
  let chance = 0.5 * (playerCombat / bossTotal);
  if ((bs.bossRelations[boss.id] || 0) > 30) chance -= 0.10;
  return bossUIClampPct(chance);
}

function bossUIAssassinChance(boss, skills, crew) {
  let chance = 1.0 - (boss.assassinDifficulty * 0.15);
  if (crew.includes('assassin')) chance += 0.10;
  if (crew.includes('sniper')) chance += 0.10;
  if (crew.includes('assassin') && crew.includes('sniper')) chance += 0.05;
  chance += (skills.stealth || 0) * 0.05;
  if (boss.personality === 'paranoid') chance -= 0.15;
  if (boss.personality === 'elusive') chance -= 0.10;
  if (boss.personality === 'erratic') chance += 0.05;
  return bossUIClampPct(chance);
}

function bossUIExploitChance(boss, skills, crew) {
  const vuln = (typeof VULNERABILITY_EXPLOITS !== 'undefined') ? VULNERABILITY_EXPLOITS[boss.vulnerability] : null;
  if (!vuln) return null;
  let chance = 0.50 + vuln.successBonus;
  chance += (skills.intelligence || 0) * 0.05;
  if (crew.includes('hacker') && ['compromised_phones', 'money_trail', 'obsessive_records'].includes(boss.vulnerability)) chance += 0.15;
  if (crew.includes('spy') && ['mistress_informant', 'fbi_mole', 'us_partner_flip'].includes(boss.vulnerability)) chance += 0.15;
  if (crew.includes('diplomat') && ['succession_war', 'family_succession', 'ethnic_rivalry', 'internal_politics'].includes(boss.vulnerability)) chance += 0.10;
  if (crew.includes('enforcer') && ['short_temper', 'impulsive', 'everyone_wants_him_dead'].includes(boss.vulnerability)) chance += 0.10;
  return Math.round(Math.max(10, Math.min(95, chance * 100)));
}

// ============================================================
// MAIN SCREEN
// ============================================================

function renderRegionalBosses() {
  if (!gameState) { currentScreen = 'title'; return renderTitle(); }
  if (typeof REGIONAL_BOSSES === 'undefined' || typeof REGIONS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}
      <h2 class="section-title" style="color:#ff6666">👑 REGIONAL BOSSES</h2>
      <p class="text-dim">Boss system not loaded.</p>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const bs = bossUIGetState();
  const crew = bossUIGetCrewTypes();
  const skills = bossUIGetSkills();
  const playerCombat = bossUIGetPlayerCombat();

  // ---------- Summary header ----------
  const summary = (typeof getBossProgressSummary === 'function') ? getBossProgressSummary(bs) : null;
  const bonuses = (typeof getActiveBonuses === 'function') ? getActiveBonuses(bs) : { dailyIncome: 0 };
  const summaryHtml = summary ? `
    <div class="stats-grid" style="margin-bottom:1rem">
      <div class="stat-card"><div class="stat-value neon-red">${summary.defeated}/${summary.totalBosses}</div><div class="stat-label">Bosses Down</div></div>
      <div class="stat-card"><div class="stat-value neon-cyan">${summary.puppets}</div><div class="stat-label">Puppets</div></div>
      <div class="stat-card"><div class="stat-value neon-yellow">${summary.bribed}</div><div class="stat-label">Bribed</div></div>
      <div class="stat-card"><div class="stat-value neon-green">${bossUIMoney(bonuses.dailyIncome)}/day</div><div class="stat-label">Boss Income</div></div>
    </div>
    <div style="margin-bottom:1rem">
      <div class="stat-bar" style="height:8px"><div class="stat-fill" style="width:${summary.controlPct}%;background:linear-gradient(90deg,var(--neon-red),var(--neon-yellow))"></div></div>
      <p class="text-dim" style="text-align:center;font-size:0.8rem">World Control: ${summary.controlPct}% | Destabilized districts: ${summary.destabilized}</p>
    </div>
  ` : '';

  // Default expanded region: current district's region if it has a boss, else first unlocked
  if (!bossUIExpandedRegion) {
    const hereBoss = (typeof getBossForDistrict === 'function') ? getBossForDistrict(gameState.currentLocation) : null;
    if (hereBoss) {
      bossUIExpandedRegion = hereBoss.region;
    } else {
      const firstUnlocked = Object.keys(REGIONS).find(r => bossUIRegionUnlocked(r));
      bossUIExpandedRegion = firstUnlocked || Object.keys(REGIONS)[0];
    }
  }

  // ---------- Region sections ----------
  const regionSections = Object.keys(REGIONS).map(regionId => {
    const region = REGIONS[regionId];
    const regionBosses = (typeof getBossesByRegion === 'function')
      ? getBossesByRegion(regionId)
      : REGIONAL_BOSSES.filter(b => b.region === regionId);
    const unlocked = bossUIRegionUnlocked(regionId);
    const defeatedHere = regionBosses.filter(b => bs.defeatedBosses.includes(b.id)).length;
    const expanded = unlocked && bossUIExpandedRegion === regionId;

    const header = `
      <div class="card" style="border-color:${region.color};margin-bottom:${expanded ? '0.3rem' : '0.5rem'};cursor:${unlocked ? 'pointer' : 'default'};${unlocked ? '' : 'opacity:0.45'}"
        ${unlocked ? `onclick="doBossToggleRegion('${regionId}')"` : ''}>
        <div class="card-header" style="margin:0">
          <span style="color:${region.color}">${expanded ? '▼' : '▶'} ${region.name}</span>
          <span>${unlocked
            ? `<span class="${defeatedHere === regionBosses.length ? 'neon-green' : 'text-dim'}">${defeatedHere}/${regionBosses.length} defeated</span>`
            : `<span class="text-dim">🔒 LOCKED — ${regionBosses.length} bosses. Unlock this region via the World Map.</span>`}</span>
        </div>
      </div>`;

    if (!expanded) return header;

    const bossCards = regionBosses.map(boss => bossUIRenderBossCard(boss, bs, crew, skills, playerCombat)).join('');
    return header + `<div style="margin-bottom:0.8rem">${bossCards}</div>`;
  }).join('');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">👑 REGIONAL BOSSES</h2>
      <p class="text-dim" style="text-align:center;font-size:0.8rem;margin-bottom:0.8rem">
        52 crime lords rule the world's districts. Bribe them, break them, or replace them with puppets.
        Your combat power: <span class="neon-cyan">${playerCombat}</span>
      </p>
      ${summaryHtml}
      ${regionSections}
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

// ============================================================
// BOSS CARD
// ============================================================

function bossUIRenderBossCard(boss, bs, crew, skills, playerCombat) {
  const defeated = bs.defeatedBosses.includes(boss.id);
  const status = bs.bossStatus[boss.id] || {};
  const relation = bs.bossRelations[boss.id] || 0;
  const destab = bs.destabilizedDistricts[boss.districtId];
  const puppet = bs.installedPuppets.find(p => p.districtId === boss.districtId);
  const cash = gameState.cash || 0;
  const districtName = bossUIDistrictName(boss.districtId);

  // ---------- Status badge ----------
  let badge, borderColor;
  if (puppet) {
    badge = `<span class="neon-cyan">🎭 PUPPET (loyalty ${puppet.loyalty}/100)</span>`;
    borderColor = 'var(--neon-cyan)';
  } else if (defeated && destab) {
    badge = `<span class="neon-yellow">💥 DESTABILIZED (${destab.daysLeft}d left)</span>`;
    borderColor = 'var(--neon-yellow)';
  } else if (defeated) {
    badge = `<span class="neon-red">☠️ DEFEATED</span>`;
    borderColor = 'var(--neon-red)';
  } else if (status.bribed) {
    badge = `<span class="neon-green">🤝 BRIBED (${status.bribeDaysLeft}d left)</span>`;
    borderColor = 'var(--neon-green)';
  } else {
    badge = `<span class="text-dim">FREE</span>`;
    borderColor = 'var(--border-color, #555)';
  }

  const relColor = relation > 30 ? 'neon-green' : relation < -30 ? 'neon-red' : 'text-dim';

  // ---------- Body ----------
  let body = `
    <p class="text-dim" style="font-size:0.8rem;margin:0.2rem 0">${boss.profile}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.2rem;font-size:0.78rem;margin:0.3rem 0">
      <span>📍 <span class="neon-cyan">${districtName}</span></span>
      <span>Relations: <span class="${relColor}">${relation}</span></span>
      <span>⚔️ Combat: <span class="neon-red">${boss.combat + boss.bodyguards * 8}</span> (${boss.bodyguards} guards)</span>
      <span>🔪 Assassin diff: <span class="neon-yellow">${boss.assassinDifficulty}/5</span></span>
      <span>💰 Control: <span class="neon-green">${bossUIMoney(boss.controlBonus.dailyIncome)}/day</span></span>
      <span>🏷️ Discount: <span class="neon-green">-${Math.round(boss.controlBonus.priceDiscount * 100)}% prices</span></span>
    </div>`;

  const vuln = (typeof VULNERABILITY_EXPLOITS !== 'undefined') ? VULNERABILITY_EXPLOITS[boss.vulnerability] : null;
  if (!defeated && vuln) {
    body += `<div style="font-size:0.75rem;color:#cc88ff;margin:0.3rem 0;background:rgba(204,136,255,0.06);padding:0.3rem 0.5rem;border-radius:4px">
      🎯 <strong>Weakness:</strong> ${boss.vulnerabilityDesc}<br>
      <span class="text-dim">${vuln.method}</span>
    </div>`;
  }

  // ---------- Actions ----------
  const buttons = [];
  const disabledBtn = (label, why) =>
    `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5" title="${why}">${label} — ${why}</button>`;

  if (!defeated) {
    // Negotiate (free; needs diplomat crew or speech 3+)
    const canNegotiate = crew.includes('diplomat') || (skills.speech || 0) >= 3;
    buttons.push(canNegotiate
      ? `<button class="btn btn-sm btn-secondary" style="border-color:#88ccff;color:#88ccff" onclick="doBossNegotiate('${boss.id}')">🕊️ Negotiate (${bossUINegotiateChance(boss, bs, skills, crew)}%)</button>`
      : disabledBtn('🕊️ Negotiate', 'Need Diplomat crew or Speech 3+'));

    // Bribe
    if (status.bribed) {
      buttons.push(disabledBtn('🤝 Bribe', 'Already bribed'));
    } else if (cash < boss.bribeCost) {
      buttons.push(disabledBtn('🤝 Bribe', 'Need ' + bossUIMoney(boss.bribeCost)));
    } else {
      buttons.push(`<button class="btn btn-sm btn-buy" onclick="doBossBribe('${boss.id}')">🤝 Bribe (${bossUIMoney(boss.bribeCost)})</button>`);
    }

    // Fight
    buttons.push(`<button class="btn btn-sm btn-sell" onclick="doBossFight('${boss.id}')">⚔️ Fight (${bossUIFightChance(boss, bs, playerCombat)}%)</button>`);

    // Assassinate (needs assassin or sniper crew)
    const canAssassinate = crew.includes('assassin') || crew.includes('sniper');
    buttons.push(canAssassinate
      ? `<button class="btn btn-sm btn-sell" style="border-color:#aa66ff;color:#aa66ff" onclick="doBossAssassinate('${boss.id}')">🔪 Assassinate (${bossUIAssassinChance(boss, skills, crew)}%)</button>`
      : disabledBtn('🔪 Assassinate', 'Need Assassin or Sniper crew'));

    // Exploit vulnerability
    if (vuln) {
      const exploitCost = Math.floor(boss.bribeCost * vuln.costMultiplier);
      if (cash < exploitCost) {
        buttons.push(disabledBtn('🎯 Exploit', 'Need ' + bossUIMoney(exploitCost)));
      } else {
        buttons.push(`<button class="btn btn-sm btn-primary" onclick="doBossExploit('${boss.id}')">🎯 Exploit (${bossUIMoney(exploitCost)}, ${bossUIExploitChance(boss, skills, crew)}%)</button>`);
      }
    }
  } else if (!puppet) {
    // Defeated, no puppet yet — install one
    buttons.push(`<button class="btn btn-sm btn-buy" onclick="doBossInstallPuppet('${boss.districtId}')">🎭 Install Puppet (free — ${bossUIMoney(boss.controlBonus.dailyIncome)}/day)</button>`);
  } else {
    // Puppet installed — loyalty management
    const loyaltyColor = puppet.loyalty >= 50 ? 'var(--neon-green)' : puppet.loyalty >= 20 ? 'var(--neon-yellow)' : 'var(--neon-red)';
    body += `
      <div style="margin:0.3rem 0">
        <span class="text-dim" style="font-size:0.75rem">Puppet loyalty (decays 1/day; below 10 they may betray you):</span>
        <div class="stat-bar"><div class="stat-fill" style="width:${puppet.loyalty}%;background:${loyaltyColor}"></div></div>
        <span style="font-size:0.75rem;color:${loyaltyColor}">${puppet.loyalty}/100 — ${puppet.daysInstalled} days installed — earning ${bossUIMoney(puppet.dailyIncome)}/day</span>
      </div>`;
    [5000, 20000].forEach(amt => {
      if ((gameState.cash || 0) >= amt) {
        buttons.push(`<button class="btn btn-sm btn-buy" onclick="doBossReinforcePuppet('${boss.districtId}', ${amt})">💵 Reinforce +${Math.floor(amt / 1000)} loyalty (${bossUIMoney(amt)})</button>`);
      } else {
        buttons.push(disabledBtn('💵 Reinforce', 'Need ' + bossUIMoney(amt)));
      }
    });
  }

  return `
    <div class="prop-card" style="border-color:${borderColor};margin-bottom:0.5rem;padding:0.6rem">
      <div class="card-header" style="margin-bottom:0.2rem">
        <span style="font-weight:bold">${boss.emoji} ${boss.name} <span class="text-dim" style="font-weight:normal;font-size:0.75rem">(${boss.realName}, ${boss.age})</span></span>
        ${badge}
      </div>
      ${body}
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.4rem">${buttons.join('')}</div>
    </div>
  `;
}

// ============================================================
// HANDLERS
// ============================================================

function doBossToggleRegion(regionId) {
  bossUIExpandedRegion = (bossUIExpandedRegion === regionId) ? '__none__' : regionId;
  playSound('click');
  render();
}

function doBossNegotiate(bossId) {
  if (typeof negotiateWithBoss !== 'function') return;
  const bs = bossUIGetState();
  const result = negotiateWithBoss(bs, bossId, bossUIGetSkills(), bossUIGetCrewTypes());
  bossUIApplyResult(result, 0);
}

function doBossBribe(bossId) {
  if (typeof bribeBoss !== 'function') return;
  const bs = bossUIGetState();
  const result = bribeBoss(bs, bossId, gameState.cash || 0);
  // bribeBoss does not deduct cash itself — deduct here on success
  bossUIApplyResult(result, result.success ? result.cost : 0);
}

function doBossFight(bossId) {
  if (typeof fightBoss !== 'function') return;
  const boss = (typeof getBossById === 'function') ? getBossById(bossId) : null;
  if (boss && !confirm(`Attack ${boss.name} and ${boss.bodyguards} bodyguards? You WILL take damage even if you win.`)) return;
  const bs = bossUIGetState();
  const result = fightBoss(bs, bossId, bossUIGetPlayerCombat());
  bossUIApplyResult(result, 0);
}

function doBossAssassinate(bossId) {
  if (typeof assassinateBoss !== 'function') return;
  const boss = (typeof getBossById === 'function') ? getBossById(bossId) : null;
  if (boss && !confirm(`Send your killers after ${boss.name}? A failed attempt turns them hostile.`)) return;
  const bs = bossUIGetState();
  const result = assassinateBoss(bs, bossId, bossUIGetCrewTypes(), bossUIGetSkills());
  bossUIApplyResult(result, 0);
}

function doBossExploit(bossId) {
  if (typeof exploitVulnerability !== 'function') return;
  const bs = bossUIGetState();
  const result = exploitVulnerability(bs, bossId, gameState.cash || 0, bossUIGetSkills(), bossUIGetCrewTypes());
  // result.cost is the full cost on success, half the cost on failure — pay it either way
  bossUIApplyResult(result, result.cost || 0);
}

function doBossInstallPuppet(districtId) {
  if (typeof installPuppet !== 'function') return;
  const bs = bossUIGetState();
  const result = installPuppet(bs, districtId);
  bossUIApplyResult(result, 0);
}

function doBossReinforcePuppet(districtId, amount) {
  if (typeof reinforcePuppet !== 'function') return;
  if ((gameState.cash || 0) < amount) {
    showNotification('Not enough cash. Need ' + bossUIMoney(amount) + '.', 'error');
    playSound('error');
    return;
  }
  const bs = bossUIGetState();
  const result = reinforcePuppet(bs, districtId, amount);
  // reinforcePuppet does not validate or deduct cash — deduct here on success
  bossUIApplyResult(result, result.success ? amount : 0);
}
