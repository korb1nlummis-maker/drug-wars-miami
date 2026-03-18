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
    // Aggressive - damage but slow
    chase.distance += 15;
    chase.policeSpeed -= 10;
    state.heat = Math.min(100, (state.heat || 0) + 5);
    msg = '💥 Rammed the cruiser! That\'ll leave a mark!';
  } else if (action === 'bail') {
    // Abandon vehicle and flee on foot
    chase.distance += 20;
    chase.playerVehicle = CHASE_VEHICLES[0]; // on foot
    // Lose the vehicle
    const hs = state.heatSystem || {};
    const vIdx = (hs.vehicles || []).indexOf(chase.playerVehicle.id);
    if (vIdx >= 0) hs.vehicles.splice(vIdx, 1);
    msg = '🏃 Bailed from the vehicle! Running on foot!';
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
function buyVehicle(state, vehicleId) {
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

function setActiveVehicle(state, vehicleId) {
  if (!state.heatSystem) return { success: false, msg: 'No vehicles' };
  if (!state.heatSystem.vehicles.includes(vehicleId)) return { success: false, msg: 'Don\'t own that' };
  state.heatSystem.vehicles; // exists
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

  // Random law enforcement encounter check
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
        };
      }
      break; // Only one encounter per day
    }
  }

  // Track dealing patterns for wiretap triggers
  if (hs.lastDealLocation === state.currentLocation) {
    hs.consecutiveSameLocation = (hs.consecutiveSameLocation || 0) + 1;
  } else {
    hs.consecutiveSameLocation = 0;
  }

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
