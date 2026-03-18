// ============================================================
// DRUG WARS: MIAMI VICE EDITION - World Travel System
// Extended travel mechanics for international movement
// ============================================================

// International transport modes (supplements existing TRANSPORT in game-engine.js)
const WORLD_TRANSPORT = [
  {
    id: 'cargo_ship', name: 'Cargo Ship', emoji: '🚢',
    cost: 5000, timeDays: 5, riskMod: 0.8, inventoryLimit: 10000,
    minRegionTier: 1, desc: 'Slow but cheap. High capacity for bulk shipments.',
    crossRegionOnly: true,
  },
  {
    id: 'commercial_flight', name: 'Commercial Flight', emoji: '✈️',
    cost: 15000, timeDays: 1, riskMod: 1.2, inventoryLimit: 200,
    minRegionTier: 1, desc: 'Fast travel but strict customs. Low carry capacity.',
    crossRegionOnly: true,
  },
  {
    id: 'private_jet', name: 'Private Jet', emoji: '🛩️',
    cost: 50000, timeDays: 1, riskMod: 0.5, inventoryLimit: 2000,
    minRegionTier: 3, desc: 'Fast and discreet. Avoid commercial customs entirely.',
    crossRegionOnly: true,
  },
  {
    id: 'narco_submarine', name: 'Narco Submarine', emoji: '🤿',
    cost: 25000, timeDays: 4, riskMod: 0.3, inventoryLimit: 15000,
    minRegionTier: 4, ngPlusOnly: true,
    desc: 'Semi-submersible. Nearly undetectable. Massive capacity.',
    crossRegionOnly: true,
  },
  {
    id: 'fishing_boat', name: 'Fishing Boat', emoji: '🎣',
    cost: 3000, timeDays: 3, riskMod: 1.0, inventoryLimit: 3000,
    minRegionTier: 1, desc: 'Disguised as commercial fishing vessel. Caribbean/coastal routes.',
    crossRegionOnly: true, coastalOnly: true,
  },
  {
    id: 'overland_convoy', name: 'Overland Convoy', emoji: '🚛',
    cost: 8000, timeDays: 3, riskMod: 1.3, inventoryLimit: 8000,
    minRegionTier: 2, desc: 'Truck convoy across borders. Checkpoint risk but high capacity.',
    crossRegionOnly: true, adjacentOnly: true,
  },
];

// Contact fees to access a new region for the first time
const REGION_CONTACT_FEES = {
  caribbean: 10000,
  south_america: 25000,
  central_america: 20000,
  mexico: 30000,
  us_cities: 15000,
  western_europe: 50000,
  eastern_europe: 40000,
  west_africa: 35000,
  southeast_asia: 60000,
};

// Get available world transport options for cross-region travel
function getWorldTransport(state, fromRegion, toRegion) {
  if (!state || fromRegion === toRegion) return []; // Same region uses normal transport

  const distance = typeof getRegionDistance === 'function' ? getRegionDistance(fromRegion, toRegion) : 4;
  const ngPlus = state.newGamePlus && state.newGamePlus.active;
  const playerTier = getPlayerRegionTier(state);

  const available = [];
  for (const t of WORLD_TRANSPORT) {
    if (t.ngPlusOnly && !ngPlus) continue;
    if (playerTier < t.minRegionTier) continue;

    // Distance-based cost and time scaling
    const distanceMod = distance / 2.5; // Normalize around adjacent = 1x
    const cost = Math.floor(t.cost * distanceMod);
    const time = Math.max(1, Math.round(t.timeDays * distanceMod));
    const canAfford = (state.cash || 0) >= cost;
    const inventory = state.drugs ? Object.values(state.drugs).reduce((a, b) => a + b, 0) : 0;
    const canCarry = inventory <= t.inventoryLimit;

    available.push({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      cost: cost,
      timeDays: time,
      riskMod: t.riskMod,
      inventoryLimit: t.inventoryLimit,
      canAfford: canAfford,
      canCarry: canCarry,
      locked: false,
      desc: t.desc,
      isWorldTransport: true,
    });
  }

  return available;
}

// Get the player's highest unlocked region tier
function getPlayerRegionTier(state) {
  if (!state.worldState || !state.worldState.unlockedRegions) return 0;
  let maxTier = 0;
  const regions = typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS : [];
  for (const regionId of state.worldState.unlockedRegions) {
    const region = regions.find(r => r.id === regionId);
    if (region && region.unlockTier > maxTier) maxTier = region.unlockTier;
  }
  return maxTier;
}

// Check if player has paid the contact fee for a region
function hasRegionContact(state, regionId) {
  if (regionId === 'miami') return true;
  if (!state.worldState) return false;
  return state.worldState.regionContacts && state.worldState.regionContacts[regionId];
}

// Pay contact fee to establish presence in a region
function payRegionContactFee(state, regionId) {
  if (hasRegionContact(state, regionId)) return { success: true, msg: 'Already have contacts here.' };
  const fee = REGION_CONTACT_FEES[regionId] || 25000;
  if ((state.cash || 0) < fee) return { success: false, msg: `Need $${fee.toLocaleString()} to establish contacts.` };

  state.cash -= fee;
  if (!state.worldState) state.worldState = typeof initWorldState === 'function' ? initWorldState() : { unlockedRegions: ['miami'], regionContacts: {}, regionProgress: {} };
  if (!state.worldState.regionContacts) state.worldState.regionContacts = {};
  state.worldState.regionContacts[regionId] = { day: state.day, fee: fee };

  return { success: true, msg: `Contacts established in ${regionId.replace(/_/g, ' ')}! Full access granted. (-$${fee.toLocaleString()})` };
}

// Calculate world travel risk (customs, border patrols, etc.)
function calculateWorldTravelRisk(state, fromRegion, toRegion, transportId) {
  let baseRisk = 0.1; // 10% base encounter chance for international travel
  const transport = WORLD_TRANSPORT.find(t => t.id === transportId);
  if (transport) baseRisk *= transport.riskMod;

  // Heat increases risk
  const heat = state.heat || 0;
  baseRisk += heat * 0.002;

  // Inventory increases risk (more drugs = more suspicious)
  const inventory = state.drugs ? Object.values(state.drugs).reduce((a, b) => a + b, 0) : 0;
  if (inventory > 100) baseRisk += 0.05;
  if (inventory > 500) baseRisk += 0.1;
  if (inventory > 2000) baseRisk += 0.15;

  // Skills reduce risk
  if (typeof getAllSkillEffects === 'function') {
    const effects = getAllSkillEffects(state);
    if (effects.concealBonus) baseRisk -= effects.concealBonus * 0.01;
  }

  // Certain region pairs have higher risk
  const highRiskRoutes = [
    ['mexico', 'us_cities'],
    ['south_america', 'us_cities'],
    ['southeast_asia', 'western_europe'],
    ['west_africa', 'western_europe'],
  ];
  for (const [a, b] of highRiskRoutes) {
    if ((fromRegion === a && toRegion === b) || (fromRegion === b && toRegion === a)) {
      baseRisk += 0.1;
    }
  }

  return Math.min(0.6, Math.max(0, baseRisk));
}

// Process customs encounter during world travel
function processCustomsEncounter(state, fromRegion, toRegion) {
  const risk = calculateWorldTravelRisk(state, fromRegion, toRegion, 'commercial_flight');
  if (Math.random() > risk) return null; // No encounter

  const inventory = state.drugs ? Object.values(state.drugs).reduce((a, b) => a + b, 0) : 0;

  // Determine outcome
  if (inventory === 0) {
    return { type: 'search', msg: '🔍 Customs searched your luggage but found nothing. Close call!' };
  }

  // They found something
  const bribeChance = (state.reputation || 0) > 50 ? 0.4 : 0.2;
  if (Math.random() < bribeChance) {
    const bribeCost = Math.floor(2000 + Math.random() * 8000);
    if ((state.cash || 0) >= bribeCost) {
      state.cash -= bribeCost;
      return { type: 'bribe', msg: `🤫 Customs officer accepts $${bribeCost.toLocaleString()} to look the other way.` };
    }
  }

  // Drugs seized
  const seized = {};
  let totalSeized = 0;
  for (const [drug, amount] of Object.entries(state.drugs || {})) {
    if (amount > 0) {
      const seizeAmount = Math.ceil(amount * (0.3 + Math.random() * 0.5));
      seized[drug] = seizeAmount;
      state.drugs[drug] -= seizeAmount;
      totalSeized += seizeAmount;
    }
  }
  state.heat = Math.min(100, (state.heat || 0) + 15);

  return { type: 'seized', msg: `🚨 Customs seized ${totalSeized} units of product! Heat +15.`, seized: seized };
}
