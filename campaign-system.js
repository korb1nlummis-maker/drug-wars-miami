/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Campaign Acts & Endings
   5-act structure with milestone-based transitions, 12 endings
   ============================================================ */

const CAMPAIGN_ACTS = [
  {
    act: 1,
    name: 'The Come Up',
    emoji: '🌱',
    desc: 'You\'re nobody. Build your name, make your first real money, and find your crew.',
    dayRange: [1, 500],
    milestones: [
      { id: 'first_10k', name: 'First $10K', desc: 'Accumulate $10,000 total profit', check: s => (s.stats ? s.stats.totalEarnedFromDrugs : 0) >= 10000, reward: 'Unlocks bulk trading' },
      { id: 'first_territory', name: 'Claim Territory', desc: 'Take over your first location', check: s => Object.keys(s.territory || {}).length >= 1, reward: 'Territory income begins' },
      { id: 'first_crew', name: 'Build a Crew', desc: 'Hire your first crew member', check: s => (s.henchmen || []).length >= 1, reward: 'Crew bonuses active' },
      { id: 'visit_3_cities', name: 'Expand Horizons', desc: 'Visit 3 different cities', check: s => (s.citiesVisited || []).length >= 3, reward: 'Trade route knowledge' },
    ],
    requiredMilestones: 2,
    modifiers: { encounterDifficulty: 0.7, heatGainMod: 0.8, priceVolatility: 0.8 },
  },
  {
    act: 2,
    name: 'Building the Empire',
    emoji: '🏗️',
    desc: 'Money is flowing. Expand your territory, grow your crew, and establish your presence.',
    dayRange: [200, 1500],
    milestones: [
      { id: 'territory_3', name: 'Power Base', desc: 'Control 3 territories', check: s => Object.keys(s.territory || {}).length >= 3, reward: 'Territory defense bonus' },
      { id: 'net_worth_100k', name: 'Six Figures', desc: 'Reach $100,000 net worth', check: s => { const nw = (s.cash||0) + (s.bank||0) - (s.debt||0); return nw >= 100000; }, reward: 'Unlock premium suppliers' },
      { id: 'crew_5', name: 'Full Crew', desc: 'Have 5+ crew members', check: s => (s.henchmen || []).length >= 5, reward: 'Crew specialization unlocked' },
      { id: 'first_front', name: 'Clean Money', desc: 'Buy your first front business', check: s => (s.frontBusinesses || []).length >= 1, reward: 'Laundering operational' },
      { id: 'first_property', name: 'Real Estate', desc: 'Purchase your first property', check: s => getTotalPropertyCount(s) >= 1, reward: 'Property empire begins' },
    ],
    requiredMilestones: 3,
    modifiers: { encounterDifficulty: 1.0, heatGainMod: 1.0, priceVolatility: 1.0 },
  },
  {
    act: 3,
    name: 'The Empire',
    emoji: '👑',
    desc: 'You\'re a player now. Diversify, launder, and consolidate before the heat catches up.',
    dayRange: [800, 2500],
    milestones: [
      { id: 'territory_5', name: 'Regional Control', desc: 'Control 5+ territories', check: s => Object.keys(s.territory || {}).length >= 5, reward: 'Regional price control' },
      { id: 'net_worth_500k', name: 'Half Million', desc: 'Reach $500,000 net worth', check: s => { const nw = (s.cash||0) + (s.bank||0) - (s.debt||0); return nw >= 500000; }, reward: 'Elite connections' },
      { id: 'properties_3', name: 'Property Mogul', desc: 'Own 3+ properties', check: s => getTotalPropertyCount(s) >= 3, reward: 'Property synergy bonus' },
      { id: 'distribution_setup', name: 'Distribution Network', desc: 'Set up distribution in 2+ locations', check: s => Object.keys(s.distribution || {}).length >= 2, reward: 'Passive income grows' },
      { id: 'debt_free', name: 'Clean Slate', desc: 'Pay off all debt', check: s => (s.debt || 0) <= 0, reward: 'Financial freedom' },
    ],
    requiredMilestones: 3,
    modifiers: { encounterDifficulty: 1.3, heatGainMod: 1.2, priceVolatility: 1.2 },
  },
  {
    act: 4,
    name: 'The Reckoning',
    emoji: '⚖️',
    desc: 'The feds are watching. Betrayal looms. Every decision could be your last.',
    dayRange: [1500, 3500],
    milestones: [
      { id: 'survive_investigation', name: 'Beat the Heat', desc: 'Survive a level 4+ investigation', check: s => (s.investigation && s.investigation.points >= 70 && s.investigation.timesArrested >= 1), reward: 'Investigation resistance' },
      { id: 'million_net_worth', name: 'Millionaire', desc: 'Reach $1,000,000 net worth', check: s => { const nw = (s.cash||0) + (s.bank||0) - (s.debt||0); return nw >= 1000000; }, reward: 'Elite status' },
      { id: 'lieutenant_promoted', name: 'Chain of Command', desc: 'Promote someone to Lieutenant or higher', check: s => (s.henchmen || []).some(h => (h.rank || 0) >= 2), reward: 'Delegation bonus' },
      { id: 'territory_7', name: 'Empire Builder', desc: 'Control 7+ territories', check: s => Object.keys(s.territory || {}).length >= 7, reward: 'Territory income doubled' },
    ],
    requiredMilestones: 2,
    modifiers: { encounterDifficulty: 1.6, heatGainMod: 1.5, priceVolatility: 1.5 },
  },
  {
    act: 5,
    name: 'The Endgame',
    emoji: '🔥',
    desc: 'This is it. Everything has led to this moment. Choose your path.',
    dayRange: [2500, 5000],
    milestones: [
      { id: 'endgame_choice', name: 'Choose Your Fate', desc: 'Your ending will be determined by your empire\'s state', check: () => false, reward: 'The ending you deserve' },
    ],
    requiredMilestones: 0,
    modifiers: { encounterDifficulty: 2.0, heatGainMod: 1.8, priceVolatility: 2.0 },
  },
];

const CAMPAIGN_ENDINGS = [
  {
    id: 'kingpin',
    name: 'The Kingpin',
    emoji: '👑',
    subtitle: 'Total Domination',
    narrative: 'You stand at the top. Every corner, every deal, every dollar flows through your empire. The city bends to your will. But the throne is cold, and the view from the top reveals nothing but enemies in every direction. You won the game. The question is whether the game won you.',
    check: s => {
      const territories = Object.keys(s.territory || {}).length;
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      const crew = (s.henchmen || []).length;
      return territories >= 5 && nw >= 500000 && crew >= 6;
    },
    priority: 10,
    gradeCheck: s => {
      const territories = Object.keys(s.territory || {}).length;
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      if (territories >= 10 && nw >= 2000000) return 'S';
      if (territories >= 7 && nw >= 1000000) return 'A';
      if (territories >= 5 && nw >= 500000) return 'B';
      return 'C';
    },
  },
  {
    id: 'escape',
    name: 'The Escape',
    emoji: '✈️',
    subtitle: 'Vanishing Act',
    narrative: 'One day you were the most wanted man in Miami. The next day, you were a ghost. Clean money in offshore accounts, a new name, a flight to somewhere warm. You left everything behind — the crew, the territory, the reputation. Sometimes late at night, you wonder if anyone is still looking. You never stop checking over your shoulder.',
    check: s => {
      const cleanMoney = (s.bank || 0);
      return cleanMoney >= 300000 && (s.heat || 0) < 30 && (s.debt || 0) <= 0;
    },
    priority: 8,
    gradeCheck: s => {
      const bank = s.bank || 0;
      if (bank >= 1000000 && (s.heat||0) < 10) return 'S';
      if (bank >= 500000 && (s.heat||0) < 20) return 'A';
      return 'B';
    },
  },
  {
    id: 'going_straight',
    name: 'Going Straight',
    emoji: '🏢',
    subtitle: 'The Legitimate Businessman',
    narrative: 'The fronts became real businesses. The laundered money became real revenue. Somewhere along the way, you stopped being a criminal and became an entrepreneur. The IRS was satisfied, the investors were satisfied, and your lawyer stopped losing sleep. You are a businessman now. But every dollar in your foundation still carries the ghost of its origin.',
    check: s => {
      const fronts = (s.frontBusinesses || []).length;
      const props = getTotalPropertyCount(s);
      return fronts >= 3 && props >= 2 && (s.debt || 0) <= 0;
    },
    priority: 7,
    gradeCheck: s => {
      const fronts = (s.frontBusinesses || []).length;
      if (fronts >= 6 && getTotalPropertyCount(s) >= 5) return 'S';
      if (fronts >= 4) return 'A';
      return 'B';
    },
  },
  {
    id: 'informant',
    name: 'The Informant',
    emoji: '🐀',
    subtitle: 'The Price of Freedom',
    narrative: 'You gave them everything. Names, dates, routes, stash houses. In exchange, they gave you a new name and an apartment in a city you\'d never heard of. Your crew went down one by one. Your territory was carved up by the feds. On TV, they called it the biggest bust in the city\'s history. Nobody mentioned your name. That was the point.',
    check: s => {
      return (s.investigation && s.investigation.timesArrested >= 2) && (s.campaign && s.campaign.flags && s.campaign.flags.cooperated);
    },
    priority: 6,
    gradeCheck: () => 'B', // No great way to be an informant
  },
  {
    id: 'blaze_of_glory',
    name: 'Blaze of Glory',
    emoji: '💥',
    subtitle: 'Going Down Swinging',
    narrative: 'They came for you on a Tuesday. SWAT, DEA, FBI — the alphabet soup of law enforcement kicking down your door. You could have surrendered. You could have run. Instead, you picked up your weapon and wrote the last chapter in blood and fire. The streets will remember your name. The legends will grow. You went out like a king.',
    check: s => {
      return (s.health || 0) <= 20 && (s.heat || 0) >= 80 && (s.investigation && s.investigation.points >= 70);
    },
    priority: 5,
    gradeCheck: s => {
      if (s.peopleKilled >= 20) return 'S';
      if (s.peopleKilled >= 10) return 'A';
      return 'B';
    },
  },
  {
    id: 'the_fall',
    name: 'The Fall',
    emoji: '📉',
    subtitle: 'From Everything to Nothing',
    narrative: 'It didn\'t happen all at once. First the territory, then the crew, then the money. Each loss led to the next like dominos falling across the city. By the end, you were back where you started — a nobody with nothing, watching the sun set over Miami and wondering where it all went wrong. But you\'re alive. That counts for something.',
    check: s => {
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      return nw < 0 && Object.keys(s.territory || {}).length === 0 && (s.henchmen || []).length <= 1;
    },
    priority: 3,
    gradeCheck: () => 'C',
  },
  {
    id: 'partnership',
    name: 'The Partnership',
    emoji: '🤝',
    subtitle: 'Shared Power',
    narrative: 'Neither of you could take the other out without destroying everything. So you sat down, split the city, and shook hands over champagne. An uneasy peace. Both of you too strong to fight, too proud to serve. The city has two kings now. How long that lasts is anyone\'s guess.',
    check: s => {
      return (s.rep && s.rep.trust >= 50) && Object.keys(s.territory || {}).length >= 3 && (s.campaign && s.campaign.flags && s.campaign.flags.allianceForged);
    },
    priority: 7,
    gradeCheck: s => {
      if (s.rep && s.rep.trust >= 80) return 'S';
      if (s.rep && s.rep.trust >= 60) return 'A';
      return 'B';
    },
  },
  {
    id: 'politician',
    name: 'The Politician',
    emoji: '🏛️',
    subtitle: 'Power Behind the Throne',
    narrative: 'The judge owed you. The commissioner owed you. The mayor? He was your candidate from the start. You traded bullets for ballots and street corners for corner offices. The drug money built campaign coffers. The enforcers became lobbyists. You are the power behind every decision in this city, and nobody will ever see your hand on the lever.',
    check: s => {
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      return nw >= 200000 && (s.stats && s.stats.totalBribesPaid >= 50000) && (s.rep && s.rep.publicImage >= 30);
    },
    priority: 8,
    gradeCheck: s => {
      if (s.stats && s.stats.totalBribesPaid >= 200000) return 'S';
      if (s.stats && s.stats.totalBribesPaid >= 100000) return 'A';
      return 'B';
    },
  },
  {
    id: 'family_first',
    name: 'Family First',
    emoji: '🏠',
    subtitle: 'What Really Matters',
    narrative: 'You had everything. Territory, money, power, respect. And then you looked at the person sitting across the dinner table — really looked — and saw the fear in their eyes. The choice was simple once you stopped lying to yourself. You walked away from all of it. The penthouse became a suburb. The empire became a memory. Some nights you miss it. Every night, you know you made the right call.',
    check: s => {
      return (s.campaign && s.campaign.flags && s.campaign.flags.choseFamily);
    },
    priority: 9,
    gradeCheck: () => 'A',
  },
  {
    id: 'martyr',
    name: 'The Martyr',
    emoji: '🕊️',
    subtitle: 'The Ultimate Sacrifice',
    narrative: 'They were your people. Every last one of them. And when the walls closed in, you did the only thing that mattered — you drew all the fire. Every cop, every fed, every rival. All eyes on you while your crew scattered into the wind. They\'ll carry your name like a prayer. In the barrio, in the projects, in every corner of this city, they\'ll tell the story of the one who gave everything so his people could live.',
    check: s => {
      const loyalCrew = (s.henchmen || []).filter(h => h.loyalty >= 90).length;
      return loyalCrew >= 3 && (s.health || 0) <= 15;
    },
    priority: 9,
    gradeCheck: s => {
      const loyalCrew = (s.henchmen || []).filter(h => h.loyalty >= 90).length;
      if (loyalCrew >= 5) return 'S';
      return 'A';
    },
  },
  {
    id: 'hostile_takeover',
    name: 'Hostile Takeover',
    emoji: '⚔️',
    subtitle: 'Absorb Everything',
    narrative: 'One by one, they all fell. The Colombians, the Cubans, the bikers, the mob — every organization that dared to operate in your city. Some were conquered by force. Some surrendered. Some were absorbed so quietly their own people didn\'t realize it had happened. You own it all now. Every gram, every corner, every dollar. The weight of it is crushing. But there is no one left to share it with.',
    check: s => {
      return Object.keys(s.territory || {}).length >= 10;
    },
    priority: 10,
    gradeCheck: s => {
      const t = Object.keys(s.territory || {}).length;
      if (t >= 20) return 'S';
      if (t >= 15) return 'A';
      if (t >= 10) return 'B';
      return 'C';
    },
  },
  {
    id: 'the_deal',
    name: 'The Deal',
    emoji: '📋',
    subtitle: 'Negotiated Freedom',
    narrative: 'They wanted the cartel. You had the evidence. It wasn\'t snitching — it was negotiation between professionals. You gave them the international connection, the shipping routes, the names that mattered. In exchange, they gave you immunity and a quiet retirement. Your crew doesn\'t know. The streets don\'t know. Everyone thinks you beat the system. Only you know the truth: you played it.',
    check: s => {
      return (s.investigation && s.investigation.timesArrested >= 1) &&
             (s.rep && s.rep.streetCred >= 30) &&
             (s.campaign && s.campaign.flags && s.campaign.flags.negotiatedDeal);
    },
    priority: 7,
    gradeCheck: s => {
      if (s.rep && s.rep.trust >= 40) return 'A';
      return 'B';
    },
  },
];

// ============================================================
// NEW GAME+ EXCLUSIVE ENDINGS (8)
// ============================================================
const NG_PLUS_ENDINGS = [
  {
    id: 'ng_immortal',
    name: 'The Immortal',
    emoji: '♾️',
    subtitle: 'Beyond Legend',
    narrative: 'You\'ve done it all before. The come up, the empire, the reckoning. But this time you rewrote every rule. Your name isn\'t just known — it\'s eternal. Every dealer, every cop, every politician speaks it in whispers. You didn\'t just build an empire. You built a mythology. In a hundred years, when the streets have changed and the drugs have new names, they will still tell stories about you.',
    check: s => {
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      const territories = Object.keys(s.territory || {}).length;
      return s.newGamePlus && nw >= 2000000 && territories >= 10 && (s.henchmen || []).length >= 8;
    },
    priority: 15,
    gradeCheck: s => {
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      if (nw >= 5000000) return 'S';
      if (nw >= 3000000) return 'A';
      return 'B';
    },
  },
  {
    id: 'ng_ghost',
    name: 'The Ghost',
    emoji: '👻',
    subtitle: 'Never Existed',
    narrative: 'The second time around, you learned the most valuable lesson: the best criminals are the ones nobody knows exist. No territory to your name, no crew in your employ, yet you control everything from the shadows. Your fortune sits in accounts that don\'t exist in banks that won\'t acknowledge your name. You are the most powerful person in the city, and no one will ever know.',
    check: s => {
      return s.newGamePlus && (s.bank || 0) >= 1000000 && (s.heat || 0) === 0 && (s.rep && (s.rep.heatSignature || 0) < 5);
    },
    priority: 14,
    gradeCheck: s => {
      if ((s.bank||0) >= 3000000 && (s.heat||0) === 0) return 'S';
      return 'A';
    },
  },
  {
    id: 'ng_cartel_king',
    name: 'Cartel King',
    emoji: '🌎',
    subtitle: 'International Empire',
    narrative: 'The first time, you conquered a city. This time, you conquered continents. Your import routes span every ocean. Your processing labs operate in every timezone. The Colombian cartels, the Mexican syndicates, the European mobs — they all answer to you now. You are not a drug dealer anymore. You are an industry.',
    check: s => {
      return s.newGamePlus && s.importExport && (s.importExport.totalImports || 0) >= 50 && s.factions && (s.factions.absorptions || []).length >= 3;
    },
    priority: 13,
    gradeCheck: s => {
      if (s.factions && (s.factions.absorptions || []).length >= 6) return 'S';
      if ((s.importExport.totalImports || 0) >= 100) return 'A';
      return 'B';
    },
  },
  {
    id: 'ng_philanthropist',
    name: 'The Philanthropist',
    emoji: '💝',
    subtitle: 'Redemption Arc',
    narrative: 'You built the empire twice. And the second time, you used every dirty dollar to build something clean. Schools in the barrio. Clinics in the projects. Scholarships for kids who remind you of yourself. The money is still dirty, but the hands it reaches are clean. History will judge you. But the people whose lives you changed? They\'ll remember the good.',
    check: s => {
      return s.newGamePlus && (s.rep && s.rep.publicImage >= 60) && (s.frontBusinesses || []).length >= 4 && (s.stats && s.stats.totalLaunderedMoney >= 200000);
    },
    priority: 12,
    gradeCheck: s => {
      if (s.rep && s.rep.publicImage >= 80) return 'S';
      return 'A';
    },
  },
  {
    id: 'ng_shadow_gov',
    name: 'Shadow Government',
    emoji: '🏛️',
    subtitle: 'The Real Power',
    narrative: 'The second time around, you skipped the drugs entirely — well, almost. Your real product was power. Every politician bought, every judge corrupted, every law written in your favor. The city government is your puppet show. The state follows. Why rule the streets when you can rule the law? You are the deepest state there is.',
    check: s => {
      return s.newGamePlus && s.politics && Object.keys(s.politics.corruptOfficials || {}).length >= 5 && (s.politics.politicalInfluence || 0) >= 70;
    },
    priority: 13,
    gradeCheck: s => {
      if (s.politics && (s.politics.politicalInfluence || 0) >= 90) return 'S';
      if (Object.keys(s.politics.corruptOfficials || {}).length >= 7) return 'A';
      return 'B';
    },
  },
  {
    id: 'ng_warlord',
    name: 'The Warlord',
    emoji: '⚔️',
    subtitle: 'Blood and Iron',
    narrative: 'Diplomacy? Negotiation? Mergers? Those are for the first playthrough. This time, you chose violence. Every rival crushed, every territory taken by force, every enemy buried. Your crew is an army. Your safehouses are fortresses. Miami isn\'t a city anymore. It\'s a warzone with one winner. You stand in the ruins of everyone who ever opposed you.',
    check: s => {
      return s.newGamePlus && (s.rep && s.rep.fear >= 80) && (s.peopleKilled || 0) >= 30 && s.factions && Object.keys(s.factions.wars || {}).length >= 0 && (s.factions.absorptions || []).length >= 2;
    },
    priority: 12,
    gradeCheck: s => {
      if ((s.peopleKilled || 0) >= 50 && s.rep && s.rep.fear >= 95) return 'S';
      if ((s.peopleKilled || 0) >= 40) return 'A';
      return 'B';
    },
  },
  {
    id: 'ng_chemist',
    name: 'The Chemist',
    emoji: '⚗️',
    subtitle: 'Breaking Bad',
    narrative: 'The first time, you moved product. The second time, you created it. Your labs produce the purest product the world has ever seen. Quality so high that your name is synonymous with perfection. Other dealers sell drugs. You sell art. The chemistry degree you never got? Irrelevant. You wrote the textbook.',
    check: s => {
      return s.newGamePlus && s.processing && (s.processing.totalBatchesCooked || 0) >= 30 && (s.processing.chemistryXp || 0) >= 500;
    },
    priority: 11,
    gradeCheck: s => {
      if (s.processing && (s.processing.totalBatchesCooked || 0) >= 60) return 'S';
      if ((s.processing.chemistryXp || 0) >= 800) return 'A';
      return 'B';
    },
  },
  {
    id: 'ng_perfect',
    name: 'The Perfect Run',
    emoji: '🌟',
    subtitle: 'Flawless Victory',
    narrative: 'Zero arrests. Zero scandals. Zero failed missions. You played the game a second time and you played it perfectly. Every move calculated, every risk measured, every outcome predetermined. The streets are yours, the money is clean, and your record is spotless. They say crime doesn\'t pay. You proved it pays very, very well — when you do it right.',
    check: s => {
      return s.newGamePlus && (s.investigation && s.investigation.timesArrested === 0) && (s.heat || 0) < 20 && (s.cash||0) + (s.bank||0) >= 500000 && Object.keys(s.territory || {}).length >= 5;
    },
    priority: 15,
    gradeCheck: s => {
      const nw = (s.cash||0) + (s.bank||0) - (s.debt||0);
      if (nw >= 2000000 && (s.heat||0) === 0) return 'S';
      if (nw >= 1000000) return 'A';
      return 'B';
    },
  },
];

function initCampaign() {
  return {
    currentAct: 1,
    milestonesCompleted: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    actTransitions: [],
    endingTrackers: {},
    flags: {},
    actNotified: { 1: true }, // Act 1 starts notified
  };
}

// Get current act data
function getCurrentAct(state) {
  const actNum = (state.campaign && state.campaign.currentAct) || 1;
  return CAMPAIGN_ACTS.find(a => a.act === actNum) || CAMPAIGN_ACTS[0];
}

// Get act modifiers for current act
function getActModifiers(state) {
  const act = getCurrentAct(state);
  return act.modifiers || { encounterDifficulty: 1.0, heatGainMod: 1.0, priceVolatility: 1.0 };
}

// Check milestones and potentially transition acts - called daily
function checkActMilestones(state) {
  if (!state.campaign) state.campaign = initCampaign();
  const campaign = state.campaign;
  const currentActNum = campaign.currentAct;
  const act = CAMPAIGN_ACTS.find(a => a.act === currentActNum);
  if (!act) return null;

  // Check all milestones for current act
  if (!campaign.milestonesCompleted[currentActNum]) campaign.milestonesCompleted[currentActNum] = [];
  const completed = campaign.milestonesCompleted[currentActNum];

  for (const milestone of act.milestones) {
    if (completed.includes(milestone.id)) continue;
    try {
      if (milestone.check(state)) {
        completed.push(milestone.id);
      }
    } catch (e) { /* milestone check failed, skip */ }
  }

  // Check if we should advance to next act
  if (completed.length >= act.requiredMilestones && currentActNum < 5) {
    // Also check minimum day requirement
    if (state.day >= act.dayRange[0]) {
      return transitionAct(state, currentActNum + 1);
    }
  }

  return null;
}

// Transition to a new act
function transitionAct(state, newActNum) {
  if (!state.campaign) state.campaign = initCampaign();

  const oldAct = state.campaign.currentAct;
  state.campaign.currentAct = newActNum;
  state.campaign.actTransitions.push({ from: oldAct, to: newActNum, day: state.day });

  const newAct = CAMPAIGN_ACTS.find(a => a.act === newActNum);

  return {
    type: 'act_transition',
    fromAct: oldAct,
    toAct: newActNum,
    actName: newAct ? newAct.name : 'Unknown',
    actEmoji: newAct ? newAct.emoji : '?',
    actDesc: newAct ? newAct.desc : '',
  };
}

// Determine which ending the player has earned
function determineEnding(state) {
  const eligible = [];

  // Check NG+ endings first if in NG+ mode
  if (state.newGamePlus && typeof NG_PLUS_ENDINGS !== 'undefined') {
    for (const ending of NG_PLUS_ENDINGS) {
      try {
        if (ending.check(state)) {
          const grade = ending.gradeCheck ? ending.gradeCheck(state) : 'C';
          eligible.push({ ...ending, grade, isNgPlus: true });
        }
      } catch (e) { /* skip failed checks */ }
    }
  }

  for (const ending of CAMPAIGN_ENDINGS) {
    try {
      if (ending.check(state)) {
        const grade = ending.gradeCheck ? ending.gradeCheck(state) : 'C';
        eligible.push({ ...ending, grade });
      }
    } catch (e) { /* skip failed checks */ }
  }

  if (eligible.length === 0) {
    // Default ending: The Fall
    const fallEnding = CAMPAIGN_ENDINGS.find(e => e.id === 'the_fall');
    return { ...fallEnding, grade: 'C' };
  }

  // Sort by priority (highest first), then by grade
  const gradeOrder = { S: 4, A: 3, B: 2, C: 1 };
  eligible.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return (gradeOrder[b.grade] || 0) - (gradeOrder[a.grade] || 0);
  });

  return eligible[0];
}

// Get milestone progress for current act
function getActMilestoneProgress(state) {
  if (!state.campaign) return { completed: 0, required: 0, total: 0, milestones: [] };
  const actNum = state.campaign.currentAct;
  const act = CAMPAIGN_ACTS.find(a => a.act === actNum);
  if (!act) return { completed: 0, required: 0, total: 0, milestones: [] };

  const completedIds = state.campaign.milestonesCompleted[actNum] || [];

  return {
    completed: completedIds.length,
    required: act.requiredMilestones,
    total: act.milestones.length,
    milestones: act.milestones.map(m => ({
      ...m,
      isCompleted: completedIds.includes(m.id),
    })),
  };
}

// Set a campaign flag (for story choices)
function setCampaignFlag(state, flagName, value) {
  if (!state.campaign) state.campaign = initCampaign();
  state.campaign.flags[flagName] = value !== undefined ? value : true;
}

// Check a campaign flag
function hasCampaignFlag(state, flagName) {
  return !!(state.campaign && state.campaign.flags && state.campaign.flags[flagName]);
}
