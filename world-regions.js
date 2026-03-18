// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - World Region System
//   Global expansion: 10 regions across 5 tiers
//   Unlock via net worth, reputation, faction alliances, and story progress
// ============================================================

const WORLD_REGIONS = [
  {
    id: 'miami', name: 'Miami', emoji: '🌴',
    unlockTier: 0, unlockCost: 0,
    unlockRequirements: { minNetWorth: 0, minRep: 0, minDistrictsVisited: 0, requiredTier: null, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 0,
    continent: 'north_america',
    desc: 'Home turf. The neon-soaked streets where it all begins. Every empire starts somewhere.'
  },
  {
    id: 'caribbean', name: 'The Caribbean', emoji: '🏝️',
    unlockTier: 1, unlockCost: 25000,
    unlockRequirements: { minNetWorth: 50000, minRep: 0, minDistrictsVisited: 8, requiredTier: null, requiredFactionAllied: false, requiredAct: 2 },
    travelBaseTime: 1,
    continent: 'caribbean',
    desc: 'Island chains and offshore connections. The first step beyond Miami — smuggling routes, hidden ports, and tropical fronts.'
  },
  {
    id: 'south_america', name: 'South America', emoji: '🌿',
    unlockTier: 2, unlockCost: 75000,
    unlockRequirements: { minNetWorth: 200000, minRep: 30, minDistrictsVisited: 0, requiredTier: 1, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 2,
    continent: 'south_america',
    desc: 'The source. Coca fields, jungle labs, and cartel territory. High risk, highest reward — if you survive the politics.'
  },
  {
    id: 'central_america', name: 'Central America', emoji: '🌋',
    unlockTier: 2, unlockCost: 75000,
    unlockRequirements: { minNetWorth: 200000, minRep: 30, minDistrictsVisited: 0, requiredTier: 1, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 2,
    continent: 'central_america',
    desc: 'Transit corridor between the source and the market. Corrupt officials and hidden airstrips make this the smuggler\'s highway.'
  },
  {
    id: 'mexico', name: 'Mexico', emoji: '🇲🇽',
    unlockTier: 3, unlockCost: 150000,
    unlockRequirements: { minNetWorth: 500000, minRep: 50, minDistrictsVisited: 0, requiredTier: 2, requiredFactionAllied: true, requiredAct: 1 },
    travelBaseTime: 3,
    continent: 'north_america',
    desc: 'Syndicate stronghold. The border is a war zone and every plaza has a price. You need allies just to set foot here.'
  },
  {
    id: 'us_cities', name: 'US Cities', emoji: '🏙️',
    unlockTier: 3, unlockCost: 150000,
    unlockRequirements: { minNetWorth: 500000, minRep: 50, minDistrictsVisited: 0, requiredTier: 2, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 2,
    continent: 'north_america',
    desc: 'New York, LA, Chicago, Detroit. The domestic distribution network — bigger markets, bigger competition, bigger heat.'
  },
  {
    id: 'western_europe', name: 'Western Europe', emoji: '🏰',
    unlockTier: 4, unlockCost: 500000,
    unlockRequirements: { minNetWorth: 2000000, minRep: 70, minDistrictsVisited: 0, requiredTier: 3, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 4,
    continent: 'europe',
    desc: 'Amsterdam, London, Paris. Sophisticated markets with sophisticated law enforcement. The margins are enormous if you can get product through.'
  },
  {
    id: 'eastern_europe', name: 'Eastern Europe', emoji: '🏭',
    unlockTier: 4, unlockCost: 500000,
    unlockRequirements: { minNetWorth: 2000000, minRep: 70, minDistrictsVisited: 0, requiredTier: 3, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 5,
    continent: 'europe',
    desc: 'Bratva territory. Cheap labor, corrupt borders, and the meth trade. Partnership here is a blood oath — betrayal is a death sentence.'
  },
  {
    id: 'west_africa', name: 'West Africa', emoji: '🌍',
    unlockTier: 5, unlockCost: 1000000,
    unlockRequirements: { minNetWorth: 5000000, minRep: 85, minDistrictsVisited: 0, requiredTier: 4, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 6,
    continent: 'africa',
    desc: 'The new frontier. Emerging transit hub between South America and Europe. Untapped markets and minimal law enforcement — for now.'
  },
  {
    id: 'southeast_asia', name: 'Southeast Asia', emoji: '🐉',
    unlockTier: 5, unlockCost: 1000000,
    unlockRequirements: { minNetWorth: 5000000, minRep: 85, minDistrictsVisited: 0, requiredTier: 4, requiredFactionAllied: false, requiredAct: 1 },
    travelBaseTime: 7,
    continent: 'asia',
    desc: 'The Golden Triangle and beyond. Opium, heroin, meth — the old empires of the drug trade. Ancient networks, modern money.'
  },
];


// ============================================================
//   Region Distance Matrix (hops between regions)
//   Used for travel cost/time calculation
//   Values: 1 = adjacent, 2.5 = nearby, 4 = moderate, 6 = far, 8 = opposite side of world
// ============================================================

const REGION_DISTANCES = {
  miami: {
    miami: 0, caribbean: 1, south_america: 2.5, central_america: 2.5,
    mexico: 2.5, us_cities: 1, western_europe: 6, eastern_europe: 6,
    west_africa: 6, southeast_asia: 8
  },
  caribbean: {
    miami: 1, caribbean: 0, south_america: 2.5, central_america: 1,
    mexico: 2.5, us_cities: 2.5, western_europe: 6, eastern_europe: 6,
    west_africa: 4, southeast_asia: 8
  },
  south_america: {
    miami: 2.5, caribbean: 2.5, south_america: 0, central_america: 2.5,
    mexico: 4, us_cities: 4, western_europe: 6, eastern_europe: 6,
    west_africa: 4, southeast_asia: 8
  },
  central_america: {
    miami: 2.5, caribbean: 1, south_america: 2.5, central_america: 0,
    mexico: 1, us_cities: 2.5, western_europe: 6, eastern_europe: 6,
    west_africa: 6, southeast_asia: 8
  },
  mexico: {
    miami: 2.5, caribbean: 2.5, south_america: 4, central_america: 1,
    mexico: 0, us_cities: 1, western_europe: 6, eastern_europe: 6,
    west_africa: 6, southeast_asia: 8
  },
  us_cities: {
    miami: 1, caribbean: 2.5, south_america: 4, central_america: 2.5,
    mexico: 1, us_cities: 0, western_europe: 4, eastern_europe: 6,
    west_africa: 6, southeast_asia: 8
  },
  western_europe: {
    miami: 6, caribbean: 6, south_america: 6, central_america: 6,
    mexico: 6, us_cities: 4, western_europe: 0, eastern_europe: 1,
    west_africa: 2.5, southeast_asia: 6
  },
  eastern_europe: {
    miami: 6, caribbean: 6, south_america: 6, central_america: 6,
    mexico: 6, us_cities: 6, western_europe: 1, eastern_europe: 0,
    west_africa: 4, southeast_asia: 4
  },
  west_africa: {
    miami: 6, caribbean: 4, south_america: 4, central_america: 6,
    mexico: 6, us_cities: 6, western_europe: 2.5, eastern_europe: 4,
    west_africa: 0, southeast_asia: 6
  },
  southeast_asia: {
    miami: 8, caribbean: 8, south_america: 8, central_america: 8,
    mexico: 8, us_cities: 8, western_europe: 6, eastern_europe: 4,
    west_africa: 6, southeast_asia: 0
  },
};


// ============================================================
//   World Region Functions
// ============================================================

/**
 * Initialize default world state for a new game.
 * Returns a fresh worldState object to attach to the game state.
 */
function initWorldState() {
  return {
    unlockedRegions: ['miami'],
    regionContacts: {},   // regionId -> [{ name, type, trust }]
    regionProgress: {},   // regionId -> { missionsComplete, repLocal, discovered }
  };
}

/**
 * Helper — get a region object by id.
 */
function getRegionById(regionId) {
  return WORLD_REGIONS.find(r => r.id === regionId) || null;
}

/**
 * Check if a region is currently unlocked in the player's world state.
 */
function isRegionUnlocked(state, regionId) {
  if (!state || typeof state !== 'object') return false;
  if (!state.worldState || !Array.isArray(state.worldState.unlockedRegions)) return false;
  return state.worldState.unlockedRegions.includes(regionId);
}

/**
 * Check if the player meets all requirements to unlock a given region.
 * Does NOT check if they can afford the cost — only prerequisites.
 */
function canUnlockRegion(state, regionId) {
  if (!state || typeof state !== 'object') return { canUnlock: false, reasons: ['Invalid state.'] };
  const region = getRegionById(regionId);
  if (!region) return { canUnlock: false, reasons: ['Unknown region.'] };
  if (isRegionUnlocked(state, regionId)) return { canUnlock: false, reasons: ['Already unlocked.'] };

  const req = region.unlockRequirements;
  const reasons = [];

  // Net worth check: cash + bank - debt
  const cash = typeof state.cash === 'number' ? state.cash : 0;
  const bank = typeof state.bank === 'number' ? state.bank : 0;
  const debt = typeof state.debt === 'number' ? state.debt : 0;
  const netWorth = cash + bank - debt;
  if (req.minNetWorth && netWorth < req.minNetWorth) {
    reasons.push(`Need $${req.minNetWorth.toLocaleString()} net worth (currently $${netWorth.toLocaleString()}).`);
  }

  // Reputation check (uses state.reputation — overall street rep)
  const rep = typeof state.reputation === 'number' ? state.reputation : 0;
  if (req.minRep && rep < req.minRep) {
    reasons.push(`Need ${req.minRep} reputation (currently ${rep}).`);
  }

  // Districts visited check
  if (req.minDistrictsVisited && req.minDistrictsVisited > 0) {
    const visited = (state.stats && Array.isArray(state.stats.districtsVisited))
      ? state.stats.districtsVisited.length
      : 0;
    if (visited < req.minDistrictsVisited) {
      reasons.push(`Need ${req.minDistrictsVisited} districts visited (currently ${visited}).`);
    }
  }

  // Required tier check — at least one region of the required tier must be unlocked
  if (req.requiredTier !== null && typeof req.requiredTier === 'number') {
    const unlockedRegions = (state.worldState && Array.isArray(state.worldState.unlockedRegions))
      ? state.worldState.unlockedRegions : [];
    const hasRequiredTier = WORLD_REGIONS.some(r =>
      r.unlockTier === req.requiredTier && unlockedRegions.includes(r.id)
    );
    if (!hasRequiredTier) {
      reasons.push(`Must unlock a Tier ${req.requiredTier} region first.`);
    }
  }

  // Faction allied check
  if (req.requiredFactionAllied) {
    let hasAlly = false;
    if (state.factions && typeof state.factions === 'object') {
      const standings = state.factions.standings || {};
      hasAlly = Object.values(standings).some(s => s >= 75);
    }
    if (!hasAlly) {
      reasons.push('Must have at least 1 faction allied (75+ standing).');
    }
  }

  // Act check (campaign progress)
  if (req.requiredAct && req.requiredAct > 1) {
    const currentAct = (state.campaign && typeof state.campaign.currentAct === 'number')
      ? state.campaign.currentAct : 1;
    if (currentAct < req.requiredAct) {
      reasons.push(`Must reach Act ${req.requiredAct} (currently Act ${currentAct}).`);
    }
  }

  // Affordability (separate from prerequisites but useful info)
  if (region.unlockCost > 0 && cash < region.unlockCost) {
    reasons.push(`Need $${region.unlockCost.toLocaleString()} cash to unlock (have $${cash.toLocaleString()}).`);
  }

  return { canUnlock: reasons.length === 0, reasons };
}

/**
 * Attempt to unlock a region. Deducts cost from cash and adds to unlocked list.
 * Returns { success, msg }.
 */
function unlockRegion(state, regionId) {
  if (!state || typeof state !== 'object') return { success: false, msg: 'Invalid state.' };
  const region = getRegionById(regionId);
  if (!region) return { success: false, msg: 'Unknown region.' };
  if (isRegionUnlocked(state, regionId)) return { success: false, msg: `${region.name} is already unlocked.` };

  const check = canUnlockRegion(state, regionId);
  if (!check.canUnlock) {
    return { success: false, msg: `Cannot unlock ${region.name}: ${check.reasons.join(' ')}` };
  }

  // Deduct cost
  if (region.unlockCost > 0) {
    state.cash -= region.unlockCost;
  }

  // Add to unlocked regions
  if (!state.worldState) state.worldState = initWorldState();
  if (!Array.isArray(state.worldState.unlockedRegions)) state.worldState.unlockedRegions = ['miami'];
  state.worldState.unlockedRegions.push(regionId);

  // Initialize region progress
  if (!state.worldState.regionProgress) state.worldState.regionProgress = {};
  state.worldState.regionProgress[regionId] = { missionsComplete: 0, repLocal: 0, discovered: true };

  if (!state.worldState.regionContacts) state.worldState.regionContacts = {};
  state.worldState.regionContacts[regionId] = [];

  return {
    success: true,
    msg: `${region.emoji} ${region.name} unlocked! New territory, new opportunities. Cost: $${region.unlockCost.toLocaleString()}.`
  };
}

/**
 * Get all currently unlocked region objects.
 */
function getUnlockedRegions(state) {
  if (!state || typeof state !== 'object') return [];
  if (!state.worldState || !Array.isArray(state.worldState.unlockedRegions)) return [];
  return state.worldState.unlockedRegions
    .map(id => getRegionById(id))
    .filter(r => r !== null);
}

/**
 * Get the distance multiplier between two regions.
 * Returns a numeric value: 0 (same), 1, 2.5, 4, 6, or 8.
 * Falls back to 8 (max distance) if either region is unknown.
 */
function getRegionDistance(fromRegionId, toRegionId) {
  if (fromRegionId === toRegionId) return 0;
  if (REGION_DISTANCES[fromRegionId] && typeof REGION_DISTANCES[fromRegionId][toRegionId] === 'number') {
    return REGION_DISTANCES[fromRegionId][toRegionId];
  }
  return 8; // Default to max distance for unknown pairs
}

/**
 * Check all locked regions and return notification messages for any
 * that the player can now unlock. Useful for triggering UI prompts.
 * Returns array of { regionId, name, emoji, msg }.
 */
function checkRegionUnlockTriggers(state) {
  if (!state || typeof state !== 'object') return [];
  const notifications = [];

  for (const region of WORLD_REGIONS) {
    if (isRegionUnlocked(state, region.id)) continue;
    const check = canUnlockRegion(state, region.id);
    if (check.canUnlock) {
      notifications.push({
        regionId: region.id,
        name: region.name,
        emoji: region.emoji,
        msg: `${region.emoji} New region available: ${region.name} — $${region.unlockCost.toLocaleString()} to unlock. ${region.desc}`
      });
    }
  }

  return notifications;
}
