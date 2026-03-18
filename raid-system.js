// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Elaborate Raid System
// Math-driven police raids with bribes, perks, escape mechanics
// ============================================================

const RAID_CONFIG = {
  baseChancePerDay: 0.02,       // 2% base daily raid chance
  heatMultiplier: 0.008,        // Each heat point adds 0.8%
  territoryMultiplier: 0.005,   // Each territory adds 0.5%
  districtPoliceMultiplier: {   // Police intensity modifiers
    low: 0.5, low_moderate: 0.7, moderate: 1.0, high: 1.5, very_high: 2.0,
  },
  safehouseMitigation: {        // Per tier
    0: 0.0, 1: 0.10, 2: 0.20, 3: 0.35, 4: 0.50,
  },
  stealthSkillReduction: 0.03,  // Per stealth skill level
  maxRaidChance: 0.50,          // Cap at 50%
};

const RAID_TYPES = [
  {
    id: 'patrol_stop', name: 'Patrol Stop', emoji: '🚔',
    tier: 'local', minHeat: 0, weight: 40,
    desc: 'A routine patrol stops you for questioning.',
    officerCount: [1, 2], searchChance: 0.3,
    bribeBaseCost: 200, bribeSuccessBase: 0.7,
    fleeChance: 0.6, fightDifficulty: 'easy',
    consequences: { cashLoss: 0.05, drugLoss: 0.3, jailDays: [1, 3], heatGain: 5 },
  },
  {
    id: 'street_sweep', name: 'Street Sweep', emoji: '🚓',
    tier: 'local', minHeat: 15, weight: 30,
    desc: 'Police are sweeping the neighborhood. Multiple officers.',
    officerCount: [3, 6], searchChance: 0.6,
    bribeBaseCost: 1000, bribeSuccessBase: 0.5,
    fleeChance: 0.4, fightDifficulty: 'medium',
    consequences: { cashLoss: 0.10, drugLoss: 0.5, jailDays: [3, 7], heatGain: 10 },
  },
  {
    id: 'warrant_raid', name: 'Warrant Raid', emoji: '📋',
    tier: 'city', minHeat: 30, weight: 20,
    desc: 'Detectives have a search warrant. They know your spots.',
    officerCount: [4, 8], searchChance: 0.85,
    bribeBaseCost: 5000, bribeSuccessBase: 0.35,
    fleeChance: 0.25, fightDifficulty: 'hard',
    consequences: { cashLoss: 0.15, drugLoss: 0.7, jailDays: [7, 21], heatGain: 15, propertyDamage: true },
  },
  {
    id: 'task_force', name: 'Task Force Raid', emoji: '🛡️',
    tier: 'city', minHeat: 50, weight: 15,
    desc: 'A dedicated task force has been tracking your operation.',
    officerCount: [8, 15], searchChance: 0.95,
    bribeBaseCost: 15000, bribeSuccessBase: 0.2,
    fleeChance: 0.15, fightDifficulty: 'very_hard',
    consequences: { cashLoss: 0.25, drugLoss: 0.9, jailDays: [14, 60], heatGain: 20, propertyDamage: true, crewLoss: true },
  },
  {
    id: 'dea_operation', name: 'DEA Operation', emoji: '🦅',
    tier: 'federal', minHeat: 70, weight: 10,
    desc: 'Federal agents. SWAT. Helicopters. They mean business.',
    officerCount: [15, 30], searchChance: 1.0,
    bribeBaseCost: 50000, bribeSuccessBase: 0.1,
    fleeChance: 0.08, fightDifficulty: 'extreme',
    consequences: { cashLoss: 0.40, drugLoss: 1.0, jailDays: [30, 180], heatGain: 0, propertyDamage: true, crewLoss: true, assetSeizure: true },
  },
  {
    id: 'rico_sweep', name: 'RICO Sweep', emoji: '⚖️',
    tier: 'federal', minHeat: 85, weight: 5,
    desc: 'Full federal RICO indictment. Multiple agencies coordinated.',
    officerCount: [30, 50], searchChance: 1.0,
    bribeBaseCost: 200000, bribeSuccessBase: 0.03,
    fleeChance: 0.03, fightDifficulty: 'impossible',
    consequences: { cashLoss: 0.60, drugLoss: 1.0, jailDays: [90, 365], heatGain: 0, propertyDamage: true, crewLoss: true, assetSeizure: true, bankSeizure: true },
  },
];

// Raid response options
const RAID_RESPONSES = {
  bribe: {
    id: 'bribe', name: 'Bribe', emoji: '💰',
    desc: 'Offer cash to make them look the other way.',
    // Success = bribeSuccessBase * modifiers
    modifiers: {
      persuasionSkill: 0.05,    // +5% per persuasion level
      politicalInfluence: 0.01, // +1% per political influence point
      corruptOfficials: 0.08,   // +8% per corrupt official owned
      fakeId: 0.10,             // +10% if using fake ID
    },
  },
  flee: {
    id: 'flee', name: 'Flee', emoji: '🏃',
    desc: 'Run for it. Speed and stealth matter.',
    modifiers: {
      drivingSkill: 0.04,       // +4% per driving level
      stealthSkill: 0.05,       // +5% per stealth level
      speedBoat: 0.15,          // +15% if near water with boat
      escapeTunnel: 0.25,       // +25% if safehouse has escape tunnel
      vehicleBonus: 0.10,       // +10% if has vehicle
    },
  },
  fight: {
    id: 'fight', name: 'Fight', emoji: '⚔️',
    desc: 'Shoot your way out. Extremely dangerous.',
    modifiers: {
      combatSkill: 0.05,        // +5% per combat level
      crewSize: 0.03,           // +3% per crew member
      weaponDamage: 0.002,      // +0.2% per damage point
      bodyArmor: 0.15,          // +15% if wearing armor
    },
    // Fighting always generates max heat + bodies + crew casualties
  },
  surrender: {
    id: 'surrender', name: 'Surrender', emoji: '🏳️',
    desc: 'Give up peacefully. Jail time but no violence.',
    // Always succeeds, consequences applied in full
  },
  lawyer: {
    id: 'lawyer', name: 'Call Lawyer', emoji: '⚖️',
    desc: 'Invoke your right to counsel. Reduces jail time.',
    modifiers: {
      politicalInfluence: 0.02,
      businessSkill: 0.03,
      lawyerOnRetainer: 0.30,   // +30% if retained lawyer from politics
    },
  },
};

// Calculate raid chance for current state
function calculateRaidChance(state) {
  const heat = state.heat || 0;
  const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state).length : 0;
  const loc = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(l => l.id === state.currentLocation) : null;
  const policeIntensity = loc ? (RAID_CONFIG.districtPoliceMultiplier[loc.policeIntensity] || 1.0) : 1.0;

  // Base calculation
  let chance = RAID_CONFIG.baseChancePerDay;
  chance += heat * RAID_CONFIG.heatMultiplier;
  chance += territories * RAID_CONFIG.territoryMultiplier;
  chance *= policeIntensity;

  // Reductions
  // Safehouse tier
  const shTier = state.safehouse ? (state.safehouse.tier || 0) : 0;
  chance *= (1 - (RAID_CONFIG.safehouseMitigation[shTier] || 0));

  // Stealth skill
  const stealthLevel = getSkillLevel(state, 'stealth');
  chance *= (1 - stealthLevel * RAID_CONFIG.stealthSkillReduction);

  // Scanner equipment reduces chance
  if (typeof hasEquipment === 'function' && hasEquipment(state, 'scanner')) {
    chance *= 0.7; // -30%
  }

  // Security cameras upgrade
  if (state.safehouse && state.safehouse.upgrades && state.safehouse.upgrades.includes('security_cameras')) {
    chance *= 0.8; // -20%
  }

  // Corrupt officials reduce raids
  if (state.politics && state.politics.corruptOfficials) {
    const officials = Object.keys(state.politics.corruptOfficials).length;
    chance *= Math.max(0.3, 1 - officials * 0.08);
  }

  // Clean investigation status helps
  if (state.heatSystem && state.heatSystem.investigationLevel === 0) {
    chance *= 0.5;
  }

  return Math.min(RAID_CONFIG.maxRaidChance, Math.max(0, chance));
}

// Helper: get skill level from various systems
function getSkillLevel(state, skillName) {
  // Try new expanded system first
  if (state.skills && typeof state.skills === 'object') {
    if (typeof state.skills[skillName] === 'number') return state.skills[skillName];
    // Try old skill tree format
    for (const [key, val] of Object.entries(state.skills)) {
      if (key.toLowerCase().includes(skillName.toLowerCase())) return val || 0;
    }
  }
  return 0;
}

// Determine what type of raid occurs based on heat level
function determineRaidType(state) {
  const heat = state.heat || 0;
  const eligible = RAID_TYPES.filter(r => heat >= r.minHeat);
  if (eligible.length === 0) return RAID_TYPES[0];

  // Weighted random selection
  const totalWeight = eligible.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const raid of eligible) {
    roll -= raid.weight;
    if (roll <= 0) return raid;
  }
  return eligible[eligible.length - 1];
}

// Calculate bribe success chance
function calculateBribeChance(state, raidType) {
  let chance = raidType.bribeSuccessBase;

  // Persuasion skill
  chance += getSkillLevel(state, 'persuasion') * RAID_RESPONSES.bribe.modifiers.persuasionSkill;

  // Political influence
  if (state.politics) {
    chance += (state.politics.politicalInfluence || 0) * RAID_RESPONSES.bribe.modifiers.politicalInfluence;
  }

  // Corrupt officials
  if (state.politics && state.politics.corruptOfficials) {
    chance += Object.keys(state.politics.corruptOfficials).length * RAID_RESPONSES.bribe.modifiers.corruptOfficials;
  }

  // Fake ID
  if (typeof hasItem === 'function' && hasItem(state, 'fake_id')) {
    chance += RAID_RESPONSES.bribe.modifiers.fakeId;
  }

  // Streetwise skill bonus
  chance += getSkillLevel(state, 'streetwise') * 0.03;

  return Math.min(0.95, Math.max(0.01, chance));
}

// Calculate bribe cost with modifiers
function calculateBribeCost(state, raidType) {
  let cost = raidType.bribeBaseCost;

  // Persuasion reduces cost
  cost *= Math.max(0.3, 1 - getSkillLevel(state, 'persuasion') * 0.08);

  // Political connections reduce cost
  if (state.politics && state.politics.politicalInfluence) {
    cost *= Math.max(0.4, 1 - state.politics.politicalInfluence * 0.02);
  }

  // Bribe envelope item halves cost
  if (typeof hasItem === 'function' && hasItem(state, 'bribe_envelope')) {
    cost *= 0.5;
  }

  return Math.round(cost);
}

// Calculate flee success chance
function calculateFleeChance(state, raidType) {
  let chance = raidType.fleeChance;

  // Driving skill
  chance += getSkillLevel(state, 'driving') * RAID_RESPONSES.flee.modifiers.drivingSkill;

  // Stealth skill
  chance += getSkillLevel(state, 'stealth') * RAID_RESPONSES.flee.modifiers.stealthSkill;

  // Speed boat near water
  if (typeof hasItem === 'function' && hasItem(state, 'speed_boat_keys')) {
    const loc = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(l => l.id === state.currentLocation) : null;
    const waterDistricts = ['the_port', 'south_beach', 'the_keys', 'virginia_key'];
    if (loc && waterDistricts.includes(loc.id)) {
      chance += RAID_RESPONSES.flee.modifiers.speedBoat;
    }
  }

  // Escape tunnel in safehouse
  if (state.safehouse && state.safehouse.upgrades && state.safehouse.upgrades.includes('escape_tunnel')) {
    chance += RAID_RESPONSES.flee.modifiers.escapeTunnel;
  }

  // Vehicle
  if (typeof hasEquipment === 'function' && (hasEquipment(state, 'sedan') || hasEquipment(state, 'suv'))) {
    chance += RAID_RESPONSES.flee.modifiers.vehicleBonus;
  }

  return Math.min(0.95, Math.max(0.02, chance));
}

// Calculate fight success chance
function calculateFightChance(state, raidType) {
  const officers = raidType.officerCount[0] + Math.floor(Math.random() * (raidType.officerCount[1] - raidType.officerCount[0]));
  let playerPower = 10; // Base

  // Combat skill
  playerPower += getSkillLevel(state, 'combat') * 8;

  // Crew
  const crewCount = (state.henchmen || []).length;
  playerPower += crewCount * 12;

  // Weapon
  if (state.equippedWeapon && typeof WEAPONS !== 'undefined') {
    const weapon = WEAPONS.find(w => w.id === state.equippedWeapon);
    if (weapon) playerPower += weapon.damage * 2;
  }

  // Body armor
  if (typeof getArmorProtection === 'function') {
    playerPower += getArmorProtection(state) * 0.5;
  }

  const enemyPower = officers * 15;
  const chance = playerPower / (playerPower + enemyPower);
  return Math.min(0.80, Math.max(0.02, chance));
}

// Calculate lawyer effectiveness
function calculateLawyerChance(state, raidType) {
  let chance = 0.3; // Base 30% jail time reduction

  // Political influence
  if (state.politics) {
    chance += (state.politics.politicalInfluence || 0) * RAID_RESPONSES.lawyer.modifiers.politicalInfluence;
  }

  // Business skill
  chance += getSkillLevel(state, 'business') * RAID_RESPONSES.lawyer.modifiers.businessSkill;

  // Lawyer on retainer
  if (state.politics && state.politics.corruptOfficials) {
    for (const [id, official] of Object.entries(state.politics.corruptOfficials)) {
      if (official.type === 'judge' || official.type === 'lawyer') {
        chance += RAID_RESPONSES.lawyer.modifiers.lawyerOnRetainer;
        break;
      }
    }
  }

  return Math.min(0.85, chance);
}

// Process daily raid check
function processRaidCheck(state) {
  const chance = calculateRaidChance(state);
  if (Math.random() >= chance) return null; // No raid

  const raidType = determineRaidType(state);
  const raid = {
    type: raidType,
    raidChance: Math.round(chance * 100),
    bribeChance: Math.round(calculateBribeChance(state, raidType) * 100),
    bribeCost: calculateBribeCost(state, raidType),
    fleeChance: Math.round(calculateFleeChance(state, raidType) * 100),
    fightChance: Math.round(calculateFightChance(state, raidType) * 100),
    lawyerReduction: Math.round(calculateLawyerChance(state, raidType) * 100),
  };

  return raid;
}

// Execute a raid response
function executeRaidResponse(state, raid, responseId) {
  const raidType = raid.type;
  const result = { success: false, msg: '', consequences: {} };

  switch (responseId) {
    case 'bribe': {
      const cost = raid.bribeCost;
      if (state.cash < cost) {
        result.msg = `💰 You can't afford the $${cost.toLocaleString()} bribe!`;
        // Fall through to surrender
        return executeRaidResponse(state, raid, 'surrender');
      }
      state.cash -= cost;
      const roll = Math.random() * 100;
      if (roll < raid.bribeChance) {
        result.success = true;
        result.msg = `💰 Bribe accepted! The officers look the other way. (-$${cost.toLocaleString()})`;
        state.heat = Math.max(0, (state.heat || 0) - 3); // Slight heat reduction for cooperation
      } else {
        result.msg = `💰 Bribe rejected! They confiscate the money and proceed with the raid.`;
        applyRaidConsequences(state, raidType, result);
        result.consequences.bribeLost = cost;
      }
      break;
    }
    case 'flee': {
      const roll = Math.random() * 100;
      if (roll < raid.fleeChance) {
        result.success = true;
        result.msg = `🏃 You escaped! Lost them in the streets.`;
        state.heat = Math.min(100, (state.heat || 0) + 5); // Running adds some heat
        // Drop some drugs during escape
        const drugsDrop = Math.random() * 0.2; // 0-20% of inventory
        for (const [drugId, amt] of Object.entries(state.inventory || {})) {
          const loss = Math.floor(amt * drugsDrop);
          if (loss > 0) {
            state.inventory[drugId] -= loss;
            result.msg += ` Dropped ${loss} ${drugId} while running.`;
          }
        }
      } else {
        result.msg = `🏃 They caught you! Resisting makes it worse.`;
        state.heat = Math.min(100, (state.heat || 0) + 10);
        applyRaidConsequences(state, raidType, result, 1.3); // 30% worse for resisting
      }
      break;
    }
    case 'fight': {
      const roll = Math.random() * 100;
      if (roll < raid.fightChance) {
        result.success = true;
        result.msg = `⚔️ You fought off the raid! But this will bring serious heat.`;
        state.heat = Math.min(100, (state.heat || 0) + 25);
        // Crew casualties
        if (state.henchmen && state.henchmen.length > 0 && Math.random() < 0.4) {
          const casualty = state.henchmen.splice(Math.floor(Math.random() * state.henchmen.length), 1)[0];
          result.msg += ` ${casualty.name} was injured in the shootout.`;
        }
        // Player takes damage
        const damage = 10 + Math.floor(Math.random() * 30);
        state.health = Math.max(1, (state.health || 100) - damage);
        result.msg += ` You took ${damage} damage.`;
        // Generate bodies
        const bodies = 1 + Math.floor(Math.random() * 3);
        if (state.bodies_state) state.bodies_state.bodies = (state.bodies_state.bodies || 0) + bodies;
        result.msg += ` ${bodies} officer(s) down — bodies to dispose of.`;
        // XP for combat
        if (typeof awardXP === 'function') awardXP(state, 50);
      } else {
        result.msg = `⚔️ Outgunned! You're going down hard.`;
        state.heat = Math.min(100, (state.heat || 0) + 30);
        const damage = 30 + Math.floor(Math.random() * 50);
        state.health = Math.max(1, (state.health || 100) - damage);
        applyRaidConsequences(state, raidType, result, 1.5); // 50% worse for fighting
      }
      break;
    }
    case 'surrender': {
      result.msg = `🏳️ You surrendered peacefully.`;
      applyRaidConsequences(state, raidType, result, 0.8); // 20% less harsh for cooperating
      break;
    }
    case 'lawyer': {
      result.msg = `⚖️ You called your lawyer.`;
      applyRaidConsequences(state, raidType, result, 1.0);
      // Reduce jail time
      if (result.consequences.jailDays) {
        const reduction = raid.lawyerReduction / 100;
        result.consequences.jailDays = Math.max(1, Math.round(result.consequences.jailDays * (1 - reduction)));
        result.msg += ` Jail time reduced to ${result.consequences.jailDays} days by your lawyer.`;
      }
      break;
    }
  }

  // Consume fake ID if applicable and it was used
  if (responseId === 'bribe' && typeof hasItem === 'function' && hasItem(state, 'fake_id')) {
    const idx = (state.items || []).indexOf('fake_id');
    if (idx !== -1) {
      state.items.splice(idx, 1);
      result.msg += ' (Fake ID consumed)';
    }
  }

  // Consume bribe envelope if applicable
  if (responseId === 'bribe' && typeof hasItem === 'function' && hasItem(state, 'bribe_envelope')) {
    const idx = (state.items || []).indexOf('bribe_envelope');
    if (idx !== -1) state.items.splice(idx, 1);
  }

  return result;
}

// Apply raid consequences to state
function applyRaidConsequences(state, raidType, result, multiplier = 1.0) {
  const cons = raidType.consequences;
  result.consequences = {};

  // Cash loss
  if (cons.cashLoss) {
    const loss = Math.round(state.cash * cons.cashLoss * multiplier);
    state.cash = Math.max(0, state.cash - loss);
    result.consequences.cashLost = loss;
    if (loss > 0) result.msg += ` Lost $${loss.toLocaleString()} cash.`;
  }

  // Drug loss
  if (cons.drugLoss) {
    let totalLost = 0;
    for (const [drugId, amt] of Object.entries(state.inventory || {})) {
      const loss = Math.floor(amt * cons.drugLoss * multiplier);
      if (loss > 0) {
        state.inventory[drugId] -= loss;
        totalLost += loss;
      }
    }
    result.consequences.drugsLost = totalLost;
    if (totalLost > 0) result.msg += ` ${totalLost} drugs confiscated.`;
  }

  // Jail time
  if (cons.jailDays) {
    const min = cons.jailDays[0];
    const max = cons.jailDays[1];
    const days = Math.round((min + Math.random() * (max - min)) * multiplier);
    result.consequences.jailDays = Math.max(1, days);
    state.day += result.consequences.jailDays;
    result.msg += ` Jailed for ${result.consequences.jailDays} days.`;
  }

  // Heat gain
  if (cons.heatGain) {
    state.heat = Math.min(100, (state.heat || 0) + Math.round(cons.heatGain * multiplier));
  }

  // Property damage
  if (cons.propertyDamage && state.properties) {
    // Damage a random property
    const propKeys = Object.keys(state.properties).filter(k => state.properties[k] && state.properties[k].length > 0);
    if (propKeys.length > 0) {
      const key = propKeys[Math.floor(Math.random() * propKeys.length)];
      result.msg += ` Your property in ${key.replace(/_/g, ' ')} was damaged.`;
      result.consequences.propertyDamaged = key;
    }
  }

  // Crew loss
  if (cons.crewLoss && state.henchmen && state.henchmen.length > 0) {
    const arrested = state.henchmen.splice(Math.floor(Math.random() * state.henchmen.length), 1)[0];
    result.msg += ` ${arrested.name} was arrested.`;
    result.consequences.crewLost = arrested.name;
  }

  // Asset seizure
  if (cons.assetSeizure) {
    const seized = Math.round(state.cash * 0.3);
    state.cash = Math.max(0, state.cash - seized);
    result.msg += ` $${seized.toLocaleString()} in assets seized.`;
    result.consequences.assetsSeized = seized;
  }

  // Bank seizure
  if (cons.bankSeizure && state.bank > 0) {
    const bankSeized = Math.round(state.bank * 0.5);
    state.bank -= bankSeized;
    result.msg += ` $${bankSeized.toLocaleString()} frozen from bank account.`;
    result.consequences.bankSeized = bankSeized;
  }

  // Panic room check (safehouse upgrade)
  if (state.safehouse && state.safehouse.upgrades && state.safehouse.upgrades.includes('panic_room')) {
    if (Math.random() < 0.5) {
      result.msg = `🔒 Panic room activated! You survived the raid with minimal losses.`;
      // Reverse most consequences
      if (result.consequences.cashLost) {
        state.cash += Math.round(result.consequences.cashLost * 0.7);
      }
      result.consequences.panicRoomUsed = true;
    }
  }
}

// Get raid analysis for UI display
function getRaidAnalysis(state) {
  const chance = calculateRaidChance(state);
  const factors = [];

  const heat = state.heat || 0;
  if (heat > 0) factors.push({ name: 'Heat Level', value: heat, effect: `+${(heat * RAID_CONFIG.heatMultiplier * 100).toFixed(1)}%` });

  const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state).length : 0;
  if (territories > 0) factors.push({ name: 'Territories', value: territories, effect: `+${(territories * RAID_CONFIG.territoryMultiplier * 100).toFixed(1)}%` });

  const stealthLevel = getSkillLevel(state, 'stealth');
  if (stealthLevel > 0) factors.push({ name: 'Stealth Skill', value: stealthLevel, effect: `-${(stealthLevel * RAID_CONFIG.stealthSkillReduction * 100).toFixed(1)}%` });

  const shTier = state.safehouse ? (state.safehouse.tier || 0) : 0;
  if (shTier > 0) factors.push({ name: 'Safe House', value: `Tier ${shTier}`, effect: `-${((RAID_CONFIG.safehouseMitigation[shTier] || 0) * 100).toFixed(0)}%` });

  return {
    chance: Math.round(chance * 100),
    riskLevel: chance < 0.05 ? 'Low' : chance < 0.15 ? 'Moderate' : chance < 0.30 ? 'High' : 'Critical',
    riskColor: chance < 0.05 ? '#00ff88' : chance < 0.15 ? '#ffcc00' : chance < 0.30 ? '#ff8800' : '#ff0000',
    factors,
    nextLikelyRaid: determineRaidType(state).name,
  };
}
