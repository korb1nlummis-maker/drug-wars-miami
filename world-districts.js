// ============================================================
// DRUG WARS: MIAMI VICE EDITION - World District System
// 52 districts across 9 global regions
// Miami's 14 districts are in miami-districts.js
// Each district follows the same schema as MIAMI_DISTRICTS entries
// ============================================================

const WORLD_DISTRICTS = {

  // ============================================================
  // CARIBBEAN (6 districts)
  // ============================================================
  caribbean: [
    {
      id: 'kingston', name: 'Kingston', emoji: '🇯🇲',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 6,
      priceModifier: 0.4,
      drugSpecialty: 'weed',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['yardie_massive'],
      startingCharacter: null,
      desc: 'Jamaica\'s capital and the birthplace of ganja culture. Cheap weed at source prices with established Caribbean shipping lanes.',
      flavorText: 'Reggae bass shakes the zinc fences. The whole island smells like opportunity.',
      properties: { cost: 0.4, income: 0.5 },
      laundering: false,
      importAccess: true,
      eventTypes: ['ganja_harvest', 'yardie_turf_war', 'port_seizure', 'dancehall_night'],
      region: 'caribbean',
    },
    {
      id: 'nassau', name: 'Nassau', emoji: '🇧🇸',
      incomeLevel: 'mid_high', policeIntensity: 'low_moderate', dangerLevel: 3,
      priceModifier: 0.8,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['bahamian_syndicate'],
      startingCharacter: null,
      desc: 'Offshore banking paradise and cocaine transit hub. Laundering is the real product here.',
      flavorText: 'Crystal water hides dirty money. Every banker knows which questions not to ask.',
      properties: { cost: 1.2, income: 1.4 },
      laundering: true,
      importAccess: true,
      eventTypes: ['offshore_audit', 'coast_guard_sweep', 'tourist_boom', 'banking_crackdown'],
      region: 'caribbean',
    },
    {
      id: 'port_au_prince', name: 'Port-au-Prince', emoji: '🇭🇹',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 8,
      priceModifier: 0.5,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['zoe_international'],
      startingCharacter: null,
      desc: 'Critical transit point for Colombian cocaine headed to Miami. Chaos means no rules, but also no safety.',
      flavorText: 'The airport is the only law. Everything else belongs to whoever holds it today.',
      properties: { cost: 0.3, income: 0.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['political_coup', 'un_patrol', 'port_blockade', 'gang_takeover'],
      region: 'caribbean',
    },
    {
      id: 'san_juan', name: 'San Juan', emoji: '🇵🇷',
      incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 5,
      priceModifier: 0.9,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'US territory with no customs barrier to the mainland. The perfect pipeline for cocaine heading north.',
      flavorText: 'No passport needed. Ship it to San Juan, fly it to JFK. The loophole that built empires.',
      properties: { cost: 0.8, income: 0.9 },
      laundering: false,
      importAccess: true,
      eventTypes: ['dea_operation', 'hurricane_disruption', 'federal_sweep', 'container_intercept'],
      region: 'caribbean',
    },
    {
      id: 'santo_domingo', name: 'Santo Domingo', emoji: '🇩🇴',
      incomeLevel: 'low_mid', policeIntensity: 'low_moderate', dangerLevel: 6,
      priceModifier: 0.7,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['dominican_don'],
      startingCharacter: null,
      desc: 'Growing ecstasy market with European connections through tourism. Dominican networks run deep in NYC.',
      flavorText: 'Bachata and business. The ferry to Puerto Rico carries more than passengers.',
      properties: { cost: 0.5, income: 0.6 },
      laundering: false,
      importAccess: true,
      eventTypes: ['tourist_season', 'police_corruption', 'ferry_interdiction', 'cartel_meeting'],
      region: 'caribbean',
    },
    {
      id: 'havana', name: 'Havana', emoji: '🇨🇺',
      incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 4,
      priceModifier: 0.6,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'Black market capital. State control means everything unofficial is underground — and profitable.',
      flavorText: 'Classic cars and clandestine deals. The revolution made everyone a hustler.',
      properties: { cost: 0.3, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['state_crackdown', 'black_market_boom', 'embargo_shift', 'smuggler_contact'],
      region: 'caribbean',
    },
  ],

  // ============================================================
  // SOUTH AMERICA (6 districts)
  // ============================================================
  south_america: [
    {
      id: 'medellin', name: 'Medell\u00edn', emoji: '🇨🇴',
      incomeLevel: 'mid', policeIntensity: 'high', dangerLevel: 9,
      priceModifier: 0.25,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['medellin_cartel'],
      startingCharacter: null,
      desc: 'The cocaine source. Cheapest product on the planet but the most dangerous place to operate. Cartel territory.',
      flavorText: 'Pablo\'s ghost still runs these streets. The powder is pure and the price is your life.',
      properties: { cost: 0.5, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['cartel_war', 'dea_raid', 'lab_explosion', 'sicario_hit', 'police_bribe'],
      region: 'south_america',
    },
    {
      id: 'bogota', name: 'Bogot\u00e1', emoji: '🇨🇴',
      incomeLevel: 'mid', policeIntensity: 'high', dangerLevel: 5,
      priceModifier: 0.5,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['medellin_cartel'],
      startingCharacter: null,
      desc: 'Colombia\'s capital. Political connections and government corruption make it the brains behind the operation.',
      flavorText: 'Suits and senators. The cocaine doesn\'t move without a signature from this city.',
      properties: { cost: 0.8, income: 0.7 },
      laundering: true,
      importAccess: true,
      eventTypes: ['political_scandal', 'embassy_pressure', 'extradition_threat', 'bribe_opportunity'],
      region: 'south_america',
    },
    {
      id: 'lima', name: 'Lima', emoji: '🇵🇪',
      incomeLevel: 'low_mid', policeIntensity: 'low_moderate', dangerLevel: 7,
      priceModifier: 0.3,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'Peru\'s coca paste production feeds Colombian labs. Raw material at rock-bottom prices.',
      flavorText: 'The paste comes down from the mountains. By the time it reaches the coast, it\'s already worth ten times more.',
      properties: { cost: 0.4, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['coca_eradication', 'military_patrol', 'paste_shipment', 'jungle_lab_raid'],
      region: 'south_america',
    },
    {
      id: 'sao_paulo', name: 'S\u00e3o Paulo', emoji: '🇧🇷',
      incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 8,
      priceModifier: 0.8,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['pcc_brazil'],
      startingCharacter: null,
      desc: 'Largest city in South America. Massive consumer market controlled by the PCC from inside prison walls.',
      flavorText: 'Twenty million people. The PCC runs the favelas, the prisons, and half the police.',
      properties: { cost: 0.7, income: 0.8 },
      laundering: false,
      importAccess: true,
      eventTypes: ['prison_riot', 'favela_raid', 'pcc_order', 'police_strike', 'arms_shipment'],
      region: 'south_america',
    },
    {
      id: 'buenos_aires', name: 'Buenos Aires', emoji: '🇦🇷',
      incomeLevel: 'mid', policeIntensity: 'low_moderate', dangerLevel: 3,
      priceModifier: 1.0,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'Argentina\'s capital offers sophisticated laundering through real estate and agriculture exports.',
      flavorText: 'Tango, steak, and shell companies. The peso crashes make dollar laundering very attractive.',
      properties: { cost: 0.9, income: 1.0 },
      laundering: true,
      importAccess: true,
      eventTypes: ['currency_crisis', 'customs_reform', 'political_upheaval', 'laundering_opportunity'],
      region: 'south_america',
    },
    {
      id: 'cali', name: 'Cali', emoji: '🇨🇴',
      incomeLevel: 'low_mid', policeIntensity: 'moderate', dangerLevel: 8,
      priceModifier: 0.3,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['cali_organization'],
      startingCharacter: null,
      desc: 'The Cali Organization runs a quieter, more businesslike cocaine empire. Smarter than Medell\u00edn, just as deadly.',
      flavorText: 'They call themselves businessmen. The product is the same. The spreadsheets are just better.',
      properties: { cost: 0.4, income: 0.5 },
      laundering: true,
      importAccess: true,
      eventTypes: ['cartel_summit', 'lab_raid', 'informant_leak', 'distribution_deal'],
      region: 'south_america',
    },
  ],

  // ============================================================
  // CENTRAL AMERICA (5 districts)
  // ============================================================
  central_america: [
    {
      id: 'guatemala_city', name: 'Guatemala City', emoji: '🇬🇹',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 8,
      priceModifier: 0.5,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['ms_13'],
      startingCharacter: null,
      desc: 'Critical transit point for cocaine moving north. MS-13 controls the streets and the smuggling corridors.',
      flavorText: 'The trucks never stop. Guatemala is a highway with guns.',
      properties: { cost: 0.3, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['convoy_ambush', 'military_checkpoint', 'gang_war', 'border_crackdown'],
      region: 'central_america',
    },
    {
      id: 'tegucigalpa', name: 'Tegucigalpa', emoji: '🇭🇳',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 9,
      priceModifier: 0.45,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['ms_13'],
      startingCharacter: null,
      desc: 'Honduras: murder capital of the world. Cocaine transit corridor with almost no functioning law enforcement.',
      flavorText: 'The police work for the cartels. The army works for the politicians. Nobody works for the people.',
      properties: { cost: 0.2, income: 0.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['military_coup', 'cartel_takeover', 'journalist_murder', 'airstrip_raid'],
      region: 'central_america',
    },
    {
      id: 'san_salvador', name: 'San Salvador', emoji: '🇸🇻',
      incomeLevel: 'low', policeIntensity: 'moderate', dangerLevel: 9,
      priceModifier: 0.5,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['ms_13'],
      startingCharacter: null,
      desc: 'MS-13 and Barrio 18 carve the city into territories. Every block is claimed. Transit or die.',
      flavorText: 'Tattoos tell you everything. Wrong street, wrong ink, wrong life.',
      properties: { cost: 0.2, income: 0.3 },
      laundering: false,
      importAccess: false,
      eventTypes: ['gang_truce', 'prison_massacre', 'extortion_racket', 'government_crackdown'],
      region: 'central_america',
    },
    {
      id: 'panama_city', name: 'Panama City', emoji: '🇵🇦',
      incomeLevel: 'mid_high', policeIntensity: 'moderate', dangerLevel: 4,
      priceModifier: 0.9,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'Banking secrecy and the Canal make Panama the ultimate laundering and logistics hub.',
      flavorText: 'The Canal moves containers. The banks move zeroes. Nobody asks where either came from.',
      properties: { cost: 1.3, income: 1.5 },
      laundering: true,
      importAccess: true,
      eventTypes: ['panama_papers', 'canal_inspection', 'banking_reform', 'shell_company_setup'],
      region: 'central_america',
    },
    {
      id: 'managua', name: 'Managua', emoji: '🇳🇮',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 7,
      priceModifier: 0.5,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['zetas_remnants'],
      startingCharacter: null,
      desc: 'Nicaragua is a transit corridor between South and Central America. Zetas remnants control the routes.',
      flavorText: 'Lake Nicaragua hides submarines. The coast hides everything else.',
      properties: { cost: 0.3, income: 0.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['submarine_intercept', 'political_crackdown', 'route_war', 'border_skirmish'],
      region: 'central_america',
    },
  ],

  // ============================================================
  // MEXICO (6 districts)
  // ============================================================
  mexico: [
    {
      id: 'tijuana', name: 'Tijuana', emoji: '🇲🇽',
      incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 9,
      priceModifier: 0.4,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sinaloa_cartel'],
      startingCharacter: null,
      desc: 'The busiest border crossing in the world. Meth and fentanyl pour north. Cash pours south.',
      flavorText: 'The wall is a speed bump. Tunnels, drones, catapults — they\'ve tried it all, and it all works.',
      properties: { cost: 0.4, income: 0.5 },
      laundering: false,
      importAccess: true,
      eventTypes: ['tunnel_discovery', 'border_surge', 'cartel_execution', 'military_deployment'],
      region: 'mexico',
    },
    {
      id: 'ciudad_juarez', name: 'Ciudad Ju\u00e1rez', emoji: '💀',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 10,
      priceModifier: 0.35,
      drugSpecialty: 'crack',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sinaloa_cartel'],
      startingCharacter: null,
      desc: 'The most dangerous city on earth. Cartel wars have left thousands dead. Maximum risk, maximum reward.',
      flavorText: 'Bodies in the desert. Bodies in the river. The living keep counting money.',
      properties: { cost: 0.2, income: 0.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['mass_grave_found', 'cartel_battle', 'police_massacre', 'border_shutdown'],
      region: 'mexico',
    },
    {
      id: 'culiacan', name: 'Culiac\u00e1n', emoji: '🇲🇽',
      incomeLevel: 'mid', policeIntensity: 'low', dangerLevel: 8,
      priceModifier: 0.3,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sinaloa_cartel'],
      startingCharacter: null,
      desc: 'Sinaloa Cartel headquarters. Meth and fentanyl production SOURCE. The cartel IS the government here.',
      flavorText: 'Narco-corridos play on every radio. The chapels are gold-plated. So are the AK-47s.',
      properties: { cost: 0.5, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['super_lab_raid', 'el_chapo_tribute', 'cartel_parade', 'military_siege'],
      region: 'mexico',
    },
    {
      id: 'mexico_city', name: 'Mexico City', emoji: '🇲🇽',
      incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 5,
      priceModifier: 0.6,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['cjng'],
      startingCharacter: null,
      desc: 'Political corruption hub. CJNG expanding influence through government connections and urban distribution.',
      flavorText: 'The president says the war is won. CJNG runs the city council. Both are lying.',
      properties: { cost: 0.7, income: 0.7 },
      laundering: true,
      importAccess: false,
      eventTypes: ['political_assassination', 'cjng_expansion', 'federal_raid', 'corruption_scandal'],
      region: 'mexico',
    },
    {
      id: 'guadalajara', name: 'Guadalajara', emoji: '🇲🇽',
      incomeLevel: 'mid', policeIntensity: 'low', dangerLevel: 8,
      priceModifier: 0.4,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['cjng'],
      startingCharacter: null,
      desc: 'CJNG\'s base of operations. Jalisco New Generation controls meth production and distribution across Mexico.',
      flavorText: 'Tequila country. The agave fields hide labs. The haciendas hide armies.',
      properties: { cost: 0.5, income: 0.5 },
      laundering: false,
      importAccess: false,
      eventTypes: ['cjng_recruitment', 'rival_ambush', 'lab_seizure', 'narco_blockade'],
      region: 'mexico',
    },
    {
      id: 'cancun', name: 'Canc\u00fan', emoji: '🏖️',
      incomeLevel: 'mid_high', policeIntensity: 'moderate', dangerLevel: 4,
      priceModifier: 0.7,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['los_chapitos'],
      startingCharacter: null,
      desc: 'Tourist paradise with a dark underbelly. Spring breakers and resort guests drive party drug demand.',
      flavorText: 'All-inclusive resorts, all-inclusive vices. The concierge knows a guy who knows a guy.',
      properties: { cost: 0.8, income: 0.9 },
      laundering: true,
      importAccess: true,
      eventTypes: ['spring_break_surge', 'tourist_overdose', 'resort_raid', 'beach_drop'],
      region: 'mexico',
    },
  ],

  // ============================================================
  // US CITIES (7 districts)
  // ============================================================
  us_cities: [
    {
      id: 'new_york', name: 'New York City', emoji: '🗽',
      incomeLevel: 'very_high', policeIntensity: 'very_high', dangerLevel: 5,
      priceModifier: 2.0,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['five_families'],
      startingCharacter: null,
      desc: 'The biggest drug market in America. Highest prices, highest margins, highest stakes. Five Families still pull strings.',
      flavorText: 'Eight million customers. The city that never sleeps never stops buying either.',
      properties: { cost: 2.5, income: 2.5 },
      laundering: true,
      importAccess: true,
      eventTypes: ['nypd_sting', 'mafia_sit_down', 'wall_street_party', 'port_seizure', 'federal_indictment'],
      region: 'us_cities',
    },
    {
      id: 'los_angeles', name: 'Los Angeles', emoji: '🌴',
      incomeLevel: 'high', policeIntensity: 'high', dangerLevel: 6,
      priceModifier: 1.6,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['bloods_crips'],
      startingCharacter: null,
      desc: 'West coast distribution hub. Mexican cartels push meth through LA gangs. Hollywood money launders through film.',
      flavorText: 'Sunset Boulevard and Skid Row. Same city, same product, different price tags.',
      properties: { cost: 2.0, income: 2.0 },
      laundering: true,
      importAccess: true,
      eventTypes: ['lapd_sweep', 'gang_truce', 'hollywood_party', 'cartel_shipment', 'drive_by'],
      region: 'us_cities',
    },
    {
      id: 'chicago', name: 'Chicago', emoji: '🏙️',
      incomeLevel: 'mid_high', policeIntensity: 'high', dangerLevel: 7,
      priceModifier: 1.5,
      drugSpecialty: 'heroin',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['vice_lords'],
      startingCharacter: null,
      desc: 'The crossroads of America. Every drug route passes through Chicago. Heroin epidemic drives demand.',
      flavorText: 'South Side, West Side — every side has a corner. The wind carries gunshots and money.',
      properties: { cost: 1.5, income: 1.6 },
      laundering: false,
      importAccess: false,
      eventTypes: ['gang_shooting', 'cpd_crackdown', 'opioid_crisis', 'turf_war', 'federal_task_force'],
      region: 'us_cities',
    },
    {
      id: 'detroit', name: 'Detroit', emoji: '🏚️',
      incomeLevel: 'low', policeIntensity: 'low_moderate', dangerLevel: 8,
      priceModifier: 1.2,
      drugSpecialty: 'crack',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['vice_lords'],
      startingCharacter: null,
      desc: 'Rust belt decay means cheap real estate and low police presence. Crack and meth dominate the market.',
      flavorText: 'Abandoned factories make perfect labs. Abandoned houses make perfect traps. Abandoned city, unlimited potential.',
      properties: { cost: 0.5, income: 0.6 },
      laundering: false,
      importAccess: false,
      eventTypes: ['meth_lab_explosion', 'abandoned_stash', 'gang_initiation', 'factory_deal'],
      region: 'us_cities',
    },
    {
      id: 'atlanta', name: 'Atlanta', emoji: '🍑',
      incomeLevel: 'mid_high', policeIntensity: 'moderate', dangerLevel: 5,
      priceModifier: 1.4,
      drugSpecialty: 'weed',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['bloods_crips'],
      startingCharacter: null,
      desc: 'Trap music capital. Weed and lean flow through the city. Hub for southeastern US distribution.',
      flavorText: 'The trap house is a genre and a business model. Atlanta wrote the manual.',
      properties: { cost: 1.2, income: 1.3 },
      laundering: true,
      importAccess: false,
      eventTypes: ['trap_house_raid', 'rap_concert', 'lean_epidemic', 'southern_connect'],
      region: 'us_cities',
    },
    {
      id: 'houston', name: 'Houston', emoji: '🤠',
      incomeLevel: 'mid_high', policeIntensity: 'moderate', dangerLevel: 5,
      priceModifier: 1.3,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sinaloa_cartel'],
      startingCharacter: null,
      desc: 'Gulf of Mexico access and proximity to the border make Houston a primary cocaine entry point.',
      flavorText: 'Oil money and drug money look the same in a Houston bank. Sinaloa has an office here.',
      properties: { cost: 1.1, income: 1.2 },
      laundering: true,
      importAccess: true,
      eventTypes: ['border_shipment', 'port_inspection', 'cartel_safe_house', 'dea_surveillance'],
      region: 'us_cities',
    },
    {
      id: 'las_vegas', name: 'Las Vegas', emoji: '🎰',
      incomeLevel: 'high', policeIntensity: 'moderate', dangerLevel: 3,
      priceModifier: 1.8,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['five_families'],
      startingCharacter: null,
      desc: 'Sin City. What happens here stays here, including the drug money. Party drugs at premium prices.',
      flavorText: 'The house always wins. So does the dealer — the one who isn\'t behind the table.',
      properties: { cost: 1.8, income: 2.0 },
      laundering: true,
      importAccess: false,
      eventTypes: ['casino_deal', 'vip_suite_party', 'convention_surge', 'fbi_sting', 'high_roller_client'],
      region: 'us_cities',
    },
  ],

  // ============================================================
  // WESTERN EUROPE (6 districts)
  // ============================================================
  western_europe: [
    {
      id: 'amsterdam', name: 'Amsterdam', emoji: '🇳🇱',
      incomeLevel: 'high', policeIntensity: 'low_moderate', dangerLevel: 2,
      priceModifier: 1.3,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['mocro_mafia'],
      startingCharacter: null,
      desc: 'Ecstasy production capital of Europe. Liberal drug policy and Mocro Mafia control make it a unique market.',
      flavorText: 'Red lights and lab coats. The coffeeshops are legal. Everything else is negotiable.',
      properties: { cost: 1.4, income: 1.5 },
      laundering: true,
      importAccess: true,
      eventTypes: ['lab_bust', 'mocro_hit', 'port_seizure', 'red_light_deal', 'coffeeshop_raid'],
      region: 'western_europe',
    },
    {
      id: 'london', name: 'London', emoji: '🇬🇧',
      incomeLevel: 'very_high', policeIntensity: 'high', dangerLevel: 4,
      priceModifier: 1.8,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['albanian_mafia'],
      startingCharacter: null,
      desc: 'Europe\'s cocaine capital. Albanian gangs control street-level distribution. City traders drive demand.',
      flavorText: 'Canary Wharf snorts more than the rest of England combined. County lines run like rail networks.',
      properties: { cost: 2.2, income: 2.3 },
      laundering: true,
      importAccess: true,
      eventTypes: ['county_lines_bust', 'knife_crime', 'financial_party', 'customs_seizure'],
      region: 'western_europe',
    },
    {
      id: 'marseille', name: 'Marseille', emoji: '🇫🇷',
      incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 6,
      priceModifier: 1.1,
      drugSpecialty: 'heroin',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['camorra'],
      startingCharacter: null,
      desc: 'France\'s port city with deep North African connections. The French Connection never really died.',
      flavorText: 'The port smells like fish and heroin. North Africa is closer than Paris, in every way.',
      properties: { cost: 0.9, income: 1.0 },
      laundering: false,
      importAccess: true,
      eventTypes: ['project_shootout', 'port_interdiction', 'north_african_connect', 'police_corruption'],
      region: 'western_europe',
    },
    {
      id: 'barcelona', name: 'Barcelona', emoji: '🇪🇸',
      incomeLevel: 'mid_high', policeIntensity: 'low_moderate', dangerLevel: 3,
      priceModifier: 1.4,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['camorra'],
      startingCharacter: null,
      desc: 'Party tourism capital. Beach clubs and nightlife create insatiable demand for ecstasy and cocaine.',
      flavorText: 'La Rambla by day, the clubs by night. Everyone is a tourist, everyone is a customer.',
      properties: { cost: 1.2, income: 1.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['beach_party_surge', 'tourist_overdose', 'port_seizure', 'nightclub_raid'],
      region: 'western_europe',
    },
    {
      id: 'hamburg', name: 'Hamburg', emoji: '🇩🇪',
      incomeLevel: 'high', policeIntensity: 'moderate', dangerLevel: 4,
      priceModifier: 1.3,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['albanian_mafia'],
      startingCharacter: null,
      desc: 'Europe\'s second-largest port and its red-light district fuel a thriving drug trade. Albanian networks dominate.',
      flavorText: 'The Reeperbahn never closes. Neither does business on the docks.',
      properties: { cost: 1.3, income: 1.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['port_container_bust', 'reeperbahn_raid', 'customs_operation', 'gang_turf_war'],
      region: 'western_europe',
    },
    {
      id: 'antwerp', name: 'Antwerp', emoji: '🇧🇪',
      incomeLevel: 'high', policeIntensity: 'moderate', dangerLevel: 3,
      priceModifier: 1.5,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['mocro_mafia'],
      startingCharacter: null,
      desc: 'Europe\'s cocaine gateway. More cocaine passes through Antwerp\'s port than any other in the continent. Diamond trade provides cover.',
      flavorText: 'Diamonds and cocaine — both measured in carats and kilos. The port never sleeps.',
      properties: { cost: 1.5, income: 1.6 },
      laundering: true,
      importAccess: true,
      eventTypes: ['mega_seizure', 'diamond_deal', 'port_corruption', 'mocro_assassination'],
      region: 'western_europe',
    },
  ],

  // ============================================================
  // EASTERN EUROPE (5 districts)
  // ============================================================
  eastern_europe: [
    {
      id: 'moscow', name: 'Moscow', emoji: '🇷🇺',
      incomeLevel: 'mid_high', policeIntensity: 'high', dangerLevel: 7,
      priceModifier: 1.0,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['russian_bratva'],
      startingCharacter: null,
      desc: 'Bratva headquarters. Weapons trafficking and amphetamines. Corruption is the operating system.',
      flavorText: 'The Kremlin has walls. The Bratva doesn\'t need them. Everyone knows who runs what.',
      properties: { cost: 1.2, income: 1.0 },
      laundering: true,
      importAccess: true,
      eventTypes: ['fsb_raid', 'bratva_summit', 'oligarch_deal', 'weapons_shipment'],
      region: 'eastern_europe',
    },
    {
      id: 'kyiv', name: 'Kyiv', emoji: '🇺🇦',
      incomeLevel: 'low_mid', policeIntensity: 'low_moderate', dangerLevel: 6,
      priceModifier: 0.8,
      drugSpecialty: 'ecstasy',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['chechen_network'],
      startingCharacter: null,
      desc: 'Transit corridor between East and West. Synthetic drugs and weapons flow through. Wartime chaos creates opportunity.',
      flavorText: 'War makes borders porous. What the soldiers don\'t carry, the smugglers do.',
      properties: { cost: 0.6, income: 0.6 },
      laundering: false,
      importAccess: true,
      eventTypes: ['border_chaos', 'arms_diversion', 'checkpoint_bribe', 'wartime_smuggling'],
      region: 'eastern_europe',
    },
    {
      id: 'prague', name: 'Prague', emoji: '🇨🇿',
      incomeLevel: 'mid', policeIntensity: 'low_moderate', dangerLevel: 3,
      priceModifier: 0.9,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['serbian_mafia'],
      startingCharacter: null,
      desc: 'Europe\'s pervitin (meth) capital. Tourist market for party drugs. Czech labs supply half the continent.',
      flavorText: 'Medieval streets, modern chemistry. The tourists buy beer. The smart ones buy something stronger.',
      properties: { cost: 0.8, income: 0.9 },
      laundering: false,
      importAccess: false,
      eventTypes: ['meth_lab_bust', 'tourist_sting', 'czech_police_raid', 'nightlife_boom'],
      region: 'eastern_europe',
    },
    {
      id: 'istanbul', name: 'Istanbul', emoji: '🇹🇷',
      incomeLevel: 'mid', policeIntensity: 'moderate', dangerLevel: 6,
      priceModifier: 0.7,
      drugSpecialty: 'heroin',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['chechen_network'],
      startingCharacter: null,
      desc: 'The crossroads of East and West. Afghan heroin flows through Istanbul to Europe. Two continents, one market.',
      flavorText: 'The Bosphorus divides continents. The bazaar unites them. Everything has a price in the Grand Bazaar.',
      properties: { cost: 0.8, income: 0.8 },
      laundering: true,
      importAccess: true,
      eventTypes: ['bazaar_deal', 'heroin_convoy', 'police_purge', 'refugee_route'],
      region: 'eastern_europe',
    },
    {
      id: 'belgrade', name: 'Belgrade', emoji: '🇷🇸',
      incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 5,
      priceModifier: 0.8,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['serbian_mafia'],
      startingCharacter: null,
      desc: 'Arms dealing and smuggling hub. Serbian mafia controls Balkan routes. Weapons and drugs travel together.',
      flavorText: 'The wars ended but the arms dealers didn\'t retire. They just found new customers.',
      properties: { cost: 0.6, income: 0.6 },
      laundering: false,
      importAccess: true,
      eventTypes: ['arms_deal', 'balkan_route_bust', 'smuggler_convoy', 'interpol_operation'],
      region: 'eastern_europe',
    },
  ],

  // ============================================================
  // WEST AFRICA (5 districts)
  // ============================================================
  west_africa: [
    {
      id: 'lagos', name: 'Lagos', emoji: '🇳🇬',
      incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 8,
      priceModifier: 0.6,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['lagos_syndicate'],
      startingCharacter: null,
      desc: 'West Africa\'s megacity. Cocaine transits from South America to Europe. Fraud networks provide laundering.',
      flavorText: 'Twenty million hustlers. The 419 boys went corporate. Now they move product, not emails.',
      properties: { cost: 0.4, income: 0.5 },
      laundering: true,
      importAccess: true,
      eventTypes: ['ndlea_raid', 'port_seizure', 'yahoo_boys_deal', 'political_protection'],
      region: 'west_africa',
    },
    {
      id: 'accra', name: 'Accra', emoji: '🇬🇭',
      incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 5,
      priceModifier: 0.7,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['lagos_syndicate'],
      startingCharacter: null,
      desc: 'Emerging cocaine transit route. Low enforcement and political instability make it an easy waypoint.',
      flavorText: 'Gold Coast, new gold. The fishermen know which boats carry fish and which carry fortune.',
      properties: { cost: 0.4, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['fishing_boat_drop', 'narcotic_board_sweep', 'political_shift', 'new_route_opened'],
      region: 'west_africa',
    },
    {
      id: 'dakar', name: 'Dakar', emoji: '🇸🇳',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 6,
      priceModifier: 0.65,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['guinea_partners'],
      startingCharacter: null,
      desc: 'Westernmost point of Africa. Atlantic shipping routes connect South America directly. Cocaine hub.',
      flavorText: 'The Atlantic is shorter than you think. Colombian boats dock here before dawn.',
      properties: { cost: 0.3, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['atlantic_seizure', 'diplomatic_pressure', 'coast_guard_patrol', 'cartel_partnership'],
      region: 'west_africa',
    },
    {
      id: 'conakry', name: 'Conakry', emoji: '🇬🇳',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 7,
      priceModifier: 0.5,
      drugSpecialty: 'cocaine',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['guinea_partners'],
      startingCharacter: null,
      desc: 'Guinea-Bissau and Guinea are full cartel partners. The military protects the shipments. A narco-state.',
      flavorText: 'The generals wear uniforms and move cocaine. It\'s not corruption when it\'s the whole system.',
      properties: { cost: 0.3, income: 0.3 },
      laundering: false,
      importAccess: true,
      eventTypes: ['military_escort', 'coup_attempt', 'dea_advisory', 'bulk_shipment'],
      region: 'west_africa',
    },
    {
      id: 'abidjan', name: 'Abidjan', emoji: '🇨🇮',
      incomeLevel: 'low_mid', policeIntensity: 'low', dangerLevel: 6,
      priceModifier: 0.7,
      drugSpecialty: 'heroin',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: [],
      startingCharacter: null,
      desc: 'Francophone connection links West Africa to Marseille and Paris. Heroin and cocaine transit point.',
      flavorText: 'French is the language of business. The business is moving product to Paris via the old colonial routes.',
      properties: { cost: 0.4, income: 0.5 },
      laundering: false,
      importAccess: true,
      eventTypes: ['french_connection', 'port_bust', 'political_crisis', 'smuggler_network'],
      region: 'west_africa',
    },
  ],

  // ============================================================
  // SOUTHEAST ASIA (6 districts)
  // ============================================================
  southeast_asia: [
    {
      id: 'bangkok', name: 'Bangkok', emoji: '🇹🇭',
      incomeLevel: 'mid', policeIntensity: 'low_moderate', dangerLevel: 5,
      priceModifier: 0.5,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sam_gor'],
      startingCharacter: null,
      desc: 'Everything is available in Bangkok. Meth, heroin, ecstasy — the Golden Triangle feeds the city.',
      flavorText: 'Khao San Road sells the fantasy. Soi Cowboy sells the reality. Both accept all currencies.',
      properties: { cost: 0.6, income: 0.7 },
      laundering: true,
      importAccess: true,
      eventTypes: ['police_bribe', 'tourist_bust', 'golden_triangle_shipment', 'temple_stash'],
      region: 'southeast_asia',
    },
    {
      id: 'shan_state', name: 'Shan State', emoji: '🇲🇲',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 10,
      priceModifier: 0.2,
      drugSpecialty: 'opium',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['shan_warlords'],
      startingCharacter: null,
      desc: 'The Golden Triangle SOURCE. Opium poppies and meth super-labs hidden in the jungle. Warlord territory.',
      flavorText: 'No government. No law. Just warlords, poppy fields, and more meth than the world can smoke.',
      properties: { cost: 0.2, income: 0.2 },
      laundering: false,
      importAccess: true,
      eventTypes: ['warlord_summit', 'jungle_lab_raid', 'military_offensive', 'poppy_harvest', 'arms_trade'],
      region: 'southeast_asia',
    },
    {
      id: 'ho_chi_minh', name: 'Ho Chi Minh City', emoji: '🇻🇳',
      incomeLevel: 'low_mid', policeIntensity: 'moderate', dangerLevel: 5,
      priceModifier: 0.4,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sam_gor'],
      startingCharacter: null,
      desc: 'Vietnam\'s economic engine and growing meth production hub. Sam Gor syndicate uses it as a distribution center.',
      flavorText: 'Motorbikes carry everything — people, food, and enough meth to supply a province.',
      properties: { cost: 0.5, income: 0.5 },
      laundering: false,
      importAccess: true,
      eventTypes: ['factory_raid', 'sam_gor_shipment', 'border_run', 'police_corruption'],
      region: 'southeast_asia',
    },
    {
      id: 'manila', name: 'Manila', emoji: '🇵🇭',
      incomeLevel: 'low', policeIntensity: 'very_high', dangerLevel: 7,
      priceModifier: 0.5,
      drugSpecialty: 'meth',
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['sam_gor'],
      startingCharacter: null,
      desc: 'Massive meth market with extreme enforcement. The drug war is real and deadly. High risk, high demand.',
      flavorText: 'Shabu is king. The police shoot first. The funerals never stop. Neither does the demand.',
      properties: { cost: 0.4, income: 0.4 },
      laundering: false,
      importAccess: true,
      eventTypes: ['drug_war_killing', 'shabu_lab_raid', 'police_execution', 'sam_gor_distribution'],
      region: 'southeast_asia',
    },
    {
      id: 'phnom_penh', name: 'Phnom Penh', emoji: '🇰🇭',
      incomeLevel: 'low', policeIntensity: 'low', dangerLevel: 6,
      priceModifier: 0.35,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['shan_warlords'],
      startingCharacter: null,
      desc: 'Anything goes in Cambodia. Minimal enforcement, maximum corruption. A playground for international criminals.',
      flavorText: 'The Mekong carries cargo. The government looks the other way. Everyone has a price — it\'s usually low.',
      properties: { cost: 0.3, income: 0.3 },
      laundering: true,
      importAccess: true,
      eventTypes: ['casino_laundering', 'mekong_shipment', 'government_bribe', 'expat_network'],
      region: 'southeast_asia',
    },
    {
      id: 'hong_kong', name: 'Hong Kong', emoji: '🇭🇰',
      incomeLevel: 'very_high', policeIntensity: 'high', dangerLevel: 4,
      priceModifier: 1.2,
      drugSpecialty: null,
      hasBank: true, hasBlackMarket: true, hasHospital: true, hasStash: true, hasLoanShark: true,
      gangPresence: ['triad_14k'],
      startingCharacter: null,
      desc: 'Triad territory and global financial hub. Laundering through real estate, casinos, and international banking.',
      flavorText: 'Neon towers and triad territories. The 14K have run these streets for seventy years.',
      properties: { cost: 2.0, income: 2.2 },
      laundering: true,
      importAccess: true,
      eventTypes: ['triad_ceremony', 'customs_crackdown', 'money_trail', 'underground_casino'],
      region: 'southeast_asia',
    },
  ],

};


// ============================================================
// INTEGRATION CODE
// ============================================================

/**
 * Loads world districts for a given region into the global LOCATIONS array
 * and populates TERRITORY_GANGS for those districts.
 * @param {string} regionId - The region key from WORLD_DISTRICTS
 * @param {object} [factions] - Optional factions lookup (WORLD_FACTIONS or similar)
 */
function _pushDistrictsToGlobals(regionId, factions) {
  const districts = WORLD_DISTRICTS[regionId];
  if (!districts || !Array.isArray(districts)) return;

  for (const d of districts) {
    // Avoid duplicates
    if (typeof LOCATIONS !== 'undefined' && Array.isArray(LOCATIONS)) {
      if (LOCATIONS.some(loc => loc.id === d.id)) continue;
      LOCATIONS.push({
        id: d.id,
        name: d.name,
        emoji: d.emoji,
        region: d.region,
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
        incomeLevel: d.incomeLevel,
        policeIntensity: d.policeIntensity,
        gangPresence: d.gangPresence,
        laundering: d.laundering,
        importAccess: d.importAccess,
        eventTypes: d.eventTypes,
      });
    }

    // Populate TERRITORY_GANGS
    if (typeof TERRITORY_GANGS !== 'undefined' && d.gangPresence && d.gangPresence.length > 0) {
      const factionId = d.gangPresence[0];
      let faction = null;

      // Try to find faction from various sources
      if (factions) {
        faction = Array.isArray(factions)
          ? factions.find(f => f.id === factionId)
          : factions[factionId] || null;
      }
      if (!faction && typeof WORLD_FACTIONS !== 'undefined') {
        if (Array.isArray(WORLD_FACTIONS)) {
          faction = WORLD_FACTIONS.find(f => f.id === factionId);
        } else {
          // WORLD_FACTIONS may be an object keyed by region
          for (const regionKey of Object.keys(WORLD_FACTIONS)) {
            const regionFactions = WORLD_FACTIONS[regionKey];
            if (Array.isArray(regionFactions)) {
              faction = regionFactions.find(f => f.id === factionId);
              if (faction) break;
            }
          }
        }
      }

      if (faction && !TERRITORY_GANGS[d.id]) {
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

/**
 * Dynamically loads world districts when regions are unlocked.
 * Call this when a player unlocks a new region.
 * @param {object} state - The gameState object
 * @param {string} [specificRegion] - Optional: load only a specific region
 */
function loadWorldDistricts(state, specificRegion) {
  if (!state) return;

  const unlockedRegions = (state.worldState && Array.isArray(state.worldState.unlockedRegions))
    ? state.worldState.unlockedRegions
    : (Array.isArray(state.unlockedRegions) ? state.unlockedRegions : []);

  if (specificRegion) {
    // Load a single specific region
    if (WORLD_DISTRICTS[specificRegion]) {
      _pushDistrictsToGlobals(specificRegion);
    }
    return;
  }

  // Load all unlocked regions (skip 'miami' — Miami districts are in miami-districts.js)
  for (const regionId of unlockedRegions) {
    if (regionId === 'miami') continue;
    if (WORLD_DISTRICTS[regionId]) {
      _pushDistrictsToGlobals(regionId);
    }
  }
}

/**
 * Get all districts for a given region
 * @param {string} regionId
 * @returns {Array}
 */
function getWorldDistrictsByRegion(regionId) {
  return WORLD_DISTRICTS[regionId] || [];
}

/**
 * Get a single world district by ID (searches all regions)
 * @param {string} districtId
 * @returns {object|null}
 */
function getWorldDistrictById(districtId) {
  for (const regionId of Object.keys(WORLD_DISTRICTS)) {
    const found = WORLD_DISTRICTS[regionId].find(d => d.id === districtId);
    if (found) return found;
  }
  return null;
}

/**
 * Get all world districts as a flat array
 * @returns {Array}
 */
function getAllWorldDistricts() {
  const all = [];
  for (const regionId of Object.keys(WORLD_DISTRICTS)) {
    all.push(...WORLD_DISTRICTS[regionId]);
  }
  return all;
}


// ============================================================
// AUTO-INITIALIZATION
// On script load, check for existing game state and push
// unlocked region districts into LOCATIONS / TERRITORY_GANGS
// ============================================================
(function _initWorldDistricts() {
  // Only run if WORLD_REGIONS is defined (world-regions.js loaded first)
  if (typeof WORLD_REGIONS === 'undefined') return;

  // Get game state if available
  const state = typeof gameState !== 'undefined' ? gameState : null;
  if (!state) return;

  const unlockedRegions = (state.worldState && Array.isArray(state.worldState.unlockedRegions))
    ? state.worldState.unlockedRegions
    : (Array.isArray(state.unlockedRegions) ? state.unlockedRegions : []);

  for (const regionId of unlockedRegions) {
    if (regionId === 'miami') continue;
    if (WORLD_DISTRICTS[regionId]) {
      _pushDistrictsToGlobals(regionId);
    }
  }
})();
