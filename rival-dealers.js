// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Rival Dealer AI System
// AI-controlled rival empires that grow, trade, and compete
// ============================================================

const RIVAL_CONFIG = {
  maxRivals: 6,
  spawnChancePerDay: 0.02,
  growthRate: 0.03, // 3% daily growth potential
  aggressionScale: {
    passive: 0.1,
    cautious: 0.3,
    balanced: 0.5,
    aggressive: 0.7,
    ruthless: 0.9,
  },
};

// Rival dealer templates
const RIVAL_TEMPLATES = [
  {
    id: 'street_hustler', name: 'Street Hustler', emoji: '🧢',
    tier: 1, // Small-time
    startingCash: 5000, startingTerritory: 1,
    aggression: 'cautious', specialty: 'weed',
    growth: 'slow', maxTerritory: 3,
    desc: 'Small-time street dealer. Stays in their lane.',
  },
  {
    id: 'corner_boss', name: 'Corner Boss', emoji: '💪',
    tier: 2,
    startingCash: 20000, startingTerritory: 2,
    aggression: 'balanced', specialty: 'crack',
    growth: 'moderate', maxTerritory: 5,
    desc: 'Controls a few blocks. Growing ambition.',
  },
  {
    id: 'district_chief', name: 'District Chief', emoji: '🎩',
    tier: 3,
    startingCash: 100000, startingTerritory: 3,
    aggression: 'aggressive', specialty: 'cocaine',
    growth: 'fast', maxTerritory: 8,
    desc: 'Runs a whole district. Serious operation.',
  },
  {
    id: 'syndicate_leader', name: 'Syndicate Leader', emoji: '🏴',
    tier: 4,
    startingCash: 500000, startingTerritory: 5,
    aggression: 'ruthless', specialty: 'multi',
    growth: 'fast', maxTerritory: 12,
    desc: 'Major criminal organization. Rival empire.',
  },
  {
    id: 'cartel_lieutenant', name: 'Cartel Lieutenant', emoji: '🦅',
    tier: 5,
    startingCash: 1000000, startingTerritory: 4,
    aggression: 'ruthless', specialty: 'cocaine',
    growth: 'explosive', maxTerritory: 15,
    desc: 'Backed by cartel money. Extremely dangerous.',
  },
];

// Random name generation for rivals
const RIVAL_FIRST_NAMES = ['Marcus', 'Diego', 'Viktor', 'Jean', 'Bobby', 'Alejandro', 'Tyrone', 'Chen', 'Ibrahim', 'Nikolai', 'DeShawn', 'Miguel', 'Andre', 'Sergei', 'Emilio', 'Dante', 'Hector', 'Rashad'];
const RIVAL_NICKNAMES = ['Ice', 'Shadow', 'King', 'Ghost', 'Snake', 'Bull', 'Razor', 'Smoke', 'Ace', 'Viper', 'Tank', 'Slim', 'Big', 'Lil', 'Boss', 'Professor', 'Doc', 'Machete'];
const RIVAL_LAST_NAMES = ['Rodriguez', 'Thompson', 'Kozlov', 'Baptiste', 'Sims', 'Morales', 'Jackson', 'Chen', 'Diallo', 'Petrov', 'Williams', 'Hernandez', 'Davis', 'Volkov', 'Cruz', 'Carter'];

function generateRivalName() {
  const first = RIVAL_FIRST_NAMES[Math.floor(Math.random() * RIVAL_FIRST_NAMES.length)];
  const nick = RIVAL_NICKNAMES[Math.floor(Math.random() * RIVAL_NICKNAMES.length)];
  const last = RIVAL_LAST_NAMES[Math.floor(Math.random() * RIVAL_LAST_NAMES.length)];
  return `${first} "${nick}" ${last}`;
}

// Initialize rival state
function initRivalState() {
  return {
    rivals: [],
    defeatedRivals: [],
    totalRivalsDefeated: 0,
    rivalWars: 0,
  };
}

// Spawn a new rival
function spawnRival(state) {
  if (!state.rivalState) state.rivalState = initRivalState();
  // Game day scaling: more rivals allowed as game progresses
  var maxRivalsNow = RIVAL_CONFIG.maxRivals;
  if (typeof getGameDayScaling === 'function') {
    var rivalScale = getGameDayScaling(state);
    maxRivalsNow = rivalScale.maxRivals || RIVAL_CONFIG.maxRivals;
  }
  if (state.rivalState.rivals.length >= maxRivalsNow) return null;

  // Determine tier based on player's progression
  const playerPower = calculatePlayerPower(state);
  let maxTier = 1;
  if (playerPower > 100) maxTier = 2;
  if (playerPower > 300) maxTier = 3;
  if (playerPower > 800) maxTier = 4;
  if (playerPower > 2000 || (state.newGamePlus && state.newGamePlus.active)) maxTier = 5;

  const availableTemplates = RIVAL_TEMPLATES.filter(t => t.tier <= maxTier);
  const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

  // Pick a district the player doesn't control
  const playerTerritories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
  const allDistricts = typeof MIAMI_DISTRICTS !== 'undefined' ? MIAMI_DISTRICTS.map(d => d.id) : [];
  const availableDistricts = allDistricts.filter(d => !playerTerritories.includes(d));
  if (availableDistricts.length === 0) return null;

  const baseDistrict = availableDistricts[Math.floor(Math.random() * availableDistricts.length)];

  const rival = {
    id: `rival_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: generateRivalName(),
    emoji: template.emoji,
    template: template.id,
    tier: template.tier,
    cash: template.startingCash * (0.8 + Math.random() * 0.4),
    territories: [baseDistrict],
    maxTerritory: template.maxTerritory,
    crew: template.startingTerritory * 3,
    aggression: template.aggression,
    specialty: template.specialty,
    growth: template.growth,
    power: template.startingCash / 100,
    relation: 0, // -100 to 100, starts neutral
    atWar: false,
    spawnDay: state.day,
    alive: true,
    faction: null, // May be aligned with a faction
    desc: template.desc,
  };

  // Chance to align with a faction
  if (typeof MIAMI_FACTIONS !== 'undefined' && Math.random() < 0.4) {
    const districtData = typeof getDistrictById === 'function' ? getDistrictById(baseDistrict) : null;
    if (districtData && districtData.gangPresence && districtData.gangPresence.length > 0) {
      rival.faction = districtData.gangPresence[0];
    }
  }

  state.rivalState.rivals.push(rival);
  return rival;
}

// Calculate player's overall power level
function calculatePlayerPower(state) {
  let power = 0;
  power += (state.cash || 0) / 1000;
  power += (state.henchmen || []).length * 20;
  power += (state.reputation || 0) * 2;
  const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
  power += territories.length * 30;
  return Math.floor(power);
}

// Process daily rival AI
function processRivalsDaily(state) {
  if (!state.rivalState) state.rivalState = initRivalState();
  const msgs = [];

  // Chance to spawn new rival
  if (state.day > 10 && Math.random() < RIVAL_CONFIG.spawnChancePerDay) {
    const newRival = spawnRival(state);
    if (newRival && newRival.tier >= 2) {
      msgs.push(`📡 Intel: New player in town — ${newRival.name} (${newRival.emoji}). Operating in ${newRival.territories[0].replace(/_/g, ' ')}.`);
    }
  }

  // Process each rival
  for (const rival of state.rivalState.rivals) {
    if (!rival.alive) continue;

    // Growth (scales with game day - rivals get stronger over time)
    var baseGrowth = rival.growth === 'slow' ? 0.01 : rival.growth === 'moderate' ? 0.03 : rival.growth === 'fast' ? 0.05 : 0.08;
    var rivalDayScale = typeof getGameDayScaling === 'function' ? getGameDayScaling(state).rivalPowerMod || 1.0 : 1.0;
    const growthMod = baseGrowth * rivalDayScale;
    rival.cash *= (1 + growthMod);
    rival.power = rival.cash / 100 * rivalDayScale;
    rival.crew = Math.min(rival.maxTerritory * 5, rival.crew + (Math.random() < growthMod * 5 ? 1 : 0));

    // Territory expansion
    if (rival.territories.length < rival.maxTerritory && Math.random() < growthMod) {
      const playerTerritories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      const otherRivalTerritories = state.rivalState.rivals
        .filter(r => r.id !== rival.id && r.alive)
        .flatMap(r => r.territories);
      const allDistricts = typeof MIAMI_DISTRICTS !== 'undefined' ? MIAMI_DISTRICTS.map(d => d.id) : [];
      const available = allDistricts.filter(d =>
        !rival.territories.includes(d) &&
        !playerTerritories.includes(d) &&
        !otherRivalTerritories.includes(d)
      );
      if (available.length > 0) {
        const newTerr = available[Math.floor(Math.random() * available.length)];
        rival.territories.push(newTerr);
        if (rival.tier >= 3) {
          msgs.push(`📡 ${rival.emoji} ${rival.name} has expanded into ${newTerr.replace(/_/g, ' ')}.`);
        }
      }
    }

    // Aggression toward player
    const aggressionLevel = RIVAL_CONFIG.aggressionScale[rival.aggression] || 0.5;
    const playerPower = calculatePlayerPower(state);
    const powerRatio = rival.power / Math.max(1, playerPower);

    // Attack player territory?
    if (rival.atWar || (powerRatio > 0.5 && Math.random() < aggressionLevel * 0.02)) {
      const playerTerritories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      // Only attack adjacent territories
      const adjacentToRival = playerTerritories.filter(pt =>
        rival.territories.some(rt => areDistrictsAdjacent(rt, pt))
      );
      if (adjacentToRival.length > 0 && Math.random() < aggressionLevel * 0.1) {
        const target = adjacentToRival[Math.floor(Math.random() * adjacentToRival.length)];
        msgs.push(`⚔️ ${rival.emoji} ${rival.name} is threatening your territory in ${target.replace(/_/g, ' ')}!`);
        rival.relation -= 10;
        if (!rival.atWar && rival.relation < -50) {
          rival.atWar = true;
          state.rivalState.rivalWars++;
          msgs.push(`🔥 ${rival.emoji} ${rival.name} has declared WAR on your organization!`);
        }
      }
    }

    // Rival-vs-rival conflicts (makes world feel alive)
    if (Math.random() < 0.01) {
      const otherRivals = state.rivalState.rivals.filter(r => r.id !== rival.id && r.alive);
      if (otherRivals.length > 0) {
        const enemy = otherRivals[Math.floor(Math.random() * otherRivals.length)];
        if (Math.random() < 0.3) {
          msgs.push(`📡 Street talk: ${rival.name} and ${enemy.name} are beefing over territory.`);
        }
      }
    }

    // Natural death/arrest of rival (small chance)
    if (Math.random() < 0.002) {
      rival.alive = false;
      state.rivalState.defeatedRivals.push(rival.name);
      const reasons = ['arrested by DEA', 'killed in a deal gone wrong', 'fled the country', 'overthrown by their own crew'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      msgs.push(`💀 ${rival.emoji} ${rival.name} is out of the game — ${reason}.`);
    }
  }

  // Clean up dead rivals
  state.rivalState.rivals = state.rivalState.rivals.filter(r => r.alive);

  return msgs;
}

// Check if two districts are adjacent (simplified adjacency)
function areDistrictsAdjacent(d1, d2) {
  const adjacencyMap = {
    liberty_city: ['little_haiti', 'overtown', 'miami_gardens'],
    overtown: ['liberty_city', 'wynwood', 'downtown', 'little_havana'],
    little_havana: ['overtown', 'downtown', 'coral_gables', 'hialeah'],
    wynwood: ['overtown', 'downtown', 'south_beach', 'little_haiti'],
    downtown: ['overtown', 'wynwood', 'south_beach', 'little_havana', 'coral_gables', 'the_port'],
    south_beach: ['wynwood', 'downtown'],
    little_haiti: ['liberty_city', 'wynwood', 'hialeah'],
    hialeah: ['little_haiti', 'little_havana', 'opa_locka', 'miami_gardens'],
    opa_locka: ['hialeah', 'miami_gardens'],
    coral_gables: ['little_havana', 'downtown', 'kendall'],
    kendall: ['coral_gables', 'the_keys'],
    the_port: ['downtown'],
    miami_gardens: ['liberty_city', 'hialeah', 'opa_locka'],
    the_keys: ['kendall'],
  };

  return (adjacencyMap[d1] || []).includes(d2);
}

// Get rival info for display
function getRivalInfo(state) {
  if (!state.rivalState) return { rivals: [], defeated: 0, totalWars: 0 };
  return {
    rivals: state.rivalState.rivals.filter(r => r.alive).map(r => ({
      name: r.name,
      emoji: r.emoji,
      tier: r.tier,
      territories: r.territories.length,
      power: Math.floor(r.power),
      atWar: r.atWar,
      relation: r.relation,
      faction: r.faction,
      specialty: r.specialty,
    })),
    defeated: state.rivalState.defeatedRivals.length,
    totalWars: state.rivalState.rivalWars,
  };
}

// Defeat a rival (from combat/missions)
function defeatRival(state, rivalId) {
  if (!state.rivalState) return;
  const rival = state.rivalState.rivals.find(r => r.id === rivalId);
  if (!rival) return;

  rival.alive = false;
  state.rivalState.defeatedRivals.push(rival.name);
  state.rivalState.totalRivalsDefeated++;

  // Absorb some of their territories
  for (const terr of rival.territories) {
    if (state.territory && !state.territory[terr]) {
      state.territory[terr] = { controlled: true };
    }
  }

  // Cash reward
  const reward = Math.floor(rival.cash * 0.3);
  state.cash += reward;

  return { name: rival.name, reward, territories: rival.territories };
}
