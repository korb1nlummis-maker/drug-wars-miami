// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Side Missions & Moral Dilemmas
// ============================================================

// ============================================================
// SIDE MISSION TEMPLATES
// ============================================================
const SIDE_MISSIONS = [
  // === DELIVERY MISSIONS ===
  { id: 'rush_delivery', name: 'Rush Delivery', emoji: '📦', category: 'delivery',
    tier: 1, actMin: 1, actMax: 5,
    desc: 'A buyer needs a specific drug delivered urgently.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const amount = 5 + Math.floor(Math.random() * 15);
      const reward = amount * (drug ? drug.maxPrice : 100) * (0.8 + Math.random() * 0.6);
      return { drugId: drug ? drug.id : 'weed', drugName: drug ? drug.name : 'Weed', amount, reward: Math.round(reward), daysLimit: 3 + Math.floor(Math.random() * 3) };
    },
    check: (state, data) => {
      const inv = state.inventory[data.drugId] || 0;
      return inv >= data.amount;
    },
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') adjustRep(state, 'trust', 3);
      return `📦 Delivered ${data.amount} ${data.drugName}! Earned $${data.reward.toLocaleString()}.`;
    },
    getText: (data) => `Deliver ${data.amount} ${data.drugName} within ${data.daysLimit} days for $${data.reward.toLocaleString()}.`
  },

  { id: 'bulk_order', name: 'Bulk Order', emoji: '🚛', category: 'delivery',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'A major buyer wants a large quantity.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const amount = 30 + Math.floor(Math.random() * 70);
      const reward = amount * (drug ? drug.maxPrice : 100) * (1.0 + Math.random() * 0.5);
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', amount, reward: Math.round(reward), daysLimit: 7 + Math.floor(Math.random() * 7) };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 5); adjustRep(state, 'trust', 5); }
      return `🚛 Bulk order complete! ${data.amount} ${data.drugName} delivered for $${data.reward.toLocaleString()}.`;
    },
    getText: (data) => `Deliver ${data.amount} ${data.drugName} within ${data.daysLimit} days for $${data.reward.toLocaleString()}.`
  },

  // === COMBAT MISSIONS ===
  { id: 'hit_job', name: 'Hit Job', emoji: '🔫', category: 'combat',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'Someone needs a rival eliminated.',
    generate: (state) => {
      const names = ['Razor Eddie', 'Big Tony', 'Snake', 'Manny the Blade', 'El Diablo', 'The Professor', 'Ice Pick Joe', 'Dirty Mike'];
      const target = names[Math.floor(Math.random() * names.length)];
      const reward = 5000 + Math.floor(Math.random() * 15000);
      const hp = 40 + Math.floor(Math.random() * 60);
      const dmg = 8 + Math.floor(Math.random() * 12);
      return { target, reward, targetHp: hp, targetDmg: dmg };
    },
    check: () => true,
    complete: (state, data) => {
      // Simulate combat
      let playerHp = state.health;
      let targetHp = data.targetHp;
      const weapon = state.weapon ? (typeof WEAPONS !== 'undefined' ? WEAPONS.find(w => w.id === state.weapon) : null) : null;
      const playerDmg = weapon ? weapon.damage : 10;

      while (playerHp > 0 && targetHp > 0) {
        targetHp -= Math.round(playerDmg * (0.6 + Math.random() * 0.8));
        if (targetHp > 0) playerHp -= Math.round(data.targetDmg * (0.4 + Math.random() * 0.6));
      }

      if (playerHp <= 0) {
        state.health = 1;
        return `🔫 Hit on ${data.target} failed! You barely escaped alive.`;
      }

      state.health = Math.max(1, playerHp);
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 5); adjustRep(state, 'streetCred', 3); }
      state.heat = Math.min(100, state.heat + 8);
      return `🔫 ${data.target} eliminated! Earned $${data.reward.toLocaleString()}. Heat +8.`;
    },
    getText: (data) => `Eliminate ${data.target}. Reward: $${data.reward.toLocaleString()}. Target HP: ${data.targetHp}.`
  },

  { id: 'territory_defense', name: 'Territory Defense', emoji: '🛡️', category: 'combat',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'Defend a territory from a rival attack.',
    generate: (state) => {
      const territories = state.territory ? Object.keys(state.territory) : [];
      const loc = territories.length > 0 ? territories[Math.floor(Math.random() * territories.length)] : 'miami';
      const reward = 3000 + Math.floor(Math.random() * 10000);
      return { locationId: loc, reward, attackerStrength: 30 + Math.floor(Math.random() * 50) };
    },
    check: (state) => state.territory && Object.keys(state.territory).length > 0,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 10;
      const success = crewPower + Math.random() * 30 > data.attackerStrength;
      if (success) {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') adjustRep(state, 'fear', 3);
        return `🛡️ Territory defended! Earned $${data.reward.toLocaleString()}.`;
      } else {
        state.health = Math.max(1, state.health - 15);
        return `🛡️ Defense failed! Lost ground and took damage. -15 HP.`;
      }
    },
    getText: (data) => `Defend territory from attack (Strength: ${data.attackerStrength}). Reward: $${data.reward.toLocaleString()}.`
  },

  // === SMUGGLING MISSIONS ===
  { id: 'border_run', name: 'Border Run', emoji: '🚗', category: 'smuggling',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'Smuggle goods across a checkpoint.',
    generate: (state) => {
      const reward = 8000 + Math.floor(Math.random() * 20000);
      const difficulty = 30 + Math.floor(Math.random() * 40);
      return { reward, difficulty, interceptChance: difficulty };
    },
    check: () => true,
    complete: (state, data) => {
      const driving = state.skills && state.skills['driving'] ? state.skills['driving'] * 5 : 0;
      const roll = Math.random() * 100 + driving;
      if (roll > data.interceptChance) {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 4);
        return `🚗 Border run successful! Earned $${data.reward.toLocaleString()}.`;
      } else {
        state.heat = Math.min(100, state.heat + 15);
        const fine = Math.round(data.reward * 0.3);
        state.cash = Math.max(0, state.cash - fine);
        return `🚗 Caught at the checkpoint! Lost $${fine.toLocaleString()} and gained +15 heat.`;
      }
    },
    getText: (data) => `Smuggle through a checkpoint (Difficulty: ${data.difficulty}%). Reward: $${data.reward.toLocaleString()}.`
  },

  // === SOCIAL MISSIONS ===
  { id: 'negotiate_deal', name: 'Broker a Deal', emoji: '🤝', category: 'social',
    tier: 1, actMin: 1, actMax: 5,
    desc: 'Mediate between two parties for a cut.',
    generate: (state) => {
      const reward = 2000 + Math.floor(Math.random() * 8000);
      const speechReq = 2 + Math.floor(Math.random() * 5);
      return { reward, speechReq };
    },
    check: () => true,
    complete: (state, data) => {
      const speech = typeof getEffectiveSpeech === 'function' ? getEffectiveSpeech(state) : (state.speechSkill || 0);
      if (speech >= data.speechReq) {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 4); adjustRep(state, 'publicImage', 2); }
        return `🤝 Deal brokered! Earned $${data.reward.toLocaleString()}.`;
      } else {
        if (typeof adjustRep === 'function') adjustRep(state, 'trust', -2);
        return `🤝 Negotiations broke down. Your speech skill wasn't enough (needed ${data.speechReq}).`;
      }
    },
    getText: (data) => `Broker a deal between two parties. Speech needed: ${data.speechReq}. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'informant_mission', name: 'Plant Informant', emoji: '👂', category: 'social',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Plant a mole in a rival organization.',
    generate: (state) => {
      const cost = 5000 + Math.floor(Math.random() * 10000);
      return { cost, daysToComplete: 5 + Math.floor(Math.random() * 10) };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      // Add intel
      if (state.politics && state.politics.intelGathered) {
        state.politics.intelGathered.push({ info: 'Rival organization movements and plans', day: state.day, quality: 3 });
      }
      if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 3);
      return `👂 Informant planted! Cost $${data.cost.toLocaleString()}. Intel incoming over ${data.daysToComplete} days.`;
    },
    getText: (data) => `Plant an informant. Cost: $${data.cost.toLocaleString()}. Intel arrives over ${data.daysToComplete} days.`
  },

  // === HEIST MISSIONS ===
  { id: 'warehouse_heist', name: 'Warehouse Heist', emoji: '🏭', category: 'heist',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Rob a rival\'s warehouse for drugs and cash.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const cashReward = 10000 + Math.floor(Math.random() * 40000);
      const drugAmount = 10 + Math.floor(Math.random() * 40);
      const difficulty = 40 + Math.floor(Math.random() * 40);
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', drugAmount, cashReward, difficulty };
    },
    check: (state) => (state.henchmen || []).length >= 2,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 8;
      const roll = Math.random() * 100 + crewPower;
      if (roll > data.difficulty) {
        state.cash += data.cashReward;
        state.inventory[data.drugId] = (state.inventory[data.drugId] || 0) + data.drugAmount;
        state.heat = Math.min(100, state.heat + 12);
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 5); adjustRep(state, 'streetCred', 5); }
        return `🏭 Heist success! Got $${data.cashReward.toLocaleString()} and ${data.drugAmount} ${data.drugName}. Heat +12.`;
      } else {
        const hench = state.henchmen[Math.floor(Math.random() * state.henchmen.length)];
        if (hench) hench.health = Math.max(0, (hench.health || 100) - 30);
        state.heat = Math.min(100, state.heat + 20);
        return `🏭 Heist failed! Crew took damage and heat +20.`;
      }
    },
    getText: (data) => `Rob warehouse. Difficulty: ${data.difficulty}%. Need 2+ crew. Reward: $${data.cashReward.toLocaleString()} + ${data.drugAmount} ${data.drugName}.`
  },

  { id: 'bank_job', name: 'Bank Job', emoji: '🏦', category: 'heist',
    tier: 4, actMin: 3, actMax: 5,
    desc: 'Hit a bank for a massive payday. Extremely risky.',
    generate: (state) => {
      const reward = 50000 + Math.floor(Math.random() * 150000);
      const difficulty = 60 + Math.floor(Math.random() * 30);
      return { reward, difficulty };
    },
    check: (state) => (state.henchmen || []).length >= 3 && state.weapon,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 6;
      const weaponBonus = state.weapon ? 15 : 0;
      const roll = Math.random() * 100 + crewPower + weaponBonus;
      if (roll > data.difficulty) {
        state.cash += data.reward;
        state.heat = Math.min(100, state.heat + 25);
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 10); adjustRep(state, 'heatSignature', 15); }
        return `🏦 BANK JOB SUCCESS! Score: $${data.reward.toLocaleString()}! Heat +25!`;
      } else {
        state.health = Math.max(1, state.health - 30);
        state.heat = Math.min(100, state.heat + 35);
        const fine = Math.round(data.reward * 0.2);
        state.cash = Math.max(0, state.cash - fine);
        return `🏦 Bank job went sideways! -30 HP, -$${fine.toLocaleString()}, Heat +35.`;
      }
    },
    getText: (data) => `Rob a bank. Difficulty: ${data.difficulty}%. Need 3+ crew + weapon. Reward: $${data.reward.toLocaleString()}.`
  },

  // === PROTECTION RACKET ===
  { id: 'protection_racket', name: 'Protection Racket', emoji: '💪', category: 'social',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'Shake down local businesses for protection money.',
    generate: (state) => {
      const reward = 3000 + Math.floor(Math.random() * 7000);
      return { reward, businesses: 2 + Math.floor(Math.random() * 4) };
    },
    check: (state) => (state.rep ? (state.rep.fear || 0) : 0) >= 20,
    complete: (state, data) => {
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 3); adjustRep(state, 'publicImage', -3); }
      state.heat = Math.min(100, state.heat + 5);
      return `💪 Collected $${data.reward.toLocaleString()} from ${data.businesses} businesses. Heat +5.`;
    },
    getText: (data) => `Collect protection from ${data.businesses} businesses. Reward: $${data.reward.toLocaleString()}.`
  },

  // === RESCUE MISSION ===
  { id: 'rescue_crew', name: 'Rescue Operation', emoji: '🆘', category: 'combat',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'A crew member has been captured. Go get them back.',
    generate: (state) => {
      const names = ['your lieutenant', 'a trusted soldier', 'your courier'];
      const target = names[Math.floor(Math.random() * names.length)];
      const difficulty = 40 + Math.floor(Math.random() * 40);
      return { target, difficulty };
    },
    check: (state) => (state.henchmen || []).length >= 1,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 8;
      const roll = Math.random() * 100 + crewPower;
      if (roll > data.difficulty) {
        for (const h of state.henchmen) { h.loyalty = Math.min(100, (h.loyalty || 80) + 10); }
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'fear', 3); }
        return `🆘 Rescued ${data.target}! Crew loyalty boosted across the board!`;
      } else {
        state.health = Math.max(1, state.health - 20);
        return `🆘 Rescue failed! -20 HP. ${data.target} is still captive.`;
      }
    },
    getText: (data) => `Rescue ${data.target}. Difficulty: ${data.difficulty}%.`
  },

  // === ITEM-BASED MISSIONS ===
  { id: 'weapon_acquisition', name: 'Arms Deal', emoji: '🔫', category: 'delivery',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'A client needs a specific weapon acquired and delivered.',
    generate: (state) => {
      const weapons = typeof WEAPONS !== 'undefined' ? WEAPONS : [{ id: 'beretta', name: 'Beretta', price: 1500 }];
      const w = weapons[Math.floor(Math.random() * weapons.length)];
      const reward = (w.price || 1500) * 2.5 + Math.floor(Math.random() * 5000);
      return { weaponId: w.id, weaponName: w.name || w.id, cost: w.price || 1500, reward: Math.round(reward), daysLimit: 5 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 4); adjustRep(state, 'fear', 2); }
      return `🔫 Delivered ${data.weaponName}! Earned $${(data.reward - data.cost).toLocaleString()} profit.`;
    },
    getText: (data) => `Acquire and deliver a ${data.weaponName}. Cost: $${data.cost.toLocaleString()}. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'property_task', name: 'Safe House Setup', emoji: '🏠', category: 'social',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'Set up a safe house for an associate using one of your properties.',
    generate: (state) => {
      const reward = 8000 + Math.floor(Math.random() * 12000);
      return { reward, daysLimit: 5 };
    },
    check: (state) => state.properties && Object.keys(state.properties).length > 0,
    complete: (state, data) => {
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 6); adjustRep(state, 'streetCred', 3); }
      return `🏠 Safe house established! Earned $${data.reward.toLocaleString()} and a grateful ally.`;
    },
    getText: (data) => `Provide a safe house from your properties. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'drug_quality_test', name: 'Quality Control', emoji: '🧪', category: 'delivery',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'A buyer wants product processed to a specific purity level.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs.filter(d => ['cocaine', 'heroin', 'meth'].includes(d.id))[0] || drugs[0];
      const amount = 10 + Math.floor(Math.random() * 20);
      const reward = amount * (drug ? drug.maxPrice : 200) * 1.5;
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', amount, reward: Math.round(reward), daysLimit: 7 };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount && state.processingLab,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') adjustRep(state, 'trust', 5);
      return `🧪 Premium product delivered! $${data.reward.toLocaleString()} earned.`;
    },
    getText: (data) => `Process and deliver ${data.amount} premium ${data.drugName}. Need lab access. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'supply_chain', name: 'Supply Route', emoji: '🛫', category: 'smuggling',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Establish a new import route for a specific drug to a target city.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const locs = typeof LOCATIONS !== 'undefined' ? LOCATIONS : [];
      const dest = locs[Math.floor(Math.random() * locs.length)];
      const reward = 15000 + Math.floor(Math.random() * 25000);
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', destId: dest ? dest.id : 'new_york', destName: dest ? dest.name : 'New York', reward, amount: 20 + Math.floor(Math.random() * 30), daysLimit: 10 };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 6); adjustRep(state, 'trust', 4); }
      return `🛫 Supply route to ${data.destName} established! $${data.reward.toLocaleString()} earned.`;
    },
    getText: (data) => `Ship ${data.amount} ${data.drugName} to ${data.destName}. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'market_flood', name: 'Market Flood', emoji: '🌊', category: 'delivery',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Flood a market with product to crash a rival\'s prices.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const amount = 50 + Math.floor(Math.random() * 50);
      const reward = amount * (drug ? drug.minPrice : 20) * 3;
      return { drugId: drug ? drug.id : 'weed', drugName: drug ? drug.name : 'Weed', amount, reward: Math.round(reward), daysLimit: 5 };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 8); adjustRep(state, 'fear', 3); }
      return `🌊 Market flooded with ${data.drugName}! Rival prices crashed. Earned $${data.reward.toLocaleString()}.`;
    },
    getText: (data) => `Deliver ${data.amount} ${data.drugName} to crash the market. Reward: $${data.reward.toLocaleString()}.`
  },

  // === DIALOGUE / CONVERSATION MISSIONS ===
  { id: 'informant_meeting', name: 'Meet the Informant', emoji: '🕵️', category: 'dialogue',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'Meet a confidential informant to extract intel without revealing your plans.',
    generate: (state) => {
      const reward = 5000 + Math.floor(Math.random() * 10000);
      return { reward, daysLimit: 5, dialogueState: 'start' };
    },
    check: () => true,
    complete: (state, data) => {
      const speech = state.rep ? (state.rep.streetCred || 0) : 0;
      if (speech >= 20 || Math.random() > 0.4) {
        state.cash += data.reward;
        if (state.politics && state.politics.intelGathered) {
          state.politics.intelGathered.push({ info: 'Rival shipment routes and schedules', day: state.day, quality: 3 });
        }
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 4);
        return `🕵️ Intel extracted successfully! $${data.reward.toLocaleString()} and valuable intel gained.`;
      } else {
        state.heat = Math.min(100, state.heat + 8);
        return '🕵️ The informant got suspicious and bolted. Heat +8.';
      }
    },
    getText: (data) => `Meet informant and extract intel. Reward: $${data.reward.toLocaleString()}.`,
    dialogue: [
      { id: 'start', text: 'A nervous man in a trench coat slides into the booth across from you. "You got what I asked for?"', speaker: 'Informant', choices: [
        { label: 'Play it cool', next: 'cool', effects: { trust: 2 } },
        { label: 'Get straight to business', next: 'business', effects: {} },
        { label: 'Threaten him', next: 'threaten', effects: { fear: 3 }, reqFear: 30 },
      ]},
      { id: 'cool', text: '"Relax. Nobody followed me. Let\'s have a drink first." He seems to calm down a bit.', speaker: 'You', choices: [
        { label: 'Ask about the shipment', next: 'intel', effects: { trust: 2 } },
        { label: 'Ask about his bosses', next: 'bosses', effects: {} },
      ]},
      { id: 'business', text: '"Right, right. Okay, so I got the information you wanted about the rival operation."', speaker: 'Informant', choices: [
        { label: 'What did you find?', next: 'intel', effects: {} },
        { label: 'Is this reliable?', next: 'reliable', effects: {} },
      ]},
      { id: 'threaten', text: 'He flinches. "Okay, okay! Don\'t hurt me. I\'ll tell you everything!" He starts talking fast.', speaker: 'Informant', choices: [
        { label: 'Give me everything', next: 'intel', effects: { fear: 2 } },
      ]},
      { id: 'intel', text: '"There\'s a big shipment coming through the docks next Tuesday. Colombian stuff. If you move fast..."', speaker: 'Informant', choices: [
        { label: 'Good work. Here\'s your payment.', next: 'end_good', effects: { cash: 'reward' } },
        { label: 'I need more than that.', next: 'more', effects: {} },
      ]},
      { id: 'bosses', text: '"I can\'t give you names... they\'d kill me. But I can tell you about the shipment routes."', speaker: 'Informant', choices: [
        { label: 'That\'ll do. Tell me.', next: 'intel', effects: {} },
      ]},
      { id: 'reliable', text: '"I staked it out myself! Three nights in a row. This is solid, I swear."', speaker: 'Informant', choices: [
        { label: 'Good enough. What\'s the intel?', next: 'intel', effects: {} },
      ]},
      { id: 'more', text: '"That\'s all I got right now! I\'m risking my neck here!" He looks panicked.', speaker: 'Informant', choices: [
        { label: 'Fine. Take the money.', next: 'end_good', effects: { cash: 'reward' } },
        { label: 'Then you\'re useless.', next: 'end_bad', effects: { trust: -3 } },
      ]},
      { id: 'end_good', text: 'He pockets the cash and disappears into the night. Good intel in hand.', speaker: 'narrator', choices: [] },
      { id: 'end_bad', text: 'He scrambles out of the booth and runs. You got some info at least.', speaker: 'narrator', choices: [] },
    ]
  },

  { id: 'cartel_negotiation', name: 'Cartel Negotiation', emoji: '🤵', category: 'dialogue',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Negotiate bulk pricing with a cartel supplier. Multi-choice conversation.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS.filter(d => ['cocaine', 'heroin'].includes(d.id)) : [];
      const drug = drugs[0] || { id: 'cocaine', name: 'Cocaine', maxPrice: 500 };
      const baseAmount = 50 + Math.floor(Math.random() * 100);
      const basePrice = Math.round((drug.maxPrice || 500) * 0.3);
      return { drugId: drug.id, drugName: drug.name, amount: baseAmount, basePrice, daysLimit: 7, dialogueState: 'start' };
    },
    check: (state, data) => state.cash >= data.basePrice * data.amount * 0.5,
    complete: (state, data) => {
      const speech = state.rep ? (state.rep.streetCred || 0) : 0;
      const discount = Math.min(0.3, speech * 0.003 + Math.random() * 0.1);
      const finalPrice = Math.round(data.basePrice * data.amount * (1 - discount));
      if (state.cash >= finalPrice) {
        state.cash -= finalPrice;
        state.inventory[data.drugId] = (state.inventory[data.drugId] || 0) + data.amount;
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
        return `🤵 Deal closed! Got ${data.amount} ${data.drugName} for $${finalPrice.toLocaleString()} (${Math.round(discount * 100)}% discount).`;
      }
      return `🤵 Couldn't close the deal — not enough cash. Need $${finalPrice.toLocaleString()}.`;
    },
    getText: (data) => `Negotiate for ${data.amount} ${data.drugName} at $${data.basePrice}/unit. Bring cash.`,
    dialogue: [
      { id: 'start', text: 'The cartel representative sits across from you at the cantina, flanked by two bodyguards. "So. You want to do business?"', speaker: 'Supplier', choices: [
        { label: 'I want the best price', next: 'haggle', effects: {} },
        { label: 'I\'m a volume buyer', next: 'volume', effects: {}, reqRep: 30 },
        { label: 'Show respect first', next: 'respect', effects: { trust: 3 } },
      ]},
      { id: 'haggle', text: '"Everyone wants the best price. What makes you special?" He lights a cigar.', speaker: 'Supplier', choices: [
        { label: 'I move more product than anyone', next: 'brag', effects: {} },
        { label: 'I have reliable distribution', next: 'distribution', effects: { trust: 2 } },
      ]},
      { id: 'volume', text: '"A volume buyer? Now you have my attention. How much are we talking?"', speaker: 'Supplier', choices: [
        { label: 'Enough to make this worth your time', next: 'deal', effects: { streetCred: 3 } },
      ]},
      { id: 'respect', text: 'He nods appreciatively. "A man with manners. I like that. Let\'s talk numbers."', speaker: 'Supplier', choices: [
        { label: 'Name your price', next: 'deal', effects: { trust: 2 } },
      ]},
      { id: 'brag', text: '"Talk is cheap, amigo. But I\'ll give you a chance to prove it."', speaker: 'Supplier', choices: [
        { label: 'Let\'s do this deal', next: 'deal', effects: {} },
      ]},
      { id: 'distribution', text: '"Distribution is everything. If you can move it fast, I can give you a better rate."', speaker: 'Supplier', choices: [
        { label: 'I guarantee fast turnover', next: 'deal', effects: { trust: 2 } },
      ]},
      { id: 'deal', text: 'He slides a number across the table on a napkin. "Take it or leave it."', speaker: 'Supplier', choices: [
        { label: 'Deal. Shake on it.', next: 'end_good', effects: { cash: 'complete' } },
        { label: 'I need a better number.', next: 'push', effects: {}, reqSpeech: 5 },
      ]},
      { id: 'push', text: 'He pauses. Then crosses out the number and writes a lower one. "Final offer."', speaker: 'Supplier', choices: [
        { label: 'Done.', next: 'end_good', effects: { cash: 'complete' } },
      ]},
      { id: 'end_good', text: 'You shake hands. The product will arrive within the week.', speaker: 'narrator', choices: [] },
    ]
  },

  { id: 'rival_parley', name: 'Rival Parley', emoji: '🏳️', category: 'dialogue',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Negotiate a truce or alliance with a rival faction leader.',
    generate: (state) => {
      const rivals = ['The Colombians', 'The Triads', 'The Bratva', 'The Yakuza', 'Los Zetas'];
      const rival = rivals[Math.floor(Math.random() * rivals.length)];
      return { rival, reward: 10000 + Math.floor(Math.random() * 20000), daysLimit: 5 };
    },
    check: (state) => (state.rep ? (state.rep.streetCred || 0) : 0) >= 20,
    complete: (state, data) => {
      if (Math.random() > 0.3) {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'publicImage', 5); }
        return `🏳️ Truce with ${data.rival} established! $${data.reward.toLocaleString()} peace dividend.`;
      }
      state.heat = Math.min(100, state.heat + 10);
      if (typeof adjustRep === 'function') adjustRep(state, 'fear', -5);
      return `🏳️ ${data.rival} rejected the parley. Tensions rise. Heat +10.`;
    },
    getText: (data) => `Negotiate with ${data.rival}. Need 20+ Street Cred. Potential reward: $${data.reward.toLocaleString()}.`,
    dialogue: [
      { id: 'start', text: 'You meet the rival boss at a neutral location. Armed guards watch from the shadows. "You wanted to talk. Talk."', speaker: 'Rival Boss', choices: [
        { label: 'Propose a truce', next: 'truce', effects: { trust: 3 } },
        { label: 'Propose an alliance', next: 'alliance', effects: {}, reqRep: 40 },
        { label: 'Show of strength', next: 'strength', effects: { fear: 5 }, reqFear: 40 },
      ]},
      { id: 'truce', text: '"A truce? And what do I get out of this arrangement?"', speaker: 'Rival Boss', choices: [
        { label: 'We split territories fairly', next: 'deal', effects: { trust: 3 } },
        { label: 'We stop killing each other\'s people', next: 'peace', effects: { trust: 5 } },
      ]},
      { id: 'alliance', text: '"An alliance? Bold. I\'m listening."', speaker: 'Rival Boss', choices: [
        { label: 'Together we control the market', next: 'deal', effects: { streetCred: 5 } },
      ]},
      { id: 'strength', text: 'He tenses, then laughs. "You\'ve got balls. Fine. Let\'s make this work."', speaker: 'Rival Boss', choices: [
        { label: 'Glad we understand each other', next: 'deal', effects: { fear: 3 } },
      ]},
      { id: 'peace', text: '"I\'ve lost good men too. Maybe you\'re right. Let\'s try this."', speaker: 'Rival Boss', choices: [
        { label: 'To peace.', next: 'end_good', effects: { cash: 'reward' } },
      ]},
      { id: 'deal', text: 'After an hour of negotiation, you reach an agreement. He extends his hand.', speaker: 'narrator', choices: [
        { label: 'Shake on it', next: 'end_good', effects: { cash: 'reward' } },
      ]},
      { id: 'end_good', text: 'The deal is done. Both sides stand down. For now.', speaker: 'narrator', choices: [] },
    ]
  },

  { id: 'undercover_contact', name: 'Trust Test', emoji: '🎭', category: 'dialogue',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'A new contact wants to do business. Are they legit or a cop?',
    generate: (state) => {
      const isCop = Math.random() < 0.35;
      const reward = 5000 + Math.floor(Math.random() * 10000);
      return { isCop, reward, daysLimit: 3 };
    },
    check: () => true,
    complete: (state, data) => {
      // Player's instinct based on rep
      const intuition = (state.rep ? (state.rep.streetCred || 0) : 0) * 0.5 + Math.random() * 50;
      if (data.isCop && intuition < 50) {
        state.heat = Math.min(100, state.heat + 20);
        return '🎭 IT WAS A SETUP! Undercover cop! Heat +20!';
      } else if (data.isCop) {
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
        return '🎭 You spotted the cop! Good instincts saved you.';
      } else {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') adjustRep(state, 'trust', 3);
        return `🎭 Legit contact! New business partner. Earned $${data.reward.toLocaleString()}.`;
      }
    },
    getText: (data) => `Vet a new contact. Reward if legit: $${data.reward.toLocaleString()}. Risk: could be undercover.`,
    dialogue: [
      { id: 'start', text: 'A well-dressed stranger approaches at the club. "I hear you\'re the person to talk to about... business opportunities."', speaker: 'Stranger', choices: [
        { label: 'Who sent you?', next: 'question', effects: {} },
        { label: 'Maybe. Depends what you need.', next: 'cautious', effects: { streetCred: 2 } },
        { label: 'Watch for tells (body language)', next: 'observe', effects: {}, reqRep: 25 },
      ]},
      { id: 'question', text: '"A mutual friend. Ricardo from the west side." He seems nervous.', speaker: 'Stranger', choices: [
        { label: 'Ricardo doesn\'t have friends', next: 'test', effects: {} },
        { label: 'Alright. What do you need?', next: 'deal', effects: {} },
      ]},
      { id: 'cautious', text: '"I need a reliable supplier. Someone discreet. I can move serious weight."', speaker: 'Stranger', choices: [
        { label: 'Let me check you out first', next: 'test', effects: {} },
        { label: 'How much are we talking?', next: 'deal', effects: {} },
      ]},
      { id: 'observe', text: 'You watch closely. His hands are steady but his eyes keep scanning exits. Trained behavior.', speaker: 'narrator', choices: [
        { label: 'Walk away — he\'s a cop', next: 'end_cop', effects: { streetCred: 5 } },
        { label: 'Could be just nerves. Keep talking.', next: 'deal', effects: {} },
      ]},
      { id: 'test', text: '"Look, I\'m just trying to do business here." He reaches for something inside his jacket...', speaker: 'Stranger', choices: [
        { label: 'Grab his arm — check for a wire', next: 'wire_check', effects: {} },
        { label: 'Let\'s do this somewhere private', next: 'deal', effects: {} },
      ]},
      { id: 'wire_check', text: 'No wire. Just a money clip with five grand. "Advance payment. To show I\'m serious."', speaker: 'Stranger', choices: [
        { label: 'Okay. Let\'s talk.', next: 'deal', effects: {} },
      ]},
      { id: 'deal', text: 'He outlines the deal. The numbers sound good. Maybe too good.', speaker: 'narrator', choices: [
        { label: 'Accept the deal', next: 'end_deal', effects: { cash: 'complete' } },
        { label: 'Something\'s off. Walk away.', next: 'end_cop', effects: {} },
      ]},
      { id: 'end_deal', text: 'You shake hands. Time will tell if this was smart.', speaker: 'narrator', choices: [] },
      { id: 'end_cop', text: 'You trust your gut and leave. Better safe than sorry.', speaker: 'narrator', choices: [] },
    ]
  },

  { id: 'political_dinner', name: 'Power Dinner', emoji: '🍽️', category: 'dialogue',
    tier: 3, actMin: 3, actMax: 5,
    desc: 'Navigate a social dinner with politicians and power brokers.',
    generate: (state) => {
      const reward = 15000 + Math.floor(Math.random() * 25000);
      return { reward, daysLimit: 3, politicalInfluence: 10 + Math.floor(Math.random() * 10) };
    },
    check: (state) => state.cash >= 5000 && (state.rep ? (state.rep.publicImage || 0) : 0) >= 0,
    complete: (state, data) => {
      state.cash -= 5000; // Dinner costs
      state.cash += data.reward;
      if (state.politics) state.politics.politicalInfluence = Math.min(100, (state.politics.politicalInfluence || 0) + data.politicalInfluence);
      if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 8); adjustRep(state, 'trust', 3); }
      return `🍽️ Successful dinner! Gained political influence +${data.politicalInfluence}. Earned $${data.reward.toLocaleString()}.`;
    },
    getText: (data) => `Attend political dinner. Cost: $5,000. Reward: $${data.reward.toLocaleString()} + political influence.`,
    dialogue: [
      { id: 'start', text: 'The dinner is at a waterfront mansion. Crystal chandeliers, champagne, and the mayor himself. A councilwoman approaches.', speaker: 'narrator', choices: [
        { label: 'Charm offensive', next: 'charm', effects: { publicImage: 3 } },
        { label: 'Talk business immediately', next: 'business', effects: { streetCred: 2 } },
        { label: 'Listen and observe', next: 'observe', effects: { trust: 2 } },
      ]},
      { id: 'charm', text: '"My, you\'re quite the conversationalist," the councilwoman smiles. "We should discuss that zoning issue..."', speaker: 'Councilwoman', choices: [
        { label: 'I\'d love to help the community', next: 'deal', effects: { publicImage: 5 } },
        { label: 'What\'s in it for me?', next: 'negotiate', effects: {} },
      ]},
      { id: 'business', text: '"Straight to the point. I respect that." A man with expensive cufflinks introduces himself. City planning commission.', speaker: 'Commissioner', choices: [
        { label: 'I have interests in the district', next: 'deal', effects: { streetCred: 3 } },
      ]},
      { id: 'observe', text: 'You watch the room. The mayor is whispering to a developer. A judge is drinking heavily. Useful information.', speaker: 'narrator', choices: [
        { label: 'Approach the mayor', next: 'deal', effects: { trust: 3 } },
        { label: 'Note the judge\'s weakness', next: 'blackmail', effects: { streetCred: 5 } },
      ]},
      { id: 'negotiate', text: '"Smart man. Well, there are certain... permits... that could benefit from expedited processing."', speaker: 'Councilwoman', choices: [
        { label: 'I think we can work together', next: 'deal', effects: { cash: 'reward' } },
      ]},
      { id: 'blackmail', text: 'You file away the information for later. The judge notices you watching and looks away nervously.', speaker: 'narrator', choices: [
        { label: 'Enjoy the rest of the evening', next: 'end_good', effects: { cash: 'complete' } },
      ]},
      { id: 'deal', text: 'By the end of the night, you\'ve made valuable connections. Business cards exchanged, promises made.', speaker: 'narrator', choices: [
        { label: 'A productive evening', next: 'end_good', effects: { cash: 'complete' } },
      ]},
      { id: 'end_good', text: 'You leave the mansion with new friends in high places.', speaker: 'narrator', choices: [] },
    ]
  },

  // === CREW MISSIONS ===
  { id: 'loyalty_test', name: 'Loyalty Test', emoji: '🎯', category: 'crew',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'Set up a scenario to test a crew member\'s loyalty.',
    generate: (state) => {
      return { reward: 0, daysLimit: 3 };
    },
    check: (state) => (state.henchmen || []).length >= 2,
    complete: (state, data) => {
      const crew = state.henchmen || [];
      const target = crew[Math.floor(Math.random() * crew.length)];
      if (!target) return '🎯 No crew to test.';
      if ((target.loyalty || 80) < 50 || Math.random() < 0.2) {
        target.loyalty = Math.max(0, (target.loyalty || 80) - 20);
        if (typeof adjustRep === 'function') adjustRep(state, 'fear', 5);
        return `🎯 ${target.name || 'Crew member'} FAILED the loyalty test! Loyalty dropped. Watch your back.`;
      }
      target.loyalty = Math.min(100, (target.loyalty || 80) + 15);
      if (typeof adjustRep === 'function') adjustRep(state, 'trust', 3);
      return `🎯 ${target.name || 'Crew member'} passed with flying colors! Loyalty increased.`;
    },
    getText: () => `Test your crew's loyalty. Reveals true allegiance.`
  },

  { id: 'crew_personal', name: 'Personal Favor', emoji: '❤️', category: 'crew',
    tier: 1, actMin: 1, actMax: 5,
    desc: 'A crew member needs help with a personal problem.',
    generate: (state) => {
      const problems = ['gambling debts', 'family medical bills', 'legal trouble', 'ex-partner harassment', 'housing eviction'];
      const problem = problems[Math.floor(Math.random() * problems.length)];
      const cost = 2000 + Math.floor(Math.random() * 8000);
      return { problem, cost, daysLimit: 5 };
    },
    check: (state, data) => state.cash >= data.cost && (state.henchmen || []).length >= 1,
    complete: (state, data) => {
      state.cash -= data.cost;
      const crew = state.henchmen || [];
      for (const h of crew) { h.loyalty = Math.min(100, (h.loyalty || 80) + 10); }
      if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'publicImage', 3); }
      return `❤️ Helped crew member with ${data.problem}. Cost $${data.cost.toLocaleString()}. Crew loyalty boosted!`;
    },
    getText: (data) => `Help crew member with ${data.problem}. Cost: $${data.cost.toLocaleString()}. Boosts all crew loyalty.`
  },

  { id: 'betrayal_investigation', name: 'Traitor Hunt', emoji: '🔍', category: 'crew',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Investigate a suspected traitor in your organization.',
    generate: (state) => {
      return { difficulty: 40 + Math.floor(Math.random() * 40), daysLimit: 7 };
    },
    check: (state) => (state.henchmen || []).length >= 3,
    complete: (state, data) => {
      const roll = Math.random() * 100;
      if (roll > data.difficulty) {
        const crew = state.henchmen || [];
        const traitor = crew.find(h => (h.loyalty || 80) < 50);
        if (traitor) {
          const idx = crew.indexOf(traitor);
          crew.splice(idx, 1);
          if (typeof adjustRep === 'function') adjustRep(state, 'fear', 8);
          return `🔍 Traitor found: ${traitor.name || 'Unknown'}! Removed from crew. Fear +8.`;
        }
        if (typeof adjustRep === 'function') adjustRep(state, 'trust', 5);
        return '🔍 Investigation complete. No traitors found. Crew is solid.';
      }
      if (typeof adjustRep === 'function') adjustRep(state, 'trust', -3);
      return '🔍 Investigation inconclusive. Paranoia spreads. Trust -3.';
    },
    getText: (data) => `Investigate crew for traitors. Difficulty: ${data.difficulty}%. Need 3+ crew.`
  },

  { id: 'promotion_trial', name: 'Promotion Trial', emoji: '⬆️', category: 'crew',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'A crew member wants to prove they deserve a promotion.',
    generate: (state) => {
      const reward = 3000 + Math.floor(Math.random() * 7000);
      return { reward, daysLimit: 5 };
    },
    check: (state) => (state.henchmen || []).length >= 1,
    complete: (state, data) => {
      const crew = state.henchmen || [];
      const member = crew[Math.floor(Math.random() * crew.length)];
      if (!member) return '⬆️ No eligible crew members.';
      if (Math.random() > 0.3) {
        member.combat = Math.min(10, (member.combat || 3) + 1);
        member.loyalty = Math.min(100, (member.loyalty || 80) + 15);
        state.cash += data.reward;
        return `⬆️ ${member.name || 'Crew member'} proved themselves! Combat +1, Loyalty +15. Bonus: $${data.reward.toLocaleString()}.`;
      }
      member.loyalty = Math.max(0, (member.loyalty || 80) - 10);
      return `⬆️ ${member.name || 'Crew member'} failed the trial. Loyalty -10.`;
    },
    getText: (data) => `Test crew member for promotion. Potential bonus: $${data.reward.toLocaleString()}.`
  },

  // === TERRITORY MISSIONS ===
  { id: 'territory_expansion', name: 'Territory Grab', emoji: '🏴', category: 'territory',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Expand your territory through force or negotiation.',
    generate: (state) => {
      const locs = typeof LOCATIONS !== 'undefined' ? LOCATIONS : [];
      const available = locs.filter(l => !state.territory || !state.territory[l.id]);
      const target = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : locs[0];
      return { locationId: target ? target.id : 'miami', locationName: target ? target.name : 'Miami', difficulty: 50 + Math.floor(Math.random() * 40), daysLimit: 10 };
    },
    check: (state) => (state.henchmen || []).length >= 2 && state.cash >= 10000,
    complete: (state, data) => {
      state.cash -= 10000;
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 6;
      if (crewPower + Math.random() * 50 > data.difficulty) {
        if (!state.territory) state.territory = {};
        state.territory[data.locationId] = { control: 50, day: state.day };
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 8); adjustRep(state, 'streetCred', 10); }
        return `🏴 Territory claimed in ${data.locationName}! Control: 50%.`;
      }
      state.heat = Math.min(100, state.heat + 15);
      return `🏴 Failed to claim ${data.locationName}. Heat +15.`;
    },
    getText: (data) => `Claim territory in ${data.locationName}. Cost: $10,000. Difficulty: ${data.difficulty}%.`
  },

  { id: 'sabotage_rival', name: 'Sabotage Op', emoji: '💣', category: 'territory',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Sabotage a rival\'s operations in their territory.',
    generate: (state) => {
      const reward = 8000 + Math.floor(Math.random() * 15000);
      return { reward, difficulty: 40 + Math.floor(Math.random() * 40), daysLimit: 5 };
    },
    check: (state) => (state.henchmen || []).length >= 1,
    complete: (state, data) => {
      if (Math.random() * 100 + ((state.henchmen || []).length * 10) > data.difficulty) {
        state.cash += data.reward;
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 5); adjustRep(state, 'streetCred', 5); }
        return `💣 Sabotage successful! Rival operations disrupted. Earned $${data.reward.toLocaleString()}.`;
      }
      state.heat = Math.min(100, state.heat + 12);
      state.health = Math.max(1, state.health - 10);
      return '💣 Sabotage failed! You were spotted. Heat +12, HP -10.';
    },
    getText: (data) => `Sabotage rival operations. Difficulty: ${data.difficulty}%. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'turf_war', name: 'Turf War', emoji: '⚔️', category: 'territory',
    tier: 4, actMin: 3, actMax: 5,
    desc: 'Full-scale territory confrontation with a rival gang.',
    generate: (state) => {
      const reward = 25000 + Math.floor(Math.random() * 50000);
      return { reward, enemyStrength: 50 + Math.floor(Math.random() * 50), daysLimit: 3 };
    },
    check: (state) => (state.henchmen || []).length >= 3 && state.weapon,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 8;
      const weaponBonus = state.weapon ? 20 : 0;
      if (crewPower + weaponBonus + Math.random() * 30 > data.enemyStrength) {
        state.cash += data.reward;
        state.heat = Math.min(100, state.heat + 20);
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 15); adjustRep(state, 'streetCred', 10); }
        return `⚔️ VICTORY! Turf war won! $${data.reward.toLocaleString()} and massive rep gains!`;
      }
      state.health = Math.max(1, state.health - 25);
      state.heat = Math.min(100, state.heat + 15);
      for (const h of (state.henchmen || [])) { h.health = Math.max(0, (h.health || 100) - 20); }
      return '⚔️ Turf war LOST. Heavy casualties. -25 HP, crew damaged.';
    },
    getText: (data) => `Full turf war. Enemy strength: ${data.enemyStrength}. Need 3+ crew + weapon. Reward: $${data.reward.toLocaleString()}.`
  },

  { id: 'neighborhood_invest', name: 'Community Investment', emoji: '🏘️', category: 'territory',
    tier: 2, actMin: 2, actMax: 5,
    desc: 'Invest in the local community to improve your public image.',
    generate: (state) => {
      const projects = ['youth basketball court', 'community garden', 'free clinic', 'soup kitchen', 'after-school program'];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const cost = 5000 + Math.floor(Math.random() * 15000);
      return { project, cost, daysLimit: 7 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 15); adjustRep(state, 'trust', 8); adjustRep(state, 'heatSignature', -5); }
      state.heat = Math.max(0, state.heat - 10);
      return `🏘️ Funded a ${data.project}! Public image +15, Heat -10. The community remembers.`;
    },
    getText: (data) => `Fund a ${data.project}. Cost: $${data.cost.toLocaleString()}. Major public image boost.`
  },

  // === INVESTIGATION MISSIONS ===
  { id: 'wiretap_op', name: 'Wiretap Operation', emoji: '🎧', category: 'investigation',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Plant surveillance on a rival to gather intelligence.',
    generate: (state) => {
      const cost = 3000 + Math.floor(Math.random() * 7000);
      return { cost, daysLimit: 7 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      if (state.politics && state.politics.intelGathered) {
        state.politics.intelGathered.push({ info: 'Rival communications intercepted — supply routes exposed', day: state.day, quality: 4 });
        state.politics.intelGathered.push({ info: 'Rival meeting schedule and locations', day: state.day, quality: 3 });
      }
      if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
      return `🎧 Wiretap successful! Two pieces of intel gathered. Cost: $${data.cost.toLocaleString()}.`;
    },
    getText: (data) => `Plant surveillance. Cost: $${data.cost.toLocaleString()}. Yields 2 intel items.`
  },

  { id: 'evidence_plant', name: 'Frame Job', emoji: '📋', category: 'investigation',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Plant evidence to redirect police attention to a rival.',
    generate: (state) => {
      const cost = 5000 + Math.floor(Math.random() * 10000);
      return { cost, daysLimit: 5 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.heat = Math.max(0, state.heat - 20);
      if (state.investigation) state.investigation.points = Math.max(0, state.investigation.points - 25);
      if (typeof adjustRep === 'function') { adjustRep(state, 'heatSignature', -8); adjustRep(state, 'streetCred', 3); }
      return `📋 Evidence planted! Police are now investigating your rival. Heat -20.`;
    },
    getText: (data) => `Frame a rival. Cost: $${data.cost.toLocaleString()}. Reduces heat and investigation.`
  },

  { id: 'intel_raid', name: 'Intelligence Raid', emoji: '📂', category: 'investigation',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Raid a location to gather intelligence on police operations.',
    generate: (state) => {
      const difficulty = 50 + Math.floor(Math.random() * 30);
      return { difficulty, daysLimit: 3 };
    },
    check: (state) => (state.henchmen || []).length >= 2,
    complete: (state, data) => {
      const crewPower = (state.henchmen || []).reduce((sum, h) => sum + (h.combat || 3), 0) * 8;
      if (crewPower + Math.random() * 40 > data.difficulty) {
        if (state.politics && state.politics.intelGathered) {
          state.politics.intelGathered.push({ info: 'Complete police investigation file obtained', day: state.day, quality: 5 });
        }
        if (state.investigation) state.investigation.points = Math.max(0, state.investigation.points - 30);
        return '📂 Intel raid successful! Major intelligence gathered. Investigation set back significantly.';
      }
      state.heat = Math.min(100, state.heat + 15);
      return '📂 Raid failed! Security was too tight. Heat +15.';
    },
    getText: (data) => `Raid for intel. Difficulty: ${data.difficulty}%. Need 2+ crew. High reward intel.`
  },

  // === ECONOMIC MISSIONS ===
  { id: 'price_fixing', name: 'Price Fixing', emoji: '📊', category: 'economic',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Manipulate drug prices in a specific market.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const cost = 10000 + Math.floor(Math.random() * 20000);
      const reward = cost * 2 + Math.floor(Math.random() * 20000);
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', cost, reward, daysLimit: 7 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
      return `📊 Price manipulation successful! ${data.drugName} prices shifted. Profit: $${(data.reward - data.cost).toLocaleString()}.`;
    },
    getText: (data) => `Fix ${data.drugName} prices. Investment: $${data.cost.toLocaleString()}. Return: $${data.reward.toLocaleString()}.`
  },

  { id: 'monopoly_play', name: 'Corner the Market', emoji: '🏦', category: 'economic',
    tier: 4, actMin: 3, actMax: 5,
    desc: 'Buy out all supply in a region to control prices.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const cost = 50000 + Math.floor(Math.random() * 50000);
      const reward = cost * 1.8 + Math.floor(Math.random() * 30000);
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', cost, reward, daysLimit: 10 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 10); adjustRep(state, 'fear', 5); }
      state.heat = Math.min(100, state.heat + 10);
      return `🏦 Market cornered! ${data.drugName} supply monopolized. Profit: $${(data.reward - data.cost).toLocaleString()}.`;
    },
    getText: (data) => `Corner ${data.drugName} market. Investment: $${data.cost.toLocaleString()}. Return: $${data.reward.toLocaleString()}.`
  },

  { id: 'laundering_op', name: 'Laundering Operation', emoji: '🧼', category: 'economic',
    tier: 3, actMin: 2, actMax: 5,
    desc: 'Launder a large amount of dirty money through front businesses.',
    generate: (state) => {
      const amount = 20000 + Math.floor(Math.random() * 80000);
      const fee = Math.round(amount * (0.1 + Math.random() * 0.15));
      return { amount, fee, cleanAmount: amount - fee, daysLimit: 7 };
    },
    check: (state, data) => state.cash >= data.amount && state.fronts && Object.keys(state.fronts).length > 0,
    complete: (state, data) => {
      state.cash -= data.fee; // Pay the laundering fee
      if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', 5);
      state.heat = Math.max(0, state.heat - 5);
      return `🧼 Laundered $${data.amount.toLocaleString()}! Fee: $${data.fee.toLocaleString()}. Clean money, clean image.`;
    },
    getText: (data) => `Launder $${data.amount.toLocaleString()} through fronts. Fee: $${data.fee.toLocaleString()}. Need front businesses.`
  },

  // === POLITICAL MISSIONS ===
  { id: 'bribe_chain', name: 'Bribe Chain', emoji: '💰', category: 'political',
    tier: 3, actMin: 3, actMax: 5,
    desc: 'Sequential bribery of connected officials for a major favor.',
    generate: (state) => {
      const cost = 15000 + Math.floor(Math.random() * 35000);
      return { cost, daysLimit: 10 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.heat = Math.max(0, state.heat - 30);
      if (state.investigation) state.investigation.points = Math.max(0, state.investigation.points - 40);
      if (state.politics) state.politics.politicalInfluence = Math.min(100, (state.politics.politicalInfluence || 0) + 15);
      if (typeof adjustRep === 'function') adjustRep(state, 'heatSignature', -10);
      return `💰 Bribe chain complete! Heat -30, Investigation -40, Political influence +15.`;
    },
    getText: (data) => `Bribe chain of officials. Cost: $${data.cost.toLocaleString()}. Massive heat/investigation reduction.`
  },

  { id: 'blackmail_campaign', name: 'Blackmail Campaign', emoji: '📸', category: 'political',
    tier: 4, actMin: 3, actMax: 5,
    desc: 'Gather and use compromising material against a political figure.',
    generate: (state) => {
      const targets = ['the district attorney', 'a city councilman', 'the police chief', 'a federal prosecutor'];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const cost = 8000 + Math.floor(Math.random() * 12000);
      return { target, cost, daysLimit: 10 };
    },
    check: (state, data) => state.cash >= data.cost && state.politics && (state.politics.intelGathered || []).length >= 3,
    complete: (state, data) => {
      state.cash -= data.cost;
      state.heat = Math.max(0, state.heat - 25);
      if (state.politics) state.politics.politicalInfluence = Math.min(100, (state.politics.politicalInfluence || 0) + 20);
      if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 10); adjustRep(state, 'heatSignature', -8); }
      return `📸 Blackmail on ${data.target} successful! They're in your pocket now. Influence +20.`;
    },
    getText: (data) => `Blackmail ${data.target}. Cost: $${data.cost.toLocaleString()}. Need 3+ intel. Major influence gain.`
  },

  { id: 'election_interference', name: 'Election Meddling', emoji: '🗳️', category: 'political',
    tier: 4, actMin: 3, actMax: 5,
    desc: 'Support or undermine a political candidate.',
    generate: (state) => {
      const cost = 25000 + Math.floor(Math.random() * 50000);
      return { cost, daysLimit: 14 };
    },
    check: (state, data) => state.cash >= data.cost,
    complete: (state, data) => {
      state.cash -= data.cost;
      if (state.politics) state.politics.politicalInfluence = Math.min(100, (state.politics.politicalInfluence || 0) + 25);
      if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -5); adjustRep(state, 'streetCred', 10); }
      return `🗳️ Election influenced! Your candidate won. Political influence +25.`;
    },
    getText: (data) => `Meddle in elections. Cost: $${data.cost.toLocaleString()}. Massive political influence gain.`
  },

  // === TIME-SENSITIVE MISSIONS ===
  { id: 'midnight_drop', name: 'Midnight Drop', emoji: '🌙', category: 'delivery',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'Complete a high-stakes delivery within 1 day for premium pay.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const amount = 10 + Math.floor(Math.random() * 20);
      const reward = amount * (drug ? drug.maxPrice : 200) * 2;
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', amount, reward: Math.round(reward), daysLimit: 1 };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 5); adjustRep(state, 'streetCred', 3); }
      return `🌙 Midnight drop complete! Premium pay: $${data.reward.toLocaleString()}.`;
    },
    getText: (data) => `⚡ URGENT: Deliver ${data.amount} ${data.drugName} TODAY for $${data.reward.toLocaleString()}.`
  },

  { id: 'hurricane_opportunity', name: 'Storm Profit', emoji: '🌀', category: 'economic',
    tier: 2, actMin: 1, actMax: 5,
    desc: 'A hurricane disrupts supply chains. Prices spike temporarily.',
    generate: (state) => {
      const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const amount = 20 + Math.floor(Math.random() * 30);
      const reward = amount * (drug ? drug.maxPrice : 200) * 2.5;
      return { drugId: drug ? drug.id : 'cocaine', drugName: drug ? drug.name : 'Cocaine', amount, reward: Math.round(reward), daysLimit: 2 };
    },
    check: (state, data) => (state.inventory[data.drugId] || 0) >= data.amount,
    complete: (state, data) => {
      state.inventory[data.drugId] -= data.amount;
      state.cash += data.reward;
      if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
      return `🌀 Sold during the storm at premium prices! $${data.reward.toLocaleString()} earned.`;
    },
    getText: (data) => `⚡ STORM: Sell ${data.amount} ${data.drugName} in 2 days for $${data.reward.toLocaleString()} (2.5x markup).`
  },
];

// ============================================================
// MORAL DILEMMAS
// ============================================================
const MORAL_DILEMMAS = [
  { id: 'snitch_crew', name: 'The Rat', emoji: '🐀',
    desc: 'You discover a crew member is informing to the police.',
    choices: [
      { id: 'kill', label: '💀 Eliminate Them', desc: 'Send a message. No one snitches.', effects: (state) => {
        if (state.henchmen.length > 0) { state.henchmen.pop(); }
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 10); adjustRep(state, 'trust', -5); }
        state.heat = Math.max(0, state.heat - 10);
        return '💀 The snitch is gone. Your crew is shaken, but the heat dies down.';
      }},
      { id: 'forgive', label: '🤝 Second Chance', desc: 'Let them live. Maybe they\'ll be loyal now.', effects: (state) => {
        if (state.henchmen.length > 0) {
          const h = state.henchmen[state.henchmen.length - 1];
          h.loyalty = Math.max(0, (h.loyalty || 80) - 30);
          if (h.hiddenLoyalty !== undefined) h.hiddenLoyalty = Math.max(0, h.hiddenLoyalty - 20);
        }
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 5); adjustRep(state, 'fear', -5); }
        return '🤝 You let them live. Time will tell if that was smart.';
      }},
      { id: 'feed_false', label: '🎭 Feed False Info', desc: 'Use them to feed misinformation to the cops.', effects: (state) => {
        state.heat = Math.max(0, state.heat - 15);
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
        if (state.investigation) state.investigation.points = Math.max(0, state.investigation.points - 15);
        return '🎭 Brilliant move. The cops are chasing ghosts now.';
      }},
    ]
  },

  { id: 'kid_dealer', name: 'The Kid', emoji: '👦',
    desc: 'A 13-year-old kid asks to work for you as a lookout.',
    choices: [
      { id: 'hire', label: '✅ Hire the Kid', desc: 'Kids are useful. Less suspicious.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -10); adjustRep(state, 'streetCred', 3); }
        state.heat = Math.max(0, state.heat - 3); // Kids less suspicious
        return '✅ The kid starts working. You tell yourself it\'s better than the alternative.';
      }},
      { id: 'refuse', label: '❌ Send Him Home', desc: 'This isn\'t a life for children.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 5); adjustRep(state, 'trust', 3); }
        return '❌ You send the kid home. Some lines you don\'t cross.';
      }},
      { id: 'help', label: '📚 Pay for School', desc: 'Give the kid money for school instead.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 2000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 10); adjustRep(state, 'trust', 5); }
        return '📚 You give the kid $2,000 for school. It won\'t make up for everything, but it\'s something.';
      }},
    ]
  },

  { id: 'cop_offer', name: 'The Proposition', emoji: '👮',
    desc: 'A detective offers to look the other way... for a price. Monthly.',
    choices: [
      { id: 'accept', label: '💰 Pay Up', desc: 'A cop on the take is invaluable.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 5000);
        state.heat = Math.max(0, state.heat - 20);
        if (state.politics) {
          state.politics.corruptOfficials['detective'] = {
            loyalty: 60, bribesPaid: 5000, exposureRisk: 10, method: 'bribe', dayCorrupted: state.day
          };
        }
        return '💰 The detective pockets the cash. You have a new friend in the force.';
      }},
      { id: 'refuse', label: '🚫 Decline', desc: 'Don\'t trust cops. Period.', effects: (state) => {
        state.heat = Math.min(100, state.heat + 5);
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 3);
        return '🚫 You refuse. The detective looks annoyed. Expect more attention.';
      }},
      { id: 'expose', label: '📰 Expose Them', desc: 'Tip off the press about the corrupt cop.', effects: (state) => {
        state.heat = Math.max(0, state.heat - 15);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 10); adjustRep(state, 'heatSignature', -5); }
        return '📰 The story runs. One less dirty cop, and you look like a concerned citizen.';
      }},
    ]
  },

  { id: 'rival_family', name: 'Family Ties', emoji: '👨‍👩‍👧',
    desc: 'A rival dealer\'s family begs you to spare them. They have children.',
    choices: [
      { id: 'spare', label: '🕊️ Spare Them', desc: 'Let the family go. Show mercy.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 5); adjustRep(state, 'publicImage', 5); adjustRep(state, 'fear', -5); }
        return '🕊️ You let them go. Word spreads that you have a code.';
      }},
      { id: 'no_mercy', label: '💀 No Mercy', desc: 'Send a message. This is business.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 15); adjustRep(state, 'trust', -10); adjustRep(state, 'publicImage', -15); }
        return '💀 No one crosses you now. But the nightmares start.';
      }},
      { id: 'relocate', label: '🚐 Relocate Them', desc: 'Give them cash and a new start elsewhere.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 10000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 10); adjustRep(state, 'publicImage', 8); }
        return '🚐 You send them away with $10K. A fresh start, far from here.';
      }},
    ]
  },

  { id: 'overdose_customer', name: 'The Overdose', emoji: '💉',
    desc: 'One of your regular customers just OD\'d. Someone should call 911.',
    choices: [
      { id: 'call_911', label: '📞 Call 911', desc: 'Save their life. Risk your own exposure.', effects: (state) => {
        state.heat = Math.min(100, state.heat + 10);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 5); adjustRep(state, 'trust', 5); }
        return '📞 Paramedics arrive. They\'re saved, but cops are asking questions.';
      }},
      { id: 'walk_away', label: '🚶 Walk Away', desc: 'Not your problem. Keep your distance.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -5); adjustRep(state, 'trust', -3); }
        if (state.lifestyle) state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + 10);
        return '🚶 You walk away. The guilt eats at you. Stress +10.';
      }},
      { id: 'narcan', label: '💊 Administer Narcan', desc: 'You carry Narcan. Use it discreetly.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'streetCred', 3); }
        return '💊 You save them yourself. No cops needed. Word spreads that you take care of your people.';
      }},
    ]
  },

  { id: 'witness', name: 'The Witness', emoji: '👁️',
    desc: 'A civilian witnessed your latest deal. They could identify you.',
    choices: [
      { id: 'threaten', label: '😡 Threaten Them', desc: 'Scare them into silence.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 5); adjustRep(state, 'publicImage', -5); }
        if (Math.random() < 0.3) { state.heat = Math.min(100, state.heat + 10); return '😡 They reported you anyway! Heat +10.'; }
        return '😡 They\'re terrified. Hopefully they stay quiet.';
      }},
      { id: 'bribe', label: '💰 Bribe Them', desc: 'Money talks. Pay for their silence.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 3000);
        return '💰 $3,000 buys silence. For now.';
      }},
      { id: 'nothing', label: '🤷 Do Nothing', desc: 'Maybe they didn\'t see enough.', effects: (state) => {
        if (Math.random() < 0.4) { state.heat = Math.min(100, state.heat + 15); return '🤷 They went to the cops. Heat +15.'; }
        return '🤷 Seems like they\'re minding their own business.';
      }},
    ]
  },

  { id: 'dirty_product', name: 'Bad Batch', emoji: '☠️',
    desc: 'Your latest supply is contaminated. Selling it could kill people.',
    choices: [
      { id: 'sell_anyway', label: '💵 Sell It', desc: 'Money is money. Not your problem.', effects: (state) => {
        state.cash += 15000;
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', -15); adjustRep(state, 'publicImage', -10); }
        if (state.lifestyle) state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + 15);
        return '💵 You sell it. Within a week, three people are in the hospital. Stress +15.';
      }},
      { id: 'destroy', label: '🔥 Destroy It', desc: 'Take the loss. Save lives.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 10); adjustRep(state, 'publicImage', 5); }
        return '🔥 You destroy the batch. $15K gone, but your conscience is (slightly) cleaner.';
      }},
      { id: 'sell_rival', label: '🎭 Sell to Rival', desc: 'Let a rival\'s reputation take the hit.', effects: (state) => {
        state.cash += 8000;
        if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 5); adjustRep(state, 'trust', -3); }
        return '🎭 You sell the bad batch to a rival dealer for $8K. Their problem now.';
      }},
    ]
  },

  { id: 'fed_deal', name: 'The Deal', emoji: '🕴️',
    desc: 'A federal agent approaches you privately. They want info on your rivals.',
    choices: [
      { id: 'cooperate', label: '🤫 Cooperate', desc: 'Feed them info. Get protection.', effects: (state) => {
        state.heat = Math.max(0, state.heat - 25);
        if (state.investigation) state.investigation.points = Math.max(0, state.investigation.points - 30);
        if (typeof adjustRep === 'function') { adjustRep(state, 'heatSignature', -10); adjustRep(state, 'trust', -15); }
        if (state.campaign) state.campaign.flags.fedCooperator = true;
        return '🤫 You\'re feeding info to the feds. Heat drops, but if anyone finds out...';
      }},
      { id: 'refuse', label: '🚫 Refuse', desc: 'You\'re no snitch. Never.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 5); adjustRep(state, 'trust', 5); }
        return '🚫 You tell them to get lost. Your crew would be proud.';
      }},
      { id: 'double_agent', label: '🎭 Play Both Sides', desc: 'Feed them bad intel while gathering theirs.', effects: (state) => {
        state.heat = Math.max(0, state.heat - 10);
        if (state.politics && state.politics.intelGathered) {
          state.politics.intelGathered.push({ info: 'Federal investigation targets and timeline', day: state.day, quality: 5 });
        }
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 3);
        return '🎭 You play the dangerous game of feeding false info while extracting real intel.';
      }},
    ]
  },

  // === NEW DILEMMAS ===
  { id: 'community_center', name: 'The Community Center', emoji: '🏫',
    desc: 'The community center in your territory is about to close. They need $15,000.',
    choices: [
      { id: 'fund', label: '💵 Fund It', desc: 'Pay to keep it open. Good PR.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 15000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 20); adjustRep(state, 'trust', 10); adjustRep(state, 'heatSignature', -5); }
        state.heat = Math.max(0, state.heat - 10);
        return '💵 The community center stays open. The neighborhood loves you. Public image soars.';
      }},
      { id: 'ignore', label: '🤷 Not Your Problem', desc: 'You\'re not a charity.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -5); }
        return '🤷 The center closes. Kids on the street now. Some end up working corners.';
      }},
      { id: 'convert', label: '🏪 Convert to Front', desc: 'Buy it and turn it into a front business.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 20000);
        if (state.fronts) state.fronts['community_center'] = { income: 500, heat: 2 };
        if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 5); adjustRep(state, 'publicImage', 5); }
        return '🏪 You buy the center and run it as a front. The community still has their space. You have a laundering operation.';
      }},
    ]
  },

  { id: 'addiction_spiral', name: 'Best Customer', emoji: '😵',
    desc: 'Your most profitable customer is spiraling. They spend $5K/week but look like death.',
    choices: [
      { id: 'keep_selling', label: '💵 Keep Selling', desc: 'Their money is green. Not your problem.', effects: (state) => {
        state.cash += 5000;
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', -8); adjustRep(state, 'trust', -3); }
        if (state.lifestyle) state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + 10);
        return '💵 You take their money. Three weeks later, they\'re found dead. It makes the news. Stress +10.';
      }},
      { id: 'cut_off', label: '✋ Cut Them Off', desc: 'Refuse to sell to them anymore.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 5); adjustRep(state, 'trust', 5); }
        return '✋ You cut them off. They\'re furious. But they might survive.';
      }},
      { id: 'rehab', label: '🏥 Pay for Rehab', desc: 'Send them to rehab on your dime. $8,000.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 8000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 10); adjustRep(state, 'trust', 10); }
        return '🏥 You pay $8,000 for rehab. Six months later, they send you a thank you card. You frame it.';
      }},
    ]
  },

  { id: 'corrupt_judge_offer', name: 'Judge\'s Offer', emoji: '⚖️',
    desc: 'A judge offers to dismiss all pending cases against you. Price: $50,000.',
    choices: [
      { id: 'pay', label: '💰 Pay the Judge', desc: 'Freedom isn\'t free. $50,000.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 50000);
        state.courtCase = null;
        state.heat = Math.max(0, state.heat - 15);
        if (state.politics) {
          state.politics.corruptOfficials['judge'] = { loyalty: 60, bribesPaid: 50000, exposureRisk: 15, method: 'bribe', dayCorrupted: state.day };
        }
        return '💰 The judge dismisses your cases. $50K lighter, but free as a bird.';
      }},
      { id: 'refuse', label: '🚫 Refuse', desc: 'Don\'t trust judges. Fight it in court.', effects: (state) => {
        if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 5);
        return '🚫 You refuse. The judge looks disappointed. You\'ll take your chances in court.';
      }},
      { id: 'negotiate', label: '🤝 Counter-Offer', desc: 'Propose $25K now, $25K later.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 25000);
        state.courtCase = null;
        if (state.politics) {
          state.politics.corruptOfficials['judge'] = { loyalty: 40, bribesPaid: 25000, exposureRisk: 20, method: 'bribe', dayCorrupted: state.day };
        }
        return '🤝 The judge accepts. Half now, half later. Cases dismissed, but you owe a judge.';
      }},
    ]
  },

  { id: 'rival_kid', name: 'Collateral', emoji: '👧',
    desc: 'Your rival\'s teenage child was caught in the crossfire of a turf dispute.',
    choices: [
      { id: 'hospital', label: '🏥 Rush to Hospital', desc: 'Get the kid medical help. Pay the bills.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 10000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'publicImage', 15); adjustRep(state, 'trust', 10); adjustRep(state, 'fear', -5); }
        return '🏥 You rush the kid to the hospital and pay $10K in bills. Even your rival is grateful. Temporarily.';
      }},
      { id: 'leverage', label: '🔗 Use as Leverage', desc: 'The kid is a bargaining chip.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'fear', 15); adjustRep(state, 'trust', -20); adjustRep(state, 'publicImage', -20); }
        return '🔗 You use the kid as leverage. The rival backs down, but everyone thinks you\'re a monster.';
      }},
      { id: 'anonymous', label: '🕶️ Anonymous Help', desc: 'Help secretly. Don\'t let anyone know.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 5000);
        if (typeof adjustRep === 'function') adjustRep(state, 'trust', 5);
        return '🕶️ You arrange anonymous help. $5K spent. Nobody knows, but you sleep better tonight.';
      }},
    ]
  },

  { id: 'environmental_dump', name: 'Toxic Waste', emoji: '☢️',
    desc: 'Your processing lab generates toxic waste. Proper disposal costs $12,000. The river is free.',
    choices: [
      { id: 'dump', label: '🌊 Dump in River', desc: 'Free disposal. What they don\'t know...', effects: (state) => {
        if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', -10);
        if (state.lifestyle) state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + 5);
        if (Math.random() < 0.3) { state.heat = Math.min(100, state.heat + 15); return '🌊 You dump the waste. An environmental group traces it back. Heat +15.'; }
        return '🌊 You dump the waste. Nobody notices. For now.';
      }},
      { id: 'proper', label: '♻️ Proper Disposal', desc: 'Pay $12,000 for legal disposal.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 12000);
        return '♻️ Proper disposal done. $12K spent. The fish can breathe easy.';
      }},
      { id: 'rival_territory', label: '🎯 Dump in Rival\'s Area', desc: 'Let them deal with the EPA.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 3); adjustRep(state, 'publicImage', -5); }
        return '🎯 Waste dumped in rival territory. When the EPA investigates, they\'ll look there first.';
      }},
    ]
  },

  { id: 'snitch_reward', name: 'Blood Money', emoji: '💸',
    desc: 'The feds are offering $100,000 for information leading to your main rival\'s arrest.',
    choices: [
      { id: 'snitch', label: '📞 Make the Call', desc: 'Rat out your rival. Collect $100K.', effects: (state) => {
        state.cash += 100000;
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', -25); adjustRep(state, 'streetCred', -15); adjustRep(state, 'heatSignature', -10); }
        if (state.campaign) state.campaign.flags.snitchedOnRival = true;
        return '📞 You make the call. $100K richer. But if the streets find out you\'re a snitch...';
      }},
      { id: 'refuse', label: '🤐 Keep Quiet', desc: 'Never snitch. Code of the streets.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'streetCred', 10); adjustRep(state, 'trust', 10); }
        return '🤐 You stay quiet. The code means something to you. Your rep grows.';
      }},
      { id: 'warn_rival', label: '⚠️ Warn the Rival', desc: 'Tip them off. Earn a massive favor.', effects: (state) => {
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 15); adjustRep(state, 'streetCred', 8); }
        state.heat = Math.min(100, state.heat + 5);
        return '⚠️ You warn your rival. They owe you big. Enemies can become allies.';
      }},
    ]
  },

  { id: 'old_friend', name: 'Old Debts', emoji: '🤝',
    desc: 'Your childhood friend shows up desperate. They need $20,000 or the loan sharks will kill them.',
    choices: [
      { id: 'pay', label: '💵 Pay the Debt', desc: 'Save your friend. $20,000.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 20000);
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 15); adjustRep(state, 'publicImage', 5); }
        return '💵 You pay the $20K. Your friend cries. Some bonds can\'t be broken.';
      }},
      { id: 'refuse', label: '✋ Can\'t Help', desc: 'You\'re not a bank. They should have been smarter.', effects: (state) => {
        if (typeof adjustRep === 'function') adjustRep(state, 'trust', -5);
        if (state.lifestyle) state.lifestyle.stress = Math.min(100, (state.lifestyle.stress || 0) + 10);
        return '✋ You refuse. A week later, you hear they\'re in the hospital. Stress +10.';
      }},
      { id: 'employ', label: '👥 Give Them a Job', desc: 'Put them to work. Pay off the debt slowly.', effects: (state) => {
        state.cash = Math.max(0, state.cash - 5000); // Partial advance
        if (typeof adjustRep === 'function') { adjustRep(state, 'trust', 8); adjustRep(state, 'streetCred', 3); }
        return '👥 You front $5K and give them work. They\'re loyal to the bone now. New crew member.';
      }},
    ]
  },
];

// ============================================================
// MISSION STATE
// ============================================================
function initMissionState() {
  return {
    activeMissions: [], // { missionId, data, dayAccepted, daysLimit }
    completedMissions: [],
    failedMissions: [],
    totalMissionsCompleted: 0,
    totalMissionsFailed: 0,
    totalMissionRewards: 0,
    pendingDilemma: null, // active moral dilemma waiting for choice
    dilemmasResolved: [],
    totalDilemmas: 0,
    missionsAvailable: [], // generated available missions to accept
    lastMissionRefresh: 0,
  };
}

// ============================================================
// GENERATE AVAILABLE MISSIONS
// ============================================================
function refreshAvailableMissions(state) {
  if (!state.missions) state.missions = initMissionState();
  const ms = state.missions;
  const act = state.campaign ? state.campaign.currentAct : 1;

  // Refresh every 3 days
  if (state.day - ms.lastMissionRefresh < 3 && ms.missionsAvailable.length > 0) return;

  const eligible = SIDE_MISSIONS.filter(m => act >= m.actMin && act <= m.actMax);
  const count = 5 + Math.floor(Math.random() * 3); // 5-7 missions

  // Ensure category diversity (max 2 per category)
  const shuffled = [];
  const catCount = {};
  const pool = eligible.sort(() => Math.random() - 0.5);
  for (const m of pool) {
    if (shuffled.length >= count) break;
    const cat = m.category || 'other';
    if ((catCount[cat] || 0) >= 2) continue;
    catCount[cat] = (catCount[cat] || 0) + 1;
    shuffled.push(m);
  }

  ms.missionsAvailable = shuffled.map(template => {
    const data = template.generate(state);
    return {
      missionId: template.id,
      data,
      tier: template.tier,
    };
  });

  ms.lastMissionRefresh = state.day;
}

// ============================================================
// ACCEPT MISSION
// ============================================================
function acceptMission(state, index) {
  if (!state.missions) state.missions = initMissionState();
  const ms = state.missions;

  if (ms.activeMissions.length >= 3) return { success: false, msg: 'Max 3 active missions. Complete or abandon one first.' };
  if (index < 0 || index >= ms.missionsAvailable.length) return { success: false, msg: 'Invalid mission.' };

  const available = ms.missionsAvailable[index];
  const template = SIDE_MISSIONS.find(m => m.id === available.missionId);
  if (!template) return { success: false, msg: 'Unknown mission.' };

  const mission = {
    missionId: available.missionId,
    data: available.data,
    dayAccepted: state.day,
    daysLimit: available.data.daysLimit || 10,
  };

  ms.activeMissions.push(mission);
  ms.missionsAvailable.splice(index, 1);

  return { success: true, msg: `${template.emoji} Accepted: ${template.name}! ${template.getText(available.data)}` };
}

// ============================================================
// COMPLETE MISSION
// ============================================================
function completeMission(state, index) {
  if (!state.missions) return { success: false, msg: 'No missions.' };
  const ms = state.missions;
  if (index < 0 || index >= ms.activeMissions.length) return { success: false, msg: 'Invalid mission.' };

  const mission = ms.activeMissions[index];
  const template = SIDE_MISSIONS.find(m => m.id === mission.missionId);
  if (!template) return { success: false, msg: 'Unknown mission.' };

  if (!template.check(state, mission.data)) {
    return { success: false, msg: `Requirements not met for ${template.name}.` };
  }

  const msg = template.complete(state, mission.data);
  ms.activeMissions.splice(index, 1);
  ms.completedMissions.push({ missionId: mission.missionId, dayCompleted: state.day });
  ms.totalMissionsCompleted++;
  if (mission.data.reward) ms.totalMissionRewards += mission.data.reward;

  // XP reward — scaled by mission tier
  if (typeof awardXP === 'function') {
    const missionXP = (typeof XP_REWARDS !== 'undefined' ? XP_REWARDS.complete_mission : 75) + (template.tier - 1) * 25;
    awardXP(state, 'complete_mission', missionXP);
  }

  // Faction standing boost for completing missions in gang territory
  if (typeof adjustFactionStanding === 'function' && typeof TERRITORY_GANGS !== 'undefined') {
    const gangData = TERRITORY_GANGS[state.currentLocation];
    if (gangData && gangData.factionId) {
      const factionId = gangData.factionId;
      // Completing missions on their turf earns respect
      const standingGain = 3 + Math.min(template.tier, 3); // 4-6 standing based on tier
      adjustFactionStanding(state, factionId, standingGain);
    }
  }

  // Bonus skill point every 10 missions completed
  if (ms.totalMissionsCompleted % 10 === 0 && ms.totalMissionsCompleted > 0) {
    state.skillPoints = (state.skillPoints || 0) + 1;
    return { success: true, msg: msg + ' 🌟 BONUS: +1 Skill Point for completing ' + ms.totalMissionsCompleted + ' missions!' };
  }

  return { success: true, msg };
}

// ============================================================
// ABANDON MISSION
// ============================================================
function abandonMission(state, index) {
  if (!state.missions) return { success: false, msg: 'No missions.' };
  const ms = state.missions;
  if (index < 0 || index >= ms.activeMissions.length) return { success: false, msg: 'Invalid mission.' };

  const mission = ms.activeMissions[index];
  const template = SIDE_MISSIONS.find(m => m.id === mission.missionId);
  ms.activeMissions.splice(index, 1);
  ms.failedMissions.push({ missionId: mission.missionId, dayFailed: state.day });
  ms.totalMissionsFailed++;

  if (typeof adjustRep === 'function') adjustRep(state, 'trust', -3);

  return { success: true, msg: `❌ Abandoned: ${template ? template.name : mission.missionId}. Trust -3.` };
}

// ============================================================
// RESOLVE MORAL DILEMMA
// ============================================================
function resolveDilemma(state, choiceId) {
  if (!state.missions) return { success: false, msg: 'No dilemma.' };
  const ms = state.missions;
  if (!ms.pendingDilemma) return { success: false, msg: 'No active dilemma.' };

  const dilemma = MORAL_DILEMMAS.find(d => d.id === ms.pendingDilemma.id);
  if (!dilemma) return { success: false, msg: 'Unknown dilemma.' };

  const choice = dilemma.choices.find(c => c.id === choiceId);
  if (!choice) return { success: false, msg: 'Invalid choice.' };

  const msg = choice.effects(state);
  ms.dilemmasResolved.push({ dilemmaId: dilemma.id, choiceId, day: state.day });
  ms.totalDilemmas++;
  ms.pendingDilemma = null;

  // XP for resolving dilemma
  if (typeof addXp === 'function') addXp(state, 25);

  return { success: true, msg };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processMissionsDaily(state) {
  if (!state.missions) state.missions = initMissionState();
  const ms = state.missions;
  const msgs = [];

  // Check for expired missions
  for (let i = ms.activeMissions.length - 1; i >= 0; i--) {
    const mission = ms.activeMissions[i];
    if (state.day - mission.dayAccepted > mission.daysLimit) {
      const template = SIDE_MISSIONS.find(m => m.id === mission.missionId);
      ms.activeMissions.splice(i, 1);
      ms.failedMissions.push({ missionId: mission.missionId, dayFailed: state.day });
      ms.totalMissionsFailed++;
      msgs.push(`⏰ Mission expired: ${template ? template.name : mission.missionId}!`);
      if (typeof adjustRep === 'function') adjustRep(state, 'trust', -2);
    }
  }

  // Random moral dilemma chance (5% per day, only if none pending)
  if (!ms.pendingDilemma && Math.random() < 0.05 && state.day > 10) {
    const eligible = MORAL_DILEMMAS.filter(d => !ms.dilemmasResolved.some(r => r.dilemmaId === d.id && state.day - r.day < 100));
    if (eligible.length > 0) {
      const dilemma = eligible[Math.floor(Math.random() * eligible.length)];
      ms.pendingDilemma = { id: dilemma.id, dayTriggered: state.day };
      msgs.push(`⚖️ MORAL DILEMMA: ${dilemma.emoji} ${dilemma.name} — ${dilemma.desc}`);
    }
  }

  // Refresh available missions if needed
  refreshAvailableMissions(state);

  return msgs;
}
