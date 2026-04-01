// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Core Game Engine
// ============================================================

const GAME_CONFIG = {
  totalDays: 5000,
  startingCash: 1500,
  startingDebt: 5000,
  debtInterestRate: 0.008, // 0.8% per day — loan sharks are ruthless
  bankInterestRate: 0.002, // 0.2% per day
  startingInventory: 200,
  startingHealth: 100,
  startingHeat: 0,
  maxHeat: 100,
  endlessMode: false, // Set true for infinite play
};

// ============================================================
// WORLDWIDE LOCATIONS - grouped by region
// ============================================================
const LOCATIONS = [
  // AMERICAS
  { id: 'miami', name: 'Miami', region: 'Americas', mapX: 23, mapY: 42, desc: 'Neon paradise, cocaine capital', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 1.0, drugSpecialty: 'cocaine', flavor: 'Palm trees sway under pink neon skies. The bass from a nearby club rattles your chest.' },
  { id: 'bogota', name: 'Bogotá', region: 'Americas', mapX: 20, mapY: 55, desc: 'Heart of the cartel empire', hasBank: false, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 5, priceModifier: 0.4, drugSpecialty: 'cocaine', flavor: 'Mountain air mixes with diesel fumes. Armed guards patrol every corner.' },
  { id: 'new_york', name: 'New York', region: 'Americas', mapX: 25, mapY: 35, desc: 'The city that never sleeps', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 1.2, drugSpecialty: 'heroin', flavor: 'Steam rises from the subway grates. Sirens echo between the skyscrapers.' },
  { id: 'medellin', name: 'Medellín', region: 'Americas', mapX: 19, mapY: 53, desc: 'Cartel stronghold in the valley', hasBank: false, hasLoanShark: false, hasHospital: false, hasBlackMarket: true, dangerLevel: 5, priceModifier: 0.3, drugSpecialty: 'cocaine', flavor: 'The "City of Eternal Spring" hides a deadly underworld beneath the flowers.' },
  { id: 'los_angeles', name: 'Los Angeles', region: 'Americas', mapX: 12, mapY: 38, desc: 'Hollywood glitz meets street grit', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 2, priceModifier: 1.1, drugSpecialty: 'weed', flavor: 'Sunset Boulevard shimmers in the heat. Everyone here is selling something.' },
  { id: 'rio', name: 'Rio de Janeiro', region: 'Americas', mapX: 30, mapY: 68, desc: 'Favelas and samba nights', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 4, priceModifier: 0.7, drugSpecialty: 'cocaine', flavor: 'Christ the Redeemer watches over a city of stark contrasts.' },
  { id: 'mexico_city', name: 'Mexico City', region: 'Americas', mapX: 15, mapY: 47, desc: 'Ancient city, modern trade routes', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 4, priceModifier: 0.6, drugSpecialty: 'weed', flavor: 'Aztec ruins sit beside modern plazas. The cartels own the night.' },

  // EUROPE
  { id: 'amsterdam', name: 'Amsterdam', region: 'Europe', mapX: 48, mapY: 28, desc: 'Canals, coffee shops, and connections', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 1, priceModifier: 0.9, drugSpecialty: 'ecstasy', flavor: 'Red lights reflect off the canal water. The smell of hash drifts from every doorway.' },
  { id: 'london', name: 'London', region: 'Europe', mapX: 46, mapY: 26, desc: 'Fog, finance, and the underground', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 2, priceModifier: 1.3, drugSpecialty: 'heroin', flavor: 'Big Ben chimes in the distance. The East End holds secrets money can\'t buy.' },
  { id: 'marseille', name: 'Marseille', region: 'Europe', mapX: 49, mapY: 33, desc: 'Port city with a dark reputation', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 0.8, drugSpecialty: 'heroin', flavor: 'The French Connection lives on in these narrow streets near the old port.' },
  { id: 'moscow', name: 'Moscow', region: 'Europe', mapX: 57, mapY: 22, desc: 'Red Square, black market', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 4, priceModifier: 1.1, drugSpecialty: 'speed', flavor: 'Soviet-era concrete meets ruthless capitalism. The bratva runs this town.' },
  { id: 'istanbul', name: 'Istanbul', region: 'Europe', mapX: 55, mapY: 34, desc: 'Where East meets West', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 0.7, drugSpecialty: 'opium', flavor: 'Minarets and bazaars. The ancient Silk Road\'s last stop before Europe.' },

  // ASIA & MIDDLE EAST
  { id: 'bangkok', name: 'Bangkok', region: 'Asia', mapX: 72, mapY: 50, desc: 'Golden temples, dark alleys', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 0.5, drugSpecialty: 'opium', flavor: 'Tuk-tuks race through neon streets. The Golden Triangle\'s gateway city.' },
  { id: 'hong_kong', name: 'Hong Kong', region: 'Asia', mapX: 77, mapY: 44, desc: 'Neon-lit triad territory', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 1.0, drugSpecialty: 'heroin', flavor: 'Skyscrapers pierce the clouds. Triad enforcers run the harbor.' },
  { id: 'tokyo', name: 'Tokyo', region: 'Asia', mapX: 83, mapY: 36, desc: 'Yakuza discipline, premium prices', hasBank: true, hasLoanShark: true, hasHospital: true, hasBlackMarket: false, dangerLevel: 2, priceModifier: 1.5, drugSpecialty: 'speed', flavor: 'Shibuya crossing floods with people. The Yakuza keep order—at a price.' },
  { id: 'kabul', name: 'Kabul', region: 'Asia', mapX: 63, mapY: 38, desc: 'Opium fields and warlords', hasBank: false, hasLoanShark: false, hasHospital: false, hasBlackMarket: true, dangerLevel: 5, priceModifier: 0.2, drugSpecialty: 'opium', flavor: 'Dusty mountains hide poppy fields stretching to the horizon.' },
  { id: 'mumbai', name: 'Mumbai', region: 'Asia', mapX: 66, mapY: 47, desc: 'Bollywood and the underworld', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 0.6, drugSpecialty: 'hashish', flavor: 'A city of dreams and desperation. D-Company\'s shadow looms large.' },

  // AFRICA & OCEANIA
  { id: 'casablanca', name: 'Casablanca', region: 'Africa', mapX: 44, mapY: 40, desc: 'North African smuggling hub', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 3, priceModifier: 0.6, drugSpecialty: 'hashish', flavor: 'Of all the gin joints... The hash trade flows through here like water.' },
  { id: 'lagos', name: 'Lagos', region: 'Africa', mapX: 47, mapY: 52, desc: 'West African hustle', hasBank: false, hasLoanShark: false, hasHospital: false, hasBlackMarket: true, dangerLevel: 4, priceModifier: 0.5, drugSpecialty: 'weed', flavor: 'The most populous city in Africa. Opportunity and danger in equal measure.' },
  { id: 'sydney', name: 'Sydney', region: 'Oceania', mapX: 85, mapY: 72, desc: 'Sun, surf, and smuggling routes', hasBank: true, hasLoanShark: false, hasHospital: true, hasBlackMarket: true, dangerLevel: 2, priceModifier: 1.4, drugSpecialty: 'ecstasy', flavor: 'The Opera House glows at dusk. Customs can\'t catch everything coming by sea.' },
];

// ============================================================
// DRUGS - expanded from original 6 to 12
// ============================================================
const DRUGS = [
  { id: 'cocaine', name: 'Cocaine', minPrice: 15000, maxPrice: 32000, volatility: 0.4, category: 'premium', emoji: '❄️', minLevel: 8 },
  { id: 'heroin', name: 'Heroin', minPrice: 5000, maxPrice: 15000, volatility: 0.35, category: 'premium', emoji: '💉', minLevel: 6 },
  { id: 'opium', name: 'Opium', minPrice: 3000, maxPrice: 9000, volatility: 0.3, category: 'mid', emoji: '🌺', minLevel: 5 },
  { id: 'ecstasy', name: 'Ecstasy', minPrice: 1500, maxPrice: 5500, volatility: 0.45, category: 'mid', emoji: '💊', minLevel: 4 },
  { id: 'acid', name: 'Acid', minPrice: 1000, maxPrice: 4500, volatility: 0.5, category: 'mid', emoji: '🌈', minLevel: 3 },
  { id: 'methamphetamine', name: 'Meth', minPrice: 800, maxPrice: 3500, volatility: 0.4, category: 'mid', emoji: '🔥', minLevel: 5 },
  { id: 'hashish', name: 'Hashish', minPrice: 500, maxPrice: 2000, volatility: 0.3, category: 'low', emoji: '🍫', minLevel: 2 },
  { id: 'weed', name: 'Weed', minPrice: 300, maxPrice: 1000, volatility: 0.25, category: 'low', emoji: '🌿', minLevel: 1 },
  { id: 'speed', name: 'Speed', minPrice: 70, maxPrice: 300, volatility: 0.35, category: 'bulk', emoji: '⚡', minLevel: 1 },
  { id: 'shrooms', name: 'Shrooms', minPrice: 50, maxPrice: 400, volatility: 0.5, category: 'bulk', emoji: '🍄', minLevel: 1 },
  { id: 'ludes', name: 'Ludes', minPrice: 10, maxPrice: 70, volatility: 0.4, category: 'bulk', emoji: '💤', minLevel: 1 },
  { id: 'peyote', name: 'Peyote', minPrice: 30, maxPrice: 250, volatility: 0.45, category: 'bulk', emoji: '🌵', minLevel: 1 },
  // === NEW EXPANSION DRUGS ===
  { id: 'fentanyl', name: 'Fentanyl', minPrice: 20000, maxPrice: 50000, volatility: 0.50, category: 'premium', emoji: '☠️', minLevel: 10, ngPlus: true },
  { id: 'ketamine', name: 'Ketamine', minPrice: 2000, maxPrice: 7000, volatility: 0.35, category: 'mid', emoji: '🐴', minLevel: 4 },
  { id: 'lean', name: 'Lean/Codeine', minPrice: 800, maxPrice: 3000, volatility: 0.30, category: 'mid', emoji: '🥤', minLevel: 2 },
  { id: 'ghb', name: 'GHB', minPrice: 1000, maxPrice: 4000, volatility: 0.40, category: 'mid', emoji: '💧', minLevel: 3 },
  { id: 'crack', name: 'Crack', minPrice: 200, maxPrice: 800, volatility: 0.45, category: 'low', emoji: '🪨', minLevel: 2 },
  { id: 'dmt', name: 'DMT', minPrice: 1500, maxPrice: 6000, volatility: 0.50, category: 'mid', emoji: '👁️', minLevel: 5 },
  { id: 'adderall', name: 'Adderall/Rx Pills', minPrice: 400, maxPrice: 1800, volatility: 0.30, category: 'low', emoji: '📋', minLevel: 1 },
  { id: 'xanax', name: 'Xanax/Benzos', minPrice: 300, maxPrice: 1500, volatility: 0.35, category: 'low', emoji: '😴', minLevel: 1 },
];

// ============================================================
// DRUG BUNDLES — Sell complementary drugs together for bonus pricing
// ============================================================
const DRUG_BUNDLES = [
  { id: 'speedball_bundle', name: 'Speedball Bundle', emoji: '💊', drugs: ['cocaine', 'heroin'], bonusMult: 1.15, minStreetwise: 3,
    desc: 'Classic combo. Cocaine + Heroin sold together for 15% bonus.' },
  { id: 'downer_pack', name: 'Downer Pack', emoji: '😴', drugs: ['xanax', 'lean'], bonusMult: 1.20, minStreetwise: 2,
    desc: 'Xanax + Lean bundle. Popular with suburban buyers. +20% price.' },
  { id: 'club_kit', name: 'Club Kit', emoji: '🎉', drugs: ['ecstasy', 'ketamine'], bonusMult: 1.18, minStreetwise: 3,
    desc: 'MDMA + Ketamine party pack. Club scene staple. +18% price.' },
  { id: 'hippie_flip', name: 'Hippie Flip', emoji: '🌈', drugs: ['shrooms', 'weed'], bonusMult: 1.10, minStreetwise: 1,
    desc: 'Shrooms + Weed. Easy bundle for beginners. +10% price.' },
  { id: 'pharma_pack', name: 'Pharma Pack', emoji: '📋', drugs: ['adderall', 'xanax'], bonusMult: 1.22, minStreetwise: 2,
    desc: 'Prescription combo. Adderall for the day, Xanax for the night. +22% price.' },
  { id: 'psychonaut_kit', name: 'Psychonaut Kit', emoji: '👁️', drugs: ['acid', 'dmt'], bonusMult: 1.25, minStreetwise: 4,
    desc: 'Acid + DMT for the experienced. High margins, niche market. +25% price.' },
  { id: 'premium_suite', name: 'Premium Suite', emoji: '💎', drugs: ['cocaine', 'fentanyl', 'heroin'], bonusMult: 1.40, minStreetwise: 5,
    desc: 'The ultimate bundle. NG+ only. Cocaine + Fentanyl + Heroin. +40% price.', ngPlus: true },
];

function sellBundle(state, bundleId, locationId) {
  const bundle = DRUG_BUNDLES.find(b => b.id === bundleId);
  if (!bundle) return { success: false, msg: 'Bundle not found.' };
  if (bundle.ngPlus && !(state.newGamePlus && state.newGamePlus.active && (state.newGamePlus.tier || 1) >= 2)) return { success: false, msg: 'NG+ Tier 2+ only bundle.' };
  // Check player has all drugs
  for (const drugId of bundle.drugs) {
    if (!state.inventory[drugId] || state.inventory[drugId] <= 0) {
      const drug = DRUGS.find(d => d.id === drugId);
      return { success: false, msg: 'Need ' + (drug ? drug.name : drugId) + ' for this bundle.' };
    }
  }
  // Sell one unit of each drug with bonus multiplier
  let totalRevenue = 0;
  const msgs = [];
  for (const drugId of bundle.drugs) {
    const drug = DRUGS.find(d => d.id === drugId);
    const basePrice = state.prices && state.prices[drugId] ? state.prices[drugId] : drug.minPrice;
    const bundlePrice = Math.floor(basePrice * bundle.bonusMult);
    state.inventory[drugId] -= 1;
    if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
    totalRevenue += bundlePrice;
    msgs.push(drug.emoji + ' ' + drug.name + ': $' + bundlePrice.toLocaleString());
  }
  state.cash += totalRevenue;
  if (!state.stats) state.stats = {};
  state.stats.totalEarnedFromDrugs = (state.stats.totalEarnedFromDrugs || 0) + totalRevenue;
  return { success: true, msg: bundle.emoji + ' ' + bundle.name + ' sold for $' + totalRevenue.toLocaleString() + '!', details: msgs, revenue: totalRevenue };
}

function getAvailableBundles(state) {
  const ngPlus = state.newGamePlus && state.newGamePlus.active;
  const ngTier = ngPlus ? (state.newGamePlus.tier || 1) : 0;
  return DRUG_BUNDLES.filter(b => {
    if (b.ngPlus && (!ngPlus || ngTier < 2)) return false;
    // Check player has at least 1 of each drug
    return b.drugs.every(drugId => state.inventory[drugId] && state.inventory[drugId] > 0);
  });
}

// ============================================================
// WEAPONS
// ============================================================
const WEAPONS = [
  // Melee
  { id: 'fists', name: 'Bare Fists', damage: 5, accuracy: 0.5, price: 0, space: 0, tier: 'melee', emoji: '👊' },
  { id: 'switchblade', name: 'Switchblade', damage: 10, accuracy: 0.6, price: 150, space: 1, tier: 'melee', emoji: '🔪' },
  { id: 'machete', name: 'Machete', damage: 18, accuracy: 0.65, price: 400, space: 2, tier: 'melee', emoji: '🗡️' },
  // Pistols
  { id: 'saturday_night', name: 'Saturday Night Special', damage: 20, accuracy: 0.5, price: 500, space: 3, tier: 'pistol', emoji: '🔫' },
  { id: 'beretta', name: 'Beretta 92', damage: 30, accuracy: 0.65, price: 1500, space: 4, tier: 'pistol', emoji: '🔫' },
  { id: 'magnum', name: '.44 Magnum', damage: 50, accuracy: 0.7, price: 4000, space: 4, tier: 'pistol', emoji: '🔫' },
  { id: 'desert_eagle', name: 'Desert Eagle .50', damage: 60, accuracy: 0.6, price: 8000, space: 5, tier: 'pistol', emoji: '🔫' },
  { id: 'gold_deagle', name: 'Gold Desert Eagle', damage: 65, accuracy: 0.65, price: 25000, space: 5, tier: 'pistol', emoji: '✨' },
  // SMGs & Shotguns
  { id: 'uzi', name: 'Uzi', damage: 45, accuracy: 0.55, price: 5000, space: 6, tier: 'smg', emoji: '🔫' },
  { id: 'mac10', name: 'MAC-10', damage: 50, accuracy: 0.5, price: 6000, space: 5, tier: 'smg', emoji: '🔫' },
  { id: 'mp5', name: 'MP5', damage: 55, accuracy: 0.65, price: 10000, space: 6, tier: 'smg', emoji: '🔫' },
  { id: 'shotgun', name: 'Sawed-Off Shotgun', damage: 55, accuracy: 0.45, price: 3000, space: 5, tier: 'shotgun', emoji: '🔫' },
  { id: 'spas12', name: 'SPAS-12', damage: 65, accuracy: 0.5, price: 8000, space: 7, tier: 'shotgun', emoji: '🔫' },
  // Assault Rifles
  { id: 'ak47', name: 'AK-47', damage: 65, accuracy: 0.6, price: 12000, space: 8, tier: 'rifle', emoji: '🔫' },
  { id: 'm16', name: 'M16', damage: 70, accuracy: 0.7, price: 18000, space: 8, tier: 'rifle', emoji: '🔫' },
  { id: 'scar_h', name: 'SCAR-H', damage: 80, accuracy: 0.72, price: 30000, space: 9, tier: 'rifle', emoji: '🔫' },
  { id: 'galil', name: 'Galil ACE', damage: 75, accuracy: 0.68, price: 22000, space: 8, tier: 'rifle', emoji: '🔫' },
  // Heavy / Drug Lord Tier
  { id: 'rpk', name: 'RPK Machine Gun', damage: 90, accuracy: 0.55, price: 50000, space: 12, tier: 'heavy', emoji: '💥' },
  { id: 'm60', name: 'M60 Belt-Fed', damage: 100, accuracy: 0.5, price: 75000, space: 15, tier: 'heavy', emoji: '💥' },
  { id: 'rpg', name: 'RPG-7', damage: 150, accuracy: 0.35, price: 100000, space: 15, tier: 'heavy', emoji: '🚀' },
  { id: 'minigun', name: 'M134 Minigun', damage: 200, accuracy: 0.4, price: 250000, space: 20, tier: 'heavy', emoji: '💀' },
  { id: 'grenade_launcher', name: 'M79 Grenade Launcher', damage: 130, accuracy: 0.4, price: 80000, space: 10, tier: 'heavy', emoji: '💣' },
  // Legendary
  { id: 'gold_ak', name: 'Gold-Plated AK-47', damage: 85, accuracy: 0.65, price: 150000, space: 8, tier: 'legendary', emoji: '👑' },
  { id: 'scarface_friend', name: '"My Little Friend" (M16A1 + M203)', damage: 160, accuracy: 0.55, price: 500000, space: 18, tier: 'legendary', emoji: '🌟' },
  // === EXPANSION: SNIPER RIFLES ===
  { id: 'hunting_rifle', name: 'Hunting Rifle', damage: 55, accuracy: 0.80, price: 6000, space: 7, tier: 'sniper', emoji: '🎯' },
  { id: 'dragunov', name: 'Dragunov SVD', damage: 70, accuracy: 0.82, price: 18000, space: 8, tier: 'sniper', emoji: '🎯' },
  { id: 'barrett_50cal', name: 'Barrett .50 Cal', damage: 120, accuracy: 0.75, price: 85000, space: 14, tier: 'sniper', emoji: '🎯', ngPlus: true },
  { id: 'silenced_308', name: 'Silenced .308', damage: 65, accuracy: 0.85, price: 35000, space: 8, tier: 'sniper', emoji: '🔇' },
  // === EXPANSION: PISTOLS ===
  { id: 'glock_19', name: 'Glock 19', damage: 25, accuracy: 0.70, price: 800, space: 3, tier: 'pistol', emoji: '🔫' },
  { id: 'colt_python', name: 'Colt Python .357', damage: 45, accuracy: 0.72, price: 3500, space: 4, tier: 'pistol', emoji: '🔫' },
  { id: 'fn_fiveseven', name: 'FN Five-seveN', damage: 35, accuracy: 0.75, price: 5000, space: 4, tier: 'pistol', emoji: '🔫' },
  { id: 'gold_colt_1911', name: 'Gold Colt 1911', damage: 40, accuracy: 0.68, price: 50000, space: 4, tier: 'pistol', emoji: '✨' },
  // === EXPANSION: SMGS ===
  { id: 'tec9', name: 'TEC-9', damage: 40, accuracy: 0.45, price: 3000, space: 5, tier: 'smg', emoji: '🔫' },
  { id: 'p90', name: 'P90', damage: 60, accuracy: 0.68, price: 15000, space: 6, tier: 'smg', emoji: '🔫' },
  { id: 'kriss_vector', name: 'Kriss Vector', damage: 58, accuracy: 0.72, price: 20000, space: 6, tier: 'smg', emoji: '🔫' },
  // === EXPANSION: SHOTGUNS ===
  { id: 'aa12', name: 'AA-12 Auto Shotgun', damage: 70, accuracy: 0.48, price: 25000, space: 9, tier: 'shotgun', emoji: '🔫' },
  { id: 'double_barrel', name: 'Double Barrel Coach Gun', damage: 75, accuracy: 0.42, price: 1500, space: 5, tier: 'shotgun', emoji: '🔫' },
  // === EXPANSION: ASSAULT RIFLES ===
  { id: 'fn_fal', name: 'FN FAL', damage: 78, accuracy: 0.66, price: 20000, space: 8, tier: 'rifle', emoji: '🔫' },
  { id: 'steyr_aug', name: 'Steyr AUG', damage: 72, accuracy: 0.74, price: 25000, space: 8, tier: 'rifle', emoji: '🔫' },
  { id: 'gold_m16', name: 'Gold-Plated M16', damage: 88, accuracy: 0.72, price: 200000, space: 8, tier: 'rifle', emoji: '✨' },
  // === EXPANSION: THROWABLES ===
  { id: 'frag_grenade', name: 'Frag Grenade', damage: 80, accuracy: 0.60, price: 500, space: 1, tier: 'throwable', emoji: '💣', consumable: true },
  { id: 'flashbang', name: 'Flashbang', damage: 0, accuracy: 0.90, price: 300, space: 1, tier: 'throwable', emoji: '💥', consumable: true, effect: 'stun' },
  { id: 'molotov', name: 'Molotov Cocktail', damage: 45, accuracy: 0.55, price: 50, space: 1, tier: 'throwable', emoji: '🔥', consumable: true },
  { id: 'smoke_grenade', name: 'Smoke Grenade', damage: 0, accuracy: 0.95, price: 200, space: 1, tier: 'throwable', emoji: '💨', consumable: true, effect: 'escape' },
  { id: 'c4', name: 'C4 Explosive', damage: 200, accuracy: 1.0, price: 5000, space: 2, tier: 'throwable', emoji: '💣', consumable: true, ngPlus: true },
  // === EXPANSION: EXOTIC / PRESTIGE ===
  { id: 'crossbow', name: 'Crossbow', damage: 40, accuracy: 0.70, price: 2000, space: 6, tier: 'exotic', emoji: '🏹' },
  { id: 'flamethrower', name: 'Flamethrower', damage: 95, accuracy: 0.40, price: 60000, space: 12, tier: 'exotic', emoji: '🔥' },
  { id: 'chainsaw', name: 'Chainsaw', damage: 100, accuracy: 0.30, price: 800, space: 10, tier: 'exotic', emoji: '🪚' },
  { id: 'tonys_throne', name: "Tony's Throne (Mounted M60)", damage: 150, accuracy: 0.55, price: 500000, space: 0, tier: 'exotic', emoji: '🪑' },
  { id: 'stinger_missile', name: 'Stinger Missile', damage: 300, accuracy: 0.50, price: 200000, space: 20, tier: 'exotic', emoji: '🚀', ngPlus: true },
];

// ============================================================
// CONSUMABLE ITEMS
// ============================================================
const ITEMS = [
  { id: 'body_armor', name: 'Body Armor', emoji: '🦺', price: 2500, maxStack: 3, category: 'combat',
    desc: 'Reduces combat damage taken by 30%. Single use — consumed when hit.', effect: { damageReduction: 0.3 } },
  { id: 'first_aid', name: 'First Aid Kit', emoji: '🩹', price: 500, maxStack: 5, category: 'health',
    desc: 'Heal 30 HP instantly. Can be used in or out of combat.', effect: { heal: 30 } },
  { id: 'burner_phone', name: 'Burner Phone', emoji: '📱', price: 200, maxStack: 10, category: 'heat',
    desc: 'Destroy your phone trail. Instantly reduces heat by 5.', effect: { heatReduction: 5 } },
  { id: 'fake_id', name: 'Fake ID', emoji: '🪪', price: 5000, maxStack: 2, category: 'legal',
    desc: 'Auto-consumed to avoid one arrest. Beats basic police checks.', effect: { avoidArrest: true } },
  { id: 'bribe_envelope', name: 'Bribe Envelope', emoji: '💰', price: 3000, maxStack: 5, category: 'heat',
    desc: 'Pre-stuffed cash envelope. Reduces heat by 10, adds +5 corruption.', effect: { heatReduction: 10, corruption: 5 } },
  { id: 'wiretap_kit', name: 'Wire Tap Kit', emoji: '🎙️', price: 8000, maxStack: 2, category: 'intel',
    desc: 'Bug a rival faction. Reveals their operations for 5 days.', effect: { intelDays: 5 } },
  { id: 'lockpicks', name: 'Lock Pick Set', emoji: '🔓', price: 1500, maxStack: 3, category: 'tools',
    desc: 'Required for break-in missions. Consumed on use. Reusable quality varies.', effect: { lockpick: true } },
  { id: 'speed_boat_keys', name: 'Speed Boat Keys', emoji: '🚤', price: 15000, maxStack: 1, category: 'transport',
    desc: 'Access to a fast boat. Cuts water route travel time in half. Permanent until confiscated.', effect: { waterSpeedBonus: 0.5 } },
  { id: 'scope', name: 'Rifle Scope', emoji: '🔭', price: 4000, maxStack: 1, category: 'combat',
    desc: 'Attaches to your equipped weapon. +15% accuracy permanently until weapon changes.', effect: { accuracyBonus: 0.15 } },
  { id: 'silencer', name: 'Silencer', emoji: '🔇', price: 6000, maxStack: 1, category: 'combat',
    desc: 'Suppressor for your weapon. Combat kills generate no heat. Permanent until weapon changes.', effect: { silentKills: true } },
  // === EXPANSION ITEMS ===
  { id: 'adrenaline_shot', name: 'Adrenaline Shot', emoji: '💉', price: 1000, maxStack: 3, category: 'combat',
    desc: 'Instantly heal 50 HP. Combat use only.', effect: { heal: 50, combatOnly: true } },
  { id: 'disguise_kit', name: 'Disguise Kit', emoji: '🎭', price: 3000, maxStack: 2, category: 'heat',
    desc: '-30% recognition for 3 days. Avoid known associates.', effect: { heatReduction: 15, disguiseDays: 3 } },
  { id: 'gps_tracker', name: 'GPS Tracker', emoji: '📡', price: 2000, maxStack: 5, category: 'intel',
    desc: 'Plant on rival vehicle. Track movement for 7 days.', effect: { trackDays: 7 } },
  { id: 'listening_device', name: 'Listening Device', emoji: '🎧', price: 4000, maxStack: 3, category: 'intel',
    desc: 'Plant in location. Gather intel for 14 days.', effect: { intelDays: 14 } },
  { id: 'emp_device', name: 'EMP Device', emoji: '⚡', price: 10000, maxStack: 1, category: 'tools',
    desc: 'Disable electronics in area. Cameras, phones, alarms. Single use.', effect: { disableElectronics: true } },
  { id: 'smoke_bomb', name: 'Smoke Bomb', emoji: '💨', price: 500, maxStack: 5, category: 'combat',
    desc: 'Escape combat encounter instantly. Single use.', effect: { instantEscape: true } },
  { id: 'night_vision', name: 'Night Vision Goggles', emoji: '🥽', price: 5000, maxStack: 1, category: 'combat',
    desc: 'Night operations bonus +25%. Permanent until lost.', effect: { nightBonus: 0.25 } },
  { id: 'diplomatic_pouch', name: 'Diplomatic Pouch', emoji: '📦', price: 20000, maxStack: 1, category: 'transport',
    desc: 'Transport 500 units through any checkpoint undetected. Single use.', effect: { smuggle: 500 } },
  { id: 'forged_documents', name: 'Forged Documents', emoji: '📄', price: 8000, maxStack: 2, category: 'legal',
    desc: 'Create fake business records. +20% audit defense for 30 days.', effect: { auditDefense: 0.2, duration: 30 } },
  { id: 'satellite_phone', name: 'Satellite Phone', emoji: '📞', price: 15000, maxStack: 1, category: 'tools',
    desc: 'Untraceable communication. Immune to wiretaps. Permanent.', effect: { antiWiretap: true } },
];

function buyItem(state, itemId) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return { success: false, msg: 'Item not found.' };
  if (state.cash < item.price) return { success: false, msg: 'Not enough cash.' };
  if (!state.items) state.items = [];
  const count = state.items.filter(i => i === itemId).length;
  if (count >= item.maxStack) return { success: false, msg: 'Already carrying maximum ' + item.name + '.' };
  state.cash -= item.price;
  state.items.push(itemId);
  return { success: true, msg: 'Bought ' + item.emoji + ' ' + item.name + '!' };
}

function useItem(state, itemId) {
  if (!state.items) return { success: false, msg: 'No items.' };
  const idx = state.items.indexOf(itemId);
  if (idx === -1) return { success: false, msg: 'You don\'t have that item.' };
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return { success: false, msg: 'Unknown item.' };

  // Apply effect
  if (item.effect.heal) {
    state.health = Math.min(state.maxHealth || 100, (state.health || 100) + item.effect.heal);
    state.items.splice(idx, 1);
    return { success: true, msg: item.emoji + ' Used ' + item.name + '. Healed ' + item.effect.heal + ' HP!' };
  }
  if (item.effect.heatReduction) {
    state.heat = Math.max(0, (state.heat || 0) - item.effect.heatReduction);
    if (item.effect.corruption && state.politics) {
      state.politics.politicalInfluence = (state.politics.politicalInfluence || 0) + item.effect.corruption;
    }
    state.items.splice(idx, 1);
    return { success: true, msg: item.emoji + ' Used ' + item.name + '. Heat reduced by ' + item.effect.heatReduction + '!' };
  }
  if (item.effect.intelDays) {
    // Mark intel active
    if (!state.activeBuffs) state.activeBuffs = [];
    state.activeBuffs.push({ type: 'faction_intel', daysLeft: item.effect.intelDays });
    state.items.splice(idx, 1);
    return { success: true, msg: item.emoji + ' Wire tap active! Faction intel revealed for ' + item.effect.intelDays + ' days.' };
  }

  return { success: false, msg: 'Can\'t use that item right now.' };
}

function hasItem(state, itemId) {
  return (state.items || []).includes(itemId);
}

function getItemCount(state, itemId) {
  return (state.items || []).filter(i => i === itemId).length;
}

// ============================================================
// TRANSPORT TYPES
// ============================================================
const TRANSPORT = {
  // Budget
  bus: { name: 'Greyhound Bus', emoji: '🚌', costPerRegion: 200, timeDays: 2, riskMod: 0.5, inventoryLimit: 500, sameRegionOnly: true, tier: 'budget' },
  car: { name: 'Muscle Car', emoji: '🚗', costPerRegion: 500, timeDays: 1, riskMod: 0.8, inventoryLimit: 1000, sameRegionOnly: true, tier: 'budget' },
  motorcycle: { name: 'Motorcycle', emoji: '🏍️', costPerRegion: 300, timeDays: 1, riskMod: 0.9, inventoryLimit: 200, sameRegionOnly: true, tier: 'budget' },
  // Standard
  suv: { name: 'Blacked-Out SUV', emoji: '🚙', costPerRegion: 1200, timeDays: 1, riskMod: 0.6, inventoryLimit: 2500, sameRegionOnly: true, tier: 'standard' },
  commercial: { name: 'Commercial Flight', emoji: '✈️', costPerRegion: 3000, timeDays: 1, riskMod: 1.2, inventoryLimit: 500, sameRegionOnly: false, tier: 'standard' },
  boat: { name: 'Speedboat', emoji: '🚤', costPerRegion: 2000, timeDays: 3, riskMod: 0.6, inventoryLimit: 5000, sameRegionOnly: false, tier: 'standard' },
  // Premium
  armored_truck: { name: 'Armored Truck', emoji: '🛡️', costPerRegion: 4000, timeDays: 2, riskMod: 0.3, inventoryLimit: 10000, sameRegionOnly: true, tier: 'premium' },
  go_fast_boat: { name: 'Go-Fast Boat', emoji: '⚡', costPerRegion: 6000, timeDays: 2, riskMod: 0.4, inventoryLimit: 15000, sameRegionOnly: false, tier: 'premium' },
  cargo_ship: { name: 'Cargo Ship', emoji: '🚢', costPerRegion: 5000, timeDays: 5, riskMod: 0.2, inventoryLimit: 50000, sameRegionOnly: false, tier: 'premium' },
  private_jet: { name: 'Private Jet', emoji: '🛩️', costPerRegion: 15000, timeDays: 1, riskMod: 0.3, inventoryLimit: 5000, sameRegionOnly: false, tier: 'premium' },
  // Drug Lord
  semi_truck: { name: 'Semi Truck (Hidden Compartment)', emoji: '🚛', costPerRegion: 8000, timeDays: 3, riskMod: 0.15, inventoryLimit: 100000, sameRegionOnly: true, tier: 'lord' },
  narco_sub: { name: 'Narco Submarine', emoji: '🔱', costPerRegion: 20000, timeDays: 7, riskMod: 0.05, inventoryLimit: 250000, sameRegionOnly: false, tier: 'lord' },
  military_convoy: { name: 'Military Convoy', emoji: '🪖', costPerRegion: 25000, timeDays: 2, riskMod: 0.1, inventoryLimit: 150000, sameRegionOnly: true, tier: 'lord' },
  yacht: { name: 'Luxury Yacht', emoji: '🛥️', costPerRegion: 30000, timeDays: 4, riskMod: 0.15, inventoryLimit: 75000, sameRegionOnly: false, tier: 'lord' },
  cartel_plane: { name: 'Cartel Cargo Plane', emoji: '🛫', costPerRegion: 50000, timeDays: 1, riskMod: 0.1, inventoryLimit: 200000, sameRegionOnly: false, tier: 'lord' },
};

// ============================================================
// HENCHMEN / CREW
// ============================================================
const HENCHMEN_TYPES = [
  { id: 'thug', name: 'Street Thug', cost: 500, dailyPay: 100, combat: 15, carry: 500 },
  { id: 'bodyguard', name: 'Bodyguard', cost: 2000, dailyPay: 300, combat: 35, carry: 200 },
  { id: 'smuggler', name: 'Smuggler', cost: 3000, dailyPay: 400, combat: 10, carry: 2000 },
  { id: 'enforcer', name: 'Enforcer', cost: 5000, dailyPay: 600, combat: 50, carry: 300 },
  { id: 'chemist', name: 'Chemist', cost: 8000, dailyPay: 800, combat: 5, carry: 200, special: 'Can cut drugs to increase quantity by 20% (reduces quality/reputation)' },
  { id: 'lawyer', name: 'Lawyer', cost: 10000, dailyPay: 1000, combat: 0, carry: 0, special: 'Reduces investigation gain by 40%. Improves court chances by 10%.' },
  { id: 'lookout', name: 'Lookout', cost: 1500, dailyPay: 200, combat: 5, carry: 100, special: 'Reduces travel encounter chance by 15%.' },
  { id: 'fall_guy', name: 'Fall Guy', cost: 6000, dailyPay: 500, combat: 0, carry: 200, special: 'Takes the rap if arrested. Destroyed after use — avoids trial entirely.' },
  // === EXPANSION CREW TYPES ===
  { id: 'sniper', name: 'Sniper', cost: 12000, dailyPay: 900, combat: 40, carry: 100,
    special: 'Long-range elimination. +30% accuracy with rifles. Required for assassination missions.' },
  { id: 'pilot', name: 'Pilot', cost: 15000, dailyPay: 1200, combat: 10, carry: 500,
    special: 'Required for air transport. Reduces air shipping risk by 40%. Can fly escape routes.' },
  { id: 'boat_captain', name: 'Boat Captain', cost: 10000, dailyPay: 800, combat: 15, carry: 1000,
    special: 'Required for sea transport. Coastal navigation expert. -30% water shipping risk.' },
  { id: 'hacker', name: 'Hacker', cost: 20000, dailyPay: 1500, combat: 0, carry: 0,
    special: 'Digital intelligence. Can hack rival accounts, reduce investigation digitally, access databases.', ngPlus: true },
  { id: 'mechanic', name: 'Mechanic', cost: 4000, dailyPay: 400, combat: 10, carry: 300,
    special: 'Vehicle maintenance (-50% repair costs), hidden compartment installation, chop shop operations.' },
  { id: 'accountant', name: 'Accountant', cost: 8000, dailyPay: 1000, combat: 0, carry: 0,
    special: 'Money laundering efficiency +30%. Tax evasion. Offshore account management. Audit defense.' },
  { id: 'assassin', name: 'Assassin', cost: 25000, dailyPay: 1500, combat: 60, carry: 100,
    special: 'Specialized in hits. +50% assassination success rate. Silent kills. Professional disposal.' },
  { id: 'diplomat_crew', name: 'Diplomat', cost: 12000, dailyPay: 1000, combat: 0, carry: 0,
    special: 'Faction relationship management. +15% diplomacy success. Can negotiate truces. Prevents accidental wars.' },
];

// ============================================================
// INVESTIGATION SYSTEM
// ============================================================
const INVESTIGATION_LEVELS = [
  { level: 0, name: 'Clean', desc: 'No law enforcement interest', emoji: '✅' },
  { level: 1, name: 'Rumors', desc: 'Street rumors about your activities', emoji: '👂' },
  { level: 2, name: 'Surveillance', desc: 'Undercover agents watching you', emoji: '🕵️' },
  { level: 3, name: 'Active Case', desc: 'DEA has opened a case file', emoji: '📁' },
  { level: 4, name: 'Indictment', desc: 'Grand jury preparing charges', emoji: '⚖️' },
  { level: 5, name: 'Warrant', desc: 'Federal arrest warrant issued', emoji: '🚨' },
];

const INVESTIGATION_CONFIG = {
  maxLevel: 5,
  decayPerIdleDay: 0.5,
  lawyerReduction: 0.4,
  lookoutReduction: 0.15,
  thresholds: [0, 10, 25, 45, 70, 90],
};

const COURT_CONTACTS = [
  { id: 'dirty_lawyer', name: 'Dirty Lawyer', emoji: '👔', costRange: [5000, 20000], baseChance: [0.40, 0.60], desc: 'Gets you off on a technicality', requires: null, outcome: 'acquittal' },
  { id: 'corrupt_judge', name: 'Corrupt Judge', emoji: '⚖️', costRange: [15000, 50000], baseChance: [0.50, 0.70], desc: 'Dismisses the case entirely', requires: null, outcome: 'dismissal' },
  { id: 'jury_tampering', name: 'Jury Tampering', emoji: '🗳️', costRange: [10000, 30000], baseChance: [0.30, 0.50], desc: 'Hung jury — case falls apart', requires: null, outcome: 'hung_jury' },
  { id: 'witness_intimidation', name: 'Witness Intimidation', emoji: '😨', costRange: [3000, 10000], baseChance: [0.25, 0.40], desc: 'Key witnesses recant testimony', requires: 'enforcer', outcome: 'recanted' },
  { id: 'evidence_tampering', name: 'Evidence Tampering', emoji: '🧪', costRange: [8000, 25000], baseChance: [0.35, 0.55], desc: 'Lab results contaminated', requires: 'chemist', outcome: 'contaminated' },
  { id: 'fbi_deal', name: 'FBI Informant Deal', emoji: '🐀', costRange: [0, 0], baseChance: [0.80, 0.80], desc: 'Turn rat — high chance but severe reputation cost', requires: null, outcome: 'informant_deal' },
];

const COURT_SENTENCES = {
  1: { prisonDays: [15, 45], assetForfeiture: [0.15, 0.35], label: 'First Offense' },
  2: { prisonDays: [45, 120], assetForfeiture: [0.30, 0.60], label: 'Second Offense' },
  3: { prisonDays: [120, 300], assetForfeiture: [0.60, 0.90], label: 'Third Strike — Maximum Security' },
  4: { prisonDays: [250, 600], assetForfeiture: [0.80, 0.98], label: 'Repeat Offender — Supermax' },
};

// Charge severity multipliers — stacks on top of base sentence
const CHARGE_PENALTIES = {
  possession: { prisonMod: 1.0, forfeitMod: 1.0, label: 'Possession' },
  possession_premium: { prisonMod: 2.0, forfeitMod: 1.5, label: 'Possession (Class A)' }, // cocaine, heroin, etc.
  possession_large: { prisonMod: 3.0, forfeitMod: 2.0, label: 'Possession w/ Intent to Distribute' }, // >20 units
  rico: { prisonMod: 4.0, forfeitMod: 2.5, label: 'RICO Act Violations' },
  manslaughter: { prisonMod: 3.0, forfeitMod: 1.5, label: 'Manslaughter' }, // per count
  cop_killing: { prisonMod: 6.0, forfeitMod: 3.0, label: 'Murder of Law Enforcement' },
};

const PREMIUM_DRUGS = ['cocaine', 'heroin', 'crack', 'meth'];

// ============================================================
// MONEY LAUNDERING / FRONT COMPANIES
// ============================================================
const FRONT_BUSINESSES = [
  { id: 'taco_stand', name: 'Taco Stand', emoji: '🌮', cost: 5000, dailyIncome: 150, launderRate: 0.05, launderMax: 2000, heatReduction: 0, desc: 'Small but discreet' },
  { id: 'laundromat', name: 'Laundromat', emoji: '👕', cost: 15000, dailyIncome: 400, launderRate: 0.08, launderMax: 5000, heatReduction: 2, desc: 'The classic front' },
  { id: 'car_wash', name: 'Car Wash', emoji: '🚗', cost: 25000, dailyIncome: 600, launderRate: 0.10, launderMax: 8000, heatReduction: 3, desc: 'Cash business, no questions' },
  { id: 'nightclub', name: 'Nightclub', emoji: '🎵', cost: 75000, dailyIncome: 1500, launderRate: 0.15, launderMax: 20000, heatReduction: 5, desc: 'High volume cash flow' },
  { id: 'restaurant', name: 'Restaurant Chain', emoji: '🍕', cost: 120000, dailyIncome: 2500, launderRate: 0.12, launderMax: 15000, heatReduction: 5, desc: 'Multiple locations' },
  { id: 'construction', name: 'Construction Co.', emoji: '🏗️', cost: 200000, dailyIncome: 3000, launderRate: 0.20, launderMax: 30000, heatReduction: 8, desc: 'Big invoices, no trail' },
  { id: 'shell_corp', name: 'Shell Corporation', emoji: '🏢', cost: 500000, dailyIncome: 1000, launderRate: 0.30, launderMax: 100000, heatReduction: 10, desc: 'Offshore accounts, max laundering' },
  { id: 'real_estate', name: 'Real Estate LLC', emoji: '🏠', cost: 350000, dailyIncome: 4000, launderRate: 0.18, launderMax: 50000, heatReduction: 7, desc: 'Property flips hide cash' },
];

function buyFrontBusiness(state, businessId) {
  const biz = FRONT_BUSINESSES.find(b => b.id === businessId);
  if (!biz) return { success: false, msg: 'Business not found.' };
  if (!state.frontBusinesses) state.frontBusinesses = [];
  if (state.frontBusinesses.some(b => b.id === businessId)) return { success: false, msg: 'You already own this business.' };
  if (state.cash < biz.cost) return { success: false, msg: `Need $${biz.cost.toLocaleString()}. You have $${state.cash.toLocaleString()}.` };

  state.cash -= biz.cost;
  state.frontBusinesses.push({
    id: biz.id,
    dayBought: state.day,
    totalLaundered: 0,
    totalIncome: 0,
  });

  return { success: true, msg: `Purchased ${biz.emoji} ${biz.name} for $${biz.cost.toLocaleString()}!` };
}

function launderMoney(state, amount) {
  if (!state.frontBusinesses || state.frontBusinesses.length === 0) return { success: false, msg: 'No front businesses to launder through.' };
  if (amount > state.cash) return { success: false, msg: 'Not enough cash.' };

  // Calculate total launder capacity (Cleanskin gets +25% bonus)
  let totalCapacity = 0;
  for (const owned of state.frontBusinesses) {
    const biz = FRONT_BUSINESSES.find(b => b.id === owned.id);
    if (biz) totalCapacity += biz.launderMax;
  }
  const charLaunderBonus = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'launderBonus') : 0;
  if (charLaunderBonus > 0) totalCapacity = Math.round(totalCapacity * (1 + charLaunderBonus));

  const actual = Math.min(amount, totalCapacity);
  if (actual <= 0) return { success: false, msg: 'Laundering capacity maxed out for today.' };

  // Move cash to bank, reduce investigation
  state.cash -= actual;
  state.bank += actual;

  // Reduce investigation based on laundering (clean money = less suspicious)
  const reductionRate = state.frontBusinesses.reduce((sum, owned) => {
    const biz = FRONT_BUSINESSES.find(b => b.id === owned.id);
    return sum + (biz ? biz.launderRate : 0);
  }, 0);
  const investigationReduction = Math.min(5, actual / 10000 * reductionRate);
  if (state.investigation) {
    state.investigation.points = Math.max(0, state.investigation.points - investigationReduction);
    state.investigation.level = getInvestigationLevel(state.investigation.points);
  }

  // Convert dirty → clean money
  var dirtyConverted = Math.min(actual, state.dirtyMoney || 0);
  state.dirtyMoney = Math.max(0, (state.dirtyMoney || 0) - dirtyConverted);
  state.cleanMoney = (state.cleanMoney || 0) + actual;

  // Track totals
  if (state.stats) state.stats.totalLaunderedMoney = (state.stats.totalLaunderedMoney || 0) + actual;
  for (const owned of state.frontBusinesses) {
    owned.totalLaundered += Math.floor(actual / state.frontBusinesses.length);
  }

  return {
    success: true,
    msg: `💰 Laundered $${actual.toLocaleString()} through your businesses. $${dirtyConverted.toLocaleString()} dirty money cleaned. Deposited to bank.`,
    amount: actual,
    investigationReduced: Math.round(investigationReduction * 10) / 10,
  };
}

function processFrontBusinessIncome(state) {
  if (!state.frontBusinesses || state.frontBusinesses.length === 0) return 0;
  let totalIncome = 0;
  let totalHeatReduction = 0;

  for (const owned of state.frontBusinesses) {
    const biz = FRONT_BUSINESSES.find(b => b.id === owned.id);
    if (biz) {
      totalIncome += biz.dailyIncome;
      totalHeatReduction += biz.heatReduction;
      owned.totalIncome += biz.dailyIncome;
    }
  }

  state.cash += totalIncome;
  state.heat = Math.max(0, state.heat - totalHeatReduction);

  return totalIncome;
}

// ============================================================
// DISTRIBUTION / EXPORT SYSTEM
// ============================================================
const DISTRIBUTION_ROLES = [
  { id: 'corner_dealer', name: 'Corner Dealer', emoji: '🧢', cost: 800, dailyPay: 150, sellRate: 8, maxUnits: 30, heatGen: 2, skimChance: 0.05, skimMax: 0.10, desc: 'Moves small volumes on street corners. Cheap but unreliable.' },
  { id: 'runner', name: 'Runner', emoji: '🏃', cost: 1500, dailyPay: 250, sellRate: 15, maxUnits: 60, heatGen: 3, skimChance: 0.03, skimMax: 0.05, desc: 'Fast mover. Delivers to clients across the city.' },
  { id: 'trap_boss', name: 'Trap House Boss', emoji: '🏚️', cost: 5000, dailyPay: 600, sellRate: 25, maxUnits: 100, heatGen: 5, skimChance: 0.08, skimMax: 0.15, desc: 'Runs a trap house. High volume but attracts attention.' },
  { id: 'club_connect', name: 'Club Connect', emoji: '🪩', cost: 8000, dailyPay: 800, sellRate: 12, maxUnits: 50, heatGen: 2, skimChance: 0.02, skimMax: 0.03, desc: 'Works the nightlife scene. Premium markup on party drugs.', partyDrugs: ['ecstasy', 'acid', 'shrooms'] },
  { id: 'wholesaler', name: 'Wholesaler', emoji: '📦', cost: 12000, dailyPay: 1200, sellRate: 40, maxUnits: 200, heatGen: 4, skimChance: 0.04, skimMax: 0.08, desc: 'Bulk distributor. Moves weight to sub-dealers.' },
  { id: 'lieutenant', name: 'Lieutenant', emoji: '⭐', cost: 20000, dailyPay: 2000, sellRate: 0, maxUnits: 0, heatGen: -3, skimChance: 0.01, skimMax: 0.02, desc: 'Manages other dealers. +20% sell rate for all crew at this location.', bonus: { sellRateMult: 1.20 } },
];

const DISTRIBUTION_TIERS = [
  { tier: 1, name: 'Street Operation', emoji: '🚬', upgradeCost: 0, maxDealers: 2, maxStockPerDrug: 50, demandMult: 1.0, bustChance: 0.08, rivalAttackChance: 0.05 },
  { tier: 2, name: 'Organized Network', emoji: '🕸️', upgradeCost: 25000, maxDealers: 4, maxStockPerDrug: 150, demandMult: 1.25, bustChance: 0.05, rivalAttackChance: 0.08 },
  { tier: 3, name: 'Empire', emoji: '👑', upgradeCost: 100000, maxDealers: 6, maxStockPerDrug: 300, demandMult: 1.5, bustChance: 0.03, rivalAttackChance: 0.12 },
];

const DISTRIBUTOR_NAMES = [
  'Rico Vega', 'Slim Pete', 'Johnny Two-Tone', 'Diamond Dave', 'Mama Rosa',
  'Lil Marco', 'The Ghost', 'Big Tony', 'Razor Ray', 'Angel Dust',
  'Quicksilver', 'Bones', 'Lucky Luciano Jr', 'Spider', 'Neon Nick',
  'Sugar', 'Haze', 'Doc', 'Trigger', 'Frost',
];

function setupDistribution(state, locationId) {
  if (!isTerritory(state, locationId)) return { success: false, msg: 'You must control this territory first.' };
  if (state.distribution[locationId]) return { success: false, msg: 'Distribution already set up here.' };
  state.distribution[locationId] = {
    tier: 1, dealers: [], stock: {},
    revenue: { total: 0, today: 0 },
    stats: { unitsSold: 0, busts: 0, thefts: 0, skimmed: 0 },
    dayEstablished: state.day, active: true,
  };
  const loc = LOCATIONS.find(l => l.id === locationId);
  return { success: true, msg: `Distribution network established in ${loc ? loc.name : locationId}!` };
}

function upgradeDistribution(state, locationId) {
  const dist = state.distribution[locationId];
  if (!dist) return { success: false, msg: 'No distribution here.' };
  if (dist.tier >= 3) return { success: false, msg: 'Already at maximum tier.' };
  const nextTier = DISTRIBUTION_TIERS[(dist.tier + 1) - 1]; // dist.tier is 1-based; next tier's 0-based index
  if (!nextTier) return { success: false, msg: 'Cannot upgrade further.' };
  if (state.cash < nextTier.upgradeCost) return { success: false, msg: `Need $${nextTier.upgradeCost.toLocaleString()} to upgrade.` };
  state.cash -= nextTier.upgradeCost;
  dist.tier += 1;
  const tierData = DISTRIBUTION_TIERS[dist.tier - 1];
  return { success: true, msg: `Upgraded to ${tierData.emoji} ${tierData.name}!` };
}

function hireDistributor(state, locationId, roleId) {
  const dist = state.distribution[locationId];
  if (!dist) return { success: false, msg: 'No distribution here.' };
  const tierData = DISTRIBUTION_TIERS[dist.tier - 1];
  if (dist.dealers.length >= tierData.maxDealers) return { success: false, msg: `Max ${tierData.maxDealers} dealers at tier ${dist.tier}.` };
  const role = DISTRIBUTION_ROLES.find(r => r.id === roleId);
  if (!role) return { success: false, msg: 'Unknown role.' };
  if (state.cash < role.cost) return { success: false, msg: `Need $${role.cost.toLocaleString()} to hire.` };
  state.cash -= role.cost;
  const usedNames = dist.dealers.map(d => d.name);
  const available = DISTRIBUTOR_NAMES.filter(n => !usedNames.includes(n));
  const name = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : `Dealer #${dist.dealers.length + 1}`;
  dist.dealers.push({ roleId, name, loyalty: 100, daysActive: 0 });
  return { success: true, msg: `Hired ${role.emoji} ${name} as ${role.name}.` };
}

function fireDistributor(state, locationId, dealerIndex) {
  const dist = state.distribution[locationId];
  if (!dist || !dist.dealers[dealerIndex]) return { success: false, msg: 'Invalid dealer.' };
  const dealer = dist.dealers[dealerIndex];
  const role = DISTRIBUTION_ROLES.find(r => r.id === dealer.roleId);
  dist.dealers.splice(dealerIndex, 1);
  // 20% chance fired dealer snitches
  if (Math.random() < 0.20) {
    updateInvestigation(state, 'crew_snitch', 15);
    return { success: true, msg: `Fired ${dealer.name}. They snitched to the DEA! (+15 investigation)`, snitched: true };
  }
  return { success: true, msg: `Fired ${dealer.name}.` };
}

function exportDrugs(state, locationId, drugId, amount) {
  const dist = state.distribution[locationId];
  if (!dist) return { success: false, msg: 'No distribution here.' };
  const tierData = DISTRIBUTION_TIERS[dist.tier - 1];
  const currentStock = dist.stock[drugId] || 0;
  if (currentStock + amount > tierData.maxStockPerDrug) return { success: false, msg: `Max stock: ${tierData.maxStockPerDrug}. Current: ${currentStock}.` };
  // Check source: inventory
  if (!state.inventory[drugId] || state.inventory[drugId] < amount) return { success: false, msg: 'Not enough in inventory.' };
  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] === 0) delete state.inventory[drugId];
  dist.stock[drugId] = currentStock + amount;
  const drug = DRUGS.find(d => d.id === drugId);
  return { success: true, msg: `Exported ${amount} ${drug ? drug.name : drugId} to distribution.` };
}

function recallDrugs(state, locationId, drugId, amount) {
  const dist = state.distribution[locationId];
  if (!dist) return { success: false, msg: 'No distribution here.' };
  const currentStock = dist.stock[drugId] || 0;
  if (currentStock < amount) return { success: false, msg: 'Not enough in stock.' };
  if (amount > getFreeSpace(state)) return { success: false, msg: 'Not enough inventory space.' };
  dist.stock[drugId] -= amount;
  if (dist.stock[drugId] <= 0) delete dist.stock[drugId];
  state.inventory[drugId] = (state.inventory[drugId] || 0) + amount;
  return { success: true, msg: `Recalled ${amount} units.` };
}

function shutdownDistribution(state, locationId) {
  const dist = state.distribution[locationId];
  if (!dist) return { success: false, msg: 'No distribution here.' };
  dist.active = !dist.active;
  return { success: true, msg: dist.active ? 'Distribution resumed.' : 'Distribution paused.' };
}

function processDistributionDaily(state) {
  const result = { revenue: 0, messages: [] };
  if (!state.distribution) return result;

  const hasLawyer = state.henchmen.some(h => h.type === 'lawyer' && !h.injured);

  for (const [locId, dist] of Object.entries(state.distribution)) {
    if (!dist.active || dist.dealers.length === 0) continue;

    const location = LOCATIONS.find(l => l.id === locId);
    if (!location) continue;
    const tierData = DISTRIBUTION_TIERS[dist.tier - 1];
    const hasLieutenant = dist.dealers.some(d => d.roleId === 'lieutenant');
    const ltBonus = hasLieutenant ? 1.20 : 1.0;

    let locationRevenue = 0;
    let totalHeat = 0;
    let totalUnitsSold = 0;

    // Process each dealer
    for (const dealer of dist.dealers) {
      const role = DISTRIBUTION_ROLES.find(r => r.id === dealer.roleId);
      if (!role || role.sellRate === 0) {
        totalHeat += role ? role.heatGen : 0;
        dealer.daysActive++;
        continue;
      }

      // Calculate units to sell
      const demandFactor = location.priceModifier * 0.8;
      let unitsSell = Math.floor(role.sellRate * tierData.demandMult * ltBonus * demandFactor * (0.7 + Math.random() * 0.6));

      // Find available stock and sell
      let dealerRevenue = 0;
      let dealerUnitsSold = 0;
      for (const drugId in dist.stock) {
        if (dist.stock[drugId] <= 0 || dealerUnitsSold >= unitsSell) continue;
        const drug = DRUGS.find(d => d.id === drugId);
        if (!drug) continue;
        const canSell = Math.min(dist.stock[drugId], unitsSell - dealerUnitsSold);
        // Revenue: midpoint price × location modifier × retail markup
        let pricePerUnit = ((drug.minPrice + drug.maxPrice) / 2) * location.priceModifier * 1.3;
        // Club connect bonus for party drugs
        if (role.partyDrugs && role.partyDrugs.includes(drugId)) pricePerUnit *= 1.5;
        // Territory sell bonus
        if (isTerritory(state, locId)) pricePerUnit *= (1 + TERRITORY_BENEFITS.sellBonus);

        const rev = Math.round(canSell * pricePerUnit);
        dist.stock[drugId] -= canSell;
        if (dist.stock[drugId] <= 0) delete dist.stock[drugId];
        dealerRevenue += rev;
        dealerUnitsSold += canSell;
      }

      // Skimming check
      let skimmed = 0;
      const loyaltySkimBoost = (100 - dealer.loyalty) * 0.002;
      if (dealerRevenue > 0 && Math.random() < (role.skimChance + loyaltySkimBoost)) {
        skimmed = Math.round(dealerRevenue * role.skimMax * Math.random());
        dealerRevenue -= skimmed;
        dist.stats.skimmed += skimmed;
      }

      locationRevenue += dealerRevenue;
      totalUnitsSold += dealerUnitsSold;
      totalHeat += role.heatGen;
      dealer.daysActive++;

      // Loyalty: +1 if selling, -1 if no stock
      if (dealerUnitsSold > 0) {
        dealer.loyalty = Math.min(100, dealer.loyalty + 1);
      } else {
        dealer.loyalty = Math.max(0, dealer.loyalty - 1);
      }

      // Pay dealer
      if (state.cash >= role.dailyPay) {
        state.cash -= role.dailyPay;
      } else {
        dealer.loyalty = Math.max(0, dealer.loyalty - 10);
      }
    }

    // Bust check
    let bustMult = 1 + (state.investigation ? state.investigation.level * 0.15 : 0);
    if (hasLawyer) bustMult *= 0.6;
    // Perk: untouchable halves bust chance
    if (typeof hasPerk === 'function') {
      if (hasPerk(state, 'untouchable')) bustMult *= 0.5;
      if (hasPerk(state, 'immortal')) bustMult *= 0.8;
    }
    if (Math.random() < tierData.bustChance * bustMult) {
      // Bust! Lose stock and a dealer
      const stockLoss = 0.2 + Math.random() * 0.3;
      let unitsLost = 0;
      for (const drugId in dist.stock) {
        const loss = Math.floor(dist.stock[drugId] * stockLoss);
        dist.stock[drugId] -= loss;
        if (dist.stock[drugId] <= 0) delete dist.stock[drugId];
        unitsLost += loss;
      }
      // Arrest random dealer
      if (dist.dealers.length > 0) {
        const idx = Math.floor(Math.random() * dist.dealers.length);
        const arrested = dist.dealers.splice(idx, 1)[0];
        result.messages.push(`🚨 DEA raided ${location.name}! ${arrested.name} arrested, ${unitsLost} units seized.`);
      } else {
        result.messages.push(`🚨 DEA raided ${location.name}! ${unitsLost} units seized.`);
      }
      updateInvestigation(state, 'distribution_bust', 10);
      dist.stats.busts++;
      locationRevenue = Math.round(locationRevenue * 0.5); // lose half today's revenue
      if (state.stats) state.stats.totalDistributionLost += Math.round(locationRevenue * 0.5);
    }

    // Rival attack check
    if (Math.random() < tierData.rivalAttackChance) {
      const stockLoss = 0.1 + Math.random() * 0.2;
      let unitsLost = 0;
      for (const drugId in dist.stock) {
        const loss = Math.floor(dist.stock[drugId] * stockLoss);
        dist.stock[drugId] -= loss;
        if (dist.stock[drugId] <= 0) delete dist.stock[drugId];
        unitsLost += loss;
      }
      const gang = TERRITORY_GANGS[locId];
      const gangName = gang ? gang.name : 'Rival gang';
      result.messages.push(`⚔️ ${gangName} hit your operation in ${location.name}! Lost ${unitsLost} units.`);
      dist.stats.thefts++;
    }

    // Low loyalty dealer flees with stock
    const fleeing = dist.dealers.filter(d => d.loyalty <= 15);
    for (const deserter of fleeing) {
      result.messages.push(`🏃 ${deserter.name} deserted in ${location.name}!`);
      dist.dealers = dist.dealers.filter(d => d !== deserter);
    }

    // Apply heat
    if (totalHeat > 0) {
      let heatAmount = totalHeat;
      if (hasLawyer) heatAmount = Math.round(heatAmount * 0.6);
      if (state.investigation) updateInvestigation(state, 'distribution', heatAmount);
    }

    // Perk: overlord_income +50% distribution income, untouchable +20%, immortal +15%
    if (typeof hasPerk === 'function') {
      if (hasPerk(state, 'overlord_income')) locationRevenue = Math.round(locationRevenue * 1.50);
      if (hasPerk(state, 'untouchable')) locationRevenue = Math.round(locationRevenue * 1.20);
      if (hasPerk(state, 'immortal')) locationRevenue = Math.round(locationRevenue * 1.15);
    }

    dist.revenue.today = locationRevenue;
    dist.revenue.total += locationRevenue;
    dist.stats.unitsSold += totalUnitsSold;
    state.cash += locationRevenue;
    result.revenue += locationRevenue;
    if (state.stats) state.stats.totalDistributionRevenue += locationRevenue;
  }

  return result;
}

function getActiveDistributionCount(state) {
  if (!state.distribution) return 0;
  return Object.values(state.distribution).filter(d => d.active).length;
}

function getTotalDistributionRevenue(state) {
  if (!state.distribution) return 0;
  let total = 0;
  for (const dist of Object.values(state.distribution)) {
    if (dist.active) total += dist.revenue.today;
  }
  return total;
}

// ============================================================
// TERRITORY SYSTEM
// ============================================================
const TERRITORY_GANGS = {
  // Miami Districts — mapped from MIAMI_FACTIONS gangPresence
  liberty_city: { name: 'Zoe Pound', factionId: 'zoe_pound', strength: 6, soldiers: [10, 20], hp: [300, 450], dmg: [8, 18] },
  overtown: { name: 'Miami Cartel Remnants', factionId: 'cartel_remnants', strength: 3, soldiers: [2, 6], hp: [200, 350], dmg: [10, 20] },
  little_havana: { name: 'Los Cubanos', factionId: 'los_cubanos', strength: 7, soldiers: [8, 15], hp: [350, 500], dmg: [12, 22] },
  downtown: { name: 'The Eastern Bloc', factionId: 'eastern_bloc', strength: 8, soldiers: [5, 10], hp: [400, 600], dmg: [18, 30] },
  south_beach: { name: 'The Eastern Bloc', factionId: 'eastern_bloc', strength: 8, soldiers: [5, 10], hp: [400, 600], dmg: [18, 30] },
  little_haiti: { name: 'Zoe Pound', factionId: 'zoe_pound', strength: 6, soldiers: [10, 20], hp: [300, 450], dmg: [8, 18] },
  hialeah: { name: 'Los Cubanos', factionId: 'los_cubanos', strength: 7, soldiers: [8, 15], hp: [350, 500], dmg: [12, 22] },
  opa_locka: { name: 'The Southern Boys', factionId: 'southern_boys', strength: 5, soldiers: [15, 30], hp: [250, 400], dmg: [8, 16] },
  kendall: { name: 'The Dixie Mafia', factionId: 'dixie_mafia', strength: 6, soldiers: [8, 14], hp: [300, 450], dmg: [14, 24] },
  the_port: { name: 'The Port Authority', factionId: 'port_authority', strength: 4, soldiers: [5, 12], hp: [250, 350], dmg: [8, 14] },
  miami_gardens: { name: 'The Southern Boys', factionId: 'southern_boys', strength: 5, soldiers: [15, 30], hp: [250, 400], dmg: [8, 16] },
  // NG+ districts
  north_liberty: { name: 'Zoe Pound', factionId: 'zoe_pound', strength: 6, soldiers: [10, 20], hp: [300, 450], dmg: [8, 18] },
  model_city: { name: 'Zoe Pound', factionId: 'zoe_pound', strength: 5, soldiers: [8, 16], hp: [250, 400], dmg: [8, 16] },
  east_little_havana: { name: 'Los Cubanos', factionId: 'los_cubanos', strength: 6, soldiers: [6, 12], hp: [300, 450], dmg: [12, 20] },
  brickell_key: { name: 'The Eastern Bloc', factionId: 'eastern_bloc', strength: 7, soldiers: [4, 8], hp: [350, 550], dmg: [16, 28] },
  mid_beach: { name: 'The Eastern Bloc', factionId: 'eastern_bloc', strength: 7, soldiers: [4, 8], hp: [350, 550], dmg: [16, 28] },
  lemon_city: { name: 'Zoe Pound', factionId: 'zoe_pound', strength: 5, soldiers: [8, 15], hp: [250, 400], dmg: [8, 16] },
  homestead: { name: 'The Dixie Mafia', factionId: 'dixie_mafia', strength: 5, soldiers: [6, 12], hp: [280, 420], dmg: [12, 22] },
  carol_city: { name: 'The Southern Boys', factionId: 'southern_boys', strength: 5, soldiers: [12, 25], hp: [250, 380], dmg: [8, 16] },
  norwood: { name: 'The Southern Boys', factionId: 'southern_boys', strength: 4, soldiers: [10, 20], hp: [230, 360], dmg: [8, 14] },
  virginia_key: { name: 'The Port Authority', factionId: 'port_authority', strength: 4, soldiers: [4, 10], hp: [230, 330], dmg: [8, 14] },
};

// Benefits of controlling territory
const TERRITORY_BENEFITS = {
  priceDiscount: 0.15,      // 15% better buy prices
  sellBonus: 0.10,           // 10% better sell prices
  dailyIncome: 500,          // $500/day per territory passive income
  heatReduction: 0.20,       // 20% less heat gain
  dangerReduction: 1,        // -1 danger level
};

// ============================================================
// RANDOM EVENTS
// ============================================================
const PRICE_EVENTS = [
  { msg: '🚨 DEA busts a major {drug} shipment! Street prices skyrocket!', effect: 'spike', multiplier: 1.8, chance: 0.02 },
  { msg: '🤑 Desperate addicts are paying CRAZY prices for {drug}!', effect: 'spike', multiplier: 2.2, chance: 0.01 },
  { msg: '🚢 A massive shipment of cheap {drug} floods the market!', effect: 'crash', multiplier: 0.5, chance: 0.03 },
  { msg: '⚗️ A new lab opens — {drug} supply doubles overnight!', effect: 'crash', multiplier: 0.55, chance: 0.02 },
  { msg: '📰 Media panic about {drug} drives prices through the roof!', effect: 'spike', multiplier: 1.6, chance: 0.03 },
  { msg: '🔬 New purity test makes low-grade {drug} worthless. Top shelf soars!', effect: 'spike', multiplier: 1.5, chance: 0.02 },
  { msg: '🏛️ Government crackdown on {drug}! Dealers flee the city!', effect: 'spike', multiplier: 1.9, chance: 0.015 },
  { msg: '💀 Rival gang dumps cheap {drug} to undercut competition!', effect: 'crash', multiplier: 0.45, chance: 0.02 },
];

// News stories for price events — multiple variants per event type for variety
// Each key matches a PRICE_EVENTS msg prefix pattern
const NEWS_STORIES = {
  'DEA busts': [
    { headline: 'FEDERAL TASK FORCE STRIKES', body: 'In a pre-dawn raid coordinated across three states, DEA agents seized over 500 kilograms of {drug} from a warehouse district operation. Sources say the bust was the result of a six-month undercover investigation. Street-level dealers report immediate supply shortages and skyrocketing prices.', source: 'Miami Herald' },
    { headline: 'COAST GUARD INTERCEPTS SMUGGLING VESSEL', body: 'A joint Coast Guard-DEA operation intercepted a fishing trawler carrying an estimated $50 million in {drug} off the coast of Key West. Three suspects were taken into custody. The seizure has sent shockwaves through local distribution networks.', source: 'Channel 7 News' },
    { headline: 'AIRPORT CUSTOMS MAKES RECORD BUST', body: 'Customs officials at Miami International discovered {drug} concealed in hollowed-out furniture shipped from South America. The bust — the largest this year — has disrupted a major pipeline, causing street prices to surge overnight.', source: 'Associated Press' },
    { headline: 'UNDERCOVER STING NETS MAJOR DISTRIBUTOR', body: 'Federal agents arrested Roberto "El Mago" Vasquez in a downtown hotel after a year-long sting. Vasquez allegedly controlled 40% of the local {drug} supply chain. With his network in shambles, remaining dealers have doubled their asking prices.', source: 'NBC 6 Miami' },
    { headline: 'MULTI-AGENCY CRACKDOWN SWEEPS THE DOCKS', body: 'A coordinated strike by DEA, FBI, and local police cleared out three separate {drug} stash houses near the port district. Seventeen arrests were made and an estimated $30 million in product was seized. The streets are running dry.', source: 'Sun Sentinel' },
  ],
  'Desperate addicts': [
    { headline: 'EMERGENCY ROOMS OVERWHELMED', body: 'Local hospitals report a 300% increase in {drug}-related emergencies this week. A new ultra-potent batch has hit the streets, and users are paying whatever dealers ask. Prices have reached levels not seen since the early 80s.', source: 'Miami Medical Journal' },
    { headline: 'DEMAND OUTSTRIPS SUPPLY ACROSS CITY', body: 'A shortage of {drug} has created a feeding frenzy on the streets. Dealers report lines forming outside known spots, with buyers offering double or triple the usual rate. Police are warning of increased robberies as users get desperate.', source: 'Local 10 News' },
    { headline: 'NEW PARTY DRUG CRAZE DRIVES DEMAND', body: 'A viral trend sweeping nightclub scenes has created explosive demand for {drug}. Club promoters and high-end clients are outbidding street-level buyers, pushing prices to astronomical levels.', source: 'Miami New Times' },
    { headline: 'CELEBRITY SCANDAL SPARKS DEMAND SURGE', body: 'After a famous musician was spotted at a Miami club, {drug} demand exploded across the nightlife scene. Dealers are charging whatever they want, and customers are paying without blinking.', source: 'TMZ Miami' },
    { headline: 'REHAB CLOSURES FUEL STREET DEMAND', body: 'Three major rehabilitation centers closed this month due to budget cuts. Former patients have flooded back to the streets, driving unprecedented demand for {drug} and sending prices through the roof.', source: 'Public Health Report' },
  ],
  'massive shipment': [
    { headline: 'MYSTERY CARGO FLOODS BLACK MARKET', body: 'A container ship that docked at midnight unloaded enough {drug} to supply the entire Southeast for months. Nobody knows who is behind the shipment, but prices have cratered as dealers undercut each other to move product fast.', source: 'Port Authority Leak' },
    { headline: 'CARTEL PRICE WAR ERUPTS', body: 'Two rival cartels are flooding the market with cheap {drug} in a bid for territory. The price war has driven wholesale costs to rock bottom. Smart buyers are stocking up while the war rages.', source: 'DEA Intelligence Brief' },
    { headline: 'SURPLUS DRIVES FIRE SALE', body: 'An unexpected glut of {drug} has hit the streets after a major shipment arrived unchecked. Dealers are practically giving it away to clear inventory before police catch on. Prices are at an all-time low.', source: 'Street Intel Network' },
    { headline: 'COLOMBIAN PIPELINE OPENS FLOODGATES', body: 'A new smuggling route through the Bahamas has tripled the supply of {drug} reaching Miami shores. Distribution networks are overwhelmed with product, crushing street prices.', source: 'Confidential Source' },
    { headline: 'WAREHOUSE RAID BACKFIRES — PRODUCT HITS STREETS', body: 'A botched police raid caused seized {drug} to "disappear" from evidence. The redirected supply hit the streets within hours, tanking prices across the city.', source: 'Internal Affairs Report' },
  ],
  'new lab opens': [
    { headline: 'UNDERGROUND SUPER-LAB DISCOVERED', body: 'Authorities are scrambling after discovering evidence of a massive new {drug} production facility somewhere in the industrial district. Output is estimated at five times the previous local supply. Prices have plummeted.', source: 'Crime Stoppers Tip Line' },
    { headline: 'CHEMISTRY GRAD STUDENTS FLOOD MARKET', body: 'A ring of university chemistry students has been producing lab-grade {drug} in campus basements. Their high-quality, low-cost product has undercut established dealers and driven prices down.', source: 'Campus Security Alert' },
    { headline: 'ABANDONED FACTORY CONVERTED TO DRUG LAB', body: 'What appeared to be a derelict canning factory turned out to be a state-of-the-art {drug} manufacturing facility. With production at full capacity, the local market is oversaturated.', source: 'Anonymous Tip' },
    { headline: 'NEW SYNTHESIS METHOD SLASHES COSTS', body: 'Word on the street is that a new production technique has dramatically reduced the cost of making {drug}. Multiple small-time cooks are now churning out product, flooding the market.', source: 'Narcotics Intelligence' },
    { headline: 'CROSS-BORDER LAB NETWORK EXPOSED', body: 'A network of mobile {drug} labs operating in modified RVs has been producing massive quantities. Despite police efforts, new labs pop up as fast as old ones are shut down. Prices continue to fall.', source: 'Border Patrol Report' },
  ],
  'Media panic': [
    { headline: 'TV SPECIAL IGNITES PUBLIC FRENZY', body: 'A primetime news special on the {drug} epidemic has caused mass panic. Parents are raiding their kids\' rooms, politicians are demanding action, and ironically the publicity has driven street prices sky-high as dealers capitalize on the attention.', source: 'Ratings Report' },
    { headline: 'NEWSPAPER EXPOSÉ BACKFIRES', body: 'The Herald\'s week-long series on {drug} abuse was meant to reduce demand. Instead, it advertised where to buy and drove curious newcomers to dealers. Prices have surged with the new customers.', source: 'Media Analysis' },
    { headline: 'SOCIAL MEDIA TREND GOES VIRAL', body: 'A trending hashtag about {drug} has gone viral, creating a wave of fear-driven buying. Users are stockpiling, dealers are raising prices, and the whole market has gone haywire.', source: 'Viral Report' },
    { headline: 'DOCUMENTARY SPARKS DEMAND SPIKE', body: 'A controversial Netflix documentary glamorizing the {drug} trade has sparked renewed interest. Dealers report a flood of new customers willing to pay premium prices.', source: 'Entertainment Weekly' },
    { headline: 'HEALTH SCARE DRIVES PANIC BUYING', body: 'Rumors of a contaminated {drug} batch have caused users to scramble for verified clean supply. Trusted dealers are charging double as paranoid buyers pay any price for guaranteed quality.', source: 'Public Health Alert' },
  ],
  'purity test': [
    { headline: 'NEW STREET TESTING KITS SHAKE UP MARKET', body: 'Cheap purity testing kits are now available on every corner. Buyers can instantly tell if {drug} is cut with garbage. High-grade product commands a massive premium while low-quality stock is worthless.', source: 'Harm Reduction Network' },
    { headline: 'DEALER REPUTATION WARS', body: 'With new testing methods spreading, only dealers with verified pure {drug} can charge top dollar. The quality premium has never been higher. Cheap cut product sits unsold.', source: 'Street Market Analysis' },
    { headline: 'LAB-TESTED CERTIFICATIONS GO MAINSTREAM', body: 'Underground "certification" services are testing and grading {drug} quality. Certified pure product sells for 3x the standard rate. The market has never been more stratified.', source: 'Vice Investigations' },
  ],
  'Government crackdown': [
    { headline: 'GOVERNOR DECLARES WAR ON DRUGS', body: 'In a televised address, the Governor announced a zero-tolerance policy on {drug} distribution. Hundreds of additional officers are being deployed. Dealers have gone underground, and the few still operating are charging astronomical prices.', source: 'State Capitol Bureau' },
    { headline: 'NEW MANDATORY MINIMUMS SIGNED INTO LAW', body: 'Tough new sentencing laws for {drug} possession have terrified mid-level dealers into quitting. Supply has collapsed as the risk-reward calculation shifts. Only the boldest — or most desperate — are still in the game.', source: 'Legal Affairs Desk' },
    { headline: 'CITY COUNCIL EMERGENCY SESSION', body: 'An emergency city council session has allocated $20 million to {drug} interdiction. New checkpoints, surveillance cameras, and undercover units are flooding the streets. Supply is drying up fast.', source: 'City Hall Reporter' },
    { headline: 'FEDERAL MARSHALS DEPLOYED', body: 'US Marshals have been called in to assist local enforcement against {drug} trafficking. Major highways are being monitored and safe houses raided. The supply chain is in chaos.', source: 'Federal Court Filing' },
  ],
  'Rival gang dumps': [
    { headline: 'TURF WAR TURNS ECONOMIC', body: 'The Eastside Crew is deliberately flooding {drug} at below cost to bankrupt rival dealers. It\'s a scorched-earth strategy — destroy the competition\'s revenue, then raise prices later. For now, buyers are getting incredible deals.', source: 'Gang Intelligence Unit' },
    { headline: 'STOLEN SHIPMENT HITS THE STREETS', body: 'A major {drug} shipment was hijacked during transport. The thieves are dumping it fast at rock-bottom prices to avoid being caught with the hot product. Legitimate dealers can\'t compete.', source: 'Underworld Sources' },
    { headline: 'POWER PLAY CRASHES MARKET', body: 'A new player in town is undercutting every established {drug} dealer by 60%. Industry veterans suspect it\'s a calculated move to seize market share. Prices haven\'t been this low in years.', source: 'Street Level Intel' },
    { headline: 'REVENGE DUMP TANKS LOCAL PRICES', body: 'After a bitter dispute, a disgruntled former lieutenant is selling his old boss\'s {drug} stash at giveaway prices. The flood of cheap product has crashed the entire local market.', source: 'Informant Network' },
    { headline: 'GANG BREAKUP SPARKS FIRE SALE', body: 'A fractured gang is selling off their entire {drug} stockpile as members scatter. Multiple factions are undercutting each other in a race to liquidate before police close in.', source: 'Organized Crime Task Force' },
  ],
};

// Get a random news story for a price event message
function getNewsStory(eventMsg, drugName) {
  for (const key of Object.keys(NEWS_STORIES)) {
    if (eventMsg.includes(key)) {
      const stories = NEWS_STORIES[key];
      const story = stories[Math.floor(Math.random() * stories.length)];
      return {
        headline: story.headline,
        body: story.body.replace(/\{drug\}/g, drugName),
        source: story.source,
      };
    }
  }
  return null;
}

const TRAVEL_EVENTS = [
  { id: 'mugging', msg: '🔪 You get jumped in an alley! They took ${amount}!', chance: 0.08, type: 'loss' },
  { id: 'find_drugs', msg: '🎁 You find a stash of {drug} hidden in a dumpster! +{amount} units!', chance: 0.06, type: 'gain' },
  { id: 'find_cash', msg: '💰 You find a briefcase with ${amount} cash!', chance: 0.04, type: 'gain' },
  { id: 'police_encounter', msg: '🚔 Officer Hardass and {count} deputies have you surrounded!', chance: 0.10, type: 'combat' },
  { id: 'gang_encounter', msg: '🔫 A local gang demands a cut of your business!', chance: 0.07, type: 'combat' },
  { id: 'informant', msg: '🕵️ An informant offers to tip you off about upcoming busts for ${amount}.', chance: 0.05, type: 'offer' },
  { id: 'weapon_offer', msg: '🔫 A shady dealer offers you a {weapon} for ${price}.', chance: 0.06, type: 'offer' },
  { id: 'coat_offer', msg: '👜 A street vendor sells you a larger stash bag! +{amount} inventory slots for ${price}.', chance: 0.05, type: 'offer' },
  { id: 'customs', msg: '🛃 Customs checkpoint! They\'re searching everyone!', chance: 0.08, type: 'risk' },
  { id: 'tip_off', msg: '📞 You get a tip: {drug} prices are about to explode in {location}!', chance: 0.04, type: 'info' },
  { id: 'stowaway', msg: '🐀 Rats got into your stash! You lost {amount} units of {drug}!', chance: 0.04, type: 'loss' },
  { id: 'bribe_opportunity', msg: '👮 A corrupt official offers safe passage for ${amount}.', chance: 0.06, type: 'offer' },
  { id: 'reputation_event', msg: '📰 Your reputation precedes you. Local dealers give you better prices.', chance: 0.03, type: 'buff' },
  { id: 'hurricane', msg: '🌀 A hurricane disrupts shipping routes! All transport costs doubled!', chance: 0.02, type: 'global' },
  { id: 'war_zone', msg: '💣 Civil unrest breaks out! Travel to this region is dangerous!', chance: 0.02, type: 'global' },
];

// ============================================================
// NEW GAME+ SYSTEM - Full tier-based progression (Tiers 1-5)
// ============================================================

// --- NG+ Tier Definitions ---
const NG_PLUS_TIERS = {
  1: {
    name: 'New Game+',
    subtitle: 'The Second Time Around',
    enemyStrengthMod: 1.20,      // +20% enemy strength
    priceVolatility: 1.10,        // +10% price volatility
    xpMultiplier: 1.5,            // 1.5x XP
    cashCarryOver: 0.50,          // keep 50% cash
    crewCarryOver: 0,             // no crew carried
    propertyCarryOver: 0,         // no properties carried
    keepFactionStandings: false,
    heatDecayMod: 1.0,            // normal heat decay
    loanSharkInterest: 1.0,       // normal interest
    enemyDamageMultiplier: 1.20,
    unlocks: {
      characters: true,           // 4 NG+ exclusive characters
      endings: true,              // 8 new endings
      description: 'Unlocked: 4 NG+ exclusive characters, 8 new endings',
    },
    introNarrative: [
      'You\'ve done this before. The streets, the deals, the danger.',
      'But this time, they know your name. Enemies are stronger. Stakes are higher.',
      'Your reputation precedes you. Some fear you. Others want to prove themselves.',
      '+20% enemy strength | +10% price volatility | 1.5x XP | 50% cash carried over',
    ],
  },
  2: {
    name: 'New Game++',
    subtitle: 'Veteran of the Trade',
    enemyStrengthMod: 1.40,      // +40% enemy strength
    priceVolatility: 1.15,        // +15% price volatility
    xpMultiplier: 2.0,            // 2x XP
    cashCarryOver: 0.75,          // keep 75% cash
    crewCarryOver: 1,             // keep 1 crew member
    propertyCarryOver: 0,
    keepFactionStandings: false,
    heatDecayMod: 0.75,           // heat decays 25% slower
    loanSharkInterest: 1.15,      // 15% more interest
    enemyDamageMultiplier: 1.40,
    unlocks: {
      fentanyl: true,             // Fentanyl drug unlocked from Tier 2+
      fisherIsland: true,         // Fisher Island accessible earlier
      description: 'Unlocked: Fentanyl available from start, Fisher Island district (luxury market)',
    },
    introNarrative: [
      'Twice you\'ve conquered these streets. The game hasn\'t forgotten.',
      'A new synthetic is flooding the market: Fentanyl. The margins are insane. The danger, worse.',
      'Fisher Island\'s elite are looking for a new supplier. Premium prices, premium risk.',
      '+40% enemy strength | Heat decays 25% slower | 2x XP | 75% cash + 1 crew member',
    ],
  },
  3: {
    name: 'New Game+++',
    subtitle: 'The Kingpin Returns',
    enemyStrengthMod: 1.60,      // +60% enemy strength
    priceVolatility: 1.20,        // +20% price volatility
    xpMultiplier: 3.0,            // 3x XP
    cashCarryOver: 1.0,           // keep ALL cash
    crewCarryOver: 3,             // keep 3 crew members
    propertyCarryOver: 1,         // keep 1 property
    keepFactionStandings: false,
    heatDecayMod: 0.60,           // heat decays 40% slower
    loanSharkInterest: 1.30,      // 30% more interest
    enemyDamageMultiplier: 1.60,
    unlocks: {
      kingpinMode: true,          // Can own multiple districts simultaneously
      newDrugTypes: true,         // Expanded drug synthesis
      description: 'Unlocked: Kingpin Mode - own multiple districts simultaneously, expanded drug synthesis',
    },
    introNarrative: [
      'Three times. You\'ve built and torn down empires three times.',
      'This time, the districts tremble. Kingpin Mode is active.',
      'You can hold multiple districts at once. Total domination is within reach.',
      '+60% enemy strength | Heat decays 40% slower | 3x XP | All cash + 3 crew + 1 property',
    ],
  },
  4: {
    name: 'New Game++++',
    subtitle: 'Legend of the Streets',
    enemyStrengthMod: 1.80,      // +80% enemy strength
    priceVolatility: 1.30,        // +30% price volatility
    xpMultiplier: 4.0,            // 4x XP
    cashCarryOver: 1.0,           // keep ALL cash
    crewCarryOver: 99,            // keep ALL crew
    propertyCarryOver: 99,        // keep ALL properties
    keepFactionStandings: true,   // keep faction standings
    heatDecayMod: 0.50,           // heat decays 50% slower
    loanSharkInterest: 1.50,
    enemyDamageMultiplier: 1.80,
    unlocks: {
      internationalDay1: true,    // International expansion from day 1
      rivalStalker: true,         // Permanent rival dealer stalks you
      description: 'Unlocked: International expansion from day 1, permanent rival dealer hunts you',
    },
    introNarrative: [
      'Four empires. Four lifetimes of blood, money, and power.',
      'The international cartels have taken notice. All routes are open from day one.',
      'But so has someone else. A rival from your past. They\'re coming for you.',
      '+80% enemy strength | Rival stalker | 4x XP | Keep everything + faction standings',
    ],
  },
  5: {
    name: 'New Game+++++',
    subtitle: 'Legendary',
    enemyStrengthMod: 2.00,      // +100% (double) enemy strength
    priceVolatility: 1.50,        // +50% price volatility
    xpMultiplier: 5.0,            // 5x XP
    cashCarryOver: 1.0,           // keep ALL
    crewCarryOver: 99,
    propertyCarryOver: 99,
    keepFactionStandings: true,
    heatDecayMod: 0.40,           // heat decays 60% slower
    loanSharkInterest: 2.0,       // double interest
    enemyDamageMultiplier: 2.00,
    unlocks: {
      godModeStart: true,         // Begin with $100K, full crew, skills at 3
      secretEnding: true,         // Secret "Legendary" ending available
      legendaryTitle: true,       // "Legendary" title
      description: 'Unlocked: God Mode start ($100K, full crew, all skills Lv3), secret Legendary ending',
    },
    introNarrative: [
      'Five. Five times you\'ve risen to the top of the criminal world.',
      'They call you Legendary now. Not a nickname. A title. A warning.',
      'Every enemy is twice as dangerous. Every cop is twice as determined.',
      'But you start as a god. $100K. Full crew. All skills at level 3.',
      'One ending remains hidden. The Legendary ending. Can you find it?',
      '+100% enemy strength | Legendary difficulty | 5x XP | God Mode start + secret ending',
    ],
  },
};

// --- NG+ Exclusive Random Events ---
const NG_PLUS_EVENTS = [
  // Tier 1+ events
  { id: 'ngp_old_enemy', tierMin: 1, chance: 0.04, type: 'combat',
    msg: '💀 An old enemy from your previous life has tracked you down! They brought friends.',
    enemyCount: 4, enemyDamage: 30, enemyHealth: 200, reward: 5000 },
  { id: 'ngp_dea_taskforce', tierMin: 1, chance: 0.03, type: 'combat',
    msg: '🚨 DEA Task Force! They\'ve been building a case on you from your last run!',
    enemyCount: 6, enemyDamage: 25, enemyHealth: 250, heatGain: 20 },
  { id: 'ngp_reputation_precedes', tierMin: 1, chance: 0.05, type: 'buff',
    msg: '📰 "You\'re THE one, aren\'t you?" Your reputation from past lives grants you street respect.',
    effect: { repGain: 15, fearGain: 10 } },
  { id: 'ngp_ghost_of_past', tierMin: 1, chance: 0.03, type: 'offer',
    msg: '👤 A stranger approaches. "I worked for you... before. I have information." $2,000 for intel.',
    price: 2000, reward: 'tip' },
  // Tier 2+ events
  { id: 'ngp_fentanyl_crisis', tierMin: 2, chance: 0.03, type: 'global',
    msg: '☠️ Fentanyl crisis hits the city! Law enforcement cracking down hard. All heat +15.',
    effect: { heatGain: 15, fentanylPriceSpike: true } },
  { id: 'ngp_luxury_buyer', tierMin: 2, chance: 0.04, type: 'offer',
    msg: '💎 A Fisher Island billionaire wants a private deal. Premium prices for premium product.',
    effect: { saleBonusMult: 2.0, drugId: 'cocaine' } },
  // Tier 3+ events
  { id: 'ngp_cartel_war', tierMin: 3, chance: 0.03, type: 'global',
    msg: '⚔️ Cartel turf war erupts! Multiple factions fighting. Opportunity in the chaos.',
    effect: { allPricesVolatile: true, territoryVulnerable: true } },
  { id: 'ngp_kingpin_challenge', tierMin: 3, chance: 0.02, type: 'combat',
    msg: '👑 A rival kingpin challenges your dominance! Winner takes all.',
    enemyCount: 8, enemyDamage: 40, enemyHealth: 400, reward: 25000, territoryReward: true },
  { id: 'ngp_multi_district', tierMin: 3, chance: 0.04, type: 'buff',
    msg: '🏴 Your multi-district empire generates a synergy bonus. +$10,000 territory income.',
    effect: { cashGain: 10000 } },
  // Tier 4+ events
  { id: 'ngp_rival_ambush', tierMin: 4, chance: 0.05, type: 'combat',
    msg: '🎯 Your permanent rival has set a trap! Elite mercenaries surround you!',
    enemyCount: 10, enemyDamage: 45, enemyHealth: 500, reward: 50000 },
  { id: 'ngp_international_crisis', tierMin: 4, chance: 0.03, type: 'global',
    msg: '🌍 International border crackdown! All import/export costs doubled for 10 days.',
    effect: { importCostMult: 2.0, duration: 10 } },
  { id: 'ngp_faction_summit', tierMin: 4, chance: 0.02, type: 'offer',
    msg: '🤝 A secret summit of crime bosses invites you. Attend for $50K to gain massive faction rep.',
    price: 50000, effect: { allFactionRep: 20 } },
  // Tier 5 events
  { id: 'ngp_legendary_bounty', tierMin: 5, chance: 0.04, type: 'combat',
    msg: '⭐ LEGENDARY: Every gang, cartel, and law enforcement agency has put a bounty on your head!',
    enemyCount: 15, enemyDamage: 50, enemyHealth: 800, reward: 100000, heatGain: 30 },
  { id: 'ngp_legendary_opportunity', tierMin: 5, chance: 0.02, type: 'offer',
    msg: '⭐ LEGENDARY: A once-in-a-lifetime deal. An entire shipment of product, abandoned. Risk everything?',
    effect: { massInventoryGain: true, heatGain: 40 } },
  { id: 'ngp_legendary_respect', tierMin: 5, chance: 0.03, type: 'buff',
    msg: '⭐ LEGENDARY: Even your enemies bow. Your legend status reduces all purchase prices by 20% today.',
    effect: { purchaseDiscount: 0.80, duration: 1 } },
];

// --- NG+ Rival Dealer (Tier 4+) ---
const NG_PLUS_RIVAL = {
  name: 'The Shadow',
  emoji: '🎭',
  desc: 'A figure from your past. They know your methods, your routes, your weaknesses.',
  basePower: 150,
  powerPerDay: 2,
  maxPower: 500,
  ambushChance: 0.06,  // 6% daily chance of ambush
  sabotagePriceChance: 0.04,  // 4% chance to sabotage your prices
  stealTerritoryChance: 0.02, // 2% chance to steal a territory
  events: [
    { id: 'rival_ambush', msg: '🎭 The Shadow strikes! Your rival dealer ambushes your supply run!', type: 'combat' },
    { id: 'rival_undercut', msg: '🎭 The Shadow is undercutting your prices in {location}! Revenue down 30%.', type: 'economic' },
    { id: 'rival_snitch', msg: '🎭 The Shadow tipped off the cops about your operations! Heat +25.', type: 'heat' },
    { id: 'rival_recruit', msg: '🎭 The Shadow is trying to poach your crew! {crewName} is being tempted.', type: 'crew' },
    { id: 'rival_territory', msg: '🎭 The Shadow has seized control of {territory}!', type: 'territory' },
  ],
};

// --- Core NG+ Helper ---
function getNgPlusMod(state, key, defaultVal) {
  if (!state.newGamePlus || !state.ngPlusModifiers) return defaultVal !== undefined ? defaultVal : 1;
  return state.ngPlusModifiers[key] || (defaultVal !== undefined ? defaultVal : 1);
}

// --- Get current NG+ tier data ---
function getNgPlusTier(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return null;
  const tier = state.newGamePlus.tier || 1;
  return NG_PLUS_TIERS[Math.min(tier, 5)] || NG_PLUS_TIERS[1];
}

// --- Check if an NG+ feature is unlocked for the current state ---
function isNGPlusFeatureUnlocked(state, featureId) {
  if (!state.newGamePlus || !state.newGamePlus.active) return false;
  const tier = state.newGamePlus.tier || 1;
  // Check all tiers up to current
  for (let t = 1; t <= Math.min(tier, 5); t++) {
    const tierData = NG_PLUS_TIERS[t];
    if (tierData && tierData.unlocks && tierData.unlocks[featureId]) return true;
  }
  // Also check the persistent unlocks tracker
  if (state.newGamePlus.unlocks && state.newGamePlus.unlocks[featureId]) return true;
  return false;
}

// --- Get all NG+ exclusive content available for current tier ---
function getNGPlusExclusiveContent(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return { available: false };
  const tier = state.newGamePlus.tier || 1;
  const content = {
    available: true,
    tier: tier,
    tierName: NG_PLUS_TIERS[Math.min(tier, 5)].name,
    tierSubtitle: NG_PLUS_TIERS[Math.min(tier, 5)].subtitle,
    features: [],
    unlockedDrugs: [],
    unlockedLocations: [],
    unlockedModes: [],
    activeModifiers: [],
  };

  // Accumulate all unlocks up to current tier
  for (let t = 1; t <= Math.min(tier, 5); t++) {
    const td = NG_PLUS_TIERS[t];
    content.features.push({ tier: t, description: td.unlocks.description });

    if (t === 1) {
      content.features.push({ tier: t, detail: '4 NG+ exclusive characters (Undercover, Cartel Exile, Hacker, Legacy)' });
      content.features.push({ tier: t, detail: '8 NG+ exclusive endings' });
    }
    if (t >= 2 && td.unlocks.fentanyl) {
      content.unlockedDrugs.push({ id: 'fentanyl', name: 'Fentanyl', tier: t });
    }
    if (t >= 2 && td.unlocks.fisherIsland) {
      content.unlockedLocations.push({ id: 'fisher_island', name: 'Fisher Island', tier: t });
    }
    if (t >= 3 && td.unlocks.kingpinMode) {
      content.unlockedModes.push({ id: 'kingpin_mode', name: 'Kingpin Mode', desc: 'Own multiple districts simultaneously', tier: t });
    }
    if (t >= 4 && td.unlocks.internationalDay1) {
      content.unlockedModes.push({ id: 'international_day1', name: 'International Expansion', desc: 'All international routes open from day 1', tier: t });
    }
    if (t >= 4 && td.unlocks.rivalStalker) {
      content.unlockedModes.push({ id: 'rival_stalker', name: 'The Shadow', desc: 'A permanent rival dealer stalks you', tier: t });
    }
    if (t >= 5 && td.unlocks.godModeStart) {
      content.unlockedModes.push({ id: 'god_mode', name: 'God Mode Start', desc: '$100K, full crew, all skills Lv3', tier: t });
    }
    if (t >= 5 && td.unlocks.secretEnding) {
      content.unlockedModes.push({ id: 'secret_ending', name: 'Legendary Ending', desc: 'A hidden ending for Legendary players', tier: t });
    }
  }

  // Active modifiers for UI display
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  content.activeModifiers = [
    { label: 'Enemy Strength', value: `+${Math.round((td.enemyStrengthMod - 1) * 100)}%` },
    { label: 'Price Volatility', value: `+${Math.round((td.priceVolatility - 1) * 100)}%` },
    { label: 'XP Multiplier', value: `${td.xpMultiplier}x` },
    { label: 'Heat Decay', value: td.heatDecayMod < 1 ? `${Math.round((1 - td.heatDecayMod) * 100)}% slower` : 'Normal' },
    { label: 'Loan Interest', value: td.loanSharkInterest > 1 ? `+${Math.round((td.loanSharkInterest - 1) * 100)}%` : 'Normal' },
  ];

  return content;
}

// --- Apply NG+ starting bonuses based on tier ---
function applyNGPlusStartBonus(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return [];
  const tier = state.newGamePlus.tier || 1;
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  const msgs = [];

  // Apply carried-over cash
  if (state.newGamePlus.carriedCash && state.newGamePlus.carriedCash > 0) {
    state.cash += state.newGamePlus.carriedCash;
    msgs.push(`💰 Carried over $${state.newGamePlus.carriedCash.toLocaleString()} from your previous empire.`);
  }

  // Apply carried-over crew
  if (state.newGamePlus.carriedCrew && state.newGamePlus.carriedCrew.length > 0) {
    for (const crew of state.newGamePlus.carriedCrew) {
      state.henchmen.push({ ...crew, loyalty: Math.max(50, (crew.loyalty || 70) - 10) }); // Slight loyalty penalty for new run
    }
    msgs.push(`👥 ${state.newGamePlus.carriedCrew.length} loyal crew member(s) followed you into the new run.`);
  }

  // Apply carried-over properties (Tier 3+)
  if (state.newGamePlus.carriedProperties && state.newGamePlus.carriedProperties.length > 0) {
    for (const prop of state.newGamePlus.carriedProperties) {
      if (!state.properties) state.properties = {};
      if (!state.properties[prop.location]) state.properties[prop.location] = [];
      state.properties[prop.location].push(prop);
    }
    msgs.push(`🏠 ${state.newGamePlus.carriedProperties.length} propert(ies) carried over from your empire.`);
  }

  // Apply carried-over faction standings (Tier 4+)
  if (state.newGamePlus.carriedFactions && td.keepFactionStandings) {
    if (typeof initFactionState === 'function') {
      state.factions = state.newGamePlus.carriedFactions;
      // Decay standings slightly
      if (state.factions.standings) {
        for (const fId of Object.keys(state.factions.standings)) {
          state.factions.standings[fId] = Math.round(state.factions.standings[fId] * 0.8);
        }
      }
      msgs.push(`🤝 Faction relationships partially preserved from your previous empire.`);
    }
  }

  // Tier 4+: International expansion from day 1
  if (isNGPlusFeatureUnlocked(state, 'internationalDay1')) {
    if (state.worldState) {
      state.worldState.unlockedRegions = ['miami', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];
      msgs.push(`🌍 International routes open from day 1. The world is your market.`);
    }
  }

  // Tier 5: God Mode Start
  if (isNGPlusFeatureUnlocked(state, 'godModeStart')) {
    state.cash = Math.max(state.cash, 100000);
    msgs.push(`⭐ GOD MODE: Starting with $100,000.`);

    // Full starting crew
    const godCrew = [
      { name: 'Veteran Enforcer', type: 'enforcer', loyalty: 90, skill: 'high', trait: 'ng_plus_veteran' },
      { name: 'Veteran Chemist', type: 'cooker', loyalty: 85, skill: 'high', trait: 'ng_plus_veteran' },
      { name: 'Veteran Smuggler', type: 'transporter', loyalty: 85, skill: 'high', trait: 'ng_plus_veteran' },
      { name: 'Veteran Spy', type: 'lookout', loyalty: 80, skill: 'high', trait: 'ng_plus_veteran' },
      { name: 'Veteran Accountant', type: 'accountant', loyalty: 80, skill: 'high', trait: 'ng_plus_veteran' },
    ];
    for (const c of godCrew) {
      if (!state.henchmen.some(h => h.name === c.name)) {
        state.henchmen.push(c);
      }
    }
    msgs.push(`⭐ GOD MODE: Full veteran crew assembled.`);

    // All skills at level 3
    const skillIds = ['combat', 'driving', 'persuasion', 'chemistry', 'business', 'stealth', 'leadership', 'streetwise'];
    for (const sk of skillIds) {
      state.skills[sk] = Math.max(state.skills[sk] || 0, 3);
    }
    state.skillPoints = (state.skillPoints || 0) + 10; // Bonus points
    msgs.push(`⭐ GOD MODE: All skills boosted to level 3 + 10 bonus skill points.`);
  }

  // Apply NG+ modifiers to state
  state.ngPlusModifiers = {
    enemyStrengthMod: td.enemyStrengthMod,
    priceVolatility: td.priceVolatility,
    xpMultiplier: td.xpMultiplier,
    heatDecayMod: td.heatDecayMod,
    loanSharkInterest: td.loanSharkInterest,
    enemyDamageMultiplier: td.enemyDamageMultiplier,
  };

  return msgs;
}

// --- Start New Game Plus (transition function) ---
function startNewGamePlus(oldState) {
  if (!oldState) return null;

  // Determine new tier
  const previousTier = (oldState.newGamePlus && oldState.newGamePlus.active) ? (oldState.newGamePlus.tier || 1) : 0;
  const newTier = Math.min(previousTier + 1, 5);
  const tierData = NG_PLUS_TIERS[newTier];

  // Calculate what carries over
  const oldCash = (oldState.cash || 0) + (oldState.bank || 0);
  const carriedCash = Math.floor(oldCash * tierData.cashCarryOver);

  // Carry crew (best N by loyalty)
  let carriedCrew = [];
  if (tierData.crewCarryOver > 0 && oldState.henchmen && oldState.henchmen.length > 0) {
    const sortedCrew = [...oldState.henchmen]
      .filter(h => !h.injured)
      .sort((a, b) => (b.loyalty || 0) - (a.loyalty || 0));
    carriedCrew = sortedCrew.slice(0, Math.min(tierData.crewCarryOver, sortedCrew.length)).map(h => ({
      name: h.name,
      type: h.type,
      loyalty: h.loyalty,
      skill: h.skill || 'mid',
      trait: h.trait || 'veteran',
    }));
  }

  // Carry properties (best N by value)
  let carriedProperties = [];
  if (tierData.propertyCarryOver > 0 && oldState.properties) {
    const allProps = [];
    for (const locId of Object.keys(oldState.properties)) {
      for (const prop of (oldState.properties[locId] || [])) {
        allProps.push({ ...prop, location: locId });
      }
    }
    allProps.sort((a, b) => (b.value || b.price || 0) - (a.value || a.price || 0));
    carriedProperties = allProps.slice(0, Math.min(tierData.propertyCarryOver, allProps.length));
  }

  // Carry faction standings (Tier 4+)
  let carriedFactions = null;
  if (tierData.keepFactionStandings && oldState.factions) {
    carriedFactions = JSON.parse(JSON.stringify(oldState.factions));
    // Reset wars and active conflicts but keep standings
    if (carriedFactions.wars) carriedFactions.wars = {};
    if (carriedFactions.factionEvents) carriedFactions.factionEvents = [];
  }

  // Collect traits/abilities from consequence engine
  let carriedTraits = [];
  if (oldState.consequenceEngine && oldState.consequenceEngine.permanentTraits) {
    carriedTraits = [...oldState.consequenceEngine.permanentTraits];
  }

  // Collect completed endings across all runs
  let completedEndings = [];
  if (oldState.newGamePlus && oldState.newGamePlus.completedEndings) {
    completedEndings = [...oldState.newGamePlus.completedEndings];
  }
  if (oldState.campaign && oldState.campaign.endingId) {
    if (!completedEndings.includes(oldState.campaign.endingId)) {
      completedEndings.push(oldState.campaign.endingId);
    }
  }

  // Track cumulative NG+ unlocks
  const cumulativeUnlocks = {};
  for (let t = 1; t <= newTier; t++) {
    const td = NG_PLUS_TIERS[t];
    if (td && td.unlocks) {
      for (const key of Object.keys(td.unlocks)) {
        if (key !== 'description') cumulativeUnlocks[key] = true;
      }
    }
  }

  // Build NG+ state to attach to the new game state
  const ngPlusState = {
    active: true,
    tier: newTier,
    tierName: tierData.name,
    tierSubtitle: tierData.subtitle,
    totalCompletions: previousTier + 1,
    carriedCash: carriedCash,
    carriedCrew: carriedCrew,
    carriedProperties: carriedProperties,
    carriedFactions: carriedFactions,
    carriedTraits: carriedTraits,
    completedEndings: completedEndings,
    unlocks: cumulativeUnlocks,
    previousRunStats: {
      finalScore: oldState.finalScore || 0,
      rank: oldState.rank || 'Unknown',
      day: oldState.day || 0,
      characterId: oldState.characterId || 'classic',
      endingId: (oldState.campaign && oldState.campaign.endingId) || null,
      netWorth: (oldState.cash || 0) + (oldState.bank || 0) - (oldState.debt || 0),
      peopleKilled: oldState.peopleKilled || 0,
      territoriesControlled: Object.keys(oldState.territory || {}).length,
    },
    rivalDealer: null,  // Will be initialized for Tier 4+
    legendaryTitle: newTier >= 5 ? 'The Legendary' : null,
  };

  // Initialize rival dealer for Tier 4+
  if (newTier >= 4) {
    ngPlusState.rivalDealer = {
      name: NG_PLUS_RIVAL.name,
      emoji: NG_PLUS_RIVAL.emoji,
      power: NG_PLUS_RIVAL.basePower,
      lastSeenDay: 0,
      lastSeenLocation: null,
      defeated: false,
      encounters: 0,
      territoriesStolen: [],
    };
  }

  // Create intro narrative
  const intro = {
    type: 'ng_plus_intro',
    tier: newTier,
    tierName: tierData.name,
    tierSubtitle: tierData.subtitle,
    narrative: tierData.introNarrative,
    carriedOver: {
      cash: carriedCash,
      crew: carriedCrew.length,
      properties: carriedProperties.length,
      factions: tierData.keepFactionStandings,
      traits: carriedTraits.length,
    },
    newUnlocks: tierData.unlocks.description,
  };

  // Persist NG+ data to localStorage for cross-session tracking
  try {
    const ngPlusMeta = JSON.parse(localStorage.getItem('drugwars_ngplus_meta') || '{}');
    ngPlusMeta.highestTier = Math.max(ngPlusMeta.highestTier || 0, newTier);
    ngPlusMeta.totalCompletions = (ngPlusMeta.totalCompletions || 0) + 1;
    ngPlusMeta.completedEndings = completedEndings;
    ngPlusMeta.lastCompletionDate = new Date().toISOString();
    localStorage.setItem('drugwars_ngplus_meta', JSON.stringify(ngPlusMeta));
  } catch (e) { /* localStorage unavailable */ }

  return {
    ngPlusState: ngPlusState,
    intro: intro,
    tierData: tierData,
  };
}

// --- Process NG+ daily effects (call from waitDay) ---
function processNGPlusDaily(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return [];
  const tier = state.newGamePlus.tier || 1;
  const tierData = NG_PLUS_TIERS[Math.min(tier, 5)];
  const msgs = [];

  // Apply heat decay modifier
  // (This is handled in waitDay via heatDecayMod, but we also track here for NG+-specific slow)

  // NG+ exclusive random events
  for (const evt of NG_PLUS_EVENTS) {
    if (tier < evt.tierMin) continue;
    // Scale chance slightly by tier for higher tiers
    const adjustedChance = evt.chance * (1 + (tier - evt.tierMin) * 0.1);
    if (Math.random() >= adjustedChance) continue;

    if (evt.type === 'combat') {
      // Scale enemy stats by tier
      const scaledEnemyHealth = Math.round(evt.enemyHealth * tierData.enemyStrengthMod);
      const scaledEnemyDamage = Math.round(evt.enemyDamage * tierData.enemyDamageMultiplier);
      state.pendingEvent = {
        type: 'combat',
        subtype: 'ng_plus_event',
        eventId: evt.id,
        msg: evt.msg,
        enemyName: evt.msg.split('!')[0].replace(/^[^\s]+\s/, ''),
        enemyHealth: scaledEnemyHealth,
        enemyMaxHealth: scaledEnemyHealth,
        enemyDamage: scaledEnemyDamage,
        enemyCount: evt.enemyCount,
        reward: evt.reward || 0,
        heatGain: evt.heatGain || 0,
        territoryReward: evt.territoryReward || false,
      };
      msgs.push(evt.msg);
      break; // Only one NG+ combat event per day
    }

    if (evt.type === 'buff') {
      if (evt.effect) {
        if (evt.effect.repGain && state.rep) {
          state.rep.streetCred = Math.min(100, (state.rep.streetCred || 0) + evt.effect.repGain);
        }
        if (evt.effect.fearGain && state.rep) {
          state.rep.fear = Math.min(100, (state.rep.fear || 0) + evt.effect.fearGain);
        }
        if (evt.effect.cashGain) {
          state.cash += evt.effect.cashGain;
        }
        if (evt.effect.purchaseDiscount) {
          state.activeBuffs = state.activeBuffs || [];
          state.activeBuffs.push({
            id: 'ngp_price_discount',
            name: 'Legendary Respect',
            multiplier: evt.effect.purchaseDiscount,
            expiresDay: state.day + (evt.effect.duration || 1),
          });
        }
      }
      msgs.push(evt.msg);
    }

    if (evt.type === 'global') {
      if (evt.effect) {
        if (evt.effect.heatGain) {
          state.heat = Math.min(100, (state.heat || 0) + evt.effect.heatGain);
        }
        if (evt.effect.importCostMult) {
          state.activeBuffs = state.activeBuffs || [];
          state.activeBuffs.push({
            id: 'ngp_import_cost',
            name: 'Border Crackdown',
            importCostMult: evt.effect.importCostMult,
            expiresDay: state.day + (evt.effect.duration || 5),
          });
        }
        if (evt.effect.allPricesVolatile) {
          // Double volatility for 5 days
          state.activeBuffs = state.activeBuffs || [];
          state.activeBuffs.push({
            id: 'ngp_cartel_war_volatility',
            name: 'Cartel War',
            priceVolatilityMult: 2.0,
            expiresDay: state.day + 5,
          });
        }
      }
      msgs.push(evt.msg);
    }

    if (evt.type === 'offer') {
      state.pendingEvent = {
        type: 'offer',
        subtype: 'ng_plus_event',
        eventId: evt.id,
        msg: evt.msg,
        offerType: 'ng_plus_special',
        price: evt.price || 0,
        effect: evt.effect || null,
        reward: evt.reward || null,
      };
      msgs.push(evt.msg);
    }

    break; // Only one NG+ event per day
  }

  // Tier 4+: Rival dealer daily processing
  if (tier >= 4 && state.newGamePlus.rivalDealer && !state.newGamePlus.rivalDealer.defeated) {
    const rivalMsgs = processRivalDealerDaily(state);
    msgs.push(...rivalMsgs);
  }

  return msgs;
}

// --- Process Rival Dealer (Tier 4+) ---
function processRivalDealerDaily(state) {
  if (!state.newGamePlus || !state.newGamePlus.rivalDealer) return [];
  const rival = state.newGamePlus.rivalDealer;
  if (rival.defeated) return [];
  const msgs = [];

  // Rival grows stronger each day
  rival.power = Math.min(NG_PLUS_RIVAL.maxPower, rival.power + NG_PLUS_RIVAL.powerPerDay);

  // Random rival events
  const roll = Math.random();

  if (roll < NG_PLUS_RIVAL.ambushChance) {
    // Ambush!
    const scaledHealth = Math.round(rival.power * 2);
    const scaledDamage = Math.round(rival.power * 0.3);
    state.pendingEvent = {
      type: 'combat',
      subtype: 'rival_dealer',
      msg: `${NG_PLUS_RIVAL.emoji} ${NG_PLUS_RIVAL.name} strikes! "${rival.encounters === 0 ? 'We meet at last.' : 'You can\'t escape me forever.'}"`,
      enemyName: NG_PLUS_RIVAL.name,
      enemyHealth: scaledHealth,
      enemyMaxHealth: scaledHealth,
      enemyDamage: scaledDamage,
      enemyCount: 3 + Math.floor(rival.power / 100),
      reward: Math.round(rival.power * 50),
      isRival: true,
    };
    rival.encounters++;
    rival.lastSeenDay = state.day;
    rival.lastSeenLocation = state.currentLocation;
    msgs.push(`${NG_PLUS_RIVAL.emoji} ${NG_PLUS_RIVAL.name} has found you!`);
  } else if (roll < NG_PLUS_RIVAL.ambushChance + NG_PLUS_RIVAL.sabotagePriceChance) {
    // Price sabotage - reduce selling prices in current location
    msgs.push(`${NG_PLUS_RIVAL.emoji} ${NG_PLUS_RIVAL.name} is undercutting your prices! Selling prices reduced by 15% today.`);
    for (const drugId of Object.keys(state.prices || {})) {
      if (state.prices[drugId]) {
        state.prices[drugId] = Math.round(state.prices[drugId] * 0.85);
      }
    }
  } else if (roll < NG_PLUS_RIVAL.ambushChance + NG_PLUS_RIVAL.sabotagePriceChance + NG_PLUS_RIVAL.stealTerritoryChance) {
    // Territory theft
    const territories = Object.keys(state.territory || {});
    if (territories.length > 0) {
      const stolen = territories[Math.floor(Math.random() * territories.length)];
      const stolenName = (LOCATIONS.find(l => l.id === stolen) || { name: stolen }).name;
      delete state.territory[stolen];
      rival.territoriesStolen.push(stolen);
      msgs.push(`${NG_PLUS_RIVAL.emoji} ${NG_PLUS_RIVAL.name} has seized control of ${stolenName}!`);
    }
  }

  // 0.5% daily chance for the rival to send a taunting message
  if (Math.random() < 0.005) {
    const taunts = [
      `${NG_PLUS_RIVAL.emoji} A note arrives: "I know every move before you make it."`,
      `${NG_PLUS_RIVAL.emoji} Your phone buzzes: "Remember who taught you everything?"`,
      `${NG_PLUS_RIVAL.emoji} Word on the street: ${NG_PLUS_RIVAL.name} is telling people you\'re finished.`,
      `${NG_PLUS_RIVAL.emoji} A package arrives. Inside: a mirror and a note. "This is who you used to be."`,
    ];
    msgs.push(taunts[Math.floor(Math.random() * taunts.length)]);
  }

  return msgs;
}

// --- Apply NG+ modifiers to combat (call from resolveCombatRound) ---
function getNGPlusCombatMod(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return { damageMod: 1, healthMod: 1, countMod: 0 };
  const tier = state.newGamePlus.tier || 1;
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  return {
    damageMod: td.enemyDamageMultiplier,
    healthMod: td.enemyStrengthMod,
    countMod: Math.floor(tier / 2), // Extra enemies at higher tiers
  };
}

// --- Get NG+ XP multiplier ---
function getNGPlusXPMultiplier(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return 1;
  const tier = state.newGamePlus.tier || 1;
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  return td.xpMultiplier || 1;
}

// --- Check if a drug should be available based on NG+ status ---
function isDrugAvailableNGPlus(state, drug) {
  if (!drug.ngPlus) return true; // Not NG+ restricted
  if (!state.newGamePlus || !state.newGamePlus.active) return false;
  // Fentanyl requires Tier 2+
  if (drug.id === 'fentanyl') return (state.newGamePlus.tier || 1) >= 2;
  return true; // Other NG+ drugs available at any NG+ tier
}

// --- Get NG+ heat decay modifier ---
function getNGPlusHeatDecayMod(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return 1;
  const tier = state.newGamePlus.tier || 1;
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  return td.heatDecayMod || 1;
}

// --- Can own multiple districts? (Kingpin Mode, Tier 3+) ---
function canOwnMultipleDistricts(state) {
  return isNGPlusFeatureUnlocked(state, 'kingpinMode');
}

// --- Get NG+ intro data for display ---
function getNGPlusIntro(state) {
  if (!state.newGamePlus || !state.newGamePlus.active) return null;
  const tier = state.newGamePlus.tier || 1;
  const td = NG_PLUS_TIERS[Math.min(tier, 5)];
  return {
    tier: tier,
    name: td.name,
    subtitle: td.subtitle,
    narrative: td.introNarrative,
    previousRun: state.newGamePlus.previousRunStats || null,
    carriedOver: {
      cash: state.newGamePlus.carriedCash || 0,
      crew: (state.newGamePlus.carriedCrew || []).length,
      properties: (state.newGamePlus.carriedProperties || []).length,
      factions: td.keepFactionStandings,
      traits: (state.newGamePlus.carriedTraits || []).length,
    },
    newUnlocks: td.unlocks.description,
  };
}

// ============================================================
// GAME STATE
// ============================================================
function createGameState() {
  const state = {
    day: 1,
    cash: GAME_CONFIG.startingCash,
    bank: 0,
    debt: GAME_CONFIG.startingDebt,
    health: GAME_CONFIG.startingHealth,
    maxHealth: GAME_CONFIG.startingHealth,
    heat: GAME_CONFIG.startingHeat,
    reputation: 0, // -100 to 100
    inventorySpace: GAME_CONFIG.startingInventory,
    currentLocation: 'miami',
    previousLocation: null,
    inventory: {}, // { drugId: amount }
    stash: {}, // stored drugs at miami
    knownPrices: {}, // { locationId: { drugId: price, _day: lastVisitDay } } - price memory from visited locations
    locationTrades: {}, // { locationId: tradeCount } - tracks trades per location for market reputation
    weapons: ['fists'],
    equippedWeapon: 'fists',
    henchmen: [],
    prices: {}, // current prices at location
    priceEvents: [], // active price events this turn
    travelEvents: [], // events that happened during travel
    gameOver: false,
    gameWon: false,
    totalProfit: 0,
    drugsBought: 0,
    drugsSold: 0,
    peopleKilled: 0,
    copsKilled: 0,
    citiesVisited: ['miami'],
    territory: {}, // { locationId: { controlled: true, gangDefeated: 'Gang Name', dayTaken: 1 } }
    distribution: {}, // { locationId: { tier, dealers[], stock{}, revenue{}, stats{}, active } }
    frontBusinesses: [], // owned front businesses for laundering
    xp: 0,
    achievements: [],
    achievementStats: {},
    stats: {
      drugLedger: {},       // { drugId: { bought: 0, sold: 0, spent: 0, earned: 0 } }
      netWorthHistory: [],  // [{ day, cash, bank, debt, inventoryValue, netWorth }]
      cashHistory: [],      // [{ day, cash }]
      tradeLog: [],         // [{ day, type, drugId, amount, price, total, location }]
      totalSpentOnDrugs: 0,
      totalEarnedFromDrugs: 0,
      totalSpentOnCrew: 0,
      totalSpentOnWeapons: 0,
      totalSpentOnTransport: 0,
      totalSpentOnHospital: 0,
      totalLaunderedMoney: 0,
      totalBribesPaid: 0,
      totalAssetsForfeit: 0,
      biggestSingleSale: 0,
      biggestSinglePurchase: 0,
      daysInPrison: 0,
      totalDistributionRevenue: 0,
      totalDistributionLost: 0,
    },
    activeBuffs: [],
    transportCostMultiplier: 1,
    pendingEvent: null, // event waiting for player response
    // === DIRTY/CLEAN MONEY SYSTEM ===
    dirtyMoney: 0,           // Cash earned from drugs/crime (NOT yet laundered)
    cleanMoney: GAME_CONFIG.startingCash, // Legitimate or laundered cash
    // state.cash = dirtyMoney + cleanMoney (total). Spending dirty money draws attention.
    // Laundering moves dirty → clean through front businesses.
    // Large dirty cash purchases (property, vehicles) trigger investigation.
    // === LIFE SIMULATION ===
    monthlyExpenses: {
      rent: 100,             // Based on lifestyle tier
      childSupport: 0,       // Set if player has kids from romance
      loanPayment: 0,        // Auto-pay minimum on debt
      insurance: 0,          // Vehicle insurance
      crewPayroll: 0,        // Calculated daily from crew
    },
    relationships: {          // Deep relationship tracking
      partners: [],           // Current romantic partners [{npcId, stage, hasKids, kidsCount, divorced, childSupportMonthly}]
      children: [],           // [{name, age, motherId, birthDay}]
      divorces: 0,
      totalChildSupport: 0,
    },
    scars: [],                // Permanent injuries from combat
    // Skill tree
    skillPoints: 0,
    skills: {}, // { skillId: level }
    speechSkill: 0, // 0-100, affects dialogue checks
    // Dialogue
    activeDialogue: null, // { id, npcName, npcEmoji, lines[], currentLine, choices[] }
    messageLog: [],
    highScores: JSON.parse(localStorage.getItem('drugwars_highscores') || '[]'),
    investigation: {
      points: 0,
      level: 0,
      daysSinceDealing: 0,
      activeEffects: [],
      timesArrested: 0,
      onBail: false,
    },
    courtCase: null,
    // New systems (Phase 1)
    characterId: 'classic',
    characterPassive: null,
    characterFlags: {},
    rep: initReputation(),
    marketMemory: initMarketMemory(),
    properties: {},
    stashes: {},
    campaign: initCampaign(),
    endlessMode: false,
    newGamePlus: false,   // Will be set to { active: true, tier: N, ... } when NG+ is active
    ngPlusLevel: 0,       // Legacy compat
    ngPlusModifiers: null, // Set by applyNGPlusStartBonus
    // Phase 2 systems
    processing: typeof initProcessingState === 'function' ? initProcessingState() : { supplies: {}, activeJobs: [], completedBatches: [], totalBatchesCooked: 0, chemistryXp: 0 },
    processedDrugs: {},
    importExport: typeof initImportExportState === 'function' ? initImportExportState() : { unlockedSources: [], activeShipments: [], completedShipments: [], blockedRoutes: {}, totalImports: 0, totalExports: 0, totalSeized: 0, contactProgress: {}, bribedOfficials: {} },
    factions: typeof initFactionState === 'function' ? initFactionState() : { standings: {}, alliances: {}, wars: {}, factionPower: {}, factionTerritory: {}, absorptions: [], factionEvents: [], diplomacyCooldowns: {} },
    lifestyle: typeof initLifestyleState === 'function' ? initLifestyleState() : { timeOfDay: 0, stress: 0, lifestyleTier: 'modest', newsFeed: [], totalStressGained: 0, totalStressRelieved: 0, activitiesCompleted: 0, flashSpending: 0 },
    politics: typeof initPoliticsState === 'function' ? initPoliticsState() : { corruptOfficials: {}, contacts: {}, intelGathered: [], totalBribesPaid: 0, totalContactsMade: 0, scandals: 0, politicalInfluence: 0, electionCycle: 0 },
    heatSystem: typeof initHeatState === 'function' ? initHeatState() : { local: 0, city: 0, federal: 0, wiretaps: [], counterMeasures: [], chaseHistory: [], totalChases: 0, chasesEscaped: 0, chasesFailed: 0, dealingPatterns: {}, vehicles: ['on_foot'], activeVehicle: 'on_foot' },
    missions: typeof initMissionState === 'function' ? initMissionState() : { activeMissions: [], completedMissions: [], failedMissions: [], totalMissionsCompleted: 0, totalMissionsFailed: 0, totalMissionRewards: 0, pendingDilemma: null, dilemmasResolved: [], totalDilemmas: 0, missionsAvailable: [], lastMissionRefresh: 0 },
    futures: typeof initFuturesState === 'function' ? initFuturesState() : { contracts: [], completedContracts: [], totalProfits: 0, totalLosses: 0, contractsTraded: 0, maxConcurrentContracts: 3 },
    safehouse: typeof initSafehouseState === 'function' ? initSafehouseState() : { current: null, tier: -1, upgrades: [], discovered: false, daysPurchased: 0 },
    items: [],
    worldState: typeof initWorldState === 'function' ? initWorldState() : { unlockedRegions: ['miami'], regionContacts: {}, regionProgress: {}, activeEvents: {} },
    // === V5: Massive content expansion ===
    bosses: typeof initBossState === 'function' ? initBossState() : { defeated: {}, puppets: {}, bribed: {}, destabilized: {}, totalDefeated: 0 },
    mafiaOps: typeof initMafiaOpsState === 'function' ? initMafiaOpsState() : { activeOperations: {}, operationLevels: {}, totalIncome: 0, totalOperationsRun: 0 },
    vehicles: typeof initVehicleState === 'function' ? initVehicleState() : { owned: [], equipped: null, garage: [], mods: {}, hotCars: {}, totalVehiclesBought: 0 },
    prison: typeof initPrisonState === 'function' ? initPrisonState() : { inPrison: false, tier: null, daysRemaining: 0, daysServed: 0, gang: null, respect: 0, totalTimeServed: 0, escapeAttempts: 0 },
    heists: typeof initHeistState === 'function' ? initHeistState() : { currentHeist: null, completedHeists: [], totalLoot: 0, planningDays: 0 },
    territoryDefense: typeof initTerritoryDefenseState === 'function' ? initTerritoryDefenseState() : { fortifications: {}, structures: {}, siegeHistory: [], activeSiege: null },
    intimidation: typeof initIntimidationState === 'function' ? initIntimidationState() : { score: 0, clothing: [], equippedClothing: null },
    weather: typeof initWeatherState === 'function' ? initWeatherState() : { current: 'clear', duration: 1, lastChange: 0, hurricaneDays: 0 },
    nightlife: typeof initNightlifeState === 'function' ? initNightlifeState() : { vipStatus: {}, eventsAttended: 0, contacts: [] },
    romance: typeof initRomanceState === 'function' ? initRomanceState() : { relationships: {}, activeDate: null, totalDates: 0 },
    repHits: typeof initRepHitsState === 'function' ? initRepHitsState() : { activeHits: [], completedHits: [], totalHitsLaunched: 0 },
    // === V6: 2 Million Unique Experiences expansion ===
    encounters: typeof initEncounterState === 'function' ? initEncounterState() : { seenEncounters: [], encounterCooldowns: {}, activeEncounter: null, encounterLog: [], companions: { pet: null, lookout: null }, stats: { totalEncounters: 0, streakDaysWithout: 0 } },
    namedNPCs: typeof initNPCState === 'function' ? initNPCState() : { metNPCs: {}, activeNPCEvent: null, npcBenefits: {}, npcLog: [], stats: { totalMet: 0, totalChaptersCompleted: 0 } },
    businesses: typeof initBusinessState === 'function' ? initBusinessState() : { owned: [], incomeHistory: [], eventLog: [], totalIncome: 0, totalSpent: 0 },
    sideMissionsV2: typeof initSideMissionsV2State === 'function' ? initSideMissionsV2State() : { activeChains: {}, completedChains: [], failedChains: [], availableChains: [], chainLog: [], stats: { totalStarted: 0, totalCompleted: 0, totalFailed: 0 } },
    proceduralMissions: typeof initProceduralState === 'function' ? initProceduralState() : { availableMissions: [], activeMissions: [], completedCount: 0, failedCount: 0, missionLog: [], lastGenDay: 0, difficultyModifier: 0 },
    phone: typeof initPhoneState === 'function' ? initPhoneState() : { inbox: [], contacts: [], burnerAge: 0, burnerType: 'basic', wiretapped: false, unreadCount: 0 },
    bodies_state: typeof initBodyState === 'function' ? initBodyState() : { bodies: 0, totalKills: 0, disposedBodies: 0, discoveredBodies: 0, pendingDisposal: [], bodyLocations: [] },
    tutorial: { active: true, step: 0, completed: false, tabsSeen: {}, screensSeen: {}, pendingHint: null },
    version: 6,
  };

  // Initialize consequence engine state (traits, abilities, delayed effects)
  if (typeof initConsequenceState === 'function') {
    initConsequenceState(state);
  }

  return state;
}

// ============================================================
// PRICE ENGINE
// ============================================================
function generatePrices(state) {
  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  const prices = {};
  const events = [];

  // Track previous prices for stock-like gradual movement
  const prevPrices = state.prices || {};

  for (const drug of DRUGS) {
    const range = drug.maxPrice - drug.minPrice;
    const midPrice = (drug.minPrice + drug.maxPrice) / 2;

    // Stock-like price movement: drift from previous price instead of full random
    const prevPrice = prevPrices[drug.id];
    let price;
    if (prevPrice && prevPrice > 0) {
      // Gradual tick: random walk from previous price (±5-15% per day, mean-reverting)
      const drift = (Math.random() - 0.5) * 0.20; // ±10% random component
      const meanRevert = (midPrice * location.priceModifier - prevPrice) / (midPrice * location.priceModifier) * 0.15; // pull toward mean
      price = prevPrice * (1 + drift + meanRevert);
      // Add small daily noise for realistic ticking
      price += (Math.random() - 0.5) * range * 0.05;
    } else {
      // First day or was unavailable: generate fresh
      price = drug.minPrice + Math.random() * range;
      price *= location.priceModifier;
    }

    // Specialty discount - drugs are cheaper at their source
    if (location.drugSpecialty === drug.id) {
      const specialtyTarget = (drug.minPrice + Math.random() * range * 0.3) * location.priceModifier;
      price = price * 0.7 + specialtyTarget * 0.3; // blend toward cheap
    }

    // Clamp to min/max bounds (with location modifier)
    price = Math.max(drug.minPrice * 0.5, Math.min(drug.maxPrice * 2.5 * location.priceModifier, price));

    // Check for price events (big moves like news)
    for (const event of PRICE_EVENTS) {
      if (Math.random() < event.chance) {
        price *= event.multiplier;
        const msg = event.msg.replace('{drug}', drug.name);
        const newsStory = typeof getNewsStory === 'function' ? getNewsStory(event.msg, drug.name) : null;
        events.push({ msg, drugId: drug.id, effect: event.effect, newsStory });
        break; // only one event per drug
      }
    }

    // Apply supply/demand modifier from economy engine
    if (typeof getSupplyDemandPriceMod === 'function') {
      price *= getSupplyDemandPriceMod(state, drug.id, state.currentLocation);
    }

    // Faction trade discount
    if (typeof getFactionTradeDiscount === 'function') {
      price *= getFactionTradeDiscount(state, state.currentLocation);
    }

    // Weather effects on prices (hurricanes spike prices, heatwaves increase demand)
    if (typeof getWeatherEffects === 'function') {
      var wx = getWeatherEffects(state);
      // Demand modifier affects price directly
      if (wx.demandMod && wx.demandMod !== 1.0) price *= wx.demandMod;
      // Volatility makes price swing more extreme
      if (wx.priceVolatility && wx.priceVolatility > 1.0) {
        var deviance = price - midPrice * location.priceModifier;
        price = midPrice * location.priceModifier + deviance * wx.priceVolatility;
      }
    }

    // Processed drug quality bonus (selling premium product)
    if (typeof getProcessedDrugPriceMod === 'function') {
      price *= getProcessedDrugPriceMod(state, drug.id);
    }

    // NG+ price volatility
    if (state.newGamePlus && state.newGamePlus.active) {
      const vol = getNgPlusMod(state, 'priceVolatility', 1);
      price = midPrice + (price - midPrice) * vol;
    }

    // NG+ drug availability check (e.g., Fentanyl requires Tier 2+)
    if (drug.ngPlus && !isDrugAvailableNGPlus(state, drug)) {
      prices[drug.id] = null; // Not available in this NG+ tier
      continue;
    }

    // 8% chance drug is unavailable (reduced from 12% for better market flow)
    if (Math.random() < 0.08) {
      prices[drug.id] = null; // unavailable
    } else {
      prices[drug.id] = Math.round(price);
    }
  }

  state.prices = prices;
  state.priceEvents = events;

  // Record known prices for this location (price memory system)
  if (!state.knownPrices) state.knownPrices = {};
  const knownEntry = {};
  for (const drugId in prices) {
    if (prices[drugId] !== null && prices[drugId] !== undefined) {
      knownEntry[drugId] = prices[drugId];
    }
  }
  knownEntry._day = state.day;
  state.knownPrices[state.currentLocation] = knownEntry;

  return events;
}

// ============================================================
// NET WORTH SNAPSHOT (for stats charts)
// ============================================================
function snapshotNetWorth(state) {
  if (!state.stats) return;
  let inventoryValue = 0;
  for (const drugId in state.inventory) {
    const price = state.prices[drugId];
    if (price !== null && price !== undefined) {
      inventoryValue += price * state.inventory[drugId];
    }
  }
  // Include distribution stock value
  for (const dist of Object.values(state.distribution || {})) {
    for (const drugId in (dist.stock || {})) {
      const drug = DRUGS.find(d => d.id === drugId);
      if (drug) inventoryValue += Math.round(((drug.minPrice + drug.maxPrice) / 2) * dist.stock[drugId]);
    }
  }
  const netWorth = state.cash + state.bank - state.debt + inventoryValue;
  state.stats.netWorthHistory.push({ day: state.day, cash: state.cash, bank: state.bank, debt: state.debt, inventoryValue, netWorth });
  state.stats.cashHistory.push({ day: state.day, cash: state.cash + state.bank });
  // Keep reasonable size
  if (state.stats.netWorthHistory.length > 120) state.stats.netWorthHistory.shift();
  if (state.stats.cashHistory.length > 120) state.stats.cashHistory.shift();
}

// ============================================================
// WAIT / DAILY PRICE DRIFT
// ============================================================
function waitDay(state) {
  state.day += 1;

  // Daily processing (same as travel)
  const debtRate = GAME_CONFIG.debtInterestRate * getNgPlusMod(state, 'loanSharkInterest', 1);
  state.debt = Math.round(state.debt * (1 + debtRate));
  state.bank = Math.round(state.bank * (1 + GAME_CONFIG.bankInterestRate));
  const msgs = [];

  // Loan shark enforcement - consequences for unpaid debt
  if (state.debt > 0) {
    if (!state.debtDaysUnpaid) state.debtDaysUnpaid = 0;
    state.debtDaysUnpaid++;
    if (state.debt > 30000 && state.debtDaysUnpaid > 7) {
      // Loan shark sends thugs - take a cut of your cash
      const shakedown = Math.min(state.cash, Math.floor(state.debt * 0.05));
      if (shakedown > 0) {
        state.cash -= shakedown;
        state.debt -= shakedown;
        msgs.push(`🦈 Loan shark's enforcers shook you down for $${shakedown.toLocaleString()}!`);
      }
      state.heat = Math.min(100, (state.heat || 0) + 2);
    }
    if (state.debt > 40000 && state.debtDaysUnpaid > 14) {
      // Serious consequences - health damage
      state.health = Math.max(10, (state.health || 100) - 10);
      msgs.push(`🦈 Loan shark's men beat you up! Pay your debts or things get worse.`);
    }
  } else {
    state.debtDaysUnpaid = 0;
  }

  // === CHARACTER FLAG DAILY EFFECTS ===
  if (typeof hasCharacterFlag === 'function') {
    // Active Bounty (Connected Kid): 5% daily chance of bounty hunter attack
    if (hasCharacterFlag(state, 'activeBounty') && Math.random() < 0.05) {
      const bountyDmg = 10 + Math.floor(Math.random() * 15);
      state.health = Math.max(1, (state.health || 100) - bountyDmg);
      state.heat = Math.min(100, (state.heat || 0) + 5);
      msgs.push(`⚠️ Bounty hunter attack! Someone from your father's past came looking. -${bountyDmg} HP, +5 heat.`);
    }
    // Family Dependent (Immigrant): $200/day remittance or family rep penalty
    if (hasCharacterFlag(state, 'familyDependent')) {
      if (state.cash >= 200) {
        state.cash -= 200;
        state.familyRemittancePaid = (state.familyRemittancePaid || 0) + 200;
        // Every $5K sent, gain trust
        if (state.familyRemittancePaid % 5000 < 200 && typeof adjustRep === 'function') {
          adjustRep(state, 'trust', 3);
          msgs.push('💌 Your family back home says thank you. +3 Trust.');
        }
      } else {
        state.familyMissedPayments = (state.familyMissedPayments || 0) + 1;
        if (state.familyMissedPayments % 7 === 0) {
          msgs.push('📞 Your family called. They need money. You can\'t keep missing payments.');
          if (typeof adjustRep === 'function') adjustRep(state, 'trust', -2);
        }
      }
    }
    // Old Injury (Veteran): health recovers 25% slower, occasional pain flare
    if (hasCharacterFlag(state, 'oldInjury') && state.health < 100) {
      // Slow healing: remove 25% of daily health regen
      if (state.health < (state.maxHealth || 100) && Math.random() < 0.15) {
        state.health = Math.max(1, state.health - 2);
        msgs.push('🩹 Old injury flares up. -2 HP.');
      }
    }
    // Known Enforcer (Veteran): intimidation events happen more often
    // (handled via intimidation bonus already)
    // Smooth Talker (Hustler): occasional free intel from contacts
    if (hasCharacterFlag(state, 'smoothTalker') && Math.random() < 0.08) {
      const intelCash = 500 + Math.floor(Math.random() * 1500);
      state.cash += intelCash;
      msgs.push(`🗣️ Your smooth talking paid off — a contact tipped you $${intelCash.toLocaleString()} for a favor.`);
    }
    // Known on Streets (Corner Kid): occasional street gifts/intel
    if (hasCharacterFlag(state, 'knownOnStreets') && Math.random() < 0.06) {
      msgs.push('👀 Someone on the block recognized you. "Yo, cops are doing a sweep on the east side today." You adjust your route.');
      state.heat = Math.max(0, (state.heat || 0) - 3);
    }
    // International Contact (Immigrant): occasional import deal offer
    if (hasCharacterFlag(state, 'internationalContact') && Math.random() < 0.04 && state.day > 10) {
      const drugId = ['cocaine', 'heroin', 'opium'][Math.floor(Math.random() * 3)];
      const drug = DRUGS.find(d => d.id === drugId);
      if (drug && state.inventory) {
        const amount = 3 + Math.floor(Math.random() * 5);
        state.inventory[drugId] = (state.inventory[drugId] || 0) + amount;
        msgs.push(`📦 Your international contact sent ${amount} ${drug.name} as a loyalty gift.`);
      }
    }
  }

  msgs.push(...processCrewDaily(state));
  msgs.push(...processInvestigationDaily(state));
  const terIncome = processTerritoryIncome(state);
  if (terIncome > 0) msgs.push(`🏴 Territory income: +$${terIncome.toLocaleString()}`);
  const bizIncome = processFrontBusinessIncome(state);
  if (bizIncome > 0) msgs.push(`🏢 Business income: +$${bizIncome.toLocaleString()}`);
  const distResult = processDistributionDaily(state);
  if (distResult.revenue > 0) msgs.push(`📡 Distribution: +$${distResult.revenue.toLocaleString()}`);
  msgs.push(...distResult.messages);

  // New system daily processors
  if (typeof processMarketDaily === 'function') processMarketDaily(state);
  if (typeof processReputationDaily === 'function') processReputationDaily(state);
  if (typeof processPropertiesDaily === 'function') {
    const propMsgs = processPropertiesDaily(state);
    msgs.push(...propMsgs);
  }
  if (typeof processCrewExpansionDaily === 'function') {
    const crewExpMsgs = processCrewExpansionDaily(state);
    msgs.push(...crewExpMsgs);
  }
  // Phase 2 daily processing
  if (typeof processProcessingDaily === 'function') {
    const procMsgs = processProcessingDaily(state);
    msgs.push(...procMsgs);
  }
  if (typeof processImportExportDaily === 'function') {
    const ieMsgs = processImportExportDaily(state);
    msgs.push(...ieMsgs);
  }
  if (typeof processFactionDaily === 'function') {
    const facMsgs = processFactionDaily(state);
    msgs.push(...facMsgs);
  }
  if (typeof processHeatSystemDaily === 'function') {
    const heatMsgs = processHeatSystemDaily(state);
    msgs.push(...heatMsgs);
  }
  if (typeof processLifestyleDaily === 'function') {
    const lifeMsgs = processLifestyleDaily(state);
    msgs.push(...lifeMsgs);
  }
  if (typeof processPoliticsDaily === 'function') {
    const polMsgs = processPoliticsDaily(state);
    msgs.push(...polMsgs);
  }
  if (typeof processMissionsDaily === 'function') {
    const missionMsgs = processMissionsDaily(state);
    msgs.push(...missionMsgs);
  }

  if (typeof processFuturesDaily === 'function') {
    const futuresMsgs = processFuturesDaily(state);
    msgs.push(...futuresMsgs);
  }

  if (typeof processSafehouseDaily === 'function') {
    const shMsgs = processSafehouseDaily(state);
    msgs.push(...shMsgs);
  }

  if (typeof processBodyDisposalDaily === 'function') {
    const bodyMsgs = processBodyDisposalDaily(state);
    msgs.push(...bodyMsgs);
  }

  if (typeof processTurfWarsDaily === 'function') {
    const turfMsgs = processTurfWarsDaily(state);
    msgs.push(...turfMsgs);
  }

  // === NEW EXPANSION SYSTEMS ===
  // District events
  if (typeof generateDistrictEvent === 'function') {
    const distEvent = generateDistrictEvent(state);
    if (distEvent) msgs.push(distEvent.msg);
  }
  // Expanded heat system (3-tier)
  if (typeof processHeatDaily === 'function') {
    const heatExpMsgs = processHeatDaily(state);
    msgs.push(...heatExpMsgs);
  }
  // Rival dealer AI
  if (typeof processRivalsDaily === 'function') {
    const rivalMsgs = processRivalsDaily(state);
    msgs.push(...rivalMsgs);
  }
  // Shipping & transport
  if (typeof processShippingDaily === 'function') {
    const shipMsgs = processShippingDaily(state);
    msgs.push(...shipMsgs);
  }
  // Campaign mission progress check
  if (typeof checkMissionProgress === 'function' && state.campaign) {
    const completedMission = checkMissionProgress(state);
    if (completedMission) {
      msgs.push(`🎯 MISSION COMPLETE: ${completedMission.name}! Check missions for rewards.`);
    }
  }

  // Raid check
  if (typeof processRaidCheck === 'function') {
    const raid = processRaidCheck(state);
    if (raid) {
      state.pendingRaid = raid;
      msgs.push(`🚨 ${raid.type.emoji} ${raid.type.name}! ${raid.type.desc} Check Security to respond.`);
    }
  }

  // World progression and events
  if (typeof processWorldDaily === 'function') {
    const worldMsgs = processWorldDaily(state);
    msgs.push(...worldMsgs);
  }
  if (typeof ensureWorldState === 'function') ensureWorldState(state);

  // === V5: Massive content expansion daily processors ===
  // Prison intercept — if in prison, skip most daily processing (handled above, but process prison)
  if (typeof processPrisonDaily === 'function' && state.prison && state.prison.inPrison) {
    const prisonMsgs = processPrisonDaily(state);
    msgs.push(...prisonMsgs);
    // Empire autopilot while in prison
    if (typeof processEmpireAutopilot === 'function') {
      const autopilotMsgs = processEmpireAutopilot(state);
      msgs.push(...autopilotMsgs);
    }
  }
  if (typeof processWeatherDaily === 'function') {
    const weatherMsgs = processWeatherDaily(state);
    if (weatherMsgs && weatherMsgs.length) msgs.push(...weatherMsgs);
  }
  if (typeof processBossesDaily === 'function') {
    const bossMsgs = processBossesDaily(state);
    if (bossMsgs && bossMsgs.length) msgs.push(...bossMsgs);
  }
  if (typeof processMafiaOpsDaily === 'function') {
    const mafiaOpsMsgs = processMafiaOpsDaily(state);
    if (mafiaOpsMsgs && mafiaOpsMsgs.length) msgs.push(...mafiaOpsMsgs);
  }
  if (typeof processVehiclesDaily === 'function') {
    const vehicleMsgs = processVehiclesDaily(state);
    if (vehicleMsgs && vehicleMsgs.length) msgs.push(...vehicleMsgs);
  }
  if (typeof processHeistsDaily === 'function') {
    const heistMsgs = processHeistsDaily(state);
    if (heistMsgs && heistMsgs.length) msgs.push(...heistMsgs);
  }
  if (typeof processTerritoryDefenseDaily === 'function') {
    const defMsgs = processTerritoryDefenseDaily(state);
    if (defMsgs && defMsgs.length) msgs.push(...defMsgs);
  }
  if (typeof processNightlifeDaily === 'function') {
    const nightMsgs = processNightlifeDaily(state);
    if (nightMsgs && nightMsgs.length) msgs.push(...nightMsgs);
  }
  if (typeof processRomanceDaily === 'function') {
    const romanceMsgs = processRomanceDaily(state);
    if (romanceMsgs && romanceMsgs.length) msgs.push(...romanceMsgs);
  }
  if (typeof processRepHitsDaily === 'function') {
    const repHitMsgs = processRepHitsDaily(state);
    if (repHitMsgs && repHitMsgs.length) msgs.push(...repHitMsgs);
  }

  // === V6: 2 Million Unique Experiences daily processors ===
  if (typeof processEncountersDaily === 'function') {
    const encMsgs = processEncountersDaily(state);
    if (encMsgs && encMsgs.length) msgs.push(...encMsgs);
  }
  if (typeof processNPCsDaily === 'function') {
    const npcMsgs = processNPCsDaily(state);
    if (npcMsgs && npcMsgs.length) msgs.push(...npcMsgs);
  }
  if (typeof processBusinessesDaily === 'function') {
    const bizV2Msgs = processBusinessesDaily(state);
    if (bizV2Msgs && bizV2Msgs.length) msgs.push(...bizV2Msgs);
  }
  if (typeof expireBusinessModifiers === 'function') {
    expireBusinessModifiers(state);
  }
  if (typeof processSideMissionsV2Daily === 'function') {
    const smV2Msgs = processSideMissionsV2Daily(state);
    if (smV2Msgs && smV2Msgs.length) msgs.push(...smV2Msgs);
  }
  if (typeof processProceduralDaily === 'function') {
    const procMissionMsgs = processProceduralDaily(state);
    if (procMissionMsgs && procMissionMsgs.length) msgs.push(...procMissionMsgs);
  }
  if (typeof processPhoneDaily === 'function') {
    const phoneMsgs = processPhoneDaily(state);
    if (phoneMsgs && phoneMsgs.length) msgs.push(...phoneMsgs);
  }

  // Consequence engine daily processing (delayed effects, timed consequences)
  if (typeof processConsequencesDaily === 'function') {
    const cMsgs = processConsequencesDaily(state);
    if (cMsgs && cMsgs.length) msgs.push(...cMsgs);
  }

  // === NEW GAME+ daily processing ===
  if (state.newGamePlus && state.newGamePlus.active) {
    const ngpMsgs = processNGPlusDaily(state);
    if (ngpMsgs && ngpMsgs.length) msgs.push(...ngpMsgs);
  }

  // Campaign milestone check
  if (typeof checkActMilestones === 'function' && !GAME_CONFIG.endlessMode) {
    const actEvent = checkActMilestones(state);
    if (actEvent) {
      msgs.push(`${actEvent.actEmoji} ACT ${actEvent.toAct}: ${actEvent.actName}`);
    }
  }

  // Passive daily XP for empire operations
  if (typeof awardXP === 'function' && typeof XP_REWARDS !== 'undefined') {
    const territories = Object.keys(state.territory || {}).length;
    const fronts = (state.frontBusinesses || []).length;
    const distLocations = Object.keys(state.distribution || {}).length;
    const hasEmpire = territories > 0 || fronts > 0 || distLocations > 0;
    if (hasEmpire) {
      const dailyXP = (XP_REWARDS.daily_empire || 5) + territories * (XP_REWARDS.daily_territory_bonus || 2);
      awardXP(state, 'daily_empire', dailyXP);
    }
  }

  // Heat decays slightly (perk: heat_resist doubles decay)
  let heatDecay = 3;
  if (typeof hasPerk === 'function') {
    if (hasPerk(state, 'heat_resist')) heatDecay *= 2;
    if (hasPerk(state, 'immortal')) heatDecay *= 1.5;
  }
  // Rep-based heat decay bonus
  if (typeof getRepEffects === 'function') {
    const repEffects = getRepEffects(state);
    if (repEffects.heatDecayMod > 0) heatDecay *= (1 + repEffects.heatDecayMod);
  }
  // NG+ heat decay modifier (slower decay at higher tiers)
  heatDecay *= getNGPlusHeatDecayMod(state);
  state.heat = Math.max(0, state.heat - heatDecay);

  // Drift existing prices (±5-20%) and possibly trigger new events
  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  const events = [];
  for (const drug of DRUGS) {
    const current = state.prices[drug.id];
    if (current === null) {
      // 40% chance unavailable drug becomes available again
      if (Math.random() < 0.40) {
        const range = drug.maxPrice - drug.minPrice;
        let price = drug.minPrice + Math.random() * range;
        price *= location.priceModifier;
        if (location.drugSpecialty === drug.id) price *= 0.4 + Math.random() * 0.2;
        state.prices[drug.id] = Math.round(price);
      }
      continue;
    }

    // 5% chance drug becomes unavailable
    if (Math.random() < 0.05) {
      state.prices[drug.id] = null;
      continue;
    }

    // Drift: random walk ±5-20%
    const drift = 0.80 + Math.random() * 0.40; // 0.80 to 1.20
    let newPrice = Math.round(current * drift);

    // Check for new price events (lower chance than full regen)
    for (const event of PRICE_EVENTS) {
      if (Math.random() < event.chance * 0.5) {
        newPrice = Math.round(newPrice * event.multiplier);
        const msg = event.msg.replace('{drug}', drug.name);
        const newsStory = typeof getNewsStory === 'function' ? getNewsStory(event.msg, drug.name) : null;
        events.push({ msg, drugId: drug.id, effect: event.effect, newsStory });
        break;
      }
    }

    // Apply supply/demand modifier to drifted prices too
    if (typeof getSupplyDemandPriceMod === 'function') {
      newPrice = Math.round(newPrice * getSupplyDemandPriceMod(state, drug.id, state.currentLocation));
    }
    // Clamp to reasonable range
    newPrice = Math.max(Math.round(drug.minPrice * 0.3), Math.min(newPrice, Math.round(drug.maxPrice * 2)));
    state.prices[drug.id] = newPrice;
  }

  state.priceEvents = events;

  // Update known prices for current location (price memory system)
  if (!state.knownPrices) state.knownPrices = {};
  const knownUpdate = {};
  for (const drugId in state.prices) {
    if (state.prices[drugId] !== null && state.prices[drugId] !== undefined) {
      knownUpdate[drugId] = state.prices[drugId];
    }
  }
  knownUpdate._day = state.day;
  state.knownPrices[state.currentLocation] = knownUpdate;

  // Record price history and snapshot
  recordPriceHistory(state);
  snapshotNetWorth(state);

  // Safety: prevent negative cash from any source
  if (state.cash < 0) state.cash = 0;

  // Safety: clean corrupted inventory entries
  if (state.inventory) {
    for (const id of Object.keys(state.inventory)) {
      if (typeof state.inventory[id] !== 'number' || isNaN(state.inventory[id]) || state.inventory[id] <= 0) {
        delete state.inventory[id];
      }
    }
  }

  // Check game over
  if (!GAME_CONFIG.endlessMode && state.day > GAME_CONFIG.totalDays) {
    endGame(state);
  }

  // Process random street events while waiting
  const streetEvent = processWaitEvent(state);

  return { success: true, msgs, events, streetEvent };
}

function processWaitEvent(state) {
  // Process buff expiration
  const buffMsgs = processBuffs(state);

  const roll = Math.random();
  // 25% chance of a random event while waiting (up from 15%)
  if (roll > 0.25) return buffMsgs.length > 0 ? { type: 'info', msg: buffMsgs.join(' ') } : null;

  // 40% of events are now dialogue encounters
  if (Math.random() < 0.40) {
    const encounter = triggerDialogueEncounter(state);
    if (encounter) return { type: 'dialogue', encounter, buffMsgs };
  }

  const eventRoll = Math.random();
  if (eventRoll < 0.20 && state.cash > 100) {
    // Pickpocketed
    const loss = Math.round(state.cash * (0.05 + Math.random() * 0.10));
    state.cash -= loss;
    return { type: 'bad', msg: `🔪 You got pickpocketed on the street! Lost $${loss.toLocaleString()}.` };
  } else if (eventRoll < 0.35) {
    // Street tip
    const randomDrug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
    return { type: 'info', msg: `💬 Word on the street: ${randomDrug.name} prices are about to shift big time.` };
  } else if (eventRoll < 0.50) {
    // Found cash
    const found = Math.round(50 + Math.random() * 500);
    state.cash += found;
    return { type: 'good', msg: `💵 Found $${found.toLocaleString()} on the ground!` };
  } else if (eventRoll < 0.60 && state.heat > 20) {
    // Police patrol
    state.heat += 5;
    return { type: 'bad', msg: `🚔 Police patrol noticed you hanging around. Heat +5.` };
  } else if (eventRoll < 0.70) {
    // Shady stranger offers to sell drugs cheap
    const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
    const amt = 3 + Math.floor(Math.random() * 10);
    const price = Math.round(((drug.minPrice + drug.maxPrice) / 2) * 0.4);
    if (state.cash >= price * amt && getFreeSpace(state) >= amt) {
      state.cash -= price * amt;
      state.inventory[drug.id] = (state.inventory[drug.id] || 0) + amt;
      return { type: 'good', msg: `🕶️ A stranger sold you ${amt} ${drug.name} at 60% off! -$${(price * amt).toLocaleString()}` };
    }
    return { type: 'info', msg: `🕶️ A stranger offered ${amt} ${drug.name} cheap, but you couldn't take the deal.` };
  } else if (eventRoll < 0.80) {
    // Random weapon find
    const unownedWeapons = WEAPONS.filter(w => w.price > 0 && w.price < 10000 && !state.weapons.includes(w.id));
    if (unownedWeapons.length > 0) {
      const w = unownedWeapons[Math.floor(Math.random() * unownedWeapons.length)];
      state.weapons.push(w.id);
      return { type: 'good', msg: `🔫 Found a ${w.name} in an alley dumpster!` };
    }
    return { type: 'info', msg: `⏳ You lay low for the day. The streets are quiet.` };
  } else if (eventRoll < 0.90) {
    // Heat spike from suspicious activity nearby
    if (state.heat > 0) {
      const reduction = 5 + Math.floor(Math.random() * 10);
      state.heat = Math.max(0, state.heat - reduction);
      return { type: 'good', msg: `😌 Cops busted someone else nearby. Heat dropped by ${reduction}.` };
    }
    return { type: 'info', msg: `⏳ Quiet day on the streets.` };
  } else {
    return { type: 'info', msg: `⏳ You lay low for the day. The streets are quiet.` };
  }
}

// ============================================================
// INVENTORY HELPERS
// ============================================================
function getInventoryCount(state) {
  if (!state.inventory) state.inventory = {};
  let count = 0;
  for (const id in state.inventory) {
    const qty = state.inventory[id];
    if (typeof qty !== 'number' || isNaN(qty) || qty <= 0) {
      delete state.inventory[id]; // Clean corrupted entries
      continue;
    }
    count += qty;
  }
  // Weapons take space
  for (const wId of state.weapons) {
    const w = WEAPONS.find(wp => wp.id === wId);
    if (w) count += w.space;
  }
  return count;
}

function getMaxInventory(state) {
  let max = state.inventorySpace;
  // Henchmen add carry capacity (not if injured)
  for (const h of state.henchmen) {
    if (h.injured) continue;
    const type = HENCHMEN_TYPES.find(t => t.id === h.type);
    if (type) max += type.carry;
  }
  // Perk: extra carry capacity
  if (typeof getPerkExtraCarry === 'function') max += getPerkExtraCarry(state);
  // Skill tree: light packer + logistics master
  max += getSkillEffect(state, 'extraCarry');
  return max;
}

function getFreeSpace(state) {
  return getMaxInventory(state) - getInventoryCount(state);
}

// ============================================================
// TRADING
// ============================================================
function buyDrug(state, drugId, amount) {
  let price = state.prices[drugId];
  if (price === null || price === undefined) return { success: false, msg: 'Not available here.' };
  // Check drug level requirement
  const drugDef = DRUGS.find(d => d.id === drugId);
  if (drugDef && drugDef.minLevel) {
    const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
    if (playerLevel < drugDef.minLevel) {
      const reqTitle = typeof KINGPIN_LEVELS !== 'undefined' ? KINGPIN_LEVELS.find(l => l.level === drugDef.minLevel)?.title || 'Level ' + drugDef.minLevel : 'Level ' + drugDef.minLevel;
      return { success: false, msg: `🔒 No one will sell ${drugDef.name} to a nobody. Reach ${reqTitle} (Lvl ${drugDef.minLevel}) first.` };
    }
  }
  price = applyTerritoryPriceMod(state, state.currentLocation, price, true);
  // Perk: buy discount
  if (typeof getPerkBuyDiscount === 'function') {
    const discount = getPerkBuyDiscount(state);
    if (discount > 0) price = Math.round(price * (1 - discount));
  }
  // Skill tree: haggler buy discount
  const skillBuyMod = getSkillEffect(state, 'buyMod');
  if (skillBuyMod < 0) price = Math.round(price * (1 + skillBuyMod));
  // Buff: cartel prices
  if (hasBuff(state, 'cartel_prices')) price = Math.round(price * 0.70);
  // Skill tree: kingmaker global cost reduction
  const globalCostMod = getSkillEffect(state, 'globalCostMod');
  if (globalCostMod < 0) price = Math.round(price * (1 + globalCostMod));
  // Consequence engine: ability buy discount (e.g. Haggle Master)
  const abilityBuyDiscount = typeof getAbilityBonus === 'function' ? getAbilityBonus(state, 'buy_discount') : 0;
  if (abilityBuyDiscount > 0) price = Math.round(price * (1 - abilityBuyDiscount / 100));
  // Character passive: buy discount (Hustler -10%)
  const charBuyDiscount = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'buyDiscount') : 0;
  if (charBuyDiscount > 0) price = Math.round(price * (1 - charBuyDiscount));
  // Character passive: Americas discount (Connected Kid -15% on Americas imports)
  const charAmericasDiscount = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'americasDiscount') : 0;
  if (charAmericasDiscount > 0 && state.currentRegion && (state.currentRegion === 'south_america' || state.currentRegion === 'central_america' || state.currentRegion === 'mexico')) {
    price = Math.round(price * (1 - charAmericasDiscount));
  }
  // Character passive: transport discount (Immigrant -25% on transport)
  // (applied in travel cost, not buy price)
  // Time of day: evening deals 5% cheaper, night 10% cheaper (but more dangerous)
  if (typeof getTimePeriod === 'function') {
    var tp = getTimePeriod(state);
    if (tp && tp.effects && tp.effects.dealDiscount > 0) {
      price = Math.round(price * (1 - tp.effects.dealDiscount));
    }
  }
  // Bulk discount: buying 10+ units gets 5% discount
  if (amount >= 10) price = Math.round(price * 0.95);
  // Market reputation: frequent trading at a location gives better prices
  if (!state.locationTrades) state.locationTrades = {};
  const locTrades = state.locationTrades[state.currentLocation] || 0;
  if (locTrades >= 20) price = Math.round(price * 0.92);       // 8% discount after 20+ trades
  else if (locTrades >= 5) price = Math.round(price * 0.97);   // 3% discount after 5+ trades
  const totalCost = price * amount;
  if (totalCost > state.cash) return { success: false, msg: 'Not enough cash.' };

  // Check inventory space (only drug units, not weapons)
  let drugCount = 0;
  for (const id in state.inventory) drugCount += state.inventory[id];
  const weaponSpace = state.weapons.reduce((s, wId) => {
    const w = WEAPONS.find(wp => wp.id === wId);
    return s + (w ? w.space : 0);
  }, 0);
  const available = getMaxInventory(state) - drugCount - weaponSpace;

  if (amount > available) return { success: false, msg: `Only ${available} spaces available.` };

  state.cash -= totalCost;
  state.inventory[drugId] = (state.inventory[drugId] || 0) + amount;
  state.drugsBought += amount;
  // Track per-drug stats
  if (state.stats) {
    if (!state.stats.drugLedger[drugId]) state.stats.drugLedger[drugId] = { bought: 0, sold: 0, spent: 0, earned: 0, avgCost: 0 };
    const ledger = state.stats.drugLedger[drugId];
    // Update weighted average cost
    const prevQty = (state.inventory[drugId] || 0) - amount; // qty before this buy
    const prevTotal = ledger.avgCost * Math.max(0, prevQty);
    ledger.avgCost = (prevTotal + totalCost) / ((prevQty > 0 ? prevQty : 0) + amount);
    ledger.bought += amount;
    ledger.spent += totalCost;
    state.stats.totalSpentOnDrugs += totalCost;
    state.stats.biggestSinglePurchase = Math.max(state.stats.biggestSinglePurchase, totalCost);
    state.stats.tradeLog.push({ day: state.day, type: 'buy', drugId, amount, price, total: totalCost, location: state.currentLocation });
    if (state.stats.tradeLog.length > 200) state.stats.tradeLog.shift();
  }
  // Investigation trigger for large buys
  if (state.investigation) {
    state.investigation.daysSinceDealing = 0;
    const drug = DRUGS.find(d => d.id === drugId);
    const threshold = (drug && drug.category === 'premium') ? 5000 : 10000;
    if (totalCost >= threshold) updateInvestigation(state, 'buy_large', Math.floor(totalCost / 5000));
  }
  // Update market memory (supply/demand)
  if (typeof updateMarketOnBuy === 'function') {
    updateMarketOnBuy(state, drugId, amount, state.currentLocation);
  }
  // Wiretap evidence from deal
  let tapMsg = '';
  if (typeof onDealWhileTapped === 'function') {
    const tapWarning = onDealWhileTapped(state, drugId, amount, false);
    if (tapWarning) tapMsg = ' ' + tapWarning;
  }
  // Track dealing location for heat system
  if (state.heatSystem) {
    state.heatSystem.lastDealLocation = state.currentLocation;
    if (!state.heatSystem.dealingPatterns) state.heatSystem.dealingPatterns = {};
    state.heatSystem.dealingPatterns[state.currentLocation] = (state.heatSystem.dealingPatterns[state.currentLocation] || 0) + 1;
  }
  // Track location trades for market reputation system
  if (!state.locationTrades) state.locationTrades = {};
  state.locationTrades[state.currentLocation] = (state.locationTrades[state.currentLocation] || 0) + 1;
  // Gang territory heat modifier
  if (typeof getGangTerritoryHeatMod === 'function') {
    const gangHeat = getGangTerritoryHeatMod(state, state.currentLocation);
    if (gangHeat !== 0) {
      state.heat = Math.max(0, Math.min(100, (state.heat || 0) + gangHeat));
    }
  }
  // Faction standing adjustment from buying in gang territory
  let factionDealMsgs = [];
  if (typeof adjustFactionStandingFromDeal === 'function') {
    factionDealMsgs = adjustFactionStandingFromDeal(state, state.currentLocation, false, totalCost);
  }
  // Check for gang ambush
  let ambushMsg = '';
  if (typeof checkGangAmbush === 'function') {
    const ambush = checkGangAmbush(state, state.currentLocation);
    if (ambush) {
      ambushMsg = ' ' + ambush.msg;
      factionDealMsgs.push(ambush.msg);
    }
  }
  // Build buy message with bonus info
  const buyBonuses = [];
  if (amount >= 10) buyBonuses.push('Bulk -5%');
  const _locT = state.locationTrades[state.currentLocation] || 0;
  if (_locT >= 20) buyBonuses.push('Rep -8%');
  else if (_locT >= 5) buyBonuses.push('Rep -3%');
  const buyBonusStr = buyBonuses.length > 0 ? ' (' + buyBonuses.join(', ') + ')' : '';
  const result = { success: true, msg: `Bought ${amount} ${DRUGS.find(d => d.id === drugId).name} for $${totalCost.toLocaleString()}${buyBonusStr}${tapMsg}${ambushMsg}` };
  if (factionDealMsgs.length > 0) result.factionMsgs = factionDealMsgs;
  return result;
}

function sellDrug(state, drugId, amount) {
  if (!state.inventory) state.inventory = {};
  let price = state.prices[drugId];
  // If drug unavailable at location, sell at 50% average price (emergency sale)
  if (price === null || price === undefined) {
    const drug = DRUGS.find(d => d.id === drugId);
    if (drug) {
      price = Math.round((drug.minPrice + drug.maxPrice) / 2 * 0.5);
    } else {
      return { success: false, msg: 'Unknown drug.' };
    }
  }
  if (!state.inventory[drugId] || state.inventory[drugId] < amount) return { success: false, msg: 'You don\'t have that much.' };
  price = applyTerritoryPriceMod(state, state.currentLocation, price, false);
  // Faction sell bonus (gang standing affects sell prices)
  if (typeof getFactionSellBonus === 'function') {
    price = Math.round(price * getFactionSellBonus(state, state.currentLocation));
  }
  // Reputation penalty — low-level dealers get worse prices
  const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  if (playerLevel <= 3) price = Math.round(price * 0.70);       // Street punk: 30% penalty
  else if (playerLevel <= 5) price = Math.round(price * 0.82);  // Hustler/Dealer: 18% penalty
  else if (playerLevel <= 7) price = Math.round(price * 0.90);  // Supplier/Dist: 10% penalty
  else if (playerLevel <= 10) price = Math.round(price * 0.95); // Lt/Boss: 5% penalty
  // Perk: sell bonus
  if (typeof getPerkSellBonus === 'function') {
    const bonus = getPerkSellBonus(state);
    if (bonus > 0) price = Math.round(price * (1 + bonus));
  }
  // Skill tree: haggler sell bonus
  const skillSellMod = getSkillEffect(state, 'sellMod');
  if (skillSellMod > 0) price = Math.round(price * (1 + skillSellMod));
  // Buff: sell boost
  if (hasBuff(state, 'sell_boost')) price = Math.round(price * 1.20);
  // Skill: kingmaker global income
  const globalIncomeMod = getSkillEffect(state, 'globalIncomeMod');
  if (globalIncomeMod > 0) price = Math.round(price * (1 + globalIncomeMod));
  // Consequence engine: ability sell bonus (e.g. Haggle Master, Purity Expert)
  const abilitySellBonus = typeof getAbilityBonus === 'function' ? getAbilityBonus(state, 'sell_bonus') : 0;
  if (abilitySellBonus > 0) price = Math.round(price * (1 + abilitySellBonus / 100));
  // Character passive: Hustler gets no sell bonus (buy discount only) but check for generic sell perk
  // No character currently has a sell passive, but future-proofed:
  const charSellBonus = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'sellBonus') : 0;
  if (charSellBonus > 0) price = Math.round(price * (1 + charSellBonus));
  // Bulk premium: selling 10+ units at once gets 5% premium
  if (amount >= 10) price = Math.round(price * 1.05);
  // Market reputation: frequent trading at a location gives better prices
  if (!state.locationTrades) state.locationTrades = {};
  const locTradesSell = state.locationTrades[state.currentLocation] || 0;
  if (locTradesSell >= 20) price = Math.round(price * 1.08);       // 8% premium after 20+ trades
  else if (locTradesSell >= 5) price = Math.round(price * 1.03);   // 3% premium after 5+ trades
  const totalRevenue = price * amount;
  state.cash += totalRevenue;
  // Drug sales produce DIRTY money
  state.dirtyMoney = (state.dirtyMoney || 0) + totalRevenue;
  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] === 0) delete state.inventory[drugId];
  state.drugsSold += amount;
  state.totalProfit += totalRevenue;
  // Track per-drug stats
  if (state.stats) {
    if (!state.stats.drugLedger[drugId]) state.stats.drugLedger[drugId] = { bought: 0, sold: 0, spent: 0, earned: 0 };
    state.stats.drugLedger[drugId].sold += amount;
    state.stats.drugLedger[drugId].earned += totalRevenue;
    state.stats.totalEarnedFromDrugs += totalRevenue;
    state.stats.biggestSingleSale = Math.max(state.stats.biggestSingleSale, totalRevenue);
    state.stats.tradeLog.push({ day: state.day, type: 'sell', drugId, amount, price, total: totalRevenue, location: state.currentLocation });
    if (state.stats.tradeLog.length > 200) state.stats.tradeLog.shift();
  }
  // Investigation trigger for large sales
  if (state.investigation) {
    state.investigation.daysSinceDealing = 0;
    const drug = DRUGS.find(d => d.id === drugId);
    const threshold = (drug && drug.category === 'premium') ? 5000 : 10000;
    if (totalRevenue >= threshold) updateInvestigation(state, 'sell_large', Math.floor(totalRevenue / 5000));
  }
  // Update market memory (supply/demand)
  if (typeof updateMarketOnSell === 'function') {
    updateMarketOnSell(state, drugId, amount, state.currentLocation);
  }
  // Reputation: drug sale
  if (typeof adjustRepFromAction === 'function') {
    adjustRepFromAction(state, totalRevenue >= 50000 ? 'large_drug_sale' : 'drug_sale');
  }
  // Wiretap evidence from deal
  let tapMsg = '';
  if (typeof onDealWhileTapped === 'function') {
    const tapWarning = onDealWhileTapped(state, drugId, amount, true);
    if (tapWarning) tapMsg = ' ' + tapWarning;
  }
  if (state.heatSystem) {
    state.heatSystem.lastDealLocation = state.currentLocation;
  }
  // Track location trades for market reputation system
  if (!state.locationTrades) state.locationTrades = {};
  state.locationTrades[state.currentLocation] = (state.locationTrades[state.currentLocation] || 0) + 1;
  // Gang territory heat modifier on sell (selling is riskier than buying)
  if (typeof getGangTerritoryHeatMod === 'function') {
    const gangHeat = getGangTerritoryHeatMod(state, state.currentLocation);
    if (gangHeat !== 0) {
      const sellHeatMod = gangHeat > 0 ? Math.ceil(gangHeat * 1.2) : gangHeat; // Selling generates slightly more heat
      state.heat = Math.max(0, Math.min(100, (state.heat || 0) + sellHeatMod));
    }
  }
  // Faction standing adjustment from selling in gang territory
  let factionSellMsgs = [];
  if (typeof adjustFactionStandingFromDeal === 'function') {
    factionSellMsgs = adjustFactionStandingFromDeal(state, state.currentLocation, true, totalRevenue);
  }
  // Check for gang ambush after sell
  let ambushSellMsg = '';
  if (typeof checkGangAmbush === 'function') {
    const ambush = checkGangAmbush(state, state.currentLocation);
    if (ambush) {
      ambushSellMsg = ' ' + ambush.msg;
      factionSellMsgs.push(ambush.msg);
    }
  }
  // Build sell message with bonus info
  const sellBonuses = [];
  if (amount >= 10) sellBonuses.push('Bulk +5%');
  const _locTS = state.locationTrades[state.currentLocation] || 0;
  if (_locTS >= 20) sellBonuses.push('Rep +8%');
  else if (_locTS >= 5) sellBonuses.push('Rep +3%');
  const sellBonusStr = sellBonuses.length > 0 ? ' (' + sellBonuses.join(', ') + ')' : '';
  const result = { success: true, msg: `Sold ${amount} ${DRUGS.find(d => d.id === drugId).name} for $${totalRevenue.toLocaleString()}${sellBonusStr}${tapMsg}${ambushSellMsg}` };
  if (factionSellMsgs.length > 0) result.factionMsgs = factionSellMsgs;
  return result;
}

// ============================================================
// BANKING
// ============================================================
function deposit(state, amount) {
  if (amount > state.cash) return { success: false, msg: 'Not enough cash.' };
  state.cash -= amount;
  state.bank += amount;
  return { success: true, msg: `Deposited $${amount.toLocaleString()}. Bank balance: $${state.bank.toLocaleString()}` };
}

function withdraw(state, amount) {
  if (amount > state.bank) return { success: false, msg: 'Not enough in the bank.' };
  state.bank -= amount;
  state.cash += amount;
  return { success: true, msg: `Withdrew $${amount.toLocaleString()}. Cash: $${state.cash.toLocaleString()}` };
}

function payDebt(state, amount) {
  if (amount > state.cash) return { success: false, msg: 'Not enough cash.' };
  const payment = Math.min(amount, state.debt);
  state.cash -= payment;
  state.debt -= payment;
  return { success: true, msg: `Paid $${payment.toLocaleString()} on your debt. Remaining: $${state.debt.toLocaleString()}` };
}

function borrowMoney(state, amount) {
  const maxBorrow = 50000;
  if (state.debt + amount > maxBorrow) return { success: false, msg: `Loan shark won't lend more than $${maxBorrow.toLocaleString()} total.` };

  // Cooldown: can only borrow once per day
  if (state.lastBorrowDay === state.day) {
    return { success: false, msg: 'The loan shark says come back tomorrow. One loan per day.' };
  }

  // Escalating risk: higher debt = loan shark sends enforcers
  if (state.debt > 30000) {
    state.heat = Math.min(100, (state.heat || 0) + 3);
  }

  state.debt += amount;
  state.cash += amount;
  state.lastBorrowDay = state.day;
  state.totalBorrowed = (state.totalBorrowed || 0) + amount;
  return { success: true, msg: `Borrowed $${amount.toLocaleString()}. Total debt: $${state.debt.toLocaleString()}. Interest: ${(GAME_CONFIG.debtInterestRate * 100).toFixed(1)}% daily.` };
}

// ============================================================
// STASH (Miami only)
// ============================================================
function stashDrugs(state, drugId, amount) {
  if (state.currentLocation !== 'miami') return { success: false, msg: 'Your stash is in Miami.' };
  if (!state.inventory[drugId] || state.inventory[drugId] < amount) return { success: false, msg: 'You don\'t have that much.' };
  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] === 0) delete state.inventory[drugId];
  state.stash[drugId] = (state.stash[drugId] || 0) + amount;
  return { success: true, msg: `Stashed ${amount} ${DRUGS.find(d => d.id === drugId).name}.` };
}

function retrieveDrugs(state, drugId, amount) {
  if (state.currentLocation !== 'miami') return { success: false, msg: 'Your stash is in Miami.' };
  if (!state.stash[drugId] || state.stash[drugId] < amount) return { success: false, msg: 'Not enough in your stash.' };
  if (amount > getFreeSpace(state)) return { success: false, msg: 'Not enough inventory space.' };
  state.stash[drugId] -= amount;
  if (state.stash[drugId] === 0) delete state.stash[drugId];
  state.inventory[drugId] = (state.inventory[drugId] || 0) + amount;
  return { success: true, msg: `Retrieved ${amount} ${DRUGS.find(d => d.id === drugId).name} from stash.` };
}

// ============================================================
// TRAVEL
// ============================================================
function getAvailableTransport(state, destinationId) {
  const from = LOCATIONS.find(l => l.id === state.currentLocation);
  const to = LOCATIONS.find(l => l.id === destinationId);
  const sameRegion = from.region === to.region;
  const results = [];

  const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  const TRANSPORT_TIER_LEVEL = { budget: 1, standard: 3, premium: 7, lord: 12 };
  for (const [id, t] of Object.entries(TRANSPORT)) {
    if (t.sameRegionOnly && !sameRegion) continue;
    const minLvl = TRANSPORT_TIER_LEVEL[t.tier] || 1;
    const locked = playerLevel < minLvl;
    const cost = Math.round(t.costPerRegion * (sameRegion ? 1 : 2.5) * state.transportCostMultiplier);
    results.push({ id, ...t, cost, canAfford: state.cash >= cost && !locked, canCarry: getInventoryCount(state) <= t.inventoryLimit, locked, minLevel: minLvl });
  }
  return results;
}

function travel(state, destinationId, transportId) {
  const destination = LOCATIONS.find(l => l.id === destinationId);
  if (!destination) return { success: false, msg: 'Unknown destination.' };
  if (destinationId === state.currentLocation) return { success: false, msg: 'You\'re already here.' };

  // Check local transport first
  let transports = getAvailableTransport(state, destinationId);
  let transport = transports.find(t => t.id === transportId);

  // If not found in local transport, check world transport
  if (!transport && typeof getWorldTransport === 'function') {
    const from = LOCATIONS.find(l => l.id === state.currentLocation);
    const fromRegion = from ? (from.region || 'miami') : 'miami';
    const toRegion = destination.region || 'miami';
    if (fromRegion !== toRegion) {
      const worldTransports = getWorldTransport(state, fromRegion, toRegion);
      transport = worldTransports.find(t => t.id === transportId);
    }
  }

  if (!transport) return { success: false, msg: 'Transport not available for this route.' };
  if (!transport.canAfford) return { success: false, msg: 'Can\'t afford this transport.' };
  if (!transport.canCarry) return { success: false, msg: `${transport.name} can only carry ${transport.inventoryLimit} units. You have ${getInventoryCount(state)}.` };

  // Weather blocks travel during hurricanes
  if (typeof getWeatherEffects === 'function') {
    var wx = getWeatherEffects(state);
    if (wx.allTravelBlocked) return { success: false, msg: '🌀 Hurricane! All travel blocked. Wait for the storm to pass.' };
    if (wx.waterRoutesBlocked && (transport.type === 'boat' || transport.type === 'ship')) {
      return { success: false, msg: '⛈️ Tropical storm! Water routes are blocked.' };
    }
  }

  // Perk: connections reduces transport costs
  let transportCost = transport.cost;
  if (typeof hasPerk === 'function') {
    if (hasPerk(state, 'connections')) transportCost = Math.round(transportCost * 0.80);
    if (hasPerk(state, 'immortal')) transportCost = Math.round(transportCost * 0.90);
  }
  // Skill tree: road_warrior transport cost reduction
  const roadWarriorMod = getSkillEffect(state, 'transportCostMod');
  if (roadWarriorMod < 0) transportCost = Math.round(transportCost * (1 + roadWarriorMod));
  // Permanent transport discount from smuggler captain
  if (state.transportCostMultiplier && state.transportCostMultiplier < 1) {
    transportCost = Math.round(transportCost * state.transportCostMultiplier);
  }
  // Skill tree: kingmaker cost reduction
  const skillGlobalCost = getSkillEffect(state, 'globalCostMod');
  if (skillGlobalCost < 0) transportCost = Math.round(transportCost * (1 + skillGlobalCost));
  // Character passive: Immigrant -25% transport costs
  const charTransportDiscount = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'transportDiscount') : 0;
  if (charTransportDiscount > 0) transportCost = Math.round(transportCost * (1 - charTransportDiscount));
  transportCost = Math.max(0, transportCost);
  // Pay for transport
  state.cash -= transportCost;

  // Advance days
  const daysUsed = transport.timeDays;
  state.day += daysUsed;

  // Apply daily interest, crew management, and investigation for each day traveled
  const dailyMessages = [];
  for (let i = 0; i < daysUsed; i++) {
    state.debt = Math.round(state.debt * (1 + GAME_CONFIG.debtInterestRate));
    state.bank = Math.round(state.bank * (1 + GAME_CONFIG.bankInterestRate));

    // Process crew pay and loyalty
    const crewMsgs = processCrewDaily(state);
    dailyMessages.push(...crewMsgs);

    // Process investigation daily
    const investMsgs = processInvestigationDaily(state);
    dailyMessages.push(...investMsgs);

    // Process territory income
    const terIncome = processTerritoryIncome(state);
    if (terIncome > 0) dailyMessages.push(`🏴 Territory income: +$${terIncome.toLocaleString()}`);

    // Process front business income
    const bizIncome = processFrontBusinessIncome(state);
    if (bizIncome > 0) dailyMessages.push(`🏢 Business income: +$${bizIncome.toLocaleString()}`);

    // Process distribution revenue
    const distResult = processDistributionDaily(state);
    if (distResult.revenue > 0) dailyMessages.push(`📡 Distribution: +$${distResult.revenue.toLocaleString()}`);
    dailyMessages.push(...distResult.messages);

    // V6: Process random encounters during travel days
    if (typeof processEncountersDaily === 'function') {
      const encMsgs = processEncountersDaily(state);
      if (encMsgs && encMsgs.length) dailyMessages.push(...encMsgs);
    }

    // Consequence engine daily processing during travel
    if (typeof processConsequencesDaily === 'function') {
      const cMsgs = processConsequencesDaily(state);
      if (cMsgs && cMsgs.length) dailyMessages.push(...cMsgs);
    }
  }
  if (dailyMessages.length > 0) {
    state.messageLog.push(...dailyMessages);
  }

  // Reduce heat over time (perk: heat_resist doubles decay)
  let travelHeatDecay = daysUsed * 3;
  if (typeof hasPerk === 'function') {
    if (hasPerk(state, 'heat_resist')) travelHeatDecay *= 2;
    if (hasPerk(state, 'immortal')) travelHeatDecay *= 1.5;
  }
  state.heat = Math.max(0, state.heat - travelHeatDecay);

  // Update location
  state.previousLocation = state.currentLocation;
  state.currentLocation = destinationId;
  if (!state.citiesVisited.includes(destinationId)) {
    state.citiesVisited.push(destinationId);
  }

  // Generate new prices
  const priceEvents = generatePrices(state);

  // Snapshot net worth
  snapshotNetWorth(state);

  // Track transport spending
  if (state.stats) state.stats.totalSpentOnTransport += transportCost;

  // Process travel events
  const travelEvents = processTravelEvents(state, transport);

  // Check game over conditions
  if (!GAME_CONFIG.endlessMode && state.day > GAME_CONFIG.totalDays) {
    endGame(state);
  }

  return {
    success: true,
    msg: `Traveled to ${destination.name} via ${transport.name}. (${daysUsed} day${daysUsed > 1 ? 's' : ''}, $${transport.cost.toLocaleString()})`,
    priceEvents,
    travelEvents,
    daysUsed,
  };
}

// ============================================================
// TRAVEL EVENTS PROCESSING
// ============================================================
function processTravelEvents(state, transport) {
  const events = [];
  const location = LOCATIONS.find(l => l.id === state.currentLocation);

  // Risk factor based on transport, location danger, heat, and inventory size
  const invCount = getInventoryCount(state);
  let riskFactor = transport.riskMod * (location.dangerLevel / 3) * (1 + state.heat / 100) * (invCount > 50 ? 1.3 : 1);

  // Lookout reduces encounter chance
  const hasLookout = state.henchmen.some(h => h.type === 'lookout' && !h.injured);
  if (hasLookout) riskFactor *= (1 - INVESTIGATION_CONFIG.lookoutReduction);

  // Perk: street_cred reduces encounters by 10%, immortal another 10%
  if (typeof hasPerk === 'function') {
    if (hasPerk(state, 'street_cred')) riskFactor *= 0.90;
    if (hasPerk(state, 'immortal')) riskFactor *= 0.90;
  }
  // Skill tree: street_smarts reduces encounters
  const encounterMod = getSkillEffect(state, 'encounterMod');
  if (encounterMod < 0) riskFactor *= (1 + encounterMod);
  // Skill tree: ghost_route reduces risk
  const riskModSkill = getSkillEffect(state, 'riskMod');
  if (riskModSkill < 0) riskFactor *= (1 + riskModSkill);
  // Buff: temp lookout
  if (hasBuff(state, 'temp_lookout')) riskFactor *= 0.85;

  // Investigation level increases police encounter chance
  if (state.investigation) {
    riskFactor *= (1 + state.investigation.level * 0.05);
  }

  // DEA Raid at investigation level 5
  if (state.investigation && state.investigation.level >= 5 && Math.random() < 0.5) {
    events.push(createDEARaidEvent(state));
    state.travelEvents = events;
    return events;
  }

  for (const eventTemplate of TRAVEL_EVENTS) {
    if (Math.random() < eventTemplate.chance * riskFactor) {
      const event = processEvent(state, eventTemplate, location);
      if (event) events.push(event);
      if (events.length >= 2) break; // max 2 events per trip
    }
  }

  state.travelEvents = events;
  return events;
}

function processEvent(state, template, location) {
  switch (template.id) {
    case 'mugging': {
      const amount = Math.round(state.cash * (0.1 + Math.random() * 0.25));
      if (amount < 50) return null;
      state.cash -= amount;
      return { ...template, msg: template.msg.replace('${amount}', amount.toLocaleString()), resolved: true };
    }
    case 'find_drugs': {
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      const amount = Math.floor(1 + Math.random() * 8);
      const space = getFreeSpace(state);
      const actual = Math.min(amount, space);
      if (actual <= 0) return null;
      state.inventory[drug.id] = (state.inventory[drug.id] || 0) + actual;
      return { ...template, msg: template.msg.replace('{drug}', drug.name).replace('{amount}', actual), resolved: true };
    }
    case 'find_cash': {
      const amount = Math.round(500 + Math.random() * 5000);
      state.cash += amount;
      return { ...template, msg: template.msg.replace('${amount}', amount.toLocaleString()), resolved: true };
    }
    case 'police_encounter': {
      const invCount = getInventoryCount(state);
      const drugIds = Object.keys(state.inventory).filter(d => (state.inventory[d] || 0) > 0);
      const isCarrying = drugIds.length > 0;
      const totalDrugs = drugIds.reduce((s, d) => s + (state.inventory[d] || 0), 0);
      const count = 1 + Math.floor(Math.random() * 3 + state.heat / 30);

      if (!isCarrying) {
        // Clean — no drugs on you. Much better outcome
        state.heat += 3;
        const cleanOutcomes = [
          'The cops search you and find nothing. "Move along." You walk away clean.',
          'Officer pats you down — empty pockets. They let you go with a warning.',
          'They ran your ID. Clean record, no drugs. "Have a nice day." That stash house saved your ass.'
        ];
        return { ...template, msg: '🚔 ' + cleanOutcomes[Math.floor(Math.random() * cleanOutcomes.length)] + ' (+3 Heat)', resolved: true };
      }

      // Carrying drugs — this is bad. Outcome depends on amount
      const isHeavy = totalDrugs > 30;
      const isMassive = totalDrugs > 100;

      // Chance to talk your way out (lower if carrying more)
      const talkChance = isMassive ? 0.05 : isHeavy ? 0.15 : 0.30;
      const hasFakeId = typeof hasItem === 'function' && hasItem(state, 'fake_id');

      if (hasFakeId && Math.random() < 0.7) {
        // Fake ID saves you
        state.items.splice(state.items.indexOf('fake_id'), 1);
        state.heat += 5;
        return { ...template, msg: '🚔 Cops pull you over! Your fake ID checks out — they let you go. 🪪 (Fake ID consumed, +5 Heat)', resolved: true };
      }

      if (Math.random() < talkChance) {
        // Talked your way out — but they're suspicious
        state.heat += 8;
        return { ...template, msg: '🚔 Pulled over with ' + totalDrugs + ' units on you! Fast talking saved you this time. They didn\'t search the car. (+8 Heat)', resolved: true };
      }

      // They search you and find the drugs
      if (isMassive) {
        // Massive haul — instant felony, lose everything, straight to court
        const totalValue = drugIds.reduce((s, d) => s + (state.inventory[d] * (state.prices[d] || 100)), 0);
        state.heat += 25;
        state.inventory = {};
        const msg = '🚔 BUSTED! Officers find ' + totalDrugs + ' units of drugs worth $' + totalValue.toLocaleString() + '! EVERYTHING confiscated! "Possession with intent to distribute." You\'re going down. (+25 Heat)';
        if (state.investigation) {
          state.investigation.points = Math.min(100, (state.investigation.points || 0) + 20);
          if (typeof updateInvestigation === 'function') updateInvestigation(state, 'arrested', 5);
        }
        return {
          ...template,
          msg: msg,
          resolved: false,
          combatType: 'police',
          enemyCount: count + 2,
          enemyHealth: (count + 2) * 40 + 30,
          enemyDamage: 15 + count * 6,
        };
      } else if (isHeavy) {
        // Heavy carry — lose drugs, big heat spike, possible combat
        const lostPct = 0.5 + Math.random() * 0.3;
        let totalLost = 0;
        for (const d of drugIds) {
          const loss = Math.ceil(state.inventory[d] * lostPct);
          state.inventory[d] -= loss;
          totalLost += loss;
          if (state.inventory[d] <= 0) delete state.inventory[d];
        }
        state.heat += 18;
        return { ...template, msg: '🚔 Pulled over and searched! Found ' + totalDrugs + ' units — confiscated ' + totalLost + '! This is a serious offense. (+18 Heat)', resolved: true };
      } else {
        // Small amount — lose some drugs, moderate heat
        const lostDrug = drugIds[Math.floor(Math.random() * drugIds.length)];
        const lostAmt = Math.ceil(state.inventory[lostDrug] * (0.3 + Math.random() * 0.3));
        const drugName = (DRUGS.find(d => d.id === lostDrug) || {}).name || lostDrug;
        state.inventory[lostDrug] -= lostAmt;
        if (state.inventory[lostDrug] <= 0) delete state.inventory[lostDrug];
        state.heat += 12;
        return { ...template, msg: '🚔 Traffic stop! They found ' + lostAmt + ' ' + drugName + ' on you. Confiscated. "Don\'t let me catch you again." (+12 Heat)', resolved: true };
      }
    }
    case 'gang_encounter': {
      const gangSize = 1 + Math.floor(Math.random() * 4);
      return {
        ...template,
        resolved: false,
        combatType: 'gang',
        enemyCount: gangSize,
        enemyHealth: gangSize * 25,
        enemyDamage: 8 + gangSize * 4,
        demandAmount: Math.round(state.cash * (0.1 + Math.random() * 0.2)),
      };
    }
    case 'weapon_offer': {
      const availableWeapons = WEAPONS.filter(w => w.price > 0 && !state.weapons.includes(w.id));
      if (availableWeapons.length === 0) return null;
      const weapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
      const discount = 0.6 + Math.random() * 0.5;
      const price = Math.round(weapon.price * discount);
      return {
        ...template,
        msg: template.msg.replace('{weapon}', weapon.name).replace('${price}', price.toLocaleString()),
        resolved: false,
        offerType: 'weapon',
        weaponId: weapon.id,
        price,
      };
    }
    case 'coat_offer': {
      const amount = 500 + Math.floor(Math.random() * 2000);
      const price = Math.round(amount * 2);
      return {
        ...template,
        msg: template.msg.replace('{amount}', amount).replace('${price}', price.toLocaleString()),
        resolved: false,
        offerType: 'inventory',
        amount,
        price,
      };
    }
    case 'customs': {
      // Higher chance of getting caught based on heat and inventory
      const invCount = getInventoryCount(state);
      const catchChance = 0.2 + (state.heat / 200) + (invCount / 500);
      if (Math.random() < catchChance) {
        // Caught! Lose some drugs
        const drugIds = Object.keys(state.inventory);
        if (drugIds.length > 0) {
          const lostDrug = drugIds[Math.floor(Math.random() * drugIds.length)];
          const lostAmount = Math.ceil(state.inventory[lostDrug] * (0.3 + Math.random() * 0.4));
          state.inventory[lostDrug] -= lostAmount;
          if (state.inventory[lostDrug] <= 0) delete state.inventory[lostDrug];
          state.heat += 15;
          return { ...template, msg: `🛃 Customs found your ${DRUGS.find(d => d.id === lostDrug).name}! Confiscated ${lostAmount} units! Heat is rising!`, resolved: true };
        }
      }
      return { ...template, msg: '🛃 Customs searched you but found nothing. Close call!', resolved: true };
    }
    case 'tip_off': {
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      return { ...template, msg: template.msg.replace('{drug}', drug.name).replace('{location}', loc.name), resolved: true };
    }
    case 'stowaway': {
      const drugIds = Object.keys(state.inventory);
      if (drugIds.length === 0) return null;
      const drugId = drugIds[Math.floor(Math.random() * drugIds.length)];
      const amount = Math.ceil(state.inventory[drugId] * (0.1 + Math.random() * 0.2));
      state.inventory[drugId] -= amount;
      if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
      return { ...template, msg: template.msg.replace('{amount}', amount).replace('{drug}', DRUGS.find(d => d.id === drugId).name), resolved: true };
    }
    case 'bribe_opportunity': {
      const amount = Math.round(500 + Math.random() * 3000);
      return {
        ...template,
        msg: template.msg.replace('${amount}', amount.toLocaleString()),
        resolved: false,
        offerType: 'bribe',
        price: amount,
      };
    }
    case 'informant': {
      const amount = Math.round(1000 + Math.random() * 5000);
      return {
        ...template,
        msg: template.msg.replace('${amount}', amount.toLocaleString()),
        resolved: false,
        offerType: 'informant',
        price: amount,
      };
    }
    case 'reputation_event': {
      if (state.reputation > 20) {
        state.activeBuffs.push({ type: 'price_discount', value: 0.9, duration: 1 });
        return { ...template, resolved: true };
      }
      return null;
    }
    case 'hurricane': {
      state.transportCostMultiplier = 2;
      state.activeBuffs.push({ type: 'transport_cost', value: 2, duration: 3 });
      return { ...template, resolved: true };
    }
    case 'war_zone': {
      return { ...template, resolved: true };
    }
    default:
      return null;
  }
}

// ============================================================
// COMBAT SYSTEM
// ============================================================
function resolveCombatRound(state, action, event) {
  const weapon = WEAPONS.find(w => w.id === state.equippedWeapon) || WEAPONS[0];
  const results = { playerDamage: 0, enemyDamage: 0, msg: '', resolved: false, goToCourt: false };

  if (action === 'fight') {
    // Player attacks - injured crew don't contribute
    const henchCombat = state.henchmen.reduce((sum, h) => {
      if (h.injured) return sum;
      const type = HENCHMEN_TYPES.find(t => t.id === h.type);
      return sum + (type ? type.combat : 0);
    }, 0);

    const activeCrewCount = state.henchmen.filter(h => !h.injured).length;
    let playerPower = weapon.damage + henchCombat;
    // Perk: muscle +25% combat damage, immortal another +15%
    if (typeof hasPerk === 'function') {
      if (hasPerk(state, 'muscle')) playerPower = Math.round(playerPower * 1.25);
      if (hasPerk(state, 'immortal')) playerPower = Math.round(playerPower * 1.15);
    }
    // Character passive: Veteran +25% combat damage
    const charCombatMod = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'combatDamageMod') : 0;
    if (charCombatMod > 0) playerPower = Math.round(playerPower * (1 + charCombatMod));
    // Skill tree: brawler damage boost
    const damageMod = getSkillEffect(state, 'damageMod');
    if (damageMod > 0) playerPower = Math.round(playerPower * (1 + damageMod));
    // Skill: crew commander boosts crew damage
    const crewDmgMod = getSkillEffect(state, 'crewDamageMod');
    if (crewDmgMod > 0 && henchCombat > 0) playerPower += Math.round(henchCombat * crewDmgMod);
    // Skill: army of one (solo bonus when no crew)
    if (activeCrewCount === 0 && hasSkillEffect(state, 'soloDamageMult')) {
      playerPower = Math.round(weapon.damage * getSkillEffect(state, 'soloDamageMult'));
    }
    let hitChance = weapon.accuracy + (activeCrewCount * 0.05);
    // Scope item: +15% accuracy
    if (hasItem(state, 'scope')) hitChance += 0.15;
    // Skill tree: weapons expert accuracy bonus
    const accMod = getSkillEffect(state, 'accuracyMod');
    if (accMod > 0) hitChance = Math.min(0.95, hitChance + accMod);

    if (Math.random() < hitChance) {
      const damage = Math.round(playerPower * (0.7 + Math.random() * 0.6));
      event.enemyHealth -= damage;
      results.enemyDamage = damage;
      results.msg = `You hit them for ${damage} damage! `;
    } else {
      results.msg = 'You missed! ';
    }

    // Enemy attacks back
    if (event.enemyHealth > 0) {
      const enemyHitChance = 0.4 + (event.enemyCount * 0.05);
      if (Math.random() < enemyHitChance) {
        let damage = Math.round(event.enemyDamage * (0.5 + Math.random() * 0.5) * getNgPlusMod(state, 'enemyDamageMultiplier', 1));

        // Skill tree: thick_skin damage reduction
        const dmgReduce = getSkillEffect(state, 'damageReduction');
        if (dmgReduce > 0) damage = Math.round(damage * (1 - dmgReduce));
        // Consumable body armor
        if (damage > 0 && hasItem(state, 'body_armor')) {
          damage = Math.round(damage * 0.7);
          state.items.splice(state.items.indexOf('body_armor'), 1);
          results.msg += '🦺 Body armor absorbed 30% damage! ';
        }
        // Consumable scope accuracy bonus (applied to player hit chance earlier)
        // Consumable silencer (applied after kill)
        // Skill tree: body_armor block chance
        const blockChance = getSkillEffect(state, 'blockChance');
        if (blockChance > 0 && Math.random() < blockChance) {
          damage = 0;
          results.msg += 'Your armor absorbed the hit! ';
        }

        // 20% chance a crew member takes part of the hit
        const activeCrew = state.henchmen.filter(h => !h.injured);
        if (activeCrew.length > 0 && Math.random() < 0.2) {
          const crewIdx = state.henchmen.indexOf(activeCrew[Math.floor(Math.random() * activeCrew.length)]);
          const absorbed = Math.floor(damage * 0.4);
          damage -= absorbed;
          const injuryMsg = injureCrewMember(state, crewIdx, absorbed);
          if (injuryMsg) results.msg += injuryMsg + ' ';
        }

        state.health -= damage;
        // Skill tree: bulletproof (cannot die in combat)
        if (hasSkillEffect(state, 'deathImmunity') && state.health <= 0) {
          state.health = 1;
          results.msg += 'Bulletproof! You survive by sheer will! ';
        }
        results.playerDamage = damage;
        results.msg += `They hit you for ${damage} damage!`;
      } else {
        results.msg += 'They missed!';
      }
    }

    // Check if enemy is dead
    if (event.enemyHealth <= 0) {
      results.resolved = true;
      results.msg += ' You defeated them!';
      if (typeof adjustRepFromAction === 'function') {
        adjustRepFromAction(state, 'combat_victory');
      } else {
        state.reputation += 5;
      }
      // Silencer: no heat from combat kills
      if (hasItem(state, 'silencer')) {
        results.msg += ' 🔇 Silencer kept things quiet.';
      } else {
        state.heat += 15;
      }
      state.peopleKilled += event.enemyCount;
      // Body disposal system — bodies accumulate from kills
      if (typeof addBodies === 'function') {
        addBodies(state, event.enemyCount, state.currentLocation);
      }
      if (event.combatType === 'police' || event.combatType === 'dea_raid') {
        state.copsKilled = (state.copsKilled || 0) + event.enemyCount;
        if (typeof adjustRepFromAction === 'function') adjustRepFromAction(state, 'cop_kill');
      }

      // Investigation boost for killing cops
      if (event.combatType === 'police' || event.combatType === 'dea_raid') {
        const investMsgs = updateInvestigation(state, 'kill_cop', event.combatType === 'dea_raid' ? 30 : 20);
        if (investMsgs.length > 0) results.msg += ' ' + investMsgs.join(' ');
      }

      // Loot
      if (event.combatType === 'gang') {
        const loot = Math.round(500 + Math.random() * 3000);
        state.cash += loot;
        results.msg += ` You found $${loot.toLocaleString()} on them.`;
      }

      // Faction standing penalty for fighting gang members in their territory
      if (typeof adjustFactionStanding === 'function' && typeof TERRITORY_GANGS !== 'undefined') {
        const combatLoc = event.territoryLocation || state.currentLocation;
        const gangData = TERRITORY_GANGS[combatLoc];
        if (gangData && gangData.factionId) {
          adjustFactionStanding(state, gangData.factionId, -10);
          results.msg += ` ${gangData.name} won't forget this. (-10 standing)`;
        }
      }

      // Territory takeover
      if (event.combatType === 'territory' && event.territoryLocation) {
        const claim = claimTerritory(state, event.territoryLocation);
        results.msg += ` 🏴 ${claim.msg}`;
        results.territoryWon = event.territoryLocation;
      }
    }

    // Check if player died
    if (state.health <= 0) {
      state.health = 0;
      // DEA/police defeat leads to arrest, not death (unless health truly 0)
      if ((event.combatType === 'police' || event.combatType === 'dea_raid') && state.investigation) {
        // Fake ID: avoid arrest
        if (hasItem(state, 'fake_id')) {
          state.items.splice(state.items.indexOf('fake_id'), 1);
          state.health = Math.max(1, state.health);
          results.msg += ' 🪪 Your fake ID fooled the cops! You walked free.';
          results.resolved = true;
          return results;
        }
        state.health = 1; // Barely alive, arrested
        initCourtCase(state);
        results.goToCourt = true;
        results.msg += ' You\'re badly wounded and under arrest!';
        results.resolved = true;
      } else {
        state.gameOver = true;
        results.msg += ' YOU DIED.';
        results.resolved = true;
      }
    }

    // Post-combat consequences: hospital bills, scars
    if (results.playerDamage > 0 && state.health > 0 && state.health < 100) {
      // Hospital bill if health drops below 50
      if (state.health < 50) {
        var hospitalCost = Math.round((100 - state.health) * 100); // $100 per HP missing
        if (typeof hasNPCBenefit === 'function' && hasNPCBenefit(state, 'full_medical')) {
          results.msg += ' 🏥 Dr. Rosa patches you up for free.';
          state.health = Math.min(100, state.health + 20);
        } else {
          results.msg += ' 🏥 Hospital bill: $' + hospitalCost.toLocaleString() + '.';
          state.cash = Math.max(0, state.cash - hospitalCost);
          state.health = Math.min(100, state.health + 15); // Partial healing
        }
      }
      // Permanent scar from near-death (health dropped below 20)
      if (state.health < 20) {
        if (!state.scars) state.scars = [];
        var scarTypes = ['bullet wound', 'knife scar', 'broken ribs', 'cracked skull', 'shattered hand'];
        var scar = scarTypes[Math.floor(Math.random() * scarTypes.length)];
        state.scars.push({ type: scar, day: state.day });
        state.maxHealth = Math.max(50, (state.maxHealth || 100) - 5); // Permanent max health reduction
        results.msg += ' 💉 Permanent injury: ' + scar + '. Max health reduced.';
        if (typeof adjustRep === 'function') adjustRep(state, 'fear', 3); // Scars add fear
      }
    }

  } else if (action === 'run') {
    let escapeChance = 0.4 + (state.henchmen.filter(h => !h.injured).length * 0.1) - (event.enemyCount * 0.05);
    // Character passive: Corner Kid +20% escape chance
    const charEscapeBonus = typeof getCharacterPassiveValue === 'function' ? getCharacterPassiveValue(state, 'escapeChance') : 0;
    if (charEscapeBonus > 0) escapeChance += charEscapeBonus;
    // Consequence engine: ability escape bonus (e.g. Escape Artist)
    const abilityEscapeBonus = typeof getAbilityBonus === 'function' ? getAbilityBonus(state, 'chase_escape') : 0;
    if (abilityEscapeBonus > 0) escapeChance += abilityEscapeBonus / 100;
    if (Math.random() < escapeChance) {
      results.msg = 'You escaped!';
      results.resolved = true;
      // Might drop some drugs
      if (Math.random() < 0.3) {
        const drugIds = Object.keys(state.inventory);
        if (drugIds.length > 0) {
          const drugId = drugIds[Math.floor(Math.random() * drugIds.length)];
          const lost = Math.ceil(state.inventory[drugId] * 0.3);
          state.inventory[drugId] -= lost;
          if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
          results.msg += ` You dropped ${lost} ${DRUGS.find(d => d.id === drugId).name} while running!`;
        }
      }
    } else {
      results.msg = 'Couldn\'t escape! ';
      // Take damage
      const damage = Math.round(event.enemyDamage * 0.5 * (0.5 + Math.random() * 0.5));
      state.health -= damage;
      results.playerDamage = damage;
      results.msg += `They hit you for ${damage} while fleeing!`;
      if (state.health <= 0) {
        state.health = 0;
        if ((event.combatType === 'police' || event.combatType === 'dea_raid') && state.investigation) {
          state.health = 1;
          initCourtCase(state);
          results.goToCourt = true;
          results.msg += ' You\'re caught!';
          results.resolved = true;
        } else {
          state.gameOver = true;
          results.msg += ' YOU DIED.';
          results.resolved = true;
        }
      }
    }

  } else if (action === 'pay') {
    // Pay off gang
    if (event.demandAmount && state.cash >= event.demandAmount) {
      state.cash -= event.demandAmount;
      results.msg = `You paid them $${event.demandAmount.toLocaleString()}. They let you go.`;
      results.resolved = true;
      state.reputation -= 3;
    } else {
      results.msg = 'You can\'t afford their price. Fight or run!';
    }

  } else if (action === 'surrender') {
    results.resolved = true;
    if ((event.combatType === 'police' || event.combatType === 'dea_raid') && state.investigation) {
      // Arrest → court system
      initCourtCase(state);
      results.goToCourt = true;
      state.heat += 20;
      results.msg = 'You surrender to authorities. You\'re under arrest!';
    } else {
      // Fallback for non-investigation games
      const drugIds = Object.keys(state.inventory);
      const hadDrugs = drugIds.length > 0;
      state.inventory = {};
      const fine = Math.round(state.cash * 0.5);
      state.cash -= fine;
      state.heat += 20;
      results.msg = hadDrugs
        ? `Busted! Drugs confiscated and fined $${fine.toLocaleString()}.`
        : `They searched you but found nothing. Fined $${fine.toLocaleString()} for resisting.`;
    }
  }

  return results;
}

// ============================================================
// HOSPITAL
// ============================================================
function visitHospital(state) {
  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  if (!location.hasHospital) return { success: false, msg: 'No hospital in this city.' };
  const damage = state.maxHealth - state.health;
  if (damage <= 0) return { success: false, msg: 'You\'re already at full health.' };
  const cost = damage * 50;
  if (state.cash < cost) {
    const affordable = Math.floor(state.cash / 50);
    state.health += affordable;
    state.cash -= affordable * 50;
    return { success: true, msg: `Patched up ${affordable} HP for $${(affordable * 50).toLocaleString()}. Still hurt.` };
  }
  state.cash -= cost;
  state.health = state.maxHealth;
  return { success: true, msg: `Fully healed for $${cost.toLocaleString()}.` };
}

// ============================================================
// HIRE HENCHMEN
// ============================================================
function hireHenchman(state, typeId) {
  const type = HENCHMEN_TYPES.find(t => t.id === typeId);
  if (!type) return { success: false, msg: 'Unknown henchman type.' };
  if (state.cash < type.cost) return { success: false, msg: 'Can\'t afford this hire.' };
  const maxCrew = typeof getMaxCrewSize === 'function' ? getMaxCrewSize(state) : 4;
  if (state.henchmen.length >= maxCrew) return { success: false, msg: `Max crew size is ${maxCrew}. Need properties or skills for more.` };

  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  if (!location.hasBlackMarket) return { success: false, msg: 'No black market here to find crew.' };

  state.cash -= type.cost;
  const traits = typeof generateCrewTraits === 'function' ? generateCrewTraits(typeId) : [];
  state.henchmen.push({
    type: typeId, name: generateHenchmanName(), loyalty: 100, health: 100, maxHealth: 100, injured: false, daysSincePaid: 0,
    id: typeId, combat: type.combat, carry: type.carry, dailyPay: type.dailyPay,
    rank: 0, daysServed: 0, hiddenLoyalty: 100, betrayalRisk: 0, traits: traits,
    uniqueId: 'crew_' + Math.random().toString(36).substr(2, 8),
  });
  if (typeof adjustRepFromAction === 'function') adjustRepFromAction(state, 'crew_hire');
  return { success: true, msg: `Hired a ${type.name} for $${type.cost.toLocaleString()}. Daily pay: $${type.dailyPay.toLocaleString()}.` };
}

function fireHenchman(state, index) {
  if (index < 0 || index >= state.henchmen.length) return { success: false, msg: 'Invalid crew member.' };
  const h = state.henchmen.splice(index, 1)[0];
  const type = HENCHMEN_TYPES.find(t => t.id === h.type);
  return { success: true, msg: `Fired ${h.name} the ${type.name}.` };
}

function generateHenchmanName() {
  const first = ['Rico', 'Manny', 'Hector', 'Tony', 'Carlos', 'Julio', 'Miguel', 'Diego', 'Santos', 'Vinnie', 'Marco', 'Sal', 'Bruno', 'Luca', 'Remy', 'Dex', 'Snake', 'Razor', 'Ghost', 'Blaze'];
  const last = ['Montana', 'Diaz', 'Escobar', 'Fuentes', 'Cruz', 'Reyes', 'Vega', 'Cortez', 'Mendez', 'Guzman', 'Santana', 'Torres', 'Rossi', 'Corleone', 'LeBlanc', 'Stone', 'Viper', 'Wolf', 'Hawk', 'Steel'];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

// ============================================================
// BUY WEAPONS
// ============================================================
function buyWeapon(state, weaponId) {
  const weapon = WEAPONS.find(w => w.id === weaponId);
  if (!weapon) return { success: false, msg: 'Unknown weapon.' };
  if (state.weapons.includes(weaponId)) return { success: false, msg: 'Already own this weapon.' };

  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  if (!location.hasBlackMarket) return { success: false, msg: 'No black market here.' };
  if (state.cash < weapon.price) return { success: false, msg: 'Can\'t afford it.' };
  if (weapon.space > getFreeSpace(state)) return { success: false, msg: 'Not enough inventory space.' };

  state.cash -= weapon.price;
  state.weapons.push(weaponId);
  return { success: true, msg: `Bought ${weapon.name} for $${weapon.price.toLocaleString()}.` };
}

// ============================================================
// END GAME / SCORING
// ============================================================
function endGame(state) {
  state.gameOver = true;

  // Calculate net worth
  const netWorth = state.cash + state.bank - state.debt;

  // Bonus for inventory (at half average price)
  let inventoryValue = 0;
  for (const [drugId, amount] of Object.entries(state.inventory)) {
    const drug = DRUGS.find(d => d.id === drugId);
    if (drug) inventoryValue += ((drug.minPrice + drug.maxPrice) / 4) * amount;
  }
  for (const [drugId, amount] of Object.entries(state.stash)) {
    const drug = DRUGS.find(d => d.id === drugId);
    if (drug) inventoryValue += ((drug.minPrice + drug.maxPrice) / 4) * amount;
  }

  const finalScore = netWorth + inventoryValue;
  state.finalScore = finalScore;
  state.gameWon = state.debt <= 0 && finalScore > 0;

  // Determine rank
  if (finalScore < 0) state.rank = 'Dead Beat';
  else if (finalScore < 10000) state.rank = 'Street Corner Punk';
  else if (finalScore < 50000) state.rank = 'Small-Time Pusher';
  else if (finalScore < 200000) state.rank = 'Mid-Level Dealer';
  else if (finalScore < 500000) state.rank = 'Connected Player';
  else if (finalScore < 1000000) state.rank = 'Regional Kingpin';
  else if (finalScore < 5000000) state.rank = 'International Trafficker';
  else if (finalScore < 20000000) state.rank = 'Cartel Boss';
  else if (finalScore < 50000000) state.rank = 'Drug Lord';
  else state.rank = 'The Scarface';

  // Determine campaign ending
  if (typeof determineEnding === 'function' && state.campaign) {
    const ending = determineEnding(state);
    if (ending) {
      state.campaign.endingId = (ending.ending || ending).id;
    }
  }

  // Save high score
  const entry = { score: finalScore, rank: state.rank, date: new Date().toISOString().slice(0, 10), cities: state.citiesVisited.length };
  state.highScores.push(entry);
  state.highScores.sort((a, b) => b.score - a.score);
  state.highScores = state.highScores.slice(0, 10);
  try { localStorage.setItem('drugwars_highscores', JSON.stringify(state.highScores)); } catch (e) {}

  // Persist global achievements for meta-progression (New Game+ unlock)
  try {
    const globalAchievements = JSON.parse(localStorage.getItem('drugwars_achievements') || '[]');
    if (state.campaign && state.campaign.endingId && !globalAchievements.includes('game_beaten')) {
      globalAchievements.push('game_beaten');
      localStorage.setItem('drugwars_achievements', JSON.stringify(globalAchievements));
    }
    if (state.newGamePlus && state.newGamePlus.active && state.campaign && state.campaign.endingId) {
      const ngTier = state.newGamePlus.tier || 1;
      const tierAchievement = `ng_plus_tier_${ngTier}_complete`;
      if (!globalAchievements.includes(tierAchievement)) {
        globalAchievements.push(tierAchievement);
      }
      if (!globalAchievements.includes('ng_plus_complete')) {
        globalAchievements.push('ng_plus_complete');
      }
      localStorage.setItem('drugwars_achievements', JSON.stringify(globalAchievements));
    }
    // Track all unique endings achieved for the "all_endings" achievement
    if (state.campaign && state.campaign.endingId) {
      const endingsKey = 'drugwars_endings';
      const endings = JSON.parse(localStorage.getItem(endingsKey) || '[]');
      if (!endings.includes(state.campaign.endingId)) {
        endings.push(state.campaign.endingId);
        localStorage.setItem(endingsKey, JSON.stringify(endings));
      }
    }
    // Persist NG+ tier completion meta
    if (state.newGamePlus && state.newGamePlus.active) {
      const ngPlusMeta = JSON.parse(localStorage.getItem('drugwars_ngplus_meta') || '{}');
      const ngTier = state.newGamePlus.tier || 1;
      ngPlusMeta.highestTierCompleted = Math.max(ngPlusMeta.highestTierCompleted || 0, ngTier);
      ngPlusMeta.totalCompletions = (ngPlusMeta.totalCompletions || 0) + 1;
      if (state.campaign && state.campaign.endingId) {
        if (!ngPlusMeta.completedEndings) ngPlusMeta.completedEndings = [];
        if (!ngPlusMeta.completedEndings.includes(state.campaign.endingId)) {
          ngPlusMeta.completedEndings.push(state.campaign.endingId);
        }
      }
      localStorage.setItem('drugwars_ngplus_meta', JSON.stringify(ngPlusMeta));
    }
  } catch (e) {}

  return state;
}

// ============================================================
// ACCEPT OFFERS
// ============================================================
function acceptOffer(state, event) {
  if (event.offerType === 'weapon') {
    if (state.cash < event.price) return { success: false, msg: 'Can\'t afford it.' };
    const weapon = WEAPONS.find(w => w.id === event.weaponId);
    if (weapon.space > getFreeSpace(state)) return { success: false, msg: 'Not enough space.' };
    state.cash -= event.price;
    state.weapons.push(event.weaponId);
    return { success: true, msg: `Bought ${weapon.name} for $${event.price.toLocaleString()}.` };
  }
  if (event.offerType === 'inventory') {
    if (state.cash < event.price) return { success: false, msg: 'Can\'t afford it.' };
    state.cash -= event.price;
    state.inventorySpace += event.amount;
    return { success: true, msg: `Inventory expanded by ${event.amount} slots!` };
  }
  if (event.offerType === 'bribe') {
    if (state.cash < event.price) return { success: false, msg: 'Can\'t afford the bribe.' };
    state.cash -= event.price;
    state.heat = Math.max(0, state.heat - 25);
    return { success: true, msg: 'Official pocketed the cash. Your heat has dropped.' };
  }
  if (event.offerType === 'informant') {
    if (state.cash < event.price) return { success: false, msg: 'Can\'t afford the tip.' };
    state.cash -= event.price;
    // Reveal a future price spike
    const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    return { success: true, msg: `"Word on the street... ${drug.name} is about to blow up in ${loc.name}. Move fast."` };
  }
  return { success: false, msg: 'Nothing to accept.' };
}

// ============================================================
// BUFF MANAGEMENT (see processBuffs below for main implementation)
// ============================================================

// ============================================================
// PRICE HISTORY (for stock charts)
// ============================================================
function recordPriceHistory(state) {
  if (!state.priceHistory) state.priceHistory = {};
  const location = LOCATIONS.find(l => l.id === state.currentLocation);

  for (const drug of DRUGS) {
    if (!state.priceHistory[drug.id]) state.priceHistory[drug.id] = [];

    const price = state.prices[drug.id];
    const event = state.priceEvents.find(e => e.drugId === drug.id);

    // If price is null (unavailable), use last known price or interpolated midpoint
    let recordedPrice = price;
    let interpolated = false;
    if (recordedPrice === null || recordedPrice === undefined) {
      const hist = state.priceHistory[drug.id];
      const lastKnown = [...hist].reverse().find(h => !h.interpolated);
      if (lastKnown) {
        recordedPrice = lastKnown.price;
      } else {
        recordedPrice = Math.round((drug.minPrice + drug.maxPrice) / 2 * (location ? location.priceModifier : 1));
      }
      interpolated = true;
    }

    state.priceHistory[drug.id].push({
      day: state.day,
      price: recordedPrice,
      location: state.currentLocation,
      interpolated,
      event: event ? { effect: event.effect, msg: event.msg } : null,
    });

    if (state.priceHistory[drug.id].length > 30) {
      state.priceHistory[drug.id].shift();
    }
  }
}

function seedPriceHistory(state) {
  // Create a day-0 baseline so sparklines work from turn 1
  if (!state.priceHistory) state.priceHistory = {};
  const location = LOCATIONS.find(l => l.id === state.currentLocation);

  for (const drug of DRUGS) {
    if (!state.priceHistory[drug.id]) state.priceHistory[drug.id] = [];
    if (state.priceHistory[drug.id].length === 0) {
      const basePrice = Math.round((drug.minPrice + drug.maxPrice) / 2 * (location ? location.priceModifier : 1));
      state.priceHistory[drug.id].push({
        day: 0,
        price: basePrice,
        location: state.currentLocation,
        interpolated: true,
        event: null,
      });
    }
  }
}

// ============================================================
// INVESTIGATION ENGINE
// ============================================================
function getInvestigationLevel(points) {
  const t = INVESTIGATION_CONFIG.thresholds;
  for (let i = t.length - 1; i >= 0; i--) {
    if (points >= t[i]) return i;
  }
  return 0;
}

function updateInvestigation(state, trigger, amount) {
  if (!state.investigation) return [];
  const messages = [];

  // Lawyer reduces investigation gain by 40%
  const hasLawyer = state.henchmen.some(h => h.type === 'lawyer' && !h.injured);
  if (hasLawyer && amount > 0) {
    amount = Math.round(amount * (1 - INVESTIGATION_CONFIG.lawyerReduction));
  }
  // Perk: investigation_shield -30%, ghost -50%, immortal -20%
  if (amount > 0 && typeof hasPerk === 'function') {
    if (hasPerk(state, 'investigation_shield')) amount = Math.round(amount * 0.70);
    if (hasPerk(state, 'ghost')) amount = Math.round(amount * 0.50);
    if (hasPerk(state, 'immortal')) amount = Math.round(amount * 0.80);
    amount = Math.max(1, amount); // minimum 1 if any gain
  }

  const oldLevel = state.investigation.level;
  state.investigation.points = Math.min(100, Math.max(0, state.investigation.points + amount));
  state.investigation.level = getInvestigationLevel(state.investigation.points);

  // Check for level-up events
  if (state.investigation.level > oldLevel) {
    const info = INVESTIGATION_LEVELS[state.investigation.level];
    messages.push(`🔍 Investigation escalated: ${info.emoji} ${info.name} — ${info.desc}`);
  }

  return messages;
}

function processInvestigationDaily(state) {
  if (!state.investigation) return [];
  const messages = [];

  // Decay when not dealing
  state.investigation.daysSinceDealing++;
  if (state.investigation.daysSinceDealing > 1) {
    state.investigation.points = Math.max(0, state.investigation.points - INVESTIGATION_CONFIG.decayPerIdleDay);
    state.investigation.level = getInvestigationLevel(state.investigation.points);
  }

  // High heat increases investigation
  if (state.heat > 70) {
    const msgs = updateInvestigation(state, 'high_heat', 3);
    messages.push(...msgs);
  }

  // Level-based consequences
  const level = state.investigation.level;

  if (level >= 2 && Math.random() < 0.10) {
    messages.push('🕵️ Undercover agents have been spotted watching your movements.');
  }

  if (level >= 3 && Math.random() < 0.12) {
    // Asset seizure attempt
    const hasLawyer = state.henchmen.some(h => h.type === 'lawyer' && !h.injured);
    if (hasLawyer) {
      messages.push('💼 DEA attempted asset seizure — your lawyer blocked it!');
    } else {
      const seized = Math.round(state.bank * (0.10 + Math.random() * 0.10));
      if (seized > 0) {
        state.bank -= seized;
        messages.push(`🏦 DEA seized $${seized.toLocaleString()} from your bank accounts!`);
      }
    }
  }

  if (level >= 4 && Math.random() < 0.15) {
    messages.push('📞 Phone tapped! Feds are listening to your calls.');
  }

  return messages;
}

function createDEARaidEvent(state) {
  const agentCount = 4 + Math.floor(Math.random() * 5);
  state.heat = Math.min(100, state.heat + 20);
  return {
    id: 'dea_raid',
    msg: `🚁 DEA RAID! ${agentCount} federal agents storm your position!`,
    chance: 1,
    type: 'combat',
    resolved: false,
    combatType: 'dea_raid',
    enemyCount: agentCount,
    enemyHealth: agentCount * 50 + 100,
    enemyDamage: 20 + agentCount * 5,
  };
}

// ============================================================
// COURT SYSTEM
// ============================================================
function initCourtCase(state) {
  // Build charges with severity tags for penalty calculation
  const charges = [];
  const chargeSeverity = []; // tracks penalty types
  const drugIds = Object.keys(state.inventory);
  let totalUnits = 0;
  let hasPremium = false;

  for (const id of drugIds) {
    const drug = DRUGS.find(d => d.id === id);
    if (drug) {
      const qty = state.inventory[id];
      totalUnits += qty;
      const isPremium = PREMIUM_DRUGS.includes(id);
      if (isPremium) hasPremium = true;

      if (qty > 20) {
        charges.push(`Possession w/ Intent to Distribute: ${drug.name} (${qty} units)`);
        chargeSeverity.push('possession_large');
      } else if (isPremium) {
        charges.push(`Class A Possession: ${drug.name} (${qty} units)`);
        chargeSeverity.push('possession_premium');
      } else {
        charges.push(`Possession of ${drug.name} (${qty} units)`);
        chargeSeverity.push('possession');
      }
    }
  }
  if (charges.length === 0) charges.push('Racketeering and conspiracy');
  if (state.investigation.level >= 4) {
    charges.push('RICO Act violations');
    chargeSeverity.push('rico');
  }
  if (state.copsKilled > 0) {
    charges.push(`${state.copsKilled} count(s) of murder of law enforcement`);
    chargeSeverity.push('cop_killing');
  } else if (state.peopleKilled > 0) {
    charges.push(`${state.peopleKilled} count(s) of manslaughter`);
    for (let i = 0; i < Math.min(state.peopleKilled, 3); i++) chargeSeverity.push('manslaughter');
  }

  // Calculate worst severity multiplier from all charges
  let worstPrisonMod = 1.0;
  let worstForfeitMod = 1.0;
  for (const sev of chargeSeverity) {
    const penalty = CHARGE_PENALTIES[sev];
    if (penalty) {
      worstPrisonMod = Math.max(worstPrisonMod, penalty.prisonMod);
      worstForfeitMod = Math.max(worstForfeitMod, penalty.forfeitMod);
    }
  }

  // Check for available fall guys
  const fallGuyIndex = state.henchmen.findIndex(h => h.type === 'fall_guy' && !h.injured);

  // Build evidence strength based on investigation level and player history
  var evidenceStrength = 0;
  evidenceStrength += state.investigation.level * 15; // 0-75 from investigation
  evidenceStrength += Math.min(20, totalUnits * 0.5); // caught with drugs
  if (state.copsKilled > 0) evidenceStrength += 20;
  if (state.heatSystem && state.heatSystem.wiretaps && state.heatSystem.wiretaps.length > 0) evidenceStrength += 15; // wiretap evidence
  if (state.bodies_state && state.bodies_state.discoveredBodies > 0) evidenceStrength += state.bodies_state.discoveredBodies * 5;
  evidenceStrength = Math.min(100, evidenceStrength);

  // Generate witnesses based on evidence
  var witnesses = [];
  if (state.investigation.level >= 2) witnesses.push({ name: 'Undercover Agent Martinez', type: 'undercover', strength: 20 });
  if (state.investigation.level >= 3) witnesses.push({ name: 'Confidential Informant', type: 'informant', strength: 15 });
  if (state.copsKilled > 0) witnesses.push({ name: 'Officer body cam footage', type: 'forensic', strength: 25 });
  if (state.bodies_state && state.bodies_state.discoveredBodies > 0) witnesses.push({ name: 'Forensic evidence from crime scenes', type: 'forensic', strength: 15 });
  if (hasPremium) witnesses.push({ name: 'Lab analysis of seized substances', type: 'forensic', strength: 10 });
  // Random civilian witness (30% chance)
  if (Math.random() < 0.3) witnesses.push({ name: 'Anonymous civilian eyewitness', type: 'civilian', strength: 10 });
  // Disloyal crew member might testify (check for low loyalty)
  var potentialSnitch = state.henchmen.find(function(h) { return h.loyalty < 30 && !h.injured; });
  if (potentialSnitch) {
    witnesses.push({ name: potentialSnitch.name + ' (your own crew)', type: 'insider', strength: 25 });
    evidenceStrength = Math.min(100, evidenceStrength + 15);
  }

  state.courtCase = {
    charges,
    chargeSeverity,
    worstPrisonMod,
    worstForfeitMod,
    totalUnitsConfiscated: totalUnits,
    hasFallGuy: fallGuyIndex >= 0,
    fallGuyUsed: false,
    contactsUsed: [],
    totalSuccessChance: 0,
    resolved: false,
    verdict: null,
    sentence: null,
    // NEW: evidence and witness system
    evidenceStrength: evidenceStrength,
    witnesses: witnesses,
    witnessesIntimidated: [],
    pleaDealOffered: evidenceStrength > 50, // DA offers plea if case is strong
    pleaDealAccepted: false,
    pleaDealReduction: 0.4 + Math.random() * 0.2, // 40-60% sentence reduction
  };

  // Confiscate inventory on arrest
  state.inventory = {};

  return state.courtCase;
}

function getAvailableContacts(state) {
  if (!state.courtCase) return [];
  const hasLawyer = state.henchmen.some(h => h.type === 'lawyer' && !h.injured);

  return COURT_CONTACTS.map(contact => {
    // Check requirements
    const meetsRequirement = !contact.requires || state.henchmen.some(h => h.type === contact.requires && !h.injured);
    const alreadyUsed = state.courtCase.contactsUsed.includes(contact.id);

    // Calculate cost (higher investigation = more expensive)
    const costScale = 1 + (state.investigation.level * 0.15);
    let cost = Math.round((contact.costRange[0] + Math.random() * (contact.costRange[1] - contact.costRange[0])) * costScale);
    // Perk: godfather -20% court costs, immortal -10%
    if (typeof hasPerk === 'function') {
      if (hasPerk(state, 'godfather')) cost = Math.round(cost * 0.80);
      if (hasPerk(state, 'immortal')) cost = Math.round(cost * 0.90);
    }

    // Calculate success chance
    let chance = contact.baseChance[0] + Math.random() * (contact.baseChance[1] - contact.baseChance[0]);
    if (hasLawyer) chance = Math.min(0.95, chance + 0.10);
    if (state.investigation.level >= 5) chance = Math.max(0.05, chance - 0.05);
    // Perk: godfather +15% court success, immortal +10%
    if (typeof hasPerk === 'function') {
      if (hasPerk(state, 'godfather')) chance = Math.min(0.95, chance + 0.15);
      if (hasPerk(state, 'immortal')) chance = Math.min(0.95, chance + 0.10);
    }

    return {
      ...contact,
      computedCost: cost,
      computedChance: Math.round(chance * 100) / 100,
      canAfford: state.cash >= cost,
      meetsRequirement,
      alreadyUsed,
      available: meetsRequirement && !alreadyUsed && state.cash >= cost,
    };
  });
}

function payCourtContact(state, contactId) {
  if (!state.courtCase) return { success: false, msg: 'No active court case.' };

  const contacts = getAvailableContacts(state);
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return { success: false, msg: 'Contact not found.' };
  if (contact.alreadyUsed) return { success: false, msg: 'Already used this contact.' };
  if (!contact.meetsRequirement) return { success: false, msg: `Requires a ${contact.requires} on your crew.` };
  if (!contact.canAfford) return { success: false, msg: 'Can\'t afford this contact.' };

  state.cash -= contact.computedCost;
  state.courtCase.contactsUsed.push(contactId);

  // FBI deal special effects
  if (contactId === 'fbi_deal') {
    state.reputation = Math.max(-100, state.reputation - 50);
    // Increase police at a random location
    state.messageLog.push('🐀 You turned informant. Your reputation is destroyed.');
  }

  // Recalculate combined probability: 1 - product(1 - each_chance)
  const usedContacts = contacts.filter(c => state.courtCase.contactsUsed.includes(c.id));
  let failProb = 1;
  for (const c of usedContacts) {
    failProb *= (1 - c.computedChance);
  }
  state.courtCase.totalSuccessChance = Math.round((1 - failProb) * 100) / 100;

  return {
    success: true,
    msg: `Paid ${contact.name} $${contact.computedCost.toLocaleString()} — ${Math.round(contact.computedChance * 100)}% individual chance.`,
    combinedChance: state.courtCase.totalSuccessChance,
  };
}

function useFallGuy(state) {
  if (!state.courtCase || state.courtCase.fallGuyUsed) return { success: false, msg: 'No fall guy available.' };
  const fgIndex = state.henchmen.findIndex(h => h.type === 'fall_guy' && !h.injured);
  if (fgIndex < 0) return { success: false, msg: 'No fall guy on your crew.' };

  // Fall guy takes the rap — removed from crew permanently
  const fallGuy = state.henchmen[fgIndex];
  state.henchmen.splice(fgIndex, 1);
  state.courtCase.fallGuyUsed = true;
  state.courtCase.resolved = true;
  state.courtCase.verdict = 'fall_guy';

  // You still lose inventory (already confiscated in initCourtCase)
  // Small investigation reduction — cops think they got their guy
  state.investigation.points = Math.max(0, state.investigation.points - 20);
  state.investigation.level = getInvestigationLevel(state.investigation.points);

  // Slight reputation boost — you're untouchable
  state.reputation = Math.min(100, state.reputation + 10);

  state.courtCase.sentence = `Your fall guy "${fallGuy.name || 'Fall Guy'}" took the rap. Case closed. You walk free.`;

  return {
    success: true,
    msg: `Your fall guy confessed to everything. The feds bought it. You're free to go.`,
    fallGuyName: fallGuy.name || 'Fall Guy',
  };
}

function acceptPleaDeal(state) {
  if (!state.courtCase || !state.courtCase.pleaDealOffered || state.courtCase.pleaDealAccepted) {
    return { success: false, msg: 'No plea deal available.' };
  }

  state.courtCase.pleaDealAccepted = true;
  state.courtCase.resolved = true;
  state.courtCase.verdict = 'plea_deal';
  state.investigation.timesArrested++;

  // Reduced sentence
  var offenseNum = Math.min(state.investigation.timesArrested, 4);
  var sentence = COURT_SENTENCES[offenseNum];
  var basePrison = sentence.prisonDays[0] + Math.floor(Math.random() * (sentence.prisonDays[1] - sentence.prisonDays[0]));
  var prisonDays = Math.round(basePrison * state.courtCase.worstPrisonMod * state.courtCase.pleaDealReduction);
  prisonDays = Math.max(5, prisonDays); // Minimum 5 days

  // Reduced asset forfeiture
  var baseForfeit = sentence.assetForfeiture[0];
  var forfeitRate = Math.min(0.5, baseForfeit * state.courtCase.worstForfeitMod * 0.5); // Half the forfeiture
  var cashLost = Math.round(state.cash * forfeitRate);
  var bankLost = Math.round(state.bank * forfeitRate);
  state.cash = Math.max(0, state.cash - cashLost);
  state.bank = Math.max(0, state.bank - bankLost);

  // Must cooperate - provide intel on one faction
  if (typeof adjustRep === 'function') adjustRep(state, 'trust', -15);
  if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', -10);

  // Serve time
  state.day += prisonDays;
  for (var i = 0; i < prisonDays; i++) {
    state.debt = Math.round(state.debt * (1 + GAME_CONFIG.debtInterestRate));
  }

  // Mark as snitch if faction intel given
  if (typeof applyConsequences === 'function') {
    applyConsequences(state, {
      traits: { snitch: 1, police_cooperator: true },
      removeTraits: ['trusted_by_cops'],
      message: 'Word got out that you took a deal. The streets remember.'
    }, 'plea_deal', 'accepted');
  }

  var penalties = [];
  penalties.push(prisonDays + ' days (plea deal, reduced from ' + Math.round(basePrison * state.courtCase.worstPrisonMod) + ')');
  penalties.push('$' + (cashLost + bankLost).toLocaleString() + ' seized (' + Math.round(forfeitRate * 100) + '%)');
  penalties.push('Reputation damaged — known cooperator');

  state.courtCase.sentence = penalties.join('. ') + '.';
  state.courtCase.penalties = penalties;

  return {
    success: true,
    verdict: 'plea_deal',
    msg: 'PLEA DEAL ACCEPTED. Reduced sentence: ' + prisonDays + ' days. But the streets know you talked.',
    prisonDays: prisonDays,
    penalties: penalties
  };
}

function intimidateWitness(state, witnessIndex) {
  if (!state.courtCase || !state.courtCase.witnesses[witnessIndex]) {
    return { success: false, msg: 'Invalid witness.' };
  }
  var witness = state.courtCase.witnesses[witnessIndex];
  if (state.courtCase.witnessesIntimidated.includes(witnessIndex)) {
    return { success: false, msg: 'Already dealt with this witness.' };
  }

  // Requires enforcer or assassin crew
  var hasEnforcer = state.henchmen.some(function(h) { return (h.type === 'enforcer' || h.type === 'assassin') && !h.injured; });
  if (!hasEnforcer) {
    return { success: false, msg: 'Need an enforcer or assassin to intimidate witnesses.' };
  }

  // Success chance based on witness type
  var chance = 0.6;
  if (witness.type === 'forensic') chance = 0.3; // Can't intimidate lab results
  if (witness.type === 'insider') chance = 0.8; // Your own crew is easier
  if (witness.type === 'undercover') chance = 0.4;

  // Fear reputation helps
  if (state.rep && state.rep.fear > 40) chance += 0.15;

  var success = Math.random() < chance;
  state.courtCase.witnessesIntimidated.push(witnessIndex);

  if (success) {
    state.courtCase.evidenceStrength = Math.max(0, state.courtCase.evidenceStrength - witness.strength);
    state.heat = Math.min(100, (state.heat || 0) + 5);
    if (typeof adjustRep === 'function') adjustRep(state, 'fear', 3);
    return {
      success: true,
      msg: witness.name + ' has been... persuaded to reconsider their testimony. Evidence weakened.',
      evidenceReduction: witness.strength
    };
  } else {
    state.heat = Math.min(100, (state.heat || 0) + 10);
    state.courtCase.evidenceStrength = Math.min(100, state.courtCase.evidenceStrength + 5); // Backfires
    return {
      success: false,
      msg: 'Attempt to intimidate ' + witness.name + ' FAILED. They reported it to the DA. Case just got stronger.'
    };
  }
}

function resolveCourtCase(state) {
  if (!state.courtCase) return { verdict: 'error', msg: 'No active case.' };

  const roll = Math.random();
  // Evidence strength reduces your success chance
  var evidencePenalty = (state.courtCase.evidenceStrength || 0) / 200; // 0-0.5 penalty
  const chance = Math.max(0.02, state.courtCase.totalSuccessChance - evidencePenalty);
  const notGuilty = roll < chance;

  state.investigation.timesArrested++;

  if (notGuilty) {
    // Freedom
    state.courtCase.verdict = 'not_guilty';
    // Drop investigation by 1 level
    const thresholds = INVESTIGATION_CONFIG.thresholds;
    const currentLevel = state.investigation.level;
    if (currentLevel > 0) {
      state.investigation.points = thresholds[currentLevel - 1];
    } else {
      state.investigation.points = 0;
    }
    state.investigation.level = getInvestigationLevel(state.investigation.points);
    return {
      verdict: 'not_guilty',
      msg: 'NOT GUILTY! You walk free... this time.',
      roll: Math.round(roll * 100),
      needed: Math.round(chance * 100),
    };
  } else {
    // Guilty
    state.courtCase.verdict = 'guilty';
    const offenseNum = Math.min(state.investigation.timesArrested, 4);
    const sentence = COURT_SENTENCES[offenseNum];

    if (sentence.gameOver) {
      state.gameOver = true;
      state.courtCase.sentence = sentence.label;
      return {
        verdict: 'guilty',
        msg: `GUILTY! ${sentence.label}. Your empire crumbles.`,
        roll: Math.round(roll * 100),
        needed: Math.round(chance * 100),
        gameOver: true,
      };
    }

    // Prison time — scaled by charge severity
    let prisonMod = state.courtCase.worstPrisonMod || 1.0;
    // Character flag: onProbation = double sentence (Ex-Con penalty)
    if (typeof hasCharacterFlag === 'function' && hasCharacterFlag(state, 'onProbation')) {
      prisonMod *= 2.0;
    }
    // Character flag: prisonRecord = +25% sentence (repeat offender)
    if (typeof hasCharacterFlag === 'function' && hasCharacterFlag(state, 'prisonRecord') && state.investigation && state.investigation.timesArrested > 1) {
      prisonMod *= 1.25;
    }
    // Character flag: cleanRecord = -30% first offense (Dropout/Cleanskin benefit)
    if (typeof hasCharacterFlag === 'function' && hasCharacterFlag(state, 'cleanRecord') && state.investigation && state.investigation.timesArrested <= 1) {
      prisonMod *= 0.7;
    }
    // Character flag: legitimateCover = -20% sentence (Cleanskin has cover story)
    if (typeof hasCharacterFlag === 'function' && hasCharacterFlag(state, 'legitimateCover')) {
      prisonMod *= 0.8;
    }
    const basePrison = sentence.prisonDays[0] + Math.floor(Math.random() * (sentence.prisonDays[1] - sentence.prisonDays[0]));
    const prisonDays = Math.round(basePrison * prisonMod);

    // === SIMULATE PRISON TIME (cascade effects) ===
    // Each day in prison: crew drains cash, businesses run without you, rivals expand
    for (var pd = 0; pd < prisonDays; pd++) {
      state.day++;
      // Crew still needs to be paid (they run things while you're inside)
      var dailyCrewCost = 0;
      for (var ci = 0; ci < state.henchmen.length; ci++) {
        var ht = HENCHMEN_TYPES.find(function(t) { return t.id === state.henchmen[ci].type; });
        if (ht) dailyCrewCost += ht.dailyPay;
      }
      state.cash = Math.max(0, state.cash - dailyCrewCost);
      // If can't pay crew, they start leaving
      if (state.cash <= 0 && state.henchmen.length > 0 && Math.random() < 0.15) {
        state.henchmen.pop(); // Least loyal leaves
      }
      // Debt compounds
      state.debt = Math.round(state.debt * (1 + GAME_CONFIG.debtInterestRate));
      state.bank = Math.round(state.bank * (1 + GAME_CONFIG.bankInterestRate));
      // Business income trickles in (50% without you there)
      if (state.frontBusinesses) {
        for (var bi = 0; bi < state.frontBusinesses.length; bi++) {
          var bdef = typeof FRONT_BUSINESSES !== 'undefined' ? FRONT_BUSINESSES.find(function(b) { return b.id === state.frontBusinesses[bi].id; }) : null;
          if (bdef) state.cash += Math.round((bdef.dailyIncome || 100) * 0.5);
        }
      }
      // Rival factions expand into your territory (5% per day)
      if (state.territory && Math.random() < 0.05) {
        var controlled = Object.keys(state.territory).filter(function(k) { return state.territory[k].controlled; });
        if (controlled.length > 0) {
          var lost = controlled[Math.floor(Math.random() * controlled.length)];
          state.territory[lost].controlled = false;
        }
      }
      // Child support still owed
      if (state.relationships && state.relationships.children) {
        state.relationships.totalChildSupport = (state.relationships.totalChildSupport || 0) + state.relationships.children.length * 500;
      }
    }

    // Asset forfeiture — scaled by charge severity
    const forfeitMod = state.courtCase.worstForfeitMod || 1.0;
    const baseForfeit = sentence.assetForfeiture[0] + Math.random() * (sentence.assetForfeiture[1] - sentence.assetForfeiture[0]);
    const forfeitRate = Math.min(0.95, baseForfeit * forfeitMod); // cap at 95%
    const cashLost = Math.round(state.cash * forfeitRate);
    const bankLost = Math.round(state.bank * forfeitRate);
    state.cash -= cashLost;
    state.bank -= bankLost;

    // Lose some henchmen in prison (they scatter)
    const crewLost = Math.floor(state.henchmen.length * 0.3);
    for (let i = 0; i < crewLost; i++) {
      const idx = Math.floor(Math.random() * state.henchmen.length);
      state.henchmen.splice(idx, 1);
    }

    // Remaining crew lose loyalty from being abandoned
    for (const h of state.henchmen) {
      h.loyalty = Math.max(0, h.loyalty - prisonDays * 3);
    }

    // (Interest/crew/territory already simulated in prison loop above)

    // Business/property seizure on conviction (RICO charges = lose fronts)
    var businessesSeized = 0;
    if (state.courtCase.chargeSeverity.includes('rico') && state.frontBusinesses) {
      // RICO: feds seize ALL front businesses
      businessesSeized = state.frontBusinesses.length;
      state.frontBusinesses = [];
    } else if (forfeitRate > 0.5 && state.frontBusinesses && state.frontBusinesses.length > 0) {
      // High forfeiture: lose some businesses
      var bizToLose = Math.ceil(state.frontBusinesses.length * forfeitRate * 0.5);
      for (var bi = 0; bi < bizToLose && state.frontBusinesses.length > 0; bi++) {
        state.frontBusinesses.pop();
        businessesSeized++;
      }
    }

    // Territory lost while in prison (rivals move in)
    var territoriesLost = 0;
    if (state.territory && prisonDays > 30) {
      var terrKeys = Object.keys(state.territory).filter(function(k) { return state.territory[k].controlled; });
      var terrToLose = Math.min(terrKeys.length, Math.floor(prisonDays / 60)); // Lose 1 per 60 days
      for (var ti = 0; ti < terrToLose; ti++) {
        var lostTerr = terrKeys[ti];
        state.territory[lostTerr].controlled = false;
        territoriesLost++;
      }
    }

    // Build detailed sentence breakdown
    const penalties = [];
    penalties.push(`${prisonDays} days in federal prison`);
    penalties.push(`$${(cashLost + bankLost).toLocaleString()} in assets seized (${Math.round(forfeitRate * 100)}%)`);
    if (crewLost > 0) penalties.push(`${crewLost} crew member${crewLost > 1 ? 's' : ''} scattered`);
    if (businessesSeized > 0) penalties.push(`${businessesSeized} front business${businessesSeized > 1 ? 'es' : ''} seized by feds`);
    if (territoriesLost > 0) penalties.push(`${territoriesLost} territor${territoriesLost > 1 ? 'ies' : 'y'} lost to rivals`);
    if (state.courtCase.totalUnitsConfiscated > 0) penalties.push(`${state.courtCase.totalUnitsConfiscated} units of drugs confiscated`);

    const sentenceText = penalties.join('. ') + '.';
    state.courtCase.sentence = sentenceText;
    state.courtCase.penalties = penalties;

    // Check if time ran out in prison
    if (!GAME_CONFIG.endlessMode && state.day > GAME_CONFIG.totalDays) {
      endGame(state);
    }

    return {
      verdict: 'guilty',
      msg: `GUILTY! ${sentence.label}. ${sentenceText}`,
      prisonDays,
      assetsSeized: cashLost + bankLost,
      crewLost,
      penalties,
      roll: Math.round(roll * 100),
      needed: Math.round(chance * 100),
    };
  }
}

// ============================================================
// TERRITORY SYSTEM
// ============================================================
function getTerritoryGang(locationId) {
  return TERRITORY_GANGS[locationId] || null;
}

function isTerritory(state, locationId) {
  return state.territory && state.territory[locationId] && state.territory[locationId].controlled;
}

function getControlledTerritories(state) {
  if (!state.territory) return [];
  return Object.keys(state.territory).filter(id => state.territory[id].controlled);
}

function challengeTerritory(state) {
  const locId = state.currentLocation;
  if (isTerritory(state, locId)) return { success: false, msg: 'You already control this territory.' };

  const gang = getTerritoryGang(locId);
  if (!gang) return { success: false, msg: 'No gang controls this area.' };

  // Need at least 2 crew to challenge
  const activeCrew = state.henchmen.filter(h => !h.injured);
  if (activeCrew.length < 2) return { success: false, msg: 'You need at least 2 active crew members to challenge a territory.' };

  // Create territory combat event
  const soldierCount = gang.soldiers[0] + Math.floor(Math.random() * (gang.soldiers[1] - gang.soldiers[0] + 1));
  const hp = gang.hp[0] + Math.floor(Math.random() * (gang.hp[1] - gang.hp[0] + 1));
  const dmg = gang.dmg[0] + Math.floor(Math.random() * (gang.dmg[1] - gang.dmg[0] + 1));

  return {
    success: true,
    combat: true,
    event: {
      id: 'territory_war',
      msg: `⚔️ WAR! You challenge the ${gang.name} for control of ${LOCATIONS.find(l => l.id === locId).name}!`,
      chance: 1,
      type: 'combat',
      resolved: false,
      combatType: 'territory',
      enemyName: gang.name,
      enemyCount: soldierCount,
      enemyHealth: hp,
      enemyDamage: dmg,
      territoryLocation: locId,
    },
  };
}

function claimTerritory(state, locationId) {
  if (!state.territory) state.territory = {};
  const gang = getTerritoryGang(locationId);
  state.territory[locationId] = {
    controlled: true,
    gangDefeated: gang ? gang.name : 'Unknown',
    dayTaken: state.day,
  };
  if (typeof adjustRepFromAction === 'function') {
    adjustRepFromAction(state, 'territory_claim');
  } else {
    state.reputation = Math.min(100, state.reputation + 15);
  }
  state.heat = Math.min(100, state.heat + 25);
  return {
    msg: `You've taken control of ${LOCATIONS.find(l => l.id === locationId).name}! The ${gang ? gang.name : 'locals'} answer to you now.`,
  };
}

function processTerritoryIncome(state) {
  const territories = getControlledTerritories(state);
  if (territories.length === 0) return 0;
  let income = territories.length * TERRITORY_BENEFITS.dailyIncome;
  // Perk: overlord_income +50%, untouchable +20%, immortal +15%
  if (typeof hasPerk === 'function') {
    if (hasPerk(state, 'overlord_income')) income = Math.round(income * 1.50);
    if (hasPerk(state, 'untouchable')) income = Math.round(income * 1.20);
    if (hasPerk(state, 'immortal')) income = Math.round(income * 1.15);
  }
  state.cash += income;
  return income;
}

function applyTerritoryPriceMod(state, locationId, price, isBuying) {
  if (!isTerritory(state, locationId)) return price;
  if (isBuying) return Math.round(price * (1 - TERRITORY_BENEFITS.priceDiscount));
  return Math.round(price * (1 + TERRITORY_BENEFITS.sellBonus));
}

// ============================================================
// CREW MANAGEMENT (enhanced)
// ============================================================
function processCrewDaily(state) {
  if (!state.henchmen || state.henchmen.length === 0) return [];
  const messages = [];

  for (let i = state.henchmen.length - 1; i >= 0; i--) {
    const h = state.henchmen[i];
    // Initialize loyalty if not present (migration)
    if (h.loyalty === undefined || h.loyalty === null || isNaN(h.loyalty)) { h.loyalty = 100; h.health = 100; h.maxHealth = 100; h.injured = false; h.daysSincePaid = 0; }
    if (h.daysSincePaid === undefined || h.daysSincePaid === null || isNaN(h.daysSincePaid)) { h.daysSincePaid = 0; }

    const type = HENCHMEN_TYPES.find(t => t.id === h.type);
    if (!type) continue;

    // Check if can pay
    if (state.cash < type.dailyPay) {
      h.daysSincePaid++;
      let loyaltyLoss = 10 * h.daysSincePaid;
      // Perk: crew_loyalty halves decay
      if (typeof hasPerk === 'function' && hasPerk(state, 'crew_loyalty')) loyaltyLoss = Math.round(loyaltyLoss * 0.5);
      h.loyalty -= loyaltyLoss;
      messages.push(`💸 Couldn't pay ${h.name}. Loyalty dropping.`);

      if (h.loyalty <= 0) {
        // They leave
        state.henchmen.splice(i, 1);
        messages.push(`🚪 ${h.name} has quit — loyalty hit zero!`);

        // Chance they snitch on their way out
        if (Math.random() < 0.3 && state.investigation) {
          const snitchMsgs = updateInvestigation(state, 'crew_snitch', 15);
          messages.push(`🐀 ${h.name} snitched to the feds on their way out!`);
          messages.push(...snitchMsgs);
        }
      }
    } else {
      state.cash -= type.dailyPay;
      h.daysSincePaid = 0;
      // Loyalty recovers slowly
      if (h.loyalty < 100) h.loyalty = Math.min(100, h.loyalty + 2);
    }
  }

  // === CREW JOB ASSIGNMENT EFFECTS ===
  var bodyDisposers = 0, territoryGuards = 0, frontWorkers = 0, drugRunners = 0;
  var lookouts = 0, labWorkers = 0, enforcers = 0, drivers = 0, recruiters = 0;

  for (var ci = 0; ci < state.henchmen.length; ci++) {
    var cm = state.henchmen[ci];
    if (cm.injured || !cm.assignedTo) continue;
    switch (cm.assignedTo) {
      case 'bodyguard': break; // Combat bonus handled in resolveCombat
      case 'territory_guard': territoryGuards++; break;
      case 'front_cover': frontWorkers++; break;
      case 'drug_runner': drugRunners++; break;
      case 'body_disposal': bodyDisposers++; break;
      case 'lookout_duty': lookouts++; break;
      case 'lab_worker': labWorkers++; break;
      case 'enforcer_duty': enforcers++; break;
      case 'driver': drivers++; break;
      case 'recruiter': recruiters++; break;
    }
  }

  // Territory guards: +5 defense per guard, reduce territory attack chance
  if (territoryGuards > 0 && state.territoryDefense) {
    state.territoryDefense._guardBonus = territoryGuards * 5;
  }

  // Front workers: +10% business income per worker (up to 50%)
  if (frontWorkers > 0 && state.frontBusinesses) {
    state._frontWorkerBonus = Math.min(0.5, frontWorkers * 0.1);
  }

  // Drug runners: passive income from distribution ($200-500 per runner per day)
  if (drugRunners > 0) {
    var runnerIncome = drugRunners * (200 + Math.floor(Math.random() * 300));
    state.cash += runnerIncome;
    if (runnerIncome > 500) messages.push('💊 Drug runners earned $' + runnerIncome.toLocaleString() + ' today.');
    // Small heat increase
    state.heat = Math.min(100, (state.heat || 0) + drugRunners * 0.5);
  }

  // Body disposers: auto-dispose 1 body per disposer per day
  if (bodyDisposers > 0 && state.bodies_state && state.bodies_state.bodies > 0) {
    var disposed = Math.min(state.bodies_state.bodies, bodyDisposers);
    state.bodies_state.bodies -= disposed;
    state.bodies_state.disposedBodies = (state.bodies_state.disposedBodies || 0) + disposed;
    if (disposed > 0) messages.push('💀 Body crew disposed of ' + disposed + ' bod' + (disposed > 1 ? 'ies' : 'y') + ' quietly.');
  }

  // Lookouts: reduce encounter chance & heat gain
  if (lookouts > 0) {
    state._lookoutBonus = Math.min(0.4, lookouts * 0.1); // Up to 40% encounter reduction
  }

  // Lab workers: speed up processing by 1 day per worker
  if (labWorkers > 0 && state.processing && state.processing.activeJobs) {
    for (var ji = 0; ji < state.processing.activeJobs.length; ji++) {
      state.processing.activeJobs[ji].completionDay = Math.max(state.day, state.processing.activeJobs[ji].completionDay - labWorkers);
    }
  }

  // Enforcers: collect debts, intimidation bonus, passive income from protection
  if (enforcers > 0) {
    var protectionIncome = enforcers * (100 + Math.floor(Math.random() * 200));
    state.cash += protectionIncome;
    state.heat = Math.min(100, (state.heat || 0) + enforcers * 0.3);
  }

  // Drivers: reduce travel time (handled in travel function via state._driverBonus)
  if (drivers > 0) {
    state._driverBonus = Math.min(0.5, drivers * 0.15); // Up to 50% faster travel
  }

  // Recruiters: chance to find new crew members
  if (recruiters > 0 && Math.random() < recruiters * 0.05) { // 5% per recruiter per day
    var maxCrew = typeof getMaxCrewSize === 'function' ? getMaxCrewSize(state) : 4;
    if (state.henchmen.length < maxCrew) {
      var recruitTypes = ['thug', 'lookout', 'smuggler'];
      var recruitType = recruitTypes[Math.floor(Math.random() * recruitTypes.length)];
      var rType = HENCHMEN_TYPES.find(function(t) { return t.id === recruitType; });
      if (rType) {
        var recruitName = typeof generateHenchmanName === 'function' ? generateHenchmanName() : 'New Recruit';
        state.henchmen.push({
          id: rType.id, type: rType.id, name: recruitName,
          combat: rType.combat, carry: rType.carry, dailyPay: rType.dailyPay,
          loyalty: 60 + Math.floor(Math.random() * 20),
          health: rType.health || 100, maxHealth: rType.health || 100,
          injured: false, daysSincePaid: 0, rank: 0, daysServed: 0,
          hiddenLoyalty: 60, betrayalRisk: 0, traits: [],
          uniqueId: 'crew_' + Math.random().toString(36).substr(2, 8),
          assignedTo: null
        });
        messages.push('📢 Your recruiter found ' + recruitName + ' (' + rType.name + ') willing to join!');
      }
    }
  }

  return messages;
}

function injureCrewMember(state, index, damage) {
  if (!state.henchmen[index]) return null;
  const h = state.henchmen[index];
  if (h.health === undefined) { h.health = 100; h.maxHealth = 100; h.injured = false; }

  h.health = Math.max(0, h.health - damage);
  if (h.health <= 0) {
    h.injured = true;
    h.health = 0;
    return `${h.name} was seriously injured and is out of action!`;
  } else if (h.health < 30) {
    return `${h.name} took ${damage} damage and is badly hurt!`;
  }
  return `${h.name} took ${damage} damage.`;
}

function healCrewMember(state, index) {
  if (!state.henchmen[index]) return { success: false, msg: 'Invalid crew member.' };
  const h = state.henchmen[index];
  if (h.health === undefined) { h.health = 100; h.maxHealth = 100; h.injured = false; }

  const damage = (h.maxHealth || 100) - h.health;
  if (damage <= 0 && !h.injured) return { success: false, msg: `${h.name} is already healthy.` };

  const cost = damage * 30;
  if (state.cash < cost) {
    const affordable = Math.floor(state.cash / 30);
    h.health += affordable;
    state.cash -= affordable * 30;
    if (h.health >= (h.maxHealth || 100)) h.injured = false;
    return { success: true, msg: `Patched up ${h.name} for $${(affordable * 30).toLocaleString()}.` };
  }

  state.cash -= cost;
  h.health = h.maxHealth || 100;
  h.injured = false;
  return { success: true, msg: `${h.name} fully healed for $${cost.toLocaleString()}.` };
}

// ============================================================
// SKILL TREE SYSTEM - Fallout-style with 4 tabs
// ============================================================
// Skill points earned: 1 per level up, 1 per 5 achievements, bonus from special events
// Each skill has up to 5 ranks, each rank costs 1 point

const SKILL_TREES = {
  travelling: {
    name: 'Travelling', emoji: '🗺️', color: '#00bfff',
    desc: 'Master the art of moving product and yourself across borders.',
    skills: [
      // Tier 1
      { id: 'road_warrior', name: 'Road Warrior', emoji: '🛣️', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: -5% transport cost', effect: (r) => ({ transportCostMod: -0.05 * r }) },
      { id: 'light_packer', name: 'Light Packer', emoji: '🎒', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: +500 inventory capacity', effect: (r) => ({ extraCarry: 500 * r }) },
      { id: 'street_smarts', name: 'Street Smarts', emoji: '🧠', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: -8% encounter chance', effect: (r) => ({ encounterMod: -0.08 * r }) },
      { id: 'pathfinder', name: 'Pathfinder', emoji: '🧭', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: -1 travel day (min 1)', effect: (r) => ({ travelDayMod: -r }) },
      { id: 'fuel_saver', name: 'Fuel Efficiency', emoji: '⛽', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: -3% all travel costs', effect: (r) => ({ travelCostMod: -0.03 * r }) },
      // Tier 2
      { id: 'smuggler_instinct', name: 'Smuggler Instinct', emoji: '📦', maxRank: 3, tier: 2, requires: ['road_warrior:2'], desc: 'Each rank: -10% customs catch chance', effect: (r) => ({ customsMod: -0.10 * r }) },
      { id: 'speed_runner', name: 'Speed Runner', emoji: '⚡', maxRank: 3, tier: 2, requires: ['pathfinder:2'], desc: 'Each rank: 10% chance to save a travel day', effect: (r) => ({ saveDayChance: 0.10 * r }) },
      { id: 'safe_houses', name: 'Safe Houses', emoji: '🏠', maxRank: 5, tier: 2, requires: ['street_smarts:2'], desc: 'Each rank: -3% heat gain from all sources', effect: (r) => ({ heatGainMod: -0.03 * r }) },
      { id: 'caravan_master', name: 'Caravan Master', emoji: '🐫', maxRank: 3, tier: 2, requires: ['light_packer:2'], desc: 'Each rank: +15% transport cargo capacity', effect: (r) => ({ cargoBonusMod: 0.15 * r }) },
      { id: 'regional_expert', name: 'Regional Expert', emoji: '🌍', maxRank: 5, tier: 2, requires: ['fuel_saver:2'], desc: 'Each rank: -5% buy price in visited cities', effect: (r) => ({ visitedCityDiscount: -0.05 * r }) },
      // Tier 3
      { id: 'ghost_route', name: 'Ghost Routes', emoji: '👻', maxRank: 3, tier: 3, requires: ['smuggler_instinct:2', 'safe_houses:2'], desc: 'Each rank: -15% risk on all transport', effect: (r) => ({ riskMod: -0.15 * r }) },
      { id: 'logistics_master', name: 'Logistics Master', emoji: '🗂️', maxRank: 3, tier: 3, requires: ['speed_runner:2', 'caravan_master:2'], desc: 'Each rank: +5,000 inventory, -1 travel day', effect: (r) => ({ extraCarry: 5000 * r, travelDayMod: -r }) },
      { id: 'tunnel_network', name: 'Tunnel Network', emoji: '🕳️', maxRank: 1, tier: 3, requires: ['ghost_route:2', 'logistics_master:2'], desc: 'Unlock secret tunnels: instant cross-border travel once/5 days', effect: (r) => ({ tunnelAccess: true }) },
      { id: 'border_hopper', name: 'Border Hopper', emoji: '🚧', maxRank: 3, tier: 3, requires: ['regional_expert:3'], desc: 'Each rank: -20% region switch cost', effect: (r) => ({ regionCostMod: -0.20 * r }) },
      { id: 'nomad', name: 'Nomad', emoji: '🏕️', maxRank: 3, tier: 3, requires: ['street_smarts:3', 'pathfinder:3'], desc: 'Each rank: +3% sell bonus per unique city visited', effect: (r) => ({ nomadSellBonus: 0.03 * r }) },
      // Tier 4
      { id: 'shadow_network', name: 'Shadow Network', emoji: '🌑', maxRank: 3, tier: 4, requires: ['ghost_route:3'], desc: 'Each rank: -25% all travel risk', effect: (r) => ({ riskMod: -0.25 * r }) },
      { id: 'trade_baron', name: 'Trade Baron', emoji: '🎩', maxRank: 3, tier: 4, requires: ['logistics_master:2', 'border_hopper:2'], desc: 'Each rank: +10,000 carry, -10% transport', effect: (r) => ({ extraCarry: 10000 * r, transportCostMod: -0.10 * r }) },
      { id: 'silk_road', name: 'Silk Road', emoji: '🐪', maxRank: 1, tier: 4, requires: ['tunnel_network:1'], desc: 'Access exclusive trade routes: rare drugs at 20% discount', effect: (r) => ({ silkRoadAccess: true }) },
      { id: 'smuggler_king', name: 'Smuggler King', emoji: '👑', maxRank: 1, tier: 4, requires: ['shadow_network:2'], desc: 'Immune to customs inspections', effect: (r) => ({ customsImmune: true }) },
      { id: 'express_lanes', name: 'Express Lanes', emoji: '🏎️', maxRank: 1, tier: 4, requires: ['speed_runner:3', 'pathfinder:3'], desc: 'All travel takes max 1 day', effect: (r) => ({ expressTravelCap: 1 }) },
      // Tier 5
      { id: 'phantom_convoy', name: 'Phantom Convoy', emoji: '🌫️', maxRank: 1, tier: 5, requires: ['smuggler_king:1', 'shadow_network:3'], desc: 'Zero travel risk — completely invisible', effect: (r) => ({ zeroTravelRisk: true }) },
      { id: 'global_network', name: 'Global Network', emoji: '🌐', maxRank: 1, tier: 5, requires: ['trade_baron:3'], desc: 'Free travel to all owned territories', effect: (r) => ({ freeTerritoryTravel: true }) },
      { id: 'supply_mastery', name: 'Supply Mastery', emoji: '📊', maxRank: 2, tier: 5, requires: ['silk_road:1', 'logistics_master:3'], desc: 'Each rank: +50,000 carry, +15% sell price', effect: (r) => ({ extraCarry: 50000 * r, sellMod: 0.15 * r }) },
      { id: 'warp_gate', name: 'Warp Gate', emoji: '🌀', maxRank: 1, tier: 5, requires: ['tunnel_network:1', 'express_lanes:1'], desc: 'Teleport anywhere instantly once every 3 days', effect: (r) => ({ warpGateAccess: true }) },
      { id: 'trade_empire', name: 'Trade Empire', emoji: '🏛️', maxRank: 1, tier: 5, requires: ['global_network:1', 'supply_mastery:2'], desc: 'All buy/sell prices 20% better', effect: (r) => ({ buyMod: -0.20, sellMod: 0.20 }) },
    ],
  },
  power: {
    name: 'Power', emoji: '💪', color: '#ff4444',
    desc: 'Dominate through raw force and military might.',
    skills: [
      // Tier 1
      { id: 'brawler', name: 'Brawler', emoji: '👊', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +10% melee/weapon damage', effect: (r) => ({ damageMod: 0.10 * r }) },
      { id: 'thick_skin', name: 'Thick Skin', emoji: '🛡️', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: -5% damage taken', effect: (r) => ({ damageReduction: 0.05 * r }) },
      { id: 'weapons_expert', name: 'Weapons Expert', emoji: '🎯', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: +8% accuracy with all weapons', effect: (r) => ({ accuracyMod: 0.08 * r }) },
      { id: 'combat_medic', name: 'Combat Medic', emoji: '💊', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: heal 5% HP after surviving combat', effect: (r) => ({ postCombatHeal: 0.05 * r }) },
      { id: 'quick_draw', name: 'Quick Draw', emoji: '⚡', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +10% first-strike chance', effect: (r) => ({ firstStrikeMod: 0.10 * r }) },
      // Tier 2
      { id: 'crew_commander', name: 'Crew Commander', emoji: '⚔️', maxRank: 3, tier: 2, requires: ['brawler:3'], desc: 'Each rank: crew does +15% damage', effect: (r) => ({ crewDamageMod: 0.15 * r }) },
      { id: 'body_armor', name: 'Body Armor', emoji: '🦺', maxRank: 3, tier: 2, requires: ['thick_skin:3'], desc: 'Each rank: 10% chance to block all damage', effect: (r) => ({ blockChance: 0.10 * r }) },
      { id: 'headhunter', name: 'Headhunter', emoji: '💀', maxRank: 3, tier: 2, requires: ['weapons_expert:2'], desc: 'Each rank: 5% chance of instant kill', effect: (r) => ({ instantKillChance: 0.05 * r }) },
      { id: 'berserker', name: 'Berserker', emoji: '🔥', maxRank: 3, tier: 2, requires: ['brawler:2', 'combat_medic:2'], desc: 'Each rank: +5% damage per 10% HP missing', effect: (r) => ({ berserkerMod: 0.05 * r }) },
      { id: 'suppressive_fire', name: 'Suppressive Fire', emoji: '🔫', maxRank: 5, tier: 2, requires: ['quick_draw:2'], desc: 'Each rank: -10% enemy accuracy', effect: (r) => ({ enemyAccuracyMod: -0.10 * r }) },
      // Tier 3
      { id: 'warlord', name: 'Warlord', emoji: '🪖', maxRank: 3, tier: 3, requires: ['crew_commander:2'], desc: 'Each rank: territory gangs have -15% HP', effect: (r) => ({ gangHpMod: -0.15 * r }) },
      { id: 'bulletproof', name: 'Bulletproof', emoji: '🔰', maxRank: 1, tier: 3, requires: ['body_armor:2', 'thick_skin:5'], desc: 'Cannot die in combat (health min 1)', effect: (r) => ({ deathImmunity: true }) },
      { id: 'army_of_one', name: 'Army of One', emoji: '🦾', maxRank: 1, tier: 3, requires: ['headhunter:3', 'brawler:5'], desc: 'Solo combat damage tripled when no crew', effect: (r) => ({ soloDamageMult: 3 }) },
      { id: 'scorched_earth', name: 'Scorched Earth', emoji: '🔥', maxRank: 3, tier: 3, requires: ['warlord:2'], desc: 'Each rank: destroy 20% enemy resources on victory', effect: (r) => ({ destroyResourceMod: 0.20 * r }) },
      { id: 'adrenaline_rush', name: 'Adrenaline Rush', emoji: '💉', maxRank: 3, tier: 3, requires: ['berserker:2', 'suppressive_fire:3'], desc: 'Each rank: 15% chance extra attack per round', effect: (r) => ({ extraAttackChance: 0.15 * r }) },
      // Tier 4
      { id: 'juggernaut', name: 'Juggernaut', emoji: '🏋️', maxRank: 3, tier: 4, requires: ['bulletproof:1'], desc: 'Each rank: +20% max HP, +15% damage', effect: (r) => ({ maxHpMod: 0.20 * r, damageMod: 0.15 * r }) },
      { id: 'death_dealer', name: 'Death Dealer', emoji: '☠️', maxRank: 1, tier: 4, requires: ['army_of_one:1'], desc: 'All weapons deal 2x damage', effect: (r) => ({ weaponDamageMult: 2 }) },
      { id: 'war_machine', name: 'War Machine', emoji: '🤖', maxRank: 3, tier: 4, requires: ['crew_commander:3', 'warlord:3'], desc: 'Each rank: crew +30% damage, +20% HP', effect: (r) => ({ crewDamageMod: 0.30 * r, crewHpMod: 0.20 * r }) },
      { id: 'executioner', name: 'Executioner', emoji: '⚰️', maxRank: 2, tier: 4, requires: ['headhunter:3', 'adrenaline_rush:2'], desc: 'Each rank: +15% instant kill chance', effect: (r) => ({ instantKillChance: 0.15 * r }) },
      { id: 'iron_fortress', name: 'Iron Fortress', emoji: '🏰', maxRank: 3, tier: 4, requires: ['body_armor:3', 'suppressive_fire:5'], desc: 'Each rank: 25% chance reflect damage back', effect: (r) => ({ reflectChance: 0.25 * r }) },
      // Tier 5
      { id: 'god_of_war', name: 'God of War', emoji: '⚡', maxRank: 1, tier: 5, requires: ['death_dealer:1', 'juggernaut:3'], desc: '+100% all combat damage', effect: (r) => ({ damageMod: 1.00 }) },
      { id: 'immortal_warrior', name: 'Immortal Warrior', emoji: '🧬', maxRank: 1, tier: 5, requires: ['bulletproof:1', 'juggernaut:2'], desc: 'Auto-revive once per fight at 50% HP', effect: (r) => ({ autoRevive: true }) },
      { id: 'annihilator', name: 'Annihilator', emoji: '💥', maxRank: 1, tier: 5, requires: ['war_machine:3'], desc: 'AoE attacks hit all enemies simultaneously', effect: (r) => ({ aoeDamage: true }) },
      { id: 'apex_predator', name: 'Apex Predator', emoji: '🦈', maxRank: 1, tier: 5, requires: ['executioner:2'], desc: '25% instant kill, attacks never miss', effect: (r) => ({ instantKillChance: 0.25, perfectAccuracy: true }) },
      { id: 'one_man_army', name: 'One Man Army', emoji: '🎖️', maxRank: 1, tier: 5, requires: ['god_of_war:1', 'army_of_one:1'], desc: 'Solo = 5x damage, with crew = 2x damage', effect: (r) => ({ soloDamageMult: 5, crewDamageMod: 1.0 }) },
    ],
  },
  influence: {
    name: 'Influence', emoji: '🎭', color: '#ffaa00',
    desc: 'Bend the world to your will through words and connections.',
    skills: [
      // Tier 1
      { id: 'silver_tongue', name: 'Silver Tongue', emoji: '🗣️', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +10 speech skill, better dialogue', effect: (r) => ({ speechBonus: 10 * r }) },
      { id: 'haggler', name: 'Master Haggler', emoji: '🤝', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: -3% buy price, +3% sell price', effect: (r) => ({ buyMod: -0.03 * r, sellMod: 0.03 * r }) },
      { id: 'street_rep', name: 'Street Rep', emoji: '📢', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: +5 rep from all sources', effect: (r) => ({ repBonus: 5 * r }) },
      { id: 'charisma', name: 'Charisma', emoji: '✨', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: +10% better NPC encounter outcomes', effect: (r) => ({ npcOutcomeMod: 0.10 * r }) },
      { id: 'network_builder', name: 'Network Builder', emoji: '🔗', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +5% front business income', effect: (r) => ({ bizIncomeMod: 0.05 * r }) },
      // Tier 2
      { id: 'smooth_talker', name: 'Smooth Talker', emoji: '😎', maxRank: 3, tier: 2, requires: ['silver_tongue:3'], desc: 'Each rank: 15% chance to talk out of combat', effect: (r) => ({ talkOutChance: 0.15 * r }) },
      { id: 'fence', name: 'The Fence', emoji: '🏪', maxRank: 3, tier: 2, requires: ['haggler:3'], desc: 'Each rank: +20% front business income', effect: (r) => ({ bizIncomeMod: 0.20 * r }) },
      { id: 'informant_network', name: 'Informant Network', emoji: '🕵️', maxRank: 3, tier: 2, requires: ['street_rep:2'], desc: 'Each rank: see price trends 1 day ahead', effect: (r) => ({ priceForecast: r }) },
      { id: 'blackmail', name: 'Blackmail', emoji: '📸', maxRank: 3, tier: 2, requires: ['charisma:2'], desc: 'Each rank: 10% chance to extract cash from NPCs', effect: (r) => ({ extortChance: 0.10 * r }) },
      { id: 'brand_loyalty', name: 'Brand Loyalty', emoji: '⭐', maxRank: 5, tier: 2, requires: ['network_builder:3'], desc: 'Each rank: +5% sell prices to returning buyers', effect: (r) => ({ loyaltySellMod: 0.05 * r }) },
      // Tier 3
      { id: 'diplomat', name: 'Diplomat', emoji: '🕊️', maxRank: 3, tier: 3, requires: ['smooth_talker:2'], desc: 'Each rank: bribe enemies for 20% less', effect: (r) => ({ bribeMod: -0.20 * r }) },
      { id: 'media_mogul', name: 'Media Mogul', emoji: '📺', maxRank: 1, tier: 3, requires: ['street_rep:3', 'silver_tongue:5'], desc: 'Control the narrative: investigation gains -50%', effect: (r) => ({ investigationMod: -0.50 }) },
      { id: 'puppet_master', name: 'Puppet Master', emoji: '🎪', maxRank: 1, tier: 3, requires: ['diplomat:2', 'fence:3'], desc: 'Court contacts are free (first use per case)', effect: (r) => ({ freeCourtContact: true }) },
      { id: 'propaganda', name: 'Propaganda', emoji: '📰', maxRank: 3, tier: 3, requires: ['blackmail:2', 'media_mogul:1'], desc: 'Each rank: -30% heat from kills', effect: (r) => ({ killHeatMod: -0.30 * r }) },
      { id: 'market_insider', name: 'Market Insider', emoji: '📈', maxRank: 1, tier: 3, requires: ['informant_network:3'], desc: 'See exact price ranges for all drugs', effect: (r) => ({ priceRangeVision: true }) },
      // Tier 4
      { id: 'crime_lord_charm', name: 'Crime Lord Charm', emoji: '🎭', maxRank: 3, tier: 4, requires: ['diplomat:3'], desc: 'Each rank: -20% all NPC hostility', effect: (r) => ({ npcHostilityMod: -0.20 * r }) },
      { id: 'market_maker', name: 'Market Maker', emoji: '💹', maxRank: 3, tier: 4, requires: ['fence:3', 'market_insider:1'], desc: 'Each rank: influence drug prices ±15%', effect: (r) => ({ priceInfluence: 0.15 * r }) },
      { id: 'shadow_broker', name: 'Shadow Broker', emoji: '🕶️', maxRank: 2, tier: 4, requires: ['informant_network:3', 'propaganda:2'], desc: 'Each rank: sell intel for $5,000/day', effect: (r) => ({ intelIncome: 5000 * r }) },
      { id: 'kingpin_aura', name: 'Kingpin Aura', emoji: '👑', maxRank: 1, tier: 4, requires: ['street_rep:3', 'brand_loyalty:3'], desc: '+50 rep from all sources', effect: (r) => ({ repBonus: 50 }) },
      { id: 'political_fixer', name: 'Political Fixer', emoji: '🏛️', maxRank: 3, tier: 4, requires: ['puppet_master:1'], desc: 'Each rank: investigation always -20%', effect: (r) => ({ investigationMod: -0.20 * r }) },
      // Tier 5
      { id: 'untouchable_status', name: 'Untouchable', emoji: '🌟', maxRank: 1, tier: 5, requires: ['political_fixer:3', 'media_mogul:1'], desc: 'Investigation can never reach arrest warrant', effect: (r) => ({ arrestImmune: true }) },
      { id: 'monopolist', name: 'Monopolist', emoji: '🏆', maxRank: 1, tier: 5, requires: ['market_maker:3'], desc: '+30% all buy/sell price advantage', effect: (r) => ({ buyMod: -0.30, sellMod: 0.30 }) },
      { id: 'puppet_regime', name: 'Puppet Regime', emoji: '🎭', maxRank: 1, tier: 5, requires: ['puppet_master:1', 'crime_lord_charm:3'], desc: 'All court outcomes always favorable', effect: (r) => ({ courtAlwaysWin: true }) },
      { id: 'media_empire', name: 'Media Empire', emoji: '📡', maxRank: 1, tier: 5, requires: ['propaganda:3', 'shadow_broker:2'], desc: 'Heat and investigation gains halved', effect: (r) => ({ heatGainMod: -0.50, investigationMod: -0.50 }) },
      { id: 'world_influence', name: 'World Influence', emoji: '🌍', maxRank: 1, tier: 5, requires: ['monopolist:1', 'kingpin_aura:1'], desc: 'All prices and costs 25% better everywhere', effect: (r) => ({ buyMod: -0.25, sellMod: 0.25, globalCostMod: -0.25 }) },
    ],
  },
  control: {
    name: 'Control', emoji: '👑', color: '#aa44ff',
    desc: 'Build and command a criminal empire.',
    skills: [
      // Tier 1
      { id: 'territory_boss', name: 'Territory Boss', emoji: '🏴', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +10% territory income', effect: (r) => ({ territoryIncomeMod: 0.10 * r }) },
      { id: 'supply_chain', name: 'Supply Chain', emoji: '🔗', maxRank: 3, tier: 1, requires: [], desc: 'Each rank: distribution sells +15% more units', effect: (r) => ({ distSellMod: 0.15 * r }) },
      { id: 'money_man', name: 'Money Man', emoji: '💰', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: +0.1% daily bank interest', effect: (r) => ({ bankInterestBonus: 0.001 * r }) },
      { id: 'recruiter', name: 'Recruiter', emoji: '📋', maxRank: 2, tier: 1, requires: [], desc: 'Each rank: +1 max crew slot', effect: (r) => ({ extraCrewSlots: r }) },
      { id: 'fortifier', name: 'Fortifier', emoji: '🧱', maxRank: 5, tier: 1, requires: [], desc: 'Each rank: -10% territory attack chance', effect: (r) => ({ territoryDefenseMod: -0.10 * r }) },
      // Tier 2
      { id: 'iron_fist', name: 'Iron Fist', emoji: '✊', maxRank: 3, tier: 2, requires: ['territory_boss:3'], desc: 'Each rank: -20% rival attack chance', effect: (r) => ({ rivalMod: -0.20 * r }) },
      { id: 'cartel_network', name: 'Cartel Network', emoji: '🕸️', maxRank: 3, tier: 2, requires: ['supply_chain:2'], desc: 'Each rank: +1 max dealer per distribution tier', effect: (r) => ({ extraDealers: r }) },
      { id: 'laundry_king', name: 'Laundry King', emoji: '🧼', maxRank: 3, tier: 2, requires: ['money_man:3'], desc: 'Each rank: +25% launder capacity, +15% biz income', effect: (r) => ({ launderMod: 0.25 * r, bizIncomeMod2: 0.15 * r }) },
      { id: 'crew_trainer', name: 'Crew Trainer', emoji: '🏋️', maxRank: 3, tier: 2, requires: ['recruiter:2'], desc: 'Each rank: crew +10% all stats', effect: (r) => ({ crewStatMod: 0.10 * r }) },
      { id: 'defense_grid', name: 'Defense Grid', emoji: '🛡️', maxRank: 5, tier: 2, requires: ['fortifier:3'], desc: 'Each rank: territory defense +20%', effect: (r) => ({ territoryDefenseMod: -0.20 * r }) },
      // Tier 3
      { id: 'empire_builder', name: 'Empire Builder', emoji: '🏰', maxRank: 3, tier: 3, requires: ['iron_fist:2', 'cartel_network:2'], desc: 'Each rank: distribution bust chance -20%', effect: (r) => ({ distBustMod: -0.20 * r }) },
      { id: 'shadow_govt', name: 'Shadow Government', emoji: '🏛️', maxRank: 1, tier: 3, requires: ['laundry_king:3'], desc: 'Bribes and court costs halved permanently', effect: (r) => ({ courtCostMod: -0.50 }) },
      { id: 'kingmaker', name: 'Kingmaker', emoji: '♚', maxRank: 1, tier: 3, requires: ['empire_builder:3', 'shadow_govt:1'], desc: 'All income +30%, all costs -20%', effect: (r) => ({ globalIncomeMod: 0.30, globalCostMod: -0.20 }) },
      { id: 'monopoly', name: 'Monopoly', emoji: '🎯', maxRank: 3, tier: 3, requires: ['territory_boss:5', 'defense_grid:3'], desc: 'Each rank: +20% sell prices in territories', effect: (r) => ({ territorySellMod: 0.20 * r }) },
      { id: 'elite_crew', name: 'Elite Crew', emoji: '⭐', maxRank: 1, tier: 3, requires: ['crew_trainer:3'], desc: 'Crew loyalty never drops below 50%', effect: (r) => ({ crewLoyaltyFloor: 50 }) },
      // Tier 4
      { id: 'cartel_emperor', name: 'Cartel Emperor', emoji: '🦅', maxRank: 3, tier: 4, requires: ['kingmaker:1'], desc: 'Each rank: +25% all empire income', effect: (r) => ({ globalIncomeMod: 0.25 * r }) },
      { id: 'total_control', name: 'Total Control', emoji: '🔒', maxRank: 1, tier: 4, requires: ['monopoly:3', 'iron_fist:3'], desc: 'Territories never revolt or get attacked', effect: (r) => ({ territoryImmune: true }) },
      { id: 'distribution_empire', name: 'Distribution Empire', emoji: '📦', maxRank: 3, tier: 4, requires: ['empire_builder:3'], desc: 'Each rank: +50% distribution revenue', effect: (r) => ({ distRevenueMod: 0.50 * r }) },
      { id: 'war_chest', name: 'War Chest', emoji: '💎', maxRank: 2, tier: 4, requires: ['laundry_king:3', 'money_man:5'], desc: 'Each rank: +0.5% bank interest daily', effect: (r) => ({ bankInterestBonus: 0.005 * r }) },
      { id: 'inner_circle', name: 'Inner Circle', emoji: '🤝', maxRank: 1, tier: 4, requires: ['elite_crew:1', 'crew_trainer:3'], desc: 'Crew abilities 2x effective', effect: (r) => ({ crewEffectMult: 2 }) },
      // Tier 5
      { id: 'absolute_power', name: 'Absolute Power', emoji: '⚡', maxRank: 1, tier: 5, requires: ['cartel_emperor:3'], desc: 'All income doubled', effect: (r) => ({ globalIncomeMod: 1.0 }) },
      { id: 'shadow_state', name: 'Shadow State', emoji: '👁️', maxRank: 1, tier: 5, requires: ['total_control:1', 'shadow_govt:1'], desc: 'Investigation halved, bust immune', effect: (r) => ({ investigationMod: -0.50, bustImmune: true }) },
      { id: 'crime_syndicate', name: 'Crime Syndicate', emoji: '🌐', maxRank: 1, tier: 5, requires: ['distribution_empire:3'], desc: 'Distribution available in all cities', effect: (r) => ({ globalDistribution: true }) },
      { id: 'dynasty', name: 'Dynasty', emoji: '🏆', maxRank: 1, tier: 5, requires: ['war_chest:2'], desc: '+100% front income, auto-launder all cash', effect: (r) => ({ bizIncomeMod: 1.0, autoLaunder: true }) },
      { id: 'supreme_ruler', name: 'Supreme Ruler', emoji: '💀', maxRank: 1, tier: 5, requires: ['absolute_power:1', 'shadow_state:1'], desc: 'All bonuses +50%, you own everything', effect: (r) => ({ globalIncomeMod: 0.50, globalCostMod: -0.50 }) },
    ],
  },
};

// Get total skill effect — aggregates all learned skill effects
function getSkillEffect(state, effectKey) {
  if (!state.skills) return 0;
  let total = 0;
  for (const [skillId, rank] of Object.entries(state.skills)) {
    if (rank <= 0) continue;
    // Find skill in all trees
    for (const tree of Object.values(SKILL_TREES)) {
      const skill = tree.skills.find(s => s.id === skillId);
      if (skill) {
        const effects = skill.effect(rank);
        if (effects[effectKey] !== undefined) {
          if (typeof effects[effectKey] === 'boolean') return effects[effectKey];
          total += effects[effectKey];
        }
        break;
      }
    }
  }
  return total;
}

function hasSkillEffect(state, effectKey) {
  return getSkillEffect(state, effectKey) !== 0 && getSkillEffect(state, effectKey) !== false;
}

// Skill point cost per tier: Tier 1 = 1pt, Tier 2 = 2pts, Tier 3 = 3pts, Tier 4 = 4pts, Tier 5 = 5pts
function getSkillCost(tier) { return tier; }

// Minimum kingpin level required per tier
const TIER_LEVEL_REQ = { 1: 0, 2: 4, 3: 8, 4: 13, 5: 18 };

// Minimum total ranks in this tree to unlock tier
const TIER_RANK_REQ = { 1: 0, 2: 6, 3: 14, 4: 24, 5: 36 };

function getTreeRanks(state, treeId) {
  if (!state.skills) return 0;
  const tree = SKILL_TREES[treeId];
  if (!tree) return 0;
  const treeSkillIds = tree.skills.map(s => s.id);
  return treeSkillIds.reduce((sum, id) => sum + ((state.skills[id]) || 0), 0);
}

function canUnlockSkill(state, skillId) {
  const cost = getSkillCostForId(skillId);
  if (!state.skillPoints || state.skillPoints < cost) return { can: false, reason: `Need ${cost} skill point${cost > 1 ? 's' : ''} (have ${state.skillPoints || 0}).` };
  for (const [treeId, tree] of Object.entries(SKILL_TREES)) {
    const skill = tree.skills.find(s => s.id === skillId);
    if (!skill) continue;
    const currentRank = (state.skills && state.skills[skillId]) || 0;
    if (currentRank >= skill.maxRank) return { can: false, reason: 'Already max rank.' };
    // Check kingpin level requirement
    const playerLevel = getKingpinLevel(state.xp || 0).level || 0;
    const levelReq = TIER_LEVEL_REQ[skill.tier] || 0;
    if (playerLevel < levelReq) return { can: false, reason: `Requires Kingpin Level ${levelReq} (you're ${playerLevel}).` };
    // Check tree rank requirement
    const rankReq = TIER_RANK_REQ[skill.tier] || 0;
    const treeRanks = getTreeRanks(state, treeId);
    if (treeRanks < rankReq) return { can: false, reason: `Need ${rankReq} total ranks in ${tree.name} (have ${treeRanks}).` };
    // Check prereqs
    for (const req of skill.requires) {
      const [reqId, reqRank] = req.split(':');
      const playerRank = (state.skills && state.skills[reqId]) || 0;
      if (playerRank < parseInt(reqRank)) {
        const reqSkillName = findSkillName(reqId);
        return { can: false, reason: `Requires ${reqSkillName} rank ${reqRank}.` };
      }
    }
    return { can: true, cost };
  }
  return { can: false, reason: 'Skill not found.' };
}

function getSkillCostForId(skillId) {
  for (const tree of Object.values(SKILL_TREES)) {
    const skill = tree.skills.find(s => s.id === skillId);
    if (skill) return getSkillCost(skill.tier);
  }
  return 1;
}

function findSkillName(skillId) {
  for (const tree of Object.values(SKILL_TREES)) {
    const s = tree.skills.find(sk => sk.id === skillId);
    if (s) return s.name;
  }
  return skillId;
}

function unlockSkill(state, skillId) {
  const check = canUnlockSkill(state, skillId);
  if (!check.can) return { success: false, msg: check.reason };
  const cost = check.cost || getSkillCostForId(skillId);
  if (!state.skills) state.skills = {};
  state.skills[skillId] = (state.skills[skillId] || 0) + 1;
  state.skillPoints -= cost;
  // Update speech skill from silver_tongue
  state.speechSkill = getSkillEffect(state, 'speechBonus');
  const skill = findSkillById(skillId);
  return { success: true, msg: `${skill.emoji} ${skill.name} upgraded to rank ${state.skills[skillId]}! (-${cost} pt${cost > 1 ? 's' : ''})` };
}

function findSkillById(skillId) {
  for (const tree of Object.values(SKILL_TREES)) {
    const s = tree.skills.find(sk => sk.id === skillId);
    if (s) return s;
  }
  return null;
}

function getTotalSkillRanks(state) {
  if (!state.skills) return 0;
  return Object.values(state.skills).reduce((a, b) => a + b, 0);
}

// ============================================================
// DIALOGUE / CONVERSATION SYSTEM
// ============================================================
const NPC_POOL = [
  { id: 'shady_dealer', name: 'Shady Dealer', emoji: '🕶️', locations: 'any' },
  { id: 'informant', name: 'Street Informant', emoji: '🐀', locations: 'any' },
  { id: 'corrupt_cop', name: 'Corrupt Cop', emoji: '👮', locations: 'any' },
  { id: 'cartel_emissary', name: 'Cartel Emissary', emoji: '💀', locations: ['bogota', 'medellin', 'mexico_city'] },
  { id: 'arms_dealer', name: 'Arms Dealer', emoji: '🔫', locations: 'any' },
  { id: 'chemist_stranger', name: 'Underground Chemist', emoji: '⚗️', locations: 'any' },
  { id: 'fortune_teller', name: 'Fortune Teller', emoji: '🔮', locations: 'any' },
  { id: 'retired_kingpin', name: 'Retired Kingpin', emoji: '🎩', locations: 'any' },
  { id: 'smuggler_captain', name: 'Smuggler Captain', emoji: '🚢', locations: ['miami', 'marseille', 'hong_kong', 'sydney', 'rio'] },
  { id: 'journalist', name: 'Investigative Journalist', emoji: '📰', locations: 'any' },
  { id: 'street_kid', name: 'Street Kid', emoji: '🧒', locations: 'any' },
  { id: 'mysterious_woman', name: 'Mysterious Woman', emoji: '🕯️', locations: 'any' },
  { id: 'tech_hacker', name: 'Tech Hacker', emoji: '💻', locations: ['tokyo', 'london', 'new_york', 'los_angeles'] },
  { id: 'prison_contact', name: 'Ex-Con', emoji: '⛓️', locations: 'any' },
  { id: 'politician', name: 'Corrupt Politician', emoji: '🏛️', locations: 'any' },
];

// Dialogue encounters — each has speech checks and branching outcomes
const DIALOGUE_ENCOUNTERS = [
  {
    id: 'shady_deal',
    npcId: 'shady_dealer',
    chance: 0.08,
    intro: 'Hey... you look like someone who appreciates a good deal. I got something special.',
    choices: [
      {
        text: 'What you got?',
        speechCheck: 0,
        outcomes: [
          { weight: 40, type: 'drug_deal', msg: 'Check this out — pure, uncut.', drugId: 'random_premium', amount: [5, 15], priceDiscount: 0.5 },
          { weight: 30, type: 'weapon_deal', msg: 'Fell off a truck, if you know what I mean.', weaponTier: 'any', priceDiscount: 0.4 },
          { weight: 20, type: 'scam', msg: 'Just kidding — GIVE ME YOUR MONEY!', cashLoss: [500, 3000] },
          { weight: 10, type: 'rare_item', msg: 'Something very special...', effect: 'extra_inventory_50' },
        ],
      },
      {
        text: '[Speech 20] I know quality when I see it. Show me the REAL goods.',
        speechCheck: 20,
        outcomes: [
          { weight: 60, type: 'premium_deal', msg: 'A person of taste! Here — top shelf only.', drugId: 'cocaine', amount: [10, 30], priceDiscount: 0.3 },
          { weight: 40, type: 'weapon_deal', msg: 'For a connoisseur... check this hardware.', weaponTier: 'heavy', priceDiscount: 0.5 },
        ],
      },
      {
        text: '[Speech 50] I don\'t do small time. Bring me a real offer or walk away.',
        speechCheck: 50,
        outcomes: [
          { weight: 70, type: 'big_deal', msg: 'You\'re the real deal. Here — wholesale prices.', drugId: 'random', amount: [30, 80], priceDiscount: 0.6 },
          { weight: 30, type: 'connection', msg: 'I respect that. Here\'s a contact — she can move weight.', effect: 'free_distributor' },
        ],
      },
      { text: 'Not interested. Walk away.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: 'Your loss, friend.' }] },
    ],
  },
  {
    id: 'corrupt_cop_encounter',
    npcId: 'corrupt_cop',
    chance: 0.06,
    intro: 'Badge flash. "Relax, I\'m not here to bust you. I\'m here to do business."',
    choices: [
      {
        text: 'What kind of business?',
        speechCheck: 0,
        outcomes: [
          { weight: 50, type: 'protection', msg: '"Pay me $5K/month and I\'ll keep the heat off."', cashCost: 5000, effect: 'reduce_heat_20' },
          { weight: 50, type: 'intel', msg: '"I can tell you where the next raid is happening."', cashCost: 2000, effect: 'reduce_investigation_10' },
        ],
      },
      {
        text: '[Speech 30] How about you work for me full time?',
        speechCheck: 30,
        outcomes: [
          { weight: 60, type: 'hire', msg: '"That\'s... a lot of money. But I\'m in."', cashCost: 15000, effect: 'free_lookout' },
          { weight: 40, type: 'offended', msg: '"Who do you think you are?" He calls for backup!', effect: 'police_encounter' },
        ],
      },
      {
        text: '[Speech 60] I own this precinct. You should know that.',
        speechCheck: 60,
        outcomes: [
          { weight: 80, type: 'submission', msg: '"Yes sir. I\'ll make sure you\'re not bothered."', effect: 'heat_immunity_5days' },
          { weight: 20, type: 'respect', msg: '"I\'ve heard of you. Here — a gesture of good faith."', cashGain: 10000, effect: 'reduce_investigation_20' },
        ],
      },
      { text: 'I don\'t deal with cops. Get lost.', speechCheck: 0, outcomes: [{ weight: 70, type: 'leave', msg: '"Your funeral."' }, { weight: 30, type: 'anger', msg: '"Wrong answer." He raises the alarm!', effect: 'heat_plus_15' }] },
    ],
  },
  {
    id: 'cartel_offer',
    npcId: 'cartel_emissary',
    chance: 0.04,
    intro: 'A man in an expensive suit approaches. "My bosses have been watching you. They\'re... impressed."',
    choices: [
      {
        text: 'I\'m listening.',
        speechCheck: 0,
        outcomes: [
          { weight: 50, type: 'alliance', msg: '"We want to supply you directly. Better prices, bigger volume."', effect: 'cartel_prices_10days' },
          { weight: 50, type: 'job', msg: '"We have a shipment that needs moving. $50K if you deliver."', cashGain: 50000, effect: 'heat_plus_25' },
        ],
      },
      {
        text: '[Speech 40] I don\'t work FOR anyone. But I\'ll work WITH you.',
        speechCheck: 40,
        outcomes: [
          { weight: 70, type: 'partnership', msg: '"A partner then. We can arrange that."', effect: 'cartel_partner_buff' },
          { weight: 30, type: 'test', msg: '"Partners prove themselves. Take out this rival first."', effect: 'gang_encounter' },
        ],
      },
      {
        text: '[Speech 70] Tell your bosses I AM the boss.',
        speechCheck: 70,
        outcomes: [
          { weight: 50, type: 'respect', msg: '"I\'ll relay the message. Here — a sign of respect."', cashGain: 100000, effect: 'rep_plus_20' },
          { weight: 50, type: 'war', msg: '"Big words. Let\'s see if you can back them up."', effect: 'gang_encounter_hard' },
        ],
      },
      { text: 'I work alone.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: '"We\'ll be watching."' }] },
    ],
  },
  {
    id: 'chemist_offer',
    npcId: 'chemist_stranger',
    chance: 0.05,
    intro: 'A nervous man in a lab coat whispers, "I can make your product twice as potent. Interested?"',
    choices: [
      {
        text: 'How much?',
        speechCheck: 0,
        outcomes: [
          { weight: 60, type: 'boost', msg: '"$3K and your sell prices go up 20% for 10 days."', cashCost: 3000, effect: 'sell_boost_10days' },
          { weight: 40, type: 'bad_batch', msg: 'He tinkers with your stash... but something goes wrong. Quality drops.', effect: 'lose_random_drugs_20pct' },
        ],
      },
      {
        text: '[Speech 25] Cut me a deal or I walk.',
        speechCheck: 25,
        outcomes: [
          { weight: 80, type: 'discount', msg: '"Fine, $1K. Just... don\'t tell anyone."', cashCost: 1000, effect: 'sell_boost_10days' },
          { weight: 20, type: 'free', msg: '"Actually, I need protection more than money. Do it for free?"', effect: 'sell_boost_10days' },
        ],
      },
      { text: 'No thanks, I like my product pure.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: '"Your call."' }] },
    ],
  },
  {
    id: 'fortune_teller_visit',
    npcId: 'fortune_teller',
    chance: 0.03,
    intro: 'An old woman beckons from a doorway. "I see your future... it\'s very interesting."',
    choices: [
      {
        text: 'Tell me my fortune.',
        speechCheck: 0,
        outcomes: [
          { weight: 30, type: 'tip', msg: '"I see great profit in {location}... go there soon."', effect: 'price_tip' },
          { weight: 30, type: 'warning', msg: '"Danger follows you. Be careful who you trust."', effect: 'loyalty_warning' },
          { weight: 20, type: 'blessing', msg: '"I give you my protection." She touches your forehead.', effect: 'luck_buff_10days' },
          { weight: 20, type: 'curse', msg: '"The spirits demand payment!" She grabs your wallet.', cashLoss: [1000, 5000] },
        ],
      },
      {
        text: '[Speech 15] I make my own fortune.',
        speechCheck: 15,
        outcomes: [
          { weight: 100, type: 'impressed', msg: '"Ha! I like you. Here — a real tip."', effect: 'best_price_tip' },
        ],
      },
      { text: 'I don\'t believe in that stuff.', speechCheck: 0, outcomes: [{ weight: 70, type: 'leave', msg: '"The cards never lie..."' }, { weight: 30, type: 'curse', msg: '"You WILL believe..." She curses you!', effect: 'bad_luck_5days' }] },
    ],
  },
  {
    id: 'smuggler_captain_offer',
    npcId: 'smuggler_captain',
    chance: 0.04,
    intro: 'A weathered captain sidles up. "I\'ve got a ship leaving tonight. Room for cargo... no questions asked."',
    choices: [
      {
        text: 'How much space?',
        speechCheck: 0,
        outcomes: [
          { weight: 50, type: 'transport', msg: '"500 units, any destination. $8K flat."', cashCost: 8000, effect: 'free_transport_500' },
          { weight: 50, type: 'smuggle', msg: '"I\'m already carrying a load. Want some? Wholesale."', drugId: 'random', amount: [40, 100], priceDiscount: 0.4 },
        ],
      },
      {
        text: '[Speech 35] I need a regular route. Long-term partnership.',
        speechCheck: 35,
        outcomes: [
          { weight: 100, type: 'partnership', msg: '"I like steady work. You got yourself a deal."', effect: 'transport_discount_permanent' },
        ],
      },
      { text: 'Not tonight.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: '"Ship sails at midnight, with or without you."' }] },
    ],
  },
  {
    id: 'journalist_encounter',
    npcId: 'journalist',
    chance: 0.04,
    intro: 'A reporter corners you. "I know who you are. I\'ve been following the money trail."',
    choices: [
      {
        text: 'What do you want?',
        speechCheck: 0,
        outcomes: [
          { weight: 50, type: 'bribe', msg: '"$10K and this story disappears."', cashCost: 10000, effect: 'reduce_investigation_15' },
          { weight: 50, type: 'expose', msg: '"The public deserves to know!" Investigation +10.', effect: 'investigation_plus_10' },
        ],
      },
      {
        text: '[Speech 40] Print that story and you\'ll regret it.',
        speechCheck: 40,
        outcomes: [
          { weight: 60, type: 'scared', msg: '"I... I was just asking questions. I\'ll drop it."', effect: 'reduce_investigation_10' },
          { weight: 40, type: 'brave', msg: '"You can\'t scare me!" The story runs.', effect: 'investigation_plus_15' },
        ],
      },
      {
        text: '[Speech 70] How about you write what I TELL you to write?',
        speechCheck: 70,
        outcomes: [
          { weight: 80, type: 'controlled', msg: '"You\'re... you\'re right. What do you need?"', effect: 'media_control_10days' },
          { weight: 20, type: 'defiant', msg: '"Never! The truth will out!"', effect: 'investigation_plus_20' },
        ],
      },
      { text: 'No comment. *walk away*', speechCheck: 0, outcomes: [{ weight: 60, type: 'leave', msg: '"I\'ll find my sources elsewhere."' }, { weight: 40, type: 'follow', msg: 'They follow you... heat +5.', effect: 'heat_plus_5' }] },
    ],
  },
  {
    id: 'tech_hacker_encounter',
    npcId: 'tech_hacker',
    chance: 0.03,
    intro: 'A kid with a laptop approaches. "I can wipe your record clean. Digitally speaking."',
    choices: [
      {
        text: 'How?',
        speechCheck: 0,
        outcomes: [
          { weight: 60, type: 'hack', msg: '"$15K and I\'ll delete your file from every database."', cashCost: 15000, effect: 'wipe_investigation' },
          { weight: 40, type: 'scam', msg: '"Actually, that\'ll be $25K." He\'s hiking the price...', cashCost: 25000, effect: 'wipe_investigation' },
        ],
      },
      {
        text: '[Speech 30] That sounds expensive. Make it cheaper.',
        speechCheck: 30,
        outcomes: [
          { weight: 80, type: 'deal', msg: '"Ugh, fine. $8K."', cashCost: 8000, effect: 'wipe_investigation' },
          { weight: 20, type: 'offended', msg: '"I\'m the best. $15K or nothing."', cashCost: 15000, effect: 'wipe_investigation' },
        ],
      },
      { text: 'Sounds too good to be true.', speechCheck: 0, outcomes: [{ weight: 50, type: 'leave', msg: '"It IS true. But whatever."' }, { weight: 50, type: 'proof', msg: '"Let me show you..." He wipes 5 investigation points for free.', effect: 'reduce_investigation_5' }] },
    ],
  },
  {
    id: 'street_kid_encounter',
    npcId: 'street_kid',
    chance: 0.06,
    intro: 'A kid runs up to you. "Mister! Mister! I know things. People talk around me like I\'m invisible."',
    choices: [
      {
        text: 'What do you know?',
        speechCheck: 0,
        outcomes: [
          { weight: 40, type: 'tip', msg: '"The cops are planning a raid on {location} tomorrow!"', effect: 'raid_warning' },
          { weight: 30, type: 'gossip', msg: '"{drug} is about to get REAL expensive. Big shortage coming!"', effect: 'price_spike_tip' },
          { weight: 30, type: 'nothing', msg: '"Actually... I forgot. Can I have $50?"', cashLoss: [50, 50] },
        ],
      },
      {
        text: 'Here\'s $100. Keep your ears open for me.',
        speechCheck: 0,
        outcomes: [
          { weight: 100, type: 'recruit', msg: '"Yes sir! I\'ll be your lookout!"', cashCost: 100, effect: 'temp_lookout_5days' },
        ],
      },
      { text: 'Scram, kid.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: '"Fine! I\'ll sell my info to someone else!"' }] },
    ],
  },
  {
    id: 'retired_kingpin_encounter',
    npcId: 'retired_kingpin',
    chance: 0.02,
    intro: 'An old man with cold eyes sits beside you. "I used to run this town. Let me give you some advice..."',
    choices: [
      {
        text: 'I\'m all ears.',
        speechCheck: 0,
        outcomes: [
          { weight: 40, type: 'wisdom', msg: '"Never trust your own crew completely. Always have a backup plan."', effect: 'xp_bonus_500' },
          { weight: 30, type: 'connection', msg: '"Here\'s a number. Call it when you\'re in trouble."', effect: 'emergency_contact' },
          { weight: 30, type: 'warning', msg: '"The feds took everything from me. Don\'t make my mistakes."', effect: 'skill_point_bonus' },
        ],
      },
      {
        text: '[Speech 45] What went wrong for you?',
        speechCheck: 45,
        outcomes: [
          { weight: 100, type: 'lesson', msg: 'He tells you everything — the mistakes, the betrayals, the escape routes.', effect: 'massive_xp_and_skill' },
        ],
      },
      { text: 'Times have changed, old man.', speechCheck: 0, outcomes: [{ weight: 50, type: 'leave', msg: '"They never change, son. They never change."' }, { weight: 50, type: 'gift', msg: '"Maybe so. But here — you\'ll need this." He slides you a weapon.', effect: 'free_weapon' }] },
    ],
  },
  {
    id: 'mysterious_woman_encounter',
    npcId: 'mysterious_woman',
    chance: 0.03,
    intro: 'A woman in a red dress catches your eye across the bar. She knows something.',
    choices: [
      {
        text: 'Buy her a drink and ask what\'s up.',
        speechCheck: 0,
        outcomes: [
          { weight: 40, type: 'intel', msg: '"The DEA is watching the docks. Avoid sea transport for a while."', effect: 'sea_warning' },
          { weight: 30, type: 'connection', msg: '"I know people in high places. For a price, I can make problems disappear."', cashCost: 20000, effect: 'reduce_investigation_25' },
          { weight: 30, type: 'trap', msg: 'It was a setup! Police burst in!', effect: 'police_encounter' },
        ],
      },
      {
        text: '[Speech 55] You don\'t look like you belong here.',
        speechCheck: 55,
        outcomes: [
          { weight: 70, type: 'reveal', msg: '"I\'m CIA. But I\'m not here for you... I need a favor."', cashGain: 50000, effect: 'cia_favor' },
          { weight: 30, type: 'assassin', msg: '"Nobody does." She pulls a knife! Lose 20 HP.', effect: 'damage_20' },
        ],
      },
      { text: 'Mind your own business.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: 'She smiles knowingly and disappears into the crowd.' }] },
    ],
  },
  {
    id: 'prison_contact_encounter',
    npcId: 'prison_contact',
    chance: 0.04,
    intro: '"Just got out. Know things you might want to hear about who\'s talking to the feds."',
    choices: [
      {
        text: 'Tell me everything.',
        speechCheck: 0,
        outcomes: [
          { weight: 50, type: 'snitch_info', msg: '"One of your guys has been talking. Watch your back."', effect: 'crew_loyalty_warning' },
          { weight: 50, type: 'prison_intel', msg: '"The warden owes me favors. Useful if you ever get locked up."', effect: 'court_bonus_buff' },
        ],
      },
      {
        text: '[Speech 35] Who sent you?',
        speechCheck: 35,
        outcomes: [
          { weight: 60, type: 'honest', msg: '"Nobody. I\'m just trying to earn. Here — free info."', effect: 'reduce_investigation_10' },
          { weight: 40, type: 'setup', msg: '"...Fine. The cops paid me. But I\'d rather work for you."', effect: 'double_agent_buff' },
        ],
      },
      { text: 'I don\'t trust ex-cons.', speechCheck: 0, outcomes: [{ weight: 100, type: 'leave', msg: '"Smart. But you\'re missing out."' }] },
    ],
  },
];

// Process a dialogue encounter
function triggerDialogueEncounter(state) {
  const location = LOCATIONS.find(l => l.id === state.currentLocation);
  if (!location) return null;

  // Filter encounters by location
  const available = DIALOGUE_ENCOUNTERS.filter(enc => {
    const npc = NPC_POOL.find(n => n.id === enc.npcId);
    if (!npc) return false;
    if (npc.locations === 'any') return true;
    return npc.locations.includes(state.currentLocation);
  });

  // Roll for each encounter
  for (const enc of available) {
    if (Math.random() < enc.chance) {
      const npc = NPC_POOL.find(n => n.id === enc.npcId);
      return {
        encounterId: enc.id,
        npcName: npc.name,
        npcEmoji: npc.emoji,
        intro: enc.intro.replace('{location}', location.name),
        choices: enc.choices.map((c, i) => ({
          index: i,
          text: c.text,
          speechCheck: c.speechCheck,
          canChoose: (state.speechSkill || 0) >= c.speechCheck,
          locked: c.speechCheck > 0 && (state.speechSkill || 0) < c.speechCheck,
        })),
      };
    }
  }
  return null;
}

// Resolve a dialogue choice
function resolveDialogueChoice(state, encounterId, choiceIndex) {
  const encounter = DIALOGUE_ENCOUNTERS.find(e => e.id === encounterId);
  if (!encounter) return { msg: 'Encounter not found.', effects: [] };
  const choice = encounter.choices[choiceIndex];
  if (!choice) return { msg: 'Invalid choice.', effects: [] };

  // Check speech requirement
  if (choice.speechCheck > 0 && (state.speechSkill || 0) < choice.speechCheck) {
    return { msg: 'You don\'t have the speech skill for this option.', effects: [] };
  }

  // Weighted random outcome
  const totalWeight = choice.outcomes.reduce((s, o) => s + o.weight, 0);
  let roll = Math.random() * totalWeight;
  let outcome = choice.outcomes[0];
  for (const o of choice.outcomes) {
    roll -= o.weight;
    if (roll <= 0) { outcome = o; break; }
  }

  const effects = [];
  let msg = outcome.msg;

  // Apply effects
  if (outcome.cashCost && outcome.cashCost > 0) {
    if (state.cash < outcome.cashCost) return { msg: 'You can\'t afford this.', effects: [] };
    state.cash -= outcome.cashCost;
    effects.push(`-$${outcome.cashCost.toLocaleString()}`);
  }
  if (outcome.cashGain) { state.cash += outcome.cashGain; effects.push(`+$${outcome.cashGain.toLocaleString()}`); }
  if (outcome.cashLoss) {
    const loss = outcome.cashLoss[0] + Math.floor(Math.random() * (outcome.cashLoss[1] - outcome.cashLoss[0]));
    state.cash = Math.max(0, state.cash - loss);
    effects.push(`-$${loss.toLocaleString()}`);
  }

  // Drug deals
  if (outcome.drugId) {
    let drugId = outcome.drugId;
    if (drugId === 'random' || drugId === 'random_premium') {
      const pool = drugId === 'random_premium' ? DRUGS.filter(d => d.category === 'premium') : DRUGS;
      drugId = pool[Math.floor(Math.random() * pool.length)].id;
    }
    const drug = DRUGS.find(d => d.id === drugId);
    if (drug && outcome.amount) {
      const amt = outcome.amount[0] + Math.floor(Math.random() * (outcome.amount[1] - outcome.amount[0]));
      const space = getFreeSpace(state);
      const actual = Math.min(amt, space);
      if (actual > 0) {
        const price = Math.round(((drug.minPrice + drug.maxPrice) / 2) * (1 - (outcome.priceDiscount || 0)));
        const totalCost = price * actual;
        if (outcome.type === 'drug_deal' || outcome.type === 'premium_deal' || outcome.type === 'big_deal') {
          // They're selling to us at a discount
          if (state.cash >= totalCost) {
            state.cash -= totalCost;
            state.inventory[drugId] = (state.inventory[drugId] || 0) + actual;
            effects.push(`Bought ${actual} ${drug.name} at ${Math.round((1 - (outcome.priceDiscount || 0)) * 100)}% price`);
            msg = msg.replace('{drug}', drug.name);
          }
        } else {
          // Free drugs (smuggler, find, etc)
          state.inventory[drugId] = (state.inventory[drugId] || 0) + actual;
          effects.push(`+${actual} ${drug.name}`);
          msg = msg.replace('{drug}', drug.name);
        }
      }
    }
  }

  // Special effects
  if (outcome.effect) {
    const fx = applyDialogueEffect(state, outcome.effect);
    effects.push(...fx);
  }

  // XP for dialogue
  if (typeof awardXP === 'function') awardXP(state, 'dialogue', 10);

  // Speech skill improves slightly from conversations
  state.speechSkill = Math.min(100, (state.speechSkill || 0) + 1);

  return { msg, effects, outcome: outcome.type };
}

// Apply special dialogue effects
function applyDialogueEffect(state, effectId) {
  const effects = [];
  switch (effectId) {
    case 'reduce_heat_20': state.heat = Math.max(0, state.heat - 20); effects.push('Heat -20'); break;
    case 'reduce_investigation_5': if (state.investigation) { state.investigation.points = Math.max(0, state.investigation.points - 5); state.investigation.level = getInvestigationLevel(state.investigation.points); } effects.push('Investigation -5'); break;
    case 'reduce_investigation_10': if (state.investigation) { state.investigation.points = Math.max(0, state.investigation.points - 10); state.investigation.level = getInvestigationLevel(state.investigation.points); } effects.push('Investigation -10'); break;
    case 'reduce_investigation_15': if (state.investigation) { state.investigation.points = Math.max(0, state.investigation.points - 15); state.investigation.level = getInvestigationLevel(state.investigation.points); } effects.push('Investigation -15'); break;
    case 'reduce_investigation_20': if (state.investigation) { state.investigation.points = Math.max(0, state.investigation.points - 20); state.investigation.level = getInvestigationLevel(state.investigation.points); } effects.push('Investigation -20'); break;
    case 'reduce_investigation_25': if (state.investigation) { state.investigation.points = Math.max(0, state.investigation.points - 25); state.investigation.level = getInvestigationLevel(state.investigation.points); } effects.push('Investigation -25'); break;
    case 'wipe_investigation': if (state.investigation) { state.investigation.points = 0; state.investigation.level = 0; } effects.push('Investigation wiped!'); break;
    case 'investigation_plus_10': updateInvestigation(state, 'dialogue', 10); effects.push('Investigation +10'); break;
    case 'investigation_plus_15': updateInvestigation(state, 'dialogue', 15); effects.push('Investigation +15'); break;
    case 'investigation_plus_20': updateInvestigation(state, 'dialogue', 20); effects.push('Investigation +20'); break;
    case 'heat_plus_5': state.heat = Math.min(100, state.heat + 5); effects.push('Heat +5'); break;
    case 'heat_plus_15': state.heat = Math.min(100, state.heat + 15); effects.push('Heat +15'); break;
    case 'heat_plus_25': state.heat = Math.min(100, state.heat + 25); effects.push('Heat +25'); break;
    case 'heat_immunity_5days': state.activeBuffs.push({ id: 'heat_immunity', name: 'Dirty Cop Protection', emoji: '🛡️', expiresDay: state.day + 5, effect: 'no_heat_gain' }); effects.push('Heat immunity 5 days!'); break;
    case 'sell_boost_10days': state.activeBuffs.push({ id: 'sell_boost', name: 'Enhanced Product', emoji: '⚗️', expiresDay: state.day + 10, effect: 'sell_price_plus_20pct' }); effects.push('+20% sell prices for 10 days!'); break;
    case 'luck_buff_10days': state.activeBuffs.push({ id: 'luck', name: 'Fortune\'s Favor', emoji: '🍀', expiresDay: state.day + 10, effect: 'luck_boost' }); effects.push('Lucky for 10 days!'); break;
    case 'bad_luck_5days': state.activeBuffs.push({ id: 'bad_luck', name: 'Cursed', emoji: '💀', expiresDay: state.day + 5, effect: 'bad_luck' }); effects.push('Cursed for 5 days!'); break;
    case 'xp_bonus_500': state.xp += 500; effects.push('+500 XP!'); break;
    case 'skill_point_bonus': state.skillPoints = (state.skillPoints || 0) + 1; effects.push('+1 Skill Point!'); break;
    case 'massive_xp_and_skill': state.xp += 1000; state.skillPoints = (state.skillPoints || 0) + 2; effects.push('+1000 XP, +2 Skill Points!'); break;
    case 'rep_plus_20': state.reputation = Math.min(100, state.reputation + 20); effects.push('Reputation +20'); break;
    case 'free_lookout': { const name = DISTRIBUTOR_NAMES[Math.floor(Math.random() * DISTRIBUTOR_NAMES.length)]; state.henchmen.push({ type: 'lookout', name: 'Officer ' + name.split(' ')[1], loyalty: 80, health: 100, maxHealth: 100, injured: false, daysSincePaid: 0 }); effects.push('Gained corrupt cop as Lookout!'); break; }
    case 'free_distributor': {
      // Give free distributor at random territory
      const territories = getControlledTerritories(state);
      if (territories.length > 0) {
        const locId = territories[Math.floor(Math.random() * territories.length)];
        if (state.distribution[locId]) {
          const name = DISTRIBUTOR_NAMES[Math.floor(Math.random() * DISTRIBUTOR_NAMES.length)];
          state.distribution[locId].dealers.push({ roleId: 'runner', name, loyalty: 90, daysActive: 0 });
          effects.push(`Free Runner added at ${LOCATIONS.find(l => l.id === locId)?.name || locId}!`);
        }
      }
      break;
    }
    case 'free_weapon': {
      const heavyWeapons = WEAPONS.filter(w => (w.tier === 'heavy' || w.tier === 'rifle') && !state.weapons.includes(w.id));
      if (heavyWeapons.length > 0) {
        const w = heavyWeapons[Math.floor(Math.random() * heavyWeapons.length)];
        state.weapons.push(w.id);
        effects.push(`Received ${w.name}!`);
      }
      break;
    }
    case 'police_encounter': state.heat += 10; effects.push('Police encounter! Heat +10'); break;
    case 'gang_encounter': state.heat += 5; effects.push('Gang trouble! Heat +5'); break;
    case 'gang_encounter_hard': state.heat += 15; effects.push('Major gang battle! Heat +15'); break;
    case 'extra_inventory_50': state.inventorySpace += 2000; effects.push('+2,000 inventory capacity!'); break;
    case 'damage_20': state.health = Math.max(1, state.health - 20); effects.push('-20 HP'); break;
    case 'lose_random_drugs_20pct': {
      for (const drugId in state.inventory) {
        const loss = Math.ceil(state.inventory[drugId] * 0.2);
        state.inventory[drugId] -= loss;
        if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
      }
      effects.push('Lost 20% of your stash!');
      break;
    }
    case 'cartel_prices_10days': state.activeBuffs.push({ id: 'cartel_prices', name: 'Cartel Connection', emoji: '💀', expiresDay: state.day + 10, effect: 'buy_price_minus_30pct' }); effects.push('-30% buy prices for 10 days!'); break;
    case 'cartel_partner_buff': state.activeBuffs.push({ id: 'cartel_partner', name: 'Cartel Partnership', emoji: '🤝', expiresDay: state.day + 20, effect: 'all_income_plus_25pct' }); effects.push('+25% all income for 20 days!'); break;
    case 'price_tip': case 'best_price_tip': case 'price_spike_tip': {
      const tipDrug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      const tipLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      effects.push(`Tip: ${tipDrug.name} prices shifting in ${tipLoc.name}!`);
      break;
    }
    case 'temp_lookout_5days': state.activeBuffs.push({ id: 'temp_lookout', name: 'Street Kid Lookout', emoji: '👀', expiresDay: state.day + 5, effect: 'encounter_minus_15pct' }); effects.push('Kid watching out for you for 5 days!'); break;
    case 'emergency_contact': state.activeBuffs.push({ id: 'emergency', name: 'Kingpin\'s Number', emoji: '📞', expiresDay: state.day + 30, effect: 'court_bonus_20pct' }); effects.push('Emergency contact for 30 days!'); break;
    case 'transport_discount_permanent': state.transportCostMultiplier = Math.max(0.5, (state.transportCostMultiplier || 1) - 0.15); effects.push('-15% permanent transport cost!'); break;
    case 'media_control_10days': state.activeBuffs.push({ id: 'media_control', name: 'Media Under Control', emoji: '📺', expiresDay: state.day + 10, effect: 'investigation_minus_50pct' }); effects.push('Media controlled for 10 days!'); break;
    case 'sea_warning': effects.push('Warning: avoid sea routes for now!'); break;
    case 'raid_warning': effects.push('Warning: raids incoming!'); break;
    case 'loyalty_warning': effects.push('Watch your crew loyalty!'); break;
    case 'cia_favor': state.activeBuffs.push({ id: 'cia', name: 'CIA Protection', emoji: '🏛️', expiresDay: state.day + 15, effect: 'investigation_frozen' }); effects.push('CIA protection for 15 days!'); break;
    case 'crew_loyalty_warning': {
      const disloyalCrew = state.henchmen.filter(h => h.loyalty < 50);
      if (disloyalCrew.length > 0) effects.push(`Warning: ${disloyalCrew.length} crew members have low loyalty!`);
      else effects.push('Your crew seems loyal... for now.');
      break;
    }
    case 'court_bonus_buff': state.activeBuffs.push({ id: 'court_bonus', name: 'Prison Connections', emoji: '⛓️', expiresDay: state.day + 30, effect: 'court_bonus_15pct' }); effects.push('Court success +15% for 30 days!'); break;
    case 'double_agent_buff': state.activeBuffs.push({ id: 'double_agent', name: 'Double Agent', emoji: '🕵️', expiresDay: state.day + 15, effect: 'investigation_decay_double' }); effects.push('Double agent for 15 days!'); break;
    default: break;
  }
  return effects;
}

// Check and expire active buffs
function processBuffs(state) {
  if (!state.activeBuffs) state.activeBuffs = [];
  const expired = state.activeBuffs.filter(b => state.day >= b.expiresDay);
  state.activeBuffs = state.activeBuffs.filter(b => state.day < b.expiresDay);
  return expired.map(b => `${b.emoji} ${b.name} has expired.`);
}

// Check if a buff is active
function hasBuff(state, buffId) {
  if (!state.activeBuffs) return false;
  return state.activeBuffs.some(b => b.id === buffId && state.day < b.expiresDay);
}

// Award skill points on level up
function checkSkillPointAward(state, oldXp, newXp) {
  const oldLevel = getKingpinLevel(oldXp);
  const newLevel = getKingpinLevel(newXp);
  if (newLevel.level > oldLevel.level) {
    const pointsGained = newLevel.level - oldLevel.level;
    state.skillPoints = (state.skillPoints || 0) + pointsGained;
    return pointsGained;
  }
  return 0;
}

// Get effective speech skill (base + silver tongue + buffs)
function getEffectiveSpeech(state) {
  let speech = state.speechSkill || 0;
  speech += getSkillEffect(state, 'speechBonus');
  return Math.min(100, speech);
}

// ============================================================
// MISSING UTILITY FUNCTIONS (cross-system integration)
// ============================================================

// Calculate total net worth: cash + inventory value + property value + vehicle value
function calculateNetWorth(state) {
  let total = state.cash || 0;

  // Inventory value at average market price
  if (state.inventory) {
    for (const [drugId, qty] of Object.entries(state.inventory)) {
      if (qty <= 0) continue;
      const drug = DRUGS.find(d => d.id === drugId);
      if (drug) {
        const avgPrice = (drug.minPrice + drug.maxPrice) / 2;
        total += avgPrice * qty;
      }
    }
  }

  // Stash value
  if (state.stashes) {
    for (const locId of Object.keys(state.stashes)) {
      const stash = state.stashes[locId];
      if (!stash) continue;
      for (const [drugId, qty] of Object.entries(stash)) {
        if (qty <= 0) continue;
        const drug = DRUGS.find(d => d.id === drugId);
        if (drug) {
          total += ((drug.minPrice + drug.maxPrice) / 2) * qty;
        }
      }
    }
  }

  // Property value
  if (typeof getTotalPropertyValue === 'function') {
    total += getTotalPropertyValue(state);
  }

  // Business value (60% of setup cost like sell price)
  if (state.businesses && state.businesses.owned) {
    for (const owned of state.businesses.owned) {
      if (owned.setupCost) total += Math.floor(owned.setupCost * 0.6);
    }
  }

  // Vehicle value
  if (state.vehicleState && state.vehicleState.garage) {
    for (const vehicle of state.vehicleState.garage) {
      if (typeof getVehicleValue === 'function') {
        total += getVehicleValue(state, vehicle.id);
      } else {
        total += (vehicle.purchasePrice || 0) * 0.5;
      }
    }
  }

  return Math.floor(total);
}

// Get wealth level of a district (0-1 scale based on district income level)
function getDistrictWealth(state, districtId) {
  // Check Miami districts first
  if (typeof MIAMI_DISTRICTS !== 'undefined') {
    const dist = MIAMI_DISTRICTS.find(d => d.id === districtId);
    if (dist) {
      // Map income level descriptions to numeric wealth
      const wealthMap = { 'very_low': 0.2, 'low': 0.35, 'medium': 0.5, 'high': 0.7, 'very_high': 0.9 };
      return wealthMap[dist.incomeLevel] || 0.5;
    }
  }

  // Check world districts
  if (typeof WORLD_DISTRICTS !== 'undefined') {
    for (const regionId of Object.keys(WORLD_DISTRICTS)) {
      const dist = WORLD_DISTRICTS[regionId].find(d => d.id === districtId);
      if (dist) {
        return dist.wealthLevel || dist.propertyMod || 0.5;
      }
    }
  }

  // Check LOCATIONS array
  const loc = LOCATIONS.find(l => l.id === districtId);
  if (loc) {
    // Derive wealth from average drug prices or police intensity
    return Math.min(1, Math.max(0.1, (loc.policeIntensity || 0.5)));
  }

  return 0.5; // Default mid-level
}

// Get number of crew assigned to a specific business
function getAssignedCrew(state, businessId) {
  if (!state.henchmen || !Array.isArray(state.henchmen)) return 0;
  return state.henchmen.filter(h => h.assignedTo === businessId && !h.injured).length;
}

// ============================================================
// PROGRESSIVE UNLOCK SYSTEM
// ============================================================
// Feature unlock metadata: maps feature keys to display info and requirements
const FEATURE_UNLOCK_INFO = {
  stash:      { name: 'Stash Houses',       emoji: '📦', desc: 'Store drugs safely across cities.',            reqLevel: 2, reqDay: 3 },
  crew:       { name: 'Crew Management',     emoji: '👥', desc: 'Hire muscle to protect your empire.',         reqLevel: 2, reqDay: 5 },
  fronts:     { name: 'Front Businesses',    emoji: '🏢', desc: 'Launder money through legitimate fronts.',    reqLevel: 3, reqDay: 10 },
  territory:  { name: 'Territory Control',   emoji: '🏴', desc: 'Claim turf and earn passive income.',         reqLevel: 3, reqDay: 8 },
  processing: { name: 'Drug Lab',            emoji: '⚗️', desc: 'Process raw product for higher margins.',     reqLevel: 4, reqDay: 15 },
  heists:     { name: 'Heists',              emoji: '🎯', desc: 'Plan and execute high-risk jobs.',            reqLevel: 4, reqDay: 12 },
  skills:     { name: 'Skill Tree',          emoji: '🌳', desc: 'Specialize your criminal talents.',           reqLevel: 4, reqDay: 10 },
  shipping:   { name: 'Shipping Network',    emoji: '🚛', desc: 'Move product across your empire.',            reqLevel: 5, reqDay: 20 },
  factions:   { name: 'Factions',            emoji: '⚔️', desc: 'Ally or war with powerful organizations.',    reqLevel: 5, reqDay: 15 },
  politics:   { name: 'Politics',            emoji: '🏛️', desc: 'Corrupt officials and bend the law.',         reqLevel: 5, reqDay: 20 },
  worldMap:   { name: 'World Map',           emoji: '🌍', desc: 'Expand operations globally.',                 reqLevel: 7, reqDay: 30 },
  futures:    { name: 'Futures Trading',     emoji: '📊', desc: 'Speculate on drug price movements.',          reqLevel: 7, reqDay: 25 },
  mafiaOps:   { name: 'Mafia Operations',    emoji: '🏢', desc: 'Run large-scale organized crime operations.', reqLevel: 10, reqDay: 40 },
  romance:    { name: 'Romance',             emoji: '💕', desc: 'Find love in the criminal underworld.',       reqLevel: 1, reqDay: 5 },
  nightlife:  { name: 'Nightlife',           emoji: '🌙', desc: 'Hit the clubs and make connections.',         reqLevel: 1, reqDay: 7 },
  rivals:     { name: 'Rival Dealers',       emoji: '🏴', desc: 'Compete with rival drug empires.',            reqLevel: 3, reqDay: 8 },
  defense:    { name: 'Territory Defense',   emoji: '🏰', desc: 'Defend your turf from attacks.',              reqLevel: 3, reqDay: 8 },
  bodies:     { name: 'Body Disposal',       emoji: '☠️', desc: 'Clean up after messy business.',              reqLevel: 3, reqDay: 10 },
  properties: { name: 'Properties',          emoji: '🏠', desc: 'Invest in real estate.',                      reqLevel: 2, reqDay: 5 },
  businesses: { name: 'Businesses',          emoji: '🏢', desc: 'Own and operate legitimate businesses.',      reqLevel: 3, reqDay: 8 },
  imports:    { name: 'Import/Export',        emoji: '🌍', desc: 'Trade goods across borders.',                 reqLevel: 5, reqDay: 20 },
  vehicles:   { name: 'Vehicles',            emoji: '🚗', desc: 'Build your vehicle collection.',              reqLevel: 3, reqDay: 8 },
  safehouse:  { name: 'Safe House',          emoji: '🏠', desc: 'Establish a secure base of operations.',      reqLevel: 2, reqDay: 5 },
  security:   { name: 'Security',            emoji: '🛡️', desc: 'Protect against raids and investigations.',   reqLevel: 3, reqDay: 8 },
  distribution: { name: 'Distribution',      emoji: '📡', desc: 'Set up drug distribution networks.',          reqLevel: 4, reqDay: 12 },
  lifestyle:  { name: 'Lifestyle',           emoji: '🏠', desc: 'Manage stress and live large.',               reqLevel: 2, reqDay: 5 },
};

function getUnlockedFeatures(state) {
  var level = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  var day = state.day || 1;
  return {
    // Always available
    buySell: true,
    travel: true,
    inventory: true,
    phone: true,
    missions: true,
    campaign: true,
    stats: true,
    achievements: true,

    // Level 2+ (after first few deals)
    stash: level >= 2 || day >= 3,
    crew: level >= 2 || day >= 5,
    properties: level >= 2 || day >= 5,
    safehouse: level >= 2 || day >= 5,
    lifestyle: level >= 2 || day >= 5,

    // Level 3+
    fronts: level >= 3 || day >= 10,
    territory: level >= 3 || day >= 8,
    rivals: level >= 3 || day >= 8,
    defense: level >= 3 || day >= 8,
    bodies: level >= 3 || day >= 10,
    businesses: level >= 3 || day >= 8,
    vehicles: level >= 3 || day >= 8,
    security: level >= 3 || day >= 8,

    // Level 4+
    processing: level >= 4 || day >= 15,
    heists: level >= 4 || day >= 12,
    skills: level >= 4 || day >= 10,
    distribution: level >= 4 || day >= 12,

    // Level 5+
    shipping: level >= 5 || day >= 20,
    factions: level >= 5 || day >= 15,
    politics: level >= 5 || day >= 20,
    imports: level >= 5 || day >= 20,

    // Level 7+
    worldMap: level >= 7 || day >= 30,
    futures: level >= 7 || day >= 25,

    // Level 10+
    mafiaOps: level >= 10 || day >= 40,

    // Special
    romance: day >= 5,
    nightlife: day >= 7,
  };
}

// Get unlock requirement text for a locked feature
function getUnlockRequirement(featureKey) {
  var info = FEATURE_UNLOCK_INFO[featureKey];
  if (!info) return 'Locked';
  if (info.reqLevel <= 1) return 'Unlocks on Day ' + info.reqDay;
  return 'Unlocks at Lvl ' + info.reqLevel + ' or Day ' + info.reqDay;
}

// Check for newly unlocked features and return announcement messages
function checkNewUnlocks(state) {
  if (!state.announcedUnlocks) state.announcedUnlocks = {};
  var unlocked = getUnlockedFeatures(state);
  var newUnlocks = [];
  for (var key in unlocked) {
    if (unlocked[key] && !state.announcedUnlocks[key] && FEATURE_UNLOCK_INFO[key]) {
      state.announcedUnlocks[key] = true;
      newUnlocks.push(FEATURE_UNLOCK_INFO[key]);
    }
  }
  // Mark always-available features as announced so they never trigger
  var alwaysOn = ['buySell', 'travel', 'inventory', 'phone', 'missions', 'campaign', 'stats', 'achievements'];
  for (var i = 0; i < alwaysOn.length; i++) {
    state.announcedUnlocks[alwaysOn[i]] = true;
  }
  return newUnlocks;
}
