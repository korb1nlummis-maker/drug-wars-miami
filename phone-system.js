/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Burner Phone & Message System
   Contextual messaging, burner phone mechanics, wiretap risk,
   and interactive message responses.
   ============================================================ */

const MESSAGE_CATEGORIES = {
  supplier_alert: { emoji: '📦', priority: 'high' },
  crew_checkin: { emoji: '👥', priority: 'low' },
  buyer_request: { emoji: '💰', priority: 'high' },
  npc_story: { emoji: '📖', priority: 'medium' },
  news_alert: { emoji: '📰', priority: 'medium' },
  threat: { emoji: '⚠️', priority: 'high' },
  spam: { emoji: '📱', priority: 'low' },
  lawyer: { emoji: '⚖️', priority: 'medium' },
  political: { emoji: '🏛️', priority: 'low' },
};

const SPAM_MESSAGES = [
  { from: 'Unknown', text: 'Hey can you pick up milk on the way home?' },
  { from: 'Unknown', text: 'Is this Tony\'s Pizza? I\'d like to order a large pepperoni' },
  { from: 'Unknown', text: 'CONGRATULATIONS! You won a FREE cruise! Click here-' },
  { from: 'Mom', text: 'Mijo, call your mother. I made flan 🍮' },
  { from: 'Unknown', text: 'Wrong number sorry' },
  { from: 'T-Mobile', text: 'Your bill of $89.99 is due. Pay now to avoid service interruption.' },
  { from: 'Unknown', text: 'Yo where the party at tonight??' },
  { from: 'Bank of America', text: 'Suspicious activity on your account. Call 1-800-...' },
  { from: 'Unknown', text: 'I saw what you did last Tuesday 👀' },
  { from: 'Uber Eats', text: 'Your order is on the way! 🍔' },
  { from: 'IRS', text: 'URGENT: You owe $4,799 in back taxes. Call immediately or face arrest.' },
  { from: 'Unknown', text: 'Hey is this Miguel? We met at the club last weekend' },
  { from: 'CVS Pharmacy', text: 'Your prescription is ready for pickup' },
  { from: 'Unknown', text: 'Bro I just saw a cop car parked outside your... nvm wrong person' },
  { from: 'Netflix', text: 'Continue watching Narcos? New episodes available!' },
  { from: 'Unknown', text: 'Can you cover my shift tomorrow? I\'ll owe you one' },
  { from: 'Weather Alert', text: '⚠️ Tropical Storm Warning for Miami-Dade County' },
  { from: 'Unknown', text: 'Tell Carlos he still owes me $200 from poker night' },
  { from: 'Dominos', text: 'DEAL: 2 medium pizzas for $5.99 each! Order now 🍕' },
  { from: 'Unknown', text: 'Babe are you coming to dinner tonight? My parents are waiting...' },
];

const SUPPLIER_TEMPLATES = [
  { from: '{supplier}', text: 'Got a fresh batch. 40% off if you pick up today. Won\'t last.', timedDeal: true, discount: 0.4, expiresIn: 1 },
  { from: '{supplier}', text: 'Shipment just landed. Premium quality. You want first pick?', timedDeal: true, discount: 0, expiresIn: 2 },
  { from: '{supplier}', text: 'Prices going up next week. Stock up now if you\'re smart.', timedDeal: false },
  { from: '{supplier}', text: 'My guy got busted. I need to move product FAST. 50% off, today only.', timedDeal: true, discount: 0.5, expiresIn: 1 },
  { from: '{supplier}', text: 'New product line. You interested? Samples available.', timedDeal: false },
  { from: '{supplier}', text: 'Had to raise prices. Heat is getting real. Sorry hermano.', timedDeal: false },
  { from: '{supplier}', text: 'Port got locked down. Next shipment delayed 3 days minimum.', timedDeal: false },
  { from: '{supplier}', text: 'Competition is moving in on my route. Might need your help.', timedDeal: false },
];

const CREW_TEMPLATES = [
  { from: '{crew}', text: 'Territory all clear boss. Quiet night.' },
  { from: '{crew}', text: 'Someone\'s been watching the stash house. I don\'t like it.' },
  { from: '{crew}', text: 'Ran into some trouble in {district}. Handled it, but heads up.' },
  { from: '{crew}', text: 'Corner boys are complaining about pay again. Might want to address it.' },
  { from: '{crew}', text: 'New crew from out of town asking about product. Want me to set up a meet?' },
  { from: '{crew}', text: 'Spotted an unmarked car doing laps around the block.' },
  { from: '{crew}', text: 'One of the runners got jumped. Lost about $2K in product.' },
  { from: '{crew}', text: 'Everything running smooth. Sales up 15% this week.' },
  { from: '{crew}', text: 'Yo boss, we need more product. Shelves are bare.' },
  { from: '{crew}', text: 'Got a new connect who wants to meet. Says he can move volume.' },
];

const BUYER_TEMPLATES = [
  { from: '{buyer}', text: 'Can you get me {amount} units of {drug} by Friday? Paying premium.', missionType: 'delivery' },
  { from: '{buyer}', text: 'My usual guy got pinched. Need a new supplier. Can you help?', missionType: 'new_client' },
  { from: '{buyer}', text: 'Party this weekend. Need party favors for 50 people. What you got?', missionType: 'bulk_order' },
  { from: '{buyer}', text: 'Looking for something specific. High grade only. Money is no object.', missionType: 'premium' },
  { from: '{buyer}', text: 'Need a regular supply. Weekly drops. Can we arrange something?', missionType: 'subscription' },
];

const NPC_STORY_TEMPLATES = [
  { from: 'Dr. Rosa', text: 'Hey it\'s Dr. Rosa. I need a favor. Come by the clinic when you can.', storyArc: 'rosa_clinic' },
  { from: 'Detective Vega', text: 'We need to talk. Neutral ground. The diner on 5th. Tomorrow.', storyArc: 'vega_deal' },
  { from: 'Mama Lucia', text: 'Mijo, the neighborhood needs help. The community center needs funding.', storyArc: 'community' },
  { from: 'El Cubano', text: 'I have a proposition. One that could change the game for both of us.', storyArc: 'cubano_alliance' },
  { from: 'Unknown', text: 'I know who you are. And I know what happened to your brother.', storyArc: 'backstory' },
];

const PHONE_NEWS_TEMPLATES = [
  { text: 'BREAKING: Major bust in {district}. Prices expected to spike.', effect: 'price_spike' },
  { text: 'MIAMI HERALD: Police chief announces new anti-drug task force.', effect: 'heat_warning' },
  { text: 'BREAKING: Coast Guard seizes $50M in cocaine off Miami coast.', effect: 'supply_shortage' },
  { text: 'LOCAL NEWS: New nightclub opening in {district}. Investors wanted.', effect: 'opportunity' },
  { text: 'WEATHER: Hurricane watch issued for South Florida. Batten down.', effect: 'weather_event' },
  { text: 'POLITICS: City council votes on new surveillance cameras in {district}.', effect: 'heat_increase_zone' },
  { text: 'CRIME REPORT: Rival gang shootout leaves 3 dead in {district}.', effect: 'territory_shift' },
  { text: 'ECONOMY: Tourism up 20% this quarter. Cash flowing through Miami.', effect: 'economy_boost' },
];

const THREAT_TEMPLATES = [
  { from: '{rival}', text: 'We know where you live. Back off our territory.' },
  { from: '{rival}', text: 'Stay out of {district} or else. This is your only warning.' },
  { from: '{rival}', text: 'Nice business you got there. Shame if something happened to it.' },
  { from: 'Unknown', text: 'You think you\'re untouchable? Everyone falls eventually.' },
  { from: '{rival}', text: 'Your crew member {crew} has been running their mouth. Fix it.' },
  { from: 'Unknown', text: 'We have photos. We have dates. We have everything. Tick tock.' },
];

const LAWYER_TEMPLATES = [
  { from: 'Saul (Lawyer)', text: 'Your hearing is scheduled for Tuesday. Do NOT miss it.' },
  { from: 'Saul (Lawyer)', text: 'Good news. Got the charges reduced. You owe me though.' },
  { from: 'Saul (Lawyer)', text: 'They\'re building a case. You need to lay low for a while.' },
  { from: 'Saul (Lawyer)', text: 'Asset forfeiture hearing next week. We need to talk strategy.' },
  { from: 'Saul (Lawyer)', text: 'I pulled some strings. Wiretap warrant got denied.' },
];

const POLITICAL_TEMPLATES = [
  { from: 'Councilman Rivera', text: 'The vote on the zoning change is tonight. Your contribution was noted.' },
  { from: 'Campaign Office', text: 'The mayor\'s re-election campaign could use your support. Benefits for friends.' },
  { from: 'Councilman Rivera', text: 'That development permit you wanted? Consider it handled.' },
  { from: 'Unknown', text: 'A friend at City Hall says there\'s a crackdown coming. Heads up.' },
];

const BURNER_PHONE_TYPES = [
  { id: 'basic', name: 'Basic Burner', cost: 200, wiretapReduction: 0, description: 'Cheap prepaid phone. Gets the job done.' },
  { id: 'encrypted', name: 'Encrypted Phone', cost: 500, wiretapReduction: 0.5, description: 'Encrypted messaging. Harder to tap.' },
];

const PHONE_MAX_AGE = 30;      // days before a burner should be replaced
const INBOX_MAX_SIZE = 50;     // oldest messages auto-deleted
const WIRETAP_HEAT_THRESHOLD = 50;
const WIRETAP_AGE_THRESHOLD = 15;
const WIRETAP_DAILY_CHANCE = 0.05;

// ============================================================
// PHONE STATE
// ============================================================
function initPhoneState() {
  return {
    inbox: [],
    contacts: [],          // { name, role, addedDay }
    burnerAge: 0,
    burnerType: 'basic',
    wiretapped: false,
    unreadCount: 0,
    totalMessagesReceived: 0,
    phoneHistory: [],      // { type, switchDay } - log of past phones
    _nextMsgId: 1,
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processPhoneDaily(state) {
  if (!state.phone) state.phone = initPhoneState();
  const phone = state.phone;
  const day = state.day || 1;

  // Age the burner
  phone.burnerAge++;

  // Check wiretap risk
  checkWiretapRisk(state);

  // Generate daily messages
  const newMessages = generateDailyMessages(state);
  for (const msg of newMessages) {
    addMessageToInbox(phone, msg, day);
  }

  // Trim inbox to max size
  while (phone.inbox.length > INBOX_MAX_SIZE) {
    const removed = phone.inbox.shift();
    if (!removed.read) phone.unreadCount = Math.max(0, phone.unreadCount - 1);
  }
}

// ============================================================
// WIRETAP CHECK
// ============================================================
function checkWiretapRisk(state) {
  const phone = state.phone;
  const heat = typeof getHeat === 'function' ? getHeat(state) : (state.heat || 0);

  if (phone.wiretapped) return; // already tapped

  if (heat > WIRETAP_HEAT_THRESHOLD && phone.burnerAge > WIRETAP_AGE_THRESHOLD) {
    const burnerDef = BURNER_PHONE_TYPES.find(b => b.id === phone.burnerType);
    const reduction = burnerDef ? burnerDef.wiretapReduction : 0;
    const chance = WIRETAP_DAILY_CHANCE * (1 - reduction);

    if (Math.random() < chance) {
      phone.wiretapped = true;
    }
  }
}

// ============================================================
// MESSAGE GENERATION
// ============================================================
function generateDailyMessages(state) {
  const messages = [];
  const day = state.day || 1;
  const heat = typeof getHeat === 'function' ? getHeat(state) : (state.heat || 0);

  // Determine how many messages: 1-2 per day (reduced from 2-5 to avoid flooding)
  const count = 1 + (Math.random() < 0.4 ? 1 : 0);

  for (let i = 0; i < count; i++) {
    const msg = generateSingleMessage(state, day, heat);
    if (msg) messages.push(msg);
  }

  return messages;
}

function generateSingleMessage(state, day, heat) {
  // Weight categories based on game state
  const weights = buildCategoryWeights(state, heat);
  const category = weightedRandomCategory(weights);

  switch (category) {
    case 'spam': return generateSpamMessage(state, day);
    case 'supplier_alert': return generateSupplierMessage(state, day);
    case 'crew_checkin': return generateCrewMessage(state, day);
    case 'buyer_request': return generateBuyerMessage(state, day);
    case 'npc_story': return generateNpcStoryMessage(state, day);
    case 'news_alert': return generateNewsMessage(state, day);
    case 'threat': return generateThreatMessage(state, day);
    case 'lawyer': return generateLawyerMessage(state, day);
    case 'political': return generatePoliticalMessage(state, day);
    default: return generateSpamMessage(state, day);
  }
}

function buildCategoryWeights(state, heat) {
  const weights = {
    spam: 8,
    supplier_alert: 20,
    crew_checkin: 10,
    buyer_request: 18,
    news_alert: 15,
    npc_story: 10,
    threat: 8,
    lawyer: 6,
    political: 5,
  };

  // More threats at high heat
  if (heat > 60) {
    weights.threat += 10;
    weights.lawyer += 5;
  }

  // More crew check-ins if you have crew
  const crewCount = typeof getCrewCount === 'function' ? getCrewCount(state) : (state.crewCount || 0);
  if (crewCount > 3) weights.crew_checkin += 10;

  // More supplier alerts if inventory is low
  const inventoryValue = typeof getInventoryValue === 'function' ? getInventoryValue(state) : 0;
  if (inventoryValue < 5000) weights.supplier_alert += 10;

  // More buyer requests if reputation is high
  const rep = typeof getReputation === 'function' ? getReputation(state) : (state.reputation || 0);
  if (rep > 50) weights.buyer_request += 10;

  // Political messages only after act 2
  const act = (typeof getCurrentAct === 'function') ? getCurrentAct(state) : (state.act || 1);
  if (act < 2) weights.political = 0;

  return weights;
}

function weightedRandomCategory(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [cat, w] of entries) {
    roll -= w;
    if (roll <= 0) return cat;
  }
  return 'spam';
}

// ============================================================
// MESSAGE GENERATORS BY CATEGORY
// ============================================================

function generateSpamMessage(state, day) {
  const template = SPAM_MESSAGES[Math.floor(Math.random() * SPAM_MESSAGES.length)];
  return {
    id: null, // assigned on add
    category: 'spam',
    from: template.from,
    text: template.text,
    day: day,
    read: false,
    responses: null,
  };
}

function generateSupplierMessage(state, day) {
  const template = SUPPLIER_TEMPLATES[Math.floor(Math.random() * SUPPLIER_TEMPLATES.length)];
  const supplierName = getRandomContactName(state, 'supplier') || 'Unknown Supplier';
  const text = template.text;

  const responses = template.timedDeal ? [
    { label: 'I\'m interested. Set up the meet.', effect: 'accept_deal' },
    { label: 'Pass. Not right now.', effect: 'decline_deal' },
  ] : null;

  return {
    id: null,
    category: 'supplier_alert',
    from: supplierName,
    text: text,
    day: day,
    read: false,
    responses: responses,
    _dealData: template.timedDeal ? { discount: template.discount, expiresDay: day + (template.expiresIn || 1) } : null,
  };
}

function generateCrewMessage(state, day) {
  const template = CREW_TEMPLATES[Math.floor(Math.random() * CREW_TEMPLATES.length)];
  const crewName = getRandomContactName(state, 'crew') || 'Your Crew';
  const district = getRandomDistrict(state) || 'the neighborhood';
  const text = template.text.replace('{district}', district);

  return {
    id: null,
    category: 'crew_checkin',
    from: crewName,
    text: text,
    day: day,
    read: false,
    responses: null,
  };
}

function generateBuyerMessage(state, day) {
  const template = BUYER_TEMPLATES[Math.floor(Math.random() * BUYER_TEMPLATES.length)];
  const buyerName = getRandomContactName(state, 'buyer') || 'Potential Buyer';
  const drug = getRandomDrugName(state) || 'product';
  const amount = 10 + Math.floor(Math.random() * 90);
  const text = template.text.replace('{amount}', amount).replace('{drug}', drug);

  return {
    id: null,
    category: 'buyer_request',
    from: buyerName,
    text: text,
    day: day,
    read: false,
    responses: [
      { label: 'I can handle that. Where\'s the drop?', effect: 'accept_buyer_mission' },
      { label: 'Can\'t help you right now.', effect: 'decline_buyer_mission' },
    ],
    _missionData: { type: template.missionType, drug: drug, amount: amount },
  };
}

function generateNpcStoryMessage(state, day) {
  const template = NPC_STORY_TEMPLATES[Math.floor(Math.random() * NPC_STORY_TEMPLATES.length)];

  return {
    id: null,
    category: 'npc_story',
    from: template.from,
    text: template.text,
    day: day,
    read: false,
    responses: [
      { label: 'I\'ll be there.', effect: 'accept_story_' + template.storyArc },
      { label: 'Not interested.', effect: 'decline_story_' + template.storyArc },
    ],
    _storyArc: template.storyArc,
  };
}

function generateNewsMessage(state, day) {
  const template = PHONE_NEWS_TEMPLATES[Math.floor(Math.random() * PHONE_NEWS_TEMPLATES.length)];
  const district = getRandomDistrict(state) || 'Downtown';
  const text = template.text.replace('{district}', district);

  return {
    id: null,
    category: 'news_alert',
    from: 'Miami Herald',
    text: text,
    day: day,
    read: false,
    responses: null,
    _newsEffect: template.effect,
  };
}

function generateThreatMessage(state, day) {
  const template = THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];
  const rivalName = getRandomContactName(state, 'rival') || 'Unknown';
  const district = getRandomDistrict(state) || 'our territory';
  const crewName = getRandomContactName(state, 'crew') || 'your boy';
  const text = template.text
    .replace('{district}', district)
    .replace('{crew}', crewName);
  const from = template.from.replace('{rival}', rivalName);

  return {
    id: null,
    category: 'threat',
    from: from,
    text: text,
    day: day,
    read: false,
    responses: [
      { label: 'You don\'t scare me.', effect: 'threat_defiance' },
      { label: 'Let\'s talk this out.', effect: 'threat_negotiate' },
    ],
  };
}

function generateLawyerMessage(state, day) {
  const heat = typeof getHeat === 'function' ? getHeat(state) : (state.heat || 0);
  if (heat < 20) return generateSpamMessage(state, day); // no legal trouble, send spam instead

  const template = LAWYER_TEMPLATES[Math.floor(Math.random() * LAWYER_TEMPLATES.length)];

  return {
    id: null,
    category: 'lawyer',
    from: template.from,
    text: template.text,
    day: day,
    read: false,
    responses: null,
  };
}

function generatePoliticalMessage(state, day) {
  const template = POLITICAL_TEMPLATES[Math.floor(Math.random() * POLITICAL_TEMPLATES.length)];

  return {
    id: null,
    category: 'political',
    from: template.from,
    text: template.text,
    day: day,
    read: false,
    responses: null,
  };
}

// ============================================================
// HELPER: Add message to inbox
// ============================================================
function addMessageToInbox(phone, msg, day) {
  msg.id = phone._nextMsgId++;
  msg.day = day;
  phone.inbox.push(msg);
  if (!msg.read) phone.unreadCount++;
  phone.totalMessagesReceived++;
}

// ============================================================
// HELPER: Get names from game state for template filling
// ============================================================
function getRandomContactName(state, role) {
  if (state.phone && state.phone.contacts && state.phone.contacts.length > 0) {
    const matching = state.phone.contacts.filter(c => c.role === role);
    if (matching.length > 0) {
      return matching[Math.floor(Math.random() * matching.length)].name;
    }
  }
  // Fallback names
  const fallbacks = {
    supplier: ['Rico', 'The Colombian', 'Hector', 'Big Mike', 'Yuki'],
    crew: ['Dex', 'Little Ray', 'Tomas', 'Bones', 'Chico'],
    buyer: ['Anonymous Client', 'Club Promoter', 'College Kid', 'Businessman'],
    rival: ['Los Serpientes', 'The Overtown Crew', 'Haitian Posse', 'The Russians'],
  };
  const list = fallbacks[role] || ['Unknown'];
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomDistrict(state) {
  if (typeof getKnownDistricts === 'function') {
    const districts = getKnownDistricts(state);
    if (districts && districts.length > 0) {
      return districts[Math.floor(Math.random() * districts.length)];
    }
  }
  const defaults = ['Little Havana', 'Overtown', 'Wynwood', 'Liberty City', 'Coconut Grove', 'Downtown'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function getRandomDrugName(state) {
  if (state.inventory && typeof state.inventory === 'object') {
    const drugs = Object.keys(state.inventory).filter(k => state.inventory[k] > 0);
    if (drugs.length > 0) return drugs[Math.floor(Math.random() * drugs.length)];
  }
  const defaults = ['cocaine', 'weed', 'meth', 'ecstasy', 'heroin'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ============================================================
// PLAYER ACTIONS
// ============================================================

function readMessage(state, messageIndex) {
  if (!state.phone) return { success: false, reason: 'No phone.' };
  const phone = state.phone;

  if (messageIndex < 0 || messageIndex >= phone.inbox.length) {
    return { success: false, reason: 'Invalid message index.' };
  }

  const msg = phone.inbox[messageIndex];
  if (!msg.read) {
    msg.read = true;
    phone.unreadCount = Math.max(0, phone.unreadCount - 1);
  }

  return { success: true, message: msg };
}

function deleteMessage(state, messageIndex) {
  if (!state.phone) return { success: false, reason: 'No phone.' };
  const phone = state.phone;

  if (messageIndex < 0 || messageIndex >= phone.inbox.length) {
    return { success: false, reason: 'Invalid message index.' };
  }

  const removed = phone.inbox.splice(messageIndex, 1)[0];
  if (!removed.read) {
    phone.unreadCount = Math.max(0, phone.unreadCount - 1);
  }

  return { success: true, deleted: removed };
}

function switchBurnerPhone(state, type) {
  if (!state.phone) state.phone = initPhoneState();
  const phone = state.phone;
  const burnerDef = BURNER_PHONE_TYPES.find(b => b.id === type);

  if (!burnerDef) return { success: false, reason: 'Unknown phone type.' };

  if (typeof state.cash !== 'number' || state.cash < burnerDef.cost) {
    return { success: false, reason: 'Need $' + burnerDef.cost + ' for a ' + burnerDef.name + '.' };
  }

  // Save history
  phone.phoneHistory.push({
    type: phone.burnerType,
    switchDay: state.day || 1,
    messagesLost: phone.inbox.length,
  });

  state.cash -= burnerDef.cost;

  // Lose all messages and reset
  const lostMessages = phone.inbox.length;
  phone.inbox = [];
  phone.unreadCount = 0;
  phone.burnerAge = 0;
  phone.burnerType = type;
  phone.wiretapped = false;
  // Contacts need re-sharing — clear them
  phone.contacts = [];

  return { success: true, cost: burnerDef.cost, phoneName: burnerDef.name, messagesLost: lostMessages };
}

function getUnreadCount(state) {
  if (!state.phone) return 0;
  return state.phone.unreadCount || 0;
}

function respondToMessage(state, messageIndex, responseIndex) {
  if (!state.phone) return { success: false, reason: 'No phone.' };
  const phone = state.phone;

  if (messageIndex < 0 || messageIndex >= phone.inbox.length) {
    return { success: false, reason: 'Invalid message index.' };
  }

  const msg = phone.inbox[messageIndex];
  if (!msg.responses || !msg.responses[responseIndex]) {
    return { success: false, reason: 'No response option available.' };
  }

  const response = msg.responses[responseIndex];
  const effect = response.effect;

  // Mark as read
  if (!msg.read) {
    msg.read = true;
    phone.unreadCount = Math.max(0, phone.unreadCount - 1);
  }

  // Clear responses so it can't be answered again
  msg.responses = null;
  msg._responded = true;
  msg._responseEffect = effect;

  // Apply effect
  applyMessageEffect(state, msg, effect);

  return { success: true, effect: effect, label: response.label };
}

// ============================================================
// MESSAGE EFFECT APPLICATION
// ============================================================
function applyMessageEffect(state, msg, effect) {
  // Build a result description for the player
  let resultMsg = '';

  switch (effect) {
    case 'accept_deal': {
      // Supplier deal: discount prices on random drugs for this day
      const deal = msg._dealData;
      if (deal && state.prices) {
        const discount = deal.discount || 0.3;
        const drugIds = Object.keys(state.prices).filter(k => state.prices[k] !== null);
        if (drugIds.length > 0) {
          const targetDrug = drugIds[Math.floor(Math.random() * drugIds.length)];
          const oldPrice = state.prices[targetDrug];
          state.prices[targetDrug] = Math.round(oldPrice * (1 - discount));
          const drugDef = (typeof DRUGS !== 'undefined' ? DRUGS : []).find(d => d.id === targetDrug);
          const drugName = drugDef ? drugDef.name : targetDrug;
          resultMsg = `Deal accepted! ${drugName} prices dropped ${Math.round(discount * 100)}% to $${state.prices[targetDrug].toLocaleString()} — limited time only.`;
        }
      }
      if (!resultMsg) resultMsg = 'Deal accepted. Check the market for discounted prices.';
      break;
    }
    case 'decline_deal':
      resultMsg = 'You passed on the deal. The supplier moves on to the next buyer.';
      break;
    case 'accept_buyer_mission': {
      // Create a delivery mission: sell X drugs within Y days for bonus cash
      const mData = msg._missionData;
      if (mData) {
        const bonus = 500 + Math.floor(Math.random() * 2000);
        // Give a cash advance
        const advance = Math.round(bonus * 0.3);
        state.cash = (state.cash || 0) + advance;
        state.reputation = (state.reputation || 0) + 3;
        resultMsg = `Mission accepted! Received $${advance.toLocaleString()} advance. Complete the ${mData.drug} delivery for a $${bonus.toLocaleString()} total payout. +3 Reputation.`;
        if (state.messageLog) state.messageLog.push(`📱 Buyer mission: deliver ${mData.amount} ${mData.drug} for $${bonus.toLocaleString()}`);
      } else {
        resultMsg = 'Mission accepted. Check your missions board.';
      }
      break;
    }
    case 'decline_buyer_mission':
      state.reputation = Math.max(0, (state.reputation || 0) - 2);
      resultMsg = 'You turned down the job. -2 Reputation. Word gets around that you\'re not reliable.';
      break;
    case 'threat_defiance': {
      // Defying threats: heat goes up, but reputation and crew loyalty increase
      state.heat = Math.min(100, (state.heat || 0) + 5);
      state.reputation = (state.reputation || 0) + 5;
      if (typeof adjustRep === 'function') adjustRep(state, 'fear', 3);
      resultMsg = 'You stood your ground. +5 Rep, +3 Fear, but +5 Heat. They\'ll think twice before threatening you again — or come back harder.';
      if (state.messageLog) state.messageLog.push('📱 Stood up to threats. +5 Rep, +5 Heat.');
      break;
    }
    case 'threat_negotiate': {
      // Negotiating: less heat, costs cash, loses some rep
      const bribeCost = 500 + Math.floor(Math.random() * 1500);
      const canPay = (state.cash || 0) >= bribeCost;
      if (canPay) {
        state.cash -= bribeCost;
        state.heat = Math.max(0, (state.heat || 0) - 3);
        state.reputation = Math.max(0, (state.reputation || 0) - 3);
        resultMsg = `You talked it out and paid $${bribeCost.toLocaleString()} to smooth things over. -3 Heat, -3 Rep. Peace has a price.`;
      } else {
        state.reputation = Math.max(0, (state.reputation || 0) - 5);
        resultMsg = `You tried to negotiate but couldn't back it up with cash. -5 Rep. They see weakness.`;
      }
      if (state.messageLog) state.messageLog.push('📱 Negotiated with rivals. ' + (canPay ? '-$' + bribeCost.toLocaleString() : 'Failed.'));
      break;
    }
    default: {
      // Story arc effects
      if (effect.startsWith('accept_story_')) {
        const arc = effect.replace('accept_story_', '');
        state.reputation = (state.reputation || 0) + 2;
        // Give different rewards based on story arc
        if (arc === 'rosa_clinic') {
          state.health = Math.min(state.maxHealth || 100, (state.health || 100) + 20);
          resultMsg = 'You visited Dr. Rosa\'s clinic. She patched you up (+20 HP) and gave you intel on local police schedules. +2 Rep.';
        } else if (arc === 'vega_deal') {
          state.heat = Math.max(0, (state.heat || 0) - 10);
          resultMsg = 'You met Detective Vega at the diner. An uneasy alliance — he\'ll look the other way for now. -10 Heat. +2 Rep.';
        } else if (arc === 'community') {
          const donation = 1000;
          if ((state.cash || 0) >= donation) {
            state.cash -= donation;
            if (typeof adjustRep === 'function') adjustRep(state, 'communityRep', 5);
            resultMsg = `You donated $${donation.toLocaleString()} to the community center. Mama Lucia spread the word. +5 Community Rep, +2 Rep.`;
          } else {
            resultMsg = 'You went to see Mama Lucia but couldn\'t afford to help right now. +2 Rep for showing up.';
          }
        } else if (arc === 'cubano_alliance') {
          if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 3);
          resultMsg = 'El Cubano proposed a partnership for future operations. A powerful ally gained. +3 Street Cred, +2 Rep.';
        } else if (arc === 'backstory') {
          if (typeof adjustRep === 'function') adjustRep(state, 'fear', 2);
          resultMsg = 'You met the mysterious stranger. They know about your past — and your brother. The truth is darker than you thought. +2 Fear, +2 Rep.';
        } else {
          resultMsg = 'You followed up on the lead. +2 Reputation. New opportunities may open up.';
        }
        if (state.messageLog) state.messageLog.push('📱 Story: ' + resultMsg.split('.')[0] + '.');
      } else if (effect.startsWith('decline_story_')) {
        resultMsg = 'You ignored the message. Some doors close when you don\'t walk through them.';
      }
      break;
    }
  }

  // Store the result so the phone UI can show it
  msg._resultMsg = resultMsg;
}

// ============================================================
// UTILITY: Phone status for UI
// ============================================================
function getPhoneStatus(state) {
  if (!state.phone) return { burnerType: 'none', age: 0, wiretapped: false, unread: 0, inboxSize: 0 };
  const phone = state.phone;
  const burnerDef = BURNER_PHONE_TYPES.find(b => b.id === phone.burnerType);

  return {
    burnerType: phone.burnerType,
    burnerName: burnerDef ? burnerDef.name : 'Unknown',
    age: phone.burnerAge,
    maxAge: PHONE_MAX_AGE,
    shouldReplace: phone.burnerAge >= PHONE_MAX_AGE - 5,
    wiretapped: phone.wiretapped,
    unread: phone.unreadCount,
    inboxSize: phone.inbox.length,
    maxInbox: INBOX_MAX_SIZE,
  };
}

// ============================================================
// UTILITY: Add contact
// ============================================================
function addPhoneContact(state, name, role) {
  if (!state.phone) state.phone = initPhoneState();
  const exists = state.phone.contacts.find(c => c.name === name && c.role === role);
  if (exists) return { success: false, reason: 'Contact already exists.' };

  state.phone.contacts.push({ name: name, role: role, addedDay: state.day || 1 });
  return { success: true };
}

// ============================================================
// UTILITY: Get messages by category
// ============================================================
function getMessagesByCategory(state, category) {
  if (!state.phone) return [];
  return state.phone.inbox.filter(m => m.category === category);
}

// ============================================================
// UTILITY: Get high priority unread messages
// ============================================================
function getHighPriorityUnread(state) {
  if (!state.phone) return [];
  return state.phone.inbox.filter(m => {
    if (m.read) return false;
    const catDef = MESSAGE_CATEGORIES[m.category];
    return catDef && catDef.priority === 'high';
  });
}

// Bridge function for UI compatibility (game-ui.js calls markMessageRead)
function markMessageRead(state, messageIndex) {
  return readMessage(state, messageIndex);
}
