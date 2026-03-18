// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Weapon Upgrade System
// Attachments, modifications, and weapon progression
// ============================================================

const WEAPON_CATEGORIES = {
  melee: { name: 'Melee', emoji: '🔪', concealability: 'perfect', noise: 'silent' },
  pistol: { name: 'Pistols', emoji: '🔫', concealability: 'high', noise: 'moderate' },
  shotgun: { name: 'Shotguns', emoji: '💥', concealability: 'low', noise: 'loud' },
  smg: { name: 'SMGs', emoji: '⚡', concealability: 'moderate', noise: 'loud' },
  rifle: { name: 'Rifles', emoji: '🎯', concealability: 'none', noise: 'very_loud' },
  heavy: { name: 'Heavy', emoji: '💣', concealability: 'none', noise: 'extreme' },
  special: { name: 'Special', emoji: '⭐', concealability: 'varies', noise: 'varies' },
};

const WEAPON_UPGRADES = [
  {
    id: 'suppressor', name: 'Suppressor', emoji: '🔇',
    category: 'barrel', cost: 6000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { noise: -2, heatPerKill: -50, accuracy: -5, damage: -5 },
    desc: 'Reduces noise and heat from kills. Slight accuracy and damage penalty.',
  },
  {
    id: 'extended_mag', name: 'Extended Magazine', emoji: '📦',
    category: 'magazine', cost: 3000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { ammoCapacity: 50, reloadSpeed: -15 },
    desc: 'More rounds per magazine. Slower reload.',
  },
  {
    id: 'improved_sights', name: 'Improved Sights', emoji: '🔭',
    category: 'sights', cost: 4000,
    compatibleTypes: ['pistol', 'smg', 'rifle', 'shotgun'],
    effects: { accuracy: 15 },
    desc: 'Better accuracy at all ranges.',
  },
  {
    id: 'red_dot', name: 'Red Dot Sight', emoji: '🔴',
    category: 'sights', cost: 8000,
    compatibleTypes: ['smg', 'rifle'],
    effects: { accuracy: 25, critChance: 5 },
    desc: 'Precision targeting. Increased critical hit chance.',
  },
  {
    id: 'laser_sight', name: 'Laser Sight', emoji: '📍',
    category: 'sights', cost: 5000,
    compatibleTypes: ['pistol', 'smg'],
    effects: { accuracy: 10, intimidation: 10 },
    desc: 'Hip-fire accuracy boost. Intimidation factor.',
  },
  {
    id: 'grip_mod', name: 'Custom Grip', emoji: '✊',
    category: 'grip', cost: 2500,
    compatibleTypes: ['pistol', 'smg', 'rifle', 'shotgun'],
    effects: { accuracy: 8, recoilControl: 15 },
    desc: 'Better control and handling.',
  },
  {
    id: 'foregrip', name: 'Foregrip', emoji: '🤲',
    category: 'grip', cost: 3500,
    compatibleTypes: ['smg', 'rifle', 'shotgun'],
    effects: { recoilControl: 25, accuracy: 5 },
    desc: 'Significantly reduced recoil.',
  },
  {
    id: 'extended_barrel', name: 'Extended Barrel', emoji: '📏',
    category: 'barrel', cost: 5000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { damage: 10, accuracy: 10, concealability: -15 },
    desc: 'More damage and accuracy. Harder to conceal.',
  },
  {
    id: 'sawed_off', name: 'Sawed-Off Barrel', emoji: '✂️',
    category: 'barrel', cost: 1500,
    compatibleTypes: ['shotgun'],
    effects: { concealability: 30, spread: 40, range: -30 },
    desc: 'Concealable shotgun. Wide spread, short range.',
  },
  {
    id: 'drum_mag', name: 'Drum Magazine', emoji: '🥁',
    category: 'magazine', cost: 7000,
    compatibleTypes: ['smg', 'rifle'],
    effects: { ammoCapacity: 100, reloadSpeed: -30, weight: 20 },
    desc: 'Massive ammo capacity. Heavy and slow to reload.',
  },
  {
    id: 'hair_trigger', name: 'Hair Trigger', emoji: '⚡',
    category: 'trigger', cost: 4000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { fireRate: 20, accuracy: -5 },
    desc: 'Faster fire rate. Slightly reduced accuracy.',
  },
  {
    id: 'filed_serial', name: 'Filed Serial Number', emoji: '🔒',
    category: 'cosmetic', cost: 500,
    compatibleTypes: ['pistol', 'smg', 'rifle', 'shotgun', 'heavy'],
    effects: { traceability: -100 },
    desc: 'Untraceable weapon. Cannot be linked to you if found.',
  },
  {
    id: 'gold_plated', name: 'Gold Plating', emoji: '✨',
    category: 'cosmetic', cost: 25000,
    compatibleTypes: ['pistol', 'smg'],
    effects: { intimidation: 20, reputation: 5 },
    desc: 'Pure flex. +20 intimidation. +5 reputation when equipped.',
  },
  {
    id: 'armor_piercing', name: 'AP Rounds', emoji: '🎯',
    category: 'ammo', cost: 8000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { armorPen: 50, damage: 15 },
    desc: 'Penetrates body armor. Devastating against armored targets.',
  },
  {
    id: 'hollow_point', name: 'Hollow Points', emoji: '💀',
    category: 'ammo', cost: 5000,
    compatibleTypes: ['pistol', 'smg', 'rifle'],
    effects: { damage: 25, armorPen: -30 },
    desc: 'Maximum damage to unarmored targets. Weak against armor.',
  },
];

// Body Armor levels (from gameplay bible)
const BODY_ARMOR_TIERS = [
  { id: 'light_vest', name: 'Light Vest', cost: 2500, protection: 15, mobility: -5, concealable: true, desc: 'Basic concealed protection.' },
  { id: 'tactical_vest', name: 'Tactical Vest', cost: 8000, protection: 30, mobility: -10, concealable: false, desc: 'Standard tactical protection.' },
  { id: 'heavy_armor', name: 'Heavy Body Armor', cost: 20000, protection: 50, mobility: -20, concealable: false, desc: 'Serious protection. Visible and heavy.' },
  { id: 'military_grade', name: 'Military Grade', cost: 50000, protection: 75, mobility: -30, concealable: false, desc: 'Maximum protection. Extremely heavy.', minLevel: 5 },
];

// Equipment categories
const EQUIPMENT = [
  // Communication
  { id: 'burner_phone', name: 'Burner Phone', category: 'communication', cost: 200, effect: 'Basic communication. Disposable.', desc: 'Single-use phone. Destroy after use for -5 heat.' },
  { id: 'encrypted_phone', name: 'Encrypted Phone', category: 'communication', cost: 5000, effect: 'Secure communication. Wiretap resistant.', desc: '-30% wiretap effectiveness. Secure crew comms.' },
  { id: 'radio_set', name: 'Radio Set', category: 'communication', cost: 3000, effect: 'Crew coordination in combat/operations.', desc: '+15% crew coordination bonus in turf wars.' },
  { id: 'scanner', name: 'Police Scanner', category: 'communication', cost: 8000, effect: 'Monitor police frequencies.', desc: 'Early warning on raids. See police movements.' },
  // Vehicles (basic — full vehicle system separate)
  { id: 'beater_car', name: 'Beater Car', category: 'vehicle', cost: 2000, effect: 'Basic transport. Unreliable.', desc: 'Cheap but breaks down. -5% travel time.' },
  { id: 'sedan', name: 'Sedan', category: 'vehicle', cost: 15000, effect: 'Reliable transport. Low profile.', desc: '-15% travel time. Blend in with traffic.' },
  { id: 'suv', name: 'Armored SUV', category: 'vehicle', cost: 75000, effect: 'Protected transport. Intimidating.', desc: '-20% travel time. +30% chase escape. +15 intimidation.' },
  { id: 'speedboat', name: 'Speedboat', category: 'vehicle', cost: 50000, effect: 'Water transport. Caribbean access.', desc: 'Required for sea smuggling. Fast coastal travel.' },
  // Personal Gear
  { id: 'lockpicks', name: 'Lock Pick Set', category: 'gear', cost: 1500, effect: 'Open locked containers/doors.', desc: 'Required for break-in missions and stash recovery.' },
  { id: 'night_vision', name: 'Night Vision', category: 'gear', cost: 12000, effect: 'See in the dark.', desc: '+25% night operation effectiveness. Stealth bonus.' },
  { id: 'disguise_kit', name: 'Disguise Kit', category: 'gear', cost: 8000, effect: 'Change appearance temporarily.', desc: '-20 heat temporarily. Can enter hostile territory.' },
  { id: 'bulletproof_briefcase', name: 'Bulletproof Briefcase', category: 'gear', cost: 15000, effect: 'Concealed protection + style.', desc: '+10 protection. Can carry concealed weapons. +5 business rep.' },
];

// Initialize weapon state
function initWeaponState() {
  return {
    equipped: null,
    owned: [],
    upgrades: {}, // weaponId -> [upgradeId, ...]
    armor: null,
    equipment: [],
  };
}

// Get weapon upgrade compatibility
function getCompatibleUpgrades(weaponType) {
  return WEAPON_UPGRADES.filter(u => u.compatibleTypes.includes(weaponType));
}

// Get weapon with all upgrades applied
function getModifiedWeaponStats(weaponId, upgrades) {
  // Find base weapon from WEAPONS array
  const weapon = typeof WEAPONS !== 'undefined' ? WEAPONS.find(w => w.id === weaponId) : null;
  if (!weapon) return null;

  const modified = { ...weapon, appliedUpgrades: [] };

  if (!upgrades || !upgrades[weaponId]) return modified;

  for (const upgradeId of upgrades[weaponId]) {
    const upgrade = WEAPON_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) continue;

    modified.appliedUpgrades.push(upgrade);

    // Apply effects
    if (upgrade.effects.damage) modified.damage = Math.max(1, (modified.damage || 10) + upgrade.effects.damage);
    if (upgrade.effects.accuracy) modified.accuracy = Math.min(100, (modified.accuracy || 50) + upgrade.effects.accuracy);
    if (upgrade.effects.intimidation) modified.intimidation = (modified.intimidation || 0) + upgrade.effects.intimidation;
  }

  return modified;
}

// Install an upgrade on a weapon
function installWeaponUpgrade(state, weaponId, upgradeId) {
  if (!state.weaponState) state.weaponState = initWeaponState();

  const upgrade = WEAPON_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return { success: false, msg: 'Upgrade not found.' };

  if (state.cash < upgrade.cost) return { success: false, msg: 'Not enough cash.' };

  // Check if weapon already has an upgrade in this category
  if (!state.weaponState.upgrades[weaponId]) state.weaponState.upgrades[weaponId] = [];

  const existingInCategory = state.weaponState.upgrades[weaponId].find(uid => {
    const u = WEAPON_UPGRADES.find(x => x.id === uid);
    return u && u.category === upgrade.category;
  });

  if (existingInCategory) {
    return { success: false, msg: `Already have a ${upgrade.category} upgrade on this weapon.` };
  }

  state.cash -= upgrade.cost;
  state.weaponState.upgrades[weaponId].push(upgradeId);

  return { success: true, msg: `${upgrade.name} installed on weapon!` };
}

// Buy body armor
function buyArmor(state, armorId) {
  if (!state.weaponState) state.weaponState = initWeaponState();
  const armor = BODY_ARMOR_TIERS.find(a => a.id === armorId);
  if (!armor) return { success: false, msg: 'Armor not found.' };
  if (state.cash < armor.cost) return { success: false, msg: 'Not enough cash.' };

  state.cash -= armor.cost;
  state.weaponState.armor = armorId;
  return { success: true, msg: `${armor.name} equipped!` };
}

// Buy equipment
function buyEquipment(state, equipId) {
  if (!state.weaponState) state.weaponState = initWeaponState();
  const equip = EQUIPMENT.find(e => e.id === equipId);
  if (!equip) return { success: false, msg: 'Equipment not found.' };
  if (state.cash < equip.cost) return { success: false, msg: 'Not enough cash.' };

  state.cash -= equip.cost;
  if (!state.weaponState.equipment) state.weaponState.equipment = [];
  state.weaponState.equipment.push(equipId);
  return { success: true, msg: `${equip.name} acquired!` };
}

// Get armor protection value
function getArmorProtection(state) {
  if (!state.weaponState || !state.weaponState.armor) return 0;
  const armor = BODY_ARMOR_TIERS.find(a => a.id === state.weaponState.armor);
  return armor ? armor.protection : 0;
}

// Check if player has specific equipment
function hasEquipment(state, equipId) {
  return state.weaponState && state.weaponState.equipment && state.weaponState.equipment.includes(equipId);
}
