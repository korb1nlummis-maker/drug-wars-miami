// prison-system.js — Prison Gameplay System for Drug Wars: Miami Vice Edition

const PRISON_TIERS = [
  {
    id: 'county_jail',
    name: 'County Jail',
    emoji: '🔒',
    minDays: 30,
    maxDays: 90,
    description: 'Local offenses. Minimal security.',
    canBribeGuards: true,
    crewVisitFrequency: 7,
    operationsAccess: 'limited',
    escapeBaseDifficulty: 30
  },
  {
    id: 'state_prison',
    name: 'State Prison',
    emoji: '⛓️',
    minDays: 90,
    maxDays: 365,
    description: 'Serious charges. Gang politics survival.',
    canBribeGuards: false,
    crewVisitFrequency: 14,
    operationsAccess: 'smuggled_phone',
    escapeBaseDifficulty: 60
  },
  {
    id: 'federal_prison',
    name: 'Federal Prison',
    emoji: '🏛️',
    minDays: 365,
    maxDays: 500,
    description: 'RICO convictions. Strictest security.',
    canBribeGuards: false,
    crewVisitFrequency: 30,
    operationsAccess: 'very_limited',
    escapeBaseDifficulty: 85
  }
];

const PRISON_ACTIVITIES = [
  {
    id: 'yard_time',
    name: 'Yard Time',
    emoji: '🌤️',
    effects: { connections: [1, 3], escapeIntel: [1, 2], fightRisk: 0.15, recruitChance: 0.10 },
    description: '+connections, +escape intel, fight risk, recruit contacts'
  },
  {
    id: 'work_detail',
    name: 'Work Detail',
    emoji: '💪',
    effects: { income: [50, 200], respect: 1, skillXP: ['street', 5] },
    description: 'Small income, +1 respect, skill training'
  },
  {
    id: 'library',
    name: 'Library',
    emoji: '📚',
    effects: { skillXP: ['business', 8], insight: [1, 3], appealProgress: [1, 2] },
    description: 'Business/Chemistry skill XP, +insight, legal appeal research'
  },
  {
    id: 'gym',
    name: 'Gym',
    emoji: '🏋️',
    effects: { combatXP: [5, 15], health: [1, 3], respect: 2 },
    description: 'Combat XP, +health, +respect from other inmates'
  },
  {
    id: 'isolation',
    name: 'Isolation',
    emoji: '🔒',
    effects: { sentenceReduction: 2, connectionsLoss: 1, contactsLoss: 1 },
    description: 'Reduce sentence via good behavior (-2 days), but lose contacts'
  }
];

const PRISON_GANGS = [
  {
    id: 'aryan_brotherhood',
    name: 'Aryan Brotherhood',
    race: 'white',
    traits: ['violent', 'drugs'],
    specialty: 'drugs',
    protectionBonus: 25,
    obligationChance: 0.20,
    enemies: ['black_guerrilla_family', 'nortenos'],
    recruitBonus: 5,
    tradeDiscount: 0.10
  },
  {
    id: 'black_guerrilla_family',
    name: 'Black Guerrilla Family',
    race: 'black',
    traits: ['political', 'heroin'],
    specialty: 'heroin',
    protectionBonus: 20,
    obligationChance: 0.15,
    enemies: ['aryan_brotherhood', 'mexican_mafia'],
    recruitBonus: 8,
    tradeDiscount: 0.15
  },
  {
    id: 'mexican_mafia',
    name: 'Mexican Mafia',
    race: 'hispanic',
    traits: ['organized', 'cocaine', 'meth'],
    specialty: 'cocaine',
    protectionBonus: 30,
    obligationChance: 0.25,
    enemies: ['black_guerrilla_family', 'nortenos'],
    recruitBonus: 10,
    tradeDiscount: 0.20
  },
  {
    id: 'nortenos',
    name: 'Nortenos',
    race: 'hispanic',
    traits: ['street', 'northern_ca'],
    specialty: 'street',
    protectionBonus: 15,
    obligationChance: 0.12,
    enemies: ['mexican_mafia', 'aryan_brotherhood'],
    recruitBonus: 6,
    tradeDiscount: 0.08
  },
  {
    id: 'unaffiliated',
    name: 'Unaffiliated',
    race: 'any',
    traits: ['lone_wolf'],
    specialty: null,
    protectionBonus: 0,
    obligationChance: 0,
    enemies: [],
    recruitBonus: 0,
    tradeDiscount: 0
  }
];

const PRISON_EVENTS = [
  { id: 'riot', name: 'Prison Riot', emoji: '🔥', weight: 8, dangerLevel: 3 },
  { id: 'shakedown', name: 'Cell Shakedown', emoji: '🔦', weight: 12, dangerLevel: 1 },
  { id: 'visitor', name: 'Visitor Arrives', emoji: '👤', weight: 15, dangerLevel: 0 },
  { id: 'transfer_threat', name: 'Transfer Threat', emoji: '🚐', weight: 6, dangerLevel: 2 },
  { id: 'prison_fight', name: 'Prison Fight', emoji: '👊', weight: 14, dangerLevel: 2 },
  { id: 'contraband', name: 'Contraband Opportunity', emoji: '📦', weight: 10, dangerLevel: 1 },
  { id: 'informant', name: 'Informant Approach', emoji: '🐀', weight: 7, dangerLevel: 1 },
  { id: 'new_inmate', name: 'New Inmate Arrives', emoji: '🆕', weight: 10, dangerLevel: 0 }
];

const PRISON_TRADE_ITEMS = [
  { id: 'cigarettes', name: 'Cigarettes', emoji: '🚬', basePrice: 5, category: 'currency' },
  { id: 'phone', name: 'Smuggled Phone', emoji: '📱', basePrice: 500, category: 'contraband' },
  { id: 'drugs', name: 'Prison Drugs', emoji: '💊', basePrice: 200, category: 'contraband' },
  { id: 'shank', name: 'Shank', emoji: '🗡️', basePrice: 150, category: 'weapon' },
  { id: 'hooch', name: 'Prison Hooch', emoji: '🍺', basePrice: 30, category: 'luxury' },
  { id: 'food', name: 'Commissary Food', emoji: '🍫', basePrice: 10, category: 'basic' }
];

// ─── Utility ───

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

// ─── Core State ───

function initPrisonState() {
  return {
    inPrison: false,
    tier: null,
    tierData: null,
    sentenceDays: 0,
    daysServed: 0,
    daysRemaining: 0,

    respect: 0,
    connections: 0,
    escapeIntel: 0,
    insight: 0,
    appealProgress: 0,
    health: 100,
    combatXP: 0,

    gang: 'unaffiliated',
    gangStanding: 0,
    gangObligationsPending: 0,

    contraband: [],
    cigarettes: 0,
    prisonCash: 0,
    prisonDrugOperation: false,
    prisonDrugIncome: 0,

    contacts: [],
    recruits: [],

    todayActivity: null,
    todayEvent: null,

    weeklyReports: [],
    eventLog: [],

    empireAutopilot: {
      activeManager: null,
      leadershipScore: 0,
      efficiency: 0.5,
      dailyIncome: 0,
      territoriesLost: 0,
      crewBetrayals: 0,
      totalEarned: 0,
      totalLost: 0
    },

    escapeFailed: false,
    escapeAttempts: 0,
    fugitiveStatus: false,
    solitaryDays: 0,

    prePrisonState: null
  };
}

// ─── Enter Prison ───

function enterPrison(state, tier, sentenceDays) {
  const tierData = PRISON_TIERS.find(t => t.id === tier);
  if (!tierData) return { success: false, message: 'Unknown prison tier.' };

  const clamped = clamp(sentenceDays, tierData.minDays, tierData.maxDays);

  state.prison = state.prison || initPrisonState();
  const ps = state.prison;

  ps.prePrisonState = {
    cash: state.cash,
    territories: state.territories ? [...state.territories] : [],
    crewCount: state.crew ? state.crew.length : 0
  };

  ps.inPrison = true;
  ps.tier = tier;
  ps.tierData = tierData;
  ps.sentenceDays = clamped;
  ps.daysServed = 0;
  ps.daysRemaining = clamped;
  ps.respect = 0;
  ps.connections = 0;
  ps.escapeIntel = 0;
  ps.insight = 0;
  ps.appealProgress = 0;
  ps.health = 100;
  ps.combatXP = 0;
  ps.gang = 'unaffiliated';
  ps.gangStanding = 0;
  ps.gangObligationsPending = 0;
  ps.contraband = [];
  ps.cigarettes = 20;
  ps.prisonCash = 0;
  ps.prisonDrugOperation = false;
  ps.prisonDrugIncome = 0;
  ps.contacts = [];
  ps.recruits = [];
  ps.todayActivity = null;
  ps.todayEvent = null;
  ps.weeklyReports = [];
  ps.eventLog = [];
  ps.escapeFailed = false;
  ps.escapeAttempts = 0;
  ps.solitaryDays = 0;

  // Set up empire autopilot
  _setupAutopilot(state);

  return {
    success: true,
    message: `Sentenced to ${clamped} days in ${tierData.name}. ${tierData.description}`,
    tier: tierData,
    sentence: clamped
  };
}

function _setupAutopilot(state) {
  const ps = state.prison;
  const crew = state.crew || [];

  let bestManager = null;
  let bestScore = 0;

  for (const member of crew) {
    const loyalty = member.loyalty || 50;
    const rank = member.rank || 1;
    const disciplined = (member.traits || []).includes('disciplined') ? 15 : 0;
    const score = loyalty + rank * 20 + disciplined;
    if (score > bestScore) {
      bestScore = score;
      bestManager = member;
    }
  }

  ps.empireAutopilot.activeManager = bestManager;
  ps.empireAutopilot.leadershipScore = bestScore;
  ps.empireAutopilot.efficiency = clamp(bestScore / 100, 0.5, 1.0);
  ps.empireAutopilot.dailyIncome = 0;
  ps.empireAutopilot.territoriesLost = 0;
  ps.empireAutopilot.crewBetrayals = 0;
  ps.empireAutopilot.totalEarned = 0;
  ps.empireAutopilot.totalLost = 0;
}

// ─── Daily Loop ───

function processPrisonDaily(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { active: false, message: 'Not in prison.' };

  const results = { day: ps.daysServed + 1, events: [], messages: [] };

  // Handle solitary
  if (ps.solitaryDays > 0) {
    ps.solitaryDays--;
    ps.daysServed++;
    ps.daysRemaining--;
    results.messages.push(`Solitary confinement. ${ps.solitaryDays} days remaining.`);
    if (ps.daysRemaining <= 0) {
      results.released = true;
      results.release = releaseFromPrison(state);
    }
    return results;
  }

  // Process chosen activity
  if (ps.todayActivity) {
    const actResult = _applyActivity(ps, ps.todayActivity);
    results.activity = actResult;
    results.messages.push(actResult.message);
    ps.todayActivity = null;
  }

  // Random event (60% chance)
  if (Math.random() < 0.60) {
    const event = weightedRandom(PRISON_EVENTS);
    ps.todayEvent = event.id;
    const eventResult = handlePrisonEvent(state, event.id);
    results.events.push(eventResult);
    results.messages.push(eventResult.message);
  }

  // Gang obligations
  if (ps.gang !== 'unaffiliated') {
    const gangData = PRISON_GANGS.find(g => g.id === ps.gang);
    if (gangData && Math.random() < gangData.obligationChance) {
      ps.gangObligationsPending++;
      results.messages.push(`${gangData.name} demands a favor. Obligations pending: ${ps.gangObligationsPending}`);
    }
  }

  // Prison drug operation income
  if (ps.prisonDrugOperation) {
    const drugIncome = randInt(100, 500);
    ps.prisonDrugIncome += drugIncome;
    ps.prisonCash += drugIncome;
    results.messages.push(`Prison drug operation earned $${drugIncome} in cigarette-equivalents.`);
  }

  // Empire autopilot
  const autopilotResult = processEmpireAutopilot(state);
  results.empire = autopilotResult;

  // Weekly report
  if (ps.daysServed > 0 && ps.daysServed % 7 === 0) {
    const report = getPrisonReport(state);
    ps.weeklyReports.push(report);
    results.weeklyReport = report;
  }

  // Advance day
  ps.daysServed++;
  ps.daysRemaining--;

  // Check release
  if (ps.daysRemaining <= 0) {
    results.released = true;
    results.release = releaseFromPrison(state);
  }

  results.daysServed = ps.daysServed;
  results.daysRemaining = ps.daysRemaining;

  return results;
}

// ─── Activity Processing ───

function choosePrisonActivity(state, activityId) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { success: false, message: 'Not in prison.' };
  if (ps.solitaryDays > 0) return { success: false, message: 'In solitary. Cannot choose activity.' };

  const activity = PRISON_ACTIVITIES.find(a => a.id === activityId);
  if (!activity) return { success: false, message: 'Unknown activity.' };

  ps.todayActivity = activityId;
  return { success: true, message: `Chose ${activity.emoji} ${activity.name} for today.`, activity };
}

function _applyActivity(ps, activityId) {
  const activity = PRISON_ACTIVITIES.find(a => a.id === activityId);
  if (!activity) return { message: 'Activity not found.' };

  const effects = activity.effects;
  const applied = [];

  if (effects.connections) {
    const gain = randInt(effects.connections[0], effects.connections[1]);
    ps.connections += gain;
    applied.push(`+${gain} connections`);
  }
  if (effects.escapeIntel) {
    const gain = randInt(effects.escapeIntel[0], effects.escapeIntel[1]);
    ps.escapeIntel += gain;
    applied.push(`+${gain} escape intel`);
  }
  if (effects.fightRisk && Math.random() < effects.fightRisk) {
    const damage = randInt(5, 20);
    ps.health -= damage;
    ps.health = Math.max(ps.health, 0);
    applied.push(`Fight broke out! -${damage} health`);
    if (Math.random() < 0.5) {
      ps.respect += 3;
      applied.push('+3 respect (held your own)');
    }
  }
  if (effects.recruitChance && Math.random() < effects.recruitChance) {
    const contact = { name: `Inmate #${randInt(1000, 9999)}`, skill: randInt(1, 5), loyalty: randInt(30, 70) };
    ps.contacts.push(contact);
    applied.push(`Met ${contact.name} — potential recruit`);
  }
  if (effects.income) {
    const earned = randInt(effects.income[0], effects.income[1]);
    ps.prisonCash += earned;
    applied.push(`+$${earned} income`);
  }
  if (effects.respect) {
    ps.respect += effects.respect;
    applied.push(`+${effects.respect} respect`);
  }
  if (effects.skillXP) {
    applied.push(`+${effects.skillXP[1]} ${effects.skillXP[0]} XP`);
  }
  if (effects.insight) {
    const gain = randInt(effects.insight[0], effects.insight[1]);
    ps.insight += gain;
    applied.push(`+${gain} insight`);
  }
  if (effects.appealProgress) {
    const gain = randInt(effects.appealProgress[0], effects.appealProgress[1]);
    ps.appealProgress += gain;
    applied.push(`+${gain} appeal progress`);
    if (ps.appealProgress >= 20) {
      const reduction = randInt(10, 30);
      ps.daysRemaining = Math.max(0, ps.daysRemaining - reduction);
      ps.appealProgress = 0;
      applied.push(`Appeal succeeded! -${reduction} days from sentence.`);
    }
  }
  if (effects.combatXP) {
    const gain = randInt(effects.combatXP[0], effects.combatXP[1]);
    ps.combatXP += gain;
    applied.push(`+${gain} combat XP`);
  }
  if (effects.health) {
    const gain = randInt(effects.health[0], effects.health[1]);
    ps.health = clamp(ps.health + gain, 0, 100);
    applied.push(`+${gain} health`);
  }
  if (effects.sentenceReduction) {
    ps.daysRemaining = Math.max(0, ps.daysRemaining - effects.sentenceReduction);
    applied.push(`-${effects.sentenceReduction} days (good behavior)`);
  }
  if (effects.connectionsLoss) {
    ps.connections = Math.max(0, ps.connections - effects.connectionsLoss);
    applied.push(`-${effects.connectionsLoss} connections`);
  }
  if (effects.contactsLoss) {
    if (ps.contacts.length > 0) {
      ps.contacts.pop();
      applied.push('-1 contact lost');
    }
  }

  ps.eventLog.push({ day: ps.daysServed, type: 'activity', activity: activityId, effects: applied });

  return {
    message: `${activity.emoji} ${activity.name}: ${applied.join(', ')}`,
    effects: applied
  };
}

// ─── Prison Events ───

function handlePrisonEvent(state, eventId) {
  const ps = state.prison;
  const gangData = PRISON_GANGS.find(g => g.id === ps.gang);
  const result = { eventId, effects: [] };

  switch (eventId) {
    case 'riot': {
      const protected_ = gangData && gangData.protectionBonus > 0;
      if (protected_ && Math.random() < 0.7) {
        result.message = '🔥 Riot erupted! Your gang protected you. +5 respect, +2 connections.';
        ps.respect += 5;
        ps.connections += 2;
      } else {
        const damage = randInt(10, 30);
        ps.health -= damage;
        ps.health = Math.max(ps.health, 0);
        const lootChance = Math.random();
        if (lootChance < 0.3) {
          ps.cigarettes += randInt(10, 50);
          result.message = `🔥 Riot! Took ${damage} damage but looted cigarettes in the chaos.`;
        } else {
          result.message = `🔥 Riot! Took ${damage} damage. Chaos everywhere.`;
        }
      }
      ps.escapeIntel += 1;
      break;
    }
    case 'shakedown': {
      const contrabandCount = ps.contraband.length;
      if (contrabandCount > 0) {
        const confiscated = ps.contraband.splice(0, Math.ceil(contrabandCount / 2));
        result.message = `🔦 Cell shakedown! Guards confiscated ${confiscated.length} contraband items.`;
        ps.respect -= 2;
      } else {
        result.message = '🔦 Cell shakedown. Nothing found — you are clean.';
        ps.respect += 1;
      }
      break;
    }
    case 'visitor': {
      const visitDay = ps.tierData ? ps.tierData.crewVisitFrequency : 7;
      if (ps.daysServed > 0 && ps.daysServed % visitDay === 0) {
        const cashBrought = randInt(100, 1000);
        ps.prisonCash += cashBrought;
        result.message = `👤 Crew member visited. Brought $${cashBrought} and news from outside.`;
        ps.connections += 1;
      } else {
        result.message = '👤 A visitor came by with encouragement. +1 respect.';
        ps.respect += 1;
      }
      break;
    }
    case 'transfer_threat': {
      if (Math.random() < 0.25) {
        const oldTier = ps.tier;
        const nextTierIdx = PRISON_TIERS.findIndex(t => t.id === ps.tier) + 1;
        if (nextTierIdx < PRISON_TIERS.length) {
          const newTier = PRISON_TIERS[nextTierIdx];
          ps.tier = newTier.id;
          ps.tierData = newTier;
          ps.connections = Math.floor(ps.connections * 0.5);
          ps.contacts = [];
          ps.gang = 'unaffiliated';
          ps.gangStanding = 0;
          result.message = `🚐 Transferred from ${oldTier} to ${newTier.name}! Lost half connections, all contacts, gang affiliation reset.`;
        } else {
          result.message = '🚐 Transfer threat passed. You stay put.';
        }
      } else {
        result.message = '🚐 Rumors of a transfer, but nothing happened.';
      }
      break;
    }
    case 'prison_fight': {
      const combatPower = ps.combatXP + ps.respect + (gangData ? gangData.protectionBonus : 0);
      const enemyPower = randInt(20, 80);
      if (combatPower > enemyPower) {
        ps.respect += 5;
        ps.combatXP += 3;
        result.message = `👊 Fight! You won. +5 respect, +3 combat XP. (${combatPower} vs ${enemyPower})`;
      } else {
        const damage = randInt(10, 25);
        ps.health -= damage;
        ps.health = Math.max(ps.health, 0);
        ps.respect -= 3;
        result.message = `👊 Fight! You lost. -${damage} health, -3 respect. (${combatPower} vs ${enemyPower})`;
      }
      break;
    }
    case 'contraband': {
      const items = ['phone', 'drugs', 'shank', 'cigarettes'];
      const item = items[randInt(0, items.length - 1)];
      const cost = item === 'cigarettes' ? 0 : randInt(50, 300);
      if (cost === 0 || ps.prisonCash >= cost) {
        ps.prisonCash -= cost;
        if (item === 'cigarettes') {
          ps.cigarettes += randInt(10, 30);
          result.message = '📦 Found a stash of cigarettes!';
        } else {
          ps.contraband.push(item);
          result.message = `📦 Smuggled in a ${item} for $${cost}.`;
        }
      } else {
        result.message = `📦 Contraband opportunity: ${item} for $${cost}. Can't afford it.`;
      }
      break;
    }
    case 'informant': {
      const dealReduction = randInt(30, 90);
      result.message = `🐀 A cop approaches with a deal: snitch for -${dealReduction} days. Accept via prisonTrade.`;
      result.snitchDeal = { reduction: dealReduction, cost: -20 }; // -20 respect if accepted
      break;
    }
    case 'new_inmate': {
      const inmate = {
        name: `Inmate #${randInt(1000, 9999)}`,
        skill: randInt(1, 8),
        loyalty: randInt(20, 60),
        specialty: ['dealer', 'enforcer', 'cook', 'smuggler'][randInt(0, 3)]
      };
      result.message = `🆕 New inmate: ${inmate.name}, ${inmate.specialty} (skill: ${inmate.skill}). Could be recruited.`;
      result.newInmate = inmate;
      if (!ps._pendingRecruits) ps._pendingRecruits = [];
      ps._pendingRecruits.push(inmate);
      break;
    }
    default:
      result.message = 'Nothing unusual happened.';
  }

  ps.eventLog.push({ day: ps.daysServed, type: 'event', eventId, message: result.message });

  return result;
}

// ─── Escape ───

function getEscapeChance(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { chance: 0, message: 'Not in prison.' };

  const tierData = ps.tierData || PRISON_TIERS[0];
  const bribeBonus = ps.contraband.includes('phone') ? 10 : 0;
  const guardBribe = ps.bribeAmount || 0;
  const bribeMod = guardBribe >= 50000 ? 20 : guardBribe >= 25000 ? 10 : 0;

  const raw = (ps.escapeIntel * 5 + ps.connections * 3 + bribeBonus + bribeMod);
  const chance = clamp(raw - tierData.escapeBaseDifficulty, 0, 95);

  const reqs = {
    escapeIntel: { required: 10, current: ps.escapeIntel, met: ps.escapeIntel >= 10 },
    connections: { required: 5, current: ps.connections, met: ps.connections >= 5 }
  };

  return {
    chance,
    requirements: reqs,
    canAttempt: reqs.escapeIntel.met && reqs.connections.met,
    tierDifficulty: tierData.escapeBaseDifficulty,
    message: `Escape chance: ${chance}%. Intel: ${ps.escapeIntel}/10, Connections: ${ps.connections}/5`
  };
}

function attemptEscape(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { success: false, message: 'Not in prison.' };

  const escapeInfo = getEscapeChance(state);
  if (!escapeInfo.canAttempt) {
    return {
      success: false,
      message: `Cannot attempt escape. ${escapeInfo.message}`,
      requirements: escapeInfo.requirements
    };
  }

  ps.escapeAttempts++;
  const roll = Math.random() * 100;

  if (roll < escapeInfo.chance) {
    // Success
    ps.inPrison = false;
    ps.fugitiveStatus = true;
    if (state.heat !== undefined) state.heat = Math.min((state.heat || 0) + 50, 100);

    const result = {
      success: true,
      message: `Escape successful! You're out, but now a fugitive. +50 heat.`,
      fugitive: true,
      heatGained: 50
    };

    ps.eventLog.push({ day: ps.daysServed, type: 'escape', success: true });
    return result;
  } else {
    // Failure
    const addedDays = 180;
    ps.daysRemaining += addedDays;
    ps.sentenceDays += addedDays;
    ps.connections = Math.max(0, ps.connections - 50);
    ps.escapeIntel = 0;
    ps.solitaryDays = randInt(14, 30);
    ps.escapeFailed = true;

    ps.eventLog.push({ day: ps.daysServed, type: 'escape', success: false });

    return {
      success: false,
      message: `Escape failed! +${addedDays} days added. -50 connections. ${ps.solitaryDays} days solitary.`,
      addedDays,
      solitaryDays: ps.solitaryDays
    };
  }
}

// ─── Empire Autopilot ───

function processEmpireAutopilot(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { active: false };

  const ap = ps.empireAutopilot;
  const results = { messages: [] };

  // Calculate daily income from territories
  const territories = state.territories || [];
  const baseIncome = territories.reduce((sum, t) => sum + (t.income || 0), 0);
  const dailyIncome = Math.floor(baseIncome * ap.efficiency);
  ap.dailyIncome = dailyIncome;
  ap.totalEarned += dailyIncome;
  if (state.cash !== undefined) state.cash += dailyIncome;
  results.messages.push(`Empire earned $${dailyIncome} (${Math.floor(ap.efficiency * 100)}% efficiency).`);

  // Crew salaries still paid
  const crew = state.crew || [];
  const salaries = crew.reduce((sum, m) => sum + (m.salary || 0), 0);
  if (state.cash !== undefined) state.cash -= salaries;
  ap.totalLost += salaries;

  // Territory loss risk (low leadership)
  if (ap.leadershipScore < 60 && territories.length > 0 && Math.random() < 0.05) {
    if (territories.length === 0) return results;
    const lostIdx = randInt(0, territories.length - 1);
    const lost = territories.splice(lostIdx, 1)[0];
    ap.territoriesLost++;
    results.messages.push(`Territory "${lost.name || 'unknown'}" was lost due to weak leadership!`);
  }

  // Crew betrayal risk
  if (ap.leadershipScore < 50 && crew.length > 0 && Math.random() < 0.03) {
    const betrayerIdx = randInt(0, crew.length - 1);
    const betrayer = crew[betrayerIdx];
    ap.crewBetrayals++;
    results.messages.push(`${betrayer.name || 'A crew member'} betrayed the organization!`);
    crew.splice(betrayerIdx, 1);
  }

  // Money bleeding from poor management
  if (ap.efficiency < 0.7) {
    const bleed = Math.floor(baseIncome * (1 - ap.efficiency) * 0.3);
    if (state.cash !== undefined) state.cash -= bleed;
    ap.totalLost += bleed;
    results.messages.push(`Poor management bleeding $${bleed}/day.`);
  }

  return results;
}

// ─── Gang System ───

function joinPrisonGang(state, gangId) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { success: false, message: 'Not in prison.' };

  const newGang = PRISON_GANGS.find(g => g.id === gangId);
  if (!newGang) return { success: false, message: 'Unknown gang.' };

  const oldGang = PRISON_GANGS.find(g => g.id === ps.gang);
  const messages = [];

  // Leaving old gang consequences
  if (ps.gang !== 'unaffiliated' && ps.gang !== gangId) {
    ps.respect -= 10;
    ps.health -= randInt(5, 15);
    ps.health = Math.max(ps.health, 0);
    messages.push(`Left ${oldGang.name}. -10 respect, took a beating on the way out.`);

    // Old gang becomes hostile
    if (oldGang.enemies.indexOf(gangId) === -1 && oldGang.id !== 'unaffiliated') {
      messages.push(`${oldGang.name} now considers you a traitor.`);
    }
  }

  ps.gang = gangId;
  ps.gangStanding = gangId === 'unaffiliated' ? 0 : 10;
  ps.gangObligationsPending = 0;

  if (gangId !== 'unaffiliated') {
    ps.respect += 5;
    ps.connections += newGang.recruitBonus;
    messages.push(`Joined ${newGang.name}. +5 respect, +${newGang.recruitBonus} connections.`);
    messages.push(`Protection: +${newGang.protectionBonus}. Trade discount: ${Math.floor(newGang.tradeDiscount * 100)}%.`);
    if (newGang.enemies.length > 0) {
      const enemyNames = newGang.enemies.map(eid => {
        const eg = PRISON_GANGS.find(g => g.id === eid);
        return eg ? eg.name : eid;
      });
      messages.push(`Enemies: ${enemyNames.join(', ')}.`);
    }
  } else {
    messages.push('You are now unaffiliated. No protection, but no obligations.');
  }

  ps.eventLog.push({ day: ps.daysServed, type: 'gang', action: 'join', gangId });

  return { success: true, message: messages.join(' '), gang: newGang };
}

// ─── Prison Trade ───

function prisonTrade(state, action, itemId) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { success: false, message: 'Not in prison.' };

  const item = PRISON_TRADE_ITEMS.find(i => i.id === itemId);
  if (!item) return { success: false, message: 'Unknown item.' };

  const gangData = PRISON_GANGS.find(g => g.id === ps.gang);
  const discount = gangData ? gangData.tradeDiscount : 0;

  // Prison prices fluctuate
  const fluctuation = randFloat(0.7, 1.5);
  let price = Math.floor(item.basePrice * fluctuation);

  if (action === 'buy') {
    price = Math.floor(price * (1 - discount));
    if (ps.prisonCash < price && ps.cigarettes < price) {
      return { success: false, message: `Can't afford ${item.name}. Price: $${price}. Cash: $${ps.prisonCash}, Cigs: ${ps.cigarettes}.` };
    }
    // Pay with cash first, then cigarettes
    if (ps.prisonCash >= price) {
      ps.prisonCash -= price;
    } else {
      ps.cigarettes -= price;
    }
    if (item.category === 'currency') {
      ps.cigarettes += randInt(10, 30);
    } else {
      ps.contraband.push(item.id);
    }
    ps.eventLog.push({ day: ps.daysServed, type: 'trade', action: 'buy', item: itemId, price });
    return { success: true, message: `Bought ${item.emoji} ${item.name} for $${price}.`, price };

  } else if (action === 'sell') {
    const sellPrice = Math.floor(price * 0.6);
    const idx = ps.contraband.indexOf(item.id);
    if (idx === -1 && item.category !== 'currency') {
      return { success: false, message: `You don't have ${item.name} to sell.` };
    }
    if (item.category !== 'currency') {
      ps.contraband.splice(idx, 1);
    } else {
      if (ps.cigarettes < 10) return { success: false, message: 'Not enough cigarettes to sell.' };
      ps.cigarettes -= 10;
    }
    ps.prisonCash += sellPrice;
    ps.eventLog.push({ day: ps.daysServed, type: 'trade', action: 'sell', item: itemId, price: sellPrice });
    return { success: true, message: `Sold ${item.emoji} ${item.name} for $${sellPrice}.`, price: sellPrice };

  } else if (action === 'snitch_deal') {
    // Special: accept informant deal
    const reduction = randInt(30, 90);
    ps.daysRemaining = Math.max(0, ps.daysRemaining - reduction);
    ps.respect -= 20;
    ps.connections -= 10;
    ps.connections = Math.max(0, ps.connections);
    if (ps.gang !== 'unaffiliated') {
      ps.gangStanding -= 30;
    }
    ps.eventLog.push({ day: ps.daysServed, type: 'snitch', reduction });
    return {
      success: true,
      message: `Snitched for -${reduction} days. -20 respect, -10 connections. You rat.`,
      reduction
    };
  }

  return { success: false, message: 'Invalid action. Use buy, sell, or snitch_deal.' };
}

// ─── Recruit ───

function recruitInmate(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { success: false, message: 'Not in prison.' };

  if (ps.connections < 5) {
    return { success: false, message: `Need 5+ connections to recruit. Current: ${ps.connections}.` };
  }

  const pending = ps._pendingRecruits || [];
  if (pending.length === 0 && ps.contacts.length === 0) {
    return { success: false, message: 'No one available to recruit. Build contacts in the yard.' };
  }

  const pool = pending.length > 0 ? pending : ps.contacts;
  const recruit = pool.shift();

  const successChance = clamp(ps.respect * 2 + ps.connections, 0, 90);
  if (Math.random() * 100 < successChance) {
    ps.recruits.push(recruit);
    ps.connections -= 2;
    ps.eventLog.push({ day: ps.daysServed, type: 'recruit', success: true, recruit });
    return {
      success: true,
      message: `Recruited ${recruit.name}! ${recruit.specialty}, skill ${recruit.skill}. Will join crew on release.`,
      recruit
    };
  } else {
    ps.respect -= 2;
    ps.eventLog.push({ day: ps.daysServed, type: 'recruit', success: false });
    return { success: false, message: `${recruit.name} refused. -2 respect.` };
  }
}

// ─── Release ───

function releaseFromPrison(state) {
  const ps = state.prison;
  if (!ps) return { success: false, message: 'No prison state.' };

  const results = { messages: [] };

  results.messages.push(`Released after ${ps.daysServed} days in ${ps.tierData ? ps.tierData.name : 'prison'}.`);

  // Transfer recruits to crew
  if (ps.recruits.length > 0) {
    state.crew = state.crew || [];
    for (const recruit of ps.recruits) {
      state.crew.push({
        name: recruit.name,
        rank: 1,
        loyalty: recruit.loyalty,
        skill: recruit.skill,
        specialty: recruit.specialty,
        traits: ['ex-con'],
        salary: 100 + recruit.skill * 50
      });
    }
    results.messages.push(`${ps.recruits.length} prison recruits joined your crew.`);
  }

  // Transfer prison earnings
  if (ps.prisonCash > 0) {
    state.cash = (state.cash || 0) + ps.prisonCash;
    results.messages.push(`Transferred $${ps.prisonCash} from prison account.`);
  }

  // Empire damage summary
  const ap = ps.empireAutopilot;
  results.messages.push(`Empire report: Earned $${ap.totalEarned}, Lost $${ap.totalLost}.`);
  results.messages.push(`Territories lost: ${ap.territoriesLost}. Crew betrayals: ${ap.crewBetrayals}.`);

  // Stat effects on release
  results.stats = {
    respect: ps.respect,
    connections: ps.connections,
    combatXP: ps.combatXP,
    insight: ps.insight,
    recruitsGained: ps.recruits.length,
    daysServed: ps.daysServed,
    gangAffiliation: ps.gang,
    fugitive: ps.fugitiveStatus
  };

  // Rebuild arc: player starts weakened
  if (ap.territoriesLost > 0 || ap.crewBetrayals > 0) {
    results.messages.push('Your empire has suffered. Time to rebuild.');
  }

  // Reset prison state but keep record
  ps.inPrison = false;
  ps.todayActivity = null;
  ps.todayEvent = null;

  return { success: true, messages: results.messages, stats: results.stats };
}

// ─── Reports ───

function getPrisonReport(state) {
  const ps = state.prison;
  if (!ps || !ps.inPrison) return { active: false, message: 'Not in prison.' };

  const ap = ps.empireAutopilot;
  const territories = state.territories || [];
  const crew = state.crew || [];
  const escapeInfo = getEscapeChance(state);

  return {
    week: Math.ceil(ps.daysServed / 7),
    daysServed: ps.daysServed,
    daysRemaining: ps.daysRemaining,
    tier: ps.tierData ? ps.tierData.name : ps.tier,

    prisonStats: {
      respect: ps.respect,
      connections: ps.connections,
      escapeIntel: ps.escapeIntel,
      health: ps.health,
      combatXP: ps.combatXP,
      gang: ps.gang,
      gangStanding: ps.gangStanding,
      cigarettes: ps.cigarettes,
      prisonCash: ps.prisonCash,
      contrabandCount: ps.contraband.length,
      contactsCount: ps.contacts.length,
      recruitsCount: ps.recruits.length
    },

    empireStatus: {
      manager: ap.activeManager ? ap.activeManager.name : 'None',
      efficiency: Math.floor(ap.efficiency * 100) + '%',
      dailyIncome: ap.dailyIncome,
      totalEarned: ap.totalEarned,
      totalLost: ap.totalLost,
      territoriesRemaining: territories.length,
      territoriesLost: ap.territoriesLost,
      crewRemaining: crew.length,
      crewBetrayals: ap.crewBetrayals,
      outsideCash: state.cash || 0
    },

    escapeStatus: {
      chance: escapeInfo.chance + '%',
      canAttempt: escapeInfo.canAttempt,
      intel: ps.escapeIntel,
      connections: ps.connections
    }
  };
}

// ─── Exports ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRISON_TIERS,
    PRISON_ACTIVITIES,
    PRISON_GANGS,
    PRISON_EVENTS,
    PRISON_TRADE_ITEMS,
    initPrisonState,
    processPrisonDaily,
    enterPrison,
    choosePrisonActivity,
    attemptEscape,
    processEmpireAutopilot,
    joinPrisonGang,
    prisonTrade,
    recruitInmate,
    releaseFromPrison,
    getPrisonReport,
    getEscapeChance,
    handlePrisonEvent
  };
}
