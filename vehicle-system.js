// vehicle-system.js — Drug Wars: Miami Vice Edition
// Vehicle fleet system: buy, sell, mod, repair, scrap, daily processing

const VEHICLES = [
  { id: 'honda_civic', name: 'Honda Civic', type: 'economy', speed: 55, armor: 0, cargo: 300, price: 3000, special: 'Invisible. Lowest encounter rate', encounterMod: -0.4, repBonus: 0, ngPlus: false },
  { id: 'toyota_camry', name: 'Toyota Camry', type: 'economy', speed: 50, armor: 0, cargo: 400, price: 4000, special: 'Common. Never flagged by police', encounterMod: -0.3, repBonus: 0, ngPlus: false },
  { id: 'chevy_impala', name: 'Chevy Impala', type: 'street', speed: 65, armor: 0, cargo: 500, price: 8000, special: 'Lowrider option (+rep). Classic Miami', encounterMod: 0, repBonus: 0.05, ngPlus: false },
  { id: 'dodge_charger', name: 'Dodge Charger', type: 'muscle', speed: 80, armor: 5, cargo: 400, price: 15000, special: 'Fast escape. Engine upgradeable', encounterMod: 0, repBonus: 0, ngPlus: false },
  { id: 'ford_crown_vic', name: 'Ford Crown Vic', type: 'sleeper', speed: 70, armor: 10, cargo: 500, price: 5000, special: 'Looks like unmarked cop car. -20% stop', encounterMod: -0.2, repBonus: 0, ngPlus: false },
  { id: 'bmw_m5', name: 'BMW M5', type: 'performance', speed: 90, armor: 5, cargo: 300, price: 40000, special: 'Speed + luxury. +10% rep', encounterMod: 0, repBonus: 0.10, ngPlus: false },
  { id: 'lamborghini_countach', name: 'Lamborghini Countach', type: 'exotic', speed: 95, armor: 0, cargo: 100, price: 150000, special: 'Maximum rep +25%. Zero cargo', encounterMod: 0.1, repBonus: 0.25, ngPlus: false },
  { id: 'ferrari_testarossa', name: 'Ferrari Testarossa', type: 'exotic', speed: 92, armor: 0, cargo: 150, price: 180000, special: 'Miami Vice tribute. +30% rep', encounterMod: 0.1, repBonus: 0.30, ngPlus: false },
  { id: 'cadillac_escalade', name: 'Cadillac Escalade', type: 'suv', speed: 60, armor: 15, cargo: 800, price: 35000, special: 'Crew transport (4 crew). Moderate cargo', encounterMod: 0, repBonus: 0.05, ngPlus: false },
  { id: 'gmc_savana_van', name: 'GMC Savana Van', type: 'van', speed: 50, armor: 5, cargo: 2000, price: 12000, special: 'Best cargo ratio. Suspicious if stopped', encounterMod: 0.15, repBonus: 0, ngPlus: false },
  { id: 'ford_transit_box', name: 'Ford Transit Box', type: 'truck', speed: 45, armor: 5, cargo: 5000, price: 25000, special: 'Commercial cover. High capacity', encounterMod: -0.05, repBonus: 0, ngPlus: false },
  { id: 'kenworth_semi', name: 'Kenworth Semi', type: 'semi', speed: 40, armor: 10, cargo: 15000, price: 80000, special: 'Maximum road cargo', encounterMod: 0.05, repBonus: 0, ngPlus: false },
  { id: 'armored_humvee', name: 'Armored Humvee', type: 'military', speed: 55, armor: 40, cargo: 500, price: 100000, special: 'Near-bulletproof. NG+ only', encounterMod: 0.2, repBonus: 0.05, ngPlus: true },
  { id: 'cigarette_boat', name: 'Cigarette Boat', type: 'speedboat', speed: 85, armor: 0, cargo: 1500, price: 50000, special: 'Coastal smuggling fastest water', encounterMod: 0, repBonus: 0.05, ngPlus: false },
  { id: 'fishing_trawler', name: 'Fishing Trawler', type: 'boat', speed: 30, armor: 5, cargo: 8000, price: 40000, special: 'Huge capacity. Legit cover', encounterMod: -0.25, repBonus: 0, ngPlus: false },
  { id: 'yacht', name: 'Yacht', type: 'luxury_boat', speed: 45, armor: 10, cargo: 3000, price: 500000, special: 'Floating safehouse. +20% rep', encounterMod: 0, repBonus: 0.20, ngPlus: false },
  { id: 'narco_sub', name: 'Narco Sub', type: 'submarine', speed: 20, armor: 30, cargo: 25000, price: 1000000, special: 'Nearly undetectable. NG+ only', encounterMod: -0.6, repBonus: 0.10, ngPlus: true },
  { id: 'cessna_172', name: 'Cessna 172', type: 'light_plane', speed: 100, armor: 0, cargo: 500, price: 80000, special: 'Fast travel. Requires pilot', encounterMod: -0.1, repBonus: 0, ngPlus: false },
  { id: 'king_air_350', name: 'King Air 350', type: 'turboprop', speed: 120, armor: 0, cargo: 3000, price: 500000, special: 'Medium cargo air. Requires pilot', encounterMod: -0.1, repBonus: 0.10, ngPlus: false },
  { id: 'gulfstream_g550', name: 'Gulfstream G550', type: 'private_jet', speed: 150, armor: 5, cargo: 2000, price: 5000000, special: 'Ultimate status. NG+ only', encounterMod: -0.1, repBonus: 0.30, ngPlus: true },
  { id: 'helicopter', name: 'Helicopter', type: 'heli', speed: 110, armor: 5, cargo: 500, price: 250000, special: 'Fast city travel. NG+ only', encounterMod: 0, repBonus: 0.10, ngPlus: true },
  { id: 'dirt_bike', name: 'Dirt Bike', type: 'offroad', speed: 60, armor: 0, cargo: 50, price: 2000, special: 'Off-road escape', encounterMod: -0.15, repBonus: 0, ngPlus: false },
  { id: 'jet_ski', name: 'Jet Ski', type: 'watercraft', speed: 75, armor: 0, cargo: 100, price: 5000, special: 'Coastal quick escape', encounterMod: -0.1, repBonus: 0, ngPlus: false },
  { id: 'ambulance', name: 'Ambulance', type: 'special', speed: 50, armor: 5, cargo: 1000, price: 15000, special: 'Never stopped by police', encounterMod: -0.5, repBonus: 0, ngPlus: false },
  { id: 'ice_cream_truck', name: 'Ice Cream Truck', type: 'special', speed: 35, armor: 0, cargo: 2000, price: 8000, special: 'Neighborhood cover. Great for distribution', encounterMod: -0.35, repBonus: 0, ngPlus: false },
];

const VEHICLE_MODS = [
  { id: 'armor_plating', name: 'Armor Plating', price: 5000, armorBonus: 10, speedBonus: 0, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0, description: '+10 armor' },
  { id: 'hidden_compartment', name: 'Hidden Compartment', price: 3000, armorBonus: 0, speedBonus: 0, cargoBonus: 0, hiddenCargo: 500, trackingReduction: 0, description: '+500 hidden cargo that survives searches' },
  { id: 'nitro_boost', name: 'Nitro Boost', price: 2000, armorBonus: 0, speedBonus: 20, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0, description: '+20 speed for chases' },
  { id: 'bulletproof_glass', name: 'Bulletproof Glass', price: 8000, armorBonus: 15, speedBonus: 0, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0, description: '+15 armor, cars only', carsOnly: true },
  { id: 'engine_upgrade', name: 'Engine Upgrade', price: 4000, armorBonus: 0, speedBonus: 15, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0, description: '+15 speed' },
  { id: 'repaint_job', name: 'Repaint Job', price: 2000, armorBonus: 0, speedBonus: 0, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0, description: 'Removes hot status' },
  { id: 'gps_blocker', name: 'GPS Blocker', price: 6000, armorBonus: 0, speedBonus: 0, cargoBonus: 0, hiddenCargo: 0, trackingReduction: 0.30, description: '-30% tracking chance' },
];

const LAND_VEHICLE_TYPES = ['economy', 'street', 'muscle', 'sleeper', 'performance', 'exotic', 'suv', 'van', 'truck', 'semi', 'military', 'offroad', 'special'];
const WATER_VEHICLE_TYPES = ['speedboat', 'boat', 'luxury_boat', 'submarine', 'watercraft'];
const AIR_VEHICLE_TYPES = ['light_plane', 'turboprop', 'private_jet', 'heli'];

const CAR_TYPES_FOR_BULLETPROOF = ['economy', 'street', 'muscle', 'sleeper', 'performance', 'exotic', 'suv', 'special'];

const GARAGE_CAPACITY_BY_TIER = [0, 1, 2, 4, 6];

const CONDITION_DECAY_PER_DAY = 1;
const REPAIR_COST_PER_POINT = 50;
const REPAINT_COST = 2000;
const SCRAP_VALUE_RATIO = 0.25;
const HOT_DETECTION_CHANCE_PER_DAY = 0.05;
const DEPRECIATION_RATE = 0.7;

// ── Initialization ──────────────────────────────────────────────────

function initVehicleState() {
  return {
    garage: [],
    activeVehicleIndex: null,
    totalVehiclesBought: 0,
    totalVehiclesScrapped: 0,
  };
}

// ── Daily Processing ────────────────────────────────────────────────

function processVehiclesDaily(state) {
  const vehicleState = state.vehicles;
  if (!vehicleState || vehicleState.garage.length === 0) return;

  const messages = [];

  vehicleState.garage.forEach((vehicle, index) => {
    // Condition decay for the active vehicle
    if (index === vehicleState.activeVehicleIndex) {
      vehicle.condition = Math.max(0, vehicle.condition - CONDITION_DECAY_PER_DAY);
      vehicle.mileage += Math.floor(Math.random() * 30) + 10;

      if (vehicle.condition <= 10 && vehicle.condition > 0) {
        messages.push(`Your ${getVehicleDef(vehicle.vehicleId).name} is in critical condition (${vehicle.condition}%). Repair soon!`);
      }
      if (vehicle.condition === 0) {
        messages.push(`Your ${getVehicleDef(vehicle.vehicleId).name} has broken down! It cannot be used until repaired.`);
      }
    }

    // Hot car detection risk
    if (vehicle.hot) {
      const daysSinceHot = (state.day || 0) - vehicle.hotSince;
      const detectionChance = HOT_DETECTION_CHANCE_PER_DAY + (daysSinceHot * 0.01);
      const hasGPSBlocker = vehicle.mods.includes('gps_blocker');
      const adjustedChance = hasGPSBlocker ? detectionChance * 0.7 : detectionChance;

      if (Math.random() < adjustedChance) {
        messages.push(`Police have flagged your ${getVehicleDef(vehicle.vehicleId).name} as a hot vehicle! Consider repainting.`);
      }

      // Hot status cools down after 30 days naturally
      if (daysSinceHot > 30) {
        vehicle.hot = false;
        vehicle.hotSince = 0;
        messages.push(`Your ${getVehicleDef(vehicle.vehicleId).name} is no longer flagged as hot.`);
      }
    }
  });

  return messages;
}

// ── Lookup Helpers ──────────────────────────────────────────────────

function getVehicleDef(vehicleId) {
  return VEHICLES.find(v => v.id === vehicleId) || null;
}

function getModDef(modId) {
  return VEHICLE_MODS.find(m => m.id === modId) || null;
}

function getVehicleCategory(vehicleId) {
  const def = getVehicleDef(vehicleId);
  if (!def) return null;
  if (LAND_VEHICLE_TYPES.includes(def.type)) return 'land';
  if (WATER_VEHICLE_TYPES.includes(def.type)) return 'water';
  if (AIR_VEHICLE_TYPES.includes(def.type)) return 'air';
  return 'unknown';
}

// ── Garage Capacity ─────────────────────────────────────────────────

function getGarageCapacity(state) {
  const tier = (state.safehouseTier !== undefined) ? state.safehouseTier : (state.safehouse && state.safehouse.tier !== undefined ? state.safehouse.tier + 1 : 0);
  const baseCap = GARAGE_CAPACITY_BY_TIER[Math.min(tier, GARAGE_CAPACITY_BY_TIER.length - 1)] || 0;
  const propertyBonus = state.garageBonusSlots || 0;
  return baseCap + propertyBonus;
}

// ── Buy Vehicle ─────────────────────────────────────────────────────

function buyVehicle(state, vehicleId) {
  const def = getVehicleDef(vehicleId);
  if (!def) return { success: false, message: 'Unknown vehicle.' };

  if (def.ngPlus && !state.newGamePlus) {
    return { success: false, message: `${def.name} is only available in New Game+.` };
  }

  const capacity = getGarageCapacity(state);
  if (state.vehicles.garage.length >= capacity) {
    return { success: false, message: `Garage full (${state.vehicles.garage.length}/${capacity}). Sell or scrap a vehicle first.` };
  }

  if ((state.cash || 0) < def.price) {
    return { success: false, message: `Not enough cash. Need $${def.price.toLocaleString()}, have $${(state.cash || 0).toLocaleString()}.` };
  }

  state.cash -= def.price;

  const instance = {
    vehicleId: def.id,
    condition: 100,
    mods: [],
    hot: false,
    hotSince: 0,
    mileage: 0,
    purchaseDay: state.day || 0,
    purchasePrice: def.price,
    nickname: null,
  };

  state.vehicles.garage.push(instance);
  state.vehicles.totalVehiclesBought++;

  // Auto-equip if no active vehicle
  if (state.vehicles.activeVehicleIndex === null) {
    state.vehicles.activeVehicleIndex = state.vehicles.garage.length - 1;
  }

  return { success: true, message: `Purchased ${def.name} for $${def.price.toLocaleString()}.`, vehicle: instance };
}

// ── Sell Vehicle ────────────────────────────────────────────────────

function sellVehicle(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const value = getVehicleValue(vehicle);
  const def = getVehicleDef(vehicle.vehicleId);

  state.cash = (state.cash || 0) + value;
  state.vehicles.garage.splice(garageIndex, 1);

  // Adjust active vehicle index
  if (state.vehicles.activeVehicleIndex === garageIndex) {
    state.vehicles.activeVehicleIndex = state.vehicles.garage.length > 0 ? 0 : null;
  } else if (state.vehicles.activeVehicleIndex !== null && state.vehicles.activeVehicleIndex > garageIndex) {
    state.vehicles.activeVehicleIndex--;
  }

  return { success: true, message: `Sold ${def ? def.name : 'vehicle'} for $${value.toLocaleString()}.`, salePrice: value };
}

// ── Set Active Vehicle ──────────────────────────────────────────────

function setActiveVehicle(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  if (vehicle.condition === 0) {
    return { success: false, message: 'This vehicle is broken down. Repair it first.' };
  }

  state.vehicles.activeVehicleIndex = garageIndex;
  const def = getVehicleDef(vehicle.vehicleId);
  return { success: true, message: `Now using ${vehicle.nickname || (def ? def.name : 'vehicle')}.` };
}

// ── Install Mod ─────────────────────────────────────────────────────

function installMod(state, garageIndex, modId) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const modDef = getModDef(modId);
  if (!modDef) return { success: false, message: 'Unknown modification.' };

  const vehicle = state.vehicles.garage[garageIndex];
  const vehicleDef = getVehicleDef(vehicle.vehicleId);

  // Check cars-only restriction for bulletproof glass
  if (modDef.carsOnly && !CAR_TYPES_FOR_BULLETPROOF.includes(vehicleDef.type)) {
    return { success: false, message: `${modDef.name} can only be installed on cars and SUVs.` };
  }

  // Check if already installed (except repaint which is consumable)
  if (modId !== 'repaint_job' && vehicle.mods.includes(modId)) {
    return { success: false, message: `${modDef.name} is already installed.` };
  }

  if ((state.cash || 0) < modDef.price) {
    return { success: false, message: `Not enough cash. Need $${modDef.price.toLocaleString()}.` };
  }

  state.cash -= modDef.price;

  // Repaint job is a consumable action, not a persistent mod
  if (modId === 'repaint_job') {
    vehicle.hot = false;
    vehicle.hotSince = 0;
    return { success: true, message: `${vehicleDef.name} repainted. Hot status removed.` };
  }

  vehicle.mods.push(modId);
  return { success: true, message: `${modDef.name} installed on ${vehicleDef.name}. ${modDef.description}` };
}

// ── Repair Vehicle ──────────────────────────────────────────────────

function repairVehicle(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  if (vehicle.condition >= 100) {
    return { success: false, message: 'Vehicle is already in perfect condition.' };
  }

  const damage = 100 - vehicle.condition;
  const cost = damage * REPAIR_COST_PER_POINT;
  const def = getVehicleDef(vehicle.vehicleId);

  if ((state.cash || 0) < cost) {
    return { success: false, message: `Repair costs $${cost.toLocaleString()}. Not enough cash.` };
  }

  state.cash -= cost;
  vehicle.condition = 100;

  return { success: true, message: `${def.name} repaired to 100% for $${cost.toLocaleString()}.`, cost: cost };
}

// ── Repaint Vehicle ─────────────────────────────────────────────────

function repaintVehicle(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const def = getVehicleDef(vehicle.vehicleId);

  if (!vehicle.hot) {
    return { success: false, message: `${def.name} is not hot. No repaint needed.` };
  }

  if ((state.cash || 0) < REPAINT_COST) {
    return { success: false, message: `Repaint costs $${REPAINT_COST.toLocaleString()}. Not enough cash.` };
  }

  state.cash -= REPAINT_COST;
  vehicle.hot = false;
  vehicle.hotSince = 0;

  return { success: true, message: `${def.name} repainted for $${REPAINT_COST.toLocaleString()}. No longer hot.` };
}

// ── Scrap Vehicle ───────────────────────────────────────────────────

function scrapVehicle(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const def = getVehicleDef(vehicle.vehicleId);
  const scrapValue = Math.floor(def.price * SCRAP_VALUE_RATIO);

  state.cash = (state.cash || 0) + scrapValue;
  state.vehicles.garage.splice(garageIndex, 1);
  state.vehicles.totalVehiclesScrapped++;

  // Adjust active vehicle index
  if (state.vehicles.activeVehicleIndex === garageIndex) {
    state.vehicles.activeVehicleIndex = state.vehicles.garage.length > 0 ? 0 : null;
  } else if (state.vehicles.activeVehicleIndex !== null && state.vehicles.activeVehicleIndex > garageIndex) {
    state.vehicles.activeVehicleIndex--;
  }

  return { success: true, message: `Scrapped ${def.name} for $${scrapValue.toLocaleString()} in parts.`, scrapValue: scrapValue };
}

// ── Mark Vehicle Hot ────────────────────────────────────────────────

function markVehicleHot(state, garageIndex) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const def = getVehicleDef(vehicle.vehicleId);

  // Some vehicles are never flagged
  if (vehicle.vehicleId === 'toyota_camry' || vehicle.vehicleId === 'ambulance') {
    return { success: false, message: `${def.name} cannot be flagged as hot.` };
  }

  vehicle.hot = true;
  vehicle.hotSince = state.day || 0;

  return { success: true, message: `${def.name} is now flagged as a hot vehicle.` };
}

// ── Damage Vehicle ──────────────────────────────────────────────────

function damageVehicle(state, garageIndex, amount) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const def = getVehicleDef(vehicle.vehicleId);

  // Armor from base + mods reduces incoming damage
  let totalArmor = def.armor;
  vehicle.mods.forEach(modId => {
    const mod = getModDef(modId);
    if (mod) totalArmor += mod.armorBonus;
  });

  const damageReduction = Math.min(totalArmor * 0.5, amount * 0.75);
  const actualDamage = Math.max(1, Math.floor(amount - damageReduction));

  vehicle.condition = Math.max(0, vehicle.condition - actualDamage);

  const result = {
    success: true,
    message: `${def.name} took ${actualDamage} damage (${amount} raw, ${Math.floor(damageReduction)} absorbed by armor). Condition: ${vehicle.condition}%`,
    actualDamage: actualDamage,
    absorbed: Math.floor(damageReduction),
    newCondition: vehicle.condition,
  };

  if (vehicle.condition === 0) {
    result.message += ' VEHICLE DESTROYED!';
    result.destroyed = true;
  }

  return result;
}

// ── Get Vehicle Value ───────────────────────────────────────────────

function getVehicleValue(vehicle) {
  const def = getVehicleDef(vehicle.vehicleId);
  if (!def) return 0;

  // Base depreciated value from condition
  const conditionMultiplier = vehicle.condition / 100;
  let value = Math.floor(def.price * DEPRECIATION_RATE * conditionMultiplier);

  // Add mod values at 50% return
  vehicle.mods.forEach(modId => {
    const mod = getModDef(modId);
    if (mod) value += Math.floor(mod.price * 0.5);
  });

  // Hot vehicles lose 30% value
  if (vehicle.hot) {
    value = Math.floor(value * 0.7);
  }

  return Math.max(0, value);
}

// ── Get Active Vehicle Bonus ────────────────────────────────────────

function getActiveVehicleBonus(state) {
  const defaults = { speedMod: 0, cargoBonus: 0, encounterMod: 0, repBonus: 0, armorBonus: 0, hiddenCargo: 0, trackingReduction: 0 };

  if (!state.vehicles || state.vehicles.activeVehicleIndex === null) return defaults;
  if (state.vehicles.activeVehicleIndex >= state.vehicles.garage.length) return defaults;

  const vehicle = state.vehicles.garage[state.vehicles.activeVehicleIndex];
  if (vehicle.condition === 0) return defaults;

  const def = getVehicleDef(vehicle.vehicleId);
  if (!def) return defaults;

  const bonus = {
    speedMod: def.speed,
    cargoBonus: def.cargo,
    encounterMod: def.encounterMod || 0,
    repBonus: def.repBonus || 0,
    armorBonus: def.armor,
    hiddenCargo: 0,
    trackingReduction: 0,
  };

  // Apply mod bonuses
  vehicle.mods.forEach(modId => {
    const mod = getModDef(modId);
    if (!mod) return;
    bonus.speedMod += mod.speedBonus;
    bonus.armorBonus += mod.armorBonus;
    bonus.hiddenCargo += mod.hiddenCargo;
    bonus.trackingReduction += mod.trackingReduction;
  });

  // Condition penalty: below 50% condition degrades speed
  if (vehicle.condition < 50) {
    const conditionPenalty = 1 - ((50 - vehicle.condition) / 100);
    bonus.speedMod = Math.floor(bonus.speedMod * conditionPenalty);
  }

  // Hot vehicle increases encounter rate
  if (vehicle.hot) {
    bonus.encounterMod += 0.25;
  }

  return bonus;
}

// ── Utility: List Available Vehicles ────────────────────────────────

function getAvailableVehicles(state) {
  return VEHICLES.filter(v => {
    if (v.ngPlus && !state.newGamePlus) return false;
    return true;
  });
}

// ── Utility: Get Garage Summary ─────────────────────────────────────

function getGarageSummary(state) {
  const capacity = getGarageCapacity(state);
  const vehicles = state.vehicles.garage.map((v, i) => {
    const def = getVehicleDef(v.vehicleId);
    return {
      index: i,
      name: v.nickname || (def ? def.name : 'Unknown'),
      type: def ? def.type : 'unknown',
      condition: v.condition,
      mods: v.mods.length,
      hot: v.hot,
      value: getVehicleValue(v),
      active: i === state.vehicles.activeVehicleIndex,
      category: getVehicleCategory(v.vehicleId),
    };
  });

  return {
    vehicles: vehicles,
    used: vehicles.length,
    capacity: capacity,
    activeIndex: state.vehicles.activeVehicleIndex,
  };
}

// ── Utility: Nickname ───────────────────────────────────────────────

function nicknameVehicle(state, garageIndex, nickname) {
  if (garageIndex < 0 || garageIndex >= state.vehicles.garage.length) {
    return { success: false, message: 'Invalid garage slot.' };
  }

  const vehicle = state.vehicles.garage[garageIndex];
  const def = getVehicleDef(vehicle.vehicleId);
  const oldName = vehicle.nickname || def.name;

  if (!nickname || nickname.trim().length === 0) {
    vehicle.nickname = null;
    return { success: true, message: `Removed nickname from ${def.name}.` };
  }

  if (nickname.length > 24) {
    return { success: false, message: 'Nickname must be 24 characters or less.' };
  }

  vehicle.nickname = nickname.trim();
  return { success: true, message: `${oldName} is now called "${vehicle.nickname}".` };
}

// ── Utility: Check Pilot Requirement ────────────────────────────────

function requiresPilot(vehicleId) {
  const def = getVehicleDef(vehicleId);
  if (!def) return false;
  return AIR_VEHICLE_TYPES.includes(def.type);
}

// ── Utility: Check Captain Requirement ──────────────────────────────

function requiresCaptain(vehicleId) {
  const def = getVehicleDef(vehicleId);
  if (!def) return false;
  return ['boat', 'luxury_boat', 'submarine'].includes(def.type);
}

// ── Utility: Crew Capacity ──────────────────────────────────────────

function getCrewCapacity(vehicleId) {
  const def = getVehicleDef(vehicleId);
  if (!def) return 1;
  if (def.id === 'cadillac_escalade') return 4;
  if (def.type === 'van' || def.type === 'truck') return 3;
  if (def.type === 'semi') return 2;
  if (def.type === 'luxury_boat' || def.type === 'boat') return 6;
  if (def.type === 'submarine') return 4;
  if (['turboprop', 'private_jet'].includes(def.type)) return 6;
  if (def.type === 'heli') return 3;
  return 1;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VEHICLES,
    VEHICLE_MODS,
    LAND_VEHICLE_TYPES,
    WATER_VEHICLE_TYPES,
    AIR_VEHICLE_TYPES,
    CAR_TYPES_FOR_BULLETPROOF,
    GARAGE_CAPACITY_BY_TIER,
    initVehicleState,
    processVehiclesDaily,
    buyVehicle,
    sellVehicle,
    setActiveVehicle,
    installMod,
    repairVehicle,
    repaintVehicle,
    scrapVehicle,
    markVehicleHot,
    damageVehicle,
    getVehicleValue,
    getActiveVehicleBonus,
    getGarageCapacity,
    getAvailableVehicles,
    getGarageSummary,
    getVehicleDef,
    getModDef,
    getVehicleCategory,
    nicknameVehicle,
    requiresPilot,
    requiresCaptain,
    getCrewCapacity,
  };
}
