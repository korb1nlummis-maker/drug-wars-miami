// ============================================================
// Drug Wars: Miami Vice Edition — Nightlife System
// ============================================================

const SOCIAL_EVENTS = [
  {
    id: 'club_night',
    name: 'Club Night',
    emoji: '🎶',
    cost: 2000,
    stressRelief: 15,
    connectionChance: 0.30,
    risks: ['fight', 'police_raid'],
    unlockLevel: 2,
    cooldown: 1,
    description: 'Hit the hottest clubs on Ocean Drive. Loud music, cold drinks, dangerous people.'
  },
  {
    id: 'private_party',
    name: 'Private Party',
    emoji: '🍾',
    cost: 10000,
    stressRelief: 20,
    connectionChance: 0.50,
    risks: ['fight', 'police_raid', 'faction_confrontation'],
    unlockLevel: 5,
    cooldown: 3,
    factionLeaders: true,
    description: 'Exclusive mansion party. Faction leaders rub shoulders with the elite.'
  },
  {
    id: 'charity_gala',
    name: 'Charity Gala',
    emoji: '🎭',
    cost: 50000,
    stressRelief: 25,
    connectionChance: 0.40,
    risks: ['police_raid'],
    unlockLevel: 8,
    cooldown: 7,
    politicalContacts: true,
    publicImageBonus: 15,
    launderingOpportunity: true,
    description: 'Black-tie affair with politicians and socialites. Smile for the cameras.'
  },
  {
    id: 'sports_event',
    name: 'Sports Event',
    emoji: '🏈',
    cost: 5000,
    stressRelief: 10,
    connectionChance: 0.25,
    risks: ['fight', 'rival_confrontation'],
    unlockLevel: 3,
    cooldown: 2,
    gamblingOpportunity: true,
    description: 'Dolphins game at Hard Rock. Casual deals in the luxury boxes.'
  },
  {
    id: 'art_basel',
    name: 'Art Basel',
    emoji: '🎨',
    cost: 25000,
    stressRelief: 30,
    connectionChance: 0.60,
    risks: ['police_raid', 'rival_confrontation'],
    unlockLevel: 6,
    cooldown: 5,
    annual: true,
    availableDays: [350, 351, 352, 353, 354, 355, 356, 357],
    internationalContacts: true,
    touristInflux: true,
    description: 'Annual art extravaganza. International money flows freely in Wynwood.'
  }
];

const VIP_THRESHOLD = 20000;

const NIGHTLIFE_NIGHTLIFE_CONTACT_TYPES = ['buyer', 'seller', 'informant', 'enforcer'];

const CONTACT_FIRST_NAMES = [
  'Marco', 'Diego', 'Luis', 'Rico', 'Tony', 'Hector',
  'Maria', 'Sofia', 'Elena', 'Rosa', 'Catalina', 'Alejandro'
];

const CONTACT_LAST_NAMES = [
  'Mendez', 'Vargas', 'Santos', 'Delgado', 'Fuentes', 'Ortega',
  'Castillo', 'Navarro', 'Guerrero', 'Pacheco', 'Rios', 'Salazar'
];

const EVENT_OUTCOMES = [
  'new_contact',
  'faction_encounter',
  'business_opportunity',
  'trouble',
  'romance_encounter'
];

// ---- State ----

function initNightlifeState() {
  return {
    eventsAttended: 0,
    vipStatus: {},
    connections: [],
    cooldown: 0,
    totalSpent: 0,
    venueSpending: {},
    eventCooldowns: {},
    lastEventDay: -99
  };
}

// ---- Daily Processing ----

function processNightlifeDaily(state) {
  const nl = state.nightlife;
  if (!nl) return;

  if (nl.cooldown > 0) {
    nl.cooldown--;
  }

  if (nl.eventCooldowns) {
    for (const eventId of Object.keys(nl.eventCooldowns)) {
      if (nl.eventCooldowns[eventId] > 0) {
        nl.eventCooldowns[eventId]--;
      }
    }
  }

  if (nl.connections) {
    for (let i = nl.connections.length - 1; i >= 0; i--) {
      const conn = nl.connections[i];
      if (conn.followUpDay !== undefined && conn.followUpDay > 0) {
        conn.followUpDay--;
        if (conn.followUpDay === 0) {
          conn.active = true;
          conn.followUpDay = undefined;
        }
      }
    }
  }
}

// ---- Available Events ----

function getAvailableEvents(state, playerLevel, currentDay) {
  return SOCIAL_EVENTS.filter(event => {
    if (playerLevel < event.unlockLevel) return false;
    if (state.eventCooldowns[event.id] > 0) return false;
    if (event.annual && event.availableDays && !event.availableDays.includes(currentDay % 365)) {
      return false;
    }
    return true;
  });
}

// ---- Attend Event ----

function attendEvent(state, eventId, playerLevel, currentDay) {
  const event = SOCIAL_EVENTS.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'Unknown event.' };
  if (playerLevel < event.unlockLevel) return { success: false, message: 'Level too low.' };
  if (state.eventCooldowns[event.id] > 0) return { success: false, message: 'Event on cooldown.' };
  if (event.annual && event.availableDays && !event.availableDays.includes(currentDay % 365)) {
    return { success: false, message: 'Art Basel is not happening right now.' };
  }

  state.totalSpent += event.cost;
  state.venueSpending[event.id] = (state.venueSpending[event.id] || 0) + event.cost;
  state.eventsAttended++;
  state.eventCooldowns[event.id] = event.cooldown;
  state.lastEventDay = currentDay;

  if (state.venueSpending[event.id] >= VIP_THRESHOLD && !state.vipStatus[event.id]) {
    state.vipStatus[event.id] = true;
  }

  const results = {
    success: true,
    cost: event.cost,
    stressRelief: event.stressRelief,
    outcomes: [],
    vipUnlocked: false,
    publicImageBonus: 0
  };

  if (state.vipStatus[event.id] && !state.vipStatus[event.id + '_announced']) {
    results.vipUnlocked = true;
    state.vipStatus[event.id + '_announced'] = true;
  }

  if (event.publicImageBonus) {
    results.publicImageBonus = event.publicImageBonus;
  }

  const outcome = rollOutcome(state, event);
  results.outcomes.push(outcome);

  if (isVipAt(state, event.id) && Math.random() < 0.3) {
    const bonusOutcome = rollOutcome(state, event);
    results.outcomes.push(bonusOutcome);
  }

  return results;
}

// ---- Outcome Rolling ----

function rollOutcome(state, event) {
  const roll = Math.random();
  const vip = isVipAt(state, event.id);

  if (roll < event.connectionChance) {
    return generateContactOutcome(state, event);
  } else if (roll < event.connectionChance + 0.15) {
    return { type: 'faction_encounter', positive: Math.random() > 0.4, detail: 'A faction figure notices you.' };
  } else if (roll < event.connectionChance + 0.30) {
    return generateBusinessOpportunity(event);
  } else if (roll < event.connectionChance + 0.40) {
    if (vip && Math.random() < 0.5) {
      return { type: 'trouble_averted', detail: 'VIP status: you got a warning and slipped out the back.' };
    }
    const riskType = event.risks[Math.floor(Math.random() * event.risks.length)];
    return { type: 'trouble', riskType, detail: `Trouble breaks out: ${riskType.replace('_', ' ')}.` };
  } else {
    return { type: 'romance_encounter', detail: 'Someone catches your eye across the room.' };
  }
}

function generateContactOutcome(state, event) {
  const firstName = CONTACT_FIRST_NAMES[Math.floor(Math.random() * CONTACT_FIRST_NAMES.length)];
  const lastName = CONTACT_LAST_NAMES[Math.floor(Math.random() * CONTACT_LAST_NAMES.length)];
  const contactType = NIGHTLIFE_CONTACT_TYPES[Math.floor(Math.random() * NIGHTLIFE_CONTACT_TYPES.length)];

  const bonuses = {
    buyer: { priceBonus: Math.floor(Math.random() * 10) + 5 },
    seller: { discountPercent: Math.floor(Math.random() * 15) + 5 },
    informant: { intelBonus: true },
    enforcer: { combatBonus: Math.floor(Math.random() * 3) + 1 }
  };

  const contact = {
    name: `${firstName} ${lastName}`,
    type: contactType,
    bonus: bonuses[contactType],
    metAt: event.id,
    active: false,
    followUpDay: Math.floor(Math.random() * 3) + 1,
    international: !!event.internationalContacts,
    political: !!event.politicalContacts
  };

  state.connections.push(contact);

  return {
    type: 'new_contact',
    contact,
    detail: `Met ${contact.name}, a ${contactType}. They'll reach out in ${contact.followUpDay} days.`
  };
}

function generateBusinessOpportunity(event) {
  const opportunities = [
    { type: 'discount', detail: '10% discount on your next purchase.', discountPercent: 10 },
    { type: 'market_info', detail: 'Insider tip: prices shifting in Little Havana.', location: 'little_havana' },
    { type: 'bulk_deal', detail: 'A bulk deal is available through a friend of a friend.', bulkMultiplier: 1.5 }
  ];

  if (event.launderingOpportunity) {
    opportunities.push({ type: 'laundering', detail: 'A banker offers to move money through shell companies.', launderAmount: 50000 });
  }
  if (event.gamblingOpportunity) {
    opportunities.push({ type: 'gambling', detail: 'High-stakes poker game in the back room.', maxBet: 20000 });
  }

  return { type: 'business_opportunity', ...opportunities[Math.floor(Math.random() * opportunities.length)] };
}

// ---- VIP ----

function isVipAt(state, eventType) {
  return !!state.vipStatus[eventType];
}

// ---- Connection Bonuses ----

function getConnectionBonuses(state) {
  const bonuses = {
    priceBonus: 0,
    discountPercent: 0,
    intelSources: 0,
    combatBonus: 0,
    internationalContacts: 0,
    politicalContacts: 0
  };

  for (const conn of state.connections) {
    if (!conn.active) continue;

    if (conn.bonus.priceBonus) bonuses.priceBonus += conn.bonus.priceBonus;
    if (conn.bonus.discountPercent) bonuses.discountPercent += conn.bonus.discountPercent;
    if (conn.bonus.intelBonus) bonuses.intelSources++;
    if (conn.bonus.combatBonus) bonuses.combatBonus += conn.bonus.combatBonus;
    if (conn.international) bonuses.internationalContacts++;
    if (conn.political) bonuses.politicalContacts++;
  }

  return bonuses;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SOCIAL_EVENTS,
    VIP_THRESHOLD,
    NIGHTLIFE_CONTACT_TYPES,
    initNightlifeState,
    processNightlifeDaily,
    getAvailableEvents,
    attendEvent,
    isVipAt,
    getConnectionBonuses
  };
}
