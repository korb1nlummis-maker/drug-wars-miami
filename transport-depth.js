// transport-depth.js — SMUGGLING TRANSPORT OWNERSHIP & ROUTE RISK
// ============================================================
// Own a fleet of 8 day-gated smuggling transports and run product
// between world regions. Cargo leaves the player's inventory when a
// run departs and lands in state.stashes[toLoc] on arrival, after an
// interdiction roll shaped by transport heat signature, route heat,
// vessel condition, and the weekly Coast Guard cycle.
//
// Integration (already wired by the engine/UI behind typeof guards):
//   - game-engine.js daily hook:  processSmugglingDaily(state) -> [msgs]
//   - game-ui.js screen route:    currentScreen 'smuggling' -> renderSmugglingFleet()
//   - game-ui.js sidebar button:  🚤 Smuggling Fleet
//
// This file is a plain global script (no modules). All internals are
// prefixed smug* to avoid collisions with vehicle-system.js (street
// cars are a separate system).
// ============================================================

// ============================================================
// FLEET DEFINITIONS — 8 day-gated transports
// ============================================================
// regions: which world-region ids the transport can operate between
//          ('any' = every region). A run needs from-region != to-region,
//          both endpoints served, and the DESTINATION region unlocked.
// baseRisk: base interdiction % rolled on arrival.
// days: travel time in game days.
// totalLoss: interdiction always seizes everything AND the asset itself
//            is written off (the container slot is burned).
const SMUG_TRANSPORTS = [
  {
    id: 'smug_cigarette_boat', name: 'Cigarette Boat', emoji: '🚤',
    cost: 180000, minDay: 400, capacity: 300, baseRisk: 15, days: 1,
    regions: ['miami', 'caribbean'],
    desc: 'Twin-engine go-fast. Miami to the islands in a night. Loud, fast, and every Coast Guard cutter knows the silhouette.'
  },
  {
    id: 'smug_coyote_truck', name: 'Coyote Truck Network', emoji: '🚚',
    cost: 350000, minDay: 800, capacity: 600, baseRisk: 10, days: 2,
    regions: ['miami', 'mexico'],
    desc: 'A rotating cast of produce trucks and paid-off border crossings. Slow bleed of bribes, steady flow of product.'
  },
  {
    id: 'smug_shrimp_trawler', name: 'Shrimp Trawler', emoji: '🦐',
    cost: 250000, minDay: 600, capacity: 2000, baseRisk: 6, days: 4,
    regions: ['miami', 'caribbean'],
    desc: 'Rusty, legitimate-looking, and stuffed to the gunwales under the ice. Four slow days at eight knots.'
  },
  {
    id: 'smug_cessna_402', name: 'Cessna 402', emoji: '🛩️',
    cost: 450000, minDay: 1000, capacity: 800, baseRisk: 12, days: 2,
    regions: ['miami', 'caribbean', 'mexico', 'central_america', 'south_america', 'us_cities'],
    desc: 'Low over the water with the transponder off. Serves the whole Americas — destination region must be unlocked.'
  },
  {
    id: 'smug_twin_beechcraft', name: 'Twin Beechcraft', emoji: '✈️',
    cost: 900000, minDay: 1800, capacity: 1200, baseRisk: 9, days: 2,
    regions: ['miami', 'caribbean', 'mexico', 'central_america', 'south_america', 'us_cities'],
    desc: 'Bigger payload, longer legs, quieter paper trail. The professional\'s airplane for Americas routes.'
  },
  {
    id: 'smug_container_slot', name: 'Container Slot', emoji: '🚢',
    cost: 1500000, minDay: 2000, capacity: 10000, baseRisk: 3, days: 4, totalLoss: true,
    regions: 'any',
    desc: 'A bought slot in legitimate container traffic to any port on Earth. Almost never checked — but when customs cracks one open, you lose the cargo AND the slot.'
  },
  {
    id: 'smug_semi_sub', name: 'Semi-Submersible', emoji: '🤿',
    cost: 2500000, minDay: 2600, capacity: 5000, baseRisk: 4, days: 3,
    regions: ['miami', 'caribbean', 'mexico', 'central_america', 'south_america', 'us_cities'],
    desc: 'Fiberglass ghost riding a foot below the waterline. Jungle-built, near-invisible, Americas coastal routes.'
  },
  {
    id: 'smug_learjet', name: 'Learjet', emoji: '🛫',
    cost: 5000000, minDay: 3200, capacity: 1500, baseRisk: 8, days: 1,
    regions: 'any',
    desc: 'Diplomatic-grade cover, chartered crews, any region on the planet in a day. The kingpin\'s courier.'
  },
];

const SMUG_IMPOUND_DAYS = 30;          // impounded transports return after this
const SMUG_HEAT_DECAY = 2;             // heatSig decay per resting day
const SMUG_ROUTE_HEAT_DECAY = 1;       // routeHeat decay per day
const SMUG_REPAIR_RATE = 0.0015;       // repair $ per condition point = cost * this
const SMUG_CG_CYCLE_DAYS = 7;          // Coast Guard re-rolls hot/clear weekly
const SMUG_CG_HOT_CHANCE = 0.25;       // chance a watched pair goes hot
const SMUG_CG_HOT_BONUS = 10;          // +10 risk points on hot pairs
const SMUG_CG_CLEAR_BONUS = -5;        // -5 risk points on clear pairs

// Legacy world cities in LOCATIONS use continent-style region strings
// ('Americas', 'Europe'...). Map them to world-regions.js ids.
const SMUG_LEGACY_CITY_REGION = {
  miami: 'miami',
  bogota: 'south_america', medellin: 'south_america', rio: 'south_america',
  new_york: 'us_cities', los_angeles: 'us_cities',
  mexico_city: 'mexico',
  amsterdam: 'western_europe', london: 'western_europe', marseille: 'western_europe',
  moscow: 'eastern_europe', istanbul: 'eastern_europe',
  bangkok: 'southeast_asia', hong_kong: 'southeast_asia', tokyo: 'southeast_asia',
  mumbai: 'southeast_asia', kabul: 'southeast_asia', sydney: 'southeast_asia',
  casablanca: 'west_africa', lagos: 'west_africa',
};

const SMUG_WORLD_REGION_IDS = ['miami', 'caribbean', 'south_america', 'central_america',
  'mexico', 'us_cities', 'western_europe', 'eastern_europe', 'west_africa', 'southeast_asia'];

// UI state (module-level, not saved)
let smugUISelectedTransport = 0; // index into owned[] for the plan-run form

// ============================================================
// STATE / SELF-HEALING
// ============================================================

function ensureSmugglingState(state) {
  if (!state || typeof state !== 'object') return null;
  if (!state.smugglingFleet || typeof state.smugglingFleet !== 'object') {
    state.smugglingFleet = { owned: [], activeRuns: [], routeHeat: {}, log: [] };
  }
  const sf = state.smugglingFleet;
  if (!Array.isArray(sf.owned)) sf.owned = [];
  if (!Array.isArray(sf.activeRuns)) sf.activeRuns = [];
  if (!sf.routeHeat || typeof sf.routeHeat !== 'object') sf.routeHeat = {};
  if (!Array.isArray(sf.log)) sf.log = [];
  if (!sf.coastGuard || typeof sf.coastGuard !== 'object') {
    sf.coastGuard = { hot: [], clear: [], lastCycle: 0 };
  }
  if (!Array.isArray(sf.coastGuard.hot)) sf.coastGuard.hot = [];
  if (!Array.isArray(sf.coastGuard.clear)) sf.coastGuard.clear = [];
  if (typeof sf.coastGuard.lastCycle !== 'number') sf.coastGuard.lastCycle = 0;
  // Heal owned entries (old saves)
  sf.owned.forEach((o, i) => {
    if (typeof o.condition !== 'number') o.condition = 100;
    if (typeof o.heatSig !== 'number') o.heatSig = 0;
    if (typeof o.runs !== 'number') o.runs = 0;
    if (typeof o.impoundedUntil !== 'number') o.impoundedUntil = 0;
    if (!o.uid) o.uid = 'smug_' + i + '_' + Math.random().toString(36).substr(2, 6);
  });
  // Heal runs; drop runs pointing at transports that no longer exist
  sf.activeRuns = sf.activeRuns.filter(r => r && typeof r === 'object' && r.drugId && typeof r.qty === 'number');
  sf.activeRuns.forEach(r => {
    if (typeof r.arrivesDay !== 'number') r.arrivesDay = (state.day || 1) + 1;
    if (typeof r.risk !== 'number') r.risk = 10;
  });
  return sf;
}

// ============================================================
// HELPERS
// ============================================================

function smugMoney(n) {
  return '$' + Math.round(n || 0).toLocaleString();
}

function smugGetTransportDef(id) {
  return SMUG_TRANSPORTS.find(t => t.id === id) || null;
}

/** World-region id for a location id ('miami' region for Miami districts). */
function smugLocRegion(locId) {
  if (SMUG_LEGACY_CITY_REGION[locId]) return SMUG_LEGACY_CITY_REGION[locId];
  if (typeof LOCATIONS !== 'undefined' && Array.isArray(LOCATIONS)) {
    const loc = LOCATIONS.find(l => l.id === locId);
    if (loc && loc.region) {
      // miami-districts.js labels its districts region 'Miami' (capitalized)
      if (String(loc.region).toLowerCase() === 'miami') return 'miami';
      if (SMUG_WORLD_REGION_IDS.includes(loc.region)) return loc.region;
    }
  }
  if (typeof getWorldDistrictById === 'function') {
    const d = getWorldDistrictById(locId);
    if (d && d.region && SMUG_WORLD_REGION_IDS.includes(d.region)) return d.region;
  }
  return 'miami'; // fail-safe: treat unknown locations as home turf
}

function smugLocName(locId) {
  if (typeof LOCATIONS !== 'undefined' && Array.isArray(LOCATIONS)) {
    const loc = LOCATIONS.find(l => l.id === locId);
    if (loc && loc.name) return loc.name;
  }
  return String(locId || '?').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function smugRegionName(regionId) {
  if (typeof getRegionById === 'function') {
    const r = getRegionById(regionId);
    if (r) return r.name;
  }
  return String(regionId || '?').replace(/_/g, ' ');
}

/** Canonical route key for a region pair (order-independent). */
function smugPairKey(regionA, regionB) {
  return [regionA, regionB].sort().join('|');
}

/** Does this transport serve both regions (and are they different)? */
function smugTransportServes(def, regionA, regionB) {
  if (!def || regionA === regionB) return false;
  if (def.regions === 'any') return true;
  return def.regions.includes(regionA) && def.regions.includes(regionB);
}

function smugRegionUnlockedSafe(state, regionId) {
  if (typeof isRegionUnlocked !== 'function') return regionId === 'miami';
  return isRegionUnlocked(state, regionId);
}

/** Spend cash (dirty-money component first, matching the dirty/clean split). */
function smugSpendCash(state, amount) {
  state.cash = Math.max(0, (state.cash || 0) - amount);
  if (typeof state.dirtyMoney === 'number' && state.dirtyMoney > 0) {
    const fromDirty = Math.min(state.dirtyMoney, amount);
    state.dirtyMoney -= fromDirty;
    amount -= fromDirty;
  }
  if (typeof state.cleanMoney === 'number' && amount > 0) {
    state.cleanMoney = Math.max(0, state.cleanMoney - amount);
  }
}

function smugLog(state, msg) {
  const sf = ensureSmugglingState(state);
  if (!sf) return;
  sf.log.unshift({ day: state.day || 1, msg: msg });
  if (sf.log.length > 30) sf.log.length = 30;
  if (Array.isArray(state.messageLog)) state.messageLog.push(msg);
}

function smugRepairCostPerPoint(def) {
  return Math.max(50, Math.round(def.cost * SMUG_REPAIR_RATE));
}

/** Is this owned transport currently out on a run? */
function smugIsBusy(sf, uid) {
  return sf.activeRuns.some(r => r.transportUid === uid);
}

/**
 * Interdiction risk % for a transport on a route, given current state.
 * base% × (1 + heatSig/100) × (1 + routeHeat/100) × (condition<50 ? 1.3 : 1)
 * then Coast Guard cycle: hot pair +10 points, clear pair -5 points.
 * Clamped to 1..85.
 */
function smugComputeRisk(state, owned, def, fromRegion, toRegion) {
  const sf = ensureSmugglingState(state);
  const pair = smugPairKey(fromRegion, toRegion);
  const routeHeat = sf.routeHeat[pair] || 0;
  let risk = def.baseRisk
    * (1 + (owned.heatSig || 0) / 100)
    * (1 + routeHeat / 100)
    * ((owned.condition || 100) < 50 ? 1.3 : 1);
  if (sf.coastGuard.hot.includes(pair)) risk += SMUG_CG_HOT_BONUS;
  else if (sf.coastGuard.clear.includes(pair)) risk += SMUG_CG_CLEAR_BONUS;
  return Math.max(1, Math.min(85, Math.round(risk)));
}

// ============================================================
// DAILY PROCESSING (engine hook — returns array of message strings)
// ============================================================

function processSmugglingDaily(state) {
  const messages = [];
  const sf = ensureSmugglingState(state);
  if (!sf) return messages;
  const day = state.day || 1;

  // ---------- Weekly Coast Guard cycle ----------
  if (sf.owned.length > 0 && day - sf.coastGuard.lastCycle >= SMUG_CG_CYCLE_DAYS) {
    sf.coastGuard.lastCycle = day;
    // Watched pairs = every route pair any owned transport could fly/sail
    const watched = [];
    sf.owned.forEach(o => {
      const def = smugGetTransportDef(o.id);
      if (!def) return;
      const regions = def.regions === 'any' ? SMUG_WORLD_REGION_IDS : def.regions;
      for (let i = 0; i < regions.length; i++) {
        for (let j = i + 1; j < regions.length; j++) {
          const key = smugPairKey(regions[i], regions[j]);
          if (!watched.includes(key)) watched.push(key);
        }
      }
    });
    const prevHot = sf.coastGuard.hot.slice();
    sf.coastGuard.hot = [];
    sf.coastGuard.clear = [];
    watched.forEach(key => {
      if (Math.random() < SMUG_CG_HOT_CHANCE) sf.coastGuard.hot.push(key);
      else sf.coastGuard.clear.push(key);
    });
    const newlyHot = sf.coastGuard.hot.filter(k => !prevHot.includes(k));
    if (newlyHot.length > 0) {
      const names = newlyHot.slice(0, 3).map(k => {
        const [a, b] = k.split('|');
        return `${smugRegionName(a)}↔${smugRegionName(b)}`;
      }).join(', ');
      messages.push(`🛟 Coast Guard surge this week: ${names}${newlyHot.length > 3 ? ` (+${newlyHot.length - 3} more)` : ''} running hot (+10% interdiction). Other lanes are clear (-5%).`);
    } else if (watched.length > 0 && prevHot.length > 0) {
      messages.push('🛟 Coast Guard rotation: your lanes look clear this week (-5% interdiction).');
    }
  }

  // ---------- Advance & resolve runs ----------
  const arriving = sf.activeRuns.filter(r => day >= r.arrivesDay);
  sf.activeRuns = sf.activeRuns.filter(r => day < r.arrivesDay);

  arriving.forEach(run => {
    const ownedIdx = sf.owned.findIndex(o => o.uid === run.transportUid);
    const owned = ownedIdx >= 0 ? sf.owned[ownedIdx] : null;
    const def = smugGetTransportDef(run.transportId);
    if (!def) return; // unknown transport (bad save) — cargo evaporates silently rather than crashing
    const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === run.drugId) : null;
    const drugName = drug ? `${drug.emoji} ${drug.name}` : run.drugId;
    const fromRegion = smugLocRegion(run.fromLoc);
    const toRegion = smugLocRegion(run.toLoc);
    const pair = smugPairKey(fromRegion, toRegion);
    const risk = owned ? smugComputeRisk(state, owned, def, fromRegion, toRegion) : run.risk;

    if (Math.random() * 100 < risk) {
      // ---------- INTERDICTED ----------
      const impound = !def.totalLoss && Math.random() < 0.45;
      if (impound && owned) {
        owned.impoundedUntil = day + SMUG_IMPOUND_DAYS;
        owned.heatSig = Math.min(100, (owned.heatSig || 0) + 25);
        const msg = `⚓ ${def.emoji} ${def.name} IMPOUNDED en route to ${smugLocName(run.toLoc)} — ${run.qty} ${drugName} confiscated. Lawyers say ${SMUG_IMPOUND_DAYS} days to get it back.`;
        smugLog(state, msg);
        messages.push(msg);
      } else {
        // Seized outright
        if (def.totalLoss && ownedIdx >= 0) {
          sf.owned.splice(ownedIdx, 1); // container slot is burned
        } else if (owned) {
          owned.heatSig = Math.min(100, (owned.heatSig || 0) + 20);
          owned.condition = Math.max(5, (owned.condition || 100) - 10);
        }
        const lossNote = def.totalLoss ? ' The container slot is burned — total loss.' : '';
        const msg = `🚨 SEIZED: customs intercepted your ${def.emoji} ${def.name} — ${run.qty} ${drugName} lost on the ${smugRegionName(fromRegion)}→${smugRegionName(toRegion)} lane.${lossNote}`;
        smugLog(state, msg);
        messages.push(msg);
      }
      // Federal attention either way
      if (typeof updateInvestigation === 'function') {
        const invMsgs = updateInvestigation(state, 'smuggling_seizure', 8);
        if (invMsgs && invMsgs.length) messages.push(...invMsgs);
      }
      if (typeof addHeat === 'function') addHeat(state, 6);
      sf.routeHeat[pair] = Math.min(100, (sf.routeHeat[pair] || 0) + 12);
      if (typeof pushNews === 'function') {
        pushNews(state, {
          headline: `${def.totalLoss ? 'Customs cracks container' : 'Feds intercept smuggling ' + (def.days >= 3 ? 'vessel' : 'run')} on ${smugRegionName(toRegion)} lane`,
          body: `Authorities seized a major narcotics shipment inbound to ${smugLocName(run.toLoc)}. Officials called it "a blow to a sophisticated trafficking network."`,
          source: 'The Herald', category: 'crime', locId: run.toLoc, drugId: run.drugId,
        });
      }
    } else {
      // ---------- CLEAN ARRIVAL ----------
      if (!state.stashes || typeof state.stashes !== 'object') state.stashes = {};
      if (!state.stashes[run.toLoc]) state.stashes[run.toLoc] = {};
      state.stashes[run.toLoc][run.drugId] = (state.stashes[run.toLoc][run.drugId] || 0) + run.qty;
      if (owned) {
        owned.runs = (owned.runs || 0) + 1;
        owned.heatSig = Math.min(100, (owned.heatSig || 0) + 8 + Math.floor(Math.random() * 8)); // +8-15
        owned.condition = Math.max(5, (owned.condition || 100) - (3 + Math.floor(Math.random() * 5))); // -3-7
      }
      sf.routeHeat[pair] = Math.min(100, (sf.routeHeat[pair] || 0) + 6 + Math.floor(Math.random() * 5)); // +6-10
      const msg = `📦 ${def.emoji} ${def.name} delivered ${run.qty} ${drugName} to the ${smugLocName(run.toLoc)} stash. Clean run.`;
      smugLog(state, msg);
      messages.push(msg);
    }
  });

  // ---------- Release impounds ----------
  sf.owned.forEach(o => {
    if (o.impoundedUntil && day >= o.impoundedUntil) {
      o.impoundedUntil = 0;
      const def = smugGetTransportDef(o.id);
      const msg = `⚓ ${def ? def.emoji + ' ' + def.name : 'Transport'} released from impound. Back in service.`;
      smugLog(state, msg);
      messages.push(msg);
    }
  });

  // ---------- Daily decay while resting ----------
  sf.owned.forEach(o => {
    if (!smugIsBusy(sf, o.uid) && (!o.impoundedUntil || o.impoundedUntil === 0)) {
      o.heatSig = Math.max(0, (o.heatSig || 0) - SMUG_HEAT_DECAY);
    }
  });
  Object.keys(sf.routeHeat).forEach(k => {
    sf.routeHeat[k] = Math.max(0, sf.routeHeat[k] - SMUG_ROUTE_HEAT_DECAY);
    if (sf.routeHeat[k] <= 0) delete sf.routeHeat[k];
  });

  return messages;
}

// ============================================================
// UI — MAIN SCREEN
// ============================================================

function renderSmugglingFleet() {
  if (!gameState) { currentScreen = 'title'; return renderTitle(); }
  const sf = ensureSmugglingState(gameState);
  const day = gameState.day || 1;
  const cash = gameState.cash || 0;

  // ---------- Summary ----------
  const totalCap = sf.owned.reduce((s, o) => {
    const def = smugGetTransportDef(o.id);
    return s + (def ? def.capacity : 0);
  }, 0);
  const summaryHtml = `
    <div class="stats-grid" style="margin-bottom:1rem">
      <div class="stat-card"><div class="stat-value neon-cyan">${sf.owned.length}</div><div class="stat-label">Transports</div></div>
      <div class="stat-card"><div class="stat-value neon-yellow">${sf.activeRuns.length}</div><div class="stat-label">Runs En Route</div></div>
      <div class="stat-card"><div class="stat-value neon-green">${totalCap.toLocaleString()}</div><div class="stat-label">Fleet Capacity</div></div>
      <div class="stat-card"><div class="stat-value neon-red">${sf.coastGuard.hot.length}</div><div class="stat-label">Hot Lanes</div></div>
    </div>`;

  // ---------- Owned fleet cards ----------
  const fleetCards = sf.owned.map((o, idx) => smugRenderOwnedCard(o, idx, sf)).join('')
    || '<p class="text-dim" style="font-size:0.85rem">No transports owned. Every empire needs a navy — buy one below.</p>';

  // ---------- Plan run form ----------
  const planHtml = smugRenderPlanForm(sf);

  // ---------- Active runs ----------
  const runRows = sf.activeRuns.map((r, idx) => {
    const def = smugGetTransportDef(r.transportId);
    const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === r.drugId) : null;
    const eta = Math.max(0, r.arrivesDay - day);
    return `
      <div class="card" style="border-color:var(--neon-yellow);margin-bottom:0.4rem;padding:0.5rem 0.7rem">
        <div class="card-header" style="margin:0">
          <span>${def ? def.emoji + ' ' + def.name : r.transportId} — ${r.qty} ${drug ? drug.emoji + ' ' + drug.name : r.drugId}</span>
          <span class="neon-yellow">ETA ${eta}d</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem">
          <span class="text-dim">${smugLocName(r.fromLoc)} → ${smugLocName(r.toLoc)} | est. interdiction <span class="${r.risk >= 25 ? 'neon-red' : r.risk >= 12 ? 'neon-yellow' : 'neon-green'}">${r.risk}%</span></span>
          <button class="btn btn-sm btn-secondary" onclick="doCancelRun(${idx})">↩️ Recall</button>
        </div>
      </div>`;
  }).join('') || '<p class="text-dim" style="font-size:0.85rem">No runs en route.</p>';

  // ---------- Shop ----------
  const shopCards = SMUG_TRANSPORTS.map(def => {
    const locked = day < def.minDay;
    const ownedCount = sf.owned.filter(o => o.id === def.id).length;
    const routeLabel = def.regions === 'any'
      ? '🌐 Any region'
      : def.regions.map(r => smugRegionName(r)).join(' ↔ ');
    const btn = locked
      ? `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">🔒 Unlocks day ${def.minDay}</button>`
      : (cash < def.cost
        ? `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">Need ${smugMoney(def.cost)}</button>`
        : `<button class="btn btn-sm btn-buy" onclick="doBuyTransport('${def.id}')">💵 Buy (${smugMoney(def.cost)})</button>`);
    return `
      <div class="prop-card" style="margin-bottom:0.5rem;padding:0.6rem;${locked ? 'opacity:0.55' : ''}">
        <div class="card-header" style="margin-bottom:0.2rem">
          <span style="font-weight:bold">${def.emoji} ${def.name}${ownedCount > 0 ? ` <span class="neon-cyan" style="font-size:0.75rem">(own ${ownedCount})</span>` : ''}</span>
          <span class="neon-green">${smugMoney(def.cost)}</span>
        </div>
        <p class="text-dim" style="font-size:0.75rem;margin:0.2rem 0">${def.desc}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.15rem;font-size:0.75rem;margin:0.3rem 0">
          <span>📦 Capacity: <span class="neon-cyan">${def.capacity.toLocaleString()}</span></span>
          <span>🚨 Base risk: <span class="neon-yellow">${def.baseRisk}%${def.totalLoss ? ' (total-loss)' : ''}</span></span>
          <span>⏱️ Transit: <span class="neon-cyan">${def.days}d</span></span>
          <span>🗺️ ${routeLabel}</span>
        </div>
        ${btn}
      </div>`;
  }).join('');

  // ---------- Log ----------
  const logRows = sf.log.slice(0, 10).map(e =>
    `<div style="font-size:0.75rem;padding:0.15rem 0;border-bottom:1px solid rgba(255,255,255,0.06)"><span class="text-dim">Day ${e.day}:</span> ${e.msg}</div>`
  ).join('') || '<p class="text-dim" style="font-size:0.8rem">No smuggling history yet.</p>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🚤 SMUGGLING FLEET</h2>
      <p class="text-dim" style="text-align:center;font-size:0.8rem;margin-bottom:0.8rem">
        Own the transports, own the routes. Cargo ships out of your pockets and lands in the destination stash — if the Coast Guard doesn't get it first.
      </p>
      ${summaryHtml}
      <div class="card"><div class="card-header"><span class="neon-cyan">⚓ YOUR FLEET</span></div></div>
      ${fleetCards}
      ${planHtml}
      <div class="card" style="margin-top:0.8rem"><div class="card-header"><span class="neon-yellow">🌊 RUNS EN ROUTE</span></div></div>
      ${runRows}
      <div class="card" style="margin-top:0.8rem"><div class="card-header"><span class="neon-green">🛒 BROKER — BUY TRANSPORTS</span></div></div>
      ${shopCards}
      <div class="card" style="margin-top:0.8rem"><div class="card-header"><span class="text-dim">📜 SMUGGLER'S LOG</span></div>${logRows}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function smugRenderOwnedCard(o, idx, sf) {
  const def = smugGetTransportDef(o.id);
  if (!def) return '';
  const day = gameState.day || 1;
  const busy = smugIsBusy(sf, o.uid);
  const impounded = o.impoundedUntil && o.impoundedUntil > day;
  const condColor = o.condition >= 70 ? 'var(--neon-green)' : o.condition >= 50 ? 'var(--neon-yellow)' : 'var(--neon-red)';
  const heatColor = o.heatSig >= 60 ? 'var(--neon-red)' : o.heatSig >= 30 ? 'var(--neon-yellow)' : 'var(--neon-green)';
  const damage = 100 - o.condition;
  const repairCost = damage * smugRepairCostPerPoint(def);

  let statusBadge;
  if (impounded) statusBadge = `<span class="neon-red">⚓ IMPOUNDED (${o.impoundedUntil - day}d)</span>`;
  else if (busy) statusBadge = `<span class="neon-yellow">🌊 EN ROUTE</span>`;
  else statusBadge = `<span class="neon-green">READY</span>`;

  const buttons = [];
  if (damage > 0 && !busy) {
    if ((gameState.cash || 0) >= repairCost) {
      buttons.push(`<button class="btn btn-sm btn-buy" onclick="doRepairTransport(${idx})">🔧 Repair (${smugMoney(repairCost)})</button>`);
    } else {
      buttons.push(`<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">🔧 Repair — need ${smugMoney(repairCost)}</button>`);
    }
  }

  return `
    <div class="prop-card" style="border-color:${impounded ? 'var(--neon-red)' : busy ? 'var(--neon-yellow)' : condColor};margin-bottom:0.5rem;padding:0.6rem">
      <div class="card-header" style="margin-bottom:0.2rem">
        <span style="font-weight:bold">${def.emoji} ${def.name} <span class="text-dim" style="font-weight:normal;font-size:0.75rem">(${o.runs} runs)</span></span>
        ${statusBadge}
      </div>
      <div style="font-size:0.75rem;margin:0.2rem 0">
        <span class="text-dim">Condition ${o.condition}/100${o.condition < 50 ? ' <span class="neon-red">(+30% risk!)</span>' : ''}</span>
        <div class="stat-bar" style="height:6px"><div class="stat-fill" style="width:${o.condition}%;background:${condColor}"></div></div>
        <span class="text-dim">Heat signature ${o.heatSig}/100 — rests off ${SMUG_HEAT_DECAY}/day when idle</span>
        <div class="stat-bar" style="height:6px"><div class="stat-fill" style="width:${o.heatSig}%;background:${heatColor}"></div></div>
      </div>
      ${o.heatSig >= 40 && !busy ? '<p class="neon-yellow" style="font-size:0.72rem;margin:0.2rem 0">💤 Running hot — let her rest a few days before the next run.</p>' : ''}
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.3rem">${buttons.join('')}</div>
    </div>`;
}

function smugRenderPlanForm(sf) {
  const day = gameState.day || 1;
  const ready = sf.owned
    .map((o, idx) => ({ o, idx }))
    .filter(x => !smugIsBusy(sf, x.o.uid) && (!x.o.impoundedUntil || x.o.impoundedUntil <= day));
  if (ready.length === 0) {
    return `<div class="card" style="margin-top:0.6rem"><div class="card-header"><span>🗺️ PLAN A RUN</span></div>
      <p class="text-dim" style="font-size:0.8rem">No transport is ready. ${sf.owned.length === 0 ? 'Buy one from the broker below.' : 'Wait for runs to land or impounds to clear.'}</p></div>`;
  }

  // Clamp the remembered selection to a ready transport
  if (!ready.some(x => x.idx === smugUISelectedTransport)) smugUISelectedTransport = ready[0].idx;
  const sel = sf.owned[smugUISelectedTransport];
  const selDef = smugGetTransportDef(sel.id);

  const fromLoc = gameState.currentLocation;
  const fromRegion = smugLocRegion(fromLoc);

  const transportOpts = ready.map(x => {
    const d = smugGetTransportDef(x.o.id);
    return `<option value="${x.idx}" ${x.idx === smugUISelectedTransport ? 'selected' : ''}>${d ? d.name : x.o.id} (cap ${d ? d.capacity : '?'}, heat ${x.o.heatSig})</option>`;
  }).join('');

  // Destinations: every location in a served + unlocked region other than here
  const servesFromHere = selDef && (selDef.regions === 'any' || selDef.regions.includes(fromRegion));
  let destOpts = '';
  let destCount = 0;
  if (servesFromHere && typeof LOCATIONS !== 'undefined') {
    const byRegion = {};
    LOCATIONS.forEach(loc => {
      if (loc.id === fromLoc) return;
      const region = smugLocRegion(loc.id);
      if (region === fromRegion) return;
      if (!smugTransportServes(selDef, fromRegion, region)) return;
      if (!smugRegionUnlockedSafe(gameState, region)) return;
      if (!byRegion[region]) byRegion[region] = [];
      byRegion[region].push(loc);
    });
    destOpts = Object.keys(byRegion).map(region => {
      const pair = smugPairKey(fromRegion, region);
      const hot = sf.coastGuard.hot.includes(pair);
      return `<optgroup label="${smugRegionName(region)}${hot ? ' 🔥 HOT LANE' : ''}">` +
        byRegion[region].map(loc => { destCount++; return `<option value="${loc.id}">${loc.name}</option>`; }).join('') +
        '</optgroup>';
    }).join('');
  }

  const invDrugs = Object.entries(gameState.inventory || {}).filter(([, v]) => v > 0);
  const drugOpts = invDrugs.map(([id, amt]) => {
    const d = (typeof DRUGS !== 'undefined') ? DRUGS.find(x => x.id === id) : null;
    return `<option value="${id}">${d ? d.emoji + ' ' + d.name : id} (${amt} on hand)</option>`;
  }).join('');

  let blocker = '';
  if (!servesFromHere) {
    blocker = `<p class="neon-red" style="font-size:0.78rem">${selDef ? selDef.name : 'This transport'} doesn't operate out of ${smugRegionName(fromRegion)}. Travel to a served region${selDef && selDef.regions !== 'any' ? ` (${selDef.regions.map(r => smugRegionName(r)).join(', ')})` : ''} to launch it.</p>`;
  } else if (destCount === 0) {
    blocker = '<p class="neon-red" style="font-size:0.78rem">No unlocked destination regions on this transport\'s routes. Unlock regions on the World Map first.</p>';
  } else if (invDrugs.length === 0) {
    blocker = '<p class="neon-red" style="font-size:0.78rem">Your pockets are empty — runs ship product from your carried inventory. Buy product first.</p>';
  }
  const canPlan = !blocker;

  return `
    <div class="card" style="margin-top:0.6rem;border-color:var(--neon-cyan)">
      <div class="card-header"><span class="neon-cyan">🗺️ PLAN A RUN</span><span class="text-dim" style="font-size:0.75rem">from ${smugLocName(fromLoc)} (${smugRegionName(fromRegion)})</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.4rem;font-size:0.8rem">
        <label>Transport<br><select id="smug-transport-sel" onchange="smugUISelectTransport=parseInt(this.value,10);render();" style="width:100%">${transportOpts}</select></label>
        <label>Destination<br><select id="smug-dest-sel" style="width:100%" ${canPlan ? '' : 'disabled'}>${destOpts || '<option value="">—</option>'}</select></label>
        <label>Product<br><select id="smug-drug-sel" style="width:100%" ${canPlan ? '' : 'disabled'}>${drugOpts || '<option value="">—</option>'}</select></label>
        <label>Quantity (max ${selDef ? selDef.capacity.toLocaleString() : '?'})<br><input id="smug-qty" type="number" min="1" max="${selDef ? selDef.capacity : 1}" value="${selDef ? Math.min(selDef.capacity, (invDrugs[0] ? invDrugs[0][1] : 1)) : 1}" style="width:100%" ${canPlan ? '' : 'disabled'}></label>
      </div>
      ${blocker}
      <p class="text-dim" style="font-size:0.72rem;margin:0.3rem 0">Transit ${selDef ? selDef.days : '?'}d. Cargo leaves your inventory now and lands in the destination stash. Interdiction is rolled on arrival${selDef && selDef.totalLoss ? ' — a container bust is a TOTAL LOSS (cargo + slot)' : ''}.</p>
      ${canPlan ? `<button class="btn btn-sm btn-sell" onclick="doPlanRun()">🚀 Launch Run</button>` : ''}
    </div>`;
}

// ============================================================
// HANDLERS
// ============================================================

function doBuyTransport(id) {
  if (!gameState) return;
  const sf = ensureSmugglingState(gameState);
  const def = smugGetTransportDef(id);
  if (!def) return;
  const day = gameState.day || 1;
  if (day < def.minDay) {
    showNotification(`${def.name} isn't available until day ${def.minDay}. Your broker can't source it yet.`, 'error');
    playSound('error');
    return;
  }
  if ((gameState.cash || 0) < def.cost) {
    showNotification(`Not enough cash. ${def.name} costs ${smugMoney(def.cost)}.`, 'error');
    playSound('error');
    return;
  }
  smugSpendCash(gameState, def.cost);
  sf.owned.push({
    id: def.id, condition: 100, heatSig: 0, runs: 0, impoundedUntil: 0,
    uid: 'smug_' + (gameState.day || 1) + '_' + Math.random().toString(36).substr(2, 6),
  });
  const msg = `${def.emoji} Bought ${def.name} for ${smugMoney(def.cost)}. The fleet grows.`;
  smugLog(gameState, msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doRepairTransport(idx) {
  if (!gameState) return;
  const sf = ensureSmugglingState(gameState);
  const o = sf.owned[idx];
  if (!o) return;
  const def = smugGetTransportDef(o.id);
  if (!def) return;
  if (smugIsBusy(sf, o.uid)) {
    showNotification('Can\'t repair a transport that\'s out on a run.', 'error');
    playSound('error');
    return;
  }
  const damage = 100 - (o.condition || 100);
  if (damage <= 0) {
    showNotification(`${def.name} is already in perfect condition.`, 'error');
    playSound('error');
    return;
  }
  const cost = damage * smugRepairCostPerPoint(def);
  if ((gameState.cash || 0) < cost) {
    showNotification(`Repairs cost ${smugMoney(cost)} — you don't have it.`, 'error');
    playSound('error');
    return;
  }
  smugSpendCash(gameState, cost);
  o.condition = 100;
  const msg = `🔧 ${def.emoji} ${def.name} repaired to 100% for ${smugMoney(cost)}.`;
  smugLog(gameState, msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

/**
 * Launch a run. Args are optional — when omitted (UI button), values are
 * read from the plan-form <select>/<input> elements by id.
 */
function doPlanRun(transportIdx, toLocId, drugId, qty) {
  if (!gameState) return;
  const sf = ensureSmugglingState(gameState);

  // Read the form when args aren't supplied
  if (typeof document !== 'undefined') {
    if (transportIdx === undefined) {
      const el = document.getElementById('smug-transport-sel');
      if (el) transportIdx = parseInt(el.value, 10);
    }
    if (toLocId === undefined) {
      const el = document.getElementById('smug-dest-sel');
      if (el) toLocId = el.value;
    }
    if (drugId === undefined) {
      const el = document.getElementById('smug-drug-sel');
      if (el) drugId = el.value;
    }
    if (qty === undefined) {
      const el = document.getElementById('smug-qty');
      if (el) qty = parseInt(el.value, 10);
    }
  }
  transportIdx = parseInt(transportIdx, 10);
  qty = Math.floor(Number(qty));

  const fail = (msg) => {
    showNotification(msg, 'error');
    playSound('error');
    return;
  };

  const o = sf.owned[transportIdx];
  if (!o) return fail('Select a transport first.');
  const def = smugGetTransportDef(o.id);
  if (!def) return fail('Unknown transport.');
  const day = gameState.day || 1;
  if (smugIsBusy(sf, o.uid)) return fail(`${def.name} is already out on a run.`);
  if (o.impoundedUntil && o.impoundedUntil > day) return fail(`${def.name} is impounded for ${o.impoundedUntil - day} more days.`);
  if (!toLocId) return fail('Pick a destination.');
  if (!drugId) return fail('Pick a product to ship.');
  if (!qty || qty < 1) return fail('Enter a quantity.');
  if (qty > def.capacity) return fail(`${def.name} maxes out at ${def.capacity.toLocaleString()} units.`);

  const have = (gameState.inventory && gameState.inventory[drugId]) || 0;
  if (have < qty) return fail(`You only carry ${have} of that product. Runs ship from your inventory.`);

  const fromLoc = gameState.currentLocation;
  const fromRegion = smugLocRegion(fromLoc);
  const toRegion = smugLocRegion(toLocId);
  if (fromRegion === toRegion) return fail('Destination must be in a different region — use street travel for local moves.');
  if (!smugTransportServes(def, fromRegion, toRegion)) {
    return fail(`${def.name} doesn't run the ${smugRegionName(fromRegion)}↔${smugRegionName(toRegion)} lane.`);
  }
  if (!smugRegionUnlockedSafe(gameState, toRegion)) {
    return fail(`${smugRegionName(toRegion)} isn't unlocked yet. Open it on the World Map first.`);
  }

  // Cargo leaves inventory now
  gameState.inventory[drugId] -= qty;
  if (gameState.inventory[drugId] <= 0) delete gameState.inventory[drugId];

  const risk = smugComputeRisk(gameState, o, def, fromRegion, toRegion);
  sf.activeRuns.push({
    transportUid: o.uid,
    transportId: o.id,
    fromLoc: fromLoc,
    toLoc: toLocId,
    drugId: drugId,
    qty: qty,
    departDay: day,
    arrivesDay: day + def.days,
    risk: risk,
  });

  const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === drugId) : null;
  const msg = `🚀 ${def.emoji} ${def.name} departed ${smugLocName(fromLoc)} with ${qty} ${drug ? drug.emoji + ' ' + drug.name : drugId} bound for ${smugLocName(toLocId)}. ETA ${def.days}d, est. interdiction ${risk}%.`;
  smugLog(gameState, msg);
  showNotification(msg, 'success');
  playSound('click');
  render();
}

function doCancelRun(idx) {
  if (!gameState) return;
  const sf = ensureSmugglingState(gameState);
  const run = sf.activeRuns[idx];
  if (!run) return;
  const def = smugGetTransportDef(run.transportId);
  sf.activeRuns.splice(idx, 1);
  // Cargo turns back and gets dropped at the origin stash (no inventory-space issues)
  if (!gameState.stashes || typeof gameState.stashes !== 'object') gameState.stashes = {};
  if (!gameState.stashes[run.fromLoc]) gameState.stashes[run.fromLoc] = {};
  gameState.stashes[run.fromLoc][run.drugId] = (gameState.stashes[run.fromLoc][run.drugId] || 0) + run.qty;
  const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === run.drugId) : null;
  const msg = `↩️ Recalled ${def ? def.emoji + ' ' + def.name : run.transportId} — ${run.qty} ${drug ? drug.name : run.drugId} dropped back at the ${smugLocName(run.fromLoc)} stash.`;
  smugLog(gameState, msg);
  showNotification(msg, 'success');
  playSound('click');
  render();
}
