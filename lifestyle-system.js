// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Lifestyle, Health/Stress, News, Day/Night
// ============================================================

// ============================================================
// DAY/NIGHT CYCLE
// ============================================================
const TIME_PERIODS = [
  { id: 'morning', name: 'Morning', emoji: '🌅', hours: '6AM-12PM',
    effects: { policePresence: 1.2, dealDiscount: 0, customerTraffic: 0.8 } },
  { id: 'afternoon', name: 'Afternoon', emoji: '☀️', hours: '12PM-6PM',
    effects: { policePresence: 1.0, dealDiscount: 0, customerTraffic: 1.0 } },
  { id: 'evening', name: 'Evening', emoji: '🌆', hours: '6PM-12AM',
    effects: { policePresence: 0.7, dealDiscount: 0.05, customerTraffic: 1.3 } },
  { id: 'night', name: 'Night', emoji: '🌙', hours: '12AM-6AM',
    effects: { policePresence: 0.4, dealDiscount: 0.1, customerTraffic: 0.6, dangerBonus: 1.5 } },
];

function getTimePeriod(state) {
  // Each game day has 4 time periods. Advancing time moves through them.
  const timeIndex = (state.lifestyle ? state.lifestyle.timeOfDay : 0) || 0;
  return TIME_PERIODS[timeIndex % TIME_PERIODS.length];
}

function advanceTimePeriod(state) {
  if (!state.lifestyle) state.lifestyle = initLifestyleState();
  state.lifestyle.timeOfDay = ((state.lifestyle.timeOfDay || 0) + 1) % 4;
  return getTimePeriod(state);
}

// ============================================================
// NEWS SYSTEM
// ============================================================
const NEWS_TEMPLATES = [
  // Market news
  { id: 'drug_bust', category: 'crime', templates: [
    '🚔 Major {drug} bust in {city}: {amount} units seized, street prices surge!',
    '👮 Authorities crack down on {drug} trade in {city}.',
  ], effect: { priceBoost: 1.3, heat: 5 } },
  { id: 'celebrity_od', category: 'culture', templates: [
    '💀 Celebrity overdose sparks {drug} demand spike in {city}.',
    '📺 TV star caught with {drug} — demand skyrockets!',
  ], effect: { demandBoost: 1.5 } },
  { id: 'new_supplier', category: 'market', templates: [
    '📦 New {drug} supplier floods {city} market — prices plummet!',
    '🚢 Large {drug} shipment arrives in {city}. Prices falling.',
  ], effect: { priceBoost: 0.6 } },
  { id: 'gang_war', category: 'crime', templates: [
    '⚔️ Gang war erupts in {city}! {drug} supply chain disrupted.',
    '💥 Rival gangs battle over {city} turf. Trade routes affected.',
  ], effect: { priceBoost: 1.4, danger: 1.3 } },
  { id: 'policy_change', category: 'politics', templates: [
    '🏛️ {city} mayor announces new anti-drug task force.',
    '📋 Federal investigation targets {city} drug networks.',
  ], effect: { heat: 10, policePresence: 1.5 } },
  { id: 'economic_boom', category: 'economy', templates: [
    '📈 Economic boom in {city} — more cash on the streets.',
    '💰 {city} real estate market surges. Money is flowing.',
  ], effect: { demandBoost: 1.2, priceBoost: 1.1 } },
  { id: 'recession', category: 'economy', templates: [
    '📉 {city} hit by economic downturn. Demand for cheap {drug} rises.',
    '🏚️ Unemployment spikes in {city}. Hard times ahead.',
  ], effect: { priceBoost: 0.8, demandBoost: 1.3 } },
  { id: 'border_crackdown', category: 'politics', templates: [
    '🚧 Border patrol cracks down on {drug} smuggling routes.',
    '🛃 International {drug} supply lines disrupted by customs.',
  ], effect: { priceBoost: 1.5, importRisk: 1.5 } },
  { id: 'lab_explosion', category: 'crime', templates: [
    '💥 Underground {drug} lab explodes in {city}. Supply reduced.',
    '🔥 Fire destroys major {drug} processing facility.',
  ], effect: { priceBoost: 1.6 } },
  { id: 'corruption_scandal', category: 'politics', templates: [
    '🏛️ Police corruption scandal in {city}! Officers on the take exposed.',
    '📰 {city} judge caught accepting bribes from dealers.',
  ], effect: { heat: -10, policePresence: 0.7 } },
];

function generateDailyNews(state) {
  if (!state.lifestyle) state.lifestyle = initLifestyleState();

  // 30% chance of a news event per day
  if (Math.random() > 0.3) return null;

  const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
  const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
  const locations = typeof LOCATIONS !== 'undefined' ? LOCATIONS : [];

  const drug = drugs[Math.floor(Math.random() * drugs.length)];
  const city = locations[Math.floor(Math.random() * locations.length)];

  const msgTemplate = template.templates[Math.floor(Math.random() * template.templates.length)];
  const msg = msgTemplate
    .replace('{drug}', drug ? drug.name : 'drugs')
    .replace('{city}', city ? city.name : 'the city')
    .replace('{amount}', Math.floor(50 + Math.random() * 500));

  const newsItem = {
    id: template.id,
    category: template.category,
    msg,
    effect: template.effect,
    drugId: drug ? drug.id : null,
    locationId: city ? city.id : null,
    day: state.day,
  };

  // Apply effects
  if (template.effect.heat && city && city.id === state.currentLocation) {
    state.heat = Math.max(0, Math.min(100, state.heat + template.effect.heat));
  }

  // Store in news feed
  if (!state.lifestyle.newsFeed) state.lifestyle.newsFeed = [];
  state.lifestyle.newsFeed.unshift(newsItem);
  if (state.lifestyle.newsFeed.length > 20) state.lifestyle.newsFeed.pop();

  return newsItem;
}

// ============================================================
// HEALTH & STRESS SYSTEM
// ============================================================
const STRESS_SOURCES = {
  combat: 8,
  arrest: 15,
  crew_death: 20,
  crew_betrayal: 25,
  shipment_seized: 10,
  war_battle: 12,
  close_call: 5,
  big_deal: 3,
  investigation_escalation: 15,
};

const STRESS_RELIEF = [
  { id: 'bar', name: 'Hit the Bar', emoji: '🍺', cost: 500, stressRelief: 10, healthRisk: 5,
    desc: 'Drink your worries away. Might get sloppy.' },
  { id: 'club', name: 'Night Club', emoji: '🎶', cost: 2000, stressRelief: 15, healthRisk: 0,
    desc: 'Dance the night away at an exclusive club.' },
  { id: 'vacation', name: 'Quick Vacation', emoji: '🏖️', cost: 10000, stressRelief: 40, healthRisk: 0,
    timeCost: 3, desc: '3-day getaway. Major stress relief.' },
  { id: 'therapy', name: 'Therapy Session', emoji: '🧠', cost: 3000, stressRelief: 20, healthRisk: 0,
    desc: 'Talk to a professional. Confidentially, of course.' },
  { id: 'gym', name: 'Gym Session', emoji: '💪', cost: 200, stressRelief: 8, healthBonus: 5,
    desc: 'Work out. Builds health and relieves stress.' },
  { id: 'spa', name: 'Luxury Spa', emoji: '🧖', cost: 5000, stressRelief: 25, healthBonus: 10,
    desc: 'Full spa treatment. Feel like a new person.' },
];

// ============================================================
// LIFESTYLE / SPENDING
// ============================================================
const LIFESTYLE_TIERS = [
  { id: 'homeless', name: 'Homeless', emoji: '🏚️', dailyCost: 0, stressRate: 5,
    repBonus: -5, publicImage: -10, desc: 'Living on the streets. Maximum suspicion.' },
  { id: 'modest', name: 'Modest', emoji: '🏠', dailyCost: 100, stressRate: 2,
    repBonus: 0, publicImage: 0, desc: 'Simple apartment. Keeping it low-key.' },
  { id: 'comfortable', name: 'Comfortable', emoji: '🏡', dailyCost: 500, stressRate: 0,
    repBonus: 2, publicImage: 5, desc: 'Nice place, decent car. Living well.' },
  { id: 'luxury', name: 'Luxury', emoji: '🏰', dailyCost: 2000, stressRate: -2,
    repBonus: 5, publicImage: 10, heatGain: 2, desc: 'Penthouse, sports car. Attracting attention.' },
  { id: 'kingpin', name: 'Kingpin Lifestyle', emoji: '👑', dailyCost: 10000, stressRate: -5,
    repBonus: 10, publicImage: 20, heatGain: 5, desc: 'Mansion, yacht, entourage. Everyone knows your name.' },
];

// ============================================================
// STATE
// ============================================================
function initLifestyleState() {
  return {
    timeOfDay: 0, // 0-3 index into TIME_PERIODS
    stress: 0, // 0-100
    lifestyleTier: 'modest',
    newsFeed: [],
    totalStressGained: 0,
    totalStressRelieved: 0,
    activitiesCompleted: 0,
    meals: 0, // track eating for health
    daysWithoutSleep: 0,
    flashSpending: 0, // tracks conspicuous consumption for heat
  };
}

// ============================================================
// STRESS MANAGEMENT
// ============================================================
function addStress(state, source, amount) {
  if (!state.lifestyle) state.lifestyle = initLifestyleState();
  const base = amount || STRESS_SOURCES[source] || 5;
  // Lifestyle tier modifies stress gain
  const tier = LIFESTYLE_TIERS.find(t => t.id === (state.lifestyle.lifestyleTier || 'modest')) || LIFESTYLE_TIERS[1];
  const modified = Math.max(0, base + (tier.stressRate || 0));
  state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + modified);
  state.lifestyle.totalStressGained = (state.lifestyle.totalStressGained || 0) + modified;

  // High stress effects
  if (state.lifestyle.stress >= 80) {
    // Random negative effects at high stress
    if (Math.random() < 0.1) {
      state.health = Math.max(1, state.health - 5);
      return '😰 Stress is taking a physical toll... (-5 HP)';
    }
  }
  if (state.lifestyle.stress >= 95) {
    // Breakdown risk
    if (Math.random() < 0.05) {
      state.lifestyle.stress = 60; // Forced reset with penalty
      state.health = Math.max(1, state.health - 15);
      return '🤯 BREAKDOWN! You collapsed from stress! (-15 HP, stress partially reset)';
    }
  }
  return null;
}

function doStressRelief(state, activityId) {
  const activity = STRESS_RELIEF.find(a => a.id === activityId);
  if (!activity) return { success: false, msg: 'Unknown activity' };

  if (state.cash < activity.cost) return { success: false, msg: `Need $${activity.cost.toLocaleString()}` };

  if (!state.lifestyle) state.lifestyle = initLifestyleState();

  state.cash -= activity.cost;
  state.lifestyle.stress = Math.max(0, (state.lifestyle.stress || 0) - activity.stressRelief);
  state.lifestyle.totalStressRelieved = (state.lifestyle.totalStressRelieved || 0) + activity.stressRelief;
  state.lifestyle.activitiesCompleted = (state.lifestyle.activitiesCompleted || 0) + 1;

  if (activity.healthBonus) state.health = Math.min(state.maxHealth, state.health + activity.healthBonus);
  if (activity.healthRisk && Math.random() < 0.2) state.health = Math.max(1, state.health - activity.healthRisk);

  // Time cost
  if (activity.timeCost) {
    for (let i = 0; i < activity.timeCost; i++) {
      state.day++;
    }
    return { success: true, msg: `${activity.emoji} ${activity.name}! Stress -${activity.stressRelief}. ${activity.timeCost} days passed.`, timeCost: activity.timeCost };
  }

  // Flash spending adds heat
  if (activity.cost >= 5000) {
    state.lifestyle.flashSpending = (state.lifestyle.flashSpending || 0) + activity.cost;
  }

  return { success: true, msg: `${activity.emoji} ${activity.name}! Stress -${activity.stressRelief}.${activity.healthBonus ? ` HP +${activity.healthBonus}.` : ''}` };
}

// ============================================================
// SET LIFESTYLE
// ============================================================
function setLifestyleTier(state, tierId) {
  const tier = LIFESTYLE_TIERS.find(t => t.id === tierId);
  if (!tier) return { success: false, msg: 'Unknown lifestyle' };

  if (!state.lifestyle) state.lifestyle = initLifestyleState();
  state.lifestyle.lifestyleTier = tierId;

  return { success: true, msg: `${tier.emoji} Lifestyle set to ${tier.name}. Daily cost: $${tier.dailyCost.toLocaleString()}.` };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processLifestyleDaily(state) {
  if (!state.lifestyle) state.lifestyle = initLifestyleState();
  const ls = state.lifestyle;
  const msgs = [];

  // Advance time period
  advanceTimePeriod(state);
  if (ls.timeOfDay === 0) {
    // New day cycle — process daily costs
    const tier = LIFESTYLE_TIERS.find(t => t.id === (ls.lifestyleTier || 'modest')) || LIFESTYLE_TIERS[1];

    // Deduct daily lifestyle cost
    if (tier.dailyCost > 0) {
      if (state.cash >= tier.dailyCost) {
        state.cash -= tier.dailyCost;
      } else {
        // Can't afford lifestyle — downgrade
        const currentIdx = LIFESTYLE_TIERS.indexOf(tier);
        if (currentIdx > 0) {
          ls.lifestyleTier = LIFESTYLE_TIERS[currentIdx - 1].id;
          msgs.push(`📉 Can't afford ${tier.name} lifestyle. Downgraded to ${LIFESTYLE_TIERS[currentIdx - 1].name}.`);
        }
      }
    }

    // Public image from lifestyle
    if (tier.publicImage && typeof adjustRep === 'function') {
      if (state.day % 7 === 0) { // Weekly
        adjustRep(state, 'publicImage', tier.publicImage > 0 ? 1 : -1);
      }
    }

    // Heat from flashy lifestyle
    if (tier.heatGain) {
      state.heat = Math.min(100, (state.heat || 0) + tier.heatGain * 0.3);
    }

    // Flash spending triggers IRS-style attention
    if ((ls.flashSpending || 0) > 50000 && state.day % 30 === 0) {
      msgs.push('💰 Your spending habits are attracting attention from financial investigators...');
      if (state.investigation) {
        state.investigation.points = Math.min(100, state.investigation.points + 5);
      }
      ls.flashSpending = Math.max(0, ls.flashSpending - 25000);
    }

    // Natural stress accumulation (based on empire size)
    const empireSize = (state.territory ? Object.keys(state.territory).length : 0) +
      (state.henchmen ? state.henchmen.length : 0);
    if (empireSize > 5) {
      ls.stress = Math.min(100, (ls.stress || 0) + Math.floor(empireSize / 5));
    }
  }

  // Generate news
  if (state.day % 1 === 0) { // Daily chance
    const news = generateDailyNews(state);
    if (news) msgs.push(`📰 ${news.msg}`);
  }

  return msgs;
}

// ============================================================
// GET TIME-BASED MODIFIERS
// ============================================================
function getTimeModifiers(state) {
  const period = getTimePeriod(state);
  return period.effects;
}
