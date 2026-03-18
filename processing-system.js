// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Processing & Crafting System
// ============================================================

const PROCESSING_RECIPES = [
  // Raw → Processed upgrades: input drug → output drug at higher value
  { id: 'refine_cocaine', name: 'Refine Cocaine', emoji: '⚗️',
    input: { cocaine: 10 }, output: { cocaine: 8 }, // 8 units of higher quality
    qualityBoost: 1.8, // output sells for 1.8× normal price
    skillReq: 2, timeHours: 4, labTier: 1,
    supplies: { chemicals: 2 }, heatGen: 3,
    desc: 'Purify raw cocaine into premium product' },
  { id: 'cook_meth', name: 'Cook Meth', emoji: '🧪',
    input: { meth: 5 }, output: { meth: 7 }, // higher yield
    qualityBoost: 1.6, skillReq: 3, timeHours: 8, labTier: 1,
    supplies: { chemicals: 3, equipment: 1 }, heatGen: 5,
    desc: 'Synthesize methamphetamine from precursors' },
  { id: 'press_ecstasy', name: 'Press Ecstasy', emoji: '💊',
    input: { ecstasy: 8 }, output: { ecstasy: 12 }, // bulk pressing
    qualityBoost: 1.4, skillReq: 2, timeHours: 3, labTier: 1,
    supplies: { chemicals: 1 }, heatGen: 2,
    desc: 'Press loose MDMA into branded pills' },
  { id: 'cut_heroin', name: 'Cut & Package Heroin', emoji: '💉',
    input: { heroin: 5 }, output: { heroin: 8 }, // cutting increases volume
    qualityBoost: 1.2, skillReq: 1, timeHours: 2, labTier: 1,
    supplies: { chemicals: 1 }, heatGen: 2,
    desc: 'Cut and package heroin for street distribution' },
  { id: 'process_opium', name: 'Process Opium', emoji: '🌿',
    input: { opium: 10 }, output: { heroin: 4 },
    qualityBoost: 2.0, skillReq: 4, timeHours: 12, labTier: 2,
    supplies: { chemicals: 4, equipment: 2 }, heatGen: 6,
    desc: 'Convert raw opium into refined heroin' },
  { id: 'synthesize_lsd', name: 'Synthesize LSD', emoji: '🌈',
    input: { acid: 5 }, output: { acid: 10 },
    qualityBoost: 1.7, skillReq: 5, timeHours: 16, labTier: 2,
    supplies: { chemicals: 5, equipment: 3 }, heatGen: 4,
    desc: 'Advanced chemistry to produce high-grade LSD' },
  { id: 'extract_hashish', name: 'Extract Hash Oil', emoji: '🍯',
    input: { hashish: 10 }, output: { hashish: 6 },
    qualityBoost: 2.2, skillReq: 3, timeHours: 6, labTier: 1,
    supplies: { chemicals: 2, equipment: 1 }, heatGen: 3,
    desc: 'Extract concentrated hash oil from plant material' },
  { id: 'designer_blend', name: 'Designer Blend', emoji: '✨',
    input: { ecstasy: 5, cocaine: 3 }, output: { ecstasy: 10 },
    qualityBoost: 2.5, skillReq: 6, timeHours: 10, labTier: 3,
    supplies: { chemicals: 4, equipment: 3 }, heatGen: 7,
    desc: 'Create a premium designer party drug' },
  { id: 'crack_conversion', name: 'Cook Crack', emoji: '🔥',
    input: { cocaine: 5 }, output: { crack: 12 },
    qualityBoost: 1.3, skillReq: 1, timeHours: 1, labTier: 1,
    supplies: { chemicals: 1 }, heatGen: 4,
    desc: 'Convert powder cocaine into crack rocks' },
  { id: 'premium_weed', name: 'Premium Processing', emoji: '🌿',
    input: { weed: 15 }, output: { weed: 10 },
    qualityBoost: 2.0, skillReq: 2, timeHours: 24, labTier: 1,
    supplies: {}, heatGen: 1,
    desc: 'Cure and process cannabis into premium grade' },
];

const PROCESSING_SUPPLIES = {
  chemicals: { name: 'Lab Chemicals', emoji: '🧫', basePrice: 500, desc: 'Precursors and reagents' },
  equipment: { name: 'Lab Equipment', emoji: '🔬', basePrice: 2000, desc: 'Glassware and apparatus' },
};

const QUALITY_LEVELS = [
  { id: 'trash', name: 'Trash', emoji: '🗑️', multiplier: 0.4, minSkill: 0 },
  { id: 'low', name: 'Low Grade', emoji: '⬇️', multiplier: 0.7, minSkill: 0 },
  { id: 'standard', name: 'Standard', emoji: '➡️', multiplier: 1.0, minSkill: 1 },
  { id: 'high', name: 'High Grade', emoji: '⬆️', multiplier: 1.4, minSkill: 3 },
  { id: 'premium', name: 'Premium', emoji: '💎', multiplier: 1.8, minSkill: 5 },
  { id: 'legendary', name: 'Legendary', emoji: '👑', multiplier: 2.5, minSkill: 8 },
];

// ============================================================
// PROCESSING STATE
// ============================================================
function initProcessingState() {
  return {
    supplies: { chemicals: 0, equipment: 0 },
    activeJobs: [], // { recipeId, startDay, completionDay, locationId, quality }
    completedBatches: [], // ready for pickup
    totalBatchesCooked: 0,
    chemistryXp: 0, // 0-100, increases with successful processing
  };
}

// ============================================================
// CHEMISTRY SKILL
// ============================================================
function getChemistryLevel(state) {
  const processing = state.processing || {};
  const baseXp = processing.chemistryXp || 0;
  // Skill tree bonus
  const skillBonus = typeof getSkillEffect === 'function' ? getSkillEffect(state, 'chemistryBonus') || 0 : 0;
  // Character bonus (The Dropout gets chemistry bonus)
  const charBonus = (state.characterPassive === 'chemistry_boost') ? 1 : 0;
  return Math.min(10, Math.floor(baseXp / 10) + skillBonus + charBonus);
}

function gainChemistryXp(state, amount) {
  if (!state.processing) state.processing = initProcessingState();
  state.processing.chemistryXp = Math.min(100, (state.processing.chemistryXp || 0) + amount);
}

// ============================================================
// CAN PROCESS CHECK
// ============================================================
function canProcess(state, recipeId) {
  const recipe = PROCESSING_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { ok: false, reason: 'Unknown recipe' };

  // Check chemistry skill
  const chemLevel = getChemistryLevel(state);
  if (chemLevel < recipe.skillReq) return { ok: false, reason: `Need Chemistry ${recipe.skillReq} (have ${chemLevel})` };

  // Check lab tier
  const labTier = getLabTier(state, state.currentLocation);
  if (labTier < recipe.labTier) return { ok: false, reason: `Need Lab Tier ${recipe.labTier} (have ${labTier})` };

  // Check input drugs in inventory
  for (const [drugId, amount] of Object.entries(recipe.input)) {
    const have = (state.inventory[drugId] || 0);
    if (have < amount) return { ok: false, reason: `Need ${amount} ${drugId} (have ${have})` };
  }

  // Check supplies
  const processing = state.processing || {};
  const supplies = processing.supplies || {};
  for (const [supId, amount] of Object.entries(recipe.supplies || {})) {
    const have = supplies[supId] || 0;
    if (have < amount) return { ok: false, reason: `Need ${amount} ${PROCESSING_SUPPLIES[supId]?.name || supId} (have ${have})` };
  }

  // Check active job limit (max 2 concurrent)
  const activeJobs = processing.activeJobs || [];
  if (activeJobs.length >= 2) return { ok: false, reason: 'Already running 2 jobs' };

  return { ok: true };
}

function getLabTier(state, locationId) {
  if (!state.properties) return 0;
  let maxTier = 0;
  for (const [propId, prop] of Object.entries(state.properties)) {
    if (prop.locationId === locationId && prop.type === 'industrial') {
      maxTier = Math.max(maxTier, prop.tier || 1);
    }
  }
  return maxTier;
}

// ============================================================
// START PROCESSING
// ============================================================
function startProcessing(state, recipeId) {
  const check = canProcess(state, recipeId);
  if (!check.ok) return { success: false, msg: check.reason };

  const recipe = PROCESSING_RECIPES.find(r => r.id === recipeId);
  if (!state.processing) state.processing = initProcessingState();

  // Consume input drugs
  for (const [drugId, amount] of Object.entries(recipe.input)) {
    state.inventory[drugId] = (state.inventory[drugId] || 0) - amount;
    if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
  }

  // Consume supplies
  for (const [supId, amount] of Object.entries(recipe.supplies || {})) {
    state.processing.supplies[supId] = (state.processing.supplies[supId] || 0) - amount;
  }

  // Calculate quality based on chemistry skill + lab tier + randomness
  const chemLevel = getChemistryLevel(state);
  const labTier = getLabTier(state, state.currentLocation);
  const skillRatio = chemLevel / Math.max(1, recipe.skillReq);
  const qualityRoll = Math.random() * 0.4 + 0.6; // 0.6-1.0
  const qualityScore = Math.min(1.0, skillRatio * 0.6 + (labTier / 3) * 0.2 + qualityRoll * 0.2);

  let quality = 'standard';
  if (qualityScore >= 0.95) quality = 'legendary';
  else if (qualityScore >= 0.85) quality = 'premium';
  else if (qualityScore >= 0.7) quality = 'high';
  else if (qualityScore >= 0.5) quality = 'standard';
  else if (qualityScore >= 0.3) quality = 'low';
  else quality = 'trash';

  // Calculate completion day
  const timeDays = Math.max(1, Math.ceil(recipe.timeHours / 24));
  const completionDay = state.day + timeDays;

  const job = {
    recipeId: recipe.id,
    recipeName: recipe.name,
    startDay: state.day,
    completionDay,
    locationId: state.currentLocation,
    quality,
    output: { ...recipe.output },
    qualityBoost: recipe.qualityBoost,
  };

  state.processing.activeJobs.push(job);

  // Generate heat
  state.heat = Math.min(100, state.heat + recipe.heatGen);
  if (typeof adjustRep === 'function') {
    adjustRep(state, 'heatSignature', recipe.heatGen * 0.5);
  }

  return { success: true, msg: `Started ${recipe.name}! Quality: ${quality}. Ready on day ${completionDay}.` };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processProcessingDaily(state) {
  if (!state.processing) return [];
  const msgs = [];

  const completed = [];
  const ongoing = [];

  for (const job of state.processing.activeJobs) {
    if (state.day >= job.completionDay) {
      completed.push(job);
    } else {
      ongoing.push(job);
    }
  }

  state.processing.activeJobs = ongoing;

  for (const job of completed) {
    state.processing.completedBatches.push(job);
    state.processing.totalBatchesCooked = (state.processing.totalBatchesCooked || 0) + 1;
    gainChemistryXp(state, 5);
    msgs.push(`⚗️ ${job.recipeName} complete! Quality: ${job.quality}. Collect from inventory.`);
  }

  // Chemistry XP decay (slow - lose 1 XP per 30 days of inactivity)
  if (state.processing.activeJobs.length === 0 && state.processing.completedBatches.length === 0) {
    if (state.day % 30 === 0 && state.processing.chemistryXp > 0) {
      state.processing.chemistryXp = Math.max(0, state.processing.chemistryXp - 1);
    }
  }

  return msgs;
}

// ============================================================
// COLLECT COMPLETED BATCH
// ============================================================
function collectBatch(state, batchIndex) {
  if (!state.processing || !state.processing.completedBatches[batchIndex]) {
    return { success: false, msg: 'No batch to collect' };
  }

  const batch = state.processing.completedBatches[batchIndex];
  const qualityLevel = QUALITY_LEVELS.find(q => q.id === batch.quality) || QUALITY_LEVELS[2];

  // Add output drugs to inventory
  for (const [drugId, amount] of Object.entries(batch.output)) {
    const adjustedAmount = Math.round(amount * qualityLevel.multiplier);
    state.inventory[drugId] = (state.inventory[drugId] || 0) + adjustedAmount;
  }

  // Track quality bonus for price calculations
  if (!state.processedDrugs) state.processedDrugs = {};
  for (const drugId of Object.keys(batch.output)) {
    state.processedDrugs[drugId] = {
      quality: batch.quality,
      boost: batch.qualityBoost * qualityLevel.multiplier,
      expires: state.day + 30, // quality bonus lasts 30 days
    };
  }

  state.processing.completedBatches.splice(batchIndex, 1);
  gainChemistryXp(state, 2);

  // Rep boost for high quality
  if (qualityLevel.multiplier >= 1.4 && typeof adjustRep === 'function') {
    adjustRep(state, 'streetCred', 2);
  }

  return { success: true, msg: `Collected ${batch.recipeName} (${qualityLevel.emoji} ${qualityLevel.name})` };
}

// ============================================================
// BUY SUPPLIES
// ============================================================
function buySupply(state, supplyId, amount) {
  const supply = PROCESSING_SUPPLIES[supplyId];
  if (!supply) return { success: false, msg: 'Unknown supply' };

  const cost = supply.basePrice * amount;
  if (state.cash < cost) return { success: false, msg: `Need $${cost.toLocaleString()}` };

  if (!state.processing) state.processing = initProcessingState();
  state.cash -= cost;
  state.processing.supplies[supplyId] = (state.processing.supplies[supplyId] || 0) + amount;

  // Buying chemicals generates minor heat
  state.heat = Math.min(100, state.heat + amount);

  return { success: true, msg: `Bought ${amount}× ${supply.name} for $${cost.toLocaleString()}` };
}

// ============================================================
// GET PROCESSED DRUG PRICE MODIFIER
// ============================================================
function getProcessedDrugPriceMod(state, drugId) {
  if (!state.processedDrugs || !state.processedDrugs[drugId]) return 1;
  const pd = state.processedDrugs[drugId];
  if (state.day > pd.expires) {
    delete state.processedDrugs[drugId];
    return 1;
  }
  return pd.boost || 1;
}
