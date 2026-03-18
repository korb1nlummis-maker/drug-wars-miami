// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Political Corruption & Relationships
// ============================================================

// ============================================================
// CORRUPTIBLE OFFICIALS
// ============================================================
const OFFICIAL_TYPES = [
  { id: 'beat_cop', name: 'Beat Cop', emoji: '👮', tier: 1,
    baseCost: 500, corruptionThreshold: 20, riskBase: 0.05,
    benefits: ['Ignore minor infractions', 'Tip off patrol routes'],
    desc: 'A patrol officer on the take. Limited but useful.' },
  { id: 'detective', name: 'Detective', emoji: '🕵️', tier: 2,
    baseCost: 5000, corruptionThreshold: 40, riskBase: 0.08,
    benefits: ['Leak investigation details', 'Slow investigations'],
    desc: 'Inside man in the detective squad.' },
  { id: 'judge', name: 'Judge', emoji: '⚖️', tier: 3,
    baseCost: 25000, corruptionThreshold: 60, riskBase: 0.10,
    benefits: ['Reduced sentences', 'Dismiss charges', 'Favorable rulings'],
    desc: 'A judge who can be persuaded. Expensive but powerful.' },
  { id: 'prosecutor', name: 'Prosecutor', emoji: '📋', tier: 3,
    baseCost: 20000, corruptionThreshold: 55, riskBase: 0.12,
    benefits: ['Drop charges', 'Reduce evidence quality'],
    desc: 'Can make evidence disappear.' },
  { id: 'city_council', name: 'City Council Member', emoji: '🏛️', tier: 4,
    baseCost: 50000, corruptionThreshold: 70, riskBase: 0.15,
    benefits: ['Zoning decisions', 'Contract awards', 'Policy influence'],
    desc: 'Political power at the city level.' },
  { id: 'mayor', name: 'Mayor\'s Office', emoji: '🎖️', tier: 5,
    baseCost: 200000, corruptionThreshold: 85, riskBase: 0.20,
    benefits: ['Police priorities', 'Major policy changes', 'Full city influence'],
    desc: 'The top of the city power structure. Enormous risk.' },
  // NG+ only
  { id: 'state_senator', name: 'State Senator', emoji: '🏛️', tier: 6,
    baseCost: 500000, corruptionThreshold: 90, riskBase: 0.25, ngPlusOnly: true,
    benefits: ['State-level policy', 'Federal investigation interference'],
    desc: 'State-level political power. NG+ only.' },
  { id: 'federal_agent', name: 'Federal Agent', emoji: '🕴️', tier: 6,
    baseCost: 300000, corruptionThreshold: 95, riskBase: 0.30, ngPlusOnly: true,
    benefits: ['Federal case sabotage', 'Witness manipulation'],
    desc: 'A mole in the federal agencies. Incredibly dangerous.' },
];

const CORRUPTION_METHODS = [
  { id: 'bribe', name: 'Direct Bribe', emoji: '💰', costMultiplier: 1.0, riskMultiplier: 1.0,
    repReq: 0, desc: 'Cash in an envelope. Simple and direct.' },
  { id: 'campaign', name: 'Campaign Contribution', emoji: '🗳️', costMultiplier: 1.5, riskMultiplier: 0.5,
    repReq: 20, desc: 'Legal-ish donation. Lower risk, higher cost.' },
  { id: 'blackmail', name: 'Blackmail', emoji: '📸', costMultiplier: 0.3, riskMultiplier: 1.5,
    repReq: 40, requiresIntel: true, desc: 'Use their secrets against them. Cheap but dangerous.' },
  { id: 'favor', name: 'Favor Trading', emoji: '🤝', costMultiplier: 0.5, riskMultiplier: 0.7,
    repReq: 30, desc: 'Exchange favors. Builds long-term relationship.' },
  { id: 'intimidation', name: 'Intimidation', emoji: '💀', costMultiplier: 0.1, riskMultiplier: 2.0,
    repReq: 50, requiresFear: true, desc: 'They do it or else. Very risky but nearly free.' },
];

// ============================================================
// RELATIONSHIPS / CONTACTS
// ============================================================
const CONTACT_TYPES = [
  { id: 'informant', name: 'Street Informant', emoji: '👂', tier: 1,
    maintCost: 200, intel: 1, trust: 20,
    desc: 'Eyes and ears on the street. Low-level intel.' },
  { id: 'fixer', name: 'The Fixer', emoji: '🔧', tier: 2,
    maintCost: 1000, intel: 2, trust: 40,
    desc: 'Can arrange meetings, solve problems. Versatile.' },
  { id: 'lawyer', name: 'Criminal Lawyer', emoji: '⚖️', tier: 2,
    maintCost: 2000, intel: 1, trust: 30,
    desc: 'Legal protection. Knows the system.' },
  { id: 'banker', name: 'Dirty Banker', emoji: '🏦', tier: 3,
    maintCost: 5000, intel: 2, trust: 50,
    desc: 'Launders money. Access to financial systems.' },
  { id: 'journalist', name: 'Journalist', emoji: '📰', tier: 2,
    maintCost: 1500, intel: 3, trust: 35,
    desc: 'Plants stories, discovers secrets. Double-edged sword.' },
  { id: 'arms_dealer', name: 'Arms Dealer', emoji: '🔫', tier: 3,
    maintCost: 3000, intel: 1, trust: 45,
    desc: 'Heavy weapons and equipment supplier.' },
  { id: 'diplomat', name: 'Diplomatic Contact', emoji: '🌐', tier: 4,
    maintCost: 10000, intel: 3, trust: 60,
    desc: 'Foreign embassy connections. Import/export leverage.' },
  { id: 'tech_expert', name: 'Tech Expert', emoji: '💻', tier: 3,
    maintCost: 4000, intel: 2, trust: 40,
    desc: 'Counter-surveillance, encryption, communications.' },
];

// ============================================================
// POLITICAL STATE
// ============================================================
function initPoliticsState() {
  return {
    corruptOfficials: {}, // { officialId: { loyalty, bribesPaid, exposureRisk, method, dayCorrupted } }
    contacts: {}, // { contactId: { trust, intel, dayRecruited, lastPaid } }
    intelGathered: [], // intelligence items
    totalBribesPaid: 0,
    totalContactsMade: 0,
    scandals: 0, // times exposed
    politicalInfluence: 0, // 0-100
    electionCycle: 0, // tracks elections
  };
}

// ============================================================
// CORRUPT AN OFFICIAL
// ============================================================
function corruptOfficial(state, officialId, methodId) {
  const official = OFFICIAL_TYPES.find(o => o.id === officialId);
  if (!official) return { success: false, msg: 'Unknown official' };

  if (official.ngPlusOnly && !state.newGamePlus) return { success: false, msg: 'Only available in New Game+' };

  if (!state.politics) state.politics = initPoliticsState();
  const pol = state.politics;

  if (pol.corruptOfficials[officialId]) return { success: false, msg: 'Already have this contact' };

  const method = CORRUPTION_METHODS.find(m => m.id === methodId) || CORRUPTION_METHODS[0];

  // Check reputation requirement
  if ((state.reputation || 0) < method.repReq) {
    return { success: false, msg: `Need ${method.repReq} reputation for ${method.name}` };
  }

  // Check special requirements
  if (method.requiresIntel && (pol.intelGathered || []).length < 3) {
    return { success: false, msg: 'Need more intel to blackmail. Gather intelligence first.' };
  }
  if (method.requiresFear && state.rep && (state.rep.fear || 0) < 50) {
    return { success: false, msg: 'Need Fear reputation 50+ to intimidate' };
  }

  // Calculate cost
  const cost = Math.round(official.baseCost * method.costMultiplier);
  if (state.cash < cost) return { success: false, msg: `Need $${cost.toLocaleString()}` };

  // Check if corruption attempt succeeds
  const successChance = 0.6 + (state.reputation || 0) * 0.003;
  if (Math.random() > successChance) {
    state.cash -= Math.round(cost * 0.3); // Lost partial payment
    state.heat = Math.min(100, state.heat + 10);
    return { success: false, msg: `${official.emoji} ${official.name} refused the approach! Lost $${Math.round(cost * 0.3).toLocaleString()} and gained heat.` };
  }

  state.cash -= cost;
  pol.corruptOfficials[officialId] = {
    loyalty: 50,
    bribesPaid: cost,
    exposureRisk: Math.round(official.riskBase * method.riskMultiplier * 100),
    method: methodId,
    dayCorrupted: state.day,
  };
  pol.totalBribesPaid += cost;

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'trust', 2);
    adjustRep(state, 'heatSignature', official.tier);
  }

  return { success: true, msg: `${official.emoji} ${official.name} is now on your payroll via ${method.name}. Cost: $${cost.toLocaleString()}` };
}

// ============================================================
// RECRUIT CONTACT
// ============================================================
function recruitContact(state, contactId) {
  const contact = CONTACT_TYPES.find(c => c.id === contactId);
  if (!contact) return { success: false, msg: 'Unknown contact type' };

  if (!state.politics) state.politics = initPoliticsState();
  const pol = state.politics;

  if (pol.contacts[contactId]) return { success: false, msg: 'Already have this contact' };

  const recruitCost = contact.maintCost * 5;
  if (state.cash < recruitCost) return { success: false, msg: `Need $${recruitCost.toLocaleString()} to recruit` };

  state.cash -= recruitCost;
  pol.contacts[contactId] = {
    trust: contact.trust,
    intel: contact.intel,
    dayRecruited: state.day,
    lastPaid: state.day,
  };
  pol.totalContactsMade++;

  return { success: true, msg: `${contact.emoji} Recruited ${contact.name}! Maintenance: $${contact.maintCost.toLocaleString()}/day` };
}

// ============================================================
// GATHER INTEL
// ============================================================
function gatherIntel(state) {
  if (!state.politics) state.politics = initPoliticsState();
  const pol = state.politics;

  // Intel gathered based on contacts
  let totalIntel = 0;
  for (const [cId, cData] of Object.entries(pol.contacts)) {
    const contact = CONTACT_TYPES.find(c => c.id === cId);
    if (contact) totalIntel += contact.intel;
  }

  if (totalIntel === 0) return { success: false, msg: 'No intelligence contacts! Recruit contacts first.' };

  const intelTypes = [
    'Police patrol schedules for next week',
    'Upcoming DEA operation in the area',
    'Rival faction shipment details',
    'Corrupt official\'s secret meeting',
    'Informant identity in your crew',
    'Location of rival\'s stash house',
    'Federal investigation timeline',
    'City council voting plans',
    'Drug price trend prediction',
    'Law enforcement budget changes',
    'Witness protection safe house location',
    'Undercover officer identity',
  ];

  const intel = intelTypes[Math.floor(Math.random() * intelTypes.length)];
  pol.intelGathered.push({ info: intel, day: state.day, quality: totalIntel });
  if (pol.intelGathered.length > 20) pol.intelGathered.shift();

  return { success: true, msg: `🔍 Intel gathered: "${intel}" (Quality: ${totalIntel})` };
}

// ============================================================
// USE CORRUPT OFFICIAL
// ============================================================
function useCorruptOfficial(state, officialId, action) {
  if (!state.politics) return { success: false, msg: 'No political connections' };
  const pol = state.politics;
  const official = OFFICIAL_TYPES.find(o => o.id === officialId);
  const data = pol.corruptOfficials[officialId];
  if (!official || !data) return { success: false, msg: 'No contact with this official' };

  // Pay for the favor
  const favorCost = Math.round(official.baseCost * 0.5);
  if (state.cash < favorCost) return { success: false, msg: `Need $${favorCost.toLocaleString()} for this favor` };

  state.cash -= favorCost;
  data.bribesPaid += favorCost;

  // Exposure risk increases with each use
  data.exposureRisk = Math.min(100, data.exposureRisk + 5);

  // Apply benefit based on action
  let msg = '';
  if (action === 'reduce_heat') {
    const reduction = 10 + official.tier * 5;
    state.heat = Math.max(0, state.heat - reduction);
    if (state.heatSystem) {
      state.heatSystem.local = Math.max(0, (state.heatSystem.local || 0) - reduction);
      state.heatSystem.city = Math.max(0, (state.heatSystem.city || 0) - reduction * 0.5);
    }
    msg = `${official.emoji} ${official.name} pulled strings. Heat reduced by ${reduction}.`;
  } else if (action === 'slow_investigation') {
    if (state.investigation) {
      state.investigation.points = Math.max(0, state.investigation.points - 20);
    }
    msg = `${official.emoji} ${official.name} slowed the investigation. -20 investigation points.`;
  } else if (action === 'dismiss_charges' && (official.id === 'judge' || official.id === 'prosecutor')) {
    if (state.courtCase) {
      state.courtCase = null;
      msg = `${official.emoji} Charges dismissed by corrupt ${official.name}!`;
    } else {
      msg = `${official.emoji} No active court case to dismiss.`;
    }
  } else if (action === 'policy_change' && official.tier >= 4) {
    pol.politicalInfluence = Math.min(100, (pol.politicalInfluence || 0) + 10);
    msg = `${official.emoji} ${official.name} changed a policy in your favor. Political influence: ${pol.politicalInfluence}`;
  } else {
    msg = `${official.emoji} ${official.name} did you a favor. Influence grows.`;
    pol.politicalInfluence = Math.min(100, (pol.politicalInfluence || 0) + 3);
  }

  return { success: true, msg };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processPoliticsDaily(state) {
  if (!state.politics) return [];
  const pol = state.politics;
  const msgs = [];

  // Pay contact maintenance
  for (const [cId, cData] of Object.entries(pol.contacts)) {
    const contact = CONTACT_TYPES.find(c => c.id === cId);
    if (!contact) continue;

    if (state.cash >= contact.maintCost) {
      state.cash -= contact.maintCost;
    } else {
      // Can't pay — contact gets angry
      cData.trust = Math.max(0, cData.trust - 5);
      if (cData.trust <= 0) {
        delete pol.contacts[cId];
        msgs.push(`${contact.emoji} ${contact.name} left due to non-payment!`);
      }
    }
  }

  // Exposure risk check for corrupt officials
  for (const [oId, oData] of Object.entries(pol.corruptOfficials)) {
    const official = OFFICIAL_TYPES.find(o => o.id === oId);
    if (!official) continue;

    // Daily exposure chance
    if (Math.random() * 100 < oData.exposureRisk * 0.1) {
      // Scandal!
      pol.scandals++;
      state.heat = Math.min(100, state.heat + 20);
      if (state.investigation) {
        state.investigation.points = Math.min(100, state.investigation.points + 25);
      }
      delete pol.corruptOfficials[oId];
      msgs.push(`📰 SCANDAL! Your corrupt ${official.name} was exposed! Massive heat increase!`);

      if (typeof adjustRep === 'function') {
        adjustRep(state, 'heatSignature', 15);
        adjustRep(state, 'publicImage', -10);
      }
    }

    // Loyalty decay
    oData.loyalty = Math.max(10, oData.loyalty - 0.5);
  }

  // Political influence decay
  if (pol.politicalInfluence > 0 && state.day % 10 === 0) {
    pol.politicalInfluence = Math.max(0, pol.politicalInfluence - 2);
  }

  // Election events (every 365 days)
  if (state.day > 0 && state.day % 365 === 0) {
    pol.electionCycle++;
    msgs.push('🗳️ Election season! Political landscape is shifting...');
    // Some officials may change
    for (const [oId, oData] of Object.entries(pol.corruptOfficials)) {
      if (Math.random() < 0.2) {
        delete pol.corruptOfficials[oId];
        const official = OFFICIAL_TYPES.find(o => o.id === oId);
        msgs.push(`🏛️ ${official ? official.name : oId} lost their position in the election!`);
      }
    }
  }

  return msgs;
}
