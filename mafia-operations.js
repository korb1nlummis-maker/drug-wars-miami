/**
 * Drug Wars: Miami Vice Edition
 * Mafia Operations System
 *
 * Manages 10 criminal enterprise types with setup, income, upgrades,
 * daily processing, crew assignments, and random events.
 */

const MAFIA_OPERATIONS = [
  {
    id: 'protection_racket', name: 'Protection Racket', emoji: '🛡️',
    setupCost: 5000, dailyIncomeMin: 200, dailyIncomeMax: 2000,
    crewRequired: [{ type: 'enforcer', count: 1 }],
    heatPerDay: 1, riskPerDay: 0.02,
    upgradeLevels: [
      { level: 1, name: 'Street Corner', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Block Coverage', incomeMult: 1.5, cost: 10000 },
      { level: 3, name: 'District Network', incomeMult: 2.5, cost: 50000 }
    ],
    unlockRequirements: { minAct: 1, territory: 1, crew: { enforcer: 1 } },
    desc: 'Extort local businesses for protection money.'
  },
  {
    id: 'loan_sharking', name: 'Loan Sharking', emoji: '💰',
    setupCost: 50000, dailyIncomeMin: 500, dailyIncomeMax: 5000,
    crewRequired: [{ type: 'enforcer', count: 1 }],
    heatPerDay: 1, riskPerDay: 0.015,
    upgradeLevels: [
      { level: 1, name: 'Street Loans', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Neighborhood Lender', incomeMult: 1.8, cost: 30000 },
      { level: 3, name: 'Underground Bank', incomeMult: 3.0, cost: 100000 }
    ],
    unlockRequirements: { minAct: 2, skills: { business: 2 } },
    desc: 'Lend money at exorbitant interest rates and collect by force.'
  },
  {
    id: 'gambling_ops', name: 'Gambling Operations', emoji: '🎰',
    setupCost: 25000, dailyIncomeMin: 1000, dailyIncomeMax: 50000,
    crewRequired: [{ type: 'enforcer', count: 1 }, { type: 'dealer', count: 1 }],
    heatPerDay: 2, riskPerDay: 0.025,
    upgradeLevels: [
      { level: 1, name: 'Back Room', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Underground Parlor', incomeMult: 2.0, cost: 75000 },
      { level: 3, name: 'Casino Front', incomeMult: 4.0, cost: 500000 }
    ],
    unlockRequirements: { minAct: 1 },
    desc: 'Run illegal gambling from back rooms to full casinos.'
  },
  {
    id: 'arms_trafficking', name: 'Arms Trafficking', emoji: '🔫',
    setupCost: 100000, dailyIncomeMin: 5000, dailyIncomeMax: 50000,
    crewRequired: [{ type: 'smuggler', count: 1 }, { type: 'enforcer', count: 1 }],
    heatPerDay: 3, riskPerDay: 0.035,
    upgradeLevels: [
      { level: 1, name: 'Small Arms Dealer', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Military Surplus', incomeMult: 2.0, cost: 150000 },
      { level: 3, name: 'International Pipeline', incomeMult: 3.5, cost: 400000 }
    ],
    unlockRequirements: { minAct: 2, crew: { smuggler: 1, enforcer: 1 } },
    desc: 'Buy and sell weapons on the black market.'
  },
  {
    id: 'human_smuggling', name: 'Human Smuggling', emoji: '🚢',
    setupCost: 30000, dailyIncomeMin: 5000, dailyIncomeMax: 15000,
    crewRequired: [{ type: 'driver', count: 2 }],
    heatPerDay: 4, riskPerDay: 0.04,
    upgradeLevels: [
      { level: 1, name: 'Border Runner', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Smuggling Ring', incomeMult: 2.0, cost: 60000 },
      { level: 3, name: 'International Network', incomeMult: 3.0, cost: 200000 }
    ],
    unlockRequirements: { minAct: 2, districts: ['border'] },
    desc: 'Smuggle people across the border for hefty fees.'
  },
  {
    id: 'chop_shop', name: 'Chop Shop', emoji: '🔧',
    setupCost: 40000, dailyIncomeMin: 2000, dailyIncomeMax: 10000,
    crewRequired: [{ type: 'mechanic', count: 1 }],
    heatPerDay: 2, riskPerDay: 0.02,
    upgradeLevels: [
      { level: 1, name: 'Garage Operation', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Parts Network', incomeMult: 1.8, cost: 50000 },
      { level: 3, name: 'Luxury Specialist', incomeMult: 3.0, cost: 120000 }
    ],
    unlockRequirements: { minAct: 1, skills: { driving: 2 } },
    desc: 'Strip stolen vehicles for parts and resale.'
  },
  {
    id: 'counterfeiting', name: 'Counterfeiting', emoji: '🖨️',
    setupCost: 75000, dailyIncomeMin: 700, dailyIncomeMax: 4300,
    crewRequired: [{ type: 'chemist', count: 1 }],
    heatPerDay: 2, riskPerDay: 0.03,
    upgradeLevels: [
      { level: 1, name: 'Small Press', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Professional Shop', incomeMult: 2.0, cost: 80000 },
      { level: 3, name: 'Master Forger', incomeMult: 3.5, cost: 200000 }
    ],
    unlockRequirements: { minAct: 2, skills: { chemistry: 3 } },
    desc: 'Print counterfeit bills and forge documents.'
  },
  {
    id: 'cyber_crimes', name: 'Cyber Crimes', emoji: '💻',
    setupCost: 20000, dailyIncomeMin: 1000, dailyIncomeMax: 25000,
    crewRequired: [{ type: 'hacker', count: 1 }],
    heatPerDay: 1, riskPerDay: 0.015,
    upgradeLevels: [
      { level: 1, name: 'Script Kiddie', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Dark Web Operator', incomeMult: 2.5, cost: 60000 },
      { level: 3, name: 'Cyber Syndicate', incomeMult: 4.0, cost: 250000 }
    ],
    unlockRequirements: { minAct: 3, crew: { hacker: 1 } },
    desc: 'Identity theft, ransomware, and digital fraud.'
  },
  {
    id: 'fight_club', name: 'Fight Club', emoji: '🥊',
    setupCost: 50000, dailyIncomeMin: 3000, dailyIncomeMax: 20000,
    crewRequired: [{ type: 'enforcer', count: 2 }],
    heatPerDay: 2, riskPerDay: 0.025,
    upgradeLevels: [
      { level: 1, name: 'Warehouse Brawls', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Underground Arena', incomeMult: 2.0, cost: 80000 },
      { level: 3, name: 'Syndicate Circuit', incomeMult: 3.5, cost: 200000 }
    ],
    unlockRequirements: { minAct: 2, property: 'warehouse' },
    desc: 'Organize illegal fights and take bets on the outcomes.'
  },
  {
    id: 'assassination_contracts', name: 'Assassination Contracts', emoji: '🎯',
    setupCost: 0, dailyIncomeMin: 0, dailyIncomeMax: 0,
    crewRequired: [{ type: 'enforcer', count: 1 }],
    heatPerDay: 5, riskPerDay: 0.05,
    upgradeLevels: [
      { level: 1, name: 'Street Hits', incomeMult: 1.0, cost: 0 },
      { level: 2, name: 'Professional Assassin', incomeMult: 2.0, cost: 50000 },
      { level: 3, name: 'Ghost Protocol', incomeMult: 3.0, cost: 150000 }
    ],
    unlockRequirements: { minAct: 2, skills: { combat: 3 } },
    desc: 'Take on contracts to eliminate high-value targets.'
  }
];

const OPERATION_EVENTS = [
  { id: 'police_investigation', name: 'Police Investigation', emoji: '🚔',
    weight: 20, heatThreshold: 10,
    effect: 'heat_spike', heatAmount: 5,
    desc: 'Detectives are sniffing around your operation.' },
  { id: 'rival_interference', name: 'Rival Interference', emoji: '⚔️',
    weight: 18, heatThreshold: 0,
    effect: 'income_loss', incomeMultiplier: 0.5,
    desc: 'A rival crew is muscling in on your territory.' },
  { id: 'employee_theft', name: 'Employee Theft', emoji: '🐀',
    weight: 15, heatThreshold: 0,
    effect: 'cash_loss', cashLossMin: 1000, cashLossMax: 10000,
    desc: 'Someone on the inside has been skimming.' },
  { id: 'expansion_opportunity', name: 'Expansion Opportunity', emoji: '📈',
    weight: 12, heatThreshold: 0,
    effect: 'income_boost', incomeMultiplier: 1.5, duration: 3,
    desc: 'A new opportunity opens up to expand operations.' },
  { id: 'police_raid', name: 'Police Raid', emoji: '🚨',
    weight: 10, heatThreshold: 20,
    effect: 'bust_risk', bustChance: 0.4,
    desc: 'SWAT is about to kick in the door!' },
  { id: 'corrupt_official', name: 'Corrupt Official', emoji: '🤝',
    weight: 10, heatThreshold: 5,
    effect: 'heat_reduction', heatReduction: 8,
    desc: 'A crooked cop offers to look the other way for a fee.' },
  { id: 'supply_shortage', name: 'Supply Shortage', emoji: '📦',
    weight: 8, heatThreshold: 0,
    effect: 'income_loss', incomeMultiplier: 0.3,
    desc: 'Supply chain disruption cuts into profits.' },
  { id: 'turf_war', name: 'Turf War', emoji: '💥',
    weight: 7, heatThreshold: 15,
    effect: 'crew_damage', crewDamageChance: 0.3,
    desc: 'Violence erupts over territory control.' }
];

const CONTRACT_TARGETS = [
  { type: 'snitch', name: 'Street Informant', rewardMin: 10000, rewardMax: 25000, difficulty: 1 },
  { type: 'dealer', name: 'Rival Dealer', rewardMin: 15000, rewardMax: 40000, difficulty: 2 },
  { type: 'lieutenant', name: 'Cartel Lieutenant', rewardMin: 30000, rewardMax: 80000, difficulty: 3 },
  { type: 'underboss', name: 'Rival Underboss', rewardMin: 50000, rewardMax: 150000, difficulty: 4 },
  { type: 'boss', name: 'Crime Boss', rewardMin: 100000, rewardMax: 300000, difficulty: 5 },
  { type: 'official', name: 'Corrupt Official', rewardMin: 75000, rewardMax: 200000, difficulty: 4 },
  { type: 'witness', name: 'Protected Witness', rewardMin: 80000, rewardMax: 250000, difficulty: 5 },
  { type: 'politician', name: 'Dirty Politician', rewardMin: 150000, rewardMax: 500000, difficulty: 5 }
];

// ─── Utility ────────────────────────────────────────────────────────

function _mafiaRandRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _mafiaRandFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function _mafiaUUID() {
  return 'op_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

function getOperationDef(operationId) {
  return MAFIA_OPERATIONS.find(function(op) { return op.id === operationId; }) || null;
}

// ─── State Initialization ───────────────────────────────────────────

function initMafiaOpsState() {
  return {
    activeOperations: [],
    totalOperationIncome: 0,
    operationHistory: [],
    contractBoard: [],
    completedContracts: 0,
    contractCooldown: 0
  };
}

// ─── Requirement Checks ─────────────────────────────────────────────

function _checkSkillRequirements(state, requirements) {
  if (!requirements) return true;
  var skills = state.skills || {};
  for (var skill in requirements) {
    if (!requirements.hasOwnProperty(skill)) continue;
    var playerLevel = skills[skill] || 0;
    if (playerLevel < requirements[skill]) return false;
  }
  return true;
}

function _checkCrewRequirements(state, requirements) {
  if (!requirements) return true;
  var crew = state.crew || [];
  for (var type in requirements) {
    if (!requirements.hasOwnProperty(type)) continue;
    var needed = requirements[type];
    var available = crew.filter(function(c) {
      return c.type === type && c.status === 'available';
    }).length;
    if (available < needed) return false;
  }
  return true;
}

function _countTerritories(state) {
  if (state.territories && Array.isArray(state.territories)) {
    return state.territories.filter(function(t) { return t.controlled; }).length;
  }
  return state.territoryCount || 0;
}

function _hasDistrict(state, districtTag) {
  if (!state.territories || !Array.isArray(state.territories)) return false;
  return state.territories.some(function(t) {
    return t.controlled && t.tags && t.tags.indexOf(districtTag) !== -1;
  });
}

function _hasProperty(state, propertyType) {
  if (!state.properties || !Array.isArray(state.properties)) return false;
  return state.properties.some(function(p) {
    return p.type === propertyType && p.owned;
  });
}

function canSetupOperation(state, operationId, districtId) {
  var def = getOperationDef(operationId);
  if (!def) return { allowed: false, reason: 'Unknown operation.' };

  var mafiaState = state.mafiaOps;
  if (!mafiaState) return { allowed: false, reason: 'Mafia ops not initialized.' };

  // Check act requirement
  var currentAct = state.currentAct || 1;
  if (def.unlockRequirements.minAct && currentAct < def.unlockRequirements.minAct) {
    return { allowed: false, reason: 'Requires Act ' + def.unlockRequirements.minAct + '.' };
  }

  // Check territory requirement
  if (def.unlockRequirements.territory) {
    var territories = _countTerritories(state);
    if (territories < def.unlockRequirements.territory) {
      return { allowed: false, reason: 'Need ' + def.unlockRequirements.territory + ' controlled territory.' };
    }
  }

  // Check skill requirements
  if (def.unlockRequirements.skills && !_checkSkillRequirements(state, def.unlockRequirements.skills)) {
    return { allowed: false, reason: 'Insufficient skill levels.' };
  }

  // Check crew type requirements from unlock
  if (def.unlockRequirements.crew && !_checkCrewRequirements(state, def.unlockRequirements.crew)) {
    return { allowed: false, reason: 'Missing required crew types.' };
  }

  // Check district tag requirements
  if (def.unlockRequirements.districts) {
    var hasAll = def.unlockRequirements.districts.every(function(tag) {
      return _hasDistrict(state, tag);
    });
    if (!hasAll) {
      return { allowed: false, reason: 'Need access to required districts.' };
    }
  }

  // Check property requirements
  if (def.unlockRequirements.property && !_hasProperty(state, def.unlockRequirements.property)) {
    return { allowed: false, reason: 'Need a ' + def.unlockRequirements.property + '.' };
  }

  // Check cash
  var cash = state.cash || 0;
  if (cash < def.setupCost) {
    return { allowed: false, reason: 'Need $' + def.setupCost.toLocaleString() + ' to set up.' };
  }

  // Check available crew for operation
  var crew = state.crew || [];
  for (var i = 0; i < def.crewRequired.length; i++) {
    var req = def.crewRequired[i];
    var available = crew.filter(function(c) {
      return c.type === req.type && c.status === 'available';
    }).length;
    if (available < req.count) {
      return { allowed: false, reason: 'Need ' + req.count + ' available ' + req.type + '(s).' };
    }
  }

  // Check duplicate in same district
  var duplicate = mafiaState.activeOperations.some(function(op) {
    return op.operationId === operationId && op.districtId === districtId && op.status === 'active';
  });
  if (duplicate) {
    return { allowed: false, reason: 'Already running this operation in that district.' };
  }

  return { allowed: true, reason: null };
}

// ─── Setup / Shutdown / Upgrade ─────────────────────────────────────

function setupOperation(state, operationId, districtId) {
  var check = canSetupOperation(state, operationId, districtId);
  if (!check.allowed) return { success: false, reason: check.reason };

  var def = getOperationDef(operationId);
  state.cash -= def.setupCost;

  // Assign crew
  var assignedCrew = [];
  var crew = state.crew || [];
  for (var i = 0; i < def.crewRequired.length; i++) {
    var req = def.crewRequired[i];
    var assigned = 0;
    for (var j = 0; j < crew.length && assigned < req.count; j++) {
      if (crew[j].type === req.type && crew[j].status === 'available') {
        crew[j].status = 'assigned';
        assignedCrew.push(crew[j].id);
        assigned++;
      }
    }
  }

  var instance = {
    id: _mafiaUUID(),
    operationId: operationId,
    districtId: districtId,
    level: 1,
    dayStarted: state.day || 1,
    totalIncome: 0,
    assignedCrew: assignedCrew,
    status: 'active',
    heat: 0,
    incomeBoostDays: 0,
    lastEvent: null
  };

  state.mafiaOps.activeOperations.push(instance);
  return { success: true, operation: instance };
}

function shutdownOperation(state, opIndex) {
  var mafiaState = state.mafiaOps;
  if (opIndex < 0 || opIndex >= mafiaState.activeOperations.length) {
    return { success: false, reason: 'Invalid operation index.' };
  }

  var op = mafiaState.activeOperations[opIndex];
  var crew = state.crew || [];

  // Free assigned crew
  for (var i = 0; i < op.assignedCrew.length; i++) {
    var crewId = op.assignedCrew[i];
    for (var j = 0; j < crew.length; j++) {
      if (crew[j].id === crewId) {
        crew[j].status = 'available';
        break;
      }
    }
  }

  // Record in history
  mafiaState.operationHistory.push({
    operationId: op.operationId,
    districtId: op.districtId,
    totalIncome: op.totalIncome,
    daysActive: (state.day || 1) - op.dayStarted,
    shutdownReason: op.status === 'busted' ? 'busted' : 'voluntary'
  });

  mafiaState.activeOperations.splice(opIndex, 1);
  return { success: true };
}

function upgradeOperation(state, opIndex) {
  var mafiaState = state.mafiaOps;
  if (opIndex < 0 || opIndex >= mafiaState.activeOperations.length) {
    return { success: false, reason: 'Invalid operation index.' };
  }

  var op = mafiaState.activeOperations[opIndex];
  if (op.status !== 'active') {
    return { success: false, reason: 'Operation is not active.' };
  }

  var def = getOperationDef(op.operationId);
  var nextLevel = op.level + 1;
  var upgradeDef = def.upgradeLevels.find(function(u) { return u.level === nextLevel; });

  if (!upgradeDef) {
    return { success: false, reason: 'Already at max level.' };
  }

  if ((state.cash || 0) < upgradeDef.cost) {
    return { success: false, reason: 'Need $' + upgradeDef.cost.toLocaleString() + ' to upgrade.' };
  }

  state.cash -= upgradeDef.cost;
  op.level = nextLevel;

  return { success: true, newLevel: nextLevel, levelName: upgradeDef.name };
}

// ─── Income Calculation ─────────────────────────────────────────────

function getOperationDailyIncome(state, operation) {
  var def = getOperationDef(operation.operationId);
  if (!def || operation.status !== 'active') return 0;

  // Base income roll
  var baseIncome = _mafiaRandRange(def.dailyIncomeMin, def.dailyIncomeMax);

  // Level multiplier
  var levelDef = def.upgradeLevels.find(function(u) { return u.level === operation.level; });
  var levelMult = levelDef ? levelDef.incomeMult : 1.0;

  // Crew bonus: each assigned crew member adds 5% efficiency
  var crewBonus = 1.0 + (operation.assignedCrew.length * 0.05);

  // District modifier (if district system exists)
  var districtMod = 1.0;
  if (state.territories && Array.isArray(state.territories)) {
    var district = state.territories.find(function(t) {
      return t.id === operation.districtId;
    });
    if (district && typeof district.wealthMultiplier === 'number') {
      districtMod = district.wealthMultiplier;
    }
  }

  // Income boost from events
  var boostMult = operation.incomeBoostDays > 0 ? 1.5 : 1.0;

  // Heat penalty: high heat reduces income
  var heatPenalty = 1.0;
  if (operation.heat > 30) {
    heatPenalty = Math.max(0.3, 1.0 - ((operation.heat - 30) * 0.02));
  }

  var finalIncome = Math.floor(baseIncome * levelMult * crewBonus * districtMod * boostMult * heatPenalty);
  return Math.max(0, finalIncome);
}

// ─── Contract Board ─────────────────────────────────────────────────

function generateContractBoard(state) {
  var mafiaState = state.mafiaOps;
  var currentAct = state.currentAct || 1;
  var count = _mafiaRandRange(3, 5);
  var contracts = [];

  // Filter targets by act-appropriate difficulty
  var maxDifficulty = currentAct + 2;
  var availableTargets = CONTRACT_TARGETS.filter(function(t) {
    return t.difficulty <= maxDifficulty;
  });

  for (var i = 0; i < count; i++) {
    var target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    var reward = _mafiaRandRange(target.rewardMin, target.rewardMax);

    // Scale reward to player progression
    var actMult = 1.0 + ((currentAct - 1) * 0.5);
    reward = Math.floor(reward * actMult);

    var heatReward = target.difficulty * 3;
    var timeLimit = Math.max(3, 10 - target.difficulty);

    contracts.push({
      id: _mafiaUUID(),
      targetType: target.type,
      targetName: target.name + ' - ' + _generateTargetAlias(),
      reward: reward,
      difficulty: target.difficulty,
      heatReward: heatReward,
      timeLimit: timeLimit,
      daysRemaining: timeLimit,
      status: 'available',
      acceptedDay: null
    });
  }

  mafiaState.contractBoard = contracts;
  return contracts;
}

function _generateTargetAlias() {
  var firstNames = ['Rico', 'Marco', 'Alejandro', 'Viktor', 'Dmitri', 'Carlos', 'Javier', 'Nikolai', 'Tommy', 'Sal'];
  var lastNames = ['Vargas', 'Petrov', 'Santiago', 'Moreno', 'Kozlov', 'Reyes', 'DeLuca', 'Chen', 'Ortiz', 'Bianchi'];
  return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' +
         lastNames[Math.floor(Math.random() * lastNames.length)];
}

function acceptContract(state, contractIndex) {
  var mafiaState = state.mafiaOps;
  if (contractIndex < 0 || contractIndex >= mafiaState.contractBoard.length) {
    return { success: false, reason: 'Invalid contract index.' };
  }

  var contract = mafiaState.contractBoard[contractIndex];
  if (contract.status !== 'available') {
    return { success: false, reason: 'Contract is not available.' };
  }

  // Check if assassination operation is active
  var hasAssassinOp = mafiaState.activeOperations.some(function(op) {
    return op.operationId === 'assassination_contracts' && op.status === 'active';
  });
  if (!hasAssassinOp) {
    return { success: false, reason: 'Need an active Assassination Contracts operation.' };
  }

  contract.status = 'accepted';
  contract.acceptedDay = state.day || 1;
  return { success: true, contract: contract };
}

function completeContract(state, contractIndex) {
  var mafiaState = state.mafiaOps;
  if (contractIndex < 0 || contractIndex >= mafiaState.contractBoard.length) {
    return { success: false, reason: 'Invalid contract index.' };
  }

  var contract = mafiaState.contractBoard[contractIndex];
  if (contract.status !== 'accepted') {
    return { success: false, reason: 'Contract has not been accepted.' };
  }

  // Success chance based on difficulty and player combat skill
  var combatSkill = (state.skills && state.skills.combat) || 1;
  var successBase = 0.9 - (contract.difficulty * 0.1);
  var skillBonus = combatSkill * 0.05;
  var successChance = Math.min(0.95, Math.max(0.2, successBase + skillBonus));

  // Find assassination operation for level bonus
  var assassinOp = mafiaState.activeOperations.find(function(op) {
    return op.operationId === 'assassination_contracts' && op.status === 'active';
  });
  if (assassinOp) {
    var def = getOperationDef('assassination_contracts');
    var levelDef = def.upgradeLevels.find(function(u) { return u.level === assassinOp.level; });
    if (levelDef) successChance = Math.min(0.95, successChance + (levelDef.incomeMult - 1.0) * 0.1);
  }

  var roll = Math.random();
  if (roll < successChance) {
    // Success
    state.cash = (state.cash || 0) + contract.reward;
    contract.status = 'completed';
    mafiaState.completedContracts++;
    mafiaState.totalOperationIncome += contract.reward;

    if (assassinOp) {
      assassinOp.totalIncome += contract.reward;
      assassinOp.heat += contract.heatReward;
    }

    // Apply global heat
    if (typeof state.heat === 'number') {
      state.heat += contract.heatReward;
    }

    return { success: true, outcome: 'completed', reward: contract.reward };
  } else {
    // Failure
    contract.status = 'failed';
    var heatPenalty = Math.floor(contract.heatReward * 1.5);

    if (assassinOp) {
      assassinOp.heat += heatPenalty;
    }
    if (typeof state.heat === 'number') {
      state.heat += heatPenalty;
    }

    return { success: true, outcome: 'failed', heatGained: heatPenalty };
  }
}

// ─── Available Operations ───────────────────────────────────────────

function getAvailableOperations(state) {
  var available = [];
  for (var i = 0; i < MAFIA_OPERATIONS.length; i++) {
    var def = MAFIA_OPERATIONS[i];
    var check = canSetupOperation(state, def.id, null);
    available.push({
      operation: def,
      canSetup: check.allowed,
      reason: check.reason
    });
  }
  return available;
}

// ─── Random Events ──────────────────────────────────────────────────

function getOperationEvents() {
  return OPERATION_EVENTS.slice();
}

function _rollOperationEvent(operation) {
  var eligibleEvents = OPERATION_EVENTS.filter(function(evt) {
    return operation.heat >= evt.heatThreshold;
  });

  if (eligibleEvents.length === 0) return null;

  var totalWeight = eligibleEvents.reduce(function(sum, e) { return sum + e.weight; }, 0);
  var roll = Math.random() * totalWeight;
  var cumulative = 0;

  for (var i = 0; i < eligibleEvents.length; i++) {
    cumulative += eligibleEvents[i].weight;
    if (roll <= cumulative) return eligibleEvents[i];
  }

  return eligibleEvents[eligibleEvents.length - 1];
}

function _applyOperationEvent(state, operation, event) {
  var result = { eventId: event.id, name: event.name, emoji: event.emoji, desc: event.desc, effects: [] };

  switch (event.effect) {
    case 'heat_spike':
      operation.heat += event.heatAmount;
      result.effects.push('Heat increased by ' + event.heatAmount);
      break;

    case 'income_loss':
      result.effects.push('Income reduced to ' + Math.floor(event.incomeMultiplier * 100) + '% today');
      result.incomeMult = event.incomeMultiplier;
      break;

    case 'cash_loss':
      var loss = _mafiaRandRange(event.cashLossMin, event.cashLossMax);
      state.cash = Math.max(0, (state.cash || 0) - loss);
      result.effects.push('Lost $' + loss.toLocaleString() + ' to theft');
      break;

    case 'income_boost':
      operation.incomeBoostDays = event.duration || 3;
      result.effects.push('Income boosted for ' + operation.incomeBoostDays + ' days');
      break;

    case 'bust_risk':
      if (Math.random() < event.bustChance) {
        operation.status = 'busted';
        result.effects.push('Operation has been BUSTED!');
      } else {
        operation.heat += 3;
        result.effects.push('Narrowly avoided a bust. Heat +3');
      }
      break;

    case 'heat_reduction':
      var reduction = Math.min(operation.heat, event.heatReduction);
      var bribeCost = reduction * 500;
      if ((state.cash || 0) >= bribeCost) {
        state.cash -= bribeCost;
        operation.heat = Math.max(0, operation.heat - reduction);
        result.effects.push('Paid $' + bribeCost.toLocaleString() + ' bribe. Heat reduced by ' + reduction);
      } else {
        result.effects.push('Could not afford the $' + bribeCost.toLocaleString() + ' bribe');
      }
      break;

    case 'crew_damage':
      if (Math.random() < event.crewDamageChance && operation.assignedCrew.length > 0) {
        var crew = state.crew || [];
        var injuredId = operation.assignedCrew[Math.floor(Math.random() * operation.assignedCrew.length)];
        for (var k = 0; k < crew.length; k++) {
          if (crew[k].id === injuredId) {
            crew[k].status = 'injured';
            result.effects.push(crew[k].name + ' was injured in the turf war');
            break;
          }
        }
      } else {
        result.effects.push('Your crew held their ground');
      }
      break;
  }

  operation.lastEvent = result;
  return result;
}

// ─── Daily Processing ───────────────────────────────────────────────

function processMafiaOpsDaily(state) {
  if (!state.mafiaOps) return;

  var mafiaState = state.mafiaOps;
  var dailySummary = { totalIncome: 0, events: [], bustedOps: [], contractsExpired: [] };

  // Process each active operation
  for (var i = mafiaState.activeOperations.length - 1; i >= 0; i--) {
    var op = mafiaState.activeOperations[i];

    if (op.status !== 'active') continue;

    var def = getOperationDef(op.operationId);
    if (!def) continue;

    // Accumulate heat
    op.heat += def.heatPerDay;

    // Decrement income boost
    if (op.incomeBoostDays > 0) {
      op.incomeBoostDays--;
    }

    // Random event check (base risk + heat scaling)
    var eventChance = def.riskPerDay + (op.heat * 0.002);
    var eventIncomeMult = 1.0;

    if (Math.random() < eventChance) {
      var event = _rollOperationEvent(op);
      if (event) {
        var eventResult = _applyOperationEvent(state, op, event);
        dailySummary.events.push(eventResult);

        if (eventResult.incomeMult) {
          eventIncomeMult = eventResult.incomeMult;
        }

        if (op.status === 'busted') {
          dailySummary.bustedOps.push(op.operationId);
          shutdownOperation(state, i);
          continue;
        }
      }
    }

    // Calculate and apply income (skip assassination_contracts — income comes from contracts)
    if (op.operationId !== 'assassination_contracts') {
      var income = getOperationDailyIncome(state, op);
      income = Math.floor(income * eventIncomeMult);

      state.cash = (state.cash || 0) + income;
      op.totalIncome += income;
      mafiaState.totalOperationIncome += income;
      dailySummary.totalIncome += income;
    }

    // Apply heat to global heat
    if (typeof state.heat === 'number') {
      state.heat += def.heatPerDay;
    }
  }

  // Process contract timers
  for (var c = 0; c < mafiaState.contractBoard.length; c++) {
    var contract = mafiaState.contractBoard[c];
    if (contract.status === 'accepted') {
      contract.daysRemaining--;
      if (contract.daysRemaining <= 0) {
        contract.status = 'expired';
        dailySummary.contractsExpired.push(contract.targetName);
        // Reputation penalty for failing a contract
        if (typeof state.reputation === 'number') {
          state.reputation -= 5;
        }
      }
    }
  }

  // Refresh contract board periodically
  if (mafiaState.contractCooldown > 0) {
    mafiaState.contractCooldown--;
  } else {
    var hasAssassinOp = mafiaState.activeOperations.some(function(op) {
      return op.operationId === 'assassination_contracts' && op.status === 'active';
    });
    if (hasAssassinOp) {
      // Clear completed/failed/expired contracts and regenerate
      var activeContracts = mafiaState.contractBoard.filter(function(ct) {
        return ct.status === 'accepted';
      });
      if (activeContracts.length === 0) {
        generateContractBoard(state);
        mafiaState.contractCooldown = 3;
      }
    }
  }

  return dailySummary;
}

// ─── Guard Check ────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MAFIA_OPERATIONS: MAFIA_OPERATIONS,
    OPERATION_EVENTS: OPERATION_EVENTS,
    CONTRACT_TARGETS: CONTRACT_TARGETS,
    initMafiaOpsState: initMafiaOpsState,
    processMafiaOpsDaily: processMafiaOpsDaily,
    canSetupOperation: canSetupOperation,
    setupOperation: setupOperation,
    shutdownOperation: shutdownOperation,
    upgradeOperation: upgradeOperation,
    getOperationDailyIncome: getOperationDailyIncome,
    generateContractBoard: generateContractBoard,
    acceptContract: acceptContract,
    completeContract: completeContract,
    getAvailableOperations: getAvailableOperations,
    getOperationEvents: getOperationEvents,
    getOperationDef: getOperationDef
  };
}
