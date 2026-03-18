// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Safe House System
// Upgradable hideout with visual money stacks
// ============================================================

const SAFEHOUSE_TIERS = [
  {
    id: 'motel', name: 'Dingy Motel Room', emoji: '🏚️', tag: 'TIER 1',
    cost: 2000, maintenance: 25, heatReduction: 1, stash: 1000, security: 5,
    desc: 'A grimy motel room with a stained mattress and a flickering bulb. Not much, but it keeps you off the street.'
  },
  {
    id: 'studio', name: 'Studio Apartment', emoji: '🏠', tag: 'TIER 2',
    cost: 15000, maintenance: 100, heatReduction: 3, stash: 5000, security: 15,
    desc: 'Basic furnished apartment with a TV and small closet. Quiet neighborhood, low profile.'
  },
  {
    id: 'condo', name: 'Luxury Condo', emoji: '🏢', tag: 'TIER 3',
    cost: 80000, maintenance: 400, heatReduction: 6, stash: 25000, security: 30,
    desc: 'Modern high-rise condo with ocean views, built-in safe, and concierge security.'
  },
  {
    id: 'penthouse', name: 'Fortified Penthouse', emoji: '🏰', tag: 'TIER 4',
    cost: 350000, maintenance: 1200, heatReduction: 10, stash: 100000, security: 60,
    desc: 'Top-floor penthouse with reinforced walls, surveillance system, and private elevator access.'
  },
  {
    id: 'bunker', name: 'Underground Bunker', emoji: '🛡️', tag: 'TIER 5',
    cost: 1500000, maintenance: 3000, heatReduction: 20, stash: 500000, security: 100,
    desc: 'Military-grade underground compound. Blast doors, armory, multiple rooms. The feds will never find you.'
  }
];

const SAFEHOUSE_UPGRADES = [
  {
    id: 'reinforced_door', name: 'Reinforced Door', emoji: '🚪', cost: 5000,
    securityBonus: 5, desc: 'Steel-core door. Reduces raid breach chance.'
  },
  {
    id: 'security_cameras', name: 'Security Cameras', emoji: '📷', cost: 12000,
    securityBonus: 10, desc: 'CCTV system. Early warning on incoming raids.'
  },
  {
    id: 'hidden_room', name: 'Hidden Room', emoji: '🔒', cost: 25000,
    stashBonus: 100, desc: 'Concealed compartment. Police miss half your stash on raids.'
  },
  {
    id: 'weapons_cache', name: 'Weapons Cache', emoji: '🔫', cost: 20000,
    securityBonus: 15, desc: 'Armory locker. Auto-equips your best weapon during raids.'
  },
  {
    id: 'escape_tunnel', name: 'Escape Tunnel', emoji: '🕳️', cost: 50000,
    desc: '50% chance to escape raids completely. Exit leads 2 blocks away.'
  },
  {
    id: 'money_counter', name: 'Money Counter', emoji: '🏧', cost: 8000,
    desc: 'High-speed bill counter. Shows precise cash breakdown in your safe house.'
  },
  {
    id: 'panic_room', name: 'Panic Room', emoji: '🏠', cost: 100000,
    securityBonus: 25, desc: 'Fortified inner room. Survive any raid without personal losses.'
  },
  {
    id: 'generator', name: 'Backup Generator', emoji: '⚡', cost: 15000,
    desc: 'Diesel generator. Safe house stays operational during city events and blackouts.'
  }
];

function initSafehouseState() {
  return {
    current: null,
    tier: -1,
    upgrades: [],
    discovered: false,
    daysPurchased: 0
  };
}

function processSafehouseDaily(state) {
  if (!state.safehouse || state.safehouse.current === null) return [];
  const msgs = [];
  const tier = SAFEHOUSE_TIERS[state.safehouse.tier];
  if (!tier) return msgs;

  // Deduct maintenance
  if (state.cash >= tier.maintenance) {
    state.cash -= tier.maintenance;
  } else {
    // Can't afford maintenance — safe house deteriorates
    msgs.push('⚠️ Can\'t afford safe house maintenance ($' + tier.maintenance + '/day)!');
  }

  // Heat reduction
  if ((state.heat || 0) > 0) {
    const reduction = tier.heatReduction;
    state.heat = Math.max(0, state.heat - reduction);
    if (reduction > 0 && state.heat > 0) {
      msgs.push('🏠 Safe house reducing heat (-' + reduction + ')');
    }
  }

  // Discovery risk — very small chance police discover safe house
  // Higher heat = higher risk
  const discoveryChance = ((state.heat || 0) / 100) * 0.005; // 0.5% max at 100 heat
  const hasEscapeTunnel = (state.safehouse.upgrades || []).includes('escape_tunnel');
  const hasPanicRoom = (state.safehouse.upgrades || []).includes('panic_room');

  if (Math.random() < discoveryChance && !state.safehouse.discovered) {
    if (hasEscapeTunnel && Math.random() < 0.5) {
      msgs.push('🕳️ Police found your safe house but you escaped through the tunnel!');
    } else if (hasPanicRoom) {
      msgs.push('🏠 Police raided your safe house but your panic room kept you safe!');
    } else {
      // Lose some stash
      const hasCameras = (state.safehouse.upgrades || []).includes('security_cameras');
      const hasHiddenRoom = (state.safehouse.upgrades || []).includes('hidden_room');
      if (hasCameras) {
        msgs.push('📷 Cameras spotted the raid early — you moved most of your stash in time!');
      } else if (hasHiddenRoom) {
        msgs.push('🔒 Police raided your safe house but missed the hidden room!');
      } else {
        state.heat = Math.min(100, (state.heat || 0) + 10);
        msgs.push('🚨 Police discovered your safe house! Heat increased.');
      }
    }
  }

  return msgs;
}

function getSafehouseStashBonus(state) {
  if (!state.safehouse || state.safehouse.current === null) return 0;
  const tier = SAFEHOUSE_TIERS[state.safehouse.tier];
  let bonus = tier ? tier.stash : 0;
  if ((state.safehouse.upgrades || []).includes('hidden_room')) bonus += 100;
  return bonus;
}

function getSafehouseSecurityLevel(state) {
  if (!state.safehouse || state.safehouse.current === null) return 0;
  const tier = SAFEHOUSE_TIERS[state.safehouse.tier];
  let security = tier ? tier.security : 0;
  (state.safehouse.upgrades || []).forEach(uid => {
    const upgrade = SAFEHOUSE_UPGRADES.find(u => u.id === uid);
    if (upgrade && upgrade.securityBonus) security += upgrade.securityBonus;
  });
  return security;
}
