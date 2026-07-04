// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Expanded Heat & Law Enforcement
// ============================================================

// 3-Tier Heat System
const HEAT_TIERS = [
  { id: 'local', name: 'Local Heat', emoji: '👮', color: '#ff9500',
    threshold: 0, maxPoints: 100,
    desc: 'Beat cops and patrol officers. Random searches and minor busts.',
    effects: { searchChance: 0.05, bustMultiplier: 1.0, bailCost: 500 } },
  { id: 'city', name: 'City Heat', emoji: '🕵️', color: '#ff4444',
    threshold: 40, maxPoints: 100,
    desc: 'Detectives and organized crime units. Surveillance and stings.',
    effects: { searchChance: 0.08, bustMultiplier: 1.5, bailCost: 5000, canWiretap: true } },
  { id: 'federal', name: 'Federal Heat', emoji: '🏛️', color: '#ff0000',
    threshold: 70, maxPoints: 100,
    desc: 'DEA and FBI. RICO cases, asset seizure, and federal prosecution.',
    effects: { searchChance: 0.12, bustMultiplier: 2.5, bailCost: 50000, canWiretap: true, canRICO: true } },
];

// Law enforcement encounter types
const LE_ENCOUNTERS = [
  { id: 'patrol_stop', name: 'Patrol Stop', tier: 'local', emoji: '🚔',
    chance: 0.08, severity: 1, escapeDifficulty: 0.3,
    desc: 'Random patrol stop. They might search you.' },
  { id: 'drug_checkpoint', name: 'Drug Checkpoint', tier: 'local', emoji: '🚧',
    chance: 0.04, severity: 2, escapeDifficulty: 0.5,
    desc: 'Organized checkpoint. Harder to bluff through.' },
  { id: 'undercover_sting', name: 'Undercover Sting', tier: 'city', emoji: '🕶️',
    chance: 0.03, severity: 3, escapeDifficulty: 0.6,
    desc: 'Undercover officer posing as buyer/seller.' },
  { id: 'surveillance_raid', name: 'Surveillance Raid', tier: 'city', emoji: '📸',
    chance: 0.02, severity: 4, escapeDifficulty: 0.7,
    desc: 'They\'ve been watching. Coordinated raid.' },
  { id: 'dea_raid', name: 'DEA Raid', tier: 'federal', emoji: '🏛️',
    chance: 0.015, severity: 5, escapeDifficulty: 0.85,
    desc: 'Federal agents with warrants. SWAT support.' },
  { id: 'rico_arrest', name: 'RICO Arrest', tier: 'federal', emoji: '⚖️',
    chance: 0.008, severity: 6, escapeDifficulty: 0.95,
    desc: 'Federal racketeering charges. They have everything.' },
];

// Wiretap mechanics
const WIRETAP_TRIGGERS = [
  { id: 'same_location', name: 'Same Location Dealing', threshold: 5,
    desc: 'Dealing from the same spot repeatedly' },
  { id: 'phone_calls', name: 'Phone Usage Pattern', threshold: 10,
    desc: 'Using the same communication method too often' },
  { id: 'regular_meetings', name: 'Regular Meetings', threshold: 7,
    desc: 'Meeting contacts at predictable times' },
];

// Counter-measures
const COUNTER_MEASURES = [
  { id: 'burner_phone', name: 'Burner Phone', emoji: '📱', cost: 200, duration: 30,
    effect: { wiretapResist: 0.5, trackingResist: 0.3 },
    desc: 'Disposable phone. Replace frequently.' },
  { id: 'bug_sweep', name: 'Bug Sweep', emoji: '🔍', cost: 2000, duration: 0,
    effect: { removeWiretaps: true },
    desc: 'Sweep properties for surveillance devices.' },
  { id: 'safe_house', name: 'Safe House Protocol', emoji: '🏠', cost: 5000, duration: 60,
    effect: { raidResist: 0.4, wiretapResist: 0.3 },
    desc: 'Rotate meeting locations. Harder to surveil.' },
  { id: 'lawyer_retainer', name: 'Lawyer on Retainer', emoji: '⚖️', cost: 10000, duration: 90,
    effect: { bailDiscount: 0.5, sentenceReduction: 0.3, ricoResist: 0.2 },
    desc: 'Top criminal defense attorney. Always available.' },
  { id: 'corrupt_cop', name: 'Corrupt Cop Contact', emoji: '🤝', cost: 15000, duration: 120,
    effect: { raidWarning: true, evidenceDestroy: 0.3, searchResist: 0.5 },
    desc: 'Inside man in the department. Tips you off.' },
  { id: 'decoy_operation', name: 'Decoy Operation', emoji: '🎭', cost: 8000, duration: 45,
    effect: { heatRedirect: 0.4, investigationSlow: 0.3 },
    desc: 'Set up a fake operation to misdirect investigators.' },
];

// Chase mechanics
const CHASE_VEHICLES = [
  { id: 'on_foot', name: 'On Foot', emoji: '🏃', speed: 30, handling: 80, heat: 0 },
  { id: 'sedan', name: 'Sedan', emoji: '🚗', speed: 60, handling: 50, heat: 5 },
  { id: 'sports_car', name: 'Sports Car', emoji: '🏎️', speed: 90, handling: 70, heat: 15, cost: 25000 },
  { id: 'motorcycle', name: 'Motorcycle', emoji: '🏍️', speed: 75, handling: 90, heat: 10, cost: 8000 },
  { id: 'suv', name: 'Armored SUV', emoji: '🚙', speed: 50, handling: 40, heat: 20, cost: 50000, armor: 30 },
  { id: 'speedboat', name: 'Speedboat', emoji: '🚤', speed: 85, handling: 60, heat: 10, cost: 35000, waterOnly: true },
];

// ============================================================
// HEAT STATE
// ============================================================
function initHeatState() {
  return {
    local: 0,     // 0-100
    city: 0,      // 0-100
    federal: 0,   // 0-100
    wiretaps: [],  // active wiretaps on player
    counterMeasures: [], // active counter-measures
    chaseHistory: [],
    totalChases: 0,
    chasesEscaped: 0,
    chasesFailed: 0,
    dealingPatterns: {}, // { locationId: count } for wiretap triggers
    lastDealLocation: null,
    consecutiveSameLocation: 0,
    vehicles: ['on_foot'], // owned vehicles
    activeVehicle: 'on_foot',
  };
}

// ============================================================
// HEAT CALCULATIONS
// ============================================================
function getHeatTier(state) {
  const hs = state.heatSystem || {};
  const totalHeat = state.heat || 0;
  if (totalHeat >= 70 || (hs.federal || 0) > 30) return HEAT_TIERS[2]; // federal
  if (totalHeat >= 40 || (hs.city || 0) > 30) return HEAT_TIERS[1]; // city
  return HEAT_TIERS[0]; // local
}

function addTieredHeat(state, amount, source) {
  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;

  // Distribute heat across tiers based on current level
  const tier = getHeatTier(state);
  if (tier.id === 'federal') {
    hs.federal = Math.min(100, (hs.federal || 0) + amount * 0.5);
    hs.city = Math.min(100, (hs.city || 0) + amount * 0.3);
    hs.local = Math.min(100, (hs.local || 0) + amount * 0.2);
  } else if (tier.id === 'city') {
    hs.city = Math.min(100, (hs.city || 0) + amount * 0.6);
    hs.local = Math.min(100, (hs.local || 0) + amount * 0.3);
    hs.federal = Math.min(100, (hs.federal || 0) + amount * 0.1);
  } else {
    hs.local = Math.min(100, (hs.local || 0) + amount * 0.7);
    hs.city = Math.min(100, (hs.city || 0) + amount * 0.2);
    hs.federal = Math.min(100, (hs.federal || 0) + amount * 0.1);
  }

  // Counter-measure mitigation
  const redirect = getCounterMeasureEffect(state, 'heatRedirect');
  if (redirect > 0) {
    hs.local = Math.max(0, hs.local - amount * redirect * 0.5);
    hs.city = Math.max(0, hs.city - amount * redirect * 0.3);
  }
}

// ============================================================
// WIRETAP SYSTEM
// ============================================================
function checkWiretapTriggers(state) {
  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;
  const tier = getHeatTier(state);

  // Only city+ tier can wiretap
  if (tier.id === 'local') return null;

  // Check dealing patterns
  if (hs.consecutiveSameLocation >= 5 && !hasActiveWiretap(state, 'location')) {
    // Wiretap resist check
    const resist = getCounterMeasureEffect(state, 'wiretapResist');
    if (Math.random() > resist) {
      const wiretap = {
        id: 'wt_' + Math.random().toString(36).substr(2, 6),
        type: 'location',
        targetLocation: state.currentLocation,
        placedDay: state.day,
        detected: false,
        evidenceGathered: 0,
      };
      hs.wiretaps.push(wiretap);
      return wiretap;
    }
  }

  return null;
}

function hasActiveWiretap(state, type) {
  const hs = state.heatSystem || {};
  return (hs.wiretaps || []).some(w => w.type === type);
}

// Check if a deal/conversation is being intercepted
function isConversationTapped(state) {
  if (!state.heatSystem) return false;
  const hs = state.heatSystem;
  if (!hs.wiretaps || hs.wiretaps.length === 0) return false;
  // Check if any wiretap targets current location
  const locationTapped = hs.wiretaps.some(w => w.targetLocation === state.currentLocation);
  // Phone taps apply everywhere
  const phoneTapped = hs.wiretaps.some(w => w.type === 'phone');
  // Burner phone reduces phone tap effectiveness
  const burnerActive = getCounterMeasureEffect(state, 'wiretapResist') > 0;
  if (phoneTapped && burnerActive) return Math.random() < 0.3; // 30% still caught
  return locationTapped || phoneTapped;
}

// When a deal happens under wiretap, evidence builds
function onDealWhileTapped(state, drugId, amount, isSelling) {
  if (!state.heatSystem) return null;
  const hs = state.heatSystem;
  if (!isConversationTapped(state)) return null;

  // Each tapped deal adds evidence
  const evidenceGain = Math.min(20, 3 + Math.floor(amount / 10));
  for (const wt of hs.wiretaps) {
    if (wt.targetLocation === state.currentLocation || wt.type === 'phone') {
      wt.evidenceGathered += evidenceGain;
    }
  }

  // Random chance of warning signs
  if (Math.random() < 0.15) {
    const warnings = [
      '📞 Your phone clicks oddly during the call...',
      '📡 You notice a suspicious van parked nearby...',
      '🔊 There\'s a faint echo on the line...',
      '👤 A man in a suit is watching from across the street...',
      '📱 Your burner phone feels warm — battery drain?',
      '🚗 Same dark sedan has been following you all week...',
    ];
    return warnings[Math.floor(Math.random() * warnings.length)];
  }
  return null;
}

function processWiretapsDaily(state) {
  if (!state.heatSystem) return [];
  const hs = state.heatSystem;
  const msgs = [];

  for (const wt of hs.wiretaps) {
    // Wiretaps gather evidence over time
    wt.evidenceGathered += 2 + Math.floor(Math.random() * 3);

    // High evidence triggers investigation escalation
    if (wt.evidenceGathered >= 50 && !wt.detected) {
      // Corrupt cop warning
      if (getCounterMeasureEffect(state, 'raidWarning') > 0 && Math.random() < 0.7) {
        wt.detected = true;
        msgs.push('🤝 Your inside man warns: "They\'ve got a tap on you. Switch it up."');
      }
    }

    if (wt.evidenceGathered >= 100) {
      // Investigation level increase
      if (state.investigation) {
        state.investigation.points = Math.min(100, state.investigation.points + 15);
      }
      hs.federal = Math.min(100, (hs.federal || 0) + 10);
      msgs.push('🕵️ Wiretap evidence compiled. Investigation intensifies!');
      wt.evidenceGathered = 0; // Reset but wiretap continues
    }
  }

  return msgs;
}

// ============================================================
// POLICE CHASE SYSTEM
// ============================================================
function initiateChase(state, encounterType) {
  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;

  const encounter = LE_ENCOUNTERS.find(e => e.id === encounterType);
  if (!encounter) return null;

  const playerVehicle = CHASE_VEHICLES.find(v => v.id === (hs.activeVehicle || 'on_foot')) || CHASE_VEHICLES[0];

  // Police vehicle based on tier
  let policeSpeed, policeHandling;
  if (encounter.tier === 'federal') {
    policeSpeed = 80; policeHandling = 70;
  } else if (encounter.tier === 'city') {
    policeSpeed = 65; policeHandling = 60;
  } else {
    policeSpeed = 55; policeHandling = 50;
  }

  return {
    type: 'chase',
    encounterType: encounter.id,
    encounterName: encounter.name,
    encounterEmoji: encounter.emoji,
    tier: encounter.tier,
    severity: encounter.severity,
    playerVehicle,
    policeSpeed,
    policeHandling,
    round: 0,
    maxRounds: 5,
    distance: 50, // 0 = caught, 100 = escaped
    resolved: false,
  };
}

function resolveChaseRound(state, action, chase) {
  if (!chase || chase.resolved) return null;

  chase.round++;
  const pv = chase.playerVehicle;
  let msg = '';

  // Driving skill bonus
  const drivingSkill = typeof getSkillEffect === 'function' ? getSkillEffect(state, 'drivingMod') || 0 : 0;
  const speedBonus = pv.speed * (1 + drivingSkill);
  const handlingBonus = pv.handling * (1 + drivingSkill);

  if (action === 'floor_it') {
    // Pure speed - compare speeds
    const speedDiff = speedBonus - chase.policeSpeed;
    const roll = (Math.random() - 0.5) * 40;
    chase.distance += speedDiff * 0.3 + roll;
    msg = speedDiff > 0 ? '🏎️ Flooring it! Gaining distance!' : '🚔 They\'re keeping up!';
  } else if (action === 'evade') {
    // Handling-based - try to lose them
    const handlingDiff = handlingBonus - chase.policeHandling;
    const roll = (Math.random() - 0.5) * 30;
    chase.distance += handlingDiff * 0.4 + roll + 10;
    msg = '🔄 Cutting through side streets!';
  } else if (action === 'ram') {
    // Aggressive and risky — cops wise up fast to repeat rammers
    chase.ramCount = (chase.ramCount || 0) + 1;
    const wear = (chase.ramCount - 1) * 6;
    const ramRoll = (Math.random() - 0.5) * 24; // -12..+12
    const gain = Math.max(-12, 15 - wear + ramRoll);
    chase.distance += gain;
    chase.policeSpeed -= 6;
    state.heat = Math.min(100, (state.heat || 0) + 5);
    if (Math.random() < 0.25) {
      state.health = Math.max(1, (state.health || 100) - (4 + Math.floor(Math.random() * 8)));
      msg = '💥 Metal on metal — you took some of that hit too!';
    } else {
      msg = gain > 0 ? '💥 Rammed the cruiser! That\'ll leave a mark!' : '💥 The ram went wrong — they boxed you in!';
    }
  } else if (action === 'bail') {
    // Abandon vehicle and flee on foot — only works if you actually have
    // a vehicle to ditch (no free +20s while already on foot)
    const abandonedId = chase.playerVehicle.id;
    if (abandonedId === 'on_foot') {
      chase.distance -= 5;
      msg = '🏃 Nothing to bail from — you stumble looking for an exit that isn\'t there!';
    } else {
      chase.distance += 20;
      chase.playerVehicle = CHASE_VEHICLES[0]; // on foot
      const hs = state.heatSystem || {};
      const vIdx = (hs.vehicles || []).indexOf(abandonedId);
      if (vIdx >= 0) hs.vehicles.splice(vIdx, 1);
      if (hs.activeVehicle === abandonedId) hs.activeVehicle = 'on_foot';
      msg = '🏃 Bailed from the vehicle! Running on foot!';
    }
  } else if (action === 'surrender') {
    chase.distance = 0;
    chase.resolved = true;
    msg = '🏳️ You surrendered to the police.';
    return { msg, escaped: false, caught: true };
  }

  // Clamp distance
  chase.distance = Math.max(0, Math.min(100, chase.distance));

  // Check resolution
  if (chase.distance >= 100) {
    chase.resolved = true;
    if (!state.heatSystem) state.heatSystem = initHeatState();
    state.heatSystem.totalChases++;
    state.heatSystem.chasesEscaped++;
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', 2);
      adjustRep(state, 'heatSignature', 3);
    }
    return { msg: msg + ' 🏁 You escaped!', escaped: true, caught: false };
  }

  if (chase.distance <= 0 || chase.round >= chase.maxRounds) {
    chase.resolved = true;
    if (!state.heatSystem) state.heatSystem = initHeatState();
    state.heatSystem.totalChases++;
    state.heatSystem.chasesFailed++;
    return { msg: msg + ' 🚔 They caught you!', escaped: false, caught: true };
  }

  return {
    msg: msg + ` Distance: ${Math.round(chase.distance)}%`,
    escaped: false, caught: false,
    round: chase.round, maxRounds: chase.maxRounds, distance: chase.distance,
  };
}

// ============================================================
// LE ENCOUNTER RESOLUTION (the pendingEvent set by daily processing)
// ============================================================
function getLEBribeCost(state, ev) {
  const tier = HEAT_TIERS.find(t => t.id === ev.tier) || HEAT_TIERS[0];
  return Math.round(tier.effects.bailCost * (0.6 + ev.severity * 0.2));
}

function resolveLEEncounter(state, action) {
  const ev = state.pendingEvent;
  if (!ev || ev.type !== 'le_encounter') return null;
  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;
  const carrying = Object.values(state.inventory || {}).reduce((a, b) => a + (b || 0), 0);
  const out = { msgs: [], arrested: false, chase: false, goToCourt: false };

  if (action === 'bribe') {
    const cost = getLEBribeCost(state, ev);
    if (state.cash < cost) {
      out.msgs.push(`💸 A bribe here runs $${cost.toLocaleString()} — you can't cover it. They notice you checking your pockets.`);
      action = 'comply';
    } else {
      state.cash -= cost;
      let chance = 0.75 + (getCounterMeasureEffect(state, 'evidenceDestroy') > 0 ? 0.15 : 0);
      if (ev.tier === 'federal') chance -= 0.30; // feds don't take envelopes lightly
      if (Math.random() < chance) {
        out.msgs.push(`🤝 $${cost.toLocaleString()} changes hands. "Drive safe." They pull away.`);
        addTieredHeat(state, 4, 'bribe');
        if (state.politics) state.politics.totalBribesPaid = (state.politics.totalBribesPaid || 0) + cost;
        state.pendingEvent = null;
        return out;
      }
      out.msgs.push('🚔 He pockets the cash AND calls it in. Wrong cop to bribe.');
      state.heat = Math.min(100, (state.heat || 0) + 5);
      addTieredHeat(state, 6, 'failed_bribe');
      action = 'comply';
    }
  }

  if (action === 'run') {
    // Chance to slip away before it becomes a chase
    let escape = (1 - ev.escapeDifficulty) * 0.6;
    if (typeof getCharacterPassiveValue === 'function') escape += getCharacterPassiveValue(state, 'escapeChance') || 0;
    if (typeof getSkillEffect === 'function') escape += (getSkillEffect(state, 'chaseEscape') || 0) * 0.5;
    if (Math.random() < Math.max(0.05, Math.min(0.9, escape))) {
      out.msgs.push('🏃 You slip through an alley before they can box you in. Heart pounding, but free.');
      addTieredHeat(state, 6, 'fled');
      state.heat = Math.min(100, (state.heat || 0) + 4);
      state.pendingEvent = null;
      return out;
    }
    hs.activeChase = initiateChase(state, ev.encounterType);
    state.pendingEvent = null;
    out.chase = true;
    out.msgs.push(`🚨 They're on you! ${hs.activeChase.playerVehicle.emoji} The chase is on!`);
    return out;
  }

  // Comply — submit to the stop/search
  state.pendingEvent = null;
  if (carrying <= 0) {
    // RICO doesn't need your pockets — the case is the enterprise
    if (ev.severity >= 6 && state.investigation && (state.investigation.level || 0) >= 2) {
      out.arrested = true;
      out.goToCourt = true;
      out.msgs.push(`${ev.emoji} ${ev.encounterName} — "We don't need what's in your pockets. We have EVERYTHING." You're going in.`);
      if (typeof initCourtCase === 'function') initCourtCase(state);
      return out;
    }
    // A DEA raid tosses your local stash even if you're walking around clean
    if (ev.severity >= 5 && state.stashes && state.stashes[state.currentLocation]) {
      const stash = state.stashes[state.currentLocation];
      let stashSeized = 0;
      for (const id of Object.keys(stash)) {
        const take = Math.ceil((stash[id] || 0) * 0.5);
        if (take > 0) { stash[id] -= take; stashSeized += take; if (stash[id] <= 0) delete stash[id]; }
      }
      if (stashSeized > 0) {
        addTieredHeat(state, 15, 'stash_raid');
        state.heat = Math.min(100, (state.heat || 0) + 10);
        out.msgs.push(`${ev.emoji} They hit your stash house — ${stashSeized} units seized. Your pockets were clean; your walls weren't.`);
        if (stashSeized >= 50 && typeof initCourtCase === 'function') {
          out.arrested = true; out.goToCourt = true;
          out.msgs.push('⚖️ That much weight in your name is a case. Cuffs.');
          initCourtCase(state);
        }
        return out;
      }
    }
    if (ev.severity <= 2) {
      out.msgs.push('👮 They pat you down, run your name, find nothing. "Stay out of trouble." Local heat cools a little.');
      hs.local = Math.max(0, (hs.local || 0) - 3);
    } else {
      out.msgs.push('👮 Clean this time. They log the stop and watch you walk — no heat relief when THEY come looking.');
    }
    return out;
  }
  if (ev.severity <= 2) {
    // Street-level shakedown: lose a cut of product plus a "processing fee"
    let seized = 0;
    for (const id of Object.keys(state.inventory)) {
      const qty = state.inventory[id] || 0;
      const take = Math.ceil(qty * (0.25 + ev.severity * 0.15));
      state.inventory[id] = qty - take;
      seized += take;
      if (state.inventory[id] <= 0) delete state.inventory[id];
    }
    const tier = HEAT_TIERS.find(t => t.id === ev.tier) || HEAT_TIERS[0];
    const fine = Math.min(state.cash, tier.effects.bailCost);
    state.cash = Math.max(0, state.cash - fine);
    addTieredHeat(state, 8, 'search');
    state.heat = Math.min(100, (state.heat || 0) + 5);
    out.msgs.push(`👮 They find your stash. ${seized} units confiscated plus a $${fine.toLocaleString()} "processing fee". It could have been worse.`);
    return out;
  }
  // Severity 3+ while holding: full arrest, straight to court
  out.arrested = true;
  out.goToCourt = true;
  out.msgs.push(`${ev.emoji} ${ev.encounterName} — hands behind your back. You're going in.`);
  if (typeof initCourtCase === 'function') initCourtCase(state);
  return out;
}

// Wraps resolveChaseRound for the active chase; on catch → court
function resolveActiveChase(state, action) {
  const hs = state.heatSystem;
  if (!hs || !hs.activeChase) return null;
  const result = resolveChaseRound(state, action, hs.activeChase);
  if (result && (result.escaped || result.caught)) {
    hs.activeChase = null;
    if (result.caught) {
      addTieredHeat(state, 12, 'chase_caught');
      state.heat = Math.min(100, (state.heat || 0) + 8);
      if (typeof initCourtCase === 'function') initCourtCase(state, { resisted: true });
      result.goToCourt = true;
    } else {
      addTieredHeat(state, 8, 'chase_escaped');
      state.heat = Math.min(100, (state.heat || 0) + 6);
    }
  }
  return result;
}

// ============================================================
// COUNTER-MEASURES
// ============================================================
function buyCounterMeasure(state, measureId) {
  const measure = COUNTER_MEASURES.find(m => m.id === measureId);
  if (!measure) return { success: false, msg: 'Unknown counter-measure' };

  if (state.cash < measure.cost) return { success: false, msg: `Need $${measure.cost.toLocaleString()}` };

  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;

  // Check if already active
  if (hs.counterMeasures.some(cm => cm.id === measureId && state.day < cm.expiresDay)) {
    return { success: false, msg: 'Already active' };
  }

  state.cash -= measure.cost;

  if (measure.effect.removeWiretaps) {
    // Bug sweep removes all wiretaps
    const removed = hs.wiretaps.length;
    hs.wiretaps = [];
    return { success: true, msg: `🔍 Bug sweep complete! Removed ${removed} surveillance device${removed !== 1 ? 's' : ''}.` };
  }

  hs.counterMeasures.push({
    id: measureId,
    name: measure.name,
    emoji: measure.emoji,
    effect: measure.effect,
    purchasedDay: state.day,
    expiresDay: measure.duration > 0 ? state.day + measure.duration : state.day + 9999,
  });

  return { success: true, msg: `${measure.emoji} ${measure.name} activated! Duration: ${measure.duration > 0 ? measure.duration + ' days' : 'permanent'}` };
}

function getCounterMeasureEffect(state, effectKey) {
  if (!state.heatSystem) return 0;
  let total = 0;
  for (const cm of state.heatSystem.counterMeasures || []) {
    if (state.day >= cm.expiresDay) continue;
    if (cm.effect[effectKey]) total += cm.effect[effectKey];
  }
  return Math.min(1, total); // Cap at 100%
}

// ============================================================
// BUY VEHICLE
// ============================================================
function buyChaseVehicle(state, vehicleId) {
  const vehicle = CHASE_VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return { success: false, msg: 'Unknown vehicle' };
  if (!vehicle.cost) return { success: false, msg: 'Can\'t buy this' };

  if (state.cash < vehicle.cost) return { success: false, msg: `Need $${vehicle.cost.toLocaleString()}` };

  if (!state.heatSystem) state.heatSystem = initHeatState();
  if (state.heatSystem.vehicles.includes(vehicleId)) return { success: false, msg: 'Already own this' };

  state.cash -= vehicle.cost;
  state.heatSystem.vehicles.push(vehicleId);

  return { success: true, msg: `${vehicle.emoji} Purchased ${vehicle.name}!` };
}

function setActiveChaseVehicle(state, vehicleId) {
  if (!state.heatSystem) return { success: false, msg: 'No vehicles' };
  if (!state.heatSystem.vehicles.includes(vehicleId)) return { success: false, msg: 'Don\'t own that' };
  state.heatSystem.activeVehicle = vehicleId;
  return { success: true, msg: `Now using ${CHASE_VEHICLES.find(v => v.id === vehicleId)?.name || vehicleId}` };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processHeatSystemDaily(state) {
  if (!state.heatSystem) state.heatSystem = initHeatState();
  const hs = state.heatSystem;
  const msgs = [];

  // A stop you ignored doesn't wait around — they close in and it resolves
  // as compliance (also frees the slot so future encounters can fire)
  if (state.pendingEvent && state.pendingEvent.type === 'le_encounter' && (state.pendingEvent.day || 0) < state.day) {
    msgs.push('🚔 You couldn\'t stall them forever — they moved in.');
    const auto = resolveLEEncounter(state, 'comply');
    if (auto && auto.msgs) msgs.push(...auto.msgs);
  }
  // Old saves: dead NG+ events squatting the slot get requeued for the UI
  if (state.pendingEvent && state.pendingEvent.subtype === 'ng_plus_event') {
    if (!state.queuedEvents) state.queuedEvents = [];
    state.queuedEvents.push(state.pendingEvent);
    state.pendingEvent = null;
  }

  // Heat decay per tier (local decays fastest, federal slowest)
  const ngMod = typeof getNgPlusMod === 'function' ? getNgPlusMod(state, 'heatDecayRate', 1) : 1;
  hs.local = Math.max(0, (hs.local || 0) - 2 * ngMod);
  hs.city = Math.max(0, (hs.city || 0) - 1 * ngMod);
  hs.federal = Math.max(0, (hs.federal || 0) - 0.3 * ngMod);

  // Expire counter-measures
  hs.counterMeasures = (hs.counterMeasures || []).filter(cm => state.day < cm.expiresDay);

  // Process wiretaps
  const wtMsgs = processWiretapsDaily(state);
  msgs.push(...wtMsgs);

  // Random law enforcement encounter check (never during the tutorial)
  const tutState = typeof getTutorialState === 'function' ? getTutorialState() : null;
  if (tutState && tutState.active && !tutState.completed) return msgs;
  const tier = getHeatTier(state);
  const encounters = LE_ENCOUNTERS.filter(e => {
    if (e.tier === 'federal' && tier.id !== 'federal') return false;
    if (e.tier === 'city' && tier.id === 'local') return false;
    return true;
  });

  for (const enc of encounters) {
    let chance = enc.chance * ((state.heat || 0) / 50);
    // Counter-measure mitigation
    const searchResist = getCounterMeasureEffect(state, 'searchResist');
    chance *= (1 - searchResist);
    // Reputation: a trashed public image means more stops
    if (typeof getRepEffects === 'function') {
      const repFxP = getRepEffects(state);
      if (repFxP.policeAttentionMod > 0) chance *= (1 + repFxP.policeAttentionMod);
    }
    // Raid warning might prevent it
    if (enc.severity >= 4 && getCounterMeasureEffect(state, 'raidWarning') > 0) {
      if (Math.random() < 0.6) {
        msgs.push(`🤝 Your contact warns: "${enc.name} planned at your location. Laying low."`);
        continue;
      }
    }

    if (Math.random() < chance) {
      // Encounter happens! This will be handled by the event system
      msgs.push(`${enc.emoji} ${enc.name}! ${enc.desc}`);
      // Add to pending events in game engine
      if (typeof state.pendingEvent === 'undefined' || state.pendingEvent === null) {
        state.pendingEvent = {
          type: 'le_encounter',
          encounterType: enc.id,
          encounterName: enc.name,
          emoji: enc.emoji,
          tier: enc.tier,
          severity: enc.severity,
          escapeDifficulty: enc.escapeDifficulty,
          day: state.day,
        };
      }
      break; // Only one encounter per day
    }
  }

  // Track dealing patterns for wiretap triggers — only days you actually
  // dealt count toward the pattern; a quiet day breaks it
  if (hs.dealtToday && hs.lastDealLocation === state.currentLocation) {
    hs.consecutiveSameLocation = (hs.consecutiveSameLocation || 0) + 1;
  } else if (hs.dealtToday) {
    hs.consecutiveSameLocation = 1;
  } else {
    hs.consecutiveSameLocation = 0;
  }
  hs.dealtToday = false;

  // Check wiretap triggers
  const newWiretap = checkWiretapTriggers(state);
  if (newWiretap) {
    msgs.push('🕵️ Intelligence suggests increased surveillance in your area...');
  }

  return msgs;
}

// ============================================================
// RENDER HEAT TOOLTIP
// ============================================================
function renderHeatTooltipHTML(state) {
  if (!state.heatSystem) return '';
  const hs = state.heatSystem;
  const tier = getHeatTier(state);

  const wiretapCount = (hs.wiretaps || []).length;
  const cmCount = (hs.counterMeasures || []).filter(cm => state.day < cm.expiresDay).length;

  return `<div class="rep-tooltip" style="min-width:200px">
    <div style="font-weight:bold;color:${tier.color};margin-bottom:0.3rem">${tier.emoji} ${tier.name}</div>
    <div>👮 Local: ${Math.round(hs.local || 0)}/100</div>
    <div>🕵️ City: ${Math.round(hs.city || 0)}/100</div>
    <div>🏛️ Federal: ${Math.round(hs.federal || 0)}/100</div>
    ${wiretapCount > 0 ? `<div style="color:#ff4444">📡 Active wiretaps: ${wiretapCount}</div>` : ''}
    ${cmCount > 0 ? `<div style="color:#00ff88">🛡️ Counter-measures: ${cmCount}</div>` : ''}
  </div>`;
}
