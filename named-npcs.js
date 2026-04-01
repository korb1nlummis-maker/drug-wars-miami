/**
 * named-npcs.js - Drug Wars: Miami Vice Edition
 * 30 Named NPCs with multi-chapter story arcs
 */

const NAMED_NPCS = [
  // ===== NPC 1: Dr. Rosa Mendez =====
  {
    id: 'dr_rosa',
    name: 'Dr. Rosa Mendez',
    emoji: '\u{1F3E5}',
    role: 'Underground Doctor',
    location: 'little_havana',
    romanceOption: false,
    benefits: {
      healing: { hpPerDay: 30, crewRecoveryMultiplier: 2.0 },
      noHospitalRecords: true
    },
    chapters: [
      {
        id: 'ch1_discovery',
        title: 'Back Room Medicine',
        triggerCondition: { minAct: 1, minDay: 10 },
        description: 'A dimly lit back room behind a bodega. You find a woman in surgical scrubs stitching up a gunshot wound. No questions asked. No records kept.',
        outcomes: [
          { id: 'befriend', label: 'Introduce yourself respectfully', effects: { npcRep: 10 }, result: 'Dr. Rosa nods cautiously. "I treat anyone who walks through that door. No names, no judgments."' },
          { id: 'threaten', label: 'Demand she work for you', effects: { npcRep: -5, fear: 2 }, result: 'She sets down the scalpel slowly. Her hands are steady. "You need me more than I need you. Remember that."' },
          { id: 'ignore', label: 'Walk away quietly', effects: {}, result: 'You leave the way you came. She never looks up from her work.' }
        ]
      },
      {
        id: 'ch2_supplies',
        title: 'Medical Supply Run',
        triggerCondition: { minDay: 25, minRep: 5 },
        description: 'Dr. Rosa contacts you. Her supplies are running dangerously low. A medical shipment at the port could solve everything, but it belongs to a hospital.',
        outcomes: [
          { id: 'steal', label: 'Hijack the shipment ($0, +heat)', effects: { npcRep: 10, heat: 15 }, result: 'The supplies fill her clinic for months. Rosa is grateful but uneasy about the methods.' },
          { id: 'buy', label: 'Buy supplies legitimately ($5000)', effects: { npcRep: 15, cash: -5000 }, result: '"You did it the right way," she says, visibly relieved. Her trust in you deepens.' },
          { id: 'refuse', label: 'Not your problem', effects: { npcRep: -10 }, result: 'She nods stiffly. "I understand. Business is business." The warmth leaves her eyes.' }
        ]
      },
      {
        id: 'ch3_dea_raid',
        title: 'The DEA Comes Knocking',
        triggerCondition: { minDay: 45, minRep: 10, minHeat: 30 },
        description: 'DEA agents are surveilling Rosa\'s clinic. They suspect she\'s patching up cartel soldiers. If they raid, she goes down and your medical lifeline with her.',
        outcomes: [
          { id: 'protect', label: 'Create a diversion to draw DEA away', effects: { npcRep: 20, heat: 10 }, result: 'Your crew stages an incident across town. The agents scramble. Rosa relocates to a safer spot.' },
          { id: 'warn', label: 'Warn her and let her handle it', effects: { npcRep: 5 }, result: 'Rosa packs up overnight. She\'s safe but her operation is diminished for weeks.' },
          { id: 'abandon', label: 'Cut all ties, too risky', effects: { npcRep: -25 }, result: 'Rosa is arrested. She doesn\'t give up your name. But she\'ll remember your choice.' }
        ]
      },
      {
        id: 'ch4_kidnapped',
        title: 'Taken',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'A rival crew has kidnapped Dr. Rosa to serve as their personal surgeon. She managed to send one text: coordinates to a warehouse in Overtown.',
        outcomes: [
          { id: 'rescue_force', label: 'Full assault rescue ($10K, need 3+ crew)', effects: { npcRep: 30, cash: -10000, heat: 20, minCrew: 3 }, result: 'Your crew hits the warehouse hard. Rosa is shaken but alive. She owes you everything now.' },
          { id: 'rescue_stealth', label: 'Sneak in alone at night', effects: { npcRep: 25, playerHP: -20 }, result: 'You slip through a window. Two guards down quietly. Rosa grabs your arm as you run through the dark.' },
          { id: 'negotiate', label: 'Pay ransom ($25K)', effects: { npcRep: 10, cash: -25000 }, result: 'The exchange is tense but clean. Rosa is free, though the rivals now see you as soft.' },
          { id: 'leave', label: 'She\'s not worth the risk', effects: { npcRep: -50 }, result: 'Rosa disappears. Months later you hear she escaped on her own. She will never forgive you.' }
        ]
      },
      {
        id: 'ch5_future',
        title: 'The Doctor\'s Decision',
        triggerCondition: { minDay: 100, minRep: 25 },
        description: 'Dr. Rosa has a choice to make. A medical charity has offered her a position running a free clinic legitimately. Or she stays in the shadows with you.',
        outcomes: [
          { id: 'crew', label: 'Ask her to stay with you permanently', effects: { npcRep: 10, permanentBenefit: 'full_medical' }, result: '"I took an oath to help people. You\'re people." She stays. Full medical support, no limits.' },
          { id: 'clinic', label: 'Encourage the legitimate path', effects: { npcRep: 20, permanentBenefit: 'clinic_discount' }, result: 'Rosa opens the Rosa Mendez Free Clinic. She still treats your crew discreetly, at half cost.' },
          { id: 'force', label: 'Tell her she doesn\'t get to leave', effects: { npcRep: -40, fear: 10, permanentBenefit: 'forced_medical' }, result: 'The light dies in her eyes. She stays. But the healing hands shake now.' }
        ]
      }
    ]
  },

  // ===== NPC 2: Father Ignacio =====
  {
    id: 'father_ignacio',
    name: 'Father Ignacio',
    emoji: '\u26EA',
    role: 'Community Priest',
    location: 'little_havana',
    romanceOption: false,
    benefits: {
      sanctuary: { noRaids: true },
      communityBuffer: true,
      confession: { stressRelief: true, weeklyFree: true }
    },
    chapters: [
      {
        id: 'ch1_confrontation',
        title: 'The Sermon',
        triggerCondition: { minAct: 1, minDay: 5 },
        description: 'A priest in a worn collar steps into your path outside the church. His eyes are fierce. "You sell poison within sight of God\'s house."',
        outcomes: [
          { id: 'respect', label: 'Promise to keep business away from the church', effects: { npcRep: 10 }, result: '"Actions, not words," he says. But he steps aside.' },
          { id: 'dismiss', label: 'Tell him to mind his own business', effects: { npcRep: -10 }, result: 'His jaw tightens. "Everything in this neighborhood is my business."' },
          { id: 'donate', label: 'Hand him $1000 for the parish', effects: { npcRep: 5, cash: -1000 }, result: 'He looks at the money, then at you. Takes it. "God accepts all offerings. Even tainted ones."' }
        ]
      },
      {
        id: 'ch2_vandalism',
        title: 'Desecration',
        triggerCondition: { minDay: 25 },
        description: 'The church has been trashed. Pews overturned, stained glass shattered. Rival crew tags cover the walls. Ignacio stands in the wreckage, rosary in hand.',
        outcomes: [
          { id: 'help', label: 'Pay for repairs and find who did it ($8K)', effects: { npcRep: 20, cash: -8000, heat: 5 }, result: 'Your crew fixes the church and delivers a message to the vandals. Ignacio is conflicted but grateful.' },
          { id: 'partial', label: 'Help clean up but nothing more', effects: { npcRep: 5 }, result: 'You spend an afternoon scrubbing walls. Ignacio says nothing, but brings you water.' },
          { id: 'ignore', label: 'Not your problem', effects: { npcRep: -15 }, result: 'The community notices your absence. Whispers follow you through the streets.' }
        ]
      },
      {
        id: 'ch3_gambling',
        title: 'The Father\'s Sin',
        triggerCondition: { minDay: 45, minRep: 10 },
        description: 'Word reaches you: Father Ignacio owes $15,000 to a bookie. The shame is eating him alive. One of your informants saw him at the dog track at 3 AM.',
        outcomes: [
          { id: 'pay', label: 'Pay his debts quietly ($15K)', effects: { npcRep: 30, cash: -15000 }, result: 'You pay the bookie. Ignacio finds out. A bond of shared secrets forms between you.' },
          { id: 'leverage', label: 'Pay but make sure he knows he owes you', effects: { npcRep: 10, fear: 5, cash: -15000 }, result: '"Now we understand each other, Father." He nods slowly. The debt binds him.' },
          { id: 'expose', label: 'Let the congregation find out', effects: { npcRep: -30 }, result: 'The parish is devastated. Ignacio nearly loses his position. He blames you with quiet fury.' }
        ]
      },
      {
        id: 'ch4_mediator',
        title: 'Bridge Builder',
        triggerCondition: { minDay: 65, minRep: 20 },
        description: 'Community tensions are boiling. Ignacio offers to mediate between your operation and the neighborhood. His word carries weight.',
        outcomes: [
          { id: 'accept', label: 'Accept his mediation', effects: { npcRep: 15, reputation: 10 }, result: 'Ignacio speaks for you at community meetings. Complaints drop. People nod when you pass.' },
          { id: 'limited', label: 'Accept but keep him at arm\'s length', effects: { npcRep: 5, reputation: 5 }, result: 'He does what he can. The community warms slightly, but his influence is constrained.' },
          { id: 'refuse', label: 'You don\'t need a priest speaking for you', effects: { npcRep: -10 }, result: '"Pride is the deadliest sin." The community remains hostile.' }
        ]
      },
      {
        id: 'ch5_sanctuary',
        title: 'Sacred Ground',
        triggerCondition: { minDay: 90, minRep: 30 },
        description: 'Father Ignacio makes his final judgment. Has your influence been a net good or a curse on his community?',
        outcomes: [
          { id: 'sanctuary', label: 'Accept sanctuary blessing', effects: { npcRep: 10, permanentBenefit: 'church_sanctuary' }, result: '"You are flawed, but you protect the flock." The church becomes safe ground. Police will not raid here.' },
          { id: 'partnership', label: 'Formalize community partnership', effects: { npcRep: 15, permanentBenefit: 'community_partner' }, result: 'Ignacio publicly vouches for your community investments. Reputation soars.' },
          { id: 'betray', label: 'Use the church as a stash house', effects: { npcRep: -50, permanentBenefit: 'stash_church' }, result: 'Ignacio discovers the drugs behind the altar. He denounces you from the pulpit. The community turns.' }
        ]
      }
    ]
  },

  // ===== NPC 3: Mama Josephine =====
  {
    id: 'mama_josephine',
    name: 'Mama Josephine',
    emoji: '\u{1F372}',
    role: 'Haitian Matriarch',
    location: 'little_haiti',
    romanceOption: false,
    benefits: {
      intelNetwork: { snitchReduction: 0.5 },
      communityIntel: true,
      freeNeighborhoodInfo: true
    },
    chapters: [
      {
        id: 'ch1_kitchen',
        title: 'The Community Kitchen',
        triggerCondition: { minAct: 1, minDay: 8 },
        description: 'The smell of stewed chicken and rice draws you down an alley. An enormous woman ladles food to a line of people stretching around the block. This is Mama Josephine.',
        outcomes: [
          { id: 'eat', label: 'Join the line and eat', effects: { npcRep: 5 }, result: 'She gives you an extra scoop. "You look too skinny for trouble." Her laugh booms.' },
          { id: 'offer', label: 'Offer to help serve', effects: { npcRep: 10 }, result: 'You spend two hours ladling soup. People stare. Mama nods approvingly.' },
          { id: 'pass', label: 'Keep walking', effects: {}, result: 'She watches you go. Mama Josephine watches everyone.' }
        ]
      },
      {
        id: 'ch2_funding',
        title: 'Keeping the Lights On',
        triggerCondition: { minDay: 30, minRep: 5, minCash: 10000 },
        description: 'The kitchen is closing. Rent tripled. Mama Josephine needs $10,000 or 200 hungry people lose their only meal.',
        outcomes: [
          { id: 'fund', label: 'Give her $10K', effects: { npcRep: 25, cash: -10000, reputation: 5 }, result: '"God bless you, child." Tears in her eyes. The kitchen stays open. The community remembers.' },
          { id: 'half', label: 'Offer $5K, half of what she needs', effects: { npcRep: 10, cash: -5000 }, result: '"It buys us time." She stretches every dollar. The kitchen limps on.' },
          { id: 'refuse', label: 'You\'re not a charity', effects: { npcRep: -15 }, result: 'Mama\'s face hardens. "I remember who helps. I remember who doesn\'t."' }
        ]
      },
      {
        id: 'ch3_truth',
        title: 'Mama Knows',
        triggerCondition: { minDay: 50, minRep: 10 },
        description: 'Mama Josephine has learned exactly what you do. She sits across from you, arms crossed, expression unreadable.',
        outcomes: [
          { id: 'honest', label: 'Be honest about everything', effects: { npcRep: 15 }, result: '"I know what you are. But I also know what you do for people. God sorts it out."' },
          { id: 'justify', label: 'Explain that you help the community', effects: { npcRep: 5 }, result: '"Don\'t dress it up for me, child. I\'m too old for fairy tales." But she stays.' },
          { id: 'deny', label: 'Deny everything', effects: { npcRep: -20 }, result: '"You lie to Mama\'s face? In her own kitchen?" The temperature in the room drops ten degrees.' }
        ]
      },
      {
        id: 'ch4_intel_broker',
        title: 'Eyes and Ears',
        triggerCondition: { minDay: 70, minRep: 20 },
        description: 'Mama Josephine hears everything. Her kitchen feeds everyone from dock workers to cops. She offers to share what she hears, for a price: keep funding the kitchen.',
        outcomes: [
          { id: 'accept', label: 'Agree to fund the kitchen monthly ($2K/month)', effects: { npcRep: 20, permanentBenefit: 'community_intel_network' }, result: 'Mama becomes your most reliable source. She hears everything. The streets have no secrets from her.' },
          { id: 'occasional', label: 'Pay per tip ($500 each)', effects: { npcRep: 10 }, result: 'She gives you good intel, when she feels like it. The arrangement is loose but useful.' },
          { id: 'decline', label: 'You have your own sources', effects: { npcRep: -5 }, result: 'Mama shrugs. "Your loss, child."' }
        ]
      },
      {
        id: 'ch5_blessing',
        title: 'Mama\'s Judgment',
        triggerCondition: { minDay: 95, minRep: 25 },
        description: 'Mama Josephine performs a Vodou ceremony. She will either bless your enterprise or curse it. The community watches.',
        outcomes: [
          { id: 'blessing', label: 'Accept her blessing', effects: { npcRep: 15, permanentBenefit: 'mama_blessing' }, result: 'The candles flare. Mama speaks in Creole. Your snitch chance drops by half. The community protects its own.' },
          { id: 'respect', label: 'Attend but stay neutral', effects: { npcRep: 5, permanentBenefit: 'mama_neutral' }, result: 'Mama nods. Not a full blessing, but her protection. The community tolerates you.' },
          { id: 'mock', label: 'Dismiss the ceremony', effects: { npcRep: -40, permanentBenefit: 'mama_curse' }, result: 'Mama\'s eyes go cold. The curse lands like a weight. Snitch chance doubles. The community turns hostile.' }
        ]
      }
    ]
  },

  // ===== NPC 4: Officer Tommy Chen =====
  {
    id: 'officer_chen',
    name: 'Officer Tommy Chen',
    emoji: '\u{1F46E}',
    role: 'Ambitious Cop',
    location: 'downtown',
    romanceOption: false,
    benefits: {
      corruptContact: { warningOnRaids: true, evidenceDisappears: true },
      investigatorEnemy: { investigationSpeedBonus: 0.15 }
    },
    chapters: [
      {
        id: 'ch1_hassle',
        title: 'Beat Cop Blues',
        triggerCondition: { minAct: 1, minDay: 3 },
        description: 'A young cop with something to prove stops you on the street. Badge number 4471. Officer Chen. He searches you slowly, looking for any excuse.',
        outcomes: [
          { id: 'cooperate', label: 'Be polite, let him search', effects: { npcRep: 0 }, result: 'He finds nothing. "Stay clean," he says. You can tell he\'s disappointed.' },
          { id: 'challenge', label: 'Ask for his supervisor', effects: { npcRep: -5, heat: 2 }, result: 'His eyes narrow. "Remember my face." He writes down your name carefully.' },
          { id: 'slip_cash', label: 'Subtly offer $200', effects: { npcRep: 5, cash: -200 }, result: 'He freezes. Looks around. The money disappears. He walks away quickly, ears red.' }
        ]
      },
      {
        id: 'ch2_promotion',
        title: 'Detective Chen',
        triggerCondition: { minDay: 30, minHeat: 20 },
        description: 'Chen made detective. He\'s assigned to narcotics. Your file is on his desk. He\'s no longer a nuisance; he\'s a genuine threat.',
        outcomes: [
          { id: 'avoid', label: 'Lay low and avoid his territory', effects: { npcRep: 0, heat: -5 }, result: 'You keep your head down. Chen investigates, but trails go cold.' },
          { id: 'confront', label: 'Arrange a face-to-face meeting', effects: { npcRep: 5 }, result: '"I know who you are," he says over coffee. "And I know I can\'t prove it. Yet."' },
          { id: 'frame', label: 'Plant evidence pointing to a rival', effects: { npcRep: -10, heat: -15 }, result: 'Chen chases shadows for weeks. When he figures it out, his hatred becomes personal.' }
        ]
      },
      {
        id: 'ch3_bribe',
        title: 'Everyone Has a Price',
        triggerCondition: { minDay: 50, minRep: 0, minCash: 20000 },
        description: 'Chen\'s been passed over for promotion again. He\'s bitter. Overworked. Your intermediary says he might be open to an arrangement.',
        outcomes: [
          { id: 'bribe', label: 'Offer $20K monthly for protection', effects: { npcRep: 20, cash: -20000 }, result: 'Chen stares at the envelope for a long time. "Monthly?" He takes it. A good cop dies inside.' },
          { id: 'small', label: 'Offer occasional tips ($5K)', effects: { npcRep: 10, cash: -5000 }, result: '"I\'m not on your payroll," he insists. But he takes the cash. And looks the other way. Sometimes.' },
          { id: 'refuse', label: 'Keep him as an honest adversary', effects: { npcRep: -5 }, result: 'Chen remains dedicated. Dangerous. But at least you know where he stands.' }
        ]
      },
      {
        id: 'ch4_crisis',
        title: 'Breaking Point',
        triggerCondition: { minDay: 75, minRep: 5 },
        description: 'Chen\'s daughter is sick. Really sick. The treatments aren\'t covered. He comes to you, hat in hand, dignity in tatters.',
        outcomes: [
          { id: 'help', label: 'Pay for her treatment ($50K)', effects: { npcRep: 40, cash: -50000 }, result: 'Chen breaks down. "I\'ll never forget this." He won\'t. You own a detective now.' },
          { id: 'deal', label: 'Pay, but only if he works for you exclusively', effects: { npcRep: 20, cash: -50000, permanentBenefit: 'corrupt_detective' }, result: '"I\'ll do whatever you need." The last wall crumbles. Detective Chen is yours.' },
          { id: 'refuse', label: 'This isn\'t your problem', effects: { npcRep: -30 }, result: 'Chen\'s eyes go dead. "I will destroy you. That is a promise."' }
        ]
      },
      {
        id: 'ch5_fate',
        title: 'The Detective\'s Choice',
        triggerCondition: { minDay: 100, minRep: 15 },
        description: 'Internal Affairs is sniffing around Chen. He has to choose: go all in with you, or burn you to save himself.',
        outcomes: [
          { id: 'loyal', label: 'Protect him from IA ($30K in bribes)', effects: { npcRep: 20, cash: -30000, permanentBenefit: 'chen_loyal' }, result: 'Chen is untouchable. Your best contact on the force. Raid warnings, evidence loss, case dismissals.' },
          { id: 'let_fall', label: 'Let IA investigate', effects: { npcRep: -40, permanentBenefit: 'chen_enemy' }, result: 'Chen cuts a deal with IA. Gives them everything he has on you. Investigation speed increases 15% permanently.' },
          { id: 'eliminate', label: 'Chen knows too much...', effects: { npcRep: -50, heat: 30, permanentBenefit: 'chen_gone' }, result: 'A cop goes missing. The city erupts. Heat skyrockets. But the loose end is tied.' }
        ]
      }
    ]
  },

  // ===== NPC 5: Diamond Destiny Harris =====
  {
    id: 'diamond_destiny',
    name: 'Diamond Destiny Harris',
    emoji: '\u{1F48E}',
    role: 'Nightclub Owner',
    location: 'south_beach',
    romanceOption: true,
    benefits: {
      nightclubAccess: true,
      premiumLaundering: { rate: 0.85 },
      vipNetworking: true
    },
    chapters: [
      {
        id: 'ch1_vip',
        title: 'South Beach Royalty',
        triggerCondition: { minAct: 1, minDay: 15, minCash: 10000 },
        description: 'Club Paradox. The hottest spot on South Beach. The owner, Destiny Harris, spots you from the VIP lounge. Gold dress. Diamond earrings. Eyes that miss nothing.',
        outcomes: [
          { id: 'charm', label: 'Buy a $5K bottle and send it over', effects: { npcRep: 15, cash: -5000 }, result: 'She raises the glass to you from across the room. An invitation appears: private booth, upstairs.' },
          { id: 'business', label: 'Approach directly with a business proposal', effects: { npcRep: 10 }, result: '"I don\'t do business on the dance floor," she says. "But I like confidence. Call my office."' },
          { id: 'ignore', label: 'Play it cool, let her come to you', effects: { npcRep: 5 }, result: 'She watches you all night. The next day, her card appears under your windshield wiper.' }
        ]
      },
      {
        id: 'ch2_investor',
        title: 'Silent Partner',
        triggerCondition: { minDay: 35, minRep: 10, minCash: 50000 },
        description: 'Destiny needs $50K to expand Club Paradox. A second floor. A rooftop bar. She\'s looking for a silent investor who understands discretion.',
        outcomes: [
          { id: 'invest', label: 'Invest $50K as silent partner', effects: { npcRep: 25, cash: -50000 }, result: 'Papers signed in the back of a limo. You now own 40% of the hottest club in Miami.' },
          { id: 'counter', label: 'Offer $25K for 20%', effects: { npcRep: 10, cash: -25000 }, result: '"A negotiator. I like that." She accepts. The partnership begins, smaller but real.' },
          { id: 'decline', label: 'Too much exposure', effects: { npcRep: -5 }, result: '"Your loss, baby." She finds another investor. The door isn\'t closed, but it\'s narrower now.' }
        ]
      },
      {
        id: 'ch3_distribution',
        title: 'After Hours',
        triggerCondition: { minDay: 55, minRep: 20 },
        description: 'Club Paradox is perfect. VIP rooms with no cameras. A client list of Miami\'s elite. Destiny proposes using the club for distribution and laundering.',
        outcomes: [
          { id: 'full', label: 'Full operation: distribution and laundering', effects: { npcRep: 15, permanentBenefit: 'club_full_ops' }, result: 'The club becomes your crown jewel. Premium clients, clean money, untraceable product movement.' },
          { id: 'launder_only', label: 'Laundering only, no product on premises', effects: { npcRep: 10, permanentBenefit: 'club_laundering' }, result: 'Smart. The books are cooked beautifully. 85 cents on every dirty dollar comes back clean.' },
          { id: 'separate', label: 'Keep the club legitimate', effects: { npcRep: 0 }, result: 'Destiny shrugs. "Clean money is still money." The club stays legit but profitable.' }
        ]
      },
      {
        id: 'ch4_eastern_bloc',
        title: 'Dangerous Company',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Destiny has gotten in over her head with Eastern Bloc gangsters. They want the club. She comes to you, mascara running, desperate.',
        outcomes: [
          { id: 'fight', label: 'Go to war with the Eastern Bloc ($20K, crew needed)', effects: { npcRep: 30, cash: -20000, heat: 25, minCrew: 4 }, result: 'A violent week. Two of their guys hospitalized. They back off. Destiny clings to you afterward.' },
          { id: 'negotiate', label: 'Negotiate a deal: they get 10% of the club', effects: { npcRep: 10 }, result: 'An uneasy peace. The Eastern Bloc takes their cut. Destiny resents the compromise.' },
          { id: 'sell_out', label: 'Let them have her', effects: { npcRep: -40 }, result: 'Destiny loses the club. She disappears for weeks. When she surfaces, the warmth is gone.' }
        ]
      },
      {
        id: 'ch5_destiny',
        title: 'Diamond or Glass',
        triggerCondition: { minDay: 100, minRep: 25 },
        description: 'Your relationship with Destiny reaches its final form. Business, romance, or betrayal. She stands on the rooftop of Club Paradox, city lights reflected in her eyes.',
        outcomes: [
          { id: 'romance', label: 'Choose romance and partnership', effects: { npcRep: 30, permanentBenefit: 'destiny_romance' }, result: 'She kisses you as Miami glitters below. Business partner. Lover. The most dangerous combination.' },
          { id: 'business', label: 'Keep it strictly business', effects: { npcRep: 15, permanentBenefit: 'destiny_business' }, result: '"Smart," she says, hiding her disappointment. The partnership thrives on professionalism.' },
          { id: 'betray', label: 'Take the club and cut her out', effects: { npcRep: -50, permanentBenefit: 'club_takeover' }, result: 'Destiny stares at the forged papers. "You\'re going to regret this." She means it.' }
        ]
      }
    ]
  },

  // ===== NPC 6: Alejandro Vega =====
  {
    id: 'alex_vega',
    name: 'Alejandro "Alex" Vega',
    emoji: '\u{1F4F0}',
    role: 'Corrupt Journalist',
    location: 'downtown',
    romanceOption: false,
    benefits: {
      mediaManipulation: { costPerFavor: 2000 },
      storyPlanting: true,
      infoSuppression: true,
      publicImageControl: true
    },
    chapters: [
      {
        id: 'ch1_expose',
        title: 'Front Page Threat',
        triggerCondition: { minAct: 1, minDay: 20, minHeat: 15 },
        description: 'The Miami Herald runs a story that gets uncomfortably close to your operation. The byline: Alejandro Vega. Ambitious. Talented. Dangerous.',
        outcomes: [
          { id: 'approach', label: 'Arrange a meeting through intermediaries', effects: { npcRep: 5 }, result: 'Vega shows up to the meeting with a recorder. At least he\'s upfront about it.' },
          { id: 'threaten', label: 'Send a message through his editor', effects: { npcRep: -10, fear: 5 }, result: 'The next article is even more aggressive. Vega doesn\'t scare easily.' },
          { id: 'watch', label: 'Monitor him from a distance', effects: { npcRep: 0 }, result: 'You learn his habits. His weaknesses. His expensive tastes on a journalist\'s salary.' }
        ]
      },
      {
        id: 'ch2_for_sale',
        title: 'The Price of Truth',
        triggerCondition: { minDay: 40, minRep: 0, minCash: 10000 },
        description: 'Turns out Vega has debts. Expensive girlfriend. Condo he can\'t afford. Everyone has a price, and his is surprisingly reasonable.',
        outcomes: [
          { id: 'buy', label: 'Put him on retainer ($5K/month)', effects: { npcRep: 20, cash: -5000 }, result: '"I prefer to think of it as consulting," he says, pocketing the envelope. The stories stop.' },
          { id: 'one_time', label: 'Pay to kill the current story ($10K)', effects: { npcRep: 10, cash: -10000 }, result: 'The story disappears. But Vega knows he can come back for more.' },
          { id: 'refuse', label: 'Let the press do its thing', effects: { npcRep: -5, heat: 10 }, result: 'The series continues. Your heat rises. But your integrity with the streets stays intact.' }
        ]
      },
      {
        id: 'ch3_media_weapon',
        title: 'Pen and Sword',
        triggerCondition: { minDay: 55, minRep: 15 },
        description: 'Vega is fully on your payroll now. He can plant stories, suppress investigations, even run hit pieces on your rivals. $2K per favor.',
        outcomes: [
          { id: 'weapon', label: 'Use him aggressively against rivals', effects: { npcRep: 10, permanentBenefit: 'media_weapon' }, result: 'Rival operations get front-page treatment. Police crack down on them, not you. The pen is mighty.' },
          { id: 'shield', label: 'Use him defensively only', effects: { npcRep: 10, permanentBenefit: 'media_shield' }, result: 'Your name never appears in print. Stories about your territory vanish before publication.' },
          { id: 'release', label: 'Cut him loose, this is too risky', effects: { npcRep: -15 }, result: 'Vega is offended. And he knows a lot about you now. An uncomfortable situation.' }
        ]
      },
      {
        id: 'ch4_exposure',
        title: 'A Real Journalist',
        triggerCondition: { minDay: 75, minRep: 10 },
        description: 'An investigative reporter from the Washington Post is in town. She\'s onto Vega\'s corruption. If she publishes, you lose your media asset and gain exposure.',
        outcomes: [
          { id: 'protect', label: 'Discredit the reporter ($15K smear campaign)', effects: { npcRep: 20, cash: -15000, heat: 5 }, result: 'The reporter\'s credibility crumbles under fabricated scandals. Vega survives. The press is leery.' },
          { id: 'sacrifice', label: 'Let Vega take the fall', effects: { npcRep: -30 }, result: 'Vega is fired in disgrace. He knows your secrets. A dangerous loose end.' },
          { id: 'relocate', label: 'Move Vega to a different outlet ($10K)', effects: { npcRep: 10, cash: -10000 }, result: 'Vega resurfaces at a local TV station. Different platform, same corruption.' }
        ]
      },
      {
        id: 'ch5_legacy',
        title: 'The Story of Your Life',
        triggerCondition: { minDay: 100, minRep: 15 },
        description: 'Vega wants to write a book. Your biography. It could cement your legend or bury you forever.',
        outcomes: [
          { id: 'hero', label: 'Let him write you as a folk hero', effects: { npcRep: 10, permanentBenefit: 'public_hero' }, result: 'The book paints you as Robin Hood with a gun. Public sympathy soars. Jury pools get friendlier.' },
          { id: 'suppress', label: 'Pay him $50K to never write it', effects: { npcRep: 5, cash: -50000 }, result: 'The manuscript goes in a safe. Vega retires comfortably. Your secrets stay buried.' },
          { id: 'testify', label: 'He\'s been recording everything...', effects: { npcRep: -50, permanentBenefit: 'vega_testifies' }, result: 'Vega goes to the FBI. Tapes, notes, recordings. The biggest betrayal you never saw coming.' }
        ]
      }
    ]
  },

  // ===== NPC 7: Gears Rodriguez =====
  {
    id: 'gears_rodriguez',
    name: '"Gears" Rodriguez',
    emoji: '\u{1F527}',
    role: 'Master Mechanic',
    location: 'little_havana',
    romanceOption: false,
    benefits: {
      vehicleMaintenance: { costMultiplier: 0.5 },
      customMods: true,
      hiddenCompartments: true,
      chopShop: true
    },
    chapters: [
      {
        id: 'ch1_breakdown',
        title: 'The Best in Miami',
        triggerCondition: { minAct: 1, minDay: 12 },
        description: 'After a close pursuit, your car limps into a garage on Calle Ocho. A man covered in grease takes one look and says, "I can fix it. But it\'ll cost you."',
        outcomes: [
          { id: 'pay', label: 'Pay his price ($3K)', effects: { npcRep: 10, cash: -3000 }, result: 'The car runs better than new. Gears is an artist with an engine.' },
          { id: 'negotiate', label: 'Haggle him down', effects: { npcRep: 0, cash: -1500 }, result: 'He takes the job but makes you wait. "Discount customers get discount speed."' },
          { id: 'threaten', label: 'You\'ll pay what you feel like', effects: { npcRep: -10, fear: 3 }, result: 'He fixes it. Slowly. Badly. You get what you pay for with Gears.' }
        ]
      },
      {
        id: 'ch2_debts',
        title: 'Bad Bets',
        triggerCondition: { minDay: 35, minRep: 5, minCash: 8000 },
        description: 'Gears owes $8K to some very unfriendly bookies. They\'re threatening to break the hands that make him the best mechanic in Miami.',
        outcomes: [
          { id: 'pay_debts', label: 'Clear his debts ($8K)', effects: { npcRep: 25, cash: -8000 }, result: '"You saved my hands, man. I owe you everything." Gears is loyal for life now.' },
          { id: 'handle', label: 'Have your crew persuade the bookies', effects: { npcRep: 20, heat: 5 }, result: 'The bookies write off the debt after a visit from your boys. Gears is deeply grateful.' },
          { id: 'ignore', label: 'Not your concern', effects: { npcRep: -10 }, result: 'They break two fingers. Gears is out of commission for a month. He doesn\'t forget.' }
        ]
      },
      {
        id: 'ch3_compartments',
        title: 'Hidden Spaces',
        triggerCondition: { minDay: 55, minRep: 15 },
        description: 'Gears unveils his masterpiece: a custom vehicle with hidden compartments undetectable by police scanners. Smuggling capacity doubled.',
        outcomes: [
          { id: 'commission', label: 'Commission a fleet ($25K)', effects: { npcRep: 20, cash: -25000, permanentBenefit: 'hidden_fleet' }, result: 'Five vehicles, each with Gears\' signature compartments. Your transport capacity doubles overnight.' },
          { id: 'single', label: 'Just one vehicle ($8K)', effects: { npcRep: 10, cash: -8000, permanentBenefit: 'hidden_car' }, result: 'One car, perfectly modified. It\'s your personal smuggling machine.' },
          { id: 'pass', label: 'Too conspicuous right now', effects: { npcRep: -5 }, result: 'Gears is disappointed but shelves the project. The offer stands.' }
        ]
      },
      {
        id: 'ch4_poaching',
        title: 'Talent War',
        triggerCondition: { minDay: 75, minRep: 10 },
        description: 'A rival outfit offers Gears triple his rate. Custom cars, no questions, set for life. He comes to you first out of loyalty.',
        outcomes: [
          { id: 'match', label: 'Match the offer plus a $10K bonus', effects: { npcRep: 25, cash: -10000 }, result: '"I was hoping you\'d say that." Gears stays. The rivals get a lesser mechanic.' },
          { id: 'appeal', label: 'Appeal to loyalty', effects: { npcRep: 10 }, result: '"Loyalty don\'t pay rent... but you\'ve been good to me." He stays, but he\'s not thrilled.' },
          { id: 'release', label: 'Let him go', effects: { npcRep: -20 }, result: 'Gears takes the rival\'s offer. You just armed your competition with the best mechanic in Miami.' }
        ]
      },
      {
        id: 'ch5_empire',
        title: 'Motor City',
        triggerCondition: { minDay: 100, minRep: 25 },
        description: 'Gears has a vision: an auto empire. Legitimate front, illegitimate back. Chop shop, custom builds, fleet management. He needs your backing.',
        outcomes: [
          { id: 'empire', label: 'Fund the auto empire ($40K)', effects: { npcRep: 20, cash: -40000, permanentBenefit: 'auto_empire' }, result: 'Rodriguez Auto opens its doors. Chop shop in back, showroom up front. Vehicle costs halved permanently.' },
          { id: 'fleet', label: 'Fund just the fleet division ($20K)', effects: { npcRep: 15, cash: -20000, permanentBenefit: 'ultimate_fleet' }, result: 'Gears builds the ultimate fleet. Every vehicle custom, every compartment invisible.' },
          { id: 'decline', label: 'Too much investment right now', effects: { npcRep: -10 }, result: 'Gears opens a modest shop on his own. He does good work, but the empire dream dies.' }
        ]
      }
    ]
  },

  // ===== NPC 8: Judge Patricia Hawkins =====
  {
    id: 'judge_hawkins',
    name: 'Judge Patricia Hawkins',
    emoji: '\u2696\uFE0F',
    role: 'Corrupt Federal Judge',
    location: 'downtown',
    romanceOption: false,
    benefits: {
      caseDismissal: true,
      reducedSentences: { multiplier: 0.5 },
      warrantDelay: { days: 7 },
      ricoInterference: true
    },
    chapters: [
      {
        id: 'ch1_sentencing',
        title: 'The Honorable Judge',
        triggerCondition: { minAct: 1, minDay: 20, minHeat: 25 },
        description: 'Judge Hawkins sentences two of your crew to maximum terms. She\'s harsh, precise, and seemingly incorruptible. A real problem.',
        outcomes: [
          { id: 'research', label: 'Dig into her background', effects: { npcRep: 0 }, result: 'Your people find a thread: she visits the same pharmacy three times a week. Prescription pills.' },
          { id: 'appeal', label: 'Hire top lawyers to appeal ($15K)', effects: { npcRep: 0, cash: -15000 }, result: 'The appeal drags on. Your crew serves six months before getting out. Hawkins is annoyed.' },
          { id: 'accept', label: 'Take the hit and move on', effects: { npcRep: 0 }, result: 'Your crew does time. The machine grinds on.' }
        ]
      },
      {
        id: 'ch2_weakness',
        title: 'The Pharmacy Visits',
        triggerCondition: { minDay: 40, minRep: 0 },
        description: 'Confirmed: Judge Hawkins has a prescription drug problem. Oxy, mostly. She\'s functional but dependent. This is leverage.',
        outcomes: [
          { id: 'supply', label: 'Arrange a discreet supply through a doctor', effects: { npcRep: 15 }, result: 'She starts receiving deliveries. No pharmacy records. She doesn\'t know who\'s behind it yet.' },
          { id: 'confront', label: 'Approach her directly with evidence', effects: { npcRep: 5, fear: 10 }, result: 'Her face goes white. "What do you want?" The balance of power shifts.' },
          { id: 'hold', label: 'Keep the information in reserve', effects: { npcRep: 0 }, result: 'You file it away. Insurance for a rainy day.' }
        ]
      },
      {
        id: 'ch3_intermediary',
        title: 'Judicial Arrangement',
        triggerCondition: { minDay: 55, minRep: 10 },
        description: 'Through a chain of intermediaries, you reach an arrangement with Judge Hawkins. Cases that cross her bench get special treatment.',
        outcomes: [
          { id: 'full', label: 'Full arrangement: dismissals, reduced sentences ($30K)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'judge_full' }, result: 'Hawkins becomes your legal shield. Cases evaporate. Sentences shrink. Warrants get delayed.' },
          { id: 'limited', label: 'Case-by-case favors ($10K per case)', effects: { npcRep: 15, cash: -10000 }, result: 'She helps when asked, but on her terms and her schedule. Still enormously valuable.' },
          { id: 'blackmail', label: 'Use the drug evidence as leverage instead', effects: { npcRep: -10, fear: 20 }, result: 'Hawkins complies but seethes. A judge who hates you is a time bomb.' }
        ]
      },
      {
        id: 'ch4_cases',
        title: 'The Gavel Falls',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Hawkins starts dismissing cases. Evidence "lost." Procedural errors. Witnesses recanting. Your legal problems are disappearing.',
        outcomes: [
          { id: 'push', label: 'Ask her to interfere with a RICO case', effects: { npcRep: 10, permanentBenefit: 'rico_shield' }, result: 'The RICO case collapses on a technicality. The FBI is furious but can\'t prove anything.' },
          { id: 'moderate', label: 'Keep requests reasonable', effects: { npcRep: 10 }, result: 'A steady drip of favorable rulings. Nothing flashy enough to attract attention.' },
          { id: 'distance', label: 'Back off before someone notices', effects: { npcRep: -5 }, result: 'Smart. The pattern was getting obvious. You cool the arrangement for a while.' }
        ]
      },
      {
        id: 'ch5_investigation',
        title: 'The Bureau Comes',
        triggerCondition: { minDay: 100, minRep: 20 },
        description: 'FBI Internal Affairs is investigating Hawkins. If she falls, she takes you with her. Your greatest legal asset is about to become your greatest liability.',
        outcomes: [
          { id: 'protect', label: 'Spend $100K to create a defense', effects: { npcRep: 20, cash: -100000, permanentBenefit: 'judge_protected' }, result: 'Witnesses vanish. Evidence corrupts. Hawkins survives the investigation. She is forever in your debt.' },
          { id: 'flee', label: 'Help her disappear ($50K)', effects: { npcRep: 10, cash: -50000 }, result: 'Judge Hawkins retires to Costa Rica. You lose the asset, but no trail leads back to you.' },
          { id: 'burn', label: 'Let her fall and deny everything', effects: { npcRep: -40, heat: 20 }, result: 'Hawkins goes to prison. She does not go quietly. Your name comes up repeatedly in her testimony.' }
        ]
      }
    ]
  },

  // ===== NPC 9: Ghost Mikhail Petrov =====
  {
    id: 'ghost_petrov',
    name: '"Ghost" Mikhail Petrov',
    emoji: '\u{1F52B}',
    role: 'International Arms Dealer',
    location: 'port_miami',
    romanceOption: false,
    benefits: {
      militaryWeapons: { discount: 0.30 },
      exoticAccess: true,
      armorExplosives: true,
      ciaRisk: true
    },
    chapters: [
      {
        id: 'ch1_rumors',
        title: 'The Ghost',
        triggerCondition: { minAct: 2, minDay: 40 },
        description: 'Whispers on the street about a weapons supplier no one has ever seen. Military grade. Eastern Bloc surplus. They call him Ghost.',
        outcomes: [
          { id: 'investigate', label: 'Send out feelers through your network', effects: { npcRep: 5 }, result: 'It takes weeks, but a contact in the port gives you a dead drop location. The Ghost is real.' },
          { id: 'ignore', label: 'You have enough firepower', effects: {}, result: 'You file it away. Some doors are better left closed. For now.' },
          { id: 'ask_around', label: 'Ask the Eastern Bloc connections', effects: { npcRep: 5, heat: 5 }, result: 'Asking too many questions draws attention. But a name surfaces: Petrov.' }
        ]
      },
      {
        id: 'ch2_contact',
        title: 'First Contact',
        triggerCondition: { minDay: 55, minRep: 5 },
        description: 'A phone rings at 3 AM. Accented English. "I hear you are looking for me. Most people who look for Ghost do not find him. You have one chance to impress me."',
        outcomes: [
          { id: 'meet', label: 'Agree to meet on his terms', effects: { npcRep: 10 }, result: 'A warehouse. Armed guards. Petrov is smaller than you expected. Eyes like a wolf.' },
          { id: 'terms', label: 'Set your own conditions', effects: { npcRep: 15 }, result: '"Brave. Or stupid." A pause. "I like brave." He agrees to neutral ground.' },
          { id: 'suspicious', label: 'This could be a setup, decline', effects: { npcRep: -5 }, result: 'The line goes dead. It takes months before Ghost reaches out again.' }
        ]
      },
      {
        id: 'ch3_test',
        title: 'The Test Run',
        triggerCondition: { minDay: 70, minRep: 10 },
        description: 'Ghost needs a delivery made. A crate from the port to a warehouse in the Everglades. No questions. No inspection. If you do this, he will open his catalog.',
        outcomes: [
          { id: 'deliver', label: 'Make the delivery personally', effects: { npcRep: 25, heat: 10 }, result: 'The crate is heavy. You don\'t look inside. At the warehouse, men with accents nod approvingly.' },
          { id: 'crew', label: 'Send trusted crew', effects: { npcRep: 15, heat: 5 }, result: 'Your crew handles it clean. Ghost notes your delegation. "A leader, not a soldier."' },
          { id: 'refuse', label: 'Too much unknown risk', effects: { npcRep: -15 }, result: '"Then we have nothing to discuss." The line goes dead. Permanently.' }
        ]
      },
      {
        id: 'ch4_hardware',
        title: 'The Arsenal',
        triggerCondition: { minDay: 85, minRep: 20 },
        description: 'Ghost opens his catalog. Military-grade hardware. AKs, body armor, grenades, RPGs. Prices are high but 30% below any other source.',
        outcomes: [
          { id: 'full_order', label: 'Major purchase: full crew armament ($50K)', effects: { npcRep: 20, cash: -50000, permanentBenefit: 'military_arsenal' }, result: 'Your crew is now the best-armed outfit in Miami. Body armor, assault rifles, the works.' },
          { id: 'selective', label: 'Selective purchase: armor and sidearms ($20K)', effects: { npcRep: 10, cash: -20000, permanentBenefit: 'upgraded_arms' }, result: 'Quality upgrades. Your crew is better protected and better armed than the competition.' },
          { id: 'small', label: 'Just a sample order ($5K)', effects: { npcRep: 5, cash: -5000 }, result: 'A few pieces. Ghost is unimpressed but patient. The door stays open.' }
        ]
      },
      {
        id: 'ch5_truth',
        title: 'Ghost Protocol',
        triggerCondition: { minDay: 100, minRep: 25 },
        description: 'Intel comes in that Ghost might be a CIA asset. The weapons pipeline could be a monitoring operation. Every purchase tracked, every contact logged.',
        outcomes: [
          { id: 'continue', label: 'The weapons are worth the risk', effects: { npcRep: 10, permanentBenefit: 'ghost_pipeline' }, result: 'CIA or not, the hardware is real. You accept the risk for the firepower. A dangerous dance.' },
          { id: 'confront', label: 'Confront Ghost directly', effects: { npcRep: 5 }, result: 'He laughs. "CIA. KGB. GRU. Everyone thinks I am theirs. I am only mine." Unclear if it is the truth.' },
          { id: 'cut', label: 'Sever all ties immediately', effects: { npcRep: -30, permanentBenefit: 'ghost_cut' }, result: 'You burn the connection. If he was CIA, you\'re safer. If he wasn\'t, you just lost the best weapons source in the Southeast.' }
        ]
      }
    ]
  },

  // ===== NPC 10: Maria Santos =====
  {
    id: 'maria_santos',
    name: 'Maria Santos',
    emoji: '\u{1F4DA}',
    role: 'Elementary School Teacher',
    location: 'little_havana',
    romanceOption: true,
    benefits: {
      communityAnchor: true,
      loyaltyBoost: { supportMultiplier: 1.5 },
      stressRelief: { passive: true },
      hostilityRisk: true
    },
    chapters: [
      {
        id: 'ch1_school',
        title: 'Room 4B',
        triggerCondition: { minAct: 1, minDay: 7 },
        description: 'You pass an elementary school. Through the window, a young teacher reads to a circle of kids. She sees you. Holds your gaze. No fear, just recognition.',
        outcomes: [
          { id: 'wave', label: 'Wave and move on', effects: { npcRep: 5 }, result: 'She doesn\'t wave back. But the next day, she does.' },
          { id: 'supplies', label: 'Notice the run-down classroom, send supplies', effects: { npcRep: 15, cash: -500 }, result: 'New books appear in Room 4B the next week. Maria Santos asks the office who sent them.' },
          { id: 'avoid', label: 'Don\'t make eye contact', effects: { npcRep: 0 }, result: 'You walk faster. Something about her gaze feels like accountability.' }
        ]
      },
      {
        id: 'ch2_funding',
        title: 'School Supplies',
        triggerCondition: { minDay: 25, minRep: 5 },
        description: 'Maria approaches you after school. "I know who you are. And I know you gave us those books. The kids need more. $2,000 would change everything."',
        outcomes: [
          { id: 'fund', label: 'Give her $2K for school supplies', effects: { npcRep: 20, cash: -2000 }, result: '"You\'re not what I expected," she says. The classroom transforms. Kids draw pictures of you as a hero.' },
          { id: 'more', label: 'Give her $5K and fund a field trip', effects: { npcRep: 30, cash: -5000, reputation: 5 }, result: 'Maria is stunned. The kids go to the science museum. The community talks about your generosity.' },
          { id: 'refuse', label: 'You\'re not a charity', effects: { npcRep: -10 }, result: '"I see." She walks back to her classroom. The door closes firmly.' }
        ]
      },
      {
        id: 'ch3_student',
        title: 'Lost Boy',
        triggerCondition: { minDay: 50, minRep: 15 },
        description: 'One of Maria\'s students, 11-year-old Diego, has been recruited by a rival gang as a lookout. Maria is frantic. She comes to you because you are the only one with the power to intervene.',
        outcomes: [
          { id: 'rescue', label: 'Get Diego out and set up his family ($5K)', effects: { npcRep: 30, cash: -5000, heat: 5 }, result: 'Diego is home. His mother weeps. Maria looks at you like she is seeing you for the first time.' },
          { id: 'warn', label: 'Send a message to the rival gang', effects: { npcRep: 20, heat: 10 }, result: 'The gang releases Diego after your crew pays a visit. The kid is safe. For now.' },
          { id: 'refuse', label: 'You can\'t save everyone', effects: { npcRep: -25 }, result: 'Maria\'s face crumbles. Diego ends up in juvenile detention six months later. She holds you responsible.' }
        ]
      },
      {
        id: 'ch4_discovery',
        title: 'The Truth Hurts',
        triggerCondition: { minDay: 75, minRep: 10 },
        description: 'Maria has learned the full scope of what you do. Not just the rumors, the reality. She sits across from you, pale and trembling.',
        outcomes: [
          { id: 'honest', label: 'Be completely honest', effects: { npcRep: 15 }, result: '"You poison children\'s parents. And then you buy their books." Tears. But she doesn\'t leave.' },
          { id: 'justify', label: 'Explain the good you do for the community', effects: { npcRep: 5 }, result: '"The good doesn\'t erase the bad." A pause. "But maybe it means something."' },
          { id: 'threaten', label: 'Warn her to keep quiet', effects: { npcRep: -30, fear: 10 }, result: 'The woman who had no fear now has plenty. But fear becomes hatred. She starts making calls.' }
        ]
      },
      {
        id: 'ch5_choice',
        title: 'The Teacher\'s Verdict',
        triggerCondition: { minDay: 100, minRep: 20 },
        description: 'Maria Santos stands at a crossroads. She can be your conscience, your companion, or your downfall.',
        outcomes: [
          { id: 'romance', label: 'Pursue a relationship', effects: { npcRep: 25, permanentBenefit: 'maria_romance' }, result: 'She takes your hand. "I can\'t change what you are. But maybe I can change where you\'re going." Stress drops permanently.' },
          { id: 'conscience', label: 'Keep her as community conscience', effects: { npcRep: 20, permanentBenefit: 'maria_conscience' }, result: 'Maria becomes the voice of your community. Her support means loyalty. Her approval means peace.' },
          { id: 'witness', label: 'She goes to the police', effects: { npcRep: -50, permanentBenefit: 'maria_witness' }, result: 'Maria files a detailed statement. Names, dates, locations. She is the most dangerous witness you have ever created.' }
        ]
      }
    ]
  },

  // ===== NPC 11: Slim Charles =====
  {
    id: 'slim_charles',
    name: '"Slim" Charles',
    emoji: '\u{1F3B1}',
    role: 'Pool Hall Owner / Gambling Kingpin',
    location: 'overtown',
    romanceOption: false,
    benefits: { gamblingConnections: true, fightClubTerritory: true, weeklyGamblingIncome: 2000 },
    chapters: [
      {
        id: 'ch1_pool_hall', title: 'The Shark',
        triggerCondition: { minAct: 1, minDay: 15 },
        description: 'A pool hall in Overtown. Slim Charles runs the table and the book. Every bet passes through him.',
        outcomes: [
          { id: 'play', label: 'Challenge him ($1K wager)', effects: { npcRep: 10, cash: -1000 }, result: 'You lose gracefully. Slim grins. "I like your style."' },
          { id: 'business', label: 'Propose a gambling partnership', effects: { npcRep: 5 }, result: '"You got territory, I got games. Could work."' },
          { id: 'pass', label: 'Observe from the bar', effects: { npcRep: 0 }, result: 'You watch the money flow. Slim raises his glass.' }
        ]
      },
      {
        id: 'ch2_fight_club', title: 'Underground Circuit',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Slim wants underground fight clubs. He has fighters and audience. He needs your territory and security.',
        outcomes: [
          { id: 'partner', label: 'Provide territory and security ($10K)', effects: { npcRep: 20, cash: -10000, permanentBenefit: 'fight_clubs' }, result: 'Friday nights become fight nights. The money is excellent.' },
          { id: 'cut', label: 'Demand 60% of profits', effects: { npcRep: 5 }, result: 'He counters at 50/50. Slim remembers your greed.' },
          { id: 'refuse', label: 'Too much heat', effects: { npcRep: -10 }, result: 'Slim takes his fights elsewhere.' }
        ]
      },
      {
        id: 'ch3_kingpin', title: 'All Bets Are On',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'Slim proposes merging all gambling operations under your umbrella. Numbers, sports, fights, cards.',
        outcomes: [
          { id: 'merge', label: 'Full merger ($25K)', effects: { npcRep: 25, cash: -25000, permanentBenefit: 'gambling_empire' }, result: 'Slim runs gambling, you provide muscle. $2K/week clean income.' },
          { id: 'partial', label: 'Fight clubs and numbers only', effects: { npcRep: 10, permanentBenefit: 'gambling_partial' }, result: 'Smaller operation, less exposure. Steady growth.' },
          { id: 'buyout', label: 'Buy him out ($40K)', effects: { npcRep: -15, cash: -40000, permanentBenefit: 'gambling_solo' }, result: 'Slim takes the money. The partnership sours.' }
        ]
      }
    ]
  },

  // ===== NPC 12: Isabella Cruz =====
  {
    id: 'isabella_cruz',
    name: 'Isabella Cruz',
    emoji: '\u{1F469}\u200D\u2696\uFE0F',
    role: 'Immigration Lawyer',
    location: 'little_havana',
    romanceOption: false,
    benefits: { documentForgery: true, humanSmugglingNetwork: true, legalCover: true },
    chapters: [
      {
        id: 'ch1_office', title: 'The Fixer',
        triggerCondition: { minAct: 1, minDay: 18 },
        description: 'A small law office. Isabella handles immigration by day and produces flawless forged documents by night.',
        outcomes: [
          { id: 'hire', label: 'Commission fake IDs ($3K)', effects: { npcRep: 10, cash: -3000 }, result: 'Perfect work. Licenses, passports, socials.' },
          { id: 'consult', label: 'Legal consultation only', effects: { npcRep: 5, cash: -500 }, result: 'Solid advice on minimizing legal exposure.' },
          { id: 'pressure', label: 'Threaten to expose her', effects: { npcRep: -15, fear: 5 }, result: '"You expose me, you expose your crew." She does not blink.' }
        ]
      },
      {
        id: 'ch2_smuggling', title: 'The Pipeline',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Isabella has Caribbean smuggling routes. Refugees mixed with cargo. Morally gray. Highly profitable.',
        outcomes: [
          { id: 'full', label: 'Use routes for product ($15K)', effects: { npcRep: 15, cash: -15000, permanentBenefit: 'smuggling_routes' }, result: 'Product arrives with refugees. Coast Guard checks people, not cargo.' },
          { id: 'docs_only', label: 'Stick to documents', effects: { npcRep: 10 }, result: 'Isabella respects the boundary.' },
          { id: 'refuse', label: 'This crosses a line', effects: { npcRep: -10 }, result: '"Everyone draws the line somewhere."' }
        ]
      },
      {
        id: 'ch3_ice', title: 'Under Investigation',
        triggerCondition: { minDay: 70, minRep: 10 },
        description: 'ICE is investigating Isabella. If she falls, every fake document becomes evidence.',
        outcomes: [
          { id: 'protect', label: 'Fund defense, destroy records ($30K)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'isabella_protected' }, result: 'Records burned. Isabella beats the case.' },
          { id: 'distance', label: 'Cut ties, destroy copies', effects: { npcRep: -20, heat: 5 }, result: 'You eliminate your trail. She faces charges alone.' },
          { id: 'leverage', label: 'Demand free services', effects: { npcRep: -10, fear: 10, permanentBenefit: 'isabella_forced' }, result: 'She works free. Frightened people make mistakes.' }
        ]
      }
    ]
  },

  // ===== NPC 13: The Professor =====
  {
    id: 'the_professor',
    name: '"The Professor"',
    emoji: '\u{1F9EA}',
    role: 'Retired Chemistry Professor',
    location: 'coral_gables',
    romanceOption: false,
    benefits: { premiumRecipe: { valueMultiplier: 3.0 }, qualityBoost: true, labEfficiency: true },
    chapters: [
      {
        id: 'ch1_legend', title: 'The Legend',
        triggerCondition: { minAct: 1, minDay: 25 },
        description: 'Every cook in Miami whispers about the Professor. Retired from UM. Product was legendary: pure, potent, worth three times market.',
        outcomes: [
          { id: 'search', label: 'Dedicate resources to finding him ($5K)', effects: { npcRep: 5, cash: -5000 }, result: 'A modest house in Coral Gables. An old man tending roses.' },
          { id: 'network', label: 'Ask around the university', effects: { npcRep: 0, heat: 3 }, result: 'Inquiries lead to a PO box. A letter returns: "What do you want?"' },
          { id: 'wait', label: 'Let the legend come to you', effects: {}, result: 'Some legends stay legends.' }
        ]
      },
      {
        id: 'ch2_apprentice', title: 'The Lecture',
        triggerCondition: { minDay: 45, minRep: 5 },
        description: 'The Professor is bored in retirement. He will teach your cook his methods for the right price.',
        outcomes: [
          { id: 'hire', label: 'Full lessons ($20K)', effects: { npcRep: 20, cash: -20000, permanentBenefit: 'professor_recipe' }, result: 'Three weeks. Product quality triples. Grade: "B+. Acceptable."' },
          { id: 'consult', label: 'One-time consultation ($8K)', effects: { npcRep: 10, cash: -8000, permanentBenefit: 'quality_boost' }, result: 'Single afternoon changes everything. Purity jumps 40%.' },
          { id: 'steal', label: 'Try to steal his notes', effects: { npcRep: -30, heat: 10 }, result: 'Notes are in code. The Professor vanishes.' }
        ]
      },
      {
        id: 'ch3_legacy', title: 'Final Exam',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'The Professor is dying. Cancer. He offers his complete formula to the one person he trusts.',
        outcomes: [
          { id: 'accept', label: 'Accept his legacy respectfully', effects: { npcRep: 30, permanentBenefit: 'professor_legacy' }, result: 'A leather notebook. Your product becomes the gold standard. 3x market value.' },
          { id: 'fund', label: 'Fund his treatment ($40K)', effects: { npcRep: 25, cash: -40000, permanentBenefit: 'professor_alive' }, result: 'Treatment buys time. He continues to consult.' },
          { id: 'cold', label: 'Take the notes and leave', effects: { npcRep: -20, permanentBenefit: 'professor_notes' }, result: 'The notes work. The guilt lingers.' }
        ]
      }
    ]
  },

  // ===== NPC 14: Captain Alejandro =====
  {
    id: 'captain_alejandro',
    name: 'Captain Alejandro',
    emoji: '\u2693',
    role: 'Coast Guard Officer',
    location: 'port_miami',
    romanceOption: false,
    benefits: { smugglingRouteIntel: true, safePassage: { costPerTrip: 5000 }, coastGuardSchedule: true },
    chapters: [
      {
        id: 'ch1_encounter', title: 'The Captain',
        triggerCondition: { minAct: 1, minDay: 20 },
        description: 'Your boat gets stopped for routine inspection. The captain lingers. "Nice boat. Expensive. For a fisherman."',
        outcomes: [
          { id: 'tip', label: 'Slip him $2K', effects: { npcRep: 10, cash: -2000 }, result: 'He pockets it. "Avoid the northeast channel on Thursdays."' },
          { id: 'talk', label: 'Friendly conversation', effects: { npcRep: 5 }, result: 'Fishing stories. He relaxes. A possible future contact.' },
          { id: 'stonewall', label: 'Say nothing', effects: { npcRep: -5 }, result: '"We will be seeing each other again."' }
        ]
      },
      {
        id: 'ch2_schedule', title: 'Patrol Patterns',
        triggerCondition: { minDay: 45, minRep: 5 },
        description: 'Alejandro offers patrol schedules and inspection routes. Invaluable for sea shipments.',
        outcomes: [
          { id: 'monthly', label: 'Monthly intel ($5K/month)', effects: { npcRep: 20, cash: -5000, permanentBenefit: 'coast_guard_intel' }, result: 'Like GPS for every cutter. Sea shipments run unimpeded.' },
          { id: 'occasional', label: 'Per-shipment ($2K)', effects: { npcRep: 10, cash: -2000 }, result: 'Route clearances on demand.' },
          { id: 'decline', label: 'Too risky', effects: { npcRep: -5 }, result: 'The door stays open.' }
        ]
      },
      {
        id: 'ch3_passage', title: 'Safe Harbor',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Coast Guard escort for your shipments. Nobody questions a CG escort.',
        outcomes: [
          { id: 'escort', label: 'Full escort ($10K/shipment)', effects: { npcRep: 25, permanentBenefit: 'coast_guard_escort' }, result: 'Boats travel under CG protection. Zero interceptions.' },
          { id: 'limited', label: 'Emergency only ($15K)', effects: { npcRep: 15, permanentBenefit: 'emergency_escort' }, result: 'Reserved for high-value shipments.' },
          { id: 'cut', label: 'Too deep, cut ties', effects: { npcRep: -25, heat: -10 }, result: 'You lose the best maritime asset in Florida.' }
        ]
      }
    ]
  },

  // ===== NPC 15: Nails Nikita =====
  {
    id: 'nails_nikita',
    name: '"Nails" Nikita',
    emoji: '\u{1F485}',
    role: 'Russian Enforcer',
    location: 'south_beach',
    romanceOption: false,
    benefits: { combatTraining: { crewCombatBonus: 0.25 }, easternBlocConnections: true, intimidationBonus: 0.3 },
    chapters: [
      {
        id: 'ch1_salon', title: 'Manicure and Mayhem',
        triggerCondition: { minAct: 1, minDay: 12 },
        description: 'A nail salon on Collins Ave. Nikita is six feet tall with a Spetsnaz tattoo. Your crew fought outside. She finished it.',
        outcomes: [
          { id: 'thank', label: 'Buy her a drink', effects: { npcRep: 10 }, result: '"Your boys fight like children. I train them if you want."' },
          { id: 'hire', label: 'Offer her a job', effects: { npcRep: 5, cash: -2000 }, result: '"I have job. Nails. But I do other things too. For right price."' },
          { id: 'avoid', label: 'Too much trouble', effects: { npcRep: -5 }, result: '"American men. Always scared of strong woman."' }
        ]
      },
      {
        id: 'ch2_training', title: 'Spetsnaz School',
        triggerCondition: { minDay: 35, minRep: 5 },
        description: 'Nikita offers crew training in combat and tactics. Ex-special forces methods.',
        outcomes: [
          { id: 'full_train', label: 'Full crew training ($10K)', effects: { npcRep: 20, cash: -10000, permanentBenefit: 'combat_training' }, result: 'Six weeks of hell. Combat effectiveness up 25%.' },
          { id: 'personal', label: 'Personal training ($3K)', effects: { npcRep: 10, cash: -3000 }, result: 'Bruises heal. Skills remain.' },
          { id: 'decline', label: 'Crew is tough enough', effects: { npcRep: -5 }, result: '"Tough is not same as trained."' }
        ]
      },
      {
        id: 'ch3_russian_mob', title: 'Mother Russia',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Nikita brokers an introduction to the Russian mob. New product, muscle, and complications.',
        outcomes: [
          { id: 'connect', label: 'Accept introduction ($15K)', effects: { npcRep: 25, cash: -15000, permanentBenefit: 'russian_connection' }, result: 'Eastern Bloc doors open. New risks and rewards.' },
          { id: 'limited', label: 'Weapons only', effects: { npcRep: 15, cash: -5000, permanentBenefit: 'russian_arms' }, result: 'Russian weaponry access. No Bratva drug ties.' },
          { id: 'refuse', label: 'Too dangerous', effects: { npcRep: -10 }, result: '"You have not met real criminals."' }
        ]
      }
    ]
  },

  // ===== NPC 16: Reverend Williams =====
  {
    id: 'reverend_williams',
    name: 'Reverend Williams',
    emoji: '\u{1F64F}',
    role: 'Megachurch Pastor',
    location: 'miami_gardens',
    romanceOption: false,
    benefits: { politicalConnections: true, churchLaundering: { rate: 0.90 }, communityInfluence: true },
    chapters: [
      {
        id: 'ch1_sermon', title: 'Prosperity Gospel',
        triggerCondition: { minAct: 1, minDay: 20 },
        description: 'Reverend Williams runs a megachurch with 5,000 members. Gold watch, Mercedes, tax-exempt empire.',
        outcomes: [
          { id: 'attend', label: 'Attend service, donate $5K', effects: { npcRep: 15, cash: -5000 }, result: 'The Reverend greets you personally. "The Lord provides for those who provide."' },
          { id: 'meet', label: 'Request a private meeting', effects: { npcRep: 5 }, result: 'Leather chairs, flat screens. "How can the church serve you?"' },
          { id: 'skip', label: 'Hypocrites are not useful', effects: { npcRep: 0 }, result: 'His empire continues without you.' }
        ]
      },
      {
        id: 'ch2_laundering', title: 'Tithes and Offerings',
        triggerCondition: { minDay: 40, minRep: 10 },
        description: 'Williams proposes laundering through the church. Donations in, clean money out. Tax-exempt. 90 cents on the dollar.',
        outcomes: [
          { id: 'full', label: 'Full laundering ($20K monthly)', effects: { npcRep: 20, permanentBenefit: 'church_laundering' }, result: 'Dirty money as donations. Clean money as community programs.' },
          { id: 'small', label: 'Small amounts ($5K monthly)', effects: { npcRep: 10, permanentBenefit: 'church_laundering_small' }, result: 'Modest amounts in the collection plate. Low risk, low volume.' },
          { id: 'refuse', label: 'Even you have limits', effects: { npcRep: -5 }, result: '"The offer stands. God is patient."' }
        ]
      },
      {
        id: 'ch3_politics', title: 'The Kingmaker',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'Williams has political connections: city council, state reps, a congressman. He delivers votes and protection.',
        outcomes: [
          { id: 'alliance', label: 'Full political alliance ($30K)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'political_machine' }, result: 'Zoning, police reassignments, permits. Political cover.' },
          { id: 'selective', label: 'Specific favors ($5K each)', effects: { npcRep: 15, permanentBenefit: 'political_favors' }, result: 'Need a permit? A cop reassigned? Williams makes calls.' },
          { id: 'expose', label: 'Expose his corruption', effects: { npcRep: -30, reputation: 10 }, result: 'His empire crumbles. You have made a powerful enemy.' }
        ]
      }
    ]
  },

  // ===== NPC 17: Maria Elena =====
  {
    id: 'maria_elena',
    name: 'Maria Elena',
    emoji: '\u{1F339}',
    role: "Cartel Exile's Daughter",
    location: 'coral_gables',
    romanceOption: true,
    benefits: { colombianIntel: true, cartelReconnection: true, romanceBonus: { stressReduction: 0.2 } },
    chapters: [
      {
        id: 'ch1_exile', title: "The Exile's Daughter",
        triggerCondition: { minAct: 1, minDay: 20, minCash: 15000 },
        description: 'At an upscale restaurant, a beautiful woman dines alone. Daughter of a Colombian cartel boss killed in a power struggle.',
        outcomes: [
          { id: 'approach', label: 'Introduce yourself', effects: { npcRep: 10 }, result: '"I know who you are. My father knew men like you."' },
          { id: 'send_drink', label: 'Send over champagne', effects: { npcRep: 5, cash: -500 }, result: 'She raises the glass. Studies you across the room.' },
          { id: 'leave', label: 'Cartel connections are trouble', effects: { npcRep: 0 }, result: 'She watches you leave with an unreadable expression.' }
        ]
      },
      {
        id: 'ch2_intel', title: 'Colombian Connections',
        triggerCondition: { minDay: 45, minRep: 5 },
        description: 'Maria Elena knows the Colombian supply chain inside out. Routes, contacts, prices. Information worth a fortune.',
        outcomes: [
          { id: 'romance', label: 'Court her properly, earn trust', effects: { npcRep: 20, cash: -3000 }, result: 'Dinners, conversations, patience. The intel flows naturally.' },
          { id: 'business', label: 'Offer protection for intel', effects: { npcRep: 10 }, result: '"Honesty is rare." She shares some, holds back more.' },
          { id: 'pressure', label: 'Make it clear you need that intel', effects: { npcRep: -15 }, result: '"You sound like the men who killed my father." She walks out.' }
        ]
      },
      {
        id: 'ch3_reconnection', title: 'Return to Colombia',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Maria Elena can reconnect with her father\'s old network. Direct cartel supply, cutting out middlemen.',
        outcomes: [
          { id: 'reconnect', label: 'Support reconnection ($20K)', effects: { npcRep: 25, cash: -20000, permanentBenefit: 'cartel_direct' }, result: 'Direct Colombian supply. Prices drop 40%.' },
          { id: 'romance_end', label: 'Ask her to stay, forget Colombia', effects: { npcRep: 20, permanentBenefit: 'elena_romance' }, result: 'She stays. Cartel closes. But you gain a partner who knows the game.' },
          { id: 'use', label: 'Send her back, cut the romance', effects: { npcRep: -20, permanentBenefit: 'cartel_channel' }, result: 'The supply line opens. The look on her face stays with you.' }
        ]
      }
    ]
  },

  // ===== NPC 18: Byte =====
  {
    id: 'byte',
    name: '"Byte"',
    emoji: '\u{1F4BB}',
    role: 'Teenage Hacker Prodigy',
    location: 'wynwood',
    romanceOption: false,
    benefits: { digitalOps: true, surveillanceHacking: true, cryptoSkills: true, securitySystems: true },
    chapters: [
      {
        id: 'ch1_hack', title: 'Script Kiddie',
        triggerCondition: { minAct: 1, minDay: 15 },
        description: 'A 17-year-old hacked your burner phone: "Your security sucks. Hire me or I sell your contacts."',
        outcomes: [
          { id: 'hire', label: 'Hire the kid ($2K/month)', effects: { npcRep: 15, cash: -2000 }, result: 'Encrypted comms, VPNs, and counter-surveillance in a weekend.' },
          { id: 'test', label: 'Give a test assignment first', effects: { npcRep: 10 }, result: '"Hack rival phones." 24 hours later, you have every text from the last month.' },
          { id: 'threaten', label: 'Find and scare the kid', effects: { npcRep: -10, fear: 5 }, result: 'A basement of monitors. The kid is terrified. But the skills are real.' }
        ]
      },
      {
        id: 'ch2_surveillance', title: 'Digital Ghost',
        triggerCondition: { minDay: 35, minRep: 5 },
        description: 'Byte can hack city surveillance, police databases, and rival comms. Total information awareness.',
        outcomes: [
          { id: 'full_suite', label: 'Full digital ops ($15K)', effects: { npcRep: 20, cash: -15000, permanentBenefit: 'digital_ops' }, result: 'Command center: live cameras, scanner intercepts, encrypted messaging.' },
          { id: 'cameras', label: 'Camera access only ($5K)', effects: { npcRep: 10, cash: -5000, permanentBenefit: 'camera_access' }, result: 'Eyes on every corner. You see trouble before it arrives.' },
          { id: 'decline', label: 'Too much tech dependency', effects: { npcRep: -5 }, result: '"Dinosaurs went extinct too."' }
        ]
      },
      {
        id: 'ch3_crypto', title: 'The Crypto Play',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Byte proposes moving finances to crypto. Untraceable wallets, DeFi laundering, NFT fronts.',
        outcomes: [
          { id: 'crypto', label: 'Full crypto transition ($20K)', effects: { npcRep: 25, cash: -20000, permanentBenefit: 'crypto_ops' }, result: 'Money moves through blockchain maze. Untraceable.' },
          { id: 'partial', label: 'Partial crypto, keep cash flow', effects: { npcRep: 15, cash: -10000, permanentBenefit: 'crypto_partial' }, result: 'Half digital, half traditional. Redundancy is smart.' },
          { id: 'refuse', label: 'Cash is king', effects: { npcRep: -10 }, result: '"Cash? In this decade?" Byte is disappointed.' }
        ]
      }
    ]
  },

  // ===== NPC 19: Grandmother Chen =====
  {
    id: 'grandmother_chen',
    name: 'Grandmother Chen',
    emoji: '\u{1F3EE}',
    role: 'Chinatown Matriarch',
    location: 'chinatown',
    romanceOption: false,
    benefits: { asianHeroinConnection: true, traditionalRemedies: { healingBoost: 0.2 }, chinatownTerritory: true },
    chapters: [
      {
        id: 'ch1_tea', title: 'Tea Ceremony',
        triggerCondition: { minAct: 1, minDay: 25 },
        description: 'A tea shop in Chinatown. Grandmother Chen is tiny, ancient, and the most powerful person on the block.',
        outcomes: [
          { id: 'respect', label: 'Accept tea, show proper respect', effects: { npcRep: 10 }, result: 'An hour-long ceremony. "You may do business here. Carefully."' },
          { id: 'gift', label: 'Bring expensive jade ($3K)', effects: { npcRep: 15, cash: -3000 }, result: 'She examines the jade. Nods once. "You understand the old ways."' },
          { id: 'demand', label: 'Demand access to territory', effects: { npcRep: -20 }, result: 'A flick of her wrist. Three men appear. "Leave. Now."' }
        ]
      },
      {
        id: 'ch2_heroin', title: 'The Golden Triangle',
        triggerCondition: { minDay: 50, minRep: 10 },
        description: 'Grandmother Chen controls a heroin pipeline from Southeast Asia. Pure product, ancient routes, below-market rates.',
        outcomes: [
          { id: 'accept', label: 'Enter heroin trade ($25K buy)', effects: { npcRep: 20, cash: -25000, permanentBenefit: 'heroin_supply' }, result: 'The purest product in Miami.' },
          { id: 'small', label: 'Small test order ($8K)', effects: { npcRep: 10, cash: -8000 }, result: 'Product sells itself. Grandmother nods at your caution.' },
          { id: 'refuse', label: 'Not your trade', effects: { npcRep: -5 }, result: '"Every man has his limits." More tea. The offer remains.' }
        ]
      },
      {
        id: 'ch3_war', title: 'Dragon and Eagle',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'A Vietnamese gang moves into Chinatown. Grandmother asks for your help. The price: permanent alliance.',
        outcomes: [
          { id: 'defend', label: 'Commit crew to defend ($15K)', effects: { npcRep: 30, cash: -15000, heat: 15, permanentBenefit: 'chinatown_alliance' }, result: 'Three days of warfare. Invaders driven out. A permanent bond.' },
          { id: 'advise', label: 'Provide weapons and strategy ($5K)', effects: { npcRep: 15, cash: -5000 }, result: 'Your tactics help. She considers you an advisor.' },
          { id: 'neutral', label: 'Stay neutral', effects: { npcRep: -15 }, result: '"Neutrality is a luxury." She handles it alone. Your access shrinks.' }
        ]
      }
    ]
  },

  // ===== NPC 20: Ace Williams =====
  {
    id: 'ace_williams',
    name: '"Ace" Williams',
    emoji: '\u{1F0CF}',
    role: 'Card Shark and Con Artist',
    location: 'south_beach',
    romanceOption: false,
    benefits: { persuasionBoost: 0.2, scamIncome: true, gamblingIntel: true, socialEngineering: true },
    chapters: [
      {
        id: 'ch1_con', title: 'The Long Con',
        triggerCondition: { minAct: 1, minDay: 15 },
        description: 'You watch a man in a tailored suit win $10K at poker. Every tell faked. Every fold calculated. Ace Williams, best card cheat in Miami.',
        outcomes: [
          { id: 'applaud', label: 'Buy him a drink, acknowledge the con', effects: { npcRep: 15 }, result: '"You spotted it? Nobody spots it." Ace grins.' },
          { id: 'recruit', label: 'Offer a position', effects: { npcRep: 10 }, result: '"I work alone. But I could consult." He shuffles cards one-handed.' },
          { id: 'expose', label: 'Expose the con to the table', effects: { npcRep: -20 }, result: 'Chaos. Ace barely escapes. He remembers your face.' }
        ]
      },
      {
        id: 'ch2_lessons', title: 'The Art of the Deal',
        triggerCondition: { minDay: 35, minRep: 5 },
        description: 'Ace offers to teach reading people, persuasion, deception. Skills beyond the card table.',
        outcomes: [
          { id: 'learn', label: 'Take lessons ($5K)', effects: { npcRep: 20, cash: -5000, permanentBenefit: 'con_artist_skills' }, result: 'Body language, micro-expressions. Negotiation success up 20%.' },
          { id: 'scams', label: 'Run scams together ($3K seed)', effects: { npcRep: 15, cash: -3000, permanentBenefit: 'scam_income' }, result: 'Tourist cons, insurance fraud. Tidy side income.' },
          { id: 'refuse', label: 'Prefer honest dishonesty', effects: { npcRep: -5 }, result: '"Honest dishonesty. Good one." Ace files it away.' }
        ]
      },
      {
        id: 'ch3_big_score', title: 'The Big Score',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Ace has a mark: corrupt developer with $2M in a safe. Three weeks, $20K investment. Legendary payoff.',
        outcomes: [
          { id: 'invest', label: 'Fund the con ($20K)', effects: { npcRep: 25, cash: -20000, permanentBenefit: 'ace_partnership' }, result: 'Three weeks of deception. Your share: $800K. Ace is loyal forever.' },
          { id: 'small_con', label: 'Suggest a smaller target', effects: { npcRep: 10, cash: -5000, permanentBenefit: 'ace_small' }, result: 'Lesser score, clean execution. $100K split.' },
          { id: 'refuse', label: 'Too much risk', effects: { npcRep: -10 }, result: 'Ace runs it solo. Succeeds. Never fully forgives you.' }
        ]
      }
    ]
  },

  // ===== NPC 21: Nurse Jackie =====
  {
    id: 'nurse_jackie',
    name: 'Nurse Jackie',
    emoji: '\u{1F489}',
    role: 'ER Nurse',
    location: 'downtown',
    romanceOption: false,
    benefits: { prescriptionAccess: true, medicalIntel: true, injuryTreatment: { hpPerVisit: 20 } },
    chapters: [
      {
        id: 'ch1_er', title: 'Night Shift',
        triggerCondition: { minAct: 1, minDay: 10 },
        description: 'Your crew member gets stabbed. The ER nurse patches him up and conveniently loses the paperwork. She slips you her number.',
        outcomes: [
          { id: 'contact', label: 'Save her number', effects: { npcRep: 10 }, result: '"Call me for anything that does not need a doctor. Or a record."' },
          { id: 'pay', label: 'Offer $1K for the favor', effects: { npcRep: 15, cash: -1000 }, result: 'She pockets it cleanly. A professional arrangement begins.' },
          { id: 'ignore', label: 'Leave without a word', effects: { npcRep: 0 }, result: 'She watches you go. Opportunities pass.' }
        ]
      },
      {
        id: 'ch2_prescriptions', title: 'Pharmacy Access',
        triggerCondition: { minDay: 35, minRep: 5 },
        description: 'Jackie can divert prescription meds. Painkillers, sedatives, stimulants. Hospital supply, street prices.',
        outcomes: [
          { id: 'supply', label: 'Set up a supply chain ($5K)', effects: { npcRep: 20, cash: -5000, permanentBenefit: 'prescription_supply' }, result: 'Regular deliveries of pharmaceutical-grade product. Premium prices on the street.' },
          { id: 'personal', label: 'Medical supplies for crew only', effects: { npcRep: 10, permanentBenefit: 'crew_medical' }, result: 'Your crew gets patched up with hospital-quality supplies. No questions.' },
          { id: 'refuse', label: 'Prescription game is not for you', effects: { npcRep: -5 }, result: '"Your loss. This stuff practically sells itself."' }
        ]
      },
      {
        id: 'ch3_crisis', title: 'Code Blue',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Jackie is caught diverting meds. Hospital investigation. She needs your help or she goes to prison and your supply line dies.',
        outcomes: [
          { id: 'protect', label: 'Bribe hospital admin ($20K)', effects: { npcRep: 25, cash: -20000, permanentBenefit: 'jackie_protected' }, result: 'Investigation buried. Jackie is untouchable. Your medical pipeline flows freely.' },
          { id: 'relocate', label: 'Get her a job at a different hospital ($5K)', effects: { npcRep: 15, cash: -5000, permanentBenefit: 'jackie_relocated' }, result: 'Fresh start. New hospital, same arrangement. Lower profile.' },
          { id: 'cut', label: 'She is on her own', effects: { npcRep: -25 }, result: 'Jackie takes a plea deal. She keeps your name out of it. Barely.' }
        ]
      }
    ]
  },

  // ===== NPC 22: Machete Martinez =====
  {
    id: 'machete_martinez',
    name: '"Machete" Martinez',
    emoji: '\u{1F52A}',
    role: 'Ex-Cartel Enforcer',
    location: 'hialeah',
    romanceOption: false,
    benefits: { muscleForHire: true, cartelTactics: true, intimidationBonus: 0.4 },
    chapters: [
      {
        id: 'ch1_bar', title: 'The Enforcer',
        triggerCondition: { minAct: 1, minDay: 15 },
        description: 'A scarred mountain of a man drinks alone in a Hialeah bar. Former Sinaloa enforcer. Retired after a disagreement measured in bodies.',
        outcomes: [
          { id: 'respect', label: 'Buy him a drink and show respect', effects: { npcRep: 10 }, result: 'He studies you for a long time. "You remind me of my old boss. Before I killed him."' },
          { id: 'hire', label: 'Offer work immediately', effects: { npcRep: 5, cash: -3000 }, result: '"What kind of work?" His hand goes to the scar on his forearm.' },
          { id: 'avoid', label: 'This man is too dangerous', effects: { npcRep: 0 }, result: 'You leave. Smart. Or cowardly. Hard to tell the difference sometimes.' }
        ]
      },
      {
        id: 'ch2_muscle', title: 'Heavy Hitter',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Machete offers his services as enforcer and tactical advisor. Cartel warfare experience that nobody in Miami can match.',
        outcomes: [
          { id: 'full', label: 'Full-time enforcer ($8K/month)', effects: { npcRep: 20, cash: -8000, permanentBenefit: 'cartel_enforcer' }, result: 'Nobody challenges you with Machete standing behind you. Intimidation up 40%.' },
          { id: 'trainer', label: 'Train your crew in cartel tactics ($10K)', effects: { npcRep: 15, cash: -10000, permanentBenefit: 'cartel_tactics' }, result: 'Your crew learns ambush tactics, counter-surveillance, and interrogation.' },
          { id: 'occasional', label: 'Contract work only', effects: { npcRep: 5 }, result: '"Call me when bodies need to drop." He finishes his drink.' }
        ]
      },
      {
        id: 'ch3_past', title: 'Ghosts of Sinaloa',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'The cartel found Machete. They want him back or dead. Standing with him means war with Sinaloa. Walking away means losing your best muscle.',
        outcomes: [
          { id: 'stand', label: 'Stand with Machete (war with cartel)', effects: { npcRep: 30, heat: 25, permanentBenefit: 'machete_loyal' }, result: 'A brutal week. Bodies on both sides. But Machete survives and is loyal until death.' },
          { id: 'negotiate', label: 'Negotiate his freedom ($50K)', effects: { npcRep: 20, cash: -50000, permanentBenefit: 'machete_free' }, result: 'The cartel accepts blood money. Machete is free. Permanently grateful.' },
          { id: 'surrender', label: 'Hand him over', effects: { npcRep: -40 }, result: 'Machete sees it coming. He takes three of them with him. Your reputation for loyalty is destroyed.' }
        ]
      }
    ]
  },

  // ===== NPC 23: Councilwoman Davis =====
  {
    id: 'councilwoman_davis',
    name: 'Councilwoman Davis',
    emoji: '\u{1F3DB}\uFE0F',
    role: 'Local Politician',
    location: 'miami_gardens',
    romanceOption: false,
    benefits: { zoningFavors: true, policeProtection: true, politicalIntel: true },
    chapters: [
      {
        id: 'ch1_fundraiser', title: 'The Fundraiser',
        triggerCondition: { minAct: 1, minDay: 20, minCash: 10000 },
        description: 'A political fundraiser. Councilwoman Davis works the room. She knows which pockets are deep and which are dirty.',
        outcomes: [
          { id: 'donate', label: 'Donate $10K to her campaign', effects: { npcRep: 15, cash: -10000 }, result: '"Such generosity. We should discuss your community concerns. Privately."' },
          { id: 'meet', label: 'Request a meeting through channels', effects: { npcRep: 5 }, result: 'An aide takes your card. A meeting is scheduled for next week. Official.' },
          { id: 'skip', label: 'Politicians are unreliable', effects: { npcRep: 0 }, result: 'You observe from the bar. Davis notes your presence regardless.' }
        ]
      },
      {
        id: 'ch2_favors', title: 'Quid Pro Quo',
        triggerCondition: { minDay: 45, minRep: 10 },
        description: 'Davis needs campaign money. You need zoning changes and police reassignments. A natural partnership.',
        outcomes: [
          { id: 'full', label: 'Full political backing ($25K)', effects: { npcRep: 25, cash: -25000, permanentBenefit: 'political_backing' }, result: 'Zoning changes approved. Friendly cops assigned to your territory. Building permits expedited.' },
          { id: 'limited', label: 'Case-by-case ($5K per favor)', effects: { npcRep: 15, permanentBenefit: 'political_access' }, result: 'She delivers when asked. Not cheap, but effective.' },
          { id: 'refuse', label: 'Too much exposure', effects: { npcRep: -5 }, result: '"Everyone needs friends in government eventually." She moves on.' }
        ]
      },
      {
        id: 'ch3_election', title: 'Election Day',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Davis faces a tough re-election. If she loses, your political cover evaporates. She needs $50K and ground support.',
        outcomes: [
          { id: 'back', label: 'Full campaign support ($50K + crew)', effects: { npcRep: 30, cash: -50000, permanentBenefit: 'davis_elected' }, result: 'She wins by a landslide. Your political shield is ironclad. Years of protection ahead.' },
          { id: 'hedge', label: 'Support both candidates ($25K each)', effects: { npcRep: -10, cash: -50000, permanentBenefit: 'political_hedge' }, result: 'Davis finds out. "Playing both sides? Fine. But the price just went up."' },
          { id: 'abandon', label: 'Let her lose', effects: { npcRep: -30 }, result: 'Davis loses. The new councilmember has no love for you. Political cover gone.' }
        ]
      }
    ]
  },

  // ===== NPC 24: Whisper Washington =====
  {
    id: 'whisper_washington',
    name: '"Whisper" Washington',
    emoji: '\u{1F442}',
    role: 'Street Informant Network Leader',
    location: 'liberty_city',
    romanceOption: false,
    benefits: { intelOnAnyone: true, earlyWarning: true, snitchIdentification: true },
    chapters: [
      {
        id: 'ch1_whisper', title: 'The Network',
        triggerCondition: { minAct: 1, minDay: 12 },
        description: 'They call him Whisper because he hears everything and says it quietly. He runs the largest informant network in Miami.',
        outcomes: [
          { id: 'buy', label: 'Buy intel on a rival ($2K)', effects: { npcRep: 10, cash: -2000 }, result: 'Detailed dossier: routes, stash houses, weak points. Whisper delivers.' },
          { id: 'subscribe', label: 'Weekly intel reports ($3K/week)', effects: { npcRep: 15, cash: -3000 }, result: 'Every Monday: who is moving what, who is talking to cops, who is planning what.' },
          { id: 'pass', label: 'You have your own sources', effects: { npcRep: 0 }, result: 'Whisper shrugs. "Everyone says that. Then they get surprised."' }
        ]
      },
      {
        id: 'ch2_snitch_finder', title: 'Rat Patrol',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Whisper offers his most valuable service: identifying snitches in your organization before they talk.',
        outcomes: [
          { id: 'retain', label: 'Snitch detection service ($5K/month)', effects: { npcRep: 20, cash: -5000, permanentBenefit: 'snitch_detection' }, result: 'Whisper identifies two informants in your crew within the first month. Invaluable.' },
          { id: 'one_time', label: 'One-time sweep ($8K)', effects: { npcRep: 10, cash: -8000 }, result: 'A thorough check. One rat found. Your organization tightens.' },
          { id: 'decline', label: 'You trust your people', effects: { npcRep: -5 }, result: '"Trust. That is a dangerous commodity in this business."' }
        ]
      },
      {
        id: 'ch3_leverage', title: 'Information is Power',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Whisper has collected dirt on everyone: cops, judges, rivals, politicians. He offers you exclusive access to his full database.',
        outcomes: [
          { id: 'full_access', label: 'Full database access ($30K)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'whisper_database' }, result: 'Leverage on half of Miami. Who is cheating, who is corrupt, who is vulnerable. Power.' },
          { id: 'selective', label: 'Buy specific files as needed ($3K each)', effects: { npcRep: 15, permanentBenefit: 'whisper_selective' }, result: 'Targeted intel when you need it. Efficient and discreet.' },
          { id: 'steal', label: 'Try to take the database by force', effects: { npcRep: -40, heat: 15 }, result: 'Whisper vanishes. His dead man switch sends your secrets to every cop in Dade County.' }
        ]
      }
    ]
  },

  // ===== NPC 25: Chef Antoine =====
  {
    id: 'chef_antoine',
    name: 'Chef Antoine',
    emoji: '\u{1F468}\u200D\u{1F373}',
    role: 'Celebrity Chef / Restaurant Owner',
    location: 'south_beach',
    romanceOption: false,
    benefits: { restaurantLaundering: { rate: 0.88 }, cateringEvents: true, socialCover: true },
    chapters: [
      {
        id: 'ch1_restaurant', title: 'The Kitchen',
        triggerCondition: { minAct: 1, minDay: 18 },
        description: 'Chef Antoine runs three restaurants on South Beach. Celebrity clients, Michelin ambitions, and cash flow that nobody audits closely.',
        outcomes: [
          { id: 'dine', label: 'Become a regular ($2K tab)', effects: { npcRep: 10, cash: -2000 }, result: 'Best table in the house. Antoine remembers generous customers.' },
          { id: 'invest', label: 'Propose an investment', effects: { npcRep: 5 }, result: '"I am always looking for partners who appreciate fine dining and discretion."' },
          { id: 'pass', label: 'Not your scene', effects: { npcRep: 0 }, result: 'You eat somewhere cheaper. Antoine does not notice.' }
        ]
      },
      {
        id: 'ch2_laundering', title: 'Cooking the Books',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Antoine proposes laundering through his restaurants. Inflated food costs, phantom catering events, cash-heavy business. 88 cents on the dollar.',
        outcomes: [
          { id: 'full', label: 'Full restaurant laundering ($15K setup)', effects: { npcRep: 20, cash: -15000, permanentBenefit: 'restaurant_laundering' }, result: 'Three restaurants, three streams of clean money. Antoine cooks the books as well as the food.' },
          { id: 'catering', label: 'Phantom catering events only', effects: { npcRep: 10, permanentBenefit: 'catering_laundering' }, result: 'Fake events, real invoices. Moderate volume, very low risk.' },
          { id: 'refuse', label: 'Keep business separate', effects: { npcRep: -5 }, result: '"As you wish. The kitchen is always open."' }
        ]
      },
      {
        id: 'ch3_expansion', title: 'Empire of Taste',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'Antoine wants to expand: five more restaurants across Miami. Your investment would triple laundering capacity and provide legitimate social cover.',
        outcomes: [
          { id: 'expand', label: 'Fund restaurant empire ($60K)', effects: { npcRep: 25, cash: -60000, permanentBenefit: 'restaurant_empire' }, result: 'Eight restaurants across Miami. Massive laundering capacity. You are a respectable restaurateur now.' },
          { id: 'moderate', label: 'Fund two more locations ($25K)', effects: { npcRep: 15, cash: -25000, permanentBenefit: 'restaurant_moderate' }, result: 'Five total restaurants. Good cover, good capacity.' },
          { id: 'decline', label: 'Too much legitimate investment', effects: { npcRep: -10 }, result: 'Antoine finds other investors. Your laundering stays at current levels.' }
        ]
      }
    ]
  },

  // ===== NPC 26: DJ Shadow =====
  {
    id: 'dj_shadow',
    name: 'DJ Shadow',
    emoji: '\u{1F3A7}',
    role: 'Nightlife King',
    location: 'south_beach',
    romanceOption: false,
    benefits: { clubConnections: true, eventPromotion: true, socialSceneIntel: true },
    chapters: [
      {
        id: 'ch1_club', title: 'The Beat',
        triggerCondition: { minAct: 1, minDay: 12 },
        description: 'DJ Shadow controls Miami nightlife. Every club, every party, every VIP list goes through him. He is the gatekeeper of the scene.',
        outcomes: [
          { id: 'vip', label: 'Pay for permanent VIP access ($5K)', effects: { npcRep: 15, cash: -5000 }, result: 'Every rope drops. Every list has your name. Shadow nods from the booth.' },
          { id: 'meet', label: 'Arrange a backstage meeting', effects: { npcRep: 10 }, result: '"You want to party or you want to do business? Because I do both."' },
          { id: 'skip', label: 'Nightlife is a distraction', effects: { npcRep: 0 }, result: 'You miss the networking that happens after midnight.' }
        ]
      },
      {
        id: 'ch2_distribution', title: 'Club Circuit',
        triggerCondition: { minDay: 35, minRep: 10 },
        description: 'Shadow offers to run distribution through his club network. Every VIP room is a sales floor. Every DJ set is a transaction window.',
        outcomes: [
          { id: 'full_circuit', label: 'Full club distribution ($10K/month)', effects: { npcRep: 20, cash: -10000, permanentBenefit: 'club_distribution' }, result: 'Product moves through every club in South Beach. Premium prices, premium clients.' },
          { id: 'select', label: 'Select venues only ($5K)', effects: { npcRep: 10, cash: -5000, permanentBenefit: 'club_select' }, result: 'Three clubs, carefully chosen. Lower volume, lower risk.' },
          { id: 'refuse', label: 'Clubs are too visible', effects: { npcRep: -5 }, result: '"Visible? That is the point. Nobody suspects the party."' }
        ]
      },
      {
        id: 'ch3_festival', title: 'Ultra',
        triggerCondition: { minDay: 65, minRep: 15 },
        description: 'Shadow is producing a massive music festival. 50,000 people. The distribution potential is staggering. He wants you as a partner.',
        outcomes: [
          { id: 'partner', label: 'Festival partnership ($30K)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'festival_ops' }, result: '50,000 customers in one weekend. Record sales. Shadow is the king of the night.' },
          { id: 'sponsor', label: 'Sponsor a stage ($15K)', effects: { npcRep: 15, cash: -15000, permanentBenefit: 'festival_sponsor' }, result: 'Your brand on the biggest stage. Connections and sales.' },
          { id: 'decline', label: 'Too much exposure', effects: { npcRep: -10 }, result: 'Shadow partners with a rival. The festival is their showcase, not yours.' }
        ]
      }
    ]
  },

  // ===== NPC 27: Doc Holiday =====
  {
    id: 'doc_holiday',
    name: '"Doc" Holiday',
    emoji: '\u{1F920}',
    role: 'Retired Smuggler Pilot',
    location: 'homestead',
    romanceOption: false,
    benefits: { airRoutes: true, bushPilotSkills: true, evergladesKnowledge: true },
    chapters: [
      {
        id: 'ch1_airstrip', title: 'The Old Pilot',
        triggerCondition: { minAct: 1, minDay: 25 },
        description: 'A dirt airstrip in Homestead. An old man tinkers with a Cessna. Doc Holiday flew for every cartel in the 80s and lived to retire.',
        outcomes: [
          { id: 'approach', label: 'Bring a bottle of good bourbon', effects: { npcRep: 10 }, result: '"Sit down, son. Let me tell you about the time I outran an F-16 in a crop duster."' },
          { id: 'business', label: 'Ask about air smuggling routes', effects: { npcRep: 5 }, result: '"Routes? I wrote the map. But that map has a price."' },
          { id: 'leave', label: 'Air routes are too risky', effects: { npcRep: 0 }, result: 'Doc watches you drive away. Shrugs. Keeps tinkering.' }
        ]
      },
      {
        id: 'ch2_routes', title: 'Air Mail',
        triggerCondition: { minDay: 50, minRep: 5 },
        description: 'Doc knows every back airstrip, every radar gap, every DEA flight pattern in South Florida. His routes are legendary.',
        outcomes: [
          { id: 'buy_routes', label: 'Buy his route knowledge ($15K)', effects: { npcRep: 20, cash: -15000, permanentBenefit: 'air_routes' }, result: 'Every route mapped. Radar gaps, timing windows, emergency strips. Air smuggling unlocked.' },
          { id: 'hire_pilot', label: 'Hire him to fly ($10K per run)', effects: { npcRep: 15, permanentBenefit: 'doc_pilot' }, result: 'Doc flies like he is 30 again. Zero interceptions. The old man still has it.' },
          { id: 'decline', label: 'Stick to land and sea', effects: { npcRep: -5 }, result: '"Every smuggler should have three ways in. You only got two."' }
        ]
      },
      {
        id: 'ch3_everglades', title: 'Swamp Fox',
        triggerCondition: { minDay: 75, minRep: 15 },
        description: 'Doc knows the Everglades like his own backyard. Hidden strips, stash sites, escape routes through the swamp. The ultimate backup plan.',
        outcomes: [
          { id: 'full_map', label: 'Complete Everglades network ($20K)', effects: { npcRep: 25, cash: -20000, permanentBenefit: 'everglades_network' }, result: 'Hidden airstrips, boat routes, stash houses in the swamp. An entire shadow logistics network.' },
          { id: 'escape', label: 'Escape routes only ($8K)', effects: { npcRep: 15, cash: -8000, permanentBenefit: 'escape_routes' }, result: 'When things go wrong, you have a way out through the Everglades. Insurance.' },
          { id: 'pass', label: 'The Everglades are too remote', effects: { npcRep: -5 }, result: '"Remote is the point." Doc shakes his head.' }
        ]
      }
    ]
  },

  // ===== NPC 28: Sister Maria =====
  {
    id: 'sister_maria',
    name: 'Sister Maria',
    emoji: '\u{1F64F}',
    role: 'Nun Running Shelter',
    location: 'overtown',
    romanceOption: false,
    benefits: { communityTrust: true, hideoutPotential: true, moralCompass: { stressReduction: 0.15 } },
    chapters: [
      {
        id: 'ch1_shelter', title: 'The Shelter',
        triggerCondition: { minAct: 1, minDay: 10 },
        description: 'A women and children shelter in Overtown. Sister Maria runs it with iron will and gentle hands. She has seen everything.',
        outcomes: [
          { id: 'donate', label: 'Donate $2K anonymously', effects: { npcRep: 15, cash: -2000 }, result: 'She traces the donation. Finds you. "Thank you. But I know what you do. We should talk."' },
          { id: 'volunteer', label: 'Offer to help with repairs', effects: { npcRep: 10 }, result: 'You fix a leaking roof. Sister Maria hands you lemonade. "Useful hands. Are they always used for good?"' },
          { id: 'ignore', label: 'Walk on by', effects: { npcRep: 0 }, result: 'The shelter stands. Sister Maria prays for everyone. Including you.' }
        ]
      },
      {
        id: 'ch2_hideout', title: 'Sanctuary',
        triggerCondition: { minDay: 40, minRep: 10 },
        description: 'You need a safe house. The shelter has unused basement rooms. Sister Maria would never agree, unless the cause was right.',
        outcomes: [
          { id: 'ask', label: 'Ask honestly, offer $10K/month to the shelter', effects: { npcRep: 15, cash: -10000, permanentBenefit: 'shelter_hideout' }, result: '"People in danger can hide here. Not drugs. Not weapons. People." She agrees, with conditions.' },
          { id: 'secret', label: 'Use it without asking ($5K renovation)', effects: { npcRep: -20, cash: -5000, permanentBenefit: 'secret_hideout' }, result: 'A hidden room behind the boiler. If Sister Maria finds out, everything crumbles.' },
          { id: 'find_elsewhere', label: 'Find another location', effects: { npcRep: 5 }, result: 'You respect her space. She notices and appreciates.' }
        ]
      },
      {
        id: 'ch3_conscience', title: 'The Soul',
        triggerCondition: { minDay: 70, minRep: 10 },
        description: 'Sister Maria offers something no one else can: genuine moral guidance. Weekly conversations that reduce stress and ground you.',
        outcomes: [
          { id: 'accept', label: 'Accept her counsel', effects: { npcRep: 25, permanentBenefit: 'moral_compass' }, result: 'Weekly meetings in the garden. She asks hard questions. Your stress drops. Your perspective shifts.' },
          { id: 'fund', label: 'Fund the shelter expansion ($20K)', effects: { npcRep: 20, cash: -20000, permanentBenefit: 'shelter_patron' }, result: 'The shelter doubles in size. Your name is whispered with respect in the community.' },
          { id: 'reject', label: 'You do not need a conscience', effects: { npcRep: -10 }, result: '"Everyone needs a conscience. Especially those who think they do not." She prays for you harder.' }
        ]
      }
    ]
  },

  // ===== NPC 29: Kingfish Robinson =====
  {
    id: 'kingfish_robinson',
    name: '"Kingfish" Robinson',
    emoji: '\u{1F41F}',
    role: 'Dock Worker Union Boss',
    location: 'port_miami',
    romanceOption: false,
    benefits: { portAccess: true, smugglingLabor: true, dockIntel: true },
    chapters: [
      {
        id: 'ch1_docks', title: 'The Kingfish',
        triggerCondition: { minAct: 1, minDay: 15 },
        description: 'Port Miami. Kingfish Robinson controls the dock workers union. Nothing enters or leaves without his people touching it.',
        outcomes: [
          { id: 'meet', label: 'Arrange a meeting at his office', effects: { npcRep: 10 }, result: '"You want something moved? I move things. That is what my people do." Cigar smoke. Firm handshake.' },
          { id: 'bribe', label: 'Send a gift basket ($3K of bourbon)', effects: { npcRep: 15, cash: -3000 }, result: 'Kingfish appreciates a man who knows the language. "Let us talk business."' },
          { id: 'skip', label: 'Port is not your territory', effects: { npcRep: 0 }, result: 'Your shipments go through other hands. More expensive, less reliable.' }
        ]
      },
      {
        id: 'ch2_smuggling', title: 'Container Shuffle',
        triggerCondition: { minDay: 40, minRep: 5 },
        description: 'Kingfish offers container access: his workers look the other way, mislabel containers, lose paperwork. Your product flows freely through the port.',
        outcomes: [
          { id: 'full', label: 'Full port access ($15K/month)', effects: { npcRep: 25, cash: -15000, permanentBenefit: 'port_access' }, result: 'Containers arrive, contents redistributed, paperwork vanishes. Port Miami is yours.' },
          { id: 'selective', label: 'Per-shipment basis ($5K each)', effects: { npcRep: 15, cash: -5000, permanentBenefit: 'port_selective' }, result: 'Specific containers, specific dates. Efficient and controllable.' },
          { id: 'decline', label: 'Ports attract federal attention', effects: { npcRep: -5 }, result: '"Federal attention? Son, I have been doing this since before you were born."' }
        ]
      },
      {
        id: 'ch3_strike', title: 'Labor War',
        triggerCondition: { minDay: 70, minRep: 15 },
        description: 'A rival union is trying to break Kingfish. If he loses control, your port access dies. He needs muscle and money to hold the docks.',
        outcomes: [
          { id: 'support', label: 'Full support: money and crew ($25K)', effects: { npcRep: 30, cash: -25000, heat: 10, permanentBenefit: 'kingfish_loyal' }, result: 'The rival union crumbles. Kingfish rules the port absolutely. Your access is permanent and priority.' },
          { id: 'money', label: 'Financial support only ($15K)', effects: { npcRep: 15, cash: -15000 }, result: 'Kingfish hires his own muscle. Wins. Grateful but not indebted.' },
          { id: 'neutral', label: 'Stay out of labor disputes', effects: { npcRep: -20 }, result: 'Kingfish nearly loses. He survives, but barely. Your relationship cools significantly.' }
        ]
      }
    ]
  },

  // ===== NPC 30: Detective Rivera =====
  {
    id: 'detective_rivera',
    name: 'Detective Rivera',
    emoji: '\u{1F575}\uFE0F',
    role: 'Conflicted Detective',
    location: 'downtown',
    romanceOption: false,
    benefits: {
      corruptPath: { caseLeaks: true, evidenceTampering: true },
      nemesisPath: { investigationBoost: 0.2 }
    },
    chapters: [
      {
        id: 'ch1_investigation', title: 'The New Case',
        triggerCondition: { minAct: 1, minDay: 15, minHeat: 15 },
        description: 'Detective Rivera catches your case. Smart, thorough, and not yet jaded enough to be bought. She stares at your photo on her board.',
        outcomes: [
          { id: 'research', label: 'Learn everything about her', effects: { npcRep: 0 }, result: 'Single mother. Honest. Underpaid. Her daughter needs braces. Everyone has a pressure point.' },
          { id: 'confront', label: 'Arrange a face-to-face', effects: { npcRep: 5 }, result: '"I know what you are doing," she says. "And I will prove it." Her eyes are determined.' },
          { id: 'avoid', label: 'Stay off her radar', effects: { npcRep: 0, heat: -5 }, result: 'You go dark for a while. Rivera chases cold trails.' }
        ]
      },
      {
        id: 'ch2_pressure', title: 'Turning Point',
        triggerCondition: { minDay: 45, minRep: 0 },
        description: 'Rivera is getting close. But she is also drowning in debt and her daughter is sick. The system has failed her. Can you exploit that?',
        outcomes: [
          { id: 'corrupt', label: 'Offer financial help for her daughter ($15K)', effects: { npcRep: 20, cash: -15000 }, result: 'She cries. Takes the money. Hates herself. The case files start having gaps.' },
          { id: 'threaten', label: 'Remind her of the dangers of her job', effects: { npcRep: -15, fear: 10 }, result: 'She doubles down. Requests backup. Your file gets thicker.' },
          { id: 'respect', label: 'Leave her alone, respect her integrity', effects: { npcRep: 5 }, result: 'Rivera continues investigating. But she notes your restraint.' }
        ]
      },
      {
        id: 'ch3_fate', title: 'The Badge or the Bribe',
        triggerCondition: { minDay: 75, minRep: 0 },
        description: 'Rivera reaches her breaking point. She either crosses the line permanently or becomes the most dangerous detective in Miami.',
        outcomes: [
          { id: 'turn', label: 'Full corruption ($30K + monthly payments)', effects: { npcRep: 25, cash: -30000, permanentBenefit: 'rivera_corrupt' }, result: 'Rivera is yours. Cases leak, evidence disappears, investigations stall. A broken but useful cop.' },
          { id: 'nemesis', label: 'She chooses the badge', effects: { npcRep: -30, permanentBenefit: 'rivera_nemesis' }, result: 'Rivera becomes your arch-nemesis. Investigation speed up 20%. She will never stop hunting you.' },
          { id: 'truce', label: 'Negotiate a truce: you clean up, she backs off', effects: { npcRep: 10, permanentBenefit: 'rivera_truce' }, result: 'An uneasy peace. You reduce visible operations. She focuses on worse criminals. For now.' }
        ]
      }
    ]
  }
];


// ============================================================
// STATE INITIALIZATION
// ============================================================

function initNPCState() {
  return {
    metNPCs: {},           // npcId -> { met: true, currentChapter: 0, relationship: 0, fear: 0, outcome: null }
    activeNPCEvent: null,  // { npcId, chapterIndex } when presenting a chapter
    npcBenefits: {},       // npcId -> active benefits object
    npcLog: [],            // [{ day, npcId, chapterId, outcomeId }]
    stats: {
      totalMet: 0,
      totalChaptersCompleted: 0,
      romances: [],
      enemies: [],
      allies: []
    }
  };
}

// ============================================================
// TRIGGER CONDITION CHECKING
// ============================================================

function checkNPCTrigger(state, npc, chapterIndex) {
  if (chapterIndex < 0 || chapterIndex >= npc.chapters.length) return false;

  var chapter = npc.chapters[chapterIndex];
  var cond = chapter.triggerCondition;
  if (!cond) return true;

  // Check act requirement
  if (typeof cond.minAct === 'number') {
    var currentAct = (typeof state.currentAct === 'number') ? state.currentAct : 1;
    if (currentAct < cond.minAct) return false;
  }

  // Check day requirement
  if (typeof cond.minDay === 'number') {
    var currentDay = (typeof state.day === 'number') ? state.day : 0;
    if (currentDay < cond.minDay) return false;
  }

  // Check reputation with this NPC
  if (typeof cond.minRep === 'number') {
    var npcData = state.namedNPCs && state.namedNPCs.metNPCs && state.namedNPCs.metNPCs[npc.id];
    var currentRep = npcData ? (npcData.relationship || 0) : 0;
    if (currentRep < cond.minRep) return false;
  }

  // Check cash
  if (typeof cond.minCash === 'number') {
    var cash = (typeof state.cash === 'number') ? state.cash : 0;
    if (cash < cond.minCash) return false;
  }

  // Check heat
  if (typeof cond.minHeat === 'number') {
    var heat = (typeof state.heat === 'number') ? state.heat : 0;
    if (heat < cond.minHeat) return false;
  }

  // Check crew size
  if (typeof cond.minCrew === 'number') {
    var crewSize = 0;
    if (Array.isArray(state.henchmen)) {
      crewSize = state.henchmen.length;
    } else if (typeof state.crewSize === 'number') {
      crewSize = state.crewSize;
    }
    if (crewSize < cond.minCrew) return false;
  }

  // Check if player has a business
  if (cond.hasBusiness === true) {
    var hasBiz = false;
    if (typeof state.businesses !== 'undefined' && state.businesses) {
      hasBiz = Array.isArray(state.businesses) ? state.businesses.length > 0 : Object.keys(state.businesses).length > 0;
    }
    if (!hasBiz) return false;
  }

  return true;
}

// ============================================================
// MEET NPC (first encounter)
// ============================================================

function meetNPC(state, npcId) {
  if (!state.namedNPCs) state.namedNPCs = initNPCState();

  var npc = null;
  for (var i = 0; i < NAMED_NPCS.length; i++) {
    if (NAMED_NPCS[i].id === npcId) {
      npc = NAMED_NPCS[i];
      break;
    }
  }
  if (!npc) return { success: false, message: 'NPC not found: ' + npcId };

  if (state.namedNPCs.metNPCs[npcId]) {
    return { success: false, message: 'Already met ' + npc.name };
  }

  state.namedNPCs.metNPCs[npcId] = {
    met: true,
    currentChapter: 0,
    relationship: 0,
    fear: 0,
    outcome: null,
    completedChapters: []
  };
  state.namedNPCs.stats.totalMet++;

  // Queue chapter 1
  state.namedNPCs.activeNPCEvent = {
    npcId: npcId,
    chapterIndex: 0
  };

  return {
    success: true,
    message: 'Met ' + npc.name + ' (' + npc.role + ')',
    npc: npc,
    chapter: npc.chapters[0]
  };
}

// ============================================================
// RESOLVE NPC OUTCOME (player choice)
// ============================================================

function resolveNPCOutcome(state, outcomeIndex) {
  if (!state.namedNPCs || !state.namedNPCs.activeNPCEvent) {
    return { success: false, message: 'No active NPC event' };
  }

  var event = state.namedNPCs.activeNPCEvent;
  var npc = null;
  for (var i = 0; i < NAMED_NPCS.length; i++) {
    if (NAMED_NPCS[i].id === event.npcId) {
      npc = NAMED_NPCS[i];
      break;
    }
  }
  if (!npc) return { success: false, message: 'NPC not found' };

  var chapter = npc.chapters[event.chapterIndex];
  if (!chapter || outcomeIndex < 0 || outcomeIndex >= chapter.outcomes.length) {
    return { success: false, message: 'Invalid outcome index' };
  }

  var outcome = chapter.outcomes[outcomeIndex];
  var npcData = state.namedNPCs.metNPCs[event.npcId];
  var messages = [];

  // Apply effects
  if (outcome.effects) {
    // NPC relationship
    if (typeof outcome.effects.npcRep === 'number') {
      npcData.relationship = (npcData.relationship || 0) + outcome.effects.npcRep;
    }

    // Fear
    if (typeof outcome.effects.fear === 'number') {
      npcData.fear = (npcData.fear || 0) + outcome.effects.fear;
    }

    // Cash
    if (typeof outcome.effects.cash === 'number' && typeof state.cash === 'number') {
      state.cash += outcome.effects.cash;
      if (outcome.effects.cash < 0) {
        messages.push('Spent $' + Math.abs(outcome.effects.cash).toLocaleString());
      } else {
        messages.push('Gained $' + outcome.effects.cash.toLocaleString());
      }
    }

    // Heat
    if (typeof outcome.effects.heat === 'number' && typeof state.heat === 'number') {
      state.heat = Math.max(0, state.heat + outcome.effects.heat);
    }

    // Reputation
    if (typeof outcome.effects.reputation === 'number' && typeof state.reputation === 'number') {
      state.reputation += outcome.effects.reputation;
    }

    // Player HP
    if (typeof outcome.effects.playerHP === 'number') {
      state.health = Math.max(1, (state.health || 100) + outcome.effects.playerHP);
    }

    // Check crew requirement
    if (typeof outcome.effects.minCrew === 'number') {
      var crewCount = Array.isArray(state.henchmen) ? state.henchmen.length : 0;
      if (crewCount < outcome.effects.minCrew) {
        return { success: false, message: 'Need at least ' + outcome.effects.minCrew + ' crew members' };
      }
    }

    // Permanent benefit
    if (outcome.effects.permanentBenefit) {
      if (!state.namedNPCs.npcBenefits[event.npcId]) {
        state.namedNPCs.npcBenefits[event.npcId] = {};
      }
      state.namedNPCs.npcBenefits[event.npcId][outcome.effects.permanentBenefit] = true;
    }

    // Wire into consequence engine for trait tracking
    if (typeof applyConsequences === 'function') {
      var conseq = {};
      // Infer traits from NPC choice effects
      if (outcome.effects.npcRep > 10) conseq.traits = { charitable: 1 };
      else if (outcome.effects.npcRep < -10) conseq.traits = { ruthless: 1 };
      if (outcome.effects.fear > 0) {
        conseq.traits = conseq.traits || {};
        conseq.traits.feared = 1;
      }
      if (outcome.effects.cash < -5000) {
        conseq.traits = conseq.traits || {};
        conseq.traits.generous = 1;
      }
      if (outcome.effects.permanentBenefit) {
        conseq.message = npc.name + ': You earned "' + outcome.effects.permanentBenefit + '"';
      }
      if (Object.keys(conseq).length > 0) {
        applyConsequences(state, conseq, 'npc_' + event.npcId, outcome.id);
      }
    }
  }

  // Log the outcome
  state.namedNPCs.npcLog.push({
    day: (typeof state.day === 'number') ? state.day : 0,
    npcId: event.npcId,
    chapterId: chapter.id,
    outcomeId: outcome.id
  });

  // Advance chapter
  npcData.currentChapter = event.chapterIndex + 1;
  npcData.outcome = outcome.id;
  npcData.completedChapters.push(chapter.id);
  state.namedNPCs.stats.totalChaptersCompleted++;

  // Check if this was the final chapter
  var isFinalChapter = event.chapterIndex >= npc.chapters.length - 1;
  if (isFinalChapter) {
    // Apply permanent NPC benefits based on relationship
    applyFinalBenefits(state, npc, npcData);
  }

  // Clear active event
  state.namedNPCs.activeNPCEvent = null;

  return {
    success: true,
    npcName: npc.name,
    chapterTitle: chapter.title,
    outcomeLabel: outcome.label,
    result: outcome.result,
    messages: messages,
    isFinalChapter: isFinalChapter,
    relationship: npcData.relationship
  };
}

// ============================================================
// APPLY FINAL BENEFITS
// ============================================================

function applyFinalBenefits(state, npc, npcData) {
  if (npcData.relationship >= 20) {
    if (!state.namedNPCs.npcBenefits[npc.id]) {
      state.namedNPCs.npcBenefits[npc.id] = {};
    }
    // Copy base NPC benefits
    var benefits = npc.benefits;
    for (var key in benefits) {
      if (benefits.hasOwnProperty(key)) {
        state.namedNPCs.npcBenefits[npc.id][key] = benefits[key];
      }
    }
    state.namedNPCs.stats.allies.push(npc.id);
  } else if (npcData.relationship <= -20) {
    state.namedNPCs.stats.enemies.push(npc.id);
  }

  // Track romances
  if (npc.romanceOption && npcData.relationship >= 25) {
    var lastOutcome = npcData.outcome;
    if (lastOutcome === 'romance' || lastOutcome === 'romance_end') {
      state.namedNPCs.stats.romances.push(npc.id);
    }
  }
}

// ============================================================
// DAILY PROCESSING
// ============================================================

function processNPCsDaily(state) {
  if (!state.namedNPCs) state.namedNPCs = initNPCState();

  var messages = [];

  // Don't process if there's already an active event
  if (state.namedNPCs.activeNPCEvent) return messages;

  // Check each NPC for new chapter triggers
  for (var i = 0; i < NAMED_NPCS.length; i++) {
    var npc = NAMED_NPCS[i];
    var npcData = state.namedNPCs.metNPCs[npc.id];

    // Check for unmet NPCs whose first chapter conditions are met
    if (!npcData) {
      if (checkNPCTrigger(state, npc, 0)) {
        // Check location match if player has a location
        if (state.currentLocation && npc.location && npc.location !== state.currentLocation) {
          continue;
        }
        // Random chance to encounter (30% per day when conditions met)
        if (Math.random() < 0.30) {
          var meetResult = meetNPC(state, npc.id);
          if (meetResult.success) {
            messages.push(npc.emoji + ' ' + meetResult.message);
            return messages; // Only one NPC event per day
          }
        }
      }
      continue;
    }

    // Check met NPCs for next chapter
    if (npcData.currentChapter < npc.chapters.length) {
      if (checkNPCTrigger(state, npc, npcData.currentChapter)) {
        // Random chance to trigger next chapter (20% per day)
        if (Math.random() < 0.20) {
          state.namedNPCs.activeNPCEvent = {
            npcId: npc.id,
            chapterIndex: npcData.currentChapter
          };
          var nextChapter = npc.chapters[npcData.currentChapter];
          messages.push(npc.emoji + ' ' + npc.name + ': ' + nextChapter.title);
          return messages; // Only one event per day
        }
      }
    }
  }

  // Process ongoing NPC benefits
  var benefitMessages = processNPCBenefits(state);
  messages = messages.concat(benefitMessages);

  return messages;
}

// ============================================================
// PROCESS ONGOING NPC BENEFITS
// ============================================================

function processNPCBenefits(state) {
  var messages = [];
  var benefits = state.namedNPCs.npcBenefits;

  for (var npcId in benefits) {
    if (!benefits.hasOwnProperty(npcId)) continue;
    var b = benefits[npcId];

    // Dr. Rosa - daily healing
    if (npcId === 'dr_rosa' && b.healing && typeof state.hp === 'number') {
      var maxHP = (typeof state.maxHP === 'number') ? state.maxHP : 100;
      if (state.hp < maxHP) {
        var healAmt = Math.min(b.healing.hpPerDay || 30, maxHP - state.hp);
        state.hp += healAmt;
        if (healAmt > 0) messages.push('\u{1F3E5} Dr. Rosa heals you for ' + healAmt + ' HP');
      }
    }

    // Father Ignacio - sanctuary (no raids in safe area)
    if (npcId === 'father_ignacio' && b.church_sanctuary) {
      if (typeof state.raidChance === 'number') {
        state.raidChance = Math.max(0, state.raidChance - 0.05);
      }
    }

    // Mama Josephine - snitch reduction
    if (npcId === 'mama_josephine' && b.mama_blessing) {
      if (typeof state.snitchChance === 'number') {
        state.snitchChance *= 0.5;
      }
    }

    // Gears - vehicle maintenance cost reduction
    if (npcId === 'gears_rodriguez' && b.vehicleMaintenance) {
      if (typeof state.vehicleMaintenanceCost === 'number') {
        state.vehicleMaintenanceCost *= (b.vehicleMaintenance.costMultiplier || 0.5);
      }
    }

    // Slim Charles - gambling income
    if (npcId === 'slim_charles' && (b.gambling_empire || b.gambling_partial)) {
      var gamblingIncome = b.gambling_empire ? 2000 : 1000;
      if (typeof state.cash === 'number') {
        state.cash += gamblingIncome;
        messages.push('\u{1F3B1} Gambling operations earn $' + gamblingIncome);
      }
    }

    // Ace Williams - scam income
    if (npcId === 'ace_williams' && b.scam_income) {
      var scamIncome = Math.floor(500 + Math.random() * 1000);
      if (typeof state.cash === 'number') {
        state.cash += scamIncome;
      }
    }

    // Sister Maria - stress reduction
    if (npcId === 'sister_maria' && b.moral_compass) {
      if (typeof state.stress === 'number') {
        state.stress = Math.max(0, state.stress - 2);
      }
    }

    // Maria Santos / Destiny - romance stress reduction
    if ((npcId === 'maria_santos' || npcId === 'diamond_destiny' || npcId === 'maria_elena') && (b.maria_romance || b.destiny_romance || b.elena_romance)) {
      if (typeof state.stress === 'number') {
        state.stress = Math.max(0, state.stress - 3);
      }
    }
  }

  return messages;
}

// ============================================================
// GET AGGREGATED NPC BENEFITS
// ============================================================

function getNPCBenefits(state) {
  if (!state.namedNPCs) return {};

  var aggregated = {
    healingPerDay: 0,
    crewRecoveryMultiplier: 1.0,
    noHospitalRecords: false,
    sanctuaryNoRaids: false,
    snitchChanceMultiplier: 1.0,
    vehicleCostMultiplier: 1.0,
    launderingRate: 0,
    weaponsDiscount: 0,
    combatBonus: 0,
    intimidationBonus: 0,
    persuasionBonus: 0,
    investigationSpeedModifier: 0,
    dailyPassiveIncome: 0,
    stressReduction: 0,
    hasDigitalOps: false,
    hasCryptoOps: false,
    hasPortAccess: false,
    hasAirRoutes: false,
    hasEvergladesNetwork: false,
    hasPoliticalCover: false,
    hasMediaControl: false,
    romanceActive: false,
    activeRomances: [],
    activeAllies: [],
    activeEnemies: []
  };

  var benefits = state.namedNPCs.npcBenefits;

  for (var npcId in benefits) {
    if (!benefits.hasOwnProperty(npcId)) continue;
    var b = benefits[npcId];

    // Healing
    if (b.healing) {
      aggregated.healingPerDay += (b.healing.hpPerDay || 0);
      aggregated.crewRecoveryMultiplier = Math.max(aggregated.crewRecoveryMultiplier, b.healing.crewRecoveryMultiplier || 1.0);
    }
    if (b.noHospitalRecords) aggregated.noHospitalRecords = true;

    // Sanctuary
    if (b.church_sanctuary || b.sanctuary) aggregated.sanctuaryNoRaids = true;

    // Snitch reduction
    if (b.mama_blessing) aggregated.snitchChanceMultiplier *= 0.5;
    if (b.mama_curse) aggregated.snitchChanceMultiplier *= 2.0;

    // Vehicle
    if (b.vehicleMaintenance) aggregated.vehicleCostMultiplier *= (b.vehicleMaintenance.costMultiplier || 0.5);

    // Laundering (take best rate)
    if (b.premiumLaundering) aggregated.launderingRate = Math.max(aggregated.launderingRate, b.premiumLaundering.rate || 0);
    if (b.churchLaundering) aggregated.launderingRate = Math.max(aggregated.launderingRate, b.churchLaundering.rate || 0);
    if (b.restaurant_laundering || b.restaurant_empire) aggregated.launderingRate = Math.max(aggregated.launderingRate, 0.88);
    if (b.club_laundering || b.club_full_ops) aggregated.launderingRate = Math.max(aggregated.launderingRate, 0.85);

    // Weapons
    if (b.militaryWeapons) aggregated.weaponsDiscount = Math.max(aggregated.weaponsDiscount, b.militaryWeapons.discount || 0);

    // Combat
    if (b.combatTraining) aggregated.combatBonus += (b.combatTraining.crewCombatBonus || 0);
    if (b.intimidationBonus) aggregated.intimidationBonus += (typeof b.intimidationBonus === 'number' ? b.intimidationBonus : 0);

    // Persuasion
    if (b.persuasionBoost) aggregated.persuasionBonus += (typeof b.persuasionBoost === 'number' ? b.persuasionBoost : 0);

    // Investigation
    if (b.chen_enemy || b.rivera_nemesis) aggregated.investigationSpeedModifier += 0.15;
    if (b.chen_loyal || b.rivera_corrupt) aggregated.investigationSpeedModifier -= 0.15;

    // Passive income
    if (b.gambling_empire) aggregated.dailyPassiveIncome += 2000;
    if (b.gambling_partial) aggregated.dailyPassiveIncome += 1000;
    if (b.scam_income) aggregated.dailyPassiveIncome += 750;
    if (b.fight_clubs) aggregated.dailyPassiveIncome += 500;

    // Stress
    if (b.moral_compass || b.shelter_patron) aggregated.stressReduction += 2;
    if (b.maria_romance || b.destiny_romance || b.elena_romance) {
      aggregated.stressReduction += 3;
      aggregated.romanceActive = true;
      aggregated.activeRomances.push(npcId);
    }
    if (b.maria_conscience) aggregated.stressReduction += 1;

    // Digital
    if (b.digital_ops) aggregated.hasDigitalOps = true;
    if (b.crypto_ops || b.crypto_partial) aggregated.hasCryptoOps = true;

    // Port and air
    if (b.port_access || b.port_selective || b.kingfish_loyal) aggregated.hasPortAccess = true;
    if (b.air_routes || b.doc_pilot) aggregated.hasAirRoutes = true;
    if (b.everglades_network || b.escape_routes) aggregated.hasEvergladesNetwork = true;

    // Political
    if (b.political_machine || b.political_backing || b.davis_elected) aggregated.hasPoliticalCover = true;

    // Media
    if (b.media_weapon || b.media_shield || b.public_hero) aggregated.hasMediaControl = true;
  }

  aggregated.activeAllies = state.namedNPCs.stats.allies.slice();
  aggregated.activeEnemies = state.namedNPCs.stats.enemies.slice();

  return aggregated;
}

// ============================================================
// UTILITY: Get NPC by ID
// ============================================================

function getNPCById(npcId) {
  for (var i = 0; i < NAMED_NPCS.length; i++) {
    if (NAMED_NPCS[i].id === npcId) return NAMED_NPCS[i];
  }
  return null;
}

// ============================================================
// UTILITY: Check if player has a specific permanent NPC benefit
// ============================================================

/**
 * Check if the player has earned a specific permanent benefit from any NPC.
 * @param {object} state - The game state
 * @param {string} benefitId - The benefit identifier (e.g. 'full_medical', 'church_sanctuary', 'mama_blessing')
 * @returns {boolean} True if the player has the specified benefit
 */
function hasNPCBenefit(state, benefitId) {
  if (!state.namedNPCs || !state.namedNPCs.npcBenefits) return false;
  var benefits = state.namedNPCs.npcBenefits;
  for (var npcId in benefits) {
    if (!benefits.hasOwnProperty(npcId)) continue;
    var npcBenefits = benefits[npcId];
    if (npcBenefits && npcBenefits[benefitId]) return true;
  }
  return false;
}

// ============================================================
// UTILITY: Get active NPC event details for UI
// ============================================================

function getActiveNPCEvent(state) {
  if (!state.namedNPCs || !state.namedNPCs.activeNPCEvent) return null;

  var event = state.namedNPCs.activeNPCEvent;
  var npc = getNPCById(event.npcId);
  if (!npc) return null;

  var chapter = npc.chapters[event.chapterIndex];
  if (!chapter) return null;

  var npcData = state.namedNPCs.metNPCs[event.npcId];

  return {
    npcId: npc.id,
    npcName: npc.name,
    npcEmoji: npc.emoji,
    npcRole: npc.role,
    chapterIndex: event.chapterIndex,
    chapterTitle: chapter.title,
    description: chapter.description,
    outcomes: chapter.outcomes.map(function(o) {
      return { id: o.id, label: o.label };
    }),
    relationship: npcData ? npcData.relationship : 0,
    totalChapters: npc.chapters.length
  };
}

// ============================================================
// UTILITY: Get all met NPC summaries
// ============================================================

function getMetNPCSummaries(state) {
  if (!state.namedNPCs) return [];

  var summaries = [];
  var metNPCs = state.namedNPCs.metNPCs;

  for (var npcId in metNPCs) {
    if (!metNPCs.hasOwnProperty(npcId)) continue;
    var npc = getNPCById(npcId);
    if (!npc) continue;

    var data = metNPCs[npcId];
    summaries.push({
      id: npcId,
      name: npc.name,
      emoji: npc.emoji,
      role: npc.role,
      location: npc.location,
      relationship: data.relationship,
      fear: data.fear,
      chaptersCompleted: data.completedChapters.length,
      totalChapters: npc.chapters.length,
      isComplete: data.currentChapter >= npc.chapters.length,
      isAlly: data.relationship >= 20,
      isEnemy: data.relationship <= -20,
      hasActiveBenefits: !!state.namedNPCs.npcBenefits[npcId]
    });
  }

  return summaries;
}

// ============================================================
// UI BRIDGE FUNCTIONS
// These connect the NPC system to the game-ui.js render functions
// ============================================================

/**
 * Called by renderNPCStory() in game-ui.js when player makes a choice.
 * Wraps resolveNPCOutcome and sets resolved state for UI display.
 */
function resolveNPCStoryChoice(state, outcomeIndex) {
  if (!state.namedNPCs) return;
  var event = state.namedNPCs.activeNPCEvent;
  if (!event) return;

  var result = resolveNPCOutcome(state, outcomeIndex);
  if (result && result.success) {
    // Set up resolved state for the UI to show result before dismiss
    state.npcStory = {
      resolved: true,
      resultText: result.result || 'The story continues...',
      npc: getNPCById(event.npcId) || {},
      chapter: { title: result.chapterTitle },
      outcome: result.outcomeLabel
    };
  }
}

/**
 * Called by renderNPCStory() in game-ui.js to dismiss the resolved NPC story.
 */
function dismissNPCStory(state) {
  state.npcStory = null;
  if (state.namedNPCs) {
    state.namedNPCs.activeNPCEvent = null;
  }
}

/**
 * Helper: Get active NPC story data formatted for the UI.
 * Called during render to populate the NPC story screen.
 */
function getActiveNPCStoryForUI(state) {
  if (state.npcStory && state.npcStory.resolved) return state.npcStory;
  if (!state.namedNPCs || !state.namedNPCs.activeNPCEvent) return null;

  var event = state.namedNPCs.activeNPCEvent;
  var npc = getNPCById(event.npcId);
  if (!npc) return null;

  var chapter = npc.chapters[event.chapterIndex];
  if (!chapter) return null;

  return {
    npc: npc,
    chapter: chapter,
    choices: chapter.outcomes || [],
    resolved: false
  };
}
