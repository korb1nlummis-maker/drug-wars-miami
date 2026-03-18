// territory-defense.js — Drug Wars: Miami Vice Edition
// Territory fortification, defense structures, and siege mechanics

// ============================================================
// GLOBAL CONST ARRAYS
// ============================================================

const FORTIFICATION_LEVELS = [
  { level: 0, name: 'Undefended', cost: 0, crewRequired: 0, defenseBonus: 0, desc: 'No defenses. Easy target.' },
  { level: 1, name: 'Guarded', cost: 5000, crewRequired: 1, defenseBonus: 10, desc: '1-2 crew stationed. Basic security.' },
  { level: 2, name: 'Fortified', cost: 25000, crewRequired: 3, defenseBonus: 30, desc: '3-5 crew + cameras. Moderate defense.' },
  { level: 3, name: 'Stronghold', cost: 100000, crewRequired: 6, defenseBonus: 60, desc: '6+ crew + heavy weapons + reinforced buildings.' }
];

const DEFENSE_STRUCTURES = [
  {
    id: 'watchtower', name: 'Watchtower', emoji: '🗼',
    cost: 10000, maintenanceCost: 500,
    effect: 'early_warning', bonus: 1,
    desc: 'Early warning of attacks. +1 round preparation time.'
  },
  {
    id: 'barricade', name: 'Barricade', emoji: '🧱',
    cost: 5000, maintenanceCost: 200,
    effect: 'first_strike', bonus: 0.15,
    desc: 'Slows attackers. Defenders get first strike advantage.'
  },
  {
    id: 'safe_room', name: 'Safe Room', emoji: '🏠',
    cost: 25000, maintenanceCost: 1000,
    effect: 'crew_survival', bonus: 0.5,
    desc: 'Crew survive if territory falls. Stash partially protected.'
  },
  {
    id: 'weapon_cache', name: 'Weapon Cache', emoji: '🔫',
    cost: 15000, maintenanceCost: 750,
    effect: 'defense_combat', bonus: 0.20,
    desc: 'Crew auto-arm during attacks. +20% defense combat.'
  },
  {
    id: 'cctv_network', name: 'CCTV Network', emoji: '📹',
    cost: 20000, maintenanceCost: 1000,
    effect: 'surprise_reduction', bonus: 0.30,
    desc: 'Intelligence on approaching threats. -30% surprise attack chance.'
  }
];

const SIEGE_PHASES = ['warning', 'mobilization', 'battle', 'aftermath', 'counter_attack'];

const ATTACKER_TYPES = [
  { id: 'street_gang', name: 'Street Gang', strengthMin: 10, strengthMax: 25, surpriseFactor: 0.3 },
  { id: 'rival_crew', name: 'Rival Crew', strengthMin: 20, strengthMax: 50, surpriseFactor: 0.2 },
  { id: 'cartel_squad', name: 'Cartel Squad', strengthMin: 40, strengthMax: 80, surpriseFactor: 0.15 },
  { id: 'faction_army', name: 'Faction Army', strengthMin: 60, strengthMax: 120, surpriseFactor: 0.1 }
];

// ============================================================
// STATE INITIALIZATION
// ============================================================

function initTerritoryDefenseState() {
  return {
    fortifications: {},      // { districtId: level (0-3) }
    structures: {},          // { districtId: [structureId, ...] }
    activeSieges: [],        // array of siege objects
    defenseHistory: [],      // completed siege records
    counterAttackAvailable: null, // { districtId, attackerData, expires }
    structureDamage: {},     // { districtId: { structureId: damagePercent } }
    totalDefenseSpending: 0,
    territoriesLost: 0,
    siegesRepelled: 0
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================

function processTerritoryDefenseDaily(state) {
  const td = state.territoryDefense;
  if (!td) return;

  // Process active sieges
  if (td.activeSieges) {
    for (let i = td.activeSieges.length - 1; i >= 0; i--) {
      const siege = td.activeSieges[i];

      if (siege.phase === 'warning') {
        siege.warningDaysRemaining--;
        if (siege.warningDaysRemaining <= 0) {
          siege.phase = 'mobilization';
        }
      } else if (siege.phase === 'mobilization') {
        siege.phase = 'battle';
        resolveSiege(td, i);
      }
    }
  }

  // Expire counter-attack opportunities
  if (td.counterAttackAvailable) {
    td.counterAttackAvailable.expires--;
    if (td.counterAttackAvailable.expires <= 0) {
      td.counterAttackAvailable = null;
    }
  }

  // Structure maintenance costs
  const maintenanceTotal = calculateMaintenanceCosts(td);
  if (maintenanceTotal > 0) {
    state.cash = (state.cash || 0) - maintenanceTotal;
  }

  // Random attack chance based on heat and territory count
  if (td.fortifications) {
    const ownedDistricts = Object.keys(td.fortifications);
    if (ownedDistricts.length > 0) {
      const heat = state.heat || 0;
      const attackChance = 0.02 + (heat * 0.001) + (ownedDistricts.length * 0.005);
      if (Math.random() < attackChance && td.activeSieges && td.activeSieges.length === 0) {
        const targetDistrict = ownedDistricts[Math.floor(Math.random() * ownedDistricts.length)];
        const attackerType = selectAttackerType(state);
        const attackerData = generateAttackerData(attackerType);
        initiateSiege(td, targetDistrict, attackerData);
      }
    }
  }
}

function calculateMaintenanceCosts(state) {
  let total = 0;
  for (const districtId of Object.keys(state.structures)) {
    const structureIds = state.structures[districtId] || [];
    for (const sId of structureIds) {
      const def = DEFENSE_STRUCTURES.find(s => s.id === sId);
      if (def) total += def.maintenanceCost;
    }
  }
  return total;
}

function selectAttackerType(state) {
  const heat = state.heat || 0;
  if (heat > 80) return ATTACKER_TYPES[3];
  if (heat > 50) return ATTACKER_TYPES[2];
  if (heat > 25) return ATTACKER_TYPES[1];
  return ATTACKER_TYPES[0];
}

function generateAttackerData(attackerType) {
  const strength = attackerType.strengthMin +
    Math.floor(Math.random() * (attackerType.strengthMax - attackerType.strengthMin + 1));
  return {
    type: attackerType.id,
    name: attackerType.name,
    strength: strength,
    surpriseFactor: attackerType.surpriseFactor,
    weapons: Math.floor(strength * 0.7),
    crew: Math.ceil(strength / 5)
  };
}

// ============================================================
// FORTIFICATION MANAGEMENT
// ============================================================

function buildFortification(state, districtId, level) {
  if (level < 0 || level > 3) {
    return { success: false, message: 'Invalid fortification level. Must be 0-3.' };
  }

  const currentLevel = state.fortifications[districtId] || 0;
  if (level <= currentLevel) {
    return { success: false, message: `District already at level ${currentLevel}.` };
  }

  const fortDef = FORTIFICATION_LEVELS[level];
  const cost = fortDef.cost;
  const cash = state.cash || 0;

  if (cash < cost) {
    return { success: false, message: `Not enough cash. Need $${cost}, have $${cash}.` };
  }

  state.cash -= cost;
  state.fortifications[districtId] = level;
  state.totalDefenseSpending += cost;

  return { success: true, message: `${districtId} upgraded to ${fortDef.name} (Level ${level}). Cost: $${cost}.` };
}

function buildStructure(state, districtId, structureId) {
  const structDef = DEFENSE_STRUCTURES.find(s => s.id === structureId);
  if (!structDef) {
    return { success: false, message: 'Unknown defense structure.' };
  }

  if (!state.structures[districtId]) {
    state.structures[districtId] = [];
  }

  if (state.structures[districtId].includes(structureId)) {
    return { success: false, message: `${structDef.name} already built in ${districtId}.` };
  }

  const cash = state.cash || 0;
  if (cash < structDef.cost) {
    return { success: false, message: `Not enough cash. Need $${structDef.cost}, have $${cash}.` };
  }

  state.cash -= structDef.cost;
  state.structures[districtId].push(structureId);
  state.totalDefenseSpending += structDef.cost;

  return { success: true, message: `${structDef.name} built in ${districtId}. Cost: $${structDef.cost}.` };
}

function removeStructure(state, districtId, structureId) {
  if (!state.structures[districtId]) {
    return { success: false, message: 'No structures in this district.' };
  }

  const idx = state.structures[districtId].indexOf(structureId);
  if (idx === -1) {
    return { success: false, message: 'Structure not found in this district.' };
  }

  const structDef = DEFENSE_STRUCTURES.find(s => s.id === structureId);
  state.structures[districtId].splice(idx, 1);

  // Refund 25%
  const refund = Math.floor((structDef ? structDef.cost : 0) * 0.25);
  state.cash = (state.cash || 0) + refund;

  return { success: true, message: `${structDef ? structDef.name : structureId} removed. Refund: $${refund}.` };
}

// ============================================================
// DEFENSE STRENGTH CALCULATION
// ============================================================

function getDefenseStrength(state, districtId) {
  let strength = 0;

  // Fortification bonus
  const fortLevel = state.fortifications[districtId] || 0;
  const fortDef = FORTIFICATION_LEVELS[fortLevel];
  strength += fortDef.defenseBonus;

  // Crew stationed (from fortification level crew requirement)
  strength += fortDef.crewRequired * 5;

  // Structure bonuses
  const structures = state.structures[districtId] || [];
  for (const sId of structures) {
    const def = DEFENSE_STRUCTURES.find(s => s.id === sId);
    if (!def) continue;

    if (def.effect === 'defense_combat') {
      strength += Math.floor(strength * def.bonus);
    } else if (def.effect === 'first_strike') {
      strength += 10;
    }

    // Reduce strength if structure is damaged
    const damage = (state.structureDamage[districtId] || {})[sId] || 0;
    if (damage > 0) {
      const reduction = Math.floor(strength * (damage / 100) * 0.3);
      strength -= reduction;
    }
  }

  return Math.max(0, strength);
}

// ============================================================
// SIEGE MECHANICS
// ============================================================

function initiateSiege(state, districtId, attackerData) {
  const structures = state.structures[districtId] || [];
  const hasWatchtower = structures.includes('watchtower');
  const hasCCTV = structures.includes('cctv_network');

  let warningDays = 0;
  if (hasWatchtower || hasCCTV) {
    warningDays = 1;
  }

  // CCTV reduces surprise attack chance
  let isSurprise = Math.random() < attackerData.surpriseFactor;
  if (hasCCTV) {
    isSurprise = Math.random() < (attackerData.surpriseFactor * (1 - 0.30));
  }

  const siege = {
    districtId: districtId,
    attackerData: attackerData,
    phase: warningDays > 0 ? 'warning' : 'mobilization',
    warningDaysRemaining: warningDays,
    isSurprise: isSurprise,
    result: null,
    casualties: { defender: 0, attacker: 0 },
    lootLost: 0,
    damageDealt: {}
  };

  state.activeSieges.push(siege);

  return {
    success: true,
    message: `${attackerData.name} is attacking ${districtId}!`,
    warning: warningDays > 0,
    surprise: isSurprise
  };
}

function resolveSiege(state, siegeIndex) {
  const siege = state.activeSieges[siegeIndex];
  if (!siege) return { success: false, message: 'Invalid siege index.' };

  const districtId = siege.districtId;
  const defenseStrength = getDefenseStrength(state, districtId);
  let attackStrength = siege.attackerData.strength;

  // Surprise attack bonus
  if (siege.isSurprise) {
    attackStrength = Math.floor(attackStrength * 1.3);
  }

  // Barricade first strike
  const structures = state.structures[districtId] || [];
  if (structures.includes('barricade') && !siege.isSurprise) {
    attackStrength = Math.floor(attackStrength * 0.85);
    siege.casualties.attacker += Math.ceil(siege.attackerData.crew * 0.1);
  }

  // Battle resolution
  const defenseRoll = defenseStrength * (0.7 + Math.random() * 0.6);
  const attackRoll = attackStrength * (0.7 + Math.random() * 0.6);

  const defended = defenseRoll >= attackRoll;

  siege.phase = 'aftermath';

  if (defended) {
    // Territory held
    siege.result = 'defended';
    siege.casualties.attacker += Math.ceil(siege.attackerData.crew * 0.3);
    siege.casualties.defender += Math.floor(Math.random() * 2);
    state.siegesRepelled++;

    // Structure damage from battle
    for (const sId of structures) {
      if (Math.random() < 0.3) {
        if (!state.structureDamage[districtId]) state.structureDamage[districtId] = {};
        state.structureDamage[districtId][sId] = Math.min(100,
          (state.structureDamage[districtId][sId] || 0) + 10 + Math.floor(Math.random() * 20));
        siege.damageDealt[sId] = state.structureDamage[districtId][sId];
      }
    }

    // Counter-attack opportunity
    state.counterAttackAvailable = {
      districtId: districtId,
      attackerData: siege.attackerData,
      expires: 2
    };
  } else {
    // Territory lost
    siege.result = 'lost';
    siege.casualties.defender += Math.ceil((FORTIFICATION_LEVELS[state.fortifications[districtId] || 0].crewRequired) * 0.5);
    siege.casualties.attacker += Math.ceil(siege.attackerData.crew * 0.15);
    state.territoriesLost++;

    // Safe room protects crew
    if (structures.includes('safe_room')) {
      siege.casualties.defender = Math.max(0, siege.casualties.defender - 2);
      siege.safeRoomActivated = true;
    }

    // Loot lost
    siege.lootLost = Math.floor(Math.random() * 20000) + 5000;

    // Downgrade fortification
    const currentLevel = state.fortifications[districtId] || 0;
    state.fortifications[districtId] = Math.max(0, currentLevel - 1);

    // Damage all structures
    for (const sId of structures) {
      if (!state.structureDamage[districtId]) state.structureDamage[districtId] = {};
      state.structureDamage[districtId][sId] = Math.min(100,
        (state.structureDamage[districtId][sId] || 0) + 30 + Math.floor(Math.random() * 30));
    }
  }

  // Record in history
  state.defenseHistory.push({
    districtId: districtId,
    attacker: siege.attackerData.name,
    result: siege.result,
    defenseStrength: defenseStrength,
    attackStrength: attackStrength,
    casualties: { ...siege.casualties },
    lootLost: siege.lootLost,
    day: state.currentDay || 0
  });

  // Remove from active sieges
  state.activeSieges.splice(siegeIndex, 1);

  return {
    success: true,
    defended: defended,
    result: siege.result,
    casualties: siege.casualties,
    lootLost: siege.lootLost,
    damageDealt: siege.damageDealt,
    counterAttackAvailable: defended
  };
}

function counterAttack(state) {
  if (!state.counterAttackAvailable) {
    return { success: false, message: 'No counter-attack opportunity available.' };
  }

  const target = state.counterAttackAvailable;
  const attackerWeakened = Math.floor(target.attackerData.strength * 0.4);

  // Player attacks weakened force
  const playerStrength = getDefenseStrength(state, target.districtId) * 0.8;
  const playerRoll = playerStrength * (0.7 + Math.random() * 0.6);
  const enemyRoll = attackerWeakened * (0.7 + Math.random() * 0.6);

  const counterSuccess = playerRoll >= enemyRoll;

  const result = {
    success: true,
    counterSuccess: counterSuccess,
    lootGained: 0,
    xpGained: 0,
    casualties: 0
  };

  if (counterSuccess) {
    result.lootGained = Math.floor(Math.random() * 15000) + 5000;
    result.xpGained = 30;
    state.cash = (state.cash || 0) + result.lootGained;
  } else {
    result.casualties = Math.floor(Math.random() * 2) + 1;
  }

  state.counterAttackAvailable = null;
  return result;
}

// ============================================================
// REPAIR & QUERY FUNCTIONS
// ============================================================

function repairFortifications(state, districtId) {
  const damage = state.structureDamage[districtId];
  if (!damage || Object.keys(damage).length === 0) {
    return { success: false, message: 'No damage to repair.' };
  }

  let totalCost = 0;
  const repaired = [];

  for (const sId of Object.keys(damage)) {
    if (damage[sId] <= 0) continue;
    const structDef = DEFENSE_STRUCTURES.find(s => s.id === sId);
    const repairCost = Math.floor((structDef ? structDef.cost : 5000) * (damage[sId] / 100) * 0.3);
    totalCost += repairCost;
    repaired.push({ structureId: sId, damage: damage[sId], cost: repairCost });
  }

  const cash = state.cash || 0;
  if (cash < totalCost) {
    return { success: false, message: `Not enough cash. Need $${totalCost}, have $${cash}.` };
  }

  state.cash -= totalCost;
  state.structureDamage[districtId] = {};
  state.totalDefenseSpending += totalCost;

  return { success: true, message: `Repaired all structures in ${districtId}. Cost: $${totalCost}.`, repaired, totalCost };
}

function getDistrictDefenseInfo(state, districtId) {
  const fortLevel = state.fortifications[districtId] || 0;
  const fortDef = FORTIFICATION_LEVELS[fortLevel];
  const structures = (state.structures[districtId] || []).map(sId => {
    const def = DEFENSE_STRUCTURES.find(s => s.id === sId);
    const damage = (state.structureDamage[districtId] || {})[sId] || 0;
    return { id: sId, name: def ? def.name : sId, damage: damage, operational: damage < 80 };
  });

  return {
    districtId: districtId,
    fortificationLevel: fortLevel,
    fortificationName: fortDef.name,
    defenseStrength: getDefenseStrength(state, districtId),
    structures: structures,
    underSiege: state.activeSieges.some(s => s.districtId === districtId),
    counterAttackAvailable: state.counterAttackAvailable && state.counterAttackAvailable.districtId === districtId
  };
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FORTIFICATION_LEVELS,
    DEFENSE_STRUCTURES,
    SIEGE_PHASES,
    ATTACKER_TYPES,
    initTerritoryDefenseState,
    processTerritoryDefenseDaily,
    buildFortification,
    buildStructure,
    removeStructure,
    getDefenseStrength,
    initiateSiege,
    resolveSiege,
    counterAttack,
    repairFortifications,
    getDistrictDefenseInfo
  };
}
