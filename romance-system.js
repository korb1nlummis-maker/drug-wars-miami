// ============================================================
// Drug Wars: Miami Vice Edition — Romance System
// ============================================================

const ROMANCE_NPCS = [
  {
    id: 'valentina',
    name: 'Valentina Cruz',
    emoji: '💃',
    background: 'Cuban dancer',
    meetLocation: 'clubs',
    personality: { primary: 'passionate', secondary: 'jealous' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.05 },
      serious: { safeHouse: true, stressReduction: 0.20 },
      partner: { stressReduction: 0.30, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'jewelry',
    jealousyFactor: 1.5,
    description: 'Fiery Havana-born performer. She dances at Mango\'s and sees everything.'
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Chen',
    emoji: '👩‍⚕️',
    background: 'ER doctor',
    meetLocation: 'hospital',
    personality: { primary: 'caring', secondary: 'curious' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.03 },
      serious: { freeHealing: true, firstAid: true, safeHouse: true },
      partner: { freeHealing: true, firstAid: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'books',
    jealousyFactor: 0.8,
    description: 'Brilliant trauma surgeon at Jackson Memorial. Asks too many questions about your injuries.'
  },
  {
    id: 'nina',
    name: 'Nina Volkov',
    emoji: '🕶️',
    background: 'Russian model',
    meetLocation: 'private_party',
    personality: { primary: 'ambitious', secondary: 'cold' },
    benefits: {
      dating: { stressReduction: 0.05, repBonus: 0.10, intelChance: 0.05 },
      serious: { repBonus: 0.20, internationalContacts: true, safeHouse: true },
      partner: { repBonus: 0.20, internationalContacts: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'designer',
    jealousyFactor: 1.2,
    description: 'Ice-cold Moscow beauty. Connected to oligarchs and fashion moguls alike.'
  },
  {
    id: 'carmen',
    name: 'Carmen Reyes',
    emoji: '⚖️',
    background: 'Criminal lawyer',
    meetLocation: 'court',
    personality: { primary: 'smart', secondary: 'cautious' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.08 },
      serious: { legalDefense: true, sentenceReduction: 0.50, safeHouse: true },
      partner: { legalDefense: true, sentenceReduction: 0.75, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'wine',
    jealousyFactor: 0.6,
    description: 'Coral Gables attorney who defends the city\'s worst. She knows everyone\'s secrets.'
  },
  {
    id: 'jade',
    name: 'Jade Williams',
    emoji: '📰',
    background: 'Investigative journalist',
    meetLocation: 'random',
    personality: { primary: 'tenacious', secondary: 'principled' },
    benefits: {
      dating: { stressReduction: 0.05, intelChance: 0.15 },
      serious: { plantStory: true, killStory: true, intelChance: 0.25, safeHouse: true },
      partner: { plantStory: true, killStory: true, intelChance: 0.30, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'experiences',
    jealousyFactor: 0.5,
    description: 'Miami Herald reporter chasing the drug trade story. Dangerous to love, dangerous to lose.'
  },
  {
    id: 'isabella',
    name: 'Isabella Torres',
    emoji: '🎵',
    background: 'Club owner',
    meetLocation: 'nightlife',
    personality: { primary: 'business-minded', secondary: 'loyal' },
    benefits: {
      dating: { stressReduction: 0.10, nightlifeDiscount: 0.15, intelChance: 0.05 },
      serious: { laundering: true, nightlifeDiscount: 0.30, safeHouse: true },
      partner: { laundering: true, nightlifeDiscount: 0.50, nightlifeBonus: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'art',
    jealousyFactor: 1.0,
    description: 'Owner of three clubs on South Beach. Business first, but loyalty runs deep.'
  }
];

const RELATIONSHIP_STAGES = ['stranger', 'acquaintance', 'dating', 'serious', 'partner'];

const STAGE_THRESHOLDS = {
  acquaintance: 10,
  dating: 30,
  serious: 60,
  partner: 100
};

const GIFT_PREFERENCES = {
  jewelry: { base: 1.0, matchBonus: 1.5 },
  books: { base: 0.8, matchBonus: 1.8 },
  designer: { base: 1.2, matchBonus: 1.4 },
  wine: { base: 0.9, matchBonus: 1.6 },
  experiences: { base: 0.7, matchBonus: 2.0 },
  art: { base: 1.1, matchBonus: 1.5 }
};

const DATE_TIERS = [
  { name: 'Casual coffee', cost: 1000, relationshipGain: 3, stressRelief: 5 },
  { name: 'Dinner at Prime 112', cost: 3000, relationshipGain: 5, stressRelief: 8 },
  { name: 'Weekend in the Keys', cost: 5000, relationshipGain: 8, stressRelief: 12 },
  { name: 'Yacht party', cost: 10000, relationshipGain: 12, stressRelief: 18 }
];

const ROMANCE_EVENTS = [
  { id: 'kidnapped', stage: 'dating', chance: 0.02, description: 'Rivals have taken her hostage.' },
  { id: 'discovers_truth', stage: 'dating', chance: 0.05, description: 'She found your stash.' },
  { id: 'turned_informant', stage: 'serious', chance: 0.03, description: 'The feds got to her.' },
  { id: 'ultimatum', stage: 'serious', chance: 0.04, description: 'Choose: her or the game.' },
  { id: 'jealousy', stage: 'dating', chance: 0.08, description: 'She found out about someone else.' },
  { id: 'threatened', stage: 'acquaintance', chance: 0.03, description: 'A rival faction sent a warning through her.' }
];

const DECAY_INTERVAL = 3;
const DECAY_AMOUNT = 1;

// ---- State ----

function initRomanceState() {
  return {
    relationships: {},
    activeDate: null,
    totalDates: 0,
    heartbreaks: 0,
    gifts: {},
    daysSinceContact: {}
  };
}

// ---- Daily Processing ----

function processRomanceDaily(state, currentDay) {
  const rom = state.romance;
  if (!rom || !rom.relationships) return;

  for (const npcId of Object.keys(rom.relationships)) {
    const rel = rom.relationships[npcId];
    if (rel.stage === 'stranger') continue;

    rom.daysSinceContact[npcId] = (rom.daysSinceContact[npcId] || 0) + 1;

    if (rom.daysSinceContact[npcId] >= DECAY_INTERVAL) {
      rel.points = Math.max(0, rel.points - DECAY_AMOUNT);
      rom.daysSinceContact[npcId] = 0;

      const prevStage = rel.stage;
      rel.stage = calculateStage(rel.points);
      if (RELATIONSHIP_STAGES.indexOf(rel.stage) < RELATIONSHIP_STAGES.indexOf(prevStage)) {
        rel.stageDropped = true;
      }
    }

    processJealousy(rom, npcId);

    const event = checkRomanceEvent(rom, npcId);
    if (event) {
      rel.pendingEvent = event;
    }
  }
}

function processJealousy(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return;

  const activeRelationships = Object.keys(state.relationships).filter(id => {
    const r = state.relationships[id];
    return id !== npcId && RELATIONSHIP_STAGES.indexOf(r.stage) >= 2;
  });

  if (activeRelationships.length > 0) {
    const jealousyHit = Math.floor(activeRelationships.length * npc.jealousyFactor);
    state.relationships[npcId].points = Math.max(0, state.relationships[npcId].points - jealousyHit);
  }
}

function checkRomanceEvent(state, npcId) {
  const rel = state.relationships[npcId];
  for (const event of ROMANCE_EVENTS) {
    if (RELATIONSHIP_STAGES.indexOf(rel.stage) >= RELATIONSHIP_STAGES.indexOf(event.stage)) {
      if (Math.random() < event.chance) {
        return { ...event, npcId, triggered: true };
      }
    }
  }
  return null;
}

function calculateStage(points) {
  if (points >= STAGE_THRESHOLDS.partner) return 'partner';
  if (points >= STAGE_THRESHOLDS.serious) return 'serious';
  if (points >= STAGE_THRESHOLDS.dating) return 'dating';
  if (points >= STAGE_THRESHOLDS.acquaintance) return 'acquaintance';
  return 'stranger';
}

// ---- Meet NPC ----

function meetRomanceNPC(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  if (state.relationships[npcId]) {
    return { success: false, message: `You already know ${npc.name}.` };
  }

  state.relationships[npcId] = {
    points: 5,
    stage: 'acquaintance',
    metDay: 0,
    stageDropped: false,
    pendingEvent: null,
    secretsShared: 0,
    timesProtected: 0
  };
  state.daysSinceContact[npcId] = 0;
  state.gifts[npcId] = 0;

  return {
    success: true,
    message: `You meet ${npc.name}. ${npc.description}`,
    npc: { id: npc.id, name: npc.name, emoji: npc.emoji, background: npc.background }
  };
}

// ---- Date ----

function goOnDate(state, npcId, tierIndex, playerCash) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };
  if (RELATIONSHIP_STAGES.indexOf(rel.stage) < 1) return { success: false, message: 'You need to know them better first.' };

  const tier = DATE_TIERS[tierIndex] || DATE_TIERS[0];

  // Cash validation - prevent going negative
  const cash = typeof playerCash === 'number' ? playerCash : 0;
  if (cash < tier.cost) return { success: false, message: `Not enough cash. Need $${tier.cost.toLocaleString()}.` };

  // Cooldown - one date per person per day
  if (rel.lastDateDay !== undefined && rel.lastDateDay === (state._currentDay || 0)) {
    return { success: false, message: `You already went on a date with ${npc.name} today.` };
  }
  rel.lastDateDay = state._currentDay || 0;

  rel.points += tier.relationshipGain;
  state.daysSinceContact[npcId] = 0;
  state.totalDates++;

  const prevStage = rel.stage;
  rel.stage = calculateStage(rel.points);
  const stageUp = RELATIONSHIP_STAGES.indexOf(rel.stage) > RELATIONSHIP_STAGES.indexOf(prevStage);

  return {
    success: true,
    cost: tier.cost,
    stressRelief: tier.stressRelief,
    relationshipGain: tier.relationshipGain,
    dateName: tier.name,
    stageUp,
    newStage: rel.stage,
    message: `You take ${npc.name} on a date: ${tier.name}. (+${tier.relationshipGain} relationship)`
  };
}

// ---- Gifts ----

function giveGift(state, npcId, giftValue) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  const pref = GIFT_PREFERENCES[npc.giftPreference] || { base: 1.0, matchBonus: 1.0 };
  const baseGain = Math.floor(giftValue / 1000);
  const multiplier = pref.base * pref.matchBonus;
  const gain = Math.max(1, Math.floor(baseGain * multiplier));

  rel.points += gain;
  state.daysSinceContact[npcId] = 0;
  state.gifts[npcId] = (state.gifts[npcId] || 0) + giftValue;

  const prevStage = rel.stage;
  rel.stage = calculateStage(rel.points);
  const stageUp = RELATIONSHIP_STAGES.indexOf(rel.stage) > RELATIONSHIP_STAGES.indexOf(prevStage);

  return {
    success: true,
    cost: giftValue,
    relationshipGain: gain,
    stageUp,
    newStage: rel.stage,
    message: `You give ${npc.name} a gift worth $${giftValue.toLocaleString()}. (+${gain} relationship)`
  };
}

// ---- Advance Relationship ----

function advanceRelationship(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  const currentIdx = RELATIONSHIP_STAGES.indexOf(rel.stage);
  if (currentIdx >= RELATIONSHIP_STAGES.length - 1) {
    return { success: false, message: `Your relationship with ${npc.name} is already at partner level.` };
  }

  const nextStage = RELATIONSHIP_STAGES[currentIdx + 1];
  const threshold = STAGE_THRESHOLDS[nextStage];

  if (rel.points >= threshold) {
    rel.stage = nextStage;
    return {
      success: true,
      newStage: nextStage,
      benefits: npc.benefits[nextStage] || {},
      message: `Your relationship with ${npc.name} advances to: ${nextStage}!`
    };
  }

  return {
    success: false,
    message: `Need ${threshold - rel.points} more relationship points to advance with ${npc.name}.`,
    currentPoints: rel.points,
    needed: threshold
  };
}

// ---- Phone Call ----

function phoneCall(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  rel.points += 1;
  state.daysSinceContact[npcId] = 0;

  return { success: true, relationshipGain: 1, message: `You call ${npc.name}. Small talk, but it counts. (+1 relationship)` };
}

// ---- Share Secret ----

function shareSecret(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  rel.secretsShared++;
  const trustGain = 5;
  rel.points += trustGain;
  state.daysSinceContact[npcId] = 0;

  const leakRisk = Math.min(0.30, rel.secretsShared * 0.05);
  const leaked = Math.random() < leakRisk;

  return {
    success: true,
    relationshipGain: trustGain,
    leaked,
    leakRisk,
    message: leaked
      ? `You confide in ${npc.name}... but this one gets out. (+${trustGain} relationship, but intel leaked!)`
      : `You share something personal with ${npc.name}. She appreciates the trust. (+${trustGain} relationship)`
  };
}

// ---- Protect ----

function protectPartner(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  rel.timesProtected++;
  const gain = 15;
  rel.points += gain;
  state.daysSinceContact[npcId] = 0;

  rel.stage = calculateStage(rel.points);

  return {
    success: true,
    relationshipGain: gain,
    message: `You put yourself on the line for ${npc.name}. She won't forget it. (+${gain} relationship)`
  };
}

// ---- Benefits ----

function getRomanceBenefits(state) {
  const benefits = {
    stressReduction: 0,
    freeHealing: false,
    firstAid: false,
    repBonus: 0,
    internationalContacts: false,
    legalDefense: false,
    sentenceReduction: 0,
    plantStory: false,
    killStory: false,
    intelChance: 0,
    laundering: false,
    nightlifeDiscount: 0,
    nightlifeBonus: false,
    paranoiaImmunity: false,
    safeHouses: 0
  };

  for (const npcId of Object.keys(state.relationships)) {
    const rel = state.relationships[npcId];
    const npc = ROMANCE_NPCS.find(n => n.id === npcId);
    if (!npc || RELATIONSHIP_STAGES.indexOf(rel.stage) < 2) continue;

    const stageBenefits = npc.benefits[rel.stage];
    if (!stageBenefits) continue;

    if (stageBenefits.stressReduction) benefits.stressReduction += stageBenefits.stressReduction;
    if (stageBenefits.freeHealing) benefits.freeHealing = true;
    if (stageBenefits.firstAid) benefits.firstAid = true;
    if (stageBenefits.repBonus) benefits.repBonus += stageBenefits.repBonus;
    if (stageBenefits.internationalContacts) benefits.internationalContacts = true;
    if (stageBenefits.legalDefense) benefits.legalDefense = true;
    if (stageBenefits.sentenceReduction) benefits.sentenceReduction = Math.max(benefits.sentenceReduction, stageBenefits.sentenceReduction);
    if (stageBenefits.plantStory) benefits.plantStory = true;
    if (stageBenefits.killStory) benefits.killStory = true;
    if (stageBenefits.intelChance) benefits.intelChance += stageBenefits.intelChance;
    if (stageBenefits.laundering) benefits.laundering = true;
    if (stageBenefits.nightlifeDiscount) benefits.nightlifeDiscount = Math.max(benefits.nightlifeDiscount, stageBenefits.nightlifeDiscount);
    if (stageBenefits.nightlifeBonus) benefits.nightlifeBonus = true;
    if (stageBenefits.paranoiaImmunity) benefits.paranoiaImmunity = true;
    if (stageBenefits.safeHouse) benefits.safeHouses++;
  }

  return benefits;
}

// ---- Romance Events ----

function triggerRomanceEvent(state, npcId) {
  const rel = state.relationships[npcId];
  if (!rel || !rel.pendingEvent) return { success: false, message: 'No pending event.' };

  const event = rel.pendingEvent;
  rel.pendingEvent = null;

  return { success: true, event };
}

// ---- Break Up ----

function breakUp(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `No relationship with ${npc.name}.` };

  const stressHit = RELATIONSHIP_STAGES.indexOf(rel.stage) * 10;
  state.heartbreaks++;

  delete state.relationships[npcId];
  delete state.daysSinceContact[npcId];

  return {
    success: true,
    stressHit,
    heartbreaks: state.heartbreaks,
    message: `It's over with ${npc.name}. +${stressHit} stress. Heartbreak #${state.heartbreaks}.`
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROMANCE_NPCS,
    RELATIONSHIP_STAGES,
    STAGE_THRESHOLDS,
    DATE_TIERS,
    ROMANCE_EVENTS,
    initRomanceState,
    processRomanceDaily,
    meetRomanceNPC,
    goOnDate,
    giveGift,
    advanceRelationship,
    phoneCall,
    shareSecret,
    protectPartner,
    getRomanceBenefits,
    triggerRomanceEvent,
    breakUp
  };
}
