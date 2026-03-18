// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Miami District System
// 14 Campaign Districts (expanding to 22 in NG+)
// Each district: unique economics, demographics, gangs, police, strategy
// ============================================================

const MIAMI_DISTRICTS = [
  {
    id: 'liberty_city', name: 'Liberty City', emoji: '🏚️',
    incomeLevel: 'low', policeIntensity: 'high', dangerLevel: 7,
    priceModifier: 0.75, // Cheap area = lower prices
    drugSpecialty: 'crack',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['zoe_pound'],
    startingCharacter: 'corner_kid',
    desc: 'High demand, low supply. Poverty means cheap labor but low margins per unit. Heavy police due to crime stats.',
    flavorText: 'Sirens are the soundtrack. Every corner has a story — most of them end badly.',
    properties: { cost: 0.5, income: 0.6 }, // multipliers vs base
    laundering: false,
    importAccess: false,
    eventTypes: ['police_raid', 'gang_shootout', 'community_rally', 'block_party'],
    // NG+ expansion districts nearby
    expandsTo: ['north_liberty', 'model_city'],
  },
  {
    id: 'overtown', name: 'Overtown', emoji: '🏘️',
    incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 5,
    priceModifier: 0.80,
    drugSpecialty: 'weed',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['cartel_remnants'],
    startingCharacter: 'connected_kid',
    desc: 'Historic neighborhood, tight-knit community. Word travels fast: reputation matters here more than anywhere.',
    flavorText: 'Old heads remember when this was the center of everything. They still run it — quietly.',
    properties: { cost: 0.4, income: 0.5 },
    laundering: false,
    importAccess: false,
    eventTypes: ['gentrification_protest', 'og_meeting', 'dice_game', 'police_sweep'],
    expandsTo: ['spring_garden'],
  },
  {
    id: 'little_havana', name: 'Little Havana', emoji: '🇨🇺',
    incomeLevel: 'low_mid', policeIntensity: 'moderate', dangerLevel: 5,
    priceModifier: 0.85,
    drugSpecialty: 'cocaine',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['los_cubanos'],
    startingCharacter: null,
    desc: 'Cuban community with deep international connections. Gateway to Caribbean supply routes.',
    flavorText: 'Café Cubano, domino tables, and cocaine. Three pillars of Little Havana.',
    properties: { cost: 0.6, income: 0.7 },
    laundering: false,
    importAccess: true, // Caribbean connections
    eventTypes: ['cultural_festival', 'cartel_meeting', 'family_feud', 'cia_rumor'],
    expandsTo: ['east_little_havana'],
  },
  {
    id: 'wynwood', name: 'Wynwood', emoji: '🎨',
    incomeLevel: 'mid', policeIntensity: 'low', dangerLevel: 3,
    priceModifier: 1.1,
    drugSpecialty: 'ecstasy',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: [],
    startingCharacter: 'dropout',
    desc: 'Gentrifying arts district. College crowd and nightlife create high demand for party drugs.',
    flavorText: 'Murals hide stash spots. Gallery openings move more powder than paint.',
    properties: { cost: 0.8, income: 0.9 },
    laundering: true, // Art galleries as fronts
    importAccess: false,
    eventTypes: ['gallery_opening', 'art_walk', 'college_party', 'gentrification_push'],
    expandsTo: ['edgewater'],
  },
  {
    id: 'downtown', name: 'Downtown / Brickell', emoji: '🏦',
    incomeLevel: 'high', policeIntensity: 'very_high', dangerLevel: 2,
    priceModifier: 1.5,
    drugSpecialty: 'cocaine',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['eastern_bloc'],
    startingCharacter: 'cleanskin',
    desc: 'Financial district. Not for street dealing — critical for late-game money laundering.',
    flavorText: 'The real criminals wear suits. The buildings are the stash houses.',
    properties: { cost: 2.0, income: 1.8 },
    laundering: true, // Banks, law firms, shell companies
    importAccess: false,
    eventTypes: ['sec_investigation', 'corporate_party', 'bank_bust', 'political_fundraiser'],
    expandsTo: ['brickell_key'],
  },
  {
    id: 'south_beach', name: 'South Beach', emoji: '🌴',
    incomeLevel: 'high', policeIntensity: 'very_high', dangerLevel: 4,
    priceModifier: 1.8, // Highest margins
    drugSpecialty: 'ecstasy',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['eastern_bloc'],
    startingCharacter: 'hustler',
    desc: 'Tourist money, nightclub scene, celebrity culture. Highest per-unit margins in Miami.',
    flavorText: 'Neon and bass. Everyone\'s selling something. The trick is not getting caught.',
    properties: { cost: 1.8, income: 2.0 },
    laundering: true, // Nightclubs
    importAccess: false,
    eventTypes: ['vip_party', 'celebrity_sighting', 'tourist_season', 'beach_bust', 'club_raid'],
    expandsTo: ['mid_beach', 'fisher_island'],
  },
  {
    id: 'little_haiti', name: 'Little Haiti', emoji: '🇭🇹',
    incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 5,
    priceModifier: 0.75,
    drugSpecialty: 'weed',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['zoe_pound'],
    startingCharacter: 'immigrant',
    desc: 'Close-knit Haitian diaspora. Caribbean connections for smuggling routes. Cheap operating costs.',
    flavorText: 'Kreyòl on every corner. The spirits watch. Cross the community, they all know.',
    properties: { cost: 0.4, income: 0.5 },
    laundering: false,
    importAccess: true, // Haiti, Bahamas, Jamaica
    eventTypes: ['voodoo_ceremony', 'community_feast', 'boat_arrival', 'ice_raid'],
    expandsTo: ['lemon_city'],
  },
  {
    id: 'hialeah', name: 'Hialeah', emoji: '🏭',
    incomeLevel: 'low_mid', policeIntensity: 'moderate', dangerLevel: 4,
    priceModifier: 0.85,
    drugSpecialty: 'meth',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['los_cubanos'],
    startingCharacter: null,
    desc: 'Largest working-class Latino suburb. Steady volume demand. Warehouses for transport and storage.',
    flavorText: 'Warehouses, body shops, and cafecito. Everything happens behind roller doors.',
    properties: { cost: 0.6, income: 0.65 },
    laundering: false,
    importAccess: false,
    eventTypes: ['warehouse_raid', 'cockfight', 'street_market', 'factory_fire'],
    expandsTo: ['hialeah_gardens', 'miami_lakes'],
  },
  {
    id: 'opa_locka', name: 'Opa-Locka', emoji: '⚠️',
    incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 9,
    priceModifier: 0.70,
    drugSpecialty: 'crack',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['southern_boys'],
    startingCharacter: null,
    desc: 'High crime, minimal police investment. Easiest territory to claim but lowest margins.',
    flavorText: 'The Moorish domes mock a city that forgot it. Gunshots echo between minarets.',
    properties: { cost: 0.3, income: 0.4 },
    laundering: false,
    importAccess: false,
    eventTypes: ['drive_by', 'trap_house_raid', 'gang_initiation', 'abandoned_stash'],
    expandsTo: ['carol_city'],
  },
  {
    id: 'coral_gables', name: 'Coral Gables', emoji: '🏛️',
    incomeLevel: 'high', policeIntensity: 'low', dangerLevel: 1,
    priceModifier: 1.4,
    drugSpecialty: 'prescription',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: [],
    startingCharacter: null,
    desc: 'Wealthy residential. Not for dealing — valuable for laundering, political connections, safe houses.',
    flavorText: 'Banyan trees and blood money. The neighbors don\'t ask questions if you don\'t make noise.',
    properties: { cost: 1.5, income: 1.2 },
    laundering: true, // Upscale businesses
    importAccess: false,
    eventTypes: ['charity_gala', 'political_dinner', 'country_club_deal', 'estate_sale'],
    expandsTo: ['coconut_grove'],
  },
  {
    id: 'kendall', name: 'Kendall', emoji: '🏡',
    incomeLevel: 'mid', policeIntensity: 'low_moderate', dangerLevel: 3,
    priceModifier: 0.95,
    drugSpecialty: 'prescription',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['dixie_mafia'],
    startingCharacter: null,
    desc: 'Sprawling suburbs. Excellent supply chain corridor. Affordable warehouse space for bulk storage.',
    flavorText: 'Strip malls and storage units. The most boring place to run the most profitable routes.',
    properties: { cost: 0.7, income: 0.7 },
    laundering: false,
    importAccess: false,
    eventTypes: ['pill_mill_bust', 'suburban_party', 'trucking_deal', 'storage_auction'],
    expandsTo: ['homestead', 'pinecrest'],
  },
  {
    id: 'the_port', name: 'The Port / Docks', emoji: '🚢',
    incomeLevel: 'mid', policeIntensity: 'high', dangerLevel: 6,
    priceModifier: 0.90,
    drugSpecialty: null, // Not retail — import/export
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['port_authority'],
    startingCharacter: null,
    desc: 'Miami Port. Critical for import/export. Container shipping, boat access, warehouses.',
    flavorText: 'Containers from everywhere. Most hold furniture. Some hold the future of Miami\'s drug trade.',
    properties: { cost: 1.0, income: 0.8 },
    laundering: false,
    importAccess: true, // THE import hub
    eventTypes: ['customs_inspection', 'container_arrival', 'dock_strike', 'dea_sting'],
    expandsTo: ['virginia_key'],
  },
  {
    id: 'miami_gardens', name: 'Miami Gardens', emoji: '🏟️',
    incomeLevel: 'low_mid', policeIntensity: 'high', dangerLevel: 6,
    priceModifier: 0.85,
    drugSpecialty: 'weed',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: ['southern_boys'],
    startingCharacter: 'veteran',
    desc: 'Near Hard Rock Stadium. Event days create massive demand spikes. Territorial competition fierce.',
    flavorText: 'Game day is payday. 65,000 people wanting a good time. You provide.',
    properties: { cost: 0.6, income: 0.7 },
    laundering: false,
    importAccess: false,
    eventTypes: ['game_day', 'concert_event', 'tailgate_deal', 'rivalry_clash'],
    expandsTo: ['norwood'],
  },
  {
    id: 'the_keys', name: 'The Keys Corridor', emoji: '🌊',
    incomeLevel: 'mid_high', policeIntensity: 'moderate', dangerLevel: 5,
    priceModifier: 1.2,
    drugSpecialty: 'cocaine',
    hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
    gangPresence: [],
    startingCharacter: 'ex_con',
    desc: 'Highway 1 south toward the Keys. Speedboat access, remote drops, private airstrips.',
    flavorText: 'One road in, one road out. The ocean hides everything. Coast Guard is the only law.',
    properties: { cost: 1.0, income: 0.9 },
    laundering: false,
    importAccess: true, // Sea smuggling
    eventTypes: ['coast_guard_patrol', 'boat_drop', 'fishing_cover', 'key_party'],
    expandsTo: ['key_largo', 'islamorada'],
  },
];

// NG+ Expansion Districts (unlocked after campaign completion)
const NG_PLUS_DISTRICTS = [
  { id: 'north_liberty', name: 'North Liberty', emoji: '🏚️', parent: 'liberty_city', incomeLevel: 'low', policeIntensity: 'high', dangerLevel: 8, priceModifier: 0.70, drugSpecialty: 'crack', gangPresence: ['zoe_pound', 'southern_boys'] },
  { id: 'model_city', name: 'Model City', emoji: '🏗️', parent: 'liberty_city', incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 6, priceModifier: 0.75, drugSpecialty: 'weed', gangPresence: ['zoe_pound'] },
  { id: 'spring_garden', name: 'Spring Garden', emoji: '🌿', parent: 'overtown', incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 4, priceModifier: 0.90, drugSpecialty: 'weed', gangPresence: [] },
  { id: 'east_little_havana', name: 'East Little Havana', emoji: '🇨🇺', parent: 'little_havana', incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 5, priceModifier: 0.80, drugSpecialty: 'cocaine', gangPresence: ['los_cubanos'] },
  { id: 'edgewater', name: 'Edgewater', emoji: '🌇', parent: 'wynwood', incomeLevel: 'mid_high', policeIntensity: 'low', dangerLevel: 2, priceModifier: 1.2, drugSpecialty: 'cocaine', gangPresence: [] },
  { id: 'brickell_key', name: 'Brickell Key', emoji: '🏝️', parent: 'downtown', incomeLevel: 'high', policeIntensity: 'very_high', dangerLevel: 1, priceModifier: 1.6, drugSpecialty: 'cocaine', gangPresence: ['eastern_bloc'] },
  { id: 'mid_beach', name: 'Mid-Beach', emoji: '🏖️', parent: 'south_beach', incomeLevel: 'high', policeIntensity: 'high', dangerLevel: 3, priceModifier: 1.5, drugSpecialty: 'ecstasy', gangPresence: ['eastern_bloc'] },
  { id: 'fisher_island', name: 'Fisher Island', emoji: '💎', parent: 'south_beach', incomeLevel: 'very_high', policeIntensity: 'very_high', dangerLevel: 1, priceModifier: 2.5, drugSpecialty: 'cocaine', gangPresence: [] },
  { id: 'lemon_city', name: 'Lemon City', emoji: '🍋', parent: 'little_haiti', incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 5, priceModifier: 0.70, drugSpecialty: 'weed', gangPresence: ['zoe_pound'] },
  { id: 'hialeah_gardens', name: 'Hialeah Gardens', emoji: '🌺', parent: 'hialeah', incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 3, priceModifier: 0.80, drugSpecialty: 'meth', gangPresence: [] },
  { id: 'miami_lakes', name: 'Miami Lakes', emoji: '🌴', parent: 'hialeah', incomeLevel: 'mid', policeIntensity: 'low', dangerLevel: 2, priceModifier: 1.0, drugSpecialty: 'prescription', gangPresence: [] },
  { id: 'carol_city', name: 'Carol City', emoji: '🏘️', parent: 'opa_locka', incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 8, priceModifier: 0.65, drugSpecialty: 'crack', gangPresence: ['southern_boys'] },
  { id: 'coconut_grove', name: 'Coconut Grove', emoji: '🥥', parent: 'coral_gables', incomeLevel: 'high', policeIntensity: 'low', dangerLevel: 1, priceModifier: 1.3, drugSpecialty: 'cocaine', gangPresence: [] },
  { id: 'homestead', name: 'Homestead', emoji: '🌾', parent: 'kendall', incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 4, priceModifier: 0.75, drugSpecialty: 'meth', gangPresence: ['dixie_mafia'] },
  { id: 'pinecrest', name: 'Pinecrest', emoji: '🌲', parent: 'kendall', incomeLevel: 'high', policeIntensity: 'low', dangerLevel: 1, priceModifier: 1.2, drugSpecialty: 'prescription', gangPresence: [] },
  { id: 'virginia_key', name: 'Virginia Key', emoji: '🏝️', parent: 'the_port', incomeLevel: 'mid', policeIntensity: 'high', dangerLevel: 4, priceModifier: 1.0, drugSpecialty: null, gangPresence: ['port_authority'] },
  { id: 'key_largo', name: 'Key Largo', emoji: '🐠', parent: 'the_keys', incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 4, priceModifier: 1.1, drugSpecialty: 'cocaine', gangPresence: [] },
  { id: 'islamorada', name: 'Islamorada', emoji: '🎣', parent: 'the_keys', incomeLevel: 'mid_high', policeIntensity: 'low', dangerLevel: 3, priceModifier: 1.3, drugSpecialty: 'cocaine', gangPresence: [] },
  { id: 'norwood', name: 'Norwood', emoji: '🏠', parent: 'miami_gardens', incomeLevel: 'low_mid', policeIntensity: 'moderate', dangerLevel: 5, priceModifier: 0.80, drugSpecialty: 'weed', gangPresence: ['southern_boys'] },
];

// International Locations (unlocked progressively)
const INTERNATIONAL_LOCATIONS = [
  {
    id: 'colombia', name: 'Colombia', emoji: '🇨🇴',
    accessCondition: 'act3', // Available from Act 3
    primaryProduct: 'cocaine',
    priceModifier: 0.3, // 70% cheaper at source
    risk: 'extreme',
    desc: 'Source of the cocaine pipeline. Direct deals with cartels. Massive margins, massive risk.',
    unlockRequirement: 'Colombian Connection faction relationship >= Warm OR complete M3.4',
    ngPlusOnly: false,
  },
  {
    id: 'jamaica', name: 'Jamaica', emoji: '🇯🇲',
    accessCondition: 'act2',
    primaryProduct: 'weed',
    priceModifier: 0.4,
    risk: 'high',
    desc: 'Premium marijuana at source prices. Established Caribbean shipping routes.',
    unlockRequirement: 'Zoe Pound faction relationship >= Warm OR control Little Haiti',
    ngPlusOnly: false,
  },
  {
    id: 'haiti', name: 'Haiti', emoji: '🇭🇹',
    accessCondition: 'act2',
    primaryProduct: null, // Transit hub
    priceModifier: 0.5,
    risk: 'high',
    desc: 'Transit hub. Not a source but a critical waypoint for Caribbean smuggling routes.',
    unlockRequirement: 'Zoe Pound faction relationship >= Warm',
    ngPlusOnly: false,
  },
  {
    id: 'bahamas', name: 'The Bahamas', emoji: '🇧🇸',
    accessCondition: 'act3',
    primaryProduct: null, // Transit + offshore banking
    priceModifier: 0.8,
    risk: 'moderate',
    desc: 'Transit point and offshore banking. Laundering paradise with island drop points.',
    unlockRequirement: 'Port Authority faction relationship >= Neutral AND $100K+ cash',
    ngPlusOnly: false,
  },
  {
    id: 'mexico', name: 'Mexico', emoji: '🇲🇽',
    accessCondition: 'ngplus',
    primaryProduct: 'heroin',
    priceModifier: 0.25,
    risk: 'extreme',
    desc: 'NG+ only. Heroin, fentanyl, meth at cartel prices. Distribution partnerships, not in-country ops.',
    unlockRequirement: 'NG+ only. Complete campaign.',
    ngPlusOnly: true,
  },
  {
    id: 'eastern_europe', name: 'Eastern Europe', emoji: '🇺🇦',
    accessCondition: 'ngplus',
    primaryProduct: 'ecstasy',
    priceModifier: 0.35,
    risk: 'extreme',
    desc: 'NG+ only. Designer drugs and weapons at wholesale. Eastern Bloc connection required.',
    unlockRequirement: 'NG+ only. Eastern Bloc faction relationship >= Allied.',
    ngPlusOnly: true,
  },
];

// Helper: Get all available locations for current game state
function getAvailableDistricts(state) {
  let districts = [...MIAMI_DISTRICTS];
  // Add NG+ districts if applicable
  if (state && state.newGamePlus && state.newGamePlus.active) {
    for (const ngDist of NG_PLUS_DISTRICTS) {
      districts.push({
        ...ngDist,
        hasBank: true, hasBlackMarket: true, hasHospital: true,
        hasStash: true, hasLoanShark: true,
        desc: 'NG+ expansion district.',
        flavorText: '',
        properties: { cost: 0.5, income: 0.5 },
        laundering: false, importAccess: false,
        eventTypes: [],
      });
    }
  }
  return districts;
}

// Helper: Get district by ID
function getDistrictById(id) {
  return MIAMI_DISTRICTS.find(d => d.id === id) || NG_PLUS_DISTRICTS.find(d => d.id === id) || null;
}

// Helper: Get districts controlled by factions
function getFactionDistricts(factionId) {
  return MIAMI_DISTRICTS.filter(d => d.gangPresence && d.gangPresence.includes(factionId));
}

// Override LOCATIONS for backward compatibility
// This makes all existing code that references LOCATIONS work with the new districts
function getMiamiLocations() {
  return MIAMI_DISTRICTS.map(d => ({
    id: d.id,
    name: d.name,
    emoji: d.emoji,
    hasBank: d.hasBank,
    hasBlackMarket: d.hasBlackMarket,
    hasHospital: d.hasHospital,
    hasStash: d.hasStash,
    hasLoanShark: d.hasLoanShark,
    dangerLevel: d.dangerLevel,
    priceModifier: d.priceModifier,
    drugSpecialty: d.drugSpecialty,
    // Extended district data
    incomeLevel: d.incomeLevel,
    policeIntensity: d.policeIntensity,
    gangPresence: d.gangPresence,
    laundering: d.laundering,
    importAccess: d.importAccess,
    eventTypes: d.eventTypes,
    desc: d.desc,
    flavorText: d.flavorText,
  }));
}

// District event generation — called during waitDay
function generateDistrictEvent(state) {
  const district = getDistrictById(state.currentLocation);
  if (!district || !district.eventTypes || district.eventTypes.length === 0) return null;

  // 8% chance of district-specific event per day
  if (Math.random() > 0.08) return null;

  const eventType = district.eventTypes[Math.floor(Math.random() * district.eventTypes.length)];

  const DISTRICT_EVENTS = {
    // Liberty City
    police_raid: { msg: '🚔 Police raid sweeps through the block! Heat +5', heat: 5, cash: 0 },
    gang_shootout: { msg: '💥 Gang shootout erupts nearby! Danger is high.', heat: 3, cash: 0, danger: true },
    community_rally: { msg: '✊ Community rally against police. Heat drops as cops lay low.', heat: -3, cash: 0 },
    block_party: { msg: '🎵 Block party! Demand surges for party drugs.', heat: 0, cash: 0, demandBoost: ['ecstasy', 'weed'] },
    // Overtown
    gentrification_protest: { msg: '📢 Gentrification protest disrupts business.', heat: 0, cash: 0, salesPenalty: 0.5 },
    og_meeting: { msg: '🤝 OG meeting — connections open up.', heat: 0, cash: 0, repBoost: 2 },
    dice_game: { msg: '🎲 High-stakes dice game in the alley.', heat: 0, cash: 0, gamble: true },
    police_sweep: { msg: '🚔 Police sweep — lay low or get caught.', heat: 5, cash: 0 },
    // Little Havana
    cultural_festival: { msg: '🎉 Calle Ocho festival! Tourist money floods in.', heat: -2, cash: 0, demandBoost: ['cocaine', 'ecstasy'] },
    cartel_meeting: { msg: '🤫 Whispers of a cartel meeting downtown.', heat: 0, cash: 0, factionEvent: 'los_cubanos' },
    family_feud: { msg: '👊 Family feud between Cubano factions. Stay clear.', heat: 2, cash: 0 },
    cia_rumor: { msg: '🕵️ Rumors of CIA in the neighborhood. Federal heat +3.', heat: 3, cash: 0 },
    // Wynwood
    gallery_opening: { msg: '🖼️ Gallery opening brings wealthy clients. Premium prices!', heat: 0, cash: 0, priceBoost: 1.3 },
    art_walk: { msg: '🎨 Art Walk tonight. Tourist foot traffic increases demand.', heat: 0, cash: 0, demandBoost: ['ecstasy', 'cocaine', 'weed'] },
    college_party: { msg: '🎓 College rager nearby. Party drug demand spikes!', heat: 0, cash: 0, demandBoost: ['ecstasy', 'weed', 'lsd'] },
    gentrification_push: { msg: '🏗️ New condos going up. Property values rising.', heat: 0, cash: 0, propertyBoost: true },
    // Downtown/Brickell
    sec_investigation: { msg: '📋 SEC investigating local firms. Laundering heat +5.', heat: 5, cash: 0 },
    corporate_party: { msg: '🥂 Corporate party — cocaine demand surges among suits.', heat: 0, cash: 0, demandBoost: ['cocaine'] },
    bank_bust: { msg: '🏦 Bank busted for laundering! Tighter regulations.', heat: 3, cash: 0 },
    political_fundraiser: { msg: '🏛️ Political fundraiser. Political connections available.', heat: 0, cash: 0, politicsEvent: true },
    // South Beach
    vip_party: { msg: '🎶 VIP party on Ocean Drive! Celebrity clients, huge margins.', heat: 0, cash: 0, priceBoost: 1.5 },
    celebrity_sighting: { msg: '📸 Celebrity spotted at club. Everyone wants to party.', heat: 0, cash: 0, demandBoost: ['cocaine', 'ecstasy'] },
    tourist_season: { msg: '✈️ Peak tourist season! Demand across all party drugs.', heat: 0, cash: 0, demandBoost: ['cocaine', 'ecstasy', 'weed'] },
    beach_bust: { msg: '🚔 Undercover bust on the beach. Heat +4.', heat: 4, cash: 0 },
    club_raid: { msg: '🚨 Club raided! Eastern Bloc scrambling.', heat: 6, cash: 0, factionEvent: 'eastern_bloc' },
    // Little Haiti
    voodoo_ceremony: { msg: '🕯️ Ceremony in the neighborhood. Spirits are favorable.', heat: -2, cash: 0, repBoost: 1 },
    community_feast: { msg: '🍖 Community feast. Trust builds with locals.', heat: 0, cash: 0, repBoost: 2 },
    boat_arrival: { msg: '⛵ Boat arrives from Haiti. Caribbean goods available.', heat: 0, cash: 0, importEvent: true },
    ice_raid: { msg: '🚨 ICE raid! Community on lockdown. Business disrupted.', heat: 4, cash: 0, salesPenalty: 0.3 },
    // Hialeah
    warehouse_raid: { msg: '🏭 Warehouse raided by DEA. Stash at risk!', heat: 5, cash: 0 },
    cockfight: { msg: '🐓 Underground cockfight — chance to gamble and network.', heat: 1, cash: 0, gamble: true },
    street_market: { msg: '🏪 Busy street market. Good cover for transactions.', heat: -1, cash: 0 },
    factory_fire: { msg: '🔥 Factory fire disrupts the neighborhood.', heat: 0, cash: 0 },
    // Opa-Locka
    drive_by: { msg: '🔫 Drive-by shooting! Area destabilized.', heat: 3, cash: 0, danger: true },
    trap_house_raid: { msg: '🚔 Trap house raided two blocks away. Lay low.', heat: 4, cash: 0 },
    gang_initiation: { msg: '👊 Gang initiation happening. Southern Boys recruiting.', heat: 1, cash: 0, factionEvent: 'southern_boys' },
    abandoned_stash: { msg: '📦 Abandoned stash found in empty building!', heat: 0, cash: 2000 },
    // Coral Gables
    charity_gala: { msg: '🎩 Charity gala. Network with the wealthy elite.', heat: 0, cash: 0, politicsEvent: true },
    political_dinner: { msg: '🏛️ Political dinner. Corruption opportunities abound.', heat: 0, cash: 0, politicsEvent: true },
    country_club_deal: { msg: '⛳ Country club connection. Laundering opportunity.', heat: 0, cash: 0, launderBoost: true },
    estate_sale: { msg: '🏡 Estate sale. Discounted property available.', heat: 0, cash: 0, propertyBoost: true },
    // Kendall
    pill_mill_bust: { msg: '💊 Pill mill busted! Prescription drug supply disrupted.', heat: 3, cash: 0 },
    suburban_party: { msg: '🏠 Suburban house party. Prescription drug demand up.', heat: 0, cash: 0, demandBoost: ['prescription'] },
    trucking_deal: { msg: '🚛 Trucking contact offers bulk transport deal.', heat: 0, cash: 0, transportEvent: true },
    storage_auction: { msg: '📦 Storage unit auction. Could contain anything.', heat: 0, cash: 0 },
    // The Port
    customs_inspection: { msg: '🛃 Customs crackdown! Import operations paused.', heat: 5, cash: 0 },
    container_arrival: { msg: '📦 Container ship arrives. Import opportunity!', heat: 0, cash: 0, importEvent: true },
    dock_strike: { msg: '✊ Dock workers on strike. Port operations halted.', heat: 0, cash: 0, portClosed: true },
    dea_sting: { msg: '🚨 DEA sting operation at the docks. Federal heat +8!', heat: 8, cash: 0 },
    // Miami Gardens
    game_day: { msg: '🏈 Game day at Hard Rock! 65,000 people want a good time.', heat: 0, cash: 0, demandBoost: ['weed', 'cocaine', 'ecstasy'], priceBoost: 1.4 },
    concert_event: { msg: '🎤 Concert at the stadium. Massive demand surge!', heat: 0, cash: 0, demandBoost: ['ecstasy', 'weed', 'lsd'] },
    tailgate_deal: { msg: '🏈 Tailgate connections. Easy money in the parking lot.', heat: 0, cash: 500 },
    rivalry_clash: { msg: '⚔️ Rival crews clash near the stadium. Danger!', heat: 3, cash: 0, danger: true },
    // The Keys
    coast_guard_patrol: { msg: '🚤 Coast Guard patrol heavy today. Smuggling risky.', heat: 3, cash: 0 },
    boat_drop: { msg: '⛵ Night drop arranged. Product incoming by sea.', heat: 0, cash: 0, importEvent: true },
    fishing_cover: { msg: '🎣 Fishing charter provides perfect cover.', heat: -2, cash: 0 },
    key_party: { msg: '🎉 Key West party scene. Tourist money flowing.', heat: 0, cash: 0, demandBoost: ['cocaine', 'ecstasy', 'weed'] },
  };

  const event = DISTRICT_EVENTS[eventType];
  if (!event) return null;

  // Apply effects
  if (event.heat) state.heat = Math.max(0, Math.min(100, (state.heat || 0) + event.heat));
  if (event.cash) state.cash += event.cash;
  if (event.repBoost) state.reputation = Math.min(100, (state.reputation || 0) + event.repBoost);

  return { type: eventType, ...event };
}

// ============================================================
// BACKWARD COMPATIBILITY: Override LOCATIONS array
// This replaces the 21 world cities with 14 Miami districts
// while maintaining the same interface all existing code expects
// ============================================================
// We can't reassign const, so we splice+push instead
if (typeof LOCATIONS !== 'undefined' && Array.isArray(LOCATIONS)) {
  LOCATIONS.length = 0; // Clear existing locations
  for (const d of MIAMI_DISTRICTS) {
    LOCATIONS.push({
      id: d.id,
      name: d.name,
      emoji: d.emoji,
      region: 'Miami',
      mapX: 0, mapY: 0,
      desc: d.desc,
      hasBank: d.hasBank,
      hasLoanShark: d.hasLoanShark || false,
      hasHospital: d.hasHospital,
      hasBlackMarket: d.hasBlackMarket,
      hasStash: d.hasStash || true,
      dangerLevel: d.dangerLevel,
      priceModifier: d.priceModifier,
      drugSpecialty: d.drugSpecialty,
      flavor: d.flavorText || d.desc,
      // Extended Miami district data
      incomeLevel: d.incomeLevel,
      policeIntensity: d.policeIntensity,
      gangPresence: d.gangPresence,
      laundering: d.laundering,
      importAccess: d.importAccess,
      eventTypes: d.eventTypes,
    });
  }
}

// Also override TERRITORY_GANGS to use Miami faction data
if (typeof TERRITORY_GANGS !== 'undefined') {
  // Clear and repopulate with Miami faction data
  for (const key of Object.keys(TERRITORY_GANGS)) {
    delete TERRITORY_GANGS[key];
  }
  for (const d of MIAMI_DISTRICTS) {
    if (d.gangPresence && d.gangPresence.length > 0) {
      const faction = typeof MIAMI_FACTIONS !== 'undefined' ?
        MIAMI_FACTIONS.find(f => f.id === d.gangPresence[0]) : null;
      if (faction) {
        TERRITORY_GANGS[d.id] = {
          name: faction.name,
          strength: faction.strength,
          soldiers: faction.soldiers,
          dmg: faction.dmg,
          emoji: faction.emoji,
        };
      }
    }
  }
}
