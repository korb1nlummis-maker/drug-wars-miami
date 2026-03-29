// ============================================================
// DRUG WARS: MIAMI VICE EDITION - World Regional Events
// Region-specific random events affecting prices, heat, and gameplay
// ============================================================

const WORLD_EVENTS = {
  caribbean: [
    { id: 'hurricane_season', name: 'Hurricane Warning', emoji: '🌀', chance: 0.04,
      effects: { supplyDrop: 30, priceSpike: 1.5, travelBlocked: true },
      desc: 'Major hurricane approaching. Shipping routes disrupted, prices surge.' },
    { id: 'coast_guard_patrol', name: 'Coast Guard Crackdown', emoji: '🚢', chance: 0.06,
      effects: { heatGain: 10, importRisk: 0.3 },
      desc: 'US Coast Guard increasing Caribbean patrols. Smuggling routes compromised.' },
    { id: 'island_festival', name: 'Carnival Season', emoji: '🎉', chance: 0.03,
      effects: { demandBoost: 25, ecstasyDemand: 40, policeReduced: true },
      desc: 'Carnival brings tourists flooding in. Party drug demand skyrockets.' },
    { id: 'dea_caribbean', name: 'DEA Caribbean Task Force', emoji: '🦅', chance: 0.03,
      effects: { heatGain: 15, raidChanceUp: 0.1 },
      desc: 'DEA deploys task force to Caribbean islands. Heat rising everywhere.' },
    { id: 'smuggler_route', name: 'New Smuggling Route Found', emoji: '🗺️', chance: 0.02,
      effects: { importCostDown: 0.2, supplyBoost: 20 },
      desc: 'Fishermen discover unpatrolled passage between islands.' },
  ],

  south_america: [
    { id: 'coca_burn', name: 'Coca Field Burn', emoji: '🔥', chance: 0.05,
      effects: { cocaineSupplyDrop: 40, cocainePriceSpike: 2.0 },
      desc: 'Government burns thousands of hectares of coca. Cocaine prices explode.' },
    { id: 'cartel_war_sa', name: 'Cartel Territorial War', emoji: '⚔️', chance: 0.04,
      effects: { dangerUp: 3, supplyChaos: true },
      desc: 'Two cartels clash over production territory. Supply lines in chaos.' },
    { id: 'political_coup', name: 'Political Instability', emoji: '🏛️', chance: 0.02,
      effects: { policeReduced: true, corruptionUp: 20 },
      desc: 'Government crisis. Police and military distracted. Corruption rampant.' },
    { id: 'jungle_lab_bust', name: 'Jungle Lab Discovered', emoji: '🧪', chance: 0.04,
      effects: { processingRisk: 0.2, methSupplyDrop: 25 },
      desc: 'Military raids hidden jungle processing labs. Production takes a hit.' },
    { id: 'new_coca_harvest', name: 'Bumper Coca Harvest', emoji: '🌿', chance: 0.03,
      effects: { cocaineSupplyBoost: 35, cocainePriceDrop: 0.6 },
      desc: 'Perfect growing season produces record coca yields. Prices plummet.' },
  ],

  central_america: [
    { id: 'gang_truce_ca', name: 'Gang Truce Declared', emoji: '🤝', chance: 0.02,
      effects: { dangerDown: 2, tradeBoost: true },
      desc: 'MS-13 and rival gangs declare temporary truce. Trade flows freely.' },
    { id: 'migration_crisis', name: 'Migration Crisis', emoji: '🚶', chance: 0.04,
      effects: { smugglingDemand: 30, policeDistracted: true },
      desc: 'Mass migration overwhelms authorities. Drug routes hide in migrant flows.' },
    { id: 'us_aid_crackdown', name: 'US Anti-Drug Aid Package', emoji: '🇺🇸', chance: 0.03,
      effects: { heatGain: 20, policeIntensityUp: true },
      desc: 'US funds new anti-narcotics operations across Central America.' },
    { id: 'tunnel_discovered', name: 'Smuggling Tunnel Found', emoji: '🕳️', chance: 0.03,
      effects: { importRisk: 0.15, routeBlocked: true },
      desc: 'Authorities discover major cross-border tunnel. Key route compromised.' },
  ],

  mexico: [
    { id: 'cartel_shootout', name: 'Cartel Shootout', emoji: '💥', chance: 0.06,
      effects: { dangerUp: 4, civilianCasualties: true, heatGain: 5 },
      desc: 'Rival cartels engage in broad daylight gun battle. Military responds.' },
    { id: 'border_lockdown', name: 'Border Lockdown', emoji: '🚧', chance: 0.04,
      effects: { travelBlocked: true, importRisk: 0.3, exportBlocked: true },
      desc: 'US-Mexico border sealed after intelligence tip. All crossings halted.' },
    { id: 'fentanyl_bust', name: 'Massive Fentanyl Seizure', emoji: '💊', chance: 0.04,
      effects: { fentanylSupplyDrop: 50, priceSurge: 1.8 },
      desc: 'Navy seizes record fentanyl shipment. Street prices go through the roof.' },
    { id: 'narco_corrido', name: 'Narco Culture Surge', emoji: '🎵', chance: 0.02,
      effects: { recruitmentBoost: true, repBonus: 5 },
      desc: 'New narco corridos glorify the trade. Recruitment easier, reputation grows.' },
    { id: 'military_ops', name: 'Military Operation', emoji: '🪖', chance: 0.05,
      effects: { heatGain: 25, raidChanceUp: 0.15, dangerUp: 2 },
      desc: 'Mexican military deploys to region. Helicopters, checkpoints everywhere.' },
  ],

  us_cities: [
    { id: 'dea_sweep', name: 'DEA Nationwide Sweep', emoji: '🦅', chance: 0.04,
      effects: { heatGain: 15, raidChanceUp: 0.1, suppliersBusted: true },
      desc: 'Coordinated DEA raids hit distribution networks across major cities.' },
    { id: 'gang_truce_us', name: 'Gang Peace Summit', emoji: '✌️', chance: 0.02,
      effects: { dangerDown: 2, tradeSafe: true },
      desc: 'Major gang leaders agree to temporary ceasefire. Streets calm down.' },
    { id: 'legalization_vote', name: 'Cannabis Legalization Vote', emoji: '🗳️', chance: 0.02,
      effects: { weedPriceDrop: 0.5, weedDemandDrop: 30 },
      desc: 'State legalizes recreational cannabis. Street weed prices crater.' },
    { id: 'opioid_crisis', name: 'Opioid Crisis Surge', emoji: '💉', chance: 0.04,
      effects: { heroinDemand: 40, fentanylDemand: 50, prescriptionDemand: 30 },
      desc: 'Opioid epidemic worsens. Demand for painkillers and heroin surges.' },
    { id: 'rap_influence', name: 'Trap Music Boom', emoji: '🎤', chance: 0.02,
      effects: { weedDemand: 20, leanDemand: 30, repBonus: 3 },
      desc: 'New trap album drops glorifying the lifestyle. Street cred opportunities.' },
  ],

  western_europe: [
    { id: 'interpol_operation', name: 'Interpol Operation', emoji: '🔵', chance: 0.04,
      effects: { heatGain: 20, crossBorderRisk: 0.2 },
      desc: 'Interpol coordinates multi-country operation targeting drug networks.' },
    { id: 'port_seizure', name: 'Major Port Seizure', emoji: '📦', chance: 0.05,
      effects: { cocaineSupplyDrop: 35, importRisk: 0.25 },
      desc: 'Customs intercepts massive cocaine shipment at European port.' },
    { id: 'rave_culture', name: 'Festival Season', emoji: '🎧', chance: 0.03,
      effects: { ecstasyDemand: 40, ketamineDemand: 30, policeReduced: true },
      desc: 'Summer festival season across Europe. Party drug demand peaks.' },
    { id: 'brexit_chaos', name: 'Border Policy Change', emoji: '🇪🇺', chance: 0.02,
      effects: { smugglingOpportunity: true, importCostDown: 0.15 },
      desc: 'New border policies create gaps in customs enforcement.' },
    { id: 'encrochat_bust', name: 'Encrypted Phone Bust', emoji: '📱', chance: 0.03,
      effects: { heatGain: 30, networkExposed: true },
      desc: 'Police crack encrypted communications platform. Networks exposed.' },
  ],

  eastern_europe: [
    { id: 'bratva_war', name: 'Bratva Power Struggle', emoji: '🐻', chance: 0.04,
      effects: { dangerUp: 3, weaponPriceDrop: 0.5 },
      desc: 'Russian mafia internal war. Weapons flooding the black market.' },
    { id: 'conflict_zone', name: 'Regional Conflict Escalation', emoji: '💣', chance: 0.03,
      effects: { policeReduced: true, weaponsDemand: 40, dangerUp: 5 },
      desc: 'Armed conflict escalates. Law enforcement diverted to military operations.' },
    { id: 'heroin_route', name: 'Balkan Route Reopened', emoji: '🛤️', chance: 0.03,
      effects: { heroinSupplyBoost: 30, heroinPriceDrop: 0.7 },
      desc: 'Classic Balkan heroin route from Afghanistan reopened by smugglers.' },
    { id: 'synth_lab_boom', name: 'Synthetic Drug Lab Boom', emoji: '🧪', chance: 0.03,
      effects: { methSupplyBoost: 25, ecstasySupplyBoost: 20 },
      desc: 'Abandoned factories converted to massive synthetic drug labs.' },
  ],

  west_africa: [
    { id: 'military_checkpoint', name: 'Military Checkpoint', emoji: '🪖', chance: 0.05,
      effects: { travelSlow: true, bribeCost: 5000 },
      desc: 'Military sets up checkpoints on major routes. Bribes required to pass.' },
    { id: 'corruption_scandal', name: 'Government Corruption Exposed', emoji: '📰', chance: 0.03,
      effects: { corruptionDown: 10, policeIntensityUp: true },
      desc: 'International media exposes drug-government ties. Temporary crackdown.' },
    { id: 'new_route_africa', name: 'New Atlantic Route', emoji: '🌊', chance: 0.02,
      effects: { importCostDown: 0.2, cocaineFlowing: true },
      desc: 'South American cartels establish new Atlantic cocaine highway via Africa.' },
    { id: 'pirate_attack', name: 'Gulf of Guinea Pirates', emoji: '🏴‍☠️', chance: 0.04,
      effects: { importRisk: 0.2, shippingCostUp: 0.3 },
      desc: 'Pirates attacking cargo ships in Gulf of Guinea. Shipping costs rise.' },
  ],

  southeast_asia: [
    { id: 'junta_raid', name: 'Military Junta Raid', emoji: '🪖', chance: 0.04,
      effects: { heatGain: 15, dangerUp: 3, propertyRisk: true },
      desc: 'Military government raids suspected drug operations. No due process.' },
    { id: 'opium_harvest', name: 'Opium Harvest Season', emoji: '🌸', chance: 0.03,
      effects: { opiumSupplyBoost: 40, heroinPriceDrop: 0.6 },
      desc: 'Golden Triangle opium poppy harvest. Heroin supply floods the market.' },
    { id: 'triad_ceremony', name: 'Triad Initiation Ceremony', emoji: '🀄', chance: 0.02,
      effects: { factionRelationShift: true, recruitmentBoost: true },
      desc: 'Major Triad ceremony signals shifting alliances. New opportunities emerge.' },
    { id: 'meth_superlab', name: 'Meth Superlab Discovery', emoji: '💎', chance: 0.03,
      effects: { methSupplyBoost: 50, methPriceDrop: 0.5 },
      desc: 'Industrial-scale meth superlab floods Southeast Asian markets.' },
    { id: 'duterte_style', name: 'Anti-Drug War Escalation', emoji: '⚠️', chance: 0.03,
      effects: { dangerUp: 5, heatGain: 25, civilianRisk: true },
      desc: 'Government launches brutal anti-drug campaign. Extrajudicial killings rise.' },
  ],
};

// Process world events daily
function processWorldEvents(state) {
  if (!state.worldState) return [];
  const msgs = [];
  const unlocked = state.worldState.unlockedRegions || ['miami'];

  for (const regionId of unlocked) {
    if (regionId === 'miami') continue; // Miami has its own event system
    const events = WORLD_EVENTS[regionId];
    if (!events) continue;

    for (const evt of events) {
      if (Math.random() < evt.chance) {
        // Apply event effects
        const result = applyWorldEventEffects(state, regionId, evt);
        if (result) {
          msgs.push(`🌐 [${regionId.replace(/_/g, ' ').toUpperCase()}] ${evt.emoji} ${evt.name}: ${evt.desc}`);
        }
        break; // Only one event per region per day
      }
    }
  }

  return msgs;
}

function applyWorldEventEffects(state, regionId, evt) {
  const effects = evt.effects;
  if (!effects) return false;

  // Heat effects
  if (effects.heatGain && state.heat !== undefined) {
    const currentLoc = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(l => l.id === state.currentLocation) : null;
    if (currentLoc && currentLoc.region === regionId) {
      state.heat = Math.min(100, (state.heat || 0) + effects.heatGain);
    }
  }

  // Danger level shifts
  if (effects.dangerUp && typeof LOCATIONS !== 'undefined') {
    LOCATIONS.forEach(loc => {
      if (loc.region === regionId) {
        loc._tempDangerBonus = (loc._tempDangerBonus || 0) + effects.dangerUp;
      }
    });
  }
  if (effects.dangerDown && typeof LOCATIONS !== 'undefined') {
    LOCATIONS.forEach(loc => {
      if (loc.region === regionId) {
        loc._tempDangerBonus = Math.max(0, (loc._tempDangerBonus || 0) - effects.dangerDown);
      }
    });
  }

  // Supply drop — reduce supply by lowering prices toward minPrice (scarcity = higher street price later,
  // but immediate effect is less product available, modeled as a supply modifier on worldState)
  if (effects.supplyDrop) {
    if (!state.worldState.supplyModifiers) state.worldState.supplyModifiers = {};
    const dropPct = effects.supplyDrop / 100; // e.g. 30 → 0.30
    state.worldState.supplyModifiers[regionId] = Math.max(0.1,
      (state.worldState.supplyModifiers[regionId] || 1.0) - dropPct);
  }

  // Supply boost — increase supply availability in the region
  if (effects.supplyBoost) {
    if (!state.worldState.supplyModifiers) state.worldState.supplyModifiers = {};
    const boostPct = effects.supplyBoost / 100; // e.g. 20 → 0.20
    state.worldState.supplyModifiers[regionId] = Math.min(2.0,
      (state.worldState.supplyModifiers[regionId] || 1.0) + boostPct);
  }

  // Price spike — multiply current drug prices upward for drugs in the region
  if (effects.priceSpike && state.prices && typeof DRUGS !== 'undefined') {
    const multiplier = effects.priceSpike; // e.g. 1.5
    DRUGS.forEach(drug => {
      if (state.prices[drug.id] != null) {
        state.prices[drug.id] = Math.min(drug.maxPrice * 2,
          Math.round(state.prices[drug.id] * multiplier));
      }
    });
  }

  // Price drop — reduce drug prices by a factor
  if (effects.priceDrop && state.prices && typeof DRUGS !== 'undefined') {
    const factor = effects.priceDrop; // e.g. 0.6 means prices drop to 60%
    DRUGS.forEach(drug => {
      if (state.prices[drug.id] != null) {
        state.prices[drug.id] = Math.max(drug.minPrice,
          Math.round(state.prices[drug.id] * factor));
      }
    });
  }

  // Import risk — increase shipment interception chance for the region
  if (effects.importRisk) {
    if (!state.worldState.importRiskModifiers) state.worldState.importRiskModifiers = {};
    state.worldState.importRiskModifiers[regionId] = Math.min(1.0,
      (state.worldState.importRiskModifiers[regionId] || 0) + effects.importRisk);
  }

  // Cocaine-specific supply drop — reduce cocaine supply and spike cocaine price
  if (effects.cocaineSupplyDrop && state.prices && typeof DRUGS !== 'undefined') {
    const cocaineDrug = DRUGS.find(d => d.id === 'cocaine');
    if (cocaineDrug && state.prices.cocaine != null) {
      const dropPct = effects.cocaineSupplyDrop / 100; // e.g. 40 → 0.40
      state.prices.cocaine = Math.min(cocaineDrug.maxPrice * 2,
        Math.round(state.prices.cocaine * (1 + dropPct)));
    }
  }

  // Cocaine price spike — explicit multiplier for cocaine
  if (effects.cocainePriceSpike && state.prices && typeof DRUGS !== 'undefined') {
    const cocaineDrug = DRUGS.find(d => d.id === 'cocaine');
    if (cocaineDrug && state.prices.cocaine != null) {
      state.prices.cocaine = Math.min(cocaineDrug.maxPrice * 2,
        Math.round(state.prices.cocaine * effects.cocainePriceSpike));
    }
  }

  // Cocaine supply boost — increase cocaine availability, lower price
  if (effects.cocaineSupplyBoost && state.prices && typeof DRUGS !== 'undefined') {
    const cocaineDrug = DRUGS.find(d => d.id === 'cocaine');
    if (cocaineDrug && state.prices.cocaine != null) {
      const boostPct = effects.cocaineSupplyBoost / 100;
      state.prices.cocaine = Math.max(cocaineDrug.minPrice,
        Math.round(state.prices.cocaine * (1 - boostPct)));
    }
  }

  // Cocaine price drop — explicit factor for cocaine
  if (effects.cocainePriceDrop && state.prices && typeof DRUGS !== 'undefined') {
    const cocaineDrug = DRUGS.find(d => d.id === 'cocaine');
    if (cocaineDrug && state.prices.cocaine != null) {
      state.prices.cocaine = Math.max(cocaineDrug.minPrice,
        Math.round(state.prices.cocaine * effects.cocainePriceDrop));
    }
  }

  // Meth supply drop — reduce meth availability, raise meth price
  if (effects.methSupplyDrop && state.prices && typeof DRUGS !== 'undefined') {
    const methDrug = DRUGS.find(d => d.id === 'methamphetamine');
    if (methDrug && state.prices.methamphetamine != null) {
      const dropPct = effects.methSupplyDrop / 100;
      state.prices.methamphetamine = Math.min(methDrug.maxPrice * 2,
        Math.round(state.prices.methamphetamine * (1 + dropPct)));
    }
  }

  // Meth supply boost — increase meth availability, lower meth price
  if (effects.methSupplyBoost && state.prices && typeof DRUGS !== 'undefined') {
    const methDrug = DRUGS.find(d => d.id === 'methamphetamine');
    if (methDrug && state.prices.methamphetamine != null) {
      const boostPct = effects.methSupplyBoost / 100;
      state.prices.methamphetamine = Math.max(methDrug.minPrice,
        Math.round(state.prices.methamphetamine * (1 - boostPct)));
    }
  }

  // Meth price drop — explicit factor for meth
  if (effects.methPriceDrop && state.prices && typeof DRUGS !== 'undefined') {
    const methDrug = DRUGS.find(d => d.id === 'methamphetamine');
    if (methDrug && state.prices.methamphetamine != null) {
      state.prices.methamphetamine = Math.max(methDrug.minPrice,
        Math.round(state.prices.methamphetamine * effects.methPriceDrop));
    }
  }

  // Fentanyl supply drop — reduce fentanyl availability, raise fentanyl price
  if (effects.fentanylSupplyDrop && state.prices && typeof DRUGS !== 'undefined') {
    const fentDrug = DRUGS.find(d => d.id === 'fentanyl');
    if (fentDrug && state.prices.fentanyl != null) {
      const dropPct = effects.fentanylSupplyDrop / 100;
      state.prices.fentanyl = Math.min(fentDrug.maxPrice * 2,
        Math.round(state.prices.fentanyl * (1 + dropPct)));
    }
  }

  // Price surge — general multiplier (used by fentanyl bust etc.)
  if (effects.priceSurge && state.prices && typeof DRUGS !== 'undefined') {
    const multiplier = effects.priceSurge;
    DRUGS.forEach(drug => {
      if (state.prices[drug.id] != null) {
        state.prices[drug.id] = Math.min(drug.maxPrice * 2,
          Math.round(state.prices[drug.id] * multiplier));
      }
    });
  }

  // Heroin supply boost — increase heroin availability, lower price
  if (effects.heroinSupplyBoost && state.prices && typeof DRUGS !== 'undefined') {
    const heroinDrug = DRUGS.find(d => d.id === 'heroin');
    if (heroinDrug && state.prices.heroin != null) {
      const boostPct = effects.heroinSupplyBoost / 100;
      state.prices.heroin = Math.max(heroinDrug.minPrice,
        Math.round(state.prices.heroin * (1 - boostPct)));
    }
  }

  // Heroin price drop — explicit factor for heroin
  if (effects.heroinPriceDrop && state.prices && typeof DRUGS !== 'undefined') {
    const heroinDrug = DRUGS.find(d => d.id === 'heroin');
    if (heroinDrug && state.prices.heroin != null) {
      state.prices.heroin = Math.max(heroinDrug.minPrice,
        Math.round(state.prices.heroin * effects.heroinPriceDrop));
    }
  }

  // Opium supply boost — increase opium availability, lower price
  if (effects.opiumSupplyBoost && state.prices && typeof DRUGS !== 'undefined') {
    const opiumDrug = DRUGS.find(d => d.id === 'opium');
    if (opiumDrug && state.prices.opium != null) {
      const boostPct = effects.opiumSupplyBoost / 100;
      state.prices.opium = Math.max(opiumDrug.minPrice,
        Math.round(state.prices.opium * (1 - boostPct)));
    }
  }

  // Ecstasy supply boost — increase ecstasy availability
  if (effects.ecstasySupplyBoost && state.prices && typeof DRUGS !== 'undefined') {
    const ecstasyDrug = DRUGS.find(d => d.id === 'ecstasy');
    if (ecstasyDrug && state.prices.ecstasy != null) {
      const boostPct = effects.ecstasySupplyBoost / 100;
      state.prices.ecstasy = Math.max(ecstasyDrug.minPrice,
        Math.round(state.prices.ecstasy * (1 - boostPct)));
    }
  }

  // Weed price drop — explicit factor for weed
  if (effects.weedPriceDrop && state.prices && typeof DRUGS !== 'undefined') {
    const weedDrug = DRUGS.find(d => d.id === 'weed');
    if (weedDrug && state.prices.weed != null) {
      state.prices.weed = Math.max(weedDrug.minPrice,
        Math.round(state.prices.weed * effects.weedPriceDrop));
    }
  }

  // Import cost reduction — lower import costs for the region
  if (effects.importCostDown) {
    if (!state.worldState.importCostModifiers) state.worldState.importCostModifiers = {};
    state.worldState.importCostModifiers[regionId] = Math.max(0.5,
      (state.worldState.importCostModifiers[regionId] || 1.0) - effects.importCostDown);
  }

  // Shipping cost increase
  if (effects.shippingCostUp) {
    if (!state.worldState.shippingCostModifiers) state.worldState.shippingCostModifiers = {};
    state.worldState.shippingCostModifiers[regionId] = Math.min(2.0,
      (state.worldState.shippingCostModifiers[regionId] || 1.0) + effects.shippingCostUp);
  }

  // Raid chance increase
  if (effects.raidChanceUp) {
    if (!state.worldState.raidChanceModifiers) state.worldState.raidChanceModifiers = {};
    state.worldState.raidChanceModifiers[regionId] = Math.min(1.0,
      (state.worldState.raidChanceModifiers[regionId] || 0) + effects.raidChanceUp);
  }

  // Processing risk — increase risk for lab/processing operations
  if (effects.processingRisk) {
    if (!state.worldState.processingRiskModifiers) state.worldState.processingRiskModifiers = {};
    state.worldState.processingRiskModifiers[regionId] = Math.min(1.0,
      (state.worldState.processingRiskModifiers[regionId] || 0) + effects.processingRisk);
  }

  // Store active events for UI display
  if (!state.worldState.activeEvents) state.worldState.activeEvents = {};
  state.worldState.activeEvents[regionId] = {
    id: evt.id,
    name: evt.name,
    emoji: evt.emoji,
    desc: evt.desc,
    day: state.day,
    expiresDay: state.day + 3 + Math.floor(Math.random() * 5), // 3-7 day duration
    effects: effects,
  };

  return true;
}

// Get active events for a region (for UI display)
function getActiveWorldEvents(state, regionId) {
  if (!state.worldState || !state.worldState.activeEvents) return null;
  const evt = state.worldState.activeEvents[regionId];
  if (!evt) return null;
  if (state.day > evt.expiresDay) {
    delete state.worldState.activeEvents[regionId];
    return null;
  }
  return evt;
}

// Clean up expired events
function cleanupWorldEvents(state) {
  if (!state.worldState || !state.worldState.activeEvents) return;
  for (const regionId of Object.keys(state.worldState.activeEvents)) {
    if (state.day > state.worldState.activeEvents[regionId].expiresDay) {
      // Revert temporary danger bonuses
      if (typeof LOCATIONS !== 'undefined') {
        LOCATIONS.forEach(loc => {
          if (loc.region === regionId) {
            delete loc._tempDangerBonus;
          }
        });
      }
      delete state.worldState.activeEvents[regionId];
    }
  }
}
