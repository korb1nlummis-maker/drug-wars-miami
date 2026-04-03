// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Core Game Engine
// ============================================================

const GAME_CONFIG = {
  totalDays: 5000,
  startingCash: 1500,
  startingDebt: 5000,
  debtInterestRate: 0.008, // 0.8% per day — loan sharks are ruthless
  bankInterestRate: 0.002, // 0.2% per day
  startingInventory: 500,
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
// === INJECT MIAMI DISTRICTS INTO LOCATIONS ===
// Miami districts from miami-districts.js need to be in LOCATIONS for travel to work
if (typeof MIAMI_DISTRICTS !== 'undefined') {
  for (var _di = 0; _di < MIAMI_DISTRICTS.length; _di++) {
    var _md = MIAMI_DISTRICTS[_di];
    // Only add if not already in LOCATIONS
    if (!LOCATIONS.find(function(l) { return l.id === _md.id; })) {
      LOCATIONS.push({
        id: _md.id,
        name: _md.name,
        region: 'miami',
        desc: _md.desc,
        flavor: _md.flavorText || _md.desc,
        hasBank: !!_md.hasBank,
        hasLoanShark: !!_md.hasLoanShark,
        hasHospital: !!_md.hasHospital,
        hasBlackMarket: !!_md.hasBlackMarket,
        dangerLevel: _md.dangerLevel || 3,
        priceModifier: _md.priceModifier || 1.0,
        drugSpecialty: _md.drugSpecialty || null,
        gangPresence: _md.gangPresence || [],
        emoji: _md.emoji || '',
        policeIntensity: _md.policeIntensity || 'moderate',
      });
    }
  }
}

const DRUGS = [
  // === STARTER DRUGS (available day 1) ===
  { id: 'weed', name: 'Weed', minPrice: 300, maxPrice: 1000, volatility: 0.25, category: 'low', emoji: '🌿', minLevel: 1, minDay: 1 },
  { id: 'speed', name: 'Speed', minPrice: 70, maxPrice: 300, volatility: 0.35, category: 'bulk', emoji: '⚡', minLevel: 1, minDay: 1 },
  { id: 'shrooms', name: 'Shrooms', minPrice: 50, maxPrice: 400, volatility: 0.5, category: 'bulk', emoji: '🍄', minLevel: 1, minDay: 1 },
  { id: 'ludes', name: 'Ludes', minPrice: 10, maxPrice: 70, volatility: 0.4, category: 'bulk', emoji: '💤', minLevel: 1, minDay: 1 },
  { id: 'peyote', name: 'Peyote', minPrice: 30, maxPrice: 250, volatility: 0.45, category: 'bulk', emoji: '🌵', minLevel: 1, minDay: 1 },
  { id: 'adderall', name: 'Adderall/Rx Pills', minPrice: 400, maxPrice: 1800, volatility: 0.30, category: 'low', emoji: '📋', minLevel: 1, minDay: 1 },
  // === EARLY GAME DRUGS (unlock day 20-60) ===
  { id: 'xanax', name: 'Xanax/Benzos', minPrice: 300, maxPrice: 1500, volatility: 0.35, category: 'low', emoji: '😴', minLevel: 1, minDay: 20 },
  { id: 'hashish', name: 'Hashish', minPrice: 500, maxPrice: 2000, volatility: 0.3, category: 'low', emoji: '🍫', minLevel: 2, minDay: 30 },
  { id: 'crack', name: 'Crack', minPrice: 200, maxPrice: 800, volatility: 0.45, category: 'low', emoji: '🪨', minLevel: 2, minDay: 40 },
  { id: 'lean', name: 'Lean/Codeine', minPrice: 800, maxPrice: 3000, volatility: 0.30, category: 'mid', emoji: '🥤', minLevel: 2, minDay: 50 },
  // === MID GAME DRUGS (unlock day 80-200) ===
  { id: 'acid', name: 'Acid', minPrice: 1000, maxPrice: 4500, volatility: 0.5, category: 'mid', emoji: '🌈', minLevel: 3, minDay: 80 },
  { id: 'ghb', name: 'GHB', minPrice: 1000, maxPrice: 4000, volatility: 0.40, category: 'mid', emoji: '💧', minLevel: 3, minDay: 100 },
  { id: 'ecstasy', name: 'Ecstasy', minPrice: 1500, maxPrice: 5500, volatility: 0.45, category: 'mid', emoji: '💊', minLevel: 4, minDay: 120 },
  { id: 'ketamine', name: 'Ketamine', minPrice: 2000, maxPrice: 7000, volatility: 0.35, category: 'mid', emoji: '🐴', minLevel: 4, minDay: 150 },
  // === EMPIRE DRUGS (unlock day 200-500) ===
  { id: 'methamphetamine', name: 'Meth', minPrice: 800, maxPrice: 3500, volatility: 0.4, category: 'mid', emoji: '🔥', minLevel: 5, minDay: 200 },
  { id: 'opium', name: 'Opium', minPrice: 3000, maxPrice: 9000, volatility: 0.3, category: 'mid', emoji: '🌺', minLevel: 5, minDay: 250 },
  { id: 'dmt', name: 'DMT', minPrice: 1500, maxPrice: 6000, volatility: 0.50, category: 'mid', emoji: '👁️', minLevel: 5, minDay: 300 },
  // === KINGPIN DRUGS (unlock day 400-1000) ===
  { id: 'heroin', name: 'Heroin', minPrice: 5000, maxPrice: 15000, volatility: 0.35, category: 'premium', emoji: '💉', minLevel: 6, minDay: 400 },
  { id: 'cocaine', name: 'Cocaine', minPrice: 15000, maxPrice: 32000, volatility: 0.4, category: 'premium', emoji: '❄️', minLevel: 8, minDay: 600 },
  // === ENDGAME DRUGS (NG+ or very late game) ===
  { id: 'fentanyl', name: 'Fentanyl', minPrice: 20000, maxPrice: 50000, volatility: 0.50, category: 'premium', emoji: '☠️', minLevel: 10, minDay: 1000, ngPlus: true },
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
  // Local (within-city district travel)
  walk: { name: 'Walk', emoji: '🚶', costPerRegion: 0, timeDays: 1, riskMod: 1.0, inventoryLimit: 100, sameRegionOnly: true, tier: 'budget', desc: 'Free but slow. Low carry capacity.' },
  taxi: { name: 'Taxi', emoji: '🚕', costPerRegion: 50, timeDays: 0, riskMod: 0.3, inventoryLimit: 300, sameRegionOnly: true, tier: 'budget', desc: 'Quick ride across town. Same day arrival.' },
  // Budget (city-to-city)
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
    location: state.currentLocation, // Track where the business was purchased
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
    state.dirtyMoney = (state.dirtyMoney || 0) + locationRevenue; // Distribution income is dirty
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
  const location = LOCATIONS.find(l => l.id === state.currentLocation) || LOCATIONS[0];
  if (!location) return { prices: {}, events: [] }; // Safety: no locations loaded
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

    // Game day scaling: price volatility increases over 5000 days
    if (typeof getGameDayScaling === 'function') {
      var priceScale = getGameDayScaling(state);
      if (priceScale.priceVolatility > 1.0) {
        price = midPrice * location.priceModifier + (price - midPrice * location.priceModifier) * priceScale.priceVolatility;
      }
    }

    // NG+ price volatility
    if (state.newGamePlus && state.newGamePlus.active) {
      const vol = getNgPlusMod(state, 'priceVolatility', 1);
      price = midPrice + (price - midPrice) * vol;
    }

    // Day-based drug availability: drugs unlock over time
    if (drug.minDay && (state.day || 1) < drug.minDay) {
      prices[drug.id] = null; // Not available yet - haven't discovered this drug
      continue;
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

  // === CHARACTER BACKSTORY MILESTONES ===
  // Story events that trigger at specific points based on your character
  if (state.characterId && !state._backstoryTriggered) state._backstoryTriggered = {};
  var bt = state._backstoryTriggered || {};
  var charId = state.characterId;
  var day = state.day || 1;

  // DROPOUT: Professor reaches out
  if (charId === 'dropout' && day >= 15 && !bt.dropout_professor) {
    bt.dropout_professor = true;
    msgs.push('📞 Professor Herrera called. "I heard about your... career change. I can teach you advanced synthesis. Meet me at the old lab." (+Chemistry contact unlocked)');
    if (typeof applyConsequences === 'function') applyConsequences(state, { ability: 'chemist_knowledge', message: 'Professor Herrera teaches you advanced synthesis techniques.' }, 'backstory', 'dropout_professor');
  }
  // DROPOUT: Act 1 story arc (day 15-500)
  if (charId === 'dropout' && day >= 75 && !bt.dropout_first_batch) {
    bt.dropout_first_batch = true;
    msgs.push('⚗️ Your first real batch is ready. The purity is... impressive. Tito is pleased. "You\'re worth every penny, college boy." Your reputation as a cook begins.');
    if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
  }
  if (charId === 'dropout' && day >= 120 && state.cash > 15000 && !bt.dropout_lab_dream) {
    bt.dropout_lab_dream = true;
    msgs.push('💭 You dream about the university lab. Clean equipment. Proper ventilation. Instead you\'re cooking in a bathtub. Maybe with enough money you could set up a REAL lab...');
  }
  if (charId === 'dropout' && day >= 180 && !bt.dropout_tito_trouble) {
    bt.dropout_tito_trouble = true;
    msgs.push('📞 Tito called. "The Colombians want to meet your cook. They want to buy in bulk. This is big, amigo. But these guys... they don\'t play around." New supplier route possible.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { connected_supplier: 1 }, message: 'Tito introduces you to Colombian buyers.' }, 'backstory', 'dropout_tito');
  }
  if (charId === 'dropout' && day >= 250 && (state.henchmen || []).length >= 3 && !bt.dropout_students) {
    bt.dropout_students = true;
    msgs.push('🎓 Two of your old classmates tracked you down. "We heard you\'re... in business. We need jobs. We know chemistry." Potential lab assistants if you trust them.');
  }
  if (charId === 'dropout' && day >= 320 && state.heat > 40 && !bt.dropout_dea_professor) {
    bt.dropout_dea_professor = true;
    msgs.push('⚠️ Professor Herrera sent a coded message: "The DEA visited the university asking about former students. They know about the lab techniques I taught. Be careful."');
    state.heat = Math.min(100, (state.heat || 0) + 5);
  }
  if (charId === 'dropout' && day >= 400 && state.cash > 100000 && !bt.dropout_breaking_point) {
    bt.dropout_breaking_point = true;
    msgs.push('💭 You catch yourself humming a chemistry formula while counting cash. $' + state.cash.toLocaleString() + '. Your mother thinks you\'re a pharmaceutical rep. How long can you keep this up?');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { conflicted: 1 }, message: 'The weight of your double life grows heavier.' }, 'backstory', 'dropout_breaking');
  }
  if (charId === 'dropout' && day >= 480 && !bt.dropout_act1_end) {
    bt.dropout_act1_end = true;
    var tierNow = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
    if (tierNow >= 5) {
      msgs.push('📖 Chapter 1 closes. From broke college kid to... this. The dean who denied your financial aid drives a Honda. You drive something else entirely.');
    } else {
      msgs.push('📖 You\'ve been in the game long enough to know: there\'s no going back to that lecture hall. The streets are your classroom now.');
    }
  }

  // DROPOUT: University sends investigators
  if (charId === 'dropout' && day >= 60 && state.cash > 50000 && !bt.dropout_uni) {
    bt.dropout_uni = true;
    msgs.push('📋 University of Miami alumni office called. "We noticed you\'re doing well... would you like to make a donation?" They\'re fishing for info.');
    state.heat = Math.min(100, (state.heat || 0) + 5);
  }

  // CORNER KID: Mentor calls in favor
  if (charId === 'corner_kid' && day >= 20 && !bt.corner_mentor) {
    bt.corner_mentor = true;
    msgs.push('📞 Your OG mentor called. "Remember who fronted you that first package, youngblood. Time to pay back. I need a favor..." New mission available.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { loyal: 1 }, message: 'Your mentor from the block needs you.' }, 'backstory', 'corner_mentor');
  }

  // CORNER KID: Act 1 story arc (day 20-480)
  if (charId === 'corner_kid' && day >= 50 && !bt.corner_first_re_up) {
    bt.corner_first_re_up = true;
    msgs.push('💊 First re-up done. Your supplier trusts you now. "You move product fast, lil homie. I\'m gonna give you a better price next time." Street respect +5.');
    if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
  }
  if (charId === 'corner_kid' && day >= 90 && !bt.corner_block_beef) {
    bt.corner_block_beef = true;
    msgs.push('⚠️ Rival crew from two blocks over is selling on YOUR corner. Lil Rico says "We can handle this, boss. Say the word." Your first real territorial conflict.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { territorial: 1 } }, 'backstory', 'corner_beef');
  }
  if (charId === 'corner_kid' && day >= 140 && state.cash > 10000 && !bt.corner_mama_knows) {
    bt.corner_mama_knows = true;
    msgs.push('📞 Your mama called crying. "Baby, I found money in your room. Where is this coming from? Please tell me you ain\'t out there..." She knows. She always knew.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { family_guilt: 1 }, stats: { stress: 10 } }, 'backstory', 'corner_mama');
  }
  if (charId === 'corner_kid' && day >= 200 && !bt.corner_first_gun) {
    bt.corner_first_gun = true;
    msgs.push('🔫 Deshawn brought you a piece. "You need this now, boss. The game changed since you started. Can\'t be out here naked." Your innocence is officially gone.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { armed: 1, hardened: 1 } }, 'backstory', 'corner_gun');
  }
  if (charId === 'corner_kid' && day >= 260 && (state.henchmen || []).length >= 4 && !bt.corner_real_crew) {
    bt.corner_real_crew = true;
    msgs.push('👥 It\'s not just you and the boys anymore. You\'re running a real crew now. People call you "boss" without irony. The OGs on the corner tip their hats.');
    if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 8); adjustRep(state, 'fear', 3); }
  }
  if (charId === 'corner_kid' && day >= 320 && state.heat > 30 && !bt.corner_friend_arrested) {
    bt.corner_friend_arrested = true;
    msgs.push('🚔 Your childhood friend Marcus got picked up. He knows everything about your operation. The cops are squeezing him. Will he hold? Or will he fold?');
    if (typeof applyConsequences === 'function') applyConsequences(state, { delay: { days: 7, event: 'marcus_decision' }, traits: { paranoid: 1 } }, 'backstory', 'corner_marcus');
  }
  if (charId === 'corner_kid' && day >= 380 && !bt.corner_little_brother) {
    bt.corner_little_brother = true;
    msgs.push('👦 Your little brother wants in. He\'s 16. "I can hold corners, I can run packages. Let me work." He looks up to you. That scares you more than any gun.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { responsible: 1 } }, 'backstory', 'corner_brother');
  }
  if (charId === 'corner_kid' && day >= 450 && !bt.corner_block_legend) {
    bt.corner_block_legend = true;
    var terrCount = typeof getControlledTerritories === 'function' ? getControlledTerritories(state).length : 0;
    if (terrCount >= 3) {
      msgs.push('📖 They paint your name on the wall at the basketball court. Not as a memorial — as a legend. The kid from the block who built an empire. But empires attract attention...');
    } else {
      msgs.push('📖 The block is the same. Same broken streetlights, same corner boys. But you\'re different now. The question is: will the block remember you as a hero or a cautionary tale?');
    }
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { block_legend: 1 } }, 'backstory', 'corner_legend');
  }

  // EX-CON: Prison contact offers inside job
  if (charId === 'ex_con' && day >= 25 && !bt.excon_contact) {
    bt.excon_contact = true;
    msgs.push('📞 Big Mike\'s cousin from inside called. "There\'s a guard who can be bought. Prison smuggling route available — big money." Import route unlocked.');
    state.cash += 2000;
  }
  // EX-CON: Probation officer checks in
  if (charId === 'ex_con' && day >= 10 && day % 30 === 0 && !bt['excon_po_' + day]) {
    bt['excon_po_' + day] = true;
    if (state.heat > 30) {
      msgs.push('👮 Probation officer visited. "You\'re associating with known criminals. One more violation and you\'re going back." Heat draws extra attention on probation.');
      state.heat = Math.min(100, (state.heat || 0) + 8);
    } else {
      msgs.push('👮 Probation officer visited. "Keeping your nose clean? Good. Keep it that way."');
    }
  }

  // EX-CON: Act 1 story arc (day 25-480)
  if (charId === 'ex_con' && day >= 60 && !bt.excon_yard_cred) {
    bt.excon_yard_cred = true;
    msgs.push('💪 Word got around that you did five years without snitching. OGs from inside are reaching out. "You solid, homie. We got your back out here." Prison connections paying off.');
    if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 10); adjustRep(state, 'streetCred', 5); }
  }
  if (charId === 'ex_con' && day >= 100 && !bt.excon_ptsd) {
    bt.excon_ptsd = true;
    msgs.push('😰 Nightmare again. The cell door slamming. The fluorescent lights that never turn off. Five years changes a man. You wake up in a cold sweat. Freedom still feels fragile.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { haunted: 1 }, stats: { stress: 8 } }, 'backstory', 'excon_ptsd');
  }
  if (charId === 'ex_con' && day >= 160 && !bt.excon_old_cellmate) {
    bt.excon_old_cellmate = true;
    msgs.push('📞 Your old cellmate Darnell just got released. "I kept my mouth shut for you. Now I need work." He\'s loyal but volatile. Dangerous but useful.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { loyal_friend: 1 } }, 'backstory', 'excon_darnell');
  }
  if (charId === 'ex_con' && day >= 220 && state.cash > 20000 && !bt.excon_victim_family) {
    bt.excon_victim_family = true;
    msgs.push('📞 A woman approached you outside the store. "You killed my husband five years ago. I know who you are." She walked away. She didn\'t go to the police. But she knows.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { guilt: 1, watched: 1 } }, 'backstory', 'excon_victim');
  }
  if (charId === 'ex_con' && day >= 300 && !bt.excon_parole_ending) {
    bt.excon_parole_ending = true;
    msgs.push('📋 Probation period is over. You\'re officially a free man. No more check-ins. No more piss tests. But the record follows you forever. And the streets... the streets are all that\'s left.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { removeTraits: ['on_probation'], traits: { free_man: 1 } }, 'backstory', 'excon_parole_end');
    if (state.characterFlags) state.characterFlags.onProbation = false;
  }
  if (charId === 'ex_con' && day >= 380 && (state.henchmen || []).length >= 5 && !bt.excon_prison_crew) {
    bt.excon_crew = true;
    msgs.push('👥 Half your crew did time. They understand. In prison you learn who\'s real and who\'s not. Out here, that loyalty is everything. Your crew would die for you.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { prison_brotherhood: 1 } }, 'backstory', 'excon_crew');
  }
  if (charId === 'ex_con' && day >= 460 && !bt.excon_act1_close) {
    bt.excon_act1_close = true;
    msgs.push('📖 Five years behind bars. Now ' + Math.floor(day / 30) + ' months free. Big Mike asks: "You ever think about going straight?" You laugh. Neither of you mean it.');
  }

  // HUSTLER: Old mark recognizes you
  if (charId === 'hustler' && day >= 30 && !bt.hustler_mark) {
    bt.hustler_mark = true;
    msgs.push('⚠️ Someone from your hustling days spotted you at the market. "Hey, that\'s the guy who sold me a fake Rolex!" Your cover story needs work. +5 heat.');
    state.heat = Math.min(100, (state.heat || 0) + 5);
  }
  // HUSTLER: Bookie offers partnership
  if (charId === 'hustler' && day >= 45 && state.cash > 20000 && !bt.hustler_bookie) {
    bt.hustler_bookie = true;
    msgs.push('🎰 Your old bookie wants back in. "You got cash now. Let me run a gambling operation under your protection." New operation available.');
  }

  // HUSTLER: Act 1 story arc (day 30-480)
  if (charId === 'hustler' && day >= 80 && !bt.hustler_first_big_score) {
    bt.hustler_first_big_score = true;
    msgs.push('💰 Your first real score. Not a three-card monte table — real money. The rush is different when the stakes are life and death instead of $20 bets.');
    if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 3);
  }
  if (charId === 'hustler' && day >= 150 && !bt.hustler_silver_tongue_test) {
    bt.hustler_silver_tongue_test = true;
    msgs.push('🗣️ A deal went sideways. The buyer pulled a gun. But you talked him down. "Easy, easy — we can both walk away from this richer." Your mouth saved your life tonight.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { silver_tongue: 1, cool_under_pressure: 1 } }, 'backstory', 'hustler_talk');
  }
  if (charId === 'hustler' && day >= 220 && state.frontBusinesses && state.frontBusinesses.length >= 1 && !bt.hustler_legit_front) {
    bt.hustler_legit_front = true;
    msgs.push('🏪 The hustle comes full circle. Running a REAL business feels strange. But the laundromat / taco stand is just another hustle — this time the government is the mark.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { entrepreneur: 1 } }, 'backstory', 'hustler_legit');
  }
  if (charId === 'hustler' && day >= 300 && !bt.hustler_con_artist_past) {
    bt.hustler_con_artist_past = true;
    msgs.push('📞 An old con partner called. "I got a PERFECT scam. Insurance fraud. $200K payout. I just need your face." Old habits calling. Tempting but risky.');
  }
  if (charId === 'hustler' && day >= 370 && state.cash > 50000 && !bt.hustler_gambler_streak) {
    bt.hustler_gambler_streak = true;
    msgs.push('🎰 You\'re at a high-stakes poker game. The table has $80K on it. You can feel the cards. Your hustler instincts are screaming. This is your element.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { gambler: 1, risk_taker: 1 } }, 'backstory', 'hustler_poker');
  }
  if (charId === 'hustler' && day >= 450 && !bt.hustler_act1_close) {
    bt.hustler_act1_close = true;
    msgs.push('📖 Every angle has an angle. You learned that on the streets with fake Rolexes. Now the angles are worth millions. But the biggest hustle of all? Making people think you\'re legitimate.');
  }

  // CONNECTED KID: Cartel demands tribute
  if (charId === 'connected_kid' && day >= 20 && !bt.connected_tribute) {
    bt.connected_tribute = true;
    var tribute = Math.min(state.cash, 5000);
    state.cash = Math.max(0, state.cash - tribute);
    msgs.push('💀 The cartel sent a message. "Your father owed us. Now YOU owe us." They took $' + tribute.toLocaleString() + '. The debt is far from settled.');
  }
  // CONNECTED KID: Father's old lieutenant offers alliance
  if (charId === 'connected_kid' && day >= 50 && !bt.connected_lt) {
    bt.connected_lt = true;
    msgs.push('🤝 Your father\'s former lieutenant found you. "I served your father for 15 years. I\'ll serve you — if you prove yourself worthy." Potential crew upgrade.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { heir: 1, connected: 1 }, message: 'Your father\'s legacy opens doors.' }, 'backstory', 'connected_lt');
  }

  // CONNECTED KID: Act 1 story arc (day 20-480)
  if (charId === 'connected_kid' && day >= 80 && !bt.connected_crew_test) {
    bt.connected_crew_test = true;
    msgs.push('⚠️ Junior — your most disloyal crew member — challenged you in front of everyone. "Your daddy ran things different. You ain\'t him." This is a test. How you respond defines everything.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { tested: 1 } }, 'backstory', 'connected_test');
  }
  if (charId === 'connected_kid' && day >= 130 && !bt.connected_mothers_warning) {
    bt.connected_mothers_warning = true;
    msgs.push('📞 Your mother called from her sister\'s house. "Don\'t be like your father. Please. He chose that life and it destroyed our family. You still have a choice." Do you?');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { family_torn: 1 } }, 'backstory', 'connected_mother');
  }
  if (charId === 'connected_kid' && day >= 200 && state.cash > 30000 && !bt.connected_cartel_meeting) {
    bt.connected_cartel_meeting = true;
    msgs.push('💀 The Colombians want a sit-down. "Your father\'s debts are settled. Now let\'s talk business. You have his connections. We have the product. A new arrangement." This changes everything.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { cartel_connected: 1 }, ability: 'cartel_pricing' }, 'backstory', 'connected_cartel');
  }
  if (charId === 'connected_kid' && day >= 280 && !bt.connected_rival_heir) {
    bt.connected_rival_heir = true;
    msgs.push('⚔️ Another kingpin\'s son appeared — Victor Soto. He claims YOUR father stole territory from HIS father. "Blood debts pass to the next generation." A new rival with a personal vendetta.');
    state.heat = Math.min(100, (state.heat || 0) + 5);
  }
  if (charId === 'connected_kid' && day >= 350 && !bt.connected_fathers_stash) {
    bt.connected_fathers_stash = true;
    msgs.push('🗝️ Flaco found something in the old stash house wall — a lockbox. Inside: $25,000 cash, a coded journal, and a photo of your father with men you don\'t recognize. What was he really into?');
    state.cash += 25000;
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mystery_heir: 1 } }, 'backstory', 'connected_stash');
  }
  if (charId === 'connected_kid' && day >= 420 && (state.henchmen || []).length >= 6 && !bt.connected_legacy_crew) {
    bt.connected_legacy_crew = true;
    msgs.push('👑 Carlos, Flaco, Junior — even the ones who doubted you — they kneel now. Not because of your father\'s name. Because of yours. You ARE the connected kid. No — you\'re the new king.');
    if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 5); adjustRep(state, 'streetCred', 10); }
  }
  if (charId === 'connected_kid' && day >= 470 && !bt.connected_act1_close) {
    bt.connected_act1_close = true;
    msgs.push('📖 Your father\'s shadow grows smaller. This empire isn\'t his anymore — it\'s yours. Built on his bones, sure. But the blood, the sweat, the decisions? All yours.');
  }

  // CLEANSKIN: IRS audit
  if (charId === 'cleanskin' && day >= 40 && state.dirtyMoney > 10000 && !bt.cleanskin_irs) {
    bt.cleanskin_irs = true;
    msgs.push('📋 IRS audit notice arrived. Your legitimate background makes discrepancies MORE suspicious, not less. They\'re looking at your tax returns.');
    if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 8);
  }

  // VETERAN: Old enemy resurfaces
  if (charId === 'veteran' && day >= 35 && !bt.veteran_enemy) {
    bt.veteran_enemy = true;
    msgs.push('⚠️ You got a message: "I found you, old man. Remember the job in \'72? I never forgot your face." An old enemy is hunting you. Watch your back.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { delay: { days: 7, event: 'veteran_ambush' }, traits: { hunted: true }, message: 'An old enemy from your enforcer days is coming for you.' }, 'backstory', 'veteran_enemy');
  }

  // IMMIGRANT: ICE raid scare
  if (charId === 'immigrant' && day >= 30 && state.heat > 20 && !bt.immigrant_ice) {
    bt.immigrant_ice = true;
    msgs.push('🚨 ICE agents were spotted in your neighborhood. Your documentation won\'t survive scrutiny. Lay low for a while. +10 heat.');
    state.heat = Math.min(100, (state.heat || 0) + 10);
  }
  // IMMIGRANT: Community becomes your shield
  if (charId === 'immigrant' && day >= 60 && (state.rep && state.rep.trust > 30) && !bt.immigrant_community) {
    bt.immigrant_community = true;
    msgs.push('🤝 The community has your back. Local shop owners, families, church — they all vouch for you. "He\'s one of us." Community protection activated. -5 heat.');
    state.heat = Math.max(0, (state.heat || 0) - 5);
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { community_protected: true }, ability: 'community_shield', message: 'Your community protects you from scrutiny.' }, 'backstory', 'immigrant_community');
  }

  // CLEANSKIN: Act 1 story arc (day 40-480)
  if (charId === 'cleanskin' && day >= 80 && !bt.cleanskin_first_deal) {
    bt.cleanskin_first_deal = true;
    msgs.push('💊 Your first drug deal. Hands shaking. Heart pounding. A man in a parking lot. Cash in an envelope. Product in a bag. You drove home at exactly the speed limit.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { nervous: 1 } }, 'backstory', 'cleanskin_first');
  }
  if (charId === 'cleanskin' && day >= 140 && !bt.cleanskin_double_life) {
    bt.cleanskin_double_life = true;
    msgs.push('👔 Monday you wore a suit to meet your banker. Tuesday you wore all black to meet a dealer in Overtown. Two lives. One person. The mask is getting harder to maintain.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { double_life: 1 } }, 'backstory', 'cleanskin_double');
  }
  if (charId === 'cleanskin' && day >= 200 && state.frontBusinesses && state.frontBusinesses.length >= 1 && !bt.cleanskin_laundering_natural) {
    bt.cleanskin_laundering_natural = true;
    msgs.push('🏦 Laundering money feels... natural to you. Years of accounting trained you for this. Shell companies, layered transactions, depreciation schedules. You\'re an artist with spreadsheets.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { money_artist: 1 }, ability: 'advanced_laundering' }, 'backstory', 'cleanskin_launder');
  }
  if (charId === 'cleanskin' && day >= 270 && !bt.cleanskin_wife_suspicious) {
    bt.cleanskin_wife_suspicious = true;
    msgs.push('📞 Your wife/partner noticed the new watch. The nicer restaurants. "Did you get a promotion you didn\'t tell me about?" The lies are getting bigger.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { liar: 1 }, stats: { stress: 5 } }, 'backstory', 'cleanskin_wife');
  }
  if (charId === 'cleanskin' && day >= 340 && state.cash > 80000 && !bt.cleanskin_offshore) {
    bt.cleanskin_offshore = true;
    msgs.push('🌴 A contact in the Caymans set up an offshore account. $' + Math.round(state.cash * 0.1).toLocaleString() + ' moved overseas. The IRS can\'t touch it. You\'re thinking like a criminal now.');
    state.bank += Math.round(state.cash * 0.1);
    state.cash -= Math.round(state.cash * 0.1);
  }
  if (charId === 'cleanskin' && day >= 410 && !bt.cleanskin_old_boss) {
    bt.cleanskin_old_boss = true;
    msgs.push('📞 Your old boss from the accounting firm called. "We need your expertise for a big audit. Come back. We\'ll double your salary." $120K/year. You made that yesterday.');
  }
  if (charId === 'cleanskin' && day >= 470 && !bt.cleanskin_act1_close) {
    bt.cleanskin_act1_close = true;
    msgs.push('📖 The accountant became the kingpin. Every dollar tracked. Every risk calculated. You didn\'t stumble into crime — you planned it like a quarterly report.');
  }

  // VETERAN: Act 1 story arc (day 35-480)
  if (charId === 'veteran' && day >= 70 && !bt.veteran_old_wounds) {
    bt.veteran_old_wounds = true;
    msgs.push('🩹 The bullet wound from \'72 acts up in the rain. Tombstone hands you pills. "Boss, you gotta take care of yourself. The body remembers what the mind tries to forget."');
    state.health = Math.max(50, (state.health || 100) - 5);
  }
  if (charId === 'veteran' && day >= 130 && !bt.veteran_reputation_precedes) {
    bt.veteran_reputation_precedes = true;
    msgs.push('😤 A young dealer recognized you at a bar. "Holy shit... you\'re the one who..." He didn\'t finish the sentence. He bought you a drink with shaking hands. Your past follows you.');
    if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 8); adjustRep(state, 'streetCred', 5); }
  }
  if (charId === 'veteran' && day >= 200 && !bt.veteran_teaching_young) {
    bt.veteran_teaching_young = true;
    msgs.push('🥊 You\'re training the young crew. Knife work. Situational awareness. When to fight and when to walk away. They look at you like you\'re a war hero. You know what you really are.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mentor: 1, teacher: 1 } }, 'backstory', 'veteran_teaching');
  }
  if (charId === 'veteran' && day >= 270 && !bt.veteran_funeral) {
    bt.veteran_funeral = true;
    msgs.push('⚰️ An old associate\'s funeral. Half the mourners are in the game. Half the mourners are carrying. You notice three unmarked cars across the street. Feds photographing attendees.');
    state.heat = Math.min(100, (state.heat || 0) + 3);
  }
  if (charId === 'veteran' && day >= 340 && state.health < 80 && !bt.veteran_mortality) {
    bt.veteran_mortality = true;
    msgs.push('💭 You woke up at 3 AM and couldn\'t go back to sleep. How many years do you have left? The body is failing. The game doesn\'t have a retirement plan.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mortality_aware: 1 } }, 'backstory', 'veteran_mortality');
  }
  if (charId === 'veteran' && day >= 400 && !bt.veteran_one_last_score) {
    bt.veteran_one_last_score = true;
    msgs.push('💭 Razor said it best: "One more big score, boss. Then we disappear. Somewhere warm where nobody knows our names." The dream of getting out. Everyone has it. Nobody does it.');
  }
  if (charId === 'veteran' && day >= 470 && !bt.veteran_act1_close) {
    bt.veteran_act1_close = true;
    msgs.push('📖 Old soldier. New war. The scars tell the story. The money fills the gaps. But at night, in the dark, you know: the game always collects its debts.');
  }

  // IMMIGRANT: Act 1 story arc (day 30-480)
  if (charId === 'immigrant' && day >= 80 && !bt.immigrant_language_barrier) {
    bt.immigrant_language_barrier = true;
    msgs.push('🗣️ A deal almost went bad because of language. The buyer thought you said "fifty" when you said "fifteen." You need to improve your English. Or find a translator you trust.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { language_barrier: 1 } }, 'backstory', 'immigrant_language');
  }
  if (charId === 'immigrant' && day >= 140 && !bt.immigrant_home_country_news) {
    bt.immigrant_home_country_news = true;
    msgs.push('📞 Call from home. Your sister is sick. The hospital costs money you don\'t have... unless you use the dirty money. The family needs $3,000 for treatment.');
    state.cash = Math.max(0, (state.cash || 0) - 3000);
    state.dirtyMoney = Math.max(0, (state.dirtyMoney || 0) - 3000);
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { family_first: 1 } }, 'backstory', 'immigrant_sister');
  }
  if (charId === 'immigrant' && day >= 210 && !bt.immigrant_connect_value) {
    bt.immigrant_connect_value = true;
    msgs.push('🌍 Your international connection sent a gift: premium product at 40% below market. American dealers can\'t get this quality. Your homeland connections are priceless.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { international_bridge: 1 } }, 'backstory', 'immigrant_connect');
  }
  if (charId === 'immigrant' && day >= 280 && !bt.immigrant_community_leader) {
    bt.immigrant_community_leader = true;
    msgs.push('🤝 The immigrant community looks to you now. Not just for money — for advice, protection, justice. You\'re becoming what you never expected: a community leader. A dangerous one.');
    if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'publicImage', 5); }
  }
  if (charId === 'immigrant' && day >= 350 && !bt.immigrant_deportation_threat) {
    bt.immigrant_deportation_threat = true;
    msgs.push('🚨 ICE has your address. A sympathetic clerk at the immigration office tipped you off. "They\'re building a file. You have maybe 30 days." Time to get papers or disappear.');
    if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { fugitive_status: 1 }, stats: { heat: 10, stress: 15 } }, 'backstory', 'immigrant_deport');
  }
  if (charId === 'immigrant' && day >= 420 && state.cash > 50000 && !bt.immigrant_embassy) {
    bt.immigrant_embassy = true;
    msgs.push('🏛️ A corrupt embassy official can make your problems disappear. New papers, clean identity, $30,000. Or you can keep running. The choice defines your future.');
  }
  if (charId === 'immigrant' && day >= 470 && !bt.immigrant_act1_close) {
    bt.immigrant_act1_close = true;
    msgs.push('📖 You crossed an ocean to find a better life. You found the American dream — just not the version they put on postcards. Home feels further away than ever.');
  }

  // === LATE-GAME CHARACTER MILESTONES (Day 100+) ===
  if (charId && day >= 100 && bt) {
    // ALL CHARACTERS: Empire reflection at day 100
    if (day >= 100 && !bt.empire_reflection) {
      bt.empire_reflection = true;
      var nwNow = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      if (nwNow > 200000) {
        msgs.push('💭 You look out over the Miami skyline. $' + nwNow.toLocaleString() + ' in assets. You came from nothing. The question is: what now?');
      } else {
        msgs.push('💭 100 days in the game. The money comes and goes. The streets take their toll. But you\'re still standing.');
      }
    }

    // DROPOUT: University wants to honor you (if rich and clean)
    if (charId === 'dropout' && day >= 120 && nwNow > 500000 && (state.heat || 0) < 20 && !bt.dropout_honor) {
      bt.dropout_honor = true;
      msgs.push('🎓 University of Miami wants you as a guest speaker. "Self-made success story." The irony isn\'t lost on you.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { public_figure: true }, stats: { publicImage: 10 } }, 'backstory', 'dropout_honor');
    }

    // CORNER KID: OG mentor dies
    if (charId === 'corner_kid' && day >= 150 && !bt.corner_mentor_death) {
      bt.corner_mentor_death = true;
      msgs.push('💀 Word from the block: your OG mentor was found dead. Drive-by. The streets took another one. He taught you everything.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { grieving: 1, hardened: 1 }, stats: { fear: 5 } }, 'backstory', 'corner_mentor_death');
    }

    // EX-CON: Offered witness protection
    if (charId === 'ex_con' && day >= 130 && (state.heat || 0) > 60 && !bt.excon_witsec) {
      bt.excon_witsec = true;
      msgs.push('🕵️ A federal agent approached you. "We can make this all go away. New identity. New life. All you have to do is testify." The offer sits heavy.');
    }

    // HUSTLER: Old bookie wants revenge
    if (charId === 'hustler' && day >= 120 && !bt.hustler_revenge) {
      bt.hustler_revenge = true;
      msgs.push('⚠️ The bookie you stiffed years ago? He found you. "You think success makes you untouchable? I\'ve been watching." New enemy on the horizon.');
      state.heat = Math.min(100, (state.heat || 0) + 8);
    }

    // CONNECTED KID: Father breaks out of prison
    if (charId === 'connected_kid' && day >= 180 && !bt.connected_father) {
      bt.connected_father = true;
      msgs.push('📞 "Mijo... I\'m out. They couldn\'t hold me forever." Your father is free. He wants his empire back. What you\'ve built is HIS legacy — or is it yours now?');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { heir_challenged: true }, message: 'Your father is back. The succession crisis begins.' }, 'backstory', 'connected_father');
    }

    // VETERAN: Old partner resurfaces
    if (charId === 'veteran' && day >= 140 && !bt.veteran_partner) {
      bt.veteran_partner = true;
      msgs.push('📞 "It\'s been 20 years, but I never forgot you. I need help. One last job. For old times\' sake." Your old partner from the enforcer days needs you.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { nostalgic: 1 } }, 'backstory', 'veteran_partner');
    }

    // IMMIGRANT: Green card opportunity
    if (charId === 'immigrant' && day >= 160 && state.cash > 100000 && !bt.immigrant_greencard) {
      bt.immigrant_greencard = true;
      msgs.push('📋 A lawyer says he can get you legal status. $50,000 and some creative paperwork. No more looking over your shoulder. But $50K is a lot of laundered cash...');
    }

    // CLEANSKIN: Former colleagues suspect you
    if (charId === 'cleanskin' && day >= 110 && state.cash > 200000 && !bt.cleanskin_colleagues) {
      bt.cleanskin_colleagues = true;
      msgs.push('📞 Your old accounting firm called. "We ran your numbers. Something doesn\'t add up. Where\'s the money coming from?" They\'re asking questions.');
      state.heat = Math.min(100, (state.heat || 0) + 5);
    }
  }

  // === ACT 2 CHARACTER STORIES (Day 500-1500) ===
  if (charId && day >= 500 && day <= 1500 && bt) {
    // ALL: Transition to Act 2
    if (day >= 500 && !bt.act2_begins) {
      bt.act2_begins = true;
      msgs.push('📖 ACT 2: BUILDING THE EMPIRE. The streets know your name. Now the question is: how big can you get before someone takes it all away?');
    }

    // DROPOUT: Act 2 - From cook to kingpin chemist
    if (charId === 'dropout' && day >= 550 && !bt.dropout_a2_superlab) {
      bt.dropout_a2_superlab = true;
      msgs.push('⚗️ You\'ve outgrown bathtubs and motel rooms. You need a REAL lab. Industrial equipment. Ventilation. The chemistry is scaling up. Time to build a superlab.');
    }
    if (charId === 'dropout' && day >= 700 && state.cash > 200000 && !bt.dropout_a2_formula) {
      bt.dropout_a2_formula = true;
      msgs.push('🧪 You\'ve perfected a formula no one else can replicate. 98% purity. Dealers call it "College" on the streets. Your brand is becoming legendary.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { master_chemist: 1 }, ability: 'purity_master' }, 'backstory', 'dropout_a2_formula');
    }
    if (charId === 'dropout' && day >= 900 && !bt.dropout_a2_rival_cook) {
      bt.dropout_a2_rival_cook = true;
      msgs.push('⚠️ A rival cook is producing something similar. Not as pure, but cheaper. "College" is being undercut. Your monopoly is threatened. Do you innovate or eliminate?');
    }
    if (charId === 'dropout' && day >= 1100 && !bt.dropout_a2_documentary) {
      bt.dropout_a2_documentary = true;
      msgs.push('📺 A journalist is making a documentary about Miami\'s "designer drug epidemic." Your formula is the star, even if they don\'t know your name... yet.');
      state.heat = Math.min(100, (state.heat || 0) + 8);
    }
    if (charId === 'dropout' && day >= 1300 && !bt.dropout_a2_professor_dead) {
      bt.dropout_a2_professor_dead = true;
      msgs.push('💀 Professor Herrera was found dead. Overdose — on YOUR product. The man who taught you chemistry died from what you created. This weight doesn\'t wash off.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { creator_guilt: 1, haunted: 1 }, stats: { stress: 15 } }, 'backstory', 'dropout_a2_professor');
    }

    // CORNER KID: Act 2 - Block boss to district king
    if (charId === 'corner_kid' && day >= 550 && !bt.corner_a2_rival_gang) {
      bt.corner_a2_rival_gang = true;
      msgs.push('⚔️ The rival crew from day one? They\'re back. Bigger. More armed. They want your blocks AND your connect. This isn\'t corner beef anymore. This is war.');
    }
    if (charId === 'corner_kid' && day >= 700 && !bt.corner_a2_rico_shot) {
      bt.corner_a2_rico_shot = true;
      msgs.push('🔫 Lil Rico took a bullet protecting your stash house. He\'s alive but changed. "I almost died for you, boss. I need to know this was worth it."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { tested_loyalty: 1 } }, 'backstory', 'corner_a2_rico');
    }
    if (charId === 'corner_kid' && day >= 900 && state.cash > 100000 && !bt.corner_a2_mama_house) {
      bt.corner_a2_mama_house = true;
      msgs.push('🏠 You bought Mama a house. She cried. She didn\'t ask where the money came from. Maybe she\'s accepted it. Or maybe she\'s just tired of asking.');
      state.cash -= 50000;
      if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', 5);
    }
    if (charId === 'corner_kid' && day >= 1100 && !bt.corner_a2_og_dies) {
      bt.corner_a2_og_dies = true;
      msgs.push('💀 Another OG from the block gone. Not from violence — from diabetes. The streets kill you slow too. You went to the funeral. The whole block showed up.');
    }
    if (charId === 'corner_kid' && day >= 1400 && !bt.corner_a2_little_bro_trouble) {
      bt.corner_a2_little_bro_trouble = true;
      msgs.push('🚔 Your little brother got arrested. Selling on a corner you TOLD him to stay away from. $5,000 bail. He\'s doing exactly what you did. And you can\'t stop him.');
      state.cash = Math.max(0, state.cash - 5000);
    }

    // EX-CON: Act 2 - The institutional man builds an institution
    if (charId === 'ex_con' && day >= 550 && !bt.excon_a2_prison_network) {
      bt.excon_a2_prison_network = true;
      msgs.push('🔗 Your prison network is your greatest asset. Guys getting released every month, all looking for work, all loyal. You\'re building an army of men who owe you.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { institutional: 1 } }, 'backstory', 'excon_a2_network');
    }
    if (charId === 'ex_con' && day >= 750 && !bt.excon_a2_old_case) {
      bt.excon_a2_old_case = true;
      msgs.push('📋 A reporter dug up your old case. "Former convict now suspected of running major drug operation." The story ran in the Metro section. Page 3. But still...');
      state.heat = Math.min(100, (state.heat || 0) + 10);
    }
    if (charId === 'ex_con' && day >= 1000 && !bt.excon_a2_warden_deal) {
      bt.excon_a2_warden_deal = true;
      msgs.push('🏢 The warden who locked you up is retiring. He wants money. "I can lose evidence files. Witness statements. For the right price." Corruption goes all the way up.');
    }
    if (charId === 'ex_con' && day >= 1250 && !bt.excon_a2_darnell_betrayal) {
      bt.excon_a2_darnell_betrayal = true;
      msgs.push('🐀 Darnell — your old cellmate — was seen talking to feds. "He was in there two hours, man. That ain\'t a parking ticket." Your most trusted man might be flipping.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { betrayed: 1, paranoid: 1 } }, 'backstory', 'excon_a2_darnell');
    }

    // HUSTLER: Act 2 - The con man becomes the corporation
    if (charId === 'hustler' && day >= 600 && !bt.hustler_a2_shell_companies) {
      bt.hustler_a2_shell_companies = true;
      msgs.push('🏢 You set up a network of shell companies. LLCs inside LLCs. Money flows through like water through a sieve. The hustler is becoming a businessman. The IRS will never untangle this.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { corporate_criminal: 1 }, ability: 'shell_network' }, 'backstory', 'hustler_a2_shell');
    }
    if (charId === 'hustler' && day >= 850 && !bt.hustler_a2_miami_society) {
      bt.hustler_a2_miami_society = true;
      msgs.push('🥂 You\'re invited to a charity gala in South Beach. Rubbing elbows with politicians, real estate moguls, and... other people like you. Miami society is just a higher-stakes con.');
      if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', 8);
    }
    if (charId === 'hustler' && day >= 1100 && !bt.hustler_a2_fbi_interest) {
      bt.hustler_a2_fbi_interest = true;
      msgs.push('🕵️ FBI white-collar crimes division opened a preliminary inquiry. Your shell companies are too clean. Ironically, being TOO good at laundering made them suspicious.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 10);
    }
    if (charId === 'hustler' && day >= 1350 && !bt.hustler_a2_bookie_debt) {
      bt.hustler_a2_bookie_debt = true;
      msgs.push('💀 The bookie sent a clearer message this time. A dead cat on your doorstep with a note: "You\'re next." The past doesn\'t stay buried in Miami.');
      state.heat = Math.min(100, (state.heat || 0) + 5);
    }

    // CONNECTED KID: Act 2 - Heir becomes ruler
    if (charId === 'connected_kid' && day >= 550 && !bt.connected_a2_cartel_war) {
      bt.connected_a2_cartel_war = true;
      msgs.push('💀 Two cartels are fighting over Miami supply lines. Both want your loyalty. Choosing one means war with the other. Not choosing means war with BOTH. Welcome to geopolitics.');
    }
    if (charId === 'connected_kid' && day >= 750 && !bt.connected_a2_fathers_journal) {
      bt.connected_a2_fathers_journal = true;
      msgs.push('📖 You finally decoded your father\'s journal. Names. Dates. Shipment routes. Safe deposit boxes in three countries. But also: a list of people he betrayed. Some are still alive.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { fathers_secrets: 1 }, ability: 'legacy_intel' }, 'backstory', 'connected_a2_journal');
    }
    if (charId === 'connected_kid' && day >= 950 && !bt.connected_a2_uncle_appears) {
      bt.connected_a2_uncle_appears = true;
      msgs.push('👤 A man claiming to be your father\'s brother appeared. You never knew he existed. "Your father and I... had a falling out. But family is family. Let me help you." Trust him?');
    }
    if (charId === 'connected_kid' && day >= 1150 && !bt.connected_a2_soto_escalation) {
      bt.connected_a2_soto_escalation = true;
      msgs.push('⚔️ Victor Soto bombed one of your stash houses. Three crew members injured. "This is just the beginning," his message said. The heir war is escalating.');
      if (state.henchmen && state.henchmen.length > 0) {
        for (var si = 0; si < Math.min(3, state.henchmen.length); si++) {
          if (!state.henchmen[si].injured) { state.henchmen[si].injured = true; state.henchmen[si].health = 30; break; }
        }
      }
    }
    if (charId === 'connected_kid' && day >= 1400 && !bt.connected_a2_fbi_father) {
      bt.connected_a2_fbi_father = true;
      msgs.push('🕵️ FBI showed you surveillance photos from 1985. Your father meeting with someone. "We know everything he did. The question is: are you making the same mistakes?"');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 8);
    }

    // CLEANSKIN: Act 2 - The perfect criminal
    if (charId === 'cleanskin' && day >= 550 && !bt.cleanskin_a2_second_identity) {
      bt.cleanskin_a2_second_identity = true;
      msgs.push('🎭 You\'ve built a second identity. The accountant by day, the kingpin by night. Two phones. Two wardrobes. Two sets of friends. The split is becoming permanent.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { dual_identity: 1 } }, 'backstory', 'cleanskin_a2_dual');
    }
    if (charId === 'cleanskin' && day >= 750 && !bt.cleanskin_a2_embezzlement) {
      bt.cleanskin_a2_embezzlement = true;
      msgs.push('💰 A business associate offers a side deal: embezzle from a real estate developer and launder it through your fronts. $500K potential. Your accounting skills make it almost risk-free.');
    }
    if (charId === 'cleanskin' && day >= 950 && !bt.cleanskin_a2_divorce_threat) {
      bt.cleanskin_a2_divorce_threat = true;
      msgs.push('💔 Your partner found the second phone. "Who is she?" they asked. You wish the answer was that simple. "There is no she." "Then WHAT is it?" The marriage is cracking.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { marriage_crisis: 1 }, stats: { stress: 10 } }, 'backstory', 'cleanskin_a2_divorce');
    }
    if (charId === 'cleanskin' && day >= 1150 && state.cash > 500000 && !bt.cleanskin_a2_tax_haven) {
      bt.cleanskin_a2_tax_haven = true;
      msgs.push('🏝️ Your offshore accounts are growing. Panama, Caymans, Singapore. You\'ve moved $' + Math.round(state.bank * 0.3).toLocaleString() + ' beyond the reach of any government. The numbers are beautiful.');
    }
    if (charId === 'cleanskin' && day >= 1350 && !bt.cleanskin_a2_irs_investigation) {
      bt.cleanskin_a2_irs_investigation = true;
      msgs.push('📋 IRS Criminal Investigation Division. Not an audit — a criminal investigation. Agent Patricia Vance assigned to your case. She specializes in financial crime. She\'s good.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 15);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { hunted_by_irs: 1 } }, 'backstory', 'cleanskin_a2_irs');
    }

    // VETERAN: Act 2 - Last soldier standing
    if (charId === 'veteran' && day >= 550 && !bt.veteran_a2_body_count) {
      bt.veteran_a2_body_count = true;
      var kills = state.peopleKilled || 0;
      msgs.push('💭 Tombstone asked you something nobody ever asks: "How many, boss? Total." You don\'t answer. The number lives in a place you don\'t visit.' + (kills > 10 ? ' But the nightmares do.' : ''));
    }
    if (charId === 'veteran' && day >= 750 && !bt.veteran_a2_young_challenger) {
      bt.veteran_a2_young_challenger = true;
      msgs.push('⚔️ A young gun named "Flash" is making a name by calling you out. "Old man\'s time is over." He doesn\'t know what he\'s challenging. He\'ll learn.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { challenged: 1 } }, 'backstory', 'veteran_a2_flash');
    }
    if (charId === 'veteran' && day >= 1000 && !bt.veteran_a2_medical) {
      bt.veteran_a2_medical = true;
      msgs.push('🏥 Doctor says the old injuries need surgery. Knees, back, the shoulder. $30,000 for the operations. Or you keep going until your body gives out. At your age...');
      state.maxHealth = Math.max(60, (state.maxHealth || 100) - 5);
    }
    if (charId === 'veteran' && day >= 1200 && !bt.veteran_a2_razor_loyalty) {
      bt.veteran_a2_razor_loyalty = true;
      msgs.push('🤝 Razor pulled you aside. "I could make more money with the Colombians. You know that. But I\'m here because of what we\'ve been through. That doesn\'t have a price tag."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { true_loyalty: 1 } }, 'backstory', 'veteran_a2_razor');
    }
    if (charId === 'veteran' && day >= 1450 && !bt.veteran_a2_heart_scare) {
      bt.veteran_a2_heart_scare = true;
      msgs.push('❤️ Chest pains in the middle of a deal. Tombstone drove you to the hospital. "Just stress," the doctor said. But you saw his face. It wasn\'t just stress.');
      state.health = Math.max(40, (state.health || 100) - 15);
      state.maxHealth = Math.max(55, (state.maxHealth || 100) - 10);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { heart_condition: 1 } }, 'backstory', 'veteran_a2_heart');
    }

    // IMMIGRANT: Act 2 - Bridge between two worlds
    if (charId === 'immigrant' && day >= 550 && !bt.immigrant_a2_supply_route) {
      bt.immigrant_a2_supply_route = true;
      msgs.push('🌍 Your homeland contact established a permanent pipeline. Product flows through three countries before reaching Miami. Nobody can trace it. Your international bridge is worth millions.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { pipeline_master: 1 }, ability: 'international_pipeline' }, 'backstory', 'immigrant_a2_pipeline');
    }
    if (charId === 'immigrant' && day >= 750 && !bt.immigrant_a2_community_center) {
      bt.immigrant_a2_community_center = true;
      msgs.push('🏫 You funded a community center. English classes, legal aid, job training. The neighborhood painted a mural of you. Nobody knows the money came from drugs. Or maybe they do, and they don\'t care.');
      state.cash = Math.max(0, state.cash - 20000);
      if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 10); adjustRep(state, 'trust', 8); }
    }
    if (charId === 'immigrant' && day >= 1000 && !bt.immigrant_a2_cousin_arrives) {
      bt.immigrant_a2_cousin_arrives = true;
      msgs.push('✈️ Your cousin arrived from home. Same desperation you had. Same empty pockets. "Cousin, you made it. Show me how." Another soul to save or corrupt.');
    }
    if (charId === 'immigrant' && day >= 1200 && !bt.immigrant_a2_home_country_politics) {
      bt.immigrant_a2_home_country_politics = true;
      msgs.push('🏛️ A politician from your home country reached out. "We know about your success in Miami. We have a proposal. Help us, and we can give you citizenship. Real papers. But we need your... logistics."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { political_pawn: 1 } }, 'backstory', 'immigrant_a2_politics');
    }
    if (charId === 'immigrant' && day >= 1450 && !bt.immigrant_a2_family_reunion) {
      bt.immigrant_a2_family_reunion = true;
      msgs.push('✈️ You flew your mother to Miami. She cried when she saw the house, the car, the life you\'ve built. "My child, I\'m so proud." She doesn\'t know. She can never know.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mothers_pride: 1 }, stats: { stress: 8 } }, 'backstory', 'immigrant_a2_mother');
    }
  }

  // === ACT 3 CHARACTER STORIES (Day 1500-2500) ===
  if (charId && day >= 1500 && day <= 2500 && bt) {
    if (day >= 1500 && !bt.act3_begins) {
      bt.act3_begins = true;
      var nw3 = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      msgs.push('📖 ACT 3: THE EMPIRE. Net worth: $' + nw3.toLocaleString() + '. You\'ve built something real. Now everyone wants a piece — the feds, the rivals, the cartels. Even the people closest to you.');
    }

    // DROPOUT: Act 3 - The empire of chemistry
    if (charId === 'dropout' && day >= 1550 && !bt.dropout_a3_dea_chemist) {
      bt.dropout_a3_dea_chemist = true;
      msgs.push('🔬 The DEA hired a forensic chemist to reverse-engineer your formula. They call it "Operation Periodic Table." Every batch you produce is being analyzed. They\'re getting closer.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 10);
    }
    if (charId === 'dropout' && day >= 1800 && !bt.dropout_a3_student_od) {
      bt.dropout_a3_student_od = true;
      msgs.push('💀 A college student died from "College." National news. Parents crying on camera. Senators calling for action. Your product is famous — and now it has a body count on CNN.');
      state.heat = Math.min(100, (state.heat || 0) + 15);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mass_producer: 1, public_enemy: 1 }, stats: { stress: 20 } }, 'backstory', 'dropout_a3_cnn');
    }
    if (charId === 'dropout' && day >= 2050 && !bt.dropout_a3_chemistry_addiction) {
      bt.dropout_a3_chemistry_addiction = true;
      msgs.push('💊 You started sampling your own product. "Just to test purity," you tell yourself. The chemistry student became the chemist became the user. Classic trajectory.');
      state.health = Math.max(50, (state.health || 100) - 10);
    }
    if (charId === 'dropout' && day >= 2300 && !bt.dropout_a3_mother_discovers) {
      bt.dropout_a3_mother_discovers = true;
      msgs.push('📞 Your mother saw the CNN segment. She recognized the formula name. She called screaming. "MY SON IS A DRUG DEALER?!" She hung up. She hasn\'t called back.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { disowned: 1 }, stats: { stress: 25 } }, 'backstory', 'dropout_a3_mother');
    }
    if (charId === 'dropout' && day >= 2450 && !bt.dropout_a3_cure) {
      bt.dropout_a3_cure = true;
      msgs.push('💭 Late at night in the lab, you had a thought: what if you used your skills for something else? Pharmaceuticals. Medicine. A cure instead of a curse. But the money...');
    }

    // CORNER KID: Act 3 - King of the block, prisoner of the crown
    if (charId === 'corner_kid' && day >= 1550 && !bt.corner_a3_empire_weight) {
      bt.corner_a3_empire_weight = true;
      msgs.push('👑 The crown is heavy. Everyone wants something. Crew needs pay. Territory needs defending. Suppliers need assurance. You haven\'t slept more than 4 hours in weeks.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { stats: { stress: 15 } }, 'backstory', 'corner_a3_weight');
    }
    if (charId === 'corner_kid' && day >= 1800 && !bt.corner_a3_deshawn_shot) {
      bt.corner_a3_deshawn_shot = true;
      msgs.push('🔫 Deshawn is dead. Drive-by at the corner where you both grew up. He was 23. You were supposed to protect him. The block lost another one. Your fault.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { survivor_guilt: 1, rage: 1 }, stats: { stress: 20 } }, 'backstory', 'corner_a3_deshawn');
      // Remove Deshawn from crew if present
      if (state.henchmen) {
        var dIdx = state.henchmen.findIndex(function(h) { return h.name === 'Deshawn'; });
        if (dIdx >= 0) state.henchmen.splice(dIdx, 1);
      }
    }
    if (charId === 'corner_kid' && day >= 2100 && !bt.corner_a3_rico_lieutenant) {
      bt.corner_a3_rico_lieutenant = true;
      msgs.push('⭐ Lil Rico is your right hand now. Lieutenant. He runs the day-to-day while you strategize. "I got you, boss. Since day one." The kid from the corner became your general.');
    }
    if (charId === 'corner_kid' && day >= 2300 && !bt.corner_a3_gentrification) {
      bt.corner_a3_gentrification = true;
      msgs.push('🏗️ Developers are buying up your block. Coffee shops where trap houses used to be. Your corner is now a yoga studio. The neighborhood that made you is being erased.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { nostalgic: 1 } }, 'backstory', 'corner_a3_gentrify');
    }
    if (charId === 'corner_kid' && day >= 2480 && !bt.corner_a3_mama_sick) {
      bt.corner_a3_mama_sick = true;
      msgs.push('🏥 Mama is sick. Seriously sick. The best doctors cost money you have but can\'t explain. The house you bought her? She might not live to enjoy it.');
      state.cash = Math.max(0, state.cash - 25000);
    }

    // EX-CON: Act 3 - The institution crumbles
    if (charId === 'ex_con' && day >= 1550 && !bt.excon_a3_old_enemies) {
      bt.excon_a3_old_enemies = true;
      msgs.push('⚔️ Men you put away are getting out. They remember. Three released this month alone. "I did 8 years because of YOU," one of them said outside a bar. The past is assembling against you.');
    }
    if (charId === 'ex_con' && day >= 1800 && !bt.excon_a3_big_mike_dilemma) {
      bt.excon_a3_big_mike_dilemma = true;
      msgs.push('⚖️ Big Mike killed a man in broad daylight. Your most loyal soldier, your oldest friend. Witnesses saw everything. He\'s looking at life. "Boss, I need you. Like you needed me."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { loyalty_tested: 1 } }, 'backstory', 'excon_a3_mike');
    }
    if (charId === 'ex_con' && day >= 2100 && !bt.excon_a3_prison_uprising) {
      bt.excon_a3_prison_uprising = true;
      msgs.push('🔥 A riot at your old prison. Your contacts inside are in danger. The warden calls YOU — the former inmate — for help negotiating. "You\'re the only one they\'ll listen to."');
    }
    if (charId === 'ex_con' && day >= 2350 && !bt.excon_a3_sons_question) {
      bt.excon_a3_sons_question = true;
      msgs.push('👦 A boy showed up at your door. 12 years old. "Are you my father?" Five years in prison. You did the math. He\'s the right age. His mother sent him.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { unknown_child: 1 }, stats: { stress: 15 } }, 'backstory', 'excon_a3_son');
    }

    // HUSTLER: Act 3 - The con unravels
    if (charId === 'hustler' && day >= 1550 && !bt.hustler_a3_ponzi_opportunity) {
      bt.hustler_a3_ponzi_opportunity = true;
      msgs.push('💰 A Wall Street connection offers a Ponzi scheme opportunity. $2M potential. The hustle of a lifetime. But Ponzi schemes always collapse. The question is: can you get out before it does?');
    }
    if (charId === 'hustler' && day >= 1800 && !bt.hustler_a3_partner_betrayal) {
      bt.hustler_a3_partner_betrayal = true;
      msgs.push('🗡️ Your business partner emptied a shared account. $150,000 gone. "Business is business," he texted. You taught him too well. The hustler got hustled.');
      state.cash = Math.max(0, state.cash - 150000);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { betrayed: 1, vengeful: 1 } }, 'backstory', 'hustler_a3_betrayal');
    }
    if (charId === 'hustler' && day >= 2100 && !bt.hustler_a3_political_connection) {
      bt.hustler_a3_political_connection = true;
      msgs.push('🏛️ A state senator needs campaign financing. Off the books. In exchange: zoning approvals, police protection, regulatory immunity. The government is just another game to play.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { politically_connected: 1 }, ability: 'political_immunity' }, 'backstory', 'hustler_a3_senator');
    }
    if (charId === 'hustler' && day >= 2350 && !bt.hustler_a3_bookie_confrontation) {
      bt.hustler_a3_bookie_confrontation = true;
      msgs.push('⚔️ You finally confronted the bookie. Face to face. "You want war with me? I own senators. I own cops. I own this city." He backed down. Or did he? His eyes said otherwise.');
      if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 10); adjustRep(state, 'streetCred', 5); }
    }
    if (charId === 'hustler' && day >= 2480 && !bt.hustler_a3_mirror) {
      bt.hustler_a3_mirror = true;
      msgs.push('💭 You caught your reflection in a window. Three-card monte kid. Fake Rolex hustler. Now you launder millions and dine with senators. Same hustle. Bigger table. Same empty feeling.');
    }

    // CONNECTED KID: Act 3 - The throne has thorns
    if (charId === 'connected_kid' && day >= 1550 && !bt.connected_a3_cartel_summit) {
      bt.connected_a3_cartel_summit = true;
      msgs.push('💀 You\'re invited to a cartel summit in Bogota. The big table. Medellin, Cali, your operation. "Your father sat in this chair. Now you do." The weight of generations of blood money.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { cartel_inner_circle: 1 } }, 'backstory', 'connected_a3_summit');
    }
    if (charId === 'connected_kid' && day >= 1800 && !bt.connected_a3_soto_dead) {
      bt.connected_a3_soto_dead = true;
      msgs.push('💀 Victor Soto was found dead. Not by your hand — by his own people. "He was reckless," they said. But you know the truth: the cartel chose YOU over him. That\'s power. That\'s terror.');
      if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 15); adjustRep(state, 'streetCred', 10); }
    }
    if (charId === 'connected_kid' && day >= 2050 && !bt.connected_a3_uncle_betrayal) {
      bt.connected_a3_uncle_betrayal = true;
      msgs.push('🗡️ Your "uncle" was a fraud. Not related at all — a former associate of your father who saw an opportunity. He\'s been siphoning money through a side account for months. $80K gone.');
      state.cash = Math.max(0, state.cash - 80000);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { trust_no_one: 1 } }, 'backstory', 'connected_a3_uncle');
    }
    if (charId === 'connected_kid' && day >= 2250 && !bt.connected_a3_father_letter) {
      bt.connected_a3_father_letter = true;
      msgs.push('✉️ A letter arrived. Your father\'s handwriting, dated years ago. Hidden in the prison mail system. "If you\'re reading this, I failed. Don\'t make my mistakes. Trust no one. Not even me."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { fathers_warning: 1 }, stats: { stress: 10 } }, 'backstory', 'connected_a3_letter');
    }
    if (charId === 'connected_kid' && day >= 2450 && !bt.connected_a3_empire_size) {
      bt.connected_a3_empire_size = true;
      var terrC = typeof getControlledTerritories === 'function' ? getControlledTerritories(state).length : 0;
      var crewC = (state.henchmen || []).length;
      msgs.push('👑 ' + terrC + ' territories. ' + crewC + ' crew. Cartel backing. Your father built this in 20 years. You did it in ' + Math.floor(day / 30) + ' months. But empires that grow fast collapse fast.');
    }

    // CLEANSKIN: Act 3 - The mask cracks
    if (charId === 'cleanskin' && day >= 1550 && !bt.cleanskin_a3_divorce_final) {
      bt.cleanskin_a3_divorce_final = true;
      msgs.push('💔 The divorce is final. They took the house and custody. Child support: $500/day. "I don\'t know who you are anymore." They were right. You don\'t either.');
      if (!state.relationships) state.relationships = { partners: [], children: [], divorces: 0 };
      state.relationships.divorces = (state.relationships.divorces || 0) + 1;
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { divorced: 1, alone: 1 }, stats: { stress: 20 } }, 'backstory', 'cleanskin_a3_divorce');
    }
    if (charId === 'cleanskin' && day >= 1800 && !bt.cleanskin_a3_vance_closing) {
      bt.cleanskin_a3_vance_closing = true;
      msgs.push('🕵️ Agent Vance subpoenaed your banking records. All of them. Seven years of transactions. Your shell companies are good, but she\'s better. She found a $12,000 discrepancy.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 12);
    }
    if (charId === 'cleanskin' && day >= 2050 && !bt.cleanskin_a3_accountant_kidnapped) {
      bt.cleanskin_a3_accountant_kidnapped = true;
      msgs.push('🚨 Your real accountant — the one who manages the legitimate side — was kidnapped by a rival. They want your financial records. If those books get out, EVERYONE goes down.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { exposed_risk: 1 } }, 'backstory', 'cleanskin_a3_kidnap');
    }
    if (charId === 'cleanskin' && day >= 2300 && !bt.cleanskin_a3_clean_exit) {
      bt.cleanskin_a3_clean_exit = true;
      msgs.push('💭 You crunched the numbers. $' + Math.round((state.cash + state.bank) * 0.6).toLocaleString() + ' in clean offshore accounts. Enough to disappear. New name. New country. No one would find you. The exit is there. Do you take it?');
    }
    if (charId === 'cleanskin' && day >= 2480 && !bt.cleanskin_a3_identity_crisis) {
      bt.cleanskin_a3_identity_crisis = true;
      msgs.push('🎭 Which one are you? The accountant with the CPA license? Or the drug lord with the offshore millions? The mask has become the face. You can\'t tell anymore.');
    }

    // VETERAN: Act 3 - The old soldier's last campaign
    if (charId === 'veteran' && day >= 1550 && !bt.veteran_a3_flash_dead) {
      bt.veteran_a3_flash_dead = true;
      msgs.push('💀 Flash — the young gun who challenged you — turned up dead. Not your doing. The streets are eating their young. You remember when that could have been you. It still could be.');
    }
    if (charId === 'veteran' && day >= 1800 && !bt.veteran_a3_tombstone_cancer) {
      bt.veteran_a3_tombstone_cancer = true;
      msgs.push('🏥 Tombstone has cancer. Lung cancer. "All those years breathing in lab fumes, boss." Your oldest soldier, your most loyal man. Dying slow. You pay for the best oncologist in Miami.');
      state.cash = Math.max(0, state.cash - 40000);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { losing_brothers: 1 }, stats: { stress: 15 } }, 'backstory', 'veteran_a3_tombstone');
    }
    if (charId === 'veteran' && day >= 2100 && !bt.veteran_a3_last_fight) {
      bt.veteran_a3_last_fight = true;
      msgs.push('⚔️ A crew of young guns tried to rob your stash house. You handled it personally. Broke a man\'s arm, dislocated another\'s shoulder. At your age. Razor watched in awe. "You still got it, boss."');
      state.health = Math.max(30, (state.health || 100) - 10);
      if (typeof adjustRep === 'function') adjustRep(state, 'fear', 8);
    }
    if (charId === 'veteran' && day >= 2300 && !bt.veteran_a3_daughter) {
      bt.veteran_a3_daughter = true;
      msgs.push('📞 A woman called. Said she\'s your daughter. Born while you were on a job in \'79. Her mother never told you. She\'s 25 now. Wants nothing from you except answers.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { secret_daughter: 1 } }, 'backstory', 'veteran_a3_daughter');
    }
    if (charId === 'veteran' && day >= 2480 && !bt.veteran_a3_legacy_question) {
      bt.veteran_a3_legacy_question = true;
      msgs.push('💭 Razor asked the question nobody asks: "When it\'s over — and it WILL be over — what do you want them to say about you?" You don\'t have an answer. That scares you more than any gun.');
    }

    // IMMIGRANT: Act 3 - Between two worlds, belonging to neither
    if (charId === 'immigrant' && day >= 1550 && !bt.immigrant_a3_interpol) {
      bt.immigrant_a3_interpol = true;
      msgs.push('🌍 INTERPOL flagged your supply route. International cooperation between Miami PD and foreign agencies. Your bridge between worlds is now a target for BOTH sides.');
      state.heat = Math.min(100, (state.heat || 0) + 12);
    }
    if (charId === 'immigrant' && day >= 1800 && !bt.immigrant_a3_cousin_deep) {
      bt.immigrant_a3_cousin_deep = true;
      msgs.push('💊 Your cousin is in deep. Selling. Using. Both. You created this. You brought them here, showed them the game. Now they\'re drowning in it. Save them or save yourself?');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { enabler_guilt: 1 } }, 'backstory', 'immigrant_a3_cousin');
    }
    if (charId === 'immigrant' && day >= 2050 && !bt.immigrant_a3_home_coup) {
      bt.immigrant_a3_home_coup = true;
      msgs.push('🏛️ Political upheaval back home. The politician who offered you citizenship was overthrown. Your deal is void. Worse: the new regime knows your name. International heat rising.');
      state.heat = Math.min(100, (state.heat || 0) + 8);
    }
    if (charId === 'immigrant' && day >= 2250 && !bt.immigrant_a3_american_dream) {
      bt.immigrant_a3_american_dream = true;
      msgs.push('🇺🇸 You became a citizen. Not through the corrupt politician — through a lawyer, proper paperwork, and a LOT of laundered money. Standing in the courthouse, hand on heart. The irony burns.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { citizen: 1, american: 1 }, removeTraits: ['fugitive_status'] }, 'backstory', 'immigrant_a3_citizen');
    }
    if (charId === 'immigrant' && day >= 2480 && !bt.immigrant_a3_roots) {
      bt.immigrant_a3_roots = true;
      msgs.push('📖 You visit the community center you built. Kids playing basketball. Adults in English class. A mural of your face on the wall. You came here with nothing. Now you\'re everything — and nothing — to these people.');
    }
  }

  // === ACT 4 CHARACTER STORIES (Day 2500-3500) ===
  if (charId && day >= 2500 && day <= 3500 && bt) {
    if (day >= 2500 && !bt.act4_begins) {
      bt.act4_begins = true;
      msgs.push('📖 ACT 4: THE RECKONING. The feds know your name. Your enemies are circling. The people you trusted are breaking. This is where empires survive — or fall.');
    }

    // DROPOUT: Act 4 - The walls close in
    if (charId === 'dropout' && day >= 2550 && !bt.dropout_a4_rehab) {
      bt.dropout_a4_rehab = true;
      msgs.push('💊 You checked yourself into a private rehab. Three days. Nobody knows. The irony: the chemist who cooks for a city can\'t stop using his own product. Day 1 is the hardest.');
      state.health = Math.min(state.maxHealth || 100, (state.health || 50) + 20);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { recovery: 1 } }, 'backstory', 'dropout_a4_rehab');
    }
    if (charId === 'dropout' && day >= 2800 && !bt.dropout_a4_operation_periodic) {
      bt.dropout_a4_operation_periodic = true;
      msgs.push('🚨 "Operation Periodic Table" went live. 47 arrests across Miami. Your suppliers. Your distributors. Your name is on the indictment — but they don\'t have enough evidence. Yet.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 20);
      state.heat = Math.min(100, (state.heat || 0) + 25);
    }
    if (charId === 'dropout' && day >= 3050 && !bt.dropout_a4_mother_visit) {
      bt.dropout_a4_mother_visit = true;
      msgs.push('📞 Your mother called. First time in months. "I\'m dying. Cancer. I want to see you before..." She doesn\'t know you funded the hospital that\'s treating her. She never will.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { redemption_chance: 1 }, stats: { stress: 20 } }, 'backstory', 'dropout_a4_mother_dying');
    }
    if (charId === 'dropout' && day >= 3300 && !bt.dropout_a4_choice) {
      bt.dropout_a4_choice = true;
      msgs.push('⚖️ The DA offered a deal: testify against the cartel, enter witness protection, start over. New name. New life. But everyone you know — Tito, your crew, your contacts — they all go to prison.');
    }
    if (charId === 'dropout' && day >= 3480 && !bt.dropout_a4_close) {
      bt.dropout_a4_close = true;
      msgs.push('📖 The chemistry of survival: combine pressure, heat, and time. What\'s left is either diamond or dust. Which one are you?');
    }

    // CORNER KID: Act 4 - The king's dilemma
    if (charId === 'corner_kid' && day >= 2550 && !bt.corner_a4_rico_arrested) {
      bt.corner_a4_rico_arrested = true;
      msgs.push('🚔 Lil Rico — your lieutenant, your day one — arrested. RICO charges. They\'re squeezing him for everything. "He\'s strong, boss," Deshawn\'s replacement says. But everyone has a breaking point.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { losing_brothers: 1 } }, 'backstory', 'corner_a4_rico');
    }
    if (charId === 'corner_kid' && day >= 2800 && !bt.corner_a4_little_bro_deep) {
      bt.corner_a4_little_bro_deep = true;
      msgs.push('💊 Your little brother is running his own crew now. 19 years old with a gun and an attitude. He won\'t listen to you. "You can\'t tell me nothing — you started just like me." He\'s right. That\'s the problem.');
    }
    if (charId === 'corner_kid' && day >= 3050 && !bt.corner_a4_mama_last_wish) {
      bt.corner_a4_mama_last_wish = true;
      msgs.push('🏥 Mama\'s last wish: "Get out. Take your brother and get out of this life." She said it with oxygen tubes in her nose. You promised. You both know it might be a lie.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { promise_keeper: 1 }, stats: { stress: 25 } }, 'backstory', 'corner_a4_mama_wish');
    }
    if (charId === 'corner_kid' && day >= 3300 && !bt.corner_a4_block_shooting) {
      bt.corner_a4_block_shooting = true;
      msgs.push('🔫 Mass shooting at the basketball court. Your court. Three dead, seven wounded, including two kids. Your war spilled into innocent lives. The CNN cameras are here. So are the feds.');
      state.heat = Math.min(100, (state.heat || 0) + 30);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { blood_on_hands: 1 }, stats: { stress: 30 } }, 'backstory', 'corner_a4_shooting');
    }
    if (charId === 'corner_kid' && day >= 3480 && !bt.corner_a4_close) {
      bt.corner_a4_close = true;
      msgs.push('📖 The block that raised you is burning. The question isn\'t whether you can save it. The question is whether you should.');
    }

    // EX-CON: Act 4 - Freedom's price
    if (charId === 'ex_con' && day >= 2550 && !bt.excon_a4_son_joins) {
      bt.excon_a4_son_joins = true;
      msgs.push('👦 Your son — the one who showed up at your door — wants in. "I want to know my father\'s world." He\'s smart. He\'s angry. He\'s everything you were at his age. That terrifies you.');
    }
    if (charId === 'ex_con' && day >= 2800 && !bt.excon_a4_big_mike_trial) {
      bt.excon_a4_big_mike_trial = true;
      msgs.push('⚖️ Big Mike\'s trial. You\'re called as a character witness. If you testify, you expose yourself. If you don\'t, your oldest friend dies in prison. Again.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { loyalty_tested: 1 } }, 'backstory', 'excon_a4_mike_trial');
    }
    if (charId === 'ex_con' && day >= 3100 && !bt.excon_a4_prison_flashback) {
      bt.excon_a4_prison_flashback = true;
      msgs.push('😰 The flashbacks are getting worse. You can\'t eat in rooms without windows. Can\'t sleep without a light on. Five years in a cell changed your brain chemistry permanently.');
      state.health = Math.max(40, (state.health || 100) - 5);
    }
    if (charId === 'ex_con' && day >= 3350 && !bt.excon_a4_darnell_confirmed) {
      bt.excon_a4_darnell_confirmed = true;
      msgs.push('🐀 Confirmed: Darnell is cooperating with the FBI. Your old cellmate. The man you protected inside. He\'s wearing a wire. Everything you said to him — they have it all.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 25);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { ultimate_betrayal: 1 } }, 'backstory', 'excon_a4_darnell');
    }

    // HUSTLER: Act 4 - The long con collapses
    if (charId === 'hustler' && day >= 2550 && !bt.hustler_a4_ponzi_collapse) {
      bt.hustler_a4_ponzi_collapse = true;
      msgs.push('💥 The Ponzi scheme collapsed. $1.2 million in losses. Angry investors. SEC investigation. Your Wall Street friend disappeared. Guess who\'s left holding the bag?');
      state.heat = Math.min(100, (state.heat || 0) + 15);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { scam_fallout: 1 } }, 'backstory', 'hustler_a4_ponzi');
    }
    if (charId === 'hustler' && day >= 2800 && !bt.hustler_a4_senator_arrested) {
      bt.hustler_a4_senator_arrested = true;
      msgs.push('🏛️ Your pet senator was arrested. Campaign finance violations. And he\'s talking. About off-books donations. About favors. About YOU. "I don\'t know any such person," he said on camera. Liar.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 15);
    }
    if (charId === 'hustler' && day >= 3100 && !bt.hustler_a4_wife_returns) {
      bt.hustler_a4_wife_returns = true;
      msgs.push('📞 Your ex-wife/partner called. "I know what you did. I know everything. And I want half — or I go to the feds." Blackmail from the person who once loved you.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { blackmailed: 1 }, stats: { stress: 20 } }, 'backstory', 'hustler_a4_blackmail');
    }
    if (charId === 'hustler' && day >= 3400 && !bt.hustler_a4_final_hustle) {
      bt.hustler_a4_final_hustle = true;
      msgs.push('💭 One last hustle. The biggest one. Fake your own death, take the offshore millions, disappear. You\'ve been planning it for months. The documents are ready. But leaving means leaving EVERYTHING.');
    }

    // CONNECTED KID: Act 4 - The heir's trial
    if (charId === 'connected_kid' && day >= 2550 && !bt.connected_a4_father_free) {
      bt.connected_a4_father_free = true;
      msgs.push('⚔️ Your father is free and he wants control. "This is MY empire. I built the foundation." But you built the tower. Two kings. One throne. Blood against blood.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { succession_war: 1 } }, 'backstory', 'connected_a4_father');
    }
    if (charId === 'connected_kid' && day >= 2800 && !bt.connected_a4_cartel_choice) {
      bt.connected_a4_cartel_choice = true;
      msgs.push('💀 The cartel demands you choose: your father or them. "He\'s unpredictable. A liability. Remove him or we remove you both." Your own blood or your empire.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { impossible_choice: 1 }, stats: { stress: 30 } }, 'backstory', 'connected_a4_cartel_choice');
    }
    if (charId === 'connected_kid' && day >= 3050 && !bt.connected_a4_carlos_betrayal) {
      bt.connected_a4_carlos_betrayal = true;
      msgs.push('🗡️ Carlos — your father\'s old bodyguard, your first crew member — sided with your father. "Blood is blood, mijo. I served your father first." Half your crew followed him.');
      var crewLost = Math.floor((state.henchmen || []).length * 0.3);
      for (var cl = 0; cl < crewLost && state.henchmen.length > 0; cl++) state.henchmen.pop();
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { civil_war: 1, abandoned: 1 } }, 'backstory', 'connected_a4_carlos');
    }
    if (charId === 'connected_kid' && day >= 3300 && !bt.connected_a4_mother_plea) {
      bt.connected_a4_mother_plea = true;
      msgs.push('📞 Your mother called both of you. "My husband. My son. Tearing each other apart over DRUG MONEY. I didn\'t raise you for this." She hung up and checked into a hospital. Stress-induced heart attack.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { family_destroyed: 1 }, stats: { stress: 25 } }, 'backstory', 'connected_a4_mother_hospital');
    }
    if (charId === 'connected_kid' && day >= 3480 && !bt.connected_a4_close) {
      bt.connected_a4_close = true;
      msgs.push('📖 The connected kid inherited an empire. The connected kid built a bigger one. Now the connected kid might lose everything — not to the feds, not to rivals, but to family.');
    }

    // CLEANSKIN: Act 4 - The mask shatters
    if (charId === 'cleanskin' && day >= 2550 && !bt.cleanskin_a4_vance_raid) {
      bt.cleanskin_a4_vance_raid = true;
      msgs.push('🚨 Agent Vance raided your accounting office. Took computers, files, seven years of records. "We have everything," she said. "It\'s just a matter of time." She wasn\'t bluffing.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 20);
    }
    if (charId === 'cleanskin' && day >= 2800 && !bt.cleanskin_a4_kids_know) {
      bt.cleanskin_a4_kids_know = true;
      msgs.push('👦 Your ex told the kids. They know what you do. Your teenager texted: "Are you a drug dealer?" You didn\'t reply. What do you say? What CAN you say?');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { exposed_to_family: 1 }, stats: { stress: 25 } }, 'backstory', 'cleanskin_a4_kids');
    }
    if (charId === 'cleanskin' && day >= 3050 && !bt.cleanskin_a4_offshore_frozen) {
      bt.cleanskin_a4_offshore_frozen = true;
      msgs.push('🏦 INTERPOL froze your Singapore account. $' + Math.round(state.bank * 0.2).toLocaleString() + ' inaccessible. International cooperation. Vance has friends overseas. Your exit plan just got harder.');
      state.bank = Math.round(state.bank * 0.8);
    }
    if (charId === 'cleanskin' && day >= 3300 && !bt.cleanskin_a4_cpa_revoked) {
      bt.cleanskin_a4_cpa_revoked = true;
      msgs.push('📋 Your CPA license was revoked. The accounting board found "irregularities." Your legitimate identity — the mask you\'ve worn for years — is officially dead. Only the criminal remains.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { identity_dead: 1, only_criminal_left: 1 } }, 'backstory', 'cleanskin_a4_cpa');
    }
    if (charId === 'cleanskin' && day >= 3480 && !bt.cleanskin_a4_close) {
      bt.cleanskin_a4_close = true;
      msgs.push('📖 The accountant is gone. The mask is shattered. The CPA license revoked, the family lost, the accounts frozen. Only the numbers remain — and they don\'t add up to anything good.');
    }

    // VETERAN: Act 4 - The last stand
    if (charId === 'veteran' && day >= 2550 && !bt.veteran_a4_tombstone_dies) {
      bt.veteran_a4_tombstone_dies = true;
      msgs.push('💀 Tombstone is gone. Cancer took him in the night. Your oldest soldier. Your closest friend. 30 years together. He died holding your hand. "It was a good run, boss."');
      if (state.henchmen) {
        var tsIdx = state.henchmen.findIndex(function(h) { return h.name === 'Tombstone'; });
        if (tsIdx >= 0) state.henchmen.splice(tsIdx, 1);
      }
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mourning: 1, last_man_standing: 1 }, stats: { stress: 30 } }, 'backstory', 'veteran_a4_tombstone');
    }
    if (charId === 'veteran' && day >= 2800 && !bt.veteran_a4_heart_surgery) {
      bt.veteran_a4_heart_surgery = true;
      msgs.push('🏥 Heart surgery. $60,000. Six weeks recovery. Razor runs things while you\'re down. From the hospital bed, you watch your empire through phone updates. Helpless.');
      state.cash = Math.max(0, state.cash - 60000);
      state.health = Math.min(state.maxHealth || 100, (state.health || 50) + 30);
      state.maxHealth = Math.max(50, (state.maxHealth || 100) - 10);
    }
    if (charId === 'veteran' && day >= 3100 && !bt.veteran_a4_daughter_plea) {
      bt.veteran_a4_daughter_plea = true;
      msgs.push('📞 Your daughter — the one you just met — is pregnant. "I don\'t want my child growing up like I did. Without a father. Without knowing who they are." A grandchild. A legacy beyond blood money.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { grandfather: 1, legacy_question: 1 } }, 'backstory', 'veteran_a4_grandchild');
    }
    if (charId === 'veteran' && day >= 3350 && !bt.veteran_a4_old_enemy_final) {
      bt.veteran_a4_old_enemy_final = true;
      msgs.push('⚔️ The old enemy from \'72 found you. Final confrontation. Two old men with guns and grudges. "One of us ends this today." Your hands shake. Not from fear. From age.');
      state.health = Math.max(20, (state.health || 100) - 15);
      if (typeof adjustRep === 'function') adjustRep(state, 'fear', 10);
    }
    if (charId === 'veteran' && day >= 3480 && !bt.veteran_a4_close) {
      bt.veteran_a4_close = true;
      msgs.push('📖 The old soldier buried his best friend. Survived heart surgery. Met a grandchild he never expected. Fought an enemy from half a century ago. The body is failing. The spirit... the spirit isn\'t sure anymore.');
    }

    // IMMIGRANT: Act 4 - Between two fires
    if (charId === 'immigrant' && day >= 2550 && !bt.immigrant_a4_extradition) {
      bt.immigrant_a4_extradition = true;
      msgs.push('🌍 Your home country filed an extradition request. They want you back to face charges there. Your pipeline destroyed their economy and they want someone to blame. Two countries hunting you now.');
      state.heat = Math.min(100, (state.heat || 0) + 15);
    }
    if (charId === 'immigrant' && day >= 2800 && !bt.immigrant_a4_cousin_od) {
      bt.immigrant_a4_cousin_od = true;
      msgs.push('💀 Your cousin overdosed. In the hospital on life support. The product YOU brought to this country. The opportunity YOU gave them. They might not wake up.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { blood_guilt: 1 }, stats: { stress: 25 } }, 'backstory', 'immigrant_a4_cousin_od');
    }
    if (charId === 'immigrant' && day >= 3050 && !bt.immigrant_a4_community_turns) {
      bt.immigrant_a4_community_turns = true;
      msgs.push('😞 The community center you built? Someone spray-painted "DRUG MONEY" on the mural. The community that protected you is turning. They know. And they\'re ashamed.');
      if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -15); adjustRep(state, 'trust', -10); }
    }
    if (charId === 'immigrant' && day >= 3300 && !bt.immigrant_a4_mother_truth) {
      bt.immigrant_a4_mother_truth = true;
      msgs.push('📞 Your mother called from home. "A reporter came to the village. Asking about you. Everyone knows now. The money you sent... they know where it came from. I can\'t leave the house."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { homeland_shame: 1 }, stats: { stress: 20 } }, 'backstory', 'immigrant_a4_mother_truth');
    }
    if (charId === 'immigrant' && day >= 3480 && !bt.immigrant_a4_close) {
      bt.immigrant_a4_close = true;
      msgs.push('📖 You crossed an ocean to escape poverty. You built an empire on poison. Now two countries want your head and the people you love can\'t look you in the eye. The American dream tastes like ash.');
    }
  }

  // === ACT 5 CHARACTER STORIES (Day 3500-5000) - THE ENDGAME ===
  if (charId && day >= 3500 && bt) {
    if (day >= 3500 && !bt.act5_begins) {
      bt.act5_begins = true;
      var nw5 = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      var kills5 = state.peopleKilled || 0;
      var days5 = state.day;
      msgs.push('📖 ACT 5: THE ENDGAME. ' + days5 + ' days. $' + nw5.toLocaleString() + ' empire. ' + kills5 + ' bodies. This is the final chapter. How does YOUR story end?');
    }

    // DROPOUT: Act 5 - Redemption or ruin
    if (charId === 'dropout' && day >= 3600 && !bt.dropout_a5_lab_explosion) {
      bt.dropout_a5_lab_explosion = true;
      msgs.push('💥 Your main lab exploded. Chemical fire. Two workers dead. The formula you perfected destroyed them. The fire department found drug residue. It\'s on every news channel.');
      state.heat = Math.min(100, (state.heat || 0) + 20);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { maker_of_death: 1 } }, 'backstory', 'dropout_a5_explosion');
    }
    if (charId === 'dropout' && day >= 3900 && !bt.dropout_a5_cure_or_cook) {
      bt.dropout_a5_cure_or_cook = true;
      msgs.push('💭 A pharmaceutical company offered you a job. Legitimate research. $200K salary. They don\'t know your past. You could walk away from everything and save lives instead of taking them.');
    }
    if (charId === 'dropout' && day >= 4200 && !bt.dropout_a5_mother_death) {
      bt.dropout_a5_mother_death = true;
      msgs.push('💀 Your mother passed. At the funeral, nobody knew who you really were. "He\'s in pharmaceuticals," they said. You stood over her casket knowing the truth she died not knowing.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { orphaned: 1, final_guilt: 1 }, stats: { stress: 30 } }, 'backstory', 'dropout_a5_mother');
    }
    if (charId === 'dropout' && day >= 4500 && !bt.dropout_a5_legacy) {
      bt.dropout_a5_legacy = true;
      msgs.push('📖 The dropout who learned chemistry to pay tuition. The chemist who cooked for a city. The kingpin who funded hospitals with blood money. The story writes itself. But who writes the ending?');
    }
    if (charId === 'dropout' && day >= 4800 && !bt.dropout_a5_final) {
      bt.dropout_a5_final = true;
      var nwD = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      if (nwD > 1000000) {
        msgs.push('🏆 The formula made you a millionaire. The formula killed your professor. The formula poisoned a generation. But the formula is all you have left. Is it worth it?');
      } else {
        msgs.push('💭 In the end, the chemistry was never the problem. The problem was you. A brilliant mind with no moral compass. The periodic table doesn\'t care about right and wrong.');
      }
    }

    // CORNER KID: Act 5 - The block's final chapter
    if (charId === 'corner_kid' && day >= 3600 && !bt.corner_a5_rico_snitch) {
      bt.corner_a5_rico_snitch = true;
      msgs.push('🐀 Lil Rico talked. Everything. Names, dates, shipments, bodies. Your day one. Your lieutenant. Your brother in everything but blood. He chose 10 years over life.');
      if (state.investigation) state.investigation.points = Math.min(100, state.investigation.points + 30);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { betrayed_by_family: 1 } }, 'backstory', 'corner_a5_rico');
    }
    if (charId === 'corner_kid' && day >= 3900 && !bt.corner_a5_brother_war) {
      bt.corner_a5_brother_war = true;
      msgs.push('⚔️ Your little brother started a war you can\'t finish. Three rival crews united against your family. "I did this for US," he screamed. He did it for himself. Just like you did.');
    }
    if (charId === 'corner_kid' && day >= 4200 && !bt.corner_a5_mama_dies) {
      bt.corner_a5_mama_dies = true;
      msgs.push('💀 Mama\'s gone. In the house you bought her. Surrounded by family. She held your hand at the end. "Promise me," she whispered. "Promise me you\'ll stop." You promised. You lied.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { broken_promise: 1 }, stats: { stress: 30 } }, 'backstory', 'corner_a5_mama');
    }
    if (charId === 'corner_kid' && day >= 4500 && !bt.corner_a5_block_gone) {
      bt.corner_a5_block_gone = true;
      msgs.push('🏗️ The block is gone. Demolished. Condos going up where the basketball court used to be. The corner where you sold your first dime bag is now a Starbucks. Nothing left but memories and bodies.');
    }
    if (charId === 'corner_kid' && day >= 4800 && !bt.corner_a5_final) {
      bt.corner_a5_final = true;
      msgs.push('📖 You were born on the block. You built your empire on the block. And the block is gone. Everything you fought for is concrete and steel with someone else\'s name on it. What was it all for?');
    }

    // EX-CON: Act 5 - The institutional man's reckoning
    if (charId === 'ex_con' && day >= 3600 && !bt.excon_a5_son_choice) {
      bt.excon_a5_son_choice = true;
      msgs.push('👦 Your son ran his first operation. Clean. Professional. Better than you were at his age. You feel pride and horror in equal measure. You created another you.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { cycle_continues: 1 } }, 'backstory', 'excon_a5_son');
    }
    if (charId === 'ex_con' && day >= 3900 && !bt.excon_a5_indictment) {
      bt.excon_a5_indictment = true;
      msgs.push('📋 Federal indictment. 47 counts. RICO. Murder. Conspiracy. Drug trafficking. Money laundering. Tax evasion. Darnell\'s testimony is the backbone. This is it.');
      if (state.investigation) state.investigation.points = 100;
      state.heat = 100;
    }
    if (charId === 'ex_con' && day >= 4200 && !bt.excon_a5_big_mike_letter) {
      bt.excon_a5_big_mike_letter = true;
      msgs.push('✉️ Letter from Big Mike in prison. "Don\'t let them take you alive, boss. Go out on your terms. Not theirs. You taught me that." The loyalty of the damned.');
    }
    if (charId === 'ex_con' && day >= 4500 && !bt.excon_a5_cycle) {
      bt.excon_a5_cycle = true;
      msgs.push('💭 You did 5 years. Built an empire. Might do the rest of your life. The system that locked you up made you what you are. And what you are might send you back. The cycle never breaks.');
    }
    if (charId === 'ex_con' && day >= 4800 && !bt.excon_a5_final) {
      bt.excon_a5_final = true;
      msgs.push('📖 The ex-con. The institutional man. The one who did his time and came out harder. In the end, the prison was never the bars. The prison was the life. And there\'s no parole from this.');
    }

    // HUSTLER: Act 5 - The final con
    if (charId === 'hustler' && day >= 3600 && !bt.hustler_a5_fbi_raids) {
      bt.hustler_a5_fbi_raids = true;
      msgs.push('🚨 FBI raided all your properties. Every shell company. Every front. $2.3 million in assets frozen. "The most sophisticated financial crime network we\'ve seen in Miami," the agent said on TV.');
      state.cash = Math.max(0, Math.round(state.cash * 0.3));
      state.bank = Math.max(0, Math.round(state.bank * 0.2));
    }
    if (charId === 'hustler' && day >= 3900 && !bt.hustler_a5_bookie_resolved) {
      bt.hustler_a5_bookie_resolved = true;
      msgs.push('💀 The bookie is dead. Heart attack. Natural causes. After all these years of threats and dead cats, he died in his sleep. Anti-climactic. But the relief is overwhelming.');
    }
    if (charId === 'hustler' && day >= 4200 && !bt.hustler_a5_one_last_con) {
      bt.hustler_a5_one_last_con = true;
      msgs.push('🎭 The documents are ready. New identity. New country. $4M in untraceable crypto. You could walk away tonight. Become someone else. But the hustler in you whispers: "One more score..."');
    }
    if (charId === 'hustler' && day >= 4500 && !bt.hustler_a5_empty_table) {
      bt.hustler_a5_empty_table = true;
      msgs.push('🃏 You\'re at a poker table alone. The cards are dealt but there\'s no one to play against. The game was always about the people, not the money. And everyone\'s gone.');
    }
    if (charId === 'hustler' && day >= 4800 && !bt.hustler_a5_final) {
      bt.hustler_a5_final = true;
      msgs.push('📖 Three-card monte on Biscayne Boulevard. That\'s where it started. Shell companies and offshore millions. That\'s where it ended. The hustle never changed. Only the stakes. And the emptiness.');
    }

    // CONNECTED KID: Act 5 - Blood and legacy
    if (charId === 'connected_kid' && day >= 3600 && !bt.connected_a5_father_war) {
      bt.connected_a5_father_war = true;
      msgs.push('⚔️ Your father made his move. He rallied the old guard — men who remember HIS era. Half the Miami underworld is choosing sides. Father vs. son. The city bleeds.');
      state.heat = Math.min(100, (state.heat || 0) + 20);
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { civil_war: 1 } }, 'backstory', 'connected_a5_war');
    }
    if (charId === 'connected_kid' && day >= 3900 && !bt.connected_a5_father_falls) {
      bt.connected_a5_father_falls = true;
      msgs.push('💀 Your father was shot. Not by you — by the cartel. They chose you. He\'s alive but broken. In a wheelchair. "You win, mijo," he whispered. Victory never tasted so bitter.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { pyrrhic_victory: 1 }, stats: { stress: 25 } }, 'backstory', 'connected_a5_father_shot');
    }
    if (charId === 'connected_kid' && day >= 4200 && !bt.connected_a5_cartel_demands) {
      bt.connected_a5_cartel_demands = true;
      msgs.push('💀 The cartel wants more. Always more. "Your father understood: we OWN you. You just manage the franchise." The throne has chains. They always did.');
    }
    if (charId === 'connected_kid' && day >= 4500 && !bt.connected_a5_mother_dies) {
      bt.connected_a5_mother_dies = true;
      msgs.push('💀 Your mother passed in her sleep. The hospital said her heart gave out. But you know: it was a broken heart. Her husband in a wheelchair. Her son a cartel puppet. She died of this family.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { orphaned: 1, family_destroyed: 1 }, stats: { stress: 30 } }, 'backstory', 'connected_a5_mother');
    }
    if (charId === 'connected_kid' && day >= 4800 && !bt.connected_a5_final) {
      bt.connected_a5_final = true;
      msgs.push('📖 The connected kid. Heir to an empire of blood. You defeated your father, lost your mother, and sold your soul to the cartel. The throne was always a cage. Your children will inherit it. The cycle continues.');
    }

    // CLEANSKIN: Act 5 - The final number
    if (charId === 'cleanskin' && day >= 3600 && !bt.cleanskin_a5_vance_deal) {
      bt.cleanskin_a5_vance_deal = true;
      msgs.push('🕵️ Agent Vance offered a deal. Cooperate and she\'ll recommend leniency. "You\'re smart enough to know how this ends. Most of them aren\'t." She respects you. That makes it worse.');
    }
    if (charId === 'cleanskin' && day >= 3900 && !bt.cleanskin_a5_kid_visit) {
      bt.cleanskin_a5_kid_visit = true;
      msgs.push('👦 Your youngest showed up unannounced. "Dad, I want to be an accountant. Like you used to be." The innocence in those words. The weight of what they don\'t know.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { legacy_guilt: 1 }, stats: { stress: 20 } }, 'backstory', 'cleanskin_a5_kid');
    }
    if (charId === 'cleanskin' && day >= 4200 && !bt.cleanskin_a5_trial_begins) {
      bt.cleanskin_a5_trial_begins = true;
      msgs.push('⚖️ Trial date set. United States v. YOU. 23 counts of financial crime. Agent Vance on the witness stand. Seven years of evidence. Your own spreadsheets will convict you.');
      if (state.investigation) state.investigation.points = 100;
    }
    if (charId === 'cleanskin' && day >= 4500 && !bt.cleanskin_a5_last_numbers) {
      bt.cleanskin_a5_last_numbers = true;
      var cleanNW = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      msgs.push('📊 You ran the numbers one last time. $' + cleanNW.toLocaleString() + ' in assets. $' + (state.bank || 0).toLocaleString() + ' in accounts the feds can\'t reach. The final spreadsheet of your criminal career.');
    }
    if (charId === 'cleanskin' && day >= 4800 && !bt.cleanskin_a5_final) {
      bt.cleanskin_a5_final = true;
      msgs.push('📖 The numbers always added up. That was the problem — and the gift. You turned a CPA license into a criminal empire, and a criminal empire into... this. The final balance sheet is written in red ink.');
    }

    // VETERAN: Act 5 - The last soldier's requiem
    if (charId === 'veteran' && day >= 3600 && !bt.veteran_a5_grandchild_born) {
      bt.veteran_a5_grandchild_born = true;
      msgs.push('👶 Your grandchild is born. 7 pounds, 4 ounces. You held her in the hospital. Your hands — the same hands that have done terrible things — holding something pure. "Hi, little one. I\'m your grandpa."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { grandfather: 1, hope: 1 } }, 'backstory', 'veteran_a5_grandchild');
    }
    if (charId === 'veteran' && day >= 3900 && !bt.veteran_a5_razor_retires) {
      bt.veteran_a5_razor_retires = true;
      msgs.push('👋 Razor is leaving. "30 years, boss. I\'m done. Got a place in the Keys. Gonna fish." Your last soldier. The last one who remembers the beginning. "Thank you," you say. You mean it.');
      if (state.henchmen) {
        var razIdx = state.henchmen.findIndex(function(h) { return h.name === 'Razor'; });
        if (razIdx >= 0) state.henchmen.splice(razIdx, 1);
      }
    }
    if (charId === 'veteran' && day >= 4200 && !bt.veteran_a5_second_heart_attack) {
      bt.veteran_a5_second_heart_attack = true;
      msgs.push('❤️ Second heart attack. This one was worse. Three days in the ICU. Your daughter held your hand. Your grandchild slept in a carrier beside the bed. The game almost took you.');
      state.health = Math.max(20, (state.health || 100) - 25);
      state.maxHealth = Math.max(40, (state.maxHealth || 100) - 15);
    }
    if (charId === 'veteran' && day >= 4500 && !bt.veteran_a5_letter) {
      bt.veteran_a5_letter = true;
      msgs.push('✉️ You wrote a letter. To your daughter. To your grandchild. Everything. Names, dates, locations. What you did. Why you did it. Sealed in an envelope marked "After I\'m gone."');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { confession_written: 1 } }, 'backstory', 'veteran_a5_letter');
    }
    if (charId === 'veteran' && day >= 4800 && !bt.veteran_a5_final) {
      bt.veteran_a5_final = true;
      msgs.push('📖 The old soldier sits in a garden. His grandchild plays at his feet. Somewhere a phone rings but he doesn\'t answer. The war is over. Not because he won. Because he\'s too tired to fight. And maybe — just maybe — that\'s enough.');
    }

    // IMMIGRANT: Act 5 - The bridge burns
    if (charId === 'immigrant' && day >= 3600 && !bt.immigrant_a5_deported_cousin) {
      bt.immigrant_a5_deported_cousin = true;
      msgs.push('✈️ Your cousin was deported. They survived the overdose but ICE was waiting at the hospital. Gone. Back to the country they fled. Because of you. Because of what you brought here.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { enabler_consequence: 1 }, stats: { stress: 20 } }, 'backstory', 'immigrant_a5_cousin');
    }
    if (charId === 'immigrant' && day >= 3900 && !bt.immigrant_a5_community_forgives) {
      bt.immigrant_a5_community_forgives = true;
      var trust = state.rep ? (state.rep.trust || 0) : 0;
      if (trust > 20) {
        msgs.push('🤝 The community center unveils a new mural. Your face again — but this time with the words "Flawed Hero" underneath. They know what you are. They choose to remember the good.');
      } else {
        msgs.push('😞 The community center closed. No funding. No support. The neighborhood you tried to save remembers only the poison you brought. The mural was painted over.');
      }
    }
    if (charId === 'immigrant' && day >= 4200 && !bt.immigrant_a5_mother_final) {
      bt.immigrant_a5_mother_final = true;
      msgs.push('📞 Your mother\'s last call. "Come home. I don\'t care what you\'ve done. Come home." You can hear her crying. The ocean between you feels wider than ever.');
      if (typeof applyConsequences === 'function') applyConsequences(state, { traits: { mothers_call: 1 }, stats: { stress: 20 } }, 'backstory', 'immigrant_a5_mother_call');
    }
    if (charId === 'immigrant' && day >= 4500 && !bt.immigrant_a5_passport) {
      bt.immigrant_a5_passport = true;
      msgs.push('🛂 You hold two passports. One American. One from home. Two identities. Two lives. Both built on lies. Neither feels real anymore.');
    }
    if (charId === 'immigrant' && day >= 4800 && !bt.immigrant_a5_final) {
      bt.immigrant_a5_final = true;
      msgs.push('📖 You crossed the ocean with nothing. You built everything. You destroyed some of it. The bridge between two worlds is burning, and you\'re standing in the middle. Which shore do you swim to? Or do you just... let go?');
    }

    // === ALL CHARACTERS: Final game day message ===
    if (day >= 4900 && !bt.final_countdown) {
      bt.final_countdown = true;
      var finalNW = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : state.cash;
      var finalKills = state.peopleKilled || 0;
      var finalCrew = (state.henchmen || []).length;
      var finalTerr = typeof getControlledTerritories === 'function' ? getControlledTerritories(state).length : 0;
      msgs.push('🏁 THE END IS NEAR. Day ' + day + ' of 5000. Net worth: $' + finalNW.toLocaleString() + '. ' + finalKills + ' bodies. ' + finalCrew + ' crew. ' + finalTerr + ' territories. 100 days to write your ending.');
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

  // Trait bonuses: daily passive effects
  if (typeof getTraitBonuses === 'function') {
    var tbDaily = getTraitBonuses(state);
    // Charitable/community traits reduce heat daily
    if (tbDaily.heatReduction && state.heat > 0) {
      state.heat = Math.max(0, state.heat - state.heat * tbDaily.heatReduction);
    }
    // Community protection: warn about raids
    if (tbDaily.communityProtection && Math.random() < 0.1 && state.heat > 40) {
      msgs.push('🤝 Community tip: "Cops are sniffing around your area. Be careful today." (-3 heat)');
      state.heat = Math.max(0, state.heat - 3);
    }
    // Leader traits: crew morale boost
    if (tbDaily.crewMorale && state.henchmen) {
      for (var cli = 0; cli < state.henchmen.length; cli++) {
        state.henchmen[cli].loyalty = Math.min(100, (state.henchmen[cli].loyalty || 50) + 1);
      }
    }
  }

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
  // Weapons NO LONGER take drug inventory space — they're carried separately
  // A gun doesn't go in the same bag as product
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
  // Trait bonuses: entrepreneurial/businessman traits give buy discounts
  if (typeof getTraitBonuses === 'function') {
    var tb = getTraitBonuses(state);
    if (tb.buyDiscount) price = Math.round(price * (1 - tb.buyDiscount));
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
  // Trait bonuses: entrepreneurial/businessman traits give sell premiums
  if (typeof getTraitBonuses === 'function') {
    var tb2 = getTraitBonuses(state);
    if (tb2.sellBonus) price = Math.round(price * (1 + tb2.sellBonus));
  }
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
  if (state.debt <= 0) return { success: false, msg: 'No debt to pay.' };
  const payment = Math.min(amount, state.debt);
  state.cash -= payment;
  state.debt -= payment;
  // Prevent same-day pay-and-reborrow cycling
  state.lastPayDay = state.day;
  return { success: true, msg: `Paid $${payment.toLocaleString()} on your debt. Remaining: $${state.debt.toLocaleString()}` };
}

function borrowMoney(state, amount) {
  const maxBorrow = 50000;
  if (state.debt + amount > maxBorrow) return { success: false, msg: `Loan shark won't lend more than $${maxBorrow.toLocaleString()} total.` };

  // Cooldown: can only borrow once per day, can't borrow same day you paid
  if (state.lastBorrowDay === state.day) {
    return { success: false, msg: 'The loan shark says come back tomorrow. One loan per day.' };
  }
  if (state.lastPayDay === state.day) {
    return { success: false, msg: 'You just paid off debt today. The shark needs a day to process. Come back tomorrow.' };
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
  // Stash works in any Miami district or the miami hub
  var loc = LOCATIONS.find(function(l) { return l.id === state.currentLocation; });
  if (!loc || (loc.region !== 'miami' && loc.region !== 'Americas' && state.currentLocation !== 'miami')) {
    return { success: false, msg: 'Your stash is in Miami. Travel to a Miami district first.' };
  }
  if (!state.inventory[drugId] || state.inventory[drugId] < amount) return { success: false, msg: 'You don\'t have that much.' };
  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] === 0) delete state.inventory[drugId];
  state.stash[drugId] = (state.stash[drugId] || 0) + amount;
  return { success: true, msg: `Stashed ${amount} ${DRUGS.find(d => d.id === drugId).name}.` };
}

function retrieveDrugs(state, drugId, amount) {
  var loc2 = LOCATIONS.find(function(l) { return l.id === state.currentLocation; });
  if (!loc2 || (loc2.region !== 'miami' && loc2.region !== 'Americas' && state.currentLocation !== 'miami')) {
    return { success: false, msg: 'Your stash is in Miami. Travel to a Miami district first.' };
  }
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
  if (!from || !to) return [];
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

  // Vehicle condition check: damaged vehicle adds travel time and risk
  var vehicleConditionPenalty = '';
  if (state.vehicleState && state.vehicleState.activeVehicleIndex !== null && state.vehicleState.garage) {
    var activeVeh = state.vehicleState.garage[state.vehicleState.activeVehicleIndex];
    if (activeVeh && activeVeh.condition < 20) {
      return { success: false, msg: '🔧 Your vehicle is too damaged to travel (condition ' + activeVeh.condition + '%). Repair it first.' };
    }
    if (activeVeh && activeVeh.condition < 50) {
      vehicleConditionPenalty = ' ⚠️ Vehicle in poor condition — slower travel.';
    }
    // Degrade condition from travel
    if (activeVeh) {
      activeVeh.condition = Math.max(0, activeVeh.condition - (2 + Math.floor(Math.random() * 3)));
      activeVeh.mileage = (activeVeh.mileage || 0) + 20 + Math.floor(Math.random() * 30);
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

  // Advance days (modified by driver crew and vehicle speed)
  var daysUsed = transport.timeDays;
  // Same-day local travel (taxi, etc.) = 0 days, skip all modifiers
  var isLocalTravel = daysUsed === 0;
  if (!isLocalTravel) {
  // Driver crew reduces travel time
  if (state._driverBonus && state._driverBonus > 0) {
    daysUsed = Math.max(1, Math.round(daysUsed * (1 - state._driverBonus)));
  }
  // Active vehicle speed bonus (fast vehicles reduce travel by 1 day for 3+ day trips)
  if (state.vehicleState && state.vehicleState.activeVehicleIndex !== null && state.vehicleState.garage) {
    var activeV = state.vehicleState.garage[state.vehicleState.activeVehicleIndex];
    if (activeV) {
      var vDef = typeof VEHICLES !== 'undefined' ? VEHICLES.find(function(v) { return v.id === activeV.vehicleId; }) : null;
      if (vDef && vDef.speed >= 80 && daysUsed >= 3) daysUsed = Math.max(1, daysUsed - 1); // Fast vehicle: -1 day on long trips
    }
  }
  // Weather slows travel
  if (typeof getWeatherEffects === 'function') {
    var wxTravel = getWeatherEffects(state);
    if (wxTravel.travelSpeed && wxTravel.travelSpeed < 1) {
      daysUsed = Math.max(1, Math.ceil(daysUsed / wxTravel.travelSpeed));
    }
  }
  } // end if (!isLocalTravel)
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

  // Generate arrival flavor text based on destination
  var arrivalFlavor = '';
  var gang = getTerritoryGang(destinationId);
  var isOwned = isTerritory(state, destinationId);
  var weatherDisp = typeof getWeatherDisplay === 'function' ? getWeatherDisplay(state) : null;
  if (isOwned) {
    arrivalFlavor = ' Your crew nods as you step out. This is your turf.';
  } else if (gang) {
    arrivalFlavor = ' ' + gang.name + ' eyes watch you from the corners.';
  } else {
    var flavorPool = [
      ' The streets are alive with opportunity.',
      ' Neon signs flicker in the humid air.',
      ' A new district, new faces, new deals to make.',
      ' The smell of salt water and exhaust fills the air.',
      ' Palm trees sway above the concrete jungle.',
    ];
    arrivalFlavor = flavorPool[Math.floor(Math.random() * flavorPool.length)];
  }
  if (weatherDisp && weatherDisp.name !== 'Clear') arrivalFlavor += ' ' + weatherDisp.emoji + ' ' + weatherDisp.name + '.';

  return {
    success: true,
    msg: `Traveled to ${destination.name} via ${transport.name}. (${daysUsed} day${daysUsed > 1 ? 's' : ''}, $${transportCost.toLocaleString()})${arrivalFlavor}`,
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
    // Trait bonuses: violent/ruthless traits increase combat damage
    if (typeof getTraitBonuses === 'function') {
      var tbCombat = getTraitBonuses(state);
      if (tbCombat.combatDamage) playerPower = Math.round(playerPower * (1 + tbCombat.combatDamage));
      if (tbCombat.combatAccuracy) hitChance = Math.min(0.95, hitChance + tbCombat.combatAccuracy);
    }
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
        // Game day scaling: enemies hit harder as game progresses
        var dayScaling = typeof getGameDayScaling === 'function' ? getGameDayScaling(state) : { enemyDamageMod: 1.0 };
        let damage = Math.round(event.enemyDamage * (0.5 + Math.random() * 0.5) * getNgPlusMod(state, 'enemyDamageMultiplier', 1) * (dayScaling.enemyDamageMod || 1.0));

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
    // Trait bonuses: elusive/fugitive/cautious traits improve escape
    if (typeof getTraitBonuses === 'function') {
      var tbEscape = getTraitBonuses(state);
      if (tbEscape.escapeChance) escapeChance += tbEscape.escapeChance;
    }
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

  // Max 2 hires per day (you can't recruit an army in one afternoon)
  if (!state._hiresThisDay) state._hiresThisDay = { day: 0, count: 0 };
  if (state._hiresThisDay.day === state.day) {
    if (state._hiresThisDay.count >= 2) {
      return { success: false, msg: 'Already hired 2 people today. The black market is tapped out. Come back tomorrow.' };
    }
    state._hiresThisDay.count++;
  } else {
    state._hiresThisDay = { day: state.day, count: 1 };
  }

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
  // Weapons are carried separately from drugs — no space check needed
  // Limit: max 5 weapons (realistic carry limit)
  if (state.weapons.length >= 5) return { success: false, msg: 'Already carrying max weapons (5). Sell one first.' };

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
    if (state.weapons.length >= 5) return { success: false, msg: 'Already carrying max weapons (5).' };
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

  // Game day scaling: investigation pressure increases over time
  if (amount > 0 && typeof getGameDayScaling === 'function') {
    var invScale = getGameDayScaling(state);
    amount = Math.round(amount * (invScale.investigationMod || 1.0));
  }

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
  // Trait bonus: snitch/cooperator gives court bonus
  var traitCourtBonus = 0;
  if (typeof getTraitBonuses === 'function') {
    var tbCourt = getTraitBonuses(state);
    if (tbCourt.courtBonus) traitCourtBonus = tbCourt.courtBonus;
  }
  const chance = Math.max(0.02, state.courtCase.totalSuccessChance - evidencePenalty + traitCourtBonus);
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

  // Cooldown: 3 days between territory challenges
  if (state.lastChallengeDay && (state.day - state.lastChallengeDay) < 3) {
    var daysLeft = 3 - (state.day - state.lastChallengeDay);
    return { success: false, msg: 'Your crew needs to recover. Wait ' + daysLeft + ' more day' + (daysLeft > 1 ? 's' : '') + ' before challenging again.' };
  }
  state.lastChallengeDay = state.day;

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
  state.dirtyMoney = (state.dirtyMoney || 0) + income; // Territory income is dirty (protection rackets)
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

  // === CREW PERSONAL STORIES ===
  // Crew members develop over time based on traits and days served
  for (var ci2 = 0; ci2 < state.henchmen.length; ci2++) {
    var cm = state.henchmen[ci2];
    if (cm.injured) continue;
    cm.daysServed = (cm.daysServed || 0) + 1;

    // Loyalty-based events (2% daily chance for long-serving crew)
    if (cm.daysServed > 30 && Math.random() < 0.02) {
      var storyRoll = Math.random();

      if (cm.loyalty > 80 && storyRoll < 0.15) {
        // Loyal crew member brings intel
        messages.push('💡 ' + cm.name + ' overheard something useful: "Boss, I got a tip on a big score." +$' + (1000 + Math.floor(Math.random() * 3000)).toLocaleString());
        state.cash += 1000 + Math.floor(Math.random() * 3000);
      } else if (cm.loyalty > 70 && storyRoll < 0.25) {
        // Crew member asks for raise
        var raise = 50 + Math.floor(Math.random() * 150);
        messages.push('💬 ' + cm.name + ' wants a raise: "I\'ve been loyal. I deserve more." Daily pay +$' + raise);
        cm.dailyPay = (cm.dailyPay || 100) + raise;
        cm.loyalty = Math.min(100, cm.loyalty + 5);
      } else if (storyRoll < 0.35) {
        // Crew member has a birthday/personal moment
        messages.push('🎂 ' + cm.name + ' had a personal milestone. They appreciate being part of the crew. +3 loyalty.');
        cm.loyalty = Math.min(100, cm.loyalty + 3);
      } else if (cm.loyalty < 40 && storyRoll < 0.5) {
        // Low loyalty crew member starts skimming
        var skimmed = Math.min(state.cash, 200 + Math.floor(Math.random() * 800));
        state.cash = Math.max(0, state.cash - skimmed);
        messages.push('⚠️ ' + cm.name + ' has been skimming money. -$' + skimmed.toLocaleString() + '. Confront them or let it slide.');
        cm.betrayalRisk = Math.min(100, (cm.betrayalRisk || 0) + 10);
      } else if (cm.daysServed > 90 && storyRoll < 0.6) {
        // Veteran crew member shares war story
        messages.push('📖 ' + cm.name + ' tells the crew about the old days. Morale boost. All crew +1 loyalty.');
        for (var cj = 0; cj < state.henchmen.length; cj++) {
          state.henchmen[cj].loyalty = Math.min(100, (state.henchmen[cj].loyalty || 50) + 1);
        }
      } else if (storyRoll < 0.7) {
        // Crew member gets in trouble outside work
        messages.push('🚨 ' + cm.name + ' got into trouble on their own time. Bar fight. They\'re bruised but okay. +2 heat.');
        state.heat = Math.min(100, (state.heat || 0) + 2);
      } else if (storyRoll < 0.8 && cm.daysServed > 60) {
        // Crew member wants to go legit
        messages.push('🌅 ' + cm.name + ': "Boss, I\'ve been thinking about getting out. My kid is growing up without me." They may leave soon unless you convince them to stay.');
        cm._wantsOut = true;
      } else if (cm._wantsOut && storyRoll < 0.9) {
        // Crew member leaves peacefully
        messages.push('👋 ' + cm.name + ' left the crew to go straight. "No hard feelings, boss. Thanks for everything."');
        state.henchmen.splice(ci2, 1);
        ci2--;
        continue;
      }
    }

    // Trait development: long-serving crew members develop new traits
    if (cm.daysServed === 60 && (!cm.traits || cm.traits.length < 3)) {
      var newTraits = ['loyal', 'experienced', 'streetwise', 'connected', 'tough', 'resourceful'];
      var trait = newTraits[Math.floor(Math.random() * newTraits.length)];
      if (!cm.traits) cm.traits = [];
      if (!cm.traits.includes(trait)) {
        cm.traits.push(trait);
        messages.push('⭐ ' + cm.name + ' developed a new trait: ' + trait + '!');
      }
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

  // Drug runners: sell from inventory OR earn passive income
  if (drugRunners > 0) {
    var runnerIncome = 0;
    var drugsSoldByRunners = 0;
    // Try to sell from inventory first (actual product moved)
    if (state.inventory) {
      var invKeys = Object.keys(state.inventory);
      for (var ri = 0; ri < drugRunners && invKeys.length > 0; ri++) {
        var drugToSell = invKeys[Math.floor(Math.random() * invKeys.length)];
        var qtyToSell = Math.min(state.inventory[drugToSell] || 0, 1 + Math.floor(Math.random() * 3));
        if (qtyToSell > 0 && state.prices && state.prices[drugToSell]) {
          var runnerPrice = Math.round((state.prices[drugToSell] || 100) * 0.7); // Runners sell at 70% market
          var revenue = runnerPrice * qtyToSell;
          state.inventory[drugToSell] -= qtyToSell;
          if (state.inventory[drugToSell] <= 0) {
            delete state.inventory[drugToSell];
            invKeys = Object.keys(state.inventory);
          }
          runnerIncome += revenue;
          drugsSoldByRunners += qtyToSell;
        }
      }
    }
    // If no inventory, runners earn from street connections (smaller amount)
    if (runnerIncome === 0) {
      runnerIncome = drugRunners * (100 + Math.floor(Math.random() * 200));
    }
    state.cash += runnerIncome;
    state.dirtyMoney = (state.dirtyMoney || 0) + runnerIncome;
    if (drugsSoldByRunners > 0) {
      messages.push('💊 Runners sold ' + drugsSoldByRunners + ' units for $' + runnerIncome.toLocaleString() + ' (70% market rate).');
    } else if (runnerIncome > 300) {
      messages.push('💊 Drug runners hustled $' + runnerIncome.toLocaleString() + ' from street connects.');
    }
    // Heat scales with volume
    state.heat = Math.min(100, (state.heat || 0) + drugRunners * 0.5 + drugsSoldByRunners * 0.2);
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
// GAME DAY SCALING - Makes everything harder over 5000 days
// ============================================================

/**
 * Get difficulty scaling based on current game day and campaign act.
 * This is the CORE function that makes the game progressively harder.
 * Called by combat, encounters, heat, prices, and rival systems.
 */
function getGameDayScaling(state) {
  var day = state.day || 1;
  var actMods = typeof getActModifiers === 'function' ? getActModifiers(state) : { encounterDifficulty: 1.0, heatGainMod: 1.0, priceVolatility: 1.0 };

  // Base scaling: linear increase from 1.0 at day 1 to 3.0 at day 5000
  var dayScale = 1.0 + (day / 5000) * 2.0;

  // Combine with act modifiers
  return {
    // Combat: enemies get tougher
    combatDifficulty: actMods.encounterDifficulty * (1 + (day / 5000) * 1.5),
    // Enemy health scales with day
    enemyHealthMod: 1.0 + (day / 5000) * 2.0,
    // Enemy damage scales with day
    enemyDamageMod: 1.0 + (day / 5000) * 1.0,
    // Heat gain increases over time (feds get smarter)
    heatGainMod: actMods.heatGainMod * (1 + (day / 5000) * 0.8),
    // Price volatility increases (market gets crazier)
    priceVolatility: actMods.priceVolatility * (1 + (day / 5000) * 0.5),
    // Encounter chance increases slightly
    encounterChanceMod: 1.0 + (day / 10000) * 0.5,
    // Rival dealer power scales
    rivalPowerMod: 1.0 + (day / 5000) * 2.5,
    // Max rivals increases with game age
    maxRivals: Math.min(20, 6 + Math.floor(day / 500)),
    // Investigation pressure increases
    investigationMod: 1.0 + (day / 5000) * 1.0,
    // Raid chance on businesses increases
    raidChanceMod: 1.0 + (day / 5000) * 0.5,
    // Raw day scaling
    dayScale: dayScale,
    // Current day for reference
    day: day,
  };
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
  // TIER 1: Early game (day 1-100) - basics
  stash:      { name: 'Stash Houses',       emoji: '📦', desc: 'Store drugs safely across cities.',            reqLevel: 2, reqDay: 15 },
  crew:       { name: 'Crew Management',     emoji: '👥', desc: 'Hire muscle to protect your empire.',         reqLevel: 2, reqDay: 30 },
  properties: { name: 'Properties',          emoji: '🏠', desc: 'Invest in real estate.',                      reqLevel: 2, reqDay: 25 },
  safehouse:  { name: 'Safe House',          emoji: '🏠', desc: 'Establish a secure base of operations.',      reqLevel: 2, reqDay: 20 },
  lifestyle:  { name: 'Lifestyle',           emoji: '🏠', desc: 'Manage stress and live large.',               reqLevel: 2, reqDay: 25 },
  // TIER 2: Establishing (day 50-250) - building infrastructure
  fronts:     { name: 'Front Businesses',    emoji: '🏢', desc: 'Launder money through legitimate fronts.',    reqLevel: 3, reqDay: 60 },
  territory:  { name: 'Territory Control',   emoji: '🏴', desc: 'Claim turf and earn passive income.',         reqLevel: 3, reqDay: 50 },
  vehicles:   { name: 'Vehicles',            emoji: '🚗', desc: 'Build your vehicle collection.',              reqLevel: 3, reqDay: 45 },
  rivals:     { name: 'Rival Dealers',       emoji: '🏴', desc: 'Compete with rival drug empires.',            reqLevel: 3, reqDay: 75 },
  defense:    { name: 'Territory Defense',   emoji: '🏰', desc: 'Defend your turf from attacks.',              reqLevel: 3, reqDay: 80 },
  bodies:     { name: 'Body Disposal',       emoji: '☠️', desc: 'Clean up after messy business.',              reqLevel: 3, reqDay: 60 },
  businesses: { name: 'Businesses',          emoji: '🏢', desc: 'Own and operate legitimate businesses.',      reqLevel: 3, reqDay: 70 },
  security:   { name: 'Security',            emoji: '🛡️', desc: 'Protect against raids and investigations.',   reqLevel: 3, reqDay: 55 },
  skills:     { name: 'Skill Tree',          emoji: '🌳', desc: 'Specialize your criminal talents.',           reqLevel: 3, reqDay: 40 },
  // TIER 3: Empire building (day 100-500) - serious operations
  processing: { name: 'Drug Lab',            emoji: '⚗️', desc: 'Process raw product for higher margins.',     reqLevel: 4, reqDay: 120 },
  heists:     { name: 'Heists',              emoji: '🎯', desc: 'Plan and execute high-risk jobs.',            reqLevel: 4, reqDay: 150 },
  distribution: { name: 'Distribution',      emoji: '📡', desc: 'Set up drug distribution networks.',          reqLevel: 4, reqDay: 100 },
  factions:   { name: 'Factions',            emoji: '⚔️', desc: 'Ally or war with powerful organizations.',    reqLevel: 5, reqDay: 200 },
  shipping:   { name: 'Shipping Network',    emoji: '🚛', desc: 'Move product across your empire.',            reqLevel: 5, reqDay: 250 },
  imports:    { name: 'Import/Export',        emoji: '🌍', desc: 'Trade goods across borders.',                 reqLevel: 5, reqDay: 300 },
  // TIER 4: Power player (day 250-1000) - high-level operations
  politics:   { name: 'Politics',            emoji: '🏛️', desc: 'Corrupt officials and bend the law.',         reqLevel: 6, reqDay: 400 },
  worldMap:   { name: 'World Map',           emoji: '🌍', desc: 'Expand operations globally.',                 reqLevel: 7, reqDay: 500 },
  futures:    { name: 'Futures Trading',     emoji: '📊', desc: 'Speculate on drug price movements.',          reqLevel: 7, reqDay: 450 },
  mafiaOps:   { name: 'Mafia Operations',    emoji: '🏢', desc: 'Run large-scale organized crime operations.', reqLevel: 10, reqDay: 750 },
  // Social (unlocks early but gated by day)
  romance:    { name: 'Romance',             emoji: '💕', desc: 'Find love in the criminal underworld.',       reqLevel: 1, reqDay: 30 },
  nightlife:  { name: 'Nightlife',           emoji: '🌙', desc: 'Hit the clubs and make connections.',         reqLevel: 1, reqDay: 40 },
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

    // TIER 1: Early game (day 1-50) - basics
    stash: level >= 2 || day >= 15,
    crew: level >= 2 || day >= 30,
    properties: level >= 2 || day >= 25,
    safehouse: level >= 2 || day >= 20,
    lifestyle: level >= 2 || day >= 25,
    skills: level >= 3 || day >= 40,

    // TIER 2: Establishing (day 50-250)
    fronts: level >= 3 || day >= 60,
    territory: level >= 3 || day >= 50,
    vehicles: level >= 3 || day >= 45,
    rivals: level >= 3 || day >= 75,
    defense: level >= 3 || day >= 80,
    bodies: level >= 3 || day >= 60,
    businesses: level >= 3 || day >= 70,
    security: level >= 3 || day >= 55,

    // TIER 3: Empire building (day 100-500)
    processing: level >= 4 || day >= 120,
    heists: level >= 4 || day >= 150,
    distribution: level >= 4 || day >= 100,
    factions: level >= 5 || day >= 200,
    shipping: level >= 5 || day >= 250,
    imports: level >= 5 || day >= 300,

    // TIER 4: Power player (day 250-1000)
    politics: level >= 6 || day >= 400,
    worldMap: level >= 7 || day >= 500,
    futures: level >= 7 || day >= 450,
    mafiaOps: level >= 10 || day >= 750,

    // Social
    romance: level >= 1 || day >= 30,
    nightlife: level >= 1 || day >= 40,
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
