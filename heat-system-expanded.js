// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Expanded Heat System
// 3-Tier: Local Police → City Task Force → Federal (DEA/FBI)
// Investigation, Wiretaps, Informants
// ============================================================

const HEAT_TIERS = [
  {
    id: 'local', name: 'Local Police', emoji: '🚔',
    range: [0, 40],
    desc: 'Beat cops and local precinct. Random patrols, traffic stops, noise complaints.',
    effects: {
      encounterTypes: ['patrol', 'traffic_stop', 'noise_complaint', 'suspicious_activity'],
      encounterChance: 0.03, // 3% per day base
      maxPenalty: 'arrest',
      bailRange: [500, 5000],
    },
    escalationThreshold: 40, // Heat level that triggers next tier
  },
  {
    id: 'city', name: 'City Task Force', emoji: '🚁',
    range: [41, 70],
    desc: 'Organized crime unit. Surveillance, informants, coordinated raids.',
    effects: {
      encounterTypes: ['surveillance', 'informant_approach', 'coordinated_raid', 'undercover_buy'],
      encounterChance: 0.05,
      maxPenalty: 'major_charges',
      bailRange: [10000, 50000],
      wiretapChance: 0.02, // Can tap your phones
      informantRecruitChance: 0.03, // Can turn your crew
    },
    escalationThreshold: 70,
  },
  {
    id: 'federal', name: 'Federal (DEA/FBI)', emoji: '🏛️',
    range: [71, 100],
    desc: 'Federal investigation. RICO, asset seizure, witness protection offers to your crew.',
    effects: {
      encounterTypes: ['rico_investigation', 'asset_seizure', 'witness_approach', 'federal_raid'],
      encounterChance: 0.08,
      maxPenalty: 'life_sentence',
      bailRange: [100000, 1000000],
      wiretapChance: 0.08,
      informantRecruitChance: 0.06,
      assetSeizureChance: 0.02, // Can seize properties/cash
    },
    escalationThreshold: 100, // Max
  },
];

const HEAT_SOURCES = {
  // Action -> heat gained
  street_deal: { heat: 1, desc: 'Street dealing' },
  bulk_deal: { heat: 3, desc: 'Bulk transaction' },
  combat_kill: { heat: 5, desc: 'Killing in combat' },
  body_discovered: { heat: 8, desc: 'Body discovered' },
  territory_claim: { heat: 3, desc: 'Claiming territory' },
  turf_war: { heat: 4, desc: 'Turf war' },
  police_chase: { heat: 6, desc: 'Police chase' },
  resist_arrest: { heat: 10, desc: 'Resisting arrest' },
  bribe_fail: { heat: 5, desc: 'Failed bribe attempt' },
  lab_operation: { heat: 4, desc: 'Lab processing' },
  import_operation: { heat: 6, desc: 'Import smuggling' },
  loud_weapon: { heat: 3, desc: 'Loud weapon use' },
  witness: { heat: 2, desc: 'Witnessed by civilian' },
  flashy_lifestyle: { heat: 2, desc: 'Conspicuous spending' },
};

const HEAT_REDUCTION = {
  safe_house: { heat: -2, desc: 'Safe house per day' },
  bribe_success: { heat: -8, desc: 'Successful bribe' },
  burner_phone: { heat: -5, desc: 'Burner phone used' },
  lay_low: { heat: -3, desc: 'Laying low (no crimes)' },
  front_business: { heat: -1, desc: 'Front business cover per day' },
  lawyer: { heat: -5, desc: 'Lawyer intervention' },
  natural_decay: { heat: -1, desc: 'Natural heat decay per day' },
  political_favor: { heat: -10, desc: 'Political protection' },
  stealth_skill: { heat: -1, desc: 'Stealth skill passive' },
};

// Wiretap system
const WIRETAP_CONFIG = {
  detectionChance: 0.05, // 5% chance per day to detect if you have equipment
  duration: 14, // Days wiretap is active
  evidenceRate: 0.1, // Evidence gathered per day
  maxEvidence: 1.0, // At 1.0, arrest warrant issued
  counterMeasures: {
    encrypted_phone: 0.5, // Halves evidence gathering
    counter_surveillance: 0.3, // Reduces to 30%
    sweep_equipment: 0.0, // Eliminates wiretap
  },
};

// Investigation system (expanded)
const INVESTIGATION_CONFIG_EXPANDED = {
  levels: [
    { id: 'clean', name: 'Clean', emoji: '✅', minEvidence: 0, desc: 'No active investigation.' },
    { id: 'person_of_interest', name: 'Person of Interest', emoji: '👁️', minEvidence: 0.1, desc: 'You\'ve appeared on radar. Routine checks.' },
    { id: 'under_surveillance', name: 'Under Surveillance', emoji: '📡', minEvidence: 0.3, desc: 'Active surveillance. They\'re watching.' },
    { id: 'active_investigation', name: 'Active Investigation', emoji: '🔍', minEvidence: 0.5, desc: 'Full investigation. Evidence being compiled.' },
    { id: 'grand_jury', name: 'Grand Jury', emoji: '⚖️', minEvidence: 0.7, desc: 'Grand jury convened. Indictment likely.' },
    { id: 'warrant_issued', name: 'Warrant Issued', emoji: '📋', minEvidence: 0.9, desc: 'Arrest warrant issued. Arrest imminent.' },
    { id: 'rico', name: 'RICO Indictment', emoji: '🏛️', minEvidence: 1.0, desc: 'Federal RICO case. Everything you built is at risk.' },
  ],
  evidenceDecay: 0.005, // Evidence decays slowly if heat stays low
  evidenceGainPerDay: 0.01, // Base evidence gain when heat > 50
};

// Initialize expanded heat state
function initHeatStateExpanded() {
  return {
    local: 0,
    city: 0,
    federal: 0,
    totalHeat: 0,
    // Investigation
    evidence: 0,
    investigationLevel: 'clean',
    investigationDay: 0,
    // Wiretaps
    activeWiretaps: [],
    wiretapDetected: false,
    // Informants
    knownInformants: [],
    suspectedInformants: [],
    // History
    heatHistory: [], // { day, heat, source }
    encountersAvoided: 0,
    encountersFaced: 0,
    // Active effects
    layingLow: false,
    politicalProtection: false,
    lawyerRetainer: false,
  };
}

// Get current heat tier
function getCurrentHeatTier(state) {
  const heat = state.heat || 0;
  for (let i = HEAT_TIERS.length - 1; i >= 0; i--) {
    if (heat >= HEAT_TIERS[i].range[0]) return HEAT_TIERS[i];
  }
  return HEAT_TIERS[0];
}

// Add heat from a source
function addHeatFromSource(state, sourceId) {
  const source = HEAT_SOURCES[sourceId];
  if (!source) return 0;

  let heatGain = source.heat;

  // Stealth skill reduction
  const stealthLevel = (state.skills && state.skills.stealth) || 0;
  if (stealthLevel > 0) {
    const reduction = stealthLevel * 0.10; // 10% per stealth level
    heatGain = Math.max(1, Math.floor(heatGain * (1 - reduction)));
  }

  // Silencer effect
  if (sourceId === 'combat_kill' && typeof hasItem === 'function' && hasItem(state, 'silencer')) {
    heatGain = 0;
  }

  // Apply
  state.heat = Math.min(100, (state.heat || 0) + heatGain);

  // Track in expanded heat state
  if (state.heatExpanded) {
    state.heatExpanded.totalHeat += heatGain;
    state.heatExpanded.heatHistory.push({ day: state.day, heat: heatGain, source: sourceId });
    if (state.heatExpanded.heatHistory.length > 100) {
      state.heatExpanded.heatHistory = state.heatExpanded.heatHistory.slice(-100);
    }

    // Distribute across tiers
    const tier = getCurrentHeatTier(state);
    if (tier.id === 'local') state.heatExpanded.local += heatGain;
    else if (tier.id === 'city') state.heatExpanded.city += heatGain;
    else state.heatExpanded.federal += heatGain;
  }

  return heatGain;
}

// Process daily heat mechanics
function processHeatDaily(state) {
  if (!state.heatExpanded) state.heatExpanded = initHeatStateExpanded();
  const msgs = [];
  const heat = state.heat || 0;
  const tier = getCurrentHeatTier(state);

  // Natural decay
  if (heat > 0) {
    let decay = 1;
    // Safe house bonus
    if (state.safehouse && state.safehouse.current) {
      const shTier = typeof SAFEHOUSE_TIERS !== 'undefined' ?
        SAFEHOUSE_TIERS.find(t => t.id === state.safehouse.current) : null;
      if (shTier) decay += shTier.heatReduction || 0;
    }
    // Front business cover
    if (state.frontBusinesses) {
      decay += Math.min(3, state.frontBusinesses.length * 0.5);
    }
    // Political protection
    if (state.heatExpanded.politicalProtection) decay += 3;
    // Laying low
    if (state.heatExpanded.layingLow) decay += 2;

    state.heat = Math.max(0, heat - decay);
  }

  // Evidence accumulation (investigation system)
  if (heat > 50) {
    const evidenceGain = INVESTIGATION_CONFIG_EXPANDED.evidenceGainPerDay * (heat / 50);
    state.heatExpanded.evidence = Math.min(1.0, state.heatExpanded.evidence + evidenceGain);

    // Counter-measures reduce evidence gain
    if (typeof hasEquipment === 'function' && hasEquipment(state, 'encrypted_phone')) {
      state.heatExpanded.evidence = Math.max(0, state.heatExpanded.evidence - evidenceGain * 0.5);
    }
  } else if (heat < 20) {
    // Evidence decays when heat is low
    state.heatExpanded.evidence = Math.max(0, state.heatExpanded.evidence - INVESTIGATION_CONFIG_EXPANDED.evidenceDecay);
  }

  // Update investigation level
  const oldLevel = state.heatExpanded.investigationLevel;
  for (let i = INVESTIGATION_CONFIG_EXPANDED.levels.length - 1; i >= 0; i--) {
    if (state.heatExpanded.evidence >= INVESTIGATION_CONFIG_EXPANDED.levels[i].minEvidence) {
      state.heatExpanded.investigationLevel = INVESTIGATION_CONFIG_EXPANDED.levels[i].id;
      break;
    }
  }
  if (state.heatExpanded.investigationLevel !== oldLevel && state.heatExpanded.investigationLevel !== 'clean') {
    const level = INVESTIGATION_CONFIG_EXPANDED.levels.find(l => l.id === state.heatExpanded.investigationLevel);
    if (level) {
      msgs.push(`${level.emoji} INVESTIGATION: ${level.name} — ${level.desc}`);
    }
  }

  // Wiretap checks
  if (tier.effects.wiretapChance && Math.random() < tier.effects.wiretapChance) {
    if (state.heatExpanded.activeWiretaps.length === 0) {
      state.heatExpanded.activeWiretaps.push({
        startDay: state.day,
        endDay: state.day + WIRETAP_CONFIG.duration,
        detected: false,
      });
      // Player might detect it
      if (typeof hasEquipment === 'function' && hasEquipment(state, 'scanner')) {
        if (Math.random() < 0.3) {
          state.heatExpanded.activeWiretaps[state.heatExpanded.activeWiretaps.length - 1].detected = true;
          msgs.push('📡 Your police scanner detected a wiretap on your communications!');
        }
      }
    }
  }

  // Police encounter check
  if (Math.random() < tier.effects.encounterChance * (heat / 50)) {
    // Stealth skill can avoid encounters
    const stealthLevel = (state.skills && state.skills.stealth) || 0;
    const avoidChance = stealthLevel * 0.08;
    if (Math.random() < avoidChance) {
      state.heatExpanded.encountersAvoided++;
      msgs.push('🥷 Your stealth skills helped you avoid a police encounter!');
    } else {
      state.heatExpanded.encountersFaced++;
      const encounter = tier.effects.encounterTypes[Math.floor(Math.random() * tier.effects.encounterTypes.length)];
      msgs.push(`${tier.emoji} ALERT: ${tier.name} — ${encounter.replace(/_/g, ' ')}!`);
      // Don't auto-resolve here — let the main game engine handle encounters
    }
  }

  // Informant recruitment attempts
  if (tier.effects.informantRecruitChance && state.henchmen && state.henchmen.length > 0) {
    if (Math.random() < tier.effects.informantRecruitChance) {
      // Check for low-loyalty crew members
      const vulnerableCrew = state.henchmen.filter(h => (h.loyalty || 50) < 40);
      if (vulnerableCrew.length > 0) {
        const target = vulnerableCrew[Math.floor(Math.random() * vulnerableCrew.length)];
        if (Math.random() < (100 - target.loyalty) / 200) {
          // Crew member flipped!
          state.heatExpanded.knownInformants.push(target.name || 'Unknown');
          msgs.push(`🐀 WARNING: Intelligence suggests someone in your crew may be cooperating with law enforcement!`);
        }
      }
    }
  }

  // Clean up expired wiretaps
  state.heatExpanded.activeWiretaps = state.heatExpanded.activeWiretaps.filter(w => state.day < w.endDay);

  return msgs;
}

// Get heat summary for UI
function getHeatSummary(state) {
  if (!state.heatExpanded) state.heatExpanded = initHeatStateExpanded();
  const tier = getCurrentHeatTier(state);
  const invLevel = INVESTIGATION_CONFIG_EXPANDED.levels.find(l => l.id === state.heatExpanded.investigationLevel) || INVESTIGATION_CONFIG_EXPANDED.levels[0];

  return {
    heat: state.heat || 0,
    tier: tier,
    investigation: invLevel,
    evidence: state.heatExpanded.evidence,
    activeWiretaps: state.heatExpanded.activeWiretaps.length,
    wiretapDetected: state.heatExpanded.activeWiretaps.some(w => w.detected),
    knownInformants: state.heatExpanded.knownInformants.length,
    encountersAvoided: state.heatExpanded.encountersAvoided,
    encountersFaced: state.heatExpanded.encountersFaced,
    layingLow: state.heatExpanded.layingLow,
    politicalProtection: state.heatExpanded.politicalProtection,
  };
}
