// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Campaign Mission System
// 5 Acts, 30+ Main Missions, 50+ Side Missions, 100+ Branches
// 80-Hour Campaign Structure with REAL Branching Story Webs
// ============================================================

const CAMPAIGN_CONFIG = {
  totalActs: 5,
  estimatedHours: 80,
  mainMissionsTotal: 30,
  sideMissionsTotal: 55,
  branchMissionsTotal: 36,
};

// ============================================================
// BRANCH MISSIONS - Unlocked by player choices in main missions
// These form the connective tissue of the story web.
// Stored separately so they can be injected into any act.
// ============================================================
const BRANCH_MISSIONS = [

  // ---- M1_6 branches: Rival Introduction consequences ----
  {
    id: 'M1_6B_alliance',
    name: 'Uneasy Alliance',
    emoji: '🤝',
    act: 'act1',
    requiresChoice: { mission: 'M1_6', approach: 'negotiate' },
    desc: 'The truce with Zoe Pound is fragile. They want a show of good faith: move a package through their territory untouched. One wrong look and this peace is over.',
    objectives: [
      { id: 'deliver_package', desc: 'Deliver a package through Zoe Pound turf without incident', type: 'special_mission', target: 'zoe_delivery' },
    ],
    reward: { cash: 2000, rep: 12, xp: 120 },
    consequences: {
      traits: { diplomat: 1 },
      stats: { reputation: 5 },
      faction: { zoe_pound: 10 },
      message: 'The package arrives clean. Zoe Pound nods. You speak their language now.',
    },
  },
  {
    id: 'M1_6B_warpath',
    name: 'Blood in the Water',
    emoji: '🩸',
    act: 'act1',
    requiresChoice: { mission: 'M1_6', approach: 'fight' },
    desc: 'Your violence against Zoe Pound sent a message, but messages have echoes. They have sent three soldiers to reclaim the block you took. Hold the line or lose everything.',
    objectives: [
      { id: 'defend_block', desc: 'Defend your territory from Zoe Pound retaliation', type: 'turf_wars_won', target: 1 },
    ],
    reward: { cash: 3500, rep: 15, xp: 150 },
    consequences: {
      traits: { ruthless: 1, feared: 1 },
      stats: { heat: 10, reputation: 8 },
      faction: { zoe_pound: -15 },
      message: 'Three came. None left standing. The block is yours, but the war is far from over.',
    },
  },
  {
    id: 'M1_6B_shadows',
    name: 'The Long Way Around',
    emoji: '🌑',
    act: 'act1',
    requiresChoice: { mission: 'M1_6', approach: 'retreat' },
    desc: 'You backed down from Zoe Pound, and the streets noticed. Now you need to rebuild your reputation through a different kind of score -- something quiet, something clever, something nobody sees coming.',
    objectives: [
      { id: 'covert_score', desc: 'Pull off a covert score to rebuild rep', type: 'special_mission', target: 'covert_score' },
    ],
    reward: { cash: 4000, rep: 10, xp: 130 },
    consequences: {
      traits: { cunning: 1, patient: 1 },
      stats: { heat: -5, reputation: 5 },
      message: 'Nobody saw you come. Nobody saw you leave. But the money? That speaks loud enough.',
    },
  },

  // ---- M1_7 branches: The Score (Act 1 Climax) consequences ----
  {
    id: 'M1_7B_ghost',
    name: 'Ghost Protocol',
    emoji: '👻',
    act: 'act1',
    requiresChoice: { mission: 'M1_7', approach: 'stealth' },
    desc: 'After The Score, word spreads in whispers: someone hit the stash house and nobody even saw them. The Colombian Connection has taken notice. A man named Vargas wants to meet the ghost.',
    objectives: [
      { id: 'meet_vargas', desc: 'Meet the Colombian contact in secret', type: 'special_mission', target: 'vargas_meeting' },
    ],
    reward: { cash: 5000, rep: 10, xp: 180 },
    consequences: {
      traits: { stealthy: 1, connected: 1 },
      stats: { reputation: 8 },
      faction: { colombian_connection: 15 },
      unlock: ['colombian_early_access'],
      message: 'Vargas smiles. "A man who can move without being seen is worth more than a hundred soldiers." The Colombians remember you.',
    },
  },
  {
    id: 'M1_7B_warlord',
    name: 'The New Warlord',
    emoji: '⚔️',
    act: 'act1',
    requiresChoice: { mission: 'M1_7', approach: 'force' },
    desc: 'The stash house raid was a bloodbath, and now everyone in Little Haiti knows your name. The Southern Boys see an opportunity -- they want muscle, and you just proved you have it. But Zoe Pound is assembling a hit squad.',
    objectives: [
      { id: 'survive_hit', desc: 'Survive the Zoe Pound hit squad', type: 'special_mission', target: 'zoe_hit_squad' },
      { id: 'southern_meet', desc: 'Meet with The Southern Boys leadership', type: 'special_mission', target: 'southern_meeting' },
    ],
    reward: { cash: 8000, rep: 20, xp: 200 },
    consequences: {
      traits: { violent: 1, feared: 1, warlord: 1 },
      stats: { heat: 20, reputation: 15 },
      faction: { southern_boys: 20, zoe_pound: -30 },
      message: 'The hit squad failed. The Southern Boys are impressed. You are no longer a corner dealer -- you are a warlord, and warlords attract armies.',
    },
  },
  {
    id: 'M1_7B_broker',
    name: 'The Broker',
    emoji: '🎩',
    act: 'act1',
    requiresChoice: { mission: 'M1_7', approach: 'negotiate' },
    desc: 'You talked your way into the stash house score without firing a shot. The corrupt cop who set it up is amazed -- and terrified. He wants a longer arrangement. Meanwhile, Los Cubanos heard about the deal and want in.',
    objectives: [
      { id: 'cop_deal', desc: 'Establish a recurring arrangement with the corrupt cop', type: 'special_mission', target: 'cop_arrangement' },
      { id: 'cubanos_intro', desc: 'Attend the introduction with Los Cubanos', type: 'special_mission', target: 'cubanos_intro' },
    ],
    reward: { cash: 6000, rep: 18, xp: 190 },
    consequences: {
      traits: { silver_tongue: 1, connected: 1, broker: 1 },
      stats: { reputation: 12, heat: -10 },
      faction: { los_cubanos: 20 },
      ability: 'smooth_talker',
      unlock: ['corrupt_cop_contact', 'cubanos_early_access'],
      message: 'You have something rarer than muscle: trust. The cop feeds you intel. Los Cubanos open their doors. This is how empires are really built.',
    },
  },

  // ---- M2_1 variants based on Act 1 climax path ----
  {
    id: 'M2_1_war',
    name: 'Conquest',
    emoji: '🗡️',
    act: 'act2',
    requiresChoice: { mission: 'M1_7', approach: 'force' },
    desc: 'Your reputation for violence precedes you. When you roll into a new district, dealers scatter. But the established crews dig in. This expansion will be paid for in blood.',
    objectives: [
      { id: 'take_district', desc: 'Take a second district by force', type: 'districts_controlled', target: 2 },
      { id: 'win_battles', desc: 'Win 3 turf battles during expansion', type: 'turf_wars_won', target: 3 },
    ],
    reward: { cash: 8000, rep: 25, xp: 250 },
    consequences: {
      traits: { conqueror: 1, ruthless: 1 },
      stats: { heat: 15, reputation: 10 },
      faction: { southern_boys: 5 },
      message: 'The second district falls. Three crews broken. Your name is spray-painted on walls now -- a warning, not graffiti.',
    },
  },
  {
    id: 'M2_1_stealth',
    name: 'Shadow Expansion',
    emoji: '🌑',
    act: 'act2',
    requiresChoice: { mission: 'M1_7', approach: 'stealth' },
    desc: 'You move into the new district the way you do everything -- quietly. Set up shop through proxies. By the time anyone notices, you already own half the blocks.',
    objectives: [
      { id: 'stealth_district', desc: 'Establish presence in a second district without triggering faction alerts', type: 'districts_controlled', target: 2 },
      { id: 'hold_quiet', desc: 'Hold both districts for 7 days with heat below 30', type: 'territory_held_days', target: 7 },
    ],
    reward: { cash: 6000, rep: 20, xp: 230 },
    consequences: {
      traits: { stealthy: 1, patient: 1 },
      stats: { heat: -5 },
      faction: { colombian_connection: 5 },
      message: 'Seven days. Zero incidents. The new district does not even know who owns it yet. That is power.',
    },
  },
  {
    id: 'M2_1_diplomat',
    name: 'Negotiated Expansion',
    emoji: '🤝',
    act: 'act2',
    requiresChoice: { mission: 'M1_7', approach: 'negotiate' },
    desc: 'Why fight for territory when you can buy it? Your connections make introductions. Los Cubanos vouch for you in Hialeah. The corrupt cop clears heat in Overtown. Expansion through relationships.',
    objectives: [
      { id: 'negotiate_district', desc: 'Gain territory in a second district through deals', type: 'districts_controlled', target: 2 },
      { id: 'no_violence', desc: 'Expand without any turf wars', type: 'territory_held_days', target: 7 },
    ],
    reward: { cash: 5000, rep: 22, xp: 240 },
    consequences: {
      traits: { diplomat: 1, connected: 1 },
      stats: { reputation: 8 },
      faction: { los_cubanos: 10 },
      message: 'Two districts. Zero shots fired. The old heads are talking about you with something that sounds like respect.',
    },
  },

  // ---- M2_4 branches: Faction War consequences ----
  {
    id: 'M2_4B_cubanos_ally',
    name: 'Cuban Thunder',
    emoji: '🇨🇺',
    act: 'act2',
    requiresChoice: { mission: 'M2_4', approach: 'side_cubanos' },
    desc: 'You chose Los Cubanos. Now you ride with them. A joint operation against Zoe Pound supply lines. Your crew handles the intercept, their crew handles distribution. If this works, Hialeah is yours.',
    objectives: [
      { id: 'joint_op', desc: 'Complete the joint operation with Los Cubanos', type: 'special_mission', target: 'cubanos_joint_op' },
      { id: 'hialeah_control', desc: 'Establish control in Hialeah district', type: 'districts_controlled', target: 3 },
    ],
    reward: { cash: 20000, rep: 25, xp: 280 },
    consequences: {
      traits: { allied: 1, loyal: 1 },
      stats: { reputation: 10 },
      faction: { los_cubanos: 30, zoe_pound: -25, eastern_bloc: -5 },
      message: 'The operation is flawless. Los Cubanos embrace you as family. Hialeah opens up. But Zoe Pound will never forget whose side you chose.',
    },
  },
  {
    id: 'M2_4B_zoe_ally',
    name: 'Haitian Fire',
    emoji: '🇭🇹',
    act: 'act2',
    requiresChoice: { mission: 'M2_4', approach: 'side_zoe' },
    desc: 'You sided with Zoe Pound. Their leader, a woman named Mama Celine, tests your commitment: raid a Cubanos stash house in Hialeah. Bring back the product and split it 60/40 -- their favor.',
    objectives: [
      { id: 'raid_cubanos', desc: 'Raid the Los Cubanos stash house', type: 'special_mission', target: 'cubanos_raid' },
      { id: 'deliver_cut', desc: 'Deliver Zoe Pound their 60% cut', type: 'special_mission', target: 'zoe_delivery_war' },
    ],
    reward: { cash: 15000, rep: 22, xp: 260 },
    consequences: {
      traits: { ruthless: 1, loyal: 1 },
      stats: { heat: 10, reputation: 8 },
      faction: { zoe_pound: 30, los_cubanos: -35 },
      message: 'Mama Celine smiles for the first time. "You have heart," she says. Los Cubanos put a bounty on your head. Worth it? Time will tell.',
    },
  },
  {
    id: 'M2_4B_profiteer',
    name: 'War Profiteer',
    emoji: '💰',
    act: 'act2',
    requiresChoice: { mission: 'M2_4', approach: 'play_both' },
    desc: 'You sell to both sides. Weapons to Zoe Pound, intel to Los Cubanos, product to whoever pays more. It is obscenely profitable and horrifically dangerous. If either side finds out, you are dead.',
    objectives: [
      { id: 'sell_both', desc: 'Complete deals with both warring factions', type: 'special_mission', target: 'double_dealing' },
      { id: 'profit_war', desc: 'Earn $25,000 from war profiteering', type: 'cash', target: 25000 },
    ],
    reward: { cash: 25000, rep: 15, xp: 300 },
    consequences: {
      traits: { cunning: 2, greedy: 1, risk_taker: 1 },
      stats: { reputation: 5, heat: 5 },
      faction: { los_cubanos: -10, zoe_pound: -10 },
      message: 'The money flows like blood. You are richer than ever, but you sleep with one eye open. Both sides are starting to ask questions.',
    },
  },
  {
    id: 'M2_4B_peacemaker',
    name: 'The Ceasefire',
    emoji: '🕊️',
    act: 'act2',
    requiresChoice: { mission: 'M2_4', approach: 'broker_peace' },
    desc: 'You propose something nobody expected: peace. A sit-down between Mama Celine and Don Alejandro. Neutral ground. Your restaurant. If this works, you become the most respected name in Miami. If it fails, both sides blame you.',
    objectives: [
      { id: 'arrange_sitdown', desc: 'Arrange the peace summit', type: 'special_mission', target: 'peace_summit' },
      { id: 'maintain_peace', desc: 'Maintain the ceasefire for 10 days', type: 'territory_held_days', target: 10 },
    ],
    reward: { cash: 10000, rep: 35, xp: 350 },
    consequences: {
      traits: { diplomat: 2, respected: 1, peacemaker: 1 },
      stats: { reputation: 20 },
      faction: { los_cubanos: 15, zoe_pound: 15, colombian_connection: 10 },
      ability: 'mediator',
      message: 'They shake hands across your table. The war stops. Both sides owe you. The Colombians are watching with great interest -- they need someone who can keep the peace.',
    },
  },

  // ---- M2_7 branches: Power Play (Act 2 Climax) consequences ----
  {
    id: 'M2_7B_kingpin',
    name: 'Crown of Thorns',
    emoji: '👑',
    act: 'act2',
    requiresChoice: { mission: 'M2_7', approach: 'seize_power' },
    desc: 'You declared yourself king in the power vacuum. Now every faction that was not ready to kneel is sharpening their knives. The Southern Boys challenge you publicly. Los Cubanos demand tribute. Zoe Pound tests your borders. Welcome to the throne.',
    objectives: [
      { id: 'defend_crown', desc: 'Repel challenges from all rival factions', type: 'turf_wars_won', target: 3 },
      { id: 'tribute', desc: 'Collect tribute from at least one faction', type: 'special_mission', target: 'collect_tribute' },
    ],
    reward: { cash: 60000, rep: 45, xp: 550 },
    consequences: {
      traits: { kingpin: 1, feared: 2, ambitious: 1 },
      stats: { heat: 25, reputation: 20 },
      faction: { southern_boys: -20, los_cubanos: -10, zoe_pound: -15 },
      message: 'Heavy is the head. Three attacks in one week. You held. Tribute flows in. But the feds just opened a new file with your name on it.',
    },
  },
  {
    id: 'M2_7B_coalition',
    name: 'The Coalition',
    emoji: '🤝',
    act: 'act2',
    requiresChoice: { mission: 'M2_7', approach: 'build_coalition' },
    desc: 'Instead of seizing the throne, you built a round table. A coalition of equals -- you, your faction allies, and the smaller crews. Decisions made by consensus. It is slower, but it is stable. And stability is what the Colombians want to see before they open the pipeline.',
    objectives: [
      { id: 'form_coalition', desc: 'Form alliance with at least 2 factions', type: 'special_mission', target: 'form_coalition' },
      { id: 'coalition_deal', desc: 'Complete a joint deal through the coalition', type: 'special_mission', target: 'coalition_deal' },
    ],
    reward: { cash: 40000, rep: 40, xp: 500 },
    consequences: {
      traits: { diplomat: 2, leader: 1, respected: 1 },
      stats: { reputation: 15 },
      faction: { los_cubanos: 10, zoe_pound: 10, colombian_connection: 20 },
      ability: 'coalition_leader',
      message: 'The coalition holds. Product flows, money splits fair, and for the first time in years the streets are quiet. The Colombians send word: they want to talk directly.',
    },
  },
  {
    id: 'M2_7B_shadow',
    name: 'The Puppeteer',
    emoji: '🎭',
    act: 'act2',
    requiresChoice: { mission: 'M2_7', approach: 'stay_hidden' },
    desc: 'Let someone else wear the crown. You install a figurehead -- a loud, visible front man who takes the heat while you pull strings from the shadows. The feds chase a ghost. The factions negotiate with a puppet. And you? You count money in silence.',
    objectives: [
      { id: 'install_puppet', desc: 'Install a figurehead leader', type: 'special_mission', target: 'install_puppet' },
      { id: 'shadow_profit', desc: 'Earn $30,000 while maintaining heat below 25', type: 'cash', target: 130000 },
    ],
    reward: { cash: 35000, rep: 20, xp: 480 },
    consequences: {
      traits: { cunning: 2, stealthy: 1, puppet_master: 1 },
      stats: { heat: -15 },
      ability: 'shadow_boss',
      message: 'Your puppet takes the meetings, shakes the hands, absorbs the bullets. You are invisible. And invisible men live longest in this game.',
    },
  },
];

const CAMPAIGN_ACTS = [
  // ==================================================================
  // ACT 1: THE COME UP
  // ==================================================================
  {
    id: 'act1', name: 'Act 1: The Come Up', emoji: '🌱',
    hoursRange: [1, 16],
    dayRange: [1, 60],
    desc: 'You are nobody. Learn the trade, build a crew, claim territory. By the end, you have a foothold -- and enemies.',
    unlockMessage: 'The streets are calling. Time to make a name.',
    mainMissions: [
      // ---- M1_1: FIRST BLOOD (Tutorial) ----
      {
        id: 'M1_1', name: 'First Blood', emoji: '🩸',
        hoursRange: [1, 2],
        desc: 'Tutorial mission unique to your character. Make your first deal, learn the basics. This is where the line gets crossed.',
        characterVariants: {
          corner_kid: 'Handle your first day on the block. The OG hands you a package and a corner. Move it before sundown or he finds someone who will.',
          dropout: 'Your roommate hooks you up with a small bag and a list of names. Campus dealing: small, quiet, terrifying. One sale changes everything.',
          ex_con: 'Your prison contact kept his word. A package waits at a drop point in Overtown. Pick it up. Move it. Welcome back to the life.',
          hustler: 'The con game was getting old. Your supplier does not care about your past -- only your cash. First buy, first sell, first real money.',
          connected_kid: 'Your parent ran this corner before the feds took them. The crew remembers. They hand you the keys. Do not drop them.',
          cleanskin: 'No record. No connections. No reputation. You buy your first gram from a stranger in a parking lot. Your hands shake. They will stop shaking soon.',
          veteran: 'Three tours taught you logistics, leadership, and violence. The drug game is just another theater of operations. Gear up.',
          immigrant: 'New country, no papers, no options. The community whispers about fast money. You find the man they whisper about. He sizes you up. You pass.',
        },
        objectives: [
          { id: 'buy_first', desc: 'Purchase your first product', type: 'buy_drug', target: 1 },
          { id: 'sell_first', desc: 'Make your first sale', type: 'sell_drug', target: 1 },
        ],
        reward: { cash: 500, rep: 5, xp: 50 },
        unlocks: ['basic_dealing', 'market_ui'],
        autoComplete: false,
        consequences: {
          traits: { street_initiated: 1 },
          message: 'First deal done. Your hands are dirty now. There is no going back from this.',
        },
      },

      // ---- M1_2: THE BLOCK ----
      {
        id: 'M1_2', name: 'The Block', emoji: '🏘️',
        hoursRange: [2, 3],
        desc: 'Claim your first territory block. Every empire starts with a single corner.',
        characterVariants: {
          corner_kid: 'A small independent crew runs the block next to yours. They are weak. Push them out.',
          dropout: 'The college area is uncontested -- no gangs want the headache of campus cops. Perfect for you.',
          ex_con: 'Your prison reputation carries weight. Walk up to the block. Let them see your face. They know the name.',
          hustler: 'Money talks. Buy your way into a territory arrangement with the current holder. Business, not war.',
          connected_kid: 'The block was your parent\'s. The crew held it in their absence. Now it is yours to command.',
          cleanskin: 'Find a quiet block in the suburbs where nobody is watching. Low traffic, low reward, low risk.',
          veteran: 'A solo dealer works the corner of 7th and Washington. He has no crew. You have training. Do the math.',
          immigrant: 'The community trusts you enough to let you operate in their neighborhood. Earn that trust every day.',
        },
        approaches: [
          {
            id: 'intimidate',
            name: 'Intimidate the current holder',
            consequences: {
              traits: { intimidating: 1 },
              stats: { heat: 5, reputation: 5 },
              message: 'He saw it in your eyes. Did not even put up a fight. The block is yours.',
            },
          },
          {
            id: 'outwork',
            name: 'Outwork them -- better product, better prices',
            consequences: {
              traits: { hustler: 1, patient: 1 },
              stats: { reputation: 3 },
              message: 'Took two weeks, but their customers are your customers now. No blood, all business.',
            },
          },
          {
            id: 'buy_out',
            name: 'Pay them to leave',
            requirements: { minCash: 300 },
            consequences: {
              traits: { businessman: 1 },
              stats: { reputation: 2 },
              message: 'Three hundred dollars and a handshake. Cheapest real estate deal in Miami.',
            },
          },
        ],
        objectives: [
          { id: 'claim_territory', desc: 'Control your first territory', type: 'own_territory', target: 1 },
        ],
        reward: { cash: 1000, rep: 10, xp: 100 },
        requires: ['M1_1'],
        unlocks: ['territory_ui', 'passive_income'],
      },

      // ---- M1_3: BUILDING CREW ----
      {
        id: 'M1_3', name: 'Building Crew', emoji: '👥',
        hoursRange: [3, 5],
        desc: 'You cannot run a block alone. Find someone you trust -- or at least someone who fears you enough. Recruit your first crew member and prove the partnership works.',
        approaches: [
          {
            id: 'recruit_loyalty',
            name: 'Recruit through trust -- find someone from the neighborhood',
            consequences: {
              traits: { loyal_leader: 1 },
              stats: { reputation: 5 },
              unlock: ['loyal_crew_bonus'],
              message: 'You grew up three blocks apart. He knows your name, your family, your story. Loyalty like that is not bought -- it is earned over years.',
            },
          },
          {
            id: 'recruit_muscle',
            name: 'Recruit muscle -- hire an enforcer from the streets',
            consequences: {
              traits: { ruthless: 1 },
              stats: { heat: 3, reputation: 3 },
              message: 'He is big, mean, and does not ask questions. Perfect. Just never turn your back on him.',
            },
          },
          {
            id: 'recruit_brains',
            name: 'Recruit brains -- find a smart hustler who can count',
            consequences: {
              traits: { strategic: 1 },
              stats: { reputation: 2 },
              ability: 'efficient_operations',
              message: 'She ran numbers for a bookie before he got locked up. Now she runs yours. Margins just got better.',
            },
          },
        ],
        objectives: [
          { id: 'recruit_crew', desc: 'Recruit a new crew member', type: 'crew_count', target: 1 },
          { id: 'complete_job', desc: 'Complete a job with your recruit', type: 'missions_done', target: 1 },
        ],
        reward: { cash: 500, rep: 8, xp: 80 },
        requires: ['M1_2'],
        unlocks: ['crew_management_ui', 'crew_roles'],
      },

      // ---- M1_4: THE SUPPLIER ----
      {
        id: 'M1_4', name: 'The Supplier', emoji: '📦',
        hoursRange: [5, 7],
        desc: 'Street-level re-ups are unreliable and expensive. You need a real supplier -- someone who moves weight. Getting that introduction is a mission in itself.',
        characterVariants: {
          ex_con: 'Your cellmate\'s cousin moves product through Opa-Locka. He remembers you. One phone call.',
          immigrant: 'The Caribbean community has connections that go back generations. Your uncle knows a man.',
          connected_kid: 'Your parent\'s old supplier heard you were running things. He reaches out. Cautiously.',
          default: 'No connections? No shortcuts. Earn introductions through reputation, favors, or raw cash.',
        },
        approaches: [
          {
            id: 'earn_intro',
            name: 'Earn the introduction through street reputation',
            requirements: { minRep: 20 },
            consequences: {
              traits: { respected: 1 },
              stats: { reputation: 5 },
              message: 'Your name reached the right ears. The supplier agrees to a sit-down. You earned this the hard way.',
            },
          },
          {
            id: 'buy_intro',
            name: 'Buy the introduction -- pay a middleman',
            requirements: { minCash: 2000 },
            consequences: {
              traits: { businessman: 1 },
              stats: { reputation: 2 },
              message: 'Two grand to a middleman for a phone number. Expensive, but time is money.',
            },
          },
          {
            id: 'steal_supply',
            name: 'Skip the introduction -- rob a rival\'s supply drop',
            consequences: {
              traits: { ruthless: 1, risk_taker: 1 },
              stats: { heat: 10, reputation: 8 },
              faction: { zoe_pound: -10 },
              message: 'You intercepted Zoe Pound\'s re-up. Free product, but you just made serious enemies.',
            },
          },
        ],
        objectives: [
          { id: 'earn_rep', desc: 'Reach 25 reputation', type: 'reputation', target: 25 },
          { id: 'buy_bulk', desc: 'Make a bulk purchase (10+ units)', type: 'buy_amount', target: 10 },
        ],
        reward: { cash: 2000, rep: 12, xp: 120 },
        requires: ['M1_3'],
        unlocks: ['bulk_buying', 'quality_mechanics', 'supplier_contacts'],
      },

      // ---- M1_5: FIRST HEAT ----
      {
        id: 'M1_5', name: 'First Heat', emoji: '🚔',
        hoursRange: [7, 9],
        desc: 'Success attracts attention. A patrol car starts circling your block. A detective asks questions at the bodega. Your operation is on someone\'s radar. How you handle this moment defines your relationship with law enforcement for the rest of the game.',
        approaches: [
          {
            id: 'bribe',
            name: 'Bribe the patrol officer -- make the problem go away with cash',
            requirements: { minCash: 1500 },
            consequences: {
              traits: { corruptor: 1 },
              stats: { heat: -15 },
              unlock: ['corrupt_cop_contact'],
              message: 'Officer Davis pockets the envelope without counting it. "We never had this conversation." You now have a cop on the payroll.',
            },
          },
          {
            id: 'lay_low',
            name: 'Shut down operations and lay low until the heat passes',
            consequences: {
              traits: { patient: 1, cautious: 1 },
              stats: { heat: -20, reputation: -3 },
              message: 'Two weeks of silence. No deals, no movement, no money. The detective moves on. Your customers find other sellers. You will have to rebuild.',
            },
          },
          {
            id: 'relocate',
            name: 'Relocate operations to a different block',
            consequences: {
              traits: { adaptable: 1 },
              stats: { heat: -10 },
              message: 'Pack up, move out, set up somewhere new. The heat stays on the old block. You start fresh.',
            },
          },
          {
            id: 'brazen',
            name: 'Keep operating -- dare them to come at you',
            consequences: {
              traits: { fearless: 1, reckless: 1 },
              stats: { heat: 10, reputation: 10 },
              message: 'You stare down the patrol car every time it passes. The street loves it. The cops? They are building a file.',
            },
          },
        ],
        objectives: [
          { id: 'survive_encounter', desc: 'Survive a police encounter', type: 'police_encounter', target: 1 },
          { id: 'reduce_heat', desc: 'Reduce heat below 20', type: 'heat_below', target: 20 },
        ],
        reward: { cash: 1000, rep: 8, xp: 100 },
        requires: ['M1_4'],
        unlocks: ['lawyer_contact', 'heat_management_tools'],
      },

      // ---- M1_6: RIVAL INTRODUCTION ----
      {
        id: 'M1_6', name: 'Rival Introduction', emoji: '⚔️',
        hoursRange: [9, 12],
        desc: 'You have been operating in what Zoe Pound considers their territory. Three of their soldiers show up at your block. The leader, a scarred man called Ti Jean, gives you a choice: pay tribute, leave, or fight. This is the moment that defines your reputation.',
        approaches: [
          {
            id: 'negotiate',
            name: 'Negotiate a deal -- propose splitting the block\'s profits',
            requirements: { minRep: 15 },
            consequences: {
              traits: { diplomat: 1, silver_tongue: 1 },
              stats: { reputation: 10 },
              faction: { zoe_pound: 15 },
              unlock: ['M1_6B_alliance'],
              message: 'Ti Jean considers your offer. "Sixty-forty, our favor." You agree. A handshake seals it. Zoe Pound tolerates your presence -- for now.',
            },
          },
          {
            id: 'fight',
            name: 'Stand your ground -- this is your block and you will bleed for it',
            consequences: {
              traits: { violent: 1, fearless: 1 },
              stats: { heat: 15, reputation: 12 },
              faction: { zoe_pound: -25 },
              unlock: ['M1_6B_warpath'],
              message: 'Ti Jean pulls a knife. You pull a gun. The block erupts. When the smoke clears, you are standing and they are running. But this is just the beginning.',
            },
          },
          {
            id: 'retreat',
            name: 'Give up the block -- live to fight another day',
            consequences: {
              traits: { cautious: 1, strategic: 1 },
              stats: { reputation: -5, heat: -5 },
              faction: { zoe_pound: 5 },
              unlock: ['M1_6B_shadows'],
              message: 'You hand over the block without a word. Ti Jean laughs. The street sees weakness. But you see a longer game.',
            },
          },
        ],
        objectives: [
          { id: 'faction_encounter', desc: 'Face the rival faction', type: 'faction_event', target: 1 },
          { id: 'resolve_conflict', desc: 'Resolve the conflict (any method)', type: 'conflict_resolved', target: 1 },
        ],
        reward: { cash: 3000, rep: 15, xp: 150 },
        requires: ['M1_5'],
        unlocks: ['faction_diplomacy', 'gang_war_mechanics'],
        choiceConsequences: true,
      },

      // ---- M1_7: THE SCORE (Act 1 Climax) ----
      {
        id: 'M1_7', name: 'The Score', emoji: '💰',
        hoursRange: [12, 16],
        desc: 'Act 1 climax. Word reaches you through three different channels: a major stash house in Little Haiti is vulnerable. The owner got arrested. The guards are paid through Friday. After that, someone else takes it. This is a once-in-a-lifetime score -- $25,000 in product and cash sitting behind one locked door. How you take it determines who you become.',
        approaches: [
          {
            id: 'stealth',
            name: 'The Ghost Job -- slip in at 3 AM, crack the safe, vanish',
            requirements: { traits: { patient: true } },
            consequences: {
              traits: { stealthy: 2, ghost: 1 },
              stats: { heat: -5, reputation: 8 },
              faction: { colombian_connection: 5 },
              unlock: ['M1_7B_ghost', 'M2_1_stealth'],
              lock: ['M1_7B_warlord', 'M1_7B_broker', 'M2_1_war', 'M2_1_diplomat'],
              message: 'In at 3:07. Out at 3:23. Sixteen minutes. Not a single camera caught your face. Not a single guard woke up. The streets will talk about this for months -- the stash house that emptied itself like a magic trick.',
            },
          },
          {
            id: 'force',
            name: 'The Raid -- hit it hard and fast, overwhelming force',
            consequences: {
              traits: { violent: 2, ruthless: 1, feared: 1 },
              stats: { heat: 25, reputation: 20 },
              faction: { zoe_pound: -20, southern_boys: 10 },
              unlock: ['M1_7B_warlord', 'M2_1_war'],
              lock: ['M1_7B_ghost', 'M1_7B_broker', 'M2_1_stealth', 'M2_1_diplomat'],
              message: 'Four men. Ski masks. Shotguns. The door comes off the hinges at 2 AM. Two guards go down before they can reach their weapons. You clear the stash house in ninety seconds. Every cop in the district responds. Every dealer in Miami hears your name by morning.',
            },
          },
          {
            id: 'negotiate',
            name: 'The Inside Job -- turn a guard and walk in through the front door',
            requirements: { minRep: 20 },
            consequences: {
              traits: { silver_tongue: 2, broker: 1, connected: 1 },
              stats: { reputation: 15, heat: -3 },
              faction: { los_cubanos: 10 },
              ability: 'smooth_talker',
              unlock: ['M1_7B_broker', 'M2_1_diplomat'],
              lock: ['M1_7B_ghost', 'M1_7B_warlord', 'M2_1_stealth', 'M2_1_war'],
              message: 'You found the guard with gambling debts. Offered him 20% of the take. He unlocked the door, disabled the cameras, and looked the other way. No shots. No heat. Just a phone call and a handshake. The smartest crime is the one that does not look like a crime.',
            },
          },
        ],
        objectives: [
          { id: 'big_score', desc: 'Complete the big score', type: 'special_mission', target: 1 },
          { id: 'reach_cash', desc: 'Accumulate $25,000 total cash', type: 'cash', target: 25000 },
        ],
        reward: { cash: 15000, rep: 25, xp: 300 },
        requires: ['M1_6'],
        unlocks: ['act2'],
        isActClimax: true,
      },
    ],
    sideMissions: [
      {
        id: 'S1_1', name: 'Repo Man', desc: 'Collect debts for a loan shark named Fat Mike. Three collections, escalating difficulty. The last one fights back.',
        approaches: [
          {
            id: 'intimidate', name: 'Intimidate them into paying',
            consequences: { traits: { intimidating: 1 }, stats: { heat: 3 } },
          },
          {
            id: 'negotiate', name: 'Work out payment plans',
            consequences: { traits: { businessman: 1 }, stats: { reputation: 3 } },
          },
        ],
        reward: { cash: 3000, rep: 5, xp: 80 }, unlocks: ['loan_shark_contact'],
      },
      {
        id: 'S1_2', name: 'Corner Store', desc: 'Protect a local bodega from vandals for 3 days. The owner, Mr. Reyes, cannot afford real security. He can afford you.',
        reward: { cash: 2000, rep: 8, xp: 60 }, unlocks: ['potential_front'],
        consequences: {
          traits: { community: 1 },
          message: 'Mr. Reyes nods at you every morning now. The neighborhood remembers who protected them.',
        },
      },
      {
        id: 'S1_3', name: 'The Chemist', desc: 'A chemistry grad student named Marcus needs three rare ingredients for a cook. He cannot get them himself -- too much heat from his university. Find the ingredients, earn a valuable ally.',
        reward: { cash: 1500, rep: 5, xp: 100 }, unlocks: ['processing_tutorial', 'cook_recruit'],
        consequences: {
          traits: { resourceful: 1 },
          message: 'Marcus tests the batch. 94% pure. He looks at you differently now. This is a partnership.',
        },
      },
      {
        id: 'S1_4', name: 'Jailbird', desc: 'A man named Dre got picked up on a possession charge. He knows things. Valuable things. Bail is $2,000 and the clock is ticking -- 48 hours before he starts talking to save himself.',
        reward: { cash: 0, rep: 10, xp: 80 }, unlocks: ['loyal_crew_member', 'lawyer_relationship'],
        consequences: {
          traits: { loyal_leader: 1 },
          message: 'Dre walks out and shakes your hand. "I owe you my life." He means it. You just bought the most loyal soldier money can buy.',
        },
      },
      {
        id: 'S1_5', name: 'Street Race', desc: 'Three underground races against escalating opponents. Win them all and you get a car, cash, and the respect of Miami\'s underground racing scene.',
        reward: { cash: 5000, rep: 5, xp: 100 }, unlocks: ['vehicle', 'driving_skill_boost', 'racer_contact'],
      },
      {
        id: 'S1_6', name: 'The Snitch', desc: 'Someone on your block is feeding information to the police. Three suspects. Investigate each one. Get it wrong and you lose a friend. Get it right and you sleep easier.',
        approaches: [
          {
            id: 'investigate', name: 'Carefully investigate all three suspects',
            consequences: { traits: { perceptive: 1 }, stats: { heat: -5 } },
          },
          {
            id: 'confront_all', name: 'Confront all three publicly and see who flinches',
            consequences: { traits: { intimidating: 1 }, stats: { heat: -3, reputation: 5 } },
          },
        ],
        reward: { cash: 1000, rep: 12, xp: 120 }, unlocks: ['intelligence_intro', 'community_trust', 'reduced_heat'],
      },
      {
        id: 'S1_7', name: 'Stash Hunt', desc: 'An old timer from the Cartel Remnants gives you a hand-drawn map. He says there is an 80s stash buried in a condemned building in Overtown. Could be a fortune. Could be a trap.',
        reward: { cash: 8000, rep: 5, xp: 100 }, unlocks: ['cartel_remnant_rep'],
        consequences: {
          traits: { treasure_hunter: 1 },
          faction: { cartel_remnants: 10 },
          message: 'Under the floorboards, wrapped in plastic: $8,000 in cash and two kilos of product, preserved like a time capsule from 1986.',
        },
      },
      {
        id: 'S1_8', name: 'Turf War (Mini)', desc: 'An independent dealer is encroaching on your territory. He is not faction-backed, just ambitious. Handle it before he becomes a real problem.',
        approaches: [
          {
            id: 'fight', name: 'Run him off with force',
            consequences: { traits: { violent: 1 }, stats: { heat: 5, reputation: 5 } },
          },
          {
            id: 'absorb', name: 'Offer him a job -- absorb his operation',
            consequences: { traits: { strategic: 1 }, stats: { reputation: 3 } },
          },
        ],
        reward: { cash: 2000, rep: 8, xp: 80 }, unlocks: ['extra_territory'],
      },
    ],
  },

  // ==================================================================
  // ACT 2: THE EXPANSION
  // ==================================================================
  {
    id: 'act2', name: 'Act 2: The Expansion', emoji: '📈',
    hoursRange: [16, 32],
    dayRange: [61, 150],
    desc: 'You are a player now. Expand territory, build supply chains, navigate faction politics. Every decision ripples outward. The choices from Act 1 have already shaped the landscape.',
    unlockMessage: 'The come-up is over. Now the real game begins.',
    mainMissions: [
      // ---- M2_1: NEW TERRITORIES ----
      // NOTE: Branch variants M2_1_war, M2_1_stealth, M2_1_diplomat exist
      // in BRANCH_MISSIONS. The base M2_1 is the fallback if no branch
      // was triggered (should not happen, but safety net).
      {
        id: 'M2_1', name: 'New Territories', emoji: '🗺️',
        desc: 'Expand into a second district. Your approach depends on the reputation you built in Act 1. Warriors conquer. Ghosts infiltrate. Diplomats negotiate. Each path has its own cost.',
        approaches: [
          {
            id: 'aggressive',
            name: 'Aggressive expansion -- take blocks by force',
            consequences: {
              traits: { conqueror: 1 },
              stats: { heat: 10, reputation: 8 },
              message: 'Blood marks the border of your new territory. Effective, but expensive.',
            },
          },
          {
            id: 'gradual',
            name: 'Gradual expansion -- move in block by block, quietly',
            consequences: {
              traits: { patient: 1, strategic: 1 },
              stats: { heat: 2, reputation: 4 },
              message: 'Slow and steady. By the time they notice, you own half the district.',
            },
          },
          {
            id: 'partnership',
            name: 'Partnership -- split the district with an existing crew',
            consequences: {
              traits: { diplomat: 1 },
              stats: { reputation: 6 },
              faction: { los_cubanos: 5 },
              message: 'Shared territory means shared risk. And shared eyes watching each other.',
            },
          },
        ],
        objectives: [
          { id: 'control_districts', desc: 'Control territory in 2 districts', type: 'districts_controlled', target: 2 },
          { id: 'hold_territory', desc: 'Hold both territories for 7 days', type: 'territory_held_days', target: 7 },
        ],
        reward: { cash: 5000, rep: 20, xp: 200 },
        requires: ['M1_7'],
      },

      // ---- M2_2: SUPPLY CHAIN ----
      {
        id: 'M2_2', name: 'Supply Chain', emoji: '🔗',
        desc: 'One supplier is a single point of failure. When he got arrested last week, you went dry for three days. Three days of no product, no sales, no revenue. Never again. Build redundancy into your supply chain or get buried by it.',
        approaches: [
          {
            id: 'diversify',
            name: 'Diversify -- establish multiple independent suppliers',
            consequences: {
              traits: { strategic: 1, businessman: 1 },
              stats: { reputation: 5 },
              message: 'Three suppliers, three routes, three price points. If one falls, two remain. This is how real operations work.',
            },
          },
          {
            id: 'cartel_direct',
            name: 'Go direct -- negotiate with the Colombian Connection for a direct line',
            requirements: { minRep: 35 },
            consequences: {
              traits: { connected: 1, ambitious: 1 },
              stats: { reputation: 10 },
              faction: { colombian_connection: 15 },
              unlock: ['colombian_early_access'],
              message: 'The Colombians test you with a small shipment. You move it in 48 hours. They double the next one. This is the beginning of something very big.',
            },
          },
          {
            id: 'steal_routes',
            name: 'Steal routes -- intercept rival supply chains',
            consequences: {
              traits: { ruthless: 1, cunning: 1 },
              stats: { heat: 12, reputation: 8 },
              faction: { eastern_bloc: -15 },
              message: 'You hit an Eastern Bloc supply run on I-95. Their product is now your product. Their supplier is now asking questions.',
            },
          },
        ],
        objectives: [
          { id: 'second_supplier', desc: 'Establish a second supplier connection', type: 'suppliers', target: 2 },
          { id: 'import_route', desc: 'Set up a basic import route', type: 'import_routes', target: 1 },
        ],
        reward: { cash: 8000, rep: 15, xp: 200 },
        requires: ['M2_1'],
        unlocks: ['import_export_ui', 'caribbean_access'],
      },

      // ---- M2_3: THE LAUNDRY ----
      {
        id: 'M2_3', name: 'The Laundry', emoji: '🧹',
        desc: 'Sixty thousand dollars in cash under your mattress. You cannot spend it. You cannot deposit it. You cannot explain it. Every dollar is evidence. You need to clean this money before it buries you.',
        approaches: [
          {
            id: 'front_business',
            name: 'Buy a front business -- a laundromat, a car wash, a restaurant',
            consequences: {
              traits: { businessman: 1 },
              stats: { reputation: 5 },
              message: 'The Suds & Spin laundromat on 8th Street now washes more than clothes. $10,000 a week, clean as a whistle.',
            },
          },
          {
            id: 'smurfs',
            name: 'Use smurfs -- pay people to deposit small amounts across dozens of accounts',
            consequences: {
              traits: { cunning: 1 },
              stats: { heat: 3 },
              message: 'Twelve people, twelve banks, $9,000 each. Under the reporting threshold. It works until one of them talks.',
            },
          },
          {
            id: 'crypto',
            name: 'Go digital -- convert to cryptocurrency through a privacy mixer',
            consequences: {
              traits: { tech_savvy: 1 },
              stats: { heat: -3 },
              message: 'Bitcoin to Monero to a Cayman Islands account to a wire transfer. The feds are ten years behind on tracking this.',
            },
          },
        ],
        objectives: [
          { id: 'buy_front', desc: 'Purchase a front business', type: 'fronts_owned', target: 1 },
          { id: 'launder_cash', desc: 'Launder $10,000', type: 'cash_laundered', target: 10000 },
        ],
        reward: { cash: 3000, rep: 12, xp: 180 },
        requires: ['M2_1'],
        unlocks: ['laundering_advanced', 'shell_companies'],
      },

      // ---- M2_4: FACTION WAR (Major Choice Mission) ----
      {
        id: 'M2_4', name: 'Faction War', emoji: '⚔️',
        hoursRange: [22, 26],
        desc: 'The uneasy peace between Los Cubanos and Zoe Pound shatters when a Cubanos lieutenant is found dead on Zoe Pound turf. Both sides are arming up. Both sides want your help. You control territory between them -- strategic ground. Your choice will reshape the power map of Miami for the rest of the game.',
        approaches: [
          {
            id: 'side_cubanos',
            name: 'Side with Los Cubanos -- Don Alejandro promises Hialeah territory and premium supply prices',
            consequences: {
              traits: { allied: 1, strategic: 1 },
              stats: { reputation: 10 },
              faction: { los_cubanos: 25, zoe_pound: -30, colombian_connection: 5 },
              unlock: ['M2_4B_cubanos_ally'],
              lock: ['M2_4B_zoe_ally', 'M2_4B_profiteer', 'M2_4B_peacemaker'],
              message: 'You sit across from Don Alejandro in his cigar shop. He pours two glasses of rum. "To our partnership," he says. Your phone buzzes -- Mama Celine\'s people know you chose. The war begins.',
            },
          },
          {
            id: 'side_zoe',
            name: 'Side with Zoe Pound -- Mama Celine offers Little Haiti access and muscle when you need it',
            consequences: {
              traits: { loyal: 1, fearless: 1 },
              stats: { reputation: 8, heat: 5 },
              faction: { zoe_pound: 25, los_cubanos: -30 },
              unlock: ['M2_4B_zoe_ally'],
              lock: ['M2_4B_cubanos_ally', 'M2_4B_profiteer', 'M2_4B_peacemaker'],
              message: 'Mama Celine gives you a necklace -- a voodoo protection charm. "You are family now," she says. Her soldiers are your soldiers. Don Alejandro will not forget this betrayal.',
            },
          },
          {
            id: 'play_both',
            name: 'Play both sides -- sell to whoever pays more and keep your hands clean',
            consequences: {
              traits: { cunning: 1, greedy: 1, risk_taker: 1 },
              stats: { reputation: 3, heat: 3 },
              faction: { los_cubanos: -5, zoe_pound: -5 },
              unlock: ['M2_4B_profiteer'],
              lock: ['M2_4B_cubanos_ally', 'M2_4B_zoe_ally', 'M2_4B_peacemaker'],
              message: 'You sell weapons to the left hand and intelligence to the right. The money is extraordinary. The danger is absolute. If either side finds out, you die twice.',
            },
          },
          {
            id: 'broker_peace',
            name: 'Broker peace -- risk everything to stop the war before it destroys the market',
            requirements: { minRep: 40, traits: { diplomat: true } },
            consequences: {
              traits: { diplomat: 2, peacemaker: 1, respected: 1 },
              stats: { reputation: 20 },
              faction: { los_cubanos: 15, zoe_pound: 15, colombian_connection: 10 },
              ability: 'mediator',
              unlock: ['M2_4B_peacemaker'],
              lock: ['M2_4B_cubanos_ally', 'M2_4B_zoe_ally', 'M2_4B_profiteer'],
              message: 'It takes three days of back-channel negotiation. Threats. Promises. A dead lieutenant\'s family paid in full. But you get them to the table. When they shake hands in your restaurant, you become the most important person in Miami who nobody has heard of.',
            },
          },
        ],
        objectives: [
          { id: 'choose_side', desc: 'Choose a side in the faction war (or stay neutral)', type: 'faction_choice', target: 1 },
          { id: 'complete_war_mission', desc: 'Complete a war-related mission', type: 'war_mission', target: 1 },
        ],
        reward: { cash: 15000, rep: 25, xp: 250 },
        requires: ['M2_2'],
        choiceConsequences: true,
      },

      // ---- M2_5: THE FEDS ----
      {
        id: 'M2_5', name: 'The Feds', emoji: '🏛️',
        desc: 'A black SUV has been parked outside your front business for three days. A woman in a suit asks your employees questions. The DEA has opened a file. This is not local heat -- this is federal. Everything changes now.',
        approaches: [
          {
            id: 'lawyer_up',
            name: 'Lawyer up -- hire the best criminal defense attorney in Miami',
            requirements: { minCash: 10000 },
            consequences: {
              traits: { cautious: 1, prepared: 1 },
              stats: { heat: -10 },
              unlock: ['elite_lawyer_contact'],
              message: 'Victoria Reyes-Chen, Esq. costs $500 an hour and is worth every penny. She sends a letter to the DEA that makes them reconsider their timeline.',
            },
          },
          {
            id: 'counter_intel',
            name: 'Counter-intelligence -- find out what they know and feed them false leads',
            consequences: {
              traits: { cunning: 1, strategic: 1 },
              stats: { heat: -8, reputation: 5 },
              message: 'A contact in the courthouse gets you a look at the file. It is thin. You feed them breadcrumbs that lead nowhere. The investigation spins its wheels.',
            },
          },
          {
            id: 'scatter',
            name: 'Scatter operations -- fragment everything so no single bust can take you down',
            consequences: {
              traits: { strategic: 1, adaptable: 1 },
              stats: { heat: -12 },
              ability: 'compartmentalized_ops',
              message: 'You break the operation into cells. No one person knows the full picture. The feds can grab a piece, but never the whole machine.',
            },
          },
          {
            id: 'corrupt_agent',
            name: 'Find a corrupt DEA agent -- everyone has a price',
            requirements: { minRep: 35, minCash: 15000 },
            consequences: {
              traits: { corruptor: 1, risk_taker: 1 },
              stats: { heat: -20, reputation: 5 },
              unlock: ['dea_mole'],
              message: 'Agent Torres has alimony payments and a gambling problem. $15,000 makes both go away. Now you know what the feds know before they know it.',
            },
          },
        ],
        objectives: [
          { id: 'survive_investigation', desc: 'Survive a federal investigation probe', type: 'investigation_survive', target: 1 },
          { id: 'keep_heat_low', desc: 'Keep heat below 40 for 5 days while under scrutiny', type: 'heat_control', target: 5 },
        ],
        reward: { cash: 5000, rep: 15, xp: 200 },
        requires: ['M2_3'],
        unlocks: ['federal_heat_tier', 'advanced_stealth'],
      },

      // ---- M2_6: INTERNATIONAL WATERS ----
      {
        id: 'M2_6', name: 'International Waters', emoji: '🌊',
        desc: 'A boat captain named Rene offers you something your competitors do not have: a direct line to the Caribbean. Uncut product, wholesale prices, delivered to a dock in the Keys. The first shipment is a test. If it goes well, the pipeline opens. If it goes wrong, you lose everything you invested and maybe your freedom.',
        approaches: [
          {
            id: 'full_investment',
            name: 'Go all in -- invest everything in the first major shipment',
            requirements: { minCash: 20000 },
            consequences: {
              traits: { ambitious: 1, risk_taker: 1 },
              stats: { reputation: 15 },
              faction: { colombian_connection: 10 },
              message: 'Everything on one boat. One night. One dock. Your heart stops when the Coast Guard passes within 500 yards. But the shipment lands. $200,000 worth of product. You just went international.',
            },
          },
          {
            id: 'test_small',
            name: 'Test run -- start with a small shipment to prove the route',
            consequences: {
              traits: { cautious: 1, strategic: 1 },
              stats: { reputation: 8 },
              message: 'A small package. One boat. One night. It arrives clean. Now you know the route works. Next time, you scale up.',
            },
          },
          {
            id: 'partner_ship',
            name: 'Split the shipment with a faction ally to share risk',
            requirements: { traits: { diplomat: true } },
            consequences: {
              traits: { connected: 1 },
              stats: { reputation: 10 },
              faction: { los_cubanos: 10, colombian_connection: 5 },
              message: 'Shared risk, shared reward. Your faction ally puts up half the cash. The shipment splits clean. Trust deepens.',
            },
          },
        ],
        objectives: [
          { id: 'international_deal', desc: 'Complete an international deal', type: 'international_deals', target: 1 },
          { id: 'profit_target', desc: 'Make $20,000 profit from imported goods', type: 'import_profit', target: 20000 },
        ],
        reward: { cash: 20000, rep: 30, xp: 300 },
        requires: ['M2_5'],
        unlocks: ['caribbean_routes', 'boat_smuggling'],
      },

      // ---- M2_7: POWER PLAY (Act 2 Climax) ----
      {
        id: 'M2_7', name: 'Power Play', emoji: '♟️',
        hoursRange: [28, 32],
        desc: 'Act 2 climax. The biggest supplier in Miami, a man called El Arquitecto, disappears overnight. Some say the feds got him. Some say the Colombians recalled him. Whatever happened, he left behind a power vacuum the size of the entire Dade County drug trade. Every faction is making their move. This is the moment you either become a king, a kingmaker, or a shadow. Choose wrong and you will not survive Act 3.',
        approaches: [
          {
            id: 'seize_power',
            name: 'Seize power -- declare yourself the new boss of bosses',
            requirements: { minRep: 50 },
            consequences: {
              traits: { kingpin: 1, ambitious: 2, feared: 1 },
              stats: { heat: 25, reputation: 25 },
              faction: { southern_boys: -15, los_cubanos: -10, zoe_pound: -15, colombian_connection: 5 },
              unlock: ['M2_7B_kingpin'],
              lock: ['M2_7B_coalition', 'M2_7B_shadow'],
              message: 'You stand up at the meeting. "El Arquitecto is gone. I am here." The room goes silent. Some nod. Some reach for their guns. But nobody leaves. The crown is yours -- along with every target on your back.',
            },
          },
          {
            id: 'build_coalition',
            name: 'Build a coalition -- propose a council of equals to fill the vacuum',
            requirements: { minRep: 40, traits: { diplomat: true } },
            consequences: {
              traits: { diplomat: 2, leader: 1, respected: 1 },
              stats: { reputation: 20 },
              faction: { los_cubanos: 15, zoe_pound: 10, colombian_connection: 20 },
              ability: 'coalition_leader',
              unlock: ['M2_7B_coalition'],
              lock: ['M2_7B_kingpin', 'M2_7B_shadow'],
              message: 'It takes a week of negotiations. Threats. Compromises. But you pull it off: a council of five, with you as the mediator. No one faction dominates. Product flows. The Colombians love stability -- they double the pipeline.',
            },
          },
          {
            id: 'stay_hidden',
            name: 'Stay hidden -- install a puppet and control everything from the shadows',
            requirements: { traits: { cunning: true } },
            consequences: {
              traits: { cunning: 2, puppet_master: 1, stealthy: 1 },
              stats: { heat: -15, reputation: 5 },
              ability: 'shadow_boss',
              unlock: ['M2_7B_shadow'],
              lock: ['M2_7B_kingpin', 'M2_7B_coalition'],
              message: 'You pick a loud, ambitious man named Big Carlos. Feed him scripts. Let him take the meetings, the heat, the glory. You take the money. Every string in Miami runs through your fingers, and nobody even knows your name.',
            },
          },
        ],
        objectives: [
          { id: 'total_cash', desc: 'Accumulate $100,000', type: 'cash', target: 100000 },
          { id: 'territory_count', desc: 'Control 5+ territories', type: 'own_territory', target: 5 },
          { id: 'crew_size', desc: 'Have 5+ crew members', type: 'crew_count', target: 5 },
        ],
        reward: { cash: 50000, rep: 40, xp: 500 },
        requires: ['M2_6'],
        unlocks: ['act3'],
        isActClimax: true,
        choiceConsequences: true,
      },
    ],
    sideMissions: [
      {
        id: 'S2_1', name: 'The Accountant', desc: 'A forensic accountant named Gerald Chen lost his CPA license for "creative bookkeeping." Now he needs work, and you need someone who can make money disappear. Multi-step interview process: trust is earned, not given.',
        reward: { cash: 5000, rep: 8, xp: 120 },
        consequences: {
          traits: { organized: 1 },
          message: 'Gerald sets up a spreadsheet that makes your laundering 40% more efficient. Numbers man. Worth his weight in clean bills.',
        },
      },
      {
        id: 'S2_2', name: 'Port Introduction', desc: 'The Port Authority is a faction unto itself. Getting an introduction means proving you can move volume without attracting attention. One test shipment. One chance.',
        reward: { cash: 3000, rep: 10, xp: 100 },
        consequences: {
          faction: { port_authority: 15 },
          message: 'The dock foreman nods. You are in. Container shipping just became an option.',
        },
      },
      {
        id: 'S2_3', name: 'The Processing Lab', desc: 'Raw product sells for X. Processed product sells for 3X. Marcus the chemist needs a space, equipment, and protection. Set up your first lab.',
        reward: { cash: 8000, rep: 8, xp: 150 },
        consequences: {
          traits: { manufacturer: 1 },
          message: 'The lab hums. Marcus works his magic. Your margins just tripled.',
        },
      },
      {
        id: 'S2_4', name: 'Witness Protection', desc: 'A witness is set to testify against an associate of yours. If he talks, the chain of evidence leads to your door. Deal with the situation -- there are multiple ways, not all of them violent.',
        approaches: [
          {
            id: 'intimidate', name: 'Scare the witness into silence',
            consequences: { traits: { intimidating: 1 }, stats: { heat: 5 } },
          },
          {
            id: 'relocate', name: 'Pay for the witness to disappear',
            consequences: { traits: { strategic: 1 }, stats: { reputation: 3 } },
          },
          {
            id: 'discredit', name: 'Dig up dirt and discredit their testimony',
            consequences: { traits: { cunning: 1 }, stats: { heat: -3 } },
          },
        ],
        reward: { cash: 10000, rep: 15, xp: 200 },
      },
      {
        id: 'S2_5', name: 'The Politician', desc: 'City Councilman Ray Delgado needs campaign funds. You need building permits approved and police patrols rerouted. A match made in hell.',
        reward: { cash: 0, rep: 20, xp: 150 }, unlocks: ['political_connections'],
        consequences: {
          traits: { connected: 1, corruptor: 1 },
          message: 'Delgado wins his seat. Your calls go straight through. Zoning? Approved. Patrols? Rerouted. This is how the real game is played.',
        },
      },
      {
        id: 'S2_6', name: 'Boat Captain', desc: 'Captain Rene needs proof you are serious before he risks his boat and his freedom on regular runs. A test voyage to Bimini and back. 48 hours.',
        reward: { cash: 5000, rep: 5, xp: 100 },
        consequences: {
          traits: { connected: 1 },
          message: 'Rene cuts the engine off Bimini. "You did not panic," he says. "Most people panic." You have a captain now.',
        },
      },
      {
        id: 'S2_7', name: 'The Betrayer', desc: 'Someone in your crew is feeding information to a rival faction. Small leaks -- a shipment schedule, a meeting location. Find the mole before the leaks become a flood.',
        approaches: [
          {
            id: 'investigate', name: 'Feed different info to each suspect, see which leaks',
            consequences: { traits: { strategic: 1, perceptive: 1 } },
          },
          {
            id: 'purge', name: 'Fire everyone under suspicion -- no chances',
            consequences: { traits: { ruthless: 1, paranoid: 1 } },
          },
        ],
        reward: { cash: 2000, rep: 15, xp: 180 },
      },
      { id: 'S2_8', name: 'Property Empire', desc: 'Acquire 3 properties across different districts. Stash houses, safe houses, and a penthouse for when you need to disappear.', reward: { cash: 5000, rep: 10, xp: 120 } },
      {
        id: 'S2_9', name: 'Cuban Connection', desc: 'Gain Los Cubanos trust through a series of three favors. Each one tests a different quality: loyalty, discretion, and nerve.',
        reward: { cash: 10000, rep: 15, xp: 200 },
        consequences: {
          faction: { los_cubanos: 20 },
          message: 'Don Alejandro invites you to his daughter\'s quincea. You are no longer a business contact. You are family.',
        },
      },
      { id: 'S2_10', name: 'Stadium Score', desc: 'Set up operations around Hard Rock Stadium for game day. 80,000 potential customers in one location. High reward, high visibility.', reward: { cash: 15000, rep: 10, xp: 150 } },
      {
        id: 'S2_11', name: 'The Lab Rat', desc: 'Marcus has a new formula. If it works, it could be the purest product on the market. If it fails, it could kill someone. He needs a test batch run.',
        reward: { cash: 8000, rep: 5, xp: 200 },
        consequences: {
          traits: { manufacturer: 1 },
          message: 'The formula works. 97% purity. Marcus names it "Blue Ghost." The streets are going to love this.',
        },
      },
      { id: 'S2_12', name: 'Turf Wars', desc: 'Defend territory from 3 consecutive attacks over 10 days. The vultures smell blood. Prove them wrong.', reward: { cash: 12000, rep: 20, xp: 250 } },
    ],
  },

  // ==================================================================
  // ACT 3: THE EMPIRE
  // ==================================================================
  {
    id: 'act3', name: 'Act 3: The Empire', emoji: '🏰',
    hoursRange: [32, 50],
    dayRange: [151, 300],
    desc: 'You run a real operation now. Manage your empire, handle political pressure, go international. The choices from Acts 1 and 2 echo through every interaction.',
    unlockMessage: 'You\'ve built something real. Now comes the hard part -- keeping it.',
    mainMissions: [
      {
        id: 'M3_1', name: 'The Organization', emoji: '🏛️',
        desc: 'Restructure your crew into a proper hierarchy. Lieutenants, captains, soldiers. An empire needs structure or it collapses under its own weight.',
        approaches: [
          {
            id: 'meritocracy',
            name: 'Promote based on performance -- the best rise',
            consequences: {
              traits: { fair_leader: 1 },
              stats: { reputation: 8 },
              message: 'The cream rises. Your best earners become lieutenants. They respect the system because the system respects talent.',
            },
          },
          {
            id: 'loyalty_first',
            name: 'Promote based on loyalty -- the faithful rise',
            consequences: {
              traits: { loyal_leader: 1 },
              stats: { reputation: 5 },
              message: 'Day-ones get the promotions. They are not always the smartest, but they would die for you. In this business, that matters more.',
            },
          },
          {
            id: 'fear_hierarchy',
            name: 'Rule through fear -- the obedient rise',
            consequences: {
              traits: { feared: 1, ruthless: 1 },
              stats: { reputation: 10, heat: 5 },
              message: 'You make an example of a lieutenant who questioned you publicly. The rest fall in line. Fear is the most efficient management tool.',
            },
          },
        ],
        objectives: [
          { id: 'promote_lieutenant', desc: 'Promote a crew member to lieutenant', type: 'crew_rank', target: 'lieutenant' },
          { id: 'crew_ten', desc: 'Maintain a crew of 10+', type: 'crew_count', target: 10 },
        ],
        reward: { cash: 10000, rep: 20, xp: 250 },
        requires: ['M2_7'],
      },
      {
        id: 'M3_2', name: 'The Colombian', emoji: '🇨🇴',
        desc: 'The Colombian Connection notices you. A direct supply line is possible -- if you can handle the volume and the pressure.',
        objectives: [
          { id: 'discover_colombian', desc: 'Discover the Colombian Connection', type: 'faction_discovered', target: 'colombian_connection' },
          { id: 'volume_requirement', desc: 'Move $200,000 in product in 30 days', type: 'sales_volume', target: 200000 },
        ],
        reward: { cash: 50000, rep: 30, xp: 400 },
        requires: ['M3_1'],
        unlocks: ['colombian_supply', 'wholesale_prices'],
        consequences: {
          traits: { international: 1 },
          faction: { colombian_connection: 15 },
          message: 'The pipeline opens. Pure Colombian product at wholesale prices. You have arrived.',
        },
      },
      {
        id: 'M3_3', name: 'Political Machine', emoji: '🏛️',
        desc: 'Build political infrastructure. Bribe officials, fund campaigns, build a protection network.',
        approaches: [
          {
            id: 'donations',
            name: 'Legitimate campaign donations through shell companies',
            consequences: {
              traits: { businessman: 1, strategic: 1 },
              stats: { heat: -5, reputation: 8 },
              message: 'Clean money buys clean influence. Your shell companies donate to three campaigns. All of them win.',
            },
          },
          {
            id: 'blackmail',
            name: 'Gather dirt on officials and leverage it',
            consequences: {
              traits: { cunning: 1, ruthless: 1 },
              stats: { reputation: 5 },
              message: 'The judge with the mistress. The commissioner with the offshore account. Knowledge is power.',
            },
          },
          {
            id: 'community',
            name: 'Build genuine community support that forces politicians to work with you',
            consequences: {
              traits: { community: 1, respected: 1 },
              stats: { reputation: 12 },
              message: 'You fund a youth center. A food bank. A church renovation. The community loves you. And politicians follow votes.',
            },
          },
        ],
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
        desc: 'Build a complete supply pipeline from source to street. Full vertical integration across your operation.',
        objectives: [
          { id: 'full_pipeline', desc: 'Operate: import, process, distribute, launder', type: 'pipeline_complete', target: 1 },
          { id: 'monthly_revenue', desc: 'Generate $50,000/day passive income', type: 'daily_income', target: 50000 },
        ],
        reward: { cash: 100000, rep: 40, xp: 500 },
        requires: ['M3_2'],
        consequences: {
          traits: { empire_builder: 1 },
          message: 'From the dock to the corner to the bank account. Every step controlled. This is a machine now.',
        },
      },
      {
        id: 'M3_5', name: 'RICO Warning', emoji: '⚖️',
        desc: 'The feds are building a RICO case. Your empire is under existential threat. Everything you have built could vanish with one indictment.',
        approaches: [
          {
            id: 'destroy_evidence',
            name: 'Burn it all -- destroy every piece of evidence',
            consequences: {
              traits: { ruthless: 1, paranoid: 1 },
              stats: { heat: -15 },
              message: 'Three hard drives. Two ledgers. One warehouse. All ashes now. The feds can suspect, but they cannot prove.',
            },
          },
          {
            id: 'legal_defense',
            name: 'Build an ironclad legal defense -- lawyers, alibis, character witnesses',
            consequences: {
              traits: { prepared: 1, strategic: 1 },
              stats: { heat: -10, reputation: 5 },
              message: 'Your legal team costs $50,000 a month. Worth every cent. The RICO case hits a wall of motions and counter-filings.',
            },
          },
          {
            id: 'flee_prep',
            name: 'Prepare an exit -- offshore accounts, fake passport, safe house abroad',
            consequences: {
              traits: { cautious: 1, survival: 1 },
              stats: { heat: -5 },
              unlock: ['escape_route'],
              message: 'A Bahamian bank account. A Dominican passport. A villa in Cartagena. Just in case. You pray you never need it.',
            },
          },
        ],
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
        hoursRange: [46, 50],
        desc: 'Act 3 climax. All faction leaders gather at a neutral location. The old order is dead. A new power structure must be established. Your actions across three acts have shaped who is in the room and who is in the ground.',
        approaches: [
          {
            id: 'declare_supremacy',
            name: 'Declare your supremacy -- you are the biggest, you make the rules',
            requirements: { minRep: 60 },
            consequences: {
              traits: { kingpin: 2, feared: 1 },
              stats: { heat: 20, reputation: 25 },
              faction: { southern_boys: -20, eastern_bloc: -15 },
              message: 'You lay down the law. Some kneel. Some plot. But today, you are the undisputed king of Miami.',
            },
          },
          {
            id: 'federation',
            name: 'Propose a federation -- organized crime as organized business',
            requirements: { traits: { diplomat: true } },
            consequences: {
              traits: { diplomat: 2, leader: 1 },
              stats: { reputation: 20 },
              faction: { los_cubanos: 10, zoe_pound: 10, colombian_connection: 15 },
              ability: 'federation_chair',
              message: 'Territories divided. Supply chains shared. Profits split by agreement. It is not peace -- it is business. And business is good.',
            },
          },
          {
            id: 'coup',
            name: 'Use the summit as a trap -- eliminate rival leaders in one move',
            consequences: {
              traits: { ruthless: 3, betrayer: 1 },
              stats: { heat: 30, reputation: 30 },
              faction: { los_cubanos: -40, zoe_pound: -40, southern_boys: -40 },
              message: 'The doors lock. Your soldiers enter. When the summit ends, three faction leaders are dead and you own everything. The feds go to DEFCON 1.',
            },
          },
        ],
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
      { id: 'S3_2', name: 'The Submarine', desc: 'Locate and acquire a narco submarine for untraceable shipping.', reward: { cash: 0, rep: 20, xp: 300 }, unlocks: ['sub_smuggling'] },
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

  // ==================================================================
  // ACT 4: THE RECKONING
  // ==================================================================
  {
    id: 'act4', name: 'Act 4: The Reckoning', emoji: '⚡',
    hoursRange: [50, 65],
    dayRange: [301, 450],
    desc: 'The pressure builds. Betrayal, federal heat, rival empires. Everything you built is tested. Your choices from three acts come home to roost.',
    unlockMessage: 'They\'re coming for everything. The question is: will you hold?',
    mainMissions: [
      {
        id: 'M4_1', name: 'The Betrayal', emoji: '🗡️',
        desc: 'Someone close to you is working with the feds. The signs were there -- a meeting that got raided, a shipment that got intercepted, a safe house that got burned. Find the traitor in your organization before they bury you.',
        approaches: [
          {
            id: 'investigate',
            name: 'Patient investigation -- feed different info to suspects, see what leaks',
            consequences: {
              traits: { strategic: 1, perceptive: 1 },
              stats: { reputation: 5 },
              message: 'Three days. Three lies. One truth. The mole takes the bait and the feds raid an empty warehouse. Now you know.',
            },
          },
          {
            id: 'mercy',
            name: 'Show mercy when you find them -- everyone deserves one chance',
            consequences: {
              traits: { merciful: 1, respected: 1 },
              stats: { reputation: 8 },
              message: 'He weeps. Begs. You let him live -- on the condition he feeds the feds exactly what you tell him. A mole becomes a double agent.',
            },
          },
          {
            id: 'execute',
            name: 'Make an example -- traitors die, no exceptions',
            consequences: {
              traits: { ruthless: 2, feared: 1 },
              stats: { heat: 10, reputation: 10 },
              message: 'The crew watches. The traitor kneels. You pull the trigger yourself. Nobody will ever betray you again. Nobody will ever fully trust you again either.',
            },
          },
        ],
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
        desc: 'Multiple factions attack simultaneously. Defend your empire on multiple fronts. Every alliance you built, every enemy you made -- it all matters now.',
        objectives: [
          { id: 'defend_all', desc: 'Defend all territories in a multi-front war', type: 'turf_wars_won', target: 3 },
          { id: 'maintain_control', desc: 'Maintain control of at least 70% of territories', type: 'territory_percent', target: 70 },
        ],
        reward: { cash: 50000, rep: 35, xp: 400 },
        requires: ['M4_1'],
        consequences: {
          traits: { survivor: 1 },
          message: 'The siege breaks. Your empire stands. Battered, bleeding, but standing.',
        },
      },
      {
        id: 'M4_3', name: 'RICO', emoji: '⚖️',
        desc: 'Federal indictment incoming. The full weight of the United States government versus everything you have built. Navigate the legal system, flee, or fight.',
        approaches: [
          {
            id: 'fight_legal',
            name: 'Fight it in court -- you have the best lawyers money can buy',
            consequences: {
              traits: { defiant: 1, prepared: 1 },
              stats: { reputation: 10 },
              message: 'The trial begins. Your legal team files 47 motions. The case drags. Evidence gets suppressed. You might actually win this.',
            },
          },
          {
            id: 'cooperate',
            name: 'Cooperate selectively -- give them someone bigger in exchange for immunity',
            consequences: {
              traits: { survivor: 1, betrayer: 1 },
              stats: { heat: -30, reputation: -15 },
              faction: { colombian_connection: -40 },
              message: 'You give them names. Not your people -- bigger fish. The Colombians will never forgive you. But you walk free.',
            },
          },
          {
            id: 'flee',
            name: 'Activate the escape plan -- disappear before the indictment drops',
            requirements: { traits: { cautious: true } },
            consequences: {
              traits: { survivor: 1, exile: 1 },
              stats: { heat: -20 },
              message: 'A private plane. A new name. A villa with a view. You watch the news from Cartagena as your empire crumbles without you.',
            },
          },
        ],
        objectives: [
          { id: 'avoid_indictment', desc: 'Avoid or survive federal indictment', type: 'legal_survival', target: 1 },
        ],
        reward: { cash: 30000, rep: 30, xp: 350 },
        requires: ['M4_2'],
      },
      {
        id: 'M4_4', name: 'The Purge', emoji: '🔥',
        desc: 'Clean house. Remove threats, secure loyal allies, prepare for the endgame. The reckoning is almost over. What remains must be unbreakable.',
        objectives: [
          { id: 'secure_crew', desc: 'Ensure all crew loyalty above 70%', type: 'crew_loyalty_min', target: 70 },
          { id: 'eliminate_threats', desc: 'Eliminate or neutralize 3 major threats', type: 'threats_handled', target: 3 },
        ],
        reward: { cash: 75000, rep: 40, xp: 500 },
        requires: ['M4_3'],
        consequences: {
          traits: { survivor: 1, hardened: 1 },
          message: 'The weak are gone. The disloyal are gone. What remains is iron.',
        },
      },
      {
        id: 'M4_5', name: 'Point of No Return', emoji: '🚪',
        hoursRange: [62, 65],
        desc: 'Act 4 climax. The final fork in the road. Every choice, every ally, every enemy, every dollar -- it all leads here. You must choose your ending path. There is no going back. The person you have become across four acts determines which doors are open and which are sealed forever.',
        approaches: [
          {
            id: 'kingpin_ending',
            name: 'The Kingpin -- double down on power, rule Miami until they pry it from your cold hands',
            requirements: { minRep: 60 },
            consequences: {
              traits: { kingpin: 2, defiant: 1 },
              stats: { heat: 15, reputation: 20 },
              unlock: ['ending_kingpin'],
              message: 'You choose the throne. Every cop, every fed, every rival -- let them come. You built this empire and you will die on it before you surrender it.',
            },
          },
          {
            id: 'legitimate_ending',
            name: 'Go Legitimate -- use your empire to build a real business empire, wash your hands clean',
            requirements: { traits: { businessman: true } },
            consequences: {
              traits: { legitimate: 1, strategic: 1 },
              stats: { heat: -10, reputation: 10 },
              unlock: ['ending_legitimate'],
              message: 'The drug money built the foundation. Now you pivot. Real estate. Restaurants. A record label. Go straight, stay rich, pray the past stays buried.',
            },
          },
          {
            id: 'ghost_ending',
            name: 'Vanish -- take the money and disappear, let the empire crumble behind you',
            requirements: { traits: { cautious: true } },
            consequences: {
              traits: { ghost: 1, survivor: 1 },
              stats: { heat: -30 },
              unlock: ['ending_ghost'],
              message: 'A bag of cash. A fake passport. One last look at the Miami skyline. You walk away from everything. Some would call it cowardice. You call it survival.',
            },
          },
          {
            id: 'revenge_ending',
            name: 'Burn it all -- if you cannot have it, nobody can',
            consequences: {
              traits: { nihilist: 1, ruthless: 2 },
              stats: { heat: 30, reputation: 15 },
              unlock: ['ending_revenge'],
              message: 'If the feds want a war, you will give them one. If the factions want blood, they will drown in it. You came from nothing. Going back to nothing does not scare you.',
            },
          },
        ],
        objectives: [
          { id: 'choose_ending_path', desc: 'Choose your ending path', type: 'ending_path_chosen', target: 1 },
        ],
        reward: { cash: 100000, rep: 50, xp: 750 },
        requires: ['M4_4'],
        unlocks: ['act5'],
        isActClimax: true,
        choiceConsequences: true,
        endingPathChoice: true,
      },
    ],
    sideMissions: [], // Act 4 is focused -- no side missions, just the reckoning
  },

  // ==================================================================
  // ACT 5: THE ENDGAME
  // ==================================================================
  {
    id: 'act5', name: 'Act 5: The Endgame', emoji: '🎭',
    hoursRange: [65, 80],
    dayRange: [451, 600],
    desc: 'Your final chapter. The ending you\'ve earned through every choice, every alliance, every betrayal.',
    unlockMessage: 'This is how it ends. Or how it begins again.',
    mainMissions: [], // Act 5 missions are determined by ending path -- see endings-system.js
    sideMissions: [],
    isEndingAct: true, // Special handling -- missions come from endings system
  },
];


// ============================================================
// MISSION RESOLUTION ENGINE
// Handles approach selection, consequence application, and
// branch mission injection.
// ============================================================

// Apply consequences from a chosen approach
function applyApproachConsequences(state, mission, approachId) {
  if (!state.campaign) return null;

  // Find the approach in the mission
  const approach = (mission.approaches || []).find(a => a.id === approachId);
  if (!approach || !approach.consequences) return null;

  const c = approach.consequences;

  // Apply trait changes
  if (c.traits) {
    if (!state.campaign.traits) state.campaign.traits = {};
    for (const [trait, value] of Object.entries(c.traits)) {
      if (typeof value === 'boolean') {
        state.campaign.traits[trait] = value;
      } else {
        state.campaign.traits[trait] = (state.campaign.traits[trait] || 0) + value;
      }
    }
  }

  // Apply stat changes
  if (c.stats) {
    if (c.stats.heat !== undefined) state.heat = Math.max(0, Math.min(100, (state.heat || 0) + c.stats.heat));
    if (c.stats.reputation !== undefined) state.reputation = Math.max(0, Math.min(100, (state.reputation || 0) + c.stats.reputation));
  }

  // Apply faction standing changes
  if (c.faction) {
    if (!state.factions) state.factions = { standings: {} };
    if (!state.factions.standings) state.factions.standings = {};
    for (const [factionId, delta] of Object.entries(c.faction)) {
      state.factions.standings[factionId] = (state.factions.standings[factionId] || 0) + delta;
    }
  }

  // Apply ability grants
  if (c.ability) {
    if (!state.campaign.abilities) state.campaign.abilities = [];
    if (!state.campaign.abilities.includes(c.ability)) {
      state.campaign.abilities.push(c.ability);
    }
  }

  // Unlock branch missions
  if (c.unlock) {
    if (!state.campaign.unlockedBranches) state.campaign.unlockedBranches = [];
    for (const branchId of c.unlock) {
      if (!state.campaign.unlockedBranches.includes(branchId)) {
        state.campaign.unlockedBranches.push(branchId);
      }
    }
  }

  // Lock missions (paths not taken)
  if (c.lock) {
    if (!state.campaign.lockedBranches) state.campaign.lockedBranches = [];
    for (const branchId of c.lock) {
      if (!state.campaign.lockedBranches.includes(branchId)) {
        state.campaign.lockedBranches.push(branchId);
      }
    }
  }

  // Record the choice in history
  if (!state.campaign.choiceHistory) state.campaign.choiceHistory = [];
  state.campaign.choiceHistory.push({
    mission: mission.id,
    approach: approachId,
    day: state.day || 0,
    message: c.message || '',
  });

  return c;
}

// Check if a branch mission's requirements are met
function isBranchMissionAvailable(state, branchMission) {
  if (!state.campaign) return false;

  // Check requiresChoice
  if (branchMission.requiresChoice) {
    const { mission, approach } = branchMission.requiresChoice;
    const choice = (state.campaign.choiceHistory || []).find(
      ch => ch.mission === mission && ch.approach === approach
    );
    if (!choice) return false;
  }

  // Check if explicitly unlocked
  if (state.campaign.unlockedBranches && state.campaign.unlockedBranches.includes(branchMission.id)) {
    // Check it is not also locked (lock overrides unlock)
    if (state.campaign.lockedBranches && state.campaign.lockedBranches.includes(branchMission.id)) {
      return false;
    }
    return true;
  }

  // Check if explicitly locked
  if (state.campaign.lockedBranches && state.campaign.lockedBranches.includes(branchMission.id)) {
    return false;
  }

  // If it has requiresChoice and that choice was made, it is available
  if (branchMission.requiresChoice) {
    const { mission, approach } = branchMission.requiresChoice;
    const choice = (state.campaign.choiceHistory || []).find(
      ch => ch.mission === mission && ch.approach === approach
    );
    return !!choice;
  }

  return false;
}

// Get all available branch missions for the current act
function getAvailableBranchMissions(state) {
  if (!state.campaign) return [];
  const currentAct = state.campaign.currentAct;

  return BRANCH_MISSIONS.filter(bm => {
    if (bm.act && bm.act !== currentAct) return false;
    if (state.campaign.completedMissions && state.campaign.completedMissions.includes(bm.id)) return false;
    return isBranchMissionAvailable(state, bm);
  });
}

// Check approach requirements against state
function meetsApproachRequirements(state, approach) {
  if (!approach.requirements) return true;
  const req = approach.requirements;

  if (req.minRep && (state.reputation || 0) < req.minRep) return false;
  if (req.minCash && (state.cash || 0) < req.minCash) return false;

  if (req.traits) {
    if (!state.campaign || !state.campaign.traits) return false;
    for (const [trait, required] of Object.entries(req.traits)) {
      if (required === true && !state.campaign.traits[trait]) return false;
      if (typeof required === 'number' && (state.campaign.traits[trait] || 0) < required) return false;
    }
  }

  return true;
}

// Get available approaches for a mission (filtering by requirements)
function getAvailableApproaches(state, mission) {
  if (!mission.approaches) return [];
  return mission.approaches.filter(a => meetsApproachRequirements(state, a));
}

// Find a mission by ID across all acts and branch missions
function findMissionById(missionId) {
  // Check main and side missions in acts
  for (const act of CAMPAIGN_ACTS) {
    const main = (act.mainMissions || []).find(m => m.id === missionId);
    if (main) return main;
    const side = (act.sideMissions || []).find(m => m.id === missionId);
    if (side) return side;
  }
  // Check branch missions
  const branch = BRANCH_MISSIONS.find(m => m.id === missionId);
  if (branch) return branch;
  return null;
}


// ============================================================
// CAMPAIGN STATE AND PROGRESSION
// ============================================================

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
    choiceHistory: [],       // Track major choices for ending determination
    traits: {},              // Accumulated traits from choices
    abilities: [],           // Special abilities granted by choices
    unlockedBranches: [],    // Branch mission IDs unlocked by choices
    lockedBranches: [],      // Branch mission IDs locked (paths not taken)
  };
}

// Get current act data
function getCurrentAct(state) {
  if (!state.campaign) return CAMPAIGN_ACTS[0];
  return CAMPAIGN_ACTS.find(a => a.id === state.campaign.currentAct) || CAMPAIGN_ACTS[0];
}

// Get available main missions (includes branch missions for current act)
function getAvailableMainMissions(state) {
  if (!state.campaign) return [];
  const act = getCurrentAct(state);
  if (!act.mainMissions) return [];

  // Standard main missions
  const mainAvailable = act.mainMissions.filter(m => {
    if (state.campaign.completedMissions.includes(m.id)) return false;
    if (m.requires) {
      for (const req of m.requires) {
        if (!state.campaign.completedMissions.includes(req)) return false;
      }
    }
    return true;
  });

  // Branch missions available for this act
  const branchAvailable = getAvailableBranchMissions(state);

  return [...mainAvailable, ...branchAvailable];
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

// Complete a mission (with optional approach for branching consequences)
function completeMission(state, missionId, approachId) {
  if (!state.campaign) return;
  if (state.campaign.completedMissions.includes(missionId)) return;

  state.campaign.completedMissions.push(missionId);
  state.campaign.totalMissionsCompleted++;

  // Find mission data -- check acts, side missions, and branch missions
  const mission = findMissionById(missionId);

  if (mission) {
    // Apply base reward
    if (mission.reward) {
      if (mission.reward.cash) state.cash += mission.reward.cash;
      if (mission.reward.rep) state.reputation = Math.min(100, (state.reputation || 0) + mission.reward.rep);
      if (mission.reward.xp && typeof awardXP === 'function') awardXP(state, 'mission_complete', mission.reward.xp);
    }

    // Apply approach-specific consequences if an approach was chosen
    if (approachId && mission.approaches) {
      applyApproachConsequences(state, mission, approachId);
    }

    // Apply mission-level consequences (non-approach-specific)
    if (mission.consequences && !approachId) {
      // Apply mission consequences the same way as approach consequences
      applyApproachConsequences(state, { approaches: [{ id: '_base', consequences: mission.consequences }] }, '_base');
    } else if (mission.consequences && approachId) {
      // Also apply base mission consequences in addition to approach consequences
      const baseMission = { approaches: [{ id: '_base', consequences: mission.consequences }] };
      // Only apply base consequences that do not conflict with approach consequences
      const approach = (mission.approaches || []).find(a => a.id === approachId);
      if (!approach || !approach.consequences) {
        applyApproachConsequences(state, baseMission, '_base');
      }
    }

    // Check for act progression
    const unlocks = mission.unlocks || [];
    if (unlocks.includes('act2')) state.campaign.currentAct = 'act2';
    if (unlocks.includes('act3')) state.campaign.currentAct = 'act3';
    if (unlocks.includes('act4')) state.campaign.currentAct = 'act4';
    if (unlocks.includes('act5')) state.campaign.currentAct = 'act5';
  }

  state.campaign.activeMission = null;
}

// Check all active mission objectives and auto-complete if all met
function checkMissionProgress(state) {
  if (!state.campaign || !state.campaign.activeMission) return null;

  const missionId = state.campaign.activeMission;
  const mission = findMissionById(missionId);
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
