/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Procedural Mission Generator
   Combines template + target + location + complication + reward
   to create thousands of unique mission combinations.
   ============================================================ */

// ============================================================
// MISSION TEMPLATES (12 Types)
// ============================================================
const MISSION_TEMPLATES = [
  {
    id: 'delivery',
    name: 'Delivery',
    emoji: '\u{1F4E6}',
    description: 'Transport {product} from {locationA} to {locationB} via {transport}.',
    baseReward: [2000, 10000],
    baseDuration: [2, 5],
    difficulty: [1, 3],
    requiredStats: {},
    generate: function(state, difficulty) {
      var product = pickRandom(PROC_PRODUCTS);
      var locations = pickTwoLocations(state);
      var transports = ['car', 'boat', 'motorcycle', 'on foot', 'truck', 'van'];
      var transport = pickRandom(transports);
      return {
        product: product,
        locationA: locations[0],
        locationB: locations[1],
        transport: transport
      };
    }
  },
  {
    id: 'collection',
    name: 'Collection',
    emoji: '\u{1F4B0}',
    description: 'Collect payment of {amount} from {npc} at {location}.',
    baseReward: [1000, 8000],
    baseDuration: [1, 3],
    difficulty: [1, 4],
    requiredStats: {},
    // NPC may: pay willingly (30%), negotiate (30%), refuse (20%), attack (20%)
    generate: function(state, difficulty) {
      var npc = pickRandom(PROC_TARGETS);
      var location = pickLocation(state);
      var amount = scaledRand(2000, 20000, difficulty);
      var outcomes = [
        { type: 'willing', weight: 30 },
        { type: 'negotiate', weight: 30 },
        { type: 'refuse', weight: 20 },
        { type: 'attack', weight: 20 }
      ];
      return {
        npc: npc,
        location: location,
        amount: amount,
        outcomeTable: outcomes
      };
    }
  },
  {
    id: 'elimination',
    name: 'Elimination',
    emoji: '\u{1F52B}',
    description: 'Remove {target} at {location} with {guardCount} guards.',
    baseReward: [5000, 25000],
    baseDuration: [1, 4],
    difficulty: [2, 5],
    requiredStats: { combat: 2 },
    // Approach: stealth, assault, or lure out
    generate: function(state, difficulty) {
      var target = pickRandom(PROC_TARGETS);
      var location = pickLocation(state);
      var guardCount = Math.max(1, Math.floor(difficulty * 1.5) + Math.floor(Math.random() * 3));
      var approaches = ['stealth', 'assault', 'lure_out'];
      return {
        target: target,
        location: location,
        guardCount: guardCount,
        approaches: approaches
      };
    }
  },
  {
    id: 'defense',
    name: 'Defense',
    emoji: '\u{1F6E1}\u{FE0F}',
    description: 'Defend {territory} from {faction} attack. {enemyCount} attackers.',
    baseReward: [3000, 15000],
    baseDuration: [1, 2],
    difficulty: [2, 5],
    requiredStats: { combat: 1 },
    generate: function(state, difficulty) {
      var territory = pickLocation(state);
      var faction = pickFaction(state);
      var enemyCount = Math.max(2, Math.floor(difficulty * 2) + Math.floor(Math.random() * 4));
      return {
        territory: territory,
        faction: faction,
        enemyCount: enemyCount
      };
    }
  },
  {
    id: 'sabotage',
    name: 'Sabotage',
    emoji: '\u{1F4A3}',
    description: 'Destroy {targetType} belonging to {faction} at {location}.',
    baseReward: [4000, 20000],
    baseDuration: [2, 5],
    difficulty: [2, 4],
    requiredStats: {},
    // Methods: arson, explosives, vandalism, contamination
    generate: function(state, difficulty) {
      var targetTypes = ['stash house', 'supply depot', 'front business', 'vehicle fleet', 'lab', 'warehouse'];
      var targetType = pickRandom(targetTypes);
      var faction = pickFaction(state);
      var location = pickLocation(state);
      var methods = ['arson', 'explosives', 'vandalism', 'contamination'];
      return {
        targetType: targetType,
        faction: faction,
        location: location,
        methods: methods
      };
    }
  },
  {
    id: 'espionage',
    name: 'Espionage',
    emoji: '\u{1F575}\u{FE0F}',
    description: 'Gather intel on {faction} {intelType} at {location}.',
    baseReward: [3000, 12000],
    baseDuration: [3, 7],
    difficulty: [2, 4],
    requiredStats: { stealth: 1 },
    // Methods: infiltrate, bribe insider, surveillance, hack
    generate: function(state, difficulty) {
      var faction = pickFaction(state);
      var intelType = pickRandom(PROC_INTEL_TYPES);
      var location = pickLocation(state);
      var methods = ['infiltrate', 'bribe_insider', 'surveillance', 'hack'];
      return {
        faction: faction,
        intelType: intelType,
        location: location,
        methods: methods
      };
    }
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    emoji: '\u{1F91D}',
    description: 'Recruit {npcType} from {location}.',
    baseReward: [1000, 5000],
    baseDuration: [2, 5],
    difficulty: [1, 3],
    requiredStats: {},
    // Persuasion check + offer terms. May have demands, history, or be a plant
    generate: function(state, difficulty) {
      var npcTypes = ['enforcer', 'chemist', 'lookout', 'driver', 'accountant', 'hacker', 'smuggler', 'fixer'];
      var npcType = pickRandom(npcTypes);
      var location = pickLocation(state);
      var isPlant = Math.random() < 0.08 * difficulty;
      var demands = [];
      if (Math.random() < 0.4) demands.push('signing_bonus');
      if (Math.random() < 0.3) demands.push('territory_cut');
      if (Math.random() < 0.2) demands.push('protection');
      return {
        npcType: npcType,
        location: location,
        isPlant: isPlant,
        demands: demands,
        persuasionDC: 2 + difficulty
      };
    }
  },
  {
    id: 'escort',
    name: 'Escort',
    emoji: '\u{1F697}',
    description: 'Protect {vip} from {locationA} to {locationB}.',
    baseReward: [5000, 20000],
    baseDuration: [1, 3],
    difficulty: [2, 5],
    requiredStats: { combat: 1 },
    // Threats: rival ambush, police stop, random encounter
    generate: function(state, difficulty) {
      var vip = pickRandom(PROC_VIPS);
      var locations = pickTwoLocations(state);
      var threats = [];
      if (Math.random() < 0.5 + difficulty * 0.1) threats.push('rival_ambush');
      if (Math.random() < 0.3 + difficulty * 0.1) threats.push('police_stop');
      if (Math.random() < 0.2) threats.push('random_encounter');
      return {
        vip: vip,
        locationA: locations[0],
        locationB: locations[1],
        threats: threats
      };
    }
  },
  {
    id: 'supply_run',
    name: 'Supply Run',
    emoji: '\u{1F3EA}',
    description: 'Purchase {product} from {supplier} at {location}.',
    baseReward: [2000, 8000],
    baseDuration: [2, 4],
    difficulty: [1, 3],
    requiredStats: {},
    generate: function(state, difficulty) {
      var product = pickRandom(PROC_PRODUCTS);
      var supplier = pickRandom(PROC_TARGETS);
      var location = pickLocation(state);
      return {
        product: product,
        supplier: supplier,
        location: location
      };
    }
  },
  {
    id: 'cleanup',
    name: 'Cleanup',
    emoji: '\u{1F9F9}',
    description: 'Dispose of evidence at {location} within {timeLimit} days.',
    baseReward: [3000, 15000],
    baseDuration: [1, 2],
    difficulty: [2, 4],
    requiredStats: {},
    // Methods depend on resources
    generate: function(state, difficulty) {
      var location = pickLocation(state);
      var timeLimit = Math.max(1, 3 - Math.floor(difficulty / 3));
      var evidenceTypes = ['bodies', 'documents', 'drugs', 'weapons', 'vehicles', 'forensic_traces'];
      var evidenceType = pickRandom(evidenceTypes);
      var methods = ['burn', 'dump_ocean', 'acid', 'bury', 'bribe_cleaner'];
      return {
        location: location,
        timeLimit: timeLimit,
        evidenceType: evidenceType,
        methods: methods
      };
    }
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    emoji: '\u{1F91D}',
    description: 'Broker deal between {factionA} and {factionB} regarding {issue}.',
    baseReward: [5000, 25000],
    baseDuration: [3, 7],
    difficulty: [3, 5],
    requiredStats: { reputation: 3 },
    // Success benefits player. Failure costs rep
    generate: function(state, difficulty) {
      var factions = pickTwoFactions(state);
      var issue = pickRandom(PROC_ISSUES);
      return {
        factionA: factions[0],
        factionB: factions[1],
        issue: issue,
        diplomacyDC: 3 + difficulty
      };
    }
  },
  {
    id: 'rescue',
    name: 'Rescue',
    emoji: '\u{1F198}',
    description: 'Extract {target} from {location} held by {faction}.',
    baseReward: [8000, 30000],
    baseDuration: [2, 5],
    difficulty: [3, 5],
    requiredStats: { combat: 2 },
    // Stealth or assault. Time limit
    generate: function(state, difficulty) {
      var target = pickRandom(PROC_VIPS);
      var location = pickLocation(state);
      var faction = pickFaction(state);
      var approaches = ['stealth_extraction', 'armed_assault', 'negotiated_release', 'inside_job'];
      var guardCount = Math.max(2, Math.floor(difficulty * 2) + Math.floor(Math.random() * 3));
      return {
        target: target,
        location: location,
        faction: faction,
        approaches: approaches,
        guardCount: guardCount
      };
    }
  }
];

// ============================================================
// COMPLICATIONS (20)
// ============================================================
const MISSION_COMPLICATIONS = [
  { id: 'police_checkpoint', name: 'Police Checkpoint', description: 'Police checkpoint on the route', effect: { heatRisk: 15, timeDelay: 1 } },
  { id: 'rival_ambush', name: 'Rival Ambush', description: 'Rival faction ambush at location', effect: { combatRequired: true, extraEnemies: 3 } },
  { id: 'informant_tipoff', name: 'Informant Tipoff', description: 'Target tipped off, extra alert', effect: { difficultyIncrease: 1 } },
  { id: 'weather_disruption', name: 'Bad Weather', description: 'Storm/rain disrupts operations', effect: { timeDelay: 1, stealthBonus: 1 } },
  { id: 'crew_sick', name: 'Crew Sick', description: 'One crew member unavailable', effect: { crewPenalty: 1 } },
  { id: 'contact_late', name: 'Contact Late', description: 'Contact is late, wait or abort', effect: { timeDelay: 1, abortOption: true } },
  { id: 'location_changed', name: 'Location Changed', description: 'Location moved, must find new one', effect: { timeDelay: 1, costIncrease: 500 } },
  { id: 'undercover_cop', name: 'Undercover Present', description: 'Undercover officer present at scene', effect: { heatRisk: 25, arrestRisk: 0.15 } },
  { id: 'extra_guards', name: 'Extra Guards', description: 'More defenders than expected', effect: { combatRequired: true, extraEnemies: 2 } },
  { id: 'vehicle_breakdown', name: 'Vehicle Breakdown', description: 'Vehicle breaks down mid-mission', effect: { timeDelay: 1, costIncrease: 1000 } },
  { id: 'phone_intercepted', name: 'Phone Intercepted', description: 'Communications compromised', effect: { heatRisk: 10, difficultyIncrease: 1 } },
  { id: 'civilian_witnesses', name: 'Civilian Witnesses', description: 'Civilians present at scene', effect: { heatRisk: 10, publicImageRisk: -3 } },
  { id: 'rival_same_mission', name: 'Rival Competition', description: 'Another faction running same mission', effect: { combatRequired: true, rewardBonus: 0.5 } },
  { id: 'faction_test', name: 'Faction Test', description: 'Mission is a loyalty test', effect: { repBonus: 10, betrayalRisk: 0.1 } },
  { id: 'time_pressure', name: 'Time Pressure', description: 'Complete in half expected time', effect: { timeReduction: 0.5, rewardBonus: 0.3 } },
  { id: 'reduced_reward', name: 'Reduced Reward', description: 'Client offers less than promised', effect: { rewardPenalty: -0.3, negotiateOption: true } },
  { id: 'crew_freezes', name: 'Crew Freezes', description: 'Crew member panics under pressure', effect: { leadershipCheck: 3, crewPenalty: 1 } },
  { id: 'innocent_target', name: 'Innocent Target', description: 'Target is actually innocent', effect: { moralChoice: true, publicImageRisk: -5 } },
  { id: 'client_setup', name: 'Client Setup', description: 'The client is setting you up', effect: { combatRequired: true, heatRisk: 20 } },
  { id: 'natural_disaster', name: 'Natural Disaster', description: 'Flood/fire/power outage mid-mission', effect: { timeDelay: 2, chaosBonus: true } }
];

// ============================================================
// VARIABLE POOLS
// ============================================================
const PROC_TARGETS = [
  'Razor Eddie', 'Big Tony', 'Snake Eyes', 'The Butcher', 'Lady Silk',
  'El Diablo', 'Iron Mike', 'Whiskey Jack', 'The Chemist', 'Shadow',
  'Bones', 'Pretty Boy', 'The Accountant', 'Red', 'Switchblade'
];

const PROC_VIPS = [
  'a visiting supplier', 'a defecting rival member', 'a corrupt politician',
  'a witness under protection', 'an ally crew leader', 'a weapons dealer',
  'a foreign contact', 'a journalist with intel'
];

const PROC_PRODUCTS = ['cocaine', 'heroin', 'meth', 'ecstasy', 'marijuana', 'prescription pills', 'fentanyl', 'mixed product'];

const PROC_INTEL_TYPES = ['supply routes', 'stash locations', 'crew roster', 'financial records', 'expansion plans', 'alliance details'];

const PROC_ISSUES = ['territory dispute', 'supply route access', 'prisoner exchange', 'ceasefire terms', 'trade agreement', 'mutual defense pact'];

// ============================================================
// ACT-BASED SCALING CONFIG
// ============================================================
const PROC_ACT_SCALING = {
  1: { diffRange: [1, 2], rewardRange: [1000, 5000],   maxComplications: 0 },
  2: { diffRange: [2, 3], rewardRange: [3000, 15000],  maxComplications: 1 },
  3: { diffRange: [3, 4], rewardRange: [5000, 25000],  maxComplications: 1 },
  4: { diffRange: [3, 5], rewardRange: [10000, 40000], maxComplications: 2 },
  5: { diffRange: [4, 5], rewardRange: [15000, 50000], maxComplications: 2 }
};

// ============================================================
// UTILITY HELPERS
// ============================================================

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function scaledRand(min, max, difficulty) {
  var base = min + Math.floor(Math.random() * (max - min + 1));
  return Math.round(base * (0.8 + difficulty * 0.2));
}

function pickLocation(state) {
  // Pull from MIAMI_DISTRICTS if available, fall back to world districts
  var districts = [];
  if (typeof MIAMI_DISTRICTS !== 'undefined' && MIAMI_DISTRICTS.length > 0) {
    districts = MIAMI_DISTRICTS.map(function(d) { return d.name; });
  } else if (typeof WORLD_DISTRICTS !== 'undefined' && WORLD_DISTRICTS.length > 0) {
    districts = WORLD_DISTRICTS.map(function(d) { return d.name; });
  }
  if (districts.length === 0) {
    districts = [
      'Liberty City', 'Overtown', 'Little Havana', 'Wynwood',
      'South Beach', 'Downtown', 'Coconut Grove', 'Hialeah',
      'Allapattah', 'Little Haiti', 'Brickell', 'Coral Gables',
      'Opa-Locka', 'Homestead'
    ];
  }
  return pickRandom(districts);
}

function pickTwoLocations(state) {
  var a = pickLocation(state);
  var b = pickLocation(state);
  var attempts = 0;
  while (b === a && attempts < 10) {
    b = pickLocation(state);
    attempts++;
  }
  return [a, b];
}

function pickFaction(state) {
  var factions = [];
  if (typeof FACTIONS !== 'undefined' && FACTIONS.length > 0) {
    factions = FACTIONS.map(function(f) { return f.name; });
  } else {
    factions = [
      'Colombian Cartel', 'Mexican Syndicate', 'Italian Mob',
      'Jamaican Posse', 'Chinese Triad', 'Russian Bratva',
      'Street Kings', 'Haitian Crew'
    ];
  }
  return pickRandom(factions);
}

function pickTwoFactions(state) {
  var a = pickFaction(state);
  var b = pickFaction(state);
  var attempts = 0;
  while (b === a && attempts < 10) {
    b = pickFaction(state);
    attempts++;
  }
  return [a, b];
}

function getPlayerAct(state) {
  if (state.campaign && typeof state.campaign.currentAct === 'number') {
    return state.campaign.currentAct;
  }
  if (typeof getCurrentAct === 'function') {
    var actData = getCurrentAct(state);
    if (actData && typeof actData.act === 'number') return actData.act;
  }
  return 1;
}

function getActScaling(act) {
  return PROC_ACT_SCALING[act] || PROC_ACT_SCALING[1];
}

function fillDescription(template, data) {
  var desc = template;
  for (var key in data) {
    if (typeof data[key] === 'string' || typeof data[key] === 'number') {
      desc = desc.replace(new RegExp('\\{' + key + '\\}', 'g'), String(data[key]));
    }
  }
  return desc;
}

// ============================================================
// STATE INIT
// ============================================================

function initProceduralState() {
  return {
    availableMissions: [],
    activeMissions: [],
    completedCount: 0,
    failedCount: 0,
    missionLog: [],
    lastGenDay: 0,
    difficultyModifier: 0
  };
}

// ============================================================
// MISSION GENERATION
// ============================================================

function generateProceduralMission(state) {
  var procState = state.proceduralMissions;
  if (!procState) procState = initProceduralState();

  var act = getPlayerAct(state);
  var scaling = getActScaling(act);

  // Pick difficulty within act range, apply modifier
  var baseDiff = randBetween(scaling.diffRange[0], scaling.diffRange[1]);
  var difficulty = Math.min(5, baseDiff + (procState.difficultyModifier || 0));

  // Filter templates by difficulty range
  var eligible = MISSION_TEMPLATES.filter(function(t) {
    return difficulty >= t.difficulty[0] && difficulty <= t.difficulty[1];
  });
  if (eligible.length === 0) eligible = MISSION_TEMPLATES;

  var template = pickRandom(eligible);

  // Generate mission-specific data
  var missionData = {};
  if (typeof template.generate === 'function') {
    missionData = template.generate(state, difficulty);
  }

  // Build filled description
  var description = fillDescription(template.description, missionData);

  // Calculate reward scaled by act, difficulty, and complications
  var rewardBase = randBetween(scaling.rewardRange[0], scaling.rewardRange[1]);
  var difficultyMult = 1.0 + (difficulty - 1) * 0.15;
  var reward = Math.round(rewardBase * difficultyMult);

  // Calculate duration
  var duration = randBetween(template.baseDuration[0], template.baseDuration[1]);

  // Add complications based on act scaling
  var complications = [];
  var numComplications = 0;
  if (scaling.maxComplications > 0) {
    numComplications = randBetween(0, scaling.maxComplications);
    // Higher difficulty increases chance of max complications
    if (difficulty >= 4 && Math.random() < 0.5) {
      numComplications = Math.min(numComplications + 1, scaling.maxComplications);
    }
  }

  var usedIds = {};
  for (var c = 0; c < numComplications; c++) {
    var comp = pickRandom(MISSION_COMPLICATIONS);
    if (comp && !usedIds[comp.id]) {
      usedIds[comp.id] = true;
      complications.push({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        effect: comp.effect
      });

      // Complications adjust reward upward
      if (comp.effect.rewardBonus) {
        reward = Math.round(reward * (1 + comp.effect.rewardBonus));
      }
      if (comp.effect.rewardPenalty) {
        reward = Math.round(reward * (1 + comp.effect.rewardPenalty));
      }
      // Complications can adjust duration
      if (comp.effect.timeDelay) {
        duration += comp.effect.timeDelay;
      }
      if (comp.effect.timeReduction) {
        duration = Math.max(1, Math.round(duration * comp.effect.timeReduction));
      }
    }
  }

  var currentDay = (state.day || state.currentDay || 1);
  var missionId = 'proc_' + template.id + '_' + Date.now();

  return {
    id: missionId,
    templateId: template.id,
    name: template.emoji + ' ' + template.name,
    description: description,
    missionData: missionData,
    complications: complications,
    reward: reward,
    duration: duration,
    difficulty: difficulty,
    acceptedDay: null,
    generatedDay: currentDay,
    status: 'available'
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================

function processProceduralDaily(state) {
  if (!state.proceduralMissions) {
    state.proceduralMissions = initProceduralState();
  }
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);
  var messages = [];

  // Remove expired available missions (> 3 days old)
  var expiredCount = 0;
  proc.availableMissions = proc.availableMissions.filter(function(m) {
    if (currentDay - m.generatedDay > 3) {
      expiredCount++;
      return false;
    }
    return true;
  });
  if (expiredCount > 0) {
    messages.push(expiredCount + ' expired mission' + (expiredCount > 1 ? 's' : '') + ' removed from the board.');
  }

  // Check active mission deadlines - fail if expired
  var failedThisTick = [];
  proc.activeMissions = proc.activeMissions.filter(function(m) {
    var deadline = m.acceptedDay + m.duration;
    if (currentDay > deadline) {
      failedThisTick.push(m);
      return false;
    }
    return true;
  });

  for (var f = 0; f < failedThisTick.length; f++) {
    var failed = failedThisTick[f];
    failed.status = 'failed';
    proc.failedCount++;
    proc.missionLog.push({
      day: currentDay,
      templateId: failed.templateId,
      success: false,
      reward: 0,
      missionId: failed.id
    });

    // Apply failure penalties
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', -5);
      adjustRep(state, 'trust', -3);
    }
    if (state.heat !== undefined && typeof state.heat === 'number') {
      state.heat = Math.min(100, state.heat + 5);
    }

    messages.push('\u{274C} MISSION FAILED: ' + failed.name + ' - deadline expired! Rep damaged.');
  }

  // Generate 1-3 new missions if fewer than 5 available
  if (proc.availableMissions.length < 5 && currentDay !== proc.lastGenDay) {
    var toGenerate = randBetween(1, 3);
    var slotsAvailable = 5 - proc.availableMissions.length;
    toGenerate = Math.min(toGenerate, slotsAvailable);

    for (var g = 0; g < toGenerate; g++) {
      var newMission = generateProceduralMission(state);
      proc.availableMissions.push(newMission);
      messages.push('\u{1F4CB} New mission available: ' + newMission.name + ' - $' + newMission.reward.toLocaleString() + ' reward.');
    }
    proc.lastGenDay = currentDay;
  }

  // Increase difficulty modifier every 10 completions
  var expectedMod = Math.floor(proc.completedCount / 10) * 0.1;
  if (proc.difficultyModifier < expectedMod) {
    proc.difficultyModifier = expectedMod;
    messages.push('\u{26A0}\u{FE0F} Missions are getting harder. Difficulty modifier now +' + proc.difficultyModifier.toFixed(1) + '.');
  }

  return messages;
}

// ============================================================
// MISSION MANAGEMENT
// ============================================================

function acceptProceduralMission(state, missionId) {
  if (!state.proceduralMissions) {
    state.proceduralMissions = initProceduralState();
  }
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);

  var missionIdx = -1;
  for (var i = 0; i < proc.availableMissions.length; i++) {
    if (proc.availableMissions[i].id === missionId) {
      missionIdx = i;
      break;
    }
  }

  if (missionIdx === -1) {
    return { success: false, message: 'Mission not found or already accepted.' };
  }

  var mission = proc.availableMissions.splice(missionIdx, 1)[0];
  mission.status = 'active';
  mission.acceptedDay = currentDay;
  proc.activeMissions.push(mission);

  var briefing = '\u{1F4E2} MISSION ACCEPTED: ' + mission.name + '\n';
  briefing += mission.description + '\n';
  briefing += 'Reward: $' + mission.reward.toLocaleString() + '\n';
  briefing += 'Deadline: Day ' + (currentDay + mission.duration) + ' (' + mission.duration + ' days)\n';
  briefing += 'Difficulty: ' + mission.difficulty + '/5';

  if (mission.complications.length > 0) {
    briefing += '\n\u{26A0}\u{FE0F} Complications:';
    for (var c = 0; c < mission.complications.length; c++) {
      briefing += '\n  - ' + mission.complications[c].name + ': ' + mission.complications[c].description;
    }
  }

  return { success: true, message: briefing, mission: mission };
}

function checkProceduralProgress(state, missionId) {
  if (!state.proceduralMissions) return { status: 'not_found' };
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);

  var mission = null;
  for (var i = 0; i < proc.activeMissions.length; i++) {
    if (proc.activeMissions[i].id === missionId) {
      mission = proc.activeMissions[i];
      break;
    }
  }

  if (!mission) return { status: 'not_found' };

  var deadline = mission.acceptedDay + mission.duration;
  var daysRemaining = deadline - currentDay;
  var templateId = mission.templateId;
  var data = mission.missionData;
  var progress = { status: 'in_progress', daysRemaining: daysRemaining, canComplete: false };

  // Template-specific completion checks
  switch (templateId) {
    case 'delivery':
      // Player needs product in inventory and be at destination
      if (state.inventory && data.product) {
        var productKey = data.product.toLowerCase().replace(/\s+/g, '_');
        var hasProduct = (state.inventory[productKey] || 0) > 0;
        var atLocation = state.currentLocation === data.locationB || state.location === data.locationB;
        progress.canComplete = hasProduct && atLocation;
        progress.hint = hasProduct ? 'Head to ' + data.locationB + ' to deliver.' : 'Acquire ' + data.product + ' first.';
      }
      break;

    case 'collection':
      // Player needs to be at the location
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Confront ' + data.npc + ' to collect.' : 'Travel to ' + data.location + '.';
      break;

    case 'elimination':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Target ' + data.target + ' is here. Choose your approach.' : 'Travel to ' + data.location + '.';
      break;

    case 'defense':
      progress.canComplete = true;
      progress.hint = 'Defend ' + data.territory + ' when the attack begins.';
      break;

    case 'sabotage':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Choose a method to destroy the ' + data.targetType + '.' : 'Travel to ' + data.location + '.';
      break;

    case 'espionage':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Choose your method to gather intel.' : 'Travel to ' + data.location + '.';
      break;

    case 'recruitment':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Make your pitch to the ' + data.npcType + '.' : 'Travel to ' + data.location + '.';
      break;

    case 'escort':
      var atStart = state.currentLocation === data.locationA || state.location === data.locationA;
      var atEnd = state.currentLocation === data.locationB || state.location === data.locationB;
      progress.canComplete = atEnd;
      progress.hint = atEnd ? 'VIP delivered safely.' : (atStart ? 'Begin the escort to ' + data.locationB + '.' : 'Head to ' + data.locationA + ' to meet the VIP.');
      break;

    case 'supply_run':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Meet ' + data.supplier + ' to make the purchase.' : 'Travel to ' + data.location + '.';
      break;

    case 'cleanup':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Choose a disposal method for the ' + data.evidenceType + '.' : 'Get to ' + data.location + ' quickly.';
      break;

    case 'negotiation':
      progress.canComplete = true;
      progress.hint = 'Arrange a meeting between ' + data.factionA + ' and ' + data.factionB + '.';
      break;

    case 'rescue':
      progress.canComplete = state.currentLocation === data.location || state.location === data.location;
      progress.hint = progress.canComplete ? 'Choose your extraction approach. ' + data.guardCount + ' guards on site.' : 'Travel to ' + data.location + '.';
      break;

    default:
      progress.canComplete = true;
      break;
  }

  if (daysRemaining <= 0) {
    progress.status = 'expired';
    progress.hint = 'Time is up!';
  }

  return progress;
}

function completeProceduralMission(state, missionId) {
  if (!state.proceduralMissions) return { success: false, message: 'No procedural mission state.' };
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);

  var missionIdx = -1;
  for (var i = 0; i < proc.activeMissions.length; i++) {
    if (proc.activeMissions[i].id === missionId) {
      missionIdx = i;
      break;
    }
  }

  if (missionIdx === -1) {
    return { success: false, message: 'Active mission not found.' };
  }

  var mission = proc.activeMissions.splice(missionIdx, 1)[0];
  mission.status = 'completed';

  // Apply reward
  if (typeof state.cash === 'number') {
    state.cash += mission.reward;
  }

  // Apply reputation bonuses
  if (typeof adjustRep === 'function') {
    adjustRep(state, 'streetCred', 3 + mission.difficulty);
    adjustRep(state, 'trust', 2 + Math.floor(mission.difficulty / 2));
  }

  // Handle complication effects
  var complicationMessages = [];
  for (var c = 0; c < mission.complications.length; c++) {
    var comp = mission.complications[c];
    var eff = comp.effect;

    if (eff.heatRisk && typeof state.heat === 'number') {
      var heatGain = Math.floor(eff.heatRisk * (0.5 + Math.random() * 0.5));
      state.heat = Math.min(100, state.heat + heatGain);
      complicationMessages.push(comp.name + ' added ' + heatGain + ' heat.');
    }

    if (eff.repBonus && typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', eff.repBonus);
      complicationMessages.push(comp.name + ' earned bonus reputation.');
    }

    if (eff.publicImageRisk && typeof adjustRep === 'function') {
      adjustRep(state, 'publicImage', eff.publicImageRisk);
      complicationMessages.push(comp.name + ' affected your public image.');
    }

    if (eff.arrestRisk && Math.random() < eff.arrestRisk) {
      complicationMessages.push('\u{1F6A8} ' + comp.name + ' - close call with the law!');
      if (typeof state.heat === 'number') {
        state.heat = Math.min(100, state.heat + 10);
      }
    }
  }

  // Update stats
  proc.completedCount++;
  proc.missionLog.push({
    day: currentDay,
    templateId: mission.templateId,
    success: true,
    reward: mission.reward,
    missionId: mission.id
  });

  // Trim log to last 50 entries
  if (proc.missionLog.length > 50) {
    proc.missionLog = proc.missionLog.slice(-50);
  }

  var msg = '\u{2705} MISSION COMPLETE: ' + mission.name + '\n';
  msg += 'Reward: +$' + mission.reward.toLocaleString() + '\n';
  msg += 'Completed: ' + proc.completedCount + ' total';

  if (complicationMessages.length > 0) {
    msg += '\n\u{26A0}\u{FE0F} Complication effects:\n  - ' + complicationMessages.join('\n  - ');
  }

  return { success: true, message: msg, reward: mission.reward };
}

function failProceduralMission(state, missionId) {
  if (!state.proceduralMissions) return { success: false, message: 'No procedural mission state.' };
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);

  var missionIdx = -1;
  for (var i = 0; i < proc.activeMissions.length; i++) {
    if (proc.activeMissions[i].id === missionId) {
      missionIdx = i;
      break;
    }
  }

  if (missionIdx === -1) {
    return { success: false, message: 'Active mission not found.' };
  }

  var mission = proc.activeMissions.splice(missionIdx, 1)[0];
  mission.status = 'failed';

  // Apply failure penalties
  if (typeof adjustRep === 'function') {
    adjustRep(state, 'streetCred', -(3 + mission.difficulty));
    adjustRep(state, 'trust', -(2 + Math.floor(mission.difficulty / 2)));
  }

  if (typeof state.heat === 'number') {
    state.heat = Math.min(100, state.heat + 3 + mission.difficulty);
  }

  proc.failedCount++;
  proc.missionLog.push({
    day: currentDay,
    templateId: mission.templateId,
    success: false,
    reward: 0,
    missionId: mission.id
  });

  // Trim log
  if (proc.missionLog.length > 50) {
    proc.missionLog = proc.missionLog.slice(-50);
  }

  var msg = '\u{274C} MISSION FAILED: ' + mission.name + '\n';
  msg += 'Reputation damaged. Heat increased.\n';
  msg += 'Failed: ' + proc.failedCount + ' total';

  return { success: true, message: msg };
}

// ============================================================
// MISSION BOARD UI HELPER
// ============================================================

function getProceduralMissionBoard(state) {
  if (!state.proceduralMissions) {
    state.proceduralMissions = initProceduralState();
  }
  var proc = state.proceduralMissions;
  var currentDay = (state.day || state.currentDay || 1);

  var available = proc.availableMissions.map(function(m) {
    return {
      id: m.id,
      name: m.name,
      description: m.description,
      reward: m.reward,
      duration: m.duration,
      difficulty: m.difficulty,
      complications: m.complications.length,
      daysOnBoard: currentDay - m.generatedDay,
      status: 'available'
    };
  });

  var active = proc.activeMissions.map(function(m) {
    var deadline = m.acceptedDay + m.duration;
    var daysRemaining = deadline - currentDay;
    return {
      id: m.id,
      name: m.name,
      description: m.description,
      reward: m.reward,
      difficulty: m.difficulty,
      complications: m.complications.length,
      daysRemaining: daysRemaining,
      status: 'active'
    };
  });

  return {
    available: available,
    active: active,
    stats: {
      completed: proc.completedCount,
      failed: proc.failedCount,
      difficultyModifier: proc.difficultyModifier
    }
  };
}
