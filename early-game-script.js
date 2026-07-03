// ============================================================
// EARLY GAME SCRIPT — the first week is authored, not empty
// ============================================================
// Day 1: a scripted flip opportunity sized to the character's wallet —
//        a buyer in a nearby district pays a promised premium for a drug
//        the player can actually afford today.
// Day 2: a personal message from someone in the character's past.
// Day 3: supplier nudge — points at the Suppliers tab and why trust matters.
// Day 4: a street encounter with a small windfall.
// Day 5: districts-are-alive nudge (ecology, invest vs bleed).
// Every beat fires exactly once per campaign and is skipped in NG+.

function ensureEarlyGameState(state) {
  if (!state.earlyGame) state.earlyGame = { fired: {}, promise: null };
  if (!state.earlyGame.fired) state.earlyGame.fired = {};
  return state.earlyGame;
}

// Character-specific day-2 texts. Fallback covers classic/expanded roster.
const EARLY_GAME_DAY2_MSGS = {
  dropout: { from: 'Professor Vance', text: 'Heard you dropped out. Waste of the best organic chem student I ever had... or maybe not. If you\'re doing what I think you\'re doing — purity is everything. Cook clean, charge double. Don\'t call this number again.' },
  corner_kid: { from: 'Mama', text: 'Mijo, you didn\'t come home last night. I left arroz con pollo in the fridge. Whatever you\'re doing out there — the Ramirez boy got picked up on 8th street yesterday. Eyes open. Te quiero.' },
  ex_con: { from: 'Parole Officer Grady', text: 'Missed our check-in. I\'ll write it up as a scheduling error — ONCE. I know guys like you don\'t get hired anywhere decent, but if I catch you near the old crew, you\'re back inside. Don\'t make me look stupid.' },
  hustler: { from: 'Uncle Ray', text: 'Kid! Word is you\'re working the corners now. Remember what I taught you: never pay sticker, never sell to a man who knows your name, and ALWAYS know your exit. Come by the pawn shop, I might have work.' },
  connected_kid: { from: 'Tío Salvador', text: 'Sobrino. The family knows you\'re freelancing in Miami. Papá is not pleased — but I convinced him to watch and wait. Impress us. And if anyone asks about the Cali shipment, you know nothing.' },
  cleanskin: { from: 'Denise (Arthur Andersen)', text: 'You just STOPPED showing up? Partners are furious. Whatever mid-life crisis this is, your CPA license is still active — and Miami is full of cash businesses that need "creative bookkeeping". Call me if you get back to real work.' },
  veteran: { from: 'Sgt. Reyes (Ret.)', text: 'Brother. Heard you\'re back stateside and running the streets. VA denied my claim again, so I get it — the war never pays out. You need muscle you can trust, I still move like 1968. Semper Fi.' },
  immigrant: { from: 'Cousin Yusnavy', text: 'Primo! You made it through — gracias a Dios. Everyone back home is asking when you send money. The Hialeah crowd can be trusted, the marielito crews less so. Start small. Freedom isn\'t free here, it\'s $5,000 in debt.' },
};

// ------------------------------------------------------------
// Day-1 opportunity (#5): pick a drug the wallet can buy ≥5 of,
// promise a premium in a nearby Miami district for 3 days, and
// tell the player via phone + day report.
// ------------------------------------------------------------
function fireDay1Opportunity(state) {
  const eg = ensureEarlyGameState(state);
  if (eg.fired.day1) return null;
  if (state.newGamePlus && state.newGamePlus.active) { eg.fired.day1 = true; return null; }
  if (!state.prices) return null;

  // Cheapest affordable drug — prefer a 5+ unit lot, settle for 2+ on broke starts
  const budget = Math.max(100, Math.round((state.cash || 0) * 0.7));
  let pick = null;
  for (const minQty of [5, 3, 2]) {
    for (const d of DRUGS) {
      const p = state.prices[d.id];
      if (!p || p <= 0) continue;
      if (d.minLevel && d.minLevel > 1) continue;
      if (Math.floor(budget / p) >= minQty && (!pick || p < state.prices[pick.id])) pick = d;
    }
    if (pick) break;
  }
  if (!pick) { eg.fired.day1 = true; return null; } // broke beyond help; loan shark tutorial covers it

  // A nearby Miami district (taxi-reachable on day 1)
  const here = state.currentLocation;
  const miami = LOCATIONS.filter(l => l.region === 'miami' && l.id !== here);
  const target = miami.length ? miami[Math.floor(Math.random() * miami.length)] : null;
  if (!target) { eg.fired.day1 = true; return null; }

  // 1.6× list price: after the 15% street spread the flip still nets ~+36%
  const promisedPrice = Math.round(state.prices[pick.id] * 1.6);
  eg.promise = { locId: target.id, drugId: pick.id, price: promisedPrice, expiresDay: (state.day || 1) + 3 };
  eg.fired.day1 = true;

  // Seed price intel so the opportunity is visible in the market + travel screens
  if (!state.knownPrices) state.knownPrices = {};
  if (!state.knownPrices[target.id]) state.knownPrices[target.id] = { _day: state.day || 1 };
  state.knownPrices[target.id][pick.id] = promisedPrice;
  state.knownPrices[target.id]._day = state.day || 1;

  // Phone message with the actual play spelled out
  if (!state.phone && typeof initPhoneState === 'function') state.phone = initPhoneState();
  if (typeof addMessageToInbox === 'function' && state.phone) {
    addMessageToInbox(state.phone, {
      id: null, category: 'buyer_request', from: 'Word on the Street', read: false, responses: null,
      day: state.day || 1,
      text: `First day working? Listen close. A buyer crew in ${target.name} is paying around $${promisedPrice.toLocaleString()} for ${pick.name} — it's going for $${state.prices[pick.id].toLocaleString()} right where you're standing. Grab what you can afford, taxi over, flip it. Offer's good ~3 days. Don't sleep on it.`,
    }, state.day || 1);
  }
  return { locName: target.name, drugName: pick.name, price: promisedPrice };
}

// Hook: called at the end of generatePrices — makes the day-1 promise real
// when the player actually travels there inside the window.
function applyEarlyGamePricePromise(state) {
  const eg = state.earlyGame;
  if (!eg || !eg.promise) return;
  const pr = eg.promise;
  if ((state.day || 1) > pr.expiresDay) { eg.promise = null; return; }
  if (state.currentLocation !== pr.locId) return;
  // Deliver the promised premium (±5% so it feels like a market, not a coupon)
  const wiggle = 1 + (Math.random() - 0.5) * 0.1;
  state.prices[pr.drugId] = Math.max(1, Math.round(pr.price * wiggle));
  if (state.knownPrices && state.knownPrices[state.currentLocation]) {
    state.knownPrices[state.currentLocation][pr.drugId] = state.prices[pr.drugId];
  }
  eg.promise = null; // promise kept — one premium sale, then the market is the market
}

// ------------------------------------------------------------
// Days 2–5 texture beats (#4) — returns day-report messages
// ------------------------------------------------------------
function processEarlyGameDaily(state) {
  const msgs = [];
  const eg = ensureEarlyGameState(state);
  if (state.newGamePlus && state.newGamePlus.active) return msgs;
  const day = state.day || 1;
  if (day > 7) return msgs;

  // Day 2: someone from the character's past reaches out
  if (day >= 2 && !eg.fired.day2) {
    eg.fired.day2 = true;
    const m = EARLY_GAME_DAY2_MSGS[state.characterId] ||
      { from: 'Old Friend', text: 'Heard you\'re working the Miami streets now. Watch the news feed — prices move on every bust and shootout in this town. Buy the panic, sell the shortage.' };
    if (typeof addMessageToInbox === 'function' && state.phone) {
      addMessageToInbox(state.phone, { id: null, category: 'npc_story', from: m.from, text: m.text, day, read: false, responses: null }, day);
      msgs.push(`📱 Your phone buzzes — a message from ${m.from}. (Check the Phone tab)`);
    }
  }

  // Day 3: supplier nudge
  if (day >= 3 && !eg.fired.day3) {
    eg.fired.day3 = true;
    if (typeof addMessageToInbox === 'function' && state.phone) {
      addMessageToInbox(state.phone, {
        id: null, category: 'supplier_alert', from: 'Paco (Wholesale)', day, read: false, responses: null,
        text: 'You the new independent everyone\'s talking about? Corner prices are for tourists. Real weight moves through suppliers — find us in the SUPPLIERS tab off the market screen. Show up, buy consistent, and trust gets you credit lines, spot deals, product the street never sees.',
      }, day);
      msgs.push('📱 A wholesaler named Paco wants your business — suppliers beat street prices. (Phone tab)');
    }
  }

  // Day 4: street encounter windfall
  if (day >= 4 && !eg.fired.day4) {
    eg.fired.day4 = true;
    const freeSpace = typeof getFreeSpace === 'function' ? getFreeSpace(state) : 0;
    if (freeSpace >= 3 && state.prices && state.prices.weed) {
      state.inventory = state.inventory || {};
      state.inventory.weed = (state.inventory.weed || 0) + 3;
      msgs.push('🚲 A kid on a BMX skids to a stop: "Yo — Marco got popped last night, I\'m not holding this." He shoves a bag at you and pedals off. (+3 Weed, free)');
    } else {
      state.cash = (state.cash || 0) + 200;
      state.dirtyMoney = (state.dirtyMoney || 0) + 200;
      msgs.push('🎲 You win $200 off a rigged dice game behind the bodega. The regulars glare — time to walk.');
    }
  }

  // Day 5: the city is alive nudge
  if (day >= 5 && !eg.fired.day5) {
    eg.fired.day5 = true;
    msgs.push('🏙️ You\'re starting to read the streets: districts remember what happens in them. Busts raise police pressure, shootouts scare buyers, money invested cleans a block up. Check DISTRICTS on the travel map.');
  }

  return msgs;
}
