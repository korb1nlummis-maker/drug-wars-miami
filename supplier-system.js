// supplier-system.js — Market Depth: Supplier Relationships & Negotiated Bulk Deals
// ============================================================
// 12 named suppliers across 4 tiers (Street / Wholesale / Connect / Cartel)
// selling BULK LOTS below street price. Build trust per supplier for
// discounts, bigger lots and credit lines. Haggle each stock entry once
// per weekly restock. Watch for limited-time spot offers and buybacks.
//
// Integration (already wired by the host page):
//   - <script src="supplier-system.js"></script>
//   - case 'suppliers': app.innerHTML = renderSuppliers(); break;
//   - Market tab button -> currentScreen = 'suppliers'
//   - Daily hook: processSuppliersDaily(state) -> array of message strings
//
// Plain global script (no modules), matching the rest of the codebase.
// This file edits no other file.
// ============================================================

// ============================================================
// DATA — TIERS & SUPPLIERS
// ============================================================

const SUPPLIER_TIERS = [
  { id: 'street', name: 'STREET CONNECTS', emoji: '🏙️', minDay: 1, minLevel: 1, color: '#88ccff',
    blurb: 'Corner hustlers. Small lots, no questions.' },
  { id: 'wholesale', name: 'WHOLESALE', emoji: '📦', minDay: 500, minLevel: 4, color: '#39ff14',
    blurb: 'Movers with warehouses. Real volume starts here.' },
  { id: 'connect', name: 'THE CONNECT', emoji: '📡', minDay: 1500, minLevel: 6, color: '#ffe600',
    blurb: 'Plugged-in operators. Weekly exclusive deals.' },
  { id: 'cartel', name: 'CARTEL', emoji: '🐊', minDay: 2600, minLevel: 8, color: '#ff3366',
    blurb: 'The source itself. Container-load weight, fronted product.' },
];

// lotMin/lotMax: base lot sizes per restock (trust 50+ adds +50%).
// catalog: drug ids this supplier can EVER carry — each is still gated by
// the drug's own minDay/minLevel unlock (same filter the market uses).
const SUPPLIERS = [
  // ---- STREET (day 1) — starter drugs, lots 10-40 ----
  { id: 'lil_rey', name: "Lil' Rey", emoji: '🛹', tier: 'street',
    personality: 'Liberty City skate rat. Deals weed and pills out of a JanSport. Fast, cheap, always short on change.',
    catalog: ['weed', 'ludes', 'adderall'], lotMin: 10, lotMax: 30 },
  { id: 'mama_odalys', name: 'Mama Odalys', emoji: '🌺', tier: 'street',
    personality: 'Runs a Little Havana botánica. Shrooms and peyote behind the Santería candles. Calls everyone "mi niño".',
    catalog: ['shrooms', 'peyote', 'weed'], lotMin: 15, lotMax: 40 },
  { id: 'tommy_two_tone', name: 'Tommy Two-Tone', emoji: '⚡', tier: 'street',
    personality: 'Pastel-suit hustler at the Sunshine Skate roller rink. Moves speed and ludes to the disco crowd.',
    catalog: ['speed', 'ludes', 'peyote'], lotMin: 15, lotMax: 40 },

  // ---- WHOLESALE (day 500+, lvl 4+) — early/mid drugs, lots 40-150 ----
  { id: 'sal_the_fish', name: 'Sal "The Fish" Manzano', emoji: '🐟', tier: 'wholesale',
    personality: 'Fish-market wholesaler on the Miami River docks. Hash and pills packed under the ice. Smells like money and mackerel.',
    catalog: ['hashish', 'xanax', 'weed', 'crack'], lotMin: 40, lotMax: 120 },
  { id: 'dj_neon', name: 'DJ Neon', emoji: '🎧', tier: 'wholesale',
    personality: 'Ocean Drive club resident. Lean, benzos and GHB move through the DJ booth. Only talks business after midnight.',
    catalog: ['lean', 'xanax', 'adderall', 'ghb'], lotMin: 40, lotMax: 130 },
  { id: 'carmen_la_jefa', name: 'Carmen "La Jefa"', emoji: '💅', tier: 'wholesale',
    personality: 'Nail-salon queen of Hialeah. Crack and speed by the duffel bag. Never smudges a nail, never misses a payment.',
    catalog: ['crack', 'speed', 'lean', 'hashish'], lotMin: 50, lotMax: 150 },

  // ---- CONNECT (day 1500+, lvl 6+) — mid/empire drugs, lots 100-400 ----
  { id: 'ti_georges', name: 'Ti-Georges "The Haitian"', emoji: '🕯️', tier: 'connect',
    personality: 'Little Haiti connect who prays over every shipment. Acid and DMT from labs nobody else can find.',
    catalog: ['acid', 'dmt', 'ghb', 'shrooms'], lotMin: 100, lotMax: 300 },
  { id: 'yacht_club_freddy', name: 'Yacht Club Freddy', emoji: '⛵', tier: 'connect',
    personality: 'Coconut Grove marina broker. Ecstasy and ketamine off charter boats. Blazer, no socks, Rolex two sizes loose.',
    catalog: ['ecstasy', 'ketamine', 'acid', 'ghb'], lotMin: 120, lotMax: 350 },
  { id: 'pastor_reyes', name: '"Pastor" Reyes', emoji: '⛪', tier: 'connect',
    personality: 'Storefront preacher off Calle Ocho. Meth and opium move through the mission donation boxes. Hallelujah.',
    catalog: ['methamphetamine', 'opium', 'ecstasy', 'ketamine'], lotMin: 120, lotMax: 400 },

  // ---- CARTEL (day 2600+, lvl 8+) — premium, lots 200-1000 ----
  { id: 'el_padrino', name: 'El Padrino', emoji: '🐊', tier: 'cartel',
    personality: 'Everglades airstrip kingpin. Cessnas at 3 AM, kilos in gator country. Fronts product to people he likes. Once.',
    catalog: ['cocaine', 'heroin', 'opium'], lotMin: 200, lotMax: 700 },
  { id: 'la_vibora', name: 'La Víbora', emoji: '🐍', tier: 'cartel',
    personality: 'Cali cartel emissary in a Brickell penthouse. Speaks four languages, forgives in none of them.',
    catalog: ['cocaine', 'methamphetamine', 'fentanyl', 'ketamine'], lotMin: 250, lotMax: 900 },
  { id: 'colonel_diaz', name: 'Colonel Díaz', emoji: '🎖️', tier: 'cartel',
    personality: 'Ex-military smuggler flying C-123s out of Panama. Heroin by the pallet. Payment terms are non-negotiable — mostly.',
    catalog: ['heroin', 'opium', 'dmt', 'fentanyl'], lotMin: 300, lotMax: 1000 },
];

const SUPPLIER_RESTOCK_DAYS = 7;
const SUPPLIER_CREDIT_DAYS = 14;
const SUPPLIER_CREDIT_MARKUP = 1.10;
const SUPPLIER_BURN_DAYS = 60;

const SUPPLIER_HAGGLE_FAIL_LINES = [
  '"You wanna play games? Price just went up, chico."',
  '"Insulting. My cousin pays more and he\'s FAMILY."',
  '"Get outta here with that. Now it costs extra."',
  '"I liked you better when you didn\'t talk numbers."',
  '"That mouth of yours is expensive. For you."',
];

const SUPPLIER_DEFAULT_LINES = [
  'left a dead fish wrapped in your unpaid invoice. Message received.',
  'sent two guys in guayaberas to explain the interest schedule. With bats.',
  'burned your name up and down the wire. "Nobody fronts this clown again."',
];

// ============================================================
// STATE / HELPERS
// ============================================================

/** Self-healing supplier sub-state. Called at top of render + daily proc. */
function ensureSupplierState(state) {
  if (!state) return null;
  if (!state.suppliers || typeof state.suppliers !== 'object' || Array.isArray(state.suppliers)) {
    state.suppliers = {};
  }
  const s = state.suppliers;
  if (!s.rel || typeof s.rel !== 'object') s.rel = {};
  if (!Array.isArray(s.credit)) s.credit = [];
  if (!Array.isArray(s.spotOffers)) s.spotOffers = [];
  if (!Array.isArray(s.buybacks)) s.buybacks = [];
  if (!s.stock || typeof s.stock !== 'object') s.stock = {};
  if (typeof s.lastRestockDay !== 'number') s.lastRestockDay = 0;
  SUPPLIERS.forEach(sup => {
    if (!s.rel[sup.id] || typeof s.rel[sup.id] !== 'object') {
      s.rel[sup.id] = { trust: 0, totalBought: 0, deals: 0, lastDealDay: 0, burned: 0 };
    }
    const r = s.rel[sup.id];
    if (typeof r.trust !== 'number' || isNaN(r.trust)) r.trust = 0;
    r.trust = Math.max(0, Math.min(100, r.trust));
    if (typeof r.totalBought !== 'number') r.totalBought = 0;
    if (typeof r.deals !== 'number') r.deals = 0;
    if (typeof r.lastDealDay !== 'number') r.lastDealDay = 0;
    if (typeof r.burned !== 'number') r.burned = 0;
    if (!Array.isArray(s.stock[sup.id])) s.stock[sup.id] = [];
  });
  return s;
}

function supGetTier(tierId) {
  return SUPPLIER_TIERS.find(t => t.id === tierId) || SUPPLIER_TIERS[0];
}

function supGetSupplier(supplierId) {
  return SUPPLIERS.find(x => x.id === supplierId) || null;
}

function supPlayerLevel(state) {
  return (typeof getKingpinLevel === 'function') ? getKingpinLevel(state.xp || 0).level : 1;
}

/** Is this tier's phone line open yet? */
function supTierUnlocked(state, tierId) {
  const tier = supGetTier(tierId);
  return (state.day || 1) >= tier.minDay && supPlayerLevel(state) >= tier.minLevel;
}

function supSupplierAvailable(state, sup) {
  return supTierUnlocked(state, sup.tier);
}

/** Reuse the DRUGS minDay/minLevel/ngPlus filter pattern from the market. */
function supDrugUnlocked(state, drug) {
  if (!drug) return false;
  if (drug.minDay && (state.day || 1) < drug.minDay) return false;
  if (drug.minLevel && supPlayerLevel(state) < drug.minLevel) return false;
  if (drug.ngPlus) {
    if (typeof isDrugAvailableNGPlus === 'function') return isDrugAvailableNGPlus(state, drug);
    if (!(state.newGamePlus && state.newGamePlus.active)) return false;
  }
  return true;
}

/** Drugs from a supplier's catalog that pass the unlock check right now. */
function supUnlockedCatalog(state, sup) {
  if (typeof DRUGS === 'undefined') return [];
  return sup.catalog
    .map(id => DRUGS.find(d => d.id === id))
    .filter(d => supDrugUnlocked(state, d));
}

/** Reference "street" price: current location price if listed, else midpoint. */
function supStreetPrice(state, drugId) {
  const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === drugId) : null;
  if (!drug) return 0;
  const p = state.prices && state.prices[drugId];
  if (typeof p === 'number' && p > 0) return p;
  return Math.round((drug.minPrice + drug.maxPrice) / 2);
}

function supDrugMid(drug) {
  return Math.round((drug.minPrice + drug.maxPrice) / 2);
}

/** Trust tier: label + perks. Spec: 25+ -3%, 50+ lots +50%, 60+ credit, 80+ -8% + priority. */
function supTrustPerks(trust) {
  if (trust >= 80) return { label: 'FAMILIA', priceMult: 0.92, lotMult: 1.5, credit: true, priority: true, color: '#ff3366' };
  if (trust >= 60) return { label: 'PARTNER', priceMult: 0.97, lotMult: 1.5, credit: true, priority: false, color: '#ffe600' };
  if (trust >= 50) return { label: 'TRUSTED', priceMult: 0.97, lotMult: 1.5, credit: false, priority: false, color: '#39ff14' };
  if (trust >= 25) return { label: 'REGULAR', priceMult: 0.97, lotMult: 1.0, credit: false, priority: false, color: '#88ccff' };
  return { label: 'STRANGER', priceMult: 1.0, lotMult: 1.0, credit: false, priority: false, color: '#8888aa' };
}

/** Effective per-unit price for a stock entry (trust discount + haggle result). */
function supEffectivePrice(state, sup, entry) {
  const rel = state.suppliers.rel[sup.id];
  const perks = supTrustPerks(rel ? rel.trust : 0);
  let price = entry.basePrice * perks.priceMult;
  if (entry.hagglePct) price = price * (1 + entry.hagglePct / 100);
  return Math.max(1, Math.round(price));
}

/** Persuasion-style skill for haggling: skill-tree persuasion rank, else speech/20. */
function supPersuasion(state) {
  const rank = (state.skills && typeof state.skills.persuasion === 'number') ? state.skills.persuasion : 0;
  if (rank > 0) return rank;
  if (typeof getEffectiveSpeech === 'function') return Math.floor(getEffectiveSpeech(state) / 20);
  return 0;
}

function supHaggleChance(state, trust) {
  return Math.min(85, Math.round(35 + supPersuasion(state) * 5 + trust / 4));
}

function supAddTrust(state, supplierId, amount) {
  const rel = state.suppliers.rel[supplierId];
  if (!rel) return;
  rel.trust = Math.max(0, Math.min(100, Math.round(rel.trust + amount)));
}

function supIsBurned(state, supplierId) {
  const rel = state.suppliers.rel[supplierId];
  return !!(rel && rel.burned && (state.day || 1) < rel.burned);
}

function supRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function supMoney(n) {
  return '$' + Math.round(n || 0).toLocaleString();
}

function supFreeSpace(state) {
  if (typeof getMaxInventory === 'function' && typeof getInventoryCount === 'function') {
    return getMaxInventory(state) - getInventoryCount(state);
  }
  return Infinity;
}

/** Add product to inventory, mirroring buyDrug's mutation. */
function supAddInventory(state, drugId, qty) {
  if (!state.inventory) state.inventory = {};
  state.inventory[drugId] = (state.inventory[drugId] || 0) + qty;
  state.drugsBought = (state.drugsBought || 0) + qty;
}

// ============================================================
// STOCK GENERATION (rotating, weekly)
// ============================================================

/** Roll one stock entry for a drug. Base price 0.88-0.95x midpoint (exclusive deals cheaper). */
function supRollStockEntry(sup, drug, lotMult, exclusive) {
  const lot = Math.max(1, Math.round(supRandInt(sup.lotMin, sup.lotMax) * (lotMult || 1)));
  const mult = exclusive
    ? 0.82 + Math.random() * 0.06   // 0.82-0.88x — weekly exclusive
    : 0.88 + Math.random() * 0.07;  // 0.88-0.95x — standard bulk rate
  return {
    drugId: drug.id,
    lot: lot,
    lotFull: lot,
    basePrice: Math.max(1, Math.round(supDrugMid(drug) * mult)),
    hagglePct: 0,
    haggled: false,
    exclusive: !!exclusive,
  };
}

/** Restock one supplier: 2-3 unlocked catalog drugs (priority trust = always 3 + exclusives). */
function supRestockSupplier(state, sup) {
  const s = state.suppliers;
  const rel = s.rel[sup.id];
  const perks = supTrustPerks(rel.trust);
  const pool = supUnlockedCatalog(state, sup);
  if (!pool.length) { s.stock[sup.id] = []; return; }
  const want = Math.min(pool.length, perks.priority ? 3 : supRandInt(2, 3));
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, want);
  const tierIsExclusive = sup.tier === 'connect' || sup.tier === 'cartel';
  s.stock[sup.id] = picked.map((drug, i) =>
    supRollStockEntry(sup, drug, perks.lotMult, tierIsExclusive && i === 0));
}

function supRestockAll(state) {
  SUPPLIERS.forEach(sup => {
    if (supSupplierAvailable(state, sup)) supRestockSupplier(state, sup);
    else state.suppliers.stock[sup.id] = [];
  });
  state.suppliers.lastRestockDay = state.day || 1;
}

function supDaysToRestock(state) {
  const s = state.suppliers;
  return Math.max(0, SUPPLIER_RESTOCK_DAYS - ((state.day || 1) - (s.lastRestockDay || 0)));
}

// ============================================================
// DAILY PROCESSING — processSuppliersDaily(state) -> string[]
// ============================================================

function processSuppliersDaily(state) {
  const msgs = [];
  if (!state) return msgs;
  const s = ensureSupplierState(state);
  const day = state.day || 1;

  // ---- 1. Weekly restock (silent). Also stock newly-unlocked suppliers. ----
  if (s.lastRestockDay === 0 || day - s.lastRestockDay >= SUPPLIER_RESTOCK_DAYS) {
    supRestockAll(state);
  } else {
    SUPPLIERS.forEach(sup => {
      if (supSupplierAvailable(state, sup) && (!s.stock[sup.id] || !s.stock[sup.id].length)) {
        supRestockSupplier(state, sup); // newly unlocked tier joins mid-cycle, silently
      }
    });
  }

  // ---- 2. Trust decay: -1 per full 30 days of no business ----
  SUPPLIERS.forEach(sup => {
    const rel = s.rel[sup.id];
    if (!rel || rel.trust <= 0) return;
    const idle = day - (rel.lastDealDay || 0);
    if (idle >= 30 && idle % 30 === 0) {
      rel.trust = Math.max(0, rel.trust - 1);
      if (rel.trust > 0 && idle === 30 && rel.deals > 0) {
        msgs.push(`📞 ${sup.emoji} ${sup.name}: "You stopped calling. I notice these things." (Trust slipping)`);
      }
    }
  });

  // ---- 3. Burn expiry ----
  SUPPLIERS.forEach(sup => {
    const rel = s.rel[sup.id];
    if (rel && rel.burned && day >= rel.burned) {
      rel.burned = 0;
      msgs.push(`📞 ${sup.emoji} ${sup.name} is willing to talk business again. Don't screw it up twice.`);
    }
  });

  // ---- 4. Credit: 3-day warnings, then defaults ----
  for (let i = s.credit.length - 1; i >= 0; i--) {
    const c = s.credit[i];
    const sup = supGetSupplier(c.supplierId);
    const supName = sup ? `${sup.emoji} ${sup.name}` : 'Your supplier';
    if (day >= c.dueDay) {
      // DEFAULT — trust crash, burned, debt, heat, threat
      const rel = s.rel[c.supplierId];
      if (rel) {
        rel.trust = Math.max(0, rel.trust - 40);
        rel.burned = day + SUPPLIER_BURN_DAYS;
      }
      state.debt = Math.round((state.debt || 0) + c.owed);
      if (typeof addHeat === 'function') addHeat(state, 10);
      else state.heat = Math.min(100, Math.max(0, (state.heat || 0) + 10));
      const line = SUPPLIER_DEFAULT_LINES[supRandInt(0, SUPPLIER_DEFAULT_LINES.length - 1)];
      msgs.push(`💀 YOU DEFAULTED on ${supMoney(c.owed)} owed to ${supName}. They ${line} Debt sold to the loan shark, word is out (+10 heat), and they won't deal with you for ${SUPPLIER_BURN_DAYS} days.`);
      s.credit.splice(i, 1);
    } else if (!c.warned && c.dueDay - day <= 3) {
      c.warned = true;
      msgs.push(`⏰ ${supName}: "${supMoney(c.owed)} due in ${c.dueDay - day} day${c.dueDay - day === 1 ? '' : 's'}. Don't make me come find you."`);
    }
  }

  // ---- 5. Spot offers: expire, then maybe generate (8%/day, max 2) ----
  for (let i = s.spotOffers.length - 1; i >= 0; i--) {
    if (day > s.spotOffers[i].expiresDay) s.spotOffers.splice(i, 1); // silent expiry
  }
  if (s.spotOffers.length < 2 && Math.random() < 0.08) {
    const candidates = SUPPLIERS.filter(sup =>
      supSupplierAvailable(state, sup) && !supIsBurned(state, sup.id) && supUnlockedCatalog(state, sup).length);
    if (candidates.length) {
      const sup = candidates[supRandInt(0, candidates.length - 1)];
      const pool = supUnlockedCatalog(state, sup);
      const drug = pool[supRandInt(0, pool.length - 1)];
      const qty = supRandInt(sup.lotMin, sup.lotMax);
      const mult = 0.55 + Math.random() * 0.15; // 30-45% below market
      const price = Math.max(1, Math.round(supDrugMid(drug) * mult));
      const expiresDay = day + supRandInt(2, 3);
      s.spotOffers.push({ supplierId: sup.id, drugId: drug.id, qty, price, expiresDay });
      msgs.push(`🔥 SPOT DEAL — ${sup.emoji} ${sup.name} needs to unload ${qty} units of ${drug.emoji} ${drug.name} TONIGHT. ${supMoney(price)}/unit (${Math.round((1 - mult) * 100)}% off) — gone in ${expiresDay - day} days.`);
    }
  }

  // ---- 6. Buybacks: expire, then maybe generate (5%/day, trust 50+ suppliers) ----
  for (let i = s.buybacks.length - 1; i >= 0; i--) {
    if (day > s.buybacks[i].expiresDay) s.buybacks.splice(i, 1);
  }
  if (Math.random() < 0.05) {
    const candidates = SUPPLIERS.filter(sup =>
      supSupplierAvailable(state, sup) && !supIsBurned(state, sup.id) &&
      s.rel[sup.id].trust >= 50 && supUnlockedCatalog(state, sup).length &&
      !s.buybacks.some(b => b.supplierId === sup.id));
    if (candidates.length) {
      const sup = candidates[supRandInt(0, candidates.length - 1)];
      const pool = supUnlockedCatalog(state, sup);
      const drug = pool[supRandInt(0, pool.length - 1)];
      const mult = 1.1 + Math.random() * 0.15; // 1.10-1.25x market
      const price = Math.max(1, Math.round(supDrugMid(drug) * mult));
      const qty = supRandInt(sup.lotMin, sup.lotMax);
      s.buybacks.push({ supplierId: sup.id, drugId: drug.id, qty, price, expiresDay: day + 3 });
      msgs.push(`📈 ${sup.emoji} ${sup.name} came up SHORT on ${drug.emoji} ${drug.name} — buying up to ${qty} units at ${supMoney(price)}/unit (over market) for the next 3 days.`);
    }
  }

  return msgs;
}

// ============================================================
// HANDLERS
// ============================================================

function supNotifyFail(msg) {
  if (typeof showNotification === 'function') showNotification(msg, 'error');
  if (typeof playSound === 'function') playSound('error');
}

function supFinish(state, msg, type, sound) {
  if (Array.isArray(state.messageLog)) state.messageLog.push(msg);
  if (typeof showNotification === 'function') showNotification(msg, type || 'success');
  if (typeof playSound === 'function') playSound(sound || 'cash');
  if (typeof render === 'function') render();
}

/** Shared purchase guards: returns {sup, entry, rel} or null (after notifying). */
function supGetDeal(state, supplierId, stockIdx) {
  const s = ensureSupplierState(state);
  const sup = supGetSupplier(supplierId);
  if (!sup || !supSupplierAvailable(state, sup)) { supNotifyFail('That connect isn\'t taking your calls.'); return null; }
  if (supIsBurned(state, supplierId)) { supNotifyFail(`${sup.name} refuses to do business with you right now.`); return null; }
  const entry = (s.stock[supplierId] || [])[stockIdx];
  if (!entry || entry.lot <= 0) { supNotifyFail('That product is gone. Wait for the restock.'); return null; }
  return { sup, entry, rel: s.rel[supplierId] };
}

function doSupplierBuy(supplierId, stockIdx, portion) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const deal = supGetDeal(state, supplierId, stockIdx);
  if (!deal) return;
  const { sup, entry, rel } = deal;
  const drug = DRUGS.find(d => d.id === entry.drugId);
  if (!drug || !supDrugUnlocked(state, drug)) { supNotifyFail('Nobody sells you that yet.'); return; }

  const p = Math.max(0.25, Math.min(1, portion || 1));
  const minLot = Math.max(1, Math.floor(entry.lotFull * 0.25));
  let qty = Math.min(entry.lot, Math.max(minLot, Math.floor(entry.lotFull * p)));
  const free = supFreeSpace(state);
  if (free < minLot) {
    supNotifyFail(`Not enough space — bulk deals need room for at least ${minLot} units (you have ${free}).`);
    return;
  }
  qty = Math.min(qty, free);
  const price = supEffectivePrice(state, sup, entry);
  const cost = price * qty;
  if ((state.cash || 0) < cost) {
    supNotifyFail(`Not enough cash. ${qty} units costs ${supMoney(cost)}.`);
    return;
  }

  state.cash -= cost;
  supAddInventory(state, entry.drugId, qty);
  entry.lot -= qty;
  if (entry.lot <= 0) {
    const list = state.suppliers.stock[supplierId];
    const i = list.indexOf(entry);
    if (i >= 0) list.splice(i, 1);
  }

  // Trust by deal size: 25% lot -> +1, 50% -> +2, full -> +3
  const gain = p >= 1 ? 3 : p >= 0.5 ? 2 : 1;
  supAddTrust(state, supplierId, gain);
  rel.totalBought += qty;
  rel.deals += 1;
  rel.lastDealDay = state.day || 1;
  if (typeof awardXP === 'function') awardXP(state, 'buy_drug');

  const street = supStreetPrice(state, entry.drugId);
  const saved = Math.max(0, (street - price) * qty);
  supFinish(state, `🤝 Bought ${qty} ${drug.emoji} ${drug.name} from ${sup.name} for ${supMoney(cost)} (${supMoney(price)}/unit — saved ~${supMoney(saved)} vs street). Trust +${gain}.`, 'success', 'cash');
}

function doSupplierHaggle(supplierId, stockIdx) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const deal = supGetDeal(state, supplierId, stockIdx);
  if (!deal) return;
  const { sup, entry, rel } = deal;
  if (entry.haggled) { supNotifyFail('You already talked numbers on this lot. Wait for the restock.'); return; }

  entry.haggled = true;
  const chance = supHaggleChance(state, rel.trust);
  if (Math.random() * 100 < chance) {
    const extra = supRandInt(5, 15);
    entry.hagglePct = -extra;
    supAddTrust(state, supplierId, 1);
    supFinish(state, `🗣️ ${sup.emoji} ${sup.name} respects the hustle — extra ${extra}% off this lot. Trust +1.`, 'success', 'cash');
  } else {
    entry.hagglePct = 5;
    supAddTrust(state, supplierId, -2);
    const line = SUPPLIER_HAGGLE_FAIL_LINES[supRandInt(0, SUPPLIER_HAGGLE_FAIL_LINES.length - 1)];
    supFinish(state, `🗣️ Haggle backfired. ${sup.emoji} ${sup.name}: ${line} (+5% this cycle, Trust -2)`, 'error', 'error');
  }
}

function doSupplierCredit(supplierId, stockIdx) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const deal = supGetDeal(state, supplierId, stockIdx);
  if (!deal) return;
  const { sup, entry, rel } = deal;
  const perks = supTrustPerks(rel.trust);
  if (!perks.credit) { supNotifyFail(`${sup.name} doesn't front product to strangers. (Need trust 60+)`); return; }
  if (state.suppliers.credit.some(c => c.supplierId === supplierId)) {
    supNotifyFail(`${sup.name} already has paper out on you. Pay that first.`);
    return;
  }
  const drug = DRUGS.find(d => d.id === entry.drugId);
  if (!drug || !supDrugUnlocked(state, drug)) { supNotifyFail('Nobody sells you that yet.'); return; }
  const qty = entry.lot;
  if (supFreeSpace(state) < qty) {
    supNotifyFail(`Fronted product comes as the FULL lot (${qty} units) — you only have space for ${supFreeSpace(state)}.`);
    return;
  }

  const price = supEffectivePrice(state, sup, entry);
  const owed = Math.round(price * qty * SUPPLIER_CREDIT_MARKUP);
  const dueDay = (state.day || 1) + SUPPLIER_CREDIT_DAYS;
  supAddInventory(state, entry.drugId, qty);
  const list = state.suppliers.stock[supplierId];
  const i = list.indexOf(entry);
  if (i >= 0) list.splice(i, 1);
  state.suppliers.credit.push({ supplierId, drugId: entry.drugId, qty, owed, dueDay, warned: false });
  rel.deals += 1;
  rel.totalBought += qty;
  rel.lastDealDay = state.day || 1;
  if (typeof awardXP === 'function') awardXP(state, 'buy_drug');
  supFinish(state, `📝 ${sup.emoji} ${sup.name} fronted you ${qty} ${drug.emoji} ${drug.name}. You owe ${supMoney(owed)} by day ${dueDay}. Don't be late.`, 'success', 'cash');
}

function doPayCredit(idx) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const s = ensureSupplierState(state);
  const c = s.credit[idx];
  if (!c) return;
  if ((state.cash || 0) < c.owed) { supNotifyFail(`Need ${supMoney(c.owed)} to square this debt.`); return; }
  state.cash -= c.owed;
  s.credit.splice(idx, 1);
  supAddTrust(state, c.supplierId, 2);
  const sup = supGetSupplier(c.supplierId);
  supFinish(state, `💵 Paid ${supMoney(c.owed)} to ${sup ? sup.emoji + ' ' + sup.name : 'your supplier'}. "Pleasure doing business." Trust +2.`, 'success', 'cash');
}

function doAcceptSpotOffer(idx) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const s = ensureSupplierState(state);
  const offer = s.spotOffers[idx];
  if (!offer) return;
  if ((state.day || 1) > offer.expiresDay) { s.spotOffers.splice(idx, 1); supNotifyFail('Too late — that product already moved.'); if (typeof render === 'function') render(); return; }
  const sup = supGetSupplier(offer.supplierId);
  const drug = DRUGS.find(d => d.id === offer.drugId);
  if (!sup || !drug) { s.spotOffers.splice(idx, 1); return; }
  if (supIsBurned(state, sup.id)) { supNotifyFail(`${sup.name} refuses to do business with you right now.`); return; }
  const cost = offer.price * offer.qty;
  if ((state.cash || 0) < cost) { supNotifyFail(`It's all or nothing — ${offer.qty} units for ${supMoney(cost)}.`); return; }
  if (supFreeSpace(state) < offer.qty) { supNotifyFail(`No room — the whole lot is ${offer.qty} units, you have space for ${supFreeSpace(state)}.`); return; }

  state.cash -= cost;
  supAddInventory(state, offer.drugId, offer.qty);
  const rel = s.rel[sup.id];
  supAddTrust(state, sup.id, 2);
  rel.totalBought += offer.qty;
  rel.deals += 1;
  rel.lastDealDay = state.day || 1;
  s.spotOffers.splice(idx, 1);
  if (typeof awardXP === 'function') awardXP(state, 'buy_drug');
  supFinish(state, `🔥 Took the spot deal: ${offer.qty} ${drug.emoji} ${drug.name} from ${sup.name} for ${supMoney(cost)}. Trust +2.`, 'success', 'cash');
}

function doSellBuyback(idx, qty) {
  if (typeof gameState === 'undefined' || !gameState) return;
  const state = gameState;
  const s = ensureSupplierState(state);
  const b = s.buybacks[idx];
  if (!b) return;
  if ((state.day || 1) > b.expiresDay) { s.buybacks.splice(idx, 1); supNotifyFail('That buyback window closed.'); if (typeof render === 'function') render(); return; }
  const sup = supGetSupplier(b.supplierId);
  const drug = DRUGS.find(d => d.id === b.drugId);
  if (!sup || !drug) { s.buybacks.splice(idx, 1); return; }
  const have = (state.inventory && state.inventory[b.drugId]) || 0;
  if (have <= 0) { supNotifyFail(`You don't have any ${drug.name} to sell.`); return; }

  let sell = Math.min(have, b.qty);
  if (typeof qty === 'number' && qty > 0) sell = Math.min(sell, Math.floor(qty));
  if (sell <= 0) { supNotifyFail('Nothing to sell.'); return; }

  const revenue = b.price * sell;
  state.inventory[b.drugId] -= sell;
  if (state.inventory[b.drugId] <= 0) delete state.inventory[b.drugId];
  state.cash = (state.cash || 0) + revenue;
  if (typeof state.dirtyMoney === 'number') state.dirtyMoney += revenue; // drug money is dirty
  b.qty -= sell;
  if (b.qty <= 0) s.buybacks.splice(idx, 1);
  const rel = s.rel[sup.id];
  supAddTrust(state, sup.id, 1);
  rel.deals += 1;
  rel.lastDealDay = state.day || 1;
  supFinish(state, `📈 Sold ${sell} ${drug.emoji} ${drug.name} back to ${sup.name} at ${supMoney(b.price)}/unit — ${supMoney(revenue)} cash. Trust +1.`, 'success', 'cash');
}

// ============================================================
// RENDER
// ============================================================

function renderSuppliers() {
  if (typeof gameState === 'undefined' || !gameState) {
    if (typeof currentScreen !== 'undefined') currentScreen = 'title';
    return (typeof renderTitle === 'function') ? renderTitle() : '';
  }
  const state = gameState;
  const s = ensureSupplierState(state);
  const day = state.day || 1;
  const level = supPlayerLevel(state);

  // First-ever visit before the daily proc ran: stock the shelves silently.
  if (s.lastRestockDay === 0) supRestockAll(state);

  // ---------- Header: tier unlock progress ----------
  const tierProgress = SUPPLIER_TIERS.map(t => {
    if (supTierUnlocked(state, t.id)) {
      return `<span style="color:${t.color}">${t.emoji} ${t.name} ✓</span>`;
    }
    const needs = [];
    if (day < t.minDay) needs.push(`day ${t.minDay}`);
    if (level < t.minLevel) needs.push(`level ${t.minLevel}`);
    return `<span class="text-dim">🔒 ${t.name.split(' ')[0].charAt(0) + t.name.split(' ')[0].slice(1).toLowerCase()} connects unlock ${needs.join(' + ')}</span>`;
  }).join(' <span class="text-dim">|</span> ');

  // ---------- Spot offers + buybacks (highlighted) ----------
  let hotHtml = '';
  const hotRows = [];
  s.spotOffers.forEach((o, i) => {
    const sup = supGetSupplier(o.supplierId);
    const drug = DRUGS.find(d => d.id === o.drugId);
    if (!sup || !drug) return;
    const cost = o.price * o.qty;
    const street = supStreetPrice(state, o.drugId);
    const off = street > 0 ? Math.round((1 - o.price / street) * 100) : 0;
    const daysLeft = o.expiresDay - day;
    const canAfford = (state.cash || 0) >= cost;
    const hasSpace = supFreeSpace(state) >= o.qty;
    const btn = (canAfford && hasSpace)
      ? `<button class="btn btn-sm btn-buy" onclick="doAcceptSpotOffer(${i})">🔥 TAKE IT (${supMoney(cost)})</button>`
      : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">${!canAfford ? 'Need ' + supMoney(cost) : 'Need ' + o.qty + ' space'}</button>`;
    hotRows.push(`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;padding:0.35rem 0;border-bottom:1px dashed #333">
        <span style="font-size:0.8rem">🔥 <b>${sup.name}</b> unloading <span class="neon-cyan">${o.qty}× ${drug.emoji} ${drug.name}</span> @ ${supMoney(o.price)}/u <span class="neon-green">(${off}% off street)</span> <span class="neon-yellow">⏳ ${daysLeft}d</span></span>
        ${btn}
      </div>`);
  });
  s.buybacks.forEach((b, i) => {
    const sup = supGetSupplier(b.supplierId);
    const drug = DRUGS.find(d => d.id === b.drugId);
    if (!sup || !drug) return;
    const have = (state.inventory && state.inventory[b.drugId]) || 0;
    const daysLeft = b.expiresDay - day;
    const street = supStreetPrice(state, b.drugId);
    const over = street > 0 ? Math.round((b.price / street - 1) * 100) : 0;
    const btn = have > 0
      ? `<button class="btn btn-sm btn-sell" onclick="doSellBuyback(${i})">📈 SELL ${Math.min(have, b.qty)} (${supMoney(b.price * Math.min(have, b.qty))})</button>`
      : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">None in stash</button>`;
    hotRows.push(`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;padding:0.35rem 0;border-bottom:1px dashed #333">
        <span style="font-size:0.8rem">📈 <b>${sup.name}</b> is SHORT — buying up to <span class="neon-cyan">${b.qty}× ${drug.emoji} ${drug.name}</span> @ ${supMoney(b.price)}/u <span class="neon-green">(+${over}% over street)</span> <span class="neon-yellow">⏳ ${daysLeft}d</span></span>
        ${btn}
      </div>`);
  });
  if (hotRows.length) {
    hotHtml = `
      <div class="card" style="border-color:var(--neon-yellow);background:rgba(255,230,0,0.05);margin-bottom:0.8rem">
        <div class="card-header"><span class="neon-yellow">⚡ WIRE'S HOT — LIMITED-TIME ACTION</span></div>
        ${hotRows.join('')}
      </div>`;
  }

  // ---------- Credit obligations panel ----------
  let creditHtml = '';
  if (s.credit.length) {
    const rows = s.credit.map((c, i) => {
      const sup = supGetSupplier(c.supplierId);
      const drug = DRUGS.find(d => d.id === c.drugId);
      const daysLeft = c.dueDay - day;
      const urgency = daysLeft <= 3 ? 'neon-red' : daysLeft <= 7 ? 'neon-yellow' : 'text-dim';
      const canPay = (state.cash || 0) >= c.owed;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;padding:0.35rem 0;border-bottom:1px dashed #333">
          <span style="font-size:0.8rem">${sup ? sup.emoji + ' ' + sup.name : c.supplierId} fronted ${c.qty}× ${drug ? drug.emoji + ' ' + drug.name : c.drugId} — owe <b>${supMoney(c.owed)}</b> <span class="${urgency}">due day ${c.dueDay} (${daysLeft}d)</span></span>
          ${canPay
            ? `<button class="btn btn-sm btn-buy" onclick="doPayCredit(${i})">💵 PAY ${supMoney(c.owed)}</button>`
            : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5" title="Not enough cash">Need ${supMoney(c.owed)}</button>`}
        </div>`;
    }).join('');
    creditHtml = `
      <div class="card" style="border-color:var(--neon-red);background:rgba(255,51,102,0.05);margin-bottom:0.8rem">
        <div class="card-header"><span class="neon-red">📝 PAPER OUT — CREDIT OBLIGATIONS</span><span class="text-dim" style="font-size:0.7rem">default: trust −40, debt + heat</span></div>
        ${rows}
      </div>`;
  }

  // ---------- Supplier cards grouped by tier ----------
  const tierSections = SUPPLIER_TIERS.map(tier => {
    const unlocked = supTierUnlocked(state, tier.id);
    const sups = SUPPLIERS.filter(x => x.tier === tier.id);
    const needs = [];
    if (day < tier.minDay) needs.push(`day ${tier.minDay}`);
    if (level < tier.minLevel) needs.push(`level ${tier.minLevel}`);
    const header = `
      <div class="card" style="border-color:${tier.color};margin:0.8rem 0 0.4rem;${unlocked ? '' : 'opacity:0.5'}">
        <div class="card-header" style="margin:0">
          <span style="color:${tier.color}">${tier.emoji} ${tier.name}</span>
          <span class="text-dim" style="font-size:0.72rem">${unlocked ? tier.blurb : '🔒 Unlocks ' + needs.join(' + ')}</span>
        </div>
      </div>`;
    if (!unlocked) {
      return header + `
        <div style="opacity:0.4;display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.4rem">
          ${sups.map(x => `<span class="text-dim" style="font-size:0.75rem;border:1px dashed #444;border-radius:4px;padding:0.2rem 0.5rem">${x.emoji} ???</span>`).join('')}
        </div>`;
    }
    return header + sups.map(sup => supRenderSupplierCard(state, sup)).join('');
  }).join('');

  return `
    <div class="screen-container">
      ${typeof renderToolbar === 'function' ? renderToolbar() : ''}
      ${typeof backButton === 'function' ? backButton() : ''}
      <h2 class="section-title" style="text-align:center">🤝 SUPPLIERS</h2>
      <p class="text-dim" style="text-align:center;font-size:0.78rem;margin-bottom:0.4rem">
        Bulk product below street price. Keep buying to build trust — trust buys discounts, bigger lots and credit.
        Restock in <span class="neon-cyan">${supDaysToRestock(state)}d</span>.
      </p>
      <p style="text-align:center;font-size:0.72rem;margin-bottom:0.8rem">${tierProgress}</p>
      ${hotHtml}
      ${creditHtml}
      ${tierSections}
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function supRenderSupplierCard(state, sup) {
  const s = state.suppliers;
  const rel = s.rel[sup.id];
  const perks = supTrustPerks(rel.trust);
  const burned = supIsBurned(state, sup.id);
  const stock = s.stock[sup.id] || [];
  const tier = supGetTier(sup.tier);
  const hasCreditOut = s.credit.some(c => c.supplierId === sup.id);

  const perkBits = [];
  if (rel.trust >= 80) perkBits.push('-8% price');
  else if (rel.trust >= 25) perkBits.push('-3% price');
  if (rel.trust >= 50) perkBits.push('+50% lots');
  if (perks.credit) perkBits.push('credit line');
  if (perks.priority) perkBits.push('priority stock');

  let body;
  if (burned) {
    body = `<p class="neon-red" style="font-size:0.8rem;margin:0.3rem 0">🚫 REFUSES BUSINESS — you burned them. Back in ${rel.burned - (state.day || 1)} days.</p>`;
  } else if (!stock.length) {
    body = `<p class="text-dim" style="font-size:0.8rem;margin:0.3rem 0">Dry right now. Restock in ${supDaysToRestock(state)}d.</p>`;
  } else {
    body = stock.map((entry, idx) => supRenderStockRow(state, sup, entry, idx, perks, hasCreditOut)).join('');
  }

  return `
    <div class="prop-card" style="border-color:${burned ? 'var(--neon-red)' : tier.color};margin-bottom:0.5rem;padding:0.6rem;${burned ? 'opacity:0.7' : ''}">
      <div class="card-header" style="margin-bottom:0.15rem">
        <span style="font-weight:bold">${sup.emoji} ${sup.name}</span>
        <span style="font-size:0.72rem;color:${perks.color}">${perks.label} ${perkBits.length ? '<span class="text-dim">(' + perkBits.join(', ') + ')</span>' : ''}</span>
      </div>
      <p class="text-dim" style="font-size:0.74rem;margin:0.15rem 0">${sup.personality}</p>
      <div style="display:flex;align-items:center;gap:0.5rem;margin:0.25rem 0">
        <div class="stat-bar" style="flex:1;height:7px"><div class="stat-fill" style="width:${rel.trust}%;background:${perks.color}"></div></div>
        <span style="font-size:0.72rem;color:${perks.color}">Trust ${rel.trust}/100</span>
        <span class="text-dim" style="font-size:0.68rem">${rel.deals} deals · ${rel.totalBought.toLocaleString()} units</span>
      </div>
      ${body}
    </div>
  `;
}

function supRenderStockRow(state, sup, entry, idx, perks, hasCreditOut) {
  const drug = DRUGS.find(d => d.id === entry.drugId);
  if (!drug) return '';
  const price = supEffectivePrice(state, sup, entry);
  const street = supStreetPrice(state, entry.drugId);
  const pctOff = street > 0 ? Math.round((1 - price / street) * 100) : 0;
  const pctHtml = pctOff >= 0
    ? `<span class="neon-green">${pctOff}% below street</span>`
    : `<span class="neon-red">${-pctOff}% OVER street</span>`;
  const minLot = Math.max(1, Math.floor(entry.lotFull * 0.25));
  const free = supFreeSpace(state);
  const cash = state.cash || 0;

  const buyBtns = [0.25, 0.5, 1].map(p => {
    let qty = Math.min(entry.lot, Math.max(minLot, Math.floor(entry.lotFull * p)));
    const label = p === 1 ? 'ALL' : Math.round(p * 100) + '%';
    if (free < minLot) return `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.45" title="Need ${minLot} free space">${label}</button>`;
    qty = Math.min(qty, free);
    const cost = price * qty;
    if (cash < cost) return `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.45" title="Need ${supMoney(cost)}">${label} ${supMoney(cost)}</button>`;
    return `<button class="btn btn-sm btn-buy" onclick="doSupplierBuy('${sup.id}', ${idx}, ${p})">BUY ${label} — ${qty}u ${supMoney(cost)}</button>`;
  }).join('');

  const haggleBtn = entry.haggled
    ? `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.45">🗣️ Haggled</button>`
    : `<button class="btn btn-sm btn-secondary" style="border-color:#cc88ff;color:#cc88ff" onclick="doSupplierHaggle('${sup.id}', ${idx})">🗣️ HAGGLE (${supHaggleChance(state, state.suppliers.rel[sup.id].trust)}%)</button>`;

  let creditBtn = '';
  if (perks.credit) {
    const owed = Math.round(price * entry.lot * SUPPLIER_CREDIT_MARKUP);
    creditBtn = (hasCreditOut || free < entry.lot)
      ? `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.45" title="${hasCreditOut ? 'Existing debt with them' : 'Need ' + entry.lot + ' free space'}">📝 CREDIT</button>`
      : `<button class="btn btn-sm btn-sell" onclick="doSupplierCredit('${sup.id}', ${idx})">📝 ON CREDIT — owe ${supMoney(owed)} in ${SUPPLIER_CREDIT_DAYS}d</button>`;
  }

  const haggleTag = entry.hagglePct < 0 ? ` <span class="neon-green">(haggled ${-entry.hagglePct}% off)</span>`
    : entry.hagglePct > 0 ? ` <span class="neon-red">(+${entry.hagglePct}% — you annoyed them)</span>` : '';

  return `
    <div style="border-top:1px dashed #333;padding:0.35rem 0;${entry.exclusive ? 'background:rgba(255,230,0,0.04)' : ''}">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.3rem;font-size:0.78rem">
        <span>${entry.exclusive ? '<span class="neon-yellow">⭐ WEEKLY EXCLUSIVE</span> ' : ''}${drug.emoji} <b>${drug.name}</b> — lot of <span class="neon-cyan">${entry.lot}</span>${entry.lot !== entry.lotFull ? '<span class="text-dim">/' + entry.lotFull + '</span>' : ''} <span class="text-dim">(min ${minLot})</span></span>
        <span>${supMoney(price)}/u ${pctHtml}${haggleTag} <span class="text-dim">street ~${supMoney(street)}</span></span>
      </div>
      <div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-top:0.3rem">
        ${haggleBtn}${buyBtns}${creditBtn}
      </div>
    </div>`;
}
