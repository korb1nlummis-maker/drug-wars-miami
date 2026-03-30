// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Campaign Mission System
// 5 Acts, 30+ Main Missions, 50+ Side Missions
// 80-Hour Campaign Structure
// ============================================================

const CAMPAIGN_CONFIG = {
  totalActs: 5,
  estimatedHours: 80,
  mainMissionsTotal: 30,
  sideMissionsTotal: 55,
};

const CAMPAIGN_ACTS = [
  {
    id: 'act1', name: 'Act 1: The Come Up', emoji: '🌱',
    hoursRange: [1, 16],
    dayRange: [1, 60],
    desc: 'You are nobody. Learn the trade, build a crew, claim territory. By the end, you have a foothold.',
    unlockMessage: 'The streets are calling. Time to make a name.',
    mainMissions: [
      {
        id: 'M1_1', name: 'First Blood', emoji: '🩸',
        hoursRange: [1, 2],
        desc: 'Tutorial mission unique to your character. Make your first deal, learn the basics.',
        characterVariants: {
          corner_kid: 'Handle your first day on the block. Move the OG\'s package.',
          dropout: 'Make your first deal on campus. Small, quiet, terrifying.',
          ex_con: 'Meet your prison contact. Set up the first drop.',
          hustler: 'Turn your con skills to the real game. First supply buy.',
          connected_kid: 'Step into your parent\'s shoes. The crew is watching.',
          cleanskin: 'Cross the line from observer to participant. First purchase.',
          veteran: 'Gear up. Find the nearest corner. Make it yours by force.',
          immigrant: 'Navigate the strange streets. Find the community. Find the product.',
        },
        objectives: [
          { id: 'buy_first', desc: 'Purchase your first product', type: 'buy_drug', target: 1 },
          { id: 'sell_first', desc: 'Make your first sale', type: 'sell_drug', target: 1 },
        ],
        reward: { cash: 500, rep: 5, xp: 50 },
        unlocks: ['basic_dealing', 'market_ui'],
        autoComplete: false,
      },
      {
        id: 'M1_2', name: 'The Block', emoji: '🏘️',
        hoursRange: [2, 3],
        desc: 'Claim your first territory block. Each character approaches this differently.',
        characterVariants: {
          corner_kid: 'Defend a block from a small independent crew.',
          dropout: 'Find an uncontested college area to claim.',
          ex_con: 'Use your reputation to take a block without a fight.',
          hustler: 'Buy your way into a territory arrangement.',
          connected_kid: 'Solidify control of your inherited territory.',
          cleanskin: 'Find a quiet block nobody\'s watching.',
          veteran: 'Intimidate a solo dealer off his corner.',
          immigrant: 'Earn community trust to operate in their area.',
        },
        objectives: [
          { id: 'claim_territory', desc: 'Control your first territory', type: 'own_territory', target: 1 },
        ],
        reward: { cash: 1000, rep: 10, xp: 100 },
        requires: ['M1_1'],
        unlocks: ['territory_ui', 'passive_income'],
      },
      {
        id: 'M1_3', name: 'Building Crew', emoji: '👥',
        hoursRange: [3, 5],
        desc: 'Recruit your first crew member. Find a prospect, earn trust, make the offer.',
        objectives: [
          { id: 'recruit_crew', desc: 'Recruit a new crew member', type: 'crew_count', target: 1 },
          { id: 'complete_job', desc: 'Complete a job with your recruit', type: 'missions_done', target: 1 },
        ],
        reward: { cash: 500, rep: 8, xp: 80 },
        requires: ['M1_2'],
        unlocks: ['crew_management_ui', 'crew_roles'],
      },
      {
        id: 'M1_4', name: 'The Supplier', emoji: '📦',
        hoursRange: [5, 7],
        desc: 'Your street-level supply is unreliable. Navigate introductions to find a real supplier.',
        characterVariants: {
          ex_con: 'Use prison connections for an introduction.',
          immigrant: 'Leverage Caribbean contacts.',
          connected_kid: 'Your parent\'s old supplier reaches out.',
          default: 'Earn introductions through reputation or favors.',
        },
        objectives: [
          { id: 'earn_rep', desc: 'Reach 25 reputation', type: 'reputation', target: 25 },
          { id: 'buy_bulk', desc: 'Make a bulk purchase (10+ units)', type: 'buy_amount', target: 10 },
        ],
        reward: { cash: 2000, rep: 12, xp: 120 },
        requires: ['M1_3'],
        unlocks: ['bulk_buying', 'quality_mechanics', 'supplier_contacts'],
      },
      {
        id: 'M1_5', name: 'First Heat', emoji: '🚔',
        hoursRange: [7, 9],
        desc: 'Your growing operation attracts attention. Deal with the heat system for the first time.',
        objectives: [
          { id: 'survive_encounter', desc: 'Survive a police encounter', type: 'police_encounter', target: 1 },
          { id: 'reduce_heat', desc: 'Reduce heat below 20', type: 'heat_below', target: 20 },
        ],
        reward: { cash: 1000, rep: 8, xp: 100 },
        requires: ['M1_4'],
        unlocks: ['lawyer_contact', 'heat_management_tools'],
      },
      {
        id: 'M1_6', name: 'Rival Introduction', emoji: '⚔️',
        hoursRange: [9, 12],
        desc: 'A rival faction makes their move. Respond: negotiate, retreat, or fight.',
        objectives: [
          { id: 'faction_encounter', desc: 'Face the rival faction', type: 'faction_event', target: 1 },
          { id: 'resolve_conflict', desc: 'Resolve the conflict (any method)', type: 'conflict_resolved', target: 1 },
        ],
        reward: { cash: 3000, rep: 15, xp: 150 },
        requires: ['M1_5'],
        unlocks: ['faction_diplomacy', 'gang_war_mechanics'],
        choiceConsequences: true, // Player choice affects faction relationships
      },
      {
        id: 'M1_7', name: 'The Score', emoji: '💰',
        hoursRange: [12, 16],
        desc: 'Act 1 climax. A major opportunity: large deal, rival\'s stash, or corrupt cop deal.',
        objectives: [
          { id: 'big_score', desc: 'Complete the big score', type: 'special_mission', target: 1 },
          { id: 'reach_cash', desc: 'Accumulate $25,000 total cash', type: 'cash', target: 25000 },
        ],
        reward: { cash: 15000, rep: 25, xp: 300 },
        requires: ['M1_6'],
        unlocks: ['act2'],
        isActClimax: true,
        approaches: ['stealth', 'force', 'negotiation'], // Multi-approach
      },
    ],
    sideMissions: [
      { id: 'S1_1', name: 'Repo Man', desc: 'Collect debts for a loan shark. 3 collections, escalating difficulty.', reward: { cash: 3000, rep: 5, xp: 80 }, unlocks: ['loan_shark_contact'] },
      { id: 'S1_2', name: 'Corner Store', desc: 'Protect a local business from vandals for 3 days.', reward: { cash: 2000, rep: 8, xp: 60 }, unlocks: ['potential_front'] },
      { id: 'S1_3', name: 'The Chemist', desc: 'Source ingredients for a local cook. 3 components.', reward: { cash: 1500, rep: 5, xp: 100 }, unlocks: ['processing_tutorial', 'cook_recruit'] },
      { id: 'S1_4', name: 'Jailbird', desc: 'Bail out an associate. Raise $2,000 in 48 hours.', reward: { cash: 0, rep: 10, xp: 80 }, unlocks: ['loyal_crew_member', 'lawyer_relationship'] },
      { id: 'S1_5', name: 'Street Race', desc: 'Win 3 underground races against escalating opponents.', reward: { cash: 5000, rep: 5, xp: 100 }, unlocks: ['vehicle', 'driving_skill_boost', 'racer_contact'] },
      { id: 'S1_6', name: 'The Snitch', desc: 'Investigate 3 suspects to find the neighborhood informant.', reward: { cash: 1000, rep: 12, xp: 120 }, unlocks: ['intelligence_intro', 'community_trust', 'reduced_heat'] },
      { id: 'S1_7', name: 'Stash Hunt', desc: 'Follow clues from a Cartel Remnant about buried 80s stash.', reward: { cash: 8000, rep: 5, xp: 100 }, unlocks: ['cartel_remnant_rep'] },
      { id: 'S1_8', name: 'Turf War (Mini)', desc: 'Handle an encroaching independent dealer.', reward: { cash: 2000, rep: 8, xp: 80 }, unlocks: ['extra_territory'] },
    ],
  },
  {
    id: 'act2', name: 'Act 2: The Expansion', emoji: '📈',
    hoursRange: [16, 32],
    dayRange: [61, 150],
    desc: 'You\'re a player now. Expand territory, build supply chains, navigate faction politics.',
    unlockMessage: 'The come-up is over. Now the real game begins.',
    mainMissions: [
      {
        id: 'M2_1', name: 'New Territories', emoji: '🗺️',
        desc: 'Expand into a second district. Each has different challenges and opportunities.',
        objectives: [
          { id: 'control_districts', desc: 'Control territory in 2 districts', type: 'districts_controlled', target: 2 },
          { id: 'hold_territory', desc: 'Hold both territories for 7 days', type: 'territory_held_days', target: 7 },
        ],
        reward: { cash: 5000, rep: 20, xp: 200 },
        requires: ['M1_7'],
      },
      {
        id: 'M2_2', name: 'Supply Chain', emoji: '🔗',
        desc: 'Establish a reliable supply chain. Your one supplier isn\'t enough anymore.',
        objectives: [
          { id: 'second_supplier', desc: 'Establish a second supplier connection', type: 'suppliers', target: 2 },
          { id: 'import_route', desc: 'Set up a basic import route', type: 'import_routes', target: 1 },
        ],
        reward: { cash: 8000, rep: 15, xp: 200 },
        requires: ['M2_1'],
        unlocks: ['import_export_ui', 'caribbean_access'],
      },
      {
        id: 'M2_3', name: 'The Laundry', emoji: '🧹',
        desc: 'Your cash pile is attracting attention. Set up money laundering operations.',
        objectives: [
          { id: 'buy_front', desc: 'Purchase a front business', type: 'fronts_owned', target: 1 },
          { id: 'launder_cash', desc: 'Launder $10,000', type: 'cash_laundered', target: 10000 },
        ],
        reward: { cash: 3000, rep: 12, xp: 180 },
        requires: ['M2_1'],
        unlocks: ['laundering_advanced', 'shell_companies'],
      },
      {
        id: 'M2_4', name: 'Faction War', emoji: '⚔️',
        desc: 'Two major factions go to war. You must choose a side or try to profit from both.',
        objectives: [
          { id: 'choose_side', desc: 'Choose a side in the faction war (or stay neutral)', type: 'faction_choice', target: 1 },
          { id: 'complete_war_mission', desc: 'Complete a war-related mission', type: 'war_mission', target: 1 },
        ],
        reward: { cash: 15000, rep: 25, xp: 250 },
        requires: ['M2_2'],
        choiceConsequences: true,
      },
      {
        id: 'M2_5', name: 'The Feds', emoji: '🏛️',
        desc: 'Federal attention arrives. DEA starts sniffing around your operations.',
        objectives: [
          { id: 'survive_investigation', desc: 'Survive a federal investigation probe', type: 'investigation_survive', target: 1 },
          { id: 'keep_heat_low', desc: 'Keep heat below 40 for 5 days while under scrutiny', type: 'heat_control', target: 5 },
        ],
        reward: { cash: 5000, rep: 15, xp: 200 },
        requires: ['M2_3'],
        unlocks: ['federal_heat_tier', 'advanced_stealth'],
      },
      {
        id: 'M2_6', name: 'International Waters', emoji: '🌊',
        desc: 'Your first international connection. Caribbean supply route opens.',
        objectives: [
          { id: 'international_deal', desc: 'Complete an international deal', type: 'international_deals', target: 1 },
          { id: 'profit_target', desc: 'Make $20,000 profit from imported goods', type: 'import_profit', target: 20000 },
        ],
        reward: { cash: 20000, rep: 30, xp: 300 },
        requires: ['M2_5'],
        unlocks: ['caribbean_routes', 'boat_smuggling'],
      },
      {
        id: 'M2_7', name: 'Power Play', emoji: '♟️',
        desc: 'Act 2 climax. A power vacuum creates opportunity. Multiple factions make their bid.',
        objectives: [
          { id: 'total_cash', desc: 'Accumulate $100,000', type: 'cash', target: 100000 },
          { id: 'territory_count', desc: 'Control 5+ territories', type: 'own_territory', target: 5 },
          { id: 'crew_size', desc: 'Have 5+ crew members', type: 'crew_count', target: 5 },
        ],
        reward: { cash: 50000, rep: 40, xp: 500 },
        requires: ['M2_6'],
        unlocks: ['act3'],
        isActClimax: true,
      },
    ],
    sideMissions: [
      { id: 'S2_1', name: 'The Accountant', desc: 'Recruit a money man to manage laundering. Multi-step interview process.', reward: { cash: 5000, rep: 8, xp: 120 } },
      { id: 'S2_2', name: 'Port Introduction', desc: 'Get an introduction to the Port Authority. Prove you can move volume.', reward: { cash: 3000, rep: 10, xp: 100 } },
      { id: 'S2_3', name: 'The Processing Lab', desc: 'Set up your first processing lab. Source equipment, find a location.', reward: { cash: 8000, rep: 8, xp: 150 } },
      { id: 'S2_4', name: 'Witness Protection', desc: 'A witness is going to testify. Deal with the situation.', reward: { cash: 10000, rep: 15, xp: 200 } },
      { id: 'S2_5', name: 'The Politician', desc: 'A local politician needs campaign funds. You need favors.', reward: { cash: 0, rep: 20, xp: 150 }, unlocks: ['political_connections'] },
      { id: 'S2_6', name: 'Boat Captain', desc: 'Recruit a boat captain for Caribbean runs. Test voyage.', reward: { cash: 5000, rep: 5, xp: 100 } },
      { id: 'S2_7', name: 'The Betrayer', desc: 'A crew member is feeding info. Find them before it\'s too late.', reward: { cash: 2000, rep: 15, xp: 180 } },
      { id: 'S2_8', name: 'Property Empire', desc: 'Acquire 3 properties across different districts.', reward: { cash: 5000, rep: 10, xp: 120 } },
      { id: 'S2_9', name: 'Cuban Connection', desc: 'Gain Los Cubanos trust through a series of favors.', reward: { cash: 10000, rep: 15, xp: 200 } },
      { id: 'S2_10', name: 'Stadium Score', desc: 'Set up operations around Hard Rock Stadium for game day.', reward: { cash: 15000, rep: 10, xp: 150 } },
      { id: 'S2_11', name: 'The Lab Rat', desc: 'Help a chemist perfect a new formula. Requires chemistry skill.', reward: { cash: 8000, rep: 5, xp: 200 } },
      { id: 'S2_12', name: 'Turf Wars', desc: 'Defend territory from 3 consecutive attacks over 10 days.', reward: { cash: 12000, rep: 20, xp: 250 } },
    ],
  },
  {
    id: 'act3', name: 'Act 3: The Empire', emoji: '🏰',
    hoursRange: [32, 50],
    dayRange: [151, 300],
    desc: 'You run a real operation now. Manage your empire, handle political pressure, go international.',
    unlockMessage: 'You\'ve built something real. Now comes the hard part — keeping it.',
    mainMissions: [
      {
        id: 'M3_1', name: 'The Organization', emoji: '🏛️',
        desc: 'Restructure your crew into a proper hierarchy. Lieutenants, captains, soldiers.',
        objectives: [
          { id: 'promote_lieutenant', desc: 'Promote a crew member to lieutenant', type: 'crew_rank', target: 'lieutenant' },
          { id: 'crew_ten', desc: 'Maintain a crew of 10+', type: 'crew_count', target: 10 },
        ],
        reward: { cash: 10000, rep: 20, xp: 250 },
        requires: ['M2_7'],
      },
      {
        id: 'M3_2', name: 'The Colombian', emoji: '🇨🇴',
        desc: 'The Colombian Connection notices you. A direct supply line is possible — if you can handle the volume.',
        objectives: [
          { id: 'discover_colombian', desc: 'Discover the Colombian Connection', type: 'faction_discovered', target: 'colombian_connection' },
          { id: 'volume_requirement', desc: 'Move $200,000 in product in 30 days', type: 'sales_volume', target: 200000 },
        ],
        reward: { cash: 50000, rep: 30, xp: 400 },
        requires: ['M3_1'],
        unlocks: ['colombian_supply', 'wholesale_prices'],
      },
      {
        id: 'M3_3', name: 'Political Machine', emoji: '🏛️',
        desc: 'Build political infrastructure. Bribe officials, fund campaigns, build a protection network.',
        objectives: [
          { id: 'political_contacts', desc: 'Establish 3 political connections', type: 'political_contacts', target: 3 },
          { id: 'bribe_official', desc: 'Successfully bribe a public official', type: 'bribes', target: 1 },
        ],
        reward: { cash: 10000, rep: 25, xp: 300 },
        requires: ['M3_1'],
        unlocks: ['political_protection', 'reduced_federal_heat'],
      },
      {
        id: 'M3_4', name: 'The Pipeline', emoji: '🔧',
        desc: 'Build a complete supply pipeline from source to street. Integration across your operation.',
        objectives: [
          { id: 'full_pipeline', desc: 'Operate: import → process → distribute → launder', type: 'pipeline_complete', target: 1 },
          { id: 'monthly_revenue', desc: 'Generate $50,000/day passive income', type: 'daily_income', target: 50000 },
        ],
        reward: { cash: 100000, rep: 40, xp: 500 },
        requires: ['M3_2'],
      },
      {
        id: 'M3_5', name: 'RICO Warning', emoji: '⚖️',
        desc: 'The feds are building a RICO case. Your empire is under existential threat.',
        objectives: [
          { id: 'destroy_evidence', desc: 'Destroy or hide evidence (reduce investigation to 0)', type: 'investigation_level', target: 0 },
          { id: 'survive_rico', desc: 'Avoid arrest for 30 days under federal pressure', type: 'days_free', target: 30 },
        ],
        reward: { cash: 25000, rep: 35, xp: 400 },
        requires: ['M3_4'],
        unlocks: ['rico_countermeasures'],
      },
      {
        id: 'M3_6', name: 'The Summit', emoji: '🤝',
        desc: 'Act 3 climax. All faction leaders gather. A new power structure must be established.',
        objectives: [
          { id: 'summit_attend', desc: 'Attend the faction summit', type: 'special_event', target: 1 },
          { id: 'empire_value', desc: 'Empire net worth exceeds $1,000,000', type: 'net_worth', target: 1000000 },
        ],
        reward: { cash: 200000, rep: 50, xp: 750 },
        requires: ['M3_5'],
        unlocks: ['act4'],
        isActClimax: true,
        choiceConsequences: true,
      },
    ],
    sideMissions: [
      { id: 'S3_1', name: 'Real Estate Empire', desc: 'Acquire properties in every high-value district.', reward: { cash: 30000, rep: 15, xp: 250 } },
      { id: 'S3_2', name: 'The Submarine', desc: 'Locate and acquire a narco submarine.', reward: { cash: 0, rep: 20, xp: 300 }, unlocks: ['sub_smuggling'] },
      { id: 'S3_3', name: 'Double Agent', desc: 'Turn a police officer into your informant.', reward: { cash: 15000, rep: 25, xp: 350 } },
      { id: 'S3_4', name: 'Cartel Archaeology', desc: 'Follow Cartel Remnant maps to 5 hidden stash locations.', reward: { cash: 100000, rep: 10, xp: 200 } },
      { id: 'S3_5', name: 'The Judge', desc: 'Get a federal judge in your pocket.', reward: { cash: 0, rep: 30, xp: 300 }, unlocks: ['judicial_protection'] },
      { id: 'S3_6', name: 'International Expansion', desc: 'Establish operations in Jamaica and Haiti.', reward: { cash: 50000, rep: 20, xp: 300 } },
      { id: 'S3_7', name: 'Corporate Front', desc: 'Build a legitimate corporate structure.', reward: { cash: 20000, rep: 15, xp: 200 } },
      { id: 'S3_8', name: 'The Enforcer', desc: 'Recruit a legendary enforcer.', reward: { cash: 0, rep: 20, xp: 200 } },
      { id: 'S3_9', name: 'Celebrity Client', desc: 'Supply a celebrity. High reward, high visibility.', reward: { cash: 50000, rep: 10, xp: 150 } },
      { id: 'S3_10', name: 'Prison Break', desc: 'Break a valuable ally out of prison.', reward: { cash: 0, rep: 30, xp: 400 } },
      { id: 'S3_11', name: 'The Massacre', desc: 'Eliminate a rival faction completely. Point of no return.', reward: { cash: 75000, rep: 40, xp: 500 } },
      { id: 'S3_12', name: 'Offshore Paradise', desc: 'Set up offshore banking in the Bahamas.', reward: { cash: 0, rep: 15, xp: 200 }, unlocks: ['offshore_banking'] },
      { id: 'S3_13', name: 'The Chemist Returns', desc: 'Create a new designer drug. Name it. Market it.', reward: { cash: 100000, rep: 20, xp: 350 } },
      { id: 'S3_14', name: 'Election Day', desc: 'Rig a local election for your candidate.', reward: { cash: 0, rep: 35, xp: 300 } },
      { id: 'S3_15', name: 'The Armory', desc: 'Establish a weapons cache for war preparation.', reward: { cash: 10000, rep: 10, xp: 150 } },
    ],
  },
  {
    id: 'act4', name: 'Act 4: The Reckoning', emoji: '⚡',
    hoursRange: [50, 65],
    dayRange: [301, 450],
    desc: 'The pressure builds. Betrayal, federal heat, rival empires. Everything you built is tested.',
    unlockMessage: 'They\'re coming for everything. The question is: will you hold?',
    mainMissions: [
      {
        id: 'M4_1', name: 'The Betrayal', emoji: '🗡️',
        desc: 'Someone close to you is working with the feds. Find the traitor.',
        objectives: [
          { id: 'find_traitor', desc: 'Identify the betrayer in your organization', type: 'investigation_complete', target: 1 },
          { id: 'deal_with_traitor', desc: 'Deal with the traitor (mercy or punishment)', type: 'choice_made', target: 1 },
        ],
        reward: { cash: 20000, rep: 25, xp: 300 },
        requires: ['M3_6'],
        choiceConsequences: true,
      },
      {
        id: 'M4_2', name: 'The Siege', emoji: '🏰',
        desc: 'Multiple factions attack simultaneously. Defend your empire on multiple fronts.',
        objectives: [
          { id: 'defend_all', desc: 'Defend all territories in a multi-front war', type: 'turf_wars_won', target: 3 },
          { id: 'maintain_control', desc: 'Maintain control of at least 70% of territories', type: 'territory_percent', target: 70 },
        ],
        reward: { cash: 50000, rep: 35, xp: 400 },
        requires: ['M4_1'],
      },
      {
        id: 'M4_3', name: 'RICO', emoji: '⚖️',
        desc: 'Federal indictment incoming. Navigate the legal system or flee.',
        objectives: [
          { id: 'avoid_indictment', desc: 'Avoid or survive federal indictment', type: 'legal_survival', target: 1 },
        ],
        reward: { cash: 30000, rep: 30, xp: 350 },
        requires: ['M4_2'],
      },
      {
        id: 'M4_4', name: 'The Purge', emoji: '🔥',
        desc: 'Clean house. Remove threats, secure loyal allies, prepare for the endgame.',
        objectives: [
          { id: 'secure_crew', desc: 'Ensure all crew loyalty above 70%', type: 'crew_loyalty_min', target: 70 },
          { id: 'eliminate_threats', desc: 'Eliminate or neutralize 3 major threats', type: 'threats_handled', target: 3 },
        ],
        reward: { cash: 75000, rep: 40, xp: 500 },
        requires: ['M4_3'],
      },
      {
        id: 'M4_5', name: 'Point of No Return', emoji: '🚪',
        desc: 'Act 4 climax. The final choice: your path to the ending. No going back.',
        objectives: [
          { id: 'choose_ending_path', desc: 'Choose your ending path', type: 'ending_path_chosen', target: 1 },
        ],
        reward: { cash: 100000, rep: 50, xp: 750 },
        requires: ['M4_4'],
        unlocks: ['act5'],
        isActClimax: true,
        choiceConsequences: true,
        endingPathChoice: true, // This mission determines which Act 5 you play
      },
    ],
    sideMissions: [], // Act 4 is focused — no side missions, just the reckoning
  },
  {
    id: 'act5', name: 'Act 5: The Endgame', emoji: '🎭',
    hoursRange: [65, 80],
    dayRange: [451, 600],
    desc: 'Your final chapter. The ending you\'ve earned through every choice, every alliance, every betrayal.',
    unlockMessage: 'This is how it ends. Or how it begins again.',
    mainMissions: [], // Act 5 missions are determined by ending path — see endings-system.js
    sideMissions: [],
    isEndingAct: true, // Special handling — missions come from endings system
  },
];

// Initialize campaign state
function initCampaignState(characterId) {
  return {
    currentAct: 'act1',
    actProgress: { act1: 0, act2: 0, act3: 0, act4: 0, act5: 0 },
    completedMissions: [],
    activeMission: null,
    activeSideMissions: [], // Up to 3 active
    availableSideMissions: [],
    missionObjectives: {}, // Track progress per mission objective
    endingPath: null,
    totalMissionsCompleted: 0,
    totalSideMissionsCompleted: 0,
    campaignStartDay: 0,
    campaignComplete: false,
    choiceHistory: [], // Track major choices for ending determination
  };
}

// Get current act data
function getCurrentAct(state) {
  if (!state.campaign) return CAMPAIGN_ACTS[0];
  return CAMPAIGN_ACTS.find(a => a.id === state.campaign.currentAct) || CAMPAIGN_ACTS[0];
}

// Get available main missions
function getAvailableMainMissions(state) {
  if (!state.campaign) return [];
  const act = getCurrentAct(state);
  if (!act.mainMissions) return [];

  return act.mainMissions.filter(m => {
    // Already completed?
    if (state.campaign.completedMissions.includes(m.id)) return false;
    // Prerequisites met?
    if (m.requires) {
      for (const req of m.requires) {
        if (!state.campaign.completedMissions.includes(req)) return false;
      }
    }
    return true;
  });
}

// Get next main mission (first available)
function getNextMainMission(state) {
  const available = getAvailableMainMissions(state);
  return available.length > 0 ? available[0] : null;
}

// Check if a mission objective is complete
function checkMissionObjective(state, objective) {
  switch (objective.type) {
    case 'buy_drug': return (state.stats && state.stats.totalBuys || 0) >= objective.target;
    case 'sell_drug': return (state.stats && state.stats.totalSells || 0) >= objective.target;
    case 'own_territory': {
      const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      return territories.length >= objective.target;
    }
    case 'crew_count': return (state.henchmen || []).length >= objective.target;
    case 'reputation': return (state.reputation || 0) >= objective.target;
    case 'cash': return (state.cash || 0) >= objective.target;
    case 'net_worth': {
      const nw = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : (state.cash || 0);
      return nw >= objective.target;
    }
    case 'heat_below': return (state.heat || 0) < objective.target;
    case 'buy_amount': return (state.stats && state.stats.largestBuyQty || 0) >= objective.target;
    case 'fronts_owned': return (state.frontBusinesses || []).length >= objective.target;
    case 'districts_controlled': {
      const terrs = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      const uniqueDistricts = new Set(terrs);
      return uniqueDistricts.size >= objective.target;
    }
    case 'daily_income': {
      // Estimate daily income from all sources
      let income = 0;
      // Front businesses: look up dailyIncome from FRONT_BUSINESSES definitions
      if (state.frontBusinesses && typeof FRONT_BUSINESSES !== 'undefined') {
        income += state.frontBusinesses.reduce((s, f) => {
          const bizDef = FRONT_BUSINESSES.find(b => b.id === f.id);
          return s + (bizDef ? bizDef.dailyIncome : 0);
        }, 0);
      }
      // Territory income
      if (typeof getControlledTerritories === 'function') {
        const territories = getControlledTerritories(state);
        const perTerritory = (typeof TERRITORY_BENEFITS !== 'undefined' && TERRITORY_BENEFITS.dailyIncome) || 500;
        income += territories.length * perTerritory;
      }
      // Distribution income estimate
      if (state.distribution) {
        for (const locId in state.distribution) {
          if (!state.distribution.hasOwnProperty(locId)) continue;
          const dist = state.distribution[locId];
          if (dist && dist.active && dist.dealers && dist.dealers.length > 0) {
            income += dist.dealers.length * 500; // conservative per-dealer estimate
          }
        }
      }
      return income >= objective.target;
    }
    case 'crew_rank': {
      // Check if player has crew members of specified rank
      const targetRank = typeof objective.target === 'string'
        ? (typeof _resolveRankIndex === 'function' ? _resolveRankIndex(objective.target) : { 'street_worker': 0, 'soldier': 1, 'lieutenant': 2, 'underboss': 3, 'right_hand': 4, 'righthand': 4 }[objective.target.toLowerCase().replace(/[-\s]/g, '_')] || 0)
        : objective.target;
      return (state.henchmen || []).some(h => (typeof _resolveRankIndex === 'function' ? _resolveRankIndex(h.rank) : (h.rank || 0)) >= targetRank);
    }
    case 'faction_discovered': {
      // Check if player has discovered a faction (has a non-zero standing)
      if (!state.factions || !state.factions.standings) return false;
      if (objective.target) {
        // Check for a specific faction
        return state.factions.standings[objective.target] !== undefined && state.factions.standings[objective.target] !== 0;
      }
      // Check for any faction discovered
      return Object.values(state.factions.standings).some(s => s !== 0);
    }
    case 'faction_event': {
      // Check if a faction event has occurred
      if (!state.factions) return false;
      const eventCount = (state.factions.factionEvents || []).length;
      return eventCount >= (objective.target || 1);
    }
    case 'police_encounter': {
      // Check if player has had police encounters using encounter stats or investigation data
      const encounterCount = (state.encounters && state.encounters.stats && state.encounters.stats.totalEncounters) || 0;
      const timesArrested = (state.investigation && state.investigation.timesArrested) || 0;
      return (encounterCount + timesArrested) >= (objective.target || 1);
    }
    case 'special_mission': {
      // Check if a special mission flag is set in campaign flags
      if (!state.campaign || !state.campaign.flags) return false;
      if (typeof objective.target === 'string') {
        return !!state.campaign.flags[objective.target];
      }
      // Generic check: any special mission flag set counts
      return !!state.campaign.flags.specialMissionComplete || !!state.campaign.flags.big_score;
    }
    default: return false; // Unhandled objectives checked via events
  }
}

// Complete a mission
function completeMission(state, missionId) {
  if (!state.campaign) return;
  if (state.campaign.completedMissions.includes(missionId)) return;

  state.campaign.completedMissions.push(missionId);
  state.campaign.totalMissionsCompleted++;

  // Find mission data and apply rewards
  for (const act of CAMPAIGN_ACTS) {
    const mission = act.mainMissions.find(m => m.id === missionId) ||
                    (act.sideMissions || []).find(m => m.id === missionId);
    if (mission && mission.reward) {
      if (mission.reward.cash) state.cash += mission.reward.cash;
      if (mission.reward.rep) state.reputation = Math.min(100, (state.reputation || 0) + mission.reward.rep);
      if (mission.reward.xp && typeof awardXP === 'function') awardXP(state, 'mission_complete', mission.reward.xp);

      // Check for act progression
      if (mission.unlocks && mission.unlocks.includes('act2')) state.campaign.currentAct = 'act2';
      if (mission.unlocks && mission.unlocks.includes('act3')) state.campaign.currentAct = 'act3';
      if (mission.unlocks && mission.unlocks.includes('act4')) state.campaign.currentAct = 'act4';
      if (mission.unlocks && mission.unlocks.includes('act5')) state.campaign.currentAct = 'act5';
    }
  }

  state.campaign.activeMission = null;
}

// Check all active mission objectives and auto-complete if all met
function checkMissionProgress(state) {
  if (!state.campaign || !state.campaign.activeMission) return null;

  const missionId = state.campaign.activeMission;
  let mission = null;
  for (const act of CAMPAIGN_ACTS) {
    mission = act.mainMissions.find(m => m.id === missionId);
    if (mission) break;
  }
  if (!mission || !mission.objectives) return null;

  const allComplete = mission.objectives.every(obj => checkMissionObjective(state, obj));
  if (allComplete) {
    return mission; // Return mission so UI can show completion
  }
  return null;
}

// Get campaign progress percentage
function getCampaignProgress(state) {
  if (!state.campaign) return 0;
  const totalMain = CAMPAIGN_ACTS.reduce((s, a) => s + (a.mainMissions ? a.mainMissions.length : 0), 0);
  return Math.round((state.campaign.completedMissions.length / Math.max(1, totalMain)) * 100);
}

// Get numeric progress for a mission objective (current value / target)
function getObjectiveProgress(state, objective) {
  const target = typeof objective.target === 'number' ? objective.target : 1;
  let current = 0;
  switch (objective.type) {
    case 'buy_drug':
      current = (state.stats && state.stats.totalBuys) || 0;
      break;
    case 'sell_drug':
      current = (state.stats && state.stats.totalSells) || 0;
      break;
    case 'own_territory': {
      const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      current = territories.length;
      break;
    }
    case 'crew_count':
      current = (state.henchmen || []).length;
      break;
    case 'reputation':
      current = state.reputation || 0;
      break;
    case 'cash':
      current = state.cash || 0;
      break;
    case 'net_worth': {
      current = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : (state.cash || 0);
      break;
    }
    case 'heat_below':
      current = state.heat || 0;
      // For heat_below, progress is inverted: lower is better
      return { current: current, target: target, inverted: true, done: current < target };
    case 'buy_amount':
      current = (state.stats && state.stats.largestBuyQty) || 0;
      break;
    case 'fronts_owned':
      current = (state.frontBusinesses || []).length;
      break;
    case 'districts_controlled': {
      const terrs = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      current = new Set(terrs).size;
      break;
    }
    case 'daily_income': {
      let income = 0;
      if (state.frontBusinesses && typeof FRONT_BUSINESSES !== 'undefined') {
        income += state.frontBusinesses.reduce((s, f) => {
          const bizDef = FRONT_BUSINESSES.find(b => b.id === f.id);
          return s + (bizDef ? bizDef.dailyIncome : 0);
        }, 0);
      }
      if (typeof getControlledTerritories === 'function') {
        const territories = getControlledTerritories(state);
        const perTerritory = (typeof TERRITORY_BENEFITS !== 'undefined' && TERRITORY_BENEFITS.dailyIncome) || 500;
        income += territories.length * perTerritory;
      }
      if (state.distribution) {
        for (const locId in state.distribution) {
          if (!state.distribution.hasOwnProperty(locId)) continue;
          const dist = state.distribution[locId];
          if (dist && dist.active && dist.dealers && dist.dealers.length > 0) {
            income += dist.dealers.length * 500;
          }
        }
      }
      current = income;
      break;
    }
    case 'crew_rank': {
      const targetRank = typeof objective.target === 'string'
        ? ({ 'street_worker': 0, 'soldier': 1, 'lieutenant': 2, 'underboss': 3, 'right_hand': 4, 'righthand': 4 }[objective.target.toLowerCase().replace(/[-\s]/g, '_')] || 0)
        : objective.target;
      const hasRank = (state.henchmen || []).some(h => (typeof _resolveRankIndex === 'function' ? _resolveRankIndex(h.rank) : (h.rank || 0)) >= targetRank);
      return { current: hasRank ? 1 : 0, target: 1, done: hasRank };
    }
    case 'faction_discovered': {
      if (!state.factions || !state.factions.standings) return { current: 0, target: 1, done: false };
      if (objective.target && typeof objective.target === 'string') {
        const found = state.factions.standings[objective.target] !== undefined && state.factions.standings[objective.target] !== 0;
        return { current: found ? 1 : 0, target: 1, done: found };
      }
      const found = Object.values(state.factions.standings).some(s => s !== 0);
      return { current: found ? 1 : 0, target: 1, done: found };
    }
    case 'faction_event': {
      current = (state.factions && state.factions.factionEvents) ? state.factions.factionEvents.length : 0;
      break;
    }
    case 'police_encounter': {
      const encounterCount = (state.encounters && state.encounters.stats && state.encounters.stats.totalEncounters) || 0;
      const timesArrested = (state.investigation && state.investigation.timesArrested) || 0;
      current = encounterCount + timesArrested;
      break;
    }
    case 'suppliers': {
      // Count unique supplier connections
      current = (state.suppliers && state.suppliers.length) || (state.supplierContacts || 0);
      break;
    }
    case 'political_contacts': {
      current = (state.politics && state.politics.contacts) ? state.politics.contacts.length : 0;
      break;
    }
    case 'territory_percent': {
      const terrs = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
      const total = typeof TERRITORIES !== 'undefined' ? TERRITORIES.length : 10;
      current = total > 0 ? Math.round((terrs.length / total) * 100) : 0;
      break;
    }
    case 'crew_loyalty_min': {
      if (!state.henchmen || state.henchmen.length === 0) return { current: 0, target: target, done: false };
      const minLoyalty = Math.min(...state.henchmen.map(h => h.loyalty || 0));
      current = minLoyalty;
      break;
    }
    case 'cash_laundered': {
      current = (state.stats && state.stats.totalLaundered) || 0;
      break;
    }
    case 'sales_volume': {
      current = (state.stats && state.stats.totalSalesValue) || 0;
      break;
    }
    default:
      // For event-based objectives, use a binary check
      const done = typeof checkMissionObjective === 'function' ? checkMissionObjective(state, objective) : false;
      return { current: done ? 1 : 0, target: 1, done: done };
  }
  return { current: Math.min(current, target), target: target, done: current >= target };
}

// Get a human-readable "how to" hint for a mission objective type
function getObjectiveHowTo(objective) {
  switch (objective.type) {
    case 'buy_drug': return 'Go to a location and buy product from the Market tab.';
    case 'sell_drug': return 'Sell product from your inventory at any market location.';
    case 'own_territory': return 'Visit the Territory tab and claim unclaimed blocks, or take them from rivals.';
    case 'crew_count': return 'Go to Crew Management and recruit new members from available prospects.';
    case 'reputation': return 'Earn reputation by completing deals, winning fights, and doing missions.';
    case 'cash': return 'Accumulate cash through drug sales, missions, heists, and business income.';
    case 'net_worth': return 'Grow total net worth via cash, property, inventory, and business assets.';
    case 'heat_below': return 'Lower heat by laying low, bribing cops, using a lawyer, or laundering money.';
    case 'buy_amount': return 'Make a single large purchase from a supplier. Unlock bulk buying first.';
    case 'fronts_owned': return 'Buy a front business from the Businesses tab to launder money.';
    case 'districts_controlled': return 'Expand into new districts via the Territory tab. Each district has different blocks.';
    case 'daily_income': return 'Increase passive income with territories, front businesses, and distribution networks.';
    case 'crew_rank': return 'Go to Crew Management and promote a member who has enough loyalty and experience.';
    case 'faction_discovered': return 'Encounter factions by expanding territory or through random events and story missions.';
    case 'faction_event': return 'Faction events trigger as you interact with or encroach on faction territory.';
    case 'police_encounter': return 'Police encounters happen when your heat is high. Keep operating to attract attention.';
    case 'suppliers': return 'Find new suppliers through story progression, contacts, or international trade.';
    case 'import_routes': return 'Set up import routes via the Shipping tab once Caribbean access is unlocked.';
    case 'political_contacts': return 'Build political connections through missions, bribery, and high-profile dealings.';
    case 'territory_held_days': return 'Hold your territories by defending them from attacks. Keep crew stationed there.';
    case 'cash_laundered': return 'Launder money through your front businesses. Buy fronts from the Businesses tab.';
    case 'sales_volume': return 'Sell large volumes of product through your distribution network and direct sales.';
    case 'investigation_level': return 'Reduce investigation by destroying evidence, bribing officials, or using lawyers.';
    case 'conflict_resolved': return 'Resolve the conflict through negotiation, force, or retreat when confronted.';
    case 'special_mission': return 'This triggers through story events. Keep progressing the main campaign.';
    case 'special_event': return 'This event will trigger automatically when conditions are met.';
    case 'choice_made': return 'Make your choice when prompted. Each option has lasting consequences.';
    case 'pipeline_complete': return 'Set up all stages: import product, process it, distribute via dealers, and launder profits.';
    case 'territory_percent': return 'Control enough territory to meet the percentage. Defend what you have and take more.';
    case 'crew_loyalty_min': return 'Boost loyalty by paying crew well, completing missions together, and not getting them hurt.';
    case 'threats_handled': return 'Deal with threats as they arise through combat, negotiation, or strategic decisions.';
    case 'ending_path_chosen': return 'This is a pivotal choice. Consider your alliances, assets, and goals carefully.';
    case 'bribes': return 'Approach officials through your political contacts. Offer cash to gain protection.';
    case 'days_free': return 'Survive without getting arrested. Keep heat low and use your lawyer.';
    case 'investigation_survive': return 'Weather the federal probe by keeping heat low and destroying evidence.';
    case 'heat_control': return 'Manage your heat actively each day. Use lawyers, lay low, and avoid risky actions.';
    case 'international_deals': return 'Complete a deal via Shipping once you have Caribbean or international access.';
    case 'import_profit': return 'Import goods via Shipping and sell them locally for profit.';
    case 'turf_wars_won': return 'Win turf wars by having strong crew stationed in your territories when attacked.';
    case 'war_mission': return 'Accept and complete war missions that appear during active faction conflicts.';
    case 'faction_choice': return 'Choose a side when prompted during the faction war event.';
    case 'legal_survival': return 'Survive the legal battle using lawyers, evidence destruction, and political connections.';
    default: return 'Progress through gameplay. Check the relevant game tabs for opportunities.';
  }
}
