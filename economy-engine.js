/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Supply & Demand Economy
   Dynamic pricing based on player actions and market memory
   ============================================================ */

function initMarketMemory() {
  return {
    supply: {},       // { locationId: { drugId: level } } range 10-200, 100=normal
    demand: {},       // same structure
    playerSales: {},  // { locationId: { drugId: totalSoldRecent } }
    playerPurchases: {},
    priceHistory: {}, // { locationId: { drugId: [last5prices] } }
    lastUpdate: 0,
  };
}

// Get supply level for a drug at a location (100 = normal equilibrium)
function getSupplyLevel(state, locationId, drugId) {
  if (!state.marketMemory || !state.marketMemory.supply[locationId]) return 100;
  return state.marketMemory.supply[locationId][drugId] || 100;
}

// Get demand level for a drug at a location
function getDemandLevel(state, locationId, drugId) {
  if (!state.marketMemory || !state.marketMemory.demand[locationId]) return 100;
  return state.marketMemory.demand[locationId][drugId] || 100;
}

// Calculate price modifier from supply/demand
// Returns multiplier: < 1.0 = cheaper, > 1.0 = more expensive
function getSupplyDemandPriceMod(state, drugId, locationId) {
  if (!state.marketMemory) return 1.0;

  const supply = getSupplyLevel(state, locationId, drugId);
  const demand = getDemandLevel(state, locationId, drugId);

  if (supply <= 0) return 3.0; // No supply = max price

  // Ratio: high demand + low supply = expensive, low demand + high supply = cheap
  let ratio = demand / supply;

  // Normalize: at 100/100 = 1.0
  // Clamp to prevent extreme swings
  ratio = Math.max(0.3, Math.min(3.0, ratio));

  // Smooth the curve - don't let small changes have huge effects
  // Use sqrt for diminishing returns on extremes
  if (ratio > 1.0) {
    ratio = 1.0 + Math.sqrt(ratio - 1.0) * 0.7;
  } else if (ratio < 1.0) {
    ratio = 1.0 - Math.sqrt(1.0 - ratio) * 0.5;
  }

  return Math.max(0.3, Math.min(3.0, ratio));
}

// Called when player buys drugs at a location
function updateMarketOnBuy(state, drugId, amount, locationId) {
  if (!state.marketMemory) state.marketMemory = initMarketMemory();
  const mm = state.marketMemory;

  // Ensure location data exists
  if (!mm.supply[locationId]) mm.supply[locationId] = {};
  if (!mm.demand[locationId]) mm.demand[locationId] = {};
  if (!mm.playerPurchases[locationId]) mm.playerPurchases[locationId] = {};

  // Buying reduces local supply (you're taking product off the market)
  const supplyImpact = Math.min(amount * 0.3, 40); // Cap impact per transaction
  mm.supply[locationId][drugId] = Math.max(10, (mm.supply[locationId][drugId] || 100) - supplyImpact);

  // Buying signals demand (others see product moving)
  const demandImpact = Math.min(amount * 0.15, 20);
  mm.demand[locationId][drugId] = Math.min(200, (mm.demand[locationId][drugId] || 100) + demandImpact);

  // Track player purchases for analytics
  mm.playerPurchases[locationId][drugId] = (mm.playerPurchases[locationId][drugId] || 0) + amount;
}

// Called when player sells drugs at a location
function updateMarketOnSell(state, drugId, amount, locationId) {
  if (!state.marketMemory) state.marketMemory = initMarketMemory();
  const mm = state.marketMemory;

  if (!mm.supply[locationId]) mm.supply[locationId] = {};
  if (!mm.demand[locationId]) mm.demand[locationId] = {};
  if (!mm.playerSales[locationId]) mm.playerSales[locationId] = {};

  // Selling floods local supply (you're saturating the market)
  const supplyImpact = Math.min(amount * 0.4, 50); // Selling has bigger impact than buying
  mm.supply[locationId][drugId] = Math.min(200, (mm.supply[locationId][drugId] || 100) + supplyImpact);

  // Large sells reduce demand (market is saturated)
  if (amount > 30) {
    const demandDrop = Math.min((amount - 30) * 0.2, 30);
    mm.demand[locationId][drugId] = Math.max(10, (mm.demand[locationId][drugId] || 100) - demandDrop);
  }

  // Track player sales
  mm.playerSales[locationId][drugId] = (mm.playerSales[locationId][drugId] || 0) + amount;
}

// Process daily market changes - called from waitDay()
function processMarketDaily(state) {
  if (!state.marketMemory) state.marketMemory = initMarketMemory();
  const mm = state.marketMemory;

  const allLocationIds = LOCATIONS.map(l => l.id);
  const allDrugIds = DRUGS.map(d => d.id);

  for (const locId of allLocationIds) {
    if (!mm.supply[locId]) mm.supply[locId] = {};
    if (!mm.demand[locId]) mm.demand[locId] = {};

    for (const drugId of allDrugIds) {
      const currentSupply = mm.supply[locId][drugId] || 100;
      const currentDemand = mm.demand[locId][drugId] || 100;

      // Natural recovery: supply and demand drift toward 100 (equilibrium)
      // 5% drift per day
      const supplyDrift = (100 - currentSupply) * 0.05;
      const demandDrift = (100 - currentDemand) * 0.05;

      mm.supply[locId][drugId] = Math.max(10, Math.min(200, currentSupply + supplyDrift));
      mm.demand[locId][drugId] = Math.max(10, Math.min(200, currentDemand + demandDrift));

      // Random market noise: 1-3% fluctuation
      const supplyNoise = (Math.random() - 0.5) * 6; // -3 to +3
      const demandNoise = (Math.random() - 0.5) * 4; // -2 to +2
      mm.supply[locId][drugId] = Math.max(10, Math.min(200, mm.supply[locId][drugId] + supplyNoise));
      mm.demand[locId][drugId] = Math.max(10, Math.min(200, mm.demand[locId][drugId] + demandNoise));

      // Location specialty drugs have naturally higher demand
      const loc = LOCATIONS.find(l => l.id === locId);
      if (loc && loc.drugSpecialty === drugId) {
        if (mm.demand[locId][drugId] < 110) {
          mm.demand[locId][drugId] = Math.min(200, mm.demand[locId][drugId] + 2);
        }
      }
    }

    // Decay player transaction tracking (rolling 30-day window effect)
    if (mm.playerSales[locId]) {
      for (const drugId of allDrugIds) {
        if (mm.playerSales[locId][drugId]) {
          mm.playerSales[locId][drugId] = Math.max(0, mm.playerSales[locId][drugId] * 0.9);
        }
      }
    }
    if (mm.playerPurchases[locId]) {
      for (const drugId of allDrugIds) {
        if (mm.playerPurchases[locId][drugId]) {
          mm.playerPurchases[locId][drugId] = Math.max(0, mm.playerPurchases[locId][drugId] * 0.9);
        }
      }
    }
  }

  // Simulate NPC/competitor activity: occasionally shift markets
  if (Math.random() < 0.15) { // 15% chance per day
    const randomLoc = allLocationIds[Math.floor(Math.random() * allLocationIds.length)];
    const randomDrug = allDrugIds[Math.floor(Math.random() * allDrugIds.length)];
    const shift = (Math.random() - 0.5) * 20; // -10 to +10
    if (!mm.supply[randomLoc]) mm.supply[randomLoc] = {};
    mm.supply[randomLoc][randomDrug] = Math.max(10, Math.min(200, (mm.supply[randomLoc][randomDrug] || 100) + shift));
  }

  mm.lastUpdate = state.day;
}

// Get market condition label for UI display
function getMarketCondition(state, drugId, locationId) {
  const supply = getSupplyLevel(state, locationId, drugId);
  const demand = getDemandLevel(state, locationId, drugId);
  const ratio = demand / Math.max(supply, 1);

  if (ratio > 1.5) return { label: 'HOT', color: '#ff3333', desc: 'High demand, low supply' };
  if (ratio > 1.2) return { label: 'RISING', color: '#ff9500', desc: 'Demand growing' };
  if (ratio < 0.6) return { label: 'FLOODED', color: '#39ff14', desc: 'Oversupply, prices down' };
  if (ratio < 0.8) return { label: 'SOFT', color: '#00f0ff', desc: 'Demand weakening' };
  return { label: 'STABLE', color: '#888888', desc: 'Normal market conditions' };
}

// Get supply/demand indicator dot class for the market table
function getSupplyIndicatorClass(state, drugId, locationId) {
  const supply = getSupplyLevel(state, locationId, drugId);
  if (supply > 130) return 'supply-high';
  if (supply < 70) return 'supply-low';
  return 'supply-normal';
}
