// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Turf War System
// Rival gangs attack your territories. Defend or lose them.
// ============================================================

const TURF_WAR_CONFIG = {
  baseAttackChance: 0.03,      // 3% per territory per day base
  heatMultiplier: 0.02,        // +2% per heat point (high heat = more attacks)
  maxAttackChance: 0.15,       // 15% max per territory per day
  defenseBonus: {
    crewPerTerritory: 0.05,    // Each crew member adds 5% defense
    securityUpgrade: 0.15,     // Security upgrade adds 15% defense
    safeHouseBonus: 0.10,      // Having a safe house adds 10% defense
    reputationScale: 0.002,    // Each reputation point adds 0.2% defense
  },
  rewards: {
    cashPerDefense: 2000,      // Cash reward for defending
    repPerDefense: 3,          // Reputation gained
    xpPerDefense: 30,          // XP gained
  },
  losses: {
    repPerLoss: -10,           // Reputation lost
    heatPerLoss: 10,           // Heat gained from losing territory
  },
  warTypes: [
    {
      id: 'skirmish', name: 'Skirmish', emoji: '⚔️',
      strengthMod: 0.5, chance: 0.50,
      desc: 'A small raiding party tests your defenses.',
    },
    {
      id: 'raid', name: 'Gang Raid', emoji: '💥',
      strengthMod: 1.0, chance: 0.30,
      desc: 'A coordinated assault on your territory.',
    },
    {
      id: 'full_war', name: 'Full-Scale War', emoji: '🔥',
      strengthMod: 1.5, chance: 0.15,
      desc: 'The rival gang launches an all-out war for control.',
    },
    {
      id: 'betrayal', name: 'Inside Betrayal', emoji: '🗡️',
      strengthMod: 1.2, chance: 0.05,
      desc: 'A traitor within your ranks aids the enemy attack.',
    },
  ],
};

function initTurfWarState() {
  return {
    wars: [],              // Active turf wars { territory, warType, enemyGang, day }
    warHistory: [],        // { territory, warType, result, day }
    totalDefended: 0,
    totalLost: 0,
    currentWar: null,      // Active war event for combat
  };
}

// Called daily from waitDay
function processTurfWarsDaily(state) {
  if (!state.turfWars) state.turfWars = initTurfWarState();
  const msgs = [];
  const territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
  if (territories.length === 0) return msgs;

  // Check each territory for attack
  for (const terr of territories) {
    const gang = typeof getTerritoryGang === 'function' ? getTerritoryGang(terr) : null;
    if (!gang) continue;

    // Calculate attack chance (scales with game day)
    let attackChance = TURF_WAR_CONFIG.baseAttackChance;
    attackChance += (state.heat || 0) * TURF_WAR_CONFIG.heatMultiplier / 100;
    // Game day scaling: territory attacks increase over 5000 days
    if (typeof getGameDayScaling === 'function') {
      var turfScale = getGameDayScaling(state);
      attackChance *= (turfScale.combatDifficulty || 1.0);
    }
    attackChance = Math.min(TURF_WAR_CONFIG.maxAttackChance * 1.5, attackChance); // Higher cap for scaled game

    // More territories = slightly higher chance (spread thin)
    attackChance += territories.length * 0.005;

    if (Math.random() >= attackChance) continue;

    // Attack happens! Determine war type
    const roll = Math.random();
    let cumulative = 0;
    let warType = TURF_WAR_CONFIG.warTypes[0];
    for (const wt of TURF_WAR_CONFIG.warTypes) {
      cumulative += wt.chance;
      if (roll < cumulative) { warType = wt; break; }
    }

    // Calculate defense strength
    const activeCrew = state.henchmen.filter(h => !h.injured).length;
    let defensePower = activeCrew * 15; // base crew combat power

    // Weapon power
    const weapon = typeof WEAPONS !== 'undefined' ? WEAPONS.find(w => w.id === state.equippedWeapon) : null;
    if (weapon) defensePower += weapon.damage;

    // Bonuses
    defensePower += (state.reputation || 0) * 0.5;
    if (state.safehouse && state.safehouse.current) defensePower += 20;
    const securityLevel = typeof getSafehouseSecurityLevel === 'function' ? getSafehouseSecurityLevel(state) : 0;
    defensePower += securityLevel * 0.5;

    // Gang attack strength
    const gangStrength = gang.strength || 3;
    const enemySoldiers = gang.soldiers[0] + Math.floor(Math.random() * (gang.soldiers[1] - gang.soldiers[0] + 1));
    let attackPower = enemySoldiers * (gang.dmg[0] + Math.random() * (gang.dmg[1] - gang.dmg[0])) * warType.strengthMod;

    // Betrayal: reduce defense
    if (warType.id === 'betrayal') {
      defensePower *= 0.7;
    }

    const locName = typeof LOCATIONS !== 'undefined' ? (LOCATIONS.find(l => l.id === terr) || {}).name || terr : terr;

    // Resolve automatically (not interactive combat — that would be too disruptive to flow)
    const defenseRoll = defensePower * (0.7 + Math.random() * 0.6);
    const attackRoll = attackPower * (0.7 + Math.random() * 0.6);

    if (defenseRoll >= attackRoll) {
      // Defended successfully!
      state.turfWars.totalDefended++;
      state.turfWars.warHistory.push({ territory: terr, warType: warType.id, result: 'defended', day: state.day });
      const cashReward = TURF_WAR_CONFIG.rewards.cashPerDefense + (gangStrength * 500);
      state.cash += cashReward;
      if (typeof adjustRepFromAction === 'function') {
        adjustRepFromAction(state, 'combat_victory');
      } else {
        state.reputation = Math.min(100, (state.reputation || 0) + TURF_WAR_CONFIG.rewards.repPerDefense);
      }
      if (typeof awardXP === 'function') awardXP(state, 'win_combat', TURF_WAR_CONFIG.rewards.xpPerDefense);
      // Bodies from the fight
      const bodiesGenerated = Math.floor(enemySoldiers * 0.4);
      if (bodiesGenerated > 0 && typeof addBodies === 'function') {
        addBodies(state, bodiesGenerated, terr);
      }
      msgs.push(`${warType.emoji} TURF WAR: ${gang.name} attacked ${locName} — ${warType.name}! Your crew held the line! +$${cashReward.toLocaleString()}${bodiesGenerated > 0 ? ' ☠️' + bodiesGenerated + ' bodies' : ''}`);
    } else {
      // Territory lost!
      state.turfWars.totalLost++;
      state.turfWars.warHistory.push({ territory: terr, warType: warType.id, result: 'lost', day: state.day });
      if (state.territory && state.territory[terr]) {
        state.territory[terr].controlled = false;
      }
      state.reputation = Math.max(-100, (state.reputation || 0) + TURF_WAR_CONFIG.losses.repPerLoss);
      state.heat = Math.min(100, (state.heat || 0) + TURF_WAR_CONFIG.losses.heatPerLoss);
      // Some crew may get injured
      const activeCrew2 = state.henchmen.filter(h => !h.injured);
      if (activeCrew2.length > 0 && Math.random() < 0.4) {
        const idx = state.henchmen.indexOf(activeCrew2[Math.floor(Math.random() * activeCrew2.length)]);
        if (idx >= 0) {
          state.henchmen[idx].injured = true;
          state.henchmen[idx].health = Math.max(10, (state.henchmen[idx].health || 100) - 40);
        }
      }
      msgs.push(`${warType.emoji} TURF WAR: ${gang.name} attacked ${locName} — ${warType.name}! You lost control of the territory! 💔 Rep ${TURF_WAR_CONFIG.losses.repPerLoss}, Heat +${TURF_WAR_CONFIG.losses.heatPerLoss}`);
    }
  }

  // Trim history
  if (state.turfWars.warHistory.length > 50) state.turfWars.warHistory = state.turfWars.warHistory.slice(-50);

  return msgs;
}

// Get turf war summary for a territory
function getTurfWarSummary(state) {
  if (!state.turfWars) state.turfWars = initTurfWarState();
  return {
    totalDefended: state.turfWars.totalDefended,
    totalLost: state.turfWars.totalLost,
    recentWars: state.turfWars.warHistory.slice(-10),
  };
}
