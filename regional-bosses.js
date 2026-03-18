// regional-bosses.js — 52 Regional Bosses + Full Game Logic
// ============================================================

const REGIONAL_BOSSES = [
  // ==================== CARIBBEAN (6) ====================
  {
    id: 'boss_nassau', districtId: 'nassau', region: 'caribbean',
    name: 'Conch King', realName: 'Dexter Rolle', age: 55, emoji: '\u{1F451}',
    profile: 'Corrupt police chief brother. Runs product through fishing boats.',
    vulnerability: 'gambling_debt', vulnerabilityDesc: 'Heavy gambling debts make him desperate for cash.',
    bodyguards: 4, combat: 35, bribeCost: 25000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 500, priceDiscount: 0.05 },
    destabilizeDays: { min: 10, max: 20 },
    personality: 'greedy',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_kingston', districtId: 'kingston', region: 'caribbean',
    name: 'Don Dadda', realName: 'Marcus Campbell', age: 70, emoji: '\u{1F934}',
    profile: 'Shower Posse OG. Controls the docks with iron fist.',
    vulnerability: 'aging_health', vulnerabilityDesc: 'Aging body and failing health make him vulnerable to prolonged conflict.',
    bodyguards: 8, combat: 55, bribeCost: 60000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.08 },
    destabilizeDays: { min: 15, max: 30 },
    personality: 'ruthless',
    drugSpecialty: 'marijuana',
  },
  {
    id: 'boss_havana', districtId: 'havana', region: 'caribbean',
    name: 'El Diplomatico', realName: 'Raul Fuentes', age: 60, emoji: '\u{1F3A9}',
    profile: 'Government-connected operator. Uses state shipping lines for transport.',
    vulnerability: 'mistress_informant', vulnerabilityDesc: 'His mistress is secretly informing to the DEA.',
    bodyguards: 6, combat: 40, bribeCost: 45000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'diplomatic',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_san_juan', districtId: 'san_juan', region: 'caribbean',
    name: 'La Princesa', realName: 'Isabella Colon', age: 45, emoji: '\u{1F478}',
    profile: 'Former beauty queen turned narco. Distributes through nightclub empire.',
    vulnerability: 'vanity', vulnerabilityDesc: 'Extreme vanity leads to public exposure and predictable routines.',
    bodyguards: 3, combat: 30, bribeCost: 20000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 450, priceDiscount: 0.04 },
    destabilizeDays: { min: 8, max: 18 },
    personality: 'charismatic',
    drugSpecialty: 'ecstasy',
  },
  {
    id: 'boss_port_au_prince', districtId: 'port_au_prince', region: 'caribbean',
    name: 'Papa Midnight', realName: 'Jean-Luc Devereaux', age: 65, emoji: '\u{1F480}',
    profile: 'Voodoo priest and crime lord. Controls major transit hub.',
    vulnerability: 'superstitious', vulnerabilityDesc: 'Deep superstitions can be exploited with staged omens and curses.',
    bodyguards: 10, combat: 60, bribeCost: 55000,
    assassinDifficulty: 5,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.07 },
    destabilizeDays: { min: 18, max: 35 },
    personality: 'mystical',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_santo_domingo', districtId: 'santo_domingo', region: 'caribbean',
    name: 'El Toro', realName: 'Hector Jimenez', age: 50, emoji: '\u{1F402}',
    profile: 'Ex-boxer controlling transit routes through brute force.',
    vulnerability: 'short_temper', vulnerabilityDesc: 'Explosive temper causes him to make rash, exploitable decisions.',
    bodyguards: 5, combat: 50, bribeCost: 30000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 600, priceDiscount: 0.05 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'aggressive',
    drugSpecialty: 'cocaine',
  },

  // ==================== SOUTH AMERICA (6) ====================
  {
    id: 'boss_bogota', districtId: 'bogota', region: 'south_america',
    name: 'El Patron', realName: 'Carlos Mendoza', age: 58, emoji: '\u{1F3DB}\uFE0F',
    profile: 'Old-school drug baron with a private army and vast coca plantations.',
    vulnerability: 'succession_war', vulnerabilityDesc: 'His two sons are waging a bitter war over who inherits the empire.',
    bodyguards: 8, combat: 65, bribeCost: 80000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 1200, priceDiscount: 0.10 },
    destabilizeDays: { min: 20, max: 40 },
    personality: 'patriarchal',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_medellin', districtId: 'medellin', region: 'south_america',
    name: 'La Viuda', realName: 'Elena Restrepo', age: 42, emoji: '\u{1F5A4}',
    profile: 'Took over the operation after her husband was assassinated. Ruthless survivor.',
    vulnerability: 'protecting_children', vulnerabilityDesc: 'Will sacrifice strategic advantage to keep her children safe.',
    bodyguards: 6, combat: 50, bribeCost: 55000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1000, priceDiscount: 0.08 },
    destabilizeDays: { min: 15, max: 30 },
    personality: 'protective',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_lima', districtId: 'lima', region: 'south_america',
    name: 'El Ingeniero', realName: 'Julio Paredes', age: 50, emoji: '\u{1F4D0}',
    profile: 'Logistics genius who optimized supply chains across the Andes.',
    vulnerability: 'obsessive_records', vulnerabilityDesc: 'Obsessive record-keeping means all evidence is documented somewhere.',
    bodyguards: 5, combat: 40, bribeCost: 40000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.07 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'methodical',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_sao_paulo', districtId: 'sao_paulo', region: 'south_america',
    name: 'O Rei', realName: 'Marcos Silva', age: 38, emoji: '\u{1F451}',
    profile: 'PCC faction leader running operations from inside prison walls.',
    vulnerability: 'depends_on_lieutenants', vulnerabilityDesc: 'Running things from prison means he depends entirely on outside lieutenants.',
    bodyguards: 7, combat: 55, bribeCost: 50000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 1100, priceDiscount: 0.09 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'calculating',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_buenos_aires', districtId: 'buenos_aires', region: 'south_america',
    name: 'El Gaucho', realName: 'Santiago Moreno', age: 55, emoji: '\u{1F911}',
    profile: 'Money laundering specialist with extensive legitimate business fronts.',
    vulnerability: 'flashy_lifestyle', vulnerabilityDesc: 'Flashy lifestyle draws unwanted attention from tax authorities and press.',
    bodyguards: 4, combat: 30, bribeCost: 45000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 20 },
    personality: 'greedy',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_caracas', districtId: 'caracas', region: 'south_america',
    name: 'La Sombra Roja', realName: 'Diego Alvarez', age: 47, emoji: '\u{1F534}',
    profile: 'Ex-military intelligence officer turned narco-trafficker.',
    vulnerability: 'political_enemies', vulnerabilityDesc: 'Powerful political enemies would love to see him fall.',
    bodyguards: 7, combat: 60, bribeCost: 50000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 850, priceDiscount: 0.07 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'paranoid',
    drugSpecialty: 'cocaine',
  },

  // ==================== MEXICO (6) ====================
  {
    id: 'boss_mexico_city', districtId: 'mexico_city', region: 'mexico',
    name: 'El Arquitecto', realName: 'Ramon Gutierrez', age: 52, emoji: '\u{1F3D7}\uFE0F',
    profile: 'Political fixer who built the cartel-government pipeline.',
    vulnerability: 'losing_patron', vulnerabilityDesc: 'His political patron is losing power, leaving him exposed.',
    bodyguards: 6, combat: 45, bribeCost: 70000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1000, priceDiscount: 0.08 },
    destabilizeDays: { min: 15, max: 30 },
    personality: 'strategic',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_guadalajara', districtId: 'guadalajara', region: 'mexico',
    name: 'El Mencho Junior', realName: 'Adrian Castellanos', age: 29, emoji: '\u{1F525}',
    profile: 'CJNG heir apparent, eager to prove himself through bloodshed.',
    vulnerability: 'impulsive', vulnerabilityDesc: 'Youth and impulsiveness lead to predictable overreactions.',
    bodyguards: 8, combat: 60, bribeCost: 65000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 1100, priceDiscount: 0.09 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'aggressive',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_tijuana', districtId: 'tijuana', region: 'mexico',
    name: 'La Frontera', realName: 'Maria Sanchez', age: 44, emoji: '\u{1F6A7}',
    profile: 'Queen of the border tunnels. Controls the most valuable crossing points.',
    vulnerability: 'us_partner_flip', vulnerabilityDesc: 'Her US-side partner is being pressured by the FBI and might flip.',
    bodyguards: 5, combat: 45, bribeCost: 55000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 950, priceDiscount: 0.08 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'cautious',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_ciudad_juarez', districtId: 'ciudad_juarez', region: 'mexico',
    name: 'El Carnicero', realName: 'Luis Ortega', age: 48, emoji: '\u{1FA93}',
    profile: 'Rules through extreme violence. Known for public displays of brutality.',
    vulnerability: 'everyone_wants_him_dead', vulnerabilityDesc: 'So many enemies that alliances against him form easily.',
    bodyguards: 9, combat: 70, bribeCost: 40000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.07 },
    destabilizeDays: { min: 8, max: 18 },
    personality: 'psychotic',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_sinaloa', districtId: 'sinaloa', region: 'mexico',
    name: 'El Chapo Legacy', realName: 'Ismael Torres', age: 35, emoji: '\u{1F3F0}',
    profile: 'Claims succession from the old Sinaloa cartel leadership.',
    vulnerability: 'disputed_legitimacy', vulnerabilityDesc: 'Rivals constantly dispute his claim to the throne, weakening his base.',
    bodyguards: 7, combat: 55, bribeCost: 60000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1050, priceDiscount: 0.09 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'ambitious',
    drugSpecialty: 'fentanyl',
  },
  {
    id: 'boss_cancun', districtId: 'cancun', region: 'mexico',
    name: 'El Turista', realName: 'Pablo Reyes', age: 40, emoji: '\u{1F3D6}\uFE0F',
    profile: 'Operates behind the resort industry. Tourists are both cover and customers.',
    vulnerability: 'tourist_incident', vulnerabilityDesc: 'A single dead tourist brings massive international heat.',
    bodyguards: 4, combat: 35, bribeCost: 35000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 750, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 20 },
    personality: 'smooth',
    drugSpecialty: 'cocaine',
  },

  // ==================== US CITIES (7) ====================
  {
    id: 'boss_new_york', districtId: 'new_york', region: 'us',
    name: 'Don Vittorio', realName: 'Salvatore Bianchi', age: 68, emoji: '\u{1F454}',
    profile: 'Old Cosa Nostra boss clinging to power in a changing underworld.',
    vulnerability: 'crumbling_org', vulnerabilityDesc: 'Aging organization is crumbling, with soldiers flipping to the feds.',
    bodyguards: 6, combat: 40, bribeCost: 75000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1100, priceDiscount: 0.08 },
    destabilizeDays: { min: 15, max: 30 },
    personality: 'traditional',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_los_angeles', districtId: 'los_angeles', region: 'us',
    name: 'Lil Sureno', realName: 'Hector Garza', age: 31, emoji: '\u{1F1F2}\u{1F1FD}',
    profile: 'MS-13 shot-caller running West Coast distribution.',
    vulnerability: 'fbi_mole', vulnerabilityDesc: 'An FBI mole in his inner circle is feeding intel to the feds.',
    bodyguards: 7, combat: 55, bribeCost: 50000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1000, priceDiscount: 0.08 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'ruthless',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_chicago', districtId: 'chicago', region: 'us',
    name: 'GD King', realName: "Terrence 'T-Bone' Jackson", age: 36, emoji: '\u{1F451}',
    profile: 'Gangster Disciples leader controlling South Side distribution.',
    vulnerability: 'internal_politics', vulnerabilityDesc: 'Constant internal politics and faction wars drain his resources.',
    bodyguards: 6, combat: 50, bribeCost: 45000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.07 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'political',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_detroit', districtId: 'detroit', region: 'us',
    name: 'Motor City Mike', realName: 'Michael Kowalski', age: 45, emoji: '\u{1F48A}',
    profile: 'Controls the Midwest pill pipeline from Detroit\'s abandoned industrial zones.',
    vulnerability: 'own_addiction', vulnerabilityDesc: 'His own addiction makes him erratic and unreliable.',
    bodyguards: 4, combat: 35, bribeCost: 30000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 650, priceDiscount: 0.05 },
    destabilizeDays: { min: 8, max: 18 },
    personality: 'erratic',
    drugSpecialty: 'pills',
  },
  {
    id: 'boss_houston', districtId: 'houston', region: 'us',
    name: 'H-Town Heavy', realName: 'DeAndre Williams', age: 33, emoji: '\u{2B50}',
    profile: 'Gulf Coast distribution kingpin with sprawling Texas network.',
    vulnerability: 'public_life', vulnerabilityDesc: 'Very public personal life makes his movements predictable.',
    bodyguards: 5, combat: 45, bribeCost: 40000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'flashy',
    drugSpecialty: 'lean',
  },
  {
    id: 'boss_atlanta', districtId: 'atlanta', region: 'us',
    name: 'ATL Queen', realName: 'Keisha Monroe', age: 39, emoji: '\u{1F4BF}',
    profile: 'Uses trap music industry as cover for massive distribution network.',
    vulnerability: 'loyalty_neighborhood', vulnerabilityDesc: 'Loyalty to her old neighborhood makes her predictable and exposed.',
    bodyguards: 5, combat: 40, bribeCost: 35000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 750, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 20 },
    personality: 'loyal',
    drugSpecialty: 'lean',
  },
  {
    id: 'boss_new_orleans', districtId: 'new_orleans', region: 'us',
    name: 'Voodoo King', realName: 'Antoine Beaumont', age: 57, emoji: '\u{1F3AD}',
    profile: 'Old Creole family with roots in organized crime going back generations.',
    vulnerability: 'hurricane_disruptions', vulnerabilityDesc: 'Hurricane season regularly disrupts his supply lines and infrastructure.',
    bodyguards: 5, combat: 40, bribeCost: 35000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'mystical',
    drugSpecialty: 'heroin',
  },

  // ==================== WESTERN EUROPE (6) ====================
  {
    id: 'boss_london', districtId: 'london', region: 'western_europe',
    name: 'The Accountant', realName: 'Nigel Crawford', age: 50, emoji: '\u{1F4BC}',
    profile: 'Operates from the City financial district. Launders billions through shell companies.',
    vulnerability: 'money_trail', vulnerabilityDesc: 'His meticulous financial operations leave a followable money trail.',
    bodyguards: 4, combat: 25, bribeCost: 90000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1300, priceDiscount: 0.10 },
    destabilizeDays: { min: 18, max: 35 },
    personality: 'methodical',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_amsterdam', districtId: 'amsterdam', region: 'western_europe',
    name: 'De Koning', realName: 'Pieter van der Berg', age: 43, emoji: '\u{1F451}',
    profile: 'Runs ecstasy super-labs producing millions of pills for European markets.',
    vulnerability: 'compromised_phones', vulnerabilityDesc: 'His encrypted phone network has been compromised by Dutch police.',
    bodyguards: 5, combat: 40, bribeCost: 60000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 1000, priceDiscount: 0.08 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'innovative',
    drugSpecialty: 'ecstasy',
  },
  {
    id: 'boss_paris', districtId: 'paris', region: 'western_europe',
    name: 'Le Fantome', realName: 'Amadou Diallo', age: 38, emoji: '\u{1F47B}',
    profile: 'Ghost of the banlieues. Built a heroin empire from the housing projects.',
    vulnerability: 'police_targeting', vulnerabilityDesc: 'French police have made him their number one target.',
    bodyguards: 6, combat: 50, bribeCost: 55000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 950, priceDiscount: 0.08 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'elusive',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_barcelona', districtId: 'barcelona', region: 'western_europe',
    name: 'El Catalan', realName: 'Jordi Puig', age: 46, emoji: '\u{2693}',
    profile: 'Controls Mediterranean import routes through Barcelona port.',
    vulnerability: 'independence_politics', vulnerabilityDesc: 'Deep involvement in independence politics creates exploitable divisions.',
    bodyguards: 5, combat: 40, bribeCost: 45000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 850, priceDiscount: 0.07 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'ideological',
    drugSpecialty: 'hashish',
  },
  {
    id: 'boss_hamburg', districtId: 'hamburg', region: 'western_europe',
    name: 'Der Turke', realName: 'Mehmet Yilmaz', age: 41, emoji: '\u{1F6A2}',
    profile: 'Controls Hamburg port and the Northern European distribution corridor.',
    vulnerability: 'interpol_watching', vulnerabilityDesc: 'Interpol has him under constant surveillance, limiting his movements.',
    bodyguards: 5, combat: 45, bribeCost: 50000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.07 },
    destabilizeDays: { min: 14, max: 26 },
    personality: 'cautious',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_marseille', districtId: 'marseille', region: 'western_europe',
    name: 'Le Vieux', realName: 'Marcel Dupont', age: 62, emoji: '\u{1F3F4}\u200D\u2620\uFE0F',
    profile: 'Descendant of the original French Connection. Old guard holding on.',
    vulnerability: 'younger_crew', vulnerabilityDesc: 'Younger crew members want to modernize and are plotting to replace him.',
    bodyguards: 5, combat: 35, bribeCost: 45000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.07 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'traditional',
    drugSpecialty: 'heroin',
  },

  // ==================== EASTERN EUROPE (6) ====================
  {
    id: 'boss_moscow', districtId: 'moscow', region: 'eastern_europe',
    name: 'Vor v Zakone', realName: 'Alexei Petrov', age: 55, emoji: '\u{2B50}',
    profile: 'Bratva boss operating under the Kremlin\'s watchful eye.',
    vulnerability: 'kremlin_control', vulnerabilityDesc: 'The Kremlin controls him — one wrong move and the state crushes him.',
    bodyguards: 8, combat: 65, bribeCost: 85000,
    assassinDifficulty: 5,
    controlBonus: { dailyIncome: 1200, priceDiscount: 0.09 },
    destabilizeDays: { min: 20, max: 40 },
    personality: 'ruthless',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_prague', districtId: 'prague', region: 'eastern_europe',
    name: 'The Czech', realName: 'Miroslav Novak', age: 37, emoji: '\u{1F9EA}',
    profile: 'Synthetic drug innovator running cutting-edge labs across Central Europe.',
    vulnerability: 'paranoia', vulnerabilityDesc: 'Extreme paranoia makes him isolate himself, cutting off intel.',
    bodyguards: 4, combat: 35, bribeCost: 35000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 750, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'paranoid',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_belgrade', districtId: 'belgrade', region: 'eastern_europe',
    name: 'The General', realName: 'Dragan Kovac', age: 52, emoji: '\u{1F396}\uFE0F',
    profile: 'Controls the Balkan route — the superhighway for drugs into Europe.',
    vulnerability: 'war_crimes_past', vulnerabilityDesc: 'War crimes past means The Hague is always one witness away.',
    bodyguards: 7, combat: 60, bribeCost: 55000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 1000, priceDiscount: 0.08 },
    destabilizeDays: { min: 16, max: 32 },
    personality: 'military',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_odessa', districtId: 'odessa', region: 'eastern_europe',
    name: 'Odessa Mama', realName: 'Yana Kovalenko', age: 44, emoji: '\u{1F30A}',
    profile: 'Black Sea smuggling queen operating in active conflict zone.',
    vulnerability: 'conflict_zone', vulnerabilityDesc: 'Operating in an active conflict zone makes logistics unpredictable.',
    bodyguards: 6, combat: 50, bribeCost: 40000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.07 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'adaptable',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_bucharest', districtId: 'bucharest', region: 'eastern_europe',
    name: 'The Romanian', realName: 'Ion Popescu', age: 49, emoji: '\u{1F987}',
    profile: 'EU trafficking specialist exploiting open borders for distribution.',
    vulnerability: 'europol_closing_in', vulnerabilityDesc: 'Europol is closing in with a multi-country investigation.',
    bodyguards: 5, combat: 40, bribeCost: 38000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 750, priceDiscount: 0.06 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'cunning',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_istanbul', districtId: 'istanbul', region: 'eastern_europe',
    name: 'The Bridge', realName: 'Kemal Arslan', age: 53, emoji: '\u{1F309}',
    profile: 'Straddles Europe and Asia. The ultimate transit operator.',
    vulnerability: 'kurdish_conflict', vulnerabilityDesc: 'Kurdish conflict creates unpredictable territorial disruptions.',
    bodyguards: 7, combat: 55, bribeCost: 60000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 1050, priceDiscount: 0.08 },
    destabilizeDays: { min: 15, max: 30 },
    personality: 'diplomatic',
    drugSpecialty: 'heroin',
  },

  // ==================== WEST AFRICA (5) ====================
  {
    id: 'boss_lagos', districtId: 'lagos', region: 'west_africa',
    name: 'Oga', realName: 'Chukwuma Obi', age: 47, emoji: '\u{1F406}',
    profile: 'Nigerian syndicate boss controlling West African cocaine transit.',
    vulnerability: 'ethnic_rivalry', vulnerabilityDesc: 'Deep ethnic rivalries fragment his organization from within.',
    bodyguards: 7, combat: 50, bribeCost: 45000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 850, priceDiscount: 0.07 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'commanding',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_accra', districtId: 'accra', region: 'west_africa',
    name: 'The Gold Coast', realName: 'Emmanuel Mensah', age: 39, emoji: '\u{1F4B0}',
    profile: 'Uses gold mining operations as transit cover for cocaine shipments.',
    vulnerability: 'lost_patron', vulnerabilityDesc: 'His political patron lost power, leaving him without state protection.',
    bodyguards: 4, combat: 35, bribeCost: 30000,
    assassinDifficulty: 2,
    controlBonus: { dailyIncome: 600, priceDiscount: 0.05 },
    destabilizeDays: { min: 10, max: 20 },
    personality: 'opportunistic',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_dakar', districtId: 'dakar', region: 'west_africa',
    name: 'Le Roi', realName: 'Ousmane Diop', age: 51, emoji: '\u{1F1F8}\u{1F1F3}',
    profile: 'Controls Atlantic transit point for South American cocaine heading to Europe.',
    vulnerability: 'family_succession', vulnerabilityDesc: 'Family succession feud is tearing his organization apart.',
    bodyguards: 5, combat: 40, bribeCost: 35000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'patriarchal',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_abidjan', districtId: 'abidjan', region: 'west_africa',
    name: 'Ivoirien', realName: 'Jacques Kouassi', age: 44, emoji: '\u{1F343}',
    profile: 'Runs massive cocaine warehouses in Ivory Coast for European-bound shipments.',
    vulnerability: 'ptsd', vulnerabilityDesc: 'PTSD from civil war makes him unstable under pressure.',
    bodyguards: 5, combat: 45, bribeCost: 32000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 650, priceDiscount: 0.05 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'volatile',
    drugSpecialty: 'cocaine',
  },
  {
    id: 'boss_conakry', districtId: 'conakry', region: 'west_africa',
    name: 'The General', realName: 'Moussa Camara', age: 56, emoji: '\u{1F396}\uFE0F',
    profile: 'Military man who merged mining operations with drug trafficking.',
    vulnerability: 'coup_paranoia', vulnerabilityDesc: 'Constant fear of coups makes him divert resources to self-protection.',
    bodyguards: 8, combat: 55, bribeCost: 40000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'military',
    drugSpecialty: 'cocaine',
  },

  // ==================== SOUTHEAST ASIA (5) ====================
  {
    id: 'boss_bangkok', districtId: 'bangkok', region: 'southeast_asia',
    name: 'Khun Sa Jr.', realName: 'Somchai Rattanaporn', age: 42, emoji: '\u{1F418}',
    profile: 'Golden Triangle meth producer flooding Southeast Asia with yaba pills.',
    vulnerability: 'thai_military', vulnerabilityDesc: 'Thai military periodically cracks down to appease international pressure.',
    bodyguards: 6, combat: 50, bribeCost: 50000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.08 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'traditional',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_ho_chi_minh', districtId: 'ho_chi_minh', region: 'southeast_asia',
    name: 'The Dragon', realName: 'Nguyen Van Hai', age: 48, emoji: '\u{1F432}',
    profile: 'Controls Southeast Asian heroin trade from Vietnam\'s economic hub.',
    vulnerability: 'communist_crackdowns', vulnerabilityDesc: 'Communist government crackdowns are unpredictable and severe.',
    bodyguards: 5, combat: 45, bribeCost: 40000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 800, priceDiscount: 0.07 },
    destabilizeDays: { min: 12, max: 25 },
    personality: 'calculating',
    drugSpecialty: 'heroin',
  },
  {
    id: 'boss_manila', districtId: 'manila', region: 'southeast_asia',
    name: 'The Mayor', realName: 'Eduardo Santos', age: 53, emoji: '\u{1F3DB}\uFE0F',
    profile: 'Elected politician who is simultaneously a major drug lord.',
    vulnerability: 'drug_war_politics', vulnerabilityDesc: 'National drug war politics mean he could be targeted at any moment.',
    bodyguards: 6, combat: 40, bribeCost: 45000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 750, priceDiscount: 0.06 },
    destabilizeDays: { min: 12, max: 24 },
    personality: 'political',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_jakarta', districtId: 'jakarta', region: 'southeast_asia',
    name: 'Raja', realName: 'Budi Santoso', age: 45, emoji: '\u{1F3DD}\uFE0F',
    profile: 'Island smuggling network spanning Indonesia\'s 17,000 islands.',
    vulnerability: 'too_many_islands', vulnerabilityDesc: 'Too many islands to control means shipments regularly go missing.',
    bodyguards: 5, combat: 40, bribeCost: 38000,
    assassinDifficulty: 3,
    controlBonus: { dailyIncome: 700, priceDiscount: 0.06 },
    destabilizeDays: { min: 10, max: 22 },
    personality: 'expansive',
    drugSpecialty: 'meth',
  },
  {
    id: 'boss_yangon', districtId: 'yangon', region: 'southeast_asia',
    name: 'The Jade King', realName: 'Aung Ko', age: 50, emoji: '\u{1F48E}',
    profile: 'Controls jade and opium trades in Myanmar\'s lawless borderlands.',
    vulnerability: 'military_junta', vulnerabilityDesc: 'The military junta wants a bigger cut and threatens to shut him down.',
    bodyguards: 7, combat: 55, bribeCost: 50000,
    assassinDifficulty: 4,
    controlBonus: { dailyIncome: 900, priceDiscount: 0.07 },
    destabilizeDays: { min: 14, max: 28 },
    personality: 'stoic',
    drugSpecialty: 'opium',
  },
];


// ============================================================
// REGION METADATA
// ============================================================

const REGIONS = {
  caribbean:       { name: 'Caribbean',       bossCount: 6, color: '#00bcd4' },
  south_america:   { name: 'South America',   bossCount: 6, color: '#4caf50' },
  mexico:          { name: 'Mexico',           bossCount: 6, color: '#ff9800' },
  us:              { name: 'United States',    bossCount: 7, color: '#2196f3' },
  western_europe:  { name: 'Western Europe',   bossCount: 6, color: '#9c27b0' },
  eastern_europe:  { name: 'Eastern Europe',   bossCount: 6, color: '#f44336' },
  west_africa:     { name: 'West Africa',      bossCount: 5, color: '#ff5722' },
  southeast_asia:  { name: 'Southeast Asia',   bossCount: 5, color: '#e91e63' },
};


// ============================================================
// VULNERABILITY EXPLOIT TABLE
// ============================================================

const VULNERABILITY_EXPLOITS = {
  gambling_debt:          { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 5,  method: 'Buy up his debts and use them as leverage.' },
  aging_health:           { costMultiplier: 0.3, successBonus: 0.20, heatGenerated: 3,  method: 'Wait him out. His body is failing and successors are circling.' },
  mistress_informant:     { costMultiplier: 0.5, successBonus: 0.30, heatGenerated: 8,  method: 'Feed intel through the mistress to set a DEA trap.' },
  vanity:                 { costMultiplier: 0.3, successBonus: 0.35, heatGenerated: 2,  method: 'Lure her into a public setting where she\'s exposed.' },
  superstitious:          { costMultiplier: 0.2, successBonus: 0.30, heatGenerated: 2,  method: 'Stage omens and voodoo curses to destabilize his mind.' },
  short_temper:           { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 5,  method: 'Provoke him into making a rash, costly mistake.' },
  succession_war:         { costMultiplier: 0.5, successBonus: 0.30, heatGenerated: 10, method: 'Play his sons against each other to fracture the empire.' },
  protecting_children:    { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 4,  method: 'Threaten proximity to her children to force concessions.' },
  obsessive_records:      { costMultiplier: 0.3, successBonus: 0.35, heatGenerated: 6,  method: 'Steal or expose his records to bring law enforcement down on him.' },
  depends_on_lieutenants: { costMultiplier: 0.4, successBonus: 0.30, heatGenerated: 5,  method: 'Flip or eliminate his outside lieutenants to cut his strings.' },
  flashy_lifestyle:       { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 3,  method: 'Tip off the tax authorities and press about his extravagant spending.' },
  political_enemies:      { costMultiplier: 0.5, successBonus: 0.30, heatGenerated: 8,  method: 'Form alliance with his political enemies to squeeze him.' },
  losing_patron:          { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 6,  method: 'Accelerate his patron\'s downfall to leave him unprotected.' },
  impulsive:              { costMultiplier: 0.3, successBonus: 0.30, heatGenerated: 5,  method: 'Bait him into a trap by exploiting his need to react immediately.' },
  us_partner_flip:        { costMultiplier: 0.5, successBonus: 0.35, heatGenerated: 10, method: 'Push the FBI to flip her US-side partner, collapsing the tunnel network.' },
  everyone_wants_him_dead:{ costMultiplier: 0.2, successBonus: 0.40, heatGenerated: 3,  method: 'Unite his many enemies into a coalition against him.' },
  disputed_legitimacy:    { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 5,  method: 'Fund rival claimants to undermine his authority.' },
  tourist_incident:       { costMultiplier: 0.3, successBonus: 0.30, heatGenerated: 8,  method: 'Engineer a tourist incident to bring international heat.' },
  crumbling_org:          { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 4,  method: 'Recruit his defecting soldiers and accelerate the collapse.' },
  fbi_mole:               { costMultiplier: 0.4, successBonus: 0.35, heatGenerated: 8,  method: 'Feed disinformation through the FBI mole to create chaos.' },
  internal_politics:      { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 5,  method: 'Sponsor a rival faction to split his gang from within.' },
  own_addiction:           { costMultiplier: 0.2, successBonus: 0.30, heatGenerated: 2,  method: 'Feed his addiction to make him increasingly erratic and weak.' },
  public_life:            { costMultiplier: 0.3, successBonus: 0.30, heatGenerated: 3,  method: 'Use his public social media presence to track and ambush him.' },
  loyalty_neighborhood:   { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 4,  method: 'Stake out her old neighborhood where she always returns.' },
  hurricane_disruptions:  { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 2,  method: 'Strike during hurricane season when his operations are disrupted.' },
  money_trail:            { costMultiplier: 0.5, successBonus: 0.30, heatGenerated: 7,  method: 'Follow the money trail to expose his entire laundering network.' },
  compromised_phones:     { costMultiplier: 0.4, successBonus: 0.35, heatGenerated: 8,  method: 'Use compromised encrypted comms to intercept his orders.' },
  police_targeting:       { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 6,  method: 'Let the police do the heavy lifting and move in after raids.' },
  independence_politics:  { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 4,  method: 'Exploit political divisions between his crew\'s loyalties.' },
  interpol_watching:      { costMultiplier: 0.4, successBonus: 0.30, heatGenerated: 8,  method: 'Feed Interpol tips to increase surveillance pressure.' },
  younger_crew:           { costMultiplier: 0.3, successBonus: 0.30, heatGenerated: 5,  method: 'Support the younger crew\'s modernization coup.' },
  kremlin_control:        { costMultiplier: 0.6, successBonus: 0.20, heatGenerated: 12, method: 'Tip off Kremlin officials that he\'s skimming state profits.' },
  paranoia:               { costMultiplier: 0.2, successBonus: 0.30, heatGenerated: 3,  method: 'Feed false intel to amplify his paranoia until he self-destructs.' },
  war_crimes_past:        { costMultiplier: 0.5, successBonus: 0.30, heatGenerated: 10, method: 'Threaten to deliver witness testimony to The Hague.' },
  conflict_zone:          { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 4,  method: 'Use the chaos of the conflict zone to disrupt her operations.' },
  europol_closing_in:     { costMultiplier: 0.4, successBonus: 0.30, heatGenerated: 7,  method: 'Accelerate the Europol investigation with anonymous tips.' },
  kurdish_conflict:       { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 6,  method: 'Exploit territorial disruptions from the Kurdish conflict.' },
  ethnic_rivalry:         { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 5,  method: 'Exploit ethnic tensions to fragment his syndicate.' },
  lost_patron:            { costMultiplier: 0.3, successBonus: 0.30, heatGenerated: 3,  method: 'Strike while he has no political protection.' },
  family_succession:      { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 5,  method: 'Fuel the family succession feud to split his organization.' },
  ptsd:                   { costMultiplier: 0.2, successBonus: 0.30, heatGenerated: 3,  method: 'Apply pressure tactics that trigger his PTSD episodes.' },
  coup_paranoia:          { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 4,  method: 'Spread coup rumors to make him divert forces from drug ops.' },
  thai_military:          { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 7,  method: 'Trigger a military crackdown by leaking intel to Thai authorities.' },
  communist_crackdowns:   { costMultiplier: 0.4, successBonus: 0.25, heatGenerated: 8,  method: 'Provoke a communist party crackdown on his operations.' },
  drug_war_politics:      { costMultiplier: 0.4, successBonus: 0.30, heatGenerated: 6,  method: 'Leak his identity to drug war politicians looking for scalps.' },
  too_many_islands:       { costMultiplier: 0.3, successBonus: 0.25, heatGenerated: 3,  method: 'Intercept shipments on unguarded island routes.' },
  military_junta:         { costMultiplier: 0.5, successBonus: 0.25, heatGenerated: 8,  method: 'Inform the junta he\'s withholding their cut to trigger a crackdown.' },
};


// ============================================================
// PUPPET TEMPLATES
// ============================================================

const PUPPET_LOYALTY_DECAY_PER_DAY = 1; // loyalty drops 1 point per day without reinforcement
const PUPPET_MIN_LOYALTY = 10;           // below this, puppet may betray you
const PUPPET_BETRAYAL_CHANCE = 0.15;     // per-day chance of betrayal when loyalty < min

const BOSS_RECOVERY_DAYS = { min: 30, max: 60 }; // days before a bribed boss's goodwill wears off
const BRIBE_RELATION_BOOST = 30;


// ============================================================
// UTILITY HELPERS
// ============================================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function rollSuccess(chance) {
  return Math.random() < chance;
}


// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Initialize boss-related game state.
 * Call once at game start and merge into the main game state.
 */
function initBossState() {
  return {
    bossStatus: {},            // { bossId: { alive: bool, bribed: bool, bribeDaysLeft: int, ... } }
    defeatedBosses: [],        // array of bossIds
    installedPuppets: [],      // array of { districtId, loyalty, daysInstalled }
    destabilizedDistricts: {}, // { districtId: { daysLeft: int, originalBossId: string } }
    bossRelations: {},         // { bossId: int } — -100 to +100
  };
}


/**
 * Daily tick: process all boss-related timers and state changes.
 */
function processBossesDaily(state) {
  const events = [];
  const bs = state.bosses || {};

  // --- Destabilization timers ---
  if (bs.destabilizedDistricts) {
    for (const districtId of Object.keys(bs.destabilizedDistricts)) {
      const entry = bs.destabilizedDistricts[districtId];
      entry.daysLeft -= 1;
      if (entry.daysLeft <= 0) {
        delete bs.destabilizedDistricts[districtId];
        events.push({
          type: 'district_stabilized',
          districtId,
          message: `A new power has filled the vacuum in ${districtId}. The district is no longer destabilized.`,
        });
      }
    }
  }

  // --- Puppet loyalty decay ---
  if (bs.installedPuppets) {
    for (let i = bs.installedPuppets.length - 1; i >= 0; i--) {
      const puppet = bs.installedPuppets[i];
      puppet.loyalty -= PUPPET_LOYALTY_DECAY_PER_DAY;
      puppet.daysInstalled += 1;

      if (puppet.loyalty < PUPPET_MIN_LOYALTY) {
        if (rollSuccess(PUPPET_BETRAYAL_CHANCE)) {
          events.push({
            type: 'puppet_betrayal',
            districtId: puppet.districtId,
            message: `Your puppet in ${puppet.districtId} has betrayed you and seized control for themselves!`,
          });
          bs.installedPuppets.splice(i, 1);
          if (bs.destabilizedDistricts) {
            bs.destabilizedDistricts[puppet.districtId] = {
              daysLeft: randomInt(5, 12),
              originalBossId: null,
            };
          }
        } else {
          events.push({
            type: 'puppet_loyalty_warning',
            districtId: puppet.districtId,
            loyalty: puppet.loyalty,
            message: `Your puppet in ${puppet.districtId} is growing disloyal (loyalty: ${puppet.loyalty}).`,
          });
        }
      }
    }
  }

  // --- Boss bribe decay ---
  if (bs.bossStatus) {
    for (const bossId of Object.keys(bs.bossStatus)) {
      const status = bs.bossStatus[bossId];
      if (status.bribed && status.bribeDaysLeft > 0) {
        status.bribeDaysLeft -= 1;
        if (status.bribeDaysLeft <= 0) {
          status.bribed = false;
          events.push({
            type: 'bribe_expired',
            bossId,
            message: `Your bribe arrangement with ${bossId} has expired. The alliance is over.`,
          });
        }
      }
    }
  }

  // --- Boss relation natural drift toward 0 ---
  if (bs.bossRelations) {
    for (const bossId of Object.keys(bs.bossRelations)) {
      if (bs.bossRelations[bossId] > 0) {
        bs.bossRelations[bossId] = Math.max(0, bs.bossRelations[bossId] - 1);
      } else if (bs.bossRelations[bossId] < 0) {
        bs.bossRelations[bossId] = Math.min(0, bs.bossRelations[bossId] + 1);
      }
    }
  }

  return events;
}


/**
 * Look up the boss for a given district.
 */
function getBossForDistrict(districtId) {
  return REGIONAL_BOSSES.find(b => b.districtId === districtId) || null;
}


/**
 * Check if a boss has been defeated.
 */
function isBossDefeated(state, bossId) {
  return state.defeatedBosses.includes(bossId);
}


/**
 * Check if a district is currently destabilized.
 * Returns { destabilized: bool, daysLeft: int|null }
 */
function isDistrictDestabilized(state, districtId) {
  const entry = state.destabilizedDistricts[districtId];
  if (entry) {
    return { destabilized: true, daysLeft: entry.daysLeft };
  }
  return { destabilized: false, daysLeft: null };
}


/**
 * Get available interaction options for a boss.
 */
function getBossInteractionOptions(state, bossId) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { error: 'Boss not found.' };

  const defeated = isBossDefeated(state, bossId);
  const bossStatus = state.bossStatus[bossId] || {};
  const relation = state.bossRelations[bossId] || 0;
  const destab = isDistrictDestabilized(state, boss.districtId);

  const options = [];

  if (defeated) {
    // Boss is defeated — can only install puppet if district has no puppet yet
    const hasPuppet = state.installedPuppets.some(p => p.districtId === boss.districtId);
    if (!hasPuppet && destab.destabilized) {
      options.push({
        action: 'install_puppet',
        description: `Install a puppet boss in ${boss.districtId} to control the district.`,
        available: true,
      });
    }
    return { bossId, defeated: true, options };
  }

  // Negotiate — requires diplomat crew or speech skill 3+
  options.push({
    action: 'negotiate',
    description: `Attempt diplomacy with ${boss.name}. Requires diplomat crew or speech skill 3+.`,
    available: true,
    requiresCrew: 'diplomat',
    requiresSkill: { speech: 3 },
  });

  // Bribe
  options.push({
    action: 'bribe',
    description: `Pay $${boss.bribeCost.toLocaleString()} for a temporary alliance with ${boss.name}.`,
    available: !bossStatus.bribed,
    cost: boss.bribeCost,
    alreadyBribed: !!bossStatus.bribed,
  });

  // Fight
  options.push({
    action: 'fight',
    description: `Direct combat against ${boss.name} and ${boss.bodyguards} bodyguards. High risk, high reward.`,
    available: true,
    difficulty: boss.combat,
    bodyguards: boss.bodyguards,
  });

  // Assassinate
  options.push({
    action: 'assassinate',
    description: `Silent kill of ${boss.name}. Requires assassin or sniper crew. Difficulty: ${boss.assassinDifficulty}/5.`,
    available: true,
    requiresCrew: ['assassin', 'sniper'],
    difficulty: boss.assassinDifficulty,
  });

  // Exploit vulnerability
  const vuln = VULNERABILITY_EXPLOITS[boss.vulnerability];
  options.push({
    action: 'exploit_vulnerability',
    description: `${vuln.method} Cost: $${Math.floor(boss.bribeCost * vuln.costMultiplier).toLocaleString()}.`,
    available: true,
    vulnerabilityType: boss.vulnerability,
    cost: Math.floor(boss.bribeCost * vuln.costMultiplier),
  });

  // Replace — only if relations are very good
  if (relation >= 50) {
    options.push({
      action: 'replace',
      description: `Your strong relationship with ${boss.name} allows a peaceful power transition.`,
      available: true,
    });
  }

  return { bossId, defeated: false, relation, options };
}


/**
 * Negotiate with a boss.
 * Requires diplomat crew or player speech skill >= 3.
 * On success, improves relations.
 */
function negotiateWithBoss(state, bossId, playerSkills = {}, hasCrew = []) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { success: false, message: 'Boss not found.' };
  if (isBossDefeated(state, bossId)) return { success: false, message: `${boss.name} has already been defeated.` };

  const hasDiplomat = hasCrew.includes('diplomat');
  const hasSpeech = (playerSkills.speech || 0) >= 3;

  if (!hasDiplomat && !hasSpeech) {
    return { success: false, message: 'Negotiation requires a diplomat crew member or speech skill 3+.' };
  }

  // Base chance: 40%, +15% with diplomat, +10% with speech 3+, +5% per 10 relation points
  const currentRelation = state.bossRelations[bossId] || 0;
  let chance = 0.40;
  if (hasDiplomat) chance += 0.15;
  if (hasSpeech) chance += 0.10;
  chance += (currentRelation / 200); // +0.5% per point, maxing around +50%

  // Personality modifiers
  if (boss.personality === 'diplomatic') chance += 0.15;
  if (boss.personality === 'aggressive' || boss.personality === 'psychotic') chance -= 0.15;
  if (boss.personality === 'paranoid') chance -= 0.10;

  chance = clamp(chance, 0.05, 0.95);

  if (rollSuccess(chance)) {
    const relationGain = randomInt(8, 20);
    state.bossRelations[bossId] = clamp((currentRelation + relationGain), -100, 100);
    return {
      success: true,
      message: `${boss.name} listened. Relations improved by ${relationGain} (now ${state.bossRelations[bossId]}).`,
      relationChange: relationGain,
      newRelation: state.bossRelations[bossId],
    };
  } else {
    const relationLoss = randomInt(3, 8);
    state.bossRelations[bossId] = clamp((currentRelation - relationLoss), -100, 100);
    return {
      success: false,
      message: `${boss.name} rejected your overtures. Relations dropped by ${relationLoss} (now ${state.bossRelations[bossId]}).`,
      relationChange: -relationLoss,
      newRelation: state.bossRelations[bossId],
    };
  }
}


/**
 * Bribe a boss for a temporary alliance and district bonuses.
 */
function bribeBoss(state, bossId, playerCash) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { success: false, message: 'Boss not found.' };
  if (isBossDefeated(state, bossId)) return { success: false, message: `${boss.name} has already been defeated.` };

  const status = state.bossStatus[bossId] || {};
  if (status.bribed) {
    return { success: false, message: `${boss.name} is already bribed. Wait for the arrangement to expire.` };
  }

  if (playerCash < boss.bribeCost) {
    return { success: false, message: `Not enough cash. Need $${boss.bribeCost.toLocaleString()}, have $${playerCash.toLocaleString()}.` };
  }

  const daysActive = randomInt(BOSS_RECOVERY_DAYS.min, BOSS_RECOVERY_DAYS.max);
  state.bossStatus[bossId] = {
    ...status,
    bribed: true,
    bribeDaysLeft: daysActive,
  };

  const currentRelation = state.bossRelations[bossId] || 0;
  state.bossRelations[bossId] = clamp(currentRelation + BRIBE_RELATION_BOOST, -100, 100);

  return {
    success: true,
    message: `${boss.name} accepted your bribe. Alliance active for ${daysActive} days.`,
    cost: boss.bribeCost,
    daysActive,
    bonuses: boss.controlBonus,
    newRelation: state.bossRelations[bossId],
  };
}


/**
 * Initiate direct combat against a boss and their bodyguards.
 * playerCombat: player's combat power (crew + weapons + skills)
 * Returns combat result.
 */
function fightBoss(state, bossId, playerCombat) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { success: false, message: 'Boss not found.' };
  if (isBossDefeated(state, bossId)) return { success: false, message: `${boss.name} has already been defeated.` };

  // Boss combat = base combat + (bodyguards * 8)
  const bossTotalCombat = boss.combat + (boss.bodyguards * 8);

  // Player advantage ratio
  const ratio = playerCombat / bossTotalCombat;

  // Win chance scales with ratio: at 1.0 ratio => 50%, at 2.0 => 80%, at 0.5 => 20%
  let winChance = 0.5 * ratio;
  winChance = clamp(winChance, 0.05, 0.95);

  // Relation malus: fighting a friend is harder (they know your tactics)
  const relation = state.bossRelations[bossId] || 0;
  if (relation > 30) winChance -= 0.10;

  winChance = clamp(winChance, 0.05, 0.95);

  // Calculate player damage taken (even in victory)
  const playerDamagePct = clamp((bossTotalCombat / playerCombat) * 0.4, 0.05, 0.80);
  const bodyguardsKilled = rollSuccess(winChance)
    ? boss.bodyguards
    : randomInt(0, Math.floor(boss.bodyguards * 0.6));

  if (rollSuccess(winChance)) {
    // Victory
    state.defeatedBosses.push(bossId);
    state.bossStatus[bossId] = { alive: false, bribed: false, bribeDaysLeft: 0 };
    state.bossRelations[bossId] = -100;

    // Destabilize the district
    const destabDays = randomInt(boss.destabilizeDays.min, boss.destabilizeDays.max);
    state.destabilizedDistricts[boss.districtId] = {
      daysLeft: destabDays,
      originalBossId: bossId,
    };

    // Heat generation: fighting is loud
    const heatGenerated = randomInt(15, 30);

    return {
      success: true,
      message: `You defeated ${boss.name} (${boss.realName}) in a bloody battle! The district is now destabilized for ${destabDays} days.`,
      bossDefeated: true,
      bodyguardsKilled: boss.bodyguards,
      playerDamagePct: Math.round(playerDamagePct * 100),
      heatGenerated,
      destabilizeDays: destabDays,
      loot: Math.floor(boss.bribeCost * 0.5), // loot half of bribe cost
    };
  } else {
    // Defeat — player takes heavy damage but boss is weakened
    const relationDrop = randomInt(20, 40);
    state.bossRelations[bossId] = clamp((relation - relationDrop), -100, 100);

    return {
      success: false,
      message: `${boss.name} and ${boss.bodyguards} bodyguards repelled your attack! You took heavy losses.`,
      bossDefeated: false,
      bodyguardsKilled,
      playerDamagePct: Math.round(playerDamagePct * 150), // worse damage on loss
      heatGenerated: randomInt(20, 40),
      relationChange: -relationDrop,
    };
  }
}


/**
 * Attempt to assassinate a boss silently.
 * Requires assassin or sniper crew.
 */
function assassinateBoss(state, bossId, hasCrew = [], playerSkills = {}) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { success: false, message: 'Boss not found.' };
  if (isBossDefeated(state, bossId)) return { success: false, message: `${boss.name} has already been defeated.` };

  const hasAssassin = hasCrew.includes('assassin');
  const hasSniper = hasCrew.includes('sniper');

  if (!hasAssassin && !hasSniper) {
    return { success: false, message: 'Assassination requires an assassin or sniper crew member.' };
  }

  // Base chance depends on difficulty: 1 => 80%, 2 => 65%, 3 => 50%, 4 => 35%, 5 => 20%
  let chance = 1.0 - (boss.assassinDifficulty * 0.15);

  // Crew bonuses
  if (hasAssassin) chance += 0.10;
  if (hasSniper) chance += 0.10;
  if (hasAssassin && hasSniper) chance += 0.05; // combo bonus

  // Stealth skill bonus
  const stealthSkill = playerSkills.stealth || 0;
  chance += stealthSkill * 0.05;

  // Personality modifiers
  if (boss.personality === 'paranoid') chance -= 0.15;
  if (boss.personality === 'elusive') chance -= 0.10;
  if (boss.personality === 'erratic') chance += 0.05; // unpredictable but also sloppy

  chance = clamp(chance, 0.05, 0.95);

  if (rollSuccess(chance)) {
    state.defeatedBosses.push(bossId);
    state.bossStatus[bossId] = { alive: false, bribed: false, bribeDaysLeft: 0 };

    const destabDays = randomInt(boss.destabilizeDays.min, boss.destabilizeDays.max);
    state.destabilizedDistricts[boss.districtId] = {
      daysLeft: destabDays,
      originalBossId: bossId,
    };

    // Assassination generates less heat than combat
    const heatGenerated = randomInt(5, 15);

    return {
      success: true,
      message: `${boss.name} (${boss.realName}) was silently eliminated. The district falls into chaos for ${destabDays} days.`,
      bossDefeated: true,
      heatGenerated,
      destabilizeDays: destabDays,
      loot: Math.floor(boss.bribeCost * 0.3),
    };
  } else {
    // Failed assassination — boss becomes hostile and alert
    const relationDrop = randomInt(30, 50);
    const relation = state.bossRelations[bossId] || 0;
    state.bossRelations[bossId] = clamp(relation - relationDrop, -100, 100);

    return {
      success: false,
      message: `The assassination attempt on ${boss.name} failed! He knows it was you. Security has been doubled.`,
      bossDefeated: false,
      heatGenerated: randomInt(10, 25),
      relationChange: -relationDrop,
      consequence: 'Boss bodyguards temporarily increased.',
    };
  }
}


/**
 * Install a puppet boss in a defeated district.
 * Gives ongoing control bonuses but requires loyalty maintenance.
 */
function installPuppet(state, districtId) {
  const boss = getBossForDistrict(districtId);
  if (!boss) return { success: false, message: 'No boss associated with this district.' };

  if (!isBossDefeated(state, boss.id)) {
    return { success: false, message: `Cannot install puppet — ${boss.name} still controls ${districtId}.` };
  }

  const existingPuppet = state.installedPuppets.find(p => p.districtId === districtId);
  if (existingPuppet) {
    return { success: false, message: `A puppet is already installed in ${districtId}.` };
  }

  const puppet = {
    districtId,
    originalBossId: boss.id,
    loyalty: 80, // starts at 80/100
    daysInstalled: 0,
    dailyIncome: boss.controlBonus.dailyIncome,
    priceDiscount: boss.controlBonus.priceDiscount,
  };

  state.installedPuppets.push(puppet);

  // Remove destabilization if present
  if (state.destabilizedDistricts[districtId]) {
    delete state.destabilizedDistricts[districtId];
  }

  return {
    success: true,
    message: `Puppet installed in ${districtId}. Daily income: $${puppet.dailyIncome}. Price discount: ${(puppet.priceDiscount * 100).toFixed(0)}%. Keep loyalty high!`,
    puppet,
  };
}


/**
 * Exploit a boss's specific vulnerability for a cheaper/easier takedown.
 */
function exploitVulnerability(state, bossId, playerCash, playerSkills = {}, hasCrew = []) {
  const boss = REGIONAL_BOSSES.find(b => b.id === bossId);
  if (!boss) return { success: false, message: 'Boss not found.' };
  if (isBossDefeated(state, bossId)) return { success: false, message: `${boss.name} has already been defeated.` };

  const vuln = VULNERABILITY_EXPLOITS[boss.vulnerability];
  if (!vuln) return { success: false, message: 'No known vulnerability exploit available.' };

  const cost = Math.floor(boss.bribeCost * vuln.costMultiplier);
  if (playerCash < cost) {
    return { success: false, message: `Not enough cash. Need $${cost.toLocaleString()}, have $${playerCash.toLocaleString()}.` };
  }

  // Base success chance: 50% + vulnerability bonus
  let chance = 0.50 + vuln.successBonus;

  // Intelligence skill bonus
  const intelSkill = playerSkills.intelligence || 0;
  chance += intelSkill * 0.05;

  // Crew bonuses for certain vulnerability types
  if (hasCrew.includes('hacker') && ['compromised_phones', 'money_trail', 'obsessive_records'].includes(boss.vulnerability)) {
    chance += 0.15;
  }
  if (hasCrew.includes('spy') && ['mistress_informant', 'fbi_mole', 'us_partner_flip'].includes(boss.vulnerability)) {
    chance += 0.15;
  }
  if (hasCrew.includes('diplomat') && ['succession_war', 'family_succession', 'ethnic_rivalry', 'internal_politics'].includes(boss.vulnerability)) {
    chance += 0.10;
  }
  if (hasCrew.includes('enforcer') && ['short_temper', 'impulsive', 'everyone_wants_him_dead'].includes(boss.vulnerability)) {
    chance += 0.10;
  }

  chance = clamp(chance, 0.10, 0.95);

  if (rollSuccess(chance)) {
    state.defeatedBosses.push(bossId);
    state.bossStatus[bossId] = { alive: false, bribed: false, bribeDaysLeft: 0 };

    const destabDays = randomInt(
      Math.floor(boss.destabilizeDays.min * 0.7),
      Math.floor(boss.destabilizeDays.max * 0.7)
    );
    state.destabilizedDistricts[boss.districtId] = {
      daysLeft: destabDays,
      originalBossId: bossId,
    };

    return {
      success: true,
      message: `Vulnerability exploited! ${vuln.method} ${boss.name} has been neutralized.`,
      bossDefeated: true,
      cost,
      heatGenerated: vuln.heatGenerated,
      destabilizeDays: destabDays,
      loot: Math.floor(boss.bribeCost * 0.2),
    };
  } else {
    const relationDrop = randomInt(10, 25);
    const relation = state.bossRelations[bossId] || 0;
    state.bossRelations[bossId] = clamp(relation - relationDrop, -100, 100);

    return {
      success: false,
      message: `Your attempt to exploit ${boss.name}'s ${boss.vulnerabilityDesc.toLowerCase()} backfired. He's now aware and on guard.`,
      cost: Math.floor(cost * 0.5), // lose half the investment
      heatGenerated: Math.floor(vuln.heatGenerated * 0.5),
      relationChange: -relationDrop,
    };
  }
}


// ============================================================
// QUERY / HELPER FUNCTIONS
// ============================================================

/**
 * Get all bosses in a given region.
 */
function getBossesByRegion(regionId) {
  return REGIONAL_BOSSES.filter(b => b.region === regionId);
}

/**
 * Get a boss by ID.
 */
function getBossById(bossId) {
  return REGIONAL_BOSSES.find(b => b.id === bossId) || null;
}

/**
 * Get a summary of player's boss-related progress.
 */
function getBossProgressSummary(state) {
  const totalBosses = REGIONAL_BOSSES.length;
  const defeated = state.defeatedBosses.length;
  const puppets = state.installedPuppets.length;
  const destabilized = Object.keys(state.destabilizedDistricts).length;
  const bribed = Object.values(state.bossStatus).filter(s => s.bribed).length;

  const regionProgress = {};
  for (const regionId of Object.keys(REGIONS)) {
    const regionBosses = getBossesByRegion(regionId);
    const regionDefeated = regionBosses.filter(b => state.defeatedBosses.includes(b.id)).length;
    regionProgress[regionId] = {
      name: REGIONS[regionId].name,
      total: regionBosses.length,
      defeated: regionDefeated,
      controlPct: Math.round((regionDefeated / regionBosses.length) * 100),
    };
  }

  return {
    totalBosses,
    defeated,
    puppets,
    destabilized,
    bribed,
    controlPct: Math.round((defeated / totalBosses) * 100),
    regionProgress,
  };
}

/**
 * Get total daily income from all installed puppets.
 */
function getPuppetDailyIncome(state) {
  return state.installedPuppets.reduce((sum, p) => sum + p.dailyIncome, 0);
}

/**
 * Reinforce puppet loyalty with cash payment.
 */
function reinforcePuppet(state, districtId, cashAmount) {
  const puppet = state.installedPuppets.find(p => p.districtId === districtId);
  if (!puppet) return { success: false, message: 'No puppet in this district.' };

  // $1000 per loyalty point
  const loyaltyGain = Math.floor(cashAmount / 1000);
  puppet.loyalty = clamp(puppet.loyalty + loyaltyGain, 0, 100);

  return {
    success: true,
    message: `Puppet loyalty in ${districtId} reinforced to ${puppet.loyalty}/100.`,
    cost: cashAmount,
    newLoyalty: puppet.loyalty,
  };
}

/**
 * Get all active bonuses from bribed bosses and puppets.
 */
function getActiveBonuses(state) {
  const bonuses = {
    dailyIncome: 0,
    priceDiscounts: {},
  };

  // Puppet income
  for (const puppet of state.installedPuppets) {
    bonuses.dailyIncome += puppet.dailyIncome;
    bonuses.priceDiscounts[puppet.districtId] = puppet.priceDiscount;
  }

  // Bribed boss bonuses
  for (const bossId of Object.keys(state.bossStatus)) {
    const status = state.bossStatus[bossId];
    if (status.bribed) {
      const boss = getBossById(bossId);
      if (boss) {
        bonuses.dailyIncome += Math.floor(boss.controlBonus.dailyIncome * 0.5); // bribe gives half income
        bonuses.priceDiscounts[boss.districtId] = boss.controlBonus.priceDiscount * 0.5;
      }
    }
  }

  return bonuses;
}


// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REGIONAL_BOSSES,
    REGIONS,
    VULNERABILITY_EXPLOITS,
    initBossState,
    processBossesDaily,
    getBossForDistrict,
    getBossById,
    getBossesByRegion,
    isBossDefeated,
    isDistrictDestabilized,
    getBossInteractionOptions,
    negotiateWithBoss,
    bribeBoss,
    fightBoss,
    assassinateBoss,
    installPuppet,
    exploitVulnerability,
    getBossProgressSummary,
    getPuppetDailyIncome,
    reinforcePuppet,
    getActiveBonuses,
  };
}
