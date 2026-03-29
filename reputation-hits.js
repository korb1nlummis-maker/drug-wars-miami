// ============================================================
// Drug Wars: Miami Vice Edition — Reputation Hits System
// ============================================================

const REP_HIT_TYPES = [
  {
    id: 'plant_story',
    name: 'Plant Story',
    emoji: '📰',
    cost: 5000,
    repDamage: 15,
    heatIncrease: 0,
    duration: 3,
    blowbackChance: 0.05,
    cooldown: 5,
    requirements: { contact: 'journalist' },
    description: 'Feed a damaging story to the press through a journalist contact.'
  },
  {
    id: 'social_media',
    name: 'Social Media Campaign',
    emoji: '📱',
    cost: 2000,
    repDamage: 10,
    heatIncrease: 0,
    duration: 4,
    blowbackChance: 0.05,
    cooldown: 3,
    requirements: {},
    description: 'Anonymous smear campaign across social platforms.'
  },
  {
    id: 'anonymous_tip',
    name: 'Anonymous Tip',
    emoji: '📞',
    cost: 0,
    repDamage: 0,
    heatIncrease: 15,
    duration: 5,
    blowbackChance: 0.10,
    cooldown: 7,
    requirements: { skill: 'streetwise', skillLevel: 3 },
    description: 'Redirect a police investigation toward your rival.'
  },
  {
    id: 'frame_rival',
    name: 'Frame Rival',
    emoji: '🎭',
    cost: 10000,
    repDamage: 0,
    heatIncrease: 25,
    duration: 7,
    blowbackChance: 0.15,
    cooldown: 10,
    requirements: { skill: 'stealth', skillLevel: 2, intel: true },
    description: 'Plant evidence of wrongdoing at a rival\'s known location.'
  },
  {
    id: 'fake_evidence',
    name: 'Fake Evidence',
    emoji: '📄',
    cost: 15000,
    repDamage: 20,
    heatIncrease: 10,
    duration: 6,
    blowbackChance: 0.20,
    cooldown: 14,
    requirements: { skill: 'chemistry', skillLevel: 2 },
    description: 'Manufacture damning evidence. Expensive, effective, and risky.'
  }
];

const BLOWBACK_PENALTIES = {
  repDamage: 10,
  heatIncrease: 15,
  targetHostile: true
};

// ---- State ----

function initRepHitsState() {
  return {
    activeHits: [],
    hitHistory: [],
    totalHitsLaunched: 0,
    blowbacks: 0,
    cooldowns: {}
  };
}

// ---- Daily Processing ----

function processRepHitsDaily(state) {
  const results = [];
  const rh = state.repHits;
  if (!rh) return results;

  if (rh.activeHits) {
    for (let i = rh.activeHits.length - 1; i >= 0; i--) {
      const hit = rh.activeHits[i];

      if (!hit.effectApplied) {
        hit.effectApplied = true;
        results.push({
          type: 'effect_applied',
          hitType: hit.hitType,
          targetId: hit.targetId,
          repDamage: hit.repDamage,
          heatIncrease: hit.heatIncrease,
          message: `Hit on ${hit.targetId}: effects taking hold.`
        });
      }

      hit.daysRemaining--;

      if (hit.daysRemaining <= 0) {
        if (!hit.detected && Math.random() < hit.blowbackChance) {
          hit.detected = true;
          const blowback = resolveBlowback(rh, i);
          results.push(blowback);
        }

        if (rh.hitHistory) rh.hitHistory.push({ ...hit, completed: true });
        rh.activeHits.splice(i, 1);

        results.push({
          type: 'hit_expired',
          hitType: hit.hitType,
          targetId: hit.targetId,
          detected: hit.detected,
          message: `Hit on ${hit.targetId} has run its course.`
        });
      }
    }
  }

  if (rh.cooldowns) {
    for (const hitTypeId of Object.keys(rh.cooldowns)) {
      if (rh.cooldowns[hitTypeId] > 0) {
        rh.cooldowns[hitTypeId]--;
      }
    }
  }

  return results;
}

// ---- Can Launch ----

function canLaunchHit(state, hitType, targetId, playerSkills, playerContacts) {
  const hit = REP_HIT_TYPES.find(h => h.id === hitType);
  if (!hit) return { allowed: false, reason: 'Unknown hit type.' };

  const rh = state.repHits;
  if (!rh) return { allowed: false, reason: 'Rep hits system not initialized.' };

  if (rh.cooldowns[hitType] > 0) {
    return { allowed: false, reason: `On cooldown for ${rh.cooldowns[hitType]} more days.` };
  }

  const activeOnTarget = rh.activeHits.find(h => h.targetId === targetId && h.hitType === hitType);
  if (activeOnTarget) {
    return { allowed: false, reason: 'Already running this hit on that target.' };
  }

  const reqs = hit.requirements;

  if (reqs.contact) {
    const hasContact = playerContacts && playerContacts.some(c => c.type === reqs.contact && c.active);
    if (!hasContact) {
      return { allowed: false, reason: `Requires an active ${reqs.contact} contact.` };
    }
  }

  if (reqs.skill) {
    const skillLevel = (playerSkills && playerSkills[reqs.skill]) || 0;
    if (skillLevel < reqs.skillLevel) {
      return { allowed: false, reason: `Requires ${reqs.skill} level ${reqs.skillLevel}. You have ${skillLevel}.` };
    }
  }

  if (reqs.intel) {
    const hasIntel = playerContacts && playerContacts.some(c => c.type === 'informant' && c.active);
    if (!hasIntel) {
      return { allowed: false, reason: 'Requires intel from an active informant.' };
    }
  }

  return { allowed: true };
}

// ---- Launch Hit ----

function launchRepHit(state, hitType, targetId, playerSkills, playerContacts) {
  const check = canLaunchHit(state, hitType, targetId, playerSkills, playerContacts);
  if (!check.allowed) return { success: false, message: check.reason };

  const hitDef = REP_HIT_TYPES.find(h => h.id === hitType);

  const activeHit = {
    hitType: hitDef.id,
    targetId,
    dayStarted: 0,
    daysRemaining: hitDef.duration,
    detected: false,
    effectApplied: false,
    repDamage: hitDef.repDamage,
    heatIncrease: hitDef.heatIncrease,
    blowbackChance: hitDef.blowbackChance,
    cost: hitDef.cost
  };

  const rh = state.repHits;
  if (!rh) return { success: false, message: 'Rep hits system not initialized.' };

  rh.activeHits.push(activeHit);
  rh.totalHitsLaunched++;
  rh.cooldowns[hitType] = hitDef.cooldown;

  return {
    success: true,
    cost: hitDef.cost,
    duration: hitDef.duration,
    message: `${hitDef.emoji} ${hitDef.name} launched against ${targetId}. Duration: ${hitDef.duration} days. Cost: $${hitDef.cost.toLocaleString()}.`
  };
}

// ---- Available Hit Types ----

function getAvailableHitTypes(state, playerSkills, playerContacts) {
  return REP_HIT_TYPES.filter(hit => {
    const check = canLaunchHit(state, hit.id, '__any__', playerSkills, playerContacts);
    return check.allowed;
  }).map(hit => ({
    id: hit.id,
    name: hit.name,
    emoji: hit.emoji,
    cost: hit.cost,
    repDamage: hit.repDamage,
    heatIncrease: hit.heatIncrease,
    duration: hit.duration,
    blowbackChance: hit.blowbackChance,
    cooldownRemaining: (state.repHits && state.repHits.cooldowns && state.repHits.cooldowns[hit.id]) || 0
  }));
}

// ---- Blowback ----

function resolveBlowback(stateOrRh, hitIndex) {
  // Accept either full game state or repHits sub-object
  const rh = stateOrRh.repHits || stateOrRh;
  const hit = rh.activeHits[hitIndex];
  if (!hit) return { success: false, message: 'Invalid hit index.' };

  hit.detected = true;
  rh.blowbacks++;

  return {
    type: 'blowback',
    hitType: hit.hitType,
    targetId: hit.targetId,
    penalties: {
      repDamage: BLOWBACK_PENALTIES.repDamage,
      heatIncrease: BLOWBACK_PENALTIES.heatIncrease,
      targetHostile: BLOWBACK_PENALTIES.targetHostile
    },
    blowbackCount: rh.blowbacks,
    message: `BLOWBACK! Your ${hit.hitType.replace('_', ' ')} against ${hit.targetId} was traced back to you. -${BLOWBACK_PENALTIES.repDamage} rep, +${BLOWBACK_PENALTIES.heatIncrease} heat, and they are now hostile.`
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REP_HIT_TYPES,
    BLOWBACK_PENALTIES,
    initRepHitsState,
    processRepHitsDaily,
    canLaunchHit,
    launchRepHit,
    getAvailableHitTypes,
    resolveBlowback
  };
}
