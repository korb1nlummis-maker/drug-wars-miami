// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Expanded Faction System
// 8 Major Factions with full profiles, relationships, diplomacy
// ============================================================

const MIAMI_FACTIONS = [
  {
    id: 'los_cubanos', name: 'Los Cubanos', emoji: '🇨🇺',
    territory: ['little_havana', 'hialeah'],
    specialty: 'cocaine',
    leader: { name: 'El Viejo', title: 'The Old Man', age: 70, style: 'Patient, ruthless when crossed. Respects tradition and loyalty.' },
    strength: 7, soldiers: [8, 15], dmg: [12, 22],
    strengths: 'Best cocaine supply. Established infrastructure. Political connections. Generational loyalty.',
    weaknesses: 'Aging leadership. Slow to adapt. Internal succession crisis between two sons.',
    operatingStyle: 'Old school. Handshake deals, face-to-face. Honor-based. Betrayal = death.',
    color: '#D4A017',
    // Starting relations per character (-100 to 100)
    characterRelations: {
      corner_kid: 0, dropout: -20, ex_con: 30, hustler: -50,
      connected_kid: 30, cleanskin: -20, veteran: 0, immigrant: 20,
    },
    // Faction-to-faction relations
    factionRelations: {
      zoe_pound: -10, eastern_bloc: -30, southern_boys: -40,
      colombian_connection: 40, dixie_mafia: -20, cartel_remnants: 30,
      port_authority: 10,
    },
    // What they sell/buy
    trades: { sells: ['cocaine'], buys: ['weed', 'heroin'] },
    // Missions they offer
    missionTypes: ['supply_run', 'territory_defense', 'diplomatic_meet', 'honor_kill'],
    // War triggers
    warTriggers: ['betray_trust', 'attack_territory', 'disrespect_elder', 'snitch'],
    // Unique mechanic
    uniqueMechanic: 'succession_crisis', // Two sons vying for power — player can influence who takes over
    desc: 'The oldest cocaine pipeline in Miami. Direct from Colombia through Cuba. Tradition is law.',
  },
  {
    id: 'zoe_pound', name: 'Zoe Pound', emoji: '🇭🇹',
    territory: ['little_haiti', 'liberty_city'],
    specialty: 'multi',
    leader: { name: 'Ti Malis', title: 'Little Malice', age: 40, style: 'Charismatic, community-focused. Funds neighborhood projects.' },
    strength: 6, soldiers: [10, 20], dmg: [8, 18],
    strengths: 'Deep community roots. Caribbean shipping network. Fierce member loyalty.',
    weaknesses: 'Limited cash reserves. Tension between community mission and criminal expansion.',
    operatingStyle: 'Community-embedded. Attacking them attacks the neighborhood. Explosive in conflict.',
    color: '#1E90FF',
    characterRelations: {
      corner_kid: 0, dropout: -20, ex_con: -20, hustler: -50,
      connected_kid: 0, cleanskin: -20, veteran: -20, immigrant: 50,
    },
    factionRelations: {
      los_cubanos: -10, eastern_bloc: -40, southern_boys: -50,
      colombian_connection: -20, dixie_mafia: -60, cartel_remnants: 0,
      port_authority: 10,
    },
    trades: { sells: ['weed', 'ecstasy'], buys: ['cocaine'] },
    missionTypes: ['community_defense', 'smuggling_run', 'protect_shipment', 'community_project'],
    warTriggers: ['attack_community', 'disrespect_culture', 'snitch', 'attack_territory'],
    uniqueMechanic: 'community_shield', // Attacking them turns whole neighborhood hostile
    desc: 'Haitian diaspora power. Caribbean smuggling network. Community is their fortress.',
  },
  {
    id: 'eastern_bloc', name: 'The Eastern Bloc', emoji: '🔴',
    territory: ['south_beach', 'downtown'],
    specialty: 'ecstasy',
    leader: { name: 'Viktor Kozlov', title: 'The Colonel', age: 50, style: 'Ex-Russian military. Cold, calculating, zero sentimentality.' },
    strength: 8, soldiers: [5, 10], dmg: [18, 30],
    strengths: 'European supply connections. Massive laundering through real estate. Well-armed, disciplined.',
    weaknesses: 'No community loyalty. Small numbers. Reliant on nightlife economy.',
    operatingStyle: 'Corporate criminal. Suits, offices, contracts. Crime as business. Professional and merciless.',
    color: '#DC143C',
    characterRelations: {
      corner_kid: -50, dropout: 0, ex_con: -20, hustler: 30,
      connected_kid: 0, cleanskin: 30, veteran: 10, immigrant: -20,
    },
    factionRelations: {
      los_cubanos: -30, zoe_pound: -40, southern_boys: -50,
      colombian_connection: 10, dixie_mafia: -10, cartel_remnants: -20,
      port_authority: 20,
    },
    trades: { sells: ['ecstasy', 'ketamine'], buys: ['cocaine'] },
    missionTypes: ['nightclub_operation', 'money_laundering', 'arms_deal', 'corporate_hit'],
    warTriggers: ['interfere_business', 'attack_clubs', 'undercut_prices', 'federal_exposure'],
    uniqueMechanic: 'money_laundering_network', // Best laundering rates if allied
    desc: 'Russian military precision meets Miami nightlife. Designer drugs and real estate laundering.',
  },
  {
    id: 'southern_boys', name: 'The Southern Boys', emoji: '💀',
    territory: ['opa_locka', 'miami_gardens'],
    specialty: 'crack',
    leader: { name: "Draymond 'Dray' Walker", title: 'The Young Bull', age: 32, style: 'Young, aggressive, ambitious. Rose fast through violence.' },
    strength: 5, soldiers: [15, 30], dmg: [8, 16],
    strengths: 'Large numbers. Meth production. Extreme violence. Young and loyal recruits.',
    weaknesses: 'No international supply. Impulsive leadership. High turnover. No political connections.',
    operatingStyle: 'Aggressive, territorial, confrontational. Respect = violence.',
    color: '#8B0000',
    characterRelations: {
      corner_kid: -50, dropout: -30, ex_con: 20, hustler: -50,
      connected_kid: -50, cleanskin: -30, veteran: 15, immigrant: -50,
    },
    factionRelations: {
      los_cubanos: -40, zoe_pound: -50, eastern_bloc: -50,
      colombian_connection: -30, dixie_mafia: 20, cartel_remnants: -10,
      port_authority: -20,
    },
    trades: { sells: ['crack', 'meth'], buys: ['weed', 'cocaine'] },
    missionTypes: ['turf_war', 'drive_by', 'cook_operation', 'recruitment_run'],
    warTriggers: ['enter_territory', 'disrespect', 'steal_customers', 'any_provocation'],
    uniqueMechanic: 'mass_recruitment', // Can recruit cheap soldiers fast but they're unreliable
    desc: 'Raw violence and meth production. No international connections but massive street presence.',
  },
  {
    id: 'colombian_connection', name: 'The Colombian Connection', emoji: '🌿',
    territory: [], // No fixed territory
    specialty: 'cocaine',
    leader: { name: 'La Sombra', title: 'The Shadow', age: null, style: 'Never seen in person. Three lieutenants in Miami. Identity unknown.' },
    strength: 10, soldiers: [0, 0], dmg: [0, 0], // Don't fight directly — they control supply
    strengths: 'Unlimited supply. International infrastructure. Can flood or starve Miami market at will.',
    weaknesses: 'No Miami loyalty. Treat locals as disposable. Zero patience for failure.',
    operatingStyle: 'Pure business. Volume requirements, delivery schedules, zero tolerance. They dictate.',
    color: '#228B22',
    characterRelations: {
      corner_kid: -100, dropout: -100, ex_con: -100, hustler: -100,
      connected_kid: -30, cleanskin: -100, veteran: -100, immigrant: -50,
    },
    factionRelations: {
      los_cubanos: 40, zoe_pound: -20, eastern_bloc: 10,
      southern_boys: -30, dixie_mafia: 0, cartel_remnants: 20,
      port_authority: 30,
    },
    trades: { sells: ['cocaine', 'heroin'], buys: [] },
    missionTypes: ['volume_deal', 'pipeline_protection', 'rival_elimination', 'loyalty_test'],
    warTriggers: ['fail_volume', 'steal_product', 'expose_network', 'deal_with_rivals'],
    uniqueMechanic: 'supply_control', // Can cut your cocaine supply entirely
    desc: 'THEY are the supply chain. Getting a direct line to La Sombra is a late-game achievement.',
  },
  {
    id: 'dixie_mafia', name: 'The Dixie Mafia', emoji: '🤠',
    territory: ['kendall'],
    specialty: 'prescription',
    leader: { name: 'Bobby Ray Sims', title: 'The Good Old Boy', age: 55, style: 'Country charm hiding sharp intelligence. Runs a trucking company as cover.' },
    strength: 6, soldiers: [8, 14], dmg: [14, 24],
    strengths: 'Highway pipeline to Southeast US. Trucking fleet. Firearms supply. Rural connections.',
    weaknesses: 'Racist ideology limits recruitment. Looked down on by Miami. Federal ATF attention.',
    operatingStyle: 'Country charm masking menace. Legitimate businesses as cover. Underestimated by all.',
    color: '#DAA520',
    characterRelations: {
      corner_kid: -80, dropout: 0, ex_con: 0, hustler: 0,
      connected_kid: -10, cleanskin: 20, veteran: 30, immigrant: -100,
    },
    factionRelations: {
      los_cubanos: -20, zoe_pound: -60, eastern_bloc: -10,
      southern_boys: 20, colombian_connection: 0, cartel_remnants: 0,
      port_authority: 10,
    },
    trades: { sells: ['prescription', 'meth', 'firearms'], buys: ['cocaine'] },
    missionTypes: ['trucking_run', 'pill_distribution', 'arms_deal', 'highway_ambush'],
    warTriggers: ['enter_kendall', 'undercut_pills', 'racial_conflict', 'atf_exposure'],
    uniqueMechanic: 'highway_network', // Can transport bulk across state lines
    desc: 'Pills, guns, and good-old-boy networking. The highway pipeline south of Miami.',
  },
  {
    id: 'cartel_remnants', name: 'Miami Cartel Remnants', emoji: '👻',
    territory: [], // Scattered, no fixed territory
    specialty: 'cocaine',
    leader: { name: 'Various', title: 'The Old Guard', age: null, style: 'Loose network of former 80s Miami cocaine war members.' },
    strength: 3, soldiers: [2, 6], dmg: [10, 20],
    strengths: 'Hidden stash houses, buried cash, dormant supply contacts. Institutional knowledge.',
    weaknesses: 'Fragmented, aging, no current muscle or territory. Living on past glory.',
    operatingStyle: 'Ghosts of the old game. Invaluable mentors or bitter relics depending on approach.',
    color: '#9370DB',
    characterRelations: {
      corner_kid: 0, dropout: -20, ex_con: 50, hustler: 0,
      connected_kid: 60, cleanskin: -20, veteran: 30, immigrant: -20,
    },
    factionRelations: {
      los_cubanos: 30, zoe_pound: 0, eastern_bloc: -20,
      southern_boys: -10, colombian_connection: 20, dixie_mafia: 0,
      port_authority: 10,
    },
    trades: { sells: ['intel', 'connections'], buys: ['cocaine'] },
    missionTypes: ['stash_hunt', 'old_contact', 'mentor_mission', 'legacy_recovery'],
    warTriggers: ['disrespect_legacy', 'steal_stash', 'betray_trust'],
    uniqueMechanic: 'hidden_stashes', // Random stash discoveries if allied
    desc: 'Ghosts of 1980s Miami. Hidden caches, dormant connections, institutional knowledge of the trade.',
  },
  {
    id: 'port_authority', name: 'The Port Authority', emoji: '⚓',
    territory: ['the_port'],
    specialty: 'smuggling',
    leader: { name: 'Frank Castellano', title: 'The Gatekeeper', age: 62, style: 'Union boss with deep political connections. Controls what gets inspected.' },
    strength: 4, soldiers: [5, 12], dmg: [8, 14],
    strengths: 'Absolute control over port logistics. Political protection. Legitimate income. DEA-proof.',
    weaknesses: 'Greedy. Works with everyone, loyal to no one. Takes better deals from rivals. No muscle.',
    operatingStyle: 'Broker/gatekeeper. Does not care about product or wars. Cares about his cut.',
    color: '#4682B4',
    characterRelations: {
      corner_kid: -80, dropout: -80, ex_con: -20, hustler: 30,
      connected_kid: 0, cleanskin: 0, veteran: -20, immigrant: 20,
    },
    factionRelations: {
      los_cubanos: 10, zoe_pound: 10, eastern_bloc: 20,
      southern_boys: -20, colombian_connection: 30, dixie_mafia: 10,
      cartel_remnants: 10,
    },
    trades: { sells: ['port_access', 'smuggling_routes'], buys: [] },
    missionTypes: ['dock_job', 'customs_bribe', 'container_heist', 'union_favor'],
    warTriggers: ['bypass_port', 'expose_corruption', 'refuse_payment'],
    uniqueMechanic: 'port_control', // Required for sea imports — controls import pricing
    desc: 'The gatekeeper. Nothing enters Miami by sea without his blessing. Pay him or find another way.',
  },
];

// Faction relationship levels
const FACTION_RELATION_LEVELS = [
  { id: 'allied', name: 'Allied', emoji: '🤝', min: 80, color: '#00ff00' },
  { id: 'friendly', name: 'Friendly', emoji: '😊', min: 40, color: '#88ff00' },
  { id: 'warm', name: 'Warm', emoji: '🙂', min: 20, color: '#ccff00' },
  { id: 'neutral', name: 'Neutral', emoji: '😐', min: -10, color: '#ffff00' },
  { id: 'cold', name: 'Cold', emoji: '😒', min: -30, color: '#ffaa00' },
  { id: 'hostile', name: 'Hostile', emoji: '😠', min: -60, color: '#ff4400' },
  { id: 'war', name: 'At War', emoji: '⚔️', min: -100, color: '#ff0000' },
];

function getFactionRelationLevel(value) {
  for (const level of FACTION_RELATION_LEVELS) {
    if (value >= level.min) return level;
  }
  return FACTION_RELATION_LEVELS[FACTION_RELATION_LEVELS.length - 1];
}

// Initialize faction state for game
function initFactionState(characterId) {
  // Build Miami faction data
  const miamiData = {};
  for (const faction of MIAMI_FACTIONS) {
    const startRel = (characterId && faction.characterRelations[characterId]) || 0;
    miamiData[faction.id] = {
      relation: startRel,
      discovered: startRel > -100,
      atWar: false,
      warDay: 0,
      missionsCompleted: 0,
      betrayals: 0,
      lastInteraction: 0,
      tradeAccess: startRel >= 20,
      supplierAccess: startRel >= 40,
      territoryPact: false,
    };
  }
  // Colombian Connection always undiscovered initially (except connected_kid)
  if (characterId !== 'connected_kid' && miamiData.colombian_connection) {
    miamiData.colombian_connection.discovered = false;
  }

  // Build backward-compatible structure for old faction-system.js UI
  const standings = {};
  const factionPower = {};
  const factionTerritory = {};
  // Map old FACTIONS to standings from Miami factions where possible
  if (typeof FACTIONS !== 'undefined') {
    for (const f of FACTIONS) {
      // Try to find a Miami faction that maps to this old faction
      const mapping = {
        colombian_cartel: 'colombian_connection',
        mexican_cartel: 'miami_cartel_remnants',
        italian_mafia: 'dixie_mafia',
        russian_mob: 'eastern_bloc',
        yakuza: 'eastern_bloc',
        chinese_triad: 'port_authority',
        jamaican_posse: 'zoe_pound',
        biker_gang: 'southern_boys',
      };
      const miamiId = mapping[f.id];
      const mRel = miamiId && miamiData[miamiId] ? miamiData[miamiId].relation : 0;
      standings[f.id] = mRel;
      factionPower[f.id] = f.strength;
      factionTerritory[f.id] = [...f.territory];
    }
  }

  // Return merged object: top-level has old-format props AND per-faction Miami data
  const result = {
    // Old format properties (for backward compat with faction-system.js & renderFactions)
    standings,
    alliances: {},
    wars: {},
    factionPower,
    factionTerritory,
    absorptions: [],
    factionEvents: [],
    diplomacyCooldowns: {},
  };

  // Merge in Miami faction data at top level
  for (const [key, val] of Object.entries(miamiData)) {
    result[key] = val;
  }

  return result;
}

// Get faction by ID
function getFactionById(factionId) {
  return MIAMI_FACTIONS.find(f => f.id === factionId) || null;
}

// Adjust faction relation
function adjustFactionRelation(state, factionId, amount, reason) {
  if (!state.factions) return;
  if (!state.factions[factionId]) return;
  const old = state.factions[factionId].relation;
  state.factions[factionId].relation = Math.max(-100, Math.min(100, old + amount));
  const newVal = state.factions[factionId].relation;

  // Update access levels
  state.factions[factionId].tradeAccess = newVal >= 20;
  state.factions[factionId].supplierAccess = newVal >= 40;

  // Check for war trigger
  if (newVal <= -60 && old > -60) {
    state.factions[factionId].atWar = true;
    state.factions[factionId].warDay = state.day || 0;
  }
  // Check for peace
  if (newVal > -40 && state.factions[factionId].atWar) {
    state.factions[factionId].atWar = false;
  }

  // Ripple effect — allied factions shift too
  const faction = getFactionById(factionId);
  if (faction && faction.factionRelations) {
    for (const [otherId, baseRel] of Object.entries(faction.factionRelations)) {
      if (!state.factions[otherId]) continue;
      // Allied factions shift same direction, rival factions shift opposite
      const ripple = Math.sign(baseRel) * Math.sign(amount) * Math.floor(Math.abs(amount) * 0.15);
      if (ripple !== 0) {
        state.factions[otherId].relation = Math.max(-100, Math.min(100, state.factions[otherId].relation + ripple));
      }
    }
  }
}

// Process daily faction events
function processFactionDaily(state) {
  if (!state.factions) return [];
  const msgs = [];

  for (const faction of MIAMI_FACTIONS) {
    const fs = state.factions[faction.id];
    if (!fs || !fs.discovered) continue;

    // Slow relation drift toward neutral (relationships decay)
    if (fs.relation > 5 && Math.random() < 0.02) {
      fs.relation = Math.max(0, fs.relation - 1);
    } else if (fs.relation < -5 && Math.random() < 0.01) {
      fs.relation = Math.min(0, fs.relation + 1);
    }

    // War effects
    if (fs.atWar) {
      // 10% chance of attack per day during war
      if (Math.random() < 0.10) {
        const damage = faction.soldiers[0] * (faction.dmg[0] + Math.random() * (faction.dmg[1] - faction.dmg[0]));
        msgs.push(`⚔️ ${faction.emoji} ${faction.name} attacks! War continues...`);
        // Apply some heat and potential crew damage
        state.heat = Math.min(100, (state.heat || 0) + 3);
      }
    }

    // Faction territory income generation (for AI simulation)
    // This makes factions feel alive — they grow and contract
    if (Math.random() < 0.05) {
      const events = [
        `📡 Intel: ${faction.name} expanding operations in ${faction.territory[0] || 'unknown territory'}.`,
        `📡 Intel: ${faction.name} dealing with internal disputes.`,
        `📡 Intel: ${faction.name} recruiting new members.`,
      ];
      // Only show if player has discovered this faction
      if (fs.discovered && Math.random() < 0.3) {
        msgs.push(events[Math.floor(Math.random() * events.length)]);
      }
    }
  }

  return msgs;
}

// Get available faction missions
function getAvailableFactionMissions(state, factionId) {
  const fs = state.factions && state.factions[factionId];
  if (!fs || !fs.discovered || fs.atWar) return [];
  const faction = getFactionById(factionId);
  if (!faction) return [];

  const relLevel = getFactionRelationLevel(fs.relation);
  const missions = [];

  // Basic missions available at neutral+
  if (fs.relation >= -10) {
    missions.push({
      id: `${factionId}_errand`,
      name: `Run Errand for ${faction.name}`,
      desc: `Complete a simple task to build trust with ${faction.name}.`,
      difficulty: 1,
      reward: { cash: 1000, rep: 2, factionRep: 5 },
    });
  }

  // Trade missions at warm+
  if (fs.relation >= 20) {
    missions.push({
      id: `${factionId}_trade`,
      name: `Trade Deal with ${faction.name}`,
      desc: `Facilitate a product exchange with ${faction.name}.`,
      difficulty: 2,
      reward: { cash: 3000, rep: 3, factionRep: 8 },
    });
  }

  // High-value missions at friendly+
  if (fs.relation >= 40) {
    missions.push({
      id: `${factionId}_operation`,
      name: `Joint Operation with ${faction.name}`,
      desc: `Run a coordinated operation with ${faction.name}.`,
      difficulty: 4,
      reward: { cash: 10000, rep: 5, factionRep: 15 },
    });
  }

  // Elite missions at allied
  if (fs.relation >= 80) {
    missions.push({
      id: `${factionId}_elite`,
      name: `${faction.name} Inner Circle Mission`,
      desc: `A high-stakes operation for trusted allies only.`,
      difficulty: 6,
      reward: { cash: 50000, rep: 10, factionRep: 25 },
    });
  }

  return missions;
}
