// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Perk & Skill Effects System
// Makes every skill level provide concrete gameplay bonuses
// ============================================================

// Aggregate all active skill effects for the player
function getAllSkillEffects(state) {
  const effects = {
    // Combat
    damageBonus: 0,          // +% weapon damage
    accuracyBonus: 0,        // +% accuracy
    combatDefense: 0,        // +% damage reduction
    critChance: 0,           // +% critical hit chance

    // Driving
    travelTimeReduction: 0,  // -% travel time
    chaseEscapeBonus: 0,     // +% flee success in chases
    fuelCostReduction: 0,    // -% travel cost

    // Persuasion
    buyDiscount: 0,          // -% buy prices
    sellBonus: 0,            // +% sell prices
    bribeDiscount: 0,        // -% bribe costs
    bribeSuccess: 0,         // +% bribe success rate
    recruitDiscount: 0,      // -% crew hire cost

    // Chemistry
    labEfficiency: 0,        // +% lab production
    drugPurity: 0,           // +% drug value
    processSpeed: 0,         // -% processing time
    overdoseResist: 0,       // -% overdose chance

    // Business
    launderEfficiency: 0,    // +% laundering rate
    propertyIncome: 0,       // +% property income
    investReturn: 0,         // +% investment returns
    loanInterestReduction: 0,// -% loan interest

    // Stealth
    heatReduction: 0,        // -% heat gain from deals
    raidChanceReduction: 0,  // -% raid chance
    stealSuccess: 0,         // +% steal/break-in success
    concealBonus: 0,         // +% concealment (carry more hidden)

    // Leadership
    crewMaxBonus: 0,         // + crew slots
    crewLoyaltyBonus: 0,     // +% crew loyalty
    crewDamageBonus: 0,      // +% crew damage in combat
    territoryIncome: 0,      // +% territory income

    // Streetwise
    eventRewardBonus: 0,     // +% event rewards
    priceKnowledge: 0,       // See price trends
    dangerSense: 0,          // Early warning on attacks
    respectBonus: 0,         // +% reputation gain
  };

  // Get skill levels
  const combat = getSkillLevel(state, 'combat');
  const driving = getSkillLevel(state, 'driving');
  const persuasion = getSkillLevel(state, 'persuasion');
  const chemistry = getSkillLevel(state, 'chemistry');
  const business = getSkillLevel(state, 'business');
  const stealth = getSkillLevel(state, 'stealth');
  const leadership = getSkillLevel(state, 'leadership');
  const streetwise = getSkillLevel(state, 'streetwise');

  // Combat effects (per level)
  effects.damageBonus = combat * 8;         // +8% per level
  effects.accuracyBonus = combat * 5;       // +5% per level
  effects.combatDefense = combat * 4;       // +4% per level
  effects.critChance = Math.min(30, combat * 3);  // +3% per level, max 30%

  // Driving effects
  effects.travelTimeReduction = driving * 5;      // -5% per level
  effects.chaseEscapeBonus = driving * 6;          // +6% per level
  effects.fuelCostReduction = driving * 4;         // -4% per level

  // Persuasion effects
  effects.buyDiscount = persuasion * 3;            // -3% per level
  effects.sellBonus = persuasion * 3;              // +3% per level
  effects.bribeDiscount = persuasion * 8;          // -8% per level
  effects.bribeSuccess = persuasion * 5;           // +5% per level
  effects.recruitDiscount = persuasion * 5;        // -5% per level

  // Chemistry effects
  effects.labEfficiency = chemistry * 10;          // +10% per level
  effects.drugPurity = chemistry * 5;              // +5% per level
  effects.processSpeed = chemistry * 8;            // -8% per level
  effects.overdoseResist = chemistry * 10;         // -10% per level

  // Business effects
  effects.launderEfficiency = business * 8;        // +8% per level
  effects.propertyIncome = business * 6;           // +6% per level
  effects.investReturn = business * 5;             // +5% per level
  effects.loanInterestReduction = business * 5;    // -5% per level

  // Stealth effects
  effects.heatReduction = stealth * 8;             // -8% heat gain per level
  effects.raidChanceReduction = stealth * 5;       // -5% raid chance per level
  effects.stealSuccess = stealth * 7;              // +7% per level
  effects.concealBonus = stealth * 10;             // +10% carry capacity per level

  // Leadership effects
  effects.crewMaxBonus = Math.floor(leadership / 2); // +1 crew slot per 2 levels
  effects.crewLoyaltyBonus = leadership * 5;          // +5% per level
  effects.crewDamageBonus = leadership * 6;           // +6% per level
  effects.territoryIncome = leadership * 8;           // +8% per level

  // Streetwise effects
  effects.eventRewardBonus = streetwise * 10;      // +10% per level
  effects.priceKnowledge = streetwise >= 3 ? 1 : 0;// Unlock at level 3
  effects.dangerSense = streetwise >= 2 ? 1 : 0;   // Unlock at level 2
  effects.respectBonus = streetwise * 5;            // +5% per level

  return effects;
}

// Apply skill effects to drug buy price
function applySkillBuyPrice(state, basePrice) {
  const effects = getAllSkillEffects(state);
  return Math.round(basePrice * (1 - effects.buyDiscount / 100));
}

// Apply skill effects to drug sell price
function applySkillSellPrice(state, basePrice) {
  const effects = getAllSkillEffects(state);
  const purityBonus = 1 + effects.drugPurity / 100;
  const sellBonus = 1 + effects.sellBonus / 100;
  return Math.round(basePrice * purityBonus * sellBonus);
}

// Apply skill effects to combat damage
function applySkillCombatDamage(state, baseDamage) {
  const effects = getAllSkillEffects(state);
  return Math.round(baseDamage * (1 + effects.damageBonus / 100));
}

// Apply skill effects to travel time
function applySkillTravelTime(state, baseDays) {
  const effects = getAllSkillEffects(state);
  return Math.max(1, Math.round(baseDays * (1 - effects.travelTimeReduction / 100)));
}

// Apply skill effects to heat gain
function applySkillHeatGain(state, baseHeat) {
  const effects = getAllSkillEffects(state);
  return Math.max(0, Math.round(baseHeat * (1 - effects.heatReduction / 100)));
}

// Get effective max crew size with leadership bonus
function getSkillCrewMax(state) {
  const effects = getAllSkillEffects(state);
  return effects.crewMaxBonus;
}

// Apply skill effects to territory income
function applySkillTerritoryIncome(state, baseIncome) {
  const effects = getAllSkillEffects(state);
  return Math.round(baseIncome * (1 + effects.territoryIncome / 100));
}

// Apply skill effects to property income
function applySkillPropertyIncome(state, baseIncome) {
  const effects = getAllSkillEffects(state);
  return Math.round(baseIncome * (1 + effects.propertyIncome / 100));
}

// Apply skill effects to reputation gain
function applySkillRepGain(state, baseRep) {
  const effects = getAllSkillEffects(state);
  return Math.round(baseRep * (1 + effects.respectBonus / 100));
}

// Apply skill effects to concealment (extra carry capacity)
function getSkillConcealBonus(state) {
  const effects = getAllSkillEffects(state);
  return Math.round(effects.concealBonus);
}

// Check for critical hit
function rollSkillCritical(state) {
  const effects = getAllSkillEffects(state);
  return Math.random() * 100 < effects.critChance;
}

// Apply crew loyalty bonus from leadership
function applyCrewLoyaltyBonus(state, baseLoyalty) {
  const effects = getAllSkillEffects(state);
  return Math.min(100, baseLoyalty + effects.crewLoyaltyBonus);
}

// Get skill effects summary for UI
function getSkillEffectsSummary(state) {
  const effects = getAllSkillEffects(state);
  const active = [];

  if (effects.damageBonus > 0) active.push({ emoji: '⚔️', label: 'Damage', value: `+${effects.damageBonus}%` });
  if (effects.accuracyBonus > 0) active.push({ emoji: '🎯', label: 'Accuracy', value: `+${effects.accuracyBonus}%` });
  if (effects.combatDefense > 0) active.push({ emoji: '🛡️', label: 'Defense', value: `+${effects.combatDefense}%` });
  if (effects.critChance > 0) active.push({ emoji: '💥', label: 'Crit Chance', value: `+${effects.critChance}%` });
  if (effects.travelTimeReduction > 0) active.push({ emoji: '🚗', label: 'Travel Speed', value: `-${effects.travelTimeReduction}%` });
  if (effects.buyDiscount > 0) active.push({ emoji: '💰', label: 'Buy Discount', value: `-${effects.buyDiscount}%` });
  if (effects.sellBonus > 0) active.push({ emoji: '💵', label: 'Sell Bonus', value: `+${effects.sellBonus}%` });
  if (effects.heatReduction > 0) active.push({ emoji: '🔥', label: 'Heat Gain', value: `-${effects.heatReduction}%` });
  if (effects.raidChanceReduction > 0) active.push({ emoji: '🚔', label: 'Raid Chance', value: `-${effects.raidChanceReduction}%` });
  if (effects.labEfficiency > 0) active.push({ emoji: '⚗️', label: 'Lab Output', value: `+${effects.labEfficiency}%` });
  if (effects.propertyIncome > 0) active.push({ emoji: '🏠', label: 'Property Income', value: `+${effects.propertyIncome}%` });
  if (effects.territoryIncome > 0) active.push({ emoji: '🏴', label: 'Territory Income', value: `+${effects.territoryIncome}%` });
  if (effects.crewMaxBonus > 0) active.push({ emoji: '👥', label: 'Extra Crew Slots', value: `+${effects.crewMaxBonus}` });
  if (effects.respectBonus > 0) active.push({ emoji: '⭐', label: 'Rep Gain', value: `+${effects.respectBonus}%` });
  if (effects.bribeDiscount > 0) active.push({ emoji: '🤝', label: 'Bribe Cost', value: `-${effects.bribeDiscount}%` });
  if (effects.concealBonus > 0) active.push({ emoji: '🎒', label: 'Carry Bonus', value: `+${effects.concealBonus}` });

  return active;
}
