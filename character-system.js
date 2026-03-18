/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Character Selection System
   8 Starting Characters with unique backgrounds & stats
   ============================================================ */

const CHARACTER_ARCHETYPES = [
  {
    id: 'dropout',
    name: 'The Dropout',
    emoji: '🎓',
    tagline: 'Book smarts meet street smarts',
    desc: 'Dropped out of college when the tuition money ran dry. Turns out organic chemistry has practical applications the professors never mentioned. No connections, no crew, no record — just a sharp mind and a desperate need for cash.',
    startingCash: 2000,
    startingDebt: 5000,
    startingHealth: 100,
    startingInventorySpace: 80,
    startingHeat: 0,
    startingLocation: 'miami',
    bonusSkillPoints: 2,
    startingCrew: [],
    startingTerritory: [],
    startingWeapons: [],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: 0, fear: 0, trust: 5, publicImage: 10, heatSignature: 0 },
    passiveEffect: { id: 'chemistry_basics', name: 'Chemistry Basics', desc: 'Processing yield +15%', effectKey: 'processingYield', value: 0.15 },
    flags: { cleanRecord: true },
    difficulty: 'Easy',
    difficultyDesc: 'Easiest start, slowest empire growth',
  },
  {
    id: 'corner_kid',
    name: 'The Corner Kid',
    emoji: '🧢',
    tagline: 'Born into the life',
    desc: 'Grew up on the block watching OGs count money. Your mentor fronted you your first package and now the debt is due. You know every alley, every stash spot, every cop rotation. The streets raised you — time to run them.',
    startingCash: 200,
    startingDebt: 1500,
    startingHealth: 100,
    startingInventorySpace: 100,
    startingHeat: 15,
    startingLocation: 'miami',
    bonusSkillPoints: 3,
    startingCrew: [
      { typeId: 'thug', name: 'Lil Rico', loyalty: 80, traits: ['loyal', 'reckless'] },
      { typeId: 'thug', name: 'Deshawn', loyalty: 75, traits: ['streetwise', 'greedy'] },
    ],
    startingTerritory: ['miami'],
    startingWeapons: ['switchblade'],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: 20, fear: 5, trust: 10, publicImage: -10, heatSignature: 15 },
    passiveEffect: { id: 'street_instinct', name: 'Street Instinct', desc: 'Encounter escape chance +20%', effectKey: 'escapeChance', value: 0.20 },
    flags: { knownOnStreets: true },
    difficulty: 'Medium',
    difficultyDesc: 'Street cred but major debt pressure',
  },
  {
    id: 'ex_con',
    name: 'The Ex-Con',
    emoji: '⛓️',
    tagline: 'Five years down, lifetime to go',
    desc: 'Just walked out of a 5-year bid. Did the time without snitching and the streets respect that. One solid connect from inside, $500 gate money, and $8,000 in debts that accumulated while you were gone. Probation means any arrest sends you straight back.',
    startingCash: 500,
    startingDebt: 8000,
    startingHealth: 85,
    startingInventorySpace: 100,
    startingHeat: 10,
    startingLocation: 'miami',
    bonusSkillPoints: 2,
    startingCrew: [
      { typeId: 'enforcer', name: 'Big Mike', loyalty: 90, traits: ['loyal', 'violent'] },
    ],
    startingTerritory: [],
    startingWeapons: ['switchblade'],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: 40, fear: 25, trust: 30, publicImage: -30, heatSignature: 10 },
    passiveEffect: { id: 'prison_rep', name: 'Yard Cred', desc: 'Crew loyalty decay -50%', effectKey: 'loyaltyDecayMod', value: -0.50 },
    flags: { onProbation: true, prisonRecord: true },
    difficulty: 'Hard',
    difficultyDesc: 'High rep but probation = instant prison on arrest',
  },
  {
    id: 'hustler',
    name: 'The Hustler',
    emoji: '🎲',
    tagline: 'Every angle has an angle',
    desc: 'Three-card monte, fake Rolexes, rigged dice — you\'ve run every hustle in Miami. Good with money, better with words, terrible in a fight. The bookie wants his $3K and your charm is wearing thin. Time to graduate to the real game.',
    startingCash: 5000,
    startingDebt: 3000,
    startingHealth: 100,
    startingInventorySpace: 80,
    startingHeat: 5,
    startingLocation: 'miami',
    bonusSkillPoints: 1,
    startingCrew: [],
    startingTerritory: [],
    startingWeapons: [],
    startingFronts: ['taco_stand', 'laundromat'],
    skillBonuses: {},
    repBonuses: { streetCred: 10, fear: 0, trust: -5, publicImage: 15, heatSignature: 5 },
    passiveEffect: { id: 'silver_tongue', name: 'Silver Tongue', desc: 'All buy prices -10%', effectKey: 'buyDiscount', value: 0.10 },
    flags: { smoothTalker: true },
    difficulty: 'Easy',
    difficultyDesc: 'Strong financial start, weak in combat',
  },
  {
    id: 'connected_kid',
    name: 'The Connected Kid',
    emoji: '👑',
    tagline: 'Inheritance comes with enemies',
    desc: 'Your father ran a mid-level operation until the feds got him. Now you\'ve inherited everything — the stash house, the crew, the supplier connection, and the $12K cartel debt. Three crew members of questionable loyalty, a territory under siege, and a rival who smells blood.',
    startingCash: 1000,
    startingDebt: 12000,
    startingHealth: 100,
    startingInventorySpace: 120,
    startingHeat: 25,
    startingLocation: 'miami',
    bonusSkillPoints: 2,
    startingCrew: [
      { typeId: 'bodyguard', name: 'Carlos', loyalty: 60, traits: ['ambitious', 'skilled'] },
      { typeId: 'smuggler', name: 'Flaco', loyalty: 70, traits: ['connected', 'greedy'] },
      { typeId: 'thug', name: 'Junior', loyalty: 50, traits: ['reckless', 'disloyal'] },
    ],
    startingTerritory: ['miami'],
    startingWeapons: ['beretta'],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: 30, fear: 15, trust: 5, publicImage: -15, heatSignature: 25 },
    passiveEffect: { id: 'cartel_contact', name: 'Cartel Contact', desc: 'Import prices -15% in Americas', effectKey: 'americasDiscount', value: 0.15 },
    flags: { cartelConnection: true, activeBounty: true },
    difficulty: 'Very Hard',
    difficultyDesc: 'Highest starting assets but highest danger',
  },
  {
    id: 'cleanskin',
    name: 'The Cleanskin',
    emoji: '👔',
    tagline: 'The straight world wasn\'t paying',
    desc: 'Accountant by day, desperate by night. The bills keep stacking, the bank keeps calling, and your legitimate salary covers about half of what you need. One chance encounter with the criminal world showed you what real money looks like. No record, no connections — just $8K in savings and a very useful skill set.',
    startingCash: 8000,
    startingDebt: 0,
    startingHealth: 100,
    startingInventorySpace: 60,
    startingHeat: 0,
    startingLocation: 'miami',
    bonusSkillPoints: 1,
    startingCrew: [],
    startingTerritory: [],
    startingWeapons: [],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: -10, fear: 0, trust: 0, publicImage: 20, heatSignature: 0 },
    passiveEffect: { id: 'accountant_eye', name: 'Accountant\'s Eye', desc: 'Laundering rate +25%, front income +20%', effectKey: 'launderBonus', value: 0.25 },
    flags: { cleanRecord: true, legitimateCover: true },
    difficulty: 'Medium',
    difficultyDesc: 'Highest cash, zero criminal infrastructure',
  },
  {
    id: 'veteran',
    name: 'The Veteran',
    emoji: '🎖️',
    tagline: 'Old soldier, new war',
    desc: 'Former enforcer. The kind of man people hired when negotiations failed. A raid went bad years ago — took a bullet, lost good people. Now you\'re older, slower, scarred, but you still know how to handle a weapon. $6K in debts, old enemies, and a body that doesn\'t move like it used to.',
    startingCash: 800,
    startingDebt: 6000,
    startingHealth: 75,
    startingInventorySpace: 100,
    startingHeat: 20,
    startingLocation: 'miami',
    bonusSkillPoints: 2,
    startingCrew: [
      { typeId: 'enforcer', name: 'Tombstone', loyalty: 85, traits: ['loyal', 'violent'] },
      { typeId: 'bodyguard', name: 'Razor', loyalty: 80, traits: ['disciplined', 'cautious'] },
    ],
    startingTerritory: [],
    startingWeapons: ['magnum', 'body_armor'],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: 25, fear: 40, trust: 15, publicImage: -20, heatSignature: 20 },
    passiveEffect: { id: 'combat_vet', name: 'Combat Veteran', desc: 'All combat damage +25%, accuracy +15%', effectKey: 'combatDamageMod', value: 0.25 },
    flags: { oldInjury: true, knownEnforcer: true },
    difficulty: 'Hard',
    difficultyDesc: 'Combat powerhouse with a worn-down body',
  },
  {
    id: 'immigrant',
    name: 'The Immigrant',
    emoji: '🌍',
    tagline: 'New country, old debts',
    desc: 'Arrived in Miami with nothing but a phone number and a debt to the people who got you here. $4K owed to the arrangement makers, a family back home depending on remittances, and a foreign supplier contact most locals would kill for. Language barriers and cultural distance make everything harder — but your international connections are priceless.',
    startingCash: 1500,
    startingDebt: 4000,
    startingHealth: 100,
    startingInventorySpace: 90,
    startingHeat: 0,
    startingLocation: 'miami',
    bonusSkillPoints: 3,
    startingCrew: [],
    startingTerritory: [],
    startingWeapons: [],
    startingFronts: [],
    skillBonuses: {},
    repBonuses: { streetCred: -5, fear: 0, trust: 5, publicImage: 0, heatSignature: 0 },
    passiveEffect: { id: 'international_connect', name: 'International Connect', desc: 'Transport costs -25%, international prices -10%', effectKey: 'transportDiscount', value: 0.25 },
    flags: { internationalContact: true, familyDependent: true },
    difficulty: 'Medium',
    difficultyDesc: 'Early import access but must overcome social barriers',
  },
];

// Classic character for migrating old saves
const CLASSIC_CHARACTER = {
  id: 'classic',
  name: 'Classic',
  emoji: '🕶️',
  tagline: 'The original hustler',
  desc: 'No backstory, no bonuses, no excuses. Just you and the streets.',
  startingCash: 3000,
  startingDebt: 8000,
  startingHealth: 100,
  startingInventorySpace: 100,
  startingHeat: 0,
  startingLocation: 'miami',
  bonusSkillPoints: 0,
  startingCrew: [],
  startingTerritory: [],
  startingWeapons: [],
  startingFronts: [],
  skillBonuses: {},
  repBonuses: { streetCred: 0, fear: 0, trust: 0, publicImage: 0, heatSignature: 0 },
  passiveEffect: null,
  flags: {},
  difficulty: 'Classic',
  difficultyDesc: 'Original Drug Wars experience',
};

// ============================================================
// CHARACTER INTRO CUTSCENES
// ============================================================
const CHARACTER_INTROS = {
  dropout: [
    { text: 'The fluorescent lights of the University of Miami chemistry lab buzz overhead. Three semesters of straight A\'s, and all it got you was a tuition bill you couldn\'t pay. The financial aid office said "sorry" like it was nothing.', mood: 'blue', speaker: 'narrator' },
    { text: 'You stare at the eviction notice taped to your dorm door. Thirty days. The formula for methamphetamine synthesis sits in your notebook like a loaded gun. Professor Herrera always said you had a gift for organic chemistry.', mood: 'dark', speaker: 'narrator' },
    { text: 'A man named Tito from Little Havana heard about your skills. He slides an envelope across the table at a Calle Ocho cafe. "Cook for me. One batch. Five thousand dollars." The coffee goes cold while you think.', mood: 'warm', speaker: 'narrator' },
    { text: 'Miami, 1977. The palm trees sway under a neon sunset. You pocket the envelope and walk into the humid night. No more lectures. No more textbooks. Class is in session on the streets now.', mood: 'neon', speaker: 'narrator' },
  ],
  corner_kid: [
    { text: 'The corner of 7th and Liberty. You\'ve stood here since you were twelve, watching the OGs count money in the back of Dominick\'s Barbershop. They gave you lookout duty at thirteen. Runner at fourteen. Now you\'re sixteen and Big Hec says it\'s time.', mood: 'dark', speaker: 'narrator' },
    { text: '"You ready, lil man?" Big Hec drops a package on the card table. Fifty dime bags of powder, fronted on credit. Fifteen hundred dollars\' worth. "Sell it by Friday or I take it out your skin." He isn\'t smiling.', mood: 'red', speaker: 'narrator' },
    { text: 'Lil Rico and Deshawn are already waiting at the stash spot. They grew up on the same block — same broken homes, same empty refrigerators, same reason for being out here. Rico tucks a switchblade in his sock. "Let\'s get this bread."', mood: 'warm', speaker: 'narrator' },
    { text: 'The Miami sun sets over Liberty City, painting the projects in orange and gold. Somewhere a boombox plays Earth, Wind & Fire. You stuff the package in your waistband and step into the night. The corner is yours now.', mood: 'neon', speaker: 'narrator' },
  ],
  ex_con: [
    { text: 'Raiford State Prison. Five years, two months, seventeen days. You counted every one. The gate opens with a buzz that echoes in your bones. The guard hands you a paper bag: one wallet, one watch, five hundred dollars gate money.', mood: 'dark', speaker: 'narrator' },
    { text: 'You did the time without giving up a single name. Word got around. In the yard, respect is currency — and you left wealthy. Big Mike is waiting in the parking lot, leaning against a rusted Cadillac. "Welcome back, brother."', mood: 'blue', speaker: 'narrator' },
    { text: 'The probation officer stamps your papers with a bored expression. "Any arrest — any arrest at all — and you go straight back. No trial, no bail. Understand?" You nod. Eight thousand in debts accumulated while you were inside. People don\'t forget what you owe.', mood: 'red', speaker: 'narrator' },
    { text: 'Miami looks different after five years. Bigger. Louder. More money flowing through the streets than ever. You light a cigarette outside the bus station and watch the sunset. Time to collect on all that yard cred.', mood: 'neon', speaker: 'narrator' },
  ],
  hustler: [
    { text: 'Three-card monte on Collins Avenue. A tourist from Connecticut just lost six hundred dollars to your fastest hands in Miami. Your crew packs the table before the cops roll through. Another beautiful day in paradise.', mood: 'neon', speaker: 'narrator' },
    { text: 'But the real money isn\'t in monte. Your bookie, Fat Sal, has you on the hook for three grand after that Dolphins game went sideways. "I like you, kid," Sal says, adjusting his pinky ring. "But business is business. You got two weeks."', mood: 'red', speaker: 'narrator' },
    { text: 'You run the numbers in your head outside the Fontainebleau Hotel. The taco stand on 8th brings in two hundred a week. The laundromat, maybe three. Legitimate money moves like molasses. You need the fast lane.', mood: 'warm', speaker: 'narrator' },
    { text: 'A connect in Overtown mentioned wholesale powder — real product, not the stepped-on garbage the tourists buy in South Beach. Five thousand in your pocket, a silver tongue in your mouth, and every hustle you\'ve ever run was training for this moment.', mood: 'dark', speaker: 'narrator' },
  ],
  connected_kid: [
    { text: 'The federal marshals took your father at 6 AM on a Tuesday. You watched from the upstairs window as they put him in the back of a black sedan. He looked up once. That look said everything: it\'s yours now.', mood: 'dark', speaker: 'narrator' },
    { text: 'The inheritance: a stash house in Hialeah, three crew members of questionable loyalty, a Colombian supplier connection, and twelve thousand dollars in cartel debt. Also, a rival named Victor Salazar who can smell weakness like a shark smells blood.', mood: 'red', speaker: 'narrator' },
    { text: 'Carlos, Flaco, and Junior sit in the living room of your father\'s old house. They\'re watching you. Testing you. Carlos fingers the Beretta on the coffee table. "Your pops ran things a certain way," he says carefully. "What\'s your way?"', mood: 'warm', speaker: 'narrator' },
    { text: 'You pick up the Beretta and tuck it in your waistband. Through the window, Miami sprawls under a blood-red sunset. Somewhere out there, Victor Salazar is making phone calls. The crown fits heavy, but you were born for this.', mood: 'neon', speaker: 'narrator' },
  ],
  cleanskin: [
    { text: 'The spreadsheets blur together at 11 PM in the accounting office of Hartwell & Associates. Forty-two thousand a year minus taxes, minus rent, minus the car payment, minus the student loans. The math never works.', mood: 'blue', speaker: 'narrator' },
    { text: 'You found the discrepancy by accident — a client laundering cash through a chain of car washes. Instead of reporting it, you studied it. The structure was elegant. Primitive, but elegant. You could do it better.', mood: 'dark', speaker: 'narrator' },
    { text: 'Eight thousand in savings. No criminal record. No connections. No one would ever suspect the quiet accountant with the pressed shirts and the briefcase. That\'s the advantage. You\'re invisible.', mood: 'warm', speaker: 'narrator' },
    { text: 'Miami at night looks different when you\'re driving home from a meeting in Overtown. The city pulses with money — real money, cash money, the kind that doesn\'t show up on W-2 forms. You loosen your tie and make a decision.', mood: 'neon', speaker: 'narrator' },
  ],
  veteran: [
    { text: 'The scar on your left side itches when it rains. Three bullets from a botched raid in \'72 — two went clean through, one is still in there. The doctors said you were lucky. Didn\'t feel lucky when they zipped up the body bags of your crew.', mood: 'dark', speaker: 'narrator' },
    { text: 'Tombstone and Razor are all that\'s left from the old days. Loyal to the bone. Tombstone got that name for a reason. Razor moves quiet, plans careful. Good men for what\'s coming.', mood: 'blue', speaker: 'narrator' },
    { text: 'The world moved on while you were recovering. New crews run the corners now. Young bloods with gold chains and no respect for the old ways. Six thousand in debts and a body that creaks like a ship in a storm. But the Magnum still fits your hand like a handshake.', mood: 'red', speaker: 'narrator' },
    { text: 'You check the cylinder of the .357 on the porch of your Coconut Grove bungalow. Six rounds. The sun sets over Biscayne Bay, painting the water in fire. Old soldier, new war. The young ones will learn respect — or they\'ll learn nothing at all.', mood: 'warm', speaker: 'narrator' },
  ],
  immigrant: [
    { text: 'The cargo container smelled like rust and diesel for eleven days. Fourteen souls packed in the dark, crossing the Caribbean on faith and desperation. When the doors opened in Miami, the sunlight hit like a revelation.', mood: 'dark', speaker: 'narrator' },
    { text: 'Four thousand dollars to the arrangement makers. Non-negotiable. Your family back home depends on the money you send — your mother, your sister, your daughter you haven\'t held in two years. Every dollar counts twice.', mood: 'blue', speaker: 'narrator' },
    { text: 'But you brought something the locals don\'t have: a phone number. A direct line to suppliers in the old country. Product at prices these Miami boys have never seen. The language barrier is a wall, but connections are a door.', mood: 'warm', speaker: 'narrator' },
    { text: 'Little Havana at dusk. The smell of plantains and gasoline. A payphone on the corner of Flagler Street. You dial the international number and wait. When the voice answers, you speak in the language of home. The deal begins tonight.', mood: 'neon', speaker: 'narrator' },
  ],
};

function getCharacterById(id) {
  if (id === 'classic') return CLASSIC_CHARACTER;
  return CHARACTER_ARCHETYPES.find(c => c.id === id) || CLASSIC_CHARACTER;
}

function applyCharacterToState(state, characterId) {
  const char = getCharacterById(characterId);
  if (!char || char.id === 'classic') {
    state.characterId = 'classic';
    state.characterPassive = null;
    state.characterFlags = {};
    return state;
  }

  // Core stats
  state.characterId = char.id;
  state.cash = char.startingCash;
  state.debt = char.startingDebt;
  state.health = char.startingHealth;
  state.maxHealth = 100;
  state.inventorySpace = char.startingInventorySpace;
  state.heat = char.startingHeat;
  state.currentLocation = char.startingLocation;
  state.bonusSkillPoints = char.bonusSkillPoints;
  state.skillPoints = (state.skillPoints || 0) + char.bonusSkillPoints;

  // Reputation dimensions
  if (state.rep) {
    state.rep.streetCred = Math.max(-100, Math.min(100, (state.rep.streetCred || 0) + (char.repBonuses.streetCred || 0)));
    state.rep.fear = Math.max(0, Math.min(100, (state.rep.fear || 0) + (char.repBonuses.fear || 0)));
    state.rep.trust = Math.max(-100, Math.min(100, (state.rep.trust || 0) + (char.repBonuses.trust || 0)));
    state.rep.publicImage = Math.max(-100, Math.min(100, (state.rep.publicImage || 0) + (char.repBonuses.publicImage || 0)));
    state.rep.heatSignature = Math.max(0, Math.min(100, (state.rep.heatSignature || 0) + (char.repBonuses.heatSignature || 0)));
    state.reputation = computeReputation(state);
  }

  // Starting crew
  if (char.startingCrew && char.startingCrew.length > 0) {
    for (const crewDef of char.startingCrew) {
      const hType = HENCHMEN_TYPES.find(h => h.id === crewDef.typeId);
      if (hType) {
        state.henchmen.push({
          id: hType.id,
          type: hType.id,
          name: crewDef.name || generateHenchmanName(),
          combat: hType.combat,
          carry: hType.carry,
          dailyPay: hType.dailyPay,
          loyalty: crewDef.loyalty || 80,
          health: hType.health || 100,
          maxHealth: hType.health || 100,
          injured: false,
          daysSincePaid: 0,
          // Crew expansion fields
          rank: 0,
          daysServed: 0,
          hiddenLoyalty: crewDef.loyalty || 80,
          betrayalRisk: crewDef.loyalty < 60 ? 20 : 0,
          traits: crewDef.traits || [],
          uniqueId: 'crew_' + Math.random().toString(36).substr(2, 8),
        });
      }
    }
  }

  // Starting territory
  if (char.startingTerritory && char.startingTerritory.length > 0) {
    for (const locId of char.startingTerritory) {
      state.territory[locId] = { controlled: true, dayTaken: 1, income: 500 };
    }
  }

  // Starting weapons
  if (char.startingWeapons && char.startingWeapons.length > 0) {
    for (const wepId of char.startingWeapons) {
      const weapon = WEAPONS.find(w => w.id === wepId);
      if (weapon) {
        state.weapons.push({ ...weapon });
        if (!state.equippedWeapon || weapon.damage > (state.equippedWeapon.damage || 0)) {
          state.equippedWeapon = { ...weapon };
        }
      }
    }
  }

  // Starting front businesses (Hustler gets 2 fronts)
  if (char.startingFronts && char.startingFronts.length > 0) {
    for (const frontId of char.startingFronts) {
      const front = FRONT_BUSINESSES.find(f => f.id === frontId);
      if (front) {
        state.frontBusinesses.push({
          ...front,
          location: 'miami',
          dayPurchased: 1,
          totalIncome: 0,
          totalLaundered: 0,
        });
      }
    }
  }

  // Passive effect & flags
  state.characterPassive = char.passiveEffect;
  state.characterFlags = { ...char.flags };

  return state;
}

// Get passive effect value for a given key
function getCharacterPassiveValue(state, effectKey) {
  if (!state.characterPassive) return 0;
  if (state.characterPassive.effectKey === effectKey) return state.characterPassive.value;
  return 0;
}

// Check if character has a specific flag
function hasCharacterFlag(state, flagName) {
  return !!(state.characterFlags && state.characterFlags[flagName]);
}
