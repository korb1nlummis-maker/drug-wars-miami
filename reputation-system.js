/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Multi-Dimensional Reputation
   5 reputation dimensions with independent tracking
   ============================================================ */

const REP_DIMENSIONS = {
  streetCred: { name: 'Street Cred', emoji: '🔥', color: '#ff6b35', min: -100, max: 100, desc: 'How the criminal world respects you' },
  fear:       { name: 'Fear', emoji: '💀', color: '#ff3333', min: 0, max: 100, desc: 'How much people fear crossing you' },
  trust:      { name: 'Trust', emoji: '🤝', color: '#00f0ff', min: -100, max: 100, desc: 'How reliable you are perceived to be' },
  publicImage:{ name: 'Public Image', emoji: '📺', color: '#bf5fff', min: -100, max: 100, desc: 'How civilians and officials see you' },
  heatSignature:{ name: 'Heat Sig', emoji: '🚨', color: '#ff2d95', min: 0, max: 100, desc: 'How visible you are to law enforcement' },
};

const REP_LEVELS = [
  { threshold: -100, name: 'Despised', color: '#ff3333' },
  { threshold: -50,  name: 'Notorious', color: '#ff6b35' },
  { threshold: -20,  name: 'Distrusted', color: '#ff9500' },
  { threshold: -5,   name: 'Unknown', color: '#888888' },
  { threshold: 10,   name: 'Known', color: '#aaaaaa' },
  { threshold: 25,   name: 'Respected', color: '#00f0ff' },
  { threshold: 50,   name: 'Feared', color: '#bf5fff' },
  { threshold: 75,   name: 'Legendary', color: '#ffe600' },
  { threshold: 95,   name: 'Mythic', color: '#ff2d95' },
];

function initReputation() {
  return {
    streetCred: 0,
    fear: 0,
    trust: 0,
    publicImage: 0,
    heatSignature: 0,
  };
}

function adjustRep(state, dimension, amount) {
  if (!state.rep) state.rep = initReputation();
  const dim = REP_DIMENSIONS[dimension];
  if (!dim) return;
  state.rep[dimension] = Math.max(dim.min, Math.min(dim.max, (state.rep[dimension] || 0) + amount));
  // Recompute the legacy single reputation value
  state.reputation = computeReputation(state);
}

function computeReputation(state) {
  if (!state.rep) return state.reputation || 0;
  // Weighted average: streetCred and trust matter most
  return Math.round(
    (state.rep.streetCred || 0) * 0.35 +
    (state.rep.fear || 0) * 0.15 +
    (state.rep.trust || 0) * 0.30 +
    (state.rep.publicImage || 0) * 0.20
  );
}

function getRepLevel(state, dimension) {
  if (!state.rep) return REP_LEVELS[3]; // Unknown
  const val = state.rep[dimension] || 0;
  let level = REP_LEVELS[0];
  for (const l of REP_LEVELS) {
    if (val >= l.threshold) level = l;
  }
  return level;
}

function getOverallRepLevel(state) {
  const rep = computeReputation(state);
  let level = REP_LEVELS[0];
  for (const l of REP_LEVELS) {
    if (rep >= l.threshold) level = l;
  }
  return level;
}

// Get all active reputation bonuses/penalties applied to gameplay
function getRepEffects(state) {
  if (!state.rep) return { buyMod: 0, sellMod: 0, encounterMod: 0, crewLoyaltyMod: 0, investigationMod: 0, heatDecayMod: 0 };

  const cred = state.rep.streetCred || 0;
  const fear = state.rep.fear || 0;
  const trust = state.rep.trust || 0;
  const pub = state.rep.publicImage || 0;
  const heat = state.rep.heatSignature || 0;

  return {
    // High street cred = better prices (-5% buy, +5% sell per 25 cred)
    buyMod: -(cred / 25) * 0.05,
    sellMod: (cred / 25) * 0.05,
    // High fear = fewer random encounters (-2% per 10 fear)
    encounterMod: -(fear / 10) * 0.02,
    // High trust = better crew loyalty (+1 per 20 trust)
    crewLoyaltyMod: Math.floor(trust / 20),
    // High heat signature = faster investigation gain (+5% per 10 heat sig)
    investigationMod: (heat / 10) * 0.05,
    // Good public image = faster heat decay (+3% per 10 public image)
    heatDecayMod: (pub > 0 ? pub / 10 : 0) * 0.03,
    // Low public image = more police attention
    policeAttentionMod: pub < -20 ? 0.15 : 0,
  };
}

// Process daily reputation changes (decay, etc.)
function processReputationDaily(state) {
  if (!state.rep) return;

  // Street cred decays slightly toward 0 if very high or very low
  if (Math.abs(state.rep.streetCred) > 50) {
    state.rep.streetCred += state.rep.streetCred > 0 ? -0.5 : 0.5;
  }

  // Fear decays slowly
  if (state.rep.fear > 10) {
    state.rep.fear = Math.max(0, state.rep.fear - 0.3);
  }

  // Trust is stable (doesn't decay much)

  // Public image drifts toward 0
  if (Math.abs(state.rep.publicImage) > 10) {
    state.rep.publicImage += state.rep.publicImage > 0 ? -0.2 : 0.2;
  }

  // Heat signature decays when laying low (no major actions)
  if (state.rep.heatSignature > 5) {
    state.rep.heatSignature = Math.max(0, state.rep.heatSignature - 0.5);
  }

  state.reputation = computeReputation(state);
}

// Map old-style reputation changes to new dimensions
// Called wherever the old code had `state.reputation += X`
function adjustRepFromAction(state, action, magnitude) {
  magnitude = magnitude || 1;
  switch (action) {
    case 'combat_victory':
      adjustRep(state, 'streetCred', 3 * magnitude);
      adjustRep(state, 'fear', 5 * magnitude);
      adjustRep(state, 'heatSignature', 4 * magnitude);
      break;
    case 'territory_claim':
      adjustRep(state, 'streetCred', 5 * magnitude);
      adjustRep(state, 'fear', 3 * magnitude);
      adjustRep(state, 'heatSignature', 5 * magnitude);
      break;
    case 'drug_sale':
      adjustRep(state, 'streetCred', 1 * magnitude);
      adjustRep(state, 'heatSignature', 1 * magnitude);
      break;
    case 'large_drug_sale':
      adjustRep(state, 'streetCred', 3 * magnitude);
      adjustRep(state, 'heatSignature', 4 * magnitude);
      break;
    case 'front_business':
      adjustRep(state, 'publicImage', 3 * magnitude);
      adjustRep(state, 'heatSignature', -1 * magnitude);
      break;
    case 'cop_kill':
      adjustRep(state, 'fear', 10 * magnitude);
      adjustRep(state, 'heatSignature', 15 * magnitude);
      adjustRep(state, 'publicImage', -10 * magnitude);
      break;
    case 'bribe_success':
      adjustRep(state, 'heatSignature', -3 * magnitude);
      adjustRep(state, 'publicImage', -1 * magnitude);
      break;
    case 'informant_deal':
      adjustRep(state, 'streetCred', -15 * magnitude);
      adjustRep(state, 'trust', -20 * magnitude);
      adjustRep(state, 'fear', -10 * magnitude);
      break;
    case 'court_acquittal':
      adjustRep(state, 'publicImage', 3 * magnitude);
      adjustRep(state, 'streetCred', 2 * magnitude);
      break;
    case 'prison_no_snitch':
      adjustRep(state, 'streetCred', 10 * magnitude);
      adjustRep(state, 'trust', 15 * magnitude);
      adjustRep(state, 'fear', 5 * magnitude);
      break;
    case 'crew_hire':
      adjustRep(state, 'streetCred', 1 * magnitude);
      break;
    case 'crew_fire':
      adjustRep(state, 'trust', -2 * magnitude);
      break;
    case 'crew_death':
      adjustRep(state, 'trust', -3 * magnitude);
      break;
    case 'general_positive':
      adjustRep(state, 'streetCred', 2 * magnitude);
      break;
    case 'general_negative':
      adjustRep(state, 'streetCred', -2 * magnitude);
      break;
    default:
      // Fallback: just adjust street cred
      adjustRep(state, 'streetCred', magnitude);
  }
}

// Render a mini rep bar for the status area
function renderRepTooltipHTML(state) {
  if (!state.rep) return '';
  let html = '<div class="rep-tooltip">';
  for (const [key, dim] of Object.entries(REP_DIMENSIONS)) {
    const val = state.rep[key] || 0;
    const pct = dim.min < 0 ? ((val + 100) / 200) * 100 : (val / dim.max) * 100;
    const level = getRepLevel(state, key);
    html += `<div class="rep-row">
      <span class="rep-label">${dim.emoji} ${dim.name}</span>
      <span style="color:${level.color}">${level.name}</span>
      <span class="rep-meter"><span class="rep-fill" style="width:${pct}%;background:${dim.color}"></span></span>
      <span style="color:${dim.color}">${val > 0 ? '+' : ''}${Math.round(val)}</span>
    </div>`;
  }
  html += '</div>';
  return html;
}
