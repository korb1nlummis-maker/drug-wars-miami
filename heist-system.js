// heist-system.js — Drug Wars: Miami Vice Edition
// Heist planning, execution, escape, and aftermath system

// ============================================================
// GLOBAL CONST ARRAYS
// ============================================================

const HEIST_TYPES = [
  {
    id: 'stash_house', name: 'Rival Stash House Raid', emoji: '🏚️',
    difficulty: 2, rewardMin: 20000, rewardMax: 100000, rewardType: 'cash_and_product',
    crewMin: 3, crewMax: 5, unlockAct: 1,
    planningDaysMin: 1, planningDaysMax: 3,
    executionRounds: 3, escapeRounds: 2,
    baseSuccessRate: 0.6, heatGenerated: 15,
    desc: 'Hit a rival stash house. Quick and dirty.',
    scoutingDetails: ['guard_count', 'entry_points', 'alarm_type'],
    specialRisks: ['armed_guards', 'booby_traps'],
    factionDamage: 10
  },
  {
    id: 'bank_robbery', name: 'Bank Robbery', emoji: '🏦',
    difficulty: 4, rewardMin: 100000, rewardMax: 500000, rewardType: 'cash',
    crewMin: 5, crewMax: 8, unlockAct: 2,
    planningDaysMin: 3, planningDaysMax: 5,
    executionRounds: 5, escapeRounds: 3,
    baseSuccessRate: 0.4, heatGenerated: 40,
    desc: 'Rob a bank vault. High risk, high reward. 10-minute window.',
    scoutingDetails: ['vault_type', 'alarm_system', 'guard_rotation', 'camera_positions'],
    specialRisks: ['dye_packs', 'gps_trackers', 'silent_alarm', 'time_lock'],
    factionDamage: 0
  },
  {
    id: 'armored_car', name: 'Armored Car Intercept', emoji: '🚛',
    difficulty: 3, rewardMin: 50000, rewardMax: 200000, rewardType: 'cash',
    crewMin: 4, crewMax: 6, unlockAct: 2,
    planningDaysMin: 2, planningDaysMax: 4,
    executionRounds: 3, escapeRounds: 3,
    baseSuccessRate: 0.5, heatGenerated: 30,
    desc: 'Intercept an armored car on its route. 5 minutes max.',
    scoutingDetails: ['route_schedule', 'vehicle_armor', 'escort_detail'],
    specialRisks: ['armed_escorts', 'radio_distress', 'reinforced_locks'],
    factionDamage: 0
  },
  {
    id: 'drug_shipment', name: 'Drug Shipment Hijack', emoji: '📦',
    difficulty: 3, rewardMin: 50000, rewardMax: 500000, rewardType: 'product',
    crewMin: 4, crewMax: 8, unlockAct: 2,
    planningDaysMin: 2, planningDaysMax: 5,
    executionRounds: 4, escapeRounds: 2,
    baseSuccessRate: 0.5, heatGenerated: 20,
    desc: 'Hijack a rival drug shipment during transport. Major faction damage.',
    scoutingDetails: ['shipment_contents', 'transport_method', 'guard_detail', 'rival_faction'],
    specialRisks: ['rival_retaliation', 'decoy_shipment', 'armed_convoy'],
    factionDamage: 25
  },
  {
    id: 'jewelry_store', name: 'Jewelry Store', emoji: '💎',
    difficulty: 2, rewardMin: 30000, rewardMax: 150000, rewardType: 'goods',
    crewMin: 3, crewMax: 4, unlockAct: 1,
    planningDaysMin: 1, planningDaysMax: 3,
    executionRounds: 2, escapeRounds: 2,
    baseSuccessRate: 0.65, heatGenerated: 20,
    desc: 'Smash and grab or after-hours job. Need a fence for the goods.',
    scoutingDetails: ['display_layout', 'safe_location', 'alarm_type'],
    specialRisks: ['silent_alarm', 'reinforced_glass', 'off_duty_cop'],
    factionDamage: 0,
    fenceRate: { min: 0.5, max: 0.7 }
  },
  {
    id: 'casino_vault', name: 'Casino Vault', emoji: '🎰',
    difficulty: 5, rewardMin: 500000, rewardMax: 2000000, rewardType: 'cash',
    crewMin: 6, crewMax: 10, unlockAct: 3,
    planningDaysMin: 7, planningDaysMax: 14,
    executionRounds: 6, escapeRounds: 4,
    baseSuccessRate: 0.3, heatGenerated: 50,
    desc: 'Hit the casino vault. Insider contact, power grid, multi-phase operation.',
    scoutingDetails: ['floor_layout', 'vault_specs', 'power_grid', 'shift_changes', 'camera_blind_spots'],
    specialRisks: ['insider_betrayal', 'backup_generators', 'armed_security', 'mob_connections'],
    factionDamage: 5,
    requiresInsider: true
  },
  {
    id: 'evidence_room', name: 'Evidence Room Raid', emoji: '🚔',
    difficulty: 5, rewardMin: 0, rewardMax: 0, rewardType: 'investigation_reduction',
    crewMin: 4, crewMax: 6, unlockAct: 3,
    planningDaysMin: 5, planningDaysMax: 10,
    executionRounds: 4, escapeRounds: 3,
    baseSuccessRate: 0.35, heatGenerated: 60,
    desc: 'Infiltrate a police station evidence room. Reduce investigation by 50%.',
    scoutingDetails: ['station_layout', 'shift_schedule', 'evidence_location', 'corrupt_contacts'],
    specialRisks: ['undercover_cops', 'internal_affairs', 'locked_down'],
    factionDamage: 0,
    requiresCorruptCop: true,
    investigationReduction: 0.5
  },
  {
    id: 'federal_reserve', name: 'Federal Reserve', emoji: '🏛️',
    difficulty: 6, rewardMin: 5000000, rewardMax: 10000000, rewardType: 'cash',
    crewMin: 8, crewMax: 12, unlockAct: 99,
    planningDaysMin: 21, planningDaysMax: 60,
    executionRounds: 8, escapeRounds: 5,
    baseSuccessRate: 0.15, heatGenerated: 100,
    desc: 'The ultimate heist. Months of planning. Legendary.',
    scoutingDetails: ['building_blueprints', 'security_protocols', 'vault_mechanics', 'guard_rotations', 'federal_response_time', 'escape_routes'],
    specialRisks: ['federal_agents', 'military_response', 'total_lockdown', 'gps_tracked_bills', 'helicopter_pursuit'],
    factionDamage: 0,
    requiresNGPlus: true,
    requiresAllSkills5: true
  }
];

const HEIST_EQUIPMENT = [
  {
    id: 'walkie_talkies', name: 'Walkie Talkies', emoji: '📻',
    cost: 500, effect: 'coordination', bonus: 0.05,
    desc: '+5% coordination during execution.'
  },
  {
    id: 'getaway_vehicle', name: 'Getaway Vehicle', emoji: '🚗',
    cost: 2000, effect: 'escape', bonus: 0.15,
    desc: '+15% escape chance.'
  },
  {
    id: 'thermal_drill', name: 'Thermal Drill', emoji: '🔥',
    cost: 10000, effect: 'vault', bonus: 2,
    desc: '-2 vault cracking rounds.'
  },
  {
    id: 'emp_device', name: 'EMP Device', emoji: '⚡',
    cost: 15000, effect: 'electronics', bonus: 1.0,
    desc: 'Disables alarms and cameras for the operation.'
  },
  {
    id: 'inside_man', name: 'Inside Man', emoji: '🕵️',
    cost: 25000, effect: 'insider', bonus: 0.20,
    desc: '+20% success rate. Reduces planning days by 1.'
  },
  {
    id: 'blueprints', name: 'Blueprints', emoji: '📐',
    cost: 5000, effect: 'intel', bonus: 0.10,
    desc: '+10% success for the specific target.'
  },
  {
    id: 'hacking_rig', name: 'Hacking Rig', emoji: '💻',
    cost: 20000, effect: 'digital', bonus: 1.0,
    desc: 'Bypass digital security systems.'
  },
  {
    id: 'disguise_kit', name: 'Disguise Kit', emoji: '🎭',
    cost: 3000, effect: 'infiltration', bonus: 0.10,
    desc: '+10% infiltration success.'
  }
];

const HEIST_PHASES = ['planning', 'ready', 'executing', 'escaping', 'complete', 'failed'];

const HEIST_CREW_ROLES = ['leader', 'muscle', 'driver', 'hacker', 'lookout', 'demolitions', 'inside_contact', 'sniper'];

const HEIST_COMPLICATIONS = [
  { id: 'silent_alarm', name: 'Silent Alarm Triggered', severity: 2, desc: 'A silent alarm was tripped. Police en route.' },
  { id: 'guard_patrol', name: 'Unexpected Guard Patrol', severity: 1, desc: 'A guard appeared where none was expected.' },
  { id: 'vault_reinforced', name: 'Reinforced Vault', severity: 2, desc: 'The vault is tougher than expected. Extra round needed.' },
  { id: 'crew_injury', name: 'Crew Member Injured', severity: 3, desc: 'One of your crew took a hit.' },
  { id: 'civilian_witness', name: 'Civilian Witness', severity: 1, desc: 'A civilian saw everything. Heat will be higher.' },
  { id: 'equipment_malfunction', name: 'Equipment Malfunction', severity: 2, desc: 'A piece of equipment failed at the worst time.' },
  { id: 'rival_ambush', name: 'Rival Ambush', severity: 3, desc: 'Rivals were tipped off. Ambush!' },
  { id: 'police_early', name: 'Early Police Response', severity: 3, desc: 'Cops arrived faster than expected.' },
  { id: 'locked_escape', name: 'Escape Route Blocked', severity: 2, desc: 'Primary escape route is compromised.' },
  { id: 'insider_betrayal', name: 'Insider Betrayal', severity: 4, desc: 'Your inside man flipped. It\'s a setup.' }
];

const HEIST_COOLDOWN_DAYS = 3;
const MAX_ACTIVE_HEISTS = 1;
const HEIST_XP_MULTIPLIER = 50;

// ============================================================
// STATE INITIALIZATION
// ============================================================

function initHeistState() {
  return {
    activeHeist: null,
    completedHeists: [],
    failedHeists: [],
    totalHeistProfit: 0,
    heistCooldown: 0,
    availableHeists: [],
    heistHistory: [],
    legendaryHeistCompleted: false
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================

function processHeistsDaily(state) {
  const hs = state.heists;
  if (!hs) return;

  if (hs.heistCooldown > 0) {
    hs.heistCooldown--;
  }

  if (hs.activeHeist && hs.activeHeist.phase === 'planning') {
    if (hs.activeHeist.planningDaysRemaining > 0) {
      hs.activeHeist.planningDaysRemaining--;
      hs.activeHeist.scoutingComplete = hs.activeHeist.planningDaysRemaining <= 0;
      if (hs.activeHeist.scoutingComplete) {
        hs.activeHeist.phase = 'ready';
      }
    }
  }

  // Refresh available heists every 7 days
  if (!hs._lastHeistRefresh) {
    hs._lastHeistRefresh = 0;
  }
  hs._lastHeistRefresh++;
  if (hs._lastHeistRefresh >= 7) {
    hs.availableHeists = generateAvailableHeists(state);
    hs._lastHeistRefresh = 0;
  }

  // If no available heists, populate initial set
  if (hs.availableHeists && hs.availableHeists.length === 0) {
    hs.availableHeists = generateAvailableHeists(state);
  }
}

// ============================================================
// HEIST AVAILABILITY
// ============================================================

function generateAvailableHeists(state) {
  const eligible = getAvailableHeists(state);
  const count = Math.min(eligible.length, 3 + Math.floor(Math.random() * 2));
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(ht => ({
    heistTypeId: ht.id,
    generatedReward: randomBetween(ht.rewardMin, ht.rewardMax),
    targetInfo: generateTargetInfo(ht),
    expiresIn: 5 + Math.floor(Math.random() * 5)
  }));
}

function getAvailableHeists(state) {
  const currentAct = state.currentAct || 1;
  const isNGPlus = state.isNGPlus || false;
  const skills = state.skills || {};

  return HEIST_TYPES.filter(ht => {
    if (ht.unlockAct > currentAct && ht.unlockAct !== 99) return false;
    if (ht.requiresNGPlus && !isNGPlus) return false;
    if (ht.requiresAllSkills5) {
      const allSkillsAbove5 = Object.values(skills).every(v => v >= 5);
      if (!allSkillsAbove5) return false;
    }
    if (state.heistCooldown > 0) return false;
    if (state.activeHeist) return false;
    return true;
  });
}

function generateTargetInfo(heistType) {
  const info = {
    location: randomChoice(['little_haiti', 'overtown', 'wynwood', 'little_havana', 'coconut_grove', 'south_beach', 'downtown', 'coral_gables']),
    guards: heistType.crewMin + Math.floor(Math.random() * 4),
    alarmLevel: Math.floor(Math.random() * (heistType.difficulty + 1)),
    securityRating: heistType.difficulty + Math.floor(Math.random() * 2)
  };

  if (heistType.id === 'bank_robbery') {
    info.vaultType = randomChoice(['standard', 'reinforced', 'time_locked']);
    info.hasAlarm = true;
    info.windowMinutes = 10;
  } else if (heistType.id === 'armored_car') {
    info.routeLength = 3 + Math.floor(Math.random() * 5);
    info.vehicleArmor = randomChoice(['light', 'medium', 'heavy']);
    info.maxMinutes = 5;
  } else if (heistType.id === 'drug_shipment') {
    info.shipmentValue = randomBetween(50000, 500000);
    info.rivalFaction = randomChoice(['colombian_cartel', 'haitian_posse', 'cuban_syndicate', 'biker_gang']);
  } else if (heistType.id === 'jewelry_store') {
    info.hasReinforcedGlass = Math.random() > 0.5;
    info.afterHoursAccess = Math.random() > 0.6;
  } else if (heistType.id === 'casino_vault') {
    info.casinoName = randomChoice(['The Golden Palm', 'Starlight Casino', 'Flamingo Royale', 'Neptune\'s Den']);
    info.vaultDepth = randomChoice(['basement_1', 'basement_2', 'sub_basement']);
    info.hasBackupGenerator = true;
  } else if (heistType.id === 'evidence_room') {
    info.stationPrecinct = randomBetween(1, 12);
    info.evidenceWeight = randomChoice(['light', 'moderate', 'heavy']);
  } else if (heistType.id === 'federal_reserve') {
    info.securityTier = 'maximum';
    info.federalResponseMinutes = 4;
    info.vaultLayers = 3;
  }

  return info;
}

// ============================================================
// HEIST PLANNING
// ============================================================

function startHeistPlanning(state, heistId) {
  if (state.activeHeist) {
    return { success: false, message: 'Already have an active heist.' };
  }
  if (state.heistCooldown > 0) {
    return { success: false, message: `On cooldown. ${state.heistCooldown} days remaining.` };
  }

  const heistType = HEIST_TYPES.find(h => h.id === heistId);
  if (!heistType) {
    return { success: false, message: 'Unknown heist type.' };
  }

  const available = state.availableHeists.find(a => a.heistTypeId === heistId);
  if (!available) {
    return { success: false, message: 'This heist is not currently available.' };
  }

  const planningDays = randomBetween(heistType.planningDaysMin, heistType.planningDaysMax);

  state.activeHeist = {
    heistId: heistType.id,
    heistName: heistType.name,
    phase: 'planning',
    planningDaysRemaining: planningDays,
    planningDaysTotal: planningDays,
    scoutingComplete: false,
    equipment: [],
    assignedCrew: [],
    targetInfo: available.targetInfo,
    executionProgress: 0,
    executionRoundsTotal: heistType.executionRounds,
    escapeProgress: 0,
    escapeRoundsTotal: heistType.escapeRounds,
    lootCollected: 0,
    estimatedReward: available.generatedReward,
    casualtiesTaken: 0,
    complications: [],
    roundResults: [],
    startedDay: state.currentDay || 0
  };

  // Remove from available list
  state.availableHeists = state.availableHeists.filter(a => a.heistTypeId !== heistId);

  return { success: true, message: `Planning begun for ${heistType.name}. ${planningDays} days of scouting required.` };
}

function buyHeistEquipment(state, equipId) {
  if (!state.activeHeist) {
    return { success: false, message: 'No active heist to equip.' };
  }
  if (state.activeHeist.phase !== 'planning' && state.activeHeist.phase !== 'ready') {
    return { success: false, message: 'Can only buy equipment during planning/ready phase.' };
  }

  const equipment = HEIST_EQUIPMENT.find(e => e.id === equipId);
  if (!equipment) {
    return { success: false, message: 'Unknown equipment.' };
  }

  if (state.activeHeist.equipment.find(e => e.id === equipId)) {
    return { success: false, message: 'Already have this equipment.' };
  }

  const cash = state.cash || 0;
  if (cash < equipment.cost) {
    return { success: false, message: `Not enough cash. Need $${equipment.cost}, have $${cash}.` };
  }

  state.cash = (state.cash || 0) - equipment.cost;
  state.activeHeist.equipment.push({ ...equipment });

  // Inside Man reduces planning days
  if (equipId === 'inside_man' && state.activeHeist.planningDaysRemaining > 1) {
    state.activeHeist.planningDaysRemaining = Math.max(0, state.activeHeist.planningDaysRemaining - 1);
    if (state.activeHeist.planningDaysRemaining <= 0) {
      state.activeHeist.scoutingComplete = true;
      state.activeHeist.phase = 'ready';
    }
  }

  return { success: true, message: `Purchased ${equipment.name} for $${equipment.cost}.` };
}

function assignHeistCrew(state, crewIndices) {
  if (!state.activeHeist) {
    return { success: false, message: 'No active heist.' };
  }

  const heistType = HEIST_TYPES.find(h => h.id === state.activeHeist.heistId);
  if (!heistType) {
    return { success: false, message: 'Invalid heist type.' };
  }

  if (crewIndices.length < heistType.crewMin) {
    return { success: false, message: `Need at least ${heistType.crewMin} crew members. Assigned ${crewIndices.length}.` };
  }
  if (crewIndices.length > heistType.crewMax) {
    return { success: false, message: `Maximum ${heistType.crewMax} crew members for this heist.` };
  }

  const crew = state.crew || [];
  const assigned = [];
  for (const idx of crewIndices) {
    if (idx < 0 || idx >= crew.length) {
      return { success: false, message: `Invalid crew index: ${idx}.` };
    }
    if (crew[idx].injured || crew[idx].dead) {
      return { success: false, message: `${crew[idx].name} is unavailable.` };
    }
    assigned.push({ ...crew[idx], originalIndex: idx });
  }

  state.activeHeist.assignedCrew = assigned;
  return { success: true, message: `Assigned ${assigned.length} crew members to the heist.` };
}

function advanceHeistPlanning(state) {
  if (!state.activeHeist || state.activeHeist.phase !== 'planning') {
    return { success: false, message: 'No heist in planning phase.' };
  }

  state.activeHeist.planningDaysRemaining--;

  const heistType = HEIST_TYPES.find(h => h.id === state.activeHeist.heistId);
  const scoutIndex = state.activeHeist.planningDaysTotal - state.activeHeist.planningDaysRemaining - 1;
  const details = heistType.scoutingDetails || [];

  let discovered = null;
  if (scoutIndex < details.length) {
    discovered = details[scoutIndex];
  }

  if (state.activeHeist.planningDaysRemaining <= 0) {
    state.activeHeist.scoutingComplete = true;
    state.activeHeist.phase = 'ready';
    return { success: true, message: 'Scouting complete. Heist is ready to execute.', discovered };
  }

  return {
    success: true,
    message: `Day of scouting done. ${state.activeHeist.planningDaysRemaining} days remaining.`,
    discovered
  };
}

// ============================================================
// HEIST EXECUTION
// ============================================================

function executeHeist(state) {
  if (!state.activeHeist) {
    return { success: false, message: 'No active heist.' };
  }
  if (state.activeHeist.phase !== 'ready') {
    return { success: false, message: 'Heist is not ready for execution.' };
  }

  const heistType = HEIST_TYPES.find(h => h.id === state.activeHeist.heistId);
  if (!heistType) {
    return { success: false, message: 'Invalid heist type.' };
  }

  if (state.activeHeist.assignedCrew.length < heistType.crewMin) {
    return { success: false, message: `Need at least ${heistType.crewMin} crew assigned.` };
  }

  state.activeHeist.phase = 'executing';
  state.activeHeist.executionProgress = 0;

  const results = [];
  let heistAlive = true;

  for (let round = 0; round < heistType.executionRounds && heistAlive; round++) {
    const roundResult = resolveHeistRound(state);
    results.push(roundResult);
    if (roundResult.heistFailed) {
      heistAlive = false;
    }
  }

  if (heistAlive) {
    state.activeHeist.phase = 'escaping';
    const escapeResult = resolveHeistEscape(state);
    results.push(escapeResult);

    if (escapeResult.escaped) {
      return resolveHeistAftermath(state, true, results);
    } else {
      return resolveHeistAftermath(state, false, results);
    }
  } else {
    return resolveHeistAftermath(state, false, results);
  }
}

function resolveHeistRound(state) {
  const heist = state.activeHeist;
  const heistType = HEIST_TYPES.find(h => h.id === heist.heistId);
  const successChance = getHeistSuccessChance(state);

  heist.executionProgress++;

  const roll = Math.random();
  const result = {
    round: heist.executionProgress,
    roll: roll,
    successChance: successChance,
    heistFailed: false,
    complication: null,
    lootGained: 0,
    casualty: false
  };

  if (roll < successChance) {
    // Success for this round
    const roundLoot = Math.floor(heist.estimatedReward / heistType.executionRounds);
    heist.lootCollected += roundLoot;
    result.lootGained = roundLoot;
    result.outcome = 'success';

    // Thermal drill bonus: skip vault rounds
    const hasDrill = heist.equipment.find(e => e.id === 'thermal_drill');
    if (hasDrill && heist.executionProgress === 1 && heistType.id === 'bank_robbery') {
      const skipRounds = Math.min(2, heistType.executionRounds - heist.executionProgress);
      const bonusLoot = Math.floor(heist.estimatedReward / heistType.executionRounds) * skipRounds;
      heist.lootCollected += bonusLoot;
      result.lootGained += bonusLoot;
      result.drillBonus = skipRounds;
    }
  } else if (roll < successChance + 0.25) {
    // Complication
    const complication = randomChoice(HEIST_COMPLICATIONS);
    heist.complications.push(complication);
    result.complication = complication;
    result.outcome = 'complication';

    if (complication.severity >= 3) {
      // Possible crew casualty
      if (Math.random() < 0.3) {
        result.casualty = true;
        heist.casualtiesTaken++;
        if (heist.assignedCrew.length > 0) {
          const injuredIndex = Math.floor(Math.random() * heist.assignedCrew.length);
          heist.assignedCrew[injuredIndex].injured = true;
        }
      }
    }

    if (complication.id === 'insider_betrayal') {
      result.heistFailed = true;
      result.outcome = 'betrayal';
    }
  } else {
    // Round failure
    result.outcome = 'failure';
    if (Math.random() < 0.4) {
      result.casualty = true;
      heist.casualtiesTaken++;
    }
    // Two consecutive failures = heist fails
    const lastRound = heist.roundResults[heist.roundResults.length - 1];
    if (lastRound && lastRound.outcome === 'failure') {
      result.heistFailed = true;
    }
  }

  heist.roundResults.push(result);
  return result;
}

function resolveHeistEscape(state) {
  const heist = state.activeHeist;
  const heistType = HEIST_TYPES.find(h => h.id === heist.heistId);

  let escapeChance = 0.5;

  // Getaway vehicle bonus
  const hasVehicle = heist.equipment.find(e => e.id === 'getaway_vehicle');
  if (hasVehicle) {
    escapeChance += hasVehicle.bonus;
  }

  // EMP disables pursuit tech
  const hasEMP = heist.equipment.find(e => e.id === 'emp_device');
  if (hasEMP) {
    escapeChance += 0.10;
  }

  // Crew count affects escape
  const aliveCrew = heist.assignedCrew.filter(c => !c.dead).length;
  escapeChance += aliveCrew * 0.03;

  // Complications reduce escape chance
  const seriousComplications = heist.complications.filter(c => c.severity >= 3).length;
  escapeChance -= seriousComplications * 0.10;

  // Difficulty penalty
  escapeChance -= (heistType.difficulty - 2) * 0.05;

  escapeChance = Math.max(0.1, Math.min(0.95, escapeChance));

  const escapeResults = [];
  let escaped = true;

  for (let round = 0; round < heistType.escapeRounds; round++) {
    const roll = Math.random();
    const roundResult = {
      round: round + 1,
      roll: roll,
      escapeChance: escapeChance,
      passed: roll < escapeChance
    };

    if (!roundResult.passed) {
      // Failed escape round - possible loot loss or casualty
      if (Math.random() < 0.5) {
        const lostLoot = Math.floor(heist.lootCollected * 0.2);
        heist.lootCollected -= lostLoot;
        roundResult.lootLost = lostLoot;
      }
      if (Math.random() < 0.25) {
        heist.casualtiesTaken++;
        roundResult.casualty = true;
      }

      // Two failed escape rounds = caught
      const prevFailed = escapeResults.filter(r => !r.passed).length;
      if (prevFailed >= 1) {
        escaped = false;
        roundResult.caught = true;
      }
    }

    escapeResults.push(roundResult);
    if (!escaped) break;
  }

  return { escaped, escapeResults, finalEscapeChance: escapeChance };
}

// ============================================================
// AFTERMATH
// ============================================================

function resolveHeistAftermath(state, success, allResults) {
  const heist = state.activeHeist;
  const heistType = HEIST_TYPES.find(h => h.id === heist.heistId);

  const aftermath = {
    heistName: heist.heistName,
    heistId: heist.heistId,
    success: success,
    roundResults: allResults,
    loot: 0,
    productGained: 0,
    heatGained: 0,
    casualtiesTotal: heist.casualtiesTaken,
    xpGained: 0,
    factionDamage: 0,
    investigationReduction: 0,
    fenceValue: 0
  };

  if (success) {
    heist.phase = 'complete';

    // Calculate loot
    if (heistType.rewardType === 'cash' || heistType.rewardType === 'cash_and_product') {
      aftermath.loot = heist.lootCollected;
      state.cash = (state.cash || 0) + aftermath.loot;
    }
    if (heistType.rewardType === 'product' || heistType.rewardType === 'cash_and_product') {
      aftermath.productGained = Math.floor(heist.lootCollected * 0.5);
    }
    if (heistType.rewardType === 'goods' && heistType.fenceRate) {
      const fenceMultiplier = heistType.fenceRate.min + Math.random() * (heistType.fenceRate.max - heistType.fenceRate.min);
      aftermath.fenceValue = Math.floor(heist.lootCollected * fenceMultiplier);
      aftermath.loot = aftermath.fenceValue;
      state.cash = (state.cash || 0) + aftermath.fenceValue;
    }
    if (heistType.rewardType === 'investigation_reduction') {
      aftermath.investigationReduction = heistType.investigationReduction || 0.5;
    }

    // Faction damage
    aftermath.factionDamage = heistType.factionDamage || 0;

    // XP
    aftermath.xpGained = heistType.difficulty * HEIST_XP_MULTIPLIER;

    // Track completion
    state.completedHeists.push({
      heistId: heist.heistId,
      loot: aftermath.loot,
      casualties: aftermath.casualtiesTotal,
      day: state.currentDay || 0
    });
    state.totalHeistProfit += aftermath.loot;

    if (heist.heistId === 'federal_reserve') {
      state.legendaryHeistCompleted = true;
    }
  } else {
    heist.phase = 'failed';

    // Failed heist - lose some crew, gain massive heat
    aftermath.loot = 0;

    state.failedHeists.push({
      heistId: heist.heistId,
      casualties: heist.casualtiesTaken,
      day: state.currentDay || 0
    });
  }

  // Heat generation
  aftermath.heatGained = heistType.heatGenerated;
  if (!success) {
    aftermath.heatGained = Math.floor(aftermath.heatGained * 1.5);
  }
  // Extra heat from civilian witnesses
  const witnessComplications = heist.complications.filter(c => c.id === 'civilian_witness').length;
  aftermath.heatGained += witnessComplications * 10;

  state.heat = (state.heat || 0) + aftermath.heatGained;

  // Apply crew casualties back to main roster
  if (state.crew) {
    for (const assigned of heist.assignedCrew) {
      if (assigned.injured && assigned.originalIndex !== undefined) {
        if (state.crew[assigned.originalIndex]) {
          state.crew[assigned.originalIndex].injured = true;
        }
      }
    }
  }

  // Record in history
  state.heistHistory.push(aftermath);

  // Set cooldown and clear active heist
  state.heistCooldown = HEIST_COOLDOWN_DAYS;
  state.activeHeist = null;

  return aftermath;
}

// ============================================================
// SUCCESS CHANCE CALCULATION
// ============================================================

function getHeistSuccessChance(state) {
  const heist = state.activeHeist;
  if (!heist) return 0;

  const heistType = HEIST_TYPES.find(h => h.id === heist.heistId);
  if (!heistType) return 0;

  let chance = heistType.baseSuccessRate;

  // Crew quality bonus
  const crewCount = heist.assignedCrew.length;
  const crewBonus = crewCount * 0.03;
  chance += crewBonus;

  // Crew combat stats
  const totalCombat = heist.assignedCrew.reduce((sum, c) => sum + (c.combat || 1), 0);
  chance += totalCombat * 0.01;

  // Equipment bonuses
  for (const equip of heist.equipment) {
    if (equip.effect === 'coordination') chance += equip.bonus;
    if (equip.effect === 'insider') chance += equip.bonus;
    if (equip.effect === 'intel') chance += equip.bonus;
    if (equip.effect === 'infiltration') chance += equip.bonus;
    if (equip.effect === 'electronics') chance += 0.10;
    if (equip.effect === 'digital') chance += 0.10;
  }

  // Scouting completion bonus
  if (heist.scoutingComplete) {
    chance += 0.10;
  }

  // Difficulty scaling
  chance -= (heistType.difficulty - 2) * 0.05;

  // Past heist experience bonus
  const completedSameType = (state.completedHeists || []).filter(h => h.heistId === heist.heistId).length;
  chance += completedSameType * 0.05;

  // Complications penalty
  chance -= heist.complications.length * 0.05;

  return Math.max(0.05, Math.min(0.95, chance));
}

// ============================================================
// ABANDON HEIST
// ============================================================

function abandonHeist(state) {
  if (!state.activeHeist) {
    return { success: false, message: 'No active heist to abandon.' };
  }

  const heistName = state.activeHeist.heistName;
  const equipmentCost = state.activeHeist.equipment.reduce((sum, e) => sum + e.cost, 0);

  state.activeHeist = null;
  state.heistCooldown = 1; // Shorter cooldown for abandoned heist

  return {
    success: true,
    message: `Abandoned ${heistName}. Equipment investment of $${equipmentCost} lost.`
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// QUERY FUNCTIONS
// ============================================================

function getHeistTypeInfo(heistId) {
  return HEIST_TYPES.find(h => h.id === heistId) || null;
}

function getEquipmentInfo(equipId) {
  return HEIST_EQUIPMENT.find(e => e.id === equipId) || null;
}

function getActiveHeistSummary(state) {
  if (!state.activeHeist) return null;

  const heist = state.activeHeist;
  const heistType = HEIST_TYPES.find(h => h.id === heist.heistId);

  return {
    name: heist.heistName,
    phase: heist.phase,
    planningDaysRemaining: heist.planningDaysRemaining,
    scoutingComplete: heist.scoutingComplete,
    crewAssigned: heist.assignedCrew.length,
    crewRequired: heistType ? heistType.crewMin : 0,
    equipmentCount: heist.equipment.length,
    successChance: getHeistSuccessChance(state),
    estimatedReward: heist.estimatedReward,
    targetLocation: heist.targetInfo.location,
    complications: heist.complications.length,
    casualties: heist.casualtiesTaken
  };
}

function getHeistStats(state) {
  return {
    totalCompleted: state.completedHeists.length,
    totalFailed: state.failedHeists.length,
    totalProfit: state.totalHeistProfit,
    legendaryCompleted: state.legendaryHeistCompleted,
    successRate: state.completedHeists.length + state.failedHeists.length > 0
      ? state.completedHeists.length / (state.completedHeists.length + state.failedHeists.length)
      : 0,
    cooldownRemaining: state.heistCooldown,
    hasActiveHeist: state.activeHeist !== null
  };
}

function getAllEquipmentForHeist(state) {
  if (!state.activeHeist) return [];
  const owned = state.activeHeist.equipment.map(e => e.id);
  return HEIST_EQUIPMENT.map(e => ({
    ...e,
    owned: owned.includes(e.id),
    canAfford: (state.cash || 0) >= e.cost
  }));
}

function getHeistHistoryLog(state) {
  return state.heistHistory.map(h => ({
    name: h.heistName,
    success: h.success,
    loot: h.loot,
    heat: h.heatGained,
    casualties: h.casualtiesTotal
  }));
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HEIST_TYPES,
    HEIST_EQUIPMENT,
    HEIST_PHASES,
    HEIST_CREW_ROLES,
    HEIST_COMPLICATIONS,
    HEIST_COOLDOWN_DAYS,
    MAX_ACTIVE_HEISTS,
    HEIST_XP_MULTIPLIER,
    initHeistState,
    processHeistsDaily,
    getAvailableHeists,
    startHeistPlanning,
    buyHeistEquipment,
    assignHeistCrew,
    advanceHeistPlanning,
    executeHeist,
    resolveHeistRound,
    resolveHeistEscape,
    resolveHeistAftermath,
    getHeistSuccessChance,
    abandonHeist,
    getHeistTypeInfo,
    getEquipmentInfo,
    getActiveHeistSummary,
    getHeistStats,
    getAllEquipmentForHeist,
    getHeistHistoryLog
  };
}
