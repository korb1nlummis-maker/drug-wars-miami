/**
 * side-missions-v2.js - Drug Wars: Miami Vice Edition
 * 40 Side Mission Chains (2-5 chapters each)
 * Each chain unlocks based on game state, character, or random triggers
 */

// ============================================================
// SIDE MISSIONS V2 SYSTEM FUNCTIONS
// ============================================================

function initSideMissionsV2State() {
  return {
    activeChains: {},      // { chainId: { currentChapter: 0, data: {}, startDay: N } }
    completedChains: [],
    failedChains: [],
    availableChains: [],   // chains offered but not started
    chainLog: [],
    stats: { totalStarted: 0, totalCompleted: 0, totalFailed: 0 }
  };
}

function processSideMissionsV2Daily(state) {
  if (!state.sideMissionsV2) return [];
  const sm = state.sideMissionsV2;
  const msgs = [];

  // Check for new chains becoming available (1-2 per week chance)
  if (Math.random() < 0.18 && sm.availableChains.length < 3) {
    const eligible = SIDE_MISSIONS_V2.filter(chain => {
      if (sm.activeChains[chain.id]) return false;
      if (sm.completedChains.includes(chain.id)) return false;
      if (sm.failedChains.includes(chain.id)) return false;
      if (sm.availableChains.find(a => a.id === chain.id)) return false;
      return checkChainCondition(state, chain.condition);
    });
    if (eligible.length > 0) {
      const picked = eligible[Math.floor(Math.random() * eligible.length)];
      sm.availableChains.push({ id: picked.id, offeredDay: state.day || 0 });
      msgs.push(`📋 New mission chain available: ${picked.emoji} ${picked.name}`);
    }
  }

  // Expire old offers (after 14 days)
  sm.availableChains = sm.availableChains.filter(a => {
    const age = (state.day || 0) - a.offeredDay;
    if (age > 14) {
      msgs.push(`⏰ Mission "${getChainById(a.id).name}" expired.`);
      return false;
    }
    return true;
  });

  // Check active chain time limits
  for (const chainId in sm.activeChains) {
    const active = sm.activeChains[chainId];
    const chain = getChainById(chainId);
    if (!chain) continue;
    const chapter = chain.chapters[active.currentChapter];
    if (chapter && chapter.daysLimit) {
      const elapsed = (state.day || 0) - (active.chapterStartDay || active.startDay);
      if (elapsed > chapter.daysLimit) {
        failChainV2(state, chainId, 'Time ran out');
        msgs.push(`❌ Mission chain "${chain.name}" failed — time limit exceeded.`);
      }
    }
  }

  return msgs;
}

function checkChainCondition(state, cond) {
  if (!cond) return true;
  if (cond.minDay && (state.day || 0) < cond.minDay) return false;
  if (cond.minCash && (state.cash || 0) < cond.minCash) return false;
  if (cond.minHeat && (state.heat || 0) < cond.minHeat) return false;
  if (cond.minCrew && (state.henchmen || []).length < cond.minCrew) return false;
  if (cond.minAct) {
    const act = typeof getCurrentAct === 'function' ? getCurrentAct(state) : 1;
    if (act < cond.minAct) return false;
  }
  if (cond.hasBusiness && state.businesses && (!state.businesses.owned || state.businesses.owned.length === 0)) return false;
  return true;
}

function startChainV2(state, chainId) {
  if (!state.sideMissionsV2) return null;
  const sm = state.sideMissionsV2;
  const chain = getChainById(chainId);
  if (!chain) return null;
  if (sm.activeChains[chainId]) return null;

  sm.activeChains[chainId] = {
    currentChapter: 0,
    data: {},
    startDay: state.day || 0,
    chapterStartDay: state.day || 0
  };
  sm.availableChains = sm.availableChains.filter(a => a.id !== chainId);
  sm.stats.totalStarted++;
  sm.chainLog.push({ id: chainId, action: 'started', day: state.day || 0 });

  return chain.chapters[0];
}

function resolveChainChapter(state, chainId, outcomeIndex) {
  if (!state.sideMissionsV2) return null;
  const sm = state.sideMissionsV2;
  const active = sm.activeChains[chainId];
  if (!active) return null;
  const chain = getChainById(chainId);
  if (!chain) return null;

  const chapter = chain.chapters[active.currentChapter];
  if (!chapter) return null;
  const outcome = chapter.outcomes[outcomeIndex];
  if (!outcome) return null;

  // Apply effects
  const fx = outcome.effects || {};
  if (fx.cash) state.cash = (state.cash || 0) + fx.cash;
  if (fx.heat) state.heat = Math.min(100, Math.max(0, (state.heat || 0) + fx.heat));
  if (fx.health) state.health = Math.min(100, Math.max(1, (state.health || 100) + fx.health));
  if (fx.streetCred) { if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', fx.streetCred); }
  if (fx.trust) { if (typeof adjustRep === 'function') adjustRep(state, 'trust', fx.trust); }
  if (fx.fear) { if (typeof adjustRep === 'function') adjustRep(state, 'fear', fx.fear); }
  if (fx.publicImage) { if (typeof adjustRep === 'function') adjustRep(state, 'publicImage', fx.publicImage); }
  if (fx.communityRep) { if (typeof adjustRep === 'function') adjustRep(state, 'communityRep', fx.communityRep); }
  if (fx.stress) state.stress = Math.max(0, (state.stress || 0) + fx.stress);

  // Wire into consequence engine for trait tracking
  if (typeof applyConsequences === 'function') {
    var conseq = {};
    if (fx.consequences) {
      conseq = fx.consequences;
    } else {
      // Infer consequences from effects
      if (fx.fear && fx.fear > 0) conseq.traits = { feared: 1 };
      if (fx.trust && fx.trust > 5) conseq.traits = Object.assign(conseq.traits || {}, { trustworthy: 1 });
      if (fx.cash && fx.cash > 10000) conseq.traits = Object.assign(conseq.traits || {}, { wealthy: 1 });
      if (fx.heat && fx.heat > 10) conseq.traits = Object.assign(conseq.traits || {}, { reckless: 1 });
      if (fx.communityRep && fx.communityRep > 0) conseq.traits = Object.assign(conseq.traits || {}, { community_minded: 1 });
    }
    if (Object.keys(conseq).length > 0) {
      applyConsequences(state, conseq, 'sidemission_' + chainId, outcome.id || 'ch' + active.currentChapter);
    }
  }

  // XP reward for completing a chapter
  if (typeof awardXP === 'function') {
    awardXP(state, 'complete_side_mission', 50 + active.currentChapter * 25);
  }

  // Store choice in data
  active.data['ch' + active.currentChapter] = outcome.id || outcomeIndex;

  // Advance or complete
  if (active.currentChapter + 1 >= chain.chapters.length || outcome.endsChain) {
    completeChainV2(state, chainId, outcome);
    return { completed: true, result: outcome.result, reward: outcome.reward || null };
  } else {
    active.currentChapter++;
    active.chapterStartDay = state.day || 0;
    return { completed: false, result: outcome.result, nextChapter: chain.chapters[active.currentChapter] };
  }
}

function completeChainV2(state, chainId, finalOutcome) {
  const sm = state.sideMissionsV2;
  delete sm.activeChains[chainId];
  if (!sm.completedChains.includes(chainId)) sm.completedChains.push(chainId);
  sm.stats.totalCompleted++;
  sm.chainLog.push({ id: chainId, action: 'completed', day: state.day || 0 });
}

function failChainV2(state, chainId, reason) {
  const sm = state.sideMissionsV2;
  delete sm.activeChains[chainId];
  if (!sm.failedChains.includes(chainId)) sm.failedChains.push(chainId);
  sm.stats.totalFailed++;
  sm.chainLog.push({ id: chainId, action: 'failed', reason, day: state.day || 0 });
}

function getChainById(id) {
  return SIDE_MISSIONS_V2.find(c => c.id === id) || null;
}

function getAvailableChainsV2(state) {
  if (!state.sideMissionsV2) return [];
  return state.sideMissionsV2.availableChains.map(a => {
    const chain = getChainById(a.id);
    return chain ? { ...chain, offeredDay: a.offeredDay } : null;
  }).filter(Boolean);
}

function getActiveChainsV2(state) {
  if (!state.sideMissionsV2) return [];
  return Object.keys(state.sideMissionsV2.activeChains).map(id => {
    const chain = getChainById(id);
    const active = state.sideMissionsV2.activeChains[id];
    if (!chain) return null;
    return {
      ...chain,
      currentChapter: active.currentChapter,
      chapter: chain.chapters[active.currentChapter],
      startDay: active.startDay
    };
  }).filter(Boolean);
}

// ============================================================
// SIDE MISSION CHAIN DATA - 40 chains
// ============================================================
const SIDE_MISSIONS_V2 = [

  // === 1. THE PHOTOGRAPHER ===
  {
    id: 'photographer', name: 'The Photographer', emoji: '📸', category: 'intel',
    condition: { minDay: 15 },
    chapters: [
      { title: 'Caught on Camera', description: 'A street photographer has been documenting your operation. Multiple photos of your crew, your spots, your deals.',
        outcomes: [
          { id: 'find', label: 'Track him down', effects: { cash: -500 }, result: 'You find him in a Wynwood loft. Walls covered in photos of the streets — including yours.' },
          { id: 'ignore', label: 'He\'s just an artist', effects: {}, result: 'You let it go. But the photos keep appearing online.', endsChain: true }
        ]
      },
      { title: 'The Collection', description: 'His apartment is a goldmine of street photography — and evidence. He doesn\'t know what he has.',
        outcomes: [
          { id: 'recruit', label: 'Recruit as surveillance ($2K)', effects: { cash: -2000, streetCred: 2 }, result: 'He becomes your eyes with a camera. Nobody suspects a photographer.' },
          { id: 'destroy', label: 'Destroy all photos', effects: { fear: 2, heat: -5 }, result: 'You wipe his hard drives and burn the prints. Evidence destroyed.' },
          { id: 'steal', label: 'Take the incriminating ones', effects: { heat: -3 }, result: 'You remove anything that shows your operation. He doesn\'t notice for weeks.' }
        ]
      },
      { title: 'The Exhibition', description: 'He\'s planning a gallery show: "Streets of Miami." Your operation will be on display for the world.',
        outcomes: [
          { id: 'fund', label: 'Fund the show (control narrative)', effects: { cash: -5000, publicImage: 5, streetCred: 3 }, result: 'You sponsor the exhibit but curate what\'s shown. Art meets propaganda. Brilliant.' },
          { id: 'shut', label: 'Shut it down', effects: { fear: 3, publicImage: -2 }, result: 'The gallery cancels after receiving threats. No show, no evidence.' },
          { id: 'evidence', label: 'Let it become police evidence', effects: { heat: 10, trust: -2 }, result: 'The show goes on. Detectives attend. Your photos are now exhibits A through Z.' }
        ]
      }
    ]
  },

  // === 2. COOKING SCHOOL ===
  {
    id: 'cooking_school', name: 'Cooking School', emoji: '🧪', category: 'production',
    condition: { minDay: 20, minCash: 5000 },
    chapters: [
      { title: 'The Retired Chemist', description: 'A retired chemistry professor offers to teach advanced synthesis. He claims his method produces 3x purity.',
        outcomes: [
          { id: 'accept', label: 'Enroll ($5K tuition)', effects: { cash: -5000 }, result: 'Classes begin in his basement lab. Day one: theoretical chemistry. He\'s the real deal.' },
          { id: 'decline', label: 'Too risky', effects: {}, result: 'You pass. He finds another student. You wonder what could have been.', endsChain: true }
        ]
      },
      { title: 'Source Rare Equipment', description: 'The professor needs specialized equipment that can\'t be bought legally. Time to get creative.',
        daysLimit: 7,
        outcomes: [
          { id: 'steal', label: 'Steal from university lab', effects: { heat: 10 }, result: 'A midnight raid on the chemistry department. Everything you need in one haul.' },
          { id: 'buy', label: 'Buy from dark web ($8K)', effects: { cash: -8000 }, result: 'Shipped in unmarked boxes. Expensive but clean.' },
          { id: 'improvise', label: 'Improvise with available gear', effects: { cash: -2000 }, result: 'Hardware store supplies and creativity. The professor is impressed by your resourcefulness.' }
        ]
      },
      { title: 'First Cook Together', description: 'The moment of truth. The professor guides you through the advanced process. One mistake and it all goes up.',
        outcomes: [
          { id: 'perfect', label: 'Follow instructions exactly', effects: { streetCred: 3 }, result: 'Pure as snow. The professor nods approvingly. "You\'re a natural."' },
          { id: 'modify', label: 'Add your own twist', effects: { streetCred: 2, cash: 2000 }, result: 'Your modification actually improves the yield. The professor raises an eyebrow.' },
          { id: 'rush', label: 'Rush the process', effects: { health: -15, cash: -3000 }, result: 'An explosion. Minor burns, lost product. "Patience," the professor scolds.' }
        ]
      },
      { title: 'The Master Batch', description: 'Final exam: produce a master batch solo. If it\'s good enough, the formula is yours permanently.',
        outcomes: [
          { id: 'master', label: 'Cook the perfect batch', effects: { cash: 15000, streetCred: 5 }, result: 'Blue-tinted perfection. 3x market value permanently. The "Blue Sky" recipe is yours.' },
          { id: 'sell', label: 'Sell the formula to others ($20K)', effects: { cash: 20000, trust: -3 }, result: 'You sell copies of the formula. Quick cash but now everyone has your edge.' },
          { id: 'keep_secret', label: 'Guard the secret with your life', effects: { streetCred: 5, fear: 2 }, result: 'Only you know the formula. Rivals will kill for it. Protect the recipe at all costs.' }
        ]
      }
    ]
  },

  // === 3. THE INHERITANCE ===
  {
    id: 'inheritance_quest', name: 'The Inheritance', emoji: '🗝️', category: 'treasure',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Will', description: 'A Cartel Remnant boss\'s will names you as beneficiary of a safety deposit box. Why you? Nobody knows.',
        outcomes: [
          { id: 'investigate', label: 'Investigate the connection', effects: {}, result: 'You learn the boss was an old friend of your family. The box has been waiting for years.' },
          { id: 'claim', label: 'Go straight to the bank', effects: { stress: 3 }, result: 'You have the documentation. The bank accepts it. Now you need the key.' }
        ]
      },
      { title: 'The Key Hunt', description: 'The key is somewhere in Little Havana. Three people claim to know where it is.',
        daysLimit: 10,
        outcomes: [
          { id: 'bribe', label: 'Bribe all three ($3K)', effects: { cash: -3000 }, result: 'Two lie, one tells the truth. The key is under a floorboard in an abandoned bodega.' },
          { id: 'interrogate', label: 'Interrogate them', effects: { fear: 3, heat: 5 }, result: 'Hard questions get hard answers. You find the key in a church collection box.' },
          { id: 'search', label: 'Search on your own', effects: { stress: 5, cash: -500 }, result: 'Three days of searching. You find it taped inside a jukebox at an old bar.' }
        ]
      },
      { title: 'The Box', description: 'You stand before the deposit box. Others are watching the bank. Whatever\'s inside, everyone wants it.',
        outcomes: [
          { id: 'open', label: 'Open it now', effects: { cash: 50000, streetCred: 3 }, result: '$50K in cash, a map to another stash, and incriminating evidence on three current faction leaders.' },
          { id: 'move', label: 'Move it to a safer location first', effects: { cash: 50000, streetCred: 2 }, result: 'Smart. You relocate the box contents under cover. No ambush. $50K and valuable intel secured.' },
          { id: 'share', label: 'Split with Cartel Remnants', effects: { cash: 25000, trust: 5 }, result: 'You give them half. Honorable. They become permanent allies. Worth more than money.' }
        ]
      }
    ]
  },

  // === 4. MARINA HEIST ===
  {
    id: 'marina_heist', name: 'Marina Heist', emoji: '🚢', category: 'heist',
    condition: { minDay: 30, minCrew: 3, minAct: 2 },
    chapters: [
      { title: 'The Target', description: 'A yacht loaded with cartel money docks at Miami port for one night. $1M+ onboard. One night only.',
        outcomes: [
          { id: 'scout', label: 'Begin scouting', effects: { cash: -1000 }, result: 'Binoculars, drone footage, guard schedules. The yacht has 4 guards and electronic locks.' },
          { id: 'pass', label: 'Too dangerous', effects: {}, result: 'You let the yacht sail away. Someone else will try. Or they won\'t.', endsChain: true }
        ]
      },
      { title: 'The Plan', description: 'You need a team, a boat, and an escape route. Every detail matters.',
        outcomes: [
          { id: 'stealth', label: 'Silent approach (underwater)', effects: { cash: -5000 }, result: 'Diving gear, EMP device for cameras, grappling hooks. The stealth approach.' },
          { id: 'assault', label: 'Fast and loud (speedboat)', effects: { cash: -3000 }, result: 'Speedboat, guns, masks. Shock and awe. In and out in four minutes.' },
          { id: 'inside', label: 'Inside man (bribe a guard $10K)', effects: { cash: -10000 }, result: 'A guard opens the back door at 3 AM. The easiest $10K you ever spent.' }
        ]
      },
      { title: 'The Heist', description: 'Go time. Your crew is in position. The yacht rocks gently in the harbor. Hearts pounding.',
        outcomes: [
          { id: 'flawless', label: 'Execute perfectly', effects: { cash: 500000, heat: 15, streetCred: 5 }, result: 'Half a million in cash. Clean getaway. The crew hugs on the escape boat. Legend.' },
          { id: 'complications', label: 'Adapt to surprises', effects: { cash: 300000, heat: 20, health: -15 }, result: 'Extra guards, alarm triggers, a chase. $300K recovered. Not clean but successful.' },
          { id: 'abort', label: 'Abort — something\'s wrong', effects: { cash: -5000, stress: 5 }, result: 'Coast Guard patrol spotted. You abort. No money but no prison either.' }
        ]
      },
      { title: 'The Aftermath', description: 'The cartel knows they were hit. Miami PD is investigating. Time to handle the fallout.',
        outcomes: [
          { id: 'scatter', label: 'Scatter and lay low', effects: { heat: -10, stress: 3 }, result: 'Crew disperses. Money hidden. You resurface in two weeks. Heat dies down.' },
          { id: 'frame', label: 'Frame a rival faction', effects: { heat: -15, streetCred: 2 }, result: 'Planted evidence points elsewhere. The cartel retaliates against your rival. Two birds.' },
          { id: 'negotiate', label: 'Return 30% as "peace offering"', effects: { cash: -150000, trust: 5, heat: -20 }, result: 'You send $150K back with a message: "Business tax." The cartel respects the audacity.' }
        ]
      }
    ]
  },

  // === 5. THE FIGHT PROMOTER ===
  {
    id: 'fight_promoter', name: 'The Fight Promoter', emoji: '🥊', category: 'business',
    condition: { minDay: 15, minCash: 10000 },
    chapters: [
      { title: 'The Proposition', description: 'An underground fight promoter needs a financial backer. $10K buy-in for 50% of the operation.',
        outcomes: [
          { id: 'invest', label: 'Invest $10K', effects: { cash: -10000 }, result: 'You\'re now co-owner of an underground fight ring. First event is next week.' },
          { id: 'negotiate', label: 'Demand 70% for $10K', effects: { cash: -10000, streetCred: 1 }, result: 'They take 30% reluctantly. You control the operation.' },
          { id: 'pass', label: 'Not interested', effects: {}, result: 'They find another backer. The fights go on without you.', endsChain: true }
        ]
      },
      { title: 'Recruit Fighters', description: 'You need fighters. Street brawlers, ex-boxers, anyone tough enough for the cage.',
        outcomes: [
          { id: 'crew', label: 'Use your crew', effects: { trust: -1 }, result: 'Your toughest crew members enter the ring. Loyalty tested in a new way.' },
          { id: 'recruit', label: 'Recruit from the streets', effects: { cash: -2000, streetCred: 1 }, result: 'Open auditions in a warehouse. The best fighters in Miami show up.' },
          { id: 'pros', label: 'Hire professionals ($5K)', effects: { cash: -5000 }, result: 'Ex-MMA fighters looking for off-the-books money. Quality guaranteed.' }
        ]
      },
      { title: 'Fix the Main Event', description: 'A big match with big money on the line. Fix it and guarantee profit, or let it play fair.',
        outcomes: [
          { id: 'fix', label: 'Fix the fight ($5K to the winner)', effects: { cash: 15000, streetCred: -1 }, result: 'Your fighter takes a dive in round 3. You collect $15K in sure bets.' },
          { id: 'fair', label: 'Let it play out', effects: { cash: Math.random() > 0.5 ? 20000 : -5000, streetCred: 2 }, result: 'Genuine competition. The crowd goes wild. Revenue depends on the outcome.' },
          { id: 'both', label: 'Bet on both fighters through proxies', effects: { cash: 8000, streetCred: 1 }, result: 'Hedged bets through fake accounts. You win either way. $8K guaranteed.' }
        ]
      },
      { title: 'A Fighter Dies', description: 'A fighter doesn\'t get up after a knockout. No pulse. The crowd is silent.',
        outcomes: [
          { id: 'hospital', label: 'Rush them to the hospital', effects: { heat: 10, publicImage: 1 }, result: 'They survive but police investigate. The fight ring is exposed.' },
          { id: 'doctor', label: 'Call your street doctor', effects: { cash: -3000 }, result: 'Dr. Rosa (or equivalent) stabilizes them. No records. The fight ring survives.' },
          { id: 'cover', label: 'Cover it up', effects: { fear: 5, trust: -3, heat: 5 }, result: 'The body disappears. The crowd is paid for silence. Dark but the operation continues.' }
        ]
      },
      { title: 'Going Regional', description: 'The fight nights are a hit. Time to expand to other cities or stay local and profitable.',
        outcomes: [
          { id: 'expand', label: 'Go regional ($20K)', effects: { cash: -20000, streetCred: 5 }, result: 'Fight nights in three cities. $20K/event revenue. You\'re a mogul.' },
          { id: 'local', label: 'Stay local and profitable', effects: { cash: 10000, streetCred: 2 }, result: 'Weekly events in Miami. Steady $10K income. No expansion headaches.' },
          { id: 'sell', label: 'Sell your stake ($30K)', effects: { cash: 30000 }, result: 'You cash out at the top. $30K clean. Let someone else deal with the blood.' }
        ]
      }
    ]
  },

  // === 6. WITNESS RELOCATION ===
  {
    id: 'witness_relocation', name: 'Witness Relocation', emoji: '🔒', category: 'intel',
    condition: { minDay: 30, minAct: 2 },
    chapters: [
      { title: 'The Protected Witness', description: 'A key witness against a major rival is in federal witness protection. If they testify, the rival goes down.',
        outcomes: [
          { id: 'find', label: 'Locate them (corrupt fed $10K)', effects: { cash: -10000 }, result: 'Your fed contact provides the safe house address. The witness is in Broward County.' },
          { id: 'ignore', label: 'Let justice take its course', effects: {}, result: 'The rival goes to trial. Not your problem.', endsChain: true }
        ]
      },
      { title: 'The Approach', description: 'You know where the witness is. Now what? This has to be handled delicately.',
        outcomes: [
          { id: 'bribe', label: 'Bribe the witness ($50K)', effects: { cash: -50000, trust: 2 }, result: 'They agree to recant their testimony for $50K and a new identity. Everyone wins.' },
          { id: 'intimidate', label: 'Intimidate them', effects: { fear: 5, heat: 10 }, result: 'A visit in the night. They\'re too scared to testify now. Case collapses.' },
          { id: 'recruit', label: 'Turn them into your informant', effects: { cash: -20000, streetCred: 3 }, result: 'They flip to work for you. A source inside witness protection. Unprecedented access.' }
        ]
      },
      { title: 'The Fallout', description: 'The case collapses. Your rival is free. But they know someone helped. Who gets the credit?',
        outcomes: [
          { id: 'claim', label: 'Let the rival know it was you', effects: { trust: 5, streetCred: 3 }, result: 'They owe you their freedom. A debt that can never be repaid. Ultimate leverage.' },
          { id: 'anonymous', label: 'Stay anonymous', effects: { streetCred: 2 }, result: 'The rival is grateful to the universe. You know the truth. That\'s enough.' },
          { id: 'leverage', label: 'Demand a favor in return', effects: { cash: 30000, trust: 3 }, result: '$30K "consulting fee" and a mutual defense pact. Business is business.' }
        ]
      }
    ]
  },

  // === 7. THE DIVER ===
  {
    id: 'the_diver', name: 'The Diver', emoji: '🤿', category: 'treasure',
    condition: { minDay: 20, minCash: 20000 },
    chapters: [
      { title: 'Sunken Treasure', description: 'A scuba diver found a 1980s drug shipment on the ocean floor. He needs $20K to fund the recovery.',
        outcomes: [
          { id: 'fund', label: 'Fund the operation ($20K)', effects: { cash: -20000 }, result: 'Equipment rented, boat secured. The dive is scheduled for next week.' },
          { id: 'partner', label: 'Fund half, split 50/50 ($10K)', effects: { cash: -10000 }, result: 'Fair deal. Half the risk, half the reward.' },
          { id: 'refuse', label: 'Sounds like a scam', effects: {}, result: 'You pass. He finds another investor. Maybe it was real. Maybe not.', endsChain: true }
        ]
      },
      { title: 'The Dive', description: 'Thirty feet below the surface, the team locates the wreck. Waterproof containers scattered on the seabed.',
        outcomes: [
          { id: 'recover_all', label: 'Recover everything', effects: { stress: 3 }, result: 'Eight containers pulled up. Five are intact. The others are waterlogged ruins.' },
          { id: 'quick', label: 'Grab and go (weather\'s turning)', effects: { cash: 30000 }, result: 'You pull up three containers before the storm hits. $30K in salvageable product.' },
          { id: 'mark', label: 'Mark the location, come back later', effects: { cash: -2000 }, result: 'GPS coordinates saved. You\'ll return with better equipment.' }
        ]
      },
      { title: 'The Haul', description: 'On shore, you open the containers. Decades-old product inside. Some preserved, some ruined.',
        outcomes: [
          { id: 'sell_vintage', label: 'Sell as "vintage" premium', effects: { cash: 100000, streetCred: 3 }, result: '$100K! Collectors and connoisseurs pay insane prices for 80s-era product.' },
          { id: 'process', label: 'Reprocess and sell normally', effects: { cash: 50000 }, result: '$50K after processing. Not premium but solid recovery on investment.' },
          { id: 'dump', label: 'Too degraded — dump it', effects: { cash: -20000, stress: 5 }, result: 'It\'s garbage. Total loss. The ocean kept its treasure after all.' }
        ]
      }
    ]
  },

  // === 8. HOSPITAL HEIST ===
  {
    id: 'hospital_heist', name: 'Hospital Heist', emoji: '💊', category: 'heist',
    condition: { minDay: 25, minCrew: 2 },
    chapters: [
      { title: 'The Target', description: 'A pharmaceutical warehouse holds $200K+ in prescription drugs. Security is automated. Shift change at 3 AM.',
        outcomes: [
          { id: 'plan', label: 'Begin planning', effects: { cash: -2000 }, result: 'Blueprints acquired, guard schedules mapped, uniforms ordered. The heist takes shape.' },
          { id: 'abort', label: 'Pharma is too hot right now', effects: {}, result: 'You pass. DEA is cracking down on pharmaceutical theft.', endsChain: true }
        ]
      },
      { title: 'Preparation', description: 'You need a delivery truck, warehouse uniforms, and a way to disable the alarm system.',
        daysLimit: 7,
        outcomes: [
          { id: 'pro', label: 'Full professional setup ($10K)', effects: { cash: -10000 }, result: 'Real uniforms, real truck, cloned ID badges. Indistinguishable from the real thing.' },
          { id: 'budget', label: 'Budget approach ($3K)', effects: { cash: -3000, heat: 5 }, result: 'Passable disguises and a rented truck. It\'ll work if nobody looks too closely.' },
          { id: 'hack', label: 'Hack the alarm remotely ($5K)', effects: { cash: -5000 }, result: 'Your tech contact kills the alarm from outside. One less thing to worry about.' }
        ]
      },
      { title: 'The Heist', description: '3:02 AM. Shift change. Your team moves in. 12 minutes to load the truck and disappear.',
        outcomes: [
          { id: 'clean', label: 'Clean execution', effects: { cash: 150000, heat: 10, streetCred: 3 }, result: '$150K in pharmaceuticals. No alarms, no witnesses. The perfect job.' },
          { id: 'partial', label: 'Grab what you can (alarm triggers)', effects: { cash: 80000, heat: 20 }, result: 'Alarm goes off at minute 8. You grab $80K worth before fleeing. Messy but profitable.' },
          { id: 'jackpot', label: 'Discover the high-security vault', effects: { cash: 200000, heat: 15, streetCred: 5 }, result: 'Behind the main storage: a vault of controlled substances. $200K haul. Legendary.' }
        ]
      }
    ]
  },

  // === 9. DIPLOMAT\'S SON ===
  {
    id: 'diplomats_son', name: 'The Diplomat\'s Son', emoji: '🏛️', category: 'politics',
    condition: { minDay: 20 },
    chapters: [
      { title: 'The Debt', description: 'A foreign diplomat\'s son owes you $15K for product. He\'s hiding behind diplomatic immunity.',
        outcomes: [
          { id: 'collect', label: 'Pressure the son directly', effects: { fear: 2, cash: 15000 }, result: 'Immunity doesn\'t stop broken kneecaps. He pays from daddy\'s account.' },
          { id: 'leverage', label: 'Approach the father', effects: { cash: 15000, trust: 2 }, result: 'A discreet conversation. The father pays to make you disappear. Plus a useful contact.' },
          { id: 'forgive', label: 'Forgive the debt (investment)', effects: { trust: 5 }, result: 'You write it off. The son is grateful. Diplomatic immunity works both ways now.' }
        ]
      },
      { title: 'The Connection', description: 'The diplomat wants to keep you quiet. But he also has connections that could change your game.',
        outcomes: [
          { id: 'immunity', label: 'Request diplomatic pouch access', effects: { streetCred: 5 }, result: 'Product shipped via diplomatic pouches. Customs can\'t touch them. Game-changing logistics.' },
          { id: 'blackmail', label: 'Blackmail for cash ($50K)', effects: { cash: 50000, trust: -5 }, result: '$50K or the story goes to the press. He pays. But diplomats have long memories.' },
          { id: 'alliance', label: 'Propose a partnership', effects: { cash: 10000, trust: 3, streetCred: 3 }, result: 'A quiet alliance. His connections, your product. International distribution with zero customs risk.' }
        ]
      },
      { title: 'The Fallout', description: 'The diplomat is being reassigned. Your connection is leaving the country. Handle the transition.',
        outcomes: [
          { id: 'replacement', label: 'Get introduced to the replacement', effects: { trust: 3, streetCred: 2 }, result: 'The new diplomat is even more corrupt. Seamless transition. Business continues.' },
          { id: 'parting', label: 'One last big deal together', effects: { cash: 100000, heat: 5 }, result: 'A massive final shipment through diplomatic channels. $100K payday. The end of an era.' },
          { id: 'clean', label: 'Cut ties cleanly', effects: { heat: -5 }, result: 'You end the relationship professionally. No loose ends. A clean break.' }
        ]
      }
    ]
  },

  // === 10. DOG TRACK ===
  {
    id: 'dog_track', name: 'Dog Track', emoji: '🐕', category: 'business',
    condition: { minDay: 20, minCash: 20000 },
    chapters: [
      { title: 'The Property', description: 'An abandoned dog racing track is for sale. Prime real estate with existing infrastructure.',
        outcomes: [
          { id: 'buy', label: 'Buy it ($20K)', effects: { cash: -20000 }, result: 'The track is yours. A blank canvas for legitimate business and criminal enterprise.' },
          { id: 'negotiate', label: 'Negotiate lower ($15K)', effects: { cash: -15000, streetCred: 1 }, result: 'You talk them down. $15K for a property worth three times that.' },
          { id: 'pass', label: 'Not interested', effects: {}, result: 'A developer buys it and builds condos. Opportunity gone.', endsChain: true }
        ]
      },
      { title: 'Renovation', description: 'The track needs work. What kind of venue do you want to create?',
        outcomes: [
          { id: 'gambling', label: 'Gambling venue ($30K)', effects: { cash: -30000 }, result: 'Full casino setup. Poker, slots, sports betting. The ultimate cash business.' },
          { id: 'events', label: 'Event space ($20K)', effects: { cash: -20000, publicImage: 2 }, result: 'Concert venue, fight nights, community events. Versatile and public-facing.' },
          { id: 'front', label: 'Minimal renovation ($10K)', effects: { cash: -10000 }, result: 'Just enough to look operational. The real business happens in back rooms.' }
        ]
      },
      { title: 'Grand Opening', description: 'Opening night. The community is watching. Activists are protesting outside.',
        outcomes: [
          { id: 'gala', label: 'Star-studded opening ($10K)', effects: { cash: -10000, publicImage: 8, streetCred: 3 }, result: 'Celebrities, politicians, media. The track becomes the hottest venue in Miami.' },
          { id: 'quiet', label: 'Soft opening', effects: { cash: -2000, publicImage: 2 }, result: 'Low-key launch. Word of mouth builds. Steady growth without spectacle.' },
          { id: 'address', label: 'Address the protesters', effects: { communityRep: 5, publicImage: 3 }, result: 'You promise community benefits and animal welfare compliance. The protests stop.' }
        ]
      },
      { title: 'Operations', description: 'The track is running. Now maximize its potential.',
        outcomes: [
          { id: 'launder', label: 'Full laundering operation', effects: { cash: 20000, heat: 5, streetCred: 2 }, result: '$20K/month laundered through gambling revenue. The perfect front.' },
          { id: 'legit', label: 'Run it legitimately', effects: { cash: 10000, publicImage: 5 }, result: 'Clean income, clean image. $10K/month legitimate revenue.' },
          { id: 'hub', label: 'Distribution hub + venue', effects: { cash: 15000, heat: 3, streetCred: 3 }, result: 'Product moves through the venue during events. $15K/month combined revenue.' }
        ]
      }
    ]
  },

  // === 11. THE TUNNELERS ===
  {
    id: 'tunnelers', name: 'The Tunnelers', emoji: '⛏️', category: 'infrastructure',
    condition: { minDay: 25, minCash: 15000 },
    chapters: [
      { title: 'The Offer', description: 'A crew of ex-miners offers to build tunnels between your properties. Invisible infrastructure.',
        outcomes: [
          { id: 'hire', label: 'Hire them ($15K)', effects: { cash: -15000 }, result: 'Construction begins at night. The miners work in shifts. Nobody suspects a thing.' },
          { id: 'negotiate', label: 'Negotiate performance bonuses', effects: { cash: -10000, trust: 1 }, result: '$10K upfront plus bonuses per completed tunnel. Aligned incentives.' },
          { id: 'decline', label: 'Too much noise', effects: {}, result: 'The vibrations would attract attention. You pass.', endsChain: true }
        ]
      },
      { title: 'Construction', description: 'Digging is underway. But underground surprises await — pipes, cables, even an old bootlegger tunnel.',
        outcomes: [
          { id: 'expand', label: 'Connect to existing tunnels ($5K extra)', effects: { cash: -5000, streetCred: 3 }, result: 'The old bootlegger network doubles your tunnel system. Historical infrastructure repurposed.' },
          { id: 'basic', label: 'Keep it simple, just your properties', effects: { streetCred: 2 }, result: 'Two tunnels connecting three properties. Clean, functional, hidden.' },
          { id: 'luxury', label: 'Build luxury bunker mid-tunnel ($20K)', effects: { cash: -20000, streetCred: 4 }, result: 'A full living space underground. Generator, supplies, communication. Ultimate safehouse.' }
        ]
      },
      { title: 'First Use', description: 'Time to test the tunnels. A major police raid is happening on the surface.',
        outcomes: [
          { id: 'escape', label: 'Use tunnels to escape the raid', effects: { heat: -20, streetCred: 5 }, result: 'Cops find an empty building. You and your product are three blocks away. Magic.' },
          { id: 'smuggle', label: 'Move product while streets are hot', effects: { cash: 10000 }, result: 'Surface is crawling with cops. Underground, your product moves freely. $10K deal closed.' },
          { id: 'evacuate', label: 'Evacuate crew through tunnels', effects: { trust: 5, heat: -10 }, result: 'Your entire crew vanishes in minutes. No arrests. The tunnel system proves its worth.' }
        ]
      }
    ]
  },

  // === 12. FOOD TRUCK WARS ===
  {
    id: 'food_truck_wars', name: 'Food Truck Wars', emoji: '🌮', category: 'territory',
    condition: { minDay: 15 },
    chapters: [
      { title: 'The Competitor', description: 'A rival\'s food truck operation has set up in your territory. They\'re selling more than tacos.',
        outcomes: [
          { id: 'investigate', label: 'Investigate their operation', effects: { cash: -500 }, result: 'They\'re running a mobile distribution network. Clever. Your customers are going to their trucks.' },
          { id: 'confront', label: 'Confront them directly', effects: { fear: 2 }, result: 'You tell them to move. They refuse. "It\'s a free market, boss." This means war.' },
          { id: 'compete', label: 'Open your own trucks', effects: { cash: -8000 }, result: 'You launch three food trucks. The battle for street corners begins.' }
        ]
      },
      { title: 'The War', description: 'Sabotage, price wars, health inspections used as weapons. The food truck war escalates.',
        outcomes: [
          { id: 'sabotage', label: 'Sabotage their trucks', effects: { fear: 3, heat: 5 }, result: 'Flat tires, contaminated supplies, anonymous health complaints. Their fleet dwindles.' },
          { id: 'outcompete', label: 'Better food, better product', effects: { cash: -5000, publicImage: 2 }, result: 'You invest in quality. Customers return. Word spreads that your trucks are the best.' },
          { id: 'buy_out', label: 'Buy them out ($15K)', effects: { cash: -15000, streetCred: 2 }, result: 'You offer cash for their entire fleet. They accept. Monopoly achieved.' }
        ]
      },
      { title: 'The Network', description: 'You now control the food truck network. Time to integrate it with your operation.',
        outcomes: [
          { id: 'distribution', label: 'Full distribution network', effects: { cash: 5000, streetCred: 3 }, result: 'Each truck is a mobile dealing point. $5K/day additional revenue across the fleet.' },
          { id: 'intel', label: 'Intelligence network on wheels', effects: { streetCred: 2 }, result: 'Your trucks monitor every neighborhood. Real-time intel on rivals, police, and customers.' },
          { id: 'legit_food', label: 'Keep it mostly legit', effects: { cash: 3000, publicImage: 3 }, result: 'Good food, low-key dealing. $3K/day with minimal heat. Sustainable.' }
        ]
      },
      { title: 'Expansion', description: 'The food truck concept is proven. How far do you take it?',
        outcomes: [
          { id: 'franchise', label: 'Franchise across Miami ($20K)', effects: { cash: -20000, streetCred: 5, publicImage: 5 }, result: '20 trucks across the city. A food empire and distribution network combined. Iconic.' },
          { id: 'restaurant', label: 'Open a permanent restaurant', effects: { cash: -30000, publicImage: 5 }, result: 'From trucks to brick-and-mortar. The restaurant becomes your premier front.' },
          { id: 'sell_fleet', label: 'Sell the fleet ($25K)', effects: { cash: 25000 }, result: 'You cash out. $25K profit. Let someone else handle health inspections.' }
        ]
      }
    ]
  },

  // === 13. THE WHISTLEBLOWER ===
  {
    id: 'whistleblower', name: 'The Whistleblower', emoji: '📂', category: 'politics',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Contact', description: 'A city government employee has evidence of massive corruption — bribes, kickbacks, offshore accounts.',
        outcomes: [
          { id: 'meet', label: 'Meet them secretly', effects: { cash: -500, stress: 2 }, result: 'A parking garage meeting. They\'re scared but determined. The evidence is explosive.' },
          { id: 'verify', label: 'Verify their identity first', effects: { cash: -1000 }, result: 'Background check confirms: they\'re legit. Senior official with access to everything.' },
          { id: 'ignore', label: 'Don\'t get involved in politics', effects: {}, result: 'You let it pass. Politics is a different kind of dangerous.', endsChain: true }
        ]
      },
      { title: 'The Evidence', description: 'You have the documents. Names, dates, amounts. Half of City Hall is implicated.',
        outcomes: [
          { id: 'leverage', label: 'Use as leverage on politicians', effects: { streetCred: 5, fear: 3 }, result: 'Every corrupt official in Miami owes you. Licenses, permits, police cooperation — all yours.' },
          { id: 'sell_media', label: 'Sell to media ($30K)', effects: { cash: 30000, publicImage: 5 }, result: 'A journalist pays $30K for the scoop. Political earthquake. You\'re the anonymous hero.' },
          { id: 'trade', label: 'Trade for political favors', effects: { trust: 5, streetCred: 3 }, result: 'You approach each official privately. In exchange for silence: favors. An empire of leverage.' }
        ]
      },
      { title: 'Protecting the Source', description: 'The whistleblower is in danger. Someone figured out there\'s a leak.',
        outcomes: [
          { id: 'protect', label: 'Full protection ($10K)', effects: { cash: -10000, trust: 5 }, result: 'You hide them, get them a new identity. A loyal contact preserved.' },
          { id: 'sacrifice', label: 'Let them take the fall', effects: { trust: -5, fear: 2 }, result: 'They\'re arrested. But they can\'t connect you to the leak. Self-preservation.' },
          { id: 'relocate', label: 'Get them out of Miami ($5K)', effects: { cash: -5000, trust: 3 }, result: 'Bus ticket, cash, new phone. They disappear. The evidence remains with you.' }
        ]
      }
    ]
  },

  // === 14. YACHT PARTY ===
  {
    id: 'yacht_party', name: 'Yacht Party Circuit', emoji: '🛥️', category: 'business',
    condition: { minDay: 25, minAct: 2 },
    chapters: [
      { title: 'The Invitation', description: 'Miami\'s elite yacht party circuit needs a discreet drug supplier. Ultra-premium clientele.',
        outcomes: [
          { id: 'accept', label: 'Accept the opportunity', effects: { cash: -2000, streetCred: 2 }, result: 'You invest in presentation: premium packaging, white glove delivery. First party is Saturday.' },
          { id: 'decline', label: 'Too much exposure to high society', effects: {}, result: 'You stay in your lane. The yacht circuit finds another supplier.', endsChain: true }
        ]
      },
      { title: 'The First Party', description: 'A 200-foot yacht. Champagne, celebrities, executives. You\'re the most important guest they don\'t talk about.',
        outcomes: [
          { id: 'impress', label: 'Impress with quality', effects: { cash: 10000, streetCred: 3 }, result: 'Your product is the hit of the party. $10K in sales. Repeat invitations guaranteed.' },
          { id: 'network', label: 'Focus on networking', effects: { trust: 3, publicImage: 2 }, result: 'You make connections with a senator, two CEOs, and a music producer. The product sells itself.' },
          { id: 'overdo', label: 'Oversupply the party', effects: { cash: 15000, heat: 5 }, result: 'You bring extra. Everything sells. $15K. But someone took photos with your product visible.' }
        ]
      },
      { title: 'VIP Status', description: 'You\'re now the go-to supplier for Miami\'s elite party scene. Recurring revenue and high-level connections.',
        outcomes: [
          { id: 'exclusive', label: 'Stay exclusive ($20K/event)', effects: { cash: 20000, streetCred: 5 }, result: 'Recurring $20K events. Ultra-premium pricing. The elite pay whatever you ask.' },
          { id: 'expand', label: 'Supply all yacht parties', effects: { cash: 15000, heat: 5, streetCred: 3 }, result: 'Volume over exclusivity. $15K/event across multiple parties.' },
          { id: 'retire', label: 'Cash out connections', effects: { cash: 50000, publicImage: 5 }, result: 'You trade supplier role for investor introductions. $50K in legitimate deals. Going up.' }
        ]
      }
    ]
  },

  // === 15. PRISON RIOT ===
  {
    id: 'prison_riot', name: 'Prison Riot', emoji: '🔓', category: 'chaos',
    condition: { minDay: 30 },
    chapters: [
      { title: 'Chaos Inside', description: 'A riot breaks out at the county jail. Your associates inside see opportunity.',
        outcomes: [
          { id: 'smuggle', label: 'Smuggle supplies to allies ($5K)', effects: { cash: -5000, trust: 5 }, result: 'Phones, weapons, and product smuggled in during the chaos. Your allies gain prison control.' },
          { id: 'escape', label: 'Help associates escape', effects: { cash: -10000, heat: 15, trust: 8 }, result: 'Three of your people walk out during the confusion. Loyal soldiers returned to the streets.' },
          { id: 'observe', label: 'Watch and wait', effects: { stress: 2 }, result: 'You monitor the situation. The riot ends. Some of your people survived, some didn\'t.' }
        ]
      },
      { title: 'The Aftermath', description: 'Post-riot crackdown. Extra police everywhere. But the power dynamics inside have shifted.',
        outcomes: [
          { id: 'recruit', label: 'Recruit escaped inmates', effects: { streetCred: 3, heat: 5 }, result: 'Three hard men join your crew. Prison-tested loyalty and skills.' },
          { id: 'intel', label: 'Debrief for intelligence', effects: { streetCred: 2 }, result: 'Your returnees share everything: who snitched, who\'s planning what, police informant identities.' },
          { id: 'lay_low', label: 'Stay invisible during crackdown', effects: { heat: -5 }, result: 'You go dark while police search for escapees. Smart. The heat passes you by.' }
        ]
      },
      { title: 'New Alliances', description: 'The prison power shift creates new alliances on the streets. Your position has changed.',
        outcomes: [
          { id: 'consolidate', label: 'Consolidate new prison alliances', effects: { streetCred: 5, trust: 5 }, result: 'Your people control a cellblock. Prison becomes a recruitment and distribution channel.' },
          { id: 'expand', label: 'Expand using new crew', effects: { cash: 5000, streetCred: 3 }, result: 'The escaped inmates know territory your rivals control. Time to redraw the map.' },
          { id: 'distance', label: 'Distance from prison politics', effects: { heat: -5 }, result: 'Prison drama stays in prison. You keep your street operation clean and separate.' }
        ]
      }
    ]
  },

  // === 16. THE ART DEALER ===
  {
    id: 'art_dealer', name: 'The Art Dealer', emoji: '🎨', category: 'business',
    condition: { minDay: 25, minCash: 20000 },
    chapters: [
      { title: 'Gallery Connection', description: 'An art dealer in Wynwood launders money through art sales. He needs a partner with cash flow.',
        outcomes: [
          { id: 'partner', label: 'Partner up ($20K)', effects: { cash: -20000, publicImage: 2 }, result: 'You\'re now a patron of the arts. Your money becomes paint on canvas becomes clean money.' },
          { id: 'observe', label: 'Watch his operation first', effects: { cash: -1000 }, result: 'You study his methods. Art laundering is sophisticated but effective.' },
          { id: 'pass', label: 'Art isn\'t your thing', effects: {}, result: 'You pass. Wynwood galleries do fine without you.', endsChain: true }
        ]
      },
      { title: 'The Art Show', description: 'A joint art show is your laundering debut. $200K in "sales" need to look legitimate.',
        outcomes: [
          { id: 'extravagant', label: 'Go all out ($10K event)', effects: { cash: -10000, publicImage: 5 }, result: 'The show is a sensation. Art critics rave. $200K laundered through "art purchases."' },
          { id: 'modest', label: 'Keep it small', effects: { cash: -3000 }, result: 'Intimate gallery showing. $100K laundered. Lower profile, lower risk.' },
          { id: 'inflate', label: 'Inflate prices absurdly', effects: { cash: -5000, heat: 3 }, result: 'A stick figure "sells" for $500K. The IRS raises an eyebrow but art prices are subjective.' }
        ]
      },
      { title: 'FBI Art Crime Unit', description: 'The FBI\'s art crime division is sniffing around Wynwood galleries. Your operation is at risk.',
        outcomes: [
          { id: 'clean', label: 'Go completely legit temporarily', effects: { cash: -5000 }, result: 'All art is genuine. All sales are real. The FBI finds nothing. Resume operations in 30 days.' },
          { id: 'destroy', label: 'Destroy evidence', effects: { heat: 5, fear: 2 }, result: 'Records burned, fake provenance destroyed. They suspect but can\'t prove.' },
          { id: 'cooperate', label: 'Feed them a competitor', effects: { heat: -10, trust: -2 }, result: 'You tip the FBI to a rival gallery. They make arrests elsewhere. Your gallery thrives.' }
        ]
      }
    ]
  },

  // === 17. CUBAN REFUGEE BOAT ===
  {
    id: 'cuban_refugee', name: 'Cuban Refugee Boat', emoji: '🚤', category: 'crew',
    condition: { minDay: 20 },
    chapters: [
      { title: 'Landfall', description: 'A rickety boat of Cuban refugees lands near your territory. Among them: a chemist and a former soldier.',
        outcomes: [
          { id: 'help', label: 'Help them all', effects: { cash: -3000, communityRep: 10 }, result: 'Food, shelter, clothes. The whole community sees your generosity.' },
          { id: 'cherry_pick', label: 'Recruit the skilled ones', effects: { streetCred: 2 }, result: 'The chemist and soldier join your crew. Elite talent from desperation.' },
          { id: 'ignore', label: 'Not your problem', effects: {}, result: 'They drift into the community. Someone else helps. Someone else recruits.', endsChain: true }
        ]
      },
      { title: 'The Chemist', description: 'Carlos was a pharmaceutical researcher in Havana. His skills are world-class. He needs documents and a lab.',
        outcomes: [
          { id: 'full_support', label: 'Full support ($10K)', effects: { cash: -10000, trust: 5 }, result: 'New identity, lab access, housing. Carlos is overwhelmed with gratitude. A loyal asset for life.' },
          { id: 'conditional', label: 'Support for loyalty', effects: { cash: -5000, trust: 3 }, result: 'You help but make expectations clear. He agrees. Fair exchange.' },
          { id: 'papers_only', label: 'Just papers ($2K)', effects: { cash: -2000, trust: 1 }, result: 'Enough to get him started. He\'ll remember the minimal help.' }
        ]
      },
      { title: 'The Breakthrough', description: 'Carlos develops a synthesis method that doubles purity with half the ingredients. Revolutionary.',
        outcomes: [
          { id: 'exclusive', label: 'Keep it exclusive', effects: { cash: 20000, streetCred: 5 }, result: 'Your product becomes the best in Miami. $20K premium revenue. Rivals are envious.' },
          { id: 'share', label: 'License to allies', effects: { cash: 10000, trust: 5, streetCred: 3 }, result: 'Your allies pay for access. Relationship strengthened. Revenue diversified.' },
          { id: 'carlos_legit', label: 'Help Carlos go legitimate', effects: { cash: -5000, publicImage: 5, communityRep: 5 }, result: 'Carlos opens a legitimate pharmaceutical consultancy. You funded a dream and gained a lifelong ally.' }
        ]
      }
    ]
  },

  // === 18. POKER TOURNAMENT ===
  {
    id: 'poker_tournament', name: 'Poker Tournament', emoji: '♠️', category: 'social',
    condition: { minDay: 25, minCash: 50000 },
    chapters: [
      { title: 'The Buy-In', description: 'Underground high-stakes poker with faction leaders. $50K buy-in. Information worth more than the pot.',
        outcomes: [
          { id: 'play', label: 'Buy in ($50K)', effects: { cash: -50000, stress: 3 }, result: 'You take your seat. Five faction leaders around the table. The real game isn\'t cards.' },
          { id: 'observe', label: 'Attend as a spectator', effects: { cash: -5000, streetCred: 1 }, result: '$5K for a seat at the rail. You watch, listen, and learn. Cheaper intel.' },
          { id: 'skip', label: 'Too rich for your blood', effects: {}, result: 'You skip it. The stories come secondhand.', endsChain: true }
        ]
      },
      { title: 'The Game', description: 'Hours of poker. Millions on the table. Conversations between hands reveal everything.',
        outcomes: [
          { id: 'win', label: 'Play to win', effects: { cash: 200000, streetCred: 5 }, result: 'You clean the table. $200K pot. The respect of every faction leader. Historic night.' },
          { id: 'intel', label: 'Play to gather intel', effects: { cash: -10000, streetCred: 3 }, result: 'You lose $10K but learn every faction\'s weak spot. Worth ten times the money.' },
          { id: 'cheat', label: 'Cheat (risky)', effects: { cash: 150000, heat: 10 }, result: 'Marked cards and a mirror app. $150K. But if anyone finds out, it\'s war.' }
        ]
      },
      { title: 'After the Game', description: 'Winners celebrate, losers seethe. Alliances form and grudges are born over poker chips.',
        outcomes: [
          { id: 'humble', label: 'Win graciously', effects: { trust: 5, publicImage: 2 }, result: 'You buy everyone drinks. The losers don\'t hate you. Class act.' },
          { id: 'gloat', label: 'Rub it in', effects: { fear: 3, trust: -3 }, result: 'You count your money loudly. The losers are furious. You just made powerful enemies.' },
          { id: 'reinvest', label: 'Invest winnings immediately', effects: { cash: -50000, streetCred: 3 }, result: 'You announce a major business expansion on the spot. Power move. The table takes notice.' }
        ]
      }
    ]
  },

  // === 19. THE CHEMIST\'S FORMULA ===
  {
    id: 'chemist_formula', name: 'The Chemist\'s Formula', emoji: '⚗️', category: 'production',
    condition: { minDay: 30, minCash: 100000, minAct: 2 },
    chapters: [
      { title: 'The Dying Chemist', description: 'A legendary cook is dying of cancer. He has the formula everyone wants. He\'ll sell it to one person.',
        outcomes: [
          { id: 'buy', label: 'Buy the formula ($100K)', effects: { cash: -100000, streetCred: 3 }, result: 'The old man hands you a notebook. "Don\'t waste it." His life\'s work in your hands.' },
          { id: 'negotiate', label: 'Offer legacy instead ($50K + named product)', effects: { cash: -50000, trust: 3 }, result: 'You name the product after him. He\'s moved. "Make it mean something."' },
          { id: 'steal', label: 'Just take it', effects: { fear: 5, trust: -5 }, result: 'You rob a dying man. The formula is yours but your soul takes a hit.' }
        ]
      },
      { title: 'Testing the Formula', description: 'The formula is complex. One wrong step and you\'ve got poison. Chemistry skill required.',
        outcomes: [
          { id: 'careful', label: 'Methodical testing (7 days)', effects: { stress: 3 }, result: 'Seven days of careful work. The result is stunning. Blue-tinted perfection. 3x market value.' },
          { id: 'rush', label: 'Speed test (2 days)', effects: { health: -10 }, result: 'A minor explosion later, you have a workable batch. Not perfect but profitable.' },
          { id: 'outsource', label: 'Hire a chemist to test ($10K)', effects: { cash: -10000, trust: -1 }, result: 'Professional results. But now someone else knows the formula exists.' }
        ]
      },
      { title: 'Protecting the Formula', description: 'Word is out that someone has the legendary formula. Three factions want it.',
        outcomes: [
          { id: 'fortify', label: 'Guard it with your life', effects: { fear: 5, streetCred: 5 }, result: 'You make it clear: anyone who comes for the formula faces war. They back off.' },
          { id: 'share', label: 'License to allies ($50K each)', effects: { cash: 150000, trust: 3 }, result: 'Three allies pay $50K each for access. $150K in licensing. The formula funds your empire.' },
          { id: 'destroy', label: 'Memorize it, destroy the notebook', effects: { streetCred: 3 }, result: 'No physical evidence. The formula exists only in your mind. Ultimate security.' }
        ]
      },
      { title: 'Blue Sky Legacy', description: 'The "Blue Sky" product changes Miami\'s drug market. You\'re at the center of a revolution.',
        outcomes: [
          { id: 'monopoly', label: 'Maintain production monopoly', effects: { cash: 50000, streetCred: 5, heat: 10 }, result: 'You\'re the only source. Premium pricing forever. $50K/month in Blue Sky revenue.' },
          { id: 'brand', label: 'Build the Blue Sky brand', effects: { cash: 30000, publicImage: -2, streetCred: 5 }, result: 'Blue Sky becomes a cultural phenomenon. Dangerous notoriety but legendary status.' },
          { id: 'retire_formula', label: 'Save for retirement play', effects: { cash: 20000, stress: -5 }, result: 'You use it sparingly. Special occasions. The scarcity maintains the premium.' }
        ]
      }
    ]
  },

  // === 20. SUPER BOWL ===
  {
    id: 'super_bowl', name: 'Super Bowl Miami', emoji: '🏈', category: 'event',
    condition: { minDay: 40, minAct: 2, minCrew: 3 },
    chapters: [
      { title: 'Preparation', description: 'The Super Bowl is coming to Miami. Five days of the biggest demand surge possible. Time to prepare.',
        outcomes: [
          { id: 'stockpile', label: 'Massive stockpile ($50K)', effects: { cash: -50000, streetCred: 2 }, result: 'You buy everything available. Warehouse full. Ready for the biggest week in Miami.' },
          { id: 'moderate', label: 'Moderate preparation ($20K)', effects: { cash: -20000 }, result: 'Solid inventory without overextending. Smart risk management.' },
          { id: 'scramble', label: 'Wing it', effects: { stress: 5 }, result: 'You\'ll buy as you go. Risky but low upfront cost.' }
        ]
      },
      { title: 'VIP Supply Chains', description: 'Luxury hotels need a discreet supplier for VIP guests. Premium clientele, premium prices.',
        outcomes: [
          { id: 'hotels', label: 'Establish hotel connections ($10K)', effects: { cash: -10000, streetCred: 3 }, result: 'Concierges at five luxury hotels now have your number. VIP delivery service activated.' },
          { id: 'party', label: 'Focus on parties and clubs', effects: { cash: -5000, streetCred: 2 }, result: 'Every Super Bowl party is yours. Club promoters push your product.' },
          { id: 'street', label: 'Street-level only', effects: { cash: -2000 }, result: 'You work the crowds. Volume over premium. Different strategy, still profitable.' }
        ]
      },
      { title: 'Game Day', description: 'The biggest sporting event in America. Miami is electric. Every street is a marketplace.',
        outcomes: [
          { id: 'all_out', label: 'Maximum operation', effects: { cash: 500000, heat: 25 }, result: 'Half a million dollars in one day. Your entire crew is deployed. Record-breaking revenue.' },
          { id: 'smart', label: 'Controlled but aggressive', effects: { cash: 300000, heat: 10 }, result: '$300K with managed risk. Your crew handles demand without overexposure.' },
          { id: 'conservative', label: 'Conservative approach', effects: { cash: 100000, heat: 5 }, result: '$100K safely. Below potential but zero arrests.' }
        ]
      },
      { title: 'Increased Police Presence', description: 'Federal agents flood Miami for the event. Every transaction is riskier.',
        outcomes: [
          { id: 'adapt', label: 'Adapt tactics (dead drops, codes)', effects: { heat: -10, streetCred: 3 }, result: 'New methods keep you invisible. Coded orders, timed dead drops. Professional.' },
          { id: 'bribe', label: 'Expand bribes ($20K)', effects: { cash: -20000, heat: -15 }, result: 'More cops on payroll during the event. Expensive insurance.' },
          { id: 'pause', label: 'Pause final day operations', effects: { cash: -50000, heat: -10 }, result: 'You shut down early. Lost revenue but you keep everything you made.' }
        ]
      },
      { title: 'The Window Closes', description: 'Super Bowl is over. The tourists leave. Time to count the money and plan next year.',
        outcomes: [
          { id: 'celebrate', label: 'Celebrate the haul', effects: { stress: -5, trust: 5, cash: -10000 }, result: 'Party for the crew. Bonuses all around. The greatest week in your criminal career.' },
          { id: 'reinvest', label: 'Reinvest immediately', effects: { cash: -100000, streetCred: 3 }, result: 'You pour profits into expansion. The Super Bowl funded your next phase of growth.' },
          { id: 'save', label: 'Save for a rainy day', effects: { stress: -3 }, result: 'You bank it all. Security for the future. Financial discipline in an undisciplined world.' }
        ]
      }
    ]
  },

  // === 21. THE SNITCH'S WIFE ===
  {
    id: 'snitchs_wife', name: 'The Snitch\'s Wife', emoji: '📼', category: 'intel',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Recordings', description: 'A dead informant\'s wife has his recorded conversations. Names of everyone he snitched on.',
        outcomes: [
          { id: 'buy', label: 'Buy the recordings ($20K)', effects: { cash: -20000, streetCred: 3 }, result: 'Hours of recordings. A goldmine. Moles in six different factions identified.' },
          { id: 'trade', label: 'Trade protection for info', effects: { trust: 3 }, result: 'You protect her and her kids. She gives you everything.' },
          { id: 'ignore', label: 'Dead men\'s secrets stay buried', effects: {}, result: 'You pass. Someone else will find her. Someone less careful.', endsChain: true }
        ]
      },
      { title: 'The Intel', description: 'The recordings expose moles in multiple factions. This information could reshape Miami\'s power structure.',
        outcomes: [
          { id: 'use', label: 'Use to purge moles from allies', effects: { trust: 8, streetCred: 5 }, result: 'You share intel with allies. Moles are purged. You\'re the hero who cleaned house.' },
          { id: 'sell', label: 'Sell to each faction ($10K each)', effects: { cash: 50000, trust: -2 }, result: 'Five factions pay $10K each for their own section. Mercenary but profitable.' },
          { id: 'leverage', label: 'Keep as personal leverage', effects: { fear: 5, streetCred: 3 }, result: 'You know who the rats are. That knowledge is worth more than any amount of cash.' }
        ]
      },
      { title: 'Consequences', description: 'People are dying because of the revealed information. The wife is getting nervous.',
        outcomes: [
          { id: 'protect_wife', label: 'Protect the wife and kids', effects: { cash: -5000, trust: 5, communityRep: 3 }, result: 'You relocate them. Safe and anonymous. Honor among thieves.' },
          { id: 'clean_house', label: 'Ensure no copies remain', effects: { fear: 3, heat: 5 }, result: 'You destroy all copies and silence anyone who heard them. Clean operation.' },
          { id: 'release_all', label: 'Release everything publicly', effects: { streetCred: 5, heat: 10, trust: -5 }, result: 'Nuclear option. Every mole exposed. Every faction in chaos. Maximum disruption.' }
        ]
      }
    ]
  },

  // === 22. THE PROFESSOR'S LAST LECTURE ===
  {
    id: 'professors_lecture', name: 'The Professor\'s Last Lecture', emoji: '👨‍🔬', category: 'production',
    condition: { minDay: 30 },
    chapters: [
      { title: 'The Diagnosis', description: 'A legendary chemistry professor who quietly supplied knowledge to dealers has terminal cancer. Six months.',
        outcomes: [
          { id: 'visit', label: 'Visit him', effects: { stress: 2 }, result: 'A frail man in a robe. "I always knew one of you would come. Let me teach you before I go."' },
          { id: 'send_gift', label: 'Send flowers and cash ($5K)', effects: { cash: -5000, trust: 2 }, result: 'He appreciates the gesture. Opens the door to future meetings.' },
          { id: 'pass', label: 'Respect his peace', effects: {}, result: 'You let a dying man die in peace.', endsChain: true }
        ]
      },
      { title: 'Advanced Techniques', description: 'The professor teaches his most advanced techniques. Synthesis no one else knows.',
        outcomes: [
          { id: 'learn_all', label: 'Learn everything ($0, 10 days)', effects: { stress: 5, streetCred: 5 }, result: 'Ten days of intensive study. Your chemistry knowledge is now world-class.' },
          { id: 'basics', label: 'Just the essentials (3 days)', effects: { streetCred: 2 }, result: 'A crash course in the most profitable techniques. Good enough for a significant upgrade.' },
          { id: 'record', label: 'Record everything', effects: { cash: -2000, streetCred: 3 }, result: 'Video recordings of every technique. A textbook you can reference forever.' }
        ]
      },
      { title: 'The Bucket List', description: 'The professor asks for help with his final wishes. Things he never got to do.',
        outcomes: [
          { id: 'help_all', label: 'Fulfill his bucket list ($15K)', effects: { cash: -15000, trust: 5, stress: -5 }, result: 'Deep sea fishing, a night in South Beach, a letter to his estranged daughter. He dies at peace.' },
          { id: 'some', label: 'Help with what you can', effects: { cash: -5000, trust: 3 }, result: 'You handle the easy ones. He\'s grateful for the effort.' },
          { id: 'decline', label: 'Business was the relationship', effects: { trust: -2 }, result: 'You keep it transactional. He understands. Disappointed but unsurprised.' }
        ]
      }
    ]
  },

  // === 23. EVERGLADES OPERATION ===
  {
    id: 'everglades_op', name: 'Everglades Operation', emoji: '🐊', category: 'infrastructure',
    condition: { minDay: 30, minCash: 30000, minAct: 2 },
    chapters: [
      { title: 'The Location', description: 'Deep in the Everglades, an abandoned hunting lodge sits on 50 acres. Total privacy. Total isolation.',
        outcomes: [
          { id: 'buy', label: 'Buy the property ($30K)', effects: { cash: -30000, streetCred: 2 }, result: 'The deed is yours under a shell company. An empire\'s hidden heart.' },
          { id: 'squat', label: 'Just set up operations', effects: { cash: -5000, heat: 3 }, result: 'No paperwork means no trail. But also no legal protection if discovered.' },
          { id: 'pass', label: 'The Everglades are dangerous', effects: {}, result: 'Gators, mosquitoes, and swamp gas. You\'re a city person.', endsChain: true }
        ]
      },
      { title: 'Infrastructure', description: 'The location is raw. You need to build: airstrip, lab, grow operation, or all three.',
        outcomes: [
          { id: 'airstrip', label: 'Build airstrip ($50K)', effects: { cash: -50000, streetCred: 5 }, result: 'Private runway for smuggling flights. International product arrives here now.' },
          { id: 'lab', label: 'Build hidden lab ($30K)', effects: { cash: -30000, streetCred: 3 }, result: 'No neighbors means no noise complaints. Production at full capacity.' },
          { id: 'grow', label: 'Grow operation ($20K)', effects: { cash: -20000, streetCred: 2 }, result: '50 acres of growing space. Self-sufficient supply chain.' }
        ]
      },
      { title: 'Staffing', description: 'Who runs the Everglades operation? It\'s remote and dangerous.',
        outcomes: [
          { id: 'loyal', label: 'Send your most loyal crew', effects: { trust: 3 }, result: 'They live on-site. Isolated but compensated. Total operational security.' },
          { id: 'hire', label: 'Hire specialists ($10K/month)', effects: { cash: -10000 }, result: 'Professionals who know the swamp. Efficient but expensive.' },
          { id: 'rotate', label: 'Rotating shifts from Miami', effects: { cash: -5000 }, result: 'Different crew each week. Nobody knows the full operation.' }
        ]
      },
      { title: 'The Everglades Empire', description: 'Your Everglades operation is producing. The remoteness is both asset and liability.',
        outcomes: [
          { id: 'expand', label: 'Full compound ($100K total)', effects: { cash: -100000, streetCred: 8 }, result: 'Airstrip, lab, living quarters, armory. A self-contained criminal compound. Untouchable.' },
          { id: 'maintain', label: 'Keep it simple', effects: { cash: 10000 }, result: 'Steady production, steady income. $10K/month from the swamp. Boring but reliable.' },
          { id: 'bunker', label: 'Add a doomsday bunker ($50K)', effects: { cash: -50000, streetCred: 5, stress: -5 }, result: 'If everything goes wrong, you disappear into the Everglades. Ultimate insurance.' }
        ]
      }
    ]
  },

  // === 24. SPRING BREAK ===
  {
    id: 'spring_break', name: 'Spring Break', emoji: '🌴', category: 'event',
    condition: { minDay: 20, minCrew: 2 },
    chapters: [
      { title: 'The Surge', description: 'Spring breakers flood South Beach. Party drug demand surges 40%. Two weeks of chaos and opportunity.',
        outcomes: [
          { id: 'stock_up', label: 'Stock party drugs ($10K)', effects: { cash: -10000 }, result: 'MDMA, cocaine, weed — you\'re ready for the party. Two weeks of peak demand.' },
          { id: 'premium', label: 'Go premium only ($5K)', effects: { cash: -5000 }, result: 'High-quality product at premium prices. Less volume, more margin.' },
          { id: 'sit_out', label: 'Too much heat', effects: {}, result: 'Extra police, extra cameras. You let spring break pass.', endsChain: true }
        ]
      },
      { title: 'Beach Distribution', description: 'Setting up distribution at beaches and hotels. The demand is overwhelming.',
        outcomes: [
          { id: 'full_deploy', label: 'Deploy entire crew', effects: { cash: 30000, heat: 10 }, result: '$30K in three days. Your crew works every beach and bar. Unprecedented volume.' },
          { id: 'selective', label: 'Hotels and VIP only', effects: { cash: 15000, heat: 3 }, result: '$15K from premium clients. Low exposure, high margin.' },
          { id: 'middlemen', label: 'Use college kid middlemen', effects: { cash: 20000, heat: 5 }, result: 'You recruit spring breakers as temporary dealers. $20K with plausible deniability.' }
        ]
      },
      { title: 'The Inevitable OD', description: 'Someone overdoses at a pool party. Your product is involved. Media swarms.',
        outcomes: [
          { id: 'help', label: 'Anonymously call 911', effects: { heat: 5, communityRep: 2 }, result: 'They survive. The investigation hits dead ends. You did the right thing — sort of.' },
          { id: 'distance', label: 'Distance immediately', effects: { heat: -3, trust: -1 }, result: 'You shut operations for 48 hours. When they resume, the OD is old news.' },
          { id: 'control', label: 'Control the narrative', effects: { cash: -5000, publicImage: 1 }, result: 'Your media contact spins it as "college drinking culture." The product angle fades.' }
        ]
      }
    ]
  },

  // === 25. THE CHESS MASTER ===
  {
    id: 'chess_master', name: 'The Chess Master', emoji: '♟️', category: 'training',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Con Man', description: 'An old con man wants to teach you the art of the long game. "Chess, not checkers," he says.',
        outcomes: [
          { id: 'learn', label: 'Begin lessons', effects: { cash: -2000, stress: -2 }, result: 'His apartment is filled with chess boards and crime memorabilia. Class is in session.' },
          { id: 'skeptical', label: 'What can an old man teach me?', effects: {}, result: '"More than you know, kid." He walks away. Your loss.', endsChain: true }
        ]
      },
      { title: 'Lesson 1: Persuasion', description: 'The old man sends you on a real con — convince a mark to invest in a fake business. Pure persuasion.',
        outcomes: [
          { id: 'succeed', label: 'Run the con perfectly', effects: { cash: 10000, streetCred: 2 }, result: '$10K from a mark who still thinks he\'s getting rich. Persuasion mastered.' },
          { id: 'fail', label: 'Fumble the con', effects: { cash: -1000, stress: 2 }, result: 'The mark sees through you. A lesson in what NOT to do. Still valuable.' },
          { id: 'modify', label: 'Improve the con', effects: { cash: 15000, streetCred: 3 }, result: 'Your modification doubles the take. The old man grins. "Now you\'re thinking."' }
        ]
      },
      { title: 'Lesson 2: Strategy', description: 'A real operation disguised as a lesson. You must outmaneuver a rival\'s supply chain.',
        outcomes: [
          { id: 'outplay', label: 'Execute the strategy', effects: { cash: 20000, streetCred: 3 }, result: 'The rival\'s supply is diverted to you. $20K in product acquired through pure strategy.' },
          { id: 'direct', label: 'Do it your way (brute force)', effects: { cash: 10000, heat: 10 }, result: 'You skip the subtlety. It works but leaves traces. "Sloppy," the old man says.' },
          { id: 'decline', label: 'Too complex', effects: { stress: 2 }, result: 'You pass on the operation. The lesson goes unlearned.' }
        ]
      },
      { title: 'Lesson 3: Patience', description: 'The final test: a long con that takes 14 days to unfold. Can you resist acting early?',
        daysLimit: 14,
        outcomes: [
          { id: 'patience', label: 'Wait the full 14 days', effects: { cash: 50000, streetCred: 5 }, result: 'The con pays off spectacularly. $50K. The old man nods. "You\'ve graduated."' },
          { id: 'rush', label: 'Act on day 7 (half the reward)', effects: { cash: 25000, streetCred: 2 }, result: '$25K. Half of what you could have made. "Impatience costs," the old man says.' },
          { id: 'abort', label: 'Get nervous and abort', effects: { stress: 3 }, result: 'Cold feet. No payout. The old man is disappointed. "Chess requires nerve."' }
        ]
      },
      { title: 'Graduation', description: 'The old man has one final gift: his contact book. Decades of connections.',
        outcomes: [
          { id: 'accept', label: 'Accept the contact book', effects: { trust: 5, streetCred: 5, stress: -5 }, result: 'Names, numbers, secrets. A lifetime of connections now at your fingertips.' },
          { id: 'partnership', label: 'Offer him a consulting role', effects: { cash: -3000, streetCred: 3, trust: 3 }, result: 'The old man joins your advisory team. Wisdom on retainer.' },
          { id: 'honor', label: 'Pay tribute ($10K)', effects: { cash: -10000, trust: 8 }, result: 'You fund his retirement. He cries. "Nobody ever thanked me before." A true mentor honored.' }
        ]
      }
    ]
  },

  // === 26. FINAL STASH ===
  {
    id: 'final_stash', name: 'Final Stash', emoji: '💰', category: 'treasure',
    condition: { minDay: 35, minAct: 2, minCrew: 2 },
    chapters: [
      { title: 'The Dying Words', description: 'A dying Cartel Remnant member reveals a massive 1980s stash in a condemned building. Rival territory.',
        outcomes: [
          { id: 'act', label: 'Move immediately', effects: { stress: 3 }, result: 'Time is of the essence. Others may know. You assemble a crew and head out.' },
          { id: 'plan', label: 'Plan carefully (3 days)', effects: { cash: -2000 }, result: 'You scout the building, map the defenses, identify traps. Careful approach.' },
          { id: 'sell_info', label: 'Sell the info ($10K)', effects: { cash: 10000 }, result: 'Quick flip. Let someone else risk their neck.', endsChain: true }
        ]
      },
      { title: 'The Extraction', description: 'The condemned building is in rival territory and booby-trapped from the 80s. Three floors of danger.',
        outcomes: [
          { id: 'force', label: 'Full crew assault', effects: { heat: 15, cash: 500000, health: -15, streetCred: 5 }, result: '$500K in product + $200K cash + vintage weapons. Booby traps injure two crew. Worth it.' },
          { id: 'stealth', label: 'Night stealth operation', effects: { heat: 5, cash: 400000, streetCred: 3 }, result: 'You slip in at 3 AM. Disarm traps carefully. $400K haul. No one knows you were there.' },
          { id: 'partial', label: 'Grab and go (first floor only)', effects: { cash: 150000, heat: 3 }, result: 'You take what\'s accessible. $150K. The rest stays for whoever\'s brave enough.' }
        ]
      },
      { title: 'The Legacy', description: 'You hold a fortune from a dead era. The Cartel Remnants claim it\'s rightfully theirs.',
        outcomes: [
          { id: 'keep_all', label: 'It\'s mine. I found it.', effects: { fear: 5, trust: -3, streetCred: 3 }, result: 'Finders keepers. The Remnants are furious but you have the firepower to back it up.' },
          { id: 'split', label: 'Split with Remnants (goodwill)', effects: { cash: -100000, trust: 8 }, result: 'You give them their historical share. Alliance cemented forever.' },
          { id: 'auction', label: 'Auction the vintage items', effects: { cash: 200000, streetCred: 5 }, result: 'The weapons and vintage product sell to collectors. $200K in premium auction revenue.' }
        ]
      }
    ]
  },

  // === 27. THE FERRY CAPTAIN ===
  {
    id: 'ferry_captain', name: 'The Ferry Captain', emoji: '⛴️', category: 'logistics',
    condition: { minDay: 20, minCash: 10000 },
    chapters: [
      { title: 'The Route', description: 'A Bahamas ferry captain offers weekly smuggling runs. Hidden compartments already built into the vessel.',
        outcomes: [
          { id: 'test', label: 'Test run ($5K)', effects: { cash: -5000 }, result: 'A small shipment makes it through. Customs doesn\'t look twice at a tourist ferry.' },
          { id: 'full', label: 'Full run ($10K)', effects: { cash: -10000, streetCred: 2 }, result: 'Maximum capacity. Everything arrives clean. A reliable pipeline established.' },
          { id: 'decline', label: 'Water routes are risky', effects: {}, result: 'Coast Guard is unpredictable. You stick to land.', endsChain: true }
        ]
      },
      { title: 'Scaling Up', description: 'The route works. Time to increase volume and frequency.',
        outcomes: [
          { id: 'weekly', label: 'Weekly shipments ($20K/month)', effects: { cash: -20000, streetCred: 3 }, result: 'Reliable weekly supply. $50K+ in product arrives like clockwork.' },
          { id: 'biweekly', label: 'Twice a week ($40K/month)', effects: { cash: -40000, heat: 5, streetCred: 4 }, result: 'Double the frequency, double the risk. But the revenue justifies everything.' },
          { id: 'occasional', label: 'Keep it occasional', effects: { cash: -10000 }, result: 'Sporadic use avoids pattern detection. Smart tradecraft.' }
        ]
      },
      { title: 'Coast Guard Inspection', description: 'Random Coast Guard inspection during a loaded run. The captain radios you in a panic.',
        outcomes: [
          { id: 'bluff', label: 'Trust the hidden compartments', effects: { stress: 5, streetCred: 3 }, result: 'The compartments hold. Inspectors find nothing. Heart rate returns to normal.' },
          { id: 'dump', label: 'Order product dumped overboard', effects: { cash: -30000, heat: -5 }, result: 'Product goes into the ocean. $30K loss. But no arrests and no evidence.' },
          { id: 'bribe', label: 'Bribe the Coast Guard ($10K)', effects: { cash: -10000, heat: -3 }, result: 'The captain hands over an envelope. The "inspection" finds nothing. Routine corruption.' }
        ]
      }
    ]
  },

  // === 28. MUSIC VIDEO ===
  {
    id: 'music_video', name: 'Music Video', emoji: '🎬', category: 'culture',
    condition: { minDay: 15 },
    chapters: [
      { title: 'Lights, Camera, Action', description: 'A rising rapper wants to film their music video in your territory. They want "authenticity."',
        outcomes: [
          { id: 'allow', label: 'Allow filming (negotiate terms)', effects: { cash: 5000, publicImage: 3 }, result: '$5K location fee. Your territory on millions of screens. Demand spike incoming.' },
          { id: 'star', label: 'Appear in the video yourself', effects: { publicImage: 5, heat: 5, streetCred: 3 }, result: 'You cameo as yourself. The streets love it. The police take notes.' },
          { id: 'refuse', label: 'No cameras', effects: { fear: 1 }, result: 'You don\'t need the exposure. They film elsewhere.' , endsChain: true }
        ]
      },
      { title: 'Going Viral', description: 'The video drops. 10 million views in a week. Your territory is famous.',
        outcomes: [
          { id: 'capitalize', label: 'Capitalize on the fame', effects: { cash: 20000, streetCred: 5 }, result: 'Demand surges 30% for a month. $20K in additional revenue. Cultural relevance pays.' },
          { id: 'merch', label: 'Launch territory merch ($5K)', effects: { cash: -5000, publicImage: 5 }, result: 'T-shirts, hats, stickers. Your block has a brand now. Tourists buy it all.' },
          { id: 'distance', label: 'Distance from the video', effects: { heat: -3 }, result: 'You deny any connection. The video\'s fame doesn\'t touch your operation.' }
        ]
      },
      { title: 'The Aftermath', description: 'Police increase patrols. Tourists flood in. Your quiet corner is now a landmark.',
        outcomes: [
          { id: 'adapt', label: 'Adapt operations to tourism', effects: { cash: 10000, streetCred: 2 }, result: 'Tourist-friendly dealing. Premium prices for novelty seekers. $10K/month bonus.' },
          { id: 'relocate', label: 'Move sensitive ops elsewhere', effects: { cash: -3000, heat: -10 }, result: 'Your stash and production move. The public-facing territory stays clean.' },
          { id: 'embrace', label: 'Become a local celebrity', effects: { publicImage: 8, heat: 10, streetCred: 5 }, result: 'You lean into fame. Interviews, appearances, brand deals. The line between criminal and celebrity blurs.' }
        ]
      }
    ]
  },

  // === 29. THE LANDLORD ===
  {
    id: 'the_landlord', name: 'The Landlord', emoji: '🔑', category: 'problem',
    condition: { minDay: 20 },
    chapters: [
      { title: 'Discovery', description: 'Your landlord discovered your operation during an unannounced inspection. They saw everything.',
        outcomes: [
          { id: 'bribe', label: 'Bribe them ($10K)', effects: { cash: -10000, heat: -3 }, result: 'Money changes hands. They suddenly develop poor eyesight. Problem solved temporarily.' },
          { id: 'intimidate', label: 'Intimidate them', effects: { fear: 5, heat: 3 }, result: 'A quiet conversation about what happens to people who talk. They get the message.' },
          { id: 'move', label: 'Move operations immediately', effects: { cash: -5000, stress: 3 }, result: 'You relocate overnight. New spot, new lease, new start. Expensive but clean.' }
        ]
      },
      { title: 'Resolution', description: 'The landlord situation needs a permanent solution.',
        outcomes: [
          { id: 'buy_building', label: 'Buy the building ($50K)', effects: { cash: -50000, streetCred: 2 }, result: 'You become your own landlord. No more inspections. The property is an asset.' },
          { id: 'monthly', label: 'Monthly payment ($2K/month)', effects: { cash: -2000, trust: -1 }, result: 'Ongoing cost but the operation continues. They stay quiet for $2K a month.' },
          { id: 'partner', label: 'Make them a partner', effects: { trust: 3, cash: -1000 }, result: 'They get 10% of revenue. Aligned interests. They\'ll protect the operation now.' }
        ]
      },
      { title: 'Long-term', description: 'The property situation stabilizes. Time to think about the future.',
        outcomes: [
          { id: 'expand_property', label: 'Buy additional properties ($30K)', effects: { cash: -30000, streetCred: 3 }, result: 'A property portfolio. Multiple safe locations. Real estate empire growing.' },
          { id: 'fortify', label: 'Fortify current location ($10K)', effects: { cash: -10000, streetCred: 2 }, result: 'Hidden rooms, reinforced doors, CCTV. Your base is now a fortress.' },
          { id: 'diversify', label: 'Different location per operation', effects: { cash: -15000, heat: -5 }, result: 'Each operation in a different building. If one falls, the others survive.' }
        ]
      }
    ]
  },

  // === 30. BODY FARM ===
  {
    id: 'body_farm', name: 'The Body Farm', emoji: '🐷', category: 'infrastructure',
    condition: { minDay: 30, minAct: 2 },
    chapters: [
      { title: 'The Farmer', description: 'A pig farmer outside Miami can handle... disposal. Industrial scale. No questions, no evidence.',
        outcomes: [
          { id: 'visit', label: 'Visit the farm', effects: { stress: 3 }, result: 'Remote property. Hundreds of pigs. The farmer is matter-of-fact. "Nature handles everything."' },
          { id: 'deal', label: 'Establish arrangement ($5K retainer)', effects: { cash: -5000, fear: 3 }, result: '$2K per service, $5K monthly retainer. Unlimited capacity. The ultimate cleanup crew.' },
          { id: 'decline', label: 'This is a line you won\'t cross', effects: {}, result: 'Some things are too dark. You walk away.', endsChain: true }
        ]
      },
      { title: 'First Test', description: 'A situation arises that requires the farm\'s services. A rival who can\'t be found by anyone. Ever.',
        outcomes: [
          { id: 'use', label: 'Use the service', effects: { fear: 8, heat: -10, cash: -2000 }, result: 'Clean. Complete. Final. The person ceases to exist in every sense.' },
          { id: 'alternative', label: 'Find another solution', effects: { cash: -5000 }, result: 'You pay for the rival to disappear via relocation instead. More expensive, less permanent.' },
          { id: 'rethink', label: 'Cancel the arrangement', effects: { cash: -5000, stress: 3 }, result: 'You terminate the contract. The farmer shrugs. "Your loss."' }
        ]
      },
      { title: 'Insurance', description: 'The farm becomes your insurance policy. Problems have permanent solutions.',
        outcomes: [
          { id: 'reputation', label: 'Let word spread', effects: { fear: 10, trust: -3 }, result: 'Rumors of people disappearing near your operation. Nobody can prove it. Terror reigns.' },
          { id: 'secret', label: 'Keep it absolutely secret', effects: { fear: 3, streetCred: 2 }, result: 'Only you and the farmer know. The ultimate ace up your sleeve.' },
          { id: 'sell_access', label: 'Sell access to allies ($5K/use)', effects: { cash: 20000, fear: 5, trust: -1 }, result: 'You broker the service to allied factions. $5K per use. Profitable and terrifying.' }
        ]
      }
    ]
  },

  // === 31. THE DOCUMENTARY ===
  {
    id: 'documentary', name: 'The Documentary', emoji: '🎥', category: 'media',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Pitch', description: 'A streaming service wants to make a documentary about Miami\'s drug scene. They\'re looking for "authentic voices."',
        outcomes: [
          { id: 'anonymous', label: 'Participate anonymously', effects: { cash: 5000, streetCred: 2 }, result: 'Voice distorted, face hidden. You tell your story. $5K consulting fee.' },
          { id: 'control', label: 'Offer to be a producer ($20K)', effects: { cash: -20000, streetCred: 3 }, result: 'You fund the production and control the narrative. Your story, your edit.' },
          { id: 'sabotage', label: 'Sabotage the production', effects: { fear: 3 }, result: 'Cameras break, crew gets threats. The documentary dies in development.' , endsChain: true }
        ]
      },
      { title: 'Managing the Crew', description: 'Film crew is in your territory. They\'re seeing things. Some things they shouldn\'t.',
        outcomes: [
          { id: 'curate', label: 'Show them what you want', effects: { publicImage: 5 }, result: 'A guided tour of community investment, youth programs, and honest workers. Robin Hood narrative.' },
          { id: 'raw', label: 'Let them film everything', effects: { heat: 10, streetCred: 5 }, result: 'Raw footage. The real life. Brutally honest. It will be either your legacy or your downfall.' },
          { id: 'limit', label: 'Strict boundaries', effects: { publicImage: 2 }, result: 'Certain areas are off-limits. They get a curated but somewhat honest documentary.' }
        ]
      },
      { title: 'The Final Cut', description: 'The documentary is done. They want your approval before release. You have one chance to influence it.',
        outcomes: [
          { id: 'approve', label: 'Approve the cut', effects: { publicImage: 8, streetCred: 5, heat: 5 }, result: 'It airs to 20 million viewers. You\'re a folk hero. Police are embarrassed. Cultural impact.' },
          { id: 'edit', label: 'Demand changes ($10K)', effects: { cash: -10000, publicImage: 5 }, result: 'Key scenes removed. The documentary is positive but incomplete. Safer.' },
          { id: 'kill', label: 'Kill the documentary ($50K)', effects: { cash: -50000, fear: 2 }, result: 'You buy the rights and shelve it. $50K to make it disappear. No one sees it.' }
        ]
      }
    ]
  },

  // === 32. UNDERGROUND RAILROAD ===
  {
    id: 'underground_railroad', name: 'Underground Railroad', emoji: '🛤️', category: 'community',
    condition: { minDay: 20 },
    chapters: [
      { title: 'Discovery', description: 'You discover a network helping domestic violence victims and trafficking survivors escape. They use your territory.',
        outcomes: [
          { id: 'help', label: 'Offer to help', effects: { communityRep: 8, publicImage: 3 }, result: 'They\'re suspicious but grateful. Your resources could save lives.' },
          { id: 'tax', label: 'Demand a cut', effects: { cash: 2000, communityRep: -5 }, result: 'They pay protection money. Your reputation suffers. But money is money.' },
          { id: 'ignore', label: 'Leave them alone', effects: { communityRep: 2 }, result: 'You pretend you never saw it. Passive support.' , endsChain: true }
        ]
      },
      { title: 'Protection', description: 'A trafficker is hunting one of the people the network is hiding. They need muscle.',
        outcomes: [
          { id: 'protect', label: 'Full crew protection', effects: { communityRep: 10, trust: 5, health: -10 }, result: 'Your crew faces down the trafficker. They back off. A life saved. Your crew is proud.' },
          { id: 'negotiate', label: 'Negotiate the trafficker away', effects: { cash: -5000, communityRep: 5 }, result: 'You pay them $5K to forget the person exists. Cheaper than war.' },
          { id: 'permanent', label: 'Make the problem disappear', effects: { fear: 5, heat: 5, communityRep: 8 }, result: 'The trafficker is never seen again. The network is safe. Permanently.' }
        ]
      },
      { title: 'Integration', description: 'The network could become part of your operation — safe houses, contacts, community goodwill.',
        outcomes: [
          { id: 'safehouse', label: 'Share safe house network', effects: { communityRep: 5, streetCred: 3 }, result: 'Your safe houses protect your crew AND vulnerable people. Dual-purpose infrastructure.' },
          { id: 'intel', label: 'Use as intelligence network', effects: { streetCred: 3 }, result: 'The network sees everything in the community. Willing intel sources everywhere.' },
          { id: 'separate', label: 'Keep operations separate', effects: { communityRep: 3, trust: 2 }, result: 'Clean separation. They do their work, you do yours. Mutual respect.' }
        ]
      },
      { title: 'Recognition', description: 'The community knows what you did. Your reputation as a protector grows.',
        outcomes: [
          { id: 'humble', label: 'Stay humble about it', effects: { communityRep: 10, trust: 5 }, result: 'You never mention it. But the community knows. Loyalty you can\'t buy.' },
          { id: 'publicize', label: 'Let the story spread', effects: { publicImage: 10, communityRep: 5 }, result: 'The neighborhood Robin Hood. Media picks it up. Politicians take notice.' },
          { id: 'fund', label: 'Fund the network permanently ($20K)', effects: { cash: -20000, communityRep: 15, publicImage: 5 }, result: 'You establish a legitimate nonprofit. Tax deduction AND street cred. Legacy building.' }
        ]
      }
    ]
  },

  // === 33. THE REPO MAN ===
  {
    id: 'repo_man', name: 'The Repo Man', emoji: '🔧', category: 'side_hustle',
    condition: { minDay: 15 },
    chapters: [
      { title: 'The Gig', description: 'A repo company offers you side work repossessing vehicles. Legal-ish income plus intel on people in debt.',
        outcomes: [
          { id: 'accept', label: 'Take the job', effects: { cash: 1000, streetCred: 1 }, result: 'First repo: a Toyota from a deadbeat. Easy $1K. You learn the mechanics.' },
          { id: 'negotiate', label: 'Demand better cut', effects: { cash: 1500, streetCred: 1 }, result: '$1500 per repo. They agree. Your reputation precedes you.' },
          { id: 'pass', label: 'Below your pay grade', effects: {}, result: 'Repo work is for beginners. You have bigger fish.', endsChain: true }
        ]
      },
      { title: 'High-Value Repo', description: 'A luxury car needs repossessing from a dangerous owner. $5K bonus. Armed guards.',
        outcomes: [
          { id: 'force', label: 'Take it by force', effects: { cash: 5000, heat: 5, fear: 2 }, result: 'Your crew shows up heavy. The car is yours in 60 seconds. $5K bonus earned.' },
          { id: 'stealth', label: 'Steal it at night', effects: { cash: 5000, streetCred: 2 }, result: 'Hot-wired at 4 AM. They wake up to an empty driveway. Professional.' },
          { id: 'deal', label: 'Cut a deal with the owner', effects: { cash: 3000, trust: 2 }, result: 'You warn them. They pay you $3K to "fail" the repo. Everyone wins.' }
        ]
      },
      { title: 'The Business', description: 'Repo work reveals who\'s broke, who\'s desperate, and who owes money. Valuable intelligence.',
        outcomes: [
          { id: 'buy_company', label: 'Buy the repo company ($15K)', effects: { cash: -15000, streetCred: 3 }, result: 'You own the company. Legitimate income, vehicle access, and a database of desperate people.' },
          { id: 'intel_only', label: 'Keep it as an intel source', effects: { streetCred: 2 }, result: 'The job continues. You know who\'s in debt across Miami. Recruitment goldmine.' },
          { id: 'quit', label: 'Cash out', effects: { cash: 5000 }, result: 'You pocket your earnings and move on. Good side hustle while it lasted.' }
        ]
      }
    ]
  },

  // === 34. MIAMI VICE CALLBACK ===
  {
    id: 'miami_vice', name: 'Miami Vice Callback', emoji: '🕶️', category: 'nostalgia',
    condition: { minDay: 25 },
    chapters: [
      { title: 'The Retired Detective', description: 'A retired 1980s narcotics detective is writing a memoir. He wants to "consult" with someone active.',
        outcomes: [
          { id: 'meet', label: 'Meet him cautiously', effects: { stress: 2 }, result: 'An old man with wild stories. "I chased guys like you for thirty years. Now I just want to write."' },
          { id: 'trade', label: 'Trade: info for info', effects: { streetCred: 2 }, result: 'You share modern tactics, he shares 80s stash locations. Fair exchange.' },
          { id: 'avoid', label: 'Never trust a cop, even retired', effects: {}, result: 'Smart? Paranoid? Both? You\'ll never know what he had to offer.', endsChain: true }
        ]
      },
      { title: 'Old Stash Locations', description: 'His notes mention hidden Cartel Remnant stashes from the 1980s. Three locations, all unexplored.',
        outcomes: [
          { id: 'explore_all', label: 'Explore all three ($5K each)', effects: { cash: -15000 }, result: 'Two are empty. One contains $40K in vintage product and a weapons cache. Net positive.' },
          { id: 'one', label: 'Try the most promising one', effects: { cash: -5000, streetCred: 2 }, result: '$40K haul from a single location. The other two remain mysteries.' },
          { id: 'sell_maps', label: 'Sell the locations ($10K each)', effects: { cash: 30000 }, result: '$30K for three maps. Let others do the digging.' }
        ]
      },
      { title: 'The Manuscript', description: 'The detective finishes his book. Your section could expose cold cases or become intelligence.',
        outcomes: [
          { id: 'buy_manuscript', label: 'Buy the manuscript ($20K)', effects: { cash: -20000, streetCred: 5 }, result: 'An intelligence goldmine. Names, routes, methods from three decades. Historical playbook.' },
          { id: 'edit', label: 'Help edit (remove sensitive parts)', effects: { cash: -5000, trust: 3 }, result: 'You remove anything dangerous and help him publish. A watered-down bestseller.' },
          { id: 'let_publish', label: 'Let him publish everything', effects: { heat: 5, streetCred: 3 }, result: 'The book exposes cold cases. Police scramble. Chaos benefits you.' }
        ]
      }
    ]
  },

  // === 35. THE REVEREND ===
  {
    id: 'the_reverend', name: 'The Reverend', emoji: '⛪', category: 'politics',
    condition: { minDay: 20 },
    chapters: [
      { title: 'The Megachurch', description: 'A megachurch pastor wants to partner on "community development." His church launders more than you do.',
        outcomes: [
          { id: 'partner', label: 'Explore partnership', effects: { trust: 2, publicImage: 2 }, result: 'The reverend is smooth. His church moves $500K/month in "donations." Impressive operation.' },
          { id: 'expose', label: 'Use as leverage', effects: { fear: 3 }, result: 'You document his operation. Now he works for you or you expose him.' },
          { id: 'decline', label: 'Church and crime don\'t mix', effects: {}, result: 'You keep your distance from the holy hustle.', endsChain: true }
        ]
      },
      { title: 'Community Project', description: 'A joint community center project. His congregation provides cover, your money provides funding.',
        outcomes: [
          { id: 'fund', label: 'Fund the center ($25K)', effects: { cash: -25000, communityRep: 10, publicImage: 8 }, result: 'The community center opens. Your name is on the building. Saintly public image.' },
          { id: 'partial', label: 'Partial funding ($10K)', effects: { cash: -10000, communityRep: 5 }, result: 'You contribute. The reverend matches. A partnership visible to the whole community.' },
          { id: 'front', label: 'Use it as a front', effects: { cash: -15000, streetCred: 3 }, result: 'The "community center" has a very active back room. Laundering through youth programs.' }
        ]
      },
      { title: 'The Church Empire', description: 'The reverend\'s church becomes a key part of your operation. Spiritual cover for criminal enterprise.',
        outcomes: [
          { id: 'full_alliance', label: 'Full partnership', effects: { cash: 20000, publicImage: 5, communityRep: 5 }, result: 'Church + crime = untouchable. $20K/month laundered through "faith-based initiatives."' },
          { id: 'distance', label: 'Maintain arm\'s length', effects: { publicImage: 3 }, result: 'Loose association. You donate, they don\'t ask questions. Clean enough.' },
          { id: 'takeover', label: 'Take control of the church', effects: { cash: 30000, fear: 5, communityRep: -5 }, result: 'You install your people on the board. The church is yours. $30K/month. God works in mysterious ways.' }
        ]
      }
    ]
  },

  // === 36. THE CROOKED COP'S PARTNER ===
  {
    id: 'crooked_cops_partner', name: 'The Partner', emoji: '👮', category: 'law',
    condition: { minDay: 25 },
    chapters: [
      { title: 'Suspicious Partner', description: 'Your corrupt cop\'s partner is asking questions. "Where does he go on Tuesday nights?"',
        outcomes: [
          { id: 'investigate', label: 'Investigate the partner', effects: { cash: -2000 }, result: 'Background check: clean record, ambitious, considering a transfer to internal affairs.' },
          { id: 'corrupt', label: 'Try to corrupt them too', effects: { cash: -10000, heat: -5 }, result: 'Everyone has a price. $10K and now you have TWO cops on the payroll.' },
          { id: 'warn_cop', label: 'Warn your cop', effects: { trust: 2 }, result: 'Your cop handles their partner internally. The questions stop.' }
        ]
      },
      { title: 'Escalation', description: 'The partner found something. They\'re building a case — against your cop AND you.',
        outcomes: [
          { id: 'neutralize', label: 'Discredit the partner', effects: { cash: -5000, streetCred: 2 }, result: 'Planted evidence of misconduct. The partner is investigated instead. Tables turned.' },
          { id: 'transfer', label: 'Arrange a transfer', effects: { cash: -15000 }, result: 'A call to the right people. The partner gets "promoted" to a desk in Tallahassee.' },
          { id: 'bring_in', label: 'Bring them into the fold', effects: { cash: -20000, heat: -10 }, result: 'Two corrupt cops are better than one. Your law enforcement network doubles.' }
        ]
      },
      { title: 'Resolution', description: 'The partner situation is resolved. Your police relationships need reinforcement.',
        outcomes: [
          { id: 'network', label: 'Build a police network', effects: { cash: -10000, heat: -15, streetCred: 3 }, result: 'Multiple cops across precincts. A law enforcement intelligence network working for you.' },
          { id: 'consolidate', label: 'Strengthen existing contacts', effects: { cash: -5000, trust: 3 }, result: 'Better pay, better protection for your cops. Loyalty through generosity.' },
          { id: 'reduce', label: 'Reduce dependence on cops', effects: { streetCred: 2 }, result: 'You diversify your protection. Less reliance on any single corrupt official.' }
        ]
      }
    ]
  },

  // === 37. CARNIVAL CHAOS ===
  {
    id: 'carnival_chaos', name: 'Carnival Chaos', emoji: '🎭', category: 'event',
    condition: { minDay: 20, minCrew: 2 },
    chapters: [
      { title: 'The Setup', description: 'Miami Carnival is coming. Massive crowds, massive demand, massive opportunity.',
        outcomes: [
          { id: 'prepare', label: 'Full preparation ($10K)', effects: { cash: -10000, streetCred: 2 }, result: 'Product stocked, crew positioned, exit routes planned. Ready for the biggest party in Miami.' },
          { id: 'wing_it', label: 'Improvise', effects: { stress: 3 }, result: 'No plan, just hustle. The Miami way.' },
          { id: 'skip', label: 'Too chaotic', effects: {}, result: 'You sit this one out.', endsChain: true }
        ]
      },
      { title: 'The Deal Goes Wrong', description: 'Mid-carnival, a major deal goes sideways. Product stolen in the crowd. Crew member missing.',
        outcomes: [
          { id: 'rescue', label: 'Rescue crew member first', effects: { trust: 5, health: -10 }, result: 'You find them in an alley. Beat up but alive. The product can be replaced. People can\'t.' },
          { id: 'product', label: 'Recover the product first', effects: { cash: 10000, trust: -3 }, result: 'You chase down the thieves. Product recovered. Your crew member fends for themselves.' },
          { id: 'both', label: 'Split crew to handle both', effects: { cash: 5000, trust: 2, health: -5 }, result: 'Half and half. Crew member rescued, most product recovered. Compromise works.' }
        ]
      },
      { title: 'Identify the Setup', description: 'This wasn\'t random. Someone knew about the deal. Someone set you up.',
        outcomes: [
          { id: 'investigate', label: 'Full investigation', effects: { cash: -3000, streetCred: 3 }, result: 'Trail leads to a rival using carnival as cover for a coordinated hit on multiple dealers.' },
          { id: 'retaliate', label: 'Immediate retaliation', effects: { fear: 5, heat: 10, streetCred: 2 }, result: 'You hit back during the carnival. The chaos covers everything. Message delivered in blood.' },
          { id: 'absorb', label: 'Accept the loss, move on', effects: { stress: 3 }, result: 'Some battles aren\'t worth fighting during a festival. You note the debt for later.' }
        ]
      }
    ]
  },

  // === 38. THE ARMS SHOW ===
  {
    id: 'arms_show', name: 'The Arms Show', emoji: '💣', category: 'military',
    condition: { minDay: 30, minAct: 2, minCash: 20000 },
    chapters: [
      { title: 'The Invitation', description: 'An invitation to an underground arms expo in the Everglades. International dealers, military hardware.',
        outcomes: [
          { id: 'attend', label: 'Attend ($20K entry)', effects: { cash: -20000, streetCred: 3 }, result: 'A warehouse in the swamp. Tables of weapons. Dealers from six continents. This is the big leagues.' },
          { id: 'send_rep', label: 'Send a representative', effects: { cash: -10000, streetCred: 1 }, result: 'Your lieutenant attends. They bring back a catalog and three business cards.' },
          { id: 'pass', label: 'Weapons aren\'t your business', effects: {}, result: 'You stick to drugs. The arms trade has its own dangers.', endsChain: true }
        ]
      },
      { title: 'Shopping', description: 'Military-grade hardware on display. Exotic weapons, armor, even vehicles. Everything has a price.',
        outcomes: [
          { id: 'big_buy', label: 'Major purchase ($30K)', effects: { cash: -30000, fear: 5, streetCred: 3 }, result: 'Military rifles, body armor, encrypted comms. Your crew is now a small army.' },
          { id: 'contacts', label: 'Focus on networking', effects: { cash: -5000, trust: 3 }, result: 'You make contacts with five international dealers. Future access guaranteed.' },
          { id: 'intel', label: 'Gather intelligence', effects: { streetCred: 2 }, result: 'You catalog who buys what. Knowing your rivals\' arsenals is worth more than weapons.' }
        ]
      },
      { title: 'The Police Tail', description: 'Leaving the expo, you notice a tail. Someone followed you from the Everglades.',
        outcomes: [
          { id: 'lose', label: 'Lose them', effects: { stress: 3, heat: -3 }, result: 'A three-hour detour through back roads. They lose you at a swamp crossing.' },
          { id: 'confront', label: 'Confront the tail', effects: { fear: 3, heat: 5 }, result: 'You pull over and approach. It\'s a rival scout, not police. You convince them to forget today.' },
          { id: 'false_trail', label: 'Lead them to a false destination', effects: { streetCred: 2 }, result: 'You drive to a legitimate restaurant and eat dinner. The tail reports nothing useful.' }
        ]
      }
    ]
  },

  // === 39. THE MECHANIC'S DAUGHTER ===
  {
    id: 'mechanics_daughter', name: 'The Mechanic\'s Daughter', emoji: '👧', category: 'rescue',
    condition: { minDay: 30, minCrew: 3 },
    chapters: [
      { title: 'The Call', description: 'Gears Rodriguez calls in a panic. His daughter has been taken by a rival crew. Ransom: $100K.',
        outcomes: [
          { id: 'pay', label: 'Pay the ransom ($100K)', effects: { cash: -100000, trust: 5 }, result: 'You wire the money immediately. The girl is released unharmed. Gears is in your debt forever.' },
          { id: 'rescue', label: 'Plan a rescue', effects: { stress: 5 }, result: 'You assemble your best crew. The rescue operation begins.' },
          { id: 'negotiate', label: 'Negotiate lower ($50K)', effects: { cash: -50000, trust: 3, stress: 3 }, result: 'You talk them down. $50K and a promise of peace. She comes home.' }
        ]
      },
      { title: 'The Rescue', description: 'Your crew hits the location. Three guards, one girl, zero room for error.',
        daysLimit: 3,
        outcomes: [
          { id: 'stealth_rescue', label: 'Silent extraction', effects: { trust: 8, streetCred: 3 }, result: 'In through a window, out through the back. No shots fired. The girl is safe.' },
          { id: 'assault_rescue', label: 'Full assault', effects: { trust: 8, fear: 5, heat: 15, health: -15 }, result: 'Explosions and gunfire. The girl is rescued. Casualties on both sides. But she\'s alive.' },
          { id: 'distraction', label: 'Distraction and snatch', effects: { trust: 8, streetCred: 5, cash: -5000 }, result: 'A fire across town draws guards away. You grab the girl during the chaos. Elegant.' }
        ]
      },
      { title: 'Aftermath', description: 'The girl is safe. Gears is on his knees thanking you. The rival crew is furious.',
        outcomes: [
          { id: 'war', label: 'Declare war on kidnappers', effects: { fear: 8, heat: 10, streetCred: 5 }, result: 'You destroy their operation. Nobody kidnaps from your people. Nobody.' },
          { id: 'peace', label: 'Accept their apology + reparations', effects: { cash: 50000, trust: 3 }, result: 'They pay $50K in damages and publicly apologize. Humiliation is worse than war.' },
          { id: 'gears_loyalty', label: 'Ask nothing — Gears decides his own loyalty', effects: { trust: 10, streetCred: 3 }, result: 'Gears pledges everything. His shop, his skills, his life. Maximum permanent loyalty.' }
        ]
      }
    ]
  },

  // === 40. THE LAST HEIST ===
  {
    id: 'last_heist', name: 'The Last Heist', emoji: '🏦', category: 'endgame',
    condition: { minDay: 50, minAct: 3, minCrew: 5, minCash: 50000 },
    chapters: [
      { title: 'The Opportunity', description: 'The biggest score imaginable: a cartel money counting house. $10M in cash. During transition between guards.',
        outcomes: [
          { id: 'plan', label: 'Begin planning', effects: { cash: -20000, stress: 5 }, result: 'Months of preparation. Every detail mapped. This is either retirement money or a death sentence.' },
          { id: 'team', label: 'Assemble the perfect team ($50K)', effects: { cash: -50000, streetCred: 3 }, result: 'You hire the best: hacker, driver, demo expert, sharpshooter. Dream team assembled.' },
          { id: 'too_big', label: 'This is suicide', effects: {}, result: 'Wisdom or cowardice? Only history will judge.', endsChain: true }
        ]
      },
      { title: 'Inside Man', description: 'You need someone inside. A guard, a worker, anyone with access codes.',
        outcomes: [
          { id: 'bribe_guard', label: 'Bribe a guard ($30K)', effects: { cash: -30000, trust: -1 }, result: 'He gives you codes, schedules, camera locations. Worth every penny.' },
          { id: 'plant_mole', label: 'Plant your own person (10 days)', effects: { cash: -10000, stress: 3 }, result: 'Your agent gets hired as maintenance. Ten days of intelligence gathering.' },
          { id: 'tech', label: 'Hack security remotely ($20K)', effects: { cash: -20000, streetCred: 2 }, result: 'Your hacker cracks their system. Camera loops, door codes, alarm overrides.' }
        ]
      },
      { title: 'Execution Day', description: 'D-Day. Your crew is in position. Comms live. Heartbeats in your ears. Go or no go?',
        outcomes: [
          { id: 'perfect', label: 'Execute flawlessly', effects: { cash: 5000000, heat: 30, streetCred: 10, fear: 10 }, result: '$5 MILLION. The vault is emptied in under 10 minutes. The biggest heist in Miami history.' },
          { id: 'complications', label: 'Adapt to surprises', effects: { cash: 2000000, heat: 25, health: -20, streetCred: 7 }, result: 'Extra guards. Alarm triggers. A chase. But $2M still makes it in the van.' },
          { id: 'abort_late', label: 'Abort at the last second', effects: { cash: -50000, stress: 10 }, result: 'Something\'s off. You call it. The crew is furious about the sunk costs.' }
        ]
      },
      { title: 'The Escape', description: 'Sirens everywhere. Helicopters. Every cop in Miami is looking for you. The money is heavy.',
        outcomes: [
          { id: 'tunnels', label: 'Disappear through tunnels', effects: { heat: -15, streetCred: 5 }, result: 'Underground to the Everglades safehouse. By the time they search, you\'re invisible.' },
          { id: 'scatter', label: 'Split up, meet at rendezvous', effects: { heat: -10, trust: 3 }, result: 'Five vehicles, five directions. You reassemble in 48 hours. All accounted for.' },
          { id: 'brazen', label: 'Drive to the airport, fly out', effects: { cash: -100000, heat: -25, streetCred: 8 }, result: 'Private jet to the Bahamas. Wheels up before roadblocks. $100K for the flight. Worth it.' }
        ]
      },
      { title: 'Legacy', description: 'The heist changes everything. You have more money than God. What now?',
        outcomes: [
          { id: 'retire', label: 'Retire from the game', effects: { cash: 0, stress: -20, publicImage: 5 }, result: 'You walk away at the top. Legend status. The one who got out.' },
          { id: 'empire', label: 'Build a legitimate empire', effects: { cash: -2000000, streetCred: 10, publicImage: 10 }, result: 'You invest millions into legal businesses. The transition from criminal to mogul begins.' },
          { id: 'king', label: 'Become the king of Miami', effects: { cash: -1000000, fear: 10, streetCred: 10 }, result: 'You use the money to buy everyone and everything. Miami is yours. All of it.' }
        ]
      }
    ]
  }

];

// Export count for stats
const SIDE_MISSIONS_V2_COUNT = SIDE_MISSIONS_V2.length;
