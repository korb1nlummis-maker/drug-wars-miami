/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Crew Hierarchy & Betrayal
   5 crew ranks, promotion system, loyalty/betrayal mechanics
   ============================================================ */

const CREW_RANKS = [
  { rank: 0, name: 'Street Worker', emoji: '👤', color: '#888888', maxGlobal: 6, promotionCost: 0, payCutPct: 0, combatMult: 1.0 },
  { rank: 1, name: 'Soldier', emoji: '🔫', color: '#39ff14', maxGlobal: 4, promotionCost: 2000, payCutPct: 5, combatMult: 1.2, requires: { loyalty: 70, daysServed: 30 } },
  { rank: 2, name: 'Lieutenant', emoji: '⭐', color: '#00f0ff', maxGlobal: 2, promotionCost: 10000, payCutPct: 10, combatMult: 1.5, requires: { loyalty: 85, daysServed: 90 } },
  { rank: 3, name: 'Underboss', emoji: '🎩', color: '#bf5fff', maxGlobal: 1, promotionCost: 50000, payCutPct: 15, combatMult: 2.0, requires: { loyalty: 95, daysServed: 180 } },
  { rank: 4, name: 'Right-Hand', emoji: '👑', color: '#ffe600', maxGlobal: 1, promotionCost: 100000, payCutPct: 20, combatMult: 2.5, requires: { loyalty: 100, daysServed: 365 } },
];

const CREW_TRAITS = [
  { id: 'loyal', name: 'Loyal', emoji: '💎', desc: 'Less likely to betray', loyaltyMod: 10, betrayalMod: -15 },
  { id: 'greedy', name: 'Greedy', emoji: '💰', desc: 'Demands more pay, may skim', loyaltyMod: -5, betrayalMod: 10 },
  { id: 'violent', name: 'Violent', emoji: '🔪', desc: '+20% combat damage, may escalate', combatMod: 0.20, loyaltyMod: 0 },
  { id: 'cautious', name: 'Cautious', emoji: '🛡️', desc: 'Fewer losses in operations', loyaltyMod: 0, betrayalMod: -5 },
  { id: 'ambitious', name: 'Ambitious', emoji: '📈', desc: 'Wants promotion, dangerous if passed over', loyaltyMod: -3, betrayalMod: 5 },
  { id: 'streetwise', name: 'Streetwise', emoji: '🌆', desc: 'Better at avoiding encounters', loyaltyMod: 0, encounterMod: -0.05 },
  { id: 'connected', name: 'Connected', emoji: '📞', desc: 'Has useful contacts', loyaltyMod: 0, betrayalMod: 0 },
  { id: 'reckless', name: 'Reckless', emoji: '💥', desc: 'Unpredictable, may cause trouble', loyaltyMod: -5, betrayalMod: 8 },
  { id: 'disciplined', name: 'Disciplined', emoji: '🎯', desc: 'Reliable and consistent', loyaltyMod: 5, betrayalMod: -10 },
  { id: 'disloyal', name: 'Disloyal', emoji: '🐍', desc: 'Significantly higher betrayal risk', loyaltyMod: -15, betrayalMod: 25 },
  { id: 'skilled', name: 'Skilled', emoji: '⚡', desc: '+15% effectiveness in role', loyaltyMod: 0, betrayalMod: 0, effectivenessMod: 0.15 },
];

const BETRAYAL_TYPES = [
  { id: 'skim', name: 'Skimming Profits', emoji: '💸', desc: 'Stealing a percentage of daily income', severity: 1 },
  { id: 'steal_product', name: 'Stealing Product', emoji: '📦', desc: 'Taking product from stash or distribution', severity: 2 },
  { id: 'inform_police', name: 'Informing Police', emoji: '🚔', desc: 'Feeding info to law enforcement', severity: 3 },
  { id: 'inform_rival', name: 'Informing Rivals', emoji: '🗣️', desc: 'Selling intel to rival organizations', severity: 2 },
  { id: 'desert', name: 'Desertion', emoji: '🏃', desc: 'Abandoning their post and disappearing', severity: 1 },
  { id: 'coup_attempt', name: 'Coup Attempt', emoji: '⚔️', desc: 'Attempting to seize control of territory', severity: 4 },
];

// Get max crew size (dynamic based on skills + properties)
function getMaxCrewSize(state) {
  let max = 4; // base crew slots

  // Kingpin level adds crew slots (2 per level after 3)
  var level = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  if (level >= 3) max += (level - 2) * 2; // Level 3: +2, Level 5: +6, Level 10: +16, Level 20: +36

  // Skills bonus
  if (typeof getSkillEffect === 'function') {
    max += getSkillEffect(state, 'extraCrewSlots') || 0;
  }
  // Property bonus (safe houses, HQs, etc.)
  if (typeof getPropertyCrewBonus === 'function') {
    max += getPropertyCrewBonus(state);
  }
  // Territory bonus: each controlled territory adds 2 crew slots
  if (state.territory) {
    var controlledCount = Object.keys(state.territory).filter(function(id) { return state.territory[id].controlled; }).length;
    max += controlledCount * 2;
  }
  // Level perks
  if (typeof hasPerk === 'function' && hasPerk(state, 'crew_loyalty')) {
    max += 2;
  }
  // Consequence engine ability
  if (typeof getAbilityBonus === 'function') {
    max += Math.floor(getAbilityBonus(state, 'crew_slots') || 0);
  }
  // Trait bonuses: leader/protector traits add crew slots
  if (typeof getTraitBonuses === 'function') {
    var tbCrew = getTraitBonuses(state);
    if (tbCrew.crewSlots) max += tbCrew.crewSlots;
  }
  // NG+ bonus
  if (state.newGamePlus && state.newGamePlus.active) {
    max += 5 * (state.newGamePlus.tier || 1);
  }
  return Math.min(max, 100); // empire-scale cap
}

// Resolve rank (string or number) to numeric index
function _resolveRankIndex(rank) {
  if (typeof rank === 'number') return rank;
  if (typeof rank === 'string') {
    const idx = CREW_RANKS.findIndex(r => r.name.toLowerCase().replace(/[^a-z]/g,'').includes(rank.toLowerCase().replace(/[^a-z]/g,'')));
    if (idx >= 0) return idx;
    // Try matching rank field names like 'soldier', 'lieutenant'
    const nameMap = { 'street_worker': 0, 'streetworker': 0, 'soldier': 1, 'lieutenant': 2, 'underboss': 3, 'right_hand': 4, 'righthand': 4 };
    return nameMap[rank.toLowerCase().replace(/[-\s]/g, '_')] || 0;
  }
  return 0;
}

// Count crew at a specific rank
function getCrewCountAtRank(state, rank) {
  return (state.henchmen || []).filter(h => _resolveRankIndex(h.rank) === rank).length;
}

function canPromoteCrew(state, crewMember) {
  const currentRank = _resolveRankIndex(crewMember.rank);
  const nextRank = currentRank + 1;
  if (nextRank >= CREW_RANKS.length) return { can: false, reason: 'Already max rank' };

  const nextRankData = CREW_RANKS[nextRank];

  // Check rank slot availability
  const currentAtRank = getCrewCountAtRank(state, nextRank);
  if (currentAtRank >= nextRankData.maxGlobal) return { can: false, reason: 'No ' + nextRankData.name + ' slots available (' + currentAtRank + '/' + nextRankData.maxGlobal + ')' };

  // Check requirements
  if (nextRankData.requires) {
    if (crewMember.loyalty < nextRankData.requires.loyalty) {
      return { can: false, reason: 'Need ' + nextRankData.requires.loyalty + ' loyalty (has ' + crewMember.loyalty + ')' };
    }
    if ((crewMember.daysServed || 0) < nextRankData.requires.daysServed) {
      return { can: false, reason: 'Need ' + nextRankData.requires.daysServed + ' days served (has ' + (crewMember.daysServed || 0) + ')' };
    }
  }

  // Check cost
  if (state.cash < nextRankData.promotionCost) {
    return { can: false, reason: 'Need $' + nextRankData.promotionCost.toLocaleString() };
  }

  return { can: true, reason: '' };
}

// Promote a crew member
function promoteCrew(state, crewIndex) {
  const member = state.henchmen[crewIndex];
  if (!member) return { success: false, msg: 'Crew member not found' };

  const check = canPromoteCrew(state, member);
  if (!check.can) return { success: false, msg: check.reason };

  const nextRank = _resolveRankIndex(member.rank) + 1;
  const nextRankData = CREW_RANKS[nextRank];

  state.cash -= nextRankData.promotionCost;
  member.rank = nextRank;

  // Promotion boosts loyalty
  member.loyalty = Math.min(100, member.loyalty + 15);
  member.hiddenLoyalty = Math.min(100, (member.hiddenLoyalty || member.loyalty) + 15);
  member.betrayalRisk = Math.max(0, (member.betrayalRisk || 0) - 10);

  // Other crew may get jealous (ambitious trait)
  for (const other of state.henchmen) {
    if (other === member) continue;
    if (other.traits && other.traits.includes('ambitious') && (other.rank || 0) >= (member.rank || 0) - 1) {
      other.hiddenLoyalty = Math.max(0, (other.hiddenLoyalty || other.loyalty) - 5);
      other.betrayalRisk = Math.min(100, (other.betrayalRisk || 0) + 3);
    }
  }

  return { success: true, msg: member.name + ' promoted to ' + nextRankData.name + '!' };
}

// Get trait object by ID
function getTraitById(traitId) {
  return CREW_TRAITS.find(t => t.id === traitId);
}

// Calculate effective combat value for a crew member (with rank multiplier)
function getCrewCombatValue(member) {
  const base = member.combat || 10;
  const rankData = CREW_RANKS[member.rank || 0];
  let mult = rankData ? rankData.combatMult : 1.0;

  // Trait modifiers
  if (member.traits) {
    for (const traitId of member.traits) {
      const trait = getTraitById(traitId);
      if (trait && trait.combatMod) mult += trait.combatMod;
    }
  }

  return Math.round(base * mult);
}

// Process daily crew expansion logic (called alongside processCrewDaily)
function processCrewExpansionDaily(state) {
  if (!state.henchmen || state.henchmen.length === 0) return [];
  const messages = [];

  for (let i = state.henchmen.length - 1; i >= 0; i--) {
    const member = state.henchmen[i];

    // Initialize new fields if missing
    if (member.rank === undefined) member.rank = 0;
    if (member.daysServed === undefined) member.daysServed = 0;
    if (member.hiddenLoyalty === undefined) member.hiddenLoyalty = member.loyalty;
    if (member.betrayalRisk === undefined) member.betrayalRisk = 0;
    if (!member.traits) member.traits = [];
    if (!member.uniqueId) member.uniqueId = 'crew_' + Math.random().toString(36).substr(2, 8);

    // Track days served
    member.daysServed++;

    // Hidden loyalty drifts based on traits and conditions
    let loyaltyDrift = 0;
    for (const traitId of member.traits) {
      const trait = getTraitById(traitId);
      if (trait) loyaltyDrift += (trait.loyaltyMod || 0) * 0.02; // Small daily effect
    }

    // Overpaid = hidden loyalty rises, underpaid = drops
    if (member.daysSincePaid > 3) {
      loyaltyDrift -= 3;
      member.betrayalRisk = Math.min(100, member.betrayalRisk + 1);
    }

    // Rep-based trust modifier
    if (typeof getRepEffects === 'function') {
      const repEffects = getRepEffects(state);
      loyaltyDrift += (repEffects.crewLoyaltyMod || 0) * 0.1;
    }

    // Character passive: ex-con loyalty decay reduction
    if (typeof getCharacterPassiveValue === 'function') {
      const loyaltyDecayMod = getCharacterPassiveValue(state, 'loyaltyDecayMod');
      if (loyaltyDecayMod && loyaltyDrift < 0) {
        loyaltyDrift *= (1 + loyaltyDecayMod); // Reduces negative drift
      }
    }

    member.hiddenLoyalty = Math.max(0, Math.min(100, member.hiddenLoyalty + loyaltyDrift));

    // Visible loyalty slowly converges toward hidden loyalty
    const loyaltyGap = member.hiddenLoyalty - member.loyalty;
    if (Math.abs(loyaltyGap) > 5) {
      member.loyalty += loyaltyGap > 0 ? 1 : -1;
    }

    // Betrayal risk calculation
    let betrayalDrift = 0;
    if (member.hiddenLoyalty < 40) betrayalDrift += (40 - member.hiddenLoyalty) * 0.05;
    if (member.hiddenLoyalty > 70) betrayalDrift -= 1;
    for (const traitId of member.traits) {
      const trait = getTraitById(traitId);
      if (trait) betrayalDrift += (trait.betrayalMod || 0) * 0.01;
    }
    member.betrayalRisk = Math.max(0, Math.min(100, member.betrayalRisk + betrayalDrift));

    // Check for betrayal events
    if (member.betrayalRisk > 60 && Math.random() < (member.betrayalRisk / 100)) {
      const betrayal = resolveBetrayal(state, i);
      if (betrayal) messages.push(betrayal);
    }

    // Warning signs (visible to player when betrayalRisk > 40)
    if (member.betrayalRisk > 40 && Math.random() < 0.1) {
      const warnings = getCrewWarnings(member);
      if (warnings.length > 0) {
        messages.push('⚠️ ' + member.name + ': ' + warnings[Math.floor(Math.random() * warnings.length)]);
      }
    }
  }

  return messages;
}

// Generate warning signs for suspicious crew
function getCrewWarnings(member) {
  const warnings = [];
  if (member.betrayalRisk > 40) warnings.push('Acting distant and evasive');
  if (member.betrayalRisk > 50) warnings.push('Spotted making unexplained phone calls');
  if (member.betrayalRisk > 60) warnings.push('Spending more than they should be earning');
  if (member.betrayalRisk > 70) warnings.push('Missing from their post without explanation');
  if (member.betrayalRisk > 80) warnings.push('Overheard talking about "options" and "deals"');
  if (member.traits.includes('greedy') && member.betrayalRisk > 30) warnings.push('Complaining about their cut');
  if (member.traits.includes('ambitious') && member.betrayalRisk > 30) warnings.push('Telling others they could run things better');
  return warnings;
}

// Resolve a betrayal event
function resolveBetrayal(state, crewIndex) {
  const member = state.henchmen[crewIndex];
  if (!member) return null;

  // Weight betrayal types by severity and conditions
  const possible = [];
  possible.push({ type: BETRAYAL_TYPES[0], weight: 3 }); // skim - always possible
  possible.push({ type: BETRAYAL_TYPES[4], weight: 2 }); // desert

  if (member.betrayalRisk > 50) {
    possible.push({ type: BETRAYAL_TYPES[1], weight: 2 }); // steal product
    possible.push({ type: BETRAYAL_TYPES[3], weight: 1 }); // inform rival
  }
  if (member.betrayalRisk > 70) {
    possible.push({ type: BETRAYAL_TYPES[2], weight: 2 }); // inform police
  }
  if (member.betrayalRisk > 85 && (member.rank || 0) >= 2) {
    possible.push({ type: BETRAYAL_TYPES[5], weight: 1 }); // coup (only lieutenants+)
  }

  // Weighted random selection
  const totalWeight = possible.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected = possible[0].type;
  for (const p of possible) {
    roll -= p.weight;
    if (roll <= 0) { selected = p.type; break; }
  }

  let msg = '';
  switch (selected.id) {
    case 'skim':
      const skimAmount = Math.round(state.cash * (0.01 + Math.random() * 0.03));
      state.cash = Math.max(0, state.cash - skimAmount);
      msg = `🐍 ${member.name} has been skimming profits! Lost $${skimAmount.toLocaleString()}`;
      member.betrayalRisk = Math.max(0, member.betrayalRisk - 20); // Relieved some pressure
      break;

    case 'steal_product':
      // Steal from stash at current location
      if (state.stashes) {
        for (const locId of Object.keys(state.stashes)) {
          const drugs = Object.keys(state.stashes[locId]);
          if (drugs.length > 0) {
            const drug = drugs[Math.floor(Math.random() * drugs.length)];
            const stolen = Math.ceil(state.stashes[locId][drug] * 0.15);
            state.stashes[locId][drug] = Math.max(0, state.stashes[locId][drug] - stolen);
            msg = `🐍 ${member.name} stole ${stolen} units of ${drug} from stash!`;
            break;
          }
        }
      }
      if (!msg) msg = `🐍 ${member.name} tried to steal product but found nothing`;
      member.betrayalRisk = Math.max(0, member.betrayalRisk - 15);
      break;

    case 'inform_police':
      if (typeof updateInvestigation === 'function') {
        updateInvestigation(state, 'crew_informant', 15);
      }
      msg = `🚔 ${member.name} is INFORMING ON YOU to the police! Investigation +15`;
      break;

    case 'inform_rival':
      msg = `🗣️ ${member.name} has been selling your intel to rivals!`;
      state.heat = Math.min(100, state.heat + 10);
      break;

    case 'desert':
      msg = `🏃 ${member.name} has DESERTED! They took their gear and vanished.`;
      state.henchmen.splice(crewIndex, 1);
      return msg;

    case 'coup_attempt':
      msg = `⚔️ ${member.name} is attempting a COUP! They're trying to turn your crew against you!`;
      // Turn other low-loyalty crew
      for (const other of state.henchmen) {
        if (other === member) continue;
        if ((other.hiddenLoyalty || other.loyalty) < 50) {
          other.hiddenLoyalty = Math.max(0, (other.hiddenLoyalty || other.loyalty) - 20);
          other.betrayalRisk = Math.min(100, (other.betrayalRisk || 0) + 20);
        }
      }
      // Remove the coup leader
      state.henchmen.splice(crewIndex, 1);
      return msg;
  }

  return msg;
}

// Confront a suspicious crew member
function confrontCrew(state, crewIndex) {
  const member = state.henchmen[crewIndex];
  if (!member) return { success: false, msg: 'Crew member not found' };

  if (member.betrayalRisk > 50) {
    // They were actually plotting - caught them
    member.betrayalRisk = 0;
    member.hiddenLoyalty = Math.max(0, member.hiddenLoyalty - 20);
    member.loyalty = Math.max(0, member.loyalty - 10);
    return { success: true, msg: member.name + ' was confronted. They admitted to plotting. Loyalty dropped but betrayal prevented.', caught: true };
  } else {
    // False accusation - damages trust
    member.hiddenLoyalty = Math.max(0, member.hiddenLoyalty - 15);
    member.betrayalRisk = Math.min(100, member.betrayalRisk + 10);
    return { success: true, msg: member.name + ' was wrongly accused. Trust damaged.', caught: false };
  }
}

// Generate random traits for new crew members
function generateCrewTraits(typeId) {
  const traits = [];
  const possibleTraits = CREW_TRAITS.filter(t => t.id !== 'disloyal'); // Disloyal only via story

  // 1-2 random traits
  const count = 1 + (Math.random() < 0.4 ? 1 : 0);
  const shuffled = [...possibleTraits].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i < shuffled.length; i++) {
    traits.push(shuffled[i].id);
  }

  // Type-specific guaranteed traits
  if (typeId === 'enforcer' && !traits.includes('violent')) traits.push('violent');
  if (typeId === 'bodyguard' && !traits.includes('disciplined') && Math.random() < 0.5) traits.push('disciplined');
  if (typeId === 'lawyer' && !traits.includes('cautious') && Math.random() < 0.5) traits.push('cautious');

  return traits.slice(0, 3); // Max 3 traits
}

// Get rank data for a crew member
function getCrewRankData(member) {
  return CREW_RANKS[member.rank || 0] || CREW_RANKS[0];
}

// Get crew member daily pay with rank bonus
function getCrewDailyPay(member) {
  const base = member.dailyPay || 100;
  const rankData = getCrewRankData(member);
  return Math.round(base * (1 + rankData.payCutPct / 100));
}
