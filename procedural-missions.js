/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Procedural Mission Generator v2
   A true procedural generation powerhouse.
   15 templates x 5+ location variants x 4 difficulty tiers x
   3 approach options x 10 modifiers x dynamic NPCs x
   complication chains x mission chains = ENORMOUS variety.
   ============================================================ */

// ============================================================
// 1. NARRATIVE NAME POOLS (50+ first, 50+ last, 30+ nicknames)
// ============================================================

var NPC_FIRST_NAMES = [
  'Carlos', 'Miguel', 'Alejandro', 'Diego', 'Rafael', 'Victor',
  'Tony', 'Marco', 'Luis', 'Hector', 'Eduardo', 'Fernando',
  'Rico', 'Jamal', 'Darius', 'Tyrone', 'DeShawn', 'Marcus',
  'Andre', 'Jerome', 'Ivan', 'Nikolai', 'Sergei', 'Vlad',
  'Dmitri', 'Chen', 'Wei', 'Jin', 'Kenji', 'Yuri',
  'Giovanni', 'Salvatore', 'Frankie', 'Vinnie', 'Luca',
  'Pierre', 'Jean-Claude', 'Remy', 'Antoine', 'Baptiste',
  'Jorge', 'Emilio', 'Roberto', 'Santiago', 'Mateo',
  'Kwame', 'Kofi', 'Idris', 'Moussa', 'Booker',
  'Jackson', 'Terrence', 'Lamar', 'Cornelius', 'Winston'
];

var NPC_LAST_NAMES = [
  'Gutierrez', 'Escobar', 'Morales', 'Reyes', 'Castillo',
  'Delgado', 'Mendoza', 'Vargas', 'Herrera', 'Salazar',
  'Washington', 'Jefferson', 'Williams', 'Robinson', 'Brown',
  'Petrov', 'Volkov', 'Kozlov', 'Sokolov', 'Morozov',
  'Li', 'Wong', 'Zhang', 'Tanaka', 'Yamamoto',
  'Rossi', 'Colombo', 'Ferrara', 'Bianchi', 'Ricci',
  'DuBois', 'Laurent', 'Moreau', 'Bernard', 'Lefevre',
  'Okonkwo', 'Mensah', 'Diallo', 'Toure', 'Ibrahim',
  'Cruz', 'Vega', 'Rivera', 'Dominguez', 'Fuentes',
  'Martinez', 'Santana', 'Padilla', 'Rojas', 'Cabrera',
  'Drake', 'Stone', 'Cross', 'Steele', 'Black'
];

var NPC_NICKNAMES = [
  'The Razor', 'Snake Eyes', 'Iron Fist', 'Ghost', 'Shadow',
  'The Butcher', 'Silk', 'Bones', 'Pretty Boy', 'Switchblade',
  'The Chemist', 'Icepick', 'Two-Tone', 'Whiskey', 'Red Eye',
  'The Professor', 'Machete', 'Bulletproof', 'The Saint', 'Mad Dog',
  'Scarface', 'The Surgeon', 'Deadeye', 'Scorpion', 'Viper',
  'The Hammer', 'Quicksilver', 'Torch', 'Diamond', 'The Cleaner',
  'Pitbull', 'Teflon', 'Smokescreen', 'Crowbar', 'The Architect'
];

var NPC_PERSONALITIES = [
  'paranoid', 'greedy', 'loyal', 'treacherous', 'calm',
  'violent', 'charismatic', 'cunning', 'desperate', 'arrogant',
  'methodical', 'reckless', 'vengeful', 'honorable', 'sadistic',
  'diplomatic', 'unpredictable', 'patient', 'impulsive', 'shrewd'
];

// ============================================================
// 2. LOCATION POOLS (30+ descriptors, district-keyed variants)
// ============================================================

var LOCATION_DESCRIPTORS = [
  'abandoned warehouse', 'luxury penthouse', 'busy port terminal',
  'rundown motel', 'back-alley barbershop', 'rooftop nightclub',
  'underground parking garage', 'beachfront villa', 'crumbling tenement',
  'swamp shack', 'strip mall storefront', 'dockside fish market',
  'condemned hospital', 'high-rise construction site', 'gated mansion',
  'laundromat basement', 'car wash office', 'junkyard trailer',
  'marina yacht', 'pawn shop backroom', 'church basement',
  'taco truck lot', 'self-storage unit', 'boxing gym',
  'pool hall', 'auto body shop', 'nail salon upstairs',
  'gas station garage', 'cemetery mausoleum', 'old train depot',
  'shipping container yard', 'botanical garden shed', 'canal houseboat'
];

var DISTRICT_LOCATION_FLAVORS = {
  'Liberty City':     ['housing project stairwell', 'corner bodega backroom', 'liquor store parking lot', 'community center basement', 'barbershop upstairs'],
  'Overtown':         ['old juke joint', 'vacant lot behind the church', 'boarded-up row house', 'soul food kitchen freezer', 'historic hotel ruins'],
  'Little Havana':    ['cigar shop backroom', 'domino club', 'Cuban bakery kitchen', 'auto repair garage on Calle Ocho', 'botanica basement'],
  'Wynwood':          ['art gallery warehouse', 'mural-covered alley', 'converted studio loft', 'graffiti supply shop', 'hipster bar rooftop'],
  'South Beach':      ['Ocean Drive penthouse', 'VIP cabana', 'nightclub champagne room', 'luxury hotel suite', 'beachside condo'],
  'Downtown':         ['glass tower office', 'underground parking structure', 'courthouse annex', 'metro station platform', 'food court back corridor'],
  'Coconut Grove':    ['bayfront estate', 'yacht club dock', 'banyan tree park bench', 'organic cafe patio', 'sailing school office'],
  'Hialeah':          ['quinceañera hall', 'livestock auction barn', 'mechanic shop pit', 'racetrack backroom', 'flea market stall'],
  'Allapattah':       ['produce warehouse', 'textile factory floor', 'loading dock office', 'immigrant aid storefront', 'scrapyard crane cabin'],
  'Little Haiti':     ['voodoo shop', 'Caribbean restaurant kitchen', 'community radio station', 'import shop cellar', 'painted shotgun house'],
  'Brickell':         ['condo rooftop pool', 'bank vault anteroom', 'law firm conference room', 'wine bar cellar', 'hedge fund corner office'],
  'Coral Gables':     ['country club locker room', 'Venetian pool cabana', 'Miracle Mile boutique', 'private library', 'botanical garden gazebo'],
  'Opa-Locka':        ['Moorish arch alleyway', 'airport hangar', 'discount furniture warehouse', 'check-cashing shop', 'tire shop backroom'],
  'Homestead':        ['farmhouse barn', 'airboat dock', 'migrant camp trailer', 'fruit stand shed', 'motorsport track garage']
};

// ============================================================
// 3. PRODUCT, INTEL, ISSUE POOLS
// ============================================================

var PROC_PRODUCTS = [
  'cocaine', 'heroin', 'meth', 'ecstasy', 'marijuana',
  'prescription pills', 'fentanyl', 'crack', 'LSD', 'ketamine',
  'synthetic weed', 'DMT', 'mushrooms', 'codeine syrup'
];

var PROC_INTEL_TYPES = [
  'supply routes', 'stash locations', 'crew roster', 'financial records',
  'expansion plans', 'alliance details', 'police informant list',
  'weapons cache coordinates', 'safe house addresses', 'laundering methods'
];

var PROC_ISSUES = [
  'territory dispute', 'supply route access', 'prisoner exchange',
  'ceasefire terms', 'trade agreement', 'mutual defense pact',
  'debt settlement', 'hostage situation', 'turf boundaries',
  'snitch identification', 'product pricing', 'port access rights'
];

var PROC_TRANSPORT = [
  'sedan', 'SUV', 'motorcycle', 'speedboat', 'box truck',
  'van', 'on foot', 'jet ski', 'taxi', 'rental car',
  'bicycle', 'stolen ambulance', 'fishing boat', 'seaplane'
];

var COMPLICATION_DESCRIPTIONS = [
  'Word on the street is someone tipped off the cops.',
  'A rival crew has been sniffing around the same location.',
  'Your contact says the situation changed overnight.',
  'The weather forecast looks ugly for the next 48 hours.',
  'One of your crew members is acting squirrelly.',
  'Radio chatter suggests undercover officers in the area.',
  'The location has more security than originally briefed.',
  'Your vehicle is making a suspicious noise.',
  'Communications may be compromised.',
  'Civilians are all over the area today.',
  'Another crew is running the same job simultaneously.',
  'This might be a loyalty test from higher up.',
  'The client is pushing for faster completion.',
  'The payout might be less than promised.',
  'Someone on your crew is having a meltdown.',
  'The target is reportedly not what they seem.',
  'The whole thing smells like a setup.',
  'A tropical storm is rolling in from the Gulf.',
  'Police scanners are buzzing with extra patrol activity.',
  'A local reporter has been spotted asking questions nearby.'
];

var REWARD_DESCRIPTIONS = [
  'cash in unmarked bills', 'wire transfer to offshore account',
  'duffel bag of hundreds', 'gold bars from a safety deposit box',
  'cryptocurrency wallet', 'suitcase of mixed denominations',
  'payment via front business', 'bearer bonds', 'jewelry and watches',
  'product at wholesale price', 'cash plus a favor owed',
  'payment split across three drops', 'direct deposit to shell company',
  'payment in product (street value double cash)',
  'stack of pre-paid debit cards', 'cash plus territory rights',
  'diamonds smuggled from Sierra Leone', 'antique coin collection',
  'clean cash from a charity front', 'Bitcoin transferred via dead drop phone',
  'envelope taped under a park bench', 'gym bag in airport locker',
  'payment through a corrupt lawyer trust account',
  'cash vacuum-sealed in coffee bags', 'gold Rolex plus balance in cash',
  'salary advance from a cartel accountant', 'petty cash from a slush fund',
  'money order from a pawn shop chain', 'cash-stuffed teddy bear at a toy store',
  'wired to a Cayman Islands shell'
];

// ============================================================
// 4. UTILITY HELPERS
// ============================================================

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  if (!arr || arr.length === 0) return [];
  var shuffled = arr.slice().sort(function() { return 0.5 - Math.random(); });
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function randBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function scaledRand(min, max, difficulty) {
  var base = min + Math.floor(Math.random() * (max - min + 1));
  return Math.round(base * (0.8 + difficulty * 0.2));
}

function weightedPick(items) {
  // items = [{value, weight}, ...]
  var totalWeight = 0;
  for (var i = 0; i < items.length; i++) totalWeight += items[i].weight;
  var roll = Math.random() * totalWeight;
  var running = 0;
  for (var j = 0; j < items.length; j++) {
    running += items[j].weight;
    if (roll <= running) return items[j].value;
  }
  return items[items.length - 1].value;
}

function generateNPC() {
  var first = pickRandom(NPC_FIRST_NAMES);
  var last = pickRandom(NPC_LAST_NAMES);
  var hasNickname = Math.random() < 0.4;
  var nickname = hasNickname ? pickRandom(NPC_NICKNAMES) : null;
  var personality = pickRandom(NPC_PERSONALITIES);
  var displayName = hasNickname
    ? first + ' "' + nickname + '" ' + last
    : first + ' ' + last;
  return {
    firstName: first,
    lastName: last,
    nickname: nickname,
    personality: personality,
    displayName: displayName
  };
}

function generateNPCByRole(role) {
  var npc = generateNPC();
  npc.role = role;
  return npc;
}

function pickLocation(state) {
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

function pickSpecificLocation(district) {
  var flavors = DISTRICT_LOCATION_FLAVORS[district];
  if (flavors && flavors.length > 0) {
    return pickRandom(flavors);
  }
  return pickRandom(LOCATION_DESCRIPTORS);
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
// 5. DYNAMIC DIFFICULTY SYSTEM
// ============================================================

function calculateDynamicDifficulty(state) {
  var base = 1;

  // Factor 1: Player level / kingpin rank
  var level = state.level || state.kingpinRank || 1;
  base += Math.floor(level / 3);

  // Factor 2: Days played
  var day = state.day || state.currentDay || 1;
  base += Math.floor(day / 15);

  // Factor 3: Current heat level
  var heat = state.heat || 0;
  if (heat > 70) base += 2;
  else if (heat > 40) base += 1;

  // Factor 4: Number of completed missions
  var proc = state.proceduralMissions;
  if (proc) {
    base += Math.floor(proc.completedCount / 8);
  }

  // Factor 5: Territory controlled
  var territories = 0;
  if (state.territories) {
    for (var key in state.territories) {
      if (state.territories[key] && state.territories[key].owned) territories++;
    }
  } else if (state.ownedTerritories) {
    territories = state.ownedTerritories.length || 0;
  }
  base += Math.floor(territories / 3);

  // Factor 6: Procedural difficulty modifier from completed mission ramp
  if (proc && proc.difficultyModifier) {
    base += Math.floor(proc.difficultyModifier);
  }

  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, base));
}

function getDifficultyTier(numericDifficulty) {
  if (numericDifficulty <= 1) return 'easy';
  if (numericDifficulty <= 2) return 'medium';
  if (numericDifficulty <= 3) return 'hard';
  return 'extreme';
}

function getDifficultyLabel(tier) {
  var labels = {
    easy: 'Routine Job',
    medium: 'Risky Business',
    hard: 'High Stakes',
    extreme: 'Suicide Run'
  };
  return labels[tier] || 'Unknown';
}

// ============================================================
// 6. MODIFIER SYSTEM (10 modifiers, 1-3 applied per mission)
// ============================================================

var MISSION_MODIFIERS = [
  {
    id: 'time_pressure',
    name: 'Time Pressure',
    emoji: '\u23F0',
    description: 'The clock is ticking. Complete this in half the usual time or the window closes permanently.',
    effect: function(mission, state) {
      mission.duration = Math.max(1, Math.ceil(mission.duration * 0.5));
      mission.reward = Math.round(mission.reward * 1.35);
      mission.briefingNotes.push('URGENT: Time-sensitive operation. Deadline moved up.');
    },
    consequenceTag: 'time_pressure_survived'
  },
  {
    id: 'rival_interference',
    name: 'Rival Interference',
    emoji: '\u2694\uFE0F',
    description: 'A rival crew has the same target. Expect competition and possible armed confrontation.',
    effect: function(mission, state) {
      var rivalFaction = pickFaction(state);
      mission.missionData.rivalFaction = rivalFaction;
      mission.missionData.rivalCrewSize = randBetween(2, 5 + mission.difficulty);
      mission.reward = Math.round(mission.reward * 1.25);
      mission.briefingNotes.push('WARNING: ' + rivalFaction + ' crew spotted heading to same location.');
    },
    consequenceTag: 'rival_beaten'
  },
  {
    id: 'police_attention',
    name: 'Police Attention',
    emoji: '\u{1F6A8}',
    description: 'Law enforcement has eyes on the area. Every move increases heat dramatically.',
    effect: function(mission, state) {
      mission.missionData.policePresence = true;
      mission.missionData.heatOnComplete = 15 + mission.difficulty * 5;
      mission.reward = Math.round(mission.reward * 1.2);
      mission.briefingNotes.push('CAUTION: Heavy police presence reported. Keep it quiet.');
    },
    consequenceTag: 'evaded_police'
  },
  {
    id: 'double_cross',
    name: 'Double Cross',
    emoji: '\u{1F5E1}\uFE0F',
    description: 'Someone in the chain is planning to betray you. Trust no one.',
    effect: function(mission, state) {
      mission.missionData.betrayalChance = 0.4 + mission.difficulty * 0.1;
      var traitorRole = pickRandom(['the client', 'your contact', 'a crew member', 'the buyer', 'the middleman']);
      mission.missionData.potentialTraitor = traitorRole;
      mission.reward = Math.round(mission.reward * 1.4);
      mission.briefingNotes.push('INTEL: Whispers suggest ' + traitorRole + ' may not be trustworthy.');
    },
    consequenceTag: 'survived_betrayal'
  },
  {
    id: 'weather_impact',
    name: 'Weather Impact',
    emoji: '\u{1F32A}\uFE0F',
    description: 'A tropical storm is bearing down on Miami. Streets will flood, visibility is shot.',
    effect: function(mission, state) {
      var weatherTypes = ['tropical storm', 'hurricane warning', 'severe thunderstorms', 'dense fog', 'heat wave'];
      var weather = pickRandom(weatherTypes);
      mission.missionData.weather = weather;
      mission.duration += 1;
      mission.missionData.stealthBonus = 15;
      mission.briefingNotes.push('WEATHER ALERT: ' + weather + ' expected. Plan accordingly.');
    },
    consequenceTag: 'storm_operator'
  },
  {
    id: 'faction_involvement',
    name: 'Faction Involvement',
    emoji: '\u{1F3F4}',
    description: 'A major faction has a vested interest in this mission\'s outcome.',
    effect: function(mission, state) {
      var faction = pickFaction(state);
      mission.missionData.interestedFaction = faction;
      mission.missionData.factionStakePositive = randBetween(5, 15);
      mission.missionData.factionStakeNegative = randBetween(-15, -5);
      mission.briefingNotes.push('NOTE: ' + faction + ' is watching this closely. Success earns their favor.');
    },
    consequenceTag: 'faction_impressed'
  },
  {
    id: 'witness_present',
    name: 'Witness Present',
    emoji: '\u{1F441}\uFE0F',
    description: 'An uninvolved civilian is in the wrong place at the wrong time.',
    effect: function(mission, state) {
      var witnessNpc = generateNPC();
      mission.missionData.witness = witnessNpc;
      var witnessTypes = ['nosy neighbor', 'off-duty cop', 'journalist', 'lost tourist', 'delivery driver', 'jogger'];
      mission.missionData.witnessType = pickRandom(witnessTypes);
      mission.briefingNotes.push('COMPLICATION: A ' + mission.missionData.witnessType + ' may see everything.');
      mission.approachOptions.push({
        id: 'deal_with_witness',
        name: 'Handle the Witness',
        description: 'Intimidate, bribe, or silence ' + witnessNpc.displayName + '.',
        consequences: {
          intimidate: { heat: 5, trait: 'ruthless', repChange: -2 },
          bribe: { cost: Math.round(mission.reward * 0.15), trait: 'pragmatic' },
          silence: { heat: 20, trait: 'cold_blooded', repChange: -10, publicImage: -5 },
          ignore: { heat: 10, arrestRisk: 0.15 }
        }
      });
    },
    consequenceTag: 'witness_handler'
  },
  {
    id: 'equipment_failure',
    name: 'Equipment Failure',
    emoji: '\u{1F527}',
    description: 'A critical piece of equipment breaks down at the worst possible moment.',
    effect: function(mission, state) {
      var equipment = pickRandom([
        'getaway vehicle', 'communications radio', 'lock-picking kit',
        'weapon', 'GPS tracker', 'burner phone', 'body armor'
      ]);
      mission.missionData.brokenEquipment = equipment;
      mission.missionData.improvisationDC = 2 + mission.difficulty;
      mission.briefingNotes.push('PROBLEM: Your ' + equipment + ' just failed. Improvise or abort.');
    },
    consequenceTag: 'improviser'
  },
  {
    id: 'crew_drama',
    name: 'Crew Drama',
    emoji: '\u{1F4A2}',
    description: 'A crew member is dealing with personal issues that threaten the operation.',
    effect: function(mission, state) {
      var crewIssues = [
        'is high on their own supply',
        'found out their partner is cheating',
        'owes money to a loan shark and they\'re collecting today',
        'has a panic attack before the job',
        'is secretly talking to the feds',
        'is beefing with another crew member',
        'just got diagnosed with something serious',
        'wants a bigger cut or they walk'
      ];
      var issue = pickRandom(crewIssues);
      var crewNpc = generateNPCByRole('crew_member');
      mission.missionData.troubledCrew = crewNpc;
      mission.missionData.crewIssue = issue;
      mission.missionData.leadershipDC = 2 + mission.difficulty;
      mission.briefingNotes.push('CREW ISSUE: ' + crewNpc.displayName + ' ' + issue + '.');
    },
    consequenceTag: 'crew_leader'
  },
  {
    id: 'moral_dilemma',
    name: 'Moral Dilemma',
    emoji: '\u{2696}\uFE0F',
    description: 'An innocent person is caught in the crossfire. Your choice defines who you are.',
    effect: function(mission, state) {
      var innocents = [
        { type: 'child', desc: 'A kid playing in the area stumbles into the scene.' },
        { type: 'elderly', desc: 'An old woman recognizes you from the neighborhood.' },
        { type: 'pregnant_woman', desc: 'A pregnant woman is trapped in the location.' },
        { type: 'bystander_family', desc: 'A family with young children is caught in the middle.' },
        { type: 'friend', desc: 'Someone you grew up with is working at the target location.' },
        { type: 'former_teacher', desc: 'Your old school teacher is a witness to the operation.' }
      ];
      var innocent = pickRandom(innocents);
      mission.missionData.moralDilemma = innocent;
      mission.approachOptions.push({
        id: 'moral_choice',
        name: 'The Hard Choice',
        description: innocent.desc,
        consequences: {
          protect: { cost: Math.round(mission.reward * 0.3), trait: 'compassionate', publicImage: 5, repChange: -3 },
          ignore: { trait: 'cold', publicImage: -3 },
          exploit: { bonus: Math.round(mission.reward * 0.2), trait: 'ruthless', publicImage: -10, repChange: 2 }
        }
      });
      mission.briefingNotes.push('DILEMMA: ' + innocent.desc);
    },
    consequenceTag: 'moral_choice_made'
  }
];

// ============================================================
// 7. COMPLICATION SYSTEM (expanded, 25 complications)
// ============================================================

var MISSION_COMPLICATIONS = [
  { id: 'police_checkpoint', name: 'Police Checkpoint', description: 'Police checkpoint blocks your route.', effect: { heatRisk: 15, timeDelay: 1 } },
  { id: 'rival_ambush', name: 'Rival Ambush', description: 'Rival crew ambushes you en route.', effect: { combatRequired: true, extraEnemies: 3 } },
  { id: 'informant_tipoff', name: 'Informant Tipoff', description: 'Your target has been tipped off.', effect: { difficultyIncrease: 1 } },
  { id: 'weather_disruption', name: 'Severe Weather', description: 'Storm disrupts the entire operation.', effect: { timeDelay: 1, stealthBonus: 1 } },
  { id: 'crew_sick', name: 'Crew Down', description: 'A key crew member is out of commission.', effect: { crewPenalty: 1 } },
  { id: 'contact_late', name: 'Contact No-Show', description: 'Your contact fails to appear on time.', effect: { timeDelay: 1, abortOption: true } },
  { id: 'location_changed', name: 'Location Shift', description: 'The operation site has moved.', effect: { timeDelay: 1, costIncrease: 500 } },
  { id: 'undercover_cop', name: 'Undercover Presence', description: 'An undercover officer is embedded nearby.', effect: { heatRisk: 25, arrestRisk: 0.15 } },
  { id: 'extra_guards', name: 'Reinforced Security', description: 'Double the expected muscle on site.', effect: { combatRequired: true, extraEnemies: 2 } },
  { id: 'vehicle_breakdown', name: 'Vehicle Trouble', description: 'Your ride dies at the worst moment.', effect: { timeDelay: 1, costIncrease: 1000 } },
  { id: 'phone_intercepted', name: 'Comms Compromised', description: 'Your phones are tapped.', effect: { heatRisk: 10, difficultyIncrease: 1 } },
  { id: 'civilian_witnesses', name: 'Civilian Eyes', description: 'Too many witnesses in the area.', effect: { heatRisk: 10, publicImageRisk: -3 } },
  { id: 'rival_same_target', name: 'Competition', description: 'Another crew is running the same job.', effect: { combatRequired: true, rewardBonus: 0.5 } },
  { id: 'faction_test', name: 'Loyalty Test', description: 'This is a test of your allegiance.', effect: { repBonus: 10, betrayalRisk: 0.1 } },
  { id: 'time_crunch', name: 'Clock Ticking', description: 'The window just got tighter.', effect: { timeReduction: 0.5, rewardBonus: 0.3 } },
  { id: 'reduced_pay', name: 'Pay Cut', description: 'Client is squeezing the budget.', effect: { rewardPenalty: -0.3, negotiateOption: true } },
  { id: 'crew_panic', name: 'Crew Panic', description: 'Someone on your team freezes up.', effect: { leadershipCheck: 3, crewPenalty: 1 } },
  { id: 'innocent_involved', name: 'Collateral Risk', description: 'An innocent person is in the blast radius.', effect: { moralChoice: true, publicImageRisk: -5 } },
  { id: 'client_trap', name: 'It\'s a Trap', description: 'The client set you up.', effect: { combatRequired: true, heatRisk: 20 } },
  { id: 'natural_disaster', name: 'Act of God', description: 'Flood, fire, or blackout mid-operation.', effect: { timeDelay: 2, chaosBonus: true } },
  { id: 'sniper_spotted', name: 'Sniper Overwatch', description: 'Enemy sniper covers the approach.', effect: { combatRequired: true, difficultyIncrease: 1 } },
  { id: 'product_damaged', name: 'Damaged Goods', description: 'The product got wet, broken, or cut.', effect: { rewardPenalty: -0.2 } },
  { id: 'wrong_intel', name: 'Bad Intel', description: 'The briefing was wrong. Situation is different.', effect: { difficultyIncrease: 1, abortOption: true } },
  { id: 'fed_surveillance', name: 'Feds Watching', description: 'FBI or DEA surveillance detected.', effect: { heatRisk: 30, arrestRisk: 0.2 } },
  { id: 'local_gang_toll', name: 'Toll Required', description: 'Local gang demands a cut for passing through.', effect: { costIncrease: 2000, negotiateOption: true } }
];

// ============================================================
// 8. APPROACH OPTIONS (stealth/force/social + unique per template)
// ============================================================

function generateBaseApproaches(template, difficulty, district) {
  var approaches = [];

  approaches.push({
    id: 'stealth',
    name: 'Stealth Approach',
    description: 'Move quietly, avoid detection, minimize witnesses.',
    requirements: { stealth: Math.max(1, difficulty - 1) },
    successModifier: 0.1,
    consequences: {
      success: { heat: -5, trait: 'ghost', repType: 'streetCred', repAmount: 3 },
      failure: { heat: 10, trait: 'sloppy', repType: 'streetCred', repAmount: -5 }
    }
  });

  approaches.push({
    id: 'force',
    name: 'Brute Force',
    description: 'Go in loud. Overwhelming firepower solves most problems.',
    requirements: { combat: Math.max(1, difficulty - 1) },
    successModifier: 0.0,
    consequences: {
      success: { heat: 10 + difficulty * 3, trait: 'enforcer', repType: 'fear', repAmount: 5 },
      failure: { heat: 20 + difficulty * 3, trait: 'reckless', repType: 'fear', repAmount: -3, healthCost: 10 + difficulty * 5 }
    }
  });

  approaches.push({
    id: 'social',
    name: 'Social Engineering',
    description: 'Talk your way through. Bribery, deception, persuasion.',
    requirements: { charisma: Math.max(1, difficulty - 1) },
    successModifier: 0.05,
    consequences: {
      success: { heat: 0, trait: 'silver_tongue', repType: 'trust', repAmount: 4, cost: Math.round(500 * difficulty) },
      failure: { heat: 5, trait: 'exposed', repType: 'trust', repAmount: -6 }
    }
  });

  return approaches;
}

// ============================================================
// 9. MISSION TEMPLATES (15 base templates)
// ============================================================

var MISSION_TEMPLATES = [
  // ---------- TEMPLATE 1: DELIVERY ----------
  {
    id: 'delivery',
    name: 'Delivery',
    emoji: '\u{1F4E6}',
    descriptionTemplate: 'Transport {product} from {specificLocationA} in {districtA} to {specificLocationB} in {districtB} via {transport}. {contactNpc} is waiting at the drop.',
    baseReward: [2000, 12000],
    baseDuration: [2, 5],
    difficultyRange: [1, 4],
    tags: ['transport', 'logistics'],
    generate: function(state, difficulty, district) {
      var product = pickRandom(PROC_PRODUCTS);
      var locations = pickTwoLocations(state);
      var transport = pickRandom(PROC_TRANSPORT);
      var contactNpc = generateNPCByRole('buyer');
      var specificA = pickSpecificLocation(locations[0]);
      var specificB = pickSpecificLocation(locations[1]);
      return {
        product: product,
        districtA: locations[0],
        districtB: locations[1],
        specificLocationA: specificA,
        specificLocationB: specificB,
        locationA: locations[0],
        locationB: locations[1],
        transport: transport,
        contactNpc: contactNpc.displayName,
        _contact: contactNpc,
        quantity: randBetween(1, 5 + difficulty * 2) + ' kilos'
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The product is leaking and dogs can smell it.',
        'Your transport breaks down halfway there.',
        'A police checkpoint appears on the only viable route.',
        'The buyer changed the drop location at the last minute.',
        'A rival crew is tailing you from the pickup point.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 2 + difficulty)));
    }
  },

  // ---------- TEMPLATE 2: ASSASSINATION ----------
  {
    id: 'assassination',
    name: 'Assassination',
    emoji: '\u{1F52B}',
    descriptionTemplate: 'Eliminate {targetNpc} at the {specificLocation} in {district}. Target has {guardCount} bodyguards and is known to be {targetPersonality}.',
    baseReward: [5000, 30000],
    baseDuration: [1, 4],
    difficultyRange: [2, 5],
    tags: ['combat', 'high_risk'],
    generate: function(state, difficulty, district) {
      var targetNpc = generateNPCByRole('target');
      var specificLocation = pickSpecificLocation(district);
      var guardCount = Math.max(1, Math.floor(difficulty * 1.5) + randBetween(0, 3));
      return {
        targetNpc: targetNpc.displayName,
        _target: targetNpc,
        specificLocation: specificLocation,
        district: district,
        guardCount: guardCount,
        targetPersonality: targetNpc.personality,
        weapon_of_choice: pickRandom(['silenced pistol', 'sniper rifle', 'poison', 'car bomb', 'knife', 'bare hands'])
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The target has a body double.',
        'There is an armored panic room on site.',
        'The target is wearing a vest.',
        'A child is present in the building.',
        'The target is meeting with a corrupt cop at the time.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 3: PROTECTION ----------
  {
    id: 'protection',
    name: 'Protection',
    emoji: '\u{1F6E1}\uFE0F',
    descriptionTemplate: 'Guard {vipNpc} at the {specificLocation} in {district} for {duration} days. {threatFaction} has threatened to make a move.',
    baseReward: [4000, 22000],
    baseDuration: [1, 3],
    difficultyRange: [2, 5],
    tags: ['combat', 'endurance'],
    generate: function(state, difficulty, district) {
      var vipNpc = generateNPCByRole('VIP');
      var specificLocation = pickSpecificLocation(district);
      var threatFaction = pickFaction(state);
      var attackWaves = Math.max(1, difficulty);
      return {
        vipNpc: vipNpc.displayName,
        _vip: vipNpc,
        specificLocation: specificLocation,
        district: district,
        duration: randBetween(1, 3),
        threatFaction: threatFaction,
        attackWaves: attackWaves,
        enemiesPerWave: randBetween(2, 3 + difficulty)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The VIP insists on leaving the safe zone.',
        'A second faction joins the assault.',
        'The VIP\'s own people are leaking their location.',
        'Police show up mid-firefight.',
        'The VIP is secretly armed and trigger-happy.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 4: THEFT ----------
  {
    id: 'theft',
    name: 'Theft',
    emoji: '\u{1F3AD}',
    descriptionTemplate: 'Steal {targetItem} from the {specificLocation} in {district}. Owned by {ownerNpc}. Security level: {securityLevel}.',
    baseReward: [3000, 20000],
    baseDuration: [1, 4],
    difficultyRange: [1, 4],
    tags: ['stealth', 'heist'],
    generate: function(state, difficulty, district) {
      var items = [
        'a briefcase of cash', 'a laptop with account codes', 'a kilo of pure product',
        'a ledger of dirty deals', 'a collection of fake passports', 'a safe full of bearer bonds',
        'a weapons shipment manifest', 'blackmail photos', 'a diamond stash',
        'a prototype drug formula', 'encrypted hard drives', 'a golden revolver'
      ];
      var ownerNpc = generateNPCByRole('mark');
      var securityLevels = ['minimal', 'moderate', 'heavy', 'fortress'];
      var secIdx = Math.min(securityLevels.length - 1, difficulty - 1);
      return {
        targetItem: pickRandom(items),
        specificLocation: pickSpecificLocation(district),
        district: district,
        ownerNpc: ownerNpc.displayName,
        _owner: ownerNpc,
        securityLevel: securityLevels[secIdx],
        guardCount: randBetween(1, 2 + difficulty),
        hasAlarm: difficulty >= 2,
        hasCameras: difficulty >= 3,
        hasSafe: difficulty >= 2
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The item has been moved to a different room.',
        'A silent alarm was triggered without your knowledge.',
        'The mark came home early.',
        'Another thief is already inside.',
        'The safe combination was changed today.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 5: SMUGGLING ----------
  {
    id: 'smuggling',
    name: 'Smuggling',
    emoji: '\u{1F6A2}',
    descriptionTemplate: 'Smuggle {contraband} through {checkpointType} at {district}. Contact: {contactNpc}. Customs alert level: {alertLevel}.',
    baseReward: [4000, 25000],
    baseDuration: [2, 5],
    difficultyRange: [2, 5],
    tags: ['transport', 'stealth', 'logistics'],
    generate: function(state, difficulty, district) {
      var contraband = pickRandom([
        '10 kilos of cocaine', 'a crate of automatic weapons', 'counterfeit currency',
        'exotic animals', 'stolen pharmaceuticals', 'blood diamonds',
        'human cargo', 'chemical precursors', 'stolen art'
      ]);
      var checkpoints = ['port customs', 'airport security', 'coast guard patrol', 'highway weigh station', 'border crossing'];
      var alertLevels = ['green', 'yellow', 'orange', 'red'];
      var contactNpc = generateNPCByRole('smuggler_contact');
      return {
        contraband: contraband,
        checkpointType: pickRandom(checkpoints),
        district: district,
        contactNpc: contactNpc.displayName,
        _contact: contactNpc,
        alertLevel: alertLevels[Math.min(alertLevels.length - 1, difficulty - 1)],
        hidingMethod: pickRandom(['false compartment', 'inside fish crates', 'scuba gear drop', 'diplomatic pouch', 'hollowed-out furniture']),
        bribeableSecurity: Math.random() < (0.6 - difficulty * 0.1)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'Drug-sniffing dogs are at the checkpoint today.',
        'Your inside man got transferred to another shift.',
        'Coast Guard is running a surprise inspection drill.',
        'The hiding compartment is too small for the load.',
        'A customs agent recognizes your face.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 6: RESCUE ----------
  {
    id: 'rescue',
    name: 'Rescue',
    emoji: '\u{1F198}',
    descriptionTemplate: 'Extract {hostageNpc} from {specificLocation} in {district}. Held by {captorFaction} with {guardCount} guards. Hostage condition: {condition}.',
    baseReward: [8000, 35000],
    baseDuration: [1, 4],
    difficultyRange: [3, 5],
    tags: ['combat', 'stealth', 'high_risk'],
    generate: function(state, difficulty, district) {
      var hostageNpc = generateNPCByRole('hostage');
      var captorFaction = pickFaction(state);
      var conditions = ['stable', 'beaten up', 'drugged', 'chained', 'critical - needs medical attention'];
      var guardCount = Math.max(2, Math.floor(difficulty * 2) + randBetween(0, 3));
      return {
        hostageNpc: hostageNpc.displayName,
        _hostage: hostageNpc,
        specificLocation: pickSpecificLocation(district),
        district: district,
        captorFaction: captorFaction,
        guardCount: guardCount,
        condition: conditions[Math.min(conditions.length - 1, difficulty - 1)],
        hasDeadline: difficulty >= 3,
        ransomDemand: scaledRand(10000, 50000, difficulty)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The hostage has Stockholm syndrome and resists rescue.',
        'The building is rigged with explosives.',
        'A second hostage you didn\'t know about is also inside.',
        'The captors moved locations an hour ago.',
        'An undercover fed is also trying to run a rescue op.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 7: SABOTAGE ----------
  {
    id: 'sabotage',
    name: 'Sabotage',
    emoji: '\u{1F4A3}',
    descriptionTemplate: 'Destroy {targetFaction}\'s {targetType} at the {specificLocation} in {district}. Method: {method}.',
    baseReward: [4000, 22000],
    baseDuration: [2, 5],
    difficultyRange: [2, 5],
    tags: ['destruction', 'stealth'],
    generate: function(state, difficulty, district) {
      var targetTypes = ['stash house', 'supply depot', 'front business', 'vehicle fleet', 'drug lab', 'weapons cache', 'server room', 'money counting house'];
      var methods = ['arson', 'explosives', 'contamination', 'flooding', 'electrical sabotage', 'structural collapse'];
      var targetFaction = pickFaction(state);
      return {
        targetFaction: targetFaction,
        targetType: pickRandom(targetTypes),
        specificLocation: pickSpecificLocation(district),
        district: district,
        method: pickRandom(methods),
        guardCount: randBetween(1, 2 + difficulty),
        collateralRisk: difficulty >= 3 ? 'high' : 'low',
        evidenceToPlant: Math.random() < 0.3 ? pickFaction(state) : null
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'Civilians are in the building during operating hours.',
        'The target location is next to a school.',
        'Your demolition expert got cold feet.',
        'The building has a sprinkler system that limits fire damage.',
        'Security cameras cover every angle of approach.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 8: RECRUITMENT ----------
  {
    id: 'recruitment',
    name: 'Recruitment',
    emoji: '\u{1F91D}',
    descriptionTemplate: 'Recruit {recruitNpc}, a skilled {recruitRole}, from the {specificLocation} in {district}. They\'re currently {recruitStatus}.',
    baseReward: [1500, 8000],
    baseDuration: [2, 5],
    difficultyRange: [1, 3],
    tags: ['social', 'crew'],
    generate: function(state, difficulty, district) {
      var roles = ['enforcer', 'chemist', 'lookout', 'driver', 'accountant', 'hacker', 'smuggler', 'fixer', 'sniper', 'forger', 'medic', 'safecracker'];
      var statuses = [
        'freelancing for small-timers', 'just got out of prison',
        'hiding from their old crew', 'working a dead-end legit job',
        'deep in debt to a loan shark', 'considering going straight',
        'recovering from an injury', 'on the run from the feds'
      ];
      var recruitNpc = generateNPCByRole('recruit');
      var recruitRole = pickRandom(roles);
      return {
        recruitNpc: recruitNpc.displayName,
        _recruit: recruitNpc,
        recruitRole: recruitRole,
        specificLocation: pickSpecificLocation(district),
        district: district,
        recruitStatus: pickRandom(statuses),
        isPlant: Math.random() < 0.05 * difficulty,
        persuasionDC: 2 + difficulty,
        signingBonus: scaledRand(500, 5000, difficulty),
        demands: pickRandomN(['signing_bonus', 'territory_cut', 'protection', 'housing', 'clean_identity', 'family_safety'], randBetween(0, 2))
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The recruit is a federal informant.',
        'Their old crew shows up demanding loyalty.',
        'The recruit wants double the signing bonus.',
        'A rival is also trying to recruit the same person.',
        'The recruit has a warrant and cops are nearby.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 9: NEGOTIATION ----------
  {
    id: 'negotiation',
    name: 'Negotiation',
    emoji: '\u{1F4AC}',
    descriptionTemplate: 'Broker a deal between {factionA} and {factionB} regarding {issue} at the {specificLocation} in {district}. Tension level: {tensionLevel}.',
    baseReward: [5000, 28000],
    baseDuration: [2, 6],
    difficultyRange: [2, 5],
    tags: ['social', 'diplomatic', 'high_reward'],
    generate: function(state, difficulty, district) {
      var factions = pickTwoFactions(state);
      var issue = pickRandom(PROC_ISSUES);
      var tensionLevels = ['simmering', 'heated', 'boiling', 'explosive'];
      var factionALeader = generateNPCByRole('faction_leader');
      var factionBLeader = generateNPCByRole('faction_leader');
      return {
        factionA: factions[0],
        factionB: factions[1],
        factionALeader: factionALeader.displayName,
        factionBLeader: factionBLeader.displayName,
        _leaderA: factionALeader,
        _leaderB: factionBLeader,
        issue: issue,
        specificLocation: pickSpecificLocation(district),
        district: district,
        tensionLevel: tensionLevels[Math.min(tensionLevels.length - 1, difficulty - 1)],
        diplomacyDC: 3 + difficulty,
        violenceRisk: 0.1 + difficulty * 0.15,
        hiddenAgenda: Math.random() < 0.3 ? pickRandom(['one side plans an ambush', 'a mole is feeding info to cops', 'the meeting is bugged', 'one leader is wearing a wire']) : null
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'One faction leader brings twice the agreed muscle.',
        'A third faction crashes the meeting.',
        'Someone pulls a weapon during talks.',
        'The meeting location is compromised.',
        'One leader is drunk and belligerent.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 10: SURVEILLANCE ----------
  {
    id: 'surveillance',
    name: 'Surveillance',
    emoji: '\u{1F4F7}',
    descriptionTemplate: 'Monitor {targetNpc} of the {targetFaction} for {surveilDays} days from the {specificLocation} in {district}. Gather intel on {intelType}.',
    baseReward: [3000, 15000],
    baseDuration: [3, 7],
    difficultyRange: [1, 4],
    tags: ['stealth', 'intel', 'patience'],
    generate: function(state, difficulty, district) {
      var targetNpc = generateNPCByRole('surveillance_target');
      var targetFaction = pickFaction(state);
      var intelType = pickRandom(PROC_INTEL_TYPES);
      return {
        targetNpc: targetNpc.displayName,
        _target: targetNpc,
        targetFaction: targetFaction,
        surveilDays: randBetween(2, 4 + difficulty),
        specificLocation: pickSpecificLocation(district),
        district: district,
        intelType: intelType,
        equipment: pickRandom(['binoculars', 'hidden camera', 'phone tap', 'GPS tracker', 'drone']),
        coverStory: pickRandom(['food delivery driver', 'construction worker', 'homeless person', 'utility company inspector', 'dog walker']),
        counterSurveillance: difficulty >= 3
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The target spots your surveillance position.',
        'A nosy neighbor calls the cops on you.',
        'Your equipment malfunctions.',
        'The target has counter-surveillance sweeps.',
        'Another crew is also watching the same target.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 11: HEIST SETUP ----------
  {
    id: 'heist_setup',
    name: 'Heist Setup',
    emoji: '\u{1F3E6}',
    descriptionTemplate: 'Case the {targetVenue} in {district} for an upcoming heist. Scout {scoutPoints} entry points and identify {targetItem}. Contact: {plannerNpc}.',
    baseReward: [6000, 30000],
    baseDuration: [3, 7],
    difficultyRange: [2, 5],
    tags: ['stealth', 'planning', 'heist'],
    generate: function(state, difficulty, district) {
      var venues = ['bank vault', 'casino cage', 'jewelry store', 'museum', 'armored car route', 'drug lord\'s mansion', 'federal evidence locker', 'yacht during a party'];
      var plannerNpc = generateNPCByRole('heist_planner');
      var targetItems = ['$2M in cash', 'a diamond collection', 'incriminating documents', 'a drug shipment', 'gold bullion', 'cryptocurrency hardware wallets'];
      return {
        targetVenue: pickRandom(venues),
        district: district,
        scoutPoints: randBetween(2, 4 + difficulty),
        targetItem: pickRandom(targetItems),
        plannerNpc: plannerNpc.displayName,
        _planner: plannerNpc,
        specificLocation: pickSpecificLocation(district),
        securityFeatures: pickRandomN(['laser grid', 'armed guards', 'biometric locks', 'CCTV network', 'motion sensors', 'vault timer', 'panic button', 'guard dogs'], randBetween(2, 2 + difficulty)),
        crewNeeded: randBetween(2, 4 + Math.floor(difficulty / 2)),
        blueprintAvailable: Math.random() < (0.7 - difficulty * 0.1)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The venue just upgraded their security system.',
        'An inside man gets cold feet and ghosts you.',
        'You discover the vault has a time-lock you didn\'t plan for.',
        'A rival crew has the same target.',
        'A security guard recognizes one of your crew.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 12: TERRITORY GRAB ----------
  {
    id: 'territory_grab',
    name: 'Territory Grab',
    emoji: '\u{1F3F4}',
    descriptionTemplate: 'Take control of {targetBlock} in {district} from {holdingFaction}. {defenderNpc} leads {defenderCount} defenders. {localSentiment} locals.',
    baseReward: [5000, 25000],
    baseDuration: [2, 5],
    difficultyRange: [2, 5],
    tags: ['combat', 'territory', 'high_risk'],
    generate: function(state, difficulty, district) {
      var blocks = ['the north blocks', 'the waterfront strip', 'the main drag', 'the corner market area', 'the housing projects', 'the warehouse row', 'the commercial district', 'the nightlife strip'];
      var holdingFaction = pickFaction(state);
      var defenderNpc = generateNPCByRole('gang_leader');
      var sentiments = ['hostile', 'neutral', 'sympathetic', 'terrified'];
      var defenderCount = Math.max(3, difficulty * 2 + randBetween(0, 4));
      return {
        targetBlock: pickRandom(blocks),
        district: district,
        holdingFaction: holdingFaction,
        defenderNpc: defenderNpc.displayName,
        _defender: defenderNpc,
        defenderCount: defenderCount,
        localSentiment: pickRandom(sentiments),
        fortified: difficulty >= 3,
        hasReinforcements: difficulty >= 4,
        reinforcementDelay: randBetween(1, 3)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The defenders set up barricades and traps.',
        'Civilians are using human shield tactics.',
        'Police are on their way with a 10-minute ETA.',
        'The territory is booby-trapped with IEDs.',
        'A sniper controls the main approach.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 13: DRUG COOK ----------
  {
    id: 'drug_cook',
    name: 'Drug Cook',
    emoji: '\u{1F9EA}',
    descriptionTemplate: 'Cook {product} at the {specificLocation} in {district}. Chemist: {chemistNpc}. Batch size: {batchSize}. Watch for {hazard}.',
    baseReward: [3000, 18000],
    baseDuration: [2, 5],
    difficultyRange: [1, 4],
    tags: ['production', 'chemistry'],
    generate: function(state, difficulty, district) {
      var products = ['meth', 'crack', 'ecstasy', 'fentanyl', 'synthetic cathinones', 'GHB'];
      var hazards = ['toxic fumes', 'explosion risk', 'chemical burns', 'fire hazard', 'contamination'];
      var chemistNpc = generateNPCByRole('chemist');
      return {
        product: pickRandom(products),
        specificLocation: pickSpecificLocation(district),
        district: district,
        chemistNpc: chemistNpc.displayName,
        _chemist: chemistNpc,
        batchSize: randBetween(2, 5 + difficulty * 2) + ' kilos',
        hazard: pickRandom(hazards),
        purityTarget: 70 + difficulty * 5 + randBetween(0, 10),
        ventilation: Math.random() < 0.5 ? 'poor' : 'adequate',
        equipmentQuality: pickRandom(['improvised', 'basic', 'professional', 'state-of-the-art']),
        cookTime: randBetween(6, 24) + ' hours'
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'The precursor chemicals are impure.',
        'A neighbor complains about the smell.',
        'The power goes out mid-cook.',
        'The chemist passes out from fumes.',
        'A fire starts in the lab.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 14: MONEY RUN ----------
  {
    id: 'money_run',
    name: 'Money Run',
    emoji: '\u{1F4B5}',
    descriptionTemplate: 'Collect ${amount} from {debtorCount} debtors across {district}. Use {collectorNpc} as muscle. Payment method: {paymentMethod}.',
    baseReward: [2000, 15000],
    baseDuration: [1, 3],
    difficultyRange: [1, 4],
    tags: ['collection', 'enforcement', 'money'],
    generate: function(state, difficulty, district) {
      var collectorNpc = generateNPCByRole('collector');
      var debtorCount = randBetween(2, 4 + difficulty);
      var debtors = [];
      for (var i = 0; i < debtorCount; i++) {
        var d = generateNPCByRole('debtor');
        var attitudes = ['willing', 'reluctant', 'hostile', 'desperate', 'broke', 'defiant'];
        d.attitude = pickRandom(attitudes);
        d.owes = scaledRand(500, 5000, difficulty);
        debtors.push(d);
      }
      var totalOwed = 0;
      for (var j = 0; j < debtors.length; j++) totalOwed += debtors[j].owes;
      return {
        amount: totalOwed.toLocaleString(),
        debtorCount: debtorCount,
        district: district,
        collectorNpc: collectorNpc.displayName,
        _collector: collectorNpc,
        debtors: debtors,
        paymentMethod: pickRandom(['cash', 'product', 'favor', 'property deed', 'car keys']),
        totalOwed: totalOwed
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'One debtor has already skipped town.',
        'A debtor pulls a gun when you show up.',
        'One of the debtors is a cop\'s relative.',
        'A debtor offers dirt on your boss instead of cash.',
        'The neighborhood is on high alert after a recent shooting.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  },

  // ---------- TEMPLATE 15: INTEL GATHERING ----------
  {
    id: 'intel_gathering',
    name: 'Intel Gathering',
    emoji: '\u{1F575}\uFE0F',
    descriptionTemplate: 'Infiltrate {targetFaction} operation at the {specificLocation} in {district}. Target intel: {intelType}. Cover identity: {coverIdentity}.',
    baseReward: [3000, 18000],
    baseDuration: [3, 7],
    difficultyRange: [2, 5],
    tags: ['stealth', 'intel', 'infiltration'],
    generate: function(state, difficulty, district) {
      var targetFaction = pickFaction(state);
      var intelType = pickRandom(PROC_INTEL_TYPES);
      var covers = ['new recruit', 'supplier\'s assistant', 'building inspector', 'delivery driver', 'party guest', 'maintenance worker', 'investor', 'journalist'];
      var insiderNpc = generateNPCByRole('inside_contact');
      return {
        targetFaction: targetFaction,
        specificLocation: pickSpecificLocation(district),
        district: district,
        intelType: intelType,
        coverIdentity: pickRandom(covers),
        insiderNpc: insiderNpc.displayName,
        _insider: insiderNpc,
        extractionMethod: pickRandom(['photograph documents', 'copy hard drive', 'record conversation', 'steal physical files', 'plant a bug']),
        blownCoverConsequence: pickRandom(['immediate firefight', 'taken hostage', 'fed misinformation', 'marked for death', 'interrogated and released']),
        hasInsideHelp: Math.random() < (0.5 - difficulty * 0.08)
      };
    },
    generateComplications: function(difficulty) {
      var pool = [
        'Your cover identity has already been used by another agent.',
        'The inside contact is actually a double agent.',
        'You discover the intel involves your own crew.',
        'The security system uses facial recognition.',
        'The building goes into lockdown during your infiltration.'
      ];
      return pickRandomN(pool, randBetween(1, Math.min(pool.length, 1 + difficulty)));
    }
  }
];

// ============================================================
// 10. CONSEQUENCE INTEGRATION
// ============================================================

var APPROACH_TRAIT_MAP = {
  stealth: {
    success: ['ghost', 'shadow_operator', 'patient_predator'],
    failure: ['sloppy', 'detected', 'amateur_hour']
  },
  force: {
    success: ['enforcer', 'wrecking_ball', 'feared'],
    failure: ['reckless', 'wounded_pride', 'heat_magnet']
  },
  social: {
    success: ['silver_tongue', 'diplomat', 'connected'],
    failure: ['exposed', 'untrustworthy', 'known_face']
  }
};

var COMPLETION_UNLOCKS = {
  delivery:       { count: 3, unlock: 'trusted_courier', description: 'Unlock higher-value delivery jobs.' },
  assassination:  { count: 2, unlock: 'hitman_reputation', description: 'Feared by enemies. New targets available.' },
  protection:     { count: 3, unlock: 'guardian_rep', description: 'VIPs seek you out for protection.' },
  theft:          { count: 3, unlock: 'cat_burglar', description: 'Access to bigger heist opportunities.' },
  smuggling:      { count: 3, unlock: 'smuggler_network', description: 'Better smuggling routes and contacts.' },
  rescue:         { count: 2, unlock: 'liberator', description: 'Allies trust you with their people.' },
  sabotage:       { count: 3, unlock: 'demolition_expert', description: 'Access to better explosives and methods.' },
  recruitment:    { count: 4, unlock: 'talent_scout', description: 'Higher quality recruits seek you out.' },
  negotiation:    { count: 2, unlock: 'power_broker', description: 'Factions consult you on disputes.' },
  surveillance:   { count: 3, unlock: 'all_seeing_eye', description: 'Intel on enemy movements is cheaper.' },
  heist_setup:    { count: 2, unlock: 'mastermind', description: 'Heists have better success rates.' },
  territory_grab: { count: 3, unlock: 'warlord', description: 'Territory defense bonuses.' },
  drug_cook:      { count: 3, unlock: 'kingpin_chemist', description: 'Higher purity, better margins.' },
  money_run:      { count: 4, unlock: 'debt_collector', description: 'Debtors pay faster, resist less.' },
  intel_gathering:{ count: 3, unlock: 'spymaster', description: 'Double agent opportunities open up.' }
};

var FAILURE_CONSEQUENCES = {
  delivery:       { heat: 5, repLoss: 5, narrative: 'The product never arrived. Your supplier is furious.' },
  assassination:  { heat: 15, repLoss: 8, narrative: 'The target survived and now knows your face.' },
  protection:     { heat: 10, repLoss: 10, narrative: 'The VIP was hurt on your watch. Word spreads fast.' },
  theft:          { heat: 10, repLoss: 5, narrative: 'You got caught or came up empty. Embarrassing.' },
  smuggling:      { heat: 20, repLoss: 7, narrative: 'The shipment was seized. The supplier wants compensation.' },
  rescue:         { heat: 15, repLoss: 12, narrative: 'The hostage is still captive. Their people blame you.' },
  sabotage:       { heat: 15, repLoss: 6, narrative: 'The target is still operational. They know someone tried.' },
  recruitment:    { heat: 3, repLoss: 3, narrative: 'The recruit turned you down. Or worse, they\'re a plant.' },
  negotiation:    { heat: 5, repLoss: 10, narrative: 'Talks collapsed. Both factions are angry at you.' },
  surveillance:   { heat: 8, repLoss: 5, narrative: 'You were spotted. The target is now on high alert.' },
  heist_setup:    { heat: 10, repLoss: 7, narrative: 'The reconnaissance was blown. Security has been doubled.' },
  territory_grab: { heat: 20, repLoss: 10, narrative: 'The assault failed. The defenders are emboldened.' },
  drug_cook:      { heat: 10, repLoss: 4, narrative: 'The batch was ruined. Chemicals and time wasted.' },
  money_run:      { heat: 5, repLoss: 6, narrative: 'Collections fell short. Your boss questions your methods.' },
  intel_gathering:{ heat: 12, repLoss: 8, narrative: 'Your cover was blown. They fed you false intel.' }
};

// ============================================================
// 11. BRIEFING GENERATOR - Rich narrative mission descriptions
// ============================================================

var BRIEFING_INTROS = [
  'Listen up. We got a situation that needs handling.',
  'Got a job for you. Pay attention, because the details matter.',
  'Word came down from the top. This one\'s non-negotiable.',
  'A contact reached out with an opportunity. Here\'s the rundown.',
  'Something came across my desk. Thought of you immediately.',
  'Time-sensitive intel just dropped. You\'re the best fit for this.',
  'One of our people got word of something big going down.',
  'A friend of a friend needs a favor. The kind that pays well.',
  'The streets are talking. Here\'s what they\'re saying.',
  'I wouldn\'t normally bring this to you, but the money\'s right.'
];

var BRIEFING_CLOSERS = [
  'Don\'t screw this up. There won\'t be a second chance.',
  'Get it done clean and there\'s more where this came from.',
  'I trust you\'ll handle this with the usual professionalism.',
  'Questions? No? Good. Clock\'s ticking.',
  'This stays between us. No exceptions.',
  'Keep your head down and your eyes open.',
  'The less people who know about this, the better.',
  'Usual rules apply: no witnesses, no traces, no excuses.',
  'Consider this your audition for bigger things.',
  'Don\'t make me regret recommending you for this.'
];

function generateBriefing(mission) {
  var intro = pickRandom(BRIEFING_INTROS);
  var closer = pickRandom(BRIEFING_CLOSERS);
  var rewardDesc = pickRandom(REWARD_DESCRIPTIONS);

  var lines = [];
  lines.push(intro);
  lines.push('');
  lines.push(mission.description);
  lines.push('');

  if (mission.briefingNotes && mission.briefingNotes.length > 0) {
    for (var i = 0; i < mission.briefingNotes.length; i++) {
      lines.push('  * ' + mission.briefingNotes[i]);
    }
    lines.push('');
  }

  lines.push('Payment: $' + mission.reward.toLocaleString() + ' (' + rewardDesc + ')');
  lines.push('Difficulty: ' + getDifficultyLabel(mission.difficultyTier) + ' (' + mission.difficulty + '/5)');
  lines.push('Deadline: ' + mission.duration + ' day' + (mission.duration !== 1 ? 's' : ''));
  lines.push('');
  lines.push(closer);

  return lines.join('\n');
}

// ============================================================
// 12. STATE INIT
// ============================================================

function initProceduralState() {
  return {
    availableMissions: [],
    activeMissions: [],
    completedCount: 0,
    failedCount: 0,
    missionLog: [],
    lastGenDay: 0,
    difficultyModifier: 0,
    templateCompletions: {},
    unlockedPerks: [],
    activeChains: [],
    completedChains: [],
    chainHistory: [],
    traits: [],
    totalRewardsEarned: 0
  };
}

// ============================================================
// 13. CORE MISSION GENERATION
// ============================================================

function generateProceduralMission(state, overrides) {
  overrides = overrides || {};

  var proc = state.proceduralMissions;
  if (!proc) {
    state.proceduralMissions = initProceduralState();
    proc = state.proceduralMissions;
  }

  // -- Dynamic difficulty --
  var dynamicDiff = calculateDynamicDifficulty(state);
  var difficulty = overrides.difficulty || dynamicDiff;
  difficulty = Math.max(1, Math.min(5, difficulty + randBetween(-1, 1)));
  var difficultyTier = getDifficultyTier(difficulty);

  // -- Pick district --
  var district = overrides.district || pickLocation(state);

  // -- Pick template --
  var eligible = MISSION_TEMPLATES.filter(function(t) {
    return difficulty >= t.difficultyRange[0] && difficulty <= t.difficultyRange[1];
  });
  if (overrides.templateId) {
    eligible = MISSION_TEMPLATES.filter(function(t) { return t.id === overrides.templateId; });
  }
  if (eligible.length === 0) eligible = MISSION_TEMPLATES;
  var template = pickRandom(eligible);

  // -- Generate template-specific data --
  var missionData = {};
  if (typeof template.generate === 'function') {
    missionData = template.generate(state, difficulty, district);
  }

  // -- Fill description --
  var description = fillDescription(template.descriptionTemplate, missionData);

  // -- Calculate reward --
  var rewardBase = randBetween(template.baseReward[0], template.baseReward[1]);
  var difficultyMult = 1.0 + (difficulty - 1) * 0.2;
  // Scale with player level
  var levelMult = 1.0 + (Math.floor((state.level || state.kingpinRank || 1) / 5)) * 0.15;
  var reward = Math.round(rewardBase * difficultyMult * levelMult);

  // -- Calculate duration --
  var duration = randBetween(template.baseDuration[0], template.baseDuration[1]);

  // -- Generate approach options --
  var approachOptions = generateBaseApproaches(template, difficulty, district);

  // -- Generate complications --
  var maxComps = difficulty >= 4 ? 3 : (difficulty >= 2 ? 2 : 1);
  var numComplications = randBetween(0, maxComps);
  var complications = [];
  var usedCompIds = {};
  for (var c = 0; c < numComplications; c++) {
    var comp = pickRandom(MISSION_COMPLICATIONS);
    if (comp && !usedCompIds[comp.id]) {
      usedCompIds[comp.id] = true;
      complications.push({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        effect: comp.effect
      });
      if (comp.effect.rewardBonus) reward = Math.round(reward * (1 + comp.effect.rewardBonus));
      if (comp.effect.rewardPenalty) reward = Math.round(reward * (1 + comp.effect.rewardPenalty));
      if (comp.effect.timeDelay) duration += comp.effect.timeDelay;
      if (comp.effect.timeReduction) duration = Math.max(1, Math.round(duration * comp.effect.timeReduction));
    }
  }

  // -- Template-specific complications (narrative flavor) --
  var narrativeComps = [];
  if (typeof template.generateComplications === 'function') {
    narrativeComps = template.generateComplications(difficulty);
  }

  // -- Briefing notes (assembled from modifiers later) --
  var briefingNotes = [];

  // -- Apply 1-3 random modifiers --
  var numModifiers = weightedPick([
    { value: 1, weight: 50 },
    { value: 2, weight: 35 },
    { value: 3, weight: 15 }
  ]);
  var appliedModifiers = [];
  var availableMods = MISSION_MODIFIERS.slice();
  var mission = {
    id: 'proc_' + template.id + '_' + Date.now() + '_' + randBetween(1000, 9999),
    templateId: template.id,
    name: template.emoji + ' ' + template.name,
    description: description,
    missionData: missionData,
    complications: complications,
    narrativeComplications: narrativeComps,
    modifiers: [],
    reward: reward,
    duration: duration,
    difficulty: difficulty,
    difficultyTier: difficultyTier,
    district: district,
    approachOptions: approachOptions,
    briefingNotes: briefingNotes,
    chosenApproach: null,
    acceptedDay: null,
    generatedDay: (state.day || state.currentDay || 1),
    status: 'available',
    chainId: overrides.chainId || null,
    chainPart: overrides.chainPart || null,
    tags: template.tags || [],
    consequenceTags: []
  };

  for (var m = 0; m < numModifiers; m++) {
    if (availableMods.length === 0) break;
    var modIdx = Math.floor(Math.random() * availableMods.length);
    var mod = availableMods.splice(modIdx, 1)[0];
    mod.effect(mission, state);
    appliedModifiers.push({
      id: mod.id,
      name: mod.name,
      emoji: mod.emoji,
      description: mod.description,
      consequenceTag: mod.consequenceTag
    });
    mission.consequenceTags.push(mod.consequenceTag);
  }
  mission.modifiers = appliedModifiers;

  // -- Generate the full briefing --
  mission.fullBriefing = generateBriefing(mission);

  return mission;
}

// ============================================================
// 14. MISSION CHAIN SYSTEM
// ============================================================

var CHAIN_TEMPLATES = [
  {
    id: 'supply_line',
    name: 'Supply Line Establishment',
    parts: 3,
    templates: ['intel_gathering', 'smuggling', 'delivery'],
    narrativeArc: [
      'Part 1: Scout the route and gather intel on customs schedules.',
      'Part 2: Run the first shipment through the new route.',
      'Part 3: Complete the delivery and establish the permanent supply line.'
    ],
    bonusRewardMult: 1.5
  },
  {
    id: 'hostile_takeover',
    name: 'Hostile Takeover',
    parts: 3,
    templates: ['surveillance', 'sabotage', 'territory_grab'],
    narrativeArc: [
      'Part 1: Surveil the target operation and identify weaknesses.',
      'Part 2: Sabotage their defenses and supply chain.',
      'Part 3: Move in and take their territory.'
    ],
    bonusRewardMult: 1.6
  },
  {
    id: 'the_big_score',
    name: 'The Big Score',
    parts: 3,
    templates: ['heist_setup', 'recruitment', 'theft'],
    narrativeArc: [
      'Part 1: Case the target and plan the heist.',
      'Part 2: Recruit the specialized crew you need.',
      'Part 3: Execute the heist.'
    ],
    bonusRewardMult: 2.0
  },
  {
    id: 'rescue_operation',
    name: 'Rescue Operation',
    parts: 2,
    templates: ['intel_gathering', 'rescue'],
    narrativeArc: [
      'Part 1: Locate where they\'re holding the hostage.',
      'Part 2: Extract the hostage by any means necessary.'
    ],
    bonusRewardMult: 1.4
  },
  {
    id: 'empire_expansion',
    name: 'Empire Expansion',
    parts: 3,
    templates: ['drug_cook', 'delivery', 'money_run'],
    narrativeArc: [
      'Part 1: Cook a large batch of product.',
      'Part 2: Distribute to new territory.',
      'Part 3: Collect from the new distribution network.'
    ],
    bonusRewardMult: 1.5
  },
  {
    id: 'vendetta',
    name: 'Vendetta',
    parts: 3,
    templates: ['surveillance', 'sabotage', 'assassination'],
    narrativeArc: [
      'Part 1: Find the target and learn their routine.',
      'Part 2: Destroy their operation and isolate them.',
      'Part 3: Finish the job.'
    ],
    bonusRewardMult: 1.8
  },
  {
    id: 'power_play',
    name: 'Power Play',
    parts: 2,
    templates: ['negotiation', 'protection'],
    narrativeArc: [
      'Part 1: Broker a deal that shifts the balance of power.',
      'Part 2: Protect the new arrangement from those who oppose it.'
    ],
    bonusRewardMult: 1.3
  },
  {
    id: 'clean_sweep',
    name: 'Clean Sweep',
    parts: 3,
    templates: ['money_run', 'smuggling', 'intel_gathering'],
    narrativeArc: [
      'Part 1: Collect all outstanding debts before the heat comes.',
      'Part 2: Move the cash offshore through smuggling channels.',
      'Part 3: Destroy all evidence linking you to the operation.'
    ],
    bonusRewardMult: 1.4
  },
  {
    id: 'new_blood',
    name: 'New Blood',
    parts: 2,
    templates: ['recruitment', 'territory_grab'],
    narrativeArc: [
      'Part 1: Build your crew with fresh talent.',
      'Part 2: Put them to the test by taking new ground.'
    ],
    bonusRewardMult: 1.3
  },
  {
    id: 'deep_cover',
    name: 'Deep Cover',
    parts: 3,
    templates: ['intel_gathering', 'negotiation', 'assassination'],
    narrativeArc: [
      'Part 1: Infiltrate the enemy organization.',
      'Part 2: Gain their trust through a brokered deal.',
      'Part 3: Strike from within when they least expect it.'
    ],
    bonusRewardMult: 2.0
  }
];

function generateMissionChain(state, overrides) {
  overrides = overrides || {};

  var proc = state.proceduralMissions;
  if (!proc) {
    state.proceduralMissions = initProceduralState();
    proc = state.proceduralMissions;
  }

  var chainTemplate = overrides.chainTemplate || pickRandom(CHAIN_TEMPLATES);
  var chainId = 'chain_' + chainTemplate.id + '_' + Date.now() + '_' + randBetween(1000, 9999);
  var baseDifficulty = calculateDynamicDifficulty(state);

  var chain = {
    id: chainId,
    templateId: chainTemplate.id,
    name: chainTemplate.name,
    totalParts: chainTemplate.parts,
    currentPart: 1,
    missions: [],
    narrativeArc: chainTemplate.narrativeArc,
    bonusRewardMult: chainTemplate.bonusRewardMult,
    status: 'active',
    startedDay: state.day || state.currentDay || 1,
    completedParts: 0,
    bonusReward: 0
  };

  // Generate Part 1 immediately
  var part1 = generateProceduralMission(state, {
    templateId: chainTemplate.templates[0],
    difficulty: baseDifficulty,
    chainId: chainId,
    chainPart: 1
  });
  part1.name = '\u{1F517} [' + chainTemplate.name + ' 1/' + chainTemplate.parts + '] ' + part1.name;
  part1.chainNarrative = chainTemplate.narrativeArc[0];
  chain.missions.push(part1);

  // Calculate total chain bonus
  var totalChainReward = 0;
  for (var p = 0; p < chainTemplate.parts; p++) {
    totalChainReward += Math.round(part1.reward * (1 + p * 0.3));
  }
  chain.bonusReward = Math.round(totalChainReward * (chainTemplate.bonusRewardMult - 1));

  proc.activeChains.push(chain);

  return {
    chain: chain,
    firstMission: part1,
    message: '\u{1F517} MISSION CHAIN STARTED: ' + chainTemplate.name + '\n' +
             'Parts: ' + chainTemplate.parts + '\n' +
             'Chain Bonus: $' + chain.bonusReward.toLocaleString() + ' on completion\n\n' +
             chainTemplate.narrativeArc[0]
  };
}

function advanceMissionChain(state, chainId) {
  var proc = state.proceduralMissions;
  if (!proc) return { success: false, message: 'No procedural state.' };

  var chain = null;
  for (var i = 0; i < proc.activeChains.length; i++) {
    if (proc.activeChains[i].id === chainId) {
      chain = proc.activeChains[i];
      break;
    }
  }
  if (!chain) return { success: false, message: 'Chain not found.' };

  chain.completedParts++;
  chain.currentPart++;

  if (chain.currentPart > chain.totalParts) {
    // Chain complete
    chain.status = 'completed';
    // Remove from active, add to completed
    proc.activeChains = proc.activeChains.filter(function(c) { return c.id !== chainId; });
    proc.completedChains.push(chain);

    // Award bonus
    if (typeof state.cash === 'number') {
      state.cash += chain.bonusReward;
    }
    proc.totalRewardsEarned += chain.bonusReward;

    return {
      success: true,
      chainComplete: true,
      message: '\u{1F3C6} CHAIN COMPLETE: ' + chain.name + '!\n' +
               'Chain Bonus: +$' + chain.bonusReward.toLocaleString() + '\n' +
               'All ' + chain.totalParts + ' parts completed successfully.',
      bonusReward: chain.bonusReward
    };
  }

  // Generate next part
  var chainTemplate = null;
  for (var t = 0; t < CHAIN_TEMPLATES.length; t++) {
    if (CHAIN_TEMPLATES[t].id === chain.templateId) {
      chainTemplate = CHAIN_TEMPLATES[t];
      break;
    }
  }
  if (!chainTemplate) return { success: false, message: 'Chain template not found.' };

  var nextTemplateId = chainTemplate.templates[chain.currentPart - 1];
  var escalatedDifficulty = calculateDynamicDifficulty(state) + (chain.currentPart - 1);
  escalatedDifficulty = Math.min(5, escalatedDifficulty);

  var nextMission = generateProceduralMission(state, {
    templateId: nextTemplateId,
    difficulty: escalatedDifficulty,
    chainId: chainId,
    chainPart: chain.currentPart
  });
  nextMission.name = '\u{1F517} [' + chain.name + ' ' + chain.currentPart + '/' + chain.totalParts + '] ' + nextMission.name;
  nextMission.chainNarrative = chainTemplate.narrativeArc[chain.currentPart - 1];
  nextMission.reward = Math.round(nextMission.reward * (1 + (chain.currentPart - 1) * 0.3));

  chain.missions.push(nextMission);

  return {
    success: true,
    chainComplete: false,
    nextMission: nextMission,
    message: '\u{1F517} CHAIN CONTINUES: ' + chain.name + ' [Part ' + chain.currentPart + '/' + chain.totalParts + ']\n' +
             chainTemplate.narrativeArc[chain.currentPart - 1] + '\n' +
             'Stakes are higher. Reward: $' + nextMission.reward.toLocaleString()
  };
}

// ============================================================
// 15. DAILY PROCESSING
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

  // Check active mission deadlines
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

    // Apply template-specific failure consequences
    var failCons = FAILURE_CONSEQUENCES[failed.templateId];
    if (failCons) {
      if (typeof state.heat === 'number') {
        state.heat = Math.min(100, state.heat + failCons.heat);
      }
      if (typeof adjustRep === 'function') {
        adjustRep(state, 'streetCred', -failCons.repLoss);
      }
      messages.push('\u{274C} MISSION FAILED: ' + failed.name + ' - ' + failCons.narrative);
    } else {
      if (typeof adjustRep === 'function') {
        adjustRep(state, 'streetCred', -5);
        adjustRep(state, 'trust', -3);
      }
      if (typeof state.heat === 'number') {
        state.heat = Math.min(100, state.heat + 5);
      }
      messages.push('\u{274C} MISSION FAILED: ' + failed.name + ' - deadline expired! Rep damaged.');
    }

    // Check if this was a chain mission
    if (failed.chainId) {
      // Fail the entire chain
      for (var ci = 0; ci < proc.activeChains.length; ci++) {
        if (proc.activeChains[ci].id === failed.chainId) {
          proc.activeChains[ci].status = 'failed';
          messages.push('\u{1F517}\u{274C} CHAIN BROKEN: ' + proc.activeChains[ci].name + ' - A critical link in the chain failed.');
          proc.activeChains.splice(ci, 1);
          break;
        }
      }
    }

    proc.missionLog.push({
      day: currentDay,
      templateId: failed.templateId,
      success: false,
      reward: 0,
      missionId: failed.id,
      chainId: failed.chainId || null
    });
  }

  // Generate new missions if fewer than 5 available
  if (proc.availableMissions.length < 5 && currentDay !== proc.lastGenDay) {
    var toGenerate = randBetween(1, 3);
    var slotsAvailable = 5 - proc.availableMissions.length;
    toGenerate = Math.min(toGenerate, slotsAvailable);

    // 20% chance one of the new missions starts a chain
    var chainStarted = false;

    for (var g = 0; g < toGenerate; g++) {
      if (!chainStarted && Math.random() < 0.20 && proc.activeChains.length < 2) {
        var chainResult = generateMissionChain(state);
        var chainMission = chainResult.firstMission;
        proc.availableMissions.push(chainMission);
        messages.push('\u{1F517}\u{1F4CB} Chain mission available: ' + chainResult.chain.name + ' (Part 1/' + chainResult.chain.totalParts + ') - $' + chainMission.reward.toLocaleString() + ' + chain bonus.');
        chainStarted = true;
      } else {
        var newMission = generateProceduralMission(state);
        proc.availableMissions.push(newMission);
        var modNames = '';
        if (newMission.modifiers.length > 0) {
          modNames = ' [' + newMission.modifiers.map(function(mod) { return mod.emoji; }).join('') + ']';
        }
        messages.push('\u{1F4CB} New mission: ' + newMission.name + modNames + ' - $' + newMission.reward.toLocaleString() + ' (' + getDifficultyLabel(newMission.difficultyTier) + ')');
      }
    }
    proc.lastGenDay = currentDay;
  }

  // Increase difficulty modifier every 8 completions
  var expectedMod = Math.floor(proc.completedCount / 8) * 0.15;
  if (proc.difficultyModifier < expectedMod) {
    proc.difficultyModifier = expectedMod;
    messages.push('\u{26A0}\uFE0F Missions are getting harder. Difficulty modifier now +' + proc.difficultyModifier.toFixed(2) + '.');
  }

  return messages;
}

// ============================================================
// 16. MISSION MANAGEMENT
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

  // Limit active missions
  if (proc.activeMissions.length >= 3) {
    return { success: false, message: 'Too many active missions. Complete or abandon one first. (Max 3)' };
  }

  var mission = proc.availableMissions.splice(missionIdx, 1)[0];
  mission.status = 'active';
  mission.acceptedDay = currentDay;
  proc.activeMissions.push(mission);

  var briefing = '\u{1F4E2} MISSION ACCEPTED: ' + mission.name + '\n';
  briefing += '\n' + mission.fullBriefing + '\n';

  if (mission.modifiers.length > 0) {
    briefing += '\n\u{1F3B2} Active Modifiers:';
    for (var m = 0; m < mission.modifiers.length; m++) {
      briefing += '\n  ' + mission.modifiers[m].emoji + ' ' + mission.modifiers[m].name + ': ' + mission.modifiers[m].description;
    }
  }

  if (mission.narrativeComplications.length > 0) {
    briefing += '\n\n\u{26A0}\uFE0F Things That Could Go Wrong:';
    for (var n = 0; n < mission.narrativeComplications.length; n++) {
      briefing += '\n  - ' + mission.narrativeComplications[n];
    }
  }

  if (mission.approachOptions.length > 0) {
    briefing += '\n\n\u{1F9ED} Approach Options:';
    for (var a = 0; a < mission.approachOptions.length; a++) {
      var opt = mission.approachOptions[a];
      briefing += '\n  [' + (a + 1) + '] ' + opt.name + ' - ' + opt.description;
    }
  }

  if (mission.chainId) {
    briefing += '\n\n\u{1F517} This mission is part of a chain. Completing it unlocks the next stage.';
    if (mission.chainNarrative) {
      briefing += '\n  ' + mission.chainNarrative;
    }
  }

  return { success: true, message: briefing, mission: mission };
}

function chooseApproach(state, missionId, approachId) {
  if (!state.proceduralMissions) return { success: false, message: 'No procedural state.' };
  var proc = state.proceduralMissions;

  var mission = null;
  for (var i = 0; i < proc.activeMissions.length; i++) {
    if (proc.activeMissions[i].id === missionId) {
      mission = proc.activeMissions[i];
      break;
    }
  }
  if (!mission) return { success: false, message: 'Mission not found.' };

  var approach = null;
  for (var a = 0; a < mission.approachOptions.length; a++) {
    if (mission.approachOptions[a].id === approachId) {
      approach = mission.approachOptions[a];
      break;
    }
  }
  if (!approach) return { success: false, message: 'Invalid approach.' };

  mission.chosenApproach = approach;

  return {
    success: true,
    message: 'Approach selected: ' + approach.name + '\n' + approach.description,
    approach: approach
  };
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
  var data = mission.missionData;
  var progress = {
    status: 'in_progress',
    daysRemaining: daysRemaining,
    canComplete: false,
    mission: mission
  };

  // Location-based completion check (most templates)
  var atLocation = false;
  var playerLoc = state.currentLocation || state.location || '';

  switch (mission.templateId) {
    case 'delivery':
      var hasProduct = false;
      if (state.inventory && data.product) {
        var productKey = data.product.toLowerCase().replace(/\s+/g, '_');
        hasProduct = (state.inventory[productKey] || 0) > 0;
      }
      atLocation = playerLoc === data.districtB || playerLoc === data.locationB;
      progress.canComplete = hasProduct && atLocation;
      progress.hint = hasProduct ? 'Head to ' + data.districtB + ' to complete the delivery.' : 'Acquire ' + data.product + ' first.';
      break;

    case 'assassination':
    case 'theft':
    case 'sabotage':
    case 'surveillance':
    case 'heist_setup':
    case 'drug_cook':
    case 'intel_gathering':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? 'You\'re in position. Execute the plan.' : 'Travel to ' + (data.district || mission.district) + '.';
      break;

    case 'protection':
      progress.canComplete = true;
      progress.hint = 'Stand guard at ' + data.specificLocation + '. Attacks may come at any time.';
      break;

    case 'smuggling':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? 'Navigate the checkpoint with the contraband.' : 'Get to the ' + data.checkpointType + ' in ' + data.district + '.';
      break;

    case 'rescue':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? data.guardCount + ' guards stand between you and ' + data.hostageNpc + '.' : 'Travel to ' + data.district + '.';
      break;

    case 'recruitment':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? 'Make your pitch to ' + data.recruitNpc + '.' : 'Travel to ' + data.district + '.';
      break;

    case 'negotiation':
      progress.canComplete = true;
      progress.hint = 'Arrange the meeting between ' + data.factionA + ' and ' + data.factionB + '.';
      break;

    case 'territory_grab':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? 'Assault ' + data.targetBlock + '. ' + data.defenderCount + ' defenders awaiting.' : 'Rally your crew and head to ' + data.district + '.';
      break;

    case 'money_run':
      atLocation = playerLoc === data.district || playerLoc === mission.district;
      progress.canComplete = atLocation;
      progress.hint = atLocation ? 'Time to collect from ' + data.debtorCount + ' debtors.' : 'Head to ' + data.district + ' to start collections.';
      break;

    default:
      progress.canComplete = true;
      break;
  }

  if (daysRemaining <= 0) {
    progress.status = 'expired';
    progress.hint = 'Time\'s up! Mission failed.';
  }

  // Modifier warnings
  if (mission.missionData.policePresence) {
    progress.hint += ' [Police are watching!]';
  }
  if (mission.missionData.rivalFaction) {
    progress.hint += ' [' + mission.missionData.rivalFaction + ' crew is also here!]';
  }

  return progress;
}

function completeProceduralMission(state, missionId, approachId) {
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
  if (missionIdx === -1) return { success: false, message: 'Active mission not found.' };

  var mission = proc.activeMissions.splice(missionIdx, 1)[0];
  mission.status = 'completed';

  // Determine approach used
  var approach = mission.chosenApproach;
  if (approachId && !approach) {
    for (var a = 0; a < mission.approachOptions.length; a++) {
      if (mission.approachOptions[a].id === approachId) {
        approach = mission.approachOptions[a];
        break;
      }
    }
  }

  var resultMessages = [];

  // Apply base reward
  if (typeof state.cash === 'number') {
    state.cash += mission.reward;
  }
  proc.totalRewardsEarned += mission.reward;

  // Apply approach consequences
  if (approach && approach.consequences && approach.consequences.success) {
    var cons = approach.consequences.success;
    if (cons.heat && typeof state.heat === 'number') {
      state.heat = Math.max(0, Math.min(100, state.heat + cons.heat));
      if (cons.heat > 0) resultMessages.push('Heat +' + cons.heat);
      else resultMessages.push('Heat ' + cons.heat);
    }
    if (cons.trait) {
      if (proc.traits.indexOf(cons.trait) === -1) {
        proc.traits.push(cons.trait);
        resultMessages.push('Earned trait: ' + cons.trait);
      }
    }
    if (cons.repType && cons.repAmount && typeof adjustRep === 'function') {
      adjustRep(state, cons.repType, cons.repAmount);
    }
    if (cons.cost && typeof state.cash === 'number') {
      state.cash -= cons.cost;
      resultMessages.push('Expenses: -$' + cons.cost.toLocaleString());
    }
  } else {
    // Default rep gain
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', 3 + mission.difficulty);
      adjustRep(state, 'trust', 2 + Math.floor(mission.difficulty / 2));
    }
  }

  // Apply modifier consequences
  for (var mc = 0; mc < mission.modifiers.length; mc++) {
    var mod = mission.modifiers[mc];
    if (mod.consequenceTag) {
      if (proc.traits.indexOf(mod.consequenceTag) === -1) {
        proc.traits.push(mod.consequenceTag);
      }
    }
  }

  // Handle police attention modifier
  if (mission.missionData.policePresence && mission.missionData.heatOnComplete) {
    if (typeof state.heat === 'number') {
      state.heat = Math.min(100, state.heat + mission.missionData.heatOnComplete);
      resultMessages.push('Police attention: Heat +' + mission.missionData.heatOnComplete);
    }
  }

  // Handle faction involvement modifier
  if (mission.missionData.interestedFaction) {
    var factionBonus = mission.missionData.factionStakePositive || 10;
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'faction_' + mission.missionData.interestedFaction.toLowerCase().replace(/\s+/g, '_'), factionBonus);
    }
    resultMessages.push(mission.missionData.interestedFaction + ' reputation +' + factionBonus);
  }

  // Handle complication effects
  for (var c = 0; c < mission.complications.length; c++) {
    var comp = mission.complications[c];
    var eff = comp.effect;
    if (eff.heatRisk && typeof state.heat === 'number') {
      var heatGain = Math.floor(eff.heatRisk * (0.5 + Math.random() * 0.5));
      state.heat = Math.min(100, state.heat + heatGain);
      resultMessages.push(comp.name + ': Heat +' + heatGain);
    }
    if (eff.repBonus && typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', eff.repBonus);
    }
    if (eff.publicImageRisk && typeof adjustRep === 'function') {
      adjustRep(state, 'publicImage', eff.publicImageRisk);
    }
    if (eff.arrestRisk && Math.random() < eff.arrestRisk) {
      resultMessages.push('\u{1F6A8} Close call with the law during ' + comp.name + '!');
      if (typeof state.heat === 'number') state.heat = Math.min(100, state.heat + 10);
    }
  }

  // Track template completions for unlock system
  if (!proc.templateCompletions[mission.templateId]) {
    proc.templateCompletions[mission.templateId] = 0;
  }
  proc.templateCompletions[mission.templateId]++;

  // Check for template-specific unlocks
  var unlockData = COMPLETION_UNLOCKS[mission.templateId];
  if (unlockData && proc.templateCompletions[mission.templateId] === unlockData.count) {
    if (proc.unlockedPerks.indexOf(unlockData.unlock) === -1) {
      proc.unlockedPerks.push(unlockData.unlock);
      resultMessages.push('\u{1F513} UNLOCKED: ' + unlockData.unlock + ' - ' + unlockData.description);
    }
  }

  // Update stats
  proc.completedCount++;
  proc.missionLog.push({
    day: currentDay,
    templateId: mission.templateId,
    success: true,
    reward: mission.reward,
    missionId: mission.id,
    approachUsed: approach ? approach.id : null,
    chainId: mission.chainId || null,
    modifiers: mission.modifiers.map(function(m) { return m.id; }),
    difficulty: mission.difficulty
  });
  if (proc.missionLog.length > 100) {
    proc.missionLog = proc.missionLog.slice(-100);
  }

  // Handle chain advancement
  var chainMsg = '';
  if (mission.chainId) {
    var advResult = advanceMissionChain(state, mission.chainId);
    if (advResult.success) {
      if (advResult.chainComplete) {
        chainMsg = '\n\n' + advResult.message;
      } else if (advResult.nextMission) {
        proc.availableMissions.push(advResult.nextMission);
        chainMsg = '\n\n' + advResult.message;
      }
    }
  }

  var msg = '\u{2705} MISSION COMPLETE: ' + mission.name + '\n';
  msg += 'Reward: +$' + mission.reward.toLocaleString() + '\n';
  msg += 'Difficulty: ' + getDifficultyLabel(mission.difficultyTier) + ' (' + mission.difficulty + '/5)\n';
  if (approach) msg += 'Approach: ' + approach.name + '\n';
  msg += 'Completed: ' + proc.completedCount + ' total ($' + proc.totalRewardsEarned.toLocaleString() + ' earned)';

  if (resultMessages.length > 0) {
    msg += '\n\n\u{1F4CA} Effects:\n  - ' + resultMessages.join('\n  - ');
  }
  if (chainMsg) msg += chainMsg;

  return { success: true, message: msg, reward: mission.reward, mission: mission };
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
  if (missionIdx === -1) return { success: false, message: 'Active mission not found.' };

  var mission = proc.activeMissions.splice(missionIdx, 1)[0];
  mission.status = 'failed';

  var resultMessages = [];

  // Apply approach failure consequences if an approach was chosen
  var approach = mission.chosenApproach;
  if (approach && approach.consequences && approach.consequences.failure) {
    var cons = approach.consequences.failure;
    if (cons.heat && typeof state.heat === 'number') {
      state.heat = Math.min(100, state.heat + cons.heat);
      resultMessages.push('Heat +' + cons.heat);
    }
    if (cons.trait) {
      if (proc.traits.indexOf(cons.trait) === -1) {
        proc.traits.push(cons.trait);
        resultMessages.push('Gained reputation: ' + cons.trait);
      }
    }
    if (cons.repType && cons.repAmount && typeof adjustRep === 'function') {
      adjustRep(state, cons.repType, cons.repAmount);
    }
    if (cons.healthCost && typeof state.health === 'number') {
      state.health = Math.max(0, state.health - cons.healthCost);
      resultMessages.push('Health -' + cons.healthCost);
    }
  }

  // Apply template-specific failure consequences
  var failCons = FAILURE_CONSEQUENCES[mission.templateId];
  if (failCons) {
    if (typeof state.heat === 'number') {
      state.heat = Math.min(100, state.heat + failCons.heat);
    }
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', -failCons.repLoss);
    }
    resultMessages.push(failCons.narrative);
  }

  // Handle faction involvement modifier on failure
  if (mission.missionData.interestedFaction && mission.missionData.factionStakeNegative) {
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'faction_' + mission.missionData.interestedFaction.toLowerCase().replace(/\s+/g, '_'), mission.missionData.factionStakeNegative);
    }
    resultMessages.push(mission.missionData.interestedFaction + ' is disappointed.');
  }

  // Handle chain failure
  var chainMsg = '';
  if (mission.chainId) {
    for (var ci = 0; ci < proc.activeChains.length; ci++) {
      if (proc.activeChains[ci].id === mission.chainId) {
        proc.activeChains[ci].status = 'failed';
        chainMsg = '\n\u{1F517}\u{274C} CHAIN BROKEN: ' + proc.activeChains[ci].name + ' - The entire operation collapses.';
        proc.activeChains.splice(ci, 1);
        break;
      }
    }
  }

  proc.failedCount++;
  proc.missionLog.push({
    day: currentDay,
    templateId: mission.templateId,
    success: false,
    reward: 0,
    missionId: mission.id,
    chainId: mission.chainId || null,
    difficulty: mission.difficulty
  });
  if (proc.missionLog.length > 100) {
    proc.missionLog = proc.missionLog.slice(-100);
  }

  var msg = '\u{274C} MISSION FAILED: ' + mission.name + '\n';
  msg += 'No reward. Reputation damaged.\n';
  msg += 'Failed: ' + proc.failedCount + ' total';

  if (resultMessages.length > 0) {
    msg += '\n\n\u{1F4CA} Consequences:\n  - ' + resultMessages.join('\n  - ');
  }
  if (chainMsg) msg += chainMsg;

  return { success: true, message: msg };
}

// ============================================================
// 17. MISSION BOARD UI HELPER
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
      difficultyTier: m.difficultyTier,
      difficultyLabel: getDifficultyLabel(m.difficultyTier),
      district: m.district,
      modifiers: m.modifiers.map(function(mod) { return { emoji: mod.emoji, name: mod.name }; }),
      complications: m.complications.length,
      narrativeComplications: m.narrativeComplications.length,
      daysOnBoard: currentDay - m.generatedDay,
      isChainMission: !!m.chainId,
      chainPart: m.chainPart,
      tags: m.tags,
      approachCount: m.approachOptions.length,
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
      difficultyTier: m.difficultyTier,
      difficultyLabel: getDifficultyLabel(m.difficultyTier),
      district: m.district,
      modifiers: m.modifiers.map(function(mod) { return { emoji: mod.emoji, name: mod.name }; }),
      complications: m.complications.length,
      daysRemaining: daysRemaining,
      chosenApproach: m.chosenApproach ? m.chosenApproach.name : null,
      isChainMission: !!m.chainId,
      chainPart: m.chainPart,
      status: 'active'
    };
  });

  var chains = proc.activeChains.map(function(ch) {
    return {
      id: ch.id,
      name: ch.name,
      currentPart: ch.currentPart,
      totalParts: ch.totalParts,
      bonusReward: ch.bonusReward,
      completedParts: ch.completedParts,
      status: ch.status
    };
  });

  return {
    available: available,
    active: active,
    chains: chains,
    stats: {
      completed: proc.completedCount,
      failed: proc.failedCount,
      difficultyModifier: proc.difficultyModifier,
      totalRewardsEarned: proc.totalRewardsEarned,
      unlockedPerks: proc.unlockedPerks,
      traits: proc.traits,
      templateCompletions: proc.templateCompletions,
      completedChains: proc.completedChains.length
    }
  };
}

// ============================================================
// 18. QUICK-GENERATE HELPERS (convenience wrappers)
// ============================================================

function generateEasyMission(state) {
  return generateProceduralMission(state, { difficulty: 1 });
}

function generateHardMission(state) {
  return generateProceduralMission(state, { difficulty: 4 });
}

function generateExtremeMission(state) {
  return generateProceduralMission(state, { difficulty: 5 });
}

function generateMissionOfType(state, templateId) {
  return generateProceduralMission(state, { templateId: templateId });
}

function generateMissionInDistrict(state, district) {
  return generateProceduralMission(state, { district: district });
}

// ============================================================
// 19. STATISTICS AND ANALYTICS
// ============================================================

function getProceduralStats(state) {
  if (!state.proceduralMissions) return null;
  var proc = state.proceduralMissions;

  var successRate = proc.completedCount + proc.failedCount > 0
    ? Math.round((proc.completedCount / (proc.completedCount + proc.failedCount)) * 100)
    : 0;

  var favoriteTemplate = null;
  var maxCount = 0;
  for (var tid in proc.templateCompletions) {
    if (proc.templateCompletions[tid] > maxCount) {
      maxCount = proc.templateCompletions[tid];
      favoriteTemplate = tid;
    }
  }

  var recentLog = proc.missionLog.slice(-10);
  var recentSuccessCount = 0;
  for (var r = 0; r < recentLog.length; r++) {
    if (recentLog[r].success) recentSuccessCount++;
  }

  return {
    totalCompleted: proc.completedCount,
    totalFailed: proc.failedCount,
    successRate: successRate,
    totalEarned: proc.totalRewardsEarned,
    averageReward: proc.completedCount > 0 ? Math.round(proc.totalRewardsEarned / proc.completedCount) : 0,
    difficultyModifier: proc.difficultyModifier,
    favoriteTemplate: favoriteTemplate,
    favoriteTemplateCount: maxCount,
    unlockedPerks: proc.unlockedPerks.length,
    totalPerksAvailable: Object.keys(COMPLETION_UNLOCKS).length,
    traits: proc.traits,
    chainsCompleted: proc.completedChains.length,
    activeChains: proc.activeChains.length,
    recentWinRate: recentLog.length > 0 ? Math.round((recentSuccessCount / recentLog.length) * 100) : 0,
    currentDynamicDifficulty: calculateDynamicDifficulty(state)
  };
}

// ============================================================
// 20. VARIETY CALCULATOR (debug/info tool)
// ============================================================

function calculateTotalVariety() {
  var templates = MISSION_TEMPLATES.length;                // 15
  var districts = 14;                                      // 14 base districts
  var locationDescs = LOCATION_DESCRIPTORS.length;         // 33
  var districtFlavors = 5;                                 // avg per district
  var approaches = 3;                                      // stealth/force/social
  var diffTiers = 4;                                       // easy/med/hard/extreme
  var modifiers = MISSION_MODIFIERS.length;                // 10
  var modCombos = modifiers + (modifiers * (modifiers - 1) / 2) + (modifiers * (modifiers - 1) * (modifiers - 2) / 6); // 1+2+3 modifiers
  var complications = MISSION_COMPLICATIONS.length;        // 25
  var firstNames = NPC_FIRST_NAMES.length;                 // 55
  var lastNames = NPC_LAST_NAMES.length;                   // 55
  var nicknames = NPC_NICKNAMES.length + 1;                // 35 + none
  var personalities = NPC_PERSONALITIES.length;            // 20
  var npcVariety = firstNames * lastNames * nicknames * personalities;
  var chains = CHAIN_TEMPLATES.length;                     // 10

  var baseCombinations = templates * districts * approaches * diffTiers;
  var withModifiers = baseCombinations * modCombos;
  var withNPCs = withModifiers * npcVariety;

  return {
    templates: templates,
    districts: districts,
    locationDescriptors: locationDescs,
    approaches: approaches,
    difficultyTiers: diffTiers,
    modifiers: modifiers,
    modifierCombinations: Math.floor(modCombos),
    complications: complications,
    npcFirstNames: firstNames,
    npcLastNames: lastNames,
    npcNicknames: nicknames - 1,
    npcPersonalities: personalities,
    uniqueNPCs: npcVariety,
    chainTemplates: chains,
    baseMissionCombinations: baseCombinations,
    withModifiers: Math.floor(withModifiers),
    theoreticalMaxVariety: '~' + (withNPCs / 1000000000).toFixed(1) + ' billion+',
    summary: templates + ' templates x ' + districts + ' districts x ' + diffTiers + ' tiers x ' + approaches + ' approaches x ' + Math.floor(modCombos) + ' modifier combos x ' + npcVariety.toLocaleString() + ' NPC combos = effectively infinite'
  };
}
