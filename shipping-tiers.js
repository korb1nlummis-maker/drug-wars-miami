// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Shipping & Transport Empire
// 9 Tiers from On Foot to Private Jet
// ============================================================

const SHIPPING_TIERS = [
  {
    id: 'on_foot', tier: 0, name: 'On Foot', emoji: '🚶',
    unlockCondition: null, // Starting tier
    capacity: 50, // units
    speed: 1.0, // travel time multiplier (1.0 = base)
    risk: 'moderate',
    cost: 0, // acquisition cost
    dailyCost: 0,
    requirement: null,
    desc: 'Pockets, backpack, maybe a duffel. Small and exposed but invisible if you\'re careful.',
    gameplay: 'Starting transport. Maximum concealment, minimum capacity. Good for early low-volume dealing.',
    heatMod: 0.8, // Less heat from transport
    concealability: 0.9, // Hard to search
    interceptionChance: 0.02,
  },
  {
    id: 'personal_vehicle', tier: 1, name: 'Personal Vehicle', emoji: '🚗',
    unlockCondition: 'Purchase a vehicle OR earn $5,000',
    capacity: 200,
    speed: 0.7, // 30% faster
    risk: 'moderate',
    cost: 5000,
    dailyCost: 25,
    requirement: { type: 'cash', value: 5000 },
    desc: 'Your car. Hidden compartments, trunk space. Standard for early-to-mid game.',
    gameplay: 'Reliable daily transport. Can be pulled over. Traffic stops are the #1 risk.',
    heatMod: 1.0,
    concealability: 0.6,
    interceptionChance: 0.05,
  },
  {
    id: 'dedicated_transport', tier: 2, name: 'Dedicated Transport', emoji: '🚐',
    unlockCondition: 'Crew of 3+ AND $15,000',
    capacity: 500,
    speed: 0.6,
    risk: 'moderate-high',
    cost: 15000,
    dailyCost: 100,
    requirement: { type: 'multi', crew: 3, cash: 15000 },
    desc: 'Van or delivery truck. Crew member drives. Regular scheduled runs.',
    gameplay: 'Serious transport. Requires dedicated driver. Can be tracked if pattern detected.',
    heatMod: 1.2,
    concealability: 0.4,
    interceptionChance: 0.08,
  },
  {
    id: 'fleet_operations', tier: 3, name: 'Fleet Operations', emoji: '🚛',
    unlockCondition: 'Business skill 3+ AND $50,000 AND crew of 5+',
    capacity: 2000,
    speed: 0.5,
    risk: 'high',
    cost: 50000,
    dailyCost: 500,
    requirement: { type: 'multi', skill: { business: 3 }, crew: 5, cash: 50000 },
    desc: 'Multiple vehicles. Regular routes. Professional logistics operation.',
    gameplay: 'Fleet management. Multiple routes. DEA pattern analysis risk increases.',
    heatMod: 1.5,
    concealability: 0.3,
    interceptionChance: 0.10,
  },
  {
    id: 'boat_smuggling', tier: 4, name: 'Boat Smuggling', emoji: '🚤',
    unlockCondition: 'Control Keys Corridor OR Port Authority alliance AND $75,000',
    capacity: 3000,
    speed: 0.7,
    risk: 'high',
    cost: 75000,
    dailyCost: 800,
    requirement: { type: 'multi', territory: ['the_keys', 'the_port'], cash: 75000 },
    desc: 'Speedboat runs. Night drops. Coastal smuggling. Caribbean access.',
    gameplay: 'Opens international routes. Coast Guard patrols. Weather dependent. High reward.',
    heatMod: 1.3,
    concealability: 0.5, // Open water = less eyes
    interceptionChance: 0.12,
    international: true, // Can reach international locations
    routes: ['jamaica', 'haiti', 'bahamas'],
  },
  {
    id: 'container_shipping', tier: 5, name: 'Container Shipping', emoji: '🚢',
    unlockCondition: 'Port Authority allied AND $200,000 AND front business',
    capacity: 10000,
    speed: 0.3, // Slow but massive
    risk: 'moderate',
    cost: 200000,
    dailyCost: 2000,
    requirement: { type: 'multi', faction: { port_authority: 40 }, cash: 200000, fronts: 1 },
    desc: 'Containers through Miami Port. Industrial-scale smuggling.',
    gameplay: 'Massive volume. Requires dock union cooperation. Customs is the bottleneck.',
    heatMod: 0.8, // Hidden among legitimate goods
    concealability: 0.7,
    interceptionChance: 0.06,
    international: true,
    routes: ['colombia', 'jamaica', 'haiti', 'bahamas'],
  },
  {
    id: 'private_aviation', tier: 6, name: 'Private Aviation', emoji: '✈️',
    unlockCondition: 'Driving skill 5+ (Pilot) AND $500,000 AND Keys territory',
    capacity: 5000,
    speed: 0.2, // Very fast
    risk: 'very_high',
    cost: 500000,
    dailyCost: 5000,
    requirement: { type: 'multi', skill: { driving: 5 }, cash: 500000, territory: ['the_keys'] },
    desc: 'Private airstrip access. Direct flights to source countries.',
    gameplay: 'Fast international transport. FAA tracking risk. Airstrip operations.',
    heatMod: 1.8,
    concealability: 0.2,
    interceptionChance: 0.15,
    international: true,
    routes: ['colombia', 'jamaica', 'mexico', 'bahamas'],
  },
  {
    id: 'narco_sub', tier: 7, name: 'Narco Submarine', emoji: '🔱',
    unlockCondition: 'NG+ ONLY. Driving skill 9 (Sub Ops) AND $2,000,000',
    capacity: 20000,
    speed: 0.4,
    risk: 'extreme',
    cost: 2000000,
    dailyCost: 10000,
    requirement: { type: 'multi', ngPlus: true, skill: { driving: 9 }, cash: 2000000 },
    desc: 'Semi-submersible narco submarine. Invisible to surface radar.',
    gameplay: 'NG+ ultimate smuggling. Undetectable but maintenance-heavy. Can\'t be replaced if lost.',
    heatMod: 0.3, // Nearly undetectable
    concealability: 0.95,
    interceptionChance: 0.02,
    international: true,
    routes: ['colombia', 'jamaica', 'haiti', 'mexico', 'bahamas', 'eastern_europe'],
    ngPlusOnly: true,
  },
  {
    id: 'private_jet', tier: 8, name: 'Private Jet', emoji: '🛩️',
    unlockCondition: 'NG+ ONLY. Business skill 8+ AND $5,000,000',
    capacity: 8000,
    speed: 0.1, // Fastest
    risk: 'extreme',
    cost: 5000000,
    dailyCost: 25000,
    requirement: { type: 'multi', ngPlus: true, skill: { business: 8 }, cash: 5000000 },
    desc: 'Global reach. Fly anywhere. The ultimate status symbol.',
    gameplay: 'NG+ endgame. Global operations. FAA, Interpol, and CIA attention.',
    heatMod: 2.0,
    concealability: 0.1,
    interceptionChance: 0.08,
    international: true,
    routes: ['colombia', 'jamaica', 'haiti', 'mexico', 'bahamas', 'eastern_europe'],
    ngPlusOnly: true,
  },
];

// Initialize shipping state
function initShippingState() {
  return {
    currentTier: 0,
    ownedTiers: [0], // Always own on_foot
    activeShipments: [], // { id, route, cargo, departDay, arriveDay, tier, intercepted }
    completedShipments: 0,
    interceptedShipments: 0,
    totalCargoMoved: 0,
    routes: {}, // routeId -> { established, trips, reliability }
  };
}

// Get current shipping tier data
function getShippingTier(tierId) {
  return SHIPPING_TIERS.find(t => t.id === tierId) || SHIPPING_TIERS[0];
}

// Check if player can unlock a shipping tier
function canUnlockShippingTier(state, tierId) {
  const tier = getShippingTier(tierId);
  if (!tier || !tier.requirement) return true;

  const req = tier.requirement;
  if (req.ngPlus && !(state.newGamePlus && state.newGamePlus.active)) return false;
  if (req.cash && (state.cash || 0) < req.cash) return false;
  if (req.crew && (state.henchmen || []).length < req.crew) return false;
  if (req.skill) {
    for (const [skillId, minLevel] of Object.entries(req.skill)) {
      if (!state.skills || (state.skills[skillId] || 0) < minLevel) return false;
    }
  }
  if (req.faction) {
    for (const [factionId, minRel] of Object.entries(req.faction)) {
      if (!state.factions || !state.factions[factionId] || state.factions[factionId].relation < minRel) return false;
    }
  }
  if (req.territory) {
    const controlled = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
    const hasRequired = req.territory.some(t => controlled.includes(t));
    if (!hasRequired) return false;
  }
  if (req.fronts && (state.frontBusinesses || []).length < req.fronts) return false;

  return true;
}

// Unlock a shipping tier
function unlockShippingTier(state, tierId) {
  if (!state.shipping) state.shipping = initShippingState();
  const tier = getShippingTier(tierId);
  if (!tier) return { success: false, msg: 'Tier not found.' };
  if (!canUnlockShippingTier(state, tierId)) return { success: false, msg: 'Requirements not met.' };
  if (state.shipping.ownedTiers.includes(tier.tier)) return { success: false, msg: 'Already owned.' };
  if (state.cash < tier.cost) return { success: false, msg: 'Not enough cash.' };

  state.cash -= tier.cost;
  state.shipping.ownedTiers.push(tier.tier);
  state.shipping.currentTier = Math.max(state.shipping.currentTier, tier.tier);

  return { success: true, msg: `${tier.name} unlocked!` };
}

// Start a shipment
function startShipment(state, tierId, route, cargo) {
  if (!state.shipping) state.shipping = initShippingState();
  const tier = getShippingTier(tierId);
  if (!tier) return { success: false, msg: 'Invalid tier.' };

  const travelDays = Math.max(1, Math.ceil(3 * tier.speed)); // Base 3 days * speed mod
  const shipment = {
    id: `ship_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    route: route,
    cargo: cargo, // { drugId, amount }
    tier: tierId,
    departDay: state.day,
    arriveDay: state.day + travelDays,
    intercepted: false,
    delivered: false,
  };

  state.shipping.activeShipments.push(shipment);
  return { success: true, msg: `Shipment dispatched! ETA: ${travelDays} days.`, shipment };
}

// Process daily shipping
function processShippingDaily(state) {
  if (!state.shipping) return [];
  const msgs = [];

  for (const shipment of state.shipping.activeShipments) {
    if (shipment.delivered || shipment.intercepted) continue;

    // Check for interception
    const tier = getShippingTier(shipment.tier);
    const interceptChance = tier ? tier.interceptionChance : 0.10;
    const heatMod = (state.heat || 0) / 100; // Higher heat = more interceptions
    const finalChance = interceptChance * (1 + heatMod);

    if (Math.random() < finalChance) {
      shipment.intercepted = true;
      state.shipping.interceptedShipments++;
      state.heat = Math.min(100, (state.heat || 0) + 15);
      msgs.push(`🚨 SHIPMENT INTERCEPTED! Your ${tier.name} cargo was seized! Heat +15`);
      continue;
    }

    // Check for arrival
    if (state.day >= shipment.arriveDay) {
      shipment.delivered = true;
      state.shipping.completedShipments++;
      state.shipping.totalCargoMoved += shipment.cargo.amount || 0;

      // Add cargo to stash/inventory
      if (shipment.cargo.drugId && shipment.cargo.amount) {
        if (!state.stash) state.stash = {};
        state.stash[shipment.cargo.drugId] = (state.stash[shipment.cargo.drugId] || 0) + shipment.cargo.amount;
      }

      msgs.push(`📦 Shipment arrived! ${shipment.cargo.amount || 0} units delivered via ${tier.name}.`);
    }
  }

  // Clean up old shipments
  state.shipping.activeShipments = state.shipping.activeShipments.filter(
    s => !s.delivered && !s.intercepted
  );

  // Deduct daily costs for owned tiers
  const maxTier = SHIPPING_TIERS.find(t => t.tier === state.shipping.currentTier);
  if (maxTier && maxTier.dailyCost > 0) {
    state.cash -= maxTier.dailyCost;
    if (maxTier.dailyCost > 100) {
      msgs.push(`🚛 Transport maintenance: -$${maxTier.dailyCost.toLocaleString()}`);
    }
  }

  return msgs;
}

// Get max transport capacity based on owned tiers and skills
function getMaxTransportCapacity(state) {
  if (!state.shipping) return SHIPPING_TIERS[0].capacity;
  const tier = SHIPPING_TIERS.find(t => t.tier === state.shipping.currentTier);
  let capacity = tier ? tier.capacity : 50;

  // Skill bonuses
  const skillEffects = typeof getActiveSkillEffects === 'function' ? getActiveSkillEffects(state) : {};
  if (skillEffects.convoyCapacity) capacity *= skillEffects.convoyCapacity;

  return Math.floor(capacity);
}

// Get available shipping routes
function getAvailableRoutes(state) {
  if (!state.shipping) return [];
  const routes = [];
  const ownedTiers = state.shipping.ownedTiers || [0];

  for (const tierNum of ownedTiers) {
    const tier = SHIPPING_TIERS.find(t => t.tier === tierNum);
    if (!tier || !tier.routes) continue;
    for (const route of tier.routes) {
      if (!routes.includes(route)) routes.push(route);
    }
  }

  return routes;
}
