// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Intimidation System
// Projects threat without violence. Affects negotiations, rackets, deterrence
// ============================================================

const INTIMIDATION_LEVELS = [
  { id: 'nobody', name: 'Nobody', emoji: '😐', minScore: 0, effects: { priceMod: 0, resistChance: 0.5, surrenderChance: 0, protectionBonus: 0 },
    desc: 'You look like a regular person. Nobody takes you seriously.' },
  { id: 'concerning', name: 'Concerning', emoji: '😠', minScore: 20, effects: { priceMod: -0.03, resistChance: 0.35, surrenderChance: 0.05, protectionBonus: 0.1 },
    desc: 'Something about you makes people uncomfortable.' },
  { id: 'threatening', name: 'Threatening', emoji: '😈', minScore: 40, effects: { priceMod: -0.06, resistChance: 0.20, surrenderChance: 0.15, protectionBonus: 0.2 },
    desc: 'People cross the street when they see you coming.' },
  { id: 'terrifying', name: 'Terrifying', emoji: '💀', minScore: 65, effects: { priceMod: -0.10, resistChance: 0.10, surrenderChance: 0.30, protectionBonus: 0.35 },
    desc: 'Your reputation precedes you. Most people fold on sight.' },
  { id: 'legendary', name: 'Legendary Terror', emoji: '👹', minScore: 85, effects: { priceMod: -0.15, resistChance: 0.05, surrenderChance: 0.50, protectionBonus: 0.5 },
    desc: 'Whispered about in fear. Entire crews surrender rather than face you.' },
];

const CLOTHING_ITEMS = [
  { id: 'street_clothes', name: 'Street Clothes', emoji: '👕', price: 0, intimidation: 0, repBonus: 0, tier: 0,
    desc: 'Basic clothing. Blends in everywhere.' },
  { id: 'leather_jacket', name: 'Leather Jacket', emoji: '🧥', price: 500, intimidation: 3, repBonus: 2, tier: 1,
    desc: 'Classic biker look. Slight edge.' },
  { id: 'designer_suit', name: 'Designer Suit', emoji: '🤵', price: 5000, intimidation: 5, repBonus: 8, tier: 2,
    desc: 'Armani. Says you mean business. +8 reputation.' },
  { id: 'all_black', name: 'All Black Tactical', emoji: '🥷', price: 3000, intimidation: 8, repBonus: 3, tier: 2,
    desc: 'Tactical gear. Military vibes. +8 intimidation.' },
  { id: 'fur_coat', name: 'Fur Coat', emoji: '🧥', price: 25000, intimidation: 6, repBonus: 15, tier: 3,
    desc: 'Flashy. Screams money and power. +15 rep.' },
  { id: 'cuban_silk', name: 'Cuban Silk Shirt', emoji: '👔', price: 8000, intimidation: 4, repBonus: 10, tier: 2,
    desc: 'Miami Vice style. Scarface energy. +10 rep.' },
  { id: 'body_armor_visible', name: 'Visible Body Armor', emoji: '🦺', price: 10000, intimidation: 12, repBonus: 0, tier: 3,
    desc: 'Openly wearing armor says you expect trouble. +12 intimidation.' },
  { id: 'gold_chains', name: 'Gold Chains', emoji: '⛓️', price: 15000, intimidation: 5, repBonus: 12, tier: 3,
    desc: 'Heavy gold. Shows wealth and status. +12 rep.' },
  { id: 'skull_mask', name: 'Skull Mask', emoji: '💀', price: 2000, intimidation: 15, repBonus: -5, tier: 2,
    desc: 'Terrifying. Maximum intimidation but hurts public image.' },
  { id: 'kingpin_ensemble', name: 'Kingpin Ensemble', emoji: '👑', price: 100000, intimidation: 18, repBonus: 20, tier: 4,
    desc: 'Custom-tailored suit with subtle body armor. Diamond cufflinks. The full package.' },
];

function initIntimidationState() {
  return {
    clothing: 'street_clothes',
    ownedClothing: ['street_clothes'],
    totalIntimidations: 0,
    successfulIntimidations: 0,
  };
}

// Calculate total intimidation score from all sources
function calculateIntimidation(state) {
  let score = 0;

  // 1. Combat skill contribution (0-20 points)
  const combatSkill = state.skills && state.skills.combat ? state.skills.combat : 0;
  score += combatSkill * 2;

  // 2. Fear reputation (0-25 points)
  const fear = state.rep && state.rep.fear ? state.rep.fear : 0;
  score += fear * 0.25;

  // 3. Weapon carried (0-15 points)
  if (state.equippedWeapon && state.equippedWeapon !== 'fists') {
    const weapon = typeof WEAPONS !== 'undefined' ? WEAPONS.find(w => w.id === state.equippedWeapon) : null;
    if (weapon) {
      // Heavier/more expensive weapons = more intimidating
      score += Math.min(15, Math.floor(weapon.damage / 10));
    }
  }

  // 4. Crew presence (0-15 points, +3 per enforcer, +2 per bodyguard, +1 per thug)
  if (state.henchmen && state.henchmen.length > 0) {
    for (const h of state.henchmen) {
      if (h.type === 'enforcer' || h.type === 'assassin') score += 3;
      else if (h.type === 'bodyguard') score += 2;
      else if (h.type === 'thug') score += 1;
    }
    if (score > 15) score = 15 + (score - 15) * 0.5; // Diminishing returns past 15
  }

  // 5. Clothing (0-18 points)
  if (state.intimidation && state.intimidation.clothing) {
    const clothing = CLOTHING_ITEMS.find(c => c.id === state.intimidation.clothing);
    if (clothing) score += clothing.intimidation;
  }

  // 6. Vehicle bonus (0-10 points)
  const vehicleState = state.vehicleState || state.vehicles || {};
  if (vehicleState.activeVehicle) {
    const v = vehicleState.activeVehicle;
    if (typeof VEHICLES !== 'undefined') {
      const vehicle = VEHICLES.find(vh => vh.id === v);
      if (vehicle) {
        if (vehicle.tier === 'exotic' || vehicle.tier === 'luxury') score += 8;
        else if (vehicle.tier === 'muscle' || vehicle.tier === 'military') score += 6;
        else if (vehicle.tier === 'suv') score += 4;
        else if (vehicle.tier === 'performance') score += 5;
      }
    }
  }

  // 7. Kingpin level bonus
  if (typeof KINGPIN_LEVELS !== 'undefined' && state.xp) {
    const level = KINGPIN_LEVELS.filter(l => state.xp >= l.xpRequired).length;
    score += Math.min(10, level);
  }

  return Math.min(100, Math.max(0, Math.floor(score)));
}

function getIntimidationLevel(state) {
  const score = calculateIntimidation(state);
  let level = INTIMIDATION_LEVELS[0];
  for (const l of INTIMIDATION_LEVELS) {
    if (score >= l.minScore) level = l;
  }
  return { ...level, score };
}

function getIntimidationEffects(state) {
  const { effects, score } = getIntimidationLevel(state);
  return { ...effects, score };
}

function buyClothing(state, clothingId) {
  const item = CLOTHING_ITEMS.find(c => c.id === clothingId);
  if (!item) return { success: false, msg: 'Clothing not found.' };
  if (!state.intimidation) state.intimidation = initIntimidationState();
  if (state.intimidation.ownedClothing.includes(clothingId)) {
    // Already own it, just equip
    state.intimidation.clothing = clothingId;
    return { success: true, msg: 'Equipped ' + item.emoji + ' ' + item.name + '.' };
  }
  if (state.cash < item.price) return { success: false, msg: 'Not enough cash. Need $' + item.price.toLocaleString() + '.' };
  state.cash -= item.price;
  state.intimidation.ownedClothing.push(clothingId);
  state.intimidation.clothing = clothingId;
  return { success: true, msg: 'Bought and equipped ' + item.emoji + ' ' + item.name + '!' };
}

function equipClothing(state, clothingId) {
  if (!state.intimidation) state.intimidation = initIntimidationState();
  if (!state.intimidation.ownedClothing.includes(clothingId)) return { success: false, msg: 'You don\'t own that.' };
  state.intimidation.clothing = clothingId;
  const item = CLOTHING_ITEMS.find(c => c.id === clothingId);
  return { success: true, msg: 'Equipped ' + (item ? item.emoji + ' ' + item.name : clothingId) + '.' };
}

// Check if an NPC folds due to intimidation (called before negotiation/combat)
function intimidationCheck(state, npcResistance) {
  const { score } = getIntimidationLevel(state);
  const effectiveIntimidation = score / 100;
  const npcResolve = (npcResistance || 50) / 100;
  const foldChance = Math.max(0, effectiveIntimidation - npcResolve * 0.5);
  const result = Math.random() < foldChance;
  if (state.intimidation) {
    state.intimidation.totalIntimidations++;
    if (result) state.intimidation.successfulIntimidations++;
  }
  return result;
}
