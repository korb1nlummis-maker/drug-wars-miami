// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Expanded Skill System
// 8 Categories × 10 Levels (1-5 Campaign, 6-10 NG+)
// ============================================================

const SKILL_CATEGORIES = [
  {
    id: 'combat', name: 'Combat', emoji: '⚔️', color: '#ff4444',
    desc: 'Fighting ability, weapon proficiency, crew combat effectiveness.',
    levels: [
      { level: 1, name: 'Street Fighter', xpCost: 100, desc: 'Basic brawling. +10% unarmed damage.', effect: { damage: 1.10 } },
      { level: 2, name: 'Armed & Ready', xpCost: 250, desc: 'Weapon familiarity. +15% weapon damage.', effect: { damage: 1.15, weaponAccuracy: 0.05 } },
      { level: 3, name: 'Crew Commander', xpCost: 500, desc: 'Direct crew in combat. +20% crew damage.', effect: { crewDamage: 1.20, maxCrew: 1 } },
      { level: 4, name: 'War Tactician', xpCost: 1000, desc: 'Tactical advantage in turf wars. +25% defense.', effect: { defense: 1.25, turfWarBonus: 0.15 } },
      { level: 5, name: 'Kingpin\'s Wrath', xpCost: 2000, desc: 'Feared fighter. +30% all combat. Intimidation unlocked.', effect: { damage: 1.30, intimidation: true, fearBonus: 10 } },
      { level: 6, name: 'Master of Arms', xpCost: 4000, desc: 'NG+ — Dual wielding. +15% accuracy.', effect: { dualWield: true, accuracy: 0.15 }, ngPlus: true },
      { level: 7, name: 'Shock Trooper', xpCost: 7000, desc: 'NG+ — First-strike advantage. +20% initiative.', effect: { initiative: 1.20 }, ngPlus: true },
      { level: 8, name: 'Warlord', xpCost: 12000, desc: 'NG+ — Command large forces. +50% crew damage.', effect: { crewDamage: 1.50, maxCrew: 3 }, ngPlus: true },
      { level: 9, name: 'One-Man Army', xpCost: 20000, desc: 'NG+ — Solo combat mastery. +50% personal damage.', effect: { damage: 1.50 }, ngPlus: true },
      { level: 10, name: 'Death Incarnate', xpCost: 35000, desc: 'NG+ — Legendary. All combat +75%. Auto-win skirmishes.', effect: { damage: 1.75, autoWinSkirmish: true }, ngPlus: true },
    ],
  },
  {
    id: 'driving', name: 'Driving', emoji: '🚗', color: '#44aaff',
    desc: 'Vehicle handling, chase mechanics, travel efficiency.',
    levels: [
      { level: 1, name: 'Licensed Driver', xpCost: 100, desc: 'Basic driving. -10% travel time.', effect: { travelTime: 0.90 } },
      { level: 2, name: 'Getaway Driver', xpCost: 250, desc: 'Can flee combat by car. +15% chase escape.', effect: { chaseEscape: 0.15, fleeByVehicle: true } },
      { level: 3, name: 'Street Racer', xpCost: 500, desc: 'Faster travel. -20% travel time. Race events available.', effect: { travelTime: 0.80, raceEvents: true } },
      { level: 4, name: 'Wheelman', xpCost: 1000, desc: 'Expert driver. +30% chase escape. Vehicle damage -20%.', effect: { chaseEscape: 0.30, vehicleDamage: 0.80 } },
      { level: 5, name: 'Road King', xpCost: 2000, desc: '-30% travel time. Vehicle upgrade discount.', effect: { travelTime: 0.70, vehicleDiscount: 0.20 } },
      { level: 6, name: 'Stunt Driver', xpCost: 4000, desc: 'NG+ — Can perform pursuit actions. +20% chase escape.', effect: { pursuitActions: true, chaseEscape: 0.20 }, ngPlus: true },
      { level: 7, name: 'Convoy Leader', xpCost: 7000, desc: 'NG+ — Lead transport convoys. +50% transport capacity.', effect: { convoyCapacity: 1.50 }, ngPlus: true },
      { level: 8, name: 'Pilot License', xpCost: 12000, desc: 'NG+ — Can fly aircraft. Unlock air transport tiers.', effect: { pilotLicense: true }, ngPlus: true },
      { level: 9, name: 'Submarine Ops', xpCost: 20000, desc: 'NG+ — Can operate narco subs. Underwater smuggling.', effect: { subOps: true }, ngPlus: true },
      { level: 10, name: 'Ghost Rider', xpCost: 35000, desc: 'NG+ — Untraceable travel. Auto-escape police chases.', effect: { autoEscapeChase: true }, ngPlus: true },
    ],
  },
  {
    id: 'persuasion', name: 'Persuasion', emoji: '🗣️', color: '#ff88ff',
    desc: 'Social manipulation, negotiation, faction diplomacy.',
    levels: [
      { level: 1, name: 'Smooth Talker', xpCost: 100, desc: '+10% buy/sell price advantage.', effect: { priceBonus: 0.10 } },
      { level: 2, name: 'Negotiator', xpCost: 250, desc: '+15% price advantage. Basic diplomacy.', effect: { priceBonus: 0.15, diplomacy: true } },
      { level: 3, name: 'Con Artist', xpCost: 500, desc: 'Can deceive NPCs. +20% price advantage.', effect: { priceBonus: 0.20, deception: true } },
      { level: 4, name: 'Silver Tongue', xpCost: 1000, desc: 'Faction diplomacy bonus. -20% bribe costs.', effect: { factionBonus: 1.25, bribeCost: 0.80 } },
      { level: 5, name: 'Puppet Master', xpCost: 2000, desc: 'Manipulate faction wars. +30% price advantage.', effect: { priceBonus: 0.30, factionManipulation: true } },
      { level: 6, name: 'Master Diplomat', xpCost: 4000, desc: 'NG+ — Can broker peace between factions.', effect: { brokerPeace: true }, ngPlus: true },
      { level: 7, name: 'Information Broker', xpCost: 7000, desc: 'NG+ — Sell intel to factions. New income stream.', effect: { intelBroker: true }, ngPlus: true },
      { level: 8, name: 'Kingmaker', xpCost: 12000, desc: 'NG+ — Influence faction leadership succession.', effect: { kingmaker: true }, ngPlus: true },
      { level: 9, name: 'Shadow Diplomat', xpCost: 20000, desc: 'NG+ — Manipulate all factions simultaneously.', effect: { multiManipulate: true }, ngPlus: true },
      { level: 10, name: 'The Voice', xpCost: 35000, desc: 'NG+ — Legendary persuader. Can avoid ANY conflict through words.', effect: { avoidAllConflict: true }, ngPlus: true },
    ],
  },
  {
    id: 'chemistry', name: 'Chemistry', emoji: '🧪', color: '#44ff44',
    desc: 'Drug processing, product quality, lab operations.',
    levels: [
      { level: 1, name: 'Amateur Cook', xpCost: 100, desc: 'Basic processing. Can cook crack from cocaine.', effect: { processing: true, yield: 1.0 } },
      { level: 2, name: 'Kitchen Chemist', xpCost: 250, desc: '+15% processing yield. Quality detection.', effect: { yield: 1.15, qualityDetect: true } },
      { level: 3, name: 'Lab Operator', xpCost: 500, desc: '+25% yield. Meth cooking. Reduced explosion risk.', effect: { yield: 1.25, methCook: true, explosionRisk: 0.50 } },
      { level: 4, name: 'Master Chemist', xpCost: 1000, desc: '+35% yield. Designer drug creation. Quality control.', effect: { yield: 1.35, designerDrugs: true } },
      { level: 5, name: 'Heisenberg', xpCost: 2000, desc: '+50% yield. Premium product. Top-tier processing.', effect: { yield: 1.50, premiumProduct: true, explosionRisk: 0.10 } },
      { level: 6, name: 'Pharmacologist', xpCost: 4000, desc: 'NG+ — Create synthetic drugs. New product lines.', effect: { synthetics: true }, ngPlus: true },
      { level: 7, name: 'Biotech Expert', xpCost: 7000, desc: 'NG+ — Genetically modified strains. +30% potency.', effect: { gmoStrains: true, potency: 1.30 }, ngPlus: true },
      { level: 8, name: 'Underground Pharma', xpCost: 12000, desc: 'NG+ — Mass production. 2x lab output.', effect: { massProduction: true, labOutput: 2.0 }, ngPlus: true },
      { level: 9, name: 'Drug Architect', xpCost: 20000, desc: 'NG+ — Create custom drugs. Name your product.', effect: { customDrugs: true }, ngPlus: true },
      { level: 10, name: 'The Alchemist', xpCost: 35000, desc: 'NG+ — Legendary chemist. +100% yield. Zero waste.', effect: { yield: 2.0, zeroWaste: true }, ngPlus: true },
    ],
  },
  {
    id: 'business', name: 'Business', emoji: '💼', color: '#ffaa44',
    desc: 'Money management, laundering, front businesses, investments.',
    levels: [
      { level: 1, name: 'Bookkeeper', xpCost: 100, desc: 'Track profits. Bank interest +0.5%.', effect: { bankInterest: 0.005 } },
      { level: 2, name: 'Entrepreneur', xpCost: 250, desc: 'Front business income +15%.', effect: { frontIncome: 1.15 } },
      { level: 3, name: 'Money Manager', xpCost: 500, desc: 'Laundering efficiency +20%. Investment access.', effect: { launderEfficiency: 1.20, investments: true } },
      { level: 4, name: 'Tycoon', xpCost: 1000, desc: 'Property income +25%. Cheaper property purchases.', effect: { propertyIncome: 1.25, propertyCost: 0.85 } },
      { level: 5, name: 'Empire Builder', xpCost: 2000, desc: 'All income +20%. Shell companies. Offshore accounts.', effect: { allIncome: 1.20, shellCompanies: true, offshore: true } },
      { level: 6, name: 'Corporate Raider', xpCost: 4000, desc: 'NG+ — Hostile takeover of rival businesses.', effect: { hostileTakeover: true }, ngPlus: true },
      { level: 7, name: 'Venture Capitalist', xpCost: 7000, desc: 'NG+ — Invest in other criminal operations for passive income.', effect: { ventureCapital: true }, ngPlus: true },
      { level: 8, name: 'Financial Architect', xpCost: 12000, desc: 'NG+ — Complex laundering. Near-invisible money trail.', effect: { complexLaundering: true, launderDetect: 0.10 }, ngPlus: true },
      { level: 9, name: 'Shadow Banker', xpCost: 20000, desc: 'NG+ — Run a parallel banking system. Crypto operations.', effect: { shadowBank: true, crypto: true }, ngPlus: true },
      { level: 10, name: 'The Mogul', xpCost: 35000, desc: 'NG+ — Legendary businessman. All business income doubled.', effect: { allIncome: 2.0 }, ngPlus: true },
    ],
  },
  {
    id: 'stealth', name: 'Stealth', emoji: '🥷', color: '#888888',
    desc: 'Avoiding detection, evading police, covert operations.',
    levels: [
      { level: 1, name: 'Low Profile', xpCost: 100, desc: 'Heat gain -10% from dealing.', effect: { heatReduction: 0.10 } },
      { level: 2, name: 'Shadow Dealer', xpCost: 250, desc: 'Heat gain -20%. Can deal in hostile territory undetected.', effect: { heatReduction: 0.20, stealthDeal: true } },
      { level: 3, name: 'Ghost', xpCost: 500, desc: 'Heat gain -30%. Police encounter avoidance +20%.', effect: { heatReduction: 0.30, policeAvoid: 0.20 } },
      { level: 4, name: 'Phantom', xpCost: 1000, desc: 'Heat gain -40%. Can escape raids. Investigation resistance.', effect: { heatReduction: 0.40, raidEscape: 0.30, investigationResist: 0.20 } },
      { level: 5, name: 'Invisible', xpCost: 2000, desc: 'Heat gain -50%. Can operate in any district unnoticed.', effect: { heatReduction: 0.50, universalStealth: true } },
      { level: 6, name: 'Counter-Intelligence', xpCost: 4000, desc: 'NG+ — Detect wiretaps. Counter-surveillance.', effect: { detectWiretap: true, counterSurv: true }, ngPlus: true },
      { level: 7, name: 'Master of Disguise', xpCost: 7000, desc: 'NG+ — Change identity. Avoid recognition.', effect: { disguise: true }, ngPlus: true },
      { level: 8, name: 'Infiltrator', xpCost: 12000, desc: 'NG+ — Infiltrate rival operations. Steal intel.', effect: { infiltrate: true }, ngPlus: true },
      { level: 9, name: 'Digital Ghost', xpCost: 20000, desc: 'NG+ — Erase digital footprint. Hack surveillance.', effect: { hackSurveillance: true }, ngPlus: true },
      { level: 10, name: 'The Specter', xpCost: 35000, desc: 'NG+ — Legendary stealth. Zero heat from any action.', effect: { zeroHeat: true }, ngPlus: true },
    ],
  },
  {
    id: 'leadership', name: 'Leadership', emoji: '👑', color: '#ffd700',
    desc: 'Crew management, loyalty, organization efficiency.',
    levels: [
      { level: 1, name: 'Shot Caller', xpCost: 100, desc: 'Crew loyalty decay -20%.', effect: { loyaltyDecay: 0.80 } },
      { level: 2, name: 'Boss', xpCost: 250, desc: 'Max crew +1. Crew recruitment cost -15%.', effect: { maxCrew: 1, recruitCost: 0.85 } },
      { level: 3, name: 'Lieutenant', xpCost: 500, desc: 'Crew hierarchy unlocked. Can promote soldiers.', effect: { hierarchy: true, maxCrew: 1 } },
      { level: 4, name: 'Underboss', xpCost: 1000, desc: 'Max crew +2. Crew efficiency +25%.', effect: { maxCrew: 2, crewEfficiency: 1.25 } },
      { level: 5, name: 'Don', xpCost: 2000, desc: 'Full hierarchy. Crew loyalty +30%. Can assign specialized roles.', effect: { fullHierarchy: true, loyaltyBonus: 0.30, specialRoles: true } },
      { level: 6, name: 'Godfather', xpCost: 4000, desc: 'NG+ — Crew auto-management. Can run operations remotely.', effect: { autoManage: true }, ngPlus: true },
      { level: 7, name: 'Warlord', xpCost: 7000, desc: 'NG+ — Command an army. Max crew tripled.', effect: { maxCrewTriple: true }, ngPlus: true },
      { level: 8, name: 'Empire Commander', xpCost: 12000, desc: 'NG+ — Multi-territory simultaneous operations.', effect: { multiOps: true }, ngPlus: true },
      { level: 9, name: 'Shadow King', xpCost: 20000, desc: 'NG+ — Rule through lieutenants. Untouchable.', effect: { lieutenantRule: true }, ngPlus: true },
      { level: 10, name: 'The Kingpin', xpCost: 35000, desc: 'NG+ — Legendary leader. Crew never betrays. Absolute loyalty.', effect: { absoluteLoyalty: true }, ngPlus: true },
    ],
  },
  {
    id: 'streetwise', name: 'Streetwise', emoji: '🌃', color: '#cc44ff',
    desc: 'Street knowledge, information gathering, survival instincts.',
    levels: [
      { level: 1, name: 'Street Smart', xpCost: 100, desc: 'Better price awareness. See price ranges before buying.', effect: { priceAwareness: true } },
      { level: 2, name: 'Connected', xpCost: 250, desc: 'Hear rumors about price events. +10% encounter avoidance.', effect: { rumors: true, encounterAvoid: 0.10 } },
      { level: 3, name: 'Networked', xpCost: 500, desc: 'Information network. Know rival movements. Snitch detection.', effect: { infoNetwork: true, snitchDetect: 0.30 } },
      { level: 4, name: 'OG', xpCost: 1000, desc: 'Deep connections. Tip-offs before police raids. +20% all awareness.', effect: { raidTipoff: true, awareness: 1.20 } },
      { level: 5, name: 'Legendary', xpCost: 2000, desc: 'Complete street knowledge. All intel available. Respect everywhere.', effect: { fullIntel: true, universalRespect: true } },
      { level: 6, name: 'Information Baron', xpCost: 4000, desc: 'NG+ — Sell intelligence. New income stream from intel.', effect: { sellIntel: true }, ngPlus: true },
      { level: 7, name: 'Spymaster', xpCost: 7000, desc: 'NG+ — Plant informants in rival organizations.', effect: { plantInformants: true }, ngPlus: true },
      { level: 8, name: 'Oracle', xpCost: 12000, desc: 'NG+ — Predict market movements. See 3-day price forecast.', effect: { pricePredict: 3 }, ngPlus: true },
      { level: 9, name: 'All-Seeing', xpCost: 20000, desc: 'NG+ — Complete city awareness. See all faction movements.', effect: { cityAwareness: true }, ngPlus: true },
      { level: 10, name: 'The Oracle', xpCost: 35000, desc: 'NG+ — Legendary street knowledge. Nothing surprises you. All info free.', effect: { omniscient: true }, ngPlus: true },
    ],
  },
];

// Get skill category by ID
function getSkillCategory(skillId) {
  return SKILL_CATEGORIES.find(s => s.id === skillId) || null;
}

// Get current skill level data
function getSkillLevelData(skillId, level) {
  const cat = getSkillCategory(skillId);
  if (!cat) return null;
  return cat.levels.find(l => l.level === level) || null;
}

// Get total XP cost for a skill level
function getSkillUpgradeCost(skillId, currentLevel) {
  const nextLevel = getSkillLevelData(skillId, currentLevel + 1);
  if (!nextLevel) return Infinity;
  return nextLevel.xpCost;
}

// Check if player can upgrade a skill
function canUpgradeSkill(state, skillId) {
  const currentLevel = (state.skills && state.skills[skillId]) || 0;
  if (currentLevel >= 10) return false;
  if (currentLevel >= 5 && !(state.newGamePlus && state.newGamePlus.active)) return false; // NG+ only after 5

  const cost = getSkillUpgradeCost(skillId, currentLevel);
  return (state.xp || 0) >= cost;
}

// Upgrade a skill
function upgradeSkill(state, skillId) {
  if (!canUpgradeSkill(state, skillId)) return false;

  const currentLevel = (state.skills && state.skills[skillId]) || 0;
  const cost = getSkillUpgradeCost(skillId, currentLevel);

  state.xp -= cost;
  if (!state.skills) state.skills = {};
  state.skills[skillId] = currentLevel + 1;

  return true;
}

// Get all active skill effects for a player
function getActiveSkillEffects(state) {
  const effects = {};
  if (!state.skills) return effects;

  for (const [skillId, level] of Object.entries(state.skills)) {
    const cat = getSkillCategory(skillId);
    if (!cat) continue;

    for (const skillLevel of cat.levels) {
      if (skillLevel.level <= level) {
        // Merge effects
        for (const [key, value] of Object.entries(skillLevel.effect)) {
          if (typeof value === 'number') {
            // For multipliers, take the best one
            if (effects[key] === undefined || value > effects[key]) {
              effects[key] = value;
            }
          } else {
            effects[key] = value;
          }
        }
      }
    }
  }

  return effects;
}

// Apply skill bonus to a specific calculation
function getSkillBonus(state, effectKey, defaultValue) {
  const effects = getActiveSkillEffects(state);
  return effects[effectKey] !== undefined ? effects[effectKey] : defaultValue;
}

// Get total XP needed for next level across all skills
function getSkillProgressSummary(state) {
  const summary = [];
  for (const cat of SKILL_CATEGORIES) {
    const level = (state.skills && state.skills[cat.id]) || 0;
    const nextData = getSkillLevelData(cat.id, level + 1);
    summary.push({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      level: level,
      maxLevel: (state.newGamePlus && state.newGamePlus.active) ? 10 : 5,
      nextLevelName: nextData ? nextData.name : 'MAX',
      nextLevelCost: nextData ? nextData.xpCost : 0,
      canUpgrade: canUpgradeSkill(state, cat.id),
    });
  }
  return summary;
}
