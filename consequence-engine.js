// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Consequence Engine
// The backbone for making every player choice have lasting effects.
// Every mission, encounter, NPC interaction, and faction decision
// feeds through this engine to create a living story web.
// ============================================================

// ============================================================
// ABILITY DEFINITIONS
// Permanent bonuses earned from narrative choices.
// Each ability has an id, display info, and one or more bonus
// entries that other systems query via getAbilityBonus().
// ============================================================

const ABILITY_DEFINITIONS = {
  // --- Intimidation ---
  intimidation_bonus_10:  { name: 'Iron Stare',          emoji: '😈', desc: '+10% intimidation effectiveness',   bonuses: { intimidation: 10 } },
  intimidation_bonus_20:  { name: 'Terrifying Presence',  emoji: '💀', desc: '+20% intimidation effectiveness',   bonuses: { intimidation: 20 } },
  fear_aura:              { name: 'Fear Aura',            emoji: '👹', desc: 'Enemies hesitate before attacking', bonuses: { intimidation: 15, enemy_hesitation: 10 } },

  // --- Negotiation / Trade ---
  haggle_master:          { name: 'Haggle Master',        emoji: '🤝', desc: '5% better buy/sell prices',         bonuses: { buy_discount: 5, sell_bonus: 5 } },
  silver_tongue_bonus:    { name: 'Silver Tongue',        emoji: '🗣️', desc: '+10% persuasion success',           bonuses: { persuasion: 10 } },
  trusted_by_cops:        { name: 'Trusted by Cops',      emoji: '🚔', desc: 'Reduced heat gain from deals',      bonuses: { heat_reduction: 15 } },
  insider_trading:        { name: 'Insider Trading',      emoji: '📈', desc: 'See price trends 1 day early',      bonuses: { price_knowledge: 1 } },

  // --- Evasion / Stealth ---
  escape_artist:          { name: 'Escape Artist',        emoji: '🏃', desc: '20% better chase escape chance',    bonuses: { chase_escape: 20 } },
  ghost_step:             { name: 'Ghost Step',           emoji: '👻', desc: 'Reduced encounter chance',          bonuses: { encounter_reduction: 10 } },
  safe_house_network:     { name: 'Safe House Network',   emoji: '🏠', desc: 'Extra safe house in every region',  bonuses: { safe_houses: 1 } },

  // --- Criminal Craft ---
  lockpicking:            { name: 'Lockpicking',          emoji: '🔓', desc: 'Can pick locks during heists',      bonuses: { lockpick: 1 } },
  forgery:                { name: 'Forgery',              emoji: '📄', desc: 'Can create fake IDs and documents',  bonuses: { forgery: 1 } },
  wiretap_knowledge:      { name: 'Wiretap Knowledge',    emoji: '🎧', desc: 'Detect police wiretaps',            bonuses: { wiretap_detect: 1 } },
  safecracking:           { name: 'Safecracking',         emoji: '🔐', desc: 'Can crack safes during heists',     bonuses: { safecrack: 1 } },

  // --- Chemistry ---
  chemist_knowledge:      { name: 'Street Chemist',       emoji: '🧪', desc: '+15% drug processing yield',        bonuses: { processing_yield: 15 } },
  purity_expert:          { name: 'Purity Expert',        emoji: '💎', desc: '+10% drug sale value',              bonuses: { sell_bonus: 10 } },
  poison_craft:           { name: 'Poison Craft',         emoji: '☠️', desc: 'Can poison rival supply',           bonuses: { poison: 1 } },

  // --- Combat ---
  cold_blooded:           { name: 'Cold Blooded',         emoji: '🥶', desc: '+10% damage in ambushes',           bonuses: { ambush_damage: 10 } },
  combat_medic:           { name: 'Combat Medic',         emoji: '🩹', desc: 'Heal 15 HP after surviving combat', bonuses: { post_combat_heal: 15 } },
  dual_wielding:          { name: 'Dual Wielding',        emoji: '🔫', desc: 'Can fire two pistols',              bonuses: { dual_wield: 1 } },
  sniper_training:        { name: 'Sniper Training',      emoji: '🎯', desc: '+15% rifle accuracy',              bonuses: { rifle_accuracy: 15 } },
  body_reading:           { name: 'Body Reading',         emoji: '👁️', desc: 'Detect ambushes before they happen', bonuses: { ambush_detect: 1 } },

  // --- Crew / Leadership ---
  crew_whisperer:         { name: 'Crew Whisperer',       emoji: '💬', desc: '+10% crew loyalty',                 bonuses: { crew_loyalty: 10 } },
  inspiring_leader:       { name: 'Inspiring Leader',     emoji: '🎖️', desc: '+1 max crew member',               bonuses: { max_crew: 1 } },
  ruthless_commander:     { name: 'Ruthless Commander',   emoji: '⚔️', desc: '+15% crew combat effectiveness',   bonuses: { crew_combat: 15 } },

  // --- Faction / Political ---
  diplomatic_immunity:    { name: 'Diplomatic Immunity',  emoji: '🕊️', desc: 'One free faction offense per week', bonuses: { faction_forgiveness: 1 } },
  cartel_blood_oath:      { name: 'Cartel Blood Oath',    emoji: '🩸', desc: 'Permanent +20 Colombian Cartel standing', bonuses: { faction_colombian_cartel: 20 } },
  political_connections:  { name: 'Political Connections', emoji: '🏛️', desc: '-10% heat gain from all sources', bonuses: { heat_reduction: 10 } },
  media_contacts:         { name: 'Media Contacts',       emoji: '📺', desc: 'Can manipulate public image',       bonuses: { public_image: 1 } },

  // --- Financial ---
  money_laundering_pro:   { name: 'Laundering Pro',       emoji: '🧼', desc: '+20% laundering efficiency',        bonuses: { launder_efficiency: 20 } },
  offshore_expert:        { name: 'Offshore Expert',      emoji: '🏝️', desc: 'Better offshore account rates',    bonuses: { bank_interest: 10 } },
  insurance_fraud:        { name: 'Insurance Fraud',      emoji: '📋', desc: 'Recover 30% of raid losses',        bonuses: { raid_recovery: 30 } },
};


// ============================================================
// TRAIT DEFINITIONS (metadata for known traits)
// Not strictly required -- traits can be arbitrary -- but this
// provides display info and categorization for the UI.
// ============================================================

const TRAIT_DEFINITIONS = {
  // --- Moral Compass ---
  merciful:           { name: 'Merciful',             emoji: '🕊️', category: 'moral',    desc: 'Known for sparing lives when you didn\'t have to' },
  ruthless:           { name: 'Ruthless',             emoji: '🔪', category: 'moral',    desc: 'Killed in cold blood without hesitation' },
  honorable:          { name: 'Honorable',            emoji: '🤝', category: 'moral',    desc: 'Keeps your word, even to enemies' },
  treacherous:        { name: 'Treacherous',          emoji: '🐍', category: 'moral',    desc: 'Broke promises and backstabbed allies' },
  charitable:         { name: 'Charitable',           emoji: '💝', category: 'moral',    desc: 'Gave back to the community' },

  // --- Reputation ---
  feared:             { name: 'Feared',               emoji: '💀', category: 'rep',      desc: 'People fear crossing you' },
  respected:          { name: 'Respected',            emoji: '👑', category: 'rep',      desc: 'Earned genuine respect in the underworld' },
  infamous:           { name: 'Infamous',             emoji: '📰', category: 'rep',      desc: 'Your name is known by everyone -- including the feds' },
  ghost:              { name: 'Ghost',                emoji: '👻', category: 'rep',      desc: 'Nobody knows your real identity' },

  // --- Social ---
  silver_tongue:      { name: 'Silver Tongue',        emoji: '🗣️', category: 'social',   desc: 'Talked your way out of impossible situations' },
  connected_cartel:   { name: 'Cartel Connected',     emoji: '🇨🇴', category: 'social',   desc: 'Allied with the Colombian Cartel' },
  connected_mafia:    { name: 'Mafia Connected',      emoji: '🇮🇹', category: 'social',   desc: 'Allied with the Italian Mob' },
  connected_triad:    { name: 'Triad Connected',      emoji: '🇨🇳', category: 'social',   desc: 'Allied with the Chinese Triad' },
  police_snitch:      { name: 'Police Snitch',        emoji: '🐀', category: 'social',   desc: 'Cooperated with law enforcement' },
  cop_killer:         { name: 'Cop Killer',           emoji: '🚨', category: 'social',   desc: 'Killed a law enforcement officer' },

  // --- Operational ---
  careful_planner:    { name: 'Careful Planner',      emoji: '📐', category: 'ops',      desc: 'Plans every move in advance' },
  loose_cannon:       { name: 'Loose Cannon',         emoji: '💥', category: 'ops',      desc: 'Unpredictable and impulsive' },
  survivor:           { name: 'Survivor',             emoji: '🛡️', category: 'ops',      desc: 'Escaped death more than once' },
  kingmaker:          { name: 'Kingmaker',            emoji: '♟️', category: 'ops',      desc: 'Put others in power for your benefit' },
  empire_builder:     { name: 'Empire Builder',       emoji: '🏗️', category: 'ops',      desc: 'Built a sprawling criminal enterprise' },

  // --- Criminal Record ---
  first_blood:        { name: 'First Blood',          emoji: '🩸', category: 'record',   desc: 'Killed for the first time' },
  jailbird:           { name: 'Jailbird',             emoji: '🔒', category: 'record',   desc: 'Served time in prison' },
  escaped_convict:    { name: 'Escaped Convict',      emoji: '🏃', category: 'record',   desc: 'Broke out of prison' },
  clean_record:       { name: 'Clean Record',         emoji: '✅', category: 'record',   desc: 'Never been arrested' },
};


// ============================================================
// STATE INITIALIZATION
// Call once when a new game starts. Merges consequence state
// into the main game state object.
// ============================================================

function initConsequenceState(state) {
  if (!state) state = {};

  // --- Player traits earned from choices ---
  // Values: boolean (true/false) or numeric (count/level)
  if (!state.playerTraits) state.playerTraits = {};

  // --- Permanent abilities earned from choices ---
  // Array of ability ID strings from ABILITY_DEFINITIONS
  if (!state.playerAbilities) state.playerAbilities = [];

  // --- Delayed consequences waiting to fire ---
  // Array of { triggerDay: Number, event: String, data: Object }
  if (!state.pendingConsequences) state.pendingConsequences = [];

  // --- Complete history of every player choice ---
  // Array of { day, choiceId, option, consequences, timestamp }
  if (!state.choiceHistory) state.choiceHistory = [];

  // --- Content gating ---
  if (!state.unlockedContent) state.unlockedContent = [];
  if (!state.lockedContent)   state.lockedContent = [];

  // --- Consequence stats (meta-tracking) ---
  if (!state.consequenceStats) {
    state.consequenceStats = {
      totalChoicesMade: 0,
      totalConsequencesApplied: 0,
      totalDelayedFired: 0,
      traitChanges: 0,
      abilitiesGranted: 0,
      abilitiesRevoked: 0,
    };
  }

  return state;
}


// ============================================================
// APPLY CONSEQUENCES
// The single entry point every system uses to make a choice
// take effect. Handles: traits, stats, cash, factions,
// content gates, crew changes, abilities, delayed events,
// and player-visible messages.
//
// Returns { messages: string[], applied: object } so callers
// know exactly what happened.
// ============================================================

function applyConsequences(state, consequenceObj, choiceId, optionId) {
  // Safety-init if the consequence sub-state doesn't exist yet
  initConsequenceState(state);

  if (!consequenceObj || typeof consequenceObj !== 'object') {
    return { messages: [], applied: {} };
  }

  const messages = [];
  const applied = {};
  const c = consequenceObj;

  // ----------------------------------------------------------
  // 1. TRAITS -- add/set
  // ----------------------------------------------------------
  if (c.traits && typeof c.traits === 'object') {
    for (const [traitId, value] of Object.entries(c.traits)) {
      const prev = state.playerTraits[traitId];
      if (typeof value === 'number' && typeof prev === 'number') {
        // Numeric traits accumulate
        state.playerTraits[traitId] = prev + value;
      } else if (typeof value === 'number' && typeof prev === 'undefined') {
        state.playerTraits[traitId] = value;
      } else {
        // Boolean or first assignment
        state.playerTraits[traitId] = value;
      }
      state.consequenceStats.traitChanges++;

      const def = TRAIT_DEFINITIONS[traitId];
      const displayName = def ? (def.emoji + ' ' + def.name) : traitId;
      if (prev === undefined) {
        messages.push('Trait gained: ' + displayName);
      } else if (typeof value === 'number') {
        messages.push('Trait updated: ' + displayName + ' -> ' + state.playerTraits[traitId]);
      }
    }
    applied.traits = c.traits;
  }

  // ----------------------------------------------------------
  // 2. REMOVE TRAITS -- strip conflicting traits
  // ----------------------------------------------------------
  if (Array.isArray(c.removeTraits)) {
    for (const traitId of c.removeTraits) {
      if (state.playerTraits[traitId] !== undefined) {
        delete state.playerTraits[traitId];
        state.consequenceStats.traitChanges++;

        const def = TRAIT_DEFINITIONS[traitId];
        const displayName = def ? (def.emoji + ' ' + def.name) : traitId;
        messages.push('Trait lost: ' + displayName);
      }
    }
    applied.removeTraits = c.removeTraits;
  }

  // ----------------------------------------------------------
  // 3. STAT MODIFICATIONS (heat, reputation, health, etc.)
  // ----------------------------------------------------------
  if (c.stats && typeof c.stats === 'object') {
    for (const [statKey, delta] of Object.entries(c.stats)) {
      // Use the multi-dimensional rep system if available and stat is a rep dimension
      const repDimensions = ['streetCred', 'fear', 'trust', 'publicImage', 'heatSignature'];
      if (repDimensions.includes(statKey) && typeof adjustRep === 'function') {
        adjustRep(state, statKey, delta);
        messages.push(statKey + (delta >= 0 ? ' +' : ' ') + delta);
      } else if (statKey === 'reputation' && typeof adjustRep === 'function') {
        // Legacy reputation: map to streetCred
        adjustRep(state, 'streetCred', delta);
        messages.push('Reputation ' + (delta >= 0 ? '+' : '') + delta);
      } else {
        // Direct stat modification (heat, health, maxHealth, etc.)
        const prev = state[statKey] || 0;
        state[statKey] = prev + delta;

        // Clamp known stats
        if (statKey === 'heat') state.heat = Math.max(0, Math.min(100, state.heat));
        if (statKey === 'health') state.health = Math.max(0, Math.min(state.maxHealth || 100, state.health));

        const sign = delta >= 0 ? '+' : '';
        messages.push(statKey + ' ' + sign + delta);
      }
    }
    applied.stats = c.stats;
  }

  // ----------------------------------------------------------
  // 4. CASH CHANGE
  // ----------------------------------------------------------
  if (typeof c.cash === 'number' && c.cash !== 0) {
    state.cash = (state.cash || 0) + c.cash;
    if (state.cash < 0) state.cash = 0; // Floor at zero

    if (c.cash > 0) {
      messages.push('Received $' + c.cash.toLocaleString());
    } else {
      messages.push('Lost $' + Math.abs(c.cash).toLocaleString());
    }
    applied.cash = c.cash;

    // Track in stats
    if (!state.stats) state.stats = {};
    if (c.cash > 0) {
      state.stats.totalEarnedFromChoices = (state.stats.totalEarnedFromChoices || 0) + c.cash;
    } else {
      state.stats.totalLostFromChoices = (state.stats.totalLostFromChoices || 0) + Math.abs(c.cash);
    }
  }

  // ----------------------------------------------------------
  // 5. FACTION STANDING CHANGES
  // ----------------------------------------------------------
  if (c.faction && typeof c.faction === 'object') {
    for (const [factionId, delta] of Object.entries(c.faction)) {
      if (typeof adjustFactionStanding === 'function') {
        adjustFactionStanding(state, factionId, delta);
      } else {
        // Fallback: direct manipulation
        if (!state.factions) state.factions = { standings: {} };
        if (!state.factions.standings) state.factions.standings = {};
        const prev = state.factions.standings[factionId] || 0;
        state.factions.standings[factionId] = Math.max(-100, Math.min(100, prev + delta));
      }
      const sign = delta >= 0 ? '+' : '';
      messages.push('Faction ' + factionId + ' ' + sign + delta);
    }
    applied.faction = c.faction;
  }

  // ----------------------------------------------------------
  // 6. UNLOCK FUTURE CONTENT
  // ----------------------------------------------------------
  if (Array.isArray(c.unlock)) {
    for (const contentId of c.unlock) {
      if (!state.unlockedContent.includes(contentId)) {
        state.unlockedContent.push(contentId);
        messages.push('Unlocked: ' + contentId);
      }
      // If it was previously locked, remove from lock list
      const lockIdx = state.lockedContent.indexOf(contentId);
      if (lockIdx !== -1) state.lockedContent.splice(lockIdx, 1);
    }
    applied.unlock = c.unlock;
  }

  // ----------------------------------------------------------
  // 7. LOCK OUT FUTURE CONTENT
  // ----------------------------------------------------------
  if (Array.isArray(c.lock)) {
    for (const contentId of c.lock) {
      if (!state.lockedContent.includes(contentId)) {
        state.lockedContent.push(contentId);
        messages.push('Locked out: ' + contentId);
      }
      // If it was unlocked, remove from unlock list
      const unlockIdx = state.unlockedContent.indexOf(contentId);
      if (unlockIdx !== -1) state.unlockedContent.splice(unlockIdx, 1);
    }
    applied.lock = c.lock;
  }

  // ----------------------------------------------------------
  // 8. CREW MODIFICATIONS
  // ----------------------------------------------------------
  if (c.crew && typeof c.crew === 'object') {
    if (typeof c.crew.loyalty === 'number' && Array.isArray(state.henchmen)) {
      for (const h of state.henchmen) {
        h.loyalty = Math.max(0, Math.min(100, (h.loyalty || 50) + c.crew.loyalty));
      }
      const sign = c.crew.loyalty >= 0 ? '+' : '';
      messages.push('Crew loyalty ' + sign + c.crew.loyalty);
    }
    if (typeof c.crew.morale === 'number' && Array.isArray(state.henchmen)) {
      for (const h of state.henchmen) {
        h.morale = Math.max(0, Math.min(100, (h.morale || 50) + c.crew.morale));
      }
      const sign = c.crew.morale >= 0 ? '+' : '';
      messages.push('Crew morale ' + sign + c.crew.morale);
    }
    // Specific crew member targeting by name or id
    if (c.crew.target && Array.isArray(state.henchmen)) {
      const member = state.henchmen.find(h =>
        h.id === c.crew.target || h.name === c.crew.target
      );
      if (member) {
        if (typeof c.crew.targetLoyalty === 'number') {
          member.loyalty = Math.max(0, Math.min(100, (member.loyalty || 50) + c.crew.targetLoyalty));
        }
        if (c.crew.fire) {
          const idx = state.henchmen.indexOf(member);
          if (idx !== -1) {
            state.henchmen.splice(idx, 1);
            messages.push('Crew member lost: ' + (member.name || member.type));
          }
        }
        if (c.crew.injure) {
          member.injured = true;
          member.injuredDays = c.crew.injureDays || 7;
          messages.push((member.name || member.type) + ' was injured');
        }
      }
    }
    // Kill random crew member
    if (c.crew.killRandom && Array.isArray(state.henchmen) && state.henchmen.length > 0) {
      const idx = Math.floor(Math.random() * state.henchmen.length);
      const killed = state.henchmen.splice(idx, 1)[0];
      messages.push('Crew member killed: ' + (killed.name || killed.type));
    }
    applied.crew = c.crew;
  }

  // ----------------------------------------------------------
  // 9. GRANT ABILITY
  // ----------------------------------------------------------
  if (c.ability) {
    const abilities = Array.isArray(c.ability) ? c.ability : [c.ability];
    for (const abilityId of abilities) {
      if (!state.playerAbilities.includes(abilityId)) {
        state.playerAbilities.push(abilityId);
        state.consequenceStats.abilitiesGranted++;

        const def = ABILITY_DEFINITIONS[abilityId];
        const displayName = def ? (def.emoji + ' ' + def.name) : abilityId;
        messages.push('Ability gained: ' + displayName);
        if (def) messages.push('  ' + def.desc);
      }
    }
    applied.ability = c.ability;
  }

  // ----------------------------------------------------------
  // 10. REMOVE ABILITY
  // ----------------------------------------------------------
  if (c.removeAbility) {
    const toRemove = Array.isArray(c.removeAbility) ? c.removeAbility : [c.removeAbility];
    for (const abilityId of toRemove) {
      const idx = state.playerAbilities.indexOf(abilityId);
      if (idx !== -1) {
        state.playerAbilities.splice(idx, 1);
        state.consequenceStats.abilitiesRevoked++;

        const def = ABILITY_DEFINITIONS[abilityId];
        const displayName = def ? (def.emoji + ' ' + def.name) : abilityId;
        messages.push('Ability lost: ' + displayName);
      }
    }
    applied.removeAbility = c.removeAbility;
  }

  // ----------------------------------------------------------
  // 11. INVENTORY CHANGES (give or take items)
  // ----------------------------------------------------------
  if (c.giveItems && typeof c.giveItems === 'object') {
    if (!state.items) state.items = [];
    for (const [itemId, qty] of Object.entries(c.giveItems)) {
      const count = typeof qty === 'number' ? qty : 1;
      for (let i = 0; i < count; i++) {
        state.items.push(itemId);
      }
      messages.push('Received item: ' + itemId + (count > 1 ? ' x' + count : ''));
    }
    applied.giveItems = c.giveItems;
  }

  if (c.removeItems && typeof c.removeItems === 'object') {
    if (state.items) {
      for (const [itemId, qty] of Object.entries(c.removeItems)) {
        let toRemove = typeof qty === 'number' ? qty : 1;
        while (toRemove > 0) {
          const idx = state.items.indexOf(itemId);
          if (idx === -1) break;
          state.items.splice(idx, 1);
          toRemove--;
        }
        messages.push('Lost item: ' + itemId);
      }
    }
    applied.removeItems = c.removeItems;
  }

  // ----------------------------------------------------------
  // 12. DRUG INVENTORY CHANGES
  // ----------------------------------------------------------
  if (c.drugs && typeof c.drugs === 'object') {
    if (!state.inventory) state.inventory = {};
    for (const [drugId, delta] of Object.entries(c.drugs)) {
      const prev = state.inventory[drugId] || 0;
      state.inventory[drugId] = Math.max(0, prev + delta);
      if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
      if (delta > 0) {
        messages.push('Received ' + delta + ' units of ' + drugId);
      } else {
        messages.push('Lost ' + Math.abs(delta) + ' units of ' + drugId);
      }
    }
    applied.drugs = c.drugs;
  }

  // ----------------------------------------------------------
  // 13. XP AWARD
  // ----------------------------------------------------------
  if (typeof c.xp === 'number' && c.xp !== 0) {
    if (typeof awardXP === 'function') {
      awardXP(state, choiceId || 'consequence', c.xp);
    } else {
      state.xp = (state.xp || 0) + c.xp;
    }
    messages.push('XP ' + (c.xp > 0 ? '+' : '') + c.xp);
    applied.xp = c.xp;
  }

  // ----------------------------------------------------------
  // 14. NOTIFICATION MESSAGE
  // ----------------------------------------------------------
  if (typeof c.message === 'string' && c.message.length > 0) {
    messages.unshift(c.message);  // Show custom message first
    applied.message = c.message;
  }

  // ----------------------------------------------------------
  // 15. DELAYED CONSEQUENCE
  // ----------------------------------------------------------
  if (c.delay && typeof c.delay === 'object') {
    const delays = Array.isArray(c.delay) ? c.delay : [c.delay];
    for (const delayDef of delays) {
      const triggerDay = (state.day || 1) + (delayDef.days || 1);
      const pending = {
        triggerDay: triggerDay,
        event: delayDef.event || 'unknown_delayed_event',
        data: delayDef.data || {},
        sourceChoice: choiceId || null,
        sourceOption: optionId || null,
        createdDay: state.day || 1,
      };
      // Optional: attach a full consequence object to auto-apply when it fires
      if (delayDef.consequences) {
        pending.consequences = delayDef.consequences;
      }
      state.pendingConsequences.push(pending);
      messages.push('Something was set in motion... (' + (delayDef.days || 1) + ' days)');
    }
    applied.delay = c.delay;
  }

  // ----------------------------------------------------------
  // 16. CAMPAIGN FLAGS (for ending triggers, act transitions)
  // ----------------------------------------------------------
  if (c.flags && typeof c.flags === 'object') {
    if (!state.campaign) state.campaign = {};
    if (!state.campaign.flags) state.campaign.flags = {};
    for (const [flagId, value] of Object.entries(c.flags)) {
      state.campaign.flags[flagId] = value;
    }
    applied.flags = c.flags;
  }

  // ----------------------------------------------------------
  // 17. RECORD CHOICE IN HISTORY
  // ----------------------------------------------------------
  if (choiceId) {
    state.choiceHistory.push({
      day: state.day || 1,
      choiceId: choiceId,
      option: optionId || null,
      consequences: _summarizeConsequences(c),
      timestamp: Date.now(),
    });
    state.consequenceStats.totalChoicesMade++;
  }
  state.consequenceStats.totalConsequencesApplied++;

  return { messages: messages, applied: applied };
}


// ============================================================
// MEETS REQUIREMENTS
// Universal gate-check used before offering choices, missions,
// encounters, dialogue options, and faction actions.
// Returns { met: boolean, failures: string[] }
// ============================================================

function meetsRequirements(state, reqObj) {
  if (!reqObj || typeof reqObj !== 'object') {
    return { met: true, failures: [] };
  }

  initConsequenceState(state);

  const failures = [];
  const r = reqObj;

  // --- Traits required ---
  if (r.traits && typeof r.traits === 'object') {
    for (const [traitId, reqValue] of Object.entries(r.traits)) {
      const current = state.playerTraits[traitId];
      if (current === undefined) {
        failures.push('Requires trait: ' + traitId);
      } else if (typeof reqValue === 'number' && typeof current === 'number' && current < reqValue) {
        failures.push('Requires ' + traitId + ' >= ' + reqValue + ' (have ' + current + ')');
      }
      // If reqValue is true/boolean, just having the trait is enough
    }
  }

  // --- Traits must NOT have ---
  if (Array.isArray(r.noTraits)) {
    for (const traitId of r.noTraits) {
      if (state.playerTraits[traitId] !== undefined) {
        failures.push('Cannot have trait: ' + traitId);
      }
    }
  }

  // --- Minimum cash ---
  if (typeof r.minCash === 'number') {
    if ((state.cash || 0) < r.minCash) {
      failures.push('Need $' + r.minCash.toLocaleString() + ' (have $' + (state.cash || 0).toLocaleString() + ')');
    }
  }

  // --- Maximum cash ---
  if (typeof r.maxCash === 'number') {
    if ((state.cash || 0) > r.maxCash) {
      failures.push('Cash must be below $' + r.maxCash.toLocaleString());
    }
  }

  // --- Minimum reputation ---
  if (typeof r.minRep === 'number') {
    const rep = typeof computeReputation === 'function' ? computeReputation(state) : (state.reputation || 0);
    if (rep < r.minRep) {
      failures.push('Need reputation ' + r.minRep + ' (have ' + rep + ')');
    }
  }

  // --- Maximum heat ---
  if (typeof r.maxHeat === 'number') {
    if ((state.heat || 0) > r.maxHeat) {
      failures.push('Heat must be ' + r.maxHeat + ' or below (have ' + (state.heat || 0) + ')');
    }
  }

  // --- Minimum heat ---
  if (typeof r.minHeat === 'number') {
    if ((state.heat || 0) < r.minHeat) {
      failures.push('Need heat ' + r.minHeat + '+ (have ' + (state.heat || 0) + ')');
    }
  }

  // --- Minimum health ---
  if (typeof r.minHealth === 'number') {
    if ((state.health || 100) < r.minHealth) {
      failures.push('Need health ' + r.minHealth + ' (have ' + (state.health || 100) + ')');
    }
  }

  // --- Faction standing minimums ---
  if (r.faction && typeof r.faction === 'object') {
    for (const [factionId, minStanding] of Object.entries(r.faction)) {
      let standing = 0;
      if (typeof getFactionStanding === 'function') {
        standing = getFactionStanding(state, factionId);
      } else if (state.factions && state.factions.standings) {
        standing = state.factions.standings[factionId] || 0;
      }
      if (standing < minStanding) {
        failures.push('Need ' + factionId + ' standing ' + minStanding + ' (have ' + standing + ')');
      }
    }
  }

  // --- Faction standing maximums (e.g. must be enemies) ---
  if (r.maxFaction && typeof r.maxFaction === 'object') {
    for (const [factionId, maxStanding] of Object.entries(r.maxFaction)) {
      let standing = 0;
      if (typeof getFactionStanding === 'function') {
        standing = getFactionStanding(state, factionId);
      } else if (state.factions && state.factions.standings) {
        standing = state.factions.standings[factionId] || 0;
      }
      if (standing > maxStanding) {
        failures.push('Need ' + factionId + ' standing below ' + maxStanding + ' (have ' + standing + ')');
      }
    }
  }

  // --- Required ability ---
  if (r.ability) {
    const required = Array.isArray(r.ability) ? r.ability : [r.ability];
    for (const abilityId of required) {
      if (!state.playerAbilities.includes(abilityId)) {
        const def = ABILITY_DEFINITIONS[abilityId];
        const name = def ? def.name : abilityId;
        failures.push('Requires ability: ' + name);
      }
    }
  }

  // --- No ability (must NOT have) ---
  if (r.noAbility) {
    const forbidden = Array.isArray(r.noAbility) ? r.noAbility : [r.noAbility];
    for (const abilityId of forbidden) {
      if (state.playerAbilities.includes(abilityId)) {
        const def = ABILITY_DEFINITIONS[abilityId];
        const name = def ? def.name : abilityId;
        failures.push('Cannot have ability: ' + name);
      }
    }
  }

  // --- Minimum crew count ---
  if (typeof r.crew === 'number') {
    const crewCount = (state.henchmen || []).length;
    if (crewCount < r.crew) {
      failures.push('Need ' + r.crew + ' crew members (have ' + crewCount + ')');
    }
  }

  // --- Specific crew type required ---
  if (r.crewType) {
    const types = Array.isArray(r.crewType) ? r.crewType : [r.crewType];
    for (const type of types) {
      const has = (state.henchmen || []).some(h => h.type === type);
      if (!has) {
        failures.push('Need crew member of type: ' + type);
      }
    }
  }

  // --- Required item ---
  if (r.item) {
    const items = Array.isArray(r.item) ? r.item : [r.item];
    for (const itemId of items) {
      const hasIt = typeof hasItem === 'function' ? hasItem(state, itemId) : (state.items || []).includes(itemId);
      if (!hasIt) {
        failures.push('Requires item: ' + itemId);
      }
    }
  }

  // --- Minimum day ---
  if (typeof r.minDay === 'number') {
    if ((state.day || 1) < r.minDay) {
      failures.push('Too early (need day ' + r.minDay + ')');
    }
  }

  // --- Maximum day ---
  if (typeof r.maxDay === 'number') {
    if ((state.day || 1) > r.maxDay) {
      failures.push('Too late (needed before day ' + r.maxDay + ')');
    }
  }

  // --- At specific location ---
  if (r.location) {
    const locs = Array.isArray(r.location) ? r.location : [r.location];
    if (!locs.includes(state.currentLocation)) {
      failures.push('Must be in: ' + locs.join(' or '));
    }
  }

  // --- Not at specific location ---
  if (r.notLocation) {
    const locs = Array.isArray(r.notLocation) ? r.notLocation : [r.notLocation];
    if (locs.includes(state.currentLocation)) {
      failures.push('Cannot be in: ' + state.currentLocation);
    }
  }

  // --- Content must be unlocked ---
  if (r.unlocked) {
    const required = Array.isArray(r.unlocked) ? r.unlocked : [r.unlocked];
    for (const contentId of required) {
      if (!state.unlockedContent.includes(contentId)) {
        failures.push('Content not yet unlocked: ' + contentId);
      }
    }
  }

  // --- Content must NOT be locked ---
  if (r.notLocked) {
    const check = Array.isArray(r.notLocked) ? r.notLocked : [r.notLocked];
    for (const contentId of check) {
      if (state.lockedContent.includes(contentId)) {
        failures.push('Content is locked: ' + contentId);
      }
    }
  }

  // --- Skill level minimums ---
  if (r.skill && typeof r.skill === 'object') {
    for (const [skillId, minLevel] of Object.entries(r.skill)) {
      let level = 0;
      if (typeof getSkillLevel === 'function') {
        level = getSkillLevel(state, skillId);
      } else if (state.skills && typeof state.skills[skillId] === 'number') {
        level = state.skills[skillId];
      }
      if (level < minLevel) {
        failures.push('Need ' + skillId + ' skill level ' + minLevel + ' (have ' + level + ')');
      }
    }
  }

  // --- Campaign flags ---
  if (r.flags && typeof r.flags === 'object') {
    const flags = (state.campaign && state.campaign.flags) || {};
    for (const [flagId, reqValue] of Object.entries(r.flags)) {
      if (reqValue === true && !flags[flagId]) {
        failures.push('Requires campaign flag: ' + flagId);
      } else if (reqValue === false && flags[flagId]) {
        failures.push('Cannot have campaign flag: ' + flagId);
      } else if (typeof reqValue === 'number' && (flags[flagId] || 0) < reqValue) {
        failures.push('Need flag ' + flagId + ' >= ' + reqValue);
      }
    }
  }

  // --- Past choice required ---
  if (r.madeChoice) {
    const choices = Array.isArray(r.madeChoice) ? r.madeChoice : [r.madeChoice];
    for (const cId of choices) {
      const found = state.choiceHistory.some(h => h.choiceId === cId);
      if (!found) {
        failures.push('Must have made choice: ' + cId);
      }
    }
  }

  // --- Past choice with specific option ---
  if (r.madeChoiceOption && typeof r.madeChoiceOption === 'object') {
    for (const [cId, optId] of Object.entries(r.madeChoiceOption)) {
      const found = state.choiceHistory.some(h => h.choiceId === cId && h.option === optId);
      if (!found) {
        failures.push('Must have chosen "' + optId + '" in "' + cId + '"');
      }
    }
  }

  // --- Minimum net worth ---
  if (typeof r.minNetWorth === 'number') {
    const nw = (state.cash || 0) + (state.bank || 0) - (state.debt || 0);
    if (nw < r.minNetWorth) {
      failures.push('Need net worth $' + r.minNetWorth.toLocaleString() + ' (have $' + nw.toLocaleString() + ')');
    }
  }

  // --- Minimum territories ---
  if (typeof r.minTerritories === 'number') {
    const count = Object.keys(state.territory || {}).length;
    if (count < r.minTerritories) {
      failures.push('Need ' + r.minTerritories + ' territories (have ' + count + ')');
    }
  }

  // --- Custom check function (for complex requirements) ---
  if (typeof r.custom === 'function') {
    try {
      if (!r.custom(state)) {
        failures.push(r.customFailMessage || 'Custom requirement not met');
      }
    } catch (e) {
      failures.push('Requirement check error');
    }
  }

  return { met: failures.length === 0, failures: failures };
}


// ============================================================
// PROCESS DELAYED CONSEQUENCES DAILY
// Called once per game day from the main advanceDay() loop.
// Checks state.pendingConsequences for events whose trigger
// day has arrived (or passed). Fires them and removes from queue.
// Returns an array of messages to display.
// ============================================================

function processConsequencesDaily(state) {
  initConsequenceState(state);

  const currentDay = state.day || 1;
  const messages = [];
  const fired = [];
  const remaining = [];

  for (const pending of state.pendingConsequences) {
    if (currentDay >= pending.triggerDay) {
      fired.push(pending);
    } else {
      remaining.push(pending);
    }
  }

  state.pendingConsequences = remaining;

  for (const pending of fired) {
    state.consequenceStats.totalDelayedFired++;

    // If the pending consequence carries an auto-apply payload, apply it
    if (pending.consequences) {
      const result = applyConsequences(
        state,
        pending.consequences,
        pending.sourceChoice ? pending.sourceChoice + '_delayed' : 'delayed_' + pending.event,
        pending.event
      );
      messages.push('A past decision catches up with you...');
      messages.push(...result.messages);
    } else {
      // Otherwise just announce the event for the calling system to handle
      messages.push('Delayed event triggered: ' + pending.event);
    }

    // Record in choice history that a delayed consequence fired
    state.choiceHistory.push({
      day: currentDay,
      choiceId: '_delayed_' + pending.event,
      option: 'auto',
      consequences: { event: pending.event, data: pending.data, sourceChoice: pending.sourceChoice },
      timestamp: Date.now(),
    });
  }

  return { messages: messages, firedEvents: fired };
}


// ============================================================
// ABILITY BONUS SYSTEM
// Queries all active player abilities and sums bonuses of a
// given type. Other systems call this to apply ability effects.
//
// Example:
//   const intimidBonus = getAbilityBonus(state, 'intimidation');
//   const buyDiscount  = getAbilityBonus(state, 'buy_discount');
//   const canLockpick  = getAbilityBonus(state, 'lockpick') > 0;
// ============================================================

function getAbilityBonus(state, bonusType) {
  initConsequenceState(state);

  let total = 0;
  for (const abilityId of state.playerAbilities) {
    const def = ABILITY_DEFINITIONS[abilityId];
    if (def && def.bonuses && typeof def.bonuses[bonusType] === 'number') {
      total += def.bonuses[bonusType];
    }
  }
  return total;
}


// ============================================================
// ABILITY QUERIES
// Convenience functions other systems can use.
// ============================================================

function hasAbility(state, abilityId) {
  initConsequenceState(state);
  return state.playerAbilities.includes(abilityId);
}

function getActiveAbilities(state) {
  initConsequenceState(state);
  return state.playerAbilities.map(id => {
    const def = ABILITY_DEFINITIONS[id];
    return {
      id: id,
      name: def ? def.name : id,
      emoji: def ? def.emoji : '?',
      desc: def ? def.desc : '',
      bonuses: def ? def.bonuses : {},
    };
  });
}

// Get a combined object of ALL bonuses from ALL active abilities
function getAllAbilityBonuses(state) {
  initConsequenceState(state);

  const combined = {};
  for (const abilityId of state.playerAbilities) {
    const def = ABILITY_DEFINITIONS[abilityId];
    if (def && def.bonuses) {
      for (const [bonusType, value] of Object.entries(def.bonuses)) {
        combined[bonusType] = (combined[bonusType] || 0) + value;
      }
    }
  }
  return combined;
}


// ============================================================
// TRAIT QUERIES
// Convenience functions for checking player traits.
// ============================================================

function hasTrait(state, traitId) {
  initConsequenceState(state);
  return state.playerTraits[traitId] !== undefined;
}

function getTraitValue(state, traitId) {
  initConsequenceState(state);
  return state.playerTraits[traitId];
}

function getTraitsByCategory(state, category) {
  initConsequenceState(state);

  const result = [];
  for (const [traitId, value] of Object.entries(state.playerTraits)) {
    const def = TRAIT_DEFINITIONS[traitId];
    if (def && def.category === category) {
      result.push({
        id: traitId,
        value: value,
        name: def.name,
        emoji: def.emoji,
        desc: def.desc,
      });
    } else if (!def && category === 'unknown') {
      result.push({ id: traitId, value: value, name: traitId, emoji: '?', desc: '' });
    }
  }
  return result;
}

function getAllTraits(state) {
  initConsequenceState(state);

  const result = [];
  for (const [traitId, value] of Object.entries(state.playerTraits)) {
    const def = TRAIT_DEFINITIONS[traitId];
    result.push({
      id: traitId,
      value: value,
      name: def ? def.name : traitId,
      emoji: def ? def.emoji : '?',
      desc: def ? def.desc : '',
      category: def ? def.category : 'unknown',
    });
  }
  return result;
}


// ============================================================
// CONTENT GATING QUERIES
// ============================================================

function isContentUnlocked(state, contentId) {
  initConsequenceState(state);
  // Unlocked if explicitly unlocked and not explicitly locked
  return state.unlockedContent.includes(contentId) && !state.lockedContent.includes(contentId);
}

function isContentLocked(state, contentId) {
  initConsequenceState(state);
  return state.lockedContent.includes(contentId);
}

function isContentAvailable(state, contentId) {
  initConsequenceState(state);
  // Available if not explicitly locked (doesn't require explicit unlock)
  return !state.lockedContent.includes(contentId);
}


// ============================================================
// CHOICE HISTORY QUERIES
// Let any system ask "did the player do X?"
// ============================================================

function madeChoice(state, choiceId) {
  initConsequenceState(state);
  return state.choiceHistory.some(h => h.choiceId === choiceId);
}

function madeChoiceWithOption(state, choiceId, optionId) {
  initConsequenceState(state);
  return state.choiceHistory.some(h => h.choiceId === choiceId && h.option === optionId);
}

function getChoicesMade(state, filterFn) {
  initConsequenceState(state);
  if (typeof filterFn === 'function') {
    return state.choiceHistory.filter(filterFn);
  }
  return state.choiceHistory.slice();
}

function getChoiceCount(state) {
  initConsequenceState(state);
  return state.choiceHistory.length;
}

function getRecentChoices(state, count) {
  initConsequenceState(state);
  return state.choiceHistory.slice(-Math.abs(count || 10));
}


// ============================================================
// CONSEQUENCE BUILDER
// Fluent API for constructing consequence objects in mission
// and encounter code. Prevents typos and makes intent clear.
//
// Usage:
//   const c = new ConsequenceBuilder()
//     .addTrait('ruthless', 1)
//     .removeTrait('merciful')
//     .modStat('heat', 5)
//     .modCash(-5000)
//     .modFaction('colombian_cartel', -20)
//     .unlockContent('mission_cartel_revenge')
//     .lockContent('mission_peace_talks')
//     .modCrewLoyalty(-5)
//     .grantAbility('intimidation_bonus_10')
//     .setMessage('Your ruthless act spreads fear...')
//     .addDelay(3, 'cartel_retaliation')
//     .build();
// ============================================================

function ConsequenceBuilder() {
  this._data = {};
}

ConsequenceBuilder.prototype.addTrait = function(traitId, value) {
  if (!this._data.traits) this._data.traits = {};
  this._data.traits[traitId] = value !== undefined ? value : true;
  return this;
};

ConsequenceBuilder.prototype.removeTrait = function(traitId) {
  if (!this._data.removeTraits) this._data.removeTraits = [];
  this._data.removeTraits.push(traitId);
  return this;
};

ConsequenceBuilder.prototype.modStat = function(statKey, delta) {
  if (!this._data.stats) this._data.stats = {};
  this._data.stats[statKey] = (this._data.stats[statKey] || 0) + delta;
  return this;
};

ConsequenceBuilder.prototype.modCash = function(amount) {
  this._data.cash = (this._data.cash || 0) + amount;
  return this;
};

ConsequenceBuilder.prototype.modFaction = function(factionId, delta) {
  if (!this._data.faction) this._data.faction = {};
  this._data.faction[factionId] = (this._data.faction[factionId] || 0) + delta;
  return this;
};

ConsequenceBuilder.prototype.unlockContent = function(contentId) {
  if (!this._data.unlock) this._data.unlock = [];
  this._data.unlock.push(contentId);
  return this;
};

ConsequenceBuilder.prototype.lockContent = function(contentId) {
  if (!this._data.lock) this._data.lock = [];
  this._data.lock.push(contentId);
  return this;
};

ConsequenceBuilder.prototype.modCrewLoyalty = function(delta) {
  if (!this._data.crew) this._data.crew = {};
  this._data.crew.loyalty = (this._data.crew.loyalty || 0) + delta;
  return this;
};

ConsequenceBuilder.prototype.modCrewMorale = function(delta) {
  if (!this._data.crew) this._data.crew = {};
  this._data.crew.morale = (this._data.crew.morale || 0) + delta;
  return this;
};

ConsequenceBuilder.prototype.killRandomCrew = function() {
  if (!this._data.crew) this._data.crew = {};
  this._data.crew.killRandom = true;
  return this;
};

ConsequenceBuilder.prototype.grantAbility = function(abilityId) {
  if (!this._data.ability) this._data.ability = [];
  if (Array.isArray(this._data.ability)) {
    this._data.ability.push(abilityId);
  } else {
    this._data.ability = [this._data.ability, abilityId];
  }
  return this;
};

ConsequenceBuilder.prototype.revokeAbility = function(abilityId) {
  if (!this._data.removeAbility) this._data.removeAbility = [];
  if (Array.isArray(this._data.removeAbility)) {
    this._data.removeAbility.push(abilityId);
  } else {
    this._data.removeAbility = [this._data.removeAbility, abilityId];
  }
  return this;
};

ConsequenceBuilder.prototype.giveItem = function(itemId, qty) {
  if (!this._data.giveItems) this._data.giveItems = {};
  this._data.giveItems[itemId] = (this._data.giveItems[itemId] || 0) + (qty || 1);
  return this;
};

ConsequenceBuilder.prototype.removeItem = function(itemId, qty) {
  if (!this._data.removeItems) this._data.removeItems = {};
  this._data.removeItems[itemId] = (this._data.removeItems[itemId] || 0) + (qty || 1);
  return this;
};

ConsequenceBuilder.prototype.giveDrugs = function(drugId, amount) {
  if (!this._data.drugs) this._data.drugs = {};
  this._data.drugs[drugId] = (this._data.drugs[drugId] || 0) + amount;
  return this;
};

ConsequenceBuilder.prototype.awardXP = function(amount) {
  this._data.xp = (this._data.xp || 0) + amount;
  return this;
};

ConsequenceBuilder.prototype.setMessage = function(msg) {
  this._data.message = msg;
  return this;
};

ConsequenceBuilder.prototype.setFlag = function(flagId, value) {
  if (!this._data.flags) this._data.flags = {};
  this._data.flags[flagId] = value !== undefined ? value : true;
  return this;
};

ConsequenceBuilder.prototype.addDelay = function(days, eventId, data, consequences) {
  if (!this._data.delay) this._data.delay = [];
  const entry = { days: days, event: eventId };
  if (data) entry.data = data;
  if (consequences) entry.consequences = consequences;
  this._data.delay.push(entry);
  return this;
};

ConsequenceBuilder.prototype.build = function() {
  // Normalize single-element arrays
  if (Array.isArray(this._data.ability) && this._data.ability.length === 1) {
    this._data.ability = this._data.ability[0];
  }
  if (Array.isArray(this._data.removeAbility) && this._data.removeAbility.length === 1) {
    this._data.removeAbility = this._data.removeAbility[0];
  }
  if (Array.isArray(this._data.delay) && this._data.delay.length === 1) {
    this._data.delay = this._data.delay[0];
  }
  return this._data;
};


// ============================================================
// INTERNAL HELPERS
// ============================================================

// Create a compact summary of a consequence object for storage
// in choiceHistory (avoids bloating save files with full objects)
function _summarizeConsequences(consequenceObj) {
  const summary = {};
  const c = consequenceObj;

  if (c.traits)        summary.traits = Object.keys(c.traits);
  if (c.removeTraits)  summary.removedTraits = c.removeTraits;
  if (c.stats)         summary.stats = c.stats;
  if (c.cash)          summary.cash = c.cash;
  if (c.faction)       summary.faction = c.faction;
  if (c.unlock)        summary.unlocked = c.unlock;
  if (c.lock)          summary.locked = c.lock;
  if (c.crew)          summary.crew = true;
  if (c.ability)       summary.ability = c.ability;
  if (c.removeAbility) summary.removedAbility = c.removeAbility;
  if (c.delay)         summary.delayed = true;
  if (c.xp)            summary.xp = c.xp;
  if (c.flags)         summary.flags = Object.keys(c.flags);

  return summary;
}


// ============================================================
// CONSEQUENCE ENGINE STATUS / DIAGNOSTICS
// For debug UI, save game validation, and analytics.
// ============================================================

function getConsequenceStatus(state) {
  initConsequenceState(state);

  const traitList = getAllTraits(state);
  const abilityList = getActiveAbilities(state);

  return {
    totalTraits: traitList.length,
    traits: traitList,
    totalAbilities: abilityList.length,
    abilities: abilityList,
    pendingConsequences: state.pendingConsequences.length,
    pendingDetails: state.pendingConsequences.map(p => ({
      event: p.event,
      firesOnDay: p.triggerDay,
      daysRemaining: Math.max(0, p.triggerDay - (state.day || 1)),
      source: p.sourceChoice || 'unknown',
    })),
    totalChoicesMade: state.consequenceStats.totalChoicesMade,
    totalConsequencesApplied: state.consequenceStats.totalConsequencesApplied,
    totalDelayedFired: state.consequenceStats.totalDelayedFired,
    choiceHistoryLength: state.choiceHistory.length,
    unlockedContent: state.unlockedContent.length,
    lockedContent: state.lockedContent.length,
  };
}


// ============================================================
// TRAIT-BASED NARRATIVE FLAVOR
// Returns contextual strings that missions and encounters can
// weave into their dialogue based on who the player has become.
// ============================================================

function getTraitNarrativeFlavor(state) {
  initConsequenceState(state);

  const flavor = [];
  const t = state.playerTraits;

  // Ruthless reputation
  if (typeof t.ruthless === 'number' && t.ruthless >= 3) {
    flavor.push({ context: 'npc_greeting', text: 'They flinch when you enter the room. Your reputation precedes you.' });
    flavor.push({ context: 'negotiation', text: 'Nobody argues price with you anymore. They know what happens.' });
  } else if (t.ruthless) {
    flavor.push({ context: 'npc_greeting', text: 'There\'s a wariness in their eyes when they look at you.' });
  }

  // Merciful reputation
  if (t.merciful) {
    flavor.push({ context: 'npc_greeting', text: 'Word on the street is you\'re fair. People come to you for help.' });
    flavor.push({ context: 'crew_recruit', text: 'Your reputation for mercy makes people want to work for you.' });
  }

  // Police snitch
  if (t.police_snitch) {
    flavor.push({ context: 'faction_meeting', text: 'You can feel the distrust. Someone might know about your history with the cops.' });
    flavor.push({ context: 'crew_loyalty', text: 'Whispers follow you everywhere. "Snitch" is spray-painted on a wall nearby.' });
  }

  // Connected to cartel
  if (t.connected_cartel) {
    flavor.push({ context: 'npc_greeting', text: 'The Colombian flag pin on your lapel opens doors that money can\'t.' });
  }

  // Silver tongue
  if (typeof t.silver_tongue === 'number' && t.silver_tongue >= 3) {
    flavor.push({ context: 'negotiation', text: 'You could sell ice to a polar bear. Everyone knows it.' });
  }

  // Feared
  if (t.feared) {
    flavor.push({ context: 'territory', text: 'Street vendors lower their eyes as you pass. This is your territory.' });
    flavor.push({ context: 'combat_start', text: 'Your enemy hesitates. They\'ve heard the stories.' });
  }

  // Survivor
  if (t.survivor) {
    flavor.push({ context: 'near_death', text: 'Not today. You\'ve been here before, and you always walk away.' });
  }

  // Cop killer
  if (t.cop_killer) {
    flavor.push({ context: 'police_encounter', text: 'Every cop in the city knows your face. This won\'t end with a ticket.' });
  }

  return flavor;
}


// ============================================================
// BATCH CONSEQUENCE APPLICATION
// For complex narrative moments that trigger multiple
// consequence objects simultaneously (e.g., end-of-mission
// results that depend on multiple choice paths).
// ============================================================

function applyConsequenceBatch(state, consequenceArray, choiceId) {
  initConsequenceState(state);

  const allMessages = [];
  const allApplied = [];

  for (let i = 0; i < consequenceArray.length; i++) {
    const result = applyConsequences(
      state,
      consequenceArray[i],
      choiceId ? choiceId + '_batch_' + i : null,
      null
    );
    allMessages.push(...result.messages);
    allApplied.push(result.applied);
  }

  return { messages: allMessages, applied: allApplied };
}


// ============================================================
// CONDITIONAL CONSEQUENCES
// Apply different consequences based on current state.
// Used for branching outcomes where the result depends on
// traits, abilities, or other state the player has accumulated.
//
// Usage:
//   applyConditionalConsequences(state, [
//     { condition: { traits: { ruthless: true } }, consequences: { ... } },
//     { condition: { ability: 'silver_tongue_bonus' }, consequences: { ... } },
//     { fallback: true, consequences: { ... } },
//   ], 'choice_id');
// ============================================================

function applyConditionalConsequences(state, branches, choiceId) {
  initConsequenceState(state);

  for (const branch of branches) {
    if (branch.fallback) {
      return applyConsequences(state, branch.consequences, choiceId, 'fallback');
    }
    if (branch.condition) {
      const check = meetsRequirements(state, branch.condition);
      if (check.met) {
        return applyConsequences(state, branch.consequences, choiceId, branch.label || 'conditional');
      }
    }
  }

  return { messages: [], applied: {} };
}


// ============================================================
// REPUTATION-WEIGHTED CONSEQUENCES
// Scales consequence magnitudes based on player traits.
// A feared player gets more faction damage from hostile acts;
// a merciful player gets more trust from acts of kindness.
// ============================================================

function getConsequenceMultiplier(state, consequenceType) {
  initConsequenceState(state);

  let mult = 1.0;
  const t = state.playerTraits;

  switch (consequenceType) {
    case 'fear':
    case 'intimidation':
      if (t.feared) mult += 0.2;
      if (typeof t.ruthless === 'number') mult += Math.min(0.3, t.ruthless * 0.1);
      if (t.merciful) mult -= 0.15;
      break;

    case 'trust':
    case 'diplomacy':
      if (t.honorable) mult += 0.25;
      if (t.treacherous) mult -= 0.3;
      if (t.merciful) mult += 0.15;
      if (t.police_snitch) mult -= 0.4;
      break;

    case 'heat':
      if (t.ghost) mult -= 0.2;
      if (t.infamous) mult += 0.25;
      if (t.cop_killer) mult += 0.3;
      break;

    case 'crew_loyalty':
      if (t.respected) mult += 0.2;
      if (t.treacherous) mult -= 0.25;
      if (typeof t.ruthless === 'number' && t.ruthless >= 3) mult -= 0.1;
      break;

    case 'faction_positive':
      if (t.honorable) mult += 0.15;
      if (typeof t.silver_tongue === 'number') mult += Math.min(0.2, t.silver_tongue * 0.05);
      break;

    case 'faction_negative':
      if (t.feared) mult += 0.15;
      if (t.treacherous) mult += 0.2;
      break;

    default:
      break;
  }

  return Math.max(0.1, mult); // Floor at 10% to prevent zero-effect
}

/**
 * Get mechanical gameplay bonuses from accumulated traits.
 * Called by game-engine.js systems to apply trait effects to actual numbers.
 * Returns an object of bonus values (percentages as decimals, e.g., 0.05 = 5%).
 */
function getTraitBonuses(state) {
  if (!state || !state.playerTraits) return {};
  var t = state.playerTraits;
  var bonuses = {};

  // === TRADING ===
  // Entrepreneurial/businessman traits: better prices
  var bizLevel = (t.entrepreneurial || 0) + (t.businessman || 0);
  if (bizLevel >= 3) bonuses.buyDiscount = 0.05;  // 5% buy discount
  if (bizLevel >= 6) bonuses.buyDiscount = 0.10;   // 10% buy discount
  if (bizLevel >= 3) bonuses.sellBonus = 0.03;     // 3% sell premium
  if (bizLevel >= 6) bonuses.sellBonus = 0.07;     // 7% sell premium

  // Cunning/strategic: better deal detection
  var cunning = (t.cunning || 0) + (t.strategic || 0);
  if (cunning >= 3) bonuses.priceIntel = true;     // See price trends more accurately
  if (cunning >= 5) bonuses.ambushAvoidance = 0.25; // 25% less likely to be ambushed

  // === COMBAT ===
  // Violent/ruthless: more damage
  var violence = (t.violent || 0) + (t.ruthless || 0);
  if (violence >= 3) bonuses.combatDamage = 0.10;  // +10% combat damage
  if (violence >= 6) bonuses.combatDamage = 0.20;  // +20% combat damage
  if (violence >= 10) bonuses.combatDamage = 0.30; // +30% combat damage

  // Brave/heroic: better in fights, crew morale
  var bravery = (t.brave || 0) + (t.heroic || 0);
  if (bravery >= 3) bonuses.crewMorale = 3;        // +3 crew loyalty per day
  if (bravery >= 5) bonuses.combatAccuracy = 0.05;  // +5% hit chance

  // === SOCIAL ===
  // Diplomatic/networker: better faction relations
  var social = (t.diplomatic || 0) + (t.networker || 0);
  if (social >= 3) bonuses.factionGain = 0.20;     // +20% faction standing gains
  if (social >= 5) bonuses.bribeCostReduction = 0.15; // 15% cheaper bribes

  // Charitable/community_minded: community shield
  var charity = (t.charitable || 0) + (t.community_minded || 0) + (t.philanthropist || 0);
  if (charity >= 3) bonuses.heatReduction = 0.05;   // -5% daily heat
  if (charity >= 6) bonuses.heatReduction = 0.10;   // -10% daily heat
  if (charity >= 3) bonuses.communityProtection = true; // Community warns you about raids

  // Feared/ruthless: intimidation
  var fear = (t.feared || 0) + (t.ruthless || 0);
  if (fear >= 3) bonuses.intimidation = 10;         // +10 intimidation score
  if (fear >= 6) bonuses.intimidation = 20;         // +20 intimidation score
  if (fear >= 3) bonuses.territoryDefense = 5;      // +5 territory defense

  // === CRIMINAL ===
  // Criminal/predatory: better at illegal ops
  var criminal = (t.criminal || 0) + (t.predatory || 0);
  if (criminal >= 3) bonuses.heistSuccess = 0.05;   // +5% heist success
  if (criminal >= 5) bonuses.heistSuccess = 0.10;   // +10% heist success

  // Elusive/fugitive: escape artist
  var evasion = (t.elusive || 0) + (t.fugitive || 0) + (t.cautious || 0);
  if (evasion >= 3) bonuses.escapeChance = 0.10;    // +10% flee chance
  if (evasion >= 5) bonuses.escapeChance = 0.20;    // +20% flee chance

  // Leader/protector: crew management
  var leadership = (t.leader || 0) + (t.protector || 0);
  if (leadership >= 3) bonuses.crewSlots = 2;       // +2 crew slots
  if (leadership >= 6) bonuses.crewSlots = 5;       // +5 crew slots
  if (leadership >= 3) bonuses.crewLoyaltyDecay = -0.15; // 15% slower loyalty decay

  // Corruptor: cheaper bribes
  if ((t.corruptor || 0) >= 3) bonuses.bribeCostReduction = (bonuses.bribeCostReduction || 0) + 0.10;

  // Gambler/risk_taker: bigger payoffs but more variance
  var gambling = (t.gambler || 0) + (t.risk_taker || 0);
  if (gambling >= 3) bonuses.gamblingLuck = 0.10;   // +10% gambling outcomes
  if (gambling >= 5) bonuses.futuresBonus = 0.05;   // +5% futures profits

  // Snitch/cooperator: law enforcement benefits but street penalties
  if (t.snitch || t.cooperator || t.police_cooperator) {
    bonuses.courtBonus = 0.15;     // +15% court success
    bonuses.factionPenalty = -0.10; // -10% faction standing gains (streets don't trust you)
  }

  return bonuses;
}
