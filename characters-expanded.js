// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Expanded Character System
// 8 Starting Characters + 4 NG+ Characters
// Each with unique stats, backstory, faction relations, intro cutscene
// ============================================================

const MIAMI_CHARACTERS = [
  {
    id: 'corner_kid', name: 'The Corner Kid', emoji: '🧢',
    subtitle: 'Liberty City Product',
    bonusSkillPoints: 3,
    startingCash: 200,
    startingDebt: 1500,
    debtHolder: 'Local OG',
    startingDistrict: 'liberty_city',
    startingCrew: [
      { name: 'Lil D', type: 'thug', loyalty: 85, skill: 'low', trait: 'childhood_friend' },
      { name: 'Smoke', type: 'lookout', loyalty: 80, skill: 'low', trait: 'childhood_friend' },
    ],
    startingHeat: 20,
    startingReputation: { streetCred: 15, fear: 5, trust: 10, publicImage: 0, heatSignature: 20 },
    baseSkills: { combat: 1, driving: 0, persuasion: 0, chemistry: 0, business: 0, stealth: 2, leadership: 0, streetwise: 3 },
    startingInventory: 150,
    startingItems: [],
    startingWeapon: null, // Bare hands
    friendlyFactions: ['zoe_pound', 'cartel_remnants'],
    hostileFactions: ['southern_boys', 'dixie_mafia'],
    difficulty: 'Hard',
    playstyle: 'Street hustle. Low resources, high adaptability. Build from nothing.',
    backstory: 'Grew up on the block watching dealers count money while your family counted pennies. The local OG fronted you a package and a debt. Now you owe — and the clock is ticking.',
    introCutscene: {
      panels: [
        { bg: 'projects_stoop', text: 'Liberty City. The only world you\'ve ever known.' },
        { bg: 'childhood_montage', text: 'Running from cops since you could walk. Counting money since you could count.' },
        { bg: 'og_handoff', text: 'The OG hands you a package. "Don\'t come back without my money."' },
        { bg: 'block_view', text: 'Competition on the next corner. Police cruiser rolling by. This is your shot.' },
      ],
      music: 'hard_hiphop',
    },
    specialAbility: { id: 'street_sense', name: 'Street Sense', desc: 'Can sense police presence 1 day before raids. -15% heat from street dealing.' },
    actUnlocks: { // What this character unlocks at each act
      act1: 'Block territory defense bonus',
      act2: 'Community recruitment discount',
      act3: 'OG network connections',
    },
  },
  {
    id: 'dropout', name: 'The Dropout', emoji: '🎓',
    subtitle: 'Wynwood Chemist',
    bonusSkillPoints: 2,
    startingCash: 2000,
    startingDebt: 0,
    debtHolder: null,
    startingDistrict: 'wynwood',
    startingCrew: [],
    startingHeat: 0,
    startingReputation: { streetCred: 0, fear: 0, trust: 0, publicImage: 5, heatSignature: 0 },
    baseSkills: { combat: 0, driving: 0, persuasion: 1, chemistry: 2, business: 1, stealth: 0, leadership: 0, streetwise: 0 },
    startingInventory: 100,
    startingItems: [],
    startingWeapon: null,
    friendlyFactions: [],
    hostileFactions: [],
    difficulty: 'Medium',
    playstyle: 'Smart and scientific. Chemistry focus. Build a lab empire.',
    backstory: 'College wasn\'t paying the bills. One connection to a dealer, one chemistry class too many. You saw the margins on processed product and couldn\'t unsee them.',
    introCutscene: {
      panels: [
        { bg: 'dorm_room', text: 'Textbooks and an eviction notice. The American Dream, revised edition.' },
        { bg: 'rain_campus', text: 'Walking across rain-soaked campus. Past a dealer. Hesitation.' },
        { bg: 'first_buy', text: 'Your first purchase. It sits in your palm like a question.' },
        { bg: 'lab_vision', text: 'But you know chemistry. And chemistry means margins.' },
      ],
      music: 'melancholy_synth',
    },
    specialAbility: { id: 'lab_genius', name: 'Lab Genius', desc: '+30% processing yield. Can identify drug purity instantly. Lab explosions -50%.' },
    actUnlocks: {
      act1: 'Basic processing tutorials',
      act2: 'Advanced chemistry formulas',
      act3: 'Designer drug creation',
    },
  },
  {
    id: 'ex_con', name: 'The Ex-Con', emoji: '⛓️',
    subtitle: 'Keys Corridor Survivor',
    bonusSkillPoints: 2,
    startingCash: 500,
    startingDebt: 8000,
    debtHolder: 'Multiple (legal fees, back support, prison loans)',
    startingDistrict: 'the_keys',
    startingCrew: [
      { name: 'Rico', type: 'enforcer', loyalty: 70, skill: 'high', trait: 'prison_contact' },
    ],
    startingHeat: 35,
    startingReputation: { streetCred: 60, fear: 40, trust: 30, publicImage: -20, heatSignature: 35 },
    baseSkills: { combat: 3, driving: 0, persuasion: 0, chemistry: 0, business: 0, stealth: 1, leadership: 0, streetwise: 2 },
    startingInventory: 120,
    startingItems: [],
    startingWeapon: 'switchblade',
    friendlyFactions: ['los_cubanos', 'cartel_remnants', 'southern_boys'],
    hostileFactions: ['eastern_bloc', 'port_authority'],
    difficulty: 'Hard',
    playstyle: 'Street warrior. Combat focused. High risk, high respect. Any arrest = back to prison.',
    backstory: 'Five years inside. Didn\'t snitch, earned respect. Now you\'re out with $500, a mountain of debt, and a probation officer who wants you back inside. One arrest and it\'s over.',
    introCutscene: {
      panels: [
        { bg: 'prison_gate', text: 'Gate opens. Sunlight hits like a fist.' },
        { bg: 'prison_flashback', text: 'Five years. Not a word to the feds. That buys respect.' },
        { bg: 'bus_ride', text: 'Changed streets through a dirty window. Nothing waited for you.' },
        { bg: 'halfway_house', text: 'Envelope: $500 and a list of debts. But you know people. And they know you don\'t break.' },
      ],
      music: 'heavy_synth',
    },
    specialAbility: { id: 'prison_code', name: 'Prison Code', desc: 'Crew loyalty +20%. Can recruit from prison network. +30% rep from combat victories.' },
    specialCondition: { id: 'probation', name: 'On Probation', desc: 'ANY arrest = automatic return to prison. Game becomes extremely difficult after arrest.' },
    actUnlocks: {
      act1: 'Prison contact network',
      act2: 'Veteran dealer connections',
      act3: 'Old cartel introductions',
    },
  },
  {
    id: 'hustler', name: 'The Hustler', emoji: '🎰',
    subtitle: 'South Beach Smooth Operator',
    bonusSkillPoints: 1,
    startingCash: 5000,
    startingDebt: 3000,
    debtHolder: 'Bookie (violent enforcer)',
    startingDistrict: 'south_beach',
    startingCrew: [],
    startingFronts: ['small_bar'], // Starts with a front business
    startingHeat: 5,
    startingReputation: { streetCred: 0, fear: 0, trust: 5, publicImage: 30, heatSignature: 5 },
    baseSkills: { combat: 0, driving: 0, persuasion: 3, chemistry: 0, business: 3, stealth: 0, leadership: 0, streetwise: 1 },
    startingInventory: 200,
    startingItems: [],
    startingWeapon: null,
    friendlyFactions: ['eastern_bloc', 'port_authority'],
    hostileFactions: ['zoe_pound', 'southern_boys', 'los_cubanos'],
    difficulty: 'Medium',
    playstyle: 'Business mind. Talk your way through. Build a laundering empire.',
    backstory: 'Every hustle, every con, every scheme — they all led here. The bookie wants his $3K and his enforcer doesn\'t negotiate. Real money is in the drug trade, and you\'ve got the business sense to run it like a corporation.',
    introCutscene: {
      panels: [
        { bg: 'con_montage', text: 'Three-card monte, fake goods, rigged dice. You\'ve always seen the angle.' },
        { bg: 'club_bathroom', text: 'Counting money in a club bathroom. Not enough. Never enough.' },
        { bg: 'bookie_threat', text: 'The bookie\'s enforcer: "Three days." You talk your way out. Barely.' },
        { bg: 'stash_house', text: 'Walking past a stash house. Seeing real money. The biggest hustle of all.' },
      ],
      music: 'slick_funk_synth',
    },
    specialAbility: { id: 'silver_tongue', name: 'Silver Tongue', desc: '+40% persuasion success. Better prices on all trades. Can talk out of 1 arrest per act.' },
    actUnlocks: {
      act1: 'Business front discount',
      act2: 'Laundering network access',
      act3: 'Political connections',
    },
  },
  {
    id: 'connected_kid', name: 'The Connected Kid', emoji: '👑',
    subtitle: 'Overtown Legacy',
    bonusSkillPoints: 2,
    startingCash: 1000,
    startingDebt: 12000,
    debtHolder: 'Colombian Connection (inherited from parent)',
    startingDistrict: 'overtown',
    startingCrew: [
      { name: 'Marcus', type: 'bodyguard', loyalty: 50, skill: 'mid', trait: 'parent_loyal' },
      { name: 'Jay', type: 'smuggler', loyalty: 45, skill: 'mid', trait: 'parent_loyal' },
      { name: 'Tina', type: 'lookout', loyalty: 55, skill: 'mid', trait: 'parent_loyal' },
    ],
    startingHeat: 25,
    startingReputation: { streetCred: 40, fear: 20, trust: 15, publicImage: 10, heatSignature: 25 },
    baseSkills: { combat: 0, driving: 0, persuasion: 0, chemistry: 0, business: 1, stealth: 0, leadership: 2, streetwise: 1 },
    startingInventory: 200,
    startingItems: [],
    startingWeapon: 'pistol',
    friendlyFactions: ['los_cubanos', 'cartel_remnants'],
    hostileFactions: ['southern_boys'],
    difficulty: 'Medium',
    playstyle: 'Inherited empire. Crew management. Prove you\'re worthy of the name.',
    backstory: 'Your parent built an empire. Now they\'re gone — prison, grave, or exile. You inherited crew (loyal to them, not you), territory (contested), connections (expecting results), and a $12K debt to the Colombians who don\'t care about your grief.',
    introCutscene: {
      panels: [
        { bg: 'funeral_courthouse', text: 'They took everything. Your parent\'s name is all that\'s left.' },
        { bg: 'kitchen_flashback', text: 'Counting money at the kitchen table. Hiding packages. You always knew.' },
        { bg: 'crew_uncertain', text: 'The crew shows up. Uncertain eyes. They\'re loyal to a ghost.' },
        { bg: 'parent_chair', text: 'The Colombian calls. The rival sends a message. You sit in your parent\'s chair.' },
      ],
      music: 'emotional_build',
    },
    specialAbility: { id: 'legacy_name', name: 'Legacy Name', desc: 'Faster faction reputation gain. Inherited contacts. But crew starts with mixed loyalty — must earn it.' },
    specialCondition: { id: 'colombian_debt', name: 'Colombian Debt', desc: '$12K owed to the Colombian Connection. Failure to pay = assassination attempts.' },
    actUnlocks: {
      act1: 'Parent\'s old contact network',
      act2: 'Hidden stash locations from parent',
      act3: 'Parent\'s supplier connections',
    },
  },
  {
    id: 'cleanskin', name: 'The Cleanskin', emoji: '👔',
    subtitle: 'Downtown Professional',
    bonusSkillPoints: 1,
    startingCash: 8000,
    startingDebt: 0,
    debtHolder: null,
    startingDistrict: 'downtown',
    startingCrew: [],
    startingHeat: 0,
    startingReputation: { streetCred: 0, fear: 0, trust: 0, publicImage: 40, heatSignature: 0 },
    baseSkills: { combat: 0, driving: 0, persuasion: 0, chemistry: 0, business: 3, stealth: 0, leadership: 0, streetwise: 0 },
    startingInventory: 100,
    startingItems: [],
    startingWeapon: null,
    friendlyFactions: ['eastern_bloc'],
    hostileFactions: [],
    difficulty: 'Medium',
    playstyle: 'Clean record. Business and laundering focus. Build from the corporate side.',
    backstory: 'Normal life. Good job. Bills piling up. Then you saw it — the money being laundered through your company. In minutes you made what takes weeks at the desk. You can\'t unsee it.',
    specialtyChoice: ['accountant', 'nurse', 'mechanic'], // Player picks one
    specialtyBonuses: {
      accountant: { skill: 'business', bonus: 'laundering_expert', desc: '+50% laundering efficiency. Can audit rivals.' },
      nurse: { skill: 'chemistry', bonus: 'medical_expert', desc: 'Free healing. +30% hospital effectiveness. Can treat crew injuries.' },
      mechanic: { skill: 'driving', bonus: 'vehicle_expert', desc: '+30% vehicle performance. Cheaper vehicle upgrades. Can modify vehicles.' },
    },
    introCutscene: {
      panels: [
        { bg: 'normal_life', text: 'Alarm. Commute. Cubicle. The rhythm of a life going nowhere.' },
        { bg: 'bills_pile', text: 'Bills pile up like snow. Each month closer to drowning.' },
        { bg: 'criminal_encounter', text: 'Then you see it. The money. Moving through your hands like water.' },
        { bg: 'cash_decision', text: 'In minutes, what takes weeks. The clean world suddenly looks very dirty.' },
      ],
      music: 'clean_synth_distort',
    },
    specialAbility: { id: 'clean_record', name: 'Clean Record', desc: 'No criminal history. Police suspicion -50%. Can access corporate districts freely. Laundering bonus.' },
    actUnlocks: {
      act1: 'Corporate access and legitimate cover',
      act2: 'Shell company formation',
      act3: 'Political donor access',
    },
  },
  {
    id: 'veteran', name: 'The Veteran', emoji: '🎖️',
    subtitle: 'Miami Gardens Soldier',
    bonusSkillPoints: 2,
    startingCash: 800,
    startingDebt: 6000,
    debtHolder: 'Multiple sources',
    startingDistrict: 'miami_gardens',
    startingCrew: [
      { name: 'Tank', type: 'enforcer', loyalty: 75, skill: 'high', trait: 'combat_veteran' },
      { name: 'Ghost', type: 'bodyguard', loyalty: 70, skill: 'high', trait: 'combat_veteran' },
    ],
    startingHeat: 30,
    startingReputation: { streetCred: 30, fear: 60, trust: 10, publicImage: -30, heatSignature: 30 },
    baseSkills: { combat: 4, driving: 2, persuasion: 0, chemistry: 0, business: 0, stealth: 1, leadership: 0, streetwise: 0 },
    startingInventory: 150,
    startingItems: ['body_armor'],
    startingWeapon: 'glock_17',
    friendlyFactions: ['dixie_mafia', 'southern_boys', 'cartel_remnants'],
    hostileFactions: ['zoe_pound', 'eastern_bloc'],
    difficulty: 'Hard',
    playstyle: 'Combat specialist. Guns and muscle. Take territory by force.',
    backstory: 'A raid gone wrong years ago left scars and a reputation. You\'re older now, slower, but the fear you command is real. The gun and armor in your gym bag are the only tools you trust.',
    introCutscene: {
      panels: [
        { bg: 'raid_flashback', text: 'The raid. Gunfire. Taking a bullet meant for someone else.' },
        { bg: 'older_scarred', text: 'Years later. Scarred. The body hurts but the hands still work.' },
        { bg: 'gym_bag', text: 'Gym bag: Glock, body armor, and nothing else worth keeping.' },
        { bg: 'walking_out', text: 'Loading the magazine. Walking out. War is the only language you speak fluently.' },
      ],
      music: 'aggressive_industrial',
    },
    specialAbility: { id: 'combat_master', name: 'Combat Master', desc: '+40% combat damage. +25% crew combat effectiveness. Can train crew in combat.' },
    actUnlocks: {
      act1: 'Military connection (weapons discount)',
      act2: 'Mercenary recruitment',
      act3: 'Private security contracts',
    },
  },
  {
    id: 'immigrant', name: 'The Immigrant', emoji: '🌍',
    subtitle: 'Little Haiti Newcomer',
    bonusSkillPoints: 3,
    startingCash: 1500,
    startingDebt: 4000,
    debtHolder: 'Arrival arrangers (smugglers)',
    startingDistrict: 'little_haiti',
    startingCrew: [],
    startingDependents: 1, // Family member to support
    startingHeat: 0,
    startingReputation: { streetCred: 0, fear: 0, trust: 0, publicImage: 0, heatSignature: 0 },
    baseSkills: { combat: 0, driving: 0, persuasion: 0, chemistry: 0, business: 0, stealth: 0, leadership: 0, streetwise: 1 },
    startingInventory: 80,
    startingItems: [],
    startingWeapon: null,
    friendlyFactions: ['zoe_pound', 'port_authority'],
    hostileFactions: ['dixie_mafia', 'southern_boys'],
    difficulty: 'Very Hard',
    playstyle: 'True underdog. Maximum skill points but minimum everything else. Community-building focus.',
    backstory: 'Boat, truck, or plane — it doesn\'t matter how you got here. You owe the people who arranged it. You have family depending on you. And the only opportunity you can see is the one that breaks the law.',
    introCutscene: {
      panels: [
        { bg: 'boat_arrival', text: 'Cramped quarters. Salt air. The city rises from the water like a promise.' },
        { bg: 'city_overwhelm', text: 'Everything is loud, fast, foreign. A contact hands you a phone number.' },
        { bg: 'community_found', text: 'Familiar language on the corner. A plate of food. Community found.' },
        { bg: 'rooftop_alone', text: 'The call comes: debt, opportunity, family. On the rooftop, alone but determined.' },
      ],
      music: 'world_synth_fusion',
    },
    specialAbility: { id: 'community_roots', name: 'Community Roots', desc: '+50% community trust gain. Caribbean import connections. Zoe Pound alliance bonus. But language barriers limit early options.' },
    specialCondition: { id: 'dependent', name: 'Family Dependent', desc: 'Must pay $200/day for family support. Failure = morale penalty and story consequences.' },
    actUnlocks: {
      act1: 'Caribbean community connections',
      act2: 'Immigrant network (multi-city)',
      act3: 'International smuggling routes',
    },
  },
];

// NG+ Exclusive Characters (unlocked after campaign completion)
const NG_PLUS_CHARACTERS = [
  {
    id: 'undercover', name: 'The Undercover', emoji: '🕵️',
    subtitle: 'Double Agent',
    bonusSkillPoints: 2,
    startingCash: 3000,
    startingDebt: 0,
    startingDistrict: 'downtown',
    baseSkills: { combat: 2, driving: 2, persuasion: 2, chemistry: 0, business: 0, stealth: 3, leadership: 0, streetwise: 2 },
    specialAbility: { id: 'double_life', name: 'Double Life', desc: 'Can access police intel. Heat management bonus. But exposure means instant game over.' },
    difficulty: 'Extreme',
    backstory: 'You\'re a cop. Deep undercover. The line between the badge and the life is blurring. Play both sides — but if either finds out, you\'re dead.',
    ngPlusOnly: true,
  },
  {
    id: 'cartel_exile', name: 'The Cartel Exile', emoji: '🦅',
    subtitle: 'Fallen Prince',
    bonusSkillPoints: 1,
    startingCash: 15000,
    startingDebt: 50000,
    startingDistrict: 'little_havana',
    baseSkills: { combat: 2, driving: 0, persuasion: 1, chemistry: 1, business: 2, stealth: 0, leadership: 3, streetwise: 2 },
    specialAbility: { id: 'cartel_knowledge', name: 'Cartel Knowledge', desc: 'Knows all supply routes. Can negotiate directly with Colombians. But they want you dead.' },
    difficulty: 'Hard',
    backstory: 'You were cartel royalty until the coup. Now you\'re in Miami with knowledge worth millions and enemies who\'ll pay anything to silence you.',
    ngPlusOnly: true,
  },
  {
    id: 'hacker', name: 'The Hacker', emoji: '💻',
    subtitle: 'Digital Ghost',
    bonusSkillPoints: 2,
    startingCash: 5000,
    startingDebt: 2000,
    startingDistrict: 'wynwood',
    baseSkills: { combat: 0, driving: 0, persuasion: 0, chemistry: 0, business: 3, stealth: 4, leadership: 0, streetwise: 0 },
    specialAbility: { id: 'digital_warfare', name: 'Digital Warfare', desc: 'Can hack police systems, steal rival intel, manipulate markets. But zero street cred.' },
    difficulty: 'Medium',
    backstory: 'Cryptocurrency, dark web markets, digital identities. You\'ve run it all from behind a screen. Now someone wants to meet in person — and the real world doesn\'t have a delete button.',
    ngPlusOnly: true,
  },
  {
    id: 'legacy', name: 'The Legacy', emoji: '🏰',
    subtitle: 'Your Previous Character\'s Heir',
    bonusSkillPoints: 0,
    startingCash: 0, // Inherited from previous run
    startingDebt: 0,
    startingDistrict: null, // Same as previous character
    baseSkills: { combat: 0, driving: 0, persuasion: 0, chemistry: 0, business: 0, stealth: 0, leadership: 0, streetwise: 0 },
    specialAbility: { id: 'inherited_empire', name: 'Inherited Empire', desc: 'Start with 25% of previous run\'s cash, all properties, and faction relationships. But everyone expects more from you.' },
    difficulty: 'Variable',
    backstory: 'You are the next generation. Your predecessor\'s empire awaits — along with their enemies, debts, and unfinished business.',
    ngPlusOnly: true,
    isLegacy: true, // Special handling — inherits from previous save
  },
];

// Get character by ID
function getCharacterById(charId) {
  return MIAMI_CHARACTERS.find(c => c.id === charId) || NG_PLUS_CHARACTERS.find(c => c.id === charId) || null;
}

// Get available characters based on game state
function getAvailableCharacters(state) {
  const chars = [...MIAMI_CHARACTERS];
  if (state && state.newGamePlus && state.newGamePlus.active) {
    chars.push(...NG_PLUS_CHARACTERS);
  }
  return chars;
}

// Apply character starting stats to game state
function applyCharacterToState(state, charId) {
  const char = getCharacterById(charId);
  if (!char) return;

  state.character = charId;
  state.characterData = {
    id: char.id,
    name: char.name,
    emoji: char.emoji,
    subtitle: char.subtitle,
    specialAbility: char.specialAbility,
    specialCondition: char.specialCondition || null,
    bonusSkillPointsRemaining: char.bonusSkillPoints,
    specialtyChoice: char.specialtyChoice || null,
    selectedSpecialty: null,
    dependents: char.startingDependents || 0,
  };

  state.cash = char.startingCash;
  state.debt = char.startingDebt;
  state.currentLocation = char.startingDistrict || 'liberty_city';

  // Reputation
  if (char.startingReputation) {
    state.reputation = char.startingReputation.streetCred || 0;
    state.reputationMulti = { ...char.startingReputation };
  }

  // Heat
  state.heat = char.startingHeat || 0;

  // Skills
  if (char.baseSkills) {
    state.skills = { ...char.baseSkills };
  }

  // Inventory capacity
  state.maxInventory = char.startingInventory || 200;

  // Weapon
  if (char.startingWeapon) {
    state.equippedWeapon = char.startingWeapon;
  }

  // Items
  if (char.startingItems && char.startingItems.length > 0) {
    state.items = [...char.startingItems];
  }

  // Crew
  if (char.startingCrew && char.startingCrew.length > 0) {
    state.henchmen = char.startingCrew.map((c, i) => ({
      id: `crew_${i}_${Date.now()}`,
      name: c.name,
      type: c.type,
      loyalty: c.loyalty,
      health: 100,
      maxHealth: 100,
      injured: false,
      skill: c.skill || 'low',
      trait: c.trait || null,
      rank: 'soldier',
      daysServed: 0,
      daysSincePaid: 0,
      hiddenLoyalty: c.loyalty + Math.floor(Math.random() * 20) - 10,
      betrayalRisk: c.trait === 'childhood_friend' ? 0.01 : c.trait === 'parent_loyal' ? 0.08 : 0.05,
      traits: c.traits || [],
      uniqueId: 'crew_' + Math.random().toString(36).substr(2, 8),
    }));
  }

  // Factions
  if (typeof initFactionState === 'function') {
    state.factions = initFactionState(charId);
  }

  // Front businesses (Hustler starts with one)
  if (char.startingFronts) {
    state.frontBusinesses = char.startingFronts.map(f => ({
      id: f,
      dailyIncome: 100,
      suspicion: 0,
      level: 1,
    }));
  }
}

// Render character select screen data
function getCharacterSelectData(state) {
  const chars = getAvailableCharacters(state);
  return chars.map(c => ({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    subtitle: c.subtitle,
    difficulty: c.difficulty,
    cash: c.startingCash,
    debt: c.startingDebt,
    district: c.startingDistrict,
    crewCount: c.startingCrew ? c.startingCrew.length : 0,
    bonusPoints: c.bonusSkillPoints,
    playstyle: c.playstyle,
    backstory: c.backstory,
    specialAbility: c.specialAbility,
    specialCondition: c.specialCondition || null,
    baseSkills: c.baseSkills,
    ngPlusOnly: c.ngPlusOnly || false,
  }));
}
