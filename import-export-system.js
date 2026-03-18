// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Import/Export Pipeline
// ============================================================

const INTERNATIONAL_SOURCES = [
  { id: 'colombia', name: 'Colombia', emoji: '🇨🇴', region: 'South America',
    drugs: ['cocaine'], priceMultiplier: 0.3, reliability: 0.85,
    minRep: 20, minAct: 2, desc: 'Direct from the source. Purest product.' },
  { id: 'mexico', name: 'Mexico', emoji: '🇲🇽', region: 'Central America',
    drugs: ['cocaine', 'weed', 'heroin'], priceMultiplier: 0.45, reliability: 0.75,
    minRep: 10, minAct: 2, desc: 'Cartel connections. Variety and volume.' },
  { id: 'afghanistan', name: 'Afghanistan', emoji: '🇦🇫', region: 'Middle East',
    drugs: ['heroin', 'opium', 'hashish'], priceMultiplier: 0.25, reliability: 0.6,
    minRep: 30, minAct: 3, desc: 'Golden Crescent. Cheap but risky.' },
  { id: 'netherlands', name: 'Netherlands', emoji: '🇳🇱', region: 'Europe',
    drugs: ['ecstasy', 'acid'], priceMultiplier: 0.5, reliability: 0.9,
    minRep: 25, minAct: 3, desc: 'European labs. Reliable quality.' },
  { id: 'thailand', name: 'Thailand', emoji: '🇹🇭', region: 'Southeast Asia',
    drugs: ['heroin', 'opium', 'meth'], priceMultiplier: 0.35, reliability: 0.7,
    minRep: 35, minAct: 3, desc: 'Golden Triangle connections.' },
  { id: 'jamaica', name: 'Jamaica', emoji: '🇯🇲', region: 'Caribbean',
    drugs: ['weed', 'hashish'], priceMultiplier: 0.4, reliability: 0.8,
    minRep: 5, minAct: 1, desc: 'Island ganja. Easy entry point.' },
  // NG+ only sources
  { id: 'peru', name: 'Peru', emoji: '🇵🇪', region: 'South America',
    drugs: ['cocaine'], priceMultiplier: 0.2, reliability: 0.65,
    minRep: 50, minAct: 3, ngPlusOnly: true, desc: 'Deep jungle labs. Cheapest cocaine.' },
  { id: 'myanmar', name: 'Myanmar', emoji: '🇲🇲', region: 'Southeast Asia',
    drugs: ['heroin', 'meth'], priceMultiplier: 0.2, reliability: 0.5,
    minRep: 60, minAct: 4, ngPlusOnly: true, desc: 'Shan State. High risk, huge reward.' },
  { id: 'morocco', name: 'Morocco', emoji: '🇲🇦', region: 'North Africa',
    drugs: ['hashish', 'weed'], priceMultiplier: 0.3, reliability: 0.75,
    minRep: 40, minAct: 3, ngPlusOnly: true, desc: 'Rif Mountains. Premium hashish.' },
];

const SHIPPING_METHODS = [
  { id: 'mule', name: 'Body Mule', emoji: '🚶',
    capacity: 5, speed: 1, cost: 500, riskBase: 0.08,
    desc: 'Small quantity, low profile. 1-day transit.' },
  { id: 'boat', name: 'Speedboat', emoji: '🚤',
    capacity: 50, speed: 2, cost: 5000, riskBase: 0.12,
    desc: 'Medium volume, moderate speed. 2-day transit.' },
  { id: 'container', name: 'Container Ship', emoji: '🚢',
    capacity: 200, speed: 5, cost: 20000, riskBase: 0.06,
    desc: 'Massive volume, slow. 5-day transit.' },
  { id: 'plane', name: 'Private Plane', emoji: '✈️',
    capacity: 30, speed: 1, cost: 15000, riskBase: 0.18,
    desc: 'Fast delivery, expensive. 1-day transit. High risk.' },
  { id: 'submarine', name: 'Narco Sub', emoji: '🔻',
    capacity: 150, speed: 4, cost: 50000, riskBase: 0.03,
    desc: 'Nearly undetectable. 4-day transit. Very expensive.' },
];

const PIPELINE_EVENTS = [
  { id: 'customs_raid', name: 'Customs Raid', chance: 0.15, effect: 'seized',
    msg: '🚨 Customs intercepted the shipment! Product seized.' },
  { id: 'coast_guard', name: 'Coast Guard Patrol', chance: 0.10, effect: 'delayed',
    msg: '⚓ Coast guard activity forces a detour. +2 days delay.' },
  { id: 'storm', name: 'Storm at Sea', chance: 0.08, effect: 'partial_loss',
    msg: '🌊 Storm damages part of the shipment. 30% loss.' },
  { id: 'corrupt_official', name: 'Friendly Official', chance: 0.12, effect: 'bonus',
    msg: '🤝 A corrupt customs agent waves the shipment through quickly.' },
  { id: 'political_crisis', name: 'Political Crisis', chance: 0.05, effect: 'route_blocked',
    msg: '🏛️ Political instability blocks the route for 10 days.' },
  { id: 'dea_tracking', name: 'DEA Surveillance', chance: 0.08, effect: 'heat',
    msg: '🕵️ DEA tracked the shipment. Federal heat increased significantly.' },
  { id: 'pirate_attack', name: 'Pirate Attack', chance: 0.04, effect: 'partial_loss',
    msg: '☠️ Pirates attacked the vessel! 40% of cargo stolen.' },
];

// ============================================================
// IMPORT/EXPORT STATE
// ============================================================
function initImportExportState() {
  return {
    unlockedSources: [], // source IDs player has connected with
    activeShipments: [], // in-transit shipments
    completedShipments: [], // arrived, ready to collect
    blockedRoutes: {}, // { sourceId: unblockedDay }
    totalImports: 0,
    totalExports: 0,
    totalSeized: 0,
    contactProgress: {}, // { sourceId: progress 0-100 }
    bribedOfficials: {}, // { sourceId: true }
  };
}

// ============================================================
// SOURCE AVAILABILITY
// ============================================================
function getAvailableSources(state) {
  const ie = state.importExport || {};
  const unlocked = ie.unlockedSources || [];
  const blocked = ie.blockedRoutes || {};

  return INTERNATIONAL_SOURCES.filter(src => {
    // NG+ only check
    if (src.ngPlusOnly && !state.newGamePlus) return false;
    // Act check
    const act = state.campaign ? (state.campaign.currentAct || 1) : 1;
    if (act < src.minAct) return false;
    return true;
  }).map(src => {
    const isUnlocked = unlocked.includes(src.id);
    const isBlocked = blocked[src.id] && state.day < blocked[src.id];
    const contactProg = (ie.contactProgress || {})[src.id] || 0;
    const repMet = (state.reputation || 0) >= src.minRep;
    return { ...src, isUnlocked, isBlocked, contactProgress: contactProg, repMet };
  });
}

// ============================================================
// ESTABLISH CONNECTION
// ============================================================
function progressSourceConnection(state, sourceId) {
  const source = INTERNATIONAL_SOURCES.find(s => s.id === sourceId);
  if (!source) return { success: false, msg: 'Unknown source' };

  if (!state.importExport) state.importExport = initImportExportState();
  const ie = state.importExport;

  if (ie.unlockedSources.includes(sourceId)) return { success: false, msg: 'Already connected' };

  // Check reputation
  if ((state.reputation || 0) < source.minRep) {
    return { success: false, msg: `Need ${source.minRep} reputation (have ${state.reputation || 0})` };
  }

  // Cost to make introductions
  const introductionCost = 2000 + source.minRep * 100;
  if (state.cash < introductionCost) {
    return { success: false, msg: `Need $${introductionCost.toLocaleString()} for introductions` };
  }

  state.cash -= introductionCost;

  // Progress the connection (takes multiple attempts)
  if (!ie.contactProgress) ie.contactProgress = {};
  const currentProg = ie.contactProgress[sourceId] || 0;
  const progressGain = 25 + Math.floor(Math.random() * 25); // 25-50% per attempt
  ie.contactProgress[sourceId] = Math.min(100, currentProg + progressGain);

  if (ie.contactProgress[sourceId] >= 100) {
    ie.unlockedSources.push(sourceId);
    // Immigrant character bonus
    if (state.characterId === 'immigrant' && ie.unlockedSources.length === 1) {
      ie.contactProgress[sourceId] = 100;
    }
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'streetCred', 5);
    }
    return { success: true, msg: `🌍 Connected with ${source.name} suppliers! You can now import ${source.drugs.join(', ')}.` };
  }

  return { success: true, msg: `📞 Making contacts in ${source.name}... ${ie.contactProgress[sourceId]}% connected. Cost: $${introductionCost.toLocaleString()}` };
}

// ============================================================
// ORDER SHIPMENT
// ============================================================
function orderShipment(state, sourceId, drugId, amount, methodId) {
  const source = INTERNATIONAL_SOURCES.find(s => s.id === sourceId);
  if (!source) return { success: false, msg: 'Unknown source' };

  if (!state.importExport) state.importExport = initImportExportState();
  const ie = state.importExport;

  if (!ie.unlockedSources.includes(sourceId)) return { success: false, msg: 'Not connected to this source' };

  // Check blocked
  if (ie.blockedRoutes[sourceId] && state.day < ie.blockedRoutes[sourceId]) {
    return { success: false, msg: `Route blocked until day ${ie.blockedRoutes[sourceId]}` };
  }

  // Check drug available from source
  if (!source.drugs.includes(drugId)) return { success: false, msg: `${source.name} doesn't supply ${drugId}` };

  // Check shipping method
  const method = SHIPPING_METHODS.find(m => m.id === methodId);
  if (!method) return { success: false, msg: 'Unknown shipping method' };
  if (amount > method.capacity) return { success: false, msg: `Max ${method.capacity} units via ${method.name}` };

  // Calculate cost
  const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === drugId) : null;
  const basePrice = drug ? (drug.minPrice + drug.maxPrice) / 2 : 5000;
  const drugCost = Math.round(basePrice * source.priceMultiplier * amount);
  const shippingCost = method.cost;
  const totalCost = drugCost + shippingCost;

  if (state.cash < totalCost) return { success: false, msg: `Need $${totalCost.toLocaleString()} (product: $${drugCost.toLocaleString()} + shipping: $${shippingCost.toLocaleString()})` };

  state.cash -= totalCost;

  // Create shipment
  const arrivalDay = state.day + method.speed;
  const shipment = {
    id: 'ship_' + Math.random().toString(36).substr(2, 8),
    sourceId,
    drugId,
    amount,
    methodId: method.id,
    methodName: method.name,
    cost: totalCost,
    departDay: state.day,
    arrivalDay,
    destinationId: state.currentLocation,
    status: 'in_transit',
    riskBase: method.riskBase,
  };

  ie.activeShipments.push(shipment);

  // Generate federal heat for large imports
  if (amount >= 50) {
    state.heat = Math.min(100, state.heat + 10);
    if (typeof adjustRep === 'function') {
      adjustRep(state, 'heatSignature', 8);
    }
  }

  return { success: true, msg: `📦 Shipment ordered! ${amount}× ${drugId} from ${source.name} via ${method.name}. Arrives day ${arrivalDay}. Cost: $${totalCost.toLocaleString()}` };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processImportExportDaily(state) {
  if (!state.importExport) return [];
  const ie = state.importExport;
  const msgs = [];

  const arrived = [];
  const ongoing = [];

  for (const shipment of ie.activeShipments) {
    if (state.day >= shipment.arrivalDay) {
      // Check for events
      const eventResult = processShipmentEvents(state, shipment);
      if (eventResult.msg) msgs.push(eventResult.msg);

      if (eventResult.status === 'seized') {
        ie.totalSeized += shipment.amount;
        msgs.push(`💀 Lost ${shipment.amount}× ${shipment.drugId} shipment from ${shipment.sourceId}`);
      } else if (eventResult.status === 'delayed') {
        shipment.arrivalDay += 2;
        ongoing.push(shipment);
      } else if (eventResult.status === 'route_blocked') {
        ie.blockedRoutes[shipment.sourceId] = state.day + 10;
        // Still deliver this one, but route is blocked for future
        shipment.status = 'arrived';
        shipment.finalAmount = shipment.amount;
        ie.completedShipments.push(shipment);
        ie.totalImports++;
      } else {
        // Successful delivery (possibly with partial loss)
        shipment.status = 'arrived';
        shipment.finalAmount = eventResult.finalAmount || shipment.amount;
        ie.completedShipments.push(shipment);
        ie.totalImports++;
        msgs.push(`📬 Shipment arrived! ${shipment.finalAmount}× ${shipment.drugId} from ${shipment.sourceId} ready for pickup.`);
      }
    } else {
      ongoing.push(shipment);
    }
  }

  ie.activeShipments = ongoing;

  // Unblock expired routes
  for (const [srcId, unblockedDay] of Object.entries(ie.blockedRoutes)) {
    if (state.day >= unblockedDay) delete ie.blockedRoutes[srcId];
  }

  return msgs;
}

function processShipmentEvents(state, shipment) {
  // Calculate interception risk
  let risk = shipment.riskBase;

  // Heat increases risk
  risk += (state.heat || 0) * 0.002;

  // NG+ modifier
  risk *= (typeof getNgPlusMod === 'function') ? getNgPlusMod(state, 'investigationRate', 1) : 1;

  // Bribed officials reduce risk
  const ie = state.importExport || {};
  if (ie.bribedOfficials && ie.bribedOfficials[shipment.sourceId]) {
    risk *= 0.5;
  }

  // Large shipments are riskier
  const method = SHIPPING_METHODS.find(m => m.id === shipment.methodId);
  if (method && shipment.amount > method.capacity * 0.8) risk *= 1.3;

  // Roll for events
  for (const evt of PIPELINE_EVENTS) {
    if (Math.random() < evt.chance * (risk / 0.1)) {
      if (evt.effect === 'seized') {
        // Federal heat
        state.heat = Math.min(100, state.heat + 20);
        if (typeof adjustRep === 'function') adjustRep(state, 'heatSignature', 15);
        return { status: 'seized', msg: evt.msg };
      }
      if (evt.effect === 'delayed') {
        return { status: 'delayed', msg: evt.msg };
      }
      if (evt.effect === 'partial_loss') {
        const lossPercent = evt.id === 'pirate_attack' ? 0.4 : 0.3;
        const finalAmount = Math.ceil(shipment.amount * (1 - lossPercent));
        return { status: 'ok', finalAmount, msg: evt.msg };
      }
      if (evt.effect === 'bonus') {
        return { status: 'ok', finalAmount: shipment.amount, msg: evt.msg };
      }
      if (evt.effect === 'route_blocked') {
        return { status: 'route_blocked', msg: evt.msg };
      }
      if (evt.effect === 'heat') {
        state.heat = Math.min(100, state.heat + 15);
        if (typeof adjustRep === 'function') adjustRep(state, 'heatSignature', 12);
        return { status: 'ok', finalAmount: shipment.amount, msg: evt.msg };
      }
    }
  }

  return { status: 'ok', finalAmount: shipment.amount };
}

// ============================================================
// COLLECT SHIPMENT
// ============================================================
function collectShipment(state, shipmentId) {
  if (!state.importExport) return { success: false, msg: 'No shipment' };
  const ie = state.importExport;
  const idx = ie.completedShipments.findIndex(s => s.id === shipmentId);
  if (idx === -1) return { success: false, msg: 'Shipment not found' };

  const shipment = ie.completedShipments[idx];
  const amount = shipment.finalAmount || shipment.amount;

  // Add to inventory
  state.inventory[shipment.drugId] = (state.inventory[shipment.drugId] || 0) + amount;

  ie.completedShipments.splice(idx, 1);

  return { success: true, msg: `Collected ${amount}× ${shipment.drugId} from ${shipment.sourceId} shipment.` };
}

// ============================================================
// BRIBE OFFICIALS
// ============================================================
function bribeCustomsOfficial(state, sourceId) {
  const source = INTERNATIONAL_SOURCES.find(s => s.id === sourceId);
  if (!source) return { success: false, msg: 'Unknown source' };
  if (!state.importExport) return { success: false, msg: 'No import connections' };

  const ie = state.importExport;
  if (ie.bribedOfficials && ie.bribedOfficials[sourceId]) {
    return { success: false, msg: 'Already have a contact on the inside' };
  }

  const cost = 5000 + source.minRep * 200;
  if (state.cash < cost) return { success: false, msg: `Need $${cost.toLocaleString()}` };

  state.cash -= cost;
  if (!ie.bribedOfficials) ie.bribedOfficials = {};
  ie.bribedOfficials[sourceId] = true;

  if (typeof adjustRep === 'function') {
    adjustRep(state, 'trust', 2);
  }

  return { success: true, msg: `🤝 Bribed customs official for ${source.name} route. Interception risk halved.` };
}

// ============================================================
// EXPORT (sell abroad for premium)
// ============================================================
function exportDrugs(state, drugId, amount, destinationId) {
  const source = INTERNATIONAL_SOURCES.find(s => s.id === destinationId);
  if (!source) return { success: false, msg: 'Unknown destination' };

  if (!state.importExport) return { success: false, msg: 'No connections' };
  if (!state.importExport.unlockedSources.includes(destinationId)) {
    return { success: false, msg: 'Not connected to this market' };
  }

  if ((state.inventory[drugId] || 0) < amount) {
    return { success: false, msg: `Don't have ${amount}× ${drugId}` };
  }

  // Export price: 1.5× to 2.5× of base price (selling at markup abroad)
  const drug = (typeof DRUGS !== 'undefined') ? DRUGS.find(d => d.id === drugId) : null;
  const basePrice = drug ? (drug.minPrice + drug.maxPrice) / 2 : 5000;
  const exportMultiplier = 1.5 + Math.random();
  const revenue = Math.round(basePrice * exportMultiplier * amount);

  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] <= 0) delete state.inventory[drugId];
  state.cash += revenue;

  state.importExport.totalExports++;

  // Heat and rep
  state.heat = Math.min(100, state.heat + 5);
  if (typeof adjustRep === 'function') {
    adjustRep(state, 'streetCred', 3);
    adjustRep(state, 'heatSignature', 5);
  }

  return { success: true, msg: `🌍 Exported ${amount}× ${drugId} to ${source.name} for $${revenue.toLocaleString()}` };
}
