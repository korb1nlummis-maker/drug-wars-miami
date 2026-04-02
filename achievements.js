// ============================================================
// DRUG WARS: ACHIEVEMENTS & LEVELING SYSTEM
// ============================================================

// ============================================================
// KINGPIN LEVEL SYSTEM
// ============================================================
const KINGPIN_LEVELS = [
  // XP scaled for 5000-day game. ~150 XP/day avg = 750K total possible XP
  // Level 20 at 600K means only dedicated players max out around day 4000
  { level: 1, title: 'Street Punk', xpRequired: 0, emoji: '🐀', perk: null, perkDesc: 'Starting out. Survive.' },
  { level: 2, title: 'Corner Boy', xpRequired: 500, emoji: '🧢', perk: 'haggle', perkDesc: '5% discount on all drug purchases' },
  { level: 3, title: 'Hustler', xpRequired: 1500, emoji: '💊', perk: 'extra_carry', perkDesc: '+1,000 inventory capacity' },
  { level: 4, title: 'Dealer', xpRequired: 4000, emoji: '🔫', perk: 'street_cred', perkDesc: '-10% encounter chance when traveling' },
  { level: 5, title: 'Supplier', xpRequired: 8000, emoji: '📦', perk: 'bulk_buyer', perkDesc: '10% discount on all drug purchases' },
  { level: 6, title: 'Distributor', xpRequired: 15000, emoji: '🚐', perk: 'crew_loyalty', perkDesc: 'Crew loyalty decays 50% slower' },
  { level: 7, title: 'Lieutenant', xpRequired: 25000, emoji: '⭐', perk: 'extra_carry_2', perkDesc: '+3,000 inventory capacity' },
  { level: 8, title: 'Underboss', xpRequired: 40000, emoji: '🎖️', perk: 'intimidation', perkDesc: '+15% sell price on all drugs' },
  { level: 9, title: 'Boss', xpRequired: 60000, emoji: '👑', perk: 'connections', perkDesc: '-20% transport costs' },
  { level: 10, title: 'Kingpin', xpRequired: 85000, emoji: '🏆', perk: 'heat_resist', perkDesc: 'Heat decays 2x faster' },
  { level: 11, title: 'Cartel Leader', xpRequired: 120000, emoji: '🦅', perk: 'muscle', perkDesc: '+25% combat damage' },
  { level: 12, title: 'Drug Lord', xpRequired: 165000, emoji: '💎', perk: 'empire_discount', perkDesc: '15% discount on all purchases' },
  { level: 13, title: 'Narco Emperor', xpRequired: 220000, emoji: '🌐', perk: 'investigation_shield', perkDesc: 'Investigation gains reduced by 30%' },
  { level: 14, title: 'Shadow King', xpRequired: 285000, emoji: '👁️', perk: 'max_carry', perkDesc: '+10,000 inventory capacity' },
  { level: 15, title: 'Legendary', xpRequired: 350000, emoji: '🔥', perk: 'untouchable', perkDesc: 'Bust chance halved, +20% all income' },
  { level: 16, title: 'Mythic', xpRequired: 420000, emoji: '⚡', perk: 'mythic_haggle', perkDesc: '20% discount on all drug purchases' },
  { level: 17, title: 'Phantom', xpRequired: 490000, emoji: '👻', perk: 'ghost', perkDesc: 'Investigation gains reduced by 50%' },
  { level: 18, title: 'Overlord', xpRequired: 540000, emoji: '🏰', perk: 'overlord_income', perkDesc: '+50% territory and distribution income' },
  { level: 19, title: 'Godfather', xpRequired: 580000, emoji: '🎩', perk: 'godfather', perkDesc: 'Court contacts 20% cheaper, +15% success' },
  { level: 20, title: 'Immortal', xpRequired: 620000, emoji: '💀', perk: 'immortal', perkDesc: 'All perks enhanced. You are untouchable.' },
];

// XP rewards for actions
const XP_REWARDS = {
  // Scaled for 5000-day game. Target: ~150 XP/day average, level 20 around day 4000
  buy_drug: 1,             // was 3 — buying is trivial
  sell_drug: 2,            // was 5 — selling is the core loop but shouldn't power-level
  sell_profit_1k: 5,       // was 15
  sell_profit_10k: 15,     // was 50
  sell_profit_100k: 50,    // was 200
  sell_profit_1m: 150,     // was 500
  travel: 3,               // was 8
  win_combat: 25,          // was 60
  win_territory: 100,      // was 300
  survive_dea: 75,         // was 150
  not_guilty: 40,          // was 80
  hire_crew: 5,            // was 10
  visit_new_city: 15,      // was 25
  complete_achievement: 25, // was 50
  complete_mission: 40,    // was 75
  complete_main_mission: 100, // was 200
  complete_side_mission: 20, // new
  pay_debt: 5,             // was 15
  bank_deposit: 1,         // was 2
  buy_property: 15,        // was 40
  buy_front: 15,           // was 40
  buy_safehouse: 20,       // was 50
  upgrade_safehouse: 10,   // was 25
  daily_empire: 3,         // was 5 — passive XP per day for owning territory/fronts
  daily_territory_bonus: 1, // was 2 — +1 XP per territory per day
};

function getKingpinLevel(xp) {
  let lvl = KINGPIN_LEVELS[0];
  for (const l of KINGPIN_LEVELS) {
    if (xp >= l.xpRequired) lvl = l;
    else break;
  }
  return lvl;
}

function hasPerk(state, perkId) {
  const lvl = getKingpinLevel(state.xp || 0);
  for (const l of KINGPIN_LEVELS) {
    if (l.level > lvl.level) break;
    if (l.perk === perkId) return true;
  }
  return false;
}

function getActivePerks(state) {
  const lvl = getKingpinLevel(state.xp || 0);
  return KINGPIN_LEVELS.filter(l => l.level <= lvl.level && l.perk).map(l => ({ perk: l.perk, desc: l.perkDesc, level: l.level, emoji: l.emoji }));
}

// Get cumulative buy discount from perks
function getPerkBuyDiscount(state) {
  let discount = 0;
  if (hasPerk(state, 'haggle')) discount += 0.05;
  if (hasPerk(state, 'bulk_buyer')) discount += 0.10;
  if (hasPerk(state, 'empire_discount')) discount += 0.15;
  if (hasPerk(state, 'mythic_haggle')) discount += 0.20;
  return Math.min(discount, 0.40); // cap at 40%
}

// Get cumulative sell bonus from perks
function getPerkSellBonus(state) {
  let bonus = 0;
  if (hasPerk(state, 'intimidation')) bonus += 0.15;
  return bonus;
}

// Get extra carry capacity from perks
function getPerkExtraCarry(state) {
  let extra = 0;
  if (hasPerk(state, 'extra_carry')) extra += 1000;
  if (hasPerk(state, 'extra_carry_2')) extra += 3000;
  if (hasPerk(state, 'max_carry')) extra += 10000;
  return extra;
}

function getNextLevel(xp) {
  for (const l of KINGPIN_LEVELS) {
    if (xp < l.xpRequired) return l;
  }
  return null; // max level
}

function awardXP(state, action, amount) {
  if (!state.xp && state.xp !== 0) state.xp = 0;
  let reward = amount || XP_REWARDS[action] || 0;
  if (reward <= 0) return null;

  // Apply NG+ XP multiplier
  if (typeof getNGPlusXPMultiplier === 'function') {
    reward = Math.round(reward * getNGPlusXPMultiplier(state));
  }

  const oldLevel = getKingpinLevel(state.xp);
  state.xp += reward;
  const newLevel = getKingpinLevel(state.xp);

  if (newLevel.level > oldLevel.level) {
    // Award skill points on level up (2 pts per level — total 40 across 20 levels)
    // This means maxing all skills takes nearly the full 5000-day game
    const levelsGained = newLevel.level - oldLevel.level;
    const pointsGained = levelsGained * 2;
    state.skillPoints = (state.skillPoints || 0) + pointsGained;
    return {
      levelUp: true,
      oldLevel: oldLevel,
      newLevel: newLevel,
      xpGained: reward,
      skillPointsGained: pointsGained,
    };
  }
  return { levelUp: false, xpGained: reward };
}

// ============================================================
// ACHIEVEMENTS (100+)
// ============================================================
const ACHIEVEMENTS = [
  // === MONEY (20) ===
  { id: 'first_dollar', name: 'First Dollar', desc: 'Make your first sale', emoji: '💵', category: 'money', xp: 10 },
  { id: 'pocket_change', name: 'Pocket Change', desc: 'Have $1,000 cash', emoji: '💰', category: 'money', xp: 10 },
  { id: 'five_figures', name: 'Five Figures', desc: 'Have $10,000 cash', emoji: '💰', category: 'money', xp: 15 },
  { id: 'six_figures', name: 'Six Figures', desc: 'Have $100,000 cash', emoji: '🤑', category: 'money', xp: 25 },
  { id: 'millionaire', name: 'Millionaire', desc: 'Have $1,000,000 total assets', emoji: '🏦', category: 'money', xp: 50 },
  { id: 'multi_millionaire', name: 'Multi-Millionaire', desc: 'Have $5,000,000 total assets', emoji: '💎', category: 'money', xp: 75 },
  { id: 'debt_free', name: 'Debt Free', desc: 'Pay off your entire debt', emoji: '🎉', category: 'money', xp: 20 },
  { id: 'banker', name: 'Banker', desc: 'Have $50,000 in the bank', emoji: '🏛️', category: 'money', xp: 20 },
  { id: 'interest_king', name: 'Interest King', desc: 'Earn $10,000+ from bank interest', emoji: '📈', category: 'money', xp: 30 },
  { id: 'big_spender', name: 'Big Spender', desc: 'Spend $100,000 in a single purchase', emoji: '💳', category: 'money', xp: 25 },
  { id: 'penny_pincher', name: 'Penny Pincher', desc: 'Buy a drug for under $50', emoji: '🪙', category: 'money', xp: 10 },
  { id: 'profit_margin', name: 'Profit Margin', desc: 'Sell drugs for 10x what you paid', emoji: '📊', category: 'money', xp: 30 },
  { id: 'price_crash', name: 'Buy the Dip', desc: 'Buy during a price crash event', emoji: '📉', category: 'money', xp: 15 },
  { id: 'price_spike', name: 'Sell the Peak', desc: 'Sell during a price spike event', emoji: '📈', category: 'money', xp: 15 },
  { id: 'quick_flip', name: 'Quick Flip', desc: 'Buy and sell in the same city same day', emoji: '🔄', category: 'money', xp: 10 },
  { id: 'stash_value_50k', name: 'Stash House', desc: 'Have $50,000 worth of stashed drugs', emoji: '📦', category: 'money', xp: 20 },
  { id: 'no_debt_early', name: 'Early Bird', desc: 'Pay off debt before day 15', emoji: '🐦', category: 'money', xp: 30 },
  { id: 'loan_shark_max', name: 'Deep in the Hole', desc: 'Owe $50,000+ to the loan shark', emoji: '🦈', category: 'money', xp: 15 },
  { id: 'broke', name: 'Rock Bottom', desc: 'Have $0 cash with no inventory', emoji: '😢', category: 'money', xp: 10 },
  { id: 'cash_hoarder', name: 'Cash Hoarder', desc: 'Carry $500,000+ cash (not banked)', emoji: '🧳', category: 'money', xp: 30 },

  // === TRADING (20) ===
  { id: 'first_buy', name: 'Window Shopping', desc: 'Buy your first drug', emoji: '🛒', category: 'trading', xp: 5 },
  { id: 'first_sale', name: 'Street Vendor', desc: 'Make your first sale', emoji: '🏪', category: 'trading', xp: 5 },
  { id: 'bulk_buyer', name: 'Bulk Buyer', desc: 'Buy 50+ units in one transaction', emoji: '📦', category: 'trading', xp: 15 },
  { id: 'bulk_seller', name: 'Moving Weight', desc: 'Sell 50+ units in one transaction', emoji: '⚖️', category: 'trading', xp: 15 },
  { id: 'diversified', name: 'Diversified Portfolio', desc: 'Own 5 different drugs at once', emoji: '🌈', category: 'trading', xp: 20 },
  { id: 'specialist_cocaine', name: 'Snow King', desc: 'Sell 100+ units of Cocaine', emoji: '❄️', category: 'trading', xp: 20 },
  { id: 'specialist_heroin', name: 'China White', desc: 'Sell 100+ units of Heroin', emoji: '💉', category: 'trading', xp: 20 },
  { id: 'specialist_weed', name: 'Ganja Guru', desc: 'Sell 200+ units of Weed', emoji: '🌿', category: 'trading', xp: 15 },
  { id: 'specialist_meth', name: 'Blue Sky', desc: 'Sell 100+ units of Meth', emoji: '🔵', category: 'trading', xp: 20 },
  { id: 'specialist_crack', name: 'Rock Solid', desc: 'Sell 100+ units of Crack', emoji: '🪨', category: 'trading', xp: 20 },
  { id: 'specialist_ecstasy', name: 'Party Supplier', desc: 'Sell 100+ units of Ecstasy', emoji: '💊', category: 'trading', xp: 20 },
  { id: 'total_100_sold', name: 'Centurion', desc: 'Sell 100 total units', emoji: '💯', category: 'trading', xp: 15 },
  { id: 'total_500_sold', name: 'Half K', desc: 'Sell 500 total units', emoji: '📊', category: 'trading', xp: 25 },
  { id: 'total_1000_sold', name: 'Kilo King', desc: 'Sell 1,000 total units', emoji: '👑', category: 'trading', xp: 40 },
  { id: 'full_inventory', name: 'Packed House', desc: 'Fill your inventory to capacity', emoji: '🧱', category: 'trading', xp: 10 },
  { id: 'empty_shelf', name: 'Clean Sweep', desc: 'Sell all your inventory at once', emoji: '🧹', category: 'trading', xp: 10 },
  { id: 'all_drugs_traded', name: 'Connoisseur', desc: 'Buy or sell every type of drug', emoji: '🍷', category: 'trading', xp: 35 },
  { id: 'haggler', name: 'Haggler', desc: 'Buy drugs in 10 different cities', emoji: '🤝', category: 'trading', xp: 25 },
  { id: 'market_mover', name: 'Market Mover', desc: 'Make 50 total transactions', emoji: '📈', category: 'trading', xp: 20 },
  { id: 'premium_dealer', name: 'Premium Dealer', desc: 'Only deal premium drugs for 10 turns', emoji: '💎', category: 'trading', xp: 30 },

  // === TRAVEL (15) ===
  { id: 'first_flight', name: 'First Flight', desc: 'Travel to your first destination', emoji: '✈️', category: 'travel', xp: 5 },
  { id: 'globe_trotter', name: 'Globe Trotter', desc: 'Visit 10 different cities', emoji: '🌍', category: 'travel', xp: 25 },
  { id: 'world_tour', name: 'World Tour', desc: 'Visit all 21 cities', emoji: '🗺️', category: 'travel', xp: 50 },
  { id: 'americas_tour', name: 'American Dream', desc: 'Visit all cities in the Americas', emoji: '🗽', category: 'travel', xp: 20 },
  { id: 'europe_tour', name: 'European Vacation', desc: 'Visit all cities in Europe', emoji: '🏰', category: 'travel', xp: 20 },
  { id: 'asia_tour', name: 'Eastern Promise', desc: 'Visit all cities in Asia', emoji: '🏯', category: 'travel', xp: 20 },
  { id: 'frequent_flyer', name: 'Frequent Flyer', desc: 'Travel 30 times', emoji: '🛫', category: 'travel', xp: 20 },
  { id: 'jet_setter', name: 'Jet Setter', desc: 'Use commercial flight 10 times', emoji: '🛩️', category: 'travel', xp: 15 },
  { id: 'road_warrior', name: 'Road Warrior', desc: 'Travel by car 15 times', emoji: '🚗', category: 'travel', xp: 15 },
  { id: 'speed_runner', name: 'Speed Runner', desc: 'Visit 5 cities in 5 days', emoji: '⚡', category: 'travel', xp: 30 },
  { id: 'home_body', name: 'Home Body', desc: 'Stay in Miami for 10 consecutive days', emoji: '🏠', category: 'travel', xp: 10 },
  { id: 'danger_seeker', name: 'Danger Seeker', desc: 'Visit a danger level 5 city', emoji: '💀', category: 'travel', xp: 15 },
  { id: 'safe_travels', name: 'Safe Travels', desc: 'Travel 10 times without an encounter', emoji: '🕊️', category: 'travel', xp: 20 },
  { id: 'smuggler_route', name: 'Smuggler Route', desc: 'Travel with 80+ units of inventory', emoji: '🚢', category: 'travel', xp: 20 },
  { id: 'intercontinental', name: 'Intercontinental', desc: 'Travel between 3 different regions', emoji: '🌐', category: 'travel', xp: 15 },

  // === COMBAT (15) ===
  { id: 'first_blood', name: 'First Blood', desc: 'Win your first fight', emoji: '🩸', category: 'combat', xp: 10 },
  { id: 'gang_buster', name: 'Gang Buster', desc: 'Win 5 gang fights', emoji: '💪', category: 'combat', xp: 20 },
  { id: 'cop_killer', name: 'Cop Killer', desc: 'Defeat police in combat', emoji: '🚔', category: 'combat', xp: 25 },
  { id: 'dea_survivor', name: 'DEA Survivor', desc: 'Survive a DEA raid', emoji: '🚁', category: 'combat', xp: 35 },
  { id: 'body_count_10', name: 'Body Count', desc: 'Kill 10 enemies total', emoji: '💀', category: 'combat', xp: 20 },
  { id: 'body_count_50', name: 'Mass Casualty', desc: 'Kill 50 enemies total', emoji: '☠️', category: 'combat', xp: 40 },
  { id: 'pacifist', name: 'Pacifist', desc: 'Complete the game without killing anyone', emoji: '☮️', category: 'combat', xp: 50 },
  { id: 'escape_artist', name: 'Escape Artist', desc: 'Run from 5 fights successfully', emoji: '🏃', category: 'combat', xp: 15 },
  { id: 'flawless_victory', name: 'Flawless Victory', desc: 'Win a fight without taking damage', emoji: '✨', category: 'combat', xp: 25 },
  { id: 'near_death', name: 'Near Death', desc: 'Survive with 5 HP or less', emoji: '💔', category: 'combat', xp: 15 },
  { id: 'weapon_collector', name: 'Arsenal', desc: 'Own 3 different weapons', emoji: '🔫', category: 'combat', xp: 20 },
  { id: 'bribe_master', name: 'Bribe Master', desc: 'Bribe your way out of 3 encounters', emoji: '💸', category: 'combat', xp: 15 },
  { id: 'surrender_monkey', name: 'Hands Up', desc: 'Surrender to police', emoji: '🏳️', category: 'combat', xp: 5 },
  { id: 'ten_combat_wins', name: 'Veteran Fighter', desc: 'Win 10 combats', emoji: '🎖️', category: 'combat', xp: 25 },
  { id: 'rampage', name: 'Rampage', desc: 'Win 3 fights in a row without healing', emoji: '🔥', category: 'combat', xp: 30 },

  // === TERRITORY (10) ===
  { id: 'first_turf', name: 'My Turf', desc: 'Take over your first territory', emoji: '🏴', category: 'territory', xp: 25 },
  { id: 'turf_war_3', name: 'Expanding Empire', desc: 'Control 3 territories', emoji: '🗺️', category: 'territory', xp: 40 },
  { id: 'turf_war_5', name: 'Regional Power', desc: 'Control 5 territories', emoji: '🌍', category: 'territory', xp: 60 },
  { id: 'turf_war_10', name: 'Continental Kingpin', desc: 'Control 10 territories', emoji: '👑', category: 'territory', xp: 100 },
  { id: 'turf_war_all', name: 'World Domination', desc: 'Control all 21 territories', emoji: '🌐', category: 'territory', xp: 200 },
  { id: 'take_medellin', name: 'Escobar\'s Throne', desc: 'Take over Medellín', emoji: '🏔️', category: 'territory', xp: 40 },
  { id: 'take_tokyo', name: 'Yakuza Slayer', desc: 'Take over Tokyo', emoji: '🗼', category: 'territory', xp: 35 },
  { id: 'take_moscow', name: 'Cold War', desc: 'Take over Moscow', emoji: '❄️', category: 'territory', xp: 35 },
  { id: 'americas_domination', name: 'Americas Cartel', desc: 'Control all American territories', emoji: '🦅', category: 'territory', xp: 75 },
  { id: 'territory_income', name: 'Passive Income', desc: 'Earn $10,000 from territory income', emoji: '🏧', category: 'territory', xp: 25 },

  // === CREW (10) ===
  { id: 'first_hire', name: 'First Hire', desc: 'Hire your first crew member', emoji: '🤝', category: 'crew', xp: 10 },
  { id: 'full_crew', name: 'Full Crew', desc: 'Have 5 crew members', emoji: '👥', category: 'crew', xp: 25 },
  { id: 'army', name: 'Private Army', desc: 'Have 8+ crew members', emoji: '🎖️', category: 'crew', xp: 35 },
  { id: 'loyal_crew', name: 'Loyalty', desc: 'Have all crew at 80+ loyalty', emoji: '❤️', category: 'crew', xp: 25 },
  { id: 'crew_medic', name: 'Field Medic', desc: 'Heal a crew member at the hospital', emoji: '🏥', category: 'crew', xp: 10 },
  { id: 'crew_lost', name: 'Man Down', desc: 'Have a crew member injured in combat', emoji: '🩹', category: 'crew', xp: 5 },
  { id: 'hired_lawyer', name: 'Lawyered Up', desc: 'Hire a Lawyer', emoji: '👔', category: 'crew', xp: 15 },
  { id: 'hired_fall_guy', name: 'Insurance Policy', desc: 'Hire a Fall Guy', emoji: '🎭', category: 'crew', xp: 15 },
  { id: 'all_types', name: 'Full Roster', desc: 'Have every crew type hired', emoji: '📋', category: 'crew', xp: 40 },
  { id: 'fired_crew', name: 'You\'re Fired', desc: 'Fire a crew member', emoji: '🚪', category: 'crew', xp: 5 },

  // === LEGAL (10) ===
  { id: 'first_arrest', name: 'Booked', desc: 'Get arrested for the first time', emoji: '🔒', category: 'legal', xp: 10 },
  { id: 'not_guilty', name: 'Not Guilty', desc: 'Be found not guilty at trial', emoji: '⚖️', category: 'legal', xp: 20 },
  { id: 'guilty', name: 'Guilty', desc: 'Be found guilty at trial', emoji: '🔨', category: 'legal', xp: 10 },
  { id: 'fall_guy_used', name: 'Scapegoat', desc: 'Use a Fall Guy to avoid trial', emoji: '🎭', category: 'legal', xp: 25 },
  { id: 'paid_off_judge', name: 'Justice is Blind', desc: 'Pay off a Corrupt Judge', emoji: '⚖️', category: 'legal', xp: 20 },
  { id: 'turned_rat', name: 'Snitch', desc: 'Take the FBI Informant Deal', emoji: '🐀', category: 'legal', xp: 15 },
  { id: 'clean_record', name: 'Clean Record', desc: 'End the game with 0 arrests', emoji: '📄', category: 'legal', xp: 25 },
  { id: 'jailbird', name: 'Jailbird', desc: 'Spend 20+ days in prison total', emoji: '⛓️', category: 'legal', xp: 15 },
  { id: 'investigation_5', name: 'Most Wanted', desc: 'Reach investigation level 5', emoji: '🚨', category: 'legal', xp: 20 },
  { id: 'beat_the_system', name: 'Beat the System', desc: 'Be found not guilty 3 times', emoji: '🎰', category: 'legal', xp: 40 },

  // === REPUTATION & MISC (15) ===
  { id: 'rep_50', name: 'Known on the Street', desc: 'Reach 50 reputation', emoji: '🌟', category: 'reputation', xp: 15 },
  { id: 'rep_100', name: 'Legendary Rep', desc: 'Reach 100 reputation', emoji: '⭐', category: 'reputation', xp: 30 },
  { id: 'rep_negative', name: 'Snitch Rep', desc: 'Have -50 or lower reputation', emoji: '🐀', category: 'reputation', xp: 10 },
  { id: 'heat_max', name: 'White Hot', desc: 'Reach 100 heat', emoji: '🔥', category: 'reputation', xp: 15 },
  { id: 'heat_zero', name: 'Ghost', desc: 'Have 0 heat with 50+ reputation', emoji: '👻', category: 'reputation', xp: 25 },
  { id: 'survived', name: 'Survivor', desc: 'Complete the full 60 days', emoji: '🏁', category: 'reputation', xp: 30 },
  { id: 'speedrun', name: 'Speed Run', desc: 'Reach $100,000 before day 15', emoji: '⚡', category: 'reputation', xp: 40 },
  { id: 'high_score', name: 'New Record', desc: 'Set a new high score', emoji: '🏆', category: 'reputation', xp: 20 },
  { id: 'day_one', name: 'Day One', desc: 'Start a new game', emoji: '🎬', category: 'reputation', xp: 5 },
  { id: 'hospital_visit', name: 'Walking Wounded', desc: 'Visit the hospital', emoji: '🏥', category: 'reputation', xp: 5 },
  { id: 'weapon_upgrade', name: 'Upgrade', desc: 'Buy a weapon better than fists', emoji: '⬆️', category: 'reputation', xp: 10 },
  { id: 'best_weapon', name: 'Heavy Hitter', desc: 'Own the most expensive weapon', emoji: '💣', category: 'reputation', xp: 25 },
  { id: 'found_stash', name: 'Lucky Find', desc: 'Find a random drug stash while traveling', emoji: '🎁', category: 'reputation', xp: 10 },
  { id: 'mugged', name: 'Victim', desc: 'Get mugged during travel', emoji: '🔪', category: 'reputation', xp: 5 },
  { id: 'comeback', name: 'Comeback Kid', desc: 'Recover from under $500 to over $50,000', emoji: '🔄', category: 'reputation', xp: 35 },

  // === KINGPIN LEVEL MILESTONES (5) ===
  { id: 'level_5', name: 'Rising Star', desc: 'Reach Kingpin Level 5', emoji: '⭐', category: 'level', xp: 0 },
  { id: 'level_10', name: 'The Kingpin', desc: 'Reach Kingpin Level 10', emoji: '👑', category: 'level', xp: 0 },
  { id: 'level_15', name: 'Living Legend', desc: 'Reach Kingpin Level 15', emoji: '🔥', category: 'level', xp: 0 },
  { id: 'max_level', name: 'Max Level', desc: 'Reach the maximum Kingpin Level', emoji: '🏆', category: 'level', xp: 0 },
  { id: 'level_up_5_times', name: 'Climbing Fast', desc: 'Level up 5 times in one game', emoji: '📶', category: 'level', xp: 20 },
  // Distribution achievements
  { id: 'dist_first', name: 'First Taste', desc: 'Set up your first distribution point', emoji: '🚬', category: 'territory', xp: 30 },
  { id: 'dist_network', name: 'Network Effect', desc: 'Have 3+ active distribution locations', emoji: '🕸️', category: 'territory', xp: 50 },
  { id: 'dist_big_day', name: 'Employee of the Month', desc: 'Earn $50K+ distribution revenue in a single day', emoji: '💰', category: 'money', xp: 75 },
  { id: 'dist_empire', name: 'Empire Builder', desc: 'Upgrade a distribution point to tier 3', emoji: '👑', category: 'territory', xp: 100 },
  { id: 'dist_million', name: 'Drug Lord', desc: 'Earn $1M total from distribution', emoji: '🏴‍☠️', category: 'money', xp: 150 },

  // === SKILL TREE (15) ===
  { id: 'first_skill', name: 'Skill Unlocked', desc: 'Unlock your first skill', emoji: '🔓', category: 'skills', xp: 15 },
  { id: 'skills_5', name: 'Talented', desc: 'Unlock 5 skill ranks', emoji: '📚', category: 'skills', xp: 25 },
  { id: 'skills_15', name: 'Specialist', desc: 'Unlock 15 skill ranks', emoji: '🎓', category: 'skills', xp: 50 },
  { id: 'skills_30', name: 'Polymath', desc: 'Unlock 30 skill ranks', emoji: '🧠', category: 'skills', xp: 100 },
  { id: 'travel_tree_complete', name: 'Road Scholar', desc: 'Max all Travelling skills', emoji: '🗺️', category: 'skills', xp: 150 },
  { id: 'power_tree_complete', name: 'War Machine', desc: 'Max all Power skills', emoji: '💪', category: 'skills', xp: 150 },
  { id: 'influence_tree_complete', name: 'Silver Tongue Devil', desc: 'Max all Influence skills', emoji: '🎭', category: 'skills', xp: 150 },
  { id: 'control_tree_complete', name: 'Puppet Master', desc: 'Max all Control skills', emoji: '👑', category: 'skills', xp: 150 },
  { id: 'all_trees_complete', name: 'Ascended', desc: 'Max ALL skill trees', emoji: '✨', category: 'skills', xp: 500, hidden: true },
  { id: 'tier3_skill', name: 'Tier 3 Unlocked', desc: 'Unlock any tier 3 skill', emoji: '⭐', category: 'skills', xp: 50 },
  { id: 'kingmaker_unlocked', name: 'The Kingmaker', desc: 'Unlock the Kingmaker skill', emoji: '♚', category: 'skills', xp: 200, hidden: true },
  { id: 'bulletproof_unlocked', name: 'Immortal Warrior', desc: 'Unlock the Bulletproof skill', emoji: '🔰', category: 'skills', xp: 100, hidden: true },
  { id: 'tunnel_unlocked', name: 'Underground Railroad', desc: 'Unlock Tunnel Network', emoji: '🕳️', category: 'skills', xp: 100, hidden: true },
  { id: 'puppet_master_unlocked', name: 'Above the Law', desc: 'Unlock Puppet Master', emoji: '🎪', category: 'skills', xp: 150, hidden: true },
  { id: 'army_of_one_unlocked', name: 'Lone Wolf', desc: 'Unlock Army of One', emoji: '🦾', category: 'skills', xp: 100, hidden: true },

  // === DIALOGUE & SPEECH (15) ===
  { id: 'first_dialogue', name: 'People Person', desc: 'Complete your first dialogue encounter', emoji: '🗣️', category: 'dialogue', xp: 10 },
  { id: 'dialogue_10', name: 'Conversationalist', desc: 'Complete 10 dialogue encounters', emoji: '💬', category: 'dialogue', xp: 25 },
  { id: 'dialogue_50', name: 'Silver Tongue', desc: 'Complete 50 dialogue encounters', emoji: '🎤', category: 'dialogue', xp: 75 },
  { id: 'speech_20', name: 'Smooth Talker', desc: 'Reach 20 speech skill', emoji: '😎', category: 'dialogue', xp: 15 },
  { id: 'speech_50', name: 'Master Negotiator', desc: 'Reach 50 speech skill', emoji: '🤝', category: 'dialogue', xp: 30 },
  { id: 'speech_80', name: 'Silver-Tongued Devil', desc: 'Reach 80 speech skill', emoji: '😈', category: 'dialogue', xp: 50 },
  { id: 'speech_100', name: 'Voice of God', desc: 'Reach 100 speech skill', emoji: '🌟', category: 'dialogue', xp: 100, hidden: true },
  { id: 'passed_speech_check', name: 'Persuasive', desc: 'Pass your first speech check', emoji: '✅', category: 'dialogue', xp: 15 },
  { id: 'failed_speech_check', name: 'Foot in Mouth', desc: 'Fail a speech check', emoji: '🤦', category: 'dialogue', xp: 5 },
  { id: 'bribed_cop', name: 'Dirty Money', desc: 'Bribe a corrupt cop', emoji: '👮', category: 'dialogue', xp: 20 },
  { id: 'cia_contact', name: 'Government Asset', desc: 'Make a CIA contact', emoji: '🏛️', category: 'dialogue', xp: 50, hidden: true },
  { id: 'talk_to_kingpin', name: 'Wisdom of the Ancients', desc: 'Listen to a retired kingpin', emoji: '🎩', category: 'dialogue', xp: 25 },
  { id: 'all_npcs_met', name: 'Social Butterfly', desc: 'Meet all NPC types', emoji: '🦋', category: 'dialogue', xp: 75, hidden: true },
  { id: 'cartel_partnership', name: 'Cartel Partner', desc: 'Form a cartel partnership', emoji: '💀', category: 'dialogue', xp: 40 },
  { id: 'hacker_hired', name: 'Digital Ghost', desc: 'Have a hacker wipe your record', emoji: '💻', category: 'dialogue', xp: 30 },

  // === WEAPONS (15) ===
  { id: 'pistol_owner', name: 'Packing Heat', desc: 'Own any pistol', emoji: '🔫', category: 'weapons', xp: 10 },
  { id: 'smg_owner', name: 'Spray and Pray', desc: 'Own any SMG', emoji: '🔫', category: 'weapons', xp: 15 },
  { id: 'rifle_owner', name: 'Rifleman', desc: 'Own any assault rifle', emoji: '🔫', category: 'weapons', xp: 20 },
  { id: 'heavy_owner', name: 'Big Guns', desc: 'Own any heavy weapon', emoji: '💥', category: 'weapons', xp: 30 },
  { id: 'legendary_owner', name: 'Legendary Arsenal', desc: 'Own a legendary weapon', emoji: '🌟', category: 'weapons', xp: 50 },
  { id: 'weapons_5', name: 'Small Armory', desc: 'Own 5 different weapons', emoji: '🏪', category: 'weapons', xp: 20 },
  { id: 'weapons_10', name: 'Arms Dealer', desc: 'Own 10 different weapons', emoji: '🏗️', category: 'weapons', xp: 40 },
  { id: 'weapons_all', name: 'Arsenal Complete', desc: 'Own every weapon in the game', emoji: '🏆', category: 'weapons', xp: 200, hidden: true },
  { id: 'rpg_owner', name: 'Rocket Man', desc: 'Own an RPG-7', emoji: '🚀', category: 'weapons', xp: 40 },
  { id: 'minigun_owner', name: 'Terminator', desc: 'Own the M134 Minigun', emoji: '💀', category: 'weapons', xp: 75, hidden: true },
  { id: 'scarface_weapon', name: 'Say Hello', desc: 'Own "My Little Friend"', emoji: '🌟', category: 'weapons', xp: 100, hidden: true },
  { id: 'gold_weapons', name: 'Bling Bling', desc: 'Own both gold weapons', emoji: '✨', category: 'weapons', xp: 60, hidden: true },
  { id: 'melee_only_win', name: 'Bare Knuckle', desc: 'Win a fight with only fists', emoji: '👊', category: 'weapons', xp: 25 },
  { id: 'one_shot_kill', name: 'One Shot', desc: 'Kill an enemy in a single hit', emoji: '🎯', category: 'weapons', xp: 30 },
  { id: 'spent_100k_weapons', name: 'Military Budget', desc: 'Spend $100K+ on weapons', emoji: '💸', category: 'weapons', xp: 35 },

  // === TRANSPORT (10) ===
  { id: 'narco_sub', name: 'Below the Surface', desc: 'Travel by narco submarine', emoji: '🔱', category: 'travel', xp: 40, hidden: true },
  { id: 'yacht_life', name: 'Yacht Life', desc: 'Travel by luxury yacht', emoji: '🛥️', category: 'travel', xp: 30 },
  { id: 'cartel_plane_used', name: 'Air Cartel', desc: 'Travel by cartel cargo plane', emoji: '🛫', category: 'travel', xp: 35 },
  { id: 'convoy_used', name: 'Convoy', desc: 'Travel by military convoy', emoji: '🪖', category: 'travel', xp: 30 },
  { id: 'armored_truck_used', name: 'Fort Knox', desc: 'Travel by armored truck', emoji: '🛡️', category: 'travel', xp: 20 },
  { id: 'motorcycle_rider', name: 'Easy Rider', desc: 'Travel by motorcycle 10 times', emoji: '🏍️', category: 'travel', xp: 20 },
  { id: 'all_transport', name: 'Transport Tycoon', desc: 'Use every type of transport', emoji: '🚀', category: 'travel', xp: 75, hidden: true },
  { id: 'semi_truck_used', name: 'Big Rig', desc: 'Smuggle goods via semi truck', emoji: '🚛', category: 'travel', xp: 25 },
  { id: 'go_fast_used', name: 'Go-Fast', desc: 'Travel by go-fast boat', emoji: '⚡', category: 'travel', xp: 20 },
  { id: 'budget_traveler', name: 'Penny Traveler', desc: 'Only use budget transport for 20 trips', emoji: '🚌', category: 'travel', xp: 15 },

  // === BUSINESS & LAUNDERING (10) ===
  { id: 'first_business', name: 'Legitimate Businessman', desc: 'Buy your first front business', emoji: '🏪', category: 'business', xp: 15 },
  { id: 'business_3', name: 'Franchise Owner', desc: 'Own 3 front businesses', emoji: '🏢', category: 'business', xp: 30 },
  { id: 'business_all', name: 'Mogul', desc: 'Own every type of front business', emoji: '🏰', category: 'business', xp: 100 },
  { id: 'laundered_100k', name: 'Money Launderer', desc: 'Launder $100,000', emoji: '🧼', category: 'business', xp: 25 },
  { id: 'laundered_1m', name: 'Wash King', desc: 'Launder $1,000,000', emoji: '💎', category: 'business', xp: 75 },
  { id: 'shell_corp_owner', name: 'Offshore King', desc: 'Own a Shell Corporation', emoji: '🏢', category: 'business', xp: 40 },
  { id: 'real_estate_owner', name: 'Property Mogul', desc: 'Own a Real Estate LLC', emoji: '🏠', category: 'business', xp: 35 },
  { id: 'biz_income_50k', name: 'Cash Flow', desc: 'Earn $50K total from businesses', emoji: '💰', category: 'business', xp: 30 },
  { id: 'nightclub_owner', name: 'Club Owner', desc: 'Own a Nightclub', emoji: '🎵', category: 'business', xp: 25 },
  { id: 'all_laundering', name: 'Squeaky Clean', desc: 'Launder through every business type', emoji: '✨', category: 'business', xp: 60, hidden: true },

  // === HIDDEN / SECRET ACHIEVEMENTS (30) ===
  { id: 'secret_millionaire_day1', name: 'Speed Demon', desc: 'Have $1M before day 30', emoji: '⚡', category: 'secret', xp: 150, hidden: true },
  { id: 'secret_no_travel', name: 'Home is Where the Heart Is', desc: 'Reach $50K without leaving Miami', emoji: '🏠', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_all_drugs_inventory', name: 'Walking Pharmacy', desc: 'Carry all 12 drugs at once', emoji: '💊', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_zero_heat_100_rep', name: 'Invisible Kingpin', desc: 'Have 0 heat, 100 rep, $1M+', emoji: '👻', category: 'secret', xp: 200, hidden: true },
  { id: 'secret_survive_3_arrests', name: 'Teflon Don', desc: 'Get arrested 3 times and never found guilty', emoji: '🛡️', category: 'secret', xp: 150, hidden: true },
  { id: 'secret_kill_100', name: 'Genocide', desc: 'Kill 100 people', emoji: '☠️', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_debt_100k', name: 'Drowning in Debt', desc: 'Owe $100,000+', emoji: '📉', category: 'secret', xp: 25, hidden: true },
  { id: 'secret_buy_sell_same_drug', name: 'Arbitrage King', desc: 'Buy and sell the same drug in the same city at profit', emoji: '🔄', category: 'secret', xp: 30, hidden: true },
  { id: 'secret_10_territories', name: 'Empire of Blood', desc: 'Hold 10 territories with 0 crew', emoji: '🩸', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_all_continents', name: 'Passport Stamped', desc: 'Visit a city on every continent in one trip chain', emoji: '🌍', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_survive_dea_3', name: 'Untouchable', desc: 'Survive 3 DEA raids', emoji: '🚁', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_day_1000', name: 'Long Game', desc: 'Reach day 1000', emoji: '📅', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_day_5000', name: 'Eternal Kingpin', desc: 'Reach the final day', emoji: '♾️', category: 'secret', xp: 200, hidden: true },
  { id: 'secret_10m_net_worth', name: 'Decamillionaire', desc: 'Have $10M net worth', emoji: '💎', category: 'secret', xp: 300, hidden: true },
  { id: 'secret_100m_net_worth', name: 'Centimillionaire', desc: 'Have $100M net worth', emoji: '🏆', category: 'secret', xp: 500, hidden: true },
  { id: 'secret_billion', name: 'Billionaire', desc: 'Have $1B net worth', emoji: '🌟', category: 'secret', xp: 1000, hidden: true },
  { id: 'secret_full_court', name: 'Court Jester', desc: 'Use all 6 court contacts in one trial', emoji: '⚖️', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_solo_territory', name: 'One Man Army', desc: 'Take a territory solo (no crew)', emoji: '🦾', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_buy_all_businesses', name: 'Legitimate Empire', desc: 'Own every front business', emoji: '🏛️', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_10_buffs', name: 'Buffed Up', desc: 'Have 5+ active buffs at once', emoji: '⚗️', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_max_inventory', name: 'Pack Mule', desc: 'Have 500+ inventory capacity', emoji: '🎒', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_cocaine_1000', name: 'Cocaine Cowboy', desc: 'Sell 1000 units of cocaine', emoji: '❄️', category: 'secret', xp: 100, hidden: true },
  { id: 'secret_weed_5000', name: 'Ganja Emperor', desc: 'Sell 5000 units of weed', emoji: '🌿', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_day_100_no_kill', name: 'Peaceful Kingpin', desc: 'Reach day 100 without killing anyone', emoji: '☮️', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_crew_10', name: 'Army Commander', desc: 'Have 10+ crew members', emoji: '🎖️', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_all_achievements', name: 'Completionist', desc: 'Unlock every other achievement', emoji: '🏅', category: 'secret', xp: 0, hidden: true },
  { id: 'secret_5_dist_locations', name: 'Drug Empire', desc: 'Have 5 active distribution points', emoji: '🗺️', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_saved_by_bulletproof', name: 'Should Be Dead', desc: 'Survive with Bulletproof skill at 1 HP', emoji: '🔰', category: 'secret', xp: 50, hidden: true },
  { id: 'secret_speech_resolved', name: 'Words Are Weapons', desc: 'Resolve 10 encounters through speech alone', emoji: '🗣️', category: 'secret', xp: 75, hidden: true },
  { id: 'secret_lost_everything', name: 'From the Ashes', desc: 'Lose all money, crew, and inventory, then reach $100K', emoji: '🔥', category: 'secret', xp: 150, hidden: true },

  // === BUFF & STATUS (10) ===
  { id: 'first_buff', name: 'Enhanced', desc: 'Gain your first active buff', emoji: '⚗️', category: 'buffs', xp: 10 },
  { id: 'cartel_connection', name: 'Connected', desc: 'Have a cartel buff active', emoji: '💀', category: 'buffs', xp: 20 },
  { id: 'cia_protected', name: 'Protected', desc: 'Have CIA protection active', emoji: '🏛️', category: 'buffs', xp: 30, hidden: true },
  { id: 'cursed', name: 'Bad Juju', desc: 'Get cursed by the fortune teller', emoji: '💀', category: 'buffs', xp: 10 },
  { id: 'lucky_charm', name: 'Lucky Charm', desc: 'Have the luck buff active', emoji: '🍀', category: 'buffs', xp: 15 },
  { id: 'sell_boosted', name: 'Premium Product', desc: 'Have enhanced sell prices', emoji: '📈', category: 'buffs', xp: 15 },
  { id: 'media_controlled', name: 'Fake News', desc: 'Control the media narrative', emoji: '📺', category: 'buffs', xp: 25 },
  { id: 'double_agent_active', name: 'Double Agent', desc: 'Have a double agent working for you', emoji: '🕵️', category: 'buffs', xp: 20 },
  { id: 'heat_immune', name: 'Untouchable', desc: 'Have heat immunity active', emoji: '🛡️', category: 'buffs', xp: 20 },
  { id: 'transport_discounted', name: 'Frequent Smuggler', desc: 'Get permanent transport discount', emoji: '✈️', category: 'buffs', xp: 25 },

  // === MILESTONE / ENDGAME (10) ===
  { id: 'end_rich', name: 'Retired Rich', desc: 'End the game with $5M+ net worth', emoji: '🏖️', category: 'endgame', xp: 100 },
  { id: 'end_empire', name: 'Criminal Empire', desc: 'End with 10+ territories and $1M+', emoji: '👑', category: 'endgame', xp: 150 },
  { id: 'end_clean', name: 'Clean Getaway', desc: 'End with 0 heat and 0 investigation', emoji: '🕊️', category: 'endgame', xp: 75 },
  { id: 'end_feared', name: 'Most Feared', desc: 'End with 100 reputation and 50+ kills', emoji: '💀', category: 'endgame', xp: 100 },
  { id: 'end_maxed', name: 'Maxed Out', desc: 'End at max kingpin level', emoji: '🏆', category: 'endgame', xp: 100 },
  { id: 'end_pacifist_rich', name: 'Peaceful Millionaire', desc: 'End with $1M+ and 0 kills', emoji: '☮️', category: 'endgame', xp: 200, hidden: true },
  { id: 'end_debt_free_rich', name: 'Self-Made', desc: 'End debt-free with $500K+', emoji: '🎓', category: 'endgame', xp: 75 },
  { id: 'end_world_domination', name: 'World Emperor', desc: 'End with all territories and all businesses', emoji: '🌐', category: 'endgame', xp: 300, hidden: true },
  { id: 'end_skills_maxed', name: 'Fully Evolved', desc: 'End with all skill trees maxed', emoji: '✨', category: 'endgame', xp: 250, hidden: true },
  { id: 'end_speed', name: 'Speedrunner Elite', desc: 'Reach $1M before day 50', emoji: '⚡', category: 'endgame', xp: 200, hidden: true },

  // === CHARACTER SELECTION (8) ===
  { id: 'char_dropout', name: 'Chemistry 101', desc: 'Play as The Dropout', emoji: '🧪', category: 'secret', xp: 15, hidden: true },
  { id: 'char_corner_kid', name: 'Corner Boy', desc: 'Play as The Corner Kid', emoji: '🧢', category: 'secret', xp: 15, hidden: true },
  { id: 'char_excon', name: 'Hard Time', desc: 'Play as The Ex-Con', emoji: '⛓️', category: 'secret', xp: 15, hidden: true },
  { id: 'char_hustler', name: 'Born Hustler', desc: 'Play as The Hustler', emoji: '🎲', category: 'secret', xp: 15, hidden: true },
  { id: 'char_connected', name: 'Family Ties', desc: 'Play as The Connected Kid', emoji: '🤝', category: 'secret', xp: 15, hidden: true },
  { id: 'char_cleanskin', name: 'Clean Record', desc: 'Play as The Cleanskin', emoji: '🧼', category: 'secret', xp: 15, hidden: true },
  { id: 'char_veteran', name: 'Old Soldier', desc: 'Play as The Veteran', emoji: '🎖️', category: 'secret', xp: 15, hidden: true },
  { id: 'char_immigrant', name: 'American Dream', desc: 'Play as The Immigrant', emoji: '🛬', category: 'secret', xp: 15, hidden: true },

  // === PROPERTIES (10) ===
  { id: 'first_property', name: 'Landlord', desc: 'Buy your first property', emoji: '🏠', category: 'business', xp: 20 },
  { id: 'properties_3', name: 'Real Estate Baron', desc: 'Own 3 properties', emoji: '🏘️', category: 'business', xp: 35 },
  { id: 'properties_5', name: 'Property Empire', desc: 'Own 5+ properties', emoji: '🏙️', category: 'business', xp: 50 },
  { id: 'tier3_property', name: 'Top Tier', desc: 'Own a Tier 3 property', emoji: '🏰', category: 'business', xp: 40 },
  { id: 'penthouse', name: 'Penthouse Suite', desc: 'Own a Penthouse', emoji: '🌃', category: 'business', xp: 50 },
  { id: 'lab_complex', name: 'Master Chemist', desc: 'Own a Lab Complex', emoji: '⚗️', category: 'business', xp: 50 },
  { id: 'stash_3_cities', name: 'Global Stash Network', desc: 'Have stashes in 3 different cities', emoji: '📦', category: 'business', xp: 40 },
  { id: 'property_value_500k', name: 'Half-Mil in Real Estate', desc: 'Own $500K+ in property value', emoji: '💎', category: 'business', xp: 45 },
  { id: 'property_all_types', name: 'Diversified Holdings', desc: 'Own all 4 types of property', emoji: '🗂️', category: 'business', xp: 60, hidden: true },
  { id: 'property_raided', name: 'Raided!', desc: 'Have a property raided by police', emoji: '🚔', category: 'business', xp: 10 },

  // === CREW EXPANSION (10) ===
  { id: 'first_promotion', name: 'Moving Up', desc: 'Promote a crew member to Soldier', emoji: '⬆️', category: 'crew', xp: 20 },
  { id: 'lieutenant_rank', name: 'Right Hand Man', desc: 'Promote crew to Lieutenant', emoji: '🎖️', category: 'crew', xp: 35 },
  { id: 'underboss_rank', name: 'Underboss', desc: 'Promote crew to Underboss', emoji: '👔', category: 'crew', xp: 50 },
  { id: 'right_hand_rank', name: 'Ride or Die', desc: 'Promote crew to Right-Hand', emoji: '💍', category: 'crew', xp: 75, hidden: true },
  { id: 'betrayed', name: 'Backstabbed', desc: 'Have a crew member betray you', emoji: '🗡️', category: 'crew', xp: 15 },
  { id: 'caught_traitor', name: 'Caught Red Handed', desc: 'Confront a suspicious crew member who was actually a traitor', emoji: '🔍', category: 'crew', xp: 25 },
  { id: 'false_accusation', name: 'Paranoid Boss', desc: 'Confront an innocent crew member', emoji: '😰', category: 'crew', xp: 10 },
  { id: 'max_crew', name: 'Full House', desc: 'Have maximum crew members', emoji: '👥', category: 'crew', xp: 30 },
  { id: 'loyal_crew_all', name: 'Unbreakable Bond', desc: 'Have all crew at 90+ loyalty', emoji: '❤️', category: 'crew', xp: 40, hidden: true },
  { id: 'crew_veteran_365', name: 'Old Guard', desc: 'Have a crew member serve 365+ days', emoji: '🏅', category: 'crew', xp: 35 },

  // === CAMPAIGN / ACTS (12) ===
  { id: 'act_2', name: 'Building the Empire', desc: 'Reach Act 2', emoji: '🏗️', category: 'endgame', xp: 25 },
  { id: 'act_3', name: 'The Empire', desc: 'Reach Act 3', emoji: '👑', category: 'endgame', xp: 50 },
  { id: 'act_4', name: 'The Reckoning', desc: 'Reach Act 4', emoji: '⚡', category: 'endgame', xp: 75 },
  { id: 'act_5', name: 'The Endgame', desc: 'Reach Act 5', emoji: '🏁', category: 'endgame', xp: 100 },
  { id: 'ending_kingpin', name: 'Total Domination', desc: 'Achieve the Kingpin ending', emoji: '👑', category: 'endgame', xp: 200, hidden: true },
  { id: 'ending_escape', name: 'The Great Escape', desc: 'Achieve the Escape ending', emoji: '🏃', category: 'endgame', xp: 150, hidden: true },
  { id: 'ending_straight', name: 'Going Straight', desc: 'Achieve the Going Straight ending', emoji: '🕊️', category: 'endgame', xp: 150, hidden: true },
  { id: 'ending_informant', name: 'Rat', desc: 'Achieve the Informant ending', emoji: '🐀', category: 'endgame', xp: 100, hidden: true },
  { id: 'ending_blaze', name: 'Blaze of Glory', desc: 'Go down fighting', emoji: '🔥', category: 'endgame', xp: 125, hidden: true },
  { id: 'ending_politician', name: 'Mr. Senator', desc: 'Achieve the Politician ending', emoji: '🏛️', category: 'endgame', xp: 175, hidden: true },
  { id: 'ending_martyr', name: 'The Sacrifice', desc: 'Achieve the Martyr ending', emoji: '✝️', category: 'endgame', xp: 200, hidden: true },
  { id: 'ending_deal', name: 'The Art of the Deal', desc: 'Negotiate immunity', emoji: '🤝', category: 'endgame', xp: 150, hidden: true },
  { id: 'game_beaten', name: 'The End...?', desc: 'Complete the campaign and reach an ending', emoji: '🎬', category: 'endgame', xp: 300 },
  { id: 'ng_plus_complete', name: 'Legend Never Dies', desc: 'Complete New Game+', emoji: '♾️', category: 'endgame', xp: 500, hidden: true },

  // === REPUTATION DIMENSIONS (8) ===
  { id: 'rep_feared', name: 'Most Feared', desc: 'Reach Fear level 75+', emoji: '💀', category: 'reputation', xp: 30 },
  { id: 'rep_trusted', name: 'Man of Honor', desc: 'Reach Trust level 75+', emoji: '🤝', category: 'reputation', xp: 30 },
  { id: 'rep_streetcred_max', name: 'Street Legend', desc: 'Reach Street Cred 90+', emoji: '🔥', category: 'reputation', xp: 50 },
  { id: 'rep_public_hero', name: 'Beloved Philanthropist', desc: 'Reach Public Image 50+', emoji: '📺', category: 'reputation', xp: 30 },
  { id: 'rep_heat_max', name: 'Most Wanted', desc: 'Reach Heat Signature 90+', emoji: '🚨', category: 'reputation', xp: 25 },
  { id: 'rep_mythic', name: 'Mythic Status', desc: 'Reach Mythic overall reputation level', emoji: '⭐', category: 'reputation', xp: 75, hidden: true },
  { id: 'rep_despised', name: 'Public Enemy', desc: 'Be Despised in any dimension', emoji: '😤', category: 'reputation', xp: 10 },
  { id: 'rep_balanced', name: 'Renaissance Criminal', desc: 'Have all 5 rep dimensions above 25', emoji: '⚖️', category: 'reputation', xp: 60, hidden: true },

  // === SUPPLY/DEMAND ECONOMY (6) ===
  { id: 'market_crash', name: 'Market Crasher', desc: 'Flood a market so hard prices crash 50%+', emoji: '📉', category: 'trading', xp: 25 },
  { id: 'market_hot', name: 'Hot Market', desc: 'Find a HOT market condition', emoji: '🔥', category: 'trading', xp: 15 },
  { id: 'market_manipulator', name: 'Market Manipulator', desc: 'Buy low and sell high in same city exploiting supply/demand', emoji: '🧮', category: 'trading', xp: 40, hidden: true },
  { id: 'supply_corner', name: 'Cornered the Market', desc: 'Reduce supply below 30 in any city', emoji: '📊', category: 'trading', xp: 30 },
  { id: 'demand_surge', name: 'Demand Surge', desc: 'Create demand above 150 in any city', emoji: '📈', category: 'trading', xp: 30 },
  { id: 'economist', name: 'Street Economist', desc: 'Profit from 5 different supply/demand conditions', emoji: '🎓', category: 'trading', xp: 50, hidden: true },

  // === PROCESSING / LAB (6) ===
  { id: 'first_cook', name: 'First Cook', desc: 'Complete your first processing job', emoji: '⚗️', category: 'processing', xp: 15 },
  { id: 'master_chemist', name: 'Master Chemist', desc: 'Reach Chemistry level 8+', emoji: '🧪', category: 'processing', xp: 50 },
  { id: 'premium_product', name: 'Premium Product', desc: 'Produce Premium quality or better', emoji: '💎', category: 'processing', xp: 30 },
  { id: 'mass_producer', name: 'Mass Producer', desc: 'Complete 20 processing jobs', emoji: '🏭', category: 'processing', xp: 40 },
  { id: 'designer_drug', name: 'Designer Drug', desc: 'Create a Designer Blend', emoji: '✨', category: 'processing', xp: 35, hidden: true },
  { id: 'legendary_batch', name: 'Legendary Batch', desc: 'Produce Legendary quality product', emoji: '👑', category: 'processing', xp: 75, hidden: true },

  // === IMPORT/EXPORT (6) ===
  { id: 'first_import', name: 'First Import', desc: 'Complete your first international shipment', emoji: '📦', category: 'import', xp: 20 },
  { id: 'smuggler', name: 'International Smuggler', desc: 'Connect with 3 international sources', emoji: '🌍', category: 'import', xp: 30 },
  { id: 'global_network', name: 'Global Network', desc: 'Connect with all available sources', emoji: '🌐', category: 'import', xp: 60, hidden: true },
  { id: 'seized_survivor', name: 'Cost of Business', desc: 'Have a shipment seized', emoji: '🚨', category: 'import', xp: 10 },
  { id: 'narco_sub', name: 'Narco Sub Captain', desc: 'Complete a shipment via Narco Sub', emoji: '🔻', category: 'import', xp: 40, hidden: true },
  { id: 'import_baron', name: 'Import Baron', desc: 'Complete 10 international imports', emoji: '📬', category: 'import', xp: 50 },

  // === FACTIONS (8) ===
  { id: 'first_alliance', name: 'Making Friends', desc: 'Form your first faction alliance', emoji: '🤝', category: 'faction', xp: 15 },
  { id: 'war_winner', name: 'War Winner', desc: 'Win a faction war', emoji: '⚔️', category: 'faction', xp: 30 },
  { id: 'faction_absorber', name: 'Hostile Takeover', desc: 'Absorb a faction', emoji: '👑', category: 'faction', xp: 50 },
  { id: 'diplomat', name: 'The Diplomat', desc: 'Have 3 active alliances', emoji: '🕊️', category: 'faction', xp: 40 },
  { id: 'warmonger', name: 'Warmonger', desc: 'Be at war with 3 factions simultaneously', emoji: '🔥', category: 'faction', xp: 35, hidden: true },
  { id: 'peacemaker', name: 'Peacemaker', desc: 'Negotiate peace in a war', emoji: '☮️', category: 'faction', xp: 20 },
  { id: 'absorb_all', name: 'Total Domination', desc: 'Absorb all factions', emoji: '🌍', category: 'faction', xp: 200, hidden: true },
  { id: 'joint_venture', name: 'Business Partners', desc: 'Form a Joint Venture alliance', emoji: '💰', category: 'faction', xp: 45, hidden: true },

  // === POLITICS (8) ===
  { id: 'first_bribe', name: 'Greasing Palms', desc: 'Corrupt your first official', emoji: '💰', category: 'politics', xp: 15 },
  { id: 'first_contact', name: 'Connections', desc: 'Recruit your first contact', emoji: '🤝', category: 'politics', xp: 15 },
  { id: 'corrupt_3', name: 'Network Builder', desc: 'Have 3 corrupt officials', emoji: '🏛️', category: 'politics', xp: 30 },
  { id: 'corrupt_all', name: 'Puppet Master', desc: 'Corrupt all available officials', emoji: '👑', category: 'politics', xp: 100, hidden: true },
  { id: 'contacts_5', name: 'Connected', desc: 'Have 5 active contacts', emoji: '📞', category: 'politics', xp: 40 },
  { id: 'intel_10', name: 'Spymaster', desc: 'Gather 10 intelligence reports', emoji: '🔍', category: 'politics', xp: 25 },
  { id: 'scandal_survivor', name: 'Teflon Don', desc: 'Survive 3 political scandals', emoji: '📰', category: 'politics', xp: 50, hidden: true },
  { id: 'influence_max', name: 'Shadow Government', desc: 'Reach 80+ political influence', emoji: '🏛️', category: 'politics', xp: 75, hidden: true },

  // === MISSIONS (8) ===
  { id: 'first_mission', name: 'Side Hustle', desc: 'Complete your first side mission', emoji: '📋', category: 'missions', xp: 10 },
  { id: 'missions_10', name: 'Mission Runner', desc: 'Complete 10 side missions', emoji: '🎯', category: 'missions', xp: 30 },
  { id: 'missions_25', name: 'Professional', desc: 'Complete 25 side missions', emoji: '⭐', category: 'missions', xp: 60 },
  { id: 'missions_50', name: 'Legendary Operator', desc: 'Complete 50 side missions', emoji: '🏆', category: 'missions', xp: 100, hidden: true },
  { id: 'first_dilemma', name: 'Tough Choices', desc: 'Resolve your first moral dilemma', emoji: '⚖️', category: 'missions', xp: 15 },
  { id: 'dilemmas_5', name: 'Moral Compass', desc: 'Resolve 5 moral dilemmas', emoji: '🧭', category: 'missions', xp: 40 },
  { id: 'heist_success', name: 'Grand Heist', desc: 'Successfully complete a bank job', emoji: '🏦', category: 'missions', xp: 50, hidden: true },
  { id: 'mission_rewards_100k', name: 'Mission Millionaire', desc: 'Earn $100K+ from missions', emoji: '💰', category: 'missions', xp: 40 },
  { id: 'dialogue_master', name: 'Silver Tongue', desc: 'Complete 5 dialogue missions', emoji: '🗣️', category: 'missions', xp: 50 },
  { id: 'dilemmas_10', name: 'Philosopher King', desc: 'Resolve 10 moral dilemmas', emoji: '👑', category: 'missions', xp: 60, hidden: true },
  { id: 'turf_war_won', name: 'War Lord', desc: 'Win a turf war', emoji: '⚔️', category: 'missions', xp: 50, hidden: true },
  { id: 'community_investor', name: 'Robin Hood', desc: 'Complete a community investment mission', emoji: '🏘️', category: 'missions', xp: 30 },
  { id: 'political_player', name: 'Kingmaker', desc: 'Complete an election interference mission', emoji: '🗳️', category: 'missions', xp: 60, hidden: true },
  { id: 'missions_100', name: 'Mission Impossible', desc: 'Complete 100 side missions', emoji: '💎', category: 'missions', xp: 200, hidden: true },
  { id: 'mission_rewards_500k', name: 'Mission Mogul', desc: 'Earn $500K+ from missions', emoji: '🤑', category: 'missions', xp: 80, hidden: true },
  { id: 'all_categories', name: 'Jack of All Trades', desc: 'Complete missions from 8+ categories', emoji: '🎭', category: 'missions', xp: 70 },
  { id: 'saboteur', name: 'Saboteur', desc: 'Complete a sabotage operation', emoji: '💣', category: 'missions', xp: 40 },

  // === NG+ ENDINGS (8) ===
  { id: 'ending_ng_immortal', name: 'The Immortal', desc: 'Achieve the Immortal ending in NG+', emoji: '♾️', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_ghost', name: 'The Ghost', desc: 'Achieve the Ghost ending in NG+', emoji: '👻', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_cartel', name: 'Cartel King', desc: 'Achieve the Cartel King ending in NG+', emoji: '🌎', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_philanthropist', name: 'Heart of Gold', desc: 'Achieve the Philanthropist ending in NG+', emoji: '💝', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_shadow', name: 'Shadow Government', desc: 'Achieve the Shadow Government ending in NG+', emoji: '🏛️', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_warlord', name: 'Total War', desc: 'Achieve the Warlord ending in NG+', emoji: '⚔️', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_chemist', name: 'Breaking Bad', desc: 'Achieve the Chemist ending in NG+', emoji: '⚗️', category: 'endgame', xp: 300, hidden: true },
  { id: 'ending_ng_perfect', name: 'Perfection', desc: 'Achieve the Perfect Run ending in NG+', emoji: '🌟', category: 'endgame', xp: 500, hidden: true },
  { id: 'all_endings', name: 'Seen It All', desc: 'Achieve all 20 endings', emoji: '🎬', category: 'endgame', xp: 1000, hidden: true },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Mafia Operations (10)
  // ============================================================
  { id: 'first_racket', name: 'First Racket', desc: 'Set up your first mafia operation', emoji: '🛡️', category: 'mafia', xp: 25 },
  { id: 'loan_shark_king', name: 'Loan Shark King', desc: 'Have $500K+ in outstanding loans', emoji: '🦈', category: 'mafia', xp: 75 },
  { id: 'casino_royale', name: 'Casino Royale', desc: 'Run an underground casino operation', emoji: '🎰', category: 'mafia', xp: 100 },
  { id: 'arms_dealer_ach', name: 'Arms Dealer', desc: 'Sell $100K+ worth of weapons', emoji: '🔫', category: 'mafia', xp: 75 },
  { id: 'chop_shop_champ', name: 'Chop Shop Champion', desc: 'Strip 50 vehicles in your chop shop', emoji: '🔧', category: 'mafia', xp: 75 },
  { id: 'counterfeit_king', name: 'Counterfeit King', desc: 'Print $1M in counterfeit bills', emoji: '💵', category: 'mafia', xp: 100 },
  { id: 'digital_criminal', name: 'Digital Criminal', desc: 'Earn $100K from cyber crimes', emoji: '💻', category: 'mafia', xp: 75 },
  { id: 'fight_promoter', name: 'Fight Promoter', desc: 'Host 10 underground fight events', emoji: '🥊', category: 'mafia', xp: 50 },
  { id: 'contract_killer', name: 'Contract Killer', desc: 'Complete 5 assassination contracts', emoji: '🎯', category: 'mafia', xp: 100 },
  { id: 'diversified_criminal', name: 'Diversified Criminal', desc: 'Run 5+ different operation types simultaneously', emoji: '🏢', category: 'mafia', xp: 150 },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Heists (8)
  // ============================================================
  { id: 'first_score', name: 'First Score', desc: 'Complete your first heist', emoji: '💰', category: 'heist', xp: 25 },
  { id: 'smash_and_grab', name: 'Smash and Grab', desc: 'Rob a jewelry store', emoji: '💎', category: 'heist', xp: 50 },
  { id: 'bank_robber', name: 'Bank Robber', desc: 'Successfully rob a bank', emoji: '🏦', category: 'heist', xp: 100 },
  { id: 'armored_car_heist', name: 'Armored Car', desc: 'Intercept an armored transport', emoji: '🚛', category: 'heist', xp: 75 },
  { id: 'oceans_eleven', name: "Ocean's Eleven", desc: 'Pull off the casino vault heist', emoji: '🎰', category: 'heist', xp: 200 },
  { id: 'evidence_destroyer', name: 'Evidence Destroyer', desc: 'Raid the evidence room and destroy your case files', emoji: '🗄️', category: 'heist', xp: 150 },
  { id: 'federal_reserve_heist', name: 'Federal Reserve', desc: 'Rob the Federal Reserve (NG+ only)', emoji: '🏛️', category: 'heist', xp: 500, hidden: true },
  { id: 'perfect_heist', name: 'Perfect Heist', desc: 'Complete any heist with zero heat generated', emoji: '🥷', category: 'heist', xp: 150 },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Prison (8)
  // ============================================================
  { id: 'first_bid', name: 'First Bid', desc: 'Survive your first prison sentence', emoji: '⛓️', category: 'prison', xp: 25 },
  { id: 'jailbreak', name: 'Jailbreak', desc: 'Successfully escape from prison', emoji: '🏃', category: 'prison', xp: 150 },
  { id: 'prison_king', name: 'Prison King', desc: 'Reach maximum prison reputation', emoji: '👑', category: 'prison', xp: 100 },
  { id: 'recruited_inside', name: 'Recruited Inside', desc: 'Recruit a crew member while in prison', emoji: '🤝', category: 'prison', xp: 50 },
  { id: 'time_served', name: 'Time Served', desc: 'Complete a full sentence without escape attempts', emoji: '📅', category: 'prison', xp: 75 },
  { id: 'empire_survived', name: 'Empire Survived', desc: 'Empire intact after 365+ days inside', emoji: '🏰', category: 'prison', xp: 200 },
  { id: 'shanked', name: 'Shanked', desc: 'Survive a prison attack', emoji: '🔪', category: 'prison', xp: 25 },
  { id: 'connected_inside', name: 'Connected Inside', desc: 'Ally with all prison factions', emoji: '🤜', category: 'prison', xp: 100 },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Vehicles (8)
  // ============================================================
  { id: 'gearhead', name: 'Gearhead', desc: 'Own 10 vehicles simultaneously', emoji: '🔧', category: 'vehicle', xp: 50 },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Own the fastest car, boat, and plane', emoji: '🏎️', category: 'vehicle', xp: 100 },
  { id: 'fleet_commander', name: 'Fleet Commander', desc: 'Own 20 vehicles simultaneously', emoji: '🚢', category: 'vehicle', xp: 150 },
  { id: 'classic_collection', name: 'Classic Collection', desc: 'Own both exotic cars (Countach + Testarossa)', emoji: '🏆', category: 'vehicle', xp: 75 },
  { id: 'captain_ach', name: 'Captain', desc: 'Own a yacht', emoji: '⛵', category: 'vehicle', xp: 75 },
  { id: 'pilot_license', name: 'Pilot License', desc: 'Own a plane or helicopter', emoji: '✈️', category: 'vehicle', xp: 75 },
  { id: 'sub_commander', name: 'Submarine Commander', desc: 'Own a narco submarine', emoji: '🤿', category: 'vehicle', xp: 200, hidden: true },
  { id: 'ice_cream_man', name: 'Ice Cream Man', desc: 'Own an ice cream truck', emoji: '🍦', category: 'vehicle', xp: 25 },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Regional Bosses (8)
  // ============================================================
  { id: 'boss_killer', name: 'Boss Killer', desc: 'Eliminate your first regional boss', emoji: '💀', category: 'boss', xp: 50 },
  { id: 'kingslayer', name: 'Kingslayer', desc: 'Eliminate 5 regional bosses', emoji: '⚔️', category: 'boss', xp: 150 },
  { id: 'world_conqueror_ach', name: 'World Conqueror', desc: 'Eliminate 10 regional bosses', emoji: '🌍', category: 'boss', xp: 300 },
  { id: 'diplomatic_victory', name: 'Diplomatic Victory', desc: 'Successfully negotiate with 5 bosses', emoji: '🕊️', category: 'boss', xp: 100 },
  { id: 'boss_replacement', name: 'Replacement', desc: 'Install a puppet boss in a district', emoji: '🎭', category: 'boss', xp: 75 },
  { id: 'untouchable_boss', name: 'Untouchable', desc: 'Survive 3 assassination attempts on yourself', emoji: '🛡️', category: 'boss', xp: 100 },
  { id: 'puppet_master', name: 'Puppet Master', desc: 'Control a boss through blackmail', emoji: '🕸️', category: 'boss', xp: 100 },
  { id: 'ghost_boss', name: 'Ghost Boss', desc: 'Take over a district without the boss knowing', emoji: '👻', category: 'boss', xp: 150, hidden: true },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Romance (4)
  // ============================================================
  { id: 'first_date', name: 'First Date', desc: 'Go on your first date', emoji: '❤️', category: 'romance', xp: 15 },
  { id: 'ride_or_die', name: 'Ride or Die', desc: 'Reach partner status with a romance NPC', emoji: '💍', category: 'romance', xp: 100 },
  { id: 'heartbreaker', name: 'Heartbreaker', desc: 'End a romantic relationship', emoji: '💔', category: 'romance', xp: 25 },
  { id: 'family_man', name: 'Family Man', desc: 'Protect your partner through 3 threats', emoji: '🏠', category: 'romance', xp: 75 },

  // ============================================================
  // EXPANSION ACHIEVEMENTS — Weather (4)
  // ============================================================
  { id: 'hurricane_survivor', name: 'Hurricane Survivor', desc: 'Survive a hurricane with all properties intact', emoji: '🌀', category: 'weather', xp: 50 },
  { id: 'storm_profiteer', name: 'Storm Profiteer', desc: 'Earn $100K during post-storm price spike', emoji: '⛈️', category: 'weather', xp: 75 },
  { id: 'weatherman', name: 'Weatherman', desc: 'Predict and prepare for 3 weather events', emoji: '📡', category: 'weather', xp: 50 },
  { id: 'stormbreaker', name: 'Stormbreaker', desc: 'Complete a shipment during a hurricane', emoji: '🚢', category: 'weather', xp: 100 },

  // ============================================================
  // V6 — ENCOUNTER ACHIEVEMENTS (10)
  // ============================================================
  { id: 'first_encounter', name: 'Street Wise', desc: 'Experience your first random encounter', emoji: '🎲', category: 'encounter', xp: 10 },
  { id: 'encounter_veteran', name: 'Encounter Veteran', desc: 'Experience 50 random encounters', emoji: '🎰', category: 'encounter', xp: 50 },
  { id: 'encounter_master', name: 'Seen It All', desc: 'Experience 100 different encounters', emoji: '👁️', category: 'encounter', xp: 100 },
  { id: 'good_samaritan', name: 'Good Samaritan', desc: 'Help 10 people in street encounters', emoji: '😇', category: 'encounter', xp: 50 },
  { id: 'opportunist', name: 'Opportunist', desc: 'Profit from 20 encounters', emoji: '💰', category: 'encounter', xp: 50 },
  { id: 'pet_owner', name: 'Best Friend', desc: 'Adopt a stray dog', emoji: '🐕', category: 'encounter', xp: 25 },
  { id: 'lottery_winner', name: 'Lucky Break', desc: 'Win the big lottery prize', emoji: '🎫', category: 'encounter', xp: 75 },
  { id: 'wildcard', name: 'Wild Card', desc: 'Experience 10 wild card encounters', emoji: '🃏', category: 'encounter', xp: 50 },
  { id: 'crew_counselor', name: 'Crew Counselor', desc: 'Resolve 10 crew personal events', emoji: '🤝', category: 'encounter', xp: 50 },
  { id: 'law_dodger', name: 'Law Dodger', desc: 'Survive 10 law enforcement encounters', emoji: '🚔', category: 'encounter', xp: 50 },

  // ============================================================
  // V6 — NAMED NPC ACHIEVEMENTS (8)
  // ============================================================
  { id: 'first_npc_meet', name: 'New Friend', desc: 'Meet your first named NPC', emoji: '👋', category: 'npc', xp: 10 },
  { id: 'npc_networker', name: 'Networker', desc: 'Meet 10 named NPCs', emoji: '🕸️', category: 'npc', xp: 50 },
  { id: 'npc_all_met', name: 'Who\'s Who', desc: 'Meet all 30 named NPCs', emoji: '📇', category: 'npc', xp: 150 },
  { id: 'npc_story_complete', name: 'Story Teller', desc: 'Complete an NPC\'s full story arc', emoji: '📖', category: 'npc', xp: 50 },
  { id: 'npc_5_stories', name: 'Legend Collector', desc: 'Complete 5 NPC story arcs', emoji: '📚', category: 'npc', xp: 100 },
  { id: 'npc_dr_rosa', name: 'House Call', desc: 'Recruit Dr. Rosa as your personal doctor', emoji: '🏥', category: 'npc', xp: 75 },
  { id: 'npc_judge', name: 'Above the Law', desc: 'Corrupt Judge Hawkins', emoji: '⚖️', category: 'npc', xp: 100 },
  { id: 'npc_betrayed', name: 'Betrayed', desc: 'Have an NPC turn against you', emoji: '🗡️', category: 'npc', xp: 25 },

  // ============================================================
  // V6 — BUSINESS ACHIEVEMENTS (10)
  // ============================================================
  { id: 'first_business', name: 'Entrepreneur', desc: 'Purchase your first business', emoji: '🏢', category: 'business_v2', xp: 25 },
  { id: 'business_empire', name: 'Business Empire', desc: 'Own 5 different businesses', emoji: '🏙️', category: 'business_v2', xp: 75 },
  { id: 'business_mogul', name: 'Mogul', desc: 'Own 10 different businesses', emoji: '👑', category: 'business_v2', xp: 150 },
  { id: 'music_mogul', name: 'Music Mogul', desc: 'Have a signed artist blow up', emoji: '🎵', category: 'business_v2', xp: 75 },
  { id: 'laundromat_king', name: 'Clean Money', desc: 'Run 5 laundromats simultaneously', emoji: '🧺', category: 'business_v2', xp: 50 },
  { id: 'strip_club_owner', name: 'Nightlife King', desc: 'Own a strip club', emoji: '💃', category: 'business_v2', xp: 50 },
  { id: 'pharmacy_baron', name: 'Prescription Kingpin', desc: 'Earn $100K from pharmacy operations', emoji: '💊', category: 'business_v2', xp: 75 },
  { id: 'business_synergy', name: 'Synergy', desc: 'Activate a business synergy combo', emoji: '🔗', category: 'business_v2', xp: 50 },
  { id: 'million_biz_income', name: 'Cash Cow', desc: 'Earn $1M total from businesses', emoji: '🐄', category: 'business_v2', xp: 100 },
  { id: 'construction_king', name: 'Builder', desc: 'Use construction company to build hidden infrastructure', emoji: '🏗️', category: 'business_v2', xp: 50 },

  // ============================================================
  // V6 — MISSION CHAIN ACHIEVEMENTS (10)
  // ============================================================
  { id: 'first_chain', name: 'Chain Starter', desc: 'Begin your first side mission chain', emoji: '⛓️', category: 'missions_v2', xp: 10 },
  { id: 'chain_complete', name: 'Chain Complete', desc: 'Complete a full side mission chain', emoji: '✅', category: 'missions_v2', xp: 50 },
  { id: 'chain_master', name: 'Mission Master', desc: 'Complete 10 side mission chains', emoji: '🏅', category: 'missions_v2', xp: 100 },
  { id: 'super_bowl_king', name: 'Super Bowl King', desc: 'Earn $1M+ during the Super Bowl event', emoji: '🏈', category: 'missions_v2', xp: 150 },
  { id: 'blue_sky', name: 'Blue Sky', desc: 'Acquire the legendary drug formula', emoji: '⚗️', category: 'missions_v2', xp: 100 },
  { id: 'tunnel_network', name: 'Underground', desc: 'Build a tunnel network between properties', emoji: '⛏️', category: 'missions_v2', xp: 75 },
  { id: 'everglades_base', name: 'Swamp Thing', desc: 'Establish an Everglades operation', emoji: '🐊', category: 'missions_v2', xp: 75 },
  { id: 'body_farm_found', name: 'No Evidence', desc: 'Discover the body farm', emoji: '🐷', category: 'missions_v2', xp: 50 },
  { id: 'poker_winner', name: 'High Roller', desc: 'Win the underground poker tournament', emoji: '🃏', category: 'missions_v2', xp: 75 },
  { id: 'final_stash_found', name: 'Treasure Hunter', desc: 'Find the legendary 1980s stash', emoji: '💎', category: 'missions_v2', xp: 100 },

  // ============================================================
  // V6 — PHONE ACHIEVEMENTS (4)
  // ============================================================
  { id: 'first_message', name: 'New Phone Who Dis', desc: 'Receive your first phone message', emoji: '📱', category: 'phone', xp: 10 },
  { id: 'spam_collector', name: 'Spam Collector', desc: 'Receive 20 spam messages', emoji: '📬', category: 'phone', xp: 25 },
  { id: 'burner_expert', name: 'Burner Expert', desc: 'Switch burner phones 5 times', emoji: '🔥', category: 'phone', xp: 50 },
  { id: 'wiretapped', name: 'Wiretapped', desc: 'Have your phone intercepted by police', emoji: '🎙️', category: 'phone', xp: 25 },

  // ============================================================
  // V6 — PROCEDURAL MISSION ACHIEVEMENTS (8)
  // ============================================================
  { id: 'first_procedural', name: 'For Hire', desc: 'Complete your first procedural mission', emoji: '📋', category: 'procedural', xp: 10 },
  { id: 'proc_10', name: 'Mercenary', desc: 'Complete 10 procedural missions', emoji: '💼', category: 'procedural', xp: 50 },
  { id: 'proc_50', name: 'Professional', desc: 'Complete 50 procedural missions', emoji: '⭐', category: 'procedural', xp: 100 },
  { id: 'proc_no_fail', name: 'Perfect Record', desc: 'Complete 10 missions in a row without failure', emoji: '🏆', category: 'procedural', xp: 75 },
  { id: 'proc_complication', name: 'Complicated', desc: 'Complete a mission with 2 complications', emoji: '😰', category: 'procedural', xp: 50 },
  { id: 'proc_rescue', name: 'Rescuer', desc: 'Complete a rescue mission', emoji: '🆘', category: 'procedural', xp: 25 },
  { id: 'proc_espionage', name: 'Spy Master', desc: 'Complete 5 espionage missions', emoji: '🕵️', category: 'procedural', xp: 50 },
  { id: 'proc_negotiator', name: 'Negotiator', desc: 'Successfully broker 3 faction deals', emoji: '🤝', category: 'procedural', xp: 50 },
];

// ============================================================
// ACHIEVEMENT CHECKING
// ============================================================
function checkAchievements(state) {
  if (!state.achievements) state.achievements = [];
  if (!state.achievementStats) state.achievementStats = {};
  const earned = [];
  const stats = state.achievementStats;
  const total = state.cash + state.bank;

  for (const ach of ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue;
    let unlocked = false;

    switch (ach.id) {
      // MONEY
      case 'first_dollar': unlocked = state.drugsSold > 0; break;
      case 'pocket_change': unlocked = state.cash >= 1000; break;
      case 'five_figures': unlocked = state.cash >= 10000; break;
      case 'six_figures': unlocked = state.cash >= 100000; break;
      case 'millionaire': unlocked = total >= 1000000; break;
      case 'multi_millionaire': unlocked = total >= 5000000; break;
      case 'debt_free': unlocked = state.debt === 0; break;
      case 'banker': unlocked = state.bank >= 50000; break;
      case 'interest_king': unlocked = (stats.bankInterestEarned || 0) >= 10000; break;
      case 'big_spender': unlocked = (stats.largestPurchase || 0) >= 100000; break;
      case 'penny_pincher': unlocked = (stats.cheapestBuy || Infinity) < 50; break;
      case 'profit_margin': unlocked = (stats.bestProfitRatio || 0) >= 10; break;
      case 'price_crash': unlocked = (stats.boughtDuringCrash || 0) > 0; break;
      case 'price_spike': unlocked = (stats.soldDuringSpike || 0) > 0; break;
      case 'quick_flip': unlocked = (stats.sameDayFlips || 0) > 0; break;
      case 'stash_value_50k': unlocked = (stats.stashValue || 0) >= 50000; break;
      case 'no_debt_early': unlocked = state.debt === 0 && state.day <= 15; break;
      case 'loan_shark_max': unlocked = state.debt >= 50000; break;
      case 'broke': unlocked = state.cash === 0 && Object.keys(state.inventory).length === 0; break;
      case 'cash_hoarder': unlocked = state.cash >= 500000; break;

      // TRADING
      case 'first_buy': unlocked = state.drugsBought > 0; break;
      case 'first_sale': unlocked = state.drugsSold > 0; break;
      case 'bulk_buyer': unlocked = (stats.largestBuyQty || 0) >= 50; break;
      case 'bulk_seller': unlocked = (stats.largestSellQty || 0) >= 50; break;
      case 'diversified': unlocked = Object.keys(state.inventory).filter(k => state.inventory[k] > 0).length >= 5; break;
      case 'specialist_cocaine': unlocked = (stats.drugsSoldById?.cocaine || 0) >= 100; break;
      case 'specialist_heroin': unlocked = (stats.drugsSoldById?.heroin || 0) >= 100; break;
      case 'specialist_weed': unlocked = (stats.drugsSoldById?.weed || 0) >= 200; break;
      case 'specialist_meth': unlocked = (stats.drugsSoldById?.meth || 0) >= 100; break;
      case 'specialist_crack': unlocked = (stats.drugsSoldById?.crack || 0) >= 100; break;
      case 'specialist_ecstasy': unlocked = (stats.drugsSoldById?.ecstasy || 0) >= 100; break;
      case 'total_100_sold': unlocked = state.drugsSold >= 100; break;
      case 'total_500_sold': unlocked = state.drugsSold >= 500; break;
      case 'total_1000_sold': unlocked = state.drugsSold >= 1000; break;
      case 'full_inventory': {
        let count = 0;
        for (const k in state.inventory) count += state.inventory[k];
        unlocked = count >= getMaxInventory(state);
        break;
      }
      case 'empty_shelf': unlocked = (stats.cleanSweeps || 0) > 0; break;
      case 'all_drugs_traded': unlocked = (stats.drugsTraded?.size || stats.drugsTraded?.length || 0) >= 12; break;
      case 'haggler': unlocked = (stats.citiesBoughtIn?.size || stats.citiesBoughtIn?.length || 0) >= 10; break;
      case 'market_mover': unlocked = (stats.totalTransactions || 0) >= 50; break;
      case 'premium_dealer': unlocked = (stats.premiumOnlyStreak || 0) >= 10; break;

      // TRAVEL
      case 'first_flight': unlocked = state.citiesVisited.length >= 2; break;
      case 'globe_trotter': unlocked = state.citiesVisited.length >= 10; break;
      case 'world_tour': unlocked = state.citiesVisited.length >= 21; break;
      case 'americas_tour': unlocked = ['miami', 'bogota', 'new_york', 'medellin', 'los_angeles', 'rio', 'mexico_city'].every(c => state.citiesVisited.includes(c)); break;
      case 'europe_tour': unlocked = ['amsterdam', 'london', 'marseille', 'moscow', 'istanbul'].every(c => state.citiesVisited.includes(c)); break;
      case 'asia_tour': unlocked = ['bangkok', 'hong_kong', 'tokyo', 'kabul', 'mumbai'].every(c => state.citiesVisited.includes(c)); break;
      case 'frequent_flyer': unlocked = (stats.totalTravels || 0) >= 30; break;
      case 'jet_setter': unlocked = (stats.flightsTaken || 0) >= 10; break;
      case 'road_warrior': unlocked = (stats.carTravels || 0) >= 15; break;
      case 'speed_runner': unlocked = (stats.citiesIn5Days || 0) >= 5; break;
      case 'home_body': unlocked = (stats.consecutiveMiami || 0) >= 10; break;
      case 'danger_seeker': {
        const dangerVisited = state.citiesVisited.some(c => {
          const loc = LOCATIONS.find(l => l.id === c);
          return loc && loc.dangerLevel >= 5;
        });
        unlocked = dangerVisited;
        break;
      }
      case 'safe_travels': unlocked = (stats.safeTravelStreak || 0) >= 10; break;
      case 'smuggler_route': unlocked = (stats.maxTravelInventory || 0) >= 80; break;
      case 'intercontinental': unlocked = (stats.regionsVisited?.size || stats.regionsVisited?.length || 0) >= 3; break;

      // COMBAT
      case 'first_blood': unlocked = (stats.combatsWon || 0) >= 1; break;
      case 'gang_buster': unlocked = (stats.gangFightsWon || 0) >= 5; break;
      case 'cop_killer': unlocked = (state.copsKilled || 0) > 0; break;
      case 'dea_survivor': unlocked = (stats.deaRaidsSurvived || 0) > 0; break;
      case 'body_count_10': unlocked = state.peopleKilled >= 10; break;
      case 'body_count_50': unlocked = state.peopleKilled >= 50; break;
      case 'pacifist': unlocked = state.gameOver && state.peopleKilled === 0; break;
      case 'escape_artist': unlocked = (stats.successfulEscapes || 0) >= 5; break;
      case 'flawless_victory': unlocked = (stats.flawlessWins || 0) > 0; break;
      case 'near_death': unlocked = (stats.lowestHealth || 100) <= 5 && state.health > 0; break;
      case 'weapon_collector': unlocked = state.weapons.length >= 3; break;
      case 'bribe_master': unlocked = (stats.bribesPaid || 0) >= 3; break;
      case 'surrender_monkey': unlocked = (stats.surrenders || 0) > 0; break;
      case 'ten_combat_wins': unlocked = (stats.combatsWon || 0) >= 10; break;
      case 'rampage': unlocked = (stats.combatWinStreak || 0) >= 3; break;

      // TERRITORY
      case 'first_turf': unlocked = getControlledTerritories(state).length >= 1; break;
      case 'turf_war_3': unlocked = getControlledTerritories(state).length >= 3; break;
      case 'turf_war_5': unlocked = getControlledTerritories(state).length >= 5; break;
      case 'turf_war_10': unlocked = getControlledTerritories(state).length >= 10; break;
      case 'turf_war_all': unlocked = getControlledTerritories(state).length >= 21; break;
      case 'take_medellin': unlocked = isTerritory(state, 'medellin'); break;
      case 'take_tokyo': unlocked = isTerritory(state, 'tokyo'); break;
      case 'take_moscow': unlocked = isTerritory(state, 'moscow'); break;
      case 'americas_domination': unlocked = ['miami', 'bogota', 'new_york', 'medellin', 'los_angeles', 'rio', 'mexico_city'].every(c => isTerritory(state, c)); break;
      case 'territory_income': unlocked = (stats.totalTerritoryIncome || 0) >= 10000; break;

      // CREW
      case 'first_hire': unlocked = state.henchmen.length >= 1; break;
      case 'full_crew': unlocked = state.henchmen.length >= 5; break;
      case 'army': unlocked = state.henchmen.length >= 8; break;
      case 'loyal_crew': unlocked = state.henchmen.length >= 2 && state.henchmen.every(h => h.loyalty >= 80); break;
      case 'crew_medic': unlocked = (stats.crewHealed || 0) > 0; break;
      case 'crew_lost': unlocked = (stats.crewInjured || 0) > 0; break;
      case 'hired_lawyer': unlocked = state.henchmen.some(h => h.type === 'lawyer'); break;
      case 'hired_fall_guy': unlocked = state.henchmen.some(h => h.type === 'fall_guy'); break;
      case 'all_types': {
        const types = new Set(state.henchmen.map(h => h.type));
        unlocked = types.size >= HENCHMEN_TYPES.length;
        break;
      }
      case 'fired_crew': unlocked = (stats.crewFired || 0) > 0; break;

      // LEGAL
      case 'first_arrest': unlocked = (state.investigation?.timesArrested || 0) > 0; break;
      case 'not_guilty': unlocked = (stats.notGuiltyVerdicts || 0) > 0; break;
      case 'guilty': unlocked = (stats.guiltyVerdicts || 0) > 0; break;
      case 'fall_guy_used': unlocked = (stats.fallGuysUsed || 0) > 0; break;
      case 'paid_off_judge': unlocked = (stats.contactsPaid?.includes?.('corrupt_judge')); break;
      case 'turned_rat': unlocked = (stats.contactsPaid?.includes?.('fbi_deal')); break;
      case 'clean_record': unlocked = state.gameOver && (state.investigation?.timesArrested || 0) === 0; break;
      case 'jailbird': unlocked = (stats.totalPrisonDays || 0) >= 20; break;
      case 'investigation_5': unlocked = (state.investigation?.level || 0) >= 5; break;
      case 'beat_the_system': unlocked = (stats.notGuiltyVerdicts || 0) >= 3; break;

      // REPUTATION & MISC
      case 'rep_50': unlocked = state.reputation >= 50; break;
      case 'rep_100': unlocked = state.reputation >= 100; break;
      case 'rep_negative': unlocked = state.reputation <= -50; break;
      case 'heat_max': unlocked = state.heat >= 100; break;
      case 'heat_zero': unlocked = state.heat === 0 && state.reputation >= 50; break;
      case 'survived': unlocked = state.day > GAME_CONFIG.totalDays && !state.gameOver; break;
      case 'speedrun': unlocked = state.cash >= 100000 && state.day <= 15; break;
      case 'high_score': unlocked = (stats.newHighScore || false); break;
      case 'day_one': unlocked = true; break; // always unlocked
      case 'hospital_visit': unlocked = (stats.hospitalVisits || 0) > 0; break;
      case 'weapon_upgrade': unlocked = state.weapons.some(w => w !== 'fists'); break;
      case 'best_weapon': unlocked = state.weapons.includes('rpg') || state.weapons.includes('minigun'); break;
      case 'found_stash': unlocked = (stats.stashesFound || 0) > 0; break;
      case 'mugged': unlocked = (stats.timesMugged || 0) > 0; break;
      case 'comeback': unlocked = (stats.comebackAchieved || false); break;

      // LEVEL MILESTONES
      case 'level_5': unlocked = getKingpinLevel(state.xp || 0).level >= 5; break;
      case 'level_10': unlocked = getKingpinLevel(state.xp || 0).level >= 10; break;
      case 'level_15': unlocked = getKingpinLevel(state.xp || 0).level >= 15; break;
      case 'max_level': unlocked = getKingpinLevel(state.xp || 0).level >= KINGPIN_LEVELS[KINGPIN_LEVELS.length - 1].level; break;
      case 'level_up_5_times': unlocked = (stats.levelUps || 0) >= 5; break;
      // Distribution achievements
      case 'dist_first': unlocked = Object.keys(state.distribution || {}).length >= 1; break;
      case 'dist_network': unlocked = Object.values(state.distribution || {}).filter(d => d.active).length >= 3; break;
      case 'dist_big_day': unlocked = Object.values(state.distribution || {}).some(d => d.revenue && d.revenue.today >= 50000); break;
      case 'dist_empire': unlocked = Object.values(state.distribution || {}).some(d => d.tier >= 3); break;
      case 'dist_million': unlocked = (state.stats && state.stats.totalDistributionRevenue >= 1000000); break;

      // SKILL TREE
      case 'first_skill': unlocked = getTotalSkillRanks(state) >= 1; break;
      case 'skills_5': unlocked = getTotalSkillRanks(state) >= 5; break;
      case 'skills_15': unlocked = getTotalSkillRanks(state) >= 15; break;
      case 'skills_30': unlocked = getTotalSkillRanks(state) >= 30; break;
      case 'tier3_skill': unlocked = Object.entries(state.skills || {}).some(([id]) => { const s = findSkillById(id); return s && s.tier === 3 && (state.skills[id] || 0) > 0; }); break;
      case 'travel_tree_complete': unlocked = typeof SKILL_TREES !== 'undefined' && SKILL_TREES.travelling.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank); break;
      case 'power_tree_complete': unlocked = typeof SKILL_TREES !== 'undefined' && SKILL_TREES.power.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank); break;
      case 'influence_tree_complete': unlocked = typeof SKILL_TREES !== 'undefined' && SKILL_TREES.influence.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank); break;
      case 'control_tree_complete': unlocked = typeof SKILL_TREES !== 'undefined' && SKILL_TREES.control.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank); break;
      case 'all_trees_complete': unlocked = typeof SKILL_TREES !== 'undefined' && Object.values(SKILL_TREES).every(tree => tree.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank)); break;
      case 'kingmaker_unlocked': unlocked = (state.skills?.kingmaker || 0) > 0; break;
      case 'bulletproof_unlocked': unlocked = (state.skills?.bulletproof || 0) > 0; break;
      case 'tunnel_unlocked': unlocked = (state.skills?.tunnel_network || 0) > 0; break;
      case 'puppet_master_unlocked': unlocked = (state.skills?.puppet_master || 0) > 0; break;
      case 'army_of_one_unlocked': unlocked = (state.skills?.army_of_one || 0) > 0; break;

      // DIALOGUE & SPEECH
      case 'first_dialogue': unlocked = (stats.dialoguesCompleted || 0) >= 1; break;
      case 'dialogue_10': unlocked = (stats.dialoguesCompleted || 0) >= 10; break;
      case 'dialogue_50': unlocked = (stats.dialoguesCompleted || 0) >= 50; break;
      case 'speech_20': unlocked = (state.speechSkill || 0) >= 20; break;
      case 'speech_50': unlocked = (state.speechSkill || 0) >= 50; break;
      case 'speech_80': unlocked = (state.speechSkill || 0) >= 80; break;
      case 'speech_100': unlocked = (state.speechSkill || 0) >= 100; break;
      case 'passed_speech_check': unlocked = (stats.speechChecksPassed || 0) >= 1; break;
      case 'failed_speech_check': unlocked = (stats.speechChecksFailed || 0) >= 1; break;
      case 'bribed_cop': unlocked = (stats.copsBribed || 0) >= 1; break;
      case 'cia_contact': unlocked = hasBuff(state, 'cia'); break;
      case 'talk_to_kingpin': unlocked = (stats.kingpinTalks || 0) >= 1; break;
      case 'all_npcs_met': unlocked = (stats.npcsMetSet?.length || 0) >= NPC_POOL.length; break;
      case 'cartel_partnership': unlocked = hasBuff(state, 'cartel_partner'); break;
      case 'hacker_hired': unlocked = (stats.hackersUsed || 0) >= 1; break;

      // WEAPONS
      case 'pistol_owner': unlocked = state.weapons.some(w => { const wp = WEAPONS.find(x => x.id === w); return wp && wp.tier === 'pistol'; }); break;
      case 'smg_owner': unlocked = state.weapons.some(w => { const wp = WEAPONS.find(x => x.id === w); return wp && wp.tier === 'smg'; }); break;
      case 'rifle_owner': unlocked = state.weapons.some(w => { const wp = WEAPONS.find(x => x.id === w); return wp && wp.tier === 'rifle'; }); break;
      case 'heavy_owner': unlocked = state.weapons.some(w => { const wp = WEAPONS.find(x => x.id === w); return wp && wp.tier === 'heavy'; }); break;
      case 'legendary_owner': unlocked = state.weapons.some(w => { const wp = WEAPONS.find(x => x.id === w); return wp && wp.tier === 'legendary'; }); break;
      case 'weapons_5': unlocked = state.weapons.length >= 5; break;
      case 'weapons_10': unlocked = state.weapons.length >= 10; break;
      case 'weapons_all': unlocked = state.weapons.length >= WEAPONS.length; break;
      case 'rpg_owner': unlocked = state.weapons.includes('rpg'); break;
      case 'minigun_owner': unlocked = state.weapons.includes('minigun'); break;
      case 'scarface_weapon': unlocked = state.weapons.includes('scarface_friend'); break;
      case 'gold_weapons': unlocked = state.weapons.includes('gold_deagle') && state.weapons.includes('gold_ak'); break;
      case 'melee_only_win': unlocked = (stats.meleeOnlyWins || 0) > 0; break;
      case 'one_shot_kill': unlocked = (stats.oneShotKills || 0) > 0; break;
      case 'spent_100k_weapons': unlocked = (state.stats?.totalSpentOnWeapons || 0) >= 100000; break;

      // TRANSPORT
      case 'narco_sub': unlocked = (stats.transportUsed?.narco_sub || 0) > 0; break;
      case 'yacht_life': unlocked = (stats.transportUsed?.yacht || 0) > 0; break;
      case 'cartel_plane_used': unlocked = (stats.transportUsed?.cartel_plane || 0) > 0; break;
      case 'convoy_used': unlocked = (stats.transportUsed?.military_convoy || 0) > 0; break;
      case 'armored_truck_used': unlocked = (stats.transportUsed?.armored_truck || 0) > 0; break;
      case 'motorcycle_rider': unlocked = (stats.transportUsed?.motorcycle || 0) >= 10; break;
      case 'all_transport': unlocked = stats.transportUsed && Object.keys(TRANSPORT).every(t => (stats.transportUsed[t] || 0) > 0); break;
      case 'semi_truck_used': unlocked = (stats.transportUsed?.semi_truck || 0) > 0; break;
      case 'go_fast_used': unlocked = (stats.transportUsed?.go_fast_boat || 0) > 0; break;
      case 'budget_traveler': unlocked = (stats.budgetTravelStreak || 0) >= 20; break;

      // BUSINESS
      case 'first_business': unlocked = (state.frontBusinesses || []).length >= 1; break;
      case 'business_3': unlocked = (state.frontBusinesses || []).length >= 3; break;
      case 'business_all': unlocked = (state.frontBusinesses || []).length >= FRONT_BUSINESSES.length; break;
      case 'laundered_100k': unlocked = (state.stats?.totalLaunderedMoney || 0) >= 100000; break;
      case 'laundered_1m': unlocked = (state.stats?.totalLaunderedMoney || 0) >= 1000000; break;
      case 'shell_corp_owner': unlocked = (state.frontBusinesses || []).some(b => b.id === 'shell_corp'); break;
      case 'real_estate_owner': unlocked = (state.frontBusinesses || []).some(b => b.id === 'real_estate'); break;
      case 'nightclub_owner': unlocked = (state.frontBusinesses || []).some(b => b.id === 'nightclub'); break;
      case 'biz_income_50k': unlocked = (state.frontBusinesses || []).reduce((s, b) => s + (b.totalIncome || 0), 0) >= 50000; break;
      case 'all_laundering': unlocked = false; break; // Complex, tracked separately

      // HIDDEN/SECRET
      case 'secret_millionaire_day1': unlocked = total >= 1000000 && state.day <= 30; break;
      case 'secret_no_travel': unlocked = state.cash >= 50000 && state.citiesVisited.length === 1 && state.citiesVisited[0] === 'miami'; break;
      case 'secret_all_drugs_inventory': unlocked = DRUGS.every(d => (state.inventory[d.id] || 0) > 0); break;
      case 'secret_zero_heat_100_rep': unlocked = state.heat === 0 && state.reputation >= 100 && total >= 1000000; break;
      case 'secret_survive_3_arrests': unlocked = (state.investigation?.timesArrested || 0) >= 3 && (stats.guiltyVerdicts || 0) === 0; break;
      case 'secret_kill_100': unlocked = state.peopleKilled >= 100; break;
      case 'secret_debt_100k': unlocked = state.debt >= 100000; break;
      case 'secret_buy_sell_same_drug': unlocked = (stats.sameCityArbitrage || 0) > 0; break;
      case 'secret_10_territories': unlocked = getControlledTerritories(state).length >= 10 && state.henchmen.length === 0; break;
      case 'secret_all_continents': unlocked = (stats.regionsVisited?.length || 0) >= 4; break;
      case 'secret_survive_dea_3': unlocked = (stats.deaRaidsSurvived || 0) >= 3; break;
      case 'secret_day_1000': unlocked = state.day >= 1000; break;
      case 'secret_day_5000': unlocked = state.day >= 5000; break;
      case 'secret_10m_net_worth': { const nw = state.cash + state.bank - state.debt; unlocked = nw >= 10000000; break; }
      case 'secret_100m_net_worth': { const nw2 = state.cash + state.bank - state.debt; unlocked = nw2 >= 100000000; break; }
      case 'secret_billion': { const nw3 = state.cash + state.bank - state.debt; unlocked = nw3 >= 1000000000; break; }
      case 'secret_full_court': unlocked = state.courtCase && (state.courtCase.contactsUsed || []).length >= 6; break;
      case 'secret_solo_territory': unlocked = (stats.soloTerritoryTakes || 0) > 0; break;
      case 'secret_buy_all_businesses': unlocked = (state.frontBusinesses || []).length >= FRONT_BUSINESSES.length; break;
      case 'secret_10_buffs': unlocked = (state.activeBuffs || []).length >= 5; break;
      case 'secret_max_inventory': unlocked = getMaxInventory(state) >= 500; break;
      case 'secret_cocaine_1000': unlocked = (stats.drugsSoldById?.cocaine || 0) >= 1000; break;
      case 'secret_weed_5000': unlocked = (stats.drugsSoldById?.weed || 0) >= 5000; break;
      case 'secret_day_100_no_kill': unlocked = state.day >= 100 && state.peopleKilled === 0; break;
      case 'secret_crew_10': unlocked = state.henchmen.length >= 10; break;
      case 'secret_all_achievements': unlocked = state.achievements.length >= ACHIEVEMENTS.length - 1; break;
      case 'secret_5_dist_locations': unlocked = Object.values(state.distribution || {}).filter(d => d.active).length >= 5; break;
      case 'secret_saved_by_bulletproof': unlocked = (stats.bulletproofSaves || 0) > 0; break;
      case 'secret_speech_resolved': unlocked = (stats.speechResolutions || 0) >= 10; break;
      case 'secret_lost_everything': unlocked = (stats.lostEverything || false) && total >= 100000; break;

      // BUFF ACHIEVEMENTS
      case 'first_buff': unlocked = (state.activeBuffs || []).length >= 1; break;
      case 'cartel_connection': unlocked = hasBuff(state, 'cartel_prices') || hasBuff(state, 'cartel_partner'); break;
      case 'cia_protected': unlocked = hasBuff(state, 'cia'); break;
      case 'cursed': unlocked = hasBuff(state, 'bad_luck'); break;
      case 'lucky_charm': unlocked = hasBuff(state, 'luck'); break;
      case 'sell_boosted': unlocked = hasBuff(state, 'sell_boost'); break;
      case 'media_controlled': unlocked = hasBuff(state, 'media_control'); break;
      case 'double_agent_active': unlocked = hasBuff(state, 'double_agent'); break;
      case 'heat_immune': unlocked = hasBuff(state, 'heat_immunity'); break;
      case 'transport_discounted': unlocked = (state.transportCostMultiplier || 1) < 1; break;

      // ENDGAME
      case 'end_rich': unlocked = state.gameOver && total >= 5000000; break;
      case 'end_empire': unlocked = state.gameOver && getControlledTerritories(state).length >= 10 && total >= 1000000; break;
      case 'end_clean': unlocked = state.gameOver && state.heat === 0 && (state.investigation?.points || 0) === 0; break;
      case 'end_feared': unlocked = state.gameOver && state.reputation >= 100 && state.peopleKilled >= 50; break;
      case 'end_maxed': unlocked = state.gameOver && getKingpinLevel(state.xp || 0).level >= 20; break;
      case 'end_pacifist_rich': unlocked = state.gameOver && total >= 1000000 && state.peopleKilled === 0; break;
      case 'end_debt_free_rich': unlocked = state.gameOver && state.debt === 0 && total >= 500000; break;
      case 'end_world_domination': unlocked = state.gameOver && getControlledTerritories(state).length >= 21 && (state.frontBusinesses || []).length >= FRONT_BUSINESSES.length; break;
      case 'end_skills_maxed': unlocked = state.gameOver && typeof SKILL_TREES !== 'undefined' && Object.values(SKILL_TREES).every(tree => tree.skills.every(s => (state.skills?.[s.id] || 0) >= s.maxRank)); break;
      case 'end_speed': unlocked = total >= 1000000 && state.day <= 50; break;

      // === NEW SYSTEM ACHIEVEMENTS ===
      // Character selection
      case 'char_dropout': unlocked = state.characterId === 'dropout'; break;
      case 'char_corner_kid': unlocked = state.characterId === 'corner_kid'; break;
      case 'char_excon': unlocked = state.characterId === 'excon'; break;
      case 'char_hustler': unlocked = state.characterId === 'hustler'; break;
      case 'char_connected': unlocked = state.characterId === 'connected_kid'; break;
      case 'char_cleanskin': unlocked = state.characterId === 'cleanskin'; break;
      case 'char_veteran': unlocked = state.characterId === 'veteran'; break;
      case 'char_immigrant': unlocked = state.characterId === 'immigrant'; break;

      // Properties
      case 'first_property': unlocked = typeof getTotalPropertyCount === 'function' && getTotalPropertyCount(state) >= 1; break;
      case 'properties_3': unlocked = typeof getTotalPropertyCount === 'function' && getTotalPropertyCount(state) >= 3; break;
      case 'properties_5': unlocked = typeof getTotalPropertyCount === 'function' && getTotalPropertyCount(state) >= 5; break;
      case 'tier3_property': {
        let hasT3 = false;
        for (const locProps of Object.values(state.properties || {})) {
          if (Array.isArray(locProps) && locProps.some(p => p.tier >= 3)) { hasT3 = true; break; }
        }
        unlocked = hasT3; break;
      }
      case 'penthouse': {
        let hasPent = false;
        for (const locProps of Object.values(state.properties || {})) {
          if (Array.isArray(locProps) && locProps.some(p => p.typeId === 'apartment' && p.tier >= 3)) { hasPent = true; break; }
        }
        unlocked = hasPent; break;
      }
      case 'lab_complex': {
        let hasLab = false;
        for (const locProps of Object.values(state.properties || {})) {
          if (Array.isArray(locProps) && locProps.some(p => p.typeId === 'industrial' && p.tier >= 3)) { hasLab = true; break; }
        }
        unlocked = hasLab; break;
      }
      case 'stash_3_cities': {
        const stashCities = Object.keys(state.stashes || {}).filter(loc => {
          const s = state.stashes[loc];
          return s && Object.values(s).some(v => v > 0);
        });
        unlocked = stashCities.length >= 3; break;
      }
      case 'property_value_500k': unlocked = typeof getTotalPropertyValue === 'function' && getTotalPropertyValue(state) >= 500000; break;
      case 'property_all_types': {
        const ownedTypes = new Set();
        for (const locProps of Object.values(state.properties || {})) {
          if (Array.isArray(locProps)) locProps.forEach(p => ownedTypes.add(p.typeId));
        }
        unlocked = ownedTypes.size >= 4; break;
      }
      case 'property_raided': unlocked = (stats.propertiesRaided || 0) > 0; break;

      // Crew expansion
      case 'first_promotion': unlocked = state.henchmen.some(h => (h.rank || 0) >= 1); break;
      case 'lieutenant_rank': unlocked = state.henchmen.some(h => (h.rank || 0) >= 2); break;
      case 'underboss_rank': unlocked = state.henchmen.some(h => (h.rank || 0) >= 3); break;
      case 'right_hand_rank': unlocked = state.henchmen.some(h => (h.rank || 0) >= 4); break;
      case 'betrayed': unlocked = (stats.betrayals || 0) > 0; break;
      case 'caught_traitor': unlocked = (stats.traitorsCaught || 0) > 0; break;
      case 'false_accusation': unlocked = (stats.falseAccusations || 0) > 0; break;
      case 'max_crew': unlocked = typeof getMaxCrewSize === 'function' && state.henchmen.length >= getMaxCrewSize(state); break;
      case 'loyal_crew_all': unlocked = state.henchmen.length >= 3 && state.henchmen.every(h => (h.loyalty || 0) >= 90); break;
      case 'crew_veteran_365': unlocked = state.henchmen.some(h => (h.daysServed || 0) >= 365); break;

      // Campaign / Acts
      case 'act_2': unlocked = state.campaign && state.campaign.currentAct >= 2; break;
      case 'act_3': unlocked = state.campaign && state.campaign.currentAct >= 3; break;
      case 'act_4': unlocked = state.campaign && state.campaign.currentAct >= 4; break;
      case 'act_5': unlocked = state.campaign && state.campaign.currentAct >= 5; break;
      case 'ending_kingpin': unlocked = state.campaign && state.campaign.endingId === 'kingpin'; break;
      case 'ending_escape': unlocked = state.campaign && state.campaign.endingId === 'escape'; break;
      case 'ending_straight': unlocked = state.campaign && state.campaign.endingId === 'going_straight'; break;
      case 'ending_informant': unlocked = state.campaign && state.campaign.endingId === 'informant'; break;
      case 'ending_blaze': unlocked = state.campaign && state.campaign.endingId === 'blaze_of_glory'; break;
      case 'ending_politician': unlocked = state.campaign && state.campaign.endingId === 'politician'; break;
      case 'ending_martyr': unlocked = state.campaign && state.campaign.endingId === 'martyr'; break;
      case 'ending_deal': unlocked = state.campaign && state.campaign.endingId === 'the_deal'; break;
      case 'game_beaten': unlocked = state.campaign && state.campaign.endingId != null; break;
      case 'ng_plus_complete': unlocked = state.newGamePlus && state.campaign && state.campaign.endingId != null; break;

      // Reputation dimensions
      case 'rep_feared': unlocked = state.rep && (state.rep.fear || 0) >= 75; break;
      case 'rep_trusted': unlocked = state.rep && (state.rep.trust || 0) >= 75; break;
      case 'rep_streetcred_max': unlocked = state.rep && (state.rep.streetCred || 0) >= 90; break;
      case 'rep_public_hero': unlocked = state.rep && (state.rep.publicImage || 0) >= 50; break;
      case 'rep_heat_max': unlocked = state.rep && (state.rep.heatSignature || 0) >= 90; break;
      case 'rep_mythic': unlocked = typeof getOverallRepLevel === 'function' && getOverallRepLevel(state).name === 'Mythic'; break;
      case 'rep_despised': {
        if (state.rep) {
          unlocked = Object.entries(state.rep).some(([key, val]) => {
            const dim = typeof REP_DIMENSIONS !== 'undefined' ? REP_DIMENSIONS[key] : null;
            return dim && dim.min < 0 && val <= -80;
          });
        }
        break;
      }
      case 'rep_balanced': unlocked = state.rep && (state.rep.streetCred || 0) >= 25 && (state.rep.fear || 0) >= 25 && (state.rep.trust || 0) >= 25 && (state.rep.publicImage || 0) >= 25 && (state.rep.heatSignature || 0) >= 25; break;

      // Supply/demand economy
      case 'market_crash': unlocked = (stats.marketsCrashed || 0) > 0; break;
      case 'market_hot': unlocked = (stats.hotMarketsFound || 0) > 0; break;
      case 'market_manipulator': unlocked = (stats.marketManipulations || 0) > 0; break;
      case 'supply_corner': {
        if (state.marketMemory && state.marketMemory.supply) {
          for (const key in state.marketMemory.supply) {
            if (state.marketMemory.supply[key] < 30) { unlocked = true; break; }
          }
        }
        break;
      }
      case 'demand_surge': {
        if (state.marketMemory && state.marketMemory.demand) {
          for (const key in state.marketMemory.demand) {
            if (state.marketMemory.demand[key] > 150) { unlocked = true; break; }
          }
        }
        break;
      }
      case 'economist': unlocked = (stats.supplyDemandProfits || 0) >= 5; break;

      // Processing / Lab
      case 'first_cook': unlocked = state.processing && (state.processing.totalBatchesCooked || 0) >= 1; break;
      case 'master_chemist': unlocked = typeof getChemistryLevel === 'function' && getChemistryLevel(state) >= 8; break;
      case 'premium_product': unlocked = state.processing && (state.processing.totalBatchesCooked || 0) > 0 && state.processedDrugs && Object.values(state.processedDrugs).some(p => p.quality === 'premium' || p.quality === 'legendary'); break;
      case 'mass_producer': unlocked = state.processing && (state.processing.totalBatchesCooked || 0) >= 20; break;
      case 'designer_drug': unlocked = (stats.designerBlendsCooked || 0) >= 1; break;
      case 'legendary_batch': unlocked = state.processedDrugs && Object.values(state.processedDrugs).some(p => p.quality === 'legendary'); break;

      // Import/Export
      case 'first_import': unlocked = state.importExport && (state.importExport.totalImports || 0) >= 1; break;
      case 'smuggler': unlocked = state.importExport && (state.importExport.unlockedSources || []).length >= 3; break;
      case 'global_network': {
        if (state.importExport) {
          const maxSources = typeof INTERNATIONAL_SOURCES !== 'undefined' ? INTERNATIONAL_SOURCES.filter(s => !s.ngPlusOnly || state.newGamePlus).length : 6;
          unlocked = (state.importExport.unlockedSources || []).length >= maxSources;
        }
        break;
      }
      case 'seized_survivor': unlocked = state.importExport && (state.importExport.totalSeized || 0) > 0; break;
      case 'narco_sub': unlocked = (stats.narcoSubShipments || 0) >= 1; break;
      case 'import_baron': unlocked = state.importExport && (state.importExport.totalImports || 0) >= 10; break;

      // Factions
      case 'first_alliance': unlocked = state.factions && Object.keys(state.factions.alliances || {}).length >= 1; break;
      case 'war_winner': unlocked = (stats.warsWon || 0) >= 1; break;
      case 'faction_absorber': unlocked = state.factions && (state.factions.absorptions || []).length >= 1; break;
      case 'diplomat': unlocked = state.factions && Object.keys(state.factions.alliances || {}).length >= 3; break;
      case 'warmonger': unlocked = state.factions && Object.keys(state.factions.wars || {}).length >= 3; break;
      case 'peacemaker': unlocked = (stats.peaceNegotiated || 0) >= 1; break;
      case 'absorb_all': unlocked = state.factions && (state.factions.absorptions || []).length >= (typeof FACTIONS !== 'undefined' ? FACTIONS.length : 8); break;
      case 'joint_venture': unlocked = state.factions && Object.values(state.factions.alliances || {}).includes('joint_venture'); break;

      // Politics
      case 'first_bribe': unlocked = state.politics && Object.keys(state.politics.corruptOfficials || {}).length >= 1; break;
      case 'first_contact': unlocked = state.politics && Object.keys(state.politics.contacts || {}).length >= 1; break;
      case 'corrupt_3': unlocked = state.politics && Object.keys(state.politics.corruptOfficials || {}).length >= 3; break;
      case 'corrupt_all': unlocked = state.politics && Object.keys(state.politics.corruptOfficials || {}).length >= (typeof OFFICIAL_TYPES !== 'undefined' ? OFFICIAL_TYPES.filter(o => !o.ngPlusOnly || state.newGamePlus).length : 6); break;
      case 'contacts_5': unlocked = state.politics && Object.keys(state.politics.contacts || {}).length >= 5; break;
      case 'intel_10': unlocked = state.politics && (state.politics.intelGathered || []).length >= 10; break;
      case 'scandal_survivor': unlocked = state.politics && (state.politics.scandals || 0) >= 3; break;
      case 'influence_max': unlocked = state.politics && (state.politics.politicalInfluence || 0) >= 80; break;

      // Missions
      case 'first_mission': unlocked = state.missions && (state.missions.totalMissionsCompleted || 0) >= 1; break;
      case 'missions_10': unlocked = state.missions && (state.missions.totalMissionsCompleted || 0) >= 10; break;
      case 'missions_25': unlocked = state.missions && (state.missions.totalMissionsCompleted || 0) >= 25; break;
      case 'missions_50': unlocked = state.missions && (state.missions.totalMissionsCompleted || 0) >= 50; break;
      case 'first_dilemma': unlocked = state.missions && (state.missions.totalDilemmas || 0) >= 1; break;
      case 'dilemmas_5': unlocked = state.missions && (state.missions.totalDilemmas || 0) >= 5; break;
      case 'heist_success': unlocked = state.missions && (state.missions.completedMissions || []).some(m => m.missionId === 'bank_job'); break;
      case 'mission_rewards_100k': unlocked = state.missions && (state.missions.totalMissionRewards || 0) >= 100000; break;
      case 'dialogue_master': unlocked = state.missions && (state.missions.completedMissions || []).filter(m => {
        const t = typeof SIDE_MISSIONS !== 'undefined' ? SIDE_MISSIONS.find(s => s.id === m.missionId) : null;
        return t && t.dialogue;
      }).length >= 5; break;
      case 'dilemmas_10': unlocked = state.missions && (state.missions.totalDilemmas || 0) >= 10; break;
      case 'turf_war_won': unlocked = state.missions && (state.missions.completedMissions || []).some(m => m.missionId === 'turf_war'); break;
      case 'community_investor': unlocked = state.missions && (state.missions.completedMissions || []).some(m => m.missionId === 'neighborhood_invest'); break;
      case 'political_player': unlocked = state.missions && (state.missions.completedMissions || []).some(m => m.missionId === 'election_interference'); break;
      case 'missions_100': unlocked = state.missions && (state.missions.totalMissionsCompleted || 0) >= 100; break;
      case 'mission_rewards_500k': unlocked = state.missions && (state.missions.totalMissionRewards || 0) >= 500000; break;
      case 'all_categories': {
        if (state.missions) {
          const cats = new Set();
          for (const m of (state.missions.completedMissions || [])) {
            const t = typeof SIDE_MISSIONS !== 'undefined' ? SIDE_MISSIONS.find(s => s.id === m.missionId) : null;
            if (t) cats.add(t.category);
          }
          unlocked = cats.size >= 8;
        }
        break;
      }
      case 'saboteur': unlocked = state.missions && (state.missions.completedMissions || []).some(m => m.missionId === 'sabotage_rival'); break;

      // NG+ Endings
      case 'ending_ng_immortal': unlocked = state.campaign && state.campaign.endingId === 'ng_immortal'; break;
      case 'ending_ng_ghost': unlocked = state.campaign && state.campaign.endingId === 'ng_ghost'; break;
      case 'ending_ng_cartel': unlocked = state.campaign && state.campaign.endingId === 'ng_cartel_king'; break;
      case 'ending_ng_philanthropist': unlocked = state.campaign && state.campaign.endingId === 'ng_philanthropist'; break;
      case 'ending_ng_shadow': unlocked = state.campaign && state.campaign.endingId === 'ng_shadow_gov'; break;
      case 'ending_ng_warlord': unlocked = state.campaign && state.campaign.endingId === 'ng_warlord'; break;
      case 'ending_ng_chemist': unlocked = state.campaign && state.campaign.endingId === 'ng_chemist'; break;
      case 'ending_ng_perfect': unlocked = state.campaign && state.campaign.endingId === 'ng_perfect'; break;
      case 'all_endings': {
        try {
          const ga = JSON.parse(localStorage.getItem('drugwars_endings') || '[]');
          unlocked = ga.length >= 20;
        } catch(e) { unlocked = false; }
        break;
      }
    }

    if (unlocked) {
      state.achievements.push(ach.id);
      earned.push(ach);
      // Award XP for achievement
      if (ach.xp > 0) awardXP(state, 'complete_achievement', ach.xp);
    }
  }

  return earned;
}

// Update stat trackers during gameplay
function updateAchievementStats(state, event, data) {
  if (!state.achievementStats) state.achievementStats = {};
  const s = state.achievementStats;

  switch (event) {
    case 'buy':
      s.totalTransactions = (s.totalTransactions || 0) + 1;
      s.largestBuyQty = Math.max(s.largestBuyQty || 0, data.amount || 0);
      s.largestPurchase = Math.max(s.largestPurchase || 0, data.cost || 0);
      if (data.unitPrice < 50) s.cheapestBuy = Math.min(s.cheapestBuy || Infinity, data.unitPrice);
      if (!s.drugsTraded) s.drugsTraded = [];
      if (!s.drugsTraded.includes(data.drugId)) s.drugsTraded.push(data.drugId);
      if (!s.citiesBoughtIn) s.citiesBoughtIn = [];
      if (!s.citiesBoughtIn.includes(state.currentLocation)) s.citiesBoughtIn.push(state.currentLocation);
      if (data.duringCrash) s.boughtDuringCrash = (s.boughtDuringCrash || 0) + 1;
      break;

    case 'sell':
      s.totalTransactions = (s.totalTransactions || 0) + 1;
      s.largestSellQty = Math.max(s.largestSellQty || 0, data.amount || 0);
      if (!s.drugsSoldById) s.drugsSoldById = {};
      s.drugsSoldById[data.drugId] = (s.drugsSoldById[data.drugId] || 0) + data.amount;
      if (!s.drugsTraded) s.drugsTraded = [];
      if (!s.drugsTraded.includes(data.drugId)) s.drugsTraded.push(data.drugId);
      if (data.duringSpike) s.soldDuringSpike = (s.soldDuringSpike || 0) + 1;
      if (data.profitRatio) s.bestProfitRatio = Math.max(s.bestProfitRatio || 0, data.profitRatio);
      // Check clean sweep
      const remaining = Object.values(state.inventory).reduce((a, b) => a + b, 0);
      if (remaining === 0 && data.amount > 0) s.cleanSweeps = (s.cleanSweeps || 0) + 1;
      break;

    case 'dialogue':
      s.dialoguesCompleted = (s.dialoguesCompleted || 0) + 1;
      if (data.npcId) {
        if (!s.npcsMetSet) s.npcsMetSet = [];
        if (!s.npcsMetSet.includes(data.npcId)) s.npcsMetSet.push(data.npcId);
      }
      if (data.speechCheckPassed) s.speechChecksPassed = (s.speechChecksPassed || 0) + 1;
      if (data.speechCheckFailed) s.speechChecksFailed = (s.speechChecksFailed || 0) + 1;
      if (data.speechResolution) s.speechResolutions = (s.speechResolutions || 0) + 1;
      if (data.npcId === 'corrupt_cop' && data.bribed) s.copsBribed = (s.copsBribed || 0) + 1;
      if (data.npcId === 'retired_kingpin') s.kingpinTalks = (s.kingpinTalks || 0) + 1;
      if (data.npcId === 'tech_hacker' && data.hackerUsed) s.hackersUsed = (s.hackersUsed || 0) + 1;
      break;

    case 'travel':
      s.totalTravels = (s.totalTravels || 0) + 1;
      if (data.transport === 'flight') s.flightsTaken = (s.flightsTaken || 0) + 1;
      if (data.transport === 'car') s.carTravels = (s.carTravels || 0) + 1;
      // Track transport types used
      if (!s.transportUsed) s.transportUsed = {};
      if (data.transportId) s.transportUsed[data.transportId] = (s.transportUsed[data.transportId] || 0) + 1;
      // Budget travel streak
      const tdata = TRANSPORT[data.transportId];
      if (tdata && tdata.tier === 'budget') s.budgetTravelStreak = (s.budgetTravelStreak || 0) + 1;
      else s.budgetTravelStreak = 0;
      if (!s.regionsVisited) s.regionsVisited = [];
      if (data.region && !s.regionsVisited.includes(data.region)) s.regionsVisited.push(data.region);
      let inv = 0;
      for (const k in state.inventory) inv += state.inventory[k];
      s.maxTravelInventory = Math.max(s.maxTravelInventory || 0, inv);
      if (data.noEncounter) {
        s.safeTravelStreak = (s.safeTravelStreak || 0) + 1;
      } else {
        s.safeTravelStreak = 0;
      }
      if (state.currentLocation === 'miami') {
        s.consecutiveMiami = (s.consecutiveMiami || 0) + 1;
      } else {
        s.consecutiveMiami = 0;
      }
      break;

    case 'combat_win':
      s.combatsWon = (s.combatsWon || 0) + 1;
      s.combatWinStreak = (s.combatWinStreak || 0) + 1;
      if (data.type === 'gang') s.gangFightsWon = (s.gangFightsWon || 0) + 1;
      if (data.type === 'dea_raid') s.deaRaidsSurvived = (s.deaRaidsSurvived || 0) + 1;
      if (data.noDamage) s.flawlessWins = (s.flawlessWins || 0) + 1;
      break;

    case 'combat_end':
      if (!data.won) s.combatWinStreak = 0;
      break;

    case 'escape':
      s.successfulEscapes = (s.successfulEscapes || 0) + 1;
      break;

    case 'surrender':
      s.surrenders = (s.surrenders || 0) + 1;
      break;

    case 'bribe':
      s.bribesPaid = (s.bribesPaid || 0) + 1;
      break;

    case 'health_change':
      s.lowestHealth = Math.min(s.lowestHealth || 100, state.health);
      break;

    case 'hospital':
      s.hospitalVisits = (s.hospitalVisits || 0) + 1;
      break;

    case 'crew_injured':
      s.crewInjured = (s.crewInjured || 0) + 1;
      break;

    case 'crew_healed':
      s.crewHealed = (s.crewHealed || 0) + 1;
      break;

    case 'crew_fired':
      s.crewFired = (s.crewFired || 0) + 1;
      break;

    case 'court_contact':
      if (!s.contactsPaid) s.contactsPaid = [];
      if (!s.contactsPaid.includes(data.contactId)) s.contactsPaid.push(data.contactId);
      break;

    case 'verdict':
      if (data.verdict === 'not_guilty') s.notGuiltyVerdicts = (s.notGuiltyVerdicts || 0) + 1;
      if (data.verdict === 'guilty') {
        s.guiltyVerdicts = (s.guiltyVerdicts || 0) + 1;
        s.totalPrisonDays = (s.totalPrisonDays || 0) + (data.prisonDays || 0);
      }
      break;

    case 'fall_guy':
      s.fallGuysUsed = (s.fallGuysUsed || 0) + 1;
      break;

    case 'territory_income':
      s.totalTerritoryIncome = (s.totalTerritoryIncome || 0) + (data.amount || 0);
      break;

    case 'level_up':
      s.levelUps = (s.levelUps || 0) + 1;
      break;

    case 'mugged':
      s.timesMugged = (s.timesMugged || 0) + 1;
      break;

    case 'found_stash':
      s.stashesFound = (s.stashesFound || 0) + 1;
      break;

    case 'comeback':
      s.comebackAchieved = true;
      break;
  }
}

function getAchievementProgress(state) {
  const total = ACHIEVEMENTS.length;
  const earned = (state.achievements || []).length;
  return { earned, total, percent: Math.round((earned / total) * 100) };
}
