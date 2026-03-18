// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Body Disposal System
// Bodies accumulate from combat kills and must be disposed of
// or risk investigation and evidence piling up.
// ============================================================

// ============================================================
// DISPOSAL METHODS — cost more = safer
// ============================================================
const DISPOSAL_METHODS = [
  {
    id: 'shallow_grave', name: 'Shallow Grave', emoji: '⛏️',
    cost: 500, discoveryChance: 0.15, heatReduction: 5,
    desc: 'Dig a hole in the Everglades. Cheap but risky — gators might not finish the job.',
    timeRequired: 0, // instant
  },
  {
    id: 'river_dump', name: 'River Dump', emoji: '🌊',
    cost: 1500, discoveryChance: 0.10, heatReduction: 8,
    desc: 'Weight the body down and dump in the river. Moderate risk — could wash up.',
    timeRequired: 0,
  },
  {
    id: 'acid_bath', name: 'Acid Bath', emoji: '⚗️',
    cost: 8000, discoveryChance: 0.03, heatReduction: 15,
    desc: 'Dissolve in hydrofluoric acid. Expensive but very effective. No body, no crime.',
    timeRequired: 1, // takes 1 day
  },
  {
    id: 'pig_farm', name: 'Pig Farm', emoji: '🐷',
    cost: 5000, discoveryChance: 0.05, heatReduction: 12,
    desc: 'Pigs will eat anything. A rural solution for an urban problem.',
    timeRequired: 1,
  },
  {
    id: 'cremation', name: 'Underground Cremation', emoji: '🔥',
    cost: 12000, discoveryChance: 0.02, heatReduction: 18,
    desc: 'A friend at the funeral home. Clean burn, no evidence.',
    timeRequired: 1,
  },
  {
    id: 'concrete', name: 'Concrete Foundation', emoji: '🏗️',
    cost: 15000, discoveryChance: 0.01, heatReduction: 20,
    desc: 'Poured into a construction site foundation. Permanent disappearance.',
    timeRequired: 2,
  },
  {
    id: 'ocean_drop', name: 'Deep Ocean Drop', emoji: '🚤',
    cost: 25000, discoveryChance: 0.005, heatReduction: 25,
    desc: 'Charter a boat, go 50 miles out. Chain weights attached. Gone forever.',
    timeRequired: 2,
  },
  {
    id: 'cartel_cleanup', name: 'Cartel Cleanup Crew', emoji: '🧹',
    cost: 50000, discoveryChance: 0.001, heatReduction: 30,
    desc: 'Professional disposal team. They do this for a living. Zero trace.',
    timeRequired: 0,
    minLevel: 10,
  },
];

// ============================================================
// BODY STATE MANAGEMENT
// ============================================================
function initBodyState() {
  return {
    bodies: 0,           // undisposed bodies
    totalKills: 0,        // lifetime kill count
    disposedBodies: 0,    // total bodies successfully disposed
    discoveredBodies: 0,  // bodies that were found by police
    pendingDisposal: [],  // { method, completionDay, count }
    bodyLocations: [],    // { day, location, count, disposed } — evidence trail
  };
}

// ============================================================
// ADD BODIES (called after combat kills)
// ============================================================
function addBodies(state, count, location) {
  if (!state.bodies_state) state.bodies_state = initBodyState();
  const bs = state.bodies_state;
  bs.bodies += count;
  bs.totalKills += count;
  bs.bodyLocations.push({
    day: state.day,
    location: location || state.currentLocation,
    count,
    disposed: false,
  });
  // Keep location history trimmed
  if (bs.bodyLocations.length > 50) bs.bodyLocations.shift();
}

// ============================================================
// DISPOSE OF BODIES
// ============================================================
function disposeBodies(state, methodId, count) {
  if (!state.bodies_state) state.bodies_state = initBodyState();
  const bs = state.bodies_state;
  const method = DISPOSAL_METHODS.find(m => m.id === methodId);
  if (!method) return { success: false, msg: 'Unknown disposal method.' };
  if (count <= 0 || count > bs.bodies) return { success: false, msg: 'Invalid body count.' };

  // Level requirement
  if (method.minLevel) {
    const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
    if (playerLevel < method.minLevel) {
      return { success: false, msg: `🔒 ${method.name} requires Kingpin Level ${method.minLevel}.` };
    }
  }

  const totalCost = method.cost * count;
  if (state.cash < totalCost) return { success: false, msg: `Need $${totalCost.toLocaleString()} for disposal.` };

  state.cash -= totalCost;
  bs.bodies -= count;

  if (method.timeRequired > 0) {
    // Delayed disposal — bodies being processed
    bs.pendingDisposal.push({
      method: methodId,
      completionDay: state.day + method.timeRequired,
      count,
    });
    return {
      success: true,
      msg: `${method.emoji} ${count} bod${count > 1 ? 'ies' : 'y'} sent for ${method.name.toLowerCase()}. Done by day ${state.day + method.timeRequired}. Cost: $${totalCost.toLocaleString()}.`,
    };
  }

  // Instant disposal — check discovery
  let discovered = 0;
  for (let i = 0; i < count; i++) {
    if (Math.random() < method.discoveryChance) discovered++;
  }

  bs.disposedBodies += count - discovered;
  bs.discoveredBodies += discovered;

  // Reduce heat
  state.heat = Math.max(0, (state.heat || 0) - method.heatReduction * count);

  if (discovered > 0) {
    state.heat = Math.min(100, (state.heat || 0) + discovered * 15);
    return {
      success: true,
      msg: `${method.emoji} Disposed of ${count - discovered} bod${count - discovered !== 1 ? 'ies' : 'y'}. ⚠️ ${discovered} bod${discovered > 1 ? 'ies were' : 'y was'} discovered! Heat +${discovered * 15}! Cost: $${totalCost.toLocaleString()}.`,
    };
  }

  return {
    success: true,
    msg: `${method.emoji} ${count} bod${count > 1 ? 'ies' : 'y'} disposed via ${method.name.toLowerCase()}. Clean. Cost: $${totalCost.toLocaleString()}.`,
  };
}

// ============================================================
// DAILY PROCESSING — check for body discovery
// ============================================================
function processBodyDisposalDaily(state) {
  if (!state.bodies_state) state.bodies_state = initBodyState();
  const bs = state.bodies_state;
  const msgs = [];

  // Complete pending disposals
  for (let i = bs.pendingDisposal.length - 1; i >= 0; i--) {
    const pd = bs.pendingDisposal[i];
    if (state.day >= pd.completionDay) {
      const method = DISPOSAL_METHODS.find(m => m.id === pd.method);
      const chance = method ? method.discoveryChance : 0.1;
      let discovered = 0;
      for (let j = 0; j < pd.count; j++) {
        if (Math.random() < chance) discovered++;
      }
      bs.disposedBodies += pd.count - discovered;
      bs.discoveredBodies += discovered;
      if (method) state.heat = Math.max(0, (state.heat || 0) - method.heatReduction * (pd.count - discovered));
      if (discovered > 0) {
        state.heat = Math.min(100, (state.heat || 0) + discovered * 15);
        msgs.push(`☠️ Police found ${discovered} bod${discovered > 1 ? 'ies' : 'y'} from your ${method ? method.name.toLowerCase() : 'disposal'}! Heat +${discovered * 15}!`);
      } else {
        msgs.push(`${method ? method.emoji : '✅'} ${pd.count} bod${pd.count > 1 ? 'ies' : 'y'} — ${method ? method.name : 'disposal'} complete. Clean.`);
      }
      bs.pendingDisposal.splice(i, 1);
    }
  }

  // Undisposed bodies generate passive heat and discovery risk
  if (bs.bodies > 0) {
    // Each undisposed body has a daily 3% chance of being discovered
    let newDiscoveries = 0;
    for (let i = 0; i < bs.bodies; i++) {
      if (Math.random() < 0.03) newDiscoveries++;
    }
    if (newDiscoveries > 0) {
      bs.bodies -= newDiscoveries;
      bs.discoveredBodies += newDiscoveries;
      const heatGain = newDiscoveries * 20;
      state.heat = Math.min(100, (state.heat || 0) + heatGain);
      msgs.push(`🚨 Police discovered ${newDiscoveries} undisposed bod${newDiscoveries > 1 ? 'ies' : 'y'}! Heat +${heatGain}! Dispose of your bodies!`);
    }
    // Passive heat from having undisposed bodies
    if (bs.bodies > 0) {
      const passiveHeat = Math.min(5, Math.ceil(bs.bodies / 2));
      state.heat = Math.min(100, (state.heat || 0) + passiveHeat);
    }
  }

  return msgs;
}

// ============================================================
// HELPER: Get body count summary
// ============================================================
function getBodySummary(state) {
  if (!state.bodies_state) state.bodies_state = initBodyState();
  const bs = state.bodies_state;
  return {
    undisposed: bs.bodies,
    pending: bs.pendingDisposal.reduce((s, p) => s + p.count, 0),
    totalKills: bs.totalKills,
    disposed: bs.disposedBodies,
    discovered: bs.discoveredBodies,
  };
}
