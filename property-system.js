/* ============================================================
   DRUG WARS: MIAMI VICE EDITION - Properties & Infrastructure
   4 property types x 3 tiers with upgrades and per-location stash
   ============================================================ */

const PROPERTY_TYPES = [
  {
    id: 'apartment',
    name: 'Apartment',
    emoji: '🏠',
    desc: 'Living space that doubles as a safehouse',
    provides: ['stash', 'safehouse'],
    tiers: [
      { name: 'Studio Apartment', cost: 5000, maintenance: 50, stashCapacity: 2000, security: 10, crewBonus: 0 },
      { name: 'Luxury Condo', cost: 25000, maintenance: 200, stashCapacity: 10000, security: 25, crewBonus: 0 },
      { name: 'Penthouse Suite', cost: 150000, maintenance: 800, stashCapacity: 50000, security: 50, crewBonus: 1 },
    ],
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    emoji: '🏭',
    desc: 'Bulk storage for product and operations',
    provides: ['stash', 'distribution'],
    tiers: [
      { name: 'Storage Unit', cost: 10000, maintenance: 100, stashCapacity: 5000, security: 5, crewBonus: 1 },
      { name: 'Industrial Warehouse', cost: 50000, maintenance: 400, stashCapacity: 25000, security: 15, crewBonus: 2 },
      { name: 'Fortified Complex', cost: 200000, maintenance: 1200, stashCapacity: 100000, security: 40, crewBonus: 3 },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    emoji: '🏢',
    desc: 'Business fronts for laundering and income',
    provides: ['frontSlot', 'laundering'],
    tiers: [
      { name: 'Small Storefront', cost: 15000, maintenance: 150, stashCapacity: 0, security: 10, crewBonus: 0, frontSlots: 1, launderRate: 0.05 },
      { name: 'Strip Mall Plaza', cost: 75000, maintenance: 500, stashCapacity: 0, security: 20, crewBonus: 0, frontSlots: 2, launderRate: 0.10 },
      { name: 'Office Tower', cost: 300000, maintenance: 1500, stashCapacity: 0, security: 35, crewBonus: 0, frontSlots: 3, launderRate: 0.20 },
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial',
    emoji: '⚗️',
    desc: 'Processing facilities for product refinement',
    provides: ['lab', 'processing'],
    tiers: [
      { name: 'Garage Workshop', cost: 20000, maintenance: 200, stashCapacity: 3000, security: 5, crewBonus: 0, labCapacity: 1 },
      { name: 'Industrial Workshop', cost: 100000, maintenance: 600, stashCapacity: 15000, security: 20, crewBonus: 1, labCapacity: 2 },
      { name: 'Lab Complex', cost: 400000, maintenance: 2000, stashCapacity: 50000, security: 45, crewBonus: 2, labCapacity: 3 },
    ],
  },
];

const PROPERTY_UPGRADES = [
  { id: 'security_cameras', name: 'Security Cameras', emoji: '📷', cost: 2000, securityBonus: 10, desc: 'Detect raids earlier' },
  { id: 'reinforced_doors', name: 'Reinforced Doors', emoji: '🚪', cost: 5000, securityBonus: 15, desc: 'Slow down raid teams' },
  { id: 'alarm_system', name: 'Alarm System', emoji: '🚨', cost: 3000, securityBonus: 10, desc: 'Alert crew to danger' },
  { id: 'hidden_rooms', name: 'Hidden Rooms', emoji: '🔒', cost: 8000, securityBonus: 5, stashBonus: 5000, desc: 'Secret storage spaces' },
  { id: 'escape_tunnel', name: 'Escape Tunnel', emoji: '🕳️', cost: 15000, securityBonus: 20, desc: 'Emergency escape route' },
  { id: 'guard_post', name: 'Guard Post', emoji: '💂', cost: 10000, securityBonus: 25, desc: 'Station crew for defense' },
];

function initProperties() {
  return {};
}

function initStashes() {
  return {};
}

// Get all properties at a given location
function getPropertiesAtLocation(state, locationId) {
  if (!state.properties) return [];
  return state.properties[locationId] || [];
}

// Get total stash capacity at a location from all properties
function getStashCapacity(state, locationId) {
  const props = getPropertiesAtLocation(state, locationId);
  let total = 0;
  for (const prop of props) {
    const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
    if (ptype && ptype.tiers[prop.tier]) {
      total += ptype.tiers[prop.tier].stashCapacity;
      // Hidden rooms upgrade bonus
      if (prop.upgrades && prop.upgrades.includes('hidden_rooms')) {
        total += 100;
      }
    }
  }
  return total;
}

// Get stash count at a location
function getStashCount(state, locationId) {
  if (!state.stashes || !state.stashes[locationId]) return 0;
  return Object.values(state.stashes[locationId]).reduce((sum, amt) => sum + amt, 0);
}

// Get total crew bonus from properties
function getPropertyCrewBonus(state) {
  if (!state.properties) return 0;
  let bonus = 0;
  for (const locId of Object.keys(state.properties)) {
    for (const prop of state.properties[locId]) {
      const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
      if (ptype && ptype.tiers[prop.tier]) {
        bonus += ptype.tiers[prop.tier].crewBonus;
      }
    }
  }
  return bonus;
}

// Get lab capacity at a location
function getLabCapacity(state, locationId) {
  const props = getPropertiesAtLocation(state, locationId);
  let total = 0;
  for (const prop of props) {
    if (prop.type === 'industrial') {
      const ptype = PROPERTY_TYPES.find(p => p.id === 'industrial');
      if (ptype && ptype.tiers[prop.tier]) {
        total += ptype.tiers[prop.tier].labCapacity || 0;
      }
    }
  }
  return total;
}

// Get total front business slots at a location
function getFrontSlots(state, locationId) {
  const props = getPropertiesAtLocation(state, locationId);
  let total = 0;
  for (const prop of props) {
    if (prop.type === 'commercial') {
      const ptype = PROPERTY_TYPES.find(p => p.id === 'commercial');
      if (ptype && ptype.tiers[prop.tier]) {
        total += ptype.tiers[prop.tier].frontSlots || 0;
      }
    }
  }
  return total;
}

// Get total security at a location
function getPropertySecurity(state, locationId) {
  const props = getPropertiesAtLocation(state, locationId);
  let total = 0;
  for (const prop of props) {
    const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
    if (ptype && ptype.tiers[prop.tier]) {
      total += ptype.tiers[prop.tier].security;
    }
    // Upgrades
    if (prop.upgrades) {
      for (const upId of prop.upgrades) {
        const up = PROPERTY_UPGRADES.find(u => u.id === upId);
        if (up) total += up.securityBonus;
      }
    }
  }
  return total;
}

// Buy a property at the current location
function buyProperty(state, propertyTypeId, tier) {
  tier = tier || 0;
  const ptype = PROPERTY_TYPES.find(p => p.id === propertyTypeId);
  if (!ptype) return { success: false, msg: 'Unknown property type' };
  if (!ptype.tiers[tier]) return { success: false, msg: 'Invalid tier' };

  const tierData = ptype.tiers[tier];
  if (state.cash < tierData.cost) return { success: false, msg: 'Not enough cash. Need $' + tierData.cost.toLocaleString() };

  const locId = state.currentLocation;
  if (!state.properties) state.properties = {};
  if (!state.properties[locId]) state.properties[locId] = [];

  // Check if already own this type at this location
  const existing = state.properties[locId].find(p => p.type === propertyTypeId);
  if (existing) return { success: false, msg: 'Already own a ' + ptype.name + ' here. Upgrade instead.' };

  state.cash -= tierData.cost;
  state.properties[locId].push({
    type: propertyTypeId,
    tier: tier,
    security: tierData.security,
    upgrades: [],
    dayPurchased: state.day,
    totalMaintenancePaid: 0,
  });

  // Init stash storage for this location if property provides stash
  if (ptype.provides.includes('stash') && !state.stashes[locId]) {
    state.stashes[locId] = {};
  }

  return { success: true, msg: 'Purchased ' + tierData.name + ' in ' + (LOCATIONS.find(l => l.id === locId) || {}).name + ' for $' + tierData.cost.toLocaleString() };
}

// Upgrade a property to next tier
function upgradeProperty(state, locationId, propertyIndex) {
  if (!state.properties || !state.properties[locationId]) return { success: false, msg: 'No properties here' };
  const prop = state.properties[locationId][propertyIndex];
  if (!prop) return { success: false, msg: 'Property not found' };

  const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
  if (!ptype) return { success: false, msg: 'Unknown type' };

  const nextTier = prop.tier + 1;
  if (!ptype.tiers[nextTier]) return { success: false, msg: 'Already max tier' };

  const upgradeCost = ptype.tiers[nextTier].cost - ptype.tiers[prop.tier].cost;
  if (state.cash < upgradeCost) return { success: false, msg: 'Need $' + upgradeCost.toLocaleString() + ' to upgrade' };

  state.cash -= upgradeCost;
  prop.tier = nextTier;
  prop.security = ptype.tiers[nextTier].security;

  return { success: true, msg: 'Upgraded to ' + ptype.tiers[nextTier].name + ' for $' + upgradeCost.toLocaleString() };
}

// Add an upgrade to a property
function addPropertyUpgrade(state, locationId, propertyIndex, upgradeId) {
  if (!state.properties || !state.properties[locationId]) return { success: false, msg: 'No properties here' };
  const prop = state.properties[locationId][propertyIndex];
  if (!prop) return { success: false, msg: 'Property not found' };

  const upgrade = PROPERTY_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return { success: false, msg: 'Unknown upgrade' };
  if (prop.upgrades.includes(upgradeId)) return { success: false, msg: 'Already installed' };
  if (state.cash < upgrade.cost) return { success: false, msg: 'Need $' + upgrade.cost.toLocaleString() };

  state.cash -= upgrade.cost;
  prop.upgrades.push(upgradeId);

  return { success: true, msg: 'Installed ' + upgrade.name + ' for $' + upgrade.cost.toLocaleString() };
}

// Process daily property maintenance and events
function processPropertiesDaily(state) {
  if (!state.properties) return [];
  const messages = [];

  for (const locId of Object.keys(state.properties)) {
    for (let i = state.properties[locId].length - 1; i >= 0; i--) {
      const prop = state.properties[locId][i];
      const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
      if (!ptype || !ptype.tiers[prop.tier]) continue;

      const tierData = ptype.tiers[prop.tier];

      // Maintenance cost
      if (state.cash >= tierData.maintenance) {
        state.cash -= tierData.maintenance;
        prop.totalMaintenancePaid = (prop.totalMaintenancePaid || 0) + tierData.maintenance;
      } else {
        // Can't pay maintenance - property degrades
        messages.push(`${ptype.emoji} Can't pay $${tierData.maintenance} maintenance for ${tierData.name} in ${locId}!`);
        // Small chance of property being seized/damaged if unpaid for extended period
        prop.maintenanceDebt = (prop.maintenanceDebt || 0) + tierData.maintenance;
        if (prop.maintenanceDebt > tierData.cost * 0.3) {
          messages.push(`${ptype.emoji} ${tierData.name} in ${locId} has been CONDEMNED due to neglect!`);
          state.properties[locId].splice(i, 1);
          continue;
        }
      }

      // Raid risk based on heat and investigation level
      const investigationLevel = typeof getInvestigationLevel === 'function'
        ? getInvestigationLevel(state.investigation ? state.investigation.points : 0).level
        : 0;
      const raidChance = (investigationLevel * 0.01) + (state.heat > 50 ? 0.02 : 0);

      if (raidChance > 0 && Math.random() < raidChance) {
        // Security check - higher security = higher chance to avoid raid damage
        const securityRoll = Math.random() * 100;
        const totalSecurity = getPropertySecurity(state, locId);

        if (securityRoll < totalSecurity) {
          messages.push(`🚔 Raid attempt on ${tierData.name} in ${locId} - security held!`);
        } else {
          // Raid succeeds - lose some stashed drugs
          if (state.stashes && state.stashes[locId]) {
            const drugs = Object.keys(state.stashes[locId]);
            if (drugs.length > 0) {
              const targetDrug = drugs[Math.floor(Math.random() * drugs.length)];
              const lostAmount = Math.ceil(state.stashes[locId][targetDrug] * (0.3 + Math.random() * 0.3));
              state.stashes[locId][targetDrug] = Math.max(0, state.stashes[locId][targetDrug] - lostAmount);
              if (state.stashes[locId][targetDrug] === 0) delete state.stashes[locId][targetDrug];
              messages.push(`🚔 RAID on ${tierData.name} in ${locId}! Lost ${lostAmount} units of ${targetDrug}!`);
            } else {
              messages.push(`🚔 RAID on ${tierData.name} in ${locId}! Nothing found.`);
            }
          }
          // Escape tunnel upgrade prevents additional consequences
          if (!prop.upgrades.includes('escape_tunnel')) {
            if (typeof updateInvestigation === 'function') {
              updateInvestigation(state, 'property_raid', 5);
            }
          }
        }
      }
    }
  }

  return messages;
}

// Stash drugs at current location
function stashDrugsAtLocation(state, drugId, amount) {
  const locId = state.currentLocation;
  const capacity = getStashCapacity(state, locId);
  if (capacity <= 0) return { success: false, msg: 'No storage property at this location' };

  const currentCount = getStashCount(state, locId);
  if (currentCount + amount > capacity) return { success: false, msg: 'Not enough stash space. Capacity: ' + capacity + ', Used: ' + currentCount };

  const held = state.inventory[drugId] || 0;
  if (held < amount) return { success: false, msg: 'Not carrying enough' };

  state.inventory[drugId] -= amount;
  if (state.inventory[drugId] <= 0) delete state.inventory[drugId];

  if (!state.stashes) state.stashes = {};
  if (!state.stashes[locId]) state.stashes[locId] = {};
  state.stashes[locId][drugId] = (state.stashes[locId][drugId] || 0) + amount;

  return { success: true, msg: 'Stashed ' + amount + ' units of ' + drugId };
}

// Retrieve drugs from stash at current location
function retrieveDrugsFromLocation(state, drugId, amount) {
  const locId = state.currentLocation;
  if (!state.stashes || !state.stashes[locId] || !state.stashes[locId][drugId]) {
    return { success: false, msg: 'Nothing stashed here' };
  }

  const stashed = state.stashes[locId][drugId];
  if (stashed < amount) return { success: false, msg: 'Only ' + stashed + ' units stashed' };

  const currentInv = typeof getInventoryCount === 'function' ? getInventoryCount(state) : 0;
  const maxInv = typeof getMaxInventory === 'function' ? getMaxInventory(state) : state.inventorySpace;
  if (currentInv + amount > maxInv) return { success: false, msg: 'Not enough inventory space' };

  state.stashes[locId][drugId] -= amount;
  if (state.stashes[locId][drugId] <= 0) delete state.stashes[locId][drugId];

  state.inventory[drugId] = (state.inventory[drugId] || 0) + amount;

  return { success: true, msg: 'Retrieved ' + amount + ' units of ' + drugId };
}

// Get total property value across all locations
function getTotalPropertyValue(state) {
  if (!state.properties) return 0;
  let total = 0;
  for (const locId of Object.keys(state.properties)) {
    for (const prop of state.properties[locId]) {
      const ptype = PROPERTY_TYPES.find(p => p.id === prop.type);
      if (ptype && ptype.tiers[prop.tier]) {
        total += ptype.tiers[prop.tier].cost;
      }
    }
  }
  return total;
}

// Count total owned properties
function getTotalPropertyCount(state) {
  if (!state.properties) return 0;
  let count = 0;
  for (const locId of Object.keys(state.properties)) {
    count += state.properties[locId].length;
  }
  return count;
}
