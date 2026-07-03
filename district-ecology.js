// district-ecology.js — NEIGHBORHOOD ECOLOGY system
// ============================================================
// Every district is a living neighborhood with three vitals:
//   condition 0-100  (blighted -> thriving)  — feeds street prices
//   police    0-100  (patrol presence)       — feeds bust risk
//   loyalty   0-100  (how the block feels about YOU)
// On controlled territory the player can INVEST (community center,
// youth program, storefronts, clinic, lighting) or BLEED the block
// (flood the corners, strip businesses, corner armies, protection
// racket). Loyalty extremes trigger informants or tip-offs.
//
// Integration (wired by the engine/UI, not this file):
//   - Screen:      case 'districts': app.innerHTML = renderDistrictEcology(); break;
//   - Daily proc:  processDistrictEcologyDaily(state) -> string[] messages
//   - Events:      notifyDistrictEvent(state, 'shootout'|'raid'|'takeover'|'big_sale', locId)
//   - Prices:      getDistrictConditionPriceMod(state, locId, drugId) in generatePrices
//   - Heat decay:  getDistrictHeatDecayMod(state, locId)
//   - Fronts:      getDistrictFrontIncomeMod(state, locId)
//   - Crew hire:   getDistrictCrewDiscount(state, locId)  (cost multiplier)
//   - Bust rolls:  getDistrictBustMod(state, locId)       (chance multiplier)
//
// Plain global script (no modules), self-contained, self-healing:
// old saves without state.districts must never crash.
// ============================================================

// Currently expanded district card (accordion). null = auto-pick.
let districtEcoExpanded = null;

// ============================================================
// STATIC DATA
// ============================================================

// Flavor overrides for starting condition (else derived from dangerLevel)
const DISTRICT_ECO_PRESETS = {
  south_beach:   { condition: 70 },
  fisher_island: { condition: 85 },
  coral_gables:  { condition: 78 },
  downtown:      { condition: 72 },
  brickell_key:  { condition: 80 },
  overtown:      { condition: 30 },
  liberty_city:  { condition: 28 },
  opa_locka:     { condition: 22 },
  little_haiti:  { condition: 32 },
  carol_city:    { condition: 26 },
};

// Police-presence baseline from LOCATIONS.policeIntensity strings
const DISTRICT_ECO_POLICE_MAP = {
  low: 20, low_moderate: 30, moderate: 40, high: 60, very_high: 75,
};

// ---------- INVEST projects (one of each per district) ----------
const DISTRICT_PROJECTS = [
  {
    id: 'community_center', name: 'Community Center', emoji: '🏛️',
    cost: 75000, days: 30,
    effects: { loyalty: 15, condition: 10 },
    effectDesc: 'Loyalty +15, Condition +10',
    desc: 'A rec hall, meeting rooms, free AC in the summer. The block remembers who built it.',
    newsHeadline: (loc) => `NEW COMMUNITY CENTER OPENS IN ${loc.toUpperCase()} — ANONYMOUS DONOR THANKED`,
    newsBody: 'City officials admit no public money was involved. Residents say they do not care where the check came from — the doors are open and the lights are on.',
  },
  {
    id: 'youth_program', name: 'Youth Program', emoji: '⚽',
    cost: 30000, days: 14,
    effects: { loyalty: 10, police: -5 },
    effectDesc: 'Loyalty +10, Police -5',
    desc: 'Midnight basketball, boxing gym, football league. Kids off the corners means fewer patrol call-outs.',
    newsHeadline: (loc) => `YOUTH LEAGUE KICKS OFF IN ${loc.toUpperCase()} — "SOMEONE FINALLY INVESTED IN OUR KIDS"`,
    newsBody: 'Coaches say equipment and uniforms arrived paid in full. Beat officers report the corners are quieter after dark.',
  },
  {
    id: 'storefronts', name: 'Renovated Storefronts', emoji: '🏪',
    cost: 120000, days: 45,
    effects: { condition: 20 },
    effectDesc: 'Condition +20, front business income here +15%',
    desc: 'Fresh paint, new glass, rent subsidies. Legit business thrives — including yours.',
    newsHeadline: (loc) => `${loc.toUpperCase()} STOREFRONTS REOPEN AFTER MYSTERY RENOVATION SPREE`,
    newsBody: 'A dozen shuttered storefronts have new tenants and new facades. The landlord of record is a holding company nobody can reach.',
  },
  {
    id: 'free_clinic', name: 'Free Clinic', emoji: '🏥',
    cost: 90000, days: 30,
    effects: { loyalty: 20 },
    effectDesc: 'Loyalty +20, heat decays 25% faster here',
    desc: 'No insurance, no ID, no questions. A grateful neighborhood keeps its mouth shut.',
    newsHeadline: (loc) => `FREE CLINIC OPENS ITS DOORS IN ${loc.toUpperCase()} — NO QUESTIONS ASKED ABOUT FUNDING`,
    newsBody: 'The clinic treats anyone who walks in. Its financial backers remain anonymous, and in this neighborhood, nobody is asking twice.',
  },
  {
    id: 'street_lighting', name: 'Street Lighting', emoji: '💡',
    cost: 40000, days: 10,
    effects: { condition: 8, police: -8 },
    effectDesc: 'Condition +8, Police -8 (fewer call-outs)',
    desc: 'Lit streets mean fewer muggings, fewer 911 calls, fewer cruisers rolling through.',
    newsHeadline: (loc) => `THE LIGHTS ARE BACK ON IN ${loc.toUpperCase()} — RESIDENTS CREDIT "NEIGHBORHOOD ASSOCIATION"`,
    newsBody: 'After years of dead lamps and dark corners, every street light works. The city says it has no record of the work order.',
  },
];

// ---------- BLEED operations ----------
const DISTRICT_BLEED_OPS = [
  {
    id: 'flood_corners', name: 'Flood the Corners', emoji: '🌊', toggle: true,
    desc: 'Push weight through every corner at once. Street prices here +10% while active.',
    consequences: 'Condition -8/week, Loyalty -5/week while active',
  },
  {
    id: 'strip_businesses', name: 'Strip the Businesses', emoji: '🏚️', toggle: false,
    desc: 'Shake down every shop on the block in one brutal sweep. One-time cash skim ($15-40K, richer blocks pay more).',
    consequences: 'Condition -12, Loyalty -10. 30-day cooldown per district.',
  },
  {
    id: 'corner_army', name: 'Corner Army', emoji: '🪖', toggle: true,
    desc: 'Recruit desperate locals as muscle. Crew hire costs -50% here while active.',
    consequences: 'On launch: Police +10, Condition -5. The block becomes a war zone.',
  },
  {
    id: 'protection_racket', name: 'Protection Racket', emoji: '💰', toggle: true,
    desc: 'Every business pays or burns. +$300/day from this district while active.',
    consequences: 'Loyalty -3/week, Police +5/week while active',
  },
];

// ============================================================
// STATE / SELF-HEALING
// ============================================================

function distEcoClamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function distEcoLoc(locId) {
  if (typeof LOCATIONS !== 'undefined' && Array.isArray(LOCATIONS)) {
    return LOCATIONS.find(l => l.id === locId) || null;
  }
  return null;
}

function distEcoLocName(locId) {
  const loc = distEcoLoc(locId);
  if (loc && loc.name) return loc.name;
  return String(locId || 'the district').replace(/_/g, ' ');
}

/** Compute flavorful per-location defaults from LOCATIONS data. */
function distEcoDefaults(locId) {
  const loc = distEcoLoc(locId);
  const danger = (loc && typeof loc.dangerLevel === 'number') ? loc.dangerLevel : 3;
  let condition = distEcoClamp(80 - danger * 6);
  if (DISTRICT_ECO_PRESETS[locId] && typeof DISTRICT_ECO_PRESETS[locId].condition === 'number') {
    condition = DISTRICT_ECO_PRESETS[locId].condition;
  }
  let police;
  if (loc && typeof loc.policeIntensity === 'string' && DISTRICT_ECO_POLICE_MAP[loc.policeIntensity] !== undefined) {
    police = DISTRICT_ECO_POLICE_MAP[loc.policeIntensity];
  } else {
    police = distEcoClamp(25 + danger * 4);
  }
  return { condition, police, loyalty: 35 };
}

/** Heal one district entry in place (old saves / partial shapes). */
function distEcoHealEntry(d, locId) {
  const def = distEcoDefaults(locId);
  if (typeof d.condition !== 'number' || isNaN(d.condition)) d.condition = def.condition;
  if (typeof d.police !== 'number' || isNaN(d.police)) d.police = def.police;
  if (typeof d.loyalty !== 'number' || isNaN(d.loyalty)) d.loyalty = def.loyalty;
  d.condition = distEcoClamp(d.condition);
  d.police = distEcoClamp(d.police);
  d.loyalty = distEcoClamp(d.loyalty);
  if (!Array.isArray(d.projects)) d.projects = [];
  if (!Array.isArray(d.bleedOps)) d.bleedOps = [];
  if (typeof d.lastTrend !== 'number') d.lastTrend = 0;
  if (typeof d.sellBonus !== 'number') d.sellBonus = 0;
  if (typeof d.lastStripDay !== 'number') d.lastStripDay = -999;
  if (typeof d.baseCondition !== 'number') d.baseCondition = def.condition;
  if (typeof d.basePolice !== 'number') d.basePolice = def.police;
  if (typeof d.trendRefDay !== 'number') d.trendRefDay = 0;
  if (typeof d.trendRefCond !== 'number') d.trendRefCond = d.condition;
  // Heal project entries
  d.projects = d.projects.filter(p => p && typeof p === 'object' && p.id);
  d.projects.forEach(p => {
    if (typeof p.daysLeft !== 'number' || isNaN(p.daysLeft)) p.daysLeft = 0;
    if (typeof p.done !== 'boolean') p.done = p.daysLeft <= 0;
  });
  // Heal bleed op entries
  d.bleedOps = d.bleedOps.filter(o => o && typeof o === 'object' && o.id);
  d.bleedOps.forEach(o => {
    if (typeof o.since !== 'number') o.since = 1;
    if (typeof o.lastTick !== 'number') o.lastTick = o.since;
  });
  return d;
}

/** Ensure the ecology sub-state exists and is sane. Safe on any save. */
function ensureDistrictsState(state) {
  if (!state) return null;
  if (!state.districts || typeof state.districts !== 'object' || Array.isArray(state.districts)) {
    state.districts = {};
  }
  for (const locId of Object.keys(state.districts)) {
    if (!state.districts[locId] || typeof state.districts[locId] !== 'object') {
      state.districts[locId] = {};
    }
    distEcoHealEntry(state.districts[locId], locId);
  }
  return state.districts;
}

/** Get (lazily creating) one district's ecology entry. */
function getDistrict(state, locId) {
  if (!state || !locId) return null;
  ensureDistrictsState(state);
  if (!state.districts[locId]) {
    state.districts[locId] = distEcoHealEntry({}, locId);
    state.districts[locId].trendRefDay = state.day || 1;
  }
  return state.districts[locId];
}

/** Is this territory controlled by the player? (guarded) */
function distEcoControlled(state, locId) {
  if (typeof isTerritory === 'function') return !!isTerritory(state, locId);
  return !!(state && state.territory && state.territory[locId] && state.territory[locId].controlled);
}

/** Districts the player knows about: controlled + visited + touched. */
function distEcoKnownDistricts(state) {
  const ids = [];
  const add = (id) => { if (id && !ids.includes(id)) ids.push(id); };
  if (state.currentLocation) add(state.currentLocation);
  if (typeof getControlledTerritories === 'function') {
    getControlledTerritories(state).forEach(add);
  } else if (state.territory) {
    Object.keys(state.territory).forEach(id => { if (state.territory[id].controlled) add(id); });
  }
  if (state.districts) Object.keys(state.districts).forEach(add);
  if (state.knownPrices) Object.keys(state.knownPrices).forEach(add);
  return ids;
}

// ---------- money helpers (dirty-first spend, matching the split) ----------
function distEcoMoney(n) {
  return '$' + Math.round(n || 0).toLocaleString();
}

function distEcoSpendCash(amount) {
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

function distEcoGainDirty(state, amount) {
  if (!amount || amount <= 0) return;
  state.cash = (state.cash || 0) + amount;
  if (typeof state.dirtyMoney === 'number') state.dirtyMoney += amount;
}

function distEcoLog(msg) {
  if (gameState && Array.isArray(gameState.messageLog)) gameState.messageLog.push(msg);
}

// ============================================================
// 1. EVENT NOTIFICATIONS (called by engine wiring)
// ============================================================

const DISTRICT_EVENT_EFFECTS = {
  shootout: { condition: -3, police: 8, loyalty: -2 },
  raid:     { condition: -2, police: 12, loyalty: 0 },
  takeover: { condition: 0,  police: 6,  loyalty: -5 }, // they fear the new boss
  big_sale: { condition: -1, police: 0,  loyalty: 0 },
};

function notifyDistrictEvent(state, type, locId) {
  if (!state || !locId) return;
  const fx = DISTRICT_EVENT_EFFECTS[type];
  if (!fx) return; // 'invest'/'bleed' are handled by their own actions
  const d = getDistrict(state, locId);
  if (!d) return;
  d.condition = distEcoClamp(d.condition + (fx.condition || 0));
  d.police = distEcoClamp(d.police + (fx.police || 0));
  d.loyalty = distEcoClamp(d.loyalty + (fx.loyalty || 0));
}

// ============================================================
// EXPORTED EFFECT HOOKS (all guarded, safe with no state)
// ============================================================

/**
 * Price multiplier from neighborhood condition (desperation market).
 * condition 20 -> ~1.10x, 50 -> 1.00x, 80 -> ~0.93x.
 * Hard drugs get +3% extra in blighted blocks. Includes the
 * Flood-the-Corners sellBonus. Clamped 0.85-1.25.
 */
function getDistrictConditionPriceMod(state, locId, drugId) {
  if (!state || !locId) return 1;
  const d = (state.districts && state.districts[locId]) ? state.districts[locId] : null;
  if (!d) return 1; // never force-create state from a price query
  const c = (typeof d.condition === 'number') ? d.condition : 50;
  let mod;
  if (c <= 50) mod = 1 + (50 - c) * (0.10 / 30);
  else mod = 1 - (c - 50) * (0.07 / 30);
  if (c < 40 && drugId && typeof DRUGS !== 'undefined' && Array.isArray(DRUGS)) {
    const drug = DRUGS.find(x => x.id === drugId);
    if (drug && (drug.category === 'premium' || ['crack', 'methamphetamine', 'heroin', 'fentanyl'].includes(drug.id))) {
      mod += 0.03; // desperation premium for hard product
    }
  }
  mod *= 1 + (typeof d.sellBonus === 'number' ? d.sellBonus : 0);
  return Math.max(0.85, Math.min(1.25, mod));
}

/** Flood-the-Corners sell bonus alone (0 or 0.10). */
function getDistrictSellBonus(state, locId) {
  if (!state || !state.districts || !state.districts[locId]) return 0;
  return (typeof state.districts[locId].sellBonus === 'number') ? state.districts[locId].sellBonus : 0;
}

/** Heat decays 25% faster where you built a Free Clinic. Returns 1 or 1.25. */
function getDistrictHeatDecayMod(state, locId) {
  if (!state || !state.districts || !state.districts[locId]) return 1;
  const d = state.districts[locId];
  const hasClinic = Array.isArray(d.projects) && d.projects.some(p => p.id === 'free_clinic' && p.done);
  return hasClinic ? 1.25 : 1;
}

/**
 * Front business income multiplier here: +15% with Renovated Storefronts,
 * plus a small condition synergy (thriving blocks buy more, +/-5%).
 */
function getDistrictFrontIncomeMod(state, locId) {
  if (!state || !state.districts || !state.districts[locId]) return 1;
  const d = state.districts[locId];
  let mod = 1;
  if (Array.isArray(d.projects) && d.projects.some(p => p.id === 'storefronts' && p.done)) mod *= 1.15;
  const c = (typeof d.condition === 'number') ? d.condition : 50;
  mod *= 1 + (c - 50) * 0.001; // 80 -> +3%, 20 -> -3%
  return Math.max(0.9, Math.min(1.3, mod));
}

/** Crew hire COST multiplier here: 0.5 while a Corner Army is active, else 1. */
function getDistrictCrewDiscount(state, locId) {
  if (!state || !state.districts || !state.districts[locId]) return 1;
  const d = state.districts[locId];
  const active = Array.isArray(d.bleedOps) && d.bleedOps.some(o => o.id === 'corner_army');
  return active ? 0.5 : 1;
}

/** Bust-chance multiplier from police presence. 50 -> 1.0, 90 -> 1.4, <30 -> 0.9. */
function getDistrictBustMod(state, locId) {
  if (!state || !state.districts || !state.districts[locId]) return 1;
  const p = state.districts[locId].police;
  if (typeof p !== 'number') return 1;
  let mod = 1 + Math.max(0, p - 50) * 0.01;
  if (p < 30) mod = 0.9;
  return Math.max(0.8, Math.min(1.5, mod));
}

// ============================================================
// DAILY PROCESSING
// ============================================================

function processDistrictEcologyDaily(state) {
  const msgs = [];
  if (!state) return msgs;
  ensureDistrictsState(state);
  const day = state.day || 1;
  const known = distEcoKnownDistricts(state);
  let racketTotal = 0;

  for (const locId of known) {
    const d = getDistrict(state, locId);
    if (!d) continue;
    const locName = distEcoLocName(locId);
    const controlled = distEcoControlled(state, locId);

    // ---------- 1. Project construction ticks ----------
    for (const proj of d.projects) {
      if (proj.done) continue;
      proj.daysLeft -= 1;
      if (proj.daysLeft <= 0) {
        proj.done = true;
        const def = DISTRICT_PROJECTS.find(p => p.id === proj.id);
        if (def) {
          if (def.effects.condition) d.condition = distEcoClamp(d.condition + def.effects.condition);
          if (def.effects.loyalty) d.loyalty = distEcoClamp(d.loyalty + def.effects.loyalty);
          if (def.effects.police) d.police = distEcoClamp(d.police + def.effects.police);
          msgs.push(`🏗️ ${def.emoji} ${def.name} completed in ${locName}! (${def.effectDesc})`);
          if (typeof pushNews === 'function') {
            pushNews(state, {
              headline: def.newsHeadline(locName),
              body: def.newsBody,
              source: 'Miami Herald', category: 'you', locId: locId,
            });
          }
        }
      }
    }

    // ---------- 2. Bleed operations ----------
    if (!controlled && d.bleedOps.length > 0) {
      d.bleedOps = [];
      d.sellBonus = 0;
      msgs.push(`🏳️ Your bleed operations in ${locName} collapsed — you no longer run the block.`);
    }
    for (const op of d.bleedOps) {
      if (op.id === 'flood_corners') {
        d.sellBonus = 0.10;
        if (day - op.lastTick >= 7) {
          op.lastTick = day;
          d.condition = distEcoClamp(d.condition - 8);
          d.loyalty = distEcoClamp(d.loyalty - 5);
          msgs.push(`🌊 Product floods the corners of ${locName}. The block is wearing down. (Condition -8, Loyalty -5)`);
        }
      } else if (op.id === 'protection_racket') {
        racketTotal += 300;
        distEcoGainDirty(state, 300);
        if (day - op.lastTick >= 7) {
          op.lastTick = day;
          d.loyalty = distEcoClamp(d.loyalty - 3);
          d.police = distEcoClamp(d.police + 5);
          msgs.push(`💰 Your racket squeezes ${locName} harder. Shopkeepers whisper to the beat cops. (Loyalty -3, Police +5)`);
        }
      }
      // corner_army: passive (hire discount) — damage was done at launch
    }

    // ---------- 3. Consequence loops ----------
    // Hostile block: informants (5%/day when loyalty < 25)
    if (d.loyalty < 25 && Math.random() < 0.05) {
      let invMsg = '';
      if (typeof updateInvestigation === 'function') {
        updateInvestigation(state, 'district_informant', 6);
        invMsg = ' (+6 investigation)';
      } else if (state.investigation && typeof state.investigation.points === 'number') {
        state.investigation.points = Math.min(100, state.investigation.points + 6);
        invMsg = ' (+6 investigation)';
      }
      msgs.push(`🐀 An informant in ${locName} talked to the task force. The neighborhood wants you gone.${invMsg}`);
      if (typeof pushNews === 'function') {
        pushNews(state, {
          headline: `WITNESS COMES FORWARD IN ${locName.toUpperCase()} DRUG PROBE`,
          body: 'Investigators say a local resident provided detailed information about narcotics activity in the neighborhood. "People here are tired of living like this," a detective said.',
          source: 'Channel 7 News', category: 'police', locId: locId,
        });
      }
    }
    // Beloved don: tip-offs (3%/day when loyalty > 75)
    if (d.loyalty > 75 && Math.random() < 0.03) {
      state.heat = Math.max(0, (state.heat || 0) - 5);
      msgs.push(`🙏 Locals in ${locName} warned you about an unmarked van parked on the corner. You moved everything in time. (Heat -5)`);
    }
    // Heavy patrols warning (only where you operate or stand)
    if (d.police > 70 && (controlled || locId === state.currentLocation) && Math.random() < 0.08) {
      msgs.push(`🚔 Heavy police presence in ${locName} — checkpoints on every corner. Deals here are riskier.`);
    }

    // ---------- 4. Natural drift toward baselines ----------
    if (d.police > d.basePolice && Math.random() < 0.35) d.police -= 1;
    else if (d.police < d.basePolice && Math.random() < 0.35) d.police += 1;
    const hasAnyProject = d.projects.some(p => p.done);
    if (d.condition < d.baseCondition && Math.random() < 0.08) d.condition += 1;
    else if (d.condition > d.baseCondition && !hasAnyProject && Math.random() < 0.08) d.condition -= 1;
    const loyaltyRest = Math.min(60, 35 + d.projects.filter(p => p.done).length * 5);
    if (d.loyalty > loyaltyRest && d.bleedOps.length === 0 && Math.random() < 0.06) d.loyalty -= 1;
    else if (d.loyalty < loyaltyRest && Math.random() < 0.06) d.loyalty += 1;

    // ---------- 5. Trajectory news every ~20 days ----------
    if (!d.trendRefDay) { d.trendRefDay = day; d.trendRefCond = d.condition; }
    if (day - d.trendRefDay >= 20) {
      const trend = d.condition - d.trendRefCond;
      d.lastTrend = trend;
      d.trendRefDay = day;
      d.trendRefCond = d.condition;
      if (trend >= 8 && typeof pushNews === 'function') {
        pushNews(state, {
          headline: `${locName.toUpperCase()} RENAISSANCE? CRIME DOWN AS INVESTMENT RETURNS`,
          body: 'New storefronts, working street lights, kids in league jerseys. Residents credit "community money" — city hall claims the credit anyway. Whoever is behind it, the block is coming back.',
          source: 'Miami Herald', category: 'world', locId: locId,
        });
        msgs.push(`📰 The papers noticed: ${locName} is turning around.`);
      } else if (trend <= -8 && typeof pushNews === 'function') {
        pushNews(state, {
          headline: `${locName.toUpperCase()} SPIRALS AS CITY LOOKS AWAY`,
          body: 'Shuttered shops, dead street lights, product on every corner. Residents say the neighborhood is being bled dry and nobody downtown is answering the phone.',
          source: 'Sun Sentinel', category: 'world', locId: locId,
        });
        msgs.push(`📰 The papers noticed: ${locName} is falling apart.`);
      }
    }
  }

  if (racketTotal > 0) {
    msgs.push(`💰 Protection rackets collected ${distEcoMoney(racketTotal)} across your districts.`);
  }
  return msgs;
}

// ============================================================
// UI
// ============================================================

function distEcoBarColor(kind, v) {
  if (kind === 'condition') return v >= 60 ? '#39ff88' : v >= 35 ? '#ffe066' : '#ff5566';
  if (kind === 'police') return v >= 70 ? '#ff5566' : v >= 45 ? '#ffe066' : '#66e0ff';
  return v >= 60 ? '#39ff88' : v >= 30 ? '#ffe066' : '#ff5566'; // loyalty
}

function distEcoBar(label, value, kind) {
  const v = distEcoClamp(value);
  const color = distEcoBarColor(kind, v);
  return `
    <div style="margin:0.15rem 0">
      <div style="display:flex;justify-content:space-between;font-size:0.72rem">
        <span class="text-dim">${label}</span><span style="color:${color}">${v}/100</span>
      </div>
      <div class="stat-bar" style="height:6px"><div class="stat-fill" style="width:${v}%;background:${color}"></div></div>
    </div>`;
}

function distEcoTrendArrow(d) {
  if (d.lastTrend > 2) return `<span class="neon-green" title="Improving">▲ +${d.lastTrend}</span>`;
  if (d.lastTrend < -2) return `<span class="neon-red" title="Declining">▼ ${d.lastTrend}</span>`;
  return `<span class="text-dim">—</span>`;
}

function renderDistrictEcology() {
  if (!gameState) { currentScreen = 'title'; return renderTitle(); }
  ensureDistrictsState(gameState);
  const day = gameState.day || 1;
  const known = distEcoKnownDistricts(gameState);
  // Controlled first, then alphabetical
  known.sort((a, b) => {
    const ca = distEcoControlled(gameState, a) ? 0 : 1;
    const cb = distEcoControlled(gameState, b) ? 0 : 1;
    if (ca !== cb) return ca - cb;
    return distEcoLocName(a).localeCompare(distEcoLocName(b));
  });

  const controlledIds = known.filter(id => distEcoControlled(gameState, id));
  // Auto-pick expanded card: current location if controlled, else first controlled
  if (!districtEcoExpanded) {
    districtEcoExpanded = controlledIds.includes(gameState.currentLocation)
      ? gameState.currentLocation
      : (controlledIds[0] || '__none__');
  }

  // ---------- summary ----------
  let sumCond = 0, projActive = 0, projDone = 0, bleedActive = 0;
  known.forEach(id => {
    const d = getDistrict(gameState, id);
    sumCond += d.condition;
    projActive += d.projects.filter(p => !p.done).length;
    projDone += d.projects.filter(p => p.done).length;
    bleedActive += d.bleedOps.length;
  });
  const avgCond = known.length ? Math.round(sumCond / known.length) : 50;

  const summaryHtml = `
    <div class="stats-grid" style="margin-bottom:1rem">
      <div class="stat-card"><div class="stat-value neon-cyan">${controlledIds.length}</div><div class="stat-label">Your Blocks</div></div>
      <div class="stat-card"><div class="stat-value" style="color:${distEcoBarColor('condition', avgCond)}">${avgCond}</div><div class="stat-label">Avg Condition</div></div>
      <div class="stat-card"><div class="stat-value neon-green">${projDone}<span class="text-dim" style="font-size:0.7em">+${projActive}🚧</span></div><div class="stat-label">Projects</div></div>
      <div class="stat-card"><div class="stat-value neon-red">${bleedActive}</div><div class="stat-label">Bleed Ops</div></div>
    </div>`;

  // ---------- district cards ----------
  const cards = known.map(locId => {
    const d = getDistrict(gameState, locId);
    const loc = distEcoLoc(locId);
    const name = distEcoLocName(locId);
    const emoji = (loc && loc.emoji) ? loc.emoji : '🏙️';
    const controlled = distEcoControlled(gameState, locId);
    const expanded = controlled && districtEcoExpanded === locId;
    const isHere = gameState.currentLocation === locId;

    const priceMod = getDistrictConditionPriceMod(gameState, locId, null);
    const priceColor = priceMod > 1.02 ? 'neon-green' : priceMod < 0.98 ? 'neon-red' : 'text-dim';
    const badges = [];
    if (controlled) badges.push(`<span class="neon-green" style="font-size:0.72rem">🏴 CONTROLLED</span>`);
    if (isHere) badges.push(`<span class="neon-cyan" style="font-size:0.72rem">📍 HERE</span>`);
    if (d.bleedOps.length) badges.push(`<span class="neon-red" style="font-size:0.72rem">🩸 BLEEDING x${d.bleedOps.length}</span>`);
    if (d.projects.some(p => !p.done)) badges.push(`<span style="color:#ffe066;font-size:0.72rem">🚧 BUILDING</span>`);
    if (d.projects.some(p => p.done)) badges.push(`<span style="color:#39ff88;font-size:0.72rem">🏛️ x${d.projects.filter(p => p.done).length}</span>`);

    let body = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem">
        ${distEcoBar('🏚️ Condition', d.condition, 'condition')}
        ${distEcoBar('🚔 Police', d.police, 'police')}
        ${distEcoBar('❤️ Loyalty', d.loyalty, 'loyalty')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-top:0.2rem">
        <span>Trend: ${distEcoTrendArrow(d)}</span>
        <span class="text-dim">Street prices: <span class="${priceColor}">x${priceMod.toFixed(2)}</span></span>
        <span class="text-dim">Bust risk: x${getDistrictBustMod(gameState, locId).toFixed(2)}</span>
      </div>`;

    if (d.loyalty < 25) body += `<p class="neon-red" style="font-size:0.72rem;margin:0.2rem 0">⚠️ The block hates you — informants are talking to the task force.</p>`;
    else if (d.loyalty > 75) body += `<p class="neon-green" style="font-size:0.72rem;margin:0.2rem 0">🙏 Beloved here — locals tip you off about police activity.</p>`;

    if (controlled && expanded) {
      body += distEcoRenderInvest(locId, d);
      body += distEcoRenderBleed(locId, d, day);
    } else if (controlled) {
      body += `<p class="text-dim" style="font-size:0.72rem;margin:0.3rem 0 0">Tap to manage investments and bleed ops ▼</p>`;
    } else {
      body += `<p class="text-dim" style="font-size:0.72rem;margin:0.3rem 0 0">Take this territory to invest in it — or bleed it dry.</p>`;
    }

    const borderColor = controlled ? (d.bleedOps.length ? '#ff5566' : '#39ff88') : 'var(--border-color, #555)';
    return `
      <div class="prop-card" style="border-color:${borderColor};margin-bottom:0.5rem;padding:0.6rem;${controlled ? 'cursor:pointer' : ''}"
        ${controlled ? `onclick="doDistrictToggle('${locId}')"` : ''}>
        <div class="card-header" style="margin-bottom:0.2rem">
          <span style="font-weight:bold;display:inline-flex;align-items:center;gap:0.45rem">${(() => {
            if (typeof buildDistrictThumb !== 'function' || typeof LOCATIONS === 'undefined') return emoji;
            const _l = LOCATIONS.find(x => x.id === locId);
            return _l ? buildDistrictThumb(_l, 52, 32) + ' ' + emoji : emoji;
          })()} ${name}</span>
          <span style="display:flex;gap:0.4rem;flex-wrap:wrap">${badges.join('')}</span>
        </div>
        ${body}
      </div>`;
  }).join('');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🏙️ NEIGHBORHOOD ECOLOGY</h2>
      <p class="text-dim" style="text-align:center;font-size:0.8rem;margin-bottom:0.8rem">
        Every block is alive. Clean it up and it protects you — bleed it dry and it snitches.
        Blighted blocks pay desperation prices; thriving ones go soft.
      </p>
      ${summaryHtml}
      ${cards || '<p class="text-dim">No districts visited yet. Get out there.</p>'}
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

// ---------- INVEST section (controlled + expanded) ----------
function distEcoRenderInvest(locId, d) {
  const cash = gameState.cash || 0;
  const rows = DISTRICT_PROJECTS.map(def => {
    const existing = d.projects.find(p => p.id === def.id);
    let action;
    if (existing && existing.done) {
      action = `<span class="neon-green" style="font-size:0.75rem">✅ BUILT</span>`;
    } else if (existing) {
      const pct = Math.round(((def.days - existing.daysLeft) / def.days) * 100);
      action = `
        <div style="min-width:110px">
          <div class="stat-bar" style="height:6px"><div class="stat-fill" style="width:${pct}%;background:#ffe066"></div></div>
          <span style="font-size:0.7rem;color:#ffe066">🚧 ${existing.daysLeft}d left</span>
        </div>`;
    } else if (cash < def.cost) {
      action = `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5" onclick="event.stopPropagation()">Need ${distEcoMoney(def.cost)}</button>`;
    } else {
      action = `<button class="btn btn-sm btn-buy" onclick="event.stopPropagation(); doStartProject('${locId}','${def.id}')">Build ${distEcoMoney(def.cost)}</button>`;
    }
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <div style="font-size:0.8rem">${def.emoji} <strong>${def.name}</strong> <span class="text-dim" style="font-size:0.7rem">(${def.days} days)</span></div>
          <div class="text-dim" style="font-size:0.7rem">${def.desc}</div>
          <div class="neon-cyan" style="font-size:0.7rem">${def.effectDesc}</div>
        </div>
        <div>${action}</div>
      </div>`;
  }).join('');
  return `
    <div class="card" style="margin-top:0.5rem;border-color:#39ff88" onclick="event.stopPropagation()">
      <div class="card-header"><span class="neon-green">🏗️ INVEST — clean up the block</span></div>
      ${rows}
    </div>`;
}

// ---------- BLEED section (controlled + expanded) ----------
function distEcoRenderBleed(locId, d, day) {
  const rows = DISTRICT_BLEED_OPS.map(def => {
    let action;
    if (!def.toggle) {
      // Strip the Businesses — instant with cooldown
      const daysSince = day - (d.lastStripDay || -999);
      if (daysSince < 30) {
        action = `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5" onclick="event.stopPropagation()">Recovering (${30 - daysSince}d)</button>`;
      } else {
        action = `<button class="btn btn-sm btn-sell" onclick="event.stopPropagation(); doCollectStrip('${locId}')">💵 Strip Now</button>`;
      }
    } else {
      const active = d.bleedOps.some(o => o.id === def.id);
      action = active
        ? `<button class="btn btn-sm btn-sell" onclick="event.stopPropagation(); doToggleBleed('${locId}','${def.id}')">⏹ STOP</button>`
        : `<button class="btn btn-sm btn-secondary" style="border-color:#ff5566;color:#ff5566" onclick="event.stopPropagation(); doToggleBleed('${locId}','${def.id}')">▶ START</button>`;
    }
    const activeTag = (def.toggle && d.bleedOps.some(o => o.id === def.id))
      ? ` <span class="neon-red" style="font-size:0.68rem">● ACTIVE</span>` : '';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <div style="font-size:0.8rem">${def.emoji} <strong>${def.name}</strong>${activeTag}</div>
          <div class="text-dim" style="font-size:0.7rem">${def.desc}</div>
          <div class="neon-red" style="font-size:0.7rem">⚠️ ${def.consequences}</div>
        </div>
        <div>${action}</div>
      </div>`;
  }).join('');
  return `
    <div class="card" style="margin-top:0.5rem;border-color:#ff5566" onclick="event.stopPropagation()">
      <div class="card-header"><span class="neon-red">🩸 BLEED — squeeze the block</span></div>
      ${rows}
    </div>`;
}

// ============================================================
// HANDLERS
// ============================================================

function doDistrictToggle(locId) {
  districtEcoExpanded = (districtEcoExpanded === locId) ? '__none__' : locId;
  if (typeof playSound === 'function') playSound('click');
  render();
}

function doStartProject(locId, projectId) {
  if (!gameState) return;
  const def = DISTRICT_PROJECTS.find(p => p.id === projectId);
  if (!def) return;
  if (!distEcoControlled(gameState, locId)) {
    showNotification('You must control this territory to invest in it.', 'error');
    playSound('error');
    return;
  }
  const d = getDistrict(gameState, locId);
  if (d.projects.some(p => p.id === projectId)) {
    showNotification(def.name + ' is already built or under construction here.', 'error');
    playSound('error');
    return;
  }
  if ((gameState.cash || 0) < def.cost) {
    showNotification('Not enough cash. Need ' + distEcoMoney(def.cost) + '.', 'error');
    playSound('error');
    return;
  }
  distEcoSpendCash(def.cost);
  d.projects.push({ id: projectId, startDay: gameState.day || 1, daysLeft: def.days, done: false });
  const msg = `🏗️ Broke ground on ${def.name} in ${distEcoLocName(locId)} (${distEcoMoney(def.cost)}, ready in ${def.days} days).`;
  distEcoLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doToggleBleed(locId, opId) {
  if (!gameState) return;
  const def = DISTRICT_BLEED_OPS.find(o => o.id === opId);
  if (!def || !def.toggle) return;
  if (!distEcoControlled(gameState, locId)) {
    showNotification('You must control this territory to run ops here.', 'error');
    playSound('error');
    return;
  }
  const d = getDistrict(gameState, locId);
  const locName = distEcoLocName(locId);
  const idx = d.bleedOps.findIndex(o => o.id === opId);
  if (idx >= 0) {
    // Deactivate
    d.bleedOps.splice(idx, 1);
    if (opId === 'flood_corners') d.sellBonus = 0;
    const msg = `⏹ Called off ${def.name} in ${locName}. The damage stays done.`;
    distEcoLog(msg);
    showNotification(msg, 'success');
    playSound('click');
  } else {
    // Activate
    const day = gameState.day || 1;
    d.bleedOps.push({ id: opId, since: day, lastTick: day });
    if (opId === 'corner_army') {
      d.police = distEcoClamp(d.police + 10);
      d.condition = distEcoClamp(d.condition - 5);
    } else if (opId === 'flood_corners') {
      d.sellBonus = 0.10;
      if (typeof pushNews === 'function') {
        pushNews(gameState, {
          headline: `CHEAP PRODUCT FLOODS THE CORNERS OF ${locName.toUpperCase()}`,
          body: 'Every corner is holding weight and every buyer knows it. Community leaders warn the neighborhood is being deliberately saturated.',
          source: 'Street Wire', category: 'street', locId: locId,
        });
      }
    }
    const msg = `▶ ${def.emoji} ${def.name} active in ${locName}. ${def.consequences}`;
    distEcoLog(msg);
    showNotification(msg, 'success');
    playSound('click');
  }
  render();
}

function doCollectStrip(locId) {
  if (!gameState) return;
  if (!distEcoControlled(gameState, locId)) {
    showNotification('You must control this territory to strip it.', 'error');
    playSound('error');
    return;
  }
  const d = getDistrict(gameState, locId);
  const day = gameState.day || 1;
  if (day - (d.lastStripDay || -999) < 30) {
    showNotification('These businesses have nothing left. Give it ' + (30 - (day - d.lastStripDay)) + ' more days.', 'error');
    playSound('error');
    return;
  }
  const locName = distEcoLocName(locId);
  // Richer/healthier blocks pay more; a gutted block pays the floor
  const healthFactor = Math.max(0.3, Math.min(1, d.condition / 60));
  const take = Math.round((15000 + Math.random() * 25000) * healthFactor / 100) * 100;
  distEcoGainDirty(gameState, take);
  d.condition = distEcoClamp(d.condition - 12);
  d.loyalty = distEcoClamp(d.loyalty - 10);
  d.lastStripDay = day;
  if (typeof pushNews === 'function') {
    pushNews(gameState, {
      headline: `BUSINESSES SHUTTER OVERNIGHT IN ${locName.toUpperCase()}`,
      body: 'Shop owners describe men going door to door emptying registers and demanding "back payments." Several storefronts did not reopen. Police say no one is willing to file a report.',
      source: 'Sun Sentinel', category: 'street', locId: locId,
    });
  }
  const msg = `🏚️ Stripped the businesses of ${locName} for ${distEcoMoney(take)}. (Condition -12, Loyalty -10)`;
  distEcoLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}
