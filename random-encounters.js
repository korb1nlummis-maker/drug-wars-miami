/**
 * random-encounters.js - Drug Wars: Miami Vice Edition
 * 150+ Random Encounters across 6 categories with branching outcomes
 * Categories: Street, Business, Crew, Law Enforcement, Faction, Wild Card
 */

// ============================================================
// ENCOUNTER SYSTEM FUNCTIONS
// ============================================================

function initEncounterState() {
  return {
    seenEncounters: [],
    encounterCooldowns: {},
    activeEncounter: null,
    encounterLog: [],
    companions: { pet: null, lookout: null },
    stats: { totalEncounters: 0, streakDaysWithout: 0 }
  };
}

function processEncountersDaily(state) {
  if (!state.encounters) return [];
  const enc = state.encounters;
  const msgs = [];

  // Pet companion stress relief
  if (enc.companions.pet && state.stress !== undefined) {
    state.stress = Math.max(0, (state.stress || 0) - 2);
  }
  // Lookout companion intel
  if (enc.companions.lookout && Math.random() < 0.15) {
    msgs.push('👁️ Your lookout spotted suspicious activity in the area.');
  }

  // Decrement cooldowns
  for (const key in enc.encounterCooldowns) {
    enc.encounterCooldowns[key]--;
    if (enc.encounterCooldowns[key] <= 0) delete enc.encounterCooldowns[key];
  }

  // Check if encounter triggers (35% base chance per day)
  if (enc.activeEncounter) return msgs;
  if (Math.random() > 0.35) {
    enc.stats.streakDaysWithout++;
    return msgs;
  }

  // Pick a valid encounter
  const eligible = RANDOM_ENCOUNTERS.filter(e => {
    if (enc.encounterCooldowns[e.id]) return false;
    if (e.condition && !checkEncounterCondition(state, e.condition)) return false;
    return true;
  });

  if (eligible.length === 0) return msgs;

  // Weight by category based on game state
  const weights = getEncounterWeights(state);
  const weighted = eligible.map(e => ({
    encounter: e,
    weight: weights[e.category] || 1
  }));
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  let picked = weighted[0].encounter;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) { picked = w.encounter; break; }
  }

  // Activate encounter (support dynamic outcomes)
  const dynamicOutcomes = (picked.dynamic && typeof picked.getOutcomes === 'function') ? picked.getOutcomes(state) : picked.outcomes;
  enc.activeEncounter = {
    id: picked.id,
    name: picked.name,
    emoji: picked.emoji,
    category: picked.category,
    description: picked.description,
    outcomes: dynamicOutcomes,
    resolved: false,
    resolvedText: null
  };
  enc.encounterCooldowns[picked.id] = picked.cooldown || 30;
  enc.stats.totalEncounters++;
  enc.stats.streakDaysWithout = 0;
  if (!enc.seenEncounters.includes(picked.id)) enc.seenEncounters.push(picked.id);

  msgs.push(`${picked.emoji} ENCOUNTER: ${picked.name}`);
  return msgs;
}

function checkEncounterCondition(state, cond) {
  if (cond.minDay && (state.day || 0) < cond.minDay) return false;
  if (cond.minCash && (state.cash || 0) < cond.minCash) return false;
  if (cond.minHeat && (state.heat || 0) < cond.minHeat) return false;
  if (cond.maxHeat !== undefined && (state.heat || 0) > cond.maxHeat) return false;
  if (cond.minRep && typeof getRep === 'function' && getRep(state, 'streetCred') < cond.minRep) return false;
  if (cond.minCrew && (state.crew || []).length < cond.minCrew) return false;
  if (cond.district && typeof state.currentDistrict !== 'undefined' && cond.district.indexOf(state.currentDistrict) === -1) return false;
  if (cond.hasPet && (!state.encounters || !state.encounters.companions.pet)) return false;
  if (cond.hasBusiness && typeof state.businesses !== 'undefined' && (!state.businesses.owned || state.businesses.owned.length === 0)) return false;
  if (cond.minAct) {
    const act = typeof getCurrentAct === 'function' ? getCurrentAct(state) : 1;
    if (act < cond.minAct) return false;
  }
  return true;
}

function getEncounterWeights(state) {
  const heat = state.heat || 0;
  const crewCount = (state.crew || []).length;
  const hasBiz = state.businesses && state.businesses.owned && state.businesses.owned.length > 0;
  return {
    street: 1.5,
    business: hasBiz ? 1.5 : 0.8,
    crew: crewCount > 0 ? 1.3 : 0.3,
    law: heat > 30 ? 1.8 : 0.7,
    faction: 1.0,
    wildcard: 0.6
  };
}

function resolveEncounterOutcome(state, outcomeIndex) {
  if (!state.encounters || !state.encounters.activeEncounter) return null;
  const enc = state.encounters.activeEncounter;
  if (enc.resolved) return null;
  const outcome = enc.outcomes[outcomeIndex];
  if (!outcome) return null;

  // Apply effects
  const fx = outcome.effects || {};
  if (fx.cash) state.cash = (state.cash || 0) + fx.cash;
  if (fx.heat) state.heat = Math.min(100, Math.max(0, (state.heat || 0) + fx.heat));
  if (fx.health) state.health = Math.min(100, Math.max(1, (state.health || 100) + fx.health));
  if (fx.stress) state.stress = Math.max(0, (state.stress || 0) + fx.stress);
  if (fx.fear) { if (typeof adjustRep === 'function') adjustRep(state, 'fear', fx.fear); }
  if (fx.trust) { if (typeof adjustRep === 'function') adjustRep(state, 'trust', fx.trust); }
  if (fx.streetCred) { if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', fx.streetCred); }
  if (fx.publicImage) { if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', fx.publicImage); }
  if (fx.communityRep) { if (typeof adjustRep === 'function') adjustRep(state, 'communityRep', fx.communityRep); }
  if (fx.pet) state.encounters.companions.pet = fx.pet;
  if (fx.lookout) state.encounters.companions.lookout = fx.lookout;
  if (fx.product) {
    for (const drugId in fx.product) {
      state.inventory[drugId] = (state.inventory[drugId] || 0) + fx.product[drugId];
    }
  }
  // Handle dynamic drug selling/giving from events
  if (fx._sellDrug && fx._sellQty) {
    const curQty = (state.inventory && state.inventory[fx._sellDrug]) || 0;
    const sellQty = Math.min(fx._sellQty, curQty);
    if (sellQty > 0 && state.inventory) {
      state.inventory[fx._sellDrug] = curQty - sellQty;
      if (state.inventory[fx._sellDrug] <= 0) delete state.inventory[fx._sellDrug];
    }
  }
  if (fx._giveDrug && fx._giveQty) {
    const curQty = (state.inventory && state.inventory[fx._giveDrug]) || 0;
    const giveQty = Math.min(fx._giveQty, curQty);
    if (giveQty > 0 && state.inventory) {
      state.inventory[fx._giveDrug] = curQty - giveQty;
      if (state.inventory[fx._giveDrug] <= 0) delete state.inventory[fx._giveDrug];
    }
  }

  enc.resolved = true;
  enc.resolvedText = outcome.result;

  // Build human-readable effects summary
  const effectParts = [];
  if (fx.cash && fx.cash > 0) effectParts.push('<span style="color:#39ff14">+$' + fx.cash.toLocaleString() + '</span>');
  if (fx.cash && fx.cash < 0) effectParts.push('<span style="color:#ff4444">-$' + Math.abs(fx.cash).toLocaleString() + '</span>');
  if (fx.heat && fx.heat > 0) effectParts.push('<span style="color:#ff6644">+' + fx.heat + ' Heat</span>');
  if (fx.heat && fx.heat < 0) effectParts.push('<span style="color:#44aaff">' + fx.heat + ' Heat</span>');
  if (fx.health && fx.health > 0) effectParts.push('<span style="color:#39ff14">+' + fx.health + ' HP</span>');
  if (fx.health && fx.health < 0) effectParts.push('<span style="color:#ff4444">' + fx.health + ' HP</span>');
  if (fx.stress && fx.stress > 0) effectParts.push('<span style="color:#ff8844">+' + fx.stress + ' Stress</span>');
  if (fx.stress && fx.stress < 0) effectParts.push('<span style="color:#44ccff">' + fx.stress + ' Stress</span>');
  if (fx.fear) effectParts.push('<span style="color:#cc44ff">' + (fx.fear > 0 ? '+' : '') + fx.fear + ' Fear</span>');
  if (fx.trust) effectParts.push('<span style="color:#44ff88">' + (fx.trust > 0 ? '+' : '') + fx.trust + ' Trust</span>');
  if (fx.streetCred) effectParts.push('<span style="color:#ffcc00">' + (fx.streetCred > 0 ? '+' : '') + fx.streetCred + ' Street Cred</span>');
  if (fx.publicImage) effectParts.push('<span style="color:#88aaff">' + (fx.publicImage > 0 ? '+' : '') + fx.publicImage + ' Public Image</span>');
  if (fx.communityRep) effectParts.push('<span style="color:#ff88cc">' + (fx.communityRep > 0 ? '+' : '') + fx.communityRep + ' Community Rep</span>');
  if (fx.product) { for (const did in fx.product) effectParts.push('<span style="color:#00ffcc">+' + fx.product[did] + ' ' + did + '</span>'); }
  if (fx.pet) effectParts.push('<span style="color:#ffaa00">New companion: ' + fx.pet + '</span>');
  if (fx.lookout) effectParts.push('<span style="color:#ffaa00">New lookout!</span>');
  if (fx.soldDrugs) effectParts.push('<span style="color:#39ff14">Sold drugs for $' + (fx.soldDrugs).toLocaleString() + '</span>');
  enc.resolvedEffects = effectParts.length > 0 ? effectParts.join(' &nbsp;|&nbsp; ') : '';

  state.encounters.encounterLog.push({
    id: enc.id,
    name: enc.name,
    choice: outcome.label,
    day: state.day || 0
  });

  return outcome.result;
}

function dismissEncounter(state) {
  if (state.encounters) state.encounters.activeEncounter = null;
}

// ============================================================
// ENCOUNTER DATA - 150+ encounters
// ============================================================
const RANDOM_ENCOUNTERS = [

  // ============================================================
  // STREET ENCOUNTERS (30)
  // ============================================================
  {
    id: 'mugging_victim', name: 'Mugging Victim', emoji: '🆘', category: 'street', cooldown: 20,
    condition: {},
    description: 'Someone is being robbed in a dark alley. The victim is crying for help while two thugs rifle through their pockets.',
    outcomes: [
      { label: 'Help the victim (fight)', effects: { trust: 3, health: -10, streetCred: 2 }, result: 'You jump in swinging. The muggers scatter. The grateful victim slips you $200 and promises to remember your face.' },
      { label: 'Rob the robber', effects: { cash: 350, streetCred: 3 }, result: 'You wait for the muggers to finish, then corner them. They hand over everything. Street justice.' },
      { label: 'Ignore and walk away', effects: {}, result: 'You keep walking. Not your problem. The cries fade behind you.' },
      { label: 'Join the robbery', effects: { cash: 500, trust: -3, publicImage: -2 }, result: 'Three on one makes it quick. You split the take. The victim will remember your face too.' }
    ]
  },
  {
    id: 'lost_tourist', name: 'Lost Tourist', emoji: '🗺️', category: 'street', cooldown: 15,
    condition: { district: ['wynwood', 'south_beach', 'miami_beach'] },
    description: 'A confused tourist with an expensive watch and a fat wallet is wandering around looking at a map upside down.',
    outcomes: [
      { label: 'Help with directions', effects: { publicImage: 2, cash: 100 }, result: 'You point them the right way. They tip you $100 and thank you profusely. They might come back as a customer.' },
      { label: 'Scam them on a fake tour', effects: { cash: 300, trust: -1 }, result: 'You charge $300 for a "VIP local tour" of two blocks. They seem thrilled. Tourists.' },
      { label: 'Rob them', effects: { cash: 800, heat: 5, publicImage: -3 }, result: 'Quick hands relieve them of wallet and watch. $800 richer but a security camera might have caught that.' },
      { label: 'Sell to them', effects: { cash: 400, streetCred: 1 }, result: 'You offer party supplies for their vacation. They buy eagerly. Returning customer potential.' }
    ]
  },
  {
    id: 'rival_scout', name: 'Rival Scout', emoji: '🔍', category: 'street', cooldown: 20,
    condition: { minDay: 10 },
    description: 'An enemy faction member is watching your territory from across the street, taking notes on a phone.',
    outcomes: [
      { label: 'Confront them', effects: { streetCred: 2, fear: 1 }, result: 'You get in their face. They stammer out some intel about rival plans before running off.' },
      { label: 'Follow them quietly', effects: { streetCred: 1 }, result: 'You tail them for an hour. They lead you straight to a rival stash house. Valuable intelligence.' },
      { label: 'Attack', effects: { heat: 8, fear: 3, health: -5 }, result: 'A quick beatdown sends a message. But someone called the cops.' },
      { label: 'Ignore them', effects: { fear: -1 }, result: 'You let them observe. They report your defenses back to their boss. Not ideal.' }
    ]
  },
  {
    id: 'stray_dog', name: 'Stray Dog', emoji: '🐕', category: 'street', cooldown: 60,
    condition: {},
    description: 'A scraggly but friendly stray dog has been following you around all day. It sits at your feet and looks up with big brown eyes.',
    outcomes: [
      { label: 'Adopt the dog', effects: { pet: { type: 'dog', name: 'Lucky', stressRelief: 2 }, stress: -5, cash: -50 }, result: 'You name him Lucky. He follows you everywhere now. Having a companion eases the tension of this life.' },
      { label: 'Feed it and move on', effects: { cash: -10, stress: -1 }, result: 'You buy a hot dog from a cart and toss it over. The dog wags its tail as you leave.' },
      { label: 'Chase it away', effects: {}, result: 'You shoo the dog off. It whimpers and trots away. Cold but practical.' }
    ]
  },
  {
    id: 'street_preacher', name: 'Street Preacher', emoji: '⛪', category: 'street', cooldown: 25,
    condition: {},
    description: 'A fiery street preacher points directly at you, warning about the wages of sin. A small crowd is watching.',
    outcomes: [
      { label: 'Listen respectfully', effects: { publicImage: 1, stress: -1 }, result: 'You stand and listen. The crowd notices your humility. The preacher nods approvingly.' },
      { label: 'Argue back', effects: { publicImage: -1, streetCred: 1 }, result: 'You get into a heated debate. The crowd is split. At least you stood your ground.' },
      { label: 'Donate $500', effects: { cash: -500, publicImage: 3, communityRep: 2 }, result: 'You drop five bills in the collection plate. The preacher blesses you publicly. The community takes notice.' },
      { label: 'Threaten him', effects: { publicImage: -5, fear: 2 }, result: 'You get in his face. The crowd recoils. Word spreads that you threatened a man of God.' }
    ]
  },
  {
    id: 'homeless_info', name: 'Homeless Informant', emoji: '🏚️', category: 'street', cooldown: 15,
    condition: {},
    description: 'A homeless man tugs your sleeve. "I see things, you know? Things people pay good money for. You interested?"',
    outcomes: [
      { label: 'Buy info ($300)', effects: { cash: -300 }, result: 'He whispers a police patrol schedule for the week. This could save your operations some serious heat.' },
      { label: 'Recruit as lookout ($50/day)', effects: { cash: -50, lookout: { type: 'homeless', name: 'Street Eyes', intel: 1 } }, result: 'He agrees eagerly. "I see everything from my corner, boss. Everything." You now have eyes on the street.' },
      { label: 'Ignore', effects: {}, result: 'You walk past. He shrugs and shuffles away to find another buyer.' },
      { label: 'Give him $20 and move on', effects: { cash: -20, communityRep: 1 }, result: 'He pockets the bill gratefully. "God bless. I remember the good ones."' }
    ]
  },
  {
    id: 'car_accident', name: 'Car Accident', emoji: '💥', category: 'street', cooldown: 25,
    condition: {},
    description: 'Two cars have collided at an intersection. Steam pours from the hoods. One driver is slumped over the wheel.',
    outcomes: [
      { label: 'Help the victims', effects: { publicImage: 3, communityRep: 2 }, result: 'You pull the driver out and call 911. Bystanders film your heroism. Good PR for once.' },
      { label: 'Steal from the wreck', effects: { cash: 400, publicImage: -2, heat: 3 }, result: 'While everyone is distracted, you grab a briefcase from the back seat. $400 in cash inside.' },
      { label: 'Call ambulance only', effects: { publicImage: 1 }, result: 'You dial 911 and keep walking. Minimal involvement, minor good deed.' },
      { label: 'Loot and run', effects: { cash: 600, heat: 8 }, result: 'You grab everything not bolted down. A witness is on their phone. Time to go.' }
    ]
  },
  {
    id: 'celebrity_sighting', name: 'Celebrity Sighting', emoji: '⭐', category: 'street', cooldown: 30,
    condition: { district: ['south_beach', 'wynwood', 'miami_beach'] },
    description: 'A famous rapper is walking into a restaurant with a small entourage. No bodyguards in sight.',
    outcomes: [
      { label: 'Approach and network', effects: { streetCred: 3, publicImage: 2 }, result: 'You introduce yourself smoothly. They invite you to a private party next week. Connections made.' },
      { label: 'Offer VIP product', effects: { cash: 2000, streetCred: 2 }, result: 'A discreet exchange in the bathroom. They pay premium without blinking. VIP recurring customer potential.' },
      { label: 'Photograph for blackmail', effects: { cash: 5000, trust: -3, heat: 5 }, result: 'You snap photos of them doing something they shouldn\'t. A quick DM later and $5K lands in your account.' },
      { label: 'Ignore', effects: {}, result: 'You keep it moving. Celebrities are drama magnets.' }
    ]
  },
  {
    id: 'abandoned_vehicle', name: 'Abandoned Vehicle', emoji: '🚗', category: 'street', cooldown: 20,
    condition: {},
    description: 'A nice car sits running with the keys in the ignition. No one around. Too easy?',
    outcomes: [
      { label: 'Steal it', effects: { heat: 10, streetCred: 1 }, result: 'You hop in and drive off. Free wheels, but it might be reported soon.' },
      { label: 'Search it', effects: { cash: 250 }, result: 'You find $250 in the glovebox and a half-eaten burrito. Not bad.' },
      { label: 'Report it', effects: { publicImage: 1 }, result: 'You call non-emergency. Being a good citizen for once feels weird.' },
      { label: 'Be cautious — it\'s a trap', effects: {}, result: 'Good instincts. An unmarked police car is parked around the corner. You dodge a sting operation.' }
    ]
  },
  {
    id: 'street_performer', name: 'Street Performer', emoji: '🎸', category: 'street', cooldown: 20,
    condition: {},
    description: 'A talented musician is playing guitar on the corner, drawing a decent crowd.',
    outcomes: [
      { label: 'Tip generously ($50)', effects: { cash: -50, publicImage: 1 }, result: 'The musician nods gratefully and plays a song just for you. The crowd smiles.' },
      { label: 'Recruit for music biz', effects: { streetCred: 1 }, result: 'You hand them a card. "Call me. I can make you famous." They look intrigued.' },
      { label: 'Ignore', effects: {}, result: 'Good music, but you\'ve got business to handle.' },
      { label: 'Demand a cut (protection)', effects: { cash: 30, fear: 1, publicImage: -2 }, result: 'The musician\'s face falls as they hand over their earnings. The crowd disperses uncomfortably.' }
    ]
  },
  {
    id: 'drug_addict', name: 'Desperate Addict', emoji: '💉', category: 'street', cooldown: 15,
    condition: {},
    description: 'A shaking addict stumbles up to you, eyes wild. "Please man, I\'ll do anything. I just need a fix."',
    dynamic: true,
    getOutcomes: function(state) {
      // Find cheapest drug in inventory to sell
      const inv = state.inventory || {};
      const drugs = Object.keys(inv).filter(d => inv[d] > 0);
      let sellOutcome;
      if (drugs.length > 0) {
        const drugId = drugs[0];
        const drug = (typeof DRUGS !== 'undefined' ? DRUGS : []).find(d => d.id === drugId);
        const price = (state.prices && state.prices[drugId]) || (drug ? drug.minPrice : 50) || 50;
        const doublePrice = price * 2;
        const qty = Math.min(inv[drugId], Math.max(1, Math.floor(Math.random() * 3) + 1));
        const total = doublePrice * qty;
        const drugName = drug ? drug.name : drugId;
        sellOutcome = { label: 'Sell ' + qty + ' ' + drugName + ' at double ($' + total.toLocaleString() + ')', effects: { cash: total, streetCred: -1, _sellDrug: drugId, _sellQty: qty }, result: 'They hand over $' + total.toLocaleString() + ' without blinking — ' + qty + ' ' + drugName + ' at double market price. Easy money from desperation.' };
      } else {
        sellOutcome = { label: 'Sell at double markup (no drugs!)', effects: {}, result: 'You pat your empty pockets. Nothing to sell. The addict shuffles away.' };
      }
      return [
        sellOutcome,
        { label: 'Give a free sample', effects: { trust: 2, _giveDrug: drugs.length > 0 ? drugs[0] : null, _giveQty: 1 }, result: 'Generosity today means a loyal customer tomorrow. They\'ll be back, and they\'ll tell their friends.' },
        { label: 'Turn them away', effects: {}, result: 'You wave them off. They stumble away looking for another source.' },
        { label: 'Recruit as runner ($25/day)', effects: { streetCred: 1 }, result: '"You want to earn your fix? Run deliveries for me." Their eyes light up. Cheap labor acquired.' }
      ];
    },
    outcomes: [
      { label: 'Sell at double markup', effects: { cash: 200, streetCred: -1 }, result: 'They pay double without hesitation. Easy money from desperation.' },
      { label: 'Give a free sample', effects: { trust: 2 }, result: 'Generosity today means a loyal customer tomorrow. They\'ll be back, and they\'ll tell their friends.' },
      { label: 'Turn them away', effects: {}, result: 'You wave them off. They stumble away looking for another source.' },
      { label: 'Recruit as runner ($25/day)', effects: { streetCred: 1 }, result: '"You want to earn your fix? Run deliveries for me." Their eyes light up. Cheap labor acquired.' }
    ]
  },
  {
    id: 'cop_off_duty', name: 'Off-Duty Cop', emoji: '🍺', category: 'street', cooldown: 30,
    condition: { minDay: 15 },
    description: 'An off-duty police officer is drinking alone at a dive bar. Badge visible on their belt. They look miserable.',
    outcomes: [
      { label: 'Bribe for patrol info ($2000)', effects: { cash: -2000, heat: -5 }, result: 'Two grand and three beers later, you know every patrol route for the next month.' },
      { label: 'Befriend over drinks', effects: { cash: -100, trust: 1 }, result: 'You buy a round and chat. No business talk. But now you have a cop who might pick up the phone someday.' },
      { label: 'Avoid entirely', effects: {}, result: 'Smart. You finish your drink and slip out the back. No need to tempt fate.' },
      { label: 'Blackmail (risky)', effects: { cash: 1000, heat: 10 }, result: 'You snap a photo of them drinking on duty. They pay $1K to delete it. But they won\'t forget your face.' }
    ]
  },
  {
    id: 'old_friend', name: 'Old Friend', emoji: '👋', category: 'street', cooldown: 40,
    condition: { minDay: 20 },
    description: 'Someone from your past life spots you across the street. "Holy shit, is that you?! It\'s been years!"',
    outcomes: [
      { label: 'Reconnect', effects: { stress: -3, trust: 2 }, result: 'You catch up over coffee. It feels good to be reminded of who you were before all this.' },
      { label: 'Ignore them', effects: { stress: 1 }, result: 'You pretend not to hear. They look hurt. Another bridge burned.' },
      { label: 'Help with their problem', effects: { cash: -500, trust: 3, communityRep: 1 }, result: 'They\'re in a tough spot. You help out with $500. Old debts of friendship repaid.' },
      { label: 'Ask for a loan', effects: { cash: 2000 }, result: 'They\'re doing well and spot you $2K. "Pay me back whenever, for old times\' sake."' }
    ]
  },
  {
    id: 'kids_playing', name: 'Kids in the Hood', emoji: '⚽', category: 'street', cooldown: 20,
    condition: {},
    description: 'A group of kids are playing in your territory. They wave at you like you\'re a celebrity.',
    outcomes: [
      { label: 'Give them money ($100)', effects: { cash: -100, communityRep: 3 }, result: 'Their eyes go wide. "Thanks mister!" The neighborhood sees you looking out for the kids.' },
      { label: 'Set up basketball court ($5000)', effects: { cash: -5000, communityRep: 10, publicImage: 5 }, result: 'You fund a new court. The whole block shows up for the ribbon cutting. Hero status unlocked.' },
      { label: 'Ignore', effects: {}, result: 'You walk past. They go back to playing. Life goes on.' },
      { label: 'Ask what they\'ve seen', effects: { communityRep: 1 }, result: '"We saw some weird guys in a black car last night!" Free intel from the most observant spies in the city — kids.' }
    ]
  },
  {
    id: 'dice_game', name: 'Alley Dice Game', emoji: '🎲', category: 'street', cooldown: 15,
    condition: {},
    description: 'A group of locals are shooting dice in an alley. The pot looks fat. They wave you over.',
    outcomes: [
      { label: 'Join the game ($500 bet)', effects: { cash: Math.random() > 0.5 ? 1000 : -500 }, result: Math.random() > 0.5 ? 'Hot dice! You walk away $1000 richer.' : 'Cold dice. You\'re out $500. The alley laughs.' },
      { label: 'Break it up and take the pot', effects: { cash: 800, fear: 3, communityRep: -3 }, result: 'You flash iron and everyone scatters. $800 in the pot. But the neighborhood remembers.' },
      { label: 'Run the game (take a cut)', effects: { cash: 200, streetCred: 2 }, result: 'You set up as the house. $200 rake by the end of the night. Gambling operation potential noted.' },
      { label: 'Watch from the side', effects: { streetCred: 1 }, result: 'You observe the players. You spot who has money, who\'s desperate, and who cheats. Intel gathered.' }
    ]
  },
  {
    id: 'food_truck', name: 'Food Truck', emoji: '🌮', category: 'street', cooldown: 25,
    condition: {},
    description: 'A food truck pulls up in your territory. The tacos smell incredible and a line is forming fast.',
    outcomes: [
      { label: 'Eat ($15)', effects: { cash: -15, stress: -2, health: 3 }, result: 'Best tacos in Miami. You eat three. Life\'s not all bad.' },
      { label: 'Buy the truck ($8000)', effects: { cash: -8000, streetCred: 1 }, result: 'The owner looks shocked when you offer cash on the spot. Mobile distribution cover acquired.' },
      { label: 'Extort for protection', effects: { cash: 200, fear: 2, publicImage: -1 }, result: '"Nice truck. Shame if something happened to it." $200/day protection fee established.' },
      { label: 'Partner with them', effects: { cash: -500 }, result: 'You fund their expansion. They sell your product under the counter. $500/day income, ultra-low heat.' }
    ]
  },
  {
    id: 'flat_tire', name: 'Flat Tire', emoji: '🛞', category: 'street', cooldown: 30,
    condition: {},
    description: 'Your ride blows a tire in the middle of a delivery route. You\'re exposed on the street.',
    outcomes: [
      { label: 'Call for a mechanic ($500)', effects: { cash: -500 }, result: 'A tow truck arrives in 20 minutes. Expensive but you\'re back on the road.' },
      { label: 'Fix it yourself', effects: { stress: 2 }, result: 'You jack the car up and swap the spare. Dirty hands but zero cost and zero witnesses.' },
      { label: 'Abandon and walk', effects: { heat: 3 }, result: 'You grab your product and hoof it. The car gets towed and traced. Minor heat.' },
      { label: 'Carjack a passing vehicle', effects: { heat: 12, fear: 2 }, result: 'You flag down a sedan and take it at gunpoint. Effective but very hot.' }
    ]
  },
  {
    id: 'power_outage', name: 'Power Outage', emoji: '🔌', category: 'street', cooldown: 40,
    condition: {},
    description: 'The whole district goes dark. Streetlights die, alarms go silent, security cameras blink off. Opportunity knocks.',
    outcomes: [
      { label: 'Raid a rival while security is down', effects: { cash: 3000, heat: 10, streetCred: 3 }, result: 'Their electronic locks are useless. You clean out $3K in product and cash before the lights come back.' },
      { label: 'Loot nearby stores', effects: { cash: 2000, heat: 15, publicImage: -5 }, result: 'You join the chaos. Electronics, cash registers, whatever fits. But cameras might have battery backup.' },
      { label: 'Protect your territory', effects: { trust: 3, communityRep: 3 }, result: 'You and your crew patrol the streets. Nothing gets touched. The community respects the protection.' },
      { label: 'Do nothing', effects: { cash: -500 }, result: 'You hunker down. When power returns, you find someone hit YOUR stash in the dark. -$500 in losses.' }
    ]
  },
  {
    id: 'wedding_funeral', name: 'Community Event', emoji: '💒', category: 'street', cooldown: 30,
    condition: {},
    description: 'A wedding celebration (or funeral procession) is moving through your district. The whole community is present.',
    outcomes: [
      { label: 'Attend respectfully', effects: { communityRep: 3, publicImage: 2 }, result: 'You pay your respects. People notice. Being part of the community has value.' },
      { label: 'Use as cover for a deal', effects: { cash: 500 }, result: 'While everyone\'s distracted, you close a deal in the back. Zero heat today.' },
      { label: 'Donate $1000', effects: { cash: -1000, communityRep: 5, publicImage: 3 }, result: 'Your generous contribution makes the rounds. The family publicly thanks you. Respect earned.' },
      { label: 'Make a scene', effects: { communityRep: -5, fear: 3 }, result: 'You show up loud and flashy. People are intimidated but disgusted. Fear up, respect down.' }
    ]
  },
  {
    id: 'loose_shipment', name: 'Loose Shipment', emoji: '📦', category: 'street', cooldown: 25,
    condition: {},
    description: 'A wrapped package lies in the gutter. Someone dropped it in a hurry. Could be drugs, cash, or trouble.',
    outcomes: [
      { label: 'Keep it', effects: { cash: 1500 }, result: 'You open it carefully. $1500 in small bills. Someone\'s very bad day is your payday.' },
      { label: 'Return to owner (if findable)', effects: { trust: 5, streetCred: 2 }, result: 'You ask around. It belongs to a local crew. They\'re shocked and grateful. Major trust earned.' },
      { label: 'Turn in to police', effects: { heat: -5, trust: -3 }, result: 'The cops are suspicious of your "good deed" but your heat drops. Word gets out you cooperated though.' },
      { label: 'Set a trap for the owner', effects: { cash: 2000, fear: 2, heat: 5 }, result: 'You wait. When they come back looking, you shake them down for $2K to return it.' }
    ]
  },
  {
    id: 'street_fight', name: 'Street Fight', emoji: '👊', category: 'street', cooldown: 15,
    condition: {},
    description: 'Two guys are going at it in the middle of the street. A crowd is forming. One of them is winning badly.',
    outcomes: [
      { label: 'Break it up', effects: { communityRep: 2, publicImage: 1 }, result: 'You pull them apart. Both are bloody but alive. The crowd respects your authority.' },
      { label: 'Bet on the winner ($200)', effects: { cash: Math.random() > 0.5 ? 400 : -200 }, result: Math.random() > 0.5 ? 'Your guy wins! Double your money.' : 'Your guy eats pavement. There goes $200.' },
      { label: 'Recruit the winner', effects: { streetCred: 1 }, result: 'The victor is breathing hard. You offer them a job. "You fight like that for free? Come work for me."' },
      { label: 'Walk away', effects: {}, result: 'Not your circus. You keep moving.' }
    ]
  },
  {
    id: 'graffiti_tags', name: 'Rival Graffiti', emoji: '🎨', category: 'street', cooldown: 20,
    condition: { minDay: 10 },
    description: 'Gang tags from a rival crew have appeared on buildings in your territory overnight. A direct challenge.',
    outcomes: [
      { label: 'Paint over them', effects: { streetCred: 2, fear: 1 }, result: 'You organize a crew to cover every tag by morning. Territory control reaffirmed.' },
      { label: 'Investigate who did it', effects: { streetCred: 1 }, result: 'You check cameras and ask around. Now you know exactly which crew is testing your boundaries.' },
      { label: 'Commission your own tags ($500)', effects: { cash: -500, streetCred: 3, fear: 2 }, result: 'You hire the best tagger in Miami. Your crew\'s symbol covers every wall. Message sent.' },
      { label: 'Trap the taggers', effects: { fear: 3, streetCred: 2 }, result: 'You stake out the walls at night. Three rival taggers caught red-handed. They won\'t be tagging again.' }
    ]
  },
  {
    id: 'rain_shelter', name: 'Rain Shelter', emoji: '🌧️', category: 'street', cooldown: 25,
    condition: {},
    description: 'A sudden downpour drives you under an awning with a stranger. You\'re stuck together for a while.',
    outcomes: [
      { label: 'Make conversation', effects: { trust: 1 }, result: 'Turns out they\'re a business owner looking for "special" supply chain solutions. New contact made.' },
      { label: 'Stay silent', effects: {}, result: 'You stand in comfortable silence. The rain passes. You go your separate ways.' },
      { label: 'Offer them your umbrella', effects: { publicImage: 1, stress: -1 }, result: 'Small kindness. They\'re grateful. Sometimes it\'s nice to just be a decent person.' }
    ]
  },
  {
    id: 'traffic_stop', name: 'Traffic Stop', emoji: '🚨', category: 'street', cooldown: 20,
    condition: {},
    description: 'Flashing lights in your rearview. A patrol car is pulling you over. Your heart races.',
    dynamic: true,
    getOutcomes: function(state) {
      const inv = state.inventory || {};
      const drugIds = Object.keys(inv).filter(d => inv[d] > 0);
      const totalUnits = drugIds.reduce((s, d) => s + inv[d], 0);
      const isClean = totalUnits === 0;
      if (isClean) {
        return [
          { label: 'Stay calm, papers ready', effects: { stress: 2 }, result: 'License and registration check out. No drugs on you, nothing to find. "Drive safe." Clean pockets saved you.' },
          { label: 'Assert your rights', effects: { streetCred: 1 }, result: '"Am I free to go, officer?" Empty car, clean record. They have nothing. You drive off confidently.' },
          { label: 'Be friendly and cooperative', effects: { publicImage: 1 }, result: 'Polite conversation, quick ID check. You\'re squeaky clean today. The officer even wishes you a good evening.' }
        ];
      } else {
        const drugName = ((typeof DRUGS !== 'undefined' ? DRUGS : []).find(x => x.id === drugIds[0]) || {}).name || drugIds[0];
        return [
          { label: 'Stay calm — hope they don\'t search (' + totalUnits + ' units on you)', effects: { stress: 5, heat: 3 }, result: 'You hand over your license with steady hands despite carrying ' + totalUnits + ' units. They don\'t search. Lucky. Next time, use your stash.' },
          { label: 'Bribe the officer ($500)', effects: { cash: -500, heat: -3 }, result: 'A folded bill in the license holder. The cop pockets it and waves you on. ' + totalUnits + ' units still safe under the seat.' },
          { label: 'Floor it and run (' + totalUnits + ' units at stake!)', effects: { heat: 20, stress: 8, health: -5 }, result: 'Tires screech! You peel out with ' + totalUnits + ' units in the car. You lose them in side streets but heat skyrockets. Should have stashed those drugs.' },
          { label: 'Act cool — hide ' + drugName + ' under seat', effects: { stress: 5 }, result: 'You stuff the ' + drugName + ' under the seat and smile wide. They search the glovebox but miss it. Heart attack material. USE YOUR STASH next time.' }
        ];
      }
    },
    outcomes: [
      { label: 'Stay calm, papers ready', effects: { stress: 3 }, result: 'License and registration check out. "Drive safe." You exhale for the first time in two minutes.' },
      { label: 'Bribe the officer ($500)', effects: { cash: -500, heat: -3 }, result: 'A folded bill in the license holder. The cop pockets it and waves you on. Corruption works.' },
      { label: 'Floor it and run', effects: { heat: 20, stress: 5 }, result: 'Tires screech as you peel out. A chase ensues. You lose them in side streets but your heat skyrockets.' },
      { label: 'Act cooperative, hide product', effects: { stress: 5 }, result: 'You stuff the package under the seat and smile wide. They search the car but miss it. Close call.' }
    ]
  },
  {
    id: 'paranoid_dealer', name: 'Paranoid Dealer', emoji: '😰', category: 'street', cooldown: 20,
    condition: {},
    description: 'A nervous dealer on the corner pulls a gun on you. "You a cop?! You look like a cop!"',
    outcomes: [
      { label: 'Talk them down', effects: { trust: 2, streetCred: 1 }, result: 'Hands up, calm voice. You convince them you\'re in the game. They lower the weapon and apologize. New supplier contact.' },
      { label: 'Walk away slowly', effects: {}, result: 'You back up with hands visible. No sudden moves. Live to deal another day.' },
      { label: 'Disarm them', effects: { fear: 3, health: -10 }, result: 'You grab the barrel and twist. A brief scuffle. You win, but take a hit. They won\'t forget your nerve.' },
      { label: 'Flash your product', effects: { streetCred: 2, trust: 1 }, result: 'You show them what you\'re carrying. "Does a cop carry this?" They laugh nervously. Connection established.' }
    ]
  },
  {
    id: 'construction_site', name: 'Construction Site', emoji: '🏗️', category: 'street', cooldown: 35,
    condition: { minDay: 20 },
    description: 'A major construction project is underway near your territory. The foreman keeps looking your way.',
    outcomes: [
      { label: 'Bribe foreman for hidden room ($25K)', effects: { cash: -25000 }, result: 'A secret room built into the new building. Perfect stash spot that no one will ever find.' },
      { label: 'Recruit workers as muscle', effects: { cash: -1000, fear: 1 }, result: 'Construction workers moonlighting as enforcers. Big, strong, and willing for extra cash.' },
      { label: 'Use for disposal', effects: { fear: 3, heat: -5 }, result: 'A concrete pour is happening tomorrow. Some problems disappear permanently.' },
      { label: 'Ignore', effects: {}, result: 'You mind your business. The construction continues. Maybe next time.' }
    ]
  },
  {
    id: 'fire_nearby', name: 'Building Fire', emoji: '🔥', category: 'street', cooldown: 40,
    condition: {},
    description: 'A building is on fire in your district. Sirens wail in the distance. People are running out screaming.',
    outcomes: [
      { label: 'Help evacuate', effects: { communityRep: 10, publicImage: 5, health: -10 }, result: 'You charge in and pull two people out. The news calls you a hero. Best PR you\'ve ever gotten.' },
      { label: 'Check if it\'s your stash house', effects: { stress: 5 }, result: 'It\'s not yours. Relief floods through you. But it\'s a reminder to have fire escape plans.' },
      { label: 'Loot in the chaos', effects: { cash: 800, heat: 5, publicImage: -3 }, result: 'While everyone watches the flames, you clean out the store next door. Cold but profitable.' },
      { label: 'Watch from a distance', effects: { stress: 1 }, result: 'You watch the flames. The fire department handles it. Sometimes you just spectate.' }
    ]
  },
  {
    id: 'ice_cream_truck', name: 'Ice Cream Truck', emoji: '🍦', category: 'street', cooldown: 30,
    condition: {},
    description: 'An ice cream truck rolls through playing its cheerful jingle. Something about it feels off.',
    outcomes: [
      { label: 'Buy a cone (nostalgia)', effects: { cash: -5, stress: -3 }, result: 'Strawberry swirl. For a moment you\'re seven years old again. Some things are still simple.' },
      { label: 'Investigate — rival distribution?', effects: { streetCred: 1 }, result: 'You watch carefully. Sure enough, it\'s a rival selling more than popsicles. Intel gathered.' },
      { label: 'Buy the route ($8000)', effects: { cash: -8000 }, result: 'The driver is happy to sell. You now have a mobile distribution vehicle that no one suspects.' },
      { label: 'Ignore', effects: {}, result: 'The jingle fades into the distance. Just an ice cream truck. Probably.' }
    ]
  },
  {
    id: 'lottery_ticket', name: 'Lottery Ticket', emoji: '🎰', category: 'street', cooldown: 20,
    condition: {},
    description: 'You find a scratch-off lottery ticket on the ground. Unscratched.',
    outcomes: [
      { label: 'Scratch it', effects: { cash: (function() { const r = Math.random(); if (r < 0.5) return 0; if (r < 0.85) return 100; if (r < 0.95) return 1000; if (r < 0.99) return 10000; return 50000; })() }, result: 'You scratch eagerly...' },
      { label: 'Give it to a passerby', effects: { publicImage: 1 }, result: 'You hand it to a stranger. They\'re confused but grateful. Maybe karma is real.' },
      { label: 'Toss it', effects: {}, result: 'Gambling is for suckers. You throw it in the trash.' }
    ]
  },

  // ============================================================
  // BUSINESS & DEAL ENCOUNTERS (25)
  // ============================================================
  {
    id: 'bulk_buyer', name: 'Bulk Buyer', emoji: '💰', category: 'business', cooldown: 25,
    condition: { minDay: 15 },
    description: 'A wealthy buyer wants your entire stock of one product at 20% above market. They want to meet at a neutral location.',
    outcomes: [
      { label: 'Accept the deal', effects: { cash: 5000, streetCred: 2 }, result: 'The meet goes clean. They buy everything at premium. A windfall day.' },
      { label: 'Demand higher price', effects: { cash: 7000, trust: -1 }, result: 'You push for 40% above. They grumble but pay. Greedy but profitable.' },
      { label: 'Decline — too suspicious', effects: {}, result: 'Your gut says no. Later you hear police busted a sting at that exact location. Good call.' },
      { label: 'Set your own location', effects: { cash: 5000, streetCred: 1 }, result: 'Your turf, your rules. The deal goes smooth on your terms.' }
    ]
  },
  {
    id: 'supplier_emergency', name: 'Supplier Fire Sale', emoji: '📞', category: 'business', cooldown: 30,
    condition: { minCash: 5000 },
    description: 'Your supplier calls with a time-limited offer: double quantity at 40% discount. Cash needed NOW.',
    outcomes: [
      { label: 'Buy everything ($5000)', effects: { cash: -5000 }, result: 'You scramble the cash together. Double product at a massive discount. This will pay off big.' },
      { label: 'Buy half', effects: { cash: -2500 }, result: 'You split the difference. Good deal but you left money on the table.' },
      { label: 'Pass on it', effects: {}, result: 'You can\'t move fast enough. Someone else gets the deal. Opportunity lost.' },
      { label: 'Ask to pay on credit', effects: { cash: -1000, trust: -1 }, result: 'They agree to partial credit at higher interest. You get the product but owe $4K more.' }
    ]
  },
  {
    id: 'business_opportunity', name: 'Business Opportunity', emoji: '🏪', category: 'business', cooldown: 35,
    condition: { minCash: 10000 },
    description: 'A legitimate business owner approaches you desperate to sell their restaurant below market. They need cash fast.',
    outcomes: [
      { label: 'Buy it ($10K bargain)', effects: { cash: -10000, publicImage: 1 }, result: 'A legitimate front at half price. Whatever their reason, your gain is significant.' },
      { label: 'Investigate why they\'re desperate', effects: {}, result: 'You dig deeper. They\'re fleeing gambling debts. The business is clean but their problems might follow.' },
      { label: 'Lowball them ($5K)', effects: { cash: -5000, trust: -2 }, result: 'They\'re desperate enough to take it. You feel a little dirty. But business is business.' },
      { label: 'Pass', effects: {}, result: 'Not the right time. Someone else snaps it up the next day.' }
    ]
  },
  {
    id: 'stock_tip', name: 'Market Intelligence', emoji: '📈', category: 'business', cooldown: 30,
    condition: { minDay: 20 },
    description: 'A contact gives you inside info: a massive bust in Colombia means cocaine prices will spike 3x in 5 days.',
    outcomes: [
      { label: 'Stockpile immediately', effects: { cash: -3000 }, result: 'You buy everything available. If the tip is right, you\'ll triple your money.' },
      { label: 'Verify the info first', effects: {}, result: 'You check multiple sources. The tip checks out — but by then prices are already climbing. Smaller window.' },
      { label: 'Ignore — could be planted', effects: {}, result: 'You pass. Three days later, prices DO spike. Missed opportunity, but you avoided potential risk.' },
      { label: 'Sell the tip to others ($1K)', effects: { cash: 1000, streetCred: 1 }, result: 'You flip the intel to other dealers for $1K each. Profit without inventory risk.' }
    ]
  },
  {
    id: 'counterfeiter', name: 'Counterfeiter Contact', emoji: '💵', category: 'business', cooldown: 40,
    condition: { minDay: 25, minCash: 10000 },
    description: 'Someone offers $500K in counterfeit bills for $100K real money. Quality is "excellent," they claim.',
    outcomes: [
      { label: 'Buy the counterfeits ($100K)', effects: { cash: -100000 }, result: 'The bills look real. You use them for bribes and unknowing sellers. Net gain if they pass inspection.' },
      { label: 'Buy a small sample ($10K)', effects: { cash: -10000 }, result: 'You test $50K in counterfeits. Half pass, half are obvious fakes. Mixed results.' },
      { label: 'Report them (reduce heat)', effects: { heat: -10, trust: -5 }, result: 'You tip off the feds anonymously. Your heat drops but word gets out you\'re a snitch risk.' },
      { label: 'Decline', effects: {}, result: 'Too risky. Counterfeiting brings federal attention you don\'t need.' }
    ]
  },
  {
    id: 'insurance_scam', name: 'Insurance Opportunity', emoji: '🔥', category: 'business', cooldown: 45,
    condition: { hasBusiness: true },
    description: 'Your front business had a minor fire. The insurance adjuster is coming. There\'s an opportunity to inflate the claim.',
    outcomes: [
      { label: 'Inflate the claim ($50K extra)', effects: { cash: 50000, heat: 5 }, result: 'Creative accounting and some staged damage. The payout is triple what it should be.' },
      { label: 'Honest claim', effects: { cash: 10000 }, result: 'Standard payout, no questions asked. $10K for the real damages.' },
      { label: 'Full arson then claim ($100K)', effects: { cash: 100000, heat: 20 }, result: 'You torch it properly and claim everything. Massive payout but the arson investigator is suspicious.' },
      { label: 'Skip the claim', effects: {}, result: 'Not worth the paper trail. You eat the loss and stay off the radar.' }
    ]
  },
  {
    id: 'hostile_buyout', name: 'Hostile Buyout Offer', emoji: '🏢', category: 'business', cooldown: 50,
    condition: { hasBusiness: true },
    description: 'A legitimate corporation offers 3x what you paid for your front business. Suspicious generosity.',
    outcomes: [
      { label: 'Sell for 3x profit', effects: { cash: 30000, publicImage: 1 }, result: 'Clean cash, no questions. But you lose your laundering capacity.' },
      { label: 'Refuse', effects: {}, result: 'They leave a business card. "The offer won\'t last forever." You keep your front intact.' },
      { label: 'Counter at 5x', effects: { cash: 50000 }, result: 'They hesitate... then accept. They must really want that location. Massive payday.' },
      { label: 'Investigate their motives', effects: {}, result: 'Turns out they\'re laundering money too. Kindred spirits. Potential partnership opportunity noted.' }
    ]
  },
  {
    id: 'currency_exchange', name: 'Currency Exchange', emoji: '💱', category: 'business', cooldown: 40,
    condition: { minCash: 50000, minAct: 2 },
    description: 'An international contact offers offshore currency exchange: $100K USD for $115K in foreign currency, stored securely.',
    outcomes: [
      { label: 'Exchange $100K', effects: { cash: -100000 }, result: 'The offshore account is set up. $115K stashed safely beyond the reach of US law enforcement.' },
      { label: 'Exchange $50K', effects: { cash: -50000 }, result: 'You play it safe with a smaller amount. $57.5K offshore. A start.' },
      { label: 'Decline — too risky', effects: {}, result: 'You keep your cash stateside. Boring but safe.' },
      { label: 'Demand a better rate', effects: { cash: -100000 }, result: 'You push to $120K. They agree reluctantly. Saving face matters in international finance.' }
    ]
  },
  {
    id: 'real_estate_tip', name: 'Real Estate Insider Tip', emoji: '🏠', category: 'business', cooldown: 50,
    condition: { minCash: 10000, minDay: 30 },
    description: 'A corrupt city planner whispers: a new highway is coming through a specific district. Property values will triple.',
    outcomes: [
      { label: 'Buy the tip + invest ($20K)', effects: { cash: -20000, streetCred: 1 }, result: 'You buy two properties cheap. If the tip is right, you\'re looking at 3x returns in 30 days.' },
      { label: 'Just buy the tip ($5K)', effects: { cash: -5000 }, result: 'You pay for the intel. Now you know, but you need capital to act on it.' },
      { label: 'Ignore', effects: {}, result: 'Could be a scam. You let it pass. Three months later... you wish you hadn\'t.' },
      { label: 'Spread the tip for favors', effects: { trust: 3, streetCred: 2 }, result: 'You share the intel with allies. They invest and owe you. Social capital earned.' }
    ]
  },
  {
    id: 'partnership_dispute', name: 'Partnership Dispute', emoji: '⚖️', category: 'business', cooldown: 30,
    condition: { minDay: 20 },
    description: 'Two of your business associates are at each other\'s throats. One wants to expand, the other wants to lay low.',
    outcomes: [
      { label: 'Side with the expander', effects: { cash: 2000, heat: 5, trust: -1 }, result: 'Expansion it is. More revenue, more risk. The cautious one is bitter.' },
      { label: 'Side with caution', effects: { heat: -3, trust: 1 }, result: 'Playing it safe. Less money but less heat. The ambitious one grumbles.' },
      { label: 'Mediate a compromise', effects: { trust: 2, streetCred: 1 }, result: 'You find middle ground. Controlled expansion. Both respect your diplomacy.' },
      { label: 'Cut them both out', effects: { cash: 5000, trust: -3 }, result: 'You take over the operation yourself. No more arguing. Just profit and enemies.' }
    ]
  },
  {
    id: 'tax_audit', name: 'Tax Audit', emoji: '📋', category: 'business', cooldown: 60,
    condition: { hasBusiness: true, minDay: 40 },
    description: 'The IRS is auditing one of your front businesses. An agent with a sharp eye is going through the books.',
    outcomes: [
      { label: 'Hire a top accountant ($20K)', effects: { cash: -20000, heat: -5 }, result: 'Your accountant is a wizard. The audit finds nothing. Clean for two years.' },
      { label: 'Wing it with current books', effects: { cash: -5000, heat: 5 }, result: 'Minor discrepancies found. $5K fine and increased scrutiny. Could be worse.' },
      { label: 'Bribe the auditor ($10K)', effects: { cash: -10000 }, result: 'The auditor has a mortgage and three kids. $10K makes the audit disappear.' },
      { label: 'Burn the books (literally)', effects: { heat: 15, cash: -2000 }, result: 'An "accidental" fire destroys the records. The IRS is suspicious but has no evidence. For now.' }
    ]
  },
  {
    id: 'product_recall', name: 'Bad Batch', emoji: '☠️', category: 'business', cooldown: 40,
    condition: { minDay: 25 },
    description: 'One of your drug batches was bad. Two customers are in the hospital. Word is spreading fast.',
    outcomes: [
      { label: 'Recall remaining product', effects: { cash: -3000, trust: 3, publicImage: 1 }, result: 'You pull everything and eat the loss. Customers appreciate you looking out for them.' },
      { label: 'Deny involvement', effects: { trust: -5, heat: 5 }, result: 'You deny everything. But when a third person ODs, people start pointing fingers.' },
      { label: 'Blame a rival', effects: { trust: -1, streetCred: 1 }, result: 'You plant evidence pointing to a competitor. Their reputation tanks while yours survives.' },
      { label: 'Go silent', effects: { trust: -3 }, result: 'You say nothing. Rumors swirl. Some customers switch suppliers. Damage control was needed.' }
    ]
  },
  {
    id: 'mystery_buyer', name: 'Mystery Buyer', emoji: '🎭', category: 'business', cooldown: 50,
    condition: { minAct: 2, minCash: 20000 },
    description: 'An untraceable contact wants $1M in product. Payment in gold bars. Meeting in international waters.',
    outcomes: [
      { label: 'Accept the deal', effects: { cash: 50000, heat: 10, streetCred: 5 }, result: 'The yacht meeting is tense but the gold is real. The biggest deal of your career.' },
      { label: 'Demand half upfront', effects: { cash: 25000, streetCred: 2 }, result: 'They agree to send half in advance. Smart business. The deal closes clean.' },
      { label: 'Decline — too sketchy', effects: {}, result: 'Your instincts scream trap. You pass. Later you hear the buyer was DEA.' },
      { label: 'Send a decoy first', effects: { cash: 30000, streetCred: 3 }, result: 'Your decoy confirms the buyer is legit. You close the deal safely. Cautious and profitable.' }
    ]
  },
  {
    id: 'debt_collection', name: 'Debt Collection', emoji: '💀', category: 'business', cooldown: 25,
    condition: { minDay: 15 },
    description: 'Someone who owed you $5000 just died. Their terrified family says they\'ll pay anything to settle it.',
    outcomes: [
      { label: 'Forgive the debt', effects: { communityRep: 10, trust: 5, publicImage: 3 }, result: 'You tear up the note. The family weeps with relief. The whole neighborhood hears about your mercy.' },
      { label: 'Collect in full', effects: { cash: 5000, communityRep: -3 }, result: 'Business is business. They pay every penny. The community calls you heartless.' },
      { label: 'Negotiate half', effects: { cash: 2500, communityRep: 1 }, result: '$2500 and you\'re square. Fair to both sides. Reasonable.' },
      { label: 'Collect with interest', effects: { cash: 7000, fear: 5, communityRep: -8 }, result: 'You demand $7K including interest. From a dead man\'s family. Even your crew looks uncomfortable.' }
    ]
  },
  {
    id: 'market_crash', name: 'Market Crash', emoji: '📉', category: 'business', cooldown: 45,
    condition: { minDay: 20 },
    description: 'Drug prices crash 40% overnight. A major bust disrupted the entire supply chain. Chaos in the market.',
    outcomes: [
      { label: 'Buy everything cheap', effects: { cash: -5000 }, result: 'You stockpile at rock-bottom prices. When the market recovers, you\'ll make a killing.' },
      { label: 'Sell at a loss', effects: { cash: 2000, stress: 3 }, result: 'You dump inventory before prices drop further. Small loss but preserved capital.' },
      { label: 'Hold your inventory', effects: { stress: 2 }, result: 'You wait it out. Prices slowly recover over the next week. Patient play.' },
      { label: 'Manipulate the market', effects: { cash: 3000, streetCred: 3, heat: 5 }, result: 'You spread rumors of a second bust. Panic selling lets you buy even cheaper. Market manipulation pays.' }
    ]
  },
  {
    id: 'new_competitor', name: 'New Competitor', emoji: '🆕', category: 'business', cooldown: 30,
    condition: { minDay: 15 },
    description: 'A new dealer has set up shop in your territory without permission. Small-time but growing fast.',
    outcomes: [
      { label: 'Recruit them', effects: { streetCred: 1, trust: 2 }, result: 'You offer them a position. They accept eagerly. Better to have them inside the tent.' },
      { label: 'Warn them once', effects: { fear: 2 }, result: '"This is my corner." They pack up fast. Message received.' },
      { label: 'Destroy their operation', effects: { fear: 5, heat: 10, streetCred: 2 }, result: 'You torch their stash and send them running. Brutal but effective.' },
      { label: 'Tax them (30% cut)', effects: { cash: 500, streetCred: 2, fear: 1 }, result: 'They operate under your umbrella now. 30% of their take is yours. Empire expanding.' }
    ]
  },
  {
    id: 'charity_donation', name: 'Charity Gala', emoji: '🎗️', category: 'business', cooldown: 35,
    condition: { minCash: 5000 },
    description: 'A local charity gala is seeking sponsors. Big donors get networking access with politicians and business leaders.',
    outcomes: [
      { label: 'Donate $50K (VIP)', effects: { cash: -50000, publicImage: 10, communityRep: 5, trust: 3 }, result: 'You\'re seated at the head table. The mayor shakes your hand. Photos on the society page. Top-tier connections.' },
      { label: 'Donate $5K', effects: { cash: -5000, publicImage: 3, communityRep: 2 }, result: 'A respectable contribution. Your name on the donor wall. Modest but meaningful networking.' },
      { label: 'Attend without donating', effects: { publicImage: 1 }, result: 'You show face but keep your wallet closed. Some contacts made, but you\'re not memorable.' },
      { label: 'Skip it', effects: {}, result: 'Galas aren\'t your scene. You stay in the streets where you belong.' }
    ]
  },
  {
    id: 'equipment_sale', name: 'Fire Sale', emoji: '🏷️', category: 'business', cooldown: 30,
    condition: { minCash: 5000 },
    description: 'A retiring criminal is liquidating everything: lab equipment, vehicles, weapons. 50% off for 24 hours only.',
    outcomes: [
      { label: 'Buy weapons ($3K)', effects: { cash: -3000, fear: 1 }, result: 'Arsenal expanded at half price. Quality hardware from a professional.' },
      { label: 'Buy lab equipment ($5K)', effects: { cash: -5000 }, result: 'Premium processing equipment. Your product quality just leveled up.' },
      { label: 'Buy everything ($15K)', effects: { cash: -15000, streetCred: 2 }, result: 'You clean them out. Weapons, equipment, two vehicles. A full upgrade at bargain prices.' },
      { label: 'Pass — could be hot', effects: {}, result: 'If it\'s too good to be true... you let someone else take the risk.' }
    ]
  },
  {
    id: 'franchise_proposal', name: 'Franchise Proposal', emoji: '🌐', category: 'business', cooldown: 50,
    condition: { minAct: 2, minDay: 40 },
    description: 'A dealer in another city wants to franchise your operation. Your brand, your methods, 15% revenue share.',
    outcomes: [
      { label: 'Accept the franchise', effects: { cash: 2000, streetCred: 3 }, result: 'Your operation goes interstate. 15% revenue flows in. But trust is hard to verify at distance.' },
      { label: 'Demand 25%', effects: { cash: 3000, streetCred: 2 }, result: 'They agree to 25% after negotiation. Premium brand commands premium rates.' },
      { label: 'Decline', effects: {}, result: 'Too much exposure. You keep your operation local and controlled.' },
      { label: 'Send an overseer', effects: { cash: 1500, streetCred: 4 }, result: 'You place one of your crew there to watch things. Franchise revenue plus quality control.' }
    ]
  },
  {
    id: 'labor_dispute', name: 'Labor Dispute', emoji: '✊', category: 'business', cooldown: 35,
    condition: { hasBusiness: true },
    description: 'Workers at your front business want a raise. They\'re threatening to strike.',
    outcomes: [
      { label: 'Grant the raise', effects: { cash: -500, trust: 2, publicImage: 1 }, result: 'Happy workers, stable business. The extra cost is worth the peace.' },
      { label: 'Refuse', effects: { trust: -2, publicImage: -1 }, result: 'They\'re unhappy but they need the job. Productivity drops. Morale tanks.' },
      { label: 'Fire and replace', effects: { cash: -1000, heat: 2 }, result: 'New staff hired. Two weeks of chaos during transition. But the message is clear.' },
      { label: 'Negotiate a compromise', effects: { cash: -200, trust: 1 }, result: 'Small raise plus better hours. Everyone saves face. Smart management.' }
    ]
  },
  {
    id: 'government_contract', name: 'Government Contract', emoji: '🏛️', category: 'business', cooldown: 50,
    condition: { hasBusiness: true, minAct: 2 },
    description: 'A corrupt official offers your front company a $200K government construction contract. Easy money with strings.',
    outcomes: [
      { label: 'Accept the contract', effects: { cash: 200000, heat: 5 }, result: '$200K in government money flows through your front. Clean on paper, dirty underneath.' },
      { label: 'Accept but do quality work', effects: { cash: 150000, publicImage: 3 }, result: 'You actually build something decent. Lower margin but the finished project boosts your image.' },
      { label: 'Decline', effects: {}, result: 'Government contracts mean government scrutiny. You pass on the cash to avoid the spotlight.' },
      { label: 'Demand a bigger cut', effects: { cash: 250000, heat: 10 }, result: 'The official agrees to inflate the contract. $250K but it\'s flagged for audit. Risky money.' }
    ]
  },
  {
    id: 'international_crisis', name: 'Supply Chain Crisis', emoji: '🌍', category: 'business', cooldown: 45,
    condition: { minDay: 30 },
    description: 'Political upheaval in a source country disrupts your supply chain. Prices are spiking across the board.',
    outcomes: [
      { label: 'Raise prices', effects: { cash: 3000, trust: -2 }, result: 'You pass the cost to customers. Profit maintained but loyalty takes a hit.' },
      { label: 'Absorb the cost', effects: { cash: -2000, trust: 3 }, result: 'You eat the margin to keep customers happy. Loyalty pays off long-term.' },
      { label: 'Switch products temporarily', effects: { streetCred: 1 }, result: 'You pivot to what\'s available. Versatility is a survival skill.' },
      { label: 'Find emergency source', effects: { cash: -5000, streetCred: 2 }, result: 'A new contact in a different country. Expensive but your supply chain is diversified now.' }
    ]
  },
  {
    id: 'merger_offer', name: 'Faction Merger', emoji: '🤝', category: 'business', cooldown: 60,
    condition: { minAct: 2 },
    description: 'A smaller crew wants to merge with yours. They bring 2 territories, 3 soldiers, and $50K. But their boss wants rank.',
    outcomes: [
      { label: 'Accept their terms', effects: { cash: 50000, streetCred: 3 }, result: 'Your operation doubles overnight. Their boss is ambitious but the resources are worth it.' },
      { label: 'Counter-offer (lower rank)', effects: { cash: 50000, streetCred: 2 }, result: 'They accept a reduced role. The crew integrates smoothly. Smart negotiation.' },
      { label: 'Refuse', effects: { fear: 1 }, result: 'You don\'t need partners. They go elsewhere. Another crew grows stronger.' },
      { label: 'Absorb them by force', effects: { cash: 50000, fear: 5, heat: 15, streetCred: 4 }, result: 'You take everything and offer nothing. Their crew either joins or runs. Brutal consolidation.' }
    ]
  },
  {
    id: 'windfall_discovery', name: 'Hidden Treasure', emoji: '🗝️', category: 'business', cooldown: 60,
    condition: { minDay: 25 },
    description: 'While renovating a property, workers discover a hidden compartment. Something from a previous owner.',
    outcomes: [
      { label: 'Open it', effects: { cash: (function() { return [10000, 25000, 50000, 75000][Math.floor(Math.random() * 4)]; })() }, result: 'Cash! Stacks of bills from a bygone era. A previous owner\'s rainy day fund is now yours.' },
      { label: 'Open carefully (check for traps)', effects: { cash: 30000 }, result: 'Good instincts — there was a dye pack. Disarmed and pocketed. $30K clean.' },
      { label: 'Leave it sealed', effects: {}, result: 'Some secrets are better left buried. You seal it back up. Maybe later.' },
      { label: 'Report it (reduce heat)', effects: { heat: -10, publicImage: 2 }, result: 'You call the authorities. They find old evidence from a cold case. Your cooperation earns goodwill.' }
    ]
  },

  // ============================================================
  // CREW & PERSONAL ENCOUNTERS (25)
  // ============================================================
  {
    id: 'crew_birthday', name: 'Crew Birthday', emoji: '🎂', category: 'crew', cooldown: 30,
    condition: { minCrew: 1 },
    description: 'One of your crew members is having a birthday. The rest of the team is looking at you expectantly.',
    outcomes: [
      { label: 'Throw a party ($5K)', effects: { cash: -5000, trust: 5, stress: -3 }, result: 'The party is legendary. Music, food, drinks. Crew morale skyrockets. Everyone feels like family.' },
      { label: 'Buy a gift ($1K)', effects: { cash: -1000, trust: 2 }, result: 'A thoughtful gift. The birthday crew member is touched. Good leadership moment.' },
      { label: 'Ignore it', effects: { trust: -2 }, result: 'You forgot. Or didn\'t care. Either way, the crew notices.' },
      { label: 'Cash bonus to everyone ($500 each)', effects: { cash: -2000, trust: 3 }, result: 'Everyone gets $500. Professional and appreciated. "Boss always takes care of us."' }
    ]
  },
  {
    id: 'crew_romance', name: 'Crew Romance', emoji: '💕', category: 'crew', cooldown: 40,
    condition: { minCrew: 2 },
    description: 'Two of your crew members are secretly dating. It\'s not a secret anymore. The crew is gossiping.',
    outcomes: [
      { label: 'Support it', effects: { trust: 2, stress: -1 }, result: 'Love blooms in the underworld. The couple is grateful. Paired loyalty bonus.' },
      { label: 'Separate them (different shifts)', effects: { trust: -1 }, result: 'Professional boundaries restored. They\'re unhappy but the operation runs cleaner.' },
      { label: 'Ignore it', effects: {}, result: 'You don\'t comment. What they do off the clock is their business.' },
      { label: 'Use it as leverage', effects: { trust: -3, fear: 2 }, result: '"I know about you two. Don\'t give me reason to make it a problem." Cold but effective control.' }
    ]
  },
  {
    id: 'crew_family_emergency', name: 'Family Emergency', emoji: '🏥', category: 'crew', cooldown: 25,
    condition: { minCrew: 1 },
    description: 'A crew member\'s parent is dying in the hospital. They\'re asking for time off during a critical operation.',
    outcomes: [
      { label: 'Grant time off', effects: { trust: 5 }, result: 'They rush to the hospital. You\'re short-handed for a week but loyalty is permanent.' },
      { label: 'Offer money for medical bills ($10K)', effects: { cash: -10000, trust: 8 }, result: 'The best doctors money can buy. The parent survives. Your crew member would die for you now.' },
      { label: 'Refuse — business first', effects: { trust: -5, stress: 3 }, result: '"We have a job to finish." They stay but something breaks inside. Resentment festers.' },
      { label: 'Handle their problem personally', effects: { cash: -5000, trust: 10, stress: 3 }, result: 'You visit the hospital yourself, pay the bills, comfort the family. This is how empires earn unshakeable loyalty.' }
    ]
  },
  {
    id: 'crew_gambling_debt', name: 'Gambling Debt', emoji: '🃏', category: 'crew', cooldown: 30,
    condition: { minCrew: 1 },
    description: 'A crew member is in deep with loan sharks. $15K owed. They\'re scared and it\'s affecting their work.',
    outcomes: [
      { label: 'Pay their debt ($15K)', effects: { cash: -15000, trust: 8 }, result: 'Debt cleared. They owe you now — not with money, but with absolute loyalty.' },
      { label: 'Let them handle it', effects: { trust: -2 }, result: 'They scrape by, but they start skimming from your operation to pay it off. Trust eroded.' },
      { label: 'Use it as leverage', effects: { fear: 3 }, result: '"I could pay it off... or I could tell them where you live." Their loyalty becomes obligation.' },
      { label: 'Intimidate the loan sharks', effects: { fear: 2, trust: 5 }, result: 'You visit the sharks personally. "Their debt is cancelled." Nobody argues. Problem solved, respect earned.' }
    ]
  },
  {
    id: 'crew_talent', name: 'Hidden Talent', emoji: '🌟', category: 'crew', cooldown: 35,
    condition: { minCrew: 1 },
    description: 'A low-rank crew member reveals a hidden skill: they speak four languages, have medical training, or can hack systems.',
    outcomes: [
      { label: 'Promote them immediately', effects: { trust: 3, streetCred: 1 }, result: 'They move up. Their talent transforms your operation. Never underestimate the quiet ones.' },
      { label: 'Test them first', effects: { trust: 1 }, result: 'You assign them a challenge matching their skill. They excel. Earned promotion follows.' },
      { label: 'Keep them in current role', effects: { trust: -2 }, result: 'Wasted talent. They grow frustrated. Someone else will appreciate them eventually.' },
      { label: 'Send them for advanced training ($2K)', effects: { cash: -2000, trust: 4 }, result: 'You invest in their development. They come back twice as valuable. Smart leadership.' }
    ]
  },
  {
    id: 'crew_rivalry', name: 'Crew Rivalry', emoji: '⚔️', category: 'crew', cooldown: 25,
    condition: { minCrew: 2 },
    description: 'Two crew members\' personal beef has escalated to the point of violence. The whole team is choosing sides.',
    outcomes: [
      { label: 'Mediate personally', effects: { trust: 3, streetCred: 1 }, result: 'You sit them both down. Hard truths spoken. They shake hands. Your authority is reinforced.' },
      { label: 'Let them fight it out', effects: { trust: -1, fear: 2, health: -5 }, result: 'Boxing ring rules. The winner gets bragging rights. One ends up in the hospital. Morale is... complicated.' },
      { label: 'Pick a side', effects: { trust: 2, fear: 1 }, result: 'You back one of them publicly. The other falls in line or leaves. Decisive leadership.' },
      { label: 'Fire them both', effects: { trust: -2, fear: 3 }, result: 'Zero tolerance for drama. Both are gone by sundown. The crew gets the message.' }
    ]
  },
  {
    id: 'crew_past', name: 'Crew Member\'s Past', emoji: '📜', category: 'crew', cooldown: 35,
    condition: { minCrew: 1, minDay: 25 },
    description: 'A crew member\'s past catches up: old warrant, old enemy, or a witness from a previous job looking for payback.',
    outcomes: [
      { label: 'Help them (side mission)', effects: { cash: -3000, trust: 8 }, result: 'You handle their problem. The warrant disappears, the witness recants. Your crew member is free.' },
      { label: 'Cut them loose', effects: { trust: -5, heat: -3 }, result: 'Too much baggage. They understand but they\'re gone. One less liability.' },
      { label: 'Hide them', effects: { cash: -1000, trust: 5 }, result: 'New identity, new safehouse. They\'re ghost. Expensive but they\'re invaluable now.' },
      { label: 'Use the situation', effects: { fear: 2, trust: -1 }, result: '"I know about your past. Let\'s make sure it stays in the past." Another lever of control.' }
    ]
  },
  {
    id: 'crew_addiction', name: 'Crew Addiction', emoji: '💊', category: 'crew', cooldown: 40,
    condition: { minCrew: 1, minDay: 20 },
    description: 'A crew member is developing a serious substance problem. Their work is slipping. Others have noticed.',
    outcomes: [
      { label: 'Intervention + rehab ($5K)', effects: { cash: -5000, trust: 6 }, result: 'You fund their recovery. Thirty days later they\'re back, clean, and more loyal than ever.' },
      { label: 'Ignore it', effects: { trust: -2 }, result: 'Their performance degrades. They start stealing product. A slow-motion disaster.' },
      { label: 'Enable them (keep them productive)', effects: { trust: 1 }, result: 'You supply their habit to keep them functional. Short-term fix, long-term destruction.' },
      { label: 'Fire them', effects: { trust: -1, fear: 1 }, result: 'You let them go. Harsh but the operation can\'t carry dead weight. They might become an informant risk.' }
    ]
  },
  {
    id: 'new_recruit', name: 'Walk-In Recruit', emoji: '🚪', category: 'crew', cooldown: 20,
    condition: {},
    description: 'Someone walks into your spot wanting to join. They look capable but you know nothing about them.',
    outcomes: [
      { label: 'Background check ($500, 2 days)', effects: { cash: -500 }, result: 'Check comes back clean. Above-average skills. A solid addition to the crew.' },
      { label: 'Hire immediately', effects: { streetCred: 1 }, result: 'You take a chance. They could be a cop, a spy, or the best soldier you ever hired. Time will tell.' },
      { label: 'Test them first (dangerous job)', effects: {}, result: 'You send them on a risky run. They handle it perfectly. Earned their spot.' },
      { label: 'Turn them away', effects: {}, result: 'Not taking chances with strangers. They leave. Might end up working for your rival.' }
    ]
  },
  {
    id: 'crew_side_biz', name: 'Side Hustle', emoji: '💼', category: 'crew', cooldown: 30,
    condition: { minCrew: 1 },
    description: 'You discover a crew member is running their own small drug operation without your knowledge or permission.',
    outcomes: [
      { label: 'Tax them (30% cut)', effects: { cash: 500, streetCred: 1 }, result: 'You formalize their side hustle. 30% flows to you. Entrepreneurship rewarded, authority maintained.' },
      { label: 'Shut it down', effects: { trust: -3, fear: 2 }, result: 'You kill their operation. They\'re resentful but compliant. Your territory, your rules.' },
      { label: 'Promote them', effects: { trust: 5, streetCred: 1 }, result: 'You acknowledge their initiative and expand their role. They run a whole new district for you.' },
      { label: 'Confront and warn', effects: { trust: -1, fear: 1 }, result: '"Ask permission next time." They nod. The message is clear without being destructive.' }
    ]
  },
  {
    id: 'crew_achievement', name: 'Crew Heroics', emoji: '🏅', category: 'crew', cooldown: 25,
    condition: { minCrew: 1 },
    description: 'A crew member just did something exceptional — saved your life, closed a huge deal, or defended territory solo.',
    outcomes: [
      { label: 'Bonus + promotion', effects: { cash: -5000, trust: 8, streetCred: 1 }, result: '$5K bonus and a step up. The whole crew sees that excellence is rewarded.' },
      { label: 'Public acknowledgment', effects: { trust: 5 }, result: 'You toast them in front of everyone. Their chest swells with pride. Morale boost across the board.' },
      { label: 'Take the credit yourself', effects: { trust: -5, streetCred: 2 }, result: 'You spin the story to highlight your leadership. They know the truth. Resentment builds.' },
      { label: 'Say nothing', effects: { trust: -3 }, result: 'Their achievement goes unrecognized. They start wondering if loyalty is worth it.' }
    ]
  },
  {
    id: 'loyalty_test', name: 'Loyalty Test', emoji: '🔍', category: 'crew', cooldown: 40,
    condition: { minCrew: 2, minDay: 30 },
    description: 'You planted false info and it leaked. One of your crew talked to outsiders. Was it innocent or betrayal?',
    outcomes: [
      { label: 'Investigate quietly (3 days)', effects: { stress: 3 }, result: 'Surveillance reveals it was casual bar talk, not intentional. Warning issued privately.' },
      { label: 'Confront everyone', effects: { fear: 3, trust: -2 }, result: 'You call a meeting and demand answers. The guilty party sweats. Trust is shaken but the leak is plugged.' },
      { label: 'Set a second trap', effects: { streetCred: 2 }, result: 'You feed different false info to each suspect. When police act on one version, you know exactly who talked.' },
      { label: 'Let it go', effects: { trust: -1 }, result: 'Maybe it was nothing. You move on. But the doubt lingers.' }
    ]
  },
  {
    id: 'crew_dream', name: 'Going Straight', emoji: '🌅', category: 'crew', cooldown: 50,
    condition: { minCrew: 1, minDay: 40 },
    description: 'A loyal crew member confides they want out. Open a restaurant, go back to school — leave the life.',
    outcomes: [
      { label: 'Support their dream ($10K)', effects: { cash: -10000, trust: 10, publicImage: 1 }, result: 'You fund their exit. They leave with tears and gratitude. A contact in the legit world forever.' },
      { label: 'Discourage them', effects: { trust: -3 }, result: '"You think the straight world wants you?" They stay but the light goes out of their eyes.' },
      { label: 'Force them to stay', effects: { fear: 5, trust: -8 }, result: '"Nobody leaves." They comply. But they\'ll look for the first chance to betray or escape.' },
      { label: 'Let them go clean', effects: { trust: 5 }, result: 'No strings, no debts. They walk. One less soldier but zero resentment. Clean separation.' }
    ]
  },
  {
    id: 'crew_movie_night', name: 'Movie Night', emoji: '🎬', category: 'crew', cooldown: 20,
    condition: { minCrew: 1 },
    description: 'The crew organizes a movie night at the safehouse. Scarface is on the TV. Someone ordered pizza.',
    outcomes: [
      { label: 'Join in', effects: { stress: -3, trust: 2 }, result: 'You sit down with your crew. For one night, you\'re just people watching a movie. Everyone needs this.' },
      { label: 'Stay in your office', effects: { stress: 1 }, result: 'Work doesn\'t stop. You hear laughter through the door. Sometimes leadership is lonely.' },
      { label: 'Upgrade to home theater ($3K)', effects: { cash: -3000, trust: 4, stress: -5 }, result: 'You drop $3K on a massive screen and sound system. Movie nights become a weekly tradition. Morale soars.' }
    ]
  },
  {
    id: 'crew_training', name: 'Training Opportunity', emoji: '🥊', category: 'crew', cooldown: 35,
    condition: { minCrew: 1, minCash: 2000 },
    description: 'A retired special forces instructor offers to train your crew. One week, intensive program.',
    outcomes: [
      { label: 'Combat training ($2K/person)', effects: { cash: -4000, fear: 2 }, result: 'Seven days of hell. Your crew comes out tougher, meaner, and more disciplined.' },
      { label: 'Stealth training ($2K/person)', effects: { cash: -4000, streetCred: 1 }, result: 'Infiltration, surveillance, counter-surveillance. Your crew operates like shadows now.' },
      { label: 'Leadership training ($2K/person)', effects: { cash: -4000, trust: 3 }, result: 'Communication, teamwork, chain of command. Your operation runs 30% smoother.' },
      { label: 'Skip it', effects: {}, result: 'Street knowledge is the only training they need. Or so you tell yourself.' }
    ]
  },
  {
    id: 'crew_cultural', name: 'Cultural Celebration', emoji: '🎊', category: 'crew', cooldown: 30,
    condition: { minCrew: 1 },
    description: 'A crew member invites you to their cultural celebration — Haitian Fet Gede, Cuban Nochebuena, Jamaican Independence.',
    outcomes: [
      { label: 'Attend', effects: { trust: 3, communityRep: 2, stress: -2 }, result: 'You show up and show respect. New contacts from the community. Cultural bonds strengthen loyalty.' },
      { label: 'Fund the celebration ($5K)', effects: { cash: -5000, communityRep: 8, trust: 5 }, result: 'You bankroll the whole event. The community celebrates you as a patron. Deep cultural ties established.' },
      { label: 'Decline politely', effects: { trust: -1 }, result: 'You bow out. They understand. But a small opportunity for connection is lost.' },
      { label: 'Send a gift instead', effects: { cash: -500, trust: 1 }, result: 'A respectful contribution without the time commitment. Adequate but not memorable.' }
    ]
  },
  {
    id: 'crew_art', name: 'Crew Artist', emoji: '🎨', category: 'crew', cooldown: 40,
    condition: { minCrew: 1 },
    description: 'A crew member has been painting in their downtime. Turns out they\'re genuinely talented. Gallery-level work.',
    outcomes: [
      { label: 'Fund their art ($5K)', effects: { cash: -5000, trust: 5, publicImage: 2 }, result: 'You sponsor a gallery showing. The art world buzzes. Money laundering through art sales begins.' },
      { label: 'Encourage as hobby', effects: { trust: 2, stress: -1 }, result: 'You hang their work in the safehouse. A reminder that beauty exists even in this life.' },
      { label: 'Mock it', effects: { trust: -4, stress: 1 }, result: '"We\'re not running an art school." The brushes go in the trash. Something dies inside them.' },
      { label: 'Use for forgery operation', effects: { cash: 3000, streetCred: 1 }, result: 'Their talent pivots to counterfeiting documents and forging signatures. Profitable but they wanted more.' }
    ]
  },
  {
    id: 'crew_defection', name: 'Defection Attempt', emoji: '🚨', category: 'crew', cooldown: 35,
    condition: { minCrew: 2, minDay: 20 },
    description: 'A rival faction is actively trying to recruit one of your best crew members. Better pay, better position.',
    outcomes: [
      { label: 'Counter-offer (raise)', effects: { cash: -3000, trust: 4 }, result: 'You match and beat the rival\'s offer. They stay. Loyalty reinforced through investment.' },
      { label: 'Let them go', effects: { trust: -1 }, result: 'They leave peacefully. You lose talent but avoid conflict. They might share intel about you though.' },
      { label: 'Confront the rival', effects: { heat: 5, fear: 3 }, result: 'You visit the rival boss. "Poach my crew again and we have a war." They back off.' },
      { label: 'Make an example', effects: { fear: 8, trust: -5 }, result: 'The crew member who considered leaving is punished publicly. Nobody else will think about defecting.' }
    ]
  },
  {
    id: 'crew_morale', name: 'Low Morale', emoji: '😞', category: 'crew', cooldown: 25,
    condition: { minCrew: 1 },
    description: 'After a recent loss — a death, a bust, territory taken — your crew\'s morale has bottomed out.',
    outcomes: [
      { label: 'Throw a rally party ($5K)', effects: { cash: -5000, trust: 4, stress: -3 }, result: 'Food, drinks, music. You remind them why they chose this life. Spirits lift.' },
      { label: 'Cash bonuses ($1K each)', effects: { cash: -4000, trust: 3 }, result: 'Money talks. Everyone gets a stack. The sting of loss fades behind fresh bills.' },
      { label: 'Inspiring speech', effects: { trust: 5, streetCred: 1 }, result: 'You gather everyone. Raw honesty about the situation. A vision of what comes next. They believe in you again.' },
      { label: 'Do nothing', effects: { trust: -3 }, result: 'Morale continues to sink. Two crew members stop showing up. One starts drinking on the job.' }
    ]
  },
  {
    id: 'informant_reveal', name: 'The Informant', emoji: '🐀', category: 'crew', cooldown: 60,
    condition: { minCrew: 2, minDay: 40 },
    description: 'Irrefutable evidence: one of your crew members is feeding information to the police. A rat in the house.',
    outcomes: [
      { label: 'Turn them into a double agent', effects: { streetCred: 5, heat: -10 }, result: 'You feed false info through them. The police chase ghosts. Masterful counter-intelligence.' },
      { label: 'Exile them', effects: { fear: 2, trust: -1 }, result: 'You cut them loose with a warning. They may inform more, but at least they\'re not inside anymore.' },
      { label: 'Confront publicly', effects: { fear: 5, trust: -3 }, result: 'You expose them in front of everyone. The message is clear. Snitches face consequences.' },
      { label: 'Handle it quietly', effects: { fear: 3, heat: -5 }, result: 'They disappear. No announcement. The crew doesn\'t know specifics but they sense what happened.' }
    ]
  },
  {
    id: 'crew_inheritance', name: 'Crew Windfall', emoji: '💎', category: 'crew', cooldown: 50,
    condition: { minCrew: 1 },
    description: 'A crew member just inherited serious money. Suddenly they don\'t need this life anymore.',
    outcomes: [
      { label: 'Congratulate and let them choose', effects: { trust: 3 }, result: 'They decide to invest half in your operation and keep working. Loyalty by choice is the strongest kind.' },
      { label: 'Ask them to invest in the operation', effects: { cash: 10000, trust: 1 }, result: 'They put $10K into your business. Willing investment, shared profits. Partnership strengthened.' },
      { label: 'Try to keep them around', effects: { trust: -1 }, result: 'They stay but their heart isn\'t in it. Rich people don\'t take the same risks.' },
      { label: 'Celebrate with the whole crew', effects: { trust: 5, stress: -2 }, result: 'You throw a party for their good fortune. No jealousy, just joy. Rare moments of genuine happiness.' }
    ]
  },
  {
    id: 'crew_kid_trouble', name: 'Crew Kid Trouble', emoji: '👦', category: 'crew', cooldown: 35,
    condition: { minCrew: 1, minDay: 20 },
    description: 'Your crew member\'s teenage kid got arrested for shoplifting. They\'re asking you for help.',
    outcomes: [
      { label: 'Get the kid a lawyer ($3K)', effects: { cash: -3000, trust: 8 }, result: 'Charges dropped. The crew member is forever grateful. "You looked out for my family."' },
      { label: 'Bail the kid out ($500)', effects: { cash: -500, trust: 4 }, result: 'Quick bail, minimal drama. The kid gets a scare. Your crew member owes you.' },
      { label: 'Stay out of it', effects: { trust: -2 }, result: 'Not your problem. But your crew member expected family support from their family. Disappointment sets in.' },
      { label: 'Talk to the kid personally', effects: { trust: 6, communityRep: 1 }, result: 'You sit the kid down and scare them straight. No cost, maximum impact. The parent is deeply moved.' }
    ]
  },
  {
    id: 'crew_snitched_on', name: 'Crew Rumor Mill', emoji: '🗣️', category: 'crew', cooldown: 25,
    condition: { minCrew: 1 },
    description: 'Someone outside your organization is spreading ugly rumors about one of your crew members.',
    outcomes: [
      { label: 'Protect your crew member', effects: { trust: 5, fear: 2 }, result: 'You find the source and shut them down. Your crew sees you have their back. Loyalty deepens.' },
      { label: 'Use the information', effects: { trust: -3, fear: 1 }, result: 'You leverage the rumor for your own purposes. Effective but your crew member feels betrayed.' },
      { label: 'Ignore it', effects: { trust: -2, stress: 1 }, result: 'The rumors spread. Your crew member\'s morale tanks. They needed you and you weren\'t there.' },
      { label: 'Investigate the truth', effects: { trust: 1 }, result: 'You look into it. Turns out the rumor is half-true. Now you have a full picture before deciding.' }
    ]
  },
  {
    id: 'crew_reunion', name: 'Old Crew Reunion', emoji: '🔙', category: 'crew', cooldown: 45,
    condition: { minDay: 30 },
    description: 'A former associate from your early days shows up. They\'ve been in prison for three years. They look different.',
    outcomes: [
      { label: 'Rehire them', effects: { trust: 3, streetCred: 1 }, result: 'Old loyalty, new determination. They know the streets and they owe you for the welcome back.' },
      { label: 'Hear them out', effects: {}, result: 'They have intel from prison about other operations. Valuable information regardless of whether you rehire.' },
      { label: 'Turn them away', effects: { trust: -2 }, result: 'Prison changes people. You can\'t trust who they are now. They leave bitter.' },
      { label: 'Set them up in a legitimate job', effects: { cash: -2000, communityRep: 2 }, result: 'You fund their fresh start. They become a bridge to the legitimate world for you.' }
    ]
  },

  // ============================================================
  // LAW ENFORCEMENT ENCOUNTERS (20)
  // ============================================================
  {
    id: 'undercover_approach', name: 'Undercover Buyer', emoji: '🕵️', category: 'law', cooldown: 25,
    condition: {},
    description: 'Someone approaches wanting to buy. They\'re asking all the right questions but something feels off.',
    outcomes: [
      { label: 'Sell to them', effects: { cash: 500 }, result: 'They pay and leave. Turns out they were just a nervous first-timer. Lucky.' },
      { label: 'Refuse the sale', effects: {}, result: 'You turn them down. They leave disappointed. Later, you see them flash a badge to someone else. Close call.' },
      { label: 'Test them first', effects: { streetCred: 2 }, result: 'You ask them to hold product first. A real buyer would, a cop won\'t. They hesitate and walk away. Confirmed.' },
      { label: 'Feed them bad intel', effects: { streetCred: 1, heat: -3 }, result: 'You sell them garbage product and a fake supplier name. Let the cops chase ghosts.' }
    ]
  },
  {
    id: 'corrupt_cop_offer', name: 'Corrupt Cop Offer', emoji: '👮', category: 'law', cooldown: 40,
    condition: { minDay: 15 },
    description: 'A beat cop pulls you aside. "$500 a week and I never see what happens on this corner. Deal?"',
    outcomes: [
      { label: 'Accept ($500/week)', effects: { cash: -500, heat: -10 }, result: 'A handshake deal. They patrol your block like nothing\'s there. Worth every penny.' },
      { label: 'Negotiate to $300/week', effects: { cash: -300, heat: -7 }, result: 'They take the lower rate. Cheaper protection but they might not try as hard.' },
      { label: 'Decline', effects: {}, result: 'You don\'t trust dirty cops. They shrug and walk away. Business as usual.' },
      { label: 'Report to Internal Affairs', effects: { heat: -15, trust: -5 }, result: 'You tip off IA anonymously. The cop gets investigated. Major heat reduction but you\'re flirting with snitch territory.' }
    ]
  },
  {
    id: 'witness_situation', name: 'Civilian Witness', emoji: '👀', category: 'law', cooldown: 30,
    condition: { minDay: 10, minHeat: 10 },
    description: 'A civilian saw one of your operations. They haven\'t gone to police yet but they\'re nervous and talking to neighbors.',
    outcomes: [
      { label: 'Bribe them ($5K)', effects: { cash: -5000, heat: -5 }, result: 'Money buys silence. They take the cash and suddenly remember nothing.' },
      { label: 'Intimidate', effects: { fear: 3, publicImage: -3, heat: -3 }, result: 'A visit from your crew. No words needed. They won\'t talk. But the neighborhood notices.' },
      { label: 'Befriend them over time', effects: { trust: 2, publicImage: 1 }, result: 'You become a helpful neighbor. Fix their car, check on their kids. They decide you\'re "not so bad."' },
      { label: 'Ignore and hope', effects: { heat: 5 }, result: 'You gamble on their silence. They talk. Heat goes up.' }
    ]
  },
  {
    id: 'search_warrant', name: 'Search Warrant', emoji: '📜', category: 'law', cooldown: 45,
    condition: { minHeat: 30 },
    description: 'Police arrive at your property with a warrant. Sirens, badges, the whole show. They\'re going through everything.',
    outcomes: [
      { label: 'You had advance warning', effects: { heat: -5 }, result: 'Your corrupt cop tipped you off. The stash was moved last night. They find nothing.' },
      { label: 'Hidden room saves you', effects: {}, result: 'The construction investment pays off. They tear the place apart but miss the hidden compartment.' },
      { label: 'They find something small', effects: { heat: 10, cash: -5000 }, result: 'A small amount they missed. Misdemeanor charge, $5K in legal fees. Could have been much worse.' },
      { label: 'Major bust', effects: { heat: 25, cash: -20000 }, result: 'They find the motherload. Arrest, booking, bail. $20K in product and legal fees. Devastating setback.' }
    ]
  },
  {
    id: 'internal_affairs', name: 'IA Investigation', emoji: '🔎', category: 'law', cooldown: 50,
    condition: { minDay: 30 },
    description: 'Internal Affairs is investigating your corrupt police contact. They\'re getting close. Your cop is sweating.',
    outcomes: [
      { label: 'Cut ties immediately', effects: { heat: 5 }, result: 'You sever all contact. Safe but you lose your inside man.' },
      { label: 'Warn the cop', effects: { trust: 3, heat: 3 }, result: 'You tip them off. They cover their tracks. Your relationship strengthens but IA is still sniffing around.' },
      { label: 'Frame someone else', effects: { heat: -5, streetCred: 2 }, result: 'You plant evidence pointing IA at another corrupt cop. Your guy walks clean.' },
      { label: 'Let it play out', effects: { stress: 5 }, result: 'You do nothing. Fifty-fifty whether your cop survives the investigation. Stressful waiting game.' }
    ]
  },
  {
    id: 'new_police_chief', name: 'New Police Chief', emoji: '⭐', category: 'law', cooldown: 90,
    condition: { minDay: 40 },
    description: 'Miami PD gets a new police chief. The entire department\'s priorities are about to shift.',
    outcomes: [
      { label: 'Research the new chief', effects: {}, result: 'Aggressive anti-drug crusader. Heat generation increases 25% for the next 30 days. Adjust accordingly.' },
      { label: 'Reach out through intermediary', effects: { cash: -10000, heat: -10 }, result: 'The new chief has expensive tastes. $10K establishes a line of communication.' },
      { label: 'Lay low for a month', effects: { cash: -2000, heat: -5 }, result: 'You reduce operations temporarily. Revenue drops but so does your profile.' },
      { label: 'Business as usual', effects: { heat: 10 }, result: 'The new chief is running a media campaign. Anyone who doesn\'t adjust gets made an example. Heat rises.' }
    ]
  },
  {
    id: 'snitch_reward', name: 'Snitch Bounty', emoji: '💰', category: 'law', cooldown: 60,
    condition: { minHeat: 40 },
    description: 'Police announce a $50K reward for information on your operation. Every crew member just became a potential traitor.',
    outcomes: [
      { label: 'Increase crew pay', effects: { cash: -5000, trust: 3 }, result: 'You raise everyone\'s cut. Loyalty through prosperity. Nobody\'s tempted by snitch money.' },
      { label: 'Make a public statement', effects: { fear: 5, streetCred: 3 }, result: 'You send a message through the grapevine about what happens to snitches. Crystal clear.' },
      { label: 'Internal security sweep', effects: { cash: -2000, trust: -1, heat: -3 }, result: 'You sweep for bugs, check phones, monitor behavior. Professional paranoia. Effective.' },
      { label: 'Ignore it', effects: { trust: -3, heat: 5 }, result: 'You shrug it off. But $50K is $50K, and someone in your crew is doing the math.' }
    ]
  },
  {
    id: 'evidence_leak', name: 'Evidence Leak', emoji: '📰', category: 'law', cooldown: 50,
    condition: { minHeat: 30, minDay: 25 },
    description: 'A media outlet publishes leaked police evidence. Your photo is on the evening news. Everyone knows your face now.',
    outcomes: [
      { label: 'Disguise and lay low', effects: { heat: 15, cash: -2000 }, result: 'New appearance, limited movement. You watch yourself on the news from a motel room.' },
      { label: 'Control the narrative (journalist contact)', effects: { cash: -10000, publicImage: 5, heat: 5 }, result: 'Your media contact runs a counter-story: community leader, philanthropist. The narrative shifts.' },
      { label: 'Leave town temporarily', effects: { cash: -5000, heat: -10 }, result: 'Two weeks in another city. Things cool down. When you return, new news has taken over.' },
      { label: 'Embrace the fame', effects: { fear: 5, streetCred: 5, heat: 20 }, result: 'You lean into it. Notoriety has its own currency. The streets worship you. The police hate you more.' }
    ]
  },
  {
    id: 'police_raid_rival', name: 'Rival Gets Raided', emoji: '🚔', category: 'law', cooldown: 35,
    condition: { minDay: 15 },
    description: 'Police raid your biggest rival\'s operation. Their dealers are scattering, customers are stranded, territory is up for grabs.',
    outcomes: [
      { label: 'Grab their territory', effects: { streetCred: 3, heat: 5 }, result: 'You move fast. Their corners are yours by nightfall. Expansion during chaos.' },
      { label: 'Recruit their fleeing crew', effects: { trust: 1 }, result: 'You offer shelter and jobs to their best people. Instant talent acquisition.' },
      { label: 'Buy their product cheap', effects: { cash: -2000 }, result: 'Panicking dealers sell at 30 cents on the dollar. You stockpile at incredible prices.' },
      { label: 'Stay away — cops are active', effects: {}, result: 'Smart. Heavy police presence means anyone in the area gets extra scrutiny.' }
    ]
  },
  {
    id: 'false_flag', name: 'False Accusation', emoji: '❓', category: 'law', cooldown: 40,
    condition: { minDay: 20 },
    description: 'Police are investigating you for a crime you didn\'t commit. Someone else\'s mess is landing on your doorstep.',
    outcomes: [
      { label: 'Provide an alibi', effects: { heat: -5 }, result: 'Your alibi checks out. Investigation dropped. But you had to reveal your actual location that night.' },
      { label: 'Let them investigate (wastes their time)', effects: { heat: 3 }, result: 'They chase a dead end. Resources wasted on you means less pressure elsewhere.' },
      { label: 'Frame the real perpetrator', effects: { heat: -10, streetCred: 2 }, result: 'You point the cops at the actual criminal. Justice served, ironically by you.' },
      { label: 'Lawyer up ($5K)', effects: { cash: -5000, heat: -8 }, result: 'Your attorney makes the case disappear through legal procedure. Clean and professional.' }
    ]
  },
  {
    id: 'ankle_monitor', name: 'Ankle Monitor', emoji: '📡', category: 'law', cooldown: 90,
    condition: { minHeat: 40, minDay: 30 },
    description: 'After a minor charge, the court slaps an ankle monitor on you. 30 days of restricted movement.',
    outcomes: [
      { label: 'Comply (limited operations)', effects: { heat: -15, cash: -3000 }, result: 'You run things by phone for a month. Revenue drops but you stay clean.' },
      { label: 'Tamper with it (risky)', effects: { heat: 10, streetCred: 3 }, result: 'A tech guy disables the GPS for hours at a time. You operate normally but if caught, it\'s prison.' },
      { label: 'Bribe probation officer ($5K)', effects: { cash: -5000, heat: -5 }, result: 'Your PO develops convenient blindness. Business as usual behind closed doors.' },
      { label: 'Delegate everything', effects: { trust: 3, cash: -1000 }, result: 'Your top lieutenant runs the show. Good test of their capability. You coach from the couch.' }
    ]
  },
  {
    id: 'surveillance_van', name: 'Surveillance Van', emoji: '🚐', category: 'law', cooldown: 35,
    condition: { minHeat: 25 },
    description: 'You spot a plain white van with dark windows parked near your property. It\'s been there for three days.',
    outcomes: [
      { label: 'Move operations immediately', effects: { cash: -3000, heat: -5 }, result: 'Relocate everything to backup locations. Expensive but you deny them any useful footage.' },
      { label: 'Sweep for bugs', effects: { cash: -1000, heat: -3 }, result: 'Professional sweep finds two listening devices. Destroyed. Your conversations are private again.' },
      { label: 'Feed disinformation', effects: { streetCred: 2 }, result: 'You stage fake conversations and activities. Let them waste months on false leads.' },
      { label: 'Confront them', effects: { fear: 1, heat: 5 }, result: 'You knock on the van. "Nice day for a stakeout, officers." They deny everything but they know you know.' }
    ]
  },
  {
    id: 'asset_forfeiture', name: 'Asset Forfeiture', emoji: '🏦', category: 'law', cooldown: 60,
    condition: { minHeat: 50, minCash: 20000 },
    description: 'Federal agents freeze your bank account and seize a property. Civil asset forfeiture. They don\'t even need a conviction.',
    outcomes: [
      { label: 'Fight it legally ($30K)', effects: { cash: -30000, heat: -5 }, result: 'Your lawyer battles for 60 days. You recover 60% of the assets. Expensive but partially successful.' },
      { label: 'Accept the loss', effects: { cash: -20000, stress: 5 }, result: 'You write it off. $20K gone. But fighting would have cost more and drawn more attention.' },
      { label: 'Hide remaining assets fast', effects: { cash: -5000, streetCred: 1 }, result: 'You scramble to move everything into untraceable accounts. Some loss but most is preserved.' },
      { label: 'Negotiate through contacts', effects: { cash: -15000 }, result: 'Your political connections intervene quietly. A portion is returned. The rest is the cost of doing business.' }
    ]
  },
  {
    id: 'miranda_violation', name: 'Procedural Error', emoji: '⚖️', category: 'law', cooldown: 50,
    condition: { minDay: 20 },
    description: 'During a recent arrest of your crew member, the cops made a procedural mistake. Your lawyer spotted it immediately.',
    outcomes: [
      { label: 'Exploit the error (lawyer)', effects: { cash: -5000, heat: -10 }, result: 'Case dismissed. Your crew member walks. The prosecution is furious but powerless.' },
      { label: 'Negotiate reduced charges', effects: { cash: -3000, heat: -5 }, result: 'Your lawyer leverages the error into a plea deal. Minimal consequences.' },
      { label: 'File a complaint', effects: { publicImage: 2, heat: -3 }, result: 'You file a formal complaint about police misconduct. Good PR and a slap on their wrist.' },
      { label: 'Save it for later leverage', effects: {}, result: 'You document everything but don\'t act yet. This card might be more valuable played later.' }
    ]
  },
  {
    id: 'embedded_reporter', name: 'Embedded Reporter', emoji: '📝', category: 'law', cooldown: 45,
    condition: { minDay: 25 },
    description: 'A journalist is doing an investigative series on Miami\'s drug trade. They\'re asking questions in your neighborhood.',
    outcomes: [
      { label: 'Recruit them as contact', effects: { cash: -5000, streetCred: 2 }, result: 'For $5K they become your media insider. Plant stories, suppress stories, gather intel.' },
      { label: 'Feed them rival intel', effects: { heat: -5, streetCred: 1 }, result: 'Anonymous tips about your competitors. The article exposes THEM. Your operation stays in the shadows.' },
      { label: 'Intimidate them away', effects: { fear: 2, publicImage: -2 }, result: 'A threatening message and they drop the story. Free press has limits when confronted with fear.' },
      { label: 'Ignore them', effects: { heat: 5 }, result: 'They keep digging. Some of what they find points to you. Heat from media attention.' }
    ]
  },
  {
    id: 'community_policing', name: 'Community Policing', emoji: '🏘️', category: 'law', cooldown: 40,
    condition: { minDay: 15 },
    description: 'A new community policing initiative launches in your district. More foot patrols, town halls, neighborhood watch.',
    outcomes: [
      { label: 'Attend meetings (blend in)', effects: { publicImage: 2, heat: -3 }, result: 'You attend as a "concerned citizen." Perfect intel on police plans. Plus good PR.' },
      { label: 'Bribe community organizers', effects: { cash: -3000, heat: -5 }, result: 'Key organizers get quiet payments. The initiative loses steam in your area.' },
      { label: 'Redirect attention elsewhere', effects: { cash: -2000, heat: -3 }, result: 'You fund complaints about crime in OTHER districts. Police resources shift away from yours.' },
      { label: 'Reduce operations temporarily', effects: { cash: -2000, heat: -8 }, result: 'You scale back until the initiative loses funding (they always do). Patient play.' }
    ]
  },
  {
    id: 'jury_duty', name: 'Jury Duty', emoji: '🏛️', category: 'law', cooldown: 60,
    condition: {},
    description: 'You get called for jury duty. Of all the ironic situations. The defendant looks familiar.',
    outcomes: [
      { label: 'Attend (5 days lost)', effects: { stress: 3, publicImage: 1 }, result: 'You serve your civic duty. The irony isn\'t lost on you. Interesting view of the justice system from inside.' },
      { label: 'Skip it (small fine)', effects: { cash: -500 }, result: 'You pay the fine and go about your business. $500 for freedom is a bargain.' },
      { label: 'Attend — influence the verdict', effects: { trust: 5, streetCred: 3 }, result: 'The defendant IS your associate. You sway the jury. Not guilty. The ultimate inside job.' },
      { label: 'Get excused legitimately', effects: {}, result: 'You claim a hardship and get dismissed. No fine, no time lost, no drama.' }
    ]
  },
  {
    id: 'cold_case', name: 'Cold Case Reopened', emoji: '📁', category: 'law', cooldown: 60,
    condition: { minDay: 40, minHeat: 20 },
    description: 'Detectives reopen an old case from your early days. New forensic technology. Your DNA might be in the system.',
    outcomes: [
      { label: 'Destroy old evidence', effects: { cash: -3000, heat: -5 }, result: 'You visit old locations and clean up traces. Professional crime scene sanitation.' },
      { label: 'Lawyer up immediately ($10K)', effects: { cash: -10000, heat: -8 }, result: 'Your attorney intervenes early. Insufficient evidence. Case goes cold again.' },
      { label: 'Contact old witnesses', effects: { cash: -5000, fear: 3 }, result: 'You visit people who might remember. Generous donations to their memory loss.' },
      { label: 'Flee jurisdiction temporarily', effects: { cash: -8000, heat: -15 }, result: 'You disappear for three weeks. By the time you return, they\'ve moved on to other cases.' }
    ]
  },
  {
    id: 'plea_deal', name: 'Plea Deal Offer', emoji: '🤝', category: 'law', cooldown: 60,
    condition: { minHeat: 40 },
    description: 'The prosecutor offers a deal: reduced charges in exchange for information on your suppliers or allies.',
    outcomes: [
      { label: 'Refuse completely', effects: { fear: 2, streetCred: 5 }, result: 'You shut your mouth. Word gets out that you\'re solid. Street legend status.' },
      { label: 'Give them crumbs', effects: { heat: -10, trust: -3 }, result: 'You feed them outdated intel on small-time players. Enough to satisfy them, not enough to matter.' },
      { label: 'Counter-offer through lawyer', effects: { cash: -5000, heat: -15 }, result: 'Your lawyer negotiates immunity for cooperation on an unrelated case. Masterful legal chess.' },
      { label: 'Take the deal (betray)', effects: { heat: -30, trust: -20, streetCred: -10 }, result: 'You give them everything. You walk free but your reputation is destroyed. Former allies become enemies.' }
    ]
  },
  {
    id: 'police_funeral', name: 'Officer Down', emoji: '🕯️', category: 'law', cooldown: 60,
    condition: { minDay: 20 },
    description: 'A police officer was killed. If it was during one of your operations, the heat is about to be volcanic.',
    outcomes: [
      { label: 'Lay low completely', effects: { heat: 15, cash: -3000 }, result: 'You shut everything down for two weeks. The investigation is intense but finds nothing.' },
      { label: 'Attend the funeral (bold)', effects: { publicImage: 3, heat: 5 }, result: 'You show up in a suit. The audacity. Some see a respectful citizen. Cops see a suspect.' },
      { label: 'Anonymous donation to family ($10K)', effects: { cash: -10000, heat: -5, publicImage: 5 }, result: 'A generous anonymous gift. The family is grateful. Even some cops soften toward the community.' },
      { label: 'Use the distraction', effects: { cash: 5000, heat: 10 }, result: 'While the entire force mourns, your operation runs full speed. Profitable but cold.' }
    ]
  },

  // ============================================================
  // FACTION & TERRITORY ENCOUNTERS (20)
  // ============================================================
  {
    id: 'faction_peace', name: 'Peace Offering', emoji: '🕊️', category: 'faction', cooldown: 40,
    condition: { minDay: 20 },
    description: 'A hostile faction sends an emissary with expensive gifts and a proposal to end the conflict.',
    outcomes: [
      { label: 'Accept peace terms', effects: { trust: 3, streetCred: 1 }, result: 'The war ends. Trade routes open. Both sides profit from peace. For now.' },
      { label: 'Counter-offer better terms', effects: { trust: 1, streetCred: 2, cash: 5000 }, result: 'You negotiate from strength. They agree to pay reparations plus a trade deal. Favorable peace.' },
      { label: 'Refuse', effects: { fear: 2, streetCred: 2 }, result: 'You send the emissary back empty-handed. The war continues. Your resolve is noted.' },
      { label: 'Kill the emissary', effects: { fear: 10, trust: -8, heat: 15 }, result: 'A shocking violation of protocol. Every faction in Miami takes notice. You are feared and hated.' }
    ]
  },
  {
    id: 'neutral_zone', name: 'Neutral Zone Proposal', emoji: '🤝', category: 'faction', cooldown: 50,
    condition: { minAct: 2 },
    description: 'Two factions propose creating a neutral trading zone. Safe dealing, reduced heat, but shared intelligence risk.',
    outcomes: [
      { label: 'Agree to the zone', effects: { trust: 3, cash: 2000 }, result: 'Trade flourishes in the neutral zone. Revenue up, heat down. But rivals see your operations too.' },
      { label: 'Propose your territory as host', effects: { cash: 5000, streetCred: 3 }, result: 'The zone operates on your turf. You control access and take a cut of everything. Home advantage.' },
      { label: 'Refuse', effects: { streetCred: 1 }, result: 'You don\'t share. Your operation stays independent. Some call it stubborn, others call it smart.' },
      { label: 'Agree then spy on everyone', effects: { streetCred: 2 }, result: 'You join the zone but plant informants. Intel flows while you appear cooperative.' }
    ]
  },
  {
    id: 'faction_leader_secret', name: 'Leader\'s Secret', emoji: '🔓', category: 'faction', cooldown: 50,
    condition: { minDay: 30 },
    description: 'You discover a major faction leader\'s dark secret — addiction, affair, financial ruin. Leverage is power.',
    outcomes: [
      { label: 'Blackmail for services', effects: { cash: 5000, fear: 3 }, result: 'They do whatever you want. Free product, territory access, intel. The secret is your leash.' },
      { label: 'Expose them publicly', effects: { streetCred: 5, trust: -3 }, result: 'You leak it all. Their faction implodes. Power vacuum creates opportunity but you\'re feared and distrusted.' },
      { label: 'Keep quiet (they owe you)', effects: { trust: 5 }, result: 'You let them know you know, but say nothing. A favor in the bank worth more than immediate gain.' },
      { label: 'Sell to their rival', effects: { cash: 10000, trust: -5 }, result: '$10K for the intel. Their rival destroys them with it. Profitable but you\'re seen as a mercenary.' }
    ]
  },
  {
    id: 'territory_flip', name: 'Community Uprising', emoji: '✊', category: 'faction', cooldown: 40,
    condition: {},
    description: 'Locals in your territory are organizing to replace your operation with a community center. Petitions, meetings, protests.',
    outcomes: [
      { label: 'Donate to the cause ($10K)', effects: { cash: -10000, communityRep: 10, publicImage: 5 }, result: 'You fund their community center AND keep operating discreetly. Public hero, private criminal.' },
      { label: 'Suppress the movement', effects: { fear: 5, communityRep: -10 }, result: 'Intimidation tactics. The organizers scatter. But the community remembers and resentment grows.' },
      { label: 'Relocate discreetly', effects: { cash: -3000 }, result: 'You move to less visible spots. Operations continue, community gets their center. Win-win.' },
      { label: 'Negotiate community benefits', effects: { cash: -5000, communityRep: 5 }, result: 'You fund youth programs and clean-up. The protests stop. Coexistence through investment.' }
    ]
  },
  {
    id: 'faction_civil_war', name: 'Faction Civil War', emoji: '💥', category: 'faction', cooldown: 60,
    condition: { minDay: 30, minAct: 2 },
    description: 'A major rival faction splits internally. Two lieutenants are fighting for control. Chaos and opportunity.',
    outcomes: [
      { label: 'Support one side', effects: { cash: -5000, streetCred: 3 }, result: 'Your chosen side wins. They owe you. An ally born from their civil war.' },
      { label: 'Support both secretly', effects: { cash: -10000, streetCred: 5 }, result: 'You fund both sides. The war drags on, weakening them. Machiavelli would be proud.' },
      { label: 'Stay neutral', effects: {}, result: 'You watch from the sidelines. They weaken each other. You strengthen by comparison.' },
      { label: 'Attack both', effects: { heat: 15, fear: 5, streetCred: 4, cash: 10000 }, result: 'While they fight each other, you take everything. Territory, product, crew. Ruthless expansion.' }
    ]
  },
  {
    id: 'trade_route_dispute', name: 'Trade Route Toll', emoji: '🛣️', category: 'faction', cooldown: 35,
    condition: { minDay: 15 },
    description: 'Your supply route passes through another faction\'s territory. They want a toll — $2K per shipment.',
    outcomes: [
      { label: 'Pay the toll', effects: { cash: -2000 }, result: 'Cost of business. The route stays open and your shipments arrive safely.' },
      { label: 'Negotiate a one-time payment ($10K)', effects: { cash: -10000, streetCred: 1 }, result: 'A lump sum buys permanent passage. No more per-shipment fees.' },
      { label: 'Find an alternative route', effects: { cash: -1000, stress: 2 }, result: 'Longer and costlier but you answer to no one. Independence has its price.' },
      { label: 'Fight for passage', effects: { heat: 10, fear: 3, streetCred: 3 }, result: 'You take the route by force. No more tolls. But now you have a blood feud on your hands.' }
    ]
  },
  {
    id: 'faction_event', name: 'Faction Invitation', emoji: '🎪', category: 'faction', cooldown: 35,
    condition: { minDay: 20 },
    description: 'A rival faction invites you to a celebration. Could be diplomacy, could be a trap. Your crew advises caution.',
    outcomes: [
      { label: 'Attend', effects: { trust: 3, streetCred: 2, stress: 2 }, result: 'It\'s legitimate. Good food, good conversation, good intel. New connections forged over drinks.' },
      { label: 'Attend with heavy security', effects: { trust: 1, fear: 2 }, result: 'You roll deep. The show of force is noted. They respect your caution and your power.' },
      { label: 'Send a representative', effects: { trust: 1 }, result: 'Your second-in-command goes. They gather intel without risking your life. Smart play.' },
      { label: 'Decline', effects: { trust: -1 }, result: 'You stay home. They\'re offended. An opportunity for diplomacy missed.' }
    ]
  },
  {
    id: 'border_skirmish', name: 'Border Skirmish', emoji: '⚡', category: 'faction', cooldown: 25,
    condition: { minDay: 15 },
    description: 'Gunfire on the border between your territory and a rival\'s. Nobody ordered it — street-level beef got hot.',
    outcomes: [
      { label: 'De-escalate', effects: { trust: 2, streetCred: 1 }, result: 'You reach out to their boss. Both sides pull back. Discipline restored. Crisis averted.' },
      { label: 'Punish your crew member', effects: { fear: 2, trust: -1 }, result: 'Public discipline sends a message: unauthorized violence has consequences. Control maintained.' },
      { label: 'Escalate to full attack', effects: { heat: 20, fear: 5, streetCred: 3 }, result: 'You use the incident as justification for war. Territory is seized. But the cost is high.' },
      { label: 'Demand compensation', effects: { cash: 3000, streetCred: 2 }, result: '"Your guys started it. Pay up." They grudgingly send $3K. Honor satisfied on both sides.' }
    ]
  },
  {
    id: 'refugee_dealers', name: 'Refugee Dealers', emoji: '🏃', category: 'faction', cooldown: 40,
    condition: { minDay: 25 },
    description: 'Dealers from a collapsed faction are drifting into your area. Experienced but homeless. They need a crew to join.',
    outcomes: [
      { label: 'Recruit all of them', effects: { streetCred: 2, trust: -1 }, result: 'Instant expansion. But their loyalty is to survival, not to you. Watch your back.' },
      { label: 'Cherry-pick the best', effects: { streetCred: 1, trust: 1 }, result: 'You take the top talent and send the rest packing. Quality over quantity.' },
      { label: 'Drive them out', effects: { fear: 3 }, result: 'You make it clear: no freelancers in your territory. They scatter to other districts.' },
      { label: 'Set them up under your banner', effects: { cash: -2000, streetCred: 3 }, result: 'You give them a new district to run under your name. Loyal vassals born from desperation.' }
    ]
  },
  {
    id: 'faction_crash', name: 'Faction Collapse', emoji: '📉', category: 'faction', cooldown: 50,
    condition: { minDay: 30 },
    description: 'A rival faction\'s main revenue got busted. Their lab seized, leader arrested. They\'re desperate and drowning.',
    outcomes: [
      { label: 'Offer a bailout (they owe you)', effects: { cash: -20000, trust: 5, streetCred: 3 }, result: 'You save them from extinction. They owe you everything. A satellite faction under your influence.' },
      { label: 'Buy their territory cheap', effects: { cash: -10000, streetCred: 2 }, result: 'Fire sale on turf. You expand your empire at pennies on the dollar.' },
      { label: 'Recruit their talent', effects: { trust: 1 }, result: 'Their best chemist, their best enforcer, their best driver. All wearing your colors now.' },
      { label: 'Kick them while down', effects: { fear: 5, heat: 10, cash: 15000 }, result: 'You raid their remaining operations. Total destruction. Savage but your dominance is absolute.' }
    ]
  },
  {
    id: 'sacred_ground', name: 'Sacred Ground', emoji: '🙏', category: 'faction', cooldown: 50,
    condition: {},
    description: 'A historical site in your territory has cultural significance. Building there would be profitable but offensive to the community.',
    outcomes: [
      { label: 'Respect and protect it', effects: { communityRep: 8, publicImage: 3 }, result: 'You declare the site protected. The community embraces you as a cultural guardian.' },
      { label: 'Develop it anyway ($50K profit)', effects: { cash: 50000, communityRep: -15, publicImage: -5 }, result: 'Profit over heritage. The money is good but the community will never forgive you.' },
      { label: 'Compromise (partial development)', effects: { cash: 20000, communityRep: -3 }, result: 'You develop around the site, preserving the core. Some grumbling but mostly acceptance.' },
      { label: 'Use as neutral meeting ground', effects: { trust: 3, streetCred: 2 }, result: 'The sacred space becomes a place for faction meetings. Respected ground, respected rules.' }
    ]
  },
  {
    id: 'proxy_war', name: 'Proxy War', emoji: '♟️', category: 'faction', cooldown: 50,
    condition: { minAct: 2 },
    description: 'Two outside factions want to fight their war in YOUR territory. They\'re already moving pieces onto your board.',
    outcomes: [
      { label: 'Refuse both', effects: { fear: 2, streetCred: 3 }, result: 'You push both out. Your territory, your rules. They find another battlefield.' },
      { label: 'Side with the stronger one', effects: { cash: 10000, trust: -2 }, result: 'You back the winner. Rewards flow. But the loser remembers your choice.' },
      { label: 'Charge both for "battlefield rent"', effects: { cash: 15000, streetCred: 4 }, result: 'Mercenary genius. Both pay you to fight on your turf. You profit from their blood.' },
      { label: 'Mediate for peace', effects: { trust: 5, streetCred: 5, publicImage: 3 }, result: 'You broker peace. Both sides owe you. Your reputation as a leader soars.' }
    ]
  },
  {
    id: 'double_agent', name: 'Spy Discovered', emoji: '🕵️', category: 'faction', cooldown: 45,
    condition: { minDay: 25 },
    description: 'Your spy in a rival faction has been caught. They\'re being held and interrogated. The clock is ticking.',
    outcomes: [
      { label: 'Rescue mission', effects: { cash: -5000, heat: 10, trust: 5 }, result: 'You extract your agent in a midnight raid. They\'re alive and grateful. But the rival knows you planted them.' },
      { label: 'Deny everything', effects: { trust: -5 }, result: 'You cut them loose. "Never heard of them." They\'re tortured. Your intel channel is dead.' },
      { label: 'Prisoner exchange', effects: { trust: 2 }, result: 'You offer a trade: their captured member for yours. Clean, professional. Both sides respect the protocol.' },
      { label: 'Sacrifice them, protect intel', effects: { fear: 3, trust: -3 }, result: 'The spy knows too much to be captured alive. You ensure they can\'t talk. Cold calculus.' }
    ]
  },
  {
    id: 'mutual_enemy', name: 'Common Threat', emoji: '⚠️', category: 'faction', cooldown: 50,
    condition: { minAct: 2 },
    description: 'A new external threat endangers both you and your biggest rival. A federal task force, an outside cartel, or a political crackdown.',
    outcomes: [
      { label: 'Temporary alliance', effects: { trust: 5, streetCred: 3 }, result: 'You and your rival work together. The threat is neutralized. The alliance might survive the crisis.' },
      { label: 'Let the rival handle it', effects: {}, result: 'They fight alone and are weakened. You swoop in after. Opportunistic but effective.' },
      { label: 'Help secretly', effects: { trust: 3 }, result: 'You provide anonymous support. The threat is defeated and your rival doesn\'t know you helped.' },
      { label: 'Use the chaos to attack both', effects: { heat: 15, fear: 5, streetCred: 3 }, result: 'Three-way war. You attack the rival while they fight the threat. Brutal but you come out on top.' }
    ]
  },
  {
    id: 'gentrification', name: 'Gentrification Wave', emoji: '🏗️', category: 'faction', cooldown: 60,
    condition: { minDay: 30 },
    description: 'Your profitable territory is gentrifying. Coffee shops replacing bodegas. Property values tripling. Police attention increasing.',
    outcomes: [
      { label: 'Sell properties at peak', effects: { cash: 50000 }, result: 'Cash out while values are high. $50K in clean real estate money. But you lose your base.' },
      { label: 'Adapt to new demographics', effects: { streetCred: 2, cash: 5000 }, result: 'You switch from crack to cocaine, heroin to designer drugs. Same game, upscale clientele.' },
      { label: 'Launder through upscale fronts', effects: { cash: -10000, publicImage: 3 }, result: 'You open a yoga studio and a juice bar. Perfect fronts for the new neighborhood.' },
      { label: 'Resist the change', effects: { communityRep: 5, cash: -5000 }, result: 'You fund anti-gentrification efforts. The community rallies. Change slows but can\'t be stopped.' }
    ]
  },
  {
    id: 'faction_mole', name: 'Mole Intel', emoji: '📡', category: 'faction', cooldown: 45,
    condition: { minDay: 25 },
    description: 'Your spy sends alarming intel: the rival is planning a massive attack on your main stash house in 48 hours.',
    outcomes: [
      { label: 'Evacuate the stash', effects: { cash: -3000 }, result: 'You move everything. They hit an empty building. Your product and cash are safe.' },
      { label: 'Set a trap (ambush)', effects: { fear: 8, streetCred: 5, heat: 15 }, result: 'They walk into a killing field. Devastating losses for the attackers. Your reputation is legendary.' },
      { label: 'Preemptive strike', effects: { heat: 20, fear: 5, cash: 10000 }, result: 'You hit them first. Their attack force was assembling — you catch them unaware. Decisive victory.' },
      { label: 'Double-check the intel', effects: { stress: 3 }, result: 'You verify. 20% chance the intel was planted to make you panic. Worth confirming before acting.' }
    ]
  },
  {
    id: 'peace_summit', name: 'Peace Summit', emoji: '🏛️', category: 'faction', cooldown: 90,
    condition: { minAct: 2 },
    description: 'All major factions invited to a city-wide summit to divide territory and reduce violence. Historic moment.',
    outcomes: [
      { label: 'Attend and negotiate', effects: { trust: 5, streetCred: 3, publicImage: 2 }, result: 'Diplomatic triumph. You secure favorable terms. The city enters a period of relative calm.' },
      { label: 'Attend but sabotage', effects: { fear: 5, trust: -5, heat: 10 }, result: 'You ensure no peace is reached. Chaos benefits the strongest. Everyone suspects but can\'t prove it.' },
      { label: 'Send a representative', effects: { trust: 2 }, result: 'Your second handles it. You maintain safety while having a voice at the table.' },
      { label: 'Refuse to attend', effects: { fear: 3, trust: -3 }, result: 'Your absence is a statement: you don\'t negotiate. Some see strength. Others see arrogance.' }
    ]
  },
  {
    id: 'foreign_cartel', name: 'Foreign Cartel Arrives', emoji: '🌎', category: 'faction', cooldown: 90,
    condition: { minAct: 3 },
    description: 'An international cartel is moving into Miami. Bigger, richer, more violent than any local operation. Every crew is threatened.',
    outcomes: [
      { label: 'Ally with them (become distributor)', effects: { cash: 10000, streetCred: -2 }, result: 'You become their local arm. Steady income, massive backing. But you answer to someone now.' },
      { label: 'Unite local factions against them', effects: { trust: 8, streetCred: 5, heat: 10 }, result: 'You rally Miami. For the first time, every faction works together. The cartel is pushed back.' },
      { label: 'Pay tribute for independence', effects: { cash: -20000 }, result: 'You pay them $20K/month to operate independently. Expensive freedom.' },
      { label: 'Infiltrate from within', effects: { streetCred: 3, stress: 5 }, result: 'You plant agents inside their operation. Long game. If it works, you\'ll own them from the inside.' }
    ]
  },
  {
    id: 'hostile_graffiti', name: 'War Declaration', emoji: '🎨', category: 'faction', cooldown: 30,
    condition: { minDay: 10 },
    description: 'Aggressive gang tags appear overnight on your most visible properties. A direct challenge to your authority.',
    outcomes: [
      { label: 'Investigate first', effects: { streetCred: 1 }, result: '40% rival testing, 30% random vandals, 20% war declaration, 10% false flag. Information before action.' },
      { label: 'Retaliate immediately', effects: { fear: 4, heat: 10, streetCred: 2 }, result: 'You tag their territory with your symbols and torch one of their cars. Message received and returned.' },
      { label: 'Commission massive murals ($3K)', effects: { cash: -3000, communityRep: 5, streetCred: 3 }, result: 'You hire the best street artists. Your territory becomes a gallery. Cultural dominance.' },
      { label: 'Clean up quietly', effects: { streetCred: 1 }, result: 'You remove the tags without fanfare. No escalation. Mature response. Some see it as weak.' }
    ]
  },
  {
    id: 'faction_tech', name: 'Rival Innovation', emoji: '🔬', category: 'faction', cooldown: 45,
    condition: { minDay: 30 },
    description: 'A rival faction developed something new: better processing, innovative smuggling route, or cutting-edge distribution tech.',
    outcomes: [
      { label: 'Steal it (espionage)', effects: { cash: -3000, streetCred: 3 }, result: 'Your spy extracts the details. You implement their innovation without the R&D cost.' },
      { label: 'Buy licensing rights ($15K)', effects: { cash: -15000, trust: 2 }, result: 'Legitimate business deal. You pay for access. Professional respect earned.' },
      { label: 'Develop your own (better)', effects: { cash: -10000, streetCred: 2 }, result: 'Your version is an improvement. It takes longer but you own it completely.' },
      { label: 'Sabotage theirs', effects: { heat: 10, fear: 3, streetCred: 1 }, result: 'If you can\'t have it, no one can. Their facility has an unfortunate "accident."' }
    ]
  },

  // ============================================================
  // WILD CARD ENCOUNTERS (30)
  // ============================================================
  {
    id: 'sinkhole', name: 'Sinkhole Disaster', emoji: '🕳️', category: 'wildcard', cooldown: 90,
    condition: {},
    description: 'A massive sinkhole opens up and swallows part of a building. If it\'s near your stash house... uh oh.',
    outcomes: [
      { label: 'Check your properties', effects: { cash: -5000, stress: 5 }, result: 'One of your stash spots took damage. $5K in product lost to the earth. Insurance? What insurance?' },
      { label: 'Help with rescue efforts', effects: { communityRep: 8, publicImage: 5 }, result: 'You organize your crew for rescue. Heroes of the neighborhood. PR gold.' },
      { label: 'Loot evacuated buildings', effects: { cash: 3000, heat: 5, publicImage: -5 }, result: 'While everyone runs out, you run in. Quick grab of valuables. Dark but profitable.' },
      { label: 'Use the chaos as cover', effects: { cash: 2000 }, result: 'Emergency services are overwhelmed. Perfect window for a major deal with zero surveillance.' }
    ]
  },
  {
    id: 'celebrity_endorsement', name: 'Celebrity Shoutout', emoji: '🎤', category: 'wildcard', cooldown: 60,
    condition: { minDay: 20, minAct: 2 },
    description: 'A famous rapper name-drops your product in a hit song. Demand spikes overnight. Your phone won\'t stop ringing.',
    outcomes: [
      { label: 'Capitalize fully', effects: { cash: 10000, heat: 10, streetCred: 5 }, result: 'Demand up 30% for a week. You sell everything at premium. Legendary status but police take notice.' },
      { label: 'Raise prices', effects: { cash: 8000, trust: -2 }, result: 'Supply and demand. Your regulars grumble but new customers pay whatever you ask.' },
      { label: 'Lay low despite demand', effects: { streetCred: 2 }, result: 'You resist the temptation. Extra demand means extra attention. Smart restraint.' },
      { label: 'Contact the rapper directly', effects: { cash: -5000, streetCred: 5, publicImage: 3 }, result: 'You connect with them. Mutual promotion. The beginning of a very profitable friendship.' }
    ]
  },
  {
    id: 'time_capsule', name: 'Time Capsule', emoji: '📜', category: 'wildcard', cooldown: 90,
    condition: { minDay: 25 },
    description: 'During renovation, workers find a sealed box from the 1980s. Inside: vintage drugs, old cash, and a coded diary from a cocaine cowboy.',
    outcomes: [
      { label: 'Decode the diary', effects: { cash: 5000, streetCred: 2 }, result: 'The codes reveal locations of hidden stashes across Miami. A treasure map from the past.' },
      { label: 'Sell the vintage product', effects: { cash: 8000 }, result: 'Collectors and nostalgic users pay premium for 80s product. Niche market, big money.' },
      { label: 'Keep it as a trophy', effects: { streetCred: 3 }, result: 'The diary sits in your office. A reminder that empires rise and fall. History rhymes.' },
      { label: 'Turn it over to a museum ($2K finder fee)', effects: { cash: 2000, publicImage: 5 }, result: 'The museum is thrilled. Local hero discovers historical artifact. Great press coverage.' }
    ]
  },
  {
    id: 'alien_claim', name: 'Alien Abduction Story', emoji: '👽', category: 'wildcard', cooldown: 60,
    condition: { minCrew: 1 },
    description: 'A crew member shows up after being missing for 3 days claiming aliens abducted them. They seem dead serious.',
    outcomes: [
      { label: 'Believe them (humor)', effects: { stress: -3, trust: 2 }, result: 'You play along. The crew has a great laugh. Morale boost from the absurdity of it all.' },
      { label: 'Demand the real story', effects: { trust: -1 }, result: 'They were on a bender. Lost 3 days to partying. The alien story was to save face.' },
      { label: 'Drug test them', effects: { trust: -2 }, result: 'Test reveals they sampled too much of your product. Addiction intervention needed.' },
      { label: 'Let it go', effects: { trust: 1 }, result: 'Everyone needs their stories. You don\'t push. They\'re back and that\'s what matters.' }
    ]
  },
  {
    id: 'documentary_crew', name: 'Documentary Crew', emoji: '🎥', category: 'wildcard', cooldown: 50,
    condition: { minDay: 20 },
    description: 'A documentary film crew wants to film "street life" in your territory. Cameras everywhere.',
    outcomes: [
      { label: 'Allow with conditions', effects: { publicImage: 5, cash: 2000 }, result: 'You control the narrative. They film what you allow. Great PR, no incriminating footage.' },
      { label: 'Refuse access', effects: { fear: 1 }, result: 'They film from outside the territory. Less control but less risk.' },
      { label: 'Use as propaganda', effects: { publicImage: 8, streetCred: 3 }, result: 'You stage interviews showing community investment. The documentary paints you as Robin Hood.' },
      { label: 'Sabotage the production', effects: { fear: 2, publicImage: -2 }, result: 'Cameras "break." Footage "disappears." The crew gives up. No documentary, no evidence.' }
    ]
  },
  {
    id: 'viral_video', name: 'Viral Video', emoji: '📱', category: 'wildcard', cooldown: 30,
    condition: {},
    description: 'A fight in your territory goes viral on social media. Millions of views. Your operation is in the background.',
    outcomes: [
      { label: 'Spin it positive', effects: { publicImage: 3, streetCred: 2 }, result: 'You pay commenters to frame it as your crew defending the neighborhood. PR crisis averted.' },
      { label: 'Get the video taken down', effects: { cash: -2000 }, result: 'Your tech contact files copyright claims. Most copies disappear within 48 hours.' },
      { label: 'Ignore it', effects: { heat: 5 }, result: 'It dies down after a week. But police watched it carefully and mapped your territory.' },
      { label: 'Embrace the attention', effects: { streetCred: 5, heat: 8 }, result: 'You lean in. Comment sections become recruitment tools. Famous but exposed.' }
    ]
  },
  {
    id: 'escaped_animal', name: 'Escaped Zoo Animal', emoji: '🐊', category: 'wildcard', cooldown: 60,
    condition: {},
    description: 'An alligator from a nearby farm is loose in your district. Chaos in the streets. Animal control is overwhelmed.',
    outcomes: [
      { label: 'Catch it yourself (hero status)', effects: { communityRep: 10, publicImage: 5, health: -5 }, result: 'You wrangle the gator bare-handed. It\'s on every local news channel. Neighborhood legend.' },
      { label: 'Call animal control', effects: { publicImage: 1 }, result: 'Boring but responsible. They handle it. You organize the block party after.' },
      { label: 'Sell it to an exotic buyer ($3K)', effects: { cash: 3000, streetCred: 1 }, result: 'You capture it and flip it to a collector. $3K for a few minutes of danger.' },
      { label: 'Use it to scare a rival', effects: { fear: 5, streetCred: 3 }, result: 'You have it delivered to a rival\'s front door. The message is... primal.' }
    ]
  },
  {
    id: 'bitcoin_windfall', name: 'Crypto Windfall', emoji: '₿', category: 'wildcard', cooldown: 90,
    condition: { minDay: 20 },
    description: 'You remember an old crypto wallet you set up years ago. You find the hardware in a drawer. It might have value.',
    outcomes: [
      { label: 'Access the wallet', effects: { cash: (function() { return [5000, 15000, 50000, 100000][Math.floor(Math.random() * 4)]; })() }, result: 'The old password works! The balance has appreciated significantly. Unexpected windfall.' },
      { label: 'Hire a crypto expert ($1K)', effects: { cash: -1000 }, result: 'They recover the wallet safely and help you cash out anonymously. Professional service.' },
      { label: 'Forget the password', effects: { stress: 5 }, result: 'You try every password you can think of. Nothing works. The money sits there, mocking you.' },
      { label: 'Sell the hardware ($500)', effects: { cash: 500 }, result: 'You sell the wallet to someone else. They either crack it or don\'t. Quick $500.' }
    ]
  },
  {
    id: 'message_bottle', name: 'Message in a Bottle', emoji: '🍾', category: 'wildcard', cooldown: 60,
    condition: {},
    description: 'Found during a boat trip: a sealed bottle with coordinates written on a waterlogged note. Drug drop that never got picked up?',
    outcomes: [
      { label: 'Follow the coordinates', effects: { cash: 10000, heat: 5, stress: 3 }, result: 'An old drug stash buried on a beach. $10K in waterproof packaging. Finder\'s keepers.' },
      { label: 'Send someone else', effects: { cash: 5000, trust: 1 }, result: 'Your crew member finds half the stash. They definitely kept some. But $5K for no risk.' },
      { label: 'Ignore it — could be a trap', effects: {}, result: 'Paranoia wins. Could have been real, could have been bait. You\'ll never know.' },
      { label: 'Sell the coordinates ($2K)', effects: { cash: 2000 }, result: 'You sell the intel. Let someone else take the risk. Easy profit.' }
    ]
  },
  {
    id: 'doppelganger', name: 'Doppelganger', emoji: '👥', category: 'wildcard', cooldown: 90,
    condition: { minDay: 30 },
    description: 'Someone who looks exactly like you is committing crimes across Miami. Police are confused. So are you.',
    outcomes: [
      { label: 'Use it as an alibi', effects: { heat: -10, streetCred: 2 }, result: '"Couldn\'t have been me, officer. I was at church." Perfect deniability while your twin runs wild.' },
      { label: 'Find and confront the double', effects: { streetCred: 3, stress: 3 }, result: 'You track them down. It\'s uncanny. They agree to disappear for $5K. Identity secured.' },
      { label: 'Hire them as a decoy', effects: { cash: -2000, streetCred: 5 }, result: 'Why fight it? You now have a body double for dangerous meetings. Presidential-level security.' },
      { label: 'Frame them for your crimes', effects: { heat: -20, trust: -3 }, result: 'You tip off the police about your lookalike. They arrest them for YOUR crimes. Diabolical.' }
    ]
  },
  {
    id: 'ghost_story', name: 'Haunted Safehouse', emoji: '👻', category: 'wildcard', cooldown: 45,
    condition: { minCrew: 1 },
    description: 'Your crew swears the safehouse is haunted. Strange noises at night. Doors slamming. One guy quit over it.',
    outcomes: [
      { label: 'Investigate', effects: { stress: 2 }, result: 'Old pipes and a raccoon in the walls. Mystery solved. The crew feels silly but relieved.' },
      { label: 'Check for rival bugs', effects: { streetCred: 2 }, result: 'The "ghost" was a rival\'s surveillance tech making noise. You find and destroy their equipment.' },
      { label: 'Play along (haunted theme)', effects: { trust: 2, stress: -1 }, result: 'You lean into the legend. "The ghost protects us." Crew morale turns superstition into confidence.' },
      { label: 'Move to a new safehouse ($5K)', effects: { cash: -5000, trust: 1 }, result: 'Not worth the bad vibes. New place, fresh start. Sometimes the pragmatic move is the right one.' }
    ]
  },
  {
    id: 'art_heist', name: 'Art Heist Opportunity', emoji: '🖼️', category: 'wildcard', cooldown: 90,
    condition: { minAct: 2, minCrew: 2 },
    description: 'A gallery in Wynwood has a painting worth $2M with laughably weak security. Your fence contact can move it.',
    outcomes: [
      { label: 'Plan and execute the heist', effects: { cash: 200000, heat: 20, streetCred: 5 }, result: 'Clean execution. The painting disappears overnight. Your fence takes 90% but you keep $200K.' },
      { label: 'Scout but don\'t commit', effects: {}, result: 'You case the joint but decide the risk isn\'t worth it. The painting hangs there, taunting you.' },
      { label: 'Tip off another crew (for a cut)', effects: { cash: 50000, trust: -1 }, result: 'You sell the plan for $50K. They take the heat, you take the profit.' },
      { label: 'Blackmail the gallery', effects: { cash: 20000, fear: 2 }, result: '"Nice security. Be a shame if something happened." $20K protection money. Recurring revenue.' }
    ]
  },
  {
    id: 'drone_delivery', name: 'Mystery Drone', emoji: '🛸', category: 'wildcard', cooldown: 30,
    condition: {},
    description: 'A drone drops a package in your territory and flies away. No sender, no markings. What\'s inside?',
    outcomes: [
      { label: 'Open it carefully', effects: { cash: 2000 }, result: 'Free product. Someone\'s delivery went to the wrong address. Your gain.' },
      { label: 'Check for surveillance gear', effects: { streetCred: 1 }, result: 'Good instinct. It\'s a tracking device disguised as a package. You destroy it and relocate.' },
      { label: 'Leave it alone', effects: {}, result: 'Smart. You don\'t touch unknown packages. It sits there until someone else grabs it.' },
      { label: 'Trace the drone', effects: { streetCred: 2 }, result: 'You follow the signal. It leads to a rival\'s tech operation. Valuable intelligence about their capabilities.' }
    ]
  },
  {
    id: 'underground_bunker', name: 'Underground Bunker', emoji: '🏚️', category: 'wildcard', cooldown: 90,
    condition: { minDay: 25 },
    description: 'Workers discover a Cold War-era bunker beneath a property you own. Sealed since the 1960s. Massive underground space.',
    outcomes: [
      { label: 'Convert to ultimate safehouse ($100K)', effects: { cash: -100000, streetCred: 5 }, result: 'Fortified, hidden, off-grid. The ultimate safehouse. Nobody is getting to you down here.' },
      { label: 'Convert to massive stash ($50K)', effects: { cash: -50000, streetCred: 3 }, result: 'Temperature-controlled, secure, invisible. You can store millions in product underground.' },
      { label: 'Convert to lab ($75K)', effects: { cash: -75000, streetCred: 4 }, result: 'Underground processing lab. Zero noise, zero smell, zero visibility. Perfect production.' },
      { label: 'Sell the discovery ($30K)', effects: { cash: 30000 }, result: 'You sell the bunker rights to a prepper for $30K. Quick cash, no construction hassle.' }
    ]
  },
  {
    id: 'flash_mob', name: 'Flash Mob', emoji: '💃', category: 'wildcard', cooldown: 30,
    condition: {},
    description: 'A massive flash mob appears in your territory. Hundreds of people dancing. Is it cover for something?',
    outcomes: [
      { label: 'Enjoy the show', effects: { stress: -2, publicImage: 1 }, result: 'Just a flash mob. Your crew joins in. A moment of pure joy in an otherwise dark life.' },
      { label: 'Use as cover for a deal', effects: { cash: 3000 }, result: 'Perfect distraction. You close a deal in the chaos. Nobody sees a thing.' },
      { label: 'Check for rival activity', effects: { streetCred: 1 }, result: 'You scan the crowd. Sure enough, a rival crew is using the mob to move product. You intercept.' },
      { label: 'Fund a bigger one ($2K)', effects: { cash: -2000, communityRep: 5, publicImage: 3 }, result: 'You sponsor a monthly flash mob. Community event + perfect recurring cover for operations.' }
    ]
  },
  {
    id: 'medical_emergency', name: 'Medical Emergency', emoji: '🚑', category: 'wildcard', cooldown: 40,
    condition: {},
    description: 'You or a crew member collapses. Heart pounding, vision blurring. This is real. Hospital or street doctor?',
    outcomes: [
      { label: 'Hospital (safe but exposed)', effects: { health: 30, heat: 5, cash: -3000 }, result: 'Full medical treatment. You survive. But your name is in the system now.' },
      { label: 'Street doctor (risky but private)', effects: { health: 15, cash: -1000 }, result: 'Back-alley medicine. They patch you up. No records. But the treatment is... rough.' },
      { label: 'Dr. Rosa (if available)', effects: { health: 25 }, result: 'Rosa works her magic. Professional care, no records, no questions. Thank God for her.' },
      { label: 'Tough it out', effects: { health: -10, stress: 5 }, result: 'You refuse help. Whatever it was passes, but you\'re weaker for it. Stubbornness has a cost.' }
    ]
  },
  {
    id: 'inheritance_claim', name: 'Surprise Inheritance', emoji: '📜', category: 'wildcard', cooldown: 90,
    condition: { minDay: 30 },
    description: 'A lawyer contacts you: a distant relative died and left you legitimate property and $30K in clean money.',
    outcomes: [
      { label: 'Accept the inheritance', effects: { cash: 30000, publicImage: 2 }, result: 'Clean money! Legitimate property! Your accountant nearly cries with joy.' },
      { label: 'Use it to expand fronts', effects: { cash: 30000, streetCred: 1 }, result: 'The property becomes a new front business. Legitimate origin, criminal application.' },
      { label: 'Contest reveals your identity', effects: { cash: 30000, heat: 5 }, result: 'Relatives contest the will. Court proceedings put your name in public records. Worth it?' },
      { label: 'Decline (stay hidden)', effects: {}, result: 'The money is clean but the paper trail isn\'t worth it. You let it go to other relatives.' }
    ]
  },
  {
    id: 'marathon_parade', name: 'Marathon Chaos', emoji: '🏃', category: 'wildcard', cooldown: 35,
    condition: {},
    description: 'A major marathon/parade shuts down streets across your district. Traffic is impossible but crowd cover is excellent.',
    outcomes: [
      { label: 'Use crowd cover for deals', effects: { cash: 3000 }, result: 'Hand-to-hand deals in a crowd of thousands. Invisible. Best sales day in months.' },
      { label: 'Reroute deliveries', effects: { cash: -500, stress: 2 }, result: 'Your supply chain is disrupted. Detours cost time and money but you adapt.' },
      { label: 'Work the crowd', effects: { cash: 5000, heat: 3 }, result: 'Tourists, partiers, athletes. Everyone wants something. You provide. Massive single-day revenue.' },
      { label: 'Take the day off', effects: { stress: -3 }, result: 'You watch the runners from a cafe. Sometimes the best business decision is to rest.' }
    ]
  },
  {
    id: 'prison_break', name: 'Prison Break', emoji: '🔓', category: 'wildcard', cooldown: 60,
    condition: { minDay: 25 },
    description: 'Someone escaped from county lockup. They show up at your door, sweating and desperate. They know your name.',
    outcomes: [
      { label: 'Harbor them', effects: { heat: 15, trust: 5 }, result: 'You hide them. Major heat if discovered but their loyalty is unconditional now.' },
      { label: 'Turn them away', effects: { trust: -3 }, result: 'You slam the door. They\'re caught within hours. From prison, they might start talking about you.' },
      { label: 'Help them flee the state ($5K)', effects: { cash: -5000, trust: 5 }, result: 'You fund their escape. New ID, bus ticket, cash. They vanish and owe you their freedom.' },
      { label: 'Negotiate their value', effects: {}, result: 'They have inside intel from prison. Crew rosters, hit lists, police informant identities. Valuable.' }
    ]
  },
  {
    id: 'social_influencer', name: 'Social Media Problem', emoji: '📸', category: 'wildcard', cooldown: 35,
    condition: { hasBusiness: true },
    description: 'An influencer with 500K followers starts posting from your front business. Great for visibility. Terrible for secrecy.',
    outcomes: [
      { label: 'Offer them free meals (advertising)', effects: { cash: -200, publicImage: 5 }, result: 'They become a regular promoter. Your front business gets a 40% revenue boost. Perfect cover.' },
      { label: 'Discourage them', effects: { fear: 1 }, result: 'A quiet word and they stop posting. But they post about the "weird vibe" instead.' },
      { label: 'Embrace it', effects: { publicImage: 3, heat: 3 }, result: 'Viral attention. Your front booms. But so does police awareness of the location.' },
      { label: 'Pay them to promote competitors instead ($1K)', effects: { cash: -1000 }, result: 'Redirect their influence to rival territory. Now THEIR fronts get unwanted attention.' }
    ]
  },
  {
    id: 'meteorite', name: 'Meteorite Impact', emoji: '☄️', category: 'wildcard', cooldown: 90,
    condition: {},
    description: 'A meteorite fragment lands near Miami. Scientists and gawkers swarm the area. Your territory is either blocked or booming.',
    outcomes: [
      { label: 'Collect fragments ($15K)', effects: { cash: 15000, stress: 1 }, result: 'You beat the scientists to the good pieces. Meteorite fragments sell for thousands to collectors.' },
      { label: 'Sell food/merch to tourists', effects: { cash: 5000, publicImage: 2 }, result: 'You set up stands near the impact site. T-shirts, snacks, "authentic meteorite dust." Capitalism.' },
      { label: 'Use the crowd for deals', effects: { cash: 3000 }, result: 'Thousands of out-of-towners in your area. Perfect cover for a busy sales day.' },
      { label: 'Stay away from the chaos', effects: {}, result: 'You let the circus play out. In a week everyone forgets and life returns to normal.' }
    ]
  },
  {
    id: 'game_show', name: 'Game Show Selection', emoji: '🎰', category: 'wildcard', cooldown: 60,
    condition: {},
    description: 'You\'re randomly selected to appear on a local TV game show. Cash prizes but your face on television.',
    outcomes: [
      { label: 'Appear (risk the exposure)', effects: { cash: 5000, publicImage: 3, heat: 5 }, result: 'You win $5K and charm the audience. But police now have HD footage of your face.' },
      { label: 'Send a crew member', effects: { cash: 2000, trust: 2 }, result: 'Your most charismatic crew member goes instead. They win $2K and have a blast.' },
      { label: 'Decline', effects: {}, result: 'You pass. The spotlight is the last thing you need. Smart but boring.' },
      { label: 'Rig the game ($3K bribe)', effects: { cash: 7000, streetCred: 1 }, result: 'You bribe a producer. Guaranteed win. $10K prize minus the $3K bribe. Classic.' }
    ]
  },
  {
    id: 'ufo_sighting', name: 'UFO Sighting', emoji: '🛸', category: 'wildcard', cooldown: 60,
    condition: {},
    description: 'Everyone in your district is staring at the sky. Strange lights. News helicopters circling. Total distraction.',
    outcomes: [
      { label: 'Use the distraction', effects: { cash: 5000 }, result: 'While everyone watches the sky, your crew moves product unobserved. Best cover story ever — aliens.' },
      { label: 'Watch with the crowd', effects: { stress: -3 }, result: 'You look up too. Whatever it is, it\'s beautiful. A moment of wonder in a brutal world.' },
      { label: 'Sell "alien merch"', effects: { cash: 2000, publicImage: 1 }, result: 'You print UFO t-shirts overnight. Sold out by morning. Hustle never sleeps.' },
      { label: 'Check your crop/lab', effects: { stress: 2 }, result: 'You rush to make sure it\'s not a DEA helicopter with fancy lights. It\'s not. Paranoia is exhausting.' }
    ]
  },
  {
    id: 'buried_treasure', name: 'Treasure Map', emoji: '🗺️', category: 'wildcard', cooldown: 90,
    condition: { minDay: 30, minAct: 2 },
    description: 'A dying old-timer whispers of $5M buried in the Everglades by 1980s cocaine cowboys. He has part of a map.',
    outcomes: [
      { label: 'Buy the map ($10K)', effects: { cash: -10000, streetCred: 2 }, result: 'Partial coordinates. You\'ll need more pieces. But the hunt has begun.' },
      { label: 'Dig with what you have', effects: { cash: 20000, stress: 3 }, result: 'You search the general area. Find a buried cache — not $5M but $20K. Not bad.' },
      { label: 'Sell the intel ($5K)', effects: { cash: 5000 }, result: 'You flip the story. Someone else can dig in the swamps. Quick profit, zero mosquito bites.' },
      { label: 'Dismiss as fantasy', effects: {}, result: 'Old men tell old stories. You have real money to chase, not fairy tales.' }
    ]
  },
  {
    id: 'rivals_pet', name: 'Rival\'s Dog', emoji: '🐕', category: 'wildcard', cooldown: 50,
    condition: { minDay: 15 },
    description: 'You find/capture a rival boss\'s beloved dog. A prized pit bull with a diamond collar. They\'re frantically searching.',
    outcomes: [
      { label: 'Return for goodwill', effects: { trust: 5, streetCred: 2 }, result: 'The rival is shocked by your decency. A truce forms around mutual respect. Who knew dogs could broker peace?' },
      { label: 'Ransom for $10K', effects: { cash: 10000, fear: 2 }, result: 'They pay without hesitation. $10K for a dog. The power of emotional leverage.' },
      { label: 'Keep it (psychological warfare)', effects: { fear: 5, trust: -3 }, result: 'You post photos of yourself with their dog. They\'re furious. Brilliant psychological torment.' },
      { label: 'Adopt it genuinely', effects: { stress: -3, trust: -2 }, result: 'You actually bond with the dog. It\'s a really good dog. Your rival plots revenge but you don\'t care.' }
    ]
  },
  {
    id: 'radio_contest', name: 'Radio Contest', emoji: '📻', category: 'wildcard', cooldown: 30,
    condition: {},
    description: 'You\'re caller number 10 on a local radio station. You\'ve won a prize package!',
    outcomes: [
      { label: 'Claim the prize', effects: { cash: 1000, publicImage: 1 }, result: 'Concert tickets, restaurant vouchers, $1K cash. Not bad for pressing redial.' },
      { label: 'Give it to a crew member', effects: { trust: 3 }, result: 'You hand the prize to someone who deserves a break. Small gesture, big loyalty.' },
      { label: 'Donate to charity', effects: { publicImage: 3, communityRep: 2 }, result: 'You donate the winnings live on air. The DJ talks about the "generous anonymous caller." PR gold.' },
      { label: 'Decline (stay anonymous)', effects: {}, result: 'Prizes mean paperwork. Paperwork means identity. You hang up.' }
    ]
  },
  {
    id: 'recall_election', name: 'Political Upheaval', emoji: '🗳️', category: 'wildcard', cooldown: 60,
    condition: { minDay: 30 },
    description: 'The mayor is being recalled. Political chaos. Your connections and investments may be at risk.',
    outcomes: [
      { label: 'Fund your candidate ($20K)', effects: { cash: -20000, streetCred: 3 }, result: 'Your candidate wins. A friendly mayor who owes you. The most valuable investment you\'ve ever made.' },
      { label: 'Play both sides', effects: { cash: -10000, trust: -1 }, result: 'You fund both candidates. Whoever wins, you have a seat at the table.' },
      { label: 'Stay neutral', effects: {}, result: 'Politics is messy. You let it play out and adapt to whoever wins.' },
      { label: 'Use the chaos', effects: { cash: 5000, heat: -5 }, result: 'While city hall fights itself, enforcement relaxes. Perfect window for expanded operations.' }
    ]
  },
  {
    id: 'historical_discovery', name: 'Historical Artifacts', emoji: '🏺', category: 'wildcard', cooldown: 60,
    condition: {},
    description: 'Construction at your property uncovers historical artifacts. The site could become protected — freezing your development.',
    outcomes: [
      { label: 'Pocket the artifacts ($30K)', effects: { cash: 30000, heat: 3 }, result: 'You sell to private collectors. $30K for pottery and bones. Archaeology meets hustle.' },
      { label: 'Report it properly', effects: { publicImage: 5, communityRep: 3 }, result: 'The site becomes a landmark. Your name is on the plaque. Historical preservation meets PR.' },
      { label: 'Bury them deeper', effects: { cash: -1000 }, result: 'What artifacts? You pour concrete over history. Development continues unimpeded.' },
      { label: 'Negotiate with the city', effects: { cash: 10000, publicImage: 2 }, result: 'You get a tax break and historical preservation grant. Profit from doing the right thing.' }
    ]
  },
  {
    id: 'charity_event_wild', name: 'Beach Cleanup', emoji: '🏖️', category: 'wildcard', cooldown: 25,
    condition: {},
    description: 'Community beach cleanup event this weekend. Simple question: do you show up?',
    outcomes: [
      { label: 'Attend', effects: { publicImage: 3, communityRep: 2, stress: -1 }, result: 'You pick up trash alongside families. Fresh air, honest work. Feels good. People notice.' },
      { label: 'Sponsor ($5K)', effects: { cash: -5000, publicImage: 8, communityRep: 5 }, result: 'Branded t-shirts, catered lunch, media coverage. Your name associated with community service.' },
      { label: 'Ignore', effects: {}, result: 'Not your thing. The beach gets cleaned without you.' },
      { label: 'Use as cover for waterfront deal', effects: { cash: 3000, heat: -2 }, result: 'You "volunteer" near the marina. A quick exchange under cover of civic duty.' }
    ]
  },

  // === BONUS ENCOUNTERS ===
  {
    id: 'lost_delivery', name: 'Lost Delivery Driver', emoji: '📦', category: 'street', cooldown: 20,
    condition: {},
    description: 'A delivery driver asks you for directions. The package in his truck looks suspicious.',
    outcomes: [
      { label: 'Help with directions', effects: { publicImage: 1 }, result: 'He thanks you and drives off. Simple kindness. He\'ll remember your face.' },
      { label: 'Peek at the package', effects: { cash: 500 }, result: 'While helping, you notice the label. Pharmaceuticals. You pocket a few bottles.' },
      { label: 'Steal the whole truck', effects: { cash: 5000, heat: 15 }, result: 'You hijack the truck. $5K in goods. But GPS tracking means you have minutes.' },
      { label: 'Send him to a rival\'s territory', effects: { streetCred: 1 }, result: 'Wrong directions lead him straight into rival turf. Whatever happens, it\'s their problem.' }
    ]
  },
  {
    id: 'crypto_opp', name: 'Crypto Opportunity', emoji: '💻', category: 'business', cooldown: 40,
    condition: { minDay: 15, minCash: 50000 },
    description: 'A dark web contact offers: convert drug proceeds into cryptocurrency at 85 cents on the dollar. Untraceable.',
    outcomes: [
      { label: 'Convert $50K', effects: { cash: -50000, streetCred: 2 }, result: '$42.5K in clean crypto. Untraceable. Modern laundering at its finest.' },
      { label: 'Convert $100K', effects: { cash: -100000, streetCred: 3 }, result: '$85K in crypto. Major conversion. Your offshore wealth grows significantly.' },
      { label: 'Decline — could be a scam', effects: {}, result: 'Crypto is volatile and exit scams are real. You keep your cash physical.' },
      { label: 'Small test ($5K)', effects: { cash: -5000 }, result: 'You test with $5K. It converts perfectly. Now you know the service is legit for bigger moves.' }
    ]
  },
  {
    id: 'witness_protection', name: 'Witness in Hiding', emoji: '🏠', category: 'law', cooldown: 50,
    condition: { minDay: 30 },
    description: 'You accidentally discover a witness protection safe house in your neighborhood. Someone very important is inside.',
    outcomes: [
      { label: 'Sell the info ($20K)', effects: { cash: 20000, trust: -3 }, result: 'Multiple factions would pay for this info. You auction it. $20K from the highest bidder.' },
      { label: 'Keep it as leverage', effects: { streetCred: 3 }, result: 'You sit on the information. Knowing where a protected witness is = ultimate bargaining chip.' },
      { label: 'Ignore it', effects: {}, result: 'You pretend you never saw it. Messing with witness protection brings federal hell.' },
      { label: 'Warn them they\'re exposed', effects: { trust: 5 }, result: 'You anonymously alert the marshals. They relocate. A favor owed from the US Marshals Service.' }
    ]
  },
  {
    id: 'crew_pet_project', name: 'Crew Side Project', emoji: '🎪', category: 'crew', cooldown: 35,
    condition: { minCrew: 1 },
    description: 'One of your crew members wants to start a community youth basketball league. They need $3K and your blessing.',
    outcomes: [
      { label: 'Fund it ($3K)', effects: { cash: -3000, communityRep: 8, publicImage: 3, trust: 3 }, result: 'The league launches. Kids off the streets. Community loves you. And you have a recruitment pipeline.' },
      { label: 'Fund it and coach ($5K)', effects: { cash: -5000, communityRep: 12, publicImage: 5, trust: 5, stress: -3 }, result: 'You show up to games. Coach from the sideline. The neighborhood sees a different side of you.' },
      { label: 'Deny the request', effects: { trust: -2 }, result: 'You shut it down. Not the crew\'s job to run basketball leagues.' },
      { label: 'Fund it as a front', effects: { cash: -3000, streetCred: 2 }, result: 'The league is real, but recruitment happens on the sidelines. Talent scouting, community intel.' }
    ]
  },

  // === INVENTORY-AWARE ENCOUNTERS ===
  {
    id: 'traffic_stop_v2', name: 'Pulled Over', emoji: '🚔', category: 'law', cooldown: 20,
    condition: { minDay: 5 },
    description: 'Red and blue lights in your mirror. A patrol car pulls you over. "License and registration."',
    dynamic: true,
    getOutcomes: function(state) {
      const inv = state.inventory || {};
      const drugIds = Object.keys(inv).filter(d => inv[d] > 0);
      const totalUnits = drugIds.reduce((s, d) => s + inv[d], 0);
      const isClean = totalUnits === 0;
      const drugList = drugIds.map(d => { const def = (typeof DRUGS !== 'undefined' ? DRUGS : []).find(x => x.id === d); return (def ? def.name : d) + ' x' + inv[d]; }).join(', ');

      if (isClean) {
        return [
          { label: 'Cooperate fully', effects: {}, result: 'You hand over your papers. Everything checks out — no drugs, no warrants. "Drive safe." You\'re clean and free.' },
          { label: 'Be polite but nervous', effects: { heat: 2 }, result: 'You fumble the registration but they find nothing. "Relax, you\'re free to go." Being clean just saved you.' },
          { label: 'Assert your rights', effects: { streetCred: 1 }, result: '"Am I being detained?" They run your plates and let you go. Empty pockets, full confidence.' }
        ];
      } else if (totalUnits > 50) {
        return [
          { label: 'Stay cool — consent to search', effects: { heat: 25, _sellDrug: drugIds[0], _sellQty: inv[drugIds[0]] }, result: 'CRITICAL MISTAKE. They find ' + drugList + '. Full arrest. Everything confiscated. "You have the right to remain silent." Carrying this much was insane.' },
          { label: 'Refuse search & lawyer up', effects: { cash: -5000, heat: 15 }, result: 'You invoke your rights. They call a K-9 unit — the dog hits. They confiscate everything and call your lawyer. $5K in legal fees, but the case might get thrown out.' },
          { label: 'Floor it — RUN!', effects: { heat: 20, health: -15, stress: 10 }, result: 'You gun it! A high-speed chase through Miami streets. You lose them after 10 blocks but crash into a dumpster. You ditch the car and run. Still have your product but you\'re hurt and VERY hot.' },
          { label: 'Bribe the officer ($' + Math.min(5000, Math.round(totalUnits * 50)).toLocaleString() + ')', effects: { cash: -Math.min(5000, totalUnits * 50), heat: 5 }, result: 'You flash cash. "How about we forget this happened?" Risky move... but it works. The cop takes the money and drives off. Corrupt cops are expensive but freedom isn\'t free.' }
        ];
      } else {
        const bribeCost = 500 + totalUnits * 30;
        return [
          { label: 'Hide it quick', effects: { heat: 5 }, result: 'You shove the ' + totalUnits + ' units under the seat while reaching for your license. Heart pounding. They don\'t search the car. Lucky.' },
          { label: 'Consent to search (risky)', effects: { heat: 12, _sellDrug: drugIds[0], _sellQty: Math.ceil(inv[drugIds[0]] * 0.5) }, result: 'They find some of your stash. Confiscated half your ' + (drugIds[0] ? ((typeof DRUGS !== 'undefined' ? DRUGS : []).find(x => x.id === drugIds[0]) || {}).name || drugIds[0] : 'drugs') + '. "You\'re lucky I\'m not booking you today."' },
          { label: 'Bribe ($' + bribeCost.toLocaleString() + ')', effects: { cash: -bribeCost, heat: 3 }, result: 'Quick handoff with the license. The officer pockets it and wishes you a nice day. Small price to keep your product.' },
          { label: 'Refuse search & drive away', effects: { heat: 8, stress: 5 }, result: 'You assert your rights and they let you go — this time. They memorize your plates. Next time won\'t be a warning.' }
        ];
      }
    },
    outcomes: [
      { label: 'Cooperate', effects: { heat: 3 }, result: 'You hand over papers. They run your plates and let you go.' },
      { label: 'Assert rights', effects: { streetCred: 1 }, result: 'You invoke your rights. They let you go.' }
    ]
  },
  {
    id: 'nosy_neighbor', name: 'Nosy Neighbor', emoji: '🏠', category: 'law', cooldown: 30,
    condition: { minDay: 10 },
    description: 'Your neighbor has been watching your comings and goings. They noticed the "unusual traffic" at your place.',
    dynamic: true,
    getOutcomes: function(state) {
      const inv = state.inventory || {};
      const totalUnits = Object.values(inv).reduce((s, v) => s + v, 0);
      const hasSafehouse = state.safehouse && state.safehouse.current;
      const hasProperty = state.properties && Object.keys(state.properties).some(k => (state.properties[k] || []).length > 0);

      if (hasSafehouse || hasProperty) {
        return [
          { label: 'Move operations to safehouse', effects: { heat: -5 }, result: 'You shift business away from your home. The neighbor sees less traffic and calms down. Smart move using your safehouse.' },
          { label: 'Bribe them ($2,000)', effects: { cash: -2000, heat: -3 }, result: '"I really appreciate good neighbors." An envelope of cash buys their silence. For now.' },
          { label: 'Intimidate them', effects: { fear: 3, publicImage: -3, heat: -5 }, result: 'A crew member pays a visit. The neighbor suddenly develops amnesia about what they saw.' },
          { label: 'Ignore — they won\'t do anything', effects: { heat: 8 }, result: 'Wrong. They filed a tip with Crime Stoppers. Anonymous but damaging. Should have taken this seriously.' }
        ];
      } else {
        return [
          { label: 'Befriend them with gifts', effects: { cash: -500, publicImage: 2, heat: -3 }, result: 'You bring over a bottle of wine and introduce yourself properly. Charm offensive works. They decide you\'re just a hardworking young person.' },
          { label: 'Bribe them ($2,000)', effects: { cash: -2000, heat: -3 }, result: '"I really appreciate good neighbors." An envelope of cash buys their silence. For now.' },
          { label: 'Intimidate them', effects: { fear: 3, publicImage: -3, heat: -5 }, result: 'A crew member pays a visit. The neighbor suddenly develops amnesia about what they saw.' },
          { label: 'Ignore — they won\'t do anything', effects: { heat: 8 }, result: 'Wrong. They filed a tip with Crime Stoppers. The heat is real. You need a safehouse.' }
        ];
      }
    },
    outcomes: [
      { label: 'Handle it', effects: { heat: -3 }, result: 'You dealt with the neighbor situation.' },
      { label: 'Ignore', effects: { heat: 5 }, result: 'They tipped off the police.' }
    ]
  },
  {
    id: 'car_chase', name: 'High-Speed Chase', emoji: '🏎️', category: 'law', cooldown: 35,
    condition: { minHeat: 25, minDay: 15 },
    description: 'An unmarked car starts tailing you. When they flip on the sirens, you know it\'s go time.',
    dynamic: true,
    getOutcomes: function(state) {
      const hasVehicle = state.vehicles && state.vehicles.garage && state.vehicles.garage.length > 0;
      const inv = state.inventory || {};
      const totalUnits = Object.values(inv).reduce((s, v) => s + v, 0);

      return [
        { label: 'Pull over immediately', effects: totalUnits > 0 ? { heat: 15, _sellDrug: Object.keys(inv).find(d => inv[d] > 0), _sellQty: Math.ceil((inv[Object.keys(inv).find(d => inv[d] > 0)] || 0) * 0.7) } : { heat: 5 }, result: totalUnits > 0 ? 'They search everything. Found your product. Most of it confiscated. "You\'re coming downtown."' : 'Clean car, clean record. They run you through the system and let you go. Being clean saved you major trouble.' },
        { label: 'Try to outrun them', effects: { heat: 12, health: -10, stress: 8 }, result: hasVehicle ? 'Your upgraded ride has the horsepower! You weave through traffic and lose them after a wild 15-minute chase. Heart pounding but free.' : 'Your stock car can\'t outrun a police interceptor. They box you in after 3 blocks. Add evading to the charges. -10 HP from the crash.' },
        { label: 'Duck into an alley', effects: { heat: 8, stress: 5 }, result: 'You cut hard into a side street and kill the lights. They blow past. You sit in silence for 10 minutes before moving again.' },
        { label: 'Ditch the product and stop', effects: totalUnits > 0 ? { heat: 5, _sellDrug: Object.keys(inv).find(d => inv[d] > 0), _sellQty: inv[Object.keys(inv).find(d => inv[d] > 0)] || 0 } : { heat: 5 }, result: totalUnits > 0 ? 'You toss the bags out the window before pulling over. They search and find nothing. Product lost but freedom preserved. That stash is gone though — ' + totalUnits + ' units scattered on the highway.' : 'Nothing to ditch. You pull over clean. False alarm — they were after someone else.' }
      ];
    },
    outcomes: [
      { label: 'Pull over immediately', effects: { heat: 5 }, result: 'You pull over and cooperate. They run your plates and pat you down. Clean today — they let you go with a warning.' },
      { label: 'Try to outrun them', effects: { heat: 12, health: -10, stress: 8 }, result: 'You floor it and weave through traffic. A wild chase through the streets. You take a hard hit clipping a dumpster, but you lose them in the maze of side streets.' },
      { label: 'Duck into an alley', effects: { heat: 8, stress: 5 }, result: 'You cut hard into a side street and kill the lights. They blow past. You sit in silence for 10 minutes before moving again.' },
      { label: 'Ditch the product and stop', effects: { heat: 5 }, result: 'You toss whatever you are carrying out the window before pulling over. They search and find nothing. Product lost but freedom preserved.' }
    ]
  },
  {
    id: 'large_cash_deposit', name: 'Suspicious Cash', emoji: '🏦', category: 'law', cooldown: 40,
    condition: { minCash: 50000 },
    description: 'Your banker pulls you aside. "The IRS flagged transactions over $10K. You\'ve been depositing a lot of cash lately..."',
    dynamic: true,
    getOutcomes: function(state) {
      const cash = state.cash || 0;
      const hasFront = (state.frontBusinesses || []).length > 0;
      return [
        { label: hasFront ? 'Route through fronts' : 'Structure deposits under $10K', effects: hasFront ? { heat: -5 } : { heat: 3 }, result: hasFront ? 'You redirect deposits through your front businesses. Clean paper trail. Your fronts are doing their job — this is what money laundering looks like.' : 'You break deposits into $9,999 chunks. But "structuring" is itself a crime. Risky move.' },
        { label: 'Bribe the banker ($5K)', effects: { cash: -5000, heat: -3 }, result: 'Five grand and the banker forgets the conversation. "I never saw anything unusual." Expensive silence.' },
        { label: 'Move to offshore account', effects: { cash: -Math.round(cash * 0.05), heat: -8 }, result: 'You wire ' + Math.round(cash * 0.95).toLocaleString() + ' offshore. 5% fee but completely untraceable. The IRS can investigate an empty account.' },
        { label: 'Ignore the warning', effects: { heat: 10 }, result: 'Bad move. The bank files a Suspicious Activity Report. Federal investigation opened. +10 Heat and now you\'re on the radar.' }
      ];
    },
    outcomes: [
      { label: 'Handle it', effects: {}, result: 'You dealt with the banking situation.' },
      { label: 'Ignore', effects: { heat: 10 }, result: 'The bank reported you to the IRS.' }
    ]
  }
];

// Export count for stats
const ENCOUNTER_COUNT = RANDOM_ENCOUNTERS.length;
