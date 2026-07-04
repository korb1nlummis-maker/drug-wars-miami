// ============================================================
// Drug Wars: Miami Vice Edition — Romance System
// ============================================================

const ROMANCE_NPCS = [
  {
    id: 'valentina',
    name: 'Valentina Cruz',
    emoji: '💃',
    background: 'Cuban dancer',
    meetLocation: 'clubs',
    personality: { primary: 'passionate', secondary: 'jealous' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.05 },
      serious: { safeHouse: true, stressReduction: 0.20 },
      partner: { stressReduction: 0.30, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'jewelry',
    jealousyFactor: 1.5,
    description: 'Fiery Havana-born performer. She dances at Mango\'s and sees everything.'
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Chen',
    emoji: '👩‍⚕️',
    background: 'ER doctor',
    meetLocation: 'hospital',
    personality: { primary: 'caring', secondary: 'curious' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.03 },
      serious: { freeHealing: true, firstAid: true, safeHouse: true },
      partner: { freeHealing: true, firstAid: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'books',
    jealousyFactor: 0.8,
    description: 'Brilliant trauma surgeon at Jackson Memorial. Asks too many questions about your injuries.'
  },
  {
    id: 'nina',
    name: 'Nina Volkov',
    emoji: '🕶️',
    background: 'Russian model',
    meetLocation: 'private_party',
    personality: { primary: 'ambitious', secondary: 'cold' },
    benefits: {
      dating: { stressReduction: 0.05, repBonus: 0.10, intelChance: 0.05 },
      serious: { repBonus: 0.20, internationalContacts: true, safeHouse: true },
      partner: { repBonus: 0.20, internationalContacts: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'designer',
    jealousyFactor: 1.2,
    description: 'Ice-cold Moscow beauty. Connected to oligarchs and fashion moguls alike.'
  },
  {
    id: 'carmen',
    name: 'Carmen Reyes',
    emoji: '⚖️',
    background: 'Criminal lawyer',
    meetLocation: 'court',
    personality: { primary: 'smart', secondary: 'cautious' },
    benefits: {
      dating: { stressReduction: 0.10, intelChance: 0.08 },
      serious: { legalDefense: true, sentenceReduction: 0.50, safeHouse: true },
      partner: { legalDefense: true, sentenceReduction: 0.75, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'wine',
    jealousyFactor: 0.6,
    description: 'Coral Gables attorney who defends the city\'s worst. She knows everyone\'s secrets.'
  },
  {
    id: 'jade',
    name: 'Jade Williams',
    emoji: '📰',
    background: 'Investigative journalist',
    meetLocation: 'random',
    personality: { primary: 'tenacious', secondary: 'principled' },
    benefits: {
      dating: { stressReduction: 0.05, intelChance: 0.15 },
      serious: { plantStory: true, killStory: true, intelChance: 0.25, safeHouse: true },
      partner: { plantStory: true, killStory: true, intelChance: 0.30, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'experiences',
    jealousyFactor: 0.5,
    description: 'Miami Herald reporter chasing the drug trade story. Dangerous to love, dangerous to lose.'
  },
  {
    id: 'isabella',
    name: 'Isabella Torres',
    emoji: '🎵',
    background: 'Club owner',
    meetLocation: 'nightlife',
    personality: { primary: 'business-minded', secondary: 'loyal' },
    benefits: {
      dating: { stressReduction: 0.10, nightlifeDiscount: 0.15, intelChance: 0.05 },
      serious: { laundering: true, nightlifeDiscount: 0.30, safeHouse: true },
      partner: { laundering: true, nightlifeDiscount: 0.50, nightlifeBonus: true, paranoiaImmunity: true, safeHouse: true }
    },
    giftPreference: 'art',
    jealousyFactor: 1.0,
    description: 'Owner of three clubs on South Beach. Business first, but loyalty runs deep.'
  }
];

const RELATIONSHIP_STAGES = ['stranger', 'acquaintance', 'dating', 'serious', 'partner'];

const STAGE_THRESHOLDS = {
  acquaintance: 30,
  dating: 90,
  serious: 180,
  partner: 300
};

const GIFT_PREFERENCES = {
  jewelry: { base: 1.0, matchBonus: 1.5 },
  books: { base: 0.8, matchBonus: 1.8 },
  designer: { base: 1.2, matchBonus: 1.4 },
  wine: { base: 0.9, matchBonus: 1.6 },
  experiences: { base: 0.7, matchBonus: 2.0 },
  art: { base: 1.1, matchBonus: 1.5 }
};

const DATE_TIERS = [
  { name: 'Casual coffee', cost: 1000, relationshipGain: 3, stressRelief: 5 },
  { name: 'Dinner at Prime 112', cost: 3000, relationshipGain: 5, stressRelief: 8 },
  { name: 'Weekend in the Keys', cost: 5000, relationshipGain: 8, stressRelief: 12 },
  { name: 'Yacht party', cost: 10000, relationshipGain: 12, stressRelief: 18 }
];

const ROMANCE_EVENTS = [
  { id: 'kidnapped', stage: 'dating', chance: 0.02, description: 'Rivals have taken her hostage.' },
  { id: 'discovers_truth', stage: 'dating', chance: 0.05, description: 'She found your stash.' },
  { id: 'turned_informant', stage: 'serious', chance: 0.03, description: 'The feds got to her.' },
  { id: 'ultimatum', stage: 'serious', chance: 0.04, description: 'Choose: her or the game.' },
  { id: 'jealousy', stage: 'dating', chance: 0.08, description: 'She found out about someone else.' },
  { id: 'threatened', stage: 'acquaintance', chance: 0.03, description: 'A rival faction sent a warning through her.' }
];

const DECAY_INTERVAL = 3;
const DECAY_AMOUNT = 1;
const NEGLECT_THRESHOLD = 30;   // days without contact before a serious/partner relationship hits crisis
const NEGLECT_BREAKUP_DAYS = 40; // past this, she may simply walk

// ---- Per-NPC Partner Perks (partner stage passive bonuses, human-readable) ----

const PARTNER_PERKS = {
  valentina: { name: 'Corazón de Miami', emoji: '💃', desc: '-30% stress from all sources, immune to paranoia. Her Little Havana apartment is a safe house.' },
  sarah: { name: 'Private Trauma Ward', emoji: '👩‍⚕️', desc: 'Free healing and first aid after every fight. No hospital bills, no police reports.' },
  nina: { name: 'International Cachet', emoji: '🕶️', desc: '+20% reputation gains and access to international contacts abroad.' },
  carmen: { name: 'Counsel on Retainer', emoji: '⚖️', desc: 'Free legal defense and -75% prison sentences. The DA hates her.' },
  jade: { name: 'The Press Machine', emoji: '📰', desc: 'Plant or kill news stories at will. +30% street intel.' },
  isabella: { name: 'The Wash', emoji: '🎵', desc: 'Launder money through her clubs. -50% nightlife costs, VIP everywhere on South Beach.' },
};

// ---- Per-NPC Story Beats ----
// Unique relationship events that fire when points cross thresholds
// (roughly at the dating / serious / partner transitions).
// Each has 2-3 choices with real consequences: points, cash, heat, health, breakup risk.

const ROMANCE_STORY_BEATS = {
  valentina: [
    {
      id: 'val_family', minPoints: 90, title: 'La Familia Cruz',
      description: 'Valentina invites you to Sunday dinner in Hialeah. Her abuela, three aunts, and a very suspicious older brother will all be judging you over ropa vieja.',
      choices: [
        { id: 'rum', label: '🥃 Bring 20-year Havana Club', hint: '-$3,000, big impression', effects: { points: 12, cash: -3000 }, resultText: 'Her abuela declares you "un caballero." Valentina beams all night.' },
        { id: 'honest', label: '🗣️ Charm them, dodge the job questions', hint: 'Safe, small gain', effects: { points: 5 }, resultText: 'You survive the interrogation. Her brother still watches you, but Valentina squeezes your hand under the table.' },
        { id: 'skip', label: '🚪 Skip it — business comes first', hint: 'She won\'t forget this', effects: { points: -12 }, breakupChance: 0.10, resultText: 'She doesn\'t call for days. "My family asked where you were. I had no answer."' },
      ],
    },
    {
      id: 'val_jealousy', minPoints: 180, title: 'Green-Eyed Storm',
      description: 'Valentina saw you leaving the club with a beautiful stranger on your arm — a buyer\'s courier, but she doesn\'t know that. She\'s throwing your things off the balcony.',
      choices: [
        { id: 'truth', label: '💬 Tell her the truth about the business', hint: 'Risky honesty, +heat', effects: { points: 10, heat: 3 }, resultText: 'She goes quiet. "So you are that kind of man. At least you didn\'t lie to me." She knows too much now.' },
        { id: 'diamonds', label: '💎 Diamonds say sorry better', hint: '-$10,000', effects: { points: 15, cash: -10000 }, resultText: 'The earrings catch the light. "You are lucky I love beautiful things almost as much as I hate liars."' },
        { id: 'dismiss', label: '🙄 Tell her she\'s being crazy', hint: 'High breakup risk', effects: { points: -18 }, breakupChance: 0.25, resultText: '"Crazy? CRAZY?!" The rest of your clothes hit the pavement.' },
      ],
    },
    {
      id: 'val_studio', minPoints: 300, title: 'Her Own Stage',
      description: 'Valentina wants to stop dancing for other people. She\'s found a space on Calle Ocho for her own dance studio — she needs $50,000 and someone who believes in her.',
      choices: [
        { id: 'fund', label: '💰 Fund the whole studio', hint: '-$50,000, she\'s yours forever', effects: { points: 25, cash: -50000 }, resultText: '"Estudio Valentina" opens in a month. She cries when she gets the keys. You\'ve never seen her dance like this.' },
        { id: 'partial', label: '🤝 Co-sign, she earns the rest', hint: '-$15,000, respects her hustle', effects: { points: 12, cash: -15000 }, resultText: 'She works doubles for six months to make her half. The studio means more because it\'s truly hers.' },
        { id: 'refuse', label: '❌ Dancing pays fine already', hint: 'Kills the dream', effects: { points: -15 }, breakupChance: 0.15, resultText: 'Something dims in her eyes. She keeps dancing at Mango\'s — and stops talking about the future.' },
      ],
    },
  ],
  sarah: [
    {
      id: 'sarah_gsw', minPoints: 90, title: 'Off the Books',
      description: 'You show up at Sarah\'s door at 3 AM with a graze wound you can\'t take to a hospital. She stitches you up in her kitchen without a word — then sets down the needle and asks for the truth.',
      choices: [
        { id: 'truth', label: '🗣️ Tell her what you really do', hint: 'She may respect honesty', effects: { points: 12, heat: 2 }, resultText: '"I patch up guys like you every week. I just never dated one." She doesn\'t run. That means something.' },
        { id: 'lie', label: '🤥 "Mugging gone wrong"', hint: 'She\'s not stupid', effects: { points: -8 }, breakupChance: 0.05, resultText: 'She nods slowly, the way she nods at patients who lie about how much they drink. The distance between you grows.' },
        { id: 'deflect', label: '😏 "Would you believe a shark bite?"', hint: 'Charm, small gain', effects: { points: 4 }, resultText: 'She laughs despite herself. "You\'re impossible." The question hangs there, unanswered — for now.' },
      ],
    },
    {
      id: 'sarah_ethics', minPoints: 180, title: 'The Board Inquiry',
      description: 'Jackson Memorial\'s board is investigating missing surgical supplies — supplies Sarah used patching up you and your crew. She could lose her license.',
      choices: [
        { id: 'lawyer', label: '⚖️ Quietly hire her the best lawyer', hint: '-$15,000', effects: { points: 15, cash: -15000 }, resultText: 'The inquiry evaporates. She never asks how. "I know it was you," she says, and kisses you anyway.' },
        { id: 'confess', label: '🎯 Take the blame — anonymous tip that "a dealer" coerced her', hint: '+heat, saves her clean', effects: { points: 8, heat: 8 }, resultText: 'The board pities her instead of punishing her. The DEA opens a file on the anonymous dealer. Worth it.' },
        { id: 'distance', label: '🚶 Stay out of it — she made her choices', hint: 'Cold. She notices.', effects: { points: -14 }, breakupChance: 0.15, resultText: 'She survives the inquiry alone. "When it mattered, you weren\'t there." Something breaks that stitches can\'t fix.' },
      ],
    },
    {
      id: 'sarah_brother', minPoints: 300, title: 'Family Emergency',
      description: 'Sarah\'s younger brother OD\'d on product — maybe even yours. He\'s stable, but she\'s shattered. She looks at you like she\'s seeing the whole supply chain for the first time.',
      choices: [
        { id: 'rehab', label: '🏥 Put him in the best private rehab in Florida', hint: '-$25,000', effects: { points: 22, cash: -25000 }, resultText: 'Ninety days later he\'s clean and enrolled at FIU. Sarah holds you at the graduation. "You saved him. Don\'t you dare tell me you\'re a bad man."' },
        { id: 'dealer', label: '🔫 Find whoever sold to him and shut them down', hint: '+heat, -health, she may not want this', effects: { points: 10, heat: 8, health: -10 }, resultText: 'The dealer leaves Miami with a limp. Sarah doesn\'t ask about your bruised knuckles. She just holds your hand tighter.' },
        { id: 'cold', label: '🧊 "Addicts make their own choices"', hint: 'Devastating', effects: { points: -25 }, breakupChance: 0.30, resultText: 'She stares at you like you\'re a stranger. "That\'s my BROTHER." The door slams hard enough to crack the frame.' },
      ],
    },
  ],
  nina: [
    {
      id: 'nina_oligarch', minPoints: 90, title: 'The Ex From Moscow',
      description: 'At a Star Island party, Nina\'s ex — a Russian oligarch with three bodyguards — puts his hand on her waist and tells you, smiling, that "the girl comes back eventually. They always do."',
      choices: [
        { id: 'stare', label: '🥶 Stare him down and walk her out', hint: '+heat, she loves nerve', effects: { points: 12, heat: 5 }, resultText: 'His bodyguards tense; you don\'t blink. In the car Nina laughs for the first time all night. "Dmitri is not used to \'no.\' I liked watching him learn."' },
        { id: 'outclass', label: '🍾 Buy the whole table Cristal and toast his health', hint: '-$20,000, ice-cold power move', effects: { points: 14, cash: -20000 }, resultText: 'You out-oligarch the oligarch. Nina\'s smile could freeze the pool. "Now THAT is how it\'s done, darling."' },
        { id: 'retreat', label: '🚪 Leave quietly — not worth the trouble', hint: 'She notices weakness', effects: { points: -10 }, resultText: '"You let him win," she says flatly in the car. Nina Volkov does not date men who retreat.' },
      ],
    },
    {
      id: 'nina_visa', minPoints: 180, title: 'Ninety Days',
      description: 'Nina\'s visa renewal was denied — someone with connections wants her deportable and dependent. She has ninety days, immigration lawyers cost a fortune, and she\'d rather die than ask Dmitri.',
      choices: [
        { id: 'lawyers', label: '⚖️ Hire the top immigration firm in Miami', hint: '-$30,000', effects: { points: 16, cash: -30000 }, resultText: 'Green card approved. Nina, who never cries, doesn\'t cry — but she holds your arm differently now. Like it\'s permanent.' },
        { id: 'forger', label: '📄 Your document guy can fix this faster', hint: '+heat, favors owed', effects: { points: 10, heat: 6 }, resultText: 'Paperwork appears. Nina examines the seal and raises an eyebrow. "Useful man. Perhaps I keep you."' },
        { id: 'hands_off', label: '🤷 She\'s resourceful — she\'ll manage', hint: 'Coldness cuts both ways', effects: { points: -12 }, breakupChance: 0.10, resultText: 'She manages — by taking a "modeling contract" from a man you hate. She never mentions it. That\'s worse.' },
      ],
    },
    {
      id: 'nina_secret', minPoints: 300, title: 'The Volkov File',
      description: 'You find a hidden ledger in Nina\'s penthouse: for two years she\'s been passing information about Miami players to a Bratva contact — including notes about you. Old notes. They stop around the time she fell for you.',
      choices: [
        { id: 'confront', label: '💬 Confront her — demand she cuts the tie', hint: 'Make her choose', effects: { points: 18, heat: 2 }, breakupChance: 0.10, resultText: '"I stopped reporting on you months ago. Look at the dates." She burns the ledger in the sink. "There. Now I am only yours. Never ask again."' },
        { id: 'pipeline', label: '🕸️ Use her pipeline — feed the Bratva what YOU want them to know', hint: '+$25,000, +heat, dangerous game', effects: { points: 8, cash: 25000, heat: 10 }, resultText: 'Disinformation flows east; rubles flow back. Nina is impressed and slightly terrified. "You are worse than me. Good."' },
        { id: 'walk', label: '🚪 You can\'t trust a spy. Walk away.', hint: 'Ends it, guaranteed', effects: { points: 0 }, breakupChance: 1.0, resultText: 'She doesn\'t beg. Volkovs don\'t beg. But at the door she says quietly: "The reports stopped because of you. Remember that."' },
      ],
    },
  ],
  carmen: [
    {
      id: 'carmen_da', minPoints: 90, title: 'Dinner With the Enemy',
      description: 'At Joe\'s Stone Crab, an assistant DA "coincidentally" stops by your table, all smiles, and asks Carmen how long she\'s been seeing her mystery man. He knows your face.',
      choices: [
        { id: 'cool', label: '😎 Play the charming boyfriend, reveal nothing', hint: 'Safe, smooth', effects: { points: 8 }, resultText: 'You discuss stone crabs and the Dolphins. The ADA leaves with nothing. Carmen exhales. "You\'re better at this than half my clients."' },
        { id: 'pressure', label: '🕵️ Have someone dig up dirt on the ADA later', hint: '+heat, insurance', effects: { points: 5, heat: 8 }, resultText: 'Two weeks later the ADA transfers to Orlando. Carmen doesn\'t ask. Lawyers know when not to ask.' },
        { id: 'confess', label: '💬 Come clean to Carmen about everything, tonight', hint: 'She may already know', effects: { points: 14 }, breakupChance: 0.10, resultText: '"I\'m a criminal defense attorney in Miami. I did your background check after the first date." She sips her wine. "Took you long enough to say it."' },
      ],
    },
    {
      id: 'carmen_client', minPoints: 180, title: 'Conflict of Interest',
      description: 'Carmen\'s newest client is your biggest rival — and a good retainer. Defending him means learning things about your operation from the other side. She tells you before taking the case. Professional courtesy.',
      choices: [
        { id: 'drop', label: '🚫 Ask her to drop him', hint: 'She hates being told what to do', effects: { points: 10 }, breakupChance: 0.10, resultText: 'A long silence. "For you. Once. Never make me choose between you and my practice again." She refers him to a worse lawyer. Pity.' },
        { id: 'respect', label: '🤝 Respect the work — everyone deserves counsel', hint: 'She values this', effects: { points: 12 }, resultText: '"Most men would have made it a fight." She takes the case, builds a wall between work and home, and loves you more for trusting her.' },
        { id: 'buyout', label: '💰 Put her firm on YOUR retainer first — exclusivity', hint: '-$40,000', effects: { points: 14, cash: -40000 }, resultText: 'Reyes & Associates now has one criminal client: you. Carmen frames the retainer agreement. "Best conflict check I ever ran."' },
      ],
    },
    {
      id: 'carmen_disbar', minPoints: 300, title: 'The Bar Complaint',
      description: 'The Florida Bar has opened an ethics investigation into Carmen — someone reported her relationship with a "known trafficking suspect." Her license, her whole identity, is on the line because of you.',
      choices: [
        { id: 'defense', label: '⚖️ Fund the best ethics defense money can buy', hint: '-$75,000', effects: { points: 24, cash: -75000 }, resultText: 'Complaint dismissed with prejudice. Carmen finds out about the defense fund and doesn\'t speak for a day. Then: "Nobody has ever fought for me before. I fight for people. Nobody fights for me."' },
        { id: 'evidence', label: '🔥 Make the complainant\'s evidence disappear', hint: '+heat, she must never know', effects: { points: 12, heat: 12 }, resultText: 'The file vanishes; the complaint collapses. Carmen suspects — she\'s too smart not to — but chooses not to know. That choice costs her something.' },
        { id: 'distance', label: '💔 Suggest you two cool it until this blows over', hint: 'Practical. Fatal.', effects: { points: -18 }, breakupChance: 0.30, resultText: '"I risk everything for you, and your solution is to leave?" She wins the case alone and files you under closed matters.' },
      ],
    },
  ],
  jade: [
    {
      id: 'jade_story', minPoints: 90, title: 'Page One',
      description: 'Jade\'s editor wants a series on Miami\'s new drug networks. Her draft describes an "unnamed rising distributor" that anyone in the game would recognize as you. She shows you the draft first. That\'s the test.',
      choices: [
        { id: 'quote', label: '🎙️ Give her an anonymous inside quote — make it a better story', hint: '+heat, she\'ll love it', effects: { points: 12, heat: 5 }, resultText: 'The series wins a state press award. Your quote — "Miami doesn\'t have a drug problem, it has a drug economy" — gets framed above her desk.' },
        { id: 'kill', label: '🚫 Ask her to kill the story', hint: 'Asking a journalist to die', effects: { points: -6 }, breakupChance: 0.10, resultText: 'She runs a gutted version. "You asked me to be less than I am. Don\'t do that again." The trust bruises but doesn\'t break.' },
        { id: 'publish', label: '📰 Tell her to run it exactly as written', hint: '+heat, ultimate respect', effects: { points: 8, heat: 8 }, resultText: 'It runs. The DEA clips it for their file. Jade looks at you differently now — like a man who isn\'t afraid of the truth. That\'s rarer than money.' },
      ],
    },
    {
      id: 'jade_source', minPoints: 180, title: 'Dead Air',
      description: 'Jade\'s best source — a dock worker feeding her cartel intel — turns up in a canal. She\'s not crying; she\'s shaking with rage. And for the first time, she\'s asking herself if the man she loves belongs to the same machine.',
      choices: [
        { id: 'comfort', label: '🫂 Stay with her, tell her what you can', hint: 'Vulnerability, +heat', effects: { points: 14, heat: 3 }, resultText: 'You talk until 4 AM — about the game, the bodies, the lines you have and haven\'t crossed. "You\'re the only honest criminal in Miami," she whispers.' },
        { id: 'investigate', label: '🔍 Find who did it — give her the killer\'s name', hint: '-health, +heat, justice', effects: { points: 18, heat: 6, health: -10 }, resultText: 'It takes two weeks and costs you blood, but the name lands on her desk with evidence attached. The exposé destroys a cartel cell. She never asks where it came from. She knows.' },
        { id: 'stonewall', label: '🧱 "Don\'t look into it. I mean it."', hint: 'Protective — she\'ll hate it', effects: { points: -12 }, breakupChance: 0.15, resultText: '"Did you just tell a journalist to stop asking questions?" She investigates anyway, alone and unprotected. You lose sleep. She loses respect.' },
      ],
    },
    {
      id: 'jade_expose', minPoints: 300, title: 'The Story of the Year',
      description: 'Jade lays a folder on the table. Two years of work: shipping routes, front businesses, your face in surveillance photos. Enough to end you. "I need you to know I could publish this. And I need to know who I am if I don\'t."',
      choices: [
        { id: 'love', label: '❤️ "Publish it or marry me. Your call."', hint: 'All in — she decides everything', effects: { points: 25 }, breakupChance: 0.20, resultText: 'She burns the folder on the balcony grill, crying and laughing at once. "Worst journalist in America," she says into your chest. "Best decision I ever made."' },
        { id: 'trade', label: '📁 Give her a bigger story — your rival\'s entire operation', hint: '+heat on rivals, pragmatic', effects: { points: 14, heat: 4 }, resultText: 'The exposé takes down a rival network and makes her career. Your folder goes into a safe deposit box — insurance, she calls it. Romance, Miami-style.' },
        { id: 'threaten', label: '🔫 Remind her what happens to people with folders like that', hint: 'Unforgivable', effects: { points: -40 }, breakupChance: 1.0, resultText: 'She goes very still. "There he is. The real one." She leaves the folder — a copy, obviously — and walks out. Watch the papers.' },
      ],
    },
  ],
  isabella: [
    {
      id: 'isa_shakedown', minPoints: 90, title: 'Protection Racket',
      description: 'A crew from Overtown is squeezing Isabella\'s smallest club — smashed bottles, scared staff, ten grand a month "insurance." She mentions it flatly over dinner, watching to see what kind of man you are.',
      choices: [
        { id: 'muscle', label: '💪 Handle it personally tonight', hint: '-health, she sees your worth', effects: { points: 14, health: -10, heat: 4 }, resultText: 'The crew\'s leader apologizes to her in person, holding his ribs. Isabella pours you a drink from her private bottle. "Good help is so hard to find. Good men, harder."' },
        { id: 'payoff', label: '💵 Pay them off quietly — no blood near her business', hint: '-$15,000, pragmatic', effects: { points: 8, cash: -15000 }, resultText: 'Money changes hands; the crew moves on. Isabella finds out anyway — she always finds out. "You bought me peace. I don\'t forget debts."' },
        { id: 'ignore', label: '🤷 "That\'s the cost of business, bella"', hint: 'She solves her own problems', effects: { points: -10 }, resultText: 'She handles it herself with two off-duty cops and a Rolodex. Efficient. But she stops mentioning her problems to you — and that silence is expensive.' },
      ],
    },
    {
      id: 'isa_partnership', minPoints: 180, title: 'Silent Partner',
      description: 'Isabella slides a proposal across the table: 30% of her new flagship club on Collins Avenue for $60,000. "Business and pleasure make bad partners," she says. "Prove the exception."',
      choices: [
        { id: 'invest', label: '💰 Buy in — full partners', hint: '-$60,000, deepest trust', effects: { points: 18, cash: -60000 }, resultText: 'Club Ossessione opens to a line around the block. Your money washes through it like moonlight. Business AND pleasure. She was wrong, deliciously.' },
        { id: 'decline', label: '🥂 Decline gracefully — keep love and money separate', hint: 'She half-respects it', effects: { points: 5 }, resultText: '"Sensible," she says, disappointed and slightly relieved. The club thrives without you. You\'ll always wonder.' },
        { id: 'lowball', label: '📉 Counter at $30K for the same stake', hint: 'Insulting her math', effects: { points: -10 }, resultText: 'Her smile doesn\'t move but the temperature drops. "I run three clubs, tesoro. I know what things cost. Including this conversation."' },
      ],
    },
    {
      id: 'isa_fire', minPoints: 300, title: 'Ashes on Collins Avenue',
      description: '3 AM: Isabella\'s flagship club is burning. Arson — a message from someone who wants her territory or wants to hurt you through her. She stands across the street watching it burn, dry-eyed, doing arithmetic.',
      choices: [
        { id: 'rebuild', label: '🏗️ Rebuild it bigger — whatever it costs', hint: '-$100,000', effects: { points: 25, cash: -100000 }, resultText: 'The new club is twice the size with your initials worked into the mosaic floor. Opening night she takes the mic: "To the only man in Miami who builds instead of burns."' },
        { id: 'revenge', label: '🔥 Find the torch. Return the message.', hint: '+heat, she understands vendetta', effects: { points: 15, heat: 15 }, resultText: 'Two weeks later a rival\'s warehouse burns with nothing living inside it. Isabella reads the paper over espresso. "Sicilian rules. My grandmother would have loved you."' },
        { id: 'insurance', label: '📋 Help her make the insurance claim... generous', hint: '+$40,000 split, +heat, cynical', effects: { points: 6, cash: 40000, heat: 5 }, resultText: 'The adjuster never stood a chance. You split the overage. It\'s profitable — but she notices you saw her tragedy as an angle. Filed away.' },
      ],
    },
  ],
};

// ---- State ----

function initRomanceState() {
  return {
    relationships: {},
    activeDate: null,
    totalDates: 0,
    heartbreaks: 0,
    gifts: {},
    daysSinceContact: {}
  };
}

// ---- Daily Processing ----

function processRomanceDaily(state, currentDay) {
  const rom = state.romance;
  if (!rom || !rom.relationships) return [];
  if (typeof currentDay !== 'number') currentDay = state.day || state._currentDay || 0;
  if (!rom.daysSinceContact) rom.daysSinceContact = {};
  const msgs = [];

  for (const npcId of Object.keys(rom.relationships)) {
    const rel = rom.relationships[npcId];
    if (rel.stage === 'stranger') continue;
    const npcDef = ROMANCE_NPCS.find(function(n) { return n.id === npcId; });
    const npcName = npcDef ? npcDef.name : npcId;

    // daysSinceContact now ACCUMULATES (reset only by actual contact),
    // so long-neglect checks (30+ days) actually work.
    rom.daysSinceContact[npcId] = (rom.daysSinceContact[npcId] || 0) + 1;
    const daysSince = rom.daysSinceContact[npcId];

    if (daysSince > 0 && daysSince % DECAY_INTERVAL === 0) {
      rel.points = Math.max(0, rel.points - DECAY_AMOUNT);

      const prevStage = rel.stage;
      rel.stage = calculateStage(rel.points);
      if (RELATIONSHIP_STAGES.indexOf(rel.stage) < RELATIONSHIP_STAGES.indexOf(prevStage)) {
        rel.stageDropped = true;
        msgs.push('💔 Things are cooling off with ' + npcName + '. (' + prevStage + ' → ' + rel.stage + ')');
      }
    }

    // Reset the neglect-crisis latch once you're back in touch
    if (daysSince < NEGLECT_THRESHOLD) rel.neglectFired = false;

    // Full commitment latches the Family First story flag
    if ((rel.stage === 'partner' || rel.hasKids) && typeof setCampaignFlag === 'function') {
      setCampaignFlag(state, 'choseFamily', true);
    }

    processJealousy(rom, npcId);

    // --- Story beats: unique per-NPC events fire when points cross thresholds ---
    if (!rel.pendingEvent) {
      const beatEvent = checkStoryBeatTrigger(rom, npcId);
      if (beatEvent) {
        msgs.push('💕 ' + npcName + ': "' + beatEvent.title + '" — she needs to see you. Check Relationships.');
      }
    }

    // --- Neglect crisis: serious/partner relationships you've ghosted for 30+ days ---
    if (!rel.pendingEvent && RELATIONSHIP_STAGES.indexOf(rel.stage) >= 3 &&
        daysSince >= NEGLECT_THRESHOLD && !rel.neglectFired && !rel.hasKids) {
      rel.neglectFired = true;
      rel.pendingEvent = makeNeglectEvent(npcId, daysSince);
      msgs.push('⚠️ ' + npcName + ' hasn\'t heard from you in ' + daysSince + ' days. This is a problem.');
    }

    // Ignore the crisis long enough and she may simply walk
    if (rel.neglectFired && daysSince >= NEGLECT_BREAKUP_DAYS && !rel.hasKids &&
        RELATIONSHIP_STAGES.indexOf(rel.stage) >= 3 && Math.random() < 0.08) {
      rom.heartbreaks = (rom.heartbreaks || 0) + 1;
      delete rom.relationships[npcId];
      delete rom.daysSinceContact[npcId];
      msgs.push('💔 ' + npcName + ' is gone. Her key is in an envelope. No note. ' + daysSince + ' days of silence was the note.');
      continue;
    }

    if (!rel.pendingEvent) {
      const event = checkRomanceEvent(rom, npcId);
      if (event) {
        rel.pendingEvent = event;
        msgs.push('💕 Something\'s happening with ' + npcName + ' — check Relationships.');
      }
    }

    // === LIFE EVENTS: Kids, Pregnancy, Divorce ===
    var npc = ROMANCE_NPCS.find(function(n) { return n.id === npcId; });
    if (!npc) continue;

    // Partner stage: chance of pregnancy (1% per day)
    if (rel.stage === 'partner' && !rel.pregnant && Math.random() < 0.01) {
      rel.pregnant = true;
      rel.pregnancyDay = currentDay;
      rel.pendingEvent = { id: 'pregnancy', npcId: npcId, triggered: true,
        description: npc.name + ' tells you she\'s pregnant. Your life is about to change.' };
    }

    // Pregnancy → birth after 90 days
    if (rel.pregnant && currentDay - (rel.pregnancyDay || 0) >= 90) {
      rel.pregnant = false;
      rel.hasKids = true;
      rel.kidsCount = (rel.kidsCount || 0) + 1;
      // Add child to game state
      if (state.relationships && state.relationships.children) {
        var childNames = ['Junior', 'Maria', 'Diego', 'Isabella', 'Carlos', 'Sofia', 'Miguel', 'Valentina'];
        state.relationships.children.push({
          name: childNames[Math.floor(Math.random() * childNames.length)],
          motherId: npcId,
          motherName: npc.name,
          birthDay: currentDay,
        });
      }
      rel.pendingEvent = { id: 'child_born', npcId: npcId, triggered: true,
        description: 'Your child is born! ' + npc.name + ' expects you to provide. Child support: $500/day.' };
    }

    // Neglected partner with kids → divorce threat (30+ days no contact)
    if (rel.hasKids && rom.daysSinceContact[npcId] > 30 && !rel.divorced) {
      if (Math.random() < 0.1) { // 10% chance per day after 30 days neglect
        rel.divorced = true;
        rel.stage = 'stranger';
        rel.points = 0;
        // Child support remains
        rel.pendingEvent = { id: 'divorce', npcId: npcId, triggered: true,
          description: npc.name + ' left you. "You chose the streets over your family." Child support continues. $500/day per child.' };
      }
    }

    // Partner finds out about criminal activity → trust drops
    if (rel.stage === 'partner' && state.heat > 60 && Math.random() < 0.03) {
      rel.points = Math.max(0, rel.points - 15);
      rel.stage = calculateStage(rel.points);
      rel.pendingEvent = { id: 'partner_worried', npcId: npcId, triggered: true,
        description: npc.name + ' found something that scared her. "What exactly do you do for a living?" -15 relationship.' };
      msgs.push('💕 ' + npc.name + ' is worried about you — check Relationships.');
    }
  }

  return msgs;
}

// ---- Story Beat Engine ----

// Returns the next uncompleted story beat definition for an NPC (or null)
function getNextStoryBeat(state, npcId) {
  const beats = ROMANCE_STORY_BEATS[npcId];
  if (!beats) return null;
  const rel = state.relationships ? state.relationships[npcId] : null;
  const done = (rel && rel.completedBeats) || [];
  for (const beat of beats) {
    if (done.indexOf(beat.id) === -1) return beat;
  }
  return null;
}

// If the relationship has crossed the next beat's threshold, arm it as pendingEvent.
// Returns the event if one fired, else null. Safe to call every render.
function checkStoryBeatTrigger(state, npcId) {
  const rel = state.relationships ? state.relationships[npcId] : null;
  if (!rel || rel.pendingEvent || rel.stage === 'stranger') return null;

  const beat = getNextStoryBeat(state, npcId);
  if (!beat || rel.points < beat.minPoints) return null;

  rel.pendingEvent = {
    id: beat.id,
    npcId: npcId,
    type: 'story',
    title: beat.title,
    description: beat.description,
    choices: beat.choices.map(function(c) {
      return { id: c.id, label: c.label, hint: c.hint, effects: c.effects, breakupChance: c.breakupChance || 0, resultText: c.resultText };
    }),
  };
  return rel.pendingEvent;
}

// Neglect crisis event (serious/partner stage, 30+ days of silence)
function makeNeglectEvent(npcId, daysSince) {
  const npc = ROMANCE_NPCS.find(function(n) { return n.id === npcId; });
  const name = npc ? npc.name : 'She';
  return {
    id: 'neglect_' + npcId,
    npcId: npcId,
    type: 'story',
    title: 'The Silence',
    description: name + ' finally reaches you. "' + daysSince + ' days. I counted. Whatever you\'re building out there — am I part of it or not?" This is the conversation that decides things.',
    choices: [
      { id: 'gesture', label: '💎 Grand gesture — sweep her off her feet', hint: '-$25,000, wins her back', effects: { points: 20, cash: -25000 }, breakupChance: 0,
        resultText: 'A weekend in Key West, no phones, no business. By Sunday she\'s laughing again. "Don\'t you EVER do that to me again."' },
      { id: 'honest', label: '🗣️ Be honest — the empire ate you alive', hint: 'Free, but she may walk', effects: { points: 8 }, breakupChance: 0.20,
        resultText: '"At least you didn\'t lie." She stays — this time. The next silence won\'t get a conversation.' },
      { id: 'drift', label: '🚬 Let it end. The game is your only love.', hint: 'Clean break', effects: { points: 0 }, breakupChance: 1.0,
        resultText: 'No shouting. She just nods, like a diagnosis confirmed, and closes the door softly. Soft doors are the loudest.' },
    ],
  };
}

// Resolve a player's choice on a pending story event.
// Returns deltas for the UI to apply to the main game state (cash/heat/health).
function resolveRomanceEventChoice(state, npcId, choiceId, playerCash) {
  const npc = ROMANCE_NPCS.find(function(n) { return n.id === npcId; });
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships ? state.relationships[npcId] : null;
  if (!rel || !rel.pendingEvent || !rel.pendingEvent.choices) {
    return { success: false, message: 'Nothing needs deciding with ' + npc.name + ' right now.' };
  }

  const event = rel.pendingEvent;
  const choice = event.choices.find(function(c) { return c.id === choiceId; });
  if (!choice) return { success: false, message: 'Invalid choice.' };

  const fx = choice.effects || {};
  const cash = typeof playerCash === 'number' ? playerCash : 0;
  if (fx.cash && fx.cash < 0 && cash < -fx.cash) {
    return { success: false, message: 'Not enough cash. Need $' + (-fx.cash).toLocaleString() + '.' };
  }

  // Commit: event resolved either way from here
  rel.pendingEvent = null;
  if (!rel.completedBeats) rel.completedBeats = [];
  if (event.type === 'story' && rel.completedBeats.indexOf(event.id) === -1) {
    rel.completedBeats.push(event.id);
  }
  if (state.daysSinceContact) state.daysSinceContact[npcId] = 0;
  rel.neglectFired = false;

  // Breakup roll
  const breakupChance = choice.breakupChance || 0;
  if (breakupChance > 0 && Math.random() < breakupChance) {
    state.heartbreaks = (state.heartbreaks || 0) + 1;
    delete state.relationships[npcId];
    if (state.daysSinceContact) delete state.daysSinceContact[npcId];
    return {
      success: true,
      brokeUp: true,
      cashDelta: fx.cash && fx.cash < 0 ? fx.cash : 0, // she keeps the money either way
      heatDelta: fx.heat || 0,
      healthDelta: fx.health || 0,
      message: (choice.resultText || '') + ' 💔 It\'s over with ' + npc.name + '.',
    };
  }

  // Apply relationship points
  const prevStage = rel.stage;
  if (fx.points) rel.points = Math.max(0, rel.points + fx.points);
  rel.stage = calculateStage(rel.points);
  const stageUp = RELATIONSHIP_STAGES.indexOf(rel.stage) > RELATIONSHIP_STAGES.indexOf(prevStage);

  const summary = [];
  if (fx.points) summary.push((fx.points > 0 ? '+' : '') + fx.points + ' relationship');
  if (fx.cash) summary.push((fx.cash > 0 ? '+$' : '-$') + Math.abs(fx.cash).toLocaleString());
  if (fx.heat) summary.push((fx.heat > 0 ? '+' : '') + fx.heat + ' heat');
  if (fx.health) summary.push(fx.health + ' HP');

  return {
    success: true,
    brokeUp: false,
    stageUp: stageUp,
    newStage: rel.stage,
    cashDelta: fx.cash || 0,
    heatDelta: fx.heat || 0,
    healthDelta: fx.health || 0,
    pointsDelta: fx.points || 0,
    message: (choice.resultText || 'Decision made.') + (summary.length ? ' (' + summary.join(', ') + ')' : ''),
  };
}

// Dismiss a no-choice (legacy/life) event after reading it
function dismissRomanceEvent(state, npcId) {
  const rel = state.relationships ? state.relationships[npcId] : null;
  if (!rel || !rel.pendingEvent) return { success: false, message: 'No pending event.' };
  const event = rel.pendingEvent;
  rel.pendingEvent = null;
  return { success: true, event: event };
}

// Partner perk descriptor for UI display
function getPartnerPerk(npcId) {
  return PARTNER_PERKS[npcId] || null;
}

function processJealousy(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return;

  const activeRelationships = Object.keys(state.relationships).filter(id => {
    const r = state.relationships[id];
    return id !== npcId && RELATIONSHIP_STAGES.indexOf(r.stage) >= 2;
  });

  if (activeRelationships.length > 0) {
    const jealousyHit = Math.floor(activeRelationships.length * npc.jealousyFactor);
    state.relationships[npcId].points = Math.max(0, state.relationships[npcId].points - jealousyHit);
  }
}

function checkRomanceEvent(state, npcId) {
  const rel = state.relationships[npcId];
  for (const event of ROMANCE_EVENTS) {
    if (RELATIONSHIP_STAGES.indexOf(rel.stage) >= RELATIONSHIP_STAGES.indexOf(event.stage)) {
      if (Math.random() < event.chance) {
        return { ...event, npcId, triggered: true };
      }
    }
  }
  return null;
}

function calculateStage(points) {
  if (points >= STAGE_THRESHOLDS.partner) return 'partner';
  if (points >= STAGE_THRESHOLDS.serious) return 'serious';
  if (points >= STAGE_THRESHOLDS.dating) return 'dating';
  if (points >= STAGE_THRESHOLDS.acquaintance) return 'acquaintance';
  return 'stranger';
}

// ---- Meet NPC ----

function meetRomanceNPC(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  if (state.relationships[npcId]) {
    return { success: false, message: `You already know ${npc.name}.` };
  }

  state.relationships[npcId] = {
    points: 15, // scaled 3x with STAGE_THRESHOLDS so meeting still lands near the acquaintance band
    stage: 'acquaintance',
    metDay: 0,
    stageDropped: false,
    pendingEvent: null,
    secretsShared: 0,
    timesProtected: 0
  };
  state.daysSinceContact[npcId] = 0;
  state.gifts[npcId] = 0;

  return {
    success: true,
    message: `You meet ${npc.name}. ${npc.description}`,
    npc: { id: npc.id, name: npc.name, emoji: npc.emoji, background: npc.background }
  };
}

// ---- Date ----

function goOnDate(state, npcId, tierIndex, playerCash) {
  if (!state.stats) state.stats = {};
  state.stats.datesCount = (state.stats.datesCount || 0) + 1;
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };
  if (RELATIONSHIP_STAGES.indexOf(rel.stage) < 1) return { success: false, message: 'You need to know them better first.' };

  const tier = DATE_TIERS[tierIndex] || DATE_TIERS[0];

  // Cash validation - prevent going negative
  const cash = typeof playerCash === 'number' ? playerCash : 0;
  if (cash < tier.cost) return { success: false, message: `Not enough cash. Need $${tier.cost.toLocaleString()}.` };

  // Cooldown - one date per person per 2 days
  if (rel.lastDateDay !== undefined && (state._currentDay || 0) - rel.lastDateDay < 2) {
    return { success: false, message: `You already went on a date with ${npc.name} recently. Give it a day.` };
  }
  rel.lastDateDay = state._currentDay || 0;

  rel.points += tier.relationshipGain;
  state.daysSinceContact[npcId] = 0;
  state.totalDates++;

  const prevStage = rel.stage;
  rel.stage = calculateStage(rel.points);
  const stageUp = RELATIONSHIP_STAGES.indexOf(rel.stage) > RELATIONSHIP_STAGES.indexOf(prevStage);

  return {
    success: true,
    cost: tier.cost,
    stressRelief: tier.stressRelief,
    relationshipGain: tier.relationshipGain,
    dateName: tier.name,
    stageUp,
    newStage: rel.stage,
    message: `You take ${npc.name} on a date: ${tier.name}. (+${tier.relationshipGain} relationship)`
  };
}

// ---- Gifts ----

function giveGift(state, npcId, giftValue, playerCash) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  // Cash check
  var cash = typeof playerCash === 'number' ? playerCash : 0;
  if (cash < giftValue) return { success: false, message: `Not enough cash. Need $${giftValue.toLocaleString()}.` };

  // Cooldown: max 1 gift per person per 2 days
  if (rel.lastGiftDay !== undefined && (state._currentDay || 0) - rel.lastGiftDay < 2) {
    return { success: false, message: `You already gave ${npc.name} a gift recently. Give it time.` };
  }
  rel.lastGiftDay = state._currentDay || 0;

  const pref = GIFT_PREFERENCES[npc.giftPreference] || { base: 1.0, matchBonus: 1.0 };
  const baseGain = Math.floor(giftValue / 1000);
  const multiplier = pref.base * pref.matchBonus;

  // Diminishing returns: after 10 gifts, each gift is worth less
  var totalGifts = (state.gifts[npcId] || 0) / giftValue;
  var diminish = totalGifts > 20 ? 0.3 : totalGifts > 10 ? 0.5 : totalGifts > 5 ? 0.75 : 1.0;
  const gain = Math.max(1, Math.floor(baseGain * multiplier * diminish));

  rel.points += gain;
  state.daysSinceContact[npcId] = 0;
  state.gifts[npcId] = (state.gifts[npcId] || 0) + giftValue;

  const prevStage = rel.stage;
  rel.stage = calculateStage(rel.points);
  const stageUp = RELATIONSHIP_STAGES.indexOf(rel.stage) > RELATIONSHIP_STAGES.indexOf(prevStage);

  var dimMsg = diminish < 1 ? ' (diminishing returns - gifts alone won\'t win her heart)' : '';

  return {
    success: true,
    cost: giftValue,
    relationshipGain: gain,
    stageUp,
    newStage: rel.stage,
    message: `You give ${npc.name} a gift worth $${giftValue.toLocaleString()}. (+${gain} relationship)${dimMsg}`
  };
}

// ---- Advance Relationship ----

function advanceRelationship(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  const currentIdx = RELATIONSHIP_STAGES.indexOf(rel.stage);
  if (currentIdx >= RELATIONSHIP_STAGES.length - 1) {
    return { success: false, message: `Your relationship with ${npc.name} is already at partner level.` };
  }

  const nextStage = RELATIONSHIP_STAGES[currentIdx + 1];
  const threshold = STAGE_THRESHOLDS[nextStage];

  if (rel.points >= threshold) {
    rel.stage = nextStage;
    return {
      success: true,
      newStage: nextStage,
      benefits: npc.benefits[nextStage] || {},
      message: `Your relationship with ${npc.name} advances to: ${nextStage}!`
    };
  }

  return {
    success: false,
    message: `Need ${threshold - rel.points} more relationship points to advance with ${npc.name}.`,
    currentPoints: rel.points,
    needed: threshold
  };
}

// ---- Phone Call ----

function phoneCall(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  // Cooldown: max 1 call per person per 2 days
  if (rel.lastCallDay !== undefined && (state._currentDay || 0) - rel.lastCallDay < 2) {
    return { success: false, message: `You already called ${npc.name} recently. Don't be clingy.` };
  }
  rel.lastCallDay = state._currentDay || 0;

  // Call content depends on relationship stage - not just "+1"
  var gain = 1;
  var callMsg = '';
  var roll = Math.random();
  if (RELATIONSHIP_STAGES.indexOf(rel.stage) >= 3) {
    // Partner level: meaningful conversations
    if (roll < 0.3) { gain = 3; callMsg = 'You talked for an hour about the future. She feels closer to you.'; }
    else if (roll < 0.6) { gain = 2; callMsg = '"I miss you," she says. You miss her too. Somehow that matters.'; }
    else { gain = 1; callMsg = 'Quick check-in. "Stay safe out there." She worries about you.'; }
  } else if (RELATIONSHIP_STAGES.indexOf(rel.stage) >= 2) {
    // Dating level
    if (roll < 0.25) { gain = 2; callMsg = 'Good conversation. You made her laugh. That\'s worth something.'; }
    else if (roll < 0.5) { gain = 2; callMsg = 'She told you about her day. You actually listened. (+2 relationship)'; }
    else if (roll < 0.8) { gain = 1; callMsg = 'Casual chat. Nothing deep but she picked up on the first ring.'; }
    else { gain = 0; callMsg = 'She didn\'t pick up. Left a voicemail.'; }
  } else {
    // Acquaintance level
    if (roll < 0.4) { gain = 1; callMsg = 'Brief call. She seemed surprised you called. "Oh, hey... what\'s up?"'; }
    else if (roll < 0.7) { gain = 1; callMsg = 'You chatted for a few minutes. Building familiarity.'; }
    else { gain = 0; callMsg = 'Went to voicemail. She\'s busy. Try again tomorrow.'; }
  }

  rel.points += gain;
  state.daysSinceContact[npcId] = 0;

  return { success: true, relationshipGain: gain, message: `📞 ${npc.name}: ${callMsg}${gain > 0 ? ' (+' + gain + ')' : ''}` };
}

// ---- Share Secret ----

function shareSecret(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  // Cooldown: 1 secret per person per 14 days (you don't overshare)
  if (rel.lastSecretDay !== undefined && (state._currentDay || 0) - rel.lastSecretDay < 14) {
    return { success: false, message: `Too soon to share another secret with ${npc.name}. Give it time.` };
  }
  rel.lastSecretDay = state._currentDay || 0;

  // Requires dating stage minimum
  if (RELATIONSHIP_STAGES.indexOf(rel.stage) < 2) {
    return { success: false, message: `You don't trust ${npc.name} enough to share secrets yet. Need dating stage.` };
  }

  rel.secretsShared++;
  const trustGain = 5;
  rel.points += trustGain;
  state.daysSinceContact[npcId] = 0;

  const leakRisk = Math.min(0.30, rel.secretsShared * 0.05);
  const leaked = Math.random() < leakRisk;

  // If leaked, actual consequences
  if (leaked && typeof state.heat === 'number') {
    state.heat = Math.min(100, state.heat + 5);
  }

  return {
    success: true,
    relationshipGain: trustGain,
    leaked,
    leakRisk,
    message: leaked
      ? `You confide in ${npc.name}... but this one gets out. (+${trustGain} relationship, but intel leaked! +5 heat)`
      : `You share something personal with ${npc.name}. She appreciates the trust. (+${trustGain} relationship)`
  };
}

// ---- Protect ----

function protectPartner(state, npcId) {
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `You haven't met ${npc.name} yet.` };

  // Protect can only happen during specific events (not on demand)
  // Check if there's a pending threat event for this NPC
  if (!rel.pendingEvent || (rel.pendingEvent.id !== 'kidnapped' && rel.pendingEvent.id !== 'threatened')) {
    return { success: false, message: `${npc.name} isn't in danger right now. Protect is only available during threat events.` };
  }

  rel.timesProtected++;
  const gain = 15;
  rel.points += gain;
  state.daysSinceContact[npcId] = 0;

  // Clear the threat event
  rel.pendingEvent = null;

  // Costs health - you took a risk
  if (typeof state.health === 'number') {
    state.health = Math.max(20, state.health - 10);
  }

  rel.stage = calculateStage(rel.points);

  return {
    success: true,
    relationshipGain: gain,
    message: `You put yourself on the line for ${npc.name}. She won't forget it. (+${gain} relationship, -10 HP)`
  };
}

// ---- Benefits ----

function getRomanceBenefits(state) {
  const benefits = {
    stressReduction: 0,
    freeHealing: false,
    firstAid: false,
    repBonus: 0,
    internationalContacts: false,
    legalDefense: false,
    sentenceReduction: 0,
    plantStory: false,
    killStory: false,
    intelChance: 0,
    laundering: false,
    nightlifeDiscount: 0,
    nightlifeBonus: false,
    paranoiaImmunity: false,
    safeHouses: 0
  };

  for (const npcId of Object.keys(state.relationships)) {
    const rel = state.relationships[npcId];
    const npc = ROMANCE_NPCS.find(n => n.id === npcId);
    if (!npc || RELATIONSHIP_STAGES.indexOf(rel.stage) < 2) continue;

    const stageBenefits = npc.benefits[rel.stage];
    if (!stageBenefits) continue;

    if (stageBenefits.stressReduction) benefits.stressReduction += stageBenefits.stressReduction;
    if (stageBenefits.freeHealing) benefits.freeHealing = true;
    if (stageBenefits.firstAid) benefits.firstAid = true;
    if (stageBenefits.repBonus) benefits.repBonus += stageBenefits.repBonus;
    if (stageBenefits.internationalContacts) benefits.internationalContacts = true;
    if (stageBenefits.legalDefense) benefits.legalDefense = true;
    if (stageBenefits.sentenceReduction) benefits.sentenceReduction = Math.max(benefits.sentenceReduction, stageBenefits.sentenceReduction);
    if (stageBenefits.plantStory) benefits.plantStory = true;
    if (stageBenefits.killStory) benefits.killStory = true;
    if (stageBenefits.intelChance) benefits.intelChance += stageBenefits.intelChance;
    if (stageBenefits.laundering) benefits.laundering = true;
    if (stageBenefits.nightlifeDiscount) benefits.nightlifeDiscount = Math.max(benefits.nightlifeDiscount, stageBenefits.nightlifeDiscount);
    if (stageBenefits.nightlifeBonus) benefits.nightlifeBonus = true;
    if (stageBenefits.paranoiaImmunity) benefits.paranoiaImmunity = true;
    if (stageBenefits.safeHouse) benefits.safeHouses++;
  }

  return benefits;
}

// ---- Romance Events ----

function triggerRomanceEvent(state, npcId) {
  const rel = state.relationships[npcId];
  if (!rel || !rel.pendingEvent) return { success: false, message: 'No pending event.' };

  const event = rel.pendingEvent;
  rel.pendingEvent = null;

  return { success: true, event };
}

// ---- Break Up ----

function breakUp(state, npcId) {
  if (!state.stats) state.stats = {};
  state.stats.breakups = (state.stats.breakups || 0) + 1;
  const npc = ROMANCE_NPCS.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'Unknown person.' };

  const rel = state.relationships[npcId];
  if (!rel) return { success: false, message: `No relationship with ${npc.name}.` };

  const stressHit = RELATIONSHIP_STAGES.indexOf(rel.stage) * 10;
  state.heartbreaks++;

  delete state.relationships[npcId];
  delete state.daysSinceContact[npcId];

  return {
    success: true,
    stressHit,
    heartbreaks: state.heartbreaks,
    message: `It's over with ${npc.name}. +${stressHit} stress. Heartbreak #${state.heartbreaks}.`
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROMANCE_NPCS,
    RELATIONSHIP_STAGES,
    STAGE_THRESHOLDS,
    DATE_TIERS,
    ROMANCE_EVENTS,
    ROMANCE_STORY_BEATS,
    PARTNER_PERKS,
    getNextStoryBeat,
    checkStoryBeatTrigger,
    makeNeglectEvent,
    resolveRomanceEventChoice,
    dismissRomanceEvent,
    getPartnerPerk,
    initRomanceState,
    processRomanceDaily,
    meetRomanceNPC,
    goOnDate,
    giveGift,
    advanceRelationship,
    phoneCall,
    shareSecret,
    protectPartner,
    getRomanceBenefits,
    triggerRomanceEvent,
    breakUp
  };
}
