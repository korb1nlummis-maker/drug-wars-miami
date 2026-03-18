// ============================================================
// DRUG WARS: MIAMI VICE EDITION - World Progression System
// Handles region unlock triggers and progression notifications
// ============================================================

// Check for region unlock opportunities during daily processing
function checkWorldProgression(state) {
  if (!state) return [];
  if (!state.worldState) state.worldState = typeof initWorldState === 'function' ? initWorldState() : { unlockedRegions: ['miami'], regionContacts: {}, regionProgress: {} };

  const msgs = [];
  const regions = typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS : [];

  for (const region of regions) {
    if (region.id === 'miami') continue;
    if (state.worldState.unlockedRegions.includes(region.id)) continue;

    // Check if player meets requirements
    if (typeof canUnlockRegion === 'function' && canUnlockRegion(state, region.id)) {
      // Check if we already notified about this region
      if (!state.worldState.regionProgress) state.worldState.regionProgress = {};
      if (!state.worldState.regionProgress[region.id]) {
        state.worldState.regionProgress[region.id] = { notified: true, notifiedDay: state.day };
        msgs.push(`🌍 NEW REGION AVAILABLE: ${region.emoji} ${region.name}! Open the World Map to expand your empire. (Cost: $${(region.unlockCost || 0).toLocaleString()})`);
      }
    }
  }

  return msgs;
}

// Process world systems daily (call from game-engine.js waitDay)
function processWorldDaily(state) {
  const msgs = [];

  // Check for new unlock opportunities
  const progressMsgs = checkWorldProgression(state);
  msgs.push(...progressMsgs);

  // Process world events
  if (typeof processWorldEvents === 'function') {
    const eventMsgs = processWorldEvents(state);
    msgs.push(...eventMsgs);
  }

  // Cleanup expired events
  if (typeof cleanupWorldEvents === 'function') {
    cleanupWorldEvents(state);
  }

  return msgs;
}

// Get world progression summary for UI
function getWorldProgressionSummary(state) {
  if (!state.worldState) return { unlocked: 1, total: 10, available: 0, regions: [] };

  const regions = typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS : [];
  const unlocked = state.worldState.unlockedRegions || ['miami'];
  let available = 0;

  const regionStatus = regions.map(r => {
    const isUnlocked = unlocked.includes(r.id);
    const canUnlock = !isUnlocked && typeof canUnlockRegion === 'function' && canUnlockRegion(state, r.id);
    if (canUnlock) available++;
    return {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      unlocked: isUnlocked,
      available: canUnlock,
      tier: r.unlockTier,
      cost: r.unlockCost || 0,
    };
  });

  return {
    unlocked: unlocked.length,
    total: regions.length,
    available: available,
    regions: regionStatus,
  };
}

// Ensure world state is initialized when loading a save
function ensureWorldState(state) {
  if (!state.worldState) {
    state.worldState = typeof initWorldState === 'function' ? initWorldState() : {
      unlockedRegions: ['miami'],
      regionContacts: {},
      regionProgress: {},
      activeEvents: {},
    };
  }
  if (!state.worldState.unlockedRegions) state.worldState.unlockedRegions = ['miami'];
  if (!state.worldState.regionContacts) state.worldState.regionContacts = {};
  if (!state.worldState.regionProgress) state.worldState.regionProgress = {};
  if (!state.worldState.activeEvents) state.worldState.activeEvents = {};
}
