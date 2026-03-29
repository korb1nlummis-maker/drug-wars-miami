/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Businesses & Fronts System
   15 purchasable businesses with income, laundering, synergies,
   and random events. Each business ties into the wider game
   through crew, heat, territory, and story progression.
   ============================================================ */

const BUSINESS_TYPES = [
  {
    id: 'music_label', name: 'Music Label', emoji: '🎵',
    setupCost: 100000, maxLevel: 5,
    dailyIncomeMin: 2000, dailyIncomeMax: 50000,
    launderingCapacity: 20000,
    crewRequired: 2,
    unlockAct: 2,
    ngPlus: false,
    description: 'Sign local Miami artists, produce tracks, and launder revenue through music royalties and touring income.',
    specialAbility: 'cultural_influence',
    upgradeCosts: [0, 50000, 150000, 300000, 500000],
    events: [
      { id: 'artist_blowup', chance: 0.05, effect: 'income_boost_3x_7days', text: 'One of your artists went viral! Income tripled for a week.' },
      { id: 'artist_flop', chance: 0.06, effect: 'income_halved_3days', text: 'New album flopped hard. Revenue is tanking.' },
      { id: 'artist_arrest', chance: 0.03, effect: 'heat_increase_10', text: 'Your headliner got arrested on drug charges. Media is all over it.' },
      { id: 'artist_leaves', chance: 0.04, effect: 'income_decrease_20pct', text: 'Top artist signed with a rival label. Roster weakened.' },
      { id: 'grammy_nom', chance: 0.02, effect: 'reputation_boost_15', text: 'Grammy nomination! Your label is getting serious mainstream attention.' },
    ],
  },
  {
    id: 'food_truck_fleet', name: 'Food Truck Fleet', emoji: '🚛',
    setupCost: 8000, maxLevel: 5,
    dailyIncomeMin: 500, dailyIncomeMax: 2000,
    launderingCapacity: 3000,
    crewRequired: 1,
    unlockAct: 1,
    ngPlus: false,
    description: 'Mobile food trucks double as distribution cover and build community presence across districts.',
    specialAbility: 'mobile_distribution',
    upgradeCosts: [0, 15000, 30000, 50000, 80000],
    events: [
      { id: 'health_inspection', chance: 0.06, effect: 'shutdown_3days', text: 'Health inspector shut down your trucks for 3 days.' },
      { id: 'food_festival', chance: 0.04, effect: 'income_boost_2x_3days', text: 'Food festival brought a surge of customers.' },
      { id: 'truck_breakdown', chance: 0.05, effect: 'repair_cost_2000', text: 'One of your trucks broke down. Repairs needed.' },
      { id: 'catering_gig', chance: 0.03, effect: 'income_boost_5000_once', text: 'Landed a big catering gig. Nice payout.' },
    ],
  },
  {
    id: 'marina', name: 'Marina', emoji: '⚓',
    setupCost: 250000, maxLevel: 5,
    dailyIncomeMin: 5000, dailyIncomeMax: 15000,
    launderingCapacity: 25000,
    crewRequired: 3,
    unlockAct: 2,
    ngPlus: false,
    description: 'Boat rentals and dock space, with smuggling staging for offshore shipments. Yacht club upgrade available.',
    specialAbility: 'smuggling_staging',
    upgradeCosts: [0, 100000, 200000, 350000, 500000],
    events: [
      { id: 'coast_guard_patrol', chance: 0.04, effect: 'heat_increase_15', text: 'Coast Guard increased patrols near your marina.' },
      { id: 'yacht_party', chance: 0.03, effect: 'reputation_boost_10', text: 'Hosted a yacht party. Rubbed elbows with Miami elite.' },
      { id: 'hurricane_damage', chance: 0.02, effect: 'repair_cost_25000', text: 'Storm damage to the docks. Major repairs needed.' },
      { id: 'big_charter', chance: 0.04, effect: 'income_boost_2x_5days', text: 'Celebrity booked a week-long charter. Big money.' },
    ],
  },
  {
    id: 'crypto_farm', name: 'Crypto Mining Farm', emoji: '₿',
    setupCost: 75000, maxLevel: 5,
    dailyIncomeMin: 1000, dailyIncomeMax: 5000,
    launderingCapacity: 50000,
    crewRequired: 1,
    unlockAct: 3,
    ngPlus: true,
    description: 'Mining rigs generate income and provide untraceable laundering through cryptocurrency mixing.',
    specialAbility: 'crypto_laundering',
    upgradeCosts: [0, 30000, 75000, 150000, 250000],
    events: [
      { id: 'crypto_boom', chance: 0.05, effect: 'income_boost_3x_3days', text: 'Crypto market surged! Mining payouts tripled.' },
      { id: 'crypto_crash', chance: 0.05, effect: 'income_halved_5days', text: 'Market crash. Mining barely covers electricity.' },
      { id: 'power_suspicion', chance: 0.04, effect: 'heat_increase_10', text: 'Power company flagged your abnormal electricity usage.' },
      { id: 'hardware_failure', chance: 0.03, effect: 'shutdown_2days', text: 'GPU rigs overheated. Farm offline for repairs.' },
    ],
  },
  {
    id: 'private_security', name: 'Private Security Firm', emoji: '🛡️',
    setupCost: 150000, maxLevel: 5,
    dailyIncomeMin: 3000, dailyIncomeMax: 10000,
    launderingCapacity: 15000,
    crewRequired: 4,
    unlockAct: 2,
    ngPlus: false,
    description: 'Legal weapon carry, armed escorts, and VIP contracts. Government contract potential.',
    specialAbility: 'legal_firepower',
    upgradeCosts: [0, 60000, 120000, 200000, 350000],
    events: [
      { id: 'gov_contract', chance: 0.03, effect: 'income_boost_2x_14days', text: 'Landed a government security contract. Steady money.' },
      { id: 'client_incident', chance: 0.04, effect: 'heat_increase_5', text: 'One of your guards got a bit too aggressive with a client.' },
      { id: 'vip_referral', chance: 0.03, effect: 'reputation_boost_10', text: 'A-list client referred you to their circle.' },
      { id: 'license_audit', chance: 0.03, effect: 'fine_5000', text: 'Firearms license audit. Had to pay some fees to smooth things over.' },
    ],
  },
  {
    id: 'towing_company', name: 'Towing Company', emoji: '🚗',
    setupCost: 50000, maxLevel: 5,
    dailyIncomeMin: 1000, dailyIncomeMax: 3000,
    launderingCapacity: 5000,
    crewRequired: 2,
    unlockAct: 1,
    ngPlus: false,
    description: 'Tow trucks for vehicle theft, road blocking ops, and hidden drug transport in towed vehicles.',
    specialAbility: 'vehicle_acquisition',
    upgradeCosts: [0, 20000, 45000, 80000, 130000],
    events: [
      { id: 'police_contract', chance: 0.04, effect: 'heat_decrease_5', text: 'Got a police towing contract. Great cover.' },
      { id: 'angry_owner', chance: 0.05, effect: 'heat_increase_3', text: 'Towed the wrong car. Owner is making noise.' },
      { id: 'chop_discovery', chance: 0.02, effect: 'heat_increase_15', text: 'Cops found parts from a stolen car in your lot.' },
      { id: 'insurance_scam', chance: 0.03, effect: 'income_boost_5000_once', text: 'Insurance payout from a staged accident.' },
    ],
  },
  {
    id: 'bail_bonds', name: 'Bail Bonds Office', emoji: '⚖️',
    setupCost: 80000, maxLevel: 5,
    dailyIncomeMin: 2000, dailyIncomeMax: 8000,
    launderingCapacity: 10000,
    crewRequired: 1,
    unlockAct: 2,
    ngPlus: false,
    description: 'Intel goldmine: learn about every arrest in the county. Recruit skilled criminals from client list.',
    specialAbility: 'arrest_intel',
    upgradeCosts: [0, 30000, 70000, 130000, 200000],
    events: [
      { id: 'big_bond', chance: 0.04, effect: 'income_boost_10000_once', text: 'Posted bond for a high-profile client. Fat fee.' },
      { id: 'skip_runner', chance: 0.05, effect: 'income_decrease_5000', text: 'Client skipped town. Lost the bond money.' },
      { id: 'recruit_tip', chance: 0.06, effect: 'crew_recruit_bonus', text: 'Found a talented specialist in the client files.' },
      { id: 'judge_contact', chance: 0.03, effect: 'heat_decrease_10', text: 'Made friends with a judge. Could be useful.' },
    ],
  },
  {
    id: 'pawn_shop', name: 'Pawn Shop', emoji: '🏪',
    setupCost: 40000, maxLevel: 5,
    dailyIncomeMin: 1000, dailyIncomeMax: 5000,
    launderingCapacity: 8000,
    crewRequired: 1,
    unlockAct: 1,
    ngPlus: false,
    description: 'Fence stolen property, sell weapons as antiques, and gather community intel from walk-ins.',
    specialAbility: 'fence_stolen_goods',
    upgradeCosts: [0, 15000, 35000, 60000, 100000],
    events: [
      { id: 'rare_item', chance: 0.04, effect: 'income_boost_8000_once', text: 'Someone pawned a Rolex worth way more than they knew.' },
      { id: 'stolen_sting', chance: 0.03, effect: 'heat_increase_10', text: 'Undercover cop tried to sell you marked goods.' },
      { id: 'neighborhood_tip', chance: 0.05, effect: 'intel_bonus', text: 'Regular customer dropped useful info about rival activity.' },
      { id: 'robbery_attempt', chance: 0.03, effect: 'repair_cost_3000', text: 'Someone tried to rob the shop. Damage to repair.' },
    ],
  },
  {
    id: 'gas_station', name: 'Gas Station', emoji: '⛽',
    setupCost: 200000, maxLevel: 5,
    dailyIncomeMin: 3000, dailyIncomeMax: 8000,
    launderingCapacity: 12000,
    crewRequired: 2,
    unlockAct: 2,
    ngPlus: false,
    description: 'High-volume cash business, distribution point, hidden storage. Build a chain for network bonuses.',
    specialAbility: 'distribution_node',
    upgradeCosts: [0, 80000, 160000, 280000, 450000],
    events: [
      { id: 'fuel_shortage', chance: 0.03, effect: 'income_boost_2x_3days', text: 'Fuel shortage in the area. Prices through the roof.' },
      { id: 'robbery', chance: 0.04, effect: 'income_decrease_3000', text: 'Gas station got robbed. Lost the day\'s take.' },
      { id: 'irs_audit', chance: 0.02, effect: 'fine_10000', text: 'IRS flagged your cash deposits. Paid an accountant to handle it.' },
      { id: 'expansion_opportunity', chance: 0.03, effect: 'discount_next_purchase', text: 'Neighboring station is for sale at a discount.' },
    ],
  },
  {
    id: 'pharmacy', name: 'Pharmacy', emoji: '💊',
    setupCost: 300000, maxLevel: 5,
    dailyIncomeMin: 5000, dailyIncomeMax: 20000,
    launderingCapacity: 18000,
    crewRequired: 2,
    unlockAct: 3,
    ngPlus: false,
    description: 'Divert prescription meds, forge scripts. Requires a corrupt pharmacist ($50K license fee).',
    specialAbility: 'prescription_diversion',
    upgradeCosts: [0, 100000, 200000, 350000, 500000],
    events: [
      { id: 'dea_inspection', chance: 0.04, effect: 'heat_increase_15', text: 'DEA audit on controlled substance records. Things got tense.' },
      { id: 'oxy_shortage', chance: 0.03, effect: 'income_boost_3x_5days', text: 'Oxy shortage across the city. Your supply is gold.' },
      { id: 'pharmacist_guilt', chance: 0.03, effect: 'crew_loyalty_decrease', text: 'Your pharmacist is having second thoughts. Keep an eye on them.' },
      { id: 'bulk_order', chance: 0.04, effect: 'income_boost_15000_once', text: 'Nursing home placed a massive order. Legit and lucrative.' },
    ],
  },
  {
    id: 'strip_club', name: 'Strip Club', emoji: '💃',
    setupCost: 500000, maxLevel: 5,
    dailyIncomeMin: 10000, dailyIncomeMax: 30000,
    launderingCapacity: 40000,
    crewRequired: 5,
    unlockAct: 3,
    ngPlus: false,
    description: 'Cash-heavy nightlife venue. Networking hub, VIP distribution rooms, and blackmail potential.',
    specialAbility: 'blackmail_network',
    upgradeCosts: [0, 150000, 300000, 500000, 800000],
    events: [
      { id: 'vip_politician', chance: 0.03, effect: 'blackmail_asset', text: 'Caught a city councilman in a compromising situation. Leverage acquired.' },
      { id: 'vice_raid', chance: 0.04, effect: 'shutdown_5days_heat_20', text: 'Vice squad raided the club. Shut down for almost a week.' },
      { id: 'celebrity_night', chance: 0.04, effect: 'income_boost_3x_3days', text: 'Celebrity showed up with an entourage. Place is packed.' },
      { id: 'employee_drama', chance: 0.05, effect: 'fine_5000', text: 'Employee dispute. Had to settle it with cash.' },
    ],
  },
  {
    id: 'storage_units', name: 'Storage Units', emoji: '📦',
    setupCost: 150000, maxLevel: 5,
    dailyIncomeMin: 2000, dailyIncomeMax: 5000,
    launderingCapacity: 8000,
    crewRequired: 1,
    unlockAct: 2,
    ngPlus: false,
    description: 'Unlimited stash capacity, dead drops, extremely hard to raid (individual warrants needed per unit).',
    specialAbility: 'unlimited_stash',
    upgradeCosts: [0, 50000, 100000, 180000, 300000],
    events: [
      { id: 'abandoned_unit', chance: 0.04, effect: 'found_goods_random', text: 'Tenant abandoned a unit. Found some interesting merchandise inside.' },
      { id: 'break_in', chance: 0.03, effect: 'stash_loss_10pct', text: 'Someone broke into a unit. Lost some product.' },
      { id: 'warrant_attempt', chance: 0.02, effect: 'heat_decrease_5', text: 'Cops tried for a warrant but got denied. Individual units are a legal nightmare for them.' },
      { id: 'full_occupancy', chance: 0.05, effect: 'income_boost_2x_7days', text: 'Full occupancy. Every unit rented out.' },
    ],
  },
  {
    id: 'car_dealership', name: 'Car Dealership', emoji: '🚘',
    setupCost: 500000, maxLevel: 5,
    dailyIncomeMin: 5000, dailyIncomeMax: 15000,
    launderingCapacity: 35000,
    crewRequired: 3,
    unlockAct: 3,
    ngPlus: false,
    description: 'Launder through large cash car purchases, acquire vehicles on demand, run a chop shop in the back.',
    specialAbility: 'vehicle_laundering',
    upgradeCosts: [0, 150000, 300000, 500000, 800000],
    events: [
      { id: 'luxury_sale', chance: 0.04, effect: 'income_boost_20000_once', text: 'Sold a Lambo to a rapper. Cash deal.' },
      { id: 'audit_flag', chance: 0.03, effect: 'heat_increase_10', text: 'Too many cash transactions flagged suspicious activity reports.' },
      { id: 'stolen_vin', chance: 0.02, effect: 'heat_increase_20', text: 'Cops traced a VIN back to your lot. Not good.' },
      { id: 'fleet_deal', chance: 0.03, effect: 'income_boost_2x_7days', text: 'Corporate fleet deal. Steady income for the week.' },
    ],
  },
  {
    id: 'construction_company', name: 'Construction Company', emoji: '🏗️',
    setupCost: 250000, maxLevel: 5,
    dailyIncomeMin: 5000, dailyIncomeMax: 20000,
    launderingCapacity: 30000,
    crewRequired: 4,
    unlockAct: 2,
    ngPlus: false,
    description: 'Build hidden rooms, tunnels, fortifications. Workers double as muscle. Government contract potential.',
    specialAbility: 'fortification',
    upgradeCosts: [0, 80000, 180000, 320000, 500000],
    events: [
      { id: 'gov_bid_win', chance: 0.03, effect: 'income_boost_3x_14days', text: 'Won a city infrastructure contract. Huge payout over two weeks.' },
      { id: 'osha_inspection', chance: 0.04, effect: 'fine_8000', text: 'OSHA inspection found violations. Fines incoming.' },
      { id: 'tunnel_complete', chance: 0.02, effect: 'territory_defense_bonus', text: 'Finished a secret tunnel connecting two safehouses.' },
      { id: 'worker_injury', chance: 0.05, effect: 'fine_5000_heat_3', text: 'Worker got hurt on the job. Had to pay them off to stay quiet.' },
    ],
  },
  {
    id: 'laundromat_chain', name: 'Laundromat Chain', emoji: '🧺',
    setupCost: 30000, maxLevel: 5,
    dailyIncomeMin: 500, dailyIncomeMax: 1500,
    launderingCapacity: 6000,
    crewRequired: 0,
    unlockAct: 1,
    ngPlus: false,
    description: 'Classic money laundering. Multiple locations, low heat, low maintenance. Boring but reliable.',
    specialAbility: 'passive_laundering',
    upgradeCosts: [0, 10000, 25000, 50000, 80000],
    events: [
      { id: 'machine_breakdown', chance: 0.05, effect: 'repair_cost_1000', text: 'Washing machines broke down. Repair bill.' },
      { id: 'neighborhood_staple', chance: 0.04, effect: 'reputation_boost_5', text: 'Became a neighborhood staple. Community appreciates you.' },
      { id: 'competitor_opens', chance: 0.03, effect: 'income_decrease_20pct_7days', text: 'New laundromat opened nearby. Cutting into your traffic.' },
      { id: 'bulk_contract', chance: 0.03, effect: 'income_boost_2x_5days', text: 'Got a bulk laundry contract with a hotel chain.' },
    ],
  },
];

const BUSINESS_SYNERGIES = [
  {
    id: 'chop_shop_combo',
    name: 'Chop Shop Pipeline',
    requires: ['towing_company', 'car_dealership'],
    effect: 'car_dealership_income_boost_50pct',
    description: 'Towing feeds stolen cars to the dealership chop shop. +50% dealership income.',
  },
  {
    id: 'pharma_pipeline',
    name: 'Prescription Pipeline',
    requires: ['pharmacy'],
    requiresDrugDealing: true,
    effect: 'free_prescription_supply',
    description: 'Divert prescription meds for free supply of pharmaceuticals.',
  },
  {
    id: 'bail_intel_network',
    name: 'Arrest Intel Network',
    requires: ['bail_bonds'],
    effect: 'recruit_quality_boost_10pct',
    description: 'Bail bonds intel improves crew recruitment quality by 10%.',
  },
  {
    id: 'fortification_discount',
    name: 'Construction Fortification',
    requires: ['construction_company'],
    effect: 'fortification_cost_minus_30pct',
    description: 'Your construction crew fortifies territory for 30% less.',
  },
  {
    id: 'unlimited_stash',
    name: 'Secure Storage Network',
    requires: ['storage_units'],
    effect: 'unlimited_stash_capacity',
    description: 'Storage units provide virtually unlimited stash space.',
  },
  {
    id: 'gas_distribution',
    name: 'Gas Station Distribution Network',
    requiresCount: { id: 'gas_station', count: 3 },
    effect: 'distribution_network_bonus',
    description: 'Chain of 3+ gas stations creates a distribution network. +20% territory drug sales.',
  },
  {
    id: 'security_protection',
    name: 'Armed Protection',
    requires: ['private_security', 'strip_club'],
    effect: 'raid_resistance_bonus',
    description: 'Security firm protects your club. -25% raid chance on the strip club.',
  },
  {
    id: 'music_club_promo',
    name: 'Club Promotion Circuit',
    requires: ['music_label', 'strip_club'],
    effect: 'strip_club_income_boost_25pct',
    description: 'Your label artists perform at the club. +25% strip club income.',
  },
];

// ============================================================
// BUSINESS STATE
// ============================================================
function initBusinessState() {
  return {
    owned: [],             // { businessId, districtId, level, purchaseDay, shutdownUntil, totalEarned, incomeModifier }
    totalIncomeAllTime: 0,
    totalLaundered: 0,
    dailyIncome: 0,
    eventLog: [],          // { day, businessId, eventId, text }
    corruptPharmacistLicense: false,
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processBusinessesDaily(state) {
  if (!state.businesses) state.businesses = initBusinessState();
  const biz = state.businesses;
  const day = state.day || 1;

  let dailyTotal = 0;
  let dailyLaundered = 0;

  for (let i = 0; i < biz.owned.length; i++) {
    const owned = biz.owned[i];
    const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
    if (!def) continue;

    // Check shutdown
    if (owned.shutdownUntil && day < owned.shutdownUntil) continue;
    owned.shutdownUntil = 0;

    // Calculate income
    const income = getBusinessIncome(state, owned);
    dailyTotal += income;
    owned.totalEarned = (owned.totalEarned || 0) + income;

    // Laundering
    const launderCap = def.launderingCapacity * (1 + (owned.level - 1) * 0.2);
    dailyLaundered += launderCap;

    // Random events (5% base chance per business per day)
    if (def.events && def.events.length > 0) {
      for (const evt of def.events) {
        if (Math.random() < evt.chance) {
          applyBusinessEvent(state, owned, def, evt, day);
          biz.eventLog.push({ day: day, businessId: owned.businessId, eventId: evt.id, text: evt.text });
          if (biz.eventLog.length > 50) biz.eventLog.shift();
          break; // max one event per business per day
        }
      }
    }
  }

  // Apply income
  biz.dailyIncome = dailyTotal;
  biz.totalIncomeAllTime += dailyTotal;
  biz.totalLaundered += dailyLaundered;
  if (typeof state.cash === 'number') {
    state.cash += dailyTotal;
  }

  // Apply laundering to heat if applicable
  if (typeof processLaundering === 'function') {
    processLaundering(state, dailyLaundered);
  }
}

// ============================================================
// INCOME CALCULATION
// ============================================================
function getBusinessIncome(state, owned) {
  const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
  if (!def) return 0;

  // Base income roll between min and max
  const range = def.dailyIncomeMax - def.dailyIncomeMin;
  let income = def.dailyIncomeMin + Math.random() * range;

  // Level multiplier: each level adds 25%
  const levelMult = 1 + (owned.level - 1) * 0.25;
  income *= levelMult;

  // District wealth factor
  if (typeof getDistrictWealth === 'function' && owned.districtId) {
    const wealth = getDistrictWealth(state, owned.districtId);
    if (typeof wealth === 'number') {
      income *= (0.5 + wealth * 0.5); // wealth 0-1 maps to 0.5x-1.0x
    }
  }

  // Crew staffing: bonus if fully staffed, penalty if understaffed
  if (def.crewRequired > 0) {
    const assigned = typeof getAssignedCrew === 'function' ? getAssignedCrew(state, owned.businessId) : 0;
    if (typeof assigned === 'number' && assigned >= def.crewRequired) {
      income *= 1.1; // Fully staffed bonus
    } else {
      income *= 0.5; // Understaffed penalty
    }
  }

  // Income modifier from events
  if (typeof owned.incomeModifier === 'number' && owned.incomeModifier !== 1) {
    income *= owned.incomeModifier;
  }

  // Synergy bonuses
  const synergies = getBusinessSynergies(state);
  for (const syn of synergies) {
    if (syn.id === 'chop_shop_combo' && owned.businessId === 'car_dealership') {
      income *= 1.5;
    }
    if (syn.id === 'music_club_promo' && owned.businessId === 'strip_club') {
      income *= 1.25;
    }
    if (syn.id === 'gas_distribution' && owned.businessId === 'gas_station') {
      income *= 1.2;
    }
  }

  return Math.floor(income);
}

// ============================================================
// EVENT APPLICATION
// ============================================================
function applyBusinessEvent(state, owned, def, evt, day) {
  switch (evt.effect) {
    case 'income_boost_3x_7days':
      owned.incomeModifier = 3;
      owned._modifierExpiry = day + 7;
      break;
    case 'income_boost_2x_3days':
      owned.incomeModifier = 2;
      owned._modifierExpiry = day + 3;
      break;
    case 'income_boost_2x_5days':
      owned.incomeModifier = 2;
      owned._modifierExpiry = day + 5;
      break;
    case 'income_boost_2x_7days':
      owned.incomeModifier = 2;
      owned._modifierExpiry = day + 7;
      break;
    case 'income_boost_2x_14days':
      owned.incomeModifier = 2;
      owned._modifierExpiry = day + 14;
      break;
    case 'income_boost_3x_3days':
      owned.incomeModifier = 3;
      owned._modifierExpiry = day + 3;
      break;
    case 'income_boost_3x_5days':
      owned.incomeModifier = 3;
      owned._modifierExpiry = day + 5;
      break;
    case 'income_boost_3x_14days':
      owned.incomeModifier = 3;
      owned._modifierExpiry = day + 14;
      break;
    case 'income_halved_3days':
      owned.incomeModifier = 0.5;
      owned._modifierExpiry = day + 3;
      break;
    case 'income_halved_5days':
      owned.incomeModifier = 0.5;
      owned._modifierExpiry = day + 5;
      break;
    case 'income_decrease_20pct':
      owned.incomeModifier = 0.8;
      owned._modifierExpiry = day + 14;
      break;
    case 'income_decrease_20pct_7days':
      owned.incomeModifier = 0.8;
      owned._modifierExpiry = day + 7;
      break;
    case 'income_decrease_5000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 5000);
      break;
    case 'income_decrease_3000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 3000);
      break;
    case 'shutdown_3days':
      owned.shutdownUntil = day + 3;
      break;
    case 'shutdown_2days':
      owned.shutdownUntil = day + 2;
      break;
    case 'shutdown_5days_heat_20':
      owned.shutdownUntil = day + 5;
      if (typeof addHeat === 'function') addHeat(state, 20);
      break;
    case 'heat_increase_3':
      if (typeof addHeat === 'function') addHeat(state, 3);
      break;
    case 'heat_increase_5':
      if (typeof addHeat === 'function') addHeat(state, 5);
      break;
    case 'heat_increase_10':
      if (typeof addHeat === 'function') addHeat(state, 10);
      break;
    case 'heat_increase_15':
      if (typeof addHeat === 'function') addHeat(state, 15);
      break;
    case 'heat_increase_20':
      if (typeof addHeat === 'function') addHeat(state, 20);
      break;
    case 'heat_decrease_5':
      if (typeof addHeat === 'function') addHeat(state, -5);
      break;
    case 'heat_decrease_10':
      if (typeof addHeat === 'function') addHeat(state, -10);
      break;
    case 'reputation_boost_5':
      if (typeof addReputation === 'function') addReputation(state, 5);
      break;
    case 'reputation_boost_10':
      if (typeof addReputation === 'function') addReputation(state, 10);
      break;
    case 'reputation_boost_15':
      if (typeof addReputation === 'function') addReputation(state, 15);
      break;
    case 'repair_cost_1000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 1000);
      break;
    case 'repair_cost_2000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 2000);
      break;
    case 'repair_cost_3000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 3000);
      break;
    case 'repair_cost_25000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 25000);
      break;
    case 'fine_5000':
    case 'fine_5000_heat_3':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 5000);
      if (evt.effect === 'fine_5000_heat_3' && typeof addHeat === 'function') addHeat(state, 3);
      break;
    case 'fine_8000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 8000);
      break;
    case 'fine_10000':
      if (typeof state.cash === 'number') state.cash = Math.max(0, state.cash - 10000);
      break;
    case 'income_boost_5000_once':
      if (typeof state.cash === 'number') state.cash += 5000;
      break;
    case 'income_boost_8000_once':
      if (typeof state.cash === 'number') state.cash += 8000;
      break;
    case 'income_boost_10000_once':
      if (typeof state.cash === 'number') state.cash += 10000;
      break;
    case 'income_boost_15000_once':
      if (typeof state.cash === 'number') state.cash += 15000;
      break;
    case 'income_boost_20000_once':
      if (typeof state.cash === 'number') state.cash += 20000;
      break;
    case 'crew_recruit_bonus':
      if (typeof addCrewRecruitBonus === 'function') addCrewRecruitBonus(state, 0.1);
      break;
    case 'crew_loyalty_decrease':
      if (typeof adjustCrewLoyalty === 'function') adjustCrewLoyalty(state, owned.businessId, -10);
      break;
    case 'blackmail_asset':
      if (!state.businesses._blackmailAssets) state.businesses._blackmailAssets = 0;
      state.businesses._blackmailAssets++;
      // Blackmail benefit: reduce heat by 5 (capped at 3 uses) or add political influence
      if (state.businesses._blackmailAssets <= 3) {
        state.heat = Math.max(0, (state.heat || 0) - 5);
      } else {
        if (!state.politicalInfluence) state.politicalInfluence = 0;
        state.politicalInfluence += 1;
      }
      break;
    case 'found_goods_random':
      if (typeof addRandomLoot === 'function') addRandomLoot(state);
      break;
    case 'stash_loss_10pct':
      if (typeof reduceStash === 'function') reduceStash(state, 0.1);
      break;
    case 'intel_bonus':
      if (typeof addIntelPoint === 'function') addIntelPoint(state);
      break;
    case 'territory_defense_bonus':
      if (typeof addTerritoryDefenseBonus === 'function') addTerritoryDefenseBonus(state, 0.15);
      break;
    case 'discount_next_purchase':
      state.businesses._nextPurchaseDiscount = 0.2;
      break;
    case 'raid_resistance_bonus':
      // Handled in synergy checks
      break;
    default:
      break;
  }

  // Expire modifiers
  if (owned._modifierExpiry && day >= owned._modifierExpiry) {
    owned.incomeModifier = 1;
    owned._modifierExpiry = 0;
  }
}

// ============================================================
// PURCHASE BUSINESS
// ============================================================
function purchaseBusiness(state, businessId, districtId) {
  if (!state.businesses) state.businesses = initBusinessState();
  const biz = state.businesses;
  const def = BUSINESS_TYPES.find(b => b.id === businessId);

  if (!def) return { success: false, reason: 'Unknown business type.' };

  // Check act unlock
  const currentAct = (typeof getCurrentAct === 'function') ? getCurrentAct(state) : (state.act || 1);
  if (currentAct < def.unlockAct) {
    return { success: false, reason: 'Not available yet. Unlocks in Act ' + def.unlockAct + '.' };
  }

  // Check NG+ requirement
  if (def.ngPlus && !state.ngPlus) {
    return { success: false, reason: 'Only available in New Game+.' };
  }

  // Check if already owned in this district
  const alreadyOwned = biz.owned.find(o => o.businessId === businessId && o.districtId === districtId);
  if (alreadyOwned) {
    return { success: false, reason: 'You already own a ' + def.name + ' in this district.' };
  }

  // Pharmacy requires corrupt license
  if (businessId === 'pharmacy' && !biz.corruptPharmacistLicense) {
    return { success: false, reason: 'Need a corrupt pharmacist license first ($50K).' };
  }

  // Calculate cost with possible discount
  let cost = def.setupCost;
  if (biz._nextPurchaseDiscount) {
    cost = Math.floor(cost * (1 - biz._nextPurchaseDiscount));
    biz._nextPurchaseDiscount = 0;
  }

  // Check cash
  if (typeof state.cash !== 'number' || state.cash < cost) {
    return { success: false, reason: 'Not enough cash. Need $' + cost.toLocaleString() + '.' };
  }

  state.cash -= cost;
  biz.owned.push({
    businessId: businessId,
    districtId: districtId,
    level: 1,
    purchaseDay: state.day || 1,
    shutdownUntil: 0,
    totalEarned: 0,
    incomeModifier: 1,
    _modifierExpiry: 0,
  });

  return { success: true, cost: cost, business: def.name };
}

// ============================================================
// PURCHASE CORRUPT PHARMACIST LICENSE
// ============================================================
function purchasePharmacistLicense(state) {
  if (!state.businesses) state.businesses = initBusinessState();
  if (state.businesses.corruptPharmacistLicense) {
    return { success: false, reason: 'Already have a corrupt pharmacist license.' };
  }
  if (typeof state.cash !== 'number' || state.cash < 50000) {
    return { success: false, reason: 'Need $50,000 for the license.' };
  }
  state.cash -= 50000;
  state.businesses.corruptPharmacistLicense = true;
  return { success: true, cost: 50000 };
}

// ============================================================
// SELL BUSINESS
// ============================================================
function sellBusiness(state, businessIndex) {
  if (!state.businesses) return { success: false, reason: 'No businesses owned.' };
  const biz = state.businesses;

  if (businessIndex < 0 || businessIndex >= biz.owned.length) {
    return { success: false, reason: 'Invalid business index.' };
  }

  const owned = biz.owned[businessIndex];
  const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
  if (!def) return { success: false, reason: 'Unknown business type.' };

  // 60% of setup cost + upgrade costs invested
  let totalInvested = def.setupCost;
  for (let l = 1; l < owned.level; l++) {
    totalInvested += def.upgradeCosts[l] || 0;
  }
  const salePrice = Math.floor(totalInvested * 0.6);

  if (typeof state.cash === 'number') {
    state.cash += salePrice;
  }

  biz.owned.splice(businessIndex, 1);
  return { success: true, salePrice: salePrice, business: def.name };
}

// ============================================================
// UPGRADE BUSINESS
// ============================================================
function upgradeBusiness(state, businessIndex) {
  if (!state.businesses) return { success: false, reason: 'No businesses owned.' };
  const biz = state.businesses;

  if (businessIndex < 0 || businessIndex >= biz.owned.length) {
    return { success: false, reason: 'Invalid business index.' };
  }

  const owned = biz.owned[businessIndex];
  const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
  if (!def) return { success: false, reason: 'Unknown business type.' };

  if (owned.level >= def.maxLevel) {
    return { success: false, reason: def.name + ' is already at max level.' };
  }

  const cost = def.upgradeCosts[owned.level] || 0;
  if (typeof state.cash !== 'number' || state.cash < cost) {
    return { success: false, reason: 'Need $' + cost.toLocaleString() + ' to upgrade.' };
  }

  state.cash -= cost;
  owned.level++;
  return { success: true, cost: cost, newLevel: owned.level, business: def.name };
}

// ============================================================
// AVAILABLE BUSINESSES
// ============================================================
function getAvailableBusinesses(state) {
  const currentAct = (typeof getCurrentAct === 'function') ? getCurrentAct(state) : (state.act || 1);
  const isNgPlus = !!state.ngPlus;

  return BUSINESS_TYPES.map(def => {
    const actUnlocked = currentAct >= def.unlockAct;
    const ngOk = !def.ngPlus || isNgPlus;
    const ownedCount = state.businesses
      ? state.businesses.owned.filter(o => o.businessId === def.id).length
      : 0;

    return {
      id: def.id,
      name: def.name,
      emoji: def.emoji,
      setupCost: def.setupCost,
      dailyIncomeMin: def.dailyIncomeMin,
      dailyIncomeMax: def.dailyIncomeMax,
      launderingCapacity: def.launderingCapacity,
      crewRequired: def.crewRequired,
      unlockAct: def.unlockAct,
      ngPlus: def.ngPlus,
      description: def.description,
      specialAbility: def.specialAbility,
      unlocked: actUnlocked && ngOk,
      lockReason: !actUnlocked ? 'Unlocks in Act ' + def.unlockAct : (!ngOk ? 'New Game+ only' : null),
      ownedCount: ownedCount,
    };
  });
}

// ============================================================
// SYNERGY SYSTEM
// ============================================================
function getBusinessSynergies(state) {
  if (!state.businesses) return [];
  const owned = state.businesses.owned;
  const ownedIds = owned.map(o => o.businessId);
  const active = [];

  for (const syn of BUSINESS_SYNERGIES) {
    let met = false;

    if (syn.requires) {
      met = syn.requires.every(reqId => ownedIds.includes(reqId));
    }

    if (syn.requiresCount) {
      const count = ownedIds.filter(id => id === syn.requiresCount.id).length;
      met = count >= syn.requiresCount.count;
    }

    if (syn.requiresDrugDealing) {
      // Pharmacy synergy requires the player to be dealing drugs
      const dealing = typeof isPlayerDealingDrugs === 'function'
        ? isPlayerDealingDrugs(state)
        : (state.totalDrugsSold > 0 || (state.inventory && Object.values(state.inventory).some(v => v > 0)));
      met = met && dealing;
    }

    if (met) {
      active.push({
        id: syn.id,
        name: syn.name,
        effect: syn.effect,
        description: syn.description,
      });
    }
  }

  return active;
}

// ============================================================
// UTILITY: Get total laundering capacity
// ============================================================
function getTotalLaunderingCapacity(state) {
  if (!state.businesses) return 0;
  let total = 0;
  const day = state.day || 1;
  for (const owned of state.businesses.owned) {
    if (owned.shutdownUntil && day < owned.shutdownUntil) continue;
    const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
    if (!def) continue;
    total += def.launderingCapacity * (1 + (owned.level - 1) * 0.2);
  }
  return Math.floor(total);
}

// ============================================================
// UTILITY: Get total daily business income (estimate)
// ============================================================
function getEstimatedDailyBusinessIncome(state) {
  if (!state.businesses) return 0;
  let total = 0;
  for (const owned of state.businesses.owned) {
    const def = BUSINESS_TYPES.find(b => b.id === owned.businessId);
    if (!def) continue;
    const avg = (def.dailyIncomeMin + def.dailyIncomeMax) / 2;
    const levelMult = 1 + (owned.level - 1) * 0.25;
    total += avg * levelMult;
  }
  return Math.floor(total);
}

// ============================================================
// UTILITY: Expire income modifiers
// ============================================================
function expireBusinessModifiers(state) {
  if (!state.businesses) return;
  const day = state.day || 1;
  for (const owned of state.businesses.owned) {
    if (owned._modifierExpiry && day >= owned._modifierExpiry) {
      owned.incomeModifier = 1;
      owned._modifierExpiry = 0;
    }
  }
}
