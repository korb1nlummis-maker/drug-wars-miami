// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Faction & Alliance System
// ============================================================

const FACTIONS = [
  { id: 'colombian_cartel', name: 'Colombian Cartel', emoji: '🇨🇴', color: '#ff4444',
    territory: ['miami', 'bogota', 'medellin'], specialty: 'cocaine',
    strength: 90, aggression: 0.7, loyalty: 0.6,
    leader: { name: 'El Patrón', personality: 'aggressive', emoji: '👔' },
    desc: 'The dominant cocaine suppliers. Ruthless and well-connected.' },
  { id: 'mexican_syndicate', name: 'Mexican Syndicate', emoji: '🇲🇽', color: '#ff9500',
    territory: ['mexico_city', 'tijuana'], specialty: 'heroin',
    strength: 85, aggression: 0.6, loyalty: 0.5,
    leader: { name: 'El Jefe', personality: 'cautious', emoji: '🎩' },
    desc: 'Cross-border operators with diverse product lines.' },
  { id: 'italian_mob', name: 'Italian Mob', emoji: '🇮🇹', color: '#8844ff',
    territory: ['new_york', 'chicago'], specialty: 'heroin',
    strength: 75, aggression: 0.4, loyalty: 0.8,
    leader: { name: 'Don Salvatore', personality: 'diplomatic', emoji: '🤵' },
    desc: 'Old school organized crime. Honor-bound but deadly.' },
  { id: 'jamaican_posse', name: 'Jamaican Posse', emoji: '🇯🇲', color: '#44ff44',
    territory: ['miami', 'kingston'], specialty: 'weed',
    strength: 55, aggression: 0.8, loyalty: 0.4,
    leader: { name: 'Rude Boy Marcus', personality: 'aggressive', emoji: '🦁' },
    desc: 'Fearless and unpredictable. Control the ganja trade.' },
  { id: 'chinese_triad', name: 'Chinese Triad', emoji: '🇨🇳', color: '#ff2222',
    territory: ['hong_kong', 'tokyo', 'bangkok'], specialty: 'opium',
    strength: 80, aggression: 0.3, loyalty: 0.7,
    leader: { name: 'Dragon Master Chen', personality: 'cautious', emoji: '🐉' },
    desc: 'Ancient criminal empire. Patient and methodical.' },
  { id: 'russian_bratva', name: 'Russian Bratva', emoji: '🇷🇺', color: '#4488ff',
    territory: ['moscow'], specialty: 'meth',
    strength: 70, aggression: 0.65, loyalty: 0.3,
    leader: { name: 'Viktor "The Bear"', personality: 'erratic', emoji: '🐻' },
    desc: 'Brutal and unpredictable. No honor among thieves.' },
  { id: 'street_kings', name: 'Street Kings', emoji: '👑', color: '#ffcc00',
    territory: ['detroit', 'los_angeles'], specialty: 'crack',
    strength: 50, aggression: 0.75, loyalty: 0.5,
    leader: { name: 'King Darius', personality: 'aggressive', emoji: '👑' },
    desc: 'Local gang with big ambitions. Growing fast.' },
  { id: 'euro_syndicate', name: 'Euro Syndicate', emoji: '🇪🇺', color: '#00ccff',
    territory: ['amsterdam', 'london', 'paris'], specialty: 'ecstasy',
    strength: 65, aggression: 0.3, loyalty: 0.6,
    leader: { name: 'The Architect', personality: 'diplomatic', emoji: '🏗️' },
    desc: 'High-tech operation. Clean, efficient, and profitable.' },
];

const ALLIANCE_TYPES = [
  { id: 'defense', name: 'Mutual Defense', emoji: '🛡️', repReq: 50, cost: 10000,
    benefits: ['Territory defense +30%', 'Shared enemy intel'],
    desc: 'If they attack us, we fight together.' },
  { id: 'trade', name: 'Trade Agreement', emoji: '🤝', repReq: 30, cost: 5000,
    benefits: ['Buy their specialty at 20% discount', 'Access their territory safely'],
    desc: 'Open trade routes between our operations.' },
  { id: 'nonaggression', name: 'Non-Aggression Pact', emoji: '✌️', repReq: 15, cost: 2000,
    benefits: ['No random encounters in their territory', 'Reduced heat when near them'],
    desc: 'We stay out of each other\'s way.' },
  { id: 'joint_venture', name: 'Joint Venture', emoji: '💰', repReq: 70, cost: 25000,
    benefits: ['Shared processing facilities', 'Combined distribution', 'Profit sharing'],
    desc: 'Full partnership on a major operation.' },
];

const FACTION_EVENTS = [
  { id: 'territory_skirmish', name: 'Territory Skirmish', chance: 0.03,
    desc: 'Two factions clash over territory' },
  { id: 'faction_expansion', name: 'Faction Expansion', chance: 0.02,
    desc: 'A faction expands into new territory' },
  { id: 'leadership_change', name: 'Leadership Change', chance: 0.01,
    desc: 'A faction\'s leader is replaced' },
  { id: 'betrayal', name: 'Alliance Betrayal', chance: 0.005,
    desc: 'A faction breaks their alliance' },
  { id: 'merger', name: 'Faction Merger', chance: 0.005,
    desc: 'Two weak factions merge into one' },
];

// ============================================================
// FACTION STATE
// ============================================================
function initFactionState() {
  return {
    standings: {}, // { factionId: -100 to 100 }
    alliances: {}, // { factionId: allianceType }
    wars: {}, // { factionId: { startDay, playerInitiated, battles } }
    factionPower: {}, // { factionId: strength }
    factionTerritory: {}, // { factionId: [locationIds] }
    absorptions: [], // factions absorbed by player
    factionEvents: [], // recent faction events
    diplomacyCooldowns: {}, // { factionId: nextAvailableDay }
  };
}

function ensureFactionState(state) {
  if (!state.factions) state.factions = initFactionState();
  const f = state.factions;
  // Initialize standings for all factions
  for (const faction of FACTIONS) {
    if (f.standings[faction.id] === undefined) f.standings[faction.id] = 0;
    if (f.factionPower[faction.id] === undefined) f.factionPower[faction.id] = faction.strength;
    if (!f.factionTerritory[faction.id]) f.factionTerritory[faction.id] = [...faction.territory];
  }
  return f;
}

// ============================================================
// FACTION REPUTATION
// ============================================================
function adjustFactionStanding(state, factionId, amount) {
  ensureFactionState(state);
  const current = state.factions.standings[factionId] || 0;
  state.factions.standings[factionId] = Math.max(-100, Math.min(100, current + amount));

  // Check if standings affect alliances
  const standing = state.factions.standings[factionId];
  if (standing <= -50 && !state.factions.wars[factionId]) {
    // Auto-war declaration from faction
    declareWar(state, factionId, false);
  }
}

function getFactionStanding(state, factionId) {
  ensureFactionState(state);
  const standing = state.factions.standings[factionId] || 0;
  if (standing >= 75) return { level: 'allied', label: 'Allied', color: '#00ff88', emoji: '💚' };
  if (standing >= 50) return { level: 'friendly', label: 'Friendly', color: '#88ff00', emoji: '💛' };
  if (standing >= 15) return { level: 'neutral_positive', label: 'Cordial', color: '#cccc00', emoji: '🤝' };
  if (standing >= -15) return { level: 'neutral', label: 'Neutral', color: '#888888', emoji: '➖' };
  if (standing >= -50) return { level: 'unfriendly', label: 'Unfriendly', color: '#ff8800', emoji: '⚠️' };
  if (standing >= -75) return { level: 'hostile', label: 'Hostile', color: '#ff4400', emoji: '❌' };
  return { level: 'war', label: 'At War', color: '#ff0000', emoji: '⚔️' };
}

// ============================================================
// ALLIANCES
// ============================================================
function canFormAlliance(state, factionId, allianceType) {
  ensureFactionState(state);
  const alliance = ALLIANCE_TYPES.find(a => a.id === allianceType);
  if (!alliance) return { ok: false, reason: 'Unknown alliance type' };

  const standing = state.factions.standings[factionId] || 0;
  if (standing < alliance.repReq) return { ok: false, reason: `Need ${alliance.repReq} standing (have ${standing})` };
  if (state.cash < alliance.cost) return { ok: false, reason: `Need $${alliance.cost.toLocaleString()}` };
  if (state.factions.alliances[factionId]) return { ok: false, reason: 'Already have an alliance' };
  if (state.factions.wars[factionId]) return { ok: false, reason: 'Currently at war' };

  const cooldown = state.factions.diplomacyCooldowns[factionId] || 0;
  if (state.day < cooldown) return { ok: false, reason: `Diplomacy cooldown until day ${cooldown}` };

  return { ok: true };
}

function formAlliance(state, factionId, allianceType) {
  const check = canFormAlliance(state, factionId, allianceType);
  if (!check.ok) return { success: false, msg: check.reason };

  const alliance = ALLIANCE_TYPES.find(a => a.id === allianceType);
  const faction = FACTIONS.find(f => f.id === factionId);

  state.cash -= alliance.cost;
  state.factions.alliances[factionId] = allianceType;
  adjustFactionStanding(state, factionId, 15);

  // Rival factions lose standing
  for (const f of FACTIONS) {
    if (f.id !== factionId && f.territory.some(t => faction.territory.includes(t))) {
      adjustFactionStanding(state, f.id, -10);
    }
  }

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'trust', 3);
    adjustRep(state, 'streetCred', 2);
  }

  return { success: true, msg: `${alliance.emoji} Formed ${alliance.name} with ${faction.name}!` };
}

function breakAlliance(state, factionId) {
  ensureFactionState(state);
  if (!state.factions.alliances[factionId]) return { success: false, msg: 'No alliance to break' };

  const faction = FACTIONS.find(f => f.id === factionId);
  delete state.factions.alliances[factionId];
  adjustFactionStanding(state, factionId, -30);
  state.factions.diplomacyCooldowns[factionId] = state.day + 60;

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'trust', -5);
  }

  return { success: true, msg: `💔 Broke alliance with ${faction ? faction.name : factionId}. They won't forget.` };
}

// ============================================================
// WARS
// ============================================================
function declareWar(state, factionId, playerInitiated) {
  ensureFactionState(state);
  if (state.factions.wars[factionId]) return { success: false, msg: 'Already at war' };

  const faction = FACTIONS.find(f => f.id === factionId);
  if (state.factions.alliances[factionId]) delete state.factions.alliances[factionId];

  state.factions.wars[factionId] = {
    startDay: state.day,
    playerInitiated,
    battles: 0,
    playerWins: 0,
    factionWins: 0,
  };

  adjustFactionStanding(state, factionId, -40);

  // Allied factions of the enemy also lose standing
  for (const [fId, alliance] of Object.entries(state.factions.alliances)) {
    if (fId !== factionId) {
      const f = FACTIONS.find(ff => ff.id === fId);
      if (f && f.territory.some(t => faction.territory.includes(t))) {
        adjustFactionStanding(state, fId, -15);
      }
    }
  }

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'fear', 5);
    adjustRep(state, 'heatSignature', 8);
  }

  return { success: true, msg: `⚔️ ${playerInitiated ? 'You declared war on' : 'War declared by'} ${faction ? faction.name : factionId}!` };
}

function resolveFactionBattle(state, factionId) {
  ensureFactionState(state);
  const war = state.factions.wars[factionId];
  if (!war) return null;

  const faction = FACTIONS.find(f => f.id === factionId);
  const factionPower = state.factions.factionPower[factionId] || faction.strength;

  // Player power: crew + weapons + territory count
  let playerPower = 20;
  if (state.henchmen) {
    playerPower += state.henchmen.filter(h => !h.injured).length * 10;
    if (typeof getCrewCombatValue === 'function') {
      playerPower += getCrewCombatValue(state);
    }
  }
  const territoryCount = state.territory ? Object.keys(state.territory).length : 0;
  playerPower += territoryCount * 5;

  // Random factor
  const playerRoll = playerPower * (0.6 + Math.random() * 0.8);
  const factionRoll = factionPower * (0.6 + Math.random() * 0.8);

  war.battles++;
  const playerWon = playerRoll > factionRoll;

  if (playerWon) {
    war.playerWins++;
    state.factions.factionPower[factionId] = Math.max(10, factionPower - 10);
    adjustFactionStanding(state, factionId, -5);
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'fear', 3);
      adjustRep(state, 'streetCred', 2);
    }
  } else {
    war.factionWins++;
    // Player takes damage
    const damage = 5 + Math.floor(Math.random() * 15);
    state.health = Math.max(0, state.health - damage);
    // Possible crew injuries
    if (state.henchmen && state.henchmen.length > 0 && Math.random() < 0.3) {
      const crew = state.henchmen.filter(h => !h.injured);
      if (crew.length > 0) {
        const target = crew[Math.floor(Math.random() * crew.length)];
        target.injured = true;
        target.health = Math.max(10, (target.health || 100) - 30);
      }
    }
  }

  // Check for war end
  if (war.playerWins >= 3) {
    // Player wins the war
    delete state.factions.wars[factionId];
    state.factions.factionPower[factionId] = Math.max(10, factionPower - 30);
    state.factions.diplomacyCooldowns[factionId] = state.day + 30;

    // Can absorb weakened faction
    if (state.factions.factionPower[factionId] <= 20) {
      return { result: 'war_won', canAbsorb: true, msg: `⚔️ You crushed ${faction.name}! They're weakened enough to absorb.`, playerWon: true };
    }
    return { result: 'war_won', canAbsorb: false, msg: `⚔️ You won the war against ${faction.name}!`, playerWon: true };
  }

  if (war.factionWins >= 3) {
    // Faction wins the war
    delete state.factions.wars[factionId];
    state.factions.diplomacyCooldowns[factionId] = state.day + 60;
    // Player loses a territory to them
    if (state.territory && Object.keys(state.territory).length > 0) {
      const territories = Object.keys(state.territory);
      const lost = territories[Math.floor(Math.random() * territories.length)];
      delete state.territory[lost];
      return { result: 'war_lost', msg: `💀 ${faction.name} won the war! You lost territory: ${lost}`, playerWon: false };
    }
    return { result: 'war_lost', msg: `💀 ${faction.name} won the war!`, playerWon: false };
  }

  return {
    result: 'battle',
    playerWon,
    msg: playerWon
      ? `⚔️ Won battle against ${faction.name}! (${war.playerWins}/${3} wins needed)`
      : `💥 Lost battle to ${faction.name}! (They have ${war.factionWins}/${3} wins)`,
  };
}

function absorbFaction(state, factionId) {
  ensureFactionState(state);
  const faction = FACTIONS.find(f => f.id === factionId);
  if (!faction) return { success: false, msg: 'Unknown faction' };

  if ((state.factions.factionPower[factionId] || 0) > 20) {
    return { success: false, msg: 'Faction too strong to absorb. Weaken them in war first.' };
  }

  // Absorb their territories
  const factionTerritories = state.factions.factionTerritory[factionId] || [];
  for (const loc of factionTerritories) {
    if (!state.territory) state.territory = {};
    if (!state.territory[loc]) {
      state.territory[loc] = { controlled: true, defense: 30, income: 500 };
    }
  }

  state.factions.absorptions.push(factionId);
  state.factions.factionPower[factionId] = 0;
  state.factions.factionTerritory[factionId] = [];

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'fear', 10);
    adjustRep(state, 'streetCred', 8);
  }

  // Other factions react
  for (const f of FACTIONS) {
    if (f.id !== factionId && !state.factions.absorptions.includes(f.id)) {
      const personality = f.leader.personality;
      if (personality === 'aggressive') adjustFactionStanding(state, f.id, -15);
      else if (personality === 'cautious') adjustFactionStanding(state, f.id, -10);
      else if (personality === 'diplomatic') adjustFactionStanding(state, f.id, -5);
      else adjustFactionStanding(state, f.id, -12);
    }
  }

  return { success: true, msg: `👑 Absorbed ${faction.name}! Gained ${factionTerritories.length} territories.` };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processFactionDaily(state) {
  ensureFactionState(state);
  const msgs = [];

  // Faction autonomous actions
  for (const faction of FACTIONS) {
    if (state.factions.absorptions.includes(faction.id)) continue;
    if ((state.factions.factionPower[faction.id] || 0) <= 0) continue;

    // Slow power recovery
    const currentPower = state.factions.factionPower[faction.id] || faction.strength;
    if (currentPower < faction.strength) {
      state.factions.factionPower[faction.id] = Math.min(faction.strength, currentPower + 0.5);
    }

    // Random faction events (very low chance daily)
    if (Math.random() < 0.005) {
      const event = FACTION_EVENTS[Math.floor(Math.random() * FACTION_EVENTS.length)];
      if (event.id === 'territory_skirmish') {
        // Two factions fight
        const otherFactions = FACTIONS.filter(f => f.id !== faction.id && !state.factions.absorptions.includes(f.id));
        if (otherFactions.length > 0) {
          const target = otherFactions[Math.floor(Math.random() * otherFactions.length)];
          msgs.push(`⚔️ ${faction.name} clashed with ${target.name} over territory!`);
          state.factions.factionPower[target.id] = Math.max(10, (state.factions.factionPower[target.id] || target.strength) - 5);
        }
      } else if (event.id === 'faction_expansion') {
        msgs.push(`📈 ${faction.name} expanded their operation.`);
        state.factions.factionPower[faction.id] = Math.min(100, currentPower + 5);
      }
    }

    // Active war auto-battles
    if (state.factions.wars[faction.id] && Math.random() < 0.15) {
      const battleResult = resolveFactionBattle(state, faction.id);
      if (battleResult) msgs.push(battleResult.msg);
    }

    // Faction standing drift toward neutral (very slow)
    const standing = state.factions.standings[faction.id] || 0;
    if (Math.abs(standing) > 5 && Math.random() < 0.02) {
      const drift = standing > 0 ? -1 : 1;
      state.factions.standings[faction.id] = standing + drift;
    }
  }

  // Alliance benefits
  for (const [factionId, allianceType] of Object.entries(state.factions.alliances)) {
    if (allianceType === 'trade') {
      // Small passive income from trade agreement
      if (Math.random() < 0.1) {
        const income = 200 + Math.floor(Math.random() * 500);
        state.cash += income;
        msgs.push(`🤝 Trade income from ${FACTIONS.find(f => f.id === factionId)?.name || factionId}: +$${income}`);
      }
    }
  }

  return msgs;
}

// ============================================================
// FACTION TERRITORY CHECK
// ============================================================
function getFactionAtLocation(state, locationId) {
  ensureFactionState(state);
  const result = [];
  for (const faction of FACTIONS) {
    if (state.factions.absorptions.includes(faction.id)) continue;
    const territories = state.factions.factionTerritory[faction.id] || faction.territory;
    if (territories.includes(locationId)) {
      const standing = getFactionStanding(state, faction.id);
      result.push({ faction, standing, power: state.factions.factionPower[faction.id] || faction.strength });
    }
  }
  return result;
}

function isAllyTerritory(state, locationId) {
  const factions = getFactionAtLocation(state, locationId);
  return factions.some(f => state.factions && state.factions.alliances[f.faction.id]);
}

function isEnemyTerritory(state, locationId) {
  const factions = getFactionAtLocation(state, locationId);
  return factions.some(f => state.factions && state.factions.wars[f.faction.id]);
}

// ============================================================
// TRADE DISCOUNT FROM ALLIANCE
// ============================================================
function getFactionTradeDiscount(state, locationId) {
  if (!state.factions) return 1.0;
  const factions = getFactionAtLocation(state, locationId);
  for (const f of factions) {
    if (state.factions.alliances[f.faction.id] === 'trade' ||
        state.factions.alliances[f.faction.id] === 'joint_venture') {
      return 0.8; // 20% discount
    }
  }
  return 1.0;
}

// ============================================================
// PEACE NEGOTIATION
// ============================================================
function negotiatePeace(state, factionId) {
  ensureFactionState(state);
  if (!state.factions.wars[factionId]) return { success: false, msg: 'Not at war' };

  const faction = FACTIONS.find(f => f.id === factionId);
  const factionPower = state.factions.factionPower[factionId] || faction.strength;
  const war = state.factions.wars[factionId];

  // Peace cost depends on who's winning
  const playerWinning = war.playerWins > war.factionWins;
  const baseCost = playerWinning ? 5000 : 20000;
  const cost = baseCost + factionPower * 100;

  if (state.cash < cost) return { success: false, msg: `Peace costs $${cost.toLocaleString()}` };

  // Chance of acceptance based on standings and war status
  let acceptChance = 0.5;
  if (playerWinning) acceptChance += 0.3;
  if (faction.leader.personality === 'diplomatic') acceptChance += 0.2;
  if (faction.leader.personality === 'aggressive') acceptChance -= 0.2;

  if (Math.random() > acceptChance) {
    return { success: false, msg: `${faction.name} rejected your peace offer!` };
  }

  state.cash -= cost;
  delete state.factions.wars[factionId];
  state.factions.standings[factionId] = Math.max(-30, state.factions.standings[factionId] || 0);
  state.factions.diplomacyCooldowns[factionId] = state.day + 30;

  return { success: true, msg: `☮️ Peace negotiated with ${faction.name} for $${cost.toLocaleString()}` };
}
